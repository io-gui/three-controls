import { Mesh, MeshBasicMaterial, Object3D, Quaternion, Vector3, PerspectiveCamera, OrthographicCamera, Intersection } from "../../../three";

import { ControlsMixin, Pointer, CHANGE_EVENT, START_EVENT, END_EVENT } from "./Controls.js";
import { TransformControlsGizmo } from "./TransformControlsGizmo.js";

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
const rotationAxis = new Vector3();
const startNorm = new Vector3();
const endNorm = new Vector3();
let rotationAngle = 0;

const cameraPosition = new Vector3();
const cameraQuaternion = new Quaternion();
const cameraScale = new Vector3();

const parentPosition = new Vector3();
const parentQuaternion = new Quaternion();
const parentQuaternionInv = new Quaternion();
const parentScale = new Vector3();

const worldPositionStart = new Vector3();
const worldQuaternionStart = new Quaternion();
const worldScaleStart = new Vector3();

const worldPosition = new Vector3();
const worldQuaternion = new Quaternion();
const worldQuaternionInv = new Quaternion();
const worldScale = new Vector3();

const eye = new Vector3();

const positionStart = new Vector3();
const quaternionStart = new Quaternion();
const scaleStart = new Vector3();

const mouseDownEvent = { type: "mouseDown", mode: '' };
const mouseUpEvent = { type: "mouseUp", mode: '' }; // TODO: make dynamic
const objectChangeEvent = { type: "objectChange" };

function getFirstIntersection(intersections: Intersection[], includeInvisible: boolean ): Intersection | null {
  for ( let i = 0; i < intersections.length; i ++ ) {
    if ( intersections[ i ].object.visible || includeInvisible ) {
      return intersections[ i ];
    }
  }
  return null;
}

class TransformControls extends ControlsMixin( Object3D as any ) {
  // Public API
  camera: PerspectiveCamera | OrthographicCamera;
  domElement: HTMLElement;
  readonly isTransformControls = true;
  lookAtTarget = false;
  //
  object?: Object3D;
  enabled = true;
  axis: '' | 'X' | 'Y' | 'Z' | 'XY' | 'YZ' | 'XZ' | 'XYZ' | 'E' | 'XYZE' = '';
  mode: 'translate' | 'rotate' | 'scale' = "translate";
  translationSnap = 0;
  rotationSnap = 0;
  scaleSnap = 0;
  space = "world";
  size = 1;
  dragging = false;
  showX = true;
  showY = true;
  showZ = true;
  //
  rotationAngle = 0;
  eye = new Vector3();
  //
  _gizmo: TransformControlsGizmo;
  constructor ( camera: PerspectiveCamera | OrthographicCamera, domElement: HTMLElement ) {
    super( camera, domElement );

    this.visible = false;
    this.camera = camera;
    this.domElement = domElement;

    /* eslint-disable @typescript-eslint/no-use-before-define */

    const _gizmo = this._gizmo = new TransformControlsGizmo();
    this.add( _gizmo );

    // Define properties with getters/setter
    // Setting the defined property will automatically trigger change event
    // Defined properties are passed down to gizmo and plane

    // Defined getter, setter and store for a property
    const defineProperty = ( propName: string, defaultValue: any ) => {
      let propValue = defaultValue;
      Object.defineProperty( this, propName, {
        get: () => {
          return propValue !== undefined ? propValue : defaultValue;
        },
        set: ( value ) => {
          if ( propValue !== value ) {
            propValue = value;
            _gizmo[ propName as 'type' ] = value;
            this.dispatchEvent( { type: propName + "-changed", value: value } );
            this.dispatchEvent( CHANGE_EVENT );
          }
        }
      } );
      this[ propName as 'type' ] = defaultValue;
      _gizmo[ propName as 'type' ] = defaultValue;
    }

    defineProperty( "camera", camera );
    defineProperty( "object", undefined );
    defineProperty( "enabled", true );
    defineProperty( "axis", '' );
    defineProperty( "mode", "translate" );
    defineProperty( "translationSnap", 0 );
    defineProperty( "rotationSnap", 0 );
    defineProperty( "scaleSnap", 0 );
    defineProperty( "space", "world" );
    defineProperty( "size", 1 );
    defineProperty( "dragging", false );
    defineProperty( "showX", true );
    defineProperty( "showY", true );
    defineProperty( "showZ", true );

    // TODO: remove properties unused in plane and gizmo

    defineProperty( "worldPosition", worldPosition );
    defineProperty( "worldPositionStart", worldPositionStart );
    defineProperty( "worldQuaternion", worldQuaternion );
    defineProperty( "worldQuaternionStart", worldQuaternionStart );
    defineProperty( "cameraPosition", cameraPosition );
    defineProperty( "cameraQuaternion", cameraQuaternion );
    defineProperty( "pointStart", pointStart );
    defineProperty( "pointEnd", pointEnd );
    defineProperty( "rotationAxis", rotationAxis );
    defineProperty( "rotationAngle", rotationAngle );
    defineProperty( "eye", eye );

  }
  // updateMatrixWorld  updates key transformation variables
  updateMatrixWorld() {
    if ( this.object !== undefined ) {
      this.object.updateMatrixWorld();
      if ( this.object.parent === null ) {
        console.error( 'TransformControls: The attached 3D object must be a part of the scene graph.' );
      } else {
        this.object.parent.matrixWorld.decompose( parentPosition, parentQuaternion, parentScale );
      }
      this.object.matrixWorld.decompose( worldPosition, worldQuaternion, worldScale );
      parentQuaternionInv.copy( parentQuaternion ).inverse();
      worldQuaternionInv.copy( worldQuaternion ).inverse();
    }
    this.camera.updateMatrixWorld();
    this.camera.matrixWorld.decompose( cameraPosition, cameraQuaternion, cameraScale );
    eye.copy( cameraPosition ).sub( worldPosition ).normalize();
    super.updateMatrixWorld();
  }

  // Object.defineProperty( this, 'view', {
  //   get: () => view.copy( this.canvas ).convertToViewSpace( this.domElement )
  // });
  // Object.defineProperty( this, 'planeX', {
  //   get: () => planeX.fromView( this.view, this._camera, unitX )
  // });
  // Object.defineProperty( this, 'planeY', {
  //   get: () => planeY.fromView( this.view, this._camera, unitY )
  // });
  // Object.defineProperty( this, 'planeZ', {
  //   get: () => planeZ.fromView( this.view, this._camera, unitZ )
  // });
  // Object.defineProperty( this, 'planeE', {
  //   get: () => planeE.fromView( this.view, this._camera, eye0.set( 0, 0, 1 ).applyQuaternion( this._camera.quaternion ).normalize() )
  // });
  // Object.defineProperty( this, 'planeNormalX', {
  //   get: () => planeNormalX.fromView( this.view, this._camera, eye0.set( 0, 0, 1 ).applyQuaternion( this._camera.quaternion ).normalize().cross( unitX ).cross( unitX ) )
  // });
  // Object.defineProperty( this, 'planeNormalY', {
  //   get: () => planeNormalY.fromView( this.view, this._camera, eye0.set( 0, 0, 1 ).applyQuaternion( this._camera.quaternion ).normalize().cross( unitY ).cross( unitY ) )
  // });
  // Object.defineProperty( this, 'planeNormalZ', {
  //   get: () => planeNormalZ.fromView( this.view, this._camera, eye0.set( 0, 0, 1 ).applyQuaternion( this._camera.quaternion ).normalize().cross( unitZ ).cross( unitZ ) )
  // });

  getPlaneNormal(): Vector3 {
    let space = this.space;
    if ( this.mode === 'scale' ) space = 'local'; // scale always oriented to local rotation
    unitX.set( 1, 0, 0 ).applyQuaternion( space === "local" ? this.worldQuaternion : identityQuaternion );
    unitY.set( 0, 1, 0 ).applyQuaternion( space === "local" ? this.worldQuaternion : identityQuaternion );
    unitZ.set( 0, 0, 1 ).applyQuaternion( space === "local" ? this.worldQuaternion : identityQuaternion );
    // Align the plane for current transform mode, axis and space.
    switch ( this.mode ) {
      case 'translate':
      case 'scale':
        switch ( this.axis ) {
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
    const intersect = getFirstIntersection(pointer.intersectObjects([this._gizmo.picker[ this.mode ]]), true);
    if ( intersect ) {
      this.axis = intersect.object.name as '';
    } else {
      this.axis = '';
    }
  }

  onTrackedPointerDown( pointer: Pointer ): void {
    // TODO: Unhack! This enables axis reset/interrupt when simulated pointer is driving gesture with inertia.
    this.axis = '';
    // TODO: consider triggering hover from Controls.js
    // Simulates hover before down on touchscreen
    this.onTrackedPointerHover( pointer );
    // TODO: Unhack! This enables axis reset/interrupt when simulated pointer is driving gesture with inertia.
    if ( this.axis === '' ) this.dragging = false;

    if ( this.object === undefined || this.dragging === true || pointer.button !== 0 ) return;
    this.domElement.style.touchAction = 'none'; // disable touch scroll
    if ( this.axis !== '' ) {
      // Plane
      const intersection = pointer.projectOnPlane(_tempVector.copy( this.worldPosition ), this.getPlaneNormal());
      if ( intersection ) { // TODO: handle intersection miss
        let space = this.space;
        if ( this.mode === 'scale' ) {
          space = 'local';
        } else if ( this.axis === 'E' || this.axis === 'XYZE' || this.axis === 'XYZ' ) {
          space = 'world';
        }
        if ( space === 'local' && this.mode === 'rotate' ) {
          const snap = this.rotationSnap;
          if ( this.axis === 'X' && snap ) this.object.rotation.x = Math.round( this.object.rotation.x / snap ) * snap
          if ( this.axis === 'Y' && snap ) this.object.rotation.y = Math.round( this.object.rotation.y / snap ) * snap
          if ( this.axis === 'Z' && snap ) this.object.rotation.z = Math.round( this.object.rotation.z / snap ) * snap;
        }
        this.object.updateMatrixWorld()
        if (this.object.parent) this.object.parent.updateMatrixWorld();
        positionStart.copy( this.object.position )
        quaternionStart.copy( this.object.quaternion )
        scaleStart.copy( this.object.scale );
        this.object.matrixWorld.decompose( worldPositionStart, worldQuaternionStart, worldScaleStart );
        pointStart.copy( intersection.current ).sub( worldPositionStart );
      }
      this.dragging = true
      mouseDownEvent.mode = this.mode
      this.dispatchEvent( mouseDownEvent );
      this.dispatchEvent( START_EVENT );
    }
  }

  onTrackedPointerMove( pointer: Pointer ): void {
    const axis = this.axis
    const mode = this.mode
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
    pointEnd.copy( intersection.current ).sub( worldPositionStart );
    if ( mode === 'translate' ) {
      // Apply translate
      offset.copy( pointEnd ).sub( pointStart );
      if ( space === 'local' && axis !== 'XYZ' ) {
        offset.applyQuaternion( worldQuaternionInv );
      }
      if ( axis.indexOf( 'X' ) === - 1 ) offset.x = 0
      if ( axis.indexOf( 'Y' ) === - 1 ) offset.y = 0
      if ( axis.indexOf( 'Z' ) === - 1 ) offset.z = 0;
      if ( space === 'local' && axis !== 'XYZ' ) {
        offset.applyQuaternion( quaternionStart ).divide( parentScale );
      } else {
        offset.applyQuaternion( parentQuaternionInv ).divide( parentScale );
      }
      object.position.copy( offset ).add( positionStart );
      // Apply translation snap
      if ( this.translationSnap ) {
        if ( space === 'local' ) {
          object.position.applyQuaternion( _tempQuaternion.copy( quaternionStart ).inverse() );
          if ( axis.search( 'X' ) !== - 1 ) {
            object.position.x = Math.round( object.position.x / this.translationSnap ) * this.translationSnap;
          }
          if ( axis.search( 'Y' ) !== - 1 ) {
            object.position.y = Math.round( object.position.y / this.translationSnap ) * this.translationSnap;
          }
          if ( axis.search( 'Z' ) !== - 1 ) {
            object.position.z = Math.round( object.position.z / this.translationSnap ) * this.translationSnap;
          }
          object.position.applyQuaternion( quaternionStart );
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
        _tempVector.applyQuaternion( worldQuaternionInv )
        _tempVector2.applyQuaternion( worldQuaternionInv );
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
      object.scale.copy( scaleStart ).multiply( _tempVector2 );
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
      const ROTATION_SPEED = 20 / worldPosition.distanceTo( _tempVector.setFromMatrixPosition( this.camera.matrixWorld ) );
      if ( axis === 'E' ) {
        rotationAxis.copy( eye )
        rotationAngle = pointEnd.angleTo( pointStart );
        startNorm.copy( pointStart ).normalize()
        endNorm.copy( pointEnd ).normalize();
        rotationAngle *= ( endNorm.cross( startNorm ).dot( eye ) < 0 ? 1 : - 1 );
      } else if ( axis === 'XYZE' ) {
        rotationAxis.copy( offset ).cross( eye ).normalize()
        rotationAngle = offset.dot( _tempVector.copy( rotationAxis ).cross( this.eye ) ) * ROTATION_SPEED;
      } else if ( axis === 'X' || axis === 'Y' || axis === 'Z' ) {
        rotationAxis.copy( _unit[ axis ] );
        _tempVector.copy( _unit[ axis ] );
        if ( space === 'local' ) {
          _tempVector.applyQuaternion( worldQuaternion );
        }
        rotationAngle = offset.dot( _tempVector.cross( eye ).normalize() ) * ROTATION_SPEED;
      }
      // Apply rotation snap
      if ( this.rotationSnap ) rotationAngle = Math.round( rotationAngle / this.rotationSnap ) * this.rotationSnap;
      this.rotationAngle = rotationAngle;
      // Apply rotat
      if ( space === 'local' && axis !== 'E' && axis !== 'XYZE' ) {
        object.quaternion.copy( quaternionStart )
        object.quaternion.multiply( _tempQuaternion.setFromAxisAngle( rotationAxis, rotationAngle ) ).normalize();
      } else {
        rotationAxis.applyQuaternion( parentQuaternionInv )
        object.quaternion.copy( _tempQuaternion.setFromAxisAngle( rotationAxis, rotationAngle ) )
        object.quaternion.multiply( quaternionStart ).normalize();
      }
    }
    this.dispatchEvent( CHANGE_EVENT )
    this.dispatchEvent( objectChangeEvent );
  }

  onTrackedPointerUp( pointer: Pointer ): void {
    if ( pointer.button !== 0 ) return;
    if ( this.dragging && ( this.axis !== '' ) ) {
      mouseUpEvent.mode = this.mode
      this.dispatchEvent( mouseUpEvent );
      this.dispatchEvent( END_EVENT );
    }
    this.domElement.style.touchAction = '';
    this.dragging = false
    this.axis = '';
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
    this.axis = '';
    return this;
  }
  // TODO: deprecate
  getMode(): string {
    return this.mode;
  }
  setMode( mode: "translate" | "rotate" | "scale" ) {
    this.mode = mode;
  }
  setTranslationSnap( translationSnap: number ) {
    this.translationSnap = translationSnap;
  }
  setRotationSnap( rotationSnap: number ) {
    this.rotationSnap = rotationSnap;
  }
  setScaleSnap( scaleSnap: number ) {
    this.scaleSnap = scaleSnap;
  }
  setSize( size: number ) {
    this.size = size;
  }
  setSpace( space: string ) {
    this.space = space;
  }
  update() {
    console.warn( 'THREE.TransformControls: update function has been deprecated.' );
  }

}

export { TransformControls, TransformControlsGizmo };
