import React from 'react';
import { Briefcase, Zap } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset }) => {
  return (
    <header className="relative z-10 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button onClick={onReset} className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-violet-500/30 rounded-xl blur-md group-hover:bg-violet-500/50 transition-all" />
              <div className="relative bg-gradient-to-br from-violet-600 to-indigo-600 p-2 rounded-xl">
                <Zap className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-left">
              <span className="text-white font-bold text-lg tracking-tight">ResumeIQ</span>
              <div className="text-xs text-violet-400 font-medium -mt-0.5">AI Resume Analyzer & Job Scraper</div>
            </div>
          </button>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-gray-400 text-sm">
              <Briefcase className="w-4 h-4 text-violet-400" />
              <span>Powered by AI • Real Job Data</span>
            </div>
            <button
              onClick={onReset}
              className="bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-300 text-sm px-4 py-2 rounded-lg transition-all"
            >
              New Analysis
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
