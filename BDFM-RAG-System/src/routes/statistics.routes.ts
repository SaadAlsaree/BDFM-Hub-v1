import { Router } from 'express';
import statisticsController from '../controllers/statistics.controller';

const router = Router();

/**
 * Statistics Routes
 */

// Correspondence Statistics
router.get(
  '/statistics/correspondences/overview',
  statisticsController.getCorrespondenceOverview.bind(statisticsController)
);

router.get(
  '/statistics/correspondences/time-series',
  statisticsController.getCorrespondenceTimeSeries.bind(statisticsController)
);

// Workflow Statistics
router.get(
  '/statistics/workflow/overview',
  statisticsController.getWorkflowOverview.bind(statisticsController)
);

router.get(
  '/statistics/workflow/tracking/:correspondenceId',
  statisticsController.getWorkflowTracking.bind(statisticsController)
);

router.get(
  '/statistics/workflow/overdue',
  statisticsController.getOverdueWorkflowSteps.bind(statisticsController)
);

// Reports
router.get(
  '/statistics/reports/performance',
  statisticsController.getPerformanceReport.bind(statisticsController)
);

router.get(
  '/statistics/users/:userId/productivity',
  statisticsController.getUserProductivity.bind(statisticsController)
);

// Cache Management
router.post(
  '/statistics/cache/clear',
  statisticsController.clearCache.bind(statisticsController)
);

export default router;
