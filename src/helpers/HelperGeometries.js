/**
 * @author arodic / https://github.com/arodic
 */

import {
	SphereBufferGeometry, CylinderBufferGeometry, OctahedronBufferGeometry, BoxBufferGeometry, TorusBufferGeometry
} from "../../../three.js/build/three.module.js";

import {HelperMesh} from "./HelperMesh.js";

const PI = Math.PI;
const HPI = Math.PI / 2;

export const geosphereGeometry = new OctahedronBufferGeometry(1, 3);

export const octahedronGeometry = new OctahedronBufferGeometry(1, 0);

export const coneGeometry = new HelperMesh([
	{geometry: new CylinderBufferGeometry(0, 0.2, 1, 8, 2), position: [0, 0.5, 0]},
	{geometry: new SphereBufferGeometry(0.2, 8, 8)}
]).geometry;

export const lineGeometry = new HelperMesh([
	{geometry: new CylinderBufferGeometry(0.00001, 0.00001, 1, 4, 2, false), position: [0, 0, 0], thickness: 1},
	{geometry: new SphereBufferGeometry(0.00001, 4, 4), position: [0, -0.5, 0], thickness: 1},
	{geometry: new SphereBufferGeometry(0.00001, 4, 4), position: [0, 0.5, 0], thickness: 1}
]).geometry;

export const arrowGeometry = new HelperMesh([
	{geometry: coneGeometry, position: [0, 0.8, 0], scale: 0.2},
	{geometry: new CylinderBufferGeometry(0.00001, 0.00001, 0.8, 4, 2, false), position: [0, 0.4, 0], thickness: 1}
]).geometry;

export const scaleArrowGeometry = new HelperMesh([
	{geometry: geosphereGeometry, position: [0, 0.8, 0], scale: 0.075},
	{geometry: new CylinderBufferGeometry(0.00001, 0.00001, 0.8, 4, 2, false), position: [0, 0.4, 0], thickness: 1}
]).geometry;

export const corner2Geometry = new HelperMesh([
	{geometry: new CylinderBufferGeometry(0.00001, 0.00001, 1, 4, 2, false), position: [0.5, 0, 0], rotation: [0, 0, HPI], thickness: 1},
	{geometry: new CylinderBufferGeometry(0.00001, 0.00001, 1, 4, 2, false), position: [0, 0, 0.5], rotation: [HPI, 0, 0], thickness: 1},
	{geometry: new SphereBufferGeometry(0.00001, 4, 4), position: [0, 0, 0], thickness: 1},
	{geometry: new SphereBufferGeometry(0.00001, 4, 4), position: [1, 0, 0], rotation: [0, 0, HPI], thickness: 1},
	{geometry: new SphereBufferGeometry(0.00001, 4, 4), position: [0, 0, 1], rotation: [HPI, 0, 0], thickness: 1},
]).geometry;

export const corner3Geometry = new HelperMesh([
	{geometry: new CylinderBufferGeometry(0.00001, 0.00001, 1, 4, 2, false), position: [0.5, 0, 0], rotation: [0, 0, HPI], thickness: 1},
	{geometry: new CylinderBufferGeometry(0.00001, 0.00001, 1, 4, 2, false), position: [0, 0.5, 0], rotation: [0, HPI, 0], thickness: 1},
	{geometry: new CylinderBufferGeometry(0.00001, 0.00001, 1, 4, 2, false), position: [0, 0, 0.5], rotation: [HPI, 0, 0], thickness: 1},
	{geometry: new SphereBufferGeometry(0.00001, 8, 4), position: [0, 0, 0], thickness: 1},
	{geometry: new SphereBufferGeometry(0.00001, 8, 4), position: [1, 0, 0], rotation: [0, 0, HPI], thickness: 1},
	{geometry: new SphereBufferGeometry(0.00001, 8, 4), position: [0, 1, 0], rotation: [0, HPI, 0], thickness: 1},
	{geometry: new SphereBufferGeometry(0.00001, 8, 4), position: [0, 0, 1], rotation: [HPI, 0, 0], thickness: 1},
]).geometry;

export const plusGeometry = new HelperMesh([
	{geometry: new CylinderBufferGeometry(0.00001, 0.00001, 2, 4, 2, false), position: [0, 0, 0], rotation: [0, 0, HPI], thickness: 1},
	{geometry: new CylinderBufferGeometry(0.00001, 0.00001, 2, 4, 2, false), position: [0, 0, 0], rotation: [HPI, 0, 0], thickness: 1},
	{geometry: new SphereBufferGeometry(0.00001, 8, 4), position: [1, 0, 0], thickness: 1},
	{geometry: new SphereBufferGeometry(0.00001, 8, 4), position: [-1, 0, 0], thickness: 1},
	{geometry: new SphereBufferGeometry(0.00001, 8, 4), position: [0, 0, 1], rotation: [HPI, 0, 0], thickness: 1},
	{geometry: new SphereBufferGeometry(0.00001, 8, 4), position: [0, 0, -1], rotation: [HPI, 0, 0], thickness: 1},
]).geometry;

export const pickerHandleGeometry = new HelperMesh([
	{geometry: new CylinderBufferGeometry(0.2, 0, 1, 4, 1, false), position: [0, 0.5, 0]}
]).geometry;

export const planeGeometry = new BoxBufferGeometry(1, 1, 0.01, 1, 1, 1);

export const circleGeometry = new HelperMesh([
	{geometry: new OctahedronBufferGeometry( 1, 3 ), scale: [1, 0.01, 1]},
]).geometry;

export const ringGeometry = new HelperMesh([
	{geometry: new TorusBufferGeometry( 1, 0.00001, 8, 128 ), rotation: [HPI, 0, 0], thickness: 1},
]).geometry;

export const halfRingGeometry = new HelperMesh([
	{geometry: new TorusBufferGeometry( 1, 0.00001, 8, 64, PI ), rotation: [HPI, 0, 0]},
]).geometry;

export const ringPickerGeometry = new HelperMesh([
	{geometry: new TorusBufferGeometry( 1, 0.1, 8, 128 ), rotation: [HPI, 0, 0]},
]).geometry;

export const rotateHandleGeometry = new HelperMesh([
	{geometry: new TorusBufferGeometry( 1, 0.00001, 4, 64, PI ), thickness: 1},
	{geometry: new SphereBufferGeometry(0.00001, 4, 4), position: [1, 0, 0], rotation: [HPI, 0, 0]},
	{geometry: new SphereBufferGeometry(0.00001, 4, 4), position: [-1, 0, 0], rotation: [HPI, 0, 0]},
	{geometry: octahedronGeometry, position: [0, 0.992, 0], scale: [0.2, 0.05, 0.05]}
]).geometry;

export const rotatePickerGeometry = new HelperMesh([
	{geometry: new TorusBufferGeometry( 1, 0.03, 4, 8, PI )},
	{geometry: octahedronGeometry, position: [0, 0.992, 0], scale: 0.2}
]).geometry;
