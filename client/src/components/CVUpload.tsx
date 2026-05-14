'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, Play, CheckCircle2, LockKeyhole } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

interface CVData {
  name?: string;
  email?: string;
  phone?: string;
  skills?: string[];
  experience?: Array<{ title: string; company: string; duration: string; description: string }>;
  education?: Array<{ degree: string; institution: string; year: string }>;
  projects?: Array<{ name: string; description: string; technologies: string[] }>;
  summary?: string;
  rawText?: string;
}

interface CVUploadProps {
  onUploadSuccess: (cvData: CVData, sessionId: string) => void;
  jobRole: string;
  jobLevel: string;
}

export default function CVUpload({ onUploadSuccess, jobRole, jobLevel }: CVUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setProgress(10); // Start progress

    const formData = new FormData();
    formData.append('cv', file);
    formData.append('jobRole', jobRole);
    formData.append('jobLevel', jobLevel);

    try {
      // Simulate progress for UI
      const interval = setInterval(() => {
        setProgress((p) => Math.min(p + 15, 90));
      }, 500);

      const response = await api.interviews.uploadCV(formData);

      clearInterval(interval);
      setProgress(100);

      setTimeout(() => {
        toast.success('Resume processed successfully.');
        onUploadSuccess(response.data.cvData, response.data.sessionId);
      }, 500);
      
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Upload failed.');
      setIsUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="glass-card space-y-5 p-5">
      <div 
        {...getRootProps()} 
        className={`drop-zone p-8 text-center cursor-pointer ${
          isDragActive ? 'active' : ''
        }`}
        style={{ borderColor: file ? 'var(--color-accent)' : undefined }}
      >
        <input {...getInputProps()} />
        
        {file ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center border" style={{ backgroundColor: 'var(--color-accent-soft)', borderColor: 'var(--color-accent)' }}>
              <FileText className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />
            </div>
            <div>
              <div className="flex items-center justify-center gap-2">
                <p className="text-sm font-semibold" style={{ color: 'var(--color-fg)' }}>{file.name}</p>
                <CheckCircle2 className="h-4 w-4" style={{ color: 'var(--color-success)' }} />
              </div>
              <p className="text-xs" style={{ color: 'var(--color-fg-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center border" style={{ backgroundColor: 'var(--color-accent-soft)', borderColor: 'var(--color-border)' }}>
              <UploadCloud className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-fg)' }}>Drag & drop your resume</p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-fg-muted)' }}>PDF, JPG, or PNG up to 5MB</p>
            </div>
          </div>
        )}
      </div>

      {isUploading && (
        <div className="rounded-lg border p-4 space-y-3 backdrop-blur-xl" style={{ borderColor: 'var(--color-accent)', backgroundColor: 'var(--color-accent-soft)' }}>
          <div className="flex justify-between text-xs font-medium" style={{ color: 'var(--color-fg-muted)' }}>
            <span>Processing document</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full rounded-full h-2 overflow-hidden" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
            <div 
              className="h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%`, backgroundColor: 'var(--color-accent)' }}
            ></div>
          </div>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || isUploading}
        className="w-full min-h-12 rounded-lg border px-5 py-3 text-sm font-bold transition-all flex items-center justify-center gap-2"
        style={{
          background: !file || isUploading
            ? 'var(--color-bg-tertiary)'
            : 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
          borderColor: !file || isUploading ? 'var(--color-border)' : 'rgba(255,255,255,0.32)',
          color: !file || isUploading ? 'var(--color-fg-muted)' : '#ffffff',
          boxShadow: !file || isUploading ? 'none' : '0 16px 34px rgba(37, 99, 235, 0.24)',
          cursor: !file || isUploading ? 'not-allowed' : 'pointer',
        }}
      >
        {isUploading ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Initializing Simulation...
          </>
        ) : !file ? (
          <>
            <LockKeyhole className="w-4 h-4" />
            Select Resume To Start
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            Start Assessment
          </>
        )}
      </button>
    </div>
  );
}
