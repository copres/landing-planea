export const prerender = false;

// Dominios de correos temporales/desechables para descartar
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com", "10minutemail.com", "tempmail.com", "temp-mail.org",
  "guerrillamail.com", "guerrillamail.net", "guerrillamail.org", "sharklasers.com",
  "yopmail.com", "trashmail.com", "dispostable.com", "fakeinbox.com",
  "throwawaymail.com", "getairmail.com", "mohmal.com", "crazymailing.com",
  "burnermail.io", "mytemp.email", "nada.ltd", "trashmail.net",
  "tempmail.net", "tempinbox.com", "dropmail.me", "fakemailgenerator.com"
]);

// URL de la Cloud Function de Firebase (app-waitlist-planea)
const FIREBASE_FUNCTION_URL =
  import.meta.env.WAITLIST_FUNCTION_URL ||
  import.meta.env.FIREBASE_WAITLIST_URL ||
  (typeof process !== "undefined" && process.env?.WAITLIST_FUNCTION_URL) ||
  (typeof process !== "undefined" && process.env?.FIREBASE_WAITLIST_URL) ||
  "https://us-central1-copres-firebase.cloudfunctions.net/app-waitlist-planea";

// Token de autenticación requerido para la Cloud Function (app-waitlist-planea)
const WAITLIST_TOKEN =
  import.meta.env.WAITLIST_TOKEN ||
  (typeof process !== "undefined" && process.env?.WAITLIST_TOKEN) ||
  "";

// Secret Key opcional de Cloudflare Turnstile para verificación del lado del servidor
const TURNSTILE_SECRET_KEY =
  import.meta.env.TURNSTILE_SECRET_KEY ||
  (typeof process !== "undefined" && process.env?.TURNSTILE_SECRET_KEY) ||
  "";

/**
 * Valida el token de Cloudflare Turnstile con el endpoint oficial de Cloudflare
 */
async function verifyTurnstile(token, clientIp) {
  if (!TURNSTILE_SECRET_KEY) {
    // Si no está configurada la clave secreta, dejamos pasar al backend/Firebase Function
    return { success: true };
  }

  if (!token) {
    return { success: false, error: "Token de seguridad Turnstile ausente." };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", TURNSTILE_SECRET_KEY);
    formData.append("response", token);
    if (clientIp) formData.append("remoteip", clientIp);

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    const data = await res.json();
    return {
      success: !!data.success,
      error: data["error-codes"] ? data["error-codes"].join(", ") : "Fallo en verificación de seguridad."
    };
  } catch (err) {
    console.error("Error al validar Turnstile con Cloudflare:", err);
    return { success: false, error: "Error de conexión con servicio de verificación." };
  }
}

export async function POST({ request }) {
  try {
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-real-ip") ||
      "";

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return new Response(
        JSON.stringify({ status: "error", error: "Cuerpo de solicitud inválido." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const {
      email,
      name,
      phone,
      company,
      source,
      metadata,
      turnstileToken,
      honeypot,
      hp,
      b_company_phone
    } = body;

    // ------------------------------------------------------------------
    // 1. Validación de Honeypot (campo trampa para bots)
    // ------------------------------------------------------------------
    const trapValue = honeypot || hp || b_company_phone;
    if (trapValue && String(trapValue).trim().length > 0) {
      console.warn(`[Waitlist Honeypot Triggered] IP: ${clientIp}, Value: ${trapValue}`);
      // Respondemos éxito falso 200 de inmediato para no dar pistas al bot y no saturar Firebase
      return new Response(
        JSON.stringify({
          status: "success",
          success: true,
          message: "Listo — quedaste en la lista. Te avisaremos con una invitación directa a la plataforma."
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // ------------------------------------------------------------------
    // 2. Validación y normalización de formato de correo
    // ------------------------------------------------------------------
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return new Response(
        JSON.stringify({ status: "error", error: "Por favor ingresa un correo electrónico válido." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // ------------------------------------------------------------------
    // 3. Descarte de correos temporales / desechables
    // ------------------------------------------------------------------
    const domain = cleanEmail.split("@")[1];
    if (domain && DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
      return new Response(
        JSON.stringify({
          status: "error",
          error: "No se permiten correos electrónicos temporales. Por favor utiliza un correo corporativo o personal permanente."
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // ------------------------------------------------------------------
    // 4. Verificación de Cloudflare Turnstile (si existe secret key)
    // ------------------------------------------------------------------
    if (TURNSTILE_SECRET_KEY) {
      const turnstileCheck = await verifyTurnstile(turnstileToken, clientIp);
      if (!turnstileCheck.success) {
        return new Response(
          JSON.stringify({ status: "error", error: turnstileCheck.error || "Verificación de seguridad inválida." }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // ------------------------------------------------------------------
    // 5. Conexión con Cloud Function: app-waitlist-planea
    // ------------------------------------------------------------------
    console.log(`[Waitlist API] Enviando ${cleanEmail} a Cloud Function: ${FIREBASE_FUNCTION_URL}`);

    // Construcción del payload según el contrato de app-waitlist-planea
    const payload = {
      email: cleanEmail,
      ...(name ? { name: String(name).trim() } : {}),
      ...(phone ? { phone: String(phone).trim() } : {}),
      ...(company ? { company: String(company).trim() } : {}),
      source: source || "planea_landing",
      metadata: {
        ...(metadata && typeof metadata === "object" ? metadata : {}),
        clientIp: clientIp || undefined,
        turnstileToken: turnstileToken || undefined,
        submittedAt: new Date().toISOString()
      }
    };

    const requestHeaders = {
      "Content-Type": "application/json",
      "Accept": "application/json"
    };

    if (WAITLIST_TOKEN) {
      requestHeaders["Authorization"] = `Bearer ${WAITLIST_TOKEN}`;
      requestHeaders["x-waitlist-token"] = WAITLIST_TOKEN;
    }

    const firebaseResponse = await fetch(FIREBASE_FUNCTION_URL, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify(payload)
    });

    const firebaseData = await firebaseResponse.json().catch(() => null);

    // Reenviar respuesta según el contrato del módulo waitlist de la Cloud Function
    if (firebaseResponse.ok && firebaseData?.status === "success") {
      const resData = firebaseData.response || {};
      return new Response(
        JSON.stringify({
          status: "success",
          success: true,
          message: resData.message || "Te has registrado exitosamente en la lista de espera de Planea",
          alreadyRegistered: !!resData.alreadyRegistered,
          id: resData.id,
          response: resData
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } else {
      const errorMessage =
        (typeof firebaseData?.response === "string" && firebaseData.response) ||
        firebaseData?.error ||
        firebaseData?.message ||
        "No se pudo completar el registro en este momento.";

      console.error("[Waitlist API] Error retornado por Cloud Function:", firebaseResponse.status, firebaseData);

      return new Response(
        JSON.stringify({
          status: "error",
          success: false,
          error: errorMessage,
          message: errorMessage,
          response: firebaseData?.response
        }),
        {
          status: firebaseResponse.status >= 400 ? firebaseResponse.status : 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
  } catch (error) {
    console.error("[Waitlist API Internal Error]:", error);
    return new Response(
      JSON.stringify({
        status: "error",
        success: false,
        error: "Error interno del servidor al procesar la lista de espera.",
        message: "Error interno del servidor al procesar la lista de espera."
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function ALL() {
  return new Response(
    JSON.stringify({ status: "error", error: "Método no permitido. Utiliza POST." }),
    { status: 405, headers: { "Content-Type": "application/json" } }
  );
}
