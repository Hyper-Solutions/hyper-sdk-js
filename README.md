# Hyper Solutions SDK - TypeScript/JavaScript Library for Bot Protection Bypass (Akamai, Incapsula, Kasada, DataDome)

![Node Version](https://img.shields.io/badge/Node.js-16+-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![NPM Version](https://img.shields.io/npm/v/hyper-sdk-js)
![NPM Downloads](https://img.shields.io/npm/dm/hyper-sdk-js)

[![](https://dcbadge.limes.pink/api/server/akamai)](https://discord.gg/akamai)

A powerful **TypeScript/JavaScript SDK** for bypassing modern bot protection systems including [**Akamai Bot Manager**](https://hypersolutions.co/products/akamai), [**Incapsula**](https://hypersolutions.co/products/incapsula), [**Kasada**](https://hypersolutions.co/products/kasada), and [**DataDome**](https://hypersolutions.co/products/datadome). Generate valid cookies, solve anti-bot challenges, and automate protected endpoints with ease.

Perfect for **web scraping**, **automation**, and **data collection** from protected websites.

## 🔑 Getting API Access

Before using this SDK, you'll need an API key from Hyper Solutions:

1. **Visit [hypersolutions.co](https://hypersolutions.co?utm_source=github&utm_medium=sdk_readme&utm_campaign=node_sdk_api_access)** to create your account
2. **Choose your plan**:
    - 💳 **Pay-as-you-go**: Perfect for testing and small-scale usage
    - 📊 **Subscription plans**: Cost-effective for high-volume applications
3. **Get your API key** from the dashboard
4. **Start bypassing bot protection** with this SDK!


## 🚀 Quick Start

```typescript
import { Session, SensorInput, generateSensorData } from 'hyper-sdk-js';

const session = new Session("your-api-key");

// Generate Akamai sensor data
const result = await generateSensorData(session, new SensorInput(
    // sensor input fields
));

console.log(`Generated sensor data: ${result.payload}`);
console.log(`Sensor context: ${result.context}`);
```

Every `generate*` function resolves to a result object (`SensorResult`, `SbsdResult`, ...), so fields the API adds later arrive without breaking your code.

### Client hints (Accept-CH)

Sensor, SBSD, Reese84, Kasada payload and DataDome results carry `clientHints`: the `sec-ch-*`, `device-memory`, `dpr`, `viewport-width`, `ect`, `rtt` and `downlink` headers for the device the payload was generated for, keyed by lowercase header name and ready to send verbatim. Send only the ones the site asked for in its `Accept-CH` response header:

```typescript
const requested = (response.headers.get("accept-ch") ?? "")
    .split(",").map((h) => h.trim().toLowerCase()).filter(Boolean);
const hints = Object.fromEntries(
    requested.filter((name) => result.clientHints?.[name] !== undefined)
        .map((name) => [name, result.clientHints![name]])
);
```

`clientHints` is `undefined` when the API returns none (Safari user agents, and payloads built by a remote browser).

## ✨ Features

- 🛡️ **Akamai Bot Manager**: Generate sensor data, handle pixel challenges, validate cookies
- 🔒 **Incapsula Protection**: Generate Reese84 sensors and UTMVC cookies
- ⚡ **Kasada Bypass**: Generate payload data (CT) and POW tokens (CD)
- 🎯 **DataDome Solutions**: Solve tags, slider captchas and interstitial challenges
- 🔧 **Easy Integration**: Simple TypeScript/JavaScript API with async/await support
- ⚙️ **Flexible Configuration**: Custom HTTP clients and session management

## 📦 Installation

Install the Hyper Solutions SDK for Node.js/TypeScript using:

```bash
npm install hyper-sdk-js
```

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Basic Usage](#-basic-usage)
- [Akamai Bot Manager](#-akamai-bot-manager)
- [Incapsula Protection](#-incapsula-protection)
- [Kasada Bypass](#-kasada-bypass)
- [DataDome Solutions](#-datadome-solutions)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)

## 🔧 Basic Usage

### Creating a Session

Initialize the SDK with your API key to start bypassing bot protection:

```typescript
import { Session } from 'hyper-sdk-js';

// Basic session
const session = new Session("your-api-key");

// Advanced session with custom configuration
const session = new Session(
    "your-api-key",
    "your-jwt-key",
    "your-app-key",
    "your-app-secret",
    customRequestOptions
);
```

### Checking Usage

`getUsage` returns the key's pay-as-you-go balance and the remaining requests of each plan. It is not counted as usage.

```typescript
import { getUsage } from 'hyper-sdk-js';

const usage = await getUsage(session);

console.log(`balance: €${usage.balanceEuro}`);
for (const plan of usage.plans) {
    console.log(`${plan.product}: ${plan.requestsRemaining} of ${plan.requestsQuota} left, expires ${plan.expiresAt}`);
}
```

## 🛡️ Akamai Bot Manager

Bypass **Akamai Bot Manager** protection with sensor data generation, cookie validation, and challenge solving.

### Generating Sensor Data

Generate sensor data for valid **Akamai cookies** and bot detection bypass:

```typescript
import { SensorInput, generateSensorData } from 'hyper-sdk-js';

const result = await generateSensorData(session, new SensorInput(
    // sensor input fields
));
```

### Parsing Script Path

Extract Akamai Bot Manager script paths from HTML:

```typescript
import { parseAkamaiPath } from 'hyper-sdk-js';

const scriptPath = parseAkamaiPath(htmlContent);
```

### Handling Sec-Cpt Challenges

Solve **sec-cpt challenges** with built-in parsing and payload generation:

```typescript
import { parseChallengeHTML, parseChallengeJSON } from 'hyper-sdk-js';

// Parse sec-cpt challenge from HTML
const challenge = parseChallengeHTML(htmlContent);

// Or parse from JSON response
const challenge = parseChallengeJSON(jsonResponse);

// Generate challenge response payload
if (challenge?.cryptoChallenge) {
    const payload = challenge.cryptoChallenge.generatePayload(secCptCookie);
}

// Handle challenge timing requirements
await challenge?.wait();
```

### Cookie Validation

Validate **Akamai _abck cookies** and session states:

```typescript
import { isAkamaiCookieValid, isAkamaiCookieInvalidated } from 'hyper-sdk-js';

// Check if cookie is valid for the current request count
const isValid = isAkamaiCookieValid(cookieValue, requestCount);

// Check if cookie has been invalidated and needs refresh
const needsRefresh = isAkamaiCookieInvalidated(cookieValue);
```

### Pixel Challenge Solving

Handle **Akamai pixel challenges** for advanced bot detection bypass:

```typescript
import {
    PixelInput,
    generatePixelData,
    parsePixelHtmlVar,
    parsePixelScriptUrl,
    parsePixelScriptVar
} from 'hyper-sdk-js';

// Parse pixel challenge data
const htmlVar = parsePixelHtmlVar(htmlContent);
const scriptUrls = parsePixelScriptUrl(htmlContent);
const scriptVar = parsePixelScriptVar(scriptContent);

// Generate pixel data
const result = await generatePixelData(session, new PixelInput(
    // pixel input fields
));
// result.payload is the pixel data
```

### SBSD Challenge Solving

Generate SBSD data for specialized Akamai challenges:

```typescript
import { SbsdInput, generateSbsdPayload } from 'hyper-sdk-js';

const result = await generateSbsdPayload(session, new SbsdInput(
    // sbsd input fields; the optional last argument, scriptUrl, is the
    // absolute src of the SBSD script tag, query included
));
// POST result.payload; pass result.context in the next SbsdInput instead of the script.
// A hard block (an SBSD POST with a `t` parameter) always sends the script with an
// empty context, never one from an earlier request.
```

## 🔒 Incapsula Protection

Bypass **Incapsula bot detection** with Reese84 sensors and UTMVC cookie generation.

### Generating Reese84 Sensors

Create **Reese84 sensor data** for Incapsula bypass:

```typescript
import { Reese84Input, generateReese84Sensor } from 'hyper-sdk-js';

const result = await generateReese84Sensor(session, new Reese84Input(
    // reese84 input fields
));
// result.payload is the sensor, result.clientHints the Accept-CH headers
```

### UTMVC Cookie Generation

Generate **UTMVC cookies** for Incapsula protection bypass:

```typescript
import { UtmvcInput, generateUtmvcCookie } from 'hyper-sdk-js';

const result = await generateUtmvcCookie(session, new UtmvcInput(
    // utmvc input fields
));

const utmvcCookie = result.payload;
const swhanedl = result.swhanedl;
```

### Script Path Parsing

Parse **UTMVC script paths** and generate submit paths:

```typescript
import {
    parseUtmvcScriptPath,
    generateUtmvcScriptPath,
    getSessionIds,
    isSessionCookie
} from 'hyper-sdk-js';

// Parse script path from content
const scriptPath = parseUtmvcScriptPath(scriptContent);

// Generate unique submit path
const submitPath = generateUtmvcScriptPath();

// Extract session IDs from cookies
const sessionIds = getSessionIds(cookies);
```

### Dynamic Reese Script Parsing

Parse dynamic Reese84 script paths from interruption pages:

```typescript
import { parseDynamicReeseScript } from 'hyper-sdk-js';

const result = parseDynamicReeseScript(htmlContent, "https://example.com");
console.log(result.sensorPath, result.scriptPath);
```

## ⚡ Kasada Bypass

Defeat **Kasada Bot Manager** with payload generation and POW solving.

### Generating Payload Data (CT)

Create **x-kpsdk-ct tokens** for Kasada bypass:

```typescript
import { KasadaPayloadInput, generateKasadaPayload } from 'hyper-sdk-js';

const result = await generateKasadaPayload(session, new KasadaPayloadInput(
    // kasada payload input fields; the optional last argument, strict, refuses
    // a payload built on a signal the API cannot identify yet instead of
    // returning one built on a guess (off by default)
));

// POST the base64-decoded result.payload to /tl with the x-kpsdk-* values in result.headers.
// result.clientHints are the Accept-CH headers: send only the ones the site asked for.
```

### Generating POW Data (CD)

Solve **Kasada Proof-of-Work** challenges for x-kpsdk-cd tokens:

```typescript
import { KasadaPowInput, generateKasadaPow } from 'hyper-sdk-js';

const result = await generateKasadaPow(session, new KasadaPowInput(
    // kasada pow input fields
));
// result.payload is the x-kpsdk-cd value
```

### Script Path Extraction

Extract **Kasada script paths** from blocked pages (HTTP 429):

```typescript
import { parseKasadaPath } from 'hyper-sdk-js';

const scriptPath = parseKasadaPath(blockedPageHtml);
// Returns: /ips.js?timestamp=...
```

### Mobile User-Agent Generation

Generate the **Kasada mobile `user-agent`** value sent on the native app flow. The mobile SDK derives it as the lowercase hex MD5 of `"<osVersion> / <bundleId> <appVersion>"`:

```typescript
import { generateKasadaUserAgent } from 'hyper-sdk-js';

const userAgent = generateKasadaUserAgent({
    osVersion: '18.0.1',            // iOS: UIDevice.systemVersion; Android: Build.VERSION.SDK_INT
    bundleId: 'com.example.app', // iOS: CFBundleIdentifier; Android: package name
    appVersion: '9.15.0',
});
// Returns: 7016adc4ba8d433533954ebad33be424
```

Available in `hyper-sdk-js` 4.1.0 and later.

### Mobile x-kpsdk-dv Generation

On iOS the Kasada SDK (`x-kpsdk-v` i-2.x) also sends an **`x-kpsdk-dv`** header describing the device and the app. Build it from the same values as the user-agent, plus the model identifier, and pass the same value as `dv` on the payload request so the payload is generated on an iPhone with that model's screen and iOS version:

```typescript
import { KasadaPayloadInput, generateKasadaDv, generateKasadaUserAgent } from 'hyper-sdk-js';

const device = {
    osVersion: '18.0.1',
    hardwareId: 'iPhone13,2',       // utsname.machine: "iPhone13,2" is an iPhone 12
    bundleId: 'com.example.app',
    appVersion: '9.15.0',
};
const userAgent = generateKasadaUserAgent(device);
const dv = generateKasadaDv(device);

const result = await generateKasadaPayload(session, new KasadaPayloadInput(
    userAgent, ipsLink, script, ip, 'en-US,en;q=0.9',
    false, // strict
    dv,    // the x-kpsdk-dv value you send to the site
));
```

Available in `hyper-sdk-js` 5.2.0 and later.

## 🎯 DataDome Solutions

Solve **DataDome captchas** including slider challenges and interstitial pages.

### Interstitial Challenge Solving

Bypass **DataDome interstitial pages**:

```typescript
import {
    InterstitialInput,
    generateInterstitialPayload,
    parseInterstitialDeviceCheckUrl
} from 'hyper-sdk-js';

// Parse device check URL
const deviceUrl = parseInterstitialDeviceCheckUrl(htmlContent, datadomeCookie, refererUrl);

// Generate interstitial payload
const result = await generateInterstitialPayload(session, new InterstitialInput(
    // interstitial input fields
));

// POST result.payload to https://geo.captcha-delivery.com/interstitial/
// result.clientHints are the Accept-CH headers for the device
```

### Slider Captcha Solving

Solve **DataDome slider captchas** automatically:

```typescript
import {
    SliderInput,
    generateSliderPayload,
    parseSliderDeviceCheckUrl
} from 'hyper-sdk-js';

// Parse device check URL
const parseResult = parseSliderDeviceCheckUrl(htmlContent, datadomeCookie, refererUrl);

if (parseResult.isIpBanned) {
    console.log("IP is banned");
} else {
    // Generate slider payload
    const result = await generateSliderPayload(session, new SliderInput(
        // slider input fields
    ));

    // GET request to result.payload (the check URL)
    // result.clientHints are the Accept-CH headers for the device
}
```

### The Challenge Script

DataDome sometimes serves a challenge page with the challenge script in its own file instead of
inlining it in the page:

```html
<script defer src="https://ct.captcha-delivery.com/interstitial.1.33.0.202609141.js"></script>
```

It switches between the two forms per request, so check every challenge page rather than
configuring this once. When the page uses its own file, fetch that URL with your own client so the
request keeps your proxy, TLS fingerprint and headers, then pass the response body as the trailing
`script` argument. The SDK does not fetch it for you.

```typescript
import {
    InterstitialInput,
    generateInterstitialPayload,
    parseChallengeScriptUrl
} from 'hyper-sdk-js';

let script: string | undefined;
const scriptUrl = parseChallengeScriptUrl(htmlContent);
if (scriptUrl !== null) {
    script = await (await fetch(scriptUrl)).text();
}

const result = await generateInterstitialPayload(session, new InterstitialInput(
    userAgent, deviceUrl, htmlContent, ip, acceptLanguage,
    script // leave it out when the page inlines the script
));
```

The same helper covers the slider captcha page, where `script` is the trailing argument of
`SliderInput`. It is optional in both, so existing code keeps working unchanged.

### Tags Payload Generation

Generate **DataDome tags payload**:

```typescript
import { TagsInput, generateTagsPayload } from 'hyper-sdk-js';

const result = await generateTagsPayload(session, new TagsInput(
    // tags input fields
));
// result.payload is the tags payload
```

## 📖 Documentation

For detailed documentation on how to use the SDK, including examples and API reference, please visit our documentation website:

[https://docs.hypersolutions.co/](https://docs.hypersolutions.co/)

### Getting Help

- Check our [documentation](https://docs.hypersolutions.co/)
- Join our [Discord community](https://discord.gg/akamai)

## 🤝 Contributing

If you find any issues or have suggestions for improvement, please open an issue or submit a pull request.

## 📄 License

This SDK is licensed under the [MIT License](LICENSE).

---

**Keywords**: TypeScript SDK, JavaScript SDK, Node.js, bot protection bypass, web scraping, Akamai bypass, Incapsula bypass, Kasada bypass, DataDome bypass, anti-bot, captcha solver, automation, reverse engineering, bot detection, web automation