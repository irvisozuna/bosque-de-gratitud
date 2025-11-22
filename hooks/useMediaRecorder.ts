
import { useState, useRef } from 'react';

export const useMediaRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async (type: 'audio' | 'video') => {
    try {
      setError(null);
      setMediaBlob(null);
      setMediaUrl(null);
      chunksRef.current = [];

      const constraints = {
        audio: true,
        video: type === 'video' ? { width: 640, height: 480, facingMode: "user" } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Prefer vp8/webm for compatibility
      let options = {};
      if (MediaRecorder.isTypeSupported('video/webm; codecs=vp8,opus')) {
        options = { mimeType: 'video/webm; codecs=vp8,opus' };
      } else if (MediaRecorder.isTypeSupported('video/mp4')) {
         options = { mimeType: 'video/mp4' };
      }

      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: type === 'video' ? 'video/webm' : 'audio/webm' });
        setMediaBlob(blob);
        setMediaUrl(URL.createObjectURL(blob));
        
        // Stop all tracks to release camera/mic
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing media devices:", err);
      setError("No se pudo acceder al micrófono o cámara. Verifica permisos.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const resetRecording = () => {
    setMediaBlob(null);
    setMediaUrl(null);
    setError(null);
  };

  return {
    isRecording,
    mediaBlob,
    mediaUrl,
    error,
    startRecording,
    stopRecording,
    resetRecording
  };
};
