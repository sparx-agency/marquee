(() => {
  const CSS_ID = "sprx-marquee-css";
  const KEYFRAMES = "sprx-marquee-translateX";

  function injectSprxMarqueeCSS() {
    if (document.getElementById(CSS_ID)) return;

    const style = document.createElement("style");
    style.id = CSS_ID;
    style.textContent = `
      @keyframes ${KEYFRAMES} {
        to { transform: translateX(-100%); }
      }

      [data-sprx-marquee-list] {
        animation: ${KEYFRAMES} linear infinite;
        will-change: transform;
        transition: animation-play-state 0.4s ease;
      }

      /* Pause on hover (opt-in) */
      [data-sprx-marquee][data-pausable="true"]:hover
      [data-sprx-marquee-list] {
        animation-play-state: paused !important;
      }
    `;
    document.head.appendChild(style);
  }

  const toInt = (v) => parseInt(v, 10);
  const toFloat = (v) => parseFloat(v);

  const getTotalInstances = (marquee) => {
    const n = toInt(marquee.getAttribute("data-instances"));
    return Number.isFinite(n) ? Math.max(n, 1) : 2;
  };

  const getPixelsPerSecond = (marquee) => {
    const n = toFloat(marquee.getAttribute("data-speed"));
    return Number.isFinite(n) ? n : 75;
  };

  const getAnimationDirection = (marquee) =>
    marquee.getAttribute("data-direction") === "reverse" ? "reverse" : "normal";

  const setListTiming = (list, pixelsPerSecond, direction) => {
    const duration = list.offsetWidth / Math.max(pixelsPerSecond, 1);
    list.style.animationDuration = `${duration}s`;
    list.style.animationDirection = direction;
  };

  const createVisibilityObserver = () =>
    new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const state = entry.isIntersecting ? "running" : "paused";
          entry.target.querySelectorAll("[data-sprx-marquee-list]").forEach((list) => {
            list.style.animationPlayState = state;
          });
        });
      },
      { threshold: 0 }
    );

  function initSprxMarquee() {
    injectSprxMarqueeCSS();

    const marquees = document.querySelectorAll("[data-sprx-marquee]");
    if (!marquees.length) return;

    marquees.forEach((marquee) => {
      const totalInstances = getTotalInstances(marquee);
      const pixelsPerSecond = getPixelsPerSecond(marquee);
      const direction = getAnimationDirection(marquee);

      // Duplicate lists
      const lists = marquee.querySelectorAll("[data-sprx-marquee-list]");
      lists.forEach((list) => {
        for (let i = 0; i < totalInstances - 1; i++) {
          marquee.appendChild(list.cloneNode(true));
        }
      });

      // Apply timing + direction
      marquee.querySelectorAll("[data-sprx-marquee-list]").forEach((list) => {
        setListTiming(list, pixelsPerSecond, direction);
      });

      // Pause / resume on viewport visibility
      const observer = createVisibilityObserver();
      observer.observe(marquee);
    });
  }

  window.addEventListener("load", initSprxMarquee);
})();
