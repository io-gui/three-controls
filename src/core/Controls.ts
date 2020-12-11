import { Plane, Object3D, PerspectiveCamera, OrthographicCamera, Event as ThreeEvent, WebXRManager } from 'three';
import { PointerTracker, CenterPointerTracker } from './Pointers';
import { Base, Callback, EVENT } from './Base';

/**
 * `Controls`: Generic class for interactive threejs viewport controls. It solves some of the most common and complex problems in threejs control designs.
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
export class Controls extends Base {
  // Public API
  camera: PerspectiveCamera | OrthographicCamera;
  domElement: HTMLElement;
  enabled = true;
  xr: WebXRManager | null = null;
  enableDamping = false;
  dampingFactor = 0.05;
  // Tracked pointers and keys
  _hoverPointer: PointerTracker | null = null;
  _centerPointer: CenterPointerTracker | null = null;
  _simulatedPointer: PointerTracker | null = null;
  _pointers: PointerTracker[] = [];
  _xrControllers: Object3D[] = [];
  _xrPointers: PointerTracker[] = [];
  _keys: number[] = [];
  protected readonly _plane = new Plane();
  constructor( camera: PerspectiveCamera | OrthographicCamera, domElement: HTMLElement ) {
    super();

    this.camera = camera;
    this.domElement = domElement;

    // Runtime contructor arguments check 
    if ( this.camera === undefined ) console.warn( 'THREE.Controls: "camera" parameter is now mandatory!' );
    if ( !( this.camera instanceof PerspectiveCamera ) && !( this.camera instanceof OrthographicCamera ) ) console.warn( 'THREE.Controls: Unsupported camera type!' );
    if ( this.domElement === undefined ) console.warn( 'THREE.Controls: "domElement" parameter is now mandatory!' );
    if ( this.domElement === document as unknown ) console.error( 'THREE.Controls: "domElement" should be "renderer.domElement"!' );

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
    this._onXRControllerDown = this._onXRControllerDown.bind( this );
    this._onXRControllerMove = this._onXRControllerMove.bind( this );
    this._onXRControllerUp = this._onXRControllerUp.bind( this );

    this.observeProperty( 'enabled', this._connect, this._disconnect );
    this.observeProperty( 'xr', this._connectXR, this._disconnectXR );

    this._connect();
  }
  _connect() {
    this.domElement.addEventListener( 'contextmenu', this._onContextMenu, false );
    this.domElement.addEventListener( 'wheel', this._onWheel, {capture: false, passive: false });
    this.domElement.addEventListener( 'touchdown', this._preventDefault, {capture: false, passive: false });
    this.domElement.addEventListener( 'touchmove', this._preventDefault, {capture: false, passive: false });
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
    if ( this.xr ) this._connectXR();
  }
  _disconnect() {
    this.domElement.removeEventListener( 'contextmenu', this._onContextMenu, false );
    this.domElement.removeEventListener( 'wheel', this._onWheel);
    this.domElement.removeEventListener( 'touchdown', this._preventDefault);
    this.domElement.removeEventListener( 'touchmove', this._preventDefault);
    this.domElement.removeEventListener( 'pointerdown', this._onPointerDown);
    this.domElement.removeEventListener( 'pointermove', this._onPointerMove);
    this.domElement.removeEventListener( 'pointerleave', this._onPointerLeave, false );
    this.domElement.removeEventListener( 'pointercancel', this._onPointerCancel, false );
    this.domElement.removeEventListener( 'pointerup', this._onPointerUp, false );
    this.domElement.removeEventListener( 'keydown', this._onKeyDown, false );
    this.domElement.removeEventListener( 'keyup', this._onKeyUp, false );
    this._disconnectXR();
    // Release all captured pointers
    for ( let i = 0; i < this._pointers.length; i++ ) {
      this.domElement.releasePointerCapture( this._pointers[i].pointerId );
    }
    // Stop all animations
    this.stopAllAnimation();
    // Clear current pointers and keys
    this._pointers.length = 0;
    this._keys.length = 0;
  }
  _connectXR() {
    if (this.xr) {
      this._xrControllers = [
        this.xr.getController( 0 ),
        this.xr.getController( 1 )
      ];
      this._xrControllers[ 0 ].addEventListener( 'selectstart', this._onXRControllerDown );
      this._xrControllers[ 0 ].addEventListener( 'change', this._onXRControllerMove );
      this._xrControllers[ 0 ].addEventListener( 'selectend', this._onXRControllerUp );
      this._xrControllers[ 1 ].addEventListener( 'selectstart', this._onXRControllerDown );
      this._xrControllers[ 1 ].addEventListener( 'change', this._onXRControllerMove );
      this._xrControllers[ 1 ].addEventListener( 'selectend', this._onXRControllerUp );

      const event = {
        target: this.domElement,
        type: 'XRController',
        clientX: this.domElement.clientWidth / 2,
        clientY: this.domElement.clientHeight / 2,
      }
      this._xrPointers = [
        new PointerTracker( Object.assign( { pointerId: 0 }, event ) as unknown as PointerEvent, this._xrControllers[ 0 ] ),
        new PointerTracker( Object.assign( { pointerId: 1 }, event ) as unknown as PointerEvent, this._xrControllers[ 1 ] ),
      ]
    }
  }
  _disconnectXR() {
    if (this._xrControllers.length) {
      this._xrControllers[ 0 ].removeEventListener( 'selectstart', this._onXRControllerDown );
      this._xrControllers[ 0 ].removeEventListener( 'change', this._onXRControllerMove );
      this._xrControllers[ 0 ].removeEventListener( 'selectend', this._onXRControllerUp );
      this._xrControllers[ 1 ].removeEventListener( 'selectstart', this._onXRControllerDown );
      this._xrControllers[ 1 ].removeEventListener( 'change', this._onXRControllerMove );
      this._xrControllers[ 1 ].removeEventListener( 'selectend', this._onXRControllerUp );
    }
  }
  _onXRControllerMove( controllerEvent: ThreeEvent ) {
    const index = this._xrControllers.indexOf( controllerEvent.target );
    const xrPointer = this._xrPointers[ index ];
    xrPointer.updateByXRController( controllerEvent.target );
    if ( xrPointer.buttons ) {
      this.onTrackedPointerMove( xrPointer, [ xrPointer ], xrPointer as CenterPointerTracker );
    } else {
      this.onTrackedPointerHover( xrPointer, [ xrPointer ] );
    }
  }
  _onXRControllerDown( controllerEvent: ThreeEvent ) {
    const index = this._xrControllers.indexOf( controllerEvent.target );
    const xrPointer = this._xrPointers[ index ];
    xrPointer.buttons = 1;
    xrPointer.setByXRController( controllerEvent.target );
    this.onTrackedPointerDown( xrPointer, [ xrPointer ] );
  }
  _onXRControllerUp( controllerEvent: ThreeEvent ) {
    const index = this._xrControllers.indexOf( controllerEvent.target );
    const xrPointer = this._xrPointers[ index ];
    xrPointer.buttons = 0;
    this.onTrackedPointerUp( xrPointer, [ xrPointer ] );
  }

  // Disables controls and triggers internal _disconnect method to stop animations, diconnects listeners and clears pointer arrays. Dispatches 'dispose' event.
  dispose() {
    this.enabled = false;
    this.dispatchEvent( EVENT.DISPOSE );
  }
  // EventDispatcher.addEventListener with added deprecation warnings.
  addEventListener( type: string, listener: Callback ) {
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
  _preventDefault( event: Event ) {
    event.preventDefault();
  }
  _onContextMenu( event: Event ) {
    this.dispatchEvent( event );
  }
  _onWheel( event: WheelEvent ) {
    this.dispatchEvent( event );
  }
  _onPointerDown( event: PointerEvent ) {
    if ( this._simulatedPointer ) {
      this._simulatedPointer.clearMovement();
      this._simulatedPointer = null;
      this.stopAnimation( this._onPointerSimulation as Callback );
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
  _onPointerMove( event: PointerEvent ) {
    const pointers = this._pointers;
    const index = pointers.findIndex( pointer => pointer.pointerId === event.pointerId );
    let pointer = pointers[index];
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
      for ( let i = 0; i < pointers.length; i++ ) {
        if ( pointer.pointerId !== pointers[i].pointerId ) {
          pointers[i].clearMovement(); // TODO: unhack
        }
      }

      this._centerPointer = this._centerPointer || new CenterPointerTracker( event, this.camera );
      this._centerPointer.updateCenter( pointers );
      // TODO: consider throttling once per frame. On Mac pointermove fires up to 120 Hz.
      this.onTrackedPointerMove( pointer, pointers, this._centerPointer );
    } else if ( this._hoverPointer && this._hoverPointer.pointerId === event.pointerId ) {
      pointer = this._hoverPointer;
      pointer.update( event, this.camera );
      this.onTrackedPointerHover( pointer, [pointer] );
    } else {
      pointer = this._hoverPointer = new PointerTracker( event, this.camera );
      this.onTrackedPointerHover( pointer, [pointer] );
    }
    this.dispatchEvent( event );
  }
  _onPointerSimulation( timeDelta: number ) {
    if ( this._simulatedPointer ) {
      const pointer = this._simulatedPointer;
      pointer.simmulateDamping( this.dampingFactor, timeDelta );
      if ( pointer.view.movement.length() > 0.00005 ) {
        this.onTrackedPointerMove( pointer, [pointer], pointer as CenterPointerTracker );
      } else {
        this._simulatedPointer = null
        this.onTrackedPointerUp( pointer, [] );
        this.stopAnimation( this._onPointerSimulation as Callback );
      }
    } else {
      this.stopAnimation( this._onPointerSimulation as Callback );
    }
  }
  _onPointerUp( event: PointerEvent ) {
    // TODO: three-finger drag on Mac touchpad producing delayed pointerup.
    const pointers = this._pointers;
    const index = pointers.findIndex( pointer => pointer.pointerId === event.pointerId );
    const pointer = pointers[index];
    if ( pointer ) {
      pointers.splice( index, 1 );
      this.domElement.releasePointerCapture( event.pointerId );
      if ( this.enableDamping ) {
        this._simulatedPointer = pointer;
        this._simulatedPointer.isSimulated = true;
        this.startAnimation( this._onPointerSimulation as Callback );
      } else {
        this.onTrackedPointerUp( pointer, pointers );
      }
    }
    this.dispatchEvent( event );
  }
  _onPointerLeave( event: PointerEvent ) {
    const pointers = this._pointers;
    const index = pointers.findIndex( pointer => pointer.pointerId === event.pointerId );
    const pointer = pointers[index];
    if ( pointer ) {
      pointers.splice( index, 1 );
      this.domElement.releasePointerCapture( event.pointerId );
      this.onTrackedPointerUp( pointer, pointers );
    }
    this.dispatchEvent( event );
  }
  _onPointerCancel( event: PointerEvent ) {
    const pointers = this._pointers;
    const index = pointers.findIndex( pointer => pointer.pointerId === event.pointerId );
    const pointer = pointers[index];
    if ( pointer ) {
      pointers.splice( index, 1 );
      this.domElement.releasePointerCapture( event.pointerId );
      this.onTrackedPointerUp( pointer, pointers );
    }
    this.dispatchEvent( event );
  }
  _onPointerOver( event: PointerEvent ) {
    this.dispatchEvent( event );
  }
  _onPointerEnter( event: PointerEvent ) {
    this.dispatchEvent( event );
  }
  _onPointerOut( event: PointerEvent ) {
    this.dispatchEvent( event );
  }
  _onKeyDown( event: KeyboardEvent ) {
    const code = Number( event.code );
    const keys = this._keys;
    const index = keys.findIndex( key => key === code );
    if ( index === -1 ) keys.push( code );
    if ( !event.repeat ) {
      this.onTrackedKeyDown( code, keys );
      this.onTrackedKeyChange( code, keys );
    }
    this.dispatchEvent( event );
  }
  _onKeyUp( event: KeyboardEvent ) {
    const code = Number( event.code );
    const keys = this._keys;
    const index = keys.findIndex( key => key === code );
    if ( index !== -1 ) keys.splice( index, 1 );
    this.onTrackedKeyUp( code, keys );
    this.onTrackedKeyChange( code, keys );
    this.dispatchEvent( event );
  }

  // Tracked pointer handlers

  /* eslint-disable @typescript-eslint/no-empty-function */
  /* eslint-disable @typescript-eslint/no-unused-vars */
  /* eslint-disable no-unused-vars */
  onTrackedPointerDown( _pointer: PointerTracker, _pointers: PointerTracker[] ) {}
  onTrackedPointerMove( _pointer: PointerTracker, _pointers: PointerTracker[], _centerPointer: CenterPointerTracker ) {}
  onTrackedPointerHover( _pointer: PointerTracker, _pointers: PointerTracker[] ) {}
  onTrackedPointerUp( _pointer: PointerTracker, _pointers: PointerTracker[] ) {}
  onTrackedKeyDown( code: number, codes: number[] ) {}
  onTrackedKeyUp( code: number, codes: number[] ) {}
  onTrackedKeyChange( code: number, codes: number[] ) {}
  /* eslint-enable @typescript-eslint/no-empty-function */
  /* eslint-enable @typescript-eslint/no-unused-vars */
  /* eslint-enable no-unused-vars */
}