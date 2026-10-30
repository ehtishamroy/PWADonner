declare module 'heic-decode' {
    type DecodedImage = { width: number; height: number; data: Uint8ClampedArray };

    function decode(options: { buffer: ArrayBufferLike | Uint8Array }): Promise<DecodedImage>;

    namespace decode {
        function all(options: { buffer: ArrayBufferLike | Uint8Array }): Promise<
            Array<{ width: number; height: number; decode: () => Promise<DecodedImage> }>
        >;
    }

    export default decode;
}
