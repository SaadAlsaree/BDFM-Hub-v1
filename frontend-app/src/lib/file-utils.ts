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

/**
 * Get MIME type from file extension
 * @param extension - File extension (e.g., '.pdf', '.jpg')
 * @returns MIME type string
 */
export function getMimeTypeFromExtension(extension: string): string {
  const ext = extension.toLowerCase().replace('.', '');
  
  const mimeTypes: Record<string, string> = {
    // Images
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    bmp: 'image/bmp',
    svg: 'image/svg+xml',
    webp: 'image/webp',
    
    // Videos
    mp4: 'video/mp4',
    avi: 'video/x-msvideo',
    mov: 'video/quicktime',
    wmv: 'video/x-ms-wmv',
    flv: 'video/x-flv',
    webm: 'video/webm',
    mkv: 'video/x-matroska',
    
    // Audio
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    flac: 'audio/flac',
    aac: 'audio/aac',
    m4a: 'audio/mp4',
    
    // Documents
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    txt: 'text/plain',
    rtf: 'application/rtf',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    
    // Other
    zip: 'application/zip',
    json: 'application/json',
    xml: 'application/xml',
    html: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Print file from base64 string
 * @param base64 - Base64 encoded file content
 * @param filename - File name
 * @param mimeType - MIME type of the file
 * @param extension - File extension
 * @returns Promise that resolves when print dialog is shown
 */
export async function printFileFromBase64(
  base64: string,
  filename: string,
  mimeType: string,
  extension: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Convert base64 to blob
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);

      // Handle PDF files
      if (extension.toLowerCase() === '.pdf') {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        iframe.src = blobUrl;
        
        document.body.appendChild(iframe);
        
        iframe.onload = () => {
          setTimeout(() => {
            try {
              iframe.contentWindow?.focus();
              iframe.contentWindow?.print();
              
              // Clean up after printing
              setTimeout(() => {
                document.body.removeChild(iframe);
                URL.revokeObjectURL(blobUrl);
                resolve();
              }, 1000);
            } catch (error) {
              document.body.removeChild(iframe);
              URL.revokeObjectURL(blobUrl);
              reject(error);
            }
          }, 250);
        };
        
        iframe.onerror = () => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(blobUrl);
          reject(new Error('Failed to load PDF for printing'));
        };
        
        return;
      }

      // Handle image files
      if (mimeType.startsWith('image/')) {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          URL.revokeObjectURL(blobUrl);
          reject(new Error('Popup blocked. Please allow popups to print.'));
          return;
        }

        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Print ${filename}</title>
              <style>
                body {
                  margin: 0;
                  padding: 0;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                  background: white;
                }
                img {
                  max-width: 100%;
                  max-height: 100vh;
                  object-fit: contain;
                }
              </style>
            </head>
            <body>
              <img src="${blobUrl}" alt="${filename}" onload="window.print(); setTimeout(() => window.close(), 1000);" />
            </body>
          </html>
        `);
        printWindow.document.close();
        
        // Clean up after printing
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
          resolve();
        }, 2000);
        
        return;
      }

      // Handle text files
      if (mimeType.startsWith('text/') || extension.toLowerCase() === '.txt') {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          URL.revokeObjectURL(blobUrl);
          reject(new Error('Popup blocked. Please allow popups to print.'));
          return;
        }

        // Read text content from blob
        const reader = new FileReader();
        reader.onload = (e) => {
          const textContent = e.target?.result as string;
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Print ${filename}</title>
                <style>
                  body {
                    margin: 20px;
                    font-family: 'Courier New', monospace;
                    font-size: 12pt;
                    line-height: 1.6;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                  }
                </style>
              </head>
              <body>
                <pre>${textContent}</pre>
                <script>
                  window.onload = function() {
                    window.print();
                    setTimeout(() => window.close(), 1000);
                  };
                </script>
              </body>
            </html>
          `);
          printWindow.document.close();
          
          setTimeout(() => {
            URL.revokeObjectURL(blobUrl);
            resolve();
          }, 2000);
        };
        
        reader.onerror = () => {
          URL.revokeObjectURL(blobUrl);
          reject(new Error('Failed to read file content'));
        };
        
        reader.readAsText(blob);
        return;
      }

      // For other file types, show a message or download
      URL.revokeObjectURL(blobUrl);
      reject(new Error(`Printing is not supported for ${extension} files. Please download the file instead.`));
    } catch (error) {
      reject(error);
    }
  });
}