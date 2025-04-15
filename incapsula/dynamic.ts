const reeseScriptRegex = new RegExp(`src\\s*=\\s*"((/[^/]+/\\d+)(?:\\?.*)?)"`, 'i');

/**
 * Parses the dynamic Reese script paths from the given HTML content.
 * @param html The HTML content to parse
 * @param urlStr The URL string to extract the hostname from
 * @returns {Object} An object containing the sensor path and script path
 * @throws {Error} If the URL is invalid, page is not an interruption page, or Reese script is not found
 */
export function parseDynamicReeseScript(html: string, urlStr: string): { sensorPath: string, scriptPath: string } {
    // Parse the URL to extract hostname
    let hostname: string;
    try {
        const parsedUrl = new URL(urlStr);
        hostname = parsedUrl.hostname;
    } catch (err) {
        throw new Error("hyper: invalid URL");
    }

    // Verify this is an interruption page
    if (!html.includes("Pardon Our Interruption")) {
        throw new Error("hyper: not an interruption page");
    }

    // Find the Reese script
    const matches = reeseScriptRegex.exec(html);
    if (!matches || matches.length < 3) {
        throw new Error("hyper: reese script not found");
    }

    const scriptPath = matches[1];
    const sensorPath = matches[2];

    // Append the hostname to the sensor path
    return {
        sensorPath: `${sensorPath}?d=${hostname}`,
        scriptPath: scriptPath
    };
}