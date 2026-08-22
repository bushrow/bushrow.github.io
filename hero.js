// Hero background: points scattered across an embedding space, settling into
// clusters whose centres then wander slowly. Purely decorative, so the canvas
// is aria-hidden and nothing here is required for the page to make sense.
//
// Under prefers-reduced-motion it paints one settled frame and never starts a
// loop. It also stops painting while the tab is hidden.
(function () {
  var canvas = document.getElementById("hero-canvas");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");

  var EDGE = "155, 54, 84";   // --accent, #9b3654
  var DOT = "219, 99, 135";   // --accent-text, #db6387

  var CLUSTERS = 5;
  var LINK_DIST = 95;         // px; edges only drawn inside a cluster
  var SETTLE_MS = 2600;

  // Centroid wander. Slow enough to read as drift rather than motion: a full
  // cycle takes the better part of a minute.
  var DRIFT_PERIOD = [26000, 62000];  // ms
  var DRIFT_X = 0.085;                // of hero width
  var DRIFT_Y = 0.045;                // of hero height

  // Clusters spread across the full width. Only their vertical placement
  // matters for legibility: the CSS mask clears a horizontal band through the
  // middle, so a cluster drifting toward it fades out rather than colliding
  // with the headline. Horizontal centre is fine and keeps the field from
  // reading as four things parked in the corners.
  var ROWS = [
    [0.09, 0.21],   // top band
    [0.79, 0.91]    // bottom band
  ];

  var motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var w = 0, h = 0, groups = [], raf = null, start = 0;

  function rand(a, b) { return a + Math.random() * (b - a); }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function build() {
    var rect = canvas.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = rect.width;
    h = rect.height;
    if (!w || !h) return false;

    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var total = Math.max(60, Math.min(190, Math.round(w / 6.5)));
    var per = Math.round(total / CLUSTERS);
    var spread = Math.min(w, h) * 0.125;
    var ax = w * DRIFT_X;
    var ay = h * DRIFT_Y;
    groups = [];

    for (var c = 0; c < CLUSTERS; c++) {
      // Even spacing across the width with jitter, alternating rows, so the
      // clusters interleave top and bottom instead of pairing up at the edges.
      var slot = (c + 0.5) / CLUSTERS;
      var row = ROWS[c % ROWS.length];

      // Resolve this cluster's own drift amplitude first, then clamp its home
      // against that amplitude plus the cluster's radius. Clamping against the
      // base amplitude instead let a cluster with a 1.3x multiplier hang off
      // the edge and read as clipped rather than drifting.
      var gax = ax * rand(0.7, 1.3);
      var gay = ay * rand(0.6, 1.2);
      // Margin covers the full drift amplitude, the cluster radius (oy is
      // squashed to 0.78 of it), and the 7px per-point jitter.
      var mx = gax + spread + 8;
      var my = gay + spread * 0.78 + 8;

      var g = {
        cx: Math.min(w - mx, Math.max(mx, w * (slot + rand(-0.05, 0.05)))),
        cy: Math.min(h - my, Math.max(my, h * rand(row[0], row[1]))),
        ax: gax,
        ay: gay,
        wx: (Math.PI * 2) / rand(DRIFT_PERIOD[0], DRIFT_PERIOD[1]),
        wy: (Math.PI * 2) / rand(DRIFT_PERIOD[0], DRIFT_PERIOD[1]),
        px: rand(0, Math.PI * 2),
        py: rand(0, Math.PI * 2),
        pts: []
      };

      for (var i = 0; i < per; i++) {
        // sqrt-ish radius keeps the cluster denser at its centre
        var ang = rand(0, Math.PI * 2);
        var rad = Math.pow(Math.random(), 0.65) * spread;
        g.pts.push({
          // offset from the centroid, so the whole cluster travels with it
          ox: Math.cos(ang) * rad,
          oy: Math.sin(ang) * rad * 0.78,
          sx: rand(-w * 0.1, w * 1.1),
          sy: rand(-h * 0.1, h * 1.1),
          phase: rand(0, Math.PI * 2),
          speed: rand(0.35, 1.0),
          amp: rand(2, 7),
          r: rand(1.5, 3.0),
          x: 0,
          y: 0
        });
      }
      groups.push(g);
    }
    return true;
  }

  function positionAll(elapsed) {
    var e = easeOutCubic(Math.min(1, elapsed / SETTLE_MS));
    var t = elapsed / 1000;
    for (var g = 0; g < groups.length; g++) {
      var grp = groups[g];
      // Centroid wander is independent of the settle, so the clusters keep
      // moving long after the points have arrived.
      var cx = grp.cx + Math.sin(elapsed * grp.wx + grp.px) * grp.ax;
      var cy = grp.cy + Math.cos(elapsed * grp.wy + grp.py) * grp.ay;
      for (var i = 0; i < grp.pts.length; i++) {
        var p = grp.pts[i];
        var hx = cx + p.ox;
        var hy = cy + p.oy;
        // per-point jitter fades in with the settle, so the arrival reads clean
        p.x = p.sx + (hx - p.sx) * e + Math.cos(p.phase + t * p.speed) * p.amp * e;
        p.y = p.sy + (hy - p.sy) * e + Math.sin(p.phase * 1.7 + t * p.speed * 0.8) * p.amp * e;
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 1;

    // Edges are intra-cluster only, which is what makes the grouping legible.
    // Iterating per group keeps this at CLUSTERS * (n/CLUSTERS)^2 pairs.
    for (var g = 0; g < groups.length; g++) {
      var pts = groups[g].pts;
      for (var i = 0; i < pts.length; i++) {
        for (var j = i + 1; j < pts.length; j++) {
          var dx = pts[i].x - pts[j].x;
          var dy = pts[i].y - pts[j].y;
          var d2 = dx * dx + dy * dy;
          if (d2 > LINK_DIST * LINK_DIST) continue;
          var o = (1 - Math.sqrt(d2) / LINK_DIST) * 0.5;
          ctx.strokeStyle = "rgba(" + EDGE + "," + o.toFixed(3) + ")";
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
    }

    ctx.fillStyle = "rgba(" + DOT + ",0.92)";
    for (var k = 0; k < groups.length; k++) {
      var gp = groups[k].pts;
      for (var m = 0; m < gp.length; m++) {
        ctx.beginPath();
        ctx.arc(gp[m].x, gp[m].y, gp[m].r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function frame(now) {
    if (!start) start = now;
    positionAll(now - start);
    draw();
    raf = window.requestAnimationFrame(frame);
  }

  function stop() {
    if (raf) { window.cancelAnimationFrame(raf); raf = null; }
  }

  function render() {
    stop();
    if (!build()) return;
    if (motion.matches) {
      positionAll(SETTLE_MS);   // one settled frame, no loop
      draw();
    } else {
      start = 0;
      raf = window.requestAnimationFrame(frame);
    }
  }

  var resizeTimer;
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(render, 150);
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop();
    else if (!motion.matches && !raf) { start = 0; raf = window.requestAnimationFrame(frame); }
  });

  if (motion.addEventListener) motion.addEventListener("change", render);

  render();
})();
