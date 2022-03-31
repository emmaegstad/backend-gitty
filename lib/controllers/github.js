const { Router } = require('express');
const jwt = require('jsonwebtoken');
const authenticate = require('../middleware/authenticate');
const GithubUser = require('../models/GithubUser');
const { exchangeCodeForToken, getGithubProfile } = require('../utils/github');

const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;

module.exports = Router()
  .get('/login', async (req, res) => {
    res.redirect(
      `https://github.com/login/oauth/authorize?client_id=${process.env.CLIENT_ID}&scope=user&redirect_uri=${process.env.REDIRECT_URI}`
    );
  })
  .get('/login/callback', async (req, res, next) => {
    const { code } = req.query;
    const token = await exchangeCodeForToken(code);
    const profile = await getGithubProfile(token);
    let user = await GithubUser.findByUsername(profile.login);
    if (!user) {
      user = await GithubUser.insert({
        username: profile.login,
        email: profile.email,
        avatar: profile.avatar_url,
      });
    }

    try {
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
        .redirect('/api/v1/github/posts');
    } catch (error) {
      next(error);
    }
  })
  .get('/posts', authenticate, async (req, res) => {
    res.json(req.user);
  });
