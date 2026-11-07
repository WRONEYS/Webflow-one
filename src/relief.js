/**
 * Pointer-reactive relief on a photograph.
 * Original shader: a decaying height bump under the pointer, then a small
 * parallax offset and soft lighting. It is not a copy of any site's effect.
 * The loop pauses off-screen and when the height has faded.
 */

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(log || "shader");
  }
  return shader;
}

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uImage;
uniform sampler2D uHeight;
uniform vec2 uTexel;
void main() {
  float l = texture2D(uHeight, vUv + vec2(-uTexel.x, 0.0)).r;
  float r = texture2D(uHeight, vUv + vec2(uTexel.x, 0.0)).r;
  float u = texture2D(uHeight, vUv + vec2(0.0, uTexel.y)).r;
  float d = texture2D(uHeight, vUv + vec2(0.0, -uTexel.y)).r;
  vec2 grad = vec2(r - l, u - d);
  vec2 uv = clamp(vUv + grad * 0.055, 0.002, 0.998);
  vec3 col = texture2D(uImage, uv).rgb;
  vec3 normal = normalize(vec3(-grad.x * 5.0, -grad.y * 5.0, 1.0));
  vec3 light = normalize(vec3(-0.35, 0.5, 0.78));
  float diff = max(dot(normal, light), 0.0);
  float spec = pow(max(dot(reflect(-light, normal), vec3(0.0, 0.0, 1.0)), 0.0), 28.0);
  col = col * (0.88 + diff * 0.28) + spec * 0.16 * vec3(0.97, 0.94, 0.88);
  gl_FragColor = vec4(col, 1.0);
}
`;

export function mountRelief(canvas, url) {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    depth: false,
    premultipliedAlpha: false,
    powerPreference: "low-power",
  });
  if (!gl) return () => {};

  let disposed = false;
  let raf = 0;
  let visible = true;
  let pointer = null;
  const W = 72;
  const H = 72;
  const height = new Float32Array(W * H);
  const bytes = new Uint8Array(W * H * 4);

  const program = gl.createProgram();
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.bindAttribLocation(program, 0, "aPos");
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    return () => {};
  }
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const imageTex = gl.createTexture();
  const heightTex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, heightTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, bytes);

  const uImage = gl.getUniformLocation(program, "uImage");
  const uHeight = gl.getUniformLocation(program, "uHeight");
  const uTexel = gl.getUniformLocation(program, "uTexel");
  gl.uniform1i(uImage, 0);
  gl.uniform1i(uHeight, 1);
  gl.uniform2f(uTexel, 1 / W, 1 / H);

  const image = new Image();
  image.decoding = "async";
  image.onload = () => {
    if (disposed) return;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, imageTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    canvas.dataset.ready = "true";
    schedule();
  };
  image.src = url;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.max(2, Math.round(rect.width * dpr));
    const h = Math.max(2, Math.round(rect.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function splat(nx, ny) {
    const cx = nx * (W - 1);
    const cy = ny * (H - 1);
    const radius = 11;
    for (let y = Math.max(0, cy - radius); y <= Math.min(H - 1, cy + radius); y++) {
      for (let x = Math.max(0, cx - radius); x <= Math.min(W - 1, cx + radius); x++) {
        const dx = x - cx;
        const dy = y - cy;
        const d2 = dx * dx + dy * dy;
        if (d2 > radius * radius) continue;
        const add = Math.exp(-d2 / 28) * 0.62;
        const i = (y | 0) * W + (x | 0);
        height[i] = Math.min(1, height[i] + add);
      }
    }
  }

  function decay() {
    let max = 0;
    for (let i = 0; i < height.length; i++) {
      height[i] *= 0.9;
      if (height[i] > max) max = height[i];
    }
    return max;
  }

  function upload() {
    for (let i = 0; i < height.length; i++) {
      const v = Math.max(0, Math.min(255, height[i] * 255));
      bytes[i * 4] = v;
      bytes[i * 4 + 1] = v;
      bytes[i * 4 + 2] = v;
      bytes[i * 4 + 3] = 255;
    }
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, heightTex);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
  }

  function frame() {
    raf = 0;
    if (disposed) return;
    resize();
    if (pointer) splat(pointer.x, pointer.y);
    const max = decay();
    upload();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (visible && (pointer || max > 0.02)) schedule();
  }

  function schedule() {
    if (!raf && !disposed) raf = requestAnimationFrame(frame);
  }

  function localPoint(event) {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    return {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    };
  }

  const host = canvas.parentElement || canvas;
  const onMove = (event) => {
    pointer = localPoint(event);
    schedule();
  };
  const onLeave = () => {
    pointer = null;
    schedule();
  };
  host.addEventListener("pointermove", onMove);
  host.addEventListener("pointerleave", onLeave);
  host.addEventListener("pointerdown", onMove);

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) schedule();
  });
  io.observe(canvas);
  resize();

  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    io.disconnect();
    host.removeEventListener("pointermove", onMove);
    host.removeEventListener("pointerleave", onLeave);
    host.removeEventListener("pointerdown", onMove);
    gl.deleteProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    gl.deleteBuffer(buffer);
    gl.deleteTexture(imageTex);
    gl.deleteTexture(heightTex);
  };
}
