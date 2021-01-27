// Load required packages
const mongoose = require(`mongoose`);

// create review schema
const reviewSchema = new mongoose.Schema({
  rate: {
    type: Number,
    required: [true, `please add rate to review.`],
    min: [1, `minimum accepted number of rate is 1 star.`],
    max: [5, `maximum accepted number of rate is 5 stars.`]
  },
  creatingDate: {
    type: Date,
    default: Date.now()
  },
  description: {
    type: String,
    maxlength: [350, `maximum length of description is 350 letter.`]
  },
  guardian: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: `guardians`,
      required: [true, `please add guardianId.`]
    },
    name: {
      type: mongoose.Schema.Types.String,
      ref: `guardians`,
      required: true
    },
    picture: {
      type: mongoose.Schema.Types.String,
      ref: `guardians`,
      required: true
    }
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: `courses`,
    required: [true, `please add courseId.`]
  }
});

const Review = mongoose.model(`reviews`, reviewSchema);

module.exports = Review;