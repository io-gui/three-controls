import { WebGLRenderer } from "three";
import { IoElement } from "@iogui/iogui";
export declare class ThreeRenderer extends IoElement {
    static get Style(): string;
    _ctx: CanvasRenderingContext2D;
    static get Properties(): {
        ishost: {
            type: BooleanConstructor;
        };
        size: number[];
        tabindex: number;
        clearColor: number;
        clearAlpha: number;
    };
    static get Listeners(): {
        dragstart: string;
    };
    get renderer(): WebGLRenderer;
    constructor(properties?: Record<string, any>);
    setHost(): void;
    onResized(): void;
}
