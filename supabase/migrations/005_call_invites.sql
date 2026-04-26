-- Call invites: allows one user to ring the other for a voice/video call.
-- Status flow: pending → accepted | declined | expired

CREATE TYPE call_invite_status AS ENUM ('pending', 'accepted', 'declined', 'expired');
CREATE TYPE call_mode AS ENUM ('voice', 'video');

CREATE TABLE IF NOT EXISTS call_invites (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id     uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  caller_id    uuid NOT NULL REFERENCES profiles(id),
  callee_id    uuid NOT NULL REFERENCES profiles(id),
  mode         call_mode NOT NULL,
  status       call_invite_status NOT NULL DEFAULT 'pending',
  created_at   timestamptz DEFAULT now(),
  responded_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_call_invites_callee_pending
  ON call_invites (callee_id, status) WHERE status = 'pending';
