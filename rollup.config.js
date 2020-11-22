import dts from "rollup-plugin-dts";
import alias from '@rollup/plugin-alias';

const sourcemap = !!process.env.SOUCEMAPS;

const makeConfig = ( filename, externals = [] ) => {
  return [
    {
      input: `build/controls/${filename}`,
      output: {
        file: `../three/examples/jsm/controls/${filename}`,
        format: 'es',
        // sourcemap: sourcemap,
      },
      plugins: [
        alias({entries: [
          { find: 'three', replacement: '../../../build/three.module.js' }
        ]})
      ],
      external: ['../../../build/three.module.js', ...externals ],
    },
    {
      input: `build/controls/${filename.replace('.js', '.d.ts')}`,
      output: {
        file: `../three/examples/jsm/controls/${filename.replace('.js', '.d.ts')}`,
        format: "es",
        // sourcemap: sourcemap,
      },
      plugins: [
        alias({entries: [
          { find: 'three', replacement: '../../../src/Three' }
        ]}),
        dts(),
      ],
      external: ['../../../src/Three', ...externals ],
    },
  ]
}

export default [
  ...makeConfig( 'TransformControls.js' ),
  // ...makeConfig( 'TrackballControls.js' ),
  // ...makeConfig( 'OrbitControls.js' ),
  // ...makeConfig( 'DragControls.js' ),
  // ...makeConfig( 'MapControls.js', [ './OrbitControls' ] ),
];
