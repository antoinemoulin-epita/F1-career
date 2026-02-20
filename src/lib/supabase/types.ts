export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      calendar: {
        Row: {
          circuit_id: string
          created_at: string | null
          id: string
          notable_events: string | null
          rain_probability: number | null
          round_number: number
          season_id: string
          status: Database["public"]["Enums"]["race_status"] | null
          updated_at: string | null
          weather: Database["public"]["Enums"]["weather_type"] | null
        }
        Insert: {
          circuit_id: string
          created_at?: string | null
          id?: string
          notable_events?: string | null
          rain_probability?: number | null
          round_number: number
          season_id: string
          status?: Database["public"]["Enums"]["race_status"] | null
          updated_at?: string | null
          weather?: Database["public"]["Enums"]["weather_type"] | null
        }
        Update: {
          circuit_id?: string
          created_at?: string | null
          id?: string
          notable_events?: string | null
          rain_probability?: number | null
          round_number?: number
          season_id?: string
          status?: Database["public"]["Enums"]["race_status"] | null
          updated_at?: string | null
          weather?: Database["public"]["Enums"]["weather_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_circuit_id_fkey"
            columns: ["circuit_id"]
            isOneToOne: false
            referencedRelation: "circuits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_circuit_id_fkey"
            columns: ["circuit_id"]
            isOneToOne: false
            referencedRelation: "v_circuit_profile"
            referencedColumns: ["circuit_id"]
          },
          {
            foreignKeyName: "calendar_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_engine_supplier_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "calendar_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_person_race_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "calendar_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_person_seasons"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "calendar_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_history"
            referencedColumns: ["season_id"]
          },
        ]
      }
      cars: {
        Row: {
          aero: number
          chassis: number
          created_at: string | null
          engine_change_penalty: boolean | null
          id: string
          motor: number
          team_id: string
          updated_at: string | null
        }
        Insert: {
          aero: number
          chassis: number
          created_at?: string | null
          engine_change_penalty?: boolean | null
          id?: string
          motor: number
          team_id: string
          updated_at?: string | null
        }
        Update: {
          aero?: number
          chassis?: number
          created_at?: string | null
          engine_change_penalty?: boolean | null
          id?: string
          motor?: number
          team_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cars_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: true
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cars_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: true
            referencedRelation: "v_staff_career"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "cars_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: true
            referencedRelation: "v_team_identity_full"
            referencedColumns: ["current_team_id"]
          },
          {
            foreignKeyName: "cars_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: true
            referencedRelation: "v_team_identity_history"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "cars_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: true
            referencedRelation: "v_teams_with_budget"
            referencedColumns: ["id"]
          },
        ]
      }
      circuits: {
        Row: {
          base_rain_probability: number | null
          circuit_type: Database["public"]["Enums"]["circuit_type"] | null
          city: string | null
          country: string
          created_at: string | null
          first_gp_year: number | null
          flag_emoji: string | null
          id: string
          is_active: boolean | null
          key_attribute: Database["public"]["Enums"]["key_attribute"] | null
          name: string
          prestige: number | null
          region_climate: Database["public"]["Enums"]["region_climate"] | null
        }
        Insert: {
          base_rain_probability?: number | null
          circuit_type?: Database["public"]["Enums"]["circuit_type"] | null
          city?: string | null
          country: string
          created_at?: string | null
          first_gp_year?: number | null
          flag_emoji?: string | null
          id?: string
          is_active?: boolean | null
          key_attribute?: Database["public"]["Enums"]["key_attribute"] | null
          name: string
          prestige?: number | null
          region_climate?: Database["public"]["Enums"]["region_climate"] | null
        }
        Update: {
          base_rain_probability?: number | null
          circuit_type?: Database["public"]["Enums"]["circuit_type"] | null
          city?: string | null
          country?: string
          created_at?: string | null
          first_gp_year?: number | null
          flag_emoji?: string | null
          id?: string
          is_active?: boolean | null
          key_attribute?: Database["public"]["Enums"]["key_attribute"] | null
          name?: string
          prestige?: number | null
          region_climate?: Database["public"]["Enums"]["region_climate"] | null
        }
        Relationships: []
      }
      drivers: {
        Row: {
          birth_year: number | null
          career_podiums: number | null
          career_points: number | null
          career_poles: number | null
          career_races: number | null
          career_wins: number | null
          contract_years_remaining: number | null
          created_at: string | null
          first_name: string | null
          id: string
          is_first_driver: boolean | null
          is_retiring: boolean | null
          is_rookie: boolean | null
          last_name: string
          nationality: string | null
          note: number
          person_id: string | null
          potential_final: number | null
          potential_max: number | null
          potential_min: number | null
          potential_revealed: boolean | null
          season_id: string
          team_id: string | null
          updated_at: string | null
          world_titles: number | null
          years_in_team: number | null
        }
        Insert: {
          birth_year?: number | null
          career_podiums?: number | null
          career_points?: number | null
          career_poles?: number | null
          career_races?: number | null
          career_wins?: number | null
          contract_years_remaining?: number | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          is_first_driver?: boolean | null
          is_retiring?: boolean | null
          is_rookie?: boolean | null
          last_name: string
          nationality?: string | null
          note: number
          person_id?: string | null
          potential_final?: number | null
          potential_max?: number | null
          potential_min?: number | null
          potential_revealed?: boolean | null
          season_id: string
          team_id?: string | null
          updated_at?: string | null
          world_titles?: number | null
          years_in_team?: number | null
        }
        Update: {
          birth_year?: number | null
          career_podiums?: number | null
          career_points?: number | null
          career_poles?: number | null
          career_races?: number | null
          career_wins?: number | null
          contract_years_remaining?: number | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          is_first_driver?: boolean | null
          is_retiring?: boolean | null
          is_rookie?: boolean | null
          last_name?: string
          nationality?: string | null
          note?: number
          person_id?: string | null
          potential_final?: number | null
          potential_max?: number | null
          potential_min?: number | null
          potential_revealed?: boolean | null
          season_id?: string
          team_id?: string | null
          updated_at?: string | null
          world_titles?: number | null
          years_in_team?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "person_identities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drivers_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "v_person_career"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "drivers_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "v_staff_career"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "drivers_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drivers_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_engine_supplier_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "drivers_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_person_race_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "drivers_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_person_seasons"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "drivers_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "drivers_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drivers_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "v_staff_career"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "drivers_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_full"
            referencedColumns: ["current_team_id"]
          },
          {
            foreignKeyName: "drivers_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_history"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "drivers_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "v_teams_with_budget"
            referencedColumns: ["id"]
          },
        ]
      }
      engine_suppliers: {
        Row: {
          created_at: string | null
          id: string
          investment_level: number | null
          name: string
          nationality: string | null
          note: number
          season_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          investment_level?: number | null
          name: string
          nationality?: string | null
          note: number
          season_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          investment_level?: number | null
          name?: string
          nationality?: string | null
          note?: number
          season_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "engine_suppliers_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "engine_suppliers_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_engine_supplier_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "engine_suppliers_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_person_race_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "engine_suppliers_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_person_seasons"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "engine_suppliers_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_history"
            referencedColumns: ["season_id"]
          },
        ]
      }
      history_champions: {
        Row: {
          champion_driver_id: string | null
          champion_driver_name: string | null
          champion_driver_points: number | null
          champion_driver_team: string | null
          champion_team_id: string | null
          champion_team_name: string | null
          champion_team_points: number | null
          created_at: string | null
          id: string
          season_summary: string | null
          universe_id: string
          year: number
        }
        Insert: {
          champion_driver_id?: string | null
          champion_driver_name?: string | null
          champion_driver_points?: number | null
          champion_driver_team?: string | null
          champion_team_id?: string | null
          champion_team_name?: string | null
          champion_team_points?: number | null
          created_at?: string | null
          id?: string
          season_summary?: string | null
          universe_id: string
          year: number
        }
        Update: {
          champion_driver_id?: string | null
          champion_driver_name?: string | null
          champion_driver_points?: number | null
          champion_driver_team?: string | null
          champion_team_id?: string | null
          champion_team_name?: string | null
          champion_team_points?: number | null
          created_at?: string | null
          id?: string
          season_summary?: string | null
          universe_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "history_champions_universe_id_fkey"
            columns: ["universe_id"]
            isOneToOne: false
            referencedRelation: "universes"
            referencedColumns: ["id"]
          },
        ]
      }
      narrative_arcs: {
        Row: {
          arc_type: Database["public"]["Enums"]["arc_type"] | null
          created_at: string | null
          description: string | null
          has_branches: boolean | null
          id: string
          importance: number | null
          name: string
          related_driver_ids: string[] | null
          related_team_ids: string[] | null
          resolution_summary: string | null
          resolved_round: number | null
          resolved_season_id: string | null
          started_round: number | null
          started_season_id: string | null
          status: Database["public"]["Enums"]["arc_status"] | null
          universe_id: string
          updated_at: string | null
        }
        Insert: {
          arc_type?: Database["public"]["Enums"]["arc_type"] | null
          created_at?: string | null
          description?: string | null
          has_branches?: boolean | null
          id?: string
          importance?: number | null
          name: string
          related_driver_ids?: string[] | null
          related_team_ids?: string[] | null
          resolution_summary?: string | null
          resolved_round?: number | null
          resolved_season_id?: string | null
          started_round?: number | null
          started_season_id?: string | null
          status?: Database["public"]["Enums"]["arc_status"] | null
          universe_id: string
          updated_at?: string | null
        }
        Update: {
          arc_type?: Database["public"]["Enums"]["arc_type"] | null
          created_at?: string | null
          description?: string | null
          has_branches?: boolean | null
          id?: string
          importance?: number | null
          name?: string
          related_driver_ids?: string[] | null
          related_team_ids?: string[] | null
          resolution_summary?: string | null
          resolved_round?: number | null
          resolved_season_id?: string | null
          started_round?: number | null
          started_season_id?: string | null
          status?: Database["public"]["Enums"]["arc_status"] | null
          universe_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "narrative_arcs_resolved_season_id_fkey"
            columns: ["resolved_season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "narrative_arcs_resolved_season_id_fkey"
            columns: ["resolved_season_id"]
            isOneToOne: false
            referencedRelation: "v_engine_supplier_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "narrative_arcs_resolved_season_id_fkey"
            columns: ["resolved_season_id"]
            isOneToOne: false
            referencedRelation: "v_person_race_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "narrative_arcs_resolved_season_id_fkey"
            columns: ["resolved_season_id"]
            isOneToOne: false
            referencedRelation: "v_person_seasons"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "narrative_arcs_resolved_season_id_fkey"
            columns: ["resolved_season_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "narrative_arcs_started_season_id_fkey"
            columns: ["started_season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "narrative_arcs_started_season_id_fkey"
            columns: ["started_season_id"]
            isOneToOne: false
            referencedRelation: "v_engine_supplier_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "narrative_arcs_started_season_id_fkey"
            columns: ["started_season_id"]
            isOneToOne: false
            referencedRelation: "v_person_race_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "narrative_arcs_started_season_id_fkey"
            columns: ["started_season_id"]
            isOneToOne: false
            referencedRelation: "v_person_seasons"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "narrative_arcs_started_season_id_fkey"
            columns: ["started_season_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "narrative_arcs_universe_id_fkey"
            columns: ["universe_id"]
            isOneToOne: false
            referencedRelation: "universes"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          after_round: number | null
          arc_id: string | null
          content: string | null
          created_at: string | null
          headline: string
          id: string
          importance: number | null
          news_type: Database["public"]["Enums"]["news_type"] | null
          season_id: string
        }
        Insert: {
          after_round?: number | null
          arc_id?: string | null
          content?: string | null
          created_at?: string | null
          headline: string
          id?: string
          importance?: number | null
          news_type?: Database["public"]["Enums"]["news_type"] | null
          season_id: string
        }
        Update: {
          after_round?: number | null
          arc_id?: string | null
          content?: string | null
          created_at?: string | null
          headline?: string
          id?: string
          importance?: number | null
          news_type?: Database["public"]["Enums"]["news_type"] | null
          season_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_arc_id_fkey"
            columns: ["arc_id"]
            isOneToOne: false
            referencedRelation: "narrative_arcs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_engine_supplier_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "news_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_person_race_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "news_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_person_seasons"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "news_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_history"
            referencedColumns: ["season_id"]
          },
        ]
      }
      news_mentions: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          news_id: string
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          news_id: string
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          news_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_mentions_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
        ]
      }
      person_identities: {
        Row: {
          bio: string | null
          birth_year: number | null
          created_at: string | null
          first_name: string
          id: string
          last_name: string
          nationality: string | null
          photo_url: string | null
          role: string
          universe_id: string
        }
        Insert: {
          bio?: string | null
          birth_year?: number | null
          created_at?: string | null
          first_name: string
          id?: string
          last_name: string
          nationality?: string | null
          photo_url?: string | null
          role?: string
          universe_id: string
        }
        Update: {
          bio?: string | null
          birth_year?: number | null
          created_at?: string | null
          first_name?: string
          id?: string
          last_name?: string
          nationality?: string | null
          photo_url?: string | null
          role?: string
          universe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "person_identities_universe_id_fkey"
            columns: ["universe_id"]
            isOneToOne: false
            referencedRelation: "universes"
            referencedColumns: ["id"]
          },
        ]
      }
      points_system: {
        Row: {
          id: string
          points: number
          position: number
          universe_id: string
        }
        Insert: {
          id?: string
          points: number
          position: number
          universe_id: string
        }
        Update: {
          id?: string
          points?: number
          position?: number
          universe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_system_universe_id_fkey"
            columns: ["universe_id"]
            isOneToOne: false
            referencedRelation: "universes"
            referencedColumns: ["id"]
          },
        ]
      }
      predictions_constructors: {
        Row: {
          created_at: string | null
          id: string
          predicted_position: number
          score: number | null
          season_id: string
          team_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          predicted_position: number
          score?: number | null
          season_id: string
          team_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          predicted_position?: number
          score?: number | null
          season_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "predictions_constructors_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictions_constructors_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_engine_supplier_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "predictions_constructors_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_person_race_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "predictions_constructors_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_person_seasons"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "predictions_constructors_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "predictions_constructors_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictions_constructors_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "v_staff_career"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "predictions_constructors_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_full"
            referencedColumns: ["current_team_id"]
          },
          {
            foreignKeyName: "predictions_constructors_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_history"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "predictions_constructors_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "v_teams_with_budget"
            referencedColumns: ["id"]
          },
        ]
      }
      predictions_drivers: {
        Row: {
          created_at: string | null
          driver_id: string
          id: string
          predicted_position: number
          score: number | null
          season_id: string
        }
        Insert: {
          created_at?: string | null
          driver_id: string
          id?: string
          predicted_position: number
          score?: number | null
          season_id: string
        }
        Update: {
          created_at?: string | null
          driver_id?: string
          id?: string
          predicted_position?: number
          score?: number | null
          season_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "predictions_drivers_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictions_drivers_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "v_drivers_with_effective"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictions_drivers_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "v_person_seasons"
            referencedColumns: ["driver_id"]
          },
          {
            foreignKeyName: "predictions_drivers_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictions_drivers_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_engine_supplier_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "predictions_drivers_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_person_race_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "predictions_drivers_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_person_seasons"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "predictions_drivers_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_history"
            referencedColumns: ["season_id"]
          },
        ]
      }
      qualifying_results: {
        Row: {
          created_at: string | null
          driver_id: string
          id: string
          position: number
          race_id: string
        }
        Insert: {
          created_at?: string | null
          driver_id: string
          id?: string
          position: number
          race_id: string
        }
        Update: {
          created_at?: string | null
          driver_id?: string
          id?: string
          position?: number
          race_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "qualifying_results_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qualifying_results_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "v_drivers_with_effective"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qualifying_results_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "v_person_seasons"
            referencedColumns: ["driver_id"]
          },
          {
            foreignKeyName: "qualifying_results_race_id_fkey"
            columns: ["race_id"]
            isOneToOne: false
            referencedRelation: "calendar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qualifying_results_race_id_fkey"
            columns: ["race_id"]
            isOneToOne: false
            referencedRelation: "v_race_summary"
            referencedColumns: ["race_id"]
          },
        ]
      }
      race_results: {
        Row: {
          created_at: string | null
          dnf_lap: number | null
          dnf_reason: string | null
          driver_id: string
          fastest_lap: boolean | null
          finish_position: number | null
          grid_position: number
          id: string
          points: number | null
          race_id: string
          status: Database["public"]["Enums"]["result_status"] | null
        }
        Insert: {
          created_at?: string | null
          dnf_lap?: number | null
          dnf_reason?: string | null
          driver_id: string
          fastest_lap?: boolean | null
          finish_position?: number | null
          grid_position: number
          id?: string
          points?: number | null
          race_id: string
          status?: Database["public"]["Enums"]["result_status"] | null
        }
        Update: {
          created_at?: string | null
          dnf_lap?: number | null
          dnf_reason?: string | null
          driver_id?: string
          fastest_lap?: boolean | null
          finish_position?: number | null
          grid_position?: number
          id?: string
          points?: number | null
          race_id?: string
          status?: Database["public"]["Enums"]["result_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "race_results_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "race_results_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "v_drivers_with_effective"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "race_results_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "v_person_seasons"
            referencedColumns: ["driver_id"]
          },
          {
            foreignKeyName: "race_results_race_id_fkey"
            columns: ["race_id"]
            isOneToOne: false
            referencedRelation: "calendar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "race_results_race_id_fkey"
            columns: ["race_id"]
            isOneToOne: false
            referencedRelation: "v_race_summary"
            referencedColumns: ["race_id"]
          },
        ]
      }
      regulations: {
        Row: {
          affects_aero: boolean | null
          affects_chassis: boolean | null
          affects_motor: boolean | null
          created_at: string | null
          description: string | null
          effective_year: number
          id: string
          name: string | null
          reset_type: Database["public"]["Enums"]["reset_type"] | null
          universe_id: string
        }
        Insert: {
          affects_aero?: boolean | null
          affects_chassis?: boolean | null
          affects_motor?: boolean | null
          created_at?: string | null
          description?: string | null
          effective_year: number
          id?: string
          name?: string | null
          reset_type?: Database["public"]["Enums"]["reset_type"] | null
          universe_id: string
        }
        Update: {
          affects_aero?: boolean | null
          affects_chassis?: boolean | null
          affects_motor?: boolean | null
          created_at?: string | null
          description?: string | null
          effective_year?: number
          id?: string
          name?: string | null
          reset_type?: Database["public"]["Enums"]["reset_type"] | null
          universe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "regulations_universe_id_fkey"
            columns: ["universe_id"]
            isOneToOne: false
            referencedRelation: "universes"
            referencedColumns: ["id"]
          },
        ]
      }
      rookie_pool: {
        Row: {
          available_from_year: number | null
          birth_year: number | null
          created_at: string | null
          drafted: boolean | null
          drafted_season_id: string | null
          drafted_team_name: string | null
          first_name: string | null
          id: string
          last_name: string
          nationality: string | null
          note: number | null
          potential_max: number
          potential_min: number
          universe_id: string
        }
        Insert: {
          available_from_year?: number | null
          birth_year?: number | null
          created_at?: string | null
          drafted?: boolean | null
          drafted_season_id?: string | null
          drafted_team_name?: string | null
          first_name?: string | null
          id?: string
          last_name: string
          nationality?: string | null
          note?: number | null
          potential_max: number
          potential_min: number
          universe_id: string
        }
        Update: {
          available_from_year?: number | null
          birth_year?: number | null
          created_at?: string | null
          drafted?: boolean | null
          drafted_season_id?: string | null
          drafted_team_name?: string | null
          first_name?: string | null
          id?: string
          last_name?: string
          nationality?: string | null
          note?: number | null
          potential_max?: number
          potential_min?: number
          universe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rookie_pool_drafted_season_id_fkey"
            columns: ["drafted_season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rookie_pool_drafted_season_id_fkey"
            columns: ["drafted_season_id"]
            isOneToOne: false
            referencedRelation: "v_engine_supplier_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "rookie_pool_drafted_season_id_fkey"
            columns: ["drafted_season_id"]
            isOneToOne: false
            referencedRelation: "v_person_race_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "rookie_pool_drafted_season_id_fkey"
            columns: ["drafted_season_id"]
            isOneToOne: false
            referencedRelation: "v_person_seasons"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "rookie_pool_drafted_season_id_fkey"
            columns: ["drafted_season_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "rookie_pool_universe_id_fkey"
            columns: ["universe_id"]
            isOneToOne: false
            referencedRelation: "universes"
            referencedColumns: ["id"]
          },
        ]
      }
      seasons: {
        Row: {
          created_at: string | null
          gp_count: number | null
          id: string
          predictions_locked: boolean | null
          quali_laps: number | null
          race_laps: number | null
          status: Database["public"]["Enums"]["season_status"] | null
          universe_id: string
          updated_at: string | null
          year: number
        }
        Insert: {
          created_at?: string | null
          gp_count?: number | null
          id?: string
          predictions_locked?: boolean | null
          quali_laps?: number | null
          race_laps?: number | null
          status?: Database["public"]["Enums"]["season_status"] | null
          universe_id: string
          updated_at?: string | null
          year: number
        }
        Update: {
          created_at?: string | null
          gp_count?: number | null
          id?: string
          predictions_locked?: boolean | null
          quali_laps?: number | null
          race_laps?: number | null
          status?: Database["public"]["Enums"]["season_status"] | null
          universe_id?: string
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "seasons_universe_id_fkey"
            columns: ["universe_id"]
            isOneToOne: false
            referencedRelation: "universes"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsor_objectives: {
        Row: {
          created_at: string | null
          description: string | null
          evaluated_value: number | null
          id: string
          is_met: boolean | null
          objective_type: Database["public"]["Enums"]["objective_type"]
          season_id: string
          target_entity_id: string | null
          target_value: number | null
          team_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          evaluated_value?: number | null
          id?: string
          is_met?: boolean | null
          objective_type: Database["public"]["Enums"]["objective_type"]
          season_id: string
          target_entity_id?: string | null
          target_value?: number | null
          team_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          evaluated_value?: number | null
          id?: string
          is_met?: boolean | null
          objective_type?: Database["public"]["Enums"]["objective_type"]
          season_id?: string
          target_entity_id?: string | null
          target_value?: number | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsor_objectives_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsor_objectives_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_engine_supplier_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "sponsor_objectives_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_person_race_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "sponsor_objectives_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_person_seasons"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "sponsor_objectives_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "sponsor_objectives_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsor_objectives_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "v_staff_career"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "sponsor_objectives_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_full"
            referencedColumns: ["current_team_id"]
          },
          {
            foreignKeyName: "sponsor_objectives_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_history"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "sponsor_objectives_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "v_teams_with_budget"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_members: {
        Row: {
          birth_year: number | null
          contract_years_remaining: number
          created_at: string | null
          id: string
          is_retiring: boolean
          note: number | null
          person_id: string
          potential_final: number | null
          potential_max: number | null
          potential_min: number | null
          potential_revealed: boolean
          role: string
          season_id: string
          team_id: string
          years_in_team: number
        }
        Insert: {
          birth_year?: number | null
          contract_years_remaining?: number
          created_at?: string | null
          id?: string
          is_retiring?: boolean
          note?: number | null
          person_id: string
          potential_final?: number | null
          potential_max?: number | null
          potential_min?: number | null
          potential_revealed?: boolean
          role: string
          season_id: string
          team_id: string
          years_in_team?: number
        }
        Update: {
          birth_year?: number | null
          contract_years_remaining?: number
          created_at?: string | null
          id?: string
          is_retiring?: boolean
          note?: number | null
          person_id?: string
          potential_final?: number | null
          potential_max?: number | null
          potential_min?: number | null
          potential_revealed?: boolean
          role?: string
          season_id?: string
          team_id?: string
          years_in_team?: number
        }
        Relationships: [
          {
            foreignKeyName: "staff_members_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "person_identities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_members_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "v_person_career"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "staff_members_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "v_staff_career"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "staff_members_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_members_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_engine_supplier_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "staff_members_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_person_race_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "staff_members_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_person_seasons"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "staff_members_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "staff_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "v_staff_career"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "staff_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_full"
            referencedColumns: ["current_team_id"]
          },
          {
            foreignKeyName: "staff_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_history"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "staff_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "v_teams_with_budget"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_pool: {
        Row: {
          available_from_year: number | null
          birth_year: number | null
          created_at: string | null
          drafted: boolean | null
          drafted_season_id: string | null
          drafted_team_name: string | null
          first_name: string | null
          id: string
          last_name: string
          nationality: string | null
          note: number | null
          potential_max: number
          potential_min: number
          role: string
          universe_id: string
        }
        Insert: {
          available_from_year?: number | null
          birth_year?: number | null
          created_at?: string | null
          drafted?: boolean | null
          drafted_season_id?: string | null
          drafted_team_name?: string | null
          first_name?: string | null
          id?: string
          last_name: string
          nationality?: string | null
          note?: number | null
          potential_max: number
          potential_min: number
          role: string
          universe_id: string
        }
        Update: {
          available_from_year?: number | null
          birth_year?: number | null
          created_at?: string | null
          drafted?: boolean | null
          drafted_season_id?: string | null
          drafted_team_name?: string | null
          first_name?: string | null
          id?: string
          last_name?: string
          nationality?: string | null
          note?: number | null
          potential_max?: number
          potential_min?: number
          role?: string
          universe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_pool_drafted_season_id_fkey"
            columns: ["drafted_season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_pool_drafted_season_id_fkey"
            columns: ["drafted_season_id"]
            isOneToOne: false
            referencedRelation: "v_engine_supplier_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "staff_pool_drafted_season_id_fkey"
            columns: ["drafted_season_id"]
            isOneToOne: false
            referencedRelation: "v_person_race_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "staff_pool_drafted_season_id_fkey"
            columns: ["drafted_season_id"]
            isOneToOne: false
            referencedRelation: "v_person_seasons"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "staff_pool_drafted_season_id_fkey"
            columns: ["drafted_season_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "staff_pool_universe_id_fkey"
            columns: ["universe_id"]
            isOneToOne: false
            referencedRelation: "universes"
            referencedColumns: ["id"]
          },
        ]
      }
      standings_constructors: {
        Row: {
          after_round: number
          created_at: string | null
          id: string
          podiums: number | null
          points: number | null
          poles: number | null
          position: number
          season_id: string
          team_id: string
          wins: number | null
        }
        Insert: {
          after_round: number
          created_at?: string | null
          id?: string
          podiums?: number | null
          points?: number | null
          poles?: number | null
          position: number
          season_id: string
          team_id: string
          wins?: number | null
        }
        Update: {
          after_round?: number
          created_at?: string | null
          id?: string
          podiums?: number | null
          points?: number | null
          poles?: number | null
          position?: number
          season_id?: string
          team_id?: string
          wins?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "standings_constructors_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "standings_constructors_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_engine_supplier_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "standings_constructors_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_person_race_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "standings_constructors_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_person_seasons"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "standings_constructors_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "standings_constructors_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "standings_constructors_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "v_staff_career"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "standings_constructors_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_full"
            referencedColumns: ["current_team_id"]
          },
          {
            foreignKeyName: "standings_constructors_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_history"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "standings_constructors_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "v_teams_with_budget"
            referencedColumns: ["id"]
          },
        ]
      }
      standings_drivers: {
        Row: {
          after_round: number
          created_at: string | null
          dnfs: number | null
          driver_id: string
          fastest_laps: number | null
          id: string
          podiums: number | null
          points: number | null
          poles: number | null
          position: number
          season_id: string
          wins: number | null
        }
        Insert: {
          after_round: number
          created_at?: string | null
          dnfs?: number | null
          driver_id: string
          fastest_laps?: number | null
          id?: string
          podiums?: number | null
          points?: number | null
          poles?: number | null
          position: number
          season_id: string
          wins?: number | null
        }
        Update: {
          after_round?: number
          created_at?: string | null
          dnfs?: number | null
          driver_id?: string
          fastest_laps?: number | null
          id?: string
          podiums?: number | null
          points?: number | null
          poles?: number | null
          position?: number
          season_id?: string
          wins?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "standings_drivers_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "standings_drivers_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "v_drivers_with_effective"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "standings_drivers_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "v_person_seasons"
            referencedColumns: ["driver_id"]
          },
          {
            foreignKeyName: "standings_drivers_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "standings_drivers_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_engine_supplier_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "standings_drivers_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_person_race_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "standings_drivers_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_person_seasons"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "standings_drivers_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_history"
            referencedColumns: ["season_id"]
          },
        ]
      }
      team_identities: {
        Row: {
          color_primary: string | null
          color_secondary: string | null
          created_at: string | null
          description: string | null
          founded_year: number | null
          id: string
          logo_url: string | null
          name: string
          nationality: string | null
          short_name: string | null
          universe_id: string
        }
        Insert: {
          color_primary?: string | null
          color_secondary?: string | null
          created_at?: string | null
          description?: string | null
          founded_year?: number | null
          id?: string
          logo_url?: string | null
          name: string
          nationality?: string | null
          short_name?: string | null
          universe_id: string
        }
        Update: {
          color_primary?: string | null
          color_secondary?: string | null
          created_at?: string | null
          description?: string | null
          founded_year?: number | null
          id?: string
          logo_url?: string | null
          name?: string
          nationality?: string | null
          short_name?: string | null
          universe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_identities_universe_id_fkey"
            columns: ["universe_id"]
            isOneToOne: false
            referencedRelation: "universes"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          color_primary: string | null
          color_secondary: string | null
          created_at: string | null
          engine_supplier_id: string | null
          engineer_level: number | null
          id: string
          is_factory_team: boolean | null
          name: string
          nationality: string | null
          owner_investment: number | null
          season_id: string
          shareholders: string | null
          short_name: string | null
          sponsor_duration: number | null
          sponsor_investment: number | null
          sponsor_objective: string | null
          sponsor_objective_met: boolean | null
          surperformance_bonus: number | null
          team_identity_id: string | null
          team_principal: string | null
          technical_director: string | null
          title_sponsor: string | null
          updated_at: string | null
        }
        Insert: {
          color_primary?: string | null
          color_secondary?: string | null
          created_at?: string | null
          engine_supplier_id?: string | null
          engineer_level?: number | null
          id?: string
          is_factory_team?: boolean | null
          name: string
          nationality?: string | null
          owner_investment?: number | null
          season_id: string
          shareholders?: string | null
          short_name?: string | null
          sponsor_duration?: number | null
          sponsor_investment?: number | null
          sponsor_objective?: string | null
          sponsor_objective_met?: boolean | null
          surperformance_bonus?: number | null
          team_identity_id?: string | null
          team_principal?: string | null
          technical_director?: string | null
          title_sponsor?: string | null
          updated_at?: string | null
        }
        Update: {
          color_primary?: string | null
          color_secondary?: string | null
          created_at?: string | null
          engine_supplier_id?: string | null
          engineer_level?: number | null
          id?: string
          is_factory_team?: boolean | null
          name?: string
          nationality?: string | null
          owner_investment?: number | null
          season_id?: string
          shareholders?: string | null
          short_name?: string | null
          sponsor_duration?: number | null
          sponsor_investment?: number | null
          sponsor_objective?: string | null
          sponsor_objective_met?: boolean | null
          surperformance_bonus?: number | null
          team_identity_id?: string | null
          team_principal?: string | null
          technical_director?: string | null
          title_sponsor?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_engine_supplier_id_fkey"
            columns: ["engine_supplier_id"]
            isOneToOne: false
            referencedRelation: "engine_suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_engine_supplier_id_fkey"
            columns: ["engine_supplier_id"]
            isOneToOne: false
            referencedRelation: "v_engine_supplier_history"
            referencedColumns: ["engine_supplier_id"]
          },
          {
            foreignKeyName: "teams_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_engine_supplier_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "teams_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_person_race_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "teams_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_person_seasons"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "teams_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "teams_team_identity_id_fkey"
            columns: ["team_identity_id"]
            isOneToOne: false
            referencedRelation: "team_identities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_team_identity_id_fkey"
            columns: ["team_identity_id"]
            isOneToOne: false
            referencedRelation: "v_staff_career"
            referencedColumns: ["team_identity_id"]
          },
          {
            foreignKeyName: "teams_team_identity_id_fkey"
            columns: ["team_identity_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_full"
            referencedColumns: ["team_identity_id"]
          },
        ]
      }
      transfers: {
        Row: {
          arc_id: string | null
          contract_years: number | null
          created_at: string | null
          driver_id: string
          effective_year: number
          from_team_id: string | null
          id: string
          is_first_driver: boolean | null
          season_id: string
          to_team_id: string | null
          transfer_type: Database["public"]["Enums"]["transfer_type"] | null
        }
        Insert: {
          arc_id?: string | null
          contract_years?: number | null
          created_at?: string | null
          driver_id: string
          effective_year: number
          from_team_id?: string | null
          id?: string
          is_first_driver?: boolean | null
          season_id: string
          to_team_id?: string | null
          transfer_type?: Database["public"]["Enums"]["transfer_type"] | null
        }
        Update: {
          arc_id?: string | null
          contract_years?: number | null
          created_at?: string | null
          driver_id?: string
          effective_year?: number
          from_team_id?: string | null
          id?: string
          is_first_driver?: boolean | null
          season_id?: string
          to_team_id?: string | null
          transfer_type?: Database["public"]["Enums"]["transfer_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "transfers_arc_id_fkey"
            columns: ["arc_id"]
            isOneToOne: false
            referencedRelation: "narrative_arcs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "v_drivers_with_effective"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "v_person_seasons"
            referencedColumns: ["driver_id"]
          },
          {
            foreignKeyName: "transfers_from_team_id_fkey"
            columns: ["from_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_from_team_id_fkey"
            columns: ["from_team_id"]
            isOneToOne: false
            referencedRelation: "v_staff_career"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "transfers_from_team_id_fkey"
            columns: ["from_team_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_full"
            referencedColumns: ["current_team_id"]
          },
          {
            foreignKeyName: "transfers_from_team_id_fkey"
            columns: ["from_team_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_history"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "transfers_from_team_id_fkey"
            columns: ["from_team_id"]
            isOneToOne: false
            referencedRelation: "v_teams_with_budget"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_engine_supplier_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "transfers_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_person_race_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "transfers_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_person_seasons"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "transfers_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "transfers_to_team_id_fkey"
            columns: ["to_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_to_team_id_fkey"
            columns: ["to_team_id"]
            isOneToOne: false
            referencedRelation: "v_staff_career"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "transfers_to_team_id_fkey"
            columns: ["to_team_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_full"
            referencedColumns: ["current_team_id"]
          },
          {
            foreignKeyName: "transfers_to_team_id_fkey"
            columns: ["to_team_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_history"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "transfers_to_team_id_fkey"
            columns: ["to_team_id"]
            isOneToOne: false
            referencedRelation: "v_teams_with_budget"
            referencedColumns: ["id"]
          },
        ]
      }
      universes: {
        Row: {
          created_at: string | null
          current_season_id: string | null
          description: string | null
          id: string
          name: string
          start_year: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_season_id?: string | null
          description?: string | null
          id?: string
          name: string
          start_year: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_season_id?: string | null
          description?: string | null
          id?: string
          name?: string
          start_year?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_current_season"
            columns: ["current_season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_current_season"
            columns: ["current_season_id"]
            isOneToOne: false
            referencedRelation: "v_engine_supplier_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "fk_current_season"
            columns: ["current_season_id"]
            isOneToOne: false
            referencedRelation: "v_person_race_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "fk_current_season"
            columns: ["current_season_id"]
            isOneToOne: false
            referencedRelation: "v_person_seasons"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "fk_current_season"
            columns: ["current_season_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_history"
            referencedColumns: ["season_id"]
          },
        ]
      }
    }
    Views: {
      v_cars_with_stats: {
        Row: {
          acceleration: number | null
          aero: number | null
          chassis: number | null
          created_at: string | null
          effective_chassis: number | null
          engine_change_penalty: boolean | null
          grip: number | null
          id: string | null
          motor: number | null
          speed: number | null
          team_id: string | null
          total: number | null
          updated_at: string | null
        }
        Insert: {
          acceleration?: number | null
          aero?: number | null
          chassis?: number | null
          created_at?: string | null
          effective_chassis?: never
          engine_change_penalty?: boolean | null
          grip?: never
          id?: string | null
          motor?: number | null
          speed?: never
          team_id?: string | null
          total?: never
          updated_at?: string | null
        }
        Update: {
          acceleration?: number | null
          aero?: number | null
          chassis?: number | null
          created_at?: string | null
          effective_chassis?: never
          engine_change_penalty?: boolean | null
          grip?: never
          id?: string | null
          motor?: number | null
          speed?: never
          team_id?: string | null
          total?: never
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cars_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: true
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cars_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: true
            referencedRelation: "v_staff_career"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "cars_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: true
            referencedRelation: "v_team_identity_full"
            referencedColumns: ["current_team_id"]
          },
          {
            foreignKeyName: "cars_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: true
            referencedRelation: "v_team_identity_history"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "cars_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: true
            referencedRelation: "v_teams_with_budget"
            referencedColumns: ["id"]
          },
        ]
      }
      v_circuit_profile: {
        Row: {
          base_rain_probability: number | null
          circuit_id: string | null
          circuit_type: Database["public"]["Enums"]["circuit_type"] | null
          city: string | null
          country: string | null
          first_gp_year: number | null
          flag_emoji: string | null
          is_active: boolean | null
          key_attribute: Database["public"]["Enums"]["key_attribute"] | null
          mixed_races: number | null
          name: string | null
          prestige: number | null
          region_climate: Database["public"]["Enums"]["region_climate"] | null
          total_races: number | null
          wet_races: number | null
        }
        Relationships: []
      }
      v_current_standings_constructors: {
        Row: {
          after_round: number | null
          created_at: string | null
          id: string | null
          podiums: number | null
          points: number | null
          poles: number | null
          position: number | null
          season_id: string | null
          team_color: string | null
          team_id: string | null
          team_identity_id: string | null
          team_name: string | null
          wins: number | null
        }
        Relationships: [
          {
            foreignKeyName: "standings_constructors_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "standings_constructors_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_engine_supplier_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "standings_constructors_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_person_race_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "standings_constructors_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_person_seasons"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "standings_constructors_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "standings_constructors_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "standings_constructors_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "v_staff_career"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "standings_constructors_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_full"
            referencedColumns: ["current_team_id"]
          },
          {
            foreignKeyName: "standings_constructors_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_history"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "standings_constructors_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "v_teams_with_budget"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_team_identity_id_fkey"
            columns: ["team_identity_id"]
            isOneToOne: false
            referencedRelation: "team_identities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_team_identity_id_fkey"
            columns: ["team_identity_id"]
            isOneToOne: false
            referencedRelation: "v_staff_career"
            referencedColumns: ["team_identity_id"]
          },
          {
            foreignKeyName: "teams_team_identity_id_fkey"
            columns: ["team_identity_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_full"
            referencedColumns: ["team_identity_id"]
          },
        ]
      }
      v_current_standings_drivers: {
        Row: {
          after_round: number | null
          created_at: string | null
          dnfs: number | null
          driver_id: string | null
          fastest_laps: number | null
          first_name: string | null
          id: string | null
          last_name: string | null
          person_id: string | null
          podiums: number | null
          points: number | null
          poles: number | null
          position: number | null
          season_id: string | null
          team_color: string | null
          team_identity_id: string | null
          team_name: string | null
          wins: number | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "person_identities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drivers_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "v_person_career"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "drivers_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "v_staff_career"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "standings_drivers_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "standings_drivers_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "v_drivers_with_effective"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "standings_drivers_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "v_person_seasons"
            referencedColumns: ["driver_id"]
          },
          {
            foreignKeyName: "standings_drivers_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "standings_drivers_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_engine_supplier_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "standings_drivers_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_person_race_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "standings_drivers_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_person_seasons"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "standings_drivers_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "teams_team_identity_id_fkey"
            columns: ["team_identity_id"]
            isOneToOne: false
            referencedRelation: "team_identities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_team_identity_id_fkey"
            columns: ["team_identity_id"]
            isOneToOne: false
            referencedRelation: "v_staff_career"
            referencedColumns: ["team_identity_id"]
          },
          {
            foreignKeyName: "teams_team_identity_id_fkey"
            columns: ["team_identity_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_full"
            referencedColumns: ["team_identity_id"]
          },
        ]
      }
      v_drivers_with_effective: {
        Row: {
          acclimatation: number | null
          age: number | null
          birth_year: number | null
          career_podiums: number | null
          career_points: number | null
          career_poles: number | null
          career_races: number | null
          career_wins: number | null
          contract_years_remaining: number | null
          created_at: string | null
          effective_note: number | null
          first_name: string | null
          full_name: string | null
          id: string | null
          is_first_driver: boolean | null
          is_retiring: boolean | null
          is_rookie: boolean | null
          last_name: string | null
          nationality: string | null
          note: number | null
          person_id: string | null
          potential_final: number | null
          potential_max: number | null
          potential_min: number | null
          potential_revealed: boolean | null
          season_id: string | null
          team_id: string | null
          updated_at: string | null
          world_titles: number | null
          years_in_team: number | null
        }
        Insert: {
          acclimatation?: never
          age?: never
          birth_year?: number | null
          career_podiums?: number | null
          career_points?: number | null
          career_poles?: number | null
          career_races?: number | null
          career_wins?: number | null
          contract_years_remaining?: number | null
          created_at?: string | null
          effective_note?: never
          first_name?: string | null
          full_name?: never
          id?: string | null
          is_first_driver?: boolean | null
          is_retiring?: boolean | null
          is_rookie?: boolean | null
          last_name?: string | null
          nationality?: string | null
          note?: number | null
          person_id?: string | null
          potential_final?: number | null
          potential_max?: number | null
          potential_min?: number | null
          potential_revealed?: boolean | null
          season_id?: string | null
          team_id?: string | null
          updated_at?: string | null
          world_titles?: number | null
          years_in_team?: number | null
        }
        Update: {
          acclimatation?: never
          age?: never
          birth_year?: number | null
          career_podiums?: number | null
          career_points?: number | null
          career_poles?: number | null
          career_races?: number | null
          career_wins?: number | null
          contract_years_remaining?: number | null
          created_at?: string | null
          effective_note?: never
          first_name?: string | null
          full_name?: never
          id?: string | null
          is_first_driver?: boolean | null
          is_retiring?: boolean | null
          is_rookie?: boolean | null
          last_name?: string | null
          nationality?: string | null
          note?: number | null
          person_id?: string | null
          potential_final?: number | null
          potential_max?: number | null
          potential_min?: number | null
          potential_revealed?: boolean | null
          season_id?: string | null
          team_id?: string | null
          updated_at?: string | null
          world_titles?: number | null
          years_in_team?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "person_identities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drivers_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "v_person_career"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "drivers_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "v_staff_career"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "drivers_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drivers_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_engine_supplier_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "drivers_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_person_race_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "drivers_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_person_seasons"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "drivers_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "drivers_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drivers_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "v_staff_career"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "drivers_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_full"
            referencedColumns: ["current_team_id"]
          },
          {
            foreignKeyName: "drivers_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_history"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "drivers_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "v_teams_with_budget"
            referencedColumns: ["id"]
          },
        ]
      }
      v_engine_supplier_history: {
        Row: {
          client_teams: string | null
          client_teams_count: number | null
          engine_supplier_id: string | null
          has_factory_team: boolean | null
          investment_level: number | null
          name: string | null
          nationality: string | null
          note: number | null
          season_id: string | null
          universe_id: string | null
          year: number | null
        }
        Relationships: [
          {
            foreignKeyName: "seasons_universe_id_fkey"
            columns: ["universe_id"]
            isOneToOne: false
            referencedRelation: "universes"
            referencedColumns: ["id"]
          },
        ]
      }
      v_person_career: {
        Row: {
          best_championship_finish: number | null
          bio: string | null
          birth_year: number | null
          career_races: number | null
          first_name: string | null
          last_name: string | null
          nationality: string | null
          person_id: string | null
          photo_url: string | null
          role: string | null
          seasons_count: number | null
          total_dnfs: number | null
          total_fastest_laps: number | null
          total_podiums: number | null
          total_points: number | null
          total_poles: number | null
          total_wins: number | null
          universe_id: string | null
          world_titles: number | null
        }
        Relationships: [
          {
            foreignKeyName: "person_identities_universe_id_fkey"
            columns: ["universe_id"]
            isOneToOne: false
            referencedRelation: "universes"
            referencedColumns: ["id"]
          },
        ]
      }
      v_person_race_history: {
        Row: {
          circuit_country: string | null
          circuit_name: string | null
          circuit_type: Database["public"]["Enums"]["circuit_type"] | null
          dnf_reason: string | null
          fastest_lap: boolean | null
          finish_position: number | null
          flag_emoji: string | null
          grid_position: number | null
          person_id: string | null
          points: number | null
          quali_position: number | null
          result_status: Database["public"]["Enums"]["result_status"] | null
          round_number: number | null
          season_id: string | null
          team_color: string | null
          team_identity_id: string | null
          team_name: string | null
          weather: Database["public"]["Enums"]["weather_type"] | null
          year: number | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "person_identities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drivers_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "v_person_career"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "drivers_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "v_staff_career"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "teams_team_identity_id_fkey"
            columns: ["team_identity_id"]
            isOneToOne: false
            referencedRelation: "team_identities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_team_identity_id_fkey"
            columns: ["team_identity_id"]
            isOneToOne: false
            referencedRelation: "v_staff_career"
            referencedColumns: ["team_identity_id"]
          },
          {
            foreignKeyName: "teams_team_identity_id_fkey"
            columns: ["team_identity_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_full"
            referencedColumns: ["team_identity_id"]
          },
        ]
      }
      v_person_seasons: {
        Row: {
          career_podiums: number | null
          career_points: number | null
          career_poles: number | null
          career_races: number | null
          career_wins: number | null
          championship_position: number | null
          contract_years_remaining: number | null
          driver_id: string | null
          first_name: string | null
          is_first_driver: boolean | null
          is_retiring: boolean | null
          is_rookie: boolean | null
          last_name: string | null
          note: number | null
          person_id: string | null
          potential_final: number | null
          potential_max: number | null
          potential_min: number | null
          potential_revealed: boolean | null
          season_dnfs: number | null
          season_fastest_laps: number | null
          season_id: string | null
          season_podiums: number | null
          season_points: number | null
          season_poles: number | null
          season_wins: number | null
          team_color: string | null
          team_identity_id: string | null
          team_name: string | null
          world_titles: number | null
          year: number | null
          years_in_team: number | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "person_identities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drivers_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "v_person_career"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "drivers_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "v_staff_career"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "teams_team_identity_id_fkey"
            columns: ["team_identity_id"]
            isOneToOne: false
            referencedRelation: "team_identities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_team_identity_id_fkey"
            columns: ["team_identity_id"]
            isOneToOne: false
            referencedRelation: "v_staff_career"
            referencedColumns: ["team_identity_id"]
          },
          {
            foreignKeyName: "teams_team_identity_id_fkey"
            columns: ["team_identity_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_full"
            referencedColumns: ["team_identity_id"]
          },
        ]
      }
      v_race_summary: {
        Row: {
          circuit_name: string | null
          country: string | null
          dnf_count: number | null
          flag_emoji: string | null
          race_id: string | null
          round_number: number | null
          season_id: string | null
          status: Database["public"]["Enums"]["race_status"] | null
          weather: Database["public"]["Enums"]["weather_type"] | null
          winner: string | null
          year: number | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_engine_supplier_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "calendar_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_person_race_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "calendar_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_person_seasons"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "calendar_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_history"
            referencedColumns: ["season_id"]
          },
        ]
      }
      v_staff_career: {
        Row: {
          bio: string | null
          first_name: string | null
          last_name: string | null
          person_id: string | null
          person_role: string | null
          photo_url: string | null
          season_id: string | null
          staff_role: string | null
          team_championship_position: number | null
          team_color: string | null
          team_id: string | null
          team_identity_id: string | null
          team_name: string | null
          team_season_points: number | null
          universe_id: string | null
          year: number | null
        }
        Relationships: [
          {
            foreignKeyName: "person_identities_universe_id_fkey"
            columns: ["universe_id"]
            isOneToOne: false
            referencedRelation: "universes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_members_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_members_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_engine_supplier_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "staff_members_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_person_race_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "staff_members_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_person_seasons"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "staff_members_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_history"
            referencedColumns: ["season_id"]
          },
        ]
      }
      v_team_identity_full: {
        Row: {
          aero: number | null
          chassis: number | null
          color_primary: string | null
          color_secondary: string | null
          constructor_titles: number | null
          current_season_id: string | null
          current_team_id: string | null
          current_year: number | null
          description: string | null
          engine_change_penalty: boolean | null
          engine_investment: number | null
          engine_name: string | null
          engine_note: number | null
          engine_supplier_id: string | null
          engineer_level: number | null
          founded_year: number | null
          is_factory_team: boolean | null
          logo_url: string | null
          motor: number | null
          name: string | null
          nationality: string | null
          owner_investment: number | null
          shareholders: string | null
          short_name: string | null
          sponsor_duration: number | null
          sponsor_investment: number | null
          sponsor_objective: string | null
          sponsor_objective_met: boolean | null
          surperformance_bonus: number | null
          team_identity_id: string | null
          team_principal: string | null
          technical_director: string | null
          title_sponsor: string | null
          universe_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_identities_universe_id_fkey"
            columns: ["universe_id"]
            isOneToOne: false
            referencedRelation: "universes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_engine_supplier_id_fkey"
            columns: ["engine_supplier_id"]
            isOneToOne: false
            referencedRelation: "engine_suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_engine_supplier_id_fkey"
            columns: ["engine_supplier_id"]
            isOneToOne: false
            referencedRelation: "v_engine_supplier_history"
            referencedColumns: ["engine_supplier_id"]
          },
          {
            foreignKeyName: "teams_season_id_fkey"
            columns: ["current_season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_season_id_fkey"
            columns: ["current_season_id"]
            isOneToOne: false
            referencedRelation: "v_engine_supplier_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "teams_season_id_fkey"
            columns: ["current_season_id"]
            isOneToOne: false
            referencedRelation: "v_person_race_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "teams_season_id_fkey"
            columns: ["current_season_id"]
            isOneToOne: false
            referencedRelation: "v_person_seasons"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "teams_season_id_fkey"
            columns: ["current_season_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_history"
            referencedColumns: ["season_id"]
          },
        ]
      }
      v_team_identity_history: {
        Row: {
          aero: number | null
          championship_position: number | null
          chassis: number | null
          color_primary: string | null
          color_secondary: string | null
          engine_name: string | null
          engine_note: number | null
          engineer_level: number | null
          is_factory_team: boolean | null
          motor: number | null
          season_id: string | null
          season_podiums: number | null
          season_points: number | null
          season_poles: number | null
          season_wins: number | null
          team_id: string | null
          team_identity_id: string | null
          team_name: string | null
          team_principal: string | null
          technical_director: string | null
          title_sponsor: string | null
          universe_id: string | null
          year: number | null
        }
        Relationships: [
          {
            foreignKeyName: "team_identities_universe_id_fkey"
            columns: ["universe_id"]
            isOneToOne: false
            referencedRelation: "universes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_team_identity_id_fkey"
            columns: ["team_identity_id"]
            isOneToOne: false
            referencedRelation: "team_identities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_team_identity_id_fkey"
            columns: ["team_identity_id"]
            isOneToOne: false
            referencedRelation: "v_staff_career"
            referencedColumns: ["team_identity_id"]
          },
          {
            foreignKeyName: "teams_team_identity_id_fkey"
            columns: ["team_identity_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_full"
            referencedColumns: ["team_identity_id"]
          },
        ]
      }
      v_teams_with_budget: {
        Row: {
          budget_total: number | null
          color_primary: string | null
          color_secondary: string | null
          created_at: string | null
          engine_supplier_id: string | null
          engineer_level: number | null
          engineer_stars: string | null
          id: string | null
          is_factory_team: boolean | null
          name: string | null
          nationality: string | null
          owner_investment: number | null
          season_id: string | null
          shareholders: string | null
          short_name: string | null
          sponsor_duration: number | null
          sponsor_investment: number | null
          sponsor_objective: string | null
          sponsor_objective_met: boolean | null
          surperformance_bonus: number | null
          team_identity_id: string | null
          team_principal: string | null
          technical_director: string | null
          title_sponsor: string | null
          updated_at: string | null
        }
        Insert: {
          budget_total?: never
          color_primary?: string | null
          color_secondary?: string | null
          created_at?: string | null
          engine_supplier_id?: string | null
          engineer_level?: number | null
          engineer_stars?: never
          id?: string | null
          is_factory_team?: boolean | null
          name?: string | null
          nationality?: string | null
          owner_investment?: number | null
          season_id?: string | null
          shareholders?: string | null
          short_name?: string | null
          sponsor_duration?: number | null
          sponsor_investment?: number | null
          sponsor_objective?: string | null
          sponsor_objective_met?: boolean | null
          surperformance_bonus?: number | null
          team_identity_id?: string | null
          team_principal?: string | null
          technical_director?: string | null
          title_sponsor?: string | null
          updated_at?: string | null
        }
        Update: {
          budget_total?: never
          color_primary?: string | null
          color_secondary?: string | null
          created_at?: string | null
          engine_supplier_id?: string | null
          engineer_level?: number | null
          engineer_stars?: never
          id?: string | null
          is_factory_team?: boolean | null
          name?: string | null
          nationality?: string | null
          owner_investment?: number | null
          season_id?: string | null
          shareholders?: string | null
          short_name?: string | null
          sponsor_duration?: number | null
          sponsor_investment?: number | null
          sponsor_objective?: string | null
          sponsor_objective_met?: boolean | null
          surperformance_bonus?: number | null
          team_identity_id?: string | null
          team_principal?: string | null
          technical_director?: string | null
          title_sponsor?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_engine_supplier_id_fkey"
            columns: ["engine_supplier_id"]
            isOneToOne: false
            referencedRelation: "engine_suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_engine_supplier_id_fkey"
            columns: ["engine_supplier_id"]
            isOneToOne: false
            referencedRelation: "v_engine_supplier_history"
            referencedColumns: ["engine_supplier_id"]
          },
          {
            foreignKeyName: "teams_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_engine_supplier_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "teams_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_person_race_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "teams_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_person_seasons"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "teams_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_history"
            referencedColumns: ["season_id"]
          },
          {
            foreignKeyName: "teams_team_identity_id_fkey"
            columns: ["team_identity_id"]
            isOneToOne: false
            referencedRelation: "team_identities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_team_identity_id_fkey"
            columns: ["team_identity_id"]
            isOneToOne: false
            referencedRelation: "v_staff_career"
            referencedColumns: ["team_identity_id"]
          },
          {
            foreignKeyName: "teams_team_identity_id_fkey"
            columns: ["team_identity_id"]
            isOneToOne: false
            referencedRelation: "v_team_identity_full"
            referencedColumns: ["team_identity_id"]
          },
        ]
      }
    }
    Functions: {
      fn_calculate_points: {
        Args: { p_position: number; p_universe_id: string }
        Returns: number
      }
      fn_calculate_progression_max: {
        Args: { p_budget: number; p_engineer_level: number }
        Returns: number
      }
      fn_calculate_rain_probability: {
        Args: { p_base_probability: number }
        Returns: number
      }
      fn_seed_default_points: {
        Args: { p_universe_id: string }
        Returns: undefined
      }
    }
    Enums: {
      arc_status: "signal" | "developing" | "confirmed" | "resolved"
      arc_type:
        | "transfer"
        | "rivalry"
        | "technical"
        | "sponsor"
        | "entry_exit"
        | "drama"
        | "regulation"
        | "other"
      circuit_type: "high_speed" | "technical" | "balanced" | "street"
      key_attribute: "speed" | "grip" | "acceleration"
      news_type:
        | "transfer"
        | "technical"
        | "sponsor"
        | "regulation"
        | "injury"
        | "retirement"
        | "other"
        | "on_track"
        | "business"
        | "world"
        | "feeder_series"
        | "personality"
      objective_type:
        | "constructor_position"
        | "driver_position"
        | "wins"
        | "podiums"
        | "points_minimum"
        | "beat_team"
        | "beat_driver"
        | "race_win_at_circuit"
        | "custom"
      race_status: "scheduled" | "qualifying_done" | "completed"
      region_climate:
        | "tropical"
        | "temperate"
        | "desert"
        | "mediterranean"
        | "continental"
      reset_type: "critical" | "important" | "partial"
      result_status: "finished" | "dnf_mechanical" | "dnf_crash" | "dnf_other"
      season_status: "preparation" | "active" | "completed"
      transfer_type: "rumor" | "confirmed"
      weather_type: "dry" | "wet" | "mixed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      arc_status: ["signal", "developing", "confirmed", "resolved"],
      arc_type: [
        "transfer",
        "rivalry",
        "technical",
        "sponsor",
        "entry_exit",
        "drama",
        "regulation",
        "other",
      ],
      circuit_type: ["high_speed", "technical", "balanced", "street"],
      key_attribute: ["speed", "grip", "acceleration"],
      news_type: [
        "transfer",
        "technical",
        "sponsor",
        "regulation",
        "injury",
        "retirement",
        "other",
        "on_track",
        "business",
        "world",
        "feeder_series",
        "personality",
      ],
      objective_type: [
        "constructor_position",
        "driver_position",
        "wins",
        "podiums",
        "points_minimum",
        "beat_team",
        "beat_driver",
        "race_win_at_circuit",
        "custom",
      ],
      race_status: ["scheduled", "qualifying_done", "completed"],
      region_climate: [
        "tropical",
        "temperate",
        "desert",
        "mediterranean",
        "continental",
      ],
      reset_type: ["critical", "important", "partial"],
      result_status: ["finished", "dnf_mechanical", "dnf_crash", "dnf_other"],
      season_status: ["preparation", "active", "completed"],
      transfer_type: ["rumor", "confirmed"],
      weather_type: ["dry", "wet", "mixed"],
    },
  },
} as const
