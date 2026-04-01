const PDFDocument = require('pdfkit');

const formatDate = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return new Date().toLocaleDateString();
  return date.toLocaleDateString();
};

const drawHeader = (doc) => {
  doc.rect(40, 40, doc.page.width - 80, 88).fill('#f8fafc').stroke('#e2e8f0');

  doc
    .fillColor('#0f172a')
    .fontSize(18)
    .font('Helvetica-Bold')
    .text('College Document Management System', 56, 62, { align: 'left' });

  doc
    .fontSize(11)
    .font('Helvetica')
    .fillColor('#475569')
    .text('Official Academic Document', 56, 88)
    .text(`Generated on: ${new Date().toLocaleString()}`, 56, 104);

  doc
    .moveTo(40, 138)
    .lineTo(doc.page.width - 40, 138)
    .lineWidth(1)
    .strokeColor('#cbd5e1')
    .stroke();
};

const drawSectionBox = (doc, top, title, lines) => {
  const boxHeight = 34 + lines.length * 22;

  doc.rect(48, top, doc.page.width - 96, boxHeight).lineWidth(1).strokeColor('#e2e8f0').stroke();

  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .fillColor('#111827')
    .text(title, 62, top + 12);

  let currentY = top + 36;
  doc.font('Helvetica').fontSize(11).fillColor('#334155');

  lines.forEach(({ label, value }) => {
    doc
      .font('Helvetica-Bold')
      .text(`${label}:`, 62, currentY, { continued: true })
      .font('Helvetica')
      .text(` ${value}`);
    currentY += 22;
  });

  return top + boxHeight + 18;
};

const drawFooter = (doc, approvalAuthority) => {
  const footerTop = doc.page.height - 140;

  doc
    .moveTo(52, footerTop)
    .lineTo(doc.page.width - 52, footerTop)
    .lineWidth(1)
    .strokeColor('#cbd5e1')
    .stroke();

  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor('#475569')
    .text('Authorized Signature', doc.page.width - 200, footerTop + 14, { width: 140, align: 'center' })
    .moveTo(doc.page.width - 200, footerTop + 48)
    .lineTo(doc.page.width - 60, footerTop + 48)
    .lineWidth(0.8)
    .strokeColor('#94a3b8')
    .stroke();

  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor('#1e293b')
    .text(approvalAuthority, doc.page.width - 220, footerTop + 54, {
      width: 170,
      align: 'center'
    });

  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor('#64748b')
    .text('This is a system-generated document and does not require a physical seal.', 52, footerTop + 80, {
      width: doc.page.width - 104,
      align: 'center'
    });
};

const generateDocumentPDF = ({ studentName, documentType, authorityName, approvedDate }) => {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const chunks = [];

  return new Promise((resolve, reject) => {
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    drawHeader(doc);

    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .fillColor('#0f172a')
      .text(`${documentType} Certificate`, 40, 158, { align: 'center' });

    let cursorY = 194;

    cursorY = drawSectionBox(doc, cursorY, 'Student Details', [
      { label: 'Student Name', value: studentName },
      { label: 'Document Type', value: documentType }
    ]);

    cursorY = drawSectionBox(doc, cursorY, 'Approval Details', [
      { label: 'Approval Date', value: formatDate(approvedDate) },
      { label: 'Approved By', value: authorityName }
    ]);

    doc
      .font('Helvetica')
      .fontSize(11)
      .fillColor('#334155')
      .text(
        'This certifies that the above information has been verified and approved by the respective authority.',
        52,
        cursorY + 4,
        { width: doc.page.width - 104, align: 'left', lineGap: 4 }
      );

    drawFooter(doc, authorityName);
    doc.end();
  });
};

module.exports = { generateDocumentPDF };
