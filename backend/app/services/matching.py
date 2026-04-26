"""
Matching algorithm for Blink.

Hard filters:
  - Not already matched today
  - Not blocked by either user
  - Not the same user
  - Gender preference: user's interested_in includes partner's sexuality-implied gender
  - Age within each other's preferred range

Soft scoring (0-100 compatibility):
  - Shared interests overlap (up to 30 pts)
  - Relationship type match (10 pts)
  - Relationship meaning overlap (up to 15 pts)
  - Time with partner overlap (up to 10 pts)
  - Conflict style match (10 pts)
  - Lifestyle similarity: spending, debt, kids (up to 15 pts)
  - Personality: island scenario, instrument (up to 10 pts)
"""

from datetime import datetime, timezone


def _gender_from_sexuality(sexuality: str | None) -> str | None:
    """Infer broad gender category from sexuality for matching purposes.

    This is a rough heuristic — real matching should use explicit gender identity.
    For now, returns None (matches anyone) since we don't store gender explicitly.
    """
    return None


def passes_hard_filters(user: dict, candidate: dict, blocked_pairs: set[tuple[str, str]]) -> bool:
    """Check if two users can be matched."""
    uid = user["id"]
    cid = candidate["id"]

    if uid == cid:
        return False

    # Check blocked
    pair = (min(uid, cid), max(uid, cid))
    if pair in blocked_pairs:
        return False

    # Check age ranges (if both have age and age_range set)
    user_age = user.get("age") or 0
    cand_age = candidate.get("age") or 0

    if user_age > 0 and candidate.get("age_range_min") and candidate.get("age_range_max"):
        if not (candidate["age_range_min"] <= user_age <= candidate["age_range_max"]):
            return False

    if cand_age > 0 and user.get("age_range_min") and user.get("age_range_max"):
        if not (user["age_range_min"] <= cand_age <= user["age_range_max"]):
            return False

    # Check gender preference (interested_in)
    # We don't have explicit gender, so skip if not available
    # Future: add gender field to profiles

    return True


def compute_compatibility(user: dict, candidate: dict) -> int:
    """Compute compatibility score (0-100) between two users."""
    score = 0.0

    # Shared interests (up to 30 pts)
    u_interests = set(user.get("interests") or [])
    c_interests = set(candidate.get("interests") or [])
    if u_interests and c_interests:
        overlap = len(u_interests & c_interests)
        max_possible = min(len(u_interests), len(c_interests))
        if max_possible > 0:
            score += 30 * (overlap / max_possible)

    # Relationship type (10 pts)
    u_rel = user.get("relationship_type")
    c_rel = candidate.get("relationship_type")
    if u_rel and c_rel:
        if u_rel == c_rel:
            score += 10
        elif "Open to Either" in (u_rel, c_rel):
            score += 5

    # Relationship meaning overlap (up to 15 pts)
    u_meaning = set(user.get("relationship_meaning") or [])
    c_meaning = set(candidate.get("relationship_meaning") or [])
    if u_meaning and c_meaning:
        overlap = len(u_meaning & c_meaning)
        max_possible = min(len(u_meaning), len(c_meaning))
        if max_possible > 0:
            score += 15 * (overlap / max_possible)

    # Time with partner overlap (up to 10 pts)
    u_time = set(user.get("time_with_partner") or [])
    c_time = set(candidate.get("time_with_partner") or [])
    if u_time and c_time:
        overlap = len(u_time & c_time)
        max_possible = min(len(u_time), len(c_time))
        if max_possible > 0:
            score += 10 * (overlap / max_possible)

    # Conflict style (10 pts)
    u_conflict = user.get("conflict_style")
    c_conflict = candidate.get("conflict_style")
    if u_conflict and c_conflict:
        if u_conflict == c_conflict:
            score += 10
        else:
            score += 3  # partial credit for having answered

    # Spending habits (5 pts)
    u_spend = user.get("spending_habits")
    c_spend = candidate.get("spending_habits")
    if u_spend and c_spend:
        if u_spend == c_spend:
            score += 5
        elif {u_spend, c_spend} & {"Balanced"}:
            score += 2

    # Kids preference (5 pts)
    u_kids = user.get("wants_kids")
    c_kids = candidate.get("wants_kids")
    if u_kids and c_kids:
        if u_kids == c_kids:
            score += 5
        elif "Maybe / Open to it" in (u_kids, c_kids):
            score += 2

    # Debt compatibility (5 pts)
    u_debt = user.get("has_debt")
    c_debt = candidate.get("has_debt")
    if u_debt and c_debt:
        if u_debt == c_debt:
            score += 5
        elif "Prefer not to say" in (u_debt, c_debt):
            score += 2

    # Island scenario (5 pts)
    u_island = user.get("island_scenario")
    c_island = candidate.get("island_scenario")
    if u_island and c_island:
        if u_island == c_island:
            score += 5
        else:
            score += 1

    # Musical instrument (5 pts)
    u_music = user.get("musical_instrument")
    c_music = candidate.get("musical_instrument")
    if u_music and c_music:
        if u_music == c_music:
            score += 5
        else:
            score += 1

    return min(100, round(score))


def find_best_match(user: dict, candidates: list[dict], blocked_pairs: set[tuple[str, str]]) -> tuple[dict, int, list[str]] | None:
    """Find the best match for a user from a list of candidates.

    Returns (best_candidate, compatibility_score, shared_interests) or None.
    """
    best = None
    best_score = -1
    best_shared: list[str] = []

    for candidate in candidates:
        if not passes_hard_filters(user, candidate, blocked_pairs):
            continue

        score = compute_compatibility(user, candidate)

        if score > best_score:
            best = candidate
            best_score = score
            u_interests = set(user.get("interests") or [])
            c_interests = set(candidate.get("interests") or [])
            best_shared = list(u_interests & c_interests)

    if best is None:
        return None

    return best, best_score, best_shared


def create_match_for_user(sb, user_id: str) -> dict | None:
    """Run the matching algorithm for a user and create a match row.

    Returns the match row dict or None if no match found.
    """
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # Check if user already has a match today
    existing = (
        sb.table("matches")
        .select("id")
        .eq("match_date", today)
        .or_(f"user_a.eq.{user_id},user_b.eq.{user_id}")
        .eq("status", "active")
        .limit(1)
        .execute()
    )
    if existing.data:
        return None  # already matched today

    # Get current user's profile
    user_result = sb.table("profiles").select("*").eq("id", user_id).single().execute()
    if not user_result.data:
        return None
    user = user_result.data

    # Get all other verified users who don't have a match today
    all_profiles = sb.table("profiles").select("*").neq("id", user_id).eq("worldid_verified", True).execute()
    candidates = all_profiles.data or []

    # Filter out users already matched today
    today_matches = (
        sb.table("matches")
        .select("user_a, user_b")
        .eq("match_date", today)
        .eq("status", "active")
        .execute()
    )
    already_matched = set()
    for m in today_matches.data or []:
        already_matched.add(m["user_a"])
        already_matched.add(m["user_b"])

    candidates = [c for c in candidates if c["id"] not in already_matched]

    # Get blocked pairs
    blocks_result = sb.table("blocks").select("blocker_id, blocked_id").execute()
    blocked_pairs: set[tuple[str, str]] = set()
    for b in blocks_result.data or []:
        pair = (min(b["blocker_id"], b["blocked_id"]), max(b["blocker_id"], b["blocked_id"]))
        blocked_pairs.add(pair)

    result = find_best_match(user, candidates, blocked_pairs)
    if result is None:
        return None

    best_candidate, score, shared = result

    # Create match (user_a < user_b per schema constraint)
    ua, ub = (min(user_id, best_candidate["id"]), max(user_id, best_candidate["id"]))

    match_row = (
        sb.table("matches")
        .insert({
            "user_a": ua,
            "user_b": ub,
            "compatibility_score": score,
            "shared_interests": shared,
            "match_date": today,
            "status": "active",
            "unlock_level": 0,
        })
        .execute()
    )

    if not match_row.data:
        return None

    return match_row.data[0]
