const {
  FuseBox,
  SVGPlugin,
  CSSPlugin,
  CSSResourcePlugin,
  BabelPlugin,
  QuantumPlugin,
  WebIndexPlugin,
  Sparky,
  JSONPlugin
} = require("fuse-box");
const rimraf = require('rimraf'); //fuse-box can 'clean' but this works better for me

let fuse, app, vendor, isProduction; //isProduction set by sparky task 'prod'.

Sparky.task("config", () => {
  fuse = new FuseBox({
    homeDir: "src",
    sourceMaps: !isProduction, //so you can see nicely formated code for debugging
    hash: isProduction, // what's this?
    output: "dist/$name.js", // where did $name from?
    useTypescriptCompiler: true, // makes sense
    experimentalFeatures: true, // what's this?
    target: "browser",
    plugins: [
      SVGPlugin(), // for importing
      CSSPlugin(), // for importing
      JSONPlugin(), // for importing
      WebIndexPlugin({ // to create an index.html file in dist
        template: "src/react/index.html"
      }),
      isProduction &&
        QuantumPlugin({ // reduce bundle size
          treeshake: true, //remove unused code
          uglify: true // tightly pack the js
        })
    ]
  });
  vendor = fuse.bundle("vendor").instructions("~ react/index.jsx"); // what's ~ mean?
  app = fuse.bundle("app").instructions("> [react/index.jsx]"); // what's > [] mean?
});

Sparky.task("rmDist", () => {
    //clean wasn't removing the maps
    rimraf.sync('./dist')
});

Sparky.task("setProdTrue", () => {
  isProduction = true;
});

// async load this stuff with fetch, $.get etc. not import
Sparky.task("copyAssets", () => {
    return Sparky.src("./assets/**/*", { base: "./src" }).dest(
        "./dist"
      );
});

//node fuse.js dev runs the bellow
Sparky.task("dev", ["rmDist",  "config"], () => {
  fuse.dev();
  app.watch().hmr();
  return fuse.run();
});

//node fuse.js prod runs the bellow
Sparky.task("prod", ["setProdTrue", "rmDist", "config"], () => {
  return fuse.run();
});

Sparky.task("default", () => {
  console.log("no arg given to fuse.js: use 'node fuse.js dev' or 'node fuse.js prod'");
});
