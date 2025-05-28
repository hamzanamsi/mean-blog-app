const Article = require("../models/Article");
const { validationResult } = require("express-validator");

exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { title, content, tags } = req.body;
    const article = new Article({
      title,
      content,
      tags,
      author: req.user.userId,
    });
    await article.save();
    await article.populate("author", "username email");
    res.status(201).json({ message: "Article created successfully", article });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const articles = await Article.find().populate("author", "username email");
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).populate(
      "author",
      "username email"
    );
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.json(article);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { title, content, tags } = req.body;
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });
    if (article.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    article.title = title || article.title;
    article.content = content || article.content;
    article.tags = tags || article.tags;
    await article.save();
    await article.populate("author", "username email");
    res.json(article);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });
    if (article.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    await article.deleteOne();
    res.json({ message: "Article deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.patchUpdate = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const articleId = req.params.id;
   
    if (!articleId || typeof articleId !== 'string') {
      return res.status(400).json({ 
        message: "Article ID is required and must be a string",
        code: "INVALID_ARTICLE_ID"
      });
    }

    const cleanArticleId = articleId.replace(/^\"|\"$/g, '');
    
    if (!/^[0-9a-fA-F]{24}$/.test(cleanArticleId)) {
      return res.status(400).json({ 
        message: "Invalid article ID format",
        code: "INVALID_ID_FORMAT",
        receivedId: articleId
      });
    }

    const article = await Article.findById(cleanArticleId);
    
    if (!article) {
      return res.status(404).json({ 
        message: "Article not found",
        code: "ARTICLE_NOT_FOUND"
      });
    }
    
    if (article.author.toString() !== req.user.userId) {
      return res.status(403).json({ 
        message: "Unauthorized: You can only update your own articles",
        code: "UNAUTHORIZED_UPDATE"
      });
    }
    
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (tags !== undefined) updates.tags = tags;
    
    Object.assign(article, updates);
    
    const updatedArticle = await article.save();
    await updatedArticle.populate("author", "username email");
    
    res.json({
      message: "Article updated successfully",
      article: updatedArticle
    });
    
  } catch (err) {
    console.error('Error in patchUpdate:', err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        message: `Invalid ID format: ${err.value}`,
        code: "INVALID_ID_FORMAT",
        error: err.message
      });
    }
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        errors: Object.values(err.errors).map(e => e.message)
      });
    }
    
    res.status(500).json({ 
      message: "Failed to update article",
      code: "UPDATE_ERROR",
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};
