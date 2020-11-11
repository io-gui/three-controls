import { Quaternion, Mesh, Euler, Vector3, Vector4, Matrix4, Line, MeshBasicMaterial, Color,
  OctahedronBufferGeometry, TorusBufferGeometry, SphereBufferGeometry,
  BoxBufferGeometry, PlaneBufferGeometry, CylinderBufferGeometry,
  BufferGeometry, Float32BufferAttribute, OrthographicCamera, PerspectiveCamera } from '../../../three';

import { ControlsHelper, ControlsHelperGeometrySpec } from './ControlsHelper.js';

export const CircleGeometry = function ( radius: number, arc: number ) {
  const geometry = new BufferGeometry( );
  const vertices = [];
  for ( let i = 0; i <= 64 * arc; ++ i ) {
    vertices.push( 0, Math.cos( i / 32 * Math.PI ) * radius, Math.sin( i / 32 * Math.PI ) * radius );
  }
  geometry.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
  return geometry;
};

export const scaleHandleGeometry = new BoxBufferGeometry( 0.125, 0.125, 0.125 );

export const arrowGeometry = new CylinderBufferGeometry( 0, 0.05, 0.2, 12, 1, false );

export const lineGeometry = new BufferGeometry();
lineGeometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0,  1, 0, 0 ], 3 ) );

const zeroVector = new Vector3( 0, 0, 0 );
const lookAtMatrix = new Matrix4();
const alignVector = new Vector3( 0, 1, 0 );
const tempQuaternion = new Quaternion();
const tempQuaternion2 = new Quaternion();
const unitX = new Vector3( 1, 0, 0 );
const unitY = new Vector3( 0, 1, 0 );
const unitZ = new Vector3( 0, 0, 1 );

// Hide translate and scale axis facing the camera
const AXIS_HIDE_TRESHOLD = 0.99;
const PLANE_HIDE_TRESHOLD = 0.05;
const AXIS_FLIP_TRESHOLD = 0.0;

export const translateHelperGeometrySpec: [ Mesh | Line, ControlsHelperGeometrySpec ][] = [
  [
    new Mesh( arrowGeometry ),
    {
      type: 'translate',
      axis: 'X',
      tag: 'fwd',
      color: new Vector4( 1, 0, 0, 1 ),
      position: new Vector3( 0.8, 0, 0 ),
      rotation: new Euler( 0, 0, - Math.PI / 2 ),
    }
  ], [
    new Mesh( arrowGeometry ),
    {
      type: 'translate',
      axis: 'X',
      tag: 'bwd',
      color: new Vector4( 1, 0, 0, 1 ),
      position: new Vector3( 0.8, 0, 0 ),
      rotation: new Euler( 0, 0, Math.PI / 2 ),
    }
  ], [
    new Line( lineGeometry ),
    {
      type: 'translate',
      axis: 'X',
      color: new Vector4( 1, 0, 0, 1 ),
      scale: new Vector3( 0.8, 0.8, 0.8 )
    }
  ], [
    new Mesh( arrowGeometry ),
    {
      type: 'translate',
      axis: 'Y',
      tag: 'fwd',
      color: new Vector4( 0, 1, 0, 1 ),
      position: new Vector3( 0, 0.8, 0 ),
    }
  ], [
    new Mesh( arrowGeometry ),
    {
      type: 'translate',
      axis: 'Y',
      tag: 'bwd',
      color: new Vector4( 0, 1, 0, 1 ),
      position: new Vector3( 0, 0.8, 0 ),
      rotation: new Euler( Math.PI, 0, 0 ),
    }
  ], [
    new Line( lineGeometry ),
    {
      type: 'translate',
      axis: 'Y',
      color: new Vector4( 0, 1, 0, 1 ),
      rotation: new Euler( 0, 0, Math.PI / 2 ),
      scale: new Vector3( 0.8, 0.8, 0.8 )
    }
  ], [
    new Mesh( arrowGeometry ),
    {
      type: 'translate',
      axis: 'Z',
      tag: 'fwd',
      color: new Vector4( 0, 0, 1, 1 ),
      position: new Vector3( 0, 0, 0.8 ),
      rotation: new Euler( Math.PI / 2, 0, 0 ),
    }
  ], [
    new Mesh( arrowGeometry ),
    {
      type: 'translate',
      axis: 'Z',
      tag: 'bwd',
      color: new Vector4( 0, 0, 1, 1 ),
      position: new Vector3( 0, 0, 0.8 ),
      rotation: new Euler( - Math.PI / 2, 0, 0 ),
    }
  ], [
    new Line( lineGeometry ),
    {
      type: 'translate',
      axis: 'Z',
      color: new Vector4( 0, 0, 1, 1 ),
      rotation: new Euler( 0, - Math.PI / 2, 0 ),
      scale: new Vector3( 0.8, 0.8, 0.8 )
    }
  ], [
    new Mesh( new OctahedronBufferGeometry( 0.1, 0 ) ),
    {
      type: 'translate',
      axis: 'XYZ',
      color: new Vector4( 1, 1, 1, 0.25 ),
      position: new Vector3( 0, 0, 0 ),
      rotation: new Euler( 0, 0, 0 )
    }
  ], [
    new Mesh( new PlaneBufferGeometry( 0.3, 0.3 ) ),
    {
      type: 'translate',
      axis: 'XY',
      color: new Vector4( 1, 1, 0, 0.05 ),
      position: new Vector3( 0.15, 0.15, 0)
    }
  ], [
    new Line( lineGeometry ),
    {
      type: 'translate',
      axis: 'XY',
      color: new Vector4( 1, 1, 0, 1 ),
      position: new Vector3( 0.15, 0.3, 0 ),
      scale: new Vector3( 0.15, 1, 1 )
    }
  ], [
    new Line( lineGeometry ),
    {
      type: 'translate',
      axis: 'XY',
      color: new Vector4( 1, 1, 0, 1 ),
      position: new Vector3( 0.3, 0.15, 0 ),
      rotation: new Euler( 0, 0, Math.PI / 2 ),
      scale: new Vector3( 0.15, 1, 1 )
    }
  ], [
    new Mesh( new PlaneBufferGeometry( 0.3, 0.3 ) ),
    {
      type: 'translate',
      axis: 'YZ',
      color: new Vector4( 0, 1, 1, 0.05 ),
      position: new Vector3( 0, 0.15, 0.15 ),
      rotation: new Euler( 0, Math.PI / 2, 0 )
    }
  ], [
    new Line( lineGeometry ),
    {
      type: 'translate',
      axis: 'YZ',
      color: new Vector4( 0, 1, 1, 1 ),
      position: new Vector3( 0, 0.15, 0.3 ),
      rotation: new Euler( 0, 0, Math.PI / 2 ),
      scale: new Vector3( 0.15, 1, 1 )
    }
  ], [
    new Line( lineGeometry ),
    {
      type: 'translate',
      axis: 'YZ',
      color: new Vector4( 0, 1, 1, 1 ),
      position: new Vector3( 0, 0.3, 0.15 ),
      rotation: new Euler( 0, - Math.PI / 2, 0 ),
      scale: new Vector3( 0.15, 1, 1 )
    }
  ], [
    new Mesh( new PlaneBufferGeometry( 0.3, 0.3 ) ),
    {
      type: 'translate',
      axis: 'XZ',
      color: new Vector4( 1, 0, 1, 0.05 ),
      position: new Vector3( 0.15, 0, 0.15 ),
      rotation: new Euler( - Math.PI / 2, 0, 0 )
    }
  ], [
    new Line( lineGeometry ),
    {
      type: 'translate',
      axis: 'XZ',
      color: new Vector4( 1, 0, 1, 1 ),
      position: new Vector3( 0.15, 0, 0.3 ),
      scale: new Vector3( 0.15, 1, 1 )
    }
  ], [
    new Line( lineGeometry ),
    {
      type: 'translate',
      axis: 'XZ',
      color: new Vector4( 1, 0, 1, 1 ),
      position: new Vector3( 0.3, 0, 0.15 ),
      rotation: new Euler( 0, - Math.PI / 2, 0 ),
      scale: new Vector3( 0.15, 1, 1 )
    }
  ],
  // Pickers
  [
    new Mesh( new CylinderBufferGeometry( 0.3, 0, 0.6, 4, 1, false ) ),
    {
      type: 'translate',
      axis: 'X',
      tag: 'picker',
      color: new Vector4( 1, 1, 1, 0 ),
      position: new Vector3( 0.6, 0, 0 ),
      rotation: new Euler( Math.PI / 4, 0, - Math.PI / 2 ),
    }
  ], [
    new Mesh( new CylinderBufferGeometry( 0.3, 0, 0.6, 4, 1, false ) ),
    {
      type: 'translate',
      axis: 'Y',
      tag: 'picker',
      color: new Vector4( 1, 1, 1, 0 ),
      position: new Vector3( 0, 0.6, 0),
      rotation: new Euler( 0, Math.PI / 4, 0 ),
    }
  ], [
    new Mesh( new CylinderBufferGeometry( 0.3, 0, 0.6, 4, 1, false ) ),
    {
      type: 'translate',
      axis: 'Z',
      tag: 'picker',
      color: new Vector4( 1, 1, 1, 0 ),
      position: new Vector3( 0, 0, 0.6 ),
      rotation: new Euler( Math.PI / 2, Math.PI / 4, 0 ),
    }
  ], [
    new Mesh( new OctahedronBufferGeometry( 0.3, 0 ) ),
    {
      type: 'translate',
      axis: 'XYZ',
      tag: 'picker',
      color: new Vector4( 1, 1, 1, 0 ),
    }
  ], [
    new Mesh( new PlaneBufferGeometry( 0.5, 0.5 ) ),
    {
      type: 'translate',
      axis: 'XY',
      tag: 'picker',
      color: new Vector4( 1, 1, 1, 0 ),
      position: new Vector3( 0.25, 0.25, 0),
    }
  ], [
    new Mesh( new PlaneBufferGeometry( 0.5, 0.5 ) ),
    {
      type: 'translate',
      axis: 'YZ',
      tag: 'picker',
      color: new Vector4( 1, 1, 1, 0 ),
      position: new Vector3( 0, 0.25, 0.25 ),
      rotation: new Euler( 0, Math.PI / 2, 0 ),
    }
  ], [
    new Mesh( new PlaneBufferGeometry( 0.5, 0.5 ) ),
    {
      type: 'translate',
      axis: 'XZ',
      tag: 'picker',
      color: new Vector4( 1, 1, 1, 0 ),
      position: new Vector3( 0.25, 0, 0.25 ),
      rotation: new Euler( - Math.PI / 2, 0, 0 ),
    }
  ],
];

export const rotateHelperGeometrySpec: [ Mesh | Line, ControlsHelperGeometrySpec ][] = [
  [
    new Line( CircleGeometry( 0.9, 0.5 ) ),
    {
      type: 'rotate',
      axis: 'X',
      color: new Vector4( 1, 0, 0, 1 ),
    }
  ], [
    new Mesh( new OctahedronBufferGeometry( 0.04, 0 ) ),
    {
      type: 'rotate',
      axis: 'X',
      color: new Vector4( 1, 0, 0, 1 ),
      position: new Vector3( 0, 0, 0.893 ),
      scale: new Vector3( 1, 3, 1 )
    }
  ], [
    new Line( CircleGeometry( 0.9, 0.5 ) ),
    {
      type: 'rotate',
      axis: 'Y',
      color: new Vector4( 0, 1, 0, 1 ),
      rotation: new Euler( 0, 0, - Math.PI / 2 )
    }
  ], [
    new Mesh( new OctahedronBufferGeometry( 0.04, 0 ) ),
    {
      type: 'rotate',
      axis: 'Y',
      color: new Vector4( 0, 1, 0, 1 ),
      position: new Vector3( 0, 0, 0.893 ),
      scale: new Vector3( 3, 1, 1 )
    }
  ], [
    new Line( CircleGeometry( 0.9, 0.5 ) ),
    {
      type: 'rotate',
      axis: 'Z',
      color: new Vector4( 0, 0, 1, 1 ),
      rotation: new Euler( 0, Math.PI / 2, 0 )
    }
  ], [
    new Mesh( new OctahedronBufferGeometry( 0.04, 0 ) ),
    {
      type: 'rotate',
      axis: 'Z',
      color: new Vector4( 0, 0, 1, 1 ),
      position: new Vector3( 0.893, 0, 0 ),
      scale: new Vector3( 1, 3, 1 )
    }
  ], [
    new Line( CircleGeometry( 1.3, 1 ) ),
    {
      type: 'rotate',
      axis: 'E',
      color: new Vector4( 1, 1, 0, 0.25 ),
      rotation: new Euler( 0, Math.PI / 2, 0 )
    }
  ], [
    new Line( CircleGeometry( 0.9, 1 ) ),
    {
      type: 'rotate',
      axis: 'XYZE',
      color: new Vector4( 0.25, 0.25, 0.25, 1 ),
      rotation: new Euler( 0, Math.PI / 2, 0 )
    }
  ],
  // Pickers
  [
    new Mesh( new TorusBufferGeometry( 0.9, 0.1, 4, 24 ) ),
    {
      type: 'rotate',
      axis: 'X',
      tag: 'picker',
      color: new Vector4( 1, 1, 1, 0 ),
      position: new Vector3( 0, 0, 0 ),
      rotation: new Euler( 0, - Math.PI / 2, - Math.PI / 2 ),
    }
  ], [
    new Mesh( new TorusBufferGeometry( 0.9, 0.1, 4, 24 ) ),
    {
      type: 'rotate',
      axis: 'Y',
      tag: 'picker',
      color: new Vector4( 1, 1, 1, 0 ),
      position: new Vector3( 0, 0, 0 ),
      rotation: new Euler( Math.PI / 2, 0, 0 ),
    }
  ], [
    new Mesh( new TorusBufferGeometry( 0.9, 0.1, 4, 24 ) ),
    {
      type: 'rotate',
      axis: 'Z',
      tag: 'picker',
      color: new Vector4( 1, 1, 1, 0 ),
      position: new Vector3( 0, 0, 0 ),
      rotation: new Euler( 0, 0, - Math.PI / 2 ),
    }
  ], [
    new Mesh( new TorusBufferGeometry( 1.3, 0.1, 2, 24 ) ),
    {
      type: 'rotate',
      axis: 'E',
      tag: 'picker',
      color: new Vector4( 1, 1, 1, 0 ),
    }
  ], [
    new Mesh( new SphereBufferGeometry( 0.9, 10, 8 ) ),
    {
      type: 'rotate',
      axis: 'XYZE',
      color: new Vector4( 1, 1, 1, 0 ),
      tag: 'picker',
      position: new Vector3( 0, 0, -1 ),
    }
  ]
];

export const scaleHelperGeometrySpec: [ Mesh | Line, ControlsHelperGeometrySpec ][] = [
  [
    new Mesh( new BoxBufferGeometry( 0.125, 0.125, 0.125 ) ),
    {
      type: 'scale',
      axis: 'XYZX',
      color: new Vector4( 0.75, 0.75, 0.75, 1 ),
      position: new Vector3( 1.1, 0, 0)
    }
  ], [
    new Mesh( new BoxBufferGeometry( 0.125, 0.125, 0.125 ) ),
    {
      type: 'scale',
      axis: 'XYZY',
      color: new Vector4( 0.75, 0.75, 0.75, 1 ),
      position: new Vector3( 0, 1.1, 0)
    }
  ], [
    new Mesh( new BoxBufferGeometry( 0.125, 0.125, 0.125 ) ),
    {
      type: 'scale',
      axis: 'XYZZ',
      color: new Vector4( 0.75, 0.75, 0.75, 1 ),
      position: new Vector3( 0, 0, 1.1)
    }
  ], [
    new Line( lineGeometry ), {
      type: 'scale',
      axis: 'X',
      color: new Vector4( 1, 0, 0, 1 ),
      position: new Vector3( 0.5, 0, 0 ),
      scale: new Vector3( 0.5, 1, 1 )
    }
  ], [
    new Mesh( scaleHandleGeometry ),
    {
      type: 'scale',
      axis: 'Y',
      color: new Vector4( 0, 1, 0, 1 ),
      position: new Vector3( 0, 0.95, 0 )
    }
  ], [
    new Line( lineGeometry ),
    {
      type: 'scale',
      axis: 'Y',
      color: new Vector4( 0, 1, 0, 1 ),
      position: new Vector3( 0, 0.5, 0 ),
      rotation: new Euler( 0, 0, Math.PI / 2 ),
      scale: new Vector3( 0.5, 1, 1 )
    }
  ], [
    new Mesh( scaleHandleGeometry ),
    {
      type: 'scale',
      axis: 'Z',
      color: new Vector4( 0, 0, 1, 1 ),
      position: new Vector3( 0, 0, 0.95 ),
      rotation: new Euler( Math.PI / 2, 0, 0 )
    }
  ], [
    new Line( lineGeometry ),
    {
      type: 'scale',
      axis: 'Z',
      color: new Vector4( 0, 0, 1, 1 ),
      position: new Vector3( 0, 0, 0.5 ),
      rotation: new Euler( 0, - Math.PI / 2, 0 ),
      scale: new Vector3( 0.5, 1, 1 )
    }
  ], [
    new Line( lineGeometry ), {
      type: 'scale',
      axis: 'XYZX',
      color: new Vector4( 0.75, 0.75, 0.75, 1 ),
      position: new Vector3( 0.9, 0, 0 ),
      scale: new Vector3( 0.2, 1, 1 )
    }
  ], [
    new Line( lineGeometry ),
    {
      type: 'scale',
      axis: 'XYZY',
      color: new Vector4( 0.75, 0.75, 0.75, 1 ),
      position: new Vector3( 0, 0.9, 0 ),
      rotation: new Euler( 0, 0, Math.PI / 2 ),
      scale: new Vector3( 0.2, 1, 1 )
    }
  ], [
    new Line( lineGeometry ),
    {
      type: 'scale',
      axis: 'XYZZ',
      color: new Vector4( 0.75, 0.75, 0.75, 1 ),
      position: new Vector3( 0, 0, 0.9 ),
      rotation: new Euler( 0, - Math.PI / 2, 0 ),
      scale: new Vector3( 0.2, 1, 1 )
    }
  ], [
    new Mesh( scaleHandleGeometry ),
    {
      type: 'scale',
      axis: 'X',
      color: new Vector4( 1, 0, 0, 1 ),
      position: new Vector3( 0.95, 0, 0 ),
      rotation: new Euler( 0, 0, - Math.PI / 2 )
    }
  ], [
    new Mesh( new PlaneBufferGeometry( 0.3, 0.3 ) ),
    {
      type: 'scale',
      axis: 'XY',
      color: new Vector4( 1, 1, 0, 0.1 ),
      position: new Vector3( 0.85, 0.85, 0)
    }
  ], [
    new Line( lineGeometry ),
    {
      type: 'scale',
      axis: 'XY',
      color: new Vector4( 1, 1, 0, 1 ),
      position: new Vector3( 0.8, 1, 0 ),
      scale: new Vector3( 0.2, 1, 1 )
    }
  ], [
    new Line( lineGeometry ),
    {
      type: 'scale',
      axis: 'XY',
      color: new Vector4( 1, 1, 0, 1 ),
      position: new Vector3( 1, 0.8, 0 ),
      rotation: new Euler( 0, 0, Math.PI / 2 ),
      scale: new Vector3( 0.2, 1, 1 )
    }
  ], [
    new Mesh( new PlaneBufferGeometry( 0.3, 0.3 ) ),
    {
      type: 'scale',
      axis: 'YZ',
      color: new Vector4( 0, 1, 1, 0.1 ),
      position: new Vector3( 0, 0.85, 0.85 ),
      rotation: new Euler( 0, Math.PI / 2, 0 )
    }
  ], [
    new Line( lineGeometry ),
    {
      type: 'scale',
      axis: 'YZ',
      color: new Vector4( 0, 1, 1, 1 ),
      position: new Vector3( 0, 0.8, 1 ),
      rotation: new Euler( 0, 0, Math.PI / 2 ),
      scale: new Vector3( 0.2, 1, 1 )
    }
  ], [
    new Line( lineGeometry ),
    {
      type: 'scale',
      axis: 'YZ',
      color: new Vector4( 0, 1, 1, 1 ),
      position: new Vector3( 0, 1, 0.8 ),
      rotation: new Euler( 0, - Math.PI / 2, 0 ),
      scale: new Vector3( 0.2, 1, 1 )
    }
  ], [
    new Mesh( new PlaneBufferGeometry( 0.3, 0.3 ) ),
    {
      type: 'scale',
      axis: 'XZ',
      color: new Vector4( 1, 0, 1, 0.1 ),
      position: new Vector3( 0.85, 0, 0.85 ),
      rotation: new Euler( - Math.PI / 2, 0, 0 )
    }
  ], [
    new Line( lineGeometry ),
    {
      type: 'scale',
      axis: 'XZ',
      color: new Vector4( 1, 0, 1, 1 ),
      position: new Vector3( 0.8, 0, 1 ),
      scale: new Vector3( 0.2, 1, 1 )
    }
  ], [
    new Line( lineGeometry ),
    {
      type: 'scale',
      axis: 'XZ',
      color: new Vector4( 1, 0, 1, 1 ),
      position: new Vector3( 1, 0, 0.8 ),
      rotation: new Euler( 0, - Math.PI / 2, 0 ),
      scale: new Vector3( 0.2, 1, 1 )
    }
  ],
  // Pickers
  [
    new Mesh( new CylinderBufferGeometry( 0.3, 0, 0.7, 4, 1, false ) ),
    {
      type: 'scale',
      axis: 'X',
      tag: 'picker',
      color: new Vector4( 1, 1, 1, 0 ),
      position: new Vector3( 0.7, 0, 0 ),
      rotation: new Euler( Math.PI / 4, 0, - Math.PI / 2 ),
    }
  ], [
    new Mesh( new CylinderBufferGeometry( 0.3, 0, 0.7, 4, 1, false ) ),
    {
      type: 'scale',
      axis: 'Y',
      tag: 'picker',
      color: new Vector4( 1, 1, 1, 0 ),
      position: new Vector3( 0, 0.7, 0),
      rotation: new Euler( 0, Math.PI / 4, 0 ),
    }
  ], [
    new Mesh( new CylinderBufferGeometry( 0.3, 0, 0.7, 4, 1, false ) ),
    {
      type: 'scale',
      axis: 'Z',
      tag: 'picker',
      color: new Vector4( 1, 1, 1, 0 ),
      position: new Vector3( 0, 0, 0.7 ),
      rotation: new Euler( Math.PI / 2, Math.PI / 4, 0 ),
    }
  ], [
    new Mesh( scaleHandleGeometry ),
    {
      type: 'scale',
      axis: 'XY',
      tag: 'picker',
      color: new Vector4( 1, 1, 1, 0 ),
      position: new Vector3( 0.85, 0.85, 0 ),
      scale: new Vector3( 4, 4, 0.6 ),
    }
  ], [
    new Mesh( scaleHandleGeometry ),
    {
      type: 'scale',
      axis: 'YZ',
      tag: 'picker',
      color: new Vector4( 1, 1, 1, 0 ),
      position: new Vector3( 0, 0.85, 0.85 ),
      scale: new Vector3( 0.6, 4, 4 ),
    }
  ], [
    new Mesh( scaleHandleGeometry ),
    {
      type: 'scale',
      axis: 'XZ',
      tag: 'picker',
      color: new Vector4( 1, 1, 1, 0 ),
      position: new Vector3( 0.85, 0, 0.85 ),
      scale: new Vector3( 4, 0.6, 4 ),
    }
  ], [
    new Mesh( new CylinderBufferGeometry( 0.3, 0, 0.9, 4, 1, false ) ),
    {
      type: 'scale',
      axis: 'XYZX',
      tag: 'picker',
      color: new Vector4( 1, 1, 1, 0 ),
      position: new Vector3( 0.8, 0, 0 ),
      rotation: new Euler( Math.PI / 4, 0, - Math.PI / 2 ),
    }
  ], [
    new Mesh( new CylinderBufferGeometry( 0.3, 0, 0.9, 4, 1, false ) ),
    {
      type: 'scale',
      axis: 'XYZY',
      tag: 'picker',
      color: new Vector4( 1, 1, 1, 0 ),
      position: new Vector3( 0, 0.8, 0),
      rotation: new Euler( 0, Math.PI / 4, 0 ),
    }
  ], [
    new Mesh( new CylinderBufferGeometry( 0.3, 0, 0.9, 4, 1, false ) ),
    {
      type: 'scale',
      axis: 'XYZZ',
      tag: 'picker',
      color: new Vector4( 1, 1, 1, 0 ),
      position: new Vector3( 0, 0, 0.8 ),
      rotation: new Euler( Math.PI / 2, Math.PI / 4, 0 ),
    }
  ], 
];

const _cameraPosition = new Vector3();
const _position = new Vector3();

export class TransformHelper extends ControlsHelper {
  readonly isTransformHelper = true;
  type = 'TransformHelper';

  enabled = false;
  activeMode: 'translate' | 'rotate' | 'scale' | '' = '';
  activeAxis: 'X' | 'Y' | 'Z' | 'XY' | 'YZ' | 'XZ' | 'XYZ' | 'XYZE' | 'E' | '' = '';
  size = 1;
  showX = true;
  showY = true;
  showZ = true;
  showTranslate = true;
  showRotate = false;
  showScale = true;
  sizeAttenuation = 1;

  constructor() {
    super( [
      ...scaleHelperGeometrySpec,
      ...translateHelperGeometrySpec,
      ...rotateHelperGeometrySpec,
    ] );
  }
  updateHandle( handle: Mesh ) {

    handle.quaternion.copy( this.quaternion ).invert();
    handle.position.set( 0, 0, 0 );
    handle.scale.set( 1, 1, 1 ).multiplyScalar( this.sizeAttenuation * this.size / 7 );
    handle.quaternion.multiply( this.quaternion );

    const eye = this.eye;
    const quaternion = this.quaternion;
    const handleType = handle.userData.type;
    const handleAxis = handle.userData.axis;
    const handleTag = handle.userData.tag;

    // Hide disabled axes
    handle.visible = true;

    if ( handleAxis.indexOf( 'X' ) !== - 1 && !this.showX ) handle.visible = false;
    if ( handleAxis.indexOf( 'Y' ) !== - 1 && !this.showY ) handle.visible = false;
    if ( handleAxis.indexOf( 'Z' ) !== - 1 && !this.showZ ) handle.visible = false;
    if ( handleAxis.indexOf( 'E' ) !== - 1 && ( !this.showX || !this.showY || !this.showZ ) ) handle.visible = false;

    if ( handleType === 'translate' && !this.showTranslate ) handle.visible = false;
    if ( handleType === 'rotate' && !this.showRotate ) handle.visible = false;
    if ( handleType === 'scale' && !this.showScale ) handle.visible = false;

    if ( handleTag !== 'picker' ) {

      const material = handle.material as MeshBasicMaterial;

      material.userData.opacity = material.userData.opacity || material.opacity;
      material.userData.color = material.userData.color || material.color.clone();

      material.color.copy( material.userData.color );
      material.opacity = material.userData.opacity;

      // highlight selected axis
      if ( ! this.enabled || (this.activeMode && handleType !== this.activeMode ) ) {
        material.opacity = material.userData.opacity * 0.125;
        material.color.lerp( new Color( 1, 1, 1 ), 0.5 );
      } else if ( this.activeAxis ) {
        if ( handleAxis === this.activeAxis ) {
          material.opacity = 1.0;
          material.color.lerp( new Color( 1, 1, 1 ), 0.5 );
        } else if ( this.activeAxis.split( '' ).some( function ( a ) {
          return handleAxis === a;
        } ) ) {
          material.opacity = 1.0;
          material.color.lerp( new Color( 1, 1, 1 ), 0.5 );
        } else {
          material.opacity = material.userData.opacity * 0.125;
          material.color.lerp( new Color( 1, 1, 1 ), 0.5 );
        }
      }

    }

    if ( handleType === 'rotate' ) {

      alignVector.copy( eye ).applyQuaternion( tempQuaternion.copy( quaternion ).invert() );

      // Hide handle pointing straight towards the camera

      if ( handleAxis.search( 'E' ) !== - 1 ) {
        tempQuaternion2.setFromRotationMatrix( lookAtMatrix.lookAt( eye, zeroVector, unitY ) );
        handle.quaternion.copy(this.quaternion).invert();
        handle.quaternion.multiply( tempQuaternion2 );
      }
      if ( handleAxis === 'X' ) {
        tempQuaternion2.identity();
        tempQuaternion.setFromAxisAngle( unitX, Math.atan2( - alignVector.y, alignVector.z ) );
        tempQuaternion.multiplyQuaternions( tempQuaternion2, tempQuaternion );
        handle.quaternion.copy( tempQuaternion );
      }
      if ( handleAxis === 'Y' ) {
        tempQuaternion2.identity();
        tempQuaternion.setFromAxisAngle( unitY, Math.atan2( alignVector.x, alignVector.z ) );
        tempQuaternion.multiplyQuaternions( tempQuaternion2, tempQuaternion );
        handle.quaternion.copy( tempQuaternion );
      }
      if ( handleAxis === 'Z' ) {
        tempQuaternion2.identity();
        tempQuaternion.setFromAxisAngle( unitZ, Math.atan2( alignVector.y, alignVector.x ) );
        tempQuaternion.multiplyQuaternions( tempQuaternion2, tempQuaternion );
        handle.quaternion.copy( tempQuaternion );
      }

    } else {

      if ( handleAxis === 'X' || handleAxis === 'XYZX' ) {
        if ( Math.abs( alignVector.copy( unitX ).applyQuaternion( quaternion ).dot( eye ) ) > AXIS_HIDE_TRESHOLD ) {
          handle.scale.set( 1e-10, 1e-10, 1e-10 );
          handle.visible = false;
        }
      }
      if ( handleAxis === 'Y' || handleAxis === 'XYZY' ) {
        if ( Math.abs( alignVector.copy( unitY ).applyQuaternion( quaternion ).dot( eye ) ) > AXIS_HIDE_TRESHOLD ) {
          handle.scale.set( 1e-10, 1e-10, 1e-10 );
          handle.visible = false;
        }
      }
      if ( handleAxis === 'Z' || handleAxis === 'XYZZ' ) {
        if ( Math.abs( alignVector.copy( unitZ ).applyQuaternion( quaternion ).dot( eye ) ) > AXIS_HIDE_TRESHOLD ) {
          handle.scale.set( 1e-10, 1e-10, 1e-10 );
          handle.visible = false;
        }
      }
      if ( handleAxis === 'XY' ) {
        if ( Math.abs( alignVector.copy( unitZ ).applyQuaternion( quaternion ).dot( eye ) ) < PLANE_HIDE_TRESHOLD ) {
          handle.scale.set( 1e-10, 1e-10, 1e-10 );
          handle.visible = false;
        }
      }
      if ( handleAxis === 'YZ' ) {
        if ( Math.abs( alignVector.copy( unitX ).applyQuaternion( quaternion ).dot( eye ) ) < PLANE_HIDE_TRESHOLD ) {
          handle.scale.set( 1e-10, 1e-10, 1e-10 );
          handle.visible = false;
        }
      }
      if ( handleAxis === 'XZ' ) {
        if ( Math.abs( alignVector.copy( unitY ).applyQuaternion( quaternion ).dot( eye ) ) < PLANE_HIDE_TRESHOLD ) {
          handle.scale.set( 1e-10, 1e-10, 1e-10 );
          handle.visible = false;
        }
      }

      // Flip handle to prevent occlusion by other handles

      if ( handleAxis.search( 'X' ) !== - 1 ) {
        if ( alignVector.copy( unitX ).applyQuaternion( quaternion ).dot( eye ) < AXIS_FLIP_TRESHOLD ) {
          if ( handleTag === 'fwd' ) {
            handle.visible = false;
          } else {
            handle.scale.x *= - 1;
          }
        } else if ( handleTag === 'bwd' ) {
          handle.visible = false;
        }
      }
      if ( handleAxis.search( 'Y' ) !== - 1 ) {
        if ( alignVector.copy( unitY ).applyQuaternion( quaternion ).dot( eye ) < AXIS_FLIP_TRESHOLD ) {
          if ( handleTag === 'fwd' ) {
            handle.visible = false;
          } else {
            handle.scale.y *= - 1;
          }
        } else if ( handleTag === 'bwd' ) {
          handle.visible = false;
        }
      }
      if ( handleAxis.search( 'Z' ) !== - 1 ) {
        if ( alignVector.copy( unitZ ).applyQuaternion( quaternion ).dot( eye ) < AXIS_FLIP_TRESHOLD ) {
          if ( handleTag === 'fwd' ) {
            handle.visible = false;
          } else {
            handle.scale.z *= - 1;
          }
        } else if ( handleTag === 'bwd' ) {
          handle.visible = false;
        }
      }

    }
  }
  updateMatrixWorld() {
    super.updateMatrixWorld();

    _position.setFromMatrixPosition( this.matrixWorld );
    _cameraPosition.setFromMatrixPosition( this.camera.matrixWorld );

    this.sizeAttenuation = 1;
    if ( this.camera instanceof OrthographicCamera ) {
      this.sizeAttenuation = ( this.camera.top - this.camera.bottom ) / this.camera.zoom;
    } else if ( this.camera instanceof PerspectiveCamera ) {
      this.sizeAttenuation = _position.distanceTo( _cameraPosition ) * Math.min( 1.9 * Math.tan( Math.PI * this.camera.fov / 360 ) / this.camera.zoom, 7 );
    }

    for ( let i = 0; i < this.children.length; i ++ ) {
      this.updateHandle( this.children[ i ] as Mesh );
    }
  }
}