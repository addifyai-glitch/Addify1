"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { AdSlot } from "@/components/ui/ad-slot";
import { cn } from "@/lib/utils";
import {
  computeGratuity,
  type ContractType,
  type GratuityResult,
  type RuleKey,
  type TerminationType,
} from "@/lib/calculators/gratuity";

type Lang = "en" | "ar";

const HISTORY_KEY = "addify_gratuity_history";

interface HistoryEntry {
  id: number;
  date: string;
  monthlySalary: number;
  contractType: ContractType;
  terminationType: TerminationType;
  totalGratuity: number;
}

const RULE_TEXT: Record<Lang, Record<RuleKey, string>> = {
  en: {
    death: "Full entitlement is paid to the family regardless of service length, per Article 51.",
    "limited-resignation-zero":
      "Limited contract ended by resignation before completion. No gratuity is due unless your contract states otherwise.",
    "limited-termination": "Limited contract ended by the employer. Full entitlement applies.",
    "limited-mutual": "Limited contract ended by mutual agreement. Full entitlement applies.",
    "unlimited-resignation-under-1":
      "Under 1 year of service on an unlimited contract. No gratuity is due on resignation.",
    "unlimited-resignation-1-to-3": "1 to 3 years of service on resignation. One third of the entitlement applies.",
    "unlimited-resignation-3-to-5": "3 to 5 years of service on resignation. Two thirds of the entitlement applies.",
    "unlimited-resignation-5-plus": "5 years or more of service. Full entitlement applies even on resignation.",
    "unlimited-termination": "Unlimited contract ended by the employer. Full entitlement applies.",
    "unlimited-mutual": "Unlimited contract ended by mutual agreement. Full entitlement applies.",
    "no-service": "No completed service was recorded.",
  },
  ar: {
    death: "تُدفع المكافأة كاملة لأسرة المتوفى بغض النظر عن مدة الخدمة، وفقاً للمادة 51.",
    "limited-resignation-zero":
      "تم إنهاء العقد محدد المدة بالاستقالة قبل اكتماله. لا تستحق مكافأة ما لم ينص العقد على خلاف ذلك.",
    "limited-termination": "تم إنهاء العقد محدد المدة من قبل صاحب العمل. يستحق كامل المكافأة.",
    "limited-mutual": "تم إنهاء العقد محدد المدة باتفاق متبادل. يستحق كامل المكافأة.",
    "unlimited-resignation-under-1": "أقل من سنة خدمة بعقد غير محدد المدة. لا تستحق مكافأة عند الاستقالة.",
    "unlimited-resignation-1-to-3": "من سنة إلى 3 سنوات خدمة عند الاستقالة. يُطبق ثلث المكافأة.",
    "unlimited-resignation-3-to-5": "من 3 إلى 5 سنوات خدمة عند الاستقالة. يُطبق ثلثا المكافأة.",
    "unlimited-resignation-5-plus": "5 سنوات خدمة أو أكثر. تستحق المكافأة كاملة حتى عند الاستقالة.",
    "unlimited-termination": "تم إنهاء العقد غير محدد المدة من قبل صاحب العمل. يستحق كامل المكافأة.",
    "unlimited-mutual": "تم إنهاء العقد غير محدد المدة باتفاق متبادل. يستحق كامل المكافأة.",
    "no-service": "لا توجد مدة خدمة مسجلة.",
  },
};

const T = {
  en: {
    eyebrow: "Gratuity Calculator",
    title: "UAE End-of-Service Gratuity Calculator",
    subtitle: "Enter your salary and service details below to estimate your end-of-service gratuity under UAE labor law.",
    langToggle: "العربية",
    formHeading: "Your details",
    labelSalary: "Basic monthly salary (AED)",
    hintSalary: "Use your basic salary only, not your total salary with allowances.",
    labelContract: "Contract type",
    optUnlimited: "Unlimited contract",
    optLimited: "Limited contract",
    labelYears: "Years of service",
    hintYears: "Decimals are fine, for example 5.5.",
    labelDays: "Extra days of service",
    hintDays: "Days beyond your full years, from 0 to 364.",
    labelReason: "Reason for leaving",
    optResignation: "Resignation",
    optTermination: "Termination by employer",
    optMutual: "Mutual agreement",
    optDeath: "Death",
    btnCalculate: "Calculate gratuity",
    btnCompare: "Compare resignation vs termination",
    resultHeading: "Your result",
    resultLabel: "Total end-of-service gratuity",
    breakdownCaption: "Breakdown by period",
    colPeriod: "Period",
    colDays: "Days calculated",
    colAmount: "Amount (AED)",
    colTotal: "Total",
    firstTier: "First {years} years (21 days/year)",
    secondTier: "Remaining {years} years (30 days/year)",
    capAdjustment: "Cap adjustment (2 years basic salary maximum)",
    entitlementAdjustment: "Resignation adjustment (x {fraction})",
    disclaimer:
      "This calculator gives an estimate only, based on Federal Decree-Law No. 33 of 2021 and the 21/30 day gratuity formula widely used across the private sector. Since February 2023, most new UAE private sector contracts are fixed-term (limited) contracts, so many workers no longer hold an unlimited contract. Free zones such as DIFC and ADGM apply their own rules. Confirm your exact entitlement with the Ministry of Human Resources and Emiratisation (MOHRE) or a qualified UAE labor lawyer before relying on this figure.",
    btnShare: "Share result",
    btnPdf: "Download PDF",
    btnEmail: "Email me this result",
    btnSave: "Save to history",
    compareHeading: "Resignation vs termination",
    compareSubtitle: "Same salary and service, two different reasons for leaving.",
    historyHeading: "Saved calculations",
    btnClearHistory: "Clear history",
    faqHeading: "Frequently asked questions",
    faq: [
      {
        q: "Who is entitled to end-of-service gratuity in the UAE?",
        a: "Any private sector employee who completes at least one year of continuous service is entitled to gratuity under UAE labor law, regardless of nationality. Free zone employees are usually covered too, though some free zones such as DIFC and ADGM apply their own pension or gratuity rules.",
      },
      {
        q: "How is UAE gratuity calculated?",
        a: "Gratuity is based on your last basic salary, not your total salary. You earn 21 days of basic pay for each of your first 5 years of service, and 30 days of basic pay for each year after that. The total is capped at 2 years of basic salary.",
      },
      {
        q: "Does resigning reduce my gratuity?",
        a: "On an unlimited contract, resigning before 1 year pays no gratuity, 1 to 3 years pays one third, 3 to 5 years pays two thirds, and 5 years or more pays the full amount. On a limited contract, resigning before the contract ends can reduce your gratuity to zero unless your employer agrees otherwise.",
      },
      {
        q: "Is there a cap on gratuity in the UAE?",
        a: "Yes. Total gratuity cannot exceed 2 years of your basic salary, no matter how many years you have worked.",
      },
      {
        q: "Do part-time or freelance workers get gratuity?",
        a: "Part-time employees on a registered UAE work permit are entitled to gratuity calculated on a pro-rata basis tied to their actual working hours. Freelancers and independent contractors without an employment contract are not entitled to gratuity.",
      },
    ],
    relatedHeading: "Keep exploring",
    linkSalary: "Explore UAE Salary Guides",
    linkCoverLetter: "Build a cover letter",
    linkFit: "Check your job fit score",
    linkJobs: "Browse UAE jobs",
    linkBlog: "Read the Addify blog",
    footerText: "This tool is for guidance only and is not legal advice.",
    statusFull: "Full entitlement",
    statusPartial: "Partial entitlement",
    statusZero: "No entitlement",
    copied: "Copied to your clipboard.",
    copyFailed: "Could not copy automatically. Please copy the result manually.",
    savedToHistory: "Saved to your history.",
    noHistory: "You have not saved any calculations yet.",
    errPositive: "Enter a number greater than 0.",
    errDaysRange: "Enter a number between 0 and 364.",
    errMin0: "Enter a number of 0 or more.",
    compareLabelResignation: "Resignation",
    compareLabelTermination: "Termination by employer",
  },
  ar: {
    eyebrow: "حاسبة المكافأة",
    title: "حاسبة مكافأة نهاية الخدمة في الإمارات",
    subtitle: "أدخل بيانات راتبك وخدمتك أدناه لتقدير مكافأة نهاية الخدمة وفق قانون العمل الإماراتي.",
    langToggle: "English",
    formHeading: "بياناتك",
    labelSalary: "الراتب الأساسي الشهري (درهم)",
    hintSalary: "استخدم الراتب الأساسي فقط، وليس إجمالي الراتب مع البدلات.",
    labelContract: "نوع العقد",
    optUnlimited: "عقد غير محدد المدة",
    optLimited: "عقد محدد المدة",
    labelYears: "سنوات الخدمة",
    hintYears: "يمكن استخدام كسور عشرية، مثل 5.5.",
    labelDays: "أيام إضافية من الخدمة",
    hintDays: "الأيام الزائدة عن السنوات الكاملة، من 0 إلى 364.",
    labelReason: "سبب ترك العمل",
    optResignation: "استقالة",
    optTermination: "إنهاء الخدمة من قبل صاحب العمل",
    optMutual: "اتفاق متبادل",
    optDeath: "وفاة",
    btnCalculate: "احسب المكافأة",
    btnCompare: "قارن بين الاستقالة وإنهاء الخدمة",
    resultHeading: "النتيجة",
    resultLabel: "إجمالي مكافأة نهاية الخدمة",
    breakdownCaption: "التفصيل حسب الفترة",
    colPeriod: "الفترة",
    colDays: "الأيام المحسوبة",
    colAmount: "المبلغ (درهم)",
    colTotal: "الإجمالي",
    firstTier: "أول {years} سنة (21 يوماً/سنة)",
    secondTier: "الباقي {years} سنة (30 يوماً/سنة)",
    capAdjustment: "تعديل الحد الأقصى (سنتان من الراتب الأساسي)",
    entitlementAdjustment: "تعديل الاستقالة (× {fraction})",
    disclaimer:
      "توفر هذه الحاسبة تقديراً فقط، استناداً إلى المرسوم بقانون اتحادي رقم 33 لسنة 2021 وصيغة 21/30 يوماً المعتمدة على نطاق واسع في القطاع الخاص. منذ فبراير 2023، أصبحت معظم العقود الجديدة في القطاع الخاص محددة المدة، لذلك لم يعد كثير من الموظفين يحملون عقداً غير محدد المدة. تطبق بعض المناطق الحرة مثل مركز دبي المالي العالمي وسوق أبوظبي العالمي قواعدها الخاصة. تأكد من استحقاقك الدقيق لدى وزارة الموارد البشرية والتوطين أو محامٍ متخصص في قانون العمل الإماراتي قبل الاعتماد على هذا الرقم.",
    btnShare: "مشاركة النتيجة",
    btnPdf: "تحميل PDF",
    btnEmail: "أرسل لي هذه النتيجة",
    btnSave: "حفظ في السجل",
    compareHeading: "الاستقالة مقابل إنهاء الخدمة",
    compareSubtitle: "نفس الراتب ونفس مدة الخدمة، بسببين مختلفين لترك العمل.",
    historyHeading: "الحسابات المحفوظة",
    btnClearHistory: "مسح السجل",
    faqHeading: "الأسئلة الشائعة",
    faq: [
      {
        q: "من يستحق مكافأة نهاية الخدمة في الإمارات؟",
        a: "يستحق أي موظف في القطاع الخاص أكمل سنة واحدة على الأقل من الخدمة المتواصلة مكافأة نهاية الخدمة وفق قانون العمل الإماراتي، بغض النظر عن جنسيته. يشمل ذلك عادة موظفي المناطق الحرة، مع أن بعض المناطق الحرة مثل مركز دبي المالي العالمي وسوق أبوظبي العالمي تطبق أنظمة تقاعد أو مكافآت خاصة بها.",
      },
      {
        q: "كيف تُحسب مكافأة نهاية الخدمة في الإمارات؟",
        a: "تُحسب المكافأة على أساس آخر راتب أساسي، وليس إجمالي الراتب. تكسب 21 يوماً من الراتب الأساسي عن كل سنة من أول 5 سنوات خدمة، و30 يوماً عن كل سنة بعد ذلك. الحد الأقصى للمكافأة هو راتب أساسي لمدة سنتين.",
      },
      {
        q: "هل تقلل الاستقالة من مكافأتي؟",
        a: "في العقد غير محدد المدة، الاستقالة قبل سنة واحدة لا تستحق أي مكافأة، ومن سنة إلى 3 سنوات تستحق الثلث، ومن 3 إلى 5 سنوات تستحق الثلثين، و5 سنوات فأكثر تستحق المكافأة كاملة. في العقد محدد المدة، الاستقالة قبل نهاية العقد قد تُسقط المكافأة تماماً ما لم يوافق صاحب العمل على خلاف ذلك.",
      },
      {
        q: "هل يوجد حد أقصى لمكافأة نهاية الخدمة في الإمارات؟",
        a: "نعم. لا يمكن أن يتجاوز إجمالي المكافأة راتب أساسي لمدة سنتين، مهما بلغت سنوات الخدمة.",
      },
      {
        q: "هل يستحق العاملون بدوام جزئي أو المستقلون مكافأة؟",
        a: "يستحق الموظفون بدوام جزئي الحاصلون على تصريح عمل إماراتي مسجل مكافأة تُحسب بالتناسب مع ساعات عملهم الفعلية. أما المستقلون والمتعاقدون دون عقد عمل رسمي فلا يستحقون مكافأة.",
      },
    ],
    relatedHeading: "تابع الاستكشاف",
    linkSalary: "استكشف أدلة الرواتب في الإمارات",
    linkCoverLetter: "أنشئ خطاب تقديم",
    linkFit: "تحقق من درجة ملاءمة وظيفتك",
    linkJobs: "تصفح وظائف الإمارات",
    linkBlog: "اقرأ مدونة Addify",
    footerText: "هذه الأداة للإرشاد فقط وليست استشارة قانونية.",
    statusFull: "استحقاق كامل",
    statusPartial: "استحقاق جزئي",
    statusZero: "لا يوجد استحقاق",
    copied: "تم النسخ إلى الحافظة.",
    copyFailed: "تعذر النسخ تلقائياً. يرجى نسخ النتيجة يدوياً.",
    savedToHistory: "تم الحفظ في سجلك.",
    noHistory: "لم تقم بحفظ أي حسابات بعد.",
    errPositive: "أدخل رقماً أكبر من 0.",
    errDaysRange: "أدخل رقماً بين 0 و364.",
    errMin0: "أدخل رقماً 0 أو أكبر.",
    compareLabelResignation: "استقالة",
    compareLabelTermination: "إنهاء الخدمة من قبل صاحب العمل",
  },
} as const;

function formatAED(n: number, lang: Lang): string {
  const locale = lang === "ar" ? "ar-AE" : "en-AE";
  return "AED " + n.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";
const labelClass = "block text-xs font-semibold uppercase tracking-wide text-foreground/75 mb-1.5";

export default function GratuityCalculatorPage() {
  const [lang, setLang] = useState<Lang>("en");
  const [salary, setSalary] = useState("");
  const [years, setYears] = useState("0");
  const [days, setDays] = useState("0");
  const [contractType, setContractType] = useState<ContractType>("unlimited");
  const [terminationType, setTerminationType] = useState<TerminationType>("resignation");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<GratuityResult | null>(null);
  const [compareResults, setCompareResults] = useState<{ resignation: GratuityResult; termination: GratuityResult } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [shareStatus, setShareStatus] = useState("");

  const dir = lang === "ar" ? "rtl" : "ltr";
  const t = T[lang];

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("ar")) {
      setLang("ar");
    }
    try {
      const stored = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      if (Array.isArray(stored)) setHistory(stored);
    } catch {
      // ignore corrupt history
    }
  }, []);

  function parseInputs() {
    return {
      monthlySalary: parseFloat(salary),
      yearsOfService: parseFloat(years),
      extraDays: parseFloat(days),
      contractType,
      terminationType,
    };
  }

  function validate(input: ReturnType<typeof parseInputs>): boolean {
    const next: Record<string, string> = {};
    if (isNaN(input.monthlySalary) || input.monthlySalary <= 0) next.salary = t.errPositive;
    if (isNaN(input.yearsOfService) || input.yearsOfService < 0) next.years = t.errMin0;
    if (isNaN(input.extraDays) || input.extraDays < 0 || input.extraDays > 364) next.days = t.errDaysRange;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const input = parseInputs();
    if (!validate(input)) return;
    setResult(computeGratuity(input));
    setShareStatus("");
  }

  function handleCompare() {
    const input = parseInputs();
    if (!validate(input)) return;
    setCompareResults({
      resignation: computeGratuity({ ...input, terminationType: "resignation" }),
      termination: computeGratuity({ ...input, terminationType: "termination" }),
    });
  }

  function buildSummaryText(r: GratuityResult): string {
    return [
      "UAE End-of-Service Gratuity Estimate",
      `Basic monthly salary: ${formatAED(parseFloat(salary) || 0, lang)}`,
      `Contract type: ${contractType === "limited" ? "Limited" : "Unlimited"}`,
      `Years of service: ${years} years, ${days} days`,
      `Reason for leaving: ${terminationType}`,
      `Total gratuity: ${formatAED(r.totalGratuity, lang)}`,
      `Applied rule: ${RULE_TEXT[lang][r.ruleKey]}`,
      "Estimated with Addify.ae, https://addify.ae/tools/gratuity-calculator",
    ].join("\n");
  }

  async function handleShare() {
    if (!result) return;
    const text = buildSummaryText(result);
    try {
      await navigator.clipboard.writeText(text);
      setShareStatus(t.copied);
    } catch {
      setShareStatus(t.copyFailed);
    }
  }

  function handleEmail() {
    if (!result) return;
    const subject = "My UAE End-of-Service Gratuity Estimate";
    const body = buildSummaryText(result);
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function handleSaveHistory() {
    if (!result) return;
    const entry: HistoryEntry = {
      id: Date.now(),
      date: new Date().toLocaleDateString(lang === "ar" ? "ar-AE" : "en-AE"),
      monthlySalary: parseFloat(salary) || 0,
      contractType,
      terminationType,
      totalGratuity: result.totalGratuity,
    };
    const next = [...history, entry].slice(-10);
    setHistory(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    setShareStatus(t.savedToHistory);
  }

  function handleRemoveHistory(id: number) {
    const next = history.filter((e) => e.id !== id);
    setHistory(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  }

  function handleClearHistory() {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  }

  const statusStyles: Record<GratuityResult["entitlement"], { box: string; amount: string; badge: string }> = {
    full: {
      box: "bg-success/10 border-success",
      amount: "text-success",
      badge: "bg-success text-white",
    },
    partial: {
      box: "bg-accent/10 border-accent",
      amount: "text-accent",
      badge: "bg-accent text-accent-foreground",
    },
    zero: {
      box: "bg-destructive/10 border-destructive",
      amount: "text-destructive",
      badge: "bg-destructive text-white",
    },
  };

  function statusLabel(status: GratuityResult["entitlement"]): string {
    if (status === "full") return t.statusFull;
    if (status === "partial") return t.statusPartial;
    return t.statusZero;
  }

  function rowLabel(row: GratuityResult["breakdown"][number]): string {
    if (row.key === "first-tier") return t.firstTier.replace("{years}", row.years!.toFixed(2));
    if (row.key === "second-tier") return t.secondTier.replace("{years}", row.years!.toFixed(2));
    if (row.key === "cap-adjustment") return t.capAdjustment;
    return t.entitlementAdjustment.replace("{fraction}", row.fraction === 1 / 3 ? "1/3" : "2/3");
  }

  function ResultCard({ r, heading }: { r: GratuityResult; heading?: string }) {
    const style = statusStyles[r.entitlement];
    return (
      <div className={cn("rounded-2xl border-2 p-6 text-center", style.box)}>
        {heading && <div className="text-sm text-muted-foreground mb-1">{heading}</div>}
        <div className="text-sm text-muted-foreground mb-1">{t.resultLabel}</div>
        <div className={cn("font-display text-4xl md:text-5xl my-1", style.amount)}>
          {formatAED(r.totalGratuity, lang)}
        </div>
        <span className={cn("inline-block text-xs font-bold px-3 py-1 rounded-full mt-1", style.badge)}>
          {statusLabel(r.entitlement)}
        </span>
        <p className="text-sm text-foreground mt-3">{RULE_TEXT[lang][r.ruleKey]}</p>
      </div>
    );
  }

  return (
    <div dir={dir} lang={lang} className="flex flex-col min-h-screen print:bg-white">
      <div className="print:hidden">
        <Header />
      </div>
      <main className="flex-1 py-10 md:py-14">
        <Container className="max-w-3xl">
          <div className="flex items-start justify-between gap-4 mb-2 print:hidden">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">{t.eyebrow}</p>
              <h1 className="font-display text-3xl md:text-4xl text-foreground">{t.title}</h1>
            </div>
            <button
              type="button"
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="shrink-0 border border-border rounded-full px-4 py-2 text-xs font-semibold text-foreground hover:border-accent transition-colors"
            >
              {t.langToggle}
            </button>
          </div>
          <p className="text-sm text-muted-foreground mb-8 print:hidden">{t.subtitle}</p>

          <AdSlot format="in-article" className="mb-8 print:hidden" />

          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-soft mb-6 print:hidden">
            <h2 className="font-display text-xl text-foreground mb-5">{t.formHeading}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>{t.labelSalary}</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  className={inputClass}
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">{t.hintSalary}</p>
                {errors.salary && <p className="text-xs text-destructive mt-1">{errors.salary}</p>}
              </div>

              <div>
                <label className={labelClass}>{t.labelContract}</label>
                <select
                  className={inputClass}
                  value={contractType}
                  onChange={(e) => setContractType(e.target.value as ContractType)}
                >
                  <option value="unlimited">{t.optUnlimited}</option>
                  <option value="limited">{t.optLimited}</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>{t.labelYears}</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className={inputClass}
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">{t.hintYears}</p>
                {errors.years && <p className="text-xs text-destructive mt-1">{errors.years}</p>}
              </div>

              <div>
                <label className={labelClass}>{t.labelDays}</label>
                <input
                  type="number"
                  min="0"
                  max="364"
                  step="1"
                  className={inputClass}
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">{t.hintDays}</p>
                {errors.days && <p className="text-xs text-destructive mt-1">{errors.days}</p>}
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>{t.labelReason}</label>
                <select
                  className={inputClass}
                  value={terminationType}
                  onChange={(e) => setTerminationType(e.target.value as TerminationType)}
                >
                  <option value="resignation">{t.optResignation}</option>
                  <option value="termination">{t.optTermination}</option>
                  <option value="mutual">{t.optMutual}</option>
                  <option value="death">{t.optDeath}</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              <button
                type="submit"
                className="rounded-full px-6 py-3 text-sm font-semibold bg-accent text-accent-foreground shadow-soft hover:shadow-glow-accent hover:-translate-y-0.5 transition-all duration-200"
              >
                {t.btnCalculate}
              </button>
              <button
                type="button"
                onClick={handleCompare}
                className="rounded-full px-6 py-3 text-sm font-semibold border border-primary text-primary hover:bg-primary/5 transition-colors"
              >
                {t.btnCompare}
              </button>
            </div>
          </form>

          {result && (
            <section className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-soft mb-6">
              <h2 className="font-display text-xl text-foreground mb-5 print:hidden">{t.resultHeading}</h2>
              <ResultCard r={result} />

              <div className="overflow-x-auto mt-5">
                <table className="w-full text-sm border-collapse">
                  <caption className="text-left font-semibold mb-2 text-foreground">{t.breakdownCaption}</caption>
                  <thead>
                    <tr>
                      <th className="border border-border bg-muted p-2.5 text-left">{t.colPeriod}</th>
                      <th className="border border-border bg-muted p-2.5 text-left">{t.colDays}</th>
                      <th className="border border-border bg-muted p-2.5 text-left">{t.colAmount}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.breakdown.map((row, i) => (
                      <tr key={i}>
                        <td className="border border-border p-2.5">{rowLabel(row)}</td>
                        <td className="border border-border p-2.5">{row.days === null ? "N/A" : row.days}</td>
                        <td className="border border-border p-2.5">{formatAED(row.amount, lang)}</td>
                      </tr>
                    ))}
                    <tr>
                      <td className="border border-border p-2.5 font-bold bg-muted">{t.colTotal}</td>
                      <td className="border border-border p-2.5 font-bold bg-muted">{result.totalDaysAccrued || "N/A"}</td>
                      <td className="border border-border p-2.5 font-bold bg-muted">{formatAED(result.totalGratuity, lang)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="text-xs text-muted-foreground bg-muted border border-border rounded-xl p-3.5 mt-4 print:hidden">
                {t.disclaimer}
              </div>

              <div className="flex flex-wrap gap-2.5 mt-4 print:hidden">
                <button type="button" onClick={handleShare} className="rounded-full px-4 py-2 text-xs font-semibold border border-primary text-primary hover:bg-primary/5 transition-colors">
                  {t.btnShare}
                </button>
                <button type="button" onClick={() => window.print()} className="rounded-full px-4 py-2 text-xs font-semibold border border-primary text-primary hover:bg-primary/5 transition-colors">
                  {t.btnPdf}
                </button>
                <button type="button" onClick={handleEmail} className="rounded-full px-4 py-2 text-xs font-semibold border border-primary text-primary hover:bg-primary/5 transition-colors">
                  {t.btnEmail}
                </button>
                <button type="button" onClick={handleSaveHistory} className="rounded-full px-4 py-2 text-xs font-semibold border border-primary text-primary hover:bg-primary/5 transition-colors">
                  {t.btnSave}
                </button>
              </div>
              {shareStatus && <p className="text-xs text-success mt-2 print:hidden">{shareStatus}</p>}
            </section>
          )}

          {compareResults && (
            <section className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-soft mb-6 print:hidden">
              <h2 className="font-display text-xl text-foreground mb-1">{t.compareHeading}</h2>
              <p className="text-sm text-muted-foreground mb-5">{t.compareSubtitle}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ResultCard r={compareResults.resignation} heading={t.compareLabelResignation} />
                <ResultCard r={compareResults.termination} heading={t.compareLabelTermination} />
              </div>
            </section>
          )}

          {history.length > 0 && (
            <section className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-soft mb-6 print:hidden">
              <h2 className="font-display text-xl text-foreground mb-4">{t.historyHeading}</h2>
              <div className="flex flex-col">
                {history.slice().reverse().map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between gap-3 py-2.5 border-b border-border last:border-b-0 text-sm">
                    <div>
                      <strong className="text-foreground">{formatAED(entry.totalGratuity, lang)}</strong>
                      <br />
                      <span className="text-xs text-muted-foreground">
                        {entry.date} &middot; {entry.contractType} &middot; {entry.terminationType}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveHistory(entry.id)}
                      aria-label="Remove this entry"
                      className="text-xs text-destructive underline"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleClearHistory}
                className="rounded-full px-4 py-2 text-xs font-semibold border border-primary text-primary hover:bg-primary/5 transition-colors mt-4"
              >
                {t.btnClearHistory}
              </button>
            </section>
          )}

          <section className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-soft mb-6 print:hidden">
            <h2 className="font-display text-xl text-foreground mb-4">{t.faqHeading}</h2>
            {t.faq.map((item, i) => (
              <details key={i} className="border-b border-border last:border-b-0 py-3 group">
                <summary className="cursor-pointer font-semibold text-sm text-foreground list-none flex gap-2">
                  <span className="text-accent font-bold group-open:hidden">+</span>
                  <span className="text-accent font-bold hidden group-open:inline">-</span>
                  {item.q}
                </summary>
                <p className="text-sm text-muted-foreground mt-2 ms-5">{item.a}</p>
              </details>
            ))}
          </section>

          <section className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-soft print:hidden">
            <h2 className="font-display text-xl text-foreground mb-4">{t.relatedHeading}</h2>
            <div className="flex flex-wrap gap-3">
              <a href="/salary" className="text-sm bg-muted border border-border rounded-lg px-3 py-2 hover:border-accent hover:text-accent transition-colors">{t.linkSalary} &rarr;</a>
              <a href="/cover-letter" className="text-sm bg-muted border border-border rounded-lg px-3 py-2 hover:border-accent hover:text-accent transition-colors">{t.linkCoverLetter}</a>
              <a href="/fit" className="text-sm bg-muted border border-border rounded-lg px-3 py-2 hover:border-accent hover:text-accent transition-colors">{t.linkFit}</a>
              <a href="/jobs" className="text-sm bg-muted border border-border rounded-lg px-3 py-2 hover:border-accent hover:text-accent transition-colors">{t.linkJobs}</a>
              <a href="/blog" className="text-sm bg-muted border border-border rounded-lg px-3 py-2 hover:border-accent hover:text-accent transition-colors">{t.linkBlog}</a>
            </div>
          </section>

          <p className="text-center text-xs text-muted-foreground mt-8 print:hidden">{t.footerText}</p>
        </Container>
      </main>
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
