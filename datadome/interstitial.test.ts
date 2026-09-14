import {InterstitialInput, parseInterstitialDeviceCheckUrl} from "./interstitial";
import {parseChallengeScriptUrl} from "./script";
import {SliderInput} from "./slider";

test("Test parseInterstitialDeviceCheckUrl", () => {
    const input = `<html><head><title>liverpoolfc.com</title><style>#cmsg{animation: A 1.5s;}@keyframes A{0%{opacity:0;}99%{opacity:0;}100%{opacity:1;}}</style></head><body style="margin:0"><p id="cmsg">Please enable JS and disable any ad blocker</p><script data-cfasync="false">var dd={'rt':'c','cid':'AHrlqAAAAAMAGCP6ly_2LY8Ay22XRg==','hsh':'13C44BAB4C9D728BBD66E2A9F0233C','t':'fe','s':48047,'e':'d2d897db62073c9a1ca2406ba0863b4b5e34a39a0577683e2561b0767a77ce3b','host':'geo.captcha-delivery.com'}</script><script data-cfasync="false" src="https://ct.captcha-delivery.com/c.js"></script></body></html>`;
    const result = parseInterstitialDeviceCheckUrl(input, "dummyCookieValue", "dummyReferer");

    expect(result).toBe("https://geo.captcha-delivery.com/interstitial/?initialCid=AHrlqAAAAAMAGCP6ly_2LY8Ay22XRg%3D%3D&hash=13C44BAB4C9D728BBD66E2A9F0233C&cid=dummyCookieValue&referer=dummyReferer&s=48047&b=0");
});

test("Test parseChallengeScriptUrl on an interstitial page", () => {
    const input = `<html><head><script defer src="https://ct.captcha-delivery.com/interstitial.1.33.0.202609141.js"></script></head><body></body></html>`;

    expect(parseChallengeScriptUrl(input)).toBe("https://ct.captcha-delivery.com/interstitial.1.33.0.202609141.js");
});

test("Test parseChallengeScriptUrl on a captcha page", () => {
    const input = `<html><head><script defer src="https://ct.captcha-delivery.com/captcha.1.34.0.202609141.js"></script></head><body></body></html>`;

    expect(parseChallengeScriptUrl(input)).toBe("https://ct.captcha-delivery.com/captcha.1.34.0.202609141.js");
});

test("Test parseChallengeScriptUrl with single quotes", () => {
    const input = `<script defer src='https://ct.captcha-delivery.com/interstitial.1.33.0.202609141.js'></script>`;

    expect(parseChallengeScriptUrl(input)).toBe("https://ct.captcha-delivery.com/interstitial.1.33.0.202609141.js");
});

test("Test parseChallengeScriptUrl returns null when the script is inlined", () => {
    const input = `<html><head><script data-cfasync="false">var dd={'rt':'c'}</script><script data-cfasync="false" src="https://ct.captcha-delivery.com/c.js"></script></head><body></body></html>`;

    expect(parseChallengeScriptUrl(input)).toBeNull();
});

test("Test the script field is serialized only when it is set", () => {
    const interstitial = new InterstitialInput("ua", "deviceLink", "html", "1.1.1.1", "en-US", "scriptContents");
    expect(JSON.parse(JSON.stringify(interstitial)).script).toBe("scriptContents");

    const interstitialWithout = new InterstitialInput("ua", "deviceLink", "html", "1.1.1.1", "en-US");
    expect(JSON.stringify(interstitialWithout)).not.toContain("script");

    const slider = new SliderInput("ua", "deviceLink", "html", "puzzle", "piece", "parentUrl", "1.1.1.1", "en-US", "scriptContents");
    expect(JSON.parse(JSON.stringify(slider)).script).toBe("scriptContents");

    const sliderWithout = new SliderInput("ua", "deviceLink", "html", "puzzle", "piece", "parentUrl", "1.1.1.1", "en-US");
    expect(JSON.stringify(sliderWithout)).not.toContain("script");
});
