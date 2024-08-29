export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      backlink: {
        Row: {
          backlink: string
          dr_0_30: number
          dr_30_60: number
          dr_60_100: number
          id: string
          project_uuid: string
        }
        Insert: {
          backlink: string
          dr_0_30: number
          dr_30_60: number
          dr_60_100: number
          id?: string
          project_uuid: string
        }
        Update: {
          backlink?: string
          dr_0_30?: number
          dr_30_60?: number
          dr_60_100?: number
          id?: string
          project_uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "backlink_project_uuid_fkey"
            columns: ["project_uuid"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
        ]
      }
      blogs: {
        Row: {
          blog_uuid: string
          content: string
          created_at: string | null
          title: string
        }
        Insert: {
          blog_uuid?: string
          content: string
          created_at?: string | null
          title: string
        }
        Update: {
          blog_uuid?: string
          content?: string
          created_at?: string | null
          title?: string
        }
        Relationships: []
      }
      project: {
        Row: {
          createdat: string
          id: string
          name: string
          status: string | null
        }
        Insert: {
          createdat: string
          id?: string
          name: string
          status?: string | null
        }
        Update: {
          createdat?: string
          id?: string
          name?: string
          status?: string | null
        }
        Relationships: []
      }
      project_dr_0_30: {
        Row: {
          backlink_uuid: string
          blog_uuid: string | null
          id: number
          project_uuid: string
          site_uuid: string
        }
        Insert: {
          backlink_uuid: string
          blog_uuid?: string | null
          id?: never
          project_uuid: string
          site_uuid: string
        }
        Update: {
          backlink_uuid?: string
          blog_uuid?: string | null
          id?: never
          project_uuid?: string
          site_uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_dr_0_30_backlink_uuid_fkey"
            columns: ["backlink_uuid"]
            isOneToOne: false
            referencedRelation: "backlink"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_dr_0_30_blog_uuid_fkey"
            columns: ["blog_uuid"]
            isOneToOne: false
            referencedRelation: "blogs"
            referencedColumns: ["blog_uuid"]
          },
          {
            foreignKeyName: "project_dr_0_30_project_uuid_fkey"
            columns: ["project_uuid"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_dr_0_30_site_uuid_fkey"
            columns: ["site_uuid"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      project_dr_30_60: {
        Row: {
          backlink_uuid: string
          blog_uuid: string | null
          id: number
          project_uuid: string
          site_uuid: string
        }
        Insert: {
          backlink_uuid: string
          blog_uuid?: string | null
          id?: never
          project_uuid: string
          site_uuid: string
        }
        Update: {
          backlink_uuid?: string
          blog_uuid?: string | null
          id?: never
          project_uuid?: string
          site_uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_dr_30_60_backlink_uuid_fkey"
            columns: ["backlink_uuid"]
            isOneToOne: false
            referencedRelation: "backlink"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_dr_30_60_blog_uuid_fkey"
            columns: ["blog_uuid"]
            isOneToOne: false
            referencedRelation: "blogs"
            referencedColumns: ["blog_uuid"]
          },
          {
            foreignKeyName: "project_dr_30_60_project_uuid_fkey"
            columns: ["project_uuid"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_dr_30_60_site_uuid_fkey"
            columns: ["site_uuid"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      project_dr_60_100: {
        Row: {
          backlink_url: string
          blog_uuid: string | null
          id: number
          project_uuid: string
          site_uuid: string
        }
        Insert: {
          backlink_url: string
          blog_uuid?: string | null
          id?: never
          project_uuid: string
          site_uuid: string
        }
        Update: {
          backlink_url?: string
          blog_uuid?: string | null
          id?: never
          project_uuid?: string
          site_uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_dr_60_100_backlink_url_fkey"
            columns: ["backlink_url"]
            isOneToOne: false
            referencedRelation: "backlink"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_dr_60_100_blog_uuid_fkey"
            columns: ["blog_uuid"]
            isOneToOne: false
            referencedRelation: "blogs"
            referencedColumns: ["blog_uuid"]
          },
          {
            foreignKeyName: "project_dr_60_100_project_uuid_fkey"
            columns: ["project_uuid"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_dr_60_100_site_uuid_fkey"
            columns: ["site_uuid"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          dr: number
          id: string
          industry: string
          password: string
          site: string
          username: string
        }
        Insert: {
          dr: number
          id?: string
          industry: string
          password: string
          site: string
          username: string
        }
        Update: {
          dr?: number
          id?: string
          industry?: string
          password?: string
          site?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
