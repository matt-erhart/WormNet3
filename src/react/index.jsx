const dt = new Date();
console.log(
  "///////////////////////////  " +
    dt.toLocaleTimeString() +
    "  ////////////////////////////"
);
import * as React from "react";
import * as ReactDOM from "react-dom";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  RouteComponentProps
} from "react-router-dom";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import getMuiTheme from "material-ui/styles/getMuiTheme";
var injectTapEventPlugin = require("react-tap-event-plugin");
try {
  injectTapEventPlugin();
} catch (e) {}

var firebase = require("firebase");
var config = {
  apiKey: "AIzaSyDseby1y2tlJxhIc96j_a96W8k_nt4bVHM",
  authDomain: "thinkingdots-51dfa.firebaseapp.com",
  databaseURL: "https://thinkingdots-51dfa.firebaseio.com",
  projectId: "thinkingdots-51dfa",
  storageBucket: "thinkingdots-51dfa.appspot.com",
  messagingSenderId: "782470761826"
};

if (!firebase.apps.length) {
  firebase.initializeApp(config);
}
export var storage = firebase.storage();
export var database = firebase.database();
import App from "./App";

const Root = () => {
  return (
    <MuiThemeProvider>
      <Router>
        <Route path="/:fileName?/:enableMenu?" component={App} />
      </Router>
    </MuiThemeProvider>
  );
};

document.body.style.backgroundColor = "black";
ReactDOM.render(<Root />, document.getElementById("root"));
