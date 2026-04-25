"""
Blink Daily Matching Algorithm
===============================

Nightly cron job that:
  1. Filters eligible user pairs (verified, unpaused, unblocked, compatible prefs)
  2. Computes a two-tower compatibility score (0-100)
  3. Applies a conflict-style multiplicative modifier
  4. Greedily assigns one match per user per day
  5. Writes results to the ``matches`` table

Also exposes stage-decision logic: after each conversation phase
(text → call → video) both users choose *move forward*, *not sure*,
or *don't move forward*.  If neither user says "don't move forward"
the match advances to the next unlock level; otherwise it ends.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

from app.core.supabase import get_supabase

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Scoring weights (Step 2)
# ---------------------------------------------------------------------------
INTEREST_MAX = 30
INTEREST_TOTAL = 3

RELATIONSHIP_MEANING_MAX = 20
RELATIONSHIP_MEANING_TOTAL = 6

TIME_WITH_PARTNER_MAX = 15
TIME_WITH_PARTNER_TOTAL = 4

SPENDING_MATCH_SCORE = 10

KIDS_EXACT_MATCH_SCORE = 10
KIDS_OPEN_MATCH_SCORE = 5

# ---------------------------------------------------------------------------
# Conflict-style modifier matrix (Step 3)
# Keys are the Postgres enum values stored in ``profiles.conflict_style``.
# ---------------------------------------------------------------------------
CONFLICT_MODIFIER: dict[tuple[str, str], float] = {
    ("Talk it out right away", "Talk it out right away"): 1.10,
    ("Talk it out right away", "Take space, then come back to it"): 1.00,
    ("Talk it out right away", "Avoid it / keep the peace"): 0.75,
    ("Take space, then come back to it", "Talk it out right away"): 1.00,
    ("Take space, then come back to it", "Take space, then come back to it"): 1.05,
    ("Take space, then come back to it", "Avoid it / keep the peace"): 0.80,
    ("Avoid it / keep the peace", "Talk it out right away"): 0.75,
    ("Avoid it / keep the peace", "Take space, then come back to it"): 0.80,
    ("Avoid it / keep the peace", "Avoid it / keep the peace"): 0.90,
}

# ---------------------------------------------------------------------------
# Compatibility helpers
# ---------------------------------------------------------------------------
KIDS_INCOMPATIBLE: set[frozenset[str]] = {
    frozenset({"Yes", "No"}),
    frozenset({"Already have kids", "No"}),
}

RELATIONSHIP_INCOMPATIBLE: set[frozenset[str]] = {
    frozenset({"Monogamy", "Polyamory"}),
}

STAGE_DECISION_BLOCK = "dont_move_forward"


# ===================================================================== #
#  Step 1 — Eligibility Filter                                          #
# ===================================================================== #

def _fetch_eligible_profiles(sb: Any) -> list[dict[str, Any]]:
    """Return profiles where ``worldid_verified`` and not paused."""
    result = (
        sb.table("profiles")
        .select("*")
        .eq("worldid_verified", True)
        .eq("pause_matches", False)
        .execute()
    )
    return result.data or []


def _fetch_blocks(sb: Any) -> set[frozenset[str]]:
    """Return block pairs as a set of frozensets (bidirectional)."""
    result = sb.table("blocks").select("blocker_id, blocked_id").execute()
    return {
        frozenset({row["blocker_id"], row["blocked_id"]})
        for row in (result.data or [])
    }


def _fetch_todays_matched_users(sb: Any, today: str) -> set[str]:
    """Return user IDs that already have a match row for *today*."""
    result = (
        sb.table("matches")
        .select("user_a, user_b")
        .eq("match_date", today)
        .execute()
    )
    matched: set[str] = set()
    for row in result.data or []:
        matched.add(row["user_a"])
        matched.add(row["user_b"])
    return matched


def _fetch_historical_pairs(sb: Any) -> set[frozenset[str]]:
    """Return every pair that has *ever* been matched (any date)."""
    result = sb.table("matches").select("user_a, user_b").execute()
    return {
        frozenset({row["user_a"], row["user_b"]})
        for row in (result.data or [])
    }


# --- pair-level eligibility checks ---

def _are_interested_in_compatible(a: dict[str, Any], b: dict[str, Any]) -> bool:
    a_set = set(a.get("interested_in") or [])
    b_set = set(b.get("interested_in") or [])
    return bool(a_set & b_set)


def _are_ages_compatible(a: dict[str, Any], b: dict[str, Any]) -> bool:
    a_age = a.get("age")
    b_age = b.get("age")
    if a_age is None or b_age is None:
        return False
    a_min, a_max = a.get("age_range_min", 18), a.get("age_range_max", 80)
    b_min, b_max = b.get("age_range_min", 18), b.get("age_range_max", 80)
    return (b_min <= a_age <= b_max) and (a_min <= b_age <= a_max)


def _are_kids_compatible(a: dict[str, Any], b: dict[str, Any]) -> bool:
    a_kids = a.get("wants_kids")
    b_kids = b.get("wants_kids")
    if a_kids is None or b_kids is None:
        return True
    return frozenset({a_kids, b_kids}) not in KIDS_INCOMPATIBLE


def _are_relationship_types_compatible(a: dict[str, Any], b: dict[str, Any]) -> bool:
    a_rel = a.get("relationship_type")
    b_rel = b.get("relationship_type")
    if a_rel is None or b_rel is None:
        return True
    if "Open to Either" in (a_rel, b_rel):
        return True
    return frozenset({a_rel, b_rel}) not in RELATIONSHIP_INCOMPATIBLE


def _is_eligible_pair(
    a: dict[str, Any],
    b: dict[str, Any],
    blocks: set[frozenset[str]],
    already_matched: set[str],
    historical_pairs: set[frozenset[str]],
) -> bool:
    a_id, b_id = a["id"], b["id"]
    if a_id == b_id:
        return False
    if a_id in already_matched or b_id in already_matched:
        return False
    if frozenset({a_id, b_id}) in blocks:
        return False
    if frozenset({a_id, b_id}) in historical_pairs:
        return False
    if not _are_interested_in_compatible(a, b):
        return False
    if not _are_ages_compatible(a, b):
        return False
    if not _are_kids_compatible(a, b):
        return False
    if not _are_relationship_types_compatible(a, b):
        return False
    return True


# ===================================================================== #
#  Step 2 — Two-Tower Compatibility Score                               #
# ===================================================================== #

def _array_overlap_count(a_vals: list[str] | None, b_vals: list[str] | None) -> int:
    if not a_vals or not b_vals:
        return 0
    return len(set(a_vals) & set(b_vals))


def _compute_base_score(a: dict[str, Any], b: dict[str, Any]) -> tuple[float, list[str]]:
    """Return ``(base_score, shared_interests_list)``."""
    # Interest overlap (30 pts max)
    shared = sorted(set(a.get("interests") or []) & set(b.get("interests") or []))
    interest_score = (len(shared) / INTEREST_TOTAL) * INTEREST_MAX

    # Relationship meaning overlap (20 pts max)
    rm_overlap = _array_overlap_count(
        a.get("relationship_meaning"), b.get("relationship_meaning")
    )
    meaning_score = (rm_overlap / RELATIONSHIP_MEANING_TOTAL) * RELATIONSHIP_MEANING_MAX

    # Time with partner overlap (15 pts max)
    tp_overlap = _array_overlap_count(
        a.get("time_with_partner"), b.get("time_with_partner")
    )
    time_score = (tp_overlap / TIME_WITH_PARTNER_TOTAL) * TIME_WITH_PARTNER_MAX

    # Spending habits exact match (10 pts)
    spending_score = (
        SPENDING_MATCH_SCORE
        if a.get("spending_habits") and a["spending_habits"] == b.get("spending_habits")
        else 0
    )

    # Wants kids (10 pts exact, 5 pts if one side is open)
    a_kids = a.get("wants_kids")
    b_kids = b.get("wants_kids")
    if a_kids and b_kids:
        if a_kids == b_kids:
            kids_score = KIDS_EXACT_MATCH_SCORE
        elif "Maybe / Open to it" in (a_kids, b_kids):
            kids_score = KIDS_OPEN_MATCH_SCORE
        else:
            kids_score = 0
    else:
        kids_score = 0

    base = interest_score + meaning_score + time_score + spending_score + kids_score
    return base, shared


# ===================================================================== #
#  Step 3 — Conflict Style Modifier                                     #
# ===================================================================== #

def _apply_conflict_modifier(base_score: float, a: dict[str, Any], b: dict[str, Any]) -> int:
    a_style = a.get("conflict_style")
    b_style = b.get("conflict_style")
    modifier = (
        CONFLICT_MODIFIER.get((a_style, b_style), 1.0)
        if a_style and b_style
        else 1.0
    )
    return min(round(base_score * modifier), 100)


# ===================================================================== #
#  Step 4 — Greedy Match Assignment & DB Write                          #
# ===================================================================== #

def _order_pair(id_a: str, id_b: str) -> tuple[str, str]:
    """Ensure ``user_a < user_b`` to satisfy the DB CHECK constraint."""
    return (id_a, id_b) if id_a < id_b else (id_b, id_a)


async def run_daily_matching() -> list[dict[str, Any]]:
    """Execute the full daily matching algorithm.

    Returns the list of newly created match rows.
    """
    sb = get_supabase()
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    profiles = _fetch_eligible_profiles(sb)
    blocks = _fetch_blocks(sb)
    already_matched = _fetch_todays_matched_users(sb, today)
    historical_pairs = _fetch_historical_pairs(sb)

    logger.info(
        "Matching run for %s: %d eligible profiles, %d already matched today",
        today,
        len(profiles),
        len(already_matched),
    )

    if len(profiles) < 2:
        logger.info("Not enough eligible profiles for matching.")
        return []

    # Score every eligible pair
    scored_pairs: list[tuple[str, str, int, list[str]]] = []
    seen: set[frozenset[str]] = set()

    for i, a in enumerate(profiles):
        for b in profiles[i + 1 :]:
            if not _is_eligible_pair(a, b, blocks, already_matched, historical_pairs):
                continue
            pair_key = frozenset({a["id"], b["id"]})
            if pair_key in seen:
                continue
            seen.add(pair_key)

            base_score, shared_interests = _compute_base_score(a, b)
            final_score = _apply_conflict_modifier(base_score, a, b)
            user_a, user_b = _order_pair(a["id"], b["id"])
            scored_pairs.append((user_a, user_b, final_score, shared_interests))

    # Greedy: highest compatibility first, one match per user
    scored_pairs.sort(key=lambda x: x[2], reverse=True)

    matched_today: set[str] = set(already_matched)
    rows_to_insert: list[dict[str, Any]] = []

    for user_a, user_b, score, shared in scored_pairs:
        if user_a in matched_today or user_b in matched_today:
            continue
        matched_today.add(user_a)
        matched_today.add(user_b)
        rows_to_insert.append(
            {
                "user_a": user_a,
                "user_b": user_b,
                "compatibility_score": score,
                "shared_interests": shared,
                "match_date": today,
                "status": "pending",
                "unlock_level": 0,
            }
        )

    if not rows_to_insert:
        logger.info("No new matches to create for %s.", today)
        return []

    result = (
        sb.table("matches")
        .upsert(rows_to_insert, on_conflict="user_a,user_b,match_date")
        .execute()
    )

    created = result.data or []
    logger.info("Created %d matches for %s.", len(created), today)
    return created


# ===================================================================== #
#  Stage Decision Logic                                                 #
# ===================================================================== #
#  After each conversation phase (text → call → video) both users pick  #
#  one of: move_forward | not_sure | dont_move_forward.                 #
#                                                                       #
#  • If EITHER user says "dont_move_forward" → match is unmatched.      #
#  • Otherwise (both say move_forward or not_sure) → unlock_level++.    #
# ===================================================================== #

MAX_UNLOCK_LEVEL = 4  # 0→chat, 1→voice, 2→video, 3→revealed, 4→connected


async def submit_stage_decision(
    user_id: str, match_id: str, decision: str
) -> dict[str, Any]:
    """Record a user's stage decision and, when both are in,
    resolve the match progression.

    Returns a dict with ``status`` ("waiting", "advanced", or
    "unmatched") and current ``unlock_level``.
    """
    sb = get_supabase()

    # Verify the user belongs to this match
    match_row = (
        sb.table("matches")
        .select("id, user_a, user_b, unlock_level, status")
        .eq("id", match_id)
        .single()
        .execute()
    )
    if not match_row.data:
        raise ValueError("Match not found")

    match = match_row.data
    if user_id not in (match["user_a"], match["user_b"]):
        raise PermissionError("User is not part of this match")

    # Upsert this user's decision (one per user per match per level)
    sb.table("stage_decisions").upsert(
        {
            "match_id": match_id,
            "user_id": user_id,
            "unlock_level": match["unlock_level"],
            "decision": decision,
        },
        on_conflict="match_id,user_id,unlock_level",
    ).execute()

    # Check if both users have decided for the current level
    decisions = (
        sb.table("stage_decisions")
        .select("user_id, decision")
        .eq("match_id", match_id)
        .eq("unlock_level", match["unlock_level"])
        .execute()
    )
    rows = decisions.data or []
    if len(rows) < 2:
        return {
            "status": "waiting",
            "unlock_level": match["unlock_level"],
        }

    # Both decisions are in — resolve
    any_block = any(
        r["decision"] == STAGE_DECISION_BLOCK for r in rows
    )

    if any_block:
        sb.table("matches").update(
            {"status": "unmatched"}
        ).eq("id", match_id).execute()

        logger.info(
            "Match %s unmatched at unlock_level %d",
            match_id,
            match["unlock_level"],
        )
        return {
            "status": "unmatched",
            "unlock_level": match["unlock_level"],
        }

    # Both chose move_forward or not_sure → advance
    new_level = min(
        match["unlock_level"] + 1, MAX_UNLOCK_LEVEL
    )
    update_data: dict[str, Any] = {"unlock_level": new_level}
    if new_level == MAX_UNLOCK_LEVEL:
        update_data["status"] = "connected"

    sb.table("matches").update(update_data).eq(
        "id", match_id
    ).execute()

    logger.info(
        "Match %s advanced to unlock_level %d",
        match_id,
        new_level,
    )
    return {"status": "advanced", "unlock_level": new_level}
