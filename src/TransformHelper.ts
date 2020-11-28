import { Quaternion, Mesh, Euler, Vector3, Vector4, Matrix4, Line, OctahedronBufferGeometry,
  TorusBufferGeometry, SphereBufferGeometry, BoxBufferGeometry, PlaneBufferGeometry, CylinderBufferGeometry,
  BufferGeometry, Float32BufferAttribute, OrthographicCamera, PerspectiveCamera } from 'three';

import { ControlsHelper, ControlsHelperGeometrySpec } from './ControlsHelper';

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

export const squareLineGeometry = new BufferGeometry();
squareLineGeometry.setAttribute( 'position', new Float32BufferAttribute( [  -1, -1, 0, -1, 1, 0, 1, 1, 0, 1, -1, 0, -1, -1, 0 ], 3 ) );

export const cornerLineGeometry = new BufferGeometry();
cornerLineGeometry.setAttribute( 'position', new Float32BufferAttribute( [  0, -1, 0, 0, 0, 0, 1, 0, 0 ], 3 ) );

export const UNIT = {
  0: Object.freeze(new Vector3( 0, 0, 0 )),
  X: Object.freeze(new Vector3( 1, 0, 0 )),
  Y: Object.freeze(new Vector3( 0, 1, 0 )),
  Z: Object.freeze(new Vector3( 0, 0, 1 ))
};

const PICKER_DEBUG_ALPHA = 0.0;

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
    new Line( cornerLineGeometry ),
    {
      type: 'translate',
      axis: 'XY',
      color: new Vector4( 1, 1, 0, 1 ),
      position: new Vector3( 0.3, 0.3, 0 ),
      rotation: new Euler( 0, 0, -Math.PI / 2 ),
      scale: new Vector3( 0.15, 0.15, 1 )
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
    new Line( cornerLineGeometry ),
    {
      type: 'translate',
      axis: 'YZ',
      color: new Vector4( 0, 1, 1, 1 ),
      position: new Vector3( 0, 0.3, 0.3 ),
      rotation: new Euler( 0, - Math.PI / 2, - Math.PI / 2 ),
      scale: new Vector3( 0.15, 0.15, 1 )
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
    new Line( cornerLineGeometry ),
    {
      type: 'translate',
      axis: 'XZ',
      color: new Vector4( 1, 0, 1, 1 ),
      position: new Vector3( 0.3, 0, 0.3 ),
      rotation: new Euler( Math.PI / 2, 0, -Math.PI / 2 ),
      scale: new Vector3( 0.15, 0.15, 1 )
    }
  ],
  // Pickers
  [
    new Mesh( new CylinderBufferGeometry( 0.3, 0, 0.6, 4, 1, false ) ),
    {
      type: 'translate',
      axis: 'X',
      tag: 'picker',
      color: new Vector4( 1, 1, 1, PICKER_DEBUG_ALPHA ),
      position: new Vector3( 0.6, 0, 0 ),
      rotation: new Euler( Math.PI / 4, 0, - Math.PI / 2 ),
    }
  ], [
    new Mesh( new CylinderBufferGeometry( 0.3, 0, 0.6, 4, 1, false ) ),
    {
      type: 'translate',
      axis: 'Y',
      tag: 'picker',
      color: new Vector4( 1, 1, 1, PICKER_DEBUG_ALPHA ),
      position: new Vector3( 0, 0.6, 0),
      rotation: new Euler( 0, Math.PI / 4, 0 ),
    }
  ], [
    new Mesh( new CylinderBufferGeometry( 0.3, 0, 0.6, 4, 1, false ) ),
    {
      type: 'translate',
      axis: 'Z',
      tag: 'picker',
      color: new Vector4( 1, 1, 1, PICKER_DEBUG_ALPHA ),
      position: new Vector3( 0, 0, 0.6 ),
      rotation: new Euler( Math.PI / 2, Math.PI / 4, 0 ),
    }
  ], [
    new Mesh( new OctahedronBufferGeometry( 0.3, 0 ) ),
    {
      type: 'translate',
      axis: 'XYZ',
      tag: 'picker',
      color: new Vector4( 1, 1, 1, PICKER_DEBUG_ALPHA ),
    }
  ], [
    new Mesh( new PlaneBufferGeometry( 0.4, 0.4 ) ),
    {
      type: 'translate',
      axis: 'XY',
      tag: 'picker',
      color: new Vector4( 1, 1, 1, PICKER_DEBUG_ALPHA ),
      position: new Vector3( 0.2, 0.2, 0),
    }
  ], [
    new Mesh( new PlaneBufferGeometry( 0.4, 0.4 ) ),
    {
      type: 'translate',
      axis: 'YZ',
      tag: 'picker',
      color: new Vector4( 1, 1, 1, PICKER_DEBUG_ALPHA ),
      position: new Vector3( 0, 0.2, 0.2 ),
      rotation: new Euler( 0, Math.PI / 2, 0 ),
    }
  ], [
    new Mesh( new PlaneBufferGeometry( 0.4, 0.4 ) ),
    {
      type: 'translate',
      axis: 'XZ',
      tag: 'picker',
      color: new Vector4( 1, 1, 1, PICKER_DEBUG_ALPHA ),
      position: new Vector3( 0.2, 0, 0.2 ),
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
    new Mesh( new TorusBufferGeometry( 0.9, 0.2, 4, 6, Math.PI ) ),
    {
      type: 'rotate',
      axis: 'X',
      tag: 'picker',
      color: new Vector4( 1, 1, 1, PICKER_DEBUG_ALPHA ),
      position: new Vector3( 0, 0, 0 ),
      rotation: new Euler( 0, - Math.PI / 2, - Math.PI / 2 ),
      scale: new Vector3( 1, 1, 0.3 ),
    }
  ], [
    new Mesh( new TorusBufferGeometry( 0.9, 0.2, 4, 6, Math.PI ) ),
    {
      type: 'rotate',
      axis: 'Y',
      tag: 'picker',
      color: new Vector4( 1, 1, 1, PICKER_DEBUG_ALPHA ),
      position: new Vector3( 0, 0, 0 ),
      rotation: new Euler( Math.PI / 2, 0, 0 ),
      scale: new Vector3( 1, 1, 0.3 ),
    }
  ], [
    new Mesh( new TorusBufferGeometry( 0.9, 0.2, 4, 6, Math.PI ) ),
    {
      type: 'rotate',
      axis: 'Z',
      tag: 'picker',
      color: new Vector4( 1, 1, 1, PICKER_DEBUG_ALPHA ),
      position: new Vector3( 0, 0, 0 ),
      rotation: new Euler( 0, 0, - Math.PI / 2 ),
      scale: new Vector3( 1, 1, 0.3 ),
    }
  ], [
    new Mesh( new TorusBufferGeometry( 1.3, 0.2, 2, 12 ) ),
    {
      type: 'rotate',
      axis: 'E',
      tag: 'picker',
      color: new Vector4( 1, 1, 1, PICKER_DEBUG_ALPHA ),
    }
  ], [
    new Mesh( new SphereBufferGeometry( 1.3, 12, 2, 0, Math.PI * 2, 0, Math.PI / 2 ) ),
    {
      type: 'rotate',
      axis: 'XYZE',
      tag: 'picker',
      color: new Vector4( 1, 1, 1, PICKER_DEBUG_ALPHA ),
      rotation: new Euler( - Math.PI / 2, 0, 0 ),
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
    new Line( squareLineGeometry ),
    {
      type: 'scale',
      axis: 'XY',
      color: new Vector4( 1, 1, 0, 1 ),
      position: new Vector3( 0.925, 0.925, 0 ),
      scale: new Vector3( 0.075, 0.075, 1 ),
    }
  ], [
    new Mesh( new PlaneBufferGeometry( 0.3, 0.3 ) ),
    {
      type: 'scale',
      axis: 'YZ',
      color: new Vector4( 0, 1, 1, 0.1 ),
      position: new Vector3( 0, 0.85, 0.85 ),
      rotation: new Euler( 0, Math.PI / 2, 0 ),
    }
  ], [
    new Line( squareLineGeometry ),
    {
      type: 'scale',
      axis: 'YZ',
      color: new Vector4( 0, 1, 1, 1 ),
      position: new Vector3( 0, 0.925, 0.925 ),
      rotation: new Euler( 0, Math.PI / 2, 0),
      scale: new Vector3( 0.075, 0.075, 1 )
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
    new Line( squareLineGeometry ),
    {
      type: 'scale',
      axis: 'XZ',
      color: new Vector4( 1, 0, 1, 1 ),
      position: new Vector3( 0.925, 0, 0.925 ),
      rotation: new Euler( Math.PI / 2, 0, 0 ),
      scale: new Vector3( 0.075, 0.075, 1 ),
    }
  ],
  // Pickers
  [
    new Mesh( new CylinderBufferGeometry( 0.2, 0, 0.7, 4, 1, false ) ),
    {
      type: 'scale',
      axis: 'X',
      tag: 'picker',
      color: new Vector4( 1, 1, 1, PICKER_DEBUG_ALPHA ),
      position: new Vector3( 0.7, 0, 0 ),
      rotation: new Euler( Math.PI / 4, 0, - Math.PI / 2 ),
    }
  ], [
    new Mesh( new CylinderBufferGeometry( 0.2, 0, 0.7, 4, 1, false ) ),
    {
      type: 'scale',
      axis: 'Y',
      tag: 'picker',
      color: new Vector4( 1, 1, 1, PICKER_DEBUG_ALPHA ),
      position: new Vector3( 0, 0.7, 0),
      rotation: new Euler( 0, Math.PI / 4, 0 ),
    }
  ], [
    new Mesh( new CylinderBufferGeometry( 0.2, 0, 0.7, 4, 1, false ) ),
    {
      type: 'scale',
      axis: 'Z',
      tag: 'picker',
      color: new Vector4( 1, 1, 1, PICKER_DEBUG_ALPHA ),
      position: new Vector3( 0, 0, 0.7 ),
      rotation: new Euler( Math.PI / 2, Math.PI / 4, 0 ),
    }
  ], [
    new Mesh( scaleHandleGeometry ),
    {
      type: 'scale',
      axis: 'XY',
      tag: 'picker',
      color: new Vector4( 1, 1, 1, PICKER_DEBUG_ALPHA ),
      position: new Vector3( 0.85, 0.85, 0 ),
      scale: new Vector3( 4, 4, 0.6 ),
    }
  ], [
    new Mesh( scaleHandleGeometry ),
    {
      type: 'scale',
      axis: 'YZ',
      tag: 'picker',
      color: new Vector4( 1, 1, 1, PICKER_DEBUG_ALPHA ),
      position: new Vector3( 0, 0.85, 0.85 ),
      scale: new Vector3( 0.6, 4, 4 ),
    }
  ], [
    new Mesh( scaleHandleGeometry ),
    {
      type: 'scale',
      axis: 'XZ',
      tag: 'picker',
      color: new Vector4( 1, 1, 1, PICKER_DEBUG_ALPHA ),
      position: new Vector3( 0.85, 0, 0.85 ),
      scale: new Vector3( 4, 0.6, 4 ),
    }
  ], [
    new Mesh( new CylinderBufferGeometry( 0.24, 0, 0.55, 4, 1, false ) ),
    {
      type: 'scale',
      axis: 'XYZX',
      tag: 'picker',
      color: new Vector4( 1, 1, 1, PICKER_DEBUG_ALPHA ),
      position: new Vector3( 1.1, 0, 0 ),
      rotation: new Euler( Math.PI / 4, 0, - Math.PI / 2 ),
    }
  ], [
    new Mesh( new CylinderBufferGeometry( 0.24, 0, 0.55, 4, 1, false ) ),
    {
      type: 'scale',
      axis: 'XYZY',
      tag: 'picker',
      color: new Vector4( 1, 1, 1, PICKER_DEBUG_ALPHA ),
      position: new Vector3( 0, 1.1, 0),
      rotation: new Euler( 0, Math.PI / 4, 0 ),
    }
  ], [
    new Mesh( new CylinderBufferGeometry( 0.24, 0, 0.55, 4, 1, false ) ),
    {
      type: 'scale',
      axis: 'XYZZ',
      tag: 'picker',
      color: new Vector4( 1, 1, 1, PICKER_DEBUG_ALPHA ),
      position: new Vector3( 0, 0, 1.1 ),
      rotation: new Euler( Math.PI / 2, Math.PI / 4, 0 ),
    }
  ], 
];

export class TransformHelper extends ControlsHelper {
  static readonly isTransformHelper = true;
  static readonly type = 'TransformHelper';

  enabled = false;
  size = 1;
  showX = true;
  showY = true;
  showZ = true;
  showTranslate = true;
  showRotate = true;
  showScale = true;

  // Hide translate and scale axis facing the camera
  AXIS_HIDE_TRESHOLD = 0.99;
  PLANE_HIDE_TRESHOLD = 0.9;
  AXIS_FLIP_TRESHOLD = 0.0;

  protected _sizeAttenuation = 1;
  protected readonly _cameraPosition = new Vector3();
  protected readonly _position = new Vector3();

  private readonly _tempMatrix = new Matrix4();
  private readonly _dirVector = new Vector3( 0, 1, 0 );
  private readonly _tempQuaternion = new Quaternion();
  private readonly _tempQuaternion2 = new Quaternion();

  constructor() {
    super( [
      ...scaleHelperGeometrySpec,
      ...translateHelperGeometrySpec,
      ...rotateHelperGeometrySpec,
    ] );
  }
  updateHandle( handle: Mesh ): void {

    handle.quaternion.copy( this.quaternion ).invert();
    handle.position.set( 0, 0, 0 );
    handle.scale.set( 1, 1, 1 ).multiplyScalar( this._sizeAttenuation * this.size / 7 );
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

    if ( handleType === 'rotate' ) {

      this._dirVector.copy( eye ).applyQuaternion( this._tempQuaternion.copy( quaternion ).invert() );

      // Hide handle pointing straight towards the camera

      if ( handleAxis.search( 'E' ) !== - 1 ) {
        this._tempQuaternion2.setFromRotationMatrix( this._tempMatrix.lookAt( eye, UNIT[0], UNIT.Y ) );
        handle.quaternion.copy(this.quaternion).invert();
        handle.quaternion.multiply( this._tempQuaternion2 );
      }
      if ( handleAxis === 'X' ) {
        this._tempQuaternion2.identity();
        this._tempQuaternion.setFromAxisAngle( UNIT.X, Math.atan2( - this._dirVector.y, this._dirVector.z ) );
        this._tempQuaternion.multiplyQuaternions( this._tempQuaternion2, this._tempQuaternion );
        handle.quaternion.copy( this._tempQuaternion );
      }
      if ( handleAxis === 'Y' ) {
        this._tempQuaternion2.identity();
        this._tempQuaternion.setFromAxisAngle( UNIT.Y, Math.atan2( this._dirVector.x, this._dirVector.z ) );
        this._tempQuaternion.multiplyQuaternions( this._tempQuaternion2, this._tempQuaternion );
        handle.quaternion.copy( this._tempQuaternion );
      }
      if ( handleAxis === 'Z' ) {
        this._tempQuaternion2.identity();
        this._tempQuaternion.setFromAxisAngle( UNIT.Z, Math.atan2( this._dirVector.y, this._dirVector.x ) );
        this._tempQuaternion.multiplyQuaternions( this._tempQuaternion2, this._tempQuaternion );
        handle.quaternion.copy( this._tempQuaternion );
      }

    } else {

      // Flip handle to prevent occlusion by other handles

      if ( handleAxis.search( 'X' ) !== - 1 ) {
        if ( this._dirVector.copy( UNIT.X ).applyQuaternion( quaternion ).dot( eye ) < this.AXIS_FLIP_TRESHOLD ) {
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
        if ( this._dirVector.copy( UNIT.Y ).applyQuaternion( quaternion ).dot( eye ) < this.AXIS_FLIP_TRESHOLD ) {
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
        if ( this._dirVector.copy( UNIT.Z ).applyQuaternion( quaternion ).dot( eye ) < this.AXIS_FLIP_TRESHOLD ) {
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

    // Hide handles at grazing angles
    const hideAllignedToX = ( handleType === 'translate' || handleType === 'scale' ) && ( handleAxis === 'X' || handleAxis === 'XYZX' );
    const hideAllignedToY = ( handleType === 'translate' || handleType === 'scale' ) && ( handleAxis === 'Y' || handleAxis === 'XYZY' );
    const hideAllignedToZ = ( handleType === 'translate' || handleType === 'scale' ) && ( handleAxis === 'Z' || handleAxis === 'XYZZ' );
    const hideAllignedToXY = handleAxis === 'XY' || ( handleType === 'rotate' && handleAxis === 'Z' && ( this.showTranslate || this.showScale ) );
    const hideAllignedToYZ = handleAxis === 'YZ' || ( handleType === 'rotate' && handleAxis === 'X' && ( this.showTranslate || this.showScale ) );
    const hideAllignedToXZ = handleAxis === 'XZ' || ( handleType === 'rotate' && handleAxis === 'Y' && ( this.showTranslate || this.showScale ) );

    const hide_treshold = this.AXIS_HIDE_TRESHOLD * ( handleType === 'scale' ? this.AXIS_HIDE_TRESHOLD * 0.95 : this.AXIS_HIDE_TRESHOLD );
    const plane_hide_treshold = this.AXIS_HIDE_TRESHOLD * ( handleType === 'scale' ? this.PLANE_HIDE_TRESHOLD * 0.95 : this.PLANE_HIDE_TRESHOLD );

    if ( hideAllignedToX && Math.abs( this._dirVector.copy( UNIT.X ).applyQuaternion( quaternion ).dot( eye ) ) > hide_treshold ) {
        handle.visible = false;
    }
    if ( hideAllignedToY && Math.abs( this._dirVector.copy( UNIT.Y ).applyQuaternion( quaternion ).dot( eye ) ) > hide_treshold ) {
        handle.visible = false;
    }
    if ( hideAllignedToZ && Math.abs( this._dirVector.copy( UNIT.Z ).applyQuaternion( quaternion ).dot( eye ) ) > hide_treshold ) {
        handle.visible = false;
    }
    if ( hideAllignedToXY && Math.abs( this._dirVector.copy( UNIT.Z ).applyQuaternion( quaternion ).dot( eye ) ) < ( 1 - plane_hide_treshold ) ) {
        handle.visible = false;
    }
    if ( hideAllignedToYZ && Math.abs( this._dirVector.copy( UNIT.X ).applyQuaternion( quaternion ).dot( eye ) ) < ( 1 - plane_hide_treshold ) ) {
        handle.visible = false;
    }
    if ( hideAllignedToXZ && Math.abs( this._dirVector.copy( UNIT.Y ).applyQuaternion( quaternion ).dot( eye ) ) < ( 1 - plane_hide_treshold ) ) {
        handle.visible = false;
    }

  }
  updateMatrixWorld() {
    super.updateMatrixWorld();

    this._sizeAttenuation = 1;
    if ( this.camera instanceof OrthographicCamera ) {
      this._sizeAttenuation = ( this.camera.top - this.camera.bottom ) / this.camera.zoom;
    } else if ( this.camera instanceof PerspectiveCamera ) {
      this._sizeAttenuation = this._position.distanceTo( this._cameraPosition ) * Math.min( 1.9 * Math.tan( Math.PI * this.camera.fov / 360 ) / this.camera.zoom, 7 );
    }

    for ( let i = 0; i < this.children.length; i ++ ) {
      this.updateHandle( this.children[ i ] as Mesh );
    }
  }
}