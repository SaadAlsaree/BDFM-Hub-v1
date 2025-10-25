#!/usr/bin/env tsx

/**
 * Sync script to manually synchronize correspondences from PostgreSQL to Qdrant
 */

import dotenv from 'dotenv';
import syncService from '../services/sync.service';
import qdrantService from '../services/qdrant.service';
import logger from '../utils/logger';

// Load environment variables
dotenv.config();

interface SyncOptions {
  type: 'full' | 'incremental';
  batchSize?: number;
  fromDate?: string;
  rebuild?: boolean;
}

async function parseArgs(): Promise<SyncOptions> {
  const args = process.argv.slice(2);
  const options: SyncOptions = {
    type: 'full',
    batchSize: 100,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--type':
      case '-t':
        options.type = args[++i] as 'full' | 'incremental';
        break;
      case '--batch-size':
      case '-b':
        options.batchSize = parseInt(args[++i], 10);
        break;
      case '--from-date':
      case '-f':
        options.fromDate = args[++i];
        break;
      case '--rebuild':
      case '-r':
        options.rebuild = true;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
      default:
        logger.warn(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function printHelp(): void {
  console.log(`
BDFM RAG Sync Script

Usage:
  npm run sync [options]

Options:
  -t, --type <type>          Sync type: 'full' or 'incremental' (default: full)
  -b, --batch-size <size>    Batch size (default: 100)
  -f, --from-date <date>     Sync from date (for incremental sync)
  -r, --rebuild              Rebuild index (delete and re-sync all)
  -h, --help                 Show this help message

Examples:
  npm run sync                                    # Full sync
  npm run sync -- -t incremental -f 2025-01-01  # Incremental from date
  npm run sync -- -b 50                          # Full sync with batch size 50
  npm run sync -- --rebuild                      # Rebuild entire index
  `);
}

async function main(): Promise<void> {
  try {
    logger.info('Starting sync script...');

    const options = await parseArgs();

    // Initialize Qdrant
    await qdrantService.initialize();

    if (options.rebuild) {
      logger.info('Rebuilding index...');
      const result = await syncService.rebuildIndex();
      logger.info('Rebuild result:', result);
    } else {
      logger.info(`Starting ${options.type} sync...`);
      const result = await syncService.syncCorrespondences(options);
      logger.info('Sync result:', result);
    }

    logger.info('Sync script completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Sync script failed:', error);
    process.exit(1);
  }
}

// Run the script
main();
