/**
 * @author arodic / https://github.com/arodic
 *
 * Minimal implementation of io mixin: https://github.com/arodic/io
 * Includes event listener/dispatcher and defineProperties() method.
 * Changed properties trigger "changed" and "[prop]-changed" events as well as
 * execution of [prop]Changed() funciton if defined.
 */

export const IoLiteMixin = (superclass) => class extends superclass {
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
		event.target = this;
		if (this._listeners && this._listeners[event.type] !== undefined) {
			var array = this._listeners[event.type].slice(0);
			for (var i = 0, l = array.length; i < l; i ++) {
				array[i].call(this, event);
			}
		} else if (this.parent && event.bubbles) {
			// console.log(event.type, event.target)
		}
	}
	// Define properties in builk.
	defineProperties(props) {
		//Define store for properties.
		if (!this.hasOwnProperty('_properties')) {
			Object.defineProperty(this, '_properties', {
				value: {},
				enumerable: false
			});
		}
		for (let prop in props) {
			defineProperty(this, prop, props[prop]);
		}
	}
	// TODO: dispose
}

// Defines getter, setter
const defineProperty = function(scope, propName, propDef) {

	let observer = propName + 'Changed';
	let initValue = propDef;

	if (propDef && typeof propDef === 'object' && propDef.value !== undefined) {

		initValue = propDef.value;

		if (typeof propDef.observer === 'string') {
			observer = propDef.observer;
		}

	}



	scope._properties[propName] = initValue;
	if (initValue === undefined) {
		console.warn('IoLiteMixin: ' + propName + ' is mandatory!');
	}
	Object.defineProperty(scope, propName, {
		get: function() {
			return scope._properties[propName] !== undefined ? scope._properties[propName] : initValue;
		},
		set: function(value) {
			if (scope._properties[propName] !== value) {
				const oldValue = scope._properties[propName];
				scope._properties[propName] = value;
				if (typeof scope[observer] === 'function') scope[observer](value, oldValue);
				scope.dispatchEvent({type: propName + '-changed', value: value, oldValue: oldValue, bubbles: true});
				scope.dispatchEvent({type: 'change', property: propName, value: value, oldValue: oldValue});
			}
		},
		enumerable: propName.charAt(0) !== '_'
	});
	scope[propName] = initValue;
}
