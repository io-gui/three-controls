import {IoNode} from "../../io/build/io-core.js";

/*
 * Creates a single requestAnimationFrame loop.
 * provides methods to control animation and update event to hook into animation updates.
 */

let time = performance.now();
const animationQueue = [];
const animate = function() {
  const newTime = performance.now();
  const timestep = newTime - time;
  time = newTime;
  for (let i = animationQueue.length; i--;) {
    animationQueue[i].animate(timestep, time);
  }
  requestAnimationFrame(animate);
};
requestAnimationFrame(animate);

export class Animation extends IoNode {
  constructor() {
    super();
    this._time = 0;
    this._timeRemainging = 0;
  }
  startAnimation(duration) {
    this._time = 0;
    this._timeRemainging = Math.max(this._timeRemainging, duration * 1000 || 0);
    if (animationQueue.indexOf(this) === -1) animationQueue.push(this);
  }
  animate(timestep, time) {
    if (this._timeRemainging >= 0) {
      this._time = this._time + timestep;
      this._timeRemainging = this._timeRemainging - timestep;
      // this.dispatchEvent('animation', {timestep: timestep, time: time});
      this.dispatchEvent('update', {timestep: timestep, time: time});
    } else {
      this.stop();
    }
  }
  stop() {
    this._time = 0;
    this._timeRemainging = 0;
    animationQueue.splice(animationQueue.indexOf(this), 1);
  }
  stopAnimation() {
    this.stop();
    this._active = false;
  }
  // TODO: dispose
}
