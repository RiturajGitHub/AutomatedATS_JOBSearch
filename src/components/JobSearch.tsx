import React, { useState } from 'react';
import {
  Search, ArrowLeft, ExternalLink, MapPin, Briefcase,
  Clock, DollarSign, Star, Filter, Loader2, AlertCircle, CheckCircle,
  Globe, Zap, ChevronDown, ChevronUp, Key, Info, TrendingUp,
  Target, Award, Lightbulb, BarChart2, BookOpen, Users
} from 'lucide-react';
import { ResumeData, JobResult, CandidateProfile, JobSearchSummary, ResumeOptimisationTip } from '../types';
import {
  searchJobsWithAPI, generateMockJobs,
  buildSummaryDashboard, buildResumeOptimisationTips,
  generateSearchQueries,
} from '../utils/jobSearch';

interface JobSearchProps {
  resumeData: ResumeData;
  candidateProfile: CandidateProfile;
  onBack: () => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const SourceBadge: React.FC<{ source: string }> = ({ source }) => {
  const configs: Record<string, { bg: string; text: string; border: string; emoji: string }> = {
    LinkedIn:  { bg: 'bg-blue-500/20',   text: 'text-blue-400',   border: 'border-blue-500/30',   emoji: '💼' },
    Naukri:    { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', emoji: '🎯' },
    InstaHyre: { bg: 'bg-green-500/20',  text: 'text-green-400',  border: 'border-green-500/30',  emoji: '⚡' },
    Indeed:    { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', emoji: '🔍' },
    Glassdoor: { bg: 'bg-teal-500/20',   text: 'text-teal-400',   border: 'border-teal-500/30',   emoji: '🚪' },
  };
  const c = configs[source] || configs['LinkedIn'];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${c.bg} ${c.text} border ${c.border}`}>
      {c.emoji} {source}
    </span>
  );
};

const FitBadgeChip: React.FC<{ badge: string }> = ({ badge }) => {
  const configs: Record<string, { bg: string; text: string; border: string }> = {
    'EXCEPTIONAL FIT': { bg: 'bg-green-500/20',  text: 'text-green-300',  border: 'border-green-500/40' },
    'STRONG FIT':      { bg: 'bg-blue-500/20',   text: 'text-blue-300',   border: 'border-blue-500/40' },
    'MODERATE FIT':    { bg: 'bg-amber-500/20',  text: 'text-amber-300',  border: 'border-amber-500/40' },
    'WEAK FIT':        { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/40' },
    'DISCARD':         { bg: 'bg-red-500/20',    text: 'text-red-300',    border: 'border-red-500/40' },
  };
  const c = configs[badge] || configs['MODERATE FIT'];
  return (
    <span className={`text-xs font-bold px-2 py-1 rounded-full border ${c.bg} ${c.text} ${c.border}`}>
      {badge}
    </span>
  );
};

const ScoreRing: React.FC<{ score: number; size?: number }> = ({ score, size = 52 }) => {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 90 ? '#22c55e' : score >= 75 ? '#3b82f6' : score >= 60 ? '#f59e0b' : '#f97316';
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1f2937" strokeWidth="4" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-white">{score}%</span>
      </div>
    </div>
  );
};

const DimBar: React.FC<{ label: string; score: number; weight: number }> = ({ label, score, weight }) => {
  const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-blue-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-500';
  const blocks = Math.round(score / 10);
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-gray-400 w-32 flex-shrink-0">{label}</span>
      <div className="flex gap-0.5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className={`w-2.5 h-2.5 rounded-sm ${i < blocks ? color : 'bg-gray-700'}`} />
        ))}
      </div>
      <span className="text-white font-semibold w-8">{score}%</span>
      <span className="text-gray-600">({Math.round(weight * 100)}%)</span>
    </div>
  );
};

const JobCard: React.FC<{ job: JobResult; rank: number }> = ({ job, rank }) => {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'why' | 'breakdown' | 'requirements' | 'gaps' | 'tip'>('why');

  const rankBg = rank === 1 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
    rank === 2 ? 'bg-gray-400/20 text-gray-300 border-gray-500/30' :
    rank === 3 ? 'bg-orange-700/20 text-orange-400 border-orange-700/30' :
    'bg-gray-700/50 text-gray-400 border-gray-600/30';

  const cardBorder = job.matchScore >= 90 ? 'border-green-500/30' :
    job.matchScore >= 75 ? 'border-blue-500/20' :
    job.matchScore >= 60 ? 'border-amber-500/20' : 'border-gray-700/80';

  const tierLabel: Record<string, string> = {
    FAANG: '🏆 FAANG', Tier1Unicorn: '🦄 Unicorn', 'SeriesB+': '🚀 Series B+',
    ListedProduct: '📈 Listed', MNCProduct: '🏢 MNC', EarlyStartup: '⚡ Startup',
    ConsultingProduct: '🔧 Consulting', ServiceOutsourcing: '🔄 Service', Unknown: '❓ Unknown',
  };

  return (
    <div className={`bg-gray-800/60 border ${cardBorder} rounded-2xl overflow-hidden transition-all duration-200 hover:border-gray-500`}>
      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {job.companyLogo ? (
              <img src={job.companyLogo} alt={job.company} className="w-12 h-12 rounded-xl object-contain bg-white p-1" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gray-700 flex items-center justify-center text-white font-bold text-lg">
                {job.company.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="text-white font-bold text-lg leading-tight">{job.title}</h3>
                  {job.isUrgent && (
                    <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full animate-pulse">
                      🔥 URGENT
                    </span>
                  )}
                  {job.isStretchRole && (
                    <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full">
                      📈 LEVEL UP
                    </span>
                  )}
                  {job.equityMentioned && (
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full">
                      💰 EQUITY
                    </span>
                  )}
                </div>
                <p className="text-gray-300 font-medium">{job.company}</p>
                <p className="text-gray-500 text-xs mt-0.5">{tierLabel[job.companyTier] || job.companyTier}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs font-bold px-2 py-1 rounded-full border ${rankBg}`}>#{rank}</span>
                <ScoreRing score={job.matchScore} />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              <SourceBadge source={job.source} />
              <FitBadgeChip badge={job.fitBadge} />
              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                <MapPin className="w-3 h-3" />{job.location}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                <Briefcase className="w-3 h-3" />{job.jobType}
              </span>
              {job.isRemote && (
                <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                  🏠 {job.remoteType === 'hybrid' ? 'Hybrid' : 'Remote'}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                <Clock className="w-3 h-3" />{job.postedDate}
              </span>
              {job.experience && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                  <Users className="w-3 h-3" />{job.experience}
                </span>
              )}
            </div>

            {job.salary && (
              <div className="mt-2 inline-flex items-center gap-1 text-sm text-green-400 font-semibold">
                <DollarSign className="w-4 h-4" />{job.salary}
                {job.salaryEstimated && <span className="text-xs text-gray-500 font-normal ml-1">(estimated)</span>}
              </div>
            )}
          </div>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 w-full flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-white bg-gray-700/30 hover:bg-gray-700/60 rounded-xl py-2 transition-all"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {expanded ? 'Collapse details' : 'View full analysis'}
        </button>

        {expanded && (
          <div className="mt-4 space-y-4">
            {/* Tab navigation */}
            <div className="flex gap-1 bg-gray-900/60 rounded-xl p-1 overflow-x-auto">
              {([
                { key: 'why',          label: '✅ Why Fit',      icon: Star },
                { key: 'breakdown',    label: '📊 Score',        icon: BarChart2 },
                { key: 'requirements', label: '📋 Requirements', icon: Target },
                { key: 'gaps',         label: '⚠️ Gaps',         icon: AlertCircle },
                { key: 'tip',          label: '💡 Apply Tip',    icon: Lightbulb },
              ] as { key: typeof activeTab; label: string; icon: any }[]).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg transition-all font-medium ${
                    activeTab === tab.key
                      ? 'bg-violet-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab: Why Strong Fit */}
            {activeTab === 'why' && (
              <div className="bg-gray-900/50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400" /> Why This Is A Strong Fit
                </p>
                {job.whyStrongFit.length > 0 ? job.whyStrongFit.map((reason, i) => (
                  <p key={i} className="text-sm text-gray-300 leading-relaxed">{reason}</p>
                )) : (
                  <p className="text-sm text-gray-500">Moderate match — review requirements carefully.</p>
                )}
                {/* ATS Keywords */}
                {job.atsKeywords.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-xs font-semibold text-violet-400 mb-2">🔑 ATS Keywords to Add to Resume:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {job.atsKeywords.map((kw, i) => (
                        <span key={i} className="text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Score Breakdown */}
            {activeTab === 'breakdown' && (
              <div className="bg-gray-900/50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-1">
                  <BarChart2 className="w-3 h-3 text-blue-400" /> Match Breakdown (7 Dimensions)
                </p>
                <div className="space-y-2.5">
                  <DimBar label="Primary Skills"   score={job.scoreBreakdown.d1PrimarySkills}   weight={0.25} />
                  <DimBar label="Secondary Skills" score={job.scoreBreakdown.d2SecondarySkills} weight={0.20} />
                  <DimBar label="Experience Level" score={job.scoreBreakdown.d3ExperienceLevel} weight={0.15} />
                  <DimBar label="Domain Alignment" score={job.scoreBreakdown.d4DomainAlignment} weight={0.15} />
                  <DimBar label="Location Fit"     score={job.scoreBreakdown.d5Location}        weight={0.05} />
                  <DimBar label="Company Fit"      score={job.scoreBreakdown.d6CompanyFit}      weight={0.10} />
                  <DimBar label="Salary Fit"       score={job.scoreBreakdown.d7Salary}          weight={0.10} />
                </div>
                <div className="mt-4 pt-3 border-t border-gray-700 flex items-center justify-between">
                  <span className="text-sm text-gray-400">Weighted Total</span>
                  <span className="text-xl font-black text-white">{job.matchScore}%</span>
                </div>
              </div>
            )}

            {/* Tab: Requirements vs Profile */}
            {activeTab === 'requirements' && (
              <div className="bg-gray-900/50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                  <Target className="w-3 h-3 text-green-400" /> Requirements vs Your Profile
                </p>
                {job.requirementMatches.length > 0 ? (
                  <div className="space-y-2">
                    {job.requirementMatches.map((rm, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm py-1.5 border-b border-gray-800 last:border-0">
                        <span className="text-lg flex-shrink-0">{rm.status}</span>
                        <span className="text-gray-300 flex-1">{rm.requirement}</span>
                        <span className={`text-xs flex-shrink-0 ${
                          rm.status === '✅' ? 'text-green-400' :
                          rm.status === '⚠️' ? 'text-amber-400' : 'text-red-400'
                        }`}>{rm.candidateMatch}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No specific requirements extracted from this JD.</p>
                )}
                {/* Preferred skills */}
                {job.preferredSkills.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-xs text-gray-500 mb-2">Preferred / Nice-to-have:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {job.preferredSkills.slice(0, 8).map((s, i) => (
                        <span key={i} className="text-xs bg-gray-700/60 text-gray-400 border border-gray-600 px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Skill Gaps */}
            {activeTab === 'gaps' && (
              <div className="bg-gray-900/50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-400" /> Skill Gaps
                </p>
                {job.skillGaps.length > 0 ? (
                  <div className="space-y-3">
                    {job.skillGaps.map((gap, i) => (
                      <div key={i} className={`rounded-lg p-3 border ${gap.bridgeable ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-white">{gap.skill}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${gap.bridgeable ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                            {gap.bridgeable ? '🔧 Bridgeable' : '⛔ Hard Gap'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">{gap.howToBridge}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <p className="text-sm">No significant skill gaps detected! You meet all key requirements.</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Application Tip */}
            {activeTab === 'tip' && (
              <div className="bg-gray-900/50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3 text-yellow-400" /> Personalised Application Tip
                </p>
                <p className="text-sm text-gray-300 leading-relaxed">{job.applicationTip}</p>
                {/* Description */}
                <div className="mt-4 pt-3 border-t border-gray-700">
                  <p className="text-xs text-gray-500 mb-2">Job Description:</p>
                  <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line">{job.description}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Apply Button */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Globe className="w-3 h-3" /> Via {job.source}
          </div>
          <a
            href={job.applyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-all"
          >
            Apply Now <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};

// ─── Summary Dashboard ────────────────────────────────────────────────────────

const SummaryDashboard: React.FC<{ summary: JobSearchSummary }> = ({ summary }) => (
  <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-5 mb-6">
    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
      <BarChart2 className="w-4 h-4 text-violet-400" /> Search Summary Dashboard
    </h3>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      {[
        { label: 'Total Scraped',    value: summary.totalScraped,  color: 'text-gray-300' },
        { label: 'Qualified (75%+)', value: summary.qualified,     color: 'text-blue-400' },
        { label: 'Exceptional (90%+)',value: summary.exceptional,  color: 'text-green-400' },
        { label: 'Avg Match Score',  value: `${summary.avgMatchScore}%`, color: 'text-violet-400' },
      ].map((stat, i) => (
        <div key={i} className="bg-gray-700/40 rounded-xl p-3 text-center">
          <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
          <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
      {summary.bestMatch && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">🏆 Best Match</p>
          <p className="text-white font-semibold text-xs">{summary.bestMatch.company}</p>
          <p className="text-gray-400 text-xs">{summary.bestMatch.role}</p>
          <p className="text-yellow-400 font-bold">{summary.bestMatch.score}%</p>
        </div>
      )}
      <div className="bg-gray-700/30 rounded-xl p-3">
        <p className="text-xs text-gray-500 mb-1">📊 Market Insights</p>
        <p className="text-xs text-gray-300">🏠 Remote roles: <strong className="text-white">{summary.remoteRoles}</strong></p>
        <p className="text-xs text-gray-300 mt-1">🔥 Most demanded: <strong className="text-violet-400">{summary.mostDemandedSkill}</strong></p>
      </div>
      {summary.topHiringCompanies.length > 0 && (
        <div className="bg-gray-700/30 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">🏢 Top Hiring</p>
          {summary.topHiringCompanies.map((c, i) => (
            <p key={i} className="text-xs text-gray-300">{c}</p>
          ))}
        </div>
      )}
    </div>
  </div>
);

// ─── Resume Optimisation Tips ─────────────────────────────────────────────────

const OptimisationTips: React.FC<{ tips: ResumeOptimisationTip[] }> = ({ tips }) => {
  if (tips.length === 0) return null;
  return (
    <div className="bg-gray-800/60 border border-violet-500/20 rounded-2xl p-5 mt-6">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-violet-400" /> Resume Optimisation Tips (Based on All JDs)
      </h3>
      <div className="space-y-3">
        {tips.map((tip, i) => (
          <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${
            tip.candidateHasIt
              ? 'bg-blue-500/10 border-blue-500/20'
              : 'bg-amber-500/10 border-amber-500/20'
          }`}>
            <div className="flex-shrink-0 mt-0.5">
              {tip.candidateHasIt
                ? <CheckCircle className="w-4 h-4 text-blue-400" />
                : <AlertCircle className="w-4 h-4 text-amber-400" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-white">{tip.skill}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  tip.frequencyPct >= 70 ? 'bg-red-500/20 text-red-400' :
                  tip.frequencyPct >= 50 ? 'bg-amber-500/20 text-amber-400' :
                  'bg-gray-600/40 text-gray-400'
                }`}>
                  {tip.frequencyPct}% of JDs
                </span>
              </div>
              <p className="text-xs text-gray-400">{tip.suggestion}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Candidate Profile Panel ──────────────────────────────────────────────────

const CandidateProfilePanel: React.FC<{ 
  profile: CandidateProfile;
  onSkillsUpdate?: (selectedSkills: string[]) => void;
  onSalaryUpdate?: (current: number, expected: { min: number; max: number }) => void;
}> = ({ profile, onSkillsUpdate, onSalaryUpdate }) => {
  const [open, setOpen] = useState(true); // Open by default
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(
    new Set([...profile.primarySkills, ...profile.secondarySkills, ...profile.toolsAndInfra])
  );
  
  // Salary state
  const [currentSalary, setCurrentSalary] = useState<number>(profile.salaryTarget || 20);
  const [expectedSalaryRange, setExpectedSalaryRange] = useState<{ min: number; max: number }>(
    { min: profile.salaryTarget || 20, max: (profile.salaryTarget || 20) + 5 }
  );

  // Generate salary options from 4L to 100L (1Cr) in 1L increments
  const salaryOptions = Array.from({ length: 97 }, (_, i) => 4 + i);

  // Generate expected salary ranges based on current salary
  const getExpectedRanges = (current: number) => {
    const ranges: { min: number; max: number; label: string }[] = [];
    for (let min = current; min <= 100; min += 5) {
      const max = Math.min(min + 5, 100);
      ranges.push({ min, max, label: `₹${min}-${max}L` });
      if (max >= 100) break;
    }
    return ranges;
  };

  const handleCurrentSalaryChange = (value: number) => {
    setCurrentSalary(value);
    const newExpected = { min: value, max: Math.min(value + 5, 100) };
    setExpectedSalaryRange(newExpected);
    onSalaryUpdate?.(value, newExpected);
  };

  const handleExpectedSalaryChange = (min: number, max: number) => {
    setExpectedSalaryRange({ min, max });
    onSalaryUpdate?.(currentSalary, { min, max });
  };

  const toggleSkill = (skill: string) => {
    const newSelected = new Set(selectedSkills);
    if (newSelected.has(skill)) {
      newSelected.delete(skill);
    } else {
      newSelected.add(skill);
    }
    setSelectedSkills(newSelected);
    onSkillsUpdate?.(Array.from(newSelected));
  };

  const selectAll = () => {
    const allSkills = [...profile.primarySkills, ...profile.secondarySkills, ...profile.toolsAndInfra];
    setSelectedSkills(new Set(allSkills));
    onSkillsUpdate?.(allSkills);
  };

  const deselectAll = () => {
    setSelectedSkills(new Set());
    onSkillsUpdate?.([]);
  };
  return (
    <div className="bg-gray-800/60 border border-gray-700 rounded-2xl mb-6 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="bg-violet-500/20 p-2 rounded-lg">
            <Award className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-left">
            <p className="text-white font-semibold text-sm">Extracted Candidate Profile</p>
            <p className="text-gray-400 text-xs">{profile.name} · {profile.careerLevel} · {profile.totalYoe} yrs exp</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-gray-700 pt-4 space-y-4">
          {/* Skill Selection Controls */}
          <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-violet-300 font-semibold">
                🎯 Select Skills for Job Matching ({selectedSkills.size} selected)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-xs bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 px-2 py-1 rounded transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={deselectAll}
                  className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
            <p className="text-xs text-violet-300/70">
              Click skills to include/exclude from job matching. Selected skills will be used to calculate match scores.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Primary Skills */}
            <div>
              <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                <Zap className="w-3 h-3 text-violet-400" /> Primary Skills
              </p>
              <div className="flex flex-wrap gap-1">
                {profile.primarySkills.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => toggleSkill(s)}
                    className={`text-xs px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                      selectedSkills.has(s)
                        ? 'bg-violet-500/30 text-violet-200 border-2 border-violet-400'
                        : 'bg-gray-700 text-gray-400 border border-gray-600 opacity-50'
                    }`}
                  >
                    {selectedSkills.has(s) ? '✓ ' : ''}{s}
                  </button>
                ))}
              </div>
            </div>

            {/* Secondary Skills */}
            <div>
              <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                <Star className="w-3 h-3 text-blue-400" /> Secondary Skills
              </p>
              <div className="flex flex-wrap gap-1">
                {profile.secondarySkills.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => toggleSkill(s)}
                    className={`text-xs px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                      selectedSkills.has(s)
                        ? 'bg-blue-500/30 text-blue-200 border-2 border-blue-400'
                        : 'bg-gray-700 text-gray-400 border border-gray-600 opacity-50'
                    }`}
                  >
                    {selectedSkills.has(s) ? '✓ ' : ''}{s}
                  </button>
                ))}
              </div>
            </div>

            {/* Tools & Infra */}
            <div>
              <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                <Target className="w-3 h-3 text-green-400" /> Tools & Infrastructure
              </p>
              <div className="flex flex-wrap gap-1">
                {profile.toolsAndInfra.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => toggleSkill(t)}
                    className={`text-xs px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                      selectedSkills.has(t)
                        ? 'bg-green-500/30 text-green-200 border-2 border-green-400'
                        : 'bg-gray-700 text-gray-400 border border-gray-600 opacity-50'
                    }`}
                  >
                    {selectedSkills.has(t) ? '✓ ' : ''}{t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Domain Expertise */}
            <div>
              <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                <Briefcase className="w-3 h-3 text-amber-400" /> Domain Expertise
              </p>
              <div className="flex flex-wrap gap-1">
                {profile.domainExpertise.map((d, i) => (
                  <span key={i} className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">{d}</span>
                ))}
              </div>
            </div>

            {/* Salary Selection */}
            <div>
              <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-green-400" /> Salary (CTC in LPA)
              </p>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Current CTC</label>
                  <select
                    value={currentSalary}
                    onChange={(e) => handleCurrentSalaryChange(Number(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-green-500 transition-colors"
                  >
                    {salaryOptions.map(sal => (
                      <option key={sal} value={sal}>₹{sal}L</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Expected CTC</label>
                  <select
                    value={`${expectedSalaryRange.min}-${expectedSalaryRange.max}`}
                    onChange={(e) => {
                      const [min, max] = e.target.value.split('-').map(Number);
                      handleExpectedSalaryChange(min, max);
                    }}
                    className="w-full bg-gray-700 border border-gray-600 text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-green-500 transition-colors"
                  >
                    {getExpectedRanges(currentSalary).map(range => (
                      <option key={`${range.min}-${range.max}`} value={`${range.min}-${range.max}`}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Pref: <span className="text-white">{profile.companyPreference}</span> ·
                  Remote: <span className="text-white">{String(profile.openToRemote)}</span>
                </p>
              </div>
            </div>
          </div>

          {profile.quantifiedAchievements.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-400" /> Key Achievements
              </p>
              <ul className="space-y-1">
                {profile.quantifiedAchievements.slice(0, 3).map((a, i) => (
                  <li key={i} className="text-xs text-gray-300 flex items-start gap-1">
                    <span className="text-green-400 mt-0.5">→</span> {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const JobSearch: React.FC<JobSearchProps> = ({
  resumeData: _resumeData,
  candidateProfile,
  onBack,
}) => {
  const [selectedSources, setSelectedSources] = useState<('LinkedIn' | 'Naukri' | 'InstaHyre')[]>(['LinkedIn', 'Naukri', 'InstaHyre']);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [customQuery, setCustomQuery] = useState(candidateProfile.currentRole);
  const [location, setLocation] = useState(candidateProfile.targetLocations[0] || 'India');
  const [isSearching, setIsSearching] = useState(false);
  const [jobs, setJobs] = useState<JobResult[]>([]);
  const [summary, setSummary] = useState<JobSearchSummary | null>(null);
  const [optimisationTips, setOptimisationTips] = useState<ResumeOptimisationTip[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [filterScore, setFilterScore] = useState(0);
  const [sortBy, setSortBy] = useState<'match' | 'date'>('match');
  const [usingMockData, setUsingMockData] = useState(false);

  const suggestedQueries = generateSearchQueries(candidateProfile);

  const toggleSource = (source: 'LinkedIn' | 'Naukri' | 'InstaHyre') => {
    setSelectedSources(prev =>
      prev.includes(source) ? prev.filter(s => s !== source) : [...prev, source]
    );
  };

  const handleSearch = async () => {
    if (selectedSources.length === 0) {
      setError('Please select at least one job platform.');
      return;
    }
    setIsSearching(true);
    setError(null);
    setHasSearched(true);

    try {
      let results: JobResult[];
      if (apiKey.trim()) {
        results = await searchJobsWithAPI(
          apiKey.trim(), customQuery || candidateProfile.currentRole,
          location, candidateProfile, selectedSources, 30
        );
        setUsingMockData(false);
      } else {
        await new Promise(resolve => setTimeout(resolve, 2000));
        results = generateMockJobs(candidateProfile, selectedSources);
        setUsingMockData(true);
      }
      setJobs(results);
      setSummary(buildSummaryDashboard(results));
      setOptimisationTips(buildResumeOptimisationTips(results, candidateProfile));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch jobs. Falling back to demo data.');
      const mockResults = generateMockJobs(candidateProfile, selectedSources);
      setJobs(mockResults);
      setSummary(buildSummaryDashboard(mockResults));
      setOptimisationTips(buildResumeOptimisationTips(mockResults, candidateProfile));
      setUsingMockData(true);
    } finally {
      setIsSearching(false);
    }
  };

  const filteredJobs = jobs
    .filter(j => j.matchScore >= filterScore)
    .sort((a, b) => {
      if (sortBy === 'match') return b.matchScore - a.matchScore;
      return a.postedDaysAgo - b.postedDaysAgo;
    });

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Back */}
        <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-500/20 p-3 rounded-xl">
            <Search className="w-7 h-7 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Universal Job Match Engine</h1>
            <p className="text-gray-400 text-sm">
              7-dimension scoring · {candidateProfile.primarySkills.length} primary skills · {candidateProfile.totalYoe} yrs exp · {candidateProfile.careerLevel} level
            </p>
          </div>
        </div>

        {/* Candidate Profile Panel */}
        <CandidateProfilePanel profile={candidateProfile} />

        {/* Search Configuration */}
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
            <Filter className="w-4 h-4 text-violet-400" /> Search Configuration
          </h2>

          {/* Suggested queries */}
          {suggestedQueries.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Suggested queries from your profile:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQueries.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setCustomQuery(q)}
                    className={`text-xs px-3 py-1 rounded-full border transition-all ${
                      customQuery === q
                        ? 'bg-violet-500/30 text-violet-300 border-violet-500/50'
                        : 'bg-gray-700/40 text-gray-400 border-gray-600 hover:border-violet-500/40 hover:text-violet-300'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-gray-400 text-sm font-medium mb-1.5 block">Job Title / Keywords</label>
              <input
                type="text"
                value={customQuery}
                onChange={e => setCustomQuery(e.target.value)}
                placeholder="e.g., Senior Software Engineer..."
                className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors text-sm"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm font-medium mb-1.5 block">Location</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g., Bangalore, India, Remote..."
                className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors text-sm"
              />
            </div>
          </div>

          {/* Platform Selection */}
          <div className="mb-6">
            <label className="text-gray-400 text-sm font-medium mb-3 block">Select Platforms</label>
            <div className="grid grid-cols-3 gap-3">
              {([
                { id: 'LinkedIn',  label: 'LinkedIn',  emoji: '💼', desc: 'Global network' },
                { id: 'Naukri',    label: 'Naukri',    emoji: '🎯', desc: "India's #1 job portal" },
                { id: 'InstaHyre', label: 'InstaHyre', emoji: '⚡', desc: 'Startup jobs' },
              ] as { id: 'LinkedIn' | 'Naukri' | 'InstaHyre'; label: string; emoji: string; desc: string }[]).map(platform => (
                <button
                  key={platform.id}
                  onClick={() => toggleSource(platform.id)}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    selectedSources.includes(platform.id)
                      ? 'border-violet-500/60 bg-violet-500/10'
                      : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                  }`}
                >
                  {selectedSources.includes(platform.id) && (
                    <CheckCircle className="w-4 h-4 text-violet-400 absolute top-2 right-2" />
                  )}
                  <div className="text-2xl mb-1">{platform.emoji}</div>
                  <div className="text-white font-medium text-sm">{platform.label}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{platform.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* API Key */}
          <div className="border border-gray-700 rounded-xl p-4 mb-5">
            <button
              onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <span className="text-gray-300 font-medium text-sm">RapidAPI Key (Optional — for live data)</span>
                {apiKey && <CheckCircle className="w-4 h-4 text-green-400" />}
              </div>
              {showApiKeyInput ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            {showApiKeyInput && (
              <div className="mt-3 space-y-3">
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-200/80">
                    <strong>To get live job data:</strong>
                    <ol className="mt-1 ml-3 list-decimal space-y-1">
                      <li>Go to <a href="https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline">RapidAPI JSearch</a></li>
                      <li>Subscribe to the free plan (100 requests/month)</li>
                      <li>Copy your API key and paste it here</li>
                    </ol>
                    <p className="mt-2 text-gray-400">Without an API key, realistic demo data scored against your profile will be shown.</p>
                  </div>
                </div>
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="Paste your RapidAPI key here..."
                  className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors text-sm font-mono"
                />
              </div>
            )}
          </div>

          {/* Primary skills preview */}
          <div className="mb-5">
            <p className="text-gray-400 text-xs font-medium mb-2">Scoring based on your primary skills:</p>
            <div className="flex flex-wrap gap-1.5">
              {candidateProfile.primarySkills.map((skill, i) => (
                <span key={i} className="text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full">
                  {skill}
                </span>
              ))}
              {candidateProfile.secondarySkills.slice(0, 5).map((skill, i) => (
                <span key={i} className="text-xs bg-gray-700/60 text-gray-400 border border-gray-600 px-2 py-0.5 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={isSearching || selectedSources.length === 0}
            className={`w-full py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
              isSearching || selectedSources.length === 0
                ? 'bg-gray-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700'
            }`}
          >
            {isSearching ? (
              <><Loader2 className="w-4 h-4 animate-spin" /><span>Scoring jobs with 7-dimension engine...</span></>
            ) : (
              <><Search className="w-4 h-4" /><span>Search & Score Jobs</span></>
            )}
          </button>
        </div>

        {/* Error */}
        {error && !usingMockData && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-red-300 font-medium">Search Error</p>
              <p className="text-red-200/70 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {hasSearched && !isSearching && (
          <div>
            {/* Summary Dashboard */}
            {summary && <SummaryDashboard summary={summary} />}

            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {filteredJobs.length} Matched Jobs
                  {usingMockData && (
                    <span className="ml-2 text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-normal">
                      Demo Data
                    </span>
                  )}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Scored using 7-dimension Universal Match Engine · Sorted by weighted score
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400">Min match:</span>
                  <select
                    value={filterScore}
                    onChange={e => setFilterScore(Number(e.target.value))}
                    className="bg-gray-800 border border-gray-600 text-white rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-violet-500"
                  >
                    <option value={0}>All</option>
                    <option value={40}>40%+ (Weak+)</option>
                    <option value={60}>60%+ (Moderate+)</option>
                    <option value={75}>75%+ (Strong+)</option>
                    <option value={90}>90%+ (Exceptional)</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as 'match' | 'date')}
                    className="bg-gray-800 border border-gray-600 text-white rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-violet-500"
                  >
                    <option value="match">Best Match</option>
                    <option value="date">Most Recent</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Top Match Banner */}
            {filteredJobs.length > 0 && filteredJobs[0].matchScore >= 75 && (
              <div className="bg-gradient-to-r from-yellow-900/30 to-amber-900/20 border border-yellow-500/30 rounded-2xl p-4 mb-6 flex items-center gap-3">
                <div className="text-2xl">🏆</div>
                <div className="flex-1">
                  <p className="text-yellow-300 font-semibold">
                    Top Match: {filteredJobs[0].title} at {filteredJobs[0].company}
                  </p>
                  <p className="text-yellow-200/60 text-sm">
                    {filteredJobs[0].matchScore}% match · {filteredJobs[0].fitBadge} · {filteredJobs[0].whyStrongFit[0] || ''}
                  </p>
                </div>
                <a
                  href={filteredJobs[0].applyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto flex-shrink-0 bg-yellow-500 hover:bg-yellow-600 text-black text-sm font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1"
                >
                  Apply <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Job Cards */}
            <div className="space-y-4">
              {filteredJobs.map((job, i) => (
                <JobCard key={job.id} job={job} rank={i + 1} />
              ))}
            </div>

            {filteredJobs.length === 0 && (
              <div className="text-center py-12 bg-gray-800/40 rounded-2xl border border-gray-700">
                <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">No jobs found at this threshold</p>
                <p className="text-gray-500 text-sm mt-1">Try lowering the minimum match score filter</p>
              </div>
            )}

            {/* Resume Optimisation Tips */}
            <OptimisationTips tips={optimisationTips} />

            {/* Refresh */}
            {filteredJobs.length > 0 && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleSearch}
                  className="bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-300 text-sm px-6 py-3 rounded-xl transition-colors flex items-center gap-2 mx-auto"
                >
                  <Zap className="w-4 h-4 text-violet-400" />
                  <span>Refresh Search</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!hasSearched && (
          <div className="text-center py-16 bg-gray-800/30 rounded-2xl border border-gray-700/50">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-white font-semibold text-lg mb-2">Universal Job Match Engine Ready</h3>
            <p className="text-gray-400 max-w-md mx-auto text-sm">
              Jobs will be scored across <strong className="text-white">7 dimensions</strong>: Primary Skills, Secondary Skills, Experience Level, Domain Alignment, Location, Company Fit, and Salary — all calibrated to your resume profile.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-5">
              {candidateProfile.primarySkills.map((skill, i) => (
                <span key={i} className="text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30 px-3 py-1 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs text-gray-500">
              <span>📊 D1: Primary Skills (25%)</span>
              <span>🔧 D2: Secondary Skills (20%)</span>
              <span>📅 D3: Experience (15%)</span>
              <span>🏭 D4: Domain (15%)</span>
              <span>📍 D5: Location (5%)</span>
              <span>🏢 D6: Company (10%)</span>
              <span>💰 D7: Salary (10%)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
