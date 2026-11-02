/* model-viewer 4.1: ativa o decodificador antes de atribuir um GLB comprimido. */
let configured;
export function configureMeshopt(){return configured ||= customElements.whenDefined('model-viewer').then(()=>{customElements.get('model-viewer').meshoptDecoderLocation=new URL('./vendor/meshopt_decoder.js',import.meta.url).href;});}
