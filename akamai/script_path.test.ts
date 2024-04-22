import * as fs from "fs";
import {parseAkamaiPath} from "./script_path";

test("Test parsePath", () => {
    const src = fs.readFileSync("__tests__/script_path.test.html", "utf8");

    expect(parseAkamaiPath(src)).toBe("/25n49n/o/s/1MDC3t2lMZSO/wiaDhbXVLaNaaX/ZxJDZw/eCM/zV2daVlo");
});
