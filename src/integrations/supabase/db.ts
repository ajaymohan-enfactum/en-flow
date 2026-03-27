import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Custom database types for the existing shared Supabase schema

export interface DbAccount {
  id: string;
  name: string;
  industry: string | null;
  tier: string | null;
  vendor_flags: any;
  website: string | null;
  primary_contact_name: string | null;
  primary_contact_email: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DbDeal {
  id: string;
  account_id: string | null;
  owner_id: string | null;
  title: string;
  description: string | null;
  stage: string | null;
  value: number | null;
  currency: string | null;
  win_probability: number | null;
  expected_close_date: string | null;
  mdf_eligible: boolean | null;
  mdf_amount: number | null;
  product_lines: any;
  created_at: string | null;
  updated_at: string | null;
}

export interface DbEmployee {
  id: string;
  name: string;
  email: string;
  role: string | null;
  department: string | null;
  status: string | null;
  skills: any;
  created_at: string | null;
  updated_at: string | null;
}

export interface DbVDeal {
  id: string;
  title: string;
  description: string | null;
  stage: string | null;
  value: number | null;
  currency: string | null;
  win_probability: number | null;
  expected_close_date: string | null;
  mdf_eligible: boolean | null;
  mdf_amount: number | null;
  product_lines: any;
  account_id: string | null;
  account_name: string | null;
  industry: string | null;
  tier: string | null;
  account_vendor_flags: Record<string, boolean> | null;
  owner_id: string | null;
  owner_name: string | null;
  owner_email: string | null;
  // Margin fields from v_deals view
  margin_revenue: number | null;
  margin_gp: number | null;
  margin_gp_percent: number | null;
  margin_approved: boolean | null;
  // Legacy/additional margin fields that may be in the view
  revenue: number | null;
  cost_of_goods: number | null;
  cost_of_services: number | null;
  mdf_subsidy: number | null;
  gross_profit: number | null;
  gp_percent: number | null;
  deal_created_at: string | null;
  deal_updated_at: string | null;
}

// Untyped client for querying tables not in the auto-generated schema
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Create a separate untyped client for our custom queries
const rawClient: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Re-export auth from the same client
export { rawClient as db };
