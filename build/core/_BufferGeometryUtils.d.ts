import { BufferGeometry, BufferAttribute } from 'three';
/**
 * @author mrdoob / http://mrdoob.com/
 */
export declare const BufferGeometryUtils: {
    computeTangents: (geometry: BufferGeometry) => void;
    /**
    * @param  {Array<BufferGeometry>} geometries
    * @return {BufferGeometry}
    */
    mergeBufferGeometries: (geometries: BufferGeometry[], useGroups?: boolean | undefined, mergedGeometry?: BufferGeometry | undefined) => BufferGeometry | null;
    /**
    * @param {Array<BufferAttribute>} attributes
    * @return {BufferAttribute}
    */
    mergeBufferAttributes: (attributes: BufferAttribute[]) => BufferAttribute | null;
};
