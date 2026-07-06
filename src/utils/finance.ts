import { 
  VehicleProjectReport, 
  FinancialProjections, 
  EMIScheduleRow 
} from "../types";

// Get Financial Year string (Indian CA Standard: April to March)
export function getFY(date: Date): string {
  const y = date.getFullYear();
  const m = date.getMonth(); // 0 = Jan, 11 = Dec
  if (m < 3) {
    return `${y - 1}-${y.toString().slice(-2)}`;
  } else {
    return `${y}-${(y + 1).toString().slice(-2)}`;
  }
}

// Format currency in Indian Style (INR Lakhs or standard formatting)
export function formatINR(num: number): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Math.round(num));
}

export function calculateProjections(report: VehicleProjectReport): FinancialProjections {
  const {
    baseCost,
    bodyBuilding,
    workingCapital,
    loanAmount: initialLoan,
    subsidy,
    interestRate,
    tenureYears,
    moratoriumMonths,
    startDate: startDateStr,
    workingDays,
    dailyKm,
    hireCharge,
    mileage,
    fuelPrice,
    driverSalary,
    foodExpenses,
    repairsAndMaintenance,
    taxAndInsurance,
    otherExpenses,
    drawingsPct,
    debtorsDays,
    creditorsDays,
    cashTargetPct,
  } = report;

  // 1. Term Loan Amortization Schedule
  let startDate = new Date(startDateStr);
  if (isNaN(startDate.getTime())) {
    startDate = new Date();
  }

  const r = (interestRate / 100) / 12;
  const totalMonths = tenureYears * 12;
  const emiSchedule: EMIScheduleRow[] = [];
  const fySet = new Set<string>();

  let bal = initialLoan;
  let currentMonth = 1;
  const emiDate = new Date(startDate);

  // Moratorium period handling
  let moratoriumInterest = 0;
  if (moratoriumMonths > 0) {
    for (let m = 0; m < moratoriumMonths; m++) {
      const interestThisMonth = bal * r;
      moratoriumInterest += interestThisMonth;

      const fy = getFY(emiDate);
      fySet.add(fy);
      
      const dateStr = emiDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      emiSchedule.push({
        month: currentMonth++,
        dateStr,
        fy,
        open: bal,
        emi: 0,
        int: interestThisMonth,
        prin: 0,
        close: bal, // Interest can be capitalized at the end of moratorium
        isMoratorium: true,
      });

      emiDate.setMonth(emiDate.getMonth() + 1);
    }
  }

  // Capitalize Moratorium Interest
  const capitalizedLoan = initialLoan + moratoriumInterest;
  bal = capitalizedLoan;

  const repaymentMonths = totalMonths - moratoriumMonths;
  let monthlyEmi = 0;
  if (repaymentMonths > 0 && r > 0) {
    monthlyEmi = (bal * r * Math.pow(1 + r, repaymentMonths)) / (Math.pow(1 + r, repaymentMonths) - 1);
  } else if (repaymentMonths > 0) {
    monthlyEmi = bal / repaymentMonths; // 0% interest fallback
  }

  // Active repayment schedule
  for (let m = 0; m < repaymentMonths; m++) {
    const interestThisMonth = bal * r;
    let principalThisMonth = monthlyEmi - interestThisMonth;
    const openBal = bal;

    if (principalThisMonth > bal) {
      principalThisMonth = bal;
    }
    bal -= principalThisMonth;

    const fy = getFY(emiDate);
    fySet.add(fy);

    const dateStr = emiDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    emiSchedule.push({
      month: currentMonth++,
      dateStr,
      fy,
      open: openBal,
      emi: monthlyEmi,
      int: interestThisMonth,
      prin: principalThisMonth,
      close: bal > 0.01 ? bal : 0,
      isMoratorium: false,
    });

    emiDate.setMonth(emiDate.getMonth() + 1);
  }

  // Unique Financial Years dynamically compiled
  const fyLabels = Array.from(fySet).sort();
  const reportYears = fyLabels.length;

  // Aggregate monthly interest, principal, and closing balances by Financial Year
  const fyInterestAccrued: number[] = [];
  const fyPrincipalAccrued: number[] = [];
  const fyLoanClosingBalance: number[] = [];

  fyLabels.forEach((fy) => {
    let fyInt = 0;
    let fyPrin = 0;
    let fyClose = initialLoan;

    emiSchedule.forEach((row) => {
      if (row.fy === fy) {
        fyInt += row.int;
        fyPrin += row.prin;
        fyClose = row.close;
      }
    });

    fyInterestAccrued.push(fyInt);
    fyPrincipalAccrued.push(fyPrin);
    fyLoanClosingBalance.push(fyClose);
  });

  // 2. Pro-rate Operating Revenues and Expenses based on start dates & inflation
  const opDate = new Date(startDate);
  const monthlyDays = workingDays / 12;
  const monthlyDriver = driverSalary / 12;
  const monthlyFood = foodExpenses / 12;
  const monthlyRepairs = repairsAndMaintenance / 12;
  const monthlyTax = taxAndInsurance / 12;
  const monthlyOther = otherExpenses / 12;

  // Initialize operation structures for each unique FY
  interface FYOp {
    rev: number;
    fuel: number;
    driver: number;
    food: number;
    repairs: number;
    tax: number;
    other: number;
    days: number;
    km: number;
  }

  const fyOps: Record<string, FYOp> = {};
  fyLabels.forEach((fy) => {
    fyOps[fy] = { rev: 0, fuel: 0, driver: 0, food: 0, repairs: 0, tax: 0, other: 0, days: 0, km: 0 };
  });

  const revMode = report.revenueMode || "fixed";
  const rateType = report.fixedRateType || "per_km";
  const routes = report.routes || [];

  // Calculate month-by-month operations
  for (let m = 0; m < totalMonths; m++) {
    const opYear = Math.floor(m / 12);
    const inf5 = Math.pow(1.05, opYear); // 5% compound inflation
    const inf10 = Math.pow(1.10, opYear); // 10% inflation for staff

    const fy = getFY(opDate);
    if (!fyOps[fy]) {
      fyOps[fy] = { rev: 0, fuel: 0, driver: 0, food: 0, repairs: 0, tax: 0, other: 0, days: 0, km: 0 };
    }

    let monthlyDistance = monthlyDays * dailyKm;
    let monthlyRevenue = 0;
    let monthlyActiveDays = monthlyDays;

    if (revMode === "route") {
      if (routes && routes.length > 0) {
        monthlyDistance = routes.reduce((sum, r) => sum + (r.tripsPerMonth * r.distanceKm), 0);
        monthlyRevenue = routes.reduce((sum, r) => sum + (r.tripsPerMonth * r.ratePerTrip), 0);
        const totalTrips = routes.reduce((sum, r) => sum + r.tripsPerMonth, 0);
        monthlyActiveDays = Math.min(28, Math.max(10, totalTrips)); // Realistic clamp for working days
      } else {
        monthlyDistance = monthlyDays * dailyKm;
        monthlyRevenue = (monthlyDays * dailyKm) * hireCharge;
        monthlyActiveDays = monthlyDays;
      }
    } else {
      monthlyDistance = monthlyDays * dailyKm;
      monthlyActiveDays = monthlyDays;
      if (rateType === "per_day") {
        monthlyRevenue = monthlyDays * hireCharge;
      } else if (rateType === "flat") {
        monthlyRevenue = hireCharge; // Treat as flat monthly revenue
      } else {
        // default: per_km
        monthlyRevenue = (monthlyDays * dailyKm) * hireCharge;
      }
    }

    fyOps[fy].days += monthlyActiveDays;
    fyOps[fy].km += monthlyDistance;
    fyOps[fy].rev += monthlyRevenue * inf5;
    fyOps[fy].fuel += (monthlyDistance / mileage) * (fuelPrice * inf5);
    fyOps[fy].driver += monthlyDriver * inf10;
    fyOps[fy].food += monthlyFood * inf10;
    fyOps[fy].repairs += monthlyRepairs * inf5;
    fyOps[fy].tax += monthlyTax * inf5;
    fyOps[fy].other += monthlyOther * inf5;

    opDate.setMonth(opDate.getMonth() + 1);
  }

  const activeDays: number[] = [];
  const hireCharges: number[] = [];
  const revenues: number[] = [];
  const fuelCosts: number[] = [];
  const driverSalaries: number[] = [];
  const foodCosts: number[] = [];
  const repairsCosts: number[] = [];
  const taxCosts: number[] = [];
  const otherCosts: number[] = [];
  const totalOperatingExpenses: number[] = [];
  const surpluses: number[] = [];

  fyLabels.forEach((fy) => {
    const d = fyOps[fy];
    const roundedDays = Math.round(d.days);
    activeDays.push(roundedDays);

    const totalKm = Math.round(d.km);
    hireCharges.push(totalKm > 0 ? (d.rev / totalKm) : hireCharge);

    revenues.push(d.rev);
    fuelCosts.push(d.fuel);
    driverSalaries.push(d.driver);
    foodCosts.push(d.food);
    repairsCosts.push(d.repairs);
    taxCosts.push(d.tax);
    otherCosts.push(d.other);

    const totalOpEx = d.fuel + d.driver + d.food + d.repairs + d.tax + d.other;
    totalOperatingExpenses.push(totalOpEx);
    surpluses.push(d.rev - totalOpEx); // Operating Surplus (EBITDA)
  });

  // 3. Depreciation Schedule (15% WDV)
  const depreciations: number[] = [];
  const wdvList: number[] = [];
  let currentAssetVal = baseCost + bodyBuilding;

  for (let y = 0; y < reportYears; y++) {
    const dep = currentAssetVal * 0.15;
    depreciations.push(dep);
    currentAssetVal -= dep;
    wdvList.push(currentAssetVal);
  }

  // 4. Financial Statement Projections: Profitability, Balance Sheet, Cash Flow
  const netProfits: number[] = [];
  const drawings: number[] = [];
  const capitals: number[] = [];
  const debtors: number[] = [];
  const currLiabilities: number[] = [];
  const cashBalances: number[] = [];
  const investments: number[] = [];
  const dscrs: number[] = [];

  let curCap = report.baseCost + report.bodyBuilding + report.workingCapital - initialLoan - subsidy; // margin capital
  if (curCap < 0) curCap = 0;

  for (let y = 0; y < reportYears; y++) {
    // Interest is dynamic per Financial Year from loan schedule
    const interest = fyInterestAccrued[y];
    const dep = depreciations[y];
    const surplus = surpluses[y];

    // Net Profit
    const profit = surplus - interest - dep;
    netProfits.push(profit);

    // Drawings
    const draw = profit > 0 ? profit * (drawingsPct / 100) : 0;
    drawings.push(draw);

    // Capital Account roll-over
    const openCap = y === 0 ? curCap : capitals[y - 1];
    const closeCap = openCap + profit - draw;
    capitals.push(closeCap);

    // Sundry Debtors
    const debtor = (revenues[y] / 365) * debtorsDays;
    debtors.push(debtor);

    // Current Liabilities (Creditors) based on Cash Operating Expenses
    const currentLiab = (totalOperatingExpenses[y] / 365) * creditorsDays;
    currLiabilities.push(currentLiab);

    // double-entry balance tally
    const totalLiabilities = closeCap + subsidy + fyLoanClosingBalance[y] + currentLiab;
    const fixedAssetWdv = wdvList[y];
    
    // Remaining assets are Cash + Investments
    const liquidAvailable = totalLiabilities - fixedAssetWdv - debtor;
    
    // target cash balance calculation to maintain liquidity
    const targetCash = openCap * (cashTargetPct / 100);
    let cashBal = 0;
    let investmentVal = 0;

    if (liquidAvailable > targetCash) {
      cashBal = targetCash;
      investmentVal = liquidAvailable - targetCash;
    } else {
      cashBal = liquidAvailable > 0 ? liquidAvailable : 0;
      investmentVal = 0;
    }

    cashBalances.push(cashBal);
    investments.push(investmentVal);

    // DSCR (Debt Service Coverage Ratio)
    // Cash Accruals = Net Profit + Depreciation + Interest on Loan
    const cashAccruals = profit + dep + interest;
    // Debt Obligation = Principal Repaid + Interest Paid
    const debtObligation = fyPrincipalAccrued[y] + interest;
    dscrs.push(debtObligation > 0 ? (cashAccruals / debtObligation) : 0);
  }

  // Calculate Average DSCR
  const totalDscr = dscrs.reduce((a, b) => a + b, 0);
  const averageDscr = reportYears > 0 ? totalDscr / reportYears : 0;

  return {
    fyLabels,
    activeDays,
    hireCharges,
    revenues,
    fuelCosts,
    driverSalaries,
    foodCosts,
    repairsCosts,
    taxCosts,
    otherCosts,
    totalOperatingExpenses,
    surpluses,
    depreciations,
    interests: fyInterestAccrued,
    netProfits,
    drawings,
    capitals,
    debtors,
    currLiabilities,
    wdvList,
    cashBalances,
    investments,
    dscrs,
    emiSchedule,
    averageDscr,
    monthlyEmi,
    capitalizedLoan,
  };
}
