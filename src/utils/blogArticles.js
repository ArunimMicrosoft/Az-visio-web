// Azure architecture blog articles
// Static content — no CMS, no backend needed. Add articles to the array below.

// Per-category color palette used across cards and article accents
export const categoryColors = {
  'Best Practices': { bg: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', solid: '#6366f1', tint: '#eef2ff' },
  'Networking':     { bg: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)', solid: '#0891b2', tint: '#ecfeff' },
  'DevOps':         { bg: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', solid: '#ef4444', tint: '#fef2f2' },
  'Compute':        { bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', solid: '#059669', tint: '#ecfdf5' },
  'Cost':           { bg: 'linear-gradient(135deg, #f59e0b 0%, #eab308 100%)', solid: '#d97706', tint: '#fffbeb' },
  'Security':       { bg: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', solid: '#be185d', tint: '#fdf2f8' },
};

export const blogArticles = [
  {
    slug: 'well-architected-framework-5-pillars',
    title: 'Azure Well-Architected Framework: The 5 Pillars Explained',
    excerpt: 'A practical guide to the 5 WAF pillars and how to apply them to your cloud architecture.',
    category: 'Best Practices',
    readTime: '8 min',
    date: '2026-04-01',
    icon: '🏛️',
    author: "Arunim's IT Café",
  },
  {
    slug: 'hub-spoke-network-topology',
    title: 'Hub-Spoke Network Topology: The Enterprise Standard',
    excerpt: 'Why hub-spoke is the de facto standard for enterprise Azure networks, and how to design one correctly.',
    category: 'Networking',
    readTime: '10 min',
    date: '2026-03-28',
    icon: '🔗',
    author: "Arunim's IT Café",
  },
  {
    slug: 'terraform-vs-bicep-vs-arm',
    title: 'Terraform vs Bicep vs ARM: Which IaC Should You Choose?',
    excerpt: 'Comparing the three main Azure infrastructure-as-code options with honest trade-offs.',
    category: 'DevOps',
    readTime: '7 min',
    date: '2026-03-25',
    icon: '🔧',
    author: "Arunim's IT Café",
  },
  {
    slug: 'aks-vs-app-service-vs-functions',
    title: 'AKS vs App Service vs Functions: Choosing Your Compute',
    excerpt: 'A decision framework for choosing between Azure Kubernetes Service, App Service, and Azure Functions.',
    category: 'Compute',
    readTime: '9 min',
    date: '2026-03-20',
    icon: '⚡',
    author: "Arunim's IT Café",
  },
  {
    slug: 'cost-optimization-strategies',
    title: '10 Azure Cost Optimization Strategies That Actually Work',
    excerpt: 'Practical tactics to cut your Azure bill by 30-50% without sacrificing performance or reliability.',
    category: 'Cost',
    readTime: '12 min',
    date: '2026-03-15',
    icon: '💰',
    author: "Arunim's IT Café",
  },
  {
    slug: 'private-endpoints-vs-service-endpoints',
    title: 'Private Endpoints vs Service Endpoints: Which to Use?',
    excerpt: 'Understanding the security and networking trade-offs between these two Azure private connectivity options.',
    category: 'Security',
    readTime: '6 min',
    date: '2026-03-10',
    icon: '🔐',
    author: "Arunim's IT Café",
  },
];

export const articleContent = {
  'well-architected-framework-5-pillars': `# Azure Well-Architected Framework: The 5 Pillars Explained

The Azure Well-Architected Framework (WAF) is Microsoft's set of guiding tenets for building high-quality workloads on Azure. Every serious cloud architect should know these five pillars inside out.

## 1. Reliability
Design for failure. Assume every component can fail at any time and build redundancy accordingly.

**Key practices:**
- Deploy across multiple availability zones
- Use Traffic Manager or Front Door for geo-redundancy
- Implement retry logic with exponential backoff
- Set up automated backups and disaster recovery

## 2. Security
Protect data, systems, and identities. Defense in depth is the only real strategy.

**Key practices:**
- Use Azure AD for identity
- Store secrets in Key Vault
- Enable Microsoft Defender for Cloud
- Use Private Endpoints for PaaS services
- Enforce network segmentation

## 3. Cost Optimization
Get the most value from your cloud spend.

**Key practices:**
- Use Reserved Instances (up to 72% savings)
- Right-size VMs based on actual usage
- Use Spot VMs for interruptible workloads
- Set up budgets and alerts
- Auto-shutdown dev/test environments

## 4. Operational Excellence
Run and monitor systems to deliver value continuously.

**Key practices:**
- Infrastructure as Code (Terraform, Bicep)
- CI/CD pipelines
- Centralized logging with Log Analytics
- Automated alerting
- Chaos engineering

## 5. Performance Efficiency
Use resources efficiently as demand changes.

**Key practices:**
- Autoscale based on load
- Cache aggressively (Redis, CDN)
- Choose the right data store per workload
- Use async patterns

## Conclusion
The WAF is not a checklist — it's a mindset. Balance the pillars based on your business requirements. Cloud Canvas Designer validates your architecture against all 5 pillars automatically.`,

  'hub-spoke-network-topology': `# Hub-Spoke Network Topology: The Enterprise Standard

Hub-spoke is the most widely adopted enterprise Azure network topology. Here's why it dominates and how to implement it correctly.

## What is Hub-Spoke?

A **hub** VNet contains shared services (firewall, VPN gateway, DNS, bastion). Multiple **spoke** VNets contain workload-specific resources and peer to the hub.

All traffic between spokes flows through the hub where the firewall inspects it. Traffic to on-premises or the internet also flows through the hub.

## Why Use It?

- **Centralized control:** One firewall, one VPN gateway — not one per workload
- **Cost savings:** Share expensive resources (Azure Firewall ~$900/mo) across all workloads
- **Isolation:** Spokes can't talk directly — prevents lateral movement
- **Scalability:** Add new spokes without touching existing ones

## Reference Layout

**Hub VNet (10.0.0.0/16):**
- AzureFirewallSubnet
- GatewaySubnet (VPN/ExpressRoute)
- AzureBastionSubnet
- SharedServicesSubnet (AD DS, DNS)

**Spoke VNets (10.1.0.0/16, 10.2.0.0/16):**
- Workload-specific subnets

## Common Mistakes

1. Peering spokes directly — defeats the purpose
2. Forgetting UDRs — traffic won't flow through firewall
3. Not using Private DNS zones — private endpoints won't resolve
4. Oversizing the hub VNet — makes address planning painful

## Alternative: Virtual WAN

For multi-region deployments, consider Virtual WAN — managed hub-spoke with automatic routing and built-in ExpressRoute integration.`,

  'terraform-vs-bicep-vs-arm': `# Terraform vs Bicep vs ARM: Which IaC Should You Choose?

All three let you deploy Azure infrastructure as code. Here's when to use each.

## ARM Templates (JSON)
Microsoft's original IaC. Native, deeply integrated, but verbose.

**Pros:** Native support, every resource available day-one
**Cons:** Verbose JSON, hard to read, limited functions

**Use when:** Working with legacy systems, or need specific ARM-only features

## Bicep
Microsoft's modern replacement for ARM. Compiles to ARM under the hood.

**Pros:** Clean syntax, full feature parity with ARM, first-class Azure support
**Cons:** Azure-only (not multi-cloud), newer so less community content

**Use when:** Azure-only shop, want clean syntax with full Microsoft support

## Terraform
HashiCorp's cloud-agnostic IaC. Industry standard for multi-cloud.

**Pros:** Multi-cloud, huge community, mature ecosystem, state management
**Cons:** Can lag behind Azure features, state file complexity

**Use when:** Multi-cloud strategy, existing Terraform expertise, need mature modules

## My Recommendation

- **Greenfield, Azure-only:** Bicep
- **Existing Terraform:** Stick with Terraform
- **Multi-cloud:** Terraform
- **Quick one-off:** Bicep

Cloud Canvas Designer exports to all three — pick whichever fits your stack.`,

  'aks-vs-app-service-vs-functions': `# AKS vs App Service vs Functions: Choosing Your Compute

The three most popular Azure compute options serve different needs. Here's how to choose.

## Azure Functions (Serverless)
Code that runs on-demand, no servers to manage.

**Use when:**
- Event-driven workloads (HTTP triggers, queue processors)
- Infrequent or unpredictable traffic
- Glue code between services
- Quick prototypes

**Avoid when:**
- Long-running operations (>10 min)
- Always-on services
- Complex stateful workloads

## App Service
Managed platform for web apps and APIs.

**Use when:**
- Traditional web apps (Node.js, Python, .NET)
- APIs with predictable traffic
- Need zero infrastructure management
- Want built-in deployment slots and auth

**Avoid when:**
- Need custom networking
- Microservices with complex scaling needs
- Non-HTTP workloads

## AKS (Kubernetes)
Full container orchestration.

**Use when:**
- Microservices architecture
- Need fine-grained scaling control
- Portable across clouds
- Complex networking requirements
- Already have Kubernetes expertise

**Avoid when:**
- Small team without K8s experience
- Simple web apps (App Service is easier)
- Cost-sensitive (AKS has node overhead)

## Decision Tree

1. **Simple web app?** → App Service
2. **Event-driven, short-lived?** → Functions
3. **Microservices or complex needs?** → AKS
4. **Not sure?** → Start with App Service, migrate to AKS if you outgrow it`,

  'cost-optimization-strategies': `# 10 Azure Cost Optimization Strategies That Actually Work

Proven tactics to cut your Azure bill by 30-50% without sacrificing performance.

## 1. Reserved Instances
Commit to 1 or 3 years on predictable workloads. Savings: 40-72%.
Best for: production VMs, SQL databases, Cosmos DB.

## 2. Spot VMs
Up to 90% discount for interruptible workloads.
Best for: batch jobs, dev/test, CI/CD runners.

## 3. Auto-shutdown Dev/Test
Schedule VMs to shut off nights and weekends. Savings: 60-70% on dev environments.

## 4. Right-size VMs
Azure Advisor recommends smaller SKUs based on actual CPU/memory usage. Act on these recommendations monthly.

## 5. Delete Orphaned Resources
Unattached disks, old snapshots, unused public IPs. Use Azure Resource Graph to find them.

## 6. Consolidate Log Analytics
Multiple workspaces are expensive. Consolidate into one workspace per environment.

## 7. Use Blob Storage Tiers
Move old data to Cool (50% cheaper) or Archive (95% cheaper) tiers.

## 8. Cosmos DB Autoscale
Use autoscale throughput instead of manual — pays only for peak usage, not provisioned capacity.

## 9. CDN for Egress
Serve static assets via CDN. Egress from CDN is cheaper than from VMs or App Service.

## 10. Budgets and Alerts
Set Azure Cost Management budgets per subscription with email alerts at 80% and 100%.

## Bonus: Tag Everything
You can't optimize what you can't measure. Tag resources by team, environment, project — then use cost analysis filters.

## Quick Win Calculator

If your monthly Azure bill is $10,000:
- Reserved Instances: save $3,000
- Right-sizing: save $1,500
- Auto-shutdown dev/test: save $800
- **Total potential savings: $5,300/month**`,

  'private-endpoints-vs-service-endpoints': `# Private Endpoints vs Service Endpoints: Which to Use?

Both provide private connectivity to Azure PaaS services, but work very differently.

## Service Endpoints
The original approach. Extends your VNet identity to the PaaS service over Microsoft's backbone.

**How it works:** Traffic stays on Microsoft's network but uses public IPs. The PaaS service knows the request came from your VNet.

**Pros:**
- Free
- Easy to set up
- No DNS changes needed

**Cons:**
- PaaS service still has a public endpoint
- Only works from the same region
- Limited services supported

## Private Endpoints
The modern approach. Creates a NIC with a private IP in your VNet that maps to the PaaS service.

**How it works:** You get a real private IP (10.x.x.x) for the PaaS service inside your VNet. All traffic is truly private.

**Pros:**
- Fully private (no public endpoint)
- Works across regions and from on-premises
- Supports more services
- Compliance-friendly

**Cons:**
- Costs ~$7/month per endpoint
- Requires Private DNS Zone setup
- More complex networking

## When to Use Which

**Service Endpoints:** Cost-sensitive, same-region workloads, basic security needs.

**Private Endpoints:** Production workloads, compliance requirements (HIPAA, PCI), hybrid scenarios, zero-trust networking.

## The Industry Trend

Private Endpoints are replacing Service Endpoints as the default. Microsoft's newer services often support Private Endpoints first. For new deployments, default to Private Endpoints unless cost is a blocker.`,
};
