import { useEffect, useRef } from 'react'

// Fond « liquide » : champ de bruit déformé (domain warping) éclairé comme de la soie,
// que le curseur vient tordre en laissant une traînée.
const TRAIL = 16

const VERT = `#version 300 es
in vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`

const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec3 uTrail[${TRAIL}];
out vec4 o;

float hash(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y);
}
float fbm(vec2 p){
  float v = 0., a = .5;
  mat2 m = mat2(1.6,1.2,-1.2,1.6);
  for(int i=0;i<5;i++){ v += a*noise(p); p = m*p; a *= .5; }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float asp = uRes.x / uRes.y;
  vec2 p = (uv - .5) * vec2(asp, 1.) * 2.;
  float t = uTime * .06;

  // Le curseur tord le tissu : rotation locale autour de chaque point de la traînée.
  vec2 q0 = p;
  for(int i=0;i<${TRAIL};i++){
    vec2 c = (uTrail[i].xy - .5) * vec2(asp,1.) * 2.;
    vec2 d = q0 - c;
    float w = uTrail[i].z * exp(-dot(d,d) * 5.);
    q0 += vec2(-d.y, d.x) * w * 1.4;
  }
  p = q0 * .62;

  vec2 q = vec2(fbm(p*1.1 + t), fbm(p*1.1 + vec2(5.2,1.3) - t));
  vec2 r = vec2(fbm(p + 2.2*q + vec2(1.7,9.2) + t*1.5), fbm(p + 2.2*q + vec2(8.3,2.8) - t*1.2));
  float f = fbm(p + 2.4*r);

  // Pétales : masse claire là où f est haut, noir ailleurs.
  float body = smoothstep(.34, .66, f);
  float core = smoothstep(.42, .72, f);

  // Éclairage « soie » à partir du gradient du champ.
  vec2 g = vec2(dFdx(f), dFdy(f)) * uRes.y * .16;
  vec3 n = normalize(vec3(-g, 1.));
  float diff = clamp(dot(n, normalize(vec3(.5,.7,.6))), 0., 1.);
  float spec = pow(clamp(dot(n, normalize(vec3(-.3,.5,.9))), 0., 1.), 40.);

  vec3 cream = vec3(.96,.84,.68);
  vec3 orange = vec3(.92,.48,.12);
  vec3 col = mix(vec3(.012), mix(orange*.95, cream*1.15, core), body);
  col *= .7 + 1.0*diff;
  col += spec * cream * 1.1 * body;
  col += orange * pow(r.x, 3.) * .25 * body;

  // Vignette + grain.
  col *= 1. - .55*dot(uv-.5, uv-.5)*2.2;
  col += (hash(gl_FragCoord.xy + fract(uTime)) - .5) * .035;
  o = vec4(col, 1.);
}`

function compile(gl, type, src) {
  const s = gl.createShader(type)
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s))
  return s
}

export default function Liquid() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const gl = canvas.getContext('webgl2', { antialias: false, powerPreference: 'high-performance' })
    if (!gl) { canvas.dataset.fallback = 'true'; return }

    const prog = gl.createProgram()
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(prog, 'uRes')
    const uTime = gl.getUniformLocation(prog, 'uTime')
    const uTrail = gl.getUniformLocation(prog, 'uTrail')

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const trail = new Float32Array(TRAIL * 3)
    for (let i = 0; i < TRAIL; i++) trail[i * 3] = trail[i * 3 + 1] = -5
    let head = 0
    const last = { x: 0.5, y: 0.5, set: false }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5) // le shader est coûteux : on plafonne
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    const push = (x, y) => {
      const nx = x / window.innerWidth
      const ny = 1 - y / window.innerHeight
      if (last.set) {
        const speed = Math.hypot(nx - last.x, ny - last.y)
        trail[head * 3] = nx
        trail[head * 3 + 1] = ny
        trail[head * 3 + 2] = Math.min(speed * 18, 0.9)
        head = (head + 1) % TRAIL
      }
      last.x = nx; last.y = ny; last.set = true
    }
    const onMove = (e) => push(e.clientX, e.clientY)
    const onTouch = (e) => e.touches[0] && push(e.touches[0].clientX, e.touches[0].clientY)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('touchmove', onTouch, { passive: true })

    let raf, start = performance.now()
    const frame = (now) => {
      for (let i = 0; i < TRAIL; i++) trail[i * 3 + 2] *= 0.955 // la torsion s'estompe
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, reduce ? 12 : (now - start) / 1000)
      gl.uniform3fv(uTrail, trail)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      if (!reduce) raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('touchmove', onTouch)
    }
  }, [])

  return <canvas ref={ref} className="liquid" aria-hidden="true" />
}
