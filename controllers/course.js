// load requried packages
const Course = require(`../models/courses`);
const Mentor = require(`../models/mentors`);
const asyncHandler = require(`../middlewares/async`);

// @route   GET `/api/v1/courses/:id`
// @desc    get one course
// @access  public
exports.getOneCourse = asyncHandler(async (req, res) => {

  // find course with givin id and pupulate mentorId
  const course = await Course.findById(req.params.id).populate({
    path: `mentorId`,
    select: `_id fullName picture isAvailable`,
    model: Mentor
  });

  res.status(200).json({
    success: true,
    message: `successfully find course with id ${req.params.id}`,
    data:{
      kind: `course`,
      items: [course]
    }
  });

});