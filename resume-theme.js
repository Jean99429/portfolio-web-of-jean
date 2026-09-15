(function () {
  var site = document.querySelector(".site");
  var resume = document.querySelector(".resume");
  var sections = document.querySelectorAll(".ai-lab, .resume, .ending");
  if (!site || !resume || !sections.length) return;

  var rafId = 0;

  function update() {
    rafId = 0;
    var center = window.innerHeight * 0.5;
    var active = null;

    for (var i = 0; i < sections.length; i++) {
      var rect = sections[i].getBoundingClientRect();
      if (rect.top <= center && rect.bottom >= center) {
        active = sections[i];
        break;
      }
    }

    site.classList.toggle("is-light-zone", active === resume);
  }

  function onScroll() {
    if (!rafId) rafId = requestAnimationFrame(update);
  }

  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
})();
