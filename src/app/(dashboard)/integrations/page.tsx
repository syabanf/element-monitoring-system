import { prisma } from "@/lib/prisma";
import type { LucideProps } from "lucide-react";
import {
  Plug, CheckCircle, XCircle,
  MessageSquare, Bell, Building2, Tag, Wrench,
  Mail, Smartphone, BarChart2, AlertTriangle, Link,
} from "lucide-react";

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
  const configMap = new Map(configs.map(c => [c.type, c]));

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

      {/* Group by category */}
      {["Notifications", "CMMS / ERP", "Analytics", "On-call", "Developer"].map(category => {
        const items = INTEGRATION_CATALOG.filter(i => i.category === category);
        return (
          <div key={category}>
            <h2 className="text-[#0D1B35] font-bold mb-3">{category}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
              {items.map((item) => {
                const config = configMap.get(item.type);
                const isEnabled = config?.isEnabled ?? false;
                return (
                  <div key={item.type} className="bg-white border border-[#D9E2F0] rounded-xl p-4 space-y-3 hover:shadow-md hover:border-[#C6D0E8] transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {(() => { const Icon = integrationIcons[item.type] ?? Plug; return <Icon className="w-6 h-6 text-[#3D5280]" />; })()}
                        <div>
                          <p className="text-[#0D1B35] font-semibold text-sm">{item.name}</p>
                          <p className="text-[#6378A0] text-xs">{item.description}</p>
                        </div>
                      </div>
                      {isEnabled ? (
                        <CheckCircle className="w-4 h-4 text-[#166534] flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-[#D9E2F0] flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                    <div className="flex items-center justify-between border-t border-[#E4EAF5] pt-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isEnabled ? "bg-[#F0FDF4] text-[#166534]" : "bg-[#F2F5FB] text-[#6378A0]"}`}>
                        {isEnabled ? "Connected" : "Not configured"}
                      </span>
                      <button className="text-xs text-[#B8901A] hover:text-[#9A7A14] font-semibold hover:underline transition-colors">
                        {isEnabled ? "Edit" : "Configure"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
