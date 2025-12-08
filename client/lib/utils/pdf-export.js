/**
 * Export HTML element to PDF
 * @param {HTMLElement} element - The element to export
 * @param {string} filename - The filename for the PDF
 * @param {Object} options - Additional options for PDF generation
 * @returns {Promise<void>}
 */
export async function exportToPDF(element, filename = "resume.pdf", options = {}) {
  // Dynamic import to avoid SSR issues
  const html2pdf = (await import("html2pdf.js")).default;
  
  const defaultOptions = {
    margin: 0,
    filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      letterRendering: true,
    },
    jsPDF: { 
      unit: "in", 
      format: "letter", 
      orientation: "portrait" 
    },
  };

  const mergedOptions = { ...defaultOptions, ...options };

  try {
    await html2pdf().set(mergedOptions).from(element).save();
    return { success: true };
  } catch (error) {
    console.error("PDF export failed:", error);
    throw new Error("Failed to export PDF. Please try again.");
  }
}

/**
 * Generate PDF blob without downloading
 * @param {HTMLElement} element - The element to export
 * @param {Object} options - Additional options for PDF generation
 * @returns {Promise<Blob>}
 */
export async function generatePDFBlob(element, options = {}) {
  // Dynamic import to avoid SSR issues
  const html2pdf = (await import("html2pdf.js")).default;
  
  const defaultOptions = {
    margin: 0,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      letterRendering: true,
    },
    jsPDF: { 
      unit: "in", 
      format: "letter", 
      orientation: "portrait" 
    },
  };

  const mergedOptions = { ...defaultOptions, ...options };

  try {
    const pdf = await html2pdf().set(mergedOptions).from(element).output("blob");
    return pdf;
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw new Error("Failed to generate PDF. Please try again.");
  }
}
