const express = require("express");
const {
  createUser,
  confirmUser,
  getUsers,
  getUserByName,
  deleteUserByName,
} = require("../controllers/userController");
const { createSeeder,
    getSeeders,
    getSeederByName,
    deleteSeederByName
 } = require("../controllers/seederController");
const { createSeeker,
    getSeekers,
    getSeekerByName,
    deleteSeekerByName
 } = require("../controllers/seekerController");
const { runMatch
 } = require("../controllers/matchController");

const router = express.Router();

// Users Endpoint
router.post("/users", express.urlencoded({ extended: true }), createUser);
router.post("/confirm/user", express.urlencoded({ extended: true }), confirmUser);
router.get("/users", getUsers);
router.get("/users/:email", getUserByName);
router.delete("/users/:email", deleteUserByName);

// Seeders Endpoint
router.post("/seeders", express.urlencoded({ extended: true }), createSeeder);
router.get("/seeders", getSeeders);
router.get("/seeders/:email", getSeederByName);
router.post("/seeders/remove", express.urlencoded({ extended: true }),deleteSeederByName);
// router.put("/seeders/:email/full", markSeederAsFull); 

router.post("/seekers", express.urlencoded({ extended: true }),  createSeeker);
router.get("/seekers", getSeekers);
router.get("/seekers/:email", getSeekerByName);
router.post("/seekers/remove", express.urlencoded({ extended: true }), deleteSeekerByName);

router.get("/match", runMatch);

module.exports = router;
