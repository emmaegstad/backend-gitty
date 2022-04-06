const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const Post = require('../models/Post');

module.exports = Router()
  .post('/', authenticate, (req, res, next) => {
    Post.insert({
      ...req.body,
      username: req.user.username,
    })
      .then((post) => res.send(post))
      .catch((error) => next(error));
  })
  .get('/', authenticate, (req, res) => {
    Post.findAll().then((posts) => res.send(posts));
  });
