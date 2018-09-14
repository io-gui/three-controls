/**
 * @author arodic / https://github.com/arodic
 */

import {Line, Vector3, Euler, Quaternion, Matrix4} from "../../lib/three.module.js";
import {Helper} from "../Helper.js";
import {HelperMesh} from "./HelperMesh.js";
import {TransformHelper} from "./TransformHelper.js";
import {HelperMaterial as Material} from "./HelperMaterial.js";
import {Corner3Geometry, combineGometries} from "./HelperGeometries.js";

const HPI = Math.PI / 2;
const PI = Math.PI;

// TODO: consider supporting objects with skewed transforms.

// Reusable utility variables
const _position = new Vector3();
const _quaternion = new Quaternion();
const _scale = new Vector3();
const _m1 = new Matrix4();
const _m2 = new Matrix4();
const _one = new Vector3(1, 1, 1);

const corner3Geometry = new Corner3Geometry();

export class SelectionHelper extends Helper {
	get handlesGroup() {
		return {
			XYZ: [{geometry: combineGometries([{geometry: corner3Geometry, color: [1, 1, 0], rotation: [HPI, 0, PI]}])}],
			XYz: [{geometry: combineGometries([{geometry: corner3Geometry, color: [1, 1, 0], rotation: [HPI, 0, HPI]}])}],
			xyz: [{geometry: combineGometries([{geometry: corner3Geometry, color: [1, 1, 0], rotation: [-HPI, 0, -HPI]}])}],
			xyZ: [{geometry: combineGometries([{geometry: corner3Geometry, color: [1, 1, 0], rotation: [-HPI, 0, 0]}])}],
			xYZ: [{geometry: combineGometries([{geometry: corner3Geometry, color: [1, 1, 0], rotation: [PI/2, 0, -PI/2]}])}],
			xYz: [{geometry: combineGometries([{geometry: corner3Geometry, color: [1, 1, 0], rotation: [PI/2, 0, 0]}])}],
			Xyz: [{geometry: combineGometries([{geometry: corner3Geometry, color: [1, 1, 0], rotation: [0, 0, HPI]}])}],
			XyZ: [{geometry: combineGometries([{geometry: corner3Geometry, color: [1, 1, 0], rotation: [0, PI, 0]}])}],
		};
	}
	constructor(props) {
		super(props);
		this.size = 0.02;
		this.combineHelperGroups(this.handlesGroup);

		const axis = new TransformHelper({object: this});
		axis.size = 0.02;
		super.add(axis);

		if (this.object && this.object.geometry) {
			if (!this.object.geometry.boundingBox) this.object.geometry.computeBoundingBox();
			const bbMax = this.object.geometry.boundingBox.max;
			const bbMin = this.object.geometry.boundingBox.min;

			this.corners['XYZ'].position.set(bbMax.x, bbMax.y, bbMax.z);
			this.corners['XYz'].position.set(bbMax.x, bbMax.y, bbMin.z);
			this.corners['xyz'].position.set(bbMin.x, bbMin.y, bbMin.z);
			this.corners['xyZ'].position.set(bbMin.x, bbMin.y, bbMax.z);
			this.corners['xYZ'].position.set(bbMin.x, bbMax.y, bbMax.z);
			this.corners['xYz'].position.set(bbMin.x, bbMax.y, bbMin.z);
			this.corners['Xyz'].position.set(bbMax.x, bbMin.y, bbMin.z);
			this.corners['XyZ'].position.set(bbMax.x, bbMin.y, bbMax.z);
		}
	}
	combineHelperGroups(groups) {
		this.corners = {};
		for (let name in groups) {
			this.corners[name] = new HelperMesh(groups[name], {name: name});
			this.add(this.corners[name]);
		}
	}
	updateMatrixWorld( force ) {
		this.updateHelperMatrix();
		this.matrixWorldNeedsUpdate = false;
		this.object.matrixWorld.decompose(_position, _quaternion, _scale);
		_m1.compose(this.position, this.quaternion, _one);

		_scale.x = Math.abs(_scale.x);
		_scale.y = Math.abs(_scale.y);
		_scale.z = Math.abs(_scale.z);

		for (let i = 0; i < 8; i ++) {

			_position.copy(this.children[i].position).multiply(_scale);

			let __scale = this.scale.clone();

			let dir = this.children[i].position.clone().applyQuaternion(this.quaternion).normalize();

			this.children[i].material.highlight = Math.min(Math.max(3 - Math.abs(dir.dot(this.eye)) * 4, -1), 1.0);

			__scale.x = Math.min(this.scale.x, Math.abs(_position.x) / 2);
			__scale.y = Math.min(this.scale.y, Math.abs(_position.y) / 2);
			__scale.z = Math.min(this.scale.z, Math.abs(_position.z) / 2);

			_m2.compose(_position, new Quaternion, __scale);

			this.children[i].matrixWorld.copy(_m1).multiply(_m2);
		}

		this.children[8].updateMatrixWorld();
	}
}
