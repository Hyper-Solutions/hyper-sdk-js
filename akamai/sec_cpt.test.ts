import {parseChallengeHTML, parseChallengeJSON} from "./sec_cpt";
import * as fs from "node:fs";

test("Test parseChallengeHTML", () => {
    const src = fs.readFileSync("__tests__/sec_cpt/html_challenge.html", "utf-8");
    const challenge = parseChallengeHTML(src);

    expect(challenge).not.toBe(null);
    expect(challenge?.duration).toBe(5);
    expect(challenge?.path).toBe("/_sec/cp_challenge/ak-challenge-4-4.htm");
    expect(challenge?.cryptoChallenge).toBeDefined();
});

test("Test parseChallengeJSON", () => {
    const src = fs.readFileSync("__tests__/sec_cpt/json_challenge.json", "utf-8");
    const challenge = parseChallengeJSON(src);

    expect(challenge).not.toBeNull();
    expect(challenge?.duration).toBe(30);
    expect(challenge?.path).toBe("/_sec/cp_challenge/crypto_message-4-3.htm");

    const cryptoChallenge = challenge?.cryptoChallenge;
    expect(cryptoChallenge).toBeTruthy();
    expect(cryptoChallenge?.token).toBe("AAQAAAAJ_____9z_ZPsdHbk36hg2f6np2sGJDXmkwGmBiMBr_DDEmSWfi8Zt7BdtjWrNd9KD4DS_vim0VnK2wsa8tIC7XWsCshkvDF9J9Rf5EFwBU00c6SMXTaSNSTcDR-HVFGp3uAa67Mb3I6HeifXbjALcEomjcnwa9ZNQdDWuTAUTgNGbYw09A8AXIuP9DNv3QktUx488FV38Rm6xBXr66-MmD05hsBhucIYpLS_VCJVs9OFPnWsksPJ19ibw2K3fabfJbzIdB3Xv3J0kzLQ0gY7bpLRXK1oAcUTxNNsy-LQGe_lyV6INQ4ojPLGJpOTk");
    expect(cryptoChallenge?.timestamp).toBe(1713283747);
    expect(cryptoChallenge?.nonce).toBe("ebccdb479fcb92636fbc");
    expect(cryptoChallenge?.difficulty).toBe(15000);
    expect(cryptoChallenge?.timeout).toBe(1000);
});
