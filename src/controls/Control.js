/**
 * @author arodic / https://github.com/arodic
 */

import {Object3D} from "../../../three.js/build/three.module.js";
import {ControlPointers} from "./ControlPointers.js";

export class Control extends Object3D {
	constructor(domElement) {
		super();
		this.visible = false;

		if (domElement === undefined) {
			console.warn('Control: domElement is mandatory in constructor!');
			domElement = document;
		}

		this.defineProperties({
			"enabled": true,
			"hovered": true,
			"domElement": domElement,
			"pointers": new ControlPointers()
		});

		var scope = this;

		function _onContextMenu(event) {
			if (!scope.enabled) return;
			event.preventDefault();
			scope.onContextMenu(event);
			scope.dispatchEvent({ type: "contextmenu" }); // TODO: detail/value?
		}
		function _onHover(event) {
			if (!scope.enabled) return;
			if (!this.hovered) {
				window.addEventListener("keydown", _onKeyDown, false);
				window.addEventListener("keyup", _onKeyUp, false);
			}
			this.hovered = true;
			scope.pointers.update(event, domElement);
			scope.onPointerHover(scope.pointers);
			scope.dispatchEvent({ type: "hover" }); // TODO: detail/value?
		}
		function _onLeave(event) {
			if (!scope.enabled) return;
			if (this.hovered) {
				window.removeEventListener("keydown", _onKeyDown, false);
				window.removeEventListener("keyup", _onKeyUp, false);
			}
			this.hovered = false;
			scope.pointers.update(event, domElement);
			scope.onPointerLeave(scope.pointers);
			scope.dispatchEvent({ type: "pointerleave" }); // TODO: detail/value?
		}
		function _onDown(event) {
			if (!scope.enabled) return;
			scope.pointers.update(event, domElement);
			scope.onPointerHover(scope.pointers);
			scope.onPointerDown(scope.pointers);
			domElement.removeEventListener("mousemove", _onHover);
			document.addEventListener("mousemove", _onMove, false);
			document.addEventListener("mouseup", _onUp, false);
			scope.dispatchEvent({ type: "pointerdown" }); // TODO: detail/value?
		}
		function _onMove(event) {
			if (!scope.enabled) {
				document.removeEventListener("mousemove", _onMove, false);
				document.removeEventListener("mouseup", _onUp, false);
				return;
			};
			scope.pointers.update(event, domElement);
			scope.onPointerMove(scope.pointers);
			scope.dispatchEvent({ type: "pointermove" }); // TODO: detail/value?
		}
		function _onUp(event) {
			if (!scope.enabled) return;
			scope.pointers.update(event, domElement, !event.touches);
			scope.onPointerUp(scope.pointers);
			domElement.addEventListener("mousemove", _onHover);
			document.removeEventListener("mousemove", _onMove, false);
			document.removeEventListener("mouseup", _onUp, false);
			scope.dispatchEvent({ type: "pointerup" }); // TODO: detail/value?
		}
		function _onKeyDown(event) {
			if (!scope.enabled) return;
			scope.onKeyDown(event);
			scope.dispatchEvent({ type: "keydown" }); // TODO: detail/value?
		}
		function _onKeyUp(event) {
			if (!scope.enabled) return;
			scope.onKeyUp(event);
			scope.dispatchEvent({ type: "keyup" }); // TODO: detail/value?
		}

		function _onWheel(event) {
			if (!scope.enabled) return;
			scope.onWheel(event);
			scope.dispatchEvent({ type: "wheel" }); // TODO: detail/value?
		}

		{
			domElement.addEventListener("mousedown", _onDown, false);
			domElement.addEventListener("touchstart", _onDown, false);
			domElement.addEventListener("mousemove", _onHover, false);
			domElement.addEventListener("touchmove", _onMove, false);
			domElement.addEventListener("touchend", _onUp, false);
			domElement.addEventListener("touchcancel", _onLeave, false);
			domElement.addEventListener("touchleave", _onLeave, false);
			domElement.addEventListener("mouseleave", _onLeave, false);
			domElement.addEventListener("contextmenu", _onContextMenu, false);
			domElement.addEventListener("wheel", _onWheel, false);
		}

		this.dispose = function () {
			domElement.removeEventListener("mousedown", _onDown);
			domElement.removeEventListener("touchstart", _onDown);
			domElement.removeEventListener("mousemove", _onHover);
			document.removeEventListener("mousemove", _onMove);
			domElement.removeEventListener("touchmove", _onMove);
			document.removeEventListener("mouseup", _onUp);
			domElement.removeEventListener("touchend", _onUp);
			domElement.removeEventListener("touchcancel", _onLeave);
			domElement.removeEventListener("touchleave", _onLeave);
			domElement.removeEventListener("mouseleave", _onLeave);
			domElement.removeEventListener("contextmenu", _onContextMenu);
			window.removeEventListener("keydown", _onKeyDown, false);
			window.removeEventListener("keyup", _onKeyUp, false);
			domElement.removeEventListener("wheel", _onWheel, false);
			this.stopAnimation();
		};

		this._animationActive = false;
		this._animationTime = 0;
		this._rafID;
	}

	startAnimation() {
		if (!this._animationActive) {
			this._animationActive = true;
			this._animationTime = performance.now();
			this._rafID = requestAnimationFrame( () => {
				const time = performance.now();
				this.animate( time - this._animationTime );
				this._animationTime = time;
			} );
		}
	}
	animate( timestep ) {
		if (this._animationActive) this._rafID = requestAnimationFrame( () => {
			const time = performance.now();
			this.animate( time - this._animationTime )
			this._animationTime = time;
		} );
	}
	stopAnimation() {
		this._animationActive = false
		cancelAnimationFrame(this._rafID);
	}

	// Defined getter, setter and store for a property
	defineProperty(propName, defaultValue) {
		var propValue = defaultValue;
		Object.defineProperty(this, propName, {
			get: function() {
				return propValue !== undefined ? propValue : defaultValue;
			},
			set: function(value) {
				if (propValue !== value) {
					propValue = value;
					this.dispatchEvent({ type: propName + "-changed", value: value });
					this.dispatchEvent({ type: "change", prop: propName, value: value });
				}
			}
		});
		this[propName] = defaultValue;
		setTimeout(() => {
			this.dispatchEvent({ type: propName + "-changed", value: defaultValue });
			this.dispatchEvent({ type: "change", prop: propName, value: defaultValue });
		});
	}
	defineProperties(props) {
		for (var prop in props) {
			this.defineProperty(prop, props[prop]);
		}
	}

	attach(object) {
		this.object = object;
		this.visible = true;
	}
	detach() {
		this.object = undefined;
		this.visible = false;
	}
	onContextMenu(event) { event; }
	onPointerHover(pointer) { pointer; }
	onPointerDown(pointer) { pointer; }
	onPointerMove(pointer) { pointer; }
	onPointerUp(pointer) { pointer; }
	onPointerLeave(pointer) { pointer; }
	onKeyDown(event) { event; }
	onKeyUp(event) { event; }
	onWheel(event) { event; }
}
