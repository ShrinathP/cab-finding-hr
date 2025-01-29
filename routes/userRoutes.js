const express = require("express");
const {
  createUser,
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
router.post("/users", createUser);
router.get("/users", getUsers);
router.get("/users/:email", getUserByName);
router.delete("/users/:email", deleteUserByName);

// Seeders Endpoint
router.post("/seeders", createSeeder);
router.get("/seeders", getSeeders);
router.get("/seeders/:email", getSeederByName);
router.delete("/seeders/:email", deleteSeederByName);

router.post("/seekers", createSeeker);
router.get("/seekers", getSeekers);
router.get("/seekers/:email", getSeekerByName);
router.delete("/seekers/:email", deleteSeekerByName);

router.get("/match", runMatch);

module.exports = router;
