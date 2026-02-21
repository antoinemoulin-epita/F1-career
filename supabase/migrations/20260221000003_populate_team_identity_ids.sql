-- Etape 3: Populate teams.team_identity_id by matching against team_identities

-- 1. Link teams to existing team_identities by name + universe_id
UPDATE teams t
SET team_identity_id = ti.id
FROM team_identities ti
JOIN seasons s ON s.id = t.season_id
WHERE t.team_identity_id IS NULL
  AND ti.universe_id = s.universe_id
  AND ti.name = t.name;

-- 2. Create team_identities for teams that still have no match
INSERT INTO team_identities (universe_id, name)
SELECT DISTINCT ON (s.universe_id, t.name)
  s.universe_id,
  t.name
FROM teams t
JOIN seasons s ON s.id = t.season_id
WHERE t.team_identity_id IS NULL
ORDER BY s.universe_id, t.name, t.created_at ASC;

-- 3. Link newly created team_identities
UPDATE teams t
SET team_identity_id = ti.id
FROM team_identities ti
JOIN seasons s ON s.id = t.season_id
WHERE t.team_identity_id IS NULL
  AND ti.universe_id = s.universe_id
  AND ti.name = t.name;
