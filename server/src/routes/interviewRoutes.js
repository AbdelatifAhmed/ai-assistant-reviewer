const express = require('express');
const interviewController = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/upload');

const router = express.Router();

router.use(protect);

router.post(
  '/upload-cv',
  upload.single('cv'),
  interviewController.uploadCV.bind(interviewController)
);

router.get('/', interviewController.listInterviews.bind(interviewController));

router.get(
  '/:sessionId',
  interviewController.getInterview.bind(interviewController)
);

router.post(
  '/:sessionId/message',
  interviewController.sendMessage.bind(interviewController)
);

router.post(
  '/:sessionId/finish',
  interviewController.finishInterview.bind(interviewController)
);

module.exports = router;
