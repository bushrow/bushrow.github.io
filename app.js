// Mobile nav toggle. Keeps aria-expanded in sync with the visible state.
(function () {
  var toggle = document.querySelector(".nav-toggle");
  var links = document.getElementById("nav-links");
  if (!toggle || !links) return;

  toggle.addEventListener("click", function () {
    var open = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  // Collapse after tapping a link, so the anchor target is actually visible.
  links.addEventListener("click", function (e) {
    if (e.target.tagName !== "A") return;
    links.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  });
})();
