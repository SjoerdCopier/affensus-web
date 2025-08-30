var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// ../.wrangler/tmp/bundle-OAnean/checked-fetch.js
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
var urls;
var init_checked_fetch = __esm({
  "../.wrangler/tmp/bundle-OAnean/checked-fetch.js"() {
    "use strict";
    urls = /* @__PURE__ */ new Set();
    __name(checkURL, "checkURL");
    globalThis.fetch = new Proxy(globalThis.fetch, {
      apply(target, thisArg, argArray) {
        const [request, init] = argArray;
        checkURL(request, init);
        return Reflect.apply(target, thisArg, argArray);
      }
    });
  }
});

// api/auth/shared/email-notifications.ts
var email_notifications_exports = {};
__export(email_notifications_exports, {
  sendNewUserNotification: () => sendNewUserNotification
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
var init_email_notifications = __esm({
  "api/auth/shared/email-notifications.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
    init_checked_fetch();
    __name(sendNewUserNotification, "sendNewUserNotification");
  }
});

// api/auth/facebook/callback.ts
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
    const createUser2 = /* @__PURE__ */ __name(async (db2, email, loginMethod = "facebook") => {
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
    const updatePreferredLoginMethod2 = /* @__PURE__ */ __name(async (db2, email, method) => {
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
var init_callback = __esm({
  "api/auth/facebook/callback.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
    init_checked_fetch();
    __name(parseCookies, "parseCookies");
    __name(signJwt, "signJwt");
    __name(onRequestGet, "onRequestGet");
  }
});

// api/auth/github/callback.ts
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
    const createUser2 = /* @__PURE__ */ __name(async (db2, email, loginMethod = "github") => {
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
    const updatePreferredLoginMethod2 = /* @__PURE__ */ __name(async (db2, email, method) => {
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
var init_callback2 = __esm({
  "api/auth/github/callback.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
    init_checked_fetch();
    __name(parseCookies2, "parseCookies");
    __name(signJwt2, "signJwt");
    __name(processPendingPayments, "processPendingPayments");
    __name(onRequestGet2, "onRequestGet");
  }
});

// api/auth/google/callback.ts
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
    const createUser2 = /* @__PURE__ */ __name(async (db2, email, loginMethod = "google") => {
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
    const updatePreferredLoginMethod2 = /* @__PURE__ */ __name(async (db2, email, method) => {
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
    const { user, isNewUser } = await createUser2(db, userInfo.email.toLowerCase(), "google");
    await updatePreferredLoginMethod2(db, userInfo.email.toLowerCase(), "google");
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
var init_callback3 = __esm({
  "api/auth/google/callback.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
    init_checked_fetch();
    __name(parseCookies3, "parseCookies");
    __name(signJwt3, "signJwt");
    __name(processPendingPayments2, "processPendingPayments");
    __name(onRequestGet3, "onRequestGet");
  }
});

// api/user/progress/[courseId]/index.ts
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
var init_courseId = __esm({
  "api/user/progress/[courseId]/index.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
    init_checked_fetch();
    __name(onRequestGet4, "onRequestGet");
    __name(onRequestPost, "onRequestPost");
  }
});

// api/job/[job_id]/monitor.ts
async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
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
var init_monitor = __esm({
  "api/job/[job_id]/monitor.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
    init_checked_fetch();
    __name(onRequestOptions, "onRequestOptions");
    __name(onRequestGet5, "onRequestGet");
  }
});

// api/job/[job_id]/status.ts
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
var init_status = __esm({
  "api/job/[job_id]/status.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
    init_checked_fetch();
    __name(onRequestOptions2, "onRequestOptions");
    __name(onRequestGet6, "onRequestGet");
  }
});

// api/projects/[project_id]/credentials-summary.ts
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
var init_credentials_summary = __esm({
  "api/projects/[project_id]/credentials-summary.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
    init_checked_fetch();
    __name(onRequestOptions3, "onRequestOptions");
    __name(onRequestGet7, "onRequestGet");
  }
});

// api/projects/[project_id]/merchants.ts
async function onRequestOptions4() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
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
var init_merchants = __esm({
  "api/projects/[project_id]/merchants.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
    init_checked_fetch();
    __name(onRequestOptions4, "onRequestOptions");
    __name(onRequestGet8, "onRequestGet");
  }
});

// api/projects/[project_id]/networks.ts
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
    console.log("Networks API Response:", JSON.stringify(data, null, 2));
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
var init_networks = __esm({
  "api/projects/[project_id]/networks.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
    init_checked_fetch();
    __name(onRequestOptions5, "onRequestOptions");
    __name(onRequestGet9, "onRequestGet");
  }
});

// api/projects/[project_id]/search.ts
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
async function onRequestGet10(context) {
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
var cache, CACHE_TTL, ongoingRequests;
var init_search = __esm({
  "api/projects/[project_id]/search.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
    init_checked_fetch();
    cache = /* @__PURE__ */ new Map();
    CACHE_TTL = 5 * 60 * 1e3;
    ongoingRequests = /* @__PURE__ */ new Map();
    __name(onRequestOptions6, "onRequestOptions");
    __name(onRequestGet10, "onRequestGet");
  }
});

// api/auth/facebook/index.ts
async function onRequestGet11(context) {
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
var init_facebook = __esm({
  "api/auth/facebook/index.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
    init_checked_fetch();
    __name(onRequestGet11, "onRequestGet");
  }
});

// api/auth/github/index.ts
function generateState() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
async function onRequestGet12(context) {
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
var init_github = __esm({
  "api/auth/github/index.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
    init_checked_fetch();
    __name(generateState, "generateState");
    __name(onRequestGet12, "onRequestGet");
  }
});

// api/auth/google/index.ts
async function onRequestGet13(context) {
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
var init_google = __esm({
  "api/auth/google/index.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
    init_checked_fetch();
    __name(onRequestGet13, "onRequestGet");
  }
});

// api/auth/register/index.ts
async function onRequestOptions7() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
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
var init_register = __esm({
  "api/auth/register/index.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
    init_checked_fetch();
    __name(onRequestOptions7, "onRequestOptions");
    __name(onRequestPost2, "onRequestPost");
  }
});

// ../src/lib/jwt.ts
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
var JWT_ALGORITHM, JWT_HEADER;
var init_jwt = __esm({
  "../src/lib/jwt.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
    init_checked_fetch();
    JWT_ALGORITHM = "HS256";
    JWT_HEADER = { alg: JWT_ALGORITHM, typ: "JWT" };
    __name(signJwt4, "signJwt");
    __name(verifyJwt, "verifyJwt");
  }
});

// api/profile/billing-address.ts
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
async function onRequestGet14(context) {
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
async function onRequestPut(context) {
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
var init_billing_address = __esm({
  "api/profile/billing-address.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
    init_checked_fetch();
    init_jwt();
    __name(parseCookies4, "parseCookies");
    __name(onRequestGet14, "onRequestGet");
    __name(onRequestPut, "onRequestPut");
  }
});

// api/profile/completion-status.ts
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
async function onRequestGet15(context) {
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
var init_completion_status = __esm({
  "api/profile/completion-status.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
    init_checked_fetch();
    init_jwt();
    __name(parseCookies5, "parseCookies");
    __name(getUserById, "getUserById");
    __name(onRequestGet15, "onRequestGet");
  }
});

// api/profile/invoices.ts
async function getUserInvoices(db, userId) {
  return await db.prepare(`
    SELECT * FROM stripe_invoices 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT 50
  `).bind(userId).all();
}
async function onRequestGet16(context) {
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
var init_invoices = __esm({
  "api/profile/invoices.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
    init_checked_fetch();
    init_jwt();
    __name(getUserInvoices, "getUserInvoices");
    __name(onRequestGet16, "onRequestGet");
  }
});

// api/profile/preferences.ts
async function getUserPreferences(db, userId) {
  return await db.prepare(`
    SELECT * FROM user_preferences 
    WHERE user_id = ?
  `).bind(userId).first();
}
async function createDefaultPreferences(db, userId) {
  await db.prepare(`
    INSERT INTO user_preferences (user_id, speed_preference, audio_enabled, notifications_enabled, theme, language)
    VALUES (?, 20, 1, 1, 'light', 'en')
  `).bind(userId).run();
  return await getUserPreferences(db, userId);
}
async function onRequestGet17(context) {
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
var init_preferences = __esm({
  "api/profile/preferences.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
    init_checked_fetch();
    init_jwt();
    __name(getUserPreferences, "getUserPreferences");
    __name(createDefaultPreferences, "createDefaultPreferences");
    __name(onRequestGet17, "onRequestGet");
  }
});

// ../src/lib/invoice-generator.ts
var invoice_generator_exports = {};
__export(invoice_generator_exports, {
  calculateTax: () => calculateTax,
  createCreditNote: () => createCreditNote,
  createInvoiceRecord: () => createInvoiceRecord,
  generateInvoiceNumber: () => generateInvoiceNumber,
  getUserBillingAddress: () => getUserBillingAddress,
  processPendingInvoices: () => processPendingInvoices
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
var init_invoice_generator = __esm({
  "../src/lib/invoice-generator.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
    init_checked_fetch();
    __name(generateInvoiceNumber, "generateInvoiceNumber");
    __name(calculateTax, "calculateTax");
    __name(createInvoiceRecord, "createInvoiceRecord");
    __name(createCreditNote, "createCreditNote");
    __name(getUserBillingAddress, "getUserBillingAddress");
    __name(processPendingInvoices, "processPendingInvoices");
  }
});

// api/profile/process-pending-invoices.ts
async function onRequestOptions8() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
async function onRequestPost3(context) {
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
var init_process_pending_invoices = __esm({
  "api/profile/process-pending-invoices.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
    init_checked_fetch();
    init_jwt();
    __name(onRequestOptions8, "onRequestOptions");
    __name(onRequestPost3, "onRequestPost");
  }
});

// api/queue/status.ts
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
async function onRequestGet18(context) {
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
var init_status2 = __esm({
  "api/queue/status.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
    init_checked_fetch();
    __name(onRequestOptions9, "onRequestOptions");
    __name(onRequestGet18, "onRequestGet");
  }
});

// api/tools/affiliate-link-checker.ts
async function onRequestPost4(context) {
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
var regexPatterns;
var init_affiliate_link_checker = __esm({
  "api/tools/affiliate-link-checker.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
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
    __name(onRequestPost4, "onRequestPost");
  }
});

// api/tools/affiliate-network-uptime.ts
async function onRequestGet19(context) {
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
        if (metricsText.startsWith("<!DOCTYPE") || metricsText.includes("<html")) {
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
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "public, max-age=300, s-maxage=600"
        // 5 min client, 10 min CDN
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
async function onRequestOptions10() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
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
async function fetchStatusPageData(networkName, uptimeKumaUrl) {
  try {
    const url = `${uptimeKumaUrl || "http://152.42.135.243:3001"}/api/status-page/heartbeat/${networkName}?limit=10080`;
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
var init_affiliate_network_uptime = __esm({
  "api/tools/affiliate-network-uptime.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
    init_checked_fetch();
    __name(onRequestGet19, "onRequestGet");
    __name(onRequestOptions10, "onRequestOptions");
    __name(formatNetworkDisplayName, "formatNetworkDisplayName");
    __name(fetchStatusPageData, "fetchStatusPageData");
    __name(processPrometheusMetrics, "processPrometheusMetrics");
  }
});

// ../src/pricing-plans.json
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

// ../src/locales/settings.ts
var locales;
var init_settings = __esm({
  "../src/locales/settings.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
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

// api/stripe/create-checkout-session.ts
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
var onRequest;
var init_create_checkout_session = __esm({
  "api/stripe/create-checkout-session.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
    init_checked_fetch();
    init_pricing_plans();
    init_settings();
    __name(parseCookies6, "parseCookies");
    onRequest = /* @__PURE__ */ __name(async (context) => {
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

// api/stripe/create-portal-session.ts
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
async function getUserByEmail(db, email) {
  return await db.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
}
var onRequest2;
var init_create_portal_session = __esm({
  "api/stripe/create-portal-session.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
    init_checked_fetch();
    __name(verifyJwt2, "verifyJwt");
    __name(parseCookies7, "parseCookies");
    __name(getUserByEmail, "getUserByEmail");
    onRequest2 = /* @__PURE__ */ __name(async (context) => {
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

// api/stripe/create-user-account.ts
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
async function updateStripeCustomerId(db, email, stripeCustomerId) {
  await db.prepare(`
    UPDATE users 
    SET stripe_customer_id = ?, updated_at = datetime('now')
    WHERE email = ?
  `).bind(stripeCustomerId, email).run();
}
var onRequest3;
var init_create_user_account = __esm({
  "api/stripe/create-user-account.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
    init_checked_fetch();
    init_jwt();
    __name(createUserAccount, "createUserAccount");
    __name(updateStripeCustomerId, "updateStripeCustomerId");
    onRequest3 = /* @__PURE__ */ __name(async (context) => {
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

// api/stripe/webhook.ts
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
var onRequest4;
var init_webhook = __esm({
  "api/stripe/webhook.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
    init_checked_fetch();
    __name(handlePaymentWithoutCustomer, "handlePaymentWithoutCustomer");
    __name(sendPaymentConfirmationEmail, "sendPaymentConfirmationEmail");
    __name(updateUserSubscription, "updateUserSubscription");
    __name(createInvoiceRecord2, "createInvoiceRecord");
    __name(verifyStripeSignature, "verifyStripeSignature");
    onRequest4 = /* @__PURE__ */ __name(async (context) => {
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

// api/invoice/[invoiceNumber].ts
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
async function onRequestGet20(context) {
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
function generateInvoiceHTML(invoice) {
  const isCredit = invoice.invoice_type === "credit_note";
  const amountPrefix = isCredit ? "-" : "";
  const documentTitle = isCredit ? "CREDIT NOTE" : "INVOICE";
  const formatAmount = /* @__PURE__ */ __name((amount) => {
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
var init_invoiceNumber = __esm({
  "api/invoice/[invoiceNumber].ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
    init_checked_fetch();
    init_jwt();
    __name(onRequestOptions11, "onRequestOptions");
    __name(onRequestGet20, "onRequestGet");
    __name(generateInvoiceHTML, "generateInvoiceHTML");
  }
});

// api/users/[userId]/index.ts
async function onRequestOptions12() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
async function onRequestGet21(context) {
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
var init_userId = __esm({
  "api/users/[userId]/index.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
    init_checked_fetch();
    __name(onRequestOptions12, "onRequestOptions");
    __name(onRequestGet21, "onRequestGet");
  }
});

// api/contact/index.ts
async function onRequestPost5(context) {
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
var init_contact = __esm({
  "api/contact/index.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
    init_checked_fetch();
    __name(onRequestPost5, "onRequestPost");
  }
});

// api/import-network.ts
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
async function onRequestPost6(context) {
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
var init_import_network = __esm({
  "api/import-network.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
    init_checked_fetch();
    __name(onRequestOptions13, "onRequestOptions");
    __name(onRequestPost6, "onRequestPost");
  }
});

// api/logout/index.ts
async function onRequestPost7(context) {
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
var init_logout = __esm({
  "api/logout/index.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
    init_checked_fetch();
    __name(onRequestPost7, "onRequestPost");
  }
});

// api/magic-login/index.ts
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
async function processPendingPayments3(email, userId, stripeSecretKey) {
  try {
    console.log(`Processing pending payments for user ${userId} (${email})`);
  } catch (error) {
    console.error("Error processing pending payments:", error);
  }
}
async function onRequestGet22(context) {
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
var init_magic_login = __esm({
  "api/magic-login/index.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
    init_checked_fetch();
    __name(signJwt5, "signJwt");
    __name(getMagicLinkByToken, "getMagicLinkByToken");
    __name(markMagicLinkAsUsed, "markMagicLinkAsUsed");
    __name(getUserByEmail2, "getUserByEmail");
    __name(updatePreferredLoginMethod, "updatePreferredLoginMethod");
    __name(processPendingPayments3, "processPendingPayments");
    __name(onRequestGet22, "onRequestGet");
  }
});

// api/mistake-report/index.ts
async function onRequestPost8(context) {
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
var init_mistake_report = __esm({
  "api/mistake-report/index.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
    init_checked_fetch();
    __name(onRequestPost8, "onRequestPost");
  }
});

// api/network-monitors/index.ts
async function onRequestOptions14() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
async function onRequestGet23(context) {
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
async function onRequestPost9(context) {
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
async function onRequestPut2(context) {
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
async function onRequestDelete(context) {
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
var init_network_monitors = __esm({
  "api/network-monitors/index.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
    init_checked_fetch();
    __name(onRequestOptions14, "onRequestOptions");
    __name(onRequestGet23, "onRequestGet");
    __name(onRequestPost9, "onRequestPost");
    __name(onRequestPut2, "onRequestPut");
    __name(onRequestDelete, "onRequestDelete");
  }
});

// api/profile/index.ts
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
async function getUserById2(db, userId) {
  return await db.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first();
}
async function updateUser(db, userId, data) {
  const { firstName, lastName } = data;
  await db.prepare(`
    UPDATE users 
    SET first_name = ?, last_name = ?, updated_at = datetime('now')
    WHERE id = ?
  `).bind(firstName, lastName, userId).run();
  return await getUserById2(db, userId);
}
async function onRequestGet24(context) {
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
async function onRequestPut3(context) {
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
var init_profile = __esm({
  "api/profile/index.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
    init_checked_fetch();
    init_jwt();
    __name(parseCookies8, "parseCookies");
    __name(getUserById2, "getUserById");
    __name(updateUser, "updateUser");
    __name(onRequestGet24, "onRequestGet");
    __name(onRequestPut3, "onRequestPut");
  }
});

// api/refund-request/index.ts
async function onRequestOptions15() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
async function onRequestPost10(context) {
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
var init_refund_request = __esm({
  "api/refund-request/index.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
    init_checked_fetch();
    init_jwt();
    __name(onRequestOptions15, "onRequestOptions");
    __name(onRequestPost10, "onRequestPost");
  }
});

// api/request-magic-link/index.ts
function generateToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
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
async function createMagicLink(db, email, token) {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1e3);
  const stmt = db.prepare(`
    INSERT INTO magic_links (email, token, expires_at, created_at)
    VALUES (?, ?, ?, datetime('now'))
  `);
  await stmt.bind(email, token, expiresAt.toISOString()).run();
}
async function cleanupExpiredMagicLinks(db) {
  await db.prepare('DELETE FROM magic_links WHERE expires_at < datetime("now")').run();
}
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
async function onRequestPost11(context) {
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
var init_request_magic_link = __esm({
  "api/request-magic-link/index.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
    init_checked_fetch();
    __name(generateToken, "generateToken");
    __name(createUser, "createUser");
    __name(createMagicLink, "createMagicLink");
    __name(cleanupExpiredMagicLinks, "cleanupExpiredMagicLinks");
    __name(sendMagicLinkEmail, "sendMagicLinkEmail");
    __name(onRequestPost11, "onRequestPost");
  }
});

// api/user/index.ts
async function onRequestOptions16() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
async function onRequestGet25(context) {
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
var init_user = __esm({
  "api/user/index.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
    init_checked_fetch();
    init_jwt();
    __name(onRequestOptions16, "onRequestOptions");
    __name(onRequestGet25, "onRequestGet");
  }
});

// api/user-preferences.ts
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
async function getUserByEmail3(db, email) {
  return await db.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
}
async function onRequestGet26(context) {
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
      const decoded = await verifyJwt3(token, jwtSecret);
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
var init_user_preferences = __esm({
  "api/user-preferences.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
    init_checked_fetch();
    __name(verifyJwt3, "verifyJwt");
    __name(parseCookies9, "parseCookies");
    __name(getUserByEmail3, "getUserByEmail");
    __name(onRequestGet26, "onRequestGet");
  }
});

// api/currency-rates.ts
var onRequest5;
var init_currency_rates = __esm({
  "api/currency-rates.ts"() {
    "use strict";
    init_functionsRoutes_0_3883291400772385();
    init_checked_fetch();
    init_settings();
    onRequest5 = /* @__PURE__ */ __name(async (context) => {
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

// ../.wrangler/tmp/pages-iC2Pv8/functionsRoutes-0.3883291400772385.mjs
var routes;
var init_functionsRoutes_0_3883291400772385 = __esm({
  "../.wrangler/tmp/pages-iC2Pv8/functionsRoutes-0.3883291400772385.mjs"() {
    "use strict";
    init_callback();
    init_callback2();
    init_callback3();
    init_courseId();
    init_courseId();
    init_monitor();
    init_monitor();
    init_status();
    init_status();
    init_credentials_summary();
    init_credentials_summary();
    init_merchants();
    init_merchants();
    init_networks();
    init_networks();
    init_search();
    init_search();
    init_facebook();
    init_github();
    init_google();
    init_register();
    init_register();
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
    init_import_network();
    init_import_network();
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
    init_refund_request();
    init_refund_request();
    init_request_magic_link();
    init_user();
    init_user();
    init_user_preferences();
    init_currency_rates();
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
        modules: [onRequestOptions]
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
        modules: [onRequestOptions2]
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
        modules: [onRequestOptions3]
      },
      {
        routePath: "/api/projects/:project_id/merchants",
        mountPath: "/api/projects/:project_id",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet8]
      },
      {
        routePath: "/api/projects/:project_id/merchants",
        mountPath: "/api/projects/:project_id",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions4]
      },
      {
        routePath: "/api/projects/:project_id/networks",
        mountPath: "/api/projects/:project_id",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet9]
      },
      {
        routePath: "/api/projects/:project_id/networks",
        mountPath: "/api/projects/:project_id",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions5]
      },
      {
        routePath: "/api/projects/:project_id/search",
        mountPath: "/api/projects/:project_id",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet10]
      },
      {
        routePath: "/api/projects/:project_id/search",
        mountPath: "/api/projects/:project_id",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions6]
      },
      {
        routePath: "/api/auth/facebook",
        mountPath: "/api/auth/facebook",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet11]
      },
      {
        routePath: "/api/auth/github",
        mountPath: "/api/auth/github",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet12]
      },
      {
        routePath: "/api/auth/google",
        mountPath: "/api/auth/google",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet13]
      },
      {
        routePath: "/api/auth/register",
        mountPath: "/api/auth/register",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions7]
      },
      {
        routePath: "/api/auth/register",
        mountPath: "/api/auth/register",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost2]
      },
      {
        routePath: "/api/profile/billing-address",
        mountPath: "/api/profile",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet14]
      },
      {
        routePath: "/api/profile/billing-address",
        mountPath: "/api/profile",
        method: "PUT",
        middlewares: [],
        modules: [onRequestPut]
      },
      {
        routePath: "/api/profile/completion-status",
        mountPath: "/api/profile",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet15]
      },
      {
        routePath: "/api/profile/invoices",
        mountPath: "/api/profile",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet16]
      },
      {
        routePath: "/api/profile/preferences",
        mountPath: "/api/profile",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet17]
      },
      {
        routePath: "/api/profile/process-pending-invoices",
        mountPath: "/api/profile",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions8]
      },
      {
        routePath: "/api/profile/process-pending-invoices",
        mountPath: "/api/profile",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost3]
      },
      {
        routePath: "/api/queue/status",
        mountPath: "/api/queue",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet18]
      },
      {
        routePath: "/api/queue/status",
        mountPath: "/api/queue",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions9]
      },
      {
        routePath: "/api/tools/affiliate-link-checker",
        mountPath: "/api/tools",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost4]
      },
      {
        routePath: "/api/tools/affiliate-network-uptime",
        mountPath: "/api/tools",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet19]
      },
      {
        routePath: "/api/tools/affiliate-network-uptime",
        mountPath: "/api/tools",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions10]
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
        modules: [onRequestGet20]
      },
      {
        routePath: "/api/invoice/:invoiceNumber",
        mountPath: "/api/invoice",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions11]
      },
      {
        routePath: "/api/users/:userId",
        mountPath: "/api/users/:userId",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet21]
      },
      {
        routePath: "/api/users/:userId",
        mountPath: "/api/users/:userId",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions12]
      },
      {
        routePath: "/api/contact",
        mountPath: "/api/contact",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost5]
      },
      {
        routePath: "/api/import-network",
        mountPath: "/api",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions13]
      },
      {
        routePath: "/api/import-network",
        mountPath: "/api",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost6]
      },
      {
        routePath: "/api/logout",
        mountPath: "/api/logout",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost7]
      },
      {
        routePath: "/api/magic-login",
        mountPath: "/api/magic-login",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet22]
      },
      {
        routePath: "/api/mistake-report",
        mountPath: "/api/mistake-report",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost8]
      },
      {
        routePath: "/api/network-monitors",
        mountPath: "/api/network-monitors",
        method: "DELETE",
        middlewares: [],
        modules: [onRequestDelete]
      },
      {
        routePath: "/api/network-monitors",
        mountPath: "/api/network-monitors",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet23]
      },
      {
        routePath: "/api/network-monitors",
        mountPath: "/api/network-monitors",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions14]
      },
      {
        routePath: "/api/network-monitors",
        mountPath: "/api/network-monitors",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost9]
      },
      {
        routePath: "/api/network-monitors",
        mountPath: "/api/network-monitors",
        method: "PUT",
        middlewares: [],
        modules: [onRequestPut2]
      },
      {
        routePath: "/api/profile",
        mountPath: "/api/profile",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet24]
      },
      {
        routePath: "/api/profile",
        mountPath: "/api/profile",
        method: "PUT",
        middlewares: [],
        modules: [onRequestPut3]
      },
      {
        routePath: "/api/refund-request",
        mountPath: "/api/refund-request",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions15]
      },
      {
        routePath: "/api/refund-request",
        mountPath: "/api/refund-request",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost10]
      },
      {
        routePath: "/api/request-magic-link",
        mountPath: "/api/request-magic-link",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost11]
      },
      {
        routePath: "/api/user",
        mountPath: "/api/user",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet25]
      },
      {
        routePath: "/api/user",
        mountPath: "/api/user",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions16]
      },
      {
        routePath: "/api/user-preferences",
        mountPath: "/api",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet26]
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

// ../.wrangler/tmp/bundle-OAnean/middleware-loader.entry.ts
init_functionsRoutes_0_3883291400772385();
init_checked_fetch();

// ../.wrangler/tmp/bundle-OAnean/middleware-insertion-facade.js
init_functionsRoutes_0_3883291400772385();
init_checked_fetch();

// ../node_modules/wrangler/templates/pages-template-worker.ts
init_functionsRoutes_0_3883291400772385();
init_checked_fetch();

// ../node_modules/path-to-regexp/dist.es2015/index.js
init_functionsRoutes_0_3883291400772385();
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
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
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
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
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
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
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
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
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
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
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
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../node_modules/wrangler/templates/pages-template-worker.ts
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
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
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
          passThroughOnException: /* @__PURE__ */ __name(() => {
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
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");

// ../node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
init_functionsRoutes_0_3883291400772385();
init_checked_fetch();
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
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

// ../node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
init_functionsRoutes_0_3883291400772385();
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
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
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

// ../.wrangler/tmp/bundle-OAnean/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;

// ../node_modules/wrangler/templates/middleware/common.ts
init_functionsRoutes_0_3883291400772385();
init_checked_fetch();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
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
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// ../.wrangler/tmp/bundle-OAnean/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
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
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
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
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=functionsWorker-0.2551829519122899.mjs.map
