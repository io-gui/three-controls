import {
	Object3D, MeshBasicMaterial, DoubleSide, LineBasicMaterial,
	CylinderBufferGeometry, BoxBufferGeometry, BufferGeometry, Float32BufferAttribute,
	Mesh, Line, OctahedronBufferGeometry, PlaneBufferGeometry, TorusBufferGeometry,
	SphereBufferGeometry, Vector3, Euler, Matrix4, Quaternion, Color
} from "../../../three.js/build/three.module.js";

// shared materials
const gizmoMaterial = new MeshBasicMaterial({
	depthTest: false,
	depthWrite: false,
	transparent: true,
	side: DoubleSide,
	fog: false
});

const gizmoLineMaterial = new LineBasicMaterial({
	depthTest: false,
	depthWrite: false,
	transparent: true,
	linewidth: 1,
	fog: false
});

// const variables
const red = new Color(0xff0000);
const green = new Color(0x00ff00);
const blue = new Color(0x0000ff);
const yellow = new Color(0xffff00);
const cyan = new Color(0x00ffff);
const magenta = new Color(0xff00ff);
const white = new Color(0xffffff);
const gray = new Color(0x787878);

export class TransformControlsGizmo extends Object3D {
	constructor() {
		super();

		// Make unique material for each axis/color
		const matInvisible = gizmoMaterial.clone();
		matInvisible.opacity = 0.15;

		const matHelper = gizmoMaterial.clone();
		matHelper.opacity = 0.33;

		const matRed = gizmoMaterial.clone();
		matRed.color.copy(red);

		const matGreen = gizmoMaterial.clone();
		matGreen.color.copy(green);

		const matBlue = gizmoMaterial.clone();
		matBlue.color.copy(blue);

		const matWhiteTransperent = gizmoMaterial.clone();
		matWhiteTransperent.opacity = 0.25;

		const matYellowTransparent = matWhiteTransperent.clone();
		matYellowTransparent.color.copy(yellow);

		const matCyanTransparent = matWhiteTransperent.clone();
		matCyanTransparent.color.copy(cyan);

		const matMagentaTransparent = matWhiteTransperent.clone();
		matMagentaTransparent.color.copy(magenta);

		const matYellow = gizmoMaterial.clone();
		matYellow.color.copy(yellow);

		const matLineRed = gizmoLineMaterial.clone();
		matLineRed.color.copy(red);

		const matLineGreen = gizmoLineMaterial.clone();
		matLineGreen.color.copy(green);

		const matLineBlue = gizmoLineMaterial.clone();
		matLineBlue.color.copy(blue);

		const matLineCyan = gizmoLineMaterial.clone();
		matLineCyan.color.copy(cyan);

		const matLineMagenta = gizmoLineMaterial.clone();
		matLineMagenta.color.copy(magenta);

		const matLineYellow = gizmoLineMaterial.clone();
		matLineYellow.color.copy(yellow);

		const matLineGray = gizmoLineMaterial.clone();
		matLineGray.color.copy(gray);

		const matLineYellowTransparent = matLineYellow.clone();
		matLineYellowTransparent.opacity = 0.25;

		// reusable geometry

		const arrowGeometry = new CylinderBufferGeometry(0, 0.05, 0.2, 12, 1, false);

		const scaleHandleGeometry = new BoxBufferGeometry(0.125, 0.125, 0.125);

		const lineGeometry = new BufferGeometry();
		lineGeometry.addAttribute('position', new Float32BufferAttribute([0, 0, 0,	1, 0, 0], 3));

		function CircleGeometry(radius, arc) {
			const geometry = new BufferGeometry();
			const vertices = [];
			for (let i = 0; i <= 64 * arc; ++i) {
				vertices.push(0, Math.cos(i / 32 * Math.PI) * radius, Math.sin(i / 32 * Math.PI) * radius);
			}
			geometry.addAttribute('position', new Float32BufferAttribute(vertices, 3));
			return geometry;
		}

		// Special geometry for transform helper. If scaled with position vector it spans from [0,0,0] to position
		function TranslateHelperGeometry() {
			const geometry = new BufferGeometry();
			geometry.addAttribute('position', new Float32BufferAttribute([0, 0, 0, 1, 1, 1], 3));
			return geometry;
		}

		// Gizmo definitions - custom hierarchy definitions for setupGizmo() function

		const gizmoTranslate = {
			X: [
				[new Mesh(arrowGeometry, matRed), [1, 0, 0], [0, 0, -Math.PI / 2], null, 'fwd'],
				[new Mesh(arrowGeometry, matRed), [1, 0, 0], [0, 0, Math.PI / 2], null, 'bwd'],
				[new Line(lineGeometry, matLineRed)]
			],
			Y: [
				[new Mesh(arrowGeometry, matGreen), [0, 1, 0], null, null, 'fwd'],
				[new Mesh(arrowGeometry, matGreen), [0, 1, 0], [Math.PI, 0, 0], null, 'bwd'],
				[new Line(lineGeometry, matLineGreen), null, [0, 0, Math.PI / 2]]
			],
			Z: [
				[new Mesh(arrowGeometry, matBlue), [0, 0, 1], [Math.PI / 2, 0, 0], null, 'fwd'],
				[new Mesh(arrowGeometry, matBlue), [0, 0, 1], [-Math.PI / 2, 0, 0], null, 'bwd'],
				[new Line(lineGeometry, matLineBlue), null, [0, -Math.PI / 2, 0]]
			],
			XYZ: [
				[new Mesh(new OctahedronBufferGeometry(0.1, 0), matWhiteTransperent), [0, 0, 0], [0, 0, 0]]
			],
			XY: [
				[new Mesh(new PlaneBufferGeometry(0.295, 0.295), matYellowTransparent), [0.15, 0.15, 0]],
				[new Line(lineGeometry, matLineYellow), [0.18, 0.3, 0], null, [0.125, 1, 1]],
				[new Line(lineGeometry, matLineYellow), [0.3, 0.18, 0], [0, 0, Math.PI / 2], [0.125, 1, 1]]
			],
			YZ: [
				[new Mesh(new PlaneBufferGeometry(0.295, 0.295), matCyanTransparent), [0, 0.15, 0.15], [0, Math.PI / 2, 0]],
				[new Line(lineGeometry, matLineCyan), [0, 0.18, 0.3], [0, 0, Math.PI / 2], [0.125, 1, 1]],
				[new Line(lineGeometry, matLineCyan), [0, 0.3, 0.18], [0, -Math.PI / 2, 0], [0.125, 1, 1]]
			],
			XZ: [
				[new Mesh(new PlaneBufferGeometry(0.295, 0.295), matMagentaTransparent), [0.15, 0, 0.15], [-Math.PI / 2, 0, 0]],
				[new Line(lineGeometry, matLineMagenta), [0.18, 0, 0.3], null, [0.125, 1, 1]],
				[new Line(lineGeometry, matLineMagenta), [0.3, 0, 0.18], [0, -Math.PI / 2, 0], [0.125, 1, 1]]
			]
		};

		const pickerTranslate = {
			X: [
				[new Mesh(new CylinderBufferGeometry(0.2, 0, 1, 4, 1, false), matInvisible), [0.6, 0, 0], [0, 0, -Math.PI / 2]]
			],
			Y: [
				[new Mesh(new CylinderBufferGeometry(0.2, 0, 1, 4, 1, false), matInvisible), [0, 0.6, 0]]
			],
			Z: [
				[new Mesh(new CylinderBufferGeometry(0.2, 0, 1, 4, 1, false), matInvisible), [0, 0, 0.6], [Math.PI / 2, 0, 0]]
			],
			XYZ: [
				[new Mesh(new OctahedronBufferGeometry(0.2, 0), matInvisible)]
			],
			XY: [
				[new Mesh(new PlaneBufferGeometry(0.4, 0.4), matInvisible), [0.2, 0.2, 0]]
			],
			YZ: [
				[new Mesh(new PlaneBufferGeometry(0.4, 0.4), matInvisible), [0, 0.2, 0.2], [0, Math.PI / 2, 0]]
			],
			XZ: [
				[new Mesh(new PlaneBufferGeometry(0.4, 0.4), matInvisible), [0.2, 0, 0.2], [-Math.PI / 2, 0, 0]]
			]
		};

		const helperTranslate = {
			START: [
				[new Mesh(new OctahedronBufferGeometry(0.01, 2), matHelper), null, null, null, 'helper']
			],
			END: [
				[new Mesh(new OctahedronBufferGeometry(0.01, 2), matHelper), null, null, null, 'helper']
			],
			DELTA: [
				[new Line(TranslateHelperGeometry(), matHelper), null, null, null, 'helper']
			],
			X: [
				[new Line(lineGeometry, matHelper.clone()), [-1e3, 0, 0], null, [1e6, 1, 1], 'helper']
			],
			Y: [
				[new Line(lineGeometry, matHelper.clone()), [0, -1e3, 0], [0, 0, Math.PI / 2], [1e6, 1, 1], 'helper']
			],
			Z: [
				[new Line(lineGeometry, matHelper.clone()), [0, 0, -1e3], [0, -Math.PI / 2, 0], [1e6, 1, 1], 'helper']
			]
		};

		const gizmoRotate = {
			X: [
				[new Line(CircleGeometry(1, 0.5), matLineRed)],
				[new Mesh(new OctahedronBufferGeometry(0.04, 0), matRed), [0, 0, 0.99], null, [1, 3, 1]],
			],
			Y: [
				[new Line(CircleGeometry(1, 0.5), matLineGreen), null, [0, 0, -Math.PI / 2]],
				[new Mesh(new OctahedronBufferGeometry(0.04, 0), matGreen), [0, 0, 0.99], null, [3, 1, 1]],
			],
			Z: [
				[new Line(CircleGeometry(1, 0.5), matLineBlue), null, [0, Math.PI / 2, 0]],
				[new Mesh(new OctahedronBufferGeometry(0.04, 0), matBlue), [0.99, 0, 0], null, [1, 3, 1]],
			],
			E: [
				[new Line(CircleGeometry(1.25, 1), matLineYellowTransparent), null, [0, Math.PI / 2, 0]],
				[new Mesh(new CylinderBufferGeometry(0.03, 0, 0.15, 4, 1, false), matLineYellowTransparent), [1.17, 0, 0], [0, 0, -Math.PI / 2], [1, 1, 0.001]],
				[new Mesh(new CylinderBufferGeometry(0.03, 0, 0.15, 4, 1, false), matLineYellowTransparent), [-1.17, 0, 0], [0, 0, Math.PI / 2], [1, 1, 0.001]],
				[new Mesh(new CylinderBufferGeometry(0.03, 0, 0.15, 4, 1, false), matLineYellowTransparent), [0, -1.17, 0], [Math.PI, 0, 0], [1, 1, 0.001]],
				[new Mesh(new CylinderBufferGeometry(0.03, 0, 0.15, 4, 1, false), matLineYellowTransparent), [0, 1.17, 0], [0, 0, 0], [1, 1, 0.001]],
			],
			XYZE: [
				[new Line(CircleGeometry(1, 1), matLineGray), null, [0, Math.PI / 2, 0]],
				[new Line(CircleGeometry(0.2, 1), matLineGray), null, [0, Math.PI / 2, 0]],
			]
		};

		const helperRotate = {
			AXIS: [
				[new Line(lineGeometry, matHelper.clone()), [-1e3, 0, 0], null, [1e6, 1, 1], 'helper']
			]
		};

		const pickerRotate = {
			X: [
				[new Mesh(new TorusBufferGeometry(1, 0.03, 4, 24, Math.PI), matInvisible), [0, 0, 0], [0, -Math.PI / 2, -Math.PI / 2]],
				[new Mesh(new OctahedronBufferGeometry(0.2, 0), matInvisible), [0, 0, 1]]
			],
			Y: [
				[new Mesh(new TorusBufferGeometry(1, 0.03, 4, 24, Math.PI), matInvisible), [0, 0, 0], [Math.PI / 2, 0, 0]],
				[new Mesh(new OctahedronBufferGeometry(0.2, 0), matInvisible), [0, 0, 1]]
			],
			Z: [
				[new Mesh(new TorusBufferGeometry(1, 0.03, 4, 24, Math.PI), matInvisible), [0, 0, 0], [0, 0, -Math.PI / 2]],
				[new Mesh(new OctahedronBufferGeometry(0.2, 0), matInvisible), [1, 0, 0]]
			],
			E: [
				[new Mesh(new TorusBufferGeometry(1.25, 0.03, 2, 24), matInvisible)],
				[new Mesh(new OctahedronBufferGeometry(0.2, 0), matInvisible), [1.25, 0, 0]],
				[new Mesh(new OctahedronBufferGeometry(0.2, 0), matInvisible), [-1.25, 0, 0]],
				[new Mesh(new OctahedronBufferGeometry(0.2, 0), matInvisible), [0, 1.25, 0]],
				[new Mesh(new OctahedronBufferGeometry(0.2, 0), matInvisible), [0, -1.25, 0]]
			],
			XYZE: [
				[new Mesh(new SphereBufferGeometry(0.22, 10, 3), matInvisible)]
			]
		};

		const gizmoScale = {
			X: [
				[new Mesh(scaleHandleGeometry, matRed), [0.8, 0, 0], [0, 0, -Math.PI / 2]],
				[new Line(lineGeometry, matLineRed), null, null, [0.8, 1, 1]]
			],
			Y: [
				[new Mesh(scaleHandleGeometry, matGreen), [0, 0.8, 0]],
				[new Line(lineGeometry, matLineGreen), null, [0, 0, Math.PI / 2], [0.8, 1, 1]]
			],
			Z: [
				[new Mesh(scaleHandleGeometry, matBlue), [0, 0, 0.8], [Math.PI / 2, 0, 0]],
				[new Line(lineGeometry, matLineBlue), null, [0, -Math.PI / 2, 0], [0.8, 1, 1]]
			],
			XY: [
				[new Mesh(scaleHandleGeometry, matYellowTransparent), [0.85, 0.85, 0], null, [2, 2, 0.2]],
				[new Line(lineGeometry, matLineYellow), [0.855, 0.98, 0], null, [0.125, 1, 1]],
				[new Line(lineGeometry, matLineYellow), [0.98, 0.855, 0], [0, 0, Math.PI / 2], [0.125, 1, 1]]
			],
			YZ: [
				[new Mesh(scaleHandleGeometry, matCyanTransparent), [0, 0.85, 0.85], null, [0.2, 2, 2]],
				[new Line(lineGeometry, matLineCyan), [0, 0.855, 0.98], [0, 0, Math.PI / 2], [0.125, 1, 1]],
				[new Line(lineGeometry, matLineCyan), [0, 0.98, 0.855], [0, -Math.PI / 2, 0], [0.125, 1, 1]]
			],
			XZ: [
				[new Mesh(scaleHandleGeometry, matMagentaTransparent), [0.85, 0, 0.85], null, [2, 0.2, 2]],
				[new Line(lineGeometry, matLineMagenta), [0.855, 0, 0.98], null, [0.125, 1, 1]],
				[new Line(lineGeometry, matLineMagenta), [0.98, 0, 0.855], [0, -Math.PI / 2, 0], [0.125, 1, 1]]
			],
			XYZX: [
				[new Mesh(new BoxBufferGeometry(0.125, 0.125, 0.125), matWhiteTransperent), [1.1, 0, 0]],
			],
			XYZY: [
				[new Mesh(new BoxBufferGeometry(0.125, 0.125, 0.125), matWhiteTransperent), [0, 1.1, 0]],
			],
			XYZZ: [
				[new Mesh(new BoxBufferGeometry(0.125, 0.125, 0.125), matWhiteTransperent), [0, 0, 1.1]],
			]
		};

		const pickerScale = {
			X: [
				[new Mesh(new CylinderBufferGeometry(0.2, 0, 0.8, 4, 1, false), matInvisible), [0.5, 0, 0], [0, 0, -Math.PI / 2]]
			],
			Y: [
				[new Mesh(new CylinderBufferGeometry(0.2, 0, 0.8, 4, 1, false), matInvisible), [0, 0.5, 0]]
			],
			Z: [
				[new Mesh(new CylinderBufferGeometry(0.2, 0, 0.8, 4, 1, false), matInvisible), [0, 0, 0.5], [Math.PI / 2, 0, 0]]
			],
			XY: [
				[new Mesh(scaleHandleGeometry, matInvisible), [0.85, 0.85, 0], null, [3, 3, 0.2]],
			],
			YZ: [
				[new Mesh(scaleHandleGeometry, matInvisible), [0, 0.85, 0.85], null, [0.2, 3, 3]],
			],
			XZ: [
				[new Mesh(scaleHandleGeometry, matInvisible), [0.85, 0, 0.85], null, [3, 0.2, 3]],
			],
			XYZX: [
				[new Mesh(new BoxBufferGeometry(0.2, 0.2, 0.2), matInvisible), [1.1, 0, 0]],
			],
			XYZY: [
				[new Mesh(new BoxBufferGeometry(0.2, 0.2, 0.2), matInvisible), [0, 1.1, 0]],
			],
			XYZZ: [
				[new Mesh(new BoxBufferGeometry(0.2, 0.2, 0.2), matInvisible), [0, 0, 1.1]],
			]
		};

		const helperScale = {
			X: [
				[new Line(lineGeometry, matHelper.clone()), [-1e3, 0, 0], null, [1e6, 1, 1], 'helper']
			],
			Y: [
				[new Line(lineGeometry, matHelper.clone()), [0, -1e3, 0], [0, 0, Math.PI / 2], [1e6, 1, 1], 'helper']
			],
			Z: [
				[new Line(lineGeometry, matHelper.clone()), [0, 0, -1e3], [0, -Math.PI / 2, 0], [1e6, 1, 1], 'helper']
			]
		};

		// Creates an Object3D with gizmos described in custom hierarchy definition.
		function setupGizmo(gizmoMap) {

			const gizmo = new Object3D();

			for (let name in gizmoMap) {
				for (let i = gizmoMap[name].length; i--;) {
					const object = gizmoMap[name][i][0].clone();
					const position = gizmoMap[name][i][1];
					const rotation = gizmoMap[name][i][2];
					const scale = gizmoMap[name][i][3];
					const tag = gizmoMap[name][i][4];

					// name and tag properties are essential for picking and updating logic.
					object.name = name;
					object.tag = tag;

					if (position) {
						object.position.set(position[0], position[1], position[2]);
					}
					if (rotation) {
						object.rotation.set(rotation[0], rotation[1], rotation[2]);
					}
					if (scale) {
						object.scale.set(scale[0], scale[1], scale[2]);
					}
					object.updateMatrix();

					const tempGeometry = object.geometry.clone();
					tempGeometry.applyMatrix(object.matrix);
					object.geometry = tempGeometry;

					object.position.set(0, 0, 0);
					object.rotation.set(0, 0, 0);
					object.scale.set(1, 1, 1);
					gizmo.add(object);
				}
			}
			return gizmo;
		}

		// Reusable utility variables
		const tempVector = new Vector3(0, 0, 0);
		const tempEuler = new Euler();
		const alignVector = new Vector3(0, 1, 0);
		const zeroVector = new Vector3(0, 0, 0);
		const lookAtMatrix = new Matrix4();
		const tempQuaternion = new Quaternion();
		const tempQuaternion2 = new Quaternion();
		const identityQuaternion = new Quaternion();

		const unitX = new Vector3(1, 0, 0);
		const unitY = new Vector3(0, 1, 0);
		const unitZ = new Vector3(0, 0, 1);

		// Gizmo creation
		this.gizmo = {};
		this.picker = {};
		this.helper = {};

		this.add(this.gizmo["translate"] = setupGizmo(gizmoTranslate));
		this.add(this.gizmo["rotate"] = setupGizmo(gizmoRotate));
		this.add(this.gizmo["scale"] = setupGizmo(gizmoScale));
		this.add(this.picker["translate"] = setupGizmo(pickerTranslate));
		this.add(this.picker["rotate"] = setupGizmo(pickerRotate));
		this.add(this.picker["scale"] = setupGizmo(pickerScale));
		this.add(this.helper["translate"] = setupGizmo(helperTranslate));
		this.add(this.helper["rotate"] = setupGizmo(helperRotate));
		this.add(this.helper["scale"] = setupGizmo(helperScale));

		// Pickers should be hidden always
		this.picker["translate"].visible = false;
		this.picker["rotate"].visible = false;
		this.picker["scale"].visible = false;

		// updateMatrixWorld will update transformations and appearance of individual handles
		this.updateMatrixWorld = function () {

			if (this.mode === 'scale') this.space = 'local'; // scale always oriented to local rotation

			const quaternion = this.space === "local" ? this.worldQuaternion : identityQuaternion;

			// Show only gizmos for current transform mode

			this.gizmo["translate"].visible = this.mode === "translate";
			this.gizmo["rotate"].visible = this.mode === "rotate";
			this.gizmo["scale"].visible = this.mode === "scale";

			this.helper["translate"].visible = this.mode === "translate";
			this.helper["rotate"].visible = this.mode === "rotate";
			this.helper["scale"].visible = this.mode === "scale";

			let handles = [];
			handles = handles.concat(this.picker[this.mode].children);
			handles = handles.concat(this.gizmo[this.mode].children);
			handles = handles.concat(this.helper[this.mode].children);

			for (let i = 0; i < handles.length; i++) {
				const handle = handles[i];

				// hide aligned to camera
				handle.visible = true;
				handle.rotation.set(0, 0, 0);
				handle.position.copy(this.worldPosition);

				const eyeDistance = this.worldPosition.distanceTo(this.cameraPosition);
				handle.scale.set(1, 1, 1).multiplyScalar(eyeDistance * this.size / 7);

				// TODO: simplify helpers and consider decoupling from gizmo
				if (handle.tag === 'helper') {

					handle.visible = false;

					if (handle.name === 'AXIS') {
						handle.position.copy(this.worldPositionStart);
						handle.visible = !!this.axis;
						if (this.axis === 'X') {
							tempQuaternion.setFromEuler(tempEuler.set(0, 0, 0));
							handle.quaternion.copy(quaternion).multiply(tempQuaternion);
							if (Math.abs(alignVector.copy(unitX).applyQuaternion(quaternion).dot(this.eye)) > 0.9) {
								handle.visible = false;
							}
						}
						if (this.axis === 'Y') {
							tempQuaternion.setFromEuler(tempEuler.set(0, 0, Math.PI / 2));
							handle.quaternion.copy(quaternion).multiply(tempQuaternion);
							if (Math.abs(alignVector.copy(unitY).applyQuaternion(quaternion).dot(this.eye)) > 0.9) {
								handle.visible = false;
							}
						}
						if (this.axis === 'Z') {
							tempQuaternion.setFromEuler(tempEuler.set(0, Math.PI / 2, 0));
							handle.quaternion.copy(quaternion).multiply(tempQuaternion);
							if (Math.abs(alignVector.copy(unitZ).applyQuaternion(quaternion).dot(this.eye)) > 0.9) {
								handle.visible = false;
							}
						}
						if (this.axis === 'XYZE') {
							tempQuaternion.setFromEuler(tempEuler.set(0, Math.PI / 2, 0));
							alignVector.copy(this.rotationAxis);
							handle.quaternion.setFromRotationMatrix(lookAtMatrix.lookAt(zeroVector, alignVector, unitY));
							handle.quaternion.multiply(tempQuaternion);
							handle.visible = this.active;
						}
						if (this.axis === 'E') {
							handle.visible = false;
						}
					} else if (handle.name === 'START') {
						handle.position.copy(this.worldPositionStart);
						handle.visible = this.active;
					} else if (handle.name === 'END') {
						handle.position.copy(this.worldPosition);
						handle.visible = this.active;
					} else if (handle.name === 'DELTA') {
						handle.position.copy(this.worldPositionStart);
						handle.quaternion.copy(this.worldQuaternionStart);
						tempVector.set(1e-10, 1e-10, 1e-10).add(this.worldPositionStart).sub(this.worldPosition).multiplyScalar(-1);
						tempVector.applyQuaternion(this.worldQuaternionStart.clone().inverse());
						handle.scale.copy(tempVector);
						handle.visible = this.active;
					} else {
						handle.quaternion.copy(quaternion);
						if (this.active) {
							handle.position.copy(this.worldPositionStart);
						} else {
							handle.position.copy(this.worldPosition);
						}
						if (this.axis) {
							handle.visible = this.axis.search(handle.name) !== -1;
						}
					}
					// If updating helper, skip rest of the loop
					continue;
				}

				// Align handles to current local or world rotation
				handle.quaternion.copy(quaternion);

				if (this.mode === 'translate' || this.mode === 'scale') {
					// Hide translate and scale axis facing the camera
					const AXIS_HIDE_TRESHOLD = 0.99;
					const PLANE_HIDE_TRESHOLD = 0.2;
					const AXIS_FLIP_TRESHOLD = -0.4;

					if (handle.name === 'X' || handle.name === 'XYZX') {
						if (Math.abs(alignVector.copy(unitX).applyQuaternion(quaternion).dot(this.eye)) > AXIS_HIDE_TRESHOLD) {
							handle.scale.set(1e-10, 1e-10, 1e-10);
							handle.visible = false;
						}
					}
					if (handle.name === 'Y' || handle.name === 'XYZY') {
						if (Math.abs(alignVector.copy(unitY).applyQuaternion(quaternion).dot(this.eye)) > AXIS_HIDE_TRESHOLD) {
							handle.scale.set(1e-10, 1e-10, 1e-10);
							handle.visible = false;
						}
					}
					if (handle.name === 'Z' || handle.name === 'XYZZ') {
						if (Math.abs(alignVector.copy(unitZ).applyQuaternion(quaternion).dot(this.eye)) > AXIS_HIDE_TRESHOLD) {
							handle.scale.set(1e-10, 1e-10, 1e-10);
							handle.visible = false;
						}
					}
					if (handle.name === 'XY') {
						if (Math.abs(alignVector.copy(unitZ).applyQuaternion(quaternion).dot(this.eye)) < PLANE_HIDE_TRESHOLD) {
							handle.scale.set(1e-10, 1e-10, 1e-10);
							handle.visible = false;
						}
					}
					if (handle.name === 'YZ') {
						if (Math.abs(alignVector.copy(unitX).applyQuaternion(quaternion).dot(this.eye)) < PLANE_HIDE_TRESHOLD) {
							handle.scale.set(1e-10, 1e-10, 1e-10);
							handle.visible = false;
						}
					}
					if (handle.name === 'XZ') {
						if (Math.abs(alignVector.copy(unitY).applyQuaternion(quaternion).dot(this.eye)) < PLANE_HIDE_TRESHOLD) {
							handle.scale.set(1e-10, 1e-10, 1e-10);
							handle.visible = false;
						}
					}

					// Flip translate and scale axis ocluded behind another axis
					if (handle.name.search('X') !== -1) {
						if (alignVector.copy(unitX).applyQuaternion(quaternion).dot(this.eye) < AXIS_FLIP_TRESHOLD) {
							if (handle.tag === 'fwd') {
								handle.visible = false;
							} else {
								handle.scale.x *= -1;
							}
						} else if (handle.tag === 'bwd') {
							handle.visible = false;
						}
					}
					if (handle.name.search('Y') !== -1) {
						if (alignVector.copy(unitY).applyQuaternion(quaternion).dot(this.eye) < AXIS_FLIP_TRESHOLD) {
							if (handle.tag === 'fwd') {
								handle.visible = false;
							} else {
								handle.scale.y *= -1;
							}
						} else if (handle.tag === 'bwd') {
							handle.visible = false;
						}
					}
					if (handle.name.search('Z') !== -1) {
						if (alignVector.copy(unitZ).applyQuaternion(quaternion).dot(this.eye) < AXIS_FLIP_TRESHOLD) {
							if (handle.tag === 'fwd') {
								handle.visible = false;
							} else {
								handle.scale.z *= -1;
							}
						} else if (handle.tag === 'bwd') {
							handle.visible = false;
						}
					}
				} else if (this.mode === 'rotate') {
					// Align handles to current local or world rotation
					tempQuaternion2.copy(quaternion);
					alignVector.copy(this.eye).applyQuaternion(tempQuaternion.copy(quaternion).inverse());

					if (handle.name.search("E") !== - 1) {
						handle.quaternion.setFromRotationMatrix(lookAtMatrix.lookAt(this.eye, zeroVector, unitY));
					}
					if (handle.name === 'X') {
						tempQuaternion.setFromAxisAngle(unitX, Math.atan2(-alignVector.y, alignVector.z));
						tempQuaternion.multiplyQuaternions(tempQuaternion2, tempQuaternion);
						handle.quaternion.copy(tempQuaternion);
					}
					if (handle.name === 'Y') {
						tempQuaternion.setFromAxisAngle(unitY, Math.atan2(alignVector.x, alignVector.z));
						tempQuaternion.multiplyQuaternions(tempQuaternion2, tempQuaternion);
						handle.quaternion.copy(tempQuaternion);
					}
					if (handle.name === 'Z') {
						tempQuaternion.setFromAxisAngle(unitZ, Math.atan2(alignVector.y, alignVector.x));
						tempQuaternion.multiplyQuaternions(tempQuaternion2, tempQuaternion);
						handle.quaternion.copy(tempQuaternion);
					}
				}

				// Hide non-enabled axes
				{
					handle.visible = handle.visible && (handle.name.indexOf("X") === -1 || this.showX);
					handle.visible = handle.visible && (handle.name.indexOf("Y") === -1 || this.showY);
					handle.visible = handle.visible && (handle.name.indexOf("Z") === -1 || this.showZ);
					handle.visible = handle.visible && (handle.name.indexOf("E") === -1 || (this.showX && this.showY && this.showZ));
				}

				// highlight selected axis
				handle.material._opacity = handle.material._opacity || handle.material.opacity;
				handle.material._color = handle.material._color || handle.material.color.clone();

				handle.material.color.copy(handle.material._color);
				handle.material.opacity = handle.material._opacity;

				handle.material.color.lerp(white, 0.25);

				if (!this.enabled) {
					handle.material.opacity *= 0.25;
					handle.material.color.lerp(gray, 0.75);
				} else if (this.axis) {
					if (handle.name === this.axis) {
						handle.material.opacity = handle.material._opacity * 2;
						handle.material.color.copy(handle.material._color);
					} else if (this.axis.split('').some(function(a) {return handle.name === a;})) {
						handle.material.opacity = handle.material._opacity * 2;
						handle.material.color.copy(handle.material._color);
					} else {
						handle.material.opacity *= 0.25;
						handle.material.color.lerp(white, 0.5);
					}
				}
			}
			Object3D.prototype.updateMatrixWorld.call(this);
		};
	}
}
