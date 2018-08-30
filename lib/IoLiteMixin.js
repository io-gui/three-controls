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
		if (this._listeners === undefined) return;
		if (this._listeners[event.type] !== undefined) {
			event.target = this;
			var array = this._listeners[event.type].slice(0);
			for (var i = 0, l = array.length; i < l; i ++) {
				array[i].call(this, event);
			}
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
}

// Defines getter, setter
const defineProperty = function(scope, propName, defaultValue) {
	scope._properties[propName] = defaultValue;
	if (defaultValue === undefined) {
		console.warn('IoLiteMixin: ' + propName + ' is mandatory!');
	}
	Object.defineProperty(scope, propName, {
		get: function() {
			return scope._properties[propName] !== undefined ? scope._properties[propName] : defaultValue;
		},
		set: function(value) {
			if (scope._properties[propName] !== value) {
				const oldValue = scope._properties[propName];
				scope._properties[propName] = value;
				if (typeof scope[propName + 'Changed'] === 'function') scope[propName + 'Changed'](value, oldValue);
				scope.dispatchEvent({type: propName + '-changed', value: value, oldValue: oldValue});
				scope.dispatchEvent({type: 'change', prop: propName, value: value, oldValue: oldValue});
			}
		},
		enumerable: propName.charAt(0) !== '_'
	});
	scope[propName] = defaultValue;
}
