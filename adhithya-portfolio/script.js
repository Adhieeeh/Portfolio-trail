/* Adhithya S U — portfolio interactions */
(() => {
  const body = document.body;
  const menuToggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("primary-nav");
  const themeToggle = document.getElementById("theme-toggle");
  const year = document.getElementById("year");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Keep the footer year current.
  if (year) year.textContent = new Date().getFullYear();

  // Mobile navigation: open, close, and close after selecting a section.
  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
      nav.classList.toggle("is-open", !isOpen);
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation");
        nav.classList.remove("is-open");
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation");
        nav.classList.remove("is-open");
      }
    });
  }

  // Theme switch. It uses localStorage when available and falls back gracefully.
  const setTheme = (dark) => {
    body.classList.toggle("theme-dark", dark);
    if (themeToggle) {
      themeToggle.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
      const label = themeToggle.querySelector(".theme-label");
      const icon = themeToggle.querySelector(".theme-icon");
      if (label) label.textContent = dark ? "LIGHT MODE" : "DARK MODE";
      if (icon) icon.textContent = dark ? "☼" : "◐";
    }
  };

  let savedTheme = null;
  try { savedTheme = localStorage.getItem("adhithya-portfolio-theme"); } catch (_) {}
  setTheme(savedTheme === "dark");

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const dark = !body.classList.contains("theme-dark");
      setTheme(dark);
      try { localStorage.setItem("adhithya-portfolio-theme", dark ? "dark" : "light"); } catch (_) {}
    });
  }

  // Gentle reveal-on-scroll effects; content remains visible if observer is unsupported.
  const revealTargets = document.querySelectorAll(
    ".about-grid, .work-title-row, .project-card, .achievement-card, .skills-grid, .beyond-heading, .interest-card, .contact-grid"
  );
  if ("IntersectionObserver" in window && !reduceMotion) {
    revealTargets.forEach((item) => item.classList.add("reveal"));
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach((item) => observer.observe(item));
  }

  const networkCanvas = document.getElementById("network-canvas");
  const networkContext = networkCanvas && networkCanvas.getContext("2d");
  if (networkContext && !reduceMotion) {
    let width = 0;
    let height = 0;
    let nodes = [];
    let frameId = 0;
    let activeUntil = 0;
    let previousScrollY = window.scrollY;
    let scrollSpeed = 0;
    let columns = 0;
    let rows = 0;
    const gridSpacing = 105;

    const resizeNetwork = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      networkCanvas.width = Math.round(width * pixelRatio);
      networkCanvas.height = Math.round(height * pixelRatio);
      networkContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      columns = Math.ceil(width / gridSpacing) + 1;
      rows = Math.ceil(height / gridSpacing) + 1;
      nodes = Array.from({ length: columns * rows }, (_, index) => {
        const column = index % columns;
        const row = Math.floor(index / columns);
        return {
          x: column * gridSpacing + (Math.random() - .5) * gridSpacing * .28,
          y: row * gridSpacing + (Math.random() - .5) * gridSpacing * .28,
          phase: index * 1.7 + Math.random() * Math.PI * 2,
        };
      });
    };

    const drawNetwork = (time) => {
      const remaining = activeUntil - time;
      if (remaining <= 0) {
        frameId = 0;
        return;
      }

      networkContext.clearRect(0, 0, width, height);
      const fade = Math.min(1, remaining / 260);
      const motion = Math.min(1, scrollSpeed / 12);
      const accent = getComputedStyle(body).getPropertyValue("--accent").trim();
      const points = nodes.map((node) => ({
        x: node.x + Math.sin(time * .00035 + node.phase) * (3 + motion * 7),
        y: node.y + Math.cos(time * .0003 + node.phase) * (3 + motion * 7),
      }));

      networkContext.lineWidth = 1.1;
      networkContext.strokeStyle = accent;
      networkContext.globalAlpha = fade * .58;
      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const current = row * columns + column;
          const neighbors = [];
          if (column + 1 < columns) neighbors.push(current + 1);
          if (row + 1 < rows) {
            neighbors.push(current + columns);
            if (column + 1 < columns) neighbors.push(current + columns + 1);
            if (column > 0) neighbors.push(current + columns - 1);
          }

          neighbors.forEach((neighbor) => {
            networkContext.beginPath();
            networkContext.moveTo(points[current].x, points[current].y);
            networkContext.lineTo(points[neighbor].x, points[neighbor].y);
            networkContext.stroke();
          });
        }
      }

      networkContext.fillStyle = accent;
      networkContext.globalAlpha = fade * .82;
      points.forEach((point) => {
        networkContext.beginPath();
        networkContext.arc(point.x, point.y, 1.6, 0, Math.PI * 2);
        networkContext.fill();
      });
      scrollSpeed *= .88;
      frameId = window.requestAnimationFrame(drawNetwork);
    };

    const animateNetworkOnScroll = () => {
      const currentScrollY = window.scrollY;
      scrollSpeed = Math.min(30, Math.abs(currentScrollY - previousScrollY));
      previousScrollY = currentScrollY;
      activeUntil = performance.now() + 850;
      if (!frameId) frameId = window.requestAnimationFrame(drawNetwork);
    };

    resizeNetwork();
    window.addEventListener("resize", resizeNetwork, { passive: true });
    window.addEventListener("scroll", animateNetworkOnScroll, { passive: true });
  }

  // Custom cursor only on fine-pointer desktop devices; normal cursor remains on touch screens.
  const finePointer = window.matchMedia("(min-width: 1000px) and (pointer: fine)").matches;
  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  if (finePointer && dot && ring && !reduceMotion) {
    body.classList.add("custom-cursor");
    let visible = false;
    window.addEventListener("mousemove", (event) => {
      const x = event.clientX;
      const y = event.clientY;
      dot.style.transform = `translate(${x - 3}px, ${y - 3}px)`;
      ring.style.transform = `translate(${x - 15}px, ${y - 15}px)`;
      dot.style.opacity = "1";
      ring.style.opacity = "1";
      visible = true;
    }, { passive: true });
    document.addEventListener("mouseleave", () => {
      dot.style.opacity = "0";
      ring.style.opacity = "0";
      visible = false;
    });
    document.querySelectorAll("a, button").forEach((element) => {
      element.addEventListener("mouseenter", () => ring.classList.add("is-hover"));
      element.addEventListener("mouseleave", () => ring.classList.remove("is-hover"));
    });
  }
})();
