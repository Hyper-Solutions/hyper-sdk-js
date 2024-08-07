# Hyper Solutions SDK
SDK for TypeScript and JavaScript.

## Installation

To use the Hyper Solutions SDK in your Go project, you need to install it using the following command:

```
npm install hyper-sdk-js
```

## Usage

### Creating a Session

To start using the SDK, you need to create a new `Session` instance by providing your API key:

```js
import {Session} from "hyper-sdk-js";

const session = new Session("Your API key");
```

You can also optionally set a JWT private key:

```js
import {Session} from "hyper-sdk-js";

const session = new Session("Your API key", "Your base64 JWT private key");
```

## Akamai

The Akamai package provides functions for interacting with Akamai Bot Manager, including generating sensor data, parsing script path, parsing pixel challenges, and handling sec-cpt challenges.

### Generating Sensor Data

To generate sensor data required for generating valid Akamai cookies, use the `generateSensorData` function:

```js
import {generateSensorData} from "hyper-sdk-js/akamai/sensor.js";

// Caution: will throw an error if the API returns a non-OK response
const sensorData = await generateSensorData(session, {
    abck: "..", // _abck cookie value
    bmsz: "..", // bm_sz cookie value
    pageUrl: "https://example.com", // URL of the page to generate a cookie for
    userAgent: ".." // Browser user agent to impersonate
});
```

### Parsing Script Path

To parse the Akamai Bot Manager script path from the given HTML code, use the `parseAkamaiPath` function:

```js
import {parseAkamaiPath} from "hyper-sdk-js/akamai/script_path.js";

// Caution: may return null
const scriptPath = parseAkamaiPath(body);
```

### Handling Sec-Cpt Challenges

The Akamai package provides functions for handling sec-cpt challenges:

- `parseChallengeHTML`: Parses a sec-cpt challenge from the given HTML code.
- `parseChallengeJSON`: Parses a sec-cpt challenge from a JSON response. Use this if you receive an HTTP 429 block.
- `CryptoChallenge.generatePayload`: Generates a crypto challenge payload using the provided `sec-cpt` cookie.
- `CryptoChallenge.wait`: Returns a `Promise<void>` that is resolved after the challenge duration.

### Validating Cookies

The Akamai package provides functions for validating cookies:

- `isAkamaiCookieValid`: Determines if the provided `_abck` cookie value is valid based on the given request count.
- `isAkamaiCookieInvalidated`: Determines if the current session requires more sensors to be sent.


### Generating Pixel Data

To generate pixel data, use the `generatePixelData` function:

```js
import {generatePixelData} from "hyper-sdk-js/akamai/pixel.js";

const data = await generatePixelData(
    session,
    new PixelInput(
        "..", // Browser user agent to impersonate
        "..", // HTML var, obtained with parsePixelHtmlVar
        ".." // Script var, obtained with parsePixelScriptVar
    )
);
```

### Parsing Pixel Challenges

The Akamai package provides functions for parsing pixel challenges:

- `parsePixelHtmlVar`: Parses the required pixel challenge variable from the given HTML code.
- `parsePixelScriptUrl`: Parses the script URL of the pixel challenge script and the URL to post a generated payload to from the given HTML code.
- `parsePixelScriptVar`: Parses the dynamic value from the pixel script.
## Incapsula

The Incapsula package provides functions for interacting with Incapsula, including generating Reese84 sensor data, UTMVC cookies, and parsing UTMVC script paths.

### Generating Reese84 Sensor

To generate sensor data required for generating valid Reese84 cookies, use the `generateReese84Sensor` function:

```js
import {generateReese84Sensor} from "hyper-sdk-js/incapsula/reese.js";

const sensor = await generateReese84Sensor(session, {
    userAgent: "..", // Browser user agent to impersonate
    site: ".." // Site identifier; ask for your site in your ticket
});
```

### Generating UTMVC Cookie

To generate the UTMVC cookie using the Hyper Solutions API, use the `generateUtmvcCookie` function:

```js
import {generateUtmvcCookie} from "hyper-sdk-js/incapsula/utmvc.js";

const cookie = await generateUtmvcCookie(session, {
    userAgent: "..", // Browser user agent to impersonate
    script: "..", // utmvc script
    sessionIds: [] // Session identifiers, obtained with getSessionIds
});
```

### Obtaining session identifiers

To obtain the session identifiers (`sessionIds`), use the `getSessionIds` function:

```js
import {getSessionIds} from "hyper-sdk-js/incapsula/utmvc.js";

// Example input. You need to provide an array of objects,
// each containing the cookie's name (`name` field) and
// the cookie's value (`value` field).
const sessionIds = getSessionIds([
    {
        name: "incap_ses_a",
        value: "test1"
    },
    {
        name: "incap_ses_b",
        value: "test2"
    }
]);
```

### Parsing UTMVC Script Path

To parse the UTMVC script path from a given HTML code, use the `parseUtmvcScriptPath` function:

```js
import {parseUtmvcScriptPath} from "hyper-sdk-js/incapsula/utmvc.js";

const scriptPath = parseUtmvcScriptPath(body);
```

### Generating UTMVC Submit Path

To generate a unique UTMVC submit path with a random query parameter, use the `generateUtmvcScriptPath` function:

```js
import {generateUtmvcScriptPath} from "hyper-sdk-js/incapsula/utmvc.js";

const submitPath = generateUtmvcScriptPath();
```

## Kasada

The Kasada package provides functions for interacting with Kasada Bot Manager, including generating payload data, POW data, and parsing script paths.

### Generating Payload Data (CT)

To generate payload data required for generating valid `x-kpsdk-ct` tokens, use the `generateKasadaPayload` function:

```typescript
import { generateKasadaPayload } from "hyper-sdk-js/kasada/payload.js";

const result = await generateKasadaPayload(session, {
    userAgent: "...", // Browser user agent to impersonate
    ipsLink: "...", // The ips.js script link, parsed from the block page (429 status code)
    script: "...", // The ips.js script retrieved using the IpsLink url
    language: "..." // Optional: The first language of your accept-language header, defaults to "en-US" if not provided
});

console.log(result.payload); // The decoded payload, use this to post to /tl
console.log(result.headers.xKpsdkIm); // Access the x-kpsdk-im header
```

### Generating POW Data (CD)

To generate POW data (`x-kpsdk-cd`) tokens, use the `generateKasadaPow` function:

```typescript
import { generateKasadaPow } from "hyper-sdk-js/kasada/pow.js";

const powInput = new KasadaPowInput(
    0, // st: The x-kpsdk-st value returned by the /tl POST request
    0 // Optional: workTime for pre-generating POW strings
);

const payload = await generateKasadaPow(session, powInput);
console.log(payload); // The generated POW data
```

### Parsing Script Path

To parse the Kasada script path from the given blocked page (status code 429) HTML code, use the `parseKasadaPath` function:

```typescript
import { parseKasadaPath } from "hyper-sdk-js/kasada/script_path.js";

const scriptPath = parseKasadaPath(htmlContent);
if (scriptPath) {
    console.log(scriptPath); // Will look like: /ips.js?...
} else {
    console.log("Script path not found");
}
```

## DataDome

The DataDome package provides functions for interacting with DataDome, including generating
interstitial payloads and solving the slider captcha.

### Generating Interstitial Payload

To generate an interstitial payload, you first need to call the `parseInterstitialDeviceCheckUrl` function
to obtain the device check URL with the HTML response body from the block page, `datadome` cookie value,
and referer. You can then call `generateInterstitialPayload` to generate a payload.

```js
import {parseInterstitialDeviceCheckUrl, generateInterstitialPayload} from "hyper-sdk-js/datadome/interstitial.js";

const deviceCheckUrl = parseInterstitialDeviceCheckUrl(
    "", // Block page body
    "", // Value of `datadome` cookie
    "" // Referer, e.g. URL you are trying to access
);
if (deviceCheckUrl === null) {
    // deviceCheckUrl will be null if parseInterstitialDeviceCheckUrl failed to parse it.
}

// Response body from doing a GET request to deviceCheckUrl
const deviceCheckBody = "";

// Generate payload
const payload = await generateInterstitialPayload(session, {
    userAgent: "", // Browser user agent to impersonate
    deviceLink: deviceCheckUrl, // deviceCheckUrl
    html: deviceCheckBody
});
```

### Generating Slider Payload

To generate a slider captcha payload, you first need to call the `parseSliderDeviceCheckUrl` function
to obtain the device check URL with the HTML response body from the captcha page, `datadome` cookie value,
and referer. You can then call `generateSliderPayload` to generate a payload.

```js
import {parseSliderDeviceCheckUrl, generateSliderPayload} from "hyper-sdk-js/datadome/slider.js";

const result = parseSliderDeviceCheckUrl(
    "", // Block page body
    "", // Value of `datadome` cookie
    "" // Referer, e.g. URL you are trying to access
);
if (result.isIpBanned) {
    // IP address is banned.
    // Note: result.url is null if this is true.
    return;
}

// Response body from doing a GET request to result.url
const deviceCheckBody = "";

const payload = await generateSliderPayload({
    userAgent: "", // Browser user agent to impersonate
    deviceLink: result.url,
    html: deviceCheckBody,
    puzzle: "", // Puzzle image bytes, base64 encoded (looks like: `https://dd.prod.captcha-delivery.com/image/2024-xx-xx/hash.jpg`)
    piece: "" // Piece image bytes, base64 encoded (looks like: `https://dd.prod.captcha-delivery.com/image/2024-xx-xx/hash.frag.png`)
});
```

## Contributing

If you find any issues or have suggestions for improvement, please open an issue or submit a pull request.

## License

This SDK is licensed under the [MIT License](LICENSE).
