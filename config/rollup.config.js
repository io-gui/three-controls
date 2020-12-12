import dts from "rollup-plugin-dts";
import alias from '@rollup/plugin-alias';

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

function demodularize() {
  return {
    name: "demodularize",
    renderChunk( code ) {
      const threeClassNames = new Set();
      const exportClassNames = new Set();

      const threeImports = code.match( /(?<=import {)(.*)(?=} from '..\/..\/..\/build\/three.module.js')/g );
      for ( let i = 0; i < threeImports.length; i ++ ) {
        threeImports[ i ]
          .split( ',' )
          .map( Function.prototype.call, String.prototype.trim )
          .forEach( className => {
            threeClassNames.add( className );
          } );
      }

      threeClassNames.forEach( className => {
        code = code.replace( new RegExp( `(?<=new )(${className}\\()`, 'g' ), ( match, p1 ) => `THREE.${p1}` );
        code = code.replace( new RegExp( `(?<=: )(${className})`, 'g' ), ( match, p1 ) => `THREE.${p1}` );
        code = code.replace( new RegExp( `(?<=extends )(${className})`, 'g' ), ( match, p1 ) => `THREE.${p1}` );
        code = code.replace( new RegExp( `(?<=instanceof )(${className})`, 'g' ), ( match, p1 ) => `THREE.${p1}` );
      } );

      code = code.replace( new RegExp( '^import {.*three.module.js\';\n$', 'gm' ), '' );

      const localExports = code.match( /(?<=export {)(.*)(?=};)/g );
      for ( let i = 0; i < localExports.length; i ++ ) {
        localExports[ i ]
          .split( ',' )
          .map( Function.prototype.call, String.prototype.trim )
          .forEach( className => {
            exportClassNames.add( className );
          } );
      }

      code = code.replace( new RegExp( '^export {.*};$', 'gm' ), '' );

      exportClassNames.forEach( className => {
        code = code += `\nTHREE.${className} = ${className};`;
      } );

      const output = `(function() {\n${code}\n\n})();\n`;
      return {
        code: output,
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
        sourcemap: isDev,
        plugins: [
          replace("'three'", "'../../../build/three.module.js'"),
          isDev ? null : singleImportPaths(),
        ]
      },
      external: ['../../../build/three.module.js', ...externals ],
    },
    {
      input: `build/${filename.replace('.js', '.d.ts')}`,
      output: {
        file: `../three/examples/jsm/controls/${filename.replace('.js', '.d.ts')}`,
        format: "es",
        sourcemap: isDev,
        plugins: [
          replace("'three'", "'../../../build/three.module.js'"),
          isDev ? null : singleImportPaths(),
        ]
      },
      plugins: [
        dts(),
      ],
      external: ['../../../src/Three', ...externals ],
    },
    {
      input: `../three/examples/jsm/controls/${filename}`,
      output: {
        file: `../three/examples/js/controls/${filename}`,
        format: 'es',
        plugins: [
          demodularize(),
        ]
      },
      external: ['../../../build/three.module.js', ...externals ],
    },
  ]
}

export default [
  ...makeConfig( 'TransformControls.js' ),
  ...makeConfig( 'TrackballControls.js' ),
  ...makeConfig( 'OrbitControls.js' ),
  ...makeConfig( 'DragControls.js' ),
  ...makeConfig( 'MapControls.js', [ './OrbitControls' ] ),
];
