import { MOUSE, TOUCH } from "../../three/src/Three";
import { OrbitControls } from "./OrbitControls.js";

export declare class MapControls extends OrbitControls {

	screenSpacePanning: boolean;
	mouseButtons: {
		LEFT: MOUSE;
		MIDDLE: MOUSE;
		RIGHT: MOUSE;
	};
	touches: {
		ONE: TOUCH;
		TWO: TOUCH;
	};

}

//# sourceMappingURL=MapControls.d.ts.map
