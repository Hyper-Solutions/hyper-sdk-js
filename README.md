# Hyper Solutions SDK - TypeScript/JavaScript Library for Bot Protection Bypass (Akamai, Incapsula, Kasada, DataDome)

![Node Version](https://img.shields.io/badge/Node.js-16+-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![NPM Version](https://img.shields.io/npm/v/hyper-sdk-js)
![NPM Downloads](https://img.shields.io/npm/dm/hyper-sdk-js)

[![](https://dcbadge.limes.pink/api/server/akamai)](https://discord.gg/akamai)

A powerful **TypeScript/JavaScript SDK** for bypassing modern bot protection systems including **Akamai Bot Manager**, **Incapsula**, **Kasada**, and **DataDome**. Generate valid cookies, solve anti-bot challenges, and automate protected endpoints with ease.

Perfect for **web scraping**, **automation**, and **data collection** from protected websites.

## 🔑 Getting API Access

Before using this SDK, you'll need an API key from Hyper Solutions:

1. **Visit [hypersolutions.co](https://hypersolutions.co/)** to create your account
2. **Choose your plan**:
    - 💳 **Pay-as-you-go**: Perfect for testing and small-scale usage
    - 📊 **Subscription plans**: Cost-effective for high-volume applications
3. **Get your API key** from the dashboard
4. **Start bypassing bot protection** with this SDK!


## 🚀 Quick Start

```typescript
import { Session, SensorInput } from 'hyper-sdk-js';

const session = new Session("your-api-key");

// Generate Akamai sensor data
const result = await session.generateSensorData(new SensorInput(
    // sensor input fields
));

console.log(`Generated sensor data: ${result.payload}`);
console.log(`Sensor context: ${result.context}`);
```

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
const pixelData = await generatePixelData(session, new PixelInput(
    // pixel input fields
));
```

### V3 Dynamic Values

Parse V3 dynamic script values for advanced sensor generation:

```typescript
import { V3DynamicInput, parseV3DynamicValues } from 'hyper-sdk-js';

const dynamicValues = await parseV3DynamicValues(session, new V3DynamicInput(
    // v3 dynamic input fields
));
```

### SBSD Challenge Solving

Generate SBSD data for specialized Akamai challenges:

```typescript
import { SbsdInput, generateSbsdPayload } from 'hyper-sdk-js';

const sbsdData = await generateSbsdPayload(session, new SbsdInput(
    // sbsd input fields
));
```

## 🔒 Incapsula Protection

Bypass **Incapsula bot detection** with Reese84 sensors and UTMVC cookie generation.

### Generating Reese84 Sensors

Create **Reese84 sensor data** for Incapsula bypass:

```typescript
import { Reese84Input, generateReese84Sensor } from 'hyper-sdk-js';

const sensorData = await generateReese84Sensor(session, new Reese84Input(
    // reese84 input fields
));
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
    // kasada payload input fields
));

const payload = result.payload;
const headers = result.headers;
```

### Generating POW Data (CD)

Solve **Kasada Proof-of-Work** challenges for x-kpsdk-cd tokens:

```typescript
import { KasadaPowInput, generateKasadaPow } from 'hyper-sdk-js';

const powPayload = await generateKasadaPow(session, new KasadaPowInput(
    // kasada pow input fields
));
```

### Script Path Extraction

Extract **Kasada script paths** from blocked pages (HTTP 429):

```typescript
import { parseKasadaPath } from 'hyper-sdk-js';

const scriptPath = parseKasadaPath(blockedPageHtml);
// Returns: /ips.js?timestamp=...
```

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

const payload = result.payload;
const headers = result.headers;
// POST payload to https://geo.captcha-delivery.com/interstitial/
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
    
    const checkUrl = result.payload;
    const headers = result.headers;
    // GET request to checkUrl
}
```

### Tags Payload Generation

Generate **DataDome tags payload**:

```typescript
import { TagsInput, generateTagsPayload } from 'hyper-sdk-js';

const tagsPayload = await generateTagsPayload(session, new TagsInput(
    // tags input fields
));
```

## 📖 Documentation

For detailed documentation on how to use the SDK, including examples and API reference, please visit our documentation website:

[https://docs.justhyped.dev/](https://docs.justhyped.dev/)

### Getting Help

- Check our [documentation](https://docs.justhyped.dev)
- Join our [Discord community](https://discord.gg/akamai)

## 🤝 Contributing

If you find any issues or have suggestions for improvement, please open an issue or submit a pull request.

## 📄 License

This SDK is licensed under the [MIT License](LICENSE).

---

**Keywords**: TypeScript SDK, JavaScript SDK, Node.js, bot protection bypass, web scraping, Akamai bypass, Incapsula bypass, Kasada bypass, DataDome bypass, anti-bot, captcha solver, automation, reverse engineering, bot detection, web automation