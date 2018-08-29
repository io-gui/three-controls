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
    input: 'src/Control.js',
    output: output( 'build/Control.js'),
    external: external( ['../three.js/build/three.module.js'] )
  },
  {
    input: 'src/Selection.js',
    output: output( 'build/Selection.js'),
    external: external( ['../three.js/build/three.module.js'] )
  },
  {
    input: 'src/controls/ViewportControls.js',
    output: output( 'build/controls/ViewportControls.js' ),
    external: external( [
      './src/Control.js',
      '../three.js/build/three.module.js'
    ] )
  },
  {
    input: 'src/controls/OrbitControls.js',
    output: output( 'build/controls/OrbitControls.js' ),
    external: external( [
      'src/controls/ViewportControls.js',
      '../three.js/build/three.module.js'
    ] )
  },
  {
    input: 'src/controls/SelectionControls.js',
    output: output( 'build/controls/SelectionControls.js' ),
    external: external( [
      'src/controls/ViewportControls.js',
      '../three.js/build/three.module.js'
    ] )
  },
  {
    input: 'src/controls/TrackballControls.js',
    output: output( 'build/controls/TrackballControls.js' ),
    external: external( [
      'src/controls/ViewportControls.js',
      '../three.js/build/three.module.js'
    ] )
  },
  {
    input: 'src/controls/EditorControls.js',
    output: output( 'build/controls/EditorControls.js' ),
    external: external( [
      'src/controls/ViewportControls.js',
      '../three.js/build/three.module.js'
    ] )
  },
  {
    input: 'src/controls/ObjectControls.js',
    output: output( 'build/controls/ObjectControls.js' ),
    external: external( [
      'src/controls/ObjectControls.js',
      '../three.js/build/three.module.js'
    ] )
  },
  {
    input: 'src/controls/DragControls.js',
    output: output( 'build/controls/DragControls.js' ),
    external: external( [
      'src/controls/ObjectControls.js',
      '../three.js/build/three.module.js'
    ] )
  },
  {
    input: 'src/controls/TransformControls.js',
    output: output( 'build/controls/TransformControls.js' ),
    external: external( [
      'src/controls/ObjectControls.js',
      '../three.js/build/three.module.js'
    ] )
  }
];
