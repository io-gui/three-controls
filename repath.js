const path = require('path');
const stream = require('stream');
const fs = require('fs')
const replaceStream = require('replacestream')

// Repath transformer for `yarn copy:three:watch` (live development with `cpx --watch --transform`)
function getConvertStream(filename) {
  if (path.extname(filename) === '.ts') {
    return replaceStream(new RegExp('../../../three', 'g'), '../../../src/Three');
  } else if (path.extname(filename) === '.js') {
    return replaceStream(new RegExp('../../../three', 'g'), '../../../build/three.module.js');
  } else if (path.extname(filename) === '.map') {
    return replaceStream(new RegExp('../src', 'g'), '../../../../three-controls/src');
  }
  return new stream.PassThrough();
};

module.exports = getConvertStream;

async function repath(filename, convertStream) {
  const tempFilename = filename + '.temp';
  await fs.createReadStream(filename).pipe(convertStream).pipe(fs.createWriteStream(tempFilename))
  fs.unlinkSync(filename, console.error);
  fs.renameSync(tempFilename, filename);
}

const target = process.argv[2];
if (target !== 'build' && target !== 'three') {
  console.log(`Invalid target "${target}"! The first command argument should be "build" or "three.`);
}

for (let i = 3; i < process.argv.length; i++) {
  const filename = path.join(__dirname, process.argv[i]);
  try {
    if (fs.existsSync(filename)) {
      repath(filename, getConvertStream(filename));
    }
  } catch(err) {
    console.error(err)
  }
}

