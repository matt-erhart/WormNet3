import uid from "uid-safe";
import * as React from "react";
import {
  jsonToBuffers,
  drawNeurons,
  drawLines,
  drawPropagations
} from "../regl/index.js";
import * as data from "../assets/data/feed_json.json";

export class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      canvasHeight: 1000,
      canvasWidth: 1000
    };
  }

  shouldComponentUpdate() {
    return false;
  }

  componentDidMount() {
    let startTime = 0;
    let elapsedTime = 0;

    const regl = require("regl")({
      canvas: this.refs.canvas,
      extensions: ["OES_standard_derivatives"],
      onDone: require("fail-nicely")
    });

    let settings = { duration: 60, spikeRadius: 30, radius: 10 };
    let d = jsonToBuffers(data, this.refs.canvas, regl, settings);
    let camera = require("../regl/camera")(this.refs.canvas, {
      eye: [0, 0, 3.4]
    });

    const Neurons = drawNeurons(regl, camera);
    const Links = drawLines(regl, camera);
    const Propagations = drawPropagations(regl, camera);
    const propagationProps = {
      sources: d.buffers.propagations.sources,
      targets: d.buffers.propagations.targets,
      colors: d.buffers.propagations.colors,
      count: d.meta.numberOfPropagations,
      startEndTimes: d.buffers.startEndTimes
    };

    regl.frame(({ tick, time }) => {
      if (startTime === 0) startTime = time;
      if (this.props.time !== this.props.scrubTime) {
        elapsedTime = d.scales.elapsed(this.props.scrubTime);
        startTime = time - elapsedTime;
      }

      if (!this.props.isPlaying) {
        startTime = time - elapsedTime;
      } else {
        elapsedTime =
        elapsedTime >= settings.duration ? elapsedTime : time - startTime;
      }
      const t = Math.ceil(d.scales.elapsed.invert(elapsedTime));
      if (tick%5 === 0) this.props.setTime(t)
      
      camera.tick();
      regl.clear({
        color: [0, 0, 0, 1]
      });
       
        d.buffers.spikeTime({ data: d.dataFromAllTimes.spikes[t] });
        d.buffers.neuronsColorTime({
          data: d.dataFromAllTimes.colorByTime[t]
        });

        Links({
          linksPos: d.buffers.links,
          count: d.meta.numberOfLinks
        });

        Neurons({
          neuronsPos: d.buffers.neuronsPos,
          colors: d.buffers.neuronsColorTime,
          radius: d.buffers.spikeTime,
          count: d.meta.numberOfNeurons
        });

        Propagations([
          { radius: 7, elapsedTime, ...propagationProps },
          { radius: 5, elapsedTime: elapsedTime - 0.01, ...propagationProps },
          { radius: 3, elapsedTime: elapsedTime - 0.02, ...propagationProps }
        ]);
    });
  }

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
