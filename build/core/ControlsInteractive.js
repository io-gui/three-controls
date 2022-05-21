import { Plane } from 'three';
import { PointerTracker, CenterPointerTracker } from './Pointers.js';
import { ControlsBase } from './ControlsBase.js';

const INERTIA_TIME_THRESHOLD = 100;
const INERTIA_MOVEMENT_THRESHOLD = 0.01;


/**
 * `ControlsInteractive`: Generic class for interactive threejs viewport controls. It solves some of the most common and complex problems in threejs control designs.
 *
 * ### Pointer Tracking ###
 *
 * - Captures most relevant pointer and keyboard events and fixes some platform-specific bugs and discrepancies.
 * - Serves as a proxy dispatcher for pointer and keyboard events:
 *   "contextmenu", "wheel", "pointerdown", "pointermove", "pointerup", "keydown", "keyup"
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
 * ### ControlsInteractive Livecycle ###
 *
 * - Adds/removes event listeners during lifecycle and on `enabled` property change.
 * - Stops current animations when `enabled` property is set to `false`.
 * - Takes care of the event listener cleanup when `dipose()` method is called.
 * - Emits lyfecycle events: "enabled", "disabled", "dispose"
 */
export class ControlsInteractive extends ControlsBase {

	xr;

	// Public API
	enabled = true;
	enableDamping = false;
	dampingFactor = 0.05;

	// Tracked pointers and keys
	_hoverPointer = null;
	_centerPointer = null;
	_simulatedPointer = null;
	_pointers = [];
	_xrControllers = [];
	_xrPointers = [];
	_keys = [];
	_plane = new Plane();
	_viewports = [];
	_viewportCameras = new WeakMap();
	constructor( camera, domElement ) {

		super( camera, domElement );

		this.onBeforeRender = ( renderer ) => {

			this.xr = renderer.xr;

		};


		// Bind handler functions
		this._preventDefault = this._preventDefault.bind( this );
		this._onContextMenu = this._onContextMenu.bind( this );
		this._onWheel = this._onWheel.bind( this );
		this._onPointerDown = this._onPointerDown.bind( this );
		this._onPointerMove = this._onPointerMove.bind( this );
		this._onPointerSimulation = this._onPointerSimulation.bind( this );
		this._onPointerUp = this._onPointerUp.bind( this );
		this._onKeyDown = this._onKeyDown.bind( this );
		this._onKeyUp = this._onKeyUp.bind( this );
		this._onDragOver = this._onDragOver.bind( this );
		this._onDrop = this._onDrop.bind( this );
		this._connect = this._connect.bind( this );
		this._disconnect = this._disconnect.bind( this );
		this._connectXR = this._connectXR.bind( this );
		this._disconnectXR = this._disconnectXR.bind( this );
		this._onXRControllerDown = this._onXRControllerDown.bind( this );
		this._onXRControllerMove = this._onXRControllerMove.bind( this );
		this._onXRControllerUp = this._onXRControllerUp.bind( this );
		this.observeProperty( 'enabled' );
		this.observeProperty( 'xr' );
		this.registerViewport( camera, domElement );

	}
	enabledChanged( value ) {

		value ? this._connect() : this._disconnect();

	}
	xrChanged( value ) {

		value ? this._connectXR() : this._disconnectXR();

	}
	registerViewport( camera, domElement ) {

		this._viewports.push( domElement );
		this._viewportCameras.set( domElement, camera );
		this._connectViewport( domElement );

	}
	_connectViewport( domElement ) {

		domElement.addEventListener( 'contextmenu', this._onContextMenu, false );
		domElement.addEventListener( 'wheel', this._onWheel, { capture: false, passive: false } );
		domElement.addEventListener( 'touchdown', this._preventDefault, { capture: false, passive: false } );
		domElement.addEventListener( 'touchmove', this._preventDefault, { capture: false, passive: false } );
		domElement.addEventListener( 'pointerdown', this._onPointerDown );
		domElement.addEventListener( 'pointermove', this._onPointerMove, { capture: true } );
		domElement.addEventListener( 'pointerup', this._onPointerUp, false );
		domElement.addEventListener( 'keydown', this._onKeyDown, false );
		domElement.addEventListener( 'keyup', this._onKeyUp, false );
		domElement.addEventListener( 'dragover', this._onDragOver, false );
		domElement.addEventListener( 'drop', this._onDrop, false );

	}
	_disconnectViewport( domElement ) {

		domElement.removeEventListener( 'contextmenu', this._onContextMenu, false );
		domElement.removeEventListener( 'wheel', this._onWheel );
		domElement.removeEventListener( 'touchdown', this._preventDefault );
		domElement.removeEventListener( 'touchmove', this._preventDefault );
		domElement.removeEventListener( 'pointerdown', this._onPointerDown );
		domElement.removeEventListener( 'pointermove', this._onPointerMove );
		domElement.removeEventListener( 'pointerup', this._onPointerUp, false );
		domElement.removeEventListener( 'keydown', this._onKeyDown, false );
		domElement.removeEventListener( 'keyup', this._onKeyUp, false );
		domElement.removeEventListener( 'dragover', this._onDragOver, false );
		domElement.removeEventListener( 'drop', this._onDrop, false );


		// Release all captured pointers
		for ( let i = 0; i < this._pointers.length; i ++ ) {

			domElement.releasePointerCapture( this._pointers[ i ].pointerId );

		}

	}
	_connect() {

		for ( let i = 0; i < this._viewports.length; i ++ ) {

			this._connectViewport( this._viewports[ i ] );

		}

		if ( this.xr )
			this._connectXR();

	}
	_disconnect() {

		for ( let i = 0; i < this._viewports.length; i ++ ) {

			this._disconnectViewport( this._viewports[ i ] );

		}

		this._disconnectXR();

		// Stop all animations
		this.stopAllAnimations();

		// Clear current pointers and keys
		this._pointers.length = 0;
		this._keys.length = 0;

	}
	_connectXR() {

		if ( this.xr && this.domElement ) {

			this._xrControllers = [
				this.xr.getController( 0 ),
				this.xr.getController( 1 )
			];

			this._xrControllers[ 0 ].addEventListener( 'selectstart', this._onXRControllerDown );
			this._xrControllers[ 0 ].addEventListener( 'controllermove', this._onXRControllerMove );
			this._xrControllers[ 0 ].addEventListener( 'selectend', this._onXRControllerUp );
			this._xrControllers[ 1 ].addEventListener( 'selectstart', this._onXRControllerDown );
			this._xrControllers[ 1 ].addEventListener( 'controllermove', this._onXRControllerMove );
			this._xrControllers[ 1 ].addEventListener( 'selectend', this._onXRControllerUp );

			const event = {
				target: this.domElement,
				type: 'XRController',
				clientX: this.domElement.clientWidth / 2,
				clientY: this.domElement.clientHeight / 2,
			};

			this._xrPointers = [
				new PointerTracker( Object.assign( { pointerId: 0 }, event ), this._xrControllers[ 0 ] ),
				new PointerTracker( Object.assign( { pointerId: 1 }, event ), this._xrControllers[ 1 ] ),
			];

		}

	}
	_disconnectXR() {

		if ( this._xrControllers.length ) {

			this._xrControllers[ 0 ].removeEventListener( 'selectstart', this._onXRControllerDown );
			this._xrControllers[ 0 ].removeEventListener( 'controllermove', this._onXRControllerMove );
			this._xrControllers[ 0 ].removeEventListener( 'selectend', this._onXRControllerUp );
			this._xrControllers[ 1 ].removeEventListener( 'selectstart', this._onXRControllerDown );
			this._xrControllers[ 1 ].removeEventListener( 'controllermove', this._onXRControllerMove );
			this._xrControllers[ 1 ].removeEventListener( 'selectend', this._onXRControllerUp );

		}

	}
	_onXRControllerMove( controllerEvent ) {

		const index = this._xrControllers.indexOf( controllerEvent.target );
		const xrPointer = this._xrPointers[ index ];
		xrPointer.updateByXRController( controllerEvent.target );

		if ( xrPointer.buttons ) {

			this.onTrackedPointerMove( xrPointer, [ xrPointer ], xrPointer );

		} else {

			this.onTrackedPointerHover( xrPointer, [ xrPointer ] );

		}

	}
	_onXRControllerDown( controllerEvent ) {

		const index = this._xrControllers.indexOf( controllerEvent.target );
		const xrPointer = this._xrPointers[ index ];
		xrPointer.buttons = 1;
		xrPointer.setByXRController( controllerEvent.target );
		this.onTrackedPointerDown( xrPointer, [ xrPointer ] );

	}
	_onXRControllerUp( controllerEvent ) {

		const index = this._xrControllers.indexOf( controllerEvent.target );
		const xrPointer = this._xrPointers[ index ];
		xrPointer.buttons = 0;
		this.onTrackedPointerUp( xrPointer, [ xrPointer ] );

	}

	// Disables controls and triggers internal _disconnect method to stop animations, diconnects listeners and clears pointer arrays. Dispatches 'dispose' event.
	dispose() {

		this._disconnect();
		super.dispose();

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

		const path = ( event.path || ( event.composedPath && event.composedPath() ) );
		const domElement = path.find( element => this._viewports.indexOf( element ) !== - 1 );

		// const domElement = event.target as HTMLElement;
		const camera = this._viewportCameras.get( domElement );

		if ( this._simulatedPointer ) {

			this._simulatedPointer.clearMovement();
			this._simulatedPointer = null;
			this.stopAnimation( this._onPointerSimulation );

		}

		domElement.focus ? domElement.focus() : window.focus();
		domElement.setPointerCapture( event.pointerId );
		const pointers = this._pointers;
		const pointer = new PointerTracker( event, camera );
		pointer.clearMovement(); // TODO: investigate why this is necessary
		pointers.push( pointer );
		this.onTrackedPointerDown( pointer, pointers );
		this.dispatchEvent( event );

	}
	_onPointerMove( event ) {

		const path = ( event.path || ( event.composedPath && event.composedPath() ) );
		const domElement = path.find( element => this._viewports.indexOf( element ) !== - 1 );

		// const domElement = event.target as HTMLElement;
		const camera = this._viewportCameras.get( domElement );
		const pointers = this._pointers;
		const index = pointers.findIndex( pointer => pointer.pointerId === event.pointerId );
		let pointer = pointers[ index ];

		if ( pointer ) {

			pointer.update( event, camera );
			const x = Math.abs( pointer.view.current.x );
			const y = Math.abs( pointer.view.current.y );


			// Workaround for https://bugs.chromium.org/p/chromium/issues/detail?id=1131348
			if ( pointer.button !== 0 && ( x > 1 || x < 0 || y > 1 || y < 0 ) ) {

				pointers.splice( index, 1 );
				domElement.releasePointerCapture( event.pointerId );
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

			this._centerPointer = this._centerPointer || new CenterPointerTracker( event, camera );
			this._centerPointer.updateCenter( pointers );

			// TODO: consider throttling once per frame. On Mac pointermove fires up to 120 Hz.
			this.onTrackedPointerMove( pointer, pointers, this._centerPointer );

		} else if ( this._hoverPointer && this._hoverPointer.pointerId === event.pointerId ) {

			pointer = this._hoverPointer;
			pointer.update( event, camera );
			this.onTrackedPointerHover( pointer, [ pointer ] );

		} else {

			pointer = this._hoverPointer = new PointerTracker( event, camera );
			this.onTrackedPointerHover( pointer, [ pointer ] );

		}

		this.dispatchEvent( event );

	}
	_onPointerSimulation( timeDelta ) {

		if ( this._simulatedPointer ) {

			const pointer = this._simulatedPointer;
			pointer.simmulateDamping( this.dampingFactor, timeDelta );

			if ( pointer.view.movement.length() > 0.00005 ) {

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

		const path = ( event.path || ( event.composedPath && event.composedPath() ) );
		const domElement = path.find( element => this._viewports.indexOf( element ) !== - 1 );

		// const domElement = event.target as HTMLElement;
		// TODO: three-finger drag on Mac touchpad producing delayed pointerup.
		const pointers = this._pointers;
		const index = pointers.findIndex( pointer => pointer.pointerId === event.pointerId );
		const pointer = pointers[ index ];

		if ( pointer ) {

			pointers.splice( index, 1 );
			domElement.releasePointerCapture( event.pointerId );

			// Prevents residual inertia with three-finger-drag on MacOS/touchpad
			const timeDelta = Date.now() - pointer.timestamp;
			const viewDelta = pointer.view.movement.length();

			if ( this.enableDamping && timeDelta < INERTIA_TIME_THRESHOLD && viewDelta > INERTIA_MOVEMENT_THRESHOLD ) {

				this._simulatedPointer = pointer;
				this._simulatedPointer.isSimulated = true;
				this.startAnimation( this._onPointerSimulation );

			} else {

				this.onTrackedPointerUp( pointer, pointers );
				this.onTrackedPointerHover( pointer, pointers );

			}

		}

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
	_onDragOver( event ) {

		event.preventDefault();
		const path = ( event.path || ( event.composedPath && event.composedPath() ) );
		const domElement = path.find( element => this._viewports.indexOf( element ) !== - 1 );
		const camera = this._viewportCameras.get( domElement );
		const pointer = new PointerTracker( event, camera );
		this.onTrackedDragOver( pointer, [ pointer ] );
		this.dispatchEvent( event );

	}
	_onDrop( event ) {

		event.preventDefault();
		const path = ( event.path || ( event.composedPath && event.composedPath() ) );
		const domElement = path.find( element => this._viewports.indexOf( element ) !== - 1 );
		const camera = this._viewportCameras.get( domElement );
		const pointer = new PointerTracker( event, camera );
		this.onTrackedDrop( pointer, [ pointer ] );
		this.dispatchEvent( event );

	}

	// Tracked pointer handlers
	onTrackedPointerDown( _pointer, _pointers ) { }
	onTrackedPointerMove( _pointer, _pointers, _centerPointer ) { }
	onTrackedPointerHover( _pointer, _pointers ) { }
	onTrackedPointerUp( _pointer, _pointers ) { }
	onTrackedKeyDown( code, codes ) { }
	onTrackedKeyUp( code, codes ) { }
	onTrackedKeyChange( code, codes ) { }
	onTrackedDragOver( _pointer, _pointers ) { }
	onTrackedDrop( _pointer, _pointers ) { }

}

//# sourceMappingURL=ControlsInteractive.js.map
