/**
 * @author arodic / https://github.com/arodic
 */

import {BufferGeometry, CylinderBufferGeometry, Float32BufferAttribute, Uint16BufferAttribute} from "../../lib/three.module.js";
import {HelperGeometry} from "./HelperGeometry.js";

const PI = Math.PI;
const HPI = PI / 2;
const EPS = 0.000001;

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

		let uv = [];
		uv[ 0 ] = 1; uv[ 1 ] = 1;
		uv[ 2 ] = 0; uv[ 3 ] = 1;
		uv[ 4 ] = 0; uv[ 5 ] = 0;
		uv[ 6 ] = 1; uv[ 7 ] = 0;
		uv[ 8 ] = 1; uv[ 9 ] = 1;
		uv[ 10 ] = 0; uv[ 11 ] = 1;
		uv[ 12 ] = 0; uv[ 13 ] = 0;
		uv[ 14 ] = 1; uv[ 15 ] = 0;

		geometry.addAttribute('position', new Float32BufferAttribute(positions, 3));
		geometry.addAttribute('normal', new Float32BufferAttribute(positions, 3));
		geometry.addAttribute('uv', new Float32BufferAttribute(uv, 2));

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
