import { Object3D, Intersection, Event as ThreeEvent } from "../../three";
import { PerspectiveCamera, OrthographicCamera } from "../../three";
import { Controls, Pointer } from "./Controls.js";

let _intersections: Intersection[];
const _hoveredObjects: Record<string, Object3D> = {};
const _selectedObjects: Record<string, Object3D> = {};

export class DragControls extends Controls {
  // Public API
  objects: Object3D[];
  transformGroup = false;

  constructor(objects: Object3D[], camera:  PerspectiveCamera | OrthographicCamera, domElement: HTMLElement) {
    super(camera, domElement);
    this.objects = objects;

    const _onEnabledChanged = (event: ThreeEvent) => {
      if (!event.value) this.domElement.style.cursor = '';
    }

    this.addEventListener('enabled-changed', _onEnabledChanged);
    // Deprecation warnings
    this.getObjects = function() {
      console.warn('THREE.DragControls: getObjects() is deprecated. Use `objects` property instead.');
      return this.objects;
    }
    this.activate = function() {
      this.enabled = true;
      console.warn('THREE.DragControls: activate() is deprecated. Set `enabled` property to `false` instead.');
    }
    this.deactivate = function() {
      this.enabled = false;
      console.warn('THREE.DragControls: activate() is deprecated. Set `enabled` property to `true` instead.');
    }
  }

  onTrackedPointerHover(pointer: Pointer): void {
    const id = String(pointer.pointerId);
    _intersections = pointer.intersectObjects(this.objects);
    const _hoveredObject = _hoveredObjects[id];
    if (_intersections.length > 0) {
      const object = _intersections[0].object;
      if (_hoveredObject !== object) {
        if (_hoveredObject) this.dispatchEvent({type: 'hoveroff', object: _hoveredObject});
        this.domElement.style.cursor = 'pointer';
        this.dispatchEvent({type: 'hoveron', object: object});
        _hoveredObjects[id] = object;
      }
    } else if (_hoveredObject) {
        this.dispatchEvent({type: 'hoveroff', object: _hoveredObject});
        this.domElement.style.cursor = 'auto';
        delete _hoveredObjects[id];
    }
  }

  onTrackedPointerDown(pointer: Pointer): void {
    const id = String(pointer.pointerId);
    this.domElement.style.cursor = 'move';
    _intersections = pointer.intersectObjects(this.objects);
    if (_intersections.length > 0) {
      const object = (this.transformGroup === true) ? this.objects[0] : _intersections[0].object;
      this.target.setFromMatrixPosition(object.matrixWorld)
      this.domElement.style.cursor = 'move';
      this.dispatchEvent({type: 'dragstart', object: object});
      _selectedObjects[id] = object
    }
  }

  onTrackedPointerMove(pointer: Pointer): void {
    const id = String(pointer.pointerId);
    const _selectedObject = _selectedObjects[id];
    if (_selectedObject) {
      _selectedObject.position.add(pointer.planeE.movement);
      this.dispatchEvent({type: 'drag', object: _selectedObject});
    }
  }

  onTrackedPointerUp(pointer: Pointer, pointers: Pointer[]): void {
    const id = String(pointer.pointerId);
    for (const idx in _selectedObjects) {
      if (id === idx) {
        this.dispatchEvent({type: 'dragend', object: _selectedObjects[idx]});
        delete _selectedObjects[idx];
      }
    }
    for (const idx in _hoveredObjects) {
      if (id === idx) {
        this.dispatchEvent({type: 'hoveroff', object: _hoveredObjects[idx]});
        delete _hoveredObjects[idx];
      }
    }
    if (pointers.length === 0) this.domElement.style.cursor = Object.keys(_hoveredObjects).length ? 'pointer' : 'auto';
  }
}
