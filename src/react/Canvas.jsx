import uid from "uid-safe";
import * as React from "react";
import {
  jsonToBuffers,
  drawNeurons,
  drawLines,
  drawPropagations
} from "../regl/index.js";
import * as data from "../assets/data/full.json";
import { withRouter } from "react-router-dom";
import * as init from "./initRegl";

class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      canvasHeight: 1400,
      canvasWidth: 1400,
      loading: false
    };
    this.reglRaf;
    this.Neurons;
    this.Propagations;
    this.Links;
    this.regl;
    this.d;
    this.settings = { duration: 60, spikeRadius: 30, radius: 10 };
    this.propagationProps;
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.loading !== this.state.loading) {
      return true;
    } else {
      return false;
    }
  }

  componentWillReceiveProps(nextProps) { // load data with url
    if (nextProps.jsonUrl !== "" && this.props.jsonUrl !== nextProps.jsonUrl) {
      this.fetchData_StartViz(nextProps.jsonUrl)
    }
  }

  componentDidMount() {
    let startTime = 0;
    let elapsedTime = 0;
    if (this.props.jsonUrl !== "") {
      this.fetchData_StartViz(this.props.jsonUrl)
    }
  }

  fetchData_StartViz = (url) => {
    init
    .setupRegl(this.refs.canvas, url, this.settings)
    .then(env => {
      let { camera, d, drawCmds, regl } = env;
      this.viz(camera, d, drawCmds, regl, this.settings);
    });
  }

  viz = (camera, data, drawCmds, regl, settings) => {
    let startTime = 0;
    let elapsedTime = 0;
    let ntimePoints = data.meta.numberOfTimePoints;
    let duration = settings.duration;

    if (this.reglRaf) this.reglRaf.cancel();
    this.reglRaf = regl.frame(({ tick, time }) => {
      // if (tick > 2) this.reglRaf.cancel()
      camera.tick();
      if (startTime === 0) startTime = time;
      if (this.props.time !== this.props.scrubTime) {
        elapsedTime = data.scales.elapsed(this.props.scrubTime);
        startTime = time - elapsedTime;
      }
      if (!this.props.isPlaying) {
        startTime = time - elapsedTime;
      } else {
        elapsedTime = elapsedTime >= duration ? elapsedTime : time - startTime;
      }
      const timeInt = Math.ceil(data.scales.elapsed.invert(elapsedTime));

      regl.clear({
        color: [0, 0, 0, 1]
      });

      if (timeInt < ntimePoints) {
        if (tick % 5 === 0) this.props.setTime(timeInt);
        data.buffers.spikeTime({ data: data.dataFromAllTimes.spikes[timeInt] });
        data.buffers.neuronsColorTime({
          data: data.dataFromAllTimes.colorByTime[timeInt]
        });
      }

      drawCmds.Links({
        linksPos: data.buffers.links,
        count: data.meta.numberOfLinks
      });

      drawCmds.Neurons({
        neuronsPos: data.buffers.neuronsPos,
        colors: data.buffers.neuronsColorTime,
        radius: data.buffers.spikeTime,
        count: data.meta.numberOfNeurons
      });
      drawCmds.Propagations([
        { radius: 7, elapsedTime, ...data.buffers.propagations },
        {
          radius: 5,
          elapsedTime: elapsedTime - 0.015,
          ...data.buffers.propagations
        },
        {
          radius: 3,
          elapsedTime: elapsedTime - 0.03,
          ...data.buffers.propagations
        }
      ]);
    });
  };

  render() {
    return (
      <canvas
        ref="canvas"
        width={this.state.canvasWidth || 1}
        height={this.state.canvasHeight || 1}
        style={{ left: 0, top: 0 }}
      />
    );
  }
}

export default withRouter(Canvas);
// if (this.props.jsonUrl !== "") {
//   this.fetchJson(this.props.jsonUrl, jsonToBuffers).then(data => {
//     this.regl = require("regl")({
//       canvas: this.refs.canvas,
//       extensions: ["OES_standard_derivatives"],
//       onDone: require("fail-nicely")
//     });

//     // regl draw commands need a regl instance and a camera
//     let camera = require("../regl/camera")(this.refs.canvas, {
//       eye: [0, 0, 3.4]
//     });
//     const Neurons = drawNeurons(this.regl, camera);
//     const Links = drawLines(this.regl, camera);
//     const Propagations = drawPropagations(this.regl, camera);
//     this.regl = require("regl")({
//       canvas: this.refs.canvas,
//       extensions: ["OES_standard_derivatives"],
//       onDone: require("fail-nicely")
//     });

//     // regl draw commands need a regl instance and a camera
//     let camera = require("../regl/camera")(this.refs.canvas, {
//       eye: [0, 0, 3.4]
//     });
//     this.Neurons = drawNeurons(this.regl, camera);
//     this.Links = drawLines(this.regl, camera);
//     this.Propagations = drawPropagations(this.regl, camera);
//   });
// }

// this.d = jsonToBuffers(data, this.refs.canvas, this.regl, this.settings);
// this.props.setnTimePoints(this.d.meta.numberOfTimePoints);

// this.propagationProps = {
//   sources: this.d.buffers.propagations.sources,
//   targets: this.d.buffers.propagations.targets,
//   colors: this.d.buffers.propagations.colors,
//   count: this.d.meta.numberOfPropagations,
//   startEndTimes: this.d.buffers.startEndTimes
// };
