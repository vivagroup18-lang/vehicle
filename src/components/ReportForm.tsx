import React, { useState } from "react";
import { VehicleProjectReport, SaaSUser } from "../types";
import { PRESET_TEMPLATES } from "../utils/templates";
import { 
  User, 
  Coins, 
  Navigation, 
  Settings, 
  Wrench, 
  Sparkles, 
  Loader2, 
  AlertCircle,
  FileText,
  Plus,
  Trash2
} from "lucide-react";

interface ReportFormProps {
  report: VehicleProjectReport;
  onChange: (updates: Partial<VehicleProjectReport>) => void;
  user: SaaSUser;
  onUseAi: () => void;
  isGenerated: boolean;
  onGenerate: () => void;
}

export default function ReportForm({ report, onChange, user, onUseAi, isGenerated, onGenerate }: ReportFormProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "finance" | "ops" | "costs" | "assumptions" | "narrative">("profile");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Load a preset template
  const handleLoadPreset = (key: "taxi" | "truck" | "delivery") => {
    const preset = PRESET_TEMPLATES[key];
    if (preset) {
      onChange(preset);
    }
  };

  // Trigger Gemini AI Narrative generation from server proxy
  const handleAiGenerate = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const response = await fetch("/api/generate-narrative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promoterName: report.name,
          address: report.address,
          businessType: report.businessType,
          vehicleName: report.vehicleName,
          baseCost: report.baseCost,
          bodyBuilding: report.bodyBuilding,
          workingCapital: report.workingCapital,
          loanAmount: report.loanAmount,
          subsidy: report.subsidy,
          tenureYears: report.tenureYears,
        }),
      });

      const data = await response.json();
      if (data.success && data.text) {
        onChange({ aiNarrative: data.text });
        onUseAi(); // Increment AI usage counter
      } else {
        throw new Error(data.error || "Failed to generate AI content");
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Could not connect to AI generation. Ensure your GEMINI_API_KEY is configured in Secrets.");
    } finally {
      setAiLoading(false);
    }
  };

  // Helper: auto calculate margin
  const totalCost = report.baseCost + report.bodyBuilding + report.workingCapital;
  const isSubsidyAsMargin = report.subsidyTreatment !== "investment";
  const marginCapital = Math.max(0, totalCost - report.loanAmount - (isSubsidyAsMargin ? report.subsidy : 0));

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "finance", label: "Finance", icon: Coins },
    { id: "ops", label: "Operations", icon: Navigation },
    { id: "costs", label: "Costs", icon: Wrench },
    { id: "assumptions", label: "Ratios", icon: Settings },
    { id: "narrative", label: "AI Writer", icon: Sparkles },
  ] as const;

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      
      {/* Preset Pickers */}
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          Load Reference Templates (Presets)
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleLoadPreset("taxi")}
            className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 rounded-lg p-2 text-xs font-semibold shadow-sm transition-all"
          >
            🚕 Innova Taxi
          </button>
          <button
            onClick={() => handleLoadPreset("truck")}
            className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 rounded-lg p-2 text-xs font-semibold shadow-sm transition-all"
          >
            🚛 Tata Tipper
          </button>
          <button
            onClick={() => handleLoadPreset("delivery")}
            className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 rounded-lg p-2 text-xs font-semibold shadow-sm transition-all"
          >
            🔋 Electric Van
          </button>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-200 overflow-x-auto custom-scroll bg-slate-50/50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[70px] py-3 text-[11px] font-bold border-b-2 flex flex-col items-center gap-1 transition-all ${
                isActive
                  ? "border-blue-600 text-blue-600 bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Content scrollable */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scroll">
        
        {/* TAB 1: Profile */}
        {activeTab === "profile" && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b pb-1">
              Promoter & Asset Profile
            </h3>
            
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Promoter / Applicant Name</label>
              <input
                type="text"
                value={report.name}
                onChange={(e) => onChange({ name: e.target.value })}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Shri Manjunath Mallappa Patil"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Business Address</label>
              <textarea
                rows={2}
                value={report.address}
                onChange={(e) => onChange({ address: e.target.value })}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Chikkodi Road, Tq Raibag, Dist Belagavi"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Business Type</label>
                <input
                  type="text"
                  value={report.businessType}
                  onChange={(e) => onChange({ businessType: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Taxi Operator"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Vehicle Model</label>
                <input
                  type="text"
                  value={report.vehicleName}
                  onChange={(e) => onChange({ vehicleName: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Toyota Innova"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Purchase Start Date</label>
                <input
                  type="date"
                  value={report.startDate}
                  onChange={(e) => onChange({ startDate: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Report Status</label>
                <select
                  value={report.status}
                  onChange={(e) => onChange({ status: e.target.value as any })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="Draft">Draft Mode</option>
                  <option value="In Review">In Audit / Review</option>
                  <option value="Approved">Approved / Final</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Finance */}
        {activeTab === "finance" && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b pb-1">
              Project Finance Structure
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Vehicle Cost (₹)</label>
                <input
                  type="number"
                  value={report.baseCost}
                  onChange={(e) => onChange({ baseCost: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-700"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Body Fabrication (₹)</label>
                <input
                  type="number"
                  value={report.bodyBuilding}
                  onChange={(e) => onChange({ bodyBuilding: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Working Capital (₹)</label>
                <input
                  type="number"
                  value={report.workingCapital}
                  onChange={(e) => onChange({ workingCapital: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-700"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Total Cost (₹)</label>
                <div className="w-full bg-slate-50 border border-slate-200 text-slate-500 rounded-lg p-2.5 text-xs font-bold">
                  ₹{totalCost.toLocaleString("en-IN")}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Bank Term Loan (₹)</label>
                <input
                  type="number"
                  value={report.loanAmount}
                  onChange={(e) => onChange({ loanAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-blue-500 font-bold text-blue-700"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Subsidy / Incentive (₹)</label>
                <input
                  type="number"
                  value={report.subsidy}
                  onChange={(e) => onChange({ subsidy: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-700"
                />
              </div>
            </div>

            {report.subsidy > 0 && (
              <div className="bg-slate-50 border border-slate-250 p-2.5 rounded-lg text-xs space-y-1">
                <label className="block text-[11px] font-bold text-slate-700">Subsidy Treatment</label>
                <select
                  value={report.subsidyTreatment || "margin"}
                  onChange={(e) => onChange({ subsidyTreatment: e.target.value as "margin" | "investment" })}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 bg-white font-semibold text-slate-800"
                >
                  <option value="margin">As Promoter's Margin Contribution (Reduces own contribution)</option>
                  <option value="investment">As Capital Investment/Reserve (Durable project liquidity)</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Required Margin Capital (Own Capital)</label>
              <div className="w-full bg-emerald-50/50 border border-emerald-200 text-emerald-800 rounded-lg p-2.5 text-xs font-extrabold flex justify-between items-center">
                <span>Promoter Equity Contribution:</span>
                <span>₹{marginCapital.toLocaleString("en-IN")}</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Calculated as: {isSubsidyAsMargin ? "Total Cost - Bank Loan - Govt Subsidy" : "Total Cost - Bank Loan"}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.05"
                  value={report.interestRate}
                  onChange={(e) => onChange({ interestRate: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-blue-500 text-center font-semibold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Tenure (Years)</label>
                <input
                  type="number"
                  value={report.tenureYears}
                  onChange={(e) => onChange({ tenureYears: parseInt(e.target.value) || 1 })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-blue-500 text-center font-semibold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Moratorium (Mo)</label>
                <input
                  type="number"
                  value={report.moratoriumMonths}
                  onChange={(e) => onChange({ moratoriumMonths: parseInt(e.target.value) || 0 })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-blue-500 text-center font-semibold"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Operations */}
        {activeTab === "ops" && (() => {
          const revMode = report.revenueMode || "fixed";
          const rateType = report.fixedRateType || "per_km";
          const routes = report.routes || [];

          let summaryAnnualDistance = 0;
          let summaryAnnualRevenue = 0;

          if (revMode === "route") {
            summaryAnnualDistance = routes.reduce((sum, r) => sum + (r.tripsPerMonth * r.distanceKm * 12), 0);
            summaryAnnualRevenue = routes.reduce((sum, r) => sum + (r.tripsPerMonth * r.ratePerTrip * 12), 0);
          } else {
            summaryAnnualDistance = report.workingDays * report.dailyKm;
            if (rateType === "per_day") {
              summaryAnnualRevenue = report.workingDays * report.hireCharge;
            } else if (rateType === "flat") {
              summaryAnnualRevenue = 12 * report.hireCharge;
            } else {
              summaryAnnualRevenue = report.workingDays * report.dailyKm * report.hireCharge;
            }
          }

          return (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b pb-1">
                Operational & Revenue Assumptions
              </h3>

              {/* Revenue Determination Basis Selection Toggle */}
              <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-xl">
                <label className="block text-[10px] font-extrabold text-slate-500 mb-2 uppercase tracking-widest">
                  Revenue Determination Basis
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onChange({ revenueMode: "fixed" })}
                    className={`py-2 px-3 text-xs font-bold rounded-lg transition-all border ${
                      revMode === "fixed"
                        ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Fixed Hire Rate
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const existingRoutes = report.routes || [];
                      const defaultRoutes = existingRoutes.length > 0 ? existingRoutes : [
                        { id: "1", name: "Route A (Intercity)", tripsPerMonth: 12, ratePerTrip: 15000, distanceKm: 220 },
                        { id: "2", name: "Route B (Local Delivery)", tripsPerMonth: 8, ratePerTrip: 8500, distanceKm: 120 }
                      ];
                      onChange({ revenueMode: "route", routes: defaultRoutes });
                    }}
                    className={`py-2 px-3 text-xs font-bold rounded-lg transition-all border ${
                      revMode === "route"
                        ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Route Based Revenue
                  </button>
                </div>
              </div>

              {/* Dynamic Inputs based on selection */}
              {revMode === "fixed" ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Working Days / Year</label>
                      <input
                        type="number"
                        value={report.workingDays}
                        onChange={(e) => onChange({ workingDays: parseInt(e.target.value) || 0 })}
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Daily Run (KM)</label>
                      <input
                        type="number"
                        value={report.dailyKm}
                        onChange={(e) => onChange({ dailyKm: parseInt(e.target.value) || 0 })}
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-xl space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Tariff Structure Selection</label>
                      <select
                        value={rateType}
                        onChange={(e) => onChange({ fixedRateType: e.target.value as any })}
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-xs outline-none bg-white font-medium focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="per_km">Per KM Basis Tariff (Standard)</option>
                        <option value="per_day">Per Day Fixed Hire Charges</option>
                        <option value="flat">Flat Monthly Contract Value</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        {rateType === "per_km" && "Hire Charge Tariff (₹ / KM)"}
                        {rateType === "per_day" && "Daily Hire Charge (₹ / Day)"}
                        {rateType === "flat" && "Flat Monthly Contract Revenue (₹ / Month)"}
                      </label>
                      <input
                        type="number"
                        value={report.hireCharge}
                        onChange={(e) => onChange({ hireCharge: parseFloat(e.target.value) || 0 })}
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-blue-500 font-bold text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between border-b pb-1">
                    <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Defined Transit Routes</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newRoute = {
                          id: Date.now().toString(),
                          name: `Route ${String.fromCharCode(65 + routes.length)} (New)`,
                          tripsPerMonth: 10,
                          ratePerTrip: 12000,
                          distanceKm: 150
                        };
                        onChange({ routes: [...routes, newRoute] });
                      }}
                      className="text-[10px] uppercase font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Transit Route
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                    {routes.map((route, idx) => (
                      <div key={route.id || idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 relative space-y-2.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Route #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = routes.filter((r) => r.id !== route.id);
                              onChange({ routes: updated });
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-lg transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Route Name / Description</label>
                            <input
                              type="text"
                              value={route.name}
                              onChange={(e) => {
                                const updated = routes.map((r) => 
                                  r.id === route.id ? { ...r, name: e.target.value } : r
                                );
                                onChange({ routes: updated });
                              }}
                              className="w-full border border-slate-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 font-medium bg-white"
                              placeholder="e.g. Mumbai - Pune Fast Delivery"
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Trips / Mo</label>
                              <input
                                type="number"
                                value={route.tripsPerMonth}
                                onChange={(e) => {
                                  const updated = routes.map((r) => 
                                    r.id === route.id ? { ...r, tripsPerMonth: parseInt(e.target.value) || 0 } : r
                                  );
                                  onChange({ routes: updated });
                                }}
                                className="w-full border border-slate-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 text-center font-mono bg-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Rate / Trip (₹)</label>
                              <input
                                type="number"
                                value={route.ratePerTrip}
                                onChange={(e) => {
                                  const updated = routes.map((r) => 
                                    r.id === route.id ? { ...r, ratePerTrip: parseFloat(e.target.value) || 0 } : r
                                  );
                                  onChange({ routes: updated });
                                }}
                                className="w-full border border-slate-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 text-center font-bold text-emerald-700 font-mono bg-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Dist. / Trip (KM)</label>
                              <input
                                type="number"
                                value={route.distanceKm}
                                onChange={(e) => {
                                  const updated = routes.map((r) => 
                                    r.id === route.id ? { ...r, distanceKm: parseInt(e.target.value) || 0 } : r
                                  );
                                  onChange({ routes: updated });
                                }}
                                className="w-full border border-slate-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 text-center font-mono bg-white"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {routes.length === 0 && (
                      <div className="p-4 border border-dashed border-slate-200 text-center text-slate-400 rounded-xl text-xs">
                        No routes defined. Please click "Add Transit Route" to specify travel paths.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Standard Fuel Consumption Parameters (always visible as they are needed) */}
              <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Fuel Economy (Mileage KM/L)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={report.mileage}
                    onChange={(e) => onChange({ mileage: parseFloat(e.target.value) || 1 })}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Fuel Price (₹ / Litre)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={report.fuelPrice}
                    onChange={(e) => onChange({ fuelPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>

              {/* Annualized Summary Section */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs text-slate-600 space-y-1.5 shadow-inner">
                <span className="font-extrabold text-slate-700 block uppercase tracking-wide text-[10px]">
                  Pro-Forma Annualized Estimate Summary:
                </span>
                <div className="flex justify-between items-center text-[11px]">
                  <span>Calculated Annual Mileage:</span>
                  <span className="font-mono font-bold text-slate-700">
                    {summaryAnnualDistance.toLocaleString()} KM
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span>Calculated Annual Revenue:</span>
                  <span className="font-mono font-extrabold text-blue-700 text-xs">
                    ₹{summaryAnnualRevenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </span>
                </div>
                {revMode === "route" && routes.length > 0 && (
                  <div className="flex justify-between items-center text-[10px] text-slate-400 italic pt-1 border-t border-slate-200">
                    <span>Active Route Count:</span>
                    <span>{routes.length} Transit Paths</span>
                  </div>
                )}
                {revMode === "fixed" && (
                  <div className="flex justify-between items-center text-[10px] text-slate-400 italic pt-1 border-t border-slate-200">
                    <span>Billing Metric:</span>
                    <span>
                      {rateType === "per_km" && "Tariff per Kilometer run"}
                      {rateType === "per_day" && "Daily flat billing charges"}
                      {rateType === "flat" && "Monthly retainer/contract fee"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* TAB 4: Costs */}
        {activeTab === "costs" && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b pb-1">
              Annual Operating Expenses
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Driver Salary (Yearly ₹)</label>
              <input
                type="number"
                value={report.driverSalary}
                onChange={(e) => onChange({ driverSalary: parseFloat(e.target.value) || 0 })}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Food & Helper Outlays (Yearly ₹)</label>
              <input
                type="number"
                value={report.foodExpenses}
                onChange={(e) => onChange({ foodExpenses: parseFloat(e.target.value) || 0 })}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Repairs (Yearly ₹)</label>
                <input
                  type="number"
                  value={report.repairsAndMaintenance}
                  onChange={(e) => onChange({ repairsAndMaintenance: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Tax & Insur. (Yearly ₹)</label>
                <input
                  type="number"
                  value={report.taxAndInsurance}
                  onChange={(e) => onChange({ taxAndInsurance: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Other Office / Admin Expenses (Yearly ₹)</label>
              <input
                type="number"
                value={report.otherExpenses}
                onChange={(e) => onChange({ otherExpenses: parseFloat(e.target.value) || 0 })}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* TAB 5: Assumptions */}
        {activeTab === "assumptions" && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b pb-1">
              Financial Ratios & Balance Sheet Ratios
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Proprietor Drawings (%)</label>
                <input
                  type="number"
                  value={report.drawingsPct}
                  onChange={(e) => onChange({ drawingsPct: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-blue-500 text-center"
                />
                <p className="text-[9px] text-slate-400 mt-0.5">Drawings as % of Net Profit</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Min Cash Target (%)</label>
                <input
                  type="number"
                  value={report.cashTargetPct}
                  onChange={(e) => onChange({ cashTargetPct: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-blue-500 text-center"
                />
                <p className="text-[9px] text-slate-400 mt-0.5">Liquid cash as % of Capital</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Sundry Debtors (Days)</label>
                <input
                  type="number"
                  value={report.debtorsDays}
                  onChange={(e) => onChange({ debtorsDays: parseInt(e.target.value) || 0 })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-blue-500 text-center"
                />
                <p className="text-[9px] text-slate-400 mt-0.5">Average collection outstanding</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Sundry Creditors (Days)</label>
                <input
                  type="number"
                  value={report.creditorsDays}
                  onChange={(e) => onChange({ creditorsDays: parseInt(e.target.value) || 0 })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-blue-500 text-center"
                />
                <p className="text-[9px] text-slate-400 mt-0.5">Operating expenses credit days</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: AI Writer */}
        {activeTab === "narrative" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-1">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-purple-600" />
                AI Narrative Generator
              </h3>
              <span className="text-[10px] text-slate-400 bg-slate-100 rounded px-1.5 py-0.5 font-mono">
                {user.aiGenerationsLimit - user.aiGenerationsUsed} left
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Generate formal introductory backgrounds, market viability reports, and customized business descriptions based on your inputs. Uses Gemini to compose professional prose in standard HTML.
            </p>

            <button
              onClick={handleAiGenerate}
              disabled={aiLoading || user.aiGenerationsUsed >= user.aiGenerationsLimit}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {aiLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating CA Report...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Draft Narrative with Gemini AI
                </>
              )}
            </button>

            {aiError && (
              <div className="bg-red-50 text-red-800 border border-red-200 p-3 rounded-lg flex gap-2 items-start text-xs">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{aiError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Narrative Content (Edit Mode)
              </label>
              <textarea
                rows={10}
                value={report.aiNarrative}
                onChange={(e) => onChange({ aiNarrative: e.target.value })}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-blue-500 font-mono leading-relaxed"
                placeholder="Click the generation button above or enter custom HTML/text narratives..."
              />
              <p className="text-[9px] text-slate-400 mt-1">
                Supports standard HTML formatting like &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, and &lt;li&gt;.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Sticky Bottom Generation Controls */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
        <div className="text-left">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Dossier Status</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`w-2 h-2 rounded-full ${isGenerated ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
            <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">
              {isGenerated ? "Report Active" : "Pending Compile"}
            </span>
          </div>
        </div>
        <button
          onClick={onGenerate}
          className={`px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all active:scale-[0.98] ${
            isGenerated
              ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/15"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isGenerated ? "Update & Re-compile" : "Generate Project Report"}</span>
        </button>
      </div>
    </div>
  );
}
