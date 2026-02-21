-- Etape 5: Add indexes on identity foreign keys for cross-season queries
CREATE INDEX IF NOT EXISTS idx_drivers_person_id ON drivers(person_id);
CREATE INDEX IF NOT EXISTS idx_teams_team_identity_id ON teams(team_identity_id);
