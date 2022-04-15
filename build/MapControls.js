import { MOUSE, TOUCH } from 'three';
import { OrbitControls } from './OrbitControls';


// This set of controls performs orbiting, dollying ( zooming ), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up ( +Y by default ).
// This is very similar to OrbitControls, another set of touch behavior
//
//    Orbit - right mouse, or left mouse + ctrl/meta/shiftKey / touch: two-finger rotate
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - left mouse, or arrow keys / touch: one-finger move
export class MapControls extends OrbitControls {

	constructor() {

		super( ...arguments );
		this.screenSpacePanning = false; // pan orthogonal to world-space direction camera.up
		// Mouse buttons
		this.mouseButtons = { LEFT: MOUSE.PAN, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.ROTATE };

		// Touch fingers // TODO: deprecate touches.ONE
		this.touches = { ONE: TOUCH.PAN, TWO: TOUCH.DOLLY_ROTATE };

	}

}
