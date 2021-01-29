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
  guardianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: `guardians`,
    required: [true, `please add guardianId.`]
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: `courses`,
    required: [true, `please add courseId.`]
  }
});

// Static method to get average of review rates
reviewSchema.statics.getAverageRate = async function(courseId) {
  const obj = await this.aggregate([
    {
      $match: { courseId: courseId }
    },
    {
      $group: {
        _id: `$courseId`,
        rate: { $avg: `$rate` }
      }
    }
  ]);
  
  // taking 2 numbers after the decimal point
  const avgRate = obj[0].rate.toFixed(2);

  try {

    // update rate property of course with givin id
    await mongoose.connection.db.collection(`courses`, async (err, collection) => {
      await collection.findOneAndUpdate({_id: courseId}, {
        $set: {"rate": avgRate}
      });
    });

  } catch (error) {
    console.log(error);
  }

};

// Call getAverageRate function after save
reviewSchema.post(`save`, function() {
  this.constructor.getAverageRate(this.courseId);
});

const Review = mongoose.model(`reviews`, reviewSchema);

module.exports = Review;