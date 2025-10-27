import { Router } from 'express';
import speechController from '../controllers/speech.controller';
import { uploadAudio, handleUploadError } from '../middleware/upload';

const router = Router();

/**
 * Speech-to-Text Routes
 */

// Transcribe audio file
router.post(
  '/speech/transcribe',
  uploadAudio.single('audio'),
  handleUploadError,
  speechController.transcribe.bind(speechController)
);

// Transcribe audio from URL
router.post(
  '/speech/transcribe-url',
  speechController.transcribeFromUrl.bind(speechController)
);

// Send voice message in conversation
router.post(
  '/speech/voice-message',
  uploadAudio.single('audio'),
  handleUploadError,
  speechController.sendVoiceMessage.bind(speechController)
);

// Send voice message with streaming response
router.post(
  '/speech/voice-message/stream',
  uploadAudio.single('audio'),
  handleUploadError,
  speechController.sendVoiceMessageStream.bind(speechController)
);

// Get supported audio formats
router.get(
  '/speech/formats',
  speechController.getSupportedFormats.bind(speechController)
);

// Detect language from audio
router.post(
  '/speech/detect-language',
  uploadAudio.single('audio'),
  handleUploadError,
  speechController.detectLanguage.bind(speechController)
);

export default router;
