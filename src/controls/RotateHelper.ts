import { Quaternion, Euler, Matrix4, Mesh, Line, Float32BufferAttribute, BufferGeometry, OctahedronBufferGeometry, TorusBufferGeometry, SphereBufferGeometry, Vector3, Vector4 } from '../../../three';

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

const zeroVector = new Vector3( 0, 0, 0 );
const lookAtMatrix = new Matrix4();
const alignVector = new Vector3( 0, 1, 0 );
const tempQuaternion = new Quaternion();
const tempQuaternion2 = new Quaternion();

const unitX = new Vector3( 1, 0, 0 );
const unitY = new Vector3( 0, 1, 0 );
const unitZ = new Vector3( 0, 0, 1 );

export const rotateHelperGeometrySpec: [ Mesh | Line, ControlsHelperGeometrySpec ][] = [
  [
    new Line( CircleGeometry( 0.9, 0.5 ) ),
    {
      name: 'X',
      mode: 'rotate',
      color: new Vector4( 1, 0, 0, 1 ),
    }
  ], [
    new Mesh( new OctahedronBufferGeometry( 0.04, 0 ) ),
    {
      name: 'X',
      mode: 'rotate',
      color: new Vector4( 1, 0, 0, 1 ),
      position: new Vector3( 0, 0, 0.893 ),
      scale: new Vector3( 1, 3, 1 )
    }
  ], [
    new Line( CircleGeometry( 0.9, 0.5 ) ),
    {
      name: 'Y',
      mode: 'rotate',
      color: new Vector4( 0, 1, 0, 1 ),
      rotation: new Euler( 0, 0, - Math.PI / 2 )
    }
  ], [
    new Mesh( new OctahedronBufferGeometry( 0.04, 0 ) ),
    {
      name: 'Y',
      mode: 'rotate',
      color: new Vector4( 0, 1, 0, 1 ),
      position: new Vector3( 0, 0, 0.893 ),
      scale: new Vector3( 3, 1, 1 )
    }
  ], [
    new Line( CircleGeometry( 0.9, 0.5 ) ),
    {
      name: 'Z',
      mode: 'rotate',
      color: new Vector4( 0, 0, 1, 1 ),
      rotation: new Euler( 0, Math.PI / 2, 0 )
    }
  ], [
    new Mesh( new OctahedronBufferGeometry( 0.04, 0 ) ),
    {
      name: 'Z',
      mode: 'rotate',
      color: new Vector4( 0, 0, 1, 1 ),
      position: new Vector3( 0.893, 0, 0 ),
      scale: new Vector3( 1, 3, 1 )
    }
  ], [
    new Line( CircleGeometry( 1.3, 1 ) ),
    {
      name: 'E',
      mode: 'rotate',
      color: new Vector4( 1, 1, 0, 0.25 ),
      rotation: new Euler( 0, Math.PI / 2, 0 )
    }
  ], [
    new Line( CircleGeometry( 0.9, 1 ) ),
    {
      name: 'XYZE',
      mode: 'rotate',
      color: new Vector4( 0.25, 0.25, 0.25, 1 ),
      rotation: new Euler( 0, Math.PI / 2, 0 )
    }
  ],
  // Pickers
  [
    new Mesh( new TorusBufferGeometry( 0.9, 0.1, 4, 24 ) ),
    {
      name: 'X',
      mode: 'rotate',
      color: new Vector4( 1, 1, 1, 0 ),
      tag: 'picker',
      position: new Vector3( 0, 0, 0 ),
      rotation: new Euler( 0, - Math.PI / 2, - Math.PI / 2 ),
    }
  ], [
    new Mesh( new TorusBufferGeometry( 0.9, 0.1, 4, 24 ) ),
    {
      name: 'Y',
      mode: 'rotate',
      color: new Vector4( 1, 1, 1, 0 ),
      tag: 'picker',
      position: new Vector3( 0, 0, 0 ),
      rotation: new Euler( Math.PI / 2, 0, 0 ),
    }
  ], [
    new Mesh( new TorusBufferGeometry( 0.9, 0.1, 4, 24 ) ),
    {
      name: 'Z',
      mode: 'rotate',
      color: new Vector4( 1, 1, 1, 0 ),
      tag: 'picker',
      position: new Vector3( 0, 0, 0 ),
      rotation: new Euler( 0, 0, - Math.PI / 2 ),
    }
  ], [
    new Mesh( new TorusBufferGeometry( 1.3, 0.1, 2, 24 ) ),
    {
      name: 'E',
      mode: 'rotate',
      color: new Vector4( 1, 1, 1, 0 ),
      tag: 'picker',
    }
  ], [
    new Mesh( new SphereBufferGeometry( 0.9, 10, 8 ) ),
    {
      name: 'XYZE',
      mode: 'rotate',
      color: new Vector4( 1, 1, 1, 0 ),
      position: new Vector3( 0, 0, -1 ),
      tag: 'picker',
    }
  ]
];

export class RotateHelper extends ControlsHelper {
  readonly isRotateHelper = true;
  type = 'RotateHelper';
  //
  constructor() {
    super( rotateHelperGeometrySpec );
  }
  updateHandleTransform( handle: Mesh ) {
    const eye = this.eye;
    const quaternion = this.quaternion;

    handle.quaternion.copy( this.quaternion ).inverse();
    handle.position.set( 0, 0, 0 );

    handle.scale.set( 1, 1, 1 ).multiplyScalar( this.sizeAttenuation * this.size / 7 );

    // Align handles to current local or world rotation
    alignVector.copy( eye ).applyQuaternion( tempQuaternion.copy( quaternion ).inverse() );
    if ( handle.name.search( 'E' ) !== - 1 ) {
      tempQuaternion2.setFromRotationMatrix( lookAtMatrix.lookAt( eye, zeroVector, unitY ) );
      handle.quaternion.copy(this.quaternion).inverse();
      handle.quaternion.multiply( tempQuaternion2 );
    }
    if ( handle.name === 'X' ) {
      tempQuaternion2.identity();
      tempQuaternion.setFromAxisAngle( unitX, Math.atan2( - alignVector.y, alignVector.z ) );
      tempQuaternion.multiplyQuaternions( tempQuaternion2, tempQuaternion );
      handle.quaternion.copy( tempQuaternion );
    }
    if ( handle.name === 'Y' ) {
      tempQuaternion2.identity();
      tempQuaternion.setFromAxisAngle( unitY, Math.atan2( alignVector.x, alignVector.z ) );
      tempQuaternion.multiplyQuaternions( tempQuaternion2, tempQuaternion );
      handle.quaternion.copy( tempQuaternion );
    }
    if ( handle.name === 'Z' ) {
      tempQuaternion2.identity();
      tempQuaternion.setFromAxisAngle( unitZ, Math.atan2( alignVector.y, alignVector.x ) );
      tempQuaternion.multiplyQuaternions( tempQuaternion2, tempQuaternion );
      handle.quaternion.copy( tempQuaternion );
    }
  }
}