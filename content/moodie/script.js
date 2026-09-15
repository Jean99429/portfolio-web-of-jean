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

/* Hero carousel: simple crossfade loop between 3 product shots */
document.querySelectorAll("[data-carousel]").forEach((stage) => {
  const slides = [...stage.querySelectorAll(".hero-carousel__img")];
  if (slides.length < 2) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  let index = slides.findIndex((slide) => slide.classList.contains("is-active"));
  if (index === -1) index = 0;

  window.setInterval(() => {
    slides[index].classList.remove("is-active");
    index = (index + 1) % slides.length;
    slides[index].classList.add("is-active");
  }, 3600);
});

/* Pain -> direction flip cards: time-based transition, not static juxtaposition.
   Cards auto-flip a moment after entering view, and stay clickable afterward. */
document.querySelectorAll(".flip-card").forEach((card, cardIndex) => {
  const flip = () => card.classList.toggle("is-flipped");
  card.addEventListener("click", flip);

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          window.setTimeout(() => card.classList.add("is-flipped"), 900 + cardIndex * 260);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );
    observer.observe(card);
  }
});

/* Journey emotion curve + pain bubbles: draw on scroll into view */
document.querySelectorAll(".journey").forEach((journey) => {
  if (!("IntersectionObserver" in window)) {
    journey.classList.add("is-active");
    return;
  }
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        journey.classList.add("is-active");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.35 }
  );
  observer.observe(journey);
});

/* Market matrix: icons land into their quadrant, then the empty quadrant breathes */
document.querySelectorAll(".market-block").forEach((block) => {
  if (!("IntersectionObserver" in window)) {
    block.classList.add("is-active");
    return;
  }
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        block.classList.add("is-active");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.3 }
  );
  observer.observe(block);
});

/* Solution block: one shared stage for Flow 1/2/3 — click a list item to
   crossfade in that flow's video (poster stands in until each <source> is
   wired up), and keep only the active + visible one actually playing. */
document.querySelectorAll(".solution-block").forEach((block) => {
  const items = [...block.querySelectorAll(".solution-list [data-highlight]")];
  const videos = [...block.querySelectorAll("[data-highlight-video]")];
  if (!items.length || !videos.length) return;

  const hasAnySource = videos.some((video) => video.querySelector("source"));
  if (hasAnySource) block.querySelector(".solution-block__badge")?.remove();

  const showKey = (key) => {
    items.forEach((item) => item.classList.toggle("is-active", item.dataset.highlight === key));
    videos.forEach((video) => {
      const active = video.dataset.highlightVideo === key;
      video.classList.toggle("is-active", active);
      if (!video.querySelector("source")) return;
      if (active) video.play().catch(() => {});
      else video.pause();
    });
  };

  items.forEach((item) => {
    const activate = () => showKey(item.dataset.highlight);
    item.addEventListener("click", activate);
    item.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      activate();
    });
  });

  if (!hasAnySource || !("IntersectionObserver" in window)) return;
  const stage = block.querySelector(".solution-block__stage");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const activeVideo = videos.find((video) => video.classList.contains("is-active"));
        if (!activeVideo) return;
        if (entry.isIntersecting) activeVideo.play().catch(() => {});
        else activeVideo.pause();
      });
    },
    { threshold: 0.4 }
  );
  if (stage) observer.observe(stage);
});

/* Three-step flow progress: hover/click a step to move the bar and highlight it */
document.querySelectorAll("[data-flow-progress]").forEach((flow) => {
  const items = [...flow.querySelectorAll("[data-flow-step]")];
  const fill = flow.querySelector("[data-flow-fill]");
  if (!items.length || !fill) return;

  const setStep = (step) => {
    items.forEach((item) => item.classList.toggle("is-active", item.dataset.flowStep === step));
    fill.style.width = (Number(step) / items.length) * 100 + "%";
  };

  items.forEach((item) => {
    item.addEventListener("mouseenter", () => setStep(item.dataset.flowStep));
    item.addEventListener("click", () => setStep(item.dataset.flowStep));
  });

  flow.addEventListener("mouseleave", () => setStep(items[0].dataset.flowStep));
  setStep(items[0].dataset.flowStep);
});

/* step 02 preview: the search box's gradient border does a one-shot spin as a closing
   accent — same SVG SMIL trick as the hero animation, just re-triggered on hover here
   since there's no cascade timeline driving it. */
document.querySelectorAll('[data-flow-step="2"]').forEach((step) => {
  const spin = step.querySelector("#flowSearchSpinAnim");
  if (!spin) return;
  step.addEventListener("mouseenter", () => spin.beginElement());
});
