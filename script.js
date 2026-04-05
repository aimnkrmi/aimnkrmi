document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Subtle On-Load Animations
  const fadeElements = document.querySelectorAll(".fade-in-section");

  // Create an intersection observer for scroll-based fade-in
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target); // Trigger once
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    },
  );

  fadeElements.forEach((el, i) => {
    // Stagger first few elements sequentially
    if (i < 3) {
      setTimeout(() => {
        el.classList.add("is-visible");
      }, i * 150);
      observer.unobserve(el);
    } else {
      observer.observe(el);
    }
  });

  // --- 2. Hover-Reveal System & Active Indicator
  const listWrapper = document.querySelector(".project-list-wrapper");
  const projectItems = document.querySelectorAll(".project-item");
  const indicator = document.querySelector(".active-indicator");

  // Prevent jitter with a delay
  let hoverTimeout;
  const hoverDelay = 100; // ms

  // State
  const isTouchDevice = window.matchMedia(
    "(pointer: coarse), (hover: none)",
  ).matches;

  // Helper: update indicator position
  function updateIndicator(itemElement) {
    if (!indicator || !itemElement) return;
    const rect = itemElement.getBoundingClientRect();
    const wrapperRect = listWrapper.getBoundingClientRect();

    // Calculate offset relative to wrapper
    const offsetTop = rect.top - wrapperRect.top;

    indicator.style.transform = `translateY(${offsetTop}px)`;
    indicator.style.height = `${rect.height}px`;
  }

  if (!isTouchDevice) {
    // --- Desktop Hover Behavior ---

    projectItems.forEach((item) => {
      item.addEventListener("mouseenter", (e) => {
        // Clear any pending leaves
        clearTimeout(hoverTimeout);

        hoverTimeout = setTimeout(() => {
          // Activate global focus state
          listWrapper.classList.add("has-focus");

          // Activate this item
          projectItems.forEach((other) => other.classList.remove("is-active"));
          item.classList.add("is-active");

          // Move line indicator
          updateIndicator(item);
        }, hoverDelay);
      });

      // On mouse leave, we don't immediately remove active state
      // just to prevent flickers when jumping between adjacent items
    });

    // When mouse entirely leaves the list area
    listWrapper.addEventListener("mouseleave", () => {
      clearTimeout(hoverTimeout);
      listWrapper.classList.remove("has-focus");
      projectItems.forEach((item) => item.classList.remove("is-active"));
      if (indicator) indicator.style.opacity = "0";
    });
  } else {
    // --- Mobile Tap Behavior ---

    projectItems.forEach((item) => {
      item.addEventListener("click", () => {
        const isActive = item.classList.contains("is-active");

        // Close all
        projectItems.forEach((other) => other.classList.remove("is-active"));

        // Toggle current
        if (!isActive) {
          item.classList.add("is-active");
        }
      });
    });
  }

  // --- 3. Dynamic Footer Timestamp
  const timeEl = document.getElementById("last-updated");
  if (timeEl) {
    const now = new Date();
    const options = { year: "numeric", month: "short", day: "numeric" };
    timeEl.textContent = `Revision ${now.toLocaleDateString("en-US", options)}`;
  }
});
