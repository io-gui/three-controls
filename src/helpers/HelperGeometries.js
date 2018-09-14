/**
 * @author arodic / https://github.com/arodic
 */

import {
	Mesh, Vector3, Euler, Quaternion, Matrix4, BufferGeometry, SphereBufferGeometry, CylinderBufferGeometry,
	OctahedronBufferGeometry, TorusBufferGeometry, Float32BufferAttribute, Uint16BufferAttribute
} from "../../lib/three.module.js";

import {HelperMesh} from "./HelperMesh.js";
import {HelperGeometry} from "./HelperGeometry.js";

const PI = Math.PI;
const HPI = Math.PI / 2;
const EPS = 0.000001;

export class GeosphereGeometry extends OctahedronBufferGeometry {
	constructor() {
		super(1, 3);
	}
}

export class OctahedronGeometry extends OctahedronBufferGeometry {
	constructor() {
		super(1, 0);
	}
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

export class ConeGeometry extends HelperGeometry {
	constructor() {
		super([
			[new CylinderBufferGeometry(0, 0.2, 1, 8, 2), {position: [0, 0.5, 0]}],
			[new SphereBufferGeometry(0.2, 8, 8)],
		]);
	}
}

export class LineGeometry extends HelperGeometry {
	constructor() {
		super([
			[new CylinderBufferGeometry(EPS, EPS, 1, 16, 2, false), {position: [0, 0, 0], thickness: 1}],
			[new SphereBufferGeometry(EPS, 4, 4), {position: [0, -0.5, 0], thickness: 1}],
			[new SphereBufferGeometry(EPS, 4, 4), {position: [0, 0.5, 0], thickness: 1}],
		]);
	}
}

export class ArrowGeometry extends HelperGeometry {
	constructor() {
		super([
			[new ConeGeometry(), {position: [0, 0.8, 0], scale: 0.2}],
			[new CylinderBufferGeometry(EPS, EPS, 0.8, 5, 2, false), {position: [0, 0.4, 0], thickness: 1}],
		]);
	}
}

export class ScaleArrowGeometry extends HelperGeometry {
	constructor() {
		super([
			[new GeosphereGeometry(), {position: [0, 0.8, 0], scale: 0.075}],
			[new CylinderBufferGeometry(EPS, EPS, 0.8, 5, 2, false), {position: [0, 0.4, 0], thickness: 1}],
		]);
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

export class PickerHandleGeometry extends HelperGeometry {
	constructor() {
		super([
			[new CylinderBufferGeometry(0.2, 0, 1, 4, 1, false), {position: [0, 0.5, 0]}]
		]);
	}
}

export class CircleGeometry extends HelperGeometry {
	constructor() {
		super([
			[new OctahedronBufferGeometry( 1, 3 ), {scale: [1, 0.01, 1]}]
		]);
	}
}

export class RingGeometry extends HelperGeometry {
	constructor() {
		super([
			[new TorusBufferGeometry( 1, EPS, 8, 128 ), {rotation: [HPI, 0, 0], thickness: 1}]
		]);
	}
}

export class HalfRingGeometry extends HelperGeometry {
	constructor() {
		super([
			[new TorusBufferGeometry( 1, EPS, 8, 64, PI ), {rotation: [HPI, 0, 0]}]
		]);
	}
}

export class RingPickerGeometry extends HelperGeometry {
	constructor() {
		super([
			[new TorusBufferGeometry( 1, 0.1, 3, 12 ), {rotation: [HPI, 0, 0]}]
		]);
	}
}

export class RotateHandleGeometry extends HelperGeometry {
	constructor() {
		super([
			[new TorusBufferGeometry( 1, EPS, 4, 64, PI ), {thickness: 1}],
			[new SphereBufferGeometry(0.05, 12, 16), {position: [0, 0.992, 0], scale: [3, .5, .5]}],
		]);
	}
}

export class RotatePickerGeometry extends HelperGeometry {
	constructor() {
		super([
			[new TorusBufferGeometry( 1, 0.03, 4, 8, PI )],
			[new OctahedronGeometry(), {position: [0, 0.992, 0], scale: 0.2}],
		]);
	}
}
