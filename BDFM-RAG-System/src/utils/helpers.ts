/**
 * Text chunking helper function
 */
export function chunkText(
  text: string,
  chunkSize: number = 500,
  overlap: number = 50
): string[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const chunks: string[] = [];

  // Split by sentences for Arabic and English
  const sentences = text.split(/[.!?؟!。]/);
  let currentChunk = '';

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) continue;

    // If adding this sentence would exceed chunk size
    if (currentChunk.length + trimmedSentence.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());

      // Apply overlap by keeping last part of the chunk
      if (overlap > 0 && currentChunk.length > overlap) {
        currentChunk = currentChunk.slice(-overlap);
      } else {
        currentChunk = '';
      }
    }

    currentChunk += (currentChunk ? ' ' : '') + trimmedSentence;
  }

  // Add the last chunk
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  // If no chunks were created (no sentence delimiters), split by character count
  if (chunks.length === 0 && text.length > chunkSize) {
    for (let i = 0; i < text.length; i += chunkSize - overlap) {
      const end = Math.min(i + chunkSize, text.length);
      chunks.push(text.substring(i, end));
    }
  } else if (chunks.length === 0) {
    chunks.push(text);
  }

  return chunks;
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(vectorA: number[], vectorB: number[]): number {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    magnitudeA += vectorA[i] * vectorA[i];
    magnitudeB += vectorB[i] * vectorB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Format duration in milliseconds to human-readable format
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(2)}s`;
  } else {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}m ${seconds}s`;
  }
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        const delay = delayMs * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Sanitize text for embedding
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n+/g, ' ') // Replace newlines with space
    .trim();
}

/**
 * Extract highlights from text based on query
 */
export function extractHighlights(
  text: string,
  query: string,
  maxLength: number = 200
): string[] {
  const highlights: string[] = [];
  const queryTerms = query.toLowerCase().split(' ');
  const sentences = text.split(/[.!?؟!。]/);

  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase();
    const matchCount = queryTerms.filter((term) =>
      lowerSentence.includes(term)
    ).length;

    if (matchCount > 0) {
      let highlight = sentence.trim();
      if (highlight.length > maxLength) {
        highlight = highlight.substring(0, maxLength) + '...';
      }
      highlights.push(highlight);
    }

    if (highlights.length >= 3) break;
  }

  return highlights;
}

/**
 * Validate UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Convert PostgreSQL date to string
 */
export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    return date;
  }
  return date.toISOString().split('T')[0];
}

/**
 * Generate deterministic ID for embedding based on correspondence ID and chunk index
 * This ensures the same correspondence chunk always gets the same ID
 * Uses UUID v5-like approach to create valid UUIDs from deterministic input
 */
export function generateDeterministicId(
  correspondenceId: string,
  chunkIndex: number
): string {
  // Create a deterministic string combining correspondence ID and chunk index
  const input = `${correspondenceId}-chunk-${chunkIndex}`;

  // Generate a deterministic hash
  const hash = deterministicHash(input);

  // Convert hash to UUID format (8-4-4-4-12 format)
  // This ensures compatibility with Qdrant which expects UUID format
  const uuid = [
    hash.substring(0, 8),
    hash.substring(8, 12),
    hash.substring(12, 16),
    hash.substring(16, 20),
    hash.substring(20, 32)
  ].join('-');

  return uuid;
}

/**
 * Generate deterministic hash from string
 * Returns a 32-character hexadecimal string
 */
function deterministicHash(str: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;

  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  // Combine and convert to hex, pad to 32 characters
  const hash1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hash2 = (h2 >>> 0).toString(16).padStart(8, '0');

  // Create 32-character hex string by repeating the hash pattern
  return (hash1 + hash2 + hash1 + hash2).substring(0, 32);
}

/**
 * Simple hash function for creating short deterministic IDs
 */
export function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}