export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "/mo",
      cta: "Get Started",
      description: "Perfect for personal use and small groups",
      features: [
        "Unlimited rooms and members",
        "Calendar overlap detection",
        "AI-powered activity suggestions",
        "Location sharing and mapping",
        "Event scheduling and coordination",
        "Google Calendar integration",
        "Mobile-responsive interface",
      ],
    },
    {
      name: "Professional",
      price: "$9",
      period: "/mo",
      highlight: true,
      cta: "Coming Soon",
      description: "Advanced features for power users and teams",
      features: [
        "Everything in Free, plus:",
        "Unlimited room history and analytics",
        "Advanced venue recommendations",
        "Custom branding and themes",
        "Priority AI suggestions",
        "Advanced calendar integrations",
        "Team admin controls",
        "Priority support and SLA",
        "Export data and reports",
      ],
    },
  ];

  return (
    <div className="px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h1 className="text-3xl font-semibold">Pricing</h1>
          <p className="mt-2 text-white/70">
            Simple plans to help your group find the perfect time and thing to
            do.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2 max-w-4xl mx-auto">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-xl border border-white/10 bg-white/5 p-8 shadow-lg backdrop-blur ${
                p.highlight ? "ring-2 ring-indigo-400/50 scale-105" : ""
              }`}
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white">{p.name}</h2>
                <p className="mt-2 text-sm text-white/60">{p.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">
                    {p.price}
                  </span>
                  <span className="text-lg font-medium text-white/70">
                    {p.period}
                  </span>
                </div>
              </div>

              <ul className="mt-8 space-y-3 text-sm text-white/90">
                {p.features.map((f, index) => (
                  <li key={f} className="flex items-start gap-3">
                    <svg
                      className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                        index === 0 &&
                        p.features[0].includes("Everything in Free")
                          ? "text-indigo-400"
                          : "text-emerald-400"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span
                      className={
                        index === 0 &&
                        p.features[0].includes("Everything in Free")
                          ? "font-medium text-indigo-400"
                          : ""
                      }
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                disabled={p.cta === "Coming Soon"}
                className={`mt-8 w-full rounded-lg px-6 py-3 text-sm font-medium transition-all duration-200 ${
                  p.highlight
                    ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:from-indigo-500 hover:to-indigo-400 hover:scale-[1.02] shadow-lg hover:shadow-indigo-500/25"
                    : "bg-white/10 text-white hover:bg-white/20 border border-white/20 hover:border-white/30"
                } ${
                  p.cta === "Coming Soon"
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer"
                }`}
                title={p.cta === "Coming Soon" ? "Coming Soon" : ""}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
