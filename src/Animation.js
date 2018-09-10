/**
 * @author arodic / https://github.com/arodic
 */

import {IoLiteMixin} from "../lib/IoLiteMixin.js";

/*
 * Creates a single requestAnimationFrame loop thread.
 * provides methods to control animation and events to hook into animation updates.
 */

let animationsActive = 0;

export class Animation extends IoLiteMixin(Object) {
	get isAnimation() { return true; }
	constructor(props) {
		super(props);
		this.defineProperties({
			_active: false,
			_animationTime: 0,
			_animationTimeRemainging: 0,
			_rafID: 0
		});
	}
	startAnimation(duration) {
		this._animationTimeRemainging = Math.max(this._animationTimeRemainging, duration * 1000 || 0);
		if (!this._active) {
			this._active = true;
			this._animationTime = performance.now();
			this._rafID = requestAnimationFrame(() => {
				const time = performance.now();
				const timestep = time - this._animationTime;
				this.dispatchEvent({type: 'start', timestep: timestep, time: time});
				this.animate(timestep, time);
				this._animationTime = time;
				this._animationTimeRemainging = Math.max(this._animationTimeRemainging - timestep, 0);
			});
		}
	}
	animate(timestep, time) {
		if (this._active && this._animationTimeRemainging) {
				this._rafID = requestAnimationFrame(() => {
				const time = performance.now();
				timestep = time - this._animationTime;
				this.animate(timestep, time);
				this._animationTime = time;
				this._animationTimeRemainging = Math.max(this._animationTimeRemainging - timestep, 0);
			});
		} else {
			this.stopAnimation(timestep, time);
		}
		this.dispatchEvent({type: 'update', timestep: timestep, time: time});
	}
	stopAnimation() {
		const time = performance.now();
		const timestep = time - this._animationTime;
		this.dispatchEvent({type: 'stop', timestep: timestep, time: time});
		this._active = false;
		cancelAnimationFrame(this._rafID);
	}
}
