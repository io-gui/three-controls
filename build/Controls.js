import { Vector2, Vector3, PerspectiveCamera, OrthographicCamera, Raycaster, Ray, EventDispatcher, MathUtils } from 'three';

export const CONTROL_CHANGE_EVENT = { type: 'change' };

export const CONTROL_START_EVENT = { type: 'start' };

export const CONTROL_END_EVENT = { type: 'end' };

export const CONTROL_DISPOSE_EVENT = { type: 'dispose' };


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
 * - Developers can start and stop per-frame function invocations via `private startAnimation( callback )` and `stopAnimation( callback )`.
 *
 * ### Controls Livecycle ###
 *
 * - Adds/removes event listeners during lifecycle and on `enabled` property change.
 * - Stops current animations when `enabled` property is set to `false`.
 * - Takes care of the event listener cleanup when `dipose()` method is called.
 * - Emits lyfecycle events: "enabled", "disabled", "dispose"
 */
export function ControlsMixin( superClass ) {

	class MixinClass extends superClass {

		constructor( ...args ) {

			super( ...args );
			this.enabled = true;
			this.xr = null;
			this.enableDamping = false;
			this.dampingFactor = 0.05;

			// Tracked pointers and keys
			this._hoverPointer = null;
			this._centerPointer = null;
			this._simulatedPointer = null;
			this._pointers = [];
			this._xrControllers = [];
			this._animations = [];
			this._keys = [];

			//
			this._changeDispatched = false;
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


			// Bind handler functions
			this._preventDefault = this._preventDefault.bind( this );
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
			this._connectXR = this._connectXR.bind( this );
			this._disconnectXR = this._disconnectXR.bind( this );
			this.observeProperty( 'enabled', this._connect, this._disconnect );
			this.observeProperty( 'xr', this._connectXR, this._disconnectXR );

			// Perform initial `connect()`
			this._connect();

		}

		// Adds property observing mechanism via getter/setter functions. Also emits '[property]-changed' event.
		observeProperty( propertyKey, onChangeFunc, onChangeToFalsyFunc ) {

			let value = this[ propertyKey ];

			Object.defineProperty( this, propertyKey, {
				get() {

					return value;

				},
				set( newValue ) {

					const oldValue = value;
					value = newValue;

					if ( oldValue !== undefined && newValue !== oldValue ) {

						( newValue || ! onChangeToFalsyFunc ) ? ( onChangeFunc && onChangeFunc() ) : onChangeToFalsyFunc();
						this.dispatchEvent( { type: propertyKey + '-changed', value: newValue, oldValue: oldValue } );

						if ( ! this._changeDispatched ) {

							this._changeDispatched = true;

							requestAnimationFrame( () => {

								this.dispatchEvent( CONTROL_CHANGE_EVENT );
								this._changeDispatched = false;

							} );

						}

					}

				}
			} );

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
			this.domElement.addEventListener( 'touchdown', this._preventDefault, { capture: false, passive: false } );
			this.domElement.addEventListener( 'touchmove', this._preventDefault, { capture: false, passive: false } );
			this.domElement.addEventListener( 'pointerdown', this._onPointerDown );
			this.domElement.addEventListener( 'pointermove', this._onPointerMove );
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

		}

		// Internal lyfecycle method
		_disconnect() {

			this.domElement.removeEventListener( 'contextmenu', this._onContextMenu, false );
			this.domElement.removeEventListener( 'wheel', this._onWheel );
			this.domElement.removeEventListener( 'touchdown', this._preventDefault );
			this.domElement.removeEventListener( 'touchmove', this._preventDefault );
			this.domElement.removeEventListener( 'pointerdown', this._onPointerDown );
			this.domElement.removeEventListener( 'pointermove', this._onPointerMove );
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
		_connectXR() {

			let _a;

			if ( ( _a = this.xr ) === null || _a === void 0 ? void 0 : _a.isPresenting ) {

				// TODO
			}

		}
		_disconnectXR() {

			// TODO
		}

		// Disables controls and triggers internal _disconnect method to stop animations, diconnects listeners and clears pointer arrays. Dispatches 'dispose' event.
		dispose() {

			this.enabled = false;
			this.dispatchEvent( CONTROL_DISPOSE_EVENT );

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
		_preventDefault( event ) {

			event.preventDefault();

		}
		_onContextMenu( event ) {

			this.dispatchEvent( event );

		}
		_onWheel( event ) {

			this.dispatchEvent( event );

		}
		_onPointerDown( event ) {

			if ( this._simulatedPointer ) {

				this._simulatedPointer.clearMovement();
				this._simulatedPointer = null;
				this.stopAnimation( this._onPointerSimulation );

			}

			this.domElement.focus ? this.domElement.focus() : window.focus();
			this.domElement.setPointerCapture( event.pointerId );
			const pointers = this._pointers;
			const pointer = new PointerTracker( event, this.camera );
			pointer.clearMovement(); // TODO: investigate why this is necessary
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

						pointers[ i ].clearMovement(); // TODO: unhack

					}

				}

				this._centerPointer = this._centerPointer || new CenterPointerTracker( event, this.camera );
				this._centerPointer.updateCenter( pointers );

				// TODO: consider throttling once per frame. On Mac pointermove fires up to 120 Hz.
				this.onTrackedPointerMove( pointer, pointers, this._centerPointer );

			} else if ( this._hoverPointer && this._hoverPointer.pointerId === event.pointerId ) {

				pointer = this._hoverPointer;
				pointer.update( event, this.camera );
				this.onTrackedPointerHover( pointer, [ pointer ] );

			} else {

				pointer = this._hoverPointer = new PointerTracker( event, this.camera );
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
				pointer.simmulateDamping( this.dampingFactor, timeDelta );

				if ( pointer.canvas.movement.length() > 0.05 ) {

					this.onTrackedPointerMove( pointer, [ pointer ], pointer );

				} else {

					this._simulatedPointer = null;
					this.onTrackedPointerUp( pointer, [] );
					this.stopAnimation( this._onPointerSimulation );

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
		onTrackedPointerMove( _pointer, _pointers, _centerPointer ) { }
		onTrackedPointerHover( _pointer, _pointers ) { }
		onTrackedPointerUp( _pointer, _pointers ) { }
		onTrackedKeyDown( code, codes ) { }
		onTrackedKeyUp( code, codes ) { }
		onTrackedKeyChange( code, codes ) { }

	}

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


// Keeps pointer movement data in 2D canvas space ( pixels )
class CanvasPointer {

	constructor( x = 0, y = 0 ) {

		this.start = new Vector2();
		this.current = new Vector2();
		this.previous = new Vector2();
		this._movement = new Vector2();
		this._offset = new Vector2();
		this.set( x, y );

	}
	get movement() {

		return this._movement.copy( this.current ).sub( this.previous );

	}
	get offset() {

		return this._offset.copy( this.current ).sub( this.start );

	}
	set( x, y ) {

		this.start.set( x, y );
		this.current.set( x, y );
		this.previous.set( x, y );
		return this;

	}
	update( x, y ) {

		this.previous.copy( this.current );
		this.current.set( x, y );
		return this;

	}

}


// Keeps pointer movement data in 2D view space ( -1, 1 )
class ViewPointer {

	constructor( x = 0, y = 0 ) {

		this.start = new Vector2();
		this.current = new Vector2();
		this.previous = new Vector2();
		this._movement = new Vector2();
		this._offset = new Vector2();
		this._viewOffset = Object.freeze( new Vector2( 1, - 1 ) );
		this._viewMultiplier = new Vector2();
		this.set( x, y );

	}
	get movement() {

		return this._movement.copy( this.current ).sub( this.previous );

	}
	get offset() {

		return this._offset.copy( this.current ).sub( this.start );

	}
	set( x, y ) {

		this.start.set( x, y );
		this.current.set( x, y );
		this.previous.set( x, y );
		return this;

	}

	// Converts pointer coordinates from "canvas" space ( pixels ) to "view" space ( -1, 1 ).
	update( canvasPointer, domElement ) {

		this.start.copy( canvasPointer.start );
		this.current.copy( canvasPointer.current );
		this.previous.copy( canvasPointer.previous );
		this._viewMultiplier.set( domElement.clientWidth / 2, - 1 * domElement.clientHeight / 2 );
		this.start.divide( this._viewMultiplier ).sub( this._viewOffset );
		this.current.divide( this._viewMultiplier ).sub( this._viewOffset );
		this.previous.divide( this._viewMultiplier ).sub( this._viewOffset );
		return this;

	}

}


// Keeps pointer movement data in 6D space (Origin + Direction)
class RayPointer {

	constructor() {


		// TODO: optional grazing fix
		this.start = new Ray();
		this.current = new Ray();
		this.previous = new Ray();

	}
	update( camera, viewPointer ) {

		if ( camera instanceof PerspectiveCamera ) {

			this.start.origin.setFromMatrixPosition( camera.matrixWorld );
			this.start.direction.set( viewPointer.start.x, viewPointer.start.y, 0.5 ).unproject( camera ).sub( this.start.origin ).normalize();
			this.current.origin.setFromMatrixPosition( camera.matrixWorld );
			this.current.direction.set( viewPointer.current.x, viewPointer.current.y, 0.5 ).unproject( camera ).sub( this.current.origin ).normalize();
			this.previous.origin.setFromMatrixPosition( camera.matrixWorld );
			this.previous.direction.set( viewPointer.previous.x, viewPointer.previous.y, 0.5 ).unproject( camera ).sub( this.previous.origin ).normalize();

		} else if ( camera instanceof OrthographicCamera ) {

			this.start.origin.set( viewPointer.start.x, viewPointer.start.y, ( camera.near + camera.far ) / ( camera.near - camera.far ) ).unproject( camera );
			this.start.direction.set( 0, 0, - 1 ).transformDirection( camera.matrixWorld );
			this.current.origin.set( viewPointer.current.x, viewPointer.current.y, ( camera.near + camera.far ) / ( camera.near - camera.far ) ).unproject( camera );
			this.current.direction.set( 0, 0, - 1 ).transformDirection( camera.matrixWorld );
			this.previous.origin.set( viewPointer.previous.x, viewPointer.previous.y, ( camera.near + camera.far ) / ( camera.near - camera.far ) ).unproject( camera );
			this.previous.direction.set( 0, 0, - 1 ).transformDirection( camera.matrixWorld );

		}

		return this;

	}

}


// Keeps pointer movement data in 3D space projected onto a plane.
class ProjectedPointer {

	constructor( x = 0, y = 0, z = 0 ) {


		// TODO: optional grazing fix
		this.start = new Vector3();
		this.current = new Vector3();
		this.previous = new Vector3();
		this._movement = new Vector3();
		this._offset = new Vector3();
		this._intersection = new Vector3();
		this._axis = new Vector3();
		this._raycaster = new Raycaster();
		this.set( x, y, z );

	}
	get movement() {

		return this._movement.copy( this.current ).sub( this.previous );

	}
	get offset() {

		return this._offset.copy( this.current ).sub( this.start );

	}
	set( x, y, z ) {

		this.start.set( x, y, z );
		this.current.set( x, y, z );
		this.previous.set( x, y, z );
		return this;

	}
	projectOnPlane( ray, plane, minGrazingAngle = 20 ) {


		// Avoid projecting onto a plane at grazing angles
		const _rayStart = new Ray().copy( ray.start );
		const _rayCurrent = new Ray().copy( ray.current );
		const _rayPrevious = new Ray().copy( ray.previous );
		_rayStart.direction.normalize();
		_rayCurrent.direction.normalize();
		_rayPrevious.direction.normalize();
		const angleStart = Math.PI / 2 - _rayStart.direction.angleTo( plane.normal );
		const angleCurrent = Math.PI / 2 - _rayCurrent.direction.angleTo( plane.normal );


		// Grazing angle avoidance algorithm which prevents extreme transformation changes when principal transformation axis is sharply aligned with the camera.
		if ( minGrazingAngle && Math.abs( angleCurrent ) < Math.abs( angleStart ) ) {

			const minAngle = MathUtils.DEG2RAD * minGrazingAngle;
			const correctionAngle = Math.abs( angleStart ) > minAngle ? 0 : ( - angleStart + ( angleStart >= 0 ? minAngle : - minAngle ) );
			this._axis.copy( _rayStart.direction ).cross( plane.normal ).normalize();
			this._raycaster.set( _rayStart.origin, _rayStart.direction );
			this._raycaster.ray.intersectPlane( plane, this._intersection );
			_rayStart.origin.sub( this._intersection ).applyAxisAngle( this._axis, correctionAngle ).add( this._intersection );
			_rayStart.direction.applyAxisAngle( this._axis, correctionAngle );
			_rayCurrent.origin.sub( this._intersection ).applyAxisAngle( this._axis, correctionAngle ).add( this._intersection );
			_rayCurrent.direction.applyAxisAngle( this._axis, correctionAngle );
			_rayPrevious.origin.sub( this._intersection ).applyAxisAngle( this._axis, correctionAngle ).add( this._intersection );
			_rayPrevious.direction.applyAxisAngle( this._axis, correctionAngle );

		}

		this._raycaster.set( _rayStart.origin, _rayStart.direction );
		this._raycaster.ray.intersectPlane( plane, this.start );
		this._raycaster.set( _rayCurrent.origin, _rayCurrent.direction );
		this._raycaster.ray.intersectPlane( plane, this.current );
		this._raycaster.set( _rayPrevious.origin, _rayPrevious.direction );
		this._raycaster.ray.intersectPlane( plane, this.previous );
		return this;

	}

}


/**
 * Keeps track of pointer movements and handles coordinate conversions to various 2D and 3D spaces.
 * It handles pointer raycasting to various 3D planes at camera's target position.
 */
export class PointerTracker {

	constructor( pointerEvent, camera ) {


		// Used to distinguish a special "simulated" pointer used to actuate inertial gestures with damping.
		this.isSimulated = false;

		// 2D pointer with coordinates in canvas-space ( pixels )
		this.canvas = new CanvasPointer();

		// 2D pointer with coordinates in view-space ( [-1...1] range )
		this.view = new ViewPointer();

		// 6D pointer with coordinates in world-space ( origin, direction )
		this.ray = new RayPointer();

		// 3D pointer with coordinates in 3D-space from ray projected onto a plane facing x-axis.
		this._projected = new ProjectedPointer();
		this._intersection = new Vector3();
		this._raycaster = new Raycaster();
		this._intersectedObjects = [];
		this._camera = camera;
		this._pointerEvent = pointerEvent;

		// Set canvas-space pointer from PointerEvent data.
		const rect = this.domElement.getBoundingClientRect();
		this.canvas.set( pointerEvent.clientX - rect.left, pointerEvent.clientY - rect.top );
		const view = new ViewPointer();
		const ray = new RayPointer();

		Object.defineProperty( this, 'view', {
			get: () => view.update( this.canvas, this.domElement )
		} );

		Object.defineProperty( this, 'ray', {
			get: () => ray.update( this._camera, this.view )
		} );

	}
	get button() {

		switch ( this._pointerEvent.buttons ) {

			case 1:
				return 0;

			case 2:
				return 2;

			case 4:
				return 1;

			default:
				return - 1;

		}

	}
	get buttons() {

		return this._pointerEvent.buttons;

	}
	get altKey() {

		return this._pointerEvent.altKey;

	}
	get ctrlKey() {

		return this._pointerEvent.ctrlKey;

	}
	get metaKey() {

		return this._pointerEvent.metaKey;

	}
	get shiftKey() {

		return this._pointerEvent.shiftKey;

	}
	get domElement() {

		return this._pointerEvent.target;

	}
	get pointerId() {

		return this._pointerEvent.pointerId;

	}
	get type() {

		return this._pointerEvent.type;

	}

	// Updates the pointer with the lastest pointerEvent and camera.
	update( pointerEvent, camera ) {

		debug: {

			if ( this.pointerId !== pointerEvent.pointerId ) {

				console.error( 'Invalid pointerId!' );
				return;

			}

		}

		this._camera = camera;
		this._pointerEvent = pointerEvent;
		const rect = this.domElement.getBoundingClientRect();
		this.canvas.update( pointerEvent.clientX - rect.left, pointerEvent.clientY - rect.top );

	}

	// Simmulates inertial movement by applying damping to previous movement. For special **simmulated** pointer only!
	simmulateDamping( dampingFactor, deltaTime ) {

		debug: {

			if ( ! this.isSimulated ) {

				console.error( 'Cannot invoke `simmulateDamping()` on non-simmulated PointerTracker!' );

			}

		}

		if ( ! this.isSimulated )
			return;

		const damping = Math.pow( 1 - dampingFactor, deltaTime * 60 / 1000 );
		this.canvas.update( this.canvas.current.x + this.canvas.movement.x * damping, this.canvas.current.y + this.canvas.movement.y * damping );

	}

	// Projects tracked pointer onto a plane object-space.
	projectOnPlane( plane, minGrazingAngle ) {

		return this._projected.projectOnPlane( this.ray, plane, minGrazingAngle );

	}

	// Intersects specified objects with **current** view-space pointer vector.
	intersectObjects( objects ) {

		this._raycaster.setFromCamera( this.view.current, this._camera );
		this._intersectedObjects.length = 0;
		this._raycaster.intersectObjects( objects, true, this._intersectedObjects );
		return this._intersectedObjects;

	}

	// Intersects specified plane with **current** view-space pointer vector.
	intersectPlane( plane ) {

		this._raycaster.setFromCamera( this.view.current, this._camera );
		this._raycaster.ray.intersectPlane( plane, this._intersection );
		return this._intersection;

	}

	// Clears pointer movement
	clearMovement() {

		this.canvas.previous.copy( this.canvas.current );
		this.canvas.movement.set( 0, 0 );

	}

}


// Virtual "center" pointer tracker for multi-touch gestures.
class CenterPointerTracker extends PointerTracker {

	constructor( pointerEvent, camera ) {

		super( pointerEvent, camera );

		// Array of pointers to calculate centers from
		this._pointers = [];


		// Set center pointer read-only "type" and "pointerId" properties.
		Object.defineProperties( this, {
			type: { value: 'virtual' },
			pointerId: { value: - 1 },
		} );


		// Reusable pointer variables.
		const canvas = new CanvasPointer();
		const view = new ViewPointer();


		// Getter for center pointer converted to canvas space.
		Object.defineProperty( this, 'canvas', {
			get: () => {

				canvas.set( 0, 0 );

				for ( let i = 0; i < this._pointers.length; i ++ ) {

					canvas.start.add( this._pointers[ i ].canvas.start );
					canvas.current.add( this._pointers[ i ].canvas.current );
					canvas.previous.add( this._pointers[ i ].canvas.previous );

				}

				if ( this._pointers.length > 1 ) {

					canvas.start.divideScalar( this._pointers.length );
					canvas.current.divideScalar( this._pointers.length );
					canvas.previous.divideScalar( this._pointers.length );

				}

				return canvas;

			}
		} );


		// Getter for center pointer converted to view space.
		Object.defineProperty( this, 'view', {
			get: () => {

				view.set( 0, 0 );

				for ( let i = 0; i < this._pointers.length; i ++ ) {

					view.start.add( this._pointers[ i ].view.start );
					view.current.add( this._pointers[ i ].view.current );
					view.previous.add( this._pointers[ i ].view.previous );

				}

				if ( this._pointers.length > 1 ) {

					view.start.divideScalar( this._pointers.length );
					view.current.divideScalar( this._pointers.length );
					view.previous.divideScalar( this._pointers.length );

				}

				return view;

			}
		} );

	}
	projectOnPlane( plane, minGrazingAngle ) {

		this._projected.set( 0, 0, 0 );

		for ( let i = 0; i < this._pointers.length; i ++ ) {

			const projected = this._pointers[ i ].projectOnPlane( plane, minGrazingAngle );
			this._projected.start.add( projected.start );
			this._projected.current.add( projected.current );
			this._projected.previous.add( projected.previous );

		}

		if ( this._pointers.length > 1 ) {

			this._projected.start.divideScalar( this._pointers.length );
			this._projected.current.divideScalar( this._pointers.length );
			this._projected.previous.divideScalar( this._pointers.length );

		}

		return this._projected;

	}

	// Updates the internal array of pointers necessary to calculate the centers.
	updateCenter( pointers ) {

		this._pointers = pointers;

	}

}


/**
 * Internal animation manager.
 * It runs requestAnimationFrame loop whenever there are animation callbacks in the internal queue.
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

	// Starts animation loop when there are callbacks in the queue
	_start() {

		this._time = performance.now();
		this._running = true;
		requestAnimationFrame( this._update );

	}

	// Stops animation loop when the callbacks queue is empty
	_stop() {

		this._running = false;

	}

	// Invokes all animation callbacks in the queue with timestep (dt)
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
