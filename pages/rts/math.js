'use strict';

class vec2 {
    constructor() {
        this.x = 0;
        this.y = 0;
    }

    get array() {
        return new Float32Array([x, y]);
    }
}

class mat3 {
    constructor() {
        this.array = new Float32Array(9);
    }
}

mat3.prototype.identity = function() {
    this.array[0] = 1; this.array[3] = 0; this.array[6] = 0;
    this.array[1] = 0; this.array[4] = 1; this.array[7] = 0;
    this.array[2] = 0; this.array[5] = 0; this.array[8] = 1;

    return this;
}

mat3.prototype.init = function(m0, m1, m2, m3, m4, m5, m6, m7, m8) {
    this.array[0] = m0; this.array[3] = m1; this.array[6] = m2;
    this.array[1] = m3; this.array[4] = m4; this.array[7] = m5;
    this.array[2] = m6; this.array[5] = m7; this.array[8] = m8;

    return this;
}

mat3.prototype.multiply = function(m) {
    return new mat3().init(
        this.array[0] * m.array[0] + this.array[3] * m.array[1] + this.array[6] * m.array[2],
        this.array[0] * m.array[3] + this.array[3] * m.array[4] + this.array[6] * m.array[5],
        this.array[0] * m.array[6] + this.array[3] * m.array[7] + this.array[6] * m.array[8],
        this.array[1] * m.array[0] + this.array[4] * m.array[1] + this.array[7] * m.array[2],
        this.array[1] * m.array[3] + this.array[4] * m.array[4] + this.array[7] * m.array[5],
        this.array[1] * m.array[6] + this.array[4] * m.array[7] + this.array[7] * m.array[8],
        this.array[2] * m.array[0] + this.array[5] * m.array[1] + this.array[8] * m.array[2],
        this.array[2] * m.array[3] + this.array[5] * m.array[4] + this.array[8] * m.array[5],
        this.array[2] * m.array[6] + this.array[5] * m.array[7] + this.array[8] * m.array[8]
    );
}

mat3.prototype.translate = function(v) {
    this.array[6] = v.x;
    this.array[7] = v.y;

    return this;
}

mat3.prototype.scale = function(v) {
    this.array[0] = v.x;
    this.array[4] = v.y;

    return this;
}

mat3.prototype.rotate = function(f) {
    const cf = Math.cos(f);
    const sf = Math.sin(f);

    this.array[0] = cf; this.array[3] = -sf;
    this.array[1] = sf; this.array[4] = cf;

    return this;
}
