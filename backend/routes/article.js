const express = require("express");
const router = express.Router();
const articleController = require("../controllers/articleController");
const auth = require("../middlewares/authMiddleware");
const checkPermission = require("../middlewares/checkPermission");
const { body } = require("express-validator");

/**
 * @swagger
 * /api/articles:
 *   post:
 *     summary: Create a new article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Article created
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  auth,
  [
    body("title")
      .isLength({ min: 3 })
      .trim()
      .escape()
      .withMessage("Titre trop court"),
    body("content")
      .isLength({ min: 10 })
      .trim()
      .escape()
      .withMessage("Contenu trop court"),
    body("tags").optional().isArray(),
    body("tags.*").optional().trim().escape(),
  ],
  articleController.create
);

/**
 * @swagger
 * /api/articles:
 *   get:
 *     summary: Get all articles
 *     tags: [Articles]
 *     responses:
 *       200:
 *         description: List of articles
 */
router.get("/", articleController.getAll);

/**
 * @swagger
 * /api/articles/{id}:
 *   get:
 *     summary: Get an article by ID
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Article data
 *       404:
 *         description: Article not found
 */
router.get("/:id", articleController.getOne);

/**
 * @swagger
 * /api/articles/{id}:
 *   patch:
 *     summary: Partially update an article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The article ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Article updated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Article not found
 */
router.patch(
  "/:id",
  auth,
  checkPermission("update:article"),
  [
    body()
      .custom(body => {
        const updates = Object.keys(body);
        if (updates.length === 0) {
          throw new Error('At least one field must be provided for update');
        }
        return true;
      }),
    body("title").optional().isLength({ min: 3 }).trim().escape(),
    body("content").optional().isLength({ min: 10 }).trim().escape(),
    body("tags").optional().isArray(),
    body("tags.*").optional().trim().escape(),
  ],
  (req, res, next) => {
    console.log('PATCH request body:', req.body);
    next();
  },
  articleController.patchUpdate
);

/**
 * @swagger
 * /api/articles/{id}:
 *   put:
 *     summary: Update an entire article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The article ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Article updated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Article not found
 */
router.put(
  "/:id",
  auth,
  checkPermission("update:article"),
  [
    body("title").isLength({ min: 3 }).trim().escape(),
    body("content").isLength({ min: 10 }).trim().escape(),
    body("tags").optional().isArray(),
    body("tags.*").optional().trim().escape(),
  ],
  articleController.update
);

/**
 * @swagger
 * /api/articles/{id}:
 *   delete:
 *     summary: Delete an article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The article ID
 *     responses:
 *       204:
 *         description: Article deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Article not found
 */
router.delete(
  "/:id",
  auth,
  checkPermission("delete:article"),
  articleController.delete
);

module.exports = router;
