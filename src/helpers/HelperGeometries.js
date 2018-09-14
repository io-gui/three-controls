/**
 * @author arodic / https://github.com/arodic
 */

import {
	Mesh, Vector3, Euler, Quaternion, Matrix4, BufferGeometry, SphereBufferGeometry, CylinderBufferGeometry,
	OctahedronBufferGeometry, TorusBufferGeometry, Float32BufferAttribute, Uint16BufferAttribute
} from "../../lib/three.module.js";

import {BufferGeometryUtils} from "../../lib/BufferGeometryUtils.js";
import {HelperMesh} from "./HelperMesh.js";

const PI = Math.PI;
const HPI = Math.PI / 2;
const EPS = 0.000001;

// Reusable utility variables
const _position = new Vector3();
const _euler = new Euler();
const _quaternion = new Quaternion();
const _scale = new Vector3();
const _matrix = new Matrix4();

export function combineGometries(chunks) {

	let geometry = new BufferGeometry();

	geometry.index = new Uint16BufferAttribute([], 1);
	geometry.addAttribute('position', new Float32BufferAttribute([], 3));
	geometry.addAttribute('uv', new Float32BufferAttribute([], 2));
	geometry.addAttribute('color', new Float32BufferAttribute([], 4));
	geometry.addAttribute('normal', new Float32BufferAttribute([], 3));
	geometry.addAttribute('outline', new Float32BufferAttribute([], 1));

	for (let i = chunks.length; i--;) {

		const chunk = chunks[i];
		let chunkGeo = chunk.geometry.clone();

		const color = chunk.color || [];
		const position = chunk.position;
		const rotation = chunk.rotation;
		let scale = chunk.scale;

		let thickness = chunk.thickness / 2 || 0;
		let outlineThickness = chunk.outlineThickness !== undefined ? chunk.outlineThickness : 1;

		if (scale && typeof scale === 'number') scale = [scale, scale, scale];

		_position.set(0, 0, 0);
		_quaternion.set(0, 0, 0, 1);
		_scale.set(1, 1, 1);

		if (position) _position.set(position[0], position[1], position[2]);
		if (rotation) _quaternion.setFromEuler(_euler.set(rotation[0], rotation[1], rotation[2]));
		if (scale) _scale.set(scale[0], scale[1], scale[2]);

		_matrix.compose(_position, _quaternion, _scale);

		chunkGeo.applyMatrix(_matrix);

		if (chunkGeo.index === null) {
			const indices = [];
			for (let j = 0; j < chunkGeo.attributes.position.count - 2; j++) {
				indices.push(j + 0);
				indices.push(j + 1);
				indices.push(j + 2);
			}
			chunkGeo.index = new Uint16BufferAttribute(indices, 1);
		}

		let vertCount = chunkGeo.attributes.position.count;

		if (!chunkGeo.attributes.color) {
			chunkGeo.addAttribute('color', new Float32BufferAttribute(new Array(vertCount * 4), 4));
		}

		const colorArray = chunkGeo.attributes.color.array;
		for (let j = 0; j < vertCount; j++) {
			const r = j * 4 + 0; colorArray[r] = color[0] !== undefined ? color[0] : colorArray[r] || 1;
			const g = j * 4 + 1; colorArray[g] = color[1] !== undefined ? color[1] : colorArray[g] || 1;
			const b = j * 4 + 2; colorArray[b] = color[2] !== undefined ? color[2] : colorArray[b] || 1;
			const a = j * 4 + 3; colorArray[a] = color[3] !== undefined ? color[3] : colorArray[a] || 1;
		}

		// Duplicate geometry and add outline attribute
		//TODO: enable outline overwrite (needs to know if is outline or not in combined geometry)
		if (!chunkGeo.attributes.outline) {
			const outlineArray = [];
			for (let j = 0; j < vertCount; j++) outlineArray[j] = -(thickness) || 0;
			chunkGeo.addAttribute( 'outline', new Float32BufferAttribute( outlineArray, 1 ) );
			chunkGeo = BufferGeometryUtils.mergeBufferGeometries([chunkGeo, chunkGeo]);
			if (outlineThickness) {
				for (let j = 0; j < vertCount; j++) chunkGeo.attributes.outline.array[(vertCount) + j] = outlineThickness + (thickness);
			}
			let array = chunkGeo.index.array;
			for (let j = array.length / 2; j < array.length; j+=3) {
				let a = array[j + 1];
				let b = array[j + 2];
				array[j + 1] = b;
				array[j + 2] = a;
			}
		}
		geometry = BufferGeometryUtils.mergeBufferGeometries([geometry, chunkGeo]);
	}
	return geometry;
}

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
			// {geometry: new SphereBufferGeometry(EPS, 4, 4), position: [0, 0, 0], thickness: 1},
			// {geometry: new SphereBufferGeometry(EPS, 4, 4), position: [1, 0, 0], rotation: [0, 0, HPI], thickness: 1},
			// {geometry: new SphereBufferGeometry(EPS, 4, 4), position: [0, 0, 1], rotation: [HPI, 0, 0], thickness: 1},
		]);
		return this.geometry;
	}
}

export class Corner3Geometry extends HelperMesh {
	constructor() {
		super([
			{geometry: new CylinderBufferGeometry(EPS, EPS, 1, 5, 2, false), color: [1, 0, 0], position: [0.5, 0, 0], rotation: [0, 0, HPI], thickness: 1},
			{geometry: new CylinderBufferGeometry(EPS, EPS, 1, 5, 2, false), color: [0, 1, 0], position: [0, 0.5, 0], rotation: [0, HPI, 0], thickness: 1},
			{geometry: new CylinderBufferGeometry(EPS, EPS, 1, 5, 2, false), color: [0, 0, 1], position: [0, 0, 0.5], rotation: [HPI, 0, 0], thickness: 1},
			// {geometry: new SphereBufferGeometry(EPS, 8, 4), position: [0, 0, 0], thickness: 1},
			// {geometry: new SphereBufferGeometry(EPS, 8, 4), position: [1, 0, 0], rotation: [0, 0, HPI], thickness: 1},
			// {geometry: new SphereBufferGeometry(EPS, 8, 4), position: [0, 1, 0], rotation: [0, HPI, 0], thickness: 1},
			// {geometry: new SphereBufferGeometry(EPS, 8, 4), position: [0, 0, 1], rotation: [HPI, 0, 0], thickness: 1},
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
