import React, { useEffect, useState } from 'react';
import { Brain, Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  fileName: string;
}

const steps = [
  { label: 'Parsing resume document...', duration: 800 },
  { label: 'Extracting contact information...', duration: 600 },
  { label: 'Analyzing skills & technologies...', duration: 700 },
  { label: 'Scoring work experience section...', duration: 600 },
  { label: 'Evaluating education & certifications...', duration: 500 },
  { label: 'Running ATS compatibility checks...', duration: 700 },
  { label: 'Generating AI recommendations...', duration: 800 },
  { label: 'Calculating final ATS score...', duration: 600 },
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ fileName }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

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

  const progress = Math.round(((completedSteps.length) / steps.length) * 100);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative w-full max-w-md text-center">
        {/* Animated Brain Icon */}
        <div className="relative inline-flex items-center justify-center mb-8">
          <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-2xl animate-pulse" />
          <div className="relative w-24 h-24 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center">
            <Brain className="w-12 h-12 text-white animate-pulse" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center animate-spin">
            <Loader2 className="w-4 h-4 text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Analyzing Your Resume</h2>
        <p className="text-gray-400 text-sm mb-8 truncate">{fileName}</p>

        {/* Progress Bar */}
        <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden mb-6">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="text-violet-400 font-bold text-3xl mb-6">{progress}%</div>

        {/* Steps */}
        <div className="space-y-2 text-left">
          {steps.map((step, i) => {
            const isCompleted = completedSteps.includes(i);
            const isCurrent = currentStep === i && !isCompleted;
            return (
              <div
                key={i}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                  isCurrent ? 'bg-violet-500/10 border border-violet-500/30' :
                  isCompleted ? 'opacity-60' : 'opacity-30'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isCompleted ? 'bg-green-500' :
                  isCurrent ? 'bg-violet-500 animate-pulse' :
                  'bg-gray-700'
                }`}>
                  {isCompleted ? (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isCurrent ? (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  ) : (
                    <div className="w-2 h-2 bg-gray-500 rounded-full" />
                  )}
                </div>
                <span className={`text-sm ${isCurrent ? 'text-white font-medium' : 'text-gray-400'}`}>
                  {step.label}
                </span>
                {isCurrent && <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin ml-auto" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
