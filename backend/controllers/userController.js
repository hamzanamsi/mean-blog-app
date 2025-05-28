const User = require("../models/User");
const Role = require("../models/Role");
const bcrypt = require("bcryptjs");

// List all users (admin)
exports.getAll = async (req, res) => {
  try {
    if (!req.user.roles.includes("admin")) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const users = await User.find()
      .select("-password")
      .populate("roles", "name");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// View a user
exports.getOne = async (req, res) => {
  try {
    if (
      req.user.userId !== req.params.id &&
      !req.user.roles.includes("admin")
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("roles", "name");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a user
exports.update = async (req, res) => {
  try {
    if (
      req.user.userId !== req.params.id &&
      !req.user.roles.includes("admin")
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const { username, email, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);
    await user.save();
    res.json({ message: "User updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a user
exports.delete = async (req, res) => {
  try {
    if (
      req.user.userId !== req.params.id &&
      !req.user.roles.includes("admin")
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
