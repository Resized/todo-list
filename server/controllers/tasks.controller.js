const Task = require("../models/task.model");
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const createTask = async (req, res) => {
  try {
    const { content } = req.body;

    if (typeof content === "undefined" || content.trim() === "") {
      return res.status(400).json({ message: "No content provided" });
    }

    const task = await Task.create({ content });
    res.status(201).json(task);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const patchTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, done } = req.body;

    // Check if both content and done are missing
    if (typeof content === "undefined" && typeof done === "undefined") {
      return res.status(400).json({ message: "Nothing to update" });
    }

    // Prepare fields for update, ignoring empty string for content
    const updatedFields = {};
    if (typeof content !== "undefined" && content.trim() !== "") {
      updatedFields.content = content;
    }
    if (typeof done !== "undefined") {
      updatedFields.done = done;
    }

    // If updatedFields is empty, return an error
    if (Object.keys(updatedFields).length === 0) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    // Update the task
    const task = await Task.findByIdAndUpdate(id, updatedFields, { new: true });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTasks,
  createTask,
  patchTask,
  deleteTask,
};
