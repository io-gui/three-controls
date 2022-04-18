import { IoElement, RegisterIoElement } from '@iogui/iogui';
import '../elements/viewport.js';

export class ThreeUiDemo extends IoElement {

	static get Style() {

		return /* css */ `
      :host {
        display: flex;
        position: relative;
        height: 100%;
        flex-direction: column;
        overflow: hidden;
      }
      :host > three-viewport {
        flex: 1 1 auto;
      }
    `;

	}
	static get Properties() {

		return {};

	}
	constructor( properties = {} ) {

		super( properties );
		this.template( [[ 'three-viewport', { id: 'viewport' } ]] );
		this.$.viewport.loadIbl( './assets/ibl/royal_esplanade_1k.hdr' );

		this.$.viewport.loadModel( './assets/models/cubes/cubes.gltf', ( scene ) => {

			scene.traverse( ( obj ) => {

				obj.layers.set( 1 );

			} );

			scene.scale.set( 500, 500, 500 );

		} );

	}

}

RegisterIoElement( ThreeUiDemo );
