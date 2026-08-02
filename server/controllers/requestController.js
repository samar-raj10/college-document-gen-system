const DocumentRequest = require("../models/DocumentRequest");
const { getWorkflow } = require("../utils/approvalWorkflows");
const { generateDocumentPDF } = require("../utils/pdfGenerator");

const createRequest = async (req, res) => {
  try {
    const { documentType, details } = req.body;
    const workflowRoles = getWorkflow(documentType);

    if (!workflowRoles || !workflowRoles.length) {
      return res.status(400).json({ message: "Invalid document type" });
    }

    // build workflow stages
    const workflow = workflowRoles.map((role) => ({ role, status: "Pending" }));
    const assignedToRole = workflowRoles[0];

    const docRequest = await DocumentRequest.create({
      student: req.user._id,
      documentType,
      details,
      assignedToRole,
      workflow,
    });

    return res.status(201).json(docRequest);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const requests = await DocumentRequest.find({ student: req.user._id }).sort(
      { createdAt: -1 },
    );
    return res.json(requests);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getApprovedDocuments = async (req, res) => {
  try {
    const documents = await DocumentRequest.find({
      student: req.user._id,
      status: "Approved",
    })
      .populate("reviewedBy", "name")
      .sort({ reviewedAt: -1, updatedAt: -1 });
    return res.json(documents);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAssignedRequests = async (req, res) => {
  try {
    if (req.user.role === "student") {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }

    const filter =
      req.user.role === "admin" ? {} : { assignedToRole: req.user.role };
    const requests = await DocumentRequest.find(filter)
      .populate("student", "name email department")
      .sort({ createdAt: -1 });
    return res.json(requests);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateRequestStatus = async (req, res) => {
  try {
    const { status, comments } = req.body;
    if (req.user.role === "student") {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const request = await DocumentRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    const userRole = String(req.user.role || "").toLowerCase();

    if (!Array.isArray(request.workflow) || request.workflow.length === 0) {
      const workflowRoles = getWorkflow(request.documentType);
      if (!workflowRoles || !workflowRoles.length) {
        return res
          .status(400)
          .json({ message: "Request workflow is unavailable" });
      }

      request.workflow = workflowRoles.map((role) => ({
        role,
        status: "Pending",
      }));
    }

    const pendingStage = request.workflow.find(
      (s) => String(s.status).toLowerCase() === "pending",
    );
    const assignedRole = String(
      request.assignedToRole || pendingStage?.role || "",
    ).toLowerCase();

    if (!assignedRole) {
      return res
        .status(403)
        .json({ message: "No active assignment for this request" });
    }

    if (userRole !== assignedRole) {
      return res
        .status(403)
        .json({ message: "Not authorized to review this request" });
    }

    if (pendingStage && !request.assignedToRole) {
      request.assignedToRole = pendingStage.role;
    }

    const currentIndex = request.workflow.findIndex(
      (s) =>
        String(s.role).toLowerCase() === assignedRole &&
        String(s.status).toLowerCase() === "pending",
    );
    if (currentIndex === -1) {
      return res
        .status(400)
        .json({ message: "No pending stage found for current assignment" });
    }

    // apply decision
    if (status === "Rejected") {
      // mark current stage rejected and stop workflow
      request.workflow[currentIndex].status = "Rejected";
      request.workflow[currentIndex].reviewedBy = req.user._id;
      request.workflow[currentIndex].reviewedAt = new Date();
      request.workflow[currentIndex].comments = comments || "";

      request.status = "Rejected";
      request.assignedToRole = null;
      await request.save();
      return res.json(request);
    }

    // status === 'Approved'
    request.workflow[currentIndex].status = "Approved";
    request.workflow[currentIndex].reviewedBy = req.user._id;
    request.workflow[currentIndex].reviewedAt = new Date();
    request.workflow[currentIndex].comments = comments || "";

    const nextIndex = currentIndex + 1;
    if (nextIndex >= request.workflow.length) {
      // final approval
      request.status = "Approved";
      request.assignedToRole = null;
    } else {
      // move to next stage
      request.assignedToRole = request.workflow[nextIndex].role;
    }

    await request.save();
    return res.json(request);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const downloadApprovedPdf = async (req, res) => {
  try {
    const request = await DocumentRequest.findById(req.params.id)
      .populate("student", "name")
      .populate("reviewedBy", "name");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    const isStudentOwner =
      request.student._id.toString() === req.user._id.toString();
    const isAssignedAuthority = request.assignedToRole === req.user.role;

    if (!isStudentOwner && !isAssignedAuthority && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (request.status !== "Approved") {
      return res
        .status(400)
        .json({ message: "PDF is available only for approved requests" });
    }

    const pdfBuffer = await generateDocumentPDF({
      studentName: request.student.name,
      documentType: request.documentType,
      authorityName: request.reviewedBy?.name || "Authority",
      approvedDate: request.reviewedAt || request.updatedAt,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${request.documentType}-${request._id}.pdf`,
    );
    return res.send(pdfBuffer);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRequest,
  getMyRequests,
  getApprovedDocuments,
  getAssignedRequests,
  updateRequestStatus,
  downloadApprovedPdf,
};
