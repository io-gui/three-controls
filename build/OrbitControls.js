import { Vector2, Object3D, MOUSE, Vector3, Quaternion, Spherical } from '../../../three.js/build/three.module.js';

class Pointer {
  constructor() {
    this.position = new Vector2();
    this.previous = new Vector2();
    this.movement = new Vector2();
    this.velocity = new Vector2();
    this.distance = new Vector2();
    this.start = new Vector2();
    this.button = undefined;
  }
  copy(pointer) {
    this.position.copy(pointer.position);
    this.previous.copy(pointer.previous);
    this.movement.copy(pointer.movement);
    this.velocity.copy(pointer.velocity);
    this.distance.copy(pointer.distance);
    this.start.copy(pointer.start);
  }
  update(pointer, buttons, dt) {
    let button = 0;
    if (event.buttons === 2) button = 1;
    if (event.buttons === 4) button = 2;
    this.previous.copy(this.position);
    this.movement.copy(pointer.position).sub(this.position);
    this.velocity.copy(this.movement).multiplyScalar(1 / dt);
    this.distance.copy(pointer.position).sub(this.start);
    this.position.copy(pointer.position);
    this.button = button;
    this.buttons = buttons;
  }
}

// normalize mouse / touch pointer and remap {x,y} to view space.
class ControlPointers extends Array {
  constructor() {
    super();
    this.ctrlKey = false;
    this.shiftKey = false;
    this.metaKey = false;
    this.removed = [];

    Object.defineProperty(this, 'time', { value: 0, enumerable: false, writable: true });
  }
  getClosest(reference) {
    let closest = this[0];
    for (let i = 1; i < this.length; i++) {
      if (reference.position.distanceTo(this[i].position) < reference.position.distanceTo(closest.position)) {
        closest = this[i];
      }
    }
    return closest;
  }
  update(event, domElement, remove) {
    this.ctrlKey = event.ctrlKey;
    this.shiftKey = event.shiftKey;
    this.metaKey = event.metaKey;
    this.removed = [];

    let dt = (performance.now() - this.time) / 1000;
    this.time = performance.now();

    let touches = event.touches ? event.touches : [event];
    let foundPointers = [];
    let rect = domElement.getBoundingClientRect();
    for (let i = 0; i < touches.length; i++) {
      if (touches[i].target === event.target || event.touches === undefined) {
        let position = new Vector2(
          (touches[i].clientX - rect.left) / rect.width * 2.0 - 1.0,
          - ((touches[i].clientY - rect.top) / rect.height * 2.0 - 1.0)
        );
        if (this[i] === undefined) {
          this[i] = new Pointer();
          this[i].start.copy(position);
        }
        let newPointer = new Pointer();
        newPointer.position.copy(position);
        let pointer = this.getClosest(newPointer);
        pointer.update(newPointer, event.buttons, dt);
        foundPointers.push(pointer);
      }
    }
    if (remove) foundPointers = [];
    for (let i = this.length; i--;) {
      if (foundPointers.indexOf(this[i]) === -1) {
        this.removed.push(this[i]);
        this.splice(i, 1);
      }
    }
  }
}

/**
 * @author arodic / https://github.com/arodic
 */

class Control extends Object3D {
	constructor(domElement) {
		super();
		this.visible = false;

		if (domElement === undefined) {
			console.warn('Control: domElement is mandatory in constructor!');
			domElement = document;
		}

		this.defineProperties({
			"enabled": true,
			"hovered": true,
			"domElement": domElement,
			"pointers": new ControlPointers()
		});

		const scope = this;

		function _onContextMenu(event) {
			if (!scope.enabled) return;
			event.preventDefault();
			scope.onContextMenu(event);
			scope.dispatchEvent({ type: "contextmenu" }); // TODO: detail/value?
		}
		function _onHover(event) {
			if (!scope.enabled) return;
			if (!this.hovered) {
				window.addEventListener("keydown", _onKeyDown, false);
				window.addEventListener("keyup", _onKeyUp, false);
			}
			this.hovered = true;
			scope.pointers.update(event, domElement);
			scope.onPointerHover(scope.pointers);
			scope.dispatchEvent({ type: "hover" }); // TODO: detail/value?
		}
		function _onLeave(event) {
			if (!scope.enabled) return;
			if (this.hovered) {
				window.removeEventListener("keydown", _onKeyDown, false);
				window.removeEventListener("keyup", _onKeyUp, false);
			}
			this.hovered = false;
			scope.pointers.update(event, domElement);
			scope.onPointerLeave(scope.pointers);
			scope.dispatchEvent({ type: "pointerleave" }); // TODO: detail/value?
		}
		function _onDown(event) {
			if (!scope.enabled) return;
			scope.pointers.update(event, domElement);
			scope.onPointerHover(scope.pointers);
			scope.onPointerDown(scope.pointers);
			domElement.removeEventListener("mousemove", _onHover);
			document.addEventListener("mousemove", _onMove, false);
			document.addEventListener("mouseup", _onUp, false);
			scope.dispatchEvent({ type: "pointerdown" }); // TODO: detail/value?
		}
		function _onMove(event) {
			if (!scope.enabled) {
				document.removeEventListener("mousemove", _onMove, false);
				document.removeEventListener("mouseup", _onUp, false);
				return;
			}
			scope.pointers.update(event, domElement);
			scope.onPointerMove(scope.pointers);
			scope.dispatchEvent({ type: "pointermove" }); // TODO: detail/value?
		}
		function _onUp(event) {
			if (!scope.enabled) return;
			scope.pointers.update(event, domElement, !event.touches);
			scope.onPointerUp(scope.pointers);
			domElement.addEventListener("mousemove", _onHover);
			document.removeEventListener("mousemove", _onMove, false);
			document.removeEventListener("mouseup", _onUp, false);
			scope.dispatchEvent({ type: "pointerup" }); // TODO: detail/value?
		}
		function _onKeyDown(event) {
			if (!scope.enabled) return;
			scope.onKeyDown(event);
			scope.dispatchEvent({ type: "keydown" }); // TODO: detail/value?
		}
		function _onKeyUp(event) {
			if (!scope.enabled) return;
			scope.onKeyUp(event);
			scope.dispatchEvent({ type: "keyup" }); // TODO: detail/value?
		}

		function _onWheel(event) {
			if (!scope.enabled) return;
			scope.onWheel(event);
			scope.dispatchEvent({ type: "wheel" }); // TODO: detail/value?
		}

		{
			domElement.addEventListener("mousedown", _onDown, false);
			domElement.addEventListener("touchstart", _onDown, false);
			domElement.addEventListener("mousemove", _onHover, false);
			domElement.addEventListener("touchmove", _onMove, false);
			domElement.addEventListener("touchend", _onUp, false);
			domElement.addEventListener("touchcancel", _onLeave, false);
			domElement.addEventListener("touchleave", _onLeave, false);
			domElement.addEventListener("mouseleave", _onLeave, false);
			domElement.addEventListener("contextmenu", _onContextMenu, false);
			domElement.addEventListener("wheel", _onWheel, false);
		}

		this.dispose = function () {
			domElement.removeEventListener("mousedown", _onDown);
			domElement.removeEventListener("touchstart", _onDown);
			domElement.removeEventListener("mousemove", _onHover);
			document.removeEventListener("mousemove", _onMove);
			domElement.removeEventListener("touchmove", _onMove);
			document.removeEventListener("mouseup", _onUp);
			domElement.removeEventListener("touchend", _onUp);
			domElement.removeEventListener("touchcancel", _onLeave);
			domElement.removeEventListener("touchleave", _onLeave);
			domElement.removeEventListener("mouseleave", _onLeave);
			domElement.removeEventListener("contextmenu", _onContextMenu);
			window.removeEventListener("keydown", _onKeyDown, false);
			window.removeEventListener("keyup", _onKeyUp, false);
			domElement.removeEventListener("wheel", _onWheel, false);
			this.stopAnimation();
		};

		this._animationActive = false;
		this._animationTime = 0;
		this._rafID;
	}

	startAnimation() {
		if (!this._animationActive) {
			this._animationActive = true;
			this._animationTime = performance.now();
			this._rafID = requestAnimationFrame( () => {
				const time = performance.now();
				this.animate( time - this._animationTime );
				this._animationTime = time;
			} );
		}
	}
	animate( timestep ) {
		if (this._animationActive) this._rafID = requestAnimationFrame( () => {
			const time = performance.now();
			timestep = time - this._animationTime;
			this.animate( timestep );
			this._animationTime = time;
		} );
	}
	stopAnimation() {
		this._animationActive = false;
		cancelAnimationFrame(this._rafID);
	}

	// Defined getter, setter and store for a property
	defineProperty(propName, defaultValue) {
		let propValue = defaultValue;
		Object.defineProperty(this, propName, {
			get: function() {
				return propValue !== undefined ? propValue : defaultValue;
			},
			set: function(value) {
				if (propValue !== value) {
					propValue = value;
					this.dispatchEvent({ type: propName + "-changed", value: value });
					this.dispatchEvent({ type: "change", prop: propName, value: value });
				}
			}
		});
		this[propName] = defaultValue;
		setTimeout(() => {
			this.dispatchEvent({ type: propName + "-changed", value: defaultValue });
			this.dispatchEvent({ type: "change", prop: propName, value: defaultValue });
		});
	}
	defineProperties(props) {
		for (let prop in props) {
			this.defineProperty(prop, props[prop]);
		}
	}

	attach(object) {
		this.object = object;
		this.visible = true;
	}
	detach() {
		this.object = undefined;
		this.visible = false;
	}
	onContextMenu(event) { }
	onPointerHover(pointer) { }
	onPointerDown(pointer) { }
	onPointerMove(pointer) { }
	onPointerUp(pointer) { }
	onPointerLeave(pointer) { }
	onKeyDown(event) { }
	onKeyUp(event) { }
	onWheel(event) { }
}

class OrbitControlsDepricated extends Control {
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
	}
	getAzimuthalAngle() {
		console.warn( '.getAzimuthalAngle() has been depricated. Use .azimuthalAngle instead.' );
		return this.azimuthalAngle;
	}
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

/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 * @author arodic / http://github.com/arodic
 */

const STATE = { NONE: - 1, ROTATE: 0, DOLLY: 1, PAN: 2 };
const KEYS = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 }; // The four arrow keys
const BUTTON = { LEFT: MOUSE.LEFT, MIDDLE: MOUSE.MIDDLE, RIGHT: MOUSE.RIGHT }; // Mouse buttons
const EPS = 0.000001;

// Temp variables
const tempVector = new Vector3();
const unitY = new Vector3( 0, 1, 0 );
const tempQuat = new Quaternion();
const tempQuatInverse = tempQuat.clone().inverse();

function dampTo(source, target, smoothing, dt) {
	const t = 1 - Math.pow( smoothing, dt );
	return source * ( 1 - t ) + target * t;
}
// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one-finger move
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - right mouse, or left mouse + ctrl/metaKey, or arrow keys / touch: two-finger move

class OrbitControls extends OrbitControlsDepricated {
	constructor( object, domElement ) {
		super( domElement );

		this.defineProperties({
			object: object,
			target: new Vector3(), // sets the location of focus
			minDistance: 0, // PerspectiveCamera dolly limit
			maxDistance: Infinity, // PerspectiveCamera dolly limit
			minZoom: 0, // OrthographicCamera zoom limit
			maxZoom: Infinity, // OrthographicCamera zoom limit
			minPolarAngle: 0, // radians (0 to Math.PI)
			maxPolarAngle: Math.PI, // radians (0 to Math.PI)
			minAzimuthAngle: - Infinity, // radians (-Math.PI to Math.PI)
			maxAzimuthAngle: Infinity, // radians (-Math.PI to Math.PI)
			enableDamping: true, // Enable inertia
			dampingFactor: 0.05,
			enableZoom: true,
			zoomSpeed: 1.0,
			enableRotate: true,
			rotateSpeed: 1.0,
			enablePan: true,
			panSpeed: 1.0,
			screenSpacePanning: false,
			keyPanSpeed: 10.1,	// pixels moved per arrow key push
			autoRotate: false, // Automatically rotate around the target
			autoRotateSpeed: 0.9,
			enableKeys: true,
			// TODO: WIP
			state: STATE.NONE,
			needsUpdate: false
		});

		// internals
		// current position in _spherical coordinates
		this._spherical = new Spherical();
		this._sphericalOffset = new Spherical();
		this._sphericalInertia = new Spherical();

		this._panOffset = new Vector3();
		this._panInertia = new Vector3();

		this._scale = 1;

		this.addEventListener( 'autoRotate-changed', ( event ) => {
			if ( event.value ) {
				this._sphericalInertia.theta = this.autoRotateSpeed;
				this.needsUpdate = true;
			}
		} );

		this.addEventListener( 'needsUpdate-changed', ( event ) => {
			if ( event.value ) this.startAnimation();
		} );

		this.update(0);
	}

	animate( timestep ) {

		super.animate( timestep );

		let dt = timestep / 1000;

		// Apply rotation intertia if not currently rotating
		if ( this.state !== STATE.ROTATE ) {
			let thetaTarget = this.autoRotate ? this.autoRotateSpeed : 0;
			if ( this.enableDamping ) {
				this._sphericalInertia.theta = dampTo(this._sphericalInertia.theta, thetaTarget, this.dampingFactor, dt);
				this._sphericalInertia.phi = dampTo(this._sphericalInertia.phi, 0.0, this.dampingFactor, dt);
			} else {
				this._sphericalInertia.theta = thetaTarget;
			}
		}
		this._sphericalOffset.theta += this._sphericalInertia.theta * dt;
		this._sphericalOffset.phi += this._sphericalInertia.phi * dt;

		// Apply pan intertia if not currently panning
		if ( this.state !== STATE.PAN ) {
			this._panInertia.x = dampTo(this._panInertia.x, 0.0, this.dampingFactor, dt);
			this._panInertia.y = dampTo(this._panInertia.y, 0.0, this.dampingFactor, dt);
			this._panInertia.z = dampTo(this._panInertia.z, 0.0, this.dampingFactor, dt);
		}
		this._panOffset.x += this._panInertia.x * dt;
		this._panOffset.y += this._panInertia.y * dt;
		this._panOffset.z += this._panInertia.z * dt;

		this.update( timestep );

		// Determine if animation needs to continue
		let maxVelocity = 0;
		maxVelocity = Math.max(maxVelocity, Math.abs(this._sphericalInertia.theta));
		maxVelocity = Math.max(maxVelocity, Math.abs(this._sphericalInertia.phi));
		maxVelocity = Math.max(maxVelocity, Math.abs(this._panInertia.x));
		maxVelocity = Math.max(maxVelocity, Math.abs(this._panInertia.y));
		maxVelocity = Math.max(maxVelocity, Math.abs(this._panInertia.z));
		if (maxVelocity < EPS) this.stopAnimation();

	}

	update( dt ) {
		// camera.up is the orbit axis
		tempQuat.setFromUnitVectors( this.object.up, unitY );
		tempQuatInverse.copy( tempQuat ).inverse();
		tempVector.copy( this.object.position ).sub( this.target );
		// rotate tempVector to "y-axis-is-up" space
		tempVector.applyQuaternion( tempQuat );
		// angle from z-axis around y-axis
		this._spherical.setFromVector3( tempVector );
		this._spherical.theta += this._sphericalOffset.theta;
		this._spherical.phi += this._sphericalOffset.phi;
		// restrict theta to be between desired limits
		this._spherical.theta = Math.max( this.minAzimuthAngle, Math.min( this.maxAzimuthAngle, this._spherical.theta ) );
		// restrict phi to be between desired limits
		this._spherical.phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, this._spherical.phi ) );
		this._spherical.radius *= this._scale;
		this._spherical.makeSafe();
		// restrict radius to be between desired limits
		this._spherical.radius = Math.max( this.minDistance, Math.min( this.maxDistance, this._spherical.radius ) );
		// move target to panned location
		this.target.add( this._panOffset );
		tempVector.setFromSpherical( this._spherical );
		// rotate tempVector back to "camera-up-vector-is-up" space
		tempVector.applyQuaternion( tempQuatInverse );
		this.object.position.copy( this.target ).add( tempVector );
		this.object.lookAt( this.target );

		if (this.state === STATE.ROTATE && this.enableDamping) {
			if (this._sphericalOffset.phi || this._sphericalOffset.theta) {
				this._sphericalInertia.theta = this._sphericalOffset.theta * dt;
				this._sphericalInertia.phi = this._sphericalOffset.phi * dt;
			}
		}
		this._sphericalOffset.set( 0, 0, 0 );

		if (this.state === STATE.PAN && this.enableDamping) {
			if (this._panOffset.length()) {
				this._panInertia.copy(this._panOffset).multiplyScalar( dt );
			}
		}
		this._panOffset.set( 0, 0, 0 );

		this._scale = 1;
		this.needsUpdate = false;
		this.dispatchEvent( {type: "change"} );
		return true;
	}

	onPointerMove( pointers ) {
		switch ( pointers.length ) {
			default:
			case 0:
				this.state = STATE.NONE;
				break;
			case 1:
				switch ( pointers[0].button ) {
					case BUTTON.LEFT:
						if ( pointers[0].ctrlKey || pointers[0].metaKey ) {
							if ( this.enablePan === false ) return;
							this.state = STATE.PAN;
							this.pan( pointers[0] ); // TODO: correct scale
						} else {
							if ( this.enableRotate === false ) return;
							this.state = STATE.ROTATE;
							this.rotate( pointers[0] );
						}
						break;
					case BUTTON.MIDDLE:
						if ( this.enableZoom === false ) return;
						this.state = STATE.DOLLY;
						this.dolly( pointers[0].movement.y );
						break;
					case BUTTON.RIGHT:
						if ( this.enablePan === false ) return;
						this.state = STATE.PAN;
						this.pan( pointers[0] ); // TODO: correct scale
						break;
				}
				break;
			case 2: // two-fingered touch: dolly-pan
				console.log('TODO');
				// if ( scope.enableZoom === false && scope.enablePan === false ) return;
				// if ( this.state !== STATE.TOUCH_DOLLY_PAN ) return; // is this needed?
				// 	if ( this.enableZoom ) {
				// 		var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
				// 		var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
				// 		var distance = Math.sqrt( dx * dx + dy * dy );
				// 		dollyEnd.set( 0, distance );
				// 		dollyDelta.set( 0, Math.pow( dollyEnd.y / dollyStart.y, this.zoomSpeed ) );
				// 		this.dollyIn( dollyDelta.y );
				// 		dollyStart.copy( dollyEnd );
				// 	}
				// 	if ( this.enablePan ) {
				// 		var x = 0.5 * ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX );
				// 		var y = 0.5 * ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY );
				// 		panEnd.set( x, y );
				// 		panDelta.subVectors( panEnd, panStart ).multiplyScalar( this.panSpeed );
				// 		pan( panDelta.x, panDelta.y );
				// 		panStart.copy( panEnd );
				// 	}
				break;
		}
	}
	onPointerUp( pointers ) {
		if ( pointers.length === 0 ) this.state = STATE.NONE;
	}
	onKeyDown( event ) {
		if ( this.enableKeys === false || this.enablePan === false ) return;
		switch ( event.keyCode ) {
			case KEYS.UP:
				this.panUp( this.keyPanSpeed );
				break;
			case KEYS.BOTTOM:
				this.panUp( - this.keyPanSpeed );
				break;
			case KEYS.LEFT:
				this.panLeft( this.keyPanSpeed );
				break;
			case KEYS.RIGHT:
				this.panLeft( - this.keyPanSpeed );
				break;
		}
	}
	onWheel( event ) {
		if ( this.enableZoom === false || ( this.state !== STATE.NONE && this.state !== STATE.ROTATE ) ) return;
		event.stopPropagation();
		if ( event.deltaY < 0 ) {
			this.dollyOut( Math.pow( 0.95, this.zoomSpeed ) );
		} else if ( event.deltaY > 0 ) {
			this.dollyIn( Math.pow( 0.95, this.zoomSpeed ) );
		}
	}
	// control methods
	pan( pointer ) {
		if ( this.object.isPerspectiveCamera ) {
			tempVector.copy( this.object.position ).sub( this.target );
			let targetDistance = tempVector.length();
			// half of the fov is center to top of screen
			targetDistance *= Math.tan( ( this.object.fov / 2 ) * Math.PI / 180.0 );
			// we use only clientHeight here so aspect ratio does not distort speed
			this.panLeft( pointer.movement.x * targetDistance * this.panSpeed );
			this.panUp( -pointer.movement.y * targetDistance * this.panSpeed );
		} else if ( this.object.isOrthographicCamera ) {
			this.panLeft( pointer.movement.x * ( this.object.right - this.object.left ) / this.object.zoom * this.panSpeed );
			this.panUp( -pointer.movement.y * ( this.object.top - this.object.bottom ) / this.object.zoom * this.panSpeed );
		}
	}
	panLeft( distance ) {
		tempVector.setFromMatrixColumn( this.object.matrix, 0 );
		tempVector.multiplyScalar( - distance );
		this._panOffset.add( tempVector );
		this.needsUpdate = true;
	}
	panUp( distance ) {
		if ( this.screenSpacePanning === true ) {
			tempVector.setFromMatrixColumn( this.object.matrix, 1 );
		} else {
			tempVector.setFromMatrixColumn( this.object.matrix, 0 );
			tempVector.crossVectors( this.object.up, tempVector );
		}
		tempVector.multiplyScalar( distance );
		this._panOffset.add( tempVector );
		this.needsUpdate = true;
	}
	dolly( dollyDir ) {
		let dollyScale = ( dollyDir > 0 ) ? 1 - dollyDir : 1 / (1 + dollyDir);
		if ( this.object.isPerspectiveCamera ) {
			this._scale /= dollyScale;
		} else if ( this.object.isOrthographicCamera ) {
			this.object.zoom = Math.max( this.minZoom, Math.min( this.maxZoom, this.object.zoom * dollyScale ) );
		}
		this.object.updateProjectionMatrix();
		this.needsUpdate = true;
	}
	rotate( pointer ) {
		this._sphericalOffset.theta = -pointer.movement.x * this.rotateSpeed;
		this._sphericalOffset.phi = pointer.movement.y * this.rotateSpeed;
		this.needsUpdate = true;
	}
	// utility getters
	get polarAngle() {
		return this._spherical.phi;
	}
	get azimuthalAngle() {
		return this._spherical.theta;
	}
}

export { OrbitControls };
