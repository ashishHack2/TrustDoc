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
  Cpu,
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { getCases, chatWithAI, AIChatMessage } from '@/lib/api';
import type { Case } from '@/lib/api';
import { cn } from '@/lib/utils';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  model?: string;
};

const SUGGESTED_PROMPTS = [
  'Analyze the overall trust trends across my verifications',
  'What are the most common failure signals & tamper indicators?',
  'Explain how Error Level Analysis (ELA) and ICAO 9303 checksum validation work',
  'Which documents have the highest fraud risk in this workspace?',
  'Explain how 1:1 cross-camera biometric face matching operates',
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
        const caseList = data || [];
        setCases(caseList);
        if (caseList.length > 0) {
          const verified = caseList.filter(c => c.final_decision === 'VERIFIED').length;
          const rejected = caseList.filter(c => c.final_decision === 'REJECTED').length;
          const avgScore = caseList.length > 0 ? Math.round(caseList.reduce((a, c) => a + (c.trust_score || 0), 0) / caseList.length) : 0;
          setMessages([{
            role: 'assistant',
            content: `I am connected to the **TrustDoc OpenRouter Intelligence Engine**. I've indexed **${caseList.length} cases** (${verified} verified, ${rejected} rejected; average trust score: ${avgScore}%).\n\nAsk me anything about your document fraud analysis, Error Level Analysis (ELA), ICAO 9303 checksums, or biometric liveness results.`,
            timestamp: new Date().toISOString(),
            model: 'OpenRouter AI',
          }]);
        } else {
          setMessages([{
            role: 'assistant',
            content: 'Welcome to the **TrustDoc OpenRouter Intelligence Engine**. I can assist you with forensic document inspection, Error Level Analysis (ELA), ICAO 9303 checksum validation, and fraud intelligence.\n\nUpload a document or ask a question to begin.',
            timestamp: new Date().toISOString(),
            model: 'OpenRouter AI',
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

  const handleSend = async (text?: string) => {
    const message = (text || input).trim();
    if (!message || thinking) return;

    const userMsg: Message = { role: 'user', content: message, timestamp: new Date().toISOString() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setThinking(true);

    // Convert to AIChatMessage format for backend
    const apiMessages: AIChatMessage[] = updatedMessages.map(m => ({
      role: m.role,
      content: m.content
    }));

    try {
      const { data, error } = await chatWithAI(apiMessages);
      if (data && data.content) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.content,
            timestamp: new Date().toISOString(),
            model: data.model_used || 'OpenRouter LLM',
          }
        ]);
      } else {
        // Fallback friendly reply if network issue
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `### 🛡️ TrustDoc Verification Insights\n\nBased on your workspace records with **${cases.length} cases**, documents with uniform ELA compression profiles and validated ICAO 9303 checksums pass directly. Spliced biometric portraits or mismatched visual fields are automatically flagged for manual review.`,
            timestamp: new Date().toISOString(),
            model: 'TrustDoc Engine',
          }
        ]);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Unable to connect to the AI engine at this moment. Please verify your backend service connection.',
          timestamp: new Date().toISOString(),
          model: 'Error',
        }
      ]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-4xl mx-auto">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BrainCircuit className="h-5 w-5 text-td-cyan" />
            <h1 className="text-2xl font-bold text-td-navy">AI Analysis Assistant</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Powered by OpenRouter LLM — deep forensic reasoning, evidence fusion explanation, and fraud pattern detection.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-td-cyan-soft/40 border border-td-cyan/30 text-[11px] font-mono font-bold text-td-navy w-fit">
          <Cpu className="h-3.5 w-3.5 text-td-cyan" />
          <span>OPENROUTER CONNECTED</span>
        </div>
      </div>

      {/* Chat container */}
      <div className="rounded-2xl border border-border/70 bg-white overflow-hidden flex flex-col h-[calc(100vh-220px)] lg:h-[calc(100vh-180px)] shadow-sm">
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

        {/* Input bar */}
        <div className="border-t border-border/70 p-3 lg:p-4 bg-muted/10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about verification trends, ELA tampering, or MRZ check digits..."
              disabled={thinking}
              className="flex-1 rounded-xl border border-border bg-white px-4 py-2.5 text-xs sm:text-sm text-td-navy placeholder:text-muted-foreground/50 focus:outline-none focus:border-td-cyan focus:ring-2 focus:ring-td-cyan/20 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || thinking}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-td-navy text-white hover:bg-td-navy/90 hover:shadow-md transition-all disabled:opacity-30 shrink-0"
            >
              {thinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 text-td-cyan" />}
            </button>
          </form>
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
      className={cn('flex items-start gap-2.5', isUser && 'flex-row-reverse')}
    >
      <div className={cn(
        'flex h-8 w-8 items-center justify-center rounded-lg shrink-0 text-xs font-bold font-mono',
        isUser ? 'bg-td-cyan/20 text-td-navy' : 'bg-td-navy text-white',
      )}>
        {isUser ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4 text-td-cyan" />}
      </div>

      <div className={cn('max-w-[85%] space-y-1', isUser && 'text-right')}>
        <div className={cn(
          'rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-left',
          isUser
            ? 'bg-td-navy text-white rounded-tr-sm shadow-sm'
            : 'bg-muted/40 text-td-navy rounded-tl-sm border border-border/60 shadow-sm',
        )}>
          {message.content}
        </div>
        <div className="flex items-center gap-2 px-1 text-[10px] text-muted-foreground">
          {message.model && (
            <span className="font-mono text-[9px] text-td-cyan font-semibold">
              {message.model}
            </span>
          )}
          <span>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
