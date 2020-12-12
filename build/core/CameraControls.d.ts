import { Controls } from './Controls';
import { AnyCameraType, Viewport } from './Base';
/**
 * `CameraControls`: Generic superclass for interactive camera controls.
 */
export declare class CameraControls extends Controls {
    viewport: Viewport;
    frustumCulled: boolean;
    constructor(camera: AnyCameraType, domElement: HTMLElement);
    viewportChanged(newViewport: Viewport, oldViewport: Viewport): void;
    saveCameraState(): void;
    resetCameraState(): void;
    saveState(): void;
    reset(): void;
}
