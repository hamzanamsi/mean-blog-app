const User = require("../models/User");
const Role = require("../models/Role");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { username, email, password, adminCode } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    let roleName = "user";
    if (adminCode && adminCode === process.env.ADMIN_CODE) {
      roleName = "admin";
    }
    let userRole = await Role.findOne({ name: roleName });
    if (!userRole) {
      userRole = await Role.create({ name: roleName, permissions: [] });
    }
    const user = new User({
      username,
      email,
      password: hashedPassword,
      roles: [userRole._id],
    });
    await user.save();
    if (roleName === "admin") {
      return res.status(201).json({ message: "Admin created successfully" });
    }
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate("roles");
    if (!user) {
      return res.status(400).json({ message: "Incorrect email or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect email or password" });
    }
    const token = jwt.sign(
      { userId: user._id, roles: user.roles.map((r) => r.name) },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        roles: user.roles.map((r) => r.name),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
