const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const GithubUser = require('../lib/models/GithubUser');
jest.mock('../lib/utils/github');

describe('backend-gitty routes', () => {
  beforeEach(() => {
    return setup(pool);
  });

  afterAll(() => {
    pool.end();
  });

  it('creates a post when a user is logged in (POST)', async () => {
    const agent = request.agent(app);
    const expected = {
      id: expect.any(String),
      text: 'example',
      username: 'fake_github_user',
    };
    let res = await agent.post('/api/v1/posts').send(expected);
    expect(res.status).toEqual(401);

    await agent.get('/api/v1/github/login/callback?code=42').redirects(1);

    res = await agent.post('/api/v1/posts').send(expected);
    expect(res.body).toEqual(expected);
  });

  it('should get all posts if a user is signed in', async () => {
    const agent = request.agent(app);
    await GithubUser.insert({
      username: 'test_user',
      photoUrl: 'http://image.com/image.png',
    });
    const expected = [
      {
        text: 'This is a post!',
      },
    ];

    const res = await agent.get('/api/v1/posts');

    expect(res.body).toEqual(expected);
  });
});
