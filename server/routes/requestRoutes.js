const express = require('express');
const {
  createRequest,
  getMyRequests,
  getApprovedDocuments,
  getAssignedRequests,
  updateRequestStatus,
  downloadApprovedPdf
} = require('../controllers/requestController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorizeRoles('student'), createRequest);
router.get('/my', protect, authorizeRoles('student'), getMyRequests);
router.get('/vault', protect, authorizeRoles('student'), getApprovedDocuments);
router.get('/assigned', protect, getAssignedRequests);
router.patch('/:id/status', protect, updateRequestStatus);
router.get('/:id/pdf', protect, downloadApprovedPdf);

module.exports = router;
