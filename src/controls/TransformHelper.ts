import { Quaternion, Mesh, Vector3, Matrix4, Line } from '../../../three';

import { ControlsHelper, ControlsHelperGeometrySpec } from './ControlsHelper.js';
import { translateHelperGeometrySpec } from './TranslateHelper.js';
import { rotateHelperGeometrySpec } from './RotateHelper.js';
import { scaleHelperGeometrySpec } from './ScaleHelper.js';

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

export const transformHelperGeometrySpec: [ Mesh | Line, ControlsHelperGeometrySpec ][] = [
  ...scaleHelperGeometrySpec,
  ...translateHelperGeometrySpec,
  ...rotateHelperGeometrySpec,
];

export class TransformHelper extends ControlsHelper {
  readonly isTransformHelper = true;
  type = 'TransformHelper';
  constructor() {
    super( transformHelperGeometrySpec );
  }
  updateHandleTransform( handle: Mesh ) {
    const eye = this.eye;
    const quaternion = this.quaternion;

    handle.quaternion.copy( this.quaternion ).inverse();
    handle.position.set( 0, 0, 0 );

    handle.scale.set( 1, 1, 1 ).multiplyScalar( this.sizeAttenuation * this.size / 7 );

    const tag = handle.userData.tag;
    const mode = handle.userData.mode;

    // Align handles to current local or world rotation
    if ( mode === 'rotate' ) {
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
    } else {
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
          if ( tag === 'fwd' ) {
            handle.visible = false;
          } else {
            handle.scale.x *= - 1;
          }
        } else if ( tag === 'bwd' ) {
          handle.visible = false;
        }
      }
      if ( handle.name.search( 'Y' ) !== - 1 ) {
        if ( alignVector.copy( unitY ).applyQuaternion( quaternion ).dot( eye ) < AXIS_FLIP_TRESHOLD ) {
          if ( tag === 'fwd' ) {
            handle.visible = false;
          } else {
            handle.scale.y *= - 1;
          }
        } else if ( tag === 'bwd' ) {
          handle.visible = false;
        }
      }
      if ( handle.name.search( 'Z' ) !== - 1 ) {
        if ( alignVector.copy( unitZ ).applyQuaternion( quaternion ).dot( eye ) < AXIS_FLIP_TRESHOLD ) {
          if ( tag === 'fwd' ) {
            handle.visible = false;
          } else {
            handle.scale.z *= - 1;
          }
        } else if ( tag === 'bwd' ) {
          handle.visible = false;
        }
      }
    }
  }
}