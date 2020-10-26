import { BoxBufferGeometry, BufferGeometry, Color, CylinderBufferGeometry, DoubleSide, Euler, Float32BufferAttribute, Line, LineBasicMaterial, Matrix4,
 Mesh, MeshBasicMaterial, Object3D, OctahedronBufferGeometry, PlaneBufferGeometry, Quaternion, SphereBufferGeometry, TorusBufferGeometry, Vector3,
 PerspectiveCamera, OrthographicCamera, Intersection
} from "../../../three";

import { ControlsMixin, Pointer, CHANGE_EVENT, START_EVENT, END_EVENT } from "./Controls.js";

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
  _plane: TransformControlsPlane;
  constructor ( camera: PerspectiveCamera | OrthographicCamera, domElement: HTMLElement ) {
    super( camera, domElement );

    this.visible = false;
    this.camera = camera;
    this.domElement = domElement;

    const _gizmo = this._gizmo = new TransformControlsGizmo();
    this.add( _gizmo );

    const _plane = this._plane = new TransformControlsPlane();
    this.add( _plane );

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
            _plane[ propName as 'type' ] = value;
            _gizmo[ propName as 'type' ] = value;
            this.dispatchEvent( { type: propName + "-changed", value: value } );
            this.dispatchEvent( CHANGE_EVENT );
          }
        }
      } );
      this[ propName as 'type' ] = defaultValue;
      _plane[ propName as 'type' ] = defaultValue;
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
      const planeIntersect = getFirstIntersection(pointer.intersectObjects([this._plane]), true);
      if ( planeIntersect ) {
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
        pointStart.copy( planeIntersect.point ).sub( worldPositionStart );
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
    const planeIntersect = getFirstIntersection(pointer.intersectObjects([this._plane]), true);
    if ( ! planeIntersect ) return;
    pointEnd.copy( planeIntersect.point ).sub( worldPositionStart );
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
    console.warn( 'THREE.TransformControls: update function has no more functionality and therefore has been deprecated.' );
  }

}


class TransformControlsGizmo extends Object3D {
  type = 'TransformControlsGizmo';
  isTransformControlsGizmo = true;
  gizmo = {
    translate: new Object3D,
    rotate: new Object3D,
    scale: new Object3D,
  };
  picker = {
    translate: new Object3D,
    rotate: new Object3D,
    scale: new Object3D,
  };
  helper = {
    translate: new Object3D,
    rotate: new Object3D,
    scale: new Object3D,
  };
  camera?: PerspectiveCamera | OrthographicCamera;
  //
  object?: Object3D;
  enabled = true;
  axis: 'X' | 'Y' | 'Z' | 'XY' | 'YZ' | 'XZ' | 'XYZ' | 'XYZE' | 'E' = 'XYZ';
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
  rotationAxis = new Vector3();
  worldPosition = new Vector3();
  worldPositionStart = new Vector3();
  cameraPosition = new Vector3();
  eye = new Vector3();
  worldQuaternion = new Quaternion();
  worldQuaternionStart = new Quaternion();
  cameraQuaternion = new Quaternion();
  //
  constructor() {
    super();

    // shared materials

    const gizmoMaterial = new MeshBasicMaterial( {
      depthTest: false,
      depthWrite: false,
      transparent: true,
      side: DoubleSide,
      fog: false,
      toneMapped: false
    } );

    const gizmoLineMaterial = new LineBasicMaterial( {
      depthTest: false,
      depthWrite: false,
      transparent: true,
      linewidth: 1,
      fog: false,
      toneMapped: false
    } );

    // Make unique material for each axis/color

    const matInvisible = gizmoMaterial.clone();
    matInvisible.opacity = 0.15;

    const matHelper = gizmoMaterial.clone();
    matHelper.opacity = 0.33;

    const matRed = gizmoMaterial.clone();
    matRed.color.set( 0xff0000 );

    const matGreen = gizmoMaterial.clone();
    matGreen.color.set( 0x00ff00 );

    const matBlue = gizmoMaterial.clone();
    matBlue.color.set( 0x0000ff );

    const matWhiteTransparent = gizmoMaterial.clone();
    matWhiteTransparent.opacity = 0.25;

    const matYellowTransparent = matWhiteTransparent.clone();
    matYellowTransparent.color.set( 0xffff00 );

    const matCyanTransparent = matWhiteTransparent.clone();
    matCyanTransparent.color.set( 0x00ffff );

    const matMagentaTransparent = matWhiteTransparent.clone();
    matMagentaTransparent.color.set( 0xff00ff );

    const matYellow = gizmoMaterial.clone();
    matYellow.color.set( 0xffff00 );

    const matLineRed = gizmoLineMaterial.clone();
    matLineRed.color.set( 0xff0000 );

    const matLineGreen = gizmoLineMaterial.clone();
    matLineGreen.color.set( 0x00ff00 );

    const matLineBlue = gizmoLineMaterial.clone();
    matLineBlue.color.set( 0x0000ff );

    const matLineCyan = gizmoLineMaterial.clone();
    matLineCyan.color.set( 0x00ffff );

    const matLineMagenta = gizmoLineMaterial.clone();
    matLineMagenta.color.set( 0xff00ff );

    const matLineYellow = gizmoLineMaterial.clone();
    matLineYellow.color.set( 0xffff00 );

    const matLineGray = gizmoLineMaterial.clone();
    matLineGray.color.set( 0x787878 );

    const matLineYellowTransparent = matLineYellow.clone();
    matLineYellowTransparent.opacity = 0.25;

    // reusable geometry

    const arrowGeometry = new CylinderBufferGeometry( 0, 0.05, 0.2, 12, 1, false );
    const scaleHandleGeometry = new BoxBufferGeometry( 0.125, 0.125, 0.125 );

    const lineGeometry = new BufferGeometry();
    lineGeometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0,  1, 0, 0 ], 3 ) );

    const CircleGeometry = function ( radius: number, arc: number ) {

      const geometry = new BufferGeometry( );
      const vertices = [];

      for ( let i = 0; i <= 64 * arc; ++ i ) {

        vertices.push( 0, Math.cos( i / 32 * Math.PI ) * radius, Math.sin( i / 32 * Math.PI ) * radius );

      }

      geometry.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );

      return geometry;

    };

    // Special geometry for transform helper. If scaled with position vector it spans from [0,0,0] to position

    const TranslateHelperGeometry = function () {

      const geometry = new BufferGeometry();

      geometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 1, 1, 1 ], 3 ) );

      return geometry;

    };

    // Gizmo definitions - custom hierarchy definitions for setupGizmo() function
    const gizmoTranslate = {
      X: [
        [ new Mesh( arrowGeometry, matRed ), [ 1, 0, 0 ], [ 0, 0, - Math.PI / 2 ], null, 'fwd' ],
        [ new Mesh( arrowGeometry, matRed ), [ 1, 0, 0 ], [ 0, 0, Math.PI / 2 ], null, 'bwd' ],
        [ new Line( lineGeometry, matLineRed ) ]
      ],
      Y: [
        [ new Mesh( arrowGeometry, matGreen ), [ 0, 1, 0 ], null, null, 'fwd' ],
        [ new Mesh( arrowGeometry, matGreen ), [ 0, 1, 0 ], [ Math.PI, 0, 0 ], null, 'bwd' ],
        [ new Line( lineGeometry, matLineGreen ), null, [ 0, 0, Math.PI / 2 ]]
      ],
      Z: [
        [ new Mesh( arrowGeometry, matBlue ), [ 0, 0, 1 ], [ Math.PI / 2, 0, 0 ], null, 'fwd' ],
        [ new Mesh( arrowGeometry, matBlue ), [ 0, 0, 1 ], [ - Math.PI / 2, 0, 0 ], null, 'bwd' ],
        [ new Line( lineGeometry, matLineBlue ), null, [ 0, - Math.PI / 2, 0 ]]
      ],
      XYZ: [
        [ new Mesh( new OctahedronBufferGeometry( 0.1, 0 ), matWhiteTransparent.clone() ), [ 0, 0, 0 ], [ 0, 0, 0 ]]
      ],
      XY: [
        [ new Mesh( new PlaneBufferGeometry( 0.295, 0.295 ), matYellowTransparent.clone() ), [ 0.15, 0.15, 0 ]],
        [ new Line( lineGeometry, matLineYellow ), [ 0.18, 0.3, 0 ], null, [ 0.125, 1, 1 ]],
        [ new Line( lineGeometry, matLineYellow ), [ 0.3, 0.18, 0 ], [ 0, 0, Math.PI / 2 ], [ 0.125, 1, 1 ]]
      ],
      YZ: [
        [ new Mesh( new PlaneBufferGeometry( 0.295, 0.295 ), matCyanTransparent.clone() ), [ 0, 0.15, 0.15 ], [ 0, Math.PI / 2, 0 ]],
        [ new Line( lineGeometry, matLineCyan ), [ 0, 0.18, 0.3 ], [ 0, 0, Math.PI / 2 ], [ 0.125, 1, 1 ]],
        [ new Line( lineGeometry, matLineCyan ), [ 0, 0.3, 0.18 ], [ 0, - Math.PI / 2, 0 ], [ 0.125, 1, 1 ]]
      ],
      XZ: [
        [ new Mesh( new PlaneBufferGeometry( 0.295, 0.295 ), matMagentaTransparent.clone() ), [ 0.15, 0, 0.15 ], [ - Math.PI / 2, 0, 0 ]],
        [ new Line( lineGeometry, matLineMagenta ), [ 0.18, 0, 0.3 ], null, [ 0.125, 1, 1 ]],
        [ new Line( lineGeometry, matLineMagenta ), [ 0.3, 0, 0.18 ], [ 0, - Math.PI / 2, 0 ], [ 0.125, 1, 1 ]]
      ]
    };
    const pickerTranslate = {
      X: [
        [ new Mesh( new CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), matInvisible ), [ 0.6, 0, 0 ], [ 0, 0, - Math.PI / 2 ]]
      ],
      Y: [
        [ new Mesh( new CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), matInvisible ), [ 0, 0.6, 0 ]]
      ],
      Z: [
        [ new Mesh( new CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), matInvisible ), [ 0, 0, 0.6 ], [ Math.PI / 2, 0, 0 ]]
      ],
      XYZ: [
        [ new Mesh( new OctahedronBufferGeometry( 0.2, 0 ), matInvisible ) ]
      ],
      XY: [
        [ new Mesh( new PlaneBufferGeometry( 0.4, 0.4 ), matInvisible ), [ 0.2, 0.2, 0 ]]
      ],
      YZ: [
        [ new Mesh( new PlaneBufferGeometry( 0.4, 0.4 ), matInvisible ), [ 0, 0.2, 0.2 ], [ 0, Math.PI / 2, 0 ]]
      ],
      XZ: [
        [ new Mesh( new PlaneBufferGeometry( 0.4, 0.4 ), matInvisible ), [ 0.2, 0, 0.2 ], [ - Math.PI / 2, 0, 0 ]]
      ]
    };
    const helperTranslate = {
      START: [
        [ new Mesh( new OctahedronBufferGeometry( 0.01, 2 ), matHelper ), null, null, null, 'helper' ]
      ],
      END: [
        [ new Mesh( new OctahedronBufferGeometry( 0.01, 2 ), matHelper ), null, null, null, 'helper' ]
      ],
      DELTA: [
        [ new Line( TranslateHelperGeometry(), matHelper ), null, null, null, 'helper' ]
      ],
      X: [
        [ new Line( lineGeometry, matHelper.clone() ), [ - 1e3, 0, 0 ], null, [ 1e6, 1, 1 ], 'helper' ]
      ],
      Y: [
        [ new Line( lineGeometry, matHelper.clone() ), [ 0, - 1e3, 0 ], [ 0, 0, Math.PI / 2 ], [ 1e6, 1, 1 ], 'helper' ]
      ],
      Z: [
        [ new Line( lineGeometry, matHelper.clone() ), [ 0, 0, - 1e3 ], [ 0, - Math.PI / 2, 0 ], [ 1e6, 1, 1 ], 'helper' ]
      ]
    };
    const gizmoRotate = {
      X: [
        [ new Line( CircleGeometry( 1, 0.5 ), matLineRed ) ],
        [ new Mesh( new OctahedronBufferGeometry( 0.04, 0 ), matRed ), [ 0, 0, 0.99 ], null, [ 1, 3, 1 ]],
      ],
      Y: [
        [ new Line( CircleGeometry( 1, 0.5 ), matLineGreen ), null, [ 0, 0, - Math.PI / 2 ]],
        [ new Mesh( new OctahedronBufferGeometry( 0.04, 0 ), matGreen ), [ 0, 0, 0.99 ], null, [ 3, 1, 1 ]],
      ],
      Z: [
        [ new Line( CircleGeometry( 1, 0.5 ), matLineBlue ), null, [ 0, Math.PI / 2, 0 ]],
        [ new Mesh( new OctahedronBufferGeometry( 0.04, 0 ), matBlue ), [ 0.99, 0, 0 ], null, [ 1, 3, 1 ]],
      ],
      E: [
        [ new Line( CircleGeometry( 1.25, 1 ), matLineYellowTransparent ), null, [ 0, Math.PI / 2, 0 ]],
        [ new Mesh( new CylinderBufferGeometry( 0.03, 0, 0.15, 4, 1, false ), matLineYellowTransparent ), [ 1.17, 0, 0 ], [ 0, 0, - Math.PI / 2 ], [ 1, 1, 0.001 ]],
        [ new Mesh( new CylinderBufferGeometry( 0.03, 0, 0.15, 4, 1, false ), matLineYellowTransparent ), [ - 1.17, 0, 0 ], [ 0, 0, Math.PI / 2 ], [ 1, 1, 0.001 ]],
        [ new Mesh( new CylinderBufferGeometry( 0.03, 0, 0.15, 4, 1, false ), matLineYellowTransparent ), [ 0, - 1.17, 0 ], [ Math.PI, 0, 0 ], [ 1, 1, 0.001 ]],
        [ new Mesh( new CylinderBufferGeometry( 0.03, 0, 0.15, 4, 1, false ), matLineYellowTransparent ), [ 0, 1.17, 0 ], [ 0, 0, 0 ], [ 1, 1, 0.001 ]],
      ],
      XYZE: [
        [ new Line( CircleGeometry( 1, 1 ), matLineGray ), null, [ 0, Math.PI / 2, 0 ]]
      ]
    };
    const helperRotate = {
      AXIS: [
        [ new Line( lineGeometry, matHelper.clone() ), [ - 1e3, 0, 0 ], null, [ 1e6, 1, 1 ], 'helper' ]
      ]
    };
    const pickerRotate = {
      X: [
        [ new Mesh( new TorusBufferGeometry( 1, 0.1, 4, 24 ), matInvisible ), [ 0, 0, 0 ], [ 0, - Math.PI / 2, - Math.PI / 2 ]],
      ],
      Y: [
        [ new Mesh( new TorusBufferGeometry( 1, 0.1, 4, 24 ), matInvisible ), [ 0, 0, 0 ], [ Math.PI / 2, 0, 0 ]],
      ],
      Z: [
        [ new Mesh( new TorusBufferGeometry( 1, 0.1, 4, 24 ), matInvisible ), [ 0, 0, 0 ], [ 0, 0, - Math.PI / 2 ]],
      ],
      E: [
        [ new Mesh( new TorusBufferGeometry( 1.25, 0.1, 2, 24 ), matInvisible ) ]
      ],
      XYZE: [
        [ new Mesh( new SphereBufferGeometry( 0.7, 10, 8 ), matInvisible ) ]
      ]
    };
    const gizmoScale = {
      X: [
        [ new Mesh( scaleHandleGeometry, matRed ), [ 0.8, 0, 0 ], [ 0, 0, - Math.PI / 2 ]],
        [ new Line( lineGeometry, matLineRed ), null, null, [ 0.8, 1, 1 ]]
      ],
      Y: [
        [ new Mesh( scaleHandleGeometry, matGreen ), [ 0, 0.8, 0 ]],
        [ new Line( lineGeometry, matLineGreen ), null, [ 0, 0, Math.PI / 2 ], [ 0.8, 1, 1 ]]
      ],
      Z: [
        [ new Mesh( scaleHandleGeometry, matBlue ), [ 0, 0, 0.8 ], [ Math.PI / 2, 0, 0 ]],
        [ new Line( lineGeometry, matLineBlue ), null, [ 0, - Math.PI / 2, 0 ], [ 0.8, 1, 1 ]]
      ],
      XY: [
        [ new Mesh( scaleHandleGeometry, matYellowTransparent ), [ 0.85, 0.85, 0 ], null, [ 2, 2, 0.2 ]],
        [ new Line( lineGeometry, matLineYellow ), [ 0.855, 0.98, 0 ], null, [ 0.125, 1, 1 ]],
        [ new Line( lineGeometry, matLineYellow ), [ 0.98, 0.855, 0 ], [ 0, 0, Math.PI / 2 ], [ 0.125, 1, 1 ]]
      ],
      YZ: [
        [ new Mesh( scaleHandleGeometry, matCyanTransparent ), [ 0, 0.85, 0.85 ], null, [ 0.2, 2, 2 ]],
        [ new Line( lineGeometry, matLineCyan ), [ 0, 0.855, 0.98 ], [ 0, 0, Math.PI / 2 ], [ 0.125, 1, 1 ]],
        [ new Line( lineGeometry, matLineCyan ), [ 0, 0.98, 0.855 ], [ 0, - Math.PI / 2, 0 ], [ 0.125, 1, 1 ]]
      ],
      XZ: [
        [ new Mesh( scaleHandleGeometry, matMagentaTransparent ), [ 0.85, 0, 0.85 ], null, [ 2, 0.2, 2 ]],
        [ new Line( lineGeometry, matLineMagenta ), [ 0.855, 0, 0.98 ], null, [ 0.125, 1, 1 ]],
        [ new Line( lineGeometry, matLineMagenta ), [ 0.98, 0, 0.855 ], [ 0, - Math.PI / 2, 0 ], [ 0.125, 1, 1 ]]
      ],
      XYZX: [
        [ new Mesh( new BoxBufferGeometry( 0.125, 0.125, 0.125 ), matWhiteTransparent.clone() ), [ 1.1, 0, 0 ]],
      ],
      XYZY: [
        [ new Mesh( new BoxBufferGeometry( 0.125, 0.125, 0.125 ), matWhiteTransparent.clone() ), [ 0, 1.1, 0 ]],
      ],
      XYZZ: [
        [ new Mesh( new BoxBufferGeometry( 0.125, 0.125, 0.125 ), matWhiteTransparent.clone() ), [ 0, 0, 1.1 ]],
      ]
    };
    const pickerScale = {
      X: [
        [ new Mesh( new CylinderBufferGeometry( 0.2, 0, 0.8, 4, 1, false ), matInvisible ), [ 0.5, 0, 0 ], [ 0, 0, - Math.PI / 2 ]]
      ],
      Y: [
        [ new Mesh( new CylinderBufferGeometry( 0.2, 0, 0.8, 4, 1, false ), matInvisible ), [ 0, 0.5, 0 ]]
      ],
      Z: [
        [ new Mesh( new CylinderBufferGeometry( 0.2, 0, 0.8, 4, 1, false ), matInvisible ), [ 0, 0, 0.5 ], [ Math.PI / 2, 0, 0 ]]
      ],
      XY: [
        [ new Mesh( scaleHandleGeometry, matInvisible ), [ 0.85, 0.85, 0 ], null, [ 3, 3, 0.2 ]],
      ],
      YZ: [
        [ new Mesh( scaleHandleGeometry, matInvisible ), [ 0, 0.85, 0.85 ], null, [ 0.2, 3, 3 ]],
      ],
      XZ: [
        [ new Mesh( scaleHandleGeometry, matInvisible ), [ 0.85, 0, 0.85 ], null, [ 3, 0.2, 3 ]],
      ],
      XYZX: [
        [ new Mesh( new BoxBufferGeometry( 0.2, 0.2, 0.2 ), matInvisible ), [ 1.1, 0, 0 ]],
      ],
      XYZY: [
        [ new Mesh( new BoxBufferGeometry( 0.2, 0.2, 0.2 ), matInvisible ), [ 0, 1.1, 0 ]],
      ],
      XYZZ: [
        [ new Mesh( new BoxBufferGeometry( 0.2, 0.2, 0.2 ), matInvisible ), [ 0, 0, 1.1 ]],
      ]
    };
    const helperScale = {
      X: [
        [ new Line( lineGeometry, matHelper.clone() ), [ - 1e3, 0, 0 ], null, [ 1e6, 1, 1 ], 'helper' ]
      ],
      Y: [
        [ new Line( lineGeometry, matHelper.clone() ), [ 0, - 1e3, 0 ], [ 0, 0, Math.PI / 2 ], [ 1e6, 1, 1 ], 'helper' ]
      ],
      Z: [
        [ new Line( lineGeometry, matHelper.clone() ), [ 0, 0, - 1e3 ], [ 0, - Math.PI / 2, 0 ], [ 1e6, 1, 1 ], 'helper' ]
      ]
    };
    // Creates an Object3D with gizmos described in custom hierarchy definition.
    const setupGizmo = function ( gizmoMap: Record<string, any> ): Object3D {
      const gizmo = new Object3D();
      for ( const name in gizmoMap ) {
        for ( let i = gizmoMap[ name ].length; i --; ) {

          const object = gizmoMap[ name ][ i ][ 0 ].clone();
          const position = gizmoMap[ name ][ i ][ 1 ];
          const rotation = gizmoMap[ name ][ i ][ 2 ];
          const scale = gizmoMap[ name ][ i ][ 3 ];
          const tag = gizmoMap[ name ][ i ][ 4 ];

          // name and tag properties are essential for picking and updating logic.
          object.name = name;
          object.userData = { tag: tag };
          if ( position ) {
            object.position.set( position[ 0 ], position[ 1 ], position[ 2 ] );
          }
          if ( rotation ) {
            object.rotation.set( rotation[ 0 ], rotation[ 1 ], rotation[ 2 ] );
          }
          if ( scale ) {
            object.scale.set( scale[ 0 ], scale[ 1 ], scale[ 2 ] );
          }

          object.updateMatrix();

          const tempGeometry = object.geometry.clone();
          tempGeometry.applyMatrix4( object.matrix );
          object.geometry = tempGeometry;
          object.renderOrder = Infinity;

          object.position.set( 0, 0, 0 );
          object.rotation.set( 0, 0, 0 );
          object.scale.set( 1, 1, 1 );

          gizmo.add( object );
        }
      }
      return gizmo;
    };

    // Reusable utility variables
    const tempVector = new Vector3( 0, 0, 0 );
    const tempEuler = new Euler();
    const alignVector = new Vector3( 0, 1, 0 );
    const zeroVector = new Vector3( 0, 0, 0 );
    const lookAtMatrix = new Matrix4();
    const tempQuaternion = new Quaternion();
    const tempQuaternion2 = new Quaternion();
    const identityQuaternion = new Quaternion();

    const unitX = new Vector3( 1, 0, 0 );
    const unitY = new Vector3( 0, 1, 0 );
    const unitZ = new Vector3( 0, 0, 1 );

    // Gizmo creation
    this.add( this.gizmo[ "translate" ] = setupGizmo( gizmoTranslate ) );
    this.add( this.gizmo[ "rotate" ] = setupGizmo( gizmoRotate ) );
    this.add( this.gizmo[ "scale" ] = setupGizmo( gizmoScale ) );
    this.add( this.picker[ "translate" ] = setupGizmo( pickerTranslate ) );
    this.add( this.picker[ "rotate" ] = setupGizmo( pickerRotate ) );
    this.add( this.picker[ "scale" ] = setupGizmo( pickerScale ) );
    this.add( this.helper[ "translate" ] = setupGizmo( helperTranslate ) );
    this.add( this.helper[ "rotate" ] = setupGizmo( helperRotate ) );
    this.add( this.helper[ "scale" ] = setupGizmo( helperScale ) );

    // Pickers should be hidden always

    this.picker[ "translate" ].visible = false;
    this.picker[ "rotate" ].visible = false;
    this.picker[ "scale" ].visible = false;

    // updateMatrixWorld will update transformations and appearance of individual handles
    this.updateMatrixWorld = function () {
      let space = this.space;
      if ( this.mode === 'scale' ) space = 'local'; // scale always oriented to local rotation
      const quaternion = space === "local" ? this.worldQuaternion : identityQuaternion;
      // Show only gizmos for current transform mode
      this.gizmo[ "translate" ].visible = this.mode === "translate";
      this.gizmo[ "rotate" ].visible = this.mode === "rotate";
      this.gizmo[ "scale" ].visible = this.mode === "scale";
      this.helper[ "translate" ].visible = this.mode === "translate";
      this.helper[ "rotate" ].visible = this.mode === "rotate";
      this.helper[ "scale" ].visible = this.mode === "scale";

      let handles: Object3D[] = [];
      handles = handles.concat( this.picker[ this.mode ].children );
      handles = handles.concat( this.gizmo[ this.mode ].children );
      handles = handles.concat( this.helper[ this.mode ].children );

      for ( let i = 0; i < handles.length; i ++ ) {
        const handle = handles[ i ] as Mesh;
        // hide aligned to camera
        handle.visible = true;
        handle.rotation.set( 0, 0, 0 );
        handle.position.copy( this.worldPosition );
        let factor = 1;
        if (this.camera) {
          if ( this.camera instanceof OrthographicCamera ) {
            factor = ( this.camera.top - this.camera.bottom ) / this.camera.zoom;
          } else {
            factor = this.worldPosition.distanceTo( this.cameraPosition ) * Math.min( 1.9 * Math.tan( Math.PI * this.camera.fov / 360 ) / this.camera.zoom, 7 );
          }
        }
        handle.scale.set( 1, 1, 1 ).multiplyScalar( factor * this.size / 7 );
        // TODO: simplify helpers and consider decoupling from gizmo
        if ( handle.userData.tag === 'helper' ) {
          handle.visible = false;
          if ( handle.name === 'AXIS' ) {
            handle.position.copy( this.worldPositionStart );
            handle.visible = !! this.axis;
            if ( this.axis === 'X' ) {
              tempQuaternion.setFromEuler( tempEuler.set( 0, 0, 0 ) );
              handle.quaternion.copy( quaternion ).multiply( tempQuaternion );
              if ( Math.abs( alignVector.copy( unitX ).applyQuaternion( quaternion ).dot( this.eye ) ) > 0.9 ) {
                handle.visible = false;
              }
            }
            if ( this.axis === 'Y' ) {
              tempQuaternion.setFromEuler( tempEuler.set( 0, 0, Math.PI / 2 ) );
              handle.quaternion.copy( quaternion ).multiply( tempQuaternion );
              if ( Math.abs( alignVector.copy( unitY ).applyQuaternion( quaternion ).dot( this.eye ) ) > 0.9 ) {
                handle.visible = false;
              }
            }
            if ( this.axis === 'Z' ) {
              tempQuaternion.setFromEuler( tempEuler.set( 0, Math.PI / 2, 0 ) );
              handle.quaternion.copy( quaternion ).multiply( tempQuaternion );
              if ( Math.abs( alignVector.copy( unitZ ).applyQuaternion( quaternion ).dot( this.eye ) ) > 0.9 ) {
                handle.visible = false;
              }
            }
            if ( this.axis === 'XYZE' ) {
              tempQuaternion.setFromEuler( tempEuler.set( 0, Math.PI / 2, 0 ) );
              alignVector.copy( this.rotationAxis );
              handle.quaternion.setFromRotationMatrix( lookAtMatrix.lookAt( zeroVector, alignVector, unitY ) );
              handle.quaternion.multiply( tempQuaternion );
              handle.visible = this.dragging;
            }
            if ( this.axis === 'E' ) {
              handle.visible = false;
            }
          } else if ( handle.name === 'START' ) {
            handle.position.copy( this.worldPositionStart );
            handle.visible = this.dragging;
          } else if ( handle.name === 'END' ) {
            handle.position.copy( this.worldPosition );
            handle.visible = this.dragging;
          } else if ( handle.name === 'DELTA' ) {
            handle.position.copy( this.worldPositionStart );
            handle.quaternion.copy( this.worldQuaternionStart );
            tempVector.set( 1e-10, 1e-10, 1e-10 ).add( this.worldPositionStart ).sub( this.worldPosition ).multiplyScalar( - 1 );
            tempVector.applyQuaternion( this.worldQuaternionStart.clone().inverse() );
            handle.scale.copy( tempVector );
            handle.visible = this.dragging;
          } else {
            handle.quaternion.copy( quaternion );
            if ( this.dragging ) {
              handle.position.copy( this.worldPositionStart );
            } else {
              handle.position.copy( this.worldPosition );
            }
            if ( this.axis ) {
              handle.visible = this.axis.search( handle.name ) !== - 1;
            }
          }
          // If updating helper, skip rest of the loop
          continue;
        }
        // Align handles to current local or world rotation
        handle.quaternion.copy( quaternion );
        if ( this.mode === 'translate' || this.mode === 'scale' ) {
          // Hide translate and scale axis facing the camera
          const AXIS_HIDE_TRESHOLD = 0.99;
          const PLANE_HIDE_TRESHOLD = 0.2;
          const AXIS_FLIP_TRESHOLD = 0.0;
          if ( handle.name === 'X' || handle.name === 'XYZX' ) {
            if ( Math.abs( alignVector.copy( unitX ).applyQuaternion( quaternion ).dot( this.eye ) ) > AXIS_HIDE_TRESHOLD ) {
              handle.scale.set( 1e-10, 1e-10, 1e-10 );
              handle.visible = false;
            }
          }
          if ( handle.name === 'Y' || handle.name === 'XYZY' ) {
            if ( Math.abs( alignVector.copy( unitY ).applyQuaternion( quaternion ).dot( this.eye ) ) > AXIS_HIDE_TRESHOLD ) {
              handle.scale.set( 1e-10, 1e-10, 1e-10 );
              handle.visible = false;
            }
          }
          if ( handle.name === 'Z' || handle.name === 'XYZZ' ) {
            if ( Math.abs( alignVector.copy( unitZ ).applyQuaternion( quaternion ).dot( this.eye ) ) > AXIS_HIDE_TRESHOLD ) {
              handle.scale.set( 1e-10, 1e-10, 1e-10 );
              handle.visible = false;
            }
          }
          if ( handle.name === 'XY' ) {
            if ( Math.abs( alignVector.copy( unitZ ).applyQuaternion( quaternion ).dot( this.eye ) ) < PLANE_HIDE_TRESHOLD ) {
              handle.scale.set( 1e-10, 1e-10, 1e-10 );
              handle.visible = false;
            }
          }
          if ( handle.name === 'YZ' ) {
            if ( Math.abs( alignVector.copy( unitX ).applyQuaternion( quaternion ).dot( this.eye ) ) < PLANE_HIDE_TRESHOLD ) {
              handle.scale.set( 1e-10, 1e-10, 1e-10 );
              handle.visible = false;
            }
          }
          if ( handle.name === 'XZ' ) {
            if ( Math.abs( alignVector.copy( unitY ).applyQuaternion( quaternion ).dot( this.eye ) ) < PLANE_HIDE_TRESHOLD ) {
              handle.scale.set( 1e-10, 1e-10, 1e-10 );
              handle.visible = false;
            }
          }
          // Flip translate and scale axis ocluded behind another axis
          if ( handle.name.search( 'X' ) !== - 1 ) {
            if ( alignVector.copy( unitX ).applyQuaternion( quaternion ).dot( this.eye ) < AXIS_FLIP_TRESHOLD ) {
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
            if ( alignVector.copy( unitY ).applyQuaternion( quaternion ).dot( this.eye ) < AXIS_FLIP_TRESHOLD ) {
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
            if ( alignVector.copy( unitZ ).applyQuaternion( quaternion ).dot( this.eye ) < AXIS_FLIP_TRESHOLD ) {
              if ( handle.userData.tag === 'fwd' ) {
                handle.visible = false;
              } else {
                handle.scale.z *= - 1;
              }
            } else if ( handle.userData.tag === 'bwd' ) {
              handle.visible = false;
            }
          }
        } else if ( this.mode === 'rotate' ) {
          // Align handles to current local or world rotation
          tempQuaternion2.copy( quaternion );
          alignVector.copy( this.eye ).applyQuaternion( tempQuaternion.copy( quaternion ).inverse() );
          if ( handle.name.search( "E" ) !== - 1 ) {
            handle.quaternion.setFromRotationMatrix( lookAtMatrix.lookAt( this.eye, zeroVector, unitY ) );
          }
          if ( handle.name === 'X' ) {
            tempQuaternion.setFromAxisAngle( unitX, Math.atan2( - alignVector.y, alignVector.z ) );
            tempQuaternion.multiplyQuaternions( tempQuaternion2, tempQuaternion );
            handle.quaternion.copy( tempQuaternion );
          }
          if ( handle.name === 'Y' ) {
            tempQuaternion.setFromAxisAngle( unitY, Math.atan2( alignVector.x, alignVector.z ) );
            tempQuaternion.multiplyQuaternions( tempQuaternion2, tempQuaternion );
            handle.quaternion.copy( tempQuaternion );
          }
          if ( handle.name === 'Z' ) {
            tempQuaternion.setFromAxisAngle( unitZ, Math.atan2( alignVector.y, alignVector.x ) );
            tempQuaternion.multiplyQuaternions( tempQuaternion2, tempQuaternion );
            handle.quaternion.copy( tempQuaternion );
          }
        }

        // Hide disabled axes
        handle.visible = handle.visible && ( handle.name.indexOf( "X" ) === - 1 || this.showX );
        handle.visible = handle.visible && ( handle.name.indexOf( "Y" ) === - 1 || this.showY );
        handle.visible = handle.visible && ( handle.name.indexOf( "Z" ) === - 1 || this.showZ );
        handle.visible = handle.visible && ( handle.name.indexOf( "E" ) === - 1 || ( this.showX && this.showY && this.showZ ) );

        // highlight selected axis
        const material = handle.material as MeshBasicMaterial;
        
        material.userData.opacity = material.userData.opacity || material.opacity;
        material.userData.color = material.userData.color || material.color.clone();

        material.color.copy( material.userData.color );
        material.opacity = material.userData.opacity;
        if ( ! this.enabled ) {
          material.opacity *= 0.5;
          material.color.lerp( new Color( 1, 1, 1 ), 0.5 );
        } else if ( this.axis ) {
          if ( handle.name === this.axis ) {
            material.opacity = 1.0;
            material.color.lerp( new Color( 1, 1, 1 ), 0.5 );
          } else if ( this.axis.split( '' ).some( function ( a ) {
            return handle.name === a;
          } ) ) {
            material.opacity = 1.0;
            material.color.lerp( new Color( 1, 1, 1 ), 0.5 );
          } else {
            material.opacity *= 0.25;
            material.color.lerp( new Color( 1, 1, 1 ), 0.5 );
          }
        }
      }
      Object3D.prototype.updateMatrixWorld.call( this );
    }
  }
}

const unitX = new Vector3( 1, 0, 0 );
const unitY = new Vector3( 0, 1, 0 );
const unitZ = new Vector3( 0, 0, 1 );
const tempVector = new Vector3();
const dirVector = new Vector3();
const alignVector = new Vector3();
const tempMatrix = new Matrix4();
const identityQuaternion = new Quaternion();

class TransformControlsPlane extends Mesh {
  type = 'TransformControlsPlane';
  isTransformControlsPlane = true;
  //
  object?: Object3D;
  enabled = true;
  axis: '' | 'X' | 'Y' | 'Z' | 'XY' | 'YZ' | 'XZ' | 'XYZ' | 'E' = '';
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
  worldPosition = new Vector3();
  eye = new Vector3();
  worldQuaternion = new Quaternion();
  cameraQuaternion = new Quaternion();
  //
  constructor() {
    super(
      new PlaneBufferGeometry( 100000, 100000, 2, 2 ),
      new MeshBasicMaterial( { visible: false, wireframe: true, side: DoubleSide, transparent: true, opacity: 0.1, toneMapped: false } )
    )
  }
  updateMatrixWorld() {
    let space = this.space;
    this.position.copy( this.worldPosition );
    if ( this.mode === 'scale' ) space = 'local'; // scale always oriented to local rotation
    unitX.set( 1, 0, 0 ).applyQuaternion( space === "local" ? this.worldQuaternion : identityQuaternion );
    unitY.set( 0, 1, 0 ).applyQuaternion( space === "local" ? this.worldQuaternion : identityQuaternion );
    unitZ.set( 0, 0, 1 ).applyQuaternion( space === "local" ? this.worldQuaternion : identityQuaternion );
    // Align the plane for current transform mode, axis and space.
    alignVector.copy( unitY );
    switch ( this.mode ) {
      case 'translate':
      case 'scale':
        switch ( this.axis ) {
          case 'X':
            alignVector.copy( this.eye ).cross( unitX );
            dirVector.copy( unitX ).cross( alignVector );
            break;
          case 'Y':
            alignVector.copy( this.eye ).cross( unitY );
            dirVector.copy( unitY ).cross( alignVector );
            break;
          case 'Z':
            alignVector.copy( this.eye ).cross( unitZ );
            dirVector.copy( unitZ ).cross( alignVector );
            break;
          case 'XY':
            dirVector.copy( unitZ );
            break;
          case 'YZ':
            dirVector.copy( unitX );
            break;
          case 'XZ':
            alignVector.copy( unitZ );
            dirVector.copy( unitY );
            break;
          case 'XYZ':
          case 'E':
            dirVector.set( 0, 0, 0 );
            break;
        }
        break;
      case 'rotate':
      default:
        // special case for rotate
        dirVector.set( 0, 0, 0 );
    }
    if ( dirVector.length() === 0 ) {
      // If in rotate mode, make the plane parallel to camera
      this.quaternion.copy( this.cameraQuaternion );
    } else {
      tempMatrix.lookAt( tempVector.set( 0, 0, 0 ), dirVector, alignVector );
      this.quaternion.setFromRotationMatrix( tempMatrix );
    }
    Object3D.prototype.updateMatrixWorld.call( this );
  }
}

export { TransformControls, TransformControlsGizmo, TransformControlsPlane };
