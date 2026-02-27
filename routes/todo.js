const router = require("express").Router();
const Todo = require("../models/Todo");
const auth = require("../middleware/authMiddleware");

router.get("/", auth, async (req, res) => {
  const todos = await Todo.find({ userId: req.user });
  res.json(todos);
});

router.post("/", auth, async (req, res) => {
  const { text, dueDate, reminderTime, status } = req.body;

  const todo = await Todo.create({
    userId: req.user,
    text,
    status: status || "In Progress",
    dueDate: dueDate ? new Date(dueDate) : null,
    reminderTime: reminderTime ? new Date(reminderTime) : null
  });

  res.json(todo);
});

router.put("/:id", auth, async (req, res) => {
  const updated = await Todo.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
});

router.delete("/:id", auth, async (req, res) => {
  await Todo.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

module.exports = router;