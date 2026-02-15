# F1 SEASONS MANAGER — PROMPTS CLAUDE CODE

## Guide d'utilisation

Ce document contient tous les prompts à utiliser avec Claude Code pour construire l'application F1 Seasons Manager étape par étape.

### Prérequis
- Projet Next.js déjà initialisé
- MCP Supabase connecté
- MCP Untitled UI React connecté (version PRO)
- Node.js 20.x

### Méthodologie
1. **Copier le prompt de la phase en cours**
2. **Le coller dans Claude Code**
3. **Laisser Claude Code planifier puis exécuter**
4. **Vérifier les checkpoints avant de passer à la phase suivante**

### Structure des prompts
Chaque prompt suit ce format :
- **CONTEXTE** : Ce qui existe déjà
- **OBJECTIF** : Ce qu'on veut accomplir
- **CONTRAINTES** : Règles à respecter
- **ÉTAPES** : Actions à planifier et exécuter
- **CHECKPOINT** : Vérifications avant de continuer

---

# PHASE 0 : CONFIGURATION INITIALE

## Prompt 0.1 — Vérification environnement et dépendances

```
## CONTEXTE
Je travaille sur F1 Seasons Manager, une application Next.js pour gérer des simulations de championnat F1.
Le projet Next.js est déjà initialisé.
Tu as accès à MCP Supabase et MCP Untitled UI React (version PRO).

## OBJECTIF
Vérifier l'environnement et installer les dépendances manquantes.

## CONTRAINTES
- Utiliser le mode plan : d'abord analyser, puis proposer un plan, puis exécuter étape par étape
- Ne rien casser de l'existant
- Toujours utiliser les composants Untitled UI quand disponibles

## ÉTAPES À PLANIFIER

1. **Analyser le projet existant**
   - Vérifier package.json
   - Vérifier la structure des dossiers
   - Identifier ce qui est déjà configuré

2. **Vérifier les dépendances requises**
   - @supabase/supabase-js
   - @supabase/ssr (pour Next.js App Router)
   - @tanstack/react-query
   - zustand
   - nuqs (pour URL state)
   - motion (Framer Motion)
   - date-fns (manipulation dates)
   - react-hook-form (gestion formulaires)
   - @hookform/resolvers (intégration Zod)
   - zod (validation schemas)

3. **Vérifier la configuration Supabase**
   - Variables d'environnement (.env.local)
   - Client Supabase configuré

4. **Vérifier Untitled UI**
   - Composants disponibles via MCP
   - Structure des imports

## CHECKPOINT
Avant de continuer, confirme :
- [ ] Toutes les dépendances sont installées
- [ ] Les variables d'environnement Supabase sont configurées
- [ ] Le projet compile sans erreur (npm run dev)
```

---

## Prompt 0.2 — Structure des dossiers et configuration

```
## CONTEXTE
F1 Seasons Manager - Les dépendances sont installées.
MCP Supabase et Untitled UI sont disponibles.

## OBJECTIF
Mettre en place la structure de dossiers et les fichiers de configuration de base.

## CONTRAINTES
- Fichiers en kebab-case (convention Untitled UI)
- Imports React Aria préfixés Aria* (convention Untitled UI)
- Utiliser les couleurs sémantiques Untitled UI (text-primary, bg-secondary, etc.)

## ÉTAPES À PLANIFIER

1. **Créer la structure de dossiers**
   ```
   src/
   ├── app/
   │   ├── (auth)/
   │   │   └── login/
   │   ├── (dashboard)/
   │   │   ├── layout.tsx
   │   │   ├── page.tsx
   │   │   ├── universe/
   │   │   ├── season/
   │   │   ├── race/
   │   │   ├── history/
   │   │   ├── stats/
   │   │   └── export/
   │   ├── layout.tsx
   │   └── globals.css
   ├── components/
   │   ├── ui/                    # Wrappers Untitled UI si besoin
   │   ├── forms/
   │   ├── tables/
   │   ├── charts/
   │   ├── race/
   │   └── export/
   ├── lib/
   │   ├── supabase/
   │   │   ├── client.ts
   │   │   ├── server.ts
   │   │   └── types.ts
   │   ├── calculations/
   │   └── utils/
   ├── stores/
   ├── hooks/
   └── types/
   ```

2. **Configurer le client Supabase**
   - Créer lib/supabase/client.ts (client-side)
   - Créer lib/supabase/server.ts (server-side avec cookies)
   - Utiliser MCP Supabase pour vérifier la connexion

3. **Créer les providers**
   - QueryClientProvider (TanStack Query)
   - ThemeProvider si nécessaire

4. **Configurer le thème F1**
   - Couleur brand : Rouge F1 (#E10600)
   - Adapter les variables CSS si possible via theme.css

## CHECKPOINT
- [ ] Structure de dossiers créée
- [ ] Client Supabase fonctionnel (tester une requête simple)
- [ ] Providers configurés dans layout.tsx
- [ ] L'app démarre sans erreur
```

---

## Prompt 0.3 — Initialisation base de données Supabase

```
## CONTEXTE
F1 Seasons Manager - Structure projet en place, Supabase connecté.

## OBJECTIF
Créer le schéma de base de données complet dans Supabase.

## CONTRAINTES
- Utiliser MCP Supabase pour exécuter les migrations
- Le schéma SQL complet est fourni dans le fichier f1_seasons_schema.sql
- Vérifier que chaque étape s'exécute correctement avant de continuer

## RÉFÉRENCE
Le schéma SQL complet se trouve dans : f1_seasons_schema.sql
Il contient :
- 21 tables (universes, seasons, teams, drivers, cars, etc.)
- 5 views (v_teams_with_budget, v_cars_with_stats, etc.)
- 4 functions (fn_calculate_progression_max, etc.)
- Triggers pour updated_at
- Row Level Security (RLS)
- Seed data (circuits, barème points)

## ÉTAPES À PLANIFIER

1. **Analyser le schéma SQL**
   - Lire le fichier f1_seasons_schema.sql
   - Identifier les dépendances entre tables

2. **Exécuter le schéma via MCP Supabase**
   - Créer les types ENUM d'abord
   - Créer les tables dans l'ordre des dépendances
   - Créer les views
   - Créer les functions
   - Créer les triggers
   - Activer RLS et créer les policies
   - Insérer les données seed (circuits)

3. **Vérifier l'installation**
   - Lister les tables créées
   - Vérifier qu'un circuit existe (SELECT * FROM circuits LIMIT 1)

4. **Générer les types TypeScript**
   - Utiliser MCP Supabase pour générer les types
   - Les sauvegarder dans lib/supabase/types.ts

## CHECKPOINT
- [ ] Toutes les tables sont créées (21 tables)
- [ ] Les views fonctionnent
- [ ] Les circuits sont insérés (36 circuits)
- [ ] Les types TypeScript sont générés
- [ ] RLS est activé
```

---

# PHASE 1 : FOUNDATION (Core CRUD)

## Prompt 1.1 — Types et hooks de base

```
## CONTEXTE
F1 Seasons Manager - Base de données Supabase créée avec le schéma complet.
Types TypeScript générés depuis Supabase.

## OBJECTIF
Créer les types métier et les hooks de base pour interagir avec Supabase.

## CONTRAINTES
- Utiliser TanStack Query pour le data fetching
- Créer des hooks réutilisables
- Typage strict TypeScript

## ÉTAPES À PLANIFIER

1. **Créer les types métier** (types/index.ts)
   - Types dérivés des types Supabase
   - Types pour les formulaires
   - Types pour les états UI

2. **Créer les hooks Supabase de base** (hooks/)
   - useUniverse(id) - Récupérer un univers
   - useUniverses() - Liste des univers
   - useCreateUniverse() - Mutation création
   - useUpdateUniverse() - Mutation update
   - useDeleteUniverse() - Mutation delete

3. **Créer les hooks pour les saisons**
   - useSeason(id)
   - useSeasons(universeId)
   - useCreateSeason()
   - useCurrentSeason(universeId)

4. **Créer un hook utilitaire**
   - useSupabaseQuery() - Wrapper générique si utile

## STRUCTURE ATTENDUE
```typescript
// Exemple de hook
export function useUniverse(id: string) {
  return useQuery({
    queryKey: ['universe', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('universes')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    }
  })
}
```

## CHECKPOINT
- [ ] Types métier créés et exportés
- [ ] Hooks univers fonctionnels
- [ ] Hooks saisons fonctionnels
- [ ] Pas d'erreur TypeScript
```

---

## Prompt 1.2 — Page liste des univers

```
## CONTEXTE
F1 Seasons Manager - Types et hooks de base créés.
Untitled UI disponible via MCP.

## OBJECTIF
Créer la page d'accueil qui liste les univers de l'utilisateur.

## CONTRAINTES
- Utiliser les composants Untitled UI (Button, Badge, Avatar, etc.)
- Style F1 : fond sombre, accents rouges
- Responsive (compact sur desktop)
- Couleurs sémantiques (text-primary, bg-secondary, etc.)

## ÉTAPES À PLANIFIER

1. **Créer le layout dashboard** (app/(dashboard)/layout.tsx)
   - Sidebar avec navigation
   - Header avec titre
   - Utiliser les composants Untitled UI appropriés

2. **Créer la page d'accueil** (app/(dashboard)/page.tsx)
   - Titre "Mes Univers"
   - Liste des univers en cards
   - Bouton "Nouvel Univers"
   - État vide si aucun univers

3. **Créer le composant UniverseCard**
   - Nom de l'univers
   - Description
   - Année de départ → Année courante
   - Badge avec nombre de saisons
   - Bouton "Ouvrir"

4. **Gérer les états**
   - Loading (skeleton)
   - Erreur
   - Vide

## COMPOSANTS UNTITLED UI À UTILISER
- Button (actions)
- Badge (compteurs)
- Card ou structure équivalente
- FeaturedIcon (icône décorative)
- Skeleton si disponible

## CHECKPOINT
- [ ] Layout dashboard avec navigation
- [ ] Page liste univers affiche les données
- [ ] Cards univers cliquables
- [ ] État vide géré
- [ ] Style cohérent F1 (sombre, rouge)
```

---

## Prompt 1.3 — Formulaire création univers

```
## CONTEXTE
F1 Seasons Manager - Page liste univers créée.

## OBJECTIF
Créer le formulaire de création d'un nouvel univers.

## CONTRAINTES
- Utiliser les composants Untitled UI (Input, Button, etc.)
- Validation des champs
- Feedback utilisateur (loading, erreur, succès)

## ÉTAPES À PLANIFIER

1. **Créer la page** (app/(dashboard)/universe/new/page.tsx)
   - Formulaire centré
   - Titre "Nouvel Univers"

2. **Champs du formulaire**
   - Nom (requis, Input)
   - Description (optionnel, Textarea si dispo ou Input multiline)
   - Année de départ (requis, Input number)

3. **Logique de soumission**
   - Utiliser useCreateUniverse()
   - Créer aussi le barème de points par défaut (fn_seed_default_points)
   - Rediriger vers la page de l'univers après création

4. **Validation**
   - Nom : minimum 3 caractères
   - Année : entre 1950 et 2030

## COMPOSANTS UNTITLED UI
- Input (champs texte)
- Button (submit, cancel)
- Utiliser les props isLoading, isDisabled, isInvalid

## CHECKPOINT
- [ ] Formulaire s'affiche correctement
- [ ] Validation fonctionne
- [ ] Création fonctionne (vérifier en BDD)
- [ ] Redirection après création
- [ ] Barème points créé automatiquement
```

---

## Prompt 1.4 — Page détail univers

```
## CONTEXTE
F1 Seasons Manager - Création univers fonctionnelle.

## OBJECTIF
Créer la page de détail d'un univers avec la liste de ses saisons.

## CONTRAINTES
- Afficher les informations de l'univers
- Lister les saisons (timeline ou liste)
- Permettre de créer une nouvelle saison

## ÉTAPES À PLANIFIER

1. **Créer la page** (app/(dashboard)/universe/[id]/page.tsx)
   - Header avec nom univers
   - Description
   - Stats globales (nb saisons, champions, etc.)

2. **Section saisons**
   - Liste des saisons par année
   - Badge status (preparation, active, completed)
   - Saison active mise en évidence
   - Bouton "Nouvelle saison"

3. **Créer les hooks nécessaires**
   - useUniverseWithSeasons(id) ou combiner useUniverse + useSeasons

4. **Actions disponibles**
   - Éditer l'univers
   - Supprimer l'univers (avec confirmation)
   - Voir le palmarès
   - Voir le pool rookies

## COMPOSANTS UNTITLED UI
- Badge (status saison)
- Button (actions)
- Structure card/list pour les saisons

## CHECKPOINT
- [ ] Page affiche les infos univers
- [ ] Liste des saisons visible
- [ ] Navigation vers création saison
- [ ] Actions fonctionnelles
```

---

## Prompt 1.5 — CRUD Équipes de base

```
## CONTEXTE
F1 Seasons Manager - Univers et saisons gérés.
React Hook Form + Zod installés.

## OBJECTIF
Créer les hooks et composants pour gérer les équipes d'une saison.

## CONTRAINTES
- Une équipe appartient à une saison
- Calculs automatiques (budget total)
- Interface compacte (beaucoup d'infos)
- Validation avec Zod
- Formulaire avec React Hook Form

## ÉTAPES À PLANIFIER

1. **Créer le schema Zod** (lib/validations/team.ts)
   - Tous les champs avec validations appropriées
   - Messages d'erreur en français
   - Valeurs par défaut

2. **Créer les hooks équipes** (hooks/use-teams.ts)
   - useTeams(seasonId) — typé TeamWithRelations[]
   - useTeam(id) — typé TeamRow
   - useCreateTeam() — mutation typée
   - useUpdateTeam() — mutation typée
   - useDeleteTeam() — mutation typée

3. **Créer la page liste équipes** (app/(dashboard)/season/[id]/teams/page.tsx)
   - Tableau des équipes
   - Colonnes : Nom, Motoriste, Budget, Ingénieurs, Pilotes
   - Actions : Éditer, Supprimer

4. **Créer le formulaire équipe** (components/forms/team-form.tsx)
   - Utiliser useForm avec zodResolver
   - Identité : nom, short_name, nationalité, couleurs
   - Staff : TP, TD, niveau ingénieurs (★/★★/★★★)
   - Motoriste : sélection + factory/client
   - Budget : owner (0-2), sponsor (0-2)
   - Sponsor : nom, durée, objectif
   - Afficher erreurs de validation inline

5. **Afficher le budget calculé**
   - budget_total = owner + sponsor + surperf
   - Utiliser watch() de RHF pour calcul temps réel

## EXEMPLE STRUCTURE FORMULAIRE
```typescript
const form = useForm<TeamFormValues>({
  resolver: zodResolver(teamSchema),
  defaultValues: {
    engineer_level: 2,
    owner_investment: 1,
    sponsor_investment: 1,
    is_factory_team: false,
  }
})

// Calcul temps réel
const owner = form.watch('owner_investment')
const sponsor = form.watch('sponsor_investment')
const budgetTotal = owner + sponsor
```

## COMPOSANTS UNTITLED UI
- Input (champs texte)
- Select (motoriste, niveau ingénieurs)
- Checkbox ou Toggle (factory team)
- Badge (niveau ingénieurs avec ★)
- Table si disponible

## CHECKPOINT
- [ ] Schema Zod créé avec validations
- [ ] Liste équipes s'affiche
- [ ] Création équipe fonctionne avec validation
- [ ] Budget calculé temps réel
- [ ] Erreurs affichées inline
```

---

## Prompt 1.6 — CRUD Pilotes de base

```
## CONTEXTE
F1 Seasons Manager - Gestion équipes en place.

## OBJECTIF
Créer les hooks et composants pour gérer les pilotes d'une saison.

## CONTRAINTES
- Un pilote appartient à une saison et une équipe
- Afficher potentiel en fourchette si non révélé
- Calculer note effective

## ÉTAPES À PLANIFIER

1. **Créer les hooks pilotes** (hooks/use-drivers.ts)
   - useDrivers(seasonId)
   - useDriversByTeam(teamId)
   - useDriver(id)
   - useCreateDriver()
   - useUpdateDriver()

2. **Créer la page liste pilotes** (app/(dashboard)/season/[id]/drivers/page.tsx)
   - Groupés par équipe ou tableau global
   - Colonnes : Nom, Équipe, Note, Potentiel, Acclimatation, Note effective
   - Indicateurs : rookie, retraite annoncée

3. **Créer le formulaire pilote** (components/forms/driver-form.tsx)
   - Identité : prénom, nom, nationalité, année naissance
   - Stats : note (0-10), potentiel_min, potentiel_max
   - Acclimatation : années dans l'équipe (auto-calculé)
   - Carrière : titres, victoires, poles, podiums
   - Contrat : années restantes, first driver
   - Status : rookie, retiring

4. **Calcul note effective**
   - acclimatation = years_in_team (1→-1, 2→0, 3+→+1)
   - effective = MIN(note + acclimatation, potentiel + 1, 10)
   - Afficher ce calcul clairement

## COMPOSANTS UNTITLED UI
- Input (tous les champs)
- Select (équipe, nationalité)
- Checkbox (rookie, retiring, first driver)
- Badge (pour afficher potentiel en fourchette)
- Avatar (si photo pilote)

## CHECKPOINT
- [ ] Liste pilotes par équipe
- [ ] Création pilote avec assignation équipe
- [ ] Potentiel affiché en fourchette si non révélé
- [ ] Note effective calculée et affichée
- [ ] Acclimatation calculée automatiquement
```

---

## Prompt 1.7 — CRUD Voitures

```
## CONTEXTE
F1 Seasons Manager - Équipes et pilotes gérés.

## OBJECTIF
Créer la gestion des voitures avec calculs automatiques des performances dérivées.

## CONTRAINTES
- Une voiture par équipe
- Moteur déterminé par le motoriste (usine vs client)
- Calculs : Vitesse, Grip, Accélération

## FORMULES À IMPLÉMENTER
- Moteur = Note motoriste (ou -1 si client)
- Vitesse = ROUND((Aero + Moteur) / 2)
- Grip = ROUND((Aero + Chassis) / 2)
- Accélération = Moteur
- Total = Moteur + Aero + Chassis

## ÉTAPES À PLANIFIER

1. **Créer les hooks voitures** (hooks/use-cars.ts)
   - useCars(seasonId)
   - useCar(teamId)
   - useCreateCar()
   - useUpdateCar()

2. **Créer la page voitures** (app/(dashboard)/season/[id]/cars/page.tsx)
   - Tableau comparatif de toutes les voitures
   - Colonnes : Équipe, Moteur, Aéro, Châssis, Total, Vitesse, Grip, Accél
   - Classement par Total
   - Indicateur changement motoriste

3. **Créer le formulaire voiture** (components/forms/car-form.tsx)
   - Moteur : auto-rempli depuis motoriste (modifiable pour override)
   - Aéro : slider ou input (0-10)
   - Châssis : slider ou input (0-10)
   - Checkbox : pénalité changement motoriste (-1 châssis)
   - Affichage temps réel des stats dérivées

4. **Fonction de calcul** (lib/calculations/car-stats.ts)
   - calculateDerivedStats(motor, aero, chassis)
   - Retourne { speed, grip, acceleration, total }

## COMPOSANTS UNTITLED UI
- Input ou Slider (si dispo) pour les composantes
- Table pour l'affichage comparatif
- Badge pour classement

## CHECKPOINT
- [ ] Liste voitures avec stats dérivées
- [ ] Moteur auto-calculé depuis motoriste
- [ ] Stats Vitesse/Grip/Accél correctes
- [ ] Classement par Total affiché
- [ ] Pénalité changement motoriste appliquée
```

---

# PHASE 2 : GESTION DES COURSES

## Prompt 2.1 — Gestion du calendrier

```
## CONTEXTE
F1 Seasons Manager - CRUD équipes/pilotes/voitures fonctionnel.

## OBJECTIF
Créer la gestion du calendrier d'une saison (sélection et ordre des circuits).

## CONTRAINTES
- Circuits pré-existants dans la table circuits
- Probabilité pluie calculée depuis climate + aléatoire
- Drag & drop pour l'ordre

## ÉTAPES À PLANIFIER

1. **Créer les hooks calendrier** (hooks/use-calendar.ts)
   - useCalendar(seasonId)
   - useAvailableCircuits() - circuits non utilisés
   - useAddRace()
   - useRemoveRace()
   - useReorderRaces()

2. **Créer la page calendrier** (app/(dashboard)/season/[id]/calendar/page.tsx)
   - Liste des GP avec ordre (GP1, GP2, etc.)
   - Pour chaque GP : circuit, pays, type, météo prévue
   - Possibilité d'ajouter/retirer des circuits
   - Drag & drop pour réordonner

3. **Composant sélection circuit** (components/race/circuit-selector.tsx)
   - Liste des circuits disponibles
   - Filtres : pays, type (high_speed, technical, etc.)
   - Affiche : nom, drapeau, type, probabilité pluie base

4. **Calcul probabilité pluie**
   - base_rain_probability du circuit
   - Ajouter variation aléatoire ±10%
   - Afficher le résultat

## COMPOSANTS UNTITLED UI
- Select ou ComboBox pour sélection circuit
- Drag & drop (implémenter avec react-aria ou lib dédiée)
- Badge (type circuit, météo)
- Button (ajouter, retirer)

## CHECKPOINT
- [ ] Calendrier affiche les GP dans l'ordre
- [ ] Ajout/suppression de circuits fonctionne
- [ ] Drag & drop pour réordonner
- [ ] Probabilité pluie calculée
- [ ] Maximum de GP respecté (selon gp_count de la saison)
```

---

## Prompt 2.2 — Saisie des qualifications (Drag & Drop)

```
## CONTEXTE
F1 Seasons Manager - Calendrier fonctionnel.

## OBJECTIF
Créer l'interface de saisie des qualifications avec drag & drop.

## CONTRAINTES
- Drag & drop fluide et intuitif
- Tous les pilotes doivent être placés
- Validation avant enregistrement
- Afficher équipe et couleur pour chaque pilote

## ÉTAPES À PLANIFIER

1. **Créer les hooks qualifications** (hooks/use-qualifying.ts)
   - useQualifyingResults(raceId)
   - useSaveQualifying()

2. **Créer la page qualifications** (app/(dashboard)/race/[id]/qualifying/page.tsx)
   - Header avec info circuit
   - Zone de drop pour positions 1-20
   - Pool de pilotes à placer
   - Bouton "Valider"

3. **Composant drag & drop** (components/race/qualifying-drag-drop.tsx)
   - 20 slots de positions (P1, P2, etc.)
   - Pilotes sous forme de chips draggables
   - Couleur équipe visible
   - Feedback visuel pendant le drag

4. **Validation**
   - Tous les pilotes placés
   - Pas de doublon
   - Confirmation avant enregistrement

5. **Mise à jour statut course**
   - Passer le statut à 'qualifying_done'
   - Mettre à jour les standings (poles)

## IMPLÉMENTATION DRAG & DROP
- Utiliser @dnd-kit ou react-aria drag & drop
- Ou implémenter avec HTML5 drag & drop natif
- L'important : UX fluide

## CHECKPOINT
- [ ] Interface drag & drop fonctionnelle
- [ ] Tous les pilotes affichés avec couleur équipe
- [ ] Validation des positions complètes
- [ ] Sauvegarde en BDD
- [ ] Statut course mis à jour
```

---

## Prompt 2.3 — Saisie des résultats de course

```
## CONTEXTE
F1 Seasons Manager - Qualifications fonctionnelles.

## OBJECTIF
Créer l'interface de saisie des résultats de course.

## CONTRAINTES
- Pré-remplir avec grille de départ
- Gérer les abandons avec raison
- Sélectionner le meilleur tour
- Calculer les points automatiquement

## ÉTAPES À PLANIFIER

1. **Créer les hooks résultats** (hooks/use-race-results.ts)
   - useRaceResults(raceId)
   - useSaveRaceResults()
   - useCalculatePoints()

2. **Créer la page résultats** (app/(dashboard)/race/[id]/results/page.tsx)
   - Header avec info circuit + conditions météo
   - Sélecteur météo effective (dry, wet, mixed)
   - Liste des pilotes avec position finale
   - Champ événements marquants

3. **Composant saisie résultats** (components/race/race-results-input.tsx)
   - Drag & drop similaire aux qualifs (ou liste avec input position)
   - Pour chaque pilote :
     - Position finale (ou abandon)
     - Si abandon : type (mécanique, crash, autre) + raison libre
   - Checkbox meilleur tour (1 seul pilote)

4. **Calcul automatique après validation**
   - Points selon barème
   - Mise à jour standings pilotes
   - Mise à jour standings constructeurs
   - Stats (victoires, podiums, etc.)

5. **Fonction calcul points** (lib/calculations/points.ts)
   - Récupérer barème de l'univers
   - Appliquer selon position

## COMPOSANTS UNTITLED UI
- Select (météo, type abandon)
- Input (raison abandon)
- Checkbox (meilleur tour)
- Textarea (événements marquants)
- Button (valider)

## CHECKPOINT
- [ ] Résultats pré-remplis avec grille
- [ ] Abandons gérés avec raison
- [ ] Meilleur tour sélectionnable
- [ ] Points calculés correctement
- [ ] Standings mis à jour après validation
```

---

## Prompt 2.4 — Dashboard saison et classements

```
## CONTEXTE
F1 Seasons Manager - Saisie qualifs et résultats fonctionnelle.

## OBJECTIF
Créer le dashboard de saison avec classements temps réel.

## CONTRAINTES
- Affichage compact mais complet
- Classements pilotes ET constructeurs
- Prochain GP mis en évidence
- Arcs narratifs actifs visibles

## ÉTAPES À PLANIFIER

1. **Créer les hooks classements** (hooks/use-standings.ts)
   - useDriverStandings(seasonId, afterRound?)
   - useConstructorStandings(seasonId, afterRound?)
   - useCurrentStandings(seasonId) - dernier round

2. **Créer le dashboard saison** (app/(dashboard)/season/[id]/page.tsx)
   - Header : Saison [Année] - GP X/Y
   - Section prochain GP (ou dernier si terminé)
   - Classement pilotes (top 10 + voir tout)
   - Classement constructeurs
   - Arcs narratifs actifs

3. **Composant classement** (components/tables/standings-table.tsx)
   - Position (avec Δ vs round précédent)
   - Pilote/Équipe avec couleur
   - Points
   - Stats (V, P, PP)
   - Écart avec le leader

4. **Composant prochain GP** (components/race/next-race-card.tsx)
   - Circuit avec drapeau
   - Météo prévue
   - Enjeux (calculés ou texte)
   - Bouton "Commencer le GP"

5. **Section arcs narratifs** (components/narrative/active-arcs.tsx)
   - Liste des arcs actifs (status != resolved)
   - Icône importance (⭐⭐⭐)
   - Lien vers détail

## COMPOSANTS UNTITLED UI
- Badge (position, importance arcs)
- Table ou liste pour classements
- Card pour prochain GP
- FeaturedIcon pour décoration

## CHECKPOINT
- [ ] Dashboard affiche infos saison
- [ ] Classements corrects après saisie résultats
- [ ] Prochain GP identifié
- [ ] Navigation vers saisie GP fluide
- [ ] Arcs actifs affichés
```

---

# PHASE 3 : EXPORT & PRÉDICTIONS

## Prompt 3.1 — Système de prédictions

```
## CONTEXTE
F1 Seasons Manager - Dashboard et classements fonctionnels.

## OBJECTIF
Créer le système de prédictions de début de saison.

## CONTRAINTES
- Généré automatiquement depuis les données
- Verrouillable (plus modifiable après GP1)
- Sert de base pour calcul surperformance

## FORMULES
- Score pilote = Note effective + Total voiture
- Score constructeur = Total voiture + Moyenne notes effectives pilotes
- Classement prédit = Tri par score décroissant

## ÉTAPES À PLANIFIER

1. **Créer les hooks prédictions** (hooks/use-predictions.ts)
   - usePredictions(seasonId)
   - useGeneratePredictions()
   - useLockPredictions()

2. **Créer la page prédictions** (app/(dashboard)/season/[id]/predictions/page.tsx)
   - Tableau prédictions pilotes
   - Tableau prédictions constructeurs
   - Bouton "Générer" si vide
   - Bouton "Verrouiller"
   - Indicateur verrouillé

3. **Fonction de calcul** (lib/calculations/predictions.ts)
   - calculateDriverScore(driver, car)
   - calculateTeamScore(team, drivers, car)
   - generatePredictions(seasonId)

4. **Affichage**
   - Position prédite
   - Score calculé
   - Détail du calcul (hover ou expand)

## COMPOSANTS UNTITLED UI
- Table pour les prédictions
- Button (générer, verrouiller)
- Badge ou indicateur "Verrouillé"
- Tooltip pour détail calcul

## CHECKPOINT
- [ ] Prédictions générées correctement
- [ ] Scores calculés selon formules
- [ ] Verrouillage fonctionne
- [ ] Impossible de modifier après verrouillage
- [ ] Affichage clair des prédictions
```

---

## Prompt 3.2 — Export Claude (Pré-course)

```
## CONTEXTE
F1 Seasons Manager - Prédictions fonctionnelles.

## OBJECTIF
Créer l'export de contexte pour Claude avant une course.

## CONTRAINTES
- Format Markdown
- Données brutes, pas de narration
- Personnalisable (quelles sections inclure)
- Copier dans presse-papier ou télécharger

## SECTIONS DISPONIBLES
- Infos circuit (type, météo, caractéristique)
- Classements actuels (pilotes + constructeurs)
- Écarts au championnat
- Enjeux calculés
- Arcs narratifs actifs
- Forme récente (3 derniers GP)
- Stats circuit (historique vainqueurs)

## ÉTAPES À PLANIFIER

1. **Créer le générateur de template** (lib/export/pre-race-template.ts)
   - Fonction qui prend les données et génère le Markdown
   - Sections conditionnelles selon options

2. **Créer la page export** (app/(dashboard)/race/[id]/export/page.tsx)
   - Preview du Markdown généré
   - Checkboxes pour chaque section
   - Bouton "Copier"
   - Bouton "Télécharger .md"

3. **Créer le hook export** (hooks/use-export.ts)
   - usePreRaceExport(raceId, options)
   - Collecte toutes les données nécessaires

4. **Sections du template**
```markdown
# CONTEXTE GP [Round] — [Circuit] [Pays] [Année]

## Infos circuit
- Type: [type]
- Caractéristique: [key_attribute]
- Météo: [X]% pluie

## Classements actuels
[tableaux]

## Écarts championnat
[calculs]

## Arcs actifs
[liste avec importance]

→ Génère le pré-weekend style Canal+ F1
```

## COMPOSANTS UNTITLED UI
- Checkbox (sections à inclure)
- Button (copier, télécharger)
- Code/Pre pour preview Markdown
- FeaturedIcon pour décoration

## CHECKPOINT
- [ ] Markdown généré correctement
- [ ] Sections personnalisables
- [ ] Copie dans presse-papier fonctionne
- [ ] Téléchargement .md fonctionne
- [ ] Données exactes et à jour
```

---

## Prompt 3.3 — Export Claude (Post-course)

```
## CONTEXTE
F1 Seasons Manager - Export pré-course fonctionnel.

## OBJECTIF
Créer l'export de contexte pour Claude après une course.

## CONTRAINTES
- Inclut les résultats complets
- Comparaison avec prédictions
- Nouveaux classements

## SECTIONS
- Conditions (météo effective)
- Qualifications (grille)
- Résultats course (avec +/- positions)
- Abandons avec raisons
- Meilleur tour
- Événements marquants
- Nouveaux classements
- Comparaison vs prédictions

## ÉTAPES À PLANIFIER

1. **Créer le générateur** (lib/export/post-race-template.ts)
   - Template avec toutes les sections
   - Calcul des gains/pertes de positions
   - Calcul des écarts avec prédictions

2. **Créer la page export post-course** (app/(dashboard)/race/[id]/export/post/page.tsx)
   - Accessible après course terminée
   - Preview + options
   - Boutons copier/télécharger

3. **Template Markdown**
```markdown
# RÉSULTATS GP [Circuit] — [Année]

## Conditions
- Météo: [dry/wet/mixed]

## Qualifications
| Pos | Pilote | Équipe |
...

## Course
| Pos | Pilote | Équipe | Grille | +/- | Points |
...

## Abandons
- [Pilote]: [Cause] — [Détail]

## Meilleur tour
- [Pilote] ([Équipe])

## Événements marquants
[texte saisi]

## Nouveaux classements
[tableaux]

## Comparaison prédictions
| Pilote | Prédit | Actuel | Écart |
...

→ Génère le post-course style Canal+ Formula One
```

## CHECKPOINT
- [ ] Export post-course complet
- [ ] Gains/pertes calculés
- [ ] Comparaison prédictions visible
- [ ] Événements marquants inclus
- [ ] Format prêt pour Claude
```

---

# PHASE 4 : FIN DE SAISON

## Prompt 4.1 — Calcul surperformance

```
## CONTEXTE
F1 Seasons Manager - Export fonctionnel, saison peut être terminée.

## OBJECTIF
Créer le calcul de surperformance en fin de saison.

## FORMULES (depuis RULES)
- Surperformance pilote = Position prédite - Position finale
- Si ≥ +2 places → effet positif
- Si ≤ -2 places → effet négatif
- Surperformance constructeur = même logique

## EFFETS
- Pilote ≤26 ans, +2 places → +1 potentiel
- Pilote ≤26 ans, -2 places → -1 potentiel
- Constructeur +2 places → +1 budget surperf
- Constructeur -2 places → -1 budget surperf

## ÉTAPES À PLANIFIER

1. **Créer les fonctions de calcul** (lib/calculations/surperformance.ts)
   - calculateDriverSurperformance(predicted, final)
   - calculateTeamSurperformance(predicted, final)
   - getSurperformanceEffect(delta, age?)

2. **Créer le hook** (hooks/use-surperformance.ts)
   - useSurperformance(seasonId)
   - Récupère prédictions + résultats finaux
   - Calcule les deltas

3. **Affichage dans assistant fin de saison**
   - Tableau avec : Entité, Prédit, Final, Δ, Effet
   - Highlight des surperformances significatives

## CHECKPOINT
- [ ] Calculs corrects selon formules
- [ ] Effets identifiés (potentiel, budget)
- [ ] Données prêtes pour l'assistant
```

---

## Prompt 4.2 — Assistant fin de saison

```
## CONTEXTE
F1 Seasons Manager - Calculs surperformance prêts.

## OBJECTIF
Créer l'assistant de fin de saison qui guide à travers toutes les évolutions.

## ÉTAPES DE L'ASSISTANT
1. Résultats finaux + champions
2. Surperformances
3. Évolutions pilotes (déclin, progression, bonus champion)
4. Révélation potentiel rookies
5. Budgets saison suivante
6. Validation et archivage

## ÉTAPES À PLANIFIER

1. **Créer la page assistant** (app/(dashboard)/season/[id]/end-season/page.tsx)
   - Stepper ou wizard multi-étapes
   - Navigation entre étapes
   - Validation par étape

2. **Étape 1 : Champions**
   - Afficher champion pilotes + constructeurs
   - Récap stats saison (nb vainqueurs, poles, etc.)

3. **Étape 2 : Surperformances**
   - Afficher tableau calculé
   - Confirmer les effets à appliquer

4. **Étape 3 : Évolutions pilotes**
   - Déclins (≥35 ans) : liste auto, validation
   - Progressions (≤26 ans, note < pot) : liste auto
   - Bonus champion : +1 potentiel
   - Checkboxes pour confirmer chaque évolution

5. **Étape 4 : Révélation rookies**
   - Rookies avec potentiel en fourchette
   - Basé sur surperformance : proposer valeur
   - Sélection manuelle si tirage nécessaire

6. **Étape 5 : Budgets**
   - Appliquer surperf constructeurs
   - Vérifier objectifs sponsors
   - Ajuster budgets si nécessaire

7. **Étape 6 : Validation**
   - Récap de tous les changements
   - Bouton "Archiver la saison"
   - Création automatique saison suivante (optionnel)

## COMPOSANTS UNTITLED UI
- Stepper ou Tabs pour navigation
- Checkbox pour validations
- Select pour choix potentiel rookie
- Button (suivant, précédent, valider)
- Badge (effets, changements)

## CHECKPOINT
- [ ] Assistant multi-étapes fonctionnel
- [ ] Calculs automatiques proposés
- [ ] Modifications manuelles possibles
- [ ] Archivage saison fonctionne
- [ ] Données copiées pour saison suivante
```

---

## Prompt 4.3 — Export fin de saison

```
## CONTEXTE
F1 Seasons Manager - Assistant fin de saison fonctionnel.

## OBJECTIF
Créer l'export Markdown récapitulatif de fin de saison.

## SECTIONS
- Champions
- Classements finaux complets
- Statistiques saison
- Surperformances
- Évolutions appliquées
- Transferts confirmés
- Retraites
- Arcs résolus

## ÉTAPES À PLANIFIER

1. **Créer le template** (lib/export/end-season-template.ts)
   - Compilation de toutes les données de fin de saison
   - Format Markdown structuré

2. **Intégrer à l'assistant**
   - Bouton "Exporter récap" après validation
   - Preview + téléchargement

3. **Template**
```markdown
# FIN DE SAISON [Année]

## Champions
- 🏆 Pilotes: [Nom] ([Équipe]) — [X] pts
- 🏆 Constructeurs: [Équipe] — [X] pts

## Classements finaux
[tableaux complets]

## Statistiques saison
- Vainqueurs différents: [X]
- Courses: [Y]

## Surperformances
[tableau]

## Évolutions appliquées
### Pilotes
[liste des changements]

### Rookies révélés
[liste]

## Transferts [Année+1]
[liste]

## Retraites
[liste]

→ Génère le récap saison + preview saison suivante
```

## CHECKPOINT
- [ ] Export complet et bien formaté
- [ ] Toutes les données incluses
- [ ] Prêt pour archivage historique
```

---

# PHASE 5 : STATISTIQUES & HISTORIQUE

## Prompt 5.1 — Palmarès et records

```
## CONTEXTE
F1 Seasons Manager - Saisons peuvent être archivées.

## OBJECTIF
Créer les pages de palmarès et records de l'univers.

## SECTIONS
- Champions pilotes (tous, avec nb titres)
- Champions constructeurs
- Classement victoires
- Records (consécutifs, sur circuit, etc.)

## ÉTAPES À PLANIFIER

1. **Créer les hooks stats** (hooks/use-stats.ts)
   - useChampions(universeId)
   - useWinsRanking(universeId)
   - useRecords(universeId)

2. **Page palmarès** (app/(dashboard)/history/champions/page.tsx)
   - Tab pilotes / constructeurs
   - Tableau avec : Pilote/Équipe, Nb titres, Années

3. **Page victoires** (app/(dashboard)/history/wins/page.tsx)
   - Classement par victoires
   - Filtres : actifs/retraités, depuis année
   - Détail victoires par pilote (expand)

4. **Page records** (app/(dashboard)/history/records/page.tsx)
   - Records absolus
   - Records pilotes actifs
   - Records par catégorie

5. **Queries SQL nécessaires**
   - Agrégations depuis race_results et history_champions
   - Calculs des records (MAX, COUNT, etc.)

## COMPOSANTS UNTITLED UI
- Tabs (pilotes/constructeurs)
- Table (classements)
- Badge (nb titres, victoires)
- Filtres (Select, Checkbox)

## CHECKPOINT
- [ ] Palmarès affiche tous les champions
- [ ] Victoires triées correctement
- [ ] Records calculés
- [ ] Filtres fonctionnels
```

---

## Prompt 5.2 — Statistiques avancées

```
## CONTEXTE
F1 Seasons Manager - Palmarès de base fonctionnel.

## OBJECTIF
Créer les statistiques avancées (head-to-head, stats par circuit, évolutions).

## SECTIONS
- Head-to-head coéquipiers
- Stats par circuit (vainqueurs, records)
- Évolution d'un pilote dans le temps
- Comparaison entre pilotes

## ÉTAPES À PLANIFIER

1. **Head-to-head** (app/(dashboard)/stats/head-to-head/page.tsx)
   - Sélection de 2 pilotes coéquipiers
   - Stats : qualifs, courses, points
   - Détail par GP

2. **Stats circuit** (app/(dashboard)/stats/circuits/[id]/page.tsx)
   - Historique vainqueurs sur ce circuit
   - Plus de victoires ici
   - Records du circuit

3. **Profil pilote** (app/(dashboard)/stats/drivers/[id]/page.tsx)
   - Carrière complète
   - Stats par saison
   - Graphique évolution (si charts disponibles)

4. **Composant graphique** (components/charts/)
   - Utiliser Untitled UI Charts si disponibles
   - Sinon : Recharts ou Chart.js
   - Graphique évolution points par saison

## COMPOSANTS UNTITLED UI
- Select pour sélection pilotes
- Table pour stats
- Charts pour visualisations
- Tabs pour navigation

## CHECKPOINT
- [ ] Head-to-head fonctionnel
- [ ] Stats circuit complètes
- [ ] Profil pilote avec historique
- [ ] Au moins 1 graphique fonctionnel
```

---

## Prompt 5.3 — Archives et historique saisons

```
## CONTEXTE
F1 Seasons Manager - Stats avancées en place.

## OBJECTIF
Créer la navigation dans l'historique des saisons archivées.

## FONCTIONNALITÉS
- Liste de toutes les saisons
- Détail d'une saison passée
- Résultats de chaque GP
- Classements finaux

## ÉTAPES À PLANIFIER

1. **Page liste saisons** (app/(dashboard)/history/seasons/page.tsx)
   - Timeline ou liste des saisons
   - Champion pilote + constructeur pour chaque
   - Lien vers détail

2. **Page détail saison archivée** (app/(dashboard)/history/seasons/[year]/page.tsx)
   - Résumé (champions, stats)
   - Calendrier avec vainqueurs
   - Classements finaux
   - Événements marquants

3. **Page détail GP archivé** 
   - Résultats complets
   - Conditions
   - Événements

## COMPOSANTS UNTITLED UI
- Timeline ou liste verticale
- Cards pour les saisons
- Table pour résultats
- Badge pour champions

## CHECKPOINT
- [ ] Navigation dans l'historique fluide
- [ ] Toutes les données archivées accessibles
- [ ] Présentation claire et cohérente
```

---

# PHASE 6 : FONCTIONNALITÉS AVANCÉES

## Prompt 6.1 — Pool de rookies

```
## CONTEXTE
F1 Seasons Manager - Core app fonctionnelle.

## OBJECTIF
Créer la gestion du pool de rookies disponibles.

## FONCTIONNALITÉS
- Liste des rookies avec potentiel en fourchette
- Filtres : disponibles, recrutés, par année
- Ajout de nouveaux rookies
- Recrutement (lie à une saison)

## ÉTAPES À PLANIFIER

1. **Page pool rookies** (app/(dashboard)/universe/[id]/rookies/page.tsx)
   - Onglets : Disponibles / Recrutés
   - Pour chaque rookie : nom, nat, pot min-max, dispo dès
   - Actions : recruter, éditer, supprimer

2. **Formulaire rookie** (components/forms/rookie-form.tsx)
   - Identité
   - Potentiel fourchette
   - Année disponibilité

3. **Action recrutement**
   - Sélectionner équipe et saison
   - Créer le pilote dans la saison
   - Marquer comme drafté

## CHECKPOINT
- [ ] Liste rookies affichée
- [ ] Ajout/édition fonctionne
- [ ] Recrutement crée le pilote
- [ ] Rookie marqué comme drafté
```

---

## Prompt 6.2 — Arcs narratifs et news

```
## CONTEXTE
F1 Seasons Manager - Pool rookies fonctionnel.

## OBJECTIF
Créer la gestion complète des arcs narratifs et news.

## FONCTIONNALITÉS
- CRUD arcs narratifs
- Suivi du statut (signal → developing → confirmed → resolved)
- News liées aux arcs
- Timeline des news

## ÉTAPES À PLANIFIER

1. **Page arcs** (app/(dashboard)/universe/[id]/arcs/page.tsx)
   - Filtres par status, importance
   - Cards avec : nom, type, status, importance, dates
   - Actions : voir, éditer, résoudre

2. **Formulaire arc** (components/forms/arc-form.tsx)
   - Nom, description
   - Type (transfer, rivalry, technical, etc.)
   - Importance (1-3 étoiles)
   - Pilotes/équipes concernés
   - Status

3. **Page news saison** (app/(dashboard)/season/[id]/news/page.tsx)
   - Timeline des news
   - Groupées par round
   - Lien vers arc parent si existe

4. **Formulaire news** (components/forms/news-form.tsx)
   - Headline, content
   - Type, importance
   - Arc lié (optionnel)

## COMPOSANTS UNTITLED UI
- Badge (importance, status)
- Select (type, arc lié)
- Textarea (description, content)
- Timeline ou liste chronologique

## CHECKPOINT
- [ ] CRUD arcs fonctionnel
- [ ] News créables et liées aux arcs
- [ ] Filtres et navigation
- [ ] Status modifiable
```

---

## Prompt 6.3 — Import/Export JSON

```
## CONTEXTE
F1 Seasons Manager - Fonctionnalités principales complètes.

## OBJECTIF
Créer le système d'import/export JSON pour backup et migration.

## FONCTIONNALITÉS
- Export complet d'un univers en JSON
- Import depuis JSON (création ou mise à jour)
- Validation du format

## STRUCTURE JSON
```json
{
  "version": "1.0",
  "exportDate": "2025-02-15",
  "universe": { ... },
  "seasons": [ ... ],
  "circuits": [ ... ],
  "rookiePool": [ ... ],
  "narrativeArcs": [ ... ],
  "historyChampions": [ ... ]
}
```

## ÉTAPES À PLANIFIER

1. **Export JSON** (lib/export/json-export.ts)
   - Collecter toutes les données d'un univers
   - Structurer en JSON
   - Téléchargement

2. **Import JSON** (lib/import/json-import.ts)
   - Parser le fichier
   - Valider la structure
   - Créer ou mettre à jour en BDD
   - Gestion des conflits

3. **Page import/export** (app/(dashboard)/universe/[id]/backup/page.tsx)
   - Bouton export
   - Zone upload pour import
   - Preview avant import
   - Log des actions

## CHECKPOINT
- [ ] Export génère JSON valide
- [ ] Import crée les données correctement
- [ ] Validation empêche imports invalides
- [ ] Feedback utilisateur clair
```

---

# PHASE 7 : POLISH & FINALISATION

## Prompt 7.1 — Navigation et UX globale

```
## CONTEXTE
F1 Seasons Manager - Toutes les fonctionnalités sont en place.

## OBJECTIF
Améliorer la navigation, le design et l'UX globale.

## POINTS À TRAITER
- Sidebar navigation cohérente
- Breadcrumbs
- Raccourcis clavier (optionnel)
- États loading/erreur uniformes
- Responsive mobile

## ÉTAPES À PLANIFIER

1. **Sidebar navigation**
   - Structure claire
   - Indicateur page active
   - Collapse sur mobile

2. **Breadcrumbs**
   - Sur toutes les pages
   - Navigation contextuelle

3. **États globaux**
   - Composant Loading uniforme
   - Composant Error uniforme
   - Empty states

4. **Responsive**
   - Tester sur mobile
   - Adapter les tables (scroll horizontal ou cards)
   - Navigation mobile

## CHECKPOINT
- [ ] Navigation fluide et cohérente
- [ ] Breadcrumbs sur toutes les pages
- [ ] États loading/erreur uniformes
- [ ] App utilisable sur mobile
```

---

## Prompt 7.2 — Thème F1 et finitions visuelles

```
## CONTEXTE
F1 Seasons Manager - Navigation en place.

## OBJECTIF
Finaliser le thème visuel F1 et les détails de design.

## THÈME F1
- Couleur primaire : Rouge F1 (#E10600)
- Background : Sombre (#0F0F0F, #1F1F1F)
- Texte : Blanc (#FFFFFF)
- Accents : Gris (#6B6B6B)

## ÉTAPES À PLANIFIER

1. **Variables CSS**
   - Adapter theme.css si possible
   - Définir --color-brand-* avec le rouge F1
   - Mode sombre par défaut

2. **Composants**
   - Vérifier cohérence couleurs
   - Badges équipes avec couleurs custom
   - Icons cohérents

3. **Détails**
   - Animations subtiles (hover, transitions)
   - Shadows appropriés
   - Spacing cohérent

## CHECKPOINT
- [ ] Thème F1 appliqué globalement
- [ ] Couleurs équipes visibles
- [ ] Dark mode par défaut
- [ ] Design cohérent et professionnel
```

---

## Prompt 7.3 — Tests et corrections finales

```
## CONTEXTE
F1 Seasons Manager - App visuellement terminée.

## OBJECTIF
Tester l'ensemble de l'application et corriger les bugs.

## SCÉNARIO DE TEST COMPLET
1. Créer un univers
2. Créer une saison
3. Ajouter équipes, pilotes, voitures
4. Configurer le calendrier
5. Générer les prédictions
6. Saisir qualifs + résultats pour 2-3 GP
7. Vérifier classements
8. Exporter pour Claude
9. Terminer la saison (assistant)
10. Vérifier l'historique

## ÉTAPES À PLANIFIER

1. **Exécuter le scénario complet**
   - Identifier les bugs
   - Noter les améliorations UX

2. **Corriger les bugs critiques**
   - Erreurs de calcul
   - Crashes
   - Données incorrectes

3. **Améliorations mineures**
   - Messages d'erreur plus clairs
   - Validations manquantes
   - Performance si nécessaire

## CHECKPOINT
- [ ] Scénario complet exécutable sans erreur
- [ ] Tous les calculs sont corrects
- [ ] Export Claude fonctionnel
- [ ] App prête pour utilisation réelle
```

---

# ANNEXES

## A. Composants Untitled UI fréquemment utilisés

| Composant | Import | Usage |
|-----------|--------|-------|
| Button | `@/components/base/buttons/button` | Actions, liens |
| Input | `@/components/base/input/input` | Champs texte |
| Select | `@/components/base/select/select` | Dropdowns |
| Checkbox | `@/components/base/checkbox/checkbox` | Sélections |
| Badge | `@/components/base/badges/badges` | Statuts, compteurs |
| Avatar | `@/components/base/avatar/avatar` | Photos pilotes |
| FeaturedIcon | `@/components/foundations/featured-icon/featured-icon` | Icônes déco |
| Table | À vérifier disponibilité | Données tabulaires |

## B. Conventions de nommage

- Fichiers : kebab-case (`team-form.tsx`)
- Composants : PascalCase (`TeamForm`)
- Hooks : camelCase avec use (`useTeams`)
- Types : PascalCase (`Team`, `Driver`)
- Variables : camelCase (`teamData`)

## C. Structure des hooks TanStack Query

```typescript
// Query
export function useTeams(seasonId: string) {
  return useQuery({
    queryKey: ['teams', seasonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('season_id', seasonId)
      if (error) throw error
      return data
    }
  })
}

// Mutation
export function useCreateTeam() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (team: TeamInsert) => {
      const { data, error } = await supabase
        .from('teams')
        .insert(team)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['teams', data.season_id] })
    }
  })
}
```

## D. Formules de calcul (référence)

| Calcul | Formule |
|--------|---------|
| Budget total | Owner + Sponsor + Surperf |
| Progression max | Budget barème + Ing modif |
| Moteur client | Note motoriste - 1 |
| Vitesse | ROUND((Aero + Motor) / 2) |
| Grip | ROUND((Aero + Chassis) / 2) |
| Accélération | Motor |
| Acclimatation | 1 an: -1, 2 ans: 0, 3+ ans: +1 |
| Note effective | MIN(Note + Acclim, Pot + 1, 10) |
| Score prédiction | Note effective + Total voiture |

## E. React Hook Form + Zod (patterns)

### Structure des schemas Zod

```typescript
// lib/validations/team.ts
import { z } from 'zod'

export const teamSchema = z.object({
  name: z.string().min(3, 'Minimum 3 caractères').max(100),
  short_name: z.string().max(20).optional(),
  nationality: z.string().optional(),
  
  // Staff
  team_principal: z.string().optional(),
  technical_director: z.string().optional(),
  engineer_level: z.coerce.number().min(1).max(3),
  
  // Motoriste
  engine_supplier_id: z.string().uuid(),
  is_factory_team: z.boolean().default(false),
  
  // Budget (0-2 chacun)
  owner_investment: z.coerce.number().min(0).max(2),
  sponsor_investment: z.coerce.number().min(0).max(2),
  
  // Sponsor
  title_sponsor: z.string().optional(),
  sponsor_duration: z.coerce.number().min(0).optional(),
  sponsor_objective: z.string().optional(),
})

export type TeamFormValues = z.infer<typeof teamSchema>
```

### Intégration avec React Hook Form

```typescript
// components/forms/team-form.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { teamSchema, TeamFormValues } from '@/lib/validations/team'

export function TeamForm({ team, onSubmit }: TeamFormProps) {
  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: team ?? {
      engineer_level: 2,
      owner_investment: 1,
      sponsor_investment: 1,
      is_factory_team: false,
    },
  })

  const { register, handleSubmit, formState: { errors, isSubmitting } } = form

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Nom de l'équipe"
        {...register('name')}
        isInvalid={!!errors.name}
        hint={errors.name?.message}
      />
      {/* autres champs */}
      <Button type="submit" isLoading={isSubmitting}>
        Enregistrer
      </Button>
    </form>
  )
}
```

### Validation pilote (exemple complexe)

```typescript
// lib/validations/driver.ts
export const driverSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().min(2),
  nationality: z.string().optional(),
  birth_year: z.coerce.number().min(1950).max(2010),
  
  // Stats
  note: z.coerce.number().min(0).max(10),
  potential_min: z.coerce.number().min(0).max(10),
  potential_max: z.coerce.number().min(0).max(10),
  potential_revealed: z.boolean().default(false),
  
  // Carrière
  world_titles: z.coerce.number().min(0).default(0),
  career_wins: z.coerce.number().min(0).default(0),
  
  // Contrat
  team_id: z.string().uuid(),
  years_in_team: z.coerce.number().min(1).default(1),
  contract_years_remaining: z.coerce.number().min(0).default(1),
  is_first_driver: z.boolean().default(false),
  
  // Status
  is_rookie: z.boolean().default(false),
  is_retiring: z.boolean().default(false),
}).refine(
  (data) => data.potential_min <= data.potential_max,
  {
    message: "Potentiel min doit être ≤ potentiel max",
    path: ["potential_min"],
  }
).refine(
  (data) => data.note <= data.potential_max,
  {
    message: "Note ne peut pas dépasser le potentiel max",
    path: ["note"],
  }
)
```

## F. TypeScript avancé (patterns)

### Types Supabase dérivés

```typescript
// types/database.ts
import { Database } from '@/lib/supabase/types'

// Types de base depuis Supabase
export type Tables = Database['public']['Tables']

export type TeamRow = Tables['teams']['Row']
export type TeamInsert = Tables['teams']['Insert']
export type TeamUpdate = Tables['teams']['Update']

export type DriverRow = Tables['drivers']['Row']
export type CarRow = Tables['cars']['Row']

// Types enrichis avec relations
export type TeamWithDrivers = TeamRow & {
  drivers: DriverRow[]
  car: CarRow | null
}

export type DriverWithTeam = DriverRow & {
  team: TeamRow | null
}
```

### Discriminated Unions pour états

```typescript
// types/race.ts
export type RaceState =
  | { status: 'scheduled'; data: null }
  | { status: 'qualifying_done'; data: { qualifying: QualifyingResult[] } }
  | { status: 'completed'; data: { qualifying: QualifyingResult[]; results: RaceResult[] } }

// Utilisation avec type guards
function getRaceInfo(race: RaceState) {
  switch (race.status) {
    case 'scheduled':
      return 'Course à venir'
    case 'qualifying_done':
      return `Pole: ${race.data.qualifying[0].driver_name}`
    case 'completed':
      return `Vainqueur: ${race.data.results[0].driver_name}`
  }
}
```

### Generics pour composants réutilisables

```typescript
// components/tables/data-table.tsx
interface Column<T> {
  key: keyof T
  header: string
  render?: (value: T[keyof T], row: T) => React.ReactNode
}

interface DataTableProps<T extends { id: string }> {
  data: T[]
  columns: Column<T>[]
  onRowClick?: (row: T) => void
  isLoading?: boolean
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  onRowClick,
  isLoading
}: DataTableProps<T>) {
  // Composant générique typé
}

// Utilisation
<DataTable<TeamRow>
  data={teams}
  columns={[
    { key: 'name', header: 'Équipe' },
    { key: 'budget_total', header: 'Budget', render: (v) => `${v}/5` },
  ]}
/>
```

### Calculs typés

```typescript
// lib/calculations/car-stats.ts
interface CarComponents {
  motor: number
  aero: number
  chassis: number
}

interface DerivedStats {
  speed: number
  grip: number
  acceleration: number
  total: number
}

export function calculateDerivedStats(car: CarComponents): DerivedStats {
  return {
    speed: Math.round((car.aero + car.motor) / 2),
    grip: Math.round((car.aero + car.chassis) / 2),
    acceleration: car.motor,
    total: car.motor + car.aero + car.chassis,
  }
}

// Type guard
export function isValidCarComponents(obj: unknown): obj is CarComponents {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'motor' in obj &&
    'aero' in obj &&
    'chassis' in obj &&
    typeof obj.motor === 'number' &&
    typeof obj.aero === 'number' &&
    typeof obj.chassis === 'number'
  )
}
```

### Hooks typés

```typescript
// hooks/use-teams.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { TeamRow, TeamInsert, TeamWithDrivers } from '@/types/database'

export function useTeams(seasonId: string) {
  return useQuery<TeamWithDrivers[], Error>({
    queryKey: ['teams', seasonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          drivers (*),
          car:cars (*)
        `)
        .eq('season_id', seasonId)
      
      if (error) throw error
      return data as TeamWithDrivers[]
    },
    enabled: !!seasonId,
  })
}

export function useCreateTeam() {
  const queryClient = useQueryClient()
  
  return useMutation<TeamRow, Error, TeamInsert>({
    mutationFn: async (team) => {
      const { data, error } = await supabase
        .from('teams')
        .insert(team)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ['teams', data.season_id] 
      })
    },
  })
}
```

---

*Document de prompts Claude Code - F1 Seasons Manager v1.0*
