const path = require('path');
const stream = require('stream');
const fs = require('fs')
const replaceStream = require('replacestream')

async function repath(filename, stringFrom, stringTo) {
  const tempFilename = filename + '.temp';
  await fs.createReadStream(filename)
      .pipe(replaceStream(new RegExp(stringFrom, 'g'), stringTo))
      .pipe(fs.createWriteStream(tempFilename))
  fs.unlinkSync(filename, console.error);
  fs.renameSync(tempFilename, filename);
}

const stringFrom = process.argv[2];
const stringTo = process.argv[3];

for (let i = 4; i < process.argv.length; i++) {
  const filename = path.join(__dirname, process.argv[i]);
  try {
    if (fs.existsSync(filename)) repath(filename, stringFrom, stringTo);
  } catch(err) {
    console.error(err)
  }
}

// Repath transformer for `yarn copy:three:watch` (live development with `cpx --watch --transform`)
module.exports = function convert(filename) {
  if (path.extname(filename) === '.ts') {
    return replaceStream(new RegExp('../../three/src/Three', 'g'), '../../../src/Three');
  }
  if (path.extname(filename) === '.js') {
    return replaceStream(new RegExp('../../three/src/Three', 'g'), '../../../../three/examples/jsm/controls/three.module.js');
  }
  if (path.extname(filename) === '.map') {
    return replaceStream(new RegExp('../src', 'g'), '../../../../three-controls/src');
  }
  return new stream.PassThrough();
};