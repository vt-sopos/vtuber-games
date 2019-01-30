"use strict";

document.addEventListener('DOMContentLoaded', function() {

//Canvas 作成
const canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

const gl = canvas.getContext('webgl2');

//element, string
function fireEvent(element, event) {
    let evt = document.createEvent('HTMLEvents');
    evt.initEvent(event, true, true);
    return element.dispatchEvent(evt);
}

window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    //16:9にする
    let x = 0;
    let y = 0;
    let width = window.innerWidth
    let height = window.innerHeight;

    if(window.innerWidth / 16 >= window.innerHeight / 9) {
        width = (window.innerHeight / 9) * 16;
        x = (window.innerWidth - width) / 2;
    } else {
        height = (window.innerWidth / 16) * 9;
        y = (window.innerHeight - height) / 2;
    }

    gl.viewport(x, y, width, height);

    console.log('resize');
});

fireEvent(window, 'resize');

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
//number, webGLBuffer
function createBuffer(type, array) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(type, buffer);
    gl.bufferData(type, array, gl.STATIC_DRAW);
    gl.bindBuffer(type, null);
    
    return buffer;
}

Promise.all([
    fetch('glsl/vertex.glsl'), fetch('glsl/fragment.glsl')
]).then(responses => Promise.all([
    responses[0].text(), responses[1].text()
])).then(sources => {
    //
    //  プログラム作成
    //
    const program = createProgram(
        createShader([sources[0]], gl.VERTEX_SHADER),
        createShader([sources[1]], gl.FRAGMENT_SHADER)
    );
    
    gl.useProgram(program);

    //
    //  設定の有効化
    //
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    //
    //  uniform変数の設定
    //

    //
    //  描画データ
    //
    const vertices = new Float32Array([
        -1.0,1.0, 0.0,
        1.0, 0.0, 0.0, 1.0,
        -1.0,-1.0,0.0,
        0.0, 1.0, 0.0, 1.0,
        1.0, 1.0, 0.0,
        0.0, 0.0, 1.0, 1.0,
        1.0,-1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ]);

    const indices = new Uint16Array([
        0, 1, 2,
        1, 3, 2
    ]);

    //
    //  バッファの設定
    //
    const vertexBuffer = createBuffer(gl.ARRAY_BUFFER, vertices);
    const indexBuffer = createBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);

    const VERTEX_ATTRIB_LOCATION = 0;
    const COLOR_ATTRIB_LOCATION = 1;

    const VERTEX_SIZE = 3;
    const COLOR_SIZE = 4;

    const STRIDE = (VERTEX_SIZE + COLOR_SIZE) * Float32Array.BYTES_PER_ELEMENT;
    const POSITION_OFFSET = 0;
    const COLOR_OFFSET = VERTEX_SIZE * Float32Array.BYTES_PER_ELEMENT;

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    gl.enableVertexAttribArray(VERTEX_ATTRIB_LOCATION);
    gl.enableVertexAttribArray(COLOR_ATTRIB_LOCATION);

    gl.vertexAttribPointer(VERTEX_ATTRIB_LOCATION, VERTEX_SIZE, gl.FLOAT, false, STRIDE, POSITION_OFFSET);
    gl.vertexAttribPointer(COLOR_ATTRIB_LOCATION, COLOR_SIZE, gl.FLOAT, false, STRIDE, COLOR_OFFSET);
    
    function loop(timestamp) {
        //
        //  描画
        //
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
        gl.flush();

        window.requestAnimationFrame(loop);
    }
    
    window.requestAnimationFrame(loop);
});

});