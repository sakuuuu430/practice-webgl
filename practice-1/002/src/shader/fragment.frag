precision mediump float;
varying vec2 vUv;

uniform vec2 uResolution;
uniform float uTime;

const float PI = 3.1415926;

void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    vec3 sum = vec3(0.);
    for(int i = 0; i < 6; ++i) {
        float line_1 = 0.005 / abs(length(uv) - float(i) * 0.15 + sin(uTime));
        float line_2 = 0.005 / abs(length(uv) - float(i) * 0.15 + sin(uTime + .1));
        float line_3 = 0.005 / abs(length(uv) - float(i) * 0.15 + sin(uTime + .1));
        sum += vec3(line_1, line_2, line_3);
    }
    gl_FragColor = vec4(sum, 1.0);
}
