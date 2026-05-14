'use client';

import { api } from '@/lib/api';
import {
  AlertOctagon,
  AlertTriangle,
  Award,
  BrainCircuit,
  FileSearch,
  LucideIcon,
  MessageSquare,
  Scale,
  Star,
  Target,
  ThumbsUp,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface FeedbackData {
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  detailedAnalysis: string;
  recommendation: string;
}

interface RecConfigType {
  color: string;
  icon: LucideIcon;
  label: string;
}

const REC_CONFIG: Record<string, RecConfigType> = {
  'Strongly Recommend': { color: 'var(--color-success)', icon: Star, label: 'Strongly Recommend' },
  Recommend: { color: 'var(--color-secondary)', icon: ThumbsUp, label: 'Recommend' },
  Neutral: { color: 'var(--color-warning)', icon: Scale, label: 'Neutral' },
  'Not Recommend': { color: 'var(--color-error)', icon: XCircle, label: 'Do Not Recommend' },
};

export default function FeedbackReport({ interviewId }: { interviewId: string }) {
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await api.interviews.getOne(interviewId);
        setFeedback(response.data.feedback);
      } catch {
        toast.error('Failed to load evaluation data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedback();
  }, [interviewId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div
          className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }}
        ></div>
        <p className="text-sm tracking-wide" style={{ color: 'var(--color-fg-muted)' }}>
          Compiling results...
        </p>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div
        className="glass-card text-center py-20 flex flex-col items-center gap-2"
        style={{ color: 'var(--color-fg-muted)' }}
      >
        <AlertOctagon className="w-8 h-8 opacity-70" />
        <p>No evaluation data available.</p>
      </div>
    );
  }

  let recKey = feedback.recommendation;
  if (!REC_CONFIG[recKey]) {
    if (recKey.toLowerCase().includes('strongly')) recKey = 'Strongly Recommend';
    else if (recKey.toLowerCase().includes('not')) recKey = 'Not Recommend';
    else if (recKey.toLowerCase().includes('recommend')) recKey = 'Recommend';
    else recKey = 'Neutral';
  }

  const recConf = REC_CONFIG[recKey] || REC_CONFIG.Neutral;
  const RecIcon = recConf.icon;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div
        className="glass-card p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-l-4"
        style={{ borderLeftColor: recConf.color }}
      >
        <div>
          <h3 className="text-sm font-medium uppercase tracking-widest mb-1" style={{ color: 'var(--color-fg-muted)' }}>
            Final Verdict
          </h3>
          <div className="flex items-center gap-3" style={{ color: recConf.color }}>
            <RecIcon className="w-6 h-6" />
            <span className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-fg)' }}>
              {recConf.label}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[3rem] leading-none font-bold tracking-tighter" style={{ color: 'var(--color-fg)' }}>
            {feedback.overallScore}
            <span className="text-xl font-normal" style={{ color: 'var(--color-fg-muted)' }}>
              /100
            </span>
          </div>
          <p className="text-sm uppercase tracking-wider mt-1" style={{ color: 'var(--color-fg-muted)' }}>
            Aggregate Score
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ScoreBar
          title="Technical Proficiency"
          score={feedback.technicalScore}
          icon={BrainCircuit}
          color="var(--color-primary)"
        />
        <ScoreBar
          title="Communication Skills"
          score={feedback.communicationScore}
          icon={MessageSquare}
          color="var(--color-secondary)"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ListCard title="What Went Well" items={feedback.strengths} icon={Award} tone="success" />
        <ListCard title="Weaknesses" items={feedback.weaknesses} icon={AlertTriangle} tone="danger" />
        <ListCard title="Improvements" items={feedback.improvements} icon={Target} tone="warning" />
      </div>

      <div className="glass-card p-6 sm:p-8 space-y-4">
        <div
          className="flex items-center gap-2 border-b pb-4"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-fg)' }}
        >
          <FileSearch className="w-5 h-5" />
          <h3 className="font-semibold tracking-wide">Detailed Analysis</h3>
        </div>
        <div className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: 'var(--color-fg-muted)' }}>
          {feedback.detailedAnalysis}
        </div>
      </div>
    </div>
  );
}

function ScoreBar({
  title,
  score,
  icon: Icon,
  color,
}: {
  title: string;
  score: number;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex justify-between items-center text-sm font-medium" style={{ color: 'var(--color-fg)' }}>
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color }} />
          <span>{title}</span>
        </div>
        <span>{score}%</span>
      </div>
      <div
        className="w-full rounded-full h-2.5 overflow-hidden border"
        style={{ backgroundColor: 'var(--color-bg-tertiary)', borderColor: 'var(--color-border)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function ListCard({
  title,
  items,
  icon: Icon,
  tone,
}: {
  title: string;
  items: string[];
  icon: LucideIcon;
  tone: 'success' | 'danger' | 'warning';
}) {
  if (!items || items.length === 0) return null;

  const toneMap = {
    success: {
      color: 'var(--color-success)',
      background: 'var(--color-success-soft)',
      border: 'var(--color-success)',
    },
    danger: {
      color: 'var(--color-error)',
      background: 'var(--color-error-soft)',
      border: 'var(--color-error)',
    },
    warning: {
      color: 'var(--color-warning)',
      background: 'var(--color-warning-soft)',
      border: 'var(--color-warning)',
    },
  }[tone];

  return (
    <div
      className="rounded-lg border p-5 space-y-4 shadow-sm backdrop-blur-xl"
      style={{ borderColor: toneMap.border, backgroundColor: toneMap.background }}
    >
      <div className="flex items-center gap-2" style={{ color: toneMap.color }}>
        <Icon className="w-4 h-4" />
        <h3 className="text-sm font-bold tracking-wide" style={{ color: 'var(--color-fg)' }}>
          {title}
        </h3>
      </div>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm leading-relaxed" style={{ color: 'var(--color-fg-muted)' }}>
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: toneMap.color }}></span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
