const express = require('express');
const {
  createRequest,
  getMyRequests,
  getAssignedRequests,
  updateRequestStatus,
  downloadApprovedPdf
} = require('../controllers/requestController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorizeRoles('student'), createRequest);
router.get('/my', protect, authorizeRoles('student'), getMyRequests);
router.get('/assigned', protect, authorizeRoles('hod', 'registrar', 'finance', 'admin'), getAssignedRequests);
router.patch('/:id/status', protect, authorizeRoles('hod', 'registrar', 'finance', 'admin'), updateRequestStatus);
router.get('/:id/pdf', protect, downloadApprovedPdf);

module.exports = router;
