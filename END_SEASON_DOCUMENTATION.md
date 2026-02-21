# END SEASON — Documentation Complete

> Reference technique de la feature "Fin de saison" — F1 Career Manager

---

## 1. Architecture Globale

### Flux complet

```
┌─────────────────────────────────────────────────────────────────────┐
│                        WIZARD 8 ETAPES (page.tsx)                  │
│                                                                     │
│  1. Champions ──► 2. Surperformances ──► 3. Evolutions             │
│  4. Contrats  ──► 5. Rookies          ──► 6. Budgets               │
│  7. Objectifs ──► 8. Validation                                     │
│                          │                                          │
│                          ▼                                          │
│                  [Archiver la saison]                               │
│                          │                                          │
│              ┌───────────┴───────────┐                              │
│              ▼                       ▼                              │
│    useArchiveSeason()      [Exporter Markdown]                     │
│         │                                                           │
│         ▼                                                           │
│  supabase.rpc("fn_archive_season", { p_payload })                  │
│         │                                                           │
│         ▼  (Transaction PL/pgSQL atomique)                         │
│    ┌─── INSERT history_champions                                    │
│    ├─── UPDATE drivers (evolutions, world_titles)                  │
│    ├─── UPDATE teams (surperformance_bonus)                        │
│    ├─── UPDATE drivers/staff (contrats -1, years_in_team +1)       │
│    ├─── UPDATE sponsor_objectives (is_met, evaluated_value)        │
│    └─── UPDATE seasons SET status = 'completed'                    │
│                                                                     │
│              ┌─────────────────────┐                               │
│              ▼                     │                               │
│    [Creer saison suivante]         │                               │
│         │                          │                               │
│         ▼                          │                               │
│  useCreateNextSeason()             │                               │
│         │                          │                               │
│         ▼                          │                               │
│  supabase.rpc("fn_create_next_season", { p_payload })              │
│         │                          │                               │
│         ▼  (Transaction PL/pgSQL atomique)                         │
│    ┌─── INSERT seasons (year+1, status='preparation')              │
│    ├─── DUPLICATE engine_suppliers + build id_map                  │
│    ├─── DUPLICATE teams (avec identity tracking + sponsor handling)│
│    ├─── DUPLICATE cars (team_id remappe)                           │
│    ├─── DUPLICATE drivers (excl. retraites, career stats cumules)  │
│    ├─── DUPLICATE staff (excl. retraites)                          │
│    ├─── DUPLICATE sponsor_objectives (si sponsor_duration > 1)     │
│    └─── UPDATE universes.current_season_id                         │
└─────────────────────────────────────────────────────────────────────┘
```

### Sources de donnees

| Donnee | Hook | Requete |
|--------|------|---------|
| Saison | `useSeason` | `seasons` |
| Calendrier | `useCalendar` | `calendar` |
| Pilotes | `useDrivers` | `v_drivers_with_effective` |
| Equipes | `useTeams` | `teams` |
| Classement pilotes | `useDriverStandings` | `v_current_standings_drivers` |
| Classement constructeurs | `useConstructorStandings` | `v_current_standings_constructors` |
| Surperformances | `useSurperformance` | Combine predictions + standings + drivers |
| Predictions pilotes | `useDriverPredictions` | `predictions_drivers` + FK `v_drivers_with_effective` |
| Predictions constructeurs | `useConstructorPredictions` | `predictions_constructors` + FK `v_teams_with_budget` |
| Arcs narratifs | `useNarrativeArcs` | `narrative_arcs` |
| Objectifs sponsors | `useSeasonSponsorObjectives` | `sponsor_objectives` |
| Resultats courses | `useRaceResultsBySeason` | `race_results` + FK `races` |
| Staff | `useStaff` | `staff_members` + FK `person` |

---

## 2. Fichiers Impliques

```
src/
├── app/(dashboard)/season/[id]/end-season/
│   └── page.tsx                              — Wizard 8 etapes, UI complete, state management
├── hooks/
│   ├── use-end-season.ts                     — Mutations: useArchiveSeason + useCreateNextSeason (appels RPC)
│   ├── use-surperformance.ts                 — Hook: calcul des surperformances depuis predictions + standings
│   ├── use-predictions.ts                    — Queries: predictions pilotes et constructeurs
│   ├── use-standings.ts                      — Queries: classements pilotes et constructeurs
│   ├── use-drivers.ts                        — Query: pilotes via v_drivers_with_effective
│   ├── use-teams.ts                          — Query: equipes
│   ├── use-seasons.ts                        — Query: saison courante
│   ├── use-calendar.ts                       — Query: calendrier de la saison
│   ├── use-staff.ts                          — Query: staff members
│   ├── use-narrative-arcs.ts                 — Query: arcs narratifs de l'univers
│   ├── use-sponsor-objectives.ts             — Query + mutation: objectifs sponsors
│   └── use-race-results.ts                   — Query: resultats courses par saison
├── lib/
│   ├── calculations/
│   │   ├── surperformance.ts                 — Calculs purs: delta, effet, potential_change, budget_change
│   │   ├── surperformance.test.ts            — 24 tests (dont non-regression 4 pilotes age 25)
│   │   ├── rookie-reveal.ts                  — Calcul revelation rookie: high/low/draw
│   │   ├── rookie-reveal.test.ts             — 13 tests
│   │   ├── sponsor-evaluation.ts             — Evaluation des 8 types d'objectifs sponsors
│   │   └── sponsor-evaluation.test.ts        — 19 tests
│   ├── export/
│   │   └── end-season-template.ts            — Generation Markdown du recapitulatif
│   └── validators/
│       ├── driver.ts                         — Schema Zod pilote (inclut person_id)
│       └── team.ts                           — Schema Zod equipe (inclut team_identity_id)
├── types/
│   └── index.ts                              — Types TypeScript partages (SponsorObjective, etc.)
└── lib/supabase/
    └── types.ts                              — Types generes Supabase (inclut RPCs)

supabase/
├── config.toml                               — Config Supabase CLI
└── migrations/
    ├── 20260221000001_enrich_team_identities.sql    — Ajout successor_id + dissolved_year
    ├── 20260221000002_populate_driver_person_ids.sql — Peuplement drivers.person_id
    ├── 20260221000003_populate_team_identity_ids.sql — Peuplement teams.team_identity_id
    ├── 20260221000004_create_end_season_rpcs.sql     — RPCs fn_archive_season + fn_create_next_season
    └── 20260221000005_add_identity_indexes.sql       — Index sur person_id et team_identity_id
```

---

## 3. Tables et Vues Impactees

### Tables modifiees a l'archivage (`fn_archive_season`)

| Table | Champs modifies | Quand |
|-------|----------------|-------|
| `history_champions` | INSERT complet | Toujours |
| `drivers` | `potential_final`, `potential_revealed`, `is_rookie`, `note`, `world_titles` | Si evolution non-zero |
| `drivers` | `contract_years_remaining` (-1), `years_in_team` (+1) | Si `contract_decrements = true` |
| `teams` | `surperformance_bonus` | Si budget_change non-zero |
| `staff_members` | `contract_years_remaining` (-1), `years_in_team` (+1) | Si `contract_decrements = true` |
| `sponsor_objectives` | `is_met`, `evaluated_value` | Pour chaque objectif evalue |
| `seasons` | `status = 'completed'` | Toujours |

### Tables modifiees a la creation de saison (`fn_create_next_season`)

| Table | Operation | Details |
|-------|-----------|---------|
| `seasons` | INSERT | year+1, status='preparation' |
| `engine_suppliers` | INSERT (copie) | Toutes les motorisations dupliquees |
| `teams` | INSERT (copie) | Avec `team_identity_id` copie, sponsor expire si duration <= 0, `surperformance_bonus` remis a 0 |
| `cars` | INSERT (copie) | `team_id` remappe, `engine_change_penalty` remis a false |
| `drivers` | INSERT (copie) | Sauf retraites. `person_id` copie, `career_*` cumules, `is_rookie` = false |
| `staff_members` | INSERT (copie) | Sauf retraites. `person_id` conserve, `is_retiring` = false |
| `sponsor_objectives` | INSERT (copie) | Si `sponsor_duration > 1` (contrat encore actif) |
| `universes` | UPDATE | `current_season_id` pointe vers nouvelle saison |

### Tables d'identite cross-saison

| Table | Role | Quand peuplee |
|-------|------|---------------|
| `person_identities` | Identite persistante d'un pilote/staff a travers les saisons | Migration initiale + conserve par `fn_create_next_season` via `person_id` |
| `team_identities` | Identite persistante d'une equipe a travers les saisons | Migration initiale + conserve par `fn_create_next_season` via `team_identity_id` |

### Vues de carriere (lecture seule)

| Vue | Description |
|-----|-------------|
| `v_person_career` | Historique complet d'un person_id a travers les saisons |
| `v_team_identity_history` | Historique d'un team_identity_id a travers les saisons |
| `v_staff_career` | Historique d'un staff a travers les saisons |
| `v_drivers_with_effective` | Pilotes avec `age`, `full_name`, `effective_note`, `acclimatation` calcules |
| `v_current_standings_drivers` | Dernier classement pilote par saison |
| `v_current_standings_constructors` | Dernier classement constructeur par saison |

---

## 4. RPCs Supabase

### `fn_archive_season(p_payload JSONB) RETURNS JSONB`

**Fichier :** `supabase/migrations/20260221000004_create_end_season_rpcs.sql`

**Parametres d'entree :**

```jsonc
{
  "season_id": "uuid",
  "universe_id": "uuid",
  "year": 1985,
  "champion_driver_id": "uuid | null",
  "champion_driver_name": "string | null",
  "champion_driver_points": "int | null",
  "champion_driver_team": "string | null",
  "champion_team_id": "uuid | null",
  "champion_team_name": "string | null",
  "champion_team_points": "int | null",
  "season_summary": "string | null",
  "driver_evolutions": [
    {
      "driver_id": "uuid",
      "potential_change": 1,        // surperformance: +1, -1, ou 0
      "decline": -1,                // -1 si age >= 35, sinon 0
      "progression": 1,             // +1 si age <= 26 et note < potential_final, sinon 0
      "champion_bonus": 1,          // +1 si champion et < 3 titres, sinon 0
      "rookie_reveal": 8            // valeur revelee ou null si pas rookie
    }
  ],
  "team_budget_changes": [
    {
      "team_id": "uuid",
      "surperformance_delta": 1     // +1, -1, ou 0
    }
  ],
  "contract_decrements": true,
  "sponsor_evaluations": [
    {
      "objective_id": "uuid",
      "is_met": true,
      "evaluated_value": 3          // valeur numerique evaluee ou null
    }
  ]
}
```

**Etapes d'execution :**

1. **Garde** : Verifie `seasons.status != 'completed'` → RAISE EXCEPTION si deja archive
2. **INSERT** `history_champions` avec champion pilote + constructeur + resume
3. **Boucle** `driver_evolutions` : Pour chaque pilote :
   - SELECT note/potential_final/world_titles actuels
   - Si `rookie_reveal` non-null : SET potential_final = valeur, potential_revealed = true, is_rookie = false
   - Sinon : potential_delta = decline + champion_bonus + potential_change → UPDATE potential_final (GREATEST 1)
   - Si progression != 0 : UPDATE note (clamp entre 1 et potential_final)
   - Si note actuelle > nouveau potential : clamp note
   - Si champion_bonus > 0 : INCREMENT world_titles
4. **Boucle** `team_budget_changes` : UPDATE `surperformance_bonus` = GREATEST(0, current + delta)
5. **Batch UPDATE** `drivers` et `staff_members` : contract -1, years_in_team +1 (si contract_decrements = true)
6. **Boucle** `sponsor_evaluations` : UPDATE `sponsor_objectives` SET is_met, evaluated_value
7. **UPDATE** `seasons` SET status = 'completed'

**Retour :** `{"success": true, "season_id": "uuid"}`

**Rollback :** Automatique (PL/pgSQL). Toute erreur → rollback complet de la transaction.

---

### `fn_create_next_season(p_payload JSONB) RETURNS JSONB`

**Parametres d'entree :**

```jsonc
{
  "season_id": "uuid",      // saison source
  "universe_id": "uuid",
  "year": 1985               // annee de la saison source (nouvelle = year + 1)
}
```

**Etapes d'execution :**

1. **INSERT** nouvelle saison (year+1, status='preparation', copie gp_count/quali_laps/race_laps)
2. **Boucle** `engine_suppliers` : DUPLICATE + construction `engine_id_map` (old_id → new_id)
3. **Boucle** `teams` : DUPLICATE avec :
   - `team_identity_id` copie (tracking cross-saison)
   - `team_principal`, `technical_director` copies
   - `engine_supplier_id` remappe via `engine_id_map`
   - Sponsor : si `sponsor_duration IS NULL` → reste NULL ; sinon `duration - 1` ; si `<= 0` → sponsor expire (champs mis a NULL, `sponsor_investment = 0`)
   - `surperformance_bonus` remis a 0
   - Construction `team_id_map` (old_id → new_id)
4. **Boucle** `cars` : DUPLICATE avec `team_id` remappe, `engine_change_penalty = false`
5. **COUNT** courses completees (pour stats carriere)
6. **Boucle** `drivers` (WHERE NOT is_retiring) : DUPLICATE avec :
   - `person_id` copie (tracking cross-saison)
   - `team_id` remappe via `team_id_map` (NULL si mapping echoue)
   - `career_*` = ancien + stats de la saison (depuis `v_current_standings_drivers`)
   - `is_rookie = false`, `is_retiring = false`
7. **Boucle** `staff_members` (WHERE NOT is_retiring) : DUPLICATE avec :
   - `team_id` remappe (fallback old team_id si NOT NULL constraint)
   - `is_retiring = false`
8. **Boucle** `sponsor_objectives` : DUPLICATE si `sponsor_duration > 1` (contrat encore actif saison suivante)
9. **UPDATE** `universes.current_season_id` = nouvelle saison

**Retour :** `{"success": true, "new_season_id": "uuid"}`

**Rollback :** Automatique (PL/pgSQL).

---

## 5. Calculs Metier

### 5.1 Surperformance

**Fichiers :** `surperformance.ts` (calculs purs) + `use-surperformance.ts` (hook React)

**Formule :**

```
delta = predicted_position - final_position
```

| delta | Effet | Impact potentiel (si age ≤ 26) | Impact budget equipe |
|-------|-------|-------------------------------|---------------------|
| >= +2 | positive | +1 potentiel | +1 surperformance_bonus |
| <= -2 | negative | -1 potentiel | -1 surperformance_bonus |
| -1 a +1 | neutral | 0 | 0 |

**Eligibilite potentiel pilote :**
- Age **≤ 26 ans** : affecte par la surperformance
- Age **> 26 ans** : jamais affecte (potential_change = 0)
- Age **null** : jamais affecte (garde de securite)

**Source de l'age :** `useDrivers(seasonId)` → `v_drivers_with_effective.age` (requete directe, fiable). L'age de l'expansion FK des predictions N'EST PAS utilisee (corrige dans Phase 8).

**Impact budget equipe :** Pas de condition d'age. Toute equipe avec |delta| >= 2 est affectee. Le `surperformance_bonus` est GREATEST(0, current + delta) (ne descend jamais sous 0).

---

### 5.2 Revelation Rookie

**Fichier :** `rookie-reveal.ts`

**Conditions de declenchement :**
- Le pilote doit etre `is_rookie = true` ET `potential_revealed = false`

**Logique :**

| Delta surperformance | Cas | Valeur auto |
|---------------------|-----|-------------|
| delta >= +2 | `high` | `potential_max` |
| delta <= -2 | `low` | `potential_min` |
| -1 a +1 | `draw` | `null` (choix manuel) |

- **Haut potentiel** : Performance nette → potentiel revele au maximum de la fourchette
- **Bas potentiel** : Sous-performance nette → potentiel revele au minimum
- **Tirage au sort** : Performance neutre → l'utilisateur choisit manuellement dans la fourchette [min, max]

**En RPC :** Le potentiel revele est applique comme : `potential_final = valeur_choisie`, `potential_revealed = true`, `is_rookie = false`.

---

### 5.3 Declin Veteran

**Condition :** Age >= 35 ans (determine via `d.age` depuis `useDrivers` → `v_drivers_with_effective`)

**Effet :** `-1 potentiel` (decline = -1 dans le payload)

**UI :** L'utilisateur peut desactiver le declin pour chaque pilote individuellement via checkboxes.

**En RPC :** Applique comme partie du `potential_delta = decline + champion_bonus + potential_change`. Le `potential_final` resultant est GREATEST(1, ...).

---

### 5.4 Bonus Champion

**Condition :** Le pilote est champion du monde de la saison (P1 au classement pilotes)

**Cap :** Si `world_titles >= 3`, le bonus n'est PAS applique. Regle de design : empecher la dominance excessive d'un pilote.

**Effet :** `+1 potentiel` + `world_titles += 1`

**UI :** Toggle global pour activer/desactiver. Affiche un badge "Bonus max atteint (X titres)" si cape.

---

### 5.5 Progression Jeune

**Conditions :**
- Age **≤ 26 ans**
- `note < potential_final` (encore de la marge de progression)

**Effet :** `+1 note` (pas +1 potentiel, c'est bien la note qui augmente)

**En RPC :** `note = GREATEST(1, LEAST(note + progression, potential_final))` — la note ne peut pas depasser le potentiel.

**UI :** L'utilisateur peut desactiver la progression pour chaque pilote individuellement.

---

### 5.6 Evaluation Sponsors

**Fichier :** `sponsor-evaluation.ts`

**Types d'objectifs supportes :**

| Type | Entite cible | Condition de reussite | Valeur evaluee |
|------|-------------|----------------------|----------------|
| `constructor_position` | Equipe propre | position ≤ target | position finale |
| `driver_position` | Pilote specifique (target_entity_id) | position ≤ target | position finale |
| `wins` | Equipe propre (tous pilotes) | total_wins ≥ target | total victoires |
| `podiums` | Equipe propre (tous pilotes) | total_podiums ≥ target | total podiums |
| `points_minimum` | Equipe propre | points ≥ target | points |
| `beat_team` | Equipe rivale (target_entity_id) | notre_position < rivale_position | notre position |
| `beat_driver` | Pilote rival (target_entity_id) | meilleur_pilote_equipe < rival | meilleure position |
| `race_win_at_circuit` | Circuit (target_entity_id) | victoire sur ce circuit | 1 ou 0 |
| `custom` | Aucune | `is_met` du record (choix manuel) | null |

**Matching pilote → equipe :** Via `driverTeamMap` (Map<driver_id, team_id>) construit depuis les donnees pilotes. NE DEPEND PAS de `team_color` (corrige Bug #4).

**Persistance :** Les resultats (`is_met`, `evaluated_value`) sont envoyes a `fn_archive_season` dans `sponsor_evaluations[]` et persistes dans `sponsor_objectives`.

---

## 6. Wizard : Les 8 Etapes

### Etape 1 : Champions

| | Detail |
|---|--------|
| **Affiche** | Champion pilotes (nom, equipe, points, victoires) + Champion constructeurs (nom, points, victoires) + Stats saison (vainqueurs differents, podiums differents, pole sitters, pilotes au depart) |
| **Modifiable** | Rien (informatif) |
| **Calcul auto** | Determine depuis P1 des classements |

### Etape 2 : Surperformances

| | Detail |
|---|--------|
| **Affiche** | Tableau pilotes (predit/final/delta/effet) + Tableau constructeurs (predit/final/delta/effet budget) |
| **Modifiable** | Rien (informatif) |
| **Calcul auto** | Delta = predicted - final, effet determine par seuil ≥2/≤-2 |
| **Warning** | Banner si predictions manquantes (surperfData null ou vide) |

### Etape 3 : Evolutions

| | Detail |
|---|--------|
| **Affiche** | Bonus champion (avec cap a 3 titres) + Declins (age ≥ 35) + Progressions (age ≤ 26, note < potentiel) |
| **Modifiable** | Toggle global bonus champion + Checkbox par pilote pour declin + Checkbox par pilote pour progression |
| **Calcul auto** | Liste des pilotes eligibles |

### Etape 4 : Contrats

| | Detail |
|---|--------|
| **Affiche** | Toggle global contrats (-1 an, +1 annee equipe) + Liste derniere annee de contrat (pilotes + staff) + Liste agents libres (pilotes + staff) |
| **Modifiable** | Toggle global contrats |
| **Calcul auto** | Filtrage par contract_years_remaining |

### Etape 5 : Rookies

| | Detail |
|---|--------|
| **Affiche** | Pour chaque rookie non-revele : nom, equipe, fourchette, surperformance, cas (high/low/draw) + Boutons de selection du potentiel |
| **Modifiable** | Valeur du potentiel revele (seulement en cas "draw" ; auto-selectionne sinon) |
| **Calcul auto** | Cas determine par delta surperformance |

### Etape 6 : Budgets

| | Detail |
|---|--------|
| **Affiche** | Equipes avec changement budget non-zero (+1 ou -1 surperformance_bonus) |
| **Modifiable** | Checkbox par equipe pour activer/desactiver l'ajustement |
| **Calcul auto** | Determine par surperformance constructeurs |

### Etape 7 : Objectifs

| | Detail |
|---|--------|
| **Affiche** | Objectifs groupes par equipe. Badge type + cible + resultat + status (atteint/rate) |
| **Modifiable** | Pour les objectifs `custom` : boutons "Atteint" / "Rate" |
| **Calcul auto** | Evaluation automatique de tous les types non-custom via `evaluateObjective()` |

### Etape 8 : Validation

| | Detail |
|---|--------|
| **Affiche (avant archivage)** | Recapitulatif complet : champions, evolutions pilotes, budgets, contrats staff + Textarea resume saison + Bouton "Archiver la saison" |
| **Affiche (apres archivage)** | Banner succes + Export Markdown (copier/telecharger) avec sections selectionnables + Bouton "Creer saison suivante" + Navigation vers saison courante ou nouvelle |
| **Modifiable** | Resume saison (optionnel) + Sections de l'export Markdown |

---

## 7. Gardes et Validations

### Saison deja archivee (Bug #13)

| Couche | Implementation |
|--------|---------------|
| **UI** | `page.tsx:560` — Si `season?.status === "completed"` → affiche "Saison deja archivee" + bouton retour |
| **RPC** | `fn_archive_season` ligne 36 — Si `status = 'completed'` → `RAISE EXCEPTION` |

### Courses terminees

| Couche | Implementation |
|--------|---------------|
| **UI** | `page.tsx:597-599` — Verifie `totalRaces > 0 && completedRaces === totalRaces` → sinon affiche "Saison incomplete" avec compteur |

### Predictions manquantes (Bug #9)

| Couche | Implementation |
|--------|---------------|
| **UI** | `page.tsx:751-762` — Banner warning si `!surperfData || surperfData.drivers.length === 0` dans l'etape Surperformances |

### Double-clic (Bug #12)

| Couche | Implementation |
|--------|---------------|
| **UI archivage** | `page.tsx:1540` — `isDisabled={archiveSeason.isPending \|\| isArchived}` |
| **UI creation** | `page.tsx:1488` — `isDisabled={createNextSeason.isPending \|\| !!nextSeasonId}` |

### Reinitialisation toggles (Bug #8)

| Couche | Implementation |
|--------|---------------|
| **UI** | `page.tsx:235-283` — 4 `useRef<boolean>` flags (`declineInitialized`, `progressionInitialized`, `rookieInitialized`, `budgetInitialized`) empechent les useEffect de reinitialiser les toggles apres le premier chargement |

---

## 8. Creation Saison Suivante

### Ce qui est copie

| Entite | Champs copies | Champs modifies/remappes |
|--------|--------------|--------------------------|
| Season | `gp_count`, `quali_laps`, `race_laps` | `year = year + 1`, `status = 'preparation'` |
| Engine Suppliers | Tous les champs | Nouvel `id` |
| Teams | Tous les champs sauf exceptions | `engine_supplier_id` remappe, `team_identity_id` copie, `surperformance_bonus = 0`, `sponsor_objective_met = NULL` |
| Cars | `motor`, `aero`, `chassis` | `team_id` remappe, `engine_change_penalty = false` |
| Drivers | Tous les champs de base | `person_id` copie, `team_id` remappe, `career_*` cumules, `is_rookie = false`, `is_retiring = false` |
| Staff | Tous les champs de base | `team_id` remappe (fallback old si NOT NULL), `is_retiring = false` |
| Sponsor Objectives | `objective_type`, `target_value`, `target_entity_id`, `description` | `team_id` remappe, `is_met` et `evaluated_value` remis a NULL |

### Gestion des sponsors

```
Si sponsor_duration IS NULL → reste NULL (pas de -1)
Si sponsor_duration > 1    → sponsor_duration - 1 (contrat continue)
Si sponsor_duration <= 1   → sponsor expire :
    title_sponsor = NULL
    sponsor_investment = 0
    sponsor_duration = NULL
    sponsor_objective = NULL
    (les objectifs ne sont PAS dupliques)
```

### Liens d'identite cross-saison

- `drivers.person_id` : Copie tel quel de la saison precedente. Permet de suivre un pilote a travers les saisons via `v_person_career`.
- `teams.team_identity_id` : Copie tel quel. Permet de suivre une equipe via `v_team_identity_history`.

### Champs remis a zero

| Champ | Nouvelle valeur | Raison |
|-------|----------------|--------|
| `teams.surperformance_bonus` | 0 | Reset chaque saison |
| `teams.sponsor_objective_met` | NULL | Pas encore evalue |
| `cars.engine_change_penalty` | false | Pas de changement moteur saison nouvelle |
| `drivers.is_rookie` | false | N'est plus rookie |
| `drivers.is_retiring` | false | Reset |
| `staff.is_retiring` | false | Reset |

---

## 9. Corrections Appliquees (15 Bugs)

| # | Bug | Statut | Solution |
|---|-----|--------|----------|
| 1 | **Pas de transaction** — Archivage et creation faisaient des UPDATE/INSERT individuels sans atomicite | CORRIGE | Toute la logique deplacee dans 2 RPCs PL/pgSQL (`fn_archive_season`, `fn_create_next_season`) qui sont atomiques par nature |
| 2 | **N+1 queries** — Boucle cote client avec UPDATE par pilote | CORRIGE | Contrats et years_in_team : batch UPDATE dans la RPC (lignes 131-139). Evolutions pilotes : boucle cote serveur (1 seul round-trip reseau) |
| 3 | **Surperf rookies** — Soupcon que les rookies n'etaient pas affectes par la surperformance | NON-BUG | Design correct : les rookies sont bien affectes si age ≤ 26 |
| 4 | **Matching team_color** — Objectifs sponsors matchaient les pilotes par `team_color` au lieu de `team_id` | CORRIGE | Introduction de `driverTeamMap: Map<driver_id, team_id>` dans `EvaluationContext`. 3 cases corrigees : `wins`, `podiums`, `beat_driver` |
| 5 | **person_id/team_identity_id manquants** — Les FKs d'identite cross-saison n'etaient jamais peuplees | CORRIGE | 2 migrations de peuplement retroactif + RPCs copient les IDs + validators/hooks incluent les champs |
| 6 | **Staff fallback old team_id** — Staff gardait l'ancien team_id si le mapping echouait | CORRIGE | RPC utilise `COALESCE(v_new_team_id, v_old_staff.team_id)` — fallback necessaire car `team_id` est NOT NULL |
| 7 | **Champion bonus cap** — Pas de documentation sur la regle du cap a 3 titres | CORRIGE | Commentaire explicite ajoute : "design rule: a driver with 3+ titles no longer receives the +1 potential bonus to prevent runaway dominance" |
| 8 | **useEffect re-init** — Les toggles declin/progression/rookie/budget etaient reinitialises a chaque re-render | CORRIGE | Remplacement des gardes `.size === 0` par `useRef<boolean>` flags qui empechent la reinitialisation |
| 9 | **Pas de warning predictions** — Aucun avertissement si les predictions n'existaient pas | CORRIGE | Banner warning affiche dans l'etape Surperformances si `surperfData` est null ou vide |
| 10 | **Sponsor eval non persiste** — Les resultats d'evaluation n'etaient pas sauvegardes en base | CORRIGE | Construction du tableau `sponsorEvaluations` dans `handleArchive`, envoye dans le payload RPC, persiste par `fn_archive_season` |
| 11 | **sponsor_duration null → -1** — `NULL - 1 = -1` au lieu de rester NULL | CORRIGE | RPC verifie `IF v_old_team.sponsor_duration IS NULL THEN v_new_duration := NULL` |
| 12 | **Double-clic archive** — Rien n'empechait de cliquer deux fois sur Archiver ou Creer | CORRIGE | `isDisabled` lie a `isPending` et aux flags `isArchived`/`nextSeasonId` |
| 13 | **Pas de garde completed** — Rien n'empechait de re-archiver une saison deja completee | CORRIGE | Garde UI (affiche "Saison deja archivee") + Garde RPC (`RAISE EXCEPTION` si status = completed) |
| 14 | **totalNoteChange melange pot+note** — Le champ exportait la somme potentiel + note en une seule valeur | CORRIGE | Split en `potentialChange` (potentiel) et `noteChange` (note) dans `DriverEvolutionDisplay` et l'export Markdown |
| 15 | **age undefined surperf** — `p.driver` pouvait etre null dans le filtre de surperformance | CORRIGE | Filtre `&& p.driver != null` ajoute a `use-surperformance.ts`. **Puis Phase 8** : l'age est maintenant source depuis `useDrivers` (requete directe) au lieu de l'expansion FK des predictions |

---

## 10. Tests

### Fichiers de tests

| Fichier | Tests | Ce qu'il teste |
|---------|-------|---------------|
| `src/lib/calculations/surperformance.test.ts` | **24** | `calculateDelta`, `getSurperformanceEffect`, `getDriverPotentialChange` (jeune, age, 26 exact, null), `getTeamBudgetChange`, `calculateAllDriverSurperformances` (tri, edge cases), `calculateAllTeamSurperformances`, **non-regression 4 pilotes age 25** |
| `src/lib/calculations/rookie-reveal.test.ts` | **13** | Cas high (delta >= 2 → potential_max), cas low (delta <= -2 → potential_min), cas draw (delta entre -1 et +1 → null), labels, explications, edge cases (min=max, full range) |
| `src/lib/calculations/sponsor-evaluation.test.ts` | **19** | 8 types d'objectifs + custom. Verifie le matching par `driverTeamMap` (pas team_color). Tests met/not met pour chaque type. Edge cases (entity_id null, is_met null) |

### Execution

```bash
# Tous les tests
npx vitest run

# Tests specifiques end-season
npx vitest run src/lib/calculations/surperformance.test.ts
npx vitest run src/lib/calculations/rookie-reveal.test.ts
npx vitest run src/lib/calculations/sponsor-evaluation.test.ts

# Type-check
npx tsc --noEmit
```

### Couverture actuelle

- **Calculs purs** : Couverts (surperformance, rookie-reveal, sponsor-evaluation)
- **Hooks** : Non couverts directement (hooks React necessitent mocks Supabase)
- **RPCs** : Non couverts en test unitaire (testables en E2E via Supabase local)
- **Page UI** : Non couverte (composant React complexe)

### Test de non-regression (Phase 8 — Bug age)

```typescript
it("4 pilotes de 25 ans avec delta >= 2 obtiennent TOUS +1 potentiel", () => {
    const inputs = [
        { driver_id: "senna", name: "Ayrton Senna", team: "Lotus", age: 25, predicted_position: 6, final_position: 3 },
        { driver_id: "brundle", name: "Martin Brundle", team: "Tyrrell", age: 25, predicted_position: 12, final_position: 8 },
        { driver_id: "de_angelis", name: "Elio de Angelis", team: "Lotus", age: 25, predicted_position: 5, final_position: 2 },
        { driver_id: "cheever", name: "Eddie Cheever", team: "Alfa Romeo", age: 25, predicted_position: 14, final_position: 10 },
    ];
    const result = calculateAllDriverSurperformances(inputs);
    expect(result).toHaveLength(4);
    for (const driver of result) {
        expect(driver.potential_change).toBe(1);
    }
});
```

---

## Annexe : Migrations SQL

### Migration 1 : `20260221000001_enrich_team_identities.sql`

Ajoute 2 colonnes a `team_identities` :
- `successor_id UUID` — FK vers l'equipe successeur en cas de rachat/fusion
- `dissolved_year INTEGER` — Annee de dissolution

### Migration 2 : `20260221000002_populate_driver_person_ids.sql`

Peuple `drivers.person_id` en 3 passes :
1. UPDATE par matching `first_name + last_name + universe_id` contre `person_identities` existantes
2. INSERT nouvelles `person_identities` pour les drivers non-matches
3. UPDATE pour lier les nouvelles identites

### Migration 3 : `20260221000003_populate_team_identity_ids.sql`

Meme logique pour `teams.team_identity_id` :
1. UPDATE par matching `name + universe_id` contre `team_identities`
2. INSERT nouvelles `team_identities`
3. UPDATE pour lier

### Migration 4 : `20260221000004_create_end_season_rpcs.sql`

Cree les 2 RPCs detaillees en section 4.

### Migration 5 : `20260221000005_add_identity_indexes.sql`

```sql
CREATE INDEX IF NOT EXISTS idx_drivers_person_id ON drivers(person_id);
CREATE INDEX IF NOT EXISTS idx_teams_team_identity_id ON teams(team_identity_id);
```

Optimise les requetes cross-saison sur les vues de carriere.
