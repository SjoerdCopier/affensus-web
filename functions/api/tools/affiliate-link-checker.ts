export const regexPatterns = [
    { name: 'Daisycon', pattern: /c\/\?si=(\d+)|ds1\.nl\/c\/.*?si=(\d+)|lt45\.net\/c\/.*?si=(\d+)|\/csd\/\?si=(\d+)&li=(\d+)&wi=(\d+)|jf79\.net\/c\/.*?si=(\d+)/, matches: [], networkId: 1 },
    { name: 'Daisycon', pattern: /c\/\?si=(\d+)/, matches: [], networkId: 1 },
    { name: 'Brandreward', pattern: /brandreward\.com\/?(?:\?key=[^&]+&url=([^&]+))/, matches: [], networkId: 2 },
    { name: 'TradeTracker', pattern: /https:\/\/tc\.tradetracker\.net\/\?c=(\d+)|\/tt\/\?tt=(\d+)_/, matches: [], networkId: 3 },
    { name: 'TradeTracker', pattern: /tt=(\d+)_/, matches: [], networkId: 3 },
    { name: 'TradeTracker', pattern: /\/tt\/index\.php\?tt=(\d+)/, matches: [], networkId: 3 },
    { name: 'TradeTracker', pattern: /c\?c=(\d+)/, matches: [], networkId: 3 },
    { name: 'Tradedoubler', pattern: /tradedoubler\.com/, matches: [], networkId: 4 },
    { name: 'Awin', pattern: /awinmid=(\d+)|awin1\.com.*?(?:mid|id)=(\d+)/, matches: [], networkId: 5 },
    { name: 'Awin', pattern: /awin1\.com/, matches: [], networkId: 5 },
    { name: 'Adservice', pattern: /ADSERVICEID=(\d+)|adservicemedia\.dk\/cgi-bin\/click\.pl\?.*?cid=(\d+)/, matches: [], networkId: 6 },
    { name: 'Kwanko', pattern: /metaffiliation\.com/, matches: [], networkId: 7 },
    { name: 'Adrecord', pattern: /click\.adrecord\.com\/?\?c=\d+&p=(\d+)|click\.adrecord\.com\/?\?c=\d+&amp;p=(\d+)/, matches: [], networkId: 8 },
    { name: 'Partnerize', pattern: /prf\.hn\/click\/camref:(.*?)(\/|$)|PARTNERIZEID:(.*?)|prf\.hn\/click\/camref:([^/]+)/, matches: [], networkId: 9 },
    { name: 'Partnerize', pattern: /prf\.hn\/click\/camref:([^/]+)/, matches: [], networkId: 9 },
    { name: 'Partnerize', pattern: /camref:.*?\/pubref:/, matches: [], networkId: 9 },
    { name: 'Partner Ads', pattern: /klikbanner\.php\?.*bannerid=([^&]+)/, matches: [], networkId: 10 },
    { name: 'Adtraction', pattern: /\/t\/t\?a=(\d+)/, matches: [], networkId: 11 },
    { name: 'Cj', pattern: /CJID=([a-zA-Z0-9]+)|cj\.dotomi\.com/, matches: [], networkId: 12 },
    { name: 'Admitad', pattern: /\.com\/g\/([a-zA-Z0-9]+)/, matches: [], networkId: 13 },
    { name: 'Digidip', pattern: /digidip\.net\/visit\?url=([^&]+)/, matches: [], networkId: 14 },
    { name: 'Salestring', pattern: /salestring\.com\/aff_c\?offer_id=([0-9]+)/, matches: [], networkId: 15 },
    { name: 'Flexoffers', pattern: /trid=([0-9]+)/, matches: [], networkId: 16 },
    { name: 'Flexoffers', pattern: /track\.flexlinkspro\.com/, matches: [], networkId: 16 },
    { name: 'Impact', pattern: /impact\.[a-zA-Z0-9-]+\.com\/c\/|\/c\/[0-9]+\/[0-9]+\/([0-9]+)/, matches: [], networkId: 17 },
    { name: 'Webgains', pattern: /wgprogramid=([0-9]+)/, matches: [], networkId: 18 },
    { name: 'Circlewise', pattern: /trackmytarget\.com\/\?a=([^&#]+)/, matches: [], networkId: 19 },
    { name: 'Optimise', pattern: /https?:\/\/clk\.omgt3\.com\/\?.*PID=([0-9]+).*/, matches: [], networkId: 20 },
    { name: 'Partnerboost', pattern: /https?:\/\/app\.partnermatic\.com\/track\/([a-zA-Z0-9_\-]+)\?/, matches: [], networkId: 21 },
    { name: 'Involveasia', pattern: /\/aff_m\?offer_id=([0-9]+)/, matches: [], networkId: 22 },
    { name: 'Chinesean', pattern: /https?:\/\/www\.chinesean\.com\/affiliate\/clickBanner\.do\?.*pId=(\d+)/, matches: [], networkId: 23 },
    { name: 'Rakuten', pattern: /https:\/\/click\.linksynergy\.com\/(?:deeplink\?|link\?)(?:.*&)?(?:mid|offerid)=(\d+)/, matches: [], networkId: 24 },
    { name: 'Yieldkit', pattern: /https:\/\/r\.linksprf\.com/, matches: [], networkId: 25 },
    { name: 'Indoleads', pattern: /\.xyz\/([a-zA-Z0-9]+)/, matches: [], networkId: 26 },
    { name: 'Commissionfactory', pattern: /https:\/\/t\.cfjump\.com\/[0-9]+\/t\/([0-9]+)/, matches: [], networkId: 27 },
    { name: 'Accesstrade', pattern: /https?:\/\/(?:atsg\.me|atmy\.me|atid\.me|accesstra\.de)\/([a-zA-Z0-9]+)/, matches: [], networkId: 28 },
    { name: 'Yadore', pattern: /yadore\.com\/v2\/d\?url=(.*?)&market/, matches: [], networkId: 29 },
    { name: 'Yadore', pattern: /yadore\.com/, matches: [], networkId: 29 },
    { name: 'Skimlinks', pattern: /https:\/\/go\.skimresources\.com.*?url=((http%3A%2F%2F|https%3A%2F%2F|http:\/\/|https:\/\/)[\w.-]+)/, matches: [], networkId: 30 },
    { name: 'Addrevenue', pattern: /https:\/\/addrevenue\.io\/t\?c=[0-9]+&a=([0-9]+)/, matches: [], networkId: 33 },
    { name: 'Timeone', pattern: /https:\/\/tracking\.publicidees\.com\/clic\.php\?.*progid=(\d+)/, matches: [], networkId: 35 },
    { name: 'Glopss', pattern: /glopss\.com\/aff_c\?offer_id=([0-9]+)/, matches: [], networkId: 36 },
    { name: 'RetailAds', pattern: /retailads\.net\/tc\.php\?t=([a-zA-Z0-9]+)/, matches: [], networkId: 38 },
    { name: 'Shareasale', pattern: /shareasale/, matches: [], networkId: 39 },
    { name: 'Kelkoo', pattern: /kelkoogroup\.net/, matches: [], networkId: 40 },
    { name: 'Takeads', pattern: /tatrck\.com/, matches: [], networkId: 45 },
    { name: 'Belboon', pattern: /\/ts\/.*?\/tsc/, matches: [], networkId: 31 },
    { name: 'HealthTrader', pattern: /track\.healthtrader\.com/, matches: [], networkId: 48 },
    { name: 'Sourceknowledge', pattern: /provenpixel\.com\/plp\.php|sktng0/, matches: [], networkId: 999 },
    { name: 'Linkbux', pattern: /linkbux\.com\/track/, matches: [], networkId: 998 },
    { name: 'PointClickTrack', pattern: /clcktrck\.com/, matches: [], networkId: 997 },
    { name: 'Pepperjam', pattern: /pepperjamnetwork\.com/, matches: [], networkId: 996 },
    { name: 'OpieNetwork', pattern: /tracking\.opienetwork\.com/, matches: [], networkId: 995 },
    { name: 'Vcommission', pattern: /vcommission\.com/, matches: [], networkId: 994 },
    { name: 'MissAffiliate', pattern: /missaffiliate\.com/, matches: [], networkId: 993 },
    { name: 'Ga-Net', pattern: /ga-net\.com/, matches: [], networkId: 992 },
    { name: 'Affisereach', pattern: /reachclk\.com/, matches: [], networkId: 990 },
    { name: 'opienetwork', pattern: /opienetwork\.com/, matches: [], networkId: 990 },
    { name: 'Fatcoupon', pattern: /fatcoupon\.com/, matches: [], networkId: 989 },
    { name: 'Adcell', pattern: /adcell\.com/, matches: [], networkId: 988 },
    { name: 'blueaff', pattern: /blueaff\.com/, matches: [], networkId: 987 },
    { name: 'DigiDum', pattern: /digidum/, matches: [], networkId: 986 },
    { name: 'AdIndex', pattern: /adindex/, matches: [], networkId: 985 },
];

export async function onRequestPost(context: any) {
    try {
        const body = await context.request.json();
        const { url } = body;

        if (!url) {
            return new Response(JSON.stringify({ message: 'URL is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        let currentUrl = url;
        const redirects: any[] = [];
        const visitedUrls = new Set<string>();

        while (true) {
            if (visitedUrls.has(currentUrl)) {
                console.log(`Redirect loop detected at URL: ${currentUrl}`);
                redirects.push({
                    url: currentUrl,
                    status: 'error',
                    type: 'Redirect Loop',
                    name: null,
                    error: 'Redirect loop detected'
                });
                break;
            }
            visitedUrls.add(currentUrl);

            try {
                const response = await fetch(currentUrl, {
                    method: 'GET',
                    redirect: 'manual',
                });

                let redirectedUrl = response.headers.get('location');
                let matchName = null;

                // Check if the current URL matches any of the provided patterns
                for (const patternObj of regexPatterns) {
                    if (patternObj.pattern.test(currentUrl)) {
                        matchName = patternObj.name;
                        break;
                    }
                }

                console.log(`Checking URL: ${currentUrl}`);

                if (redirectedUrl) {
                    // Resolve relative URLs
                    try {
                        redirectedUrl = new URL(redirectedUrl, currentUrl).href;
                    } catch (urlError: any) {
                        console.log(`Error resolving redirect URL: ${urlError.message}`);
                        redirects.push({
                            url: currentUrl,
                            status: response.status,
                            type: 'Invalid Redirect URL',
                            name: matchName,
                            error: urlError.message
                        });
                        break;
                    }

                    console.log(`HTTP Redirect detected: ${redirectedUrl}`);
                    redirects.push({
                        url: currentUrl,
                        status: response.status,
                        type: 'HTTP Redirect',
                        name: matchName
                    });
                    currentUrl = redirectedUrl;
                    continue;
                }

                // Check for meta redirects or JS redirects
                const html = await response.text();

                // Meta refresh detection
                const metaRedirect = html.match(/<meta[^>]*http-equiv=["']refresh["'][^>]*content=["']\d+;\s*url=([^"']+)/i);
                if (metaRedirect) {
                    console.log(`Meta Redirect detected: ${metaRedirect[1]}`);
                    currentUrl = metaRedirect[1];
                    redirects.push({
                        url: currentUrl,
                        status: 200,
                        type: 'Meta Redirect',
                        name: matchName
                    });
                    continue;
                }

                // JavaScript redirect detection
                const jsRedirect = html.match(/window\.location\.href\s*=\s*["']([^"']+)["']/i) ||
                                    html.match(/window\.location\.replace\s*\(\s*["']([^"']+)["']\s*\)/i) ||
                                    html.match(/window\.location\s*=\s*["']([^"']+)["']/i) ||
                                    html.match(/location\.href\s*=\s*["']([^"']+)["']/i) ||
                                    html.match(/location\.replace\s*\(\s*["']([^"']+)["']/i) ||
                                    html.match(/window\.open\s*\(\s*["']([^"']+)["']/i);

                if (jsRedirect) {
                    console.log(`JavaScript Redirect detected: ${jsRedirect[1]}`);
                    currentUrl = jsRedirect[1];
                    redirects.push({
                        url: currentUrl,
                        status: 200,
                        type: 'JavaScript Redirect',
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
                        type: 'HTML-based Redirect',
                        name: matchName
                    });
                    continue;
                }

                // Add a check for query parameter-based redirects
                const queryRedirect = new URL(currentUrl).searchParams.get('deeplink') || 
                                      new URL(currentUrl).searchParams.get('url') ||
                                      new URL(currentUrl).searchParams.get('u');
                if (queryRedirect) {
                    console.log(`Query Parameter Redirect detected: ${queryRedirect}`);
                    currentUrl = decodeURIComponent(queryRedirect);
                    redirects.push({
                        url: currentUrl,
                        status: 200,
                        type: 'Query Parameter Redirect',
                        name: matchName
                    });
                    continue;
                }

                // Timeout-based JavaScript redirect detection
                const timeoutRedirect = html.match(/setTimeout\s*\(\s*(?:function\s*\(\s*\)\s*\{\s*)?(?:window\.location\.(?:replace|href)\s*=|location\.(?:replace|href)\s*=)\s*["']([^"']+)["']/i);
                if (timeoutRedirect) {
                    console.log(`Delayed JavaScript Redirect detected: ${timeoutRedirect[1]}`);
                    currentUrl = timeoutRedirect[1];
                    redirects.push({
                        url: currentUrl,
                        status: 200,
                        type: 'Delayed JavaScript Redirect',
                        name: matchName
                    });
                    continue;
                }

                // Inside the while loop, after checking for other redirects
                if (currentUrl.includes('r.linksprf.com/v1/redirect')) {
                    try {
                        const response = await fetch(currentUrl, {
                            method: 'GET',
                            redirect: 'manual',
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                            }
                        });

                        if (response.status === 302 || response.status === 301) {
                            let redirectedUrl = response.headers.get('location');
                            console.log(`Linksprf HTTP Redirect detected: ${redirectedUrl}`);
                            
                            // Handle relative URLs
                            if (redirectedUrl && redirectedUrl.startsWith('/')) {
                                const currentUrlObj = new URL(currentUrl);
                                redirectedUrl = `${currentUrlObj.protocol}//${currentUrlObj.host}${redirectedUrl}`;
                            }
                            
                            if (redirectedUrl) {
                                console.log(`Resolved Linksprf redirect URL: ${redirectedUrl}`);
                                currentUrl = redirectedUrl;
                                redirects.push({
                                    url: currentUrl,
                                    status: response.status,
                                    type: 'Linksprf HTTP Redirect',
                                    name: matchName
                                });
                                continue;
                            }
                        }

                        const html = await response.text();
                        
                        // Check for window.location.replace in the response
                        const scriptRedirect = html.match(/window\.location\.replace\s*\(\s*['"]([^'"]+)['"]\s*\)/i);
                        
                        if (scriptRedirect) {
                            let redirectedUrl = scriptRedirect[1];
                            console.log(`Linksprf Script Redirect detected: ${redirectedUrl}`);
                            
                            // Handle relative URLs
                            if (redirectedUrl.startsWith('/')) {
                                const currentUrlObj = new URL(currentUrl);
                                redirectedUrl = `${currentUrlObj.protocol}//${currentUrlObj.host}${redirectedUrl}`;
                            }
                            
                            console.log(`Resolved Linksprf script redirect URL: ${redirectedUrl}`);
                            currentUrl = redirectedUrl;
                            redirects.push({
                                url: currentUrl,
                                status: response.status,
                                type: 'Linksprf Script Redirect',
                                name: matchName
                            });
                            continue;
                        }
                        
                        // If no redirect found, log the content for debugging
                        console.log('Linksprf response content:', html);
                    } catch (error: any) {
                        console.log(`Error handling Linksprf URL: ${error.message}`);
                    }
                }

                // If no more redirects are detected, check the final URL
                let matchNameFinal = null;
                for (const patternObj of regexPatterns) {
                    if (patternObj.pattern.test(currentUrl)) {
                        matchNameFinal = patternObj.name;
                        break;
                    }
                }

                console.log(`No more redirects detected. Final URL: ${currentUrl}`);
                console.log(`Final URL: ${currentUrl}`); // Add this line
                redirects.push({
                    url: currentUrl,
                    status: 200,
                    type: 'Final URL',
                    name: matchNameFinal
                });
                break;
            } catch (redirectError: any) {
                console.log(`Redirect Error: ${redirectError.message}`);
                redirects.push({
                    url: currentUrl,
                    status: 'error',
                    type: 'Redirect Error',
                    name: null,
                    error: redirectError.message
                });
                break;
            }
        }

        return new Response(JSON.stringify({ redirects }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error('Error processing request:', error);
        return new Response(JSON.stringify({ message: 'An error occurred', error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
