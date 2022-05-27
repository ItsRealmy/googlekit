module.exports = (object, key) => {
  return object.filter((item, index) => {
    return index == object.findIndex((e) => {
      return e[key] == item[key];
    });
  });
}