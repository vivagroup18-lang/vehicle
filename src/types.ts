export interface VehicleRoute {
  id: string;
  name: string;
  tripsPerMonth: number;
  ratePerTrip: number;
  distanceKm: number;
}

export interface VehicleProjectReport {
  id: string;
  name: string;
  address: string;
  businessType: string;
  vehicleName: string;
  baseCost: number;
  bodyBuilding: number;
  workingCapital: number;
  loanAmount: number;
  subsidy: number;
  interestRate: number;
  tenureYears: number;
  moratoriumMonths: number;
  startDate: string; // YYYY-MM-DD
  workingDays: number;
  dailyKm: number;
  hireCharge: number;
  mileage: number;
  fuelPrice: number;
  driverSalary: number;
  foodExpenses: number;
  repairsAndMaintenance: number;
  taxAndInsurance: number;
  otherExpenses: number;
  drawingsPct: number; // e.g., 50 for 50%
  debtorsDays: number;
  creditorsDays: number;
  cashTargetPct: number; // e.g., 15 for 15%
  aiNarrative: string; // HTML content
  createdAt: string;
  updatedAt: string;
  status: "Draft" | "In Review" | "Approved";
  revenueMode?: "fixed" | "route";
  fixedRateType?: "per_km" | "per_day" | "flat";
  routes?: VehicleRoute[];
  subsidyTreatment?: "margin" | "investment";
}

export type SubscriptionPlan = "starter" | "pro" | "enterprise";

export interface SaaSUser {
  email: string;
  plan: SubscriptionPlan;
  projectsCreated: number;
  aiGenerationsUsed: number;
  aiGenerationsLimit: number;
  projectsLimit: number;
  companyName: string;
  phone: string;
}

export interface MockInvoice {
  id: string;
  date: string;
  amount: number;
  status: "Paid" | "Pending";
  planName: string;
}

export interface EMIScheduleRow {
  month: number;
  dateStr: string;
  fy: string;
  open: number;
  emi: number;
  int: number;
  prin: number;
  close: number;
  isMoratorium: boolean;
}

export interface FinancialProjections {
  fyLabels: string[];
  activeDays: number[];
  hireCharges: number[];
  revenues: number[];
  fuelCosts: number[];
  driverSalaries: number[];
  foodCosts: number[];
  repairsCosts: number[];
  taxCosts: number[];
  otherCosts: number[];
  totalOperatingExpenses: number[];
  surpluses: number[]; // Operating EBITDA
  depreciations: number[];
  interests: number[];
  netProfits: number[];
  drawings: number[];
  capitals: number[];
  debtors: number[];
  currLiabilities: number[];
  wdvList: number[];
  cashBalances: number[];
  investments: number[];
  dscrs: number[];
  emiSchedule: EMIScheduleRow[];
  averageDscr: number;
  monthlyEmi: number;
  capitalizedLoan: number;
}
