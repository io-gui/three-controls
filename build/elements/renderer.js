import { WebGLRenderer } from "three";
import { IoElement, RegisterIoElement } from "@iogui/iogui";

const renderer = new WebGLRenderer( { antialias: false, preserveDrawingBuffer: true, alpha: true } );
const gl = renderer.getContext();
renderer.domElement.className = 'canvas3d';
renderer.shadowMap.enabled = true;
renderer.setClearColor( 0x000000, 1.0 );
renderer.autoClear = false;
let host;
let perfNow = 0;
let perfDelta = 1000;
let perfAverage = 1000;
let perfWarned;

const _performanceCheck = function () {

	if ( perfWarned )
		return;

	perfDelta = performance.now() - perfNow;
	perfAverage = Math.min( ( perfAverage * 10 + perfDelta ) / 11, 1000 );
	perfNow = performance.now();

	if ( perfAverage < 16 ) {

		console.warn( 'ThreeRenderer performance warning: rendering multiple canvases!' );
		perfWarned = true;

	}

};

const renderedQueue = [];
const renderNextQueue = [];

const animate = function () {

	for ( let i = 0; i < renderedQueue.length; i ++ )
		renderedQueue[ i ].rendered = false;
	renderedQueue.length = 0;

	for ( let i = 0; i < renderNextQueue.length; i ++ ) {

		renderNextQueue[ i ].scheduled = false;
		renderNextQueue[ i ].render();

	}

	renderNextQueue.length = 0;
	requestAnimationFrame( animate );

};

requestAnimationFrame( animate );

export class ThreeRenderer extends IoElement {

	static get Style() {

		return /* css */ `
      :host {
        display: block;
        overflow: hidden;
        position: relative;
        touch-action: none;
        user-select: none;
        box-sizing: border-box;
        flex: 1 1 auto;
      }
      :host:focus > canvas {
        outline: var(--io-border-width) solid var(--io-color-focus);
        outline-offset: calc(var(--io-border-width) * -1);
      }
      :host > canvas {
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: none;
        image-rendering: optimizeSpeed; /* Older versions of FF */
        image-rendering: -moz-crisp-edges; /* FF 6.0+ */
        image-rendering: -webkit-optimize-contrast; /* Safari */
        image-rendering: -o-crisp-edges; /* OS X & Windows Opera (12.02+) */
        image-rendering: pixelated; /* Awesome future-browsers */
        -ms-interpolation-mode: nearest-neighbor;
      }
      :host[ishost] > canvas:not(.canvas3d) {
        display: none;
      }
    `;

	}
	_ctx;
	static get Properties() {

		return {
			ishost: {
				type: Boolean,

				// reflect: 1
			},
			size: [ 0, 0 ],
			tabindex: 1,
			clearColor: 0x000000,
			clearAlpha: 1,
		};

	}
	static get Listeners() {

		return {
			'dragstart': 'preventDefault'
		};

	}
	get renderer() {

		return renderer;

	}
	constructor( properties = {} ) {

		super( properties );
		this.template( [[ 'canvas', { id: 'canvas' } ]] );
		this._ctx = this.$.canvas.getContext( '2d' );
		this.$.canvas.imageSmoothingEnabled = false;

	}
	setHost() {

		if ( ! this.ishost ) {

			if ( host ) {

				const r = window.devicePixelRatio || 1;
				host._ctx.clearRect( 0, 0, host.size[ 0 ] * r, host.size[ 1 ] * r );
				host._ctx.drawImage( host.renderer.domElement, 0, 0, host.size[ 0 ] * r, host.size[ 1 ] * r );
				gl.flush();
				host.ishost = false;

			}
			/* eslint-disable-next-line */
            host = this;
			this.appendChild( this.renderer.domElement );
			this.ishost = true;
			_performanceCheck();

		}

		if ( this.size[ 0 ] && this.size[ 1 ] ) {

			this.renderer.setSize( this.size[ 0 ], this.size[ 1 ] );
			this.renderer.setPixelRatio( window.devicePixelRatio );
			this.renderer.setClearColor( this.clearColor, this.clearAlpha );

		}

	}
	onResized() {

		const rect = this.getBoundingClientRect();
		this.size[ 0 ] = Math.floor( rect.width );
		this.size[ 1 ] = Math.floor( rect.height );
		const r = window.devicePixelRatio || 1;
		this.$.canvas.width = this.size[ 0 ] * r;
		this.$.canvas.height = this.size[ 1 ] * r;

	}

}

RegisterIoElement( ThreeRenderer );
