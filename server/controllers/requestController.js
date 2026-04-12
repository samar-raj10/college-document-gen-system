const DocumentRequest = require('../models/DocumentRequest');
const { mapDocumentToAuthority } = require('../utils/roleMapper');
const { generateDocumentPDF } = require('../utils/pdfGenerator');

const createRequest = async (req, res) => {
  try {
    const { documentType, details } = req.body;
    const assignedToRole = mapDocumentToAuthority(documentType);

    if (!assignedToRole) {
      return res.status(400).json({ message: 'Invalid document type' });
    }

    const docRequest = await DocumentRequest.create({
      student: req.user._id,
      documentType,
      details,
      assignedToRole
    });

    return res.status(201).json(docRequest);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const requests = await DocumentRequest.find({ student: req.user._id }).sort({ createdAt: -1 });
    return res.json(requests);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAssignedRequests = async (req, res) => {
  try {
    const requests = await DocumentRequest.find({ assignedToRole: req.user.role })
      .populate('student', 'name email department')
      .sort({ createdAt: -1 });
    return res.json(requests);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateRequestStatus = async (req, res) => {
  try {
    const { status, comments } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const request = await DocumentRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.assignedToRole !== req.user.role) {
      return res.status(403).json({ message: 'Not authorized to review this request' });
    }

    request.status = status;
    request.comments = comments || '';
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    return res.json(request);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const downloadApprovedPdf = async (req, res) => {
  try {
    const request = await DocumentRequest.findById(req.params.id)
      .populate('student', 'name')
      .populate('reviewedBy', 'name');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const isStudentOwner = request.student._id.toString() === req.user._id.toString();
    const isAssignedAuthority = request.assignedToRole === req.user.role;

    if (!isStudentOwner && !isAssignedAuthority && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (request.status !== 'Approved') {
      return res.status(400).json({ message: 'PDF is available only for approved requests' });
    }

    const pdfBuffer = await generateDocumentPDF({
      studentName: request.student.name,
      documentType: request.documentType,
      authorityName: request.reviewedBy?.name || 'Authority',
      approvedDate: request.reviewedAt || request.updatedAt
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${request.documentType}-${request._id}.pdf`);
    return res.send(pdfBuffer);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRequest,
  getMyRequests,
  getAssignedRequests,
  updateRequestStatus,
  downloadApprovedPdf
};
