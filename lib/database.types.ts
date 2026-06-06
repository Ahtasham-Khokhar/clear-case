export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface User {
  id: string
  auth_user_id: string
  email: string
  full_name: string
  phone?: string
  role: "citizen" | "police" | "admin"
  badge_number?: string
  station_id?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Case = {
  id: string;
  case_number: string;
  title: string;
  description: string;
  case_type: string;
  priority: string;
  status: string;
  citizen_id: string;
  reporter_id: string; 
  reporter_phone?: string;
  reporter_address?: string;
  assigned_officer_id?: string;
  assigned_station_id?: string;
  incident_date?: string;
  incident_location?: string;
  incident_latitude?: number;
  incident_longitude?: number;
  witness_details?: string;
  evidence_files?: string[];
  created_at: string;
  updated_at: string;
  assigned_at?: string;
  resolved_at?: string | null;
  reporter?: {
    full_name: string;
    phone?: string;
    email?: string;
  };
  assigned_officer?: {
    full_name: string;
    badge_number?: string;
  };
  assigned_station?: {
    name: string;
    phone?: string;
    address?: string;
  };
};

export type CaseUpdate = {
  id: string;
  case_id: string;
  updated_by: string;
  update_type: string;
  message?: string;
  old_status?: string;
  new_status?: string;
  attachments?: Json[];
  created_at: string;
  updated_by_user?: {
    full_name: string;
    role?: string;
  };
};

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<User, "id">>
      }
      cases: {
        Row: Case
        Insert: Omit<Case, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Case, "id">>
      }
      police_stations: {
        Row: {
          id: string;
          name: string;
          address: string;
          phone: string | null;
          email: string | null;
          latitude: number | null;
          longitude: number | null;
          jurisdiction_area: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          phone?: string | null;
          email?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          jurisdiction_area?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          phone?: string | null;
          email?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          jurisdiction_area?: string | null;
          created_at?: string;
        };
      };
      case_updates: {
        Row: {
          id: string;
          case_id: string;
          updated_by: string;
          update_type: string;
          message: string | null;
          old_status: string | null;
          new_status: string | null;
          attachments: Json[];
          created_at: string;
        };
        Insert: {
          id?: string;
          case_id: string;
          updated_by: string;
          update_type: string;
          message?: string | null;
          old_status?: string | null;
          new_status?: string | null;
          attachments?: Json[];
          created_at?: string;
        };
        Update: {
          id?: string;
          case_id?: string;
          updated_by?: string;
          update_type?: string;
          message?: string | null;
          old_status?: string | null;
          new_status?: string | null;
          attachments?: Json[];
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          case_id: string | null;
          title: string;
          message: string;
          type: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          case_id?: string | null;
          title: string;
          message: string;
          type: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          case_id?: string | null;
          title?: string;
          message?: string;
          type?: string;
          is_read?: boolean;
          created_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          chat_id: string;
          sender_id: string;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          chat_id: string;
          sender_id: string;
          message: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          chat_id?: string;
          sender_id?: string;
          message?: string;
          is_read?: boolean;
          created_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          case_id: string | null;
          user_id: string;
          file_name: string;
          file_type: string;
          file_size: number;
          file_url: string;
          document_type: 'evidence' | 'report' | 'witness_statement' | 'official_document' | 'other';
          description: string | null;
          is_confidential: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          case_id?: string | null;
          user_id: string;
          file_name: string;
          file_type: string;
          file_size: number;
          file_url: string;
          document_type: 'evidence' | 'report' | 'witness_statement' | 'official_document' | 'other';
          description?: string | null;
          is_confidential?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          case_id?: string | null;
          user_id?: string;
          file_name?: string;
          file_type?: string;
          file_size?: number;
          file_url?: string;
          document_type?: 'evidence' | 'report' | 'witness_statement' | 'official_document' | 'other';
          description?: string | null;
          is_confidential?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      emergency_alerts: {
        Row: {
          id: string;
          title: string;
          message: string;
          alert_type: 'crime' | 'weather' | 'traffic' | 'missing_person' | 'other';
          severity: 'low' | 'medium' | 'high' | 'critical';
          latitude: number | null;
          longitude: number | null;
          radius_km: number | null;
          created_by: string;
          is_active: boolean;
          created_at: string;
          expires_at: string;
        };
        
        Insert: {
          id?: string;
          title: string;
          message: string;
          alert_type: 'crime' | 'weather' | 'traffic' | 'missing_person' | 'other';
          severity: 'low' | 'medium' | 'high' | 'critical';
          latitude?: number | null;
          longitude?: number | null;
          radius_km?: number | null;
          created_by: string;
          is_active?: boolean;
          created_at?: string;
          expires_at: string;
        };
        Update: {
          id?: string;
          title?: string;
          message?: string;
          alert_type?: 'crime' | 'weather' | 'traffic' | 'missing_person' | 'other';
          severity?: 'low' | 'medium' | 'high' | 'critical';
          latitude?: number | null;
          longitude?: number | null;
          radius_km?: number | null;
          created_by?: string;
          is_active?: boolean;
          created_at?: string;
          expires_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never
    };
    Functions: {
      [_ in never]: never
    };
    Enums: {
      [_ in never]: never
    };
  };
}