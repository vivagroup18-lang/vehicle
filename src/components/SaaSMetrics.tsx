import { SaaSUser } from "../types";
import { Award, Zap, HardDrive, CheckCircle2 } from "lucide-react";

interface SaaSMetricsProps {
  user: SaaSUser;
  onManageBilling: () => void;
}

export default function SaaSMetrics({ user, onManageBilling }: SaaSMetricsProps) {
  const isStarter = user.plan === "starter";
  const isPro = user.plan === "pro";
  const isEnterprise = user.plan === "enterprise";

  // Calculate percentages
  const reportsPct = Math.min(100, (user.projectsCreated / user.projectsLimit) * 100);
  const aiPct = Math.min(100, (user.aiGenerationsUsed / user.aiGenerationsLimit) * 100);

  // Styling variations based on plan
  const planColor = isEnterprise 
    ? "from-purple-600 to-indigo-600 border-purple-500/20 text-purple-900 bg-purple-50/50" 
    : isPro 
      ? "from-blue-600 to-indigo-600 border-blue-500/20 text-blue-900 bg-blue-50/50" 
      : "from-slate-700 to-slate-800 border-slate-300 text-slate-700 bg-slate-50";

  return (
    <div className="space-y-4">
      {/* Plan Status Banner */}
      <div className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${planColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className={`w-5 h-5 ${isEnterprise ? 'text-purple-600' : isPro ? 'text-blue-600' : 'text-slate-500'}`} />
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Subscription Tier</div>
              <div className="text-xs font-bold capitalize text-slate-800">{user.plan} Account</div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Active
          </span>
        </div>

        <div className="text-[11px] text-slate-500">
          {isStarter && "Simulated FAME-II & CA basic reports. Standard exports."}
          {isPro && "Professional Word, Excel & PDF exports unlocked."}
          {isEnterprise && "Unlimited firm analysis, white-label report header."}
        </div>

        <button
          onClick={onManageBilling}
          className={`w-full py-2 px-3 rounded-lg text-xs font-bold text-center transition-all ${
            isEnterprise 
              ? "bg-purple-600 hover:bg-purple-700 text-white shadow-sm shadow-purple-500/20" 
              : isPro 
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20" 
                : "bg-slate-800 hover:bg-slate-900 text-white shadow-sm shadow-slate-500/10"
          }`}
        >
          {isStarter ? "Upgrade Workspace" : "Billing & Plan Options"}
        </button>
      </div>

      {/* Resource Metering */}
      <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl space-y-4">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Workspace Resource Metering
        </h4>

        {/* Project Reports Limit */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            <span className="flex items-center gap-1.5 text-slate-600">
              <HardDrive className="w-3.5 h-3.5 text-slate-400" />
              Active Reports
            </span>
            <span className="text-slate-700 font-bold">
              {user.projectsCreated} <span className="text-slate-400 font-normal">/ {user.projectsLimit === 9999 ? "∞" : user.projectsLimit}</span>
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div 
              style={{ width: `${reportsPct}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                reportsPct > 90 ? 'bg-red-500' : reportsPct > 60 ? 'bg-amber-500' : 'bg-blue-600'
              }`}
            />
          </div>
        </div>

        {/* AI Narrative Generations Limit */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            <span className="flex items-center gap-1.5 text-slate-600">
              <Zap className="w-3.5 h-3.5 text-slate-400" />
              AI Narrative Credits
            </span>
            <span className="text-slate-700 font-bold">
              {user.aiGenerationsUsed} <span className="text-slate-400 font-normal">/ {user.aiGenerationsLimit === 9999 ? "∞" : user.aiGenerationsLimit}</span>
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div 
              style={{ width: `${aiPct}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                aiPct > 90 ? 'bg-red-500' : aiPct > 60 ? 'bg-amber-500' : 'bg-purple-600'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
