/**
 * @author arodic / https://github.com/arodic
 */

import {IoLiteMixin} from "../lib/IoLiteMixin.js";

/*
 * Creates a single requestAnimationFrame loop thread.
 * provides methods to control animation and events to hook into animation updates.
 */

export class Animation extends IoLiteMixin(Object) {
	get isAnimation() { return true; }
	constructor(props) {
		super(props);
		this.defineProperties({
			_active: false,
			_time: 0,
			_timeRemainging: 0,
			_rafID: 0
		});
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
		this.dispatchEvent({type: 'update', timestep: timestep});
	}
	stopAnimation() {
		this._active = false;
		cancelAnimationFrame(this._rafID);
	}
}
// TODO: dispose
