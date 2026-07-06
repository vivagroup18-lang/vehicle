import React, { useState } from "react";
import { SaaSUser, SubscriptionPlan, MockInvoice } from "../types";
import { Check, Loader2, Sparkles, Receipt, X } from "lucide-react";

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: SaaSUser;
  onUpgrade: (plan: SubscriptionPlan) => void;
  invoices: MockInvoice[];
}

export default function BillingModal({ isOpen, onClose, user, onUpgrade, invoices }: BillingModalProps) {
  const [loadingPlan, setLoadingPlan] = useState<SubscriptionPlan | null>(null);
  const [showCheckout, setShowCheckout] = useState<SubscriptionPlan | null>(null);
  const [cardNumber, setCardNumber] = useState("4111 •••• •••• 8845");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("123");

  if (!isOpen) return null;

  const plans = [
    {
      id: "starter" as SubscriptionPlan,
      name: "Starter Plan",
      price: "₹0",
      period: "forever",
      description: "Perfect for single vehicle analysis",
      features: [
        "1 Active Vehicle Report",
        "3 AI Narrative Generations",
        "Standard PDF Export",
        "Standard Web-Based Backup",
      ],
      cta: "Current Plan",
      color: "border-slate-200 bg-white",
      btnClass: "bg-slate-100 text-slate-800 cursor-not-allowed",
      disabled: true,
    },
    {
      id: "pro" as SubscriptionPlan,
      name: "Professional Pro",
      price: "₹3,999",
      period: "month",
      description: "Best for independent CAs and advisors",
      features: [
        "Up to 15 Active Vehicle Reports",
        "30 AI Narrative Generations / month",
        "Times New Roman & Lora Typography",
        "MS Word (.doc) & Excel Data Export",
        "Dynamic Moratorium Calculations",
        "Priority Email Support",
      ],
      cta: "Upgrade to Pro",
      color: "border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20 relative",
      badge: "Most Popular",
      btnClass: "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/10",
      disabled: false,
    },
    {
      id: "enterprise" as SubscriptionPlan,
      name: "Enterprise Firm",
      price: "₹14,999",
      period: "month",
      description: "For corporate consulting firms",
      features: [
        "Unlimited Active Vehicle Reports",
        "Unlimited AI Narrative Generations",
        "White-Labeled CA Report Header",
        "Collaborative Multi-User Sync",
        "Custom WDV / Depr Configuration",
        "Dedicated Account Manager",
        "API Integration Access",
      ],
      cta: "Upgrade to Enterprise",
      color: "border-purple-600 bg-purple-50/50 ring-2 ring-purple-600/20 relative",
      badge: "Maximum Value",
      btnClass: "bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-500/10",
      disabled: false,
    },
  ];

  const handleSelectPlan = (planId: SubscriptionPlan) => {
    if (planId === user.plan) return;
    setShowCheckout(planId);
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showCheckout) return;

    setLoadingPlan(showCheckout);
    setTimeout(() => {
      onUpgrade(showCheckout);
      setLoadingPlan(null);
      setShowCheckout(null);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
              SaaS Subscription Plan & Billing
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Currently logged in as <span className="font-semibold text-slate-700">{user.email}</span> • Current Plan: <span className="text-blue-600 font-semibold uppercase">{user.plan}</span>
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scroll p-8 space-y-8">
          
          {showCheckout ? (
            /* Simulated Stripe Checkout Frame */
            <div className="max-w-md mx-auto bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-6">
              <div className="text-center">
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Secure Checkout
                </span>
                <h3 className="font-bold text-slate-800 text-lg mt-2">
                  Upgrade to {showCheckout === "pro" ? "Professional Pro" : "Enterprise Firm"}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Amount due: {showCheckout === "pro" ? "₹3,999/mo" : "₹14,999/mo"} + GST (18%)
                </p>
              </div>

              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-600 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="4111 2222 3333 4444"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-600 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-center"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-600 mb-1">
                      CVV Code
                    </label>
                    <input
                      type="password"
                      required
                      maxLength={3}
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-center"
                      placeholder="123"
                    />
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 border border-slate-200 text-xs text-slate-600 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-ping flex-shrink-0" />
                  <span>Interactive simulation. No real money will be charged.</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCheckout(null)}
                    className="flex-1 border border-slate-300 bg-white text-slate-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loadingPlan !== null}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1 shadow"
                  >
                    {loadingPlan ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Complete Upgrade"
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              {/* Plan Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => {
                  const isCurrent = user.plan === plan.id;
                  return (
                    <div 
                      key={plan.id}
                      className={`rounded-2xl border p-6 flex flex-col justify-between transition-all hover:shadow-lg ${plan.color} ${isCurrent ? 'ring-2 ring-blue-500/50' : ''}`}
                    >
                      {plan.badge && (
                        <span className="absolute -top-3 right-4 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {plan.badge}
                        </span>
                      )}
                      
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                        <p className="text-xs text-slate-500 mt-1">{plan.description}</p>
                        
                        <div className="mt-4 flex items-baseline gap-1">
                          <span className="text-3xl font-extrabold text-slate-900">{plan.price}</span>
                          <span className="text-xs text-slate-500 font-medium">/{plan.period}</span>
                        </div>

                        <ul className="mt-6 space-y-3">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-8">
                        <button
                          onClick={() => handleSelectPlan(plan.id)}
                          disabled={plan.disabled || isCurrent}
                          className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                            isCurrent 
                              ? "bg-slate-100 text-slate-500 cursor-not-allowed" 
                              : plan.btnClass
                          }`}
                        >
                          {isCurrent ? "Active Plan" : plan.cta}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Invoice Listing */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-slate-600" />
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    SaaS Billing & Invoices
                  </h3>
                </div>
                {invoices.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No billing activity yet. Free plans do not generate invoices.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-semibold">
                        <th className="px-5 py-2.5">Invoice ID</th>
                        <th className="px-5 py-2.5">Billing Date</th>
                        <th className="px-5 py-2.5">Plan Activated</th>
                        <th className="px-5 py-2.5 text-right">Amount</th>
                        <th className="px-5 py-2.5 text-center">Payment Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50/50">
                          <td className="px-5 py-3 font-mono text-[11px] text-slate-500">
                            {inv.id}
                          </td>
                          <td className="px-5 py-3">{inv.date}</td>
                          <td className="px-5 py-3 font-medium text-slate-800">
                            {inv.planName}
                          </td>
                          <td className="px-5 py-3 text-right font-bold">
                            ₹{inv.amount.toLocaleString("en-IN")}
                          </td>
                          <td className="px-5 py-3 text-center">
                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-400">
          Secure bank-grade 256-bit SSL testing sandbox mode. Crafted for CA project advisors.
        </div>

      </div>
    </div>
  );
}
