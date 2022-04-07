const { Router } = require('express');
const jwt = require('jsonwebtoken');
const authenticate = require('../middleware/authenticate');
const GithubUser = require('../models/GithubUser');
const { exchangeCodeForToken, getGithubProfile } = require('../utils/github');

const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;

module.exports = Router()
  .get('/login', (req, res) => {
    res.redirect(
      `https://github.com/login/oauth/authorize?client_id=${process.env.CLIENT_ID}&scope=user&redirect_uri=${process.env.REDIRECT_URI}`
    );
  })
  .get('/login/callback', async (req, res, next) => {
    let current = {};
    exchangeCodeForToken(req.query.code)
      .then((token) => getGithubProfile(token))
      .then((profile) => {
        current = profile;
        GithubUser.findByUsername(profile.login);
      })
      .then((user) => {
        if (!user)
          GithubUser.insert({
            username: current.login,
            email: current.email,
            avatar: current.avatar_url,
          }).then((user) => {
            res
              .cookie(
                process.env.COOKIE_NAME,
                jwt.sign({ ...user }, process.env.JWT_SECRET, {
                  expiresIn: '1 day',
                }),
                {
                  httpOnly: true,
                  maxAge: ONE_DAY_IN_MS,
                }
              )
              .redirect('/api/v1/posts');
          });
      })
      .catch((error) => next(error));
  })

  .get('/posts', authenticate, async (req, res) => {
    res.json(req.user);
  })
  .delete('/sessions', (req, res) => {
    res
      .clearCookie(process.env.COOKIE_NAME)
      .json({ success: true, message: 'Signed out successfully!' });
  });
