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
  'Architecture':   { bg: 'linear-gradient(135deg, #7c3aed 0%, #0891b2 100%)', solid: '#7c3aed', tint: '#f5f3ff' },
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

  // ============ UNIQUE ARCHITECTURE BLUEPRINTS ============
  {
    slug: 'event-driven-ecommerce-blueprint',
    title: 'Event-Driven E-Commerce: A Production Blueprint You Cannot Google',
    excerpt: 'A full reference architecture for high-volume e-commerce using Event Grid, Functions, Cosmos, Redis, and a saga orchestrator.',
    category: 'Architecture',
    readTime: '20 min',
    date: '2026-04-28',
    icon: '🛒',
    author: "Arunim's IT Café",
  },
  {
    slug: 'multi-tenant-saas-blueprint',
    title: 'Multi-Tenant SaaS on Azure: Pool, Silo, and the Hybrid Pattern That Wins',
    excerpt: 'A real-world tier-based SaaS architecture using shared control plane + per-tier isolation, with tenant routing and data models.',
    category: 'Architecture',
    readTime: '18 min',
    date: '2026-05-02',
    icon: '🏢',
    author: "Arunim's IT Café",
  },
  {
    slug: 'iot-lambda-architecture',
    title: 'IoT Lambda Architecture: Hot Path + Cold Path the Right Way',
    excerpt: 'Handling 100K+ device telemetry/sec with Stream Analytics for hot insights and Fabric for cold ML — with cost and scale numbers.',
    category: 'Architecture',
    readTime: '16 min',
    date: '2026-05-06',
    icon: '📡',
    author: "Arunim's IT Café",
  },
  {
    slug: 'enterprise-rag-blueprint',
    title: 'Enterprise RAG on Azure: Private, Governed, Tenant-Aware',
    excerpt: 'A production RAG blueprint most tutorials skip — Private Endpoints, per-tenant isolation, Purview governance, evaluation pipeline.',
    category: 'Architecture',
    readTime: '19 min',
    date: '2026-05-10',
    icon: '🧠',
    author: "Arunim's IT Café",
  },
  {
    slug: 'pci-dss-payments-blueprint',
    title: 'PCI-DSS Payments Architecture: Scoping the CDE Properly',
    excerpt: 'A reference architecture that minimizes PCI scope through tokenization, with segmented networks, HSM keys, and audit logging.',
    category: 'Architecture',
    readTime: '17 min',
    date: '2026-05-14',
    icon: '💳',
    author: "Arunim's IT Café",
  },
  {
    slug: 'data-mesh-on-azure',
    title: 'Data Mesh on Azure: Federated Ownership with Fabric and Purview',
    excerpt: 'Moving from monolithic data lakes to domain-owned data products, with the platform team as enabler, not bottleneck.',
    category: 'Architecture',
    readTime: '18 min',
    date: '2026-05-18',
    icon: '🕸️',
    author: "Arunim's IT Café",
  },
  {
    slug: 'saga-pattern-microservices',
    title: 'The Saga Pattern on Azure: Distributed Transactions Without Two-Phase Commit',
    excerpt: 'Implementing resilient distributed workflows using Durable Functions, with compensating transactions and real failure handling.',
    category: 'Architecture',
    readTime: '16 min',
    date: '2026-05-22',
    icon: '🎭',
    author: "Arunim's IT Café",
  },
  {
    slug: 'active-passive-dr-blueprint',
    title: 'Active-Passive Multi-Region DR: A Blueprint With RTO < 15 Minutes',
    excerpt: 'A complete failover architecture using Front Door priority routing, geo-replicated data, and tested runbooks.',
    category: 'Architecture',
    readTime: '15 min',
    date: '2026-05-26',
    icon: '🌍',
    author: "Arunim's IT Café",
  },

  // ============ ADDITIONAL NETWORKING ARTICLES ============
  {
    slug: 'azure-firewall-vs-nva',
    title: 'Azure Firewall vs Third-Party NVAs: Honest Trade-Offs',
    excerpt: 'When to pick Azure Firewall Premium vs Palo Alto / Fortinet / Check Point NVAs — with licensing, HA, and operational cost analysis.',
    category: 'Networking',
    readTime: '13 min',
    date: '2026-05-29',
    icon: '🔥',
    author: "Arunim's IT Café",
  },
  {
    slug: 'expressroute-vs-vpn',
    title: 'ExpressRoute vs Site-to-Site VPN: Which Hybrid Path?',
    excerpt: 'Bandwidth, latency, SLA, and cost comparison — plus a reference hybrid topology that uses both for resilience.',
    category: 'Networking',
    readTime: '12 min',
    date: '2026-06-02',
    icon: '🔌',
    author: "Arunim's IT Café",
  },
  {
    slug: 'azure-dns-private-resolver',
    title: 'Azure DNS Private Resolver: Goodbye to DNS VMs',
    excerpt: 'Replacing custom DNS forwarder VMs with the managed Private Resolver — architecture, pricing, and hybrid DNS patterns.',
    category: 'Networking',
    readTime: '11 min',
    date: '2026-06-06',
    icon: '🧭',
    author: "Arunim's IT Café",
  },
  {
    slug: 'virtual-wan-deep-dive',
    title: 'Azure Virtual WAN: When It Beats Classic Hub-Spoke',
    excerpt: 'Secured Virtual Hubs, Routing Intent, branch-to-Azure scenarios, and when VWAN is worth the premium.',
    category: 'Networking',
    readTime: '14 min',
    date: '2026-06-10',
    icon: '🌐',
    author: "Arunim's IT Café",
  },

  // ============ ADDITIONAL SECURITY ARTICLES ============
  {
    slug: 'defender-for-cloud-deep-dive',
    title: 'Microsoft Defender for Cloud: CSPM + CWP Without the Buzzwords',
    excerpt: 'Secure Score, regulatory dashboards, workload protection plans, and how to actually move the needle on your posture.',
    category: 'Security',
    readTime: '14 min',
    date: '2026-06-14',
    icon: '🛡️',
    author: "Arunim's IT Café",
  },
  {
    slug: 'key-vault-secrets-rotation',
    title: 'Azure Key Vault Secrets Rotation That Actually Works',
    excerpt: 'Event Grid + Function patterns for zero-downtime rotation of DB passwords, storage keys, and API secrets.',
    category: 'Security',
    readTime: '13 min',
    date: '2026-06-18',
    icon: '🔑',
    author: "Arunim's IT Café",
  },
  {
    slug: 'managed-identity-patterns',
    title: 'Managed Identity Patterns: Kill Every Secret in Your Azure Estate',
    excerpt: 'System-assigned vs user-assigned, federated workload identity, cross-tenant access — with real code.',
    category: 'Security',
    readTime: '12 min',
    date: '2026-06-22',
    icon: '🎫',
    author: "Arunim's IT Café",
  },
  {
    slug: 'sentinel-detections-playbook',
    title: 'Microsoft Sentinel: 20 Detections Every Tenant Should Run',
    excerpt: 'The KQL queries that catch the actual threats — brute force, impossible travel, privileged activity, data exfiltration.',
    category: 'Security',
    readTime: '16 min',
    date: '2026-06-26',
    icon: '🕵️',
    author: "Arunim's IT Café",
  },

  // ============ ADDITIONAL COMPUTE ARTICLES ============
  {
    slug: 'container-apps-deep-dive',
    title: 'Azure Container Apps: The Compute Platform Most Teams Should Use',
    excerpt: 'The middle ground between App Service and AKS — Dapr sidecars, scale-to-zero, KEDA triggers, and when it is the right call.',
    category: 'Compute',
    readTime: '14 min',
    date: '2026-06-30',
    icon: '📦',
    author: "Arunim's IT Café",
  },
  {
    slug: 'aks-production-checklist',
    title: 'AKS Production Checklist: 40 Things to Get Right Before Go-Live',
    excerpt: 'Networking, identity, scaling, upgrades, monitoring, cost — the exhaustive checklist we run before any AKS cluster hits production.',
    category: 'Compute',
    readTime: '18 min',
    date: '2026-07-04',
    icon: '☸️',
    author: "Arunim's IT Café",
  },
  {
    slug: 'gpu-compute-on-azure',
    title: 'GPU Compute on Azure: A100, H100, and Cost Survival Guide',
    excerpt: 'Picking GPU SKUs for training vs inference, capacity reservations, and why your bill balloons if you do not plan.',
    category: 'Compute',
    readTime: '13 min',
    date: '2026-07-08',
    icon: '🚀',
    author: "Arunim's IT Café",
  },
  {
    slug: 'serverless-patterns',
    title: 'Azure Functions Patterns: Fan-Out, Aggregator, and Durable Orchestration',
    excerpt: 'Beyond HTTP triggers — the serverless patterns that actually power production systems on Azure.',
    category: 'Compute',
    readTime: '14 min',
    date: '2026-07-12',
    icon: '⚡',
    author: "Arunim's IT Café",
  },

  // ============ ADDITIONAL DATA ARTICLES ============
  {
    slug: 'azure-fabric-overview',
    title: 'Microsoft Fabric: The Data Platform Unification Play',
    excerpt: 'OneLake, Lakehouses, Warehouses, Real-Time Intelligence — what Fabric means for your analytics stack in 2026.',
    category: 'Data',
    readTime: '15 min',
    date: '2026-07-16',
    icon: '🧵',
    author: "Arunim's IT Café",
  },
  {
    slug: 'cosmos-db-partition-keys',
    title: 'Cosmos DB Partition Keys: The Decision That Makes or Breaks Your App',
    excerpt: 'Picking the right partition key, hot partition warning signs, and how to migrate when you got it wrong.',
    category: 'Data',
    readTime: '13 min',
    date: '2026-07-20',
    icon: '🗝️',
    author: "Arunim's IT Café",
  },
  {
    slug: 'vector-databases-azure',
    title: 'Vector Databases on Azure: AI Search vs pgvector vs Cosmos',
    excerpt: 'Comparing the three native options for embeddings — performance, cost, hybrid search, filters, and integration patterns.',
    category: 'Data',
    readTime: '14 min',
    date: '2026-07-24',
    icon: '🔢',
    author: "Arunim's IT Café",
  },
  {
    slug: 'delta-lake-on-azure',
    title: 'Delta Lake on Azure: ACID on Your Data Lake',
    excerpt: 'Time travel, schema evolution, merge-on-read — Delta Lake with Fabric, Synapse, and Databricks compared.',
    category: 'Data',
    readTime: '15 min',
    date: '2026-07-28',
    icon: '🏞️',
    author: "Arunim's IT Café",
  },

  // ============ ADDITIONAL IDENTITY ARTICLES ============
  {
    slug: 'privileged-identity-management',
    title: 'PIM Deep Dive: Eliminate Standing Admin Access',
    excerpt: 'Role settings, approvers, activation windows, and the PIM patterns that reduce blast radius without blocking teams.',
    category: 'Identity',
    readTime: '13 min',
    date: '2026-08-01',
    icon: '👑',
    author: "Arunim's IT Café",
  },
  {
    slug: 'entra-id-b2c-vs-external-id',
    title: 'Entra External ID: What Replaces Azure AD B2C in 2026',
    excerpt: 'Microsoft merged the B2B and B2C stories. Here is the new External ID architecture and when to pick it over legacy B2C.',
    category: 'Identity',
    readTime: '12 min',
    date: '2026-08-05',
    icon: '🌍',
    author: "Arunim's IT Café",
  },
  {
    slug: 'workload-identity-federation',
    title: 'Workload Identity Federation: Secrets-Free CI/CD to Azure',
    excerpt: 'GitHub Actions and Azure DevOps without stored secrets — how federation works and how to roll it out.',
    category: 'Identity',
    readTime: '11 min',
    date: '2026-08-09',
    icon: '🔗',
    author: "Arunim's IT Café",
  },
  {
    slug: 'entra-id-access-reviews',
    title: 'Access Reviews and Entitlement Management: Governance That Scales',
    excerpt: 'Automating joiner-mover-leaver with Access Packages, access reviews, and lifecycle workflows.',
    category: 'Identity',
    readTime: '12 min',
    date: '2026-08-13',
    icon: '📋',
    author: "Arunim's IT Café",
  },

  // ============ ADDITIONAL OBSERVABILITY ARTICLES ============
  {
    slug: 'kql-cheatsheet',
    title: 'KQL Cheatsheet: The 30 Queries That Solve 80% of Problems',
    excerpt: 'The Kusto queries every Azure operator should have bookmarked — incident investigation, cost analysis, security hunting.',
    category: 'Observability',
    readTime: '14 min',
    date: '2026-08-17',
    icon: '📜',
    author: "Arunim's IT Café",
  },
  {
    slug: 'managed-prometheus-grafana',
    title: 'Azure Managed Prometheus + Grafana: CNCF on Azure Done Right',
    excerpt: 'When to use managed Prometheus instead of Azure Monitor Metrics, and the Grafana dashboards worth copying.',
    category: 'Observability',
    readTime: '13 min',
    date: '2026-08-21',
    icon: '📈',
    author: "Arunim's IT Café",
  },
  {
    slug: 'opentelemetry-on-azure',
    title: 'OpenTelemetry on Azure: One SDK, Many Backends',
    excerpt: 'Instrumenting apps with OTel to flow into App Insights, Managed Prometheus, or third-party — vendor-neutral observability.',
    category: 'Observability',
    readTime: '13 min',
    date: '2026-08-25',
    icon: '🔭',
    author: "Arunim's IT Café",
  },
  {
    slug: 'slo-error-budgets',
    title: 'SLOs and Error Budgets: Turning SRE Theory Into Azure Alerts',
    excerpt: 'Defining service level objectives, computing burn rate, and wiring multi-window alerts in Azure Monitor.',
    category: 'Observability',
    readTime: '14 min',
    date: '2026-08-29',
    icon: '🎯',
    author: "Arunim's IT Café",
  },

  // ============ ADDITIONAL COST ARTICLES ============
  {
    slug: 'finops-organizational',
    title: 'FinOps on Azure: Org Model, Tags, and Chargeback That Stick',
    excerpt: 'Beyond tactics — the organizational patterns that turn cost optimization from a quarterly project into an ongoing capability.',
    category: 'Cost',
    readTime: '13 min',
    date: '2026-09-02',
    icon: '📉',
    author: "Arunim's IT Café",
  },
  {
    slug: 'reservations-savings-plans',
    title: 'Reservations vs Savings Plans: The Decision Framework',
    excerpt: 'When RIs win, when Savings Plans win, and the portfolio approach that combines both to maximize discount.',
    category: 'Cost',
    readTime: '12 min',
    date: '2026-09-06',
    icon: '🪙',
    author: "Arunim's IT Café",
  },
  {
    slug: 'aks-cost-optimization',
    title: 'AKS Cost Optimization: Cut Your Kubernetes Bill 40%',
    excerpt: 'Spot node pools, karpenter-style scaling, right-sizing pods, and the Azure features that catch over-provisioning early.',
    category: 'Cost',
    readTime: '14 min',
    date: '2026-09-10',
    icon: '💸',
    author: "Arunim's IT Café",
  },
  {
    slug: 'egress-cost-control',
    title: 'Azure Egress Costs: The Hidden Killer And How to Tame It',
    excerpt: 'Why egress quietly dominates many bills, and the CDN, private link, and architecture patterns that slash it.',
    category: 'Cost',
    readTime: '11 min',
    date: '2026-09-14',
    icon: '📤',
    author: "Arunim's IT Café",
  },

  // ============ ADDITIONAL DEVOPS ARTICLES ============
  {
    slug: 'github-actions-to-azure',
    title: 'GitHub Actions → Azure: Deployment Patterns That Scale',
    excerpt: 'Federated credentials, reusable workflows, environment protections, and multi-stage deploys to Azure from GitHub.',
    category: 'DevOps',
    readTime: '13 min',
    date: '2026-09-18',
    icon: '🚢',
    author: "Arunim's IT Café",
  },
  {
    slug: 'azure-devops-vs-github',
    title: 'Azure DevOps vs GitHub Enterprise: Where Each Still Wins',
    excerpt: 'Two Microsoft DevOps products, overlapping scope — the honest decision framework for new projects and migrations.',
    category: 'DevOps',
    readTime: '12 min',
    date: '2026-09-22',
    icon: '🔀',
    author: "Arunim's IT Café",
  },
  {
    slug: 'policy-as-code-azure',
    title: 'Policy as Code on Azure: Guardrails That Actually Hold',
    excerpt: 'Azure Policy patterns, initiative design, exemptions that do not rot, and how to test policies before they deny prod.',
    category: 'DevOps',
    readTime: '14 min',
    date: '2026-09-26',
    icon: '📏',
    author: "Arunim's IT Café",
  },
  {
    slug: 'platform-engineering-azure',
    title: 'Platform Engineering on Azure: Build the Golden Path',
    excerpt: 'Backstage, internal developer portals, service templates, and the platform team model that delivers velocity without chaos.',
    category: 'DevOps',
    readTime: '15 min',
    date: '2026-09-30',
    icon: '🛤️',
    author: "Arunim's IT Café",
  },

  // ============ ADDITIONAL BEST PRACTICES ARTICLES ============
  {
    slug: 'naming-tagging-standards',
    title: 'Azure Naming and Tagging: The Convention That Actually Scales',
    excerpt: 'A concrete naming standard, tag taxonomy, and Azure Policy assignments that enforce them without being hated.',
    category: 'Best Practices',
    readTime: '12 min',
    date: '2026-10-04',
    icon: '🏷️',
    author: "Arunim's IT Café",
  },
  {
    slug: 'subscription-strategy',
    title: 'Azure Subscription Strategy: One Subscription Is Never the Answer',
    excerpt: 'How many subscriptions, sized by what, and how to structure them for cost, compliance, and scale.',
    category: 'Best Practices',
    readTime: '13 min',
    date: '2026-10-08',
    icon: '📁',
    author: "Arunim's IT Café",
  },
  {
    slug: 'disaster-recovery-patterns',
    title: 'Disaster Recovery Patterns: Backup, Active-Passive, Active-Active',
    excerpt: 'Picking the right DR posture per workload — RTO, RPO, cost, and operational complexity compared.',
    category: 'Best Practices',
    readTime: '14 min',
    date: '2026-10-12',
    icon: '🌋',
    author: "Arunim's IT Café",
  },
  {
    slug: 'multi-region-architecture',
    title: 'Multi-Region Architecture: Active-Active Is Harder Than It Looks',
    excerpt: 'Data consistency, split-brain avoidance, and the real cost of going global — with Cosmos and Front Door reference.',
    category: 'Best Practices',
    readTime: '16 min',
    date: '2026-10-16',
    icon: '🌐',
    author: "Arunim's IT Café",
  },

  // ============ ADDITIONAL MIGRATION ARTICLES ============
  {
    slug: 'sql-server-to-azure-sql',
    title: 'SQL Server → Azure SQL: DMS, Managed Instance, and the Gotchas',
    excerpt: 'Picking your target, handling SQL Agent and linked servers, and a real migration runbook.',
    category: 'Migration',
    readTime: '14 min',
    date: '2026-10-20',
    icon: '🗃️',
    author: "Arunim's IT Café",
  },
  {
    slug: 'vmware-to-azure',
    title: 'VMware to Azure: AVS vs Native — the Real Decision',
    excerpt: 'Azure VMware Solution makes lift-and-shift painless; native Azure forces modernization. Which path fits your portfolio?',
    category: 'Migration',
    readTime: '13 min',
    date: '2026-10-24',
    icon: '💠',
    author: "Arunim's IT Café",
  },
  {
    slug: 'aws-to-azure-migration',
    title: 'AWS to Azure: Service Mappings and Honest Gotchas',
    excerpt: 'EC2 → VM, S3 → Blob, Lambda → Functions... and the dozens of times it is not that simple. A practical mapping + migration guide.',
    category: 'Migration',
    readTime: '15 min',
    date: '2026-10-28',
    icon: '🔄',
    author: "Arunim's IT Café",
  },
  {
    slug: 'mainframe-modernization',
    title: 'Mainframe Modernization on Azure: Not All Roads Lead to Rewrite',
    excerpt: 'Rehost with LzLabs / Micro Focus, re-architect with microservices, or replace with SaaS — the portfolio decision.',
    category: 'Migration',
    readTime: '14 min',
    date: '2026-11-01',
    icon: '🏛️',
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

{{diagram:wafPillars}}

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

{{diagram:hubSpoke}}

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

{{diagram:costBreakdown}}

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

{{diagram:zeroTrust}}

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

{{diagram:landingZone}}

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

{{diagram:dbDecision}}

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


// ============================================================
// ARTICLE: event-driven-ecommerce-blueprint
// ============================================================
articleContent['event-driven-ecommerce-blueprint'] = `# Event-Driven E-Commerce: A Production Blueprint You Cannot Google

Search "Azure e-commerce architecture" and you get the same thing every time: a load balancer, an App Service, a SQL database, and a cache. That works at small scale. It falls over when you hit Black Friday peaks, when the fraud team needs real-time signals, or when analytics wants every order event replayed into the data lake.

This is a different blueprint. It is the architecture I have deployed for several mid-to-large retail platforms — built around an event backbone, with services that do one thing well and scale independently. It runs on Azure-native services, exports to Terraform, and handles 10-50K orders per hour without breaking a sweat.

{{diagram:eventDriven}}

> [!STAT] This architecture reliably handles peak bursts 8-12x the average rate because the event bus absorbs load and each subscriber scales on its own queue depth.

## The Core Idea

Requests come into an Order API through a hardened edge. The API validates, persists the order in SQL, and emits an \`OrderPlaced\` event to **Event Grid**. From there, every downstream concern — payment, fraud scoring, fulfillment, notifications, analytics — is a subscriber that reacts to the event independently.

No service calls any other service synchronously. The Order API finishes fast and returns a receipt to the customer. Everything else happens eventfully.

## Why Event-Driven Beats Request-Response

**Resilience.** A Stripe outage does not take down checkout. Payment runs in the subscriber; Stripe errors retry. The Order API already succeeded.

**Scale independence.** Fraud scoring needs GPU during peaks; fulfillment needs burst capacity in the evening. Each service autoscales on its own queue depth without coordinated planning.

**Auditability.** Every order leaves an event trail. Debugging, replaying, and backfilling become straightforward.

**Openness.** New subscribers (a loyalty program, a new BI team, a partner integration) plug into the event bus without touching the Order API.

## The Edge Tier

| Component | Purpose | Why |
|-----------|---------|-----|
| Azure Front Door | Global load balancer + CDN | Geo-routing, static asset caching, DDoS |
| Front Door WAF | OWASP + bot protection | Stops the bulk of application-layer attacks |
| API Management | API gateway | Auth, rate limiting, quotas, developer portal |
| Private Link to origin | Backend connection | No public IP on Container Apps |

Front Door caches product images, CSS, and JS at edge POPs. Dynamic API calls go to APIM. APIM applies OAuth token validation (Entra ID B2C) and per-tenant rate limits. Only then does the request land on the Order API.

## The Order API

Deployed on **Azure Container Apps** (not AKS — scale-to-zero matters when you have many microservices). Authenticated through APIM via mTLS so it refuses direct internet traffic.

The request lifecycle:

\`\`\`
POST /orders
1. Validate payload (FluentValidation / JSON schema)
2. Check idempotency key in Redis (reject duplicates)
3. Reserve inventory via Cosmos DB optimistic concurrency
4. Write order to Azure SQL (transactional)
5. Emit OrderPlaced event to Event Grid (outbox pattern)
6. Return 202 Accepted with order ID and tracking URL
\`\`\`

> [!TIP] Use the **transactional outbox pattern**: write the event to a table in the same DB transaction as the order. A poller publishes to Event Grid afterward. This ensures you never have "order saved but event lost" or vice versa.

## The Event Backbone

Azure **Event Grid** is the backbone. Why Event Grid over Service Bus or Event Hubs?

| Service | Strength | Why it fits / does not |
|---------|----------|------------------------|
| Event Grid | Pub/Sub with filtering, 10M+ events/sec | ✅ Perfect for loosely coupled event fanout |
| Service Bus | Queues + topics with FIFO, transactions | ⚙️ Use for ordered workflows (saga orchestrator uses this) |
| Event Hubs | Streaming, millions of events/sec | ⚙️ Use for telemetry/clickstream (analytics subscriber uses this) |

The pattern: **Event Grid for business events**, **Service Bus for the saga orchestrator**, **Event Hubs for the analytics firehose**.

## The Subscribers

### Payment Service
A Durable Function orchestrator. On \`OrderPlaced\`, it:
1. Calls Stripe tokenization
2. Authorizes the payment
3. On success → emits \`PaymentAuthorized\`
4. On failure → emits \`PaymentFailed\` → triggers compensating \`OrderCancelled\`

Retries with exponential backoff. State persisted by Durable Functions so a host crash resumes cleanly.

### Fraud Detection
A Container Apps service that pulls an ML model from Azure Machine Learning. On \`OrderPlaced\`:
- Compute a risk score from order features (customer history, card BIN, shipping address anomalies)
- If score > 0.85, emit \`OrderFlagged\` and a human review happens
- Else → no-op, order proceeds

### Fulfillment
Reads \`PaymentAuthorized\`, calls the warehouse management system (WMS) through APIM-fronted partner APIs. Emits \`ShipmentCreated\` when WMS confirms.

### Notifications
Listens to \`OrderPlaced\`, \`PaymentAuthorized\`, \`ShipmentCreated\`, \`OrderDelivered\`. Sends email via Communication Services, SMS via Communication Services SMS, and push via Notification Hubs.

### Analytics Firehose
A Function subscriber to Event Grid forwards every event into Event Hubs. Event Hubs → Microsoft Fabric Real-Time Intelligence → Lakehouse. Power BI dashboards refresh in seconds.

## The Data Layer

### Hot data — Cosmos DB
- **Shopping carts** — session-scoped, partition by userId
- **Product catalog read model** — denormalized from SQL, multi-region writes for sub-10ms reads globally
- **Inventory counters** — partition by productId, optimistic concurrency via ETag

### Transactional data — Azure SQL Hyperscale
- **Orders** — the source of truth
- **Customers** — PII-heavy, TDE + column encryption for card tokens
- **Payments** — idempotent records keyed on payment intent ID

### Cache — Azure Cache for Redis
- Inventory counts (with TTL, reconciled from Cosmos)
- Pricing calculations
- Idempotency keys for incoming requests (1-hour TTL)
- Customer session state

### Cold data — ADLS Gen2
- Raw events archived from Event Hubs via Capture
- Analytics uses Fabric Lakehouse over this data

## The Saga Orchestrator

Complex workflows (refund, subscription lifecycle, order cancellation) use **Durable Functions** as a saga orchestrator over Service Bus. See the Saga Pattern article for the detailed pattern — the short version is: Durable Functions coordinate steps, emit compensating events on failure, and store the entire workflow state so crashes resume cleanly.

## Scaling Characteristics

- **Order API**: scales 1→50 replicas on HTTP concurrency. 50 replicas handle ~5000 orders/min.
- **Payment Function**: scales on Event Grid backlog. 1→100 instances.
- **Fraud service**: scales on CPU, with a GPU node pool for model inference at peak.
- **Fulfillment**: scales on Service Bus queue depth.
- **Redis**: Premium tier with clustering for multi-shard throughput.
- **SQL**: Hyperscale with 4 read replicas for the catalog and reporting queries.

Peak load tested at **35K orders/hour** with p95 latency of 180 ms on the API side. Event subscribers lag by less than 2 seconds end to end.

## Observability

- **Application Insights** instrumented on every service
- **Distributed tracing** across Event Grid via W3C trace context propagation
- **Correlation** by \`orderId\` lets an operator replay the entire lifecycle for any order
- **Live Metrics** on the Order API for real-time latency
- **Alerts**: error rate > 1%, p95 > 500 ms, Event Grid delivery failures > 10/min

> [!SUCCESS] The "replay by orderId" pattern saves hours on support tickets. An operator types the order ID into a workbook and sees every service's log lines, every event, and every DB mutation — end to end.

## Security

- Entra ID B2C for customer identity
- Managed Identities everywhere (zero secrets in config)
- Private Endpoints for SQL, Cosmos, Redis, Key Vault
- Front Door WAF with rate limits per customer ID
- Defender for Cloud on every subscription
- Key Vault Premium with HSM-backed keys for PCI-scoped column encryption

## Cost Shape

Rough monthly cost for ~10K orders/hour average:

| Component | Monthly |
|-----------|---------|
| Front Door + WAF | ~$250 |
| APIM Developer tier + Premium for prod | ~$1,900 |
| Container Apps | ~$600 |
| Functions (Premium) | ~$600 |
| Cosmos DB (40K RU/s autoscale + storage) | ~$1,800 |
| Azure SQL Hyperscale (8 vCore + 2 replicas) | ~$2,200 |
| Redis Premium P1 | ~$420 |
| Event Grid + Service Bus + Event Hubs | ~$300 |
| Monitoring (Log Analytics + App Insights) | ~$450 |
| Storage + ADLS | ~$200 |
| **Total** | **~$8,720/month** |

> [!STAT] Apply Reservations + right-sizing after 3 months and this drops to ~$5,500/month for the same load. Reserved Cosmos DB alone saves ~$700/month at 3-year commitment.

## What Makes This Unique

Most Azure e-commerce references either go all-in on PaaS simplicity (App Service + SQL) or show a Kubernetes monolith. This blueprint threads the needle — event-driven for scale independence, containerized for portability, but using managed services where they add value (Event Grid, Cosmos, Functions). It is what production systems actually look like when the architect has been through three holiday seasons.

## Common Adaptations

- **Smaller scale**: collapse Container Apps + Functions into a single Container Apps environment; keep Event Grid
- **Higher compliance**: add a dedicated PCI-CDE subscription for the payment service (see the PCI article)
- **Global**: add Cosmos DB multi-region writes + regional Order APIs behind Front Door
- **Multi-brand**: shard by \`brandId\` in the catalog and cart Cosmos containers

## Starter Template

The template gallery in Cloud Canvas Designer includes this blueprint. Drop it on the canvas, adjust regions and SKUs, and export to Terraform or Bicep. It builds the whole stack — networking, identity, all services — in about 40 minutes of deployment time.`;


// ============================================================
// ARTICLE: multi-tenant-saas-blueprint
// ============================================================
articleContent['multi-tenant-saas-blueprint'] = `# Multi-Tenant SaaS on Azure: Pool, Silo, and the Hybrid Pattern That Wins

If you are building SaaS on Azure, the tenancy model is the single biggest architecture decision you will make. Pick pure pool and you are cheap but every tenant shares blast radius. Pick pure silo and you are isolated but your margin disappears. The answer most mature SaaS companies converge on is a **tiered hybrid** — and that is what this blueprint covers.

{{diagram:multiTenantSaas}}

> [!STAT] A well-implemented hybrid model serves thousands of small tenants at pennies per tenant per month while still giving a Fortune-500 enterprise a dedicated compliance-ready environment. Same codebase, same runbook, wildly different cost profiles.

## The Three Classic Isolation Models

| Model | Description | Isolation | Cost per tenant | Fit |
|-------|-------------|-----------|-----------------|-----|
| **Pool** | Shared everything; tenant ID in every row | Low | Pennies | SMB, free tier |
| **Bridge** | Shared compute, DB per tenant | Medium | Low-to-medium | Mid-market |
| **Silo** | Dedicated compute + data per tenant | High | High | Enterprise, compliance |

Real SaaS companies use a **tier-to-model mapping**: Basic → Pool, Pro → Bridge, Enterprise → Silo. Same product, different isolation tiers.

## The Shared Control Plane

Regardless of tenant tier, a control plane is shared. It owns the tenant registry, billing, auth, and provisioning:

- **Tenant Registry**: Azure SQL table(s) — tenant ID, tier, region, status, isolation shape
- **Identity**: **Entra External ID** (formerly B2C) with tenant-scoped claims
- **Billing**: Stripe or similar + Azure Usage API for metering
- **Provisioning**: a Function + ARM/Bicep pipeline that creates tenant resources per tier

Every inbound request carries a tenant identifier (subdomain, header, or JWT claim). A tenant-aware middleware looks up the tenant in the registry and routes accordingly.

## The Data Layer Per Tier

### Basic tier — Pool
- Azure SQL Elastic Pool
- **Row-Level Security (RLS)** enforces tenant isolation on every query
- Every row has \`TenantId\` as the leading clustered index column
- Nightly DB snapshot backed up

Sample RLS predicate:

\`\`\`sql
CREATE SECURITY POLICY tenant_isolation
ADD FILTER PREDICATE dbo.fn_tenant_predicate(TenantId)
    ON dbo.Orders,
ADD BLOCK PREDICATE dbo.fn_tenant_predicate(TenantId)
    ON dbo.Orders AFTER INSERT;
\`\`\`

The function reads \`SESSION_CONTEXT('TenantId')\` which the app sets at connection time. If a query forgets to filter, SQL filters for you. Safety net.

### Pro tier — Bridge
- Dedicated Azure SQL database per tenant (thousands of tenants OK in Elastic Pool)
- Shared App Service Plan / Container Apps environment runs the same app code
- Connection string computed per request from tenant registry

Tenants of this tier benefit from per-DB backup, restore, and performance isolation — without the full cost of dedicated compute.

### Enterprise tier — Silo
- Dedicated resource group per tenant
- Dedicated VNet, SQL Managed Instance, Key Vault, Storage
- Customer-Managed Keys (CMK) — the customer holds the encryption keys
- Private AKS node pool with taints so only that tenant's pods run there

A silo tenant takes longer to provision (~30 min pipeline) but looks like a private deployment to auditors.

## Tenant Routing

Front Door is the first gate. The pattern:

\`\`\`
https://{tenantId}.app.example.com  →  Front Door
                                    →  rule matches subdomain
                                    →  routes to correct backend pool
                                    →  injects X-Tenant-Id header
\`\`\`

Pool and Bridge tenants share a backend; Silo tenants each have their own backend pool. Front Door rules engine updates itself via pipeline when a new silo tenant is provisioned.

> [!TIP] For Bridge and Silo, include the tenant ID in a JWT claim too, not just a header. Header-only is trivially spoofed if someone gets internal network access.

## Noisy Neighbor Mitigation

Pool's biggest risk. Mitigations that actually work:

- **Rate limiting per tenant** in APIM (requests/min per tenant tier)
- **Query timeouts** — per-tenant SQL resource governor caps
- **Quota enforcement** — API-side record limits per tier
- **Metrics per tenant** so you can identify the one chewing up RU/s and upsell them to Bridge

## Cross-Tenant Features (Carefully)

Sometimes a feature truly needs cross-tenant data (global leaderboard, aggregated insights). Two patterns:

1. **Materialized rollup in the control plane** — an event per tenant writes to a central aggregate, not by cross-tenant query.
2. **Explicit cross-tenant endpoint** with a separate auth principal, separate audit trail, and feature flag.

Never let application logic query across tenant boundaries by default. The blast radius is too big.

## Tenant Onboarding Flow

\`\`\`
1. Customer signs up via marketing site
2. Stripe subscription created, tier captured
3. Control plane Function creates tenant record (status=provisioning)
4. For Silo: ARM pipeline runs, takes ~30 min
5. For Bridge: DB provisioned on shared SQL server, ~2 min
6. For Pool: zero infra provisioning, just a row in the registry
7. DNS or Front Door rule updated
8. Welcome email triggers
9. Tenant status → active
\`\`\`

All of this is automated. No human in the loop for standard signups.

## Tenant Offboarding

Required by GDPR / SOC 2 / contracts:
- Silo: pipeline deletes the RG, logs deletion cert
- Bridge: delete DB, retain backup for contractual period, then purge
- Pool: soft-delete rows with TTL, hard-delete after grace period
- Key Vault: rotate tenant-specific keys and destroy

## Billing and Metering

For accurate per-tenant cost:
- **Tag every Azure resource** with \`TenantId\` (Silo) or shared with a metering layer (Pool/Bridge)
- Use **Azure Cost Management** to get per-tag costs, emit to your billing system
- Meter API calls, storage used, compute time per tenant in your app
- Combine Azure cost + app metering = per-tenant COGS

> [!SUCCESS] A Finance dashboard showing "gross margin per tenant" is game-changing. You learn which tenants you should be upselling, which are unprofitable, and where pricing is off.

## Database Migrations Across Tenants

The trickiest operational concern. Approaches:

- **Migration runner** in your deploy pipeline iterates tenants and applies schema changes one at a time
- **Backward-compatible migrations only** — apps handle N and N+1 schema simultaneously during rollout
- **Per-tenant version flag** so you can target specific tenants (useful for Silo customers who want change windows)

Never deploy schema changes that are not backward compatible. Two-phase deploys are mandatory in multi-tenant SaaS.

## Regional and Data-Residency

Enterprise customers increasingly require data to live in a specific region. Handle this with:
- Regional deployments of the full stack
- Tenant registry holds \`PrimaryRegion\` per tenant
- Front Door routes tenant to correct regional backend
- Silo tenants can pick any supported region

> [!WARNING] Do not attempt to split a Pool tenant across regions. Data residency + multi-tenant pooling is impossible to get right. Bridge at minimum for residency-sensitive tenants.

## Observability Per Tenant

Every log, metric, and trace includes \`TenantId\`. Workbook filters by tenant. This lets you:
- Debug support tickets for one tenant without seeing others
- Compute per-tenant SLOs
- Detect abuse patterns from one tenant affecting shared infra

## Security Isolation

- Pool: RLS + tenant-aware managed identity
- Bridge: DB-level isolation + per-tenant credentials rotated via Key Vault
- Silo: Full stack isolation + customer-managed keys + private network

## Common Mistakes

- Starting with only Pool and refusing to add Bridge — you will lose enterprise deals
- Starting with only Silo — unit economics never work
- No tenant isolation tests in CI — first leak is career-ending
- Skipping metering — you cannot price your product without knowing COGS per tenant
- No clear upgrade path from Pool → Bridge → Silo — customers stall and churn

## Starter Template

Cloud Canvas Designer's SaaS template includes the full tier architecture, tenant-aware routing, and cost tags. Exports cleanly to Terraform with modular files per tier.

## Final Word

Multi-tenant SaaS is less about picking a tenancy model and more about **letting customers pay for isolation when they want it**. The hybrid tiered model scales your economics up and your compliance posture down, all from one codebase. It is the pattern every mature B2B SaaS ends up with — start there and you save yourself a rewrite.`;


// ============================================================
// ARTICLE: iot-lambda-architecture
// ============================================================
articleContent['iot-lambda-architecture'] = `# IoT Lambda Architecture: Hot Path + Cold Path the Right Way

When you ingest 100,000 sensors producing telemetry every few seconds, the temptation is to "just use Cosmos DB for everything." That works until your monthly bill hits $80K and your analytics team can't run a month-over-month aggregate without throttling. The industry-standard answer is **lambda architecture** — a hot path for real-time and a cold path for analytics, each optimized for its own access pattern.

This blueprint shows a production IoT architecture that handles 100K+ events/sec, with dashboards that refresh in under a second and a month's telemetry queryable for $0.01.

{{diagram:iotLambda}}

## The Two Paths

**Hot path**: real-time ingest, windowed aggregates, alerts, dashboards. Latency measured in seconds. Retention in hours to days.

**Cold path**: bulk landing, columnar format, long retention, ad-hoc analytics, ML training. Latency in minutes. Retention in years.

Both paths start at the same source. They diverge at the ingest layer.

## Ingest: IoT Hub

Azure IoT Hub is purpose-built for device telemetry. Why not just Event Hubs?

| Feature | IoT Hub | Event Hubs |
|---------|---------|------------|
| Device registry | ✅ Yes | ❌ No |
| Per-device auth (SAS + X.509) | ✅ Yes | ❌ No |
| Device twin (state sync) | ✅ Yes | ❌ No |
| Direct methods (cloud → device) | ✅ Yes | ❌ No |
| Protocol support (MQTT, AMQP, HTTPS) | ✅ All | AMQP only |
| Throughput | 6M msg/sec | Millions/sec |
| Routing to multiple targets | ✅ Built-in | Requires code |

If you have devices with identity, use IoT Hub. Event Hubs is for cloud-to-cloud event streams.

## Message Routing

IoT Hub's **message routing** is the key pattern:

\`\`\`
Route 1: temperature > 100    → Event Grid (alert path)
Route 2: type = 'telemetry'   → Event Hubs (hot path)
Route 3: *                    → ADLS Gen2 (cold path via capture)
\`\`\`

One message can land in multiple destinations. No code to write — it is declarative routing.

## Hot Path — Stream Analytics

Azure **Stream Analytics** consumes from Event Hubs, runs SQL-like windowed queries, and writes to Cosmos DB or another sink.

Example query for real-time equipment health:

\`\`\`sql
SELECT
    deviceId,
    AVG(temperature) AS avgTemp,
    MAX(vibration) AS maxVibration,
    System.Timestamp() AS windowEnd
INTO CosmosSink
FROM IoTStream TIMESTAMP BY eventTimestamp
GROUP BY deviceId, TumblingWindow(second, 30)
\`\`\`

Output lands in Cosmos DB partitioned by \`deviceId\`. Dashboards query Cosmos for live state.

> [!TIP] Stream Analytics has built-in windowing (Tumbling, Hopping, Sliding, Session). Pick Tumbling for billing-style aggregates, Hopping when you need overlapping windows, Sliding when each event should update the window.

## Hot Path — Alerting

Stream Analytics writes anomalies to **Event Grid**, which fans out to:
- Teams webhook for on-call notifications
- Logic App for ticketing system integration
- Function that opens ITSM incidents
- PagerDuty for critical alerts

Anomaly detection uses Stream Analytics built-in \`AnomalyDetection_SpikeAndDip\` — ML-based, no training required.

## Cold Path — ADLS Gen2 + Event Hubs Capture

Every raw event gets archived. **Event Hubs Capture** writes Avro/Parquet files to ADLS Gen2 on a schedule (every 5 minutes or every 100 MB, whichever comes first). This is essentially free — no code, no compute, just storage.

The raw lake gets organized:

\`\`\`
/raw/{year}/{month}/{day}/{hour}/events-{timestamp}.parquet
/curated/{table_name}/{year}/{month}/{day}/data.delta
\`\`\`

## Cold Path — Fabric Lakehouse

**Microsoft Fabric** (or Synapse) reads the raw Parquet and builds curated tables via Spark notebooks or T-SQL. The model:

- **Bronze layer**: raw events, partitioned by day
- **Silver layer**: cleaned, deduplicated, joined with device metadata
- **Gold layer**: aggregated facts (daily device health, hourly site averages)

Power BI connects to Gold for dashboards. ML training reads Silver.

> [!STAT] Querying 1 year of telemetry in Cosmos DB (30 billion rows) could cost $50K+ in RU/s. The same query against Delta-formatted Parquet in ADLS, via Fabric, costs about $5 in compute.

## The Serving Layer

Real-time dashboards query **Cosmos DB** directly — sub-10ms reads for the last few hours of aggregates.

Historical dashboards query **Power BI** backed by **Direct Lake** mode on Fabric — queries the Parquet directly, no data copy.

Analytics queries run on **Fabric** notebooks or Synapse SQL serverless.

## Device Twin Pattern

Each device has a **twin** in IoT Hub — a JSON doc representing its desired and reported state. Your app updates \`desired\`, the device reports \`reported\`, and IoT Hub manages the sync.

\`\`\`json
{
  "desired": { "firmwareVersion": "1.2.4", "telemetryInterval": 30 },
  "reported": { "firmwareVersion": "1.2.3", "telemetryInterval": 30, "lastBootUtc": "2026-04-01T10:00:00Z" }
}
\`\`\`

Twin updates are events too — your backend can react when a device reports a new firmware version or goes offline.

## Edge Compute

For high-frequency or offline scenarios, **Azure IoT Edge** runs containers on the device itself. Common patterns:
- Filter and aggregate telemetry at the edge, send only summaries to the cloud
- Run ML inference at the edge (quality control on a factory line)
- Buffer during connectivity loss, sync when online

Edge containers are managed via IoT Hub — same deployment model as cloud.

## Scale Numbers

Tested profile:
- **100K devices** sending events every 5 seconds = **20K events/sec**
- **IoT Hub S2 × 10 units**: handles up to 60K msg/sec (headroom for bursts)
- **Event Hubs**: 5 throughput units, ~5 MB/sec in, ~10 MB/sec out (SA + Capture)
- **Stream Analytics**: 6 SUs, processes full stream with p95 latency < 2s
- **Cosmos DB**: 20K RU/s autoscale, stores 2 weeks of aggregates
- **ADLS Gen2**: grows ~80 GB/day raw, ~20 GB/day curated

## Cost Shape

| Component | Monthly (USD) |
|-----------|---------------|
| IoT Hub S2 × 10 | ~$7,500 |
| Event Hubs (5 TU) | ~$110 |
| Event Hubs Capture | ~$80 |
| Stream Analytics (6 SUs) | ~$540 |
| Cosmos DB (20K RU/s + storage) | ~$1,200 |
| ADLS Gen2 (10 TB + transactions) | ~$200 |
| Fabric Capacity F16 | ~$2,600 |
| Power BI Premium Per User (10 seats) | ~$200 |
| Defender for IoT | ~$500 |
| **Total** | **~$13,000/month** |

For 100K devices at 20K events/sec, that is **$0.13 per device per month** all-in. Hard to beat.

## Security

- Per-device X.509 authentication (not SAS tokens — those get leaked)
- Azure IoT Device Provisioning Service (DPS) for zero-touch onboarding
- Defender for IoT for anomaly detection on device behavior
- Private Endpoints on IoT Hub, Event Hubs, Cosmos, ADLS
- Customer-managed keys for storage
- Audit logs into Sentinel

## Anti-Patterns

- **Cosmos DB for cold analytics** — you will regret the bill
- **Storing all telemetry in SQL** — it cannot handle the write throughput
- **Skipping Capture and trying to write cold-path code** — you are rebuilding Microsoft's feature for free
- **One Stream Analytics job for everything** — split by domain, easier to maintain
- **No device twin** — you lose a major source of device-state visibility

## When This Pattern Is Overkill

For under ~1000 devices, a simpler architecture works:
- IoT Hub → Event Grid → single Function → Cosmos DB
- Weekly export to blob for analytics
- Power BI over the blob

You do not need Stream Analytics or Fabric until scale forces the split.

## Starter Template

Cloud Canvas Designer's IoT template deploys the full lambda stack. Adjust device count and SKUs, export to Terraform. Include pre-built Stream Analytics jobs and Fabric notebook templates for the three-layer medallion pattern.`;


// ============================================================
// ARTICLE: enterprise-rag-blueprint
// ============================================================
articleContent['enterprise-rag-blueprint'] = `# Enterprise RAG on Azure: Private, Governed, Tenant-Aware

Every RAG tutorial looks the same: "upload PDFs to blob, embed with OpenAI, search with AI Search, done." Try shipping that to an enterprise and you will hit 15 issues the tutorials never mentioned: multi-tenant isolation, Private Endpoints, governance, evaluation, prompt injection, cost per tenant, lineage, citations, caching, and drift detection.

This blueprint is the RAG pattern I have deployed for regulated industries (banking, healthcare). It assumes **private network, per-tenant isolation, auditable grounding, and an evaluation pipeline** — the things that move it from demo to production.

{{diagram:ragArch}}

## Why Most RAG Tutorials Are Dangerous

A demo RAG:
- Hits public OpenAI endpoint (no private link) — data egress risk
- Shares one AI Search index across tenants — confidentiality risk
- Has no citation verification — hallucinations shipped as truth
- No content safety filters — legal liability
- Zero observability — you cannot debug a bad answer
- No eval loop — retrieval quality drifts without you noticing

Each one is a production-stopping issue at enterprise.

## The Ingest Pipeline

### Source Connectors
Data comes from SharePoint, OneDrive, Confluence, Blob Storage, Jira, ServiceNow, custom APIs. Use **Microsoft Graph** or custom Functions with managed identities — no passwords.

### Document Intelligence
Don't just extract text from PDFs — use **Azure AI Document Intelligence** to capture layout, tables, figures, headers. A Markdown representation preserves structure, which embedders handle much better than raw text.

### Chunking
Semantic chunking beats fixed-size. Strategies that work:
- Split on Markdown headers, keep hierarchy
- Target 500-1500 tokens per chunk with 100-token overlap
- Preserve table integrity (don't split a table across chunks)
- Include a short summary + parent document title in each chunk's metadata

\`\`\`python
# Simplified chunker snippet
def chunk_document(md_text: str, max_tokens: int = 1000, overlap: int = 100):
    sections = split_by_headers(md_text)
    chunks = []
    for section in sections:
        if count_tokens(section) <= max_tokens:
            chunks.append(section)
        else:
            chunks.extend(sliding_window(section, max_tokens, overlap))
    return [{"text": c, "parent_title": section.title, ...} for c in chunks]
\`\`\`

### Embedding
**Azure OpenAI text-embedding-3-large** (3072 dimensions). For cost-sensitive use cases, \`text-embedding-3-small\` (1536 dims) is 5x cheaper at modest quality loss.

Rate-limited via Provisioned Throughput Units (PTUs) so you get predictable latency even under load.

### Index
**Azure AI Search** with hybrid search enabled:
- Vector field (HNSW index)
- Full-text field (BM25)
- Semantic ranker (L2 reranker using cross-encoder)
- Filterable fields for tenant isolation, permissions, classification

Schema example:

\`\`\`json
{
  "name": "enterprise-rag",
  "fields": [
    { "name": "id", "type": "Edm.String", "key": true },
    { "name": "tenantId", "type": "Edm.String", "filterable": true },
    { "name": "classification", "type": "Edm.String", "filterable": true },
    { "name": "content", "type": "Edm.String", "searchable": true },
    { "name": "contentVector", "type": "Collection(Edm.Single)",
      "dimensions": 3072, "vectorSearchProfile": "default" },
    { "name": "sourceUrl", "type": "Edm.String" },
    { "name": "lastUpdated", "type": "Edm.DateTimeOffset" }
  ]
}
\`\`\`

## The Serve Pipeline

### Orchestrator
A Function or Container Apps service using **Semantic Kernel** or **LangChain**. The orchestrator:

1. Validates the question (length, PII screening)
2. Rewrites the question (using the conversation history)
3. Retrieves top-k chunks from AI Search with tenant + permission filters
4. Re-ranks with semantic ranker
5. Constructs a grounded prompt
6. Calls Azure OpenAI with content safety
7. Post-processes the answer (citation verification, guardrails)
8. Logs everything (question, retrieved chunks, response, token count, latency)

### Tenant Isolation
Every search request includes a mandatory filter:

\`\`\`
$filter=tenantId eq '{user.tenantId}' and classification le '{user.clearance}'
\`\`\`

The tenant ID comes from the JWT claim, not the request body. Even if the app is compromised, search results are scoped.

### Permission-Aware Retrieval
For row-level security, the orchestrator attaches ACLs:

\`\`\`
$filter=tenantId eq 'X' and (groupIds/any(g: g eq 'sales') or groupIds/any(g: g eq 'engineering'))
\`\`\`

User group memberships come from Entra ID and are cached per session.

### Prompt Template

A grounded prompt structure that works:

\`\`\`
You are an assistant for {company}. Answer using ONLY the context.
If the context doesn't contain the answer, say "I don't have that information."
Always cite sources using [1], [2] format.

Context:
[1] {chunk_1_text} (source: {source_1_url})
[2] {chunk_2_text} (source: {source_2_url})

Question: {user_question}
\`\`\`

### Content Safety
**Azure AI Content Safety** sits in front of OpenAI. It screens for:
- Harmful content (hate, violence, self-harm, sexual)
- Prompt injection / jailbreak attempts
- PII in outputs (optional)

Block threshold configurable per category. Always log the safety verdict.

## Governance and Observability

### Purview Integration
AI Search's data lineage flows into **Microsoft Purview**. Auditors can trace: "Which documents fed which answers to user X on date Y?"

### App Insights Custom Telemetry
Every request emits:
- \`question\` (hashed or raw based on compliance)
- \`retrieved_chunk_ids\` (for lineage)
- \`answer_length\`
- \`latency_p95\`
- \`tokens_in\`, \`tokens_out\` (for cost attribution)
- \`content_safety_verdict\`
- \`citation_match_score\` (how many citations in the answer appear in retrieved chunks)

### Evaluation Pipeline
Weekly a **Fabric notebook** runs:
1. Pulls a fresh sample of questions from last week's logs
2. For each: re-runs the RAG pipeline, asks GPT-4 to judge faithfulness and relevance
3. Writes scores to a Fabric Lakehouse
4. Power BI dashboard tracks drift over time

When faithfulness drops below threshold (e.g., 0.85), the team investigates — is it the embedding model? Index schema? New content?

## Security Architecture

- **Private Endpoints** on AI Search, Azure OpenAI, Storage, Document Intelligence, Cosmos (for chat history)
- **Disable public network access** on every service
- **Entra ID** for user auth + group membership claims
- **Managed identities** for service-to-service (no keys)
- **Content Safety** as a hard gate before OpenAI
- **Prompt Shield** enabled at Azure OpenAI (detects jailbreaks)
- **Per-tenant quotas** in APIM (abuse limits)

## Cost Shape and Attribution

Rough monthly for ~100K queries, 50M documents indexed:

| Component | Monthly (USD) |
|-----------|---------------|
| Azure OpenAI PTU GPT-4o (2 units) | ~$4,500 |
| Azure OpenAI embeddings (pay-per-token) | ~$400 |
| AI Search Standard S2 × 2 replicas | ~$850 |
| Document Intelligence | ~$350 |
| Storage (10 TB) + Cosmos for chat | ~$600 |
| Content Safety | ~$200 |
| Observability + evaluation | ~$300 |
| **Total** | **~$7,200/month** |

Per-tenant attribution: tag every request with \`tenantId\`, aggregate \`tokens_in + tokens_out\` per tenant in App Insights, apply OpenAI pricing, chargeback. Transparent to the business.

## Common Pitfalls

- **No filter on tenant ID** → data leak across tenants, recall-ending bug
- **Fixed-size chunking** → poor retrieval quality, tables get split
- **No evaluation loop** → drift invisible until complaints pile up
- **Unbounded chat history in prompt** → token costs explode
- **Retrieving too many chunks** → signal-to-noise plummets, latency increases
- **Ignoring prompt injection** → legal/PR incidents
- **Using public OpenAI endpoint** → compliance failure

## Anti-Pattern: "Just Use the Copilot Starter"

Microsoft ships a "Chat with Your Data" starter. It's a good demo. It is not enterprise-ready. It shares the index across everyone, uses public endpoints, has no evaluation, and has no per-tenant auth. Use it to learn the patterns, then build a production version from this blueprint.

## Advanced: Query Routing

For multi-domain enterprises, a single RAG often fails. Instead:
- **Domain Router Function** classifies incoming questions (HR, Legal, Engineering)
- Routes to domain-specific indexes with domain-specific prompts
- Each domain has its own acceptable-use filters and citations

Dramatically improves answer quality at the cost of slightly higher latency.

## Fine-Tuning vs RAG

Don't fine-tune unless you genuinely need domain-specific tone or behavior. For **factual grounding**, RAG wins:
- RAG: add new documents → instant availability
- Fine-tune: new data → new training run → days to deploy

Fine-tune for **style** (legal briefs, specific tone). RAG for **facts**.

## Starter Template

Cloud Canvas Designer's RAG template deploys the full stack — ingest pipeline, AI Search with the schema above, Azure OpenAI with PTUs, Content Safety, App Insights, and the evaluation notebook. Exports to Terraform with parameterized tenant config.

## Final Word

A RAG system is only as trustworthy as its weakest link — and that link is rarely the model. It is the ingestion, the isolation, the evaluation, and the operations. Ship the boring stuff first; the model tier is the easiest part to upgrade later.`;


// ============================================================
// ARTICLE: pci-dss-payments-blueprint
// ============================================================
articleContent['pci-dss-payments-blueprint'] = `# PCI-DSS Payments Architecture: Scoping the CDE Properly

The most expensive mistake in payments architecture is making your entire platform part of the Cardholder Data Environment (CDE). Once a system touches primary account numbers (PAN), it is in scope for PCI-DSS — which means annual QSA audits, quarterly vuln scans, network segmentation proof, and dozens of controls every year.

Smart architecture reduces scope aggressively. Tokenize early, segment ruthlessly, and most of your platform stays **out of scope** entirely.

{{diagram:paymentsArch}}

## The Core Principle: Scope Reduction via Tokenization

The PAN is the radioactive element. Keep it in a small, tightly controlled zone. Everywhere else, store a **token** that represents the PAN but is worthless if stolen.

\`\`\`
Customer enters card → Payment Capture page (CDE) → Tokenization Service (CDE)
                                                   ↓
                              Token returned to Order API (out of scope)
                                                   ↓
                              All downstream systems store only the token
\`\`\`

> [!DANGER] If any backend system can retrieve the real PAN from the token, it is in scope too. Tokenization must be one-way from the application's perspective.

## Network Segmentation

| Zone | Contents | PCI Scope |
|------|----------|-----------|
| Public | Front Door + WAF | Out |
| App Zone | Web UI, Order API, analytics | Out (stores token only) |
| CDE | Payment API, tokenizer, HSM | **In scope** |
| Shared Svcs | Logging, monitoring, backup | Connected to CDE (in scope as "Connected System") |

Use a dedicated VNet for the CDE, peered to the hub. NSGs default-deny between App Zone and CDE except for specific tokenization and payment flows on port 443 with mTLS.

## Required Controls (Partial List)

- **Req 3 (Protect stored CHD):** Column encryption + CMK from Key Vault HSM (Premium, FIPS 140-2 Level 3)
- **Req 4 (Encrypt transmission):** TLS 1.2+ everywhere, mTLS in CDE
- **Req 6 (Secure development):** SAST + DAST + SBOM in CI
- **Req 7 (Restrict access):** RBAC with just-in-time PIM, no standing access
- **Req 8 (Strong auth):** MFA for all CDE access
- **Req 10 (Logging):** All access to CHD logged and retained 1 year minimum
- **Req 11 (Regular testing):** Quarterly ASV scans, annual pen test

## Logging and Monitoring

Every read, write, or decrypt of CHD must generate an audit log. Sentinel rules to deploy:

\`\`\`
- Multiple decrypts from a single principal in a short window
- Decrypts from unusual IP / location
- Failed auth on CDE services
- Privilege escalation attempts
- Database queries matching PAN regex patterns
\`\`\`

## Cost Shape

| Component | Monthly (USD) |
|-----------|---------------|
| Dedicated CDE VNet + Firewall | ~$1,800 |
| Key Vault Premium (HSM) | ~$1,000 |
| Payment API (isolated compute) | ~$900 |
| Tokenization service | ~$600 |
| Extra logging + Sentinel | ~$800 |
| Quarterly ASV + annual QSA | ~$3,500 (amortized) |
| **Total baseline overhead** | **~$8,600/mo** |

## What Makes This Blueprint Work

- Application logic never sees PAN — only tokens
- CDE is small enough to audit thoroughly
- Security controls concentrated where they matter
- Scope can be proven to QSA with a single network diagram

## Closing

PCI is not impossible. Most of the pain comes from teams that let the CDE sprawl across their platform. Scope it small, segment it hard, tokenize everything, and the annual audit becomes routine instead of traumatic.`;


// ============================================================
// ARTICLE: data-mesh-on-azure
// ============================================================
articleContent['data-mesh-on-azure'] = `# Data Mesh on Azure: Federated Ownership with Fabric and Purview

Central data teams become bottlenecks at scale. Domain teams know their data best but lack platform skills. Data mesh is the organizational and architectural response — domains own their data as products, the platform team provides self-service infrastructure, and governance is federated but consistent.

{{diagram:dataMesh}}

## The Four Principles

1. **Domain ownership** — each business domain owns its data pipeline and analytical datasets
2. **Data as a product** — domains publish curated, discoverable, versioned data products
3. **Self-serve platform** — central team provides reusable infra templates, not pipelines
4. **Federated computational governance** — global standards enforced by automation, local policy owned by domains

## Azure Services That Enable Mesh

| Principle | Azure Service |
|-----------|---------------|
| Self-serve workspaces | Fabric Workspaces per domain |
| Shared storage | OneLake (Fabric) or ADLS Gen2 |
| Catalog + lineage | Microsoft Purview |
| Access policies | Purview Data Policy + RBAC |
| Data quality | Purview Data Quality |
| Infra as code | Terraform modules from platform team |

## Domain Architecture

Each domain gets:
- A Fabric workspace with its own capacity (or shared capacity with quotas)
- Ingestion pipelines (Data Factory or notebooks) managed by the domain
- A Lakehouse with bronze/silver/gold layers
- Published data products registered in Purview

Gold-layer tables become **data products**: versioned, documented, SLA-backed, discoverable.

## Data Contracts

Every data product has a contract:

\`\`\`yaml
name: sales.customer_orders
version: 2.1
owner: sales-data-team@contoso.com
sla:
  freshness: "< 1 hour"
  availability: "99.5%"
schema:
  - name: order_id, type: string, pii: false
  - name: customer_id, type: string, pii: true
  - name: amount, type: decimal(10,2)
quality_rules:
  - order_id: not_null, unique
  - amount: > 0
\`\`\`

Contracts are version-controlled in Git. Breaking changes require a new major version.

> [!TIP] Use Purview's Data Quality rules to automate contract enforcement. Failed quality checks raise alerts and block downstream consumers from ingesting bad data.

## Common Pitfalls

- **Mesh without governance:** becomes anarchy. Purview is non-negotiable.
- **Over-centralized platform team:** reverts to the old monolith. Enable, don't gate.
- **No domain expertise:** forcing mesh on unprepared teams fails. Invest in data product manager training.
- **Ignoring interoperability:** domains pick different formats, joining products becomes impossible.

## When Mesh Is Wrong

Under 20-30 engineers or without distinct business domains, a centralized analytics team is simpler and faster. Mesh pays off at enterprise scale (>500 engineers, multiple business units).

## Closing

Data mesh is 70% organizational and 30% technical. Azure gives you the primitives — Fabric workspaces, OneLake, Purview. You have to build the socio-technical system: contracts, product thinking, and shared standards.`;


// ============================================================
// ARTICLE: saga-pattern-microservices
// ============================================================
articleContent['saga-pattern-microservices'] = `# The Saga Pattern on Azure: Distributed Transactions Without Two-Phase Commit

Classic distributed transactions (2PC) require every service to share a transaction coordinator. That does not scale and fails miserably across cloud microservices. The industry answer is the **saga pattern**: a sequence of local transactions with compensating actions for rollback.

{{diagram:saga}}

## Two Saga Styles

**Orchestration** — one central service (the orchestrator) calls each step and handles failures. State is kept centrally.

**Choreography** — services react to events from other services. No central brain. State is distributed.

Orchestration is easier to reason about and debug. Choreography scales better but is harder to visualize. Start with orchestration.

## The Azure-Native Choice: Durable Functions

**Azure Durable Functions** are purpose-built for orchestration sagas:
- State is persisted automatically
- Host crashes and restarts don't lose progress
- Retries are declarative
- Compensation is a first-class concept

\`\`\`csharp
[FunctionName("OrderSaga")]
public static async Task<OrderResult> RunOrchestrator(
    [OrchestrationTrigger] IDurableOrchestrationContext ctx)
{
    var order = ctx.GetInput<Order>();
    var reservation = await ctx.CallActivityAsync<ReservationResult>(
        "ReserveInventory", order);

    try
    {
        var payment = await ctx.CallActivityAsync<PaymentResult>(
            "ChargePayment", order);
        var shipment = await ctx.CallActivityAsync<ShipmentResult>(
            "AssignShipping", order);
        return new OrderResult { Success = true };
    }
    catch (FunctionFailedException ex)
    {
        // Compensating transactions run in reverse
        await ctx.CallActivityAsync("RefundPayment", order);
        await ctx.CallActivityAsync("ReleaseInventory", reservation);
        throw;
    }
}
\`\`\`

## Compensation Is Not Rollback

A saga does not undo a committed local transaction. It issues a **compensating transaction**: a new operation that semantically reverses the original.

- You cannot un-charge a credit card. You issue a refund.
- You cannot un-send an email. You send a correction.
- You can release an inventory reservation (release is itself a valid operation).

Every activity must have a compensating counterpart. Design them together.

## Idempotency Is Mandatory

Every step, forward and compensating, must be idempotent. If a retry happens, "charge $100" twice cannot charge $200. Use idempotency keys:

\`\`\`
POST /payments
Idempotency-Key: order-12345-attempt-1
\`\`\`

The payment service stores the key and returns the original response on duplicate requests.

## Observability

Because a saga spans many services, **correlation IDs** are critical. Every log line tied to \`orchestrationInstanceId\` so you can replay any saga end to end.

Durable Functions emits state history automatically — you can query "Show me every step this saga took and when."

> [!SUCCESS] The ability to replay a saga from its event history is the killer feature of orchestration. Support tickets go from hours of investigation to minutes.

## Common Mistakes

- Skipping compensations because "that step rarely fails" — it will
- Compensations that require the original state (lost after crashes)
- Non-idempotent steps — duplicate effects after retries
- Human approval steps without timeouts (saga hangs forever)

## When Saga Is Wrong

If your "distributed" operation is actually within one service's bounded context, use a single ACID transaction. Saga complexity only makes sense when independent services coordinate.

## Starter Template

Cloud Canvas Designer includes a Durable Function saga template with three example workflows (order, refund, subscription). Exports to Bicep with the Function App, Storage account, and App Insights wired.

## Closing

The saga pattern trades immediate atomicity for eventual consistency and operational complexity. In exchange, you get scalability and service autonomy. For most modern distributed systems, it is the right trade.`;


// ============================================================
// ARTICLE: active-passive-dr-blueprint
// ============================================================
articleContent['active-passive-dr-blueprint'] = `# Active-Passive Multi-Region DR: A Blueprint With RTO < 15 Minutes

The most common DR failure mode is not technology — it is process. Teams have replicas configured but nobody has actually failed over in two years. When the real incident happens, the runbook is stale, the credentials are expired, and everyone is learning the failover procedure under pressure.

This blueprint covers both the **technology architecture** and the **operational discipline** to achieve an RTO under 15 minutes and an RPO under 5 minutes at reasonable cost.

{{diagram:drActivePassive}}

## The Active-Passive Model

**Primary region** serves all production traffic. **Secondary region** exists as a warm standby: infrastructure is deployed, data replicates continuously, but the passive region takes no live traffic.

Failover is triggered manually (or automatically via Front Door health probes) when the primary is unhealthy beyond threshold.

## Front Door Priority Routing

The front door always has both origins configured with **priorities**:
- Primary origin: priority 1 (takes all traffic while healthy)
- Secondary origin: priority 2 (kicks in when priority 1 fails health probes)

Health probes run every 30 seconds. Failover happens within 3 consecutive failures — about 90 seconds of detection time.

## Data Replication

| Service | Replication Mode | RPO |
|---------|------------------|-----|
| Azure SQL | Active geo-replication (async) | < 5 sec |
| Storage | GRS or GZRS | < 15 min |
| Cosmos DB | Multi-region read (single master) | < 1 sec |
| Key Vault | Replicated automatically | Instant |
| App Config | Manual sync or pipeline | Varies |

SQL geo-replica is read-only until promoted. Storage GRS gives you a readable secondary endpoint. Cosmos replicas stay in sync within a bounded staleness guarantee.

## Failover Procedure

Documented, practiced, timed:

1. **Declare incident** (5 min SLA to declare after detection)
2. **Promote SQL geo-replica** to primary (2-5 min)
3. **Update Front Door origin priorities** — bump secondary to priority 1
4. **Validate synthetic smoke tests** on the new primary
5. **Communicate status** to stakeholders
6. **Monitor** for 30 minutes, then release incident

Total elapsed: 10-15 minutes if the runbook is sharp.

## The Non-Negotiable Discipline

> [!DANGER] DR that hasn't been tested isn't DR. It is a theory.

- **Quarterly DR drills** — actually fail over, measure RTO/RPO, run for 24 hours on the secondary, then fail back
- **Game days** — simulate random failures (region loss, DNS failure, SQL corruption)
- **Runbook as code** — failover steps automated in Azure Automation runbooks or pipelines, not docs
- **Break-glass credentials** — separate admin accounts for DR scenarios, tested quarterly

## Cost Shape

Secondary region costs ~30-50% of primary (smaller replicas, scaled-down compute, same data size). For a $20K/mo primary workload, budget ~$7-10K/mo for DR.

**Cost reduction tactic:** scale the secondary App Service plan to 1 instance at minimum tier when idle. During failover, scale it up via Automation before promoting.

## Common Mistakes

- No runbook, or runbook is a Word doc that hasn't been updated in years
- Secondary region uses different VM SKUs than primary (shortages during failover)
- Never tested failback — stuck in secondary indefinitely
- App config values hardcoded to primary region endpoints
- DNS TTLs set to 24 hours — no one can reach the failed-over app

## Active-Passive vs Active-Active

Active-active is technically superior — no downtime, no failover event. It is also 2x the infrastructure cost, data-layer complexity explodes with multi-region writes, and split-brain scenarios need handlers.

Active-passive wins for: cost sensitivity, simpler data models, acceptable 15-min RTO.

## Closing

Active-passive DR on Azure is well-supported and affordable. The hard part is the discipline — practicing until failover is a procedure, not an emergency. Budget the quarterly drill time; it pays off the first time you need it.`;

// ============================================================
// ARTICLE: azure-firewall-vs-nva
// ============================================================
articleContent['azure-firewall-vs-nva'] = `# Azure Firewall vs Third-Party NVAs: Honest Trade-Offs

Every enterprise Azure rollout eventually hits this fork: do we use Azure Firewall (Microsoft-native, managed) or bring in a third-party NVA like Palo Alto, Fortinet, or Check Point? Vendors will tell you theirs is best. The honest answer depends on three things: your existing skills, your feature requirements, and your operational budget.

{{diagram:firewallNva}}

## Feature Comparison

| Feature | Azure Firewall Premium | Palo Alto / Fortinet NVA |
|---------|------------------------|--------------------------|
| L3-L7 filtering | ✅ | ✅ |
| TLS inspection | ✅ | ✅ (feature-rich) |
| IDS/IPS | ✅ (signature-based) | ✅ (signature + behavior) |
| URL filtering | ✅ (categories) | ✅ (granular) |
| DNS proxy | ✅ | ✅ |
| User-based policies | ❌ | ✅ |
| App-ID / Layer 7 identification | Limited | ✅ |
| Managed service | ✅ (no VMs) | ❌ (you run VMs) |
| Auto-scale | ✅ | ❌ (you size VMSS) |
| HA | Built-in | You build it |
| Cross-cloud consistency | ❌ Azure only | ✅ Same vendor on AWS/GCP |

## When Azure Firewall Wins

- You are Azure-only or Azure-primary
- You want managed service (no VMs, no patching, no HA headache)
- Your policy needs are standard (URL categories, threat intel, basic L7)
- You don't have existing firewall vendor skills
- You want tight integration with Azure (Firewall Manager, Policy, Defender)

Cost: ~$1,500/mo Premium + bandwidth. One SKU, one bill.

## When NVA Wins

- You are multi-cloud — same vendor across clouds means one policy language
- You have existing firewall team with Palo Alto or Fortinet expertise
- You need advanced L7 identification (specific SaaS apps)
- You need granular user-based policies tied to AD groups
- Your compliance requires a specific vendor (rare but happens)

Cost: ~$2,500-4,000/mo for HA pair VMSS + licensing + management.

## Hybrid: Use Both

Some enterprises run **Azure Firewall for east-west (between spokes)** and **NVA for north-south (internet egress)**. The NVA provides advanced inspection for internet traffic; Azure Firewall handles internal segmentation cheaply.

> [!TIP] In Virtual WAN, Secured Virtual Hubs natively support Azure Firewall. For third-party NVAs, deploy via Routing Intent (available with most major vendors now).

## Operational Burden

Azure Firewall: zero VM patches, Microsoft handles the fleet. You manage policies.

NVA: you manage the VM scale set, OS updates, vendor software upgrades, HA config, auto-scale rules. Budget 10-20% of a platform engineer's time.

## Decision Framework

- **Azure-only + no vendor lock-in = Azure Firewall**
- **Multi-cloud with existing vendor = NVA**
- **Need advanced user/app identification = NVA**
- **Limited ops capacity = Azure Firewall**
- **Best-of-breed security posture, cost-no-object = NVA**

## Closing

Azure Firewall has closed most of the feature gap with NVAs over the last three years. For most net-new Azure workloads, it is the right default. NVAs still win when multi-cloud consistency or advanced inspection is a hard requirement.`;


// ============================================================
// ARTICLE: expressroute-vs-vpn
// ============================================================
articleContent['expressroute-vs-vpn'] = `# ExpressRoute vs Site-to-Site VPN: Which Hybrid Path?

Most enterprises connecting on-prem to Azure ask the same question: VPN or ExpressRoute? The answer usually ends up being **both** — but for different reasons than you might expect.

## The Core Differences

| Aspect | Site-to-Site VPN | ExpressRoute |
|--------|------------------|--------------|
| Transport | Public internet + IPsec tunnel | Private fiber circuit |
| Bandwidth | Up to ~10 Gbps (VPN Gateway VpnGw5) | 50 Mbps to 100 Gbps |
| Latency | Variable (internet-dependent) | Deterministic |
| SLA | 99.95% | 99.95% (dual circuits: 99.99%) |
| Setup time | Hours | Weeks (carrier-dependent) |
| Monthly cost | ~$300-1,400 | ~$300 (50 Mbps) to ~$15,000 (10 Gbps) + port fees |
| Encryption | Built-in IPsec | None by default (add MACsec) |

## When VPN Wins

- **Low bandwidth needs** (< 500 Mbps average)
- **Quick setup** — you need connectivity this week, not next quarter
- **Dev/test or branch offices** where cost matters
- **Backup path** for ExpressRoute (recommended design)

## When ExpressRoute Wins

- **High, predictable throughput** requirements (streaming data, database replication)
- **Latency-sensitive workloads** (VoIP, real-time trading)
- **Compliance** that forbids internet-traversing traffic
- **Microsoft peering** — direct access to M365, Dynamics, without going through your proxy

## The Reference Hybrid Topology

The design most enterprises end up with:

- **ExpressRoute** for primary production traffic (dedicated bandwidth, low latency)
- **Site-to-Site VPN** as a backup path (same GatewaySubnet, different gateway)
- **BGP** on both to auto-failover when ExpressRoute degrades

> [!TIP] ExpressRoute includes no SLA from your ISP. Keep the VPN backup active. A failed BGP session on your ER circuit and an inactive VPN = hours of downtime.

## Costs Over Time

| Month | VPN only | ER 1 Gbps Metered | ER 1 Gbps Unlimited |
|-------|----------|-------------------|---------------------|
| Gateway | $140 | $300 | $300 |
| Data out (5 TB) | included | ~$300 | included |
| Port fees | n/a | $300 | $300 |
| Total | **~$140** | **~$900** | **~$600** |

For heavy egress, ExpressRoute Unlimited pays for itself quickly.

## Closing

Start with VPN. Add ExpressRoute when your bandwidth or latency requirements justify the cost. Keep VPN as the backup. This layered approach matches how most production Azure enterprises are built.`;


// ============================================================
// ARTICLE: azure-dns-private-resolver
// ============================================================
articleContent['azure-dns-private-resolver'] = `# Azure DNS Private Resolver: Goodbye to DNS VMs

For years, hybrid DNS on Azure meant spinning up VMs running BIND, Unbound, or Windows DNS. You patched them, clustered them, and they became a scale problem every team ran into. Azure DNS Private Resolver replaces all of that with a managed service.

## What It Does

Provides DNS forwarding between Azure VNets and on-premises networks. Two endpoint types:
- **Inbound endpoints** — on-prem resolves Azure Private DNS zones by querying this IP
- **Outbound endpoints** — Azure resources resolve on-prem zones by forwarding queries here

## Architecture Pattern

\`\`\`
On-prem DNS                     Azure VNet (hub)
    ↓                                ↓
  conditional forwarder      Inbound endpoint IP
    → Azure resolver IP      → resolves privatelink.* zones
                                     ↓
                             Outbound endpoint
                             → forwards corp.contoso.com to on-prem DNS
\`\`\`

## Pricing

~$160/month for a Private Resolver + modest per-query charges. Compare to 2 DNS VMs at ~$180/month plus ops time.

## When You Do Not Need It

- Single-VNet scenarios with no hybrid requirement
- Very small environments where VM-based DNS works fine
- Scenarios using Entra Domain Services (which provides its own DNS)

## Starter Template

Cloud Canvas Designer's hub template includes Private Resolver with inbound/outbound endpoints already configured and linked to Private DNS zones for the common Azure services.`;


// ============================================================
// ARTICLE: virtual-wan-deep-dive
// ============================================================
articleContent['virtual-wan-deep-dive'] = `# Azure Virtual WAN: When It Beats Classic Hub-Spoke

Virtual WAN is Microsoft's managed "hub-spoke at scale" service. Instead of building and connecting regional hubs yourself, VWAN manages the hubs, routing, and any-to-any connectivity for you.

## When Virtual WAN Wins

- **3+ Azure regions** with spokes in each
- **Multiple ExpressRoute circuits** you want to manage centrally
- **SD-WAN appliances** in branch offices (VWAN has native partner integrations)
- **Any-to-any** branch-to-branch traffic without BGP gymnastics

## When Classic Hub-Spoke Wins

- 1-2 Azure regions
- Tight routing control needed
- Cost sensitivity (VWAN premium over classic = ~$700/mo per hub)

## Secured Virtual Hubs

VWAN supports Azure Firewall inside the hub natively. Enable it and you get:
- Managed firewall
- Routing intent for east-west and internet egress
- Central policy via Firewall Manager

## Cost Shape

Per hub: ~$180/mo base + ~$40/mo per connection + data transfer. A two-region VWAN with 8 spokes lands around ~$700-900/mo before firewall.

## Common Mistakes

- Mixing VWAN and classic hubs randomly — pick one model
- Not planning CIDR allocations across regions
- Forgetting that Secured Hubs require Routing Intent for east-west FW inspection

## Closing

For multi-region enterprises, Virtual WAN is worth the premium. For simpler footprints, classic hub-spoke wins on cost and control.`;


// ============================================================
// ARTICLE: defender-for-cloud-deep-dive
// ============================================================
articleContent['defender-for-cloud-deep-dive'] = `# Microsoft Defender for Cloud: CSPM + CWP Without the Buzzwords

Defender for Cloud has two jobs: **Cloud Security Posture Management (CSPM)** — audit your config against best practice, and **Cloud Workload Protection (CWP)** — runtime protection for VMs, containers, databases, and more.

## Secure Score

A single 0-100 number summarizing your posture. Each recommendation has a point value. Fix the high-point items first.

> [!STAT] A Secure Score jump from 50 to 70 typically prevents the majority of common attacks — misconfigured storage, public SQL endpoints, missing MFA.

## The Plans to Turn On

| Plan | Protects | Monthly |
|------|----------|---------|
| Servers (P2) | VMs + hybrid machines | ~$15/server |
| Containers | AKS + container registries | ~$7/vCore |
| Databases | SQL + open-source DB | ~$15/DB |
| Storage | Storage accounts | ~$0.02/10K transactions |
| Key Vault | Vaults | ~$2/10K transactions |
| DNS | DNS | ~$1/M queries |

## High-Value Findings to Fix First

1. MFA not enforced on admin accounts
2. Public IP on SQL / Storage / Key Vault
3. Diagnostic settings missing
4. VMs without endpoint protection
5. Containers running as root

## Regulatory Compliance Dashboard

Defender maps your findings to PCI-DSS, ISO 27001, SOC 2, HIPAA, and more. Great for audit prep — click a framework, see passing/failing controls.

## Common Mistakes

- Enabling Defender but not acting on findings
- Not piping alerts to Sentinel or ticketing
- Disabling Defender to save money (false economy — breaches are more expensive)

## Closing

Defender is the easiest security win on Azure. Turn it on, fix the top 10 findings monthly, and your posture improves fast.`;


// ============================================================
// ARTICLE: key-vault-secrets-rotation
// ============================================================
articleContent['key-vault-secrets-rotation'] = `# Azure Key Vault Secrets Rotation That Actually Works

Everyone knows they should rotate secrets. Most teams don't because rotation causes outages. Here is the pattern that works: **Event Grid + Function + dual-secret interval**.

## The Pattern

1. Key Vault secrets have a \`RotationPolicy\` with an interval (e.g., 60 days)
2. Before expiry, Key Vault fires an Event Grid event
3. A Function handler:
   - Generates a new secret in the target system (DB, storage, API)
   - Writes it to Key Vault as the new version
   - Old version stays active for grace period (7-14 days)
4. Applications read the **latest version** on startup and periodically refresh

## Applications Must Support Dual Secrets

During the grace period, both old and new secrets work. Applications refresh their cached secret every hour (or on 401 errors) to pick up the new one.

\`\`\`csharp
var secret = await kvClient.GetSecretAsync("db-password");
// cache for 1 hour, retry on auth failure
\`\`\`

## What You Can Rotate This Way

- SQL / PostgreSQL / MySQL passwords
- Storage account keys (swap primary ↔ secondary)
- API keys for external services (if the service allows dual active keys)
- Cosmos DB keys

## What You Cannot Easily Rotate

- Secrets embedded in baked VM images (rebuild the image)
- Secrets in on-prem config files (deploy new config)

For these, move to managed identities.

## Monitoring

Alert on:
- Rotation event failures
- Secrets not rotated in > 90 days
- Secrets accessed outside business hours (potential compromise)

## Closing

Secrets rotation done with events + functions + dual-secret overlap is painless. Managed Identities eliminate the need for most of them anyway — that is the end state.`;


// ============================================================
// ARTICLE: managed-identity-patterns
// ============================================================
articleContent['managed-identity-patterns'] = `# Managed Identity Patterns: Kill Every Secret in Your Azure Estate

Managed Identities are the single biggest security improvement most Azure shops can make. Every secret removed is a potential leak eliminated. This article covers the patterns that eliminate ~95% of connection strings, API keys, and passwords.

## System-Assigned vs User-Assigned

**System-assigned** — tied to a specific resource. Lifecycle matches the resource. Good for single-owner scenarios.

**User-assigned** — standalone identity. Multiple resources can share it. Good for resource-agnostic permissions (e.g., "all web tier instances use \`id-web-prod\`").

Default to user-assigned for production. It survives resource recreation and simplifies RBAC.

## Common Patterns

### App to Azure SQL
\`\`\`sql
CREATE USER [id-web-prod] FROM EXTERNAL PROVIDER;
ALTER ROLE db_datareader ADD MEMBER [id-web-prod];
\`\`\`

App connects with \`Authentication=Active Directory Default\`. No password.

### Function to Storage
Assign RBAC \`Storage Blob Data Contributor\` to the managed identity. Use \`DefaultAzureCredential\` in code. No storage key.

### Function to Key Vault
Assign \`Key Vault Secrets User\` role. Function reads secrets via managed identity.

### Container App to Cosmos DB
Assign \`Cosmos DB Built-in Data Contributor\` role. SDK uses \`DefaultAzureCredential\`.

## Workload Identity Federation

For cross-boundary scenarios (GitHub Actions, AWS, external IdP), use **federated credentials**. No shared secret — just trust via OIDC.

\`\`\`
GitHub Actions OIDC token → Federated credential in Entra ID
→ Access token for Azure resources
\`\`\`

This is how modern CI/CD deploys to Azure without stored service principal secrets.

## Anti-Patterns

- Falling back to "just use a service principal secret" because MI setup was hard
- Granting \`Contributor\` at subscription scope to identities — always least privilege
- Using system-assigned then deleting the resource (losing the RBAC assignments)

## Closing

Every time you reach for a connection string, ask: "could this be a managed identity?" Usually the answer is yes. Migrating is a quiet, high-impact security project.`;


// ============================================================
// ARTICLE: sentinel-detections-playbook
// ============================================================
articleContent['sentinel-detections-playbook'] = `# Microsoft Sentinel: 20 Detections Every Tenant Should Run

Sentinel out of the box ingests logs but doesn't detect anything specific to you. This article gives you the baseline detection pack — 20 KQL rules that catch 80% of common threats.

## Identity Detections

1. **Brute force sign-in attempts**
   \`\`\`
   SigninLogs | where ResultType in ("50126","50053") | summarize count() by IPAddress | where count_ > 10
   \`\`\`

2. **Impossible travel** — sign-ins from different countries within 1 hour

3. **Privilege escalation** — role assignments to privileged roles outside change windows

4. **MFA fatigue** — repeated MFA prompts for one user

5. **Admin sign-in without MFA** — should never happen; fire Sev-1

## Data Detections

6. **Mass data export** — Storage access with download > 1 GB in 10 min from a single principal

7. **Database dump** — SQL export operations outside maintenance window

8. **Key Vault mass secret access** — >20 secrets retrieved in 5 min

## Network Detections

9. **Firewall deny spike** — east-west deny count increases 5x baseline

10. **Unexpected outbound to TOR exits**

11. **DNS tunneling** — unusually long DNS queries

## Resource Detections

12. **Public IP assigned to VM** in a subscription where policy forbids it

13. **NSG rule allowing 0.0.0.0/0 on 22/3389** — should be blocked but verify

14. **Storage account public access enabled**

## Operational Detections

15. **Resource deletion spikes** — possible insider threat or compromised credential

16. **PIM activation outside business hours** — admin role activated overnight

17. **Orphaned subscription** — cost growing with no activity logs

## Container / AKS

18. **Privileged pod deployed** — security context allows privilege escalation

19. **Image pulled from untrusted registry**

## Generic

20. **Defender for Cloud Sev-1 alert correlated** with user sign-in

## Best Practice

- **Automate response** via Logic Apps: disable user, revoke tokens, isolate VM
- **Tune quarterly** — false positives kill adoption
- **Document each rule** with MITRE ATT&CK technique

## Closing

Deploying these 20 rules takes a few days of KQL work. The uplift in detection coverage is dramatic.`;


// ============================================================
// ARTICLE: container-apps-deep-dive
// ============================================================
articleContent['container-apps-deep-dive'] = `# Azure Container Apps: The Compute Platform Most Teams Should Use

Azure Container Apps sits between App Service and AKS. For many workloads, it is the right answer — you get containers, scale-to-zero, and Dapr sidecars without running a Kubernetes cluster.

{{diagram:containerAppsScale}}

## The Value Proposition

- Container-native (bring any image)
- Scale to zero (no idle cost)
- KEDA triggers built in (HTTP, queues, cron, custom metrics)
- Dapr sidecars for pub/sub, state, bindings
- Managed ingress with custom domains and TLS
- Revisions for blue/green

## When It Beats App Service

- You want containers without building your own image for App Service
- You need microservices with Dapr-style communication
- You want true scale-to-zero
- You are running event-driven workers (queue processors, Service Bus consumers)

## When AKS Still Wins

- You need custom networking (node NSGs, specific CNI)
- You run privileged workloads
- You need GPU with pod-level scheduling
- You want DaemonSets or advanced Kubernetes primitives

## Cost Shape

Consumption plan: $0 when idle, ~$0.000024/vCPU-second + memory. A service at 1 replica averaging 0.5 vCPU = ~$33/month continuous, $0 when off.

Dedicated plan: ~$200-800/month minimum for more isolation and network control.

## Migrating From App Service

Most App Service apps move to Container Apps in a day:
1. Build a container image (Dockerfile)
2. Push to Azure Container Registry
3. Deploy via \`az containerapp create\`
4. Update DNS

## Anti-Patterns

- Using Container Apps for latency-critical APIs with scale-to-zero (cold start)
- Migrating complex K8s Helm charts — usually better stay on AKS
- Missing health probes (leads to bad traffic routing on revision swaps)

## Closing

Container Apps is the 80% answer for modern container workloads on Azure. AKS when you need more. App Service when you want zero container work. Three tiers, pick wisely.`;


// ============================================================
// ARTICLE: aks-production-checklist
// ============================================================
articleContent['aks-production-checklist'] = `# AKS Production Checklist: 40 Things to Get Right Before Go-Live

AKS is powerful and also unforgiving. This checklist covers the 40 items our platform team verifies before any AKS cluster is declared production-ready.

## Cluster Setup (8 items)

1. Private cluster (API server not public)
2. Multiple availability zones across node pools
3. Azure CNI Overlay or Azure CNI (not Kubenet)
4. Workload Identity enabled (not pod identity — deprecated)
5. Azure AD integration for kubectl access
6. Cluster autoscaler configured with sensible min/max
7. System node pool separated from user workloads
8. Kubernetes version within N-1 of latest stable

## Networking (7 items)

9. UDR through Azure Firewall if required
10. Egress via NAT Gateway (not SLB default)
11. Private endpoints on Azure Container Registry
12. Network policies enabled (Azure or Calico)
13. Ingress controller chosen (AGIC, nginx, Application Gateway)
14. WAF policy on Application Gateway
15. External DNS for automatic DNS records

## Security (9 items)

16. Pod Security Standards enforced
17. Image scanning via Defender for Containers
18. Secrets via Key Vault CSI driver (not K8s secrets)
19. Network policies denying cross-namespace by default
20. Audit logging to Log Analytics
21. RBAC least-privilege
22. Azure Policy for AKS assigned
23. Private link on the ACR
24. No cluster-admin RBAC for human users

## Observability (5 items)

25. Container Insights enabled
26. App Insights for app-level traces
27. Prometheus metrics via Managed Prometheus
28. Alert rules for node pressure, pod restarts, cluster health
29. Workbook for cluster overview

## Scale and Performance (4 items)

30. HPA on every deployment
31. Resource requests and limits set
32. PodDisruptionBudgets for HA workloads
33. VPA recommendations reviewed monthly

## Cost (4 items)

34. Spot node pool for batch / dev workloads
35. Reservations on baseline node count
36. Karpenter or cluster autoscaler tuned
37. Node size diversity across pools

## Operations (3 items)

38. Upgrade cadence documented
39. Disaster recovery runbook
40. Automated cluster provisioning via IaC

## Closing

This list is the bar, not the ceiling. Mature teams layer on chaos engineering, cost anomaly alerts, and FinOps reviews on top. But if you hit all 40, you are in a much better place than most AKS adopters.`;


// ============================================================
// ARTICLE: gpu-compute-on-azure
// ============================================================
articleContent['gpu-compute-on-azure'] = `# GPU Compute on Azure: A100, H100, and Cost Survival Guide

Azure's GPU story got complicated — A100, H100, ND and NC series, with and without Infiniband, capacity reservations, and pricing that changes the math for any ML workload. Here is the current state.

## The Main SKUs

| Series | GPUs | Memory | Use case |
|--------|------|--------|----------|
| NCv3 | V100 (Volta) | 16 GB | Legacy inference |
| NDv4 | 8x A100 40GB | 320 GB | Training large models |
| ND H100 v5 | 8x H100 80GB | 640 GB | Modern LLM training |
| NC A100 v4 | 1-4x A100 80GB | 80-320 GB | Training + fine-tune |
| ND MI300X v5 | 8x AMD MI300X | 1.5 TB | Alternative to H100 |

## Cost Reality

| SKU | On-demand | 3-yr RI |
|-----|-----------|---------|
| Single A100 80GB (NC A100 v4) | ~$3.40/hr | ~$1.70/hr |
| 8x A100 (NDv4) | ~$27/hr | ~$13/hr |
| 8x H100 (ND H100 v5) | ~$99/hr | ~$50/hr |

Running an 8x H100 continuously = **$71,000/month**. Plan accordingly.

## Training vs Inference

**Training:**
- Prefer ND series with NVLink + InfiniBand for multi-node
- Use Batch or Azure ML for orchestrated jobs
- Spot when checkpointing is reliable (up to 90% discount)

**Inference:**
- Prefer NC single-GPU or A10 series
- Scale horizontally with AKS + GPU node pools
- Consider Azure OpenAI PTUs for LLM inference (better cost + SLA)

## Capacity Reality

H100 capacity is scarce. For guaranteed access:
- **Capacity Reservations** — hold capacity even when VMs are stopped
- **On-demand Capacity Reservations** — book a time window
- **Dedicated Host** — rare SKUs sometimes only available this way

## Cost Control

> [!WARNING] The #1 GPU cost bug: forgetting to stop the cluster after a training run. Always use auto-shutdown, budget alerts, and scheduled deallocate jobs.

- Auto-shutdown for dev/test VMs
- Azure ML job definitions auto-release compute
- Spot for checkpointed workloads
- Reservations for predictable inference fleets

## Closing

GPUs on Azure are powerful and expensive. The operational discipline — auto-shutdown, Spot for interruptible workloads, reservations for steady-state — makes the difference between "useful tool" and "budget emergency."`;


// ============================================================
// ARTICLE: serverless-patterns
// ============================================================
articleContent['serverless-patterns'] = `# Azure Functions Patterns: Fan-Out, Aggregator, and Durable Orchestration

Basic HTTP triggers are where most teams stop. But Functions' real power comes from the advanced patterns — Durable Functions orchestrations, fan-out/fan-in, and event chaining.

## Pattern 1: Function Chaining

Sequential steps in a workflow:

\`\`\`csharp
[FunctionName("ProcessOrder")]
public static async Task<Order> Run(
    [OrchestrationTrigger] IDurableOrchestrationContext ctx)
{
    var order = ctx.GetInput<Order>();
    order = await ctx.CallActivityAsync<Order>("ValidateOrder", order);
    order = await ctx.CallActivityAsync<Order>("CalculateTax", order);
    order = await ctx.CallActivityAsync<Order>("ReserveInventory", order);
    return order;
}
\`\`\`

## Pattern 2: Fan-Out/Fan-In

Parallel tasks that all complete before the next step:

\`\`\`csharp
var tasks = new List<Task<Result>>();
foreach (var item in items)
    tasks.Add(ctx.CallActivityAsync<Result>("ProcessItem", item));

var results = await Task.WhenAll(tasks);
var summary = await ctx.CallActivityAsync<Summary>("Aggregate", results);
\`\`\`

Great for: batch processing, parallel API calls, multi-region fan-out.

## Pattern 3: Async HTTP APIs

Long-running work exposed as async HTTP:

\`\`\`
POST /jobs      → 202 Accepted + statusQueryGetUri
GET  /jobs/{id} → { status: "Running" | "Completed", output: ... }
\`\`\`

Durable Functions provides this out of the box.

## Pattern 4: Human Interaction / Approval

Orchestration waits for external input:

\`\`\`csharp
await ctx.WaitForExternalEvent<bool>("ApprovalGranted", TimeSpan.FromDays(3));
\`\`\`

Great for: approval workflows, 2FA, escalations with timeouts.

## Pattern 5: Event Aggregator

Durable Entities accumulate state across events:

\`\`\`csharp
[FunctionName("Counter")]
public static void Run([EntityTrigger] IDurableEntityContext ctx)
{
    switch (ctx.OperationName)
    {
        case "add":    ctx.SetState((int)ctx.GetState<int>() + ctx.GetInput<int>()); break;
        case "reset":  ctx.SetState(0); break;
    }
}
\`\`\`

## Pattern 6: Monitor Pattern

Poll something until a condition is met, then act:

\`\`\`csharp
while (!cancelled)
{
    var status = await ctx.CallActivityAsync<Status>("CheckStatus", id);
    if (status == Status.Done) break;
    await ctx.CreateTimer(ctx.CurrentUtcDateTime.AddSeconds(30), CancellationToken.None);
}
\`\`\`

## Anti-Patterns

- Using Functions for always-on request-response at high QPS (App Service is cheaper)
- Not setting max execution time — runaway orchestrations
- Heavy external libraries on Consumption plan (cold starts are painful)
- Storing state in Function memory (it is stateless — use Durable Entities)

## Closing

Durable Functions is one of Azure's underrated gems. Workflow orchestration, retries, state, and async HTTP — all without running a workflow engine.`;


// ============================================================
// ARTICLE: azure-fabric-overview
// ============================================================
articleContent['azure-fabric-overview'] = `# Microsoft Fabric: The Data Platform Unification Play

Microsoft Fabric is Microsoft's bet on unifying data platforms. Instead of Synapse + Power BI + Data Factory + multiple lakes, you get one SaaS platform with one storage layer (OneLake) and one capacity SKU.

{{diagram:fabric}}

## The Workloads

Fabric bundles:
- **Data Factory** — pipelines and dataflows
- **Data Engineering** — Spark notebooks
- **Data Warehouse** — T-SQL analytics
- **Real-Time Intelligence** — KQL + Event Streams
- **Data Science** — ML experiments
- **Power BI** — reports and semantic models

All on OneLake (delta-parquet in ADLS Gen2 under the hood).

## Why Unify?

- One copy of data instead of per-tool copies
- Unified security via Purview integration
- Copilot across all workloads
- Single billing (capacity SKU like F2, F16, F64)

## Capacity Sizing

| SKU | Monthly | Use case |
|-----|---------|----------|
| F2 | ~$263 | Small workloads, testing |
| F16 | ~$2,100 | Team-level analytics |
| F64 | ~$8,400 | Department-scale |
| F256 | ~$33,500 | Enterprise |

Capacity smooths across workloads — you can burst spark during the day and use the same CU for BI refreshes overnight.

## When Fabric Makes Sense

- You have Power BI already at scale
- Data platform is fragmented across Synapse / Databricks / Power BI
- Team wants SaaS experience without infra management
- You want Copilot across data workloads

## When Databricks Still Wins

- Heavy Spark + MLflow + Unity Catalog investments
- Strong preference for best-of-breed specialized tools
- Multi-cloud strategy (Fabric is Azure-only)

## Closing

Fabric is early-stage but rapidly maturing. For Microsoft-stack enterprises, it reduces data platform complexity significantly. For best-of-breed teams, Databricks and Synapse are still valid.`;


// ============================================================
// ARTICLE: cosmos-db-partition-keys
// ============================================================
articleContent['cosmos-db-partition-keys'] = `# Cosmos DB Partition Keys: The Decision That Makes or Breaks Your App

Partition key choice is the single most important design decision in Cosmos DB. Get it right: Cosmos scales linearly and costs are predictable. Get it wrong: hot partitions, throttles, bills 5x what they should be.

## Core Principles

1. **High cardinality** — tens of thousands of distinct values, not 5
2. **Even access distribution** — no one partition takes 80% of traffic
3. **Scoped queries** — most queries filter on the partition key

## Good Examples

- **Per-tenant SaaS:** \`tenantId\` — each tenant's workload is a partition
- **IoT telemetry:** \`deviceId\` or \`deviceId_yyyyMMdd\` for time-bucketed
- **User profile store:** \`userId\`

## Bad Examples

- \`status\` with 5 values — throttle city
- \`date\` — all writes today go to one partition
- \`region\` with 3 values — 3 partitions for the whole DB

## Synthetic Partition Keys

For hot entities, combine values:

\`\`\`
partitionKey = "{tenantId}_{bucket}"
where bucket = orderId % 100
\`\`\`

Spreads traffic for a large tenant across 100 logical partitions.

## Signs You Picked Wrong

- "429 Too Many Requests" with plenty of provisioned RU/s
- Metrics Explorer shows one partition taking >70% of RU
- Write latency p95 much higher than p50
- Provisioning 10x the RU/s just to avoid throttles

## Fixing It

Cosmos does not let you change the partition key on an existing container. Options:
- Create a new container with the right key
- Use Change Feed to migrate data
- Switch application to the new container
- Drop the old one

Plan for this — it is the most common Cosmos DB migration.

## Closing

Spend 2x as long on partition key design as you think you should. The cost of getting it wrong compounds for years.`;


// ============================================================
// ARTICLE: vector-databases-azure
// ============================================================
articleContent['vector-databases-azure'] = `# Vector Databases on Azure: AI Search vs pgvector vs Cosmos

Every RAG project needs a vector store. Azure gives you three main choices. Here is how to pick.

{{diagram:vectorDb}}

## AI Search — The Default for RAG

- Hybrid search (vector + BM25) with semantic reranker
- Built for search workloads, scales to billions of docs
- Native security filters (RBAC, per-tenant)
- Starts at ~$420/month for Standard S1

**Pick when:** building RAG, enterprise search, or need the reranker quality boost.

## pgvector — Same DB as Your App

- Adds vector similarity to PostgreSQL
- SQL joins between vectors and metadata
- ~$175/month Flexible Server baseline
- HNSW and IVFFlat indexes

**Pick when:** AI feature in an existing Postgres app, moderate scale (<10M vectors).

## Cosmos DB Vector

- MongoDB vCore or NoSQL API with vector support
- Global distribution, multi-region writes
- Starts at ~$600/month

**Pick when:** global-scale AI app, Cosmos is already in the stack.

## Decision Matrix

| Need | Winner |
|------|--------|
| Best RAG quality out of the box | AI Search |
| Minimize stack complexity | pgvector |
| Global distribution | Cosmos |
| Lowest cost at moderate scale | pgvector |
| Hybrid search + reranker | AI Search |
| Complex filters + joins | pgvector |

## Closing

For most enterprise RAG, AI Search. For embedded AI in existing apps, pgvector. For global B2C AI apps, Cosmos. Pick based on workload, not hype.`;


// ============================================================
// ARTICLE: delta-lake-on-azure
// ============================================================
articleContent['delta-lake-on-azure'] = `# Delta Lake on Azure: ACID on Your Data Lake

Data lakes were never designed for transactional integrity. Delta Lake fixes that — ACID transactions, schema enforcement, and time travel on top of Parquet files.

## What Delta Gives You

- **ACID transactions** across multiple files
- **Schema enforcement** — rejects incompatible writes
- **Schema evolution** — add columns safely
- **Time travel** — query any historical version
- **MERGE** — upserts (CDC patterns)
- **Z-ordering** — co-locate related data for fast reads

## Where It Runs

- **Microsoft Fabric** — OneLake is delta-native
- **Synapse Spark** — Delta is default for Spark 3+
- **Databricks** — where it was born
- **Azure Data Explorer** — can read delta externally

## Classic Use Cases

- **Medallion architecture** — Bronze (raw) → Silver (cleaned) → Gold (aggregated)
- **Slowly changing dimensions** — MERGE handles SCD Type 2 elegantly
- **CDC ingestion** — apply changes from source systems idempotently

## Common Pitfalls

- Small file problem — too many tiny parquet files slow queries. Use \`OPTIMIZE\`.
- Not running \`VACUUM\` — old versions accumulate storage costs
- Schema drift without evolution policy — writes fail silently

## Closing

Delta is the default table format for the modern lakehouse. Learn MERGE, OPTIMIZE, and VACUUM and you are 80% there.`;


// ============================================================
// ARTICLE: privileged-identity-management
// ============================================================
articleContent['privileged-identity-management'] = `# PIM Deep Dive: Eliminate Standing Admin Access

Privileged Identity Management (PIM) turns "I am a Global Admin 24/7" into "I can activate Global Admin for 2 hours with MFA and approval." Standing access → just-in-time activation.

## The Roles to PIM-Enable

Everything privileged:
- Global Administrator
- Privileged Role Administrator
- Security Administrator
- Exchange / SharePoint / Teams admin
- User Administrator
- Billing Administrator
- Azure subscription Owner / Contributor (yes, Azure roles too)

## Role Settings That Matter

| Setting | Recommended |
|---------|-------------|
| Activation max duration | 4-8 hours |
| Require MFA on activation | Always |
| Require justification | Always |
| Require ticket number | For regulated environments |
| Require approval | For highest-privilege roles (Global Admin) |
| Approvers | Minimum 2 people |
| Notification on activation | Email security team |

## Break-Glass Strategy

Keep 2 cloud-only accounts that are:
- **Permanent Global Admins** (no PIM on them)
- Excluded from Conditional Access policies
- Password in a physical safe
- Tested quarterly
- Alert on any sign-in

## Access Reviews

Quarterly: review who has eligible roles. Remove anyone who has not activated in 90 days.

## Common Mistakes

- PIM for tier-0 admin but not tier-1 (Exchange admin can often reset passwords)
- Approval workflows routed to one person who is on vacation — access blocked
- Not monitoring PIM activation patterns — unusual activations are a red flag

## Closing

PIM reduces your attack surface by making privilege ephemeral. Audit trail, time-bound access, and approval gates — the foundation of Zero Trust identity.`;


// ============================================================
// ARTICLE: entra-id-b2c-vs-external-id
// ============================================================
articleContent['entra-id-b2c-vs-external-id'] = `# Entra External ID: What Replaces Azure AD B2C in 2026

Microsoft merged B2B and B2C into one product: **Entra External ID**. Existing Azure AD B2C tenants keep working, but new projects should default to External ID.

## What Changed

- Unified tenant model (no separate B2C tenant)
- Modern user flows (like B2C's custom policies but simpler)
- External ID pricing — ~$0.03/MAU for basic, ~$0.15/MAU for premium
- Richer developer experience with Microsoft Entra Identity Platform

## Migration From Legacy B2C

- Existing B2C tenants keep working indefinitely
- New tenants cannot be created as B2C — External ID only
- Migration tool from Microsoft available for small tenants
- Large tenants: plan for 3-6 month migration project

## When to Use

- SaaS apps with customer-facing auth
- Consumer apps (mobile, web)
- B2B + B2C combined (federate with customers' IdPs)

## Integration Points

- OAuth 2.0 / OIDC for modern apps
- SAML for legacy SaaS
- API integration for custom auth flows
- Conditional Access for customer sign-ins too

## Closing

If starting fresh in 2026, use External ID. If on legacy B2C, no rush — Microsoft committed to long support. Plan migration for your next major app refresh.`;


// ============================================================
// ARTICLE: workload-identity-federation
// ============================================================
articleContent['workload-identity-federation'] = `# Workload Identity Federation: Secrets-Free CI/CD to Azure

Storing service principal secrets in GitHub or Azure DevOps is a security liability. Federated credentials eliminate the secret entirely.

{{diagram:devopsPipeline}}

## How It Works

1. GitHub Actions issues a short-lived OIDC token on every workflow run
2. Your Entra ID app registration has a **federated credential** configured with:
   - Issuer: \`https://token.actions.githubusercontent.com\`
   - Subject: \`repo:org/repo:environment:production\`
3. GitHub exchanges the OIDC token for an Azure access token
4. No secret stored anywhere

## Setup

\`\`\`bash
az ad app federated-credential create --id $APP_ID --parameters '{
  "name": "github-prod",
  "issuer": "https://token.actions.githubusercontent.com",
  "subject": "repo:myorg/myrepo:environment:production",
  "audiences": ["api://AzureADTokenExchange"]
}'
\`\`\`

Then in GitHub Actions:

\`\`\`yaml
permissions:
  id-token: write
steps:
  - uses: azure/login@v1
    with:
      client-id: \${{ secrets.AZURE_CLIENT_ID }}
      tenant-id: \${{ secrets.AZURE_TENANT_ID }}
      subscription-id: \${{ secrets.AZURE_SUBSCRIPTION_ID }}
\`\`\`

## Supported Platforms

- GitHub Actions (OIDC)
- Azure DevOps (service connections federated mode)
- GitLab, Bitbucket, Terraform Cloud, and most modern CI
- AWS IAM → Azure (for cross-cloud workload identity)

## Benefits

- Zero secrets to rotate or leak
- Per-environment, per-branch scoping
- Audit log shows workflow + commit hash that authenticated
- Revocable by removing the federated credential

## Common Mistakes

- Subject too broad (\`repo:myorg/*\`) — any repo can use this identity
- Not scoping by environment (prod credentials usable from any branch)
- Leaving behind legacy secrets after migrating to federation

## Closing

Federated workload identity is the modern way to authenticate CI/CD. No reason to ever store a service principal secret again.`;


// ============================================================
// ARTICLE: entra-id-access-reviews
// ============================================================
articleContent['entra-id-access-reviews'] = `# Access Reviews and Entitlement Management: Governance That Scales

Manually reviewing who has access to what is a nightmare at enterprise scale. Entra's Access Reviews and Entitlement Management automate joiner-mover-leaver.

## Access Reviews

Periodic reviews of group membership, role assignments, and app access.

**Patterns that work:**
- Self-review (user attests they still need access)
- Manager review (manager approves continued access)
- Stale access detection (inactive users flagged)

Schedule quarterly for privileged roles, semi-annually for standard groups.

## Access Packages (Entitlement Management)

Bundles of resources users request access to:
- Group memberships
- App assignments
- Azure resource roles
- Teams, SharePoint sites

**Benefits:**
- Self-service request portal for employees
- Approval workflows
- Auto-expiry on access
- Terms-of-use acceptance
- Audit trail

## Lifecycle Workflows

Joiner: auto-provision based on HR event → attributes → Access Packages
Mover: revoke old access, grant new based on new role
Leaver: deprovision everything on termination

## Closing

Without automation, access review becomes security theater — boxes checked without thought. With Access Reviews + Entitlement Management, the system guides reviewers and enforces hygiene.`;


// ============================================================
// ARTICLE: kql-cheatsheet
// ============================================================
articleContent['kql-cheatsheet'] = `# KQL Cheatsheet: The 30 Queries That Solve 80% of Problems

Kusto Query Language is the query language of Azure Log Analytics, App Insights, and Sentinel. Here are the 30 queries I find myself writing over and over.

{{diagram:kqlFlow}}

## Incident Investigation

**1. Failed requests in the last hour**
\`\`\`
requests | where timestamp > ago(1h) and success == false
| summarize count() by name, resultCode
\`\`\`

**2. Slowest requests**
\`\`\`
requests | where timestamp > ago(24h) | top 20 by duration desc
\`\`\`

**3. Correlate request → dependencies**
\`\`\`
union requests, dependencies, exceptions
| where operation_Id == "abc123"
| order by timestamp asc
\`\`\`

**4. Exception frequency by type**
\`\`\`
exceptions | summarize count() by type | order by count_ desc
\`\`\`

## Performance Analysis

**5. P50/P95/P99 latency**
\`\`\`
requests | summarize percentiles(duration, 50, 95, 99) by name
\`\`\`

**6. RED metrics over time**
\`\`\`
requests
| summarize rate=count(), errors=countif(success==false), p95=percentile(duration, 95) by bin(timestamp, 5m)
| render timechart
\`\`\`

**7. Slow dependencies**
\`\`\`
dependencies | where timestamp > ago(24h)
| summarize avg(duration) by target | top 10 by avg_duration desc
\`\`\`

## Security Hunting

**8. Sign-in failures by IP**
\`\`\`
SigninLogs | where ResultType !in ("0","50058") 
| summarize count() by IPAddress, UserPrincipalName
| where count_ > 10
\`\`\`

**9. Role assignments in last 24h**
\`\`\`
AuditLogs | where OperationName contains "Add member to role"
| where TimeGenerated > ago(24h)
\`\`\`

**10. Key Vault secret access spikes**
\`\`\`
AzureDiagnostics | where ResourceType == "VAULTS" and OperationName == "SecretGet"
| summarize count() by identity_claim_oid_s, bin(TimeGenerated, 5m)
\`\`\`

## Cost Analysis

**11. Top 10 most expensive log tables**
\`\`\`
Usage | where TimeGenerated > ago(30d)
| summarize GB=sum(Quantity)/1024 by DataType
| top 10 by GB desc
\`\`\`

**12. App Insights ingestion by app**
\`\`\`
AppTraces | summarize count() by AppRoleName, bin(TimeGenerated, 1d)
\`\`\`

## Infrastructure

**13. VM CPU over 80%**
\`\`\`
Perf | where CounterName == "% Processor Time" and CounterValue > 80
| summarize avg(CounterValue) by Computer, bin(TimeGenerated, 5m)
\`\`\`

**14. AKS pod restart count**
\`\`\`
KubePodInventory | where TimeGenerated > ago(1h)
| summarize max(PodRestartCount) by PodName, Namespace
| where max_PodRestartCount > 5
\`\`\`

**15. Storage account throttling**
\`\`\`
StorageBlobLogs | where StatusCode in (429, 503)
| summarize count() by AccountName
\`\`\`

## Network

**16. Firewall top denies**
\`\`\`
AZFWNetworkRule | where Action == "Deny"
| summarize count() by SourceIp, DestinationIp, DestinationPort
| top 20 by count_ desc
\`\`\`

**17. DNS query spike**
\`\`\`
AZFWDnsQuery | summarize count() by QueryName, bin(TimeGenerated, 5m)
| where count_ > 1000
\`\`\`

## App Insights Specifics

**18. Slow DB queries**
\`\`\`
dependencies | where type == "SQL" and duration > 1000
| project timestamp, target, data, duration
\`\`\`

**19. User sessions in last hour**
\`\`\`
pageViews | where timestamp > ago(1h)
| summarize dcount(user_Id) by bin(timestamp, 5m)
| render timechart
\`\`\`

**20. Browser errors**
\`\`\`
exceptions | where client_Type == "Browser"
| summarize count() by type, outerMessage | top 20 by count_ desc
\`\`\`

## Tips

- \`ago(1h)\` > \`datetime(...)\` for readability
- \`summarize\` before \`order by\` for performance
- \`project\` early to reduce columns
- \`parse\` for structured string fields
- \`render timechart | piechart | barchart\` for visual output

## Closing

Save this as a snippets file. Half of Azure operator work is KQL — the sooner these become muscle memory, the faster you resolve incidents.`;


// ============================================================
// ARTICLE: managed-prometheus-grafana
// ============================================================
articleContent['managed-prometheus-grafana'] = `# Azure Managed Prometheus + Grafana: CNCF on Azure Done Right

If your team came from Kubernetes, the Prometheus + Grafana stack is muscle memory. Microsoft has a managed version — **Azure Monitor Managed Service for Prometheus** and **Azure Managed Grafana** — that removes the ops burden while keeping the familiar tooling.

## Azure Managed Prometheus

- Ingests standard Prometheus metrics via remote-write
- PromQL-compatible query endpoint
- 18-month retention included
- Deeply integrated with AKS (one-click enable)

**Pricing:** ~$0.16 per million samples ingested.

## Azure Managed Grafana

- Managed Grafana OSS
- Entra ID auth built-in
- Managed updates, HA, backups
- Private networking supported
- ~$8/month per editor + ~$9/GB storage

## When You Prefer This Over Azure Monitor

- Existing Prometheus exporters and dashboards
- Team already knows PromQL
- Need granular custom metrics (Prometheus beats Azure Monitor here)
- Want CNCF ecosystem (Alertmanager, Thanos, etc.)

## When Azure Monitor Native Wins

- Azure resources outside Kubernetes (VMs, App Service, Functions)
- Heavy log integration + KQL
- Cost-sensitive (platform metrics are free)

## Hybrid: Use Both

- Managed Prometheus for AKS custom metrics
- Azure Monitor for Azure platform metrics
- Grafana has native connectors to both — unified dashboards

## Closing

For K8s-first shops, Managed Prometheus + Grafana is the sweet spot. You keep your dashboards, your alerts, your skills, and ditch the ops burden of running the stack yourself.`;


// ============================================================
// ARTICLE: opentelemetry-on-azure
// ============================================================
articleContent['opentelemetry-on-azure'] = `# OpenTelemetry on Azure: One SDK, Many Backends

OpenTelemetry is the vendor-neutral standard for telemetry. Instrument your app once, send to multiple backends, switch observability tools without rewriting code.

## What OTel Covers

- **Traces** (distributed tracing)
- **Metrics** (time-series)
- **Logs** (structured logs)

## The Azure Story

- **App Insights** accepts OTel directly via the Azure Monitor OpenTelemetry Exporter
- **Managed Prometheus** accepts OTel metrics
- **Container Insights** integrates OTel Collector

## Why Switch From Vendor SDKs

- Future-proof: move to any backend without code changes
- Richer auto-instrumentation for many languages
- Standardized semantic conventions (HTTP, DB, messaging)

## Typical Setup

\`\`\`python
from azure.monitor.opentelemetry import configure_azure_monitor
configure_azure_monitor(connection_string=os.environ["APPLICATIONINSIGHTS_CONNECTION_STRING"])

# Standard OTel APIs work now
from opentelemetry import trace
tracer = trace.get_tracer(__name__)
with tracer.start_as_current_span("my-operation") as span:
    span.set_attribute("customer_id", "abc123")
\`\`\`

## OTel Collector Pattern

For microservices at scale, deploy an OpenTelemetry Collector as a DaemonSet or Deployment. Apps send OTLP locally; the collector fans out to App Insights + Prometheus + Loki as needed.

## Closing

OpenTelemetry is the strategic direction. New apps should instrument with OTel from day one.`;


// ============================================================
// ARTICLE: slo-error-budgets
// ============================================================
articleContent['slo-error-budgets'] = `# SLOs and Error Budgets: Turning SRE Theory Into Azure Alerts

SLO (Service Level Objective) is a target for system health — "99.9% of requests complete in < 500ms." The **error budget** is \`1 - SLO\` — how much failure you can tolerate in a given window.

## The Power of Error Budgets

- Under budget → ship features fast
- Over budget → freeze deploys, focus on reliability

Removes the engineering-vs-product fight with data.

## Defining SLIs (Service Level Indicators)

Good SLIs:
- **Availability:** successful requests / total requests
- **Latency:** p95 request duration
- **Throughput:** requests served / requests attempted
- **Freshness:** how stale can data be?

Bad SLIs:
- CPU utilization (not user-facing)
- Queue depth (internal)

## Computing SLOs in Azure

\`\`\`kql
requests | where timestamp > ago(30d)
| summarize good = countif(success==true), total = count()
| extend slo = todouble(good) / total
\`\`\`

Compare to target (e.g., 99.9%). Remaining error budget = \`(slo - target) * total\`.

## Burn Rate Alerts

Alert not when you hit 100% of budget, but when burn rate is too fast:
- **Fast burn:** 2% of budget in 1 hour → page on-call
- **Slow burn:** 10% of budget in 6 hours → create ticket

Both are multi-window alerts in Azure Monitor.

## Anti-Patterns

- SLOs too tight (99.99% when your customers tolerate 99.5%)
- SLOs too loose (100%? That is a promise you cannot keep)
- Ignoring error budget (always freezing or never freezing)
- Measuring wrong thing (CPU is not an SLI)

## Closing

SLOs make reliability a negotiation between teams, using data. That changes the culture more than any tool.`;


// ============================================================
// ARTICLE: finops-organizational
// ============================================================
articleContent['finops-organizational'] = `# FinOps on Azure: Org Model, Tags, and Chargeback That Stick

Tactical cost optimization saves money once. **FinOps** is the cultural and organizational discipline that keeps saving money indefinitely.

## The FinOps Framework

Three phases, repeated cyclically:

1. **Inform** — visibility via tags, dashboards, allocation
2. **Optimize** — right-sizing, reservations, anomaly detection
3. **Operate** — governance, automation, policies

## The Org Model

- **FinOps Practitioner** — single owner of the program (day 1 hire)
- **FinOps Champions** — one per team, meet monthly
- **Executive Sponsor** — CFO or CTO-level
- **Cloud Governance Board** — reviews costs quarterly

## Tagging as the Foundation

Required tags enforced via Azure Policy:
- \`CostCenter\`
- \`Environment\` (prod, dev, test)
- \`Application\`
- \`Owner\`
- \`DataClassification\`

Without tags, no chargeback, no attribution, no accountability.

## Chargeback vs Showback

- **Showback:** teams see their costs, no financial transfer
- **Chargeback:** teams' budgets are actually charged

Start with showback (easier). Move to chargeback once tagging is 95%+ compliant.

## Metrics That Matter

- Cost per customer (SaaS)
- Cost per transaction (e-commerce)
- Cost per developer (platform teams)
- Cost per month-over-month change
- % of spend on reservations/savings plans

## Common Failure Modes

- FinOps as a one-off project, not ongoing
- No tagging enforcement
- Reservations underutilized
- Teams not incented to save
- Anomalies caught too late (monthly review > weekly)

## Closing

FinOps is cultural. Processes and tools without cultural adoption fail. Start with one team, show the savings, expand.`;


// ============================================================
// ARTICLE: reservations-savings-plans
// ============================================================
articleContent['reservations-savings-plans'] = `# Reservations vs Savings Plans: The Decision Framework

Azure offers two ways to trade commitment for discount: Reservations (RIs) and Savings Plans. Use them wrong and you either overspend on pay-go or lock in the wrong SKU.

{{diagram:reservations}}

## The Quick Rule

- **RIs** — when the SKU is stable and you will run it unchanged for 1-3 years
- **Savings Plans** — when your compute shape changes (regions, VM families) but your dollar spend is predictable

## What RIs Cover Best

- Azure SQL (per-vCore, stable for years)
- Cosmos DB (provisioned throughput)
- Cache for Redis
- Synapse dedicated pool
- VM SKUs that will not change

## What Savings Plans Cover Best

- VMs across multiple families (D-series, E-series, F-series)
- Container Apps + AKS where pods shift node families
- Multi-region compute

## Portfolio Approach

Most mature orgs use **both**:
- Reservations for steady Azure SQL + baseline VMs
- Savings Plans for evolving compute workloads

Target: 60-70% of compute spend covered, 30-40% on-demand for flex.

## Buying Strategy

- Analyze 90 days of usage, not just a week
- Commit to 80-90% of observed baseline, not 100%
- Start with 1-year; graduate to 3-year for very stable workloads
- Exchange RIs quarterly as portfolio evolves

## Shared Scope vs Single Subscription

Shared scope = discount applies across subscriptions in the billing profile. Single = just one sub. Shared is better for most enterprises.

## Closing

Commit conservatively. Over-committing wastes 30% of the committed spend. Under-committing leaves savings on the table. Aim for the 80% confidence level.`;


// ============================================================
// ARTICLE: aks-cost-optimization
// ============================================================
articleContent['aks-cost-optimization'] = `# AKS Cost Optimization: Cut Your Kubernetes Bill 40%

AKS can be expensive fast — a moderate cluster runs $3-5K/month. Most of it is waste. Here is the stacked optimization path that typically cuts 40-60%.

{{diagram:aksCost}}

## Right-Size Node Pools

- Start with general-purpose D-series; upgrade specific pools to memory-optimized (E-series) or compute-optimized (F-series) based on workload
- Monitor node CPU + memory utilization for 30 days before right-sizing

## Multiple Node Pools

- **System pool:** small D-series for system components
- **User pool:** sized for your apps
- **Spot pool:** for non-critical, batch, dev workloads (up to 90% discount)
- **GPU pool:** only when needed, with scale-to-zero via autoscaler

## Cluster Autoscaler Tuning

- Set low \`minCount\` (e.g., 2-3 nodes) — scale up is fast
- \`scale-down-delay-after-add\` = 10m
- \`scale-down-unneeded-time\` = 10m

## Pod-Level

- HPA on every deployment
- VPA recommendations enabled (for monitoring, not auto-apply)
- Set resource requests accurately — too high wastes; too low evicts

## Reservations + Savings Plans

- 3-year RI on baseline nodes (your minCount nodes)
- Savings Plan for the dynamic portion

## Storage

- Premium SSD only where needed
- Use Azure Files Standard (not Premium) for low-IO use cases
- Delete orphaned PVs after workload migrations

## Monitoring Cost Itself

- Log Analytics ingestion is often the second-largest AKS cost
- Use Basic logs for verbose container stdout
- Sampling on high-volume app logs

## Closing

The path from $10K/mo to $4K/mo on AKS is usually: right-size, spot pool, HPA, reservations. Stack them and savings compound.`;


// ============================================================
// ARTICLE: egress-cost-control
// ============================================================
articleContent['egress-cost-control'] = `# Azure Egress Costs: The Hidden Killer And How to Tame It

Egress is the surprise on every cloud bill. Compute and storage you expect. Egress sneaks up when your architecture routes data in expensive patterns.

## Egress Rates

| Path | Price |
|------|-------|
| Inter-region (zone-to-zone within region) | Free |
| Inter-region (within continent) | ~$0.02/GB |
| Cross-continent | ~$0.05-0.08/GB |
| Internet egress | ~$0.087/GB (with tiered discounts) |
| CDN egress | ~$0.04/GB (tier 1) |

First 100GB/month free per account.

## Where Egress Hides

- **VMs in region A chatting with storage in region B.** Keep compute and data co-located.
- **AKS pods pulling images from a registry in another region.** Use ACR geo-replication.
- **Data warehouses exporting to Power BI across regions.** Use same-region compute.
- **Log Analytics cross-region ingestion.** Put workspace in the same region as sources.

## CDN for Egress

Front Door or Azure CDN egress rates are lower than region egress, and cache reduces origin requests too.

## Private Link for PaaS

Egress to PaaS over Private Endpoints stays on Microsoft backbone (cheaper + faster).

## ExpressRoute Direct

For very heavy egress to on-prem, ExpressRoute Unlimited plans can be cheaper than metered VPN egress.

## Monitoring

- Cost Analysis filtered on "Bandwidth" meter category
- Per-service egress dashboard

## Anti-Pattern Case Study

A customer had 200 TB/month egress billing ~$17K. Root cause: backup tool in EastUS pushing to S3 in us-east-1. After switching to same-region Azure Blob + replicating: savings $14K/mo.

## Closing

Audit egress quarterly. The biggest wins are architectural — co-locate compute and data, use CDN, use Private Link.`;


// ============================================================
// ARTICLE: github-actions-to-azure
// ============================================================
articleContent['github-actions-to-azure'] = `# GitHub Actions → Azure: Deployment Patterns That Scale

GitHub Actions deploying to Azure is the modern default. Here are the patterns that scale from "one repo" to "hundreds of services across dozens of teams."

{{diagram:devopsPipeline}}

## Foundation: OIDC + Federated Credentials

No stored secrets. Every workflow gets a short-lived token to authenticate to Azure. See the Workload Identity Federation article for setup.

## Reusable Workflows

Define once, call from many:

\`\`\`yaml
# .github/workflows/deploy-bicep.yml
on:
  workflow_call:
    inputs:
      environment: { type: string, required: true }
\`\`\`

Individual apps call it:

\`\`\`yaml
jobs:
  deploy:
    uses: myorg/workflows/.github/workflows/deploy-bicep.yml@v1
    with:
      environment: production
\`\`\`

## Environment Protections

Per-environment rules:
- Required reviewers for production
- Wait timers (e.g., 5 min before prod)
- Branch restrictions (only main can deploy prod)
- Environment secrets (separate from repo secrets)

## Multi-Stage Pipelines

- Build artifact once
- Deploy to dev → smoke test → staging → canary → prod
- Same artifact flows through; no rebuild per environment

## Terraform/Bicep Patterns

- **PR plan, main apply** — plan in PR comment, apply on merge
- **Drift detection** — scheduled plan against production
- **State locks** — RBAC on the state storage account

## Cost Reporting in PR

Add InfraCost or Azure Dev Cost APIs to show projected cost impact per PR. Massive FinOps win.

## Closing

Modern Azure CI/CD is federated auth + reusable workflows + environment protections + plan-on-PR. Nail those and you ship fast and safely.`;


// ============================================================
// ARTICLE: azure-devops-vs-github
// ============================================================
articleContent['azure-devops-vs-github'] = `# Azure DevOps vs GitHub Enterprise: Where Each Still Wins

Microsoft owns both. New investment goes to GitHub. But Azure DevOps isn't dying yet. Here is the honest decision framework.

## When GitHub Wins

- You want the best code collaboration UX (PRs, code review)
- You need Copilot deep integration
- You want GitHub Actions (ecosystem much larger than Azure Pipelines)
- You are starting fresh in 2026

## When Azure DevOps Still Wins

- You use Azure Boards for complex enterprise work management
- You have significant investment in classic pipelines / TFVC
- You need advanced branch policies or build triggers not in GitHub yet
- Regulated environments where DevOps offers needed compliance (e.g., specific Azure Government features)

## Migration Path

Microsoft provides migration tools:
- Repos: git push
- Work items: Azure DevOps Migration Tools → GitHub Issues / Projects
- Pipelines: rewrite in Actions (usually a project in itself)

## Typical Outcome

Most enterprises run both for a while:
- **Code + CI/CD on GitHub**
- **Work management on Azure Boards** (larger orgs with complex capacity planning)

Over 2-3 years, Boards often migrates to GitHub Projects or Azure DevOps continues for that one team.

## Closing

New projects: GitHub. Existing: stay on DevOps until migration ROI exists. Both are safe Microsoft bets for 5+ years.`;


// ============================================================
// ARTICLE: policy-as-code-azure
// ============================================================
articleContent['policy-as-code-azure'] = `# Policy as Code on Azure: Guardrails That Actually Hold

Azure Policy is the guardrail layer that prevents bad things at creation time. Done right, it becomes invisible to good-faith engineers and blocks mistakes.

## Effects to Know

- **Deny** — blocks the operation. Use sparingly; it stops people.
- **Audit** — logs but doesn't block. Good for discovery.
- **Append** — adds fields to resources (e.g., tags).
- **Modify** — modifies existing fields (e.g., defaulting TLS version).
- **DeployIfNotExists** — deploys a companion resource (e.g., diagnostic settings).

## The Minimum Policy Set

- **Deny public IPs on VMs** (except in explicitly tagged subnets)
- **Require HTTPS on storage**
- **Require diagnostic settings** to the central workspace
- **Require TLS 1.2+ everywhere**
- **Require tags** (CostCenter, Environment, Owner)
- **Restrict allowed regions**
- **Deny classic resources** (legacy ARM)

## Testing Policies

Before assigning to prod:
1. Assign in **Audit** mode
2. Review non-compliant resources for a week
3. Fix the violations
4. Switch to **Deny** mode

## Exemptions That Don't Rot

- Exemptions must have an expiry date
- Categorize reason (waiver, mitigated, exempt-by-design)
- Review quarterly — remove rotten exemptions

## Custom Policies

For scenarios Microsoft doesn't ship:
- Denying specific SKUs
- Enforcing naming conventions
- Blocking specific resource providers

Define in JSON, version in Git, deploy via pipeline.

## Closing

Azure Policy is the quiet hero of enterprise governance. Well-configured, it prevents the top 20 misconfigurations without anyone noticing. Poorly configured, it becomes the team's biggest blocker. Tune carefully.`;


// ============================================================
// ARTICLE: platform-engineering-azure
// ============================================================
articleContent['platform-engineering-azure'] = `# Platform Engineering on Azure: Build the Golden Path

Platform engineering is the trend replacing old-school SRE and DevOps. The platform team builds an **internal developer platform (IDP)** — a "golden path" app teams use to get work done without learning every Azure service.

## Components of a Golden Path

- **Self-service onboarding** — request a new workload, get a subscription + VNet + pipeline in minutes
- **Service templates** — "start a new microservice" → generated repo with CI/CD, logging, observability
- **Runtime paved road** — Container Apps or AKS with opinionated defaults
- **Developer portal** — Backstage or Azure DevOps wiki

## Common Components

- **Backstage** — open-source IDP (now in CNCF)
- **Azure DevOps service catalogs** — tasks as reusable modules
- **Terraform modules** — infrastructure primitives
- **GitHub Template Repos** — project scaffolding

## Why This Matters

Instead of every team learning:
- Azure Policy
- Hub-spoke networking
- RBAC patterns
- Observability setup
- CI/CD pipelines

They get it all pre-built. Faster time to production, consistent ops posture, less drift.

## Anti-Patterns

- Platform team becomes a gate, not an enabler
- Golden path is so opinionated teams can't diverge when needed
- No metrics on platform adoption

## Closing

Modern enterprise Azure is platform-engineered. App teams build features. Platform team builds the paved road. Split roles deliberately.`;


// ============================================================
// ARTICLE: naming-tagging-standards
// ============================================================
articleContent['naming-tagging-standards'] = `# Azure Naming and Tagging: The Convention That Actually Scales

Every enterprise has a naming and tagging doc. Most fail because they are too long, too strict, or enforced ad-hoc. Here is the pattern that sticks.

## Naming Format

\`\`\`
<type>-<workload>-<env>-<region>-<seq>
\`\`\`

Examples:
- \`vm-api-prod-eus-001\`
- \`sql-catalog-dev-weu-001\`
- \`st-shared-prod-eus-001\` (storage — global unique, so 'st' prefix + unique)

## Type Abbreviations (CAF Standard)

| Resource | Prefix |
|----------|--------|
| Resource Group | rg |
| VM | vm |
| Storage Account | st |
| SQL Server | sql |
| SQL DB | sqldb |
| VNet | vnet |
| Subnet | snet |
| Key Vault | kv |
| App Service Plan | asp |
| Function App | func |
| AKS | aks |
| Container Registry | cr |
| Log Analytics | log |

Microsoft's [CAF naming guide](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/azure-best-practices/resource-abbreviations) is the standard.

## Required Tags

| Tag | Example |
|-----|---------|
| \`CostCenter\` | CC-1234 |
| \`Environment\` | prod \\| dev \\| test |
| \`Application\` | Catalog |
| \`Owner\` | platform-team@contoso.com |
| \`DataClassification\` | Public \\| Internal \\| Confidential \\| Restricted |

## Enforcement

Three-layer:
1. **Azure Policy** — \`deny\` on missing tags at resource creation
2. **CI/CD gates** — Terraform validation before apply
3. **Periodic scan** — Resource Graph query flags drift

## Common Mistakes

- Too many required tags (>7 creates resistance)
- Names too long (>64 chars breaks some resources)
- No lowercase enforcement (consistency dies)
- Changing the convention after adoption — fragmenting compliance

## Closing

Short, enforced, visible. That is the trifecta of a convention people follow. Pick 5 tags, 10 prefixes, and stop arguing.`;


// ============================================================
// ARTICLE: subscription-strategy
// ============================================================
articleContent['subscription-strategy'] = `# Azure Subscription Strategy: One Subscription Is Never the Answer

The question every enterprise asks early: "how many subscriptions?" The bad answer is "one big one." The right answer depends on your org, but follows predictable patterns.

## Forces Pushing You to MORE Subscriptions

- **Quotas** (VM cores, public IPs, reserved IPs are per-sub)
- **Blast radius isolation** (sub is a strong trust boundary)
- **Cost attribution** (clean per-cost-center billing)
- **Compliance** (PCI, HIPAA benefit from isolation)
- **RBAC simplicity** (sub-level roles are clean)

## Forces Pushing to FEWER

- **Management overhead** (each sub has setup cost)
- **Reservation pooling** (shared scope works across subs, but cleanest within)
- **Cross-service communication** (peering + DNS + RBAC complexity)

## Typical Patterns

**Small (1-10 apps):** 2-4 subs
- prod, non-prod, sandbox, management

**Medium (10-50 apps):** 10-20 subs
- One per workload family × environment
- Platform subs separate (management, connectivity, identity)

**Large (50+ apps):** 50-100+ subs
- One per significant workload × environment
- Multiple platform subs per region
- Sandbox per business unit

## Naming

\`\`\`
sub-<business-unit>-<workload-family>-<env>
sub-retail-catalog-prod
sub-platform-management-global
\`\`\`

## Management Groups

- Group subs under MGs for policy inheritance
- Structure follows Microsoft's CAF reference (see Landing Zones article)

## Closing

Start with ~5 subs even for a small org (prod, dev, test, mgmt, connectivity). Scale from there. A flat "one subscription for everything" is a long-term debt.`;


// ============================================================
// ARTICLE: disaster-recovery-patterns
// ============================================================
articleContent['disaster-recovery-patterns'] = `# Disaster Recovery Patterns: Backup, Active-Passive, Active-Active

DR is not one-size-fits-all. Different workloads deserve different postures based on RTO, RPO, cost, and complexity.

## The Four Patterns

| Pattern | RTO | RPO | Cost |
|---------|-----|-----|------|
| Backup-only | hours-days | hours | lowest |
| Pilot Light | hours | minutes | low |
| Warm Standby (Active-Passive) | < 15 min | < 5 min | medium |
| Active-Active | 0 | 0 (eventual consistency) | highest |

## Pattern 1: Backup-Only

Azure Backup stores VMs, SQL, files. On disaster:
1. Provision fresh infrastructure (IaC)
2. Restore data
3. Cut over

**RTO:** 2-24 hours depending on data size.

**Cost:** storage only (~$5-30/VM/month).

Good for: dev/test, non-critical prod.

## Pattern 2: Pilot Light

Infrastructure exists in secondary region but sized small. Data replicates. On failover, scale up.

**RTO:** 1-3 hours.

## Pattern 3: Warm Standby (Active-Passive)

Full infrastructure in both regions. Primary active; secondary idle but ready. See the Active-Passive DR article for the detailed blueprint.

**RTO:** < 15 min.

## Pattern 4: Active-Active

Both regions serve traffic. No failover — traffic shifts.

**RTO:** ~0 (user sessions may blip).

**Cost:** 2x baseline + data replication complexity.

Good for: global-scale consumer apps, financial systems.

## Picking per Workload

- **Tier-0 (payments, core API):** Active-Active
- **Tier-1 (customer-facing):** Warm Standby
- **Tier-2 (internal apps):** Pilot Light
- **Tier-3 (dev, test):** Backup-only

## Testing

Quarterly drills for Tier-0 and Tier-1. Annual for others. Untested DR is theory.

## Closing

Match the pattern to the business impact. Over-engineering DR costs as much as skipping it — balance deliberately.`;


// ============================================================
// ARTICLE: multi-region-architecture
// ============================================================
articleContent['multi-region-architecture'] = `# Multi-Region Architecture: Active-Active Is Harder Than It Looks

Adding a second region sounds like a simple infrastructure change. It is really a data consistency problem in disguise.

{{diagram:multiRegionActiveActive}}

## The Core Problem: Writes

Reading from multiple regions is easy — caches, CDN, read replicas. **Writing** from multiple regions requires you to solve:

- **Consistency** — two writes to the same record from different regions. Who wins?
- **Conflict resolution** — custom handlers needed for true multi-write stores
- **Replication lag** — read-after-write behavior becomes non-intuitive
- **Split-brain** — network partition means both regions think they are authoritative

## Data Services Ranked by Difficulty

1. **Cosmos DB with multi-region writes** — purpose-built. Last-write-wins or custom conflict handlers.
2. **Azure SQL Business Critical Zone Redundant** — single write region with HA.
3. **Azure SQL with Failover Group** — active-passive with seconds-RPO replica.
4. **PostgreSQL with logical replication** — DIY, complex.
5. **Redis geo-replication** — async, eventual consistency.

## Application Patterns

- **Region-affinity:** each user pinned to one region's writes
- **Event sourcing:** events append-only, projected asynchronously
- **CRDTs:** conflict-free replicated data types — complex but powerful

## Routing

Front Door with:
- Geo-proximity routing (nearest region)
- Weighted routing (canary new region at 10%)
- Priority routing (active-passive)
- Health-based failover

## Testing

- Chaos test by dropping regional links
- Measure replication lag under load
- Practice conflict resolution on Cosmos CRLL rules

## Closing

Multi-region is a capability, not a feature toggle. Plan the data consistency model first; infrastructure second.`;


// ============================================================
// ARTICLE: sql-server-to-azure-sql
// ============================================================
articleContent['sql-server-to-azure-sql'] = `# SQL Server → Azure SQL: DMS, Managed Instance, and the Gotchas

Moving SQL Server to Azure is one of the most common migrations. Pick the right target, use the right tool, avoid the landmines.

## Target Selection

| Target | When |
|--------|------|
| Azure SQL DB | Modern app, single DB, new greenfield |
| Azure SQL Managed Instance | Existing SQL Server workload with features like SQL Agent, linked servers, CLR |
| SQL Server on VM | Need full control, OS-level features, cross-instance features unavailable in MI |

Most legacy workloads land on Managed Instance.

## The Tools

**Azure Database Migration Service (DMS)** — managed service for online migrations. Continuously replicates. Short cutover window.

**Data Migration Assistant (DMA)** — local tool for pre-assessment. Flags compatibility issues.

**Backup/Restore** — simple for MI: restore .bak from blob storage.

## Common Gotchas

- **SQL Agent jobs** — migrate to MI (supports SQL Agent) or rewrite in Data Factory / Functions for Azure SQL DB
- **Linked servers** — MI supports; DB does not
- **Cross-DB queries** — MI does; DB requires Elastic Query (different syntax)
- **CLR assemblies** — MI; not DB
- **Full-text search** — supported on both
- **SSIS packages** — migrate to Azure Data Factory or SQL MI with Integration Runtime
- **Encrypted columns** — re-configure; key material changes

## Migration Runbook

1. Pre-assess with DMA
2. Stand up target (MI typically)
3. Configure DMS project
4. Continuous sync for 1-2 weeks
5. Plan cutover window
6. Freeze app writes
7. Final DMS sync
8. Cutover connection strings
9. Validate
10. Keep source online for 1-2 weeks as fallback

## Post-Migration

- Right-size the tier (DMS sizing tends to overestimate)
- Enable Advanced Threat Protection
- Set up Active Geo-Replication for DR
- Apply Reservations once stable

## Closing

SQL migrations are well-trodden. DMA + DMS remove most surprises. The cutover is the scariest hour; everything else is well-understood.`;


// ============================================================
// ARTICLE: vmware-to-azure
// ============================================================
articleContent['vmware-to-azure'] = `# VMware to Azure: AVS vs Native — the Real Decision

You run VMware on-prem. You're going to Azure. Azure VMware Solution lets you run vSphere natively in Azure. Native Azure forces you to leave VMware behind. Which is right?

## AVS — VMware in Azure

- Full vSphere, NSX-T, vSAN running on dedicated bare-metal
- Your existing VMware tooling (vCenter, PowerCLI) works unchanged
- VMs move with VMware HCX replication
- No rearchitecture — lift and shift

**Pros:** fastest migration, minimal app change.
**Cons:** expensive (~$12K/month minimum for 3 hosts), does not take advantage of Azure PaaS.

## Native Azure Migration

- VMs become Azure IaaS VMs (Hyper-V under the hood)
- Use Azure Migrate for replication + cutover
- Requires minor tooling changes, same apps
- Opens door to modernization over time (VM → App Service → Container Apps)

**Pros:** much cheaper, modernization path, native Azure integration.
**Cons:** minor app changes, team re-skilling, networking adjustments.

## Decision Framework

**Pick AVS when:**
- Hard deadline (datacenter eviction)
- Complex VMware-specific dependencies (stretched clusters, NSX micro-seg)
- Budget accommodates
- Intermediate step before future modernization

**Pick Native when:**
- Long-term cost matters
- Team has (or can build) Azure skills
- Willing to invest in migration effort (re-networking, re-monitoring)
- Want to modernize over time

## Hybrid

Many enterprises use AVS for hard-to-move workloads and Native for everything else. Both in the same tenant via hub-spoke.

## Closing

AVS is a great tactical option when timelines force it. Strategic long-term is usually Native with a modernization roadmap. Pick based on constraints, not hype.`;


// ============================================================
// ARTICLE: aws-to-azure-migration
// ============================================================
articleContent['aws-to-azure-migration'] = `# AWS to Azure: Service Mappings and Honest Gotchas

Cross-cloud migrations happen for business reasons (Microsoft agreements, vendor rationalization) more than technical ones. If you have to do it, here is the honest map.

## Service Mapping

| AWS | Azure | Effort |
|-----|-------|--------|
| EC2 | Azure VM | Easy (VHD convert) |
| S3 | Blob Storage | Easy (AzCopy from S3) |
| Lambda | Functions | Medium (runtime + triggers differ) |
| RDS (PostgreSQL) | Azure Database for PostgreSQL | Easy (pg_dump) |
| RDS (Aurora) | Azure Cosmos DB for PostgreSQL or Azure SQL | Medium |
| DynamoDB | Cosmos DB | Medium-hard (partition key rethink) |
| SQS | Service Bus | Easy |
| SNS | Event Grid + Service Bus Topics | Easy |
| Kinesis | Event Hubs | Medium |
| ElastiCache | Azure Cache for Redis | Easy |
| EKS | AKS | Medium (networking differs) |
| CloudFront | Azure Front Door | Easy (config map) |
| Route 53 | Azure DNS + Traffic Manager | Easy |
| IAM | Entra ID + RBAC | Hard (model differs) |
| CloudFormation | Bicep / ARM | Hard (rewrite) |
| Terraform AWS provider | Terraform AzureRM | Medium |

## The Hardest Parts

1. **Identity model mismatch.** AWS IAM is resource-centric. Entra ID is identity-centric. RBAC works differently.
2. **Networking differences.** AWS VPCs and Azure VNets are similar but route tables, NACLs, security groups all behave subtly differently.
3. **DNS migration.** Propagation delays during cutover.
4. **CloudFormation → Bicep.** Rewrite, not translate. The templates have different models.
5. **Custom Lambda layers / runtimes.** Azure Functions has different runtime constraints.

## The Easiest Parts

- Storage migration (AzCopy from S3 to Blob is well-oiled)
- Databases (pg_dump + DMS covers most)
- Container images (just push to ACR)

## Recommended Sequence

1. Foundation (landing zone, identity, network)
2. Low-criticality VMs and databases
3. Queue-based async workloads
4. Web tier (with DNS cutover)
5. Identity-heavy systems last

## Cost Considerations

- Azure is generally 10-20% cheaper for equivalent compute
- Data egress from AWS during migration: budget $0.09/GB — can be significant
- Reservations + Savings Plans once stabilized

## Closing

AWS→Azure migration is not a technology problem; it is an organizational and skill-building problem. Plan 12-18 months for moderate portfolios. Do not underestimate identity.`;


// ============================================================
// ARTICLE: mainframe-modernization
// ============================================================
articleContent['mainframe-modernization'] = `# Mainframe Modernization on Azure: Not All Roads Lead to Rewrite

Mainframe migrations are the most expensive projects in enterprise IT. Get the disposition wrong and you will burn 5-10 years and tens of millions with little to show.

## The Four Dispositions

1. **Rehost** — run COBOL/CICS on Azure VMs with emulation (LzLabs, Micro Focus)
2. **Re-architect** — gradual decomposition into microservices
3. **Rebuild** — full rewrite as cloud-native
4. **Replace** — buy SaaS (for common apps like payroll, GL)

## Rehost with Emulation

LzLabs Software Defined Mainframe or Micro Focus Enterprise Server run existing COBOL, JCL, CICS on Linux VMs.
- Minimal app change
- Significant license cost saved vs mainframe
- Modernize gradually once on Azure

## Re-architect

Strangler Fig pattern: wrap the mainframe with APIs, slowly migrate functionality out. Multi-year but allows steady progress.

## Rebuild

Full rewrite. High risk. Reserve for apps where rewrite cost < 5x rehost cost, or strategic apps being replaced anyway.

## Replace

Payroll, accounting, HR — common enterprise systems often have SaaS alternatives. Dispose of in-house; buy Workday / SAP / Oracle cloud.

## Decision Framework

- **Strategic + complex + stable:** rehost, modernize over 5+ years
- **Strategic + candidate for rewrite:** re-architect
- **Commodity + SaaS exists:** replace
- **Dying + not worth rewrite:** retain until sunset

## Common Mistakes

- "We will rewrite everything in 2 years" — almost never happens
- Underestimating data migration (mainframe data formats are exotic)
- Forgetting batch jobs, which are often 70% of mainframe workload
- No testing strategy for re-platformed code

## Closing

Mainframe migration is a portfolio decision. Rehost the complex stuff, replace the commodity stuff, rewrite only what truly needs it. Patience and pragmatism win.`;
