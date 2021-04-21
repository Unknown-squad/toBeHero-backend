// Load required packeges
const mongoose = require('mongoose');

// chech if array is empty or not
function arrayOfLength(arr) {
  return Array.isArray(arr) && arr.length > 0
}

// add validation message to check if topicsList property in course schema is empty or not
const topicsListValidation = [arrayOfLength, 'Enter at least one topic']

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
    /* match: [/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      `invalid url.`
    ], */
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
    type: [String],
    validate: topicsListValidation
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
      ref: 'reviews'
    }
  ],
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'mentors',
    required: true
    }
});

module.exports = mongoose.model('Course', CourseSchema);