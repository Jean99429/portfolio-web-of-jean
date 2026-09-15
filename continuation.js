(function () {
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const easeInOut = (value) =>
  value < 0.5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2;
class Continuation {
  constructor() {
    this.site = document.querySelector("[data-site]");
    this.overture = document.querySelector("[data-overture]");
    if (!this.site || !this.overture) return;
    this.reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    this.coarse = window.matchMedia("(pointer: coarse)").matches;
    this.intro = document.querySelector("[data-intro-sequence]");
    this.screen = this.overture.querySelector(".overture__screen");
    this.left = document.querySelector("[data-intro-left]");
    this.right = document.querySelector("[data-intro-right]");
    this.hint = document.querySelector("[data-intro-hint]");
    this.track = document.querySelector("[data-lab-track]");
    this.lab = document.querySelector("[data-ai-lab]");
    this.introText = [
      ...document.querySelectorAll(".intro-copy [data-scramble]"),
    ];
    this.introProgress = 0;
    this.introSettling = false;
    this.introSettled = false;
    this.introSettleFrame = 0;
    this.lastScrollY = window.scrollY;
    this.framePending = false;
    this.readyBound = () => requestAnimationFrame(() => this.ready());
    this.overture.addEventListener("overture:complete", this.readyBound, {
      once: true,
    });
    if (this.overture.classList.contains("is-video-handoff")) this.ready();
  }
  ready() {
    if (this.isReady) return;
    this.isReady = true;
    this.persistTopNavigation();
    document.body.classList.add("is-ready");
    this.site.classList.add("is-ready");
    if (!this.reduced)
      this.introText.forEach((node) => (node.textContent = ""));
    this.initLabGL();
    this.buildMedia();
    this.bindInteractions();
    this.bindEnding();
    this.initEndingMark();
    this.onScroll = () => {
      const nextScrollY = window.scrollY;
      const movingDown = nextScrollY > this.lastScrollY + 1;
      this.lastScrollY = nextScrollY;
      if (movingDown) this.settleIntro();
      this.requestFrame();
    };
    this.onResize = () => {
      this.buildMedia();
      this.requestFrame();
    };
    window.addEventListener("scroll", this.onScroll, { passive: true });
    window.addEventListener("resize", this.onResize);
    this.requestFrame();
    this.armAutoShrink();
  }
  persistTopNavigation() {
    const canvas = this.overture.querySelector(".overture__canvas");
    const glass = this.overture.querySelector(".top-nav__glass");
    const nav = this.overture.querySelector(".top-nav");
    if (
      !canvas ||
      !glass ||
      !nav ||
      canvas.classList.contains("is-persistent-mark")
    )
      return;
    canvas.classList.add("is-persistent-mark");
    this.site.append(glass, canvas, nav);
  }
  requestFrame() {
    if (this.framePending) return;
    this.framePending = true;
    requestAnimationFrame(() => {
      this.framePending = false;
      this.frame();
    });
  }
  random(seed) {
    let value = seed * 9301 + 49297;
    return () => {
      ((value = value * 9301 + 49297), (value %= 233280));
      return value / 233280;
    };
  }
  source(seed, width, height) {
    const canvas = document.createElement("canvas"),
      context = canvas.getContext("2d"),
      random = this.random(seed + 3);
    canvas.width = width;
    canvas.height = height;
    context.fillStyle = "#101010";
    context.fillRect(0, 0, width, height);
    for (let index = 0; index < 6; index += 1) {
      const x = random() * width,
        y = random() * height,
        radius = (0.25 + random() * 0.5) * Math.max(width, height),
        gradient = context.createRadialGradient(x, y, 0, x, y, radius),
        tone = Math.round(70 + random() * 150);
      gradient.addColorStop(
        0,
        `rgba(${tone},${tone},${tone},${0.5 + random() * 0.4})`,
      );
      gradient.addColorStop(1, "rgba(0,0,0,0)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
    }
    const band = height * (0.42 + random() * 0.25),
      gradient = context.createLinearGradient(
        0,
        band - height * 0.1,
        0,
        band + height * 0.34,
      );
    gradient.addColorStop(0, "rgba(255,255,255,0)");
    gradient.addColorStop(0.35, "rgba(235,235,235,.82)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
    for (let index = 0; index < 3; index += 1) {
      context.fillStyle = `rgba(230,3,64,${0.55 + random() * 0.4})`;
      context.beginPath();
      context.arc(
        random() * width,
        random() * height,
        Math.max(3, width * 0.006),
        0,
        Math.PI * 2,
      );
      context.fill();
    }
    return canvas;
  }
  decompose(source, width, height, monochrome = false, pixelRatio = 1) {
    const output = document.createElement("canvas"),
      context = output.getContext("2d"),
      sample = document.createElement("canvas"),
      sampleContext = sample.getContext("2d"),
      step = 6 * pixelRatio,
      ramp = ["·", ":", "=", "+", "<", ">", "/", "A", "O", "N"];
    output.width = width;
    output.height = height;
    sample.width = Math.max(1, Math.round(width / step));
    sample.height = Math.max(1, Math.round(height / step));
    sampleContext.drawImage(source, 0, 0, sample.width, sample.height);
    const pixels = sampleContext.getImageData(
      0,
      0,
      sample.width,
      sample.height,
    ).data;
    context.fillStyle = "#060606";
    context.fillRect(0, 0, width, height);
    context.font = `500 ${step * 1.05}px "DM Mono", monospace`;
    context.textBaseline = "middle";
    context.textAlign = "center";
    for (let y = 0; y < sample.height; y += 1)
      for (let x = 0; x < sample.width; x += 1) {
        const index = (y * sample.width + x) * 4,
          red = pixels[index],
          green = pixels[index + 1],
          blue = pixels[index + 2],
          light = (red * 0.299 + green * 0.587 + blue * 0.114) / 255;
        if (light < 0.06) continue;
        const px = x * step + step / 2,
          py = y * step + step / 2,
          isRed = !monochrome && red > 150 && red > green * 1.7;
        context.fillStyle = isRed
          ? "#e60340"
          : `rgba(210,210,210,${0.22 + light * 0.68})`;
        context.fillText(
          ramp[Math.min(ramp.length - 1, Math.floor(light * ramp.length))],
          px,
          py,
        );
      }
    return output;
  }
  layer(host, source, className = "", extra = "") {
    const canvas = document.createElement("canvas");
    canvas.width = source.width;
    canvas.height = source.height;
    canvas.getContext("2d").drawImage(source, 0, 0);
    canvas.className = `generated-layer ${className}`;
    if (extra) canvas.style.cssText += extra;
    host.appendChild(canvas);
    return canvas;
  }
  coverSource(host, width, height) {
    const path = host.dataset.coverSrc;
    if (!path) return null;
    if (host.coverImage) {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(host.coverImage, 0, 0, width, height);
      return canvas;
    }
    if (!host.coverLoading) {
      host.coverLoading = true;
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        host.coverImage = image;
        delete host.dataset.mediaWidth;
        delete host.dataset.mediaHeight;
        this.buildMedia();
        this.requestFrame();
      };
      image.src = path;
    }
    return null;
  }
  asciiSource(host, width, height) {
    const path = host.dataset.asciiSrc;
    if (!path) return null;
    if (host.asciiImage) {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(host.asciiImage, 0, 0, width, height);
      return canvas;
    }
    if (!host.asciiLoading) {
      host.asciiLoading = true;
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        host.asciiImage = image;
        delete host.dataset.mediaWidth;
        delete host.dataset.mediaHeight;
        this.buildMedia();
        this.requestFrame();
      };
      image.src = path;
    }
    return null;
  }
  initLabGL() {
    const canvas = document.createElement("canvas");
    canvas.style.cssText =
      "position:fixed;inset:0;width:100vw;height:100svh;pointer-events:none;z-index:5;display:none;";
    document.body.appendChild(canvas);
    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
    });
    if (!gl) return;
    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };
    const vertex = compile(
      gl.VERTEX_SHADER,
      `precision highp float;
attribute vec2 uv;
uniform vec2 uResolution;
uniform vec4 uRect;
uniform float uBandCenter;
uniform float uFan;
uniform float uEdgeZone;
uniform float uEdgePow;
uniform float uLeftGate;
uniform float uRightGate;
varying vec2 vUv;
varying float vEdge;
void main() {
  vUv = uv;
  vec2 screen = uRect.xy + vec2(uv.x, 1.0 - uv.y) * uRect.zw;
  float sx = screen.x / uResolution.x;
  float dist = min(sx, 1.0 - sx);
  float edge = pow(smoothstep(uEdgeZone, 0.0, dist), uEdgePow);
  edge *= mix(uLeftGate, uRightGate, step(0.5, sx));
  float blend = smoothstep(0.0002, 0.0003, edge);
  float y = uBandCenter + (screen.y - uBandCenter) * (1.0 + uFan * edge * blend);
  float nx = sx * 2.0 - 1.0;
  float ny = 1.0 - y / uResolution.y * 2.0;
  gl_Position = vec4(nx, ny, 0.0, 1.0);
  vEdge = edge;
}`,
    );
    const fragment = compile(
      gl.FRAGMENT_SHADER,
      `precision highp float;
uniform sampler2D tMap;
uniform float uChroma;
varying vec2 vUv;
varying float vEdge;
void main() {
  vec4 base = texture2D(tMap, vUv);
  float seam = smoothstep(0.0002, 0.0003, vEdge);
  float fx = smoothstep(0.0003, 0.012, vEdge);
  float ca = uChroma * fx * (0.4 + vEdge);
  float r = texture2D(tMap, vUv + vec2(0.0, ca)).r;
  float b = texture2D(tMap, vUv - vec2(0.0, ca)).b;
  vec3 rgb = mix(base.rgb, vec3(r, base.g, b), fx);
  gl_FragColor = vec4(rgb * base.a, base.a) * seam;
}`,
    );
    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    const segW = 48,
      segH = 14,
      uvs = [],
      indices = [];
    for (let row = 0; row <= segH; row += 1)
      for (let col = 0; col <= segW; col += 1)
        uvs.push(col / segW, 1 - row / segH);
    for (let row = 0; row < segH; row += 1)
      for (let col = 0; col < segW; col += 1) {
        const a = row * (segW + 1) + col,
          b = a + 1,
          c = a + segW + 1,
          d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    const uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      gl.STATIC_DRAW,
    );
    const uvLocation = gl.getAttribLocation(program, "uv");
    const uniforms = {};
    [
      "uResolution",
      "uRect",
      "uBandCenter",
      "uFan",
      "uEdgeZone",
      "uEdgePow",
      "uLeftGate",
      "uRightGate",
      "uChroma",
      "tMap",
    ].forEach((name) => (uniforms[name] = gl.getUniformLocation(program, name)));
    this.labGL = {
      canvas,
      gl,
      program,
      uvBuffer,
      indexBuffer,
      uvLocation,
      uniforms,
      indexCount: indices.length,
      dpr: Math.min(window.devicePixelRatio || 1, 3),
      width: 0,
      height: 0,
    };
  }
  createLabTexture(source) {
    if (!this.labGL) return null;
    const { gl } = this.labGL;
    const texture = gl.createTexture();
    try {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        source,
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      return texture;
    } catch {
      gl.deleteTexture(texture);
      return null;
    }
  }
  buildMedia() {
    if (this.labGL && this.labItems)
      this.labItems.forEach((item) => {
        if (item.texture) this.labGL.gl.deleteTexture(item.texture);
      });
    this.labItems = [];
    document
      .querySelectorAll("[data-generated-media]")
      .forEach((host, index) => {
        const bounds = host.getBoundingClientRect(),
          labItem = host.closest("[data-lab-item]"),
          deviceScale = Math.min(window.devicePixelRatio || 1, 2),
          scale = Math.min(deviceScale, 2400 / Math.max(1, bounds.width)),
          width = Math.max(2, Math.round(bounds.width * scale)),
          height = Math.max(2, Math.round(bounds.height * scale));
        if (
          host.dataset.mediaWidth === String(width) &&
          host.dataset.mediaHeight === String(height) &&
          host.children.length &&
          !labItem
        ) return;
        host.dataset.mediaWidth = String(width);
        host.dataset.mediaHeight = String(height);
        host.replaceChildren();
        const source =
          this.coverSource(host, width, height) ||
          this.source(index * 17 + 5, width, height);
        if (labItem) {
          const clear = this.layer(host, source, "generated-layer--lab");
          this.labItems.push({
            host: labItem,
            media: host,
            clear,
            texture: this.createLabTexture(source),
          });
        } else {
          const ascii =
            this.asciiSource(host, width, height) ||
            this.decompose(source, width, height, true, scale);
          this.layer(host, ascii);
          const clear = this.layer(host, source, "generated-layer--clear");
          host.clearLayer = clear;
        }
      });
  }
  bindInteractions() {
    if (this.interactionsBound) return;
    this.interactionsBound = true;
    this.projects = [...document.querySelectorAll("[data-project]")];
    this.buildProjectRail();
    this.projects.forEach((project) => {
      const media = project.querySelector("[data-generated-media]");
      media.addEventListener("pointerenter", () => {
        if (media.clearLayer) media.clearLayer.style.opacity = "1";
      });
      media.addEventListener("pointerleave", () => {
        if (media.clearLayer) media.clearLayer.style.opacity = "0";
      });
    });
    document.querySelectorAll("[data-lab-item]").forEach((item) => {
      item.addEventListener("pointerenter", () => {
        item.hovered = true;
        this.requestFrame();
      });
      item.addEventListener("pointerleave", () => {
        item.hovered = false;
        this.requestFrame();
      });
    });
    const cursor = document.querySelector("[data-site-cursor]"),
      hand = document.querySelector("[data-site-hand]"),
      viewCursor = document.querySelector("[data-site-view-cursor]"),
      viewArrow = document.querySelector("[data-site-view-arrow]"),
      viewLabel = document.querySelector("[data-site-view-label]");
    if (!this.coarse)
      window.addEventListener(
        "pointermove",
        (event) => {
          cursor.style.transform = `translate(${event.clientX}px,${event.clientY}px)`;
          const target = event.target.closest?.("[data-hand]"),
            viewTarget = event.target.closest?.("[data-view-case]");
          const showScrollPrompt =
            this.isReady &&
            this.introProgress < 0.42 &&
            !target &&
            !viewTarget;
          this.site.classList.toggle("has-scroll-cursor", showScrollPrompt);
          if (viewTarget && window.scrollY > 4) {
            viewArrow.textContent = "↗";
            viewLabel.textContent = "VIEW CASE";
            viewCursor.style.left = `${event.clientX}px`;
            viewCursor.style.top = `${Math.max(18, Math.min(window.innerHeight - 18, event.clientY))}px`;
            viewCursor.classList.toggle(
              "is-left",
              event.clientX > window.innerWidth - 128,
            );
            viewCursor.classList.add("is-visible");
            hand.style.opacity = "0";
            cursor.style.opacity = "0";
          } else if (target && window.scrollY > 4) {
            viewCursor.classList.remove("is-visible");
            hand.textContent = target.dataset.hand;
            hand.style.left = `${event.clientX}px`;
            hand.style.top = `${event.clientY}px`;
            hand.style.opacity = "1";
            cursor.style.opacity = "0";
          } else if (showScrollPrompt) {
            viewArrow.textContent = "↓";
            viewLabel.textContent = "SCROLL DOWN";
            viewCursor.style.left = `${event.clientX}px`;
            viewCursor.style.top = `${Math.max(18, Math.min(window.innerHeight - 18, event.clientY))}px`;
            viewCursor.classList.toggle(
              "is-left",
              event.clientX > window.innerWidth - 140,
            );
            viewCursor.classList.add("is-visible");
            hand.style.opacity = "0";
            cursor.style.opacity = "0";
          } else {
            viewCursor.classList.remove("is-visible");
            hand.style.opacity = "0";
            cursor.style.opacity = "0";
          }
        },
        { passive: true },
      );
  }
  scramble(node, progress) {
    const full = node.dataset.scramble;
    if (progress >= 1) {
      node.textContent = full;
      return;
    }
    if (progress <= 0) {
      node.textContent = "";
      return;
    }
    const glyphs = "/=+:<>;·",
      resolved = Math.floor(full.length * progress);
    node.textContent = [...full]
      .map((character, index) =>
        index < resolved
          ? character
          : index < resolved + 6
            ? glyphs[(index * 7 + Math.floor(progress * 40)) % glyphs.length]
            : " ",
      )
      .join("");
  }
  bindEnding() {
    const ending = document.querySelector("[data-ending]"),
      nodes = [...ending.querySelectorAll("[data-scramble]")];
    if (this.reduced) return;
    nodes.forEach((node) => (node.textContent = ""));
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting) || this.endingPlayed)
          return;
        this.endingPlayed = true;
        const start = performance.now(),
          tick = () => {
            const progress = clamp((performance.now() - start) / 700);
            nodes.forEach((node) => this.scramble(node, progress));
            if (progress < 1) requestAnimationFrame(tick);
          };
        tick();
      },
      { threshold: 0.55 },
    );
    observer.observe(ending);
  }
  initEndingMark() {
    const container = document.querySelector("[data-ending-mark3d]");
    if (!container) return;
    const canvas = document.createElement("canvas");
    container.appendChild(canvas);
    const gl = canvas.getContext("webgl", { antialias: true, alpha: true });
    if (!gl) return;
    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };
    const link = (vsSource, fsSource) => {
      const program = gl.createProgram();
      gl.attachShader(program, compile(gl.VERTEX_SHADER, vsSource));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fsSource));
      gl.linkProgram(program);
      return program;
    };
    const sceneProgram = link(
      `attribute vec3 position;
attribute vec3 normal;
uniform mat4 uMVP;
uniform mat4 uNormalMatrix;
varying vec3 vNormal;
void main() {
  vNormal = normalize(mat3(uNormalMatrix) * normal);
  gl_Position = uMVP * vec4(position, 1.0);
}`,
      `precision highp float;
varying vec3 vNormal;
uniform vec3 uLightDir;
uniform float uAmbient;
void main() {
  float diff = dot(normalize(vNormal), normalize(uLightDir)) * 0.5 + 0.5;
  float shade = uAmbient + diff * (1.0 - uAmbient);
  gl_FragColor = vec4(vec3(shade), 1.0);
}`,
    );
    const asciiProgram = link(
      `attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`,
      `precision highp float;
uniform sampler2D tScene;
uniform sampler2D tChars;
uniform float uGranularity;
uniform float uCharCount;
varying vec2 vUv;
void main() {
  vec2 d = vec2(1.0 / uGranularity);
  vec2 cellUv = d * (floor(vUv / d) + 0.5);
  vec3 sceneColor = texture2D(tScene, cellUv).rgb;
  float gray = sceneColor.r;
  float contrast = pow(gray, 1.25);
  float charIndex = floor(contrast * (uCharCount - 1.0) + 0.0001);
  vec2 cellLocal = mod(vUv, d) / d;
  vec2 glyphUv = vec2((charIndex + cellLocal.x) / uCharCount, cellLocal.y);
  vec4 glyph = texture2D(tChars, glyphUv);
  gl_FragColor = vec4(vec3(0.902, 0.012, 0.251), glyph.a * step(0.015, gray));
}`,
    );
    const cube = (() => {
      const faces = [
        { n: [0, 0, 1], v: [[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]] },
        { n: [0, 0, -1], v: [[.5,-.5,-.5],[-.5,-.5,-.5],[-.5,.5,-.5],[.5,.5,-.5]] },
        { n: [1, 0, 0], v: [[.5,-.5,.5],[.5,-.5,-.5],[.5,.5,-.5],[.5,.5,.5]] },
        { n: [-1, 0, 0], v: [[-.5,-.5,-.5],[-.5,-.5,.5],[-.5,.5,.5],[-.5,.5,-.5]] },
        { n: [0, 1, 0], v: [[-.5,.5,.5],[.5,.5,.5],[.5,.5,-.5],[-.5,.5,-.5]] },
        { n: [0, -1, 0], v: [[-.5,-.5,-.5],[.5,-.5,-.5],[.5,-.5,.5],[-.5,-.5,.5]] },
      ];
      const data = [];
      faces.forEach(({ n, v }) => {
        const [a, b, c, d] = v;
        [a, b, c, a, c, d].forEach((p) =>
          data.push(p[0], p[1], p[2], n[0], n[1], n[2]),
        );
      });
      return new Float32Array(data);
    })();
    const cubeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cube, gl.STATIC_DRAW);
    const cubeVertexCount = cube.length / 6;
    const rows = [0, 1, 1, 1, 0, 1],
      width = 2,
      barHeight = width * 0.082,
      gap = width * 0.088,
      segmentWidth = width * 0.375,
      depth = barHeight * 2.2,
      total = 6 * barHeight + 5 * gap,
      boxes = [];
    rows.forEach((row, index) => {
      const y = total / 2 - barHeight / 2 - index * (barHeight + gap);
      if (row) {
        boxes.push({ x: 0, y, sx: width, sy: barHeight, sz: depth });
      } else {
        boxes.push({
          x: -width / 2 + segmentWidth / 2,
          y,
          sx: segmentWidth,
          sy: barHeight,
          sz: depth,
        });
        boxes.push({
          x: width / 2 - segmentWidth / 2,
          y,
          sx: segmentWidth,
          sy: barHeight,
          sz: depth,
        });
      }
    });
    const ramp = [" ", "~", ">", ".", ":", "+", "*", "S", "%", "#"],
      cell = 64,
      atlasCanvas = document.createElement("canvas");
    atlasCanvas.width = cell * ramp.length;
    atlasCanvas.height = cell;
    const atlasCtx = atlasCanvas.getContext("2d");
    atlasCtx.fillStyle = "#fff";
    atlasCtx.font = `700 ${cell * 0.72}px "IBM Plex Mono", monospace`;
    atlasCtx.textAlign = "center";
    atlasCtx.textBaseline = "middle";
    ramp.forEach((ch, i) =>
      atlasCtx.fillText(ch, i * cell + cell / 2, cell / 2 + cell * 0.04),
    );
    const charsTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, charsTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlasCanvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    const sceneSize = 512,
      sceneTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, sceneTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      sceneSize,
      sceneSize,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    const depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(
      gl.RENDERBUFFER,
      gl.DEPTH_COMPONENT16,
      sceneSize,
      sceneSize,
    );
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      sceneTexture,
      0,
    );
    gl.framebufferRenderbuffer(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.RENDERBUFFER,
      depthBuffer,
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    const quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const mat4 = {
      multiply: (a, b) => {
        const out = new Float32Array(16);
        for (let col = 0; col < 4; col++)
          for (let row = 0; row < 4; row++) {
            let sum = 0;
            for (let k = 0; k < 4; k++) sum += a[k * 4 + row] * b[col * 4 + k];
            out[col * 4 + row] = sum;
          }
        return out;
      },
      perspective: (fovy, aspect, near, far) => {
        const f = 1 / Math.tan(fovy / 2),
          out = new Float32Array(16);
        out[0] = f / aspect;
        out[5] = f;
        out[10] = (far + near) / (near - far);
        out[11] = -1;
        out[14] = (2 * far * near) / (near - far);
        return out;
      },
      translate: (x, y, z) =>
        new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]),
      scale: (x, y, z) =>
        new Float32Array([x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1]),
      rotateY: (a) => {
        const c = Math.cos(a),
          s = Math.sin(a);
        return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]);
      },
      rotateX: (a) => {
        const c = Math.cos(a),
          s = Math.sin(a);
        return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]);
      },
    };
    this.endingMark = {
      canvas,
      gl,
      container,
      sceneProgram,
      asciiProgram,
      cubeBuffer,
      cubeVertexCount,
      quadBuffer,
      boxes,
      charsTexture,
      sceneTexture,
      framebuffer,
      sceneSize,
      mat4,
      projection: mat4.perspective((32 * Math.PI) / 180, 1, 0.1, 20),
      view: mat4.translate(0, 0, -5.4),
      scenePositionLoc: gl.getAttribLocation(sceneProgram, "position"),
      sceneNormalLoc: gl.getAttribLocation(sceneProgram, "normal"),
      sceneUniforms: {
        uMVP: gl.getUniformLocation(sceneProgram, "uMVP"),
        uNormalMatrix: gl.getUniformLocation(sceneProgram, "uNormalMatrix"),
        uLightDir: gl.getUniformLocation(sceneProgram, "uLightDir"),
        uAmbient: gl.getUniformLocation(sceneProgram, "uAmbient"),
      },
      asciiPositionLoc: gl.getAttribLocation(asciiProgram, "position"),
      asciiUniforms: {
        tScene: gl.getUniformLocation(asciiProgram, "tScene"),
        tChars: gl.getUniformLocation(asciiProgram, "tChars"),
        uGranularity: gl.getUniformLocation(asciiProgram, "uGranularity"),
        uCharCount: gl.getUniformLocation(asciiProgram, "uCharCount"),
      },
      rampLength: ramp.length,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      width: 0,
      height: 0,
    };
    const tick = (time) => {
      this.renderEndingMark(time);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  renderEndingMark(time) {
    const state = this.endingMark;
    if (!state) return;
    const rect = state.container.getBoundingClientRect(),
      visible = rect.bottom > 0 && rect.top < window.innerHeight;
    if (!visible) return;
    const { gl } = state,
      width = Math.min(2000, Math.max(1, Math.round(rect.width * state.dpr))),
      height = Math.min(2000, Math.max(1, Math.round(rect.height * state.dpr)));
    if (state.width !== width || state.height !== height) {
      state.canvas.width = width;
      state.canvas.height = height;
      state.width = width;
      state.height = height;
    }
    const angle = (time || 0) * 0.00025,
      groupRotation = state.mat4.rotateY(angle),
      viewProjection = state.mat4.multiply(state.projection, state.view);
    gl.bindFramebuffer(gl.FRAMEBUFFER, state.framebuffer);
    gl.viewport(0, 0, state.sceneSize, state.sceneSize);
    gl.disable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(state.sceneProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, state.cubeBuffer);
    gl.enableVertexAttribArray(state.scenePositionLoc);
    gl.vertexAttribPointer(state.scenePositionLoc, 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(state.sceneNormalLoc);
    gl.vertexAttribPointer(state.sceneNormalLoc, 3, gl.FLOAT, false, 24, 12);
    gl.uniform3f(state.sceneUniforms.uLightDir, 0.4, 0.8, 0.6);
    gl.uniform1f(state.sceneUniforms.uAmbient, 0.24);
    gl.uniformMatrix4fv(state.sceneUniforms.uNormalMatrix, false, groupRotation);
    state.boxes.forEach((box) => {
      const local = state.mat4.multiply(
          state.mat4.translate(box.x, box.y, 0),
          state.mat4.scale(box.sx, box.sy, box.sz),
        ),
        world = state.mat4.multiply(groupRotation, local),
        mvp = state.mat4.multiply(viewProjection, world);
      gl.uniformMatrix4fv(state.sceneUniforms.uMVP, false, mvp);
      gl.drawArrays(gl.TRIANGLES, 0, state.cubeVertexCount);
    });
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, state.width, state.height);
    gl.disable(gl.DEPTH_TEST);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(state.asciiProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, state.quadBuffer);
    gl.enableVertexAttribArray(state.asciiPositionLoc);
    gl.vertexAttribPointer(state.asciiPositionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, state.sceneTexture);
    gl.uniform1i(state.asciiUniforms.tScene, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, state.charsTexture);
    gl.uniform1i(state.asciiUniforms.tChars, 1);
    gl.uniform1f(state.asciiUniforms.uGranularity, 44);
    gl.uniform1f(state.asciiUniforms.uCharCount, state.rampLength);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  settleIntro() {
    if (this.reduced || this.introSettling || this.introSettled) return;
    const viewportHeight = window.innerHeight;
    const introRange = Math.max(1, this.intro.offsetHeight - viewportHeight);
    const progress = clamp(
      (window.scrollY - this.intro.offsetTop) / introRange,
    );
    if (progress >= 0.68) {
      this.introSettled = true;
      return;
    }
    if (progress < 0.005) return;
    this.introSettling = true;
    clearTimeout(this.autoTimer);
    const from = window.scrollY;
    const target = this.intro.offsetTop + introRange * 0.68;
    if (window.siteSmoothScroll) {
      window.siteSmoothScroll.scrollTo(target, {
        duration: 1.15,
        easing: easeInOut,
        onComplete: () => {
          this.introSettling = false;
          this.introSettled = true;
          this.requestFrame();
        },
      });
      return;
    }
    const started = performance.now();
    const duration = 1150;
    const tick = (now) => {
      const elapsed = clamp((now - started) / duration);
      const next = from + (target - from) * easeInOut(elapsed);
      this.lastScrollY = next;
      window.scrollTo(0, next);
      this.requestFrame();
      if (elapsed < 1) {
        this.introSettleFrame = requestAnimationFrame(tick);
      } else {
        this.introSettling = false;
        this.introSettled = true;
      }
    };
    cancelAnimationFrame(this.introSettleFrame);
    this.introSettleFrame = requestAnimationFrame(tick);
  }
  buildProjectRail() {
    const list = document.querySelector(".project-list");
    if (!list || list.querySelector(".project-copy-rail")) return;
    const rail = document.createElement("div");
    rail.className = "project-copy-rail";
    rail.style.gridRow = `1 / span ${this.projects.length + 2}`;
    const label = list.querySelector("[data-rail-label]");
    if (label) rail.appendChild(label);
    this.projectCopies = this.projects.map((project, index) => {
      const copy = project.querySelector(".project__copy");
      copy.dataset.projectState = index === 0 ? "current" : "future";
      rail.appendChild(copy);
      project.style.gridRow = String(index + 2);
      return copy;
    });
    list.prepend(rail);
  }
  armAutoShrink() {
    if (this.reduced) return;
    const cancel = () => {
      clearTimeout(this.autoTimer);
      window.removeEventListener("wheel", cancel);
    };
    window.addEventListener("wheel", cancel, { once: true, passive: true });
    this.autoTimer = setTimeout(() => {
      if (window.scrollY >= 5) return;
      const target = window.innerHeight * 1.35;
      if (window.siteSmoothScroll) {
        window.siteSmoothScroll.scrollTo(target, {
          duration: 1.4,
          easing: easeInOut,
        });
      } else {
        window.scrollTo({ top: target, behavior: "smooth" });
      }
    }, 11105);
  }
  frame() {
    const viewportHeight = window.innerHeight,
      viewportWidth = window.innerWidth,
      narrow = viewportWidth <= 900,
      introRange = Math.max(1, this.intro.offsetHeight - viewportHeight),
      progress = clamp((window.scrollY - this.intro.offsetTop) / introRange),
      shrink = easeInOut(clamp(progress / 0.38)),
      base = Math.min(viewportWidth * 0.72, viewportHeight * 1.323),
      target = narrow
        ? viewportWidth * 0.74
        : Math.max(260, viewportWidth * 0.28),
      scale = 1 + (target / base - 1) * shrink,
      offset = (narrow ? -0.24 : 0) * viewportHeight * shrink;
    this.introProgress = progress;
    const navProgress = this.reduced
      ? 1
      : easeInOut(clamp((progress - 0.02) / 0.34));
    const navMaxWidth = Math.min(398, viewportWidth - 24);
    const navWidth = 42 + (navMaxWidth - 42) * navProgress;
    const navLinks = clamp((navProgress - 0.46) / 0.54);
    this.site.style.setProperty("--top-nav-progress", navProgress.toFixed(4));
    this.site.style.setProperty("--top-nav-width", `${navWidth.toFixed(2)}px`);
    this.site.style.setProperty("--top-nav-links", navLinks.toFixed(4));
    this.screen.style.transform = `translate(-50%,-50%) translateY(${offset.toFixed(2)}px) scale(${scale.toFixed(4)})`;
    this.hint.style.opacity = String(
      (1 - clamp(progress / 0.2)) * (this.isReady ? 1 : 0),
    );
    const copyProgress = this.reduced ? 1 : clamp((progress - 0.34) / 0.22);
    this.left.style.opacity = copyProgress > 0 ? "1" : "0";
    this.left.style.pointerEvents = copyProgress > 0 ? "auto" : "none";
    this.right.style.opacity = copyProgress > 0 ? "1" : "0";
    this.site.classList.toggle("is-hand-writing", copyProgress > 0.01);
    if (!this.reduced)
      this.introText.forEach((node) => this.scramble(node, copyProgress));
    if (window.overture) {
      // Fade the opening audio out before the About copy becomes visible.
      // The video keeps moving as a visual element, but is silent on this page.
      window.overture.continuationVolume =
        1 - clamp((progress - 0.24) / 0.1);
    }
    const projectsSection = document.querySelector(".projects"),
      projectList = projectsSection?.querySelector(".project-list"),
      projectFocus = this.projects || [
        ...document.querySelectorAll("[data-project]"),
      ],
      sectionBounds = projectsSection?.getBoundingClientRect(),
      firstProjectBounds = projectFocus[0]?.getBoundingClientRect(),
      lastProjectBounds = projectFocus.at(-1)?.getBoundingClientRect(),
      projectsVisible =
        sectionBounds &&
        sectionBounds.top < viewportHeight * 0.82 &&
        sectionBounds.bottom > viewportHeight * 0.12,
      copyReady =
        firstProjectBounds &&
        firstProjectBounds.top < viewportHeight * 0.72 &&
        sectionBounds.bottom > viewportHeight * 0.12;
    projectsSection?.classList.toggle("is-projects-visible", Boolean(projectsVisible));
    projectsSection?.classList.toggle("is-project-copy-ready", Boolean(copyReady));
    if (projectList && lastProjectBounds) {
      const railExitY = Math.min(
        0,
        lastProjectBounds.top + lastProjectBounds.height / 2 - viewportHeight / 2,
      );
      projectList.style.setProperty(
        "--project-rail-exit-y",
        `${railExitY.toFixed(1)}px`,
      );
    }
    let activeIndex = 0;
    let activeDistance = Infinity;
    projectFocus.forEach((project, index) => {
      const bounds = project.getBoundingClientRect();
      const crossesCenter =
        bounds.top <= viewportHeight / 2 && bounds.bottom > viewportHeight / 2;
      const distance = Math.abs(
        bounds.top + bounds.height / 2 - viewportHeight / 2,
      );
      if (crossesCenter || distance < activeDistance) {
        activeDistance = crossesCenter ? -1 : distance;
        activeIndex = index;
      }
    });
    projectFocus.forEach((project, index) => {
      project.classList.toggle("is-project-active", index === activeIndex);
      const copy = this.projectCopies?.[index];
      if (!copy) return;
      copy.classList.toggle("is-project-copy-active", index === activeIndex);
      copy.dataset.projectState =
        index < activeIndex
          ? "past"
          : index > activeIndex
            ? "future"
            : "current";
    });
    if (this.coarse || narrow) {
      const projects = [...document.querySelectorAll("[data-project]")];
      let closest = null,
        distance = Infinity;
      projects.forEach((project) => {
        const bounds = project.getBoundingClientRect(),
          next = Math.abs(bounds.top + bounds.height / 2 - viewportHeight / 2);
        if (next < distance) {
          closest = project;
          distance = next;
        }
      });
      projects.forEach((project) => {
        const media = project.querySelector("[data-generated-media]");
        if (media.clearLayer)
          media.clearLayer.style.opacity =
            project === closest && distance < viewportHeight * 0.6 ? "1" : "0";
      });
    }
    if (!this.reduced) {
      const labRange = Math.max(1, this.lab.offsetHeight - viewportHeight),
        labProgress = clamp((window.scrollY - this.lab.offsetTop) / labRange),
        distance = Math.max(0, this.track.scrollWidth - viewportWidth),
        labDomItems = [...document.querySelectorAll("[data-lab-item]")];
      this.track.style.transform = `translateY(-50%) translateX(${(-distance * labProgress).toFixed(1)}px)`;
      const labCopies = [...document.querySelectorAll("[data-lab-copy]")];
      let activeLabIndex = 0,
        activeLabDistance = Infinity;
      labDomItems.forEach((item, index) => {
        const bounds = item.getBoundingClientRect();
        if (index < labCopies.length) {
          const itemCenter = bounds.left + bounds.width / 2,
            distanceFromCenter = Math.abs(itemCenter - viewportWidth / 2);
          if (distanceFromCenter < activeLabDistance) {
            activeLabDistance = distanceFromCenter;
            activeLabIndex = index;
          }
        }
        item.style.transform = "";
      });
      labCopies.forEach((copy, index) => {
        copy.classList.toggle("is-lab-copy-active", index === activeLabIndex);
        copy.dataset.labState =
          index < activeLabIndex
            ? "past"
            : index > activeLabIndex
              ? "future"
              : "current";
      });
      this.renderLabGL(viewportWidth, viewportHeight);
    }
  }
  renderLabGL(viewportWidth, viewportHeight) {
    const state = this.labGL;
    if (!state || !this.labItems.length) return;
    const labBounds = this.lab.getBoundingClientRect(),
      labVisible = labBounds.bottom > 0 && labBounds.top < viewportHeight;
    if (!labVisible) {
      state.canvas.style.display = "none";
      return;
    }
    state.canvas.style.display = "block";
    const dpr = state.dpr,
      width = Math.round(viewportWidth * dpr),
      height = Math.round(viewportHeight * dpr);
    if (state.width !== width || state.height !== height) {
      state.canvas.width = width;
      state.canvas.height = height;
      state.width = width;
      state.height = height;
    }
    const { gl, uniforms } = state;
    gl.viewport(0, 0, width, height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(state.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, state.uvBuffer);
    gl.enableVertexAttribArray(state.uvLocation);
    gl.vertexAttribPointer(state.uvLocation, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, state.indexBuffer);
    const trackBounds = this.track.getBoundingClientRect(),
      bandCenter = trackBounds.top + trackBounds.height / 2,
      edgeZonePx = Math.max(viewportWidth * 0.1, 1),
      smootherstep = (t) => {
        const clamped = Math.min(1, Math.max(0, t));
        return clamped * clamped * (3 - 2 * clamped);
      },
      leftGate = smootherstep(-trackBounds.left / edgeZonePx),
      rightGate = smootherstep(
        (trackBounds.left + this.track.scrollWidth - viewportWidth) /
          edgeZonePx,
      );
    gl.uniform2f(uniforms.uResolution, viewportWidth, viewportHeight);
    gl.uniform1f(uniforms.uBandCenter, bandCenter);
    gl.uniform1f(uniforms.uFan, 0.6);
    gl.uniform1f(uniforms.uEdgeZone, 0.1);
    gl.uniform1f(uniforms.uEdgePow, 2.6);
    gl.uniform1f(uniforms.uLeftGate, leftGate);
    gl.uniform1f(uniforms.uRightGate, rightGate);
    gl.uniform1i(uniforms.tMap, 0);
    gl.activeTexture(gl.TEXTURE0);
    this.labItems.forEach((item) => {
      if (!item.texture) return;
      const rect = item.media.getBoundingClientRect();
      gl.uniform4f(uniforms.uRect, rect.left, rect.top, rect.width, rect.height);
      gl.uniform1f(uniforms.uChroma, 0.02 + (item.host.hovered ? 0.03 : 0));
      gl.bindTexture(gl.TEXTURE_2D, item.texture);
      gl.drawElements(gl.TRIANGLES, state.indexCount, gl.UNSIGNED_SHORT, 0);
    });
  }
}
new Continuation();

})();
