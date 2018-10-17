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
    input: 'src/controls/EditorCameraControls.js',
    output: output( 'build/controls/EditorCameraControls.js' ),
    external: external( [
      'src/controls/CameraControls.js',
      './lib/three.module.js'
    ] )
  },
  {
    input: 'src/controls/OrbitCameraControls.js',
    output: output( 'build/controls/OrbitCameraControls.js' ),
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
    input: 'src/controls/TrackballCameraControls.js',
    output: output( 'build/controls/TrackballCameraControls.js' ),
    external: external( [
      'src/controls/CameraControls.js',
      './lib/three.module.js'
    ] )
  },
  {
    input: 'src/controls/CombinedTransformControls.js',
    output: output( 'build/controls/CombinedTransformControls.js' ),
    external: external( [
      './lib/three.module.js'
    ] )
  },
  {
    input: 'src/controls/RotateTransformControls.js',
    output: output( 'build/controls/RotateTransformControls.js' ),
    external: external( [
      './lib/three.module.js'
    ] )
  },
  {
    input: 'src/controls/ScaleTransformControls.js',
    output: output( 'build/controls/ScaleTransformControls.js' ),
    external: external( [
      './lib/three.module.js'
    ] )
  },
  {
    input: 'src/controls/StretchTransformControls.js',
    output: output( 'build/controls/StretchTransformControls.js' ),
    external: external( [
      './lib/three.module.js'
    ] )
  },
  {
    input: 'src/controls/TranslateTransformControls.js',
    output: output( 'build/controls/TranslateTransformControls.js' ),
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
