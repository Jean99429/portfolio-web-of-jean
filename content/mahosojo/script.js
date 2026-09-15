if ("scrollRestoration" in history) history.scrollRestoration = "manual";
window.addEventListener("pageshow", () => {
  if (!window.location.hash) window.scrollTo(0, 0);
});

const revealTargets = document.querySelectorAll("[data-reveal]");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.setAttribute("data-revealed", "");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  revealTargets.forEach((target) => revealObserver.observe(target));
} else {
  revealTargets.forEach((target) => target.setAttribute("data-revealed", ""));
}

const indexLinks = [...document.querySelectorAll(".case-index a[href^='#']")];
const indexedSections = indexLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if (indexLinks.length && indexedSections.length && "IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      indexLinks.forEach((link) => {
        link.classList.toggle("is-active", link.hash === "#" + visible.target.id);
      });
    },
    { rootMargin: "-20% 0px -62% 0px", threshold: [0, 0.1, 0.3] }
  );

  indexedSections.forEach((section) => sectionObserver.observe(section));
}

// Claude Design 动效每次滚动进入视口都重新播放一遍
const claudedesignGroups = document.querySelectorAll(".claudedesign-frame-group");

if (claudedesignGroups.length && "IntersectionObserver" in window) {
  const replayFrame = (iframe) => {
    const src = iframe.getAttribute("src");
    iframe.setAttribute("src", "");
    requestAnimationFrame(() => iframe.setAttribute("src", src));
  };

  const claudedesignObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.querySelectorAll(".claudedesign-frame").forEach(replayFrame);
      });
    },
    { threshold: 0.4 }
  );

  claudedesignGroups.forEach((group) => claudedesignObserver.observe(group));
}

// Hero 播放框：整个框范围内悬浮显示"Open"光标，点击打开完整可试玩原型
const heroClickzone = document.getElementById("heroClickzone");
const heroCursorBadge = document.getElementById("heroCursorBadge");

if (heroClickzone && heroCursorBadge) {
  heroClickzone.addEventListener("mousemove", (e) => {
    heroCursorBadge.style.transform = `translate(${e.clientX}px, ${e.clientY}px) scale(1)`;
  });
  heroClickzone.addEventListener("mouseenter", () => {
    heroCursorBadge.classList.add("is-visible");
  });
  heroClickzone.addEventListener("mouseleave", () => {
    heroCursorBadge.classList.remove("is-visible");
  });
  heroClickzone.addEventListener("click", () => {
    window.open("./assets/adhd-start-app-prototype.html", "_blank");
  });
}
