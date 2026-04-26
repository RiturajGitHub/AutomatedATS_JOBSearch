import {
  JobResult, CandidateProfile, JobScoreBreakdown,
  FitBadge, CompanyTier, RequirementMatch, SkillGap,
  JobSearchSummary, ResumeOptimisationTip,
} from '../types';

// ─── JSearch API (RapidAPI) ───────────────────────────────────────────────────

const JSEARCH_BASE_URL = 'https://jsearch.p.rapidapi.com';

interface JSearchJob {
  job_id: string;
  job_title: string;
  employer_name: string;
  employer_logo?: string;
  job_city?: string;
  job_state?: string;
  job_country?: string;
  job_description: string;
  job_apply_link: string;
  job_is_remote: boolean;
  job_posted_at_datetime_utc?: string;
  job_employment_type?: string;
  job_salary_min?: number;
  job_salary_max?: number;
  job_salary_currency?: string;
  job_salary_period?: string;
  job_required_skills?: string[];
  job_required_experience?: { required_experience_in_months?: number };
  job_publisher?: string;
  job_highlights?: {
    Qualifications?: string[];
    Responsibilities?: string[];
    Benefits?: string[];
  };
}

// ─── SYNONYM TABLE (PHASE 3 – D1/D2) ─────────────────────────────────────────

const SYNONYMS: Record<string, string[]> = {
  'kubernetes':        ['k8s', 'container orchestration', 'k8'],
  'k8s':              ['kubernetes', 'container orchestration'],
  'kafka':            ['apache kafka', 'event streaming', 'pub-sub', 'message queue'],
  'redis':            ['in-memory cache', 'memcached', 'caching layer'],
  'aws':              ['amazon web services', 'amazon cloud', 'ec2', 's3', 'lambda'],
  'gcp':              ['google cloud', 'google cloud platform', 'bigquery'],
  'azure':            ['microsoft azure', 'microsoft cloud'],
  'ci/cd':            ['jenkins', 'github actions', 'gitlab ci', 'pipelines', 'continuous integration', 'continuous deployment'],
  'jenkins':          ['ci/cd', 'continuous integration'],
  'github actions':   ['ci/cd', 'continuous integration'],
  'monitoring':       ['prometheus', 'grafana', 'datadog', 'observability', 'splunk'],
  'prometheus':       ['monitoring', 'observability'],
  'grafana':          ['monitoring', 'dashboards'],
  'datadog':          ['monitoring', 'apm'],
  'postgresql':       ['postgres', 'relational db', 'rdbms', 'sql database'],
  'mysql':            ['relational db', 'rdbms', 'sql database'],
  'mongodb':          ['nosql', 'document db', 'document store'],
  'nosql':            ['mongodb', 'cassandra', 'dynamodb', 'document db'],
  'dynamodb':         ['nosql', 'aws dynamodb'],
  'cassandra':        ['nosql', 'wide column'],
  'elasticsearch':    ['elastic', 'search engine', 'elk stack'],
  'node.js':          ['nodejs', 'node', 'javascript backend'],
  'nodejs':           ['node.js', 'node', 'javascript backend'],
  'react':            ['reactjs', 'react.js'],
  'vue':              ['vuejs', 'vue.js'],
  'angular':          ['angularjs'],
  'next.js':          ['nextjs', 'next'],
  'spring':           ['spring boot', 'spring framework', 'java spring'],
  'spring boot':      ['spring', 'java spring'],
  'python':           ['py'],
  'javascript':       ['js', 'ecmascript', 'es6'],
  'typescript':       ['ts'],
  'golang':           ['go'],
  'go':               ['golang'],
  'machine learning': ['ml', 'ai', 'artificial intelligence', 'predictive modeling'],
  'deep learning':    ['dl', 'neural networks', 'neural network'],
  'llm':              ['large language model', 'generative ai', 'gpt', 'openai'],
  'generative ai':    ['llm', 'genai', 'gpt', 'openai', 'large language model'],
  'docker':           ['containerization', 'containers'],
  'terraform':        ['infrastructure as code', 'iac'],
  'microservices':    ['distributed systems', 'service mesh', 'soa'],
  'rest':             ['restful', 'rest api', 'http api'],
  'graphql':          ['graph api'],
  'grpc':             ['protocol buffers', 'protobuf'],
  'devops':           ['sre', 'platform engineering', 'infrastructure'],
  'sre':              ['devops', 'site reliability', 'platform engineering'],
};

// ─── COMPANY TIER CLASSIFICATION ─────────────────────────────────────────────

const FAANG_COMPANIES = [
  'google', 'meta', 'facebook', 'amazon', 'apple', 'netflix', 'microsoft',
  'alphabet', 'aws', 'azure',
];

const TIER1_UNICORNS = [
  'stripe', 'uber', 'airbnb', 'flipkart', 'swiggy', 'zomato', 'razorpay',
  'paytm', 'phonepe', 'ola', 'byju', 'meesho', 'cred', 'zepto', 'groww',
  'zerodha', 'freshworks', 'zoho', 'atlassian', 'shopify', 'twilio',
  'databricks', 'snowflake', 'figma', 'notion', 'canva', 'instacart',
  'coinbase', 'robinhood', 'plaid', 'brex', 'rippling',
];

const SERVICE_COMPANIES = [
  'infosys', 'tcs', 'wipro', 'hcl', 'tech mahindra', 'cognizant', 'capgemini',
  'accenture', 'ibm', 'deloitte', 'kpmg', 'ey', 'pwc', 'mphasis', 'hexaware',
  'mindtree', 'l&t infotech', 'ltimindtree', 'persistent', 'cyient',
];

const MNC_PRODUCT = [
  'oracle', 'sap', 'salesforce', 'servicenow', 'workday', 'adobe', 'vmware',
  'cisco', 'intel', 'qualcomm', 'nvidia', 'dell', 'hp', 'ibm', 'siemens',
  'bosch', 'philips', 'honeywell', 'ge', 'jpmorgan', 'goldman sachs',
  'morgan stanley', 'visa', 'mastercard', 'paypal',
];

function classifyCompanyTier(companyName: string): CompanyTier {
  const lower = companyName.toLowerCase();
  if (FAANG_COMPANIES.some(c => lower.includes(c))) return 'FAANG';
  if (TIER1_UNICORNS.some(c => lower.includes(c))) return 'Tier1Unicorn';
  if (SERVICE_COMPANIES.some(c => lower.includes(c))) return 'ServiceOutsourcing';
  if (MNC_PRODUCT.some(c => lower.includes(c))) return 'MNCProduct';
  // Heuristics for others
  if (lower.includes('consulting') || lower.includes('solutions') || lower.includes('services')) {
    return 'ConsultingProduct';
  }
  return 'Unknown';
}

// ─── JD PARSER (PHASE 3 – STEP A) ────────────────────────────────────────────

interface ParsedJD {
  requiredSkills: string[];
  preferredSkills: string[];
  allSkills: string[];
  minYears: number;
  maxYears: number | null;
  seniorityTitle: string;
  seniorityTag: string;
  domainSignals: string[];
  remoteType: 'on-site' | 'hybrid' | 'remote';
  equityMentioned: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
}

const ALL_SKILLS_PATTERN = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'golang', 'rust',
  'swift', 'kotlin', 'scala', 'ruby', 'php', 'react', 'angular', 'vue', 'node.js',
  'nodejs', 'express', 'django', 'flask', 'fastapi', 'spring', 'spring boot', 'rails',
  'html', 'css', 'tailwind', 'bootstrap', 'aws', 'azure', 'gcp', 'docker', 'kubernetes',
  'k8s', 'terraform', 'ansible', 'git', 'jenkins', 'ci/cd', 'graphql', 'rest', 'grpc',
  'microservices', 'kafka', 'rabbitmq', 'machine learning', 'deep learning', 'tensorflow',
  'pytorch', 'scikit-learn', 'pandas', 'numpy', 'data science', 'nlp', 'llm',
  'generative ai', 'react native', 'flutter', 'android', 'ios', 'firebase', 'linux',
  'bash', 'sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch',
  'cassandra', 'dynamodb', 'snowflake', 'spark', 'hadoop', 'airflow', 'dbt',
  'prometheus', 'grafana', 'datadog', 'splunk', 'next.js', 'nuxt.js',
];

const DOMAIN_SIGNALS: Record<string, string[]> = {
  'fintech/payments/billing': ['fintech', 'payment', 'billing', 'banking', 'finance', 'trading', 'insurance', 'lending', 'wallet', 'upi'],
  'cloud/infrastructure/SRE': ['cloud', 'infrastructure', 'sre', 'site reliability', 'platform engineering', 'distributed systems'],
  'ML/AI/data': ['machine learning', 'artificial intelligence', 'data science', 'deep learning', 'nlp', 'llm', 'generative ai', 'analytics'],
  'ecommerce/marketplace': ['ecommerce', 'e-commerce', 'marketplace', 'retail', 'supply chain', 'logistics', 'inventory'],
  'health/edtech/logistics': ['healthcare', 'health tech', 'edtech', 'education', 'logistics', 'delivery', 'telemedicine'],
  'developer tools/platform/SDK': ['developer tools', 'sdk', 'api platform', 'developer experience', 'open source'],
  'gaming/media/entertainment': ['gaming', 'game', 'media', 'entertainment', 'streaming', 'video', 'ott'],
  'enterprise/SaaS/B2B': ['enterprise', 'saas', 'b2b', 'crm', 'erp', 'workflow', 'automation'],
};

function parseJD(description: string, requiredSkillsFromAPI: string[]): ParsedJD {
  const lower = description.toLowerCase();

  // Split into required vs preferred sections
  const requiredSection = extractSection(lower, ['required', 'must have', 'must-have', 'qualifications', 'requirements']);
  const preferredSection = extractSection(lower, ['preferred', 'nice to have', 'nice-to-have', 'bonus', 'plus', 'good to have']);

  const requiredSkills = [
    ...requiredSkillsFromAPI,
    ...ALL_SKILLS_PATTERN.filter(s => requiredSection.includes(s.toLowerCase())),
  ];
  const preferredSkills = ALL_SKILLS_PATTERN.filter(s =>
    preferredSection.includes(s.toLowerCase()) && !requiredSkills.includes(s)
  );
  const allSkills = [...new Set([...requiredSkills, ...preferredSkills,
    ...ALL_SKILLS_PATTERN.filter(s => lower.includes(s.toLowerCase()))])];

  // Extract years
  const yearsPatterns = [
    /(\d+)\+?\s*(?:to|-)\s*(\d+)\s*years?/i,
    /(\d+)\+?\s*years?\s+(?:of\s+)?(?:experience|exp)/i,
    /minimum\s+(\d+)\s*years?/i,
    /at\s+least\s+(\d+)\s*years?/i,
  ];
  let minYears = 0;
  let maxYears: number | null = null;
  for (const p of yearsPatterns) {
    const m = lower.match(p);
    if (m) {
      minYears = parseInt(m[1]);
      if (m[2]) maxYears = parseInt(m[2]);
      break;
    }
  }

  // Seniority
  const seniorityTag =
    lower.includes('principal') ? 'principal' :
    lower.includes('staff') ? 'staff' :
    lower.includes('senior') || lower.includes('sr.') ? 'senior' :
    lower.includes('lead') ? 'lead' :
    lower.includes('mid-senior') || lower.includes('mid senior') ? 'mid-senior' :
    lower.includes('junior') || lower.includes('jr.') ? 'junior' :
    lower.includes('entry') ? 'entry' :
    lower.includes('intern') ? 'intern' : 'mid';

  const seniorityTitle =
    lower.includes('sde-3') || lower.includes('sde3') ? 'SDE-3' :
    lower.includes('sde-2') || lower.includes('sde2') ? 'SDE-2' :
    lower.includes('sde-1') || lower.includes('sde1') ? 'SDE-1' :
    seniorityTag.charAt(0).toUpperCase() + seniorityTag.slice(1);

  // Domain signals
  const domainSignals: string[] = [];
  for (const [domain, keywords] of Object.entries(DOMAIN_SIGNALS)) {
    if (keywords.some(kw => lower.includes(kw))) domainSignals.push(domain);
  }

  // Remote type
  const remoteType: 'on-site' | 'hybrid' | 'remote' =
    lower.includes('fully remote') || lower.includes('100% remote') || lower.includes('work from home') ? 'remote' :
    lower.includes('hybrid') ? 'hybrid' :
    lower.includes('remote') ? 'remote' : 'on-site';

  // Equity
  const equityMentioned = /esop|rsu|equity|stock option|vesting/.test(lower);

  return {
    requiredSkills: [...new Set(requiredSkills)],
    preferredSkills: [...new Set(preferredSkills)],
    allSkills: [...new Set(allSkills)],
    minYears,
    maxYears,
    seniorityTitle,
    seniorityTag,
    domainSignals,
    remoteType,
    equityMentioned,
    salaryMin: null,
    salaryMax: null,
  };
}

function extractSection(text: string, markers: string[]): string {
  for (const marker of markers) {
    const idx = text.indexOf(marker);
    if (idx !== -1) {
      return text.substring(idx, Math.min(idx + 800, text.length));
    }
  }
  return '';
}

// ─── SYNONYM MATCHING ─────────────────────────────────────────────────────────

function skillMatchesWithSynonyms(candidateSkill: string, jdSkill: string): number {
  const cs = candidateSkill.toLowerCase();
  const js = jdSkill.toLowerCase();
  if (cs === js) return 1.0;
  if (cs.includes(js) || js.includes(cs)) return 0.9;
  const cSynonyms = SYNONYMS[cs] || [];
  const jSynonyms = SYNONYMS[js] || [];
  if (cSynonyms.includes(js) || jSynonyms.includes(cs)) return 0.85;
  // Partial synonym overlap
  if (cSynonyms.some(s => js.includes(s)) || jSynonyms.some(s => cs.includes(s))) return 0.7;
  return 0;
}

function bestSkillMatch(candidateSkills: string[], jdSkill: string): number {
  let best = 0;
  for (const cs of candidateSkills) {
    const score = skillMatchesWithSynonyms(cs, jdSkill);
    if (score > best) best = score;
  }
  return best;
}

// ─── PHASE 3 – DIMENSION SCORERS ─────────────────────────────────────────────

// D1: Primary Skills Match (weight 25%)
function scoreD1(jd: ParsedJD, profile: CandidateProfile, jobTitle: string): number {
  const allCandidateSkills = [...profile.primarySkills, ...profile.secondarySkills];

  // Required skills match
  let requiredMatchSum = 0;
  for (const skill of jd.requiredSkills) {
    requiredMatchSum += bestSkillMatch(allCandidateSkills, skill);
  }
  const requiredMatchRate = jd.requiredSkills.length > 0
    ? requiredMatchSum / jd.requiredSkills.length : 0.5;

  // Preferred skills match
  let preferredMatchSum = 0;
  for (const skill of jd.preferredSkills) {
    preferredMatchSum += bestSkillMatch(allCandidateSkills, skill);
  }
  const preferredMatchRate = jd.preferredSkills.length > 0
    ? preferredMatchSum / jd.preferredSkills.length : 0.5;

  // Title boost: if primary skill appears in job title
  const titleLower = jobTitle.toLowerCase();
  const titleBoost = profile.primarySkills.some(s => titleLower.includes(s.toLowerCase())) ? 1.5 : 1.0;

  const raw = (requiredMatchRate * 0.7 + preferredMatchRate * 0.3) * 100;
  return Math.min(raw * titleBoost, 100);
}

// D2: Secondary Skills Match (weight 20%)
function scoreD2(jd: ParsedJD, profile: CandidateProfile): number {
  const candidateSecondary = [...profile.secondarySkills, ...profile.toolsAndInfra];
  let matchSum = 0;
  for (const skill of jd.allSkills) {
    matchSum += bestSkillMatch(candidateSecondary, skill);
  }
  return Math.min((matchSum / Math.max(jd.allSkills.length, 1)) * 100, 100);
}

// D3: Experience Level Fit (weight 15%)
function scoreD3(jd: ParsedJD, profile: CandidateProfile): number {
  const yoe = profile.totalYoe;
  const jdMin = jd.minYears ?? 0;
  const jdMax = jd.maxYears ?? 99;

  let yearsScore: number;
  if (yoe >= jdMin && yoe <= jdMax) {
    yearsScore = 100;
  } else if (yoe < jdMin) {
    const gap = jdMin - yoe;
    yearsScore = Math.max(100 - gap * 15, 0);
  } else {
    const surplus = yoe - jdMax;
    yearsScore = Math.max(100 - surplus * 10, 50);
  }

  // Seniority alignment
  const seniorityScoreMap: Record<string, number> = {
    intern: 10, entry: 20, junior: 35, mid: 60, 'mid-senior': 80,
    senior: 90, staff: 85, lead: 75, principal: 70, director: 40, vp: 20, 'c-level': 10,
  };

  const careerLevelToSeniority: Record<string, string> = {
    intern: 'intern', junior: 'junior', mid: 'mid', senior: 'senior',
    staff: 'staff', lead: 'lead', principal: 'principal',
    director: 'director', vp: 'vp', 'c-level': 'c-level',
  };

  const candidateSeniorityKey = careerLevelToSeniority[profile.careerLevel] || 'mid';
  const jdSeniorityKey = jd.seniorityTag;

  const seniorityOrder = ['intern', 'entry', 'junior', 'mid', 'mid-senior', 'senior', 'staff', 'lead', 'principal', 'director', 'vp', 'c-level'];
  const candidateIdx = seniorityOrder.indexOf(candidateSeniorityKey);
  const jdIdx = seniorityOrder.indexOf(jdSeniorityKey);
  const distance = Math.abs(candidateIdx - jdIdx);

  let seniorityScore: number;
  if (distance === 0) seniorityScore = seniorityScoreMap[jdSeniorityKey] ?? 70;
  else if (distance === 1) seniorityScore = Math.max((seniorityScoreMap[jdSeniorityKey] ?? 70) - 15, 30);
  else seniorityScore = Math.max((seniorityScoreMap[jdSeniorityKey] ?? 70) - distance * 20, 10);

  return yearsScore * 0.6 + seniorityScore * 0.4;
}

// D4: Domain / Industry Alignment (weight 15%)
function scoreD4(jd: ParsedJD, profile: CandidateProfile): number {
  if (jd.domainSignals.length === 0) return 60; // neutral
  let totalScore = 0;
  for (const signal of jd.domainSignals) {
    if (profile.domainExpertise.includes(signal)) {
      totalScore += 100;
    } else {
      // Check adjacency
      const adjacent = isAdjacentDomain(signal, profile.domainExpertise);
      totalScore += adjacent ? 60 : 30;
    }
  }
  return Math.min(totalScore / jd.domainSignals.length, 100);
}

function isAdjacentDomain(signal: string, candidateDomains: string[]): boolean {
  const adjacencyMap: Record<string, string[]> = {
    'fintech/payments/billing': ['enterprise/SaaS/B2B', 'ecommerce/marketplace'],
    'cloud/infrastructure/SRE': ['developer tools/platform/SDK', 'enterprise/SaaS/B2B'],
    'ML/AI/data': ['enterprise/SaaS/B2B', 'health/edtech/logistics'],
    'ecommerce/marketplace': ['fintech/payments/billing', 'health/edtech/logistics'],
    'health/edtech/logistics': ['ecommerce/marketplace', 'enterprise/SaaS/B2B'],
    'developer tools/platform/SDK': ['cloud/infrastructure/SRE', 'enterprise/SaaS/B2B'],
    'gaming/media/entertainment': ['ecommerce/marketplace'],
    'enterprise/SaaS/B2B': ['fintech/payments/billing', 'cloud/infrastructure/SRE', 'developer tools/platform/SDK'],
  };
  const adjacent = adjacencyMap[signal] || [];
  return candidateDomains.some(d => adjacent.includes(d));
}

// D5: Location Fit (weight 5%)
function scoreD5(jd: ParsedJD, jobLocation: string, profile: CandidateProfile): number {
  if (jd.remoteType === 'remote') {
    if (profile.openToRemote === false) return 50;
    return 95;
  }
  if (jd.remoteType === 'hybrid') {
    if (profile.openToRemote === false) return 60;
    return 85;
  }

  const jobLocLower = jobLocation.toLowerCase();
  const targetLocs = profile.targetLocations.map(l => l.toLowerCase());

  if (targetLocs.some(loc => jobLocLower.includes(loc))) return 100;
  if (jobLocLower.includes('india') && targetLocs.some(l => l !== 'remote')) return 60;
  if (jobLocLower.includes('remote')) return 90;
  return 20;
}

// D6: Company Type Preference Fit (weight 10%)
function scoreD6(tier: CompanyTier, profile: CandidateProfile, glassdoorRating?: number): number {
  const tierScoreProduct: Record<CompanyTier, number> = {
    FAANG: 100, Tier1Unicorn: 95, 'SeriesB+': 85, ListedProduct: 80,
    MNCProduct: 75, EarlyStartup: 65, ConsultingProduct: 55,
    ServiceOutsourcing: 25, Unknown: 50,
  };

  let baseScore: number;
  if (profile.companyPreference === 'product') {
    baseScore = tierScoreProduct[tier];
  } else if (profile.companyPreference === 'startup') {
    const startupMap: Record<CompanyTier, number> = {
      FAANG: 60, Tier1Unicorn: 85, 'SeriesB+': 95, ListedProduct: 70,
      MNCProduct: 55, EarlyStartup: 100, ConsultingProduct: 40,
      ServiceOutsourcing: 20, Unknown: 60,
    };
    baseScore = startupMap[tier];
  } else if (profile.companyPreference === 'service') {
    const serviceMap: Record<CompanyTier, number> = {
      FAANG: 70, Tier1Unicorn: 70, 'SeriesB+': 70, ListedProduct: 70,
      MNCProduct: 80, EarlyStartup: 60, ConsultingProduct: 90,
      ServiceOutsourcing: 100, Unknown: 70,
    };
    baseScore = serviceMap[tier];
  } else {
    // 'any' — flatten
    baseScore = tier === 'ServiceOutsourcing' ? 50 : 80;
  }

  // Glassdoor rating adjustment
  let ratingAdj = 0;
  if (glassdoorRating !== undefined) {
    if (glassdoorRating >= 4.0) ratingAdj = 5;
    else if (glassdoorRating < 3.0) ratingAdj = -10;
  }

  return Math.min(Math.max(baseScore + ratingAdj, 0), 100);
}

// D7: Salary / Compensation Fit (weight 10%)
function scoreD7(
  tier: CompanyTier,
  profile: CandidateProfile,
  salaryMin?: number,
  salaryMax?: number,
  equityMentioned?: boolean,
): number {
  let salaryScore: number;

  if (salaryMin !== undefined && salaryMax !== undefined && salaryMin > 0) {
    // Convert to LPA if needed (assume INR annual)
    const jdMid = (salaryMin + salaryMax) / 2;
    const candidateMid = profile.salaryTarget;
    if (candidateMid === 0) {
      salaryScore = 70; // unknown target
    } else {
      const ratio = jdMid / candidateMid;
      if (ratio >= 0.9 && ratio <= 1.3) salaryScore = 100;
      else if (ratio >= 0.75) salaryScore = 80;
      else if (ratio >= 0.6) salaryScore = 60;
      else if (ratio < 0.6) salaryScore = 20;
      else salaryScore = 90;
    }
  } else {
    // Estimate from tier
    const tierSalaryScore: Record<CompanyTier, number> = {
      FAANG: 90, Tier1Unicorn: 85, 'SeriesB+': 75, ListedProduct: 70,
      MNCProduct: 70, EarlyStartup: 50, ConsultingProduct: 45,
      ServiceOutsourcing: 30, Unknown: 55,
    };
    salaryScore = tierSalaryScore[tier];
  }

  if (equityMentioned) salaryScore = Math.min(salaryScore + 10, 100);
  return salaryScore;
}

// ─── WEIGHTED TOTAL SCORE (PHASE 3 – STEP C) ─────────────────────────────────

const DEFAULT_WEIGHTS = {
  d1PrimarySkills:   0.25,
  d2SecondarySkills: 0.20,
  d3ExperienceLevel: 0.15,
  d4DomainAlignment: 0.15,
  d5Location:        0.05,
  d6CompanyFit:      0.10,
  d7Salary:          0.10,
};

function computeWeightedScore(breakdown: Omit<JobScoreBreakdown, 'total'>): number {
  return Math.round(
    breakdown.d1PrimarySkills   * DEFAULT_WEIGHTS.d1PrimarySkills +
    breakdown.d2SecondarySkills * DEFAULT_WEIGHTS.d2SecondarySkills +
    breakdown.d3ExperienceLevel * DEFAULT_WEIGHTS.d3ExperienceLevel +
    breakdown.d4DomainAlignment * DEFAULT_WEIGHTS.d4DomainAlignment +
    breakdown.d5Location        * DEFAULT_WEIGHTS.d5Location +
    breakdown.d6CompanyFit      * DEFAULT_WEIGHTS.d6CompanyFit +
    breakdown.d7Salary          * DEFAULT_WEIGHTS.d7Salary
  );
}

function getFitBadge(score: number): FitBadge {
  if (score >= 90) return 'EXCEPTIONAL FIT';
  if (score >= 75) return 'STRONG FIT';
  if (score >= 60) return 'MODERATE FIT';
  if (score >= 40) return 'WEAK FIT';
  return 'DISCARD';
}

// ─── PHASE 5 – OUTPUT BUILDERS ────────────────────────────────────────────────

function buildWhyStrongFit(
  jd: ParsedJD,
  profile: CandidateProfile,
  breakdown: JobScoreBreakdown,
  jobTitle: string,
): string[] {
  const reasons: string[] = [];
  const allCandidateSkills = [...profile.primarySkills, ...profile.secondarySkills, ...profile.toolsAndInfra];

  // Matched required skills
  const matchedRequired = jd.requiredSkills.filter(s =>
    bestSkillMatch(allCandidateSkills, s) >= 0.7
  );
  if (matchedRequired.length > 0) {
    reasons.push(`✅ Matches ${matchedRequired.length}/${jd.requiredSkills.length} required skills: ${matchedRequired.slice(0, 4).join(', ')}`);
  }

  // Quantified achievements tie-in
  if (profile.quantifiedAchievements.length > 0) {
    reasons.push(`📊 Your achievement "${profile.quantifiedAchievements[0].substring(0, 80)}" directly aligns with this role's impact expectations`);
  }

  // Seniority alignment
  if (breakdown.d3ExperienceLevel >= 80) {
    reasons.push(`🎯 Your ${profile.totalYoe} years of experience is a strong fit for this ${jd.seniorityTag}-level role`);
  }

  // Domain alignment
  if (breakdown.d4DomainAlignment >= 75) {
    const matchedDomains = jd.domainSignals.filter(d => profile.domainExpertise.includes(d));
    if (matchedDomains.length > 0) {
      reasons.push(`🏭 Domain expertise in ${matchedDomains[0]} directly matches this role`);
    }
  }

  // Remote / location
  if (jd.remoteType === 'remote') {
    reasons.push('🏠 Fully remote role — matches your work preference');
  }

  // Equity
  if (jd.equityMentioned) {
    reasons.push('💰 Equity/ESOP mentioned — HIGH COMP POTENTIAL');
  }

  // Title match
  const titleLower = jobTitle.toLowerCase();
  if (profile.primarySkills.some(s => titleLower.includes(s.toLowerCase()))) {
    reasons.push(`🔑 Your primary skill appears directly in the job title`);
  }

  return reasons.slice(0, 5);
}

function buildRequirementMatches(
  jd: ParsedJD,
  profile: CandidateProfile,
): RequirementMatch[] {
  const allCandidateSkills = [...profile.primarySkills, ...profile.secondarySkills, ...profile.toolsAndInfra];
  const matches: RequirementMatch[] = [];

  for (const req of jd.requiredSkills.slice(0, 8)) {
    const matchScore = bestSkillMatch(allCandidateSkills, req);
    const matchedSkill = allCandidateSkills.find(s => skillMatchesWithSynonyms(s, req) >= 0.7);
    matches.push({
      requirement: req,
      candidateMatch: matchedSkill || (matchScore >= 0.5 ? `Partial: ${req}` : 'Not found'),
      status: matchScore >= 0.8 ? '✅' : matchScore >= 0.5 ? '⚠️' : '❌',
    });
  }

  // Add experience requirement
  if (jd.minYears > 0) {
    const yoeMatch = profile.totalYoe >= jd.minYears;
    matches.push({
      requirement: `${jd.minYears}+ years experience`,
      candidateMatch: `${profile.totalYoe} years`,
      status: yoeMatch ? '✅' : profile.totalYoe >= jd.minYears - 1 ? '⚠️' : '❌',
    });
  }

  return matches;
}

function buildSkillGaps(jd: ParsedJD, profile: CandidateProfile): SkillGap[] {
  const allCandidateSkills = [...profile.primarySkills, ...profile.secondarySkills, ...profile.toolsAndInfra];
  const gaps: SkillGap[] = [];

  for (const skill of jd.requiredSkills) {
    const matchScore = bestSkillMatch(allCandidateSkills, skill);
    if (matchScore < 0.5) {
      const bridgeable = isBridgeable(skill);
      gaps.push({
        skill,
        bridgeable,
        howToBridge: bridgeable
          ? `Complete a ${skill} course on Udemy/Coursera (2-4 weeks) and add a project`
          : `${skill} requires significant hands-on experience — consider adjacent roles first`,
      });
    }
  }

  return gaps.slice(0, 4);
}

function isBridgeable(skill: string): boolean {
  const quickLearn = ['docker', 'git', 'sql', 'rest', 'graphql', 'redis', 'linux', 'bash',
    'terraform', 'ansible', 'prometheus', 'grafana', 'next.js', 'tailwind', 'bootstrap'];
  return quickLearn.some(q => skill.toLowerCase().includes(q));
}

function buildApplicationTip(
  jd: ParsedJD,
  profile: CandidateProfile,
  jobTitle: string,
  company: string,
): string {
  const achievement = profile.quantifiedAchievements[0] || `${profile.totalYoe}+ years of ${profile.primarySkills[0] || 'engineering'} experience`;
  const topMatchedSkill = jd.requiredSkills.find(s =>
    bestSkillMatch(profile.primarySkills, s) >= 0.7
  ) || profile.primarySkills[0] || 'your core skills';

  return `Lead your cover letter with: "${achievement}". Emphasise your ${topMatchedSkill} expertise since it appears prominently in this JD. Mirror the exact phrase "${jd.seniorityTag} ${jobTitle.toLowerCase()}" in your application. For ${company}, highlight any ${jd.domainSignals[0] || 'product'} domain experience you have.`;
}

function buildATSKeywords(jd: ParsedJD, profile: CandidateProfile): string[] {
  const allCandidateSkills = [...profile.primarySkills, ...profile.secondarySkills, ...profile.toolsAndInfra];
  // Prioritise rare/specific keywords the candidate doesn't already have prominently
  const keywords = jd.allSkills
    .filter(s => !allCandidateSkills.some(cs => cs.toLowerCase() === s.toLowerCase()))
    .slice(0, 6);

  // Also add matched required skills (exact JD phrasing)
  const matched = jd.requiredSkills
    .filter(s => bestSkillMatch(allCandidateSkills, s) >= 0.7)
    .slice(0, 4);

  return [...new Set([...matched, ...keywords])].slice(0, 10);
}

// ─── PHASE 4 – DEDUPLICATION + HARD FILTERS ──────────────────────────────────

function deduplicateJobs(jobs: JobResult[]): JobResult[] {
  const seen = new Map<string, JobResult>();
  for (const job of jobs) {
    const key = `${job.company.toLowerCase().trim()}|${job.title.toLowerCase().trim()}`;
    const existing = seen.get(key);
    if (!existing || job.matchScore > existing.matchScore || job.postedDaysAgo < existing.postedDaysAgo) {
      seen.set(key, job);
    }
  }
  return Array.from(seen.values());
}

function passesHardFilters(
  job: JobResult,
  profile: CandidateProfile,
  freshnessWindow: number = 14,
): boolean {
  // Freshness
  if (job.postedDaysAgo > freshnessWindow) return false;

  // Experience range
  if (job.minYears !== undefined && job.minYears > profile.totalYoe + 2) return false;
  if (job.maxYears !== undefined && job.maxYears < profile.totalYoe - 2) return false;

  // Salary floor (only if salary is disclosed)
  // We skip this hard filter since salary data is rarely available in API

  // Company type hard filter
  if (
    profile.companyPreference === 'product' &&
    job.companyTier === 'ServiceOutsourcing' &&
    job.scoreBreakdown.d6CompanyFit < 35
  ) return false;

  return true;
}

// ─── FULL JOB SCORING PIPELINE ────────────────────────────────────────────────

function scoreJob(
  raw: JSearchJob,
  profile: CandidateProfile,
  postedDaysAgo: number,
): JobResult {
  const jd = parseJD(raw.job_description || '', raw.job_required_skills || []);
  const tier = classifyCompanyTier(raw.employer_name);
  const locationStr = [raw.job_city, raw.job_state, raw.job_country].filter(Boolean).join(', ') || 'Remote';

  // Compute all 7 dimensions
  const d1 = Math.round(scoreD1(jd, profile, raw.job_title));
  const d2 = Math.round(scoreD2(jd, profile));
  const d3 = Math.round(scoreD3(jd, profile));
  const d4 = Math.round(scoreD4(jd, profile));
  const d5 = Math.round(scoreD5(jd, locationStr, profile));
  const d6 = Math.round(scoreD6(tier, profile));
  const d7 = Math.round(scoreD7(
    tier, profile,
    raw.job_salary_min, raw.job_salary_max,
    jd.equityMentioned,
  ));

  const breakdown: JobScoreBreakdown = {
    d1PrimarySkills: d1,
    d2SecondarySkills: d2,
    d3ExperienceLevel: d3,
    d4DomainAlignment: d4,
    d5Location: d5,
    d6CompanyFit: d6,
    d7Salary: d7,
    total: 0,
  };
  breakdown.total = computeWeightedScore(breakdown);

  const fitBadge = getFitBadge(breakdown.total);
  const isStretchRole = isOneAbove(jd.seniorityTag, profile.careerLevel);

  const whyStrongFit = buildWhyStrongFit(jd, profile, breakdown, raw.job_title);
  const requirementMatches = buildRequirementMatches(jd, profile);
  const skillGaps = buildSkillGaps(jd, profile);
  const applicationTip = buildApplicationTip(jd, profile, raw.job_title, raw.employer_name);
  const atsKeywords = buildATSKeywords(jd, profile);

  const salary = formatSalary(raw);

  return {
    id: raw.job_id,
    title: raw.job_title,
    company: raw.employer_name,
    companyTier: tier,
    location: locationStr,
    remoteType: jd.remoteType,
    description: (raw.job_description || '').substring(0, 600) + ((raw.job_description || '').length > 600 ? '...' : ''),
    matchScore: breakdown.total,
    scoreBreakdown: breakdown,
    fitBadge,
    whyStrongFit,
    requirementMatches,
    skillGaps,
    applicationTip,
    atsKeywords,
    salary,
    salaryEstimated: !raw.job_salary_min,
    equityMentioned: jd.equityMentioned,
    jobType: raw.job_employment_type || 'Full-time',
    postedDate: formatPostedDate(raw.job_posted_at_datetime_utc),
    postedDaysAgo,
    applyLink: raw.job_apply_link,
    source: getJobSource(raw),
    skills: jd.allSkills.slice(0, 12),
    requiredSkills: jd.requiredSkills,
    preferredSkills: jd.preferredSkills,
    experience: getExperienceRequired(raw),
    minYears: jd.minYears,
    maxYears: jd.maxYears ?? undefined,
    companyLogo: raw.employer_logo,
    isRemote: raw.job_is_remote || jd.remoteType === 'remote',
    isUrgent: postedDaysAgo <= 3,
    isStretchRole,
    glassdoorRating: undefined,
  };
}

function isOneAbove(jdSeniority: string, candidateLevel: string): boolean {
  const order = ['intern', 'junior', 'mid', 'mid-senior', 'senior', 'staff', 'lead', 'principal', 'director'];
  const jdIdx = order.indexOf(jdSeniority);
  const candidateIdx = order.indexOf(candidateLevel);
  return jdIdx === candidateIdx + 1;
}

// ─── PHASE 1 – SEARCH QUERY GENERATION ───────────────────────────────────────

export function generateSearchQueries(profile: CandidateProfile): string[] {
  const queries: string[] = [];
  const role = profile.currentRole;
  const skill1 = profile.primarySkills[0] || '';
  const skill2 = profile.primarySkills[1] || '';
  const level = profile.careerLevel;

  // Tier 1 — exact match
  queries.push(role);
  if (skill1 && skill2) queries.push(`${skill1} ${skill2} ${level}`);
  if (profile.domainExpertise[0]) queries.push(`${level} ${profile.domainExpertise[0]} engineer`);

  // Tier 2 — lateral
  queries.push(`${skill1} backend engineer`);
  queries.push(`${skill1} platform engineer`);

  // Tier 3 — stretch (one level up)
  const levelUp = getLevelUp(level);
  if (levelUp) queries.push(`${levelUp} ${role}`);

  return [...new Set(queries)].filter(Boolean).slice(0, 5);
}

function getLevelUp(level: string): string {
  const map: Record<string, string> = {
    intern: 'junior', junior: 'mid-level', mid: 'senior',
    senior: 'staff', staff: 'principal', lead: 'principal',
    principal: 'director',
  };
  return map[level] || '';
}

// ─── PHASE 6 – SUMMARY DASHBOARD ─────────────────────────────────────────────

export function buildSummaryDashboard(jobs: JobResult[]): JobSearchSummary {
  const qualified = jobs.filter(j => j.matchScore >= 75);
  const exceptional = jobs.filter(j => j.matchScore >= 90);
  const avgScore = jobs.length > 0
    ? Math.round(jobs.reduce((s, j) => s + j.matchScore, 0) / jobs.length)
    : 0;

  const best = jobs.length > 0
    ? jobs.reduce((a, b) => a.matchScore > b.matchScore ? a : b)
    : null;

  const remoteRoles = jobs.filter(j => j.isRemote).length;

  // Top hiring companies
  const companyCounts = new Map<string, number>();
  for (const j of jobs) {
    companyCounts.set(j.company, (companyCounts.get(j.company) || 0) + 1);
  }
  const topHiringCompanies = [...companyCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([c]) => c);

  // Most demanded skill
  const skillCounts = new Map<string, number>();
  for (const j of jobs) {
    for (const s of j.skills) {
      skillCounts.set(s, (skillCounts.get(s) || 0) + 1);
    }
  }
  const mostDemandedSkill = [...skillCounts.entries()]
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  // Salary range
  const salaryJobs = jobs.filter(j => j.salary && !j.salaryEstimated);
  const salaryRangeSeen = salaryJobs.length >= 2
    ? { min: salaryJobs[salaryJobs.length - 1].salary!, max: salaryJobs[0].salary! }
    : null;

  return {
    totalScraped: jobs.length,
    qualified: qualified.length,
    exceptional: exceptional.length,
    avgMatchScore: avgScore,
    bestMatch: best ? { company: best.company, role: best.title, score: best.matchScore } : null,
    salaryRangeSeen,
    remoteRoles,
    topHiringCompanies,
    mostDemandedSkill,
  };
}

// ─── PHASE 7 – RESUME OPTIMISATION TIPS ──────────────────────────────────────

export function buildResumeOptimisationTips(
  jobs: JobResult[],
  profile: CandidateProfile,
): ResumeOptimisationTip[] {
  if (jobs.length === 0) return [];

  const skillFreq = new Map<string, number>();
  for (const job of jobs) {
    for (const skill of job.skills) {
      skillFreq.set(skill.toLowerCase(), (skillFreq.get(skill.toLowerCase()) || 0) + 1);
    }
  }

  const allCandidateSkills = new Set([
    ...profile.primarySkills.map(s => s.toLowerCase()),
    ...profile.secondarySkills.map(s => s.toLowerCase()),
    ...profile.toolsAndInfra.map(s => s.toLowerCase()),
  ]);

  const tips: ResumeOptimisationTip[] = [];
  for (const [skill, count] of skillFreq.entries()) {
    const freqPct = Math.round((count / jobs.length) * 100);
    if (freqPct >= 30) {
      const candidateHasIt = allCandidateSkills.has(skill);
      tips.push({
        skill,
        frequencyPct: freqPct,
        candidateHasIt,
        suggestion: candidateHasIt
          ? `Ensure "${skill}" appears verbatim in your Skills section — it's in ${freqPct}% of JDs`
          : `Add "${skill}" to your resume if you have any exposure — it appears in ${freqPct}% of matched JDs`,
      });
    }
  }

  return tips.sort((a, b) => b.frequencyPct - a.frequencyPct).slice(0, 8);
}

// ─── UTILITY FUNCTIONS ────────────────────────────────────────────────────────

function formatSalary(job: JSearchJob): string | undefined {
  if (job.job_salary_min && job.job_salary_max) {
    const currency = job.job_salary_currency || 'USD';
    const period = job.job_salary_period || 'YEAR';
    const fmt = (n: number) => n >= 1000 ? `${Math.round(n / 1000)}K` : `${n}`;
    return `${currency} ${fmt(job.job_salary_min)} – ${fmt(job.job_salary_max)} / ${period.toLowerCase()}`;
  }
  return undefined;
}

function getExperienceRequired(job: JSearchJob): string | undefined {
  if (job.job_required_experience?.required_experience_in_months) {
    const months = job.job_required_experience.required_experience_in_months;
    if (months < 12) return `${months} months`;
    return `${Math.round(months / 12)} year${Math.round(months / 12) !== 1 ? 's' : ''}`;
  }
  return undefined;
}

function formatPostedDate(dateStr?: string): string {
  if (!dateStr) return 'Recently';
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) !== 1 ? 's' : ''} ago`;
  } catch {
    return 'Recently';
  }
}

function getPostedDaysAgo(dateStr?: string): number {
  if (!dateStr) return 0;
  try {
    const date = new Date(dateStr);
    const now = new Date();
    return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

function getJobSource(job: JSearchJob): JobResult['source'] {
  const publisher = (job.job_publisher || '').toLowerCase();
  if (publisher.includes('linkedin')) return 'LinkedIn';
  if (publisher.includes('naukri')) return 'Naukri';
  if (publisher.includes('instahyre')) return 'InstaHyre';
  if (publisher.includes('indeed')) return 'Indeed';
  if (publisher.includes('glassdoor')) return 'Glassdoor';
  return 'LinkedIn';
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

export async function searchJobsWithAPI(
  apiKey: string,
  query: string,
  location: string,
  profile: CandidateProfile,
  sources: ('LinkedIn' | 'Naukri' | 'InstaHyre')[],
  numResults: number = 20,
  freshnessWindow: number = 14,
): Promise<JobResult[]> {
  const finalQuery = query || profile.currentRole || 'software engineer';
  const finalLocation = location || profile.targetLocations[0] || 'India';

  const response = await fetch(
    `${JSEARCH_BASE_URL}/search?query=${encodeURIComponent(finalQuery + ' ' + finalLocation)}&page=1&num_pages=2&date_posted=month`,
    {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} - ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.data || !Array.isArray(data.data)) {
    throw new Error('Invalid API response format');
  }

  const rawJobs: JSearchJob[] = data.data;

  // Score all jobs
  const scored: JobResult[] = rawJobs.map(raw => {
    const daysAgo = getPostedDaysAgo(raw.job_posted_at_datetime_utc);
    return scoreJob(raw, profile, daysAgo);
  });

  // Dedup + hard filter
  const deduped = deduplicateJobs(scored);
  const filtered = deduped.filter(j => passesHardFilters(j, profile, freshnessWindow));

  // Sort by score desc
  const sorted = filtered.sort((a, b) => b.matchScore - a.matchScore);

  // If nothing passes 75%, lower threshold to 60%
  const qualified = sorted.filter(j => j.matchScore >= 75);
  const results = qualified.length > 0 ? qualified : sorted.filter(j => j.matchScore >= 60);

  return results.slice(0, numResults);
}

// ─── MOCK DATA (demo mode) ────────────────────────────────────────────────────

export function generateMockJobs(
  profile: CandidateProfile,
  sources: ('LinkedIn' | 'Naukri' | 'InstaHyre')[],
): JobResult[] {
  const skill1 = profile.primarySkills[0] || 'Software Engineering';
  const skill2 = profile.primarySkills[1] || 'System Design';
  const skill3 = profile.primarySkills[2] || 'Cloud';
  const role = profile.currentRole || 'Software Engineer';
  const yoe = profile.totalYoe;

  const mockRaw: Array<{
    id: string; title: string; company: string; location: string;
    description: string; salary?: string; jobType: string;
    postedDaysAgo: number; applyLink: string; source: JobResult['source'];
    requiredSkills: string[]; isRemote: boolean; tier: CompanyTier;
    minYears: number; maxYears: number; equityMentioned: boolean;
  }> = [
    {
      id: '1', title: `Senior ${role}`, company: 'Google India',
      location: 'Bangalore, Karnataka, India',
      description: `We are looking for a talented ${role} to join our team at Google. You will work on cutting-edge products used by billions of users worldwide. Required: ${skill1}, ${skill2}, ${skill3}, system design, distributed systems. Preferred: Kubernetes, Kafka, Go. 4-8 years experience required. Hybrid work model. ESOP offered.`,
      salary: 'INR 35L – 55L / year', jobType: 'Full-time', postedDaysAgo: 2,
      applyLink: 'https://careers.google.com', source: 'LinkedIn',
      requiredSkills: [skill1, skill2, skill3, 'system design', 'distributed systems'],
      isRemote: false, tier: 'FAANG', minYears: 4, maxYears: 8, equityMentioned: true,
    },
    {
      id: '2', title: `${role} — Remote`, company: 'Razorpay',
      location: 'Remote / Bangalore, India',
      description: `Join Razorpay's engineering team as a ${role}. Work on India's leading payment infrastructure. Required: ${skill1}, ${skill2}, microservices, REST APIs, PostgreSQL. Preferred: Kafka, Redis, Docker. 3-6 years experience. Fully remote. RSU vesting.`,
      salary: 'INR 28L – 45L / year', jobType: 'Full-time', postedDaysAgo: 1,
      applyLink: 'https://razorpay.com/jobs', source: 'InstaHyre',
      requiredSkills: [skill1, skill2, 'microservices', 'rest', 'postgresql'],
      isRemote: true, tier: 'Tier1Unicorn', minYears: 3, maxYears: 6, equityMentioned: true,
    },
    {
      id: '3', title: `${role} — Platform Team`, company: 'Flipkart',
      location: 'Bangalore, India',
      description: `Flipkart is hiring ${role}s to build the future of e-commerce in India. Required: ${skill1}, ${skill3}, Java, Spring Boot, MySQL. Preferred: Kafka, Elasticsearch, Docker. 3-7 years. On-site Bangalore.`,
      salary: 'INR 22L – 38L / year', jobType: 'Full-time', postedDaysAgo: 3,
      applyLink: 'https://www.flipkartcareers.com', source: 'Naukri',
      requiredSkills: [skill1, skill3, 'java', 'spring boot', 'mysql'],
      isRemote: false, tier: 'Tier1Unicorn', minYears: 3, maxYears: 7, equityMentioned: false,
    },
    {
      id: '4', title: `Staff ${role}`, company: 'Atlassian',
      location: 'Remote (India)',
      description: `Atlassian is seeking a Staff ${role} to work on Jira and Confluence products. Required: ${skill1}, ${skill2}, distributed systems, Kubernetes, AWS. Preferred: Kafka, Terraform, Go. 7-12 years. Fully remote. ESOP.`,
      salary: 'USD 120K – 180K / year', jobType: 'Full-time', postedDaysAgo: 4,
      applyLink: 'https://jobs.atlassian.com', source: 'LinkedIn',
      requiredSkills: [skill1, skill2, 'distributed systems', 'kubernetes', 'aws'],
      isRemote: true, tier: 'Tier1Unicorn', minYears: 7, maxYears: 12, equityMentioned: true,
    },
    {
      id: '5', title: `${role} — Growth`, company: 'Swiggy',
      location: 'Bangalore / Mumbai, India',
      description: `Join Swiggy as a ${role} to scale India's food delivery platform. Required: ${skill1}, ${skill2}, Python, Redis, PostgreSQL. Preferred: Kafka, Airflow, Docker. 2-5 years. Hybrid.`,
      salary: 'INR 20L – 35L / year', jobType: 'Full-time', postedDaysAgo: 5,
      applyLink: 'https://careers.swiggy.com', source: 'Naukri',
      requiredSkills: [skill1, skill2, 'python', 'redis', 'postgresql'],
      isRemote: false, tier: 'Tier1Unicorn', minYears: 2, maxYears: 5, equityMentioned: false,
    },
    {
      id: '6', title: `Senior ${role} — FinTech`, company: 'PhonePe',
      location: 'Bangalore, India',
      description: `PhonePe is revolutionizing digital payments. Required: ${skill1}, ${skill3}, Java, Kafka, MySQL. Preferred: Kubernetes, Redis, Elasticsearch. 4-8 years. On-site. ESOP.`,
      salary: 'INR 30L – 50L / year', jobType: 'Full-time', postedDaysAgo: 2,
      applyLink: 'https://phonepe.com/careers', source: 'LinkedIn',
      requiredSkills: [skill1, skill3, 'java', 'kafka', 'mysql'],
      isRemote: false, tier: 'Tier1Unicorn', minYears: 4, maxYears: 8, equityMentioned: true,
    },
    {
      id: '7', title: `${role} — Cloud Platform`, company: 'Microsoft',
      location: 'Hyderabad / Remote, India',
      description: `Microsoft Azure team is hiring ${role}s. Required: ${skill1}, ${skill2}, Azure, Kubernetes, C#. Preferred: Terraform, Prometheus, Go. 3-7 years. Hybrid. RSU.`,
      salary: 'INR 25L – 45L / year', jobType: 'Full-time', postedDaysAgo: 6,
      applyLink: 'https://careers.microsoft.com', source: 'LinkedIn',
      requiredSkills: [skill1, skill2, 'azure', 'kubernetes', 'c#'],
      isRemote: false, tier: 'FAANG', minYears: 3, maxYears: 7, equityMentioned: true,
    },
    {
      id: '8', title: `Principal ${role}`, company: 'Amazon',
      location: 'Hyderabad / Bangalore, India',
      description: `Amazon Web Services is looking for a Principal ${role} to architect scalable distributed systems. Required: ${skill1}, ${skill2}, ${skill3}, system design, AWS. Preferred: Kafka, Kubernetes, Go. 8-15 years. On-site. RSU.`,
      salary: 'INR 50L – 90L / year', jobType: 'Full-time', postedDaysAgo: 8,
      applyLink: 'https://amazon.jobs', source: 'LinkedIn',
      requiredSkills: [skill1, skill2, skill3, 'system design', 'aws'],
      isRemote: false, tier: 'FAANG', minYears: 8, maxYears: 15, equityMentioned: true,
    },
    {
      id: '9', title: `${role} — HealthTech`, company: 'Practo',
      location: 'Bangalore, India',
      description: `Practo is revolutionizing healthcare with technology. Required: ${skill1}, ${skill2}, Node.js, MongoDB, REST APIs. Preferred: Docker, Redis, GraphQL. 2-5 years. Hybrid.`,
      salary: 'INR 15L – 28L / year', jobType: 'Full-time', postedDaysAgo: 6,
      applyLink: 'https://practo.com/company/jobs', source: 'InstaHyre',
      requiredSkills: [skill1, skill2, 'node.js', 'mongodb', 'rest'],
      isRemote: true, tier: 'Unknown', minYears: 2, maxYears: 5, equityMentioned: false,
    },
    {
      id: '10', title: `${role} — SaaS Platform`, company: 'Freshworks',
      location: 'Chennai / Remote, India',
      description: `Freshworks is building the next generation of SaaS products. Required: ${skill1}, ${skill3}, Ruby on Rails, PostgreSQL, Redis. Preferred: Kafka, Kubernetes, Terraform. 3-6 years. Hybrid. ESOP.`,
      salary: 'INR 20L – 35L / year', jobType: 'Full-time', postedDaysAgo: 3,
      applyLink: 'https://careers.freshworks.com', source: 'Naukri',
      requiredSkills: [skill1, skill3, 'rails', 'postgresql', 'redis'],
      isRemote: false, tier: 'Tier1Unicorn', minYears: 3, maxYears: 6, equityMentioned: true,
    },
  ];

  // Build mock JSearchJob objects and score them
  const mockJSearchJobs: JSearchJob[] = mockRaw.map(m => ({
    job_id: m.id,
    job_title: m.title,
    employer_name: m.company,
    job_city: m.location.split(',')[0],
    job_country: 'India',
    job_description: m.description,
    job_apply_link: m.applyLink,
    job_is_remote: m.isRemote,
    job_posted_at_datetime_utc: new Date(Date.now() - m.postedDaysAgo * 86400000).toISOString(),
    job_employment_type: m.jobType,
    job_required_skills: m.requiredSkills,
    job_publisher: m.source,
    job_salary_min: undefined,
    job_salary_max: undefined,
  }));

  const scored = mockJSearchJobs.map((raw, i) => {
    const result = scoreJob(raw, profile, mockRaw[i].postedDaysAgo);
    // Override salary with mock salary string
    result.salary = mockRaw[i].salary;
    result.salaryEstimated = false;
    result.equityMentioned = mockRaw[i].equityMentioned;
    result.companyTier = mockRaw[i].tier;
    result.minYears = mockRaw[i].minYears;
    result.maxYears = mockRaw[i].maxYears;
    // Re-score D7 with tier info
    result.scoreBreakdown.d7Salary = Math.round(scoreD7(
      mockRaw[i].tier, profile, undefined, undefined, mockRaw[i].equityMentioned
    ));
    result.scoreBreakdown.d6CompanyFit = Math.round(scoreD6(mockRaw[i].tier, profile));
    result.scoreBreakdown.total = computeWeightedScore(result.scoreBreakdown);
    result.matchScore = result.scoreBreakdown.total;
    result.fitBadge = getFitBadge(result.matchScore);
    result.isUrgent = mockRaw[i].postedDaysAgo <= 3;
    result.isStretchRole = isOneAbove(
      mockRaw[i].minYears > yoe + 1 ? 'senior' : 'mid',
      profile.careerLevel
    );
    return result;
  });

  // Filter by selected sources
  const filtered = scored.filter(j => sources.includes(j.source as 'LinkedIn' | 'Naukri' | 'InstaHyre'));

  return filtered
    .sort((a, b) => b.matchScore - a.matchScore);
}
