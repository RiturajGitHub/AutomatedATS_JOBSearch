import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ResumeUpload } from './components/ResumeUpload';
import { ATSAnalysis } from './components/ATSAnalysis';
import { JobSearch } from './components/JobSearch';
import { LoadingScreen } from './components/LoadingScreen';
import { ResumeData, ATSResult } from './types';
import { analyzeResume } from './utils/atsAnalyzer';

type Mode = 'upload' | 'loading-ats' | 'ats' | 'jobs';

function App() {
  const [mode, setMode] = useState<Mode>('upload');
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [atsResult, setAtsResult] = useState<ATSResult | null>(null);
  const [pendingMode, setPendingMode] = useState<'ats' | 'jobs' | null>(null);

  const handleResumeUploaded = (data: ResumeData) => {
    setResumeData(data);
    setAtsResult(null);
  };

  const handleSelectOption = (option: 'ats' | 'jobs') => {
    if (!resumeData) return;
    setMode('loading-ats');
    setPendingMode(option);
  };

  useEffect(() => {
    if (mode === 'loading-ats' && resumeData) {
      const totalLoadTime = 5500;
      const timer = setTimeout(() => {
        const result = analyzeResume(resumeData.rawText);
        setAtsResult(result);
        if (pendingMode === 'ats') {
          setMode('ats');
        } else {
          setMode('jobs');
        }
      }, totalLoadTime);
      return () => clearTimeout(timer);
    }
  }, [mode, resumeData, pendingMode]);

  const handleReset = () => {
    setMode('upload');
    setResumeData(null);
    setAtsResult(null);
    setPendingMode(null);
  };

  const handleGoToJobs = () => {
    setMode('jobs');
  };

  return (
    <div className="min-h-screen bg-gray-950 font-[Inter,sans-serif]">
      {mode !== 'upload' && mode !== 'loading-ats' && (
        <Header onReset={handleReset} />
      )}

      {mode === 'upload' && (
        <ResumeUpload
          onResumeUploaded={handleResumeUploaded}
          onSelectOption={handleSelectOption}
          uploadedResume={resumeData}
        />
      )}

      {mode === 'loading-ats' && resumeData && (
        <LoadingScreen fileName={resumeData.fileName} />
      )}

      {mode === 'ats' && atsResult && resumeData && (
        <ATSAnalysis
          result={atsResult}
          fileName={resumeData.fileName}
          onBack={() => setMode('upload')}
          onGoToJobs={handleGoToJobs}
        />
      )}

      {mode === 'jobs' && resumeData && atsResult && (
        <JobSearch
          resumeData={resumeData}
          candidateProfile={atsResult.candidateProfile}
          onBack={() => atsResult ? setMode('ats') : setMode('upload')}
        />
      )}

      {/* Fallback: jobs mode but no atsResult yet — run analysis first */}
      {mode === 'jobs' && resumeData && !atsResult && (
        <LoadingScreen fileName={resumeData.fileName} />
      )}
    </div>
  );
}

export default App;
