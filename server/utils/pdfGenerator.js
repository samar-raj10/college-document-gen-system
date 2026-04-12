const PDFDocument = require('pdfkit');

const formatDate = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return new Date().toLocaleDateString();
  return date.toLocaleDateString();
};

const drawCommonHeader = (doc, title, subtitle) => {
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
    .text(title, 56, 88)
    .text(subtitle, 56, 104);
  doc.moveTo(40, 138).lineTo(doc.page.width - 40, 138).lineWidth(1).strokeColor('#cbd5e1').stroke();
};

const drawCommonFooter = (doc, authorityName) => {
  const footerTop = doc.page.height - 128;
  doc.moveTo(52, footerTop).lineTo(doc.page.width - 52, footerTop).lineWidth(1).strokeColor('#cbd5e1').stroke();
  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor('#475569')
    .text('Authorized Signature', doc.page.width - 210, footerTop + 14, { width: 150, align: 'center' });
  doc.moveTo(doc.page.width - 205, footerTop + 48).lineTo(doc.page.width - 60, footerTop + 48).lineWidth(0.8).strokeColor('#94a3b8').stroke();
  doc.font('Helvetica-Bold').fontSize(10).fillColor('#1e293b').text(authorityName, doc.page.width - 220, footerTop + 56, { width: 170, align: 'center' });
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

const drawBonafideTemplate = (doc, data) => {
  drawCommonHeader(doc, 'Bonafide Certificate', `Generated on: ${new Date().toLocaleString()}`);
  doc.font('Helvetica-Bold').fontSize(19).fillColor('#0f172a').text('BONAFIDE CERTIFICATE', 40, 168, { align: 'center' });
  doc
    .font('Helvetica')
    .fontSize(12)
    .fillColor('#334155')
    .text(
      `This is to certify that ${data.studentName} is a bona fide student of this institution. This certificate is issued for official academic purposes on ${formatDate(data.approvedDate)}.`,
      58,
      230,
      { width: doc.page.width - 116, align: 'justify', lineGap: 5 }
    );
  drawCommonFooter(doc, data.authorityName);
};

const drawLorTemplate = (doc, data) => {
  drawCommonHeader(doc, 'Letter of Recommendation', `Prepared on: ${new Date().toLocaleString()}`);
  doc.font('Helvetica-Bold').fontSize(18).fillColor('#0f172a').text('LETTER OF RECOMMENDATION', 40, 166, { align: 'center' });
  doc.rect(52, 212, doc.page.width - 104, 190).lineWidth(1).strokeColor('#e2e8f0').stroke();
  doc
    .font('Helvetica')
    .fontSize(11.5)
    .fillColor('#334155')
    .text(
      `I am pleased to recommend ${data.studentName} based on their academic performance, discipline, and participation in departmental activities. The student has demonstrated sincerity, consistency, and leadership qualities throughout the course duration.\n\nThis recommendation is issued on ${formatDate(data.approvedDate)} for higher studies / official applications.`,
      68,
      232,
      { width: doc.page.width - 136, align: 'justify', lineGap: 4 }
    );
  drawCommonFooter(doc, data.authorityName);
};

const drawNocTemplate = (doc, data) => {
  drawCommonHeader(doc, 'No Objection Certificate', `Reference date: ${formatDate(data.approvedDate)}`);
  doc.font('Helvetica-Bold').fontSize(18).fillColor('#0f172a').text('NO OBJECTION CERTIFICATE (NOC)', 40, 166, { align: 'center' });
  let y = drawSectionBox(doc, 214, 'Certificate Holder', [
    { label: 'Student Name', value: data.studentName },
    { label: 'Issued Date', value: formatDate(data.approvedDate) }
  ]);
  doc
    .font('Helvetica')
    .fontSize(11.5)
    .fillColor('#334155')
    .text(
      'This is to state that the institution has no objection to the above student for the purpose stated in the submitted request.',
      52,
      y + 6,
      { width: doc.page.width - 104, align: 'left' }
    );
  drawCommonFooter(doc, data.authorityName);
};

const drawNoDuesTemplate = (doc, data) => {
  drawCommonHeader(doc, 'No Dues Clearance', `Cleared on: ${formatDate(data.approvedDate)}`);
  doc.font('Helvetica-Bold').fontSize(19).fillColor('#0f172a').text('NO DUES CERTIFICATE', 40, 164, { align: 'center' });
  doc.rect(52, 208, doc.page.width - 104, 212).lineWidth(1).strokeColor('#e2e8f0').stroke();
  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .fillColor('#111827')
    .text('Financial Clearance Summary', 68, 228);
  doc.font('Helvetica').fontSize(11).fillColor('#334155');
  ['Tuition Fee: Cleared', 'Library Dues: Cleared', 'Laboratory Dues: Cleared', 'Hostel/Transport Dues: Cleared'].forEach((line, index) => {
    doc.text(`• ${line}`, 68, 260 + index * 24);
  });
  doc.text(`Student: ${data.studentName}`, 68, 364);
  drawCommonFooter(doc, data.authorityName);
};

const drawFeeStructureTemplate = (doc, data) => {
  drawCommonHeader(doc, 'Fee Structure Statement', `Generated on: ${new Date().toLocaleString()}`);
  doc.font('Helvetica-Bold').fontSize(18).fillColor('#0f172a').text('FEE STRUCTURE CERTIFICATE', 40, 166, { align: 'center' });
  const tableTop = 216;
  doc.rect(52, tableTop, doc.page.width - 104, 170).lineWidth(1).strokeColor('#cbd5e1').stroke();
  doc.moveTo(52, tableTop + 34).lineTo(doc.page.width - 52, tableTop + 34).strokeColor('#cbd5e1').stroke();
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#111827').text('Component', 66, tableTop + 12).text('Amount (Indicative)', doc.page.width - 210, tableTop + 12);
  const rows = [['Tuition Fee', 'As per current semester norms'], ['Exam Fee', 'As notified by Controller'], ['Library Fee', 'As per annual circular'], ['Miscellaneous', 'As approved by Finance Dept']];
  rows.forEach(([component, amount], idx) => {
    const rowY = tableTop + 48 + idx * 28;
    doc.font('Helvetica').fontSize(10.5).fillColor('#334155').text(component, 66, rowY).text(amount, doc.page.width - 210, rowY, { width: 140 });
  });
  doc.font('Helvetica').fontSize(10).fillColor('#475569').text(`Issued to: ${data.studentName}`, 52, tableTop + 186);
  drawCommonFooter(doc, data.authorityName);
};

const drawByDocumentType = (doc, data) => {
  const templateMap = {
    Bonafide: drawBonafideTemplate,
    LOR: drawLorTemplate,
    NOC: drawNocTemplate,
    'No Dues': drawNoDuesTemplate,
    'Fee Structure': drawFeeStructureTemplate
  };
  const selectedTemplate = templateMap[data.documentType] || ((pdfDoc, payload) => {
    drawHeader(pdfDoc);
    pdfDoc.font('Helvetica-Bold').fontSize(16).fillColor('#0f172a').text(`${payload.documentType} Certificate`, 40, 158, { align: 'center' });
    drawFooter(pdfDoc, payload.authorityName);
  });
  selectedTemplate(doc, data);
};

const generateDocumentPDF = ({ studentName, documentType, authorityName, approvedDate }) => {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const chunks = [];

  return new Promise((resolve, reject) => {
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    drawByDocumentType(doc, {
      studentName,
      documentType,
      authorityName,
      approvedDate
    });
    doc.end();
  });
};

module.exports = { generateDocumentPDF };
