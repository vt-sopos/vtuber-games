"use strict";

//イベントの発火
function fireEvent(element, event) {
    let evt = document.createEvent('HTMLEvents');
    evt.initEvent(event, true, true);
    return element.dispatchEvent(evt);
}

function getViewport() {
    //16:9にする
    let x = 0;
    let y = 0;
    let w = window.innerWidth
    let h = window.innerHeight;

    if(window.innerWidth / 16 >= window.innerHeight / 9) {
        w = (window.innerHeight / 9) * 16;
        x = (window.innerWidth - w) / 2;
    } else {
        h = (window.innerWidth / 16) * 9;
        y = (window.innerHeight - h) / 2;
    }

    return {x:x, y:y, w:w, h:h};
}
    
document.addEventListener('DOMContentLoaded', function() {

    //Canvasの作成
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    
    const gl = canvas.getContext('webgl2');
    
    
    //ウィンドウのリサイズ
    window.addEventListener('resize', function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    
        let size = getViewport();
    
        gl.viewport(size.x, size.y, size.w, size.h);
    });
    
    fireEvent(window, 'resize');
    
    //テクスチャの読み込み
    function loadTexture(src) {
        const texture = new Image();
        return new Promise((resolve, reject) => {
            texture.addEventListener('load', e => {
                resolve(texture);
            });

            texture.src = src;
        });
    }
    //シェーダーの読み込み
    function loadShader(url) {
        return fetch(url).then(res => res.text());
    }

    //テクスチャの作成
    function createTexture(img) {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D, 0,
            gl.RGBA, gl.RGBA,
            gl.UNSIGNED_BYTE, img
        );
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        return texture;
    }
    //シェーダーの作成
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
    //プログラムの作成
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
    //バッファの作成
    function createBuffer(type, array) {
        const buffer = gl.createBuffer();
        gl.bindBuffer(type, buffer);
        gl.bufferData(type, array, gl.STATIC_DRAW);
        gl.bindBuffer(type, null);
        return buffer;
    }

    
    Promise.all([
        loadShader('glsl/vertex.glsl'),
        loadShader('glsl/fragment.glsl'),
        loadTexture('img/normal.png')
    ]).then(assets => {
        console.log(assets);
        //
        //  プログラム作成
        //
        const program = createProgram(
            createShader([assets[0]], gl.VERTEX_SHADER),
            createShader([assets[1]], gl.FRAGMENT_SHADER)
        );
        
        gl.useProgram(program);
    
        //
        //  設定の有効化
        //
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.enable(gl.CULL_FACE);

        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
        //
        //  uniform変数の設定
        //
        let viewport = getViewport();
        
        var uv = new mat3().init(
            1.0 / 8, 0.0, 0.0,
            0.0, 1.0 / 2, 0.0,
            0.0, 0.0, 1.0
        );
        var mvp = new mat3().init(
            1.0, 0.0, 0.0,
            0.0, viewport.w / viewport.h, 0.0,
            0.0, 0.0, 1.0
        );

        const uvLocation = gl.getUniformLocation(program, 'uv_matrix');
        gl.uniformMatrix3fv(uvLocation, false, uv.array);
        const mvpLocation = gl.getUniformLocation(program, 'mvp_matrix');
        gl.uniformMatrix3fv(mvpLocation, false, mvp.array);

        //
        //  描画データ
        //
        const texture = createTexture(assets[2]);
        
        const vertices = new Float32Array([
            -0.1, 0.1, 0.0,
            0.0, 0.0,
            -0.1,-0.1,0.0,
            0.0, 1.0,
            0.1, 0.1, 0.0,
            1.0, 0.0,
            0.1,-0.1, 0.0,
            1.0, 1.0
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
        const UV_ATTRIB_LOCATION = 1;
    
        const VERTEX_SIZE = 3;
        const UV_SIZE = 2;
    
        const STRIDE = (VERTEX_SIZE + UV_SIZE) * Float32Array.BYTES_PER_ELEMENT;
        const POSITION_OFFSET = 0;
        const UV_OFFSET = VERTEX_SIZE * Float32Array.BYTES_PER_ELEMENT;
    
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    
        gl.enableVertexAttribArray(VERTEX_ATTRIB_LOCATION);
        gl.enableVertexAttribArray(UV_ATTRIB_LOCATION);
    
        gl.vertexAttribPointer(VERTEX_ATTRIB_LOCATION, VERTEX_SIZE, gl.FLOAT, false, STRIDE, POSITION_OFFSET);
        gl.vertexAttribPointer(UV_ATTRIB_LOCATION, UV_SIZE, gl.FLOAT, false, STRIDE, UV_OFFSET);
        
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