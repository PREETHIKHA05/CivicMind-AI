import React, { useState } from 'react';
import { useCity } from '../context/CityContext';
import { MOCK_INTELLIGENCE_QA } from '../data/mockData';
import { Bot, Send, X, Sparkles, User, Cpu, ShieldCheck } from 'lucide-react';

export default function AiChatDrawer() {
  const { isAiDrawerOpen, setIsAiDrawerOpen, aiMessages, setAiMessages } = useCity();
  const [inputText, setInputText] = useState('');

  if (!isAiDrawerOpen) return null;

  const quickPrompts = [
    "What is the highest risk right now?",
    "Why is Ward 18 critical?",
    "What departments are affected?",
    "What happened in 2024?",
    "What is the recommended response?"
  ];

  const handleSend = (query) => {
    const qText = query || inputText;
    if (!qText.trim()) return;

    const userMsg = {
      sender: 'user',
      text: qText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAiMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Find matching response in mock Q&A
    setTimeout(() => {
      const lowerQuery = qText.toLowerCase();
      let matchedAns = MOCK_INTELLIGENCE_QA.find(qa =>
        qa.keywords.some(kw => lowerQuery.includes(kw))
      );

      const aiText = matchedAns
        ? matchedAns.response
        : `CivicMind AI analyzed query: "${qText}". Currently, Ward 18 Hospital Road represents the primary urban risk (92/100). Rain: 120mm/h, Drain Capacity: 28%, Emergency ambulance transit delayed by 18 minutes. Coordinated response plan recommended.`;

      const aiMsg = {
        sender: 'ai',
        text: aiText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setAiMessages(prev => [...prev, aiMsg]);
    }, 600);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-[#0b101d] border-l border-slate-800 shadow-2xl flex flex-col justify-between">
      {/* Header */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-500/30 text-purple-400">
            <Bot className="w-5 h-5 animate-pulse-subtle" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              CivicMind AI Assistant
              <span className="px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-mono">
                Active
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Smart City Decision Intelligence Layer
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAiDrawerOpen(false)}
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {aiMessages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 text-xs leading-relaxed ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'ai' && (
              <div className="w-7 h-7 rounded-lg bg-purple-950 border border-purple-500/40 text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
                <Cpu className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[82%] p-3 rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-cyan-600/90 text-white rounded-tr-none shadow-md shadow-cyan-950'
                  : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none font-sans'
              }`}
            >
              <div className="text-[10px] font-mono opacity-60 mb-1">{msg.time}</div>
              <p>{msg.text}</p>
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Prompts */}
      <div className="px-4 py-2 border-t border-slate-800/60 bg-slate-950/40">
        <div className="text-[10px] font-mono text-slate-500 mb-1.5 font-bold uppercase tracking-wider">
          Suggested Queries:
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSend(qp)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-[11px] text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer text-left"
            >
              {qp}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/90">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask CivicMind about city risks, data, history..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
          />
          <button
            type="submit"
            className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
