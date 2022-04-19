import { ControlsInteractive } from './ControlsInteractive.js';
import { AnyCameraType } from './ControlsBase.js';
/**
 * `ControlsCamera`: Generic superclass for interactive camera controls.
 */
export declare class ControlsCamera extends ControlsInteractive {
    frustumCulled: boolean;
    constructor(camera: AnyCameraType, domElement: HTMLElement);
    cameraChanged(newCamera: AnyCameraType, oldCamera?: AnyCameraType): void;
    saveCameraState(): void;
    resetCameraState(): void;
    saveState(): void;
    reset(): void;
}
//# sourceMappingURL=ControlsCamera.d.ts.map