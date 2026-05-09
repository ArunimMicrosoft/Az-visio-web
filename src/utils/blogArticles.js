// Azure architecture blog articles — content-rich long-form guides
// Static content. Add new articles to `blogArticles` and their content to `articleContent`.

// Per-category color palette used across cards and article accents
export const categoryColors = {
  'Best Practices': { bg: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', solid: '#6366f1', tint: '#eef2ff' },
  'Networking':     { bg: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)', solid: '#0891b2', tint: '#ecfeff' },
  'DevOps':         { bg: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', solid: '#ef4444', tint: '#fef2f2' },
  'Compute':        { bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', solid: '#059669', tint: '#ecfdf5' },
  'Cost':           { bg: 'linear-gradient(135deg, #f59e0b 0%, #eab308 100%)', solid: '#d97706', tint: '#fffbeb' },
  'Security':       { bg: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', solid: '#be185d', tint: '#fdf2f8' },
  'Data':           { bg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', solid: '#1d4ed8', tint: '#eff6ff' },
  'Identity':       { bg: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)', solid: '#4f46e5', tint: '#eef2ff' },
  'Observability':  { bg: 'linear-gradient(135deg, #14b8a6 0%, #0ea5e9 100%)', solid: '#0ea5e9', tint: '#ecfeff' },
  'Migration':      { bg: 'linear-gradient(135deg, #f97316 0%, #db2777 100%)', solid: '#db2777', tint: '#fdf2f8' },
};

export const blogArticles = [
  {
    slug: 'well-architected-framework-5-pillars',
    title: 'Azure Well-Architected Framework: The 5 Pillars Explained',
    excerpt: 'A deep, practical walkthrough of each WAF pillar with real Azure services, anti-patterns, and checklists you can use today.',
    category: 'Best Practices',
    readTime: '15 min',
    date: '2026-04-01',
    icon: '🏛️',
    author: "Arunim's IT Café",
  },
  {
    slug: 'hub-spoke-network-topology',
    title: 'Hub-Spoke Network Topology: The Enterprise Standard',
    excerpt: 'Why hub-spoke dominates enterprise Azure networks, a complete reference design with CIDR ranges, UDRs, DNS, and Azure Firewall rules.',
    category: 'Networking',
    readTime: '18 min',
    date: '2026-03-28',
    icon: '🔗',
    author: "Arunim's IT Café",
  },
  {
    slug: 'terraform-vs-bicep-vs-arm',
    title: 'Terraform vs Bicep vs ARM: Which IaC Should You Choose?',
    excerpt: 'An honest, hands-on comparison with real code samples, state management, module ecosystems, and a decision framework.',
    category: 'DevOps',
    readTime: '14 min',
    date: '2026-03-25',
    icon: '🔧',
    author: "Arunim's IT Café",
  },
  {
    slug: 'aks-vs-app-service-vs-functions',
    title: 'AKS vs App Service vs Functions: Choosing Your Compute',
    excerpt: 'A decision framework for picking between Azure Kubernetes Service, App Service, and Azure Functions with cost, scale, and ops trade-offs.',
    category: 'Compute',
    readTime: '16 min',
    date: '2026-03-20',
    icon: '⚡',
    author: "Arunim's IT Café",
  },
  {
    slug: 'cost-optimization-strategies',
    title: '15 Azure Cost Optimization Strategies That Actually Work',
    excerpt: 'Proven tactics to cut Azure bills by 30-60% with Reserved Instances, right-sizing, Spot VMs, storage tiering, and real dollar numbers.',
    category: 'Cost',
    readTime: '18 min',
    date: '2026-03-15',
    icon: '💰',
    author: "Arunim's IT Café",
  },
  {
    slug: 'private-endpoints-vs-service-endpoints',
    title: 'Private Endpoints vs Service Endpoints: Which to Use?',
    excerpt: 'A deep dive into the two private connectivity options with DNS walkthroughs, pricing, quotas, and the industry trend.',
    category: 'Security',
    readTime: '12 min',
    date: '2026-03-10',
    icon: '🔐',
    author: "Arunim's IT Café",
  },
  {
    slug: 'zero-trust-architecture-azure',
    title: 'Zero Trust Architecture on Azure: A Practical Blueprint',
    excerpt: 'Designing never-trust-always-verify systems with Azure AD Conditional Access, Private Endpoints, Defender for Cloud, and microsegmentation.',
    category: 'Security',
    readTime: '17 min',
    date: '2026-04-05',
    icon: '🛡️',
    author: "Arunim's IT Café",
  },
  {
    slug: 'azure-landing-zones',
    title: 'Azure Landing Zones: The Foundation for Enterprise Scale',
    excerpt: 'What landing zones are, why you need them, how to adopt CAF, management group hierarchy, and policy-driven guardrails.',
    category: 'Best Practices',
    readTime: '16 min',
    date: '2026-04-08',
    icon: '🧱',
    author: "Arunim's IT Café",
  },
  {
    slug: 'sql-vs-cosmos-vs-postgres',
    title: 'Azure SQL vs Cosmos DB vs PostgreSQL: Choosing Your Database',
    excerpt: 'Workload fit, consistency models, pricing, scale patterns, and when each database wins with concrete scenarios.',
    category: 'Data',
    readTime: '15 min',
    date: '2026-04-12',
    icon: '🗄️',
    author: "Arunim's IT Café",
  },
  {
    slug: 'entra-id-conditional-access',
    title: 'Entra ID (Azure AD) Conditional Access: The Missing Manual',
    excerpt: 'How Conditional Access works, policy design patterns, break-glass accounts, and the exact policies every tenant should have on day one.',
    category: 'Identity',
    readTime: '14 min',
    date: '2026-04-15',
    icon: '🔑',
    author: "Arunim's IT Café",
  },
  {
    slug: 'observability-azure-monitor',
    title: 'Azure Observability: Monitor, Log Analytics, App Insights Explained',
    excerpt: 'Metrics vs logs vs traces, workbooks, KQL fundamentals, alert rules, and an end-to-end observability reference.',
    category: 'Observability',
    readTime: '16 min',
    date: '2026-04-18',
    icon: '📊',
    author: "Arunim's IT Café",
  },
  {
    slug: 'onprem-to-azure-migration',
    title: 'On-Prem to Azure Migration: 6 Rs, Tools, and a 90-Day Playbook',
    excerpt: 'Rehost, Refactor, Rearchitect, Rebuild, Replace, Retain — with Azure Migrate, Database Migration Service, and a realistic timeline.',
    category: 'Migration',
    readTime: '17 min',
    date: '2026-04-22',
    icon: '🚚',
    author: "Arunim's IT Café",
  },
];

export const articleContent = {};

// ============================================================
// ARTICLE: well-architected-framework-5-pillars
// ============================================================
articleContent['well-architected-framework-5-pillars'] = `# Azure Well-Architected Framework: The 5 Pillars Explained

The Azure Well-Architected Framework (WAF) is Microsoft's opinionated set of tenets for building high-quality workloads on Azure. It is not theory — it is the same lens Microsoft CSAs and Premier Field Engineers use when they review customer workloads before a production go-live.

This guide walks every pillar in depth, with the Azure services that support it, the anti-patterns that violate it, and a checklist you can steal for your next architecture review.

## Why the WAF Exists

Cloud teams default to shipping features and discover non-functional requirements only when something breaks: an outage, an audit finding, a surprise bill, a performance regression after a marketing push. The WAF front-loads these conversations so you make deliberate trade-offs instead of accidental ones.

There is no universally "correct" architecture. A fintech platform optimizes Security and Reliability first. A startup optimizes Cost and Operational Excellence. The pillars give you a shared language for discussing trade-offs.

## 1. Reliability

**Definition:** The ability of a system to recover from failures and continue to function.

Reliability is not uptime on a dashboard. It is how your system behaves when a region goes dark, when a dependency returns 500s, or when a user retries a payment three times in five seconds. Assume every component can fail at any time and design accordingly.

### Core Azure services for Reliability

- **Availability Zones** — physically separated datacenters within a region. Deploy across at least two AZs for any workload that matters.
- **Azure Front Door / Traffic Manager** — global load balancing and failover
- **Azure Site Recovery** — cross-region disaster recovery for VMs
- **Azure Backup** — managed backup for VMs, SQL, files, blobs
- **Zone-Redundant Storage (ZRS) / Geo-Redundant Storage (GRS)** — pick one based on RTO/RPO
- **Chaos Studio** — inject failures in a controlled way to validate resilience

### Patterns that work

- **Retry with exponential backoff and jitter.** Do not hammer a struggling dependency — back off. Libraries like Polly (.NET) or tenacity (Python) make this trivial.
- **Circuit breaker.** After N consecutive failures, stop calling the dependency for a cooldown window. Lets it recover instead of piling on load.
- **Bulkheads.** Isolate failure domains. Don't let a slow third-party API exhaust your thread pool and take down unrelated endpoints.
- **Queue-based load leveling.** Put a queue (Service Bus, Storage Queue) between a spiky producer and a slow consumer so bursts do not cause cascading timeouts.
- **Health endpoints and deep health checks.** \`/health/live\` returns fast. \`/health/ready\` checks downstreams. Load balancers use the right one.

### Anti-patterns

- Single-AZ production workloads. You are one rack-scale event away from an incident.
- No tested DR runbook. "We have backups" is not a recovery plan. If you have never restored, you do not have backups.
- Synchronous calls across services with no timeouts. One slow service becomes every service slow.
- Treating "region failure" as unthinkable. Entire Azure regions have had multi-hour outages.

### Reliability checklist

- Multi-AZ deployment for all Tier-1 workloads
- Documented and tested RTO/RPO per workload
- Automated backups with offsite copies
- Health probes and graceful shutdown in every service
- Retry policies with backoff and idempotency
- DR drill executed in the last 6 months

## 2. Security

**Definition:** Protect applications and data from threats.

Security is a layered discipline. No single control stops a determined attacker — you need defense in depth across identity, network, data, application, and operations.

### Core Azure services for Security

- **Microsoft Entra ID (Azure AD)** — identity and access
- **Conditional Access** — context-aware access policies (device, location, risk)
- **Azure Key Vault** — secrets, keys, certificates
- **Microsoft Defender for Cloud** — CSPM + CWP (posture + runtime protection)
- **Azure Firewall / WAF on Front Door** — network-layer protection
- **Private Endpoints** — keep PaaS traffic off the public internet
- **Microsoft Sentinel** — cloud-native SIEM

### Patterns that work

- **Managed identities everywhere.** Services authenticate to other services with Entra ID — no secrets in config. This alone eliminates 80% of credential-leak incidents.
- **Principle of least privilege.** RBAC at the scope where the identity actually needs access. \`Contributor\` at subscription is a smell.
- **Customer-managed keys (CMK) for sensitive data.** You control the key, not Microsoft.
- **Network segmentation.** Hub-spoke with Azure Firewall. Private Endpoints for PaaS. NSGs on every subnet.
- **Secret rotation.** Automate it with Key Vault. Secrets that never rotate are credentials waiting to leak.

### Anti-patterns

- Connection strings with embedded passwords in app settings
- Public endpoints on storage accounts, databases, Key Vaults
- Owner or Contributor roles granted broadly
- Diagnostic logs disabled to save money
- Relying on perimeter security alone ("the firewall will save us")

### Security checklist

- MFA enforced for all users including service accounts via managed identities
- Conditional Access baseline policies deployed
- All secrets in Key Vault with rotation enabled
- Defender for Cloud secure score > 70%
- Private Endpoints on all PaaS services handling sensitive data
- Audit logs flowing to a dedicated Log Analytics workspace with 1-year retention

## 3. Cost Optimization

**Definition:** Maximize the value of your cloud spend.

Cost Optimization is not penny-pinching. It is making sure every dollar Azure charges you is producing business value. A $500 VM running idle 20 hours per day is not a cost problem — it is a waste problem.

### Core Azure services and tools for Cost

- **Microsoft Cost Management** — budgets, alerts, cost analysis
- **Azure Advisor** — right-sizing and reservation recommendations
- **Reservations (RIs)** — 1 or 3 year commits for 40-72% off
- **Savings Plans** — flexible hourly commit, applies across VM families
- **Spot VMs** — up to 90% off for interruptible workloads
- **Auto-shutdown** — schedule dev/test VMs to stop outside business hours

### High-impact tactics

- **Right-size quarterly.** Azure Advisor has the data. Most over-provisioned VMs are running at less than 20% CPU. Step them down one SKU and watch the bill drop.
- **Reserve the baseline.** Anything running 24/7 for the next 1-3 years should be on a Reservation or Savings Plan. Production SQL DBs, baseline AKS nodes, core VMs.
- **Tier storage.** Move infrequently accessed blobs to Cool (50% cheaper) and archival data to Archive (95% cheaper). Lifecycle management policies automate this.
- **Delete orphans monthly.** Unattached disks, unused public IPs, old snapshots, empty resource groups. Use Azure Resource Graph to find them.
- **Consolidate Log Analytics workspaces.** Each workspace has fixed overhead. One per environment, not one per app.

### Anti-patterns

- Pay-as-you-go pricing for steady-state production workloads
- Premium SKUs on dev/test resources
- Log Analytics retention set to the maximum "just in case"
- No tagging strategy — you cannot optimize what you cannot attribute
- Hand-rolled VMs instead of PaaS where PaaS would work

### Cost checklist

- Budgets with alerts at 80% and 100% per subscription
- Tagging taxonomy enforced via Azure Policy
- Reservations for all steady-state compute
- Storage lifecycle policies for blob containers
- Monthly Advisor review
- Cost anomaly alerts

## 4. Operational Excellence

**Definition:** Operations processes that keep a system running in production.

If Reliability is about surviving failures and Security is about preventing incidents, Operational Excellence is about knowing what is happening and being able to change safely.

### Core Azure services for Operations

- **Azure DevOps / GitHub Actions** — CI/CD pipelines
- **Azure Policy** — preventive guardrails
- **Azure Blueprints / Deployment Stacks** — repeatable environment provisioning
- **Azure Monitor + Log Analytics** — centralized telemetry
- **Application Insights** — application performance monitoring
- **Azure Automation** — scheduled runbooks and desired state config

### Patterns that work

- **Infrastructure as Code for everything.** No manual portal changes in production. Bicep, Terraform, or ARM — pick one and commit.
- **Deployment safety.** Blue/green or canary deploys. Never a full fleet swap with no rollback path.
- **Feature flags.** Decouple deploy from release. Ship code dark, enable for 1% of users, watch telemetry, ramp.
- **Golden pipelines.** A standardized CI/CD template that every team uses. Security scans, cost checks, policy validation all built in.
- **Runbooks for every alert.** An alert without a runbook is a pager at 3 AM with no instructions.

### Anti-patterns

- Manual changes in production
- One person who knows how to deploy
- Alerts that fire constantly and get ignored
- Dev, staging, and prod that drift over time
- No on-call rotation or escalation path

### Operational Excellence checklist

- 100% of infrastructure deployed via IaC
- Pipelines gated by automated tests and policy checks
- Alerts link to runbooks
- On-call rotation documented
- Game days executed quarterly
- Postmortems after every Sev-1/2 incident

## 5. Performance Efficiency

**Definition:** The ability to meet performance requirements efficiently as load changes.

Performance is not speed at zero load. It is how gracefully your system handles 10x traffic while your cost curve stays sane.

### Core Azure services for Performance

- **Azure Cache for Redis** — millisecond reads, offload databases
- **Azure Front Door / CDN** — edge caching and global routing
- **Autoscale** — VMSS, App Service Plans, AKS, Cosmos DB
- **Cosmos DB with multi-region writes** — sub-10ms reads globally
- **Event Hubs / Service Bus** — decouple producers and consumers
- **Cognitive Services / OpenAI with provisioned throughput units** — predictable AI latency

### Patterns that work

- **Cache aggressively, invalidate surgically.** A well-placed Redis layer in front of a database often cuts costs and latency at the same time.
- **Asynchronous processing.** Accept the request, queue the work, respond immediately, process in the background. Great for emails, reports, webhooks.
- **Choose the right data store per access pattern.** Transactional writes → SQL. Document-heavy with high write throughput → Cosmos DB. Analytics → Synapse or Fabric. One database rarely fits all.
- **Autoscale on the right signal.** CPU is a lagging indicator. Queue depth, request latency p95, or connection count are often better triggers.

### Anti-patterns

- Over-provisioning to hide bad queries
- Single region for global users
- No performance testing before production
- Ignoring p95/p99 latency and optimizing only averages
- Chatty API designs (N+1 queries over HTTP)

### Performance checklist

- Published SLOs with measured p50/p95/p99 latency
- Load tests simulating 2-3x peak in pre-prod
- Caching layer for read-heavy workloads
- Autoscale configured on meaningful metrics
- CDN for static assets
- APM (App Insights) with distributed tracing

## How the Pillars Interact

The pillars are not independent. They push and pull on each other, and a mature architect treats them as a system.

- **Reliability vs Cost.** Multi-region active-active is maximally reliable and maximally expensive. Active-passive is cheaper with a recovery penalty.
- **Security vs Performance.** Private Endpoints add DNS lookup and network hops. WAF rules add latency. Both usually worth it.
- **Operations vs Cost.** A sophisticated observability stack is not free. Plan for 3-5% of infra spend on observability in mature orgs.
- **Performance vs Security.** Caching PII at the edge is fast and dangerous. Know what you cache.

The right answer is always "it depends on your business requirements." But the WAF ensures the conversation actually happens.

## How to Use the WAF on Your Team

1. **Run a WAF assessment against your critical workloads.** Microsoft publishes the assessment at \`aka.ms/WAF\`. Budget half a day per workload.
2. **Prioritize the top findings.** Do not try to fix everything. Pick the 3-5 highest-risk gaps per pillar.
3. **Assign owners with deadlines.** Gaps without owners do not get closed.
4. **Re-assess every 6 months.** Architectures drift. So do threats and cost models.

## Conclusion

The WAF is a mindset, not a checklist. Balance the pillars based on what your business actually needs. A regulated fintech weighs Security and Reliability heavily. A pre-revenue startup weighs Cost and Operational Excellence.

Cloud Canvas Designer validates your architecture against all 5 pillars automatically — it catches single points of failure, public endpoints on sensitive data, missing monitoring, over-provisioned SKUs, and unscalable bottlenecks, then shows you exactly where on the diagram to fix them.`;

// ============================================================
// ARTICLE: hub-spoke-network-topology
// ============================================================
articleContent['hub-spoke-network-topology'] = `# Hub-Spoke Network Topology: The Enterprise Standard

Ask any enterprise cloud architect what their Azure network looks like and odds are the whiteboard sketch is a hub-spoke. It is the most widely adopted enterprise Azure network topology for good reasons: it scales, it centralizes control, and it matches how most security and network teams already think.

This guide walks the full design — CIDR planning, subnet layout, DNS, User Defined Routes, Azure Firewall, Private Endpoints, and the pitfalls that trip up even experienced teams.

## What Hub-Spoke Actually Is

A **hub** VNet hosts shared services: the firewall, VPN or ExpressRoute gateway, DNS forwarders, bastion for jumpbox access, and often AD Domain Services.

**Spoke** VNets host workloads. A spoke might be \`prod-web\`, \`prod-data\`, \`dev-team-a\` — any logical grouping of applications.

Spokes peer to the hub using VNet peering. Critically, they do not peer to each other. All east-west traffic flows through the hub firewall, where it can be inspected, logged, and policy-enforced.

## Why Hub-Spoke Dominates

- **Centralized control.** One Azure Firewall at ~$900/month is much cheaper than one firewall per spoke. Same for VPN gateways and DDoS Standard.
- **Consistent policy.** Firewall rules, NSG baselines, and DNS settings are defined once and applied through the hub.
- **Clean isolation.** Spokes cannot communicate directly. A compromise in one workload does not naturally spread to another.
- **Predictable billing.** Shared services sit in one subscription with clear cost center attribution. Spokes bill to the workload owner.
- **Compliance friendly.** Auditors love being able to point at a single inspection point for all traffic.

## CIDR and Subnet Planning

Address planning is the single most impactful decision you make. Get it wrong and you will be migrating workloads for years.

### Reserved ranges

Reserve a large contiguous block for Azure. A common pattern:

- \`10.0.0.0/16\` — Hub VNet
- \`10.1.0.0/16\` through \`10.20.0.0/16\` — Spokes (one /16 per environment × workload)
- \`10.100.0.0/14\` — On-premises summary
- \`10.200.0.0/16\` — Reserved for future regions

Do not use \`10.0.0.0/8\` — it is too permissive and collides with everyone's existing on-prem networks.

### Hub VNet subnet layout (10.0.0.0/16)

| Subnet | Purpose | CIDR |
|--------|---------|------|
| AzureFirewallSubnet | Azure Firewall (required name) | 10.0.0.0/26 |
| AzureFirewallManagementSubnet | If using Firewall with forced tunneling | 10.0.0.64/26 |
| GatewaySubnet | VPN / ExpressRoute gateway | 10.0.1.0/27 |
| AzureBastionSubnet | Azure Bastion (required name, min /26) | 10.0.2.0/26 |
| SharedServicesSubnet | AD DS, DNS forwarders, monitoring agents | 10.0.3.0/24 |
| PrivateEndpointsSubnet | Shared private endpoints (if centralized) | 10.0.4.0/24 |

**Gotcha:** the subnet names \`AzureFirewallSubnet\`, \`GatewaySubnet\`, and \`AzureBastionSubnet\` are required and case-sensitive. Azure will refuse to place the service anywhere else.

### Spoke VNet layout (example: 10.1.0.0/16)

- \`10.1.0.0/24\` — Web tier
- \`10.1.1.0/24\` — App tier
- \`10.1.2.0/24\` — Data tier
- \`10.1.3.0/24\` — Private endpoints for this workload
- \`10.1.4.0/24\` — Build agents / management

Size subnets generously. Azure reserves 5 addresses per subnet, and resizing later is painful.

## VNet Peering Configuration

Each spoke has a bidirectional peering with the hub. The settings matter.

From the hub side of the peering:

- **Allow virtual network access:** Yes
- **Allow forwarded traffic:** Yes (so spoke traffic routed through the firewall is accepted)
- **Allow gateway transit:** Yes (if you use the hub's VPN/ER gateway)
- **Use remote gateway:** No

From the spoke side:

- **Allow virtual network access:** Yes
- **Allow forwarded traffic:** Yes
- **Allow gateway transit:** No
- **Use remote gateway:** Yes

Spoke-to-spoke peering: **no**. Always route through the hub.

## User Defined Routes (UDRs) — the Glue

VNet peering alone does not force traffic through the firewall. You need a route table on every spoke subnet that pushes traffic to the firewall's private IP.

Sample spoke route table:

- \`0.0.0.0/0\` → Virtual Appliance → \`10.0.0.4\` (firewall IP)
- \`10.0.0.0/8\` → Virtual Appliance → \`10.0.0.4\`
- \`168.63.129.16/32\` → Internet (Azure platform DNS — must remain direct)

Attach this route table to every workload subnet. Omit it on subnets that host Private Endpoints — PEs resolve correctly without the UDR and you can accidentally blackhole traffic.

**The classic gotcha:** you build everything, traffic does not flow, and you spend a day debugging. It is almost always a missing or misconfigured UDR.

## DNS Design

DNS is where most hub-spoke implementations fall down. Plan it before you deploy anything.

### Options from simplest to most capable

1. **Azure-provided DNS everywhere.** Works for basic scenarios. Breaks as soon as you need hybrid resolution.
2. **Custom DNS servers in the hub.** VMs running BIND, Unbound, or Windows DNS, forwarding on-prem zones to on-prem DNS and Azure zones to 168.63.129.16.
3. **Azure DNS Private Resolver.** Microsoft's managed DNS forwarder. Inbound endpoint for on-prem → Azure resolution, outbound for Azure → on-prem. Costs about $160/month per resolver.

For most enterprises, Private Resolver is the right answer. It removes the VM ops burden and integrates cleanly with Private DNS Zones.

### Private DNS Zones for Private Endpoints

Every Private Endpoint needs a matching Private DNS Zone (e.g., \`privatelink.blob.core.windows.net\`) linked to the VNets that consume it. Miss this step and your clients will resolve the public IP of the service even though they have a private endpoint.

Centralize Private DNS Zones in the hub subscription. Link them to every spoke VNet. Automate linking with Azure Policy so new VNets are covered by default.

## Azure Firewall Rules

Azure Firewall rules are grouped into collection hierarchies. Policy → Rule Collection Group → Rule Collection → Rule.

### Minimum viable rule set

- **Application rules:** Allow HTTPS to Azure services FQDNs, Windows Update, package repos
- **Network rules:** Allow DNS to DNS resolvers, RDP/SSH from bastion subnet only
- **NAT rules:** Inbound access to specific workloads (rare — prefer App Gateway or Front Door)

### Anti-pattern: default-allow outbound

Do not deploy Azure Firewall and leave a default \`* allow\` rule outbound. You have just paid for a $900 logging device. Start with deny-all and explicitly allow what your workloads need.

## Private Endpoints in Hub-Spoke

Private Endpoints move PaaS services (Storage, SQL, Key Vault) off the public internet. In hub-spoke you have two placement choices.

**Centralized:** all Private Endpoints in a dedicated subnet in the hub. Pros: single NSG to manage, simpler DNS. Cons: hub owns workload concerns, cross-charging is messy.

**Decentralized:** Private Endpoints in each workload spoke. Pros: clear ownership, failure isolation. Cons: more subnets to manage, more DNS links.

Most enterprises end up decentralized as they mature. Start centralized if you are small.

## Common Mistakes

1. **Spoke-to-spoke peering.** Defeats the purpose. Always force through the hub.
2. **No UDRs.** Traffic bypasses the firewall and you have no visibility.
3. **Missing Private DNS Zone links.** Clients hit public endpoints even with Private Endpoints deployed.
4. **Oversizing the hub.** A \`/22\` is fine. A \`/16\` just wastes address space.
5. **Forgetting forced tunneling impact.** Azure Firewall with forced tunneling requires a separate management subnet. Easy to miss.
6. **Not automating.** If you build hub-spoke manually you will fight inconsistency forever. Template it.

## When Not to Use Hub-Spoke

Hub-spoke is overkill for:

- Single-workload deployments
- Dev/test sandboxes
- Very small teams (< 3 engineers) where the operational overhead is not worth it

For those, a flat VNet with NSGs is fine. Add hub-spoke when you have multiple workloads that need to share a firewall or VPN.

## Alternative: Virtual WAN

For multi-region or global enterprises, Microsoft's **Virtual WAN** is a managed hub-spoke with built-in any-to-any spoke routing, ExpressRoute integration, and SD-WAN appliance support. It costs more per hub but saves enormous operational effort.

Go Virtual WAN when:

- You have 3+ Azure regions in scope
- You have multiple ExpressRoute circuits
- You want branch-to-branch connectivity without BGP gymnastics

Stay classic hub-spoke when:

- Single region or two regions
- Strict routing control needed
- Cost sensitivity

## Reference Architecture in Cloud Canvas Designer

Cloud Canvas Designer ships with a hub-spoke template under **Templates → Networking**. It generates the full topology — VNets, subnets with correct names and sizes, firewall, gateway, bastion, UDRs, peering — and can export directly to Terraform or Bicep.

## Final Word

Hub-spoke is not glamorous. It is plumbing. But the teams that invest in the plumbing are the teams who can ship securely at scale without stopping to refactor networking every quarter. Plan it once, automate it, and forget it.`;

// ============================================================
// ARTICLE: terraform-vs-bicep-vs-arm
// ============================================================
articleContent['terraform-vs-bicep-vs-arm'] = `# Terraform vs Bicep vs ARM: Which IaC Should You Choose?

Every team moving to Azure eventually has to answer this question, and the answer has changed over the years. ARM templates used to be the default, Terraform ate the cloud-agnostic market, and Bicep is now Microsoft's preferred Azure-native tool. Here is an honest comparison — with real code — to help you pick.

## The Three Contenders in 90 Seconds

**ARM Templates.** Microsoft's original IaC language. JSON-based. Every Azure resource is available on day one because ARM is what the Azure Resource Manager API actually consumes.

**Bicep.** Microsoft's modern DSL. A thin, readable layer over ARM that transpiles to ARM JSON before deployment. Azure-only but first-class.

**Terraform.** HashiCorp's multi-cloud IaC. Uses its own HCL language and a provider model (\`azurerm\`, \`aws\`, \`google\`, etc.). Manages state externally.

## Same Resource, Three Languages

Here is a simple resource — an Azure Storage Account — in each language.

### ARM Template (JSON)

\`\`\`
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "storageAccountName": { "type": "string" },
    "location": { "type": "string", "defaultValue": "[resourceGroup().location]" }
  },
  "resources": [{
    "type": "Microsoft.Storage/storageAccounts",
    "apiVersion": "2023-01-01",
    "name": "[parameters('storageAccountName')]",
    "location": "[parameters('location')]",
    "sku": { "name": "Standard_LRS" },
    "kind": "StorageV2",
    "properties": { "supportsHttpsTrafficOnly": true }
  }]
}
\`\`\`

### Bicep

\`\`\`
param storageAccountName string
param location string = resourceGroup().location

resource storage 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
  properties: { supportsHttpsTrafficOnly: true }
}
\`\`\`

### Terraform

\`\`\`
variable "storage_account_name" { type = string }
variable "location"            { type = string; default = "eastus" }

resource "azurerm_storage_account" "this" {
  name                     = var.storage_account_name
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = var.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  min_tls_version          = "TLS1_2"
  https_traffic_only_enabled = true
}
\`\`\`

The Bicep version is roughly half the characters of the ARM version and reads like a structured config file. Terraform is in between but introduces its own naming conventions.

## Side-by-Side Comparison

| Dimension | ARM | Bicep | Terraform |
|-----------|-----|-------|-----------|
| Language | JSON | DSL | HCL |
| Cloud support | Azure only | Azure only | Multi-cloud |
| Feature parity with Azure API | 100% (day 1) | 100% (day 1) | Lags, sometimes weeks to months |
| State management | None (ARM tracks) | None (ARM tracks) | External state file (Storage Account or Terraform Cloud) |
| Modularity | Linked templates | Modules | Modules |
| Preview/plan | \`what-if\` | \`what-if\` | \`plan\` (best in class) |
| Secrets | Key Vault references | Key Vault references | Key Vault data sources + sensitive vars |
| Learning curve | Steep | Gentle | Moderate |
| Community | Microsoft + Azure community | Microsoft + Azure community | Largest open-source community |
| Testing tools | ARM-TTK | Bicep linter + what-if | Terratest, checkov, tflint |
| CI/CD integration | Native Azure DevOps | Native Azure DevOps + GitHub | Universal |
| Cost | Free | Free | Free (OSS) or paid (Terraform Cloud) |

## When Each Wins

### ARM wins when

- You are maintaining a large existing ARM codebase and a rewrite is not worth it
- You need a resource type that is supported in ARM but not yet in Bicep or Terraform (rare today)
- You are generating templates programmatically (ARM's JSON is easier to produce from code)

### Bicep wins when

- You are Azure-only and plan to stay that way
- You want the cleanest syntax with zero translation layer
- You want Microsoft to own the tooling, docs, and support
- You are starting greenfield and want the lowest learning curve for an Azure team

### Terraform wins when

- You are multi-cloud or plan to be
- You already have Terraform expertise on the team
- You want the richest module ecosystem (Terraform Registry has thousands)
- You need the best-in-class preview UX (\`terraform plan\`)
- You want vendor neutrality — not coupled to Microsoft's roadmap

## State Management: The Big Divide

This is where Terraform is fundamentally different. It maintains a state file that maps HCL resources to real Azure resource IDs. That state enables:

- Accurate drift detection
- Rich plan output showing exactly what will change
- Safe \`destroy\` operations
- Import of existing resources

It also introduces operational burden: you must store the state somewhere (Azure Storage with state locking via a blob lease is standard), protect it (it contains secrets), and coordinate among team members.

ARM and Bicep have no client-side state. Azure Resource Manager itself is the source of truth. You write what you want; ARM reconciles. No state file to lose, no state file to secure. But also no rich plan — \`what-if\` is good but not as granular as Terraform plan.

## Modules and Reuse

### Bicep modules

\`\`\`
module storage 'modules/storage.bicep' = {
  name: 'storageDeploy'
  params: {
    name: 'mystorageaccount'
    sku: 'Standard_LRS'
  }
}
\`\`\`

Bicep modules are local files or published to a container registry (ACR). Microsoft's Azure Verified Modules (AVM) initiative is producing a curated library of best-practice modules.

### Terraform modules

\`\`\`
module "storage" {
  source = "Azure/storage/azurerm"
  version = "~> 4.0"
  storage_account_name = "mystorageaccount"
}
\`\`\`

Terraform's module ecosystem is the deepest in IaC. The public Terraform Registry has tens of thousands of modules. Quality varies — stick to verified publishers.

## Secrets Handling

### Bicep

Reference Key Vault secrets directly in deployments:

\`\`\`
param keyVaultName string
param secretName string

resource kv 'Microsoft.KeyVault/vaults@2023-07-01' existing = {
  name: keyVaultName
}

module app 'app.bicep' = {
  name: 'appDeploy'
  params: {
    adminPassword: kv.getSecret(secretName)
  }
}
\`\`\`

### Terraform

\`\`\`
data "azurerm_key_vault_secret" "admin_pass" {
  name         = "admin-password"
  key_vault_id = data.azurerm_key_vault.kv.id
}

resource "azurerm_mssql_server" "this" {
  administrator_login_password = data.azurerm_key_vault_secret.admin_pass.value
}
\`\`\`

Terraform pulls the secret value into state. Encrypt state at rest, limit access, and know that secrets are in the state file. Bicep never materializes secrets on the client.

## Deployment UX

### ARM and Bicep

\`\`\`
# Preview
az deployment group what-if --resource-group rg --template-file main.bicep

# Apply
az deployment group create --resource-group rg --template-file main.bicep
\`\`\`

### Terraform

\`\`\`
terraform init
terraform plan -out tfplan
terraform apply tfplan
\`\`\`

Terraform plan output is the gold standard: color-coded, resource-by-resource, showing exactly which properties change. Bicep's what-if has closed a lot of the gap but still shows noise in some scenarios.

## Hidden Costs and Gotchas

### Terraform gotchas

- **State file loss is catastrophic.** Use remote state with versioning.
- **Provider version drift.** Pin \`azurerm\` versions. Minor updates sometimes introduce breaking schema changes.
- **Long plans on large states.** State files of 10,000+ resources get slow. Split by workload.
- **Dangling resources after manual portal changes.** Educate the team: portal changes = drift.

### Bicep gotchas

- **Deployment mode matters.** \`Incremental\` (default) adds/modifies but does not delete. \`Complete\` removes anything not in the template. Know which you are running.
- **Circular dependencies.** ARM infers dependencies from property references. Sometimes you need explicit \`dependsOn\`.
- **Preview-only features.** Bicep sometimes exposes new Azure features before Terraform does.

### ARM gotchas

- **JSON is human-hostile.** Long templates become unmaintainable. Migrate to Bicep.
- **Linked templates require public URLs.** Makes CI/CD awkward.

## My Real Recommendation

I have shipped significant production workloads in all three. My default for new Azure-only work is Bicep. The syntax is clean, Microsoft is investing heavily, AVM modules are growing fast, and there is no state to manage.

I pick Terraform when the team already has Terraform expertise or when multi-cloud is a real requirement. Do not pick Terraform because it is popular — pick it because you have a concrete reason.

I never start new work in raw ARM JSON. It is a compile target now, not a source language.

## Can You Mix Them?

Yes, and many large enterprises do. Common patterns:

- **Terraform for cross-cloud networking and identity, Bicep for Azure-specific workloads.** Terraform owns the hub, Bicep owns each spoke.
- **Bicep for infrastructure, Helm/K8s manifests for in-cluster resources.** Clear tool-per-layer separation.
- **Terraform import for existing portal-built resources, then maintain in Terraform.** Great for bringing legacy work into IaC.

Do not fragment randomly. Have a written rule about what lives where.

## Cloud Canvas Designer Exports

Cloud Canvas Designer exports your diagram to all three — Terraform HCL, Bicep, and ARM JSON — so you can design visually, pick your language, and drop the output into your pipeline. The generator respects hub-spoke boundaries, subnet naming conventions, and standard tagging.

## Closing

IaC choice matters much less than the discipline around it. A team that writes Bicep with good modules, pipelines, tests, and code reviews will out-deliver a team writing Terraform without those things — and vice versa. Pick the tool that fits your team, invest in the practices, and do not relitigate the decision every quarter.`;

// ============================================================
// ARTICLE: aks-vs-app-service-vs-functions
// ============================================================
articleContent['aks-vs-app-service-vs-functions'] = `# AKS vs App Service vs Functions: Choosing Your Compute

Azure offers many compute options, but the three that cover ~90% of web and API workloads are Azure Kubernetes Service (AKS), App Service, and Azure Functions. The difference between these three is not features — it is operational model, scale pattern, and cost shape.

Pick wrong and you pay either in ops burden (AKS when you did not need it) or in limits (Functions when you needed always-on). Here is how to pick right.

## The Three in Plain English

**Azure Functions** — you write a function, Azure runs it on-demand. No servers to manage, no containers to build. Scales to zero. Pay per execution.

**App Service** — you deploy an app (ZIP, container, or code), Azure gives you a running service with a URL. No container expertise needed. Scales up and out with autoscale rules.

**AKS** — you get a managed Kubernetes cluster. You run anything Kubernetes can run. You own the cluster config, workload manifests, and scaling decisions.

## The Core Trade-Off

As you move from Functions → App Service → AKS:

- **Control increases.** Functions hide the runtime; AKS hands you everything.
- **Operational burden increases.** Functions needs zero ops; AKS needs a platform team.
- **Ceiling increases.** Functions has execution limits; AKS has none.
- **Per-unit cost often decreases at scale.** A busy Functions app can cost more than an equivalent App Service.

## When Each Is the Right Choice

### Azure Functions is the right choice when

- The workload is event-driven (HTTP, queue, blob, timer)
- Invocations are short (< 10 minutes, ideally seconds)
- Traffic is bursty or unpredictable
- You want true scale-to-zero cost
- The team does not want to manage a runtime

**Examples:** webhooks, queue processors, scheduled cleanup jobs, image thumbnailing on upload, chatops, light ETL glue.

**Avoid when:**

- You need always-on (cold starts break UX on Consumption plan)
- Operations exceed 10 minutes (Consumption) or 30 minutes (Premium)
- You need deep networking (Premium plan only, and more expensive)
- You have complex dependencies that inflate the package size

### App Service is the right choice when

- Traditional web app or REST API with predictable traffic
- You want deployment slots, custom domains, SSL management included
- You want autoscale but do not want to design it from scratch
- You use common runtimes (Node, Python, .NET, Java, PHP, Ruby)
- You want WebJobs or background processing within the app

**Examples:** marketing websites, SaaS product front-ends, internal business apps, REST APIs for web and mobile, WordPress, Laravel.

**Avoid when:**

- You need microsecond tuning of the runtime
- Your app needs privileged Linux capabilities or sidecars at scale
- You want multi-container orchestration (use App Service multi-container sparingly)
- You are already invested in Kubernetes

### AKS is the right choice when

- Microservices at scale
- You have Kubernetes expertise or a platform team
- You want portability across clouds or to on-prem
- You need fine-grained control over networking, scheduling, and scaling
- You want to run non-HTTP workloads mixed with HTTP
- You need GPU workloads with pod-level scheduling
- You run workloads that need node-level customization (DaemonSets, privileged containers)

**Examples:** e-commerce platforms with dozens of services, real-time trading systems, AI/ML training pipelines, gaming backends, data platforms mixing stream and batch processing.

**Avoid when:**

- The team has no K8s expertise and no appetite to build it
- You have one or two services
- Cost is primary concern and App Service would fit
- You want to be out of the ops business entirely

## Cost Analysis With Real Numbers

Let's price a moderately busy API workload: 10 requests/sec average, 5 million requests/month, 200ms median response, 200 MB memory.

### Azure Functions (Premium EP1)

- Base: ~$160/month (Premium plan minimum instance)
- Execution: covered in Premium
- **Total: ~$160-200/month**

Functions Consumption would be cheaper here — about $10-30/month — but cold starts make it unsuitable for a latency-sensitive API.

### App Service (Linux, P1v3)

- P1v3 plan: ~$145/month
- One instance is enough at this load
- **Total: ~$145/month**

Scale to two instances for HA and you are at ~$290/month.

### AKS (3-node Standard_D2s_v3 cluster)

- Nodes: 3 × ~$70/month = $210/month
- Load balancer: $20/month
- Log Analytics ingestion: variable, budget $50/month
- **Total: ~$280-350/month** just for the platform, before you put another workload on it

The lesson: AKS only becomes cost-effective when you have multiple workloads sharing the cluster. Running a single small service on a dedicated AKS cluster is expensive.

## Scaling Behavior

### Functions

Consumption plan scales per function execution. Cold start: 500ms-3s on .NET/Python, <1s on Node. Premium plan has warm pre-allocated instances at higher base cost but no cold start.

### App Service

Autoscale based on metrics (CPU, memory, queue depth, schedule). Scale-out takes 30-60 seconds per instance. Scale-in respects a cooldown. Max instances depend on plan (P1v3 = 30, Isolated = 100+).

### AKS

Horizontal Pod Autoscaler (HPA) scales pods based on metrics. Cluster Autoscaler adds nodes when pods cannot schedule. Scale-out adds pods in seconds, nodes in minutes. KEDA extends HPA to scale on event sources (queue depth, etc.).

## Networking Integration

| Feature | Functions | App Service | AKS |
|---------|-----------|-------------|-----|
| VNet integration | Premium plan only | Standard/Premium | Native |
| Private endpoints for inbound | Premium | Yes | Yes (via Private Link Service) |
| Outbound to VNet | Premium | Yes | Native |
| Custom DNS | Premium | Limited | Full control |
| Azure Firewall egress | Premium | Yes with VNet integration | Yes |

If you need tight networking from day one, App Service Standard or higher is the cheapest path. Functions Consumption plan has no VNet — this is the biggest blocker for many enterprise teams.

## Deployment and CI/CD

### Functions

GitHub Actions or Azure Pipelines push the function package. Deployment slots for staging. Zero-downtime via slot swap. Fastest deploy time of the three.

### App Service

Same pattern — package deploy to a slot, test, swap. Also supports container deploys. Canary deploys via traffic routing percentages on slots.

### AKS

Helm, Kustomize, GitOps (Flux or Argo CD). Deployments are Kubernetes objects. Rolling updates, blue-green, canary all possible but you implement them. This is where the power and the burden both live.

## Observability

All three integrate with Application Insights and Log Analytics. Differences:

- Functions auto-instruments heavily — you get per-invocation traces, failure rates, duration histograms basically for free.
- App Service auto-instruments HTTP endpoints and gives you Live Metrics.
- AKS requires Container Insights + OpenTelemetry instrumentation in your apps. More setup, more power.

## The "Just Use Containers" Temptation

You can run containers on all three:

- Functions: container image in Premium plan
- App Service: Linux containers (single or multi-container with Docker Compose)
- AKS: where containers live naturally

Running a container on Functions or App Service does not give you Kubernetes. You still get the managed runtime. Use containers there when you want dependency isolation, not when you want K8s features.

## Decision Flowchart

1. **Is it event-driven with short executions?** → Functions (Consumption if bursty, Premium if latency-sensitive)
2. **Is it a standard web app or API with steady traffic?** → App Service
3. **Do you have 10+ microservices or K8s expertise?** → AKS
4. **Still unsure?** → Start with App Service. Migrate to AKS if you outgrow it. Add Functions for async jobs on the side.

## Migration Paths

Going from App Service to AKS is non-trivial but common. You will containerize (if you have not), rewrite deployment, add Kubernetes manifests, and likely restructure for microservices along the way.

Going from AKS to App Service is rarer but happens when teams realize they do not have the K8s expertise they thought they did. It is usually a simplification win.

Going from Functions to App Service happens when a Function "grew up" into a real service. Straightforward if the code is already clean.

## Common Anti-Patterns

- **A Function that runs for hours.** You built a scheduler inside a serverless platform. Use a timer-triggered container or Container Apps Job.
- **An App Service hosting 15 tiny apps.** You built a janky Kubernetes on App Service. Consider AKS or Container Apps.
- **AKS for a static marketing site.** You built a rocket to deliver the mail. App Service with a build pipeline is fine.

## Container Apps: The Middle Ground Worth Knowing

Azure Container Apps sits between App Service and AKS. It runs containers, scales to zero, supports Dapr sidecars, and gives you HTTP + background workers — without exposing Kubernetes primitives. For many "we need more than App Service but less than AKS" cases, Container Apps is the answer.

## Final Take

Pick the simplest compute that fits your workload. Over-engineering compute is a huge source of ops burden and complexity. You can always migrate up. You rarely need to migrate down — and when you do, it usually means you picked up.`;

// ============================================================
// ARTICLE: cost-optimization-strategies
// ============================================================
articleContent['cost-optimization-strategies'] = `# 15 Azure Cost Optimization Strategies That Actually Work

Most Azure bills have 30-60% waste hiding in plain sight. Not because teams are careless, but because cloud spending optimization is its own discipline — and cloud-native defaults are usually not cost-optimal.

This guide is not theoretical. Every tactic below has saved real money on real workloads, with ballpark numbers so you can estimate impact on your own environment.

## 1. Reserved Instances — Buy Commit, Pay Less

**Savings: 40-72% off pay-as-you-go**

The single highest-ROI optimization. You commit to 1 or 3 years of compute capacity; Azure gives you a massive discount. Works for VMs, SQL DB, Cosmos DB, Synapse, App Service, and more.

The trick is knowing your baseline. Look at 90 days of utilization. Reserve the steady-state 80-90%; keep the spiky top on pay-as-you-go.

**Example:** A production SQL DB on a GP_S_Gen5_8 running 24/7 costs ~$1,100/month pay-as-you-go. The 3-year RI cuts it to ~$380/month. Savings: $720/month, $25,000 over 3 years.

**When to buy:**

- Steady-state workloads that will not be decommissioned
- Resources you have been running for 3+ months
- Environments where the SKU is stable

**When not to buy:**

- Dev/test environments (use Azure Hybrid Benefit + auto-shutdown instead)
- Workloads you plan to refactor to PaaS soon
- Experimental projects

Convert unused RIs by exchanging them — Azure allows flexible exchanges within the same product family.

## 2. Savings Plans for Compute

**Savings: up to 65%**

Newer than RIs, more flexible. You commit to an hourly dollar amount of compute spend; the discount applies across VM families and regions. Great when you know you will spend $X/hour but you are not sure on which exact SKUs.

Rule of thumb: RIs if your SKUs are locked in; Savings Plans if your footprint evolves quickly.

## 3. Spot VMs for Interruptible Workloads

**Savings: up to 90%**

Azure sells spare capacity at huge discounts. The catch: Azure can evict your VM with 30 seconds notice when it needs the capacity back.

**Good fits:**

- CI/CD build agents
- Batch processing with checkpointing
- ML training with checkpointing
- Dev/test environments you do not need always-on
- Stateless web workers behind a queue

**Bad fits:**

- Databases
- Stateful services without checkpointing
- Anything user-facing without a backup plan

Use VM Scale Sets with mixed instance policy — 80% spot, 20% on-demand — for a good balance.

## 4. Right-Sizing (Advisor + Hard Data)

**Savings: 20-40% per workload**

Most VMs run at 10-30% CPU utilization. Azure Advisor surfaces this for free. Act on the recommendations.

For more rigor: pull 30 days of metrics from Log Analytics. Any VM averaging under 40% CPU with peaks under 70% can usually drop a SKU tier. A \`D4s_v5\` at 15% CPU can almost always be a \`D2s_v5\` and save $70/month.

Do not right-size database servers aggressively — they benefit from memory headroom. Right-size compute aggressively.

## 5. Auto-Shutdown for Dev/Test

**Savings: 60-70% on dev environments**

A VM that runs 40 hours/week instead of 168 hours/week saves 75%. For dev and test, that is pure win.

Azure has built-in auto-shutdown for Virtual Machines (via Dev Test Labs or individual VM settings). For AKS and App Service, use Logic Apps or a timer Function to stop/start.

**Typical pattern:** Shutdown 7 PM weekdays, all weekend. Start 7 AM weekdays. Give devs a "boot my environment" button so they can work off-hours when they need to.

## 6. Storage Tiering

**Savings: 50-95% depending on tier**

Blob Storage has four access tiers:

- **Hot** — frequent access (default)
- **Cool** — infrequent access (50% cheaper storage, higher retrieval)
- **Cold** — rare access (introduced 2024)
- **Archive** — offline (95% cheaper, hours to retrieve)

Use lifecycle management rules to auto-move blobs by age. Example: Hot for 30 days → Cool for 60 days → Archive after 90 days.

**Real impact:** 500 TB of logs on Hot costs ~$9,500/month. Same data tiered properly (Hot 30 days, rest Archive) costs ~$1,400/month. Savings: $8,000/month.

## 7. Delete Orphaned Resources Monthly

**Savings: varies, often $500-5000/month**

Things that sit quietly billing forever:

- Unattached managed disks (full price while nothing uses them)
- Unassociated public IPs
- Unused network security groups (free) and load balancers (not free)
- Old snapshots
- Empty resource groups
- Premium SSD disks on stopped VMs

Use Azure Resource Graph queries to find them. One query example for unattached disks:

\`\`\`
Resources
| where type =~ 'microsoft.compute/disks'
| where managedBy == ''
| project name, location, resourceGroup, diskSizeGB, sku.name
\`\`\`

## 8. Consolidate Log Analytics Workspaces

**Savings: 15-30% on log costs**

Multiple workspaces have fixed overhead (commitment tiers, retention minimums, data ingestion charges). A workspace-per-app sprawl pattern burns money.

Consolidate to one workspace per environment (or one per region per environment). Use \`Microsoft.OperationalInsights/workspaces/tables\` retention settings to give different data types different retentions.

Also: use **basic logs** for high-volume low-query data (audit logs, firewall logs) — they are ~80% cheaper than analytics logs but support only a subset of KQL.

## 9. Cosmos DB Autoscale

**Savings: 30-50% on Cosmos DB**

Manual throughput means paying for your peak all the time. Autoscale pays per usage between a floor and a ceiling. For any workload that is not perfectly flat, autoscale wins.

The exception: workloads that genuinely run at peak 24/7. Those save with manual provisioned throughput.

Also consider **serverless** Cosmos DB for truly spiky workloads — you pay per request unit consumed. Breakeven vs provisioned is around 30% average utilization.

## 10. CDN / Front Door for Egress

**Savings: 40-70% on egress and often on compute**

Egress from Azure regions is expensive. Egress from CDN is cheaper and usually much faster for users. For any public-facing static or cacheable content, Front Door or Azure CDN is almost always a cost win on top of the performance win.

Bonus: offloading static content reduces origin load, which can let you downsize compute.

## 11. App Service — Use Linux, Pick the Right Tier

**Savings: 30-50%**

Linux App Service plans are usually 30-40% cheaper than Windows at the same tier. Unless you need Windows-specific runtimes (.NET Framework, specific COM components), go Linux.

Also right-size the tier:

- **Basic (B-series):** dev/test only — no autoscale, no slots
- **Standard (S-series):** acceptable for small production — has autoscale, 5 slots
- **Premium v3 (Pv3):** best price/performance for production — slots, VNet integration, zone redundancy
- **Isolated v2 (Iv2):** when you need App Service Environment — expensive, required for some compliance

Most workloads over-buy. P1v3 covers far more than teams expect.

## 12. Azure Hybrid Benefit (AHB)

**Savings: up to 40% on compute, up to 55% on SQL**

If you have Windows Server or SQL Server licenses with Software Assurance, you can use them on Azure VMs or managed SQL. The savings are enormous. Surprisingly few teams activate it.

Check with your licensing team. If you have an EA with SA, you almost certainly qualify.

## 13. Kill Premium Features You Are Not Using

**Savings: varies, often significant**

- Premium SSD when Standard SSD would serve (dev/test almost always)
- Zone-redundant Storage when Locally-Redundant would suffice (non-production)
- Premium Key Vault when Standard tier is all you need
- Premium Service Bus when Standard works

The default path in the portal pushes Premium. Audit your environment — Standard is often fine.

## 14. Watch AKS Closely

AKS has lots of levers:

- **Right-size the node pool.** Not every pool needs Standard_D8. Mix general-purpose and memory-optimized by workload.
- **Use spot node pools** for non-critical workloads (batch, dev). 50-90% savings.
- **Cluster Autoscaler with low minNode counts.** If your cluster never goes below 5 nodes at 3 AM, you are paying for idle.
- **Azure CNI vs Kubenet.** Kubenet is free; Azure CNI Overlay bridges the gap.
- **Horizontal Pod Autoscaler.** Pods should scale with load. Over-provisioned replicas waste nodes.

A moderately mature AKS cluster running ~$8,000/month can often drop to $5,000 with right-sized pools and spot on non-critical workloads. That is $36,000/year from one cluster.

## 15. Tag Everything, Chargeback Monthly

**Savings: enables everything else**

You cannot optimize what you cannot attribute. A strong tagging strategy (CostCenter, Environment, Application, Owner) lets you:

- Show teams what their work actually costs
- Identify cost per customer or per product line
- Target optimization efforts at the biggest spenders
- Build internal chargeback or showback

Enforce tags with Azure Policy — \`deny\` or \`append\` effects at resource creation. Review monthly.

## Budgets and Alerts — Table Stakes

Every subscription needs:

- A monthly budget
- Email alert at 80% of budget
- Email + action group alert at 100%
- Forecast alert at 110% (catches runaway spend before the bill)

Set action groups to also notify finance if spend breaches threshold. Surprise bills destroy trust.

## Cost Anomaly Detection

Microsoft Cost Management has anomaly detection that catches sudden spikes (the classic \`forgot to turn off the GPU cluster\` scenario). Enable it, subscribe finance and platform leads. Free and pays for itself the first time it catches a runaway.

## A Worked Example: Small Production Workload

Imagine a typical production app:

- 2 × Standard_D4s_v5 VMs in VMSS — $580/month
- 1 × Azure SQL GP_S_Gen5_4 — $550/month
- 1 × Standard Storage account — $80/month
- Log Analytics ~10 GB/day — $70/month
- App Insights — $30/month
- **Total: ~$1,310/month**

After optimization:

- Spot + on-demand VMSS (80/20): -$200/month
- 3-year RI on SQL: -$330/month
- Blob lifecycle (move logs to Cool): -$40/month
- Log Analytics basic tier on firewall logs: -$30/month
- **New total: ~$710/month — 46% savings**

Multiply across your portfolio and the numbers get serious fast.

## Anti-Patterns That Blow Budgets

- Leaving GPU VMs running after a training job
- Premium tier everywhere "for safety"
- Multiple Log Analytics workspaces because every team wanted their own
- No tagging, so waste cannot be traced
- Over-provisioning "to handle Black Friday" year-round
- Treating dev the same as prod

## The Org Side — FinOps

Cost optimization is part engineering, part organizational. Successful programs have:

- A FinOps champion per team or product
- Monthly cost reviews with engineering and finance
- Executive visibility via dashboards
- Optimization quotas baked into OKRs

Without the org structure, optimization gets done once and then drifts.

## Cloud Canvas Designer Helps

Cloud Canvas Designer's region compare feature surfaces per-region pricing variances in real time, and the WAF validator flags over-provisioned SKUs on the canvas before you deploy. Design with cost in mind; do not bolt it on after deployment.

## Final Word

There is no single optimization. There are dozens, each worth 5-15%, which compound to 40-60% total savings. Build the habit: right-size quarterly, review Advisor weekly, enforce tagging, and never deploy without budget alerts. The savings pay for themselves many times over and build trust with finance that cloud is being spent wisely.`;

// ============================================================
// ARTICLE: private-endpoints-vs-service-endpoints
// ============================================================
articleContent['private-endpoints-vs-service-endpoints'] = `# Private Endpoints vs Service Endpoints: Which to Use?

Both keep traffic to Azure PaaS services off the public internet. They work completely differently under the hood, cost different amounts, and have different operational footprints. Getting this choice right is foundational to any enterprise Azure network design.

This guide explains both, the DNS consequences, pricing, quotas, and the decision framework most enterprises end up with.

## The Short Version

- **Service Endpoints** are a VNet-level allow-list bolted onto a PaaS service's public endpoint. Traffic routes over the Microsoft backbone. Free. Easy. Limited.
- **Private Endpoints** put a real private IP for the PaaS service inside your VNet. Truly private. Per-month cost. Requires DNS setup.

If you want the five-second version: new workloads should default to Private Endpoints. Read on for when Service Endpoints still make sense.

## Service Endpoints Explained

A Service Endpoint is a one-click setting on a subnet that tells Azure, "when resources in this subnet hit these PaaS services, route through Microsoft backbone and include the VNet identity."

The PaaS service (say, a Storage account) still has a public endpoint with a public DNS name and a public IP. But you configure its firewall to accept only requests from your VNet subnets. Azure passes the VNet identity along so the firewall can make that decision.

### What it looks like on the wire

- Client resolves \`mystorage.blob.core.windows.net\` → public IP
- Packet leaves the VNet subnet, but stays on the Microsoft backbone (not the public internet)
- Reaches the Storage public endpoint
- Storage firewall checks source — sees the VNet identity, allows it

### Strengths

- Free (zero per-resource charges)
- Easy setup — one toggle per subnet, plus firewall rules on the service
- No DNS changes needed
- Works for VM-to-PaaS with minimal config

### Weaknesses

- The PaaS service still has a public endpoint (public DNS, public IP). An attacker who obtains credentials can still hit it from anywhere unless the firewall blocks them.
- Only works from the same region. Cross-region access needs the public endpoint.
- Does not work from on-premises. ExpressRoute or VPN users cannot leverage Service Endpoints for private access.
- Limited service coverage. Storage, SQL, Key Vault, Cosmos, and about a dozen others — not the full Azure catalog.
- No granularity — it is VNet-wide or subnet-wide, not per-resource.

## Private Endpoints Explained

A Private Endpoint creates a network interface (NIC) in your VNet with a private IP (e.g., 10.1.3.5). That NIC maps to a specific instance of a PaaS service via Azure Private Link. All traffic to that service from your network can stay entirely private.

### What it looks like on the wire

- Client resolves \`mystorage.privatelink.blob.core.windows.net\` → 10.1.3.5 (thanks to a Private DNS Zone)
- Packet stays inside your VNet or hybrid network
- Reaches the Private Endpoint NIC
- Private Link tunnels the request to the actual Storage service

No public traffic. No public endpoint required (you can disable the public endpoint on the service entirely).

### Strengths

- Truly private — you can disable the public endpoint on the PaaS service
- Works across regions, subscriptions, and tenants
- Works from on-premises via ExpressRoute or VPN
- Granular — one Private Endpoint per PaaS resource, with its own NSG and RBAC
- Broadly supported — most Azure PaaS services now have Private Endpoint support
- Compliance-aligned — regulators love seeing "no public endpoint enabled"

### Weaknesses

- Costs ~$7.30/month per Private Endpoint + bandwidth (see pricing below)
- Requires Private DNS Zone setup — this is where most implementations get tangled
- More objects to manage (NICs, Private DNS Zones, zone links)
- Per-service quotas that can bite at scale (e.g., 1000 Private Endpoints per VNet)

## DNS: Where Private Endpoints Usually Go Wrong

Private Endpoints live or die by DNS. The canonical name for a Storage account is \`mystorage.blob.core.windows.net\`. When you create a Private Endpoint, Azure creates a CNAME chain:

- \`mystorage.blob.core.windows.net\` → \`mystorage.privatelink.blob.core.windows.net\`

The \`privatelink.blob.core.windows.net\` portion is what you control. You create a Private DNS Zone for it, add an A record mapping the Storage account name to the Private Endpoint's private IP, and link that zone to all VNets that should resolve it privately.

Miss the link and clients fall back to public resolution, getting a public IP — and hit the public endpoint, defeating the purpose.

### Standard Private DNS Zones by service

- Storage (blob): \`privatelink.blob.core.windows.net\`
- Storage (file): \`privatelink.file.core.windows.net\`
- Storage (queue): \`privatelink.queue.core.windows.net\`
- Azure SQL: \`privatelink.database.windows.net\`
- Key Vault: \`privatelink.vaultcore.azure.net\`
- Cosmos DB (SQL API): \`privatelink.documents.azure.com\`
- Azure Container Registry: \`privatelink.azurecr.io\`
- App Service / Function inbound: \`privatelink.azurewebsites.net\`

Centralize Private DNS Zones in the hub subscription and link them to every spoke VNet automatically. Azure Policy deploy-if-not-exists rules are the cleanest way to enforce this.

### Hybrid DNS

On-prem clients need to resolve \`*.privatelink.*\` to your private IPs. Options:

- **Azure DNS Private Resolver inbound endpoint** — on-prem DNS conditional forwarders point to it
- **Custom DNS forwarders** (VMs running BIND, Unbound) in the hub — same idea, more DIY

Get hybrid DNS working before you roll out Private Endpoints broadly, or your on-prem users will hit public endpoints and the whole thing falls apart.

## Pricing Side-by-Side

| Item | Service Endpoints | Private Endpoints |
|------|-------------------|-------------------|
| Per endpoint | Free | ~$7.30/month |
| Data transfer (ingress) | Free | ~$0.01/GB |
| Data transfer (egress) | Free | ~$0.01/GB |
| Private DNS Zone | N/A | Free for zone; ~$0.50 per million queries |

For a typical environment with 20 Private Endpoints and modest traffic, you are looking at ~$200-300/month all-in. Rounding error for an enterprise; meaningful for a small shop.

## Quotas Worth Knowing

- 1,000 Private Endpoints per VNet
- 500 Private Endpoints per service (e.g., 500 per Key Vault — but most services allow fewer)
- 250 Private DNS Zones per subscription
- 1,000 VNets per Private DNS Zone

Enterprises hit the "zones per subscription" limit first. Plan your subscription structure accordingly.

## Decision Framework

### Use Service Endpoints when

- Budget is tight and the workload does not require strict isolation
- Same-region access only
- Dev or test environments where "good enough" is genuinely good enough
- You use managed identity + SAS tokens and are comfortable with the service still having a public endpoint

### Use Private Endpoints when

- Production workloads, regulated data, anything with compliance scope
- Cross-region or hybrid (on-prem) access required
- You want to disable the public endpoint entirely
- Zero-trust network posture is a stated goal
- You need per-resource access control

## A Realistic Migration Path

Many teams inherit Service Endpoints from earlier projects. A sensible migration:

1. Inventory Service Endpoints (\`az network vnet list-endpoint-services\`)
2. Stand up centralized Private DNS Zones in the hub
3. Create Private Endpoints in parallel for each service
4. Link Private DNS Zones to client VNets
5. Test DNS resolution from clients (should return private IP)
6. Update firewall rules on the PaaS service — add Private Endpoint, plan to remove public
7. Once confident, disable public network access on the PaaS service
8. Remove Service Endpoints from subnets

Do this one service at a time. Rollback plan: re-enable public access, which is instant.

## Gotchas Worth Knowing

- **Storage firewall + Private Endpoint interaction.** If the public endpoint is enabled, firewall rules apply to public traffic only. Private traffic through a PE bypasses the firewall. Disable public access when you are fully on PE.
- **Cross-tenant Private Endpoints.** Supported, but approval flow involves the service owner — plan for human-in-the-loop in the ticket process.
- **App Service Private Endpoints are inbound only.** For outbound VNet integration, use regional VNet integration separately.
- **NSGs on PE subnets.** Historically had quirks; current guidance is to use the PE's own network policies plus an NSG on the subnet.
- **Forced tunneling and PE.** UDRs on the PE subnet can inadvertently route PE traffic through the firewall, causing health probe issues. PE subnets usually do not want the default \`0.0.0.0/0\` → firewall UDR applied.

## The Industry Trend

Microsoft invests almost exclusively in Private Endpoint capabilities now. Service Endpoints are still maintained but do not get new features. New services tend to launch with Private Endpoint support first. For any architecture decision made in 2026 or later, Private Endpoints should be the default unless you have a specific reason otherwise.

## Summary

| Factor | Service Endpoint | Private Endpoint |
|--------|------------------|------------------|
| Cost | Free | ~$7/month each |
| True privacy | No (public endpoint still exists) | Yes |
| Cross-region | No | Yes |
| Hybrid (on-prem) | No | Yes |
| DNS complexity | None | Significant (Private DNS Zones) |
| Service coverage | Limited | Broad |
| Microsoft roadmap | Mature, not growing | Active investment |

For enterprise, regulated, or compliance-sensitive workloads, Private Endpoints every time. For quick internal tools, non-sensitive data, or cost-sensitive dev environments, Service Endpoints are still a legitimate choice.

Cloud Canvas Designer supports both on the canvas — drop a Private Endpoint on any PaaS resource, link it to a subnet, and the WAF validator will flag any remaining public endpoints on sensitive services.`;

// ============================================================
// ARTICLE: zero-trust-architecture-azure
// ============================================================
articleContent['zero-trust-architecture-azure'] = `# Zero Trust Architecture on Azure: A Practical Blueprint

Zero Trust is the security model that assumes breach and verifies every request as if it originated from an untrusted network. It is not a product, not a certification, and not a single architecture diagram. It is a set of principles you apply across identity, devices, network, data, apps, and infrastructure.

This guide maps those principles to the Azure services that actually implement them, with concrete configurations rather than buzzwords.

## The Three Core Principles

Microsoft's Zero Trust model, derived from NIST SP 800-207, rests on three principles.

1. **Verify explicitly.** Authenticate and authorize based on every available signal — identity, device, location, data classification, anomalies.
2. **Use least privilege access.** Just-in-Time, Just-Enough-Access, risk-based adaptive policies, and data protection.
3. **Assume breach.** Minimize blast radius. Segment access. Verify end-to-end encryption. Use analytics to get visibility and drive threat detection.

If any of your controls assumes "users on corp network are trusted," you are not doing Zero Trust.

## The Six Pillars in Practice

### 1. Identities

Identity is the new perimeter. In a Zero Trust model, every access decision starts with "who is this, and can they prove it?"

**Foundations:**

- **Microsoft Entra ID (Azure AD)** as the single identity plane. Federate or synchronize on-prem AD.
- **Multi-Factor Authentication** mandatory for everyone, including executives, admins, and service accounts where possible.
- **Passwordless** where feasible — Windows Hello, FIDO2 keys, Microsoft Authenticator.
- **Privileged Identity Management (PIM)** for all privileged roles. No standing admin access.
- **Conditional Access policies** enforcing context-aware rules.

The mental model: nobody is an admin by default. Admin is a role you check out temporarily, with MFA, approval, and a time limit.

### 2. Endpoints (Devices)

A user is trusted only when the device they are using is trusted.

- **Intune-enrolled devices only** for access to corporate data.
- **Device compliance policies** enforcing disk encryption, OS version, EDR enabled.
- **Conditional Access requiring compliant device** for sensitive apps.
- **Defender for Endpoint** providing telemetry back to the identity signal.

Policy example: "Finance app requires managed, compliant device with MFA from trusted location. Anything else gets blocked."

### 3. Applications

Applications must authenticate users and authorize access per-request.

- **Single Sign-On via Entra ID** for all apps, including SaaS (via enterprise apps).
- **App protection policies** for mobile apps via Intune MAM.
- **Application Proxy** or **Private Link + Azure Front Door** for publishing internal apps without VPN.
- **Managed Identities** for Azure-hosted apps calling other Azure services — no secrets.

Retire VPNs as the access path to internal apps. Front Door + App Proxy + Conditional Access is the modern replacement.

### 4. Data

Classify data. Protect it based on classification. Monitor access.

- **Microsoft Purview Information Protection** for data classification and labeling.
- **Sensitivity labels** enforcing encryption and access on Office documents.
- **Data Loss Prevention (DLP)** across Microsoft 365 and endpoint.
- **Azure SQL Always Encrypted** for column-level encryption with keys you control.
- **Customer-managed keys** for Storage, Disks, SQL, Key Vault.

Classification drives protection. "Highly Confidential" data gets stricter CA policies, encryption, and monitoring than "General."

### 5. Infrastructure

Infrastructure is hostile until proven otherwise. Segment it.

- **Private Endpoints** for all PaaS services holding sensitive data.
- **Azure Firewall** with deny-all default and explicit allow rules.
- **Network Security Groups** on every subnet — default deny, allow only required ports.
- **DDoS Protection** on Tier-1 workloads.
- **Microsoft Defender for Cloud** — Secure Score + workload protection across VMs, containers, SQL, Storage, Key Vault, DNS.
- **Just-in-Time VM access** — no standing open management ports.

### 6. Network

The network is not a trusted zone. Microsegment it.

- **Hub-spoke with Azure Firewall** for east-west inspection.
- **Private endpoints** for PaaS.
- **Web Application Firewall on Front Door** for public-facing workloads.
- **Azure Bastion** for VM access — no public RDP/SSH ever.
- **ExpressRoute Private Peering + Private Link** for hybrid connectivity.
- **TLS 1.2+ enforced everywhere**; mutual TLS where feasible.

## Conditional Access: The Policy Engine

If Entra ID is the identity plane, Conditional Access is its brain. Every access request runs through CA policies that evaluate signals and make a decision.

### The minimum CA policy set every tenant should have

1. **MFA for all users** — baseline assurance.
2. **Block legacy authentication** — basic auth is a disaster.
3. **MFA for admins** with higher assurance (phishing-resistant).
4. **Require compliant device** for sensitive apps.
5. **Risk-based sign-in policy** — block high-risk logins, require MFA on medium-risk.
6. **Risk-based user policy** — force password reset on compromised users.
7. **Block access from unsupported countries** (or not explicitly required ones).
8. **Session controls for SaaS** — shorter sessions, no persistent browser cookies for sensitive apps.

### Break-glass accounts

You need 2+ cloud-only break-glass accounts excluded from CA policies. Stored in a physical safe, reviewed quarterly. These are your emergency access if Entra goes sideways or you lock yourself out with a bad policy.

## Segmentation Patterns

Zero Trust networking is microsegmentation. Three layers worth building:

1. **Identity segmentation** — least-privilege RBAC at the right scope. Not Contributor at subscription.
2. **Network segmentation** — hub-spoke, NSGs, firewall rules, private endpoints.
3. **Data segmentation** — classification, encryption, DLP, audit.

A compromised user in Zero Trust should be able to reach exactly what their role allows, on a managed device, with MFA — and every access logs a telemetry record you can review.

## Threat Detection and Response

Identity and network controls prevent. Detection and response assume breach.

- **Microsoft Sentinel** — cloud-native SIEM. Ingest Entra ID sign-in logs, Defender for Cloud alerts, firewall logs, Azure Activity Log.
- **Defender XDR** — extended detection across endpoints, identities, email, cloud apps.
- **Automated response playbooks** — disable user, revoke tokens, isolate device.
- **Threat hunting** — scheduled KQL queries against the SIEM.

The rule of thumb: alerts should come with an action you take. Alerts without runbooks are noise.

## Secrets and Certificates

Zero Trust requires machine identities to be just as tightly managed as human ones.

- **Managed Identities everywhere** — eliminate app secrets in config.
- **Key Vault for any remaining secrets** with rotation policies.
- **Certificate Services integrated with Key Vault** for automated TLS renewal.
- **No secrets in code, pipelines, or logs.** Scan for secrets in PRs with GitHub Advanced Security or an equivalent.

## Implementation Roadmap

Zero Trust is a journey. A pragmatic 12-month order of operations:

**Quarter 1 — Identity foundations**

- Enforce MFA for all users
- Block legacy auth
- Deploy PIM for admin roles
- Enable risk-based Conditional Access

**Quarter 2 — Device trust**

- Enroll all user devices in Intune
- Require compliant device for corporate apps
- Deploy Defender for Endpoint

**Quarter 3 — Network and infrastructure**

- Deploy hub-spoke with Azure Firewall
- Migrate public endpoints to Private Endpoints
- Enable JIT access on all VMs
- Turn on Defender for Cloud across subscriptions

**Quarter 4 — Data and detection**

- Deploy Purview and classify critical data stores
- Stand up Sentinel with baseline detections
- Drill incident response playbooks

Most enterprises do not finish in 12 months. That is fine — the value compounds as each layer gets stronger.

## Common Mistakes

- **Treating it as a product purchase.** You cannot buy Zero Trust. You build it.
- **Starting with the network.** Identity first. Network without identity is still a castle-and-moat.
- **Forgetting service accounts.** They run with more privilege than users and often have no MFA. Migrate to managed identities or workload identity federation.
- **Break-glass accounts not tested.** Policy changes break them. Test quarterly.
- **Over-permissive Conditional Access.** An "all users, all apps, grant" policy is not Zero Trust. Scope tightly.
- **Ignoring SaaS.** Entra ID + CA should front every SaaS app you use.

## Measuring Progress

Microsoft's Zero Trust maturity model has four levels: Traditional, Initial, Advanced, Optimal. Self-assess quarterly.

Concrete metrics to track:

- % of users with MFA enforced
- % of devices Intune-compliant
- % of privileged roles under PIM
- % of PaaS services with Private Endpoints
- Secure Score in Defender for Cloud
- Number of incidents detected via Sentinel in the past 30 days

## Final Take

Zero Trust done well is invisible to users most of the time and catastrophic to attackers when something goes wrong. It is also a cultural shift — security stops being a gate and becomes continuous verification. Budget accordingly, start with identity, and give yourself 12-18 months to reach a real baseline.`;

// ============================================================
// ARTICLE: azure-landing-zones
// ============================================================
articleContent['azure-landing-zones'] = `# Azure Landing Zones: The Foundation for Enterprise Scale

If you have ever inherited an Azure tenant and thought "how did this get so messy," the answer is almost always the same — it was built workload-first, without a landing zone.

A landing zone is the opinionated, pre-built foundation your workloads deploy into. Identity, networking, policy, logging, security, and governance are all set up before the first app lands. Done right, every new workload is secure, observable, and compliant by default. Done wrong, you rebuild your entire Azure estate after two years.

This guide walks the Cloud Adoption Framework (CAF) Enterprise-Scale Landing Zone, which is Microsoft's reference implementation and what most enterprises end up adopting.

## Why You Need Landing Zones

The three scenarios that drive adoption:

- **You are starting Azure fresh.** Landing zones save you from the "we will fix it later" debt that plagues most estates.
- **You have a messy Azure estate and are planning a re-platform.** Landing zones give you a target to migrate toward.
- **Compliance or regulatory pressure.** Landing zones package the controls auditors expect.

The alternative is every team standing up their own VNets, IAM, monitoring, and policies. You will have 47 Log Analytics workspaces and 12 different NSG conventions within 18 months.

## The Enterprise-Scale Reference Architecture

Microsoft's reference landing zone has a specific management group hierarchy and a set of platform subscriptions that host shared services. Everything else (workloads) lives under a \`Landing Zones\` management group where it inherits policy and scale patterns.

### Management Group Hierarchy

\`\`\`
Tenant Root
└── Top-level MG (e.g., "Contoso")
    ├── Platform
    │   ├── Management (Log Analytics, Automation, monitoring)
    │   ├── Connectivity (Hub VNets, Firewall, ExpressRoute)
    │   └── Identity (Domain Controllers, AADDS)
    ├── Landing Zones
    │   ├── Corp (internal workloads with no public ingress)
    │   └── Online (public-facing workloads)
    ├── Sandbox (experiments, short-lived)
    └── Decommissioned (retired subscriptions)
\`\`\`

Each level can carry policy. Policy at the top level applies everywhere; policy at \`Corp\` applies only to corp workloads. Azure Policy inheritance is how you enforce consistency across many subscriptions without manually configuring each.

### Platform Subscriptions

- **Management.** Centralized Log Analytics workspace, Azure Monitor action groups, Automation Account, Recovery Services Vault.
- **Connectivity.** Hub VNet with Azure Firewall, VPN/ExpressRoute Gateway, Azure Bastion, DNS Private Resolver, Private DNS Zones.
- **Identity.** Optional — domain controllers or Entra Domain Services if you need legacy AD integration.

Platform subscriptions are owned by the platform team. Workload teams consume them but do not modify them.

### Landing Zone Subscriptions

Workload subscriptions, one per workload or per business unit. They peer to the hub VNet, send logs to the central workspace, and inherit policy from their parent MG.

Two archetypes:

- **Corp** — no direct internet ingress. Published externally only via the hub (Front Door, WAF, App Gateway).
- **Online** — can have direct internet ingress but still routes through central logging and firewall egress.

## Core Building Blocks

### 1. Identity and Access

- Custom RBAC roles defined at the top MG
- PIM for privileged roles
- Least-privilege assignments at the right scope
- Emergency access (break-glass) accounts documented

### 2. Policy as Code

The CAF reference includes hundreds of policies. Assign these at least:

- **Deny public IP on VMs** (except online LZs)
- **Require tags** (CostCenter, Owner, Environment, Application)
- **Restrict allowed regions** — most enterprises limit to 1-3 Azure regions
- **Require diagnostic settings** on every resource, pointing to the central Log Analytics workspace
- **Deny storage accounts without HTTPS**
- **Audit VMs not using managed identity**

Deploy policies from code (Bicep or Terraform). Do not click-ops policy assignments.

### 3. Network Topology

The landing zone chooses one of two patterns:

- **Traditional hub-spoke** — one or more regional hubs with Azure Firewall
- **Virtual WAN** — managed hub-spoke, better for multi-region and SD-WAN scenarios

Spokes peer to the hub. UDRs force east-west and egress through the firewall. Private DNS Zones live in Connectivity and link to all spokes.

### 4. Management and Monitoring

- One Log Analytics workspace per environment (prod, non-prod) in the Management subscription
- Diagnostic settings on every resource via Azure Policy
- Standard alert set — VM CPU, disk, firewall denies, Defender alerts, budget alerts
- Workbooks for each workload team

### 5. Security Baselines

- Defender for Cloud enabled on every subscription
- Secure Score tracked and improved
- Microsoft Sentinel in the Management subscription ingesting from all subs
- Entra ID sign-in logs, audit logs, Azure Activity Logs all flowing into Sentinel

### 6. Tagging Strategy

A defined, enforced tagging taxonomy. Minimum tags on every resource:

- \`Environment\` (prod, dev, test)
- \`CostCenter\` (financial attribution)
- \`Application\` (logical app name)
- \`Owner\` (person or team)
- \`DataClassification\` (Public, Internal, Confidential, Highly Confidential)

Enforce via Azure Policy \`append\` and \`deny\` effects. Inherit from resource group where sensible.

## Building Your Landing Zone

You have three paths:

### Option 1: Azure Landing Zones Accelerator

Microsoft's deployable reference. Multiple flavors:

- **Bicep** — \`Enterprise-Scale\` repo on GitHub
- **Terraform** — \`terraform-azurerm-caf-enterprise-scale\` module

You run the accelerator with your parameters (org name, regions, subscription IDs) and get a production-grade landing zone in a few hours of deployment time.

### Option 2: Build Your Own

Use the CAF reference as blueprint but build with your own code. More work, more control, more risk of missing something. Only sensible if you have strong IaC talent and specific requirements the accelerator cannot meet.

### Option 3: Partner-Led

Most major partners offer landing zone implementations with customization. Good option if your team cannot dedicate the time to own it end-to-end.

## Workload Onboarding

Once the landing zone is up, onboarding a new workload is standardized:

1. Platform team creates a new subscription under \`Landing Zones/Corp\` or \`Online\`
2. Workload team gets Contributor at the subscription (not higher)
3. Subscription inherits policies — tags, diagnostic settings, region limits
4. Workload team deploys their own VNet with allocated CIDR from the plan
5. VNet peers to the hub automatically via policy deployIfNotExists
6. Logs flow to the central workspace automatically
7. Firewall rules requested via PR to platform team's repo

From "I need a new subscription" to "I can deploy my app" should be under a day with a mature landing zone.

## Subscription Strategy

The question everyone asks: how many subscriptions?

Factors that push you toward more subscriptions:

- Quota limits (cores, vCPU) — each subscription has caps
- Blast radius isolation — subscription is a strong trust boundary
- Cost attribution — one subscription per cost center is clean
- Compliance — PCI, HIPAA workloads often want isolated subscriptions

Factors that push toward fewer:

- Management overhead per subscription
- Reservation utilization (RIs apply at subscription level unless shared scope)
- Inter-service communication complexity

A typical enterprise ends up with 20-100 subscriptions: 3-5 platform subscriptions, and one per major workload or workload family, split by environment.

## Common Mistakes

- **No landing zone.** "We will add it later" becomes tech debt forever.
- **Skipping management group hierarchy.** All subscriptions peer, no inheritance, no central control.
- **One big subscription.** Quotas bite, blast radius is huge, cost attribution is impossible.
- **Policy via click-ops.** Drifts immediately, not reproducible.
- **No break-glass process for platform team.** When the platform team loses access, everyone suffers.
- **Over-restrictive from day one.** Teams bypass the landing zone because it blocks their work. Land with pragmatic policies and tighten over time.

## Maturity Model

Landing zones are not one-and-done. They evolve.

**Level 1 — Foundational.** Management group hierarchy, centralized logging, baseline policy, hub-spoke networking. You are in production.

**Level 2 — Governed.** Tagging enforced, Defender Secure Score > 70, policy assignments cover the top 20 controls, workload onboarding documented.

**Level 3 — Automated.** Landing zone deployed from code, subscription vending automated via pipeline, policy changes via PR.

**Level 4 — Optimized.** FinOps integrated, Sentinel mature, zero-trust network fully rolled out, regular maturity reviews.

Most enterprises live at Level 2 for a long time. That is fine — the return on reaching Level 4 is diminishing, but the return on reaching Level 2 is massive.

## Landing Zones and Cloud Canvas Designer

Cloud Canvas Designer's template gallery includes landing-zone-aligned patterns — hub-spoke with all the right subnets, NSG defaults, Private DNS Zone placements, and policy metadata — so when you design a workload diagram, the foundation is already correct. Export to Bicep or Terraform and drop into your landing zone repo.

## Closing

Landing zones are not glamorous. They are foundational. The teams that invest in them ship faster and more safely over a 2-3 year horizon. The teams that skip them rebuild their Azure estate from scratch after realizing they cannot scale the mess. If you are starting fresh, start with the landing zone. If you inherited chaos, plan a landing zone migration. Either way, the foundation is the work.`;

// ============================================================
// ARTICLE: sql-vs-cosmos-vs-postgres
// ============================================================
articleContent['sql-vs-cosmos-vs-postgres'] = `# Azure SQL vs Cosmos DB vs PostgreSQL: Choosing Your Database

Picking a database is the highest-stakes decision in most architectures. Every other choice is reversible within a sprint; swapping a database is typically a multi-month effort. Azure's three flagship database services — Azure SQL, Cosmos DB, and PostgreSQL — cover most workloads, but they solve genuinely different problems.

Here is a practical framework for picking the right one, with workload patterns, pricing shape, and real-world anti-patterns.

## The Three in One Sentence Each

- **Azure SQL** — managed SQL Server for OLTP workloads that need strong transactional consistency and relational guarantees.
- **Azure Cosmos DB** — globally distributed NoSQL for massive scale, low-latency reads, and tunable consistency.
- **Azure Database for PostgreSQL** — managed PostgreSQL for teams that want the open-source gold standard with strong tooling and extensions.

All three are "managed." Azure handles backup, patching, HA, and scaling mechanics. You own schema and queries.

## What Workloads Fit Each

### Azure SQL fits when

- Relational schema with foreign keys, joins, transactions
- Strong consistency required across multiple rows
- Existing team expertise is T-SQL, SSIS, SSRS
- You need mature tooling for reporting (Power BI first-class)
- Workload is OLTP or mixed OLTP + light analytical
- Up to a few TB of data

Classic fits: e-commerce orders, CRM, ERP, financial records, healthcare claims.

### Cosmos DB fits when

- Global distribution with sub-10ms reads from multiple regions
- Unpredictable or very high write throughput (10K+ writes/sec)
- Document, key-value, graph, or column-family access patterns
- Schema varies by document (no rigid relational structure)
- Multi-region active-active required
- Willing to design around the consistency model and partition strategy

Classic fits: IoT telemetry, session stores, user profiles for global apps, gaming leaderboards, product catalogs for global e-commerce, real-time personalization.

### PostgreSQL fits when

- Relational workload but Azure SQL's licensing or syntax is a blocker
- You need extensions (PostGIS for geospatial, TimescaleDB for time-series, pg_vector for AI)
- Cross-cloud portability matters
- Team already on Postgres
- Open-source preference

Classic fits: geospatial apps, time-series, content platforms, anything using pg_vector for RAG applications, open-source SaaS.

## Consistency Models

This is the hidden trap in database choice.

### Azure SQL

Strong consistency by default. ACID transactions. Serializable isolation available but expensive; Read Committed is the practical default. If you need multi-row atomicity, SQL is the obvious choice.

### Cosmos DB

Five consistency levels — Strong, Bounded Staleness, Session, Consistent Prefix, Eventual. Most apps use Session (read-your-writes). Global strong consistency is possible but kills latency and throughput. The trade-off is explicit.

### PostgreSQL

Same as Azure SQL — strong consistency within a region, with replication options. Logical replication for hybrid or cross-region scenarios.

## Scale Patterns

### Azure SQL scale

- **Single DB up to Business Critical 128 vCore** — a lot of capacity, expensive
- **Hyperscale** — up to 100 TB with fast backups and read replicas
- **Elastic Pools** — share compute across multiple databases
- **Read replicas** for scale-out reads
- **Sharding with Elastic Database Tools** — supported but manual

Vertical scaling is straightforward; horizontal is manual. Good to a few TB; hard beyond 10 TB without Hyperscale.

### Cosmos DB scale

Horizontal from day one. You pick a partition key; Cosmos shards transparently. Throughput is measured in Request Units (RU/s) which you can scale to millions of RU/s. Designed for petabyte-scale workloads.

The catch: partition key choice is critical and hard to change. Get it wrong and you end up with hot partitions that throttle.

### PostgreSQL scale

- **Single server** — standard managed Postgres, up to ~32 TB
- **Flexible Server** — more control, better performance tuning
- **Azure Cosmos DB for PostgreSQL** (formerly Citus) — distributed Postgres with horizontal sharding for multi-TB OLTP

For most workloads, Flexible Server is enough. When you outgrow it, Cosmos for Postgres is the native scale-out path.

## Pricing Shapes

### Azure SQL pricing

Compute + storage model. vCore tiers (General Purpose, Business Critical, Hyperscale). Storage priced per GB. Backup storage included up to DB size, then per-GB.

Rough pricing:

- GP_S_Gen5_2 (serverless, 2 vCore, 32 GB max): ~$190/month
- GP_Gen5_4 (provisioned, 4 vCore): ~$580/month
- BC_Gen5_8 (Business Critical): ~$3,500/month
- HS_Gen5_4 (Hyperscale): ~$600/month + storage

Licensing: \`vCore + SA\` or \`License Included.\` Azure Hybrid Benefit can save 30-55%.

### Cosmos DB pricing

Pay for provisioned throughput (RU/s) and storage ($0.25/GB/month).

- 1,000 RU/s = ~$60/month (per region, single-master)
- 10,000 RU/s = ~$600/month
- Autoscale has a 10% overhead vs provisioned at peak
- Serverless: pay per RU consumed, good for spiky workloads
- Multi-region writes: multiplies cost by region count

Cosmos is cheap for low-scale and for very well-designed high-scale workloads. It is expensive when poorly designed (hot partitions or overly generous RU provisioning).

### PostgreSQL pricing

Similar to Azure SQL — vCore + storage.

- B-series burstable (1 vCore): ~$35/month
- General Purpose D2s_v3 (2 vCore): ~$175/month
- Memory Optimized E4s_v3 (4 vCore): ~$480/month

Generally 20-30% cheaper than Azure SQL equivalents. No licensing fees.

## A Workload Sizing Example

**Scenario:** A SaaS product with 100K tenants, each with transactional data (orders, customers). 500 GB total. 100 writes/sec average, 2,000 reads/sec average. Multi-region presence required for latency.

**Azure SQL:** Hyperscale with read replicas in each region. ~$1,500-2,500/month. Relational model fits well. Strong consistency.

**Cosmos DB:** Partition by tenantId. ~20,000 RU/s across 2 regions + storage. ~$2,400/month. Sub-10ms reads globally. Need to design around document model.

**PostgreSQL Flexible Server:** Primary in one region, read replicas in others. ~$1,200-1,800/month. Strong ecosystem.

For this workload, any of the three works. Choose based on team expertise, consistency requirements, and how truly global the users are.

## Change the scenario: IoT telemetry at 50K writes/sec

**Azure SQL:** Will struggle. Hyperscale can do it with careful partitioning, but it is not what SQL is optimized for. Not a natural fit.

**Cosmos DB:** Designed for this. Partition by deviceId (or deviceId + dateHour for time-bucketed). 100K+ RU/s. ~$6,000+/month but scales cleanly.

**PostgreSQL with TimescaleDB:** Good option. Time-series extension handles high-write workloads well. Single-region primary with read replicas.

For high-write telemetry, Cosmos or PostgreSQL+TimescaleDB. Not Azure SQL.

## Change the scenario: Content platform with geospatial search

**Azure SQL:** Has spatial types but they are not the strongest.

**Cosmos DB:** Geospatial queries supported but not specialized.

**PostgreSQL with PostGIS:** The gold standard for geospatial. Clearly the right choice.

## Anti-Patterns

### Azure SQL anti-patterns

- Storing JSON blobs and querying inside them as the primary access pattern (use Cosmos)
- Very high-write telemetry (> 10K/sec sustained)
- Genuinely global active-active writes
- Graph-traversal-heavy queries (consider Cosmos Gremlin API)

### Cosmos DB anti-patterns

- Complex multi-document transactions (supported within a partition only)
- Ad-hoc SQL-style joins
- Heavy analytical queries (use Synapse Link or export to Fabric)
- Small, simple apps where strong consistency is needed and Cosmos complexity is unwarranted
- Wrong partition key — fix this on day 1 or live with pain forever

### PostgreSQL anti-patterns

- Treating it like a NoSQL store for schemaless data
- Ignoring the connection limit — use PgBouncer
- Running the same instance 24/7 for dev/test — use serverless SQL or auto-pause

## Migration Considerations

- **From Azure SQL to Cosmos or vice versa:** Significant rearchitecture. Different query languages, different consistency semantics, different operational patterns.
- **From self-hosted SQL Server to Azure SQL:** Azure DMS makes this straightforward. Migration assistant flags incompatibilities.
- **From self-hosted Postgres to Azure Postgres:** pg_dump/restore or logical replication. Trivial compared to cross-engine migrations.
- **From MySQL or Oracle to Azure:** Possible but always more work than expected. Budget 2-3x the engineering you think you need.

## The Polyglot Pattern

Most mature architectures use more than one:

- Azure SQL for transactional core (orders, customers)
- Cosmos DB for user session state, product catalog read model, telemetry
- PostgreSQL for geospatial features or analytics workflows

This is fine if you draw the seams carefully. Each data store owns its domain, and cross-store consistency is handled with eventual consistency patterns (event-driven updates, outbox pattern).

## Operational Considerations

- **Backup:** All three have automated backup. Test restore at least twice a year.
- **HA:** Azure SQL Business Critical and PostgreSQL Flexible Server (HA enabled) give you zone-redundant HA. Cosmos is multi-region by design.
- **Monitoring:** Query Performance Insight for SQL and Postgres. Cosmos has Metrics Explorer + Live Metrics.
- **Cost monitoring:** RU consumption for Cosmos (can spike if queries are bad). vCore + DTU metrics for SQL.

## Final Recommendation

- Default to **Azure SQL** if the workload is relational, transactional, and not massively write-heavy.
- Default to **Cosmos DB** if global distribution or extreme write scale is a hard requirement.
- Default to **PostgreSQL** if you are open-source-first, need extensions, or your team is already on Postgres.

Do not pick a database because it is trendy. Pick it because it matches your access patterns and your team. The cost of switching later is usually 10x the cost of choosing right the first time.`;

// ============================================================
// ARTICLE: entra-id-conditional-access
// ============================================================
articleContent['entra-id-conditional-access'] = `# Entra ID (Azure AD) Conditional Access: The Missing Manual

Conditional Access is the most powerful identity control Microsoft offers and one of the most commonly misconfigured. It is the policy engine that decides, on every sign-in, whether to grant access, block it, require MFA, require a compliant device, or limit what the session can do.

This guide covers how Conditional Access actually works, the policies every tenant should have on day one, and the patterns that mature organizations converge on.

## How CA Works in 90 Seconds

Every authentication attempt against Entra ID triggers Conditional Access evaluation. CA looks at signals and decides.

**Signals it evaluates:**

- Who is signing in (user, group, role)
- What app are they accessing
- Where from (IP, location, named locations)
- What device (compliant, Intune-joined, Entra-joined)
- Risk signals (user risk, sign-in risk from Identity Protection)
- Client app (browser, modern auth app, legacy auth)
- Session characteristics (token age, authentication method)

**Decisions it can make:**

- Grant access
- Block access
- Require MFA
- Require compliant or hybrid-joined device
- Require password change
- Require approved client app
- Apply session controls (shorter sessions, app-enforced restrictions)

Policies are assigned → conditions are evaluated → the most restrictive grant requirement wins (all policies must grant) or any block wins (one block is enough).

## The Critical First Policies

Every tenant should have these on day one. Not in 6 months. Day one.

### Policy 1: Block Legacy Authentication

Legacy auth (IMAP, POP, basic auth SMTP) cannot do MFA. It is the primary vector for password spray attacks. Block it.

- **Users:** All users (exclude break-glass accounts)
- **Apps:** All cloud apps
- **Client apps:** Exchange ActiveSync + Other clients (legacy)
- **Grant:** Block access

Before enabling, run a sign-in log report to identify legacy auth usage. You may find an old service account you did not know was using it. Fix those, then enable.

### Policy 2: Require MFA for All Users

Blanket MFA requirement.

- **Users:** All users (exclude break-glass)
- **Apps:** All cloud apps
- **Client apps:** All
- **Grant:** Require multi-factor authentication

Use Microsoft Authenticator (push) as the primary method. Number matching is now default — good.

### Policy 3: Require MFA for Admin Roles

Privileged roles get stricter treatment.

- **Users:** Directory roles (Global Admin, Privileged Role Admin, Security Admin, User Admin, Exchange Admin, SharePoint Admin, Cloud App Admin, Conditional Access Admin, plus others)
- **Apps:** All cloud apps
- **Grant:** Require MFA + Require compliant device
- **Session:** Sign-in frequency 4 hours

Admins should re-authenticate more often and only from managed devices.

### Policy 4: Block High-Risk Sign-Ins

Microsoft's Identity Protection assigns sign-in risk scores (atypical travel, unfamiliar sign-in, leaked credentials, etc.).

- **Users:** All users
- **Apps:** All cloud apps
- **Conditions:** Sign-in risk = High
- **Grant:** Block access

Also consider: Medium risk → require MFA + password change.

### Policy 5: Block High-Risk Users

User risk differs from sign-in risk — it is a persistent flag on the user until remediated.

- **Users:** All users
- **Apps:** All cloud apps
- **Conditions:** User risk = High
- **Grant:** Block access OR require password change + MFA

### Policy 6: Require Compliant Device for Corporate Data

Gates access to corporate apps behind Intune compliance.

- **Users:** All users
- **Apps:** Office 365 (or specific apps like SharePoint, Teams, Exchange Online)
- **Grant:** Require compliant device OR Entra hybrid-joined device

Roll this out gradually. Start with a test group, expand.

### Policy 7: Block Unsupported Countries

Geofence out the regions you do not do business in.

- **Users:** All users
- **Apps:** All cloud apps
- **Conditions:** Locations — any location except a named location "Supported Countries"
- **Grant:** Block access

Named Locations let you define "Supported Countries" as a country list. Update quarterly as the business changes.

## Break-Glass Accounts

Before you deploy any CA policy, create break-glass accounts.

**Requirements:**

- 2 cloud-only accounts with Global Administrator role
- Unique, complex passwords stored in a physical safe or privileged vault
- Excluded from every CA policy
- Different MFA phone numbers from any real person
- Monitored — alert on any sign-in

If your CA policies lock everyone out (yes, it has happened at name-brand companies), break-glass is how you get back in. If you skip this step, you will regret it.

## Policy Design Patterns

### Ring deployment

Never apply a new policy to all users immediately. Ring it out:

- **Ring 0:** Security team (10 people)
- **Ring 1:** IT and pilot users (100 people)
- **Ring 2:** Early adopters (1,000 people)
- **Ring 3:** All users

Each ring gets 1-2 weeks of monitoring before the next ring.

### Report-Only mode

New policies can be created in Report-Only mode, which logs what would have happened without enforcing. Run in Report-Only for 1-2 weeks, review sign-in logs for \`Would have applied\` entries, fix edge cases, then enable.

### Exclusion management

Every CA policy should have a documented exclusion list with expiry dates. "Temporarily exclude user X until they get their hardware token" becomes a permanent security gap if you do not track it.

Use an Access Package or scheduled PIM assignment so exclusions auto-expire.

## Session Controls

Beyond grant/block, CA can modify the session:

### Sign-In Frequency

Forces re-auth after N hours. Default is 90 days (long). For sensitive apps, 1-4 hours.

### Persistent browser session

Allow or disallow "stay signed in?" prompts. Disallow on shared devices.

### App-enforced restrictions

SharePoint and Exchange enforce limited browser access (no download, no print) based on CA decision. Great for unmanaged device scenarios.

### Continuous Access Evaluation (CAE)

Not a policy you configure — a capability you enable at tenant level. With CAE, token revocation is near-real-time (sub-minute) instead of waiting for token expiry (up to an hour). Critical for responding to compromised accounts.

## Workload Identities

CA for workload identities (service principals and managed identities) is a newer capability. Policies can restrict:

- Which IPs a service principal can authenticate from
- Which resources it can access
- Risk-based blocks for service principals

Apply to app registrations that access APIs on behalf of users. Most tenants have hundreds of app registrations and zero controls on them — fix this.

## Named Locations

Define trusted and blocked IP ranges:

- **Trusted:** corporate network CIDRs, VPN egress IPs
- **Blocked:** countries you never operate in
- **MFA Trusted:** (legacy) IPs that bypass MFA — AVOID; defeats the purpose of MFA

Trusted Named Locations are useful but should not be the primary trust signal in a zero-trust world. Device compliance is stronger.

## Monitoring and Troubleshooting

### Sign-in logs

Every sign-in shows which CA policies applied, which conditions matched, and the result. Review regularly.

Key things to look for:

- Policies with high "failure" counts (users cannot complete MFA)
- Policies that are never "applied" (wrong scope or condition)
- Sign-ins from unexpected countries
- Service principal sign-ins to high-privilege APIs

### What-If tool

The CA What-If tool lets you simulate a sign-in and see which policies would apply. Use it before enabling any policy.

### Gap analysis

Microsoft provides a Conditional Access gap analyzer workbook in Sentinel / Log Analytics. Shows what you are missing vs best practice.

## Common Mistakes

- **No break-glass accounts.** Catastrophic on the day you lock yourself out.
- **"All users, all apps, require MFA" as the only policy.** MFA is great but you still need device compliance, risk-based, and legacy auth blocking.
- **Trusted IP-only bypass.** Corporate network is not a trust signal in 2026.
- **Never reviewing exclusions.** "Temporary" becomes permanent.
- **Too many policies.** 5-10 well-designed policies beat 40 overlapping ones. Simplify.
- **Forgetting external users (guests).** Apply policies to guests too. They are common compromise vectors.

## Conditional Access Plus Privileged Identity Management

CA is powerful; PIM is its partner for admin access.

- CA enforces "admin access requires MFA + compliant device + sign-in frequency 4h"
- PIM enforces "you are not an admin unless you activate, with approval, for a time-limited window"

Together they make standing admin privileges effectively zero. Best-in-class tenant configuration.

## Rollout Playbook

A pragmatic 6-week rollout for a greenfield tenant:

**Week 1:** Create break-glass, enable Security Defaults if not already
**Week 2:** Report-Only mode for Block Legacy Auth policy
**Week 3:** Enforce Block Legacy Auth after fixing findings
**Week 4:** Report-Only MFA for admins → enforce. Report-Only MFA for all users → ring 0/1
**Week 5:** Enforce MFA all users (rings 2/3). Deploy risk-based policies.
**Week 6:** Add device compliance requirement for sensitive apps. Session controls for sensitive apps.

After 6 weeks you have a solid Zero Trust identity baseline.

## Licensing Note

Full CA requires Entra ID P1 (Microsoft 365 E3/E5 or Entra ID P1 standalone). Risk-based policies and Identity Protection require Entra ID P2. Budget for the licenses — the security ROI is enormous.

## Final Word

Conditional Access, done well, is the control that stops most attacks before they matter. Done poorly, it locks out legitimate users and creates security theater. Invest the time to design it, test it, and review it. It is the single highest-impact security feature Microsoft offers for identity — and for most workloads, identity is the battle.`;

// ============================================================
// ARTICLE: observability-azure-monitor
// ============================================================
articleContent['observability-azure-monitor'] = `# Azure Observability: Monitor, Log Analytics, App Insights Explained

Observability in Azure is a stack of services that overlap, confuse, and get rebranded every few years. If you have ever wondered what the difference is between Azure Monitor, Log Analytics, Application Insights, and "metrics," you are in good company.

This guide untangles the stack, explains when to use what, and gives you a reference for designing observability into a real production workload.

## The Stack in One Diagram (in Words)

At the top: **Azure Monitor** is the product family — the umbrella brand covering everything.

Under it:

- **Metrics** — numeric time-series, written by every Azure resource automatically. Low latency, fixed schema.
- **Logs** — structured log records written to a Log Analytics workspace. Queried with Kusto Query Language (KQL).
- **Application Insights** — APM that records traces, requests, dependencies, exceptions from your app code. Writes to a Log Analytics workspace under the hood now.
- **Alerts** — rules that evaluate metrics or logs and fire when something matches.
- **Workbooks** — interactive dashboards built on metrics + logs + Azure Resource Graph.
- **Action Groups** — the targets (email, webhook, Logic App, auto-scale) that alerts invoke.

Metrics and logs are the primitive data types. Everything else sits on top.

## Metrics vs Logs vs Traces

### Metrics

Numeric, time-series, low-cardinality. Platform-emitted for free. Examples: CPU %, disk IOPS, request count, queue depth.

**Strengths:** cheap, fast queries, great for dashboards and auto-scale, near-real-time (1-minute granularity).

**Weaknesses:** cannot attach arbitrary dimensions, limited historical retention (93 days by default for platform metrics).

Use metrics for: dashboards, alerts on known conditions, auto-scale rules.

### Logs

Structured records with arbitrary fields. Ingested into Log Analytics workspaces. Queried with KQL.

**Strengths:** rich detail, cross-resource queries, long retention, flexible schema, joins across tables.

**Weaknesses:** more expensive than metrics (per-GB ingestion), higher query latency.

Use logs for: investigation, post-incident analysis, audit, anything you need after the fact.

### Traces

Distributed traces showing a request's journey across services. Emitted by your app via the OpenTelemetry SDK or Application Insights SDK.

**Strengths:** root cause analysis for performance issues, service map, dependency discovery.

**Weaknesses:** instrumentation cost (code, attention), can balloon in volume.

Use traces for: latency analysis, debugging microservice interactions, mapping service dependencies.

## Log Analytics Workspaces

The workspace is the logical container for logs. Pricing is per ingested GB + retention.

### Design principles

- **One workspace per environment, not per workload.** Cross-team query matters. Consolidated operations are saner.
- **Centralize in the platform / management subscription.** Workload subs stream to it.
- **Region matters** — cross-region log ingestion has cost and latency implications. One workspace per region if you are multi-region.
- **Use table-level retention** to give different data types different retentions (audit logs longer, container stdout shorter).

### Ingestion tiers

- **Analytics logs** — full KQL, default retention up to 2 years, cost $2.76/GB
- **Basic logs** — limited KQL (filter and project, no join or aggregation), 8-day retention, cost ~$0.50/GB
- **Archive** — 0 query access without restoration, ~$0.02/GB/month
- **Auxiliary logs** — similar to basic, newer

Use basic logs for firewall logs, WAF logs, verbose audit logs you rarely query. Use analytics for everything you routinely investigate.

### Commitment tiers

If you ingest > 100 GB/day, commitment tiers discount up to 30%. Do not overcommit — underutilized commitments still bill.

## Application Insights

APM for your apps. Records requests, dependencies, exceptions, custom events, traces.

### Instrumentation

- **.NET, Java, Node.js, Python** — SDK auto-instruments HTTP, databases, messaging
- **OpenTelemetry** — the strategic direction; App Insights ingests OTel natively
- **Auto-instrumentation** for App Service, Functions, AKS without code changes in many cases

### Key tables in the workspace

- \`requests\` — incoming HTTP calls
- \`dependencies\` — outgoing calls (databases, APIs, queues)
- \`exceptions\` — thrown exceptions
- \`traces\` — log lines
- \`customEvents\` — application-defined events
- \`customMetrics\` — application-defined metrics
- \`availabilityResults\` — synthetic tests
- \`browserTimings\` — real user monitoring

### Sampling

By default, App Insights samples at the SDK to control cost. Adaptive sampling keeps the stat profile intact but drops individual records. For debugging rare issues, disable sampling on critical paths or use Preserve for Key Events.

## KQL Essentials

Kusto Query Language is the query language for Log Analytics and App Insights. Here is the 10% of KQL that covers 90% of queries.

### Basic shape

\`\`\`
TableName
| where TimeGenerated > ago(1h)
| where field == "value"
| project column1, column2
| summarize count() by bin(TimeGenerated, 5m)
| render timechart
\`\`\`

### Common patterns

**Top 10 slowest requests:**

\`\`\`
requests
| where timestamp > ago(24h)
| top 10 by duration desc
| project timestamp, name, duration, resultCode
\`\`\`

**Error rate over time:**

\`\`\`
requests
| where timestamp > ago(24h)
| summarize errors=countif(success==false), total=count() by bin(timestamp, 5m)
| extend errorRate = todouble(errors) / total
| render timechart
\`\`\`

**Correlate a failure across services:**

\`\`\`
union requests, dependencies, exceptions
| where timestamp > ago(1h)
| where operation_Id == "abc123"
| order by timestamp asc
\`\`\`

### KQL productivity tips

- Use \`project\` early to shrink the working set
- Use \`where\` before \`summarize\`, not after
- Use \`let\` for parameters and reusable clauses
- \`search *\` is expensive — avoid in scheduled queries

## Alerting

Three types of alerts in Azure Monitor:

### Metric alerts

Evaluate a metric against a threshold. Near-real-time. Cheap. Use for CPU > 90%, queue depth > 1000, etc.

### Log alerts

Run a KQL query on a schedule, fire when results match. More flexible. Costs per evaluation.

### Activity log alerts

Fire on Azure resource changes (VM deleted, RBAC role assigned). Use for audit and compliance.

### Alert design principles

- **Every alert has a runbook.** A pager at 3 AM with no instructions is a burnout factory.
- **Alert on symptoms, not causes.** "Checkout latency > 5s" is a symptom users care about. "Specific CPU > 90%" is a cause that may or may not matter.
- **Set severity based on business impact.** Sev-1 is customer-affecting. Sev-4 is informational. Do not make everything Sev-1.
- **Auto-close alerts when conditions clear.** Otherwise dashboards lie.
- **Avoid alert storms.** One root cause fires 50 downstream alerts. Use alert groups or correlation rules.

### Action Groups

The receiver of alerts. Email, SMS, voice call, Azure Function, Logic App, webhook, auto-scale, ITSM integration.

Design action groups per severity and per ownership. \`AG-prod-sev1-payments\` means the payments team's oncall for sev-1 alerts.

## Workbooks and Dashboards

Workbooks are interactive reports. They combine metrics, logs, Azure Resource Graph, parameters. Much more powerful than classic dashboards.

### Key workbooks to build early

- **Infrastructure health** — VMs, disks, networks at a glance
- **Application health** — per-service request rate, latency, error rate (RED metrics)
- **Cost overview** — top spenders, anomalies
- **Security overview** — Defender alerts, CA failures, suspicious sign-ins

Do not reinvent — start from Microsoft's gallery workbooks and customize.

## The Reference Observability Design

A starter observability architecture for a typical production workload:

1. **Log Analytics workspace** in the Management subscription (one per environment).
2. **Diagnostic settings enabled on every Azure resource** via Azure Policy \`deployIfNotExists\`. Platform logs + metrics to the workspace.
3. **Application Insights** per app, linked to the workspace (workspace-based mode).
4. **Container Insights** on AKS for cluster-level telemetry.
5. **Defender for Cloud** streaming security events to the workspace.
6. **Sentinel** on the same workspace for SIEM + threat detection.
7. **Alert baseline:** 20-30 alerts covering the key failure modes, each with a runbook.
8. **Workbooks** for each team's top-level health.
9. **Daily digest email** to team leads summarizing incidents, cost, and drift.

Teams reach this in 3-6 months. Start with logs and a couple of alerts; grow toward this over time.

## The SLO Mindset

Sophisticated observability serves Service Level Objectives (SLOs). Pick a few user-facing metrics that matter:

- **Availability** — \`successful requests / total requests\` over 30 days
- **Latency** — p95 response time under N ms
- **Throughput** — requests/sec the system sustains without degrading

Set a target (e.g., 99.9% availability = 43 minutes of allowed downtime per month — your "error budget"). Alert when you are burning error budget faster than expected.

SLOs turn observability from "let's watch everything" into "let's protect what matters."

## Cost Control for Observability

Observability is usually 3-7% of infra spend in mature orgs. Keep it under control:

- Use basic logs for high-volume, rarely-queried data
- Apply adaptive sampling in App Insights
- Drop verbose categories at ingestion (diagnostic settings can filter)
- Consolidate workspaces
- Archive old logs instead of deleting
- Review monthly; dashboards that hit expensive queries drive cost

## Common Mistakes

- **Too much data, wrong data.** Ingest everything, cost balloons, no signal. Start with the basics: requests, dependencies, exceptions, key platform metrics.
- **Per-team workspaces.** No cross-service view. Consolidate.
- **Alerts without runbooks.** Pager fatigue.
- **Dashboards that no one looks at.** If it is not part of a ritual (standup, on-call handoff), delete it.
- **Ignoring the Azure platform metrics.** You get them free; use them.
- **Instrumenting only infra, not apps.** You see VMs; you cannot tell if customers are happy.

## The Next Wave

Microsoft is investing heavily in OpenTelemetry-native experiences. New apps should instrument with OTel SDKs and send to App Insights. Prometheus/Grafana on AKS is also fully supported as an alternative for teams that already have that expertise.

Azure Managed Grafana and Azure Managed Prometheus are legitimate options for teams coming from CNCF ecosystems. Pick the stack your team will actually use.

## Cloud Canvas Designer and Observability

Cloud Canvas Designer's WAF validator flags missing diagnostic settings on your diagram resources and warns when there is no central Log Analytics workspace. Catch observability gaps at design time instead of during the first incident.

## Final Word

Good observability is not the number of dashboards or the volume of logs. It is whether the team can answer three questions fast: "is the system healthy?", "if not, what broke?", and "did our last change cause this?" Invest in the observability that answers those three, and skip the rest.`;

// ============================================================
// ARTICLE: onprem-to-azure-migration
// ============================================================
articleContent['onprem-to-azure-migration'] = `# On-Prem to Azure Migration: 6 Rs, Tools, and a 90-Day Playbook

Cloud migration is one of the most misunderstood projects in enterprise IT. It gets sold as "lift and shift" and turns into an 18-month modernization. It gets sold as "modernize everything" and turns into nothing shipping for two years. Both extremes are failure modes.

The right migration is a structured one — understand each workload, pick the right path per workload, sequence the moves, and measure the value. This guide walks the standard 6 Rs framework, the Azure tooling, and a pragmatic 90-day playbook.

## The 6 Rs — A Framework, Not a Prescription

Every workload you migrate gets one of these dispositions:

1. **Rehost** — "lift and shift." Move VMs to Azure IaaS unchanged.
2. **Replatform** — small changes for cloud benefits (e.g., move SQL Server VM to Azure SQL MI).
3. **Refactor / Rearchitect** — meaningful code changes to take advantage of PaaS and cloud-native patterns.
4. **Rebuild** — full rewrite as cloud-native.
5. **Replace** — retire the in-house app, buy SaaS.
6. **Retain** — keep it on-prem (for now or forever).

Most real migrations are a mix. A typical enterprise portfolio:

- 40-60% Rehost (move quickly, modernize later)
- 20-30% Replatform (low-effort wins on databases, web servers)
- 10-15% Refactor/Rearchitect (strategic apps)
- 5% Rebuild (greenfield replacements)
- 5-10% Replace (SaaS substitution)
- 5-10% Retain (legacy, compliance, sunset candidates)

## Starting Point: Discovery and Assessment

You cannot migrate what you have not mapped.

### Azure Migrate

The primary tool. One discovery appliance scans your on-prem environment and produces:

- Server inventory (specs, utilization, OS, applications)
- Dependency map (which servers talk to which)
- Cloud readiness per server (supported/not, issues, recommendations)
- Right-sized Azure SKU recommendations based on actual utilization
- Monthly cost estimates

Run Azure Migrate Discovery for at least 30 days before making sizing decisions. Short samples miss monthly jobs and quarterly peaks.

### Dependency mapping

Critical. You do not want to move a VM and discover it depends on three others you left behind. Azure Migrate's agentless dependency analysis shows connections for 30 days.

### Application portfolio rationalization

Business question, not technical. For each app:

- Is it strategic or commodity?
- Does it have a clear owner?
- Is it still used? (Many enterprises find 20%+ of apps are zombie apps.)
- When does the vendor support EOL?
- Does a SaaS equivalent exist at acceptable cost?

The answer drives the R disposition.

## Migration Tooling by Workload Type

### Servers (Windows and Linux)

**Azure Migrate: Server Migration.** Replication-based. Continuously replicates VM disks to Azure, then cuts over with minimal downtime (typically 5-30 minutes).

Works for VMware, Hyper-V, AWS EC2, GCP, physical. Near-universal coverage.

### Databases

**Azure Database Migration Service (DMS).** Supports SQL Server → Azure SQL DB / MI, MySQL → Azure Database for MySQL, Postgres → Azure Database for Postgres, Oracle → Azure SQL / Postgres.

Two modes:

- **Offline** — short downtime window, full cutover
- **Online** — continuous sync, minimal downtime cutover

Online is critical for production databases with 24x7 demands.

### Web apps

**App Service Migration Assistant.** Scans IIS/Apache/Tomcat workloads, flags compatibility issues, automates the move to App Service.

For Windows web apps, it is surprisingly automated. Linux and Tomcat require a bit more care.

### File shares

**Azure File Sync** for Windows File Servers. Tiers files to Azure Files with local caching. Transparent to users.

For large unstructured data (SharePoint, home directories), consider Azure File Sync or full migration to SharePoint Online / OneDrive.

### Storage

**AzCopy, Storage Migration Service, Data Box.** Choose by volume and bandwidth.

- Under 1 TB over decent internet — AzCopy
- 1-100 TB — Storage Migration Service or AzCopy depending on pattern
- > 100 TB or slow network — Data Box (Microsoft ships you a hard drive, you fill it, send it back)

### Active Directory

Most enterprises connect on-prem AD to Entra ID via Entra Connect (formerly Azure AD Connect). Keeps SSO working during and after migration. Do not migrate AD — extend it.

## The 90-Day Playbook

### Days 1-15: Foundation

**Goal:** Landing zone ready, team trained.

- Deploy Azure Landing Zone (see the Landing Zones article)
- Establish naming and tagging conventions
- Stand up the target network (hub-spoke, ExpressRoute or VPN)
- Set up the management subscription with Log Analytics
- Turn on Defender for Cloud
- Train the team on Azure Migrate, ARM/Bicep/Terraform, networking

Do not skip this. Migrating into an unprepared tenant creates debt you will regret.

### Days 15-30: Discovery

**Goal:** Complete inventory with dependency mapping.

- Deploy Azure Migrate appliance
- 30-day discovery window
- Parallel: business owner interviews to confirm app portfolio
- Rationalize — kill zombie apps, identify SaaS candidates
- Map dependencies; define migration waves

Output: a prioritized list of workloads with disposition and wave assignment.

### Days 30-45: Pilot

**Goal:** Migrate 2-3 representative workloads end-to-end. Learn.

Pick workloads that exercise different paths:

- One Windows web app + SQL backend → Replatform to App Service + Azure SQL MI
- One Linux VM cluster → Rehost
- One file share → Azure File Sync

Migrate, validate, do a mock cutover, actually cutover. Document everything. This is where you discover the gotchas you cannot find any other way.

### Days 45-75: Wave 1

**Goal:** Migrate the first wave of production workloads — typically 15-30 servers.

Pick the low-risk, high-value workloads. Dev and test environments first, then production.

Each wave has a standard sequence:

1. Replication setup (1-2 weeks of continuous sync)
2. Test migration (a cutover into a separate VNet for validation)
3. Stakeholder sign-off
4. Production cutover (weekend or scheduled window)
5. Hypercare (48 hours of enhanced monitoring)
6. Decommission source

A wave of 20 servers typically takes 4-6 weeks end-to-end.

### Days 75-90: Stabilize and Plan Wave 2

**Goal:** Production workloads stable in Azure. Wave 2 planned.

- Optimize: right-size overprovisioned VMs, buy RIs for steady-state
- Close security findings from Defender
- Document operating procedures
- Plan waves 2, 3, 4 with lessons learned

At this point you have proof the process works. Scale out.

## Cutover Strategy

Every cutover plan should include:

- **Runbook** — step by step, minute by minute
- **Pre-cutover checks** — monitoring baselines, DNS TTL pre-lowered, dependencies verified
- **Cutover window** — scheduled, communicated, backed up immediately before
- **Rollback plan** — go/no-go decision point, how to roll back
- **Hypercare** — 24-48 hours of heightened monitoring with the migration team on standby
- **Decommission** — only after 2-4 weeks of stable operation on the new side

Do not decommission the source until you are 100% sure. A surprise need to roll back after decommission is career-altering.

## Common Mistakes

- **Skipping the landing zone.** Workloads end up in an unstructured subscription. You pay for this later.
- **Under-sizing discovery.** "We have 200 servers" turns out to be 450 when you actually scan.
- **Treating it as an infra project.** Migration requires app team engagement. Without app owners, cutovers fail.
- **No dependency mapping.** You move Server A and discover it was talking to Servers B, C, D you did not know about.
- **Over-ambitious modernization.** "Let's refactor to microservices during migration." No. Rehost first, modernize after.
- **No hypercare.** Migration completes, team moves on, first incident goes unanswered.

## Cost Surprises and How to Avoid Them

Azure costs are usually higher than predicted by discovery tooling. Reasons:

- Discovery assumes average utilization; reality has peaks
- Storage adds up (managed disks, snapshots, backups)
- Egress bandwidth not accounted for
- Log Analytics ingestion not planned

Avoidance:

- Use Azure Advisor from week 1 to right-size
- Buy Reserved Instances for steady-state workloads post-stabilization (not day 1 — you might still be re-sizing)
- Monitor cost trends weekly in the first 90 days

Budget 15-20% above the initial discovery estimate. It will catch most surprises.

## Data Migration Specifics

### Large databases

Online DMS migration needs bandwidth. A 2 TB DB over a 100 Mbps link will take days. Plan ExpressRoute or use Data Box for the initial seed + catch-up replication.

### Application compatibility

Not every SQL feature is in Azure SQL DB. Linked servers, Server Agent (partially), cross-db queries behave differently. Managed Instance is the safer target for legacy workloads.

### Encryption and compliance

If data was encrypted at rest on-prem, make sure the Azure target has equivalent encryption (CMK or platform keys) before migration. Auditors care.

## Organizational Readiness

Migration is not an IT project — it is a change management project.

- **Executive sponsor** with budget authority
- **Migration factory** — dedicated team, not side-of-desk
- **App teams on the hook** for validation and cutover
- **Communication cadence** — weekly exec summary, daily standup, monthly steering
- **Training budget** — every engineer needs cloud fundamentals

Teams that staff a migration factory (PM, TPMs, cloud engineers, automation leads) ship 3-5x faster than teams that distribute migration across existing staff.

## After Migration: The Real Work

Rehost gets you to Azure. It does not make you cloud-native. The value compounds after migration:

- Right-size over 6 months
- Modernize databases to managed services
- Replace VMs with App Service or Container Apps
- Adopt managed identities
- Consolidate networking
- Pay down security debt
- Build a reservations strategy

The 6 Rs are a starting point, not an end state. Plan for ongoing modernization, not a single migration event.

## Final Take

Migration is not a technology problem. It is a portfolio management problem with technology dimensions. Get the landing zone right, do honest discovery, pick the right R per workload, sequence the waves, communicate relentlessly, and stabilize before you modernize. The teams that treat it with that discipline land in Azure with room to grow. The teams that treat it as a lift and shift and hope, end up with the same problems they had on-prem — plus a cloud bill.`;
