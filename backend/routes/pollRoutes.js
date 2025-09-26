/**
 * Poll Routes
 *
 * Handles poll-related endpoints including creating, listing, and voting on polls.
 * Provides CRUD operations for poll management with proper authentication.
 *
 * Features:
 * - List all polls with creator information
 * - Create new polls (authenticated users only)
 * - Vote on poll options
 * - Input validation and error handling
 *
 * @author PulseVote Team
 * @version 1.0.0
 */

import express from 'express';
import Poll from '../models/Poll.js';
import protect from '../middleware/authMiddleware.js';

// Create Express router
const router = express.Router();

// ============================================================================
// GET ALL POLLS ENDPOINT
// ============================================================================

/**
 * @swagger
 * /api/polls:
 *   get:
 *     summary: Get all polls
 *     description: Retrieves all polls with creator information
 *     responses:
 *       200:
 *         description: List of polls retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    // Find all polls and populate creator information
    const polls = await Poll.find().populate('createdBy', 'username');
    res.json(polls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============================================================================
// CREATE POLL ENDPOINT
// ============================================================================

/**
 * @swagger
 * /api/polls:
 *   post:
 *     summary: Create a new poll
 *     description: Creates a new poll (authenticated users only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *               - options
 *             properties:
 *               question:
 *                 type: string
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Poll created successfully
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post('/', protect, async (req, res) => {
  const { question, options } = req.body;

  try {
    // Create new poll with options
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

// ============================================================================
// VOTE ON POLL ENDPOINT
// ============================================================================

/**
 * @swagger
 * /api/polls/{id}/vote:
 *   post:
 *     summary: Vote on a poll
 *     description: Casts a vote for a specific option in a poll
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Poll ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - optionIndex
 *             properties:
 *               optionIndex:
 *                 type: number
 *                 description: Index of the option to vote for
 *     responses:
 *       200:
 *         description: Vote cast successfully
 *       400:
 *         description: Invalid option index
 *       404:
 *         description: Poll not found
 *       500:
 *         description: Server error
 */
router.post('/:id/vote', async (req, res) => {
  const { optionIndex } = req.body;

  try {
    // Find poll by ID
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Validate option index
    if (typeof optionIndex !== 'number' ||
        optionIndex < 0 ||
        optionIndex >= poll.options.length) {
      return res.status(400).json({ message: 'Invalid option index' });
    }

    // Increment vote count for selected option
    poll.options[optionIndex].votes += 1;
    await poll.save();

    res.json(poll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============================================================================
// EXPORT
// ============================================================================

export default router;
