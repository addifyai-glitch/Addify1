// UAE end-of-service gratuity calculation.
// Ported from public/tools/uae-gratuity-calculator.html (computeGratuity), formula
// unchanged: 21 days/year for the first 5 years, 30 days/year after, capped at
// 2 years of basic salary. Resignation on an unlimited contract is prorated by
// years of service; a limited contract paid off by resignation forfeits gratuity.

export type ContractType = "limited" | "unlimited";

// Kept as 4 distinct reasons (matching the original tool) rather than collapsing
// to resignation/termination, since "mutual" and "death" carry their own rule
// note even though they compute to full entitlement like "termination" does.
export type TerminationType = "resignation" | "termination" | "mutual" | "death";

export type EntitlementStatus = "full" | "partial" | "zero";

export interface GratuityInput {
  monthlySalary: number;
  yearsOfService: number;
  extraDays?: number; // additional days beyond whole years, 0-364
  contractType: ContractType;
  terminationType: TerminationType;
}

export type BreakdownRowKey =
  | "first-tier"
  | "second-tier"
  | "cap-adjustment"
  | "entitlement-adjustment";

export interface GratuityBreakdownRow {
  key: BreakdownRowKey;
  years?: number;
  days: number | null;
  amount: number;
  fraction?: number;
}

export type RuleKey =
  | "death"
  | "limited-resignation-zero"
  | "limited-termination"
  | "limited-mutual"
  | "unlimited-resignation-under-1"
  | "unlimited-resignation-1-to-3"
  | "unlimited-resignation-3-to-5"
  | "unlimited-resignation-5-plus"
  | "unlimited-termination"
  | "unlimited-mutual"
  | "no-service";

export interface GratuityResult {
  totalGratuity: number;
  currency: "AED";
  totalYearsOfService: number;
  firstFiveYearsPay: number;
  additionalYearsPay: number;
  totalDaysAccrued: number;
  cappedAmount: number;
  wasCapped: boolean;
  entitlement: EntitlementStatus;
  ruleKey: RuleKey;
  breakdown: GratuityBreakdownRow[];
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function computeGratuity(input: GratuityInput): GratuityResult {
  const { monthlySalary, contractType, terminationType } = input;
  const extraDays = input.extraDays ?? 0;
  const totalYears = input.yearsOfService + extraDays / 365;
  const dailyWage = monthlySalary / 30;
  const capAmount = monthlySalary * 24; // 2 years of basic salary

  const tier1Years = Math.min(totalYears, 5);
  const tier2Years = Math.max(totalYears - 5, 0);
  const tier1Days = tier1Years * 21;
  const tier2Days = tier2Years * 30;
  const tier1Amount = tier1Days * dailyWage;
  const tier2Amount = tier2Days * dailyWage;

  const breakdown: GratuityBreakdownRow[] = [];
  if (tier1Years > 0) {
    breakdown.push({ key: "first-tier", years: tier1Years, days: round2(tier1Days), amount: round2(tier1Amount) });
  }
  if (tier2Years > 0) {
    breakdown.push({ key: "second-tier", years: tier2Years, days: round2(tier2Days), amount: round2(tier2Amount) });
  }

  let fullEntitlement = tier1Amount + tier2Amount;
  let wasCapped = false;
  if (fullEntitlement > capAmount) {
    breakdown.push({ key: "cap-adjustment", days: null, amount: round2(capAmount - fullEntitlement) });
    fullEntitlement = capAmount;
    wasCapped = true;
  }

  let finalAmount = fullEntitlement;
  let entitlement: EntitlementStatus = "full";
  let ruleKey: RuleKey = "unlimited-termination";

  if (terminationType === "death") {
    finalAmount = fullEntitlement;
    entitlement = "full";
    ruleKey = "death";
  } else if (contractType === "limited") {
    if (terminationType === "resignation") {
      finalAmount = 0;
      entitlement = "zero";
      ruleKey = "limited-resignation-zero";
    } else {
      finalAmount = fullEntitlement;
      entitlement = finalAmount > 0 ? "full" : "zero";
      ruleKey = terminationType === "termination" ? "limited-termination" : "limited-mutual";
    }
  } else {
    // unlimited
    if (terminationType === "resignation") {
      let fraction: number;
      if (totalYears < 1) {
        fraction = 0;
        entitlement = "zero";
        ruleKey = "unlimited-resignation-under-1";
      } else if (totalYears < 3) {
        fraction = 1 / 3;
        entitlement = "partial";
        ruleKey = "unlimited-resignation-1-to-3";
      } else if (totalYears < 5) {
        fraction = 2 / 3;
        entitlement = "partial";
        ruleKey = "unlimited-resignation-3-to-5";
      } else {
        fraction = 1;
        entitlement = "full";
        ruleKey = "unlimited-resignation-5-plus";
      }
      finalAmount = fullEntitlement * fraction;
      if (fraction > 0 && fraction < 1) {
        breakdown.push({
          key: "entitlement-adjustment",
          days: null,
          amount: round2(finalAmount - fullEntitlement),
          fraction,
        });
      }
    } else {
      finalAmount = fullEntitlement;
      entitlement = "full";
      ruleKey = terminationType === "termination" ? "unlimited-termination" : "unlimited-mutual";
    }
  }

  if (totalYears <= 0) {
    finalAmount = 0;
    entitlement = "zero";
    ruleKey = "no-service";
  }

  const totalDaysAccrued = round2(
    breakdown.reduce((sum, row) => sum + (row.days ?? 0), 0)
  );

  return {
    totalGratuity: round2(finalAmount),
    currency: "AED",
    totalYearsOfService: totalYears,
    firstFiveYearsPay: round2(tier1Amount),
    additionalYearsPay: round2(tier2Amount),
    totalDaysAccrued,
    cappedAmount: round2(capAmount),
    wasCapped,
    entitlement,
    ruleKey,
    breakdown,
  };
}
