/**
 * @author arodic / https://github.com/arodic
 *
 * This class provides events and related interfaces for handling hardware
 * agnostic pointer input from mouse, touchscreen and keyboard.
 * It is inspired by PointerEvents https://www.w3.org/TR/pointerevents/
 *
 * Please report bugs at https://github.com/arodic/PointerEvents/issues
 *
 * @event contextmenu
 * @event keydown - requires focus
 * @event keyup - requires focus
 * @event wheel
 * @event focus
 * @event blur
 * @event pointerdown
 * @event pointermove
 * @event pointerhover
 * @event pointerup
 */

export class PointerEvents {
	constructor(domElement, params = {}) {
		this.domElement = domElement;
		this.pointers = new PointerArray(domElement, params.normalized);

		const scope = this;
		let dragging = false;

		function _onContextmenu(event) {
			event.preventDefault();
			scope.dispatchEvent({ type: "contextmenu" });
		}

		function _onMouseDown(event) {
			event.preventDefault();
			if (!dragging) {
				dragging = true;
				domElement.removeEventListener("mousemove", _onMouseHover, false);
				document.addEventListener("mousemove", _onMouseMove, false);
				document.addEventListener("mouseup", _onMouseUp, false);
				scope.domElement.focus();
				scope.pointers.update(event, "pointerdown");
				scope.dispatchEvent(makePointerEvent("pointerdown", scope.pointers));
			}
		}
		function _onMouseMove(event) {
			event.preventDefault();
			scope.pointers.update(event, "pointermove");
			scope.dispatchEvent(makePointerEvent("pointermove", scope.pointers));
		}
		function _onMouseHover(event) {
			scope.pointers.update(event, "pointerhover");
			// TODO: UNHACK!
			scope.pointers[0].start.copy(scope.pointers[0].position);
			scope.dispatchEvent(makePointerEvent("pointerhover", scope.pointers));
		}
		function _onMouseUp(event) {
			event.preventDefault();
			if (event.buttons === 0) {
				dragging = false;
				domElement.addEventListener("mousemove", _onMouseHover, false);
				document.removeEventListener("mousemove", _onMouseMove, false);
				document.removeEventListener("mouseup", _onMouseUp, false);
				scope.pointers.update(event, "pointerup", true);
				scope.dispatchEvent(makePointerEvent("pointerup", scope.pointers));
			}
		}

		function _onTouchDown(event) {
			event.preventDefault();
			scope.domElement.focus();
			scope.pointers.update(event, "pointerdown");
			scope.dispatchEvent(makePointerEvent("pointerdown", scope.pointers));
		}
		function _onTouchMove(event) {
			event.preventDefault();
			scope.pointers.update(event, "pointermove");
			scope.dispatchEvent(makePointerEvent("pointermove", scope.pointers));
		}
		function _onTouchHover(event) {
			scope.pointers.update(event, "pointerhover");
			scope.dispatchEvent(makePointerEvent("pointerhover", scope.pointers));
		}
		function _onTouchUp(event) {
			scope.pointers.update(event, "pointerup");
			scope.dispatchEvent(makePointerEvent("pointerup", scope.pointers));
		}

		function _onWheel(event) {
			event.preventDefault();
			// TODO: test on multiple platforms/browsers
			// Normalize deltaY due to https://bugzilla.mozilla.org/show_bug.cgi?id=1392460
			const delta = event.deltaY > 0 ? 1 : - 1;
			scope.dispatchEvent({ type: "wheel", delta: delta });
		}

		function _onFocus() {
			domElement.addEventListener("blur", _onBlur, false);
			scope.dispatchEvent({ type: "focus" });
		}
		function _onBlur() {
			domElement.removeEventListener("blur", _onBlur, false);
			scope.dispatchEvent({ type: "blur" });
		}

		{
			domElement.addEventListener("contextmenu", _onContextmenu, false);
			domElement.addEventListener("mousedown", _onMouseDown, false);
			domElement.addEventListener("mousemove", _onMouseHover, false);
			domElement.addEventListener("touchstart", _onTouchHover, false);
			domElement.addEventListener("touchstart", _onTouchDown, false);
			domElement.addEventListener("touchmove", _onTouchMove, false);
			domElement.addEventListener("touchend", _onTouchUp, false);
			domElement.addEventListener("wheel", _onWheel, false);
			domElement.addEventListener("focus", _onFocus, false);
		}

		this.dispose = function () {
			domElement.removeEventListener("contextmenu", _onContextmenu, false);
			domElement.removeEventListener("mousedown", _onMouseDown, false);
			domElement.removeEventListener("mousemove", _onMouseHover, false);
			document.removeEventListener("mousemove", _onMouseMove, false);
			document.removeEventListener("mouseup", _onMouseUp, false);
			domElement.removeEventListener("touchstart", _onTouchHover, false);
			domElement.removeEventListener("touchstart", _onTouchDown, false);
			domElement.removeEventListener("touchmove", _onTouchMove, false);
			domElement.removeEventListener("touchend", _onTouchUp, false);
			domElement.removeEventListener("wheel", _onWheel, false);
			domElement.removeEventListener("focus", _onFocus, false);
			domElement.removeEventListener("blur", _onBlur, false);
			delete this._listeners;
		};
	}
	addEventListener(type, listener) {
		this._listeners = this._listeners || {};
		this._listeners[type] = this._listeners[type] || [];
		if (this._listeners[type].indexOf(listener) === -1) {
			this._listeners[type].push(listener);
		}
	}
	hasEventListener(type, listener) {
		if (this._listeners === undefined) return false;
		return this._listeners[type] !== undefined && this._listeners[type].indexOf(listener) !== -1;
	}
	removeEventListener(type, listener) {
		if (this._listeners === undefined) return;
		if (this._listeners[type] !== undefined) {
			var index = this._listeners[type].indexOf(listener);
			if (index !== -1) this._listeners[type].splice(index, 1);
		}
	}
	dispatchEvent(event) {
		if (this._listeners === undefined) return;
		if (this._listeners[event.type] !== undefined) {
			// event.target = this; // TODO: consider adding target!
			var array = this._listeners[event.type].slice(0);
			for (var i = 0, l = array.length; i < l; i ++) {
				array[i].call(this, event);
			}
		}
	}
}

class Pointer {
	constructor(pointerID, target, type, pointerType) {
		this.pointerID = pointerID;
		this.target = target;
		this.type = type;
		this.pointerType = pointerType;
		this.position = new Vector2();
		this.previous = new Vector2();
		this.start = new Vector2();
		this.movement = new Vector2();
		this.distance = new Vector2();
		this.button = -1;
		this.buttons = 0;
	}
	update(previous) {
		this.pointerID = previous.pointerID;
		this.previous.copy(previous.position);
		this.start.copy(previous.start);
		this.movement.copy(this.position).sub(previous.position);
		this.distance.copy(this.position).sub(this.start);
	}
}

class PointerArray extends Array {
	constructor(target, normalized) {
		super();
		this.normalized = normalized || false;
		this.target = target;
		this.previous = [];
		this.removed = [];
	}
	update(event, type, remove) {

		this.previous.length = 0;
		this.removed.length = 0;

		for (var i = 0; i < this.length; i++) {
			this.previous.push(this[i]);
		}
		this.length = 0;

		const rect = this.target.getBoundingClientRect();

		let touches = event.touches ? event.touches : [event];
		let pointerType = event.touches ? 'touch' : 'mouse';
		let buttons = event.buttons || 1;

		let id = 0;
		if (!remove) for (let i = 0; i < touches.length; i++) {
			if (isTouchInTarget(touches[i], this.target) || event.touches === undefined) {
				let pointer =  new Pointer(id, this.target, type, pointerType);
				pointer.position.x = touches[i].clientX - rect.x;
				pointer.position.y = touches[i].clientY - rect.y;
				if (this.normalized) {
					const rect = this.target.getBoundingClientRect();
					pointer.position.x = (pointer.position.x - rect.left) / rect.width * 2.0 - 1.0;
					pointer.position.y = (pointer.position.y - rect.top) / rect.height * - 2.0 + 1.0;
				}
				pointer.previous.copy(pointer.position);
				pointer.start.copy(pointer.position);
				pointer.buttons = buttons;
				pointer.button = -1;
				if (buttons === 1 || buttons === 3 || buttons === 5 || buttons === 7) pointer.button = 0;
				else if (buttons === 2 || buttons === 6) pointer.button = 1;
				else if (buttons === 4) pointer.button = 2;
				pointer.altKey = event.altKey;
				pointer.ctrlKey = event.ctrlKey;
				pointer.metaKey = event.metaKey;
				pointer.shiftKey = event.shiftKey;
				this.push(pointer);
				id++;
			}
		}

		if (!remove) for (let i = 0; i < this.length; i++) {
			if (this.previous.length) {
				let closest = getClosest(this[i], this.previous);
				if (getClosest(closest, this) !== this[i]) closest = null;
				if (closest) {
					this[i].update(closest);
					this.previous.splice(this.previous.indexOf(closest), 1);
				}
			}
		}

		for (let i = this.previous.length; i--;) {
			this.removed.push(this.previous[i]);
			this.previous.splice(i, 1);
		}
	}
}

function makePointerEvent(type, pointers) {
	const event = Object.assign({ type: type }, pointers);
	event.length = pointers.length;
	return event;
}

function isTouchInTarget(event, target) {
	let eventTarget = event.target;
	while (eventTarget) {
		if (eventTarget === target) return true;
		eventTarget = eventTarget.parentElement;
	}
	return false;
}


function getClosest(pointer, pointers) {
	let closestDist = Infinity;
	let closest;
	for (let i = 0; i < pointers.length; i++) {
		let dist = pointer.position.distanceTo(pointers[i].position);
		if (dist < closestDist) {
			closest = pointers[i];
			closestDist = dist;
		}
	}
	return closest;
}

class Vector2 {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	copy(v) {
		this.x = v.x;
		this.y = v.y;
		return this;
	}
	add(v) {
		this.x += v.x;
		this.y += v.y;
		return this;
	}
	sub(v) {
		this.x -= v.x;
		this.y -= v.y;
		return this;
	}
	length() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
	distanceTo(v) {
		const dx = this.x - v.x;
		const dy = this.y - v.y;
		return Math.sqrt(dx * dx + dy * dy);
	}
}
