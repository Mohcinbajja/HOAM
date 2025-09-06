
// Add libraries to the global scope for TypeScript
declare var XLSX: any;

/**
 * Prints a specific HTML element by opening it in a new window.
 * This method is robust against pop-up blockers (if called from a user event)
 * and ensures all styles and images are loaded before printing.
 * @param {string} elementId The ID of the element to print.
 * @returns {Promise<void>} A promise that resolves when the print dialog has been handled.
 */
export const printElementById = (elementId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const printElement = document.getElementById(elementId);
        if (!printElement) {
            const errorMsg = `[Print Utility] Element with id #${elementId} not found.`;
            console.error(errorMsg);
            return reject(new Error(errorMsg));
        }

        // 1. Open a new window immediately. It's crucial this is a direct result of a user click.
        const printWindow = window.open('', '_blank', 'width=1050,height=1485'); // A4-ish aspect ratio
        if (!printWindow) {
            // This can happen if pop-ups are aggressively blocked and the user denies permission.
            alert('Please allow pop-ups for this site to print the report.');
            return reject(new Error('Could not open print window. Please check your pop-up blocker.'));
        }

        const printDoc = printWindow.document;

        // 2. Gather all stylesheets from the main document's head.
        const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
            .map(el => el.outerHTML)
            .join('\n');

        // 3. Add print-specific CSS overrides for proper layout.
        const printOverrides = `
            <style>
                @page { 
                    size: A4; 
                    /* Set page margins to create space for the fixed header and footer */
                    margin: 3.5cm 1.27cm 4.5cm 1.27cm;
                }
                @page landscape { 
                    size: A4 landscape; 
                    margin: 3.5cm 1.27cm 4.5cm 1.27cm;
                }
                html, body {
                    margin: 0;
                    padding: 0;
                    /* Initialize CSS counters for page numbering */
                    counter-reset: page;
                }
                body { 
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    background-color: #fff !important;
                }
                
                /* Position header and footer to repeat on each page */
                .report-header-group {
                    position: fixed;
                    top: 0;
                    left: 1.27cm;
                    right: 1.27cm;
                    height: 3.5cm; /* Corresponds to top margin */
                }
                 .report-footer-group {
                    position: fixed;
                    bottom: 0;
                    left: 1.27cm;
                    right: 1.27cm;
                    height: 4.5cm; /* Corresponds to bottom margin */
                }

                /* Main content area styling */
                .report-page {
                    width: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    border: none !important;
                    box-shadow: none !important;
                    /* Remove flex layout for print to allow natural page flow */
                    display: block !important;
                }

                .report-landscape {
                    page: landscape;
                }

                /* Page numbering logic */
                .page-number-container {
                    text-align: right;
                    font-size: 0.8rem;
                    color: #4b5563; /* Tailwind gray-600 */
                }
                .page-number-container::after {
                    counter-increment: page;
                    /* Display page number as "X / Y" */
                    content: counter(page) " / " counter(pages);
                }
                
                /* Helper class to ensure dark text prints correctly */
                .dark-text-fix {
                    color: #000 !important;
                }

                /* Attempt to prevent elements from breaking across pages */
                table, tr, figure, .break-inside-avoid {
                    break-inside: avoid;
                }
            </style>
        `;

        // 4. Construct the full HTML to be written to the new window.
        const html = `
            <!DOCTYPE html>
            <html lang="${document.documentElement.lang}">
                <head>
                    <title>${document.title} - Print</title>
                    ${styles}
                    ${printOverrides}
                </head>
                <body>
                    ${printElement.outerHTML}
                </body>
            </html>
        `;

        // 5. Write the content and set up the print action on load.
        printDoc.write(html);
        printDoc.close(); // Important to fire the 'load' event.

        printWindow.addEventListener('load', () => {
            // A short timeout allows the browser to finish rendering images and applying styles
            // before the print dialog is shown.
            setTimeout(() => {
                try {
                    printWindow.focus(); // Focus is needed for some browsers
                    printWindow.print();
                    printWindow.close(); // The dialog is modal, so this will execute after it's closed
                } catch (e) {
                    console.error("[Print Utility] Print command failed.", e);
                    // Still try to clean up
                    printWindow.close();
                    reject(e);
                } finally {
                    resolve();
                }
            }, 500); // 500ms seems to be a reliable delay.
        });
    });
};


/**
 * Downloads a specific HTML element as a PDF.
 * @param {string} elementId The ID of the element to download.
 * @param {string} filename The desired filename for the PDF (without extension).
 * @param {'p' | 'l'} orientation Page orientation ('p' for portrait, 'l' for landscape).
 * @returns {Promise<void>}
 */
export const downloadElementAsPdf = async (elementId: string, filename: string, orientation: 'p' | 'l' = 'p'): Promise<void> => {
    const reportElement = document.getElementById(elementId);
    if (!reportElement) {
        console.error(`[PDF Export] Element with id #${elementId} not found.`);
        throw new Error(`Element with id #${elementId} not found.`);
    }

    try {
        const html2canvas = (window as any).html2canvas;
        const { jsPDF } = (window as any).jspdf;
        if (!html2canvas || !jsPDF) {
            throw new Error('PDF generation libraries not loaded.');
        }

        const canvas = await html2canvas(reportElement, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            width: reportElement.scrollWidth,
            height: reportElement.scrollHeight,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.9);
        const pdf = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasAspectRatio = canvas.width / canvas.height;
        
        let finalImgWidth = pdfWidth;
        let finalImgHeight = pdfWidth / canvasAspectRatio;

        if (finalImgHeight > pdfHeight) {
            finalImgHeight = pdfHeight;
            finalImgWidth = pdfHeight * canvasAspectRatio;
        }

        pdf.addImage(imgData, 'JPEG', 0, 0, finalImgWidth, finalImgHeight);
        pdf.save(`${filename}.pdf`);
    } catch (error) {
        console.error("Error generating PDF:", error);
        alert(`Sorry, there was an error generating the PDF.`);
        throw error;
    }
};

/**
 * Exports an array of data to a formatted XLSX file.
 * @param {string[]} headers The XLSX headers.
 * @param {(string|number)[][]} data The 2D array of data.
 * @param {string} filename The desired filename (without extension).
 * @param {string} sheetName The name for the worksheet.
 */
export const exportDataToXlsx = (headers: string[], data: (string | number)[][], filename: string, sheetName: string = 'Sheet1') => {
    if (typeof XLSX === 'undefined') {
        console.error("XLSX library is not loaded. Please include it in your project.");
        alert("Excel export functionality is currently unavailable.");
        return;
    }

    // Combine headers and data for the worksheet
    const worksheetData = [headers, ...data];

    // Create a new worksheet from the array of arrays
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // Auto-fit column widths for better readability
    const colWidths = headers.map((_, i) => {
        const maxLength = Math.max(
            headers[i] ? headers[i].length : 0,
            ...data.map(row => row[i] ? String(row[i]).length : 0)
        );
        return { wch: maxLength + 2 }; // +2 for a little padding
    });
    ws['!cols'] = colWidths;
    
    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Append the worksheet to the workbook with the specified sheet name
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Write the workbook and trigger the download of the .xlsx file
    XLSX.writeFile(wb, `${filename}.xlsx`);
};