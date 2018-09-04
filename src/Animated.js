/**
 * @author arodic / https://github.com/arodic
 */

import {Interactive} from "./Interactive.js";

// TODO: documentation
/*
 * onKeyDown, onKeyUp require domElement to be focused (set tabindex attribute)
 */

// TODO: nuke this class. Find better way to animate props.
// TODO: implement dom element swap and multiple dom elements

export class Animated extends Interactive {
	get isAnimated() { return true; }
	constructor(domElement) {
		super(domElement);

		this.defineProperties({
			needsUpdate: false,
			_animationActive: false,
			_animationTime: 0,
			_rafID: 0
		});

		this.needsUpdate = true;
	}
	dispose() {
		super.dispose();
		this.stopAnimation();
	}
	needsUpdateChanged(value) {
		if (value) this.startAnimation();
	}
	enabledChanged(value) {
		if (value) {
			this._addEvents();
			this.startAnimation();
		} else {
			this._removeEvents();
			this.stopAnimation();
		}
	}
	// Optional animation methods
	startAnimation() {
		if (!this._animationActive) {
			this._animationActive = true;
			this._animationTime = performance.now();
			this._rafID = requestAnimationFrame(() => {
				const time = performance.now();
				this.animate(time - this._animationTime);
				this._animationTime = time;
			});
		}
	}
	animate(timestep) {
		if (this._animationActive) this._rafID = requestAnimationFrame(() => {
			const time = performance.now();
			timestep = time - this._animationTime;
			this.animate(timestep);
			this._animationTime = time;
		});
		this.update(timestep);
	}
	stopAnimation() {
		this._animationActive = false;
		cancelAnimationFrame(this._rafID);
	}
	update(timestep) {
		if (timestep === undefined) console.log('Control: update function requires timestep parameter!');
		this.stopAnimation();
		this.needsUpdate = false;
	}
}
