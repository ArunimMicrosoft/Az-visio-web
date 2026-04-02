// Enterprise Bicep Template Generator - Cloud Canvas Designer
var BICEP_MAP = {
  virtualmachine:{type:'Microsoft.Compute/virtualMachines',api:'2024-03-01',sku:'Standard_D2s_v5'},
  vmscalesets:{type:'Microsoft.Compute/virtualMachineScaleSets',api:'2024-03-01',sku:'Standard_D2s_v5'},
  appservices:{type:'Microsoft.Web/sites',api:'2023-12-01',kind:'app'},
  functionapps:{type:'Microsoft.Web/sites',api:'2023-12-01',kind:'functionapp'},
  kubernetesservices:{type:'Microsoft.ContainerService/managedClusters',api:'2024-01-01',sku:'Standard_D4s_v5'},
  containerregistries:{type:'Microsoft.ContainerRegistry/registries',api:'2023-11-01-preview',skuName:'Standard'},
  containerinstances:{type:'Microsoft.ContainerInstance/containerGroups',api:'2023-05-01'},
  virtualnetworks:{type:'Microsoft.Network/virtualNetworks',api:'2024-01-01'},
  applicationgateways:{type:'Microsoft.Network/applicationGateways',api:'2024-01-01',sku:'Standard_v2'},
  loadbalancers:{type:'Microsoft.Network/loadBalancers',api:'2024-01-01',skuName:'Standard'},
  firewalls:{type:'Microsoft.Network/azureFirewalls',api:'2024-01-01',skuName:'AZFW_VNet',skuTier:'Standard'},
  bastions:{type:'Microsoft.Network/bastionHosts',api:'2024-01-01',skuName:'Standard'},
  virtualnetworkgateways:{type:'Microsoft.Network/virtualNetworkGateways',api:'2024-01-01'},
  publicipaddresses:{type:'Microsoft.Network/publicIPAddresses',api:'2024-01-01',skuName:'Standard'},
  networksecuritygroups:{type:'Microsoft.Network/networkSecurityGroups',api:'2024-01-01'},
  dnszones:{type:'Microsoft.Network/dnsZones',api:'2023-07-01-preview'},
  trafficmanagerprofiles:{type:'Microsoft.Network/trafficManagerProfiles',api:'2022-04-01'},
  storageaccounts:{type:'Microsoft.Storage/storageAccounts',api:'2023-05-01',kind:'StorageV2',skuName:'Standard_LRS'},
  disks:{type:'Microsoft.Compute/disks',api:'2024-03-02',skuName:'Premium_LRS',diskSizeGb:128},
  snapshots:{type:'Microsoft.Compute/snapshots',api:'2024-03-02'},
  sqldatabase:{type:'Microsoft.Sql/servers',api:'2023-08-01-preview'},
  sqlserver:{type:'Microsoft.Sql/servers',api:'2023-08-01-preview'},
  azurecosmosdb:{type:'Microsoft.DocumentDB/databaseAccounts',api:'2024-02-15-preview'},
  cacheredis:{type:'Microsoft.Cache/redis',api:'2024-03-01',skuName:'Standard',skuFamily:'C',skuCapacity:1},
  keyvaults:{type:'Microsoft.KeyVault/vaults',api:'2023-07-01'},
  applicationinsights:{type:'Microsoft.Insights/components',api:'2020-02-02',kind:'web'},
  loganalyticsworkspaces:{type:'Microsoft.OperationalInsights/workspaces',api:'2023-09-01'},
  azureservicebus:{type:'Microsoft.ServiceBus/namespaces',api:'2022-10-01-preview',skuName:'Standard'},
  eventhubs:{type:'Microsoft.EventHub/namespaces',api:'2024-01-01',skuName:'Standard'},
  apimanagementservices:{type:'Microsoft.ApiManagement/service',api:'2023-09-01-preview',skuName:'Consumption',skuCapacity:0},
  datafactories:{type:'Microsoft.DataFactory/factories',api:'2018-06-01'},
  azuredatabricks:{type:'Microsoft.Databricks/workspaces',api:'2024-05-01',skuName:'premium'},
  azuresynapseanalytics:{type:'Microsoft.Synapse/workspaces',api:'2021-06-01'},
  azureopenai:{type:'Microsoft.CognitiveServices/accounts',api:'2024-04-01-preview',kind:'OpenAI',skuName:'S0'},
  cognitiveservices:{type:'Microsoft.CognitiveServices/accounts',api:'2024-04-01-preview',skuName:'S0'},
  cognitivesearch:{type:'Microsoft.Search/searchServices',api:'2024-03-01-preview',skuName:'standard'},
  machinelearning:{type:'Microsoft.MachineLearningServices/workspaces',api:'2024-04-01'},
  iothub:{type:'Microsoft.Devices/IotHubs',api:'2023-06-30',skuName:'S1',skuCapacity:1},
  recoveryservicesvaults:{type:'Microsoft.RecoveryServices/vaults',api:'2024-01-01',skuName:'Standard'},
};
function san(n){return n.replace(/[^a-zA-Z0-9]/g,'').replace(/^[0-9]+/,'').toLowerCase()||'res';}
function uv(n,u){var b=san(n);if(!u.has(b)){u.add(b);return b;}var i=2;while(u.has(b+i))i++;u.add(b+i);return b+i;}
function res(item){var s=(item.serviceType||item.type||'').toLowerCase();if(BICEP_MAP[s])return BICEP_MAP[s];var k=san(item.name||'');if(BICEP_MAP[k])return BICEP_MAP[k];for(var x in BICEP_MAP){if(k.indexOf(x)>=0||x.indexOf(k)>=0)return BICEP_MAP[x];}return null;}
function blk(item,v,m){var s=(item.serviceType||'').toLowerCase(),L=[];
L.push("resource "+v+" '"+m.type+"@"+m.api+"' = {");L.push("  name: "+v+"Name");L.push("  location: location");
if(m.kind)L.push("  kind: '"+m.kind+"'");
var skipSku=s==='virtualmachine'||s==='vmscalesets'||s==='kubernetesservices'||s==='azurecosmosdb'||s==='sqldatabase'||s==='sqlserver'||s==='keyvaults';if(!skipSku&&(m.skuName||m.sku)){L.push("  sku: {");L.push("    name: '"+(m.skuName||m.sku)+"'");if(m.skuTier)L.push("    tier: '"+m.skuTier+"'");if(m.skuFamily)L.push("    family: '"+m.skuFamily+"'");if(m.skuCapacity!==undefined)L.push("    capacity: "+m.skuCapacity);L.push("  }");}
L.push("  properties: {");
if(s==='virtualmachine'){L.push("    hardwareProfile: { vmSize: '"+(m.sku||'Standard_D2s_v5')+"' }");L.push("    osProfile: { computerName: "+v+"Name, adminUsername: adminUsername, adminPassword: adminPassword }");L.push("    storageProfile: { imageReference: { publisher: 'Canonical', offer: '0001-com-ubuntu-server-jammy', sku: '22_04-lts-gen2', version: 'latest' }, osDisk: { createOption: 'FromImage' } }");L.push("    networkProfile: { networkInterfaces: [] }");}
else if(s==='kubernetesservices'){L.push("    dnsPrefix: '"+v+"'");L.push("    agentPoolProfiles: [{ name: 'system', count: 3, vmSize: '"+(m.sku||'Standard_D4s_v5')+"', mode: 'System' }]");L.push("    identity: { type: 'SystemAssigned' }");}
else if(s==='storageaccounts'){L.push("    accessTier: 'Hot'");L.push("    supportsHttpsTrafficOnly: true");L.push("    minimumTlsVersion: 'TLS1_2'");}
else if(s==='keyvaults'){L.push("    tenantId: subscription().tenantId");L.push("    sku: { family: 'A', name: 'standard' }");L.push("    enableRbacAuthorization: true");}
else if(s==='azurecosmosdb'){L.push("    databaseAccountOfferType: 'Standard'");L.push("    consistencyPolicy: { defaultConsistencyLevel: 'Session' }");L.push("    locations: [{ locationName: location, failoverPriority: 0 }]");}
else if(s==='sqldatabase'||s==='sqlserver'){L.push("    administratorLogin: adminUsername");L.push("    administratorLoginPassword: adminPassword");L.push("    version: '12.0'");}
else if(s==='virtualnetworks'){L.push("    addressSpace: { addressPrefixes: ['10.0.0.0/16'] }");}
else if(s==='networksecuritygroups'){L.push("    securityRules: []");}
else if(s==='disks'||s==='snapshots'){L.push("    creationData: { createOption: 'Empty' }");L.push("    diskSizeGB: "+(m.diskSizeGb||128));}
else if(s==='applicationinsights'){L.push("    Application_Type: 'web'");}
else if(s==='cacheredis'){L.push("    enableNonSslPort: false");L.push("    minimumTlsVersion: '1.2'");}
L.push("  }");L.push("  tags: tags");L.push("}");return L.join('\n');}
export function generateBicep(items,connections,boundaries,options){
  var used=new Set(),L=[],vm=new Map(),un=0;
  L.push('// Generated by Cloud Canvas Designer');L.push('// Date: '+new Date().toISOString());L.push('// Services: '+items.length+', Connections: '+connections.length);L.push('');
  L.push("targetScope = 'resourceGroup'");L.push('');L.push("param location string = resourceGroup().location");L.push("@allowed(['dev','staging','production'])");L.push("param environment string = 'production'");L.push('');
  var nc=items.some(function(i){var s=(i.serviceType||'').toLowerCase();return s==='virtualmachine'||s==='vmscalesets'||s==='sqldatabase'||s==='sqlserver';});
  if(nc){L.push("param adminUsername string");L.push("@secure()");L.push("param adminPassword string");L.push('');}
  L.push("var tags = { environment: environment, managedBy: 'Cloud Canvas Designer' }");L.push('');
  items.forEach(function(i){var v=uv(i.name||'res',used);vm.set(i.id,v);L.push("param "+v+"Name string = '"+san(i.name)+"'");});L.push('');
  items.forEach(function(i){var m=res(i),v=vm.get(i.id);if(!m){L.push('// WARNING: '+i.name+' ('+(i.serviceType||'unknown')+') - unmapped');L.push('');un++;return;}L.push('// '+i.name);L.push(blk(i,v,m));L.push('');});
  L.push('// Outputs');items.forEach(function(i){if(!res(i))return;var v=vm.get(i.id);L.push('output '+v+'Id string = '+v+'.id');});
  if(un>0)L.push('// '+un+' resource(s) unmapped');return L.join('\n');}
export function exportBicepFile(items,connections,boundaries,options){
  var c=generateBicep(items,connections,boundaries,options||{});var b=new Blob([c],{type:'text/plain'});var u=URL.createObjectURL(b);var a=document.createElement('a');
  var t=new Date().toISOString().replace(/[:.]/g,'-').slice(0,-5);a.href=u;a.download='azure-architecture-'+t+'.bicep';document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(u);
  return{filename:a.download,itemCount:items.length,connectionCount:connections.length};}

