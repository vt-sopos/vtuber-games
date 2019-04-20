#version 300 es

layout (location = 0) in vec3 position;
layout (location = 1) in vec2 uv;
uniform mat3 uv_matrix;
uniform mat3 mvp_matrix;

out vec2 v_uv;

void main() {
    v_uv = vec2(vec3(uv, 1.0) * uv_matrix);
    gl_Position = vec4(position * mvp_matrix, 1.0);
}
