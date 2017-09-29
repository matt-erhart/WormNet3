var createCamera = require('orbit-camera')
var createScroll = require('scroll-speed')
var mp = require('mouse-position')
var mb = require('mouse-pressed')
// var key = require('key-pressed')

var panSpeed = 1

module.exports = attachCamera

function attachCamera(canvas, opts) {
  opts = opts || {}
  opts.pan = opts.pan !== false
  opts.scale = opts.scale !== false
  opts.rotate = opts.rotate !== false
  opts.eye = opts.eye ? opts.eye : [0,0,3.5];
  var scroll = createScroll(canvas, opts.scale)
  var mbut = mb(canvas, opts.rotate)
  var mpos = mp(canvas)
  console.log(opts.eye)
  var camera = createCamera(
    opts.eye
    , [0, 0, 0]
    , [0, 1, 0]
  )

  camera.tick = tick

  return camera

  function tick() {
    // var ctrl = key('<control>') || key('<alt>')
    // var alt = key('<shift>')
    var height = canvas.height
    var width = canvas.width

    //  && !ctrl && !alt
    if (opts.rotate && mbut.left) {
      camera.rotate(
          [ mpos.x / width - 0.5, mpos.y / height - 0.5 ]
        , [ mpos.prevX / width - 0.5, mpos.prevY / height - 0.5 ]
      )
    }
    //  || (mbut.left && ctrl && !alt)
    if (opts.pan && mbut.right) {
      camera.pan([
          panSpeed * (mpos.x - mpos.prevX) / width
        , panSpeed * (mpos.y - mpos.prevY) / height
      ])
    }

    if (opts.scale && scroll[1]) {
      camera.distance *= Math.exp(scroll[1] / height)
    }
    //|| (mbut.left && !ctrl && alt)
    if (opts.scale && (mbut.middle )) {
      var d = mpos.y - mpos.prevY
      if (!d) return;

      camera.distance *= Math.exp(d / height)
    }

    scroll.flush()
    mpos.flush()
  }
}
