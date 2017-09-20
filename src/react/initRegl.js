import {
  jsonToBuffers,
  drawNeurons,
  drawLines,
  drawPropagations
} from "../regl/index.js";

// 
export const setupRegl = (canvas, url, settings) => {
    return fetch(url, { mode: "cors" })
    .then(res => {
      return res.json();
    })
    .then(data => { 
        const {regl, camera } = createReglWithCamera(canvas);
        const drawCmds = injectDrawCommands(regl, camera);
        const d = jsonToBuffers(data, canvas, regl, settings);
        return {regl, camera, drawCmds, d}
    })
}

export const createReglWithCamera = (canvas) =>{
    const regl = require("regl")({
      canvas: canvas,
      extensions: ["OES_standard_derivatives"],
      onDone: require("fail-nicely")
    });

    const camera =  require("../regl/camera")(canvas, {
      eye: [0, 0, 3.4]
    });

    return {regl, camera}
} 

export const injectDrawCommands = (regl, camera) => {
    const Neurons = drawNeurons(regl, camera);
    const Links = drawLines(regl, camera);
    const Propagations = drawPropagations(regl, camera);
    return {Neurons, Links, Propagations}
}
