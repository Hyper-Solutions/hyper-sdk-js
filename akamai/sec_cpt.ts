import { createHash } from "crypto";

/**
 * The value of the `sec_cpt` cookie is invalid.
 */
export class InvalidSecurityCheckpointCookieError extends Error {
    constructor(cookieValue: string) {
        super("Invalid sec_cpt cookie: " + cookieValue);
    }
}

/**
 * Crypto challenge.
 */
export class CryptoChallenge {
    token: string;
    timestamp: number;
    nonce: string;

    /**
     * The challenge difficulty.
     * The higher the number, the more intensive the challenge is.
     */
    public readonly difficulty: number;

    /**
     * The timeout, in milliseconds.
     *
     * After this time, it is advised that the client aborts
     * attempting to solve the challenge.
     */
    public readonly timeout: number;

    constructor(token: string, timestamp: number, nonce: string, difficulty: number, timeout: number) {
        this.token = token;
        this.timestamp = timestamp;
        this.nonce = nonce;
        this.difficulty = difficulty;
        this.timeout = timeout;
    }

    /**
     * Generates a payload to be submitted to `/_sec/verify?provider=crypto`.
     * @param cookie The value of the `sec_cpt` cookie
     * @returns The generated payload
     */
    public generatePayload(cookie: string): string {
        // Parse id
        const index = cookie.indexOf("~");
        if (index == -1) {
            throw new InvalidSecurityCheckpointCookieError(cookie);
        }
        const id = cookie.substring(0, index);

        // Generate payload
        return JSON.stringify({
            token: this.token,
            answers: this.generateAnswers(id)
        });
    }

    generateAnswers(id: string): string[] {
        const answers: string[] = new Array(10);
        const prefix = id + this.timestamp + this.nonce;

        for (let i = 0; i < answers.length; i++) {
            const initialPart = prefix + (this.difficulty + i);

            while (true) {
                const answer = Math.random().toString(16);

                const hash = createHash("sha256");
                hash.update(initialPart + answer);
                const checksum = hash.digest();

                let output = 0;
                for (const v of checksum) {
                    output = ((output << 8) | v) >>> 0;
                    output %= this.difficulty + i;
                }

                if (output != 0) {
                    continue;
                }

                answers[i] = answer;
                break;
            }
        }

        return answers;
    }
}

/**
 * Security checkpoint challenge.
 */
export class Challenge {
    /**
     * The duration of the challenge, in seconds.
     */
    public readonly duration: number;

    /**
     * The path of the challenge page.
     */
    public readonly path: string;

    /**
     * Crypto challenge.
     */
    public cryptoChallenge?: CryptoChallenge;

    constructor(duration: number, path: string, cryptoChallenge?: CryptoChallenge) {
        this.duration = duration;
        this.path = path;
        this.cryptoChallenge = cryptoChallenge;
    }

    /**
     * Returns a Promise that is resolved when the challenge's duration has passed.
     */
    public async wait() {
        return new Promise(resolve => setTimeout(resolve, this.duration * 1000));
    }

    /**
     * Reports if the crypto challenge is present.
     */
    public hasCryptoChallenge(): boolean {
        return this.cryptoChallenge != undefined;
    }

    /**
     * Updates the crypto challenge with the response from `/_sec/verify?provider=crypto`.
     * @param response The raw HTTP response
     */
    public updateCryptoChallenge(response: string) {
        const raw = JSON.parse(response);

        if (!raw.hasOwnProperty("token")) {
            this.cryptoChallenge = undefined;
            return;
        }

        this.cryptoChallenge = new CryptoChallenge(
            raw.token,
            raw.timestamp,
            raw.nonce,
            raw.difficulty,
            raw.timeout
        );
    }
}

/**
 * Parses a security checkpoint challenge from the given HTML code.
 * Returns `null` if the parsed challenge is invalid.
 * @param src The HTML source code
 * @returns The challenge
 */
export function parseChallengeHTML(src: string): Challenge | null {
    // exec regex
    const durationResult = /data-duration=(\d+)/.exec(src);
    if (durationResult == null || durationResult.length < 2) {
        return null;
    }
    // Parse duration as a number, return null if NaN
    const duration = parseInt(durationResult[1]);
    if (isNaN(duration)) {
        return null;
    }

    // Parse path
    const pageRegex = new RegExp(`src="(\/_sec\/cp_challenge\/ak-challenge-\\d+-\\d+.htm)"`);
    const pageResult = pageRegex.exec(src);
    if (pageResult == null || pageResult.length < 2) {
        return null;
    }
    const path = pageResult[1];

    // Parse crypto challenge
    let challenge: CryptoChallenge | undefined = undefined;
    const rawData = /challenge="(.*?)"/.exec(src);
    if (rawData != null && rawData.length >= 2) {
        const raw = JSON.parse(atob(rawData[1]));

        challenge = new CryptoChallenge(
            raw.token,
            raw.timestamp,
            raw.nonce,
            raw.difficulty,
            raw.timeout
        );
    }

    return new Challenge(duration, path, challenge);
}

/**
 * Parses a security checkpoint challenge from the given raw JSON.
 * Returns `null` if the JSON is invalid.
 *
 * This function should be used to parse a block response (HTTP status 428).
 * @param src The raw JSON response
 * @returns The parsed {@link Challenge}
 */
export function parseChallengeJSON(src: string): Challenge | null {
    const raw = JSON.parse(src);

    if (!raw.hasOwnProperty("sec-cp-challenge")) {
        return null;
    }

    return new Challenge(
        raw.chlg_duration,
        raw.branding_url_content,
        new CryptoChallenge(
            raw.token,
            raw.timestamp,
            raw.nonce,
            raw.difficulty,
            raw.timeout
        )
    );
}
