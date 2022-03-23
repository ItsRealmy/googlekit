const axios = require("axios");
const { parse } = require("node-html-parser");

module.exports = async (query, page) => {
  // Get HTML from Google (with Chrome user agent to make sure you get the correct result page)
  const resp = await axios.get("https://google.com/search", {
    params: {
      q: query,
      start: (page) ? page * 10 : 0
    },

    headers: {
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.82 Safari/537.36"
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

    let results = [];

    // All result elements
    const resultElements = document.querySelectorAll(`.jtfYYd,.g>div:has(div>div>a>h3)`);

    for (const result of resultElements) {
      // URL
      const rawLink = result.querySelector("div>div>a");
      if (!rawLink) continue;
      const url = rawLink.rawAttributes.href;

      // Title
      const titleEl = rawLink.querySelector(".LC20lb.MBeuO.DKV0Md");
      let title;
      if (titleEl) title = titleEl.innerText;
      else title = "This item doesn't have a title.";

      // Description
      const descEl = result.querySelector(".NJo7tc.Z26q7c.uUuwM > div > span") || result.querySelector(".IsZvec > div > span");
      let description;
      if (descEl) description = descEl.innerText;
      else description = "This item doesn't have a description.";

      // Push to result list
      results.push({ url: url.trim(), title: title.trim(), description: description.trim() });
    }

    results = results.filter((item, index) => {
      return index == results.findIndex((e) => {
        return e.url == item.url;
      });
    });

    results = results.filter((item) => {
      try { new URL(item.url); return true; } catch { return false; }
    });

    return results;
  }
  else return false;
}