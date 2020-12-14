import { Controls } from './Controls';
import { AnyCameraType } from './Base';


/**
 * `CameraControls`: Generic superclass for interactive camera controls.
 */
export declare class CameraControls extends Controls {

	frustumCulled: boolean;
	constructor( camera: AnyCameraType, domElement: HTMLElement );
	cameraChanged( newCamera: AnyCameraType, oldCamera?: AnyCameraType ): void;
	saveCameraState(): void;
	resetCameraState(): void;
	saveState(): void;
	reset(): void;

}
