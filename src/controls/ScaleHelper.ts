import { Euler, Mesh, Line, Vector4, Vector3, Float32BufferAttribute, PlaneBufferGeometry, BufferGeometry, BoxBufferGeometry, CylinderBufferGeometry } from '../../../three';

import { ControlsHelper, ControlsHelperGeometrySpec } from './ControlsHelper.js';

export const scaleHandleGeometry = new BoxBufferGeometry( 0.125, 0.125, 0.125 );

export const lineGeometry = new BufferGeometry();
lineGeometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0,  1, 0, 0 ], 3 ) );

const alignVector = new Vector3( 0, 1, 0 );
const unitX = new Vector3( 1, 0, 0 );
const unitY = new Vector3( 0, 1, 0 );
const unitZ = new Vector3( 0, 0, 1 );

// Hide translate and scale axis facing the camera
const AXIS_HIDE_TRESHOLD = 0.99;
const PLANE_HIDE_TRESHOLD = 0.05;
const AXIS_FLIP_TRESHOLD = 0.0;

export const scaleHelperGeometrySpec: [ Mesh | Line, ControlsHelperGeometrySpec ][] = [
  [
    new Mesh( new BoxBufferGeometry( 0.125, 0.125, 0.125 ) ),
    {
      name: 'XYZX',
      mode: 'scale',
      color: new Vector4( 1, 1, 1, 0.25 ),
      position: new Vector3( 1.1, 0, 0)
    }
  ], [
    new Mesh( new BoxBufferGeometry( 0.125, 0.125, 0.125 ) ),
    {
      name: 'XYZY',
      mode: 'scale',
      color: new Vector4( 1, 1, 1, 0.25 ),
      position: new Vector3( 0, 1.1, 0)
    }
  ], [
    new Mesh( new BoxBufferGeometry( 0.125, 0.125, 0.125 ) ),
    {
      name: 'XYZZ',
      mode: 'scale',
      color: new Vector4( 1, 1, 1, 0.25 ),
      position: new Vector3( 0, 0, 1.1)
    }
  ], [
    new Mesh( scaleHandleGeometry ),
    {
      name: 'X',
      mode: 'scale',
      color: new Vector4( 1, 0, 0, 1 ),
      position: new Vector3( 0.95, 0, 0 ),
      rotation: new Euler( 0, 0, - Math.PI / 2 )
    }
  ], [
    new Line( lineGeometry ), {
      name: 'X',
      mode: 'scale',
      color: new Vector4( 1, 0, 0, 1 ),
      scale: new Vector3( 0.95, 1, 1 )
    }
  ], [
    new Mesh( scaleHandleGeometry ),
    {
      name: 'Y',
      mode: 'scale',
      color: new Vector4( 0, 1, 0, 1 ),
      position: new Vector3( 0, 0.95, 0 )
    }
  ], [
    new Line( lineGeometry ),
    {
      name: 'Y',
      mode: 'scale',
      color: new Vector4( 0, 1, 0, 1 ),
      rotation: new Euler( 0, 0, Math.PI / 2 ),
      scale: new Vector3( 0.95, 1, 1 )
    }
  ], [
    new Mesh( scaleHandleGeometry ),
    {
      name: 'Z',
      mode: 'scale',
      color: new Vector4( 0, 0, 1, 1 ),
      position: new Vector3( 0, 0, 0.95 ),
      rotation: new Euler( Math.PI / 2, 0, 0 )
    }
  ], [
    new Line( lineGeometry ),
    {
      name: 'Z',
      mode: 'scale',
      color: new Vector4( 0, 0, 1, 1 ),
      rotation: new Euler( 0, - Math.PI / 2, 0 ),
      scale: new Vector3( 0.95, 1, 1 )
    }
  ], [
    new Mesh( new PlaneBufferGeometry( 0.3, 0.3 ) ),
    {
      name: 'XY',
      mode: 'scale',
      color: new Vector4( 1, 1, 0, 0.1 ),
      position: new Vector3( 0.85, 0.85, 0)
    }
  ], [
    new Line( lineGeometry ),
    {
      name: 'XY',
      mode: 'scale',
      color: new Vector4( 1, 1, 0, 1 ),
      position: new Vector3( 0.8, 1, 0 ),
      scale: new Vector3( 0.2, 1, 1 )
    }
  ], [
    new Line( lineGeometry ),
    {
      name: 'XY',
      mode: 'scale',
      color: new Vector4( 1, 1, 0, 1 ),
      position: new Vector3( 1, 0.8, 0 ),
      rotation: new Euler( 0, 0, Math.PI / 2 ),
      scale: new Vector3( 0.2, 1, 1 )
    }
  ], [
    new Mesh( new PlaneBufferGeometry( 0.3, 0.3 ) ),
    {
      name: 'YZ',
      mode: 'scale',
      color: new Vector4( 0, 1, 1, 0.1 ),
      position: new Vector3( 0, 0.85, 0.85 ),
      rotation: new Euler( 0, Math.PI / 2, 0 )
    }
  ], [
    new Line( lineGeometry ),
    {
      name: 'YZ',
      mode: 'scale',
      color: new Vector4( 0, 1, 1, 1 ),
      position: new Vector3( 0, 0.8, 1 ),
      rotation: new Euler( 0, 0, Math.PI / 2 ),
      scale: new Vector3( 0.2, 1, 1 )
    }
  ], [
    new Line( lineGeometry ),
    {
      name: 'YZ',
      mode: 'scale',
      color: new Vector4( 0, 1, 1, 1 ),
      position: new Vector3( 0, 1, 0.8 ),
      rotation: new Euler( 0, - Math.PI / 2, 0 ),
      scale: new Vector3( 0.2, 1, 1 )
    }
  ], [
    new Mesh( new PlaneBufferGeometry( 0.3, 0.3 ) ),
    {
      name: 'XZ',
      mode: 'scale',
      color: new Vector4( 1, 0, 1, 0.1 ),
      position: new Vector3( 0.85, 0, 0.85 ),
      rotation: new Euler( - Math.PI / 2, 0, 0 )
    }
  ], [
    new Line( lineGeometry ),
    {
      name: 'XZ',
      mode: 'scale',
      color: new Vector4( 1, 0, 1, 1 ),
      position: new Vector3( 0.8, 0, 1 ),
      scale: new Vector3( 0.2, 1, 1 )
    }
  ], [
    new Line( lineGeometry ),
    {
      name: 'XZ',
      mode: 'scale',
      color: new Vector4( 1, 0, 1, 1 ),
      position: new Vector3( 1, 0, 0.8 ),
      rotation: new Euler( 0, - Math.PI / 2, 0 ),
      scale: new Vector3( 0.2, 1, 1 )
    }
  ],
  // Pickers
  [
    new Mesh( new CylinderBufferGeometry( 0.2, 0, 0.7, 4, 1, false ) ),
    {
      name: 'X',
      mode: 'scale',
      color: new Vector4( 1, 1, 1, 0 ),
      position: new Vector3( 0.7, 0, 0 ),
      rotation: new Euler( 0, 0, - Math.PI / 2 ),
      tag: 'picker',
    }
  ], [
    new Mesh( new CylinderBufferGeometry( 0.2, 0, 0.7, 4, 1, false ) ),
    {
      name: 'Y',
      mode: 'scale',
      color: new Vector4( 1, 1, 1, 0 ),
      position: new Vector3( 0, 0.7, 0),
      tag: 'picker',
    }
  ], [
    new Mesh( new CylinderBufferGeometry( 0.2, 0, 0.7, 4, 1, false ) ),
    {
      name: 'Z',
      mode: 'scale',
      color: new Vector4( 1, 1, 1, 0 ),
      tag: 'picker',
      position: new Vector3( 0, 0, 0.7 ),
      rotation: new Euler( Math.PI / 2, 0, 0 ),
    }
  ], [
    new Mesh( scaleHandleGeometry ),
    {
      name: 'XY',
      mode: 'scale',
      color: new Vector4( 1, 1, 1, 0 ),
      tag: 'picker',
      position: new Vector3( 0.85, 0.85, 0 ),
      scale: new Vector3( 3, 3, 0.2 ),
    }
  ], [
    new Mesh( scaleHandleGeometry ),
    {
      name: 'YZ',
      mode: 'scale',
      color: new Vector4( 1, 1, 1, 0 ),
      tag: 'picker',
      position: new Vector3( 0, 0.85, 0.85 ),
      scale: new Vector3( 0.2, 3, 3 ),
    }
  ], [
    new Mesh( scaleHandleGeometry ),
    {
      name: 'XZ',
      mode: 'scale',
      color: new Vector4( 1, 1, 1, 0 ),
      tag: 'picker',
      position: new Vector3( 0.85, 0, 0.85 ),
      scale: new Vector3( 3, 0.2, 3 ),
    }
  ], [
    new Mesh( new BoxBufferGeometry( 0.2, 0.2, 0.2 ) ),
    {
      name: 'XYZX',
      mode: 'scale',
      color: new Vector4( 1, 1, 1, 0 ),
      tag: 'picker',
      position: new Vector3( 1.1, 0, 0)
    }
  ], [
    new Mesh( new BoxBufferGeometry( 0.2, 0.2, 0.2 ) ),
    {
      name: 'XYZY',
      mode: 'scale',
      color: new Vector4( 1, 1, 1, 0 ),
      tag: 'picker',
      position: new Vector3( 0, 1.1, 0),
    }
  ], [
    new Mesh( new BoxBufferGeometry( 0.2, 0.2, 0.2 ) ),
    {
      name: 'XYZZ',
      mode: 'scale',
      color: new Vector4( 1, 1, 1, 0 ),
      tag: 'picker',
      position: new Vector3( 0, 0, 1.1),
    }
  ],
];

export class ScaleHelper extends ControlsHelper {
  readonly isScaleHelper = true;
  type = 'ScaleHelper';
  constructor() {
    super( scaleHelperGeometrySpec );
  }
  updateHandleTransform( handle: Mesh ) {
    const eye = this.eye;
    const quaternion = this.quaternion;

    handle.quaternion.copy( this.quaternion ).inverse();
    handle.position.set( 0, 0, 0 );

    handle.scale.set( 1, 1, 1 ).multiplyScalar( this.sizeAttenuation * this.size / 7 );

    // Align handles to current local or world rotation
    handle.quaternion.multiply( quaternion );
    if ( handle.name === 'X' || handle.name === 'XYZX' ) {
      if ( Math.abs( alignVector.copy( unitX ).applyQuaternion( quaternion ).dot( eye ) ) > AXIS_HIDE_TRESHOLD ) {
        handle.scale.set( 1e-10, 1e-10, 1e-10 );
        handle.visible = false;
      }
    }
    if ( handle.name === 'Y' || handle.name === 'XYZY' ) {
      if ( Math.abs( alignVector.copy( unitY ).applyQuaternion( quaternion ).dot( eye ) ) > AXIS_HIDE_TRESHOLD ) {
        handle.scale.set( 1e-10, 1e-10, 1e-10 );
        handle.visible = false;
      }
    }
    if ( handle.name === 'Z' || handle.name === 'XYZZ' ) {
      if ( Math.abs( alignVector.copy( unitZ ).applyQuaternion( quaternion ).dot( eye ) ) > AXIS_HIDE_TRESHOLD ) {
        handle.scale.set( 1e-10, 1e-10, 1e-10 );
        handle.visible = false;
      }
    }
    if ( handle.name === 'XY' ) {
      if ( Math.abs( alignVector.copy( unitZ ).applyQuaternion( quaternion ).dot( eye ) ) < PLANE_HIDE_TRESHOLD ) {
        handle.scale.set( 1e-10, 1e-10, 1e-10 );
        handle.visible = false;
      }
    }
    if ( handle.name === 'YZ' ) {
      if ( Math.abs( alignVector.copy( unitX ).applyQuaternion( quaternion ).dot( eye ) ) < PLANE_HIDE_TRESHOLD ) {
        handle.scale.set( 1e-10, 1e-10, 1e-10 );
        handle.visible = false;
      }
    }
    if ( handle.name === 'XZ' ) {
      if ( Math.abs( alignVector.copy( unitY ).applyQuaternion( quaternion ).dot( eye ) ) < PLANE_HIDE_TRESHOLD ) {
        handle.scale.set( 1e-10, 1e-10, 1e-10 );
        handle.visible = false;
      }
    }
    // Flip translate and scale axis ocluded behind another axis
    if ( handle.name.search( 'X' ) !== - 1 ) {
      if ( alignVector.copy( unitX ).applyQuaternion( quaternion ).dot( eye ) < AXIS_FLIP_TRESHOLD ) {
        if ( handle.userData.tag === 'fwd' ) {
          handle.visible = false;
        } else {
          handle.scale.x *= - 1;
        }
      } else if ( handle.userData.tag === 'bwd' ) {
        handle.visible = false;
      }
    }
    if ( handle.name.search( 'Y' ) !== - 1 ) {
      if ( alignVector.copy( unitY ).applyQuaternion( quaternion ).dot( eye ) < AXIS_FLIP_TRESHOLD ) {
        if ( handle.userData.tag === 'fwd' ) {
          handle.visible = false;
        } else {
          handle.scale.y *= - 1;
        }
      } else if ( handle.userData.tag === 'bwd' ) {
        handle.visible = false;
      }
    }
    if ( handle.name.search( 'Z' ) !== - 1 ) {
      if ( alignVector.copy( unitZ ).applyQuaternion( quaternion ).dot( eye ) < AXIS_FLIP_TRESHOLD ) {
        if ( handle.userData.tag === 'fwd' ) {
          handle.visible = false;
        } else {
          handle.scale.z *= - 1;
        }
      } else if ( handle.userData.tag === 'bwd' ) {
        handle.visible = false;
      }
    }
  }
}