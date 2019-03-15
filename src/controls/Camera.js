/**
 * @author arodic / http://github.com/arodic
 */

import {Vector2, Vector3, MOUSE} from "../../../three.js/src/Three.js";
import {Interactive} from "../Interactive.js";
import {Animation} from "../../lib/Animation.js";

/*
 * CameraControls is a base class for controls performing orbiting, dollying, and panning.
 *
 *    Orbit - left mouse / touch: one-finger move
 *    Dolly - middle mouse, or mousewheel / touch: two-finger spread or squish
 *    Pan - right mouse, or left mouse + ctrlKey/altKey, wasd, or arrow keys / touch: two-finger move
 */

const STATE = {NONE: - 1, ORBIT: 0, DOLLY: 1, PAN: 2, DOLLY_PAN: 3};
const EPS = 0.000001;

// Temp variables
const direction = new Vector2();
const aspectMultiplier = new Vector2();
const orbit = new Vector2();
const pan = new Vector2();

// Framerate-independent damping
function dampTo(source, target, smoothing, dt) {
	const t = 1 - Math.pow(smoothing, dt);
	return source * (1 - t) + target * t;
}

export class CameraControls extends Interactive {
	constructor(props) {
		super(props);

		this.defineProperties({
			target: new Vector3(),
			active: false,
			enableOrbit: true,
			enableDolly: true,
			enablePan: true,
			enableFocus: true,
			orbitSpeed: 1.0,
			dollySpeed: 1.0,
			panSpeed: 1.0,
			keyOrbitSpeed: 0.1,
			keyDollySpeed: 0.1,
			keyPanSpeed: 0.1,
			wheelDollySpeed: 0.02,
			autoOrbit: new Vector2(0.0, 0.0),
			autoDollyPan: new Vector3(0.1, 0.0, 0.0),
			enableDamping: true,
			dampingFactor: 0.05,
			KEYS: {
				PAN_LEFT: 37, // left
				PAN_UP: 38, // up
				PAN_RIGHT: 39, // right
				PAN_DOWN: 40, // down
				ORBIT_LEFT: 65, // A
				ORBIT_RIGHT: 68, // D
				ORBIT_UP: 83, // S
				ORBIT_DOWN: 87, // W
				DOLLY_OUT: 189, // +
				DOLLY_IN: 187, // -
				FOCUS: 70 // F
			},
			BUTTON: {LEFT: MOUSE.LEFT, MIDDLE: MOUSE.MIDDLE, RIGHT: MOUSE.RIGHT}, // Mouse buttons
			state: STATE.NONE,
			_orbitOffset: new Vector2(),
			_orbitInertia: new Vector2(),
			_panOffset: new Vector2(),
			_panInertia: new Vector2(),
			_dollyOffset: 0,
			_dollyInertia: 0
		});

		this.animation = new Animation();

		this.animation.addEventListener('update', event => {
			this.update(event.detail.timestep);
			this.dispatchEvent('change');
		});

		this.cameraChanged(); // TODO: ahmm...
	}
	cameraChanged() {
		this.camera.lookAt(this.target);
		this.animation.startAnimation(0);
	}
	targetChanged() {
		this.camera.lookAt(this.target);
		this.animation.startAnimation(0);
	}
	stateChanged() {
		this.active = this.state !== STATE.NONE;
		this.animation.startAnimation(0);
	}
	update(timestep) {
		let dt = timestep / 1000;
		// Apply orbit intertia
		if (this.state !== STATE.ORBIT) {
			if (this.enableDamping) {
				this._orbitInertia.x = dampTo(this._orbitInertia.x, this.autoOrbit.x, this.dampingFactor, dt);
				this._orbitInertia.y = dampTo(this._orbitInertia.y, 0.0, this.dampingFactor, dt);
			}
		} else {
			this._orbitInertia.set(this.autoOrbit.x, 0);
		}

		this._orbitOffset.x += this._orbitInertia.x;
		this._orbitOffset.y += this._orbitInertia.y;

		// Apply pan intertia
		if (this.state !== STATE.PAN) {
			this._panInertia.x = dampTo(this._panInertia.x, 0.0, this.dampingFactor, dt);
			this._panInertia.y = dampTo(this._panInertia.y, 0.0, this.dampingFactor, dt);
		} else {
			this._panInertia.set(0, 0);
		}
		this._panOffset.x += this._panInertia.x;
		this._panOffset.y += this._panInertia.y;

		// Apply dolly intertia
		if (this.state !== STATE.DOLLY) {
			this._dollyInertia = dampTo(this._dollyInertia, 0.0, this.dampingFactor, dt);
		} else {
			this._dollyInertia = 0;
		}
		this._dollyOffset += this._dollyInertia;

		// set inertiae from current offsets
		if (this.enableDamping) {
			if (this.state === STATE.ORBIT) {
				this._orbitInertia.copy(this._orbitOffset);
			}
			if (this.state === STATE.PAN) {
				this._panInertia.copy(this._panOffset);
			}
			if (this.state === STATE.DOLLY) {
				this._dollyInertia = this._dollyOffset;
			}
		}

		this.orbit(orbit.copy(this._orbitOffset));
		this.dolly(this._dollyOffset);
		this.pan(pan.copy(this._panOffset));

		this._orbitOffset.set(0, 0);
		this._panOffset.set(0, 0);
		this._dollyOffset = 0;

		this.camera.lookAt(this.target);

		// Determine if animation needs to continue
		let maxVelocity = 0;
		maxVelocity = Math.max(maxVelocity, Math.abs(this._orbitInertia.x));
		maxVelocity = Math.max(maxVelocity, Math.abs(this._orbitInertia.y));
		maxVelocity = Math.max(maxVelocity, Math.abs(this._panInertia.x));
		maxVelocity = Math.max(maxVelocity, Math.abs(this._panInertia.y));
		maxVelocity = Math.max(maxVelocity, Math.abs(this._dollyInertia));
		if (maxVelocity > EPS) this.animation.startAnimation(0);
	}
	onPointerMove(pointers) {
		let rect = this.domElement.getBoundingClientRect();
		let prevDistance, distance;
		aspectMultiplier.set(rect.width / rect.height, 1);
		switch (pointers.length) {
			case 1:
				direction.copy(pointers[0].movement).multiply(aspectMultiplier);
				switch (pointers[0].button) {
					case this.BUTTON.LEFT:
						if (pointers.ctrlKey) {
							this._setPan(direction.multiplyScalar(this.panSpeed));
						} else if (pointers.altKey) {
							this._setDolly(pointers[0].movement.y * this.dollySpeed);
						} else {
							this._setOrbit(direction.multiplyScalar(this.orbitSpeed));
						}
						break;
					case this.BUTTON.MIDDLE:
						this._setDolly(pointers[0].movement.y * this.dollySpeed);
						break;
					case this.BUTTON.RIGHT:
						this._setPan(direction.multiplyScalar(this.panSpeed));
						break;
				}
				break;
			default: // 2 or more
				// two-fingered touch: dolly-pan
				// TODO: apply aspectMultiplier?
				distance = pointers[0].position.distanceTo(pointers[1].position);
				prevDistance = pointers[0].previous.distanceTo(pointers[1].previous);
				direction.copy(pointers[0].movement).add(pointers[1].movement).multiply(aspectMultiplier);
				this._setDollyPan((prevDistance - distance) * this.dollySpeed, direction.multiplyScalar(this.panSpeed));
				break;
		}
	}
	onPointerUp(pointers) {
		if (pointers.length === 0) {
			this.state = STATE.NONE;
		}
	}
	// onKeyDown(event) {
	// 	TODO: key inertia
	// 	TODO: better state setting
	// 	switch (event.keyCode) {
	// 		case this.KEYS.PAN_UP:
	// 			this._setPan(direction.set(0, -this.keyPanSpeed));
	// 			break;
	// 		case this.KEYS.PAN_DOWN:
	// 			this._setPan(direction.set(0, this.keyPanSpeed));
	// 			break;
	// 		case this.KEYS.PAN_LEFT:
	// 			this._setPan(direction.set(this.keyPanSpeed, 0));
	// 			break;
	// 		case this.KEYS.PAN_RIGHT:
	// 			this._setPan(direction.set(-this.keyPanSpeed, 0));
	// 			break;
	// 		case this.KEYS.ORBIT_LEFT:
	// 			this._setOrbit(direction.set(this.keyOrbitSpeed, 0));
	// 			break;
	// 		case this.KEYS.ORBIT_RIGHT:
	// 			this._setOrbit(direction.set(-this.keyOrbitSpeed, 0));
	// 			break;
	// 		case this.KEYS.ORBIT_UP:
	// 			this._setOrbit(direction.set(0, this.keyOrbitSpeed));
	// 			break;
	// 		case this.KEYS.ORBIT_DOWN:
	// 			this._setOrbit(direction.set(0, -this.keyOrbitSpeed));
	// 			break;
	// 		case this.KEYS.DOLLY_IN:
	// 			this._setDolly(-this.keyDollySpeed);
	// 			break;
	// 		case this.KEYS.DOLLY_OUT:
	// 			this._setDolly(this.keyDollySpeed);
	// 			break;
	// 		case this.KEYS.FOCUS:
	// 			this._setFocus();
	// 			break;
	// 		default:
	// 			break;
	// 	}
	// 	this.active = false;
	// }
	onKeyUp() {
		// TODO: Consider improving for prevent pointer and multi-key interruptions.
		// this.active = false;
	}
	onWheel(event) {
		this.state = STATE.DOLLY;
		this._setDolly(event.delta * this.wheelDollySpeed);
		this.state = STATE.NONE;
		this.animation.startAnimation(0);
	}
	_setPan(dir) {
		this.state = STATE.PAN;
		if (this.enablePan) this._panOffset.copy(dir);
		this.animation.startAnimation(0);
	}
	_setDolly(dir) {
		this.state = STATE.DOLLY;
		if (this.enableDolly) this._dollyOffset = dir;
		this.animation.startAnimation(0);
	}
	_setDollyPan(dollyDir, panDir) {
		this.state = STATE.DOLLY_PAN;
		if (this.enableDolly) this._dollyOffset = dollyDir;
		if (this.enablePan) this._panOffset.copy(panDir);
		this.animation.startAnimation(0);
	}
	_setOrbit(dir) {
		this.state = STATE.ORBIT;
		if (this.enableOrbit) this._orbitOffset.copy(dir);
		this.animation.startAnimation(0);
	}
	_setFocus() {
		this.state = STATE.NONE;
		if (this.object && this.enableFocus) this.focus(this.object);
		this.animation.startAnimation(0);
	}
	// ViewportControl control methods. Implement in subclass!
	pan() {
		console.warn('CameraControls: pan() not implemented!');
	}
	dolly() {
		console.warn('CameraControls: dolly() not implemented!');
	}
	orbit() {
		console.warn('CameraControls: orbit() not implemented!');
	}
	focus() {
		console.warn('CameraControls: focus() not implemented!');
	}
}
