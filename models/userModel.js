const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      // validate: {
      //   validator: function (v) {
      //     return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      //   },
      //   message: 'Please enter a valid email address',
      // },
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      minlength: [2, 'Location must be at least 2 characters long'],
      maxlength: [200, 'Location cannot exceed 100 characters'],
    },
    coordinates: {
      type: Object,
      required: [true, 'Cordinates is required'],
    },
  },
  {
    timestamps: true, // Automatically creates `createdAt` and `updatedAt` fields
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
