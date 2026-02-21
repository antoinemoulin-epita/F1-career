-- Etape 2: Populate drivers.person_id by matching against person_identities

-- 1. Link drivers to existing person_identities by name + universe_id
UPDATE drivers d
SET person_id = pi.id
FROM person_identities pi
JOIN seasons s ON s.id = d.season_id
WHERE d.person_id IS NULL
  AND pi.universe_id = s.universe_id
  AND pi.first_name = d.first_name
  AND pi.last_name = d.last_name
  AND pi.role = 'driver';

-- 2. Create person_identities for drivers that still have no match
INSERT INTO person_identities (universe_id, first_name, last_name, role)
SELECT DISTINCT ON (s.universe_id, d.first_name, d.last_name)
  s.universe_id,
  d.first_name,
  d.last_name,
  'driver'
FROM drivers d
JOIN seasons s ON s.id = d.season_id
WHERE d.person_id IS NULL
ORDER BY s.universe_id, d.first_name, d.last_name, d.created_at ASC;

-- 3. Link newly created person_identities
UPDATE drivers d
SET person_id = pi.id
FROM person_identities pi
JOIN seasons s ON s.id = d.season_id
WHERE d.person_id IS NULL
  AND pi.universe_id = s.universe_id
  AND pi.first_name = d.first_name
  AND pi.last_name = d.last_name
  AND pi.role = 'driver';
