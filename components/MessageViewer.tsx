
import React, { useState } from 'react';
import { X, Reply, Heart, Volume2, Loader2 } from 'lucide-react';
import { Message, MessageType } from '../types';
import { generateSpeech } from '../services/geminiService';

interface MessageViewerProps {
  message: Message;
  onClose: () => void;
  onReply: (senderEmail: string) => void;
}

// Helper to decode raw PCM base64 to AudioBuffer
// Note: Gemini TTS can return various formats. For simplicity, if using standard REST, 
// it might require processing. 
// However, for this demo, if we get base64, we will try to use a simple data URI method first
// or assume MP3/WAV if configured. 
// Since the service returns a Data URI, we can play it directly in an Audio element.
const AudioPlayer: React.FC<{ src: string }> = ({ src }) => {
    return <audio controls src={src} className="w-full mt-4" autoPlay />;
};


export const MessageViewer: React.FC<MessageViewerProps> = ({ message, onClose, onReply }) => {
  const [ttsUrl, setTtsUrl] = useState<string | null>(null);
  const [isLoadingTts, setIsLoadingTts] = useState(false);

  const handlePlayTTS = async () => {
      if (ttsUrl) return;
      setIsLoadingTts(true);
      try {
          // The service returns raw audio data. 
          // We need to handle PCM decoding usually, but let's see if we can get a simpler format 
          // or if the service wrapper we made handles it.
          const rawBase64 = await generateSpeech(message.content);
          
          if (rawBase64) {
            // Gemini API returns raw PCM usually. 
            // Decoding PCM in browser requires AudioContext.
            // Implementation below:
            
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const binaryString = atob(rawBase64);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            
            // Convert 16-bit PCM to Float32
            const float32Array = new Float32Array(bytes.length / 2);
            const dataView = new DataView(bytes.buffer);
            for (let i = 0; i < float32Array.length; i++) {
                float32Array[i] = dataView.getInt16(i * 2, true) / 32768.0;
            }

            const buffer = audioContext.createBuffer(1, float32Array.length, 24000);
            buffer.getChannelData(0).set(float32Array);

            // Play it
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start(0);
            
            // No visual player needed for PCM immediate playback, but we could export to blob if we wanted controls.
          }
      } catch (e) {
          console.error("TTS Error", e);
      } finally {
          setIsLoadingTts(false);
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div 
        className="bg-[#fff1f2] text-slate-900 rounded-sm shadow-[0_0_50px_rgba(255,255,255,0.3)] w-full max-w-md relative transform transition-all scale-100 rotate-1"
        style={{ minHeight: '450px', maxHeight: '80vh' }}
      >
        {/* Paper Texture Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://www.transparenttextures.com/patterns/paper.png')]"></div>

        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 z-10 bg-white/50 p-1 rounded-full"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 flex flex-col h-full relative z-0">
          <div className="border-b-2 border-dotted border-slate-300 pb-4 mb-6 flex justify-between items-end">
            <div>
                <h3 className="font-display text-3xl text-red-800">Un Regalo Para Ti</h3>
                <p className="text-sm text-slate-500 font-serif italic mt-1">De: {message.senderName}</p>
            </div>
            
            {message.type === MessageType.TEXT && (
                <button 
                    onClick={handlePlayTTS}
                    disabled={isLoadingTts}
                    className="flex items-center gap-1 text-slate-500 hover:text-red-600 transition-colors text-xs uppercase font-bold bg-slate-200 px-2 py-1 rounded-full hover:bg-slate-300"
                >
                    {isLoadingTts ? <Loader2 className="w-3 h-3 animate-spin" /> : <Volume2 className="w-3 h-3" />}
                    Escuchar
                </button>
            )}
          </div>

          <div className="flex-grow flex flex-col items-center justify-start overflow-y-auto pr-2">
            {message.type === MessageType.TEXT && (
              <p className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-slate-800 w-full">
                {message.content}
              </p>
            )}

            {message.type === MessageType.IMAGE && (
              <div className="w-full h-full min-h-[200px] bg-slate-100 p-1 rounded shadow-sm transform -rotate-1">
                 <img src={message.content} alt="Regalo Visual" className="w-full h-full object-cover rounded-sm" />
              </div>
            )}
            
            {message.type === MessageType.AUDIO && (
              <div className="w-full my-auto bg-slate-100 p-4 rounded-lg border border-slate-200">
                <div className="text-center mb-2 font-serif italic text-slate-500">Mensaje de voz</div>
                <audio controls src={message.content} className="w-full" />
              </div>
            )}

            {message.type === MessageType.VIDEO && (
              <div className="w-full h-full bg-black rounded-lg overflow-hidden shadow-inner border border-slate-200">
                <video controls src={message.content} className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="pt-6 mt-4 border-t border-slate-200 flex justify-between items-center">
             <button 
                onClick={() => onReply(message.senderEmail)}
                className="flex items-center gap-2 text-red-700 hover:text-red-600 font-bold text-sm uppercase tracking-wider hover:scale-105 transition-transform"
             >
               <Reply className="w-4 h-4" /> Responder
             </button>
             <Heart className="w-6 h-6 text-red-500 fill-current animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};
