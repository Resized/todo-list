const express = require("express");
const {
  getTasks,
  createTask,
  deleteTask,
  patchTask,
  getEvents,
} = require("../controllers/tasks.controller");
const router = express.Router();

/* GET home page. */
router.get("/", getTasks);
router.post("/", createTask);
router.patch("/:id", patchTask);
router.delete("/:id", deleteTask);
router.get("/events", getEvents);

module.exports = router;
