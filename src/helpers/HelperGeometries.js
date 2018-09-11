/**
 * @author arodic / https://github.com/arodic
 */

import {
	BufferGeometry, SphereBufferGeometry, CylinderBufferGeometry,
	OctahedronBufferGeometry, TorusBufferGeometry, Float32BufferAttribute, Uint16BufferAttribute
} from "../../lib/three.module.js";

import {HelperMesh} from "./HelperMesh.js";

const PI = Math.PI;
const HPI = Math.PI / 2;
const EPS = 0.000001;

export class GeosphereGeometry extends OctahedronBufferGeometry {
	constructor() {
		super(1, 3);
		return this.geometry;
	}
}

export class OctahedronGeometry extends HelperMesh {
	constructor() {
		super([
			{geometry: new OctahedronBufferGeometry(1, 0)}
		]);
		return this.geometry;
	}
}


export class PlaneGeometry extends HelperMesh {
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
			{geometry: geometry, scale: [0.5, 0.5, 0.00001]}
		]);
		return this.geometry;
	}
}

export class ConeGeometry extends HelperMesh {
	constructor() {
		super([
			{geometry: new CylinderBufferGeometry(0, 0.2, 1, 8, 2), position: [0, 0.5, 0]},
			{geometry: new SphereBufferGeometry(0.2, 8, 8)}
		]);
		return this.geometry;
	}
}

export class LineGeometry extends HelperMesh {
	constructor() {
		super([
			{geometry: new CylinderBufferGeometry(EPS, EPS, 1, 16, 2, false), position: [0, 0, 0], thickness: 1},
			{geometry: new SphereBufferGeometry(EPS, 4, 4), position: [0, -0.5, 0], thickness: 1},
			{geometry: new SphereBufferGeometry(EPS, 4, 4), position: [0, 0.5, 0], thickness: 1}
		]);
		return this.geometry;
	}
}

export class ArrowGeometry extends HelperMesh {
	constructor() {
		super([
			{geometry: new ConeGeometry(), position: [0, 0.8, 0], scale: 0.2},
			{geometry: new CylinderBufferGeometry(EPS, EPS, 0.8, 5, 2, false), position: [0, 0.4, 0], thickness: 1}
		]);
		return this.geometry;
	}
}

export class ScaleArrowGeometry extends HelperMesh {
	constructor() {
		super([
			{geometry: new GeosphereGeometry(), position: [0, 0.8, 0], scale: 0.075},
			{geometry: new CylinderBufferGeometry(EPS, EPS, 0.8, 5, 2, false), position: [0, 0.4, 0], thickness: 1}
		]);
		return this.geometry;
	}
}

export class Corner2Geometry extends HelperMesh {
	constructor() {
		super([
			{geometry: new CylinderBufferGeometry(EPS, EPS, 1, 5, 2, false), position: [0.5, 0, 0], rotation: [0, 0, HPI], thickness: 1},
			{geometry: new CylinderBufferGeometry(EPS, EPS, 1, 5, 2, false), position: [0, 0, 0.5], rotation: [HPI, 0, 0], thickness: 1},
			{geometry: new SphereBufferGeometry(EPS, 4, 4), position: [0, 0, 0], thickness: 1},
			{geometry: new SphereBufferGeometry(EPS, 4, 4), position: [1, 0, 0], rotation: [0, 0, HPI], thickness: 1},
			{geometry: new SphereBufferGeometry(EPS, 4, 4), position: [0, 0, 1], rotation: [HPI, 0, 0], thickness: 1},
		]);
		return this.geometry;
	}
}

export class Corner3Geometry extends HelperMesh {
	constructor() {
		super([
			{geometry: new CylinderBufferGeometry(EPS, EPS, 1, 5, 2, false), position: [0.5, 0, 0], rotation: [0, 0, HPI], thickness: 1},
			{geometry: new CylinderBufferGeometry(EPS, EPS, 1, 5, 2, false), position: [0, 0.5, 0], rotation: [0, HPI, 0], thickness: 1},
			{geometry: new CylinderBufferGeometry(EPS, EPS, 1, 5, 2, false), position: [0, 0, 0.5], rotation: [HPI, 0, 0], thickness: 1},
			{geometry: new SphereBufferGeometry(EPS, 8, 4), position: [0, 0, 0], thickness: 1},
			{geometry: new SphereBufferGeometry(EPS, 8, 4), position: [1, 0, 0], rotation: [0, 0, HPI], thickness: 1},
			{geometry: new SphereBufferGeometry(EPS, 8, 4), position: [0, 1, 0], rotation: [0, HPI, 0], thickness: 1},
			{geometry: new SphereBufferGeometry(EPS, 8, 4), position: [0, 0, 1], rotation: [HPI, 0, 0], thickness: 1},
		]);
		return this.geometry;
	}
}

export class PickerHandleGeometry extends HelperMesh {
	constructor() {
		super([
			{geometry: new CylinderBufferGeometry(0.2, 0, 1, 4, 1, false), position: [0, 0.5, 0]}
		]);
		return this.geometry;
	}
}

export class CircleGeometry extends HelperMesh {
	constructor() {
		super([
			{geometry: new OctahedronBufferGeometry( 1, 3 ), scale: [1, 0.01, 1]},
		]);
		return this.geometry;
	}
}

export class RingGeometry extends HelperMesh {
	constructor() {
		super([
			{geometry: new TorusBufferGeometry( 1, EPS, 8, 128 ), rotation: [HPI, 0, 0], thickness: 1},
		]);
		return this.geometry;
	}
}

export class HalfRingGeometry extends HelperMesh {
	constructor() {
		super([
			{geometry: new TorusBufferGeometry( 1, EPS, 8, 64, PI ), rotation: [HPI, 0, 0]},
		]);
		return this.geometry;
	}
}

export class RingPickerGeometry extends HelperMesh {
	constructor() {
		super([
				{geometry: new TorusBufferGeometry( 1, 0.1, 3, 12 ), rotation: [HPI, 0, 0]},
		]);
		return this.geometry;
	}
}

export class RotateHandleGeometry extends HelperMesh {
	constructor() {
		super([
			{geometry: new TorusBufferGeometry( 1, EPS, 4, 64, PI ), thickness: 1},
			{geometry: new SphereBufferGeometry(0.05, 12, 16), position: [0, 0.992, 0], scale: [3, .5, .5]}
		]);
		return this.geometry;
	}
}

export class RotatePickerGeometry extends HelperMesh {
	constructor() {
		super([
			{geometry: new TorusBufferGeometry( 1, 0.03, 4, 8, PI )},
			{geometry: new OctahedronGeometry(), position: [0, 0.992, 0], scale: 0.2}
		]);
		return this.geometry;
	}
}
