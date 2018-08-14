import path from 'path';

export default [
  {
    input: 'src/Control.js',
    output: [
      {
        format: 'es',
        cleanup: false,
        file: 'build/Control.js',
        indent: '  '
      }
    ],
    external: [ path.resolve('../three.js/build/three.module.js') ]
  },
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
    external: [
      path.resolve('../three.js/build/three.module.js'),
      path.resolve('./src/Control.js')
    ]
  },
  {
    input: 'src/CameraControls/OrbitControls.js',
    output: [
      {
        format: 'es',
        cleanup: false,
        file: 'build/OrbitControls.js',
        indent: '  '
      }
    ],
    external: [
      path.resolve('../three.js/build/three.module.js'),
      path.resolve('./src/Control.js')
    ]
  },
  {
    input: 'src/CameraControls/TrackballControls.js',
    output: [
      {
        format: 'es',
        cleanup: false,
        file: 'build/TrackballControls.js',
        indent: '  '
      }
    ],
    external: [
      path.resolve('../three.js/build/three.module.js'),
      path.resolve('./src/Control.js')
    ]
  }
];
