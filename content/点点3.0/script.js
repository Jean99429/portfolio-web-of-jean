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

document.querySelectorAll(".phone-compare").forEach((compare) => {
  const buttons = [...compare.querySelectorAll("button[data-state]")];
  const images = [...compare.querySelectorAll("[data-image]")];
  const notes = [...compare.querySelectorAll("[data-note]")];

  const setState = (state) => {
    compare.dataset.state = state;

    buttons.forEach((button) => {
      const isActive = button.dataset.state === state;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isActive));
    });

    images.forEach((image) => {
      const isActive = image.dataset.image === state;
      image.classList.toggle("is-active", isActive);
      image.setAttribute("aria-hidden", String(!isActive));
    });

    notes.forEach((note) => {
      note.classList.toggle("is-active", note.dataset.note === state);
    });
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => setState(button.dataset.state));
  });

  setState(compare.dataset.state || buttons[0]?.dataset.state);
});

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


document.querySelectorAll(".other-explorer").forEach((explorer) => {
  const list = explorer.querySelector(".contribution-list--interactive");
  const preview = explorer.querySelector(".other-preview");
  const buttons = [...explorer.querySelectorAll("[data-other-target]")];
  const panels = [...explorer.querySelectorAll("[data-other-panel]")];
  const title = explorer.querySelector("[data-other-title]");
  const nextTrigger = explorer.querySelector("[data-other-next-trigger]");
  const current = explorer.querySelector("[data-other-current]");
  const total = explorer.querySelector("[data-other-total]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let frameTimer;

  const updatePanel = (key) => {
    window.clearInterval(frameTimer);
    let activeIndex = -1;
    buttons.forEach((button, index) => {
      const isActive = button.dataset.otherTarget === key;
      if (isActive) activeIndex = index;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isActive));
      const indicator = button.querySelector("b");
      if (indicator) indicator.textContent = isActive ? "\u2212" : "+";
    });
    if (title && activeIndex !== -1) {
      const nextButton = buttons[(activeIndex + 1) % buttons.length];
      title.textContent = nextButton.querySelector("h3")?.textContent || "";
    }
    panels.forEach((panel) => {
      const isActive = panel.dataset.otherPanel === key;
      panel.classList.toggle("is-active", isActive);
      panel.classList.remove("is-playing");
    });
    const activePanel = panels.find((panel) => panel.dataset.otherPanel === key);
    if (!activePanel) return;
    const frames = [...activePanel.querySelectorAll("img")];
    let frameIndex = 0;
    frames.forEach((frame, index) => frame.classList.toggle("is-active", index === 0));
    if (current) current.textContent = "01";
    if (total) total.textContent = String(frames.length).padStart(2, "0");
    if (frames.length === 1) {
      requestAnimationFrame(() => activePanel.classList.add("is-playing"));
      return;
    }
    if (reduceMotion) return;
    frameTimer = window.setInterval(() => {
      frameIndex = (frameIndex + 1) % frames.length;
      frames.forEach((frame, index) => frame.classList.toggle("is-active", index === frameIndex));
      if (current) current.textContent = String(frameIndex + 1).padStart(2, "0");
    }, 2800);
  };

  const openDrawer = (button, shouldScroll = true) => {
    const key = button.dataset.otherTarget;
    button.insertAdjacentElement("afterend", preview);
    updatePanel(key);
    if (!preview.classList.contains("is-open")) {
      requestAnimationFrame(() => preview.classList.add("is-open"));
    }
    if (!shouldScroll) return;
    const rect = button.getBoundingClientRect();
    const buttonTop = window.scrollY + rect.top;
    const viewportH = window.innerHeight;
    const topClearance = 72;
    const bottomMargin = 24;
    const upperBound = buttonTop - topClearance;
    const lowerBound = buttonTop + rect.height + preview.scrollHeight - viewportH + bottomMargin;
    const targetTop = Math.max(upperBound, lowerBound, 0);
    window.scrollTo({ top: targetTop, behavior: "smooth" });
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.classList.contains("is-active") && preview.classList.contains("is-open")) return;
      openDrawer(button);
    });
  });

  const openNext = () => {
    const activeIndex = buttons.findIndex((button) => button.classList.contains("is-active"));
    openDrawer(buttons[(activeIndex + 1) % buttons.length]);
  };
  if (nextTrigger) {
    nextTrigger.addEventListener("click", openNext);
    nextTrigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openNext();
      }
    });
  }

  const initial = buttons.find((button) => button.classList.contains("is-active")) || buttons[0];
  if (list && preview && initial) openDrawer(initial, false);
});


document.querySelectorAll(".solution-block").forEach((block) => {
  const player = block.querySelector("[data-map-prototype]");
  const list = block.querySelector(".solution-list");
  const items = [...block.querySelectorAll(".solution-list [data-highlight]")];
  const states = [...block.querySelectorAll("[data-prototype-state]")];
  const videos = [...block.querySelectorAll("video")];
  if (!player || !items.length || !states.length) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const order = ["route", "tabs", "structure"];
  const durations = { route: 15800, tabs: 10200, structure: 17100 };
  let activeKey = order[0];
  let cycleTimer;

  const showState = (key, restart = true) => {
    activeKey = key;
    states.forEach((state) => state.classList.remove("is-active"));
    videos.forEach((video) => {
      video.pause();
      try { video.currentTime = 0; } catch (_) {}
    });
    if (restart) void player.offsetWidth;
    const activeState = states.find((state) => state.dataset.prototypeState === key);
    if (activeState) {
      activeState.classList.add("is-active");
      const video = activeState.querySelector("video");
      if (video && !reducedMotion) video.play().catch(() => {});
    }
    items.forEach((item) => {
      const selected = item.dataset.highlight === key;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-selected", String(selected));
    });
  };

  const stopAuto = () => window.clearTimeout(cycleTimer);
  const scheduleNext = () => {
    stopAuto();
    if (reducedMotion) return;
    cycleTimer = window.setTimeout(() => {
      const nextIndex = (order.indexOf(activeKey) + 1) % order.length;
      showState(order[nextIndex]);
      scheduleNext();
    }, durations[activeKey] || 5600);
  };

  items.forEach((item) => {
    const activate = () => {
      showState(item.dataset.highlight);
      scheduleNext();
    };
    item.addEventListener("click", activate);
    item.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      activate();
    });
  });

  list?.addEventListener("mouseenter", stopAuto);
  list?.addEventListener("mouseleave", scheduleNext);
  showState(activeKey, false);
  scheduleNext();
});
