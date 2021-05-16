// load required modules
const express = require(`express`);
const router = express.Router();
const {acceptIfChildOrMentor,
       acceptIfMentor} = require(`../middlewares/acceptIfAuthorized`);
const {
       postNote,
       getNotes,
       putCancelAppointment
} = require(`../controllers/live`);
const {
       acceptedIfUserLoggedIn
} = require(`../middlewares/authorizedAccepted`);

// @route   POST `/api/v1/mentor/subscription/:subscriptionId/appointment/:appointmentId/add-note`
// @desc    add notes to appointment preparing to start live call
// @access  private (only mentor can add notes)
router.post(`/api/v1/mentor/subscription/:subscriptionId/appointment/:appointmentId/add-note`, 
       acceptedIfUserLoggedIn, acceptIfMentor, postNote
);

// @route   GET `/api/v1/subscription/:subscriptionId/appointment/:appointmentId/notes`
// @desc    get live notes to mentor or child
// @access  private (only mentor or child can get notes)
router.get(`/api/v1/subscription/:subscriptionId/appointment/:appointmentId/notes`,
       acceptedIfUserLoggedIn, acceptIfChildOrMentor, getNotes
);

// @route   PUT `/api/v1/mentor/subscription/:subscriptionId/appointment/:appointmentId/cancel`
// @desc    cancel appointment as mentor
// @access  private (only mentor can cancel appointment)
router.put(`/api/v1/mentor/subscription/:subscriptionId/appointment/:appointmentId/cancel`,
       acceptedIfUserLoggedIn, acceptIfMentor, putCancelAppointment
);

// export router
module.exports = router;