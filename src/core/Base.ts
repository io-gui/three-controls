import { Vector3, Quaternion, WebGLRenderer, Scene, PerspectiveCamera, OrthographicCamera, Camera } from 'three';

import { Mesh, Event as ThreeEvent } from 'three';

export type Callback = ( callbackValue?: any, callbackOldValue?: any ) => void;
export type AnyCameraType = Camera | PerspectiveCamera | OrthographicCamera;

export const EVENT: Record<string, ThreeEvent> = {
  CHANGE: { type: 'change' },
  START: { type: 'start' },
  END: { type: 'end' },
  DISPOSE: { type: 'dispose' },
};

export const UNIT = {
  ZERO: Object.freeze(new Vector3( 0, 0, 0 )),
  X: Object.freeze(new Vector3( 1, 0, 0 )),
  Y: Object.freeze(new Vector3( 0, 1, 0 )),
  Z: Object.freeze(new Vector3( 0, 0, 1 )),
}

/**
 * `Base`: Base class for Objects with observable properties, change events and animation.
 */
export class Base extends Mesh {
  camera?: AnyCameraType;
  readonly eye = new Vector3();
  protected readonly _cameraPosition = new Vector3();
  protected readonly _cameraQuaternion = new Quaternion();
  protected readonly _cameraScale = new Vector3();
  protected readonly _cameraOffset = new Vector3();
  protected readonly _worldPosition = new Vector3();
  protected readonly _worlQuaternion = new Quaternion();
  protected readonly _worldScale = new Vector3();
  protected needsAnimationFrame = false;
  private readonly _animations: Callback[] = [];
  private _animationFrame = 0;
  protected _changeDispatched = false;
  constructor() {
    super();
    this._onAnimationFrame = this._onAnimationFrame.bind( this );

    this.onBeforeRender = ( renderer: WebGLRenderer, scene: Scene, camera: Camera ) => {
      if ( this.camera !== camera ) this.camera = camera;
    }

    this.observeProperty( 'needsAnimationFrame' );
    this.needsAnimationFrame = true;
  }
  /**
   * Adds property observing mechanism via getter and setter.
   * Also emits '[property]-changed' event and cummulative 'change' event on next rAF.
   */
  observeProperty( propertyKey: string ): void {
    let value: any = this[ propertyKey as keyof Base ];
    let callback = this[ propertyKey + 'Changed' as keyof Base ] as Callback;
    if (callback) callback = callback.bind( this );
    Object.defineProperty( this, propertyKey, {
      get() {
        return value;
      },
      set( newValue: any ) {
        const oldValue = value;
        value = newValue;
        if ( newValue !== oldValue ) {
          callback && callback(newValue, oldValue);
          this.dispatchEvent({ type: propertyKey + '-changed', value: newValue, oldValue: oldValue });
          if ( !this._changeDispatched ) {
            this._changeDispatched = true;
            requestAnimationFrame(() => {
              this.dispatchEvent(EVENT.CHANGE);
              this._changeDispatched = false;
            });
          }
        }
      }
    });
  }
  // TODO: consider making this work with WebXR context animaiton frame?
  protected needsAnimationFrameChanged(): void {
    cancelAnimationFrame(this._animationFrame);
    if (this.needsAnimationFrame) {
      this._animationFrame = requestAnimationFrame( this._onAnimationFrame );
    }
  }
  private _onAnimationFrame() {
    this.dispatchEvent(EVENT.CHANGE);
    this.needsAnimationFrame = false;
    this._animationFrame = 0;
  }
  // Adds animation callback to animation loop.
  startAnimation( callback: Callback ): void {
    const index = this._animations.findIndex( animation => animation === callback );
    if ( index === -1 ) this._animations.push( callback );
    AnimationManagerSingleton.add( callback );
  }
  // Removes animation callback from animation loop.
  stopAnimation( callback: Callback ): void {
    const index = this._animations.findIndex( animation => animation === callback );
    if ( index !== -1 ) this._animations.splice( index, 1 );
    AnimationManagerSingleton.remove( callback );
  }
  // Stops all animations.
  stopAllAnimations(): void {
    for ( let i = 0; i < this._animations.length; i++ ) {
      this.stopAnimation( this._animations[i] );
    }
  }
  dispose() {
    if ( this.parent ) this.parent.remove( this );
    this.stopAllAnimations();
    this.dispatchEvent( EVENT.DISPOSE );
  }
  updateMatrixWorld() {
    super.updateMatrixWorld();
    this.matrixWorld.decompose( this._worldPosition, this._worlQuaternion, this._worldScale );
    if ( this.camera ) {
      this.camera.matrixWorld.decompose( this._cameraPosition, this._cameraQuaternion, this._cameraScale ); 
      this._cameraOffset.copy( this._cameraPosition ).sub( this._worldPosition );
      if ( this.camera instanceof OrthographicCamera ) {
        this.eye.set( 0, 0, 1 ).applyQuaternion( this._cameraQuaternion );
      } else {
        this.eye.copy( this._cameraOffset ).normalize();
      }
    }
  }
}

/**
 * Internal animation manager.
 * It runs requestAnimationFrame loop whenever there are animation callbacks in the internal queue. 
 */
class AnimationManager {
  private _queue: Callback[] = [];
  private _running = false;
  private _time = performance.now();
  constructor() {
    this._update = this._update.bind( this );
  }
  // Adds animation callback to the queue
  add( callback: Callback ): void {
    const index = this._queue.indexOf( callback );
    if ( index === -1 ) {
      this._queue.push( callback );
      if ( this._queue.length === 1 ) this._start();
    }
  }
  // Removes animation callback from the queue
  remove( callback: Callback ): void {
    const index = this._queue.indexOf( callback );
    if ( index !== -1 ) {
      this._queue.splice( index, 1 );
      if ( this._queue.length === 0 ) this._stop();
    }
  }
  // Starts animation loop when there are callbacks in the queue
  private _start(): void {
    this._time = performance.now();
    this._running = true;
    requestAnimationFrame( this._update );
  }
  // Stops animation loop when the callbacks queue is empty
  private _stop(): void {
    this._running = false;
  }
  // Invokes all animation callbacks in the queue with timestep (dt)
  private _update(): void {
    if ( this._queue.length === 0 ) {
      this._running = false;
      return;
    }
    if ( this._running ) requestAnimationFrame( this._update );
    const time = performance.now();
    const timestep = performance.now() - this._time;
    this._time = time;
    for ( let i = 0; i < this._queue.length; i++ ) {
      this._queue[i]( timestep );
    }
  }
}

// Singleton animation manager.
const AnimationManagerSingleton = new AnimationManager();