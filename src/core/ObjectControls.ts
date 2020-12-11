import { Plane, Vector3, PerspectiveCamera, OrthographicCamera } from 'three';
import { Controls } from './Controls';

/**
 * `ObjectControls`: Generic superclass for interactive object controls.
 */
export class ObjectControls extends Controls {
  eye = new Vector3();
  protected readonly _plane = new Plane();
  constructor( camera: PerspectiveCamera | OrthographicCamera, domElement: HTMLElement ) {
    super( camera, domElement );
  }
}