/**
 * @author arodic / https://github.com/arodic
 */

import {Object3D, Vector2} from "../../three.js/build/three.module.js";
import {Listener} from "./Listener.js";

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

		const listener = new Listener( domElement );

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

		listener.addEventListener( 'pointerdown', this.onPointerDown );
		listener.addEventListener( 'pointerhover', this.onPointerHover );
		listener.addEventListener( 'pointermove', this.onPointerMove );
		listener.addEventListener( 'pointerup', this.onPointerUp );
		listener.addEventListener( 'keydown', this.onKeyDown );
		listener.addEventListener( 'keyup', this.onKeyUp );
		listener.addEventListener( 'wheel', this.onWheel );
		listener.addEventListener( 'contextmenu', this.onContextmenu );
		listener.addEventListener( 'focus', this.onFocus );
		listener.addEventListener( 'blur', this.onBlur );

		this.dispose = function () {
			listener.removeEventListener( 'pointerdown', this.onPointerDown );
			listener.removeEventListener( 'pointerhover', this.onPointerHover );
			listener.removeEventListener( 'pointermove', this.onPointerMove );
			listener.removeEventListener( 'pointerup', this.onPointerUp );
			listener.removeEventListener( 'keydown', this.onKeyDown );
			listener.removeEventListener( 'keyup', this.onKeyUp );
			listener.removeEventListener( 'wheel', this.onWheel );
			listener.removeEventListener( 'contextmenu', this.onContextmenu );
			listener.removeEventListener( 'focus', this.onFocus );
			listener.removeEventListener( 'blur', this.onBlur );
			listener.dispose();
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
