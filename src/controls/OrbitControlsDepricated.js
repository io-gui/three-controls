import * as THREE from "../../../three.js/build/three.module.js";
import {Control} from "./Control.js"

export class OrbitControlsDepricated extends Control {
	// Deprication warnings
	addEventListener( type, listener ) {
		super.addEventListener( type, listener );
		if ( type === "start" ) {
			console.warn( '"start" event depricated, use "pointerdown" event instead.' );
		}
		if ( type === "end" ) {
			console.warn( '"end" event depricated, use "pointerup" event instead.' );
		}
	}
	getZoomScale() {
		console.warn( '.getZoomScale() has been depricated. Use .zoomScale instead.' );
		return this.zoomScale;
	}
	getAutoRotationAngle() {
		console.warn( '.getAutoRotationAngle() has been depricated. Use .autoRotateSpeed instead.' );
		return 2 * Math.PI / 60 / 60 * this.autoRotateSpeed;
	}
	getPolarAngle() {
		console.warn( '.getPolarAngle() has been depricated. Use .polarAngle instead.' );
		return this.polarAngle;
	};
	getAzimuthalAngle() {
		console.warn( '.getAzimuthalAngle() has been depricated. Use .azimuthalAngle instead.' );
		return this.azimuthalAngle;
	};
	get center() {
		console.warn( '.center has been renamed to .target' );
		return this.target;
	}
	get noZoom() {
		console.warn( '.noZoom has been deprecated. Use .enableZoom instead.' );
		return !this.enableZoom;
	}
	set noZoom(value) {
		console.warn( '.noZoom has been deprecated. Use .enableZoom instead.' );
		this.enableZoom = !value;
	}
	get noRotate() {
		console.warn( '.noRotate has been deprecated. Use .enableRotate instead.' );
		return !this.enableRotate;
	}
	set noRotate(value) {
		console.warn( '.noRotate has been deprecated. Use .enableRotate instead.' );
		this.enableRotate = !value;
	}
	get noPan() {
		console.warn( '.noPan has been deprecated. Use .enablePan instead.' );
		return !this.enablePan;
	}
	set noPan(value) {
		console.warn( '.noPan has been deprecated. Use .enablePan instead.' );
		this.enablePan = !value;
	}
	get noKeys() {
		console.warn( '.noKeys has been deprecated. Use .enableKeys instead.' );
		return !this.enableKeys;
	}
	set noKeys(value) {
		console.warn( '.noKeys has been deprecated. Use .enableKeys instead.' );
		this.enableKeys = !value;
	}
	get staticMoving() {
		console.warn( '.staticMoving has been deprecated. Use .enableDamping instead.' );
		return !this.enableDamping;
	}
	set staticMoving(value) {
		console.warn( '.staticMoving has been deprecated. Use .enableDamping instead.' );
		this.enableDamping = !value;
	}
	get dynamicDampingFactor() {
		console.warn( '.dynamicDampingFactor has been renamed. Use .dampingFactor instead.' );
		return this.dampingFactor;
	}
	set dynamicDampingFactor(value) {
		console.warn( '.dynamicDampingFactor has been renamed. Use .dampingFactor instead.' );
		this.dampingFactor = value;
	}
}
