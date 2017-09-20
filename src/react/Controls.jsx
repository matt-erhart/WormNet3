import Slider from "material-ui/Slider";
import IconButton from "material-ui/IconButton";
import * as React from "react";
import PlayArrow from "material-ui/svg-icons/av/play-arrow";
import Pause from "material-ui/svg-icons/av/pause";
import { colors } from "./constants";


const IconStyles = { width: 100, height: 100, display: "inline-block" };

const PlayPause = isPlaying => {
  if (isPlaying) {
    return (
      <Pause
        color={colors.controls}
        style={{ width: 100, height: 100, display: "inline-block", padding: 0 }}
      />
    );
  } else {
    return (
      <PlayArrow
        color={colors.controls}
        style={{ width: 100, height: 100, display: "inline-block", padding: 0 }}
      />
    );
  }
};

export const Controls= (props) => {
  return (
    <div
      style={{
        display: "flex",
        alignContent: "center",
        justifyContent: "center",
        bottom: 0
      }}
    >
      <div>
        {props.isPlaying &&
          <Pause
            onClick={e => props.togglePlay(e.target.value)}
            color={colors.controls}
            style={IconStyles}
          />}
        {!props.isPlaying &&
          <PlayArrow
            onClick={e => props.togglePlay(e.target.value)}
            color={colors.controls}
            style={IconStyles}
          />}
        <Slider
          style={{ width: "50vw", display: "inline-block", height: "83px" }}
          min={0}
          max={props.nTimePoints}
          step={1}
          value={props.time}
          onChange={(event, value) => {
            props.changeTime(value);
          }}
        />
        <div
          style={{
            color: colors.neuronInActive,
            textAlign: "center",
            fontSize: "16pt"
          }}
        >
          {props.time} / {props.nTimePoints}{" "}
        </div>
      </div>
    </div>
  );
};
