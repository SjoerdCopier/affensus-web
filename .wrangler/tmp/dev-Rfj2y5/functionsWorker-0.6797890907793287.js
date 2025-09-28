var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// .wrangler/tmp/bundle-qg0mA9/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// .wrangler/tmp/pages-5rzUvz/functionsWorker-0.6797890907793287.mjs
var __create = Object.create;
var __defProp2 = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var __require2 = /* @__PURE__ */ ((x) => typeof __require !== "undefined" ? __require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: /* @__PURE__ */ __name((a, b) => (typeof __require !== "undefined" ? __require : a)[b], "get")
}) : x)(function(x) {
  if (typeof __require !== "undefined") return __require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = /* @__PURE__ */ __name((fn, res) => /* @__PURE__ */ __name(function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
}, "__init"), "__esm");
var __commonJS = /* @__PURE__ */ __name((cb, mod) => /* @__PURE__ */ __name(function __require22() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
}, "__require2"), "__commonJS");
var __export = /* @__PURE__ */ __name((target, all) => {
  for (var name in all)
    __defProp2(target, name, { get: all[name], enumerable: true });
}, "__export");
var __copyProps = /* @__PURE__ */ __name((to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp2(to, key, { get: /* @__PURE__ */ __name(() => from[key], "get"), enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
}, "__copyProps");
var __toESM = /* @__PURE__ */ __name((mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp2(target, "default", { value: mod, enumerable: true }) : target,
  mod
)), "__toESM");
function checkURL2(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls2.has(url.toString())) {
      urls2.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL2, "checkURL");
var urls2;
var init_checked_fetch = __esm({
  "../.wrangler/tmp/bundle-ADAFrK/checked-fetch.js"() {
    "use strict";
    urls2 = /* @__PURE__ */ new Set();
    __name2(checkURL2, "checkURL");
    globalThis.fetch = new Proxy(globalThis.fetch, {
      apply(target, thisArg, argArray) {
        const [request, init] = argArray;
        checkURL2(request, init);
        return Reflect.apply(target, thisArg, argArray);
      }
    });
  }
});
async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
__name(onRequestOptions, "onRequestOptions");
async function onRequestPut(context) {
  try {
    const { env, params } = context;
    const projectId = params.project_id;
    const notificationId = params.notification_id;
    if (!projectId || !notificationId) {
      return new Response(JSON.stringify({
        success: false,
        error: "Project ID and Notification ID are required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const bearerToken = env.AFFENSUS_CREDENTIALS_PASSWORD;
    if (!bearerToken) {
      throw new Error("AFFENSUS_CREDENTIALS_PASSWORD not configured");
    }
    const apiUrl = `https://apiv2.affensus.com/api/notifications/${projectId}/${notificationId}/read`;
    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${bearerToken}`
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`External API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const data = await response.json();
    return new Response(JSON.stringify({
      success: true,
      data
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, max-age=0, s-maxage=0"
      }
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to mark notification as read"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPut, "onRequestPut");
var init_read = __esm({
  "api/notifications/[project_id]/[notification_id]/read.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    __name2(onRequestOptions, "onRequestOptions");
    __name2(onRequestPut, "onRequestPut");
  }
});
var email_notifications_exports = {};
__export(email_notifications_exports, {
  sendNewUserNotification: /* @__PURE__ */ __name(() => sendNewUserNotification, "sendNewUserNotification")
});
async function sendNewUserNotification(userEmail, loginMethod, resendApiKey) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "noreply@email.morsexpress.com",
      to: "s.copier@gmail.com",
      subject: "\u{1F389} New User Registered - MorseXpress",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1f2937; margin-bottom: 10px;">\u{1F389} MorseXpress</h1>
            <h2 style="color: #4b5563; font-weight: normal; margin-top: 0;">New User Registration</h2>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin-top: 0;">User Details:</h3>
            <p style="color: #374151; margin: 8px 0;"><strong>Email:</strong> ${userEmail}</p>
            <p style="color: #374151; margin: 8px 0;"><strong>Login Method:</strong> ${loginMethod}</p>
            <p style="color: #374151; margin: 8px 0;"><strong>Registration Time:</strong> ${(/* @__PURE__ */ new Date()).toISOString()}</p>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">
            A new user has successfully registered for MorseXpress! \u{1F680}
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            This is an automated notification from MorseXpress.
          </p>
        </div>
      `,
      text: `
New User Registration - MorseXpress

User Details:
- Email: ${userEmail}
- Login Method: ${loginMethod}
- Registration Time: ${(/* @__PURE__ */ new Date()).toISOString()}

A new user has successfully registered for MorseXpress!

This is an automated notification from MorseXpress.
      `.trim()
    })
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to send new user notification:", errorText);
    return false;
  }
  const result = await response.json();
  console.log("New user notification sent successfully:", result);
  return true;
}
__name(sendNewUserNotification, "sendNewUserNotification");
var init_email_notifications = __esm({
  "api/auth/shared/email-notifications.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    __name2(sendNewUserNotification, "sendNewUserNotification");
  }
});
function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach((cookie) => {
    const parts = cookie.trim().split("=");
    if (parts.length === 2) {
      cookies[parts[0]] = decodeURIComponent(parts[1]);
    }
  });
  return cookies;
}
__name(parseCookies, "parseCookies");
async function signJwt(payload, secret, expiresIn) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1e3);
  const exp = now + expiresIn;
  const jwtPayload = { ...payload, iat: now, exp };
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const payloadB64 = btoa(JSON.stringify(jwtPayload)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const signatureArrayBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`${headerB64}.${payloadB64}`)
  );
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signatureArrayBuffer))).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  return `${headerB64}.${payloadB64}.${signatureB64}`;
}
__name(signJwt, "signJwt");
async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");
    const FACEBOOK_APP_ID = env.FACEBOOK_APP_ID;
    const FACEBOOK_APP_SECRET = env.FACEBOOK_APP_SECRET;
    const FACEBOOK_REDIRECT_URI = `${env.SITE_URL || "http://localhost:3000"}/api/auth/facebook/callback`;
    if (error) {
      console.error("Facebook OAuth error:", error);
      return new Response(null, {
        status: 302,
        headers: { "Location": `${env.SITE_URL || "http://localhost:3000"}/auth?error=oauth_denied` }
      });
    }
    if (!code || !state) {
      console.error("Missing code or state parameter");
      return new Response(null, {
        status: 302,
        headers: { "Location": `${env.SITE_URL || "http://localhost:3000"}/auth?error=invalid_request` }
      });
    }
    const cookies = parseCookies(request.headers.get("Cookie"));
    const storedState = cookies["oauth_state"];
    if (!storedState || state !== storedState) {
      console.error("Invalid state parameter");
      return new Response(null, {
        status: 302,
        headers: { "Location": `${env.SITE_URL || "http://localhost:3000"}/auth?error=invalid_state` }
      });
    }
    if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
      console.error("Facebook OAuth not configured");
      return new Response(null, {
        status: 302,
        headers: { "Location": `${env.SITE_URL || "http://localhost:3000"}/auth?error=oauth_not_configured` }
      });
    }
    const tokenResponse = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?client_id=${FACEBOOK_APP_ID}&client_secret=${FACEBOOK_APP_SECRET}&code=${code}&redirect_uri=${encodeURIComponent(FACEBOOK_REDIRECT_URI)}`);
    if (!tokenResponse.ok) {
      console.error("Failed to exchange code for token:", await tokenResponse.text());
      return new Response(null, {
        status: 302,
        headers: { "Location": `${env.SITE_URL || "http://localhost:3000"}/auth?error=token_exchange_failed` }
      });
    }
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const userInfoResponse = await fetch(
      `https://graph.facebook.com/v18.0/me?fields=id,name,email&access_token=${accessToken}`
    );
    if (!userInfoResponse.ok) {
      console.error("Failed to get user info from Facebook");
      return new Response(null, {
        status: 302,
        headers: { "Location": `${env.SITE_URL || "http://localhost:3000"}/auth?error=user_info_failed` }
      });
    }
    const userInfo = await userInfoResponse.json();
    if (!userInfo.email) {
      console.error("Facebook account email not provided");
      return new Response(null, {
        status: 302,
        headers: { "Location": `${env.SITE_URL || "http://localhost:3000"}/auth?error=email_not_provided` }
      });
    }
    const db = env.DB;
    if (!db) {
      return new Response(null, {
        status: 302,
        headers: { "Location": `${env.SITE_URL || "http://localhost:3000"}/auth?error=database_not_available` }
      });
    }
    const createUser2 = /* @__PURE__ */ __name2(async (db2, email, loginMethod = "facebook") => {
      const bearerToken = env.AFFENSUS_CREDENTIALS_PASSWORD;
      if (!bearerToken) {
        throw new Error("AFFENSUS_CREDENTIALS_PASSWORD not configured");
      }
      const name = userInfo.name || null;
      console.log("Registering user via external API:", { email, name, loginMethod });
      const response = await fetch("https://apiv2.affensus.com/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${bearerToken}`
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          name,
          login_method: loginMethod,
          subscription_status: "free"
        })
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API registration failed:", response.status, errorText);
        throw new Error(`Registration failed: ${response.status} ${errorText}`);
      }
      const userData = await response.json();
      const user2 = {
        id: userData.id || userData.user_id || Date.now(),
        // Fallback ID if API doesn't return one
        email: email.toLowerCase(),
        preferred_login_method: loginMethod,
        subscription_status: "free",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      const isNewUser2 = response.status === 201;
      return { user: user2, isNewUser: isNewUser2 };
    }, "createUser");
    const updatePreferredLoginMethod2 = /* @__PURE__ */ __name2(async (db2, email, method) => {
      await db2.prepare(`
        UPDATE users 
        SET preferred_login_method = ?, updated_at = datetime('now')
        WHERE email = ?
      `).bind(method, email).run();
    }, "updatePreferredLoginMethod");
    const { user, isNewUser } = await createUser2(db, userInfo.email.toLowerCase(), "facebook");
    await updatePreferredLoginMethod2(db, userInfo.email.toLowerCase(), "facebook");
    if (isNewUser) {
      const resendApiKey = env.RESEND_API_KEY;
      if (resendApiKey) {
        try {
          const { sendNewUserNotification: sendNewUserNotification2 } = await Promise.resolve().then(() => (init_email_notifications(), email_notifications_exports));
          await sendNewUserNotification2(user.email, "facebook", resendApiKey);
        } catch (error2) {
          console.error("Failed to send new user notification:", error2);
        }
      } else {
        console.log("New user registered but RESEND_API_KEY not configured - email notification skipped");
      }
    }
    const jwtSecret = env.JWT_SECRET;
    if (!jwtSecret) {
      return new Response(null, {
        status: 302,
        headers: { "Location": `${env.SITE_URL || "http://localhost:3000"}/auth?error=jwt_not_configured` }
      });
    }
    const jwtToken = await signJwt(
      {
        sub: user.id.toString(),
        email: user.email,
        login_method: "facebook"
      },
      jwtSecret,
      7 * 24 * 60 * 60
      // 7 days
    );
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Redirecting...</title>
      </head>
      <body>
        <script>
          localStorage.setItem('lastLoginMethod', 'facebook');
          localStorage.setItem('lastLoginTime', new Date().toISOString());
          window.location.href = '${env.SITE_URL || "http://localhost:3000"}/auth';
        <\/script>
        <p>Redirecting...</p>
      </body>
      </html>
    `;
    const isProduction = env.SITE_URL?.startsWith("https://") || false;
    const secureFlag = isProduction ? "Secure; " : "";
    const headers = new Headers({
      "Content-Type": "text/html"
    });
    headers.append("Set-Cookie", `auth-token=${jwtToken}; HttpOnly; ${secureFlag}SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}; Path=/`);
    headers.append("Set-Cookie", `oauth_state=; HttpOnly; ${secureFlag}SameSite=Lax; Max-Age=0; Path=/`);
    return new Response(html, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error("Error processing Facebook OAuth callback:", error);
    return new Response(null, {
      status: 302,
      headers: { "Location": `${context.env.SITE_URL || "http://localhost:3000"}/auth?error=internal_error` }
    });
  }
}
__name(onRequestGet, "onRequestGet");
var init_callback = __esm({
  "api/auth/facebook/callback.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    __name2(parseCookies, "parseCookies");
    __name2(signJwt, "signJwt");
    __name2(onRequestGet, "onRequestGet");
  }
});
function parseCookies2(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach((cookie) => {
    const parts = cookie.trim().split("=");
    if (parts.length === 2) {
      cookies[parts[0]] = decodeURIComponent(parts[1]);
    }
  });
  return cookies;
}
__name(parseCookies2, "parseCookies2");
async function signJwt2(payload, secret, expiresIn) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1e3);
  const exp = now + expiresIn;
  const jwtPayload = { ...payload, iat: now, exp };
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const payloadB64 = btoa(JSON.stringify(jwtPayload)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const signatureArrayBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`${headerB64}.${payloadB64}`)
  );
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signatureArrayBuffer))).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  return `${headerB64}.${payloadB64}.${signatureB64}`;
}
__name(signJwt2, "signJwt2");
async function processPendingPayments(db, email, userId, stripeSecretKey) {
  try {
    const pendingPayments = await db.prepare(`
      SELECT * FROM pending_payments 
      WHERE email = ? AND processed = 0
    `).bind(email).all();
    if (pendingPayments.results && pendingPayments.results.length > 0) {
      console.log(`Found ${pendingPayments.results.length} pending payment(s) for ${email}`);
      for (const payment of pendingPayments.results) {
        try {
          if (stripeSecretKey) {
            const sessionResponse = await fetch(`https://api.stripe.com/v1/checkout/sessions/${payment.session_id}`, {
              headers: {
                "Authorization": `Bearer ${stripeSecretKey}`
              }
            });
            if (sessionResponse.ok) {
              const session = await sessionResponse.json();
              const customerResponse = await fetch("https://api.stripe.com/v1/customers", {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${stripeSecretKey}`,
                  "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                  email,
                  name: payment.customer_name || "Customer",
                  "metadata[user_id]": userId.toString(),
                  "metadata[session_id]": payment.session_id
                })
              });
              if (customerResponse.ok) {
                const customer = await customerResponse.json();
                await db.prepare(`
                  UPDATE users 
                  SET stripe_customer_id = ?, updated_at = datetime('now')
                  WHERE id = ?
                `).bind(customer.id, userId).run();
                let subscriptionStatus = "free";
                if (payment.amount_total === 1999) subscriptionStatus = "basic";
                else if (payment.amount_total === 3999) subscriptionStatus = "active";
                else if (payment.amount_total === 7900) subscriptionStatus = "lifetime";
                await db.prepare(`
                  UPDATE users 
                  SET 
                    subscription_status = ?, 
                    subscription_expires_at = datetime('now', '+1 year'),
                    updated_at = datetime('now')
                  WHERE id = ?
                `).bind(subscriptionStatus, userId).run();
                console.log(`Processed pending payment for user ${userId}, customer ${customer.id}`);
              }
            }
          }
          await db.prepare(`
            UPDATE pending_payments 
            SET processed = 1 
            WHERE id = ?
          `).bind(payment.id).run();
        } catch (error) {
          console.error("Error processing pending payment:", error);
        }
      }
    }
  } catch (error) {
    console.error("Error checking for pending payments:", error);
  }
}
__name(processPendingPayments, "processPendingPayments");
async function onRequestGet2(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");
    if (error) {
      console.error("GitHub OAuth error:", error);
      return new Response(null, {
        status: 302,
        headers: { "Location": `${env.SITE_URL || "http://localhost:3000"}/auth?error=oauth_denied` }
      });
    }
    if (!code || !state) {
      return new Response(null, {
        status: 302,
        headers: { "Location": `${env.SITE_URL || "http://localhost:3000"}/auth?error=invalid_request` }
      });
    }
    const cookies = parseCookies2(request.headers.get("Cookie"));
    const storedState = cookies["oauth_state"];
    if (!storedState || storedState !== state) {
      console.error("OAuth state verification failed");
      return new Response(null, {
        status: 302,
        headers: { "Location": `${env.SITE_URL || "http://localhost:3000"}/auth?error=invalid_state` }
      });
    }
    const GITHUB_CLIENT_ID = env.GITHUB_CLIENT_ID;
    const GITHUB_CLIENT_SECRET = env.GITHUB_CLIENT_SECRET;
    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
      return new Response(null, {
        status: 302,
        headers: { "Location": `${env.SITE_URL || "http://localhost:3000"}/auth?error=oauth_not_configured` }
      });
    }
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code
      })
    });
    if (!tokenResponse.ok) {
      console.error("Failed to exchange code for token:", await tokenResponse.text());
      return new Response(null, {
        status: 302,
        headers: { "Location": `${env.SITE_URL || "http://localhost:3000"}/auth?error=token_exchange_failed` }
      });
    }
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    if (!accessToken) {
      console.error("No access token received from GitHub");
      return new Response(null, {
        status: 302,
        headers: { "Location": `${env.SITE_URL || "http://localhost:3000"}/auth?error=token_exchange_failed` }
      });
    }
    const userInfoResponse = await fetch("https://api.github.com/user", {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "MorseXpress-App"
      }
    });
    if (!userInfoResponse.ok) {
      console.error("Failed to get user info from GitHub");
      return new Response(null, {
        status: 302,
        headers: { "Location": `${env.SITE_URL || "http://localhost:3000"}/auth?error=user_info_failed` }
      });
    }
    const userInfo = await userInfoResponse.json();
    let userEmail = userInfo.email;
    if (!userEmail) {
      const emailsResponse = await fetch("https://api.github.com/user/emails", {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Accept": "application/vnd.github.v3+json",
          "User-Agent": "MorseXpress-App"
        }
      });
      if (emailsResponse.ok) {
        const emails = await emailsResponse.json();
        const primaryEmail = emails.find((e) => e.primary && e.verified);
        userEmail = primaryEmail?.email || emails.find((e) => e.verified)?.email;
      }
    }
    if (!userEmail) {
      console.error("GitHub account email not available");
      return new Response(null, {
        status: 302,
        headers: { "Location": `${env.SITE_URL || "http://localhost:3000"}/auth?error=email_not_provided` }
      });
    }
    const db = env.DB;
    if (!db) {
      return new Response(null, {
        status: 302,
        headers: { "Location": `${env.SITE_URL || "http://localhost:3000"}/auth?error=database_not_available` }
      });
    }
    const createUser2 = /* @__PURE__ */ __name2(async (db2, email, loginMethod = "github") => {
      const bearerToken = env.AFFENSUS_CREDENTIALS_PASSWORD;
      if (!bearerToken) {
        throw new Error("AFFENSUS_CREDENTIALS_PASSWORD not configured");
      }
      const name = userInfo.name || userInfo.login || null;
      console.log("Registering user via external API:", { email, name, loginMethod });
      const response = await fetch("https://apiv2.affensus.com/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${bearerToken}`
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          name,
          login_method: loginMethod,
          subscription_status: "free"
        })
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API registration failed:", response.status, errorText);
        throw new Error(`Registration failed: ${response.status} ${errorText}`);
      }
      const userData = await response.json();
      const user2 = {
        id: userData.id || userData.user_id || Date.now(),
        // Fallback ID if API doesn't return one
        email: email.toLowerCase(),
        preferred_login_method: loginMethod,
        subscription_status: "free",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      const isNewUser2 = response.status === 201;
      return { user: user2, isNewUser: isNewUser2 };
    }, "createUser");
    const updatePreferredLoginMethod2 = /* @__PURE__ */ __name2(async (db2, email, method) => {
      await db2.prepare(`
        UPDATE users 
        SET preferred_login_method = ?, updated_at = datetime('now')
        WHERE email = ?
      `).bind(method, email).run();
    }, "updatePreferredLoginMethod");
    const { user, isNewUser } = await createUser2(db, userEmail.toLowerCase(), "github");
    await updatePreferredLoginMethod2(db, userEmail.toLowerCase(), "github");
    await processPendingPayments(db, userEmail.toLowerCase(), user.id, env.STRIPE_SECRET_KEY);
    if (isNewUser) {
      const resendApiKey = env.RESEND_API_KEY;
      if (resendApiKey) {
        try {
          const { sendNewUserNotification: sendNewUserNotification2 } = await Promise.resolve().then(() => (init_email_notifications(), email_notifications_exports));
          await sendNewUserNotification2(user.email, "github", resendApiKey);
        } catch (error2) {
          console.error("Failed to send new user notification:", error2);
        }
      } else {
        console.log("New user registered but RESEND_API_KEY not configured - email notification skipped");
      }
    }
    const jwtSecret = env.JWT_SECRET;
    if (!jwtSecret) {
      return new Response(null, {
        status: 302,
        headers: { "Location": `${env.SITE_URL || "http://localhost:3000"}/auth?error=jwt_not_configured` }
      });
    }
    const jwtToken = await signJwt2(
      {
        sub: user.id.toString(),
        email: user.email,
        login_method: "github"
      },
      jwtSecret,
      7 * 24 * 60 * 60
      // 7 days
    );
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Redirecting...</title>
      </head>
      <body>
        <script>
          localStorage.setItem('lastLoginMethod', 'github');
          localStorage.setItem('lastLoginTime', new Date().toISOString());
          window.location.href = '${env.SITE_URL || "http://localhost:3000"}/auth';
        <\/script>
        <p>Redirecting...</p>
      </body>
      </html>
    `;
    const isProduction = env.SITE_URL?.startsWith("https://") || false;
    const secureFlag = isProduction ? "Secure; " : "";
    const headers = new Headers({
      "Content-Type": "text/html"
    });
    headers.append("Set-Cookie", `auth-token=${jwtToken}; HttpOnly; ${secureFlag}SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}; Path=/`);
    headers.append("Set-Cookie", `oauth_state=; HttpOnly; ${secureFlag}SameSite=Lax; Max-Age=0; Path=/`);
    return new Response(html, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error("Error processing GitHub OAuth callback:", error);
    return new Response(null, {
      status: 302,
      headers: { "Location": `${context.env.SITE_URL || "http://localhost:3000"}/auth?error=internal_error` }
    });
  }
}
__name(onRequestGet2, "onRequestGet2");
var init_callback2 = __esm({
  "api/auth/github/callback.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    __name2(parseCookies2, "parseCookies");
    __name2(signJwt2, "signJwt");
    __name2(processPendingPayments, "processPendingPayments");
    __name2(onRequestGet2, "onRequestGet");
  }
});
function parseCookies3(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach((cookie) => {
    const parts = cookie.trim().split("=");
    if (parts.length === 2) {
      cookies[parts[0]] = decodeURIComponent(parts[1]);
    }
  });
  return cookies;
}
__name(parseCookies3, "parseCookies3");
async function signJwt3(payload, secret, expiresIn = 7 * 24 * 60 * 60) {
  const now = Math.floor(Date.now() / 1e3);
  const jwtPayload = {
    ...payload,
    iat: now,
    exp: now + expiresIn
  };
  const headerB64 = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payloadB64 = btoa(JSON.stringify(jwtPayload));
  const data = `${headerB64}.${payloadB64}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
  return `${data}.${signatureB64}`;
}
__name(signJwt3, "signJwt3");
async function processPendingPayments2(db, email, userId, stripeSecretKey) {
  try {
    const pendingPayments = await db.prepare(`
      SELECT * FROM pending_payments 
      WHERE email = ? AND processed = 0
    `).bind(email).all();
    if (pendingPayments.results && pendingPayments.results.length > 0) {
      console.log(`Found ${pendingPayments.results.length} pending payment(s) for ${email}`);
      for (const payment of pendingPayments.results) {
        try {
          if (stripeSecretKey) {
            const sessionResponse = await fetch(`https://api.stripe.com/v1/checkout/sessions/${payment.session_id}`, {
              headers: {
                "Authorization": `Bearer ${stripeSecretKey}`
              }
            });
            if (sessionResponse.ok) {
              const session = await sessionResponse.json();
              const customerResponse = await fetch("https://api.stripe.com/v1/customers", {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${stripeSecretKey}`,
                  "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                  email,
                  name: payment.customer_name || "Customer",
                  "metadata[user_id]": userId.toString(),
                  "metadata[session_id]": payment.session_id
                })
              });
              if (customerResponse.ok) {
                const customer = await customerResponse.json();
                await db.prepare(`
                  UPDATE users 
                  SET stripe_customer_id = ?, updated_at = datetime('now')
                  WHERE id = ?
                `).bind(customer.id, userId).run();
                let subscriptionStatus = "free";
                if (payment.amount_total === 1999) subscriptionStatus = "basic";
                else if (payment.amount_total === 3999) subscriptionStatus = "active";
                else if (payment.amount_total === 7900) subscriptionStatus = "lifetime";
                await db.prepare(`
                  UPDATE users 
                  SET 
                    subscription_status = ?, 
                    subscription_expires_at = datetime('now', '+1 year'),
                    updated_at = datetime('now')
                  WHERE id = ?
                `).bind(subscriptionStatus, userId).run();
                console.log(`Processed pending payment for user ${userId}, customer ${customer.id}`);
              }
            }
          }
          await db.prepare(`
            UPDATE pending_payments 
            SET processed = 1 
            WHERE id = ?
          `).bind(payment.id).run();
        } catch (error) {
          console.error("Error processing pending payment:", error);
        }
      }
    }
  } catch (error) {
    console.error("Error checking for pending payments:", error);
  }
}
__name(processPendingPayments2, "processPendingPayments2");
async function onRequestGet3(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const paidParam = url.searchParams.get("paid");
    const sessionId = url.searchParams.get("session_id");
    const error = url.searchParams.get("error");
    const GOOGLE_CLIENT_ID = env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET;
    const GOOGLE_REDIRECT_URI = `${env.SITE_URL || "http://localhost:3000"}/api/auth/google/callback`;
    if (error) {
      console.error("Google OAuth error:", error);
      return new Response(null, {
        status: 302,
        headers: { "Location": `${env.SITE_URL || "http://localhost:3000"}/auth?error=oauth_denied` }
      });
    }
    if (!code || !state) {
      console.error("Missing code or state parameter");
      return new Response(null, {
        status: 302,
        headers: { "Location": `${env.SITE_URL || "http://localhost:3000"}/auth?error=invalid_request` }
      });
    }
    const cookies = parseCookies3(request.headers.get("Cookie"));
    const storedState = cookies["oauth_state"];
    if (!storedState || state !== storedState) {
      console.error("Invalid state parameter");
      return new Response(null, {
        status: 302,
        headers: { "Location": `${env.SITE_URL || "http://localhost:3000"}/auth?error=invalid_state` }
      });
    }
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      console.error("Google OAuth not configured");
      return new Response(null, {
        status: 302,
        headers: { "Location": `${env.SITE_URL || "http://localhost:3000"}/auth?error=oauth_not_configured` }
      });
    }
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: GOOGLE_REDIRECT_URI
      })
    });
    if (!tokenResponse.ok) {
      console.error("Failed to exchange code for token:", await tokenResponse.text());
      return new Response(null, {
        status: 302,
        headers: { "Location": `${env.SITE_URL || "http://localhost:3000"}/auth?error=token_exchange_failed` }
      });
    }
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const userInfoResponse = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
    );
    if (!userInfoResponse.ok) {
      console.error("Failed to get user info from Google");
      return new Response(null, {
        status: 302,
        headers: { "Location": `${env.SITE_URL || "http://localhost:3000"}/auth?error=user_info_failed` }
      });
    }
    const userInfo = await userInfoResponse.json();
    if (!userInfo.email || !userInfo.verified_email) {
      console.error("Google account email not verified");
      return new Response(null, {
        status: 302,
        headers: { "Location": `${env.SITE_URL || "http://localhost:3000"}/auth?error=email_not_verified` }
      });
    }
    const db = env.DB;
    if (!db) {
      return new Response(null, {
        status: 302,
        headers: { "Location": `${env.SITE_URL || "http://localhost:3000"}/auth?error=database_not_available` }
      });
    }
    const getUserByEmail4 = /* @__PURE__ */ __name2(async (email, apiKey) => {
      try {
        const response = await fetch(`https://apiv2.affensus.com/api/auth/user/email/${encodeURIComponent(email)}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          }
        });
        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          throw new Error(`API error: ${response.status}`);
        }
        return await response.json();
      } catch (error2) {
        console.error("Error fetching user by email:", error2);
        return null;
      }
    }, "getUserByEmail");
    const createUser2 = /* @__PURE__ */ __name2(async (db2, email, loginMethod = "google") => {
      const bearerToken = env.AFFENSUS_CREDENTIALS_PASSWORD;
      if (!bearerToken) {
        throw new Error("AFFENSUS_CREDENTIALS_PASSWORD not configured");
      }
      const name = userInfo.name || null;
      console.log("Registering user via external API:", { email, name, loginMethod });
      const response = await fetch("https://apiv2.affensus.com/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${bearerToken}`
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          name,
          login_method: loginMethod,
          subscription_status: "free"
        })
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API registration failed:", response.status, errorText);
        if (response.status === 400 && errorText.includes("Email already exists")) {
          console.log("User already exists, fetching existing user...");
          const existingUser = await getUserByEmail4(email.toLowerCase(), bearerToken);
          if (existingUser) {
            const user3 = {
              id: existingUser.id || existingUser.user_id || Date.now(),
              email: email.toLowerCase(),
              preferred_login_method: loginMethod,
              subscription_status: existingUser.subscription_status || "free",
              created_at: existingUser.created_at || (/* @__PURE__ */ new Date()).toISOString(),
              updated_at: (/* @__PURE__ */ new Date()).toISOString()
            };
            return { user: user3, isNewUser: false };
          }
        }
        throw new Error(`Registration failed: ${response.status} ${errorText}`);
      }
      const userData = await response.json();
      const user2 = {
        id: userData.id || userData.user_id || Date.now(),
        // Fallback ID if API doesn't return one
        email: email.toLowerCase(),
        preferred_login_method: loginMethod,
        subscription_status: "free",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      const isNewUser2 = response.status === 201;
      return { user: user2, isNewUser: isNewUser2 };
    }, "createUser");
    const updatePreferredLoginMethod2 = /* @__PURE__ */ __name2(async (email, method, apiKey) => {
      try {
        const response = await fetch(`https://apiv2.affensus.com/api/auth/user/email/${encodeURIComponent(email)}/login-method`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            login_method: method
          })
        });
        return response.ok;
      } catch (error2) {
        console.error("Error updating preferred login method:", error2);
        return false;
      }
    }, "updatePreferredLoginMethod");
    if (paidParam === "true" && sessionId) {
      try {
        const stripeSecretKey = env.STRIPE_SECRET_KEY;
        if (stripeSecretKey) {
          const sessionResponse = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
            headers: {
              "Authorization": `Bearer ${stripeSecretKey}`
            }
          });
          if (sessionResponse.ok) {
            const session = await sessionResponse.json();
            if (session.customer) {
              await db.prepare(`
                UPDATE users 
                SET stripe_customer_id = ?, updated_at = datetime('now')
                WHERE email = ?
              `).bind(session.customer, userInfo.email.toLowerCase()).run();
            }
          }
        }
      } catch (error2) {
        console.error("Error linking Stripe customer:", error2);
      }
    }
    const { user, isNewUser } = await createUser2(db, userInfo.email.toLowerCase(), "google");
    await updatePreferredLoginMethod2(userInfo.email.toLowerCase(), "google", env.AFFENSUS_CREDENTIALS_PASSWORD);
    await processPendingPayments2(db, userInfo.email.toLowerCase(), user.id, env.STRIPE_SECRET_KEY);
    if (isNewUser) {
      const resendApiKey = env.RESEND_API_KEY;
      if (resendApiKey) {
        try {
          const { sendNewUserNotification: sendNewUserNotification2 } = await Promise.resolve().then(() => (init_email_notifications(), email_notifications_exports));
          await sendNewUserNotification2(user.email, "google", resendApiKey);
        } catch (error2) {
          console.error("Failed to send new user notification:", error2);
        }
      } else {
        console.log("New user registered but RESEND_API_KEY not configured - email notification skipped");
      }
    }
    const jwtSecret = env.JWT_SECRET;
    if (!jwtSecret) {
      return new Response(null, {
        status: 302,
        headers: { "Location": `${env.SITE_URL || "http://localhost:3000"}/auth?error=jwt_not_configured` }
      });
    }
    const jwtToken = await signJwt3(
      {
        sub: user.id.toString(),
        email: user.email,
        login_method: "google"
      },
      jwtSecret,
      7 * 24 * 60 * 60
      // 7 days
    );
    let redirectUrl = `${env.SITE_URL || "http://localhost:3000"}/`;
    if (paidParam === "true") {
      redirectUrl = `${env.SITE_URL || "http://localhost:3000"}/?paid=true&session_id=${sessionId}`;
    }
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Redirecting...</title>
      </head>
      <body>
        <script>
          localStorage.setItem('lastLoginMethod', 'google');
          localStorage.setItem('lastLoginTime', new Date().toISOString());
          ${paidParam === "true" ? `localStorage.setItem('paidUser', 'true');` : ""}
          // Force a hard refresh to ensure auth state is updated
          window.location.replace('${redirectUrl}');
        <\/script>
        <p>Redirecting...</p>
      </body>
      </html>
    `;
    const isProduction = env.SITE_URL?.startsWith("https://") || false;
    const secureFlag = isProduction ? "Secure; " : "";
    const headers = new Headers({
      "Content-Type": "text/html"
    });
    const encodedToken = encodeURIComponent(jwtToken);
    const cookieValue = `auth-token=${encodedToken}; HttpOnly; ${secureFlag}SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}; Path=/`;
    headers.append("Set-Cookie", cookieValue);
    headers.append("Set-Cookie", `oauth_state=; HttpOnly; ${secureFlag}SameSite=Lax; Max-Age=0; Path=/`);
    return new Response(html, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error("Error processing Google OAuth callback:", error);
    return new Response(null, {
      status: 302,
      headers: { "Location": `${context.env.SITE_URL || "http://localhost:3000"}/auth?error=internal_error` }
    });
  }
}
__name(onRequestGet3, "onRequestGet3");
var init_callback3 = __esm({
  "api/auth/google/callback.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    __name2(parseCookies3, "parseCookies");
    __name2(signJwt3, "signJwt");
    __name2(processPendingPayments2, "processPendingPayments");
    __name2(onRequestGet3, "onRequestGet");
  }
});
async function onRequestGet4(context) {
  try {
    const { request, env, params } = context;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return new Response(JSON.stringify({
        success: false,
        error: "User ID is required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const db = env.DB;
    let progress = await db.prepare(`
      SELECT * FROM user_course_progress 
      WHERE user_id = ? AND course_id = ?
    `).bind(userId, params.courseId).first();
    if (!progress) {
      const result = await db.prepare(`
        INSERT INTO user_course_progress (user_id, course_id, current_lesson_id, current_section_id, completed_lessons)
        VALUES (?, ?, ?, ?, ?)
      `).bind(userId, params.courseId, null, null, "[]").run();
      progress = {
        user_id: userId,
        course_id: params.courseId,
        current_lesson_id: null,
        current_section_id: null,
        completed_lessons: "[]",
        last_accessed_at: (/* @__PURE__ */ new Date()).toISOString(),
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    const completedLessons = JSON.parse(progress.completed_lessons || "[]");
    return new Response(JSON.stringify({
      success: true,
      data: {
        currentLessonId: progress.current_lesson_id,
        currentSectionId: progress.current_section_id,
        completedLessons,
        lastAccessedAt: progress.last_accessed_at
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error fetching user progress:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to fetch user progress"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet4, "onRequestGet4");
async function onRequestPost(context) {
  try {
    const { request, env, params } = context;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return new Response(JSON.stringify({
        success: false,
        error: "User ID is required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const body = await request.json();
    const { lessonId, sectionId, action } = body;
    if (!lessonId || !action) {
      return new Response(JSON.stringify({
        success: false,
        error: "Lesson ID and action are required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const db = env.DB;
    let progress = await db.prepare(`
      SELECT * FROM user_course_progress 
      WHERE user_id = ? AND course_id = ?
    `).bind(userId, params.courseId).first();
    if (!progress) {
      await db.prepare(`
        INSERT INTO user_course_progress (user_id, course_id, current_lesson_id, current_section_id, completed_lessons)
        VALUES (?, ?, ?, ?, ?)
      `).bind(userId, params.courseId, lessonId, sectionId || null, "[]").run();
      progress = {
        user_id: userId,
        course_id: params.courseId,
        current_lesson_id: lessonId,
        current_section_id: sectionId || null,
        completed_lessons: "[]",
        last_accessed_at: (/* @__PURE__ */ new Date()).toISOString(),
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    const completedLessons = JSON.parse(progress.completed_lessons || "[]");
    let updatedCompletedLessons = [...completedLessons];
    let updatedCurrentLessonId = progress.current_lesson_id;
    let updatedCurrentSectionId = progress.current_section_id;
    switch (action) {
      case "start":
        updatedCurrentLessonId = lessonId;
        updatedCurrentSectionId = sectionId || null;
        break;
      case "complete":
        if (!completedLessons.includes(lessonId)) {
          updatedCompletedLessons.push(lessonId);
        }
        updatedCurrentLessonId = lessonId;
        updatedCurrentSectionId = sectionId || null;
        break;
      case "update_section":
        updatedCurrentLessonId = lessonId;
        updatedCurrentSectionId = sectionId || null;
        break;
      default:
        return new Response(JSON.stringify({
          success: false,
          error: "Invalid action"
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
    }
    await db.prepare(`
      UPDATE user_course_progress 
      SET current_lesson_id = ?, 
          current_section_id = ?, 
          completed_lessons = ?, 
          last_accessed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND course_id = ?
    `).bind(
      updatedCurrentLessonId,
      updatedCurrentSectionId,
      JSON.stringify(updatedCompletedLessons),
      userId,
      params.courseId
    ).run();
    return new Response(JSON.stringify({
      success: true,
      data: {
        currentLessonId: updatedCurrentLessonId,
        currentSectionId: updatedCurrentSectionId,
        completedLessons: updatedCompletedLessons,
        lastAccessedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error updating user progress:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to update user progress"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost, "onRequestPost");
var init_courseId = __esm({
  "api/user/progress/[courseId]/index.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    __name2(onRequestGet4, "onRequestGet");
    __name2(onRequestPost, "onRequestPost");
  }
});
async function onRequestOptions2() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
__name(onRequestOptions2, "onRequestOptions2");
async function onRequestGet5(context) {
  try {
    const { request, env, params } = context;
    const jobId = params.job_id;
    if (!jobId) {
      return new Response(JSON.stringify({
        success: false,
        error: "Job ID is required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const bearerToken = env.AFFENSUS_CREDENTIALS_PASSWORD;
    if (!bearerToken) {
      throw new Error("AFFENSUS_CREDENTIALS_PASSWORD not configured");
    }
    console.log("Making API request to:", `https://apiv2.affensus.com/api/job/${jobId}/monitor`);
    let response;
    try {
      response = await fetch(`https://apiv2.affensus.com/api/job/${jobId}/monitor`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${bearerToken}`
        }
      });
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      const errorMessage = fetchError instanceof Error ? fetchError.message : "Unknown fetch error";
      throw new Error(`Network error: ${errorMessage}`);
    }
    if (response.status === 204) {
      return new Response(JSON.stringify({
        job_id: jobId,
        status: "completed",
        message: "Job completed successfully",
        queue_info: {
          currently_processing: 0,
          total_queued: 0,
          total_waiting: 0
        }
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Response Error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`External API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const data = await response.json();
    if (!data.job_id) {
      data.job_id = jobId;
    }
    if (data.result && typeof data.result === "string") {
      try {
        const parsedResult = JSON.parse(data.result);
        if (parsedResult.import_result) {
          data.result = parsedResult.import_result;
        } else {
          data.result = parsedResult;
        }
      } catch (e) {
        console.error("Failed to parse result JSON:", e);
      }
    }
    console.log("Job Monitor API Response:", JSON.stringify(data, null, 2));
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, max-age=0"
      }
    });
  } catch (error) {
    console.error("Job monitor error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet5, "onRequestGet5");
var init_monitor = __esm({
  "api/job/[job_id]/monitor.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    __name2(onRequestOptions2, "onRequestOptions");
    __name2(onRequestGet5, "onRequestGet");
  }
});
async function onRequestOptions3() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
__name(onRequestOptions3, "onRequestOptions3");
async function onRequestGet6(context) {
  try {
    const { request, env, params } = context;
    const jobId = params.job_id;
    if (!jobId) {
      return new Response(JSON.stringify({
        success: false,
        error: "Job ID is required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const bearerToken = env.AFFENSUS_CREDENTIALS_PASSWORD;
    if (!bearerToken) {
      throw new Error("AFFENSUS_CREDENTIALS_PASSWORD not configured");
    }
    console.log("Making API request to:", `https://apiv2.affensus.com/api/job/${jobId}/status`);
    let response;
    try {
      response = await fetch(`https://apiv2.affensus.com/api/job/${jobId}/status`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${bearerToken}`
        }
      });
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      const errorMessage = fetchError instanceof Error ? fetchError.message : "Unknown fetch error";
      throw new Error(`Network error: ${errorMessage}`);
    }
    if (response.status === 204) {
      return new Response(JSON.stringify({
        job_id: jobId,
        status: "completed",
        message: "Job completed successfully"
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Response Error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`External API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const data = await response.json();
    if (!data.job_id) {
      data.job_id = jobId;
    }
    if (data.result && typeof data.result === "string") {
      try {
        const parsedResult = JSON.parse(data.result);
        if (parsedResult.import_result) {
          data.result = parsedResult.import_result;
        } else {
          data.result = parsedResult;
        }
      } catch (e) {
        console.error("Failed to parse result JSON:", e);
      }
    }
    console.log("Job Status API Response:", JSON.stringify(data, null, 2));
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, max-age=0"
      }
    });
  } catch (error) {
    console.error("Job status error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet6, "onRequestGet6");
var init_status = __esm({
  "api/job/[job_id]/status.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    __name2(onRequestOptions3, "onRequestOptions");
    __name2(onRequestGet6, "onRequestGet");
  }
});
async function onRequestOptions4() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
__name(onRequestOptions4, "onRequestOptions4");
async function onRequestPut2(context) {
  try {
    const { request, env, params } = context;
    const { project_id } = params;
    if (!project_id) {
      return new Response(JSON.stringify({
        success: false,
        error: "Project ID is required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const bearerToken = env.AFFENSUS_CREDENTIALS_PASSWORD;
    if (!bearerToken) {
      throw new Error("AFFENSUS_CREDENTIALS_PASSWORD not configured");
    }
    console.log("Making API request to:", `https://apiv2.affensus.com/api/notifications/${project_id}/read-all`);
    let response;
    try {
      response = await fetch(`https://apiv2.affensus.com/api/notifications/${project_id}/read-all`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${bearerToken}`
        }
      });
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      const errorMessage = fetchError instanceof Error ? fetchError.message : "Unknown fetch error";
      throw new Error(`Network error: ${errorMessage}`);
    }
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Response Error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`External API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, max-age=0"
      }
    });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPut2, "onRequestPut2");
var init_read_all = __esm({
  "api/notifications/[project_id]/read-all.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    __name2(onRequestOptions4, "onRequestOptions");
    __name2(onRequestPut2, "onRequestPut");
  }
});
async function onRequestOptions5() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
__name(onRequestOptions5, "onRequestOptions5");
async function onRequestGet7(context) {
  try {
    const { request, env, params } = context;
    const projectId = params.project_id;
    if (!projectId) {
      return new Response(JSON.stringify({
        success: false,
        error: "Project ID is required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const bearerToken = env.AFFENSUS_CREDENTIALS_PASSWORD;
    if (!bearerToken) {
      throw new Error("AFFENSUS_CREDENTIALS_PASSWORD not configured");
    }
    console.log("Making API request to:", `https://apiv2.affensus.com/api/projects/${projectId}/credentials-summary`);
    console.log("Headers:", {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${bearerToken.substring(0, 8)}...`
    });
    let response;
    try {
      response = await fetch(`https://apiv2.affensus.com/api/projects/${projectId}/credentials-summary`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${bearerToken}`
        }
      });
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      const errorMessage = fetchError instanceof Error ? fetchError.message : "Unknown fetch error";
      throw new Error(`Network error: ${errorMessage}`);
    }
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Response Error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`External API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const data = await response.json();
    return new Response(JSON.stringify({
      success: true,
      data
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, max-age=300, s-maxage=0"
        // 5 minutes cache for project credentials data
      }
    });
  } catch (error) {
    console.error("Error fetching project credentials summary:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to fetch project credentials summary"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet7, "onRequestGet7");
var init_credentials_summary = __esm({
  "api/projects/[project_id]/credentials-summary.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    __name2(onRequestOptions5, "onRequestOptions");
    __name2(onRequestGet7, "onRequestGet");
  }
});
async function onRequestOptions6() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
__name(onRequestOptions6, "onRequestOptions6");
async function onRequestGet8(context) {
  try {
    const { request, env, params } = context;
    const projectId = params.project_id;
    if (!projectId) {
      return new Response(JSON.stringify({
        success: false,
        error: "Project ID is required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const bearerToken = env.AFFENSUS_CREDENTIALS_PASSWORD;
    if (!bearerToken) {
      throw new Error("AFFENSUS_CREDENTIALS_PASSWORD not configured");
    }
    console.log("Making API request to:", `https://apiv2.affensus.com/api/projects/${projectId}/link-rot`);
    console.log("Headers:", {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${bearerToken.substring(0, 8)}...`
    });
    let response;
    try {
      response = await fetch(`https://apiv2.affensus.com/api/projects/${projectId}/link-rot`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${bearerToken}`
        }
      });
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      const errorMessage = fetchError instanceof Error ? fetchError.message : "Unknown fetch error";
      throw new Error(`Network error: ${errorMessage}`);
    }
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Response Error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`External API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const data = await response.json();
    console.log("=== LINK ROT API RESPONSE ===");
    console.log(JSON.stringify(data, null, 2));
    console.log("=== END API RESPONSE ===");
    return new Response(JSON.stringify({
      success: true,
      data
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, max-age=300, s-maxage=0"
        // 5 minutes cache for project link-rot data
      }
    });
  } catch (error) {
    console.error("Error fetching project link-rot data:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to fetch project link-rot data"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet8, "onRequestGet8");
var init_link_rot = __esm({
  "api/projects/[project_id]/link-rot.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    __name2(onRequestOptions6, "onRequestOptions");
    __name2(onRequestGet8, "onRequestGet");
  }
});
async function onRequestOptions7() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
__name(onRequestOptions7, "onRequestOptions7");
async function onRequestGet9(context) {
  try {
    const { request, env, params } = context;
    const projectId = params.project_id;
    if (!projectId) {
      return new Response(JSON.stringify({
        success: false,
        error: "Project ID is required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const url = new URL(request.url);
    const networkId = url.searchParams.get("network_id");
    const credentialId = url.searchParams.get("credential_id");
    if (!networkId || !credentialId) {
      return new Response(JSON.stringify({
        success: false,
        error: "network_id and credential_id are required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const bearerToken = env.AFFENSUS_CREDENTIALS_PASSWORD;
    if (!bearerToken) {
      throw new Error("AFFENSUS_CREDENTIALS_PASSWORD not configured");
    }
    const apiUrl = `https://apiv2.affensus.com/api/projects/${projectId}/merchants?network_id=${networkId}&credential_id=${credentialId}`;
    console.log("Making API request to:", apiUrl);
    console.log("Headers:", {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${bearerToken.substring(0, 8)}...`
    });
    let response;
    try {
      response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${bearerToken}`
        }
      });
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      const errorMessage = fetchError instanceof Error ? fetchError.message : "Unknown fetch error";
      throw new Error(`Network error: ${errorMessage}`);
    }
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Response Error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`External API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const data = await response.json();
    console.log("Merchants API Response:", JSON.stringify(data, null, 2));
    return new Response(JSON.stringify({
      success: true,
      data
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, max-age=300, s-maxage=0"
        // 5 minutes cache for merchants data
      }
    });
  } catch (error) {
    console.error("Error fetching project merchants:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to fetch project merchants"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet9, "onRequestGet9");
var init_merchants = __esm({
  "api/projects/[project_id]/merchants.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    __name2(onRequestOptions7, "onRequestOptions");
    __name2(onRequestGet9, "onRequestGet");
  }
});
async function onRequestOptions8() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
__name(onRequestOptions8, "onRequestOptions8");
async function onRequestGet10(context) {
  try {
    const { request, env, params } = context;
    const projectId = params.project_id;
    if (!projectId) {
      return new Response(JSON.stringify({
        success: false,
        error: "Project ID is required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const bearerToken = env.AFFENSUS_CREDENTIALS_PASSWORD;
    if (!bearerToken) {
      throw new Error("AFFENSUS_CREDENTIALS_PASSWORD not configured");
    }
    console.log("Making API request to:", `https://apiv2.affensus.com/api/projects/${projectId}/networks`);
    console.log("Headers:", {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${bearerToken.substring(0, 8)}...`
    });
    let response;
    try {
      response = await fetch(`https://apiv2.affensus.com/api/projects/${projectId}/networks`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${bearerToken}`
        }
      });
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      const errorMessage = fetchError instanceof Error ? fetchError.message : "Unknown fetch error";
      throw new Error(`Network error: ${errorMessage}`);
    }
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Response Error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`External API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const data = await response.json();
    return new Response(JSON.stringify({
      success: true,
      data
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, max-age=300, s-maxage=0"
        // 5 minutes cache for networks data
      }
    });
  } catch (error) {
    console.error("Error fetching project networks:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to fetch project networks"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet10, "onRequestGet10");
var init_networks = __esm({
  "api/projects/[project_id]/networks.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    __name2(onRequestOptions8, "onRequestOptions");
    __name2(onRequestGet10, "onRequestGet");
  }
});
async function onRequestOptions9() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
__name(onRequestOptions9, "onRequestOptions9");
async function onRequestGet11(context) {
  try {
    const { request, env, params } = context;
    const projectId = params.project_id;
    if (!projectId) {
      return new Response(JSON.stringify({
        success: false,
        error: "Project ID is required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const bearerToken = env.AFFENSUS_CREDENTIALS_PASSWORD;
    if (!bearerToken) {
      throw new Error("AFFENSUS_CREDENTIALS_PASSWORD not configured");
    }
    console.log("Making API request to:", `https://apiv2.affensus.com/api/projects/${projectId}/notifications`);
    console.log("Headers:", {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${bearerToken.substring(0, 8)}...`
    });
    let response;
    try {
      response = await fetch(`https://apiv2.affensus.com/api/projects/${projectId}/notifications`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${bearerToken}`
        }
      });
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      const errorMessage = fetchError instanceof Error ? fetchError.message : "Unknown fetch error";
      throw new Error(`Network error: ${errorMessage}`);
    }
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Response Error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`External API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const data = await response.json();
    return new Response(JSON.stringify({
      success: true,
      data
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, max-age=300, s-maxage=0"
        // 5 minutes cache for project notifications data
      }
    });
  } catch (error) {
    console.error("Error fetching project notifications data:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to fetch project notifications data"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet11, "onRequestGet11");
var init_notifications = __esm({
  "api/projects/[project_id]/notifications.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    __name2(onRequestOptions9, "onRequestOptions");
    __name2(onRequestGet11, "onRequestGet");
  }
});
async function onRequestOptions10() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
__name(onRequestOptions10, "onRequestOptions10");
async function onRequestGet12(context) {
  const { params, request, env } = context;
  const projectId = params.project_id;
  const url = new URL(request.url);
  const searchQuery = url.searchParams.get("q");
  if (!searchQuery || searchQuery.length < 2) {
    return new Response(JSON.stringify({ error: 'Query parameter "q" is required and must be at least 2 characters long' }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
  const cacheKey = `search_${projectId}_${searchQuery}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return new Response(JSON.stringify(cached.data), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=300"
      }
    });
  }
  if (ongoingRequests.has(cacheKey)) {
    const response = await ongoingRequests.get(cacheKey);
    return response.clone();
  }
  const requestPromise = (async () => {
    try {
      const apiUrl = `https://apiv2.affensus.com/api/projects/${projectId}/search?q=${encodeURIComponent(searchQuery)}`;
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${env.AFFENSUS_CREDENTIALS_PASSWORD}`,
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      const data = await response.json();
      cache.set(cacheKey, { data, timestamp: Date.now() });
      return new Response(JSON.stringify(data), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=300"
        }
      });
    } catch (error) {
      console.error("Error fetching search results:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch search results" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } finally {
      ongoingRequests.delete(cacheKey);
    }
  })();
  ongoingRequests.set(cacheKey, requestPromise);
  return requestPromise;
}
__name(onRequestGet12, "onRequestGet12");
var cache;
var CACHE_TTL;
var ongoingRequests;
var init_search = __esm({
  "api/projects/[project_id]/search.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    cache = /* @__PURE__ */ new Map();
    CACHE_TTL = 5 * 60 * 1e3;
    ongoingRequests = /* @__PURE__ */ new Map();
    __name2(onRequestOptions10, "onRequestOptions");
    __name2(onRequestGet12, "onRequestGet");
  }
});
async function onRequestOptions11() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
__name(onRequestOptions11, "onRequestOptions11");
async function onRequestGet13(context) {
  const { request, env, params } = context;
  const { project_id, notification_id } = params;
  try {
    console.log("Project ID:", project_id);
    console.log("Notification ID:", notification_id);
    if (!project_id || !notification_id) {
      return new Response(JSON.stringify({
        success: false,
        error: "project_id and notification_id are required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const password = env.AFFENSUS_CREDENTIALS_PASSWORD;
    if (!password) {
      return new Response(JSON.stringify({
        success: false,
        error: "AFFENSUS_CREDENTIALS_PASSWORD not configured"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    const apiUrl = `https://apiv2.affensus.com/api/notifications/${project_id}/${notification_id}`;
    console.log("Making GET request to:", apiUrl);
    const apiv2Response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${password}`
      }
    });
    if (!apiv2Response.ok) {
      const errorText = await apiv2Response.text();
      console.error("apiv2 error response:", errorText);
      console.error("apiv2 status:", apiv2Response.status, apiv2Response.statusText);
      return new Response(JSON.stringify({
        success: false,
        error: `External API error: ${apiv2Response.status} ${apiv2Response.statusText}`,
        details: errorText
      }), {
        status: apiv2Response.status,
        headers: { "Content-Type": "application/json" }
      });
    }
    const responseData = await apiv2Response.json();
    console.log("=== NOTIFICATION API RESPONSE DEBUG ===");
    console.log("Full response data:", JSON.stringify(responseData, null, 2));
    if (responseData.notification && responseData.notification.extra_data) {
      console.log("=== EXTRA DATA DEBUG ===");
      console.log("Extra data:", JSON.stringify(responseData.notification.extra_data, null, 2));
      if (responseData.notification.extra_data.new_merchants) {
        console.log("=== NEW MERCHANTS DEBUG ===");
        responseData.notification.extra_data.new_merchants.forEach((merchant, index) => {
          console.log(`New Merchant ${index}:`, {
            merchant_name: merchant.merchant_name,
            merchant_display_url: merchant.merchant_display_url,
            program_id: merchant.program_id
          });
        });
      }
      if (responseData.notification.extra_data.status_changes) {
        console.log("=== STATUS CHANGES DEBUG ===");
        responseData.notification.extra_data.status_changes.forEach((change, index) => {
          console.log(`Status Change ${index}:`, {
            merchant_name: change.merchant_name,
            merchant_display_url: change.merchant_display_url,
            program_id: change.program_id
          });
        });
      }
      if (responseData.notification.extra_data.removed_merchants) {
        console.log("=== REMOVED MERCHANTS DEBUG ===");
        responseData.notification.extra_data.removed_merchants.forEach((merchant, index) => {
          console.log(`Removed Merchant ${index}:`, {
            merchant_name: merchant.merchant_name,
            merchant_display_url: merchant.merchant_display_url,
            program_id: merchant.program_id
          });
        });
      }
    }
    return new Response(JSON.stringify({
      success: true,
      data: responseData
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error fetching notification:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet13, "onRequestGet13");
var init_notification_id = __esm({
  "api/notifications/[project_id]/[notification_id].ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    __name2(onRequestOptions11, "onRequestOptions");
    __name2(onRequestGet13, "onRequestGet");
  }
});
async function onRequestGet14(context) {
  try {
    const { request, env } = context;
    const FACEBOOK_APP_ID = env.FACEBOOK_APP_ID;
    const FACEBOOK_REDIRECT_URI = `${env.SITE_URL || "http://localhost:3000"}/api/auth/facebook/callback`;
    if (!FACEBOOK_APP_ID) {
      console.error("FACEBOOK_APP_ID not configured");
      return new Response(JSON.stringify({ error: "Facebook OAuth not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    const state = Math.random().toString(36).substring(2, 15);
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(FACEBOOK_REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent("email")}&state=${state}`;
    const response = new Response(null, {
      status: 302,
      headers: {
        "Location": authUrl,
        "Set-Cookie": `oauth_state=${state}; HttpOnly; ${env.SITE_URL?.startsWith("https://") ? "Secure; " : ""}SameSite=Lax; Max-Age=600; Path=/`
      }
    });
    return response;
  } catch (error) {
    console.error("Error initiating Facebook OAuth:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet14, "onRequestGet14");
var init_facebook = __esm({
  "api/auth/facebook/index.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    __name2(onRequestGet14, "onRequestGet");
  }
});
function generateState() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
__name(generateState, "generateState");
async function onRequestGet15(context) {
  try {
    const { env } = context;
    const GITHUB_CLIENT_ID = env.GITHUB_CLIENT_ID;
    const GITHUB_REDIRECT_URI = `${env.SITE_URL || "http://localhost:3000"}/api/auth/github/callback`;
    if (!GITHUB_CLIENT_ID) {
      return new Response(null, {
        status: 302,
        headers: { "Location": `${env.SITE_URL || "http://localhost:3000"}/auth?error=oauth_not_configured` }
      });
    }
    const state = generateState();
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(GITHUB_REDIRECT_URI)}&scope=user:email&state=${state}`;
    return new Response(null, {
      status: 302,
      headers: {
        "Location": authUrl,
        "Set-Cookie": `oauth_state=${state}; HttpOnly; ${env.SITE_URL?.startsWith("https://") ? "Secure; " : ""}SameSite=Lax; Max-Age=600; Path=/`
      }
    });
  } catch (error) {
    console.error("Error initiating GitHub OAuth:", error);
    return new Response(null, {
      status: 302,
      headers: { "Location": `${context.env.SITE_URL || "http://localhost:3000"}/auth?error=oauth_not_configured` }
    });
  }
}
__name(onRequestGet15, "onRequestGet15");
var init_github = __esm({
  "api/auth/github/index.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    __name2(generateState, "generateState");
    __name2(onRequestGet15, "onRequestGet");
  }
});
async function onRequestGet16(context) {
  try {
    const { request, env } = context;
    const GOOGLE_CLIENT_ID = env.GOOGLE_CLIENT_ID;
    const GOOGLE_REDIRECT_URI = `${env.SITE_URL || "http://localhost:3000"}/api/auth/google/callback`;
    if (!GOOGLE_CLIENT_ID) {
      console.error("GOOGLE_CLIENT_ID not configured");
      return new Response(JSON.stringify({ error: "Google OAuth not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    const state = Math.random().toString(36).substring(2, 15);
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent("openid email profile")}&state=${state}&access_type=offline&prompt=consent`;
    const response = new Response(null, {
      status: 302,
      headers: {
        "Location": authUrl,
        "Set-Cookie": `oauth_state=${state}; HttpOnly; ${env.SITE_URL?.startsWith("https://") ? "Secure; " : ""}SameSite=Lax; Max-Age=600; Path=/`
      }
    });
    return response;
  } catch (error) {
    console.error("Error initiating Google OAuth:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet16, "onRequestGet16");
var init_google = __esm({
  "api/auth/google/index.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    __name2(onRequestGet16, "onRequestGet");
  }
});
async function onRequestOptions12() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
__name(onRequestOptions12, "onRequestOptions12");
async function onRequestPost2(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    if (!body.email || !body.login_method) {
      return new Response(JSON.stringify({
        success: false,
        error: "email and login_method are required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const bearerToken = env.AFFENSUS_CREDENTIALS_PASSWORD;
    if (!bearerToken) {
      throw new Error("AFFENSUS_CREDENTIALS_PASSWORD not configured");
    }
    console.log("Making API request to:", "https://apiv2.affensus.com/api/auth/register");
    console.log("Request body:", {
      email: body.email,
      name: body.name,
      login_method: body.login_method,
      subscription_status: body.subscription_status || "free"
    });
    console.log("Headers:", {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${bearerToken.substring(0, 8)}...`
    });
    let response;
    try {
      response = await fetch("https://apiv2.affensus.com/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${bearerToken}`
        },
        body: JSON.stringify({
          email: body.email,
          name: body.name,
          login_method: body.login_method,
          subscription_status: body.subscription_status || "free"
        })
      });
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      const errorMessage = fetchError instanceof Error ? fetchError.message : "Unknown fetch error";
      throw new Error(`Network error: ${errorMessage}`);
    }
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Response Error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`External API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const data = await response.json();
    return new Response(JSON.stringify({
      success: true,
      data
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error registering user:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to register user"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost2, "onRequestPost2");
var init_register = __esm({
  "api/auth/register/index.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    __name2(onRequestOptions12, "onRequestOptions");
    __name2(onRequestPost2, "onRequestPost");
  }
});
var require_crypto = __commonJS({
  "(disabled):crypto"() {
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
  }
});
var require_core = __commonJS({
  "../node_modules/crypto-js/core.js"(exports, module) {
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    (function(root, factory) {
      if (typeof exports === "object") {
        module.exports = exports = factory();
      } else if (typeof define === "function" && define.amd) {
        define([], factory);
      } else {
        root.CryptoJS = factory();
      }
    })(exports, function() {
      var CryptoJS3 = CryptoJS3 || function(Math2, undefined2) {
        var crypto2;
        if (typeof window !== "undefined" && window.crypto) {
          crypto2 = window.crypto;
        }
        if (typeof self !== "undefined" && self.crypto) {
          crypto2 = self.crypto;
        }
        if (typeof globalThis !== "undefined" && globalThis.crypto) {
          crypto2 = globalThis.crypto;
        }
        if (!crypto2 && typeof window !== "undefined" && window.msCrypto) {
          crypto2 = window.msCrypto;
        }
        if (!crypto2 && typeof global !== "undefined" && global.crypto) {
          crypto2 = global.crypto;
        }
        if (!crypto2 && typeof __require2 === "function") {
          try {
            crypto2 = require_crypto();
          } catch (err) {
          }
        }
        var cryptoSecureRandomInt = /* @__PURE__ */ __name2(function() {
          if (crypto2) {
            if (typeof crypto2.getRandomValues === "function") {
              try {
                return crypto2.getRandomValues(new Uint32Array(1))[0];
              } catch (err) {
              }
            }
            if (typeof crypto2.randomBytes === "function") {
              try {
                return crypto2.randomBytes(4).readInt32LE();
              } catch (err) {
              }
            }
          }
          throw new Error("Native crypto module could not be used to get secure random number.");
        }, "cryptoSecureRandomInt");
        var create = Object.create || /* @__PURE__ */ function() {
          function F() {
          }
          __name(F, "F");
          __name2(F, "F");
          return function(obj) {
            var subtype;
            F.prototype = obj;
            subtype = new F();
            F.prototype = null;
            return subtype;
          };
        }();
        var C = {};
        var C_lib = C.lib = {};
        var Base = C_lib.Base = /* @__PURE__ */ function() {
          return {
            /**
             * Creates a new object that inherits from this object.
             *
             * @param {Object} overrides Properties to copy into the new object.
             *
             * @return {Object} The new object.
             *
             * @static
             *
             * @example
             *
             *     var MyType = CryptoJS.lib.Base.extend({
             *         field: 'value',
             *
             *         method: function () {
             *         }
             *     });
             */
            extend: /* @__PURE__ */ __name2(function(overrides) {
              var subtype = create(this);
              if (overrides) {
                subtype.mixIn(overrides);
              }
              if (!subtype.hasOwnProperty("init") || this.init === subtype.init) {
                subtype.init = function() {
                  subtype.$super.init.apply(this, arguments);
                };
              }
              subtype.init.prototype = subtype;
              subtype.$super = this;
              return subtype;
            }, "extend"),
            /**
             * Extends this object and runs the init method.
             * Arguments to create() will be passed to init().
             *
             * @return {Object} The new object.
             *
             * @static
             *
             * @example
             *
             *     var instance = MyType.create();
             */
            create: /* @__PURE__ */ __name2(function() {
              var instance = this.extend();
              instance.init.apply(instance, arguments);
              return instance;
            }, "create"),
            /**
             * Initializes a newly created object.
             * Override this method to add some logic when your objects are created.
             *
             * @example
             *
             *     var MyType = CryptoJS.lib.Base.extend({
             *         init: function () {
             *             // ...
             *         }
             *     });
             */
            init: /* @__PURE__ */ __name2(function() {
            }, "init"),
            /**
             * Copies properties into this object.
             *
             * @param {Object} properties The properties to mix in.
             *
             * @example
             *
             *     MyType.mixIn({
             *         field: 'value'
             *     });
             */
            mixIn: /* @__PURE__ */ __name2(function(properties) {
              for (var propertyName in properties) {
                if (properties.hasOwnProperty(propertyName)) {
                  this[propertyName] = properties[propertyName];
                }
              }
              if (properties.hasOwnProperty("toString")) {
                this.toString = properties.toString;
              }
            }, "mixIn"),
            /**
             * Creates a copy of this object.
             *
             * @return {Object} The clone.
             *
             * @example
             *
             *     var clone = instance.clone();
             */
            clone: /* @__PURE__ */ __name2(function() {
              return this.init.prototype.extend(this);
            }, "clone")
          };
        }();
        var WordArray = C_lib.WordArray = Base.extend({
          /**
           * Initializes a newly created word array.
           *
           * @param {Array} words (Optional) An array of 32-bit words.
           * @param {number} sigBytes (Optional) The number of significant bytes in the words.
           *
           * @example
           *
           *     var wordArray = CryptoJS.lib.WordArray.create();
           *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
           *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
           */
          init: /* @__PURE__ */ __name2(function(words, sigBytes) {
            words = this.words = words || [];
            if (sigBytes != undefined2) {
              this.sigBytes = sigBytes;
            } else {
              this.sigBytes = words.length * 4;
            }
          }, "init"),
          /**
           * Converts this word array to a string.
           *
           * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
           *
           * @return {string} The stringified word array.
           *
           * @example
           *
           *     var string = wordArray + '';
           *     var string = wordArray.toString();
           *     var string = wordArray.toString(CryptoJS.enc.Utf8);
           */
          toString: /* @__PURE__ */ __name2(function(encoder) {
            return (encoder || Hex).stringify(this);
          }, "toString"),
          /**
           * Concatenates a word array to this word array.
           *
           * @param {WordArray} wordArray The word array to append.
           *
           * @return {WordArray} This word array.
           *
           * @example
           *
           *     wordArray1.concat(wordArray2);
           */
          concat: /* @__PURE__ */ __name2(function(wordArray) {
            var thisWords = this.words;
            var thatWords = wordArray.words;
            var thisSigBytes = this.sigBytes;
            var thatSigBytes = wordArray.sigBytes;
            this.clamp();
            if (thisSigBytes % 4) {
              for (var i = 0; i < thatSigBytes; i++) {
                var thatByte = thatWords[i >>> 2] >>> 24 - i % 4 * 8 & 255;
                thisWords[thisSigBytes + i >>> 2] |= thatByte << 24 - (thisSigBytes + i) % 4 * 8;
              }
            } else {
              for (var j = 0; j < thatSigBytes; j += 4) {
                thisWords[thisSigBytes + j >>> 2] = thatWords[j >>> 2];
              }
            }
            this.sigBytes += thatSigBytes;
            return this;
          }, "concat"),
          /**
           * Removes insignificant bits.
           *
           * @example
           *
           *     wordArray.clamp();
           */
          clamp: /* @__PURE__ */ __name2(function() {
            var words = this.words;
            var sigBytes = this.sigBytes;
            words[sigBytes >>> 2] &= 4294967295 << 32 - sigBytes % 4 * 8;
            words.length = Math2.ceil(sigBytes / 4);
          }, "clamp"),
          /**
           * Creates a copy of this word array.
           *
           * @return {WordArray} The clone.
           *
           * @example
           *
           *     var clone = wordArray.clone();
           */
          clone: /* @__PURE__ */ __name2(function() {
            var clone = Base.clone.call(this);
            clone.words = this.words.slice(0);
            return clone;
          }, "clone"),
          /**
           * Creates a word array filled with random bytes.
           *
           * @param {number} nBytes The number of random bytes to generate.
           *
           * @return {WordArray} The random word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.lib.WordArray.random(16);
           */
          random: /* @__PURE__ */ __name2(function(nBytes) {
            var words = [];
            for (var i = 0; i < nBytes; i += 4) {
              words.push(cryptoSecureRandomInt());
            }
            return new WordArray.init(words, nBytes);
          }, "random")
        });
        var C_enc = C.enc = {};
        var Hex = C_enc.Hex = {
          /**
           * Converts a word array to a hex string.
           *
           * @param {WordArray} wordArray The word array.
           *
           * @return {string} The hex string.
           *
           * @static
           *
           * @example
           *
           *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
           */
          stringify: /* @__PURE__ */ __name2(function(wordArray) {
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;
            var hexChars = [];
            for (var i = 0; i < sigBytes; i++) {
              var bite = words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
              hexChars.push((bite >>> 4).toString(16));
              hexChars.push((bite & 15).toString(16));
            }
            return hexChars.join("");
          }, "stringify"),
          /**
           * Converts a hex string to a word array.
           *
           * @param {string} hexStr The hex string.
           *
           * @return {WordArray} The word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
           */
          parse: /* @__PURE__ */ __name2(function(hexStr) {
            var hexStrLength = hexStr.length;
            var words = [];
            for (var i = 0; i < hexStrLength; i += 2) {
              words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << 24 - i % 8 * 4;
            }
            return new WordArray.init(words, hexStrLength / 2);
          }, "parse")
        };
        var Latin1 = C_enc.Latin1 = {
          /**
           * Converts a word array to a Latin1 string.
           *
           * @param {WordArray} wordArray The word array.
           *
           * @return {string} The Latin1 string.
           *
           * @static
           *
           * @example
           *
           *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
           */
          stringify: /* @__PURE__ */ __name2(function(wordArray) {
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;
            var latin1Chars = [];
            for (var i = 0; i < sigBytes; i++) {
              var bite = words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
              latin1Chars.push(String.fromCharCode(bite));
            }
            return latin1Chars.join("");
          }, "stringify"),
          /**
           * Converts a Latin1 string to a word array.
           *
           * @param {string} latin1Str The Latin1 string.
           *
           * @return {WordArray} The word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
           */
          parse: /* @__PURE__ */ __name2(function(latin1Str) {
            var latin1StrLength = latin1Str.length;
            var words = [];
            for (var i = 0; i < latin1StrLength; i++) {
              words[i >>> 2] |= (latin1Str.charCodeAt(i) & 255) << 24 - i % 4 * 8;
            }
            return new WordArray.init(words, latin1StrLength);
          }, "parse")
        };
        var Utf8 = C_enc.Utf8 = {
          /**
           * Converts a word array to a UTF-8 string.
           *
           * @param {WordArray} wordArray The word array.
           *
           * @return {string} The UTF-8 string.
           *
           * @static
           *
           * @example
           *
           *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
           */
          stringify: /* @__PURE__ */ __name2(function(wordArray) {
            try {
              return decodeURIComponent(escape(Latin1.stringify(wordArray)));
            } catch (e) {
              throw new Error("Malformed UTF-8 data");
            }
          }, "stringify"),
          /**
           * Converts a UTF-8 string to a word array.
           *
           * @param {string} utf8Str The UTF-8 string.
           *
           * @return {WordArray} The word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
           */
          parse: /* @__PURE__ */ __name2(function(utf8Str) {
            return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
          }, "parse")
        };
        var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
          /**
           * Resets this block algorithm's data buffer to its initial state.
           *
           * @example
           *
           *     bufferedBlockAlgorithm.reset();
           */
          reset: /* @__PURE__ */ __name2(function() {
            this._data = new WordArray.init();
            this._nDataBytes = 0;
          }, "reset"),
          /**
           * Adds new data to this block algorithm's buffer.
           *
           * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
           *
           * @example
           *
           *     bufferedBlockAlgorithm._append('data');
           *     bufferedBlockAlgorithm._append(wordArray);
           */
          _append: /* @__PURE__ */ __name2(function(data) {
            if (typeof data == "string") {
              data = Utf8.parse(data);
            }
            this._data.concat(data);
            this._nDataBytes += data.sigBytes;
          }, "_append"),
          /**
           * Processes available data blocks.
           *
           * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
           *
           * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
           *
           * @return {WordArray} The processed data.
           *
           * @example
           *
           *     var processedData = bufferedBlockAlgorithm._process();
           *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
           */
          _process: /* @__PURE__ */ __name2(function(doFlush) {
            var processedWords;
            var data = this._data;
            var dataWords = data.words;
            var dataSigBytes = data.sigBytes;
            var blockSize = this.blockSize;
            var blockSizeBytes = blockSize * 4;
            var nBlocksReady = dataSigBytes / blockSizeBytes;
            if (doFlush) {
              nBlocksReady = Math2.ceil(nBlocksReady);
            } else {
              nBlocksReady = Math2.max((nBlocksReady | 0) - this._minBufferSize, 0);
            }
            var nWordsReady = nBlocksReady * blockSize;
            var nBytesReady = Math2.min(nWordsReady * 4, dataSigBytes);
            if (nWordsReady) {
              for (var offset = 0; offset < nWordsReady; offset += blockSize) {
                this._doProcessBlock(dataWords, offset);
              }
              processedWords = dataWords.splice(0, nWordsReady);
              data.sigBytes -= nBytesReady;
            }
            return new WordArray.init(processedWords, nBytesReady);
          }, "_process"),
          /**
           * Creates a copy of this object.
           *
           * @return {Object} The clone.
           *
           * @example
           *
           *     var clone = bufferedBlockAlgorithm.clone();
           */
          clone: /* @__PURE__ */ __name2(function() {
            var clone = Base.clone.call(this);
            clone._data = this._data.clone();
            return clone;
          }, "clone"),
          _minBufferSize: 0
        });
        var Hasher = C_lib.Hasher = BufferedBlockAlgorithm.extend({
          /**
           * Configuration options.
           */
          cfg: Base.extend(),
          /**
           * Initializes a newly created hasher.
           *
           * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
           *
           * @example
           *
           *     var hasher = CryptoJS.algo.SHA256.create();
           */
          init: /* @__PURE__ */ __name2(function(cfg) {
            this.cfg = this.cfg.extend(cfg);
            this.reset();
          }, "init"),
          /**
           * Resets this hasher to its initial state.
           *
           * @example
           *
           *     hasher.reset();
           */
          reset: /* @__PURE__ */ __name2(function() {
            BufferedBlockAlgorithm.reset.call(this);
            this._doReset();
          }, "reset"),
          /**
           * Updates this hasher with a message.
           *
           * @param {WordArray|string} messageUpdate The message to append.
           *
           * @return {Hasher} This hasher.
           *
           * @example
           *
           *     hasher.update('message');
           *     hasher.update(wordArray);
           */
          update: /* @__PURE__ */ __name2(function(messageUpdate) {
            this._append(messageUpdate);
            this._process();
            return this;
          }, "update"),
          /**
           * Finalizes the hash computation.
           * Note that the finalize operation is effectively a destructive, read-once operation.
           *
           * @param {WordArray|string} messageUpdate (Optional) A final message update.
           *
           * @return {WordArray} The hash.
           *
           * @example
           *
           *     var hash = hasher.finalize();
           *     var hash = hasher.finalize('message');
           *     var hash = hasher.finalize(wordArray);
           */
          finalize: /* @__PURE__ */ __name2(function(messageUpdate) {
            if (messageUpdate) {
              this._append(messageUpdate);
            }
            var hash = this._doFinalize();
            return hash;
          }, "finalize"),
          blockSize: 512 / 32,
          /**
           * Creates a shortcut function to a hasher's object interface.
           *
           * @param {Hasher} hasher The hasher to create a helper for.
           *
           * @return {Function} The shortcut function.
           *
           * @static
           *
           * @example
           *
           *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
           */
          _createHelper: /* @__PURE__ */ __name2(function(hasher) {
            return function(message, cfg) {
              return new hasher.init(cfg).finalize(message);
            };
          }, "_createHelper"),
          /**
           * Creates a shortcut function to the HMAC's object interface.
           *
           * @param {Hasher} hasher The hasher to use in this HMAC helper.
           *
           * @return {Function} The shortcut function.
           *
           * @static
           *
           * @example
           *
           *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
           */
          _createHmacHelper: /* @__PURE__ */ __name2(function(hasher) {
            return function(message, key) {
              return new C_algo.HMAC.init(hasher, key).finalize(message);
            };
          }, "_createHmacHelper")
        });
        var C_algo = C.algo = {};
        return C;
      }(Math);
      return CryptoJS3;
    });
  }
});
var require_x64_core = __commonJS({
  "../node_modules/crypto-js/x64-core.js"(exports, module) {
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    (function(root, factory) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS3) {
      (function(undefined2) {
        var C = CryptoJS3;
        var C_lib = C.lib;
        var Base = C_lib.Base;
        var X32WordArray = C_lib.WordArray;
        var C_x64 = C.x64 = {};
        var X64Word = C_x64.Word = Base.extend({
          /**
           * Initializes a newly created 64-bit word.
           *
           * @param {number} high The high 32 bits.
           * @param {number} low The low 32 bits.
           *
           * @example
           *
           *     var x64Word = CryptoJS.x64.Word.create(0x00010203, 0x04050607);
           */
          init: /* @__PURE__ */ __name2(function(high, low) {
            this.high = high;
            this.low = low;
          }, "init")
          /**
           * Bitwise NOTs this word.
           *
           * @return {X64Word} A new x64-Word object after negating.
           *
           * @example
           *
           *     var negated = x64Word.not();
           */
          // not: function () {
          // var high = ~this.high;
          // var low = ~this.low;
          // return X64Word.create(high, low);
          // },
          /**
           * Bitwise ANDs this word with the passed word.
           *
           * @param {X64Word} word The x64-Word to AND with this word.
           *
           * @return {X64Word} A new x64-Word object after ANDing.
           *
           * @example
           *
           *     var anded = x64Word.and(anotherX64Word);
           */
          // and: function (word) {
          // var high = this.high & word.high;
          // var low = this.low & word.low;
          // return X64Word.create(high, low);
          // },
          /**
           * Bitwise ORs this word with the passed word.
           *
           * @param {X64Word} word The x64-Word to OR with this word.
           *
           * @return {X64Word} A new x64-Word object after ORing.
           *
           * @example
           *
           *     var ored = x64Word.or(anotherX64Word);
           */
          // or: function (word) {
          // var high = this.high | word.high;
          // var low = this.low | word.low;
          // return X64Word.create(high, low);
          // },
          /**
           * Bitwise XORs this word with the passed word.
           *
           * @param {X64Word} word The x64-Word to XOR with this word.
           *
           * @return {X64Word} A new x64-Word object after XORing.
           *
           * @example
           *
           *     var xored = x64Word.xor(anotherX64Word);
           */
          // xor: function (word) {
          // var high = this.high ^ word.high;
          // var low = this.low ^ word.low;
          // return X64Word.create(high, low);
          // },
          /**
           * Shifts this word n bits to the left.
           *
           * @param {number} n The number of bits to shift.
           *
           * @return {X64Word} A new x64-Word object after shifting.
           *
           * @example
           *
           *     var shifted = x64Word.shiftL(25);
           */
          // shiftL: function (n) {
          // if (n < 32) {
          // var high = (this.high << n) | (this.low >>> (32 - n));
          // var low = this.low << n;
          // } else {
          // var high = this.low << (n - 32);
          // var low = 0;
          // }
          // return X64Word.create(high, low);
          // },
          /**
           * Shifts this word n bits to the right.
           *
           * @param {number} n The number of bits to shift.
           *
           * @return {X64Word} A new x64-Word object after shifting.
           *
           * @example
           *
           *     var shifted = x64Word.shiftR(7);
           */
          // shiftR: function (n) {
          // if (n < 32) {
          // var low = (this.low >>> n) | (this.high << (32 - n));
          // var high = this.high >>> n;
          // } else {
          // var low = this.high >>> (n - 32);
          // var high = 0;
          // }
          // return X64Word.create(high, low);
          // },
          /**
           * Rotates this word n bits to the left.
           *
           * @param {number} n The number of bits to rotate.
           *
           * @return {X64Word} A new x64-Word object after rotating.
           *
           * @example
           *
           *     var rotated = x64Word.rotL(25);
           */
          // rotL: function (n) {
          // return this.shiftL(n).or(this.shiftR(64 - n));
          // },
          /**
           * Rotates this word n bits to the right.
           *
           * @param {number} n The number of bits to rotate.
           *
           * @return {X64Word} A new x64-Word object after rotating.
           *
           * @example
           *
           *     var rotated = x64Word.rotR(7);
           */
          // rotR: function (n) {
          // return this.shiftR(n).or(this.shiftL(64 - n));
          // },
          /**
           * Adds this word with the passed word.
           *
           * @param {X64Word} word The x64-Word to add with this word.
           *
           * @return {X64Word} A new x64-Word object after adding.
           *
           * @example
           *
           *     var added = x64Word.add(anotherX64Word);
           */
          // add: function (word) {
          // var low = (this.low + word.low) | 0;
          // var carry = (low >>> 0) < (this.low >>> 0) ? 1 : 0;
          // var high = (this.high + word.high + carry) | 0;
          // return X64Word.create(high, low);
          // }
        });
        var X64WordArray = C_x64.WordArray = Base.extend({
          /**
           * Initializes a newly created word array.
           *
           * @param {Array} words (Optional) An array of CryptoJS.x64.Word objects.
           * @param {number} sigBytes (Optional) The number of significant bytes in the words.
           *
           * @example
           *
           *     var wordArray = CryptoJS.x64.WordArray.create();
           *
           *     var wordArray = CryptoJS.x64.WordArray.create([
           *         CryptoJS.x64.Word.create(0x00010203, 0x04050607),
           *         CryptoJS.x64.Word.create(0x18191a1b, 0x1c1d1e1f)
           *     ]);
           *
           *     var wordArray = CryptoJS.x64.WordArray.create([
           *         CryptoJS.x64.Word.create(0x00010203, 0x04050607),
           *         CryptoJS.x64.Word.create(0x18191a1b, 0x1c1d1e1f)
           *     ], 10);
           */
          init: /* @__PURE__ */ __name2(function(words, sigBytes) {
            words = this.words = words || [];
            if (sigBytes != undefined2) {
              this.sigBytes = sigBytes;
            } else {
              this.sigBytes = words.length * 8;
            }
          }, "init"),
          /**
           * Converts this 64-bit word array to a 32-bit word array.
           *
           * @return {CryptoJS.lib.WordArray} This word array's data as a 32-bit word array.
           *
           * @example
           *
           *     var x32WordArray = x64WordArray.toX32();
           */
          toX32: /* @__PURE__ */ __name2(function() {
            var x64Words = this.words;
            var x64WordsLength = x64Words.length;
            var x32Words = [];
            for (var i = 0; i < x64WordsLength; i++) {
              var x64Word = x64Words[i];
              x32Words.push(x64Word.high);
              x32Words.push(x64Word.low);
            }
            return X32WordArray.create(x32Words, this.sigBytes);
          }, "toX32"),
          /**
           * Creates a copy of this word array.
           *
           * @return {X64WordArray} The clone.
           *
           * @example
           *
           *     var clone = x64WordArray.clone();
           */
          clone: /* @__PURE__ */ __name2(function() {
            var clone = Base.clone.call(this);
            var words = clone.words = this.words.slice(0);
            var wordsLength = words.length;
            for (var i = 0; i < wordsLength; i++) {
              words[i] = words[i].clone();
            }
            return clone;
          }, "clone")
        });
      })();
      return CryptoJS3;
    });
  }
});
var require_lib_typedarrays = __commonJS({
  "../node_modules/crypto-js/lib-typedarrays.js"(exports, module) {
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    (function(root, factory) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS3) {
      (function() {
        if (typeof ArrayBuffer != "function") {
          return;
        }
        var C = CryptoJS3;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var superInit = WordArray.init;
        var subInit = WordArray.init = function(typedArray) {
          if (typedArray instanceof ArrayBuffer) {
            typedArray = new Uint8Array(typedArray);
          }
          if (typedArray instanceof Int8Array || typeof Uint8ClampedArray !== "undefined" && typedArray instanceof Uint8ClampedArray || typedArray instanceof Int16Array || typedArray instanceof Uint16Array || typedArray instanceof Int32Array || typedArray instanceof Uint32Array || typedArray instanceof Float32Array || typedArray instanceof Float64Array) {
            typedArray = new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength);
          }
          if (typedArray instanceof Uint8Array) {
            var typedArrayByteLength = typedArray.byteLength;
            var words = [];
            for (var i = 0; i < typedArrayByteLength; i++) {
              words[i >>> 2] |= typedArray[i] << 24 - i % 4 * 8;
            }
            superInit.call(this, words, typedArrayByteLength);
          } else {
            superInit.apply(this, arguments);
          }
        };
        subInit.prototype = WordArray;
      })();
      return CryptoJS3.lib.WordArray;
    });
  }
});
var require_enc_utf16 = __commonJS({
  "../node_modules/crypto-js/enc-utf16.js"(exports, module) {
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    (function(root, factory) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS3) {
      (function() {
        var C = CryptoJS3;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var C_enc = C.enc;
        var Utf16BE = C_enc.Utf16 = C_enc.Utf16BE = {
          /**
           * Converts a word array to a UTF-16 BE string.
           *
           * @param {WordArray} wordArray The word array.
           *
           * @return {string} The UTF-16 BE string.
           *
           * @static
           *
           * @example
           *
           *     var utf16String = CryptoJS.enc.Utf16.stringify(wordArray);
           */
          stringify: /* @__PURE__ */ __name2(function(wordArray) {
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;
            var utf16Chars = [];
            for (var i = 0; i < sigBytes; i += 2) {
              var codePoint = words[i >>> 2] >>> 16 - i % 4 * 8 & 65535;
              utf16Chars.push(String.fromCharCode(codePoint));
            }
            return utf16Chars.join("");
          }, "stringify"),
          /**
           * Converts a UTF-16 BE string to a word array.
           *
           * @param {string} utf16Str The UTF-16 BE string.
           *
           * @return {WordArray} The word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.enc.Utf16.parse(utf16String);
           */
          parse: /* @__PURE__ */ __name2(function(utf16Str) {
            var utf16StrLength = utf16Str.length;
            var words = [];
            for (var i = 0; i < utf16StrLength; i++) {
              words[i >>> 1] |= utf16Str.charCodeAt(i) << 16 - i % 2 * 16;
            }
            return WordArray.create(words, utf16StrLength * 2);
          }, "parse")
        };
        C_enc.Utf16LE = {
          /**
           * Converts a word array to a UTF-16 LE string.
           *
           * @param {WordArray} wordArray The word array.
           *
           * @return {string} The UTF-16 LE string.
           *
           * @static
           *
           * @example
           *
           *     var utf16Str = CryptoJS.enc.Utf16LE.stringify(wordArray);
           */
          stringify: /* @__PURE__ */ __name2(function(wordArray) {
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;
            var utf16Chars = [];
            for (var i = 0; i < sigBytes; i += 2) {
              var codePoint = swapEndian(words[i >>> 2] >>> 16 - i % 4 * 8 & 65535);
              utf16Chars.push(String.fromCharCode(codePoint));
            }
            return utf16Chars.join("");
          }, "stringify"),
          /**
           * Converts a UTF-16 LE string to a word array.
           *
           * @param {string} utf16Str The UTF-16 LE string.
           *
           * @return {WordArray} The word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.enc.Utf16LE.parse(utf16Str);
           */
          parse: /* @__PURE__ */ __name2(function(utf16Str) {
            var utf16StrLength = utf16Str.length;
            var words = [];
            for (var i = 0; i < utf16StrLength; i++) {
              words[i >>> 1] |= swapEndian(utf16Str.charCodeAt(i) << 16 - i % 2 * 16);
            }
            return WordArray.create(words, utf16StrLength * 2);
          }, "parse")
        };
        function swapEndian(word) {
          return word << 8 & 4278255360 | word >>> 8 & 16711935;
        }
        __name(swapEndian, "swapEndian");
        __name2(swapEndian, "swapEndian");
      })();
      return CryptoJS3.enc.Utf16;
    });
  }
});
var require_enc_base64 = __commonJS({
  "../node_modules/crypto-js/enc-base64.js"(exports, module) {
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    (function(root, factory) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS3) {
      (function() {
        var C = CryptoJS3;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var C_enc = C.enc;
        var Base64 = C_enc.Base64 = {
          /**
           * Converts a word array to a Base64 string.
           *
           * @param {WordArray} wordArray The word array.
           *
           * @return {string} The Base64 string.
           *
           * @static
           *
           * @example
           *
           *     var base64String = CryptoJS.enc.Base64.stringify(wordArray);
           */
          stringify: /* @__PURE__ */ __name2(function(wordArray) {
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;
            var map = this._map;
            wordArray.clamp();
            var base64Chars = [];
            for (var i = 0; i < sigBytes; i += 3) {
              var byte1 = words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
              var byte2 = words[i + 1 >>> 2] >>> 24 - (i + 1) % 4 * 8 & 255;
              var byte3 = words[i + 2 >>> 2] >>> 24 - (i + 2) % 4 * 8 & 255;
              var triplet = byte1 << 16 | byte2 << 8 | byte3;
              for (var j = 0; j < 4 && i + j * 0.75 < sigBytes; j++) {
                base64Chars.push(map.charAt(triplet >>> 6 * (3 - j) & 63));
              }
            }
            var paddingChar = map.charAt(64);
            if (paddingChar) {
              while (base64Chars.length % 4) {
                base64Chars.push(paddingChar);
              }
            }
            return base64Chars.join("");
          }, "stringify"),
          /**
           * Converts a Base64 string to a word array.
           *
           * @param {string} base64Str The Base64 string.
           *
           * @return {WordArray} The word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.enc.Base64.parse(base64String);
           */
          parse: /* @__PURE__ */ __name2(function(base64Str) {
            var base64StrLength = base64Str.length;
            var map = this._map;
            var reverseMap = this._reverseMap;
            if (!reverseMap) {
              reverseMap = this._reverseMap = [];
              for (var j = 0; j < map.length; j++) {
                reverseMap[map.charCodeAt(j)] = j;
              }
            }
            var paddingChar = map.charAt(64);
            if (paddingChar) {
              var paddingIndex = base64Str.indexOf(paddingChar);
              if (paddingIndex !== -1) {
                base64StrLength = paddingIndex;
              }
            }
            return parseLoop(base64Str, base64StrLength, reverseMap);
          }, "parse"),
          _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
        };
        function parseLoop(base64Str, base64StrLength, reverseMap) {
          var words = [];
          var nBytes = 0;
          for (var i = 0; i < base64StrLength; i++) {
            if (i % 4) {
              var bits1 = reverseMap[base64Str.charCodeAt(i - 1)] << i % 4 * 2;
              var bits2 = reverseMap[base64Str.charCodeAt(i)] >>> 6 - i % 4 * 2;
              var bitsCombined = bits1 | bits2;
              words[nBytes >>> 2] |= bitsCombined << 24 - nBytes % 4 * 8;
              nBytes++;
            }
          }
          return WordArray.create(words, nBytes);
        }
        __name(parseLoop, "parseLoop");
        __name2(parseLoop, "parseLoop");
      })();
      return CryptoJS3.enc.Base64;
    });
  }
});
var require_enc_base64url = __commonJS({
  "../node_modules/crypto-js/enc-base64url.js"(exports, module) {
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    (function(root, factory) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS3) {
      (function() {
        var C = CryptoJS3;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var C_enc = C.enc;
        var Base64url = C_enc.Base64url = {
          /**
           * Converts a word array to a Base64url string.
           *
           * @param {WordArray} wordArray The word array.
           *
           * @param {boolean} urlSafe Whether to use url safe
           *
           * @return {string} The Base64url string.
           *
           * @static
           *
           * @example
           *
           *     var base64String = CryptoJS.enc.Base64url.stringify(wordArray);
           */
          stringify: /* @__PURE__ */ __name2(function(wordArray, urlSafe) {
            if (urlSafe === void 0) {
              urlSafe = true;
            }
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;
            var map = urlSafe ? this._safe_map : this._map;
            wordArray.clamp();
            var base64Chars = [];
            for (var i = 0; i < sigBytes; i += 3) {
              var byte1 = words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
              var byte2 = words[i + 1 >>> 2] >>> 24 - (i + 1) % 4 * 8 & 255;
              var byte3 = words[i + 2 >>> 2] >>> 24 - (i + 2) % 4 * 8 & 255;
              var triplet = byte1 << 16 | byte2 << 8 | byte3;
              for (var j = 0; j < 4 && i + j * 0.75 < sigBytes; j++) {
                base64Chars.push(map.charAt(triplet >>> 6 * (3 - j) & 63));
              }
            }
            var paddingChar = map.charAt(64);
            if (paddingChar) {
              while (base64Chars.length % 4) {
                base64Chars.push(paddingChar);
              }
            }
            return base64Chars.join("");
          }, "stringify"),
          /**
           * Converts a Base64url string to a word array.
           *
           * @param {string} base64Str The Base64url string.
           *
           * @param {boolean} urlSafe Whether to use url safe
           *
           * @return {WordArray} The word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.enc.Base64url.parse(base64String);
           */
          parse: /* @__PURE__ */ __name2(function(base64Str, urlSafe) {
            if (urlSafe === void 0) {
              urlSafe = true;
            }
            var base64StrLength = base64Str.length;
            var map = urlSafe ? this._safe_map : this._map;
            var reverseMap = this._reverseMap;
            if (!reverseMap) {
              reverseMap = this._reverseMap = [];
              for (var j = 0; j < map.length; j++) {
                reverseMap[map.charCodeAt(j)] = j;
              }
            }
            var paddingChar = map.charAt(64);
            if (paddingChar) {
              var paddingIndex = base64Str.indexOf(paddingChar);
              if (paddingIndex !== -1) {
                base64StrLength = paddingIndex;
              }
            }
            return parseLoop(base64Str, base64StrLength, reverseMap);
          }, "parse"),
          _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
          _safe_map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
        };
        function parseLoop(base64Str, base64StrLength, reverseMap) {
          var words = [];
          var nBytes = 0;
          for (var i = 0; i < base64StrLength; i++) {
            if (i % 4) {
              var bits1 = reverseMap[base64Str.charCodeAt(i - 1)] << i % 4 * 2;
              var bits2 = reverseMap[base64Str.charCodeAt(i)] >>> 6 - i % 4 * 2;
              var bitsCombined = bits1 | bits2;
              words[nBytes >>> 2] |= bitsCombined << 24 - nBytes % 4 * 8;
              nBytes++;
            }
          }
          return WordArray.create(words, nBytes);
        }
        __name(parseLoop, "parseLoop");
        __name2(parseLoop, "parseLoop");
      })();
      return CryptoJS3.enc.Base64url;
    });
  }
});
var require_md5 = __commonJS({
  "../node_modules/crypto-js/md5.js"(exports, module) {
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    (function(root, factory) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS3) {
      (function(Math2) {
        var C = CryptoJS3;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var Hasher = C_lib.Hasher;
        var C_algo = C.algo;
        var T = [];
        (function() {
          for (var i = 0; i < 64; i++) {
            T[i] = Math2.abs(Math2.sin(i + 1)) * 4294967296 | 0;
          }
        })();
        var MD5 = C_algo.MD5 = Hasher.extend({
          _doReset: /* @__PURE__ */ __name2(function() {
            this._hash = new WordArray.init([
              1732584193,
              4023233417,
              2562383102,
              271733878
            ]);
          }, "_doReset"),
          _doProcessBlock: /* @__PURE__ */ __name2(function(M, offset) {
            for (var i = 0; i < 16; i++) {
              var offset_i = offset + i;
              var M_offset_i = M[offset_i];
              M[offset_i] = (M_offset_i << 8 | M_offset_i >>> 24) & 16711935 | (M_offset_i << 24 | M_offset_i >>> 8) & 4278255360;
            }
            var H = this._hash.words;
            var M_offset_0 = M[offset + 0];
            var M_offset_1 = M[offset + 1];
            var M_offset_2 = M[offset + 2];
            var M_offset_3 = M[offset + 3];
            var M_offset_4 = M[offset + 4];
            var M_offset_5 = M[offset + 5];
            var M_offset_6 = M[offset + 6];
            var M_offset_7 = M[offset + 7];
            var M_offset_8 = M[offset + 8];
            var M_offset_9 = M[offset + 9];
            var M_offset_10 = M[offset + 10];
            var M_offset_11 = M[offset + 11];
            var M_offset_12 = M[offset + 12];
            var M_offset_13 = M[offset + 13];
            var M_offset_14 = M[offset + 14];
            var M_offset_15 = M[offset + 15];
            var a = H[0];
            var b = H[1];
            var c = H[2];
            var d = H[3];
            a = FF(a, b, c, d, M_offset_0, 7, T[0]);
            d = FF(d, a, b, c, M_offset_1, 12, T[1]);
            c = FF(c, d, a, b, M_offset_2, 17, T[2]);
            b = FF(b, c, d, a, M_offset_3, 22, T[3]);
            a = FF(a, b, c, d, M_offset_4, 7, T[4]);
            d = FF(d, a, b, c, M_offset_5, 12, T[5]);
            c = FF(c, d, a, b, M_offset_6, 17, T[6]);
            b = FF(b, c, d, a, M_offset_7, 22, T[7]);
            a = FF(a, b, c, d, M_offset_8, 7, T[8]);
            d = FF(d, a, b, c, M_offset_9, 12, T[9]);
            c = FF(c, d, a, b, M_offset_10, 17, T[10]);
            b = FF(b, c, d, a, M_offset_11, 22, T[11]);
            a = FF(a, b, c, d, M_offset_12, 7, T[12]);
            d = FF(d, a, b, c, M_offset_13, 12, T[13]);
            c = FF(c, d, a, b, M_offset_14, 17, T[14]);
            b = FF(b, c, d, a, M_offset_15, 22, T[15]);
            a = GG(a, b, c, d, M_offset_1, 5, T[16]);
            d = GG(d, a, b, c, M_offset_6, 9, T[17]);
            c = GG(c, d, a, b, M_offset_11, 14, T[18]);
            b = GG(b, c, d, a, M_offset_0, 20, T[19]);
            a = GG(a, b, c, d, M_offset_5, 5, T[20]);
            d = GG(d, a, b, c, M_offset_10, 9, T[21]);
            c = GG(c, d, a, b, M_offset_15, 14, T[22]);
            b = GG(b, c, d, a, M_offset_4, 20, T[23]);
            a = GG(a, b, c, d, M_offset_9, 5, T[24]);
            d = GG(d, a, b, c, M_offset_14, 9, T[25]);
            c = GG(c, d, a, b, M_offset_3, 14, T[26]);
            b = GG(b, c, d, a, M_offset_8, 20, T[27]);
            a = GG(a, b, c, d, M_offset_13, 5, T[28]);
            d = GG(d, a, b, c, M_offset_2, 9, T[29]);
            c = GG(c, d, a, b, M_offset_7, 14, T[30]);
            b = GG(b, c, d, a, M_offset_12, 20, T[31]);
            a = HH(a, b, c, d, M_offset_5, 4, T[32]);
            d = HH(d, a, b, c, M_offset_8, 11, T[33]);
            c = HH(c, d, a, b, M_offset_11, 16, T[34]);
            b = HH(b, c, d, a, M_offset_14, 23, T[35]);
            a = HH(a, b, c, d, M_offset_1, 4, T[36]);
            d = HH(d, a, b, c, M_offset_4, 11, T[37]);
            c = HH(c, d, a, b, M_offset_7, 16, T[38]);
            b = HH(b, c, d, a, M_offset_10, 23, T[39]);
            a = HH(a, b, c, d, M_offset_13, 4, T[40]);
            d = HH(d, a, b, c, M_offset_0, 11, T[41]);
            c = HH(c, d, a, b, M_offset_3, 16, T[42]);
            b = HH(b, c, d, a, M_offset_6, 23, T[43]);
            a = HH(a, b, c, d, M_offset_9, 4, T[44]);
            d = HH(d, a, b, c, M_offset_12, 11, T[45]);
            c = HH(c, d, a, b, M_offset_15, 16, T[46]);
            b = HH(b, c, d, a, M_offset_2, 23, T[47]);
            a = II(a, b, c, d, M_offset_0, 6, T[48]);
            d = II(d, a, b, c, M_offset_7, 10, T[49]);
            c = II(c, d, a, b, M_offset_14, 15, T[50]);
            b = II(b, c, d, a, M_offset_5, 21, T[51]);
            a = II(a, b, c, d, M_offset_12, 6, T[52]);
            d = II(d, a, b, c, M_offset_3, 10, T[53]);
            c = II(c, d, a, b, M_offset_10, 15, T[54]);
            b = II(b, c, d, a, M_offset_1, 21, T[55]);
            a = II(a, b, c, d, M_offset_8, 6, T[56]);
            d = II(d, a, b, c, M_offset_15, 10, T[57]);
            c = II(c, d, a, b, M_offset_6, 15, T[58]);
            b = II(b, c, d, a, M_offset_13, 21, T[59]);
            a = II(a, b, c, d, M_offset_4, 6, T[60]);
            d = II(d, a, b, c, M_offset_11, 10, T[61]);
            c = II(c, d, a, b, M_offset_2, 15, T[62]);
            b = II(b, c, d, a, M_offset_9, 21, T[63]);
            H[0] = H[0] + a | 0;
            H[1] = H[1] + b | 0;
            H[2] = H[2] + c | 0;
            H[3] = H[3] + d | 0;
          }, "_doProcessBlock"),
          _doFinalize: /* @__PURE__ */ __name2(function() {
            var data = this._data;
            var dataWords = data.words;
            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = data.sigBytes * 8;
            dataWords[nBitsLeft >>> 5] |= 128 << 24 - nBitsLeft % 32;
            var nBitsTotalH = Math2.floor(nBitsTotal / 4294967296);
            var nBitsTotalL = nBitsTotal;
            dataWords[(nBitsLeft + 64 >>> 9 << 4) + 15] = (nBitsTotalH << 8 | nBitsTotalH >>> 24) & 16711935 | (nBitsTotalH << 24 | nBitsTotalH >>> 8) & 4278255360;
            dataWords[(nBitsLeft + 64 >>> 9 << 4) + 14] = (nBitsTotalL << 8 | nBitsTotalL >>> 24) & 16711935 | (nBitsTotalL << 24 | nBitsTotalL >>> 8) & 4278255360;
            data.sigBytes = (dataWords.length + 1) * 4;
            this._process();
            var hash = this._hash;
            var H = hash.words;
            for (var i = 0; i < 4; i++) {
              var H_i = H[i];
              H[i] = (H_i << 8 | H_i >>> 24) & 16711935 | (H_i << 24 | H_i >>> 8) & 4278255360;
            }
            return hash;
          }, "_doFinalize"),
          clone: /* @__PURE__ */ __name2(function() {
            var clone = Hasher.clone.call(this);
            clone._hash = this._hash.clone();
            return clone;
          }, "clone")
        });
        function FF(a, b, c, d, x, s, t) {
          var n = a + (b & c | ~b & d) + x + t;
          return (n << s | n >>> 32 - s) + b;
        }
        __name(FF, "FF");
        __name2(FF, "FF");
        function GG(a, b, c, d, x, s, t) {
          var n = a + (b & d | c & ~d) + x + t;
          return (n << s | n >>> 32 - s) + b;
        }
        __name(GG, "GG");
        __name2(GG, "GG");
        function HH(a, b, c, d, x, s, t) {
          var n = a + (b ^ c ^ d) + x + t;
          return (n << s | n >>> 32 - s) + b;
        }
        __name(HH, "HH");
        __name2(HH, "HH");
        function II(a, b, c, d, x, s, t) {
          var n = a + (c ^ (b | ~d)) + x + t;
          return (n << s | n >>> 32 - s) + b;
        }
        __name(II, "II");
        __name2(II, "II");
        C.MD5 = Hasher._createHelper(MD5);
        C.HmacMD5 = Hasher._createHmacHelper(MD5);
      })(Math);
      return CryptoJS3.MD5;
    });
  }
});
var require_sha1 = __commonJS({
  "../node_modules/crypto-js/sha1.js"(exports, module) {
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    (function(root, factory) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS3) {
      (function() {
        var C = CryptoJS3;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var Hasher = C_lib.Hasher;
        var C_algo = C.algo;
        var W = [];
        var SHA1 = C_algo.SHA1 = Hasher.extend({
          _doReset: /* @__PURE__ */ __name2(function() {
            this._hash = new WordArray.init([
              1732584193,
              4023233417,
              2562383102,
              271733878,
              3285377520
            ]);
          }, "_doReset"),
          _doProcessBlock: /* @__PURE__ */ __name2(function(M, offset) {
            var H = this._hash.words;
            var a = H[0];
            var b = H[1];
            var c = H[2];
            var d = H[3];
            var e = H[4];
            for (var i = 0; i < 80; i++) {
              if (i < 16) {
                W[i] = M[offset + i] | 0;
              } else {
                var n = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
                W[i] = n << 1 | n >>> 31;
              }
              var t = (a << 5 | a >>> 27) + e + W[i];
              if (i < 20) {
                t += (b & c | ~b & d) + 1518500249;
              } else if (i < 40) {
                t += (b ^ c ^ d) + 1859775393;
              } else if (i < 60) {
                t += (b & c | b & d | c & d) - 1894007588;
              } else {
                t += (b ^ c ^ d) - 899497514;
              }
              e = d;
              d = c;
              c = b << 30 | b >>> 2;
              b = a;
              a = t;
            }
            H[0] = H[0] + a | 0;
            H[1] = H[1] + b | 0;
            H[2] = H[2] + c | 0;
            H[3] = H[3] + d | 0;
            H[4] = H[4] + e | 0;
          }, "_doProcessBlock"),
          _doFinalize: /* @__PURE__ */ __name2(function() {
            var data = this._data;
            var dataWords = data.words;
            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = data.sigBytes * 8;
            dataWords[nBitsLeft >>> 5] |= 128 << 24 - nBitsLeft % 32;
            dataWords[(nBitsLeft + 64 >>> 9 << 4) + 14] = Math.floor(nBitsTotal / 4294967296);
            dataWords[(nBitsLeft + 64 >>> 9 << 4) + 15] = nBitsTotal;
            data.sigBytes = dataWords.length * 4;
            this._process();
            return this._hash;
          }, "_doFinalize"),
          clone: /* @__PURE__ */ __name2(function() {
            var clone = Hasher.clone.call(this);
            clone._hash = this._hash.clone();
            return clone;
          }, "clone")
        });
        C.SHA1 = Hasher._createHelper(SHA1);
        C.HmacSHA1 = Hasher._createHmacHelper(SHA1);
      })();
      return CryptoJS3.SHA1;
    });
  }
});
var require_sha256 = __commonJS({
  "../node_modules/crypto-js/sha256.js"(exports, module) {
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    (function(root, factory) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS3) {
      (function(Math2) {
        var C = CryptoJS3;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var Hasher = C_lib.Hasher;
        var C_algo = C.algo;
        var H = [];
        var K = [];
        (function() {
          function isPrime(n2) {
            var sqrtN = Math2.sqrt(n2);
            for (var factor = 2; factor <= sqrtN; factor++) {
              if (!(n2 % factor)) {
                return false;
              }
            }
            return true;
          }
          __name(isPrime, "isPrime");
          __name2(isPrime, "isPrime");
          function getFractionalBits(n2) {
            return (n2 - (n2 | 0)) * 4294967296 | 0;
          }
          __name(getFractionalBits, "getFractionalBits");
          __name2(getFractionalBits, "getFractionalBits");
          var n = 2;
          var nPrime = 0;
          while (nPrime < 64) {
            if (isPrime(n)) {
              if (nPrime < 8) {
                H[nPrime] = getFractionalBits(Math2.pow(n, 1 / 2));
              }
              K[nPrime] = getFractionalBits(Math2.pow(n, 1 / 3));
              nPrime++;
            }
            n++;
          }
        })();
        var W = [];
        var SHA256 = C_algo.SHA256 = Hasher.extend({
          _doReset: /* @__PURE__ */ __name2(function() {
            this._hash = new WordArray.init(H.slice(0));
          }, "_doReset"),
          _doProcessBlock: /* @__PURE__ */ __name2(function(M, offset) {
            var H2 = this._hash.words;
            var a = H2[0];
            var b = H2[1];
            var c = H2[2];
            var d = H2[3];
            var e = H2[4];
            var f = H2[5];
            var g = H2[6];
            var h = H2[7];
            for (var i = 0; i < 64; i++) {
              if (i < 16) {
                W[i] = M[offset + i] | 0;
              } else {
                var gamma0x = W[i - 15];
                var gamma0 = (gamma0x << 25 | gamma0x >>> 7) ^ (gamma0x << 14 | gamma0x >>> 18) ^ gamma0x >>> 3;
                var gamma1x = W[i - 2];
                var gamma1 = (gamma1x << 15 | gamma1x >>> 17) ^ (gamma1x << 13 | gamma1x >>> 19) ^ gamma1x >>> 10;
                W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16];
              }
              var ch = e & f ^ ~e & g;
              var maj = a & b ^ a & c ^ b & c;
              var sigma0 = (a << 30 | a >>> 2) ^ (a << 19 | a >>> 13) ^ (a << 10 | a >>> 22);
              var sigma1 = (e << 26 | e >>> 6) ^ (e << 21 | e >>> 11) ^ (e << 7 | e >>> 25);
              var t1 = h + sigma1 + ch + K[i] + W[i];
              var t2 = sigma0 + maj;
              h = g;
              g = f;
              f = e;
              e = d + t1 | 0;
              d = c;
              c = b;
              b = a;
              a = t1 + t2 | 0;
            }
            H2[0] = H2[0] + a | 0;
            H2[1] = H2[1] + b | 0;
            H2[2] = H2[2] + c | 0;
            H2[3] = H2[3] + d | 0;
            H2[4] = H2[4] + e | 0;
            H2[5] = H2[5] + f | 0;
            H2[6] = H2[6] + g | 0;
            H2[7] = H2[7] + h | 0;
          }, "_doProcessBlock"),
          _doFinalize: /* @__PURE__ */ __name2(function() {
            var data = this._data;
            var dataWords = data.words;
            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = data.sigBytes * 8;
            dataWords[nBitsLeft >>> 5] |= 128 << 24 - nBitsLeft % 32;
            dataWords[(nBitsLeft + 64 >>> 9 << 4) + 14] = Math2.floor(nBitsTotal / 4294967296);
            dataWords[(nBitsLeft + 64 >>> 9 << 4) + 15] = nBitsTotal;
            data.sigBytes = dataWords.length * 4;
            this._process();
            return this._hash;
          }, "_doFinalize"),
          clone: /* @__PURE__ */ __name2(function() {
            var clone = Hasher.clone.call(this);
            clone._hash = this._hash.clone();
            return clone;
          }, "clone")
        });
        C.SHA256 = Hasher._createHelper(SHA256);
        C.HmacSHA256 = Hasher._createHmacHelper(SHA256);
      })(Math);
      return CryptoJS3.SHA256;
    });
  }
});
var require_sha224 = __commonJS({
  "../node_modules/crypto-js/sha224.js"(exports, module) {
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_sha256());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./sha256"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS3) {
      (function() {
        var C = CryptoJS3;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var C_algo = C.algo;
        var SHA256 = C_algo.SHA256;
        var SHA224 = C_algo.SHA224 = SHA256.extend({
          _doReset: /* @__PURE__ */ __name2(function() {
            this._hash = new WordArray.init([
              3238371032,
              914150663,
              812702999,
              4144912697,
              4290775857,
              1750603025,
              1694076839,
              3204075428
            ]);
          }, "_doReset"),
          _doFinalize: /* @__PURE__ */ __name2(function() {
            var hash = SHA256._doFinalize.call(this);
            hash.sigBytes -= 4;
            return hash;
          }, "_doFinalize")
        });
        C.SHA224 = SHA256._createHelper(SHA224);
        C.HmacSHA224 = SHA256._createHmacHelper(SHA224);
      })();
      return CryptoJS3.SHA224;
    });
  }
});
var require_sha512 = __commonJS({
  "../node_modules/crypto-js/sha512.js"(exports, module) {
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_x64_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./x64-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS3) {
      (function() {
        var C = CryptoJS3;
        var C_lib = C.lib;
        var Hasher = C_lib.Hasher;
        var C_x64 = C.x64;
        var X64Word = C_x64.Word;
        var X64WordArray = C_x64.WordArray;
        var C_algo = C.algo;
        function X64Word_create() {
          return X64Word.create.apply(X64Word, arguments);
        }
        __name(X64Word_create, "X64Word_create");
        __name2(X64Word_create, "X64Word_create");
        var K = [
          X64Word_create(1116352408, 3609767458),
          X64Word_create(1899447441, 602891725),
          X64Word_create(3049323471, 3964484399),
          X64Word_create(3921009573, 2173295548),
          X64Word_create(961987163, 4081628472),
          X64Word_create(1508970993, 3053834265),
          X64Word_create(2453635748, 2937671579),
          X64Word_create(2870763221, 3664609560),
          X64Word_create(3624381080, 2734883394),
          X64Word_create(310598401, 1164996542),
          X64Word_create(607225278, 1323610764),
          X64Word_create(1426881987, 3590304994),
          X64Word_create(1925078388, 4068182383),
          X64Word_create(2162078206, 991336113),
          X64Word_create(2614888103, 633803317),
          X64Word_create(3248222580, 3479774868),
          X64Word_create(3835390401, 2666613458),
          X64Word_create(4022224774, 944711139),
          X64Word_create(264347078, 2341262773),
          X64Word_create(604807628, 2007800933),
          X64Word_create(770255983, 1495990901),
          X64Word_create(1249150122, 1856431235),
          X64Word_create(1555081692, 3175218132),
          X64Word_create(1996064986, 2198950837),
          X64Word_create(2554220882, 3999719339),
          X64Word_create(2821834349, 766784016),
          X64Word_create(2952996808, 2566594879),
          X64Word_create(3210313671, 3203337956),
          X64Word_create(3336571891, 1034457026),
          X64Word_create(3584528711, 2466948901),
          X64Word_create(113926993, 3758326383),
          X64Word_create(338241895, 168717936),
          X64Word_create(666307205, 1188179964),
          X64Word_create(773529912, 1546045734),
          X64Word_create(1294757372, 1522805485),
          X64Word_create(1396182291, 2643833823),
          X64Word_create(1695183700, 2343527390),
          X64Word_create(1986661051, 1014477480),
          X64Word_create(2177026350, 1206759142),
          X64Word_create(2456956037, 344077627),
          X64Word_create(2730485921, 1290863460),
          X64Word_create(2820302411, 3158454273),
          X64Word_create(3259730800, 3505952657),
          X64Word_create(3345764771, 106217008),
          X64Word_create(3516065817, 3606008344),
          X64Word_create(3600352804, 1432725776),
          X64Word_create(4094571909, 1467031594),
          X64Word_create(275423344, 851169720),
          X64Word_create(430227734, 3100823752),
          X64Word_create(506948616, 1363258195),
          X64Word_create(659060556, 3750685593),
          X64Word_create(883997877, 3785050280),
          X64Word_create(958139571, 3318307427),
          X64Word_create(1322822218, 3812723403),
          X64Word_create(1537002063, 2003034995),
          X64Word_create(1747873779, 3602036899),
          X64Word_create(1955562222, 1575990012),
          X64Word_create(2024104815, 1125592928),
          X64Word_create(2227730452, 2716904306),
          X64Word_create(2361852424, 442776044),
          X64Word_create(2428436474, 593698344),
          X64Word_create(2756734187, 3733110249),
          X64Word_create(3204031479, 2999351573),
          X64Word_create(3329325298, 3815920427),
          X64Word_create(3391569614, 3928383900),
          X64Word_create(3515267271, 566280711),
          X64Word_create(3940187606, 3454069534),
          X64Word_create(4118630271, 4000239992),
          X64Word_create(116418474, 1914138554),
          X64Word_create(174292421, 2731055270),
          X64Word_create(289380356, 3203993006),
          X64Word_create(460393269, 320620315),
          X64Word_create(685471733, 587496836),
          X64Word_create(852142971, 1086792851),
          X64Word_create(1017036298, 365543100),
          X64Word_create(1126000580, 2618297676),
          X64Word_create(1288033470, 3409855158),
          X64Word_create(1501505948, 4234509866),
          X64Word_create(1607167915, 987167468),
          X64Word_create(1816402316, 1246189591)
        ];
        var W = [];
        (function() {
          for (var i = 0; i < 80; i++) {
            W[i] = X64Word_create();
          }
        })();
        var SHA512 = C_algo.SHA512 = Hasher.extend({
          _doReset: /* @__PURE__ */ __name2(function() {
            this._hash = new X64WordArray.init([
              new X64Word.init(1779033703, 4089235720),
              new X64Word.init(3144134277, 2227873595),
              new X64Word.init(1013904242, 4271175723),
              new X64Word.init(2773480762, 1595750129),
              new X64Word.init(1359893119, 2917565137),
              new X64Word.init(2600822924, 725511199),
              new X64Word.init(528734635, 4215389547),
              new X64Word.init(1541459225, 327033209)
            ]);
          }, "_doReset"),
          _doProcessBlock: /* @__PURE__ */ __name2(function(M, offset) {
            var H = this._hash.words;
            var H0 = H[0];
            var H1 = H[1];
            var H2 = H[2];
            var H3 = H[3];
            var H4 = H[4];
            var H5 = H[5];
            var H6 = H[6];
            var H7 = H[7];
            var H0h = H0.high;
            var H0l = H0.low;
            var H1h = H1.high;
            var H1l = H1.low;
            var H2h = H2.high;
            var H2l = H2.low;
            var H3h = H3.high;
            var H3l = H3.low;
            var H4h = H4.high;
            var H4l = H4.low;
            var H5h = H5.high;
            var H5l = H5.low;
            var H6h = H6.high;
            var H6l = H6.low;
            var H7h = H7.high;
            var H7l = H7.low;
            var ah = H0h;
            var al = H0l;
            var bh = H1h;
            var bl = H1l;
            var ch = H2h;
            var cl = H2l;
            var dh = H3h;
            var dl = H3l;
            var eh = H4h;
            var el = H4l;
            var fh = H5h;
            var fl = H5l;
            var gh = H6h;
            var gl = H6l;
            var hh = H7h;
            var hl = H7l;
            for (var i = 0; i < 80; i++) {
              var Wil;
              var Wih;
              var Wi = W[i];
              if (i < 16) {
                Wih = Wi.high = M[offset + i * 2] | 0;
                Wil = Wi.low = M[offset + i * 2 + 1] | 0;
              } else {
                var gamma0x = W[i - 15];
                var gamma0xh = gamma0x.high;
                var gamma0xl = gamma0x.low;
                var gamma0h = (gamma0xh >>> 1 | gamma0xl << 31) ^ (gamma0xh >>> 8 | gamma0xl << 24) ^ gamma0xh >>> 7;
                var gamma0l = (gamma0xl >>> 1 | gamma0xh << 31) ^ (gamma0xl >>> 8 | gamma0xh << 24) ^ (gamma0xl >>> 7 | gamma0xh << 25);
                var gamma1x = W[i - 2];
                var gamma1xh = gamma1x.high;
                var gamma1xl = gamma1x.low;
                var gamma1h = (gamma1xh >>> 19 | gamma1xl << 13) ^ (gamma1xh << 3 | gamma1xl >>> 29) ^ gamma1xh >>> 6;
                var gamma1l = (gamma1xl >>> 19 | gamma1xh << 13) ^ (gamma1xl << 3 | gamma1xh >>> 29) ^ (gamma1xl >>> 6 | gamma1xh << 26);
                var Wi7 = W[i - 7];
                var Wi7h = Wi7.high;
                var Wi7l = Wi7.low;
                var Wi16 = W[i - 16];
                var Wi16h = Wi16.high;
                var Wi16l = Wi16.low;
                Wil = gamma0l + Wi7l;
                Wih = gamma0h + Wi7h + (Wil >>> 0 < gamma0l >>> 0 ? 1 : 0);
                Wil = Wil + gamma1l;
                Wih = Wih + gamma1h + (Wil >>> 0 < gamma1l >>> 0 ? 1 : 0);
                Wil = Wil + Wi16l;
                Wih = Wih + Wi16h + (Wil >>> 0 < Wi16l >>> 0 ? 1 : 0);
                Wi.high = Wih;
                Wi.low = Wil;
              }
              var chh = eh & fh ^ ~eh & gh;
              var chl = el & fl ^ ~el & gl;
              var majh = ah & bh ^ ah & ch ^ bh & ch;
              var majl = al & bl ^ al & cl ^ bl & cl;
              var sigma0h = (ah >>> 28 | al << 4) ^ (ah << 30 | al >>> 2) ^ (ah << 25 | al >>> 7);
              var sigma0l = (al >>> 28 | ah << 4) ^ (al << 30 | ah >>> 2) ^ (al << 25 | ah >>> 7);
              var sigma1h = (eh >>> 14 | el << 18) ^ (eh >>> 18 | el << 14) ^ (eh << 23 | el >>> 9);
              var sigma1l = (el >>> 14 | eh << 18) ^ (el >>> 18 | eh << 14) ^ (el << 23 | eh >>> 9);
              var Ki = K[i];
              var Kih = Ki.high;
              var Kil = Ki.low;
              var t1l = hl + sigma1l;
              var t1h = hh + sigma1h + (t1l >>> 0 < hl >>> 0 ? 1 : 0);
              var t1l = t1l + chl;
              var t1h = t1h + chh + (t1l >>> 0 < chl >>> 0 ? 1 : 0);
              var t1l = t1l + Kil;
              var t1h = t1h + Kih + (t1l >>> 0 < Kil >>> 0 ? 1 : 0);
              var t1l = t1l + Wil;
              var t1h = t1h + Wih + (t1l >>> 0 < Wil >>> 0 ? 1 : 0);
              var t2l = sigma0l + majl;
              var t2h = sigma0h + majh + (t2l >>> 0 < sigma0l >>> 0 ? 1 : 0);
              hh = gh;
              hl = gl;
              gh = fh;
              gl = fl;
              fh = eh;
              fl = el;
              el = dl + t1l | 0;
              eh = dh + t1h + (el >>> 0 < dl >>> 0 ? 1 : 0) | 0;
              dh = ch;
              dl = cl;
              ch = bh;
              cl = bl;
              bh = ah;
              bl = al;
              al = t1l + t2l | 0;
              ah = t1h + t2h + (al >>> 0 < t1l >>> 0 ? 1 : 0) | 0;
            }
            H0l = H0.low = H0l + al;
            H0.high = H0h + ah + (H0l >>> 0 < al >>> 0 ? 1 : 0);
            H1l = H1.low = H1l + bl;
            H1.high = H1h + bh + (H1l >>> 0 < bl >>> 0 ? 1 : 0);
            H2l = H2.low = H2l + cl;
            H2.high = H2h + ch + (H2l >>> 0 < cl >>> 0 ? 1 : 0);
            H3l = H3.low = H3l + dl;
            H3.high = H3h + dh + (H3l >>> 0 < dl >>> 0 ? 1 : 0);
            H4l = H4.low = H4l + el;
            H4.high = H4h + eh + (H4l >>> 0 < el >>> 0 ? 1 : 0);
            H5l = H5.low = H5l + fl;
            H5.high = H5h + fh + (H5l >>> 0 < fl >>> 0 ? 1 : 0);
            H6l = H6.low = H6l + gl;
            H6.high = H6h + gh + (H6l >>> 0 < gl >>> 0 ? 1 : 0);
            H7l = H7.low = H7l + hl;
            H7.high = H7h + hh + (H7l >>> 0 < hl >>> 0 ? 1 : 0);
          }, "_doProcessBlock"),
          _doFinalize: /* @__PURE__ */ __name2(function() {
            var data = this._data;
            var dataWords = data.words;
            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = data.sigBytes * 8;
            dataWords[nBitsLeft >>> 5] |= 128 << 24 - nBitsLeft % 32;
            dataWords[(nBitsLeft + 128 >>> 10 << 5) + 30] = Math.floor(nBitsTotal / 4294967296);
            dataWords[(nBitsLeft + 128 >>> 10 << 5) + 31] = nBitsTotal;
            data.sigBytes = dataWords.length * 4;
            this._process();
            var hash = this._hash.toX32();
            return hash;
          }, "_doFinalize"),
          clone: /* @__PURE__ */ __name2(function() {
            var clone = Hasher.clone.call(this);
            clone._hash = this._hash.clone();
            return clone;
          }, "clone"),
          blockSize: 1024 / 32
        });
        C.SHA512 = Hasher._createHelper(SHA512);
        C.HmacSHA512 = Hasher._createHmacHelper(SHA512);
      })();
      return CryptoJS3.SHA512;
    });
  }
});
var require_sha384 = __commonJS({
  "../node_modules/crypto-js/sha384.js"(exports, module) {
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_x64_core(), require_sha512());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./x64-core", "./sha512"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS3) {
      (function() {
        var C = CryptoJS3;
        var C_x64 = C.x64;
        var X64Word = C_x64.Word;
        var X64WordArray = C_x64.WordArray;
        var C_algo = C.algo;
        var SHA512 = C_algo.SHA512;
        var SHA384 = C_algo.SHA384 = SHA512.extend({
          _doReset: /* @__PURE__ */ __name2(function() {
            this._hash = new X64WordArray.init([
              new X64Word.init(3418070365, 3238371032),
              new X64Word.init(1654270250, 914150663),
              new X64Word.init(2438529370, 812702999),
              new X64Word.init(355462360, 4144912697),
              new X64Word.init(1731405415, 4290775857),
              new X64Word.init(2394180231, 1750603025),
              new X64Word.init(3675008525, 1694076839),
              new X64Word.init(1203062813, 3204075428)
            ]);
          }, "_doReset"),
          _doFinalize: /* @__PURE__ */ __name2(function() {
            var hash = SHA512._doFinalize.call(this);
            hash.sigBytes -= 16;
            return hash;
          }, "_doFinalize")
        });
        C.SHA384 = SHA512._createHelper(SHA384);
        C.HmacSHA384 = SHA512._createHmacHelper(SHA384);
      })();
      return CryptoJS3.SHA384;
    });
  }
});
var require_sha3 = __commonJS({
  "../node_modules/crypto-js/sha3.js"(exports, module) {
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_x64_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./x64-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS3) {
      (function(Math2) {
        var C = CryptoJS3;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var Hasher = C_lib.Hasher;
        var C_x64 = C.x64;
        var X64Word = C_x64.Word;
        var C_algo = C.algo;
        var RHO_OFFSETS = [];
        var PI_INDEXES = [];
        var ROUND_CONSTANTS = [];
        (function() {
          var x = 1, y = 0;
          for (var t = 0; t < 24; t++) {
            RHO_OFFSETS[x + 5 * y] = (t + 1) * (t + 2) / 2 % 64;
            var newX = y % 5;
            var newY = (2 * x + 3 * y) % 5;
            x = newX;
            y = newY;
          }
          for (var x = 0; x < 5; x++) {
            for (var y = 0; y < 5; y++) {
              PI_INDEXES[x + 5 * y] = y + (2 * x + 3 * y) % 5 * 5;
            }
          }
          var LFSR = 1;
          for (var i = 0; i < 24; i++) {
            var roundConstantMsw = 0;
            var roundConstantLsw = 0;
            for (var j = 0; j < 7; j++) {
              if (LFSR & 1) {
                var bitPosition = (1 << j) - 1;
                if (bitPosition < 32) {
                  roundConstantLsw ^= 1 << bitPosition;
                } else {
                  roundConstantMsw ^= 1 << bitPosition - 32;
                }
              }
              if (LFSR & 128) {
                LFSR = LFSR << 1 ^ 113;
              } else {
                LFSR <<= 1;
              }
            }
            ROUND_CONSTANTS[i] = X64Word.create(roundConstantMsw, roundConstantLsw);
          }
        })();
        var T = [];
        (function() {
          for (var i = 0; i < 25; i++) {
            T[i] = X64Word.create();
          }
        })();
        var SHA3 = C_algo.SHA3 = Hasher.extend({
          /**
           * Configuration options.
           *
           * @property {number} outputLength
           *   The desired number of bits in the output hash.
           *   Only values permitted are: 224, 256, 384, 512.
           *   Default: 512
           */
          cfg: Hasher.cfg.extend({
            outputLength: 512
          }),
          _doReset: /* @__PURE__ */ __name2(function() {
            var state = this._state = [];
            for (var i = 0; i < 25; i++) {
              state[i] = new X64Word.init();
            }
            this.blockSize = (1600 - 2 * this.cfg.outputLength) / 32;
          }, "_doReset"),
          _doProcessBlock: /* @__PURE__ */ __name2(function(M, offset) {
            var state = this._state;
            var nBlockSizeLanes = this.blockSize / 2;
            for (var i = 0; i < nBlockSizeLanes; i++) {
              var M2i = M[offset + 2 * i];
              var M2i1 = M[offset + 2 * i + 1];
              M2i = (M2i << 8 | M2i >>> 24) & 16711935 | (M2i << 24 | M2i >>> 8) & 4278255360;
              M2i1 = (M2i1 << 8 | M2i1 >>> 24) & 16711935 | (M2i1 << 24 | M2i1 >>> 8) & 4278255360;
              var lane = state[i];
              lane.high ^= M2i1;
              lane.low ^= M2i;
            }
            for (var round = 0; round < 24; round++) {
              for (var x = 0; x < 5; x++) {
                var tMsw = 0, tLsw = 0;
                for (var y = 0; y < 5; y++) {
                  var lane = state[x + 5 * y];
                  tMsw ^= lane.high;
                  tLsw ^= lane.low;
                }
                var Tx = T[x];
                Tx.high = tMsw;
                Tx.low = tLsw;
              }
              for (var x = 0; x < 5; x++) {
                var Tx4 = T[(x + 4) % 5];
                var Tx1 = T[(x + 1) % 5];
                var Tx1Msw = Tx1.high;
                var Tx1Lsw = Tx1.low;
                var tMsw = Tx4.high ^ (Tx1Msw << 1 | Tx1Lsw >>> 31);
                var tLsw = Tx4.low ^ (Tx1Lsw << 1 | Tx1Msw >>> 31);
                for (var y = 0; y < 5; y++) {
                  var lane = state[x + 5 * y];
                  lane.high ^= tMsw;
                  lane.low ^= tLsw;
                }
              }
              for (var laneIndex = 1; laneIndex < 25; laneIndex++) {
                var tMsw;
                var tLsw;
                var lane = state[laneIndex];
                var laneMsw = lane.high;
                var laneLsw = lane.low;
                var rhoOffset = RHO_OFFSETS[laneIndex];
                if (rhoOffset < 32) {
                  tMsw = laneMsw << rhoOffset | laneLsw >>> 32 - rhoOffset;
                  tLsw = laneLsw << rhoOffset | laneMsw >>> 32 - rhoOffset;
                } else {
                  tMsw = laneLsw << rhoOffset - 32 | laneMsw >>> 64 - rhoOffset;
                  tLsw = laneMsw << rhoOffset - 32 | laneLsw >>> 64 - rhoOffset;
                }
                var TPiLane = T[PI_INDEXES[laneIndex]];
                TPiLane.high = tMsw;
                TPiLane.low = tLsw;
              }
              var T0 = T[0];
              var state0 = state[0];
              T0.high = state0.high;
              T0.low = state0.low;
              for (var x = 0; x < 5; x++) {
                for (var y = 0; y < 5; y++) {
                  var laneIndex = x + 5 * y;
                  var lane = state[laneIndex];
                  var TLane = T[laneIndex];
                  var Tx1Lane = T[(x + 1) % 5 + 5 * y];
                  var Tx2Lane = T[(x + 2) % 5 + 5 * y];
                  lane.high = TLane.high ^ ~Tx1Lane.high & Tx2Lane.high;
                  lane.low = TLane.low ^ ~Tx1Lane.low & Tx2Lane.low;
                }
              }
              var lane = state[0];
              var roundConstant = ROUND_CONSTANTS[round];
              lane.high ^= roundConstant.high;
              lane.low ^= roundConstant.low;
            }
          }, "_doProcessBlock"),
          _doFinalize: /* @__PURE__ */ __name2(function() {
            var data = this._data;
            var dataWords = data.words;
            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = data.sigBytes * 8;
            var blockSizeBits = this.blockSize * 32;
            dataWords[nBitsLeft >>> 5] |= 1 << 24 - nBitsLeft % 32;
            dataWords[(Math2.ceil((nBitsLeft + 1) / blockSizeBits) * blockSizeBits >>> 5) - 1] |= 128;
            data.sigBytes = dataWords.length * 4;
            this._process();
            var state = this._state;
            var outputLengthBytes = this.cfg.outputLength / 8;
            var outputLengthLanes = outputLengthBytes / 8;
            var hashWords = [];
            for (var i = 0; i < outputLengthLanes; i++) {
              var lane = state[i];
              var laneMsw = lane.high;
              var laneLsw = lane.low;
              laneMsw = (laneMsw << 8 | laneMsw >>> 24) & 16711935 | (laneMsw << 24 | laneMsw >>> 8) & 4278255360;
              laneLsw = (laneLsw << 8 | laneLsw >>> 24) & 16711935 | (laneLsw << 24 | laneLsw >>> 8) & 4278255360;
              hashWords.push(laneLsw);
              hashWords.push(laneMsw);
            }
            return new WordArray.init(hashWords, outputLengthBytes);
          }, "_doFinalize"),
          clone: /* @__PURE__ */ __name2(function() {
            var clone = Hasher.clone.call(this);
            var state = clone._state = this._state.slice(0);
            for (var i = 0; i < 25; i++) {
              state[i] = state[i].clone();
            }
            return clone;
          }, "clone")
        });
        C.SHA3 = Hasher._createHelper(SHA3);
        C.HmacSHA3 = Hasher._createHmacHelper(SHA3);
      })(Math);
      return CryptoJS3.SHA3;
    });
  }
});
var require_ripemd160 = __commonJS({
  "../node_modules/crypto-js/ripemd160.js"(exports, module) {
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    (function(root, factory) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS3) {
      (function(Math2) {
        var C = CryptoJS3;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var Hasher = C_lib.Hasher;
        var C_algo = C.algo;
        var _zl = WordArray.create([
          0,
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          13,
          14,
          15,
          7,
          4,
          13,
          1,
          10,
          6,
          15,
          3,
          12,
          0,
          9,
          5,
          2,
          14,
          11,
          8,
          3,
          10,
          14,
          4,
          9,
          15,
          8,
          1,
          2,
          7,
          0,
          6,
          13,
          11,
          5,
          12,
          1,
          9,
          11,
          10,
          0,
          8,
          12,
          4,
          13,
          3,
          7,
          15,
          14,
          5,
          6,
          2,
          4,
          0,
          5,
          9,
          7,
          12,
          2,
          10,
          14,
          1,
          3,
          8,
          11,
          6,
          15,
          13
        ]);
        var _zr = WordArray.create([
          5,
          14,
          7,
          0,
          9,
          2,
          11,
          4,
          13,
          6,
          15,
          8,
          1,
          10,
          3,
          12,
          6,
          11,
          3,
          7,
          0,
          13,
          5,
          10,
          14,
          15,
          8,
          12,
          4,
          9,
          1,
          2,
          15,
          5,
          1,
          3,
          7,
          14,
          6,
          9,
          11,
          8,
          12,
          2,
          10,
          0,
          4,
          13,
          8,
          6,
          4,
          1,
          3,
          11,
          15,
          0,
          5,
          12,
          2,
          13,
          9,
          7,
          10,
          14,
          12,
          15,
          10,
          4,
          1,
          5,
          8,
          7,
          6,
          2,
          13,
          14,
          0,
          3,
          9,
          11
        ]);
        var _sl = WordArray.create([
          11,
          14,
          15,
          12,
          5,
          8,
          7,
          9,
          11,
          13,
          14,
          15,
          6,
          7,
          9,
          8,
          7,
          6,
          8,
          13,
          11,
          9,
          7,
          15,
          7,
          12,
          15,
          9,
          11,
          7,
          13,
          12,
          11,
          13,
          6,
          7,
          14,
          9,
          13,
          15,
          14,
          8,
          13,
          6,
          5,
          12,
          7,
          5,
          11,
          12,
          14,
          15,
          14,
          15,
          9,
          8,
          9,
          14,
          5,
          6,
          8,
          6,
          5,
          12,
          9,
          15,
          5,
          11,
          6,
          8,
          13,
          12,
          5,
          12,
          13,
          14,
          11,
          8,
          5,
          6
        ]);
        var _sr = WordArray.create([
          8,
          9,
          9,
          11,
          13,
          15,
          15,
          5,
          7,
          7,
          8,
          11,
          14,
          14,
          12,
          6,
          9,
          13,
          15,
          7,
          12,
          8,
          9,
          11,
          7,
          7,
          12,
          7,
          6,
          15,
          13,
          11,
          9,
          7,
          15,
          11,
          8,
          6,
          6,
          14,
          12,
          13,
          5,
          14,
          13,
          13,
          7,
          5,
          15,
          5,
          8,
          11,
          14,
          14,
          6,
          14,
          6,
          9,
          12,
          9,
          12,
          5,
          15,
          8,
          8,
          5,
          12,
          9,
          12,
          5,
          14,
          6,
          8,
          13,
          6,
          5,
          15,
          13,
          11,
          11
        ]);
        var _hl = WordArray.create([0, 1518500249, 1859775393, 2400959708, 2840853838]);
        var _hr = WordArray.create([1352829926, 1548603684, 1836072691, 2053994217, 0]);
        var RIPEMD160 = C_algo.RIPEMD160 = Hasher.extend({
          _doReset: /* @__PURE__ */ __name2(function() {
            this._hash = WordArray.create([1732584193, 4023233417, 2562383102, 271733878, 3285377520]);
          }, "_doReset"),
          _doProcessBlock: /* @__PURE__ */ __name2(function(M, offset) {
            for (var i = 0; i < 16; i++) {
              var offset_i = offset + i;
              var M_offset_i = M[offset_i];
              M[offset_i] = (M_offset_i << 8 | M_offset_i >>> 24) & 16711935 | (M_offset_i << 24 | M_offset_i >>> 8) & 4278255360;
            }
            var H = this._hash.words;
            var hl = _hl.words;
            var hr = _hr.words;
            var zl = _zl.words;
            var zr = _zr.words;
            var sl = _sl.words;
            var sr = _sr.words;
            var al, bl, cl, dl, el;
            var ar, br, cr, dr, er;
            ar = al = H[0];
            br = bl = H[1];
            cr = cl = H[2];
            dr = dl = H[3];
            er = el = H[4];
            var t;
            for (var i = 0; i < 80; i += 1) {
              t = al + M[offset + zl[i]] | 0;
              if (i < 16) {
                t += f1(bl, cl, dl) + hl[0];
              } else if (i < 32) {
                t += f2(bl, cl, dl) + hl[1];
              } else if (i < 48) {
                t += f3(bl, cl, dl) + hl[2];
              } else if (i < 64) {
                t += f4(bl, cl, dl) + hl[3];
              } else {
                t += f5(bl, cl, dl) + hl[4];
              }
              t = t | 0;
              t = rotl(t, sl[i]);
              t = t + el | 0;
              al = el;
              el = dl;
              dl = rotl(cl, 10);
              cl = bl;
              bl = t;
              t = ar + M[offset + zr[i]] | 0;
              if (i < 16) {
                t += f5(br, cr, dr) + hr[0];
              } else if (i < 32) {
                t += f4(br, cr, dr) + hr[1];
              } else if (i < 48) {
                t += f3(br, cr, dr) + hr[2];
              } else if (i < 64) {
                t += f2(br, cr, dr) + hr[3];
              } else {
                t += f1(br, cr, dr) + hr[4];
              }
              t = t | 0;
              t = rotl(t, sr[i]);
              t = t + er | 0;
              ar = er;
              er = dr;
              dr = rotl(cr, 10);
              cr = br;
              br = t;
            }
            t = H[1] + cl + dr | 0;
            H[1] = H[2] + dl + er | 0;
            H[2] = H[3] + el + ar | 0;
            H[3] = H[4] + al + br | 0;
            H[4] = H[0] + bl + cr | 0;
            H[0] = t;
          }, "_doProcessBlock"),
          _doFinalize: /* @__PURE__ */ __name2(function() {
            var data = this._data;
            var dataWords = data.words;
            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = data.sigBytes * 8;
            dataWords[nBitsLeft >>> 5] |= 128 << 24 - nBitsLeft % 32;
            dataWords[(nBitsLeft + 64 >>> 9 << 4) + 14] = (nBitsTotal << 8 | nBitsTotal >>> 24) & 16711935 | (nBitsTotal << 24 | nBitsTotal >>> 8) & 4278255360;
            data.sigBytes = (dataWords.length + 1) * 4;
            this._process();
            var hash = this._hash;
            var H = hash.words;
            for (var i = 0; i < 5; i++) {
              var H_i = H[i];
              H[i] = (H_i << 8 | H_i >>> 24) & 16711935 | (H_i << 24 | H_i >>> 8) & 4278255360;
            }
            return hash;
          }, "_doFinalize"),
          clone: /* @__PURE__ */ __name2(function() {
            var clone = Hasher.clone.call(this);
            clone._hash = this._hash.clone();
            return clone;
          }, "clone")
        });
        function f1(x, y, z) {
          return x ^ y ^ z;
        }
        __name(f1, "f1");
        __name2(f1, "f1");
        function f2(x, y, z) {
          return x & y | ~x & z;
        }
        __name(f2, "f2");
        __name2(f2, "f2");
        function f3(x, y, z) {
          return (x | ~y) ^ z;
        }
        __name(f3, "f3");
        __name2(f3, "f3");
        function f4(x, y, z) {
          return x & z | y & ~z;
        }
        __name(f4, "f4");
        __name2(f4, "f4");
        function f5(x, y, z) {
          return x ^ (y | ~z);
        }
        __name(f5, "f5");
        __name2(f5, "f5");
        function rotl(x, n) {
          return x << n | x >>> 32 - n;
        }
        __name(rotl, "rotl");
        __name2(rotl, "rotl");
        C.RIPEMD160 = Hasher._createHelper(RIPEMD160);
        C.HmacRIPEMD160 = Hasher._createHmacHelper(RIPEMD160);
      })(Math);
      return CryptoJS3.RIPEMD160;
    });
  }
});
var require_hmac = __commonJS({
  "../node_modules/crypto-js/hmac.js"(exports, module) {
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    (function(root, factory) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS3) {
      (function() {
        var C = CryptoJS3;
        var C_lib = C.lib;
        var Base = C_lib.Base;
        var C_enc = C.enc;
        var Utf8 = C_enc.Utf8;
        var C_algo = C.algo;
        var HMAC = C_algo.HMAC = Base.extend({
          /**
           * Initializes a newly created HMAC.
           *
           * @param {Hasher} hasher The hash algorithm to use.
           * @param {WordArray|string} key The secret key.
           *
           * @example
           *
           *     var hmacHasher = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, key);
           */
          init: /* @__PURE__ */ __name2(function(hasher, key) {
            hasher = this._hasher = new hasher.init();
            if (typeof key == "string") {
              key = Utf8.parse(key);
            }
            var hasherBlockSize = hasher.blockSize;
            var hasherBlockSizeBytes = hasherBlockSize * 4;
            if (key.sigBytes > hasherBlockSizeBytes) {
              key = hasher.finalize(key);
            }
            key.clamp();
            var oKey = this._oKey = key.clone();
            var iKey = this._iKey = key.clone();
            var oKeyWords = oKey.words;
            var iKeyWords = iKey.words;
            for (var i = 0; i < hasherBlockSize; i++) {
              oKeyWords[i] ^= 1549556828;
              iKeyWords[i] ^= 909522486;
            }
            oKey.sigBytes = iKey.sigBytes = hasherBlockSizeBytes;
            this.reset();
          }, "init"),
          /**
           * Resets this HMAC to its initial state.
           *
           * @example
           *
           *     hmacHasher.reset();
           */
          reset: /* @__PURE__ */ __name2(function() {
            var hasher = this._hasher;
            hasher.reset();
            hasher.update(this._iKey);
          }, "reset"),
          /**
           * Updates this HMAC with a message.
           *
           * @param {WordArray|string} messageUpdate The message to append.
           *
           * @return {HMAC} This HMAC instance.
           *
           * @example
           *
           *     hmacHasher.update('message');
           *     hmacHasher.update(wordArray);
           */
          update: /* @__PURE__ */ __name2(function(messageUpdate) {
            this._hasher.update(messageUpdate);
            return this;
          }, "update"),
          /**
           * Finalizes the HMAC computation.
           * Note that the finalize operation is effectively a destructive, read-once operation.
           *
           * @param {WordArray|string} messageUpdate (Optional) A final message update.
           *
           * @return {WordArray} The HMAC.
           *
           * @example
           *
           *     var hmac = hmacHasher.finalize();
           *     var hmac = hmacHasher.finalize('message');
           *     var hmac = hmacHasher.finalize(wordArray);
           */
          finalize: /* @__PURE__ */ __name2(function(messageUpdate) {
            var hasher = this._hasher;
            var innerHash = hasher.finalize(messageUpdate);
            hasher.reset();
            var hmac = hasher.finalize(this._oKey.clone().concat(innerHash));
            return hmac;
          }, "finalize")
        });
      })();
    });
  }
});
var require_pbkdf2 = __commonJS({
  "../node_modules/crypto-js/pbkdf2.js"(exports, module) {
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_sha256(), require_hmac());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./sha256", "./hmac"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS3) {
      (function() {
        var C = CryptoJS3;
        var C_lib = C.lib;
        var Base = C_lib.Base;
        var WordArray = C_lib.WordArray;
        var C_algo = C.algo;
        var SHA256 = C_algo.SHA256;
        var HMAC = C_algo.HMAC;
        var PBKDF2 = C_algo.PBKDF2 = Base.extend({
          /**
           * Configuration options.
           *
           * @property {number} keySize The key size in words to generate. Default: 4 (128 bits)
           * @property {Hasher} hasher The hasher to use. Default: SHA256
           * @property {number} iterations The number of iterations to perform. Default: 250000
           */
          cfg: Base.extend({
            keySize: 128 / 32,
            hasher: SHA256,
            iterations: 25e4
          }),
          /**
           * Initializes a newly created key derivation function.
           *
           * @param {Object} cfg (Optional) The configuration options to use for the derivation.
           *
           * @example
           *
           *     var kdf = CryptoJS.algo.PBKDF2.create();
           *     var kdf = CryptoJS.algo.PBKDF2.create({ keySize: 8 });
           *     var kdf = CryptoJS.algo.PBKDF2.create({ keySize: 8, iterations: 1000 });
           */
          init: /* @__PURE__ */ __name2(function(cfg) {
            this.cfg = this.cfg.extend(cfg);
          }, "init"),
          /**
           * Computes the Password-Based Key Derivation Function 2.
           *
           * @param {WordArray|string} password The password.
           * @param {WordArray|string} salt A salt.
           *
           * @return {WordArray} The derived key.
           *
           * @example
           *
           *     var key = kdf.compute(password, salt);
           */
          compute: /* @__PURE__ */ __name2(function(password, salt) {
            var cfg = this.cfg;
            var hmac = HMAC.create(cfg.hasher, password);
            var derivedKey = WordArray.create();
            var blockIndex = WordArray.create([1]);
            var derivedKeyWords = derivedKey.words;
            var blockIndexWords = blockIndex.words;
            var keySize = cfg.keySize;
            var iterations = cfg.iterations;
            while (derivedKeyWords.length < keySize) {
              var block = hmac.update(salt).finalize(blockIndex);
              hmac.reset();
              var blockWords = block.words;
              var blockWordsLength = blockWords.length;
              var intermediate = block;
              for (var i = 1; i < iterations; i++) {
                intermediate = hmac.finalize(intermediate);
                hmac.reset();
                var intermediateWords = intermediate.words;
                for (var j = 0; j < blockWordsLength; j++) {
                  blockWords[j] ^= intermediateWords[j];
                }
              }
              derivedKey.concat(block);
              blockIndexWords[0]++;
            }
            derivedKey.sigBytes = keySize * 4;
            return derivedKey;
          }, "compute")
        });
        C.PBKDF2 = function(password, salt, cfg) {
          return PBKDF2.create(cfg).compute(password, salt);
        };
      })();
      return CryptoJS3.PBKDF2;
    });
  }
});
var require_evpkdf = __commonJS({
  "../node_modules/crypto-js/evpkdf.js"(exports, module) {
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_sha1(), require_hmac());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./sha1", "./hmac"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS3) {
      (function() {
        var C = CryptoJS3;
        var C_lib = C.lib;
        var Base = C_lib.Base;
        var WordArray = C_lib.WordArray;
        var C_algo = C.algo;
        var MD5 = C_algo.MD5;
        var EvpKDF = C_algo.EvpKDF = Base.extend({
          /**
           * Configuration options.
           *
           * @property {number} keySize The key size in words to generate. Default: 4 (128 bits)
           * @property {Hasher} hasher The hash algorithm to use. Default: MD5
           * @property {number} iterations The number of iterations to perform. Default: 1
           */
          cfg: Base.extend({
            keySize: 128 / 32,
            hasher: MD5,
            iterations: 1
          }),
          /**
           * Initializes a newly created key derivation function.
           *
           * @param {Object} cfg (Optional) The configuration options to use for the derivation.
           *
           * @example
           *
           *     var kdf = CryptoJS.algo.EvpKDF.create();
           *     var kdf = CryptoJS.algo.EvpKDF.create({ keySize: 8 });
           *     var kdf = CryptoJS.algo.EvpKDF.create({ keySize: 8, iterations: 1000 });
           */
          init: /* @__PURE__ */ __name2(function(cfg) {
            this.cfg = this.cfg.extend(cfg);
          }, "init"),
          /**
           * Derives a key from a password.
           *
           * @param {WordArray|string} password The password.
           * @param {WordArray|string} salt A salt.
           *
           * @return {WordArray} The derived key.
           *
           * @example
           *
           *     var key = kdf.compute(password, salt);
           */
          compute: /* @__PURE__ */ __name2(function(password, salt) {
            var block;
            var cfg = this.cfg;
            var hasher = cfg.hasher.create();
            var derivedKey = WordArray.create();
            var derivedKeyWords = derivedKey.words;
            var keySize = cfg.keySize;
            var iterations = cfg.iterations;
            while (derivedKeyWords.length < keySize) {
              if (block) {
                hasher.update(block);
              }
              block = hasher.update(password).finalize(salt);
              hasher.reset();
              for (var i = 1; i < iterations; i++) {
                block = hasher.finalize(block);
                hasher.reset();
              }
              derivedKey.concat(block);
            }
            derivedKey.sigBytes = keySize * 4;
            return derivedKey;
          }, "compute")
        });
        C.EvpKDF = function(password, salt, cfg) {
          return EvpKDF.create(cfg).compute(password, salt);
        };
      })();
      return CryptoJS3.EvpKDF;
    });
  }
});
var require_cipher_core = __commonJS({
  "../node_modules/crypto-js/cipher-core.js"(exports, module) {
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_evpkdf());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./evpkdf"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS3) {
      CryptoJS3.lib.Cipher || function(undefined2) {
        var C = CryptoJS3;
        var C_lib = C.lib;
        var Base = C_lib.Base;
        var WordArray = C_lib.WordArray;
        var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm;
        var C_enc = C.enc;
        var Utf8 = C_enc.Utf8;
        var Base64 = C_enc.Base64;
        var C_algo = C.algo;
        var EvpKDF = C_algo.EvpKDF;
        var Cipher = C_lib.Cipher = BufferedBlockAlgorithm.extend({
          /**
           * Configuration options.
           *
           * @property {WordArray} iv The IV to use for this operation.
           */
          cfg: Base.extend(),
          /**
           * Creates this cipher in encryption mode.
           *
           * @param {WordArray} key The key.
           * @param {Object} cfg (Optional) The configuration options to use for this operation.
           *
           * @return {Cipher} A cipher instance.
           *
           * @static
           *
           * @example
           *
           *     var cipher = CryptoJS.algo.AES.createEncryptor(keyWordArray, { iv: ivWordArray });
           */
          createEncryptor: /* @__PURE__ */ __name2(function(key, cfg) {
            return this.create(this._ENC_XFORM_MODE, key, cfg);
          }, "createEncryptor"),
          /**
           * Creates this cipher in decryption mode.
           *
           * @param {WordArray} key The key.
           * @param {Object} cfg (Optional) The configuration options to use for this operation.
           *
           * @return {Cipher} A cipher instance.
           *
           * @static
           *
           * @example
           *
           *     var cipher = CryptoJS.algo.AES.createDecryptor(keyWordArray, { iv: ivWordArray });
           */
          createDecryptor: /* @__PURE__ */ __name2(function(key, cfg) {
            return this.create(this._DEC_XFORM_MODE, key, cfg);
          }, "createDecryptor"),
          /**
           * Initializes a newly created cipher.
           *
           * @param {number} xformMode Either the encryption or decryption transormation mode constant.
           * @param {WordArray} key The key.
           * @param {Object} cfg (Optional) The configuration options to use for this operation.
           *
           * @example
           *
           *     var cipher = CryptoJS.algo.AES.create(CryptoJS.algo.AES._ENC_XFORM_MODE, keyWordArray, { iv: ivWordArray });
           */
          init: /* @__PURE__ */ __name2(function(xformMode, key, cfg) {
            this.cfg = this.cfg.extend(cfg);
            this._xformMode = xformMode;
            this._key = key;
            this.reset();
          }, "init"),
          /**
           * Resets this cipher to its initial state.
           *
           * @example
           *
           *     cipher.reset();
           */
          reset: /* @__PURE__ */ __name2(function() {
            BufferedBlockAlgorithm.reset.call(this);
            this._doReset();
          }, "reset"),
          /**
           * Adds data to be encrypted or decrypted.
           *
           * @param {WordArray|string} dataUpdate The data to encrypt or decrypt.
           *
           * @return {WordArray} The data after processing.
           *
           * @example
           *
           *     var encrypted = cipher.process('data');
           *     var encrypted = cipher.process(wordArray);
           */
          process: /* @__PURE__ */ __name2(function(dataUpdate) {
            this._append(dataUpdate);
            return this._process();
          }, "process"),
          /**
           * Finalizes the encryption or decryption process.
           * Note that the finalize operation is effectively a destructive, read-once operation.
           *
           * @param {WordArray|string} dataUpdate The final data to encrypt or decrypt.
           *
           * @return {WordArray} The data after final processing.
           *
           * @example
           *
           *     var encrypted = cipher.finalize();
           *     var encrypted = cipher.finalize('data');
           *     var encrypted = cipher.finalize(wordArray);
           */
          finalize: /* @__PURE__ */ __name2(function(dataUpdate) {
            if (dataUpdate) {
              this._append(dataUpdate);
            }
            var finalProcessedData = this._doFinalize();
            return finalProcessedData;
          }, "finalize"),
          keySize: 128 / 32,
          ivSize: 128 / 32,
          _ENC_XFORM_MODE: 1,
          _DEC_XFORM_MODE: 2,
          /**
           * Creates shortcut functions to a cipher's object interface.
           *
           * @param {Cipher} cipher The cipher to create a helper for.
           *
           * @return {Object} An object with encrypt and decrypt shortcut functions.
           *
           * @static
           *
           * @example
           *
           *     var AES = CryptoJS.lib.Cipher._createHelper(CryptoJS.algo.AES);
           */
          _createHelper: /* @__PURE__ */ function() {
            function selectCipherStrategy(key) {
              if (typeof key == "string") {
                return PasswordBasedCipher;
              } else {
                return SerializableCipher;
              }
            }
            __name(selectCipherStrategy, "selectCipherStrategy");
            __name2(selectCipherStrategy, "selectCipherStrategy");
            return function(cipher) {
              return {
                encrypt: /* @__PURE__ */ __name2(function(message, key, cfg) {
                  return selectCipherStrategy(key).encrypt(cipher, message, key, cfg);
                }, "encrypt"),
                decrypt: /* @__PURE__ */ __name2(function(ciphertext, key, cfg) {
                  return selectCipherStrategy(key).decrypt(cipher, ciphertext, key, cfg);
                }, "decrypt")
              };
            };
          }()
        });
        var StreamCipher = C_lib.StreamCipher = Cipher.extend({
          _doFinalize: /* @__PURE__ */ __name2(function() {
            var finalProcessedBlocks = this._process(true);
            return finalProcessedBlocks;
          }, "_doFinalize"),
          blockSize: 1
        });
        var C_mode = C.mode = {};
        var BlockCipherMode = C_lib.BlockCipherMode = Base.extend({
          /**
           * Creates this mode for encryption.
           *
           * @param {Cipher} cipher A block cipher instance.
           * @param {Array} iv The IV words.
           *
           * @static
           *
           * @example
           *
           *     var mode = CryptoJS.mode.CBC.createEncryptor(cipher, iv.words);
           */
          createEncryptor: /* @__PURE__ */ __name2(function(cipher, iv) {
            return this.Encryptor.create(cipher, iv);
          }, "createEncryptor"),
          /**
           * Creates this mode for decryption.
           *
           * @param {Cipher} cipher A block cipher instance.
           * @param {Array} iv The IV words.
           *
           * @static
           *
           * @example
           *
           *     var mode = CryptoJS.mode.CBC.createDecryptor(cipher, iv.words);
           */
          createDecryptor: /* @__PURE__ */ __name2(function(cipher, iv) {
            return this.Decryptor.create(cipher, iv);
          }, "createDecryptor"),
          /**
           * Initializes a newly created mode.
           *
           * @param {Cipher} cipher A block cipher instance.
           * @param {Array} iv The IV words.
           *
           * @example
           *
           *     var mode = CryptoJS.mode.CBC.Encryptor.create(cipher, iv.words);
           */
          init: /* @__PURE__ */ __name2(function(cipher, iv) {
            this._cipher = cipher;
            this._iv = iv;
          }, "init")
        });
        var CBC = C_mode.CBC = function() {
          var CBC2 = BlockCipherMode.extend();
          CBC2.Encryptor = CBC2.extend({
            /**
             * Processes the data block at offset.
             *
             * @param {Array} words The data words to operate on.
             * @param {number} offset The offset where the block starts.
             *
             * @example
             *
             *     mode.processBlock(data.words, offset);
             */
            processBlock: /* @__PURE__ */ __name2(function(words, offset) {
              var cipher = this._cipher;
              var blockSize = cipher.blockSize;
              xorBlock.call(this, words, offset, blockSize);
              cipher.encryptBlock(words, offset);
              this._prevBlock = words.slice(offset, offset + blockSize);
            }, "processBlock")
          });
          CBC2.Decryptor = CBC2.extend({
            /**
             * Processes the data block at offset.
             *
             * @param {Array} words The data words to operate on.
             * @param {number} offset The offset where the block starts.
             *
             * @example
             *
             *     mode.processBlock(data.words, offset);
             */
            processBlock: /* @__PURE__ */ __name2(function(words, offset) {
              var cipher = this._cipher;
              var blockSize = cipher.blockSize;
              var thisBlock = words.slice(offset, offset + blockSize);
              cipher.decryptBlock(words, offset);
              xorBlock.call(this, words, offset, blockSize);
              this._prevBlock = thisBlock;
            }, "processBlock")
          });
          function xorBlock(words, offset, blockSize) {
            var block;
            var iv = this._iv;
            if (iv) {
              block = iv;
              this._iv = undefined2;
            } else {
              block = this._prevBlock;
            }
            for (var i = 0; i < blockSize; i++) {
              words[offset + i] ^= block[i];
            }
          }
          __name(xorBlock, "xorBlock");
          __name2(xorBlock, "xorBlock");
          return CBC2;
        }();
        var C_pad = C.pad = {};
        var Pkcs7 = C_pad.Pkcs7 = {
          /**
           * Pads data using the algorithm defined in PKCS #5/7.
           *
           * @param {WordArray} data The data to pad.
           * @param {number} blockSize The multiple that the data should be padded to.
           *
           * @static
           *
           * @example
           *
           *     CryptoJS.pad.Pkcs7.pad(wordArray, 4);
           */
          pad: /* @__PURE__ */ __name2(function(data, blockSize) {
            var blockSizeBytes = blockSize * 4;
            var nPaddingBytes = blockSizeBytes - data.sigBytes % blockSizeBytes;
            var paddingWord = nPaddingBytes << 24 | nPaddingBytes << 16 | nPaddingBytes << 8 | nPaddingBytes;
            var paddingWords = [];
            for (var i = 0; i < nPaddingBytes; i += 4) {
              paddingWords.push(paddingWord);
            }
            var padding = WordArray.create(paddingWords, nPaddingBytes);
            data.concat(padding);
          }, "pad"),
          /**
           * Unpads data that had been padded using the algorithm defined in PKCS #5/7.
           *
           * @param {WordArray} data The data to unpad.
           *
           * @static
           *
           * @example
           *
           *     CryptoJS.pad.Pkcs7.unpad(wordArray);
           */
          unpad: /* @__PURE__ */ __name2(function(data) {
            var nPaddingBytes = data.words[data.sigBytes - 1 >>> 2] & 255;
            data.sigBytes -= nPaddingBytes;
          }, "unpad")
        };
        var BlockCipher = C_lib.BlockCipher = Cipher.extend({
          /**
           * Configuration options.
           *
           * @property {Mode} mode The block mode to use. Default: CBC
           * @property {Padding} padding The padding strategy to use. Default: Pkcs7
           */
          cfg: Cipher.cfg.extend({
            mode: CBC,
            padding: Pkcs7
          }),
          reset: /* @__PURE__ */ __name2(function() {
            var modeCreator;
            Cipher.reset.call(this);
            var cfg = this.cfg;
            var iv = cfg.iv;
            var mode = cfg.mode;
            if (this._xformMode == this._ENC_XFORM_MODE) {
              modeCreator = mode.createEncryptor;
            } else {
              modeCreator = mode.createDecryptor;
              this._minBufferSize = 1;
            }
            if (this._mode && this._mode.__creator == modeCreator) {
              this._mode.init(this, iv && iv.words);
            } else {
              this._mode = modeCreator.call(mode, this, iv && iv.words);
              this._mode.__creator = modeCreator;
            }
          }, "reset"),
          _doProcessBlock: /* @__PURE__ */ __name2(function(words, offset) {
            this._mode.processBlock(words, offset);
          }, "_doProcessBlock"),
          _doFinalize: /* @__PURE__ */ __name2(function() {
            var finalProcessedBlocks;
            var padding = this.cfg.padding;
            if (this._xformMode == this._ENC_XFORM_MODE) {
              padding.pad(this._data, this.blockSize);
              finalProcessedBlocks = this._process(true);
            } else {
              finalProcessedBlocks = this._process(true);
              padding.unpad(finalProcessedBlocks);
            }
            return finalProcessedBlocks;
          }, "_doFinalize"),
          blockSize: 128 / 32
        });
        var CipherParams = C_lib.CipherParams = Base.extend({
          /**
           * Initializes a newly created cipher params object.
           *
           * @param {Object} cipherParams An object with any of the possible cipher parameters.
           *
           * @example
           *
           *     var cipherParams = CryptoJS.lib.CipherParams.create({
           *         ciphertext: ciphertextWordArray,
           *         key: keyWordArray,
           *         iv: ivWordArray,
           *         salt: saltWordArray,
           *         algorithm: CryptoJS.algo.AES,
           *         mode: CryptoJS.mode.CBC,
           *         padding: CryptoJS.pad.PKCS7,
           *         blockSize: 4,
           *         formatter: CryptoJS.format.OpenSSL
           *     });
           */
          init: /* @__PURE__ */ __name2(function(cipherParams) {
            this.mixIn(cipherParams);
          }, "init"),
          /**
           * Converts this cipher params object to a string.
           *
           * @param {Format} formatter (Optional) The formatting strategy to use.
           *
           * @return {string} The stringified cipher params.
           *
           * @throws Error If neither the formatter nor the default formatter is set.
           *
           * @example
           *
           *     var string = cipherParams + '';
           *     var string = cipherParams.toString();
           *     var string = cipherParams.toString(CryptoJS.format.OpenSSL);
           */
          toString: /* @__PURE__ */ __name2(function(formatter) {
            return (formatter || this.formatter).stringify(this);
          }, "toString")
        });
        var C_format = C.format = {};
        var OpenSSLFormatter = C_format.OpenSSL = {
          /**
           * Converts a cipher params object to an OpenSSL-compatible string.
           *
           * @param {CipherParams} cipherParams The cipher params object.
           *
           * @return {string} The OpenSSL-compatible string.
           *
           * @static
           *
           * @example
           *
           *     var openSSLString = CryptoJS.format.OpenSSL.stringify(cipherParams);
           */
          stringify: /* @__PURE__ */ __name2(function(cipherParams) {
            var wordArray;
            var ciphertext = cipherParams.ciphertext;
            var salt = cipherParams.salt;
            if (salt) {
              wordArray = WordArray.create([1398893684, 1701076831]).concat(salt).concat(ciphertext);
            } else {
              wordArray = ciphertext;
            }
            return wordArray.toString(Base64);
          }, "stringify"),
          /**
           * Converts an OpenSSL-compatible string to a cipher params object.
           *
           * @param {string} openSSLStr The OpenSSL-compatible string.
           *
           * @return {CipherParams} The cipher params object.
           *
           * @static
           *
           * @example
           *
           *     var cipherParams = CryptoJS.format.OpenSSL.parse(openSSLString);
           */
          parse: /* @__PURE__ */ __name2(function(openSSLStr) {
            var salt;
            var ciphertext = Base64.parse(openSSLStr);
            var ciphertextWords = ciphertext.words;
            if (ciphertextWords[0] == 1398893684 && ciphertextWords[1] == 1701076831) {
              salt = WordArray.create(ciphertextWords.slice(2, 4));
              ciphertextWords.splice(0, 4);
              ciphertext.sigBytes -= 16;
            }
            return CipherParams.create({ ciphertext, salt });
          }, "parse")
        };
        var SerializableCipher = C_lib.SerializableCipher = Base.extend({
          /**
           * Configuration options.
           *
           * @property {Formatter} format The formatting strategy to convert cipher param objects to and from a string. Default: OpenSSL
           */
          cfg: Base.extend({
            format: OpenSSLFormatter
          }),
          /**
           * Encrypts a message.
           *
           * @param {Cipher} cipher The cipher algorithm to use.
           * @param {WordArray|string} message The message to encrypt.
           * @param {WordArray} key The key.
           * @param {Object} cfg (Optional) The configuration options to use for this operation.
           *
           * @return {CipherParams} A cipher params object.
           *
           * @static
           *
           * @example
           *
           *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key);
           *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key, { iv: iv });
           *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key, { iv: iv, format: CryptoJS.format.OpenSSL });
           */
          encrypt: /* @__PURE__ */ __name2(function(cipher, message, key, cfg) {
            cfg = this.cfg.extend(cfg);
            var encryptor = cipher.createEncryptor(key, cfg);
            var ciphertext = encryptor.finalize(message);
            var cipherCfg = encryptor.cfg;
            return CipherParams.create({
              ciphertext,
              key,
              iv: cipherCfg.iv,
              algorithm: cipher,
              mode: cipherCfg.mode,
              padding: cipherCfg.padding,
              blockSize: cipher.blockSize,
              formatter: cfg.format
            });
          }, "encrypt"),
          /**
           * Decrypts serialized ciphertext.
           *
           * @param {Cipher} cipher The cipher algorithm to use.
           * @param {CipherParams|string} ciphertext The ciphertext to decrypt.
           * @param {WordArray} key The key.
           * @param {Object} cfg (Optional) The configuration options to use for this operation.
           *
           * @return {WordArray} The plaintext.
           *
           * @static
           *
           * @example
           *
           *     var plaintext = CryptoJS.lib.SerializableCipher.decrypt(CryptoJS.algo.AES, formattedCiphertext, key, { iv: iv, format: CryptoJS.format.OpenSSL });
           *     var plaintext = CryptoJS.lib.SerializableCipher.decrypt(CryptoJS.algo.AES, ciphertextParams, key, { iv: iv, format: CryptoJS.format.OpenSSL });
           */
          decrypt: /* @__PURE__ */ __name2(function(cipher, ciphertext, key, cfg) {
            cfg = this.cfg.extend(cfg);
            ciphertext = this._parse(ciphertext, cfg.format);
            var plaintext = cipher.createDecryptor(key, cfg).finalize(ciphertext.ciphertext);
            return plaintext;
          }, "decrypt"),
          /**
           * Converts serialized ciphertext to CipherParams,
           * else assumed CipherParams already and returns ciphertext unchanged.
           *
           * @param {CipherParams|string} ciphertext The ciphertext.
           * @param {Formatter} format The formatting strategy to use to parse serialized ciphertext.
           *
           * @return {CipherParams} The unserialized ciphertext.
           *
           * @static
           *
           * @example
           *
           *     var ciphertextParams = CryptoJS.lib.SerializableCipher._parse(ciphertextStringOrParams, format);
           */
          _parse: /* @__PURE__ */ __name2(function(ciphertext, format) {
            if (typeof ciphertext == "string") {
              return format.parse(ciphertext, this);
            } else {
              return ciphertext;
            }
          }, "_parse")
        });
        var C_kdf = C.kdf = {};
        var OpenSSLKdf = C_kdf.OpenSSL = {
          /**
           * Derives a key and IV from a password.
           *
           * @param {string} password The password to derive from.
           * @param {number} keySize The size in words of the key to generate.
           * @param {number} ivSize The size in words of the IV to generate.
           * @param {WordArray|string} salt (Optional) A 64-bit salt to use. If omitted, a salt will be generated randomly.
           *
           * @return {CipherParams} A cipher params object with the key, IV, and salt.
           *
           * @static
           *
           * @example
           *
           *     var derivedParams = CryptoJS.kdf.OpenSSL.execute('Password', 256/32, 128/32);
           *     var derivedParams = CryptoJS.kdf.OpenSSL.execute('Password', 256/32, 128/32, 'saltsalt');
           */
          execute: /* @__PURE__ */ __name2(function(password, keySize, ivSize, salt, hasher) {
            if (!salt) {
              salt = WordArray.random(64 / 8);
            }
            if (!hasher) {
              var key = EvpKDF.create({ keySize: keySize + ivSize }).compute(password, salt);
            } else {
              var key = EvpKDF.create({ keySize: keySize + ivSize, hasher }).compute(password, salt);
            }
            var iv = WordArray.create(key.words.slice(keySize), ivSize * 4);
            key.sigBytes = keySize * 4;
            return CipherParams.create({ key, iv, salt });
          }, "execute")
        };
        var PasswordBasedCipher = C_lib.PasswordBasedCipher = SerializableCipher.extend({
          /**
           * Configuration options.
           *
           * @property {KDF} kdf The key derivation function to use to generate a key and IV from a password. Default: OpenSSL
           */
          cfg: SerializableCipher.cfg.extend({
            kdf: OpenSSLKdf
          }),
          /**
           * Encrypts a message using a password.
           *
           * @param {Cipher} cipher The cipher algorithm to use.
           * @param {WordArray|string} message The message to encrypt.
           * @param {string} password The password.
           * @param {Object} cfg (Optional) The configuration options to use for this operation.
           *
           * @return {CipherParams} A cipher params object.
           *
           * @static
           *
           * @example
           *
           *     var ciphertextParams = CryptoJS.lib.PasswordBasedCipher.encrypt(CryptoJS.algo.AES, message, 'password');
           *     var ciphertextParams = CryptoJS.lib.PasswordBasedCipher.encrypt(CryptoJS.algo.AES, message, 'password', { format: CryptoJS.format.OpenSSL });
           */
          encrypt: /* @__PURE__ */ __name2(function(cipher, message, password, cfg) {
            cfg = this.cfg.extend(cfg);
            var derivedParams = cfg.kdf.execute(password, cipher.keySize, cipher.ivSize, cfg.salt, cfg.hasher);
            cfg.iv = derivedParams.iv;
            var ciphertext = SerializableCipher.encrypt.call(this, cipher, message, derivedParams.key, cfg);
            ciphertext.mixIn(derivedParams);
            return ciphertext;
          }, "encrypt"),
          /**
           * Decrypts serialized ciphertext using a password.
           *
           * @param {Cipher} cipher The cipher algorithm to use.
           * @param {CipherParams|string} ciphertext The ciphertext to decrypt.
           * @param {string} password The password.
           * @param {Object} cfg (Optional) The configuration options to use for this operation.
           *
           * @return {WordArray} The plaintext.
           *
           * @static
           *
           * @example
           *
           *     var plaintext = CryptoJS.lib.PasswordBasedCipher.decrypt(CryptoJS.algo.AES, formattedCiphertext, 'password', { format: CryptoJS.format.OpenSSL });
           *     var plaintext = CryptoJS.lib.PasswordBasedCipher.decrypt(CryptoJS.algo.AES, ciphertextParams, 'password', { format: CryptoJS.format.OpenSSL });
           */
          decrypt: /* @__PURE__ */ __name2(function(cipher, ciphertext, password, cfg) {
            cfg = this.cfg.extend(cfg);
            ciphertext = this._parse(ciphertext, cfg.format);
            var derivedParams = cfg.kdf.execute(password, cipher.keySize, cipher.ivSize, ciphertext.salt, cfg.hasher);
            cfg.iv = derivedParams.iv;
            var plaintext = SerializableCipher.decrypt.call(this, cipher, ciphertext, derivedParams.key, cfg);
            return plaintext;
          }, "decrypt")
        });
      }();
    });
  }
});
var require_mode_cfb = __commonJS({
  "../node_modules/crypto-js/mode-cfb.js"(exports, module) {
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS3) {
      CryptoJS3.mode.CFB = function() {
        var CFB = CryptoJS3.lib.BlockCipherMode.extend();
        CFB.Encryptor = CFB.extend({
          processBlock: /* @__PURE__ */ __name2(function(words, offset) {
            var cipher = this._cipher;
            var blockSize = cipher.blockSize;
            generateKeystreamAndEncrypt.call(this, words, offset, blockSize, cipher);
            this._prevBlock = words.slice(offset, offset + blockSize);
          }, "processBlock")
        });
        CFB.Decryptor = CFB.extend({
          processBlock: /* @__PURE__ */ __name2(function(words, offset) {
            var cipher = this._cipher;
            var blockSize = cipher.blockSize;
            var thisBlock = words.slice(offset, offset + blockSize);
            generateKeystreamAndEncrypt.call(this, words, offset, blockSize, cipher);
            this._prevBlock = thisBlock;
          }, "processBlock")
        });
        function generateKeystreamAndEncrypt(words, offset, blockSize, cipher) {
          var keystream;
          var iv = this._iv;
          if (iv) {
            keystream = iv.slice(0);
            this._iv = void 0;
          } else {
            keystream = this._prevBlock;
          }
          cipher.encryptBlock(keystream, 0);
          for (var i = 0; i < blockSize; i++) {
            words[offset + i] ^= keystream[i];
          }
        }
        __name(generateKeystreamAndEncrypt, "generateKeystreamAndEncrypt");
        __name2(generateKeystreamAndEncrypt, "generateKeystreamAndEncrypt");
        return CFB;
      }();
      return CryptoJS3.mode.CFB;
    });
  }
});
var require_mode_ctr = __commonJS({
  "../node_modules/crypto-js/mode-ctr.js"(exports, module) {
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS3) {
      CryptoJS3.mode.CTR = function() {
        var CTR = CryptoJS3.lib.BlockCipherMode.extend();
        var Encryptor = CTR.Encryptor = CTR.extend({
          processBlock: /* @__PURE__ */ __name2(function(words, offset) {
            var cipher = this._cipher;
            var blockSize = cipher.blockSize;
            var iv = this._iv;
            var counter = this._counter;
            if (iv) {
              counter = this._counter = iv.slice(0);
              this._iv = void 0;
            }
            var keystream = counter.slice(0);
            cipher.encryptBlock(keystream, 0);
            counter[blockSize - 1] = counter[blockSize - 1] + 1 | 0;
            for (var i = 0; i < blockSize; i++) {
              words[offset + i] ^= keystream[i];
            }
          }, "processBlock")
        });
        CTR.Decryptor = Encryptor;
        return CTR;
      }();
      return CryptoJS3.mode.CTR;
    });
  }
});
var require_mode_ctr_gladman = __commonJS({
  "../node_modules/crypto-js/mode-ctr-gladman.js"(exports, module) {
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS3) {
      CryptoJS3.mode.CTRGladman = function() {
        var CTRGladman = CryptoJS3.lib.BlockCipherMode.extend();
        function incWord(word) {
          if ((word >> 24 & 255) === 255) {
            var b1 = word >> 16 & 255;
            var b2 = word >> 8 & 255;
            var b3 = word & 255;
            if (b1 === 255) {
              b1 = 0;
              if (b2 === 255) {
                b2 = 0;
                if (b3 === 255) {
                  b3 = 0;
                } else {
                  ++b3;
                }
              } else {
                ++b2;
              }
            } else {
              ++b1;
            }
            word = 0;
            word += b1 << 16;
            word += b2 << 8;
            word += b3;
          } else {
            word += 1 << 24;
          }
          return word;
        }
        __name(incWord, "incWord");
        __name2(incWord, "incWord");
        function incCounter(counter) {
          if ((counter[0] = incWord(counter[0])) === 0) {
            counter[1] = incWord(counter[1]);
          }
          return counter;
        }
        __name(incCounter, "incCounter");
        __name2(incCounter, "incCounter");
        var Encryptor = CTRGladman.Encryptor = CTRGladman.extend({
          processBlock: /* @__PURE__ */ __name2(function(words, offset) {
            var cipher = this._cipher;
            var blockSize = cipher.blockSize;
            var iv = this._iv;
            var counter = this._counter;
            if (iv) {
              counter = this._counter = iv.slice(0);
              this._iv = void 0;
            }
            incCounter(counter);
            var keystream = counter.slice(0);
            cipher.encryptBlock(keystream, 0);
            for (var i = 0; i < blockSize; i++) {
              words[offset + i] ^= keystream[i];
            }
          }, "processBlock")
        });
        CTRGladman.Decryptor = Encryptor;
        return CTRGladman;
      }();
      return CryptoJS3.mode.CTRGladman;
    });
  }
});
var require_mode_ofb = __commonJS({
  "../node_modules/crypto-js/mode-ofb.js"(exports, module) {
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS3) {
      CryptoJS3.mode.OFB = function() {
        var OFB = CryptoJS3.lib.BlockCipherMode.extend();
        var Encryptor = OFB.Encryptor = OFB.extend({
          processBlock: /* @__PURE__ */ __name2(function(words, offset) {
            var cipher = this._cipher;
            var blockSize = cipher.blockSize;
            var iv = this._iv;
            var keystream = this._keystream;
            if (iv) {
              keystream = this._keystream = iv.slice(0);
              this._iv = void 0;
            }
            cipher.encryptBlock(keystream, 0);
            for (var i = 0; i < blockSize; i++) {
              words[offset + i] ^= keystream[i];
            }
          }, "processBlock")
        });
        OFB.Decryptor = Encryptor;
        return OFB;
      }();
      return CryptoJS3.mode.OFB;
    });
  }
});
var require_mode_ecb = __commonJS({
  "../node_modules/crypto-js/mode-ecb.js"(exports, module) {
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS3) {
      CryptoJS3.mode.ECB = function() {
        var ECB = CryptoJS3.lib.BlockCipherMode.extend();
        ECB.Encryptor = ECB.extend({
          processBlock: /* @__PURE__ */ __name2(function(words, offset) {
            this._cipher.encryptBlock(words, offset);
          }, "processBlock")
        });
        ECB.Decryptor = ECB.extend({
          processBlock: /* @__PURE__ */ __name2(function(words, offset) {
            this._cipher.decryptBlock(words, offset);
          }, "processBlock")
        });
        return ECB;
      }();
      return CryptoJS3.mode.ECB;
    });
  }
});
var require_pad_ansix923 = __commonJS({
  "../node_modules/crypto-js/pad-ansix923.js"(exports, module) {
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS3) {
      CryptoJS3.pad.AnsiX923 = {
        pad: /* @__PURE__ */ __name2(function(data, blockSize) {
          var dataSigBytes = data.sigBytes;
          var blockSizeBytes = blockSize * 4;
          var nPaddingBytes = blockSizeBytes - dataSigBytes % blockSizeBytes;
          var lastBytePos = dataSigBytes + nPaddingBytes - 1;
          data.clamp();
          data.words[lastBytePos >>> 2] |= nPaddingBytes << 24 - lastBytePos % 4 * 8;
          data.sigBytes += nPaddingBytes;
        }, "pad"),
        unpad: /* @__PURE__ */ __name2(function(data) {
          var nPaddingBytes = data.words[data.sigBytes - 1 >>> 2] & 255;
          data.sigBytes -= nPaddingBytes;
        }, "unpad")
      };
      return CryptoJS3.pad.Ansix923;
    });
  }
});
var require_pad_iso10126 = __commonJS({
  "../node_modules/crypto-js/pad-iso10126.js"(exports, module) {
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS3) {
      CryptoJS3.pad.Iso10126 = {
        pad: /* @__PURE__ */ __name2(function(data, blockSize) {
          var blockSizeBytes = blockSize * 4;
          var nPaddingBytes = blockSizeBytes - data.sigBytes % blockSizeBytes;
          data.concat(CryptoJS3.lib.WordArray.random(nPaddingBytes - 1)).concat(CryptoJS3.lib.WordArray.create([nPaddingBytes << 24], 1));
        }, "pad"),
        unpad: /* @__PURE__ */ __name2(function(data) {
          var nPaddingBytes = data.words[data.sigBytes - 1 >>> 2] & 255;
          data.sigBytes -= nPaddingBytes;
        }, "unpad")
      };
      return CryptoJS3.pad.Iso10126;
    });
  }
});
var require_pad_iso97971 = __commonJS({
  "../node_modules/crypto-js/pad-iso97971.js"(exports, module) {
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS3) {
      CryptoJS3.pad.Iso97971 = {
        pad: /* @__PURE__ */ __name2(function(data, blockSize) {
          data.concat(CryptoJS3.lib.WordArray.create([2147483648], 1));
          CryptoJS3.pad.ZeroPadding.pad(data, blockSize);
        }, "pad"),
        unpad: /* @__PURE__ */ __name2(function(data) {
          CryptoJS3.pad.ZeroPadding.unpad(data);
          data.sigBytes--;
        }, "unpad")
      };
      return CryptoJS3.pad.Iso97971;
    });
  }
});
var require_pad_zeropadding = __commonJS({
  "../node_modules/crypto-js/pad-zeropadding.js"(exports, module) {
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS3) {
      CryptoJS3.pad.ZeroPadding = {
        pad: /* @__PURE__ */ __name2(function(data, blockSize) {
          var blockSizeBytes = blockSize * 4;
          data.clamp();
          data.sigBytes += blockSizeBytes - (data.sigBytes % blockSizeBytes || blockSizeBytes);
        }, "pad"),
        unpad: /* @__PURE__ */ __name2(function(data) {
          var dataWords = data.words;
          var i = data.sigBytes - 1;
          for (var i = data.sigBytes - 1; i >= 0; i--) {
            if (dataWords[i >>> 2] >>> 24 - i % 4 * 8 & 255) {
              data.sigBytes = i + 1;
              break;
            }
          }
        }, "unpad")
      };
      return CryptoJS3.pad.ZeroPadding;
    });
  }
});
var require_pad_nopadding = __commonJS({
  "../node_modules/crypto-js/pad-nopadding.js"(exports, module) {
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS3) {
      CryptoJS3.pad.NoPadding = {
        pad: /* @__PURE__ */ __name2(function() {
        }, "pad"),
        unpad: /* @__PURE__ */ __name2(function() {
        }, "unpad")
      };
      return CryptoJS3.pad.NoPadding;
    });
  }
});
var require_format_hex = __commonJS({
  "../node_modules/crypto-js/format-hex.js"(exports, module) {
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS3) {
      (function(undefined2) {
        var C = CryptoJS3;
        var C_lib = C.lib;
        var CipherParams = C_lib.CipherParams;
        var C_enc = C.enc;
        var Hex = C_enc.Hex;
        var C_format = C.format;
        var HexFormatter = C_format.Hex = {
          /**
           * Converts the ciphertext of a cipher params object to a hexadecimally encoded string.
           *
           * @param {CipherParams} cipherParams The cipher params object.
           *
           * @return {string} The hexadecimally encoded string.
           *
           * @static
           *
           * @example
           *
           *     var hexString = CryptoJS.format.Hex.stringify(cipherParams);
           */
          stringify: /* @__PURE__ */ __name2(function(cipherParams) {
            return cipherParams.ciphertext.toString(Hex);
          }, "stringify"),
          /**
           * Converts a hexadecimally encoded ciphertext string to a cipher params object.
           *
           * @param {string} input The hexadecimally encoded string.
           *
           * @return {CipherParams} The cipher params object.
           *
           * @static
           *
           * @example
           *
           *     var cipherParams = CryptoJS.format.Hex.parse(hexString);
           */
          parse: /* @__PURE__ */ __name2(function(input) {
            var ciphertext = Hex.parse(input);
            return CipherParams.create({ ciphertext });
          }, "parse")
        };
      })();
      return CryptoJS3.format.Hex;
    });
  }
});
var require_aes = __commonJS({
  "../node_modules/crypto-js/aes.js"(exports, module) {
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_enc_base64(), require_md5(), require_evpkdf(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./enc-base64", "./md5", "./evpkdf", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS3) {
      (function() {
        var C = CryptoJS3;
        var C_lib = C.lib;
        var BlockCipher = C_lib.BlockCipher;
        var C_algo = C.algo;
        var SBOX = [];
        var INV_SBOX = [];
        var SUB_MIX_0 = [];
        var SUB_MIX_1 = [];
        var SUB_MIX_2 = [];
        var SUB_MIX_3 = [];
        var INV_SUB_MIX_0 = [];
        var INV_SUB_MIX_1 = [];
        var INV_SUB_MIX_2 = [];
        var INV_SUB_MIX_3 = [];
        (function() {
          var d = [];
          for (var i = 0; i < 256; i++) {
            if (i < 128) {
              d[i] = i << 1;
            } else {
              d[i] = i << 1 ^ 283;
            }
          }
          var x = 0;
          var xi = 0;
          for (var i = 0; i < 256; i++) {
            var sx = xi ^ xi << 1 ^ xi << 2 ^ xi << 3 ^ xi << 4;
            sx = sx >>> 8 ^ sx & 255 ^ 99;
            SBOX[x] = sx;
            INV_SBOX[sx] = x;
            var x2 = d[x];
            var x4 = d[x2];
            var x8 = d[x4];
            var t = d[sx] * 257 ^ sx * 16843008;
            SUB_MIX_0[x] = t << 24 | t >>> 8;
            SUB_MIX_1[x] = t << 16 | t >>> 16;
            SUB_MIX_2[x] = t << 8 | t >>> 24;
            SUB_MIX_3[x] = t;
            var t = x8 * 16843009 ^ x4 * 65537 ^ x2 * 257 ^ x * 16843008;
            INV_SUB_MIX_0[sx] = t << 24 | t >>> 8;
            INV_SUB_MIX_1[sx] = t << 16 | t >>> 16;
            INV_SUB_MIX_2[sx] = t << 8 | t >>> 24;
            INV_SUB_MIX_3[sx] = t;
            if (!x) {
              x = xi = 1;
            } else {
              x = x2 ^ d[d[d[x8 ^ x2]]];
              xi ^= d[d[xi]];
            }
          }
        })();
        var RCON = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54];
        var AES = C_algo.AES = BlockCipher.extend({
          _doReset: /* @__PURE__ */ __name2(function() {
            var t;
            if (this._nRounds && this._keyPriorReset === this._key) {
              return;
            }
            var key = this._keyPriorReset = this._key;
            var keyWords = key.words;
            var keySize = key.sigBytes / 4;
            var nRounds = this._nRounds = keySize + 6;
            var ksRows = (nRounds + 1) * 4;
            var keySchedule = this._keySchedule = [];
            for (var ksRow = 0; ksRow < ksRows; ksRow++) {
              if (ksRow < keySize) {
                keySchedule[ksRow] = keyWords[ksRow];
              } else {
                t = keySchedule[ksRow - 1];
                if (!(ksRow % keySize)) {
                  t = t << 8 | t >>> 24;
                  t = SBOX[t >>> 24] << 24 | SBOX[t >>> 16 & 255] << 16 | SBOX[t >>> 8 & 255] << 8 | SBOX[t & 255];
                  t ^= RCON[ksRow / keySize | 0] << 24;
                } else if (keySize > 6 && ksRow % keySize == 4) {
                  t = SBOX[t >>> 24] << 24 | SBOX[t >>> 16 & 255] << 16 | SBOX[t >>> 8 & 255] << 8 | SBOX[t & 255];
                }
                keySchedule[ksRow] = keySchedule[ksRow - keySize] ^ t;
              }
            }
            var invKeySchedule = this._invKeySchedule = [];
            for (var invKsRow = 0; invKsRow < ksRows; invKsRow++) {
              var ksRow = ksRows - invKsRow;
              if (invKsRow % 4) {
                var t = keySchedule[ksRow];
              } else {
                var t = keySchedule[ksRow - 4];
              }
              if (invKsRow < 4 || ksRow <= 4) {
                invKeySchedule[invKsRow] = t;
              } else {
                invKeySchedule[invKsRow] = INV_SUB_MIX_0[SBOX[t >>> 24]] ^ INV_SUB_MIX_1[SBOX[t >>> 16 & 255]] ^ INV_SUB_MIX_2[SBOX[t >>> 8 & 255]] ^ INV_SUB_MIX_3[SBOX[t & 255]];
              }
            }
          }, "_doReset"),
          encryptBlock: /* @__PURE__ */ __name2(function(M, offset) {
            this._doCryptBlock(M, offset, this._keySchedule, SUB_MIX_0, SUB_MIX_1, SUB_MIX_2, SUB_MIX_3, SBOX);
          }, "encryptBlock"),
          decryptBlock: /* @__PURE__ */ __name2(function(M, offset) {
            var t = M[offset + 1];
            M[offset + 1] = M[offset + 3];
            M[offset + 3] = t;
            this._doCryptBlock(M, offset, this._invKeySchedule, INV_SUB_MIX_0, INV_SUB_MIX_1, INV_SUB_MIX_2, INV_SUB_MIX_3, INV_SBOX);
            var t = M[offset + 1];
            M[offset + 1] = M[offset + 3];
            M[offset + 3] = t;
          }, "decryptBlock"),
          _doCryptBlock: /* @__PURE__ */ __name2(function(M, offset, keySchedule, SUB_MIX_02, SUB_MIX_12, SUB_MIX_22, SUB_MIX_32, SBOX2) {
            var nRounds = this._nRounds;
            var s0 = M[offset] ^ keySchedule[0];
            var s1 = M[offset + 1] ^ keySchedule[1];
            var s2 = M[offset + 2] ^ keySchedule[2];
            var s3 = M[offset + 3] ^ keySchedule[3];
            var ksRow = 4;
            for (var round = 1; round < nRounds; round++) {
              var t0 = SUB_MIX_02[s0 >>> 24] ^ SUB_MIX_12[s1 >>> 16 & 255] ^ SUB_MIX_22[s2 >>> 8 & 255] ^ SUB_MIX_32[s3 & 255] ^ keySchedule[ksRow++];
              var t1 = SUB_MIX_02[s1 >>> 24] ^ SUB_MIX_12[s2 >>> 16 & 255] ^ SUB_MIX_22[s3 >>> 8 & 255] ^ SUB_MIX_32[s0 & 255] ^ keySchedule[ksRow++];
              var t2 = SUB_MIX_02[s2 >>> 24] ^ SUB_MIX_12[s3 >>> 16 & 255] ^ SUB_MIX_22[s0 >>> 8 & 255] ^ SUB_MIX_32[s1 & 255] ^ keySchedule[ksRow++];
              var t3 = SUB_MIX_02[s3 >>> 24] ^ SUB_MIX_12[s0 >>> 16 & 255] ^ SUB_MIX_22[s1 >>> 8 & 255] ^ SUB_MIX_32[s2 & 255] ^ keySchedule[ksRow++];
              s0 = t0;
              s1 = t1;
              s2 = t2;
              s3 = t3;
            }
            var t0 = (SBOX2[s0 >>> 24] << 24 | SBOX2[s1 >>> 16 & 255] << 16 | SBOX2[s2 >>> 8 & 255] << 8 | SBOX2[s3 & 255]) ^ keySchedule[ksRow++];
            var t1 = (SBOX2[s1 >>> 24] << 24 | SBOX2[s2 >>> 16 & 255] << 16 | SBOX2[s3 >>> 8 & 255] << 8 | SBOX2[s0 & 255]) ^ keySchedule[ksRow++];
            var t2 = (SBOX2[s2 >>> 24] << 24 | SBOX2[s3 >>> 16 & 255] << 16 | SBOX2[s0 >>> 8 & 255] << 8 | SBOX2[s1 & 255]) ^ keySchedule[ksRow++];
            var t3 = (SBOX2[s3 >>> 24] << 24 | SBOX2[s0 >>> 16 & 255] << 16 | SBOX2[s1 >>> 8 & 255] << 8 | SBOX2[s2 & 255]) ^ keySchedule[ksRow++];
            M[offset] = t0;
            M[offset + 1] = t1;
            M[offset + 2] = t2;
            M[offset + 3] = t3;
          }, "_doCryptBlock"),
          keySize: 256 / 32
        });
        C.AES = BlockCipher._createHelper(AES);
      })();
      return CryptoJS3.AES;
    });
  }
});
var require_tripledes = __commonJS({
  "../node_modules/crypto-js/tripledes.js"(exports, module) {
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_enc_base64(), require_md5(), require_evpkdf(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./enc-base64", "./md5", "./evpkdf", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS3) {
      (function() {
        var C = CryptoJS3;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var BlockCipher = C_lib.BlockCipher;
        var C_algo = C.algo;
        var PC1 = [
          57,
          49,
          41,
          33,
          25,
          17,
          9,
          1,
          58,
          50,
          42,
          34,
          26,
          18,
          10,
          2,
          59,
          51,
          43,
          35,
          27,
          19,
          11,
          3,
          60,
          52,
          44,
          36,
          63,
          55,
          47,
          39,
          31,
          23,
          15,
          7,
          62,
          54,
          46,
          38,
          30,
          22,
          14,
          6,
          61,
          53,
          45,
          37,
          29,
          21,
          13,
          5,
          28,
          20,
          12,
          4
        ];
        var PC2 = [
          14,
          17,
          11,
          24,
          1,
          5,
          3,
          28,
          15,
          6,
          21,
          10,
          23,
          19,
          12,
          4,
          26,
          8,
          16,
          7,
          27,
          20,
          13,
          2,
          41,
          52,
          31,
          37,
          47,
          55,
          30,
          40,
          51,
          45,
          33,
          48,
          44,
          49,
          39,
          56,
          34,
          53,
          46,
          42,
          50,
          36,
          29,
          32
        ];
        var BIT_SHIFTS = [1, 2, 4, 6, 8, 10, 12, 14, 15, 17, 19, 21, 23, 25, 27, 28];
        var SBOX_P = [
          {
            0: 8421888,
            268435456: 32768,
            536870912: 8421378,
            805306368: 2,
            1073741824: 512,
            1342177280: 8421890,
            1610612736: 8389122,
            1879048192: 8388608,
            2147483648: 514,
            2415919104: 8389120,
            2684354560: 33280,
            2952790016: 8421376,
            3221225472: 32770,
            3489660928: 8388610,
            3758096384: 0,
            4026531840: 33282,
            134217728: 0,
            402653184: 8421890,
            671088640: 33282,
            939524096: 32768,
            1207959552: 8421888,
            1476395008: 512,
            1744830464: 8421378,
            2013265920: 2,
            2281701376: 8389120,
            2550136832: 33280,
            2818572288: 8421376,
            3087007744: 8389122,
            3355443200: 8388610,
            3623878656: 32770,
            3892314112: 514,
            4160749568: 8388608,
            1: 32768,
            268435457: 2,
            536870913: 8421888,
            805306369: 8388608,
            1073741825: 8421378,
            1342177281: 33280,
            1610612737: 512,
            1879048193: 8389122,
            2147483649: 8421890,
            2415919105: 8421376,
            2684354561: 8388610,
            2952790017: 33282,
            3221225473: 514,
            3489660929: 8389120,
            3758096385: 32770,
            4026531841: 0,
            134217729: 8421890,
            402653185: 8421376,
            671088641: 8388608,
            939524097: 512,
            1207959553: 32768,
            1476395009: 8388610,
            1744830465: 2,
            2013265921: 33282,
            2281701377: 32770,
            2550136833: 8389122,
            2818572289: 514,
            3087007745: 8421888,
            3355443201: 8389120,
            3623878657: 0,
            3892314113: 33280,
            4160749569: 8421378
          },
          {
            0: 1074282512,
            16777216: 16384,
            33554432: 524288,
            50331648: 1074266128,
            67108864: 1073741840,
            83886080: 1074282496,
            100663296: 1073758208,
            117440512: 16,
            134217728: 540672,
            150994944: 1073758224,
            167772160: 1073741824,
            184549376: 540688,
            201326592: 524304,
            218103808: 0,
            234881024: 16400,
            251658240: 1074266112,
            8388608: 1073758208,
            25165824: 540688,
            41943040: 16,
            58720256: 1073758224,
            75497472: 1074282512,
            92274688: 1073741824,
            109051904: 524288,
            125829120: 1074266128,
            142606336: 524304,
            159383552: 0,
            176160768: 16384,
            192937984: 1074266112,
            209715200: 1073741840,
            226492416: 540672,
            243269632: 1074282496,
            260046848: 16400,
            268435456: 0,
            285212672: 1074266128,
            301989888: 1073758224,
            318767104: 1074282496,
            335544320: 1074266112,
            352321536: 16,
            369098752: 540688,
            385875968: 16384,
            402653184: 16400,
            419430400: 524288,
            436207616: 524304,
            452984832: 1073741840,
            469762048: 540672,
            486539264: 1073758208,
            503316480: 1073741824,
            520093696: 1074282512,
            276824064: 540688,
            293601280: 524288,
            310378496: 1074266112,
            327155712: 16384,
            343932928: 1073758208,
            360710144: 1074282512,
            377487360: 16,
            394264576: 1073741824,
            411041792: 1074282496,
            427819008: 1073741840,
            444596224: 1073758224,
            461373440: 524304,
            478150656: 0,
            494927872: 16400,
            511705088: 1074266128,
            528482304: 540672
          },
          {
            0: 260,
            1048576: 0,
            2097152: 67109120,
            3145728: 65796,
            4194304: 65540,
            5242880: 67108868,
            6291456: 67174660,
            7340032: 67174400,
            8388608: 67108864,
            9437184: 67174656,
            10485760: 65792,
            11534336: 67174404,
            12582912: 67109124,
            13631488: 65536,
            14680064: 4,
            15728640: 256,
            524288: 67174656,
            1572864: 67174404,
            2621440: 0,
            3670016: 67109120,
            4718592: 67108868,
            5767168: 65536,
            6815744: 65540,
            7864320: 260,
            8912896: 4,
            9961472: 256,
            11010048: 67174400,
            12058624: 65796,
            13107200: 65792,
            14155776: 67109124,
            15204352: 67174660,
            16252928: 67108864,
            16777216: 67174656,
            17825792: 65540,
            18874368: 65536,
            19922944: 67109120,
            20971520: 256,
            22020096: 67174660,
            23068672: 67108868,
            24117248: 0,
            25165824: 67109124,
            26214400: 67108864,
            27262976: 4,
            28311552: 65792,
            29360128: 67174400,
            30408704: 260,
            31457280: 65796,
            32505856: 67174404,
            17301504: 67108864,
            18350080: 260,
            19398656: 67174656,
            20447232: 0,
            21495808: 65540,
            22544384: 67109120,
            23592960: 256,
            24641536: 67174404,
            25690112: 65536,
            26738688: 67174660,
            27787264: 65796,
            28835840: 67108868,
            29884416: 67109124,
            30932992: 67174400,
            31981568: 4,
            33030144: 65792
          },
          {
            0: 2151682048,
            65536: 2147487808,
            131072: 4198464,
            196608: 2151677952,
            262144: 0,
            327680: 4198400,
            393216: 2147483712,
            458752: 4194368,
            524288: 2147483648,
            589824: 4194304,
            655360: 64,
            720896: 2147487744,
            786432: 2151678016,
            851968: 4160,
            917504: 4096,
            983040: 2151682112,
            32768: 2147487808,
            98304: 64,
            163840: 2151678016,
            229376: 2147487744,
            294912: 4198400,
            360448: 2151682112,
            425984: 0,
            491520: 2151677952,
            557056: 4096,
            622592: 2151682048,
            688128: 4194304,
            753664: 4160,
            819200: 2147483648,
            884736: 4194368,
            950272: 4198464,
            1015808: 2147483712,
            1048576: 4194368,
            1114112: 4198400,
            1179648: 2147483712,
            1245184: 0,
            1310720: 4160,
            1376256: 2151678016,
            1441792: 2151682048,
            1507328: 2147487808,
            1572864: 2151682112,
            1638400: 2147483648,
            1703936: 2151677952,
            1769472: 4198464,
            1835008: 2147487744,
            1900544: 4194304,
            1966080: 64,
            2031616: 4096,
            1081344: 2151677952,
            1146880: 2151682112,
            1212416: 0,
            1277952: 4198400,
            1343488: 4194368,
            1409024: 2147483648,
            1474560: 2147487808,
            1540096: 64,
            1605632: 2147483712,
            1671168: 4096,
            1736704: 2147487744,
            1802240: 2151678016,
            1867776: 4160,
            1933312: 2151682048,
            1998848: 4194304,
            2064384: 4198464
          },
          {
            0: 128,
            4096: 17039360,
            8192: 262144,
            12288: 536870912,
            16384: 537133184,
            20480: 16777344,
            24576: 553648256,
            28672: 262272,
            32768: 16777216,
            36864: 537133056,
            40960: 536871040,
            45056: 553910400,
            49152: 553910272,
            53248: 0,
            57344: 17039488,
            61440: 553648128,
            2048: 17039488,
            6144: 553648256,
            10240: 128,
            14336: 17039360,
            18432: 262144,
            22528: 537133184,
            26624: 553910272,
            30720: 536870912,
            34816: 537133056,
            38912: 0,
            43008: 553910400,
            47104: 16777344,
            51200: 536871040,
            55296: 553648128,
            59392: 16777216,
            63488: 262272,
            65536: 262144,
            69632: 128,
            73728: 536870912,
            77824: 553648256,
            81920: 16777344,
            86016: 553910272,
            90112: 537133184,
            94208: 16777216,
            98304: 553910400,
            102400: 553648128,
            106496: 17039360,
            110592: 537133056,
            114688: 262272,
            118784: 536871040,
            122880: 0,
            126976: 17039488,
            67584: 553648256,
            71680: 16777216,
            75776: 17039360,
            79872: 537133184,
            83968: 536870912,
            88064: 17039488,
            92160: 128,
            96256: 553910272,
            100352: 262272,
            104448: 553910400,
            108544: 0,
            112640: 553648128,
            116736: 16777344,
            120832: 262144,
            124928: 537133056,
            129024: 536871040
          },
          {
            0: 268435464,
            256: 8192,
            512: 270532608,
            768: 270540808,
            1024: 268443648,
            1280: 2097152,
            1536: 2097160,
            1792: 268435456,
            2048: 0,
            2304: 268443656,
            2560: 2105344,
            2816: 8,
            3072: 270532616,
            3328: 2105352,
            3584: 8200,
            3840: 270540800,
            128: 270532608,
            384: 270540808,
            640: 8,
            896: 2097152,
            1152: 2105352,
            1408: 268435464,
            1664: 268443648,
            1920: 8200,
            2176: 2097160,
            2432: 8192,
            2688: 268443656,
            2944: 270532616,
            3200: 0,
            3456: 270540800,
            3712: 2105344,
            3968: 268435456,
            4096: 268443648,
            4352: 270532616,
            4608: 270540808,
            4864: 8200,
            5120: 2097152,
            5376: 268435456,
            5632: 268435464,
            5888: 2105344,
            6144: 2105352,
            6400: 0,
            6656: 8,
            6912: 270532608,
            7168: 8192,
            7424: 268443656,
            7680: 270540800,
            7936: 2097160,
            4224: 8,
            4480: 2105344,
            4736: 2097152,
            4992: 268435464,
            5248: 268443648,
            5504: 8200,
            5760: 270540808,
            6016: 270532608,
            6272: 270540800,
            6528: 270532616,
            6784: 8192,
            7040: 2105352,
            7296: 2097160,
            7552: 0,
            7808: 268435456,
            8064: 268443656
          },
          {
            0: 1048576,
            16: 33555457,
            32: 1024,
            48: 1049601,
            64: 34604033,
            80: 0,
            96: 1,
            112: 34603009,
            128: 33555456,
            144: 1048577,
            160: 33554433,
            176: 34604032,
            192: 34603008,
            208: 1025,
            224: 1049600,
            240: 33554432,
            8: 34603009,
            24: 0,
            40: 33555457,
            56: 34604032,
            72: 1048576,
            88: 33554433,
            104: 33554432,
            120: 1025,
            136: 1049601,
            152: 33555456,
            168: 34603008,
            184: 1048577,
            200: 1024,
            216: 34604033,
            232: 1,
            248: 1049600,
            256: 33554432,
            272: 1048576,
            288: 33555457,
            304: 34603009,
            320: 1048577,
            336: 33555456,
            352: 34604032,
            368: 1049601,
            384: 1025,
            400: 34604033,
            416: 1049600,
            432: 1,
            448: 0,
            464: 34603008,
            480: 33554433,
            496: 1024,
            264: 1049600,
            280: 33555457,
            296: 34603009,
            312: 1,
            328: 33554432,
            344: 1048576,
            360: 1025,
            376: 34604032,
            392: 33554433,
            408: 34603008,
            424: 0,
            440: 34604033,
            456: 1049601,
            472: 1024,
            488: 33555456,
            504: 1048577
          },
          {
            0: 134219808,
            1: 131072,
            2: 134217728,
            3: 32,
            4: 131104,
            5: 134350880,
            6: 134350848,
            7: 2048,
            8: 134348800,
            9: 134219776,
            10: 133120,
            11: 134348832,
            12: 2080,
            13: 0,
            14: 134217760,
            15: 133152,
            2147483648: 2048,
            2147483649: 134350880,
            2147483650: 134219808,
            2147483651: 134217728,
            2147483652: 134348800,
            2147483653: 133120,
            2147483654: 133152,
            2147483655: 32,
            2147483656: 134217760,
            2147483657: 2080,
            2147483658: 131104,
            2147483659: 134350848,
            2147483660: 0,
            2147483661: 134348832,
            2147483662: 134219776,
            2147483663: 131072,
            16: 133152,
            17: 134350848,
            18: 32,
            19: 2048,
            20: 134219776,
            21: 134217760,
            22: 134348832,
            23: 131072,
            24: 0,
            25: 131104,
            26: 134348800,
            27: 134219808,
            28: 134350880,
            29: 133120,
            30: 2080,
            31: 134217728,
            2147483664: 131072,
            2147483665: 2048,
            2147483666: 134348832,
            2147483667: 133152,
            2147483668: 32,
            2147483669: 134348800,
            2147483670: 134217728,
            2147483671: 134219808,
            2147483672: 134350880,
            2147483673: 134217760,
            2147483674: 134219776,
            2147483675: 0,
            2147483676: 133120,
            2147483677: 2080,
            2147483678: 131104,
            2147483679: 134350848
          }
        ];
        var SBOX_MASK = [
          4160749569,
          528482304,
          33030144,
          2064384,
          129024,
          8064,
          504,
          2147483679
        ];
        var DES = C_algo.DES = BlockCipher.extend({
          _doReset: /* @__PURE__ */ __name2(function() {
            var key = this._key;
            var keyWords = key.words;
            var keyBits = [];
            for (var i = 0; i < 56; i++) {
              var keyBitPos = PC1[i] - 1;
              keyBits[i] = keyWords[keyBitPos >>> 5] >>> 31 - keyBitPos % 32 & 1;
            }
            var subKeys = this._subKeys = [];
            for (var nSubKey = 0; nSubKey < 16; nSubKey++) {
              var subKey = subKeys[nSubKey] = [];
              var bitShift = BIT_SHIFTS[nSubKey];
              for (var i = 0; i < 24; i++) {
                subKey[i / 6 | 0] |= keyBits[(PC2[i] - 1 + bitShift) % 28] << 31 - i % 6;
                subKey[4 + (i / 6 | 0)] |= keyBits[28 + (PC2[i + 24] - 1 + bitShift) % 28] << 31 - i % 6;
              }
              subKey[0] = subKey[0] << 1 | subKey[0] >>> 31;
              for (var i = 1; i < 7; i++) {
                subKey[i] = subKey[i] >>> (i - 1) * 4 + 3;
              }
              subKey[7] = subKey[7] << 5 | subKey[7] >>> 27;
            }
            var invSubKeys = this._invSubKeys = [];
            for (var i = 0; i < 16; i++) {
              invSubKeys[i] = subKeys[15 - i];
            }
          }, "_doReset"),
          encryptBlock: /* @__PURE__ */ __name2(function(M, offset) {
            this._doCryptBlock(M, offset, this._subKeys);
          }, "encryptBlock"),
          decryptBlock: /* @__PURE__ */ __name2(function(M, offset) {
            this._doCryptBlock(M, offset, this._invSubKeys);
          }, "decryptBlock"),
          _doCryptBlock: /* @__PURE__ */ __name2(function(M, offset, subKeys) {
            this._lBlock = M[offset];
            this._rBlock = M[offset + 1];
            exchangeLR.call(this, 4, 252645135);
            exchangeLR.call(this, 16, 65535);
            exchangeRL.call(this, 2, 858993459);
            exchangeRL.call(this, 8, 16711935);
            exchangeLR.call(this, 1, 1431655765);
            for (var round = 0; round < 16; round++) {
              var subKey = subKeys[round];
              var lBlock = this._lBlock;
              var rBlock = this._rBlock;
              var f = 0;
              for (var i = 0; i < 8; i++) {
                f |= SBOX_P[i][((rBlock ^ subKey[i]) & SBOX_MASK[i]) >>> 0];
              }
              this._lBlock = rBlock;
              this._rBlock = lBlock ^ f;
            }
            var t = this._lBlock;
            this._lBlock = this._rBlock;
            this._rBlock = t;
            exchangeLR.call(this, 1, 1431655765);
            exchangeRL.call(this, 8, 16711935);
            exchangeRL.call(this, 2, 858993459);
            exchangeLR.call(this, 16, 65535);
            exchangeLR.call(this, 4, 252645135);
            M[offset] = this._lBlock;
            M[offset + 1] = this._rBlock;
          }, "_doCryptBlock"),
          keySize: 64 / 32,
          ivSize: 64 / 32,
          blockSize: 64 / 32
        });
        function exchangeLR(offset, mask) {
          var t = (this._lBlock >>> offset ^ this._rBlock) & mask;
          this._rBlock ^= t;
          this._lBlock ^= t << offset;
        }
        __name(exchangeLR, "exchangeLR");
        __name2(exchangeLR, "exchangeLR");
        function exchangeRL(offset, mask) {
          var t = (this._rBlock >>> offset ^ this._lBlock) & mask;
          this._lBlock ^= t;
          this._rBlock ^= t << offset;
        }
        __name(exchangeRL, "exchangeRL");
        __name2(exchangeRL, "exchangeRL");
        C.DES = BlockCipher._createHelper(DES);
        var TripleDES = C_algo.TripleDES = BlockCipher.extend({
          _doReset: /* @__PURE__ */ __name2(function() {
            var key = this._key;
            var keyWords = key.words;
            if (keyWords.length !== 2 && keyWords.length !== 4 && keyWords.length < 6) {
              throw new Error("Invalid key length - 3DES requires the key length to be 64, 128, 192 or >192.");
            }
            var key1 = keyWords.slice(0, 2);
            var key2 = keyWords.length < 4 ? keyWords.slice(0, 2) : keyWords.slice(2, 4);
            var key3 = keyWords.length < 6 ? keyWords.slice(0, 2) : keyWords.slice(4, 6);
            this._des1 = DES.createEncryptor(WordArray.create(key1));
            this._des2 = DES.createEncryptor(WordArray.create(key2));
            this._des3 = DES.createEncryptor(WordArray.create(key3));
          }, "_doReset"),
          encryptBlock: /* @__PURE__ */ __name2(function(M, offset) {
            this._des1.encryptBlock(M, offset);
            this._des2.decryptBlock(M, offset);
            this._des3.encryptBlock(M, offset);
          }, "encryptBlock"),
          decryptBlock: /* @__PURE__ */ __name2(function(M, offset) {
            this._des3.decryptBlock(M, offset);
            this._des2.encryptBlock(M, offset);
            this._des1.decryptBlock(M, offset);
          }, "decryptBlock"),
          keySize: 192 / 32,
          ivSize: 64 / 32,
          blockSize: 64 / 32
        });
        C.TripleDES = BlockCipher._createHelper(TripleDES);
      })();
      return CryptoJS3.TripleDES;
    });
  }
});
var require_rc4 = __commonJS({
  "../node_modules/crypto-js/rc4.js"(exports, module) {
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_enc_base64(), require_md5(), require_evpkdf(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./enc-base64", "./md5", "./evpkdf", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS3) {
      (function() {
        var C = CryptoJS3;
        var C_lib = C.lib;
        var StreamCipher = C_lib.StreamCipher;
        var C_algo = C.algo;
        var RC4 = C_algo.RC4 = StreamCipher.extend({
          _doReset: /* @__PURE__ */ __name2(function() {
            var key = this._key;
            var keyWords = key.words;
            var keySigBytes = key.sigBytes;
            var S = this._S = [];
            for (var i = 0; i < 256; i++) {
              S[i] = i;
            }
            for (var i = 0, j = 0; i < 256; i++) {
              var keyByteIndex = i % keySigBytes;
              var keyByte = keyWords[keyByteIndex >>> 2] >>> 24 - keyByteIndex % 4 * 8 & 255;
              j = (j + S[i] + keyByte) % 256;
              var t = S[i];
              S[i] = S[j];
              S[j] = t;
            }
            this._i = this._j = 0;
          }, "_doReset"),
          _doProcessBlock: /* @__PURE__ */ __name2(function(M, offset) {
            M[offset] ^= generateKeystreamWord.call(this);
          }, "_doProcessBlock"),
          keySize: 256 / 32,
          ivSize: 0
        });
        function generateKeystreamWord() {
          var S = this._S;
          var i = this._i;
          var j = this._j;
          var keystreamWord = 0;
          for (var n = 0; n < 4; n++) {
            i = (i + 1) % 256;
            j = (j + S[i]) % 256;
            var t = S[i];
            S[i] = S[j];
            S[j] = t;
            keystreamWord |= S[(S[i] + S[j]) % 256] << 24 - n * 8;
          }
          this._i = i;
          this._j = j;
          return keystreamWord;
        }
        __name(generateKeystreamWord, "generateKeystreamWord");
        __name2(generateKeystreamWord, "generateKeystreamWord");
        C.RC4 = StreamCipher._createHelper(RC4);
        var RC4Drop = C_algo.RC4Drop = RC4.extend({
          /**
           * Configuration options.
           *
           * @property {number} drop The number of keystream words to drop. Default 192
           */
          cfg: RC4.cfg.extend({
            drop: 192
          }),
          _doReset: /* @__PURE__ */ __name2(function() {
            RC4._doReset.call(this);
            for (var i = this.cfg.drop; i > 0; i--) {
              generateKeystreamWord.call(this);
            }
          }, "_doReset")
        });
        C.RC4Drop = StreamCipher._createHelper(RC4Drop);
      })();
      return CryptoJS3.RC4;
    });
  }
});
var require_rabbit = __commonJS({
  "../node_modules/crypto-js/rabbit.js"(exports, module) {
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_enc_base64(), require_md5(), require_evpkdf(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./enc-base64", "./md5", "./evpkdf", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS3) {
      (function() {
        var C = CryptoJS3;
        var C_lib = C.lib;
        var StreamCipher = C_lib.StreamCipher;
        var C_algo = C.algo;
        var S = [];
        var C_ = [];
        var G = [];
        var Rabbit = C_algo.Rabbit = StreamCipher.extend({
          _doReset: /* @__PURE__ */ __name2(function() {
            var K = this._key.words;
            var iv = this.cfg.iv;
            for (var i = 0; i < 4; i++) {
              K[i] = (K[i] << 8 | K[i] >>> 24) & 16711935 | (K[i] << 24 | K[i] >>> 8) & 4278255360;
            }
            var X = this._X = [
              K[0],
              K[3] << 16 | K[2] >>> 16,
              K[1],
              K[0] << 16 | K[3] >>> 16,
              K[2],
              K[1] << 16 | K[0] >>> 16,
              K[3],
              K[2] << 16 | K[1] >>> 16
            ];
            var C2 = this._C = [
              K[2] << 16 | K[2] >>> 16,
              K[0] & 4294901760 | K[1] & 65535,
              K[3] << 16 | K[3] >>> 16,
              K[1] & 4294901760 | K[2] & 65535,
              K[0] << 16 | K[0] >>> 16,
              K[2] & 4294901760 | K[3] & 65535,
              K[1] << 16 | K[1] >>> 16,
              K[3] & 4294901760 | K[0] & 65535
            ];
            this._b = 0;
            for (var i = 0; i < 4; i++) {
              nextState.call(this);
            }
            for (var i = 0; i < 8; i++) {
              C2[i] ^= X[i + 4 & 7];
            }
            if (iv) {
              var IV = iv.words;
              var IV_0 = IV[0];
              var IV_1 = IV[1];
              var i0 = (IV_0 << 8 | IV_0 >>> 24) & 16711935 | (IV_0 << 24 | IV_0 >>> 8) & 4278255360;
              var i2 = (IV_1 << 8 | IV_1 >>> 24) & 16711935 | (IV_1 << 24 | IV_1 >>> 8) & 4278255360;
              var i1 = i0 >>> 16 | i2 & 4294901760;
              var i3 = i2 << 16 | i0 & 65535;
              C2[0] ^= i0;
              C2[1] ^= i1;
              C2[2] ^= i2;
              C2[3] ^= i3;
              C2[4] ^= i0;
              C2[5] ^= i1;
              C2[6] ^= i2;
              C2[7] ^= i3;
              for (var i = 0; i < 4; i++) {
                nextState.call(this);
              }
            }
          }, "_doReset"),
          _doProcessBlock: /* @__PURE__ */ __name2(function(M, offset) {
            var X = this._X;
            nextState.call(this);
            S[0] = X[0] ^ X[5] >>> 16 ^ X[3] << 16;
            S[1] = X[2] ^ X[7] >>> 16 ^ X[5] << 16;
            S[2] = X[4] ^ X[1] >>> 16 ^ X[7] << 16;
            S[3] = X[6] ^ X[3] >>> 16 ^ X[1] << 16;
            for (var i = 0; i < 4; i++) {
              S[i] = (S[i] << 8 | S[i] >>> 24) & 16711935 | (S[i] << 24 | S[i] >>> 8) & 4278255360;
              M[offset + i] ^= S[i];
            }
          }, "_doProcessBlock"),
          blockSize: 128 / 32,
          ivSize: 64 / 32
        });
        function nextState() {
          var X = this._X;
          var C2 = this._C;
          for (var i = 0; i < 8; i++) {
            C_[i] = C2[i];
          }
          C2[0] = C2[0] + 1295307597 + this._b | 0;
          C2[1] = C2[1] + 3545052371 + (C2[0] >>> 0 < C_[0] >>> 0 ? 1 : 0) | 0;
          C2[2] = C2[2] + 886263092 + (C2[1] >>> 0 < C_[1] >>> 0 ? 1 : 0) | 0;
          C2[3] = C2[3] + 1295307597 + (C2[2] >>> 0 < C_[2] >>> 0 ? 1 : 0) | 0;
          C2[4] = C2[4] + 3545052371 + (C2[3] >>> 0 < C_[3] >>> 0 ? 1 : 0) | 0;
          C2[5] = C2[5] + 886263092 + (C2[4] >>> 0 < C_[4] >>> 0 ? 1 : 0) | 0;
          C2[6] = C2[6] + 1295307597 + (C2[5] >>> 0 < C_[5] >>> 0 ? 1 : 0) | 0;
          C2[7] = C2[7] + 3545052371 + (C2[6] >>> 0 < C_[6] >>> 0 ? 1 : 0) | 0;
          this._b = C2[7] >>> 0 < C_[7] >>> 0 ? 1 : 0;
          for (var i = 0; i < 8; i++) {
            var gx = X[i] + C2[i];
            var ga = gx & 65535;
            var gb = gx >>> 16;
            var gh = ((ga * ga >>> 17) + ga * gb >>> 15) + gb * gb;
            var gl = ((gx & 4294901760) * gx | 0) + ((gx & 65535) * gx | 0);
            G[i] = gh ^ gl;
          }
          X[0] = G[0] + (G[7] << 16 | G[7] >>> 16) + (G[6] << 16 | G[6] >>> 16) | 0;
          X[1] = G[1] + (G[0] << 8 | G[0] >>> 24) + G[7] | 0;
          X[2] = G[2] + (G[1] << 16 | G[1] >>> 16) + (G[0] << 16 | G[0] >>> 16) | 0;
          X[3] = G[3] + (G[2] << 8 | G[2] >>> 24) + G[1] | 0;
          X[4] = G[4] + (G[3] << 16 | G[3] >>> 16) + (G[2] << 16 | G[2] >>> 16) | 0;
          X[5] = G[5] + (G[4] << 8 | G[4] >>> 24) + G[3] | 0;
          X[6] = G[6] + (G[5] << 16 | G[5] >>> 16) + (G[4] << 16 | G[4] >>> 16) | 0;
          X[7] = G[7] + (G[6] << 8 | G[6] >>> 24) + G[5] | 0;
        }
        __name(nextState, "nextState");
        __name2(nextState, "nextState");
        C.Rabbit = StreamCipher._createHelper(Rabbit);
      })();
      return CryptoJS3.Rabbit;
    });
  }
});
var require_rabbit_legacy = __commonJS({
  "../node_modules/crypto-js/rabbit-legacy.js"(exports, module) {
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_enc_base64(), require_md5(), require_evpkdf(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./enc-base64", "./md5", "./evpkdf", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS3) {
      (function() {
        var C = CryptoJS3;
        var C_lib = C.lib;
        var StreamCipher = C_lib.StreamCipher;
        var C_algo = C.algo;
        var S = [];
        var C_ = [];
        var G = [];
        var RabbitLegacy = C_algo.RabbitLegacy = StreamCipher.extend({
          _doReset: /* @__PURE__ */ __name2(function() {
            var K = this._key.words;
            var iv = this.cfg.iv;
            var X = this._X = [
              K[0],
              K[3] << 16 | K[2] >>> 16,
              K[1],
              K[0] << 16 | K[3] >>> 16,
              K[2],
              K[1] << 16 | K[0] >>> 16,
              K[3],
              K[2] << 16 | K[1] >>> 16
            ];
            var C2 = this._C = [
              K[2] << 16 | K[2] >>> 16,
              K[0] & 4294901760 | K[1] & 65535,
              K[3] << 16 | K[3] >>> 16,
              K[1] & 4294901760 | K[2] & 65535,
              K[0] << 16 | K[0] >>> 16,
              K[2] & 4294901760 | K[3] & 65535,
              K[1] << 16 | K[1] >>> 16,
              K[3] & 4294901760 | K[0] & 65535
            ];
            this._b = 0;
            for (var i = 0; i < 4; i++) {
              nextState.call(this);
            }
            for (var i = 0; i < 8; i++) {
              C2[i] ^= X[i + 4 & 7];
            }
            if (iv) {
              var IV = iv.words;
              var IV_0 = IV[0];
              var IV_1 = IV[1];
              var i0 = (IV_0 << 8 | IV_0 >>> 24) & 16711935 | (IV_0 << 24 | IV_0 >>> 8) & 4278255360;
              var i2 = (IV_1 << 8 | IV_1 >>> 24) & 16711935 | (IV_1 << 24 | IV_1 >>> 8) & 4278255360;
              var i1 = i0 >>> 16 | i2 & 4294901760;
              var i3 = i2 << 16 | i0 & 65535;
              C2[0] ^= i0;
              C2[1] ^= i1;
              C2[2] ^= i2;
              C2[3] ^= i3;
              C2[4] ^= i0;
              C2[5] ^= i1;
              C2[6] ^= i2;
              C2[7] ^= i3;
              for (var i = 0; i < 4; i++) {
                nextState.call(this);
              }
            }
          }, "_doReset"),
          _doProcessBlock: /* @__PURE__ */ __name2(function(M, offset) {
            var X = this._X;
            nextState.call(this);
            S[0] = X[0] ^ X[5] >>> 16 ^ X[3] << 16;
            S[1] = X[2] ^ X[7] >>> 16 ^ X[5] << 16;
            S[2] = X[4] ^ X[1] >>> 16 ^ X[7] << 16;
            S[3] = X[6] ^ X[3] >>> 16 ^ X[1] << 16;
            for (var i = 0; i < 4; i++) {
              S[i] = (S[i] << 8 | S[i] >>> 24) & 16711935 | (S[i] << 24 | S[i] >>> 8) & 4278255360;
              M[offset + i] ^= S[i];
            }
          }, "_doProcessBlock"),
          blockSize: 128 / 32,
          ivSize: 64 / 32
        });
        function nextState() {
          var X = this._X;
          var C2 = this._C;
          for (var i = 0; i < 8; i++) {
            C_[i] = C2[i];
          }
          C2[0] = C2[0] + 1295307597 + this._b | 0;
          C2[1] = C2[1] + 3545052371 + (C2[0] >>> 0 < C_[0] >>> 0 ? 1 : 0) | 0;
          C2[2] = C2[2] + 886263092 + (C2[1] >>> 0 < C_[1] >>> 0 ? 1 : 0) | 0;
          C2[3] = C2[3] + 1295307597 + (C2[2] >>> 0 < C_[2] >>> 0 ? 1 : 0) | 0;
          C2[4] = C2[4] + 3545052371 + (C2[3] >>> 0 < C_[3] >>> 0 ? 1 : 0) | 0;
          C2[5] = C2[5] + 886263092 + (C2[4] >>> 0 < C_[4] >>> 0 ? 1 : 0) | 0;
          C2[6] = C2[6] + 1295307597 + (C2[5] >>> 0 < C_[5] >>> 0 ? 1 : 0) | 0;
          C2[7] = C2[7] + 3545052371 + (C2[6] >>> 0 < C_[6] >>> 0 ? 1 : 0) | 0;
          this._b = C2[7] >>> 0 < C_[7] >>> 0 ? 1 : 0;
          for (var i = 0; i < 8; i++) {
            var gx = X[i] + C2[i];
            var ga = gx & 65535;
            var gb = gx >>> 16;
            var gh = ((ga * ga >>> 17) + ga * gb >>> 15) + gb * gb;
            var gl = ((gx & 4294901760) * gx | 0) + ((gx & 65535) * gx | 0);
            G[i] = gh ^ gl;
          }
          X[0] = G[0] + (G[7] << 16 | G[7] >>> 16) + (G[6] << 16 | G[6] >>> 16) | 0;
          X[1] = G[1] + (G[0] << 8 | G[0] >>> 24) + G[7] | 0;
          X[2] = G[2] + (G[1] << 16 | G[1] >>> 16) + (G[0] << 16 | G[0] >>> 16) | 0;
          X[3] = G[3] + (G[2] << 8 | G[2] >>> 24) + G[1] | 0;
          X[4] = G[4] + (G[3] << 16 | G[3] >>> 16) + (G[2] << 16 | G[2] >>> 16) | 0;
          X[5] = G[5] + (G[4] << 8 | G[4] >>> 24) + G[3] | 0;
          X[6] = G[6] + (G[5] << 16 | G[5] >>> 16) + (G[4] << 16 | G[4] >>> 16) | 0;
          X[7] = G[7] + (G[6] << 8 | G[6] >>> 24) + G[5] | 0;
        }
        __name(nextState, "nextState");
        __name2(nextState, "nextState");
        C.RabbitLegacy = StreamCipher._createHelper(RabbitLegacy);
      })();
      return CryptoJS3.RabbitLegacy;
    });
  }
});
var require_blowfish = __commonJS({
  "../node_modules/crypto-js/blowfish.js"(exports, module) {
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_enc_base64(), require_md5(), require_evpkdf(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./enc-base64", "./md5", "./evpkdf", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS3) {
      (function() {
        var C = CryptoJS3;
        var C_lib = C.lib;
        var BlockCipher = C_lib.BlockCipher;
        var C_algo = C.algo;
        const N = 16;
        const ORIG_P = [
          608135816,
          2242054355,
          320440878,
          57701188,
          2752067618,
          698298832,
          137296536,
          3964562569,
          1160258022,
          953160567,
          3193202383,
          887688300,
          3232508343,
          3380367581,
          1065670069,
          3041331479,
          2450970073,
          2306472731
        ];
        const ORIG_S = [
          [
            3509652390,
            2564797868,
            805139163,
            3491422135,
            3101798381,
            1780907670,
            3128725573,
            4046225305,
            614570311,
            3012652279,
            134345442,
            2240740374,
            1667834072,
            1901547113,
            2757295779,
            4103290238,
            227898511,
            1921955416,
            1904987480,
            2182433518,
            2069144605,
            3260701109,
            2620446009,
            720527379,
            3318853667,
            677414384,
            3393288472,
            3101374703,
            2390351024,
            1614419982,
            1822297739,
            2954791486,
            3608508353,
            3174124327,
            2024746970,
            1432378464,
            3864339955,
            2857741204,
            1464375394,
            1676153920,
            1439316330,
            715854006,
            3033291828,
            289532110,
            2706671279,
            2087905683,
            3018724369,
            1668267050,
            732546397,
            1947742710,
            3462151702,
            2609353502,
            2950085171,
            1814351708,
            2050118529,
            680887927,
            999245976,
            1800124847,
            3300911131,
            1713906067,
            1641548236,
            4213287313,
            1216130144,
            1575780402,
            4018429277,
            3917837745,
            3693486850,
            3949271944,
            596196993,
            3549867205,
            258830323,
            2213823033,
            772490370,
            2760122372,
            1774776394,
            2652871518,
            566650946,
            4142492826,
            1728879713,
            2882767088,
            1783734482,
            3629395816,
            2517608232,
            2874225571,
            1861159788,
            326777828,
            3124490320,
            2130389656,
            2716951837,
            967770486,
            1724537150,
            2185432712,
            2364442137,
            1164943284,
            2105845187,
            998989502,
            3765401048,
            2244026483,
            1075463327,
            1455516326,
            1322494562,
            910128902,
            469688178,
            1117454909,
            936433444,
            3490320968,
            3675253459,
            1240580251,
            122909385,
            2157517691,
            634681816,
            4142456567,
            3825094682,
            3061402683,
            2540495037,
            79693498,
            3249098678,
            1084186820,
            1583128258,
            426386531,
            1761308591,
            1047286709,
            322548459,
            995290223,
            1845252383,
            2603652396,
            3431023940,
            2942221577,
            3202600964,
            3727903485,
            1712269319,
            422464435,
            3234572375,
            1170764815,
            3523960633,
            3117677531,
            1434042557,
            442511882,
            3600875718,
            1076654713,
            1738483198,
            4213154764,
            2393238008,
            3677496056,
            1014306527,
            4251020053,
            793779912,
            2902807211,
            842905082,
            4246964064,
            1395751752,
            1040244610,
            2656851899,
            3396308128,
            445077038,
            3742853595,
            3577915638,
            679411651,
            2892444358,
            2354009459,
            1767581616,
            3150600392,
            3791627101,
            3102740896,
            284835224,
            4246832056,
            1258075500,
            768725851,
            2589189241,
            3069724005,
            3532540348,
            1274779536,
            3789419226,
            2764799539,
            1660621633,
            3471099624,
            4011903706,
            913787905,
            3497959166,
            737222580,
            2514213453,
            2928710040,
            3937242737,
            1804850592,
            3499020752,
            2949064160,
            2386320175,
            2390070455,
            2415321851,
            4061277028,
            2290661394,
            2416832540,
            1336762016,
            1754252060,
            3520065937,
            3014181293,
            791618072,
            3188594551,
            3933548030,
            2332172193,
            3852520463,
            3043980520,
            413987798,
            3465142937,
            3030929376,
            4245938359,
            2093235073,
            3534596313,
            375366246,
            2157278981,
            2479649556,
            555357303,
            3870105701,
            2008414854,
            3344188149,
            4221384143,
            3956125452,
            2067696032,
            3594591187,
            2921233993,
            2428461,
            544322398,
            577241275,
            1471733935,
            610547355,
            4027169054,
            1432588573,
            1507829418,
            2025931657,
            3646575487,
            545086370,
            48609733,
            2200306550,
            1653985193,
            298326376,
            1316178497,
            3007786442,
            2064951626,
            458293330,
            2589141269,
            3591329599,
            3164325604,
            727753846,
            2179363840,
            146436021,
            1461446943,
            4069977195,
            705550613,
            3059967265,
            3887724982,
            4281599278,
            3313849956,
            1404054877,
            2845806497,
            146425753,
            1854211946
          ],
          [
            1266315497,
            3048417604,
            3681880366,
            3289982499,
            290971e4,
            1235738493,
            2632868024,
            2414719590,
            3970600049,
            1771706367,
            1449415276,
            3266420449,
            422970021,
            1963543593,
            2690192192,
            3826793022,
            1062508698,
            1531092325,
            1804592342,
            2583117782,
            2714934279,
            4024971509,
            1294809318,
            4028980673,
            1289560198,
            2221992742,
            1669523910,
            35572830,
            157838143,
            1052438473,
            1016535060,
            1802137761,
            1753167236,
            1386275462,
            3080475397,
            2857371447,
            1040679964,
            2145300060,
            2390574316,
            1461121720,
            2956646967,
            4031777805,
            4028374788,
            33600511,
            2920084762,
            1018524850,
            629373528,
            3691585981,
            3515945977,
            2091462646,
            2486323059,
            586499841,
            988145025,
            935516892,
            3367335476,
            2599673255,
            2839830854,
            265290510,
            3972581182,
            2759138881,
            3795373465,
            1005194799,
            847297441,
            406762289,
            1314163512,
            1332590856,
            1866599683,
            4127851711,
            750260880,
            613907577,
            1450815602,
            3165620655,
            3734664991,
            3650291728,
            3012275730,
            3704569646,
            1427272223,
            778793252,
            1343938022,
            2676280711,
            2052605720,
            1946737175,
            3164576444,
            3914038668,
            3967478842,
            3682934266,
            1661551462,
            3294938066,
            4011595847,
            840292616,
            3712170807,
            616741398,
            312560963,
            711312465,
            1351876610,
            322626781,
            1910503582,
            271666773,
            2175563734,
            1594956187,
            70604529,
            3617834859,
            1007753275,
            1495573769,
            4069517037,
            2549218298,
            2663038764,
            504708206,
            2263041392,
            3941167025,
            2249088522,
            1514023603,
            1998579484,
            1312622330,
            694541497,
            2582060303,
            2151582166,
            1382467621,
            776784248,
            2618340202,
            3323268794,
            2497899128,
            2784771155,
            503983604,
            4076293799,
            907881277,
            423175695,
            432175456,
            1378068232,
            4145222326,
            3954048622,
            3938656102,
            3820766613,
            2793130115,
            2977904593,
            26017576,
            3274890735,
            3194772133,
            1700274565,
            1756076034,
            4006520079,
            3677328699,
            720338349,
            1533947780,
            354530856,
            688349552,
            3973924725,
            1637815568,
            332179504,
            3949051286,
            53804574,
            2852348879,
            3044236432,
            1282449977,
            3583942155,
            3416972820,
            4006381244,
            1617046695,
            2628476075,
            3002303598,
            1686838959,
            431878346,
            2686675385,
            1700445008,
            1080580658,
            1009431731,
            832498133,
            3223435511,
            2605976345,
            2271191193,
            2516031870,
            1648197032,
            4164389018,
            2548247927,
            300782431,
            375919233,
            238389289,
            3353747414,
            2531188641,
            2019080857,
            1475708069,
            455242339,
            2609103871,
            448939670,
            3451063019,
            1395535956,
            2413381860,
            1841049896,
            1491858159,
            885456874,
            4264095073,
            4001119347,
            1565136089,
            3898914787,
            1108368660,
            540939232,
            1173283510,
            2745871338,
            3681308437,
            4207628240,
            3343053890,
            4016749493,
            1699691293,
            1103962373,
            3625875870,
            2256883143,
            3830138730,
            1031889488,
            3479347698,
            1535977030,
            4236805024,
            3251091107,
            2132092099,
            1774941330,
            1199868427,
            1452454533,
            157007616,
            2904115357,
            342012276,
            595725824,
            1480756522,
            206960106,
            497939518,
            591360097,
            863170706,
            2375253569,
            3596610801,
            1814182875,
            2094937945,
            3421402208,
            1082520231,
            3463918190,
            2785509508,
            435703966,
            3908032597,
            1641649973,
            2842273706,
            3305899714,
            1510255612,
            2148256476,
            2655287854,
            3276092548,
            4258621189,
            236887753,
            3681803219,
            274041037,
            1734335097,
            3815195456,
            3317970021,
            1899903192,
            1026095262,
            4050517792,
            356393447,
            2410691914,
            3873677099,
            3682840055
          ],
          [
            3913112168,
            2491498743,
            4132185628,
            2489919796,
            1091903735,
            1979897079,
            3170134830,
            3567386728,
            3557303409,
            857797738,
            1136121015,
            1342202287,
            507115054,
            2535736646,
            337727348,
            3213592640,
            1301675037,
            2528481711,
            1895095763,
            1721773893,
            3216771564,
            62756741,
            2142006736,
            835421444,
            2531993523,
            1442658625,
            3659876326,
            2882144922,
            676362277,
            1392781812,
            170690266,
            3921047035,
            1759253602,
            3611846912,
            1745797284,
            664899054,
            1329594018,
            3901205900,
            3045908486,
            2062866102,
            2865634940,
            3543621612,
            3464012697,
            1080764994,
            553557557,
            3656615353,
            3996768171,
            991055499,
            499776247,
            1265440854,
            648242737,
            3940784050,
            980351604,
            3713745714,
            1749149687,
            3396870395,
            4211799374,
            3640570775,
            1161844396,
            3125318951,
            1431517754,
            545492359,
            4268468663,
            3499529547,
            1437099964,
            2702547544,
            3433638243,
            2581715763,
            2787789398,
            1060185593,
            1593081372,
            2418618748,
            4260947970,
            69676912,
            2159744348,
            86519011,
            2512459080,
            3838209314,
            1220612927,
            3339683548,
            133810670,
            1090789135,
            1078426020,
            1569222167,
            845107691,
            3583754449,
            4072456591,
            1091646820,
            628848692,
            1613405280,
            3757631651,
            526609435,
            236106946,
            48312990,
            2942717905,
            3402727701,
            1797494240,
            859738849,
            992217954,
            4005476642,
            2243076622,
            3870952857,
            3732016268,
            765654824,
            3490871365,
            2511836413,
            1685915746,
            3888969200,
            1414112111,
            2273134842,
            3281911079,
            4080962846,
            172450625,
            2569994100,
            980381355,
            4109958455,
            2819808352,
            2716589560,
            2568741196,
            3681446669,
            3329971472,
            1835478071,
            660984891,
            3704678404,
            4045999559,
            3422617507,
            3040415634,
            1762651403,
            1719377915,
            3470491036,
            2693910283,
            3642056355,
            3138596744,
            1364962596,
            2073328063,
            1983633131,
            926494387,
            3423689081,
            2150032023,
            4096667949,
            1749200295,
            3328846651,
            309677260,
            2016342300,
            1779581495,
            3079819751,
            111262694,
            1274766160,
            443224088,
            298511866,
            1025883608,
            3806446537,
            1145181785,
            168956806,
            3641502830,
            3584813610,
            1689216846,
            3666258015,
            3200248200,
            1692713982,
            2646376535,
            4042768518,
            1618508792,
            1610833997,
            3523052358,
            4130873264,
            2001055236,
            3610705100,
            2202168115,
            4028541809,
            2961195399,
            1006657119,
            2006996926,
            3186142756,
            1430667929,
            3210227297,
            1314452623,
            4074634658,
            4101304120,
            2273951170,
            1399257539,
            3367210612,
            3027628629,
            1190975929,
            2062231137,
            2333990788,
            2221543033,
            2438960610,
            1181637006,
            548689776,
            2362791313,
            3372408396,
            3104550113,
            3145860560,
            296247880,
            1970579870,
            3078560182,
            3769228297,
            1714227617,
            3291629107,
            3898220290,
            166772364,
            1251581989,
            493813264,
            448347421,
            195405023,
            2709975567,
            677966185,
            3703036547,
            1463355134,
            2715995803,
            1338867538,
            1343315457,
            2802222074,
            2684532164,
            233230375,
            2599980071,
            2000651841,
            3277868038,
            1638401717,
            4028070440,
            3237316320,
            6314154,
            819756386,
            300326615,
            590932579,
            1405279636,
            3267499572,
            3150704214,
            2428286686,
            3959192993,
            3461946742,
            1862657033,
            1266418056,
            963775037,
            2089974820,
            2263052895,
            1917689273,
            448879540,
            3550394620,
            3981727096,
            150775221,
            3627908307,
            1303187396,
            508620638,
            2975983352,
            2726630617,
            1817252668,
            1876281319,
            1457606340,
            908771278,
            3720792119,
            3617206836,
            2455994898,
            1729034894,
            1080033504
          ],
          [
            976866871,
            3556439503,
            2881648439,
            1522871579,
            1555064734,
            1336096578,
            3548522304,
            2579274686,
            3574697629,
            3205460757,
            3593280638,
            3338716283,
            3079412587,
            564236357,
            2993598910,
            1781952180,
            1464380207,
            3163844217,
            3332601554,
            1699332808,
            1393555694,
            1183702653,
            3581086237,
            1288719814,
            691649499,
            2847557200,
            2895455976,
            3193889540,
            2717570544,
            1781354906,
            1676643554,
            2592534050,
            3230253752,
            1126444790,
            2770207658,
            2633158820,
            2210423226,
            2615765581,
            2414155088,
            3127139286,
            673620729,
            2805611233,
            1269405062,
            4015350505,
            3341807571,
            4149409754,
            1057255273,
            2012875353,
            2162469141,
            2276492801,
            2601117357,
            993977747,
            3918593370,
            2654263191,
            753973209,
            36408145,
            2530585658,
            25011837,
            3520020182,
            2088578344,
            530523599,
            2918365339,
            1524020338,
            1518925132,
            3760827505,
            3759777254,
            1202760957,
            3985898139,
            3906192525,
            674977740,
            4174734889,
            2031300136,
            2019492241,
            3983892565,
            4153806404,
            3822280332,
            352677332,
            2297720250,
            60907813,
            90501309,
            3286998549,
            1016092578,
            2535922412,
            2839152426,
            457141659,
            509813237,
            4120667899,
            652014361,
            1966332200,
            2975202805,
            55981186,
            2327461051,
            676427537,
            3255491064,
            2882294119,
            3433927263,
            1307055953,
            942726286,
            933058658,
            2468411793,
            3933900994,
            4215176142,
            1361170020,
            2001714738,
            2830558078,
            3274259782,
            1222529897,
            1679025792,
            2729314320,
            3714953764,
            1770335741,
            151462246,
            3013232138,
            1682292957,
            1483529935,
            471910574,
            1539241949,
            458788160,
            3436315007,
            1807016891,
            3718408830,
            978976581,
            1043663428,
            3165965781,
            1927990952,
            4200891579,
            2372276910,
            3208408903,
            3533431907,
            1412390302,
            2931980059,
            4132332400,
            1947078029,
            3881505623,
            4168226417,
            2941484381,
            1077988104,
            1320477388,
            886195818,
            18198404,
            3786409e3,
            2509781533,
            112762804,
            3463356488,
            1866414978,
            891333506,
            18488651,
            661792760,
            1628790961,
            3885187036,
            3141171499,
            876946877,
            2693282273,
            1372485963,
            791857591,
            2686433993,
            3759982718,
            3167212022,
            3472953795,
            2716379847,
            445679433,
            3561995674,
            3504004811,
            3574258232,
            54117162,
            3331405415,
            2381918588,
            3769707343,
            4154350007,
            1140177722,
            4074052095,
            668550556,
            3214352940,
            367459370,
            261225585,
            2610173221,
            4209349473,
            3468074219,
            3265815641,
            314222801,
            3066103646,
            3808782860,
            282218597,
            3406013506,
            3773591054,
            379116347,
            1285071038,
            846784868,
            2669647154,
            3771962079,
            3550491691,
            2305946142,
            453669953,
            1268987020,
            3317592352,
            3279303384,
            3744833421,
            2610507566,
            3859509063,
            266596637,
            3847019092,
            517658769,
            3462560207,
            3443424879,
            370717030,
            4247526661,
            2224018117,
            4143653529,
            4112773975,
            2788324899,
            2477274417,
            1456262402,
            2901442914,
            1517677493,
            1846949527,
            2295493580,
            3734397586,
            2176403920,
            1280348187,
            1908823572,
            3871786941,
            846861322,
            1172426758,
            3287448474,
            3383383037,
            1655181056,
            3139813346,
            901632758,
            1897031941,
            2986607138,
            3066810236,
            3447102507,
            1393639104,
            373351379,
            950779232,
            625454576,
            3124240540,
            4148612726,
            2007998917,
            544563296,
            2244738638,
            2330496472,
            2058025392,
            1291430526,
            424198748,
            50039436,
            29584100,
            3605783033,
            2429876329,
            2791104160,
            1057563949,
            3255363231,
            3075367218,
            3463963227,
            1469046755,
            985887462
          ]
        ];
        var BLOWFISH_CTX = {
          pbox: [],
          sbox: []
        };
        function F(ctx, x) {
          let a = x >> 24 & 255;
          let b = x >> 16 & 255;
          let c = x >> 8 & 255;
          let d = x & 255;
          let y = ctx.sbox[0][a] + ctx.sbox[1][b];
          y = y ^ ctx.sbox[2][c];
          y = y + ctx.sbox[3][d];
          return y;
        }
        __name(F, "F");
        __name2(F, "F");
        function BlowFish_Encrypt(ctx, left, right) {
          let Xl = left;
          let Xr = right;
          let temp;
          for (let i = 0; i < N; ++i) {
            Xl = Xl ^ ctx.pbox[i];
            Xr = F(ctx, Xl) ^ Xr;
            temp = Xl;
            Xl = Xr;
            Xr = temp;
          }
          temp = Xl;
          Xl = Xr;
          Xr = temp;
          Xr = Xr ^ ctx.pbox[N];
          Xl = Xl ^ ctx.pbox[N + 1];
          return { left: Xl, right: Xr };
        }
        __name(BlowFish_Encrypt, "BlowFish_Encrypt");
        __name2(BlowFish_Encrypt, "BlowFish_Encrypt");
        function BlowFish_Decrypt(ctx, left, right) {
          let Xl = left;
          let Xr = right;
          let temp;
          for (let i = N + 1; i > 1; --i) {
            Xl = Xl ^ ctx.pbox[i];
            Xr = F(ctx, Xl) ^ Xr;
            temp = Xl;
            Xl = Xr;
            Xr = temp;
          }
          temp = Xl;
          Xl = Xr;
          Xr = temp;
          Xr = Xr ^ ctx.pbox[1];
          Xl = Xl ^ ctx.pbox[0];
          return { left: Xl, right: Xr };
        }
        __name(BlowFish_Decrypt, "BlowFish_Decrypt");
        __name2(BlowFish_Decrypt, "BlowFish_Decrypt");
        function BlowFishInit(ctx, key, keysize) {
          for (let Row = 0; Row < 4; Row++) {
            ctx.sbox[Row] = [];
            for (let Col = 0; Col < 256; Col++) {
              ctx.sbox[Row][Col] = ORIG_S[Row][Col];
            }
          }
          let keyIndex = 0;
          for (let index = 0; index < N + 2; index++) {
            ctx.pbox[index] = ORIG_P[index] ^ key[keyIndex];
            keyIndex++;
            if (keyIndex >= keysize) {
              keyIndex = 0;
            }
          }
          let Data1 = 0;
          let Data2 = 0;
          let res = 0;
          for (let i = 0; i < N + 2; i += 2) {
            res = BlowFish_Encrypt(ctx, Data1, Data2);
            Data1 = res.left;
            Data2 = res.right;
            ctx.pbox[i] = Data1;
            ctx.pbox[i + 1] = Data2;
          }
          for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 256; j += 2) {
              res = BlowFish_Encrypt(ctx, Data1, Data2);
              Data1 = res.left;
              Data2 = res.right;
              ctx.sbox[i][j] = Data1;
              ctx.sbox[i][j + 1] = Data2;
            }
          }
          return true;
        }
        __name(BlowFishInit, "BlowFishInit");
        __name2(BlowFishInit, "BlowFishInit");
        var Blowfish = C_algo.Blowfish = BlockCipher.extend({
          _doReset: /* @__PURE__ */ __name2(function() {
            if (this._keyPriorReset === this._key) {
              return;
            }
            var key = this._keyPriorReset = this._key;
            var keyWords = key.words;
            var keySize = key.sigBytes / 4;
            BlowFishInit(BLOWFISH_CTX, keyWords, keySize);
          }, "_doReset"),
          encryptBlock: /* @__PURE__ */ __name2(function(M, offset) {
            var res = BlowFish_Encrypt(BLOWFISH_CTX, M[offset], M[offset + 1]);
            M[offset] = res.left;
            M[offset + 1] = res.right;
          }, "encryptBlock"),
          decryptBlock: /* @__PURE__ */ __name2(function(M, offset) {
            var res = BlowFish_Decrypt(BLOWFISH_CTX, M[offset], M[offset + 1]);
            M[offset] = res.left;
            M[offset + 1] = res.right;
          }, "decryptBlock"),
          blockSize: 64 / 32,
          keySize: 128 / 32,
          ivSize: 64 / 32
        });
        C.Blowfish = BlockCipher._createHelper(Blowfish);
      })();
      return CryptoJS3.Blowfish;
    });
  }
});
var require_crypto_js = __commonJS({
  "../node_modules/crypto-js/index.js"(exports, module) {
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_x64_core(), require_lib_typedarrays(), require_enc_utf16(), require_enc_base64(), require_enc_base64url(), require_md5(), require_sha1(), require_sha256(), require_sha224(), require_sha512(), require_sha384(), require_sha3(), require_ripemd160(), require_hmac(), require_pbkdf2(), require_evpkdf(), require_cipher_core(), require_mode_cfb(), require_mode_ctr(), require_mode_ctr_gladman(), require_mode_ofb(), require_mode_ecb(), require_pad_ansix923(), require_pad_iso10126(), require_pad_iso97971(), require_pad_zeropadding(), require_pad_nopadding(), require_format_hex(), require_aes(), require_tripledes(), require_rc4(), require_rabbit(), require_rabbit_legacy(), require_blowfish());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./x64-core", "./lib-typedarrays", "./enc-utf16", "./enc-base64", "./enc-base64url", "./md5", "./sha1", "./sha256", "./sha224", "./sha512", "./sha384", "./sha3", "./ripemd160", "./hmac", "./pbkdf2", "./evpkdf", "./cipher-core", "./mode-cfb", "./mode-ctr", "./mode-ctr-gladman", "./mode-ofb", "./mode-ecb", "./pad-ansix923", "./pad-iso10126", "./pad-iso97971", "./pad-zeropadding", "./pad-nopadding", "./format-hex", "./aes", "./tripledes", "./rc4", "./rabbit", "./rabbit-legacy", "./blowfish"], factory);
      } else {
        root.CryptoJS = factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS3) {
      return CryptoJS3;
    });
  }
});
async function onRequestOptions13() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
__name(onRequestOptions13, "onRequestOptions13");
async function onRequestPost3(context) {
  const { request, env } = context;
  try {
    const password = env.AFFENSUS_CREDENTIALS_PASSWORD;
    if (!password) {
      return new Response(JSON.stringify({
        success: false,
        error: "AFFENSUS_CREDENTIALS_PASSWORD not configured"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    const body = await request.json();
    const { project_id, network_id, credentials, credential_name } = body;
    if (!project_id || !network_id || !credentials) {
      return new Response(JSON.stringify({
        success: false,
        error: "project_id, network_id, and credentials are required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const networkId = parseInt(network_id);
    if (isNaN(networkId)) {
      return new Response(JSON.stringify({
        success: false,
        error: "network_id must be a valid number"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    console.log("Data to encrypt:", JSON.stringify(credentials, null, 2));
    const encryptCredentials = /* @__PURE__ */ __name2((data) => {
      const encrypted = import_crypto_js.default.AES.encrypt(JSON.stringify(data), password);
      return encrypted.toString();
    }, "encryptCredentials");
    const encryptedCredentials = encryptCredentials(credentials);
    console.log("Encrypted credentials:", encryptedCredentials);
    try {
      const testDecrypt = import_crypto_js.default.AES.decrypt(encryptedCredentials, password);
      const testDecryptString = testDecrypt.toString(import_crypto_js.default.enc.Utf8);
      const testDecryptData = JSON.parse(testDecryptString);
      console.log("Encryption test successful - data can be decrypted");
    } catch (testError) {
      console.error("WARNING: Cannot decrypt the data we just encrypted!", testError);
      return new Response(JSON.stringify({
        success: false,
        error: "Encryption validation failed - cannot decrypt encrypted data"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    const apiUrl = "https://apiv2.affensus.com/api/credentials";
    const requestPayload = {
      project_id,
      // Keep as string (UUID)
      network_id: networkId,
      credentials: encryptedCredentials,
      credential_name
    };
    console.log("Sending to apiv2:", JSON.stringify(requestPayload, null, 2));
    const apiv2Response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${password}`
        // Using same password as bearer token
      },
      body: JSON.stringify(requestPayload)
    });
    if (!apiv2Response.ok) {
      const errorText = await apiv2Response.text();
      console.error("apiv2 error response:", errorText);
      console.error("apiv2 status:", apiv2Response.status, apiv2Response.statusText);
      return new Response(JSON.stringify({
        success: false,
        error: `External API error: ${apiv2Response.status} ${apiv2Response.statusText}`,
        details: errorText
      }), {
        status: apiv2Response.status,
        headers: { "Content-Type": "application/json" }
      });
    }
    const responseData = await apiv2Response.json();
    return new Response(JSON.stringify({
      success: true,
      data: responseData
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error creating credentials:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost3, "onRequestPost3");
var import_crypto_js;
var init_create = __esm({
  "api/credentials/create.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    import_crypto_js = __toESM(require_crypto_js());
    __name2(onRequestOptions13, "onRequestOptions");
    __name2(onRequestPost3, "onRequestPost");
  }
});
async function onRequestOptions14() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
__name(onRequestOptions14, "onRequestOptions14");
async function onRequestDelete(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const { credential_id } = body;
    console.log("Credential ID:", credential_id);
    if (!credential_id) {
      return new Response(JSON.stringify({
        success: false,
        error: "credential_id is required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const password = env.AFFENSUS_CREDENTIALS_PASSWORD;
    if (!password) {
      return new Response(JSON.stringify({
        success: false,
        error: "AFFENSUS_CREDENTIALS_PASSWORD not configured"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    const apiUrl = `https://apiv2.affensus.com/api/credentials/${credential_id}`;
    console.log("Making DELETE request to:", apiUrl);
    const apiv2Response = await fetch(apiUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${password}`
      }
    });
    if (!apiv2Response.ok) {
      const errorText = await apiv2Response.text();
      console.error("apiv2 error response:", errorText);
      console.error("apiv2 status:", apiv2Response.status, apiv2Response.statusText);
      return new Response(JSON.stringify({
        success: false,
        error: `External API error: ${apiv2Response.status} ${apiv2Response.statusText}`,
        details: errorText
      }), {
        status: apiv2Response.status,
        headers: { "Content-Type": "application/json" }
      });
    }
    const responseData = await apiv2Response.json();
    return new Response(JSON.stringify({
      success: true,
      data: responseData
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error deleting credentials:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestDelete, "onRequestDelete");
var init_delete = __esm({
  "api/credentials/delete.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    __name2(onRequestOptions14, "onRequestOptions");
    __name2(onRequestDelete, "onRequestDelete");
  }
});
async function onRequestOptions15() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
__name(onRequestOptions15, "onRequestOptions15");
async function onRequestPut3(context) {
  const { request, env } = context;
  try {
    const url = new URL(request.url);
    const credentialId = url.searchParams.get("credential_id");
    console.log("Credential ID:", credentialId);
    if (!credentialId) {
      return new Response(JSON.stringify({
        success: false,
        error: "Credential ID is required as query parameter"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const password = env.AFFENSUS_CREDENTIALS_PASSWORD;
    if (!password) {
      return new Response(JSON.stringify({
        success: false,
        error: "AFFENSUS_CREDENTIALS_PASSWORD not configured"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    const body = await request.json();
    const { credentials, credential_name } = body;
    if (!credentials) {
      return new Response(JSON.stringify({
        success: false,
        error: "Credentials data is required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    console.log("Data to encrypt:", JSON.stringify(credentials, null, 2));
    const encryptCredentials = /* @__PURE__ */ __name2((data) => {
      const encrypted = import_crypto_js2.default.AES.encrypt(JSON.stringify(data), password);
      return encrypted.toString();
    }, "encryptCredentials");
    const encryptedCredentials = encryptCredentials(credentials);
    console.log("Encrypted credentials:", encryptedCredentials);
    try {
      const testDecrypt = import_crypto_js2.default.AES.decrypt(encryptedCredentials, password);
      const testDecryptString = testDecrypt.toString(import_crypto_js2.default.enc.Utf8);
      const testDecryptData = JSON.parse(testDecryptString);
      console.log("Encryption test successful - data can be decrypted");
    } catch (testError) {
      console.error("WARNING: Cannot decrypt the data we just encrypted!", testError);
      return new Response(JSON.stringify({
        success: false,
        error: "Encryption validation failed - cannot decrypt encrypted data"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    const apiUrl = `https://apiv2.affensus.com/api/credentials/${credentialId}`;
    const apiv2Response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${password}`
        // Using same password as bearer token
      },
      body: JSON.stringify({ credentials: encryptedCredentials, credential_name })
    });
    if (!apiv2Response.ok) {
      const errorText = await apiv2Response.text();
      return new Response(JSON.stringify({
        success: false,
        error: `External API error: ${apiv2Response.status} ${apiv2Response.statusText}`,
        details: errorText
      }), {
        status: apiv2Response.status,
        headers: { "Content-Type": "application/json" }
      });
    }
    const responseData = await apiv2Response.json();
    return new Response(JSON.stringify({
      success: true,
      data: responseData
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error updating credentials:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPut3, "onRequestPut3");
var import_crypto_js2;
var init_update = __esm({
  "api/credentials/update.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    import_crypto_js2 = __toESM(require_crypto_js());
    __name2(onRequestOptions15, "onRequestOptions");
    __name2(onRequestPut3, "onRequestPut");
  }
});
async function onRequestOptions16() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
__name(onRequestOptions16, "onRequestOptions16");
async function onRequestPost4(context) {
  const { request, env } = context;
  try {
    const password = env.AFFENSUS_CREDENTIALS_PASSWORD;
    if (!password) {
      return new Response(JSON.stringify({
        success: false,
        error: "AFFENSUS_CREDENTIALS_PASSWORD not configured"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    const body = await request.json();
    const { merchants } = body;
    if (!merchants || !Array.isArray(merchants)) {
      return new Response(JSON.stringify({
        success: false,
        error: "merchants array is required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    for (const merchant of merchants) {
      const { credential_id, program_id, network_id, project_id } = merchant;
      if (!credential_id || !program_id || !network_id || !project_id) {
        return new Response(JSON.stringify({
          success: false,
          error: "Each merchant must have credential_id, program_id, network_id, and project_id"
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const networkId = parseInt(network_id);
      if (isNaN(networkId)) {
        return new Response(JSON.stringify({
          success: false,
          error: "network_id must be a valid number"
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      merchant.network_id = networkId;
    }
    const apiUrl = "https://apiv2.affensus.com/api/merchants/hidden";
    const requestPayload = {
      merchants
    };
    console.log("Sending to apiv2:", JSON.stringify(requestPayload, null, 2));
    const apiv2Response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${password}`
        // Using same password as bearer token
      },
      body: JSON.stringify(requestPayload)
    });
    if (!apiv2Response.ok) {
      const errorText = await apiv2Response.text();
      console.error("apiv2 error response:", errorText);
      console.error("apiv2 status:", apiv2Response.status, apiv2Response.statusText);
      return new Response(JSON.stringify({
        success: false,
        error: `External API error: ${apiv2Response.status} ${apiv2Response.statusText}`,
        details: errorText
      }), {
        status: apiv2Response.status,
        headers: { "Content-Type": "application/json" }
      });
    }
    const responseData = await apiv2Response.json();
    return new Response(JSON.stringify({
      success: true,
      data: responseData
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error hiding merchants:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost4, "onRequestPost4");
var init_hide = __esm({
  "api/merchants/hide.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    __name2(onRequestOptions16, "onRequestOptions");
    __name2(onRequestPost4, "onRequestPost");
  }
});
async function signJwt4(payload, secret, expiresIn = 7 * 24 * 60 * 60) {
  const now = Math.floor(Date.now() / 1e3);
  const jwtPayload = {
    ...payload,
    iat: now,
    exp: now + expiresIn
  };
  const headerB64 = btoa(JSON.stringify(JWT_HEADER));
  const payloadB64 = btoa(JSON.stringify(jwtPayload));
  const data = `${headerB64}.${payloadB64}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
  return `${data}.${signatureB64}`;
}
__name(signJwt4, "signJwt4");
async function verifyJwt(token, secret) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }
    const [headerB64, payloadB64, signatureB64] = parts;
    const data = `${headerB64}.${payloadB64}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const signature = Uint8Array.from(atob(signatureB64), (c) => c.charCodeAt(0));
    const isValid = await crypto.subtle.verify("HMAC", key, signature, encoder.encode(data));
    if (!isValid) {
      return null;
    }
    const payload = JSON.parse(atob(payloadB64));
    const now = Math.floor(Date.now() / 1e3);
    if (payload.exp < now) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
__name(verifyJwt, "verifyJwt");
var JWT_ALGORITHM;
var JWT_HEADER;
var init_jwt = __esm({
  "../src/lib/jwt.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    JWT_ALGORITHM = "HS256";
    JWT_HEADER = { alg: JWT_ALGORITHM, typ: "JWT" };
    __name2(signJwt4, "signJwt");
    __name2(verifyJwt, "verifyJwt");
  }
});
function parseCookies4(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  const cookiePairs = cookieHeader.split("; ");
  for (const cookie of cookiePairs) {
    const [name, ...rest] = cookie.split("=");
    if (name && rest.length > 0) {
      const value = rest.join("=");
      cookies[name] = decodeURIComponent(value);
    }
  }
  return cookies;
}
__name(parseCookies4, "parseCookies4");
async function onRequestGet17(context) {
  try {
    const { request, env } = context;
    const cookies = parseCookies4(request.headers.get("Cookie"));
    const token = cookies["auth-token"];
    if (!token) {
      return new Response(JSON.stringify({ error: "No authentication token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const jwtSecret = env.JWT_SECRET;
    if (!jwtSecret) {
      return new Response(JSON.stringify({ error: "JWT secret not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    try {
      const decoded = await verifyJwt(token, jwtSecret);
      if (!decoded) {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
      const db = env.DB;
      if (!db) {
        return new Response(JSON.stringify({ error: "Database not available" }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
      const address = await db.prepare(`
        SELECT line1, line2, city, state, postal_code, country
        FROM user_billing_addresses 
        WHERE user_id = ?
      `).bind(decoded.sub).first();
      return new Response(JSON.stringify({
        address: address || null
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (jwtError) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    console.error("Error fetching billing address:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch billing address" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet17, "onRequestGet17");
async function onRequestPut4(context) {
  try {
    const { request, env } = context;
    const cookieHeader = request.headers.get("Cookie");
    let token = null;
    if (cookieHeader) {
      const cookies = cookieHeader.split("; ");
      const authCookie = cookies.find((c) => c.startsWith("auth-token="));
      if (authCookie) {
        token = authCookie.split("=")[1];
      }
    }
    if (!token) {
      return new Response(JSON.stringify({ error: "No authentication token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const jwtSecret = env.JWT_SECRET;
    if (!jwtSecret) {
      return new Response(JSON.stringify({ error: "JWT secret not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    try {
      const decoded = await verifyJwt(token, jwtSecret);
      if (!decoded) {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
      const { line1, line2, city, state, postalCode, country } = await request.json();
      if (!line1 || !city || !postalCode || !country) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const db = env.DB;
      if (!db) {
        return new Response(JSON.stringify({ error: "Database not available" }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
      await db.prepare(`
        INSERT INTO user_billing_addresses (user_id, line1, line2, city, state, postal_code, country, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(user_id) DO UPDATE SET
          line1 = excluded.line1,
          line2 = excluded.line2,
          city = excluded.city,
          state = excluded.state,
          postal_code = excluded.postal_code,
          country = excluded.country,
          updated_at = datetime('now')
      `).bind(decoded.sub, line1, line2 || null, city, state, postalCode, country).run();
      return new Response(JSON.stringify({
        success: true,
        address: { line1, line2, city, state, postalCode, country }
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (jwtError) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    console.error("Error saving billing address:", error);
    return new Response(JSON.stringify({ error: "Failed to save billing address" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPut4, "onRequestPut4");
var init_billing_address = __esm({
  "api/profile/billing-address.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    init_jwt();
    __name2(parseCookies4, "parseCookies");
    __name2(onRequestGet17, "onRequestGet");
    __name2(onRequestPut4, "onRequestPut");
  }
});
function parseCookies5(cookieHeader) {
  if (!cookieHeader) return {};
  return cookieHeader.split(";").reduce((cookies, cookie) => {
    const [name, value] = cookie.trim().split("=");
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
    return cookies;
  }, {});
}
__name(parseCookies5, "parseCookies5");
async function getUserById(db, userId) {
  try {
    const user = await db.prepare(`
      SELECT id, email, first_name, last_name, avatar_url, subscription_status, 
             stripe_customer_id, subscription_expires_at, trial_ends_at, 
             created_at, updated_at
      FROM users 
      WHERE id = ?
    `).bind(userId).first();
    return user;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    return null;
  }
}
__name(getUserById, "getUserById");
async function onRequestGet18(context) {
  try {
    const { request, env } = context;
    const cookies = parseCookies5(request.headers.get("Cookie"));
    const token = cookies["auth-token"];
    if (!token) {
      return new Response(JSON.stringify({ error: "No authentication token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const jwtSecret = env.JWT_SECRET;
    if (!jwtSecret) {
      return new Response(JSON.stringify({ error: "JWT secret not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    try {
      const decoded = await verifyJwt(token, jwtSecret);
      if (!decoded) {
        return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
      const db = env.DB;
      if (!db) {
        return new Response(JSON.stringify({ error: "Database not available" }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
      const user = await getUserById(db, decoded.sub);
      if (!user) {
        return new Response(JSON.stringify({ error: "User not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
      const hasPersonalData = !!(user.first_name && user.last_name);
      const billingAddress = await db.prepare(`
        SELECT line1, line2, city, state, postal_code, country
        FROM user_billing_addresses 
        WHERE user_id = ?
      `).bind(decoded.sub).first();
      const hasBillingAddress = !!billingAddress;
      const needsProfileCompletion = !hasPersonalData || !hasBillingAddress;
      return new Response(JSON.stringify({
        needsProfileCompletion,
        hasPersonalData,
        hasBillingAddress,
        isPaidUser: user.subscription_status !== "free"
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (jwtError) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    console.error("Error checking profile completion status:", error);
    return new Response(JSON.stringify({ error: "Failed to check profile completion status" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet18, "onRequestGet18");
var init_completion_status = __esm({
  "api/profile/completion-status.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    init_jwt();
    __name2(parseCookies5, "parseCookies");
    __name2(getUserById, "getUserById");
    __name2(onRequestGet18, "onRequestGet");
  }
});
async function getUserInvoices(db, userId) {
  return await db.prepare(`
    SELECT * FROM stripe_invoices 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT 50
  `).bind(userId).all();
}
__name(getUserInvoices, "getUserInvoices");
async function onRequestGet19(context) {
  try {
    const { request, env } = context;
    const cookieHeader = request.headers.get("Cookie");
    let token = null;
    if (cookieHeader) {
      const cookies = cookieHeader.split("; ");
      const authCookie = cookies.find((c) => c.startsWith("auth-token="));
      if (authCookie) {
        const encodedToken = authCookie.split("=")[1];
        token = decodeURIComponent(encodedToken);
      }
    }
    if (!token) {
      return new Response(JSON.stringify({ error: "No authentication token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const jwtSecret = env.JWT_SECRET;
    if (!jwtSecret) {
      return new Response(JSON.stringify({ error: "JWT secret not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    try {
      const decoded = await verifyJwt(token, jwtSecret);
      if (!decoded) {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
      const db = env.DB;
      if (!db) {
        return new Response(JSON.stringify({ error: "Database not available" }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
      const invoicesResult = await getUserInvoices(db, decoded.sub);
      const invoices = invoicesResult.results || [];
      const formattedInvoices = invoices.map((invoice) => ({
        id: invoice.id.toString(),
        stripeInvoiceId: invoice.stripe_invoice_id,
        amountPaid: invoice.amount_paid,
        currency: invoice.currency,
        status: invoice.status,
        description: invoice.description,
        invoiceUrl: invoice.invoice_url,
        hostedInvoiceUrl: invoice.hosted_invoice_url,
        periodStart: invoice.period_start,
        periodEnd: invoice.period_end,
        createdAt: invoice.created_at,
        // New invoice fields
        invoiceNumber: invoice.invoice_number,
        invoiceType: invoice.invoice_type,
        invoiceDate: invoice.invoice_date,
        totalAmount: invoice.total_amount,
        creditNoteForInvoiceId: invoice.credit_note_for_invoice_id
      }));
      return new Response(JSON.stringify({
        invoices: formattedInvoices
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (jwtError) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    console.error("Error getting user invoices:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet19, "onRequestGet19");
var init_invoices = __esm({
  "api/profile/invoices.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    init_jwt();
    __name2(getUserInvoices, "getUserInvoices");
    __name2(onRequestGet19, "onRequestGet");
  }
});
async function getUserPreferences(db, userId) {
  return await db.prepare(`
    SELECT * FROM user_preferences 
    WHERE user_id = ?
  `).bind(userId).first();
}
__name(getUserPreferences, "getUserPreferences");
async function createDefaultPreferences(db, userId) {
  await db.prepare(`
    INSERT INTO user_preferences (user_id, speed_preference, audio_enabled, notifications_enabled, theme, language)
    VALUES (?, 20, 1, 1, 'light', 'en')
  `).bind(userId).run();
  return await getUserPreferences(db, userId);
}
__name(createDefaultPreferences, "createDefaultPreferences");
async function onRequestGet20(context) {
  try {
    const { request, env } = context;
    const cookieHeader = request.headers.get("Cookie");
    let token = null;
    if (cookieHeader) {
      const cookies = cookieHeader.split("; ");
      const authCookie = cookies.find((c) => c.startsWith("auth-token="));
      if (authCookie) {
        const encodedToken = authCookie.split("=")[1];
        token = decodeURIComponent(encodedToken);
      }
    }
    if (!token) {
      return new Response(JSON.stringify({ error: "No authentication token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const jwtSecret = env.JWT_SECRET;
    if (!jwtSecret) {
      return new Response(JSON.stringify({ error: "JWT secret not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    try {
      const decoded = await verifyJwt(token, jwtSecret);
      if (!decoded) {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
      const db = env.DB;
      if (!db) {
        return new Response(JSON.stringify({ error: "Database not available" }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
      let preferences = await getUserPreferences(db, decoded.sub);
      if (!preferences) {
        preferences = await createDefaultPreferences(db, decoded.sub);
      }
      const formattedPreferences = {
        speedPreference: preferences.speed_preference,
        audioEnabled: Boolean(preferences.audio_enabled),
        notificationsEnabled: Boolean(preferences.notifications_enabled),
        theme: preferences.theme,
        language: preferences.language
      };
      return new Response(JSON.stringify({
        preferences: formattedPreferences
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (jwtError) {
      console.error("JWT Error:", jwtError);
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    console.error("Error getting user preferences:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet20, "onRequestGet20");
var init_preferences = __esm({
  "api/profile/preferences.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    init_jwt();
    __name2(getUserPreferences, "getUserPreferences");
    __name2(createDefaultPreferences, "createDefaultPreferences");
    __name2(onRequestGet20, "onRequestGet");
  }
});
var invoice_generator_exports = {};
__export(invoice_generator_exports, {
  calculateTax: /* @__PURE__ */ __name(() => calculateTax, "calculateTax"),
  createCreditNote: /* @__PURE__ */ __name(() => createCreditNote, "createCreditNote"),
  createInvoiceRecord: /* @__PURE__ */ __name(() => createInvoiceRecord, "createInvoiceRecord"),
  generateInvoiceNumber: /* @__PURE__ */ __name(() => generateInvoiceNumber, "generateInvoiceNumber"),
  getUserBillingAddress: /* @__PURE__ */ __name(() => getUserBillingAddress, "getUserBillingAddress"),
  processPendingInvoices: /* @__PURE__ */ __name(() => processPendingInvoices, "processPendingInvoices")
});
async function generateInvoiceNumber(db) {
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const result = await db.prepare(`
    INSERT INTO invoice_sequence (year, sequence_number) 
    VALUES (?, 1)
    ON CONFLICT(year) DO UPDATE SET 
      sequence_number = sequence_number + 1,
      last_updated = datetime('now')
    RETURNING sequence_number
  `).bind(currentYear).first();
  const sequenceNumber = result?.sequence_number;
  return `INV-${currentYear}-${sequenceNumber.toString().padStart(3, "0")}`;
}
__name(generateInvoiceNumber, "generateInvoiceNumber");
function calculateTax(amount, billingAddress) {
  const taxRate = 0;
  const taxAmount = 0;
  const taxDescription = billingAddress.country === "HK" ? "No tax applicable (Hong Kong)" : "No tax applicable (Hong Kong - Foreign Income)";
  const subtotalAmount = amount;
  const totalAmount = subtotalAmount + taxAmount;
  return {
    taxRate,
    taxAmount,
    taxDescription,
    subtotalAmount,
    totalAmount
  };
}
__name(calculateTax, "calculateTax");
async function createInvoiceRecord(db, invoiceData) {
  const invoiceNumber = await generateInvoiceNumber(db);
  const invoiceDate = (/* @__PURE__ */ new Date()).toISOString();
  const dueDate = (/* @__PURE__ */ new Date()).toISOString();
  const taxCalc = calculateTax(invoiceData.amountPaid, invoiceData.billingAddress);
  const billingName = invoiceData.billingAddress.addressType === "company" && invoiceData.billingAddress.companyName ? invoiceData.billingAddress.companyName : invoiceData.userName;
  const invoiceRecord = await db.prepare(`
    INSERT INTO stripe_invoices (
      invoice_number,
      invoice_type,
      user_id,
      stripe_invoice_id,
      stripe_customer_id,
      amount_paid,
      currency,
      status,
      description,
      billing_name,
      billing_email,
      billing_address_line1,
      billing_address_line2,
      billing_city,
      billing_state,
      billing_postal_code,
      billing_country,
      tax_rate,
      tax_amount,
      tax_description,
      subtotal_amount,
      total_amount,
      invoice_date,
      due_date,
      credit_note_for_invoice_id,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    RETURNING *
  `).bind(
    invoiceNumber,
    invoiceData.invoiceType || "invoice",
    invoiceData.userId,
    invoiceData.stripeInvoiceId,
    invoiceData.stripeCustomerId,
    invoiceData.amountPaid,
    invoiceData.currency,
    "paid",
    // Default status for new invoices
    invoiceData.description,
    billingName,
    invoiceData.userEmail,
    invoiceData.billingAddress.line1,
    invoiceData.billingAddress.line2 || null,
    invoiceData.billingAddress.city,
    invoiceData.billingAddress.state,
    invoiceData.billingAddress.postalCode,
    invoiceData.billingAddress.country,
    taxCalc.taxRate,
    taxCalc.taxAmount,
    taxCalc.taxDescription,
    taxCalc.subtotalAmount,
    taxCalc.totalAmount,
    invoiceDate,
    dueDate,
    invoiceData.creditNoteForInvoiceId || null
  ).first();
  console.log(`Generated invoice: ${invoiceNumber} for user ${invoiceData.userId}`);
  return invoiceRecord;
}
__name(createInvoiceRecord, "createInvoiceRecord");
async function createCreditNote(db, originalInvoiceId, refundReason) {
  const originalInvoice = await db.prepare(`
    SELECT * FROM stripe_invoices WHERE id = ?
  `).bind(originalInvoiceId).first();
  if (!originalInvoice) {
    throw new Error("Original invoice not found");
  }
  const creditNoteData = {
    userId: originalInvoice.userId,
    userEmail: originalInvoice.billingEmail,
    userName: originalInvoice.billingName,
    stripeCustomerId: originalInvoice.stripeCustomerId,
    stripeInvoiceId: `refund_${originalInvoice.stripeInvoiceId}`,
    amountPaid: -Math.abs(originalInvoice.amountPaid),
    // Negative amount for credit
    currency: originalInvoice.currency,
    description: `Credit Note - ${refundReason}`,
    billingAddress: {
      line1: originalInvoice.billingAddressLine1,
      line2: originalInvoice.billingAddressLine2,
      city: originalInvoice.billingCity,
      state: originalInvoice.billingState,
      postalCode: originalInvoice.billingPostalCode,
      country: originalInvoice.billingCountry
    },
    invoiceType: "credit_note",
    creditNoteForInvoiceId: originalInvoiceId
  };
  return await createInvoiceRecord(db, creditNoteData);
}
__name(createCreditNote, "createCreditNote");
async function getUserBillingAddress(db, userId) {
  const address = await db.prepare(`
    SELECT * FROM user_billing_addresses WHERE user_id = ?
  `).bind(userId).first();
  if (!address) {
    return null;
  }
  return {
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    state: address.state,
    postalCode: address.postal_code,
    country: address.country,
    addressType: address.address_type,
    companyName: address.company_name,
    taxIdType: address.tax_id_type,
    taxIdNumber: address.tax_id_number
  };
}
__name(getUserBillingAddress, "getUserBillingAddress");
async function processPendingInvoices(db, userId, userEmail) {
  const billingAddress = await getUserBillingAddress(db, userId);
  if (!billingAddress) {
    throw new Error("Billing address not found");
  }
  const user = await db.prepare(`
    SELECT first_name, last_name FROM users WHERE id = ?
  `).bind(userId).first();
  const userName = user ? `${user.first_name} ${user.last_name}`.trim() : "Customer";
  const pendingPayments = await db.prepare(`
    SELECT * FROM pending_payments WHERE email = ? ORDER BY created_at ASC
  `).bind(userEmail.toLowerCase()).all();
  const createdInvoices = [];
  for (const payment of pendingPayments.results || []) {
    const invoiceData = {
      userId,
      userEmail,
      userName,
      stripeCustomerId: payment.stripe_customer_id || "pending",
      stripeInvoiceId: payment.session_id,
      amountPaid: payment.amount_total,
      currency: payment.currency,
      description: `${payment.customer_name || "Premium Plan"} - Processed Payment`,
      billingAddress
    };
    const invoice = await createInvoiceRecord(db, invoiceData);
    createdInvoices.push(invoice);
    await db.prepare(`
      DELETE FROM pending_payments WHERE id = ?
    `).bind(payment.id).run();
  }
  console.log(`Processed ${createdInvoices.length} pending invoices for user ${userId}`);
  return createdInvoices;
}
__name(processPendingInvoices, "processPendingInvoices");
var init_invoice_generator = __esm({
  "../src/lib/invoice-generator.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    __name2(generateInvoiceNumber, "generateInvoiceNumber");
    __name2(calculateTax, "calculateTax");
    __name2(createInvoiceRecord, "createInvoiceRecord");
    __name2(createCreditNote, "createCreditNote");
    __name2(getUserBillingAddress, "getUserBillingAddress");
    __name2(processPendingInvoices, "processPendingInvoices");
  }
});
async function onRequestOptions17() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
__name(onRequestOptions17, "onRequestOptions17");
async function onRequestPost5(context) {
  try {
    const { request, env } = context;
    const cookieHeader = request.headers.get("Cookie");
    let token = null;
    if (cookieHeader) {
      const cookies = cookieHeader.split("; ");
      const authCookie = cookies.find((c) => c.startsWith("auth-token="));
      if (authCookie) {
        const encodedToken = authCookie.split("=")[1];
        token = decodeURIComponent(encodedToken);
      }
    }
    if (!token) {
      return new Response(JSON.stringify({ error: "No authentication token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const jwtSecret = env.JWT_SECRET;
    if (!jwtSecret) {
      return new Response(JSON.stringify({ error: "JWT secret not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    try {
      const payload = await verifyJwt(token, jwtSecret);
      if (!payload) {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
      const db = env.DB;
      if (!db) {
        return new Response(JSON.stringify({ error: "Database not available" }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
      const { processPendingInvoices: processPendingInvoices2 } = await Promise.resolve().then(() => (init_invoice_generator(), invoice_generator_exports));
      const createdInvoices = await processPendingInvoices2(db, parseInt(payload.sub), payload.email);
      return new Response(JSON.stringify({
        success: true,
        invoicesCreated: createdInvoices.length,
        invoices: createdInvoices.map((inv) => ({
          invoiceNumber: inv.invoiceNumber,
          amount: inv.totalAmount,
          currency: inv.currency
        }))
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (jwtError) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    console.error("Error processing pending invoices:", error);
    return new Response(JSON.stringify({
      error: "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost5, "onRequestPost5");
var init_process_pending_invoices = __esm({
  "api/profile/process-pending-invoices.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    init_jwt();
    __name2(onRequestOptions17, "onRequestOptions");
    __name2(onRequestPost5, "onRequestPost");
  }
});
async function onRequestOptions18() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
__name(onRequestOptions18, "onRequestOptions18");
async function onRequestGet21(context) {
  try {
    const { request, env } = context;
    const bearerToken = env.AFFENSUS_CREDENTIALS_PASSWORD;
    if (!bearerToken) {
      throw new Error("AFFENSUS_CREDENTIALS_PASSWORD not configured");
    }
    console.log("Making API request to:", "https://apiv2.affensus.com/api/queue/status");
    let response;
    try {
      response = await fetch("https://apiv2.affensus.com/api/queue/status", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${bearerToken}`
        }
      });
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      const errorMessage = fetchError instanceof Error ? fetchError.message : "Unknown fetch error";
      throw new Error(`Network error: ${errorMessage}`);
    }
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Response Error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`External API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, max-age=0"
      }
    });
  } catch (error) {
    console.error("Queue status error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet21, "onRequestGet21");
var init_status2 = __esm({
  "api/queue/status.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    __name2(onRequestOptions18, "onRequestOptions");
    __name2(onRequestGet21, "onRequestGet");
  }
});
async function onRequestOptions19() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
__name(onRequestOptions19, "onRequestOptions19");
async function onRequestGet22(context) {
  const { request, env } = context;
  try {
    const password = env.AFFENSUS_CREDENTIALS_PASSWORD;
    if (!password) {
      return new Response(JSON.stringify({
        success: false,
        error: "AFFENSUS_CREDENTIALS_PASSWORD not configured"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    const url = new URL(request.url);
    const uuid = url.searchParams.get("uuid");
    if (!uuid) {
      return new Response(JSON.stringify({
        success: false,
        error: "UUID is required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const apiUrl = `https://apiv2.affensus.com/api/redirect-checker/${uuid}`;
    console.log("Fetching from apiv2:", apiUrl);
    const apiv2Response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${password}`
      }
    });
    if (!apiv2Response.ok) {
      const errorText = await apiv2Response.text();
      console.error("apiv2 error response:", errorText);
      console.error("apiv2 status:", apiv2Response.status, apiv2Response.statusText);
      return new Response(JSON.stringify({
        success: false,
        error: `External API error: ${apiv2Response.status} ${apiv2Response.statusText}`,
        details: errorText
      }), {
        status: apiv2Response.status,
        headers: { "Content-Type": "application/json" }
      });
    }
    const responseData = await apiv2Response.json();
    console.log("Response data:", responseData);
    return new Response(JSON.stringify({
      success: true,
      data: responseData
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error fetching shared result:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet22, "onRequestGet22");
async function onRequestPost6(context) {
  const { request, env } = context;
  try {
    const password = env.AFFENSUS_CREDENTIALS_PASSWORD;
    if (!password) {
      return new Response(JSON.stringify({
        success: false,
        error: "AFFENSUS_CREDENTIALS_PASSWORD not configured"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    const body = await request.json();
    const { url, proxy, country } = body;
    if (!url) {
      return new Response(JSON.stringify({
        success: false,
        error: "URL is required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const apiUrl = "https://apiv2.affensus.com/api/redirect-checker";
    const requestPayload = {
      url
    };
    if (proxy && country) {
      requestPayload.proxy = proxy;
      requestPayload.country = country;
    }
    console.log("Sending to apiv2:", JSON.stringify(requestPayload, null, 2));
    const apiv2Response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${password}`
      },
      body: JSON.stringify(requestPayload)
    });
    if (!apiv2Response.ok) {
      const errorText = await apiv2Response.text();
      console.error("apiv2 error response:", errorText);
      console.error("apiv2 status:", apiv2Response.status, apiv2Response.statusText);
      return new Response(JSON.stringify({
        success: false,
        error: `External API error: ${apiv2Response.status} ${apiv2Response.statusText}`,
        details: errorText
      }), {
        status: apiv2Response.status,
        headers: { "Content-Type": "application/json" }
      });
    }
    const responseData = await apiv2Response.json();
    console.log("Response data:", responseData);
    return new Response(JSON.stringify({
      success: true,
      data: responseData
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error checking redirects:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost6, "onRequestPost6");
var init_affiliate_link_checker = __esm({
  "api/tools/affiliate-link-checker.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    __name2(onRequestOptions19, "onRequestOptions");
    __name2(onRequestGet22, "onRequestGet");
    __name2(onRequestPost6, "onRequestPost");
  }
});
async function onRequestGet23(context) {
  try {
    const { env, request } = context;
    const url = new URL(request.url);
    const debug = url.searchParams.get("debug") === "true";
    const uptimeKumaSecret = env.UPTIME_KUMA_SECRET;
    if (!uptimeKumaSecret) {
      return new Response(JSON.stringify({ error: "Uptime Kuma secret not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (debug) {
      let networkCount = 0;
      let fetchError = null;
      try {
        const uptimeKumaUrl2 = env.UPTIME_KUMA_URL || "http://uptime.affensus.com:3001";
        const monitorsResponse = await fetch(`${uptimeKumaUrl2}/metrics`, {
          headers: {
            "Authorization": `Basic ${btoa(":" + uptimeKumaSecret)}`,
            "Accept": "text/plain"
          }
        });
        if (monitorsResponse.ok) {
          const metricsText2 = await monitorsResponse.text();
          if (!metricsText2.startsWith("<!DOCTYPE") && !metricsText2.includes("<html")) {
            const processedDomains2 = await processPrometheusMetrics(metricsText2, env.UPTIME_KUMA_URL);
            networkCount = processedDomains2.length;
          }
        } else {
          fetchError = `HTTP ${monitorsResponse.status}: ${monitorsResponse.statusText}`;
        }
      } catch (error) {
        fetchError = error instanceof Error ? error.message : "Unknown error";
      }
      return new Response(JSON.stringify({
        environment: typeof caches !== "undefined" ? "cloudflare" : "local",
        hasSecret: !!uptimeKumaSecret,
        secretLength: uptimeKumaSecret?.length || 0,
        secretPrefix: uptimeKumaSecret?.substring(0, 4) || "none",
        uptimeKumaUrl: env.UPTIME_KUMA_URL || "http://uptime.affensus.com:3001",
        networkCount,
        fetchError,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-store, must-revalidate"
        }
      });
    }
    let metricsText = "";
    let success = false;
    const uptimeKumaUrl = env.UPTIME_KUMA_URL || "http://uptime.affensus.com:3001";
    const metricsUrl = `${uptimeKumaUrl}/metrics`;
    console.log("Fetching from:", metricsUrl);
    console.log("Environment variables updated - triggering new deployment");
    try {
      const monitorsResponse = await fetch(metricsUrl, {
        headers: {
          "Authorization": `Basic ${btoa(":" + uptimeKumaSecret)}`,
          "Accept": "text/plain"
        }
      });
      console.log("Response status:", monitorsResponse.status, monitorsResponse.statusText);
      if (monitorsResponse.ok) {
        metricsText = await monitorsResponse.text();
        console.log("Metrics text length:", metricsText.length);
        console.log("First 200 chars:", metricsText.substring(0, 200));
        if (metricsText.startsWith("<!DOCTYPE") || metricsText.includes("<html")) {
          console.log("Received HTML instead of metrics");
        } else {
          success = true;
          console.log("Successfully fetched metrics data");
        }
      } else {
        console.error("Metrics endpoint failed:", monitorsResponse.status, monitorsResponse.statusText);
        const errorText = await monitorsResponse.text();
        console.error("Error response:", errorText.substring(0, 500));
      }
    } catch (error) {
      console.error("Error fetching metrics:", error);
    }
    if (!success) {
      const isCloudflareEnv = typeof caches !== "undefined";
      const usingPrivateIp = !env.UPTIME_KUMA_URL && isCloudflareEnv;
      let errorMessage = "Unable to fetch data from Uptime Kuma";
      if (usingPrivateIp) {
        errorMessage += " - Unable to access Uptime Kuma server. Please check network connectivity.";
      }
      return new Response(JSON.stringify({
        error: errorMessage,
        debug: {
          environment: isCloudflareEnv ? "cloudflare" : "local",
          hasPublicUrl: !!env.UPTIME_KUMA_URL,
          suggestedAction: usingPrivateIp ? "Configure UPTIME_KUMA_URL environment variable" : "Check network connectivity"
        }
      }), {
        status: 503,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Cache-Control": "no-store, must-revalidate"
        }
      });
    }
    const processedDomains = await processPrometheusMetrics(metricsText, env.UPTIME_KUMA_URL);
    console.log(`Processed ${processedDomains.length} domains`);
    console.log("Domain names:", processedDomains.map((d) => d.displayName || d.domain));
    return new Response(JSON.stringify(processedDomains), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "no-store, must-revalidate"
      }
    });
  } catch (error) {
    console.error("Error in affiliate-network-uptime API:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch real uptime data: " + (error instanceof Error ? error.message : "Unknown error") }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "no-store, must-revalidate"
      }
    });
  }
}
__name(onRequestGet23, "onRequestGet23");
async function onRequestOptions20() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
__name(onRequestOptions20, "onRequestOptions20");
function formatNetworkDisplayName(networkName) {
  const nameMappings = {
    "involveasia": "Involve Asia",
    "partnerads": "Partner Ads",
    "retailads": "Retail Ads",
    "smartresponse": "Smart Response",
    "takeads": "Take Ads"
  };
  const normalizedName = networkName.toLowerCase().replace(/[^a-z0-9]/g, "");
  return nameMappings[normalizedName] || networkName;
}
__name(formatNetworkDisplayName, "formatNetworkDisplayName");
async function fetchStatusPageData(networkName, uptimeKumaUrl) {
  try {
    const url = `${uptimeKumaUrl || "http://uptime.affensus.com:3001"}/api/status-page/heartbeat/${networkName}?limit=10080`;
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching status page data for ${networkName}:`, error);
    return null;
  }
}
__name(fetchStatusPageData, "fetchStatusPageData");
async function processPrometheusMetrics(metricsText, uptimeKumaUrl) {
  const domains = /* @__PURE__ */ new Map();
  const lines = metricsText.split("\n");
  const monitors = /* @__PURE__ */ new Map();
  for (const line of lines) {
    if (line.startsWith("#") || !line.trim()) continue;
    const metricMatch = line.match(/^([a-zA-Z_:][a-zA-Z0-9_:]*)\{([^}]*)\}\s+(.+)$/);
    if (!metricMatch) continue;
    const [, metricName, labelsStr, value] = metricMatch;
    const labels = {};
    const labelMatches = labelsStr.matchAll(/([a-zA-Z_][a-zA-Z0-9_]*)="([^"]*)"/g);
    for (const labelMatch of labelMatches) {
      labels[labelMatch[1]] = labelMatch[2];
    }
    const monitorName = labels.monitor_name || labels.job || "unknown";
    if (labels.monitor_type === "group" || monitorName === "unknown") continue;
    if (!monitors.has(monitorName)) {
      monitors.set(monitorName, {
        name: monitorName,
        type: labels.monitor_type || "http",
        url: labels.monitor_url || "",
        monitorId: labels.monitor_id || labels.monitor || "",
        // Extract monitor ID from labels
        metrics: {}
      });
    }
    const monitor = monitors.get(monitorName);
    monitor.metrics[metricName] = parseFloat(value);
  }
  for (const monitor of monitors.values()) {
    const domain = monitor.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!domains.has(domain)) {
      domains.set(domain, {
        domain,
        displayName: formatNetworkDisplayName(monitor.name),
        dashboardId: monitor.monitorId,
        // Include the monitor ID
        originalName: monitor.name,
        // Preserve original name for status page
        avg_uptime_percentage: 0,
        urls: [],
        day_uptime: [],
        hasStatusPage: false
      });
    }
    const domainData = domains.get(domain);
    const status = monitor.metrics["monitor_status"] || 0;
    const responseTime = monitor.metrics["monitor_response_time"] || 0;
    const uptimePercentage = status === 1 ? 100 : 0;
    domainData.urls.push({
      type: "Tracking",
      avg_uptime_percentage: uptimePercentage,
      avg_response_time: responseTime,
      hasStatusPage: false
    });
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    domainData.day_uptime.push({
      type: "Tracking",
      day_uptime: [{
        date: today,
        uptime: uptimePercentage / 100
      }]
    });
  }
  const domainsWithStatusPages = [];
  for (const domain of domains.values()) {
    const namesToTry = [
      domain.domain,
      // normalized name (e.g., "involveasia")
      domain.originalName,
      // original name from monitor (e.g., "InvolveAsia")
      domain.displayName?.replace(/\s+/g, "").toLowerCase(),
      // display name without spaces
      domain.displayName?.replace(/\s+/g, "-").toLowerCase()
      // display name with hyphens
    ].filter((name) => name);
    let statusPageData = null;
    for (const networkName of namesToTry) {
      if (!networkName) continue;
      statusPageData = await fetchStatusPageData(networkName, uptimeKumaUrl);
      if (statusPageData && statusPageData.heartbeatList && Object.keys(statusPageData.heartbeatList).length > 0) {
        break;
      }
    }
    if (statusPageData && statusPageData.heartbeatList && Object.keys(statusPageData.heartbeatList).length > 0) {
      domain.hasStatusPage = true;
      if (statusPageData.uptimeList) {
        domain.uptimeList = statusPageData.uptimeList;
      }
      domain.urls.forEach((url) => {
        url.hasStatusPage = true;
        if (statusPageData.uptimeList) {
          url.uptimeList = statusPageData.uptimeList;
        }
        const allHeartbeats = [];
        Object.entries(statusPageData.heartbeatList).forEach(([monitorId, heartbeatArray]) => {
          if (Array.isArray(heartbeatArray)) {
            heartbeatArray.forEach((heartbeat) => {
              if (heartbeat && typeof heartbeat === "object" && "status" in heartbeat) {
                allHeartbeats.push(heartbeat);
              }
            });
          }
        });
        url.heartbeats = allHeartbeats.sort(
          (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
        );
      });
      domainsWithStatusPages.push(domain);
    }
  }
  domainsWithStatusPages.forEach((domain) => {
    if (domain.urls.length > 0) {
      domain.avg_uptime_percentage = domain.urls.reduce((sum, url) => sum + url.avg_uptime_percentage, 0) / domain.urls.length;
    }
  });
  domainsWithStatusPages.sort((a, b) => {
    const nameA = (a.displayName || a.domain).toLowerCase();
    const nameB = (b.displayName || b.domain).toLowerCase();
    return nameA.localeCompare(nameB);
  });
  return domainsWithStatusPages;
}
__name(processPrometheusMetrics, "processPrometheusMetrics");
var init_affiliate_network_uptime = __esm({
  "api/tools/affiliate-network-uptime.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    __name2(onRequestGet23, "onRequestGet");
    __name2(onRequestOptions20, "onRequestOptions");
    __name2(formatNetworkDisplayName, "formatNetworkDisplayName");
    __name2(fetchStatusPageData, "fetchStatusPageData");
    __name2(processPrometheusMetrics, "processPrometheusMetrics");
  }
});
var pricing_plans_default;
var init_pricing_plans = __esm({
  "../src/pricing-plans.json"() {
    pricing_plans_default = {
      plans: {
        starter: {
          id: "starter",
          name: {
            en: "Starter",
            "nl-nl": "Starter"
          },
          description: {
            en: "Perfect for starters or entrepreneurs working on one domain.",
            "nl-nl": "Perfect voor starters of ondernemers die aan \xE9\xE9n domein werken."
          },
          price: {
            monthly: {
              amount: 2900,
              currency: "USD",
              symbol: "$"
            },
            yearly: {
              amount: 31900,
              currency: "USD",
              symbol: "$"
            }
          },
          billing: {
            monthly: {
              en: "month",
              "nl-nl": "maand"
            },
            yearly: {
              en: "year",
              "nl-nl": "jaar"
            }
          },
          features: {
            en: [
              "1 Project",
              "1 Seat",
              "$30 Additional project",
              "Fully Encrypt",
              "Network Uptime Alerts"
            ],
            "nl-nl": [
              "1 Project",
              "1 Gebruiker",
              "$30 Extra project",
              "Volledig versleuteld",
              "Network Uptime Alerts"
            ]
          },
          stripePriceId: "price_starter",
          popular: false
        },
        professional: {
          id: "professional",
          name: {
            en: "Professional",
            "nl-nl": "Professioneel"
          },
          description: {
            en: "For those that work in teams or maintain multiple domains.",
            "nl-nl": "Voor degenen die in teams werken of meerdere domeinen onderhouden."
          },
          price: {
            monthly: {
              amount: 9900,
              currency: "USD",
              symbol: "$"
            },
            yearly: {
              amount: 108900,
              currency: "USD",
              symbol: "$"
            }
          },
          billing: {
            monthly: {
              en: "month",
              "nl-nl": "maand"
            },
            yearly: {
              en: "year",
              "nl-nl": "jaar"
            }
          },
          features: {
            en: [
              "1 Project",
              "10 Seat",
              "$20 Additional project",
              "Fully Encrypt",
              "Coupon plugin",
              "Project export",
              "Customer support",
              "Network Uptime Alerts"
            ],
            "nl-nl": [
              "1 Project",
              "10 Gebruikers",
              "$20 Extra project",
              "Volledig versleuteld",
              "Coupon plugin",
              "Project export",
              "Klantondersteuning",
              "Network Uptime Alerts"
            ]
          },
          stripePriceId: "price_professional",
          popular: true
        },
        enterprise: {
          id: "enterprise",
          name: {
            en: "Enterprise",
            "nl-nl": "Enterprise"
          },
          description: {
            en: "Perfect for agencies that run multiple sites.",
            "nl-nl": "Perfect voor bureaus die meerdere sites beheren."
          },
          price: {
            monthly: {
              amount: 14900,
              currency: "USD",
              symbol: "$"
            },
            yearly: {
              amount: 163900,
              currency: "USD",
              symbol: "$"
            }
          },
          billing: {
            monthly: {
              en: "month",
              "nl-nl": "maand"
            },
            yearly: {
              en: "year",
              "nl-nl": "jaar"
            }
          },
          features: {
            en: [
              "1 Project",
              "Unlimited seats",
              "$10 Additional project",
              "Fully Encrypt",
              "Coupon plugin",
              "Project export",
              "Customer support",
              "Network Uptime Alerts"
            ],
            "nl-nl": [
              "1 Project",
              "Onbeperkte gebruikers",
              "$10 Extra project",
              "Volledig versleuteld",
              "Coupon plugin",
              "Project export",
              "Klantondersteuning",
              "Network Uptime Alerts"
            ]
          },
          stripePriceId: "price_enterprise",
          popular: false
        }
      }
    };
  }
});
var locales;
var init_settings = __esm({
  "../src/locales/settings.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    locales = {
      "en": {
        label: "English",
        country: "Global",
        locale: "en",
        currency: "USD",
        currencySymbol: "$",
        flag: "\u{1F1FA}\u{1F1F8}",
        hreflang: "en",
        canonicalBase: "https://affensus.com"
      },
      "nl-nl": {
        label: "Nederlands",
        country: "Nederland",
        locale: "nl-NL",
        currency: "EUR",
        currencySymbol: "\u20AC",
        flag: "\u{1F1F3}\u{1F1F1}",
        hreflang: "nl-NL",
        canonicalBase: "https://affensus.com/nl-nl/"
      }
    };
  }
});
function parseCookies6(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach((cookie) => {
    const [name, value] = cookie.trim().split("=");
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });
  return cookies;
}
__name(parseCookies6, "parseCookies6");
var onRequest;
var init_create_checkout_session = __esm({
  "api/stripe/create-checkout-session.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    init_pricing_plans();
    init_settings();
    __name2(parseCookies6, "parseCookies");
    onRequest = /* @__PURE__ */ __name2(async (context) => {
      try {
        const { request, env } = context;
        const cookies = parseCookies6(request.headers.get("Cookie"));
        const token = cookies["auth-token"];
        const jwtSecret = env.JWT_SECRET;
        const stripeSecretKey = env.STRIPE_SECRET_KEY;
        if (!jwtSecret || !stripeSecretKey) {
          return new Response(JSON.stringify({ error: "Server configuration error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
        const { priceId, currency = "USD", email, name, promoCode } = await request.json();
        const allowedPriceIds = env.STRIPE_ALLOWED_PRICE_IDS?.split(",") || [
          "price_basic",
          "price_pro",
          "price_lifetime"
        ];
        allowedPriceIds.push("price_pro", "price_basic", "price_lifetime");
        if (!allowedPriceIds.includes(priceId)) {
          return new Response(JSON.stringify({ error: "Invalid price ID" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }
        let customerId = null;
        let userId = null;
        if (!customerId && email) {
          let customerEmail = email;
          if (currency === "TRY") {
            customerEmail = customerEmail.replace("@", "+location_TR@");
          }
          const customerResponse = await fetch("https://api.stripe.com/v1/customers", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${stripeSecretKey}`,
              "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
              email: customerEmail,
              name: name || "Customer",
              "metadata[temp_user]": "true",
              "metadata[user_id]": userId || "temp"
            })
          });
          if (!customerResponse.ok) {
            console.error("Failed to create Stripe customer:", await customerResponse.text());
            return new Response(JSON.stringify({ error: "Failed to create customer" }), {
              status: 500,
              headers: { "Content-Type": "application/json" }
            });
          }
          const customer = await customerResponse.json();
          customerId = customer.id;
        }
        const plans = pricing_plans_default.plans;
        let planId = "";
        let plan = null;
        for (const [id, planData] of Object.entries(plans)) {
          if (planData.stripePriceId === priceId) {
            planId = id;
            plan = planData;
            break;
          }
        }
        if (!plan) {
          planId = priceId.replace("price_", "");
          plan = plans[planId];
        }
        const checkoutParams = {
          "payment_method_types[]": "card",
          mode: "payment",
          // One-time payment instead of subscription
          success_url: `${env.SITE_URL || "http://localhost:3000"}/auth/?paid=true&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${env.SITE_URL || "http://localhost:3000"}/learn-morse-code/`,
          "metadata[user_id]": userId || "temp",
          "metadata[plan_id]": priceId,
          "metadata[currency]": currency,
          "metadata[temp_user]": userId ? "false" : "true"
        };
        if (customerId) {
          checkoutParams.customer = customerId;
        } else {
          if (currency !== "USD" && email) {
            const countryCode = Object.values(locales).find((locale) => locale.currency === currency)?.locale?.split("-")[1]?.toUpperCase();
            if (countryCode) {
              let testEmail = email;
              testEmail = testEmail.replace("@", `+location_${countryCode}@`);
              checkoutParams.customer_email = testEmail;
            }
          }
        }
        let language = "en";
        if (currency === "TRY") {
          language = "tr";
        }
        const description = plan?.description?.[language] || plan?.description?.en || "Morse Code Course";
        const basePrice = plan?.price;
        if (!basePrice) {
          return new Response(JSON.stringify({ error: "Plan not found" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }
        const currencyCode = Object.values(locales).find((locale) => locale.currency === currency)?.currency?.toLowerCase() || currency.toLowerCase();
        if (promoCode) {
          checkoutParams["line_items[0][price]"] = priceId;
          checkoutParams["line_items[0][quantity]"] = "1";
        } else {
          checkoutParams["line_items[0][price_data][currency]"] = currencyCode;
          checkoutParams["line_items[0][price_data][unit_amount]"] = basePrice.amount.toString();
          checkoutParams["line_items[0][price_data][product_data][name]"] = plan.name?.[language] || plan.name?.en || "Morse Code Course";
          checkoutParams["line_items[0][price_data][product_data][description]"] = description;
          checkoutParams["line_items[0][quantity]"] = "1";
        }
        if (promoCode) {
          checkoutParams["discounts[0][promotion_code]"] = promoCode;
        }
        const checkoutResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${stripeSecretKey}`,
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams(checkoutParams)
        });
        if (!checkoutResponse.ok) {
          console.error("Failed to create checkout session:", await checkoutResponse.text());
          return new Response(JSON.stringify({ error: "Failed to create checkout session" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
        const session = await checkoutResponse.json();
        return new Response(JSON.stringify({
          url: session.url
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      } catch (error) {
        console.error("Error creating checkout session:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }, "onRequest");
  }
});
async function verifyJwt2(token, secret) {
  try {
    const [headerB64, payloadB64, signatureB64] = token.split(".");
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const dataToVerify = encoder.encode(`${headerB64}.${payloadB64}`);
    const signature = Uint8Array.from(atob(signatureB64.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
    const isValid = await crypto.subtle.verify("HMAC", key, signature, dataToVerify);
    if (!isValid) {
      throw new Error("Invalid signature");
    }
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1e3)) {
      throw new Error("Token expired");
    }
    return payload;
  } catch (error) {
    throw new Error("Invalid token");
  }
}
__name(verifyJwt2, "verifyJwt2");
function parseCookies7(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach((cookie) => {
    const [name, value] = cookie.trim().split("=");
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });
  return cookies;
}
__name(parseCookies7, "parseCookies7");
async function getUserByEmail(db, email) {
  return await db.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
}
__name(getUserByEmail, "getUserByEmail");
var onRequest2;
var init_create_portal_session = __esm({
  "api/stripe/create-portal-session.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    __name2(verifyJwt2, "verifyJwt");
    __name2(parseCookies7, "parseCookies");
    __name2(getUserByEmail, "getUserByEmail");
    onRequest2 = /* @__PURE__ */ __name2(async (context) => {
      try {
        const { request, env } = context;
        const cookies = parseCookies7(request.headers.get("Cookie"));
        const token = cookies["auth-token"];
        if (!token) {
          return new Response(JSON.stringify({ error: "No authentication token" }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
          });
        }
        const jwtSecret = env.JWT_SECRET;
        const stripeSecretKey = env.STRIPE_SECRET_KEY;
        if (!jwtSecret || !stripeSecretKey) {
          return new Response(JSON.stringify({ error: "Server configuration error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
        try {
          const decoded = await verifyJwt2(token, jwtSecret);
          const db = env.DB;
          if (!db) {
            return new Response(JSON.stringify({ error: "Database not available" }), {
              status: 500,
              headers: { "Content-Type": "application/json" }
            });
          }
          const user = await getUserByEmail(db, decoded.email);
          if (!user || !user.stripe_customer_id) {
            return new Response(JSON.stringify({ error: "No active subscription found" }), {
              status: 404,
              headers: { "Content-Type": "application/json" }
            });
          }
          const portalResponse = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${stripeSecretKey}`,
              "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
              customer: user.stripe_customer_id,
              return_url: `${env.SITE_URL || "http://localhost:3000"}/profile`
            })
          });
          if (!portalResponse.ok) {
            console.error("Failed to create portal session:", await portalResponse.text());
            return new Response(JSON.stringify({ error: "Failed to create portal session" }), {
              status: 500,
              headers: { "Content-Type": "application/json" }
            });
          }
          const session = await portalResponse.json();
          return new Response(JSON.stringify({
            url: session.url
          }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        } catch (jwtError) {
          return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
          });
        }
      } catch (error) {
        console.error("Error creating portal session:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }, "onRequest");
  }
});
async function createUserAccount(db, email, loginMethod, stripeCustomerId) {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO users (email, preferred_login_method, stripe_customer_id, created_at, updated_at)
    VALUES (?, ?, ?, datetime('now'), datetime('now'))
  `);
  const result = await stmt.bind(email, loginMethod, stripeCustomerId || null).run();
  const user = await db.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
  const isNewUser = result.changes > 0;
  return { user, isNewUser };
}
__name(createUserAccount, "createUserAccount");
async function updateStripeCustomerId(db, email, stripeCustomerId) {
  await db.prepare(`
    UPDATE users 
    SET stripe_customer_id = ?, updated_at = datetime('now')
    WHERE email = ?
  `).bind(stripeCustomerId, email).run();
}
__name(updateStripeCustomerId, "updateStripeCustomerId");
var onRequest3;
var init_create_user_account = __esm({
  "api/stripe/create-user-account.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    init_jwt();
    __name2(createUserAccount, "createUserAccount");
    __name2(updateStripeCustomerId, "updateStripeCustomerId");
    onRequest3 = /* @__PURE__ */ __name2(async (context) => {
      try {
        const { request, env } = context;
        const { email, loginMethod, sessionId } = await request.json();
        if (!email || !loginMethod) {
          return new Response(JSON.stringify({ error: "Email and login method are required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }
        const db = env.DB;
        if (!db) {
          return new Response(JSON.stringify({ error: "Database not available" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
        let stripeCustomerId = null;
        if (sessionId) {
          try {
            const stripeSecretKey = env.STRIPE_SECRET_KEY;
            if (stripeSecretKey) {
              const sessionResponse = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
                headers: {
                  "Authorization": `Bearer ${stripeSecretKey}`
                }
              });
              if (sessionResponse.ok) {
                const session = await sessionResponse.json();
                if (session.customer) {
                  stripeCustomerId = session.customer;
                }
              }
            }
          } catch (error) {
            console.error("Error fetching Stripe session:", error);
          }
        }
        const { user, isNewUser } = await createUserAccount(db, email.toLowerCase(), loginMethod, stripeCustomerId || void 0);
        if (stripeCustomerId && !isNewUser) {
          await updateStripeCustomerId(db, email.toLowerCase(), stripeCustomerId);
        }
        const jwtSecret = env.JWT_SECRET;
        if (!jwtSecret) {
          return new Response(JSON.stringify({ error: "JWT secret not configured" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
        const jwtToken = await signJwt4(
          {
            sub: user.id.toString(),
            email: user.email,
            login_method: loginMethod
          },
          jwtSecret,
          7 * 24 * 60 * 60
          // 7 days
        );
        const isProduction = env.SITE_URL?.startsWith("https://") || false;
        const secureFlag = isProduction ? "Secure; " : "";
        const headers = new Headers({
          "Content-Type": "application/json",
          "Set-Cookie": `auth-token=${jwtToken}; HttpOnly; Path=/; ${secureFlag}SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
        });
        return new Response(JSON.stringify({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            subscription_status: user.subscription_status
          },
          isNewUser
        }), {
          status: 200,
          headers
        });
      } catch (error) {
        console.error("Error creating user account:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }, "onRequest");
  }
});
async function handlePaymentWithoutCustomer(db, session, stripeSecretKey, resendApiKey) {
  try {
    const { customer_details, amount_total, currency, metadata } = session;
    if (!customer_details?.email) {
      console.error("No customer email found in session");
      return;
    }
    const email = customer_details.email.toLowerCase();
    if (resendApiKey) {
      try {
        await sendPaymentConfirmationEmail(email, {
          amount: amount_total / 100,
          // Convert from cents
          currency: currency.toUpperCase(),
          sessionId: session.id
        }, resendApiKey);
        console.log(`Payment confirmation email sent to: ${email}`);
      } catch (error) {
        console.error("Failed to send payment confirmation email:", error);
      }
    }
    let user = await db.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
    if (user) {
      console.log(`Found existing user for email: ${email}`);
      const customerResponse = await fetch("https://api.stripe.com/v1/customers", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${stripeSecretKey}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          email,
          name: customer_details.name || "Customer",
          "metadata[user_id]": user.id.toString(),
          "metadata[session_id]": session.id
        })
      });
      if (customerResponse.ok) {
        const customer = await customerResponse.json();
        await db.prepare(`
          UPDATE users 
          SET stripe_customer_id = ?, updated_at = datetime('now')
          WHERE id = ?
        `).bind(customer.id, user.id).run();
        await updateUserSubscription(db, customer.id, session);
        await createInvoiceRecord2(db, customer.id, session, stripeSecretKey);
        console.log(`Linked payment to existing user ${user.id} with new customer ${customer.id}`);
      }
    } else {
      console.log(`No existing user found for email: ${email} - storing payment for later linking`);
      await db.prepare(`
        INSERT INTO pending_payments (
          email, session_id, amount_total, currency, customer_name,
          created_at
        ) VALUES (?, ?, ?, ?, ?, datetime('now'))
      `).bind(
        email,
        session.id,
        amount_total,
        currency,
        customer_details.name || "Customer"
      ).run();
      console.log(`Stored pending payment for email: ${email}`);
    }
  } catch (error) {
    console.error("Error handling payment without customer:", error);
  }
}
__name(handlePaymentWithoutCustomer, "handlePaymentWithoutCustomer");
async function sendPaymentConfirmationEmail(email, payment, resendApiKey) {
  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "noreply@email.morsexpress.com",
      to: email,
      subject: "Payment Confirmation - MorseXpress",
      html: `
        <h2>Payment Confirmation</h2>
        <p>Thank you for your payment!</p>
        <p><strong>Amount:</strong> ${payment.currency} ${payment.amount}</p>
        <p><strong>Session ID:</strong> ${payment.sessionId}</p>
        <p>To access your purchase, please create an account or sign in with this email address.</p>
        <p><a href="https://morsexpress.com/auth?paid=true&session_id=${payment.sessionId}">Complete Your Account Setup</a></p>
      `
    })
  });
  if (!emailResponse.ok) {
    throw new Error(`Failed to send email: ${await emailResponse.text()}`);
  }
}
__name(sendPaymentConfirmationEmail, "sendPaymentConfirmationEmail");
async function updateUserSubscription(db, customerId, paymentData) {
  const { id, status, amount_total, currency, metadata } = paymentData;
  let planId = metadata?.plan_id || "basic";
  let subscriptionStatus = "free";
  if (amount_total === 1999) planId = "basic";
  else if (amount_total === 3999) planId = "pro";
  else if (amount_total === 7900) planId = "lifetime";
  if (planId === "basic") subscriptionStatus = "basic";
  else if (planId === "pro") subscriptionStatus = "active";
  else if (planId === "lifetime") subscriptionStatus = "lifetime";
  await db.prepare(`
    UPDATE users 
    SET 
      subscription_status = ?, 
      subscription_expires_at = datetime('now', '+1 year'),
      updated_at = datetime('now')
    WHERE stripe_customer_id = ?
  `).bind(subscriptionStatus, customerId).run();
}
__name(updateUserSubscription, "updateUserSubscription");
async function createInvoiceRecord2(db, customerId, paymentData, stripeSecretKey) {
  let user = await db.prepare("SELECT id, email, first_name, last_name FROM users WHERE stripe_customer_id = ?").bind(customerId).first();
  if (!user && stripeSecretKey) {
    try {
      const customerResponse = await fetch(`https://api.stripe.com/v1/customers/${customerId}`, {
        headers: {
          "Authorization": `Bearer ${stripeSecretKey}`
        }
      });
      if (customerResponse.ok) {
        const customer = await customerResponse.json();
        if (customer.email) {
          user = await db.prepare("SELECT id, email, first_name, last_name FROM users WHERE email = ?").bind(customer.email.toLowerCase()).first();
          if (user) {
            await db.prepare(`
              UPDATE users 
              SET stripe_customer_id = ?, updated_at = datetime('now')
              WHERE id = ?
            `).bind(customerId, user.id).run();
            console.log(`Linked existing user ${user.id} to Stripe customer ${customerId}`);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching Stripe customer for fallback:", error);
    }
  }
  if (!user) {
    console.error("User not found for Stripe customer:", customerId);
    return;
  }
  const billingAddress = await db.prepare(`
    SELECT * FROM user_billing_addresses WHERE user_id = ?
  `).bind(user.id).first();
  if (!billingAddress) {
    console.log(`User ${user.id} has no billing address, payment will be processed when address is added`);
    return;
  }
  const { createInvoiceRecord: generateInvoice } = await Promise.resolve().then(() => (init_invoice_generator(), invoice_generator_exports));
  const {
    id,
    amount_total,
    currency,
    description,
    metadata
  } = paymentData;
  const userName = user.first_name && user.last_name ? `${user.first_name} ${user.last_name}`.trim() : "Customer";
  const invoiceData = {
    userId: user.id,
    userEmail: user.email,
    userName,
    stripeCustomerId: customerId,
    stripeInvoiceId: id || `session_${Date.now()}`,
    amountPaid: amount_total || 0,
    currency: currency || "usd",
    description: description || "Premium Plan Purchase",
    billingAddress: {
      line1: billingAddress.line1,
      line2: billingAddress.line2,
      city: billingAddress.city,
      state: billingAddress.state,
      postalCode: billingAddress.postal_code,
      country: billingAddress.country,
      addressType: billingAddress.address_type,
      companyName: billingAddress.company_name,
      taxIdType: billingAddress.tax_id_type,
      taxIdNumber: billingAddress.tax_id_number
    }
  };
  await generateInvoice(db, invoiceData);
}
__name(createInvoiceRecord2, "createInvoiceRecord2");
async function verifyStripeSignature(payload, signature, secret) {
  try {
    const elements = signature.split(",");
    let timestamp = "";
    let v1 = "";
    for (const element of elements) {
      const [key2, value] = element.split("=");
      if (key2 === "t") timestamp = value;
      if (key2 === "v1") v1 = value;
    }
    if (!timestamp || !v1) return false;
    const signedPayload = `${timestamp}.${payload}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signature_buffer = await crypto.subtle.sign("HMAC", key, encoder.encode(signedPayload));
    const signature_array = new Uint8Array(signature_buffer);
    const signature_hex = Array.from(signature_array).map((b) => b.toString(16).padStart(2, "0")).join("");
    return signature_hex === v1;
  } catch (error) {
    console.error("Error verifying Stripe signature:", error);
    return false;
  }
}
__name(verifyStripeSignature, "verifyStripeSignature");
var onRequest4;
var init_webhook = __esm({
  "api/stripe/webhook.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    __name2(handlePaymentWithoutCustomer, "handlePaymentWithoutCustomer");
    __name2(sendPaymentConfirmationEmail, "sendPaymentConfirmationEmail");
    __name2(updateUserSubscription, "updateUserSubscription");
    __name2(createInvoiceRecord2, "createInvoiceRecord");
    __name2(verifyStripeSignature, "verifyStripeSignature");
    onRequest4 = /* @__PURE__ */ __name2(async (context) => {
      try {
        const { request, env } = context;
        const stripeWebhookSecret = env.STRIPE_WEBHOOK_SECRET;
        if (!stripeWebhookSecret) {
          console.error("STRIPE_WEBHOOK_SECRET not configured");
          return new Response("Webhook secret not configured", { status: 500 });
        }
        const body = await request.text();
        const signature = request.headers.get("stripe-signature");
        if (!signature) {
          console.error("Missing Stripe signature");
          return new Response("Missing signature", { status: 400 });
        }
        const isValid = await verifyStripeSignature(body, signature, stripeWebhookSecret);
        if (!isValid) {
          console.error("Invalid Stripe signature");
          return new Response("Invalid signature", { status: 400 });
        }
        const event = JSON.parse(body);
        console.log("Stripe webhook event:", event.type);
        const db = env.DB;
        if (!db) {
          console.error("Database not available");
          return new Response("Database error", { status: 500 });
        }
        try {
          switch (event.type) {
            case "checkout.session.completed": {
              const session = event.data.object;
              if (session.payment_status === "paid") {
                if (session.customer) {
                  await updateUserSubscription(db, session.customer, session);
                  await createInvoiceRecord2(db, session.customer, session, env.STRIPE_SECRET_KEY);
                  console.log(`Payment completed for customer: ${session.customer}`);
                } else {
                  console.log("Payment completed but no customer ID - creating customer from session data");
                  await handlePaymentWithoutCustomer(db, session, env.STRIPE_SECRET_KEY, env.RESEND_API_KEY);
                }
              }
              break;
            }
            case "payment_intent.succeeded": {
              const paymentIntent = event.data.object;
              if (paymentIntent.status === "succeeded") {
                if (paymentIntent.customer) {
                  await updateUserSubscription(db, paymentIntent.customer, paymentIntent);
                  await createInvoiceRecord2(db, paymentIntent.customer, paymentIntent, env.STRIPE_SECRET_KEY);
                  console.log(`Payment succeeded for customer: ${paymentIntent.customer}`);
                } else {
                  console.log("Payment succeeded but no customer ID - cannot process without customer");
                }
              }
              break;
            }
            case "payment_intent.payment_failed": {
              const paymentIntent = event.data.object;
              console.log(`Payment failed for customer: ${paymentIntent.customer}`);
              break;
            }
            case "invoice.payment_succeeded":
            case "invoice.payment_failed": {
              const invoice = event.data.object;
              await createInvoiceRecord2(db, invoice.customer, invoice);
              console.log(`Recorded invoice ${invoice.id} for customer: ${invoice.customer}`);
              break;
            }
            case "checkout.session.expired": {
              const session = event.data.object;
              console.log(`Checkout session expired: ${session.id}`);
              break;
            }
            default:
              console.log(`Unhandled event type: ${event.type}`);
          }
          return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        } catch (dbError) {
          console.error("Database error processing webhook:", dbError);
          return new Response("Database error", { status: 500 });
        }
      } catch (error) {
        console.error("Error processing Stripe webhook:", error);
        return new Response("Webhook error", { status: 500 });
      }
    }, "onRequest");
  }
});
async function onRequestOptions21() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
__name(onRequestOptions21, "onRequestOptions21");
async function onRequestGet24(context) {
  try {
    const { request, env, params } = context;
    const invoiceNumber = params.invoiceNumber;
    const cookieHeader = request.headers.get("Cookie");
    let token = null;
    if (cookieHeader) {
      const cookies = cookieHeader.split("; ");
      const authCookie = cookies.find((c) => c.startsWith("auth-token="));
      if (authCookie) {
        const encodedToken = authCookie.split("=")[1];
        token = decodeURIComponent(encodedToken);
      }
    }
    if (!token) {
      return new Response(JSON.stringify({ error: "No authentication token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const jwtSecret = env.JWT_SECRET;
    if (!jwtSecret) {
      return new Response(JSON.stringify({ error: "JWT secret not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    try {
      const payload = await verifyJwt(token, jwtSecret);
      if (!payload) {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
      const db = env.DB;
      if (!db) {
        return new Response(JSON.stringify({ error: "Database not available" }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
      const invoice = await db.prepare(`
        SELECT * FROM stripe_invoices 
        WHERE invoice_number = ? AND user_id = ?
      `).bind(invoiceNumber, payload.sub).first();
      if (!invoice) {
        return new Response(JSON.stringify({ error: "Invoice not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
      const url = new URL(request.url);
      const format = url.searchParams.get("format") || "json";
      if (format === "pdf") {
        const htmlContent = generateInvoiceHTML(invoice);
        return new Response(htmlContent, {
          status: 200,
          headers: {
            "Content-Type": "text/html",
            "Content-Disposition": `inline; filename="${invoice.invoice_number}.html"`
          }
        });
      } else {
        return new Response(JSON.stringify({
          invoice: {
            invoiceNumber: invoice.invoice_number,
            invoiceType: invoice.invoice_type,
            invoiceDate: invoice.invoice_date,
            dueDate: invoice.due_date,
            status: invoice.status,
            description: invoice.description,
            billingName: invoice.billing_name,
            billingEmail: invoice.billing_email,
            billingAddress: {
              line1: invoice.billing_address_line1,
              line2: invoice.billing_address_line2,
              city: invoice.billing_city,
              state: invoice.billing_state,
              postalCode: invoice.billing_postal_code,
              country: invoice.billing_country
            },
            amounts: {
              subtotal: invoice.subtotal_amount,
              taxRate: invoice.tax_rate,
              taxAmount: invoice.tax_amount,
              taxDescription: invoice.tax_description,
              total: invoice.total_amount,
              currency: invoice.currency
            },
            creditNoteForInvoiceId: invoice.credit_note_for_invoice_id,
            createdAt: invoice.created_at
          }
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
    } catch (jwtError) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    console.error("Error retrieving invoice:", error);
    return new Response(JSON.stringify({
      error: "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet24, "onRequestGet24");
function generateInvoiceHTML(invoice) {
  const isCredit = invoice.invoice_type === "credit_note";
  const amountPrefix = isCredit ? "-" : "";
  const documentTitle = isCredit ? "CREDIT NOTE" : "INVOICE";
  const formatAmount = /* @__PURE__ */ __name2((amount) => {
    const formatted = Math.abs(amount / 100).toFixed(2);
    return `${amountPrefix}$${formatted} ${(invoice.currency || "USD").toUpperCase()}`;
  }, "formatAmount");
  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${documentTitle} ${invoice.invoice_number}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * { box-sizing: border-box; }
        
        body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
            margin: 0; 
            padding: 40px; 
            color: #1a1a1a;
            line-height: 1.6;
            font-size: 14px;
        }
        
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
        }
        
        /* Header Section */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 30px;
            border-bottom: 3px solid #2563eb;
            margin-bottom: 40px;
        }
        
        .company-info {
            flex: 1;
        }
        
        .company-logo {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .company-name {
            font-size: 28px;
            font-weight: 700;
            color: #2563eb;
            margin-bottom: 8px;
        }
        
        .company-tagline {
            font-size: 16px;
            color: #6b7280;
            font-weight: 500;
            margin-bottom: 20px;
        }
        
        .company-details {
            font-size: 13px;
            color: #374151;
            line-height: 1.8;
        }
        
        .company-details strong {
            font-weight: 600;
            color: #1f2937;
        }
        
        .document-info {
            text-align: right;
            flex-shrink: 0;
            margin-left: 40px;
        }
        
        .document-title {
            font-size: 36px;
            font-weight: 700;
            color: ${isCredit ? "#dc2626" : "#2563eb"};
            margin-bottom: 10px;
            letter-spacing: -0.5px;
        }
        
        .document-subtitle {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 20px;
        }
        
        .document-meta {
            background: ${isCredit ? "#fef2f2" : "#eff6ff"};
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid ${isCredit ? "#dc2626" : "#2563eb"};
        }
        
        .document-meta-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        
        .document-meta-row:last-child {
            margin-bottom: 0;
        }
        
        .meta-label {
            font-weight: 500;
            color: #374151;
        }
        
        .meta-value {
            font-weight: 600;
            color: #1f2937;
        }
        
        /* Billing Section */
        .billing-section {
            display: flex;
            justify-content: space-between;
            margin: 40px 0;
            gap: 40px;
        }
        
        .billing-from, .billing-to {
            flex: 1;
        }
        
        .billing-header {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .billing-details {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }
        
        .billing-name {
            font-weight: 600;
            color: #1f2937;
            font-size: 16px;
            margin-bottom: 8px;
        }
        
        .billing-address {
            color: #374151;
            line-height: 1.7;
        }
        
        /* Line Items */
        .line-items {
            margin: 40px 0;
        }
        
        .line-items-header {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .items-table th {
            background: #f9fafb;
            padding: 16px;
            text-align: left;
            font-weight: 600;
            color: #374151;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-size: 12px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .items-table td {
            padding: 16px;
            border-bottom: 1px solid #e5e7eb;
            color: #1f2937;
        }
        
        .items-table .amount-cell {
            text-align: right;
            font-weight: 600;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
        }
        
        .credit-amount {
            color: #dc2626;
        }
        
        /* Totals Section */
        .totals-section {
            margin-top: 40px;
            display: flex;
            justify-content: flex-end;
        }
        
        .totals-table {
            width: 350px;
        }
        
        .total-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .total-row:last-child {
            border-bottom: none;
            border-top: 3px solid #2563eb;
            padding-top: 16px;
            margin-top: 8px;
            font-weight: 700;
            font-size: 18px;
        }
        
        .total-label {
            color: #374151;
        }
        
        .total-amount {
            font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
            font-weight: 600;
            color: #1f2937;
        }
        
        .final-total .total-amount {
            color: ${isCredit ? "#dc2626" : "#2563eb"};
        }
        
        /* Footer */
        .footer {
            margin-top: 60px;
            padding-top: 30px;
            border-top: 2px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }
        
        .footer-left {
            flex: 1;
        }
        
        .footer-note {
            font-size: 14px;
            color: #6b7280;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        
        .footer-legal {
            font-size: 11px;
            color: #9ca3af;
            line-height: 1.5;
        }
        
        .footer-right {
            text-align: right;
            margin-left: 40px;
        }
        
        .signature-section {
            margin-bottom: 20px;
        }
        
        .signature-label {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .signature-placeholder {
            width: 200px;
            height: 60px;
            border-bottom: 1px solid #d1d5db;
            position: relative;
        }
        
        .authorized-signature {
            font-size: 11px;
            color: #9ca3af;
            margin-top: 5px;
        }
        
        /* Print Styles */
        @media print {
            body { margin: 0; padding: 20px; }
            .invoice-container { box-shadow: none; }
            .print-controls { display: none !important; }
            .header { border-bottom: 2px solid #000 !important; }
            .document-title { color: #000 !important; }
            .company-name { color: #000 !important; }
        }
        
        /* Print Controls */
        .print-controls {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            border: 1px solid #e5e7eb;
        }
        
        .print-button {
            background: #2563eb;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            margin-right: 10px;
            font-family: inherit;
        }
        
        .print-button:hover {
            background: #1d4ed8;
        }
        
        .close-button {
            background: #6b7280;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            font-family: inherit;
        }
        
        .close-button:hover {
            background: #4b5563;
        }
        
        /* Credit Note Specific Styles */
        .credit-notice {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 16px;
            margin: 30px 0;
            color: #991b1b;
            font-weight: 500;
        }
    </style>
</head>
<body>
    <!-- Print Controls -->
    <div class="print-controls">
        <button class="print-button" onclick="window.print()">Print / Save as PDF</button>
        <button class="close-button" onclick="window.close()">Close</button>
    </div>
    
    <div class="invoice-container">
        <!-- Header -->
        <div class="header">
            <div class="company-info">
                <div class="company-logo">
                    <!-- Logo would go here -->
                </div>
                <div class="company-name">MorseXpress</div>
                <div class="company-tagline">Master Morse Code Faster</div>
                <div class="company-details">
                    <strong>Affensus Limited</strong><br>
                    UNIT B, 3/F., KAI WAN HOUSE,<br>
                    146 TUNG CHOI STREET,<br>
                    MONGKOK, KLN<br>
                    Hong Kong<br><br>
                    <strong>Company Registration:</strong> 76782638-000-07-24-4
                </div>
            </div>
            
            <div class="document-info">
                <div class="document-title">${documentTitle}</div>
                <div class="document-subtitle">${isCredit ? "Refund Credit Note" : "Payment Invoice"}</div>
                <div class="document-meta">
                    <div class="document-meta-row">
                        <span class="meta-label">${documentTitle} #:</span>
                        <span class="meta-value">${invoice.invoice_number}</span>
                    </div>
                    <div class="document-meta-row">
                        <span class="meta-label">Date:</span>
                        <span class="meta-value">${new Date(invoice.invoice_date || invoice.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })}</span>
                    </div>
                    <div class="document-meta-row">
                        <span class="meta-label">Due Date:</span>
                        <span class="meta-value">${new Date(invoice.due_date || invoice.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })}</span>
                    </div>
                    <div class="document-meta-row">
                        <span class="meta-label">Status:</span>
                        <span class="meta-value">${(invoice.status || "PAID").toUpperCase()}</span>
                    </div>
                </div>
            </div>
        </div>
        
        ${isCredit ? `
        <div class="credit-notice">
            <strong>\u26A0\uFE0F Credit Note Notice:</strong> This document represents a refund issued for your original purchase. 
            The refund amount will be credited back to your original payment method within 3-5 business days.
        </div>
        ` : ""}
        
        <!-- Billing Information -->
        <div class="billing-section">
            <div class="billing-from">
                <div class="billing-header">From</div>
                <div class="billing-details">
                    <div class="billing-name">Affensus Limited</div>
                    <div class="billing-address">
                        UNIT B, 3/F., KAI WAN HOUSE<br>
                        146 TUNG CHOI STREET<br>
                        MONGKOK, KLN<br>
                        Hong Kong<br><br>
                        <strong>Registration:</strong> 76782638-000-07-24-4<br>
                        <strong>Contact:</strong> support@morsexpress.com
                    </div>
                </div>
            </div>
            
            <div class="billing-to">
                <div class="billing-header">Bill To</div>
                <div class="billing-details">
                    <div class="billing-name">${invoice.billing_name || "Customer"}</div>
                    <div class="billing-address">
                        ${invoice.billing_email || ""}<br>
                        ${invoice.billing_address_line1 || ""}<br>
                        ${invoice.billing_address_line2 ? invoice.billing_address_line2 + "<br>" : ""}
                        ${invoice.billing_city || ""}, ${invoice.billing_state || ""} ${invoice.billing_postal_code || ""}<br>
                        ${invoice.billing_country || ""}
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Line Items -->
        <div class="line-items">
            <div class="line-items-header">Items & Services</div>
            <table class="items-table">
                <thead>
                    <tr>
                        <th style="width: 70%;">Description</th>
                        <th style="width: 30%;" class="amount-cell">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <strong>${invoice.description || "MorseXpress Premium Subscription"}</strong><br>
                            <span style="color: #6b7280; font-size: 13px;">
                                ${isCredit ? "Refund for premium subscription purchase" : "One-time payment for premium features and content"}
                            </span>
                        </td>
                        <td class="amount-cell ${isCredit ? "credit-amount" : ""}">
                            ${formatAmount(invoice.subtotal_amount || invoice.total_amount || invoice.amount_paid)}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- Totals -->
        <div class="totals-section">
            <div class="totals-table">
                <div class="total-row">
                    <span class="total-label">Subtotal:</span>
                    <span class="total-amount ${isCredit ? "credit-amount" : ""}">
                        ${formatAmount(invoice.subtotal_amount || invoice.total_amount || invoice.amount_paid)}
                    </span>
                </div>
                <div class="total-row">
                    <span class="total-label">Tax (${invoice.tax_rate || 0}%):</span>
                    <span class="total-amount ${isCredit ? "credit-amount" : ""}">
                        ${formatAmount(invoice.tax_amount || 0)}
                    </span>
                </div>
                ${invoice.tax_description ? `
                <div class="total-row" style="border: none; padding: 4px 0; font-size: 12px;">
                    <span class="total-label" style="color: #6b7280;">${invoice.tax_description}</span>
                    <span></span>
                </div>
                ` : ""}
                <div class="total-row final-total">
                    <span class="total-label">Total:</span>
                    <span class="total-amount ${isCredit ? "credit-amount" : ""}">
                        ${formatAmount(invoice.total_amount || invoice.amount_paid)}
                    </span>
                </div>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="footer-left">
                <div class="footer-note">
                    ${isCredit ? `<strong>Refund processed successfully.</strong> We're sorry to see you go! Your refund will be credited back to your original payment method within 3-5 business days.` : `Thank you for choosing MorseXpress! Your payment enables us to continue providing quality Morse code education and tools.`}
                </div>
                <div class="footer-legal">
                    This ${documentTitle.toLowerCase()} was generated on ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })}.<br>
                    ${isCredit ? "This is an official credit note for refund processing." : "This is an official invoice for services rendered."}<br>
                    Affensus Limited \u2022 Hong Kong Company Registration: 76782638-000-07-24-4
                </div>
            </div>
            
            <div class="footer-right">
                <div class="signature-section">
                    <div class="signature-label">Authorized Signature</div>
                    <div class="signature-placeholder"></div>
                    <div class="authorized-signature">Affensus Limited</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
  return html;
}
__name(generateInvoiceHTML, "generateInvoiceHTML");
var init_invoiceNumber = __esm({
  "api/invoice/[invoiceNumber].ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    init_jwt();
    __name2(onRequestOptions21, "onRequestOptions");
    __name2(onRequestGet24, "onRequestGet");
    __name2(generateInvoiceHTML, "generateInvoiceHTML");
  }
});
async function onRequestOptions22() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
__name(onRequestOptions22, "onRequestOptions22");
async function onRequestGet25(context) {
  try {
    const { request, env, params } = context;
    const userId = params.userId;
    if (!userId) {
      return new Response(JSON.stringify({
        success: false,
        error: "User ID is required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const bearerToken = env.AFFENSUS_CREDENTIALS_PASSWORD;
    if (!bearerToken) {
      throw new Error("AFFENSUS_CREDENTIALS_PASSWORD not configured");
    }
    console.log("Making API request to:", `https://apiv2.affensus.com/api/users/${userId}`);
    console.log("Headers:", {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${bearerToken.substring(0, 8)}...`
    });
    let response;
    try {
      response = await fetch(`https://apiv2.affensus.com/api/users/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${bearerToken}`
        }
      });
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      const errorMessage = fetchError instanceof Error ? fetchError.message : "Unknown fetch error";
      throw new Error(`Network error: ${errorMessage}`);
    }
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Response Error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`External API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const data = await response.json();
    return new Response(JSON.stringify({
      success: true,
      data
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, max-age=300, s-maxage=0"
        // 5 minutes cache for user data
      }
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to fetch user data"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet25, "onRequestGet25");
var init_userId = __esm({
  "api/users/[userId]/index.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    __name2(onRequestOptions22, "onRequestOptions");
    __name2(onRequestGet25, "onRequestGet");
  }
});
async function onRequestPost7(context) {
  try {
    const { request, env } = context;
    const { name, email, message } = await request.json();
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (message.length > 5e3) {
      return new Response(JSON.stringify({ error: "Message too long" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    console.log(`Contact form submission from ${email}:`, {
      name,
      email,
      message: message.substring(0, 100) + (message.length > 100 ? "..." : "")
    });
    return new Response(JSON.stringify({
      message: "Thank you for your message. We'll get back to you soon!"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error processing contact form:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost7, "onRequestPost7");
var init_contact = __esm({
  "api/contact/index.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    __name2(onRequestPost7, "onRequestPost");
  }
});
async function onRequestOptions23() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
__name(onRequestOptions23, "onRequestOptions23");
async function onRequestGet26(context) {
  try {
    const { request, env } = context;
    const bearerToken = env.AFFENSUS_CREDENTIALS_PASSWORD;
    if (!bearerToken) {
      throw new Error("AFFENSUS_CREDENTIALS_PASSWORD not configured");
    }
    let response;
    try {
      response = await fetch("https://apiv2.affensus.com/api/credential-schemas", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${bearerToken}`
        }
      });
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      const errorMessage = fetchError instanceof Error ? fetchError.message : "Unknown fetch error";
      throw new Error(`Network error: ${errorMessage}`);
    }
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Response Error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`External API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const data = await response.json();
    return new Response(JSON.stringify({
      success: true,
      data
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error fetching credential schemas:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet26, "onRequestGet26");
var init_credential_schemas = __esm({
  "api/credential-schemas.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    __name2(onRequestOptions23, "onRequestOptions");
    __name2(onRequestGet26, "onRequestGet");
  }
});
async function onRequestOptions24() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
__name(onRequestOptions24, "onRequestOptions24");
async function onRequestPost8(context) {
  const { request, env } = context;
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({
        success: false,
        error: "Authentication required"
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const body = await request.json();
    const { encryptedCredentials } = body;
    if (!encryptedCredentials) {
      return new Response(JSON.stringify({
        success: false,
        error: "Encrypted credentials required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const password = env.AFFENSUS_CREDENTIALS_PASSWORD;
    if (!password) {
      return new Response(JSON.stringify({
        success: false,
        error: "Decryption key not configured"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    const CryptoJS3 = await Promise.resolve().then(() => __toESM(require_crypto_js()));
    let decryptedCredentials = {};
    try {
      console.log("Attempting to decrypt credentials...");
      console.log("Encrypted data length:", encryptedCredentials.length);
      console.log("First 50 chars:", encryptedCredentials.substring(0, 50));
      const bytes = CryptoJS3.AES.decrypt(encryptedCredentials, password);
      const decryptedString = bytes.toString(CryptoJS3.enc.Utf8);
      console.log("Decrypted string length:", decryptedString.length);
      if (!decryptedString) {
        throw new Error("Decryption resulted in empty string");
      }
      decryptedCredentials = JSON.parse(decryptedString);
      console.log("Successfully decrypted and parsed credentials");
    } catch (decryptError) {
      console.error("Decryption failed:", decryptError);
      return new Response(JSON.stringify({
        success: false,
        error: "Failed to decrypt credentials"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({
      success: true,
      data: decryptedCredentials
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate"
      }
    });
  } catch (error) {
    console.error("Error decrypting credentials:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost8, "onRequestPost8");
var init_decrypt_credentials = __esm({
  "api/decrypt-credentials.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    __name2(onRequestOptions24, "onRequestOptions");
    __name2(onRequestPost8, "onRequestPost");
  }
});
async function onRequestOptions25() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
__name(onRequestOptions25, "onRequestOptions25");
async function onRequestPost9(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    if (!body.credential_id) {
      return new Response(JSON.stringify({ error: "credential_id is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const bearerToken = env.AFFENSUS_CREDENTIALS_PASSWORD;
    if (!bearerToken) {
      throw new Error("AFFENSUS_CREDENTIALS_PASSWORD not configured");
    }
    console.log("Sending import network request:", body);
    const response = await fetch("https://apiv2.affensus.com/api/import-network", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${bearerToken}`
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Import network API error:", response.status, response.statusText, errorText);
      return new Response(JSON.stringify({ error: "Failed to start import job", details: errorText }), {
        status: response.status,
        headers: { "Content-Type": "application/json" }
      });
    }
    const data = await response.json();
    console.log("Import network response:", data);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, max-age=0"
      }
    });
  } catch (error) {
    console.error("Import network error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost9, "onRequestPost9");
var init_import_network = __esm({
  "api/import-network.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    __name2(onRequestOptions25, "onRequestOptions");
    __name2(onRequestPost9, "onRequestPost");
  }
});
async function onRequestOptions26() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
__name(onRequestOptions26, "onRequestOptions26");
async function onRequestPost10(context) {
  try {
    const { request, env } = context;
    const requestBody = await request.json();
    const { url } = requestBody;
    if (!url) {
      return new Response(JSON.stringify({
        success: false,
        error: "URL is required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const bearerToken = env.AFFENSUS_CREDENTIALS_PASSWORD;
    if (!bearerToken) {
      throw new Error("AFFENSUS_CREDENTIALS_PASSWORD not configured");
    }
    const apiUrl = `https://apiv2.affensus.com/api/get-logo`;
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${bearerToken}`
      },
      body: JSON.stringify({ url })
    });
    console.log("url", JSON.stringify({ url }));
    console.log("response", response);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`External API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const data = await response.json();
    return new Response(JSON.stringify({
      success: true,
      data
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, max-age=0, s-maxage=0"
      }
    });
  } catch (error) {
    console.error("Error fetching logo:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to fetch logo"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost10, "onRequestPost10");
var init_logo = __esm({
  "api/logo/index.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    __name2(onRequestOptions26, "onRequestOptions");
    __name2(onRequestPost10, "onRequestPost");
  }
});
async function onRequestPost11(context) {
  const { env } = context;
  const isProduction = env.SITE_URL?.startsWith("https://") || false;
  const secureFlag = isProduction ? "Secure; " : "";
  const clearCookieHeader = `auth-token=; HttpOnly; ${secureFlag}SameSite=Lax; Max-Age=0; Path=/`;
  console.log("\u{1F6AA} Clearing auth cookie:", clearCookieHeader);
  const response = new Response(JSON.stringify({ message: "Logged out successfully" }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
  response.headers.set("Set-Cookie", clearCookieHeader);
  return response;
}
__name(onRequestPost11, "onRequestPost11");
var init_logout = __esm({
  "api/logout/index.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    __name2(onRequestPost11, "onRequestPost");
  }
});
async function signJwt5(payload, secret, expiresIn) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1e3);
  const exp = now + expiresIn;
  const jwtPayload = { ...payload, iat: now, exp };
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const payloadB64 = btoa(JSON.stringify(jwtPayload)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const signatureArrayBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`${headerB64}.${payloadB64}`)
  );
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signatureArrayBuffer))).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  return `${headerB64}.${payloadB64}.${signatureB64}`;
}
__name(signJwt5, "signJwt5");
async function getMagicLinkByToken(token, apiKey) {
  try {
    const response = await fetch(`https://apiv2.affensus.com/api/auth/magic-link/${token}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    if (data.used || new Date(data.expires_at) <= /* @__PURE__ */ new Date()) {
      return null;
    }
    return data;
  } catch (error) {
    console.error("Error fetching magic link:", error);
    return null;
  }
}
__name(getMagicLinkByToken, "getMagicLinkByToken");
async function markMagicLinkAsUsed(token, apiKey) {
  try {
    const response = await fetch(`https://apiv2.affensus.com/api/auth/magic-link/${token}/use`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to mark magic link as used: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error("Error marking magic link as used:", error);
    return false;
  }
}
__name(markMagicLinkAsUsed, "markMagicLinkAsUsed");
async function getUserByEmail2(email, apiKey) {
  try {
    const response = await fetch(`https://apiv2.affensus.com/api/auth/user/email/${encodeURIComponent(email)}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
}
__name(getUserByEmail2, "getUserByEmail2");
async function updatePreferredLoginMethod(email, method, apiKey) {
  try {
    const response = await fetch(`https://apiv2.affensus.com/api/auth/user/preferred-login-method`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        method
      })
    });
    if (!response.ok) {
      throw new Error(`Failed to update login method: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error("Error updating preferred login method:", error);
    return false;
  }
}
__name(updatePreferredLoginMethod, "updatePreferredLoginMethod");
async function processPendingPayments3(email, userId, stripeSecretKey) {
  try {
    console.log(`Processing pending payments for user ${userId} (${email})`);
  } catch (error) {
    console.error("Error processing pending payments:", error);
  }
}
__name(processPendingPayments3, "processPendingPayments3");
async function onRequestGet27(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    if (!token) {
      return new Response(null, {
        status: 302,
        headers: { "Location": `${env.SITE_URL || "http://localhost:3000"}/auth?error=missing_token` }
      });
    }
    const apiKey = env.AFFENSUS_CREDENTIALS_PASSWORD;
    if (!apiKey) {
      return new Response(null, {
        status: 302,
        headers: { "Location": `${env.SITE_URL || "http://localhost:3000"}/auth?error=api_not_configured` }
      });
    }
    try {
      const magicLink = await getMagicLinkByToken(token, apiKey);
      if (!magicLink) {
        return new Response(null, {
          status: 302,
          headers: { "Location": `${env.SITE_URL || "http://localhost:3000"}/auth?error=invalid_or_expired_token` }
        });
      }
      const markedAsUsed = await markMagicLinkAsUsed(token, apiKey);
      if (!markedAsUsed) {
        console.error("Failed to mark magic link as used");
      }
      const user = await getUserByEmail2(magicLink.email, apiKey);
      if (!user) {
        return new Response(null, {
          status: 302,
          headers: { "Location": `${env.SITE_URL || "http://localhost:3000"}/auth?error=user_not_found` }
        });
      }
      const loginMethodUpdated = await updatePreferredLoginMethod(user.email, "magic_link", apiKey);
      if (!loginMethodUpdated) {
        console.error("Failed to update preferred login method");
      }
      await processPendingPayments3(user.email, user.id, env.STRIPE_SECRET_KEY);
      const jwtSecret = env.JWT_SECRET;
      if (!jwtSecret) {
        return new Response(null, {
          status: 302,
          headers: { "Location": `${env.SITE_URL || "http://localhost:3000"}/auth?error=jwt_not_configured` }
        });
      }
      const jwtToken = await signJwt5(
        {
          sub: user.id.toString(),
          email: user.email,
          login_method: "magic_link"
        },
        jwtSecret,
        7 * 24 * 60 * 60
        // 7 days
      );
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Redirecting...</title>
        </head>
        <body>
          <script>
            localStorage.setItem('lastLoginMethod', 'magic_link');
            localStorage.setItem('lastLoginTime', new Date().toISOString());
            window.location.href = '${env.SITE_URL || "http://localhost:3000"}/auth';
          <\/script>
          <p>Redirecting...</p>
        </body>
        </html>
      `;
      const isProduction = env.SITE_URL?.startsWith("https://") || false;
      const cookieFlags = `HttpOnly; ${isProduction ? "Secure; " : ""}SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}; Path=/`;
      const cookieHeader = `auth-token=${jwtToken}; ${cookieFlags}`;
      console.log("\u{1F36A} Setting cookie:", cookieHeader);
      console.log("\u{1F511} JWT Token (first 20 chars):", jwtToken.substring(0, 20));
      console.log("\u{1F4CD} Is Production:", isProduction);
      return new Response(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html",
          "Set-Cookie": cookieHeader
        }
      });
    } catch (apiError) {
      console.error("API error:", apiError);
      return new Response(null, {
        status: 302,
        headers: { "Location": `${env.SITE_URL || "http://localhost:3000"}/auth?error=api_error` }
      });
    }
  } catch (error) {
    console.error("Error processing magic login:", error);
    return new Response(null, {
      status: 302,
      headers: { "Location": `${context.env.SITE_URL || "http://localhost:3000"}/auth?error=internal_error` }
    });
  }
}
__name(onRequestGet27, "onRequestGet27");
var init_magic_login = __esm({
  "api/magic-login/index.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    __name2(signJwt5, "signJwt");
    __name2(getMagicLinkByToken, "getMagicLinkByToken");
    __name2(markMagicLinkAsUsed, "markMagicLinkAsUsed");
    __name2(getUserByEmail2, "getUserByEmail");
    __name2(updatePreferredLoginMethod, "updatePreferredLoginMethod");
    __name2(processPendingPayments3, "processPendingPayments");
    __name2(onRequestGet27, "onRequestGet");
  }
});
async function onRequestPost12(context) {
  try {
    const { request, env } = context;
    const {
      category,
      word,
      morseCode,
      description,
      userEmail,
      locale = "en"
    } = await request.json();
    if (!category || !word || !description) {
      return new Response(JSON.stringify({
        error: "Missing required fields"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const validCategories = [
      "animals",
      "basic-needs",
      "colors",
      "commands",
      "communication",
      "countries",
      "emergency",
      "family-friends",
      "farewells",
      "fashion",
      "feel-good-words",
      "feelings",
      "food-drink",
      "greetings",
      "inspirational-motivational",
      "internet-slang",
      "military-tactical",
      "nature",
      "navigation",
      "occupations",
      "questions",
      "responses",
      "romantic-personal",
      "sports-games",
      "tattoo",
      "technology",
      "travel-transport",
      "tv-games",
      "weather"
    ];
    if (!validCategories.includes(category)) {
      return new Response(JSON.stringify({
        error: "Invalid category"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (description.length > 1e3) {
      return new Response(JSON.stringify({
        error: "Description too long (max 1000 characters)"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    console.log(`Mistake report for ${category}/${word}:`, {
      category,
      word,
      morseCode,
      description: description.substring(0, 100) + (description.length > 100 ? "..." : ""),
      userEmail,
      locale,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    return new Response(JSON.stringify({
      message: "Thank you for reporting this issue. We'll review it and make corrections if necessary."
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error processing mistake report:", error);
    return new Response(JSON.stringify({
      error: "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost12, "onRequestPost12");
var init_mistake_report = __esm({
  "api/mistake-report/index.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    __name2(onRequestPost12, "onRequestPost");
  }
});
async function onRequestOptions27() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
__name(onRequestOptions27, "onRequestOptions27");
async function onRequestGet28(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId") || "demo-user";
    const bearerToken = env.AFFENSUS_CREDENTIALS_PASSWORD;
    if (!bearerToken) {
      throw new Error("AFFENSUS_CREDENTIALS_PASSWORD not configured");
    }
    console.log("Making API request to:", "https://apiv2.affensus.com/api/network-monitors");
    console.log("Headers:", {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${bearerToken.substring(0, 8)}...`
    });
    try {
      const testResponse = await fetch("https://apiv2.affensus.com/health", { method: "GET" });
      console.log("Health check response:", testResponse.status);
    } catch (healthError) {
      console.log("Health check failed:", healthError);
    }
    let response;
    try {
      response = await fetch(`https://apiv2.affensus.com/api/network-monitors?user_id=${encodeURIComponent(userId)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${bearerToken}`
        }
      });
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      const errorMessage = fetchError instanceof Error ? fetchError.message : "Unknown fetch error";
      throw new Error(`Network error: ${errorMessage}`);
    }
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Response Error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`External API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const data = await response.json();
    const monitorsArray = Array.isArray(data) ? data : data.monitors || data.data || [];
    return new Response(JSON.stringify({
      success: true,
      data: monitorsArray
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error fetching network monitors:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to fetch network monitors"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet28, "onRequestGet28");
async function onRequestPost13(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    if (!body.user_id || !body.domain && !body.dashboard_id) {
      return new Response(JSON.stringify({
        success: false,
        error: "user_id and either domain or dashboard_id are required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const bearerToken = env.AFFENSUS_CREDENTIALS_PASSWORD;
    if (!bearerToken) {
      throw new Error("AFFENSUS_CREDENTIALS_PASSWORD not configured");
    }
    console.log("Making API request to:", "https://apiv2.affensus.com/api/network-monitors");
    console.log("Request body:", {
      user_id: body.user_id,
      domain: body.domain,
      dashboard_id: body.dashboard_id || body.domain
    });
    console.log("Headers:", {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${bearerToken.substring(0, 8)}...`
    });
    let response;
    try {
      response = await fetch("https://apiv2.affensus.com/api/network-monitors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${bearerToken}`
        },
        body: JSON.stringify({
          user_id: body.user_id,
          domain: body.domain,
          dashboard_id: body.dashboard_id || body.domain
          // Use dashboard_id if provided, otherwise fallback to domain
        })
      });
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      const errorMessage = fetchError instanceof Error ? fetchError.message : "Unknown fetch error";
      throw new Error(`Network error: ${errorMessage}`);
    }
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Response Error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`External API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const data = await response.json();
    return new Response(JSON.stringify({
      success: true,
      data
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error creating network monitor:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to create network monitor"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost13, "onRequestPost13");
async function onRequestPut5(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    if (!body.id || !body.user_id) {
      return new Response(JSON.stringify({
        success: false,
        error: "id and user_id are required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const bearerToken = env.AFFENSUS_CREDENTIALS_PASSWORD;
    if (!bearerToken) {
      throw new Error("AFFENSUS_CREDENTIALS_PASSWORD not configured");
    }
    const response = await fetch(`https://apiv2.affensus.com/api/network-monitors/${body.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${bearerToken}`
      },
      body: JSON.stringify({
        user_id: body.user_id,
        enabled: body.enabled,
        display_name: body.display_name,
        notification_enabled: body.notification_enabled,
        check_interval_minutes: body.check_interval_minutes
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Response Error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`External API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const data = await response.json();
    return new Response(JSON.stringify({
      success: true,
      data
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error updating network monitor:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to update network monitor"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPut5, "onRequestPut5");
async function onRequestDelete2(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    if (!body.id || !body.user_id) {
      return new Response(JSON.stringify({
        success: false,
        error: "id and user_id are required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const bearerToken = env.AFFENSUS_CREDENTIALS_PASSWORD;
    if (!bearerToken) {
      throw new Error("AFFENSUS_CREDENTIALS_PASSWORD not configured");
    }
    const response = await fetch(`https://apiv2.affensus.com/api/network-monitors/${body.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${bearerToken}`
      },
      body: JSON.stringify({
        user_id: body.user_id
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Response Error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`External API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const data = await response.json();
    return new Response(JSON.stringify({
      success: true,
      message: "Monitor deleted successfully"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error deleting network monitor:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to delete network monitor"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestDelete2, "onRequestDelete2");
var init_network_monitors = __esm({
  "api/network-monitors/index.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    __name2(onRequestOptions27, "onRequestOptions");
    __name2(onRequestGet28, "onRequestGet");
    __name2(onRequestPost13, "onRequestPost");
    __name2(onRequestPut5, "onRequestPut");
    __name2(onRequestDelete2, "onRequestDelete");
  }
});
function parseCookies8(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  const cookiePairs = cookieHeader.split("; ");
  for (const cookie of cookiePairs) {
    const [name, ...rest] = cookie.split("=");
    if (name && rest.length > 0) {
      const value = rest.join("=");
      cookies[name] = decodeURIComponent(value);
    }
  }
  return cookies;
}
__name(parseCookies8, "parseCookies8");
async function getUserById2(db, userId) {
  return await db.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first();
}
__name(getUserById2, "getUserById2");
async function updateUser(db, userId, data) {
  const { firstName, lastName } = data;
  await db.prepare(`
    UPDATE users 
    SET first_name = ?, last_name = ?, updated_at = datetime('now')
    WHERE id = ?
  `).bind(firstName, lastName, userId).run();
  return await getUserById2(db, userId);
}
__name(updateUser, "updateUser");
async function onRequestGet29(context) {
  try {
    const { request, env } = context;
    const cookies = parseCookies8(request.headers.get("Cookie"));
    const token = cookies["auth-token"];
    if (!token) {
      return new Response(JSON.stringify({ error: "No authentication token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const jwtSecret = env.JWT_SECRET;
    if (!jwtSecret) {
      return new Response(JSON.stringify({ error: "JWT secret not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    try {
      const decoded = await verifyJwt(token, jwtSecret);
      if (!decoded) {
        return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
      const db = env.DB;
      if (!db) {
        return new Response(JSON.stringify({ error: "Database not available" }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
      const user = await getUserById2(db, decoded.sub);
      if (!user) {
        return new Response(JSON.stringify({ error: "User not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
      const userProfile = {
        id: user.id.toString(),
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        avatarUrl: user.avatar_url,
        subscriptionStatus: user.subscription_status || "free",
        stripeCustomerId: user.stripe_customer_id,
        subscriptionExpiresAt: user.subscription_expires_at,
        trialEndsAt: user.trial_ends_at,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      };
      return new Response(JSON.stringify({
        user: userProfile
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (jwtError) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet29, "onRequestGet29");
async function onRequestPut6(context) {
  try {
    const { request, env } = context;
    const cookies = parseCookies8(request.headers.get("Cookie"));
    const token = cookies["auth-token"];
    if (!token) {
      return new Response(JSON.stringify({ error: "No authentication token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const jwtSecret = env.JWT_SECRET;
    if (!jwtSecret) {
      return new Response(JSON.stringify({ error: "JWT secret not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    try {
      const decoded = await verifyJwt(token, jwtSecret);
      if (!decoded) {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
      const updateData = await request.json();
      const db = env.DB;
      if (!db) {
        return new Response(JSON.stringify({ error: "Database not available" }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
      const updatedUser = await updateUser(db, decoded.sub, updateData);
      if (!updatedUser) {
        return new Response(JSON.stringify({ error: "Failed to update user" }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
      const userProfile = {
        id: updatedUser.id.toString(),
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        avatarUrl: updatedUser.avatar_url,
        subscriptionStatus: updatedUser.subscription_status || "free",
        stripeCustomerId: updatedUser.stripe_customer_id,
        subscriptionExpiresAt: updatedUser.subscription_expires_at,
        trialEndsAt: updatedUser.trial_ends_at,
        createdAt: updatedUser.created_at,
        updatedAt: updatedUser.updated_at
      };
      return new Response(JSON.stringify({
        user: userProfile
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (jwtError) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    console.error("Error updating user profile:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPut6, "onRequestPut6");
var init_profile = __esm({
  "api/profile/index.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    init_jwt();
    __name2(parseCookies8, "parseCookies");
    __name2(getUserById2, "getUserById");
    __name2(updateUser, "updateUser");
    __name2(onRequestGet29, "onRequestGet");
    __name2(onRequestPut6, "onRequestPut");
  }
});
async function onRequestOptions28() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
__name(onRequestOptions28, "onRequestOptions28");
async function onRequestPost14(context) {
  const { request, env } = context;
  try {
    const password = env.AFFENSUS_CREDENTIALS_PASSWORD;
    if (!password) {
      return new Response(JSON.stringify({
        success: false,
        error: "AFFENSUS_CREDENTIALS_PASSWORD not configured"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    const body = await request.json();
    const { project_id } = body;
    if (!project_id) {
      return new Response(JSON.stringify({
        success: false,
        error: "project_id is required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const apiUrl = "https://apiv2.affensus.com/api/refresh-published";
    const requestPayload = {
      projectId: project_id
    };
    console.log("Sending to apiv2:", JSON.stringify(requestPayload, null, 2));
    const apiv2Response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${password}`
        // Using same password as bearer token
      },
      body: JSON.stringify(requestPayload)
    });
    if (!apiv2Response.ok) {
      const errorText = await apiv2Response.text();
      console.error("apiv2 error response:", errorText);
      console.error("apiv2 status:", apiv2Response.status, apiv2Response.statusText);
      return new Response(JSON.stringify({
        success: false,
        error: `External API error: ${apiv2Response.status} ${apiv2Response.statusText}`,
        details: errorText
      }), {
        status: apiv2Response.status,
        headers: { "Content-Type": "application/json" }
      });
    }
    const responseData = await apiv2Response.json();
    const mappedResponse = {
      success: responseData.success,
      message: responseData.message,
      linkRot: {
        totalCount: responseData.totalCount,
        validCount: responseData.validCount,
        brokenLinks: responseData.brokenLinks || [],
        // Use the actual broken links data from the API
        unmatchedCount: responseData.unmatchedCount,
        inactiveNetworks: responseData.inactiveNetworks
      },
      stoppedLinks: responseData.invalidCount + responseData.unmatchedCount
    };
    return new Response(JSON.stringify(mappedResponse), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error refreshing published links:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost14, "onRequestPost14");
var init_refresh_published = __esm({
  "api/refresh-published/index.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    __name2(onRequestOptions28, "onRequestOptions");
    __name2(onRequestPost14, "onRequestPost");
  }
});
async function onRequestOptions29() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
__name(onRequestOptions29, "onRequestOptions29");
async function verifyJwt3(token, secret) {
  try {
    const [headerB64, payloadB64, signatureB64] = token.split(".");
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const dataToVerify = encoder.encode(`${headerB64}.${payloadB64}`);
    const signature = Uint8Array.from(atob(signatureB64.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
    const isValid = await crypto.subtle.verify("HMAC", key, signature, dataToVerify);
    if (!isValid) {
      throw new Error("Invalid signature");
    }
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1e3)) {
      throw new Error("Token expired");
    }
    return payload;
  } catch (error) {
    throw new Error("Invalid token");
  }
}
__name(verifyJwt3, "verifyJwt3");
async function onRequestPost15(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    if (!body.projectId) {
      return new Response(JSON.stringify({
        success: false,
        error: "projectId is required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const cookieHeader = request.headers.get("Cookie");
    let token = null;
    if (cookieHeader) {
      const cookies = cookieHeader.split("; ");
      const authCookie = cookies.find((c) => c.startsWith("auth-token="));
      if (authCookie) {
        const encodedToken = authCookie.split("=")[1];
        token = decodeURIComponent(encodedToken);
      }
    }
    if (!token) {
      return new Response(JSON.stringify({
        success: false,
        error: "No authentication token"
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const jwtSecret = env.JWT_SECRET;
    if (!jwtSecret) {
      return new Response(JSON.stringify({
        success: false,
        error: "JWT secret not configured"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    try {
      const payload = await verifyJwt3(token, jwtSecret);
      if (!payload) {
        return new Response(JSON.stringify({
          success: false,
          error: "Invalid or expired token"
        }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
      const bearerToken = env.AFFENSUS_CREDENTIALS_PASSWORD;
      if (!bearerToken) {
        throw new Error("AFFENSUS_CREDENTIALS_PASSWORD not configured");
      }
      console.log("Making API request to:", "https://apiv2.affensus.com/api/refresh-wishlist");
      console.log("Request body:", {
        projectId: body.projectId,
        sendNotification: body.sendNotification || false
      });
      console.log("Headers:", {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${bearerToken.substring(0, 8)}...`
      });
      let response;
      try {
        response = await fetch("https://apiv2.affensus.com/api/refresh-wishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${bearerToken}`
          },
          body: JSON.stringify({
            projectId: body.projectId,
            sendNotification: body.sendNotification || false
          })
        });
      } catch (fetchError) {
        console.error("Fetch error:", fetchError);
        const errorMessage = fetchError instanceof Error ? fetchError.message : "Unknown fetch error";
        throw new Error(`Network error: ${errorMessage}`);
      }
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Response Error:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`External API error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      const data = await response.json();
      console.log("New wishlist numbers:", {
        newCount: data.newCount,
        counts: data.counts
      });
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, max-age=0"
        }
      });
    } catch (error) {
      console.error("JWT verification error:", error);
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Invalid token"
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    console.error("Refresh wishlist error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost15, "onRequestPost15");
var init_refresh_wishlist = __esm({
  "api/refresh-wishlist/index.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    __name2(onRequestOptions29, "onRequestOptions");
    __name2(verifyJwt3, "verifyJwt");
    __name2(onRequestPost15, "onRequestPost");
  }
});
async function onRequestOptions30() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
__name(onRequestOptions30, "onRequestOptions30");
async function onRequestPost16(context) {
  try {
    const { request, env } = context;
    const cookieHeader = request.headers.get("Cookie");
    let token = null;
    if (cookieHeader) {
      const cookies = cookieHeader.split("; ");
      const authCookie = cookies.find((c) => c.startsWith("auth-token="));
      if (authCookie) {
        const encodedToken = authCookie.split("=")[1];
        token = decodeURIComponent(encodedToken);
      }
    }
    if (!token) {
      return new Response(JSON.stringify({ error: "No authentication token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const jwtSecret = env.JWT_SECRET;
    if (!jwtSecret) {
      return new Response(JSON.stringify({ error: "JWT secret not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    try {
      const payload = await verifyJwt(token, jwtSecret);
      if (!payload) {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
      const { description, userEmail, subscriptionStatus } = await request.json();
      if (!description) {
        return new Response(JSON.stringify({
          error: "Description is required"
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      if (description.length > 1e3) {
        return new Response(JSON.stringify({
          error: "Description too long (max 1000 characters)"
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const db = env.DB;
      if (!db) {
        return new Response(JSON.stringify({ error: "Database not available" }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
      const userInvoices = await db.prepare(`
        SELECT * FROM stripe_invoices 
        WHERE user_id = ? AND status = 'paid' AND amount_paid > 0
        ORDER BY created_at DESC 
        LIMIT 1
      `).bind(payload.sub).all();
      if (!userInvoices.results || userInvoices.results.length === 0) {
        return new Response(JSON.stringify({
          error: "No payment found to refund"
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const latestInvoice = userInvoices.results[0];
      const paymentDate = new Date(latestInvoice.created_at);
      const now = /* @__PURE__ */ new Date();
      const daysSincePayment = Math.floor((now.getTime() - paymentDate.getTime()) / (1e3 * 60 * 60 * 24));
      if (daysSincePayment > 7) {
        return new Response(JSON.stringify({
          error: "Refund window has expired. Refunds are only available within 7 days of payment."
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      if (latestInvoice.stripe_invoice_id.startsWith("manual_fix_")) {
        await db.prepare(`
          UPDATE users 
          SET subscription_status = 'free', 
              subscription_expires_at = datetime('now'),
              updated_at = datetime('now')
          WHERE id = ?
        `).bind(payload.sub).run();
        const { createCreditNote: createCreditNote2 } = await Promise.resolve().then(() => (init_invoice_generator(), invoice_generator_exports));
        const creditNote = await createCreditNote2(db, latestInvoice.id, description);
        console.log(`Manual refund processed for user ${payload.sub}:`, {
          userId: payload.sub,
          userEmail: userEmail || payload.email,
          amountRefunded: latestInvoice.amount_paid,
          currency: latestInvoice.currency,
          refundReason: description,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
        const resendApiKey = env.RESEND_API_KEY;
        if (resendApiKey) {
          try {
            await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${resendApiKey}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                from: "MorseXpress <noreply@email.morsexpress.com>",
                to: "info@sjoerdcopier.nl",
                subject: "Refund Request - MorseXpress",
                html: `
                  <h2>Refund Request Processed</h2>
                  <p><strong>User:</strong> ${userEmail || payload.email}</p>
                  <p><strong>User ID:</strong> ${payload.sub}</p>
                  <p><strong>Amount Refunded:</strong> $${(latestInvoice.amount_paid / 100).toFixed(2)} ${latestInvoice.currency.toUpperCase()}</p>
                  <p><strong>Refund Reason:</strong> ${description}</p>
                  <p><strong>Processed:</strong> ${(/* @__PURE__ */ new Date()).toISOString()}</p>
                  <p><strong>Type:</strong> Manual refund (testing environment)</p>
                `
              })
            });
            console.log("Refund notification email sent");
          } catch (emailError) {
            console.error("Failed to send refund notification email:", emailError);
          }
        }
        return new Response(JSON.stringify({
          message: `Refund processed successfully! $${(latestInvoice.amount_paid / 100).toFixed(2)} has been refunded. Your subscription has been cancelled.`,
          amountRefunded: latestInvoice.amount_paid,
          currency: latestInvoice.currency,
          note: "This was a manual refund for testing purposes."
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      const stripeSecretKey = env.STRIPE_SECRET_KEY;
      if (!stripeSecretKey) {
        return new Response(JSON.stringify({ error: "Stripe not configured" }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
      try {
        const refundResponse = await fetch("https://api.stripe.com/v1/refunds", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${stripeSecretKey}`,
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({
            payment_intent: latestInvoice.stripe_invoice_id,
            reason: "requested_by_customer",
            metadata: JSON.stringify({
              user_id: payload.sub,
              user_email: userEmail || payload.email,
              refund_reason: description,
              refund_date: (/* @__PURE__ */ new Date()).toISOString()
            })
          })
        });
        if (!refundResponse.ok) {
          const errorData = await refundResponse.json();
          console.error("Stripe refund error:", errorData);
          return new Response(JSON.stringify({
            error: "Failed to process refund through Stripe"
          }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
        const refund = await refundResponse.json();
        await db.prepare(`
          UPDATE users 
          SET subscription_status = 'free', 
              subscription_expires_at = datetime('now'),
              updated_at = datetime('now')
          WHERE id = ?
        `).bind(payload.sub).run();
        const { createCreditNote: createCreditNote2 } = await Promise.resolve().then(() => (init_invoice_generator(), invoice_generator_exports));
        const creditNote = await createCreditNote2(db, latestInvoice.id, description);
        console.log(`Refund processed for user ${payload.sub}:`, {
          userId: payload.sub,
          userEmail: userEmail || payload.email,
          stripeRefundId: refund.id,
          amountRefunded: latestInvoice.amount_paid,
          currency: latestInvoice.currency,
          refundReason: description,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
        const resendApiKey = env.RESEND_API_KEY;
        if (resendApiKey) {
          try {
            await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${resendApiKey}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                from: "MorseXpress <noreply@morsexpress.com>",
                to: "info@sjoerdcopier.nl",
                subject: "Refund Request - MorseXpress",
                html: `
                  <h2>Refund Request Processed</h2>
                  <p><strong>User:</strong> ${userEmail || payload.email}</p>
                  <p><strong>User ID:</strong> ${payload.sub}</p>
                  <p><strong>Stripe Refund ID:</strong> ${refund.id}</p>
                  <p><strong>Amount Refunded:</strong> $${(latestInvoice.amount_paid / 100).toFixed(2)} ${latestInvoice.currency.toUpperCase()}</p>
                  <p><strong>Refund Reason:</strong> ${description}</p>
                  <p><strong>Processed:</strong> ${(/* @__PURE__ */ new Date()).toISOString()}</p>
                  <p><strong>Type:</strong> Stripe refund (production)</p>
                `
              })
            });
            console.log("Refund notification email sent");
          } catch (emailError) {
            console.error("Failed to send refund notification email:", emailError);
          }
        }
        return new Response(JSON.stringify({
          message: `Refund processed successfully! $${(latestInvoice.amount_paid / 100).toFixed(2)} has been refunded to your original payment method. Your subscription has been cancelled.`,
          refundId: refund.id,
          amountRefunded: latestInvoice.amount_paid,
          currency: latestInvoice.currency
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      } catch (stripeError) {
        console.error("Error processing Stripe refund:", stripeError);
        return new Response(JSON.stringify({
          error: "Failed to process refund. Please contact support."
        }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    } catch (jwtError) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    console.error("Error processing refund request:", error);
    return new Response(JSON.stringify({
      error: "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost16, "onRequestPost16");
var init_refund_request = __esm({
  "api/refund-request/index.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    init_jwt();
    __name2(onRequestOptions30, "onRequestOptions");
    __name2(onRequestPost16, "onRequestPost");
  }
});
function generateToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
__name(generateToken, "generateToken");
async function createUser(db, email, loginMethod = "magic_link") {
  const bearerToken = process.env.AFFENSUS_CREDENTIALS_PASSWORD;
  if (!bearerToken) {
    throw new Error("AFFENSUS_CREDENTIALS_PASSWORD not configured");
  }
  console.log("Registering user via external API:", { email, loginMethod });
  const response = await fetch("https://apiv2.affensus.com/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${bearerToken}`
    },
    body: JSON.stringify({
      email: email.toLowerCase(),
      name: null,
      // Magic link users don't have names initially
      login_method: loginMethod,
      subscription_status: "free"
    })
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error("API registration failed:", response.status, errorText);
    throw new Error(`Registration failed: ${response.status} ${errorText}`);
  }
  const userData = await response.json();
  const user = {
    id: userData.id || userData.user_id || Date.now(),
    // Fallback ID if API doesn't return one
    email: email.toLowerCase(),
    preferred_login_method: loginMethod,
    subscription_status: "free",
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  const isNewUser = response.status === 201;
  return { user, isNewUser };
}
__name(createUser, "createUser");
async function createMagicLink(db, email, token) {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1e3);
  const stmt = db.prepare(`
    INSERT INTO magic_links (email, token, expires_at, created_at)
    VALUES (?, ?, ?, datetime('now'))
  `);
  await stmt.bind(email, token, expiresAt.toISOString()).run();
}
__name(createMagicLink, "createMagicLink");
async function cleanupExpiredMagicLinks(db) {
  await db.prepare('DELETE FROM magic_links WHERE expires_at < datetime("now")').run();
}
__name(cleanupExpiredMagicLinks, "cleanupExpiredMagicLinks");
async function sendMagicLinkEmail(email, magicLinkUrl, resendApiKey) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "noreply@email.morsexpress.com",
      to: email,
      subject: "Your Magic Link for MorseXpress",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1f2937; margin-bottom: 10px;">MorseXpress</h1>
            <h2 style="color: #4b5563; font-weight: normal; margin-top: 0;">Your Magic Link</h2>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">
            Click the button below to sign in to your MorseXpress account. This link will expire in 10 minutes.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${magicLinkUrl}" 
               style="background-color: #1f2937; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
              Sign In to MorseXpress
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="color: #3b82f6; font-size: 14px; word-break: break-all;">
            ${magicLinkUrl}
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            If you didn't request this email, you can safely ignore it.
          </p>
        </div>
      `,
      text: `
Your Magic Link for MorseXpress

Click the following link to sign in to your MorseXpress account. This link will expire in 10 minutes.

${magicLinkUrl}

If you didn't request this email, you can safely ignore it.
      `.trim()
    })
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Resend API error:", errorText);
    throw new Error(`Failed to send email via Resend: ${response.status} ${errorText}`);
  }
  return await response.json();
}
__name(sendMagicLinkEmail, "sendMagicLinkEmail");
async function onRequestPost17(context) {
  try {
    const { request, env } = context;
    const { email } = await request.json();
    if (!email || typeof email !== "string") {
      return new Response(JSON.stringify({ error: "Valid email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const db = env.DB;
    if (!db) {
      return new Response(JSON.stringify({ error: "Database not available" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    try {
      await cleanupExpiredMagicLinks(db);
      const { user, isNewUser } = await createUser(db, email.toLowerCase(), "magic_link");
      if (isNewUser) {
        const resendApiKey2 = env.RESEND_API_KEY;
        if (resendApiKey2) {
          try {
            const { sendNewUserNotification: sendNewUserNotification2 } = await Promise.resolve().then(() => (init_email_notifications(), email_notifications_exports));
            await sendNewUserNotification2(user.email, "magic_link", resendApiKey2);
          } catch (error) {
            console.error("Failed to send new user notification:", error);
          }
        } else {
          console.log("New user registered but RESEND_API_KEY not configured - email notification skipped");
        }
      }
      const token = generateToken();
      await createMagicLink(db, email.toLowerCase(), token);
      const magicLinkUrl = `${env.SITE_URL || "http://localhost:3000"}/api/magic-login?token=${token}`;
      if (env.NODE_ENV === "development") {
        console.log(`[DEV] \u{1F517} Magic link for ${email}: ${magicLinkUrl}`);
        return new Response(JSON.stringify({
          message: "Magic link generated",
          development_link: magicLinkUrl
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      const resendApiKey = env.RESEND_API_KEY;
      if (!resendApiKey) {
        console.error("RESEND_API_KEY not configured");
        return new Response(JSON.stringify({ error: "Email service not configured" }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
      try {
        const emailResult = await sendMagicLinkEmail(email, magicLinkUrl, resendApiKey);
        console.log(`Magic link email sent to ${email}:`, emailResult);
        return new Response(JSON.stringify({
          message: "Magic link sent to your email"
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      } catch (emailError) {
        console.error("Failed to send magic link email:", emailError);
        return new Response(JSON.stringify({ error: "Failed to send email" }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    } catch (dbError) {
      console.error("Database error:", dbError);
      return new Response(JSON.stringify({ error: "Database operation failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    console.error("Error processing magic link request:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost17, "onRequestPost17");
var init_request_magic_link = __esm({
  "api/request-magic-link/index.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    __name2(generateToken, "generateToken");
    __name2(createUser, "createUser");
    __name2(createMagicLink, "createMagicLink");
    __name2(cleanupExpiredMagicLinks, "cleanupExpiredMagicLinks");
    __name2(sendMagicLinkEmail, "sendMagicLinkEmail");
    __name2(onRequestPost17, "onRequestPost");
  }
});
async function onRequestOptions31() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
__name(onRequestOptions31, "onRequestOptions31");
async function onRequestGet30(context) {
  try {
    const { request, env } = context;
    const cookieHeader = request.headers.get("Cookie");
    let token = null;
    if (cookieHeader) {
      const cookies = cookieHeader.split("; ");
      const authCookie = cookies.find((c) => c.startsWith("auth-token="));
      if (authCookie) {
        const encodedToken = authCookie.split("=")[1];
        token = decodeURIComponent(encodedToken);
      }
    }
    if (!token) {
      return new Response(JSON.stringify({
        authenticated: false,
        user: null
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    const jwtSecret = env.JWT_SECRET;
    if (!jwtSecret) {
      return new Response(JSON.stringify({
        error: "JWT secret not configured"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    try {
      const payload = await verifyJwt(token, jwtSecret);
      if (!payload) {
        return new Response(JSON.stringify({
          authenticated: false,
          user: null
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      return new Response(JSON.stringify({
        authenticated: true,
        user: {
          id: payload.sub,
          email: payload.email,
          loginMethod: payload.login_method
        }
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        authenticated: false,
        user: null,
        error: "Invalid token"
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    console.error("Error checking authentication:", error);
    return new Response(JSON.stringify({
      error: "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet30, "onRequestGet30");
var init_user = __esm({
  "api/user/index.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    init_jwt();
    __name2(onRequestOptions31, "onRequestOptions");
    __name2(onRequestGet30, "onRequestGet");
  }
});
async function verifyJwt4(token, secret) {
  try {
    const [headerB64, payloadB64, signatureB64] = token.split(".");
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const dataToVerify = encoder.encode(`${headerB64}.${payloadB64}`);
    const signature = Uint8Array.from(atob(signatureB64.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
    const isValid = await crypto.subtle.verify("HMAC", key, signature, dataToVerify);
    if (!isValid) {
      throw new Error("Invalid signature");
    }
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1e3)) {
      throw new Error("Token expired");
    }
    return payload;
  } catch (error) {
    throw new Error("Invalid token");
  }
}
__name(verifyJwt4, "verifyJwt4");
function parseCookies9(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach((cookie) => {
    const parts = cookie.trim().split("=");
    if (parts.length === 2) {
      cookies[parts[0]] = decodeURIComponent(parts[1]);
    }
  });
  return cookies;
}
__name(parseCookies9, "parseCookies9");
async function getUserByEmail3(db, email) {
  return await db.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
}
__name(getUserByEmail3, "getUserByEmail3");
async function onRequestGet31(context) {
  try {
    const { request, env } = context;
    const cookies = parseCookies9(request.headers.get("Cookie"));
    const token = cookies["auth-token"];
    if (!token) {
      return new Response(JSON.stringify({ error: "No authentication token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const jwtSecret = env.JWT_SECRET;
    if (!jwtSecret) {
      return new Response(JSON.stringify({ error: "JWT secret not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    try {
      const decoded = await verifyJwt4(token, jwtSecret);
      const db = env.DB;
      if (!db) {
        return new Response(JSON.stringify({ error: "Database not available" }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
      const user = await getUserByEmail3(db, decoded.email);
      if (!user) {
        return new Response(JSON.stringify({ error: "User not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
      return new Response(JSON.stringify({
        preferences: {
          preferred_login_method: user.preferred_login_method,
          last_login_at: user.updated_at
        },
        user: {
          email: user.email,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (jwtError) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet31, "onRequestGet31");
var init_user_preferences = __esm({
  "api/user-preferences.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    __name2(verifyJwt4, "verifyJwt");
    __name2(parseCookies9, "parseCookies");
    __name2(getUserByEmail3, "getUserByEmail");
    __name2(onRequestGet31, "onRequestGet");
  }
});
async function onRequestOptions32() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
__name(onRequestOptions32, "onRequestOptions32");
async function onRequestPost18(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    if (!body.project_id) {
      return new Response(JSON.stringify({
        success: false,
        error: "project_id is required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const cookieHeader = request.headers.get("Cookie");
    let token = null;
    if (cookieHeader) {
      const cookies = cookieHeader.split("; ");
      const authCookie = cookies.find((c) => c.startsWith("auth-token="));
      if (authCookie) {
        const encodedToken = authCookie.split("=")[1];
        token = decodeURIComponent(encodedToken);
      }
    }
    if (!token) {
      return new Response(JSON.stringify({
        success: false,
        error: "No authentication token"
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const jwtSecret = env.JWT_SECRET;
    if (!jwtSecret) {
      return new Response(JSON.stringify({
        success: false,
        error: "JWT secret not configured"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    try {
      const payload = await verifyJwt(token, jwtSecret);
      if (!payload) {
        return new Response(JSON.stringify({
          success: false,
          error: "Invalid or expired token"
        }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
      const bearerToken = env.AFFENSUS_CREDENTIALS_PASSWORD;
      if (!bearerToken) {
        throw new Error("AFFENSUS_CREDENTIALS_PASSWORD not configured");
      }
      console.log("Making API request to:", "https://apiv2.affensus.com/api/wishlist-info");
      console.log("Request body:", { project_id: body.project_id });
      console.log("Headers:", {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${bearerToken.substring(0, 8)}...`
      });
      let response;
      try {
        response = await fetch("https://apiv2.affensus.com/api/wishlist-info", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${bearerToken}`
          },
          body: JSON.stringify({
            project_id: body.project_id
          })
        });
      } catch (fetchError) {
        console.error("Fetch error:", fetchError);
        const errorMessage = fetchError instanceof Error ? fetchError.message : "Unknown fetch error";
        throw new Error(`Network error: ${errorMessage}`);
      }
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Response Error:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`External API error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      const data = await response.json();
      return new Response(JSON.stringify({
        success: true,
        data
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, max-age=0"
        }
      });
    } catch (error) {
      console.error("JWT verification error:", error);
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Invalid token"
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    console.error("Wishlist info error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost18, "onRequestPost18");
var init_wishlist_info = __esm({
  "api/wishlist-info/index.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    init_jwt();
    __name2(onRequestOptions32, "onRequestOptions");
    __name2(onRequestPost18, "onRequestPost");
  }
});
var onRequest5;
var init_currency_rates = __esm({
  "api/currency-rates.ts"() {
    "use strict";
    init_functionsRoutes_0_761719226935281();
    init_checked_fetch();
    init_settings();
    onRequest5 = /* @__PURE__ */ __name2(async (context) => {
      const { request } = context;
      const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      };
      if (request.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
      }
      try {
        const supportedCurrencies = Array.from(
          new Set(Object.values(locales).map((locale) => locale.currency))
        );
        const cacheControl = "public, max-age=21600";
        const API_KEY = context.env.EXCHANGE_RATE_API_KEY;
        const BASE_CURRENCY = "USD";
        if (!API_KEY) {
          throw new Error("EXCHANGE_RATE_API_KEY environment variable is not set");
        }
        const apiUrl = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${BASE_CURRENCY}`;
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`Exchange rate API failed: ${response.status}`);
        }
        const data = await response.json();
        if (data.result !== "success") {
          throw new Error("Invalid API response");
        }
        const filteredRates = {};
        supportedCurrencies.forEach((currency) => {
          if (data.conversion_rates[currency]) {
            filteredRates[currency] = data.conversion_rates[currency];
          }
        });
        const result = {
          rates: filteredRates,
          lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
          baseCurrency: BASE_CURRENCY
        };
        return new Response(JSON.stringify(result), {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": cacheControl,
            ...corsHeaders
          }
        });
      } catch (error) {
        console.error("Currency rates API error:", error);
        const fallbackRates = {
          rates: {
            "USD": 1,
            "TRY": 32.5
            // Approximate fallback rate
          },
          lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
          baseCurrency: "USD"
        };
        return new Response(JSON.stringify(fallbackRates), {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=300",
            // 5 minutes cache for fallback
            ...corsHeaders
          },
          status: 200
          // Return 200 to not break frontend
        });
      }
    }, "onRequest");
  }
});
var routes;
var init_functionsRoutes_0_761719226935281 = __esm({
  "../.wrangler/tmp/pages-5rzUvz/functionsRoutes-0.761719226935281.mjs"() {
    "use strict";
    init_read();
    init_read();
    init_callback();
    init_callback2();
    init_callback3();
    init_courseId();
    init_courseId();
    init_monitor();
    init_monitor();
    init_status();
    init_status();
    init_read_all();
    init_read_all();
    init_credentials_summary();
    init_credentials_summary();
    init_link_rot();
    init_link_rot();
    init_merchants();
    init_merchants();
    init_networks();
    init_networks();
    init_notifications();
    init_notifications();
    init_search();
    init_search();
    init_notification_id();
    init_notification_id();
    init_facebook();
    init_github();
    init_google();
    init_register();
    init_register();
    init_create();
    init_create();
    init_delete();
    init_delete();
    init_update();
    init_update();
    init_hide();
    init_hide();
    init_billing_address();
    init_billing_address();
    init_completion_status();
    init_invoices();
    init_preferences();
    init_process_pending_invoices();
    init_process_pending_invoices();
    init_status2();
    init_status2();
    init_affiliate_link_checker();
    init_affiliate_link_checker();
    init_affiliate_link_checker();
    init_affiliate_network_uptime();
    init_affiliate_network_uptime();
    init_create_checkout_session();
    init_create_portal_session();
    init_create_user_account();
    init_webhook();
    init_invoiceNumber();
    init_invoiceNumber();
    init_userId();
    init_userId();
    init_contact();
    init_credential_schemas();
    init_credential_schemas();
    init_decrypt_credentials();
    init_decrypt_credentials();
    init_import_network();
    init_import_network();
    init_logo();
    init_logo();
    init_logout();
    init_magic_login();
    init_mistake_report();
    init_network_monitors();
    init_network_monitors();
    init_network_monitors();
    init_network_monitors();
    init_network_monitors();
    init_profile();
    init_profile();
    init_refresh_published();
    init_refresh_published();
    init_refresh_wishlist();
    init_refresh_wishlist();
    init_refund_request();
    init_refund_request();
    init_request_magic_link();
    init_user();
    init_user();
    init_user_preferences();
    init_wishlist_info();
    init_wishlist_info();
    init_currency_rates();
    routes = [
      {
        routePath: "/api/notifications/:project_id/:notification_id/read",
        mountPath: "/api/notifications/:project_id/:notification_id",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions]
      },
      {
        routePath: "/api/notifications/:project_id/:notification_id/read",
        mountPath: "/api/notifications/:project_id/:notification_id",
        method: "PUT",
        middlewares: [],
        modules: [onRequestPut]
      },
      {
        routePath: "/api/auth/facebook/callback",
        mountPath: "/api/auth/facebook",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet]
      },
      {
        routePath: "/api/auth/github/callback",
        mountPath: "/api/auth/github",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet2]
      },
      {
        routePath: "/api/auth/google/callback",
        mountPath: "/api/auth/google",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet3]
      },
      {
        routePath: "/api/user/progress/:courseId",
        mountPath: "/api/user/progress/:courseId",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet4]
      },
      {
        routePath: "/api/user/progress/:courseId",
        mountPath: "/api/user/progress/:courseId",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost]
      },
      {
        routePath: "/api/job/:job_id/monitor",
        mountPath: "/api/job/:job_id",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet5]
      },
      {
        routePath: "/api/job/:job_id/monitor",
        mountPath: "/api/job/:job_id",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions2]
      },
      {
        routePath: "/api/job/:job_id/status",
        mountPath: "/api/job/:job_id",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet6]
      },
      {
        routePath: "/api/job/:job_id/status",
        mountPath: "/api/job/:job_id",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions3]
      },
      {
        routePath: "/api/notifications/:project_id/read-all",
        mountPath: "/api/notifications/:project_id",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions4]
      },
      {
        routePath: "/api/notifications/:project_id/read-all",
        mountPath: "/api/notifications/:project_id",
        method: "PUT",
        middlewares: [],
        modules: [onRequestPut2]
      },
      {
        routePath: "/api/projects/:project_id/credentials-summary",
        mountPath: "/api/projects/:project_id",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet7]
      },
      {
        routePath: "/api/projects/:project_id/credentials-summary",
        mountPath: "/api/projects/:project_id",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions5]
      },
      {
        routePath: "/api/projects/:project_id/link-rot",
        mountPath: "/api/projects/:project_id",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet8]
      },
      {
        routePath: "/api/projects/:project_id/link-rot",
        mountPath: "/api/projects/:project_id",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions6]
      },
      {
        routePath: "/api/projects/:project_id/merchants",
        mountPath: "/api/projects/:project_id",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet9]
      },
      {
        routePath: "/api/projects/:project_id/merchants",
        mountPath: "/api/projects/:project_id",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions7]
      },
      {
        routePath: "/api/projects/:project_id/networks",
        mountPath: "/api/projects/:project_id",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet10]
      },
      {
        routePath: "/api/projects/:project_id/networks",
        mountPath: "/api/projects/:project_id",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions8]
      },
      {
        routePath: "/api/projects/:project_id/notifications",
        mountPath: "/api/projects/:project_id",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet11]
      },
      {
        routePath: "/api/projects/:project_id/notifications",
        mountPath: "/api/projects/:project_id",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions9]
      },
      {
        routePath: "/api/projects/:project_id/search",
        mountPath: "/api/projects/:project_id",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet12]
      },
      {
        routePath: "/api/projects/:project_id/search",
        mountPath: "/api/projects/:project_id",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions10]
      },
      {
        routePath: "/api/notifications/:project_id/:notification_id",
        mountPath: "/api/notifications/:project_id",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet13]
      },
      {
        routePath: "/api/notifications/:project_id/:notification_id",
        mountPath: "/api/notifications/:project_id",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions11]
      },
      {
        routePath: "/api/auth/facebook",
        mountPath: "/api/auth/facebook",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet14]
      },
      {
        routePath: "/api/auth/github",
        mountPath: "/api/auth/github",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet15]
      },
      {
        routePath: "/api/auth/google",
        mountPath: "/api/auth/google",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet16]
      },
      {
        routePath: "/api/auth/register",
        mountPath: "/api/auth/register",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions12]
      },
      {
        routePath: "/api/auth/register",
        mountPath: "/api/auth/register",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost2]
      },
      {
        routePath: "/api/credentials/create",
        mountPath: "/api/credentials",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions13]
      },
      {
        routePath: "/api/credentials/create",
        mountPath: "/api/credentials",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost3]
      },
      {
        routePath: "/api/credentials/delete",
        mountPath: "/api/credentials",
        method: "DELETE",
        middlewares: [],
        modules: [onRequestDelete]
      },
      {
        routePath: "/api/credentials/delete",
        mountPath: "/api/credentials",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions14]
      },
      {
        routePath: "/api/credentials/update",
        mountPath: "/api/credentials",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions15]
      },
      {
        routePath: "/api/credentials/update",
        mountPath: "/api/credentials",
        method: "PUT",
        middlewares: [],
        modules: [onRequestPut3]
      },
      {
        routePath: "/api/merchants/hide",
        mountPath: "/api/merchants",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions16]
      },
      {
        routePath: "/api/merchants/hide",
        mountPath: "/api/merchants",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost4]
      },
      {
        routePath: "/api/profile/billing-address",
        mountPath: "/api/profile",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet17]
      },
      {
        routePath: "/api/profile/billing-address",
        mountPath: "/api/profile",
        method: "PUT",
        middlewares: [],
        modules: [onRequestPut4]
      },
      {
        routePath: "/api/profile/completion-status",
        mountPath: "/api/profile",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet18]
      },
      {
        routePath: "/api/profile/invoices",
        mountPath: "/api/profile",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet19]
      },
      {
        routePath: "/api/profile/preferences",
        mountPath: "/api/profile",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet20]
      },
      {
        routePath: "/api/profile/process-pending-invoices",
        mountPath: "/api/profile",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions17]
      },
      {
        routePath: "/api/profile/process-pending-invoices",
        mountPath: "/api/profile",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost5]
      },
      {
        routePath: "/api/queue/status",
        mountPath: "/api/queue",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet21]
      },
      {
        routePath: "/api/queue/status",
        mountPath: "/api/queue",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions18]
      },
      {
        routePath: "/api/tools/affiliate-link-checker",
        mountPath: "/api/tools",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet22]
      },
      {
        routePath: "/api/tools/affiliate-link-checker",
        mountPath: "/api/tools",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions19]
      },
      {
        routePath: "/api/tools/affiliate-link-checker",
        mountPath: "/api/tools",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost6]
      },
      {
        routePath: "/api/tools/affiliate-network-uptime",
        mountPath: "/api/tools",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet23]
      },
      {
        routePath: "/api/tools/affiliate-network-uptime",
        mountPath: "/api/tools",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions20]
      },
      {
        routePath: "/api/stripe/create-checkout-session",
        mountPath: "/api/stripe",
        method: "",
        middlewares: [],
        modules: [onRequest]
      },
      {
        routePath: "/api/stripe/create-portal-session",
        mountPath: "/api/stripe",
        method: "",
        middlewares: [],
        modules: [onRequest2]
      },
      {
        routePath: "/api/stripe/create-user-account",
        mountPath: "/api/stripe",
        method: "",
        middlewares: [],
        modules: [onRequest3]
      },
      {
        routePath: "/api/stripe/webhook",
        mountPath: "/api/stripe",
        method: "",
        middlewares: [],
        modules: [onRequest4]
      },
      {
        routePath: "/api/invoice/:invoiceNumber",
        mountPath: "/api/invoice",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet24]
      },
      {
        routePath: "/api/invoice/:invoiceNumber",
        mountPath: "/api/invoice",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions21]
      },
      {
        routePath: "/api/users/:userId",
        mountPath: "/api/users/:userId",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet25]
      },
      {
        routePath: "/api/users/:userId",
        mountPath: "/api/users/:userId",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions22]
      },
      {
        routePath: "/api/contact",
        mountPath: "/api/contact",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost7]
      },
      {
        routePath: "/api/credential-schemas",
        mountPath: "/api",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet26]
      },
      {
        routePath: "/api/credential-schemas",
        mountPath: "/api",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions23]
      },
      {
        routePath: "/api/decrypt-credentials",
        mountPath: "/api",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions24]
      },
      {
        routePath: "/api/decrypt-credentials",
        mountPath: "/api",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost8]
      },
      {
        routePath: "/api/import-network",
        mountPath: "/api",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions25]
      },
      {
        routePath: "/api/import-network",
        mountPath: "/api",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost9]
      },
      {
        routePath: "/api/logo",
        mountPath: "/api/logo",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions26]
      },
      {
        routePath: "/api/logo",
        mountPath: "/api/logo",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost10]
      },
      {
        routePath: "/api/logout",
        mountPath: "/api/logout",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost11]
      },
      {
        routePath: "/api/magic-login",
        mountPath: "/api/magic-login",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet27]
      },
      {
        routePath: "/api/mistake-report",
        mountPath: "/api/mistake-report",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost12]
      },
      {
        routePath: "/api/network-monitors",
        mountPath: "/api/network-monitors",
        method: "DELETE",
        middlewares: [],
        modules: [onRequestDelete2]
      },
      {
        routePath: "/api/network-monitors",
        mountPath: "/api/network-monitors",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet28]
      },
      {
        routePath: "/api/network-monitors",
        mountPath: "/api/network-monitors",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions27]
      },
      {
        routePath: "/api/network-monitors",
        mountPath: "/api/network-monitors",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost13]
      },
      {
        routePath: "/api/network-monitors",
        mountPath: "/api/network-monitors",
        method: "PUT",
        middlewares: [],
        modules: [onRequestPut5]
      },
      {
        routePath: "/api/profile",
        mountPath: "/api/profile",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet29]
      },
      {
        routePath: "/api/profile",
        mountPath: "/api/profile",
        method: "PUT",
        middlewares: [],
        modules: [onRequestPut6]
      },
      {
        routePath: "/api/refresh-published",
        mountPath: "/api/refresh-published",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions28]
      },
      {
        routePath: "/api/refresh-published",
        mountPath: "/api/refresh-published",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost14]
      },
      {
        routePath: "/api/refresh-wishlist",
        mountPath: "/api/refresh-wishlist",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions29]
      },
      {
        routePath: "/api/refresh-wishlist",
        mountPath: "/api/refresh-wishlist",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost15]
      },
      {
        routePath: "/api/refund-request",
        mountPath: "/api/refund-request",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions30]
      },
      {
        routePath: "/api/refund-request",
        mountPath: "/api/refund-request",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost16]
      },
      {
        routePath: "/api/request-magic-link",
        mountPath: "/api/request-magic-link",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost17]
      },
      {
        routePath: "/api/user",
        mountPath: "/api/user",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet30]
      },
      {
        routePath: "/api/user",
        mountPath: "/api/user",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions31]
      },
      {
        routePath: "/api/user-preferences",
        mountPath: "/api",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet31]
      },
      {
        routePath: "/api/wishlist-info",
        mountPath: "/api/wishlist-info",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions32]
      },
      {
        routePath: "/api/wishlist-info",
        mountPath: "/api/wishlist-info",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost18]
      },
      {
        routePath: "/api/currency-rates",
        mountPath: "/api",
        method: "",
        middlewares: [],
        modules: [onRequest5]
      }
    ];
  }
});
init_functionsRoutes_0_761719226935281();
init_checked_fetch();
init_functionsRoutes_0_761719226935281();
init_checked_fetch();
init_functionsRoutes_0_761719226935281();
init_checked_fetch();
init_functionsRoutes_0_761719226935281();
init_checked_fetch();
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
__name2(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name2(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name2(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name2(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name2(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name2(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
__name2(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
__name2(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name2(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
__name2(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
__name2(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
__name2(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
__name2(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
__name2(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
__name2(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
__name2(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");
__name2(pathToRegexp, "pathToRegexp");
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
__name2(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name2(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name2(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name2((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
init_functionsRoutes_0_761719226935281();
init_checked_fetch();
var drainBody = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;
init_functionsRoutes_0_761719226935281();
init_checked_fetch();
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
__name2(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;
init_functionsRoutes_0_761719226935281();
init_checked_fetch();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
__name2(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
__name2(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");
__name2(__facade_invoke__, "__facade_invoke__");
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  static {
    __name(this, "___Facade_ScheduledController__");
  }
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name2(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name2(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name2(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
__name2(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name2((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name2((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
__name2(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default2 = drainBody2;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError2(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError2(e.cause)
  };
}
__name(reduceError2, "reduceError");
var jsonError2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError2(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default2 = jsonError2;

// .wrangler/tmp/bundle-qg0mA9/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__2 = [
  middleware_ensure_req_body_drained_default2,
  middleware_miniflare3_json_error_default2
];
var middleware_insertion_facade_default2 = middleware_loader_entry_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__2 = [];
function __facade_register__2(...args) {
  __facade_middleware__2.push(...args.flat());
}
__name(__facade_register__2, "__facade_register__");
function __facade_invokeChain__2(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__2(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__2, "__facade_invokeChain__");
function __facade_invoke__2(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__2(request, env, ctx, dispatch, [
    ...__facade_middleware__2,
    finalMiddleware
  ]);
}
__name(__facade_invoke__2, "__facade_invoke__");

// .wrangler/tmp/bundle-qg0mA9/middleware-loader.entry.ts
var __Facade_ScheduledController__2 = class ___Facade_ScheduledController__2 {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__2)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler2(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__2(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__2(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler2, "wrapExportedHandler");
function wrapWorkerEntrypoint2(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__2(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__2(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint2, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY2;
if (typeof middleware_insertion_facade_default2 === "object") {
  WRAPPED_ENTRY2 = wrapExportedHandler2(middleware_insertion_facade_default2);
} else if (typeof middleware_insertion_facade_default2 === "function") {
  WRAPPED_ENTRY2 = wrapWorkerEntrypoint2(middleware_insertion_facade_default2);
}
var middleware_loader_entry_default2 = WRAPPED_ENTRY2;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__2 as __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default2 as default
};
/*! Bundled license information:

crypto-js/ripemd160.js:
  (** @preserve
  	(c) 2012 by Cédric Mesnil. All rights reserved.
  
  	Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
  
  	    - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
  	    - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
  
  	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  	*)

crypto-js/mode-ctr-gladman.js:
  (** @preserve
   * Counter block mode compatible with  Dr Brian Gladman fileenc.c
   * derived from CryptoJS.mode.CTR
   * Jan Hruby jhruby.web@gmail.com
   *)
*/
//# sourceMappingURL=functionsWorker-0.6797890907793287.js.map
