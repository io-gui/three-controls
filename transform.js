const path = require("path");
const stream = require("stream");
const fs = require('fs')
const replaceStream = require('replacestream')

module.exports = function convert(filename) {
  if (path.extname(filename) === ".ts") {
    return replaceStream(/..\/..\/three\/src\/Three/g, '..\/..\/..\/src\/Three');
  }
  if (path.extname(filename) === ".js") {
    return replaceStream(/..\/..\/three\/src\/Three/g, '..\/..\/..\/build\/three.module.js');
  }
  return new stream.PassThrough();
};