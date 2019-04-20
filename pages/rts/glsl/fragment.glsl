#version 300 es

precision highp float;

in vec2 v_uv;
uniform sampler2D tex;

out vec4 fragment;

void main() {
    fragment = texture(tex, v_uv);
}
