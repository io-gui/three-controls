import { Vector3, Object3D, Intersection, PerspectiveCamera, OrthographicCamera } from 'three';
import { PointerTracker } from './core/Pointers.js';
import { ControlsInteractive } from './core/ControlsInteractive.js';
import { ControlsEvent } from './core/ControlsBase.js';

let _intersections: Intersection[];
const _hoveredObjects: Record<string, Object3D> = {};
const _selectedObjects: Record<string, Object3D> = {};
const _eye = new Vector3();
const _target = new Vector3();

export class DragControls extends ControlsInteractive {
  // Public API
  objects: Object3D[];
  transformGroup = false;

  constructor(objects: Object3D[], camera: PerspectiveCamera | OrthographicCamera, domElement: HTMLElement) {
    super(camera, domElement);
    this.objects = objects;

    this.addEventListener('enabled-changed', (event: ControlsEvent) => {
      if (!event.value) this.domElement.style.cursor = '';
   });
  }

  onTrackedPointerHover(pointer: PointerTracker): void {
    const id = String(pointer.pointerId);
    _intersections = pointer.intersectObjects(this.objects);
    const _hoveredObject = _hoveredObjects[id];
    if (_intersections.length > 0) {
      const object = _intersections[0].object;
      if (_hoveredObject !== object) {
        if (_hoveredObject) this.dispatchEvent({ type: 'hoveroff', object: _hoveredObject});
        this.domElement.style.cursor = 'pointer';
        this.dispatchEvent({ type: 'hoveron', object: object});
        _hoveredObjects[id] = object;
      }
    } else if (_hoveredObject) {
      this.dispatchEvent({ type: 'hoveroff', object: _hoveredObject});
      this.domElement.style.cursor = 'auto';
      delete _hoveredObjects[id];
    }
  }

  onTrackedPointerDown(pointer: PointerTracker): void {
    const id = String(pointer.pointerId);
    this.domElement.style.cursor = 'move';
    _intersections = pointer.intersectObjects(this.objects);
    if (_intersections.length > 0) {
      const object = (this.transformGroup === true) ? this.objects[0] : _intersections[0].object;
      _target.setFromMatrixPosition(object.matrixWorld);
      this.domElement.style.cursor = 'move';
      this.dispatchEvent({ type: 'dragstart', object: object});
      _selectedObjects[id] = object
    }
  }

  onTrackedPointerMove(pointer: PointerTracker): void {
    const id = String(pointer.pointerId);
    const _selectedObject = _selectedObjects[id];
    if (_selectedObject) {
      _eye.set(0, 0, 1).applyQuaternion(this.camera.quaternion).normalize();
      this._plane.setFromNormalAndCoplanarPoint(_eye, _target);
      _selectedObject.position.add(pointer.projectOnPlane(this._plane).movement);
      this.dispatchEvent({ type: 'drag', object: _selectedObject});
    }
  }

  onTrackedPointerUp(pointer: PointerTracker, pointers: PointerTracker[]): void {
    const id = String(pointer.pointerId);
    for (const idx in _selectedObjects) {
      if (id === idx) {
        this.dispatchEvent({ type: 'dragend', object: _selectedObjects[idx]});
        delete _selectedObjects[idx];
      }
    }
    for (const idx in _hoveredObjects) {
      if (id === idx) {
        this.dispatchEvent({ type: 'hoveroff', object: _hoveredObjects[idx]});
        delete _hoveredObjects[idx];
      }
    }
    if (pointers.length === 0) this.domElement.style.cursor = Object.keys(_hoveredObjects).length ? 'pointer' : 'auto';
  }

  // Deprecation warnings
  getObjects() {
    console.warn('THREE.DragControls: getObjects() is deprecated. Use `objects` property instead.');
    return this.objects;
  }
  activate() {
    this.enabled = true;
    console.warn('THREE.DragControls: activate() is deprecated. Set `enabled` property to `false` instead.');
  }
  deactivate() {
    this.enabled = false;
    console.warn('THREE.DragControls: activate() is deprecated. Set `enabled` property to `true` instead.');
  }
}
