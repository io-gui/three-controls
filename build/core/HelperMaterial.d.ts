import { Color, ShaderMaterial, Side } from 'three';
export declare const colors: {
    white: number[];
    whiteTransparent: number[];
    lightGray: number[];
    gray: number[];
    darkGray: number[];
    red: number[];
    green: number[];
    blue: number[];
    cyan: number[];
    magenta: number[];
    yellow: number[];
};
export declare class HelperMaterial extends ShaderMaterial {
    depthTest: boolean;
    depthWrite: boolean;
    transparent: boolean;
    side: Side;
    fog: boolean;
    toneMapped: boolean;
    linewidth: number;
    color: Color;
    opacity: number;
    highlight: number;
    dithering: boolean;
    constructor(props?: {
        color: Color;
        opacity: number;
        depthBias: number;
        highlight: number;
    });
    changed(): void;
}
//# sourceMappingURL=HelperMaterial.d.ts.map