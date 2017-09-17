const {
  FuseBox,
  SVGPlugin,
  CSSPlugin,
  QuantumPlugin,
  WebIndexPlugin,
  Sparky,
  RawPlugin,
  JSONPlugin
} = require("fuse-box");

let fuse, app, vendor, isProduction;

Sparky.task("config", () => {
  fuse = new FuseBox({
      homeDir: "src/regl",
      sourceMaps: !isProduction,
      hash: isProduction,
      output: "dist/$name.js",
      useTypescriptCompiler: true,
      experimentalFeatures: true,
      target: 'browser',
      plugins: [
          SVGPlugin(),
          CSSPlugin(),
          JSONPlugin(),
          RawPlugin([".frag", ".vert"]),
          WebIndexPlugin({
              template: "src/index.html"
          }),
          isProduction && QuantumPlugin({
              treeshake: true,
              uglify: true
          })
      ]
  });
  // vendor
  vendor = fuse.bundle("vendor").instructions("~ index.js")

  // bundle app
  app = fuse.bundle("app").instructions("> [index.js]")
});

// Sparky.task("default", ["clean", "config"], () => {
//   fuse.dev();
//   // add dev instructions
//   app.watch().hmr()
//   return fuse.run();
// });

Sparky.task("copy-data", () => { //need to start with ./ not ./src for base to work
  return Sparky.src("./assets/data/**/*.json", { base: "./src" }).dest(
    "./dist"
  );
});

Sparky.task("clean", () => Sparky.src("dist/").clean("dist/"));
// Sparky.task("prod-env", ["clean"], () => { isProduction = true })
Sparky.task("default", [   "copy-data", "config"], () => {
  // comment out to prevent dev server from running (left for the demo)
  fuse.dev();
  app.watch();
  return fuse.run();
});


