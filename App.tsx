
import React, { useEffect, useState, useRef } from 'react';
import { Experience } from './scene/Experience';
import { MessageComposer } from './components/MessageComposer';
import { MessageViewer } from './components/MessageViewer';
import { ElfChat } from './components/ElfChat';
import { Loader } from './components/UI/Loader';
import { fetchMessages, signInWithGoogle, logout, getCurrentUser } from './services/firebaseService';
import { Message, User } from './types';
import { PenTool, LogOut, Trees, Volume2, VolumeX, MousePointer2, User as UserIcon, AlertCircle } from 'lucide-react';
import { auth, useMock } from './firebaseConfig';

// Copyright-free Christmas ambient track
const MUSIC_URL = "https://assets.mixkit.co/music/preview/mixkit-christmas-atmosphere-2972.mp3";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [viewingMessage, setViewingMessage] = useState<Message | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [isTalkingToElf, setIsTalkingToElf] = useState(false);
  
  const [replyToEmail, setReplyToEmail] = useState('');
  const [isLocked, setIsLocked] = useState(false); 
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // AUTH INITIALIZATION
  useEffect(() => {
    // Check if we are in mock mode immediately
    if (useMock) {
        const mockUser = getCurrentUser();
        setUser(mockUser);
        setLoading(false);
    } else {
        // Real Firebase Listener
        const unsubscribe = auth.onAuthStateChanged((firebaseUser: any) => {
            if (firebaseUser) {
                setUser({
                    id: firebaseUser.uid,
                    name: firebaseUser.displayName || "Explorador",
                    email: firebaseUser.email || "",
                    avatarUrl: firebaseUser.photoURL || ""
                });
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }
  }, []);

  // FETCH MESSAGES
  useEffect(() => {
    const loadData = async () => {
        if (user && user.email) {
            const msgs = await fetchMessages(user.email);
            setMessages(msgs);
        } else {
            setMessages([]);
        }
    };
    loadData();
  }, [user]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3; 
      if (musicPlaying) {
        audioRef.current.play().catch(e => console.log("Autoplay prevented", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [musicPlaying]);

  useEffect(() => {
    const handleLockChange = () => {
      if (document.pointerLockElement === null) {
        setIsLocked(false);
      }
    };
    document.addEventListener('pointerlockchange', handleLockChange);
    return () => document.removeEventListener('pointerlockchange', handleLockChange);
  }, []);

  const isOverlayOpen = !!viewingMessage || isComposing || isTalkingToElf;

  useEffect(() => {
    if (isOverlayOpen) {
        document.exitPointerLock();
        setIsLocked(false);
    }
  }, [isOverlayOpen]);

  const handleOpenMessage = (msg: Message) => setViewingMessage(msg);
  
  const handleReply = (senderEmail: string) => {
      setViewingMessage(null);
      setReplyToEmail(senderEmail);
      setIsComposing(true);
  };

  const handleMessageSent = async () => {
    setIsComposing(false);
    setReplyToEmail('');
    // Refresh messages
    if (user && user.email) {
        const msgs = await fetchMessages(user.email);
        setMessages(msgs);
    }
  };

  const handleStartInteraction = () => {
    if (!user) return; // Don't lock if not logged in
    if (!musicPlaying) setMusicPlaying(true);
    if (!isOverlayOpen) setIsLocked(true);
  };

  const handleLogin = async () => {
      setLoading(true);
      await signInWithGoogle();
      // In real mode, listener handles it. In mock mode, the service reloads the page.
  };

  if (loading) {
    return (
      <div className="w-screen h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <Loader />
      </div>
    );
  }

  // LOGIN SCREEN
  if (!user) {
      return (
          <div className="w-full h-screen bg-[url('https://images.unsplash.com/photo-1544510802-549c8c6838d4?q=80&w=2000')] bg-cover bg-center flex items-center justify-center relative">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
              <div className="relative z-10 bg-white/10 border border-white/20 p-12 rounded-3xl text-center max-w-md shadow-2xl backdrop-blur-md">
                  <Trees className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
                  <h1 className="font-display text-5xl text-white mb-2">Bosque de la Gratitud</h1>
                  <p className="text-slate-200 font-serif mb-8 text-lg leading-relaxed">
                      Entra a un mundo mágico donde los mensajes vuelan como estrellas. Conéctate para recibir tus cartas.
                  </p>
                  
                  {useMock && (
                    <div className="mb-6 bg-yellow-500/20 border border-yellow-500/50 p-3 rounded-lg text-yellow-200 text-xs flex items-center gap-2 text-left">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>Modo Demo Activado: No se requiere configuración. Tus datos se guardarán solo en este navegador.</p>
                    </div>
                  )}

                  <button 
                    onClick={handleLogin}
                    className="w-full py-4 bg-white text-slate-900 font-bold text-lg rounded-full hover:bg-slate-100 hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-xl"
                  >
                      <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
                      {useMock ? "Entrar (Simulación)" : "Entrar con Google"}
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="w-full h-screen relative bg-slate-900 overflow-hidden selection:bg-yellow-500/30" 
         onClick={handleStartInteraction}>
      
      <audio ref={audioRef} src={MUSIC_URL} loop crossOrigin="anonymous" />

      <Experience 
        messages={messages} 
        onOpenMessage={handleOpenMessage} 
        isLocked={isLocked && !isOverlayOpen}
        onElfChatToggle={setIsTalkingToElf}
      />

      {/* Crosshair */}
      {isLocked && !isOverlayOpen && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40">
          <div className="w-2 h-2 bg-white/80 rounded-full shadow-[0_0_5px_white]"></div>
        </div>
      )}

      {/* Unlock Hint */}
      {!isLocked && !isOverlayOpen && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            {!viewingMessage && !isComposing && !isTalkingToElf && (
                <div className="bg-black/60 backdrop-blur-md p-6 rounded-xl text-center border border-white/10 animate-pulse pointer-events-none">
                    <MousePointer2 className="w-8 h-8 text-white mx-auto mb-2" />
                    <h2 className="text-xl text-white font-display">Clic para Explorar</h2>
                </div>
            )}
        </div>
      )}

      {/* HUD */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-30">
        <div className="flex justify-between items-start pointer-events-auto">
          <div className="flex items-center gap-3">
             {user.avatarUrl ? (
                 <img src={user.avatarUrl} className="w-10 h-10 rounded-full border-2 border-yellow-400" alt="User" />
             ) : (
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-yellow-400">
                    <UserIcon />
                </div>
             )}
             <div>
               <h1 className="font-display text-2xl text-white drop-shadow-lg">Bosque de la Gratitud</h1>
               <p className="text-white/60 text-xs font-serif">Hola, {user.name.split(' ')[0]}</p>
             </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); setMusicPlaying(!musicPlaying); }}
              className="p-2 text-white/50 hover:text-white transition-colors bg-black/20 rounded-full backdrop-blur-md hover:bg-black/40"
            >
              {musicPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); logout(); }}
                className="p-2 text-white/50 hover:text-red-400 transition-colors bg-black/20 rounded-full backdrop-blur-md hover:bg-black/40"
                title="Cerrar Sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!viewingMessage && !isComposing && !isTalkingToElf && (
            <div className="flex justify-center pointer-events-auto pb-8">
            <button 
                onClick={(e) => {
                e.stopPropagation();
                setReplyToEmail('');
                setIsComposing(true);
                }}
                className="group flex items-center gap-3 bg-gradient-to-r from-yellow-600 to-yellow-500 text-slate-900 px-8 py-4 rounded-full font-bold shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:shadow-[0_0_30px_rgba(234,179,8,0.6)] hover:scale-105 transition-all"
            >
                <PenTool className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span>Enviar Gratitud</span>
            </button>
            </div>
        )}
      </div>

      {/* Modals */}
      {viewingMessage && (
        <div className="relative z-50">
            <MessageViewer 
              message={viewingMessage} 
              onClose={() => setViewingMessage(null)} 
              onReply={handleReply}
            />
        </div>
      )}

      {isComposing && user && (
        <div className="relative z-50">
            <MessageComposer 
              user={user} 
              onClose={() => setIsComposing(false)}
              onSent={handleMessageSent}
              initialRecipient={replyToEmail}
            />
        </div>
      )}

      {isTalkingToElf && (
        <div className="relative z-50">
            <ElfChat onClose={() => setIsTalkingToElf(false)} />
        </div>
      )}
    </div>
  );
}
