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
    input: 'src/controls/Selection.js',
    output: output( 'build/controls/SelectionControls.js' ),
    external: external( [ './lib/three.module.js' ] )
  },
  {
    input: 'src/controls/camera/Editor.js',
    output: output( 'build/controls/EditorCameraControls.js' ),
    external: external( [ './lib/three.module.js' ] )
  },
  {
    input: 'src/controls/camera/Orbit.js',
    output: output( 'build/controls/OrbitCameraControls.js' ),
    external: external( [ './lib/three.module.js' ] )
  },
  {
    input: 'src/controls/camera/Trackball.js',
    output: output( 'build/controls/TrackballCameraControls.js' ),
    external: external( [ './lib/three.module.js' ] )
  },
  {
    input: 'src/controls/transform/Drag.js',
    output: output( 'build/controls/DragTransformControls.js' ),
    external: external( [ './lib/three.module.js' ] )
  },
  {
    input: 'src/controls/transform/Combined.js',
    output: output( 'build/controls/CombinedTransformControls.js' ),
    external: external( [ './lib/three.module.js' ] )
  },
  {
    input: 'src/controls/transform/Rotate.js',
    output: output( 'build/controls/RotateTransformControls.js' ),
    external: external( [ './lib/three.module.js' ] )
  },
  {
    input: 'src/controls/transform/Scale.js',
    output: output( 'build/controls/ScaleTransformControls.js' ),
    external: external( [ './lib/three.module.js' ] )
  },
  {
    input: 'src/controls/transform/Stretch.js',
    output: output( 'build/controls/StretchTransformControls.js' ),
    external: external( [ './lib/three.module.js' ] )
  },
  {
    input: 'src/controls/transform/Translate.js',
    output: output( 'build/controls/TranslateTransformControls.js' ),
    external: external( [ './lib/three.module.js' ] )
  }
];
