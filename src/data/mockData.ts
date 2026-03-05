import {
  User, Account, Contact, Opportunity, StageHistoryEntry,
  Activity, Artifact, Task, StageRule
} from '@/types';

// Users
export const mockUsers: User[] = [
  { id: 'u1', name: 'Alex Chen', email: 'alex@enfactum.com', role: 'admin', active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'u2', name: 'Sarah Lim', email: 'sarah@enfactum.com', role: 'sales_bd', active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'u3', name: 'Raj Patel', email: 'raj@enfactum.com', role: 'sales_bd', active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'u4', name: 'Maria Santos', email: 'maria@enfactum.com', role: 'delivery', active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'u5', name: 'Viewer User', email: 'viewer@enfactum.com', role: 'readonly', active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
];

// Accounts
export const mockAccounts: Account[] = [
  { id: 'a1', account_name: 'DBS Bank', country: 'Singapore', sector: 'Financial Services', website: 'https://dbs.com', tier: 'A', icp_fit: 'High', strategic_logo: true, last_activity_at: '2025-02-28', created_at: '2024-06-01', updated_at: '2025-02-28' },
  { id: 'a2', account_name: 'Grab Holdings', country: 'Singapore', sector: 'Technology', website: 'https://grab.com', tier: 'A', icp_fit: 'High', strategic_logo: true, last_activity_at: '2025-03-01', created_at: '2024-03-15', updated_at: '2025-03-01' },
  { id: 'a3', account_name: 'Petronas', country: 'Malaysia', sector: 'Energy', website: 'https://petronas.com', tier: 'A', icp_fit: 'Medium', strategic_logo: true, last_activity_at: '2025-02-20', created_at: '2024-07-01', updated_at: '2025-02-20' },
  { id: 'a4', account_name: 'Shopee', country: 'Singapore', sector: 'E-Commerce', website: 'https://shopee.com', tier: 'B', icp_fit: 'High', strategic_logo: false, last_activity_at: '2025-02-15', created_at: '2024-09-01', updated_at: '2025-02-15' },
  { id: 'a5', account_name: 'AIA Group', country: 'Hong Kong', sector: 'Insurance', website: 'https://aia.com', tier: 'B', icp_fit: 'Medium', strategic_logo: false, last_activity_at: '2025-01-20', created_at: '2024-11-01', updated_at: '2025-01-20' },
  { id: 'a6', account_name: 'Telkomsel', country: 'Indonesia', sector: 'Telecommunications', website: 'https://telkomsel.com', tier: 'B', icp_fit: 'Low', strategic_logo: false, last_activity_at: '2025-01-10', created_at: '2024-10-15', updated_at: '2025-01-10' },
  { id: 'a7', account_name: 'Bangkok Bank', country: 'Thailand', sector: 'Financial Services', tier: 'C', icp_fit: 'Medium', strategic_logo: false, last_activity_at: '2024-12-15', created_at: '2024-12-01', updated_at: '2024-12-15' },
];

// Contacts
export const mockContacts: Contact[] = [
  { id: 'c1', account_id: 'a1', contact_name: 'James Wong', title: 'Head of Marketing', email: 'james.wong@dbs.com', created_at: '2024-06-01', updated_at: '2024-06-01' },
  { id: 'c2', account_id: 'a1', contact_name: 'Linda Tan', title: 'VP Brand Strategy', email: 'linda.tan@dbs.com', created_at: '2024-06-15', updated_at: '2024-06-15' },
  { id: 'c3', account_id: 'a2', contact_name: 'Kevin Lee', title: 'Regional Marketing Director', email: 'kevin.lee@grab.com', created_at: '2024-03-15', updated_at: '2024-03-15' },
  { id: 'c4', account_id: 'a3', contact_name: 'Ahmad Razak', title: 'GM Communications', email: 'ahmad@petronas.com', created_at: '2024-07-01', updated_at: '2024-07-01' },
  { id: 'c5', account_id: 'a4', contact_name: 'Michelle Cheng', title: 'Marketing Manager', email: 'michelle@shopee.com', created_at: '2024-09-01', updated_at: '2024-09-01' },
  { id: 'c6', account_id: 'a5', contact_name: 'David Park', title: 'Chief Marketing Officer', email: 'david.park@aia.com', created_at: '2024-11-01', updated_at: '2024-11-01' },
];

// Opportunities
export const mockOpportunities: Opportunity[] = [
  {
    id: 'o1', opportunity_title: 'DBS Brand Refresh Campaign', account_id: 'a1', primary_contact_id: 'c1',
    country: 'Singapore', workstream: 'Brand Strategy', stage: 'Proposal sent',
    est_value_sgd: 280000, probability_system: 0.6, probability_override: 0.7,
    probability_override_reason: 'Strong champion, budget confirmed',
    relationship_owner_user_id: 'u2', opportunity_owner_user_id: 'u2',
    pitch_summary: 'Full brand refresh including visual identity, brand guidelines, and campaign launch. DBS moving to next-gen banking positioning.',
    source: 'Inbound', tags: ['brand', 'campaign'], last_activity_at: '2025-02-28',
    expected_close_month: '2025-04',
    created_at: '2024-10-15', updated_at: '2025-02-28',
  },
  {
    id: 'o2', opportunity_title: 'Grab SEA GTM Strategy', account_id: 'a2', primary_contact_id: 'c3',
    country: 'Singapore', workstream: 'GTM Strategy', stage: 'Pitching',
    est_value_sgd: 450000, probability_system: 0.3,
    relationship_owner_user_id: 'u3', opportunity_owner_user_id: 'u3',
    pitch_summary: 'Go-to-market strategy for Grab\'s financial services expansion across 5 SEA markets.',
    source: 'Referral', tags: ['strategy', 'fintech', 'regional'], last_activity_at: '2025-03-01',
    created_at: '2024-11-01', updated_at: '2025-03-01',
  },
  {
    id: 'o3', opportunity_title: 'Petronas Sustainability Comms', account_id: 'a3', primary_contact_id: 'c4',
    country: 'Malaysia', workstream: 'Communications', stage: 'Secured lead',
    est_value_sgd: 180000, probability_system: 0.1,
    relationship_owner_user_id: 'u2', opportunity_owner_user_id: 'u2',
    source: 'Outbound', tags: ['sustainability', 'comms'], last_activity_at: '2025-02-20',
    created_at: '2025-01-10', updated_at: '2025-02-20',
  },
  {
    id: 'o4', opportunity_title: 'Shopee Regional Campaign', account_id: 'a4', primary_contact_id: 'c5',
    country: 'Singapore', workstream: 'Campaign', stage: 'Prospect',
    est_value_sgd: 120000, probability_system: 0.05,
    opportunity_owner_user_id: 'u3',
    source: 'Event', tags: ['campaign', 'e-commerce'], last_activity_at: '2025-02-15',
    created_at: '2025-02-01', updated_at: '2025-02-15',
  },
  {
    id: 'o5', opportunity_title: 'AIA Digital Transformation PR', account_id: 'a5', primary_contact_id: 'c6',
    country: 'Hong Kong', workstream: 'PR', stage: 'Cold, follow up later',
    est_value_sgd: 95000, probability_system: 0.1,
    opportunity_owner_user_id: 'u2',
    notes: 'Client paused due to internal restructuring. Revisit Q2 2025.',
    source: 'Partner', tags: ['PR', 'digital'], last_activity_at: '2025-01-20',
    expected_close_month: '2025-06',
    created_at: '2024-11-15', updated_at: '2025-01-20',
  },
  {
    id: 'o6', opportunity_title: 'DBS Wealth Management Content', account_id: 'a1', primary_contact_id: 'c2',
    country: 'Singapore', workstream: 'Content', stage: 'Pitching',
    est_value_sgd: 150000, probability_system: 0.3, probability_override: 0.4,
    probability_override_reason: 'Good momentum after initial meeting',
    relationship_owner_user_id: 'u2', opportunity_owner_user_id: 'u3',
    pitch_summary: 'Content strategy and production for DBS Private Banking wealth management division.',
    source: 'Inbound', tags: ['content', 'wealth'], last_activity_at: '2025-02-25',
    created_at: '2025-01-05', updated_at: '2025-02-25',
  },
  {
    id: 'o7', opportunity_title: 'Telkomsel Brand Positioning', account_id: 'a6',
    country: 'Indonesia', workstream: 'Brand Strategy', stage: 'Prospect',
    est_value_sgd: 200000, probability_system: 0.05,
    opportunity_owner_user_id: 'u2', primary_contact_free_text: 'Budi Santoso',
    source: 'Outbound', tags: ['brand', 'telecom'], last_activity_at: '2025-01-10',
    created_at: '2025-01-08', updated_at: '2025-01-10',
  },
  {
    id: 'o8', opportunity_title: 'Grab Driver Engagement Campaign', account_id: 'a2', primary_contact_id: 'c3',
    country: 'Singapore', workstream: 'Campaign', stage: 'Closed',
    est_value_sgd: 320000, probability_system: 1.0,
    relationship_owner_user_id: 'u3', opportunity_owner_user_id: 'u3',
    pitch_summary: 'Multi-channel campaign to improve driver retention and satisfaction across SEA.',
    source: 'Inbound', tags: ['campaign', 'engagement'],
    close_date: '2025-01-15', outcome_status: 'Won',
    win_reason_tags: ['Solution fit', 'Speed / responsiveness', 'Relationship'],
    outcome_notes: 'Won on strength of regional delivery capability and speed of proposal turnaround.',
    last_activity_at: '2025-01-15',
    created_at: '2024-08-01', updated_at: '2025-01-15',
  },
  {
    id: 'o9', opportunity_title: 'Bangkok Bank Rebrand', account_id: 'a7',
    country: 'Thailand', workstream: 'Brand Strategy', stage: 'Lost',
    est_value_sgd: 250000, probability_system: 0.0,
    opportunity_owner_user_id: 'u2', primary_contact_free_text: 'Somchai P.',
    source: 'Partner', tags: ['brand', 'rebrand'],
    close_date: '2024-12-20', outcome_status: 'Lost',
    loss_reason_tags: ['Competitor win', 'Pricing too high'],
    competitors: ['Ogilvy', 'Dentsu'],
    outcome_notes: 'Lost to Ogilvy on price. Our proposal was 30% higher. Client valued local team presence.',
    last_activity_at: '2024-12-20',
    created_at: '2024-09-01', updated_at: '2024-12-20',
  },
  {
    id: 'o10', opportunity_title: 'Petronas Downstream Digital', account_id: 'a3', primary_contact_id: 'c4',
    country: 'Malaysia', workstream: 'Digital', stage: 'Secured lead',
    est_value_sgd: 350000, probability_system: 0.1,
    relationship_owner_user_id: 'u3', opportunity_owner_user_id: 'u3',
    source: 'Referral', tags: ['digital', 'energy'], last_activity_at: '2025-02-18',
    created_at: '2025-02-01', updated_at: '2025-02-18',
  },
];

// Tasks
export const mockTasks: Task[] = [
  { id: 't1', opportunity_id: 'o1', account_id: 'a1', task_type: 'Send', title: 'Send revised proposal', due_date: '2025-03-03', status: 'Open', owner_user_id: 'u2', created_at: '2025-02-25', updated_at: '2025-02-25' },
  { id: 't2', opportunity_id: 'o1', account_id: 'a1', task_type: 'Meeting', title: 'Commercial negotiation call', due_date: '2025-03-07', status: 'Open', owner_user_id: 'u2', created_at: '2025-02-28', updated_at: '2025-02-28' },
  { id: 't3', opportunity_id: 'o2', account_id: 'a2', task_type: 'Prep', title: 'Prepare GTM deck', due_date: '2025-03-04', status: 'Open', owner_user_id: 'u3', created_at: '2025-02-28', updated_at: '2025-02-28' },
  { id: 't4', opportunity_id: 'o2', account_id: 'a2', task_type: 'Meeting', title: 'Pitch meeting with Kevin', due_date: '2025-03-10', status: 'Open', owner_user_id: 'u3', created_at: '2025-03-01', updated_at: '2025-03-01' },
  { id: 't5', opportunity_id: 'o3', account_id: 'a3', task_type: 'Call', title: 'Discovery call with Ahmad', due_date: '2025-03-05', status: 'Open', owner_user_id: 'u2', created_at: '2025-02-20', updated_at: '2025-02-20' },
  { id: 't6', opportunity_id: 'o4', account_id: 'a4', task_type: 'Email', title: 'Initial outreach to Shopee', due_date: '2025-02-28', status: 'Open', owner_user_id: 'u3', created_at: '2025-02-15', updated_at: '2025-02-15' },
  { id: 't7', opportunity_id: 'o5', account_id: 'a5', task_type: 'Email', title: 'Recycle outreach Q2', due_date: '2025-04-01', status: 'Open', owner_user_id: 'u2', created_at: '2025-01-20', updated_at: '2025-01-20' },
  { id: 't8', opportunity_id: 'o6', account_id: 'a1', task_type: 'Send', title: 'Send content strategy deck', due_date: '2025-03-01', status: 'Open', owner_user_id: 'u3', created_at: '2025-02-25', updated_at: '2025-02-25' },
  { id: 't9', opportunity_id: 'o7', account_id: 'a6', task_type: 'Call', title: 'Research Telkomsel market', due_date: '2025-03-06', status: 'Open', owner_user_id: 'u2', created_at: '2025-01-10', updated_at: '2025-01-10' },
  { id: 't10', opportunity_id: 'o10', account_id: 'a3', task_type: 'Meeting', title: 'Collect requirements from Petronas Digital', due_date: '2025-03-08', status: 'Open', owner_user_id: 'u3', created_at: '2025-02-18', updated_at: '2025-02-18' },
  { id: 't11', opportunity_id: 'o8', account_id: 'a2', task_type: 'Meeting', title: 'Kickoff handover', due_date: '2025-01-20', status: 'Done', owner_user_id: 'u3', completed_at: '2025-01-20', created_at: '2025-01-15', updated_at: '2025-01-20' },
];

// Activities
export const mockActivities: Activity[] = [
  { id: 'act1', opportunity_id: 'o1', activity_type: 'Meeting', activity_date: '2025-02-28', summary: 'Proposal review meeting with James Wong', details: 'Discussed pricing and scope. Client positive, requested minor revisions.', created_by_user_id: 'u2', created_at: '2025-02-28' },
  { id: 'act2', opportunity_id: 'o1', activity_type: 'Email', activity_date: '2025-02-20', summary: 'Sent initial proposal document', created_by_user_id: 'u2', created_at: '2025-02-20' },
  { id: 'act3', opportunity_id: 'o2', activity_type: 'Call', activity_date: '2025-03-01', summary: 'Briefing call with Kevin Lee on GTM requirements', details: 'Key focus: Indonesia, Vietnam, Philippines. Need local market data.', created_by_user_id: 'u3', created_at: '2025-03-01' },
  { id: 'act4', opportunity_id: 'o2', activity_type: 'Note', activity_date: '2025-02-25', summary: 'Internal strategy session for Grab GTM', created_by_user_id: 'u3', created_at: '2025-02-25' },
  { id: 'act5', opportunity_id: 'o3', activity_type: 'Email', activity_date: '2025-02-20', summary: 'Follow-up email to Ahmad on sustainability brief', created_by_user_id: 'u2', created_at: '2025-02-20' },
  { id: 'act6', opportunity_id: 'o6', activity_type: 'Meeting', activity_date: '2025-02-25', summary: 'Content strategy workshop with Linda Tan', details: 'Explored thought leadership themes for HNW segment.', created_by_user_id: 'u3', created_at: '2025-02-25' },
  { id: 'act7', opportunity_id: 'o8', activity_type: 'Proposal Sent', activity_date: '2024-12-15', summary: 'Final proposal submitted', created_by_user_id: 'u3', created_at: '2024-12-15' },
  { id: 'act8', opportunity_id: 'o9', activity_type: 'Meeting', activity_date: '2024-12-10', summary: 'Final pitch to Bangkok Bank committee', details: 'Presented against Ogilvy and Dentsu.', created_by_user_id: 'u2', created_at: '2024-12-10' },
];

// Artifacts
export const mockArtifacts: Artifact[] = [
  { id: 'art1', opportunity_id: 'o1', account_id: 'a1', artifact_type: 'Proposal', pitch_type: 'Proposal', keywords: ['brand', 'refresh', 'banking'], title: 'DBS Brand Refresh Proposal v2', file_url: '/artifacts/dbs-proposal-v2.pdf', version: 'v2', shared_with_client: true, created_by_user_id: 'u2', created_at: '2025-02-18' },
  { id: 'art2', opportunity_id: 'o1', account_id: 'a1', artifact_type: 'Pitch Deck', pitch_type: 'Capability Deck', keywords: ['brand', 'capabilities'], title: 'Enfactum Brand Capabilities', file_url: '/artifacts/enfactum-brand-cap.pdf', version: 'v1', shared_with_client: true, created_by_user_id: 'u2', created_at: '2025-01-10' },
  { id: 'art3', opportunity_id: 'o2', account_id: 'a2', artifact_type: 'Pitch Deck', pitch_type: 'GTM Plan', keywords: ['gtm', 'fintech', 'sea'], title: 'Grab GTM Strategy Deck', file_url: '/artifacts/grab-gtm-v1.pdf', version: 'v1', shared_with_client: false, created_by_user_id: 'u3', created_at: '2025-02-28' },
  { id: 'art4', opportunity_id: 'o8', account_id: 'a2', artifact_type: 'Proposal', pitch_type: 'Campaign Plan', keywords: ['campaign', 'engagement', 'drivers'], title: 'Grab Driver Engagement Campaign Plan', file_url: '/artifacts/grab-driver-campaign.pdf', version: 'v1', shared_with_client: true, created_by_user_id: 'u3', created_at: '2024-11-20' },
  { id: 'art5', opportunity_id: 'o8', account_id: 'a2', artifact_type: 'Case Study', pitch_type: 'Case Study', keywords: ['campaign', 'engagement', 'results'], title: 'Grab Driver Campaign - Case Study', file_url: '/artifacts/grab-case-study.pdf', version: 'v1', shared_with_client: false, created_by_user_id: 'u4', created_at: '2025-02-01' },
  { id: 'art6', opportunity_id: 'o6', account_id: 'a1', artifact_type: 'Pitch Deck', pitch_type: 'Capability Deck', keywords: ['content', 'wealth', 'banking'], title: 'Content Strategy Capabilities Deck', file_url: '/artifacts/content-cap-deck.pdf', version: 'v1', shared_with_client: false, created_by_user_id: 'u3', created_at: '2025-02-20' },
  { id: 'art7', opportunity_id: 'o9', account_id: 'a7', artifact_type: 'Pitch Deck', pitch_type: 'Capability Deck', keywords: ['brand', 'rebrand', 'banking'], title: 'Bangkok Bank Rebrand Pitch', file_url: '/artifacts/bkk-bank-pitch.pdf', version: 'v1', shared_with_client: true, created_by_user_id: 'u2', created_at: '2024-11-15' },
];

// Stage History
export const mockStageHistory: StageHistoryEntry[] = [
  { id: 'sh1', opportunity_id: 'o1', from_stage: 'Pitching', to_stage: 'Proposal sent', changed_by_user_id: 'u2', changed_at: '2025-02-15' },
  { id: 'sh2', opportunity_id: 'o1', from_stage: 'Secured lead', to_stage: 'Pitching', changed_by_user_id: 'u2', changed_at: '2025-01-20' },
  { id: 'sh3', opportunity_id: 'o2', from_stage: 'Secured lead', to_stage: 'Pitching', changed_by_user_id: 'u3', changed_at: '2025-02-20' },
  { id: 'sh4', opportunity_id: 'o8', from_stage: 'Proposal sent', to_stage: 'Closed', changed_by_user_id: 'u3', changed_at: '2025-01-15' },
  { id: 'sh5', opportunity_id: 'o9', from_stage: 'Pitching', to_stage: 'Lost', changed_by_user_id: 'u2', changed_at: '2024-12-20' },
  { id: 'sh6', opportunity_id: 'o6', from_stage: 'Secured lead', to_stage: 'Pitching', changed_by_user_id: 'u3', changed_at: '2025-02-10' },
];

// Stage Rules
export const mockStageRules: StageRule[] = [
  { id: 'sr1', stage_name: 'Prospect', required_fields: ['opportunity_title', 'opportunity_owner_user_id', 'country', 'workstream', 'account_id'], required_artifacts: [], recommended_tasks: ['Research account', 'Initial outreach'], default_probability: 0.05, min_probability: 0, max_probability: 0.1, sla_days_in_stage: 14 },
  { id: 'sr2', stage_name: 'Secured lead', required_fields: ['account_id'], required_artifacts: [], recommended_tasks: ['Discovery call scheduled', 'Collect requirements'], default_probability: 0.1, min_probability: 0.05, max_probability: 0.25, sla_days_in_stage: 14 },
  { id: 'sr3', stage_name: 'Pitching', required_fields: ['pitch_summary'], required_artifacts: ['Pitch Deck'], recommended_tasks: ['Send deck', 'Schedule pitch meeting', 'Stakeholder mapping'], default_probability: 0.3, min_probability: 0.25, max_probability: 0.5, sla_days_in_stage: 21 },
  { id: 'sr4', stage_name: 'Proposal sent', required_fields: [], required_artifacts: ['Proposal'], recommended_tasks: ['Follow up proposal', 'Commercial negotiation', 'Legal/procurement check'], default_probability: 0.6, min_probability: 0.5, max_probability: 0.9, sla_days_in_stage: 21 },
  { id: 'sr5', stage_name: 'Cold, follow up later', required_fields: [], required_artifacts: [], recommended_tasks: ['Recycle outreach', 'Share relevant case study'], default_probability: 0.1, min_probability: 0, max_probability: 0.3, sla_days_in_stage: 60 },
  { id: 'sr6', stage_name: 'Closed', required_fields: ['close_date', 'outcome_notes', 'win_reason_tags'], required_artifacts: [], recommended_tasks: ['Kickoff handover', 'Create delivery plan'], default_probability: 1.0, min_probability: 1.0, max_probability: 1.0, sla_days_in_stage: 9999 },
  { id: 'sr7', stage_name: 'Lost', required_fields: ['close_date', 'loss_reason_tags', 'outcome_notes'], required_artifacts: [], recommended_tasks: ['Capture learnings', 'Set recycle task (optional)'], default_probability: 0, min_probability: 0, max_probability: 0, sla_days_in_stage: 9999 },
];

// Helper: get user by id
export function getUserById(id: string): User | undefined {
  return mockUsers.find(u => u.id === id);
}

export function getAccountById(id: string): Account | undefined {
  return mockAccounts.find(a => a.id === id);
}

export function getContactById(id: string): Contact | undefined {
  return mockContacts.find(c => c.id === id);
}

export function getStageRule(stage: string): StageRule | undefined {
  return mockStageRules.find(r => r.stage_name === stage);
}
