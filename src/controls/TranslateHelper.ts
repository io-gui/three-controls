import { Vector4, Mesh, Vector3, CylinderBufferGeometry, Euler, Line, Float32BufferAttribute, BufferGeometry, OctahedronBufferGeometry, PlaneBufferGeometry } from '../../../three';

import { ControlsHelper, ControlsHelperGeometrySpec } from './ControlsHelper.js';

export const arrowGeometry = new CylinderBufferGeometry( 0, 0.05, 0.2, 12, 1, false );

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

export const translateHelperGeometrySpec: [ Mesh | Line, ControlsHelperGeometrySpec ][] = [
  [
    new Mesh( arrowGeometry ),
    {
      name: 'X',
      mode: 'translate',
      color: new Vector4( 1, 0, 0, 1 ),
      tag: 'fwd',
      position: new Vector3( 0.8, 0, 0 ),
      rotation: new Euler( 0, 0, - Math.PI / 2 ),
    }
  ], [
    new Mesh( arrowGeometry ),
    {
      name: 'X',
      mode: 'translate',
      color: new Vector4( 1, 0, 0, 1 ),
      tag: 'bwd',
      position: new Vector3( 0.8, 0, 0 ),
      rotation: new Euler( 0, 0, Math.PI / 2 ),
    }
  ], [
    new Line( lineGeometry ),
    {
      name: 'X',
      mode: 'translate',
      color: new Vector4( 1, 0, 0, 1 ),
      scale: new Vector3( 0.8, 0.8, 0.8 )
    }
  ], [
    new Mesh( arrowGeometry ),
    {
      name: 'Y',
      mode: 'translate',
      color: new Vector4( 0, 1, 0, 1 ),
      tag: 'fwd',
      position: new Vector3( 0, 0.8, 0 ),
    }
  ], [
    new Mesh( arrowGeometry ),
    {
      name: 'Y',
      mode: 'translate',
      color: new Vector4( 0, 1, 0, 1 ),
      tag: 'bwd',
      position: new Vector3( 0, 0.8, 0 ),
      rotation: new Euler( Math.PI, 0, 0 ),
    }
  ], [
    new Line( lineGeometry ),
    {
      name: 'Y',
      mode: 'translate',
      color: new Vector4( 0, 1, 0, 1 ),
      rotation: new Euler( 0, 0, Math.PI / 2 ),
      scale: new Vector3( 0.8, 0.8, 0.8 )
    }
  ], [
    new Mesh( arrowGeometry ),
    {
      name: 'Z',
      mode: 'translate',
      color: new Vector4( 0, 0, 1, 1 ),
      tag: 'fwd',
      position: new Vector3( 0, 0, 0.8 ),
      rotation: new Euler( Math.PI / 2, 0, 0 ),
    }
  ], [
    new Mesh( arrowGeometry ),
    {
      name: 'Z',
      mode: 'translate',
      color: new Vector4( 0, 0, 1, 1 ),
      tag: 'bwd',
      position: new Vector3( 0, 0, 0.8 ),
      rotation: new Euler( - Math.PI / 2, 0, 0 ),
    }
  ], [
    new Line( lineGeometry ),
    {
      name: 'Z',
      mode: 'translate',
      color: new Vector4( 0, 0, 1, 1 ),
      rotation: new Euler( 0, - Math.PI / 2, 0 ),
      scale: new Vector3( 0.8, 0.8, 0.8 )
    }
  ], [
    new Mesh( new OctahedronBufferGeometry( 0.1, 0 ) ),
    {
      name: 'XYZ',
      mode: 'translate',
      color: new Vector4( 1, 1, 1, 0.25 ),
      position: new Vector3( 0, 0, 0 ),
      rotation: new Euler( 0, 0, 0 )
    }
  ], [
    new Mesh( new PlaneBufferGeometry( 0.3, 0.3 ) ),
    {
      name: 'XY',
      mode: 'translate',
      color: new Vector4( 1, 1, 0, 0.05 ),
      position: new Vector3( 0.15, 0.15, 0)
    }
  ], [
    new Line( lineGeometry ),
    {
      name: 'XY',
      mode: 'translate',
      color: new Vector4( 1, 1, 0, 1 ),
      position: new Vector3( 0.15, 0.3, 0 ),
      scale: new Vector3( 0.15, 1, 1 )
    }
  ], [
    new Line( lineGeometry ),
    {
      name: 'XY',
      mode: 'translate',
      color: new Vector4( 1, 1, 0, 1 ),
      position: new Vector3( 0.3, 0.15, 0 ),
      rotation: new Euler( 0, 0, Math.PI / 2 ),
      scale: new Vector3( 0.15, 1, 1 )
    }
  ], [
    new Mesh( new PlaneBufferGeometry( 0.3, 0.3 ) ),
    {
      name: 'YZ',
      mode: 'translate',
      color: new Vector4( 0, 1, 1, 0.05 ),
      position: new Vector3( 0, 0.15, 0.15 ),
      rotation: new Euler( 0, Math.PI / 2, 0 )
    }
  ], [
    new Line( lineGeometry ),
    {
      name: 'YZ',
      mode: 'translate',
      color: new Vector4( 0, 1, 1, 1 ),
      position: new Vector3( 0, 0.15, 0.3 ),
      rotation: new Euler( 0, 0, Math.PI / 2 ),
      scale: new Vector3( 0.15, 1, 1 )
    }
  ], [
    new Line( lineGeometry ),
    {
      name: 'YZ',
      mode: 'translate',
      color: new Vector4( 0, 1, 1, 1 ),
      position: new Vector3( 0, 0.3, 0.15 ),
      rotation: new Euler( 0, - Math.PI / 2, 0 ),
      scale: new Vector3( 0.15, 1, 1 )
    }
  ], [
    new Mesh( new PlaneBufferGeometry( 0.3, 0.3 ) ),
    {
      name: 'XZ',
      mode: 'translate',
      color: new Vector4( 1, 0, 1, 0.05 ),
      position: new Vector3( 0.15, 0, 0.15 ),
      rotation: new Euler( - Math.PI / 2, 0, 0 )
    }
  ], [
    new Line( lineGeometry ),
    {
      name: 'XZ',
      mode: 'translate',
      color: new Vector4( 1, 0, 1, 1 ),
      position: new Vector3( 0.15, 0, 0.3 ),
      scale: new Vector3( 0.15, 1, 1 )
    }
  ], [
    new Line( lineGeometry ),
    {
      name: 'XZ',
      mode: 'translate',
      color: new Vector4( 1, 0, 1, 1 ),
      position: new Vector3( 0.3, 0, 0.15 ),
      rotation: new Euler( 0, - Math.PI / 2, 0 ),
      scale: new Vector3( 0.15, 1, 1 )
    }
  ],
  // Pickers
  [
    new Mesh( new CylinderBufferGeometry( 0.2, 0, 0.6, 4, 1, false ) ),
    {
      name: 'X',
      mode: 'translate',
      color: new Vector4( 1, 1, 1, 0 ),
      tag: 'picker',
      position: new Vector3( 0.6, 0, 0 ),
      rotation: new Euler( 0, 0, - Math.PI / 2 ),
    }
  ], [
    new Mesh( new CylinderBufferGeometry( 0.2, 0, 0.6, 4, 1, false ) ),
    {
      name: 'Y',
      mode: 'translate',
      color: new Vector4( 1, 1, 1, 0 ),
      tag: 'picker',
      position: new Vector3( 0, 0.6, 0),
    }
  ], [
    new Mesh( new CylinderBufferGeometry( 0.2, 0, 0.6, 4, 1, false ) ),
    {
      name: 'Z',
      mode: 'translate',
      color: new Vector4( 1, 1, 1, 0 ),
      tag: 'picker',
      position: new Vector3( 0, 0, 0.6 ),
      rotation: new Euler( Math.PI / 2, 0, 0 ),
    }
  ], [
    new Mesh( new OctahedronBufferGeometry( 0.2, 0 ) ),
    {
      name: 'XYZ',
      mode: 'translate',
      color: new Vector4( 1, 1, 1, 0 ),
      tag: 'picker',
    }
  ], [
    new Mesh( new PlaneBufferGeometry( 0.4, 0.4 ) ),
    {
      name: 'XY',
      mode: 'translate',
      color: new Vector4( 1, 1, 1, 0 ),
      tag: 'picker',
      position: new Vector3( 0.2, 0.2, 0),
    }
  ], [
    new Mesh( new PlaneBufferGeometry( 0.4, 0.4 ) ),
    {
      name: 'YZ',
      mode: 'translate',
      color: new Vector4( 1, 1, 1, 0 ),
      tag: 'picker',
      position: new Vector3( 0, 0.2, 0.2 ),
      rotation: new Euler( 0, Math.PI / 2, 0 ),
    }
  ], [
    new Mesh( new PlaneBufferGeometry( 0.4, 0.4 ) ),
    {
      name: 'XZ',
      mode: 'translate',
      color: new Vector4( 1, 1, 1, 0 ),
      tag: 'picker',
      position: new Vector3( 0.2, 0, 0.2 ),
      rotation: new Euler( - Math.PI / 2, 0, 0 ),
    }
  ],
];

export class TranslateHelper extends ControlsHelper {
  readonly isTranslateHelper = true;
  type = 'TranslateHelper';
  constructor() {
    super( translateHelperGeometrySpec );
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