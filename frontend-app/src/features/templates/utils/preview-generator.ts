import html2canvas from 'html2canvas';

export async function generatePreviewImage(
  pdfElement: HTMLElement
): Promise<Blob> {
  try {
    const canvas = await html2canvas(pdfElement, {
      scale: 2,
      useCORS: true,
      logging: false
    });

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          }
        },
        'image/jpeg',
        0.95
      );
    });
  } catch (error) {
    console.error('Error generating preview:', error);
    throw error;
  }
}
