const axios = require('axios');
const { parse } = require('node-html-parser');

const removeDuplicates = require('./lib/removeDuplicates');

module.exports = async (query, page, options = {}) => {
  // Get HTML from Google (with Chrome user agent to make sure you get the correct result page)
  const resp = await axios.get('https://google.com/search', {
    params: {
      q: query,
      start: (page) ? page * 10 : 0,
      cr: (options.country) ? 'country' + options.country.toUpperCase() : null,
      hl: options.language || null
    },
  
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36'
      // Alternative user agent:
      // Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.82 Safari/537.36
    }
  })
    .then((resp) => {
      return resp.data;
    })
    .catch((err) => {
      console.error(err);
      return err;
    });

  if (resp) {
    const document = parse(resp);
    document.querySelectorAll('script').forEach((el) => el.remove());

    let returnObject = { errors: [], results: [], rawHTML: resp };

    let results = [];

    // All result elements
    const resultElements = document.querySelectorAll('#res .g, #res .g .FxLDp li');

    function parseResult(el) {
      try {
        let result = { url: '', title: '', description: '' };

        // Get URL
        const urlElement = el.querySelector('.yuRUbf a');
    
        // Check if it's an ad
        if (urlElement.querySelector('.CnP9N.U3A9Ac.irmCpc')) {
          throw new Error('Result is an ad');
        }

        if (urlElement && urlElement.rawAttributes.href) {
          try { new URL(urlElement.rawAttributes.href); }
          catch (err) {
            throw new Error('URL is not a valid URL');
          }

          result.url = urlElement.rawAttributes.href;
        } else {
          throw new Error('No URL present in result');
        }

        // Get title
        const titleElement = urlElement.querySelector('h3');

        if (titleElement && titleElement.innerText) {
          result.title = titleElement.innerText;
        }

        // Get description
        const descriptionElement = el.querySelector('.VwiC3b.yXK7lf.MUxGbd.yDYNvb.lyLwlc.lEBKkf > span:not(.MUxGbd.wuQ4Ob.WZ8Tjf)');

        if (descriptionElement && descriptionElement.innerText) {
          result.description = descriptionElement.innerText;
        }

        results.push(result);
      } catch (err) {
        returnObject.errors.push(err);
      }
    }

    for (const el of resultElements) {
      parseResult(el);
    }

    // Remove duplicates
    results = removeDuplicates(results, 'url');

    returnObject.results = results;

    return returnObject;
  }
  else {
    throw new Error('Error requesting Google');
  }
}