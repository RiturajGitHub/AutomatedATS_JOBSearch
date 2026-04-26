import {
  ATSResult, ATSSection, Recommendation,
  CandidateProfile, CareerLevel,
} from '../types';

// ─── Keyword Databases ────────────────────────────────────────────────────────

const TECH_SKILLS = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'golang', 'rust',
  'swift', 'kotlin', 'php', 'scala', 'r', 'matlab', 'sql', 'nosql', 'mongodb', 'postgresql',
  'mysql', 'redis', 'elasticsearch', 'react', 'angular', 'vue', 'node.js', 'nodejs', 'express',
  'django', 'flask', 'fastapi', 'spring', 'spring boot', 'asp.net', 'laravel', 'rails',
  'html', 'css', 'sass', 'less', 'tailwind', 'bootstrap', 'aws', 'azure', 'gcp',
  'docker', 'kubernetes', 'k8s', 'terraform', 'ansible', 'git', 'github', 'gitlab',
  'jenkins', 'ci/cd', 'devops', 'agile', 'scrum', 'jira', 'confluence', 'graphql',
  'rest', 'grpc', 'microservices', 'kafka', 'rabbitmq', 'machine learning', 'deep learning',
  'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'data science', 'nlp',
  'computer vision', 'llm', 'generative ai', 'openai', 'langchain', 'blockchain',
  'react native', 'flutter', 'android', 'ios', 'firebase', 'linux', 'unix', 'bash',
  'powershell', 'webpack', 'vite', 'next.js', 'nuxt.js', 'gatsby', 'figma',
  'product management', 'project management', 'pmp', 'six sigma', 'data analysis',
  'tableau', 'power bi', 'excel', 'salesforce', 'sap', 'servicenow', 'prometheus',
  'grafana', 'datadog', 'splunk', 'cassandra', 'dynamodb', 'snowflake', 'spark',
  'hadoop', 'airflow', 'dbt', 'looker', 'bigquery', 'redshift',
];

const SOFT_SKILLS = [
  'leadership', 'communication', 'teamwork', 'collaboration', 'problem-solving', 'analytical',
  'critical thinking', 'adaptability', 'time management', 'creativity', 'innovation', 'strategic',
  'mentoring', 'coaching', 'negotiation', 'presentation', 'stakeholder', 'cross-functional',
];

// Primary skill categories for profile extraction
const PRIMARY_SKILL_GROUPS: Record<string, string[]> = {
  languages: ['javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'golang', 'rust', 'swift', 'kotlin', 'scala', 'ruby', 'php'],
  frontend: ['react', 'angular', 'vue', 'next.js', 'nuxt.js', 'html', 'css', 'tailwind', 'bootstrap'],
  backend: ['node.js', 'nodejs', 'express', 'django', 'flask', 'fastapi', 'spring', 'spring boot', 'rails', 'laravel', 'asp.net'],
  data_ml: ['machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'data science', 'nlp', 'llm', 'generative ai'],
  cloud_devops: ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'k8s', 'terraform', 'ansible', 'ci/cd', 'jenkins', 'devops'],
  databases: ['sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'cassandra', 'dynamodb', 'snowflake'],
  messaging: ['kafka', 'rabbitmq', 'grpc', 'graphql', 'rest', 'microservices'],
};

const TOOLS_AND_INFRA_KEYWORDS = [
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'k8s', 'terraform', 'ansible',
  'jenkins', 'github actions', 'gitlab ci', 'ci/cd', 'prometheus', 'grafana',
  'datadog', 'splunk', 'elasticsearch', 'kibana', 'redis', 'kafka', 'rabbitmq',
  'postgresql', 'mysql', 'mongodb', 'cassandra', 'dynamodb', 'snowflake', 'bigquery',
  'redshift', 'airflow', 'spark', 'hadoop', 'dbt', 'looker', 'tableau', 'power bi',
  'jira', 'confluence', 'git', 'github', 'gitlab', 'bitbucket', 'linux', 'bash',
  'nginx', 'apache', 'istio', 'helm', 'argocd', 'vault', 'consul',
];

const DOMAIN_KEYWORDS: Record<string, string[]> = {
  'fintech/payments/billing': ['fintech', 'payment', 'billing', 'banking', 'finance', 'trading', 'insurance', 'lending', 'wallet', 'upi', 'razorpay', 'stripe', 'paypal'],
  'cloud/infrastructure/SRE': ['cloud', 'infrastructure', 'sre', 'site reliability', 'platform engineering', 'devops', 'kubernetes', 'distributed systems'],
  'ML/AI/data': ['machine learning', 'artificial intelligence', 'data science', 'deep learning', 'nlp', 'computer vision', 'llm', 'generative ai', 'analytics', 'data engineering'],
  'ecommerce/marketplace': ['ecommerce', 'e-commerce', 'marketplace', 'retail', 'supply chain', 'logistics', 'inventory', 'catalog', 'checkout'],
  'health/edtech/logistics': ['healthcare', 'health tech', 'edtech', 'education', 'logistics', 'delivery', 'telemedicine', 'lms'],
  'developer tools/platform/SDK': ['developer tools', 'sdk', 'api platform', 'developer experience', 'dx', 'cli', 'open source', 'saas platform'],
  'gaming/media/entertainment': ['gaming', 'game', 'media', 'entertainment', 'streaming', 'video', 'content', 'ott'],
  'enterprise/SaaS/B2B': ['enterprise', 'saas', 'b2b', 'crm', 'erp', 'workflow', 'automation', 'integration'],
};

const SECTION_KEYWORDS = {
  contact: ['email', 'phone', 'linkedin', 'github', 'address', 'mobile', 'contact', '@', 'tel:', 'website', 'portfolio'],
  summary: ['summary', 'objective', 'profile', 'about', 'overview', 'professional summary', 'career objective'],
  experience: ['experience', 'employment', 'work history', 'professional experience', 'career', 'positions', 'internship', 'intern'],
  education: ['education', 'degree', 'university', 'college', 'bachelor', 'master', 'phd', 'b.tech', 'm.tech', 'b.e', 'm.e', 'bsc', 'msc', 'bca', 'mca', 'certification', 'diploma'],
  skills: ['skills', 'technologies', 'technical skills', 'competencies', 'expertise', 'proficiencies', 'tools', 'programming'],
  projects: ['projects', 'portfolio', 'works', 'contributions', 'github', 'case studies'],
  achievements: ['achievements', 'awards', 'honors', 'recognition', 'accomplishments', 'publications'],
  certifications: ['certification', 'certified', 'certificate', 'license', 'accreditation'],
};

const ACTION_VERBS = [
  'led', 'managed', 'developed', 'created', 'implemented', 'designed', 'built', 'improved',
  'increased', 'decreased', 'reduced', 'achieved', 'delivered', 'launched', 'optimized',
  'collaborated', 'coordinated', 'analyzed', 'architected', 'engineered', 'deployed', 'automated',
  'mentored', 'trained', 'spearheaded', 'streamlined', 'enhanced', 'integrated', 'established',
];

const QUANTIFIERS = ['%', '$', '₹', 'million', 'billion', 'thousand', 'users', 'customers', 'team',
  'projects', 'products', '×', 'x', 'times', 'revenue', 'growth', 'reduction', 'tps', 'rps', 'latency', 'ms', 'k+', 'm+'];

// ─── Helper Functions ─────────────────────────────────────────────────────────

function containsKeyword(text: string, keyword: string): boolean {
  const lowerText = text.toLowerCase();
  const lowerKw = keyword.toLowerCase();
  // Word-boundary-aware matching
  const idx = lowerText.indexOf(lowerKw);
  if (idx === -1) return false;
  const before = idx === 0 ? ' ' : lowerText[idx - 1];
  const after = idx + lowerKw.length >= lowerText.length ? ' ' : lowerText[idx + lowerKw.length];
  const wordChars = /[a-z0-9]/;
  // Allow if boundary chars are non-word or the keyword itself contains special chars
  if (lowerKw.includes('.') || lowerKw.includes('/') || lowerKw.includes('+') || lowerKw.includes('#')) {
    return true;
  }
  return !wordChars.test(before) || !wordChars.test(after) ? true : lowerText.includes(lowerKw);
}

function detectSection(text: string, sectionKeywords: string[]): boolean {
  const lines = text.toLowerCase().split('\n');
  return lines.some(line =>
    sectionKeywords.some(kw => {
      const trimmed = line.trim();
      return trimmed === kw || trimmed.startsWith(kw + ':') || trimmed.startsWith(kw + ' ') ||
        (trimmed.includes(kw) && trimmed.length < kw.length + 20);
    })
  );
}

function extractEmailPhoneLinkedIn(text: string) {
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/);
  const linkedinMatch = text.toLowerCase().includes('linkedin');
  const githubMatch = text.toLowerCase().includes('github');
  return { email: !!emailMatch, phone: !!phoneMatch, linkedin: linkedinMatch, github: githubMatch };
}

function extractExperienceYears(text: string): number {
  const patterns = [
    /(\d+)\+?\s*years?\s+of\s+(professional\s+)?experience/gi,
    /experience\s+of\s+(\d+)\+?\s*years?/gi,
    /(\d+)\+?\s*years?\s+experience/gi,
    /(\d+)\+?\s*yrs?\s+of\s+experience/gi,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const num = match[0].match(/\d+/);
      if (num) return parseInt(num[0]);
    }
  }
  // Infer from date spans
  const yearMatches = text.match(/20\d{2}/g);
  if (yearMatches && yearMatches.length >= 2) {
    const years = yearMatches.map(Number).sort();
    const span = years[years.length - 1] - years[0];
    return Math.min(span, 25);
  }
  return 0;
}

function detectJobTitle(text: string): string {
  const titles = [
    'Principal Software Engineer', 'Staff Software Engineer', 'Senior Software Engineer',
    'Software Engineer', 'Software Developer', 'Full Stack Developer', 'Full Stack Engineer',
    'Frontend Developer', 'Frontend Engineer', 'Backend Developer', 'Backend Engineer',
    'Data Scientist', 'Machine Learning Engineer', 'ML Engineer', 'AI Engineer',
    'Data Engineer', 'Data Analyst', 'DevOps Engineer', 'Platform Engineer',
    'Cloud Engineer', 'SRE', 'Site Reliability Engineer', 'Product Manager',
    'Engineering Manager', 'Technical Lead', 'Tech Lead', 'Solutions Architect',
    'Mobile Developer', 'Android Developer', 'iOS Developer', 'QA Engineer',
    'Security Engineer', 'Business Analyst', 'Systems Analyst', 'CTO', 'VP Engineering',
  ];
  const lowerText = text.toLowerCase();
  for (const title of titles) {
    if (containsKeyword(lowerText, title.toLowerCase())) return title;
  }
  return 'Software Engineer';
}

function inferCareerLevel(text: string, yoe: number): CareerLevel {
  const lower = text.toLowerCase();
  if (lower.includes('principal') || lower.includes('distinguished')) return 'principal';
  if (lower.includes('staff engineer') || lower.includes('staff software')) return 'staff';
  if (lower.includes('engineering manager') || lower.includes('tech lead') || lower.includes('technical lead')) return 'lead';
  if (lower.includes('senior') || lower.includes('sr.')) return 'senior';
  if (lower.includes('junior') || lower.includes('jr.')) return 'junior';
  if (lower.includes('intern')) return 'intern';
  if (lower.includes('vp ') || lower.includes('vice president')) return 'vp';
  if (lower.includes('director')) return 'director';
  if (lower.includes('cto') || lower.includes('ceo') || lower.includes('chief')) return 'c-level';
  // Infer from YoE
  if (yoe <= 0) return 'intern';
  if (yoe <= 2) return 'junior';
  if (yoe <= 5) return 'mid';
  if (yoe <= 9) return 'senior';
  if (yoe <= 13) return 'staff';
  return 'principal';
}

function extractName(text: string): string {
  // First non-empty line is usually the name
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length > 0) {
    const first = lines[0];
    // If it looks like a name (no @, no digits, reasonable length)
    if (first.length < 50 && !first.includes('@') && !/\d/.test(first) && first.split(' ').length <= 4) {
      return first;
    }
  }
  return 'UNKNOWN';
}

function extractCurrentRole(text: string, jobTitle: string): string {
  // Look for patterns like "Software Engineer at Company" or "Current: ..."
  const patterns = [
    /current(?:ly)?\s*[:\-]?\s*([^\n,]+)/i,
    /(?:working as|position|role)\s*[:\-]?\s*([^\n,]+)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m && m[1] && m[1].trim().length < 60) return m[1].trim();
  }
  return jobTitle;
}

function extractCurrentCompany(text: string): string {
  const patterns = [
    /(?:at|@)\s+([A-Z][a-zA-Z\s&.]+?)(?:\s*[,|\n|•])/,
    /(?:company|employer|organization)\s*[:\-]\s*([^\n,]+)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m && m[1] && m[1].trim().length < 60) return m[1].trim();
  }
  return 'UNKNOWN';
}

function extractLocation(text: string): string {
  const patterns = [
    /(?:bangalore|bengaluru|mumbai|delhi|hyderabad|pune|chennai|kolkata|noida|gurgaon|gurugram)/i,
    /(?:new york|san francisco|london|singapore|dubai|toronto|berlin|amsterdam)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[0].charAt(0).toUpperCase() + m[0].slice(1).toLowerCase();
  }
  return 'UNKNOWN';
}

function extractQuantifiedAchievements(text: string): string[] {
  const achievements: string[] = [];
  const lines = text.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    // Lines with numbers + % or metrics
    if (/\d+/.test(trimmed) && QUANTIFIERS.some(q => trimmed.toLowerCase().includes(q))) {
      if (trimmed.length > 20 && trimmed.length < 200) {
        achievements.push(trimmed.replace(/^[•\-\*]\s*/, ''));
      }
    }
  }
  return achievements.slice(0, 10);
}

function extractEducation(text: string): string {
  const eduPatterns = [
    /(?:b\.?tech|m\.?tech|b\.?e|m\.?e|bsc|msc|b\.?s|m\.?s|phd|bachelor|master|mba)\s+(?:in\s+)?([^\n,]+)/i,
    /(?:university|college|institute|iit|nit|bits)\s+(?:of\s+)?([^\n,]+)/i,
  ];
  for (const p of eduPatterns) {
    const m = text.match(p);
    if (m) return m[0].trim().substring(0, 80);
  }
  return 'UNKNOWN';
}

function extractSalaryInfo(text: string): { floor: number; target: number; stretch: number } {
  // Try to find salary expectations in resume
  const patterns = [
    /(?:expected|current|ctc|salary)\s*[:\-]?\s*(?:₹|inr|rs\.?)?\s*(\d+(?:\.\d+)?)\s*(?:l|lpa|lakh)/i,
    /(\d+(?:\.\d+)?)\s*(?:l|lpa|lakh)\s*(?:ctc|per annum|pa)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const val = parseFloat(m[1]);
      return { floor: val * 0.9, target: val, stretch: val * 1.3 };
    }
  }
  // Default based on career level inference
  return { floor: 0, target: 0, stretch: 0 };
}

function extractDomainExpertise(text: string): string[] {
  const found: string[] = [];
  const lower = text.toLowerCase();
  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    const matchCount = keywords.filter(kw => lower.includes(kw)).length;
    if (matchCount >= 2) found.push(domain);
  }
  return found.length > 0 ? found : ['enterprise/SaaS/B2B'];
}

function extractPrimarySkills(text: string, allFoundSkills: string[]): string[] {
  // Score each skill group by frequency in text
  const groupScores: Record<string, number> = {};
  for (const [group, skills] of Object.entries(PRIMARY_SKILL_GROUPS)) {
    groupScores[group] = skills.filter(s => containsKeyword(text, s)).length;
  }
  // Pick top 2 groups, then take top skills from those
  const topGroups = Object.entries(groupScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([g]) => g);

  const primary: string[] = [];
  for (const group of topGroups) {
    const groupSkills = PRIMARY_SKILL_GROUPS[group].filter(s => containsKeyword(text, s));
    primary.push(...groupSkills.slice(0, 3));
  }

  // Also include any skill mentioned 3+ times in the text
  const textLower = text.toLowerCase();
  for (const skill of allFoundSkills) {
    const count = (textLower.split(skill.toLowerCase()).length - 1);
    if (count >= 3 && !primary.includes(skill)) primary.push(skill);
  }

  return [...new Set(primary)].slice(0, 8);
}

function extractSecondarySkills(text: string, primarySkills: string[], allFoundSkills: string[]): string[] {
  return allFoundSkills
    .filter(s => !primarySkills.includes(s))
    .slice(0, 12);
}

function extractToolsAndInfra(text: string): string[] {
  return TOOLS_AND_INFRA_KEYWORDS.filter(t => containsKeyword(text, t));
}

function inferSalaryFromLevel(level: CareerLevel): { floor: number; target: number; stretch: number } {
  const map: Record<CareerLevel, { floor: number; target: number; stretch: number }> = {
    intern:    { floor: 3,  target: 6,   stretch: 10  },
    junior:    { floor: 6,  target: 12,  stretch: 18  },
    mid:       { floor: 12, target: 20,  stretch: 30  },
    senior:    { floor: 20, target: 35,  stretch: 55  },
    staff:     { floor: 35, target: 55,  stretch: 80  },
    lead:      { floor: 30, target: 50,  stretch: 75  },
    principal: { floor: 45, target: 70,  stretch: 100 },
    director:  { floor: 50, target: 80,  stretch: 120 },
    vp:        { floor: 60, target: 100, stretch: 150 },
    'c-level': { floor: 80, target: 130, stretch: 200 },
  };
  return map[level] || { floor: 12, target: 20, stretch: 30 };
}

// ─── PHASE 0: Candidate Profile Extraction ───────────────────────────────────

export function extractCandidateProfile(resumeText: string): CandidateProfile {
  const text = resumeText;
  const yoe = extractExperienceYears(text);
  const jobTitle = detectJobTitle(text);
  const careerLevel = inferCareerLevel(text, yoe);
  const allFoundSkills = TECH_SKILLS.filter(s => containsKeyword(text, s));
  const primarySkills = extractPrimarySkills(text, allFoundSkills);
  const secondarySkills = extractSecondarySkills(text, primarySkills, allFoundSkills);
  const toolsAndInfra = extractToolsAndInfra(text);
  const salaryFromText = extractSalaryInfo(text);
  const salaryFromLevel = inferSalaryFromLevel(careerLevel);

  const salaryFloor = salaryFromText.floor > 0 ? salaryFromText.floor : salaryFromLevel.floor;
  const salaryTarget = salaryFromText.target > 0 ? salaryFromText.target : salaryFromLevel.target;
  const salaryStretch = salaryFromText.stretch > 0 ? salaryFromText.stretch : salaryFromLevel.stretch;

  // Detect remote preference
  const lower = text.toLowerCase();
  const openToRemote: boolean | 'hybrid-only' =
    lower.includes('hybrid') ? 'hybrid-only' :
    lower.includes('remote') ? true : false;

  // Notice period
  const noticeMatch = text.match(/(\d+)\s*(?:weeks?|months?)\s*notice/i);
  const noticePeriod = noticeMatch
    ? (noticeMatch[0].toLowerCase().includes('month')
        ? parseInt(noticeMatch[1]) * 4
        : parseInt(noticeMatch[1]))
    : null;

  // Company preference
  const companyPreference: CandidateProfile['companyPreference'] =
    lower.includes('product company') || lower.includes('product-based') ? 'product' :
    lower.includes('startup') ? 'startup' :
    lower.includes('service') || lower.includes('consulting') ? 'service' : 'any';

  // Target locations
  const locationKeywords = [
    'bangalore', 'bengaluru', 'mumbai', 'delhi', 'hyderabad', 'pune', 'chennai',
    'noida', 'gurgaon', 'gurugram', 'kolkata', 'remote',
  ];
  const targetLocations = locationKeywords.filter(loc => lower.includes(loc))
    .map(l => l.charAt(0).toUpperCase() + l.slice(1));
  if (targetLocations.length === 0) targetLocations.push('India');

  return {
    name: extractName(text),
    currentRole: extractCurrentRole(text, jobTitle),
    currentCompany: extractCurrentCompany(text),
    totalYoe: yoe,
    location: extractLocation(text),
    targetLocations,
    primarySkills,
    secondarySkills,
    toolsAndInfra,
    domainExpertise: extractDomainExpertise(text),
    quantifiedAchievements: extractQuantifiedAchievements(text),
    education: extractEducation(text),
    careerLevel,
    salaryFloor,
    salaryTarget,
    salaryStretch,
    companyPreference,
    openToRemote,
    noticePeriod,
  };
}

// ─── ATS Section Scoring (resume quality) ────────────────────────────────────

function countActionVerbs(text: string): number {
  return ACTION_VERBS.filter(v => containsKeyword(text, v)).length;
}

function countQuantifiedAchievements(text: string): number {
  return QUANTIFIERS.filter(q => text.includes(q)).length;
}

function checkFormattingIssues(text: string): string[] {
  const issues: string[] = [];
  if (text.length < 200) issues.push('Resume content seems too short (less than 200 characters)');
  if (text.length > 10000) issues.push('Resume may be too long (consider condensing to 1-2 pages)');
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 10) issues.push('Resume appears to have very few sections or content');
  return issues;
}

// ─── Main ATS Analysis Function ──────────────────────────────────────────────

export function analyzeResume(resumeText: string): ATSResult {
  const text = resumeText;

  // Extract structured candidate profile (PHASE 0)
  const candidateProfile = extractCandidateProfile(text);

  // 1. Contact Info Section (15 points)
  const contactInfo = extractEmailPhoneLinkedIn(text);
  const contactScore = (
    (contactInfo.email ? 4 : 0) +
    (contactInfo.phone ? 4 : 0) +
    (contactInfo.linkedin ? 4 : 0) +
    (contactInfo.github ? 3 : 0)
  );

  const contactSection: ATSSection = {
    name: 'Contact Information',
    score: contactScore,
    maxScore: 15,
    present: contactInfo.email || contactInfo.phone,
    feedback: [
      contactInfo.email ? '✅ Email address found' : '❌ No email address detected',
      contactInfo.phone ? '✅ Phone number found' : '❌ No phone number detected',
      contactInfo.linkedin ? '✅ LinkedIn profile mentioned' : '❌ LinkedIn profile not mentioned',
      contactInfo.github ? '✅ GitHub profile mentioned' : '⚠️ GitHub profile not mentioned (recommended for tech roles)',
    ],
    improvements: [
      ...(!contactInfo.email ? ['Add a professional email address'] : []),
      ...(!contactInfo.phone ? ['Include a phone number with country code'] : []),
      ...(!contactInfo.linkedin ? ['Add your LinkedIn profile URL'] : []),
      ...(!contactInfo.github ? ['Add GitHub/Portfolio link for credibility'] : []),
    ],
  };

  // 2. Professional Summary (10 points)
  const hasSummary = detectSection(text, SECTION_KEYWORDS.summary);
  const summaryLength = hasSummary ? 7 : 0;
  const hasKeywordsInSummary = hasSummary
    ? (TECH_SKILLS.filter(s => containsKeyword(text.substring(0, 500), s)).length > 2 ? 3 : 1)
    : 0;

  const summarySection: ATSSection = {
    name: 'Professional Summary',
    score: Math.min(summaryLength + hasKeywordsInSummary, 10),
    maxScore: 10,
    present: hasSummary,
    feedback: [
      hasSummary ? '✅ Professional summary/objective found' : '❌ No professional summary detected',
      hasSummary && hasKeywordsInSummary > 1
        ? '✅ Summary contains relevant keywords'
        : '⚠️ Summary could include more role-specific keywords',
    ],
    improvements: [
      ...(!hasSummary ? [
        'Add a 3-4 line professional summary highlighting your key value proposition',
        'Include your years of experience, specialization, and top 2-3 skills',
      ] : []),
      ...(hasSummary && hasKeywordsInSummary <= 1 ? [
        'Incorporate industry-specific keywords in your summary',
        'Mention specific technologies or methodologies you excel in',
      ] : []),
    ],
  };

  // 3. Work Experience (25 points)
  const hasExperience = detectSection(text, SECTION_KEYWORDS.experience);
  const actionVerbCount = countActionVerbs(text);
  const quantifiedCount = countQuantifiedAchievements(text);

  let expScore = 0;
  if (hasExperience) expScore += 10;
  expScore += Math.min(actionVerbCount * 2, 8);
  expScore += Math.min(quantifiedCount * 2, 7);

  const experienceSection: ATSSection = {
    name: 'Work Experience',
    score: Math.min(expScore, 25),
    maxScore: 25,
    present: hasExperience,
    feedback: [
      hasExperience ? '✅ Work experience section found' : '❌ No work experience section detected',
      `${actionVerbCount > 5 ? '✅' : '⚠️'} ${actionVerbCount} action verbs detected (aim for 8+)`,
      `${quantifiedCount > 3 ? '✅' : '⚠️'} ${quantifiedCount} quantified achievements found (aim for 5+)`,
    ],
    improvements: [
      ...(!hasExperience ? ['Add a Work Experience section with job titles, companies, dates, and responsibilities'] : []),
      ...(actionVerbCount < 8 ? [`Use strong action verbs like: Led, Developed, Implemented, Optimized, Architected (currently ${actionVerbCount} found)`] : []),
      ...(quantifiedCount < 5 ? ['Add measurable achievements: "Increased performance by 40%", "Reduced costs by $50K", "Led team of 8 engineers"'] : []),
    ],
    example: hasExperience ? undefined : 'Senior Software Engineer | Company Name | Jan 2022 – Present\n• Led development of microservices architecture serving 1M+ users\n• Reduced API response time by 45% through caching implementation',
  };

  // 4. Education (15 points)
  const hasEducation = detectSection(text, SECTION_KEYWORDS.education);
  const hasDegree = ['bachelor', 'master', 'phd', 'b.tech', 'm.tech', 'b.e', 'bsc', 'msc', 'degree'].some(d => containsKeyword(text, d));
  const hasCertification = detectSection(text, SECTION_KEYWORDS.certifications);

  const eduScore = (hasEducation ? 8 : 0) + (hasDegree ? 4 : 0) + (hasCertification ? 3 : 0);

  const educationSection: ATSSection = {
    name: 'Education & Certifications',
    score: Math.min(eduScore, 15),
    maxScore: 15,
    present: hasEducation,
    feedback: [
      hasEducation ? '✅ Education section found' : '❌ No education section detected',
      hasDegree ? '✅ Degree qualification mentioned' : '⚠️ No specific degree mentioned',
      hasCertification ? '✅ Certifications mentioned' : '⚠️ No certifications listed',
    ],
    improvements: [
      ...(!hasEducation ? ['Add an Education section with degree, institution, and graduation year'] : []),
      ...(!hasCertification ? ['Add relevant certifications (AWS, Google Cloud, PMP, etc.) to boost credibility'] : []),
    ],
  };

  // 5. Skills Section (20 points)
  const hasSkills = detectSection(text, SECTION_KEYWORDS.skills);
  const foundTechSkills = TECH_SKILLS.filter(s => containsKeyword(text, s));
  const foundSoftSkills = SOFT_SKILLS.filter(s => containsKeyword(text, s));

  let skillScore = 0;
  if (hasSkills) skillScore += 8;
  skillScore += Math.min(foundTechSkills.length * 0.8, 8);
  skillScore += Math.min(foundSoftSkills.length * 0.4, 4);

  const skillsSection: ATSSection = {
    name: 'Skills & Technologies',
    score: Math.min(Math.round(skillScore), 20),
    maxScore: 20,
    present: hasSkills,
    keywords: foundTechSkills,
    feedback: [
      hasSkills ? '✅ Dedicated skills section found' : '❌ No skills section detected',
      `${foundTechSkills.length > 8 ? '✅' : '⚠️'} ${foundTechSkills.length} technical skills found`,
      `${foundSoftSkills.length > 3 ? '✅' : '⚠️'} ${foundSoftSkills.length} soft skills mentioned`,
    ],
    improvements: [
      ...(!hasSkills ? ['Create a dedicated Skills section with categorized technical and soft skills'] : []),
      ...(foundTechSkills.length < 10 ? ['Add more relevant technical skills (aim for 15-25 skills relevant to your target role)'] : []),
      ...(foundSoftSkills.length < 3 ? ['Include soft skills: Leadership, Communication, Problem-solving, etc.'] : []),
    ],
  };

  // 6. Projects (10 points)
  const hasProjects = detectSection(text, SECTION_KEYWORDS.projects);
  const hasGithub = containsKeyword(text, 'github');

  const projectsSection: ATSSection = {
    name: 'Projects & Portfolio',
    score: Math.min((hasProjects ? 8 : 0) + (hasGithub ? 2 : 0), 10),
    maxScore: 10,
    present: hasProjects,
    feedback: [
      hasProjects ? '✅ Projects section found' : '⚠️ No projects section (highly recommended)',
      hasGithub ? '✅ GitHub link referenced' : '⚠️ No GitHub link for project verification',
    ],
    improvements: [
      ...(!hasProjects ? ['Add a Projects section showcasing 2-3 key projects with tech stack, impact, and GitHub links'] : []),
      ...(!hasGithub ? ['Include GitHub repository links for your projects'] : []),
    ],
  };

  // 7. ATS Formatting (5 points)
  const formattingIssues = checkFormattingIssues(text);
  const formatScore = Math.max(5 - formattingIssues.length * 2, 0);

  const formattingSection: ATSSection = {
    name: 'ATS Formatting',
    score: formatScore,
    maxScore: 5,
    present: formattingIssues.length === 0,
    feedback: [
      formattingIssues.length === 0
        ? '✅ No major formatting issues detected'
        : `⚠️ ${formattingIssues.length} formatting issue(s) found`,
      ...formattingIssues.map(i => `❌ ${i}`),
    ],
    improvements: [
      ...formattingIssues,
      ...(formattingIssues.length === 0 ? [] : [
        'Use standard fonts (Arial, Calibri, Times New Roman)',
        'Avoid tables, text boxes, and complex layouts for ATS compatibility',
      ]),
    ],
  };

  const sections: ATSSection[] = [
    contactSection, summarySection, experienceSection,
    educationSection, skillsSection, projectsSection, formattingSection,
  ];

  const totalScore = sections.reduce((acc, s) => acc + s.score, 0);
  const maxTotal = sections.reduce((acc, s) => acc + s.maxScore, 0);
  const overallScore = Math.round((totalScore / maxTotal) * 100);

  let grade = 'F';
  if (overallScore >= 90) grade = 'A+';
  else if (overallScore >= 80) grade = 'A';
  else if (overallScore >= 70) grade = 'B+';
  else if (overallScore >= 60) grade = 'B';
  else if (overallScore >= 50) grade = 'C';
  else if (overallScore >= 40) grade = 'D';

  // Generate prioritized recommendations
  const recommendations: Recommendation[] = [];

  if (!hasSummary) {
    recommendations.push({
      priority: 'critical',
      category: 'Content',
      title: 'Add a Professional Summary',
      description: 'A compelling 3-4 line summary is the first thing ATS and recruiters read. It sets context for your entire resume.',
      example: `Results-driven ${candidateProfile.currentRole} with ${candidateProfile.totalYoe}+ years of experience. Proven track record in ${candidateProfile.primarySkills.slice(0, 3).join(', ')}. ${candidateProfile.quantifiedAchievements[0] || 'Delivered measurable business impact across multiple projects'}.`,
      impact: 10,
    });
  }

  if (actionVerbCount < 5) {
    recommendations.push({
      priority: 'critical',
      category: 'Language',
      title: 'Use Strong Action Verbs',
      description: 'ATS systems and recruiters weight bullet points starting with strong action verbs much higher. Replace passive voice with active achievements.',
      example: 'Instead of "Was responsible for managing database" → "Architected and optimized MySQL database handling 500K+ daily queries"',
      impact: 8,
    });
  }

  if (quantifiedCount < 3) {
    recommendations.push({
      priority: 'critical',
      category: 'Achievements',
      title: 'Quantify Your Achievements',
      description: 'Numbers make your resume stand out. Add specific metrics to at least 70% of your bullet points.',
      example: '"Improved application performance" → "Reduced API response time by 65% (from 800ms to 280ms), improving user retention by 23%"',
      impact: 12,
    });
  }

  if (!hasSkills || foundTechSkills.length < 8) {
    recommendations.push({
      priority: 'high',
      category: 'Keywords',
      title: 'Expand Your Skills Section',
      description: 'ATS systems heavily weight keyword matching. Ensure your skills section uses exact terminology from job descriptions.',
      impact: 8,
    });
  }

  if (!hasCertification) {
    recommendations.push({
      priority: 'medium',
      category: 'Credentials',
      title: 'Add Industry Certifications',
      description: 'Certifications act as trust signals for both ATS and recruiters. Even online certifications from Coursera, Udemy, or Google count.',
      example: 'AWS Certified Solutions Architect, Google Professional Cloud Architect, PMP, Certified Scrum Master',
      impact: 5,
    });
  }

  if (!hasProjects) {
    recommendations.push({
      priority: 'high',
      category: 'Proof of Work',
      title: 'Add a Projects Section',
      description: 'Projects demonstrate practical skills beyond your job titles. Include 2-3 impactful projects with GitHub links.',
      example: `${candidateProfile.primarySkills[0] || 'Full-Stack'} Platform | ${candidateProfile.primarySkills.slice(0, 3).join(', ')} | github.com/yourname/project\n• Built application with 2000+ users, processing significant transactions monthly`,
      impact: 7,
    });
  }

  if (!contactInfo.linkedin) {
    recommendations.push({
      priority: 'high',
      category: 'Visibility',
      title: 'Add LinkedIn Profile URL',
      description: 'LinkedIn is checked by 87% of recruiters. A complete LinkedIn profile with matching resume content improves ATS scoring.',
      impact: 4,
    });
  }

  // Profile-specific tip: add primary skills if missing
  const missingPrimaryInResume = candidateProfile.primarySkills.length < 3;
  if (missingPrimaryInResume) {
    recommendations.push({
      priority: 'high',
      category: 'Skills',
      title: 'Strengthen Primary Skills Visibility',
      description: 'Your top skills are not clearly visible. Make sure your primary technical skills appear in both the Skills section and work experience bullets.',
      impact: 9,
    });
  }

  recommendations.sort((a, b) => b.impact - a.impact);

  const missingKeywords = TECH_SKILLS.filter(s => !containsKeyword(text, s)).slice(0, 15);

  return {
    overallScore,
    grade,
    sections,
    extractedSkills: foundTechSkills,
    extractedKeywords: [...foundTechSkills, ...foundSoftSkills],
    extractedJobTitle: detectJobTitle(text),
    detectedExperience: candidateProfile.totalYoe,
    recommendations,
    missingKeywords,
    formattingIssues,
    candidateProfile,
  };
}
