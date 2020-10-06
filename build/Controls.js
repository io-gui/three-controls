import { Vector2, Vector3, Plane, PerspectiveCamera, OrthographicCamera, Raycaster, EventDispatcher, Quaternion } from "../../three/src/Three";
/**
 * Generic superclass for various interactive controls.
 * - Adds/removes event listeners during lifecycle and on `enabled` property change.
 * - Forwards pointer and keyboard events:
 *   "contextmenu", "wheel", "pointerdown", "pointermove", "pointerup", "keydown", "keyup".
 * - Emits synthetic pointer events:
 *   "enabled", "disabled", "dispose"
 * - Evokes methods with tracked pointer and code data:
 *   onTrackedPointerDown, onTrackedPointerMove, onTrackedPointerUp, onTrackedKeyDown, onTrackedKeyUp, onTrackedKeyChange.
 */
const EPS = 0.00001;
const raycaster = new Raycaster();
const intersectedObjects = [];
const intersectedPoint = new Vector3();
// Pointer class to keep track of pointer movements
const viewMultiplier = new Vector2();
const viewOffset = new Vector2();
const plane = new Plane();
const unitY = new Vector3(0, 1, 0);
const eye0 = new Vector3();
export class Pointer2D {
    constructor() {
        this.start = new Vector2();
        this.current = new Vector2();
        this.previous = new Vector2();
        this.movement = new Vector2();
        this.offset = new Vector2();
    }
}
export class Pointer3D {
    constructor() {
        this.start = new Vector3();
        this.current = new Vector3();
        this.previous = new Vector3();
        this.movement = new Vector3();
        this.offset = new Vector3();
    }
}
export class Pointer {
    constructor(pointerEvent, camera, target) {
        this.canvas = new Pointer2D();
        this.view = new Pointer2D();
        this.planar = new Pointer3D();
        this.world = new Pointer3D();
        this._camera = camera;
        this._target = target;
        this.domElement = pointerEvent.target;
        this.pointerId = pointerEvent.pointerId;
        this.type = pointerEvent.pointerType;
        this.button = pointerEvent.button;
        this.buttons = pointerEvent.buttons;
        this.altKey = pointerEvent.altKey;
        this.ctrlKey = pointerEvent.ctrlKey;
        this.metaKey = pointerEvent.metaKey;
        this.shiftKey = pointerEvent.shiftKey;
        this.canvas.start.set(pointerEvent.clientX, pointerEvent.clientY);
        this.canvas.current.set(pointerEvent.clientX, pointerEvent.clientY);
        this.canvas.previous.set(pointerEvent.clientX, pointerEvent.clientY);
        this._calculateView();
        this._calculateWorld();
        this._calculatePlanar();
    }
    update(pointerEvent, camera, target) {
        if (this.pointerId !== pointerEvent.pointerId) {
            console.error('Invalid pointerId!');
            return;
        }
        this._camera = camera;
        this._target = target;
        this.buttons = pointerEvent.buttons;
        this.altKey = pointerEvent.altKey;
        this.ctrlKey = pointerEvent.ctrlKey;
        this.metaKey = pointerEvent.metaKey;
        this.shiftKey = pointerEvent.shiftKey;
        this.canvas.previous.copy(this.canvas.current);
        this.canvas.current.set(pointerEvent.clientX, pointerEvent.clientY);
        // Calculate movement because Safari movement is broken
        this.canvas.movement.copy(this.canvas.current).sub(this.canvas.previous);
        if (pointerEvent.movementX && pointerEvent.movementX !== this.canvas.movement.x)
            this.canvas.movement.x = pointerEvent.movementX;
        if (pointerEvent.movementY && pointerEvent.movementY !== this.canvas.movement.y)
            this.canvas.movement.y = pointerEvent.movementY;
        this.canvas.offset.set(pointerEvent.clientX, pointerEvent.clientY).sub(this.canvas.start);
        this._calculateView();
        this._calculateWorld();
        this._calculatePlanar();
    }
    clear() {
        this.canvas.previous.copy(this.canvas.current);
        this.canvas.movement.set(0, 0);
        this._calculateView();
        this._calculateWorld();
        this._calculatePlanar();
    }
    applyDamping(dampingFactor, deltaTime) {
        // TODO: use timeDelta
        this.canvas.movement.multiplyScalar(1 - dampingFactor);
        this.canvas.previous.copy(this.canvas.current);
        this.canvas.current.add(this.canvas.movement);
        this.canvas.offset.set(this.canvas.current.x, this.canvas.current.y).sub(this.canvas.start);
        this._calculateView();
        this._calculateWorld();
        this._calculatePlanar();
    }
    intersectObjects(objects) {
        raycaster.setFromCamera(this.view.current, this._camera);
        intersectedObjects.length = 0;
        raycaster.intersectObjects(objects, true, intersectedObjects);
        return intersectedObjects;
    }
    intersectPlane(plane) {
        raycaster.setFromCamera(this.view.current, this._camera);
        raycaster.ray.intersectPlane(plane, intersectedPoint);
        return intersectedPoint;
    }
    _calculateView() {
        viewMultiplier.set(this.domElement.clientWidth / 2, -1 * this.domElement.clientHeight / 2);
        viewOffset.set(1, -1);
        this.view.start.copy(this.canvas.start).divide(viewMultiplier).sub(viewOffset);
        this.view.current.copy(this.canvas.current).divide(viewMultiplier).sub(viewOffset);
        this.view.previous.copy(this.canvas.previous).divide(viewMultiplier).sub(viewOffset);
        this.view.movement.copy(this.canvas.movement).divide(viewMultiplier);
        this.view.offset.copy(this.canvas.offset).divide(viewMultiplier);
    }
    _calculateWorld() {
        plane.setFromNormalAndCoplanarPoint(eye0.set(0, 0, 1).applyQuaternion(this._camera.quaternion).normalize(), this._target);
        intersectedPoint.set(0, 0, 0);
        raycaster.setFromCamera(this.view.start, this._camera);
        raycaster.ray.intersectPlane(plane, intersectedPoint);
        this.world.start.copy(intersectedPoint);
        intersectedPoint.set(0, 0, 0);
        raycaster.setFromCamera(this.view.current, this._camera);
        raycaster.ray.intersectPlane(plane, intersectedPoint);
        this.world.current.copy(intersectedPoint);
        intersectedPoint.set(0, 0, 0);
        raycaster.setFromCamera(this.view.previous, this._camera);
        raycaster.ray.intersectPlane(plane, intersectedPoint);
        this.world.previous.copy(intersectedPoint);
        this.world.movement.copy(this.world.current).sub(this.world.previous);
        this.world.offset.copy(this.world.current).sub(this.world.start);
    }
    _calculatePlanar() {
        plane.setFromNormalAndCoplanarPoint(unitY, this._target);
        intersectedPoint.set(0, 0, 0);
        raycaster.setFromCamera(this.view.start, this._camera);
        raycaster.ray.intersectPlane(plane, intersectedPoint);
        this.planar.start.copy(intersectedPoint);
        intersectedPoint.set(0, 0, 0);
        raycaster.setFromCamera(this.view.current, this._camera);
        raycaster.ray.intersectPlane(plane, intersectedPoint);
        this.planar.current.copy(intersectedPoint);
        intersectedPoint.set(0, 0, 0);
        raycaster.setFromCamera(this.view.previous, this._camera);
        raycaster.ray.intersectPlane(plane, intersectedPoint);
        this.planar.previous.copy(intersectedPoint);
        this.planar.movement.copy(this.planar.current).sub(this.planar.previous);
        this.planar.offset.copy(this.planar.current).sub(this.planar.start);
    }
}
export class CenterPointer extends Pointer {
    updateCenter(pointers, camera, target) {
        this._camera = camera;
        this._target = target;
        this.canvas.start.set(0, 0);
        this.canvas.current.set(0, 0);
        this.canvas.previous.set(0, 0);
        this.canvas.movement.set(0, 0);
        this.canvas.offset.set(0, 0);
        for (let i = 0; i < pointers.length; i++) {
            const pointer = pointers[i];
            this.canvas.start.add(pointer.canvas.start);
            this.canvas.current.add(pointer.canvas.current);
            this.canvas.previous.add(pointer.canvas.previous);
            this.canvas.movement.add(pointer.canvas.movement);
            this.canvas.offset.add(pointer.canvas.offset);
        }
        this.canvas.start.divideScalar(pointers.length);
        this.canvas.current.divideScalar(pointers.length);
        this.canvas.previous.divideScalar(pointers.length);
        this.canvas.movement.divideScalar(pointers.length);
        this.canvas.offset.divideScalar(pointers.length);
        this._calculateView();
        this._calculateWorld();
        this._calculatePlanar();
    }
}
class AnimationQueue {
    constructor() {
        this._queue = [];
        this._running = false;
        this._time = performance.now();
        this._update = this._update.bind(this);
    }
    add(callback) {
        const index = this._queue.indexOf(callback);
        if (index === -1) {
            this._queue.push(callback);
            if (this._queue.length === 1)
                this._start();
        }
    }
    remove(callback) {
        const index = this._queue.indexOf(callback);
        if (index !== -1) {
            this._queue.splice(index, 1);
            if (this._queue.length === 0)
                this._stop();
        }
    }
    _start() {
        this._time = performance.now();
        this._running = true;
        requestAnimationFrame(this._update);
    }
    _stop() {
        this._running = false;
    }
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
export const AnimationQueueSingleton = new AnimationQueue();
export const changeEvent = { type: 'change' };
const ControlsMixin = (superclass) => {
    const classConstructor = class extends superclass {
        constructor(camera, domElement) {
            super();
            this.target = new Vector3();
            this.enabled = true;
            this.enableDamping = false;
            this.dampingFactor = 0.05;
            //
            this._simulatedPointer = null;
            this._hover = null;
            this._center = null;
            this._pointers = [];
            this._animations = [];
            this._keys = [];
            //
            this._resetQuaternion = new Quaternion();
            this._resetPosition = new Vector3();
            this._resetUp = new Vector3();
            this._resetTarget = new Vector3();
            this._resetZoom = 1;
            this._resetFocus = 1;
            if (camera === undefined)
                console.warn('THREE.Controls: "camera" parameter is now mandatory!');
            if (!(camera instanceof PerspectiveCamera) && !(camera instanceof OrthographicCamera))
                console.warn('THREE.Controls: Unsupported camera type!');
            if (domElement === undefined)
                console.warn('THREE.Controls: "domElement" parameter is now mandatory!');
            if (domElement === document)
                console.error('THREE.Controls: "domElement" should be "renderer.domElement"!');
            this.camera = camera;
            this.domElement = domElement;
            //
            // Camera target used for camera controls and pointer view -> world space conversion. 
            //
            const target = new Vector3();
            // TODO encode target in camera matrix + focus.
            Object.defineProperty(this, 'target', {
                get: () => {
                    return target;
                },
                set: (value) => {
                    target.copy(value);
                }
            });
            target.set = (x, y, z) => {
                Vector3.prototype.set.call(target, x, y, z);
                this.camera.lookAt(target);
                this.dispatchEvent(changeEvent);
                return target;
            };
            target.copy = (value) => {
                Vector3.prototype.copy.call(target, value);
                this.camera.lookAt(target);
                this.dispatchEvent(changeEvent);
                return target;
            };
            target.set(0, 0, 0);
            this.saveCameraState();
            // Internals
            const _onContextMenu = (event) => {
                this.dispatchEvent(event);
            };
            const _onWheel = (event) => {
                this.dispatchEvent(event);
            };
            const _onPointerDown = (event) => {
                if (this._simulatedPointer)
                    this._simulatedPointer = null;
                this.domElement.focus ? this.domElement.focus() : window.focus();
                this.domElement.setPointerCapture(event.pointerId);
                const pointers = this._pointers;
                const pointer = new Pointer(event, this.camera, this.target);
                pointers.push(pointer);
                this.onTrackedPointerDown(pointer, pointers);
                this.dispatchEvent(event);
            };
            const _onPointerMove = (event) => {
                const pointers = this._pointers;
                const index = pointers.findIndex(pointer => pointer.pointerId === event.pointerId);
                let pointer = pointers[index];
                if (pointer) {
                    pointer.update(event, this.camera, this.target);
                    const x = Math.abs(pointer.view.current.x);
                    const y = Math.abs(pointer.view.current.y);
                    // Workaround for https://bugs.chromium.org/p/chromium/issues/detail?id=1131348
                    if (pointer.button !== 0 && (x > 1 || x < 0 || y > 1 || y < 0)) {
                        pointers.splice(index, 1);
                        this.domElement.releasePointerCapture(event.pointerId);
                        this.dispatchEvent(event);
                        this.onTrackedPointerUp(pointer, pointers);
                        return;
                    }
                    /**
                      * TODO: investigate multi-poiter movement accumulation.
                      * This shouldn't be necessary yet without it, multi pointer gestures result with
                      * multiplied movement values. TODO: investigate and unhack.
                      * */
                    for (let i = 0; i < pointers.length; i++) {
                        if (pointer.pointerId !== pointers[i].pointerId) {
                            pointers[i].clear();
                        }
                    }
                    this._center = this._center || new CenterPointer(event, this.camera, this.target);
                    this._center.updateCenter(pointers, this.camera, this.target);
                    // TODO: consider throttling once per frame. On Mac pointermove fires up to 120 Hz.
                    this.onTrackedPointerMove(pointer, pointers, this._center);
                }
                else if (this._hover && this._hover.pointerId === event.pointerId) {
                    pointer = this._hover;
                    pointer.update(event, this.camera, this.target);
                    this.onTrackedPointerHover(pointer, [pointer]);
                }
                else {
                    pointer = this._hover = new Pointer(event, this.camera, this.target);
                    this.onTrackedPointerHover(pointer, [pointer]);
                }
                // Fix MovementX/Y for Safari
                Object.defineProperty(event, 'movementX', { writable: true, value: pointer.canvas.movement.x });
                Object.defineProperty(event, 'movementY', { writable: true, value: pointer.canvas.movement.y });
                this.dispatchEvent(event);
            };
            const _onPointerSimulation = (timeDelta) => {
                if (this._simulatedPointer) {
                    const pointer = this._simulatedPointer;
                    pointer.applyDamping(this.dampingFactor, timeDelta);
                    if (pointer.canvas.movement.length() > EPS) {
                        this.onTrackedPointerMove(pointer, [pointer], pointer);
                    }
                    else {
                        this.onTrackedPointerUp(pointer, []);
                        this._simulatedPointer = null;
                    }
                }
                else {
                    this.stopAnimation(_onPointerSimulation);
                }
            };
            const _onPointerUp = (event) => {
                // TODO: three-finger drag on Mac producing delayed pointerup.
                const pointers = this._pointers;
                const index = pointers.findIndex(pointer => pointer.pointerId === event.pointerId);
                const pointer = pointers[index];
                if (pointer) {
                    pointers.splice(index, 1);
                    this.domElement.releasePointerCapture(event.pointerId);
                    if (this.enableDamping) {
                        this._simulatedPointer = pointer;
                        this.startAnimation(_onPointerSimulation);
                    }
                    else {
                        this.onTrackedPointerUp(pointer, pointers);
                    }
                }
                this.dispatchEvent(event);
            };
            const _onPointerLeave = (event) => {
                const pointers = this._pointers;
                const index = pointers.findIndex(pointer => pointer.pointerId === event.pointerId);
                const pointer = pointers[index];
                if (pointer) {
                    pointers.splice(index, 1);
                    this.domElement.releasePointerCapture(event.pointerId);
                    this.onTrackedPointerUp(pointer, pointers);
                }
                this.dispatchEvent(event);
            };
            const _onPointerCancel = (event) => {
                const pointers = this._pointers;
                const index = pointers.findIndex(pointer => pointer.pointerId === event.pointerId);
                const pointer = pointers[index];
                if (pointer) {
                    pointers.splice(index, 1);
                    this.domElement.releasePointerCapture(event.pointerId);
                    this.onTrackedPointerUp(pointer, pointers);
                }
                this.dispatchEvent(event);
            };
            const _onPointerOver = (event) => {
                this.dispatchEvent(event);
            };
            const _onPointerEnter = (event) => {
                this.dispatchEvent(event);
            };
            const _onPointerOut = (event) => {
                this.dispatchEvent(event);
            };
            const _onKeyDown = (event) => {
                const code = Number(event.code);
                const keys = this._keys;
                const index = keys.findIndex(key => key === code);
                if (index === -1)
                    keys.push(code);
                if (!event.repeat) {
                    this.onTrackedKeyDown(code, keys);
                    this.onTrackedKeyChange(code, keys);
                }
                this.dispatchEvent(event);
            };
            const _onKeyUp = (event) => {
                const code = Number(event.code);
                const keys = this._keys;
                const index = keys.findIndex(key => key === code);
                if (index !== -1)
                    keys.splice(index, 1);
                this.onTrackedKeyUp(code, keys);
                this.onTrackedKeyChange(code, keys);
                this.dispatchEvent(event);
            };
            const _connect = () => {
                this.domElement.addEventListener('contextmenu', _onContextMenu, false);
                this.domElement.addEventListener('wheel', _onWheel, { capture: false, passive: false });
                this.domElement.addEventListener('pointerdown', _onPointerDown, false);
                this.domElement.addEventListener('pointermove', _onPointerMove, false);
                this.domElement.addEventListener('pointerleave', _onPointerLeave, false);
                this.domElement.addEventListener('pointercancel', _onPointerCancel, false);
                this.domElement.addEventListener('pointerover', _onPointerOver, false);
                this.domElement.addEventListener('pointerenter', _onPointerEnter, false);
                this.domElement.addEventListener('pointerout', _onPointerOut, false);
                this.domElement.addEventListener('pointerup', _onPointerUp, false);
                this.domElement.addEventListener('keydown', _onKeyDown, false);
                this.domElement.addEventListener('keyup', _onKeyUp, false);
                // make sure element can receive keys.
                if (this.domElement.tabIndex === -1) {
                    this.domElement.tabIndex = 0;
                }
                // make sure element has disabled touch-actions.
                if (window.getComputedStyle(this.domElement).touchAction !== 'none') {
                    this.domElement.style.touchAction = 'none';
                }
                // TODO: consider reverting "tabIndex" and "style.touchAction" attributes on disconnect.
            };
            const _disconnect = () => {
                this.domElement.removeEventListener('contextmenu', _onContextMenu, false);
                // TODO: investigate typescript bug?
                this.domElement.removeEventListener('wheel', _onWheel, { capture: false, passive: false });
                this.domElement.removeEventListener('pointerdown', _onPointerDown, false);
                this.domElement.removeEventListener('pointermove', _onPointerMove, false);
                this.domElement.removeEventListener('pointerleave', _onPointerLeave, false);
                this.domElement.removeEventListener('pointercancel', _onPointerCancel, false);
                this.domElement.removeEventListener('pointerup', _onPointerUp, false);
                this.domElement.removeEventListener('keydown', _onKeyDown, false);
                this.domElement.removeEventListener('keyup', _onKeyUp, false);
                for (let i = 0; i < this._pointers.length; i++) {
                    this.domElement.releasePointerCapture(this._pointers[i].pointerId);
                }
                for (let i = 0; i < this._animations.length; i++) {
                    this.stopAnimation(this._animations[i]);
                }
                this._pointers.length = 0;
                this._keys.length = 0;
            };
            this._defineProperty('enabled', true, (value) => {
                value ? _connect() : _disconnect();
            });
            _connect();
        }
        _defineProperty(prop, initValue, onChange) {
            let propValue = initValue;
            Object.defineProperty(this, prop, {
                enumerable: true,
                get: () => {
                    return propValue;
                },
                set: value => {
                    if (propValue !== value) {
                        propValue = value;
                        if (onChange)
                            onChange(value);
                        this.dispatchEvent({ type: prop + '-changed', value: value });
                    }
                }
            });
        }
        /* eslint-disable @typescript-eslint/no-empty-function */
        /* eslint-disable @typescript-eslint/no-unused-vars */
        /* eslint-disable no-unused-vars */
        onTrackedPointerDown(_pointer, _pointers) { }
        onTrackedPointerMove(_pointer, _pointers, _center) { }
        onTrackedPointerHover(_pointer, _pointers) { }
        onTrackedPointerUp(_pointer, _pointers) { }
        onTrackedKeyDown(code, codes) { }
        onTrackedKeyUp(code, codes) { }
        onTrackedKeyChange(code, codes) { }
        /* eslint-enable @typescript-eslint/no-empty-function */
        /* eslint-enable @typescript-eslint/no-unused-vars */
        /* eslint-enable no-unused-vars */
        dispose() {
            this.enabled = false;
            this.dispatchEvent({ type: 'dispose' });
        }
        addEventListener(type, listener) {
            if (type === 'enabled') {
                console.warn(`THREE.Controls: "enabled" event is now "enabled-changed"!`);
                type = 'enabled-changed';
            }
            if (type === 'disabled') {
                console.warn(`THREE.Controls: "disabled" event is now "enabled-changed"!`);
                type = 'enabled-changed';
            }
            super.addEventListener(type, listener);
        }
        dispatchEvent(event) {
            Object.defineProperty(event, 'target', { writable: true });
            super.dispatchEvent(event);
        }
        startAnimation(callback) {
            const index = this._animations.findIndex(animation => animation === callback);
            if (index === -1)
                this._animations.push(callback);
            AnimationQueueSingleton.add(callback);
        }
        stopAnimation(callback) {
            const index = this._animations.findIndex(animation => animation === callback);
            if (index !== -1)
                this._animations.splice(index, 1);
            AnimationQueueSingleton.remove(callback);
        }
        saveState() {
            console.warn('THREE.Controls: "saveState" is now "saveCameraState"!');
            this.saveCameraState();
        }
        reset() {
            console.warn('THREE.Controls: "reset" is now "resetCameraState"!');
            this.resetCameraState();
        }
        saveCameraState() {
            this._resetQuaternion.copy(this.camera.quaternion);
            this._resetPosition.copy(this.camera.position);
            this._resetUp.copy(this.camera.up);
            this._resetTarget.copy(this.target);
            this._resetZoom = this.camera.zoom;
            if (this.camera instanceof PerspectiveCamera) {
                this._resetFocus = this.camera.focus;
            }
        }
        resetCameraState() {
            this.camera.quaternion.copy(this._resetQuaternion);
            this.camera.position.copy(this._resetPosition);
            this.camera.up.copy(this._resetUp);
            this.target.copy(this._resetTarget);
            this.camera.zoom = this._resetZoom;
            if (this.camera instanceof PerspectiveCamera) {
                this.camera.focus = this._resetFocus;
            }
            this.camera.updateProjectionMatrix();
            this.dispatchEvent(changeEvent);
        }
    };
    return classConstructor;
};
export class Controls extends ControlsMixin(EventDispatcher) {
}
//# sourceMappingURL=Controls.js.map