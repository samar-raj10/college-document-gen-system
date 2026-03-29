const PDFDocument = require('pdfkit');

const generateDocumentPDF = ({ studentName, documentType, authorityName, approvedDate }) => {
  const doc = new PDFDocument();
  const chunks = [];

  return new Promise((resolve, reject) => {
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).text('College Document Management System', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(`Official ${documentType} Document`, { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(12);
    doc.text(`Student Name: ${studentName}`);
    doc.text(`Document Type: ${documentType}`);
    doc.text(`Date: ${new Date(approvedDate).toLocaleDateString()}`);
    doc.text(`Approved By: ${authorityName}`);

    doc.moveDown(2);
    doc.text('This is a system-generated official document.', { align: 'left' });
    doc.end();
  });
};

module.exports = { generateDocumentPDF };
