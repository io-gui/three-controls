/**
 * @author arodic / https://github.com/arodic
 */

import {
	SphereBufferGeometry, CylinderBufferGeometry, OctahedronBufferGeometry, BoxBufferGeometry, TorusBufferGeometry
} from "../../lib/three.module.js";

import {HelperMesh} from "./HelperMesh.js";

const PI = Math.PI;
const HPI = Math.PI / 2;

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

export class PlaneGeometry extends BoxBufferGeometry {
	constructor() {
		super(1, 1, 0.01, 1, 1, 1);
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
			{geometry: new CylinderBufferGeometry(0.00001, 0.00001, 1, 4, 2, false), position: [0, 0, 0], thickness: 1},
			{geometry: new SphereBufferGeometry(0.00001, 4, 4), position: [0, -0.5, 0], thickness: 1},
			{geometry: new SphereBufferGeometry(0.00001, 4, 4), position: [0, 0.5, 0], thickness: 1}
		]);
		return this.geometry;
	}
}

export class ArrowGeometry extends HelperMesh {
	constructor() {
		super([
			{geometry: new ConeGeometry(), position: [0, 0.8, 0], scale: 0.2},
			{geometry: new CylinderBufferGeometry(0.00001, 0.00001, 0.8, 4, 2, false), position: [0, 0.4, 0], thickness: 1}
		]);
		return this.geometry;
	}
}

export class ScaleArrowGeometry extends HelperMesh {
	constructor() {
		super([
			{geometry: new OctahedronGeometry(), position: [0, 0.8, 0], scale: 0.075},
			{geometry: new CylinderBufferGeometry(0.00001, 0.00001, 0.8, 4, 2, false), position: [0, 0.4, 0], thickness: 1}
		]);
		return this.geometry;
	}
}

export class Corner2Geometry extends HelperMesh {
	constructor() {
		super([
			{geometry: new CylinderBufferGeometry(0.00001, 0.00001, 1, 4, 2, false), position: [0.5, 0, 0], rotation: [0, 0, HPI], thickness: 1},
			{geometry: new CylinderBufferGeometry(0.00001, 0.00001, 1, 4, 2, false), position: [0, 0, 0.5], rotation: [HPI, 0, 0], thickness: 1},
			{geometry: new SphereBufferGeometry(0.00001, 4, 4), position: [0, 0, 0], thickness: 1},
			{geometry: new SphereBufferGeometry(0.00001, 4, 4), position: [1, 0, 0], rotation: [0, 0, HPI], thickness: 1},
			{geometry: new SphereBufferGeometry(0.00001, 4, 4), position: [0, 0, 1], rotation: [HPI, 0, 0], thickness: 1},
		]);
		return this.geometry;
	}
}

export class Corner3Geometry extends HelperMesh {
	constructor() {
		super([
			{geometry: new CylinderBufferGeometry(0.00001, 0.00001, 1, 4, 2, false), position: [0.5, 0, 0], rotation: [0, 0, HPI], thickness: 1},
			{geometry: new CylinderBufferGeometry(0.00001, 0.00001, 1, 4, 2, false), position: [0, 0.5, 0], rotation: [0, HPI, 0], thickness: 1},
			{geometry: new CylinderBufferGeometry(0.00001, 0.00001, 1, 4, 2, false), position: [0, 0, 0.5], rotation: [HPI, 0, 0], thickness: 1},
			{geometry: new SphereBufferGeometry(0.00001, 8, 4), position: [0, 0, 0], thickness: 1},
			{geometry: new SphereBufferGeometry(0.00001, 8, 4), position: [1, 0, 0], rotation: [0, 0, HPI], thickness: 1},
			{geometry: new SphereBufferGeometry(0.00001, 8, 4), position: [0, 1, 0], rotation: [0, HPI, 0], thickness: 1},
			{geometry: new SphereBufferGeometry(0.00001, 8, 4), position: [0, 0, 1], rotation: [HPI, 0, 0], thickness: 1},
		]);
		return this.geometry;
	}
}

export class PlusGeometry extends HelperMesh {
	constructor() {
		super([
			{geometry: new CylinderBufferGeometry(0.00001, 0.00001, 2, 4, 2, false), position: [0, 0, 0], rotation: [0, 0, HPI], thickness: 1},
			{geometry: new CylinderBufferGeometry(0.00001, 0.00001, 2, 4, 2, false), position: [0, 0, 0], rotation: [HPI, 0, 0], thickness: 1},
			{geometry: new SphereBufferGeometry(0.00001, 8, 4), position: [1, 0, 0], thickness: 1},
			{geometry: new SphereBufferGeometry(0.00001, 8, 4), position: [-1, 0, 0], thickness: 1},
			{geometry: new SphereBufferGeometry(0.00001, 8, 4), position: [0, 0, 1], rotation: [HPI, 0, 0], thickness: 1},
			{geometry: new SphereBufferGeometry(0.00001, 8, 4), position: [0, 0, -1], rotation: [HPI, 0, 0], thickness: 1},
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
			{geometry: new TorusBufferGeometry( 1, 0.00001, 8, 128 ), rotation: [HPI, 0, 0], thickness: 1},
		]);
		return this.geometry;
	}
}

export class HalfRingGeometry extends HelperMesh {
	constructor() {
		super([
			{geometry: new TorusBufferGeometry( 1, 0.00001, 8, 64, PI ), rotation: [HPI, 0, 0]},
		]);
		return this.geometry;
	}
}

export class RingPickerGeometry extends HelperMesh {
	constructor() {
		super([
				{geometry: new TorusBufferGeometry( 1, 0.1, 8, 128 ), rotation: [HPI, 0, 0]},
		]);
		return this.geometry;
	}
}

export class RotateHandleGeometry extends HelperMesh {
	constructor() {
		super([
			{geometry: new TorusBufferGeometry( 1, 0.00001, 4, 64, PI ), thickness: 1},
			{geometry: new SphereBufferGeometry(0.00001, 4, 4), position: [1, 0, 0], rotation: [HPI, 0, 0]},
			{geometry: new SphereBufferGeometry(0.00001, 4, 4), position: [-1, 0, 0], rotation: [HPI, 0, 0]},
			{geometry: new OctahedronGeometry(), position: [0, 0.992, 0], scale: [0.2, 0.05, 0.05]}
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
