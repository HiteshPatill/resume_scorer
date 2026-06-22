const MAX_PDF_PAGES = 50;
const MAX_TEXT_LENGTH = 50000;

// Type for PDF text items
interface PDFTextItem {
  str: string;
}

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Dynamic import to avoid SSR issues with DOMMatrix
    const pdfjsLib = await import('pdfjs-dist');
    
    // Set up the worker for client-side usage - use local worker file
    if (typeof window !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    if (pdf.numPages > MAX_PDF_PAGES) {
      throw new Error(`PDF exceeds ${MAX_PDF_PAGES} page limit. Please use a shorter document.`);
    }
    
    let fullText = '';
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = (textContent.items as PDFTextItem[])
        .map((item) => (typeof item.str === 'string' ? item.str : ''))
        .join(' ');
      fullText += pageText + '\n';
      
      // Check if we've exceeded max length
      if (fullText.length > MAX_TEXT_LENGTH) {
        throw new Error(`Extracted text exceeds ${MAX_TEXT_LENGTH} character limit. Please use a shorter resume.`);
      }
    }
    
    const trimmedText = fullText.trim();
    if (!trimmedText) {
      throw new Error('No text found in PDF. Please ensure the PDF contains readable text (not scanned images).');
    }
    
    return trimmedText;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Extracted text exceeds')) {
      throw error;
    }
    if (error instanceof Error && error.message.includes('PDF exceeds')) {
      throw error;
    }
    if (error instanceof Error && error.message.includes('No text found')) {
      throw error;
    }
    console.error('Error extracting PDF text:', error);
    throw new Error('Failed to extract text from PDF. Please ensure it is a valid, text-based PDF file (not a scanned image).');
  }
}

export async function extractTextFromFile(file: File): Promise<string> {
  if (file.type === 'application/pdf') {
    return extractTextFromPDF(file);
  } else if (file.type === 'text/plain') {
    try {
      const text = await file.text();
      const trimmedText = text.trim();
      
      if (!trimmedText) {
        throw new Error('The file is empty. Please provide a file with resume content.');
      }
      
      if (trimmedText.length > MAX_TEXT_LENGTH) {
        throw new Error(`File exceeds ${MAX_TEXT_LENGTH} character limit. Please use a shorter resume.`);
      }
      
      return trimmedText;
    } catch (error) {
      if (error instanceof Error && (error.message.includes('empty') || error.message.includes('exceeds'))) {
        throw error;
      }
      throw new Error('Failed to read text file. Please ensure it is a valid text file.');
    }
  } else {
    throw new Error('Unsupported file format. Please use PDF or TXT files only.');
  }
}
