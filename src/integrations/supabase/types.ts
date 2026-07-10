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
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          resource_id: string | null
          resource_type: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          resource_id?: string | null
          resource_type?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          resource_id?: string | null
          resource_type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      banners: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
        }
        Relationships: []
      }
      branches: {
        Row: {
          access_pin: string
          address: string
          avg_prep_time_minutes: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          latitude: number
          longitude: number
          name: string
          phone: string | null
          slug: string
        }
        Insert: {
          access_pin?: string
          address: string
          avg_prep_time_minutes?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          latitude: number
          longitude: number
          name: string
          phone?: string | null
          slug: string
        }
        Update: {
          access_pin?: string
          address?: string
          avg_prep_time_minutes?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number
          longitude?: number
          name?: string
          phone?: string | null
          slug?: string
        }
        Relationships: []
      }
      login_sessions: {
        Row: {
          id: string
          identifier: string | null
          ip_address: string | null
          is_active: boolean | null
          last_active: string | null
          location: string | null
          login_time: string | null
          user_agent: string | null
          user_type: string
        }
        Insert: {
          id?: string
          identifier?: string | null
          ip_address?: string | null
          is_active?: boolean | null
          last_active?: string | null
          location?: string | null
          login_time?: string | null
          user_agent?: string | null
          user_type: string
        }
        Update: {
          id?: string
          identifier?: string | null
          ip_address?: string | null
          is_active?: boolean | null
          last_active?: string | null
          location?: string | null
          login_time?: string | null
          user_agent?: string | null
          user_type?: string
        }
        Relationships: []
      }
      master_admin_settings: {
        Row: {
          developer_pin: string
          finance_pin: string
          id: number
          pin: string
          updated_at: string | null
        }
        Insert: {
          developer_pin?: string
          finance_pin?: string
          id?: number
          pin?: string
          updated_at?: string | null
        }
        Update: {
          developer_pin?: string
          finance_pin?: string
          id?: number
          pin?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          available: boolean | null
          available_branches: string[] | null
          available_kemang: boolean | null
          available_senopati: boolean | null
          branch: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          options: Json | null
          price: number
        }
        Insert: {
          available?: boolean | null
          available_branches?: string[] | null
          available_kemang?: boolean | null
          available_senopati?: boolean | null
          branch?: string | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          options?: Json | null
          price?: number
        }
        Update: {
          available?: boolean | null
          available_branches?: string[] | null
          available_kemang?: boolean | null
          available_senopati?: boolean | null
          branch?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          options?: Json | null
          price?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          content: string
          created_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          title: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          title: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          title?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          menu_item_id: string
          name: string
          order_id: string
          price: number
          qty: number
        }
        Insert: {
          created_at?: string
          id?: string
          menu_item_id: string
          name: string
          order_id: string
          price: number
          qty?: number
        }
        Update: {
          created_at?: string
          id?: string
          menu_item_id?: string
          name?: string
          order_id?: string
          price?: number
          qty?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          agreed_terms: boolean | null
          branch: string | null
          branch_id: string | null
          created_at: string
          customer_address: string | null
          customer_lat: number | null
          customer_lng: number | null
          customer_name: string | null
          customer_phone: string | null
          driver_type: string | null
          estimated_arrival_minutes: number | null
          id: string
          needs_bag: boolean | null
          note: string | null
          order_source: string | null
          order_type: string | null
          payment_channel: string | null
          payment_code: string | null
          payment_instructions: Json | null
          payment_method_code: string | null
          payment_qr_url: string | null
          payment_reference: string | null
          payment_url: string | null
          queue_number: number | null
          status: string
          table_number: number
          total: number
          voucher_id: string | null
        }
        Insert: {
          agreed_terms?: boolean | null
          branch?: string | null
          branch_id?: string | null
          created_at?: string
          customer_address?: string | null
          customer_lat?: number | null
          customer_lng?: number | null
          customer_name?: string | null
          customer_phone?: string | null
          driver_type?: string | null
          estimated_arrival_minutes?: number | null
          id?: string
          needs_bag?: boolean | null
          note?: string | null
          order_source?: string | null
          order_type?: string | null
          payment_channel?: string | null
          payment_code?: string | null
          payment_instructions?: Json | null
          payment_method_code?: string | null
          payment_qr_url?: string | null
          payment_reference?: string | null
          payment_url?: string | null
          queue_number?: number | null
          status?: string
          table_number: number
          total?: number
          voucher_id?: string | null
        }
        Update: {
          agreed_terms?: boolean | null
          branch?: string | null
          branch_id?: string | null
          created_at?: string
          customer_address?: string | null
          customer_lat?: number | null
          customer_lng?: number | null
          customer_name?: string | null
          customer_phone?: string | null
          driver_type?: string | null
          estimated_arrival_minutes?: number | null
          id?: string
          needs_bag?: boolean | null
          note?: string | null
          order_source?: string | null
          order_type?: string | null
          payment_channel?: string | null
          payment_code?: string | null
          payment_instructions?: Json | null
          payment_method_code?: string | null
          payment_qr_url?: string | null
          payment_reference?: string | null
          payment_url?: string | null
          queue_number?: number | null
          status?: string
          table_number?: number
          total?: number
          voucher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "vouchers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          name: string
          phone: string
          pin: string | null
          points: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name: string
          phone: string
          pin?: string | null
          points?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string
          phone?: string
          pin?: string | null
          points?: number | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          branch_id: string | null
          comment: string | null
          created_at: string
          id: string
          order_id: string
          product_ratings: Json | null
          rating: number
          tags: string[] | null
        }
        Insert: {
          branch_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          order_id: string
          product_ratings?: Json | null
          rating: number
          tags?: string[] | null
        }
        Update: {
          branch_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          order_id?: string
          product_ratings?: Json | null
          rating?: number
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      system_logs: {
        Row: {
          context: Json | null
          created_at: string | null
          id: string
          level: string
          message: string
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          id?: string
          level: string
          message: string
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          id?: string
          level?: string
          message?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string | null
          value?: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      vouchers: {
        Row: {
          code: string
          created_at: string | null
          discount_amount: number
          discount_type: string
          id: string
          is_active: boolean | null
          is_permanent: boolean | null
          is_visual: boolean | null
          min_order_amount: number | null
          points_required: number | null
          title: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          discount_amount: number
          discount_type: string
          id?: string
          is_active?: boolean | null
          is_permanent?: boolean | null
          is_visual?: boolean | null
          min_order_amount?: number | null
          points_required?: number | null
          title?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          discount_amount?: number
          discount_type?: string
          id?: string
          is_active?: boolean | null
          is_permanent?: boolean | null
          is_visual?: boolean | null
          min_order_amount?: number | null
          points_required?: number | null
          title?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      clear_old_logs: { Args: never; Returns: Json }
      get_setting_pin_secure: {
        Args: { p_master_pin: string; p_type: string }
        Returns: string
      }
      get_system_metrics: { Args: never; Returns: Json }
      update_admin_access_pin: { Args: { p_new_pin: string }; Returns: boolean }
      update_developer_pin: { Args: { p_new_pin: string }; Returns: boolean }
      update_finance_pin: { Args: { p_new_pin: string }; Returns: boolean }
      update_master_admin_pin: { Args: { p_new_pin: string }; Returns: boolean }
      update_outlet_pin: {
        Args: { p_new_pin: string; p_slug: string }
        Returns: boolean
      }
      verify_admin_access_pin: { Args: { p_pin: string }; Returns: boolean }
      verify_developer_pin: { Args: { p_pin: string }; Returns: boolean }
      verify_finance_pin: { Args: { p_pin: string }; Returns: boolean }
      verify_master_admin_pin: { Args: { p_pin: string }; Returns: boolean }
      verify_outlet_pin: {
        Args: { p_pin: string; p_slug: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
