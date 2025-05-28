const Comment = require("../models/Comment");
const Article = require("../models/Article");

exports.create = (io) => async (req, res) => {
  try {
    const { content, articleId } = req.body;
    const article = await Article.findById(articleId);
    if (!article) return res.status(404).json({ message: "Article not found" });
    const comment = new Comment({
      content,
      author: req.user.userId,
      article: articleId,
    });
    await comment.save();
    const populatedComment = await comment.populate("author", "username email");
    io.to(articleId).emit("newComment", populatedComment);
    res.status(201).json({
      message: "Comment created successfully",
      comment: populatedComment,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getByArticle = async (req, res) => {
  try {
    const comments = await Comment.find({ article: req.params.articleId })
      .populate("author", "username email")
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete = (io) => async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    if (comment.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    await comment.deleteOne();
    io.to(comment.article.toString()).emit("deleteComment", {
      commentId: comment._id,
    });
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createForArticle = (io) => async (req, res) => {
  try {
    const { content } = req.body;
    const articleId = req.params.articleId;
    const article = await Article.findById(articleId);
    if (!article) return res.status(404).json({ message: "Article not found" });
    const comment = new Comment({
      content,
      author: req.user.userId,
      article: articleId,
    });
    await comment.save();
    const populatedComment = await comment.populate("author", "username email");
    io.to(articleId).emit("newComment", populatedComment);
    res.status(201).json({
      message: "Comment created successfully",
      comment: populatedComment,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
