import { prisma } from "@/lib/prisma";
import type { LucideProps } from "lucide-react";
import {
  Plug,
  MessageSquare, Bell, Building2, Tag, Wrench,
  Mail, Smartphone, BarChart2, AlertTriangle, Link,
} from "lucide-react";
import { FilterableIntegrations } from "./FilterableIntegrations";

type IconComponent = React.FC<LucideProps>;

const integrationIcons: Record<string, IconComponent> = {
  microsoft_teams: MessageSquare,
  slack:           Bell,
  sap_pm:          Building2,
  servicenow:      Tag,
  ibm_maximo:      Wrench,
  email:           Mail,
  sms:             Smartphone,
  power_bi:        BarChart2,
  pagerduty:       AlertTriangle,
  webhook:         Link,
};

const INTEGRATION_CATALOG = [
  { type: "microsoft_teams", name: "Microsoft Teams", category: "Notifications", description: "Send alert notifications to Teams channels" },
  { type: "slack", name: "Slack", category: "Notifications", description: "Send alert notifications to Slack channels" },
  { type: "email", name: "Email (SMTP)", category: "Notifications", description: "Send alert emails via SMTP" },
  { type: "sms", name: "SMS Gateway", category: "Notifications", description: "Send SMS alerts via Twilio or similar" },
  { type: "sap_pm", name: "SAP Plant Maintenance", category: "CMMS / ERP", description: "Create work orders in SAP PM" },
  { type: "servicenow", name: "ServiceNow", category: "CMMS / ERP", description: "Create tickets and incidents in ServiceNow" },
  { type: "ibm_maximo", name: "IBM Maximo", category: "CMMS / ERP", description: "Create work orders in IBM Maximo" },
  { type: "power_bi", name: "Power BI", category: "Analytics", description: "Push data to Power BI datasets" },
  { type: "pagerduty", name: "PagerDuty", category: "On-call", description: "Trigger PagerDuty incidents for critical alerts" },
  { type: "webhook", name: "Custom Webhook", category: "Developer", description: "POST alert payloads to custom endpoints" },
];

export default async function IntegrationsPage() {
  const configs = await prisma.integrationConfig.findMany();
  const configData = configs.map(c => ({ type: c.type, isEnabled: c.isEnabled }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#FEF7E6] flex items-center justify-center">
          <Plug className="w-5 h-5 text-[#B8901A]" />
        </div>
        <div>
          <h1 className="text-[#0D1B35] text-2xl font-bold">Integrations</h1>
          <p className="text-[#6378A0] text-sm mt-0.5">Connect to external systems and notification channels</p>
        </div>
      </div>

      <FilterableIntegrations
        catalog={INTEGRATION_CATALOG}
        configs={configData}
        icons={integrationIcons}
      />
    </div>
  );
}
