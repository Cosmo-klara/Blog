const vertexShader = `
attribute vec2 a_position;
attribute vec3 a_color;
attribute vec4 a_data;
attribute float a_flare;
uniform float u_pixel_ratio;
uniform float u_time;
varying vec3 v_color;
varying float v_alpha;
varying float v_phase;
varying float v_speed;
varying float v_flare;
void main() {
  gl_Position = vec4(a_position.x * 2.0 - 1.0, 1.0 - a_position.y * 2.0, 0.0, 1.0);
  gl_PointSize = a_data.x * u_pixel_ratio;
  v_color = a_color;
  v_alpha = a_data.y;
  v_phase = a_data.z;
  v_speed = a_data.w;
  v_flare = a_flare;
}`

const fragmentShader = `
precision highp float;
uniform float u_time;
varying vec3 v_color;
varying float v_alpha;
varying float v_phase;
varying float v_speed;
varying float v_flare;
void main() {
  vec2 point = gl_PointCoord - 0.5;
  float distanceSquared = dot(point, point);
  float core = exp(-distanceSquared * 300.0);
  float horizontalRay = exp(-abs(point.x) * 70.0) * exp(-abs(point.y) * 7.0);
  float verticalRay = exp(-abs(point.y) * 70.0) * exp(-abs(point.x) * 7.0);
  float flare = (horizontalRay + verticalRay) * v_flare;
  float twinkle = 0.08 + 0.92 * (0.5 + 0.5 * sin(u_time * v_speed + v_phase));
  float intensity = core * 1.2 + flare * 0.64;
  float alpha = clamp(intensity * v_alpha * twinkle, 0.0, 1.0);
  vec3 color = mix(v_color, vec3(1.0, 0.96, 0.84), core * 0.58);
  gl_FragColor = vec4(color, alpha);
}`

const palettes = [
  [0.78, 0.86, 1.0],
  [0.68, 0.82, 1.0],
  [1.0, 0.87, 0.7],
  [1.0, 0.77, 0.67]
]

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Night sky shader failed to compile:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function createStars(width: number, height: number) {
  const count = Math.min(1100, Math.max(140, Math.round((width * height) / 3800)))
  const data = new Float32Array(count * 10)

  for (let index = 0; index < count; index++) {
    const offset = index * 10
    const rank = Math.random()
    const color = palettes[Math.floor(Math.random() * palettes.length)]
    data[offset] = Math.random()
    data[offset + 1] = Math.random()
    data[offset + 2] = color[0]
    data[offset + 3] = color[1]
    data[offset + 4] = color[2]
    data[offset + 5] = rank > 0.94 ? 18 + Math.random() * 5 : 11 + Math.random() * 5
    data[offset + 6] = rank > 0.94 ? 0.92 + Math.random() * 0.08 : 0.56 + Math.random() * 0.38
    data[offset + 7] = Math.random() * Math.PI * 2
    data[offset + 8] = 0.28 + Math.random() * 0.72
    data[offset + 9] = rank > 0.992 ? 1 : 0
  }

  return { data, count }
}

export function setupNightSky() {
  const canvas = document.getElementById('night-sky')
  if (!(canvas instanceof HTMLCanvasElement)) return
  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: false,
    powerPreference: 'high-performance'
  })
  if (!gl) return

  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexShader)
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShader)
  if (!vertex || !fragment) return
  const program = gl.createProgram()
  if (!program) return
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  gl.deleteShader(vertex)
  gl.deleteShader(fragment)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Night sky shader failed to link:', gl.getProgramInfoLog(program))
    return
  }

  const attributes = {
    position: gl.getAttribLocation(program, 'a_position'),
    color: gl.getAttribLocation(program, 'a_color'),
    data: gl.getAttribLocation(program, 'a_data'),
    flare: gl.getAttribLocation(program, 'a_flare')
  }
  const time = gl.getUniformLocation(program, 'u_time')
  const pixelRatioUniform = gl.getUniformLocation(program, 'u_pixel_ratio')
  const buffer = gl.createBuffer()
  if (Object.values(attributes).some((location) => location < 0) || !time || !pixelRatioUniform || !buffer) return

  gl.useProgram(program)
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.enableVertexAttribArray(attributes.position)
  gl.enableVertexAttribArray(attributes.color)
  gl.enableVertexAttribArray(attributes.data)
  gl.enableVertexAttribArray(attributes.flare)
  const stride = 10 * Float32Array.BYTES_PER_ELEMENT
  gl.vertexAttribPointer(attributes.position, 2, gl.FLOAT, false, stride, 0)
  gl.vertexAttribPointer(attributes.color, 3, gl.FLOAT, false, stride, 2 * Float32Array.BYTES_PER_ELEMENT)
  gl.vertexAttribPointer(attributes.data, 4, gl.FLOAT, false, stride, 5 * Float32Array.BYTES_PER_ELEMENT)
  gl.vertexAttribPointer(attributes.flare, 1, gl.FLOAT, false, stride, 9 * Float32Array.BYTES_PER_ELEMENT)
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
  gl.clearColor(0, 0, 0, 0)
  canvas.dataset.rendererReady = 'true'

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  let ratio = 1
  let starCount = 0
  let frame = 0
  let lastFrameAt = 0
  let isDark = document.documentElement.classList.contains('dark')
  let startedAt = performance.now()
  const frameInterval = 1000 / 60

  const draw = (now: number) => {
    frame = 0
    if (!isDark || document.hidden) {
      gl.clear(gl.COLOR_BUFFER_BIT)
      return
    }
    if (!reducedMotion.matches && now - lastFrameAt < frameInterval) {
      frame = requestAnimationFrame(draw)
      return
    }

    lastFrameAt = now
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.uniform1f(time, reducedMotion.matches ? 0 : (now - startedAt) / 1000)
    gl.uniform1f(pixelRatioUniform, ratio)
    gl.drawArrays(gl.POINTS, 0, starCount)
    if (!reducedMotion.matches) frame = requestAnimationFrame(draw)
  }

  const resize = () => {
    ratio = Math.min(window.devicePixelRatio || 1, 1.5)
    canvas.width = Math.round(window.innerWidth * ratio)
    canvas.height = Math.round(window.innerHeight * ratio)
    gl.viewport(0, 0, canvas.width, canvas.height)
    const stars = createStars(window.innerWidth, window.innerHeight)
    starCount = stars.count
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, stars.data, gl.STATIC_DRAW)
    if (isDark && !document.hidden && !frame) frame = requestAnimationFrame(draw)
  }

  const observer = new MutationObserver(() => {
    isDark = document.documentElement.classList.contains('dark')
    if (isDark && !document.hidden) {
      startedAt = performance.now()
      lastFrameAt = 0
      if (!frame) frame = requestAnimationFrame(draw)
    } else if (frame) {
      cancelAnimationFrame(frame)
      frame = 0
      gl.clear(gl.COLOR_BUFFER_BIT)
    }
  })
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

  window.addEventListener('resize', resize, { passive: true })
  reducedMotion.addEventListener('change', () => {
    lastFrameAt = 0
    if (isDark && !document.hidden && !frame) frame = requestAnimationFrame(draw)
  })
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (frame) cancelAnimationFrame(frame)
      frame = 0
    } else if (isDark && !frame) {
      lastFrameAt = 0
      frame = requestAnimationFrame(draw)
    }
  })

  resize()
  if (isDark && !document.hidden && !frame) frame = requestAnimationFrame(draw)
}
