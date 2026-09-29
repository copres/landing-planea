/**
 * metroKUBIKO Planea — Tab switcher, Waitlist Modal (with Cloudflare Turnstile) & Navigation
 */

// ================================================================
// CONFIGURACIÓN DE LA CLOUD FUNCTION (SEGÚN README)
// ================================================================
const WAITLIST_CONFIG = {
  endpoint: "/api/waitlist", // o tu Cloud Function directa
  token: ""                  // WAITLIST_TOKEN si se llama directamente a Cloud Functions
};

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
// 3. WAITLIST MODAL + TURNSTILE HANDLER
// ================================================================
function initWaitlistModal() {
  const modal = document.getElementById("waitlist-modal");
  const closeBtn = document.getElementById("modal-close-btn");
  const closeSuccessBtn = document.getElementById("modal-close-success-btn");
  const form = document.getElementById("modal-waitlist-form");
  const successBox = document.getElementById("modal-success");
  const successMsg = document.getElementById("modal-success-msg");
  const errorMsg = document.getElementById("modal-error");
  const submitBtn = document.getElementById("modal-submit-btn");
  const btnText = submitBtn ? submitBtn.querySelector(".btn-text") : null;
  const btnLoader = submitBtn ? submitBtn.querySelector(".btn-loader") : null;

  if (!modal || !form) return;

  function resetTurnstile() {
    if (typeof window !== "undefined" && window.turnstile) {
      try {
        window.turnstile.reset();
      } catch (err) {
        console.warn("Turnstile reset error:", err);
      }
    }
  }

  function openModal() {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    clearError();

    if (successBox && successBox.style.display === "flex") {
      successBox.style.display = "none";
      form.style.display = "flex";
      form.reset();
      resetTurnstile();
    }

    const nameInput = document.getElementById("m-name");
    nameInput?.focus();
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  document.querySelectorAll("[data-open-waitlist], a[href='#lista-espera']").forEach(trigger => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    });
  });

  closeBtn?.addEventListener("click", closeModal);
  closeSuccessBtn?.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) {
      closeModal();
    }
  });

  function showError(msg) {
    if (errorMsg) {
      errorMsg.textContent = msg;
      errorMsg.style.display = "block";
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

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearError();

    // 1. Honeypot check
    const honeypotInput = document.getElementById("modal-hp");
    if (honeypotInput && honeypotInput.value.trim() !== "") {
      console.warn("Bot submission prevented via honeypot.");
      form.style.display = "none";
      if (successBox) successBox.style.display = "flex";
      return;
    }

    // 2. Extraer campos
    const name = document.getElementById("m-name")?.value.trim() || "";
    const rawEmail = document.getElementById("m-email")?.value.trim().toLowerCase() || "";
    const country = document.getElementById("m-country")?.value || "";
    const role = document.getElementById("m-role")?.value || "";
    const company = document.getElementById("m-company")?.value.trim() || "";
    const phone = document.getElementById("m-phone")?.value.trim() || "";

    // 3. Validaciones
    if (!name) {
      showError("Por favor ingresa tu nombre completo.");
      document.getElementById("m-name")?.focus();
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!rawEmail || !emailRegex.test(rawEmail)) {
      showError("Por favor ingresa un correo electrónico válido.");
      document.getElementById("m-email")?.focus();
      return;
    }

    const emailDomain = rawEmail.split("@")[1];
    if (emailDomain && DISPOSABLE_EMAIL_DOMAINS.has(emailDomain)) {
      showError("Por favor utiliza un correo corporativo o personal permanente.");
      document.getElementById("m-email")?.focus();
      return;
    }

    if (!country) {
      showError("Por favor selecciona tu país.");
      document.getElementById("m-country")?.focus();
      return;
    }

    if (!role) {
      showError("Por favor selecciona tu cargo o rol.");
      document.getElementById("m-role")?.focus();
      return;
    }

    // 4. Obtención y validación del token de Cloudflare Turnstile
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

    // 5. Preparar Payload con Turnstile y metadata completa
    const payload = {
      email: rawEmail,
      name: name,
      phone: phone || undefined,
      company: company || undefined,
      source: "planea_landing",
      country: country,
      role: role,
      turnstileToken: turnstileToken,
      metadata: {
        country: country,
        role: role,
        turnstileToken: turnstileToken,
        submittedAt: new Date().toISOString()
      }
    };

    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json"
    };

    if (WAITLIST_CONFIG.token) {
      headers["Authorization"] = `Bearer ${WAITLIST_CONFIG.token}`;
    }

    setLoading(true);

    try {
      const response = await fetch(WAITLIST_CONFIG.endpoint, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && (data.status === "success" || data.status === "ok" || !data.status)) {
        form.style.display = "none";
        if (successBox) {
          successBox.style.display = "flex";
          if (data.response?.message) {
            successMsg.textContent = data.response.message;
          }
        }
      } else if (response.status === 409) {
        form.style.display = "none";
        if (successBox) {
          successBox.style.display = "flex";
          successMsg.textContent = data.response?.message || "¡Ya estás registrado en la lista de espera! Pronto recibirás tu invitación.";
        }
      } else {
        const errorText = typeof data.response === "string" 
          ? data.response 
          : (data.error || data.message || "Ocurrió un error al procesar el registro. Intenta nuevamente.");
        showError(errorText);
        resetTurnstile();
      }
    } catch (err) {
      console.error("Waitlist submit error:", err);
      showError("No fue posible conectar con el servidor. Revisa tu conexión o intenta en unos minutos.");
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
  initWaitlistModal();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPage);
  } else {
    initPage();
  }
  document.addEventListener("astro:page-load", initPage);
}