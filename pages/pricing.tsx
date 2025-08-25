export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "/mo",
      cta: "Current plan",
      features: [
        "All core tools (Calendar overlap, AI suggestions, event creation)",
        "Up to 3 active rooms",
        "Unlimited members per room",
      ],
    },
    {
      name: "Pro",
      price: "$6",
      period: "/mo",
      highlight: true,
      cta: "Coming soon",
      features: [
        "Everything in Free, plus:",
        "Unlimited active rooms",
        "Profile-tailored ideas",
        "Venue picks near midpoint",
        "Priority support",
      ],
    },
    {
      name: "Teams",
      price: "$12",
      period: "/user/mo",
      cta: "Contact sales",
      features: [
        "Shared org rooms",
        "Admin controls & policies",
        "Advanced venue filters",
        "SLA & priority support",
        "SSO (SAML/OIDC)",
      ],
    },
  ];

  return (
    <div className="px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h1 className="text-3xl font-semibold">Pricing</h1>
          <p className="mt-2 text-white/70">
            Simple plans to help your group find the perfect time—and thing—to
            do.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur ${
                p.highlight ? "ring-1 ring-indigo-400/40" : ""
              }`}
            >
              <div className="flex items-baseline justify-between">
                <h2 className="text-xl font-medium">{p.name}</h2>
                <div className="text-2xl font-semibold">
                  {p.price}
                  <span className="text-base font-normal text-white/70">
                    {p.period}
                  </span>
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-indigo-400/80" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                disabled
                className={`mt-6 w-full rounded-md px-4 py-2 text-sm font-medium transition ${
                  p.highlight
                    ? "bg-indigo-500 text-slate-900"
                    : "bg-slate-800 text-white/70"
                }`}
                title="Display only"
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
