'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BrainCircuit,
  Send,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  FileSearch,
  Loader2,
  Bot,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { getCases } from '@/lib/api';
import type { Case } from '@/lib/api';
import { cn } from '@/lib/utils';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

const SUGGESTED_PROMPTS = [
  'Analyze the overall trust trends across my verifications',
  'What are the most common failure signals?',
  'Which documents have the highest risk level?',
  'Explain how evidence fusion works',
  'What document types are most frequently verified?',
];

export default function AITab() {
  const { user } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      getCases().then(({ data }) => {
        setCases(data);
        if (data.length > 0) {
          const verified = data.filter(c => c.final_decision === 'VERIFIED').length;
          const rejected = data.filter(c => c.final_decision === 'REJECTED').length;
          const avgScore = data.length > 0 ? Math.round(data.reduce((a, c) => a + (c.trust_score || 0), 0) / data.length) : 0;
          setMessages([{
            role: 'assistant',
            content: `I've loaded ${data.length} case${data.length !== 1 ? 's' : ''} from your workspace. ${verified} verified, ${rejected} rejected. Average trust score: ${avgScore}%. Ask me anything about your verification data.`,
            timestamp: new Date().toISOString(),
          }]);
        } else {
          setMessages([{
            role: 'assistant',
            content: 'Welcome to the TRUSTDOC AI Analysis Assistant. I can help you understand verification patterns, evidence signals, and trust decisions. Upload a document first, then ask me to analyze the results.',
            timestamp: new Date().toISOString(),
          }]);
        }
      });
    }
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  const generateResponse = (prompt: string): string => {
    const lower = prompt.toLowerCase();

    if (cases.length === 0) {
      return 'You have no cases yet. Create a new verification from the Upload tab to start. Once you have verified cases, I can analyze trust trends, failure patterns, and risk distributions.';
    }

    if (lower.includes('trend') || lower.includes('overall') || lower.includes('summary')) {
      const avg = Math.round(cases.reduce((a, c) => a + (c.trust_score || 0), 0) / cases.length);
      const verified = cases.filter(c => c.final_decision === 'VERIFIED').length;
      const rejected = cases.filter(c => c.final_decision === 'REJECTED').length;
      const passRate = cases.length > 0 ? Math.round((verified / cases.length) * 100) : 0;
      return `Across ${cases.length} cases:\n\n• Average trust score: ${avg}%\n• Verification pass rate: ${passRate}% (${verified} verified, ${rejected} rejected)\n\n${avg >= 85 ? 'Your documents are showing strong authenticity signals overall.' : avg >= 65 ? 'There are some warning-level signals that warrant attention.' : 'Multiple documents are showing significant trust issues — consider manual review.'}`;
    }

    if (lower.includes('fail') || lower.includes('risk') || lower.includes('reject')) {
      const lowScore = cases.filter(c => (c.trust_score || 100) < 65);
      if (lowScore.length === 0) return 'No high-risk cases detected. All scored above 65% trust.';
      return `${lowScore.length} case${lowScore.length !== 1 ? 's' : ''} scored below 65% trust:\n\n${lowScore.map(c => `• ${c.applicant_name} — ${c.trust_score}% (${c.expected_document_type || 'document'})`).join('\n')}\n\nCommon failure indicators include MRZ checksum mismatches, face match below threshold, and forensic tampering detection.`;
    }

    if (lower.includes('fusion') || lower.includes('evidence') || lower.includes('how')) {
      return 'Evidence fusion is TRUSTDOC\'s core decision-making layer. It combines all evidence layers — document classification, OCR, MRZ validation, field consistency, forensics, face match, liveness, chip validation — into a weighted trust score.\n\nThresholds:\n• 85%+ → VERIFIED\n• 65–84% → MANUAL REVIEW\n• 40–64% → SUSPICIOUS\n• <40% → REJECTED';
    }

    if (lower.includes('type') || lower.includes('document')) {
      const types = cases.reduce((acc, c) => {
        const t = c.expected_document_type || 'Unknown';
        acc[t] = (acc[t] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const sorted = Object.entries(types).sort((a, b) => b[1] - a[1]);
      return `Document type distribution:\n\n${sorted.map(([type, count]) => `• ${type}: ${count} case${count !== 1 ? 's' : ''}`).join('\n')}`;
    }

    return `I can analyze your ${cases.length} case${cases.length !== 1 ? 's' : ''} across multiple dimensions. Try asking about:\n\n• Trust score trends\n• Rejected or suspicious cases\n• Document type distribution\n• How evidence fusion works`;
  };

  const handleSend = (text?: string) => {
    const message = (text || input).trim();
    if (!message || thinking) return;

    const userMsg: Message = { role: 'user', content: message, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setThinking(true);

    setTimeout(() => {
      const response = generateResponse(message);
      setMessages((prev) => [...prev, { role: 'assistant', content: response, timestamp: new Date().toISOString() }]);
      setThinking(false);
    }, 800 + Math.random() * 600);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <BrainCircuit className="h-5 w-5 text-td-cyan" />
          <h1 className="text-2xl font-bold text-td-navy">AI Analysis</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Ask questions about your verification data, evidence patterns, and trust decisions.
        </p>
      </div>

      {/* Chat container */}
      <div className="rounded-2xl border border-border/70 bg-white overflow-hidden flex flex-col h-[calc(100vh-220px)] lg:h-[calc(100vh-180px)]">
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}

          {thinking && (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-td-navy shrink-0">
                <Bot className="h-4 w-4 text-td-cyan" />
              </div>
              <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-muted/50 px-4 py-3">
                <span className="h-1.5 w-1.5 rounded-full bg-td-cyan animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-1.5 w-1.5 rounded-full bg-td-cyan animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-1.5 w-1.5 rounded-full bg-td-cyan animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>

        {/* Suggested prompts */}
        {messages.length <= 1 && !thinking && (
          <div className="px-4 lg:px-6 pb-2">
            <p className="font-mono text-[9px] tracking-wide text-muted-foreground mb-2">SUGGESTED QUESTIONS</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-[11px] font-medium text-foreground/70 hover:border-td-cyan/30 hover:bg-td-cyan-soft/20 hover:text-td-navy transition-all"
                >
                  <Sparkles className="h-3 w-3 text-td-cyan" />
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-border/60 p-3 lg:p-4">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask about your verifications…"
                rows={1}
                className="w-full resize-none rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm text-td-navy placeholder:text-muted-foreground/60 focus:outline-none focus:border-td-cyan focus:ring-2 focus:ring-td-cyan/20 transition-all max-h-32"
                style={{ minHeight: '44px' }}
              />
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || thinking}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-td-navy text-white transition-all hover:shadow-lg hover:shadow-td-navy/20 disabled:opacity-40 shrink-0"
            >
              {thinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn('flex items-start gap-2.5', isUser && 'flex-row-reverse')}
    >
      <div className={cn(
        'flex h-8 w-8 items-center justify-center rounded-lg shrink-0',
        isUser ? 'bg-td-cyan/10' : 'bg-td-navy',
      )}>
        {isUser ? (
          <UserIcon className="h-4 w-4 text-td-cyan" />
        ) : (
          <Bot className="h-4 w-4 text-td-cyan" />
        )}
      </div>
      <div className={cn(
        'rounded-2xl px-4 py-3 max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap',
        isUser
          ? 'bg-td-navy text-white rounded-tr-sm'
          : 'bg-muted/40 text-td-navy rounded-tl-sm',
      )}>
        {message.content}
      </div>
    </motion.div>
  );
}
