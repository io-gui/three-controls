import { Vector3, Color, BufferGeometry, ShaderMaterial } from 'three';
import { HelperGeometrySpec } from './Helper.js';

export declare const colors: {
	white: number[];
	whiteTransparent: number[];
	gray: number[];
	red: number[];
	green: number[];
	blue: number[];
	cyan: number[];
	magenta: number[];
	yellow: number[];
};

export declare class HelperGeometry extends BufferGeometry {

	constructor( chunks: [BufferGeometry, HelperGeometrySpec][] );

}

export declare class HelperMaterial extends ShaderMaterial {

	depthTest: boolean;
	depthWrite: boolean;
	transparent: boolean;
	side: import( "three" ).Side;
	color: Color;
	opacity: number;
	depthBias: number;
	highlight: number;
	resolution: Vector3;
	constructor( props?: {
		color: Color;
		opacity: number;
		depthBias: number;
		highlight: number;
	} );
	changed(): void;

}
