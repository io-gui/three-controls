/**
 * @author arodic / https://github.com/arodic
 */

import {BufferGeometry, CylinderBufferGeometry, Float32BufferAttribute, Uint16BufferAttribute} from "../../lib/three.module.js";
import {HelperGeometry} from "./HelperGeometry.js";

const PI = Math.PI;
const HPI = Math.PI / 2;
const EPS = 0.000001;

export const colors = {
	'white': [1, 1, 1],
	'whiteTransparent': [1, 1, 1, 0.25],
	'gray': [0.75, 0.75, 0.75],
	'red': [1, 0.3, 0.2],
	'green': [0.2, 1, 0.2],
	'blue': [0.2, 0.3, 1],
	'cyan': [0.2, 1, 1],
	'magenta': [1, 0.3, 1],
	'yellow': [1, 1, 0.2],
}

export class PlaneGeometry extends HelperGeometry {
	constructor() {

		let geometry = new BufferGeometry();

		let indices = [
			0, 1, 2, 2, 3, 0, 4, 1, 0, 5, 1, 4, 1, 6, 2, 1, 5, 6,
			0, 3, 7, 4, 0, 7, 7, 2, 6, 2, 7, 3, 7, 6, 4, 4, 6, 5
		];
		geometry.index = new Uint16BufferAttribute( indices, 1 );

		let positions = [];
		positions[ 0 ] = 1; positions[ 1 ] = 1; positions[ 2 ] = 1;
		positions[ 3 ] = -1; positions[ 4 ] = 1; positions[ 5 ] = 1;
		positions[ 6 ] = -1; positions[ 7 ] = -1; positions[ 8 ] = 1;
		positions[ 9 ] = 1; positions[ 10 ] = -1; positions[ 11 ] = 1;
		positions[ 12 ] = 1; positions[ 13 ] = 1; positions[ 14 ] = -1;
		positions[ 15 ] = -1; positions[ 16 ] = 1; positions[ 17 ] = -1;
		positions[ 18 ] = -1; positions[ 19 ] = -1; positions[ 20 ] = -1;
		positions[ 21 ] = 1; positions[ 22 ] = -1; positions[ 23 ] = -1;

		geometry.addAttribute('position', new Float32BufferAttribute(positions, 3));
		geometry.addAttribute('normal', new Float32BufferAttribute(positions, 3));

		super([
			[geometry, {scale: [0.5, 0.5, 0.00001]}]
		]);
	}
}

export class LineGeometry extends HelperGeometry {
	constructor() {
		super(new CylinderBufferGeometry(EPS, EPS, 1, 16, 2, false), {position: [0, 0, 0], thickness: 1});
	}
}

export class Corner2Geometry extends HelperGeometry {
	constructor() {
		super([
			[new CylinderBufferGeometry(EPS, EPS, 1, 5, 2, false), {position: [0.5, 0, 0], rotation: [0, 0, HPI], thickness: 1}],
			[new CylinderBufferGeometry(EPS, EPS, 1, 5, 2, false), {position: [0, 0, 0.5], rotation: [HPI, 0, 0], thickness: 1}],
		]);
	}
}

export class Corner3Geometry extends HelperGeometry {
	constructor() {
		super([
			[new CylinderBufferGeometry(EPS, EPS, 1, 5, 2, false), {color: [1, 0, 0], position: [0.5, 0, 0], rotation: [0, 0, HPI], thickness: 1}],
			[new CylinderBufferGeometry(EPS, EPS, 1, 5, 2, false), {color: [0, 1, 0], position: [0, 0.5, 0], rotation: [0, HPI, 0], thickness: 1}],
			[new CylinderBufferGeometry(EPS, EPS, 1, 5, 2, false), {color: [0, 0, 1], position: [0, 0, 0.5], rotation: [HPI, 0, 0], thickness: 1}],
		]);
	}
}
