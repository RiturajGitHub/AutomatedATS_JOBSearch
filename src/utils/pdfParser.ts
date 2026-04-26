// PDF Parser using pdfjs-dist v3 (stable)
import * as pdfjsLib from 'pdfjs-dist';

// Use local worker from public folder (v3 uses .js extension)
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';
}

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    const loadingTask = pdfjsLib.getDocument({ 
      data: arrayBuffer,
      verbosity: 0,
    });
    
    const pdf = await loadingTask.promise;
    let fullText = '';
    const numPages = pdf.numPages;

    // Extract text from each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const items = textContent.items as any[];
      const pageText = items
        .filter((item: any) => item.str && item.str.trim())
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n';
    }

    await pdf.destroy();
    
    if (!fullText.trim()) {
      throw new Error('No text content found in PDF. It may be an image-based (scanned) PDF.');
    }
    
    return fullText.trim();
  } catch (error: any) {
    console.error('PDF extraction error:', error);
    
    if (error.message?.includes('Invalid PDF')) {
      throw new Error('Invalid PDF file. The file may be corrupted.');
    } else if (error.message?.includes('password')) {
      throw new Error('This PDF is password-protected. Please remove the password first.');
    } else if (error.message?.includes('No text content')) {
      throw new Error('This appears to be a scanned/image PDF with no extractable text.');
    } else {
      throw new Error(`PDF parsing failed: ${error.message || 'Unknown error'}`);
    }
  }
}

export async function extractTextFromFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  try {
    if (extension === 'pdf') {
      return await extractTextFromPDF(file);
    } else if (extension === 'txt') {
      return await file.text();
    } else if (extension === 'docx' || extension === 'doc') {
      // For docx we'll use mammoth
      try {
        const mammoth = await import('mammoth');
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
      } catch (docxError) {
        console.error('DOCX extraction error:', docxError);
        throw new Error('Failed to extract text from DOCX file. Please try converting to PDF or TXT.');
      }
    }

    throw new Error(`Unsupported file type: ${extension}. Please upload PDF, DOCX, DOC, or TXT files.`);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while processing your file.');
  }
}
