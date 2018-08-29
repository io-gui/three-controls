/**
 * @author arodic / https://github.com/arodic
 */

import {Object3D} from "../../three.js/build/three.module.js";
import {PointerEvents} from "./PointerEvents.js";

// TODO: documentation
/*
 * onKeyDown, onKeyUp require domElement to be focused (set tabindex attribute)
*/

// TODO: implement dom element swap and multiple dom elements

export class Control extends Object3D {
	constructor( domElement ) {
		super();

		if ( domElement === undefined || !(domElement instanceof HTMLElement) ) {
			console.warn( 'Control: domElement is mandatory in constructor!' );
			domElement = document;
		}

		const pointerEvents = new PointerEvents( domElement, { normalized: true } );

		this.defineProperties({
			domElement: domElement,
			enabled: true,
			active: false,
			enableKeys: true,
			needsUpdate: false,
			_animationActive: false,
			_animationTime: 0,
			_rafID: 0
		});

		this.onPointerDown = this.onPointerDown.bind(this);
		this.onPointerHover = this.onPointerHover.bind(this);
		this.onPointerMove = this.onPointerMove.bind(this);
		this.onPointerUp = this.onPointerUp.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
		this.onKeyUp = this.onKeyUp.bind(this);
		this.onWheel = this.onWheel.bind(this);
		this.onContextmenu = this.onContextmenu.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.onBlur = this.onBlur.bind(this);

		pointerEvents.addEventListener( 'pointerdown', this.onPointerDown );
		pointerEvents.addEventListener( 'pointerhover', this.onPointerHover );
		pointerEvents.addEventListener( 'pointermove', this.onPointerMove );
		pointerEvents.addEventListener( 'pointerup', this.onPointerUp );
		pointerEvents.addEventListener( 'keydown', this.onKeyDown );
		pointerEvents.addEventListener( 'keyup', this.onKeyUp );
		pointerEvents.addEventListener( 'wheel', this.onWheel );
		pointerEvents.addEventListener( 'contextmenu', this.onContextmenu );
		pointerEvents.addEventListener( 'focus', this.onFocus );
		pointerEvents.addEventListener( 'blur', this.onBlur );

		this.dispose = function () {
			pointerEvents.removeEventListener( 'pointerdown', this.onPointerDown );
			pointerEvents.removeEventListener( 'pointerhover', this.onPointerHover );
			pointerEvents.removeEventListener( 'pointermove', this.onPointerMove );
			pointerEvents.removeEventListener( 'pointerup', this.onPointerUp );
			pointerEvents.removeEventListener( 'keydown', this.onKeyDown );
			pointerEvents.removeEventListener( 'keyup', this.onKeyUp );
			pointerEvents.removeEventListener( 'wheel', this.onWheel );
			pointerEvents.removeEventListener( 'contextmenu', this.onContextmenu );
			pointerEvents.removeEventListener( 'focus', this.onFocus );
			pointerEvents.removeEventListener( 'blur', this.onBlur );
			pointerEvents.dispose();
			this.stopAnimation();
		};

		this.needsUpdate = true;
	}
	needsUpdateChanged( value ) {
		if ( value ) this.startAnimation();
	}
	enabledChanged( value ) {
		if ( value ) {
			this.startAnimation();
		} else {
			this.stopAnimation();
		}
	}
	// Optional animation methods
	startAnimation() {
		if ( !this._animationActive ) {
			this._animationActive = true;
			this._animationTime = performance.now();
			this._rafID = requestAnimationFrame(() => {
				const time = performance.now();
				this.animate( time - this._animationTime );
				this._animationTime = time;
			} );
		}
	}
	animate( timestep ) {
		if ( this._animationActive ) this._rafID = requestAnimationFrame(() => {
			const time = performance.now();
			timestep = time - this._animationTime;
			this.animate( timestep );
			this._animationTime = time;
		} );
		this.update( timestep );
	}
	stopAnimation() {
		this._animationActive = false;
		cancelAnimationFrame( this._rafID );
	}
	update( timestep ) {
		if ( timestep === undefined ) console.log( 'Control: update function requires timestep parameter!' );
		this.stopAnimation();
		this.needsUpdate = false;
	}
	// Control methods. Implement in subclass!
	onContextmenu() {} // event
	onPointerHover() {} // pointer
	onPointerDown() {} // pointer
	onPointerMove() {} // pointer
	onPointerUp() {} // pointer
	onPointerLeave() {} // pointer
	onKeyDown() {} // event
	onKeyUp() {} // event
	onWheel() {} // event
	onFocus() {} // event
	onBlur() {} // event
	// Defines getter, setter and store for a property
	defineProperty( propName, defaultValue ) {
		this._properties[propName] = defaultValue;
		if (defaultValue === undefined) {
			console.warn('Control: ' + propName + ' is mandatory!');
		}
		Object.defineProperty( this, propName, {
			get: function() {
				return this._properties[propName] !== undefined ? this._properties[propName] : defaultValue;
			},
			set: function( value ) {
				if ( this._properties[propName] !== value ) {
					const oldValue = this._properties[propName];
					this._properties[propName] = value;
					if ( typeof this[ propName + "Changed" ] === 'function' ) this[ propName + "Changed" ]( value, oldValue );
					this.dispatchEvent( { type: propName + "-changed", value: value, oldValue: oldValue } );
					this.dispatchEvent( { type: "change", prop: propName, value: value, oldValue: oldValue } );
				}
			},
			enumerable: propName.charAt(0) !== '_'
		} );
		this[propName] = defaultValue;
	}
	defineProperties( props ) {
		if ( !this.hasOwnProperty( '_properties' ) ) {
			Object.defineProperty(this, '_properties', {
				value: {},
				enumerable: false
			} );
		}
		for ( let prop in props ) {
			this.defineProperty( prop, props[prop] );
		}
	}
}
