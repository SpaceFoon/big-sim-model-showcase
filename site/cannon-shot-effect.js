// Adds a brief orange flash and sparks on the cannon GIF's own firing frame.
(() => {
  const card = document.querySelector(".motion-card.cannon-firing");
  if (!card) return;

  const stage = card.querySelector(".cannon-stage");
  const image = stage?.querySelector("img");
  const canvas = stage?.querySelector(".cannon-shot-canvas");
  const context = canvas?.getContext("2d");
  if (!stage || !image || !canvas || !context) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const probeCanvas = document.createElement("canvas");
  const probeContext = probeCanvas.getContext("2d", { willReadFrequently: true });
  if (!probeContext) return;

  // The source capture has a one-frame orange discharge inside this muzzle window.
  const flashWindow = { x: 190, y: 250, width: 110, height: 110 };
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let animationFrame = 0;
  let inView = true;
  let previousFlash = false;
  let burstStart = null;
  let burstPosition = null;

  function resize() {
    const box = stage.getBoundingClientRect();
    width = box.width;
    height = box.height;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(width * pixelRatio));
    canvas.height = Math.max(1, Math.round(height * pixelRatio));
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    if (reducedMotion.matches && image.naturalWidth) drawStaticBurst();
  }

  function frameGeometry(sourceX = 279, sourceY = 331) {
    const naturalRatio = image.naturalWidth / image.naturalHeight;
    const frameWidth = Math.min(width, height * naturalRatio);
    const frameHeight = frameWidth / naturalRatio;
    const scale = frameWidth / image.naturalWidth;
    return {
      x: (width - frameWidth) / 2 + sourceX * scale,
      y: (height - frameHeight) / 2 + sourceY * scale,
      scale,
    };
  }

  function detectMuzzleFlash() {
    if (!image.complete || image.naturalWidth < 301 || image.naturalHeight < 361) return null;

    try {
      probeCanvas.width = flashWindow.width;
      probeCanvas.height = flashWindow.height;
      probeContext.drawImage(
        image,
        flashWindow.x,
        flashWindow.y,
        flashWindow.width,
        flashWindow.height,
        0,
        0,
        flashWindow.width,
        flashWindow.height,
      );
      const pixels = probeContext.getImageData(0, 0, flashWindow.width, flashWindow.height).data;
      let hits = 0;
      let sumX = 0;
      let sumY = 0;

      for (let y = 0; y < flashWindow.height; y += 1) {
        for (let x = 0; x < flashWindow.width; x += 1) {
          const index = (y * flashWindow.width + x) * 4;
          const red = pixels[index];
          const green = pixels[index + 1];
          const blue = pixels[index + 2];
          if (red > 220 && green > 55 && green < 205 && blue < 55 && red > green * 1.35) {
            hits += 1;
            sumX += x + flashWindow.x;
            sumY += y + flashWindow.y;
          }
        }
      }

      if (hits < 180) return null;
      const sourceScale = image.naturalWidth / 960;
      return {
        sourceX: sumX / hits + 38 * sourceScale,
        sourceY: sumY / hits - 2 * sourceScale,
      };
    } catch {
      return null;
    }
  }

  function hash(index, channel) {
    const value = Math.sin((index + 1) * 127.1 + (channel + 1) * 311.7) * 43758.5453;
    return value - Math.floor(value);
  }

  function rgba(red, green, blue, alpha) {
    return "rgba(" + red + "," + green + "," + blue + "," + alpha + ")";
  }

  function drawStaticBurst() {
    if (!image.naturalWidth || !width || !height) return;
    context.clearRect(0, 0, width, height);
    const muzzle = frameGeometry();
    drawBurst(0.04, muzzle.x, muzzle.y, muzzle.scale);
  }

  function drawBurst(age, x, y, scale) {
    context.save();
    context.globalCompositeOperation = "lighter";

    if (age < 0.19) {
      const fade = Math.pow(Math.max(0, 1 - age / 0.19), 1.18);
      const pulse = 1.08 - 0.22 * Math.min(1, age / 0.055);
      const glow = context.createRadialGradient(x - 44 * scale, y, 0, x - 44 * scale, y, 222 * scale * pulse);
      glow.addColorStop(0, rgba(255, 255, 247, fade));
      glow.addColorStop(0.11, rgba(255, 250, 207, 0.98 * fade));
      glow.addColorStop(0.28, rgba(255, 190, 45, 0.94 * fade));
      glow.addColorStop(0.58, rgba(255, 78, 2, 0.63 * fade));
      glow.addColorStop(0.84, rgba(255, 39, 0, 0.24 * fade));
      glow.addColorStop(1, "rgba(255,48,0,0)");
      context.fillStyle = glow;
      context.fillRect(x - 306 * scale, y - 218 * scale, 314 * scale, 436 * scale);

      const flame = context.createLinearGradient(x - 188 * scale, y, x + 12 * scale, y);
      flame.addColorStop(0, rgba(231, 45, 0, 0.72 * fade));
      flame.addColorStop(0.35, rgba(255, 91, 3, 0.94 * fade));
      flame.addColorStop(0.76, rgba(255, 174, 35, 0.98 * fade));
      flame.addColorStop(1, rgba(255, 239, 157, 0.94 * fade));
      context.beginPath();
      context.moveTo(x + 5 * scale, y - 5 * scale);
      context.bezierCurveTo(x - 26 * scale, y - 27 * scale, x - 61 * scale, y - 42 * scale, x - 105 * scale, y - 22 * scale);
      context.bezierCurveTo(x - 124 * scale, y - 15 * scale, x - 155 * scale, y - 17 * scale, x - 188 * scale, y + 1 * scale);
      context.bezierCurveTo(x - 151 * scale, y + 4 * scale, x - 129 * scale, y + 18 * scale, x - 86 * scale, y + 27 * scale);
      context.bezierCurveTo(x - 46 * scale, y + 29 * scale, x - 18 * scale, y + 13 * scale, x + 5 * scale, y + 6 * scale);
      context.closePath();
      context.fillStyle = flame;
      context.fill();

      const hotCore = context.createLinearGradient(x - 142 * scale, y, x + 8 * scale, y);
      hotCore.addColorStop(0, rgba(255, 132, 13, 0.82 * fade));
      hotCore.addColorStop(0.48, rgba(255, 229, 99, fade));
      hotCore.addColorStop(1, rgba(255, 255, 255, fade));
      context.beginPath();
      context.moveTo(x + 5 * scale, y - 4 * scale);
      context.quadraticCurveTo(x - 28 * scale, y - 18 * scale, x - 69 * scale, y - 10 * scale);
      context.lineTo(x - 130 * scale, y + 1 * scale);
      context.quadraticCurveTo(x - 56 * scale, y + 8 * scale, x + 5 * scale, y + 4 * scale);
      context.closePath();
      context.fillStyle = hotCore;
      context.fill();

      context.strokeStyle = rgba(255, 190, 75, 0.78 * fade);
      context.lineWidth = 2.2 * scale;
      context.lineCap = "round";
      for (let ray = 0; ray < 7; ray += 1) {
        const angle = Math.PI + (ray - 3) * 0.24;
        const inner = 24 * scale;
        const outer = (48 + hash(ray, 8) * 52) * scale;
        context.beginPath();
        context.moveTo(x + Math.cos(angle) * inner, y + Math.sin(angle) * inner * 0.6);
        context.lineTo(x + Math.cos(angle) * outer, y + Math.sin(angle) * outer * 0.6);
        context.stroke();
      }
    }

    if (age < 0.38) {
      const progress = age / 0.38;
      const fade = Math.pow(1 - progress, 0.8);
      for (let tongue = 0; tongue < 4; tongue += 1) {
        const side = tongue - 1.5;
        const length = (76 + hash(tongue, 2) * 45) * scale * (1 - progress * 0.2);
        context.beginPath();
        context.moveTo(x - 4 * scale, y + side * 4 * scale);
        context.bezierCurveTo(
          x - 26 * scale, y + side * 12 * scale - 8 * scale,
          x - length * 0.62, y + side * 17 * scale,
          x - length, y + side * 10 * scale,
        );
        context.bezierCurveTo(
          x - length * 0.68, y + side * 8 * scale + 9 * scale,
          x - 28 * scale, y + side * 9 * scale + 8 * scale,
          x - 4 * scale, y + side * 3 * scale,
        );
        context.closePath();
        context.fillStyle = tongue % 2 === 0
          ? rgba(255, 117, 8, 0.78 * fade)
          : rgba(255, 196, 48, 0.74 * fade);
        context.fill();
      }
    }

    for (let spark = 0; spark < 7; spark += 1) {
      const launch = hash(spark, 0) * 0.035;
      const life = 0.3 + hash(spark, 1) * 0.17;
      const travel = age - launch;
      if (travel < 0 || travel >= life) continue;

      const spread = hash(spark, 2) * 2 - 1;
      const speed = (700 + hash(spark, 4) * 300) * scale;
      const angle = Math.PI + spread * 0.9;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed + (hash(spark, 3) - 0.5) * 24 * scale;
      const startX = x - (5 + hash(spark, 6) * 17) * scale;
      const startY = y + (hash(spark, 5) - 0.5) * 10 * scale;
      const sparkX = startX + vx * travel;
      const gravity = 170 * scale;
      const sparkY = startY + vy * travel + gravity * travel * travel;
      const tail = Math.min(0.09, travel);
      const tailAge = Math.max(0, travel - tail);
      const tailX = startX + vx * tailAge;
      const tailY = startY + vy * tailAge + gravity * tailAge * tailAge;
      const opacity = Math.pow(1 - travel / life, 0.72);

      const sparkScale = Math.max(scale, 0.85);
      context.lineWidth = (1.8 + hash(spark, 7) * 1.5) * sparkScale;
      context.strokeStyle = rgba(255, 105, 8, opacity);
      context.shadowColor = "rgba(255,78,0,.98)";
      context.shadowBlur = 5 * sparkScale;
      context.beginPath();
      context.moveTo(sparkX, sparkY);
      context.lineTo(tailX, tailY);
      context.stroke();
      context.shadowBlur = 0;
      context.fillStyle = rgba(255, 243, 187, opacity);
      context.beginPath();
      context.arc(sparkX, sparkY, (1.4 + hash(spark, 8)) * sparkScale, 0, Math.PI * 2);
      context.fill();
    }

    context.restore();
  }

  function render(now) {
    animationFrame = 0;
    if (!image.naturalWidth || !width || !height) return;
    context.clearRect(0, 0, width, height);

    const flash = detectMuzzleFlash();
    if (flash && !previousFlash) {
      burstStart = now;
      burstPosition = frameGeometry(flash.sourceX, flash.sourceY);
    }
    previousFlash = Boolean(flash);

    if (burstStart !== null) {
      const age = (now - burstStart) / 1000;
      if (age < 0.52 && burstPosition) {
        drawBurst(age, burstPosition.x, burstPosition.y, burstPosition.scale);
      } else {
        burstStart = null;
        burstPosition = null;
      }
    }

    if (!reducedMotion.matches && inView && !document.hidden) {
      animationFrame = requestAnimationFrame(render);
    }
  }

  function startLoop() {
    if (reducedMotion.matches || !inView || document.hidden) return;
    if (!animationFrame) animationFrame = requestAnimationFrame(render);
  }

  function stopLoop() {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    previousFlash = false;
    burstStart = null;
    burstPosition = null;
  }

  function onImageLoad() {
    stopLoop();
    probeCanvas.width = flashWindow.width;
    probeCanvas.height = flashWindow.height;
    resize();
    if (reducedMotion.matches) {
      drawStaticBurst();
      return;
    }
    startLoop();
  }

  image.addEventListener("load", onImageLoad);
  if (image.complete && image.naturalWidth) onImageLoad();

  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(stage);
  else window.addEventListener("resize", resize, { passive: true });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (!inView) stopLoop();
      else if (!reducedMotion.matches && image.complete) startLoop();
    }).observe(card);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopLoop();
    } else if (!reducedMotion.matches && inView && image.complete) {
      startLoop();
    }
  });

  reducedMotion.addEventListener("change", () => {
    stopLoop();
    if (reducedMotion.matches) {
      drawStaticBurst();
    } else if (image.complete && image.naturalWidth) {
      resize();
      startLoop();
    }
  });
})();
