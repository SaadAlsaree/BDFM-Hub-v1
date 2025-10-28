import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import AIAssistantService from '../api/ai-assistant.service';

interface UseVoiceInputOptions {
  onTranscript?: (text: string) => void;
  language?: 'ar' | 'en' | 'auto';
  autoSend?: boolean;
}

export function useVoiceInput(options: UseVoiceInputOptions = {}) {
  const { onTranscript, language = 'auto', autoSend = false } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  /**
   * Start recording audio
   */
  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setTranscript(null);

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Setup audio context for visualizing levels
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // Monitor audio levels
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      const updateAudioLevel = () => {
        if (analyserRef.current && isRecording) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average / 255); // Normalize to 0-1
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };
      updateAudioLevel();

      // Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop audio context
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }

        // Create audio blob
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType
        });

        // Transcribe audio
        await transcribeAudio(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setAudioLevel(0);
    } catch (err: any) {
      const errorMsg =
        err.name === 'NotAllowedError'
          ? 'يجب السماح بالوصول للميكروفون'
          : 'فشل في بدء التسجيل';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  }, [isRecording]);

  /**
   * Stop recording audio
   */
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioLevel(0);
    }
  }, [isRecording]);

  /**
   * Transcribe audio blob
   */
  const transcribeAudio = useCallback(
    async (audioBlob: Blob) => {
      try {
        setIsTranscribing(true);
        setError(null);

        // Convert blob to file
        const audioFile = new File([audioBlob], 'recording.webm', {
          type: audioBlob.type
        });

        // Transcribe
        const result = await AIAssistantService.transcribeAudio(
          audioFile,
          language
        );

        if (result.text && result.text.trim()) {
          setTranscript(result.text);
          onTranscript?.(result.text);
          toast.success('تم تحويل الصوت بنجاح');
        } else {
          throw new Error('لم يتم اكتشاف أي نص');
        }
      } catch (err: any) {
        const errorMsg = err.message || 'فشل في تحويل الصوت إلى نص';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsTranscribing(false);
      }
    },
    [language, onTranscript]
  );

  /**
   * Transcribe audio file
   */
  const transcribeFile = useCallback(
    async (file: File) => {
      try {
        setIsTranscribing(true);
        setError(null);
        setTranscript(null);

        const result = await AIAssistantService.transcribeAudio(file, language);

        if (result.text && result.text.trim()) {
          setTranscript(result.text);
          onTranscript?.(result.text);
          toast.success('تم تحويل الملف الصوتي بنجاح');
        } else {
          throw new Error('لم يتم اكتشاف أي نص');
        }
      } catch (err: any) {
        const errorMsg = err.message || 'فشل في تحويل الملف الصوتي';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsTranscribing(false);
      }
    },
    [language, onTranscript]
  );

  /**
   * Clear transcript
   */
  const clearTranscript = useCallback(() => {
    setTranscript(null);
    setError(null);
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRecording]);

  return {
    isRecording,
    isTranscribing,
    transcript,
    error,
    audioLevel,
    startRecording,
    stopRecording,
    transcribeFile,
    clearTranscript,
    isSupported:
      typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia
  };
}
