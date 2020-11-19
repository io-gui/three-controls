import { Mesh, MeshBasicMaterial, Object3D, Quaternion, Vector3, PerspectiveCamera, OrthographicCamera, Intersection } from '../../../three/src/Three';

import { ControlsMixin, Pointer, CHANGE_EVENT, START_EVENT, END_EVENT } from './Controls.js';
import { TransformHelper } from './TransformHelper.js';

const unitX = new Vector3( 1, 0, 0 );
const unitY = new Vector3( 0, 1, 0 );
const unitZ = new Vector3( 0, 0, 1 );
const dirVector = new Vector3();
const identityQuaternion = new Quaternion();

const _tempVector = new Vector3();
const _tempVector2 = new Vector3();
const _tempQuaternion = new Quaternion();
const _unit = {
  X: new Vector3( 1, 0, 0 ),
  Y: new Vector3( 0, 1, 0 ),
  Z: new Vector3( 0, 0, 1 )
};

const pointStart = new Vector3();
const pointEnd = new Vector3();
const offset = new Vector3();
const startNorm = new Vector3();
const endNorm = new Vector3();

const mouseDownEvent = { type: 'mouseDown', mode: '' };
const mouseUpEvent = { type: 'mouseUp', mode: '' }; // TODO: make dynamic
const objectChangeEvent = { type: 'objectChange' };

function getFirstIntersection(intersections: Intersection[], includeInvisible: boolean ): Intersection | null {
  for ( let i = 0; i < intersections.length; i ++ ) {
    if ( intersections[ i ].object.visible || includeInvisible ) {
      return intersections[ i ];
    }
  }
  return null;
}

class TransformControls extends ControlsMixin( TransformHelper as any ) {
  readonly isTransformControls = true;
  type = 'TransformControls';

  // Public API

  camera: PerspectiveCamera | OrthographicCamera;
  domElement: HTMLElement;
  lookAtTarget = false;
  object?: Object3D;

  space = 'world';
  translationSnap = 0;
  rotationSnap = 0;
  scaleSnap = 0;

  cameraPosition = new Vector3();
  cameraQuaternion = new Quaternion();
  cameraScale = new Vector3();

  parentPosition = new Vector3();
  parentQuaternion = new Quaternion();
  parentQuaternionInv = new Quaternion();
  parentScale = new Vector3();

  worldPositionStart = new Vector3();
  worldQuaternionStart = new Quaternion();
  worldScaleStart = new Vector3();

  worldPosition = new Vector3();
  worldQuaternion = new Quaternion();
  worldQuaternionInv = new Quaternion();
  worldScale = new Vector3();

  positionStart = new Vector3();
  quaternionStart = new Quaternion();
  scaleStart = new Vector3();

  rotationAxis = new Vector3();
  rotationAngle = 0;

  constructor ( camera: PerspectiveCamera | OrthographicCamera, domElement: HTMLElement ) {
    super( camera, domElement );

    this.visible = false;
    this.camera = camera;
    this.domElement = domElement;

    /* eslint-disable @typescript-eslint/no-use-before-define */

    // Define properties with getters/setter
    // Setting the defined property will automatically trigger change event
    // Defined properties are passed down to gizmo and plane

    this.observeProperty( 'camera' );
    this.observeProperty( 'object' );
    this.observeProperty( 'activeAxis' );
    this.observeProperty( 'activeMode' );
    this.observeProperty( 'space', );
    this.observeProperty( 'size' );
    this.observeProperty( 'dragging' );
    this.observeProperty( 'showX' );
    this.observeProperty( 'showY' );
    this.observeProperty( 'showZ' );
    this.observeProperty( 'showTranslate' );
    this.observeProperty( 'showRotate' );
    this.observeProperty( 'showScale' );

    // Deprecation warnings
    Object.defineProperty( this, 'mode', {
      set: () => {
        console.warn( 'THREE.TransformControls: "mode" has been deprecated. Use showTranslate, showScale and showRotate.' );
      }
    });
  }

  updateHandle( handle: Mesh ) {
    super.updateHandle( handle );
    if ( handle.userData.type === 'scale' && this.space === 'world') {
      if ( ['XYZX', 'XYZY', 'XYZZ'].indexOf( handle.userData.axis ) === -1 ) handle.visible = false;
    }
  }

  updateMatrixWorld() {
    if ( this.object !== undefined ) {
      this.object.updateMatrixWorld();
      if ( this.object.parent === null ) {
        console.error( 'TransformControls: The attached 3D object must be a part of the scene graph.' );
      } else {
        this.object.parent.matrixWorld.decompose( this.parentPosition, this.parentQuaternion, this.parentScale );
      }
      this.object.matrixWorld.decompose( this.worldPosition, this.worldQuaternion, this.worldScale );
      this.parentQuaternionInv.copy( this.parentQuaternion ).invert();
      this.worldQuaternionInv.copy( this.worldQuaternion ).invert();
    }
    this.camera.updateMatrixWorld();
    this.camera.matrixWorld.decompose( this.cameraPosition, this.cameraQuaternion, this.cameraScale );
    this.eye.copy( this.cameraPosition ).sub( this.worldPosition ).normalize();
    this.position.copy( this.worldPosition );
    this.quaternion.copy( this.space === 'local' ? this.worldQuaternion : identityQuaternion );
    super.updateMatrixWorld();
  }

  getPlaneNormal(): Vector3 {
    unitX.set( 1, 0, 0 ).applyQuaternion( this.space === 'local' ? this.worldQuaternion : identityQuaternion );
    unitY.set( 0, 1, 0 ).applyQuaternion( this.space === 'local' ? this.worldQuaternion : identityQuaternion );
    unitZ.set( 0, 0, 1 ).applyQuaternion( this.space === 'local' ? this.worldQuaternion : identityQuaternion );
    // Align the plane for current transform mode, axis and space.
    switch ( this.activeMode ) {
      case 'translate':
      case 'scale':
        switch ( this.activeAxis ) {
          case 'X':
            dirVector.set( 0, 0, 1 ).applyQuaternion( this.camera.quaternion ).normalize().cross( unitX ).cross( unitX )
            break;
          case 'Y':
            dirVector.set( 0, 0, 1 ).applyQuaternion( this.camera.quaternion ).normalize().cross( unitY ).cross( unitY )
            break;
            case 'Z':
            dirVector.set( 0, 0, 1 ).applyQuaternion( this.camera.quaternion ).normalize().cross( unitZ ).cross( unitZ )
            break;
          case 'XY':
            dirVector.copy( unitZ );
            break;
          case 'YZ':
            dirVector.copy( unitX );
            break;
          case 'XZ':
            dirVector.copy( unitY );
            break;
          case 'XYZ':
          case 'XYZX':
          case 'XYZY':
          case 'XYZZ':
          case 'E':
            dirVector.set( 0, 0, 1 ).applyQuaternion( this.camera.quaternion ).normalize()
            break;
        }
        break;
      case 'rotate':
      default:
        // special case for rotate
        dirVector.set( 0, 0, 1 ).applyQuaternion( this.camera.quaternion ).normalize()
    }
    return dirVector;
  }

  onTrackedPointerHover( pointer: Pointer ): void {
    if ( this.object === undefined || this.dragging === true ) return;
    const pickers = this.children.filter((child: Object3D) => {
      return child.userData.tag === 'picker';
    });
    const intersect = getFirstIntersection(pointer.intersectObjects(pickers), false);
    if ( intersect && !pointer.isSimulated ) {
      this.activeMode = intersect.object.userData.type;
      this.activeAxis = intersect.object.userData.axis;
    } else {
      this.activeMode = '';
      this.activeAxis = '';
    }
  }

  onTrackedPointerDown( pointer: Pointer ): void {
    // TODO: Unhack! This enables axis reset/interrupt when simulated pointer is driving gesture with inertia.
    this.activeAxis = '';
    // TODO: consider triggering hover from Controls.js
    // Simulates hover before down on touchscreen
    this.onTrackedPointerHover( pointer );
    // TODO: Unhack! This enables axis reset/interrupt when simulated pointer is driving gesture with inertia.
    if ( this.activeAxis === '' ) this.dragging = false;

    if ( this.object === undefined || this.dragging === true || pointer.button !== 0 ) return;
    if ( this.activeAxis !== '' ) {
      // Plane
      const intersection = pointer.projectOnPlane(_tempVector.copy( this.worldPosition ), this.getPlaneNormal());
      if ( intersection ) { // TODO: handle intersection miss
        let space = this.space;
        if ( this.activeMode === 'scale' ) {
          space = 'local';
        } else if ( this.activeAxis === 'E' || this.activeAxis === 'XYZE' || this.activeAxis === 'XYZ' ) {
          space = 'world';
        }
        if ( space === 'local' && this.activeMode === 'rotate' ) {
          const snap = this.rotationSnap;
          if ( this.activeAxis === 'X' && snap ) this.object.rotation.x = Math.round( this.object.rotation.x / snap ) * snap
          if ( this.activeAxis === 'Y' && snap ) this.object.rotation.y = Math.round( this.object.rotation.y / snap ) * snap
          if ( this.activeAxis === 'Z' && snap ) this.object.rotation.z = Math.round( this.object.rotation.z / snap ) * snap;
        }
        this.object.updateMatrixWorld()
        if (this.object.parent) this.object.parent.updateMatrixWorld();
        this.positionStart.copy( this.object.position )
        this.quaternionStart.copy( this.object.quaternion )
        this.scaleStart.copy( this.object.scale );
        this.object.matrixWorld.decompose( this.worldPositionStart, this.worldQuaternionStart, this.worldScaleStart );
        pointStart.copy( intersection.current ).sub( this.worldPositionStart );
      }
      this.dragging = true
      mouseDownEvent.mode = this.activeMode
      this.dispatchEvent( mouseDownEvent );
      this.dispatchEvent( START_EVENT );
    }
  }

  onTrackedPointerMove( pointer: Pointer ): void {
    const axis = this.activeAxis
    const mode = this.activeMode
    const object = this.object
    let space = this.space;
    if ( mode === 'scale' ) {
      space = 'local';
    } else if ( axis === 'E' || axis === 'XYZE' || axis === 'XYZ' ) {
      space = 'world';
    }
    if ( object === undefined || axis === '' || this.dragging === false || pointer.button !== 0 ) return;
    const intersection = pointer.projectOnPlane(_tempVector.copy( this.worldPosition ), this.getPlaneNormal());
    if ( !intersection ) return; // TODO: handle intersection miss
    pointEnd.copy( intersection.current ).sub( this.worldPositionStart );
    if ( mode === 'translate' ) {
      // Apply translate
      offset.copy( pointEnd ).sub( pointStart );
      if ( space === 'local' && axis !== 'XYZ' ) {
        offset.applyQuaternion( this.worldQuaternionInv );
      }
      if ( axis.indexOf( 'X' ) === - 1 ) offset.x = 0
      if ( axis.indexOf( 'Y' ) === - 1 ) offset.y = 0
      if ( axis.indexOf( 'Z' ) === - 1 ) offset.z = 0;
      if ( space === 'local' && axis !== 'XYZ' ) {
        offset.applyQuaternion( this.quaternionStart ).divide( this.parentScale );
      } else {
        offset.applyQuaternion( this.parentQuaternionInv ).divide( this.parentScale );
      }
      object.position.copy( offset ).add( this.positionStart );
      // Apply translation snap
      if ( this.translationSnap ) {
        if ( space === 'local' ) {
          object.position.applyQuaternion( _tempQuaternion.copy( this.quaternionStart ).invert() );
          if ( axis.search( 'X' ) !== - 1 ) {
            object.position.x = Math.round( object.position.x / this.translationSnap ) * this.translationSnap;
          }
          if ( axis.search( 'Y' ) !== - 1 ) {
            object.position.y = Math.round( object.position.y / this.translationSnap ) * this.translationSnap;
          }
          if ( axis.search( 'Z' ) !== - 1 ) {
            object.position.z = Math.round( object.position.z / this.translationSnap ) * this.translationSnap;
          }
          object.position.applyQuaternion( this.quaternionStart );
        }
        if ( space === 'world' ) {
          if ( object.parent ) {
            object.position.add( _tempVector.setFromMatrixPosition( object.parent.matrixWorld ) );
          }
          if ( axis.search( 'X' ) !== - 1 ) {
            object.position.x = Math.round( object.position.x / this.translationSnap ) * this.translationSnap;
          }
          if ( axis.search( 'Y' ) !== - 1 ) {
            object.position.y = Math.round( object.position.y / this.translationSnap ) * this.translationSnap;
          }
          if ( axis.search( 'Z' ) !== - 1 ) {
            object.position.z = Math.round( object.position.z / this.translationSnap ) * this.translationSnap;
          }
          if ( object.parent ) {
            object.position.sub( _tempVector.setFromMatrixPosition( object.parent.matrixWorld ) );
          }
        }
      }
    } else if ( mode === 'scale' ) {
      if ( axis.search( 'XYZ' ) !== - 1 ) {
        let d = pointEnd.length() / pointStart.length();
        if ( pointEnd.dot( pointStart ) < 0 ) d *= - 1;
        _tempVector2.set( d, d, d );
      } else {
        _tempVector.copy( pointStart )
        _tempVector2.copy( pointEnd );
        _tempVector.applyQuaternion( this.worldQuaternionInv )
        _tempVector2.applyQuaternion( this.worldQuaternionInv );
        _tempVector2.divide( _tempVector );
        if ( axis.search( 'X' ) === - 1 ) {
          _tempVector2.x = 1;
        }
        if ( axis.search( 'Y' ) === - 1 ) {
          _tempVector2.y = 1;
        }
        if ( axis.search( 'Z' ) === - 1 ) {
          _tempVector2.z = 1;
        }
      }
      // Apply scale
      object.scale.copy( this.scaleStart ).multiply( _tempVector2 );
      if ( this.scaleSnap ) {
        if ( axis.search( 'X' ) !== - 1 ) {
          object.scale.x = Math.round( object.scale.x / this.scaleSnap ) * this.scaleSnap || this.scaleSnap;
        }
        if ( axis.search( 'Y' ) !== - 1 ) {
          object.scale.y = Math.round( object.scale.y / this.scaleSnap ) * this.scaleSnap || this.scaleSnap;
        }
        if ( axis.search( 'Z' ) !== - 1 ) {
          object.scale.z = Math.round( object.scale.z / this.scaleSnap ) * this.scaleSnap || this.scaleSnap;
        }
      }
    } else if ( mode === 'rotate' ) {
      offset.copy( pointEnd ).sub( pointStart );
      const ROTATION_SPEED = 20 / this.worldPosition.distanceTo( _tempVector.setFromMatrixPosition( this.camera.matrixWorld ) );
      if ( axis === 'E' ) {
        this.rotationAxis.copy( this.eye )
        this.rotationAngle = pointEnd.angleTo( pointStart );
        startNorm.copy( pointStart ).normalize()
        endNorm.copy( pointEnd ).normalize();
        this.rotationAngle *= ( endNorm.cross( startNorm ).dot( this.eye ) < 0 ? 1 : - 1 );
      } else if ( axis === 'XYZE' ) {
        this.rotationAxis.copy( offset ).cross( this.eye ).normalize()
        this.rotationAngle = offset.dot( _tempVector.copy( this.rotationAxis ).cross( this.eye ) ) * ROTATION_SPEED;
      } else if ( axis === 'X' || axis === 'Y' || axis === 'Z' ) {
        this.rotationAxis.copy( _unit[ axis as 'X' | 'Y' | 'Z' ] );
        _tempVector.copy( _unit[ axis as 'X' | 'Y' | 'Z' ] );
        if ( space === 'local' ) {
          _tempVector.applyQuaternion( this.worldQuaternion );
        }
        this.rotationAngle = offset.dot( _tempVector.cross( this.eye ).normalize() ) * ROTATION_SPEED;
      }
      // Apply rotation snap
      if ( this.rotationSnap ) this.rotationAngle = Math.round( this.rotationAngle / this.rotationSnap ) * this.rotationSnap;
      // Apply rotat
      if ( space === 'local' && axis !== 'E' && axis !== 'XYZE' ) {
        object.quaternion.copy( this.quaternionStart )
        object.quaternion.multiply( _tempQuaternion.setFromAxisAngle( this.rotationAxis, this.rotationAngle ) ).normalize();
      } else {
        this.rotationAxis.applyQuaternion( this.parentQuaternionInv )
        object.quaternion.copy( _tempQuaternion.setFromAxisAngle( this.rotationAxis, this.rotationAngle ) )
        object.quaternion.multiply( this.quaternionStart ).normalize();
      }
    }
    this.dispatchEvent( CHANGE_EVENT )
    this.dispatchEvent( objectChangeEvent );
  }

  onTrackedPointerUp( pointer: Pointer ): void {
    if ( pointer.button > 0 ) return;
    if ( this.dragging && ( this.activeAxis !== '' ) ) {
      mouseUpEvent.mode = this.activeMode
      this.dispatchEvent( mouseUpEvent );
      this.dispatchEvent( END_EVENT );
    }
    this.dragging = false
    this.activeAxis = '';
  }
  dispose() {
    this.traverse( ( child: Object3D ) => {
      const mesh = child as Mesh;
      if ( mesh.geometry ) mesh.geometry.dispose();
      if ( mesh.material ) (mesh.material as MeshBasicMaterial).dispose();
    } );
  }
  // Set current object
  attach( object: Object3D ): this {
    this.object = object;
    this.visible = true;
    return this;
  }
  // Detatch from object
  detach(): this {
    this.object = undefined;
    this.visible = false;
    this.activeAxis = '';
    return this;
  }
  // TODO: deprecate
  getMode() {
    console.warn( 'THREE.TransformControls: getMode function has been deprecated. Use showTranslate, showScale and showRotate.' );
  }
  setMode() {
    console.warn( 'THREE.TransformControls: setMode function has been deprecated. Use showTranslate, showScale and showRotate.' );
  }
  setTranslationSnap( translationSnap: number ) {
    console.warn( 'THREE.TransformControls: setTranslationSnap function has been deprecated.' );
    this.translationSnap = translationSnap;
  }
  setRotationSnap( rotationSnap: number ) {
    console.warn( 'THREE.TransformControls: setRotationSnap function has been deprecated.' );
    this.rotationSnap = rotationSnap;
  }
  setScaleSnap( scaleSnap: number ) {
    console.warn( 'THREE.TransformControls: setScaleSnap function has been deprecated.' );
    this.scaleSnap = scaleSnap;
  }
  setSize( size: number ) {
    console.warn( 'THREE.TransformControls: setSize function has been deprecated.' );
    this.size = size;
  }
  setSpace( space: string ) {
    console.warn( 'THREE.TransformControls: setSpace function has been deprecated.' );
    this.space = space;
  }
  update() {
    console.warn( 'THREE.TransformControls: update function has been deprecated.' );
  }

}

export { TransformControls };
