// 50 Azure Architecture Diagram Templates
// 5 categories × 10 templates each
// Items match Canvas drop structure: { id, serviceType, name, path, category, x, y }

let _counter = Date.now();
const uid = () => _counter++;

// Shorthand helpers
const I = {
  agw:      { serviceType: 'applicationgateways', path: '/icons/networking/10076-icon-service-Application-Gateways.svg', category: 'networking' },
  app:      { serviceType: 'appservices',         path: '/icons/compute/10035-icon-service-App-Services.svg',            category: 'compute' },
  func:     { serviceType: 'functionapps',        path: '/icons/compute/10029-icon-service-Function-Apps.svg',           category: 'compute' },
  vm:       { serviceType: 'virtualmachine',      path: '/icons/compute/10021-icon-service-Virtual-Machine.svg',         category: 'compute' },
  vmss:     { serviceType: 'vmscalesets',         path: '/icons/compute/10034-icon-service-VM-Scale-Sets.svg',           category: 'compute' },
  aks:      { serviceType: 'kubernetesservices',  path: '/icons/compute/10023-icon-service-Kubernetes-Services.svg',     category: 'compute' },
  sql:      { serviceType: 'sqldatabase',         path: '/icons/databases/10130-icon-service-SQL-Database.svg',          category: 'databases' },
  cosmos:   { serviceType: 'azurecosmosdb',       path: '/icons/databases/10121-icon-service-Azure-Cosmos-DB.svg',       category: 'databases' },
  mysql:    { serviceType: 'azuredatabasemysqlserver', path: '/icons/databases/10122-icon-service-Azure-Database-MySQL-Server.svg', category: 'databases' },
  pg:       { serviceType: 'azuredatabasepostgresqlserver', path: '/icons/databases/10131-icon-service-Azure-Database-PostgreSQL-Server.svg', category: 'databases' },
  redis:    { serviceType: 'cacheredis',          path: '/icons/databases/10137-icon-service-Cache-Redis.svg',           category: 'databases' },
  stor:     { serviceType: 'storageaccounts',     path: '/icons/storage/10086-icon-service-Storage-Accounts.svg',        category: 'storage' },
  kv:       { serviceType: 'keyvaults',           path: '/icons/security/10245-icon-service-Key-Vaults.svg',             category: 'security' },
  fw:       { serviceType: 'firewalls',           path: '/icons/networking/10084-icon-service-Firewalls.svg',            category: 'networking' },
  vpn:      { serviceType: 'virtualnetworkgateways', path: '/icons/networking/10063-icon-service-Virtual-Network-Gateways.svg', category: 'networking' },
  lb:       { serviceType: 'loadbalancers',       path: '/icons/networking/10062-icon-service-Load-Balancers.svg',       category: 'networking' },
  bastion:  { serviceType: 'bastions',            path: '/icons/networking/02422-icon-service-Bastions.svg',             category: 'networking' },
  vnet:     { serviceType: 'virtualnetworks',     path: '/icons/networking/10061-icon-service-Virtual-Networks.svg',     category: 'networking' },
  tm:       { serviceType: 'trafficmanagerprofiles', path: '/icons/networking/10065-icon-service-Traffic-Manager-Profiles.svg', category: 'networking' },
  fd:       { serviceType: 'frontdoorandcdnprofiles', path: '/icons/networking/10073-icon-service-Front-Door-and-CDN-Profiles.svg', category: 'networking' },
  cdn:      { serviceType: 'cdnprofiles',         path: '/icons/app services/00056-icon-service-CDN-Profiles.svg',      category: 'appservices' },
  nsg:      { serviceType: 'networksecuritygroups', path: '/icons/networking/10067-icon-service-Network-Security-Groups.svg', category: 'networking' },
  er:       { serviceType: 'expressroutecircuits', path: '/icons/networking/10079-icon-service-ExpressRoute-Circuits.svg', category: 'networking' },
  dns:      { serviceType: 'dnszones',            path: '/icons/networking/10064-icon-service-DNS-Zones.svg',            category: 'networking' },
  sb:       { serviceType: 'azureservicebus',     path: '/icons/integration/10836-icon-service-Azure-Service-Bus.svg',   category: 'integration' },
  eh:       { serviceType: 'eventhubs',           path: '/icons/analytics/00039-icon-service-Event-Hubs.svg',            category: 'analytics' },
  eg:       { serviceType: 'eventgridtopics',     path: '/icons/integration/10206-icon-service-Event-Grid-Topics.svg',   category: 'integration' },
  apim:     { serviceType: 'apimanagementservices', path: '/icons/devops/10042-icon-service-API-Management-Services.svg', category: 'devops' },
  acr:      { serviceType: 'containerregistries', path: '/icons/containers/10105-icon-service-Container-Registries.svg', category: 'containers' },
  aci:      { serviceType: 'containerinstances',  path: '/icons/containers/10104-icon-service-Container-Instances.svg',  category: 'containers' },
  ai:       { serviceType: 'applicationinsights', path: '/icons/devops/00012-icon-service-Application-Insights.svg',    category: 'devops' },
  logw:     { serviceType: 'loganalyticsworkspaces', path: '/icons/analytics/00009-icon-service-Log-Analytics-Workspaces.svg', category: 'analytics' },
  adf:      { serviceType: 'datafactories',       path: '/icons/analytics/10126-icon-service-Data-Factories.svg',        category: 'analytics' },
  dbr:      { serviceType: 'azuredatabricks',     path: '/icons/analytics/10787-icon-service-Azure-Databricks.svg',      category: 'analytics' },
  syn:      { serviceType: 'azuresynapseanalytics', path: '/icons/analytics/00606-icon-service-Azure-Synapse-Analytics.svg', category: 'analytics' },
  pbi:      { serviceType: 'powerbiembedded',     path: '/icons/analytics/03332-icon-service-Power-BI-Embedded.svg',     category: 'analytics' },
  adx:      { serviceType: 'azuredataexplorerclusters', path: '/icons/analytics/10145-icon-service-Azure-Data-Explorer-Clusters.svg', category: 'analytics' },
  sa:       { serviceType: 'streamanalyticsjobs', path: '/icons/analytics/00042-icon-service-Stream-Analytics-Jobs.svg', category: 'analytics' },
  iothub:   { serviceType: 'iothub',             path: '/icons/iot/10045-icon-service-IoT-Hub.svg',                     category: 'iot' },
  cog:      { serviceType: 'cognitiveservices',   path: '/icons/ai + machine learning/10162-icon-service-Cognitive-Services.svg', category: 'aimachinelearning' },
  ml:       { serviceType: 'machinelearning',     path: '/icons/ai + machine learning/10166-icon-service-Machine-Learning.svg', category: 'aimachinelearning' },
  openai:   { serviceType: 'azureopenai',         path: '/icons/ai + machine learning/03438-icon-service-Azure-OpenAI.svg', category: 'aimachinelearning' },
  search:   { serviceType: 'cognitivesearch',     path: '/icons/ai + machine learning/10044-icon-service-Cognitive-Search.svg', category: 'aimachinelearning' },
  sentinel: { serviceType: 'azuresentinel',       path: '/icons/security/10248-icon-service-Azure-Sentinel.svg',         category: 'security' },
  defender: { serviceType: 'microsoftdefenderforcloud', path: '/icons/security/10241-icon-service-Microsoft-Defender-for-Cloud.svg', category: 'security' },
  devops:   { serviceType: 'azuredevops',         path: '/icons/devops/10261-icon-service-Azure-DevOps.svg',             category: 'devops' },
  batch:    { serviceType: 'batchaccounts',       path: '/icons/compute/10031-icon-service-Batch-Accounts.svg',          category: 'compute' },
  sqlserver:{ serviceType: 'sqlserver',           path: '/icons/databases/10132-icon-service-SQL-Server.svg',            category: 'databases' },
};

const item = (id, name, icon, x, y) => ({ id, name, serviceType: icon.serviceType, path: icon.path, category: icon.category, x, y });
const conn = (from, to, label) => ({ id: uid(), from, to, label });
const tpl = (id, name, desc, cat, icon, buildFn) => ({ id, name, description: desc, category: cat, icon, build: buildFn });

// ============================================================
// WEB (10)
// ============================================================
const webTemplates = [
  tpl('web-3tier', '3-Tier Web App', 'App Gateway + App Service + SQL + Redis + Blob', 'Web', '🌐', () => {
    const ids = { ag: uid(), a1: uid(), a2: uid(), sq: uid(), bl: uid(), rd: uid() };
    return { items: [item(ids.ag,'Application Gateway',I.agw,400,60), item(ids.a1,'App Service 1',I.app,250,220), item(ids.a2,'App Service 2',I.app,550,220), item(ids.sq,'SQL Database',I.sql,300,400), item(ids.bl,'Blob Storage',I.stor,550,400), item(ids.rd,'Redis Cache',I.redis,120,400)], connections: [conn(ids.ag,ids.a1,'HTTPS'), conn(ids.ag,ids.a2,'HTTPS'), conn(ids.a1,ids.sq,'SQL'), conn(ids.a2,ids.sq,'SQL'), conn(ids.a1,ids.bl,'REST'), conn(ids.a1,ids.rd,'Cache')], boundaries: [] };
  }),
  tpl('web-spa', 'SPA with API Backend', 'Static Web App + Functions + Cosmos DB + Key Vault', 'Web', '⚛️', () => {
    const ids = { swa: uid(), fn: uid(), db: uid(), kv: uid() };
    return { items: [item(ids.swa,'Static Web App',I.app,400,60), item(ids.fn,'API Functions',I.func,400,220), item(ids.db,'Cosmos DB',I.cosmos,250,400), item(ids.kv,'Key Vault',I.kv,550,400)], connections: [conn(ids.swa,ids.fn,'REST'), conn(ids.fn,ids.db,'Data'), conn(ids.fn,ids.kv,'Secrets')], boundaries: [] };
  }),
  tpl('web-ecommerce', 'E-Commerce Platform', 'Front Door + App Service + SQL + Redis + Blob + Search', 'Web', '🛒', () => {
    const ids = { fd: uid(), a: uid(), sq: uid(), rd: uid(), bl: uid(), sr: uid() };
    return { items: [item(ids.fd,'Front Door',I.fd,400,60), item(ids.a,'App Service',I.app,400,220), item(ids.sq,'SQL Database',I.sql,200,400), item(ids.rd,'Redis Cache',I.redis,400,400), item(ids.bl,'Blob Storage',I.stor,600,400), item(ids.sr,'Cognitive Search',I.search,600,220)], connections: [conn(ids.fd,ids.a,'HTTPS'), conn(ids.a,ids.sq,'SQL'), conn(ids.a,ids.rd,'Session'), conn(ids.a,ids.bl,'Images'), conn(ids.a,ids.sr,'Search')], boundaries: [] };
  }),
  tpl('web-multiregion', 'Multi-Region Web App', 'Traffic Manager + 2 App Services + SQL Geo-Replication', 'Web', '🌍', () => {
    const ids = { tm: uid(), a1: uid(), a2: uid(), s1: uid(), s2: uid() };
    return { items: [item(ids.tm,'Traffic Manager',I.tm,400,60), item(ids.a1,'East US App',I.app,200,220), item(ids.a2,'West EU App',I.app,600,220), item(ids.s1,'East US SQL',I.sql,200,400), item(ids.s2,'West EU SQL',I.sql,600,400)], connections: [conn(ids.tm,ids.a1,'Primary'), conn(ids.tm,ids.a2,'Secondary'), conn(ids.a1,ids.s1,'SQL'), conn(ids.a2,ids.s2,'SQL'), conn(ids.s1,ids.s2,'Geo-Replication')], boundaries: [] };
  }),
  tpl('web-graphql', 'GraphQL API', 'APIM + Functions + Cosmos DB + Redis', 'Web', '🔮', () => {
    const ids = { ap: uid(), fn: uid(), db: uid(), rd: uid() };
    return { items: [item(ids.ap,'API Management',I.apim,400,60), item(ids.fn,'GraphQL Functions',I.func,400,220), item(ids.db,'Cosmos DB',I.cosmos,250,400), item(ids.rd,'Redis Cache',I.redis,550,400)], connections: [conn(ids.ap,ids.fn,'GraphQL'), conn(ids.fn,ids.db,'Resolvers'), conn(ids.fn,ids.rd,'DataLoader')], boundaries: [] };
  }),
  tpl('web-wordpress', 'WordPress on Azure', 'CDN + App Service + MySQL + Blob + Redis', 'Web', '📰', () => {
    const ids = { c: uid(), a: uid(), my: uid(), bl: uid(), rd: uid() };
    return { items: [item(ids.c,'CDN',I.cdn,400,60), item(ids.a,'App Service',I.app,400,220), item(ids.my,'MySQL',I.mysql,200,400), item(ids.bl,'Blob Storage',I.stor,400,400), item(ids.rd,'Redis Cache',I.redis,600,400)], connections: [conn(ids.c,ids.a,'Origin'), conn(ids.a,ids.my,'Data'), conn(ids.a,ids.bl,'Media'), conn(ids.a,ids.rd,'Cache')], boundaries: [] };
  }),
  tpl('web-realtime', 'Real-Time Web App', 'App Service + Functions (SignalR) + Redis + SQL', 'Web', '📡', () => {
    const ids = { a: uid(), fn: uid(), rd: uid(), sq: uid() };
    return { items: [item(ids.a,'App Service',I.app,400,60), item(ids.fn,'SignalR Functions',I.func,400,220), item(ids.rd,'Redis',I.redis,250,400), item(ids.sq,'SQL Database',I.sql,550,400)], connections: [conn(ids.a,ids.fn,'WebSocket'), conn(ids.fn,ids.rd,'Pub/Sub'), conn(ids.fn,ids.sq,'Persist')], boundaries: [] };
  }),
  tpl('web-api-first', 'API-First Architecture', 'APIM + App Service + PostgreSQL + Redis + Key Vault', 'Web', '🔌', () => {
    const ids = { ap: uid(), a: uid(), pg: uid(), rd: uid(), kv: uid() };
    return { items: [item(ids.ap,'API Management',I.apim,400,60), item(ids.a,'App Service',I.app,400,220), item(ids.pg,'PostgreSQL',I.pg,200,400), item(ids.rd,'Redis',I.redis,400,400), item(ids.kv,'Key Vault',I.kv,600,400)], connections: [conn(ids.ap,ids.a,'REST'), conn(ids.a,ids.pg,'Data'), conn(ids.a,ids.rd,'Cache'), conn(ids.a,ids.kv,'Secrets')], boundaries: [] };
  }),
  tpl('web-microfrontend', 'Micro-Frontends', 'Front Door + 3 App Services + API Gateway + SQL', 'Web', '🧩', () => {
    const ids = { fd: uid(), a1: uid(), a2: uid(), a3: uid(), api: uid(), sq: uid() };
    return { items: [item(ids.fd,'Front Door',I.fd,400,60), item(ids.a1,'Shell App',I.app,200,220), item(ids.a2,'Feature 1',I.app,400,220), item(ids.a3,'Feature 2',I.app,600,220), item(ids.api,'API Gateway',I.apim,400,380), item(ids.sq,'SQL Database',I.sql,400,520)], connections: [conn(ids.fd,ids.a1,'Route'), conn(ids.fd,ids.a2,'Route'), conn(ids.fd,ids.a3,'Route'), conn(ids.a1,ids.api,'REST'), conn(ids.api,ids.sq,'SQL')], boundaries: [] };
  }),
  tpl('web-fullstack', 'Full-Stack Node.js', 'App Gateway + App Service + Cosmos (Mongo) + Redis + Blob', 'Web', '🟢', () => {
    const ids = { ag: uid(), a: uid(), db: uid(), rd: uid(), bl: uid() };
    return { items: [item(ids.ag,'App Gateway',I.agw,400,60), item(ids.a,'Node.js App',I.app,400,220), item(ids.db,'Cosmos (Mongo)',I.cosmos,200,400), item(ids.rd,'Redis',I.redis,400,400), item(ids.bl,'Blob Storage',I.stor,600,400)], connections: [conn(ids.ag,ids.a,'HTTPS'), conn(ids.a,ids.db,'Mongoose'), conn(ids.a,ids.rd,'Session'), conn(ids.a,ids.bl,'Uploads')], boundaries: [] };
  }),
];

// ============================================================
// NETWORKING (10)
// ============================================================
const networkTemplates = [
  tpl('net-hub-spoke', 'Hub-Spoke Network', 'Firewall + VPN + 3 Spoke VNets', 'Networking', '🔗', () => {
    const ids = { fw: uid(), vpn: uid(), s1: uid(), s2: uid(), s3: uid(), bas: uid() };
    return { items: [item(ids.fw,'Azure Firewall',I.fw,400,200), item(ids.vpn,'VPN Gateway',I.vpn,400,60), item(ids.s1,'Spoke 1 VM',I.vm,150,370), item(ids.s2,'Spoke 2 VM',I.vm,400,370), item(ids.s3,'Spoke 3 AKS',I.aks,650,370), item(ids.bas,'Bastion',I.bastion,650,200)], connections: [conn(ids.vpn,ids.fw,'Tunnel'), conn(ids.fw,ids.s1,'Peering'), conn(ids.fw,ids.s2,'Peering'), conn(ids.fw,ids.s3,'Peering'), conn(ids.bas,ids.s1,'SSH')], boundaries: [] };
  }),
  tpl('net-dmz', 'DMZ Architecture', 'External LB + Firewall NVA + Internal LB + App Tier', 'Networking', '🛡️', () => {
    const ids = { elb: uid(), fw: uid(), ilb: uid(), a1: uid(), a2: uid() };
    return { items: [item(ids.elb,'External LB',I.lb,400,60), item(ids.fw,'Firewall NVA',I.fw,400,200), item(ids.ilb,'Internal LB',I.lb,400,340), item(ids.a1,'App VM 1',I.vm,250,480), item(ids.a2,'App VM 2',I.vm,550,480)], connections: [conn(ids.elb,ids.fw,'Inspect'), conn(ids.fw,ids.ilb,'Allow'), conn(ids.ilb,ids.a1,'HTTP'), conn(ids.ilb,ids.a2,'HTTP')], boundaries: [] };
  }),
  tpl('net-expressroute', 'ExpressRoute Hybrid', 'ExpressRoute + VNet Gateway + Firewall + Spoke', 'Networking', '🔌', () => {
    const ids = { er: uid(), gw: uid(), fw: uid(), sp: uid() };
    return { items: [item(ids.er,'ExpressRoute',I.er,400,60), item(ids.gw,'VNet Gateway',I.vpn,400,200), item(ids.fw,'Firewall',I.fw,400,340), item(ids.sp,'Spoke VMs',I.vm,400,480)], connections: [conn(ids.er,ids.gw,'Private Peering'), conn(ids.gw,ids.fw,'Hub'), conn(ids.fw,ids.sp,'Peering')], boundaries: [] };
  }),
  tpl('net-frontdoor-waf', 'Front Door with WAF', 'Front Door + Multi-Region App Services + SQL', 'Networking', '🚪', () => {
    const ids = { fd: uid(), a1: uid(), a2: uid(), sq: uid() };
    return { items: [item(ids.fd,'Front Door + WAF',I.fd,400,60), item(ids.a1,'East US App',I.app,200,250), item(ids.a2,'West EU App',I.app,600,250), item(ids.sq,'SQL Geo-Replicated',I.sql,400,420)], connections: [conn(ids.fd,ids.a1,'Primary'), conn(ids.fd,ids.a2,'Failover'), conn(ids.a1,ids.sq,'SQL'), conn(ids.a2,ids.sq,'SQL')], boundaries: [] };
  }),
  tpl('net-private-endpoint', 'Private Endpoint Architecture', 'VNet + App Service + Private SQL/Storage/KV', 'Networking', '🔐', () => {
    const ids = { vn: uid(), a: uid(), sq: uid(), st: uid(), kv: uid() };
    return { items: [item(ids.vn,'VNet',I.vnet,400,60), item(ids.a,'App Service',I.app,400,200), item(ids.sq,'SQL (Private)',I.sql,200,380), item(ids.st,'Storage (Private)',I.stor,400,380), item(ids.kv,'Key Vault (Private)',I.kv,600,380)], connections: [conn(ids.vn,ids.a,'VNet Integration'), conn(ids.a,ids.sq,'Private Endpoint'), conn(ids.a,ids.st,'Private Endpoint'), conn(ids.a,ids.kv,'Private Endpoint')], boundaries: [] };
  }),
  tpl('net-load-balanced', 'Load Balanced VMs', 'Load Balancer + VMSS across 3 Availability Zones', 'Networking', '⚖️', () => {
    const ids = { lb: uid(), v1: uid(), v2: uid(), v3: uid() };
    return { items: [item(ids.lb,'Load Balancer',I.lb,400,60), item(ids.v1,'VMSS Zone 1',I.vmss,200,250), item(ids.v2,'VMSS Zone 2',I.vmss,400,250), item(ids.v3,'VMSS Zone 3',I.vmss,600,250)], connections: [conn(ids.lb,ids.v1,'Zone 1'), conn(ids.lb,ids.v2,'Zone 2'), conn(ids.lb,ids.v3,'Zone 3')], boundaries: [] };
  }),
  tpl('net-vpn-s2s', 'Site-to-Site VPN', 'VPN Gateway + On-Premises + Azure VMs', 'Networking', '🔒', () => {
    const ids = { vpn: uid(), onp: uid(), vm1: uid(), vm2: uid() };
    return { items: [item(ids.vpn,'VPN Gateway',I.vpn,400,60), item(ids.onp,'On-Premises',I.vnet,400,220), item(ids.vm1,'Azure VM',I.vm,200,400), item(ids.vm2,'On-Prem Server',I.vm,600,400)], connections: [conn(ids.vpn,ids.onp,'IPSec'), conn(ids.vpn,ids.vm1,'Azure VNet'), conn(ids.onp,ids.vm2,'LAN')], boundaries: [] };
  }),
  tpl('net-bastion-jump', 'Bastion Jump Box', 'Bastion + Jump VM + Private VMs + SQL', 'Networking', '🏰', () => {
    const ids = { bas: uid(), jmp: uid(), v1: uid(), v2: uid(), sq: uid() };
    return { items: [item(ids.bas,'Bastion',I.bastion,400,60), item(ids.jmp,'Jump Box',I.vm,400,200), item(ids.v1,'App VM 1',I.vm,200,370), item(ids.v2,'App VM 2',I.vm,400,370), item(ids.sq,'SQL Server',I.sql,600,370)], connections: [conn(ids.bas,ids.jmp,'RDP/SSH'), conn(ids.jmp,ids.v1,'SSH'), conn(ids.jmp,ids.v2,'SSH'), conn(ids.v1,ids.sq,'SQL')], boundaries: [] };
  }),
  tpl('net-vwan', 'Virtual WAN', 'vWAN Hub + VPN + ExpressRoute + 2 Spokes', 'Networking', '🕸️', () => {
    const ids = { wan: uid(), vpn: uid(), er: uid(), s1: uid(), s2: uid() };
    return { items: [item(ids.wan,'vWAN Hub',I.vnet,400,200), item(ids.vpn,'VPN Gateway',I.vpn,200,60), item(ids.er,'ExpressRoute',I.er,600,60), item(ids.s1,'Spoke 1',I.vm,200,380), item(ids.s2,'Spoke 2',I.aks,600,380)], connections: [conn(ids.vpn,ids.wan,'VPN'), conn(ids.er,ids.wan,'ER'), conn(ids.wan,ids.s1,'Peering'), conn(ids.wan,ids.s2,'Peering')], boundaries: [] };
  }),
  tpl('net-traffic-mgr', 'Traffic Manager Multi-Region', 'Traffic Manager + 3 Regional App Endpoints', 'Networking', '🚦', () => {
    const ids = { tm: uid(), e1: uid(), e2: uid(), e3: uid() };
    return { items: [item(ids.tm,'Traffic Manager',I.tm,400,60), item(ids.e1,'East US App',I.app,150,250), item(ids.e2,'West EU App',I.app,400,250), item(ids.e3,'SE Asia App',I.app,650,250)], connections: [conn(ids.tm,ids.e1,'Priority 1'), conn(ids.tm,ids.e2,'Priority 2'), conn(ids.tm,ids.e3,'Priority 3')], boundaries: [] };
  }),
];

// ============================================================
// CONTAINERS (10)
// ============================================================
const containerTemplates = [
  tpl('ctr-aks-micro', 'Microservices on AKS', 'App Gateway + AKS + ACR + Key Vault + Cosmos + Service Bus', 'Containers', '🐳', () => {
    const ids = { ag: uid(), ak: uid(), ac: uid(), kv: uid(), co: uid(), sb: uid(), ai: uid() };
    return { items: [item(ids.ag,'App Gateway',I.agw,400,60), item(ids.ak,'AKS Cluster',I.aks,400,220), item(ids.ac,'Container Registry',I.acr,150,220), item(ids.kv,'Key Vault',I.kv,650,220), item(ids.co,'Cosmos DB',I.cosmos,250,400), item(ids.sb,'Service Bus',I.sb,500,400), item(ids.ai,'App Insights',I.ai,650,400)], connections: [conn(ids.ag,ids.ak,'Ingress'), conn(ids.ac,ids.ak,'Pull'), conn(ids.ak,ids.kv,'Secrets'), conn(ids.ak,ids.co,'Data'), conn(ids.ak,ids.sb,'Events'), conn(ids.ak,ids.ai,'Telemetry')], boundaries: [] };
  }),
  tpl('ctr-aks-cicd', 'AKS with CI/CD', 'Azure DevOps + ACR + AKS + Key Vault', 'Containers', '🔄', () => {
    const ids = { dv: uid(), ac: uid(), ak: uid(), kv: uid() };
    return { items: [item(ids.dv,'Azure DevOps',I.devops,400,60), item(ids.ac,'Container Registry',I.acr,400,220), item(ids.ak,'AKS Cluster',I.aks,400,380), item(ids.kv,'Key Vault',I.kv,600,220)], connections: [conn(ids.dv,ids.ac,'Build & Push'), conn(ids.ac,ids.ak,'Deploy'), conn(ids.ak,ids.kv,'Secrets')], boundaries: [] };
  }),
  tpl('ctr-aci-batch', 'Container Instances Batch', 'Event Grid + Functions + ACI + Blob', 'Containers', '📦', () => {
    const ids = { eg: uid(), fn: uid(), ac: uid(), bl: uid() };
    return { items: [item(ids.eg,'Event Grid',I.eg,400,60), item(ids.fn,'Orchestrator',I.func,400,220), item(ids.ac,'Container Instances',I.aci,250,400), item(ids.bl,'Blob Storage',I.stor,550,400)], connections: [conn(ids.eg,ids.fn,'Trigger'), conn(ids.fn,ids.ac,'Spawn'), conn(ids.ac,ids.bl,'Output')], boundaries: [] };
  }),
  tpl('ctr-multi-cluster', 'Multi-Cluster AKS', 'Front Door + 2 AKS Clusters + Shared ACR + Cosmos', 'Containers', '🌐', () => {
    const ids = { fd: uid(), a1: uid(), a2: uid(), ac: uid(), co: uid() };
    return { items: [item(ids.fd,'Front Door',I.fd,400,60), item(ids.a1,'AKS East',I.aks,200,250), item(ids.a2,'AKS West',I.aks,600,250), item(ids.ac,'Shared ACR',I.acr,400,250), item(ids.co,'Cosmos DB',I.cosmos,400,420)], connections: [conn(ids.fd,ids.a1,'Route'), conn(ids.fd,ids.a2,'Route'), conn(ids.ac,ids.a1,'Pull'), conn(ids.ac,ids.a2,'Pull'), conn(ids.a1,ids.co,'Data')], boundaries: [] };
  }),
  tpl('ctr-dapr', 'Dapr on AKS', 'AKS + Service Bus + Cosmos + Redis + Key Vault', 'Containers', '🎯', () => {
    const ids = { ak: uid(), sb: uid(), co: uid(), rd: uid(), kv: uid() };
    return { items: [item(ids.ak,'AKS (Dapr)',I.aks,400,60), item(ids.sb,'Service Bus',I.sb,150,250), item(ids.co,'Cosmos DB',I.cosmos,350,250), item(ids.rd,'Redis',I.redis,550,250), item(ids.kv,'Key Vault',I.kv,400,400)], connections: [conn(ids.ak,ids.sb,'Pub/Sub'), conn(ids.ak,ids.co,'State'), conn(ids.ak,ids.rd,'Cache'), conn(ids.ak,ids.kv,'Secrets')], boundaries: [] };
  }),
  tpl('ctr-blue-green', 'Blue-Green Deployment', 'App Gateway + AKS Blue + AKS Green + ACR', 'Containers', '🔵', () => {
    const ids = { ag: uid(), b: uid(), g: uid(), ac: uid() };
    return { items: [item(ids.ag,'App Gateway',I.agw,400,60), item(ids.b,'AKS Blue (Live)',I.aks,200,250), item(ids.g,'AKS Green (Staging)',I.aks,600,250), item(ids.ac,'ACR',I.acr,400,250)], connections: [conn(ids.ag,ids.b,'100% Traffic'), conn(ids.ag,ids.g,'0% Traffic'), conn(ids.ac,ids.b,'Pull'), conn(ids.ac,ids.g,'Pull')], boundaries: [] };
  }),
  tpl('ctr-aks-kafka', 'AKS with Kafka', 'AKS + Event Hubs (Kafka) + Cosmos + Blob', 'Containers', '📨', () => {
    const ids = { ak: uid(), eh: uid(), co: uid(), bl: uid() };
    return { items: [item(ids.ak,'AKS Cluster',I.aks,400,60), item(ids.eh,'Event Hubs (Kafka)',I.eh,200,250), item(ids.co,'Cosmos DB',I.cosmos,400,250), item(ids.bl,'Blob Storage',I.stor,600,250)], connections: [conn(ids.ak,ids.eh,'Produce/Consume'), conn(ids.ak,ids.co,'State'), conn(ids.ak,ids.bl,'Files')], boundaries: [] };
  }),
  tpl('ctr-aks-monitoring', 'AKS Full Observability', 'AKS + ACR + App Insights + Log Analytics + Defender', 'Containers', '📊', () => {
    const ids = { ak: uid(), ac: uid(), ai: uid(), lw: uid(), df: uid() };
    return { items: [item(ids.ak,'AKS Cluster',I.aks,400,60), item(ids.ac,'ACR',I.acr,150,60), item(ids.ai,'App Insights',I.ai,200,250), item(ids.lw,'Log Analytics',I.logw,400,250), item(ids.df,'Defender',I.defender,600,250)], connections: [conn(ids.ac,ids.ak,'Pull'), conn(ids.ak,ids.ai,'Metrics'), conn(ids.ak,ids.lw,'Logs'), conn(ids.ak,ids.df,'Security')], boundaries: [] };
  }),
  tpl('ctr-aks-gpu', 'AKS GPU Workloads', 'AKS GPU Pool + ACR + Blob + ML Workspace', 'Containers', '🎮', () => {
    const ids = { ak: uid(), ac: uid(), bl: uid(), ml: uid() };
    return { items: [item(ids.ak,'AKS (GPU Pool)',I.aks,400,60), item(ids.ac,'Container Registry',I.acr,200,220), item(ids.bl,'Training Data',I.stor,400,220), item(ids.ml,'ML Workspace',I.ml,600,220)], connections: [conn(ids.ac,ids.ak,'Pull'), conn(ids.bl,ids.ak,'Mount'), conn(ids.ml,ids.ak,'Deploy')], boundaries: [] };
  }),
  tpl('ctr-aks-gitops', 'AKS GitOps (Flux)', 'Azure DevOps + Flux + AKS + ACR + Key Vault', 'Containers', '🔃', () => {
    const ids = { dv: uid(), ak: uid(), ac: uid(), kv: uid() };
    return { items: [item(ids.dv,'Azure DevOps',I.devops,400,60), item(ids.ak,'AKS (Flux)',I.aks,400,250), item(ids.ac,'ACR',I.acr,200,250), item(ids.kv,'Key Vault',I.kv,600,250)], connections: [conn(ids.dv,ids.ak,'GitOps Sync'), conn(ids.ac,ids.ak,'Pull'), conn(ids.ak,ids.kv,'Secrets')], boundaries: [] };
  }),
];

// ============================================================
// ANALYTICS (10)
// ============================================================
const analyticsTemplates = [
  tpl('ana-pipeline', 'Data Analytics Pipeline', 'Event Hubs + Data Factory + Databricks + Synapse + Power BI', 'Analytics', '📊', () => {
    const ids = { eh: uid(), ad: uid(), dl: uid(), db: uid(), sy: uid(), pb: uid() };
    return { items: [item(ids.eh,'Event Hubs',I.eh,100,200), item(ids.ad,'Data Factory',I.adf,300,200), item(ids.dl,'Data Lake',I.stor,300,380), item(ids.db,'Databricks',I.dbr,500,200), item(ids.sy,'Synapse',I.syn,700,200), item(ids.pb,'Power BI',I.pbi,700,380)], connections: [conn(ids.eh,ids.ad,'Ingest'), conn(ids.ad,ids.dl,'Raw'), conn(ids.dl,ids.db,'Process'), conn(ids.db,ids.sy,'Curated'), conn(ids.sy,ids.pb,'Serve')], boundaries: [] };
  }),
  tpl('ana-realtime', 'Real-Time Analytics', 'IoT Hub + Stream Analytics + Cosmos DB + Power BI', 'Analytics', '⚡', () => {
    const ids = { io: uid(), sa: uid(), co: uid(), pb: uid() };
    return { items: [item(ids.io,'IoT Hub',I.iothub,400,60), item(ids.sa,'Stream Analytics',I.sa,400,220), item(ids.co,'Cosmos DB',I.cosmos,250,400), item(ids.pb,'Power BI',I.pbi,550,400)], connections: [conn(ids.io,ids.sa,'Stream'), conn(ids.sa,ids.co,'Hot Path'), conn(ids.sa,ids.pb,'Dashboard')], boundaries: [] };
  }),
  tpl('ana-lakehouse', 'Lakehouse Architecture', 'Data Factory + Data Lake + Databricks + Synapse Serverless', 'Analytics', '🏠', () => {
    const ids = { ad: uid(), dl: uid(), db: uid(), sy: uid() };
    return { items: [item(ids.ad,'Data Factory',I.adf,400,60), item(ids.dl,'Data Lake (Bronze)',I.stor,200,250), item(ids.db,'Databricks (Silver/Gold)',I.dbr,400,250), item(ids.sy,'Synapse Serverless',I.syn,600,250)], connections: [conn(ids.ad,ids.dl,'Ingest'), conn(ids.dl,ids.db,'Transform'), conn(ids.db,ids.sy,'Serve')], boundaries: [] };
  }),
  tpl('ana-adx', 'Azure Data Explorer', 'Event Hubs + ADX Cluster + Power BI + Blob Export', 'Analytics', '🔍', () => {
    const ids = { eh: uid(), ax: uid(), pb: uid(), bl: uid() };
    return { items: [item(ids.eh,'Event Hubs',I.eh,400,60), item(ids.ax,'Data Explorer',I.adx,400,220), item(ids.pb,'Power BI',I.pbi,250,400), item(ids.bl,'Blob Export',I.stor,550,400)], connections: [conn(ids.eh,ids.ax,'Ingest'), conn(ids.ax,ids.pb,'KQL Query'), conn(ids.ax,ids.bl,'Export')], boundaries: [] };
  }),
  tpl('ana-etl', 'ETL Pipeline', 'Blob Sources + Data Factory + SQL DW + Power BI', 'Analytics', '🔄', () => {
    const ids = { bl: uid(), ad: uid(), sq: uid(), pb: uid() };
    return { items: [item(ids.bl,'Source Blobs',I.stor,400,60), item(ids.ad,'Data Factory',I.adf,400,220), item(ids.sq,'SQL Data Warehouse',I.sql,400,380), item(ids.pb,'Power BI',I.pbi,400,520)], connections: [conn(ids.bl,ids.ad,'Extract'), conn(ids.ad,ids.sq,'Load'), conn(ids.sq,ids.pb,'Report')], boundaries: [] };
  }),
  tpl('ana-log', 'Log Analytics Platform', 'App Insights + Log Analytics + Sentinel + Alert Functions', 'Analytics', '📋', () => {
    const ids = { ai: uid(), lw: uid(), sn: uid(), fn: uid() };
    return { items: [item(ids.ai,'App Insights',I.ai,200,60), item(ids.lw,'Log Analytics',I.logw,400,200), item(ids.sn,'Sentinel',I.sentinel,600,60), item(ids.fn,'Alert Functions',I.func,400,380)], connections: [conn(ids.ai,ids.lw,'Logs'), conn(ids.sn,ids.lw,'SIEM'), conn(ids.lw,ids.fn,'Alerts')], boundaries: [] };
  }),
  tpl('ana-ml-pipeline', 'ML Training Pipeline', 'Blob + Databricks + ML Workspace + ACR + AKS', 'Analytics', '🧠', () => {
    const ids = { bl: uid(), db: uid(), ml: uid(), ac: uid(), ak: uid() };
    return { items: [item(ids.bl,'Training Data',I.stor,100,200), item(ids.db,'Databricks',I.dbr,300,200), item(ids.ml,'ML Workspace',I.ml,500,200), item(ids.ac,'Model Registry',I.acr,500,380), item(ids.ak,'AKS Inference',I.aks,700,200)], connections: [conn(ids.bl,ids.db,'Load'), conn(ids.db,ids.ml,'Train'), conn(ids.ml,ids.ac,'Register'), conn(ids.ac,ids.ak,'Deploy')], boundaries: [] };
  }),
  tpl('ana-iot', 'IoT Analytics', 'IoT Hub + Stream Analytics + Data Lake + ADX + Power BI', 'Analytics', '📡', () => {
    const ids = { io: uid(), sa: uid(), dl: uid(), ax: uid(), pb: uid() };
    return { items: [item(ids.io,'IoT Hub',I.iothub,100,200), item(ids.sa,'Stream Analytics',I.sa,300,200), item(ids.dl,'Data Lake',I.stor,300,380), item(ids.ax,'Data Explorer',I.adx,500,200), item(ids.pb,'Power BI',I.pbi,700,200)], connections: [conn(ids.io,ids.sa,'Telemetry'), conn(ids.sa,ids.dl,'Archive'), conn(ids.sa,ids.ax,'Hot'), conn(ids.ax,ids.pb,'Dashboard')], boundaries: [] };
  }),
  tpl('ana-synapse', 'Synapse End-to-End', 'Data Factory + Data Lake + Synapse Spark + SQL Pool + Power BI', 'Analytics', '🔮', () => {
    const ids = { ad: uid(), dl: uid(), sy: uid(), sq: uid(), pb: uid() };
    return { items: [item(ids.ad,'Data Factory',I.adf,100,200), item(ids.dl,'Data Lake',I.stor,300,200), item(ids.sy,'Synapse Spark',I.syn,500,200), item(ids.sq,'SQL Pool',I.sql,500,380), item(ids.pb,'Power BI',I.pbi,700,200)], connections: [conn(ids.ad,ids.dl,'Ingest'), conn(ids.dl,ids.sy,'Process'), conn(ids.sy,ids.sq,'Load'), conn(ids.sq,ids.pb,'Serve')], boundaries: [] };
  }),
  tpl('ana-streaming', 'Event Streaming', 'Event Hubs + Functions + Cosmos DB + Service Bus', 'Analytics', '🌊', () => {
    const ids = { eh: uid(), fn: uid(), co: uid(), sb: uid() };
    return { items: [item(ids.eh,'Event Hubs',I.eh,400,60), item(ids.fn,'Processor Functions',I.func,400,220), item(ids.co,'Cosmos DB',I.cosmos,250,400), item(ids.sb,'Service Bus',I.sb,550,400)], connections: [conn(ids.eh,ids.fn,'Consume'), conn(ids.fn,ids.co,'Store'), conn(ids.fn,ids.sb,'Route')], boundaries: [] };
  }),
];

// ============================================================
// SERVERLESS (10)
// ============================================================
const serverlessTemplates = [
  tpl('sls-api', 'Serverless REST API', 'APIM + Functions + Cosmos DB + Service Bus', 'Serverless', '⚡', () => {
    const ids = { ap: uid(), f1: uid(), f2: uid(), co: uid(), sb: uid() };
    return { items: [item(ids.ap,'API Management',I.apim,400,60), item(ids.f1,'Orders Function',I.func,200,240), item(ids.f2,'Users Function',I.func,600,240), item(ids.co,'Cosmos DB',I.cosmos,200,420), item(ids.sb,'Service Bus',I.sb,600,420)], connections: [conn(ids.ap,ids.f1,'REST'), conn(ids.ap,ids.f2,'REST'), conn(ids.f1,ids.co,'CRUD'), conn(ids.f2,ids.sb,'Publish')], boundaries: [] };
  }),
  tpl('sls-event-driven', 'Event-Driven Processing', 'Event Grid + Functions + Blob + Cosmos + Service Bus', 'Serverless', '📨', () => {
    const ids = { eg: uid(), fn: uid(), bl: uid(), co: uid(), sb: uid() };
    return { items: [item(ids.eg,'Event Grid',I.eg,400,60), item(ids.fn,'Processor',I.func,400,220), item(ids.bl,'Blob Storage',I.stor,200,400), item(ids.co,'Cosmos DB',I.cosmos,400,400), item(ids.sb,'Service Bus',I.sb,600,400)], connections: [conn(ids.eg,ids.fn,'Trigger'), conn(ids.fn,ids.bl,'Read'), conn(ids.fn,ids.co,'Write'), conn(ids.fn,ids.sb,'Notify')], boundaries: [] };
  }),
  tpl('sls-cron', 'Scheduled Jobs', 'Timer Functions + SQL + Blob + Service Bus', 'Serverless', '⏰', () => {
    const ids = { f1: uid(), f2: uid(), sq: uid(), bl: uid(), sb: uid() };
    return { items: [item(ids.f1,'Cleanup Job',I.func,200,60), item(ids.f2,'Report Job',I.func,600,60), item(ids.sq,'SQL Database',I.sql,200,250), item(ids.bl,'Report Storage',I.stor,600,250), item(ids.sb,'Notifications',I.sb,400,250)], connections: [conn(ids.f1,ids.sq,'Purge'), conn(ids.f2,ids.sq,'Query'), conn(ids.f2,ids.bl,'Export'), conn(ids.f2,ids.sb,'Alert')], boundaries: [] };
  }),
  tpl('sls-webhook', 'Webhook Processor', 'HTTP Function + Queue + Processor + Cosmos', 'Serverless', '🪝', () => {
    const ids = { fn: uid(), qu: uid(), pr: uid(), co: uid() };
    return { items: [item(ids.fn,'Webhook Receiver',I.func,400,60), item(ids.qu,'Storage Queue',I.stor,400,220), item(ids.pr,'Queue Processor',I.func,400,380), item(ids.co,'Cosmos DB',I.cosmos,400,520)], connections: [conn(ids.fn,ids.qu,'Enqueue'), conn(ids.qu,ids.pr,'Trigger'), conn(ids.pr,ids.co,'Store')], boundaries: [] };
  }),
  tpl('sls-image', 'Image Processing', 'Blob Trigger + Functions + Cognitive Vision + CDN', 'Serverless', '🖼️', () => {
    const ids = { bl: uid(), fn: uid(), cv: uid(), cd: uid() };
    return { items: [item(ids.bl,'Upload Blob',I.stor,400,60), item(ids.fn,'Resize Function',I.func,400,220), item(ids.cv,'Computer Vision',I.cog,250,400), item(ids.cd,'CDN Output',I.cdn,550,400)], connections: [conn(ids.bl,ids.fn,'Blob Trigger'), conn(ids.fn,ids.cv,'Analyze'), conn(ids.fn,ids.cd,'Publish')], boundaries: [] };
  }),
  tpl('sls-saga', 'Saga Orchestration', 'Durable Functions + Service Bus + SQL + Blob', 'Serverless', '🔗', () => {
    const ids = { df: uid(), sb: uid(), sq: uid(), bl: uid() };
    return { items: [item(ids.df,'Durable Functions',I.func,400,60), item(ids.sb,'Service Bus',I.sb,200,250), item(ids.sq,'SQL Database',I.sql,400,250), item(ids.bl,'Blob Storage',I.stor,600,250)], connections: [conn(ids.df,ids.sb,'Orchestrate'), conn(ids.df,ids.sq,'State'), conn(ids.df,ids.bl,'Artifacts')], boundaries: [] };
  }),
  tpl('sls-chatbot', 'Serverless Chatbot', 'APIM + Functions + Azure OpenAI + Cosmos + Search', 'Serverless', '🤖', () => {
    const ids = { ap: uid(), fn: uid(), oai: uid(), co: uid(), sr: uid() };
    return { items: [item(ids.ap,'API Management',I.apim,400,60), item(ids.fn,'Chat Function',I.func,400,220), item(ids.oai,'Azure OpenAI',I.openai,200,400), item(ids.co,'Cosmos DB',I.cosmos,400,400), item(ids.sr,'Cognitive Search',I.search,600,400)], connections: [conn(ids.ap,ids.fn,'REST'), conn(ids.fn,ids.oai,'Completion'), conn(ids.fn,ids.co,'History'), conn(ids.fn,ids.sr,'RAG')], boundaries: [] };
  }),
  tpl('sls-file-proc', 'File Processing Pipeline', 'Blob Trigger + Functions + Queue + SQL + Email', 'Serverless', '📄', () => {
    const ids = { bl: uid(), fn: uid(), qu: uid(), sq: uid(), sb: uid() };
    return { items: [item(ids.bl,'Upload Blob',I.stor,400,60), item(ids.fn,'Parser Function',I.func,400,220), item(ids.qu,'Queue',I.stor,250,400), item(ids.sq,'SQL Database',I.sql,400,400), item(ids.sb,'Notification',I.sb,550,400)], connections: [conn(ids.bl,ids.fn,'Trigger'), conn(ids.fn,ids.qu,'Enqueue'), conn(ids.fn,ids.sq,'Metadata'), conn(ids.fn,ids.sb,'Notify')], boundaries: [] };
  }),
  tpl('sls-iot-ingest', 'IoT Serverless Ingest', 'IoT Hub + Functions + Cosmos + Blob Archive', 'Serverless', '📡', () => {
    const ids = { io: uid(), fn: uid(), co: uid(), bl: uid() };
    return { items: [item(ids.io,'IoT Hub',I.iothub,400,60), item(ids.fn,'Processor Function',I.func,400,220), item(ids.co,'Cosmos DB',I.cosmos,250,400), item(ids.bl,'Blob Archive',I.stor,550,400)], connections: [conn(ids.io,ids.fn,'Event Hub Trigger'), conn(ids.fn,ids.co,'Hot Store'), conn(ids.fn,ids.bl,'Cold Archive')], boundaries: [] };
  }),
  tpl('sls-multi-api', 'Multi-API Gateway', 'APIM + 4 Function Apps + Shared Cosmos', 'Serverless', '🚀', () => {
    const ids = { ap: uid(), f1: uid(), f2: uid(), f3: uid(), f4: uid(), co: uid() };
    return { items: [item(ids.ap,'API Management',I.apim,400,60), item(ids.f1,'Auth API',I.func,150,240), item(ids.f2,'Orders API',I.func,350,240), item(ids.f3,'Products API',I.func,550,240), item(ids.f4,'Notifications',I.func,750,240), item(ids.co,'Cosmos DB',I.cosmos,400,420)], connections: [conn(ids.ap,ids.f1,'REST'), conn(ids.ap,ids.f2,'REST'), conn(ids.ap,ids.f3,'REST'), conn(ids.ap,ids.f4,'REST'), conn(ids.f2,ids.co,'Data'), conn(ids.f3,ids.co,'Data')], boundaries: [] };
  }),
];

// ============================================================
// COMBINE & EXPORT
// ============================================================
export const diagramTemplates = [
  ...webTemplates,
  ...networkTemplates,
  ...containerTemplates,
  ...analyticsTemplates,
  ...serverlessTemplates,
];

export const templateCategories = [...new Set(diagramTemplates.map(t => t.category))];

export function getTemplateById(id) {
  return diagramTemplates.find(t => t.id === id);
}

export function getTemplatesByCategory(category) {
  if (!category || category === 'All') return diagramTemplates;
  return diagramTemplates.filter(t => t.category === category);
}
