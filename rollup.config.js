import path from 'path';

function output( file ) {
  return {
    format: 'es',
    file: file,
    cleanup: false,
    indent: '  '
  }
}

function external( list ) {
  const paths = [];
  for (var i = 0; i < list.length; i++) {
    paths.push( path.resolve( list[i] ) )
  }
  return paths;
}

export default [
  {
    input: 'examples/GLTFLoader.js',
    output: output( 'build/GLTFLoader.js' ),
    external: external( [
      './lib/three.module.js'
    ] )
  },
  {
    input: 'src/controls/DragControls.js',
    output: output( 'build/controls/DragControls.js' ),
    external: external( [
      './lib/three.module.js'
    ] )
  },
  {
    input: 'src/controls/EditorControls.js',
    output: output( 'build/controls/EditorControls.js' ),
    external: external( [
      'src/controls/CameraControls.js',
      './lib/three.module.js'
    ] )
  },
  {
    input: 'src/controls/OrbitControls.js',
    output: output( 'build/controls/OrbitControls.js' ),
    external: external( [
      'src/controls/CameraControls.js',
      './lib/three.module.js'
    ] )
  },
  {
    input: 'src/controls/SelectionControls.js',
    output: output( 'build/controls/SelectionControls.js' ),
    external: external( [
      'src/controls/CameraControls.js',
      './lib/three.module.js'
    ] )
  },
  {
    input: 'src/controls/TrackballControls.js',
    output: output( 'build/controls/TrackballControls.js' ),
    external: external( [
      'src/controls/CameraControls.js',
      './lib/three.module.js'
    ] )
  },
  {
    input: 'src/controls/TransformControlsCombined.js',
    output: output( 'build/controls/TransformControlsCombined.js' ),
    external: external( [
      './lib/three.module.js'
    ] )
  },
  {
    input: 'src/controls/TransformControlsRotate.js',
    output: output( 'build/controls/TransformControlsRotate.js' ),
    external: external( [
      './lib/three.module.js'
    ] )
  },
  {
    input: 'src/controls/TransformControlsScale.js',
    output: output( 'build/controls/TransformControlsScale.js' ),
    external: external( [
      './lib/three.module.js'
    ] )
  },
  {
    input: 'src/controls/TransformControlsStretch.js',
    output: output( 'build/controls/TransformControlsStretch.js' ),
    external: external( [
      './lib/three.module.js'
    ] )
  },
  {
    input: 'src/controls/TransformControlsTranslate.js',
    output: output( 'build/controls/TransformControlsTranslate.js' ),
    external: external( [
      './lib/three.module.js'
    ] )
  },
  {
    input: 'src/controls/CameraControls.js',
    output: output( 'build/controls/CameraControls.js' ),
    external: external( [
      './lib/three.module.js'
    ] )
  },
];
