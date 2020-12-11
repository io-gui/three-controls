import { Plane, Object3D, PerspectiveCamera, OrthographicCamera } from 'three';
import { Controls } from './Controls';

/**
 * `ObjectControls`: Generic superclass for interactive object controls.
 */
export class ObjectControls extends Controls {
  protected readonly _plane = new Plane();
  constructor( camera: PerspectiveCamera | OrthographicCamera, domElement: HTMLElement ) {
    super( camera, domElement );
  }
}