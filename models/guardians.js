// Load required packeges
const mongoose = require('mongoose');

// Create guardians schema
const GuardianSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please add a name'],
    minlength: 5,
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, 'Please add an emial'],
    unique: [true, 'The email address is already taken, Please choose another'],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 8,
    maxlength: 64
  },
  picture: {
    type: String,
    required: false
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    unique: [true, 'The phone number is already taken, Please choose another'],
    match: [/^\d{10}$/, 'Phone number maxlength is 10 characters']
  },
  countryCode: {
    type: String,
    required: [true, 'Please select country code'],
  },
  address: {
      type: String,
      required: [true, 'Please enter address']
  },
  bankingInfo: [
    {
      cardNumber: {
        type: String,
        minlength: 16,
        maxlength: 16,
        required: [true, 'Please add a card number']
      },
      expire: {
        type: String,
        minlength: 5,
        maxlength: 5,
        required: [true, 'Please add a expire']
      },
      CVV: {
        type: String,
        minlength: 3,
        maxlength: 3,
        required: [true, 'Please add a CVV']
      },
      nameOnCard: {
        type: String,
        minlength: 10,
        maxlength: 50,
        required: [true, 'Please add a name on card']
      },
      phoneNumber: {
        type: String,
        required: [true, 'Please add a phone number']
      },
      _id: false
    }
  ],
  varificationToken: String,
  varificationTokenExpire: {
    type: Date,
    default: Date.now,
  },
  childrenId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'children',
      required: true
    }
  ]
});

module.exports = mongoose.model('Guardian', GuardianSchema);