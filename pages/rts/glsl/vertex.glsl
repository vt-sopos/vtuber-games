#version 300 es

layout (location = 0) in vec3 vertexPosition;
layout (location = 1) in vec4 color;

out vec4 vColor;

void main() {
    vColor = color;
    gl_Position = vec4(vertexPosition, 1.0);
}
