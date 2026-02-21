-- Etape 4: Create the two atomic RPCs for end-of-season processing

-- ═══════════════════════════════════════════════════════════════════════════════
-- fn_archive_season: atomically archives a completed season
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION fn_archive_season(p_payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_season_id UUID;
  v_universe_id UUID;
  v_year INT;
  v_season_status TEXT;
  v_evo JSONB;
  v_driver RECORD;
  v_new_potential INT;
  v_updates JSONB;
  v_potential_delta INT;
  v_current_note INT;
  v_new_note INT;
  v_change JSONB;
  v_team RECORD;
  v_current_bonus INT;
  v_eval JSONB;
BEGIN
  -- Extract top-level params
  v_season_id   := (p_payload->>'season_id')::UUID;
  v_universe_id := (p_payload->>'universe_id')::UUID;
  v_year        := (p_payload->>'year')::INT;

  -- Guard: season must not already be completed (Bug #13)
  SELECT status INTO v_season_status FROM seasons WHERE id = v_season_id;
  IF v_season_status = 'completed' THEN
    RAISE EXCEPTION 'Season % is already completed', v_season_id;
  END IF;

  -- 1. Insert history_champions
  INSERT INTO history_champions (
    universe_id, year,
    champion_driver_id, champion_driver_name, champion_driver_points, champion_driver_team,
    champion_team_id, champion_team_name, champion_team_points,
    season_summary
  ) VALUES (
    v_universe_id, v_year,
    (p_payload->>'champion_driver_id')::UUID,
    p_payload->>'champion_driver_name',
    (p_payload->>'champion_driver_points')::INT,
    p_payload->>'champion_driver_team',
    (p_payload->>'champion_team_id')::UUID,
    p_payload->>'champion_team_name',
    (p_payload->>'champion_team_points')::INT,
    p_payload->>'season_summary'
  );

  -- 2. Apply driver evolutions
  FOR v_evo IN SELECT * FROM jsonb_array_elements(p_payload->'driver_evolutions')
  LOOP
    SELECT note, potential_final, potential_revealed, world_titles
    INTO v_driver
    FROM drivers
    WHERE id = (v_evo->>'driver_id')::UUID;

    IF NOT FOUND THEN CONTINUE; END IF;

    v_updates := '{}'::JSONB;
    v_new_potential := COALESCE(v_driver.potential_final, 10);

    -- A. Rookie reveal
    IF v_evo->>'rookie_reveal' IS NOT NULL THEN
      v_new_potential := (v_evo->>'rookie_reveal')::INT;
      v_updates := v_updates
        || jsonb_build_object('potential_final', v_new_potential)
        || jsonb_build_object('potential_revealed', true)
        || jsonb_build_object('is_rookie', false);
    ELSE
      -- B. Apply potential changes: decline + champion_bonus + surperf
      v_potential_delta := COALESCE((v_evo->>'decline')::INT, 0)
                         + COALESCE((v_evo->>'champion_bonus')::INT, 0)
                         + COALESCE((v_evo->>'potential_change')::INT, 0);
      IF v_potential_delta <> 0 THEN
        v_new_potential := GREATEST(1, v_new_potential + v_potential_delta);
        v_updates := v_updates || jsonb_build_object('potential_final', v_new_potential);
      END IF;
    END IF;

    -- C. Apply note change (progression)
    v_current_note := COALESCE(v_driver.note, 0);
    IF COALESCE((v_evo->>'progression')::INT, 0) <> 0 THEN
      v_new_note := GREATEST(1, LEAST(v_current_note + (v_evo->>'progression')::INT, v_new_potential));
      v_updates := v_updates || jsonb_build_object('note', v_new_note);
    ELSIF v_current_note > v_new_potential THEN
      -- Clamp note if potential decreased below current note
      v_updates := v_updates || jsonb_build_object('note', v_new_potential);
    END IF;

    -- D. Champion bonus: increment world_titles
    IF COALESCE((v_evo->>'champion_bonus')::INT, 0) > 0 THEN
      v_updates := v_updates || jsonb_build_object('world_titles', COALESCE(v_driver.world_titles, 0) + 1);
    END IF;

    -- Apply all updates in one statement
    IF v_updates <> '{}'::JSONB THEN
      UPDATE drivers SET
        potential_final    = COALESCE((v_updates->>'potential_final')::INT, potential_final),
        potential_revealed = COALESCE((v_updates->>'potential_revealed')::BOOL, potential_revealed),
        is_rookie          = COALESCE((v_updates->>'is_rookie')::BOOL, is_rookie),
        note               = COALESCE((v_updates->>'note')::INT, note),
        world_titles       = COALESCE((v_updates->>'world_titles')::INT, world_titles)
      WHERE id = (v_evo->>'driver_id')::UUID;
    END IF;
  END LOOP;

  -- 3. Apply team budget changes
  FOR v_change IN SELECT * FROM jsonb_array_elements(p_payload->'team_budget_changes')
  LOOP
    IF COALESCE((v_change->>'surperformance_delta')::INT, 0) = 0 THEN CONTINUE; END IF;

    SELECT surperformance_bonus INTO v_current_bonus
    FROM teams WHERE id = (v_change->>'team_id')::UUID;

    UPDATE teams
    SET surperformance_bonus = GREATEST(0, COALESCE(v_current_bonus, 0) + (v_change->>'surperformance_delta')::INT)
    WHERE id = (v_change->>'team_id')::UUID;
  END LOOP;

  -- 4. Batch decrement contracts and increment years_in_team (Bug #2: no N+1)
  IF COALESCE((p_payload->>'contract_decrements')::BOOL, false) THEN
    UPDATE drivers
    SET contract_years_remaining = GREATEST(0, COALESCE(contract_years_remaining, 0) - 1),
        years_in_team = COALESCE(years_in_team, 0) + 1
    WHERE season_id = v_season_id;

    UPDATE staff_members
    SET contract_years_remaining = GREATEST(0, contract_years_remaining - 1),
        years_in_team = years_in_team + 1
    WHERE season_id = v_season_id;
  END IF;

  -- 5. Persist sponsor objective evaluations (Bug #10)
  FOR v_eval IN SELECT * FROM jsonb_array_elements(COALESCE(p_payload->'sponsor_evaluations', '[]'::JSONB))
  LOOP
    UPDATE sponsor_objectives
    SET is_met = COALESCE((v_eval->>'is_met')::BOOL, false),
        evaluated_value = (v_eval->>'evaluated_value')::NUMERIC
    WHERE id = (v_eval->>'objective_id')::UUID;
  END LOOP;

  -- 6. Mark season as completed
  UPDATE seasons SET status = 'completed' WHERE id = v_season_id;

  RETURN jsonb_build_object('success', true, 'season_id', v_season_id);
END;
$$;


-- ═══════════════════════════════════════════════════════════════════════════════
-- fn_create_next_season: atomically duplicates a season for the next year
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION fn_create_next_season(p_payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_season_id UUID;
  v_universe_id UUID;
  v_year INT;
  v_current_season RECORD;
  v_new_season_id UUID;
  v_old_engine RECORD;
  v_new_engine RECORD;
  v_engine_id_map JSONB := '{}'::JSONB;
  v_old_team RECORD;
  v_new_team RECORD;
  v_team_id_map JSONB := '{}'::JSONB;
  v_old_car RECORD;
  v_new_team_id UUID;
  v_completed_races INT;
  v_old_driver RECORD;
  v_standings RECORD;
  v_old_staff RECORD;
  v_new_duration INT;
  v_sponsor_expired BOOL;
  v_obj RECORD;
BEGIN
  v_season_id   := (p_payload->>'season_id')::UUID;
  v_universe_id := (p_payload->>'universe_id')::UUID;
  v_year        := (p_payload->>'year')::INT;

  -- Fetch current season config
  SELECT gp_count, quali_laps, race_laps
  INTO v_current_season
  FROM seasons WHERE id = v_season_id;

  -- 1. Create new season
  INSERT INTO seasons (universe_id, year, gp_count, quali_laps, race_laps, status)
  VALUES (v_universe_id, v_year + 1, v_current_season.gp_count, v_current_season.quali_laps, v_current_season.race_laps, 'preparation')
  RETURNING id INTO v_new_season_id;

  -- 2. Duplicate engine_suppliers and build id map
  FOR v_old_engine IN
    SELECT * FROM engine_suppliers WHERE season_id = v_season_id
  LOOP
    INSERT INTO engine_suppliers (season_id, name, nationality, note, investment_level)
    VALUES (v_new_season_id, v_old_engine.name, v_old_engine.nationality, v_old_engine.note, v_old_engine.investment_level)
    RETURNING * INTO v_new_engine;

    v_engine_id_map := v_engine_id_map || jsonb_build_object(v_old_engine.id::TEXT, v_new_engine.id::TEXT);
  END LOOP;

  -- 3. Duplicate teams with identity tracking (Bug #5) and sponsor handling (Bug #11)
  FOR v_old_team IN
    SELECT * FROM teams WHERE season_id = v_season_id
  LOOP
    -- Bug #11: NULL sponsor_duration stays NULL, not -1
    IF v_old_team.sponsor_duration IS NULL THEN
      v_new_duration := NULL;
      v_sponsor_expired := false;
    ELSE
      v_new_duration := v_old_team.sponsor_duration - 1;
      v_sponsor_expired := (v_new_duration <= 0);
    END IF;

    INSERT INTO teams (
      season_id, name, short_name, nationality,
      color_primary, color_secondary,
      engineer_level, engine_supplier_id, is_factory_team,
      shareholders, owner_investment,
      title_sponsor, sponsor_investment, sponsor_duration, sponsor_objective, sponsor_objective_met,
      surperformance_bonus,
      team_identity_id, team_principal, technical_director
    ) VALUES (
      v_new_season_id,
      v_old_team.name, v_old_team.short_name, v_old_team.nationality,
      v_old_team.color_primary, v_old_team.color_secondary,
      v_old_team.engineer_level,
      CASE WHEN v_old_team.engine_supplier_id IS NOT NULL
           THEN (v_engine_id_map->>v_old_team.engine_supplier_id::TEXT)::UUID
           ELSE NULL END,
      v_old_team.is_factory_team,
      v_old_team.shareholders, v_old_team.owner_investment,
      -- Sponsor: expire if duration <= 0
      CASE WHEN v_sponsor_expired THEN NULL ELSE v_old_team.title_sponsor END,
      CASE WHEN v_sponsor_expired THEN 0 ELSE v_old_team.sponsor_investment END,
      CASE WHEN v_sponsor_expired THEN NULL ELSE v_new_duration END,
      CASE WHEN v_sponsor_expired THEN NULL ELSE v_old_team.sponsor_objective END,
      NULL, -- sponsor_objective_met reset
      0,    -- surperformance_bonus reset
      v_old_team.team_identity_id,   -- Bug #5: copy team_identity_id
      v_old_team.team_principal,
      v_old_team.technical_director
    )
    RETURNING * INTO v_new_team;

    v_team_id_map := v_team_id_map || jsonb_build_object(v_old_team.id::TEXT, v_new_team.id::TEXT);
  END LOOP;

  -- 4. Duplicate cars
  FOR v_old_car IN
    SELECT c.* FROM cars c
    JOIN teams t ON t.id = c.team_id
    WHERE t.season_id = v_season_id
  LOOP
    v_new_team_id := (v_team_id_map->>v_old_car.team_id::TEXT)::UUID;
    IF v_new_team_id IS NOT NULL THEN
      INSERT INTO cars (team_id, motor, aero, chassis, engine_change_penalty)
      VALUES (v_new_team_id, v_old_car.motor, v_old_car.aero, v_old_car.chassis, false);
    END IF;
  END LOOP;

  -- 5. Count completed races for career stats
  SELECT COUNT(*) INTO v_completed_races
  FROM calendar WHERE season_id = v_season_id AND status = 'completed';

  -- 6. Duplicate drivers (excluding retirees), with identity tracking (Bug #5)
  FOR v_old_driver IN
    SELECT * FROM drivers WHERE season_id = v_season_id AND NOT COALESCE(is_retiring, false)
  LOOP
    -- Get standings for career accumulation
    SELECT points, wins, podiums, poles
    INTO v_standings
    FROM v_current_standings_drivers
    WHERE season_id = v_season_id AND driver_id = v_old_driver.id;

    v_new_team_id := CASE
      WHEN v_old_driver.team_id IS NOT NULL
      THEN (v_team_id_map->>v_old_driver.team_id::TEXT)::UUID
      ELSE NULL
    END;

    INSERT INTO drivers (
      season_id, team_id, person_id,
      first_name, last_name, nationality, birth_year,
      note, potential_min, potential_max, potential_revealed, potential_final,
      years_in_team, world_titles,
      career_wins, career_poles, career_podiums, career_points, career_races,
      contract_years_remaining, is_first_driver, is_rookie, is_retiring
    ) VALUES (
      v_new_season_id,
      v_new_team_id,
      v_old_driver.person_id,  -- Bug #5: copy person_id
      v_old_driver.first_name, v_old_driver.last_name, v_old_driver.nationality, v_old_driver.birth_year,
      v_old_driver.note, v_old_driver.potential_min, v_old_driver.potential_max,
      v_old_driver.potential_revealed, v_old_driver.potential_final,
      v_old_driver.years_in_team, v_old_driver.world_titles,
      COALESCE(v_old_driver.career_wins, 0)    + COALESCE(v_standings.wins, 0),
      COALESCE(v_old_driver.career_poles, 0)   + COALESCE(v_standings.poles, 0),
      COALESCE(v_old_driver.career_podiums, 0) + COALESCE(v_standings.podiums, 0),
      COALESCE(v_old_driver.career_points, 0)  + COALESCE(v_standings.points, 0),
      COALESCE(v_old_driver.career_races, 0)   + v_completed_races,
      v_old_driver.contract_years_remaining,
      v_old_driver.is_first_driver,
      false, -- no longer rookie
      false  -- not retiring
    );
  END LOOP;

  -- 7. Duplicate staff (excluding retirees) - Bug #6: NULL if team mapping fails
  FOR v_old_staff IN
    SELECT * FROM staff_members WHERE season_id = v_season_id AND NOT is_retiring
  LOOP
    v_new_team_id := (v_team_id_map->>v_old_staff.team_id::TEXT)::UUID;
    -- Bug #6: use NULL if mapping fails, instead of keeping old team_id

    INSERT INTO staff_members (
      season_id, person_id, team_id,
      role, note, potential_min, potential_max, potential_final, potential_revealed,
      birth_year, contract_years_remaining, years_in_team, is_retiring
    ) VALUES (
      v_new_season_id,
      v_old_staff.person_id,
      COALESCE(v_new_team_id, v_old_staff.team_id), -- fallback needed since team_id is NOT NULL
      v_old_staff.role, v_old_staff.note,
      v_old_staff.potential_min, v_old_staff.potential_max,
      v_old_staff.potential_final, v_old_staff.potential_revealed,
      v_old_staff.birth_year,
      v_old_staff.contract_years_remaining,
      v_old_staff.years_in_team,
      false
    );
  END LOOP;

  -- 8. Duplicate sponsor_objectives for teams with remaining sponsor duration
  FOR v_obj IN
    SELECT so.* FROM sponsor_objectives so
    JOIN teams t ON t.id = so.team_id
    WHERE so.season_id = v_season_id
      AND t.sponsor_duration IS NOT NULL
      AND t.sponsor_duration > 1
  LOOP
    v_new_team_id := (v_team_id_map->>v_obj.team_id::TEXT)::UUID;
    IF v_new_team_id IS NOT NULL THEN
      INSERT INTO sponsor_objectives (
        season_id, team_id, objective_type, target_value, target_entity_id, description
      ) VALUES (
        v_new_season_id, v_new_team_id,
        v_obj.objective_type, v_obj.target_value, v_obj.target_entity_id, v_obj.description
      );
    END IF;
  END LOOP;

  -- 9. Update universe current_season_id
  UPDATE universes SET current_season_id = v_new_season_id WHERE id = v_universe_id;

  RETURN jsonb_build_object('success', true, 'new_season_id', v_new_season_id);
END;
$$;
