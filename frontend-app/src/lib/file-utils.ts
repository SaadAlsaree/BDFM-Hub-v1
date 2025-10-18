/**
 * Format file size in bytes to human readable format
 * @param bytes - File size in bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Get file extension from filename
 * @param filename - The filename
 * @returns File extension with dot (e.g., '.pdf')
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot === -1 ? '' : filename.substring(lastDot);
}

/**
 * Get filename without extension
 * @param filename - The filename
 * @returns Filename without extension
 */
export function getFileNameWithoutExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot === -1 ? filename : filename.substring(0, lastDot);
}

/**
 * Check if file type is an image
 * @param extension - File extension
 * @returns Boolean indicating if file is an image
 */
export function isImageFile(extension: string): boolean {
  const imageExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.bmp',
    '.svg',
    '.webp'
  ];
  return imageExtensions.includes(extension.toLowerCase());
}

/**
 * Check if file type is a video
 * @param extension - File extension
 * @returns Boolean indicating if file is a video
 */
export function isVideoFile(extension: string): boolean {
  const videoExtensions = [
    '.mp4',
    '.avi',
    '.mov',
    '.wmv',
    '.flv',
    '.webm',
    '.mkv'
  ];
  return videoExtensions.includes(extension.toLowerCase());
}

/**
 * Check if file type is an audio file
 * @param extension - File extension
 * @returns Boolean indicating if file is an audio file
 */
export function isAudioFile(extension: string): boolean {
  const audioExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a'];
  return audioExtensions.includes(extension.toLowerCase());
}

/**
 * Check if file type is a document
 * @param extension - File extension
 * @returns Boolean indicating if file is a document
 */
export function isDocumentFile(extension: string): boolean {
  const documentExtensions = [
    '.pdf',
    '.doc',
    '.docx',
    '.txt',
    '.rtf',
    '.xls',
    '.xlsx',
    '.ppt',
    '.pptx'
  ];
  return documentExtensions.includes(extension.toLowerCase());
}

/**
 * Convert bytes to base64 data URL
 * @param bytes - File bytes
 * @param mimeType - MIME type of the file
 * @returns Base64 data URL
 */
export function bytesToDataURL(bytes: Uint8Array, mimeType: string): string {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join(
    ''
  );
  const base64 = btoa(binary);
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Download file from base64 string
 * @param base64 - Base64 encoded file content
 * @param filename - Desired filename
 * @param mimeType - MIME type of the file
 */
export function downloadFileFromBase64(
  base64: string,
  filename: string,
  mimeType: string
): void {
  const link = document.createElement('a');
  link.href = `data:${mimeType};base64,${base64}`;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generate a safe filename by removing special characters
 * @param filename - Original filename
 * @returns Safe filename
 */
export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-z0-9.-]/gi, '_');
}
