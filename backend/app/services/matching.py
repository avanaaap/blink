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

RELATIONSHIP_TYPE_MATCH_SCORE = 10
RELATIONSHIP_TYPE_OPEN_SCORE = 5

DEBT_MATCH_SCORE = 5
DEBT_PARTIAL_SCORE = 2

ISLAND_MATCH_SCORE = 5
ISLAND_PARTIAL_SCORE = 1

INSTRUMENT_MATCH_SCORE = 5
INSTRUMENT_PARTIAL_SCORE = 1

GENDER_PREFERENCE_SCORE = 15  # bonus when gender matches partner's interested_in

# Maps gender identity → interested_in value the partner should have
GENDER_TO_INTERESTED_IN: dict[str, str] = {
    "Man": "Men",
    "Woman": "Women",
    "Non-binary": "Non-binary",
}

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
    """Return user IDs that already have an active match row for *today*."""
    result = (
        sb.table("matches")
        .select("user_a, user_b")
        .eq("match_date", today)
        .neq("status", "unmatched")
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

def _gender_preference_score(a: dict[str, Any], b: dict[str, Any]) -> int:
    """Score how well each user's gender matches the other's interested_in.

    Returns 0-GENDER_PREFERENCE_SCORE.  Full points when both users'
    gender identity is in the other's interested_in list.  Half points
    when only one direction matches.  Zero when neither matches or
    data is missing.
    """
    a_gender = a.get("gender")
    b_gender = b.get("gender")
    a_interested = set(a.get("interested_in") or [])
    b_interested = set(b.get("interested_in") or [])

    # If either user has no gender or no interested_in, skip (allow match)
    if not a_gender or not b_gender or not a_interested or not b_interested:
        return GENDER_PREFERENCE_SCORE  # neutral — don't penalise missing data

    a_maps_to = GENDER_TO_INTERESTED_IN.get(a_gender)
    b_maps_to = GENDER_TO_INTERESTED_IN.get(b_gender)

    a_wants_b = b_maps_to in a_interested if b_maps_to else False
    b_wants_a = a_maps_to in b_interested if a_maps_to else False

    if a_wants_b and b_wants_a:
        return GENDER_PREFERENCE_SCORE
    if a_wants_b or b_wants_a:
        return GENDER_PREFERENCE_SCORE // 2
    return 0


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

    # Relationship type (10 pts exact, 5 pts if one side is open)
    a_rel = a.get("relationship_type")
    b_rel = b.get("relationship_type")
    if a_rel and b_rel:
        if a_rel == b_rel:
            rel_score = RELATIONSHIP_TYPE_MATCH_SCORE
        elif "Open to Either" in (a_rel, b_rel):
            rel_score = RELATIONSHIP_TYPE_OPEN_SCORE
        else:
            rel_score = 0
    else:
        rel_score = 0

    # Debt compatibility (5 pts exact, 2 pts partial)
    a_debt = a.get("has_debt")
    b_debt = b.get("has_debt")
    if a_debt and b_debt:
        if a_debt == b_debt:
            debt_score = DEBT_MATCH_SCORE
        elif "Prefer not to say" in (a_debt, b_debt):
            debt_score = DEBT_PARTIAL_SCORE
        else:
            debt_score = 0
    else:
        debt_score = 0

    # Island scenario (5 pts exact, 1 pt partial)
    a_island = a.get("island_scenario")
    b_island = b.get("island_scenario")
    if a_island and b_island:
        island_score = ISLAND_MATCH_SCORE if a_island == b_island else ISLAND_PARTIAL_SCORE
    else:
        island_score = 0

    # Musical instrument (5 pts exact, 1 pt partial)
    a_music = a.get("musical_instrument")
    b_music = b.get("musical_instrument")
    if a_music and b_music:
        music_score = INSTRUMENT_MATCH_SCORE if a_music == b_music else INSTRUMENT_PARTIAL_SCORE
    else:
        music_score = 0

    # Gender preference (15 pts max — soft score, not hard filter)
    gender_score = _gender_preference_score(a, b)

    base = (
        interest_score + meaning_score + time_score + spending_score
        + kids_score + rel_score + debt_score + island_score + music_score
        + gender_score
    )
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

    # If this user chose dont_move_forward, immediately unmatch
    if decision == STAGE_DECISION_BLOCK:
        sb.table("matches").update(
            {"status": "unmatched"}
        ).eq("id", match_id).execute()

        logger.info(
            "Match %s unmatched at unlock_level %d (user %s blocked)",
            match_id,
            match["unlock_level"],
            user_id,
        )
        return {
            "status": "unmatched",
            "unlock_level": match["unlock_level"],
        }

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


# ===================================================================== #
#  On-Demand Match Creation (per-user)                                  #
# ===================================================================== #

def create_match_for_user(sb: Any, user_id: str) -> dict[str, Any] | None:
    """Find and create the best match for a single user on-demand.

    Called when a user visits the dashboard and has no match for today.
    Returns the created match row or None if no eligible candidate exists.
    """
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # Check if user already has an active match today (skip unmatched)
    existing = (
        sb.table("matches")
        .select("id")
        .eq("match_date", today)
        .or_(f"user_a.eq.{user_id},user_b.eq.{user_id}")
        .neq("status", "unmatched")
        .limit(1)
        .execute()
    )
    if existing.data:
        return None

    # Get user's profile
    user_result = (
        sb.table("profiles").select("*").eq("id", user_id).single().execute()
    )
    if not user_result.data:
        return None
    user = user_result.data

    # Get all eligible candidates
    profiles = _fetch_eligible_profiles(sb)
    blocks = _fetch_blocks(sb)
    already_matched = _fetch_todays_matched_users(sb, today)
    historical_pairs = _fetch_historical_pairs(sb)

    best_candidate = None
    best_score = -1
    best_shared: list[str] = []

    for candidate in profiles:
        if not _is_eligible_pair(user, candidate, blocks, already_matched, historical_pairs):
            continue

        base_score, shared_interests = _compute_base_score(user, candidate)
        final_score = _apply_conflict_modifier(base_score, user, candidate)

        if final_score > best_score:
            best_candidate = candidate
            best_score = final_score
            best_shared = shared_interests

    if best_candidate is None:
        return None

    ua, ub = _order_pair(user_id, best_candidate["id"])
    match_row = (
        sb.table("matches")
        .insert({
            "user_a": ua,
            "user_b": ub,
            "compatibility_score": best_score,
            "shared_interests": best_shared,
            "match_date": today,
            "status": "active",
            "unlock_level": 1,
        })
        .execute()
    )

    if not match_row.data:
        return None

    logger.info(
        "On-demand match created for user %s: score=%d", user_id, best_score
    )
    return match_row.data[0]
