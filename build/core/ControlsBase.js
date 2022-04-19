import { Vector3, Quaternion, OrthographicCamera, Object3D } from 'three';

export const UNIT = {
	ZERO: Object.freeze( new Vector3( 0, 0, 0 ) ),
	X: Object.freeze( new Vector3( 1, 0, 0 ) ),
	Y: Object.freeze( new Vector3( 0, 1, 0 ) ),
	Z: Object.freeze( new Vector3( 0, 0, 1 ) ),
};


// TODO: make rAF compatible with WebXR
/**
 * `ControlsBase`: Base class for Objects with observable properties, change events and animation.
 */
export class ControlsBase extends Object3D {

	camera;
	domElement;
	eye = new Vector3();
	cameraPosition = new Vector3();
	cameraQuaternion = new Quaternion();
	cameraScale = new Vector3();
	cameraOffset = new Vector3();
	worldPosition = new Vector3();
	worldQuaternion = new Quaternion();
	worldQuaternionInv = new Quaternion();
	worldScale = new Vector3();
	_animations = [];
	_eventTimeout = {};
	constructor( camera, domElement ) {

		super();
		this.camera = camera;
		this.domElement = domElement;
		this.changed = this.changed.bind( this );

	}

	/**
     * Adds property observing mechanism via getter and setter.
     * Also emits '[property]-changed' event and cummulative 'change' event on next rAF.
     */
	observeProperty( propertyKey ) {

		let value = this[ propertyKey ];

		Object.defineProperty( this, propertyKey, {
			get() {

				return value;

			},
			set( newValue ) {

				const oldValue = value;
				value = newValue;

				if ( newValue !== oldValue ) {

					this.dispatchEvent( { type: propertyKey + '-changed', property: propertyKey, value: newValue, oldValue: oldValue } );
					this.dispatchEvent( { type: 'change' } );

				}

			}
		} );

	}
	_invokeChangeHandlers( event ) {

		const type = event.type;

		if ( type === 'change' ) {

			this.changed();

		} else if ( type.endsWith( '-changed' ) ) {

			let handler = this[ event.property + 'Changed' ];

			if ( handler )
				handler = handler.bind( this );

			handler && handler( event.value, event.oldValue );

		}

	}
	dispatchEvent( event ) {

		const type = event.type;

		if ( ! this._eventTimeout[ type ] ) {

			super.dispatchEvent( event );
			this._invokeChangeHandlers( event );
			this._eventTimeout[ type ] = - 1;

			requestAnimationFrame( () => {

				this._eventTimeout[ type ] = 0;

			} );

		} else {

			cancelAnimationFrame( this._eventTimeout[ type ] );

			this._eventTimeout[ type ] = requestAnimationFrame( () => {

				this._eventTimeout[ type ] = 0;
				super.dispatchEvent( event );
				this._invokeChangeHandlers( event );

			} );

		}

	}
	changed() { }

	// Adds animation callback to animation loop.
	startAnimation( callback ) {

		const index = this._animations.findIndex( animation => animation === callback );

		if ( index === - 1 ) {

			callback( 1000 / 60 );
			this._animations.push( callback );

		}

		AnimationManagerSingleton.add( callback );

	}

	// Removes animation callback from animation loop.
	stopAnimation( callback ) {

		const index = this._animations.findIndex( animation => animation === callback );

		if ( index !== - 1 )
			this._animations.splice( index, 1 );

		AnimationManagerSingleton.remove( callback );

	}

	// Stops all animations.
	stopAllAnimations() {

		for ( let i = 0; i < this._animations.length; i ++ ) {

			this.stopAnimation( this._animations[ i ] );

		}

	}
	dispose() {

		if ( this.parent )
			this.parent.remove( this );

		this.stopAllAnimations();
		this.dispatchEvent( { type: 'dispose' } );

	}
	decomposeMatrices() {

		this.matrixWorld.decompose( this.worldPosition, this.worldQuaternion, this.worldScale );
		this.worldQuaternionInv.copy( this.worldQuaternion ).invert();
		this.camera.updateMatrixWorld();
		this.camera.matrixWorld.decompose( this.cameraPosition, this.cameraQuaternion, this.cameraScale );
		this.cameraOffset.copy( this.cameraPosition ).sub( this.worldPosition );

		if ( this.camera instanceof OrthographicCamera ) {

			this.eye.set( 0, 0, 1 ).applyQuaternion( this.cameraQuaternion );

		} else {

			this.eye.copy( this.cameraOffset ).normalize();

		}

	}
	updateMatrixWorld() {

		super.updateMatrixWorld();
		this.decomposeMatrices();

		// TODO: investigate why is this necessary.
		// Without this, TransformControls needs another update to reorient after "space" change.
		super.updateMatrixWorld();

	}

}


/**
 * Internal animation manager.
 * It runs requestAnimationFrame loop whenever there are animation callbacks in the internal queue.
 */
class AnimationManager {

	_queue = [];
	_running = false;
	_time = performance.now();
	constructor() {

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

//# sourceMappingURL=ControlsBase.js.map
