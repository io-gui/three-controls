import { Mesh, Event as ThreeEvent } from 'three';

export type Callback = ( callbackValue?: any ) => void;

export const EVENT: Record<string, ThreeEvent> = {
  CHANGE: { type: 'change' },
  START: { type: 'start' },
  END: { type: 'end' },
  DISPOSE: { type: 'dispose' },
};

/**
 * `Base`: Base class for Objects with observable properties, change events and animation.
 */
export class Base extends Mesh {
  protected needsAnimationFrame = false;
  private readonly _listeners: Record<string, Array<( event: Event ) => void>>;
  private readonly _animations: Callback[] = [];
  private _animationFrame = 0;
  private _changeDispatched = false;
  constructor() {
    super();
    this._onNeedsAnimationChanged = this._onNeedsAnimationChanged.bind( this );
    this._onAnimationFrame = this._onAnimationFrame.bind( this );
    this.observeProperty( 'needsAnimationFrame', this._onNeedsAnimationChanged );
  }
  /**
   * Adds property observing mechanism via getter and setter.
   * Also emits '[property]-changed' event and cummulative 'change' event on next rAF.
   */
  observeProperty( propertyKey: string, onChangeFunc?: Callback, onChangeToFalsyFunc?: Callback ): void {
    let value: any = this[ propertyKey ];
    Object.defineProperty( this, propertyKey, {
      get() {
        return value;
      },
      set( newValue: any ) {
        const oldValue = value;
        value = newValue;
        if ( oldValue !== undefined && newValue !== oldValue ) {
          ( newValue || !onChangeToFalsyFunc ) ? (onChangeFunc && onChangeFunc()) : onChangeToFalsyFunc();
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
  private _onNeedsAnimationChanged(): void {
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
  stopAllAnimation(): void {
    for ( let i = 0; i < this._animations.length; i++ ) {
      this.stopAnimation( this._animations[i] );
    }
  }
  // EventDispatcher.dispatchEvent with added ability to dispatch native DOM Events.
  dispatchEvent( event: ThreeEvent | Event ): void {
    if ( this._listeners && this._listeners[event.type] && this._listeners[event.type].length ) {
      Object.defineProperty( event, 'target', { writable: true });
      super.dispatchEvent( event );
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