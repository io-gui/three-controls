const __decorate = ( this && this.__decorate ) || function ( decorators, target, key, desc ) {

	let c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor( target, key ) : desc, d;
	if ( typeof Reflect === "object" && typeof Reflect.decorate === "function" ) r = Reflect.decorate( decorators, target, key, desc );
	else for ( let i = decorators.length - 1; i >= 0; i -- ) if ( d = decorators[ i ] ) r = ( c < 3 ? d( r ) : c > 3 ? d( target, key, r ) : d( target, key ) ) || r;
	return c > 3 && r && Object.defineProperty( target, key, r ), r;

};

import { Vector2, Vector3, Plane, PerspectiveCamera, OrthographicCamera, Raycaster, EventDispatcher, Quaternion } from "../../three/build/three.module.js";

/* eslint-disable @typescript-eslint/no-use-before-define */
// Internal variables
const EPS = 0.00001;
const PI = Math.PI;
const HPI = PI / 2;
const cameraTargets = new WeakMap();


// Common reusable events
export const CHANGE_EVENT = { type: 'change' };

export const START_EVENT = { type: 'start' };

export const END_EVENT = { type: 'end' };

export const DISPOSE_EVENT = { type: 'dispose' };

// onChange property decorator. Helps setting up property change handler functions.
export function onChange( onChangeFunc, onChangeToFalsyFunc ) {

	return ( target, propertyKey ) => {

		const values = new WeakMap();

		Object.defineProperty( target, propertyKey, {
			set( newValue ) {

				Object.defineProperty( this, propertyKey, {
					get() {

						return values.get( this );

					},
					set( newValue ) {

						const oldValue = values.get( this );

						values.set( this, newValue );

						if ( oldValue !== undefined && newValue !== oldValue ) {

							( newValue || ! onChangeToFalsyFunc ) ? this[ onChangeFunc ]() : this[ onChangeToFalsyFunc ]();

							this.dispatchEvent( { type: propertyKey + '-changed', value: newValue } );

						}

					}
				} );

				this[ propertyKey ] = newValue;

			}
		} );

	};

}


/**
 * `ControlsMixin`: Generic mixin for interactive threejs viewport controls.
 * It solves some of the most common and complex problems in threejs control designs.
 *
 * ### Pointer Tracking ###
 *
 * - Captures most relevant pointer and keyboard events and fixes some platform-specific bugs and discrepancies.
 * - Serves as a proxy dispatcher for pointer and keyboard events:
 *   "contextmenu", "wheel", "pointerdown", "pointermove", "pointerup", "pointerleave", "pointerover", "pointerenter", "pointerout", "pointercancel", "keydown", "keyup"
 * - Tracks active pointer gestures and evokes pointer event handler functions with tracked pointer data:
 *   `onTrackedPointerDown`, `onTrackedPointerMove`, `onTrackedPointerHover`, `onTrackedPointerUp`
 * - Enables inertial behaviours via simmulated pointer with framerate-independent damping.
 * - Tracks active key presses and evokes key event handler functions with currently pressed key data:
 *   `onTrackedKeyDown`, `onTrackedKeyUp`, `onTrackedKeyChange`
 *
 * ### Internal Update and Animation Loop ###
 *
 * - Removes the necessity to call `.update()` method externally from external animation loop for damping calculations.
 * - Developers can start and stop per-frame function invocations via `private startAnimation(callback)` and `stopAnimation(callback)`.
 *
 * ### Controls Livecycle ###
 *
 * - Adds/removes event listeners during lifecycle and on `enabled` property change.
 * - Stops current animations when `enabled` property is set to `false`.
 * - Takes care of the event listener cleanup when `dipose()` method is called.
 * - Emits lyfecycle events: "enabled", "disabled", "dispose"
 */
export function ControlsMixin( base ) {

	class MixinClass extends base {

		constructor( ...args ) {

			super( ...args );

			this.target = new Vector3();

			this.enabled = true;

			this.enableDamping = false;

			this.dampingFactor = 0.05;

			// Tracked pointers and keys
			this._simulatedPointer = null;

			this._hover = null;

			this._center = null;

			this._pointers = [];

			this._animations = [];

			this._keys = [];

			// Internal utility variables
			this._resetQuaternion = new Quaternion();

			this._resetPosition = new Vector3();

			this._resetUp = new Vector3();

			this._resetTarget = new Vector3();

			this._resetZoom = 1;

			this._resetFocus = 1;

			this.camera = args[ 0 ];

			this.domElement = args[ 1 ];

			// Runtime contructor arguments check
			if ( this.camera === undefined )
				console.warn( 'THREE.Controls: "camera" parameter is now mandatory!' );
			if ( ! ( this.camera instanceof PerspectiveCamera ) && ! ( this.camera instanceof OrthographicCamera ) )
				console.warn( 'THREE.Controls: Unsupported camera type!' );
			if ( this.domElement === undefined )
				console.warn( 'THREE.Controls: "domElement" parameter is now mandatory!' );
			if ( this.domElement === document )
				console.error( 'THREE.Controls: "domElement" should be "renderer.domElement"!' );

			// Camera target used for camera controls and pointer view -> world space conversion.
			const target = cameraTargets.get( this.camera ) || cameraTargets.set( this.camera, new Vector3() ).get( this.camera );

			// TODO encode target in camera matrix + focus?
			Object.defineProperty( this, 'target', {
				get: () => {

					return target;

				},
				set: ( value ) => {

					target.copy( value );

				}
			} );

			target.set = ( x, y, z ) => {

				Vector3.prototype.set.call( target, x, y, z );

				this.camera.lookAt( target );

				this.dispatchEvent( CHANGE_EVENT );

				return target;

			};

			target.copy = ( value ) => {

				Vector3.prototype.copy.call( target, value );

				this.camera.lookAt( target );

				this.dispatchEvent( CHANGE_EVENT );

				return target;

			};

			target.set( 0, 0, 0 );

			// Save initial camera state
			this.saveCameraState();

			// Bind handler functions
			this._onContextMenu = this._onContextMenu.bind( this );

			this._onWheel = this._onWheel.bind( this );

			this._onPointerDown = this._onPointerDown.bind( this );

			this._onPointerMove = this._onPointerMove.bind( this );

			this._onPointerSimulation = this._onPointerSimulation.bind( this );

			this._onPointerUp = this._onPointerUp.bind( this );

			this._onPointerLeave = this._onPointerLeave.bind( this );

			this._onPointerCancel = this._onPointerCancel.bind( this );

			this._onPointerOver = this._onPointerOver.bind( this );

			this._onPointerEnter = this._onPointerEnter.bind( this );

			this._onPointerOut = this._onPointerOut.bind( this );

			this._onKeyDown = this._onKeyDown.bind( this );

			this._onKeyUp = this._onKeyUp.bind( this );

			this._connect = this._connect.bind( this );

			this._disconnect = this._disconnect.bind( this );

			// Perform initial `connect()`
			this._connect();

		}

		// Adds animation callback to animation loop.
		startAnimation( callback ) {

			const index = this._animations.findIndex( animation => animation === callback );
			if ( index === - 1 )
				this._animations.push( callback );

			AnimationManagerSingleton.add( callback );

		}

		// Removes animation callback to animation loop.
		stopAnimation( callback ) {

			const index = this._animations.findIndex( animation => animation === callback );
			if ( index !== - 1 )
				this._animations.splice( index, 1 );

			AnimationManagerSingleton.remove( callback );

		}

		// Internal lyfecycle method
		_connect() {

			this.domElement.addEventListener( 'contextmenu', this._onContextMenu, false );

			this.domElement.addEventListener( 'wheel', this._onWheel, { capture: false, passive: false } );

			this.domElement.addEventListener( 'pointerdown', this._onPointerDown, false );

			this.domElement.addEventListener( 'pointermove', this._onPointerMove, false );

			this.domElement.addEventListener( 'pointerleave', this._onPointerLeave, false );

			this.domElement.addEventListener( 'pointercancel', this._onPointerCancel, false );

			this.domElement.addEventListener( 'pointerover', this._onPointerOver, false );

			this.domElement.addEventListener( 'pointerenter', this._onPointerEnter, false );

			this.domElement.addEventListener( 'pointerout', this._onPointerOut, false );

			this.domElement.addEventListener( 'pointerup', this._onPointerUp, false );

			this.domElement.addEventListener( 'keydown', this._onKeyDown, false );

			this.domElement.addEventListener( 'keyup', this._onKeyUp, false );

			// make sure element can receive keys.
			if ( this.domElement.tabIndex === - 1 ) {

				this.domElement.tabIndex = 0;

			}


			// make sure element has disabled touch-actions.
			if ( window.getComputedStyle( this.domElement ).touchAction !== 'none' ) {

				this.domElement.style.touchAction = 'none';

			}

			// TODO: consider reverting "tabIndex" and "style.touchAction" attributes on disconnect.

		}

		// Internal lyfecycle method
		_disconnect() {

			this.domElement.removeEventListener( 'contextmenu', this._onContextMenu, false );

			// TODO: investigate typescript bug?
			this.domElement.removeEventListener( 'wheel', this._onWheel, { capture: false, passive: false } );

			this.domElement.removeEventListener( 'pointerdown', this._onPointerDown, false );

			this.domElement.removeEventListener( 'pointermove', this._onPointerMove, false );

			this.domElement.removeEventListener( 'pointerleave', this._onPointerLeave, false );

			this.domElement.removeEventListener( 'pointercancel', this._onPointerCancel, false );

			this.domElement.removeEventListener( 'pointerup', this._onPointerUp, false );

			this.domElement.removeEventListener( 'keydown', this._onKeyDown, false );

			this.domElement.removeEventListener( 'keyup', this._onKeyUp, false );

			// Release all captured pointers
			for ( let i = 0; i < this._pointers.length; i ++ ) {

				this.domElement.releasePointerCapture( this._pointers[ i ].pointerId );

			}


			// Stop all animations
			for ( let i = 0; i < this._animations.length; i ++ ) {

				this.stopAnimation( this._animations[ i ] );

			}


			// Clear current pointers and keys
			this._pointers.length = 0;

			this._keys.length = 0;

		}

		// Disables controls and triggers internal _disconnect method to stop animations, diconnects listeners and clears pointer arrays. Dispatches 'dispose' event.
		dispose() {

			this.enabled = false;

			this.dispatchEvent( DISPOSE_EVENT );

		}

		// Deprecation warning.
		saveState() {

			console.warn( 'THREE.Controls: "saveState" is now "saveCameraState"!' );

			this.saveCameraState();

		}

		// Deprecation warning.
		reset() {

			console.warn( 'THREE.Controls: "reset" is now "resetCameraState"!' );

			this.resetCameraState();

		}

		// Saves camera state for later reset.
		saveCameraState() {

			this._resetQuaternion.copy( this.camera.quaternion );

			this._resetPosition.copy( this.camera.position );

			this._resetUp.copy( this.camera.up );

			this._resetTarget.copy( this.target );

			this._resetZoom = this.camera.zoom;

			if ( this.camera instanceof PerspectiveCamera ) {

				this._resetFocus = this.camera.focus;

			}

		}

		// Resets camera state from saved reset state.
		resetCameraState() {

			this.camera.quaternion.copy( this._resetQuaternion );

			this.camera.position.copy( this._resetPosition );

			this.camera.up.copy( this._resetUp );

			this.target.copy( this._resetTarget );

			this.camera.zoom = this._resetZoom;

			if ( this.camera instanceof PerspectiveCamera ) {

				this.camera.focus = this._resetFocus;

			}

			this.camera.updateProjectionMatrix();

			this.dispatchEvent( CHANGE_EVENT );

		}

		// EventDispatcher.addEventListener with added deprecation warnings.
		addEventListener( type, listener ) {

			if ( type === 'enabled' ) {

				console.warn( `THREE.Controls: "enabled" event is now "enabled-changed"!` );

				type = 'enabled-changed';

			}

			if ( type === 'disabled' ) {

				console.warn( `THREE.Controls: "disabled" event is now "enabled-changed"!` );

				type = 'enabled-changed';

			}

			super.addEventListener( type, listener );

		}

		// EventDispatcher.dispatchEvent with added ability to dispatch native DOM Events.
		dispatchEvent( event ) {

			if ( this._listeners && this._listeners[ event.type ] && this._listeners[ event.type ].length ) {

				Object.defineProperty( event, 'target', { writable: true } );

				super.dispatchEvent( event );

			}

		}

		// Internal event handlers
		_onContextMenu( event ) {

			this.dispatchEvent( event );

		}
		_onWheel( event ) {

			this.dispatchEvent( event );

		}
		_onPointerDown( event ) {

			if ( this._simulatedPointer )
				this._simulatedPointer = null;

			this.domElement.focus ? this.domElement.focus() : window.focus();

			this.domElement.setPointerCapture( event.pointerId );

			const pointers = this._pointers;
			const pointer = new Pointer( event, this.camera );

			pointers.push( pointer );

			this.onTrackedPointerDown( pointer, pointers );

			this.dispatchEvent( event );

		}
		_onPointerMove( event ) {

			const pointers = this._pointers;
			const index = pointers.findIndex( pointer => pointer.pointerId === event.pointerId );
			let pointer = pointers[ index ];
			if ( pointer ) {

				pointer.update( event, this.camera );

				const x = Math.abs( pointer.view.current.x );
				const y = Math.abs( pointer.view.current.y );

				// Workaround for https://bugs.chromium.org/p/chromium/issues/detail?id=1131348
				if ( pointer.button !== 0 && ( x > 1 || x < 0 || y > 1 || y < 0 ) ) {

					pointers.splice( index, 1 );

					this.domElement.releasePointerCapture( event.pointerId );

					this.dispatchEvent( event );

					this.onTrackedPointerUp( pointer, pointers );

					return;

				}


				/**
                  * TODO: investigate multi-poiter movement accumulation and unhack.
                  * This shouldn't be necessary yet without it, multi pointer gestures result with
                  * multiplied movement values. TODO: investigate and unhack.
                  * */
				for ( let i = 0; i < pointers.length; i ++ ) {

					if ( pointer.pointerId !== pointers[ i ].pointerId ) {

						pointers[ i ]._clearMovement();

					}

				}

				this._center = this._center || new CenterPointer( event, this.camera );

				this._center.updateCenter( pointers );

				// TODO: consider throttling once per frame. On Mac pointermove fires up to 120 Hz.
				this.onTrackedPointerMove( pointer, pointers, this._center );

			} else if ( this._hover && this._hover.pointerId === event.pointerId ) {

				pointer = this._hover;

				pointer.update( event, this.camera );

				this.onTrackedPointerHover( pointer, [ pointer ] );

			} else {

				pointer = this._hover = new Pointer( event, this.camera );

				this.onTrackedPointerHover( pointer, [ pointer ] );

			}


			// Fix MovementX/Y for Safari
			Object.defineProperty( event, 'movementX', { writable: true, value: pointer.canvas.movement.x } );

			Object.defineProperty( event, 'movementY', { writable: true, value: pointer.canvas.movement.y } );

			this.dispatchEvent( event );

		}
		_onPointerSimulation( timeDelta ) {

			if ( this._simulatedPointer ) {

				const pointer = this._simulatedPointer;

				pointer.applyDamping( this.dampingFactor, timeDelta );

				if ( pointer.canvas.movement.length() > EPS ) {

					this.onTrackedPointerMove( pointer, [ pointer ], pointer );

				} else {

					this.onTrackedPointerUp( pointer, [] );

					this._simulatedPointer = null;

				}

			} else {

				this.stopAnimation( this._onPointerSimulation );

			}

		}
		_onPointerUp( event ) {


			// TODO: three-finger drag on Mac touchpad producing delayed pointerup.
			const pointers = this._pointers;
			const index = pointers.findIndex( pointer => pointer.pointerId === event.pointerId );
			const pointer = pointers[ index ];
			if ( pointer ) {

				pointers.splice( index, 1 );

				this.domElement.releasePointerCapture( event.pointerId );

				if ( this.enableDamping ) {

					this._simulatedPointer = pointer;

					this._simulatedPointer.isSimulated = true;

					this.startAnimation( this._onPointerSimulation );

				} else {

					this.onTrackedPointerUp( pointer, pointers );

				}

			}

			this.dispatchEvent( event );

		}
		_onPointerLeave( event ) {

			const pointers = this._pointers;
			const index = pointers.findIndex( pointer => pointer.pointerId === event.pointerId );
			const pointer = pointers[ index ];
			if ( pointer ) {

				pointers.splice( index, 1 );

				this.domElement.releasePointerCapture( event.pointerId );

				this.onTrackedPointerUp( pointer, pointers );

			}

			this.dispatchEvent( event );

		}
		_onPointerCancel( event ) {

			const pointers = this._pointers;
			const index = pointers.findIndex( pointer => pointer.pointerId === event.pointerId );
			const pointer = pointers[ index ];
			if ( pointer ) {

				pointers.splice( index, 1 );

				this.domElement.releasePointerCapture( event.pointerId );

				this.onTrackedPointerUp( pointer, pointers );

			}

			this.dispatchEvent( event );

		}
		_onPointerOver( event ) {

			this.dispatchEvent( event );

		}
		_onPointerEnter( event ) {

			this.dispatchEvent( event );

		}
		_onPointerOut( event ) {

			this.dispatchEvent( event );

		}
		_onKeyDown( event ) {

			const code = Number( event.code );
			const keys = this._keys;
			const index = keys.findIndex( key => key === code );
			if ( index === - 1 )
				keys.push( code );
			if ( ! event.repeat ) {

				this.onTrackedKeyDown( code, keys );

				this.onTrackedKeyChange( code, keys );

			}

			this.dispatchEvent( event );

		}
		_onKeyUp( event ) {

			const code = Number( event.code );
			const keys = this._keys;
			const index = keys.findIndex( key => key === code );
			if ( index !== - 1 )
				keys.splice( index, 1 );

			this.onTrackedKeyUp( code, keys );

			this.onTrackedKeyChange( code, keys );

			this.dispatchEvent( event );

		}

		// Tracked pointer handlers
		/* eslint-disable @typescript-eslint/no-empty-function */
		/* eslint-disable @typescript-eslint/no-unused-vars */
		/* eslint-disable no-unused-vars */
		onTrackedPointerDown( _pointer, _pointers ) { }
		onTrackedPointerMove( _pointer, _pointers, _center ) { }
		onTrackedPointerHover( _pointer, _pointers ) { }
		onTrackedPointerUp( _pointer, _pointers ) { }
		onTrackedKeyDown( code, codes ) { }
		onTrackedKeyUp( code, codes ) { }
		onTrackedKeyChange( code, codes ) { }

	}

	__decorate( [
		onChange( '_connect', '_disconnect' )
	], MixinClass.prototype, "enabled", void 0 );

	return MixinClass;

}


/**
 * `Controls`: Generic superclass for interactive viewport controls.
 * `ControlsMixin` applied to `EventDispatcher`.
 */
export class Controls extends ControlsMixin( EventDispatcher ) {

	constructor( camera, domElement ) {

		super( camera, domElement );

	}

}

const raycaster = new Raycaster();
const intersectedObjects = [];
const intersectedPoint = new Vector3();
const viewMultiplier = new Vector2();
const viewOffset = new Vector2();
const plane = new Plane();
const unitX = Object.freeze( new Vector3( 1, 0, 0 ) );
const unitY = Object.freeze( new Vector3( 0, 1, 0 ) );
const unitZ = Object.freeze( new Vector3( 0, 0, 1 ) );
const eye0 = new Vector3();
const offsetCameras = new WeakMap();
class Pointer2D {

	constructor( x, y ) {

		this.start = new Vector2();

		this.current = new Vector2();

		this.previous = new Vector2();

		this.movement = new Vector2();

		this.offset = new Vector2();

		this.start.set( x, y );

		this.current.set( x, y );

		this.previous.set( x, y );

	}
	set( x, y ) {

		this.start.set( x, y );

		this.current.set( x, y );

		this.previous.set( x, y );

		this.movement.set( x, y );

		this.offset.set( x, y );

		return this;

	}
	clear() {

		this.set( 0, 0 );

	}
	add( pointer ) {

		this.start.add( pointer.start );

		this.current.add( pointer.current );

		this.previous.add( pointer.previous );

		this.movement.add( pointer.movement );

		this.offset.add( pointer.offset );

		return this;

	}
	copy( pointer ) {

		this.start.copy( pointer.start );

		this.current.copy( pointer.current );

		this.previous.copy( pointer.previous );

		this.movement.copy( pointer.movement );

		this.offset.copy( pointer.offset );

		return this;

	}
	divideScalar( value ) {

		this.start.divideScalar( value );

		this.current.divideScalar( value );

		this.previous.divideScalar( value );

		this.movement.divideScalar( value );

		this.offset.divideScalar( value );

		return this;

	}
	update( x, y ) {

		this.previous.copy( this.current );

		this.current.set( x, y );

		this.movement.copy( this.current ).sub( this.previous );

		this.offset.copy( this.current ).sub( this.start );

		return this;

	}

	// Converts pointer coordinates from "canvas" space (pixels) to "view" space (-1, 1).
	convertToViewSpace( domElement ) {

		viewMultiplier.set( domElement.clientWidth / 2, - 1 * domElement.clientHeight / 2 );

		viewOffset.set( 1, - 1 );

		this.start.divide( viewMultiplier ).sub( viewOffset );

		this.current.divide( viewMultiplier ).sub( viewOffset );

		this.previous.divide( viewMultiplier ).sub( viewOffset );

		this.movement.divide( viewMultiplier );

		this.offset.divide( viewMultiplier );

		return this;

	}

}
class Pointer3D {

	constructor( x, y, z ) {

		this.start = new Vector3();

		this.current = new Vector3();

		this.previous = new Vector3();

		this.movement = new Vector3();

		this.offset = new Vector3();

		this.set( x, y, z );

	}
	set( x, y, z ) {

		this.start.set( x, y, z );

		this.current.set( x, y, z );

		this.previous.set( x, y, z );

		this.movement.set( x, y, z );

		this.offset.set( x, y, z );

		return this;

	}
	clear() {

		this.set( 0, 0, 0 );

	}
	add( pointer ) {

		this.start.add( pointer.start );

		this.current.add( pointer.current );

		this.previous.add( pointer.previous );

		this.movement.add( pointer.movement );

		this.offset.add( pointer.offset );

		return this;

	}
	divideScalar( value ) {

		this.start.divideScalar( value );

		this.current.divideScalar( value );

		this.previous.divideScalar( value );

		this.movement.divideScalar( value );

		this.offset.divideScalar( value );

		return this;

	}
	fromView( viewPointer, camera, planeNormal ) {

		const target = cameraTargets.get( camera ) || cameraTargets.set( camera, new Vector3() ).get( camera );

		plane.setFromNormalAndCoplanarPoint( planeNormal, target );

		eye0.set( 0, 0, 1 ).applyQuaternion( camera.quaternion );

		const angle = HPI - eye0.angleTo( plane.normal );
		const minAngle = ( ( camera instanceof PerspectiveCamera ) ? ( camera.fov / 2 ) : 30 ) / 180 * PI;
		const rotationAxis = eye0.cross( plane.normal ).normalize();
		let virtualCamera = offsetCameras.get( camera );
		if ( ! virtualCamera )
			offsetCameras.set( camera, virtualCamera = camera.clone() );

		virtualCamera.copy( camera );

		const rp = new Vector3().setFromMatrixPosition( virtualCamera.matrixWorld ).sub( target );
		if ( Math.abs( angle ) < minAngle )
			rp.applyAxisAngle( rotationAxis, - angle + ( angle >= 0 ? minAngle : - minAngle ) );

		virtualCamera.position.copy( rp ).add( target );

		virtualCamera.lookAt( target );

		virtualCamera.updateMatrixWorld();

		intersectedPoint.set( 0, 0, 0 );

		raycaster.setFromCamera( viewPointer.start, virtualCamera );

		raycaster.ray.intersectPlane( plane, intersectedPoint );

		this.start.copy( intersectedPoint );

		intersectedPoint.set( 0, 0, 0 );

		raycaster.setFromCamera( viewPointer.current, virtualCamera );

		raycaster.ray.intersectPlane( plane, intersectedPoint );

		this.current.copy( intersectedPoint );

		intersectedPoint.set( 0, 0, 0 );

		raycaster.setFromCamera( viewPointer.previous, virtualCamera );

		raycaster.ray.intersectPlane( plane, intersectedPoint );

		this.previous.copy( intersectedPoint );

		this.movement.copy( this.current ).sub( this.previous );

		this.offset.copy( this.current ).sub( this.start );

		return this;

	}

}


/**
 * Keeps track of pointer movements and handles coordinate conversions to various 2D and 3D spaces.
 * It handles pointer raycasting to various 3D planes at camera's target position.
 */
export class Pointer {

	constructor( pointerEvent, camera ) {


		// Used to distinguish a special "simulated" pointer used to actuate inertial gestures with damping.
		this.isSimulated = false;

		// 2D pointer getter. Has coordinates in view-space ([-1...1] range)
		this.view = new Pointer2D( 0, 0 );

		// 3D pointer getter. Has coordinates in 3D-space from ray projected onto a plane facing x-axis.
		this.planeX = new Pointer3D( 0, 0, 0 );

		// 3D pointer getter. Has coordinates in 3D-space from ray projected onto a plane facing y-axis.
		this.planeY = new Pointer3D( 0, 0, 0 );

		// 3D pointer getter. Has coordinates in 3D-space from ray projected onto a plane facing z-axis.
		this.planeZ = new Pointer3D( 0, 0, 0 );

		// 3D pointer getter. Has coordinates in 3D-space from ray projected onto a plane facing eye-vector.
		this.planeE = new Pointer3D( 0, 0, 0 );

		// 3D pointer getter. Has coordinates in 3D-space from ray projected onto a plane facing x-axis-normal vector coplanar with eye-vector.
		this.planeNormalX = new Pointer3D( 0, 0, 0 );

		// 3D pointer getter. Has coordinates in 3D-space from ray projected onto a plane facing y-axis-normal vector coplanar with eye-vector.
		this.planeNormalY = new Pointer3D( 0, 0, 0 );

		// 3D pointer getter. Has coordinates in 3D-space from ray projected onto a plane facing z-axis-normal vector coplanar with eye-vector.
		this.planeNormalZ = new Pointer3D( 0, 0, 0 );

		this._camera = camera;

		// Set pointer read-only constants from PointerEvent data.
		this.domElement = pointerEvent.target;

		this.pointerId = pointerEvent.pointerId;

		this.type = pointerEvent.pointerType;

		Object.defineProperties( this, {
			domElement: { writable: false, configurable: true },
			pointerId: { writable: false, configurable: true },
			type: { writable: false, configurable: true },
		} );

		// Set buttons and keys from PointerEvent data.
		this.button = pointerEvent.button;

		this.buttons = pointerEvent.buttons;

		this.altKey = pointerEvent.altKey;

		this.ctrlKey = pointerEvent.ctrlKey;

		this.metaKey = pointerEvent.metaKey;

		this.shiftKey = pointerEvent.shiftKey;

		// Set canvas-space pointer from PointerEvent data.
		this.canvas = new Pointer2D( pointerEvent.clientX, pointerEvent.clientY );

		// Reusable pointer variables.
		const view = new Pointer2D( 0, 0 );
		const planeX = new Pointer3D( 0, 0, 0 );
		const planeY = new Pointer3D( 0, 0, 0 );
		const planeZ = new Pointer3D( 0, 0, 0 );
		const planeE = new Pointer3D( 0, 0, 0 );
		const planeNormalX = new Pointer3D( 0, 0, 0 );
		const planeNormalY = new Pointer3D( 0, 0, 0 );
		const planeNormalZ = new Pointer3D( 0, 0, 0 );

		// Getters for pointers converted to various 2D and 3D spaces.
		Object.defineProperty( this, 'view', {
			get: () => view.copy( this.canvas ).convertToViewSpace( this.domElement )
		} );

		Object.defineProperty( this, 'planeX', {
			get: () => planeX.fromView( this.view, this._camera, unitX )
		} );

		Object.defineProperty( this, 'planeY', {
			get: () => planeY.fromView( this.view, this._camera, unitY )
		} );

		Object.defineProperty( this, 'planeZ', {
			get: () => planeZ.fromView( this.view, this._camera, unitZ )
		} );

		Object.defineProperty( this, 'planeE', {
			get: () => planeE.fromView( this.view, this._camera, eye0.set( 0, 0, 1 ).applyQuaternion( this._camera.quaternion ).normalize() )
		} );

		Object.defineProperty( this, 'planeNormalX', {
			get: () => planeNormalX.fromView( this.view, this._camera, eye0.set( 0, 0, 1 ).applyQuaternion( this._camera.quaternion ).normalize().cross( unitX ).cross( unitX ) )
		} );

		Object.defineProperty( this, 'planeNormalY', {
			get: () => planeNormalY.fromView( this.view, this._camera, eye0.set( 0, 0, 1 ).applyQuaternion( this._camera.quaternion ).normalize().cross( unitY ).cross( unitY ) )
		} );

		Object.defineProperty( this, 'planeNormalZ', {
			get: () => planeNormalZ.fromView( this.view, this._camera, eye0.set( 0, 0, 1 ).applyQuaternion( this._camera.quaternion ).normalize().cross( unitZ ).cross( unitZ ) )
		} );

	}
	update( pointerEvent, camera ) {

		{

			if ( this.pointerId !== pointerEvent.pointerId ) {

				console.error( 'Invalid pointerId!' );

				return;

			}

		}

		this._camera = camera;

		// Update buttons and keys from latest PointerEvent data.
		this.buttons = pointerEvent.buttons;

		this.altKey = pointerEvent.altKey;

		this.ctrlKey = pointerEvent.ctrlKey;

		this.metaKey = pointerEvent.metaKey;

		this.shiftKey = pointerEvent.shiftKey;

		// Update canvas-space pointer from PointerEvent data.
		this.canvas.update( pointerEvent.clientX, pointerEvent.clientY );

	}

	// Simmulates inertial movement by applying damping to previous movement. For special "simmulated" pointer only.
	applyDamping( dampingFactor, deltaTime ) {

		if ( ! this.isSimulated )
			return;
		const damping = Math.pow( 1 - dampingFactor, deltaTime * 60 / 1000 );

		this.canvas.update( this.canvas.current.x + this.canvas.movement.x * damping, this.canvas.current.y + this.canvas.movement.y * damping );

	}

	// Intersects specified objects with current view-space pointer vector.
	intersectObjects( objects ) {

		raycaster.setFromCamera( this.view.current, this._camera );

		intersectedObjects.length = 0;

		raycaster.intersectObjects( objects, true, intersectedObjects );

		return intersectedObjects;

	}

	// Intersects specified plane with current view-space pointer vector.
	intersectPlane( plane ) {

		raycaster.setFromCamera( this.view.current, this._camera );

		raycaster.ray.intersectPlane( plane, intersectedPoint );

		return intersectedPoint;

	}

	// TODO: unhack
	_clearMovement() {

		this.canvas.previous.copy( this.canvas.current );

		this.canvas.movement.set( 0, 0 );

	}

}

// Virtual "center" pointer for multi-touch gestures.
export class CenterPointer extends Pointer {

	constructor( pointerEvent, camera ) {

		super( pointerEvent, camera );

		// Array of pointers to calculate centers from
		this._pointers = [];

		// Set special "center" pointer read-only properties.
		Object.defineProperties( this, {
			type: { value: 'virtual' },
			pointerId: { value: - 1 },
		} );

		// Reusable pointer variables.
		const canvas = new Pointer2D( 0, 0 );
		const view = new Pointer2D( 0, 0 );
		const planeX = new Pointer3D( 0, 0, 0 );
		const planeY = new Pointer3D( 0, 0, 0 );
		const planeZ = new Pointer3D( 0, 0, 0 );
		const planeE = new Pointer3D( 0, 0, 0 );
		const planeNormalX = new Pointer3D( 0, 0, 0 );
		const planeNormalY = new Pointer3D( 0, 0, 0 );
		const planeNormalZ = new Pointer3D( 0, 0, 0 );


		// Reusable pointer variables.
		function _averagePointers( pointer, pointers, type ) {

			pointer.clear();

			for ( let i = 0; i < pointers.length; i ++ )
				pointer.add( pointers[ i ][ type ] );
			if ( pointers.length > 1 )
				pointer.divideScalar( pointers.length );
			return pointer;

		}


		// Getters for center pointer from pointers converted to various 2D and 3D spaces.
		Object.defineProperty( this, 'canvas', {
			get: () => _averagePointers( canvas, this._pointers, 'canvas' )
		} );

		Object.defineProperty( this, 'view', {
			get: () => _averagePointers( view, this._pointers, 'view' )
		} );

		Object.defineProperty( this, 'planeE', {
			get: () => _averagePointers( planeE, this._pointers, 'planeE' )
		} );

		Object.defineProperty( this, 'planeX', {
			get: () => _averagePointers( planeX, this._pointers, 'planeX' )
		} );

		Object.defineProperty( this, 'planeY', {
			get: () => _averagePointers( planeY, this._pointers, 'planeY' )
		} );

		Object.defineProperty( this, 'planeZ', {
			get: () => _averagePointers( planeZ, this._pointers, 'planeZ' )
		} );

		Object.defineProperty( this, 'planeNormalX', {
			get: () => _averagePointers( planeNormalX, this._pointers, 'planeNormalX' )
		} );

		Object.defineProperty( this, 'planeNormalY', {
			get: () => _averagePointers( planeNormalY, this._pointers, 'planeNormalY' )
		} );

		Object.defineProperty( this, 'planeNormalZ', {
			get: () => _averagePointers( planeNormalZ, this._pointers, 'planeNormalZ' )
		} );

	}

	// Updates the internal array of pointers necessary to calculate the centers.
	updateCenter( pointers ) {

		this._pointers = pointers;

	}

}


/**
 * Internal animation manager.
 * It runs requestAnimationFrame loop as long as there are animation callbacks in its internal queue.
 */
class AnimationManager {

	constructor() {

		this._queue = [];

		this._running = false;

		this._time = performance.now();

		this._update = this._update.bind( this );

	}

	// Adds animation callback to the queue
	add( callback ) {

		const index = this._queue.indexOf( callback );
		if ( index === - 1 ) {

			this._queue.push( callback );

			if ( this._queue.length === 1 )
				this._start();

		}

	}

	// Removes animation callback from the queue
	remove( callback ) {

		const index = this._queue.indexOf( callback );
		if ( index !== - 1 ) {

			this._queue.splice( index, 1 );

			if ( this._queue.length === 0 )
				this._stop();

		}

	}
	_start() {

		this._time = performance.now();

		this._running = true;

		requestAnimationFrame( this._update );

	}
	_stop() {

		this._running = false;

	}
	_update() {

		if ( this._queue.length === 0 ) {

			this._running = false;

			return;

		}

		if ( this._running )
			requestAnimationFrame( this._update );
		const time = performance.now();
		const timestep = performance.now() - this._time;

		this._time = time;

		for ( let i = 0; i < this._queue.length; i ++ ) {

			this._queue[ i ]( timestep );

		}

	}

}

// Singleton animation manager.
const AnimationManagerSingleton = new AnimationManager();
