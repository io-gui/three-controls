import { Object3D, PerspectiveCamera, OrthographicCamera } from 'three';
import { PointerTracker } from './core/Pointers';
import { ControlsInteractive } from './core/ControlsInteractive';

export declare class DragControls extends ControlsInteractive {

	objects: Object3D[];
	transformGroup: boolean;
	constructor( objects: Object3D[], camera: PerspectiveCamera | OrthographicCamera, domElement: HTMLElement );
	onTrackedPointerHover( pointer: PointerTracker ): void;
	onTrackedPointerDown( pointer: PointerTracker ): void;
	onTrackedPointerMove( pointer: PointerTracker ): void;
	onTrackedPointerUp( pointer: PointerTracker, pointers: PointerTracker[] ): void;
	getObjects(): Object3D[];
	activate(): void;
	deactivate(): void;

}
