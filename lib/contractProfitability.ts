export const ANNUAL_PROJECT_COST_CLP = 4_000_000;

export function calculateContractProfitability(
    annualNetAmount: number,
    currency: string
): number | null {
    if (
        currency !== "CLP" ||
        !Number.isFinite(annualNetAmount) ||
        annualNetAmount <= 0
    ) {
        return null;
    }

    return Math.round(
        ((annualNetAmount - ANNUAL_PROJECT_COST_CLP) / annualNetAmount) * 100
    );
}
