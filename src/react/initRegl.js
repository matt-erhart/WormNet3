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

export const calcTimes = (
  time,
  startTime,
  elapsedTime,
  duration,
  props,
  elapsedScale
) => {
  if (props.time !== props.scrubTime) {
    elapsedTime = elapsedScale(props.scrubTime);
    startTime = time - elapsedTime;
  }
  if (!props.isPlaying) {
    startTime = time - elapsedTime;
  } else {
    elapsedTime = elapsedTime >= duration ? elapsedTime : time - startTime;
  }
  const timeInt = Math.ceil(elapsedScale.invert(elapsedTime));
  return {startTime, elapsedTime, timeInt}
};

export const frameProvider = (regl, camera, drawCmds, data, settings) => {
    let startTime = 0;
    let elapsedTime = 0;
    let ntimePoints = data.meta.numberOfTimePoints;
    let duration = settings.duration;
 return (tick, time, props ) => {
        if (startTime === 0) startTime = time;
        [startTime, elapsedTime, timeInt] = calcTimes(time, startTime, elapsedTime, duration, props)

        camera.tick();
        regl.clear({
          color: [0, 0, 0, 1]
        });

        if (timeInt < ntimePoints) {
          if (tick % 5 === 0) this.props.setTime(t);
          data.buffers.spikeTime({ data: data.dataFromAllTimes.spikes[timeInt] });
          data.buffers.neuronsColorTime({
            data: data.dataFromAllTimes.colorByTime[timeInt]
          });
        }

        this.Links({
          linksPos: data.buffers.links,
          count: data.meta.numberOfLinks
        });

        this.Neurons({
          neuronsPos: data.buffers.neuronsPos,
          colors: data.buffers.neuronsColorTime,
          radius: data.buffers.spikeTime,
          count: data.meta.numberOfNeurons
        });

        this.Propagations([
          { radius: 7, elapsedTime, ...data.propagations },
          {
            radius: 5,
            elapsedTime: elapsedTime - 0.015,
            ...data.propagations
          },
          {
            radius: 3,
            elapsedTime: elapsedTime - 0.03,
            ...data.propagations
          }
        ])
      }
    }