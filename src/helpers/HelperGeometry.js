import {
	Vector3, Euler, Quaternion, Matrix4, BufferGeometry, Float32BufferAttribute, Uint16BufferAttribute
} from "../../lib/three.module.js";

import {BufferGeometryUtils} from "../../lib/BufferGeometryUtils.js";

// Reusable utility variables
const _position = new Vector3();
const _euler = new Euler();
const _quaternion = new Quaternion();
const _scale = new Vector3();
const _matrix = new Matrix4();

export class HelperGeometry extends BufferGeometry {
	constructor(geometry, props) {
		super();

		this.index = new Uint16BufferAttribute([], 1);
		this.addAttribute('position', new Float32BufferAttribute([], 3));
		this.addAttribute('uv', new Float32BufferAttribute([], 2));
		this.addAttribute('color', new Float32BufferAttribute([], 4));
		this.addAttribute('normal', new Float32BufferAttribute([], 3));
		this.addAttribute('outline', new Float32BufferAttribute([], 1));

		let chunks;
		if (geometry instanceof Array) {
			chunks = geometry;
		} else {
			chunks = [[geometry, props]]
		}

		const chunkGeometries = []

		for (let i = chunks.length; i--;) {

			const chunk = chunks[i];

			let chunkGeo = chunk[0].clone();
			chunkGeometries.push(chunkGeo);

			let chunkProp = chunk[1] || {};

			const color = chunkProp.color || [];
			const position = chunkProp.position;
			const rotation = chunkProp.rotation;
			let scale = chunkProp.scale;

			let thickness = chunkProp.thickness / 2 || 0;
			let outlineThickness = chunkProp.outlineThickness !== undefined ? chunkProp.outlineThickness : 1;

			if (scale && typeof scale === 'number') scale = [scale, scale, scale];

			_position.set(0, 0, 0);
			_quaternion.set(0, 0, 0, 1);
			_scale.set(1, 1, 1);

			if (position) _position.set(position[0], position[1], position[2]);
			if (rotation) _quaternion.setFromEuler(_euler.set(rotation[0], rotation[1], rotation[2]));
			if (scale) _scale.set(scale[0], scale[1], scale[2]);

			_matrix.compose(_position, _quaternion, _scale);

			chunkGeo.applyMatrix(_matrix);

			// TODO: investigate proper indexing!
			if (chunkGeo.index === null) {
				const indices = [];
				for (let j = 0; j < chunkGeo.attributes.position.count - 2; j+=3) {
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
				for (let j = 0; j < vertCount; j++) outlineArray[j] = -thickness || 0;
				chunkGeo.addAttribute( 'outline', new Float32BufferAttribute(outlineArray, 1));
				BufferGeometryUtils.mergeBufferGeometries([chunkGeo, chunkGeo], false, chunkGeo);
				if (outlineThickness) {
					for (let j = 0; j < vertCount; j++) chunkGeo.attributes.outline.array[(vertCount) + j] = outlineThickness + thickness;
				}
				let array = chunkGeo.index.array;
				for (let j = array.length / 2; j < array.length; j+=3) {
					let a = array[j + 1];
					let b = array[j + 2];
					array[j + 1] = b;
					array[j + 2] = a;
				}
			}
		}

		BufferGeometryUtils.mergeBufferGeometries(chunkGeometries, false, this);
	}
}
