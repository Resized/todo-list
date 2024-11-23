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
    const sourceClientId = req.headers["x-client-id"];

    if (typeof content === "undefined" || content.trim() === "") {
      return res.status(400).json({ message: "No content provided" });
    }

    const task = await Task.create({ content });

    // Send an SSE update
    clients.forEach((client) => {
      if (client.id !== sourceClientId) {
        client.res.write(`event: taskCreated\n`);
        client.res.write(`data: ${JSON.stringify(task)}\n\n`);
      }
    });

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
    const sourceClientId = req.headers["x-client-id"];

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

    // Send an SSE update
    clients.forEach((client) => {
      if (client.id !== sourceClientId) {
        client.res.write(`event: taskUpdated\n`);
        client.res.write(`data: ${JSON.stringify(task)}\n\n`);
      }
    });

    res.status(200).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const sourceClientId = req.headers["x-client-id"];

    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Send an SSE update
    clients.forEach((client) => {
      if (client.id !== sourceClientId) {
        client.res.write(`event: taskRemoved\n`);
        client.res.write(`data: ${JSON.stringify(task)}\n\n`);
      }
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const clients = [];

const getEvents = async (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const clientId = crypto.randomUUID();
  const client = { id: clientId, res };
  clients.push(client);

  client.res.write(`event: connected\n`);
  client.res.write(`data: ${JSON.stringify({ clientId })}\n\n`);

  // Handle client disconnect
  req.on("close", () => {
    console.log(`Client disconnected: ${client.id}`);
    clients.splice(clients.indexOf(client), 1);
  });
};

module.exports = {
  getTasks,
  createTask,
  patchTask,
  deleteTask,
  getEvents,
};
