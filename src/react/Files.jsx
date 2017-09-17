import Slider from "material-ui/Slider";
import IconButton from "material-ui/IconButton";
import * as React from "react";
import PlayArrow from "material-ui/svg-icons/av/play-arrow";
import Pause from "material-ui/svg-icons/av/pause";
import { colors } from "./constants";
import { storage, database } from "./index";
var uid = require("uid-safe");
import * as _ from "lodash";
import { List, ListItem } from "material-ui/List";
import DeleteForever from "material-ui/svg-icons/action/delete-forever";

export class Files extends React.Component {
  fbListener;
  constructor() {
    super();
    this.state = { fileNames: [] };
  }

  componentDidMount() {
    var ref = database.ref("json_files");
    this.fbListener = ref.on("value", snap => {
      this.setState({ fileNames: _.map(snap.val(), x => x.fileName) });
    });
    console.log('hey')

  }

  handleDownload(e, fileName) {
    storage.ref("data/" + fileName).getDownloadURL().then(url => {
      fetch(url).then(res => res.json()).then(json => {
        this.props.prepareData(json);
      });
    });
  }
  componentWillUnmount() {
    if (typeof this.fbListener.off === "function") this.fbListener.off();
  }
  removeData(e, fileName) {
    var fileRef = storage.ref("data/" + fileName);
    fileRef
      .delete()
      .then(function() {
        database
          .ref("json_files")
          .orderByChild("fileName")
          .equalTo(fileName)
          .once("child_added", snap => {
            database.ref("json_files" + '/' + snap.key).remove()
          });
      })
      .catch(function(error) {
      });
  }

  render() {
    return (
      <List>
        {this.state.fileNames &&
          this.state.fileNames.map(fileName => {
            return (
              <ListItem
                key={fileName}
                style={{ color: "black" }}
                onClick={e => this.handleDownload(e, fileName)}
              >
                {fileName}
                <IconButton
                  style={{ position: "absolute", top: 10, right: 0 }}
                  iconStyle={{ position: "absolute", top: 0, right: 0 }}
                  onClick={e => {this.removeData(e, fileName); e.stopPropagation()}}
                >
                  <DeleteForever color="lightgrey" hoverColor="red" />
                </IconButton>
              </ListItem>
            );
          })}
      </List>
    );
  }
}
