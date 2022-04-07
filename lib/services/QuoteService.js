const fetch = require('cross-fetch');

module.exports = class QuoteService {
  static async getQuotes() {
    const apiArray = [
      'https://programming-quotes-api.herokuapp.com/quotes/random',
      'https://quotes.rest/qod?language=en',
      'https://api.quotable.io/random',
    ];

    const promiseArray = apiArray.map((api) => {
      return fetch(api);
    });

    const quoteArray = await Promise.all(promiseArray).then((response) => {
      return Promise.all(response.map((item) => item.json()));
    });

    const formattedArray = quoteArray.map((item) => {
      if (item.success) {
        return {
          author: item.contents.quotes[0].author,
          content: item.contents.quote[0].quote,
        };
      } else if (item.author) {
        return {
          author: item.author,
          content: item.content || item.en,
        };
      } else {
        return {
          author: 'not available',
          content: 'not available',
        };
      }
    });
    return formattedArray;
  }
};
