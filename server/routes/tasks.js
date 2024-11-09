var express = require("express");
const {
  getTasks,
  createTask,
  deleteTask,
  patchTask,
} = require("../controllers/tasks.controller");
var router = express.Router();

/* GET home page. */
router.get("/", getTasks);
router.post("/", createTask);
router.patch("/:id", patchTask);
router.delete("/:id", deleteTask);

module.exports = router;
