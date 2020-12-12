import { Vector3 } from 'three';
import { Controls } from './core/Controls';

let _intersections;
const _hoveredObjects = {};
const _selectedObjects = {};
const _eye = new Vector3();
const _target = new Vector3();

export class DragControls extends Controls {

	constructor( objects, camera, domElement ) {

		super();
		this.transformGroup = false;
		this.objects = objects;

		this.addEventListener( 'enabled-changed', ( event ) => {

			if ( ! event.value )
				this.viewport.domElement.style.cursor = '';

		} );

	}
	onTrackedPointerHover( pointer ) {

		const id = String( pointer.pointerId );
		_intersections = pointer.intersectObjects( this.objects );
		const _hoveredObject = _hoveredObjects[ id ];

		if ( _intersections.length > 0 ) {

			const object = _intersections[ 0 ].object;

			if ( _hoveredObject !== object ) {

				if ( _hoveredObject )
					this.dispatchEvent( { type: 'hoveroff', object: _hoveredObject } );

				this.viewport.domElement.style.cursor = 'pointer';
				this.dispatchEvent( { type: 'hoveron', object: object } );
				_hoveredObjects[ id ] = object;

			}

		} else if ( _hoveredObject ) {

			this.dispatchEvent( { type: 'hoveroff', object: _hoveredObject } );
			this.viewport.domElement.style.cursor = 'auto';
			delete _hoveredObjects[ id ];

		}

	}
	onTrackedPointerDown( pointer ) {

		const id = String( pointer.pointerId );
		this.viewport.domElement.style.cursor = 'move';
		_intersections = pointer.intersectObjects( this.objects );

		if ( _intersections.length > 0 ) {

			const object = ( this.transformGroup === true ) ? this.objects[ 0 ] : _intersections[ 0 ].object;
			_target.setFromMatrixPosition( object.matrixWorld );
			this.viewport.domElement.style.cursor = 'move';
			this.dispatchEvent( { type: 'dragstart', object: object } );
			_selectedObjects[ id ] = object;

		}

	}
	onTrackedPointerMove( pointer ) {

		const id = String( pointer.pointerId );
		const _selectedObject = _selectedObjects[ id ];

		if ( _selectedObject ) {

			_eye.set( 0, 0, 1 ).applyQuaternion( this.viewport.camera.quaternion ).normalize();
			this._plane.setFromNormalAndCoplanarPoint( _eye, _target );
			_selectedObject.position.add( pointer.projectOnPlane( this._plane ).movement );
			this.dispatchEvent( { type: 'drag', object: _selectedObject } );

		}

	}
	onTrackedPointerUp( pointer, pointers ) {

		const id = String( pointer.pointerId );

		for ( const idx in _selectedObjects ) {

			if ( id === idx ) {

				this.dispatchEvent( { type: 'dragend', object: _selectedObjects[ idx ] } );
				delete _selectedObjects[ idx ];

			}

		}

		for ( const idx in _hoveredObjects ) {

			if ( id === idx ) {

				this.dispatchEvent( { type: 'hoveroff', object: _hoveredObjects[ idx ] } );
				delete _hoveredObjects[ idx ];

			}

		}

		if ( pointers.length === 0 )
			this.viewport.domElement.style.cursor = Object.keys( _hoveredObjects ).length ? 'pointer' : 'auto';

	}

	// Deprecation warnings
	getObjects() {

		console.warn( 'THREE.DragControls: getObjects() is deprecated. Use `objects` property instead.' );
		return this.objects;

	}
	activate() {

		this.enabled = true;
		console.warn( 'THREE.DragControls: activate() is deprecated. Set `enabled` property to `false` instead.' );

	}
	deactivate() {

		this.enabled = false;
		console.warn( 'THREE.DragControls: activate() is deprecated. Set `enabled` property to `true` instead.' );

	}

}
