import {IoCore} from "../../io/build/io-core.js";

/*
 * Creates a single requestAnimationFrame loop.
 * provides methods to control animation and update event to hook into animation updates.
 */

export class Animation extends IoCore {
	constructor() {
		super();
		this._active = false;
		this._time = 0;
		this._timeRemainging = 0;
		this._rafID = 0;
	}
	startAnimation(duration) {
		this._timeRemainging = Math.max(this._timeRemainging, duration * 1000 || 0);
		if (!this._active) {
			this._active = true;
			this._time = performance.now();
			this._rafID = requestAnimationFrame(() => {
				const time = performance.now();
				const timestep = time - this._time;
				this.animate(timestep, time);
				this._time = time;
				this._timeRemainging = Math.max(this._timeRemainging - timestep, 0);
			});
		}
	}
	animate(timestep, time) {
		if (this._active && this._timeRemainging) {
				this._rafID = requestAnimationFrame(() => {
				const time = performance.now();
				timestep = time - this._time;
				this.animate(timestep, time);
				this._time = time;
				this._timeRemainging = Math.max(this._timeRemainging - timestep, 0);
			});
		} else {
			this.stopAnimation(timestep, time);
		}
		this.dispatchEvent('update', {timestep: timestep});
	}
	stopAnimation() {
		this._active = false;
		cancelAnimationFrame(this._rafID);
	}
}
// TODO: dispose
