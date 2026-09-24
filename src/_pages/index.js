/**
 * metroKUBIKO Planea — Interactive Timeline Engine & Waitlist Form Handling
 */

// ================================================================
// 1. FLOWS DATA & TIMELINE ENGINE (LAURA IA + PRECIOS WEB)
// ================================================================
const flowsData = {
  bim: {
    desc: "Sube tu archivo IFC y Planea extrae cantidades de obra automáticamente a partir del modelo. Laura IA busca los precios en la web o utiliza tus bases importadas para armar el presupuesto.",
    badge: "IFC BIM",
    label: "Extrayendo geometría IFC..."
  },
  prompt: {
    desc: "Describe el proyecto en tus palabras — tipo de obra, área, acabados, alcance — y Planea rastrea en internet insumos acordes para estructurar el presupuesto y cronograma.",
    badge: "LENGUAJE NATURAL",
    label: "Interpretando prompt..."
  },
  manual: {
    desc: "Arma actividades, cantidades y precios tú mismo, sube tus bases propias o deja que la IA busque precios y complementos en la web.",
    badge: "MANUAL + IA",
    label: "Cargando actividades y bases..."
  }
};

const PlaneaDemo = {
  flow: "bim",
  state: "idle",
  timerId: null,
  stepTimeouts: [],
  startTime: 0,
  cycleDuration: 7200,
  isInView: false,
  isReducedMotion: typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false,

  init() {
    this.cacheDOM();
    if (!this.viewBim && !this.playbackBtn) return;
    this.bindEvents();
    this.setupObserver();
    this.setFlow("bim", false);
  },

  cacheDOM() {
    this.dot = document.getElementById("demo-dot");
    this.phaseText = document.getElementById("demo-phase-name");
    this.timerText = document.getElementById("demo-timer-num");
    this.inputBadge = document.getElementById("input-type-badge");
    this.playbackBtn = document.getElementById("demo-playback-btn");
    this.playbackIcon = document.getElementById("playback-icon");
    this.playbackText = document.getElementById("playback-text");

    // Views
    this.viewBim = document.getElementById("view-bim");
    this.viewPrompt = document.getElementById("view-prompt");
    this.viewManual = document.getElementById("view-manual");
    this.manualAiChip = document.getElementById("manual-ai-chip");

    // Laura metrics
    this.metrics = [
      document.getElementById("m-1"),
      document.getElementById("m-2"),
      document.getElementById("m-3")
    ];

    // Budget
    this.bRows = [
      document.getElementById("b-1"),
      document.getElementById("b-2"),
      document.getElementById("b-3"),
      document.getElementById("b-4"),
      document.getElementById("b-5")
    ];
    this.bTotal = document.getElementById("b-tot");

    // Gantt
    this.gBars = [
      document.getElementById("gb-1"),
      document.getElementById("gb-2"),
      document.getElementById("gb-3"),
      document.getElementById("gb-4"),
      document.getElementById("gb-5")
    ];
    this.gFoot = document.getElementById("g-foot");
    this.readyBanner = document.getElementById("ready-banner");
  },

  bindEvents() {
    const tabs = document.querySelectorAll(".flow-tab");
    const descEl = document.getElementById("flow-desc");

    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        const flowKey = tab.dataset.flow;
        if (descEl && flowsData[flowKey]) {
          descEl.textContent = flowsData[flowKey].desc;
        }
        this.setFlow(flowKey, true);
      });
    });

    if (this.playbackBtn) {
      this.playbackBtn.addEventListener("click", () => {
        if (this.state === "running") {
          this.pause();
        } else if (this.state === "paused") {
          this.resume();
        } else {
          this.play();
        }
      });
    }
  },

  setupObserver() {
    const target = document.getElementById("como-funciona");
    if (!target || !("IntersectionObserver" in window)) {
      this.play();
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          this.isInView = true;
          if (this.state === "idle") {
            this.play();
          }
        } else {
          this.isInView = false;
          if (this.state === "running") {
            this.pause();
          }
        }
      });
    }, { threshold: 0.25 });
    obs.observe(target);
  },

  setFlow(flowKey, restart = true) {
    this.flow = flowKey;
    this.clearTimeouts();

    if (this.inputBadge && flowsData[flowKey]) {
      this.inputBadge.textContent = flowsData[flowKey].badge;
    }

    if (this.viewBim) this.viewBim.style.display = (flowKey === "bim") ? "flex" : "none";
    if (this.viewPrompt) this.viewPrompt.style.display = (flowKey === "prompt") ? "flex" : "none";
    if (this.viewManual) this.viewManual.style.display = (flowKey === "manual") ? "flex" : "none";

    if (this.isReducedMotion) {
      this.showInstantState();
      return;
    }

    this.resetStates();
    if (restart && this.isInView) {
      this.play();
    }
  },

  resetStates() {
    [this.viewBim, this.viewPrompt, this.viewManual].forEach(el => el && el.classList.remove("show"));
    if (this.manualAiChip) this.manualAiChip.classList.remove("show");

    this.metrics.forEach(m => m && m.classList.remove("show"));
    this.bRows.forEach(r => r && r.classList.remove("show"));
    if (this.bTotal) this.bTotal.classList.remove("show");
    this.gBars.forEach(b => b && b.classList.remove("active"));
    if (this.gFoot) this.gFoot.classList.remove("show");
    if (this.readyBanner) this.readyBanner.classList.remove("visible");
    if (this.dot) {
      this.dot.classList.remove("done");
      this.dot.classList.remove("paused");
    }
  },

  showInstantState() {
    this.state = "finished";
    const activeView = (this.flow === "bim") ? this.viewBim : (this.flow === "prompt" ? this.viewPrompt : this.viewManual);
    if (activeView) activeView.classList.add("show");
    if (this.manualAiChip) this.manualAiChip.classList.add("show");
    this.metrics.forEach(m => m && m.classList.add("show"));
    this.bRows.forEach(r => r && r.classList.add("show"));
    if (this.bTotal) this.bTotal.classList.add("show");
    this.gBars.forEach(b => b && b.classList.add("active"));
    if (this.gFoot) this.gFoot.classList.add("show");
    if (this.readyBanner) this.readyBanner.classList.add("visible");
    if (this.dot) {
      this.dot.classList.remove("paused");
      this.dot.classList.add("done");
    }
    if (this.phaseText) this.phaseText.textContent = "Presupuesto y cronograma listos";
    if (this.timerText) this.timerText.textContent = "7.2s / 7.2s · Finalizado";
    this.updatePlaybackButton("finished");
  },

  clearTimeouts() {
    this.stepTimeouts.forEach(t => clearTimeout(t));
    this.stepTimeouts = [];
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  },

  schedule(fn, delay) {
    const id = setTimeout(fn, delay);
    this.stepTimeouts.push(id);
  },

  play() {
    this.clearTimeouts();
    this.resetStates();
    this.state = "running";
    this.updatePlaybackButton("running");

    if (this.isReducedMotion) {
      this.showInstantState();
      return;
    }

    this.startTime = Date.now();
    this.runTimer();

    // T: 0.1s -> Input
    this.schedule(() => {
      const v = (this.flow === "bim") ? this.viewBim : (this.flow === "prompt" ? this.viewPrompt : this.viewManual);
      if (v) v.classList.add("show");
      if (this.phaseText && flowsData[this.flow]) this.phaseText.textContent = flowsData[this.flow].label;
    }, 100);

    // T: 0.7s -> Manual AI Chip
    if (this.flow === "manual") {
      this.schedule(() => {
        if (this.manualAiChip) this.manualAiChip.classList.add("show");
      }, 700);
    }

    // T: 1.2s -> Laura IA + Buscador Web
    this.schedule(() => {
      if (this.phaseText) this.phaseText.textContent = "Laura: rastreando precios web y aplicando bases...";
    }, 1200);

    // T: 1.6s - 2.3s -> Core metrics
    this.schedule(() => { if (this.metrics[0]) this.metrics[0].classList.add("show"); }, 1600);
    this.schedule(() => { if (this.metrics[1]) this.metrics[1].classList.add("show"); }, 1950);
    this.schedule(() => { if (this.metrics[2]) this.metrics[2].classList.add("show"); }, 2300);

    // T: 2.7s - 3.7s -> Budget rows
    this.schedule(() => {
      if (this.phaseText) this.phaseText.textContent = "Generando presupuesto detallado...";
      if (this.bRows[0]) this.bRows[0].classList.add("show");
    }, 2700);
    this.schedule(() => { if (this.bRows[1]) this.bRows[1].classList.add("show"); }, 2950);
    this.schedule(() => { if (this.bRows[2]) this.bRows[2].classList.add("show"); }, 3200);
    this.schedule(() => { if (this.bRows[3]) this.bRows[3].classList.add("show"); }, 3450);
    this.schedule(() => { if (this.bRows[4]) this.bRows[4].classList.add("show"); }, 3700);

    // T: 4.1s -> Budget Total
    this.schedule(() => {
      if (this.bTotal) this.bTotal.classList.add("show");
    }, 4100);

    // T: 4.6s - 5.8s -> Gantt CPM Bars
    this.schedule(() => {
      if (this.phaseText) this.phaseText.textContent = "Armando cronograma de obra CPM...";
      if (this.gBars[0]) this.gBars[0].classList.add("active");
    }, 4600);
    this.schedule(() => { if (this.gBars[1]) this.gBars[1].classList.add("active"); }, 4900);
    this.schedule(() => { if (this.gBars[2]) this.gBars[2].classList.add("active"); }, 5200);
    this.schedule(() => { if (this.gBars[3]) this.gBars[3].classList.add("active"); }, 5500);
    this.schedule(() => { if (this.gBars[4]) this.gBars[4].classList.add("active"); }, 5800);

    // T: 6.1s -> Schedule footer & Banner
    this.schedule(() => {
      if (this.gFoot) this.gFoot.classList.add("show");
      if (this.readyBanner) this.readyBanner.classList.add("visible");
      if (this.dot) {
        this.dot.classList.remove("paused");
        this.dot.classList.add("done");
      }
      if (this.phaseText) this.phaseText.textContent = "✓ Presupuesto y cronograma listos";
    }, 6100);

    // T: 7.2s -> Finish cycle
    this.schedule(() => {
      this.finishCycle();
    }, this.cycleDuration);
  },

  finishCycle() {
    this.state = "finished";
    if (this.timerId) clearInterval(this.timerId);
    if (this.timerText) this.timerText.textContent = "7.2s / 7.2s · Finalizado";
    this.updatePlaybackButton("finished");
  },

  pause() {
    if (this.state !== "running") return;
    this.state = "paused";
    this.clearTimeouts();
    if (this.dot) this.dot.classList.add("paused");
    if (this.phaseText) this.phaseText.textContent = "Animación pausada";
    this.updatePlaybackButton("paused");
  },

  resume() {
    this.play();
  },

  updatePlaybackButton(state) {
    if (!this.playbackBtn || !this.playbackIcon || !this.playbackText) return;
    this.playbackBtn.classList.remove("highlight");

    if (state === "running") {
      this.playbackIcon.textContent = "❚❚";
      this.playbackText.textContent = "Pausar";
    } else if (state === "paused") {
      this.playbackIcon.textContent = "▶";
      this.playbackText.textContent = "Reanudar";
      this.playbackBtn.classList.add("highlight");
    } else if (state === "finished") {
      this.playbackIcon.textContent = "↺";
      this.playbackText.textContent = "Reiniciar demo";
      this.playbackBtn.classList.add("highlight");
    }
  },

  runTimer() {
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = setInterval(() => {
      const elapsed = (Date.now() - this.startTime) / 1000;
      if (elapsed <= 7.2 && this.timerText && this.state === "running") {
        this.timerText.textContent = elapsed.toFixed(1) + "s / 7.2s";
      }
    }, 100);
  }
};

// ================================================================
// 2. DISPOSABLE EMAIL DOMAINS LIST (FRONTEND PRE-CHECK)
// ================================================================
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com", "10minutemail.com", "tempmail.com", "temp-mail.org",
  "guerrillamail.com", "guerrillamail.net", "guerrillamail.org", "sharklasers.com",
  "yopmail.com", "trashmail.com", "dispostable.com", "fakeinbox.com",
  "throwawaymail.com", "getairmail.com", "mohmal.com", "crazymailing.com",
  "burnermail.io", "mytemp.email", "nada.ltd", "trashmail.net"
]);

// ================================================================
// 3. WAITLIST FORM HANDLER (HONEYPOT + TURNSTILE + FETCH BACKEND)
// ================================================================
function initWaitlistForm() {
  const form = document.getElementById("waitlist-form");
  const successMsg = document.getElementById("waitlist-success");
  const errorMsg = document.getElementById("waitlist-error");
  const emailInput = document.getElementById("waitlist-email");
  const honeypotInput = document.getElementById("waitlist-hp");
  const submitBtn = document.getElementById("waitlist-btn");
  const btnText = submitBtn ? submitBtn.querySelector(".btn-text") : null;
  const btnLoader = submitBtn ? submitBtn.querySelector(".btn-loader") : null;

  if (!form) return;

  function showError(msg) {
    if (errorMsg) {
      errorMsg.textContent = msg;
      errorMsg.style.display = "block";
    } else {
      alert(msg);
    }
  }

  function clearError() {
    if (errorMsg) {
      errorMsg.textContent = "";
      errorMsg.style.display = "none";
    }
  }

  function setLoading(isLoading) {
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    if (isLoading) {
      submitBtn.classList.add("loading");
      if (btnText) btnText.style.display = "none";
      if (btnLoader) btnLoader.style.display = "inline-flex";
    } else {
      submitBtn.classList.remove("loading");
      if (btnText) btnText.style.display = "inline-flex";
      if (btnLoader) btnLoader.style.display = "none";
    }
  }

  function resetTurnstile() {
    if (typeof window !== "undefined" && window.turnstile) {
      try {
        window.turnstile.reset();
      } catch (err) {
        console.warn("Turnstile reset error:", err);
      }
    }
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    clearError();

    // ------------------------------------------------------------
    // 1. Honeypot check (campo trampa oculto para bots)
    // ------------------------------------------------------------
    if (honeypotInput && honeypotInput.value.trim() !== "") {
      // Simula éxito para despistar al bot sin enviar nada al backend
      console.warn("Bot submission prevented via honeypot.");
      form.style.display = "none";
      if (successMsg) {
        successMsg.style.display = "block";
        successMsg.textContent = "Listo — quedaste en la lista. Te avisaremos con una invitación directa a la plataforma.";
      }
      return;
    }

    // ------------------------------------------------------------
    // 2. Validación de formato de email & descarte de temporales
    // ------------------------------------------------------------
    const rawEmail = emailInput ? emailInput.value.trim().toLowerCase() : "";
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!rawEmail || !emailRegex.test(rawEmail)) {
      showError("Por favor ingresa un correo electrónico válido.");
      emailInput?.focus();
      return;
    }

    const emailDomain = rawEmail.split("@")[1];
    if (emailDomain && DISPOSABLE_EMAIL_DOMAINS.has(emailDomain)) {
      showError("Por favor utiliza un correo corporativo o personal permanente (no correos temporales).");
      emailInput?.focus();
      return;
    }

    // ------------------------------------------------------------
    // 3. Obtención del token de Cloudflare Turnstile
    // ------------------------------------------------------------
    let turnstileToken = "";
    if (typeof window !== "undefined" && window.turnstile) {
      try {
        turnstileToken = window.turnstile.getResponse();
      } catch (err) {
        console.warn("Error getting Turnstile response:", err);
      }
    }

    // Si Turnstile colocó el input hidden tradicional 'cf-turnstile-response'
    if (!turnstileToken) {
      const tsHiddenInput = form.querySelector('[name="cf-turnstile-response"]');
      if (tsHiddenInput && tsHiddenInput.value) {
        turnstileToken = tsHiddenInput.value;
      }
    }

    // Si Cloudflare Turnstile está activo en el DOM pero el usuario no ha completado el reto
    const tsContainer = document.querySelector(".cf-turnstile");
    if (tsContainer && !turnstileToken && typeof window !== "undefined" && window.turnstile) {
      // Verificamos si Turnstile está configurado con sitekey real (no dummy test de sólo carga)
      const siteKey = tsContainer.getAttribute("data-sitekey");
      if (siteKey && !siteKey.startsWith("1x00000000000000000000AA") && !siteKey.startsWith("2x00000000000000000000AB")) {
        showError("Por favor completa la verificación de seguridad antes de continuar.");
        return;
      }
    }

    // ------------------------------------------------------------
    // 4. Envío fetch() al backend (Cloud Function o Astro API route)
    // ------------------------------------------------------------
    setLoading(true);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          email: rawEmail,
          turnstileToken: turnstileToken,
          honeypot: honeypotInput ? honeypotInput.value : "",
          source: "planea-landing",
          timestamp: new Date().toISOString()
        })
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok) {
        // Registro exitoso
        form.style.display = "none";
        if (successMsg) {
          successMsg.style.display = "block";
          if (result.message) {
            successMsg.textContent = result.message;
          }
        }
      } else if (response.status === 409) {
        // Correo ya existente en Firestore (previene duplicados)
        form.style.display = "none";
        if (successMsg) {
          successMsg.style.display = "block";
          successMsg.textContent = result.message || "¡Ya estás registrado en la lista de espera! Pronto recibirás tu invitación.";
        }
      } else {
        // Error de validación o Turnstile inválido
        const msg = result.error || result.message || "Ocurrió un error al procesar tu solicitud. Intenta nuevamente.";
        showError(msg);
        resetTurnstile();
      }
    } catch (err) {
      console.error("Fetch waitlist error:", err);
      // Fallback amigable si la ruta API aún no está desplegada en el entorno de desarrollo
      showError("No fue posible conectar con el servidor. Por favor verifica tu conexión a internet o intenta en unos minutos.");
      resetTurnstile();
    } finally {
      setLoading(false);
    }
  });
}

// ================================================================
// 4. MOBILE NAVIGATION
// ================================================================
function initMobileMenu() {
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector("nav.links");
  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("open");
    });
    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
      });
    });
  }
}

// ================================================================
// 5. LIFECYCLE & INITIALIZATION
// ================================================================
function initPage() {
  PlaneaDemo.init();
  initMobileMenu();
  initWaitlistForm();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPage);
  } else {
    initPage();
  }
  document.addEventListener("astro:page-load", initPage);
}
