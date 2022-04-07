const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const Post = require('../models/Post');

module.exports = Router()
  .post('/', authenticate, (req, res, next) => {
    Post.insert(req.body)
      .then((post) => res.send(post))
      .catch((error) => next(error));
  })
  .get('/', authenticate, (req, res, next) => {
    Post.findAll()
      .then((posts) => res.send(posts))
      .catch((error) => next(error));
  });
