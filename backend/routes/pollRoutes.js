import express from 'express';
import Poll from '../models/Poll.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/polls:
 *   get:
 *     summary: Get all polls
 */
router.get('/', async (req, res) => {
  try {
    const polls = await Poll.find().populate('createdBy', 'username');
    res.json(polls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  const { question, options } = req.body;
  try {
    const poll = await Poll.create({
      question,
      options: options.map(opt => ({ text: opt })),
      createdBy: req.user._id
    });
    res.json(poll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/vote', async (req, res) => {
  const { optionIndex } = req.body;
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ message: 'Poll not found' });
    if (typeof optionIndex !== 'number' || optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ message: 'Invalid option index' });
    }
    poll.options[optionIndex].votes += 1;
    await poll.save();
    res.json(poll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
