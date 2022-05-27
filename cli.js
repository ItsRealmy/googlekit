const search = require("./index");

const query = [...process.argv.slice(2)].join(" ");

search(query, 0)
  .then((response) => {
    console.log(response.results);
  })
  .catch((err) => {
    console.error(err);
  });