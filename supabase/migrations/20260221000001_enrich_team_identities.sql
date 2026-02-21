-- Etape 1: Enrich team_identities with successor tracking and dissolution year
ALTER TABLE team_identities
  ADD COLUMN IF NOT EXISTS successor_id UUID REFERENCES team_identities(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS dissolved_year INTEGER;
