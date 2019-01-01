"use strict";

document.addEventListener('DOMContentLoaded', function() {

//キャンバス作成
const canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

document.body.appendChild(canvas);

//WebGLコンテキストの取得
const gl = canvas.getContext('webgl2');

//array, number
function createShader(source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source[0]);
    gl.compileShader(shader);

    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader);
        console.error(info + ' : ' + source);
    }

    return shader;
}

//number, number
function createProgram(vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const info = gl.getProgramInfoLog(program);
        console.error(info);
    }

    return program;
}

Promise.all([
    fetch('glsl/vertex.glsl'), fetch('glsl/fragment.glsl')
]).then(responses => Promise.all([
    responses[0].text(), responses[1].text()
])).then(sources => {
    const program = createProgram(
        createShader([sources[0]], gl.VERTEX_SHADER),
        createShader([sources[1]], gl.FRAGMENT_SHADER)
    );
    
    gl.useProgram(program);

    //データ転送
    const vertexBuffer = gl.createBuffer();
    const colorBuffer = gl.createBuffer();

    const VERTEX_ATTRIB_LOCATION = 0;
    const COLOR_ATTRIB_LOCATION = 1;

    const VERTEX_SIZE = 3;
    const COLOR_SIZE = 4;

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.enableVertexAttribArray(VERTEX_ATTRIB_LOCATION);

    gl.vertexAttribPointer(VERTEX_ATTRIB_LOCATION, VERTEX_SIZE, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.enableVertexAttribArray(COLOR_ATTRIB_LOCATION);

    gl.vertexAttribPointer(COLOR_ATTRIB_LOCATION, COLOR_SIZE, gl.FLOAT, false, 0, 0);

    const vertices = new Float32Array([
        -0.5, 0.5,  0.0,
        -0.5, -0.5, 0.0,
        0.5,  0.5,  0.0,
        -0.5, -0.5, 0.0,
        0.5,  -0.5, 0.0,
        0.5,  0.5,  0.0
    ]);

    const colors = new Float32Array([
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0
    ]);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    
    const VERTEX_NUMS = 6;

    gl.drawArrays(gl.TRIANGLES, 0, VERTEX_NUMS);

    gl.flush();
});

});