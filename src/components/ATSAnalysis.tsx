import React, { useEffect, useState } from 'react';
import {
  Brain, ChevronDown, ChevronUp, AlertCircle, CheckCircle,
  TrendingUp, ArrowLeft, Star, Zap, Target, Award, Lightbulb, Copy, Check,
  User, MapPin, Briefcase, DollarSign
} from 'lucide-react';
import { ATSResult, ATSSection, Recommendation, CandidateProfile } from '../types';

interface ATSAnalysisProps {
  result: ATSResult;
  fileName: string;
  onBack: () => void;
  onGoToJobs: () => void;
  onSkillsUpdate?: (selectedSkills: string[]) => void;
  onSalaryUpdate?: (current: number, expected: { min: number; max: number }) => void;
}

// ─── Candidate Profile Panel ──────────────────────────────────────────────────

const CandidateProfilePanel: React.FC<{ 
  profile: CandidateProfile;
  onSkillsUpdate?: (selectedSkills: string[]) => void;
  onSalaryUpdate?: (current: number, expected: { min: number; max: number }) => void;
}> = ({ profile, onSkillsUpdate, onSalaryUpdate }) => {
  const [open, setOpen] = useState(false);
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
    // Auto-set expected to current+5
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
    <div className="bg-gray-800/60 border border-violet-500/20 rounded-2xl mb-6 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="bg-violet-500/20 p-2 rounded-lg">
            <User className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-left">
            <p className="text-white font-semibold text-sm">Extracted Candidate Profile (PHASE 0)</p>
            <p className="text-gray-400 text-xs">
              {profile.name !== 'UNKNOWN' ? profile.name : 'Name not detected'} ·{' '}
              {profile.careerLevel} · {profile.totalYoe} yrs exp ·{' '}
              {profile.location !== 'UNKNOWN' ? profile.location : 'Location not detected'}
            </p>
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
                🎯 Select Skills for Job Search ({selectedSkills.size} selected)
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
              Click skills below to include/exclude them from job matching. Selected skills will be used to find relevant jobs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Primary Skills */}
            <div>
              <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                <Zap className="w-3 h-3 text-violet-400" /> Primary Skills (must-have)
              </p>
              <div className="flex flex-wrap gap-1">
                {profile.primarySkills.length > 0
                  ? profile.primarySkills.map((s, i) => (
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
                    ))
                  : <span className="text-xs text-gray-600">None detected</span>
                }
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
                {profile.secondarySkills.length === 0 && <span className="text-xs text-gray-600">None detected</span>}
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
                {profile.toolsAndInfra.length === 0 && <span className="text-xs text-gray-600">None detected</span>}
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
                {/* Current Salary */}
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

                {/* Expected Salary */}
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
                  {profile.noticePeriod ? ` · Notice: ${profile.noticePeriod}w` : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Quantified Achievements */}
          {profile.quantifiedAchievements.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-400" /> Quantified Achievements (used in job application tips)
              </p>
              <ul className="space-y-1">
                {profile.quantifiedAchievements.slice(0, 4).map((a, i) => (
                  <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                    <span className="text-green-400 mt-0.5 flex-shrink-0">→</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Education */}
          {profile.education !== 'UNKNOWN' && (
            <div>
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <Award className="w-3 h-3 text-indigo-400" /> Education
              </p>
              <p className="text-xs text-gray-300">{profile.education}</p>
            </div>
          )}

          <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3">
            <p className="text-xs text-violet-300">
              💡 This profile is automatically extracted from your resume and used to score every job across 7 dimensions.
              The more complete your resume, the more accurate the job matching.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const ScoreCircle: React.FC<{ score: number; size?: number }> = ({ score, size = 140 }) => {
  const [animScore, setAnimScore] = useState(0);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimScore(score);
    }, 300);
    return () => clearTimeout(timer);
  }, [score]);

  const getColor = (s: number) => {
    if (s >= 90) return { stroke: '#22c55e', text: 'text-green-400', glow: 'shadow-green-500/30' };
    if (s >= 70) return { stroke: '#f59e0b', text: 'text-amber-400', glow: 'shadow-amber-500/30' };
    if (s >= 50) return { stroke: '#f97316', text: 'text-orange-400', glow: 'shadow-orange-500/30' };
    return { stroke: '#ef4444', text: 'text-red-400', glow: 'shadow-red-500/30' };
  };

  const colors = getColor(score);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1f2937" strokeWidth="10" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={colors.stroke} strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.5s ease-in-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-black ${colors.text}`}>{animScore}</span>
        <span className="text-gray-400 text-xs font-medium">/ 100</span>
      </div>
    </div>
  );
};

const MiniScoreBar: React.FC<{ score: number; maxScore: number; label: string }> = ({ score, maxScore, label }) => {
  const [anim, setAnim] = useState(false);
  useEffect(() => { setTimeout(() => setAnim(true), 500); }, []);

  const pct = (score / maxScore) * 100;
  const color = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-amber-500' : pct >= 40 ? 'bg-orange-500' : 'bg-red-500';

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-medium">{score}/{maxScore}</span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: anim ? `${pct}%` : '0%' }}
        />
      </div>
    </div>
  );
};

const SectionCard: React.FC<{ section: ATSSection; index: number }> = ({ section, index }) => {
  const [expanded, setExpanded] = useState(index < 2);
  const pct = Math.round((section.score / section.maxScore) * 100);
  const color = pct >= 80 ? 'green' : pct >= 60 ? 'amber' : pct >= 40 ? 'orange' : 'red';
  const colorClasses = {
    green: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', bar: 'bg-green-500' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', bar: 'bg-amber-500' },
    orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', bar: 'bg-orange-500' },
    red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', bar: 'bg-red-500' },
  }[color];

  return (
    <div className={`rounded-xl border ${colorClasses.border} ${colorClasses.bg} overflow-hidden transition-all duration-200`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`text-xs font-bold px-2 py-1 rounded-md ${colorClasses.bg} ${colorClasses.text} border ${colorClasses.border}`}>
            {section.score}/{section.maxScore}
          </div>
          <span className="text-white font-medium">{section.name}</span>
          {!section.present && (
            <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">Missing</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div className={`h-full ${colorClasses.bar} rounded-full`} style={{ width: `${pct}%` }} />
          </div>
          <span className={`text-sm font-bold ${colorClasses.text}`}>{pct}%</span>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-3">
          {/* Feedback */}
          <div className="space-y-1.5">
            {section.feedback.map((f, i) => (
              <p key={i} className="text-sm text-gray-300 flex items-start gap-2">
                <span className="flex-shrink-0">{f.substring(0, 2)}</span>
                <span>{f.substring(2)}</span>
              </p>
            ))}
          </div>

          {/* Improvements */}
          {section.improvements.length > 0 && (
            <div className="bg-gray-900/50 rounded-lg p-3 mt-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> How to improve
              </p>
              <ul className="space-y-1.5">
                {section.improvements.map((imp, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Example */}
          {section.example && (
            <div className="bg-gray-900/80 rounded-lg p-3 border border-violet-500/20 mt-2">
              <p className="text-xs font-semibold text-violet-400 mb-2 flex items-center gap-1">
                <Star className="w-3 h-3" /> Example
              </p>
              <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">{section.example}</pre>
            </div>
          )}

          {/* Skills found */}
          {section.keywords && section.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {section.keywords.slice(0, 12).map((kw, i) => (
                <span key={i} className="text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full">
                  {kw}
                </span>
              ))}
              {section.keywords.length > 12 && (
                <span className="text-xs text-gray-500">+{section.keywords.length - 12} more</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const priorityConfig = {
  critical: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: '🚨', label: 'Critical' },
  high: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: '⚡', label: 'High' },
  medium: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: '📌', label: 'Medium' },
  low: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: '💡', label: 'Low' },
};

const RecommendationCard: React.FC<{ rec: Recommendation; index: number }> = ({ rec }) => {
  const [copied, setCopied] = useState(false);
  const config = priorityConfig[rec.priority];

  const handleCopy = () => {
    if (rec.example) {
      navigator.clipboard.writeText(rec.example);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`rounded-xl border ${config.border} ${config.bg} p-4 transition-all hover:brightness-110`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span>{config.icon}</span>
          <h4 className="text-white font-semibold">{rec.title}</h4>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs font-bold ${config.color} ${config.bg} ${config.border} border px-2 py-0.5 rounded-full`}>
            {config.label}
          </span>
          <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full font-medium">
            +{rec.impact}pts
          </span>
        </div>
      </div>

      <p className="text-gray-300 text-sm leading-relaxed mb-2">{rec.description}</p>
      <div className="text-xs text-gray-500 mb-3">Category: {rec.category}</div>

      {rec.example && (
        <div className="bg-gray-900/80 rounded-lg p-3 border border-gray-700 relative">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-violet-400 flex items-center gap-1">
              <Lightbulb className="w-3 h-3" /> Example / Template
            </p>
            <button
              onClick={handleCopy}
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">{rec.example}</pre>
        </div>
      )}
    </div>
  );
};

export const ATSAnalysis: React.FC<ATSAnalysisProps> = ({ result, fileName, onBack, onGoToJobs, onSkillsUpdate, onSalaryUpdate }) => {
  const getGradeInfo = (score: number) => {
    if (score >= 90) return { label: 'Excellent', desc: 'Your resume is highly ATS-optimized!', color: 'text-green-400' };
    if (score >= 80) return { label: 'Good', desc: 'Minor improvements can push you to 90+', color: 'text-blue-400' };
    if (score >= 70) return { label: 'Average', desc: 'Several areas need improvement', color: 'text-amber-400' };
    if (score >= 50) return { label: 'Below Average', desc: 'Significant improvements needed', color: 'text-orange-400' };
    return { label: 'Poor', desc: 'Major restructuring recommended', color: 'text-red-400' };
  };

  const gradeInfo = getGradeInfo(result.overallScore);
  const criticalRecs = result.recommendations.filter(r => r.priority === 'critical');
  const pointsToGain = 100 - result.overallScore;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Fixed background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to upload</span>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-violet-500/20 p-3 rounded-xl">
            <Brain className="w-7 h-7 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">ATS Score Analysis</h1>
            <p className="text-gray-400 text-sm">{fileName}</p>
          </div>
        </div>

        {/* Candidate Profile Panel */}
        <CandidateProfilePanel 
          profile={result.candidateProfile} 
          onSkillsUpdate={onSkillsUpdate}
          onSalaryUpdate={onSalaryUpdate}
        />

        {/* Score Hero */}
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6 mb-6">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Big Score */}
            <div className="flex flex-col items-center gap-3">
              <ScoreCircle score={result.overallScore} size={160} />
              <div className="text-center">
                <div className={`text-2xl font-bold ${gradeInfo.color}`}>{gradeInfo.label}</div>
                <div className="text-gray-400 text-sm mt-1">{gradeInfo.desc}</div>
                <div className="mt-2 inline-flex items-center gap-1 bg-gray-700/50 rounded-full px-3 py-1">
                  <Award className="w-3.5 h-3.5 text-violet-400" />
                  <span className="text-xs text-gray-300">Grade: <strong className="text-white">{result.grade}</strong></span>
                </div>
              </div>
            </div>

            {/* Section Mini Bars */}
            <div className="flex-1 w-full space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Section Scores</h3>
                {pointsToGain > 0 && (
                  <div className="flex items-center gap-1.5 text-sm bg-green-500/10 border border-green-500/30 text-green-400 px-3 py-1 rounded-full">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+{pointsToGain} pts possible</span>
                  </div>
                )}
              </div>
              {result.sections.map((section, i) => (
                <MiniScoreBar
                  key={i}
                  score={section.score}
                  maxScore={section.maxScore}
                  label={section.name}
                />
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 lg:w-52">
              <div className="bg-gray-700/50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-violet-400">{result.extractedSkills.length}</div>
                <div className="text-xs text-gray-400 mt-1">Skills Found</div>
              </div>
              <div className="bg-gray-700/50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-indigo-400">{result.detectedExperience}yr</div>
                <div className="text-xs text-gray-400 mt-1">Experience</div>
              </div>
              <div className="bg-gray-700/50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-blue-400">{result.recommendations.length}</div>
                <div className="text-xs text-gray-400 mt-1">Action Items</div>
              </div>
              <div className="bg-gray-700/50 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-amber-400 truncate">{result.extractedJobTitle}</div>
                <div className="text-xs text-gray-400 mt-1">Detected Role</div>
              </div>
            </div>
          </div>
        </div>

        {/* Alert for low score */}
        {result.overallScore < 70 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-300 font-semibold">Action Required</p>
              <p className="text-amber-200/70 text-sm mt-1">
                Your ATS score of {result.overallScore} means many ATS systems will filter out your resume. Follow the recommendations below to reach 90+ and significantly increase your interview chances.
              </p>
              {criticalRecs.length > 0 && (
                <p className="text-amber-200/70 text-sm mt-1">
                  <strong>{criticalRecs.length} critical issue{criticalRecs.length > 1 ? 's' : ''}</strong> need immediate attention.
                </p>
              )}
            </div>
          </div>
        )}

        {result.overallScore >= 90 && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-300 font-semibold">Excellent! You're ATS-Ready 🎉</p>
              <p className="text-green-200/70 text-sm mt-1">
                Your resume scores {result.overallScore}/100 and is highly optimized for ATS systems. You're in the top tier of candidates!
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main: Section Breakdown */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-violet-400" />
              <h2 className="text-lg font-bold text-white">Section-by-Section Analysis</h2>
            </div>
            {result.sections.map((section, i) => (
              <SectionCard key={i} section={section} index={i} />
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Extracted Skills */}
            <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-violet-400" />
                Detected Skills ({result.extractedSkills.length})
              </h3>
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                {result.extractedSkills.map((skill, i) => (
                  <span key={i} className="text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full">
                    {skill}
                  </span>
                ))}
                {result.extractedSkills.length === 0 && (
                  <p className="text-gray-500 text-sm">No technical skills detected. Add a Skills section.</p>
                )}
              </div>
            </div>

            {/* Missing Keywords */}
            <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                Missing Keywords
              </h3>
              <p className="text-gray-500 text-xs mb-3">Consider adding these if they apply to you:</p>
              <div className="flex flex-wrap gap-1.5">
                {result.missingKeywords.slice(0, 15).map((kw, i) => (
                  <span key={i} className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Go to Jobs */}
            <button
              onClick={onGoToJobs}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <span>🔍 Find Matching Jobs</span>
            </button>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <h2 className="text-lg font-bold text-white">
                AI Recommendations to Reach 90-100
              </h2>
            </div>
            <div className="text-sm text-gray-400">
              Sorted by impact (highest first)
            </div>
          </div>

          <div className="space-y-4">
            {result.recommendations.map((rec, i) => (
              <RecommendationCard key={i} rec={rec} index={i} />
            ))}
          </div>

          {result.recommendations.length === 0 && (
            <div className="text-center py-8 bg-green-500/10 border border-green-500/30 rounded-2xl">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-green-300 font-semibold text-lg">Your resume is already excellent!</p>
              <p className="text-gray-400 mt-2">No major improvements needed. Time to apply for jobs!</p>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 bg-gradient-to-r from-violet-900/50 to-indigo-900/50 border border-violet-500/30 rounded-2xl p-6 text-center">
          <h3 className="text-xl font-bold text-white mb-2">Ready to Apply?</h3>
          <p className="text-gray-400 mb-4">Your profile is set up. Find jobs perfectly matched to your skills.</p>
          <button
            onClick={onGoToJobs}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-xl transition-all"
          >
            🚀 Search Matching Jobs Now
          </button>
        </div>
      </div>
    </div>
  );
};
