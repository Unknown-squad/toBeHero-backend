// Load required packeges
const mongoose = require('mongoose');

// Create course schema
const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    minlength: [3, 'Min length 3 character for title'],
    maxlength: [100, 'Max length 100 character for title'],
    required: [true, 'Please add a title']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  picture: {
    type: String,
    required: [true, 'Please add a picture']
  },
  creatingDate: {
    type: Date,
    default: Date.now
  },
  rate: {
    type: Number,
    default: 0,
    min: [0, 'Minimun number of rate is 0'],
    max: [5, 'Max number of rate is 5']
  },
  reviewCounter: {
    type: Number,
    default: 0
  },
  topicsList: {
    type: String,
    required: [true, 'Please add a topic list']
  },
  mediaURLS: [String],
  genre: {
    type: String,
    enum: ['Art', 'Music', 'Programming', 'Drawing', 'Quran', 'Physics', 'Mathematics', 'Chemistry', 'Philosophy'],
    required: [true, 'Please choose at least one genre']
  },
  subscriptionNumber: {
    type: Number,
    default: 0
  },
  reviewsId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'reviews',
      required: [true, 'Please add a review id']
    }
  ],
  mentorId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'mentors',
      required: [true, 'Please add a mentor id']
    }
  ]
});

module.exports = mongoose.model('Course', CourseSchema);