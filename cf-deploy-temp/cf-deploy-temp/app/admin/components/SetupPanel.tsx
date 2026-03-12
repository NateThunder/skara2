import { ANALYTICS_PLACEHOLDERS } from "@/app/lib/analytics/contracts";

type SetupExample = {
  id: string;
  title: string;
  payloads: Record<string, unknown> | null;
};

type SetupPanelProps = {
  keyEvents: string[];
  examples: SetupExample[];
};

function renderJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export function SetupPanel({ keyEvents, examples }: SetupPanelProps) {
  return (
    <section className="dash-setup" id="setup" aria-labelledby="ga4-setup-heading">
      <h2 id="ga4-setup-heading">GA4 integration setup</h2>
      <p>
        Set your client property and credentials in environment variables, and configure conversion
        events as GA4 key events.
      </p>

      <ul>
        <li>
          <strong>Property ID:</strong> <code>{ANALYTICS_PLACEHOLDERS.propertyIdEnv}</code>
        </li>
        <li>
          <strong>Credentials:</strong> <code>{ANALYTICS_PLACEHOLDERS.credentialsEnvs.join(" + ")}</code>
        </li>
        <li>
          <strong>Key events list (optional):</strong> <code>{ANALYTICS_PLACEHOLDERS.keyEventsEnv}</code>
        </li>
      </ul>

      <p className="dash-setup__small">
        Active key events: {keyEvents.length > 0 ? keyEvents.join(", ") : "Using all GA4 key events configured in the property."}
      </p>

      <div className="dash-setup__examples">
        {examples.map((example) => (
          <details key={example.id}>
            <summary>{example.title} payload example</summary>
            <pre>{renderJson(example.payloads ?? { message: "Load data to preview payload." })}</pre>
          </details>
        ))}
      </div>
    </section>
  );
}
