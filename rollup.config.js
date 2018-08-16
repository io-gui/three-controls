import path from 'path';

function configureOutput( file ) {
  return {
    format: 'es',
    file: file,
    cleanup: false,
    indent: '  '
  }
}

function externalPaths( list ) {
  const paths = [];
  for (var i = 0; i < list.length; i++) {
    paths.push( path.resolve( list[i] ) )
  }
  return paths;
}

export default [
  {
    input: 'src/Control.js',
    output: configureOutput( 'build/Control.js'),
    external: externalPaths( ['../three.js/build/three.module.js'] )
  },
  {
    input: 'src/ViewportControls/ViewportControls.js',
    output: configureOutput( 'build/ViewportControls/ViewportControls.js' ),
    external: externalPaths( [
      './src/Control.js',
      '../three.js/build/three.module.js'
    ] )
  },
  {
    input: 'src/ViewportControls/OrbitControls.js',
    output: configureOutput( 'build/ViewportControls/OrbitControls.js' ),
    external: externalPaths( [
      'src/ViewportControls/ViewportControls.js',
      '../three.js/build/three.module.js'
    ] )
  },
  {
    input: 'src/ViewportControls/TrackballControls.js',
    output: configureOutput( 'build/ViewportControls/TrackballControls.js' ),
    external: externalPaths( [
      'src/ViewportControls/ViewportControls.js',
      '../three.js/build/three.module.js'
    ] )
  },
  {
    input: 'src/ViewportControls/EditorControls.js',
    output: configureOutput( 'build/ViewportControls/EditorControls.js' ),
    external: externalPaths( [
      'src/ViewportControls/ViewportControls.js',
      '../three.js/build/three.module.js'
    ] )
  },
  {
    input: 'src/ObjectControls/ObjectControls.js',
    output: configureOutput( 'build/ObjectControls/ObjectControls.js' ),
    external: externalPaths( [
      'src/ObjectControls/ObjectControls.js',
      '../three.js/build/three.module.js'
    ] )
  },
  {
    input: 'src/ObjectControls/DragControls.js',
    output: configureOutput( 'build/ObjectControls/DragControls.js' ),
    external: externalPaths( [
      'src/ObjectControls/ObjectControls.js',
      '../three.js/build/three.module.js'
    ] )
  },
  {
    input: 'src/ObjectControls/TransformControls.js',
    output: configureOutput( 'build/ObjectControls/TransformControls.js' ),
    external: externalPaths( [
      'src/ObjectControls/ObjectControls.js',
      '../three.js/build/three.module.js'
    ] )
  }
];
