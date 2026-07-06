import { VehicleProjectReport } from "../types";

export const PRESET_TEMPLATES: Record<string, Omit<VehicleProjectReport, "id" | "createdAt" | "updatedAt">> = {
  taxi: {
    name: "Shri Manjunath Mallappa Patil",
    address: "Chikkodi Road, Tq Raibag, Dist Belagavi, Karnataka",
    businessType: "Taxi & Tour Operator",
    vehicleName: "Commercial Taxi (Toyota Innova)",
    baseCost: 1850000,
    bodyBuilding: 0,
    workingCapital: 25000,
    loanAmount: 1600000,
    subsidy: 0,
    interestRate: 10.5,
    tenureYears: 5,
    moratoriumMonths: 0,
    startDate: "2026-07-01",
    workingDays: 310,
    dailyKm: 220,
    hireCharge: 18,
    mileage: 15,
    fuelPrice: 94,
    driverSalary: 180000,
    foodExpenses: 45000,
    repairsAndMaintenance: 35000,
    taxAndInsurance: 24000,
    otherExpenses: 12000,
    drawingsPct: 40,
    debtorsDays: 10,
    creditorsDays: 15,
    cashTargetPct: 15,
    status: "Approved",
    aiNarrative: `
      <h3 style="font-size: 14pt; font-weight: bold; text-decoration: underline; margin-top: 1.5rem; margin-bottom: 0.75rem;">1. INTRODUCTION</h3>
      <p style="margin-bottom: 0.75rem; text-align: justify; line-height: 1.5;">This project report has been prepared to evaluate the financial viability and debt-servicing capability of the proposed passenger transport business by <strong>Shri Manjunath Mallappa Patil</strong>. The promoter is an experienced transport entrepreneur based in Belagavi district and wishes to acquire a <strong>Commercial Taxi (Toyota Innova)</strong> to cater to the growing corporate, tourist, and luxury commute demand in the region.</p>
      <p style="margin-bottom: 0.75rem; text-align: justify; line-height: 1.5;">The proposed asset configuration is highly suited for high-mileage commercial taxi operations, combining safety, durability, and reliable passenger comfort. The funding pattern is structured with an optimal debt-equity mix comprising a bank term loan of Rs. 16,00,000 and promoter's contribution of Rs. 2,75,000.</p>
      
      <h3 style="font-size: 14pt; font-weight: bold; text-decoration: underline; margin-top: 1.5rem; margin-bottom: 0.75rem;">2. MARKET POTENTIAL & OPERATIONAL PROCESS</h3>
      <p style="margin-bottom: 0.75rem; text-align: justify; line-height: 1.5;">The demand for premium car rental and long-distance travel services in Northern Karnataka and neighboring states has seen robust growth. Rapid commercial expansion in Belagavi, coupled with industrial corridors and tourist routes to Goa and Hubli-Dharwad, ensures high capacity utilization.</p>
      <p style="margin-bottom: 0.75rem; text-align: justify; line-height: 1.5;">Operational logistics will be managed directly by the promoter. The vehicle will operate on average 310 days in a year, maintaining a daily run of 220 kilometers. The pricing is established at a highly competitive base rate of Rs. 18 per KM, which is resilient and supports consistent revenue inflows.</p>

      <h3 style="font-size: 14pt; font-weight: bold; text-decoration: underline; margin-top: 1.5rem; margin-bottom: 0.75rem;">3. MARKETING STRATEGY & VIABILITY</h3>
      <p style="margin-bottom: 0.75rem; text-align: justify; line-height: 1.5;">The marketing strategy involves dual-channel client acquisition. The promoter is establishing corporate tie-ups with regional manufacturing enterprises for regular employee/visitor travel and is enrolling the vehicle under premium aggregators and travel desks of top hospitality providers in Belagavi.</p>
      <p style="margin-bottom: 0.75rem; text-align: justify; line-height: 1.5;">Based on the operational projections, the business generates significant operating margins, easily surpassing fuel, staff, maintenance, and administrative expenses. This leaves high cash accruals to comfortably service the monthly EMI obligations with a robust Debt Service Coverage Ratio (DSCR).</p>
    `,
  },
  truck: {
    name: "Venkateshwara Logistics & Co.",
    address: "Plot No. 42, KIADB Industrial Area, Hubli, Karnataka",
    businessType: "Industrial Freight Logistics",
    vehicleName: "Heavy Tipper Truck (Tata Signa 5530.S)",
    baseCost: 4200000,
    bodyBuilding: 350000,
    workingCapital: 150000,
    loanAmount: 3800000,
    subsidy: 0,
    interestRate: 11.2,
    tenureYears: 6,
    moratoriumMonths: 3,
    startDate: "2026-08-01",
    workingDays: 280,
    dailyKm: 300,
    hireCharge: 38,
    mileage: 4.5,
    fuelPrice: 92,
    driverSalary: 240000,
    foodExpenses: 120000,
    repairsAndMaintenance: 145000,
    taxAndInsurance: 85000,
    otherExpenses: 45000,
    drawingsPct: 50,
    debtorsDays: 30,
    creditorsDays: 45,
    cashTargetPct: 20,
    status: "Draft",
    aiNarrative: `
      <h3 style="font-size: 14pt; font-weight: bold; text-decoration: underline; margin-top: 1.5rem; margin-bottom: 0.75rem;">1. INTRODUCTION</h3>
      <p style="margin-bottom: 0.75rem; text-align: justify; line-height: 1.5;">This project details the setup of a freight transport utility by <strong>Venkateshwara Logistics & Co.</strong>, led by experienced commercial transport operators. The company proposes to acquire a high-capacity <strong>Heavy Tipper Truck (Tata Signa 5530.S)</strong> to service multi-year bulk haulage contracts with mining and infrastructure development corporations in the Hubli-Dharwad industrial belt.</p>
      <p style="margin-bottom: 0.75rem; text-align: justify; line-height: 1.5;">The total cost of the project is estimated at Rs. 47,00,000, which includes the chassis cost, heavy-duty cabin fabrication, and working capital. The finance plan incorporates a 3-month moratorium period to cover the body-building fabrication timeline without straining initial cash reserves.</p>

      <h3 style="font-size: 14pt; font-weight: bold; text-decoration: underline; margin-top: 1.5rem; margin-bottom: 0.75rem;">2. MARKET POTENTIAL & OPERATIONAL PROCESS</h3>
      <p style="margin-bottom: 0.75rem; text-align: justify; line-height: 1.5;">Heavy commercial tipper demand is driven directly by national highway construction, steel plant logistics, and cement factory supply chains. Having pre-negotiated freight agreements with leading steel and cement manufacturers, the promoter guarantees high fleet utility.</p>
      <p style="margin-bottom: 0.75rem; text-align: justify; line-height: 1.5;">The vehicle will operate 280 working days per year, hauling freight across critical industrial corridors, with an estimated daily round-trip of 300 kilometers. Fuel consumption is a critical variable, modeled closely around a conservative mileage of 4.5 KM per liter at standard loaded conditions.</p>

      <h3 style="font-size: 14pt; font-weight: bold; text-decoration: underline; margin-top: 1.5rem; margin-bottom: 0.75rem;">3. MARKETING STRATEGY & VIABILITY</h3>
      <p style="margin-bottom: 0.75rem; text-align: justify; line-height: 1.5;">The marketing strategy is anchored upon direct-to-enterprise logistics contracts. By offering specialized, GPS-tracked bulk freight movement, the business builds sticky corporate relationships. Furthermore, backup agreements with third-party brokers insure against any contract gaps.</p>
      <p style="margin-bottom: 0.75rem; text-align: justify; line-height: 1.5;">The substantial payload capacity of the Tata Signa allows for highly profitable trip economics. Under the proposed financing, the cash flows are secure and exhibit comfortable debt servicing indices, validating the technical and financial feasibility of the banking facility.</p>
    `,
  },
  delivery: {
    name: "Speedy Logistics Services",
    address: "Vasant Kunj Ext, Near Airport Cargo Gate, New Delhi",
    businessType: "Last-Mile E-Commerce Delivery",
    vehicleName: "Electric Delivery Van (Tata Ace EV)",
    baseCost: 980000,
    bodyBuilding: 40000,
    workingCapital: 10000,
    loanAmount: 850000,
    subsidy: 120000, // FAME II Subsidy
    interestRate: 9.8,
    tenureYears: 4,
    moratoriumMonths: 0,
    startDate: "2026-07-01",
    workingDays: 330,
    dailyKm: 120,
    hireCharge: 22,
    mileage: 100, // For EV, mileage can represent electric range/battery efficiency (we model km per full charge, but in fuel price we use cost per charge)
    fuelPrice: 15, // Cost per full charge (super low!)
    driverSalary: 150000,
    foodExpenses: 30000,
    repairsAndMaintenance: 18000,
    taxAndInsurance: 15000,
    otherExpenses: 8000,
    drawingsPct: 30,
    debtorsDays: 15,
    creditorsDays: 30,
    cashTargetPct: 10,
    status: "Draft",
    aiNarrative: `
      <h3 style="font-size: 14pt; font-weight: bold; text-decoration: underline; margin-top: 1.5rem; margin-bottom: 0.75rem;">1. INTRODUCTION</h3>
      <p style="margin-bottom: 0.75rem; text-align: justify; line-height: 1.5;">This report details the project feasibility of an eco-friendly green fleet addition by <strong>Speedy Logistics Services</strong>. The promoter is establishing a premium last-mile shipping hub to feed metropolitan e-commerce hubs and plans to introduce the high-efficiency <strong>Electric Delivery Van (Tata Ace EV)</strong>.</p>
      <p style="margin-bottom: 0.75rem; text-align: justify; line-height: 1.5;">The project capitalizes on the Central and State FAME-II green subsidies of Rs. 1,20,000, bringing down the net equity contribution to a highly favorable Rs. 60,000. Term loan of Rs. 8,50,000 is requested to finance the rest of the zero-emission delivery vehicle.</p>

      <h3 style="font-size: 14pt; font-weight: bold; text-decoration: underline; margin-top: 1.5rem; margin-bottom: 0.75rem;">2. MARKET POTENTIAL & OPERATIONAL PROCESS</h3>
      <p style="margin-bottom: 0.75rem; text-align: justify; line-height: 1.5;">With severe emission regulations inside Delhi-NCR, green vehicles enjoy uninterrupted entry and delivery privileges during peak hours, creating a massive competitive advantage. Top retail networks pay premium tariffs for sustainable delivery pipelines.</p>
      <p style="margin-bottom: 0.75rem; text-align: justify; line-height: 1.5;">The electric drivetrain features extremely low running costs (only Rs. 15 per full charge giving 120km range), which is reflected in our operating tables. The daily delivery run is capped at 120km per day over 330 operational days annually.</p>

      <h3 style="font-size: 14pt; font-weight: bold; text-decoration: underline; margin-top: 1.5rem; margin-bottom: 0.75rem;">3. MARKETING STRATEGY & VIABILITY</h3>
      <p style="margin-bottom: 0.75rem; text-align: justify; line-height: 1.5;">The marketing strategy relies on long-term vendor listing with Amazon, Flipkart, and DHL. By committing to carbon-neutral operations, Speedy Logistics secures long-term delivery volumes with strict pricing SLA agreements.</p>
      <p style="margin-bottom: 0.75rem; text-align: justify; line-height: 1.5;">The operational surpluses of this green project are exceptionally high due to the virtual elimination of diesel fuel bills, ensuring outstanding cash profit margins and an incredibly healthy debt amortization capability.</p>
    `,
  },
};
