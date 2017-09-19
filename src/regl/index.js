import { scaleNeuronPositions } from "./scaleNeuronPositions";
import { propagationsAsArrays, linkPositions } from "./organizeData";
const scaleLinear = require("d3-scale").scaleLinear;
const mat4 = require("gl-mat4");
const range = require("d3-array").range;
import * as _ from "lodash";
import { colors } from "./constants";
import { rgb01 } from "./scaleNeuronPositions";
import * as data from "../assets/data/full.json";

export const jsonToBuffers = (data, canvas, regl, settings) => {
  const { duration, spikeRadius, radius } = settings;
  const neurons = scaleNeuronPositions(
    data.neurons,
    canvas.width,
    canvas.height
  );
  const links = linkPositions(data.links, neurons);
  const propagations = propagationsAsArrays(data.propagations, neurons);
  const nTimePoints = _.max(
    _.flattenDeep(propagations.startEndTimes).map(x => +x)
  );
  const timeScale = scaleLinear()
    .domain([0, nTimePoints])
    .range([0, 1]);
  const elapsedScale = scaleLinear()
    .domain([0, nTimePoints])
    .range([0, duration]);

  const timeRange = range(nTimePoints).map(x => timeScale(x) * duration);
  let spikes = neurons.map((neuron, i) => {
    const spks = _.flattenDeep(
      neuron.spikeTimes.map(x => range(8).map(y => y + x))
    ); //spike duration
    return timeRange.map((t, ti) => {
      return spks.indexOf(ti) > 0 ? spikeRadius : radius;
    });
  });

  let startEndTimesFromAnimationDuration = propagations.startEndTimes.map(
    times => {
      return times.map(x => timeScale(+x) * duration);
    }
  );
  spikes = _.zip.apply(_, spikes); //transpose

  const type = neurons.map(n => n.type);
  const active = {
    excites: colors.excitesActive,
    inhibits: colors.inhibitsActive
  };
  const inactive = {
    excites: colors.excitesInActive,
    inhibits: colors.inhibitsInActive
  };

  let colorByTime = spikes.map((arr, i) => {
    return arr.map((rad, i) => {
      return rad === spikeRadius
        ? rgb01(active[type[i]])
        : rgb01(inactive[type[i]]);
    });
  });

  let spikeTime = regl.buffer(spikes[0]);
  let neuronsPos = regl.buffer({
    data: neurons.map(n => n.pos3d),
    length: neurons.length
  });
  let neuronsColorTime = regl.buffer(colorByTime[0]);
  let sources = regl.buffer(propagations.propagationSources);
  let targets = regl.buffer(propagations.propagationTargets);
  let pcolors = regl.buffer(propagations.propagationTypeColors);
  let startEndTimes = regl.buffer(startEndTimesFromAnimationDuration);
  let linksArr = regl.buffer(links.linksArray);

  const buffers = {
    spikeTime,
    neuronsPos,
    links: linksArr,
    neuronsColorTime,
    propagations: {
      sources,
      targets,
      colors: pcolors,
      count: propagations.startEndTimes.length,
      startEndTimes
    }
  };
  const dataFromAllTimes = { spikes, colorByTime }; //set spikeTime and neuronsColor buffers with these
  const meta = {
    numberOfNeurons: neurons.length,
    numberOfPropagations: propagations.startEndTimes.length,
    numberOfLinks: links.linksArray.length,
    numberOfTimePoints: nTimePoints
  };
  const scales = { elapsed: elapsedScale, time: timeScale };
  return { buffers, dataFromAllTimes, meta, scales };
};

const commonSettings = {
  blend: {
    enable: true,
    func: {
      srcRGB: "one",
      srcAlpha: "one",
      dstRGB: "one minus src alpha",
      dstAlpha: "one minus src alpha"
    }
  },
  depth: { enable: false }
};

export const drawNeurons = (regl, camera) => {
  return regl({
    vert: require("./pointStatic.vert"),
    frag: require("./pointInterp.frag"),
    blend: commonSettings.blend,
    depth: commonSettings.depth,
    attributes: {
      neuronsPos: regl.prop("neuronsPos"),
      colors: regl.prop("colors"),
      radius: regl.prop("radius")
    },
    uniforms: {
      aspect: ctx => {
        return ctx.viewportWidth / ctx.viewportHeight;
      },
      projection: ({ viewportWidth, viewportHeight }) =>
        mat4.perspective(
          [],
          Math.PI / 4.0,
          viewportWidth / viewportHeight,
          0.1,
          1000
        ),
      model: mat4.identity([]),
      view: () => camera.view()
    },
    primitive: "point",
    count: regl.prop("count")
  });
};

export const drawLines = (regl, camera) => {
  return regl({
    depth: commonSettings.depth,
    frag: `
    precision mediump float;
    uniform vec4 color;
    void main() {
      gl_FragColor = color;
    }`,

    vert: `
    precision mediump float;
    attribute vec3 linksPos;
    uniform mat4 projection, view, model;
    uniform float aspect;

    void main() {
      gl_Position = projection * view * model * vec4(linksPos.x, linksPos.y * aspect, linksPos.z, 1);
    }`,

    attributes: {
      linksPos: regl.prop("linksPos")
    },

    uniforms: {
      // color: [47 / 255, 47 / 255, 47 / 255, 1],
      color: [80 / 255, 80 / 255, 80 / 255, 1],
      aspect: ctx => ctx.viewportWidth / ctx.viewportHeight,
      elapsedTime: regl.prop("elapsedTime"),
      projection: ({ viewportWidth, viewportHeight }) =>
        mat4.perspective(
          [],
          Math.PI / 4.0,
          viewportWidth / viewportHeight,
          0.1,
          100
        ),
      model: mat4.identity([]),
      view: () => camera.view()
    },
    count: regl.prop("count"),
    lineWidth: 1,
    primitive: "line"
  });
};

export const drawPropagations = (regl, camera) => {
  return regl({
    blend: commonSettings.blend,
    vert: require("./pointInterp.vert"),
    frag: require("./pointInterp.frag"),
    cull: {
      enable: true,
      face: "back"
    },
    depth: commonSettings.depth,
    attributes: {
      propagationSources: regl.prop("sources"),
      propagationTargets: regl.prop("targets"),
      propagationColors: regl.prop("colors"),
      startEndTimes: regl.prop("startEndTimes")
    },
    uniforms: {
      radius: regl.prop("radius"),
      aspect: ctx => ctx.viewportWidth / ctx.viewportHeight,
      elapsedTime: regl.prop("elapsedTime"),
      projection: ({ viewportWidth, viewportHeight }) =>
        mat4.perspective(
          [],
          Math.PI / 4.0,
          viewportWidth / viewportHeight,
          0.1,
          100
        ),
      model: mat4.identity([]),
      view: () => camera.view()
    },
    primitive: "point",
    count: regl.prop("count")
  });
};

// /**
//  * LINE
// //  */

// let f = regl.frame(({ tick, time }) => {
//     regl.clear({
//       color: [0, 0, 0, 1],
//       depth: 1
//     });
//   camera.tick();
//   if (startTime === 0) {
//     startTime = time;
//   }
//   const t = Math.round(elapsedScale.invert(elapsedTime));
//   line();
//   if (t < nTimePoints) {
//     spikeBuffer({ data: spikes[t] });
//     colorBuff({data: colorByTime[t]})
//   }

//   drawPoints();
//   elapsedTime = elapsedTime >= duration ? elapsedTime : time - startTime;
//   interpPoints([
//     { radius: 7, elapsedTime },
//     { radius: 5, elapsedTime: elapsedTime - .01 },
//     { radius: 3, elapsedTime: elapsedTime - .02 },
//   ]);

// });
