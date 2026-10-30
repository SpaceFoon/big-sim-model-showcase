// Opens linked gallery images in an accessible, keyboard-friendly viewer.
(() => {
  const imagePath = /\.(?:avif|gif|jpe?g|png|svg|webp)$/i;
  const isImageUrl = (value) => {
    try {
      return imagePath.test(new URL(value, document.baseURI).pathname);
    } catch {
      return false;
    }
  };
  const getGalleryImages = () => {
    const uniqueImages = new Map();
    document.querySelectorAll("img").forEach((thumbnail) => {
      if (thumbnail.getClientRects().length === 0) return;
      const link = thumbnail.closest("a[href]");
      if (link && !isImageUrl(link.href)) return;
      const href = link?.href || thumbnail.currentSrc || thumbnail.src;
      if (!isImageUrl(href)) return;

      const key = new URL(href, document.baseURI).href;
      const item = uniqueImages.get(key) || { href: key, triggers: [] };
      const trigger = { thumbnail, link, card: thumbnail.closest("article, figure") };
      item.triggers.push(trigger);
      uniqueImages.set(key, item);
      thumbnail.classList.add("showcase-lightbox-trigger");
      if (!link) {
        thumbnail.tabIndex = 0;
        thumbnail.setAttribute("role", "button");
        thumbnail.setAttribute("aria-label", `View full-size image: ${thumbnail.alt || "Gallery image"}`);
      }
    });
    return Array.from(uniqueImages.values());
  };

  const dialog = document.createElement("dialog");
  dialog.className = "showcase-lightbox";
  dialog.setAttribute("aria-labelledby", "showcase-lightbox-title");
  dialog.setAttribute("aria-describedby", "showcase-lightbox-description");
  dialog.innerHTML = `
    <div class="showcase-lightbox__toolbar">
      <h2 class="showcase-lightbox__title" id="showcase-lightbox-title"></h2>
      <div class="showcase-lightbox__zoom-controls" role="group" aria-label="Image zoom controls">
        <button class="showcase-lightbox__button showcase-lightbox__zoom-out" type="button" aria-label="Zoom out" disabled>−</button>
        <output class="showcase-lightbox__zoom-level">100%</output>
        <button class="showcase-lightbox__button showcase-lightbox__zoom-in" type="button" aria-label="Zoom in">+</button>
        <button class="showcase-lightbox__button showcase-lightbox__zoom-fit" type="button" aria-label="Fit image to viewer" disabled>Fit</button>
      </div>
      <button class="showcase-lightbox__button showcase-lightbox__close" type="button" aria-label="Close image viewer">
        <span class="showcase-lightbox__close-mark" aria-hidden="true">×</span><span>Close</span>
      </button>
    </div>
    <div class="showcase-lightbox__stage">
      <button class="showcase-lightbox__button showcase-lightbox__step showcase-lightbox__previous" type="button" aria-label="Previous image">←</button>
      <img class="showcase-lightbox__image" alt="" role="button" tabindex="0" draggable="false" aria-pressed="false">
      <button class="showcase-lightbox__button showcase-lightbox__step showcase-lightbox__next" type="button" aria-label="Next image">→</button>
    </div>
    <div class="showcase-lightbox__caption">
      <p class="showcase-lightbox__description" id="showcase-lightbox-description"></p>
      <div class="showcase-lightbox__status">
        <span class="showcase-lightbox__counter" aria-live="polite"></span>
        <span>Scroll, pinch, or +/− to zoom · drag to pan · ← / → browse · Esc close</span>
      </div>
    </div>`;

  const image = dialog.querySelector(".showcase-lightbox__image");
  const title = dialog.querySelector(".showcase-lightbox__title");
  const description = dialog.querySelector(".showcase-lightbox__description");
  const counter = dialog.querySelector(".showcase-lightbox__counter");
  const zoomInButton = dialog.querySelector(".showcase-lightbox__zoom-in");
  const zoomOutButton = dialog.querySelector(".showcase-lightbox__zoom-out");
  const zoomFitButton = dialog.querySelector(".showcase-lightbox__zoom-fit");
  const zoomLevel = dialog.querySelector(".showcase-lightbox__zoom-level");
  const closeButton = dialog.querySelector(".showcase-lightbox__close");
  const previousButton = dialog.querySelector(".showcase-lightbox__previous");
  const nextButton = dialog.querySelector(".showcase-lightbox__next");
  const stage = dialog.querySelector(".showcase-lightbox__stage");
  let items = [];
  let currentIndex = 0;
  let opener = null;
  let zoomScale = 1;
  let panX = 0;
  let panY = 0;
  let dragSession = null;
  let pinchSession = null;
  let touchGesturePinched = false;
  const activeTouchPointers = new Map();
  let suppressImageClick = false;
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 5;
  const ZOOM_STEP = 1.25;

  const textFor = (element) => element?.textContent?.trim() || "";

  function constrainPan() {
    const maxX = Math.max(0, (image.offsetWidth * zoomScale - stage.clientWidth) / 2);
    const maxY = Math.max(0, (image.offsetHeight * zoomScale - stage.clientHeight) / 2);
    panX = Math.max(-maxX, Math.min(maxX, panX));
    panY = Math.max(-maxY, Math.min(maxY, panY));
    image.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${zoomScale})`;
  }

  function updateZoomControls() {
    const zoomed = zoomScale > 1;
    image.classList.toggle("is-zoomed", zoomed);
    image.setAttribute("aria-pressed", String(zoomed));
    image.setAttribute("aria-label", `${zoomed ? "Reset zoom" : "Zoom image"}: ${title.textContent}`);
    zoomLevel.textContent = `${Math.round(zoomScale * 100)}%`;
    zoomOutButton.disabled = zoomScale <= MIN_ZOOM;
    zoomInButton.disabled = zoomScale >= MAX_ZOOM;
    zoomFitButton.disabled = zoomScale <= MIN_ZOOM;
  }

  function setZoom(nextScale, anchorEvent = null) {
    if (!image.naturalWidth) return;
    const previousScale = zoomScale;
    zoomScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, nextScale));
    if (zoomScale <= MIN_ZOOM) {
      zoomScale = MIN_ZOOM;
      panX = 0;
      panY = 0;
      dragSession = null;
      image.classList.remove("is-dragging");
    } else if (anchorEvent) {
      const rect = stage.getBoundingClientRect();
      const focalX = anchorEvent.clientX - (rect.left + rect.width / 2);
      const focalY = anchorEvent.clientY - (rect.top + rect.height / 2);
      panX = focalX - ((focalX - panX) / previousScale) * zoomScale;
      panY = focalY - ((focalY - panY) / previousScale) * zoomScale;
    } else if (previousScale > 0) {
      panX *= zoomScale / previousScale;
      panY *= zoomScale / previousScale;
    }
    constrainPan();
    updateZoomControls();
  }

  function resetImageView() {
    zoomScale = 1;
    panX = 0;
    panY = 0;
    dragSession = null;
    pinchSession = null;
    touchGesturePinched = false;
    image.classList.remove("is-zoomed", "is-dragging");
    image.style.transform = "translate3d(0, 0, 0) scale(1)";
    image.setAttribute("aria-pressed", "false");
    activeTouchPointers.clear();
    updateZoomControls();
  }

  function showImage(index, selectedTrigger = null) {
    if (!items.length) return;
    currentIndex = (index + items.length) % items.length;
    const item = items[currentIndex];
    const trigger = selectedTrigger || item.triggers[0];
    const thumbnail = trigger.thumbnail;
    const card = trigger.card;
    const cardTitle = textFor(card?.querySelector("h2, h3"));
    const linkLabel = trigger.link?.getAttribute("aria-label")?.replace(/^open full size image:\s*/i, "").trim();
    const imageTitle = cardTitle || linkLabel || thumbnail?.alt || "Gallery image";
    const cardDescription = textFor(card?.querySelector(".caption p, figcaption p, .battle-caption p, .caption .credit, p"));

    image.src = item.href;
    image.alt = thumbnail?.alt || imageTitle;
    image.setAttribute("aria-label", `Zoom image: ${imageTitle}`);
    title.textContent = imageTitle;
    resetImageView();
    description.textContent = cardDescription;
    description.hidden = !cardDescription;
    counter.textContent = `${currentIndex + 1} of ${items.length}`;
    previousButton.hidden = items.length < 2;
    nextButton.hidden = items.length < 2;
  }

  closeButton.addEventListener("click", () => dialog.close());
  zoomInButton.addEventListener("click", () => setZoom(zoomScale * ZOOM_STEP));
  zoomOutButton.addEventListener("click", () => setZoom(zoomScale / ZOOM_STEP));
  zoomFitButton.addEventListener("click", () => setZoom(MIN_ZOOM));
  previousButton.addEventListener("click", () => showImage(currentIndex - 1));
  nextButton.addEventListener("click", () => showImage(currentIndex + 1));
  image.addEventListener("click", (event) => {
    if (suppressImageClick) {
      suppressImageClick = false;
      event.preventDefault();
      return;
    }
    setZoom(zoomScale > MIN_ZOOM ? MIN_ZOOM : 2, event);
  });
  image.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    setZoom(zoomScale > MIN_ZOOM ? MIN_ZOOM : 2);
  });
  image.addEventListener("dragstart", (event) => event.preventDefault());
  image.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch") {
      activeTouchPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      image.setPointerCapture(event.pointerId);
      if (activeTouchPointers.size === 2) {
        touchGesturePinched = true;
        const [first, second] = Array.from(activeTouchPointers.values());
        const centerX = (first.x + second.x) / 2;
        const centerY = (first.y + second.y) / 2;
        const rect = stage.getBoundingClientRect();
        pinchSession = {
          distance: Math.max(1, Math.hypot(second.x - first.x, second.y - first.y)),
          scale: zoomScale,
          focalX: (centerX - (rect.left + rect.width / 2) - panX) / zoomScale,
          focalY: (centerY - (rect.top + rect.height / 2) - panY) / zoomScale,
        };
        dragSession = null;
      pinchSession = null;
        image.classList.remove("is-dragging");
      } else if (activeTouchPointers.size === 1 && zoomScale > MIN_ZOOM) {
        dragSession = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          startPanX: panX,
          startPanY: panY,
          moved: false,
        };
      }
      return;
    }
    if (zoomScale <= 1 || event.button !== 0) return;
    dragSession = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startPanX: panX,
      startPanY: panY,
      moved: false,
    };
    image.setPointerCapture(event.pointerId);
  });
  image.addEventListener("pointermove", (event) => {
    if (activeTouchPointers.has(event.pointerId)) {
      activeTouchPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pinchSession && activeTouchPointers.size >= 2) {
        const [first, second] = Array.from(activeTouchPointers.values());
        const centerX = (first.x + second.x) / 2;
        const centerY = (first.y + second.y) / 2;
        const distance = Math.max(1, Math.hypot(second.x - first.x, second.y - first.y));
        const rect = stage.getBoundingClientRect();
        zoomScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, pinchSession.scale * distance / pinchSession.distance));
        if (zoomScale <= MIN_ZOOM) {
          panX = 0;
          panY = 0;
        } else {
          panX = centerX - (rect.left + rect.width / 2) - pinchSession.focalX * zoomScale;
          panY = centerY - (rect.top + rect.height / 2) - pinchSession.focalY * zoomScale;
        }
        constrainPan();
        updateZoomControls();
        event.preventDefault();
        return;
      }
    }
    if (!dragSession || dragSession.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - dragSession.startX;
    const deltaY = event.clientY - dragSession.startY;
    if (!dragSession.moved && Math.hypot(deltaX, deltaY) < 3) return;
    dragSession.moved = true;
    event.preventDefault();
    image.classList.add("is-dragging");
    panX = dragSession.startPanX + deltaX;
    panY = dragSession.startPanY + deltaY;
    constrainPan();
  });
  const finishPan = (event) => {
    if (activeTouchPointers.has(event.pointerId)) {
      const didMove = dragSession?.pointerId === event.pointerId && dragSession.moved;
      activeTouchPointers.delete(event.pointerId);
      if (image.hasPointerCapture(event.pointerId)) image.releasePointerCapture(event.pointerId);
      pinchSession = null;
      if (activeTouchPointers.size === 1 && zoomScale > MIN_ZOOM) {
        const [[pointerId, point]] = activeTouchPointers;
        dragSession = {
          pointerId,
          startX: point.x,
          startY: point.y,
          startPanX: panX,
          startPanY: panY,
          moved: false,
        };
      } else if (activeTouchPointers.size === 0) {
        dragSession = null;
        if (didMove || touchGesturePinched) {
          suppressImageClick = true;
          window.setTimeout(() => { suppressImageClick = false; }, 0);
        }
        touchGesturePinched = false;
      }
      image.classList.remove("is-dragging");
      return;
    }
    if (!dragSession || dragSession.pointerId !== event.pointerId) return;
    const didMove = dragSession.moved;
    dragSession = null;
    image.classList.remove("is-dragging");
    if (didMove) {
      suppressImageClick = true;
      window.setTimeout(() => { suppressImageClick = false; }, 0);
    }
    if (image.hasPointerCapture(event.pointerId)) image.releasePointerCapture(event.pointerId);
  };
  image.addEventListener("pointerup", finishPan);
  image.addEventListener("pointercancel", finishPan);
  stage.addEventListener("wheel", (event) => {
    event.preventDefault();
    const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16
      : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? stage.clientHeight
        : 1;
    const delta = event.deltaY * unit;
    setZoom(zoomScale * Math.exp(-delta * 0.002), event);
  }, { passive: false });
  window.addEventListener("resize", () => {
    if (zoomScale > 1) constrainPan();
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" && items.length > 1) {
      event.preventDefault();
      showImage(currentIndex - 1);
    } else if (event.key === "ArrowRight" && items.length > 1) {
      event.preventDefault();
      showImage(currentIndex + 1);
    } else if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      setZoom(zoomScale * ZOOM_STEP);
    } else if (event.key === "-") {
      event.preventDefault();
      setZoom(zoomScale / ZOOM_STEP);
    } else if (event.key === "0") {
      event.preventDefault();
      setZoom(MIN_ZOOM);
    }
  });
  dialog.addEventListener("close", () => {
    image.removeAttribute("src");
    resetImageView();
    if (opener?.isConnected && opener.getClientRects().length) opener.focus({ preventScroll: true });
    opener = null;
  });

  document.querySelectorAll("a[href]").forEach((link) => {
    if (link.querySelector("img") && imagePath.test(new URL(link.href, document.baseURI).pathname)) {
      link.classList.add("showcase-lightbox-trigger");
    }
  });

  document.addEventListener("click", (event) => {
    const thumbnail = event.target instanceof Element ? event.target.closest("img") : null;
    const link = thumbnail?.closest("a[href]") || null;
    if (
      !thumbnail ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      (link?.target && link.target !== "_self") ||
      (link && !isImageUrl(link.href))
    ) return;

    items = getGalleryImages();
    currentIndex = items.findIndex((item) => item.triggers.some((trigger) => trigger.thumbnail === thumbnail));
    if (currentIndex < 0 || typeof dialog.showModal !== "function") return;

    if (link) event.preventDefault();
    opener = link || thumbnail;
    const selectedTrigger = items[currentIndex].triggers.find((trigger) => trigger.thumbnail === thumbnail);
    showImage(currentIndex, selectedTrigger);
    dialog.showModal();
    closeButton.focus({ preventScroll: true });
  });

  document.addEventListener("keydown", (event) => {
    const thumbnail = event.target instanceof Element ? event.target.closest("img.showcase-lightbox-trigger") : null;
    if (!thumbnail || thumbnail.closest("a[href]") || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    items = getGalleryImages();
    currentIndex = items.findIndex((item) => item.triggers.some((trigger) => trigger.thumbnail === thumbnail));
    if (currentIndex < 0 || typeof dialog.showModal !== "function") return;
    opener = thumbnail;
    showImage(currentIndex);
    dialog.showModal();
    closeButton.focus({ preventScroll: true });
  });

  document.body.append(dialog);
})();
