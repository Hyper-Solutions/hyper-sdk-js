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

## Contributing

If you find any issues or have suggestions for improvement, please open an issue or submit a pull request.

## License

This SDK is licensed under the [MIT License](LICENSE).
