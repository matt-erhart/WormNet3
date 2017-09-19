import uid from "uid-safe";
import * as React from "react";
import {
  jsonToBuffers,
  drawNeurons,
  drawLines,
  drawPropagations
} from "../regl/index.js";
import * as data from "../assets/data/full.json";

export class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      canvasHeight: 1000,
      canvasWidth: 1000
    };
    this.regl;
    this.d;
    this.settings = { duration: 60, spikeRadius: 30, radius: 10 };
    this.propagationProps;
  }

  shouldComponentUpdate() {
    return false;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.jsonUrl !== "" && this.props.jsonUrl !== nextProps.jsonUrl)
      fetch(nextProps.jsonUrl, { mode: "cors" })
        .then(res => {
          return res.json();
        })
        .then(data => {
          this.d = jsonToBuffers(
            data,
            this.refs.canvas,
            this.regl,
            this.settings
          );
          this.props.setnTimePoints(this.d.meta.numberOfTimePoints);
          this.propagationProps = {
            sources: this.d.buffers.propagations.sources,
            targets: this.d.buffers.propagations.targets,
            colors: this.d.buffers.propagations.colors,
            count: this.d.meta.numberOfPropagations,
            startEndTimes: this.d.buffers.startEndTimes
          };          
        })
        .catch(function(error) {
          console.log(error);
        });
  }

  componentDidMount() {
    let startTime = 0;
    let elapsedTime = 0;

    this.regl = require("regl")({
      canvas: this.refs.canvas,
      extensions: ["OES_standard_derivatives"],
      onDone: require("fail-nicely")
    });

    this.d = jsonToBuffers(data, this.refs.canvas, this.regl, this.settings);
    this.props.setnTimePoints(this.d.meta.numberOfTimePoints)
    let camera = require("../regl/camera")(this.refs.canvas, {
      eye: [0, 0, 3.4]
    });

    const Neurons = drawNeurons(this.regl, camera);
    const Links = drawLines(this.regl, camera);
    const Propagations = drawPropagations(this.regl, camera);
    this.propagationProps = {
      sources: this.d.buffers.propagations.sources,
      targets: this.d.buffers.propagations.targets,
      colors: this.d.buffers.propagations.colors,
      count: this.d.meta.numberOfPropagations,
      startEndTimes: this.d.buffers.startEndTimes
    };

    this.regl.frame(({ tick, time }) => {
      if (startTime === 0) startTime = time;
      if (this.props.time !== this.props.scrubTime) {
        elapsedTime = this.d.scales.elapsed(this.props.scrubTime);
        startTime = time - elapsedTime;
      }

      if (!this.props.isPlaying) {
        startTime = time - elapsedTime;
      } else {
        elapsedTime =
          elapsedTime >= this.settings.duration
            ? elapsedTime
            : time - startTime;
      }
      const t = Math.ceil(this.d.scales.elapsed.invert(elapsedTime));
      if (tick % 5 === 0) this.props.setTime(t);

      camera.tick();
      this.regl.clear({
        color: [0, 0, 0, 1]
      });

      if (t < this.d.meta.numberOfTimePoints) {
        this.d.buffers.spikeTime({ data: this.d.dataFromAllTimes.spikes[t] });
        this.d.buffers.neuronsColorTime({
          data: this.d.dataFromAllTimes.colorByTime[t]
        });
      }

      Links({
        linksPos: this.d.buffers.links,
        count: this.d.meta.numberOfLinks
      });

      Neurons({
        neuronsPos: this.d.buffers.neuronsPos,
        colors: this.d.buffers.neuronsColorTime,
        radius: this.d.buffers.spikeTime,
        count: this.d.meta.numberOfNeurons
      });

      Propagations([
        { radius: 7, elapsedTime, ...this.propagationProps },
        { radius: 5, elapsedTime: elapsedTime - 0.01, ...this.propagationProps },
        { radius: 3, elapsedTime: elapsedTime - 0.02, ...this.propagationProps }
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
