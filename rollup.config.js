import path from 'path';

export default [
  {
    input: 'src/Controls.js',
    experimentalDynamicImport: true,
    output: [
      {
        format: 'es',
        file: 'build/Controls.js',
        indent: '  '
      }
    ],
    external: [ path.resolve('../three.js/build/three.module.js') ]
  }
];
