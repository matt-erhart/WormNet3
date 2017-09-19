//@ts-check
const {
  FuseBox,
  SVGPlugin,
  CSSPlugin,
  CSSResourcePlugin,
  QuantumPlugin,
  WebIndexPlugin,
  Sparky,
  JSONPlugin,
  RawPlugin
} = require("fuse-box");
const rimraf = require("rimraf"); //fuse-box can 'clean' but this works better for me
const historyFallback = require( 'connect-history-api-fallback')

var browserSync = require("browser-sync").create();

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
      RawPlugin([".frag", ".vert"]),
      WebIndexPlugin({
        // to create an index.html file in dist
        template: "src/react/index.html"
      }),
      isProduction &&
        QuantumPlugin({
          // reduce bundle size
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
  rimraf.sync("./dist");
  rimraf.sync("./.fusebox");
});

Sparky.task("setProdTrue", () => {
  isProduction = true;
});

// async load this stuff with fetch, $.get etc. not import
Sparky.task("copyAssets", () => {
  return Sparky.src("./assets/**/*", { base: "./src" }).dest("./dist");
});

Sparky.task("browserSync", () => {
  browserSync.init({
    server: {
      baseDir: "./dist",
      middleware: [
        historyFallback()
      ]
    }
  });
});

//node fuse.js dev runs the bellow. you could try hmr with app.watch().hmr()
Sparky.task("dev", ["rmDist", "browserSync", "config"], () => {
  app.watch().completed(() => {
    browserSync.reload();
  });
  return fuse.run();
});

//node fuse.js prod runs the bellow
Sparky.task("prod", ["setProdTrue", "rmDist", "config"], () => {
  return fuse.run();
});

Sparky.task("default", () => {
  console.log(
    "no arg given to fuse.js: use 'node fuse.js dev' or 'node fuse.js prod'"
  );
});
