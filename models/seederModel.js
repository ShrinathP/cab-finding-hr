const mongoose = require("mongoose");

const seederSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      // validate: {
      //   validator: function (v) {
      //     return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      //   },
      //   message: "Please enter a valid email address",
      // },
    },
    time: {
      type: String,
      required: [true, "Time is required"],
      validate: {
        validator: function (v) {
          return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v); // Validates HH:mm format (24-hour)
        },
        message: "Time must be in HH:mm format (24-hour)",
      },
    },
    count: {
      type: Number, // Field type is Number
      min: [0, "Value must be at least 0"], // Minimum value
      max: [1, "Value cannot exceed 1"], // Maximum value
      default: 0, // Default value is 0
      validate: {
        validator: Number.isInteger, // Ensures the value is an integer
        message: "Value must be an integer",
      },
    },
  },
  {
    timestamps: true, // Automatically creates `createdAt` and `updatedAt` fields
  }
);

const Seeder = mongoose.model("Seeder", seederSchema);

module.exports = Seeder;
