import dts from "rollup-plugin-dts";
import alias from '@rollup/plugin-alias';

const config = [
  {
    input: 'build/controls/TransformControls.js',
    output: {
      file: '../three/examples/jsm/controls/TransformControls.js',
      format: 'es',
      // sourcemap: true,
    },
    plugins: [
      alias({entries: [
        { find: 'three', replacement: '../../../build/three.module.js' }
      ]})
    ],
    external: ['../../../build/three.module.js'],
  },
  {
    input: "build/controls/TransformControls.d.ts",
    output: {
      file: "../three/examples/jsm/controls/TransformControls.d.ts",
      format: "es",
      // sourcemap: true,
    },
    plugins: [
      alias({entries: [
        { find: 'three', replacement: '../../../src/Three' }
      ]}),
      dts(),
    ],
    external: ['../../../src/Three'],
  },
];

export default config;
