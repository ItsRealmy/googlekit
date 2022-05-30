const search = require("./index");

const query = [...process.argv.slice(2)].join(" ");

search(query, 0)
  .then((response) => {
    console.log('Results:');
    console.log(response.results);
    console.log('Meta:');
    console.log(response.meta);
  })
  .catch((err) => {
    console.error(err);
  });