/**
 * metroKUBIKO Planea — Tab switcher, Waitlist Form Handling & Navigation
 */

// ================================================================
// 1. TABS CONTENT HANDLER (CÓMO FUNCIONA)
// ================================================================
const flowsDescriptions = {
  bim: "Sube tu archivo IFC y Planea extrae cantidades de obra automáticamente a partir del modelo. Laura IA busca los precios en la web o utiliza tus bases importadas para armar el presupuesto.",
  prompt: "Describe el proyecto en tus palabras — tipo de obra, área, acabados, alcance — y Planea rastrea en internet insumos acordes para estructurar el presupuesto y cronograma.",
  manual: "Arma actividades, cantidades y precios tú mismo, sube tus bases propias o deja que la IA busque precios y complementos en la web."
};

function initFlowTabs() {
  const tabs = document.querySelectorAll(".flow-tab");
  const descEl = document.getElementById("flow-desc");
  if (!tabs.length || !descEl) return;

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const flowKey = tab.dataset.flow;
      if (flowsDescriptions[flowKey]) {
        descEl.textContent = flowsDescriptions[flowKey];
      }
    });
  });
}

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

    // 1. Honeypot check
    if (honeypotInput && honeypotInput.value.trim() !== "") {
      console.warn("Bot submission prevented via honeypot.");
      form.style.display = "none";
      if (successMsg) {
        successMsg.style.display = "block";
        successMsg.textContent = "Listo — quedaste en la lista. Te avisaremos con una invitación directa a la plataforma.";
      }
      return;
    }

    // 2. Validación de formato de email & descarte de temporales
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

    // 3. Obtención del token de Cloudflare Turnstile
    let turnstileToken = "";
    if (typeof window !== "undefined" && window.turnstile) {
      try {
        turnstileToken = window.turnstile.getResponse();
      } catch (err) {
        console.warn("Error getting Turnstile response:", err);
      }
    }

    if (!turnstileToken) {
      const tsHiddenInput = form.querySelector('[name="cf-turnstile-response"]');
      if (tsHiddenInput && tsHiddenInput.value) {
        turnstileToken = tsHiddenInput.value;
      }
    }

    const tsContainer = document.querySelector(".cf-turnstile");
    if (tsContainer && !turnstileToken && typeof window !== "undefined" && window.turnstile) {
      const siteKey = tsContainer.getAttribute("data-sitekey");
      if (siteKey && !siteKey.startsWith("1x00000000000000000000AA") && !siteKey.startsWith("2x00000000000000000000AB")) {
        showError("Por favor completa la verificación de seguridad antes de continuar.");
        return;
      }
    }

    // 4. Envío fetch() al backend
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
        form.style.display = "none";
        if (successMsg) {
          successMsg.style.display = "block";
          if (result.message) {
            successMsg.textContent = result.message;
          }
        }
      } else if (response.status === 409) {
        form.style.display = "none";
        if (successMsg) {
          successMsg.style.display = "block";
          successMsg.textContent = result.message || "¡Ya estás registrado en la lista de espera! Pronto recibirás tu invitación.";
        }
      } else {
        const msg = result.error || result.message || "Ocurrió un error al procesar tu solicitud. Intenta nuevamente.";
        showError(msg);
        resetTurnstile();
      }
    } catch (err) {
      console.error("Fetch waitlist error:", err);
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
  initFlowTabs();
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