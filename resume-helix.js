(function () {
  var canvas = document.querySelector("[data-helix-canvas]");
  var card = canvas && canvas.closest(".resume__card");
  if (!canvas || !card) return;

  var ctx = canvas.getContext("2d");
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var motionScale = reducedMotion ? 0.12 : 1;

  var W = 0, H = 0, DPR = 1;
  var CENTER_X = 0, AMPLITUDE = 0, POINT_COUNT = 0, TURNS = 3.2;
  var MARGIN = 0, MAX_RADIUS = 0;
  var DRIFT_AMP = 0, WOBBLE_MAX = 0, TILT_PIXEL_MAX = 0;
  var LEADER_LEN_MIN = 120, LEADER_LEN_MAX = 190;
  var TUBE_RADIUS = 0;
  var N_LONGITUDE = 28;

  // randomised per load so the structure isn't identical every visit
  var SEED_W1 = 1 + Math.random() * 5;
  var SEED_W2 = 6 + Math.random() * 5;
  var SEED_AMP = 3 + Math.random() * 5;
  var SEED_WARP = 8 + Math.random() * 5;

  var MIN_LABEL_GAP = 30;
  var leftLabelYs = [];
  var rightLabelYs = [];
  var boxes = [];
  var running = false;

  function noise1(x, seed) {
    return 0.6 * Math.sin(x * 1.0 + seed) +
      0.25 * Math.sin(x * 2.13 + seed * 1.7) +
      0.15 * Math.sin(x * 3.7 + seed * 2.9);
  }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = card.clientWidth;
    H = card.clientHeight;
    if (!W || !H) return;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    CENTER_X = W / 2;
    MARGIN = Math.max(104, Math.min(W * 0.09, 150));
    MAX_RADIUS = Math.max(60, (W - 2 * MARGIN) / 2 - 16);
    AMPLITUDE = Math.min(MAX_RADIUS * 0.92, H * 0.3, 340);
    TUBE_RADIUS = Math.max(5, AMPLITUDE * 0.06);
    DRIFT_AMP = Math.min(W * 0.03, MAX_RADIUS * 0.16);
    WOBBLE_MAX = MAX_RADIUS * 0.22;
    TILT_PIXEL_MAX = MAX_RADIUS * 0.2;

    POINT_COUNT = Math.max(90, Math.min(220, Math.floor(H / 4.5)));
    TURNS = Math.max(2.2, Math.min(4.4, H / 380));

    leftLabelYs = [];
    rightLabelYs = [];
    boxes = [];
  }

  var ROT_SPEED = 0.27 * motionScale; // rad/sec
  var phase = 0;
  var lastT = performance.now();

  // box/line accents stay muted so they read against white + photos; label
  // text uses the brighter terminal-style equivalent of the same hue,
  // shown on a dark chip for legibility over busy backgrounds
  // syntax-highlight palette — pink / function-green / variable-cyan /
  // number-purple — box outlines and label text share it
  var ACCENTS = ["#FF1F78", "#B7E532", "#54D7EA", "#A78BFA"];
  var LABELS = [
    "creative",
    "curiosity",
    "design is my language",
    "change people's lives",
    "structured ambiguity",
    "prototype to think",
    "from insight to interface",
    "systems, not screens",
    "bridge design & engineering",
    "AI-native workflow"
  ];

  function depthEase(d) {
    return d * d * (3 - 2 * d); // smoothstep
  }

  function vsub(p, q) { return { x: p.x - q.x, y: p.y - q.y, z: p.z - q.z }; }
  function vcross(p, q) {
    return { x: p.y * q.z - p.z * q.y, y: p.z * q.x - p.x * q.z, z: p.x * q.y - p.y * q.x };
  }
  function vnorm(p) {
    var len = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z) || 1;
    return { x: p.x / len, y: p.y / len, z: p.z / len };
  }

  function buildFrame(time) {
    var n = POINT_COUNT + 1;
    var tiltFactor = Math.sin(time * 0.045 + 1.3);
    var driftX = DRIFT_AMP * Math.sin(time * 0.06 + 2.0);

    // shared axis geometry per sample along the length (both strands wind
    // around this same, slightly wobbling/tilting/drifting centre axis)
    var axisXs = new Array(n), localAmps = new Array(n), angle0s = new Array(n), ys = new Array(n);
    for (var i = 0; i < n; i++) {
      var t = -0.06 + 1.12 * (i / POINT_COUNT); // bleed past top/bottom edges
      ys[i] = t * H;
      var wobble = WOBBLE_MAX * (0.62 * noise1(t * 3 + SEED_W1, SEED_W1) + 0.38 * noise1(t * 1.1 + SEED_W2, SEED_W2));
      var tilt = tiltFactor * TILT_PIXEL_MAX * (t - 0.5) * 2;
      axisXs[i] = CENTER_X + driftX + wobble + tilt;
      localAmps[i] = AMPLITUDE * Math.max(0.55, 0.82 + 0.4 * noise1(t * 2.1 + SEED_AMP, SEED_AMP));
      var phaseWarp = 0.45 * noise1(t * 1.6 + SEED_WARP, SEED_WARP);
      angle0s[i] = t * TURNS * Math.PI * 2 + phaseWarp + phase;
    }

    function buildStrand(strandOffset) {
      var centerline = new Array(n);
      for (var i = 0; i < n; i++) {
        var angle = angle0s[i] + strandOffset;
        var amp = localAmps[i];
        centerline[i] = {
          x: axisXs[i] + amp * Math.cos(angle),
          y: ys[i],
          z: amp * Math.sin(angle),
          angle: angle,
          amp: amp
        };
      }

      var tube = new Array(n);
      var stepDistSum = 0;
      for (var i = 0; i < n; i++) {
        var c = centerline[i];
        c.depth = (Math.sin(c.angle) + 1) / 2;

        // local tube frame derived from the curve's actual 3D tangent, not
        // just the radial direction — otherwise the ring plane drifts out
        // of alignment with the surface wherever the helix pitches steeply
        var prev = centerline[Math.max(0, i - 1)];
        var next = centerline[Math.min(n - 1, i + 1)];
        stepDistSum += Math.hypot(next.x - prev.x, next.y - prev.y) / 2;
        var tangent = vnorm(vsub(next, prev));
        var nAxis = vnorm(vcross(tangent, { x: 0, y: 1, z: 0 }));
        if (!isFinite(nAxis.x) || (nAxis.x === 0 && nAxis.y === 0 && nAxis.z === 0)) {
          nAxis = { x: 1, y: 0, z: 0 };
        }
        var bAxis = vcross(tangent, nAxis);

        var ring = new Array(N_LONGITUDE);
        for (var j = 0; j < N_LONGITUDE; j++) {
          var phi = (j / N_LONGITUDE) * Math.PI * 2;
          var cosPhi = Math.cos(phi), sinPhi = Math.sin(phi);
          var ox = cosPhi * nAxis.x + sinPhi * bAxis.x;
          var oy = cosPhi * nAxis.y + sinPhi * bAxis.y;
          var oz = cosPhi * nAxis.z + sinPhi * bAxis.z;
          var vz = c.z + TUBE_RADIUS * oz;
          ring[j] = {
            x: c.x + TUBE_RADIUS * ox,
            y: c.y + TUBE_RADIUS * oy,
            depth: Math.max(0, Math.min(1, (vz / c.amp + 1) / 2)),
            front: oz >= 0
          };
        }
        tube[i] = ring;
      }

      // space the rings so each grid cell is roughly square: the arc length
      // of one circumferential cell should match the along-tube spacing
      var avgStepDist = Math.max(0.001, stepDistSum / n);
      var cellArc = (2 * Math.PI * TUBE_RADIUS) / N_LONGITUDE;
      var ringStep = Math.max(1, Math.round(cellArc / avgStepDist));

      return { centerline: centerline, tube: tube, ringStep: ringStep };
    }

    var strandA = buildStrand(0);
    var strandB = buildStrand(Math.PI);
    return {
      a: strandA.centerline, b: strandB.centerline,
      tubeA: strandA.tube, tubeB: strandB.tube,
      ringStepA: strandA.ringStep, ringStepB: strandB.ringStep
    };
  }

  // a tube is opaque: only its near-facing surface should ever be drawn,
  // so this finds the single contiguous run of "front" vertices around a
  // ring (handles the run wrapping past index 0)
  function frontRun(ring) {
    var len = ring.length;
    var start = -1;
    for (var k = 0; k < len; k++) {
      if (ring[k].front && !ring[(k - 1 + len) % len].front) { start = k; break; }
    }
    if (start === -1) return ring[0].front ? { start: 0, count: len } : null;
    var count = 0;
    while (count < len && ring[(start + count) % len].front) count++;
    return { start: start, count: count };
  }

  function drawTube(tube, ringStep) {
    var n = tube.length;

    // longitude lines (the "warp") — break the path wherever this thread
    // wraps onto the far side of the tube, so the back doesn't show through
    for (var j = 0; j < N_LONGITUDE; j++) {
      var open = false, depthSum = 0, count = 0;
      for (var i = 0; i < n; i++) {
        var p = tube[i][j];
        if (p.front) {
          if (!open) { ctx.beginPath(); ctx.moveTo(p.x, p.y); open = true; depthSum = 0; count = 0; }
          else ctx.lineTo(p.x, p.y);
          depthSum += p.depth;
          count++;
        } else if (open) {
          ctx.strokeStyle = "rgba(23,27,36," + (0.06 + depthEase(depthSum / count) * 0.42).toFixed(3) + ")";
          ctx.lineWidth = 1;
          ctx.stroke();
          open = false;
        }
      }
      if (open) {
        ctx.strokeStyle = "rgba(23,27,36," + (0.06 + depthEase(depthSum / count) * 0.42).toFixed(3) + ")";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // rings (the "weft") — only the near-facing arc of each cross-section
    for (var i = 0; i < n; i += ringStep) {
      var run = frontRun(tube[i]);
      if (!run) continue;
      var ring = tube[i];
      var avgDepth = 0;
      ctx.beginPath();
      for (var k = 0; k < run.count; k++) {
        var p = ring[(run.start + k) % ring.length];
        avgDepth += p.depth;
        if (k === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = "rgba(23,27,36," + (0.05 + depthEase(avgDepth / run.count) * 0.3).toFixed(3) + ")";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  function drawRungs(a, b) {
    var step = Math.max(4, Math.round(POINT_COUNT / 34));
    for (var i = 0; i < a.length; i += step) {
      var pa = a[i], pb = b[i];
      var grad = ctx.createLinearGradient(pa.x, pa.y, pb.x, pb.y);
      grad.addColorStop(0, "rgba(23,27,36," + (0.04 + depthEase(pa.depth) * 0.22).toFixed(3) + ")");
      grad.addColorStop(1, "rgba(23,27,36," + (0.04 + depthEase(pb.depth) * 0.22).toFixed(3) + ")");
      ctx.beginPath();
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1;
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
    }
  }

  // ---- detection boxes: dense, overlapping, only some resolve to a label ----
  var nextSpawn = 0;
  var boxSeq = 0;
  var MAX_BOXES = 15;
  var LABEL_CHANCE = 0.55;
  var CLUSTER_CHANCE = 0.45;

  function smoothstep(edge0, edge1, x) {
    var t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  function randomIdx(len) {
    return 6 + Math.floor(Math.random() * (len - 12));
  }

  function pickIdx(pts) {
    if (boxes.length && Math.random() < CLUSTER_CHANCE) {
      var ref = boxes[Math.floor(Math.random() * boxes.length)];
      var offset = (3 + Math.floor(Math.random() * 16)) * (Math.random() < 0.5 ? -1 : 1);
      return Math.max(6, Math.min(pts.length - 7, ref.idx + offset));
    }
    return randomIdx(pts.length);
  }

  function placeLabel(side, desiredY) {
    var list = side === "left" ? leftLabelYs : rightLabelYs;
    var y = Math.max(36, Math.min(H - 36, desiredY));
    for (var attempt = 0; attempt < 10; attempt++) {
      var clash = false;
      for (var i = 0; i < list.length; i++) {
        if (Math.abs(list[i].y - y) < MIN_LABEL_GAP) { clash = true; break; }
      }
      if (!clash) return y;
      y += (attempt % 2 === 0 ? 1 : -1) * MIN_LABEL_GAP * Math.ceil((attempt + 1) / 2);
      y = Math.max(36, Math.min(H - 36, y));
    }
    return y;
  }

  function spawnBox(frame) {
    if (boxes.length >= MAX_BOXES) return;
    var fromA = Math.random() < 0.5;
    var pts = fromA ? frame.a : frame.b;
    var hasLabel = Math.random() < LABEL_CHANCE;
    var idx = pickIdx(pts);
    var p = pts[idx];

    var label = LABELS[Math.floor(Math.random() * LABELS.length)];
    var accentIdx = Math.floor(Math.random() * ACCENTS.length);
    var side = null, labelY = null, labelX = null;
    var id = boxSeq++;
    if (hasLabel) {
      side = p.x < CENTER_X ? "left" : "right";
      labelY = placeLabel(side, p.y);
      var leaderLen = LEADER_LEN_MIN + Math.random() * (LEADER_LEN_MAX - LEADER_LEN_MIN);
      labelX = p.x + (side === "left" ? -leaderLen : leaderLen);
      ctx.font = '11px "DM Mono", monospace';
      var safeMargin = 20 + ctx.measureText(label).width;
      labelX = Math.max(safeMargin, Math.min(W - safeMargin, labelX));
      (side === "left" ? leftLabelYs : rightLabelYs).push({ id: id, y: labelY });
    }

    boxes.push({
      id: id,
      strand: fromA ? "a" : "b",
      idx: idx,
      hasLabel: hasLabel,
      side: side,
      labelY: labelY,
      labelX: labelX,
      born: performance.now(),
      lifespan: 1400 + Math.random() * 1600,
      color: ACCENTS[accentIdx],
      label: label,
      sizeJitter: 0.55 + Math.random() * 1.5,
      padX: 16 + Math.random() * 30,
      padY: 11 + Math.random() * 16
    });
  }

  function releaseLabel(b) {
    if (!b.hasLabel) return;
    var list = b.side === "left" ? leftLabelYs : rightLabelYs;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === b.id) { list.splice(i, 1); return; }
    }
  }

  function drawBoxes(frame, now) {
    ctx.font = '11px "DM Mono", monospace';
    ctx.textBaseline = "middle";

    for (var i = boxes.length - 1; i >= 0; i--) {
      var b = boxes[i];
      var age = now - b.born;
      if (age > b.lifespan) { releaseLabel(b); boxes.splice(i, 1); continue; }
      var pts = b.strand === "a" ? frame.a : frame.b;
      var p = pts[b.idx];
      if (!p) { releaseLabel(b); boxes.splice(i, 1); continue; }

      var lifeT = age / b.lifespan;
      var envelope = Math.min(smoothstep(0, 0.16, lifeT), 1 - smoothstep(0.76, 1, lifeT));
      var depthAlpha = 0.3 + depthEase(p.depth) * 0.7;
      var alpha = envelope * depthAlpha;
      if (alpha <= 0.01) continue;

      var w = (b.padX * 2) * b.sizeJitter * (0.7 + 0.3 * depthEase(p.depth));
      var h = (b.padY * 2) * b.sizeJitter * (0.7 + 0.3 * depthEase(p.depth));
      var x0 = p.x - w / 2, y0 = p.y - h / 2;

      ctx.save();
      ctx.globalAlpha = alpha * 0.07;
      ctx.fillStyle = b.color;
      ctx.fillRect(x0, y0, w, h);

      ctx.globalAlpha = alpha;
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 1;
      ctx.strokeRect(x0 + 0.5, y0 + 0.5, w, h);

      ctx.beginPath();
      ctx.fillStyle = b.color;
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();

      if (b.hasLabel) {
        var edgeX = b.side === "left" ? x0 : x0 + w;

        ctx.globalAlpha = alpha * 0.8;
        ctx.strokeStyle = b.color;
        ctx.beginPath();
        ctx.moveTo(edgeX, b.labelY);
        ctx.lineTo(b.labelX, b.labelY);
        ctx.stroke();

        ctx.globalAlpha = envelope;
        ctx.fillStyle = b.color;
        ctx.textAlign = b.side === "left" ? "right" : "left";
        ctx.fillText(b.label, b.side === "left" ? b.labelX - 10 : b.labelX + 10, b.labelY);
      }
      ctx.restore();
    }
  }

  function frame(now) {
    if (!running) return;
    var dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;
    phase += ROT_SPEED * dt;

    ctx.clearRect(0, 0, W, H);

    var f = buildFrame(now / 1000);

    drawRungs(f.a, f.b);
    drawTube(f.tubeA, f.ringStepA);
    drawTube(f.tubeB, f.ringStepB);

    if (now > nextSpawn) {
      spawnBox(f);
      nextSpawn = now + (140 + Math.random() * 160) / motionScale;
    }
    drawBoxes(f, now);

    requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    lastT = performance.now();
    requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
  }

  resize();
  window.addEventListener("resize", resize);

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) start();
          else stop();
        });
      },
      { rootMargin: "200px" }
    );
    observer.observe(card);
  } else {
    start();
  }
})();
