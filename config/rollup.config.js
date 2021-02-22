import dts from "rollup-plugin-dts";

const isDev = !!process.env.DEV;

function singleImportPaths() {
  return {
    name: "singleImportPaths",
    renderChunk( code ) {
      const threeImports = code.match( /(?<=import {)(.*)(?=} from)/g );
      threeImports.forEach(imports => {
        let newLineImports = '\n';
        imports
        .split( ',' )
        .map( Function.prototype.call, String.prototype.trim )
        .forEach( className => {
          newLineImports += `\t${className},\n`;
        } );
        code = code.replace( imports, newLineImports );
      });
      return {
        code: code,
        map: null
      };
    }
  };
}

function replace(matchString, replacementString) {
  return {
    name: "replace",
    renderChunk( code ) {
      code = code.replace( matchString, replacementString );
      return {
        code: code,
        map: null
      };
    }
  };
}

const makeConfig = ( filename, externals = [] ) => {
  return [
    {
      input: `build/${filename}`,
      output: {
        file: `../three/examples/jsm/controls/${filename}`,
        format: 'es',
        sourcemap: false,
        plugins: [
          replace("'three'", "'../../../build/three.module.js'"),
          isDev ? null : singleImportPaths(),
        ]
      },
      external: ['../../../build/three.module.js', ...externals ],
    },
    // {
    //   input: `build/${filename.replace('.js', '.d.ts')}`,
    //   output: {
    //     file: `../three/examples/jsm/controls/${filename.replace('.js', '.d.ts')}`,
    //     format: "es",
    //     sourcemap: false,
    //     plugins: [
    //       replace("'three'", "'../../../build/three.module.js'"),
    //       isDev ? null : singleImportPaths(),
    //     ]
    //   },
    //   plugins: [
    //     dts(),
    //   ],
    //   external: ['../../../src/Three', ...externals ],
    // },
    // {
    //   input: `../three/examples/jsm/controls/${filename}`,
    //   output: {
    //     file: `../three/examples/js/controls/${filename}`,
    //     format: 'es',
    //     plugins: [
    //       demodularize(),
    //     ]
    //   },
    //   external: ['../../../build/three.module.js', ...externals ],
    // },
  ]
}

export default [
  ...makeConfig( 'TransformControls.js' ),
  ...makeConfig( 'TrackballControls.js' ),
  ...makeConfig( 'OrbitControls.js' ),
  ...makeConfig( 'DragControls.js' ),
  ...makeConfig( 'MapControls.js', [ './OrbitControls' ] ),
];
