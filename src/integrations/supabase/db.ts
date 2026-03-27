// Custom database types for the existing shared Supabase schema
// (The auto-generated types.ts is read-only, so we define our own)

import { supabase } from './client';

// Row types matching the existing database
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
  // Deal fields
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
  // Account fields (from join)
  account_id: string | null;
  account_name: string | null;
  industry: string | null;
  tier: string | null;
  // Owner fields (from join)
  owner_id: string | null;
  owner_name: string | null;
  owner_email: string | null;
  // Margin fields (from join)
  revenue: number | null;
  cost_of_goods: number | null;
  cost_of_services: number | null;
  mdf_subsidy: number | null;
  gross_profit: number | null;
  gp_percent: number | null;
  margin_approved: boolean | null;
  // Timestamps
  deal_created_at: string | null;
  deal_updated_at: string | null;
}

export interface DbEvent {
  id: string;
  occurred_at: string | null;
  module: string | null;
  entity_type: string | null;
  entity_id: string | null;
  event_type: string | null;
  payload: any;
  actor_id: string | null;
  ai_triggered: boolean | null;
}

// Typed query helpers that bypass the auto-generated types
export function queryAccounts() {
  return supabase.from('accounts' as any);
}

export function queryDeals() {
  return supabase.from('deals' as any);
}

export function queryVDeals() {
  return supabase.from('v_deals' as any);
}

export function queryEmployees() {
  return supabase.from('employees' as any);
}

export function queryEvents() {
  return supabase.from('events' as any);
}
