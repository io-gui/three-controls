import { Quaternion, Mesh, Euler, Vector3, Vector4, Matrix4, LineSegments, OctahedronGeometry, TorusGeometry, SphereGeometry, BoxGeometry, PlaneGeometry, CylinderGeometry, BufferGeometry, Float32BufferAttribute } from 'three';
import { UNIT } from './core/ControlsBase.js';
import { ControlsHelper } from './core/ControlsHelper.js';
import { colors } from './core/HelperMaterial.js';

const CircleGeometry = function ( radius, arc ) {

	const geometry = new BufferGeometry();
	const vertices = [];

	for ( let i = 0; i <= 63 * arc; ++ i ) {

		vertices.push( 0, Math.cos( i / 32 * Math.PI ) * radius, Math.sin( i / 32 * Math.PI ) * radius );
		vertices.push( 0, Math.cos( ( i + 1 ) / 32 * Math.PI ) * radius, Math.sin( ( i + 1 ) / 32 * Math.PI ) * radius );

	}

	geometry.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
	return geometry;

};

const lerp = ( x, y, a ) => {

	return x * ( 1 - a ) + y * a;

};

const EPS = 0.001;
const H = 0.125;
const HH = H / 2;
const H2 = H * 2;
const H3 = H * 3;
const PICKER_DEBUG_ALPHA = 0.0;
const scaleHandleGeometry = new BoxGeometry( H, H, H );
const arrowGeometry = new CylinderGeometry( 0, HH, H2, 12, 1, false );
const lineGeometry = new BufferGeometry();
lineGeometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 1, 0, 0 ], 3 ) );
const squareLineGeometry = new BufferGeometry();
squareLineGeometry.setAttribute( 'position', new Float32BufferAttribute( [ - 1, - 1, 0, - 1, 1, 0, - 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, - 1, 0, 1, - 1, 0, - 1, - 1, 0 ], 3 ) );
const translateOffsetLineGeometry = new BufferGeometry();
translateOffsetLineGeometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1 ], 3 ) );
translateOffsetLineGeometry.setAttribute( 'color', new Float32BufferAttribute( [ ...colors.red, ...colors.red, ...colors.green, ...colors.green, ...colors.blue, ...colors.blue, ...colors.lightGray, ...colors.lightGray ], 3 ) );
const scaleOffsetLineGeometry = new BufferGeometry();
scaleOffsetLineGeometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1 ], 3 ) );
scaleOffsetLineGeometry.setAttribute( 'color', new Float32BufferAttribute( [ ...colors.white, ...colors.red, ...colors.red, ...colors.red, ...colors.red, ...colors.red, ...colors.white, ...colors.green, ...colors.green, ...colors.green, ...colors.green, ...colors.green, ...colors.white, ...colors.blue, ...colors.blue, ...colors.blue, ...colors.blue, ...colors.blue ], 3 ) );
const cornerLineGeometry = new BufferGeometry();
cornerLineGeometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 0, - 1, 0, 0, 0, 0, 1, 0, 0 ], 3 ) );

const translateHelperGeometrySpec = [
	[
		new Mesh( arrowGeometry ),
		{
			type: 'translate',
			axis: 'X',
			tag: 'fwd',
			color: new Vector4( ...colors.red, 1 ),
			position: new Vector3( 1 - H2, 0, 0 ),
			rotation: new Euler( 0, 0, - Math.PI / 2 ),
		}
	], [
		new Mesh( arrowGeometry ),
		{
			type: 'translate',
			axis: 'X',
			tag: 'bwd',
			color: new Vector4( ...colors.red, 1 ),
			position: new Vector3( 1 - H2, 0, 0 ),
			rotation: new Euler( 0, 0, Math.PI / 2 ),
		}
	], [
		new LineSegments( lineGeometry ),
		{
			type: 'translate',
			axis: 'X',
			color: new Vector4( ...colors.red, 1 ),
			position: new Vector3( HH, 0, 0 ),
			scale: new Vector3( 1 - H2 - H, 1 - H2 - H, 1 - H2 - H )
		}
	], [
		new Mesh( arrowGeometry ),
		{
			type: 'translate',
			axis: 'Y',
			tag: 'fwd',
			color: new Vector4( ...colors.green, 1 ),
			position: new Vector3( 0, 1 - H2, 0 ),
		}
	], [
		new Mesh( arrowGeometry ),
		{
			type: 'translate',
			axis: 'Y',
			tag: 'bwd',
			color: new Vector4( ...colors.green, 1 ),
			position: new Vector3( 0, 1 - H2, 0 ),
			rotation: new Euler( Math.PI, 0, 0 ),
		}
	], [
		new LineSegments( lineGeometry ),
		{
			type: 'translate',
			axis: 'Y',
			color: new Vector4( ...colors.green, 1 ),
			position: new Vector3( 0, HH, 0 ),
			rotation: new Euler( 0, 0, Math.PI / 2 ),
			scale: new Vector3( 1 - H2 - H, 1 - H2 - H, 1 - H2 - H )
		}
	], [
		new Mesh( arrowGeometry ),
		{
			type: 'translate',
			axis: 'Z',
			tag: 'fwd',
			color: new Vector4( ...colors.blue, 1 ),
			position: new Vector3( 0, 0, 1 - H2 ),
			rotation: new Euler( Math.PI / 2, 0, 0 ),
		}
	], [
		new Mesh( arrowGeometry ),
		{
			type: 'translate',
			axis: 'Z',
			tag: 'bwd',
			color: new Vector4( ...colors.blue, 1 ),
			position: new Vector3( 0, 0, 1 - H2 ),
			rotation: new Euler( - Math.PI / 2, 0, 0 ),
		}
	], [
		new LineSegments( lineGeometry ),
		{
			type: 'translate',
			axis: 'Z',
			color: new Vector4( ...colors.blue, 1 ),
			position: new Vector3( 0, 0, HH ),
			rotation: new Euler( 0, - Math.PI / 2, 0 ),
			scale: new Vector3( 1 - H2 - H, 1 - H2 - H, 1 - H2 - H )
		}
	], [
		new Mesh( new OctahedronGeometry( HH, 0 ) ),
		{
			type: 'translate',
			axis: 'XYZ',
			color: new Vector4( ...colors.lightGray, 0.5 ),
			position: new Vector3( 0, 0, 0 ),
			rotation: new Euler( 0, 0, 0 )
		}
	], [
		new Mesh( new PlaneGeometry( H2, H2 ) ),
		{
			type: 'translate',
			axis: 'XY',
			color: new Vector4( ...colors.yellow, 0.15 ),
			position: new Vector3( H, H, 0 )
		}
	], [
		new LineSegments( cornerLineGeometry ),
		{
			type: 'translate',
			axis: 'XY',
			color: new Vector4( ...colors.yellow, 1 ),
			position: new Vector3( H2, H2, 0 ),
			rotation: new Euler( 0, 0, - Math.PI / 2 ),
			scale: new Vector3( H, H, 1 )
		}
	], [
		new Mesh( new PlaneGeometry( H2, H2 ) ),
		{
			type: 'translate',
			axis: 'YZ',
			color: new Vector4( ...colors.cyan, 0.15 ),
			position: new Vector3( 0, H, H ),
			rotation: new Euler( 0, Math.PI / 2, 0 )
		}
	], [
		new LineSegments( cornerLineGeometry ),
		{
			type: 'translate',
			axis: 'YZ',
			color: new Vector4( ...colors.cyan, 1 ),
			position: new Vector3( 0, H2, H2 ),
			rotation: new Euler( 0, - Math.PI / 2, - Math.PI / 2 ),
			scale: new Vector3( H, H, 1 )
		}
	], [
		new Mesh( new PlaneGeometry( H2, H2 ) ),
		{
			type: 'translate',
			axis: 'XZ',
			color: new Vector4( ...colors.magenta, 0.15 ),
			position: new Vector3( H, 0, H ),
			rotation: new Euler( - Math.PI / 2, 0, 0 )
		}
	], [
		new LineSegments( cornerLineGeometry ),
		{
			type: 'translate',
			axis: 'XZ',
			color: new Vector4( ...colors.magenta, 1 ),
			position: new Vector3( H2, 0, H2 ),
			rotation: new Euler( Math.PI / 2, 0, - Math.PI / 2 ),
			scale: new Vector3( H, H, 1 )
		}
	],

	// Pickers
	[
		new Mesh( new CylinderGeometry( H2, 0, H2 * 2, 6, 1, false ) ),
		{
			type: 'translate',
			axis: 'X',
			tag: 'picker',
			color: new Vector4( ...colors.red, PICKER_DEBUG_ALPHA ),
			position: new Vector3( H * 5, 0, 0 ),
			rotation: new Euler( Math.PI / 4, 0, - Math.PI / 2 ),
		}
	], [
		new Mesh( new CylinderGeometry( H2, 0, H2 * 2, 6, 1, false ) ),
		{
			type: 'translate',
			axis: 'Y',
			tag: 'picker',
			color: new Vector4( ...colors.green, PICKER_DEBUG_ALPHA ),
			position: new Vector3( 0, H * 5, 0 ),
			rotation: new Euler( 0, Math.PI / 4, 0 ),
		}
	], [
		new Mesh( new CylinderGeometry( H2, 0, H2 * 2, 6, 1, false ) ),
		{
			type: 'translate',
			axis: 'Z',
			tag: 'picker',
			color: new Vector4( ...colors.blue, PICKER_DEBUG_ALPHA ),
			position: new Vector3( 0, 0, H * 5 ),
			rotation: new Euler( Math.PI / 2, Math.PI / 4, 0 ),
		}
	], [
		new Mesh( new OctahedronGeometry( H2, 0 ) ),
		{
			type: 'translate',
			axis: 'XYZ',
			tag: 'picker',
			color: new Vector4( ...colors.white, PICKER_DEBUG_ALPHA ),
		}
	], [
		new Mesh( new PlaneGeometry( H3, H3 ) ),
		{
			type: 'translate',
			axis: 'XY',
			tag: 'picker',
			color: new Vector4( ...colors.yellow, PICKER_DEBUG_ALPHA ),
			position: new Vector3( H * 1.5, H * 1.5, 0 ),
		}
	], [
		new Mesh( new PlaneGeometry( H3, H3 ) ),
		{
			type: 'translate',
			axis: 'YZ',
			tag: 'picker',
			color: new Vector4( ...colors.cyan, PICKER_DEBUG_ALPHA ),
			position: new Vector3( 0, H * 1.5, H * 1.5 ),
			rotation: new Euler( 0, Math.PI / 2, 0 ),
		}
	], [
		new Mesh( new PlaneGeometry( H3, H3 ) ),
		{
			type: 'translate',
			axis: 'XZ',
			tag: 'picker',
			color: new Vector4( ...colors.magenta, PICKER_DEBUG_ALPHA ),
			position: new Vector3( H * 1.5, 0, H * 1.5 ),
			rotation: new Euler( - Math.PI / 2, 0, 0 ),
		}
	],

	// Offset visualization
	[
		new LineSegments( translateOffsetLineGeometry ),
		{
			type: 'translate',
			axis: 'XYZ',
			tag: 'offset',
			color: new Vector4( ...colors.white, 1 ),
		}
	]
];

const rotateHelperGeometrySpec = [
	[
		new LineSegments( CircleGeometry( 1 - H, 0.5 ) ),
		{
			type: 'rotate',
			axis: 'X',
			color: new Vector4( ...colors.red, 1 ),
		}
	], [
		new Mesh( new OctahedronGeometry( H / 2, 2 ) ),
		{
			type: 'rotate',
			axis: 'X',
			color: new Vector4( ...colors.red, 1 ),
			position: new Vector3( 0, 0, 1 - H ),
		}
	], [
		new LineSegments( CircleGeometry( 1 - H, 0.5 ) ),
		{
			type: 'rotate',
			axis: 'Y',
			color: new Vector4( ...colors.green, 1 ),
			rotation: new Euler( 0, 0, - Math.PI / 2 )
		}
	], [
		new Mesh( new OctahedronGeometry( H / 2, 2 ) ),
		{
			type: 'rotate',
			axis: 'Y',
			color: new Vector4( ...colors.green, 1 ),
			position: new Vector3( 0, 0, 1 - H ),
		}
	], [
		new LineSegments( CircleGeometry( 1 - H, 0.5 ) ),
		{
			type: 'rotate',
			axis: 'Z',
			color: new Vector4( ...colors.blue, 1 ),
			rotation: new Euler( 0, Math.PI / 2, 0 )
		}
	], [
		new Mesh( new OctahedronGeometry( H / 2, 2 ) ),
		{
			type: 'rotate',
			axis: 'Z',
			color: new Vector4( ...colors.blue, 1 ),
			position: new Vector3( 1 - H, 0, 0 ),
		}
	], [
		new LineSegments( CircleGeometry( 1 + H * 3, 1 ) ),
		{
			type: 'rotate',
			axis: 'E',
			color: new Vector4( ...colors.yellow, 1 ),
			rotation: new Euler( 0, Math.PI / 2, 0 )
		}
	], [
		new LineSegments( CircleGeometry( 1 - H, 1 ) ),
		{
			type: 'rotate',
			axis: 'XYZE',
			color: new Vector4( ...colors.white, 0.5 ),
			rotation: new Euler( 0, Math.PI / 2, 0 )
		}
	],

	// Pickers
	[
		new Mesh( new TorusGeometry( 1 - HH, H, 4, 6, Math.PI ) ),
		{
			type: 'rotate',
			axis: 'X',
			tag: 'picker',
			color: new Vector4( ...colors.red, PICKER_DEBUG_ALPHA ),
			position: new Vector3( - HH, 0, 0 ),
			rotation: new Euler( 0, - Math.PI / 2, - Math.PI / 2 ),
			scale: new Vector3( 1, 1, H3 ),
		}
	], [
		new Mesh( new TorusGeometry( 1 - HH, H, 4, 6, Math.PI ) ),
		{
			type: 'rotate',
			axis: 'Y',
			tag: 'picker',
			color: new Vector4( ...colors.green, PICKER_DEBUG_ALPHA ),
			position: new Vector3( 0, - HH, 0 ),
			rotation: new Euler( Math.PI / 2, 0, 0 ),
			scale: new Vector3( 1, 1, H3 ),
		}
	], [
		new Mesh( new TorusGeometry( 1 - HH, H, 4, 6, Math.PI ) ),
		{
			type: 'rotate',
			axis: 'Z',
			tag: 'picker',
			color: new Vector4( ...colors.blue, PICKER_DEBUG_ALPHA ),
			position: new Vector3( 0, 0, - HH ),
			rotation: new Euler( 0, 0, - Math.PI / 2 ),
			scale: new Vector3( 1, 1, H3 ),
		}
	], [
		new Mesh( new TorusGeometry( 1 + H2 + H, H, 2, 12 ) ),
		{
			type: 'rotate',
			axis: 'E',
			tag: 'picker',
			color: new Vector4( ...colors.yellow, PICKER_DEBUG_ALPHA ),
		}
	], [
		new Mesh( new SphereGeometry( 1 + H2, 12, 2, 0, Math.PI * 2, 0, Math.PI / 2 ) ),
		{
			type: 'rotate',
			axis: 'XYZE',
			tag: 'picker',
			color: new Vector4( ...colors.gray, PICKER_DEBUG_ALPHA ),
			rotation: new Euler( - Math.PI / 2, 0, 0 ),
		}
	],

	// Offset visualization
	[
		new LineSegments( lineGeometry ),
		{
			type: 'rotate',
			axis: 'XYZ',
			tag: 'offset',
			color: new Vector4( ...colors.lightGray, 1 ),
			position: new Vector3( 0, 0, 1 + H * 3 ),
			rotation: new Euler( 0, Math.PI / 2, 0 ),
			scale: new Vector3( 2 + H * 6, 2 + H * 6, 2 + H * 6 ),
		}
	]
];

const scaleHelperGeometrySpec = [
	[
		new Mesh( scaleHandleGeometry ),
		{
			type: 'scale',
			axis: 'XYZX',
			color: new Vector4( ...colors.lightGray, 1 ),
			position: new Vector3( 1 + H, 0, 0 )
		}
	], [
		new Mesh( scaleHandleGeometry ),
		{
			type: 'scale',
			axis: 'XYZY',
			color: new Vector4( ...colors.lightGray, 1 ),
			position: new Vector3( 0, 1 + H, 0 )
		}
	], [
		new Mesh( scaleHandleGeometry ),
		{
			type: 'scale',
			axis: 'XYZZ',
			color: new Vector4( ...colors.lightGray, 1 ),
			position: new Vector3( 0, 0, 1 + H )
		}
	], [
		new Mesh( scaleHandleGeometry ),
		{
			type: 'scale',
			axis: 'X',
			color: new Vector4( ...colors.red, 1 ),
			position: new Vector3( 1 - HH, 0, 0 ),
			rotation: new Euler( 0, 0, - Math.PI / 2 )
		}
	], [
		new LineSegments( lineGeometry ), {
			type: 'scale',
			axis: 'X',
			color: new Vector4( ...colors.red, 1 ),
			position: new Vector3( 0.5, 0, 0 ),
			scale: new Vector3( 0.5 - HH, 1, 1 )
		}
	], [
		new Mesh( scaleHandleGeometry ),
		{
			type: 'scale',
			axis: 'Y',
			color: new Vector4( ...colors.green, 1 ),
			position: new Vector3( 0, 1 - HH, 0 )
		}
	], [
		new LineSegments( lineGeometry ),
		{
			type: 'scale',
			axis: 'Y',
			color: new Vector4( ...colors.green, 1 ),
			position: new Vector3( 0, 0.5, 0 ),
			rotation: new Euler( 0, 0, Math.PI / 2 ),
			scale: new Vector3( 0.5 - HH, 1, 1 )
		}
	], [
		new Mesh( scaleHandleGeometry ),
		{
			type: 'scale',
			axis: 'Z',
			color: new Vector4( ...colors.blue, 1 ),
			position: new Vector3( 0, 0, 1 - HH ),
			rotation: new Euler( Math.PI / 2, 0, 0 )
		}
	], [
		new LineSegments( lineGeometry ),
		{
			type: 'scale',
			axis: 'Z',
			color: new Vector4( ...colors.blue, 1 ),
			position: new Vector3( 0, 0, 0.5 ),
			rotation: new Euler( 0, - Math.PI / 2, 0 ),
			scale: new Vector3( 0.5 - HH, 1, 1 )
		}
	], [
		new LineSegments( lineGeometry ), {
			type: 'scale',
			axis: 'XYZX',
			color: new Vector4( ...colors.lightGray, 1 ),
			position: new Vector3( 1 - H, 0, 0 ),
			scale: new Vector3( H2, 1, 1 )
		}
	], [
		new LineSegments( lineGeometry ),
		{
			type: 'scale',
			axis: 'XYZY',
			color: new Vector4( ...colors.lightGray, 1 ),
			position: new Vector3( 0, 1 - H, 0 ),
			rotation: new Euler( 0, 0, Math.PI / 2 ),
			scale: new Vector3( H2, 1, 1 )
		}
	], [
		new LineSegments( lineGeometry ),
		{
			type: 'scale',
			axis: 'XYZZ',
			color: new Vector4( ...colors.lightGray, 1 ),
			position: new Vector3( 0, 0, 1 - H ),
			rotation: new Euler( 0, - Math.PI / 2, 0 ),
			scale: new Vector3( H2, 1, 1 )
		}
	], [
		new LineSegments( squareLineGeometry ),
		{
			type: 'scale',
			axis: 'XY',
			color: new Vector4( ...colors.yellow, 1 ),
			position: new Vector3( 1 - HH, 1 - HH, 0 ),
			scale: new Vector3( HH, HH, 1 ),
		}
	], [
		new Mesh( new PlaneGeometry( H2, H2 ) ),
		{
			type: 'scale',
			axis: 'XY',
			color: new Vector4( ...colors.yellow, 0.15 ),
			position: new Vector3( 1 - H, 1 - H, 0 )
		}
	], [
		new LineSegments( squareLineGeometry ),
		{
			type: 'scale',
			axis: 'YZ',
			color: new Vector4( ...colors.cyan, 1 ),
			position: new Vector3( 0, 1 - HH, 1 - HH ),
			rotation: new Euler( 0, Math.PI / 2, 0 ),
			scale: new Vector3( HH, HH, 1 )
		}
	], [
		new Mesh( new PlaneGeometry( H2, H2 ) ),
		{
			type: 'scale',
			axis: 'YZ',
			color: new Vector4( ...colors.cyan, 0.15 ),
			position: new Vector3( 0, 1 - H, 1 - H ),
			rotation: new Euler( 0, Math.PI / 2, 0 ),
		}
	], [
		new LineSegments( squareLineGeometry ),
		{
			type: 'scale',
			axis: 'XZ',
			color: new Vector4( ...colors.magenta, 1 ),
			position: new Vector3( 1 - HH, 0, 1 - HH ),
			rotation: new Euler( Math.PI / 2, 0, 0 ),
			scale: new Vector3( HH, HH, 1 ),
		}
	], [
		new Mesh( new PlaneGeometry( H2, H2 ) ),
		{
			type: 'scale',
			axis: 'XZ',
			color: new Vector4( ...colors.magenta, 0.15 ),
			position: new Vector3( 1 - H, 0, 1 - H ),
			rotation: new Euler( - Math.PI / 2, 0, 0 )
		}
	],

	// Pickers
	[
		new Mesh( new CylinderGeometry( H2, 0, H2 * 2, 6, 1, false ) ),
		{
			type: 'scale',
			axis: 'X',
			tag: 'picker',
			color: new Vector4( ...colors.red, PICKER_DEBUG_ALPHA ),
			position: new Vector3( H * 6, 0, 0 ),
			rotation: new Euler( Math.PI / 4, 0, - Math.PI / 2 ),
		}
	], [
		new Mesh( new CylinderGeometry( H2, 0, H2 * 2, 6, 1, false ) ),
		{
			type: 'scale',
			axis: 'Y',
			tag: 'picker',
			color: new Vector4( ...colors.green, PICKER_DEBUG_ALPHA ),
			position: new Vector3( 0, H * 6, 0 ),
			rotation: new Euler( 0, Math.PI / 4, 0 ),
		}
	], [
		new Mesh( new CylinderGeometry( H2, 0, H2 * 2, 6, 1, false ) ),
		{
			type: 'scale',
			axis: 'Z',
			tag: 'picker',
			color: new Vector4( ...colors.blue, PICKER_DEBUG_ALPHA ),
			position: new Vector3( 0, 0, H * 6 ),
			rotation: new Euler( Math.PI / 2, Math.PI / 4, 0 ),
		}
	], [
		new Mesh( scaleHandleGeometry ),
		{
			type: 'scale',
			axis: 'XY',
			tag: 'picker',
			color: new Vector4( ...colors.yellow, PICKER_DEBUG_ALPHA ),
			position: new Vector3( 1 - H, 1 - H, - HH ),
			scale: new Vector3( 3, 3, 2 ),
		}
	], [
		new Mesh( scaleHandleGeometry ),
		{
			type: 'scale',
			axis: 'YZ',
			tag: 'picker',
			color: new Vector4( ...colors.cyan, PICKER_DEBUG_ALPHA ),
			position: new Vector3( - HH, 1 - H, 1 - H ),
			scale: new Vector3( 2, 3, 3 ),
		}
	], [
		new Mesh( scaleHandleGeometry ),
		{
			type: 'scale',
			axis: 'XZ',
			tag: 'picker',
			color: new Vector4( ...colors.magenta, PICKER_DEBUG_ALPHA ),
			position: new Vector3( 1 - H, - HH, 1 - H ),
			scale: new Vector3( 3, 2, 3 ),
		}
	], [
		new Mesh( new CylinderGeometry( H2, 0, H * 4, 6, 1, false ) ),
		{
			type: 'scale',
			axis: 'XYZX',
			tag: 'picker',
			color: new Vector4( ...colors.white, PICKER_DEBUG_ALPHA ),
			position: new Vector3( 1 + H, 0, 0 ),
			rotation: new Euler( Math.PI / 4, 0, - Math.PI / 2 ),
		}
	], [
		new Mesh( new CylinderGeometry( H2, 0, H * 4, 6, 1, false ) ),
		{
			type: 'scale',
			axis: 'XYZY',
			tag: 'picker',
			color: new Vector4( ...colors.white, PICKER_DEBUG_ALPHA ),
			position: new Vector3( 0, 1 + H, 0 ),
			rotation: new Euler( 0, Math.PI / 4, 0 ),
		}
	], [
		new Mesh( new CylinderGeometry( H2, 0, H * 4, 6, 1, false ) ),
		{
			type: 'scale',
			axis: 'XYZZ',
			tag: 'picker',
			color: new Vector4( ...colors.white, PICKER_DEBUG_ALPHA ),
			position: new Vector3( 0, 0, 1 + H ),
			rotation: new Euler( Math.PI / 2, Math.PI / 4, 0 ),
		}
	],

	// Offset visualization
	// TODO: Design scale offset visualization. Make it work with inverse/flip axis.
	// [
	//   new LineSegments(scaleOffsetLineGeometry),
	//   {
	//     type: 'scale',
	//     axis: 'XYZ',
	//     tag: 'offset-start',
	//     color: new Vector4(...colors.white, 1),
	//   }
	//], [
	//   new LineSegments(scaleOffsetLineGeometry),
	//   {
	//     type: 'scale',
	//     axis: 'XYZ',
	//     tag: 'offset',
	//     color: new Vector4(...colors.white, 1),
	//   }
	//]
];

export class TransformHelper extends ControlsHelper {

	static isTransformHelper = true;
	static type = 'TransformHelper';
	enabled = true;
	size = 1;
	space = 'local';
	activeMode = '';
	activeAxis = '';
	showX = true;
	showY = true;
	showZ = true;
	showE = true;
	showTranslate = true;
	showRotate = true;
	showScale = true;
	showOffset = true;
	dithering = false;
	positionOffset = new Vector3();
	quaternionOffset = new Quaternion();
	scaleOffset = new Vector3();
	dampingFactor = 0.2;

	// Hide translate and scale axis facing the camera
	AXIS_HIDE_TRESHOLD = 0.99;
	PLANE_HIDE_TRESHOLD = 0.9;
	AXIS_FLIP_TRESHOLD = - 0.001;
	_tempMatrix = new Matrix4();
	_dirVector = new Vector3( 0, 1, 0 );
	_tempQuaternion = new Quaternion();
	_tempQuaternion2 = new Quaternion();
	constructor( camera, domElement ) {

		super( camera, domElement, [
			...scaleHelperGeometrySpec,
			...translateHelperGeometrySpec,
			...rotateHelperGeometrySpec,
		] );

		this.observeProperty( 'enabled' );
		this.observeProperty( 'activeAxis' );
		this.observeProperty( 'activeMode' );
		this.observeProperty( 'space' );
		this.observeProperty( 'size' );
		this.observeProperty( 'showX' );
		this.observeProperty( 'showY' );
		this.observeProperty( 'showZ' );
		this.observeProperty( 'showE' );
		this.observeProperty( 'showTranslate' );
		this.observeProperty( 'showRotate' );
		this.observeProperty( 'showScale' );
		this.observeProperty( 'showOffset' );
		this.observeProperty( 'dithering' );
		this._animate = this._animate.bind( this );

	}
	changed() {

		this.startAnimation( this._animate );

	}
	updateHandle( handle ) {

		const eye = this.eye;
		const quaternion = this.worldQuaternion;
		const handleType = handle.userData.type;
		const handleAxis = handle.userData.axis;
		const handleTag = handle.userData.tag || '';
		this.userData.size = this.userData.size || this.size;
		handle.quaternion.copy( quaternion ).invert();
		handle.position.set( 0, 0, 0 );
		handle.scale.set( 1, 1, 1 ).multiplyScalar( this.sizeAttenuation * this.userData.size / 7 );
		handle.quaternion.multiply( quaternion );
		handle.visible = true;

		if ( handleAxis.indexOf( 'X' ) !== - 1 && ! this.showX )
			handle.visible = false;

		if ( handleAxis.indexOf( 'Y' ) !== - 1 && ! this.showY )
			handle.visible = false;

		if ( handleAxis.indexOf( 'Z' ) !== - 1 && ! this.showZ )
			handle.visible = false;

		if ( handleAxis !== 'E' && handleAxis.indexOf( 'E' ) !== - 1 && ( ! this.showX || ! this.showY || ! this.showZ || ! this.showE ) )
			handle.visible = false;

		if ( handleAxis === 'E' && ( ! this.showE ) )
			handle.visible = false;

		if ( handleType === 'translate' && ! this.showTranslate )
			handle.visible = false;

		if ( handleType === 'rotate' && ! this.showRotate )
			handle.visible = false;

		if ( handleType === 'scale' && ! this.showScale )
			handle.visible = false;

		if ( handleTag.search( 'offset' ) !== - 1 && ! this.showOffset )
			handle.visible = false;

		if ( handleTag.search( 'offset' ) !== - 1 && handleType !== this.activeMode )
			handle.visible = false;

		if ( handleType === 'scale' && this.space === 'world' ) {

			if ( [ 'XYZX', 'XYZY', 'XYZZ' ].indexOf( handle.userData.axis ) === - 1 ) {

				handle.visible = false;

			}

		}

		if ( handleType === 'rotate' ) {

			this._dirVector.copy( eye ).applyQuaternion( this._tempQuaternion.copy( quaternion ).invert() );


			// Hide handle pointing straight towards the camera
			if ( handleAxis.search( 'E' ) !== - 1 ) {

				this._tempQuaternion2.setFromRotationMatrix( this._tempMatrix.lookAt( eye, UNIT.ZERO, UNIT.Y ) );
				handle.quaternion.copy( quaternion ).invert();
				handle.quaternion.multiply( this._tempQuaternion2 );

			}

			if ( handleAxis === 'X' ) {

				this._tempQuaternion2.identity();
				this._tempQuaternion.setFromAxisAngle( UNIT.X, Math.atan2( - this._dirVector.y, this._dirVector.z ) );
				this._tempQuaternion.multiplyQuaternions( this._tempQuaternion2, this._tempQuaternion );
				handle.quaternion.copy( this._tempQuaternion );

				if ( this._dirVector.copy( UNIT.X ).applyQuaternion( quaternion ).dot( eye ) < this.AXIS_FLIP_TRESHOLD ) {

					handle.scale.x *= - 1;

				}

			}

			if ( handleAxis === 'Y' ) {

				this._tempQuaternion2.identity();
				this._tempQuaternion.setFromAxisAngle( UNIT.Y, Math.atan2( this._dirVector.x, this._dirVector.z ) );
				this._tempQuaternion.multiplyQuaternions( this._tempQuaternion2, this._tempQuaternion );
				handle.quaternion.copy( this._tempQuaternion );

				if ( this._dirVector.copy( UNIT.Y ).applyQuaternion( quaternion ).dot( eye ) < this.AXIS_FLIP_TRESHOLD ) {

					handle.scale.y *= - 1;

				}

			}

			if ( handleAxis === 'Z' ) {

				this._tempQuaternion2.identity();
				this._tempQuaternion.setFromAxisAngle( UNIT.Z, Math.atan2( this._dirVector.y, this._dirVector.x ) );
				this._tempQuaternion.multiplyQuaternions( this._tempQuaternion2, this._tempQuaternion );
				handle.quaternion.copy( this._tempQuaternion );

				if ( this._dirVector.copy( UNIT.Z ).applyQuaternion( quaternion ).dot( eye ) < this.AXIS_FLIP_TRESHOLD ) {

					handle.scale.z *= - 1;

				}

			}

			if ( handleTag === 'offset' ) {

				const rotationAngle = this.quaternionOffset.angleTo( this._tempQuaternion.identity() );
				this._dirVector.set( this.quaternionOffset.x, this.quaternionOffset.y, this.quaternionOffset.z ).normalize();
				handle.quaternion.copy( this._tempQuaternion.copy( quaternion ).invert() );
				handle.quaternion.multiply( this._tempQuaternion.setFromRotationMatrix( this._tempMatrix.lookAt( UNIT.ZERO, this._dirVector, UNIT.Y ) ) );
				handle.visible = !! rotationAngle && handleType === this.activeMode;

			}

		} else {


			// TODO: branch out translate and scale
			if ( handleType === 'translate' && handleTag === 'offset' ) {

				handle.position.copy( this.positionOffset ).applyQuaternion( this.worldQuaternionInv ).multiplyScalar( - 1 );
				handle.scale.copy( this.positionOffset ).applyQuaternion( this.worldQuaternionInv );

			} else {


				// Flip handle to prevent occlusion by other handles
				if ( handleAxis.search( 'X' ) !== - 1 || handleAxis === 'YZ' ) {

					if ( this._dirVector.copy( UNIT.X ).applyQuaternion( quaternion ).dot( eye ) < this.AXIS_FLIP_TRESHOLD ) {

						if ( handleTag === 'fwd' ) {

							handle.visible = false;

						} else {

							handle.scale.x *= - 1;

						}

					} else if ( handleTag === 'bwd' ) {

						handle.visible = false;

					}

				}

				if ( handleAxis.search( 'Y' ) !== - 1 || handleAxis === 'XZ' ) {

					if ( this._dirVector.copy( UNIT.Y ).applyQuaternion( quaternion ).dot( eye ) < this.AXIS_FLIP_TRESHOLD ) {

						if ( handleTag === 'fwd' ) {

							handle.visible = false;

						} else {

							handle.scale.y *= - 1;

						}

					} else if ( handleTag === 'bwd' ) {

						handle.visible = false;

					}

				}

				if ( handleAxis.search( 'Z' ) !== - 1 || handleAxis === 'XY' ) {

					if ( this._dirVector.copy( UNIT.Z ).applyQuaternion( quaternion ).dot( eye ) < this.AXIS_FLIP_TRESHOLD ) {

						if ( handleTag === 'fwd' ) {

							handle.visible = false;

						} else {

							handle.scale.z *= - 1;

						}

					} else if ( handleTag === 'bwd' ) {

						handle.visible = false;

					}

				}

			}

			// TODO: Design scale offset visualization. Make it work with inverse/flip axis.
			// if (handleType === 'scale' && handleTag.search('offset') !== -1) {
			//   handle.visible = this.scaleOffset.length() !== 0 && handleType === this.activeMode;
			//   if (handleTag === 'offset') {
			//     handle.scale.multiply(this.scaleOffset));
			//   }
			// }

		}


		// Hide handles at grazing angles
		const hideAllignedToX = ( handleType === 'translate' || handleType === 'scale' ) && ( handleAxis === 'X' || handleAxis === 'XYZX' );
		const hideAllignedToY = ( handleType === 'translate' || handleType === 'scale' ) && ( handleAxis === 'Y' || handleAxis === 'XYZY' );
		const hideAllignedToZ = ( handleType === 'translate' || handleType === 'scale' ) && ( handleAxis === 'Z' || handleAxis === 'XYZZ' );
		const hideAllignedToXY = handleAxis === 'XY' || ( handleType === 'rotate' && handleAxis === 'Z' && ( this.showTranslate || this.showScale ) );
		const hideAllignedToYZ = handleAxis === 'YZ' || ( handleType === 'rotate' && handleAxis === 'X' && ( this.showTranslate || this.showScale ) );
		const hideAllignedToXZ = handleAxis === 'XZ' || ( handleType === 'rotate' && handleAxis === 'Y' && ( this.showTranslate || this.showScale ) );
		const hide_treshold = this.AXIS_HIDE_TRESHOLD * ( handleType === 'scale' ? this.AXIS_HIDE_TRESHOLD * 0.95 : this.AXIS_HIDE_TRESHOLD );
		const plane_hide_treshold = this.AXIS_HIDE_TRESHOLD * ( handleType === 'scale' ? this.PLANE_HIDE_TRESHOLD * 0.95 : this.PLANE_HIDE_TRESHOLD );

		if ( hideAllignedToX && Math.abs( this._dirVector.copy( UNIT.X ).applyQuaternion( quaternion ).dot( eye ) ) > hide_treshold ) {

			handle.visible = false;

		}

		if ( hideAllignedToY && Math.abs( this._dirVector.copy( UNIT.Y ).applyQuaternion( quaternion ).dot( eye ) ) > hide_treshold ) {

			handle.visible = false;

		}

		if ( hideAllignedToZ && Math.abs( this._dirVector.copy( UNIT.Z ).applyQuaternion( quaternion ).dot( eye ) ) > hide_treshold ) {

			handle.visible = false;

		}

		if ( hideAllignedToXY && Math.abs( this._dirVector.copy( UNIT.Z ).applyQuaternion( quaternion ).dot( eye ) ) < ( 1 - plane_hide_treshold ) ) {

			handle.visible = false;

		}

		if ( hideAllignedToYZ && Math.abs( this._dirVector.copy( UNIT.X ).applyQuaternion( quaternion ).dot( eye ) ) < ( 1 - plane_hide_treshold ) ) {

			handle.visible = false;

		}

		if ( hideAllignedToXZ && Math.abs( this._dirVector.copy( UNIT.Y ).applyQuaternion( quaternion ).dot( eye ) ) < ( 1 - plane_hide_treshold ) ) {

			handle.visible = false;

		}

		if ( handle.visible ) {

			const material = handle.material;
			material.dithering = handle instanceof LineSegments ? false : this.dithering;
			material.changed && material.changed();

		}

	}
	_animate( timestep ) {

		const damping = Math.pow( this.dampingFactor, timestep * 60 / 1000 );
		let needsUpdate = false;


		// Animate axis highlight
		for ( let i = 0; i < this.children.length; i ++ ) {

			const handle = this.children[ i ];
			const handleType = handle.userData.type;
			const handleAxis = handle.userData.axis;
			const handleTag = handle.userData.tag || '';
			let targetHighlight = 1;

			if ( handleTag === 'picker' ) {

				targetHighlight = 0;

			} else {

				const material = handle.material;

				if ( handleTag.search( 'offset' ) !== - 1 ) {

					handle.renderOrder = 1e10 + 20;

				} else if ( ! this.enabled || ( this.activeMode && handleType !== this.activeMode ) ) {

					targetHighlight = handle instanceof LineSegments ? 0 : 0.1;
					handle.renderOrder = 1e10 - 10;

				} else if ( this.activeAxis ) {

					if ( handleAxis === this.activeAxis ) {

						targetHighlight = 2;
						handle.renderOrder = 1e10 + 10;

					} else {

						targetHighlight = 0.25;
						handle.renderOrder = 1e10 - 10;

					}

					if ( [ 'translate', 'scale' ].indexOf( handleType ) !== - 1 ) {

						if ( this.activeAxis.split( '' ).some( ( a ) => {

							return handleAxis === a;

						} ) ) {

							targetHighlight = 2;
							handle.renderOrder = 1e10 + 10;

						}

					}

				}

				material.userData.highlight = material.userData.highlight || targetHighlight;
				const highlight = lerp( material.userData.highlight, targetHighlight, damping );

				if ( Math.abs( material.userData.highlight - highlight ) > EPS ) {

					material.userData.highlight = highlight;
					material.highlight = highlight;
					needsUpdate = true;

				}

			}

		}


		// Animate size
		this.userData.size = this.userData.size || this.size;
		const size = lerp( this.userData.size, this.size, damping );

		if ( Math.abs( this.userData.size - size ) > EPS ) {

			this.userData.size = size;
			needsUpdate = true;

		}

		if ( ! needsUpdate )
			this.stopAnimation( this._animate );

		if ( this.parent )
			this.parent.dispatchEvent( { type: 'change' } );

	}
	updateMatrixWorld() {

		super.updateMatrixWorld();

		for ( let i = 0; i < this.children.length; i ++ ) {

			this.updateHandle( this.children[ i ] );

		}

	}

}

//# sourceMappingURL=TransformHelper.js.map
