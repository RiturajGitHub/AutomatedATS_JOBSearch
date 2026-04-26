import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Sparkles, Brain, Search } from 'lucide-react';
import { ResumeData } from '../types';
import { extractTextFromFile } from '../utils/pdfParser';

interface ResumeUploadProps {
  onResumeUploaded: (data: ResumeData) => void;
  onSelectOption: (option: 'ats' | 'jobs') => void;
  uploadedResume: ResumeData | null;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({
  onResumeUploaded,
  onSelectOption,
  uploadedResume,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const text = await extractTextFromFile(file);

      if (text.trim().length < 50) {
        throw new Error('Could not extract sufficient text from the file. Please ensure it\'s a text-based PDF or DOCX.');
      }

      onResumeUploaded({
        rawText: text,
        fileName: file.name,
        fileSize: file.size,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to process the resume. Please try a different file.');
    } finally {
      setIsProcessing(false);
    }
  }, [onResumeUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isProcessing,
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-800/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-3xl">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Resume Analysis & Job Matching</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
            Land Your{' '}
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Dream Job
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Upload your resume to get a comprehensive ATS score analysis and discover perfectly matched job opportunities from LinkedIn, Naukri & InstaHyre.
          </p>
        </div>

        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`
            relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300
            ${isDragActive
              ? 'border-violet-400 bg-violet-500/10'
              : uploadedResume
                ? 'border-green-500/50 bg-green-500/5 hover:bg-green-500/10'
                : 'border-gray-600 bg-gray-800/50 hover:border-violet-500/50 hover:bg-gray-800/80'
            }
            ${isProcessing ? 'cursor-not-allowed opacity-80' : ''}
          `}
        >
          <input {...getInputProps()} />

          {isProcessing ? (
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-violet-500/20 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
                </div>
              </div>
              <div>
                <p className="text-white font-semibold text-lg">Processing your resume...</p>
                <p className="text-gray-400 text-sm mt-1">Extracting text and analyzing content</p>
              </div>
              <div className="w-48 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full animate-pulse" style={{ width: '70%' }} />
              </div>
            </div>
          ) : uploadedResume ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-lg">{uploadedResume.fileName}</p>
                <p className="text-gray-400 text-sm">
                  {formatFileSize(uploadedResume.fileSize)} • {uploadedResume.rawText.split(' ').length} words extracted
                </p>
              </div>
              <p className="text-green-400/80 text-sm">✅ Resume parsed successfully. Click to upload a different file.</p>
            </div>
          ) : isDragActive ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-violet-500/30 flex items-center justify-center animate-bounce">
                <Upload className="w-8 h-8 text-violet-400" />
              </div>
              <p className="text-violet-300 font-semibold text-lg">Drop it here!</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-lg" />
                <div className="relative w-16 h-16 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center">
                  <FileText className="w-7 h-7 text-violet-400" />
                </div>
              </div>
              <div>
                <p className="text-white font-semibold text-lg">
                  Drop your resume here or <span className="text-violet-400">click to browse</span>
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Supports PDF, DOCX, DOC, TXT • Max 10MB
                </p>
                <p className="text-green-400/80 text-xs mt-1">
                  ✨ TXT format recommended for best results
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
            
            {/* Helpful suggestion */}
            {error.includes('PDF') && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <p className="text-blue-300 text-sm font-medium mb-2">💡 Quick Fix: Use TXT or DOCX format instead</p>
                <p className="text-blue-200/80 text-xs mb-3">
                  PDF parsing can be unreliable. For best results, convert your resume to TXT or DOCX format.
                </p>
                <div className="space-y-2 text-xs text-blue-200/70">
                  <div>
                    <span className="font-semibold">From Word/Google Docs:</span> File → Save As → Plain Text (.txt)
                  </div>
                  <div>
                    <span className="font-semibold">From PDF:</span> Open → Select All → Copy → Paste into new .txt file
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Options - only shown after upload */}
        {uploadedResume && !isProcessing && (
          <div className="mt-8">
            <p className="text-center text-gray-400 text-sm mb-6 font-medium">What would you like to do?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* ATS Score Option */}
              <button
                onClick={() => onSelectOption('ats')}
                className="group relative bg-gray-800/60 hover:bg-gray-800/80 border border-gray-700 hover:border-violet-500/50 rounded-2xl p-6 text-left transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-violet-500/30 transition-colors">
                    <Brain className="w-6 h-6 text-violet-400" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">Check ATS Score</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Get a detailed ATS score with section-wise analysis and AI-powered recommendations to reach 90-100.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-violet-400 text-sm font-medium">
                    <span>Analyze resume</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </button>

              {/* Job Search Option */}
              <button
                onClick={() => onSelectOption('jobs')}
                className="group relative bg-gray-800/60 hover:bg-gray-800/80 border border-gray-700 hover:border-indigo-500/50 rounded-2xl p-6 text-left transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-500/30 transition-colors">
                    <Search className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">Search Jobs</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Find perfectly matched jobs from LinkedIn, Naukri & InstaHyre based on your resume skills.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-indigo-400 text-sm font-medium">
                    <span>Find jobs</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Features */}
        {!uploadedResume && (
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { icon: '🎯', title: 'ATS Analysis', desc: '7-section detailed scoring' },
              { icon: '🤖', title: 'AI Guidance', desc: 'Personalized improvements' },
              { icon: '🔍', title: 'Job Matching', desc: 'Top 3 platforms scraped' },
            ].map((f, i) => (
              <div key={i} className="text-center bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                <div className="text-2xl mb-2">{f.icon}</div>
                <div className="text-white text-sm font-medium">{f.title}</div>
                <div className="text-gray-500 text-xs mt-1">{f.desc}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
