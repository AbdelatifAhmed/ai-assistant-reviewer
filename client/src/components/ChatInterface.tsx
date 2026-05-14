'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  Loader2,
  Send,
  ShieldCheck,
  StopCircle,
  User,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatInterfaceProps {
  interviewId: string;
  onFinish: () => void;
}

const TARGET_QUESTIONS = 10;
const ANSWERS_REQUIRED_TO_FINISH = 2;

export default function ChatInterface({ interviewId, onFinish }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const visibleMessages = useMemo(
    () => messages.filter((message) => message.role !== 'system'),
    [messages]
  );

  const answeredCount = visibleMessages.filter((message) => message.role === 'user').length;
  const progress = Math.min(Math.round((questionsAsked / TARGET_QUESTIONS) * 100), 100);
  const canFinish =
    answeredCount >= ANSWERS_REQUIRED_TO_FINISH && !isLoading && !isTyping && !isFinishing;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [visibleMessages, isTyping]);

  useEffect(() => {
    const loadInitialMessage = async () => {
      setIsLoading(true);
      setLoadError(false);

      try {
        const response = await api.interviews.getOne(interviewId);
        const history = response.data.messages || [];

        setMessages(history);
        setQuestionsAsked(response.data.questionsAsked || 0);
      } catch {
        setLoadError(true);
        toast.error('Failed to load session context.');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialMessage();
  }, [interviewId]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping || isLoading || isFinishing) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      const response = await api.interviews.sendMessage(interviewId, userMsg);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.data.message },
      ]);
      setQuestionsAsked(response.data.questionsAsked || questionsAsked + 1);
    } catch {
      toast.error('Communication error. Please retry.');
      setMessages((prev) => prev.slice(0, -1));
      setInput(userMsg);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFinish = async () => {
    if (!canFinish) return;
    if (!confirm('Generate the evaluation report now?')) return;

    setIsFinishing(true);
    try {
      await api.interviews.finish(interviewId);
      onFinish();
    } catch {
      toast.error('Failed to generate evaluation report.');
      setIsFinishing(false);
    }
  };

  return (
    <section className="h-full min-h-0 flex flex-col bg-transparent">
      <header
        className="shrink-0 border-b px-4 py-4 backdrop-blur-xl sm:px-6"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-glass)' }}
      >
        <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="min-w-0 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border text-[var(--color-accent)] shadow-sm"
                style={{
                  backgroundColor: 'var(--color-accent-soft)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold text-[var(--color-fg)] sm:text-lg">
                  Technical Assessment
                </h1>
                <p className="text-xs text-[var(--color-fg-muted)] sm:text-sm">
                  Finish unlocks after 2 submitted answers
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
              <div
                className="min-w-0 rounded-lg border p-3"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-glass-strong)',
                }}
              >
                <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold text-[var(--color-fg-muted)]">
                  <span>Assessment Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--color-bg-tertiary)] ring-1 ring-[var(--color-border)]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                      background:
                        'linear-gradient(90deg, var(--color-question), var(--color-primary), var(--color-answer))',
                    }}
                  />
                </div>
              </div>
              <StatCard value={questionsAsked} label="Questions asked" tone="question" />
              <StatCard value={answeredCount} label="Answers submitted" tone="answer" />
            </div>
          </div>

          <button
            type="button"
            onClick={handleFinish}
            disabled={!canFinish}
            className="flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-lg border px-5 text-sm font-bold transition-all sm:w-auto"
            style={{
              background: canFinish
                ? 'linear-gradient(135deg, var(--color-warning), var(--color-error))'
                : 'var(--color-bg-tertiary)',
              borderColor: canFinish ? 'rgba(255,255,255,0.28)' : 'var(--color-border)',
              color: canFinish ? '#ffffff' : 'var(--color-fg-muted)',
              boxShadow: canFinish ? '0 16px 36px rgba(220, 38, 38, 0.22)' : 'none',
              cursor: canFinish ? 'pointer' : 'not-allowed',
            }}
            title={canFinish ? 'Generate evaluation report' : 'Submit 2 answers to unlock evaluation'}
          >
            {isFinishing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <StopCircle className="h-4 w-4" />
            )}
            <span>{isFinishing ? 'Generating Report' : 'Finish For Evaluation'}</span>
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-4">
          {isLoading && (
            <StatusPanel
              icon={<Loader2 className="h-5 w-5 animate-spin" />}
              title="Preparing your assessment"
              text="Loading the opening question and session context."
            />
          )}

          {loadError && !isLoading && (
            <StatusPanel
              icon={<AlertCircle className="h-5 w-5" />}
              title="Session could not be loaded"
              text="Refresh the page or start a new assessment if this session has expired."
              tone="error"
            />
          )}

          {!isLoading && !loadError && visibleMessages.length === 0 && (
            <StatusPanel
              icon={<Bot className="h-5 w-5" />}
              title="Waiting for the first question"
              text="The interviewer will appear here as soon as the session is ready."
            />
          )}

          {visibleMessages.map((message, index) => (
            <MessageBubble key={`${message.role}-${index}`} message={message} index={index} />
          ))}

          {isTyping && (
            <div className="flex items-start gap-3">
              <Avatar role="assistant" />
              <div
                className="rounded-lg border px-4 py-3 shadow-sm backdrop-blur-xl"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-glass-strong)',
                }}
              >
                <div className="flex items-center gap-2 text-sm text-[var(--color-fg-muted)]">
                  <Loader2 className="h-4 w-4 animate-spin text-[var(--color-accent)]" />
                  Interviewer is reviewing your answer
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <footer
        className="shrink-0 border-t px-4 py-4 backdrop-blur-xl sm:px-6"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-glass)' }}
      >
        <form onSubmit={handleSend} className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row">
          <div className="min-w-0 flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Write your answer..."
              disabled={isLoading || isTyping || isFinishing || loadError}
              rows={2}
              className="input-field max-h-32 min-h-12 resize-none leading-relaxed"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading || isTyping || isFinishing || loadError}
            className="btn-primary-solid min-h-12 px-5"
            title="Send answer"
          >
            <Send className="h-4 w-4" />
            <span className="sm:hidden lg:inline">Send Answer</span>
          </button>
        </form>
      </footer>
    </section>
  );
}

function MessageBubble({ message, index }: { message: Message; index: number }) {
  const isUser = message.role === 'user';
  const label = isUser ? 'Answer submitted' : `Question ${Math.floor(index / 2) + 1}`;

  return (
    <article className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <Avatar role={message.role} />
      <div
        className={`min-w-0 max-w-[88%] sm:max-w-[78%] ${
          isUser ? 'items-end' : 'items-start'
        } flex flex-col gap-1.5`}
      >
        <span className="px-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-subtle)]">
          {label}
        </span>
        <div
          className="rounded-lg border px-4 py-3 text-sm leading-relaxed text-[var(--color-fg)] shadow-sm backdrop-blur-xl"
          style={{
            borderColor: isUser ? 'var(--color-answer)' : 'var(--color-question)',
            background: isUser
              ? 'linear-gradient(145deg, var(--color-answer-soft), var(--color-glass-strong))'
              : 'linear-gradient(145deg, var(--color-question-soft), var(--color-glass-strong))',
            boxShadow: isUser
              ? '0 14px 34px rgba(15, 118, 110, 0.12)'
              : '0 14px 34px rgba(124, 58, 237, 0.12)',
          }}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-pre:rounded-lg prose-pre:border prose-pre:border-[var(--color-border)] prose-pre:bg-[var(--color-bg-tertiary)]">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function Avatar({ role }: { role: Message['role'] }) {
  const isUser = role === 'user';

  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border"
      style={{
        backgroundColor: isUser ? 'var(--color-answer-soft)' : 'var(--color-question-soft)',
        borderColor: isUser ? 'var(--color-answer)' : 'var(--color-question)',
        color: isUser ? 'var(--color-answer)' : 'var(--color-question)',
      }}
    >
      {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
    </div>
  );
}

function StatusPanel({
  icon,
  title,
  text,
  tone = 'default',
}: {
  icon: ReactNode;
  title: string;
  text: string;
  tone?: 'default' | 'error';
}) {
  return (
    <div
      className="mx-auto mt-12 flex max-w-md flex-col items-center gap-3 rounded-lg border p-6 text-center shadow-sm backdrop-blur-xl"
      style={{
        borderColor: tone === 'error' ? 'var(--color-error)' : 'var(--color-border)',
        backgroundColor: 'var(--color-glass-strong)',
      }}
    >
      <div className={tone === 'error' ? 'text-[var(--color-error)]' : 'text-[var(--color-accent)]'}>
        {icon}
      </div>
      <div>
        <h2 className="text-sm font-semibold text-[var(--color-fg)]">{title}</h2>
        <p className="mt-1 text-sm text-[var(--color-fg-muted)]">{text}</p>
      </div>
      {tone !== 'error' && <CheckCircle2 className="h-4 w-4 text-[var(--color-success)]" />}
    </div>
  );
}

function StatCard({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: 'question' | 'answer';
}) {
  const color = tone === 'question' ? 'var(--color-question)' : 'var(--color-answer)';
  const background = tone === 'question' ? 'var(--color-question-soft)' : 'var(--color-answer-soft)';

  return (
    <div
      className="rounded-lg border px-4 py-3 shadow-sm backdrop-blur-xl sm:min-w-40"
      style={{ borderColor: color, backgroundColor: background }}
    >
      <div className="text-2xl font-black leading-none" style={{ color }}>
        {value}
      </div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-fg-muted)]">
        {label}
      </div>
    </div>
  );
}
