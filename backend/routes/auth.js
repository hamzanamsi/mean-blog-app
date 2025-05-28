const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { body } = require("express-validator");
const auth = require("../middlewares/authMiddleware");

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered
 *       400:
 *         description: Invalid input
 */
// Register
router.post(
  "/register",
  [
    body("username")
      .isLength({ min: 3 })
      .trim()
      .escape()
      .withMessage("Nom d'utilisateur trop court"),
    body("email").isEmail().normalizeEmail().withMessage("Email invalide"),
    body("password")
      .isLength({ min: 6 })
      .trim()
      .escape()
      .withMessage("Mot de passe trop court"),
  ],
  authController.register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in
 *       400:
 *         description: Invalid input
 */
// Login
router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail().withMessage("Email invalide"),
    body("password")
      .notEmpty()
      .trim()
      .escape()
      .withMessage("Mot de passe requis"),
  ],
  authController.login
);

router.get("/me", auth, (req, res) => {
  // req.user should be set by your auth middleware
  res.json(req.user);
});

module.exports = router;
