precision mediump float;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform float uTime;

const float PI = 3.1415926;
const int STEP = 32;

float rnd(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    float a = rnd(i);
    float b = rnd(i + vec2(1.0, 0.0));
    float c = rnd(i + vec2(0.0, 1.0));
    float d = rnd(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

vec2 polar(vec2 p) {
    return vec2(atan(p.y, p.x) / PI, length(p));
}

void main() {
    vec4 base = texture2D(uTexture, vUv);
    vec2 uv = vUv * 2.0 - 1.0;
    vec2 d = normalize(uv) * (1.0 / float(STEP)) * 0.05;
    vec3 sum = base.rgb;
    for(int i = 0; i < STEP; i++) {
        vec2 amount = -d * float(i);
        sum += texture2D(uTexture, vUv + amount).rgb;
    }
    sum /= float(STEP);

    float l = smoothstep(0., 1., 1. - 0.7 / length(uv));
    vec2 p = polar(uv);
    float n = noise(vec2(p.x * 100., p.y + uTime));
    n = smoothstep(0., .4, pow(n, 4.) * l);

    gl_FragColor = base + vec4(sum, base.a) + n;
}
