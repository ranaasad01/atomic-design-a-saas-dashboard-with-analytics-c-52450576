// Auto-generated from the connected Supabase schema. Do not edit by hand.

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          email: string | null
          job_title: string | null
          avatar_url: string | null
          two_fa_enabled: boolean
          password_last_changed_at: string | null
          created_at: string
          updated_at: string
        }
      }
      metrics: {
        Row: {
          id: string
          metric_type: string
          value: number
          dimension: string | null
          recorded_at: string
          created_at: string
        }
      }
      activity_events: {
        Row: {
          id: string
          user_id: string | null
          icon: string | null
          description: string
          occurred_at: string
        }
      }
      reports: {
        Row: {
          id: string
          owner_id: string
          name: string
          type: string
          status: string
          last_run_at: string | null
          is_shared: boolean
          created_at: string
          updated_at: string
        }
      }
      scheduled_reports: {
        Row: {
          id: string
          report_id: string
          owner_id: string
          schedule_cron: string
          schedule_label: string | null
          next_run_at: string | null
          is_active: boolean
          created_at: string
        }
      }
      team_members: {
        Row: {
          id: string
          invited_by: string
          user_id: string | null
          full_name: string
          email: string
          role: string
          status: string
          avatar_initials: string | null
          created_at: string
        }
      }
      faq_items: {
        Row: {
          id: string
          topic: string
          question: string
          answer: string
          sort_order: number
          created_at: string
        }
      }
    }
  }
}