const { v4: uuidv4 } = require('uuid');
const cvParserService = require('../services/cvParserService');
const interviewAIService = require('../services/interviewAIService');
const Interview = require('../models/Interview');
const User = require('../models/User');

const JOB_LEVEL_MAP = {
  junior: 'Junior',
  entry: 'Junior',
  'entry-level': 'Junior',
  mid: 'Mid',
  'mid-level': 'Mid',
  middle: 'Mid',
  senior: 'Senior',
  staff: 'Staff',
  lead: 'Lead',
  principal: 'Principal',
};

function normalizeJobLevel(level) {
  const key = String(level || 'Mid')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-');

  return JOB_LEVEL_MAP[key] || 'Mid';
}

class InterviewController {
  async uploadCV(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded. Please upload a PDF or image file.',
        });
      }

      const { jobRole = 'Software Engineer' } = req.body;
      const jobLevel = normalizeJobLevel(req.body.jobLevel);

      const cvData = await cvParserService.parse(
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname
      );

      const sessionId = uuidv4();
      const interview = await Interview.create({
        userId: req.user._id,
        sessionId,
        cvData,
        cvFileName: req.file.originalname,
        cvFileType: req.file.mimetype,
        jobRole,
        jobLevel,
        status: 'active',
        messages: [],
      });

      const openingMessage = await interviewAIService.startInterview(
        cvData,
        jobRole,
        jobLevel
      );

      interview.messages.push({ role: 'assistant', content: openingMessage });
      interview.questionsAsked = 1;
      await interview.save();

      res.status(201).json({
        success: true,
        message: 'CV parsed and interview started successfully',
        data: {
          sessionId,
          interviewId: interview._id,
          cvData,
          openingMessage,
          jobRole,
          jobLevel,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async sendMessage(req, res, next) {
    try {
      const { sessionId } = req.params;
      const { message } = req.body;

      if (!message || message.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Message cannot be empty',
        });
      }

      const interview = await Interview.findOne({
        sessionId,
        userId: req.user._id,
        status: 'active',
      });

      if (!interview) {
        return res.status(404).json({
          success: false,
          message: 'Interview session not found or already completed',
        });
      }

      interview.messages.push({ role: 'user', content: message.trim() });

      const aiResponse = await interviewAIService.continueInterview(
        interview.cvData,
        interview.messages.slice(0, -1),
        message.trim(),
        interview.jobRole,
        interview.jobLevel
      );

      interview.messages.push({ role: 'assistant', content: aiResponse });
      interview.questionsAsked += 1;
      await interview.save();

      res.status(200).json({
        success: true,
        data: {
          message: aiResponse,
          questionsAsked: interview.questionsAsked,
          messageCount: interview.messages.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async finishInterview(req, res, next) {
    try {
      const { sessionId } = req.params;

      const interview = await Interview.findOne({
        sessionId,
        userId: req.user._id,
      });

      if (!interview) {
        return res.status(404).json({
          success: false,
          message: 'Interview session not found',
        });
      }

      if (interview.status === 'completed') {
        return res.status(200).json({
          success: true,
          data: { feedback: interview.feedback },
        });
      }

      const feedback = await interviewAIService.generateFeedback(
        interview.cvData,
        interview.messages
      );

      const duration = Math.round(
        (Date.now() - interview.createdAt.getTime()) / 60000
      );

      interview.status = 'completed';
      interview.feedback = feedback;
      interview.duration = duration;
      await interview.save();

      const completedInterviews = await Interview.find({
        userId: req.user._id,
        status: 'completed',
      });

      const avgScore =
        completedInterviews.reduce((sum, i) => sum + (i.feedback?.overallScore || 0), 0) /
        completedInterviews.length;

      await User.findByIdAndUpdate(req.user._id, {
        totalInterviews: completedInterviews.length,
        averageScore: Math.round(avgScore),
      });

      res.status(200).json({
        success: true,
        message: 'Interview completed. Feedback generated.',
        data: { feedback, duration, questionsAsked: interview.questionsAsked },
      });
    } catch (error) {
      next(error);
    }
  }

  async listInterviews(req, res, next) {
    try {
      const interviews = await Interview.find({ userId: req.user._id })
        .select('-messages -cvData.rawText')
        .sort({ createdAt: -1 })
        .limit(20);

      res.status(200).json({
        success: true,
        count: interviews.length,
        data: interviews,
      });
    } catch (error) {
      next(error);
    }
  }

  async getInterview(req, res, next) {
    try {
      const interview = await Interview.findOne({
        sessionId: req.params.sessionId,
        userId: req.user._id,
      });

      if (!interview) {
        return res.status(404).json({
          success: false,
          message: 'Interview not found',
        });
      }

      res.status(200).json({ success: true, data: interview });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InterviewController();
