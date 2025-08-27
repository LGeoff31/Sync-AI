export default function PrivacyPolicy() {
  const contactEmail =
    process.env.NEXT_PUBLIC_CONTACT_EMAIL || "geoffrey31415@gmail.com";
  const updated = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
        Privacy Policy
      </h1>
      <div className="mt-2 flex items-center gap-2 text-white/70">
        <span
          aria-hidden
          className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"
        />
        <span>Last updated: {updated}</span>
      </div>

      <section className="mt-8 space-y-6 text-white/80 leading-relaxed">
        <p>
          This page describes how SyncAI ("we", "us", "our") collects, uses, and
          protects your information when you use our service.
        </p>

        <div>
          <h2 className="text-xl font-semibold text-white">
            Information we collect
          </h2>
          <ul className="mt-2 list-disc pl-6 space-y-2">
            <li>
              Account: your Google profile basics (name, email, avatar) for
              sign‑in.
            </li>
            <li>
              Calendar: events we create on your behalf (title, attendees,
              time). We do not read your event bodies; we only request the
              scopes needed to check free/busy and create events.
            </li>
            <li>
              Location: optional approximate coordinates you choose to share.
            </li>
            <li>
              Preferences: questionnaire answers (e.g., price range, distance,
              interests) to improve activity suggestions.
            </li>
            <li>Usage: basic product analytics and error logs.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">
            How we use information
          </h2>
          <ul className="mt-2 list-disc pl-6 space-y-2">
            <li>Authenticate you and keep your session active.</li>
            <li>Compute common availability and schedule group events.</li>
            <li>Suggest nearby venues and activity ideas.</li>
            <li>Maintain product functionality, security, and support.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">Google user data</h2>
          <p className="mt-2">
            Our use and transfer of information received from Google APIs
            complies with the Google API Services User Data Policy, including
            the Limited Use requirements.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">Data sharing</h2>
          <p className="mt-2">
            We do not sell personal information. We only share data with service
            providers we use to run the service (e.g., hosting, storage) and as
            required by law.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">
            Retention & deletion
          </h2>
          <p className="mt-2">
            We keep your information only as long as needed for the purposes
            above. You can request deletion of your account data at any time by
            contacting us at{" "}
            <a className="underline" href={`mailto:${contactEmail}`}>
              {contactEmail}
            </a>
            . You can also revoke our access via your Google Account Security
            settings.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">Security</h2>
          <p className="mt-2">
            We use industry‑standard safeguards to protect your data (encryption
            in transit, access controls). No method is 100% secure, and we
            encourage you to use a strong, unique password on your Google
            account.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">Children</h2>
          <p className="mt-2">
            Our service is not intended for children under 13.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">Changes</h2>
          <p className="mt-2">
            We may update this policy from time to time. We will update the
            "Last updated" date above and, when appropriate, notify you in the
            app.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">Contact</h2>
          <p className="mt-2">
            Questions? Contact us at{" "}
            <a className="underline" href={`mailto:${contactEmail}`}>
              {contactEmail}
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
