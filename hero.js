// Hero background: points scattered across an embedding space, settling into
// clusters and then drifting. Purely decorative, so the canvas is aria-hidden
// and nothing here is required for the page to make sense.
//
// Under prefers-reduced-motion it paints the settled state once and never
// starts a loop. It also stops painting while the tab is hidden.
(function () {
  var canvas = document.getElementById("hero-canvas");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");

  var EDGE = "155, 54, 84";   // --accent, #9b3654
  var DOT = "219, 99, 135";   // --accent-text, #db6387
  // The centre of the hero is masked out in CSS so no point is ever drawn
  // behind the headline. Clusters therefore live in the top and bottom bands,
  // where the mask lets them render at full strength.
  var BANDS = [
    { x: [0.10, 0.26], y: [0.04, 0.20] },
    { x: [0.62, 0.80], y: [0.03, 0.18] },
    { x: [0.18, 0.36], y: [0.80, 0.96] },
    { x: [0.70, 0.88], y: [0.82, 0.97] }
  ];
  var CLUSTERS = BANDS.length;
  var LINK_DIST = 100;         // px; edges only drawn inside a cluster
  var SETTLE_MS = 2600;

  var motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var w = 0, h = 0, groups = [], raf = null, start = 0;

  function rand(a, b) { return a + Math.random() * (b - a); }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  // Build the point field. Each point knows where it starts (scattered) and
  // where it belongs (its cluster), and interpolates between the two.
  function build() {
    var rect = canvas.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = rect.width;
    h = rect.height;
    if (!w || !h) return false;

    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var total = Math.max(56, Math.min(180, Math.round(w / 7)));
    var spread = Math.min(w, h) * 0.142;
    groups = [];

    for (var c = 0; c < CLUSTERS; c++) {
      var band = BANDS[c];
      var cx = w * rand(band.x[0], band.x[1]);
      var cy = h * rand(band.y[0], band.y[1]);
      var pts = [];
      for (var i = 0; i < Math.round(total / CLUSTERS); i++) {
        // sqrt-ish radius keeps the cluster denser at its centre
        var ang = rand(0, Math.PI * 2);
        var rad = Math.pow(Math.random(), 0.65) * spread;
        pts.push({
          hx: cx + Math.cos(ang) * rad,
          hy: cy + Math.sin(ang) * rad * 0.78,
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
      groups.push(pts);
    }
    return true;
  }

  function positionAll(elapsed) {
    var e = easeOutCubic(Math.min(1, elapsed / SETTLE_MS));
    var t = elapsed / 1000;
    for (var g = 0; g < groups.length; g++) {
      var pts = groups[g];
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        // drift only fades in as the cluster settles, so the arrival reads clean
        p.x = p.sx + (p.hx - p.sx) * e + Math.cos(p.phase + t * p.speed) * p.amp * e;
        p.y = p.sy + (p.hy - p.sy) * e + Math.sin(p.phase * 1.7 + t * p.speed * 0.8) * p.amp * e;
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 1;

    // Edges are intra-cluster only, which is what makes the grouping legible.
    // Iterating per group keeps this at ~3 * (n/3)^2 pairs rather than n^2.
    for (var g = 0; g < groups.length; g++) {
      var pts = groups[g];
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
      for (var m = 0; m < groups[k].length; m++) {
        var p = groups[k][m];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
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
      positionAll(SETTLE_MS);   // paint the settled state, no loop
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
