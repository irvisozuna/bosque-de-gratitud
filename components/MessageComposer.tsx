
import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Mic, Video, Send, Loader2, Trash2, StopCircle, Image as ImageIcon, Wand2 } from 'lucide-react';
import { generateGratitudeMessage, editImageWithGemini } from '../services/geminiService';
import { sendMessage } from '../services/firebaseService';
import { CreateMessageDTO, MessageType, User } from '../types';
import { useMediaRecorder } from '../hooks/useMediaRecorder';

interface MessageComposerProps {
  user: User;
  onClose: () => void;
  onSent: () => void;
  initialRecipient?: string;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({ user, onClose, onSent, initialRecipient = '' }) => {
  const [msgType, setMsgType] = useState<MessageType>(MessageType.TEXT);
  const [email, setEmail] = useState(initialRecipient);
  const [textContent, setTextContent] = useState('');
  
  // AI Text Gen State
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [aiRecipient, setAiRecipient] = useState('');
  const [aiTone, setAiTone] = useState('Conmovedor');

  // Image Edit State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState('');
  const [isEditingImage, setIsEditingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Recording Hook
  const { 
    isRecording, 
    mediaUrl, 
    mediaBlob, 
    startRecording, 
    stopRecording, 
    resetRecording 
  } = useMediaRecorder();

  // Sending State
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (initialRecipient) setEmail(initialRecipient);
  }, [initialRecipient]);

  // Reset states when switching types
  useEffect(() => {
    resetRecording();
    if (msgType !== MessageType.IMAGE) {
        setSelectedImage(null);
        setImagePrompt('');
    }
  }, [msgType]);

  const handleGenerateText = async () => {
    if (!aiRecipient) return;
    setIsGeneratingText(true);
    try {
      const suggestion = await generateGratitudeMessage(aiRecipient, "Amigo/Familia", aiTone);
      setTextContent(suggestion);
    } finally {
      setIsGeneratingText(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setSelectedImage(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleMagicEdit = async () => {
      if (!selectedImage || !imagePrompt) return;
      setIsEditingImage(true);
      try {
          const edited = await editImageWithGemini(selectedImage, imagePrompt);
          if (edited) {
              setSelectedImage(edited);
              setImagePrompt(''); // Clear prompt after successful edit
          } else {
              alert("No se pudo editar la imagen. Intenta con otro prompt.");
          }
      } catch (e) {
          alert("Error mágico al editar la imagen.");
      } finally {
          setIsEditingImage(false);
      }
  };

  const handleSend = async () => {
    if (!email) return;
    
    // Validation
    if (msgType === MessageType.TEXT && !textContent) return;
    if ((msgType === MessageType.AUDIO || msgType === MessageType.VIDEO) && !mediaBlob) return;
    if (msgType === MessageType.IMAGE && !selectedImage) return;

    setIsSending(true);
    try {
      let finalBlob = mediaBlob;
      let finalContent = msgType === MessageType.TEXT ? textContent : '';

      // If image, convert base64 back to blob for upload logic (or pass as content if backend supports it, 
      // but firebaseService expects blob for media or string for text/base64 mock)
      if (msgType === MessageType.IMAGE && selectedImage) {
          // For the mock backend/firebase service simplified logic, we can pass base64 as content directly
          // if we modify logic slightly, OR create a blob.
          // Let's make a fetch to create blob from dataURI
          const res = await fetch(selectedImage);
          finalBlob = await res.blob();
      }

      const dto: CreateMessageDTO = {
        receiverEmail: email,
        content: finalContent, 
        type: msgType
      };
      
      await sendMessage(dto, user, finalBlob || undefined);
      onSent();
    } catch (e) {
        console.error("Failed to send", e);
        alert("Error enviando el mensaje. Inténtalo de nuevo.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden text-white flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800">
          <h2 className="font-display text-2xl text-yellow-400">Enviar Gratitud</h2>
          <button onClick={onClose} className="hover:bg-slate-700 p-2 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Step 1: Recipient */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Para (Email)</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              placeholder="amigo@ejemplo.com"
              className="w-full bg-black/30 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400 transition-colors"
            />
          </div>

          {/* Message Type Selector */}
          <div className="flex gap-2">
             <button 
                onClick={() => setMsgType(MessageType.TEXT)}
                className={`flex-1 py-2 rounded-lg flex flex-col items-center gap-1 border transition-all ${msgType === MessageType.TEXT ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' : 'bg-white/5 border-transparent text-slate-400'}`}
             >
                <span className="font-serif italic">Aa</span>
                <span className="text-[10px]">Carta</span>
             </button>
             <button 
                onClick={() => setMsgType(MessageType.IMAGE)}
                className={`flex-1 py-2 rounded-lg flex flex-col items-center gap-1 border transition-all ${msgType === MessageType.IMAGE ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-white/5 border-transparent text-slate-400'}`}
             >
                <ImageIcon className="w-4 h-4" />
                <span className="text-[10px]">Foto</span>
             </button>
             <button 
                onClick={() => setMsgType(MessageType.AUDIO)}
                className={`flex-1 py-2 rounded-lg flex flex-col items-center gap-1 border transition-all ${msgType === MessageType.AUDIO ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-white/5 border-transparent text-slate-400'}`}
             >
                <Mic className="w-4 h-4" />
                <span className="text-[10px]">Audio</span>
             </button>
             <button 
                onClick={() => setMsgType(MessageType.VIDEO)}
                className={`flex-1 py-2 rounded-lg flex flex-col items-center gap-1 border transition-all ${msgType === MessageType.VIDEO ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-white/5 border-transparent text-slate-400'}`}
             >
                <Video className="w-4 h-4" />
                <span className="text-[10px]">Video</span>
             </button>
          </div>

          {/* Content Area */}
          {msgType === MessageType.TEXT && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-400">Tu Mensaje</label>
                <div className="flex gap-2 text-xs">
                   <input 
                    type="text" 
                    placeholder="Nombre para IA" 
                    value={aiRecipient} 
                    onChange={e => setAiRecipient(e.target.value)}
                    className="bg-black/30 rounded px-2 py-1 w-28 border border-slate-600 focus:border-purple-400 outline-none"
                   />
                   <button 
                    onClick={handleGenerateText}
                    disabled={!aiRecipient || isGeneratingText}
                    className="flex items-center gap-1 text-purple-300 hover:text-purple-200 disabled:opacity-50 transition-colors"
                   >
                     {isGeneratingText ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                     Mágia
                   </button>
                </div>
              </div>
              <textarea 
                value={textContent}
                onChange={e => setTextContent(e.target.value)}
                placeholder="Escribe algo conmovedor..."
                className="w-full h-40 bg-black/30 border border-slate-600 rounded-lg p-4 focus:outline-none focus:border-yellow-400 resize-none font-serif leading-relaxed"
              />
            </div>
          )}

          {msgType === MessageType.IMAGE && (
              <div className="space-y-4">
                  {!selectedImage ? (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="h-48 border-2 border-dashed border-slate-600 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-purple-500 hover:bg-purple-500/5 cursor-pointer transition-all"
                      >
                          <ImageIcon className="w-10 h-10 mb-2" />
                          <p>Clic para subir foto</p>
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleImageUpload}
                          />
                      </div>
                  ) : (
                      <div className="space-y-3">
                          <div className="relative group rounded-xl overflow-hidden border border-slate-600">
                              <img src={selectedImage} alt="Preview" className="w-full h-48 object-cover" />
                              {isEditingImage && (
                                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center flex-col gap-2 text-purple-300">
                                      <Loader2 className="w-8 h-8 animate-spin" />
                                      <span>Aplicando magia...</span>
                                  </div>
                              )}
                              <button 
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full text-white hover:bg-red-500 transition-colors"
                              >
                                  <X className="w-4 h-4" />
                              </button>
                          </div>

                          {/* Magic Prompt */}
                          <div className="flex gap-2">
                              <input 
                                type="text"
                                value={imagePrompt}
                                onChange={e => setImagePrompt(e.target.value)}
                                placeholder="Ej: Añade nieve y luces de navidad..."
                                className="flex-1 bg-black/30 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:border-purple-400 outline-none"
                              />
                              <button 
                                onClick={handleMagicEdit}
                                disabled={!imagePrompt || isEditingImage}
                                className="bg-purple-600 hover:bg-purple-500 text-white px-3 rounded-lg disabled:opacity-50"
                              >
                                  <Wand2 className="w-4 h-4" />
                              </button>
                          </div>
                          <p className="text-[10px] text-slate-500 text-center">Usa IA para transformar tu foto.</p>
                      </div>
                  )}
              </div>
          )}

          {(msgType === MessageType.AUDIO || msgType === MessageType.VIDEO) && (
            <div className="min-h-[200px] bg-black/50 border border-slate-600 rounded-lg flex flex-col items-center justify-center p-4 relative overflow-hidden">
               
               {msgType === MessageType.VIDEO && isRecording && (
                   <div className="absolute inset-0 bg-black">
                       <p className="text-center text-white mt-20 animate-pulse">Grabando cámara...</p>
                   </div>
               )}

               {mediaUrl && !isRecording && (
                   <div className="w-full h-full flex items-center justify-center mb-4">
                       {msgType === MessageType.VIDEO ? (
                           <video src={mediaUrl} controls className="max-h-40 rounded" />
                       ) : (
                           <audio src={mediaUrl} controls className="w-full" />
                       )}
                   </div>
               )}

               <div className="flex gap-4 z-10 mt-auto">
                   {!isRecording && !mediaUrl && (
                       <button 
                         onClick={() => startRecording(msgType === MessageType.VIDEO ? 'video' : 'audio')}
                         className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110"
                       >
                           {msgType === MessageType.VIDEO ? <Video className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                       </button>
                   )}

                   {isRecording && (
                       <div className="flex flex-col items-center gap-2">
                           <span className="animate-pulse text-red-500 font-bold text-xs tracking-widest">GRABANDO</span>
                           <button 
                             onClick={stopRecording}
                             className="w-16 h-16 rounded-full bg-slate-700 hover:bg-slate-600 border-4 border-red-500 flex items-center justify-center text-white transition-all"
                           >
                               <StopCircle className="w-8 h-8 fill-current" />
                           </button>
                       </div>
                   )}

                   {mediaUrl && !isRecording && (
                       <button 
                         onClick={resetRecording}
                         className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center gap-2 text-sm transition-colors"
                       >
                           <Trash2 className="w-4 h-4" /> Grabar de nuevo
                       </button>
                   )}
               </div>
            </div>
          )}

          {/* Footer Action */}
          <button 
            onClick={handleSend}
            disabled={isSending || (msgType === MessageType.TEXT && !textContent) || (msgType === MessageType.IMAGE && !selectedImage) || ((msgType === MessageType.AUDIO || msgType === MessageType.VIDEO) && !mediaUrl) || !email}
            className="w-full py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {isSending ? "Subiendo..." : "Enviar al Bosque"}
          </button>

        </div>
      </div>
    </div>
  );
};
