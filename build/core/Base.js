import { Vector3, Quaternion, OrthographicCamera } from 'three';
import { Mesh } from 'three';
export const EVENT = {
    CHANGE: { type: 'change' },
    START: { type: 'start' },
    END: { type: 'end' },
    DISPOSE: { type: 'dispose' },
};
export const UNIT = {
    ZERO: Object.freeze(new Vector3(0, 0, 0)),
    X: Object.freeze(new Vector3(1, 0, 0)),
    Y: Object.freeze(new Vector3(0, 1, 0)),
    Z: Object.freeze(new Vector3(0, 0, 1)),
};
/**
 * `Base`: Base class for Objects with observable properties, change events and animation.
 */
export class Base extends Mesh {
    constructor() {
        super();
        this.viewport = {};
        this.eye = new Vector3();
        this.needsAnimationFrame = false;
        this._cameraPosition = new Vector3();
        this._cameraQuaternion = new Quaternion();
        this._cameraScale = new Vector3();
        this._cameraOffset = new Vector3();
        this._position = new Vector3();
        this._quaternion = new Quaternion();
        this._scale = new Vector3();
        this._animations = [];
        this._animationFrame = 0;
        this._changeDispatched = false;
        this._onAnimationFrame = this._onAnimationFrame.bind(this);
        this.onBeforeRender = (renderer, scene, camera) => {
            this.xr = renderer.xr;
            if (this.viewport.camera !== camera || this.viewport.domElement !== renderer.domElement) {
                this.viewport = {
                    camera: camera,
                    domElement: renderer.domElement,
                };
            }
        };
        this.observeProperty('needsAnimationFrame');
        this.needsAnimationFrame = true;
    }
    /**
     * Adds property observing mechanism via getter and setter.
     * Also emits '[property]-changed' event and cummulative 'change' event on next rAF.
     */
    observeProperty(propertyKey) {
        let value = this[propertyKey];
        let callback = this[propertyKey + 'Changed'];
        if (callback)
            callback = callback.bind(this);
        Object.defineProperty(this, propertyKey, {
            get() {
                return value;
            },
            set(newValue) {
                const oldValue = value;
                value = newValue;
                if (newValue !== oldValue) {
                    callback && callback(newValue, oldValue);
                    this.dispatchEvent({ type: propertyKey + '-changed', value: newValue, oldValue: oldValue });
                    if (!this._changeDispatched) {
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
    needsAnimationFrameChanged() {
        cancelAnimationFrame(this._animationFrame);
        if (this.needsAnimationFrame) {
            this._animationFrame = requestAnimationFrame(this._onAnimationFrame);
        }
    }
    _onAnimationFrame() {
        this.dispatchEvent(EVENT.CHANGE);
        this.needsAnimationFrame = false;
        this._animationFrame = 0;
    }
    // Adds animation callback to animation loop.
    startAnimation(callback) {
        const index = this._animations.findIndex(animation => animation === callback);
        if (index === -1)
            this._animations.push(callback);
        AnimationManagerSingleton.add(callback);
    }
    // Removes animation callback from animation loop.
    stopAnimation(callback) {
        const index = this._animations.findIndex(animation => animation === callback);
        if (index !== -1)
            this._animations.splice(index, 1);
        AnimationManagerSingleton.remove(callback);
    }
    // Stops all animations.
    stopAllAnimations() {
        for (let i = 0; i < this._animations.length; i++) {
            this.stopAnimation(this._animations[i]);
        }
    }
    dispose() {
        if (this.parent)
            this.parent.remove(this);
        this.stopAllAnimations();
        this.dispatchEvent(EVENT.DISPOSE);
    }
    updateMatrixWorld() {
        super.updateMatrixWorld();
        this.matrixWorld.decompose(this._position, this._quaternion, this._scale);
        if (this.viewport.camera) {
            this.viewport.camera.matrixWorld.decompose(this._cameraPosition, this._cameraQuaternion, this._cameraScale);
            this._cameraOffset.copy(this._cameraPosition).sub(this._position);
            if (this.viewport.camera instanceof OrthographicCamera) {
                this.eye.set(0, 0, 1).applyQuaternion(this._cameraQuaternion);
            }
            else {
                this.eye.copy(this._cameraOffset).normalize();
            }
        }
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
        this._update = this._update.bind(this);
    }
    // Adds animation callback to the queue
    add(callback) {
        const index = this._queue.indexOf(callback);
        if (index === -1) {
            this._queue.push(callback);
            if (this._queue.length === 1)
                this._start();
        }
    }
    // Removes animation callback from the queue
    remove(callback) {
        const index = this._queue.indexOf(callback);
        if (index !== -1) {
            this._queue.splice(index, 1);
            if (this._queue.length === 0)
                this._stop();
        }
    }
    // Starts animation loop when there are callbacks in the queue
    _start() {
        this._time = performance.now();
        this._running = true;
        requestAnimationFrame(this._update);
    }
    // Stops animation loop when the callbacks queue is empty
    _stop() {
        this._running = false;
    }
    // Invokes all animation callbacks in the queue with timestep (dt)
    _update() {
        if (this._queue.length === 0) {
            this._running = false;
            return;
        }
        if (this._running)
            requestAnimationFrame(this._update);
        const time = performance.now();
        const timestep = performance.now() - this._time;
        this._time = time;
        for (let i = 0; i < this._queue.length; i++) {
            this._queue[i](timestep);
        }
    }
}
// Singleton animation manager.
const AnimationManagerSingleton = new AnimationManager();
