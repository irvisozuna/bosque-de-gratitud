import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2, Sparkles } from 'lucide-react';
import { chatWithElf } from '../services/geminiService';

interface ElfChatProps {
  onClose: () => void;
}

export const ElfChat: React.FC<ElfChatProps> = ({ onClose }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{sender: 'user' | 'elf', text: string}[]>([
    { sender: 'elf', text: "¡Hola! ¡Soy Jingle! ¡Bienvenido al Bosque de la Gratitud! ✨🎄 ¿En qué puedo ayudarte hoy?" }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setHistory(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatWithElf(userMsg);
      setHistory(prev => [...prev, { sender: 'elf', text: response }]);
    } catch (e) {
      setHistory(prev => [...prev, { sender: 'elf', text: "¡Oh no! Se me congeló el cerebro con tanta nieve. ¿Puedes repetirlo?" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      {/* Clickable backdrop handled by parent or transparent here */}
      
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col border-4 border-green-600 transform transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-green-600 p-4 flex justify-between items-center text-white shadow-md">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
               <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Jingle el Elfo</h3>
              <p className="text-green-100 text-xs">Guía del Bosque Mágico</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-green-700 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="h-80 overflow-y-auto p-4 bg-[url('https://www.transparenttextures.com/patterns/snow.png')] bg-slate-50">
          <div className="space-y-4">
            {history.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm text-sm leading-relaxed ${
                  msg.sender === 'user' 
                  ? 'bg-green-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                   <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                   <span className="text-xs text-slate-400 italic">Pensando mágicamente...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
          <div className="flex gap-2 relative">
            <input 
              className="w-full bg-slate-100 border border-slate-200 rounded-full px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-800 placeholder:text-slate-400"
              placeholder="Escribe tu pregunta..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              autoFocus
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="absolute right-1 top-1 bottom-1 bg-green-600 text-white p-2 rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors aspect-square flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-400 mt-2">
            Jingle funciona con Magia IA y puede cometer errores traviesos.
          </p>
        </div>

      </div>
    </div>
  );
};