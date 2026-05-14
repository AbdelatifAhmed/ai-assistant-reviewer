'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import AuthForm from '@/components/AuthForm';
import CVUpload from '@/components/CVUpload';
import ChatInterface from '@/components/ChatInterface';
import FeedbackReport from '@/components/FeedbackReport';
import { LogOut, User as UserIcon, Sun, Moon } from 'lucide-react';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg border transition-colors backdrop-blur-xl"
      style={{ backgroundColor: 'var(--color-glass)', borderColor: 'var(--color-border)' }}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5" style={{ color: 'var(--color-fg-muted)' }} />
      ) : (
        <Moon className="w-5 h-5" style={{ color: 'var(--color-fg-muted)' }} />
      )}
    </button>
  );
}

export default function Home() {
  const { user, isLoading, logout } = useAuth();
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [jobRole, setJobRole] = useState('');
  const [jobLevel, setJobLevel] = useState('');

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-fg)', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  return (
    <main className="flex h-screen min-h-screen flex-col overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      {user && (
        <header className="shrink-0 border-b px-4 py-3 flex items-center justify-between shadow-sm backdrop-blur-xl" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-glass)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 text-white flex items-center justify-center rounded-lg font-bold shadow-lg" style={{ background: 'linear-gradient(to bottom right, var(--color-accent), var(--color-accent-hover))' }}>
              C
            </div>
            <span className="font-semibold tracking-wide text-lg" style={{ color: 'var(--color-fg)' }}>Candor</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <div className="hidden sm:flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border backdrop-blur-xl" style={{ color: 'var(--color-fg-muted)', backgroundColor: 'var(--color-glass)', borderColor: 'var(--color-border)' }}>
              <UserIcon className="w-4 h-4" />
              <span>{user.name}</span>
            </div>
            <button 
              onClick={() => {
                logout();
                setInterviewId(null);
                setIsFinished(false);
              }}
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'var(--color-fg-muted)' }}
              title="End Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <div className="min-h-0 flex-1 flex flex-col">
        {!user ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <AuthForm />
          </div>
        ) : !interviewId ? (
          <div className="flex-1 overflow-y-auto p-4">
          <div className="min-h-full flex flex-col items-center justify-center max-w-2xl mx-auto w-full space-y-8 py-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black tracking-tight" style={{ color: 'var(--color-fg)' }}>Configure Simulation</h2>
              <p className="text-sm" style={{ color: 'var(--color-fg-muted)' }}>Define target parameters and provide candidate context.</p>
            </div>
            
            <div className="w-full space-y-4 glass-card p-6">
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-fg-muted)' }}>Target Role</label>
                <input
                  type="text"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="input-field"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-fg-muted)' }}>Seniority Level</label>
                <select
                  value={jobLevel}
                  onChange={(e) => setJobLevel(e.target.value)}
                  className="input-field appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select Level</option>
                  <option value="Junior">Junior / Entry Level</option>
                  <option value="Mid">Mid-Level</option>
                  <option value="Senior">Senior</option>
                  <option value="Staff">Staff / Principal</option>
                </select>
              </div>
            </div>

            <div className="w-full space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider ml-1" style={{ color: 'var(--color-fg-muted)' }}>Candidate Context</label>
              <div className={jobRole && jobLevel ? '' : 'opacity-50 pointer-events-none'}>
                <CVUpload 
                  jobRole={jobRole} 
                  jobLevel={jobLevel} 
                  onUploadSuccess={(cvData, id) => {
                    setInterviewId(id);
                  }} 
                />
              </div>
              {(!jobRole || !jobLevel) && (
                <p className="text-xs text-center mt-2" style={{ color: 'var(--color-fg-muted)' }}>
                  Please define role and level before uploading resume.
                </p>
              )}
            </div>
          </div>
          </div>
        ) : !isFinished ? (
          <div className="min-h-0 flex-1 overflow-hidden">
            <ChatInterface 
              interviewId={interviewId} 
              onFinish={() => setIsFinished(true)} 
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 py-8">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--color-fg)' }}>Evaluation Report</h2>
                <button 
                  onClick={() => {
                    setInterviewId(null);
                    setIsFinished(false);
                    setJobRole('');
                    setJobLevel('');
                  }}
                  className="btn-secondary px-4 py-2 text-sm"
                >
                  New Simulation
                </button>
              </div>
              <FeedbackReport interviewId={interviewId} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
