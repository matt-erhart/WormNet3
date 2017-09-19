import Slider from "material-ui/Slider";
import IconButton from "material-ui/IconButton";
import * as React from "react";
import PlayArrow from "material-ui/svg-icons/av/play-arrow";
import Pause from "material-ui/svg-icons/av/pause";
import { storage, database } from "./index";
var uid = require("uid-safe");
import FileUpload from "material-ui/svg-icons/file/file-upload";
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import { withRouter } from "react-router-dom";

class Upload extends React.Component {
  constructor() {
    super();
    this.state = { progress: 0 };
  }

  handleUpload(e) {
    const file = e.nativeEvent.target.files[0];
    const fileName = file.name.replace(".json", "_" + Date.now() + ".json");
    const task = storage.ref("data/" + fileName).put(file);

    task.on(
      "state_changed",
       (snap) => {

        if (snap.state === 'running') {
          const progress = (snap.bytesTransferred/snap.totalBytes) * 100;
          this.setState({progress: Math.round(progress)})
        } 
      },
      (err) => {
        console.log(err);
      },
      () => {
        database.ref().child("json_files").push({ fileName: fileName });
        this.setState({progress: 0})
        this.props.history.push('/' + fileName.replace('.json', ''))
      }
    );
  }

  render() {
    const {progress} = this.state;
    return (
      <FlatButton label={progress > 0 ? progress + "%" : "Upload JSON" }
      containerElement="label" icon={<FileUpload />  }>

        <input
          type="file"
          onChange={e => this.handleUpload(e)}
          style={{
            cursor: "pointer",
            position: "absolute",
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            width: "100%",
            opacity: 0
          }}
        />

      </FlatButton>
    );
  }
}

export default withRouter(Upload)