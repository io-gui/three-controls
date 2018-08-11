export default [
  {
    input: 'src/three.js-controls.js',
    experimentalDynamicImport: true,
    output: [
      {
        format: 'es',
        file: 'build/three.js-controls.js',
        indent: '  '
      }
    ]
  }
];
