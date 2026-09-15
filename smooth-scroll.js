(() => {
  if (typeof window.Lenis !== "function") return;

  const expoOut = (t) =>
    t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

  const lenis = new window.Lenis({
    autoRaf: true,
    duration: 2,
    easing: expoOut,
    orientation: "vertical",
    gestureOrientation: "vertical",
    smoothWheel: true,
    syncTouch: false,
    touchMultiplier: 1.5,
    wheelMultiplier: 1,
    overscroll: true,
    anchors: true,
    respectReducedMotion: true,
    stopInertiaOnNavigate: true,
  });

  window.siteSmoothScroll = lenis;
})();
