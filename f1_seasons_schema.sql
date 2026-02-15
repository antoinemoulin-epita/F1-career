-- =============================================
-- F1 SEASONS MANAGER - SCHEMA SUPABASE
-- Version: 1.0
-- =============================================

-- =============================================
-- EXTENSIONS
-- =============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TYPES ENUM
-- =============================================
CREATE TYPE season_status AS ENUM ('preparation', 'active', 'completed');
CREATE TYPE race_status AS ENUM ('scheduled', 'qualifying_done', 'completed');
CREATE TYPE weather_type AS ENUM ('dry', 'wet', 'mixed');
CREATE TYPE result_status AS ENUM ('finished', 'dnf_mechanical', 'dnf_crash', 'dnf_other');
CREATE TYPE circuit_type AS ENUM ('high_speed', 'technical', 'balanced', 'street');
CREATE TYPE key_attribute AS ENUM ('speed', 'grip', 'acceleration');
CREATE TYPE region_climate AS ENUM ('tropical', 'temperate', 'desert', 'mediterranean', 'continental');
CREATE TYPE arc_status AS ENUM ('signal', 'developing', 'confirmed', 'resolved');
CREATE TYPE arc_type AS ENUM ('transfer', 'rivalry', 'technical', 'sponsor', 'entry_exit', 'drama', 'regulation', 'other');
CREATE TYPE news_type AS ENUM ('transfer', 'technical', 'sponsor', 'regulation', 'injury', 'retirement', 'other');
CREATE TYPE transfer_type AS ENUM ('rumor', 'confirmed');
CREATE TYPE reset_type AS ENUM ('critical', 'important', 'partial');

-- =============================================
-- TABLE: UNIVERSES
-- =============================================
CREATE TABLE universes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    start_year INTEGER NOT NULL,
    current_season_id UUID, -- FK ajoutée après création seasons
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLE: CIRCUITS (global, réutilisable entre univers)
-- =============================================
CREATE TABLE circuits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    flag_emoji VARCHAR(10),
    -- Caractéristiques
    circuit_type circuit_type DEFAULT 'balanced',
    key_attribute key_attribute DEFAULT 'speed',
    prestige INTEGER DEFAULT 0 CHECK (prestige >= 0 AND prestige <= 3),
    -- Météo
    region_climate region_climate DEFAULT 'temperate',
    base_rain_probability INTEGER DEFAULT 10 CHECK (base_rain_probability >= 0 AND base_rain_probability <= 100),
    -- Meta
    first_gp_year INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLE: SEASONS
-- =============================================
CREATE TABLE seasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    universe_id UUID NOT NULL REFERENCES universes(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    status season_status DEFAULT 'preparation',
    -- Configuration
    gp_count INTEGER DEFAULT 8 CHECK (gp_count >= 1 AND gp_count <= 25),
    quali_laps INTEGER DEFAULT 1 CHECK (quali_laps >= 1 AND quali_laps <= 3),
    race_laps INTEGER DEFAULT 10 CHECK (race_laps >= 1 AND race_laps <= 100),
    -- Prédictions
    predictions_locked BOOLEAN DEFAULT FALSE,
    -- Meta
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(universe_id, year)
);

-- Ajout FK current_season dans universes
ALTER TABLE universes 
ADD CONSTRAINT fk_current_season 
FOREIGN KEY (current_season_id) REFERENCES seasons(id) ON DELETE SET NULL;

-- =============================================
-- TABLE: ENGINE_SUPPLIERS (Motoristes)
-- =============================================
CREATE TABLE engine_suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    nationality VARCHAR(50),
    note INTEGER NOT NULL CHECK (note >= 0 AND note <= 10),
    investment_level INTEGER DEFAULT 2 CHECK (investment_level >= 1 AND investment_level <= 3),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(season_id, name)
);

-- =============================================
-- TABLE: TEAMS
-- =============================================
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    -- Identité
    name VARCHAR(100) NOT NULL,
    short_name VARCHAR(20),
    nationality VARCHAR(50),
    color_primary VARCHAR(7) DEFAULT '#E10600',
    color_secondary VARCHAR(7) DEFAULT '#FFFFFF',
    -- Staff
    team_principal VARCHAR(100),
    technical_director VARCHAR(100),
    engineer_level INTEGER DEFAULT 2 CHECK (engineer_level >= 1 AND engineer_level <= 3),
    -- Motoriste
    engine_supplier_id UUID REFERENCES engine_suppliers(id) ON DELETE SET NULL,
    is_factory_team BOOLEAN DEFAULT FALSE,
    -- Budget
    owner_investment INTEGER DEFAULT 1 CHECK (owner_investment >= 0 AND owner_investment <= 2),
    sponsor_investment INTEGER DEFAULT 1 CHECK (sponsor_investment >= 0 AND sponsor_investment <= 2),
    surperformance_bonus INTEGER DEFAULT 0 CHECK (surperformance_bonus >= 0 AND surperformance_bonus <= 1),
    -- Sponsor
    title_sponsor VARCHAR(100),
    sponsor_duration INTEGER,
    sponsor_objective TEXT,
    sponsor_objective_met BOOLEAN,
    -- Actionnariat
    shareholders TEXT,
    -- Meta
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(season_id, name)
);

-- =============================================
-- TABLE: CARS
-- =============================================
CREATE TABLE cars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE UNIQUE,
    -- Composantes (0-10)
    motor INTEGER NOT NULL CHECK (motor >= 0 AND motor <= 10),
    aero INTEGER NOT NULL CHECK (aero >= 0 AND aero <= 10),
    chassis INTEGER NOT NULL CHECK (chassis >= 0 AND chassis <= 10),
    -- Pénalités
    engine_change_penalty BOOLEAN DEFAULT FALSE,
    -- Meta
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLE: DRIVERS
-- =============================================
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    -- Identité
    first_name VARCHAR(50),
    last_name VARCHAR(50) NOT NULL,
    nationality VARCHAR(50),
    birth_year INTEGER,
    -- Stats talent
    note INTEGER NOT NULL CHECK (note >= 0 AND note <= 10),
    potential_min INTEGER CHECK (potential_min >= 0 AND potential_min <= 15),
    potential_max INTEGER CHECK (potential_max >= 0 AND potential_max <= 15),
    potential_revealed BOOLEAN DEFAULT FALSE,
    potential_final INTEGER CHECK (potential_final >= 0 AND potential_final <= 15),
    -- Acclimatation
    years_in_team INTEGER DEFAULT 1 CHECK (years_in_team >= 1),
    -- Carrière
    world_titles INTEGER DEFAULT 0,
    career_wins INTEGER DEFAULT 0,
    career_poles INTEGER DEFAULT 0,
    career_podiums INTEGER DEFAULT 0,
    career_points INTEGER DEFAULT 0,
    career_races INTEGER DEFAULT 0,
    -- Contrat
    contract_years_remaining INTEGER DEFAULT 1,
    is_first_driver BOOLEAN DEFAULT FALSE,
    -- Status
    is_rookie BOOLEAN DEFAULT FALSE,
    is_retiring BOOLEAN DEFAULT FALSE,
    -- Meta
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLE: ROOKIE_POOL
-- =============================================
CREATE TABLE rookie_pool (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    universe_id UUID NOT NULL REFERENCES universes(id) ON DELETE CASCADE,
    -- Identité
    first_name VARCHAR(50),
    last_name VARCHAR(50) NOT NULL,
    nationality VARCHAR(50),
    birth_year INTEGER,
    -- Potentiel
    potential_min INTEGER NOT NULL CHECK (potential_min >= 0 AND potential_min <= 10),
    potential_max INTEGER NOT NULL CHECK (potential_max >= 0 AND potential_max <= 10),
    -- Disponibilité
    available_from_year INTEGER,
    -- Statut
    drafted BOOLEAN DEFAULT FALSE,
    drafted_season_id UUID REFERENCES seasons(id) ON DELETE SET NULL,
    drafted_team_name VARCHAR(100),
    -- Meta
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_potential_range CHECK (potential_min <= potential_max)
);

-- =============================================
-- TABLE: CALENDAR
-- =============================================
CREATE TABLE calendar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    circuit_id UUID NOT NULL REFERENCES circuits(id) ON DELETE RESTRICT,
    round_number INTEGER NOT NULL CHECK (round_number >= 1),
    -- Status
    status race_status DEFAULT 'scheduled',
    -- Conditions
    weather weather_type DEFAULT 'dry',
    rain_probability INTEGER CHECK (rain_probability >= 0 AND rain_probability <= 100),
    -- Events
    notable_events TEXT,
    -- Meta
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(season_id, round_number),
    UNIQUE(season_id, circuit_id)
);

-- =============================================
-- TABLE: QUALIFYING_RESULTS
-- =============================================
CREATE TABLE qualifying_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    race_id UUID NOT NULL REFERENCES calendar(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    position INTEGER NOT NULL CHECK (position >= 1),
    -- Meta
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(race_id, driver_id),
    UNIQUE(race_id, position)
);

-- =============================================
-- TABLE: RACE_RESULTS
-- =============================================
CREATE TABLE race_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    race_id UUID NOT NULL REFERENCES calendar(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    -- Positions
    grid_position INTEGER NOT NULL CHECK (grid_position >= 1),
    finish_position INTEGER CHECK (finish_position >= 1),
    -- Status
    status result_status DEFAULT 'finished',
    dnf_reason TEXT,
    dnf_lap INTEGER,
    -- Points & Bonus
    points INTEGER DEFAULT 0,
    fastest_lap BOOLEAN DEFAULT FALSE,
    -- Meta
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(race_id, driver_id)
);

-- =============================================
-- TABLE: STANDINGS_DRIVERS
-- =============================================
CREATE TABLE standings_drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    after_round INTEGER NOT NULL CHECK (after_round >= 0),
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    -- Stats
    position INTEGER NOT NULL CHECK (position >= 1),
    points INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    podiums INTEGER DEFAULT 0,
    poles INTEGER DEFAULT 0,
    fastest_laps INTEGER DEFAULT 0,
    dnfs INTEGER DEFAULT 0,
    -- Meta
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(season_id, after_round, driver_id)
);

-- =============================================
-- TABLE: STANDINGS_CONSTRUCTORS
-- =============================================
CREATE TABLE standings_constructors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    after_round INTEGER NOT NULL CHECK (after_round >= 0),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    -- Stats
    position INTEGER NOT NULL CHECK (position >= 1),
    points INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    podiums INTEGER DEFAULT 0,
    poles INTEGER DEFAULT 0,
    -- Meta
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(season_id, after_round, team_id)
);

-- =============================================
-- TABLE: PREDICTIONS_DRIVERS
-- =============================================
CREATE TABLE predictions_drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    predicted_position INTEGER NOT NULL CHECK (predicted_position >= 1),
    score DECIMAL(6,2),
    -- Meta
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(season_id, driver_id)
);

-- =============================================
-- TABLE: PREDICTIONS_CONSTRUCTORS
-- =============================================
CREATE TABLE predictions_constructors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    predicted_position INTEGER NOT NULL CHECK (predicted_position >= 1),
    score DECIMAL(6,2),
    -- Meta
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(season_id, team_id)
);

-- =============================================
-- TABLE: NARRATIVE_ARCS
-- =============================================
CREATE TABLE narrative_arcs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    universe_id UUID NOT NULL REFERENCES universes(id) ON DELETE CASCADE,
    -- Contenu
    name VARCHAR(200) NOT NULL,
    description TEXT,
    arc_type arc_type DEFAULT 'other',
    status arc_status DEFAULT 'signal',
    importance INTEGER DEFAULT 1 CHECK (importance >= 1 AND importance <= 3),
    -- Liens (stockés comme arrays)
    related_driver_ids UUID[],
    related_team_ids UUID[],
    -- Timeline
    started_season_id UUID REFERENCES seasons(id) ON DELETE SET NULL,
    started_round INTEGER,
    resolved_season_id UUID REFERENCES seasons(id) ON DELETE SET NULL,
    resolved_round INTEGER,
    resolution_summary TEXT,
    -- Meta
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLE: NEWS
-- =============================================
CREATE TABLE news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    after_round INTEGER, -- NULL = intersaison
    arc_id UUID REFERENCES narrative_arcs(id) ON DELETE SET NULL,
    -- Contenu
    importance INTEGER DEFAULT 1 CHECK (importance >= 1 AND importance <= 3),
    headline VARCHAR(300) NOT NULL,
    content TEXT,
    news_type news_type DEFAULT 'other',
    -- Meta
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLE: TRANSFERS
-- =============================================
CREATE TABLE transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    from_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    to_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    -- Détails
    effective_year INTEGER NOT NULL,
    transfer_type transfer_type DEFAULT 'confirmed',
    contract_years INTEGER,
    is_first_driver BOOLEAN,
    arc_id UUID REFERENCES narrative_arcs(id) ON DELETE SET NULL,
    -- Meta
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLE: REGULATIONS
-- =============================================
CREATE TABLE regulations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    universe_id UUID NOT NULL REFERENCES universes(id) ON DELETE CASCADE,
    effective_year INTEGER NOT NULL,
    -- Type
    name VARCHAR(200),
    description TEXT,
    reset_type reset_type DEFAULT 'partial',
    -- Composantes affectées
    affects_motor BOOLEAN DEFAULT FALSE,
    affects_aero BOOLEAN DEFAULT FALSE,
    affects_chassis BOOLEAN DEFAULT FALSE,
    -- Meta
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(universe_id, effective_year, name)
);

-- =============================================
-- TABLE: HISTORY_CHAMPIONS (archive rapide)
-- =============================================
CREATE TABLE history_champions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    universe_id UUID NOT NULL REFERENCES universes(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    -- Pilote
    champion_driver_id UUID,
    champion_driver_name VARCHAR(100),
    champion_driver_team VARCHAR(100),
    champion_driver_points INTEGER,
    -- Constructeur
    champion_team_id UUID,
    champion_team_name VARCHAR(100),
    champion_team_points INTEGER,
    -- Résumé
    season_summary TEXT,
    -- Meta
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(universe_id, year)
);

-- =============================================
-- TABLE: POINTS_SYSTEM
-- =============================================
CREATE TABLE points_system (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    universe_id UUID NOT NULL REFERENCES universes(id) ON DELETE CASCADE,
    position INTEGER NOT NULL CHECK (position >= 1 AND position <= 30),
    points INTEGER NOT NULL CHECK (points >= 0),
    UNIQUE(universe_id, position)
);

-- =============================================
-- INDEXES
-- =============================================

-- Universes
CREATE INDEX idx_universes_user ON universes(user_id);

-- Seasons
CREATE INDEX idx_seasons_universe ON seasons(universe_id);
CREATE INDEX idx_seasons_year ON seasons(year);

-- Teams
CREATE INDEX idx_teams_season ON teams(season_id);
CREATE INDEX idx_teams_engine ON teams(engine_supplier_id);

-- Drivers
CREATE INDEX idx_drivers_season ON drivers(season_id);
CREATE INDEX idx_drivers_team ON drivers(team_id);
CREATE INDEX idx_drivers_name ON drivers(last_name);

-- Calendar
CREATE INDEX idx_calendar_season ON calendar(season_id);
CREATE INDEX idx_calendar_circuit ON calendar(circuit_id);

-- Results
CREATE INDEX idx_qualifying_race ON qualifying_results(race_id);
CREATE INDEX idx_qualifying_driver ON qualifying_results(driver_id);
CREATE INDEX idx_race_results_race ON race_results(race_id);
CREATE INDEX idx_race_results_driver ON race_results(driver_id);

-- Standings
CREATE INDEX idx_standings_drivers_season ON standings_drivers(season_id);
CREATE INDEX idx_standings_drivers_round ON standings_drivers(after_round);
CREATE INDEX idx_standings_constructors_season ON standings_constructors(season_id);

-- Arcs & News
CREATE INDEX idx_arcs_universe ON narrative_arcs(universe_id);
CREATE INDEX idx_arcs_status ON narrative_arcs(status);
CREATE INDEX idx_news_season ON news(season_id);
CREATE INDEX idx_news_arc ON news(arc_id);

-- =============================================
-- VIEWS
-- =============================================

-- Vue: Budget total calculé
CREATE OR REPLACE VIEW v_teams_with_budget AS
SELECT 
    t.*,
    (t.owner_investment + t.sponsor_investment + t.surperformance_bonus) AS budget_total,
    CASE t.engineer_level
        WHEN 3 THEN '★★★'
        WHEN 2 THEN '★★'
        WHEN 1 THEN '★'
    END AS engineer_stars
FROM teams t;

-- Vue: Voitures avec stats dérivées
CREATE OR REPLACE VIEW v_cars_with_stats AS
SELECT 
    c.*,
    (c.motor + c.aero + c.chassis) AS total,
    ROUND((c.aero + c.motor)::DECIMAL / 2) AS speed,
    c.motor AS acceleration,
    ROUND((c.aero + c.chassis)::DECIMAL / 2) AS grip,
    CASE WHEN c.engine_change_penalty THEN c.chassis - 1 ELSE c.chassis END AS effective_chassis
FROM cars c;

-- Vue: Pilotes avec note effective
CREATE OR REPLACE VIEW v_drivers_with_effective AS
SELECT 
    d.*,
    CONCAT(d.first_name, ' ', d.last_name) AS full_name,
    CASE 
        WHEN d.years_in_team = 1 THEN -1
        WHEN d.years_in_team = 2 THEN 0
        ELSE 1
    END AS acclimatation,
    LEAST(
        d.note + CASE 
            WHEN d.years_in_team = 1 THEN -1
            WHEN d.years_in_team = 2 THEN 0
            ELSE 1
        END,
        COALESCE(d.potential_final, d.potential_max, 10) + 1,
        10
    ) AS effective_note,
    EXTRACT(YEAR FROM NOW())::INTEGER - d.birth_year AS age
FROM drivers d;

-- Vue: Classement pilotes actuel (dernier round)
CREATE OR REPLACE VIEW v_current_standings_drivers AS
SELECT DISTINCT ON (sd.season_id, sd.driver_id)
    sd.*,
    d.first_name,
    d.last_name,
    t.name AS team_name,
    t.color_primary AS team_color
FROM standings_drivers sd
JOIN drivers d ON sd.driver_id = d.id
LEFT JOIN teams t ON d.team_id = t.id
ORDER BY sd.season_id, sd.driver_id, sd.after_round DESC;

-- Vue: Classement constructeurs actuel
CREATE OR REPLACE VIEW v_current_standings_constructors AS
SELECT DISTINCT ON (sc.season_id, sc.team_id)
    sc.*,
    t.name AS team_name,
    t.color_primary AS team_color
FROM standings_constructors sc
JOIN teams t ON sc.team_id = t.id
ORDER BY sc.season_id, sc.team_id, sc.after_round DESC;

-- Vue: Résumé course
CREATE OR REPLACE VIEW v_race_summary AS
SELECT 
    cal.id AS race_id,
    cal.season_id,
    cal.round_number,
    cal.status,
    cal.weather,
    c.name AS circuit_name,
    c.country,
    c.flag_emoji,
    s.year,
    (SELECT d.last_name FROM race_results rr 
     JOIN drivers d ON rr.driver_id = d.id 
     WHERE rr.race_id = cal.id AND rr.finish_position = 1 
     LIMIT 1) AS winner,
    (SELECT COUNT(*) FROM race_results rr 
     WHERE rr.race_id = cal.id AND rr.status != 'finished') AS dnf_count
FROM calendar cal
JOIN circuits c ON cal.circuit_id = c.id
JOIN seasons s ON cal.season_id = s.id;

-- =============================================
-- FUNCTIONS
-- =============================================

-- Fonction: Calculer progression max équipe
CREATE OR REPLACE FUNCTION fn_calculate_progression_max(
    p_budget INTEGER,
    p_engineer_level INTEGER
) RETURNS INTEGER AS $$
DECLARE
    v_base INTEGER;
    v_modifier INTEGER;
BEGIN
    -- Base selon budget
    v_base := CASE p_budget
        WHEN 5 THEN 3
        WHEN 4 THEN 2
        WHEN 3 THEN 1
        WHEN 2 THEN 0
        WHEN 1 THEN -1
        WHEN 0 THEN -2
        ELSE 0
    END;
    
    -- Modificateur ingénieurs
    v_modifier := CASE p_engineer_level
        WHEN 3 THEN 1
        WHEN 2 THEN 0
        WHEN 1 THEN -1
        ELSE 0
    END;
    
    RETURN v_base + v_modifier;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Fonction: Calculer points selon position
CREATE OR REPLACE FUNCTION fn_calculate_points(
    p_universe_id UUID,
    p_position INTEGER
) RETURNS INTEGER AS $$
DECLARE
    v_points INTEGER;
BEGIN
    SELECT points INTO v_points
    FROM points_system
    WHERE universe_id = p_universe_id AND position = p_position;
    
    RETURN COALESCE(v_points, 0);
END;
$$ LANGUAGE plpgsql STABLE;

-- Fonction: Calculer probabilité pluie
CREATE OR REPLACE FUNCTION fn_calculate_rain_probability(
    p_base_probability INTEGER
) RETURNS INTEGER AS $$
BEGIN
    -- Base ± 10% aléatoire
    RETURN GREATEST(0, LEAST(100, 
        p_base_probability + (FLOOR(RANDOM() * 21) - 10)::INTEGER
    ));
END;
$$ LANGUAGE plpgsql VOLATILE;

-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger: Update updated_at
CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_universes_updated
    BEFORE UPDATE ON universes
    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER tr_seasons_updated
    BEFORE UPDATE ON seasons
    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER tr_teams_updated
    BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER tr_cars_updated
    BEFORE UPDATE ON cars
    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER tr_drivers_updated
    BEFORE UPDATE ON drivers
    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER tr_calendar_updated
    BEFORE UPDATE ON calendar
    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER tr_arcs_updated
    BEFORE UPDATE ON narrative_arcs
    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

-- =============================================
-- RLS (Row Level Security)
-- =============================================

-- Activer RLS sur toutes les tables
ALTER TABLE universes ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE engine_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rookie_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE qualifying_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE race_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE standings_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE standings_constructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions_constructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE narrative_arcs ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE history_champions ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_system ENABLE ROW LEVEL SECURITY;

-- Circuits sont publics (pas de RLS)
ALTER TABLE circuits DISABLE ROW LEVEL SECURITY;

-- Policies pour universes (propriétaire uniquement)
CREATE POLICY "Users can view own universes"
    ON universes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own universes"
    ON universes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own universes"
    ON universes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own universes"
    ON universes FOR DELETE
    USING (auth.uid() = user_id);

-- Policies pour seasons (via universe ownership)
CREATE POLICY "Users can manage seasons in own universes"
    ON seasons FOR ALL
    USING (
        universe_id IN (
            SELECT id FROM universes WHERE user_id = auth.uid()
        )
    );

-- Policies génériques pour tables liées à seasons
CREATE POLICY "Users can manage engine_suppliers"
    ON engine_suppliers FOR ALL
    USING (
        season_id IN (
            SELECT s.id FROM seasons s
            JOIN universes u ON s.universe_id = u.id
            WHERE u.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage teams"
    ON teams FOR ALL
    USING (
        season_id IN (
            SELECT s.id FROM seasons s
            JOIN universes u ON s.universe_id = u.id
            WHERE u.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage cars"
    ON cars FOR ALL
    USING (
        team_id IN (
            SELECT t.id FROM teams t
            JOIN seasons s ON t.season_id = s.id
            JOIN universes u ON s.universe_id = u.id
            WHERE u.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage drivers"
    ON drivers FOR ALL
    USING (
        season_id IN (
            SELECT s.id FROM seasons s
            JOIN universes u ON s.universe_id = u.id
            WHERE u.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage rookie_pool"
    ON rookie_pool FOR ALL
    USING (
        universe_id IN (
            SELECT id FROM universes WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage calendar"
    ON calendar FOR ALL
    USING (
        season_id IN (
            SELECT s.id FROM seasons s
            JOIN universes u ON s.universe_id = u.id
            WHERE u.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage qualifying_results"
    ON qualifying_results FOR ALL
    USING (
        race_id IN (
            SELECT c.id FROM calendar c
            JOIN seasons s ON c.season_id = s.id
            JOIN universes u ON s.universe_id = u.id
            WHERE u.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage race_results"
    ON race_results FOR ALL
    USING (
        race_id IN (
            SELECT c.id FROM calendar c
            JOIN seasons s ON c.season_id = s.id
            JOIN universes u ON s.universe_id = u.id
            WHERE u.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage standings_drivers"
    ON standings_drivers FOR ALL
    USING (
        season_id IN (
            SELECT s.id FROM seasons s
            JOIN universes u ON s.universe_id = u.id
            WHERE u.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage standings_constructors"
    ON standings_constructors FOR ALL
    USING (
        season_id IN (
            SELECT s.id FROM seasons s
            JOIN universes u ON s.universe_id = u.id
            WHERE u.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage predictions_drivers"
    ON predictions_drivers FOR ALL
    USING (
        season_id IN (
            SELECT s.id FROM seasons s
            JOIN universes u ON s.universe_id = u.id
            WHERE u.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage predictions_constructors"
    ON predictions_constructors FOR ALL
    USING (
        season_id IN (
            SELECT s.id FROM seasons s
            JOIN universes u ON s.universe_id = u.id
            WHERE u.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage narrative_arcs"
    ON narrative_arcs FOR ALL
    USING (
        universe_id IN (
            SELECT id FROM universes WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage news"
    ON news FOR ALL
    USING (
        season_id IN (
            SELECT s.id FROM seasons s
            JOIN universes u ON s.universe_id = u.id
            WHERE u.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage transfers"
    ON transfers FOR ALL
    USING (
        season_id IN (
            SELECT s.id FROM seasons s
            JOIN universes u ON s.universe_id = u.id
            WHERE u.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage regulations"
    ON regulations FOR ALL
    USING (
        universe_id IN (
            SELECT id FROM universes WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage history_champions"
    ON history_champions FOR ALL
    USING (
        universe_id IN (
            SELECT id FROM universes WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage points_system"
    ON points_system FOR ALL
    USING (
        universe_id IN (
            SELECT id FROM universes WHERE user_id = auth.uid()
        )
    );

-- =============================================
-- SEED DATA: Points par défaut
-- =============================================

-- Cette fonction sera appelée lors de la création d'un univers
CREATE OR REPLACE FUNCTION fn_seed_default_points(p_universe_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO points_system (universe_id, position, points)
    VALUES
        (p_universe_id, 1, 30),
        (p_universe_id, 2, 25),
        (p_universe_id, 3, 22),
        (p_universe_id, 4, 20),
        (p_universe_id, 5, 18),
        (p_universe_id, 6, 16),
        (p_universe_id, 7, 14),
        (p_universe_id, 8, 12),
        (p_universe_id, 9, 11),
        (p_universe_id, 10, 10),
        (p_universe_id, 11, 9),
        (p_universe_id, 12, 8),
        (p_universe_id, 13, 7),
        (p_universe_id, 14, 6),
        (p_universe_id, 15, 5),
        (p_universe_id, 16, 4),
        (p_universe_id, 17, 3),
        (p_universe_id, 18, 2),
        (p_universe_id, 19, 1),
        (p_universe_id, 20, 0);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SEED DATA: Circuits par défaut
-- =============================================

INSERT INTO circuits (name, country, city, flag_emoji, circuit_type, key_attribute, prestige, region_climate, base_rain_probability, first_gp_year) VALUES
('Albert Park', 'Australie', 'Melbourne', '🇦🇺', 'balanced', 'speed', 2, 'temperate', 15, 1996),
('Bahrain International Circuit', 'Bahreïn', 'Sakhir', '🇧🇭', 'technical', 'grip', 2, 'desert', 2, 2004),
('Jeddah Corniche Circuit', 'Arabie Saoudite', 'Djeddah', '🇸🇦', 'street', 'speed', 1, 'desert', 1, 2021),
('Shanghai International Circuit', 'Chine', 'Shanghai', '🇨🇳', 'balanced', 'acceleration', 2, 'temperate', 25, 2004),
('Miami International Autodrome', 'États-Unis', 'Miami', '🇺🇸', 'street', 'speed', 1, 'tropical', 30, 2022),
('Autodromo Enzo e Dino Ferrari', 'Italie', 'Imola', '🇮🇹', 'technical', 'grip', 3, 'mediterranean', 20, 1980),
('Circuit de Monaco', 'Monaco', 'Monte-Carlo', '🇲🇨', 'street', 'grip', 3, 'mediterranean', 10, 1950),
('Circuit de Barcelona-Catalunya', 'Espagne', 'Barcelone', '🇪🇸', 'balanced', 'acceleration', 2, 'mediterranean', 10, 1991),
('Circuit Gilles Villeneuve', 'Canada', 'Montréal', '🇨🇦', 'balanced', 'acceleration', 2, 'continental', 25, 1978),
('Red Bull Ring', 'Autriche', 'Spielberg', '🇦🇹', 'high_speed', 'acceleration', 2, 'continental', 30, 1970),
('Silverstone Circuit', 'Royaume-Uni', 'Silverstone', '🇬🇧', 'high_speed', 'speed', 3, 'temperate', 35, 1950),
('Hungaroring', 'Hongrie', 'Budapest', '🇭🇺', 'technical', 'grip', 2, 'continental', 20, 1986),
('Circuit de Spa-Francorchamps', 'Belgique', 'Spa', '🇧🇪', 'high_speed', 'speed', 3, 'temperate', 40, 1950),
('Circuit Zandvoort', 'Pays-Bas', 'Zandvoort', '🇳🇱', 'technical', 'grip', 2, 'temperate', 30, 1952),
('Autodromo Nazionale Monza', 'Italie', 'Monza', '🇮🇹', 'high_speed', 'speed', 3, 'mediterranean', 15, 1950),
('Marina Bay Street Circuit', 'Singapour', 'Singapour', '🇸🇬', 'street', 'grip', 2, 'tropical', 25, 2008),
('Suzuka International Racing Course', 'Japon', 'Suzuka', '🇯🇵', 'technical', 'grip', 3, 'temperate', 25, 1987),
('Losail International Circuit', 'Qatar', 'Lusail', '🇶🇦', 'high_speed', 'speed', 1, 'desert', 1, 2021),
('Circuit of the Americas', 'États-Unis', 'Austin', '🇺🇸', 'balanced', 'acceleration', 2, 'continental', 20, 2012),
('Autódromo Hermanos Rodríguez', 'Mexique', 'Mexico', '🇲🇽', 'balanced', 'speed', 2, 'temperate', 15, 1963),
('Autódromo José Carlos Pace', 'Brésil', 'São Paulo', '🇧🇷', 'balanced', 'acceleration', 3, 'tropical', 35, 1973),
('Las Vegas Street Circuit', 'États-Unis', 'Las Vegas', '🇺🇸', 'street', 'speed', 1, 'desert', 5, 2023),
('Yas Marina Circuit', 'Émirats arabes unis', 'Abu Dhabi', '🇦🇪', 'technical', 'acceleration', 2, 'desert', 1, 2009),
('Sepang International Circuit', 'Malaisie', 'Kuala Lumpur', '🇲🇾', 'balanced', 'acceleration', 2, 'tropical', 45, 1999),
('Korea International Circuit', 'Corée du Sud', 'Yeongam', '🇰🇷', 'balanced', 'speed', 1, 'temperate', 20, 2010),
('Buddh International Circuit', 'Inde', 'Greater Noida', '🇮🇳', 'high_speed', 'speed', 1, 'tropical', 10, 2011),
('Hockenheimring', 'Allemagne', 'Hockenheim', '🇩🇪', 'high_speed', 'speed', 2, 'continental', 25, 1970),
('Nürburgring', 'Allemagne', 'Nürburg', '🇩🇪', 'technical', 'grip', 2, 'continental', 35, 1984),
('Sochi Autodrom', 'Russie', 'Sotchi', '🇷🇺', 'street', 'acceleration', 1, 'temperate', 20, 2014),
('Istanbul Park', 'Turquie', 'Istanbul', '🇹🇷', 'technical', 'grip', 2, 'mediterranean', 15, 2005),
('Valencia Street Circuit', 'Espagne', 'Valence', '🇪🇸', 'street', 'grip', 1, 'mediterranean', 10, 2008),
('Magny-Cours', 'France', 'Magny-Cours', '🇫🇷', 'technical', 'grip', 2, 'temperate', 25, 1991),
('Circuit Paul Ricard', 'France', 'Le Castellet', '🇫🇷', 'high_speed', 'speed', 1, 'mediterranean', 10, 1971),
('A1-Ring', 'Autriche', 'Spielberg', '🇦🇹', 'high_speed', 'acceleration', 2, 'continental', 30, 1970),
('Indianapolis Motor Speedway', 'États-Unis', 'Indianapolis', '🇺🇸', 'high_speed', 'speed', 2, 'continental', 20, 2000),
('Fuji Speedway', 'Japon', 'Oyama', '🇯🇵', 'high_speed', 'speed', 2, 'temperate', 30, 1976);

-- =============================================
-- FIN DU SCHEMA
-- =============================================
