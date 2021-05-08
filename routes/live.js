// load required modules
const express = require(`express`);
const router = express.Router();
const {acceptIfChildOrMentor,
       acceptIfMentor} = require(`../middlewares/acceptIfAuthorized`);
const {postNote,
       getNotes} = require(`../controllers/live`);

// @route   POST `/api/v1/mentor/subscription/:subscriptionId/appointment/:appointmentId/add-note`
// @desc    add notes to appointment preparing to start live call
// @access  private (only mentor can add notes)
router.post(`/api/v1/mentor/subscription/:subscriptionId/appointment/:appointmentId/add-note`, 
            acceptIfMentor, postNote);

// @route   POST `/api/v1/subscription/:subscriptionId/appointment/:appointmentId/notes`
// @desc    get live notes to mentor or child
// @access  private (only mentor or child can get notes)
router.get(`/api/v1/subscription/:subscriptionId/appointment/:appointmentId/notes`,
           acceptIfChildOrMentor, getNotes);

// export router
module.exports = router;