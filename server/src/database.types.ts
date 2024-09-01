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
      api_keys: {
        Row: {
          id: string
          key: string
          message: string | null
          requests_remaining: number
          requests_reset_time: string
          state: boolean
          tokens_remaining: number
          tokens_reset_time: string
        }
        Insert: {
          id: string
          key: string
          message?: string | null
          requests_remaining: number
          requests_reset_time: string
          state?: boolean
          tokens_remaining: number
          tokens_reset_time: string
        }
        Update: {
          id?: string
          key?: string
          message?: string | null
          requests_remaining?: number
          requests_reset_time?: string
          state?: boolean
          tokens_remaining?: number
          tokens_reset_time?: string
        }
        Relationships: []
      }
      backlink: {
        Row: {
          backlink: string
          dr_0_30: number
          dr_30_60: number
          dr_60_100: number
          id: string
          industry: string
          primary_keyword: string
          project_uuid: string
          seconday_keyword: string
        }
        Insert: {
          backlink: string
          dr_0_30: number
          dr_30_60: number
          dr_60_100: number
          id: string
          industry: string
          primary_keyword: string
          project_uuid: string
          seconday_keyword: string
        }
        Update: {
          backlink?: string
          dr_0_30?: number
          dr_30_60?: number
          dr_60_100?: number
          id?: string
          industry?: string
          primary_keyword?: string
          project_uuid?: string
          seconday_keyword?: string
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
          backlink_uuid: string
          content: string
          created_at: string | null
          id: string
          project_uuid: string
          title: string
        }
        Insert: {
          backlink_uuid: string
          content: string
          created_at?: string | null
          id?: string
          project_uuid: string
          title: string
        }
        Update: {
          backlink_uuid?: string
          content?: string
          created_at?: string | null
          id?: string
          project_uuid?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "blogs_backlink_uuid_fkey"
            columns: ["backlink_uuid"]
            isOneToOne: false
            referencedRelation: "backlink"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blogs_project_uuid_fkey"
            columns: ["project_uuid"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
        ]
      }
      project: {
        Row: {
          createdat: string
          id: string
          message: string
          name: string
          token: number
        }
        Insert: {
          createdat: string
          id?: string
          message: string
          name: string
          token: number
        }
        Update: {
          createdat?: string
          id?: string
          message?: string
          name?: string
          token?: number
        }
        Relationships: []
      }
      sites: {
        Row: {
          dr: number
          id: string
          industry: string
          password: string
          project_uuid: string
          url: string
          username: string
        }
        Insert: {
          dr: number
          id?: string
          industry: string
          password: string
          project_uuid: string
          url: string
          username: string
        }
        Update: {
          dr?: number
          id?: string
          industry?: string
          password?: string
          project_uuid?: string
          url?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "sites_project_uuid_fkey"
            columns: ["project_uuid"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
        ]
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
