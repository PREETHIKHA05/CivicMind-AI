import React, { useState, useRef, useEffect } from 'react';
import { useCity } from '../context/CityContext';
import { Bot, Send, X, Cpu, User, Sparkles, Loader2 } from 'lucide-react';

const GEMINI_API_KEY = 'AIzaSyCj3yk2IYU-N3F0A1e0_cDg_jdnpGsM5h4';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_CONTEXT = `You are CivicMind AI, an urban intelligence assistant for Chennai's Integrated City Command & Control Centre (ICCC).

You assist Zone Counselors and Department Officials with:
- Real-time urban risk analysis (floods, traffic, emergencies)
- Multi-agent AI coordination across departments (Water, Traffic, Emergency 108, Public Advisory, Weather)
- Cascading risk identification and response plan recommendations
- Work order management and department coordination

Current scenario context:
- Ward 18 Hospital Road: Critical flooding risk (92/100 risk index)
- Rainfall: 118-120mm/hr, drain capacity at 28%
- Emergency ambulance Unit 108-B4 delayed (STEMI patient, 31min ETA vs 90min window)
- Agents active: Weather, Water, Traffic, Emergency, Citizen Voice

Be concise, data-driven, and action-oriented. Keep responses under 150 words unless asked for detail.`;

const quickPrompts = [
  "What is the highest risk right now?",
  "Why is Ward 18 critical?",
  "What departments are affected?",
  "What is the recommended response?",
  "Summarize the active incidents"
];

export default function AiChatDrawer() {
  const { isAiDrawerOpen, setIsAiDrawerOpen, aiMessages, setAiMessages, backendUrl } = useCity();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages, isLoading]);

  if (!isAiDrawerOpen) return null;

  const handleSend = async (query) => {
    const qText = (query || inputText).trim();
    if (!qText || isLoading) return;

    const userMsg = {
      sender: 'user',
      text: qText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAiMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch(`${backendUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: qText,
          history: aiMessages
        })
      });

      const data = await res.json();
      const aiText = data?.response || 'Unable to get a response. Please try again.';

      setAiMessages(prev => [...prev, {
        sender: 'ai',
        text: aiText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      setAiMessages(prev => [...prev, {
        sender: 'ai',
        text: 'Network error — could not reach CivicMind AI assistant. Please check your connection and try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-white border-l border-purple-100 shadow-2xl flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-purple-100 bg-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-100 border border-purple-200 text-purple-600">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              CivicMind AI Assistant
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 text-[10px] font-mono">
                Gemini
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">Smart City Decision Intelligence</p>
          </div>
        </div>

        <button
          onClick={() => setIsAiDrawerOpen(false)}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {aiMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-10">
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100">
              <Sparkles className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-sm font-semibold text-slate-600">Ask me anything about the city</p>
            <p className="text-xs text-slate-400 max-w-[250px]">Real-time risk analysis, incident details, response recommendations and more.</p>
          </div>
        )}

        {aiMessages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 text-xs leading-relaxed ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-7 h-7 rounded-lg bg-purple-100 border border-purple-200 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                <Cpu className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[82%] p-3 rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-purple-600 text-white rounded-tr-none shadow-md'
                  : msg.isError
                    ? 'bg-red-50 border border-red-200 text-red-700 rounded-tl-none'
                    : 'bg-white border border-purple-100 text-slate-700 rounded-tl-none shadow-sm'
              }`}
            >
              <div className={`text-[10px] font-mono mb-1 ${msg.sender === 'user' ? 'opacity-70' : 'text-slate-400'}`}>
                {msg.time}
              </div>
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-purple-100 border border-purple-200 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-lg bg-purple-100 border border-purple-200 text-purple-600 flex items-center justify-center shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="bg-white border border-purple-100 rounded-2xl rounded-tl-none p-3 shadow-sm flex items-center gap-2 text-slate-500 text-xs">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-500" />
              <span>Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-4 py-2 border-t border-purple-100 bg-white">
        <div className="text-[10px] font-mono text-slate-400 mb-1.5 tracking-wider">Suggested:</div>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSend(qp)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-100 hover:border-purple-300 text-[11px] text-purple-700 transition-colors cursor-pointer text-left disabled:opacity-50"
            >
              {qp}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-3 border-t border-purple-100 bg-white">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about city risks, incidents, response plans..."
            disabled={isLoading}
            className="flex-1 bg-slate-50 border border-purple-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-400 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
