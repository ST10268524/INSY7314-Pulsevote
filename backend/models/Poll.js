/**
 * Poll Model
 * 
 * Defines the Poll schema for MongoDB with voting functionality.
 * Each poll contains a question, multiple options with vote counts,
 * and references the user who created it.
 * 
 * @author PulseVote Team
 * @version 1.0.0
 */

import mongoose from "mongoose";

/**
 * Poll Schema Definition
 * 
 * Fields:
 * - question: The poll question (required)
 * - options: Array of poll options with text and vote counts
 * - createdBy: Reference to the User who created the poll
 * - timestamps: Automatically adds createdAt and updatedAt fields
 */
const pollSchema = new mongoose.Schema({
  question: { 
    type: String, 
    required: true 
  },
  options: [{ 
    text: String, 
    votes: { 
      type: Number, 
      default: 0 
    } 
  }],
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { 
  timestamps: true 
});

export default mongoose.model('Poll', pollSchema);
