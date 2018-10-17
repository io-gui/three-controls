import path from 'path';
import replace from 'rollup-plugin-post-replace';

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

const plugins = [replace({
  '../../../lib/three.module.js': '../lib/three.module.js',
  '../../lib/three.module.js': '../lib/three.module.js',
})];

export default [
  {
    input: 'src/controls/Selection.js',
    output: output( 'build/SelectionControls.js' ),
    external: external( [ './lib/three.module.js' ] ),
    plugins: plugins
  },
  {
    input: 'src/controls/camera/Editor.js',
    output: output( 'build/EditorCameraControls.js' ),
    external: external( [ './lib/three.module.js' ] ),
    plugins: plugins
  },
  {
    input: 'src/controls/camera/Orbit.js',
    output: output( 'build/OrbitCameraControls.js' ),
    external: external( [ './lib/three.module.js' ] ),
    plugins: plugins
  },
  {
    input: 'src/controls/camera/Trackball.js',
    output: output( 'build/TrackballCameraControls.js' ),
    external: external( [ './lib/three.module.js' ] ),
    plugins: plugins
  },
  {
    input: 'src/controls/transform/Drag.js',
    output: output( 'build/DragTransformControls.js' ),
    external: external( [ './lib/three.module.js' ] ),
    plugins: plugins
  },
  {
    input: 'src/controls/transform/Combined.js',
    output: output( 'build/CombinedTransformControls.js' ),
    external: external( [ './lib/three.module.js' ] ),
    plugins: plugins
  },
  {
    input: 'src/controls/transform/Rotate.js',
    output: output( 'build/RotateTransformControls.js' ),
    external: external( [ './lib/three.module.js' ] ),
    plugins: plugins
  },
  {
    input: 'src/controls/transform/Scale.js',
    output: output( 'build/ScaleTransformControls.js' ),
    external: external( [ './lib/three.module.js' ] ),
    plugins: plugins
  },
  {
    input: 'src/controls/transform/Stretch.js',
    output: output( 'build/StretchTransformControls.js' ),
    external: external( [ './lib/three.module.js' ] ),
    plugins: plugins
  },
  {
    input: 'src/controls/transform/Translate.js',
    output: output( 'build/TranslateTransformControls.js' ),
    external: external( [ './lib/three.module.js' ] )
  }
];
