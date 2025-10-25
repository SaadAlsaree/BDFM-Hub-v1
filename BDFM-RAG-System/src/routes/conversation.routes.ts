import { Router } from 'express';
import conversationController from '../controllers/conversation.controller';

const router = Router();

// Conversation Management
router.post('/conversations', (req, res) =>
  conversationController.createConversation(req, res)
);
router.get('/conversations', (req, res) =>
  conversationController.listConversations(req, res)
);
router.get('/conversations/:id', (req, res) =>
  conversationController.getConversation(req, res)
);
router.put('/conversations/:id/title', (req, res) =>
  conversationController.updateTitle(req, res)
);
router.delete('/conversations/:id', (req, res) =>
  conversationController.deleteConversation(req, res)
);

// Message Handling
router.post('/conversations/message', (req, res) =>
  conversationController.sendMessage(req, res)
);
router.post('/conversations/message/stream', (req, res) =>
  conversationController.sendMessageStream(req, res)
);

export default router;
