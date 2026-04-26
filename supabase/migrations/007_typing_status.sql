-- Typing status table for real-time typing indicators
CREATE TABLE IF NOT EXISTS typing_status (
  match_id UUID NOT NULL,
  user_id UUID NOT NULL,
  last_typed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (match_id, user_id)
);

ALTER TABLE typing_status ENABLE ROW LEVEL SECURITY;
