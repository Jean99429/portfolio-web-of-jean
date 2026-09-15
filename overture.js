const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const seg = (t, a, b) => clamp01((t - a) / (b - a));
const easeOut = (x) => 1 - (1 - x) ** 3;
const easeInOut = (x) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2);
const lerp = (a, b, p) => a + (b - a) * p;

const BAND_A = 0.12;
const BAND_END = 1.62;
const RED_HOLD = 0.06;
const CUT = BAND_END + RED_HOLD;
const RED_A = CUT;
const RED_B = CUT + 0.49;
const MARK_IN = RED_B;
const INK_A = RED_B + 0.7;
const INK_OUT = INK_A + 1.22;
const LOCK_A = INK_OUT + 0.38;
const END = INK_OUT + 0.46;

const VIDEO_LOOP_END = 11.1053;
const ROWS = [0, 1, 1, 1, 0, 1];
const GLYPHS = ["/", "=", "+", ":", "·", "<", ">", ";"];
const SYMBOLS = [">", "<", "/", "=", ":"];
const FRAGMENTS = [
  ["AI PRODUCT", 0.13, -0.26],
  ["CREATIVE", 0.36, 0.2],
  ["DESIGN", 0.59, -0.1],
  ["SYSTEM", 0.81, 0.26],
];
const BLACK_SEQUENCE = [
  ["outline", 0.2],
  ["solid", 0.09],
  ["ascii", 0.16],
  ["split", 0.07],
  ["dots", 0.19],
  ["solid", 0.08],
  ["scan", 0.14],
  ["smear", 0.06],
  ["outline", 0.13],
  ["solid", 0.07],
  ["ascii", 0.15],
  ["dots", 0.1],
];
const LOCK_SEQUENCE = [
  ["ascii", 0.07],
  ["scan", 0.08],
  ["dots", 0.1],
  ["outline", 0.13],
  ["ascii", 0.17],
];

function pickSequence(sequence, x) {
  const total = sequence.reduce((sum, item) => sum + item[1], 0);
  let cursor = x % total;
  for (const [style, duration] of sequence) {
    if (cursor < duration) return style;
    cursor -= duration;
  }
  return sequence.at(-1)[0];
}

function randomAt(index) {
  const n = Math.sin(index * 12.9898) * 43758.5453;
  return n - Math.floor(n);
}

function jitter(a, b) {
  const n = Math.sin(a * 91.7 + b * 47.3) * 43758.5453;
  return (n - Math.floor(n)) * 2 - 1;
}

let alpha = 1;

function drawBar(ctx, x, y, width, height, style, color, row, part) {
  ctx.fillStyle = color;
  ctx.strokeStyle = color;

  if (style === "solid") {
    ctx.fillRect(x, y, width, height);
    return;
  }
  if (style === "outline") {
    ctx.lineWidth = Math.max(1, height * 0.1);
    ctx.strokeRect(
      x + ctx.lineWidth / 2,
      y + ctx.lineWidth / 2,
      width - ctx.lineWidth,
      height - ctx.lineWidth,
    );
    return;
  }
  if (style === "dots") {
    const step = Math.max(3, height / 3.1);
    const dot = Math.max(1.4, step * 0.42);
    for (let gy = y + step / 2; gy < y + height; gy += step) {
      for (let gx = x + step / 2; gx < x + width; gx += step) {
        ctx.fillRect(gx - dot / 2, gy - dot / 2, dot, dot);
      }
    }
    return;
  }
  if (style === "scan") {
    const step = Math.max(2.4, height / 4.2);
    for (let gy = y; gy < y + height; gy += step) {
      ctx.fillRect(x, gy, width, Math.max(1, step * 0.52));
    }
    return;
  }
  if (style === "ascii") {
    ctx.globalAlpha = 0.16 * alpha;
    ctx.fillRect(x, y, width, height);
    ctx.globalAlpha = alpha;
    const fontSize = height * 1.15;
    const characterWidth = fontSize * 0.55;
    ctx.font = `${fontSize}px "DM Mono", monospace`;
    ctx.textBaseline = "middle";
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();
    let glyph = 0;
    for (let gx = x; gx < x + width; gx += characterWidth) {
      ctx.fillText(
        GLYPHS[(row * 5 + part * 3 + glyph++) % GLYPHS.length],
        gx,
        y + height / 2,
      );
    }
    ctx.restore();
    return;
  }
  if (style === "split") {
    const offset = Math.max(2, height * 0.22);
    ctx.globalAlpha = alpha;
    ctx.fillRect(x - offset, y, width, height);
    ctx.globalAlpha = 0.45 * alpha;
    ctx.fillRect(x + offset, y, width, height);
    ctx.globalAlpha = alpha;
    return;
  }
  if (style === "smear") {
    const offset = Math.max(2, height * 0.34);
    for (let i = 5; i >= 0; i -= 1) {
      ctx.globalAlpha = (1 - i / 6.5) * alpha;
      ctx.fillRect(x + i * offset, y, width, height);
    }
    ctx.globalAlpha = alpha;
    return;
  }
  if (style === "hand") {
    ctx.lineWidth = height * 0.92;
    ctx.lineCap = "butt";
    ctx.beginPath();
    const midY = y + height / 2;
    ctx.moveTo(x + height * 0.05, midY + jitter(row, part) * height * 0.1);
    for (let i = 1; i <= 4; i += 1) {
      const px = x + (width - height * 0.1) * (i / 4) + height * 0.05;
      ctx.quadraticCurveTo(
        px - width / 8,
        midY + jitter(row + i, part * 2) * height * 0.16,
        px,
        midY + jitter(row * 3 + i, part) * height * 0.1,
      );
    }
    ctx.stroke();
  }
}

function drawMark(ctx, centerX, centerY, width, style, color, opacity = 1) {
  alpha = opacity;
  ctx.globalAlpha = alpha;
  const barHeight = Math.max(2, Math.round(width * 0.082));
  const gap = Math.round(width * 0.088);
  const total = 6 * barHeight + 5 * gap;
  const x = Math.round(centerX - width / 2);
  const segmentWidth = Math.round(width * 0.375);
  let y = Math.round(centerY - total / 2);

  ROWS.forEach((row, index) => {
    if (row) {
      drawBar(ctx, x, y, width, barHeight, style, color, index, 0);
    } else {
      drawBar(ctx, x, y, segmentWidth, barHeight, style, color, index, 0);
      drawBar(
        ctx,
        x + width - segmentWidth,
        y,
        segmentWidth,
        barHeight,
        style,
        color,
        index,
        1,
      );
    }
    y += barHeight + gap;
  });

  ctx.globalAlpha = 1;
  alpha = 1;
}

class Overture {
  constructor(root, options = {}) {
    this.root = root;
    this.red = options.red || "#E60340";
    this.speed = options.speed ?? 1;
    this.finalWidth = options.markSize ?? 116;
    this.reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const get = (name) => root.querySelector(`[data-ov="${name}"]`);
    this.elements = {
      video: get("video"),
      videoCanvas: get("videoCanvas"),
      canvas: get("canvas"),
      ink: get("ink"),
      inkLetters: Array.from(root.querySelectorAll('[data-ov="ink-letter"]')),
      markHit: get("markHit"),
      hud: get("hud"),
      hudLabel: get("hudLabel"),
      skip: get("skip"),
      replay: get("replay"),
      cursor: get("cursor"),
      soundGate: get("soundGate"),
    };
    this.hover = 0;
    this.hoverTarget = 0;
    this.handoffStarted = false;
    this.audioPrimed = false;
    this.userMuted = false;
    this.continuationVolume = 1;
    root.style.setProperty("--red", this.red);
    this.bind();
    this.build();
    this.elements.video.load();
    if (this.reduceMotion || options.autoplay === false) this.showEndState();
    else this.start();
  }

  bind() {
    this.onResize = () => this.build();
    this.onMove = (event) => {
      const rootRect = this.root.getBoundingClientRect();
      this.elements.cursor.style.transform = `translate(${event.clientX - rootRect.left}px, ${event.clientY - rootRect.top}px)`;
      this.elements.cursor.style.opacity = "1";
      this.hoverTarget = 0;
    };
    this.onSkip = () => this.showEndState();
    this.onReplay = () => this.start();
    this.onSoundRequest = () => {
      if (!this.handoffStarted) {
        void this.primeVideo();
        return;
      }
      if (this.userMuted) return;
      this.userMuted = true;
      this.elements.video.muted = true;
      this.elements.video.volume = 0;
      this.root.classList.remove("is-sound-on");
    };
    window.addEventListener("resize", this.onResize);
    this.root.addEventListener("pointermove", this.onMove);
    this.root.addEventListener("pointerdown", this.onSoundRequest);
    this.elements.skip.addEventListener("click", this.onSkip);
    this.elements.replay.addEventListener("click", this.onReplay);
  }

  build() {
    const canvas = this.elements.canvas;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.width = Math.max(320, canvas.clientWidth);
    this.height = Math.max(320, canvas.clientHeight);
    canvas.width = Math.round(this.width * dpr);
    canvas.height = Math.round(this.height * dpr);
    this.ctx = canvas.getContext("2d");
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.resizeVideoRenderer(dpr);

    const barWidth = 8;
    const barHeight = 5;
    const columnWidth = 10.5;
    const rowPitch = 8;
    const layers = 4;
    const linePitch = Math.max(58, Math.min(84, this.height * 0.096));
    const columns = Math.ceil(this.width / columnWidth) + 1;
    const total = 5 * linePitch + layers * rowPitch;
    const y = Math.round((this.height - total) / 2);
    this.grid = {
      barWidth,
      barHeight,
      columnWidth,
      rowPitch,
      layers,
      linePitch,
      columns,
      x: 0,
      y,
    };
    this.fragments = FRAGMENTS.map(([text, xRatio], index) => [
      text,
      columns * columnWidth * (0.1 + index * 0.19),
      y +
        index * linePitch +
        layers * rowPitch +
        (linePitch - layers * rowPitch) / 2,
    ]);
  }

  start() {
    clearTimeout(this.handoffTimer);
    this.handoffStarted = false;
    this.userMuted = false;
    this.root.classList.remove("is-video-handoff", "is-sound-on");
    cancelAnimationFrame(this.videoRenderFrame);
    this.elements.video.pause();
    this.elements.video.currentTime = 0;
    this.elements.video.muted = false;
    this.elements.video.volume = 1;
    this.time = 0;
    this.lastFrame = 0;
    this.hover = 0;
    this.hoverTarget = 0;
    this.currentStyle = null;
    this.previousStyle = null;
    this.elements.replay.style.opacity = "0";
    this.elements.replay.style.pointerEvents = "none";
    this.elements.skip.style.pointerEvents = "auto";
    this.elements.markHit.style.pointerEvents = "none";
    cancelAnimationFrame(this.animationFrame);
    const step = (timestamp) => {
      if (!this.lastFrame) this.lastFrame = timestamp;
      const delta = Math.min(0.05, (timestamp - this.lastFrame) / 1000);
      this.lastFrame = timestamp;
      this.time += delta * this.speed;
      this.apply(this.time);
      if (this.time >= END) this.finish();
      else this.animationFrame = requestAnimationFrame(step);
    };
    this.animationFrame = requestAnimationFrame(step);
  }

  showEndState() {
    this.time = END;
    this.apply(END);
    this.finish();
  }

  finish() {
    cancelAnimationFrame(this.animationFrame);
    this.time = END;
    this.elements.replay.style.opacity = "0";
    this.elements.replay.style.pointerEvents = "none";
    this.elements.skip.style.opacity = "0";
    this.elements.skip.style.pointerEvents = "none";
    this.elements.markHit.style.pointerEvents = "none";
    this.elements.hud.style.opacity = "0";
    this.root.dispatchEvent(
      new CustomEvent("overture:complete", { bubbles: true }),
    );
    clearTimeout(this.handoffTimer);
    this.beginHandoff();
  }

  beginHandoff() {
    if (this.handoffStarted) return;
    this.handoffStarted = true;
    cancelAnimationFrame(this.animationFrame);
    this.hover = 0;
    this.hoverTarget = 0;
    this.elements.markHit.style.pointerEvents = "none";
    this.root.classList.add("is-video-handoff");
    void this.playVideo();
  }

  resizeVideoRenderer(dpr) {
    const canvas = this.elements.videoCanvas;
    if (!canvas) return;
    const ratio = Math.min(2, dpr || window.devicePixelRatio || 1);
    const width = Math.max(1, canvas.clientWidth);
    const height = Math.max(1, canvas.clientHeight);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    if (!this.videoGl) this.initVideoRenderer();
    if (this.videoGl) this.videoGl.viewport(0, 0, canvas.width, canvas.height);
  }

  initVideoRenderer() {
    const canvas = this.elements.videoCanvas;
    const gl = canvas?.getContext("webgl", {
      alpha: false,
      antialias: false,
      powerPreference: "high-performance",
    });
    if (!gl) {
      this.root.classList.add("no-webgl");
      return;
    }

    const vertexSource = [
      "attribute vec2 a_position;",
      "varying vec2 v_uv;",
      "void main() {",
      "  v_uv = a_position * 0.5 + 0.5;",
      "  gl_Position = vec4(a_position, 0.0, 1.0);",
      "}",
    ].join("\n");
    const fragmentSource = [
      "precision highp float;",
      "uniform sampler2D u_video;",
      "varying vec2 v_uv;",
      "uniform sampler2D u_first;",
      "uniform float u_loopBlend;",
      "void main() {",
      "  vec2 point = v_uv * 2.0 - 1.0;",
      "  float radius = dot(point, point);",
      "  vec2 curved = point * (0.968 + 0.032 * radius);",
      "  vec2 sourceUv = vec2(0.121, 0.043) + (curved * 0.5 + 0.5) * vec2(0.759, 0.914);",
      "  float edge = smoothstep(0.55, 1.35, radius);",
      "  vec2 fringe = vec2(0.00045 * edge, 0.0);",
      "  vec4 base = mix(texture2D(u_video, sourceUv), texture2D(u_first, sourceUv), u_loopBlend);",
      "  float red = mix(texture2D(u_video, sourceUv + fringe).r, texture2D(u_first, sourceUv + fringe).r, u_loopBlend);",
      "  float blue = mix(texture2D(u_video, sourceUv - fringe).b, texture2D(u_first, sourceUv - fringe).b, u_loopBlend);",
      "  vec3 color = vec3(red, base.g, blue);",
      "  color *= 1.0 - 0.12 * smoothstep(0.5, 1.35, radius);",
      "  gl_FragColor = vec4(color, 1.0);",
      "}",
    ].join("\n");

    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(
          gl.getShaderInfoLog(shader) || "Shader compilation failed",
        );
      }
      return shader;
    };

    try {
      const program = gl.createProgram();
      gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSource));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(
          gl.getProgramInfoLog(program) || "Shader linking failed",
        );
      }

      gl.useProgram(program);
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW,
      );
      const position = gl.getAttribLocation(program, "a_position");
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

      const createTexture = () => {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        return texture;
      };
      const texture = createTexture();
      const firstTexture = createTexture();
      gl.uniform1i(gl.getUniformLocation(program, "u_video"), 0);
      gl.uniform1i(gl.getUniformLocation(program, "u_first"), 1);
      gl.clearColor(0.024, 0.024, 0.024, 1);

      this.videoGl = gl;
      this.videoTexture = texture;
      this.firstVideoTexture = firstTexture;
      this.loopBlendUniform = gl.getUniformLocation(program, "u_loopBlend");
      this.firstFrameReady = false;
      this.root.classList.remove("no-webgl");
    } catch {
      this.videoGl = null;
      this.root.classList.add("no-webgl");
    }
  }

  renderVideoFrame() {
    const gl = this.videoGl;
    const video = this.elements.video;
    if (!gl || video.readyState < 2 || !video.videoWidth) return;
    if (video.currentTime === this.lastRenderedVideoTime) return;

    const time = video.currentTime;
    if (this.loopSeeking) return;

    const remaining = VIDEO_LOOP_END - time;
    if (remaining <= 0) {
      if (!video.muted) video.volume = 0;
      this.loopSeeking = true;
      this.videoHasLooped = true;
      video.addEventListener(
        "seeked",
        () => {
          this.loopSeeking = false;
          this.lastRenderedVideoTime = -1;
          void video.play();
        },
        { once: true },
      );
      video.currentTime = 0;
      return;
    }

    this.lastRenderedVideoTime = time;
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.videoTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

    if (!this.firstFrameReady && time < 0.25) {
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.firstVideoTexture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        video,
      );
      this.firstFrameReady = true;
    }

    gl.uniform1f(this.loopBlendUniform, 0);

    if (!video.muted) {
      let loopVolume = 1;
      if (remaining < 0.12) loopVolume = Math.max(0, remaining / 0.12);
      else if (this.videoHasLooped && time < 0.1)
        loopVolume = Math.max(0, time / 0.1);
      video.volume = loopVolume * this.continuationVolume;
    }

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  startVideoRenderer() {
    cancelAnimationFrame(this.videoRenderFrame);
    this.lastRenderedVideoTime = -1;
    this.previousVideoTime = -1;
    this.videoHasLooped = false;
    this.loopSeeking = false;
    const render = () => {
      if (!this.handoffStarted) return;
      this.renderVideoFrame();
      this.videoRenderFrame = requestAnimationFrame(render);
    };
    render();
  }

  async playVideo() {
    const video = this.elements.video;
    video.muted = this.userMuted;
    video.volume = this.continuationVolume;
    this.startVideoRenderer();
    try {
      await video.play();
      this.root.classList.toggle("is-sound-on", !this.userMuted);
    } catch {
      video.muted = true;
      this.userMuted = true;
      video.volume = this.continuationVolume;
      try {
        await video.play();
        this.root.classList.remove("is-sound-on");
      } catch {
        video.pause();
        video.currentTime = 0;
        this.root.classList.remove("is-sound-on");
      }
    }
  }

  async primeVideo() {
    if (this.audioPrimed || this.handoffStarted) return;
    const video = this.elements.video;
    video.muted = false;
    video.volume = 0;
    try {
      await video.play();
      video.pause();
      video.currentTime = 0;
      this.audioPrimed = true;
    } catch {
      this.audioPrimed = false;
    } finally {
      video.volume = 1;
    }
  }

  rest(time) {
    this.hover += (this.hoverTarget - this.hover) * 0.13;
    const width = this.finalWidth * (1 + this.hover * 0.07);
    this.elements.markHit.style.width = `${width * 1.3}px`;
    this.elements.markHit.style.height = `${width * 1.3}px`;
    this.elements.hudLabel.style.color =
      this.hover > 0.5 ? this.red : "#454545";
    const style =
      this.hover > 0.5 ? pickSequence(LOCK_SEQUENCE, time * 0.45) : "solid";
    this.drawFrame(
      time,
      width,
      style,
      this.hover > 0.5 ? this.red : "#fff",
      "rgba(255,255,255,.5)",
    );
  }

  drawFrame(time, width, style, color, ghost) {
    if (style !== this.currentStyle) {
      this.previousStyle = {
        style: this.currentStyle,
        width: this.currentWidth,
        time,
      };
      this.currentStyle = style;
    }
    this.currentWidth = width;
    this.ctx.clearRect(0, 0, this.width, this.height);
    if (this.previousStyle?.style) {
      const age = (time - this.previousStyle.time) / 0.22;
      if (age >= 0 && age < 1) {
        this.ctx.save();
        this.ctx.translate(6, 4);
        drawMark(
          this.ctx,
          this.width / 2,
          this.height / 2,
          this.previousStyle.width,
          this.previousStyle.style,
          ghost,
          0.42 * (1 - age) ** 2,
        );
        this.ctx.restore();
      }
    }
    drawMark(this.ctx, this.width / 2, this.height / 2, width, style, color);
  }

  drawBand(time) {
    const ctx = this.ctx;
    const grid = this.grid;
    // Reach the last visible column on BAND_END, then hold for RED_HOLD.
    const rawDrawProgress = seg(time, BAND_A, BAND_END);
    const drawProgress = rawDrawProgress ** 1.35;
    const front = drawProgress * grid.columns;
    const fast = Math.floor(time * 11);
    const beat = Math.floor(time * 2.5);
    const gapA = Math.floor(grid.columns * 0.42);
    const gapB = Math.floor(grid.columns * 0.58);
    const cut = time >= CUT;
    // Start with velocity on the first black frame instead of easing in.
    const morph = easeOut(seg(time, RED_A, RED_B));
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const markWidth = 78;
    const markBarHeight = Math.round(markWidth * 0.082);
    const markGap = Math.round(markWidth * 0.088);
    const markTotal = 6 * markBarHeight + 5 * markGap;
    const pitch = lerp(grid.linePitch, markBarHeight + markGap, morph);
    const gridX = lerp(grid.x, centerX - markWidth / 2, morph);
    const gridY = lerp(grid.y, centerY - markTotal / 2, morph);
    const scaleX = lerp(
      1,
      markWidth / (grid.columns * grid.columnWidth),
      morph,
    );
    const scaleY = lerp(
      1,
      markBarHeight / (grid.layers * grid.rowPitch),
      morph,
    );
    const barWidth = lerp(grid.barWidth, grid.columnWidth, morph) * scaleX;
    const barHeight = Math.max(
      0.7,
      lerp(grid.barHeight, grid.rowPitch, morph) * scaleY,
    );

    ctx.fillStyle = cut ? "#060606" : this.red;
    ctx.fillRect(0, 0, this.width, this.height);

    const drawField = (color, opacity, offsetX) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = color;
      ctx.translate(offsetX, 0);
      ctx.font = `500 ${grid.barWidth}px "DM Mono", monospace`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      for (let row = 0; row < 6; row += 1) {
        const y = gridY + row * pitch;
        for (let column = 0; column < grid.columns; column += 1) {
          if (!ROWS[row] && column >= gapA && column < gapB) continue;
          const distance = front - column;
          if (distance < 0) continue;
          for (let layer = 0; layer < grid.layers; layer += 1) {
            const seed = row * 10007 + column * 37 + layer * 11;
            if (morph < 0.55 && randomAt(seed) > 0.74 + morph * 0.4) continue;
            if (
              drawProgress < 0.985 &&
              distance < 12 &&
              randomAt(seed + fast * 71) > 0.3 + 0.7 * (distance / 12)
            )
              continue;
            const x = gridX + column * grid.columnWidth * scaleX;
            const cellY = y + layer * grid.rowPitch * scaleY;
            if (!cut && randomAt(seed * 1.7 + beat * 53) < 0.03) {
              ctx.fillText(
                SYMBOLS[
                  Math.floor(randomAt(seed * 2.3 + beat) * SYMBOLS.length)
                ],
                x + barWidth / 2,
                cellY + barHeight / 2,
              );
            } else {
              ctx.fillRect(x, cellY, Math.max(0.7, barWidth), barHeight);
            }
          }
        }
      }
      ctx.restore();
      ctx.globalAlpha = 1;
    };

    const smear = seg(time, CUT, CUT + 0.22);
    if (cut && smear < 1)
      drawField(this.red, 0.55 * (1 - smear), 20 * (1 - smear) + 5);
    drawField(cut ? "#e4e4e4" : "#0d0d0d", 1, 0);

    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = '500 11px "DM Mono", monospace';
    for (const [text, x, y] of cut ? [] : this.fragments) {
      if (front < x / grid.columnWidth + 4) continue;
      const textWidth = ctx.measureText(text).width;
      ctx.fillStyle = "#0d0d0d";
      ctx.fillRect(x - 5, y - 10, textWidth + 11, 20);
      ctx.fillStyle = this.red;
      ctx.fillText(text, x, y);
    }
  }

  apply(time) {
    if (time < RED_B) {
      this.drawBand(time);
      this.currentStyle = null;
      this.previousStyle = null;
    } else {
      let style;
      let color;
      let width;
      if (time < LOCK_A) {
        style = pickSequence(BLACK_SEQUENCE, time - MARK_IN);
        color = "#c8c8c8";
        width = 78;
      } else {
        style = "solid";
        color = "#fff";
        width = 78;
      }
      this.drawFrame(
        time,
        Math.max(1, width),
        style,
        color,
        "rgba(255,255,255,.55)",
      );
    }

    const signatureOut = seg(time, INK_OUT, INK_OUT + 0.4);
    this.elements.ink.style.opacity = String(
      time >= INK_A ? 1 - signatureOut : 0,
    );
    this.elements.ink.style.transform = `translate(-50%, -50%) rotate(${(-3 - signatureOut * 1.6).toFixed(2)}deg)`;
    // Each letter gets its own writing pass. This avoids the glyphs appearing
    // as one rectangular wipe while keeping the uneven rhythm of a real hand.
    const letterDurations = [0.22, 0.2, 0.22, 0.24];
    const letterStarts = [0, 0.24, 0.46, 0.7];
    this.elements.inkLetters.forEach((letter, index) => {
      const progress = easeOut(
        seg(
          time,
          INK_A + letterStarts[index],
          INK_A + letterStarts[index] + letterDurations[index],
        ),
      );
      letter.style.clipPath = `inset(0 ${((1 - progress) * 100).toFixed(1)}% -30% 0)`;
    });
    this.elements.skip.style.opacity = String(
      seg(time, RED_B, RED_B + 0.5) * (1 - seg(time, END - 0.3, END)),
    );
    this.elements.hud.style.opacity = "0";
    this.elements.markHit.style.pointerEvents = "none";
  }

  destroy() {
    cancelAnimationFrame(this.animationFrame);
    window.removeEventListener("resize", this.onResize);
    cancelAnimationFrame(this.videoRenderFrame);
    this.root.removeEventListener("pointermove", this.onMove);
    this.root.removeEventListener("pointerdown", this.onSoundRequest);
    this.elements.skip.removeEventListener("click", this.onSkip);
    this.elements.replay.removeEventListener("click", this.onReplay);
    clearTimeout(this.handoffTimer);
    this.elements.video.pause();
  }
}

const root = document.querySelector("[data-overture]");
if (root) {
  const returningToWork = window.location.hash === "#work";
  window.overture = new Overture(root, { autoplay: !returningToWork });
}

export { Overture };
