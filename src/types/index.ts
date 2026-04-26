// ─── Resume & App Core ───────────────────────────────────────────────────────

export interface ResumeData {
  rawText: string;
  fileName: string;
  fileSize: number;
}

export type AppStep = 'upload' | 'options' | 'ats' | 'jobs';

// ─── ATS Analysis (resume quality scoring) ───────────────────────────────────

export interface ATSSection {
  name: string;
  score: number;
  maxScore: number;
  feedback: string[];
  improvements: string[];
  present: boolean;
  keywords?: string[];
  example?: string;
}

export interface ATSResult {
  overallScore: number;
  grade: string;
  sections: ATSSection[];
  extractedSkills: string[];
  extractedKeywords: string[];
  extractedJobTitle: string;
  detectedExperience: number;
  recommendations: Recommendation[];
  missingKeywords: string[];
  formattingIssues: string[];
  // New: structured candidate profile extracted from resume
  candidateProfile: CandidateProfile;
}

export interface Recommendation {
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  example?: string;
  impact: number;
}

// ─── Candidate Profile (PHASE 0) ─────────────────────────────────────────────

export interface CandidateProfile {
  name: string;
  currentRole: string;
  currentCompany: string;
  totalYoe: number;                  // total years of experience
  location: string;
  targetLocations: string[];

  primarySkills: string[];           // top 5-8 must-have skills
  secondarySkills: string[];         // supporting skills
  toolsAndInfra: string[];           // cloud, devops, CI/CD, DBs

  domainExpertise: string[];         // industry verticals / problem spaces
  quantifiedAchievements: string[];  // measurable outcomes from resume

  education: string;
  careerLevel: CareerLevel;

  salaryFloor: number;               // minimum acceptable (LPA)
  salaryTarget: number;              // ideal
  salaryStretch: number;             // aspirational max

  companyPreference: 'product' | 'service' | 'startup' | 'any';
  openToRemote: boolean | 'hybrid-only';
  noticePeriod: number | null;       // weeks
}

export type CareerLevel =
  | 'intern' | 'junior' | 'mid' | 'senior'
  | 'staff' | 'lead' | 'principal' | 'director' | 'vp' | 'c-level';

// ─── Job Scoring (PHASE 3) ────────────────────────────────────────────────────

export interface JobScoreBreakdown {
  d1PrimarySkills: number;    // 0-100
  d2SecondarySkills: number;  // 0-100
  d3ExperienceLevel: number;  // 0-100
  d4DomainAlignment: number;  // 0-100
  d5Location: number;         // 0-100
  d6CompanyFit: number;       // 0-100
  d7Salary: number;           // 0-100
  total: number;              // weighted total 0-100
}

export interface JobScoreWeights {
  d1PrimarySkills: number;
  d2SecondarySkills: number;
  d3ExperienceLevel: number;
  d4DomainAlignment: number;
  d5Location: number;
  d6CompanyFit: number;
  d7Salary: number;
}

export type FitBadge =
  | 'EXCEPTIONAL FIT'
  | 'STRONG FIT'
  | 'MODERATE FIT'
  | 'WEAK FIT'
  | 'DISCARD';

// ─── Job Result (PHASE 5 output) ──────────────────────────────────────────────

export interface RequirementMatch {
  requirement: string;
  candidateMatch: string;
  status: '✅' | '⚠️' | '❌';
}

export interface SkillGap {
  skill: string;
  bridgeable: boolean;
  howToBridge: string;
}

export interface JobResult {
  id: string;
  title: string;
  company: string;
  companyTier: CompanyTier;
  location: string;
  remoteType: 'on-site' | 'hybrid' | 'remote';
  description: string;

  // Scoring
  matchScore: number;           // 0-100 weighted total
  scoreBreakdown: JobScoreBreakdown;
  fitBadge: FitBadge;

  // Why it's a fit
  whyStrongFit: string[];
  requirementMatches: RequirementMatch[];
  skillGaps: SkillGap[];

  // Application intelligence
  applicationTip: string;
  atsKeywords: string[];

  // Meta
  salary?: string;
  salaryEstimated?: boolean;
  equityMentioned: boolean;
  jobType: string;
  postedDate: string;
  postedDaysAgo: number;
  applicantsCount?: number;
  applyLink: string;
  source: 'LinkedIn' | 'Naukri' | 'InstaHyre' | 'Indeed' | 'Glassdoor';
  skills: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  experience?: string;
  minYears?: number;
  maxYears?: number;
  companyLogo?: string;
  isRemote: boolean;
  isUrgent: boolean;           // posted < 3 days ago
  isStretchRole: boolean;      // one level above candidate
  glassdoorRating?: number;
}

export type CompanyTier =
  | 'FAANG'
  | 'Tier1Unicorn'
  | 'SeriesB+'
  | 'ListedProduct'
  | 'EarlyStartup'
  | 'MNCProduct'
  | 'ConsultingProduct'
  | 'ServiceOutsourcing'
  | 'Unknown';

// ─── Summary Dashboard (PHASE 6) ─────────────────────────────────────────────

export interface JobSearchSummary {
  totalScraped: number;
  qualified: number;           // 75%+
  exceptional: number;         // 90%+
  avgMatchScore: number;
  bestMatch: { company: string; role: string; score: number } | null;
  salaryRangeSeen: { min: string; max: string } | null;
  remoteRoles: number;
  topHiringCompanies: string[];
  mostDemandedSkill: string;
}

// ─── Resume Optimisation Tips (PHASE 7) ──────────────────────────────────────

export interface ResumeOptimisationTip {
  skill: string;
  frequencyPct: number;        // % of JDs that mention this skill
  candidateHasIt: boolean;
  suggestion: string;
}

export interface JobSearchParams {
  keywords: string;
  location: string;
  sources: ('LinkedIn' | 'Naukri' | 'InstaHyre')[];
  experienceLevel?: string;
}
