// Load required packages
const mongoose = require(`mongoose`);

// create subscription schema
const subscriptionSchema = new mongoose.Schema({
  guardianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: `guardians`,
    required: [true, `please add guardian id.`]
  },
  childId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: `children`,
    required: [true, `please add child id.`]
  },
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: `mentors`,
    required: [true, `please add mentor id.`]
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: `courses`,
    required: [true, `please add course id.`]
  },
  creatingDate: {
    type: Date,
    default: Date.now()
  },
  balance: {
    type: Number,
    required: [true, `please add cost of course.`]
  },
  complete: {
    type: Boolean,
    default: false
  },
  appointments: {
    type: [{
      date: {
        type: Date,
        requried: [true, `please add date to appointment`]
      },
      title: String,
      cancel: {
        type: Boolean,
        default: false
      },
      mentor: {
        type: Boolean,
        default: false
      },
      child: {
        type: Boolean,
        default: false
      }
    }]
  },
  notes: {
    type: [{
      appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, `please add appoinement id.`]
      },
      date: {
        type: Date,
        default: Date.now()
      },
      description: {
        type: String,
        required: [true, `please add description to note`]
      },
    }],
    _id: false
  },
  liveUrl: {
    type: String,
    /* match: [/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      `invalid url.`
    ] */
  },
  liveUrlExpire: Date
});

// connect schema with subscription collection by creating subscription model
const Subscription = mongoose.model(`subscriptions`, subscriptionSchema);

module.exports = Subscription;