/**
 * @author arodic / https://github.com/arodic
 */

import {Vector3, Quaternion, Matrix4, CylinderBufferGeometry} from "../../lib/three.module.js";
import {Helper} from "./Helper.js";
import {TransformHelper} from "./Transform.js";
import {HelperGeometry} from "./HelperGeometry.js";

// Reusable utility variables
const PI = Math.PI;
const HPI = PI / 2;
const EPS = 0.000001;

// TODO: consider supporting objects with skewed transforms.
const _position = new Vector3();
const _quaternion = new Quaternion();
const _scale = new Vector3();
const _m1 = new Matrix4();
const _m2 = new Matrix4();
const _one = new Vector3(1, 1, 1);

const corner3Geometry = new HelperGeometry([
	[new CylinderBufferGeometry(EPS, EPS, 1, 4, 2, true), {color: [1, 0, 0], position: [0.5, 0, 0], rotation: [0, 0, HPI], thickness: 1}],
	[new CylinderBufferGeometry(EPS, EPS, 1, 4, 2, true), {color: [0, 1, 0], position: [0, 0.5, 0], rotation: [0, HPI, 0], thickness: 1}],
	[new CylinderBufferGeometry(EPS, EPS, 1, 4, 2, true), {color: [0, 0, 1], position: [0, 0, 0.5], rotation: [HPI, 0, 0], thickness: 1}],
]);

const handleGeometry = {
	XYZ: new HelperGeometry(corner3Geometry, {color: [1, 1, 0], rotation: [HPI, 0, PI]}),
	XYz: new HelperGeometry(corner3Geometry, {color: [1, 1, 0], rotation: [HPI, 0, HPI]}),
	xyz: new HelperGeometry(corner3Geometry, {color: [1, 1, 0], rotation: [-HPI, 0, -HPI]}),
	xyZ: new HelperGeometry(corner3Geometry, {color: [1, 1, 0], rotation: [-HPI, 0, 0]}),
	xYZ: new HelperGeometry(corner3Geometry, {color: [1, 1, 0], rotation: [PI/2, 0, -PI/2]}),
	xYz: new HelperGeometry(corner3Geometry, {color: [1, 1, 0], rotation: [PI/2, 0, 0]}),
	Xyz: new HelperGeometry(corner3Geometry, {color: [1, 1, 0], rotation: [0, 0, HPI]}),
	XyZ: new HelperGeometry(corner3Geometry, {color: [1, 1, 0], rotation: [0, PI, 0]}),
};

export class SelectionHelper extends Helper {
	get handleGeometry() {
		return handleGeometry;
	}
	constructor(props) {
		super(props);
		this.size = 0.005;
		this.combineHelperGroups(this.handleGeometry);

		const axis = new TransformHelper({object: this});
		axis.size = 0.01;
		axis.doFlip = false;
		axis.doHide = false;
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
			this.corners[name] = this.makeMesh(groups[name], {name: name});
			// TODO: name?
			this.add(this.corners[name]);
		}
	}
	updateMatrixWorld() {
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

			this.children[i].material.highlight = Math.min(Math.max(3 - Math.abs(dir.dot(this.eye)) * 4, -1), 0.5);

			__scale.x = Math.min(this.scale.x, Math.abs(_position.x) / 2);
			__scale.y = Math.min(this.scale.y, Math.abs(_position.y) / 2);
			__scale.z = Math.min(this.scale.z, Math.abs(_position.z) / 2);

			__scale.x = Math.max(__scale.x, EPS);
			__scale.y = Math.max(__scale.y, EPS);
			__scale.z = Math.max(__scale.z, EPS);

			_m2.compose(_position, new Quaternion, __scale);

			this.children[i].matrixWorld.copy(_m1).multiply(_m2);
		}
		this.children[8].updateMatrixWorld();
	}
}
