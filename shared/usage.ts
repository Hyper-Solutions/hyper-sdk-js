import { Session } from "../index.js";
import type { UsageResult } from "./results.js";
import { sendGetRequest, IBaseApiResponse, InvalidApiResponseError } from "./api-client.js";

interface IUsageResponse extends IBaseApiResponse, Partial<UsageResult> {
}

/**
 * Returns the euro balance and the per-plan request quota of the session's API key. It is not counted as usage.
 * @param session The {@link Session}
 * @returns {Promise<UsageResult>} A {@link Promise} that, when resolved, will contain the balance and the plans
 */
export async function getUsage(session: Session): Promise<UsageResult> {
    const response = await sendGetRequest<IUsageResponse>(
        session,
        "https://api.hypersolutions.co/usage",
        (res) => {
            if (typeof res.balanceEuro !== "number" || !Array.isArray(res.plans)) {
                throw new InvalidApiResponseError("No usage obtained from API");
            }
        }
    );

    return {
        balanceEuro: response.balanceEuro!,
        plans: response.plans!
    };
}
