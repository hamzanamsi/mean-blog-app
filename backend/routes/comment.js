const express = require("express");
const router = express.Router({ mergeParams: true });
const commentController = require("../controllers/commentController");
const auth = require("../middlewares/authMiddleware");

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Create a new comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               article:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /api/articles/{articleId}/comments:
 *   post:
 *     summary: Create a comment for an article
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: articleId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Article not found
 */
module.exports = (io) => {
  router.post("/", auth, commentController.create(io));
  router.post(
    "/articles/:articleId/comments",
    auth,
    commentController.createForArticle(io)
  );
  /**
   * @swagger
   * /api/comments/{articleId}:
   *   get:
   *     summary: Get comments for an article
   *     tags: [Comments]
   *     parameters:
   *       - in: path
   *         name: articleId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: List of comments
   *       404:
   *         description: Article not found
   */
  router.get("/:articleId", commentController.getByArticle);
  /**
   * @swagger
   * /api/comments/{id}:
   *   delete:
   *     summary: Delete a comment
   *     tags: [Comments]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Comment deleted
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Comment not found
   */
  router.delete("/:id", auth, commentController.delete(io));
  return router;
};
