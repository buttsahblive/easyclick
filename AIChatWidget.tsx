import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Bot, User, RefreshCw } from 'lucide-react';
import { ChatMessage } from '../types';

interface AIChatWidgetProps {
  currentUsername: string | null;
}

export function AIChatWidget({ currentUsername }: AIChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: "Assalam-o-Alaikum! Welcome to Easy Click AI Chat Support. Our platform lets you view daily ads to earn profit. Start Bronze plan at just PKR 300 to claim PKR 20 daily, or Platinum/Diamond plans to expand limits! How can I guide you today? (Urdu & English support)",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue;
    setInputValue('');
    setIsLoading(true);

    // Optimistically add user message
    const updatedMessages: ChatMessage[] = [
      ...messages,
      { sender: 'user', text: userText, timestamp: new Date().toISOString() }
    ];
    setMessages(updatedMessages);

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userText,
          username: currentUsername || 'Guest_Visitor'
        })
      });

      if (!response.ok) {
        throw new Error('Support network connectivity error');
      }

      const data = await response.json();
      if (data.reply) {
        setMessages(prev => [
          ...prev,
          { sender: 'ai', text: data.reply, timestamp: new Date().toISOString() }
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: 'Assistance channel busy. Please make sure to enter receipts correctly or try asking again. Easy Click is with you!',
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {/* Chat Window */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            id="chat-assistant-window"
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-80 md:w-96 h-[480px] flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-4 py-3 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="p-1 bg-white/20 rounded-md animate-pulse">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold tracking-tight">AI Earning Support</h4>
                  <span className="text-[10px] text-emerald-100 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 inline-block animate-ping"></span>
                    Ask about plans & transfers
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/10 p-1.5 rounded-lg transition-colors text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* User identification top banner */}
            <div className="bg-zinc-50 dark:bg-zinc-850 border-b border-zinc-100 dark:border-zinc-800/80 px-4 py-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 flex justify-between items-center">
              <span>Channel: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{currentUsername || 'Guest_Visitor'}</strong></span>
              <span>Secure AI Bot</span>
            </div>

            {/* Chat History List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50/50 dark:bg-zinc-950/40">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2.5 max-w-[85%] ${
                    msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg mt-0.5 shrink-0 ${
                    msg.sender === 'user' 
                      ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700' 
                      : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                  }`}>
                    {msg.sender === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                  </div>
                  <div>
                    <div className={`rounded-2xl px-3.5 py-2.5 shadow-sm text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-zinc-900 text-white dark:bg-zinc-800 rounded-tr-none'
                        : 'bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 text-zinc-800 dark:text-zinc-100 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-1 block px-1 text-right">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-zinc-400 text-[11px] px-1 font-mono">
                  <RefreshCw className="h-3 w-3 animate-spin text-emerald-600" />
                  Easy Click Bot is typing...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-150 dark:border-zinc-805 flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask bot: 'How to buy plans?'..."
                className="flex-1 bg-zinc-50 dark:bg-zinc-950/50 text-zinc-900 dark:text-zinc-100 pl-3.5 pr-1.5 py-2 rounded-xl text-xs border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition-colors shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        id="toggle-easy-click-support"
        className="bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-full shadow-2xl flex items-center justify-center relative cursor-pointer"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-red-500 border-2 border-white dark:border-zinc-950 font-bold text-[8px] flex items-center justify-center text-white font-mono animate-bounce">
          1
        </span>
      </motion.button>
    </div>
  );
}
