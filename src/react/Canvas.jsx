import uid from "uid-safe";
import * as React from "react";
import { jsonToBuffers, drawNeurons, setupCamera, drawLines } from "../regl/index.js";
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
    const regl = require("regl")({
         canvas: this.refs.canvas ,
         extensions: [ "OES_standard_derivatives"],
         onDone: require("fail-nicely")
        });
    let d = jsonToBuffers(data, this.refs.canvas, regl);
    let camera = require("../regl/camera")(this.refs.canvas, {
      eye: [0, 0, 3.4]
    });

    const Neurons = drawNeurons(regl, camera);
    const Links = drawLines(regl, camera);
    regl.frame(({ tick }) => {
      camera.tick();
      regl.clear({
        color: [0, 0, 0, 1]
      });

      if (tick < 3000) {
        d.buffers.spikeTime({ data: d.dataFromAllTimes.spikes[tick] });
        d.buffers.neuronsColorTime({
          data: d.dataFromAllTimes.colorByTime[tick]
        });

        Neurons({
          neuronsPos: d.buffers.neuronsPos,
          colors: d.buffers.neuronsColorTime,
          radius: d.buffers.spikeTime,
          count: d.meta.numberOfNeurons
        });
        Links({
            linksPos: d.buffers.links,
            count: d.meta.numberOfLinks
        })
      }
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
