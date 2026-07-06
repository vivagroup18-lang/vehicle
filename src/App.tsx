import React, { useState, useEffect } from "react";
import { 
  VehicleProjectReport, 
  SaaSUser, 
  MockInvoice, 
  SubscriptionPlan 
} from "./types";
import { PRESET_TEMPLATES } from "./utils/templates";
import { calculateProjections } from "./utils/finance";
import ReportForm from "./components/ReportForm";
import ReportPreview from "./components/ReportPreview";
import SaaSMetrics from "./components/SaaSMetrics";
import BillingModal from "./components/BillingModal";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileSpreadsheet, 
  Plus, 
  Search, 
  Trash2, 
  Copy, 
  LogOut, 
  Sparkles, 
  FolderGit2, 
  Download, 
  Upload,
  UserCheck,
  Building,
  FileCheck,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Printer
} from "lucide-react";

const LOCAL_STORAGE_KEY_REPORTS = "ca_saas_vehicle_reports";
const LOCAL_STORAGE_KEY_USER = "ca_saas_user_profile";
const LOCAL_STORAGE_KEY_INVOICES = "ca_saas_invoices";

export default function App() {
  // 1. SaaS User Context
  const [user, setUser] = useState<SaaSUser>({
    email: "vivagroup18@gmail.com",
    plan: "starter",
    projectsCreated: 1,
    aiGenerationsUsed: 0,
    aiGenerationsLimit: 3,
    projectsLimit: 1,
    companyName: "VIVA Consultancy Services",
    phone: "6363585097",
  });

  // 2. Project Reports List
  const [reports, setReports] = useState<VehicleProjectReport[]>([]);
  const [activeReportId, setActiveReportId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [invoices, setInvoices] = useState<MockInvoice[]>([]);
  const [generatedReports, setGeneratedReports] = useState<Record<string, boolean>>({});
  const [activeWindow, setActiveWindow] = useState<"identity" | "feeding" | "display">("identity");
  const [printTriggerCount, setPrintTriggerCount] = useState(0);

  // Initialize data on mount
  useEffect(() => {
    // Load User
    const savedUser = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Load Invoices
    const savedInvoices = localStorage.getItem(LOCAL_STORAGE_KEY_INVOICES);
    if (savedInvoices) {
      setInvoices(JSON.parse(savedInvoices));
    }

    // Load Reports
    const savedReports = localStorage.getItem(LOCAL_STORAGE_KEY_REPORTS);
    if (savedReports) {
      const parsed = JSON.parse(savedReports);
      setReports(parsed);
      if (parsed.length > 0) {
        setActiveReportId(parsed[0].id);
      }
    } else {
      // Seed with our high-quality Taxi template on first run
      const defaultReport: VehicleProjectReport = {
        id: "default-taxi",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...PRESET_TEMPLATES.taxi,
      };
      const initialList = [defaultReport];
      setReports(initialList);
      setActiveReportId(defaultReport.id);
      localStorage.setItem(LOCAL_STORAGE_KEY_REPORTS, JSON.stringify(initialList));
    }
  }, []);

  // Save reports to localStorage whenever list changes
  const saveReports = (newList: VehicleProjectReport[]) => {
    setReports(newList);
    localStorage.setItem(LOCAL_STORAGE_KEY_REPORTS, JSON.stringify(newList));
    
    // Keep user's active report count synchronized
    const updatedUser = { ...user, projectsCreated: newList.length };
    setUser(updatedUser);
    localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(updatedUser));
  };

  // Get active report
  const activeReport = reports.find((r) => r.id === activeReportId) || reports[0];

  // Form edit updates
  const handleReportChange = (updates: Partial<VehicleProjectReport>) => {
    if (!activeReport) return;
    const newList = reports.map((r) => {
      if (r.id === activeReportId) {
        return {
          ...r,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
      return r;
    });
    saveReports(newList);
  };

  // Enforce SaaS creation limits
  const handleCreateReport = () => {
    if (reports.length >= user.projectsLimit) {
      setIsBillingOpen(true);
      return;
    }

    const newId = `report-${Date.now()}`;
    const newReport: VehicleProjectReport = {
      id: newId,
      name: "New Promoter Name",
      address: "New Address Detail",
      businessType: "Taxi / Transport Operations",
      vehicleName: "Commercial Vehicle Model",
      baseCost: 1000000,
      bodyBuilding: 0,
      workingCapital: 20000,
      loanAmount: 850000,
      subsidy: 0,
      interestRate: 11.0,
      tenureYears: 5,
      moratoriumMonths: 0,
      startDate: new Date().toISOString().split("T")[0],
      workingDays: 300,
      dailyKm: 200,
      hireCharge: 15,
      mileage: 12,
      fuelPrice: 95,
      driverSalary: 150000,
      foodExpenses: 40000,
      repairsAndMaintenance: 25000,
      taxAndInsurance: 20000,
      otherExpenses: 10000,
      drawingsPct: 50,
      debtorsDays: 15,
      creditorsDays: 30,
      cashTargetPct: 15,
      status: "Draft",
      aiNarrative: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newList = [newReport, ...reports];
    saveReports(newList);
    setActiveReportId(newId);
  };

  const handleDuplicateReport = (reportToClone: VehicleProjectReport, e: React.MouseEvent) => {
    e.stopPropagation();
    if (reports.length >= user.projectsLimit) {
      setIsBillingOpen(true);
      return;
    }

    const newId = `report-clone-${Date.now()}`;
    const cloned: VehicleProjectReport = {
      ...reportToClone,
      id: newId,
      name: `${reportToClone.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newList = [cloned, ...reports];
    saveReports(newList);
    setActiveReportId(newId);
  };

  const handleDeleteReport = (idToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (reports.length <= 1) {
      alert("At least one project report must remain on your dashboard.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this vehicle project report?")) {
      const newList = reports.filter((r) => r.id !== idToDelete);
      saveReports(newList);
      if (activeReportId === idToDelete) {
        setActiveReportId(newList[0].id);
      }
    }
  };

  // SaaS Upgrades
  const handleUpgradePlan = (newPlan: SubscriptionPlan) => {
    let projectsLimit = 1;
    let aiGenerationsLimit = 3;
    let amount = 0;
    let planName = "Starter Free Plan";

    if (newPlan === "pro") {
      projectsLimit = 15;
      aiGenerationsLimit = 30;
      amount = 3999;
      planName = "Professional Pro";
    } else if (newPlan === "enterprise") {
      projectsLimit = 9999;
      aiGenerationsLimit = 9999;
      amount = 14999;
      planName = "Enterprise Firm";
    }

    const updatedUser: SaaSUser = {
      ...user,
      plan: newPlan,
      projectsLimit,
      aiGenerationsLimit,
    };

    setUser(updatedUser);
    localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(updatedUser));

    // Append Mock Invoice
    const newInvoice: MockInvoice = {
      id: `INV-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      amount,
      status: "Paid",
      planName,
    };

    const updatedInvoices = [newInvoice, ...invoices];
    setInvoices(updatedInvoices);
    localStorage.setItem(LOCAL_STORAGE_KEY_INVOICES, JSON.stringify(updatedInvoices));
  };

  const handleUseAiNarrative = () => {
    const updatedUser = {
      ...user,
      aiGenerationsUsed: user.aiGenerationsUsed + 1,
    };
    setUser(updatedUser);
    localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(updatedUser));
  };

  // Backup all data locally (JSON download)
  const handleLocalBackup = () => {
    const backupObj = {
      user,
      reports,
      invoices,
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ca_saas_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Restore backup
  const handleLocalRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.reports && parsed.user) {
          setReports(parsed.reports);
          setUser(parsed.user);
          if (parsed.invoices) setInvoices(parsed.invoices);
          if (parsed.reports.length > 0) {
            setActiveReportId(parsed.reports[0].id);
          }
          // Save
          localStorage.setItem(LOCAL_STORAGE_KEY_REPORTS, JSON.stringify(parsed.reports));
          localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(parsed.user));
          if (parsed.invoices) {
            localStorage.setItem(LOCAL_STORAGE_KEY_INVOICES, JSON.stringify(parsed.invoices));
          }
          alert("SaaS environment successfully restored from backup!");
        } else {
          alert("Invalid backup file structure.");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to parse backup file.");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // reset
  };

  // Filtered reports list
  const filteredReports = reports.filter((r) => {
    const query = searchQuery.toLowerCase();
    return (
      r.name.toLowerCase().includes(query) ||
      r.vehicleName.toLowerCase().includes(query) ||
      r.businessType.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-100 overflow-hidden">
      
      {/* Header Bar */}
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-md z-20 shrink-0 no-print">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md shadow-blue-500/20">
            <FileSpreadsheet className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-md font-extrabold tracking-wide flex items-center gap-2">
              CA Vehicle Loan SaaS Planner
              <span className="text-[9px] bg-blue-500 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-widest saas-badge">
                {user.plan}
              </span>
            </h1>
            <p className="text-[10px] text-slate-400">Chartered Accountant Professional Project Report Compiler</p>
          </div>
        </div>

        {/* Top Middle Firm Profile */}
        <div className="hidden lg:flex items-center gap-3 bg-slate-800/60 border border-slate-700/50 px-4 py-2 rounded-xl">
          <Building className="w-4 h-4 text-blue-400" />
          <div className="text-left text-xs">
            <p className="text-[10px] uppercase font-bold text-slate-400">Active CA / Advisory Firm</p>
            <p className="font-semibold text-slate-200">{user.companyName}</p>
          </div>
        </div>

        {/* User context widget */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-semibold block text-slate-200">{user.email}</span>
            <span className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
              <UserCheck className="w-3 h-3 text-emerald-400" /> Professional Advisor
            </span>
          </div>
          <button 
            onClick={() => setIsBillingOpen(true)}
            className="text-xs bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 text-slate-300 font-bold px-3 py-2 rounded-xl transition-all shadow-inner"
          >
            Manage Subscription
          </button>
        </div>
      </header>

      {/* Dynamic Window Progress Map / Nav Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 shrink-0 flex flex-col md:flex-row items-center justify-between gap-4 no-print shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Workflow Progress:</span>
          <div className="text-xs font-extrabold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
            {activeReport ? activeReport.name : "Select or Create a Project"}
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveWindow("identity")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeWindow === "identity"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold">1</span>
            <span>I. Client Profile</span>
          </button>
          
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          
          <button
            onClick={() => {
              if (activeReport) setActiveWindow("feeding");
            }}
            disabled={!activeReport}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${
              activeWindow === "feeding"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-bold">2</span>
            <span>II. Assumptions Feeding</span>
          </button>
          
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          
          <button
            onClick={() => {
              if (activeReport) setActiveWindow("display");
            }}
            disabled={!activeReport}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${
              activeWindow === "display"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold">3</span>
            <span>III. Dossier Display</span>
          </button>
        </div>
        
        {/* Quick Help context */}
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 border border-slate-200/60 px-3 py-1 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="font-semibold text-slate-600">
            {activeWindow === "identity" && "Step 1: Define promoter identity & load preset references"}
            {activeWindow === "feeding" && "Step 2: Feeding operational cost assumptions & ratios"}
            {activeWindow === "display" && "Step 3: Export, print, or review the formal report"}
          </span>
        </div>
      </div>

      {/* Main split dashboard layout */}
      <div className="flex-1 flex flex-col overflow-hidden relative p-3 bg-slate-100">
        
        {/* WINDOW 1: Project Name & Selector Directory */}
        {activeWindow === "identity" && (
          <aside className="w-full max-w-4xl mx-auto flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col shadow-sm z-10 shrink-0 no-print overflow-hidden">
            
            {/* Window Header */}
            <div className="bg-slate-900 text-slate-100 px-4 py-3 shrink-0 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-[10px] text-white">1</span>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-200">
                  Project Identity & Directory
                </span>
              </div>
              <span className="text-[9px] font-mono text-slate-400 font-semibold uppercase tracking-wider bg-slate-800 px-1.5 py-0.5 rounded">
                Window I
              </span>
            </div>

            {/* Active Project Naming Panel */}
            {activeReport ? (
              <div className="p-4 border-b border-slate-200 bg-blue-50/20 shrink-0">
                <label className="block text-[10px] uppercase font-extrabold text-blue-700 tracking-widest mb-1.5">
                  Current Project Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={activeReport.name}
                    onChange={(e) => handleReportChange({ name: e.target.value })}
                    placeholder="e.g., Viva Logistics Ltd."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                  />
                </div>
                <p className="text-[9px] text-slate-400 mt-1.5">
                  Renames the promoter client instantly on all audit files.
                </p>
              </div>
            ) : (
              <div className="p-4 border-b border-slate-200 text-center text-xs text-slate-400 bg-slate-50 italic shrink-0">
                Create or select a project to name
              </div>
            )}

            {/* SaaS metrics controller */}
            <div className="p-4 border-b border-slate-200/80 shrink-0">
              <SaaSMetrics user={user} onManageBilling={() => setIsBillingOpen(true)} />
            </div>

            {/* Project List Search */}
            <div className="p-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50 shrink-0">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search dossiers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleCreateReport}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-2 transition-all shrink-0 shadow-sm shadow-blue-500/10"
                title="Compile New Vehicle Report"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Project Items scrolling container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scroll">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                <span>Your Compiled Dossiers</span>
                <span>{filteredReports.length}</span>
              </div>

              <div className="space-y-2">
                {filteredReports.map((item) => {
                  const isActive = item.id === activeReportId;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setActiveReportId(item.id);
                      }}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col gap-1.5 group ${
                        isActive
                          ? "bg-blue-50/40 border-blue-500/80 ring-1 ring-blue-500/10"
                          : "bg-white border-slate-200 hover:bg-slate-50/50 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="font-bold text-xs text-slate-800 line-clamp-1 group-hover:text-blue-700 transition-colors">
                          {item.name || "Untitled Client"}
                        </h4>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={(e) => handleDuplicateReport(item, e)}
                            className="text-slate-400 hover:text-blue-600 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Duplicate/Clone Report"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteReport(item.id, e)}
                            className="text-slate-400 hover:text-red-600 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete Report"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 font-medium">
                        {item.vehicleName}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-2 mt-0.5">
                        <span className="font-semibold text-blue-600/80 font-mono">
                          ₹{Math.round((item.baseCost + item.bodyBuilding + item.workingCapital) / 100000).toFixed(1)}L Cost
                        </span>
                        <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] uppercase ${
                          item.status === "Approved" 
                            ? "bg-green-100 text-green-800" 
                            : item.status === "In Review" 
                              ? "bg-amber-100 text-amber-800" 
                              : "bg-slate-100 text-slate-600"
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {filteredReports.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-xs italic">
                    No dossiers found matching your search.
                  </div>
                )}
              </div>
            </div>

            {/* Backup Restores Panel footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex flex-col gap-3 shrink-0">
              {activeReport && (
                <button
                  onClick={() => setActiveWindow("feeding")}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 transition-all active:scale-[0.98]"
                >
                  <span>Continue to Data Assumptions</span>
                  <ArrowRight className="w-4 h-4 text-blue-100" />
                </button>
              )}

              <div className="flex justify-between gap-2">
                <button
                  onClick={handleLocalBackup}
                  className="flex-1 py-2 px-2 border border-slate-300 hover:bg-slate-200/40 text-slate-700 font-bold rounded-lg text-[10px] flex items-center justify-center gap-1 shadow-sm transition-all bg-white"
                  title="Backup entire SaaS profile to file"
                >
                  <Download className="w-3 h-3 text-slate-500" />
                  Download Backup
                </button>
                <label className="flex-1 py-2 px-2 border border-slate-300 hover:bg-slate-200/40 text-slate-700 font-bold rounded-lg text-[10px] flex items-center justify-center gap-1 shadow-sm cursor-pointer transition-all bg-white text-center">
                  <Upload className="w-3 h-3 text-slate-500" />
                  Restore Backup
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleLocalRestore}
                  />
                </label>
              </div>
            </div>

          </aside>
        )}

        {/* WINDOWS 2 & 3: Workspace Windows Container */}
        {activeWindow !== "identity" && (
          <main className="flex-1 flex flex-col overflow-hidden gap-3">
            
            {activeReport ? (
              <>
                {/* WINDOW 2: Data Feeding Window */}
                {activeWindow === "feeding" && (
                  <section className="w-full max-w-4xl mx-auto flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col shrink-0 overflow-hidden shadow-sm no-print">
                    {/* Window Header */}
                    <div className="bg-slate-900 text-slate-100 px-4 py-3 shrink-0 flex items-center justify-between border-b border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-[10px] text-white">2</span>
                        <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-200">
                          Data Assumptions Feeding
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-400 font-semibold uppercase tracking-wider bg-slate-800 px-1.5 py-0.5 rounded">
                        Window II
                      </span>
                    </div>

                    {/* Navigation Toolbar */}
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between shrink-0 text-xs font-bold text-slate-700">
                      <button
                        onClick={() => setActiveWindow("identity")}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 hover:bg-slate-200 text-slate-700 rounded-lg transition-all shadow-sm bg-white"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                        <span>Back to Profile</span>
                      </button>
                      <button
                        onClick={() => setActiveWindow("display")}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all shadow-sm"
                      >
                        <span>Skip to Preview</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scroll bg-white">
                      <ReportForm
                        report={activeReport}
                        onChange={handleReportChange}
                        user={user}
                        onUseAi={handleUseAiNarrative}
                        isGenerated={!!generatedReports[activeReport.id]}
                        onGenerate={() => {
                          setGeneratedReports(prev => ({ ...prev, [activeReport.id]: true }));
                          setActiveWindow("display");
                        }}
                      />
                    </div>
                  </section>
                )}

                {/* WINDOW 3: Report Generated Display Window */}
                {activeWindow === "display" && (
                  <section className="flex-1 bg-slate-100 border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm max-w-5xl mx-auto w-full">
                    {/* Window Header */}
                    <div className="bg-slate-900 text-slate-100 px-4 py-3 shrink-0 flex items-center justify-between border-b border-slate-800 no-print">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 bg-emerald-600 rounded-lg flex items-center justify-center font-bold text-[10px] text-white">3</span>
                        <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-200">
                          Dossier Generated Display
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-400 font-semibold uppercase tracking-wider bg-slate-800 px-1.5 py-0.5 rounded">
                        Window III
                      </span>
                    </div>

                    {/* Navigation Toolbar */}
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between shrink-0 text-xs font-bold text-slate-700 no-print">
                      <button
                        onClick={() => setActiveWindow("feeding")}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 hover:bg-slate-200 text-slate-700 rounded-lg transition-all bg-white shadow-sm"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                        <span>Back to Assumptions</span>
                      </button>
                      
                      <div className="flex items-center gap-3">
                        {generatedReports[activeReport.id] && (
                          <button
                            onClick={() => {
                              setPrintTriggerCount(prev => prev + 1);
                            }}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-sm cursor-pointer shadow-blue-500/10 active:scale-[0.98]"
                            title="Open professional PDF export guide and trigger browser's print dialog"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print / Export PDF</span>
                          </button>
                        )}
                        <span className="text-[11px] font-bold text-slate-400">Step 3 of 3</span>
                      </div>
                    </div>
 
                    <div className="flex-1 overflow-hidden flex flex-col bg-slate-200/40">
                      {generatedReports[activeReport.id] ? (
                        <ReportPreview report={activeReport} triggerPrintCount={printTriggerCount} />
                      ) : (
                        <div className="flex-1 overflow-y-auto p-6 md:p-10 flex items-center justify-center custom-scroll bg-slate-100">
                          <motion.div 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white max-w-lg w-full rounded-2xl border border-slate-200/80 shadow-xl p-8 md:p-10 text-center my-auto"
                          >
                            <div className="mx-auto w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 shadow-sm">
                              <FileCheck className="w-8 h-8 animate-pulse" />
                            </div>
                            
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-4">
                              <Sparkles className="w-3 h-3" />
                              Ready to Compile
                            </div>

                            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                              Vehicle Project Report Compiler
                            </h2>
                            <p className="text-xs text-slate-500 mt-2.5 max-w-md mx-auto leading-relaxed">
                              Configure your client parameters, outlays, financing details, and operating assumptions in the feeding window. Once ready, compile your formal audit dossier below.
                            </p>

                            {/* Brief parameters card overview */}
                            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 mt-6 text-left space-y-2.5">
                              <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 border-b border-slate-200 pb-1.5 flex items-center justify-between">
                                <span>Configuration Snapshot</span>
                                <span className="text-blue-600 font-mono">Draft State</span>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                  <span className="text-slate-400 block text-[10px]">Promoter / Applicant</span>
                                  <strong className="text-slate-700 font-bold truncate block">{activeReport.name || "N/A"}</strong>
                                </div>
                                <div>
                                  <span className="text-slate-400 block text-[10px]">Proposed Asset</span>
                                  <strong className="text-slate-700 font-bold truncate block">{activeReport.vehicleName || "N/A"}</strong>
                                </div>
                                <div>
                                  <span className="text-slate-400 block text-[10px]">Project Cost</span>
                                  <strong className="text-slate-700 font-bold font-mono">₹{(activeReport.baseCost + activeReport.bodyBuilding + activeReport.workingCapital).toLocaleString("en-IN")}</strong>
                                </div>
                                <div>
                                  <span className="text-slate-400 block text-[10px]">Requested Loan</span>
                                  <strong className="text-slate-700 font-bold font-mono text-blue-700">₹{activeReport.loanAmount.toLocaleString("en-IN")}</strong>
                                </div>
                              </div>
                            </div>

                            {/* Large Generate Button */}
                            <button
                              onClick={() => setGeneratedReports(prev => ({ ...prev, [activeReport.id]: true }))}
                              className="w-full mt-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/15 flex items-center justify-center gap-2 transition-all active:scale-[0.98] group cursor-pointer"
                            >
                              <Sparkles className="w-4 h-4 text-blue-100 group-hover:rotate-12 transition-transform" />
                              <span>Generate & Compile Dossier</span>
                              <ArrowRight className="w-4 h-4 text-blue-100 group-hover:translate-x-0.5 transition-transform" />
                            </button>

                            <p className="text-[10px] text-slate-400 mt-4 leading-normal italic">
                              Compilation builds high-definition vector printing structures, 5-year accounting spreadsheets, and structured narratives.
                            </p>
                          </motion.div>
                        </div>
                      )}
                    </div>
                  </section>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <FolderGit2 className="w-12 h-12 text-slate-300 animate-bounce" />
                <h3 className="font-bold text-slate-700 mt-4">No Selected Report</h3>
                <p className="text-xs text-slate-500 mt-1">Please select an existing vehicle project report or create a new one.</p>
              </div>
            )}

          </main>
        )}

      </div>

      {/* Subscription checkout modal */}
      <BillingModal
        isOpen={isBillingOpen}
        onClose={() => setIsBillingOpen(false)}
        user={user}
        onUpgrade={handleUpgradePlan}
        invoices={invoices}
      />

    </div>
  );
}
