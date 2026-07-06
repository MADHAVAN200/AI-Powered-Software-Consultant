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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      acceptance_criteria: {
        Row: {
          created_at: string
          given_text: string
          id: string
          project_id: string
          requirement_id: string | null
          story_id: string | null
          then_text: string
          updated_at: string
          when_text: string
        }
        Insert: {
          created_at?: string
          given_text: string
          id?: string
          project_id: string
          requirement_id?: string | null
          story_id?: string | null
          then_text: string
          updated_at?: string
          when_text: string
        }
        Update: {
          created_at?: string
          given_text?: string
          id?: string
          project_id?: string
          requirement_id?: string | null
          story_id?: string | null
          then_text?: string
          updated_at?: string
          when_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "acceptance_criteria_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acceptance_criteria_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "requirements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acceptance_criteria_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "user_stories"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_log: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          id: string
          metadata: Json
          project_id: string
          target: string | null
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          id?: string
          metadata?: Json
          project_id: string
          target?: string | null
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          id?: string
          metadata?: Json
          project_id?: string
          target?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_analyses: {
        Row: {
          ambiguities: Json | null
          architecture_recommendation: string | null
          business_impact: Json | null
          completeness_score: number | null
          conflicts: Json | null
          created_at: string
          duplicates: Json | null
          effort_estimation: Json | null
          id: string
          missing_items: Json | null
          project_id: string
          quality_score: number | null
          raw: Json | null
          risks: Json | null
          tech_suggestions: Json | null
        }
        Insert: {
          ambiguities?: Json | null
          architecture_recommendation?: string | null
          business_impact?: Json | null
          completeness_score?: number | null
          conflicts?: Json | null
          created_at?: string
          duplicates?: Json | null
          effort_estimation?: Json | null
          id?: string
          missing_items?: Json | null
          project_id: string
          quality_score?: number | null
          raw?: Json | null
          risks?: Json | null
          tech_suggestions?: Json | null
        }
        Update: {
          ambiguities?: Json | null
          architecture_recommendation?: string | null
          business_impact?: Json | null
          completeness_score?: number | null
          conflicts?: Json | null
          created_at?: string
          duplicates?: Json | null
          effort_estimation?: Json | null
          id?: string
          missing_items?: Json | null
          project_id?: string
          quality_score?: number | null
          raw?: Json | null
          risks?: Json | null
          tech_suggestions?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_analyses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      approvals: {
        Row: {
          comments: string | null
          created_at: string
          id: string
          project_id: string
          requirement_id: string | null
          reviewer_id: string | null
          reviewer_name: string | null
          stage: Database["public"]["Enums"]["approval_stage"]
          status: Database["public"]["Enums"]["approval_status"] | null
          updated_at: string
        }
        Insert: {
          comments?: string | null
          created_at?: string
          id?: string
          project_id: string
          requirement_id?: string | null
          reviewer_id?: string | null
          reviewer_name?: string | null
          stage: Database["public"]["Enums"]["approval_stage"]
          status?: Database["public"]["Enums"]["approval_status"] | null
          updated_at?: string
        }
        Update: {
          comments?: string | null
          created_at?: string
          id?: string
          project_id?: string
          requirement_id?: string | null
          reviewer_id?: string | null
          reviewer_name?: string | null
          stage?: Database["public"]["Enums"]["approval_stage"]
          status?: Database["public"]["Enums"]["approval_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "approvals_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      artifacts: {
        Row: {
          content_md: string | null
          created_at: string
          created_by: string
          id: string
          kind: Database["public"]["Enums"]["artifact_kind"]
          metadata: Json
          project_id: string
          score: number | null
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          content_md?: string | null
          created_at?: string
          created_by: string
          id?: string
          kind: Database["public"]["Enums"]["artifact_kind"]
          metadata?: Json
          project_id: string
          score?: number | null
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          content_md?: string | null
          created_at?: string
          created_by?: string
          id?: string
          kind?: Database["public"]["Enums"]["artifact_kind"]
          metadata?: Json
          project_id?: string
          score?: number | null
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "artifacts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      document_approvals: {
        Row: {
          approver_name: string
          created_at: string
          decided_at: string | null
          document_id: string
          id: string
          notes: string | null
          project_id: string
          stage: string
          status: string
        }
        Insert: {
          approver_name: string
          created_at?: string
          decided_at?: string | null
          document_id: string
          id?: string
          notes?: string | null
          project_id: string
          stage: string
          status?: string
        }
        Update: {
          approver_name?: string
          created_at?: string
          decided_at?: string | null
          document_id?: string
          id?: string
          notes?: string | null
          project_id?: string
          stage?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_approvals_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_approvals_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      document_comments: {
        Row: {
          author_name: string
          body: string
          created_at: string
          document_id: string
          id: string
          project_id: string
          resolved: boolean
        }
        Insert: {
          author_name: string
          body: string
          created_at?: string
          document_id: string
          id?: string
          project_id: string
          resolved?: boolean
        }
        Update: {
          author_name?: string
          body?: string
          created_at?: string
          document_id?: string
          id?: string
          project_id?: string
          resolved?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "document_comments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      document_reviews: {
        Row: {
          completeness_score: number | null
          created_at: string
          document_id: string
          grammar_score: number | null
          id: string
          missing_sections: string[] | null
          overall_score: number | null
          project_id: string
          readability_score: number | null
          suggestions: Json
          summary: string | null
          technical_score: number | null
        }
        Insert: {
          completeness_score?: number | null
          created_at?: string
          document_id: string
          grammar_score?: number | null
          id?: string
          missing_sections?: string[] | null
          overall_score?: number | null
          project_id: string
          readability_score?: number | null
          suggestions?: Json
          summary?: string | null
          technical_score?: number | null
        }
        Update: {
          completeness_score?: number | null
          created_at?: string
          document_id?: string
          grammar_score?: number | null
          id?: string
          missing_sections?: string[] | null
          overall_score?: number | null
          project_id?: string
          readability_score?: number | null
          suggestions?: Json
          summary?: string | null
          technical_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "document_reviews_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_reviews_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      document_sections: {
        Row: {
          content_md: string | null
          created_at: string
          document_id: string
          heading: string
          id: string
          position: number
          project_id: string
          status: Database["public"]["Enums"]["doc_status"]
          updated_at: string
        }
        Insert: {
          content_md?: string | null
          created_at?: string
          document_id: string
          heading: string
          id?: string
          position?: number
          project_id: string
          status?: Database["public"]["Enums"]["doc_status"]
          updated_at?: string
        }
        Update: {
          content_md?: string | null
          created_at?: string
          document_id?: string
          heading?: string
          id?: string
          position?: number
          project_id?: string
          status?: Database["public"]["Enums"]["doc_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_sections_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_sections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      document_templates: {
        Row: {
          category: Database["public"]["Enums"]["doc_category"]
          content_md: string | null
          created_at: string
          description: string | null
          doc_type: string
          id: string
          is_global: boolean
          project_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["doc_category"]
          content_md?: string | null
          created_at?: string
          description?: string | null
          doc_type: string
          id?: string
          is_global?: boolean
          project_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["doc_category"]
          content_md?: string | null
          created_at?: string
          description?: string | null
          doc_type?: string
          id?: string
          is_global?: boolean
          project_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_templates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      document_versions: {
        Row: {
          change_summary: string | null
          content_md: string | null
          created_at: string
          created_by: string | null
          document_id: string
          id: string
          project_id: string
          title: string
          version: number
        }
        Insert: {
          change_summary?: string | null
          content_md?: string | null
          created_at?: string
          created_by?: string | null
          document_id: string
          id?: string
          project_id: string
          title: string
          version: number
        }
        Update: {
          change_summary?: string | null
          content_md?: string | null
          created_at?: string
          created_by?: string | null
          document_id?: string
          id?: string
          project_id?: string
          title?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_versions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          ai_completeness_score: number | null
          ai_grammar_score: number | null
          ai_quality_score: number | null
          ai_technical_score: number | null
          category: Database["public"]["Enums"]["doc_category"]
          content_md: string | null
          created_at: string
          created_by: string | null
          current_version: number
          doc_type: string
          id: string
          linked_artifact_id: string | null
          metadata: Json
          owner_id: string | null
          project_id: string
          reviewer_id: string | null
          status: Database["public"]["Enums"]["doc_status"]
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          ai_completeness_score?: number | null
          ai_grammar_score?: number | null
          ai_quality_score?: number | null
          ai_technical_score?: number | null
          category: Database["public"]["Enums"]["doc_category"]
          content_md?: string | null
          created_at?: string
          created_by?: string | null
          current_version?: number
          doc_type: string
          id?: string
          linked_artifact_id?: string | null
          metadata?: Json
          owner_id?: string | null
          project_id: string
          reviewer_id?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          ai_completeness_score?: number | null
          ai_grammar_score?: number | null
          ai_quality_score?: number | null
          ai_technical_score?: number | null
          category?: Database["public"]["Enums"]["doc_category"]
          content_md?: string | null
          created_at?: string
          created_by?: string | null
          current_version?: number
          doc_type?: string
          id?: string
          linked_artifact_id?: string | null
          metadata?: Json
          owner_id?: string | null
          project_id?: string
          reviewer_id?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_linked_artifact_id_fkey"
            columns: ["linked_artifact_id"]
            isOneToOne: false
            referencedRelation: "artifacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      non_functional_requirements: {
        Row: {
          category: Database["public"]["Enums"]["nfr_category"]
          created_at: string
          description: string | null
          id: string
          metric: string
          priority: Database["public"]["Enums"]["req_priority"] | null
          project_id: string
          target_value: string | null
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["nfr_category"]
          created_at?: string
          description?: string | null
          id?: string
          metric: string
          priority?: Database["public"]["Enums"]["req_priority"] | null
          project_id: string
          target_value?: string | null
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["nfr_category"]
          created_at?: string
          description?: string | null
          id?: string
          metric?: string
          priority?: Database["public"]["Enums"]["req_priority"] | null
          project_id?: string
          target_value?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "non_functional_requirements_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_members: {
        Row: {
          created_at: string
          id: string
          project_id: string
          role: Database["public"]["Enums"]["project_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          role?: Database["public"]["Enums"]["project_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          role?: Database["public"]["Enums"]["project_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_overview: {
        Row: {
          ai_consultant_summary: string | null
          budget: string | null
          business_domain: string | null
          business_opportunity: string | null
          client_name: string | null
          created_at: string
          current_challenges: string | null
          expected_outcome: string | null
          expected_traffic: string | null
          expected_users: string | null
          id: string
          industry: string | null
          methodology: string | null
          priority: Database["public"]["Enums"]["req_priority"] | null
          problem_statement: string | null
          progress: number | null
          project_id: string
          project_type: string | null
          risk_level: string | null
          status: string | null
          tech_preference: string | null
          timeline: string | null
          updated_at: string
          version: string | null
        }
        Insert: {
          ai_consultant_summary?: string | null
          budget?: string | null
          business_domain?: string | null
          business_opportunity?: string | null
          client_name?: string | null
          created_at?: string
          current_challenges?: string | null
          expected_outcome?: string | null
          expected_traffic?: string | null
          expected_users?: string | null
          id?: string
          industry?: string | null
          methodology?: string | null
          priority?: Database["public"]["Enums"]["req_priority"] | null
          problem_statement?: string | null
          progress?: number | null
          project_id: string
          project_type?: string | null
          risk_level?: string | null
          status?: string | null
          tech_preference?: string | null
          timeline?: string | null
          updated_at?: string
          version?: string | null
        }
        Update: {
          ai_consultant_summary?: string | null
          budget?: string | null
          business_domain?: string | null
          business_opportunity?: string | null
          client_name?: string | null
          created_at?: string
          current_challenges?: string | null
          expected_outcome?: string | null
          expected_traffic?: string | null
          expected_users?: string | null
          id?: string
          industry?: string | null
          methodology?: string | null
          priority?: Database["public"]["Enums"]["req_priority"] | null
          problem_statement?: string | null
          progress?: number | null
          project_id?: string
          project_type?: string | null
          risk_level?: string | null
          status?: string | null
          tech_preference?: string | null
          timeline?: string | null
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_overview_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          repo_url: string | null
          status: string
          tech_stack: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          repo_url?: string | null
          status?: string
          tech_stack?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          repo_url?: string | null
          status?: string
          tech_stack?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      quality_scores: {
        Row: {
          apis: number
          architecture: number
          database: number
          documentation: number
          id: string
          maintainability: number
          project_id: string
          requirements: number
          security: number
          testing: number
          ui: number
          updated_at: string
        }
        Insert: {
          apis?: number
          architecture?: number
          database?: number
          documentation?: number
          id?: string
          maintainability?: number
          project_id: string
          requirements?: number
          security?: number
          testing?: number
          ui?: number
          updated_at?: string
        }
        Update: {
          apis?: number
          architecture?: number
          database?: number
          documentation?: number
          id?: string
          maintainability?: number
          project_id?: string
          requirements?: number
          security?: number
          testing?: number
          ui?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quality_scores_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      requirement_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          project_id: string
          requirement_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          project_id: string
          requirement_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          project_id?: string
          requirement_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "requirement_attachments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requirement_attachments_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      requirement_comments: {
        Row: {
          author_id: string | null
          author_name: string | null
          body: string
          created_at: string
          id: string
          project_id: string
          requirement_id: string
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          body: string
          created_at?: string
          id?: string
          project_id: string
          requirement_id: string
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          body?: string
          created_at?: string
          id?: string
          project_id?: string
          requirement_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "requirement_comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requirement_comments_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      requirement_dependencies: {
        Row: {
          created_at: string
          depends_on_id: string
          id: string
          project_id: string
          requirement_id: string
        }
        Insert: {
          created_at?: string
          depends_on_id: string
          id?: string
          project_id: string
          requirement_id: string
        }
        Update: {
          created_at?: string
          depends_on_id?: string
          id?: string
          project_id?: string
          requirement_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "requirement_dependencies_depends_on_id_fkey"
            columns: ["depends_on_id"]
            isOneToOne: false
            referencedRelation: "requirements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requirement_dependencies_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requirement_dependencies_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      requirement_versions: {
        Row: {
          change_summary: string | null
          created_at: string
          created_by: string | null
          id: string
          project_id: string
          requirement_id: string
          snapshot: Json
          version: number
        }
        Insert: {
          change_summary?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          project_id: string
          requirement_id: string
          snapshot: Json
          version: number
        }
        Update: {
          change_summary?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          project_id?: string
          requirement_id?: string
          snapshot?: Json
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "requirement_versions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requirement_versions_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      requirements: {
        Row: {
          ai_estimated_effort: string | null
          business_rule: string | null
          business_value:
            | Database["public"]["Enums"]["req_business_value"]
            | null
          category: Database["public"]["Enums"]["req_category"] | null
          code: string
          complexity: Database["public"]["Enums"]["req_complexity"] | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          inputs: string | null
          module: string | null
          outputs: string | null
          priority: Database["public"]["Enums"]["req_priority"] | null
          project_id: string
          status: Database["public"]["Enums"]["req_status"] | null
          tags: string[] | null
          title: string
          updated_at: string
          validation: string | null
          version: number | null
        }
        Insert: {
          ai_estimated_effort?: string | null
          business_rule?: string | null
          business_value?:
            | Database["public"]["Enums"]["req_business_value"]
            | null
          category?: Database["public"]["Enums"]["req_category"] | null
          code: string
          complexity?: Database["public"]["Enums"]["req_complexity"] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          inputs?: string | null
          module?: string | null
          outputs?: string | null
          priority?: Database["public"]["Enums"]["req_priority"] | null
          project_id: string
          status?: Database["public"]["Enums"]["req_status"] | null
          tags?: string[] | null
          title: string
          updated_at?: string
          validation?: string | null
          version?: number | null
        }
        Update: {
          ai_estimated_effort?: string | null
          business_rule?: string | null
          business_value?:
            | Database["public"]["Enums"]["req_business_value"]
            | null
          category?: Database["public"]["Enums"]["req_category"] | null
          code?: string
          complexity?: Database["public"]["Enums"]["req_complexity"] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          inputs?: string | null
          module?: string | null
          outputs?: string | null
          priority?: Database["public"]["Enums"]["req_priority"] | null
          project_id?: string
          status?: Database["public"]["Enums"]["req_status"] | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          validation?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "requirements_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      stakeholders: {
        Row: {
          created_at: string
          email: string | null
          id: string
          notes: string | null
          person_name: string
          project_id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          notes?: string | null
          person_name: string
          project_id: string
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          notes?: string | null
          person_name?: string
          project_id?: string
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stakeholders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_stories: {
        Row: {
          as_role: string
          code: string
          created_at: string
          epic: string | null
          i_want: string
          id: string
          priority: Database["public"]["Enums"]["req_priority"] | null
          project_id: string
          requirement_id: string | null
          risk: string | null
          so_that: string | null
          sprint: string | null
          status: Database["public"]["Enums"]["story_status"] | null
          story_points: number | null
          updated_at: string
        }
        Insert: {
          as_role: string
          code: string
          created_at?: string
          epic?: string | null
          i_want: string
          id?: string
          priority?: Database["public"]["Enums"]["req_priority"] | null
          project_id: string
          requirement_id?: string | null
          risk?: string | null
          so_that?: string | null
          sprint?: string | null
          status?: Database["public"]["Enums"]["story_status"] | null
          story_points?: number | null
          updated_at?: string
        }
        Update: {
          as_role?: string
          code?: string
          created_at?: string
          epic?: string | null
          i_want?: string
          id?: string
          priority?: Database["public"]["Enums"]["req_priority"] | null
          project_id?: string
          requirement_id?: string | null
          risk?: string | null
          so_that?: string | null
          sprint?: string | null
          status?: Database["public"]["Enums"]["story_status"] | null
          story_points?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_stories_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_stories_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "requirements"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_project_member: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
      }
      project_role_of: {
        Args: { _project_id: string; _user_id: string }
        Returns: Database["public"]["Enums"]["project_role"]
      }
    }
    Enums: {
      app_role: "admin" | "member"
      approval_stage:
        | "business_review"
        | "technical_review"
        | "architecture_review"
        | "qa_review"
        | "client_approval"
      approval_status: "pending" | "approved" | "rejected" | "changes_requested"
      artifact_kind:
        | "srs"
        | "brd"
        | "prd"
        | "user_stories"
        | "tech_design"
        | "api_docs"
        | "architecture_doc"
        | "database_doc"
        | "deployment_guide"
        | "user_manual"
        | "architecture_review"
        | "repo_review"
        | "uiux_review"
        | "database_review"
        | "api_review"
        | "test_cases"
        | "risk_analysis"
        | "security_review"
        | "knowledge_note"
      doc_category:
        | "business"
        | "technical"
        | "architecture"
        | "api"
        | "database"
        | "user"
        | "ai"
        | "testing"
        | "deployment"
        | "operations"
        | "compliance"
      doc_status:
        | "draft"
        | "in_review"
        | "approved"
        | "needs_update"
        | "archived"
      nfr_category:
        | "performance"
        | "security"
        | "scalability"
        | "availability"
        | "accessibility"
        | "localization"
        | "maintainability"
        | "compliance"
        | "monitoring"
        | "logging"
        | "backup"
        | "recovery"
        | "encryption"
      project_role: "owner" | "editor" | "reviewer" | "viewer"
      req_business_value: "high" | "medium" | "low"
      req_category: "functional" | "non_functional" | "business"
      req_complexity: "easy" | "medium" | "hard"
      req_priority: "critical" | "high" | "medium" | "low"
      req_status: "draft" | "review" | "approved" | "rejected" | "implemented"
      story_status: "draft" | "ready" | "in_progress" | "done" | "blocked"
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
      app_role: ["admin", "member"],
      approval_stage: [
        "business_review",
        "technical_review",
        "architecture_review",
        "qa_review",
        "client_approval",
      ],
      approval_status: ["pending", "approved", "rejected", "changes_requested"],
      artifact_kind: [
        "srs",
        "brd",
        "prd",
        "user_stories",
        "tech_design",
        "api_docs",
        "architecture_doc",
        "database_doc",
        "deployment_guide",
        "user_manual",
        "architecture_review",
        "repo_review",
        "uiux_review",
        "database_review",
        "api_review",
        "test_cases",
        "risk_analysis",
        "security_review",
        "knowledge_note",
      ],
      doc_category: [
        "business",
        "technical",
        "architecture",
        "api",
        "database",
        "user",
        "ai",
        "testing",
        "deployment",
        "operations",
        "compliance",
      ],
      doc_status: [
        "draft",
        "in_review",
        "approved",
        "needs_update",
        "archived",
      ],
      nfr_category: [
        "performance",
        "security",
        "scalability",
        "availability",
        "accessibility",
        "localization",
        "maintainability",
        "compliance",
        "monitoring",
        "logging",
        "backup",
        "recovery",
        "encryption",
      ],
      project_role: ["owner", "editor", "reviewer", "viewer"],
      req_business_value: ["high", "medium", "low"],
      req_category: ["functional", "non_functional", "business"],
      req_complexity: ["easy", "medium", "hard"],
      req_priority: ["critical", "high", "medium", "low"],
      req_status: ["draft", "review", "approved", "rejected", "implemented"],
      story_status: ["draft", "ready", "in_progress", "done", "blocked"],
    },
  },
} as const
