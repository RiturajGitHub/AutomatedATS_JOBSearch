# 🏗️ ResumeIQ - Technical Architecture

Complete technical documentation for developers who want to understand, modify, or extend this project.

## Table of Contents
1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Algorithms](#algorithms)
5. [Data Flow](#data-flow)
6. [API Integration](#api-integration)
7. [Extension Points](#extension-points)
8. [Performance Optimizations](#performance-optimizations)

## Tech Stack

### Frontend Framework
```typescript
React 19.2.3 + TypeScript 5.9.3
- Functional components with hooks
- Type-safe interfaces
- No class components
```

### Styling
```typescript
Tailwind CSS 4.1.17
- Utility-first CSS
- Custom color palette (violet/indigo theme)
- Responsive design (mobile-first)
- Dark theme only
```

### Build Tool
```typescript
Vite 7.2.4
- Fast HMR (Hot Module Replacement)
- Optimized production builds
- Single-file output via vite-plugin-singlefile
```

### PDF Processing
```typescript
pdfjs-dist (Mozilla PDF.js)
- Client-side PDF parsing
- No server required
- CDN worker for browser compatibility
```

### Document Processing
```typescript
mammoth.js
- DOCX text extraction
- Preserves basic formatting
- Browser-compatible
```

### Job Search API
```typescript
JSearch API (via RapidAPI)
- Optional integration
- Fallback to mock data
- 40+ data points per job
```

### Icons
```typescript
Lucide React
- 1000+ icons
- Tree-shakeable
- Consistent design
```

## Project Structure

```
src/
├── components/          # React components
│   ├── Header.tsx               # Top navigation bar
│   ├── ResumeUpload.tsx         # File upload with drag & drop
│   ├── LoadingScreen.tsx        # Animated analysis progress
│   ├── ATSAnalysis.tsx          # ATS score results display
│   └── JobSearch.tsx            # Job search interface & results
│
├── utils/              # Business logic
│   ├── pdfParser.ts             # PDF/DOCX text extraction
│   ├── atsAnalyzer.ts           # ATS scoring algorithm
│   └── jobSearch.ts             # Job API + mock data generator
│
├── types/              # TypeScript definitions
│   └── index.ts                 # All interfaces & types
│
├── App.tsx             # Main app (state management & routing)
├── main.tsx            # React entry point
└── index.css           # Global styles + Tailwind
```

## Core Components

### 1. ResumeUpload.tsx

**Purpose**: File upload interface with drag & drop

**Key Features**:
- React Dropzone integration
- File validation (PDF, DOCX, DOC, TXT)
- Size limit enforcement (10MB)
- Real-time text extraction
- Error handling with user feedback

**State Management**:
```typescript
const [isProcessing, setIsProcessing] = useState(false);
const [error, setError] = useState<string | null>(null);
```

**File Processing Flow**:
```typescript
File Upload → Validation → Text Extraction → Parent Callback
              ↓
         Size Check (10MB)
         Type Check (.pdf, .docx, .doc, .txt)
              ↓
         extractTextFromFile()
              ↓
         onResumeUploaded({ rawText, fileName, fileSize })
```

**Extension Points**:
- Add more file types (modify `accept` prop)
- Customize validation rules
- Add file preview before upload
- Implement batch upload

### 2. ATSAnalysis.tsx

**Purpose**: Display detailed ATS score analysis

**Key Features**:
- Animated score circle with gradual fill
- Expandable section cards
- Prioritized recommendations
- Copy-to-clipboard examples
- Skills keyword display

**Component Hierarchy**:
```
ATSAnalysis
├── ScoreCircle (score visualization)
├── MiniScoreBar (section progress bars)
├── SectionCard (expandable section details)
│   ├── Feedback bullets
│   ├── Improvement suggestions
│   ├── Examples
│   └── Keywords (if applicable)
└── RecommendationCard (actionable items)
    ├── Priority badge
    ├── Impact score
    ├── Description
    └── Example with copy button
```

**State Management**:
```typescript
// Minimal state - relies on props from parent
const [expanded, setExpanded] = useState(index < 2); // Expand first 2 sections
const [copied, setCopied] = useState(false); // Copy button state
```

**Performance**:
- Lazy expansion (renders only expanded sections)
- Memoized calculations
- Smooth animations via CSS transitions

### 3. JobSearch.tsx

**Purpose**: Job search configuration and results display

**Key Features**:
- Multi-source selection (LinkedIn/Naukri/InstaHyre)
- Optional API key input
- Real-time job matching
- Advanced filtering (score, source, date)
- Match score visualization

**State Management**:
```typescript
const [selectedSources, setSelectedSources] = useState<Source[]>(['LinkedIn', 'Naukri', 'InstaHyre']);
const [apiKey, setApiKey] = useState('');
const [isSearching, setIsSearching] = useState(false);
const [jobs, setJobs] = useState<JobResult[]>([]);
const [filterScore, setFilterScore] = useState(0);
const [sortBy, setSortBy] = useState<'match' | 'date'>('match');
```

**Search Flow**:
```typescript
User Input (query, location, sources)
    ↓
API Key Check
    ├─ Has Key → searchJobsWithAPI() → Real data
    └─ No Key → generateMockJobs() → Demo data
    ↓
Calculate Match Scores (for each job)
    ↓
Filter by Selected Sources
    ↓
Sort by Match Score
    ↓
Display Results (JobCard components)
```

**JobCard Component**:
```typescript
<JobCard job={job} rank={index + 1} />
├── Company Logo
├── Match Score Ring
├── Job Details (title, company, location)
├── Match Reasons (why you match)
├── Required Skills
├── Expandable Description
└── Apply Button (external link)
```

### 4. LoadingScreen.tsx

**Purpose**: Animated loading experience during ATS analysis

**Key Features**:
- Step-by-step progress display
- Animated progress bar (0-100%)
- Visual checkmarks for completed steps
- Synchronized timing

**Animation Sequence**:
```typescript
const steps = [
  { label: 'Parsing resume document...', duration: 800 },
  { label: 'Extracting contact information...', duration: 600 },
  { label: 'Analyzing skills & technologies...', duration: 700 },
  // ... 8 total steps, ~5.5 seconds total
];
```

**Implementation**:
```typescript
useEffect(() => {
  let stepIndex = 0;
  const runStep = () => {
    if (stepIndex < steps.length) {
      setCurrentStep(stepIndex);
      setTimeout(() => {
        setCompletedSteps(prev => [...prev, stepIndex]);
        stepIndex++;
        runStep();
      }, steps[stepIndex].duration);
    }
  };
  runStep();
}, []);
```

## Algorithms

### 1. ATS Scoring Algorithm

**File**: `src/utils/atsAnalyzer.ts` (400+ lines)

**High-Level Logic**:
```typescript
export function analyzeResume(resumeText: string): ATSResult {
  // 1. Parse sections
  const sections = detectAllSections(text);
  
  // 2. Score each section
  const contactScore = scoreContactInfo(text);      // 15 points
  const summaryScore = scoreSummary(text);          // 10 points
  const expScore = scoreExperience(text);           // 25 points
  const eduScore = scoreEducation(text);            // 15 points
  const skillsScore = scoreSkills(text);            // 20 points
  const projectsScore = scoreProjects(text);        // 10 points
  const formatScore = scoreFormatting(text);        //  5 points
  
  // 3. Calculate overall
  const overallScore = (sum / maxTotal) * 100;
  
  // 4. Generate recommendations
  const recommendations = generateRecommendations(sections);
  
  return { overallScore, sections, recommendations, ... };
}
```

**Section Detection**:
```typescript
function detectSection(text: string, keywords: string[]): boolean {
  const lines = text.toLowerCase().split('\n');
  return lines.some(line =>
    keywords.some(kw => {
      const trimmed = line.trim();
      return trimmed === kw || 
             trimmed.startsWith(kw + ':') || 
             trimmed.startsWith(kw + ' ');
    })
  );
}
```

**Skill Extraction**:
```typescript
const TECH_SKILLS = [
  'javascript', 'typescript', 'python', 'react', 'node.js', ...
  // 100+ skills
];

const foundSkills = TECH_SKILLS.filter(skill => 
  text.toLowerCase().includes(skill.toLowerCase())
);
```

**Action Verb Detection**:
```typescript
const ACTION_VERBS = [
  'led', 'managed', 'developed', 'implemented', 'optimized', ...
];

const verbCount = ACTION_VERBS.filter(verb => 
  containsKeyword(text, verb)
).length;

// Scoring: 2 points per verb, max 8 points
const verbScore = Math.min(verbCount * 2, 8);
```

**Quantified Achievement Detection**:
```typescript
const QUANTIFIERS = [
  '%', '$', 'million', 'billion', 'users', 'team', 'x', '×', ...
];

const quantCount = QUANTIFIERS.filter(q => 
  text.includes(q)
).length;

// Scoring: 2 points per quantifier, max 7 points
const quantScore = Math.min(quantCount * 2, 7);
```

**Recommendation Generation**:
```typescript
const recommendations: Recommendation[] = [];

if (actionVerbCount < 5) {
  recommendations.push({
    priority: 'critical',
    category: 'Language',
    title: 'Use Strong Action Verbs',
    description: '...',
    example: '...',
    impact: 8, // potential score improvement
  });
}

// Sort by impact (highest first)
recommendations.sort((a, b) => b.impact - a.impact);
```

### 2. Job Matching Algorithm

**File**: `src/utils/jobSearch.ts`

**Match Score Calculation**:
```typescript
function calculateMatchScore(
  job: JSearchJob, 
  userSkills: string[], 
  userKeywords: string[]
): { score: number; reasons: string[] } {
  
  const jobText = `${job.title} ${job.description}`.toLowerCase();
  let score = 0;
  const reasons: string[] = [];
  
  // 1. Skill Match (50% weight)
  const matchedSkills = userSkills.filter(skill => 
    jobText.includes(skill.toLowerCase())
  );
  const skillMatchPct = matchedSkills.length / Math.min(userSkills.length, 15);
  score += skillMatchPct * 50;
  
  if (matchedSkills.length > 0) {
    reasons.push(`✅ ${matchedSkills.length} skills match: ${matchedSkills.slice(0, 4).join(', ')}`);
  }
  
  // 2. Keyword Match (30% weight)
  const matchedKeywords = userKeywords.filter(kw => 
    jobText.includes(kw.toLowerCase())
  );
  const kwMatchPct = matchedKeywords.length / Math.min(userKeywords.length, 20);
  score += kwMatchPct * 30;
  
  // 3. Required Skills Match (20% weight)
  if (job.required_skills && job.required_skills.length > 0) {
    const reqMatch = job.required_skills.filter(reqSkill =>
      userSkills.some(us => 
        us.toLowerCase().includes(reqSkill.toLowerCase())
      )
    );
    const reqPct = reqMatch.length / job.required_skills.length;
    score += reqPct * 20;
    
    if (reqPct > 0.7) {
      reasons.push(`✅ ${Math.round(reqPct * 100)}% of requirements met`);
    }
  }
  
  // Bonuses
  if (job.is_remote) reasons.push('🏠 Remote opportunity');
  if (job.salary_min > 80000) reasons.push('💰 Competitive salary');
  
  return { 
    score: Math.min(Math.round(score), 100), 
    reasons 
  };
}
```

**Mock Data Generation**:
```typescript
export function generateMockJobs(
  skills: string[],
  jobTitle: string,
  sources: Source[]
): JobResult[] {
  
  // 10 pre-defined realistic jobs
  const mockJobs = [
    { title: `Senior ${jobTitle}`, company: 'Google', ... },
    { title: `${jobTitle} - Remote`, company: 'Microsoft', ... },
    // ... 8 more
  ];
  
  // Calculate match scores
  return mockJobs
    .filter(job => sources.includes(job.source))
    .map(job => {
      const matchedSkills = skills.filter(s => 
        job.description.toLowerCase().includes(s.toLowerCase())
      );
      const score = 40 + (matchedSkills.length / skills.length) * 60;
      
      return {
        ...job,
        matchScore: Math.round(score),
        matchReasons: generateMatchReasons(matchedSkills, job)
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}
```

## Data Flow

### Overall App Flow

```
User Action: Upload Resume
    ↓
[ResumeUpload] → extractTextFromFile()
    ↓
App State: resumeData = { rawText, fileName, fileSize }
    ↓
User Action: Select "Check ATS Score"
    ↓
[LoadingScreen] → 5-second animation
    ↓
App Logic: analyzeResume(resumeData.rawText)
    ↓
App State: atsResult = { overallScore, sections, recommendations, ... }
    ↓
[ATSAnalysis] → Display results
    ↓
User Action: Click "Find Matching Jobs"
    ↓
[JobSearch] → Configure search
    ↓
User Action: Click "Search & Match Jobs"
    ↓
JobSearch Logic: 
    Has API Key? → searchJobsWithAPI()
    No API Key? → generateMockJobs()
    ↓
JobSearch State: jobs = JobResult[]
    ↓
Display: JobCard components with match scores
```

### Resume Upload Flow

```typescript
// 1. User drops file
onDrop(acceptedFiles: File[]) → file: File

// 2. Validation
file.size <= 10MB? ✓
file.extension in [pdf, docx, doc, txt]? ✓

// 3. Text extraction
extractTextFromFile(file)
  ├─ PDF → extractTextFromPDF() → pdfjs-dist
  ├─ DOCX → mammoth.extractRawText()
  └─ TXT → file.text()
  
// 4. Result
rawText: string (resume content as plain text)

// 5. Callback to parent
onResumeUploaded({ rawText, fileName, fileSize })
```

### ATS Analysis Flow

```typescript
// Input
resumeText: string

// Processing
analyzeResume(resumeText)
  ├─ 1. Extract contact info (email, phone, LinkedIn, GitHub)
  ├─ 2. Detect sections (summary, experience, education, etc.)
  ├─ 3. Extract skills (match against 100+ keywords)
  ├─ 4. Count action verbs (led, managed, developed, ...)
  ├─ 5. Count quantifiers (%, $, users, ...)
  ├─ 6. Detect job title (match against 30+ roles)
  ├─ 7. Calculate experience years (from dates or text)
  ├─ 8. Score each section (weighted)
  ├─ 9. Generate recommendations (priority + impact)
  └─ 10. Calculate overall score (sum / max * 100)

// Output
ATSResult {
  overallScore: 85,
  grade: 'A',
  sections: ATSSection[],
  extractedSkills: string[],
  recommendations: Recommendation[],
  ...
}
```

### Job Search Flow

```typescript
// Input
{
  apiKey: string | '',
  query: 'Software Engineer',
  location: 'Bangalore',
  skills: string[],
  keywords: string[],
  sources: ['LinkedIn', 'Naukri', 'InstaHyre']
}

// API Call (if key provided)
fetch(`https://jsearch.p.rapidapi.com/search?query=...`, {
  headers: { 'X-RapidAPI-Key': apiKey }
})
  ↓
JSearchJob[] (raw API response)

// OR Mock Data (no key)
generateMockJobs(skills, jobTitle, sources)
  ↓
JobResult[] (pre-defined realistic jobs)

// Processing (both paths)
jobs.map(job => ({
  ...job,
  matchScore: calculateMatchScore(job, skills, keywords),
  matchReasons: generateMatchReasons(...)
}))

// Filter & Sort
jobs
  .filter(j => j.matchScore >= filterScore)
  .filter(j => sources.includes(j.source))
  .sort((a, b) => b.matchScore - a.matchScore)

// Output
JobResult[] (ready for display)
```

## API Integration

### JSearch API (Optional)

**Provider**: RapidAPI  
**Endpoint**: `https://jsearch.p.rapidapi.com/search`  
**Method**: GET  
**Authentication**: API Key in header

**Request Example**:
```typescript
const response = await fetch(
  `${JSEARCH_BASE_URL}/search?query=${encodeURIComponent(query + ' ' + location)}&page=1&num_pages=2&date_posted=month`,
  {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
    },
  }
);
```

**Response Schema**:
```typescript
interface JSearchResponse {
  data: JSearchJob[];
  parameters: {
    query: string;
    page: number;
    num_pages: number;
  };
}

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
  job_required_skills?: string[];
  // 40+ total fields
}
```

**Error Handling**:
```typescript
try {
  const response = await fetch(...);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  const data = await response.json();
  // Use data
} catch (error) {
  // Fallback to mock data
  const mockJobs = generateMockJobs(...);
  setJobs(mockJobs);
  setUsingMockData(true);
}
```

## Extension Points

### 1. Add New File Types

**File**: `src/utils/pdfParser.ts`

```typescript
export async function extractTextFromFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  // ADD NEW TYPE HERE
  if (extension === 'rtf') {
    // Implement RTF parser
    const rtfText = await parseRTF(file);
    return rtfText;
  }
  
  // Existing types...
}
```

### 2. Add New ATS Sections

**File**: `src/utils/atsAnalyzer.ts`

```typescript
// 1. Add section keywords
const SECTION_KEYWORDS = {
  // ... existing
  languages: ['languages', 'fluent', 'native', 'proficient'],
};

// 2. Add scoring logic
const languagesSection: ATSSection = {
  name: 'Languages',
  score: detectLanguages(text) ? 5 : 0,
  maxScore: 5,
  present: detectLanguages(text),
  feedback: [...],
  improvements: [...],
};

// 3. Add to sections array
const sections: ATSSection[] = [
  ...,
  languagesSection,
];
```

### 3. Add New Job Platforms

**File**: `src/utils/jobSearch.ts`

```typescript
// 1. Update types
type Source = 'LinkedIn' | 'Naukri' | 'InstaHyre' | 'Indeed';

// 2. Add to mock data generator
const mockJobs = [
  {
    source: 'Indeed' as Source,
    title: 'Engineering Manager',
    company: 'Indeed Inc.',
    // ...
  },
];

// 3. Add to UI (JobSearch.tsx)
const platforms = [
  { id: 'Indeed', emoji: '🔵', desc: 'Global job search' },
];
```

### 4. Add Custom Recommendations

**File**: `src/utils/atsAnalyzer.ts`

```typescript
const recommendations: Recommendation[] = [];

// ADD CUSTOM LOGIC
if (detectedExperience > 10 && !text.toLowerCase().includes('patent')) {
  recommendations.push({
    priority: 'medium',
    category: 'Credentials',
    title: 'Highlight Patents or Publications',
    description: 'With 10+ years of experience, patents or publications significantly boost credibility.',
    impact: 6,
  });
}

// Existing recommendations...
```

### 5. Export Results as PDF

Add a new utility:

```typescript
// src/utils/pdfExport.ts
import jsPDF from 'jspdf';

export function exportATSReport(result: ATSResult, fileName: string) {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('ATS Score Report', 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Overall Score: ${result.overallScore}/100`, 20, 40);
  doc.text(`Grade: ${result.grade}`, 20, 50);
  
  // Add sections
  let y = 70;
  result.sections.forEach(section => {
    doc.text(`${section.name}: ${section.score}/${section.maxScore}`, 20, y);
    y += 10;
  });
  
  doc.save(`${fileName}_ATS_Report.pdf`);
}
```

Then add export button in `ATSAnalysis.tsx`:
```typescript
<button onClick={() => exportATSReport(result, fileName)}>
  📄 Export Report as PDF
</button>
```

## Performance Optimizations

### 1. Code Splitting

Already implemented via Vite:
```typescript
// Dynamic imports for heavy libraries
const mammoth = await import('mammoth');
```

### 2. Memoization

Add React.memo for expensive renders:
```typescript
const JobCard = React.memo<{ job: JobResult; rank: number }>(
  ({ job, rank }) => {
    // Expensive rendering logic
  },
  (prevProps, nextProps) => prevProps.job.id === nextProps.job.id
);
```

### 3. Virtual Scrolling

For large job lists (100+ results), implement virtual scrolling:
```bash
npm install react-window
```

```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={800}
  itemCount={jobs.length}
  itemSize={200}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <JobCard job={jobs[index]} rank={index + 1} />
    </div>
  )}
</FixedSizeList>
```

### 4. Debouncing Search

For API calls:
```typescript
import { debounce } from 'lodash';

const debouncedSearch = debounce((query: string) => {
  handleSearch(query);
}, 500);
```

### 5. Build Optimizations

Already configured in `vite.config.ts`:
- Tree shaking (removes unused code)
- Minification (reduces file size)
- Single file output (simplifies deployment)

Current bundle size: **~1.3 MB** (364 KB gzipped)

## Testing Recommendations

### Unit Tests

```typescript
// src/utils/__tests__/atsAnalyzer.test.ts
import { analyzeResume } from '../atsAnalyzer';

describe('ATS Analyzer', () => {
  it('should score high for complete resume', () => {
    const resume = `
      John Doe
      john@email.com | 555-1234
      
      Professional Summary
      Experienced engineer...
      
      Work Experience
      Led team of 8 engineers...
    `;
    
    const result = analyzeResume(resume);
    expect(result.overallScore).toBeGreaterThan(60);
  });
  
  it('should detect email', () => {
    const resume = 'Contact: john@email.com';
    const result = analyzeResume(resume);
    const contactSection = result.sections.find(s => s.name === 'Contact Information');
    expect(contactSection?.score).toBeGreaterThan(0);
  });
});
```

### E2E Tests (Playwright)

```typescript
// tests/resume-upload.spec.ts
import { test, expect } from '@playwright/test';

test('upload resume and see ATS score', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Upload file
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles('sample-resume.txt');
  
  // Wait for processing
  await expect(page.locator('text=Check ATS Score')).toBeVisible();
  
  // Click option
  await page.click('text=Check ATS Score');
  
  // Verify results
  await expect(page.locator('text=/\\d+\\/100/')).toBeVisible({ timeout: 10000 });
});
```

---

This architecture is designed for:
- ✅ Easy extension (add new sections, file types, APIs)
- ✅ Type safety (TypeScript throughout)
- ✅ Performance (lazy loading, memoization)
- ✅ Maintainability (clear separation of concerns)
- ✅ Testability (pure functions, isolated components)

For questions or contributions, refer to the inline code comments and TypeScript type definitions.
