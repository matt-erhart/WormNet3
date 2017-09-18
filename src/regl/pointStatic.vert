precision mediump float;
attribute vec3 neuronsPos;
attribute vec3 colors; //color map value between 0 and 1
varying vec4 color01_v2f; // vertex 2 frag
uniform float aspect;
uniform mat4 projection, view, model;
attribute float radius;

void main () {
    color01_v2f = vec4(colors,1); //varying passes to frag
    gl_Position = projection * view  * vec4(neuronsPos.x, neuronsPos.y * aspect, neuronsPos.z, 1);
    // gl_Position =  vec4(neuronsPos.x, neuronsPos.y * aspect, neuronsPos.z, 1);
    gl_PointSize = radius;
}