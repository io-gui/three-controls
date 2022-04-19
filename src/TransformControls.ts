import { Object3D, Quaternion, Vector3, Matrix4, Intersection, OrthographicCamera } from 'three';

import { PointerTracker } from './core/Pointers.js';
import { AnyCameraType, UNIT } from './core/ControlsBase.js';

import { ControlsInteractive } from './core/ControlsInteractive.js';
import { TransformHelper } from './TransformHelper.js';

function getFirstIntersection(intersections: Intersection[], includeInvisible: boolean): Intersection | null {
  for (let i = 0; i < intersections.length; i ++) {
    if (intersections[i].object.visible || includeInvisible) {
      return intersections[i];
    }
  }
  return null;
}

// TODO: fix inverted scale rotation axis

class TransformControls extends ControlsInteractive {
  static readonly isTransformControls = true;
  static readonly type = 'TransformControls';

  // TransformHelper API

  size = 1;
  space: 'world' | 'local' = 'local';
  showX = true;
  showY = true;
  showZ = true;
  showE = true;
  showTranslate = true;
  showRotate = true;
  showScale = true;
  showOffset = true;
  dithering = false;

  // TransformControls API

  object?: Object3D;

  dragging = false;
  active = false;
  activeMode: 'translate' | 'rotate' | 'scale' | '' = '';
  activeAxis: 'X' | 'Y' | 'Z' | 'XY' | 'YZ' | 'XZ' | 'XYZ' | 'XYZE' | 'XYZX' | 'XYZY' | 'XYZZ' | 'E' | '' = '';
  translationSnap = 0;
  rotationSnap = 0;
  scaleSnap = 0;
  minGrazingAngle = 30;

  private readonly _pointStart = new Vector3();
  private readonly _pointStartNorm = new Vector3();
  private readonly _point = new Vector3();
  private readonly _pointNorm = new Vector3();
  private readonly _pointOffset = new Vector3();

  private readonly _worldPositionStart = new Vector3();
  private readonly _worldQuaternionStart = new Quaternion();
  private readonly _worldScaleStart = new Vector3();

  private readonly _worldMatrix = new Matrix4();
  private readonly _worldPosition = new Vector3();
  private readonly _worldQuaternion = new Quaternion();
  private readonly _worldQuaternionInv = new Quaternion();
  private readonly _worldScale = new Vector3();

  private readonly _matrixStart = new Matrix4();
  private readonly _positionStart = new Vector3();
  private readonly _quaternionStart = new Quaternion();
  private readonly _quaternionStartInv = new Quaternion();
  private readonly _scaleStart = new Vector3();

  private readonly _matrix = new Matrix4();
  private readonly _position = new Vector3();
  private readonly _quaternion = new Quaternion();
  private readonly _scale = new Vector3();

  private readonly _rotationAxis = new Vector3();

  private readonly _parentWorldPosition = new Vector3();
  private readonly _parentWorldQuaternion = new Quaternion();
  private readonly _parentWorldQuaternionInv = new Quaternion();
  private readonly _parentWorldScale = new Vector3();

  private readonly _tempVector1 = new Vector3();
  private readonly _tempVector2 = new Vector3();
  private readonly _tempQuaternion = new Quaternion();

  private readonly _dirX = new Vector3(1, 0, 0);
  private readonly _dirY = new Vector3(0, 1, 0);
  private readonly _dirZ = new Vector3(0, 0, 1);
  private readonly _normalVector = new Vector3();
  private readonly _identityQuaternion = Object.freeze(new Quaternion());

  private readonly _viewportCameraPosition = new Vector3();
  private readonly _viewportCameraQuaternion = new Quaternion();
  private readonly _viewportCameraScale = new Vector3();
  private readonly _viewportEye = new Vector3();

  protected readonly _cameraHelpers: Map<AnyCameraType, TransformHelper> = new Map();

  constructor(camera: AnyCameraType, domElement: HTMLElement) {
    super(camera, domElement);

    // Define properties with getters/setter
    // Setting the defined property will automatically trigger change event

    this.observeProperty('object');
    this.observeProperty('activeAxis');
    this.observeProperty('activeMode');
    this.observeProperty('space',);
    this.observeProperty('size');
    this.observeProperty('active');
    this.observeProperty('dragging');
    this.observeProperty('showX');
    this.observeProperty('showY');
    this.observeProperty('showZ');
    this.observeProperty('showE');
    this.observeProperty('showTranslate');
    this.observeProperty('showRotate');
    this.observeProperty('showScale');
    this.observeProperty('showOffset');
    this.observeProperty('dithering');

    // Deprecation warnings
    Object.defineProperty(this, 'mode', {
      set: () => {
        console.warn('THREE.TransformControls: "mode" has been deprecated. Use showTranslate, showScale and showRotate.');
      }
   });
    Object.defineProperty(this, 'camera', {
      get() {
        return camera;
      },
      set(newCamera: AnyCameraType) {
        const oldCamera = camera;
        camera = newCamera;
        newCamera !== oldCamera && this.cameraChanged(newCamera);
      }
   });
    this.cameraChanged(camera);
  }
  cameraChanged(newCamera: AnyCameraType) {
    if (this.children.length) this.remove(this.children[0]);
    this.add(this.getHelper(newCamera));
  }
  getHelper(camera: AnyCameraType) {
    // TODO: set helper camera and domElement automatically before onBeforeRender.
    const helper = this._cameraHelpers.get(camera) || new TransformHelper(camera, this.domElement);
    this._cameraHelpers.set(camera, helper);
    return helper;
  }
  dispose() {
    super.dispose();
    this._cameraHelpers.forEach(helper => {
      helper.dispose();
   });
    this._cameraHelpers.clear();
  }
  decomposeViewportCamera(camera: AnyCameraType) {
    camera.matrixWorld.decompose(this._viewportCameraPosition, this._viewportCameraQuaternion, this._viewportCameraScale);
    if (camera instanceof OrthographicCamera) {
      this._viewportEye.set(0, 0, 1).applyQuaternion(this._viewportCameraQuaternion);
    } else {
      this._viewportEye.copy(this._viewportCameraPosition).sub(this._worldPosition).normalize();
    }
    return this._viewportEye;
  }
  decomposeMatrices() {
    super.decomposeMatrices();
    if (this.object) {
      this.object.updateMatrixWorld();
      if (this.object.parent === null) {
        console.error('TransformControls: The attached 3D object must be a part of the scene graph.');
      } else {
        this.object.parent.matrixWorld.decompose(this._parentWorldPosition, this._parentWorldQuaternion, this._parentWorldScale);
        this._parentWorldQuaternionInv.copy(this._parentWorldQuaternion).invert();
      }
      this._matrix.copy(this.object.matrix);
      this._matrix.decompose(this._position, this._quaternion, this._scale);

      this._worldMatrix.copy(this.object.matrixWorld);
      this._worldMatrix.decompose(this._worldPosition, this._worldQuaternion, this._worldScale);
      this._worldQuaternionInv.copy(this._worldQuaternion).invert();
    }

    // This assumes TransformControls instance is in world frame.
    this.position.copy(this._worldPosition);
    this.quaternion.copy(this.space === 'local' ? this._worldQuaternion : this._identityQuaternion);
  }
  changed() {
    this._cameraHelpers.forEach(helper => {
      helper.space = this.space;
      helper.showX = this.showX;
      helper.showY = this.showY;
      helper.showZ = this.showZ;
      helper.showE = this.showE;
      helper.showTranslate = this.showTranslate;
      helper.showRotate = this.showRotate;
      helper.showScale = this.showScale;
      helper.showOffset = this.showOffset;
      helper.dithering = this.dithering;
      helper.enabled = this.enabled;
      helper.activeMode = this.activeMode;
      helper.activeAxis = this.activeAxis;
      helper.size = this.size;
   });
  }
  getPlaneNormal(cameraQuaternion: Quaternion): Vector3 {
    this._dirX.set(1, 0, 0).applyQuaternion(this.space === 'local' ? this._worldQuaternion : this._identityQuaternion);
    this._dirY.set(0, 1, 0).applyQuaternion(this.space === 'local' ? this._worldQuaternion : this._identityQuaternion);
    this._dirZ.set(0, 0, 1).applyQuaternion(this.space === 'local' ? this._worldQuaternion : this._identityQuaternion);
    // Align the plane for current transform mode, axis and space.
    switch (this.activeMode) {
      case 'translate':
      case 'scale':
        switch (this.activeAxis) {
          case 'X':
            this._normalVector.set(0, 0, 1).applyQuaternion(cameraQuaternion).normalize().cross(this._dirX).cross(this._dirX);
            break;
          case 'Y':
            this._normalVector.set(0, 0, 1).applyQuaternion(cameraQuaternion).normalize().cross(this._dirY).cross(this._dirY);
            break;
            case 'Z':
            this._normalVector.set(0, 0, 1).applyQuaternion(cameraQuaternion).normalize().cross(this._dirZ).cross(this._dirZ);
            break;
          case 'XY':
            this._normalVector.copy(this._dirZ);
            break;
          case 'YZ':
            this._normalVector.copy(this._dirX);
            break;
          case 'XZ':
            this._normalVector.copy(this._dirY);
            break;
          case 'XYZ':
          case 'XYZX':
          case 'XYZY':
          case 'XYZZ':
          case 'E':
            this._normalVector.set(0, 0, 1).applyQuaternion(cameraQuaternion).normalize();
            break;
        }
        break;
      case 'rotate':
      default:
        // special case for rotate
        this._normalVector.set(0, 0, 1).applyQuaternion(cameraQuaternion).normalize();
    }
    return this._normalVector;
  }

  onTrackedPointerHover(pointer: PointerTracker): void {
    if (!this.object || this.active === true) return;

    const camera = (this.xr && this.xr.isPresenting) ? this.camera : pointer.camera;

    const helper = this.getHelper(camera);
    const pickers = helper.children.filter((child: Object3D) => {
      return child.userData.tag === 'picker';
    });

    const intersect = getFirstIntersection(pointer.intersectObjects(pickers), false);
    if (intersect && !pointer.isSimulated) {
      this.activeMode = intersect.object.userData.type;
      this.activeAxis = intersect.object.userData.axis;
    } else {
      this.activeMode = '';
      this.activeAxis = '';
    }
  }

  onTrackedPointerDown(pointer: PointerTracker): void {
    // TODO: Unhack! This enables axis reset/interrupt when simulated pointer is driving gesture with inertia.
    this.activeAxis = '';
    // TODO: consider triggering hover from Controls.js
    // Simulates hover before down on touchscreen
    this.onTrackedPointerHover(pointer);
    // TODO: Unhack! This enables axis reset/interrupt when simulated pointer is driving gesture with inertia.
    if (this.activeAxis === '') {
      this.active = false;
      this.dragging = false;
    }

    if (!this.object || this.dragging === true || pointer.button !== 0) return;

    if (this.activeAxis !== '') {

      let space = this.space;
      if (this.activeMode === 'scale') {
        space = 'local';
      } else if (this.activeAxis === 'E' || this.activeAxis === 'XYZE' || this.activeAxis === 'XYZ') {
        space = 'world';
      }
      if (space === 'local' && this.activeMode === 'rotate') {
        const snap = this.rotationSnap;
        if (this.activeAxis === 'X' && snap) this.object.rotation.x = Math.round(this.object.rotation.x / snap) * snap
        if (this.activeAxis === 'Y' && snap) this.object.rotation.y = Math.round(this.object.rotation.y / snap) * snap
        if (this.activeAxis === 'Z' && snap) this.object.rotation.z = Math.round(this.object.rotation.z / snap) * snap;
      }
      this.object.updateMatrixWorld();
      if (this.object.parent) this.object.parent.updateMatrixWorld();

      this._matrixStart.copy(this.object.matrix);
      this._matrixStart.decompose(this._positionStart, this._quaternionStart, this._scaleStart);
      this._quaternionStartInv.copy(this._quaternionStart).invert();

      this._matrix.copy(this.object.matrix);
      this._matrix.decompose(this._position, this._quaternion, this._scale);

      this.object.matrixWorld.decompose(this._worldPositionStart, this._worldQuaternionStart, this._worldScaleStart);

      this._rotationAxis.set(0, 0, 0);

      this._cameraHelpers.forEach(helper => {
        helper.positionOffset.set(0, 0, 0);
        helper.quaternionOffset.identity();
        helper.scaleOffset.set(0, 0, 0);
     });

      this.dispatchEvent({
        type: 'start',
        object: this.object,
        matrixStart: this._matrixStart,
        positionStart: this._positionStart,
        quaternionStart: this._quaternionStart,
        scaleStart: this._scaleStart,
        matrix: this._matrix,
        position: this._position,
        quaternion: this._quaternion,
        scale: this._scale,
        axis: this.activeAxis,
        mode: this.activeMode,
     });

      this.dragging = true;
      this.active = true;
    }
  }

  onTrackedPointerMove(pointer: PointerTracker): void {
    const axis = this.activeAxis;
    const mode = this.activeMode;
    const object = this.object;
    const camera = (this.xr && this.xr.isPresenting) ? this.camera : pointer.camera;

    this.decomposeViewportCamera(camera);

    let space = this.space;
    if (mode === 'scale') {
      space = 'local';
    } else if (axis === 'E' || axis === 'XYZE' || axis === 'XYZ') {
      space = 'world';
    }
    if (pointer.isSimulated) this.dragging = false;
    if (!object || axis === '' || this.active === false || pointer.button !== 0) return;
    this._plane.setFromNormalAndCoplanarPoint(this.getPlaneNormal(this._viewportCameraQuaternion), this._worldPositionStart);
    const intersection = pointer.projectOnPlane(this._plane, this.minGrazingAngle);

    if (!intersection) return; // TODO: handle intersection miss

    this._pointStart.copy(intersection.start).sub(this._worldPositionStart);
    this._point.copy(intersection.current).sub(this._worldPositionStart);
    this._pointStartNorm.copy(this._pointStart).normalize();
    this._pointNorm.copy(this._point).normalize();
    this._pointOffset.copy(this._point).sub(this._pointStart);

    if (mode === 'translate') {
      // Apply translate
      this._tempVector2.copy(this._pointOffset);
      if (space === 'local') {
        this._tempVector2.applyQuaternion(this._quaternionStartInv);
      }

      if (axis.indexOf('X') === - 1) this._tempVector2.x = 0
      if (axis.indexOf('Y') === - 1) this._tempVector2.y = 0
      if (axis.indexOf('Z') === - 1) this._tempVector2.z = 0;

      if (space === 'local') {
        this._tempVector2.applyQuaternion(this._quaternionStart).divide(this._parentWorldScale);
      } else {
        this._tempVector2.applyQuaternion(this._parentWorldQuaternionInv).divide(this._parentWorldScale);
      }
      object.position.copy(this._tempVector2).add(this._positionStart);
      // Apply translation snap
      if (this.translationSnap) {
        if (space === 'local') {
          object.position.applyQuaternion(this._tempQuaternion.copy(this._quaternionStart).invert());
          if (axis.search('X') !== - 1) {
            object.position.x = Math.round(object.position.x / this.translationSnap) * this.translationSnap;
          }
          if (axis.search('Y') !== - 1) {
            object.position.y = Math.round(object.position.y / this.translationSnap) * this.translationSnap;
          }
          if (axis.search('Z') !== - 1) {
            object.position.z = Math.round(object.position.z / this.translationSnap) * this.translationSnap;
          }
          object.position.applyQuaternion(this._quaternionStart);
        }
        if (space === 'world') {
          if (object.parent) {
            object.position.add(this._parentWorldPosition);
          }
          if (axis.search('X') !== - 1) {
            object.position.x = Math.round(object.position.x / this.translationSnap) * this.translationSnap;
          }
          if (axis.search('Y') !== - 1) {
            object.position.y = Math.round(object.position.y / this.translationSnap) * this.translationSnap;
          }
          if (axis.search('Z') !== - 1) {
            object.position.z = Math.round(object.position.z / this.translationSnap) * this.translationSnap;
          }
          if (object.parent) {
            object.position.sub(this._parentWorldPosition);
          }
        }
      }
    } else if (mode === 'scale') {
      if (axis.search('XYZ') !== - 1) {
        let d = this._point.length() / this._pointStart.length();
        if (this._point.dot(this._pointStart) < 0) d *= - 1;
        this._tempVector2.set(d, d, d);
      } else {
        this._tempVector1.copy(this._pointStart);
        this._tempVector2.copy(this._point);
        this._tempVector1.applyQuaternion(this._worldQuaternionInv);
        this._tempVector2.applyQuaternion(this._worldQuaternionInv);
        this._tempVector2.divide(this._tempVector1);
        if (axis.search('X') === - 1) {
          this._tempVector2.x = 1;
        }
        if (axis.search('Y') === - 1) {
          this._tempVector2.y = 1;
        }
        if (axis.search('Z') === - 1) {
          this._tempVector2.z = 1;
        }
      }
      // Apply scale
      object.scale.copy(this._scaleStart).multiply(this._tempVector2);
      if (this.scaleSnap) {
        if (axis.search('X') !== - 1) {
          object.scale.x = Math.round(object.scale.x / this.scaleSnap) * this.scaleSnap || this.scaleSnap;
        }
        if (axis.search('Y') !== - 1) {
          object.scale.y = Math.round(object.scale.y / this.scaleSnap) * this.scaleSnap || this.scaleSnap;
        }
        if (axis.search('Z') !== - 1) {
          object.scale.z = Math.round(object.scale.z / this.scaleSnap) * this.scaleSnap || this.scaleSnap;
        }
      }
    } else if (mode === 'rotate') {

      let ROTATION_SPEED = (pointer.domElement.clientHeight / 720);
      if (this.xr && this.xr.isPresenting) ROTATION_SPEED *= 5;
      let angle = 0;

      if (axis === 'E') {
        this._rotationAxis.copy(this._viewportEye);
        angle = this._point.angleTo(this._pointStart);
        angle *= (this._pointNorm.cross(this._pointStartNorm).dot(this._viewportEye) < 0 ? 1 : - 1);
      } else if (axis === 'XYZE') {

        this._tempVector2.copy(this._pointStart).add(this._pointOffset);
        const helper = this.getHelper(pointer.camera);
        let lerp = this._tempVector2.length() / helper.sizeAttenuation;
        lerp = Math.min(1, Math.pow(2 * Math.max(0, lerp - 0.03), 2));

        this._tempVector2.cross(this._viewportEye).normalize();
        this._tempVector1.copy(this._tempVector2).multiplyScalar(-1);

        if (this._rotationAxis.length() === 0) lerp = 1;

        const flip = this._rotationAxis.dot(this._tempVector2) > this._rotationAxis.dot(this._tempVector1);

        this._rotationAxis.lerp(flip ? this._tempVector2 : this._tempVector1, lerp).normalize();
        angle = this._pointOffset.dot(this._tempVector2.copy(this._rotationAxis).cross(this._viewportEye)) * ROTATION_SPEED;

      } else if (axis === 'X' || axis === 'Y' || axis === 'Z') {
        this._rotationAxis.copy(UNIT[axis]);
        this._tempVector1.copy(UNIT[axis]);
        if (space === 'local') {
          this._tempVector1.applyQuaternion(this._worldQuaternion);
        }
        angle = this._pointOffset.dot(this._tempVector1.cross(this._viewportEye).normalize()) * ROTATION_SPEED;
      }
      // Apply rotation snap
      if (this.rotationSnap) angle = Math.round(angle / this.rotationSnap) * this.rotationSnap;
      // Apply rotat
      if (space === 'local' && axis !== 'E' && axis !== 'XYZE') {
        object.quaternion.copy(this._quaternionStart);
        object.quaternion.multiply(this._tempQuaternion.setFromAxisAngle(this._rotationAxis, angle)).normalize();
      } else {
        this._rotationAxis.applyQuaternion(this._parentWorldQuaternionInv);
        object.quaternion.copy(this._tempQuaternion.setFromAxisAngle(this._rotationAxis, angle));
        object.quaternion.multiply(this._quaternionStart).normalize();
      }
    }
    this.updateMatrixWorld();

    this._matrix.copy(object.matrix);
    this._matrix.decompose(this._position, this._quaternion, this._scale);

    this._tempQuaternion.copy(this._quaternionStart).invert();
    this._cameraHelpers.forEach(helper => {
      helper.positionOffset.copy(this._position).sub(this._positionStart);
      helper.quaternionOffset.copy(this._quaternion).multiply(this._tempQuaternion).normalize();
      helper.scaleOffset.copy(this._scale).divide(this._scaleStart);
   });

    this.dispatchEvent({
      type: 'transform',
      object: this.object,
      matrixStart: this._matrixStart,
      positionStart: this._positionStart,
      quaternionStart: this._quaternionStart,
      scaleStart: this._scaleStart,
      matrix: this._matrix,
      position: this._position,
      quaternion: this._quaternion,
      scale: this._scale,
      axis: this.activeAxis,
      mode: this.activeMode,
   });

    this.dispatchEvent({ type: 'change'})

  }

  onTrackedPointerUp(pointer: PointerTracker): void {
    if (pointer.button > 0 || !this.object) return;
    if (this.active) {

      this._matrix.copy(this.object.matrix);
      this._matrix.decompose(this._position, this._quaternion, this._scale);

      this._cameraHelpers.forEach(helper => {
        helper.positionOffset.set(0, 0, 0);
        helper.quaternionOffset.identity();
        helper.scaleOffset.set(0, 0, 0);
     });

      this.dispatchEvent({
        type: 'end',
        object: this.object,
        matrixStart: this._matrixStart,
        positionStart: this._positionStart,
        quaternionStart: this._quaternionStart,
        scaleStart: this._scaleStart,
        matrix: this._matrix,
        position: this._position,
        quaternion: this._quaternion,
        scale: this._scale,
        axis: this.activeAxis,
        mode: this.activeMode,
     });
    }
    this.active = false;
    this.dragging = false;
    this.activeAxis = '';
    this.activeMode = '';
  }
  // Set current object
  attach(object: Object3D): this {
    this.object = object;
    this.visible = true;
    this.updateMatrixWorld();
    return this;
  }
  // Detatch from object
  detach(): this {
    this.object = undefined;
    this.visible = false;
    this.activeAxis = '';
    return this;
  }
  // TODO: deprecate
  getMode() {
    console.warn('THREE.TransformControls: getMode function has been deprecated. Use showTranslate, showScale and showRotate.');
  }
  setMode(mode: 'translate' | 'rotate' | 'scale') {
    console.warn('THREE.TransformControls: setMode function has been deprecated. Use showTranslate, showScale and showRotate.');
    this.showTranslate = mode === 'translate';
    this.showRotate = mode === 'rotate';
    this.showScale = mode === 'scale';
  }
  setTranslationSnap(translationSnap: number) {
    console.warn('THREE.TransformControls: setTranslationSnap function has been deprecated.');
    this.translationSnap = translationSnap;
  }
  setRotationSnap(rotationSnap: number) {
    console.warn('THREE.TransformControls: setRotationSnap function has been deprecated.');
    this.rotationSnap = rotationSnap;
  }
  setScaleSnap(scaleSnap: number) {
    console.warn('THREE.TransformControls: setScaleSnap function has been deprecated.');
    this.scaleSnap = scaleSnap;
  }
  setSize(size: number) {
    console.warn('THREE.TransformControls: setSize function has been deprecated.');
    this.size = size;
  }
  setSpace(space: 'world' | 'local') {
    console.warn('THREE.TransformControls: setSpace function has been deprecated.');
    this.space = space;
  }
  update() {
    console.warn('THREE.TransformControls: update function has been deprecated.');
  }
  addEventListener(type: string, listener: (event: Event) => void): void {
    if (type === 'mouseDown') {
      console.warn(`You are using deprecated "${type}" event. Use "start" event instead.`);
      super.addEventListener('start', listener);
      return;
    }
    if (type === 'mouseUp') {
      console.warn(`You are using deprecated "${type}" event. Use "end" event instead.`);
      super.addEventListener('end', listener);
      return;
    }
    if (type === 'objectChange') {
      console.warn(`You are using deprecated "${type}" event. Use "changed" event instead.`);
      super.addEventListener('changed', listener);
      return;
    }
    super.addEventListener(type, listener);
  }
}

export { TransformControls };
