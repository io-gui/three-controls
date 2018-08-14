import path from 'path';

export default [
  {
    input: 'src/TransformControls/TransformControls.js',
    output: [
      {
        format: 'es',
        cleanup: false,
        file: 'build/TransformControls.js',
        indent: '  '
      }
    ],
    external: [ path.resolve('../three.js/build/three.module.js') ]
  },
  {
    input: 'src/OrbitControls/OrbitControls.js',
    output: [
      {
        format: 'es',
        cleanup: false,
        file: 'build/OrbitControls.js',
        indent: '  '
      }
    ],
    external: [ path.resolve('../three.js/build/three.module.js') ]
  }
];
