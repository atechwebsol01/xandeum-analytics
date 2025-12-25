export interface Database {
  public: {
    Tables: {
      network_snapshots: {
        Row: {
          id: string;
          created_at: string;
          total_nodes: number;
          online_nodes: number;
          offline_nodes: number;
          warning_nodes: number;
          total_storage_committed: number;
          total_storage_used: number;
          average_credits: number;
          total_credits: number;
          average_xscore: number;
          version_distribution: Record<string, number>;
        };
        Insert: Omit<Database['public']['Tables']['network_snapshots']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['network_snapshots']['Insert']>;
      };
      node_snapshots: {
        Row: {
          id: string;
          created_at: string;
          pubkey: string;
          status: 'online' | 'warning' | 'offline';
          credits: number;
          xscore: number;
          uptime: number;
          storage_committed: number;
          storage_used: number;
          version: string;
          ip: string;
        };
        Insert: Omit<Database['public']['Tables']['node_snapshots']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['node_snapshots']['Insert']>;
      };
      activity_heatmap: {
        Row: {
          id: string;
          created_at: string;
          pubkey: string;
          hour: number;
          day_of_week: number;
          activity_count: number;
          average_status: number;
        };
        Insert: Omit<Database['public']['Tables']['activity_heatmap']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['activity_heatmap']['Insert']>;
      };
      telegram_subscribers: {
        Row: {
          id: string;
          created_at: string;
          chat_id: string;
          watched_nodes: string[];
          alert_on_offline: boolean;
          alert_on_warning: boolean;
          alert_on_credits_drop: boolean;
          is_active: boolean;
        };
        Insert: Omit<Database['public']['Tables']['telegram_subscribers']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['telegram_subscribers']['Insert']>;
      };
      node_alerts: {
        Row: {
          id: string;
          created_at: string;
          pubkey: string;
          alert_type: 'offline' | 'warning' | 'credits_drop' | 'back_online';
          message: string;
          resolved: boolean;
          resolved_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['node_alerts']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['node_alerts']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type NetworkSnapshot = Database['public']['Tables']['network_snapshots']['Row'];
export type NodeSnapshot = Database['public']['Tables']['node_snapshots']['Row'];
export type ActivityHeatmap = Database['public']['Tables']['activity_heatmap']['Row'];
export type TelegramSubscriber = Database['public']['Tables']['telegram_subscribers']['Row'];
export type NodeAlert = Database['public']['Tables']['node_alerts']['Row'];
