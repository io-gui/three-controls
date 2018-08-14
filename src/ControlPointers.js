import {Vector2} from "../../three.js/build/three.module.js";

class Pointer {
	constructor() {
		this.position = new Vector2();
		this.previous = new Vector2();
		this.movement = new Vector2();
		this.velocity = new Vector2();
		this.distance = new Vector2();
		this.start = new Vector2();
		this.button = undefined;
	}
	copy( pointer ) {
		this.position.copy( pointer.position );
		this.previous.copy( pointer.previous );
		this.movement.copy( pointer.movement );
		this.velocity.copy( pointer.velocity );
		this.distance.copy( pointer.distance );
		this.start.copy( pointer.start );
	}
	update( pointer, buttons, dt ) {
		let button = 0;
		if ( event.buttons === 2 ) button = 1;
		if ( event.buttons === 4 ) button = 2;
		this.previous.copy( this.position );
		this.movement.copy( pointer.position ).sub( this.position );
		this.velocity.copy( this.movement ).multiplyScalar( 1 / dt );
		this.distance.copy( pointer.position ).sub( this.start );
		this.position.copy( pointer.position );
		this.button = button;
		this.buttons = buttons;
	}
}

// normalize mouse / touch pointer and remap {x,y} to view space.
export class ControlPointers extends Array {
	constructor() {
		super();
		this.ctrlKey = false;
		this.shiftKey = false;
		this.metaKey = false;
		this.altKey = false;
		this.removed = [];

		Object.defineProperty( this, 'time', { value: 0, enumerable: false, writable: true } );
	}
	getClosest( reference ) {
		let closest = this[0];
		for ( let i = 1; i < this.length; i++ ) {
			if ( reference.position.distanceTo( this[i].position ) < reference.position.distanceTo( closest.position ) ) {
				closest = this[i];
			}
		}
		return closest;
	}
	update( event, domElement, remove ) {
		this.ctrlKey = event.ctrlKey;
		this.shiftKey = event.shiftKey;
		this.metaKey = event.metaKey;
		this.altKey = event.altKey;
		this.removed = [];

		let dt = ( performance.now() - this.time ) / 1000;
		this.time = performance.now();

		let touches = event.touches ? event.touches : [event];
		let foundPointers = [];
		let rect = domElement.getBoundingClientRect();
		for ( let i = 0; i < touches.length; i++ ) {
			if ( touches[i].target === event.target || event.touches === undefined ) {
				let position = new Vector2(
					( touches[i].clientX - rect.left ) / rect.width * 2.0 - 1.0,
					- ( ( touches[i].clientY - rect.top ) / rect.height * 2.0 - 1.0 )
				);
				if ( this[i] === undefined ) {
					this[i] = new Pointer();
					this[i].start.copy( position );
				}
				let newPointer = new Pointer();
				newPointer.position.copy( position );
				let pointer = this.getClosest( newPointer );
				pointer.update( newPointer, event.buttons, dt );
				foundPointers.push( pointer );
			}
		}
		if ( remove ) foundPointers = [];
		for ( let i = this.length; i--; ) {
			if ( foundPointers.indexOf( this[i] ) === -1 ) {
				this.removed.push( this[i] );
				this.splice( i, 1 );
			}
		}
	}
}
