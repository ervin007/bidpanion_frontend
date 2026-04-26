export type TenderStatus = 'Draft' | 'New' | 'In Review' | 'Bid' | 'No-Bid' | 'Submitted' | 'Won' | 'Lost';
export type ProcessingStatus = 'Queued' | 'Processing' | 'Completed' | 'Failed' | 'Password Protected';
export type UserRole = 'Admin' | 'Bid Manager' | 'Analyst' | 'Viewer';
export type MemberStatus = 'Active' | 'Pending' | 'Deactivated';
export type TaskStatus = 'To Do' | 'In Progress' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High';
export type ComplianceStatus = 'Missing' | 'Uploaded' | 'Verified';
export type BoardColumn = 'Backlog' | 'Screening' | 'Go / No-Go' | 'Drafting' | 'Review' | 'Submitted' | 'Won' | 'Lost';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: MemberStatus;
  lastActive: string;
  avatar?: string;
}

export interface Tender {
  id: string;
  title: string;
  authority: string;
  source: 'TED' | 'DTVP' | 'ANKÖ' | 'SIMAP' | 'Vergabe24' | 'eTendering';
  deadline: string | null;
  status: TenderStatus;
  processingStatus: ProcessingStatus;
  owner: string;
  uploadDate: string;
  fitScore: number | null;
  recommendation: 'Bid' | 'Review' | 'No-Bid' | null;
  value?: string;
  cpvCode?: string;
  noticeType?: string;
  country: string;
  sourceUrl?: string;
  description?: string;
  deleted?: boolean;
  deletedAt?: string;
  watching?: boolean;
  boardColumn?: BoardColumn;
  tasksCompleted?: number;
  tasksTotal?: number;
}

export interface BriefField {
  label: string;
  value: string;
  citation?: { doc: string; page: number };
  needsReview?: boolean;
  userVerified?: boolean;
  verifiedValue?: string;
  verifiedBy?: string;
}

export interface BriefSection {
  id: string;
  title: string;
  fields: BriefField[];
}

export interface FitCategory {
  id: string;
  label: string;
  weight: number;
  score: number;
  status: 'matched' | 'partial' | 'unmatched' | 'n/a';
  details: string;
  matchedItems: string[];
  unmatchedItems: string[];
}

export interface Document {
  id: string;
  name: string;
  pages: number;
  size: string;
  isPrimary: boolean;
  status: 'Uploaded' | 'Processing' | 'Processed' | 'Failed' | 'Password Protected';
  progress?: number;
}

export interface ComplianceItem {
  id: string;
  section: string;
  label: string;
  reference: string;
  status: ComplianceStatus;
  fileId?: string;
  reviewer?: string;
  notes?: string;
}

export interface Task {
  id: string;
  tenderId: string;
  title: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  type: 'compliance' | 'ai-generated' | 'custom';
  effort?: string;
  subtasks?: { id: string; title: string; completed: boolean }[];
  comments?: ActivityComment[];
}

export interface ActivityComment {
  id: string;
  user: string;
  timestamp: string;
  content: string;
  mentions?: string[];
  attachments?: { id: string; name: string; url: string }[];
}

export interface ActivityLog {
  id: string;
  type: 'system' | 'comment' | 'status_change' | 'document' | 'task';
  user?: string;
  timestamp: string;
  description: string;
  metadata?: Record<string, string>;
}

// ──────────────────────────────────────────────────────────────────────────
// Team Members
// ──────────────────────────────────────────────────────────────────────────
export const MOCK_TEAM: TeamMember[] = [
  {
    id: 'u1', name: 'Lena Hofmann', email: 'l.hofmann@company.com',
    role: 'Admin', status: 'Active', lastActive: '2026-02-23T09:15:00Z',
  },
  {
    id: 'u2', name: 'Markus Bauer', email: 'm.bauer@company.com',
    role: 'Bid Manager', status: 'Active', lastActive: '2026-02-23T08:45:00Z',
  },
  {
    id: 'u3', name: 'Sophie Kramer', email: 's.kramer@company.com',
    role: 'Analyst', status: 'Active', lastActive: '2026-02-22T17:30:00Z',
  },
  {
    id: 'u4', name: 'Jonas Weber', email: 'j.weber@company.com',
    role: 'Viewer', status: 'Pending', lastActive: '-',
  },
  {
    id: 'u5', name: 'Petra Schneider', email: 'p.schneider@company.com',
    role: 'Analyst', status: 'Deactivated', lastActive: '2026-01-15T11:00:00Z',
  },
];

export const CURRENT_USER = MOCK_TEAM[0]!;

// ──────────────────────────────────────────────────────────────────────────
// Tenders
// ──────────────────────────────────────────────────────────────────────────
export const MOCK_TENDERS: Tender[] = [
  {
    id: 't001',
    title: 'IT System Management and Helpdesk Services 2026–2028',
    authority: 'Federal Ministry for Digitalization',
    source: 'DTVP',
    deadline: '2026-02-26T12:00:00Z', // 3 days — URGENT
    status: 'In Review',
    processingStatus: 'Completed',
    owner: 'Lena Hofmann',
    uploadDate: '2026-02-18T10:00:00Z',
    fitScore: 81,
    recommendation: 'Bid',
    value: '€ 450,000 – 620,000',
    cpvCode: '72253200-5',
    noticeType: 'Contract Notice',
    country: 'DE',
    sourceUrl: 'https://www.dtvp.de/example',
    description: 'System management and 2nd-level helpdesk for ministry IT infrastructure.',
    watching: true,
    boardColumn: 'Go / No-Go',
    tasksCompleted: 12,
    tasksTotal: 20,
  },
  {
    id: 't002',
    title: 'Development of E-Government Platform for Citizen Services',
    authority: 'City of Vienna – Municipal Department 14',
    source: 'ANKÖ',
    deadline: '2026-03-02T15:00:00Z', // 7 days — SOON
    status: 'New',
    processingStatus: 'Completed',
    owner: 'Markus Bauer',
    uploadDate: '2026-02-20T14:30:00Z',
    fitScore: 62,
    recommendation: 'Review',
    value: '€ 800,000 – 1,200,000',
    cpvCode: '72413000-8',
    noticeType: 'Contract Notice',
    country: 'AT',
    sourceUrl: 'https://www.ankoe.at/example',
    description: 'Development, deployment and operation of a digital citizen services platform.',
    watching: true,
    boardColumn: 'Screening',
    tasksCompleted: 4,
    tasksTotal: 15,
  },
  {
    id: 't003',
    title: 'Cloud Migration Infrastructure and DevSecOps Operations',
    authority: 'Bavarian State Bank',
    source: 'TED',
    deadline: '2026-03-20T17:00:00Z', // 25 days
    status: 'Bid',
    processingStatus: 'Completed',
    owner: 'Lena Hofmann',
    uploadDate: '2026-02-15T09:00:00Z',
    fitScore: 88,
    recommendation: 'Bid',
    value: '€ 1,200,000 – 2,400,000',
    cpvCode: '72000000-5',
    noticeType: 'Contract Notice',
    country: 'DE',
    description: 'Migration of on-premise infrastructure to AWS cloud with full DevSecOps operations.',
    boardColumn: 'Drafting',
    tasksCompleted: 18,
    tasksTotal: 25,
  },
  {
    id: 't004',
    title: 'Cybersecurity Audit and Penetration Testing for Critical Infrastructure',
    authority: 'Federal Office for Information Security',
    source: 'TED',
    deadline: '2026-02-28T14:00:00Z', // 5 days — URGENT
    status: 'In Review',
    processingStatus: 'Completed',
    owner: 'Sophie Kramer',
    uploadDate: '2026-02-19T11:30:00Z',
    fitScore: 55,
    recommendation: 'Review',
    value: '€ 250,000 – 380,000',
    cpvCode: '79212500-8',
    noticeType: 'Competitive Dialogue',
    country: 'DE',
    description: 'Comprehensive security audit including penetration testing for critical infrastructure systems.',
    watching: true,
    boardColumn: 'Screening',
    tasksCompleted: 3,
    tasksTotal: 12,
  },
  {
    id: 't005',
    title: 'ERP System Implementation SAP S/4HANA Public Cloud',
    authority: 'Munich Municipal Services GmbH',
    source: 'DTVP',
    deadline: '2026-03-14T12:00:00Z', // 19 days
    status: 'In Review',
    processingStatus: 'Processing',
    owner: 'Markus Bauer',
    uploadDate: '2026-02-22T16:00:00Z',
    fitScore: null,
    recommendation: null,
    value: '€ 2,000,000 – 3,500,000',
    cpvCode: '72263000-6',
    noticeType: 'Contract Notice',
    country: 'DE',
    description: 'Implementation and customization of SAP S/4HANA Public Cloud including migration from SAP ECC.',
    boardColumn: 'Screening',
    tasksCompleted: 0,
    tasksTotal: 18,
  },
  {
    id: 't006',
    title: 'Mobile App for Citizen Services – Canton of Zurich',
    authority: 'Canton of Zurich – Department of Justice',
    source: 'SIMAP',
    deadline: '2026-04-08T17:00:00Z', // 44 days
    status: 'New',
    processingStatus: 'Completed',
    owner: 'Sophie Kramer',
    uploadDate: '2026-02-21T10:15:00Z',
    fitScore: 47,
    recommendation: 'Review',
    value: 'CHF 480,000 – 720,000',
    cpvCode: '72212900-8',
    noticeType: 'Open Procedure',
    country: 'CH',
    description: 'Development of native iOS/Android apps for cantonal citizen services.',
    boardColumn: 'Backlog',
    tasksCompleted: 0,
    tasksTotal: 10,
  },
  {
    id: 't007',
    title: 'Network Infrastructure Modernization – Highway A9',
    authority: 'Federal Highway Company',
    source: 'TED',
    deadline: '2026-02-25T10:00:00Z', // 2 days — URGENT
    status: 'No-Bid',
    processingStatus: 'Failed',
    owner: 'Markus Bauer',
    uploadDate: '2026-02-20T08:00:00Z',
    fitScore: 28,
    recommendation: 'No-Bid',
    value: '€ 5,000,000 – 8,000,000',
    cpvCode: '32420000-3',
    noticeType: 'Contract Notice',
    country: 'DE',
    description: 'Hardware delivery and installation for fiber optic/MPLS network along A9 highway.',
    boardColumn: 'Lost',
    tasksCompleted: 0,
    tasksTotal: 0,
  },
  {
    id: 't008',
    title: 'Digital Transformation of Administrative Processes – Free State of Bavaria',
    authority: 'State Office for Digitalization Bavaria (LADIG)',
    source: 'DTVP',
    deadline: '2026-03-25T16:00:00Z', // 30 days
    status: 'Draft',
    processingStatus: 'Queued',
    owner: 'Lena Hofmann',
    uploadDate: '2026-02-23T07:00:00Z',
    fitScore: null,
    recommendation: null,
    value: '€ 700,000 – 950,000',
    cpvCode: '72212000-4',
    noticeType: 'Restricted Procedure',
    country: 'DE',
    description: 'Conception and implementation of digitalization strategy for administrative processes.',
    boardColumn: 'Backlog',
    tasksCompleted: 0,
    tasksTotal: 0,
  },
  {
    id: 't009',
    title: 'Data Warehouse & Business Intelligence Platform',
    authority: 'Austrian Post AG',
    source: 'ANKÖ',
    deadline: null, // Deadline missing
    status: 'New',
    processingStatus: 'Completed',
    owner: 'Sophie Kramer',
    uploadDate: '2026-02-17T13:00:00Z',
    fitScore: null,
    recommendation: null,
    value: '€ 900,000 – 1,400,000',
    cpvCode: '48612000-1',
    noticeType: 'Contract Notice',
    country: 'AT',
    description: 'Building a central data warehouse platform with BI dashboards for corporate management.',
    boardColumn: 'Backlog',
    tasksCompleted: 0,
    tasksTotal: 0,
  },
  {
    id: 't010',
    title: 'Training Concept and E-Learning Platform for Federal Government',
    authority: 'Federal Office of Administration',
    source: 'Vergabe24',
    deadline: '2026-03-05T12:00:00Z', // 10 days
    status: 'Submitted',
    processingStatus: 'Completed',
    owner: 'Markus Bauer',
    uploadDate: '2026-02-10T09:00:00Z',
    fitScore: 73,
    recommendation: 'Bid',
    value: '€ 320,000 – 480,000',
    cpvCode: '80420000-4',
    noticeType: 'Contract Notice',
    country: 'DE',
    boardColumn: 'Submitted',
    tasksCompleted: 22,
    tasksTotal: 22,
  },
  {
    id: 't011',
    title: 'IT Security Concept for Hospital Information System',
    authority: 'Canton Hospital Winterthur',
    source: 'SIMAP',
    deadline: '2026-04-15T17:00:00Z',
    status: 'New',
    processingStatus: 'Password Protected',
    owner: 'Lena Hofmann',
    uploadDate: '2026-02-22T15:00:00Z',
    fitScore: null,
    recommendation: null,
    value: 'CHF 600,000 – 950,000',
    cpvCode: '72222300-0',
    noticeType: 'Selective Procedure',
    country: 'CH',
    boardColumn: 'Backlog',
    tasksCompleted: 0,
    tasksTotal: 0,
  },
  {
    id: 't012',
    title: 'Microsoft 365 Rollout and Teams Telephony for Federal Agency',
    authority: 'Federal Network Agency',
    source: 'TED',
    deadline: '2026-03-10T12:00:00Z',
    status: 'Won',
    processingStatus: 'Completed',
    owner: 'Lena Hofmann',
    uploadDate: '2026-01-20T10:00:00Z',
    fitScore: 91,
    recommendation: 'Bid',
    value: '€ 1,100,000 – 1,600,000',
    cpvCode: '72320000-4',
    noticeType: 'Contract Notice',
    country: 'DE',
    boardColumn: 'Won',
    tasksCompleted: 28,
    tasksTotal: 28,
  },
];

export const MOCK_DELETED_TENDERS: Tender[] = [
  {
    id: 'dt001',
    title: 'Website Relaunch for Federal Ministry of Health',
    authority: 'Federal Ministry of Health',
    source: 'DTVP',
    deadline: '2026-01-15T12:00:00Z',
    status: 'No-Bid',
    processingStatus: 'Completed',
    owner: 'Markus Bauer',
    uploadDate: '2026-01-08T10:00:00Z',
    fitScore: 31,
    recommendation: 'No-Bid',
    country: 'DE',
    deleted: true,
    deletedAt: '2026-02-05T14:00:00Z',
  },
  {
    id: 'dt002',
    title: 'Warehouse Management System Software Development',
    authority: 'Federal Armed Forces Logistics Office',
    source: 'TED',
    deadline: '2026-02-01T12:00:00Z',
    status: 'Lost',
    processingStatus: 'Completed',
    owner: 'Sophie Kramer',
    uploadDate: '2026-01-20T09:00:00Z',
    fitScore: 58,
    recommendation: 'Review',
    country: 'DE',
    deleted: true,
    deletedAt: '2026-02-18T11:00:00Z',
  },
  {
    id: 'dt003',
    title: 'Test Management and QA Services',
    authority: 'Austrian Federal Railways ÖBB',
    source: 'ANKÖ',
    deadline: '2026-01-20T12:00:00Z',
    status: 'Draft',
    processingStatus: 'Queued',
    owner: 'Lena Hofmann',
    uploadDate: '2026-01-18T14:00:00Z',
    fitScore: null,
    recommendation: null,
    country: 'AT',
    deleted: true,
    deletedAt: '2026-02-20T09:30:00Z',
  },
];

// ──────────────────────────────────────────────────────────────────────────
// Tender t001 – detailed data
// ──────────────────────────────────────────────────────────────────────────
export const MOCK_BRIEF_SECTIONS: BriefSection[] = [
  {
    id: 'overview',
    title: 'Overview',
    fields: [
      {
        label: 'Contracting Authority',
        value: 'Federal Ministry for Digitalization and Economic Development',
        citation: { doc: 'Notice.pdf', page: 1 },
      },
      {
        label: 'Procurement Type',
        value: 'Open Procedure (EU Threshold)',
        citation: { doc: 'Notice.pdf', page: 2 },
        needsReview: false,
      },
      {
        label: 'Reference Number',
        value: 'BMDW-2026-IT-0042',
        citation: { doc: 'Notice.pdf', page: 1 },
      },
      {
        label: 'Brief Description',
        value: 'Provision of IT system management including 2nd-level helpdesk and on-site support for the entire IT infrastructure of the ministry at two locations in Vienna.',
        citation: { doc: 'Service_Description.pdf', page: 3 },
        needsReview: true,
      },
    ],
  },
  {
    id: 'dates',
    title: 'Deadlines',
    fields: [
      {
        label: 'Submission Deadline',
        value: '26.02.2026, 12:00 PM CET',
        citation: { doc: 'Notice.pdf', page: 4 },
      },
      {
        label: 'Question Deadline',
        value: '19.02.2026, 5:00 PM CET',
        citation: { doc: 'Notice.pdf', page: 4 },
      },
      {
        label: 'Planned Service Start',
        value: '01.05.2026',
        citation: { doc: 'Service_Description.pdf', page: 7 },
        needsReview: true,
        userVerified: true,
        verifiedValue: '01.06.2026',
        verifiedBy: 'Lena Hofmann',
      },
      {
        label: 'Contract Duration',
        value: '24 months + 2x 12 months option',
        citation: { doc: 'Service_Description.pdf', page: 8 },
      },
    ],
  },
  {
    id: 'scope',
    title: 'Scope of Services',
    fields: [
      {
        label: 'Main Service',
        value: 'IT system management, 2nd-level helpdesk (SLA: P1 <4h, P2 <8h), monthly reporting',
        citation: { doc: 'Service_Description.pdf', page: 10 },
      },
      {
        label: 'Optional Services',
        value: 'Patch management, license management, on-demand project coordination',
        citation: { doc: 'Service_Description.pdf', page: 12 },
      },
      {
        label: 'Service Location',
        value: 'Vienna City Center (Ministry headquarters) + Vienna Liesing branch office',
        citation: { doc: 'Service_Description.pdf', page: 6 },
      },
      {
        label: 'Estimated Workload',
        value: 'Approx. 3,200 person-days over contract duration',
        citation: { doc: 'Service_Description.pdf', page: 15 },
      },
    ],
  },
  {
    id: 'requirements',
    title: 'Requirements',
    fields: [
      {
        label: 'Professional License',
        value: 'IT services trade license or equivalent EU authorization',
        citation: { doc: 'Eligibility_Criteria.pdf', page: 2 },
      },
      {
        label: 'Annual Turnover (last 3 years)',
        value: 'Min. € 2M p.a. with comparable IT services',
        citation: { doc: 'Eligibility_Criteria.pdf', page: 3 },
        needsReview: true,
      },
      {
        label: 'Reference Projects',
        value: 'Min. 3 references of similar scale (min. 500 users, min. 12 months duration)',
        citation: { doc: 'Eligibility_Criteria.pdf', page: 4 },
      },
      {
        label: 'Technical Requirements',
        value: 'Microsoft Certified Partner (Silver/Gold IT Infrastructure), ITIL v4 Foundation for min. 2 staff',
        citation: { doc: 'Eligibility_Criteria.pdf', page: 5 },
      },
    ],
  },
  {
    id: 'evaluation',
    title: 'Award Criteria',
    fields: [
      {
        label: 'Award Principle',
        value: 'Best value (technical + commercial)',
        citation: { doc: 'Notice.pdf', page: 7 },
      },
      {
        label: 'Price',
        value: '40%',
        citation: { doc: 'Notice.pdf', page: 8 },
      },
      {
        label: 'Quality / Concept',
        value: '35%',
        citation: { doc: 'Notice.pdf', page: 8 },
      },
      {
        label: 'References',
        value: '15%',
        citation: { doc: 'Notice.pdf', page: 8 },
      },
      {
        label: 'Social Criteria',
        value: '10%',
        citation: { doc: 'Notice.pdf', page: 8 },
      },
    ],
  },
  {
    id: 'documents',
    title: 'Required Submission Documents',
    fields: [
      {
        label: 'Mandatory Documents',
        value: 'Offer letter, price schedule (Annex A), ESPD form, reference sheets (max. 3 pages per reference)',
        citation: { doc: 'Application_Requirements.pdf', page: 1 },
      },
      {
        label: 'Eligibility Proofs',
        value: 'Company register extract (max. 6 months old), tax clearance certificate, credit bureau report',
        citation: { doc: 'Application_Requirements.pdf', page: 2 },
      },
      {
        label: 'Certificates',
        value: 'Microsoft Partner certificate, ITIL certificates (copies)',
        citation: { doc: 'Application_Requirements.pdf', page: 3 },
      },
    ],
  },
  {
    id: 'team',
    title: 'Personnel Requirements',
    fields: [
      {
        label: 'Project Management',
        value: 'Min. 5 years experience in IT service management, PMP or PRINCE2 Practitioner',
        citation: { doc: 'Service_Description.pdf', page: 20 },
      },
      {
        label: 'Technical Staff',
        value: 'Min. 4 FTE with MCSA/MCSE or equivalent, of which min. 2 with Active Directory expertise',
        citation: { doc: 'Service_Description.pdf', page: 21 },
      },
      {
        label: 'Language Skills',
        value: 'German C1 (mandatory), English B2 (recommended)',
        citation: { doc: 'Service_Description.pdf', page: 22 },
      },
    ],
  },
];

export const MOCK_FIT_CATEGORIES: FitCategory[] = [
  {
    id: 'services',
    label: 'Services',
    weight: 25,
    score: 90,
    status: 'matched',
    details: 'IT helpdesk, system management and infrastructure management are core services.',
    matchedItems: ['2nd-level helpdesk', 'IT system management', 'Windows infrastructure', 'ITIL-based operations'],
    unmatchedItems: [],
  },
  {
    id: 'industries',
    label: 'Industries / NACE',
    weight: 20,
    score: 75,
    status: 'partial',
    details: 'Public administration with public references available, but Federal Ministry experience not explicit.',
    matchedItems: ['Public Administration (O84)', 'IT Services (J62)'],
    unmatchedItems: ['Federal Ministry-specific experience'],
  },
  {
    id: 'geography',
    label: 'Geography',
    weight: 15,
    score: 100,
    status: 'matched',
    details: 'Vienna location available, on-site deployment possible.',
    matchedItems: ['Vienna (AT)', 'Austria nationwide'],
    unmatchedItems: [],
  },
  {
    id: 'languages',
    label: 'Languages',
    weight: 15,
    score: 100,
    status: 'matched',
    details: 'German C1 and English B2 available in team.',
    matchedItems: ['German (C1)', 'English (B2)'],
    unmatchedItems: [],
  },
  {
    id: 'certifications',
    label: 'Certifications',
    weight: 15,
    score: 67,
    status: 'partial',
    details: 'Microsoft Silver Partner available. ITIL v4 Foundation only for 1 of 2 required staff.',
    matchedItems: ['Microsoft Silver Partner IT Infrastructure', 'ITIL v4 Foundation (1 staff)'],
    unmatchedItems: ['ITIL v4 Foundation (2nd staff member)'],
  },
  {
    id: 'capacity',
    label: 'Capacity',
    weight: 10,
    score: 60,
    status: 'partial',
    details: '3,200 person-days over 24 months. Current project utilization ~78%. Check resource availability.',
    matchedItems: ['Resources for P1/P2 SLA generally available'],
    unmatchedItems: ['Full utilization clearance still pending'],
  },
];

export const MOCK_DOCUMENTS: Document[] = [
  { id: 'd1', name: 'Notice.pdf', pages: 12, size: '824 KB', isPrimary: true, status: 'Processed' },
  { id: 'd2', name: 'Service_Description.pdf', pages: 34, size: '2.1 MB', isPrimary: false, status: 'Processed' },
  { id: 'd3', name: 'Eligibility_Criteria.pdf', pages: 8, size: '512 KB', isPrimary: false, status: 'Processed' },
  { id: 'd4', name: 'Application_Requirements.pdf', pages: 6, size: '378 KB', isPrimary: false, status: 'Processed' },
  { id: 'd5', name: 'Annex_A_Price_Schedule.pdf', pages: 3, size: '190 KB', isPrimary: false, status: 'Processing', progress: 65 },
  { id: 'd6', name: 'Draft_Contract_BMDW.pdf', pages: 18, size: '1.3 MB', isPrimary: false, status: 'Failed' },
];

// ──────────────────────────────────────────────────────────────────────────
// Tasks & Compliance for t001
// ──────────────────────────────────────────────────────────────────────────
export const MOCK_COMPLIANCE_CHECKLIST: ComplianceItem[] = [
  // Application Package
  { id: 'c1', section: 'Application Package', label: 'Offer letter', reference: '1.1', status: 'Verified', fileId: 'f1', reviewer: 'Lena Hofmann' },
  { id: 'c2', section: 'Application Package', label: 'Price schedule (Annex A)', reference: '1.2', status: 'Uploaded', fileId: 'f2' },
  { id: 'c3', section: 'Application Package', label: 'ESPD form', reference: '1.3', status: 'Verified', fileId: 'f3', reviewer: 'Markus Bauer' },
  
  // General Documents
  { id: 'c4', section: 'General Documents', label: 'Company register extract', reference: '2.1', status: 'Verified', fileId: 'f4', reviewer: 'Sophie Kramer' },
  { id: 'c5', section: 'General Documents', label: 'Trade license IT services', reference: '2.2', status: 'Verified', fileId: 'f5', reviewer: 'Lena Hofmann' },
  { id: 'c6', section: 'General Documents', label: 'Tax clearance certificate', reference: '2.3', status: 'Missing' },
  
  // Financial Capacity
  { id: 'c7', section: 'Financial Capacity', label: 'Annual financial statements 2023', reference: '3.1', status: 'Uploaded', fileId: 'f7' },
  { id: 'c8', section: 'Financial Capacity', label: 'Annual financial statements 2024', reference: '3.2', status: 'Uploaded', fileId: 'f8' },
  { id: 'c9', section: 'Financial Capacity', label: 'Annual financial statements 2025', reference: '3.3', status: 'Uploaded', fileId: 'f9' },
  { id: 'c10', section: 'Financial Capacity', label: 'Credit bureau report (KSV)', reference: '3.4', status: 'Missing' },
  
  // Certifications
  { id: 'c11', section: 'Certifications', label: 'Microsoft Partner Certificate', reference: '4.1', status: 'Verified', fileId: 'f11', reviewer: 'Markus Bauer' },
  { id: 'c12', section: 'Certifications', label: 'ITIL v4 Foundation (Staff 1)', reference: '4.2', status: 'Verified', fileId: 'f12', reviewer: 'Sophie Kramer' },
  { id: 'c13', section: 'Certifications', label: 'ITIL v4 Foundation (Staff 2)', reference: '4.3', status: 'Missing' },
  
  // References
  { id: 'c14', section: 'Company References', label: 'Reference 1: Similar project', reference: '5.1', status: 'Verified', fileId: 'f14', reviewer: 'Lena Hofmann' },
  { id: 'c15', section: 'Company References', label: 'Reference 2: Similar project', reference: '5.2', status: 'Uploaded', fileId: 'f15' },
  { id: 'c16', section: 'Company References', label: 'Reference 3: Similar project', reference: '5.3', status: 'Missing' },
];

export const MOCK_TASKS: Task[] = [
  // AI-Generated Tasks
  {
    id: 'task1',
    tenderId: 't001',
    title: 'Prepare technical concept document',
    description: 'Draft comprehensive technical concept covering infrastructure management approach, SLA compliance strategy, and tooling.',
    assignee: 'Markus Bauer',
    dueDate: '2026-02-24T17:00:00Z',
    status: 'In Progress',
    priority: 'High',
    type: 'ai-generated',
    effort: '16h',
  },
  {
    id: 'task2',
    tenderId: 't001',
    title: 'Estimate effort & timeline',
    description: 'Calculate person-days for each service component and create detailed project timeline.',
    assignee: 'Sophie Kramer',
    dueDate: '2026-02-23T17:00:00Z',
    status: 'Done',
    priority: 'High',
    type: 'ai-generated',
    effort: '8h',
  },
  {
    id: 'task3',
    tenderId: 't001',
    title: 'Define architecture components',
    description: 'Detail monitoring tools, ticketing system integration, and helpdesk workflow.',
    assignee: 'Markus Bauer',
    dueDate: '2026-02-24T17:00:00Z',
    status: 'To Do',
    priority: 'High',
    type: 'ai-generated',
    effort: '12h',
  },
  {
    id: 'task4',
    tenderId: 't001',
    title: 'Prepare pricing model',
    description: 'Complete price schedule (Annex A) with base service pricing and optional service rates.',
    assignee: 'Lena Hofmann',
    dueDate: '2026-02-25T12:00:00Z',
    status: 'In Progress',
    priority: 'High',
    type: 'ai-generated',
    effort: '6h',
  },
  {
    id: 'task5',
    tenderId: 't001',
    title: 'Assign project team members',
    description: 'Identify and assign project manager and 4 technical FTEs meeting qualification requirements.',
    assignee: 'Lena Hofmann',
    dueDate: '2026-02-24T17:00:00Z',
    status: 'Done',
    priority: 'Medium',
    type: 'ai-generated',
    effort: '4h',
  },
  {
    id: 'task6',
    tenderId: 't001',
    title: 'Prepare risk mitigation plan',
    description: 'Document identified risks and mitigation strategies for SLA compliance.',
    assignee: 'Sophie Kramer',
    dueDate: '2026-02-25T17:00:00Z',
    status: 'To Do',
    priority: 'Medium',
    type: 'ai-generated',
    effort: '8h',
  },
  
  // Custom Team Tasks
  {
    id: 'task7',
    tenderId: 't001',
    title: 'Review contract terms with legal',
    description: 'Schedule meeting with legal team to review contract draft and liability clauses.',
    assignee: 'Lena Hofmann',
    dueDate: '2026-02-24T15:00:00Z',
    status: 'Done',
    priority: 'High',
    type: 'custom',
  },
  {
    id: 'task8',
    tenderId: 't001',
    title: 'Coordinate reference letters',
    description: 'Request reference letters from 3 existing clients matching tender requirements.',
    assignee: 'Sophie Kramer',
    dueDate: '2026-02-25T12:00:00Z',
    status: 'In Progress',
    priority: 'Medium',
    type: 'custom',
    subtasks: [
      { id: 'st1', title: 'Contact Client A (Vienna Municipality)', completed: true },
      { id: 'st2', title: 'Contact Client B (Austrian Railways)', completed: true },
      { id: 'st3', title: 'Contact Client C (Federal Agency)', completed: false },
    ],
  },
  {
    id: 'task9',
    tenderId: 't001',
    title: 'Final proposal review meeting',
    description: 'Schedule final review session with all stakeholders before submission.',
    assignee: 'Lena Hofmann',
    dueDate: '2026-02-26T10:00:00Z',
    status: 'To Do',
    priority: 'High',
    type: 'custom',
  },
];

// ──────────────────────────────────────────────────────────────────────────
// Activity & Collaboration for t001
// ──────────────────────────────────────────────────────────────────────────
export const MOCK_ACTIVITY_LOG: ActivityLog[] = [
  {
    id: 'a1',
    type: 'system',
    timestamp: '2026-02-23T09:15:00Z',
    description: 'Fit score updated from 78 to 81',
    metadata: { from: '78', to: '81' },
  },
  {
    id: 'a2',
    type: 'document',
    user: 'Sophie Kramer',
    timestamp: '2026-02-23T08:30:00Z',
    description: 'Document processed: Annex_A_Price_Schedule.pdf',
  },
  {
    id: 'a3',
    type: 'status_change',
    user: 'Lena Hofmann',
    timestamp: '2026-02-22T16:45:00Z',
    description: 'Status changed to In Review',
    metadata: { from: 'New', to: 'In Review' },
  },
  {
    id: 'a4',
    type: 'task',
    user: 'Markus Bauer',
    timestamp: '2026-02-22T14:20:00Z',
    description: 'Task completed: Estimate effort & timeline',
  },
  {
    id: 'a5',
    type: 'comment',
    user: 'Sophie Kramer',
    timestamp: '2026-02-22T11:00:00Z',
    description: 'Added comment about ITIL certification gap',
  },
  {
    id: 'a6',
    type: 'system',
    timestamp: '2026-02-18T10:30:00Z',
    description: 'Brief generation completed',
  },
  {
    id: 'a7',
    type: 'system',
    timestamp: '2026-02-18T10:15:00Z',
    description: 'Document parsing started',
  },
];

export const MOCK_COMMENTS: ActivityComment[] = [
  {
    id: 'com1',
    user: 'Lena Hofmann',
    timestamp: '2026-02-23T09:00:00Z',
    content: '@Markus Bauer Can you confirm the technical concept will be ready by EOD tomorrow? We need to finalize the submission package.',
    mentions: ['Markus Bauer'],
  },
  {
    id: 'com2',
    user: 'Markus Bauer',
    timestamp: '2026-02-23T09:30:00Z',
    content: '@Lena Hofmann Yes, working on it now. The architecture diagram is done, just finalizing the SLA monitoring approach.',
    mentions: ['Lena Hofmann'],
  },
  {
    id: 'com3',
    user: 'Sophie Kramer',
    timestamp: '2026-02-22T11:00:00Z',
    content: 'Important: We only have ITIL v4 certification for one staff member but the tender requires 2. This is flagged in the fit score. @Lena Hofmann should we expedite certification for another team member?',
    mentions: ['Lena Hofmann'],
    attachments: [
      { id: 'att1', name: 'ITIL_Gap_Analysis.xlsx', url: '#' },
    ],
  },
  {
    id: 'com4',
    user: 'Lena Hofmann',
    timestamp: '2026-02-22T14:30:00Z',
    content: '@Sophie Kramer Good catch. I\'ve scheduled Michael for the ITIL v4 Foundation exam next week. We can include proof of registration in our submission.',
    mentions: ['Sophie Kramer'],
  },
  {
    id: 'com5',
    user: 'Markus Bauer',
    timestamp: '2026-02-21T16:15:00Z',
    content: 'The pricing model is challenging. The estimated workload (3,200 person-days) vs. our current capacity means we need to factor in 2 additional hires. Updated cost calculation attached.',
    attachments: [
      { id: 'att2', name: 'Cost_Calculation_v2.xlsx', url: '#' },
    ],
  },
];

// ──────────────────────────────────────────────────────────────────────────
// Company Profile
// ──────────────────────────────────────────────────────────────────────────
export interface CompanyProfileSection {
  id: string;
  label: string;
  completion: number;
  data?: Record<string, string | string[]>;
}

export const COMPANY_PROFILE_SECTIONS: CompanyProfileSection[] = [
  {
    id: 'services',
    label: 'Services',
    completion: 90,
    data: {
      primary: ['IT Helpdesk & Support', 'Cloud Infrastructure', 'DevOps', 'IT Consulting', 'Cybersecurity'],
      secondary: ['ERP Implementation', 'Change Management', 'Training'],
    },
  },
  { id: 'industries', label: 'Industries (NACE)', completion: 80 },
  { id: 'geography', label: 'Geography (ISO)', completion: 100 },
  { id: 'languages', label: 'Languages', completion: 100 },
  { id: 'delivery', label: 'Delivery Models', completion: 60 },
  { id: 'certifications', label: 'Certifications', completion: 75 },
  { id: 'security', label: 'Security / Data Protection', completion: 50 },
  { id: 'capacity', label: 'Capacity', completion: 70 },
  { id: 'commercial', label: 'Commercial', completion: 40 },
  { id: 'references', label: 'References', completion: 85 },
];

export const FIT_WEIGHTS = [
  { id: 'services', label: 'Services', weight: 25 },
  { id: 'industries', label: 'Industries', weight: 20 },
  { id: 'geography', label: 'Geography', weight: 15 },
  { id: 'languages', label: 'Languages', weight: 15 },
  { id: 'certifications', label: 'Certifications', weight: 15 },
  { id: 'capacity', label: 'Capacity', weight: 10 },
];
