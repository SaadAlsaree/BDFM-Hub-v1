import { Router } from 'express';
import ragController from '../controllers/rag.controller';

const router = Router();

// RAG Routes
router.post('/query', (req, res) => ragController.query(req, res));
router.post('/query/stream', (req, res) => ragController.queryStream(req, res));
router.post('/search', (req, res) => ragController.search(req, res));

// Sync Routes
router.post('/sync', (req, res) => ragController.sync(req, res));
router.post('/index', (req, res) => ragController.indexCorrespondence(req, res));
router.delete('/correspondence/:correspondenceId', (req, res) =>
  ragController.deleteCorrespondence(req, res)
);
router.post('/rebuild', (req, res) => ragController.rebuildIndex(req, res));
router.post('/remove-duplicates', (req, res) => ragController.removeDuplicates(req, res));
router.post('/fix-dimensions', (req, res) => ragController.fixDimensions(req, res));

// Status Routes
router.get('/status', (req, res) => ragController.getStatus(req, res));
router.get('/sync/stats', (req, res) => ragController.getSyncStats(req, res));

// Qdrant Data Routes
router.get('/collections', (req, res) => ragController.getAllCollections(req, res));
router.get('/collections/:collection', (req, res) => ragController.getQdrantData(req, res));
router.get('/collections/:collection/stats', (req, res) => ragController.getCollectionStats(req, res));

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
