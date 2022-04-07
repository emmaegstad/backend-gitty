const { Router } = require('express');
const QuoteService = require('../services/QuoteService');

module.exports = Router().get('/', (req, res, next) => {
  QuoteService.getQuotes()
    .then((quotes) => res.send(quotes))
    .catch((error) => next(error));
});
