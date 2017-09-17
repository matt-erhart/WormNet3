import * as React from "react";
import * as _ from "lodash";
var store = require("store");
import { svgPadding as pad } from "./constants";
import {
  colors,
} from "./constants";
import { Controls } from "./Controls";
import { Upload } from "./Upload";
import { Files } from "./Files";

import Drawer from "material-ui/Drawer";
import IconButton from "material-ui/IconButton";
import NavigationMenu from "material-ui/svg-icons/navigation/menu";
import ChevronRight from "material-ui/svg-icons/navigation/chevron-right";
import ChevronLeft from "material-ui/svg-icons/navigation/chevron-left";

export class App extends React.Component{
  constructor() {
    super();
    this.state = {
      time: 0,
      isPlaying: false,
      fileName: "",
      nLoaded: 0,
      open: false
    };
  }

  componentWillMount() {
    const savedtime = store.get("time") || 0;

  }
  componentDidMount() {
  }

  startTimer = () => {
    this.setState({ isPlaying: true });
  };

  pauseTimer = () => {
    this.timer = false;
    this.setState({ isPlaying: false });
  };

  toggleTimer = () => {
    if (this.state.isPlaying) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
    this.setState({ isPlaying: !this.state.isPlaying });
  };

  setTime = value => {
    this.setState({ time: value });
  };

  handleToggle = () => this.setState({ open: !this.state.open });

  render() {
    const {
      time
    } = this.state;

    return (
      <div>
        <IconButton
          tooltip="Load Data"
          style={{ position: "absolute", top: 0, right: 0 }}
          onClick={this.handleToggle}
        >
          <NavigationMenu color="white" />
        </IconButton>
        <Drawer
          width={300}
          openSecondary={true}
          open={this.state.open}
          style={{ backgroundColor: "grey" }}
        >
          <Upload />{" "}
          <IconButton
            onClick={this.handleToggle}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              padding: 0
            }}
            iconStyle={{
              width: 40,
              height: 40,
              top: -5
            }}
          >
            <ChevronRight />
          </IconButton>
          <Files prepareData={this.prepareData} />
        </Drawer>
        <div>
          <Controls
            time={this.state.time}
            togglePlay={this.toggleTimer}
            changeTime={this.setTime}
            isPlaying={this.state.isPlaying}
            nTimePoints={6000}
          />
        </div>
      </div>
    );
  }
}
