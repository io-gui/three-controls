import { Vector3, Quaternion, PerspectiveCamera, OrthographicCamera, Camera } from 'three';

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
  camera: AnyCameraType;
  domElement: HTMLElement;
  readonly eye = new Vector3();
  protected readonly cameraPosition = new Vector3();
  protected readonly cameraQuaternion = new Quaternion();
  protected readonly cameraScale = new Vector3();
  protected readonly cameraOffset = new Vector3();
  protected readonly worldPosition = new Vector3();
  protected readonly worldQuaternion = new Quaternion();
  protected readonly worldScale = new Vector3();
  protected needsAnimationFrame = false; // TODO: deprecate
  private readonly _animations: Callback[] = [];
  private _animationFrame = 0;
  protected changeDispatched = false;
  constructor( camera: AnyCameraType, domElement: HTMLElement ) {
    super();
    if ( camera && !(camera instanceof PerspectiveCamera) && !(camera instanceof OrthographicCamera) ) {
      console.error(`Unsuported camera type: ${camera.constructor.name}`);
    }
    if ( domElement && !(domElement instanceof HTMLElement) ) {
      console.error(`Unsuported domElement: ${domElement}`);
    }

    this.camera = camera;
    this.domElement = domElement;

    this._onAnimationFrame = this._onAnimationFrame.bind( this );
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
          if ( !this.changeDispatched ) {
            this.changeDispatched = true;
            requestAnimationFrame(() => {
              this.dispatchEvent(EVENT.CHANGE);
              this.changeDispatched = false;
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
  decomposeMatrices() {
    this.matrixWorld.decompose( this.worldPosition, this.worldQuaternion, this.worldScale );
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
    // Without this, TransformControls needs another update to reoriante after "space" change.
    super.updateMatrixWorld();
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