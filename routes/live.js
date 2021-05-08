// load required modules
const express = require(`express`);
const router = express.Router();
const {acceptIfChild,
       acceptIfMentor} = require(`../middlewares/acceptIfAuthorized`);
const {postNote} = require(`../controllers/live`);

// @route   POST `/api/v1/mentor/subscription/:subscriptionId/appointment/:appointmentId/add-note`
// @desc    add notes to appointment preparing to start live call
// @access  private (only mentor can add notes)
router.post(`/api/v1/mentor/subscription/:subscriptionId/appointment/:appointmentId/add-note`, 
            acceptIfMentor, postNote);

// export router
module.exports = router;