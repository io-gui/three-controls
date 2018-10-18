/**
 * @author arodic / https://github.com/arodic
 */

import {Mesh, Vector3, BoxBufferGeometry} from "../../lib/three.module.js";
import {IoLiteMixin} from "../../lib/IoLiteMixin.js";
import {HelperMaterial} from "./HelperMaterial.js";
import {TextHelper} from "./Text.js";

// Reusable utility variables
const _cameraPosition = new Vector3();

/*
 * Helper extends Object3D to automatically follow its target `object` by copying transform matrices from it.
 * If `space` property is set to "world", helper will not inherit objects rotation.
 * Helpers will auto-scale in view space if `size` property is non-zero.
 */

export class Helper extends IoLiteMixin(Mesh) {
	constructor(props = {}) {
		super();

		this.defineProperties({
			object: props.object || null,
			camera: props.camera || null,
			depthBias: 0,
			space: 'local',
			size: 0
		});

		this.eye = new Vector3();

		this.geometry = new BoxBufferGeometry(1,1,1,1,1,1);
		this.material.colorWrite = false;
		this.material.depthWrite = false;
	}
	onBeforeRender(renderer, scene, camera) {
		this.camera = camera;
	}
	depthBiasChanged() {
		this.traverse(object => {object.material.depthBias = this.depthBias;});
	}
	objectChanged() {
		this.updateHelperMatrix();
	}
	cameraChanged() {
		this.updateHelperMatrix();
	}
	spaceChanged() {
		this.updateHelperMatrix();
	}
	updateHelperMatrix() {
		if (this.object) {
			this.matrix.copy(this.object.matrix);
			this.matrixWorld.copy(this.object.matrixWorld);
			this.matrixWorld.decompose(this.position, this.quaternion, this.scale);
		} else {
			super.updateMatrixWorld();
		}

		if (this.camera) {
			let eyeDistance = 1;
			_cameraPosition.set(this.camera.matrixWorld.elements[12], this.camera.matrixWorld.elements[13], this.camera.matrixWorld.elements[14]);
			if (this.camera.isPerspectiveCamera) {
				// TODO: make scale zoom independent with PerspectiveCamera
				this.eye.copy(_cameraPosition).sub(this.position);
				eyeDistance = this.eye.length();
				this.eye.normalize();
			} else if (this.camera.isOrthographicCamera) {
				eyeDistance = 3 * (this.camera.top - this.camera.bottom) / this.camera.zoom; // TODO: Why magic number 3 matches perspective?
				this.eye.copy(_cameraPosition).normalize();
			}
			if (this.size) this.scale.set(1, 1, 1).multiplyScalar(eyeDistance * this.size);
		}
		if (this.space === 'world') this.quaternion.set(0, 0, 0, 1);

		this.matrixWorld.compose(this.position, this.quaternion, this.scale);
	}
	updateMatrixWorld( force ) {
		this.updateHelperMatrix();
		this.matrixWorldNeedsUpdate = false;
		for (let i = this.children.length; i--;) this.children[i].updateMatrixWorld(force);
	}
	// TODO: refactor. Consider moving to utils.
	addGeometries(geometries, props = {}) {
		const objects = [];
		for (let name in geometries) {
			objects.push(objects[name] = this.addObject(geometries[name], Object.assign(props, {name: name})));
		}
		return objects;
	}
	addObject(geometry, meshProps = {}) {

		const geometryProps = geometry.props || {};

		const materialProps = {highlight: 0};

		if (geometryProps.opacity !== undefined) materialProps.opacity = geometryProps.opacity;
		if (geometryProps.depthBias !== undefined) materialProps.depthBias = geometryProps.depthBias;
		if (meshProps.highlight !== undefined) materialProps.highlight = meshProps.highlight;

		const material = new HelperMaterial(materialProps);

		const mesh = new Mesh(geometry, material);

		meshProps = Object.assign({hidden: false, highlight: 0}, meshProps);

		mesh.positionTarget = mesh.position.clone();
		mesh.quaternionTarget = mesh.quaternion.clone();
		mesh.scaleTarget = mesh.scale.clone();

		for (var i in meshProps) mesh[i] = meshProps[i]; //TODO
		this.add(mesh);
		return mesh;
	}
	addTextSprites(infosDef) {
		const infos = [];
		for (let name in infosDef) {
			const mesh = new TextHelper(infosDef[name]);
			mesh.name = name;
			mesh.positionTarget = mesh.position.clone();
			mesh.material.opacity = 0;
			mesh.material.visible = false;
			mesh.isInfo = true;
			infos.push(mesh);
			infos[name] = mesh;
			this.add(mesh);
		}
		return infos;
	}
}
