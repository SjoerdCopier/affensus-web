var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-LofGoz/checked-fetch.js
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

// .wrangler/tmp/pages-vGMJ6B/functionsWorker-0.1255477967964156.mjs
var __defProp2 = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var __esm = /* @__PURE__ */ __name((fn, res) => /* @__PURE__ */ __name(function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
}, "__init"), "__esm");
var __export = /* @__PURE__ */ __name((target, all) => {
  for (var name in all)
    __defProp2(target, name, { get: all[name], enumerable: true });
}, "__export");
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
  "../.wrangler/tmp/bundle-a5iEyI/checked-fetch.js"() {
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
    init_functionsRoutes_0_2478363312274945();
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
      cookies[parts[0]] = parts[1];
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
    const createUser = /* @__PURE__ */ __name2(async (db2, email, loginMethod = "facebook") => {
      const stmt = db2.prepare(`
        INSERT OR IGNORE INTO users (email, preferred_login_method, created_at, updated_at)
        VALUES (?, ?, datetime('now'), datetime('now'))
      `);
      const result = await stmt.bind(email, loginMethod).run();
      const user2 = await db2.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
      const isNewUser2 = result.changes > 0;
      return { user: user2, isNewUser: isNewUser2 };
    }, "createUser");
    const updatePreferredLoginMethod = /* @__PURE__ */ __name2(async (db2, email, method) => {
      await db2.prepare(`
        UPDATE users 
        SET preferred_login_method = ?, updated_at = datetime('now')
        WHERE email = ?
      `).bind(method, email).run();
    }, "updatePreferredLoginMethod");
    const { user, isNewUser } = await createUser(db, userInfo.email.toLowerCase(), "facebook");
    await updatePreferredLoginMethod(db, userInfo.email.toLowerCase(), "facebook");
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
    init_functionsRoutes_0_2478363312274945();
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
      cookies[parts[0]] = parts[1];
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
    const createUser = /* @__PURE__ */ __name2(async (db2, email, loginMethod = "github") => {
      const stmt = db2.prepare(`
        INSERT OR IGNORE INTO users (email, preferred_login_method, created_at, updated_at)
        VALUES (?, ?, datetime('now'), datetime('now'))
      `);
      const result = await stmt.bind(email, loginMethod).run();
      const user2 = await db2.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
      const isNewUser2 = result.changes > 0;
      return { user: user2, isNewUser: isNewUser2 };
    }, "createUser");
    const updatePreferredLoginMethod = /* @__PURE__ */ __name2(async (db2, email, method) => {
      await db2.prepare(`
        UPDATE users 
        SET preferred_login_method = ?, updated_at = datetime('now')
        WHERE email = ?
      `).bind(method, email).run();
    }, "updatePreferredLoginMethod");
    const { user, isNewUser } = await createUser(db, userEmail.toLowerCase(), "github");
    await updatePreferredLoginMethod(db, userEmail.toLowerCase(), "github");
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
    init_functionsRoutes_0_2478363312274945();
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
      cookies[parts[0]] = parts[1];
    }
  });
  return cookies;
}
__name(parseCookies3, "parseCookies3");
async function signJwt3(payload, secret, expiresIn) {
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
    const createUser = /* @__PURE__ */ __name2(async (db2, email, loginMethod = "google") => {
      const stmt = db2.prepare(`
        INSERT OR IGNORE INTO users (email, preferred_login_method, created_at, updated_at)
        VALUES (?, ?, datetime('now'), datetime('now'))
      `);
      const result = await stmt.bind(email, loginMethod).run();
      const user2 = await db2.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
      const isNewUser2 = result.changes > 0;
      return { user: user2, isNewUser: isNewUser2 };
    }, "createUser");
    const updatePreferredLoginMethod = /* @__PURE__ */ __name2(async (db2, email, method) => {
      await db2.prepare(`
        UPDATE users 
        SET preferred_login_method = ?, updated_at = datetime('now')
        WHERE email = ?
      `).bind(method, email).run();
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
    const { user, isNewUser } = await createUser(db, userInfo.email.toLowerCase(), "google");
    await updatePreferredLoginMethod(db, userInfo.email.toLowerCase(), "google");
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
    let redirectUrl = `${env.SITE_URL || "http://localhost:3000"}/auth`;
    if (paidParam === "true") {
      redirectUrl = `${env.SITE_URL || "http://localhost:3000"}/auth?paid=true&session_id=${sessionId}`;
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
    headers.append("Set-Cookie", `auth-token=${jwtToken}; HttpOnly; ${secureFlag}SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}; Path=/`);
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
    init_functionsRoutes_0_2478363312274945();
    init_checked_fetch();
    __name2(parseCookies3, "parseCookies");
    __name2(signJwt3, "signJwt");
    __name2(processPendingPayments2, "processPendingPayments");
    __name2(onRequestGet3, "onRequestGet");
  }
});
async function onRequestGet4(context) {
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
__name(onRequestGet4, "onRequestGet4");
var init_facebook = __esm({
  "api/auth/facebook/index.ts"() {
    "use strict";
    init_functionsRoutes_0_2478363312274945();
    init_checked_fetch();
    __name2(onRequestGet4, "onRequestGet");
  }
});
function generateState() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
__name(generateState, "generateState");
async function onRequestGet5(context) {
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
__name(onRequestGet5, "onRequestGet5");
var init_github = __esm({
  "api/auth/github/index.ts"() {
    "use strict";
    init_functionsRoutes_0_2478363312274945();
    init_checked_fetch();
    __name2(generateState, "generateState");
    __name2(onRequestGet5, "onRequestGet");
  }
});
async function onRequestGet6(context) {
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
__name(onRequestGet6, "onRequestGet6");
var init_google = __esm({
  "api/auth/google/index.ts"() {
    "use strict";
    init_functionsRoutes_0_2478363312274945();
    init_checked_fetch();
    __name2(onRequestGet6, "onRequestGet");
  }
});
async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { url } = body;
    if (!url) {
      return new Response(JSON.stringify({ message: "URL is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    let currentUrl = url;
    const redirects = [];
    const visitedUrls = /* @__PURE__ */ new Set();
    while (true) {
      if (visitedUrls.has(currentUrl)) {
        console.log(`Redirect loop detected at URL: ${currentUrl}`);
        redirects.push({
          url: currentUrl,
          status: "error",
          type: "Redirect Loop",
          name: null,
          error: "Redirect loop detected"
        });
        break;
      }
      visitedUrls.add(currentUrl);
      try {
        const response = await fetch(currentUrl, {
          method: "GET",
          redirect: "manual"
        });
        let redirectedUrl = response.headers.get("location");
        let matchName = null;
        for (const patternObj of regexPatterns) {
          if (patternObj.pattern.test(currentUrl)) {
            matchName = patternObj.name;
            break;
          }
        }
        console.log(`Checking URL: ${currentUrl}`);
        if (redirectedUrl) {
          try {
            redirectedUrl = new URL(redirectedUrl, currentUrl).href;
          } catch (urlError) {
            console.log(`Error resolving redirect URL: ${urlError.message}`);
            redirects.push({
              url: currentUrl,
              status: response.status,
              type: "Invalid Redirect URL",
              name: matchName,
              error: urlError.message
            });
            break;
          }
          console.log(`HTTP Redirect detected: ${redirectedUrl}`);
          redirects.push({
            url: currentUrl,
            status: response.status,
            type: "HTTP Redirect",
            name: matchName
          });
          currentUrl = redirectedUrl;
          continue;
        }
        const html = await response.text();
        const metaRedirect = html.match(/<meta[^>]*http-equiv=["']refresh["'][^>]*content=["']\d+;\s*url=([^"']+)/i);
        if (metaRedirect) {
          console.log(`Meta Redirect detected: ${metaRedirect[1]}`);
          currentUrl = metaRedirect[1];
          redirects.push({
            url: currentUrl,
            status: 200,
            type: "Meta Redirect",
            name: matchName
          });
          continue;
        }
        const jsRedirect = html.match(/window\.location\.href\s*=\s*["']([^"']+)["']/i) || html.match(/window\.location\.replace\s*\(\s*["']([^"']+)["']\s*\)/i) || html.match(/window\.location\s*=\s*["']([^"']+)["']/i) || html.match(/location\.href\s*=\s*["']([^"']+)["']/i) || html.match(/location\.replace\s*\(\s*["']([^"']+)["']/i) || html.match(/window\.open\s*\(\s*["']([^"']+)["']/i);
        if (jsRedirect) {
          console.log(`JavaScript Redirect detected: ${jsRedirect[1]}`);
          currentUrl = jsRedirect[1];
          redirects.push({
            url: currentUrl,
            status: 200,
            type: "JavaScript Redirect",
            name: matchName
          });
          continue;
        }
        const htmlRedirect = html.match(/window\.location\.replace\s*\(\s*['"]([^'"]+)['"]\s*\)/i);
        if (htmlRedirect) {
          console.log(`HTML-based Redirect detected: ${htmlRedirect[1]}`);
          currentUrl = htmlRedirect[1];
          redirects.push({
            url: currentUrl,
            status: 200,
            type: "HTML-based Redirect",
            name: matchName
          });
          continue;
        }
        const queryRedirect = new URL(currentUrl).searchParams.get("deeplink") || new URL(currentUrl).searchParams.get("url") || new URL(currentUrl).searchParams.get("u");
        if (queryRedirect) {
          console.log(`Query Parameter Redirect detected: ${queryRedirect}`);
          currentUrl = decodeURIComponent(queryRedirect);
          redirects.push({
            url: currentUrl,
            status: 200,
            type: "Query Parameter Redirect",
            name: matchName
          });
          continue;
        }
        const timeoutRedirect = html.match(/setTimeout\s*\(\s*(?:function\s*\(\s*\)\s*\{\s*)?(?:window\.location\.(?:replace|href)\s*=|location\.(?:replace|href)\s*=)\s*["']([^"']+)["']/i);
        if (timeoutRedirect) {
          console.log(`Delayed JavaScript Redirect detected: ${timeoutRedirect[1]}`);
          currentUrl = timeoutRedirect[1];
          redirects.push({
            url: currentUrl,
            status: 200,
            type: "Delayed JavaScript Redirect",
            name: matchName
          });
          continue;
        }
        if (currentUrl.includes("r.linksprf.com/v1/redirect")) {
          try {
            const response2 = await fetch(currentUrl, {
              method: "GET",
              redirect: "manual",
              headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
              }
            });
            if (response2.status === 302 || response2.status === 301) {
              let redirectedUrl2 = response2.headers.get("location");
              console.log(`Linksprf HTTP Redirect detected: ${redirectedUrl2}`);
              if (redirectedUrl2 && redirectedUrl2.startsWith("/")) {
                const currentUrlObj = new URL(currentUrl);
                redirectedUrl2 = `${currentUrlObj.protocol}//${currentUrlObj.host}${redirectedUrl2}`;
              }
              if (redirectedUrl2) {
                console.log(`Resolved Linksprf redirect URL: ${redirectedUrl2}`);
                currentUrl = redirectedUrl2;
                redirects.push({
                  url: currentUrl,
                  status: response2.status,
                  type: "Linksprf HTTP Redirect",
                  name: matchName
                });
                continue;
              }
            }
            const html2 = await response2.text();
            const scriptRedirect = html2.match(/window\.location\.replace\s*\(\s*['"]([^'"]+)['"]\s*\)/i);
            if (scriptRedirect) {
              let redirectedUrl2 = scriptRedirect[1];
              console.log(`Linksprf Script Redirect detected: ${redirectedUrl2}`);
              if (redirectedUrl2.startsWith("/")) {
                const currentUrlObj = new URL(currentUrl);
                redirectedUrl2 = `${currentUrlObj.protocol}//${currentUrlObj.host}${redirectedUrl2}`;
              }
              console.log(`Resolved Linksprf script redirect URL: ${redirectedUrl2}`);
              currentUrl = redirectedUrl2;
              redirects.push({
                url: currentUrl,
                status: response2.status,
                type: "Linksprf Script Redirect",
                name: matchName
              });
              continue;
            }
            console.log("Linksprf response content:", html2);
          } catch (error) {
            console.log(`Error handling Linksprf URL: ${error.message}`);
          }
        }
        let matchNameFinal = null;
        for (const patternObj of regexPatterns) {
          if (patternObj.pattern.test(currentUrl)) {
            matchNameFinal = patternObj.name;
            break;
          }
        }
        console.log(`No more redirects detected. Final URL: ${currentUrl}`);
        console.log(`Final URL: ${currentUrl}`);
        redirects.push({
          url: currentUrl,
          status: 200,
          type: "Final URL",
          name: matchNameFinal
        });
        break;
      } catch (redirectError) {
        console.log(`Redirect Error: ${redirectError.message}`);
        redirects.push({
          url: currentUrl,
          status: "error",
          type: "Redirect Error",
          name: null,
          error: redirectError.message
        });
        break;
      }
    }
    return new Response(JSON.stringify({ redirects }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ message: "An error occurred", error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost, "onRequestPost");
var regexPatterns;
var init_affiliate_link_checker = __esm({
  "api/tools/affiliate-link-checker.ts"() {
    "use strict";
    init_functionsRoutes_0_2478363312274945();
    init_checked_fetch();
    regexPatterns = [
      { name: "Daisycon", pattern: /c\/\?si=(\d+)|ds1\.nl\/c\/.*?si=(\d+)|lt45\.net\/c\/.*?si=(\d+)|\/csd\/\?si=(\d+)&li=(\d+)&wi=(\d+)|jf79\.net\/c\/.*?si=(\d+)/, matches: [], networkId: 1 },
      { name: "Daisycon", pattern: /c\/\?si=(\d+)/, matches: [], networkId: 1 },
      { name: "Brandreward", pattern: /brandreward\.com\/?(?:\?key=[^&]+&url=([^&]+))/, matches: [], networkId: 2 },
      { name: "TradeTracker", pattern: /https:\/\/tc\.tradetracker\.net\/\?c=(\d+)|\/tt\/\?tt=(\d+)_/, matches: [], networkId: 3 },
      { name: "TradeTracker", pattern: /tt=(\d+)_/, matches: [], networkId: 3 },
      { name: "TradeTracker", pattern: /\/tt\/index\.php\?tt=(\d+)/, matches: [], networkId: 3 },
      { name: "TradeTracker", pattern: /c\?c=(\d+)/, matches: [], networkId: 3 },
      { name: "Tradedoubler", pattern: /tradedoubler\.com/, matches: [], networkId: 4 },
      { name: "Awin", pattern: /awinmid=(\d+)|awin1\.com.*?(?:mid|id)=(\d+)/, matches: [], networkId: 5 },
      { name: "Awin", pattern: /awin1\.com/, matches: [], networkId: 5 },
      { name: "Adservice", pattern: /ADSERVICEID=(\d+)|adservicemedia\.dk\/cgi-bin\/click\.pl\?.*?cid=(\d+)/, matches: [], networkId: 6 },
      { name: "Kwanko", pattern: /metaffiliation\.com/, matches: [], networkId: 7 },
      { name: "Adrecord", pattern: /click\.adrecord\.com\/?\?c=\d+&p=(\d+)|click\.adrecord\.com\/?\?c=\d+&amp;p=(\d+)/, matches: [], networkId: 8 },
      { name: "Partnerize", pattern: /prf\.hn\/click\/camref:(.*?)(\/|$)|PARTNERIZEID:(.*?)|prf\.hn\/click\/camref:([^/]+)/, matches: [], networkId: 9 },
      { name: "Partnerize", pattern: /prf\.hn\/click\/camref:([^/]+)/, matches: [], networkId: 9 },
      { name: "Partnerize", pattern: /camref:.*?\/pubref:/, matches: [], networkId: 9 },
      { name: "Partner Ads", pattern: /klikbanner\.php\?.*bannerid=([^&]+)/, matches: [], networkId: 10 },
      { name: "Adtraction", pattern: /\/t\/t\?a=(\d+)/, matches: [], networkId: 11 },
      { name: "Cj", pattern: /CJID=([a-zA-Z0-9]+)|cj\.dotomi\.com/, matches: [], networkId: 12 },
      { name: "Admitad", pattern: /\.com\/g\/([a-zA-Z0-9]+)/, matches: [], networkId: 13 },
      { name: "Digidip", pattern: /digidip\.net\/visit\?url=([^&]+)/, matches: [], networkId: 14 },
      { name: "Salestring", pattern: /salestring\.com\/aff_c\?offer_id=([0-9]+)/, matches: [], networkId: 15 },
      { name: "Flexoffers", pattern: /trid=([0-9]+)/, matches: [], networkId: 16 },
      { name: "Flexoffers", pattern: /track\.flexlinkspro\.com/, matches: [], networkId: 16 },
      { name: "Impact", pattern: /impact\.[a-zA-Z0-9-]+\.com\/c\/|\/c\/[0-9]+\/[0-9]+\/([0-9]+)/, matches: [], networkId: 17 },
      { name: "Webgains", pattern: /wgprogramid=([0-9]+)/, matches: [], networkId: 18 },
      { name: "Circlewise", pattern: /trackmytarget\.com\/\?a=([^&#]+)/, matches: [], networkId: 19 },
      { name: "Optimise", pattern: /https?:\/\/clk\.omgt3\.com\/\?.*PID=([0-9]+).*/, matches: [], networkId: 20 },
      { name: "Partnerboost", pattern: /https?:\/\/app\.partnermatic\.com\/track\/([a-zA-Z0-9_\-]+)\?/, matches: [], networkId: 21 },
      { name: "Involveasia", pattern: /\/aff_m\?offer_id=([0-9]+)/, matches: [], networkId: 22 },
      { name: "Chinesean", pattern: /https?:\/\/www\.chinesean\.com\/affiliate\/clickBanner\.do\?.*pId=(\d+)/, matches: [], networkId: 23 },
      { name: "Rakuten", pattern: /https:\/\/click\.linksynergy\.com\/(?:deeplink\?|link\?)(?:.*&)?(?:mid|offerid)=(\d+)/, matches: [], networkId: 24 },
      { name: "Yieldkit", pattern: /https:\/\/r\.linksprf\.com/, matches: [], networkId: 25 },
      { name: "Indoleads", pattern: /\.xyz\/([a-zA-Z0-9]+)/, matches: [], networkId: 26 },
      { name: "Commissionfactory", pattern: /https:\/\/t\.cfjump\.com\/[0-9]+\/t\/([0-9]+)/, matches: [], networkId: 27 },
      { name: "Accesstrade", pattern: /https?:\/\/(?:atsg\.me|atmy\.me|atid\.me|accesstra\.de)\/([a-zA-Z0-9]+)/, matches: [], networkId: 28 },
      { name: "Yadore", pattern: /yadore\.com\/v2\/d\?url=(.*?)&market/, matches: [], networkId: 29 },
      { name: "Yadore", pattern: /yadore\.com/, matches: [], networkId: 29 },
      { name: "Skimlinks", pattern: /https:\/\/go\.skimresources\.com.*?url=((http%3A%2F%2F|https%3A%2F%2F|http:\/\/|https:\/\/)[\w.-]+)/, matches: [], networkId: 30 },
      { name: "Addrevenue", pattern: /https:\/\/addrevenue\.io\/t\?c=[0-9]+&a=([0-9]+)/, matches: [], networkId: 33 },
      { name: "Timeone", pattern: /https:\/\/tracking\.publicidees\.com\/clic\.php\?.*progid=(\d+)/, matches: [], networkId: 35 },
      { name: "Glopss", pattern: /glopss\.com\/aff_c\?offer_id=([0-9]+)/, matches: [], networkId: 36 },
      { name: "RetailAds", pattern: /retailads\.net\/tc\.php\?t=([a-zA-Z0-9]+)/, matches: [], networkId: 38 },
      { name: "Shareasale", pattern: /shareasale/, matches: [], networkId: 39 },
      { name: "Kelkoo", pattern: /kelkoogroup\.net/, matches: [], networkId: 40 },
      { name: "Takeads", pattern: /tatrck\.com/, matches: [], networkId: 45 },
      { name: "Belboon", pattern: /\/ts\/.*?\/tsc/, matches: [], networkId: 31 },
      { name: "HealthTrader", pattern: /track\.healthtrader\.com/, matches: [], networkId: 48 },
      { name: "Sourceknowledge", pattern: /provenpixel\.com\/plp\.php|sktng0/, matches: [], networkId: 999 },
      { name: "Linkbux", pattern: /linkbux\.com\/track/, matches: [], networkId: 998 },
      { name: "PointClickTrack", pattern: /clcktrck\.com/, matches: [], networkId: 997 },
      { name: "Pepperjam", pattern: /pepperjamnetwork\.com/, matches: [], networkId: 996 },
      { name: "OpieNetwork", pattern: /tracking\.opienetwork\.com/, matches: [], networkId: 995 },
      { name: "Vcommission", pattern: /vcommission\.com/, matches: [], networkId: 994 },
      { name: "MissAffiliate", pattern: /missaffiliate\.com/, matches: [], networkId: 993 },
      { name: "Ga-Net", pattern: /ga-net\.com/, matches: [], networkId: 992 },
      { name: "Affisereach", pattern: /reachclk\.com/, matches: [], networkId: 990 },
      { name: "opienetwork", pattern: /opienetwork\.com/, matches: [], networkId: 990 },
      { name: "Fatcoupon", pattern: /fatcoupon\.com/, matches: [], networkId: 989 },
      { name: "Adcell", pattern: /adcell\.com/, matches: [], networkId: 988 },
      { name: "blueaff", pattern: /blueaff\.com/, matches: [], networkId: 987 },
      { name: "DigiDum", pattern: /digidum/, matches: [], networkId: 986 },
      { name: "AdIndex", pattern: /adindex/, matches: [], networkId: 985 }
    ];
    __name2(onRequestPost, "onRequestPost");
  }
});
async function onRequestGet7(context) {
  try {
    const { env } = context;
    const uptimeKumaSecret = env.UPTIME_KUMA_SECRET;
    if (!uptimeKumaSecret) {
      return new Response(JSON.stringify({ error: "Uptime Kuma secret not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    let metricsText = "";
    let success = false;
    try {
      const monitorsResponse = await fetch(`${env.UPTIME_KUMA_URL || "http://152.42.135.243:3001"}/metrics`, {
        headers: {
          "Authorization": `Basic ${btoa(":" + uptimeKumaSecret)}`,
          "Accept": "text/plain"
        }
      });
      if (monitorsResponse.ok) {
        metricsText = await monitorsResponse.text();
        console.log("Metrics response preview:", metricsText.substring(0, 200));
        if (metricsText.startsWith("<!DOCTYPE") || metricsText.includes("<html")) {
          console.log("Received HTML instead of metrics, trying alternative approach");
        } else {
          success = true;
        }
      } else {
        console.error("Metrics endpoint failed:", monitorsResponse.status, monitorsResponse.statusText);
      }
    } catch (error) {
      console.error("Error fetching metrics:", error);
    }
    if (!success) {
      console.log("All API attempts failed - providing fallback response");
      const isCloudflareEnv = typeof caches !== "undefined";
      const usingPrivateIp = !env.UPTIME_KUMA_URL && isCloudflareEnv;
      let errorMessage = "Unable to fetch data from Uptime Kuma";
      if (usingPrivateIp) {
        errorMessage += " - Private IP access blocked in production. Please configure UPTIME_KUMA_URL environment variable with a public domain.";
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
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }
    const processedDomains = await processPrometheusMetrics(metricsText, env.UPTIME_KUMA_URL);
    return new Response(JSON.stringify(processedDomains), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
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
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }
}
__name(onRequestGet7, "onRequestGet7");
async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
__name(onRequestOptions, "onRequestOptions");
async function fetchStatusPageData(networkName, uptimeKumaUrl) {
  try {
    const url = `${uptimeKumaUrl || "http://152.42.135.243:3001"}/api/status-page/heartbeat/${networkName}?limit=10080`;
    console.log(`Fetching status page from: ${url}`);
    const response = await fetch(url);
    console.log(`Status page response for ${networkName}:`, response.status, response.statusText);
    if (!response.ok) {
      console.log(`Status page not found for ${networkName}: ${response.status}`);
      return null;
    }
    const data = await response.json();
    console.log(`Status page data for ${networkName}:`, {
      hasHeartbeatList: !!data.heartbeatList,
      heartbeatKeys: data.heartbeatList ? Object.keys(data.heartbeatList) : [],
      totalHeartbeats: data.heartbeatList ? Object.values(data.heartbeatList).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0) : 0
    });
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
    const networkName = domain.domain;
    console.log(`Checking status page for network: ${networkName}`);
    const statusPageData = await fetchStatusPageData(networkName, uptimeKumaUrl);
    if (statusPageData && statusPageData.heartbeatList && Object.keys(statusPageData.heartbeatList).length > 0) {
      console.log(`Status page found for ${networkName}, heartbeats:`, Object.keys(statusPageData.heartbeatList).length);
      domain.hasStatusPage = true;
      if (statusPageData.uptimeList) {
        domain.uptimeList = statusPageData.uptimeList;
        console.log(`Added uptimeList to domain ${domain.domain}:`, statusPageData.uptimeList);
      }
      domain.urls.forEach((url) => {
        url.hasStatusPage = true;
        if (statusPageData.uptimeList) {
          url.uptimeList = statusPageData.uptimeList;
          console.log(`Added uptimeList to URL ${url.type}:`, statusPageData.uptimeList);
        }
        const allHeartbeats = [];
        console.log(`Processing heartbeats for ${domain.domain}, heartbeatList keys:`, Object.keys(statusPageData.heartbeatList));
        Object.entries(statusPageData.heartbeatList).forEach(([monitorId, heartbeatArray]) => {
          console.log(`Monitor ${monitorId} heartbeats:`, Array.isArray(heartbeatArray) ? heartbeatArray.length : "not array");
          if (Array.isArray(heartbeatArray)) {
            heartbeatArray.forEach((heartbeat) => {
              if (heartbeat && typeof heartbeat === "object" && "status" in heartbeat) {
                allHeartbeats.push(heartbeat);
              }
            });
          }
        });
        console.log(`Total individual heartbeats collected for ${domain.domain}:`, allHeartbeats.length);
        url.heartbeats = allHeartbeats.sort(
          (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
        );
        console.log(`Final heartbeats assigned to ${domain.domain} ${url.type}:`, url.heartbeats.length);
        if (url.heartbeats.length > 0) {
          console.log(`Sample heartbeats:`, url.heartbeats.slice(0, 3));
        }
      });
      domainsWithStatusPages.push(domain);
    } else {
      console.log(`No status page found for ${networkName}`);
    }
  }
  console.log(`Total domains with status pages: ${domainsWithStatusPages.length}`);
  domainsWithStatusPages.forEach((domain) => {
    if (domain.urls.length > 0) {
      domain.avg_uptime_percentage = domain.urls.reduce((sum, url) => sum + url.avg_uptime_percentage, 0) / domain.urls.length;
    }
  });
  return domainsWithStatusPages;
}
__name(processPrometheusMetrics, "processPrometheusMetrics");
var init_affiliate_network_uptime = __esm({
  "api/tools/affiliate-network-uptime.ts"() {
    "use strict";
    init_functionsRoutes_0_2478363312274945();
    init_checked_fetch();
    __name2(onRequestGet7, "onRequestGet");
    __name2(onRequestOptions, "onRequestOptions");
    __name2(fetchStatusPageData, "fetchStatusPageData");
    __name2(processPrometheusMetrics, "processPrometheusMetrics");
  }
});
var routes;
var init_functionsRoutes_0_2478363312274945 = __esm({
  "../.wrangler/tmp/pages-vGMJ6B/functionsRoutes-0.2478363312274945.mjs"() {
    "use strict";
    init_callback();
    init_callback2();
    init_callback3();
    init_facebook();
    init_github();
    init_google();
    init_affiliate_link_checker();
    init_affiliate_network_uptime();
    init_affiliate_network_uptime();
    routes = [
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
        routePath: "/api/auth/facebook",
        mountPath: "/api/auth/facebook",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet4]
      },
      {
        routePath: "/api/auth/github",
        mountPath: "/api/auth/github",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet5]
      },
      {
        routePath: "/api/auth/google",
        mountPath: "/api/auth/google",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet6]
      },
      {
        routePath: "/api/tools/affiliate-link-checker",
        mountPath: "/api/tools",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost]
      },
      {
        routePath: "/api/tools/affiliate-network-uptime",
        mountPath: "/api/tools",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet7]
      },
      {
        routePath: "/api/tools/affiliate-network-uptime",
        mountPath: "/api/tools",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions]
      }
    ];
  }
});
init_functionsRoutes_0_2478363312274945();
init_checked_fetch();
init_functionsRoutes_0_2478363312274945();
init_checked_fetch();
init_functionsRoutes_0_2478363312274945();
init_checked_fetch();
init_functionsRoutes_0_2478363312274945();
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
init_functionsRoutes_0_2478363312274945();
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
init_functionsRoutes_0_2478363312274945();
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
init_functionsRoutes_0_2478363312274945();
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

// .wrangler/tmp/bundle-LofGoz/middleware-insertion-facade.js
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

// .wrangler/tmp/bundle-LofGoz/middleware-loader.entry.ts
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
//# sourceMappingURL=functionsWorker-0.1255477967964156.js.map
