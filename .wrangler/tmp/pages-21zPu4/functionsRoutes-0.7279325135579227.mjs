import { onRequestGet as __api_auth_facebook_callback_ts_onRequestGet } from "/Users/sjoerdcopier/PhpstormProjects/affensus_web/functions/api/auth/facebook/callback.ts"
import { onRequestGet as __api_auth_github_callback_ts_onRequestGet } from "/Users/sjoerdcopier/PhpstormProjects/affensus_web/functions/api/auth/github/callback.ts"
import { onRequestGet as __api_auth_google_callback_ts_onRequestGet } from "/Users/sjoerdcopier/PhpstormProjects/affensus_web/functions/api/auth/google/callback.ts"
import { onRequestGet as __api_auth_facebook_index_ts_onRequestGet } from "/Users/sjoerdcopier/PhpstormProjects/affensus_web/functions/api/auth/facebook/index.ts"
import { onRequestGet as __api_auth_github_index_ts_onRequestGet } from "/Users/sjoerdcopier/PhpstormProjects/affensus_web/functions/api/auth/github/index.ts"
import { onRequestGet as __api_auth_google_index_ts_onRequestGet } from "/Users/sjoerdcopier/PhpstormProjects/affensus_web/functions/api/auth/google/index.ts"
import { onRequestPost as __api_tools_affiliate_link_checker_ts_onRequestPost } from "/Users/sjoerdcopier/PhpstormProjects/affensus_web/functions/api/tools/affiliate-link-checker.ts"
import { onRequestGet as __api_tools_affiliate_network_uptime_ts_onRequestGet } from "/Users/sjoerdcopier/PhpstormProjects/affensus_web/functions/api/tools/affiliate-network-uptime.ts"
import { onRequestOptions as __api_tools_affiliate_network_uptime_ts_onRequestOptions } from "/Users/sjoerdcopier/PhpstormProjects/affensus_web/functions/api/tools/affiliate-network-uptime.ts"

export const routes = [
    {
      routePath: "/api/auth/facebook/callback",
      mountPath: "/api/auth/facebook",
      method: "GET",
      middlewares: [],
      modules: [__api_auth_facebook_callback_ts_onRequestGet],
    },
  {
      routePath: "/api/auth/github/callback",
      mountPath: "/api/auth/github",
      method: "GET",
      middlewares: [],
      modules: [__api_auth_github_callback_ts_onRequestGet],
    },
  {
      routePath: "/api/auth/google/callback",
      mountPath: "/api/auth/google",
      method: "GET",
      middlewares: [],
      modules: [__api_auth_google_callback_ts_onRequestGet],
    },
  {
      routePath: "/api/auth/facebook",
      mountPath: "/api/auth/facebook",
      method: "GET",
      middlewares: [],
      modules: [__api_auth_facebook_index_ts_onRequestGet],
    },
  {
      routePath: "/api/auth/github",
      mountPath: "/api/auth/github",
      method: "GET",
      middlewares: [],
      modules: [__api_auth_github_index_ts_onRequestGet],
    },
  {
      routePath: "/api/auth/google",
      mountPath: "/api/auth/google",
      method: "GET",
      middlewares: [],
      modules: [__api_auth_google_index_ts_onRequestGet],
    },
  {
      routePath: "/api/tools/affiliate-link-checker",
      mountPath: "/api/tools",
      method: "POST",
      middlewares: [],
      modules: [__api_tools_affiliate_link_checker_ts_onRequestPost],
    },
  {
      routePath: "/api/tools/affiliate-network-uptime",
      mountPath: "/api/tools",
      method: "GET",
      middlewares: [],
      modules: [__api_tools_affiliate_network_uptime_ts_onRequestGet],
    },
  {
      routePath: "/api/tools/affiliate-network-uptime",
      mountPath: "/api/tools",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_tools_affiliate_network_uptime_ts_onRequestOptions],
    },
  ]