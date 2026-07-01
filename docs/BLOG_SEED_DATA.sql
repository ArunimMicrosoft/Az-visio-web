-- =========================================================================
-- BLOG SEED DATA — populate comments + likes on every article
-- Run AFTER BLOG_COMMENTS_TABLE.sql AND BLOG_LIKES_TABLE.sql
-- =========================================================================
-- To reset later:
--   DELETE FROM public.blog_comments WHERE is_seed = true;
--   DELETE FROM public.blog_likes    WHERE is_seed = true;
-- =========================================================================

-- Temporarily disable the rate-limit trigger for the bulk insert
ALTER TABLE public.blog_comments DISABLE TRIGGER blog_comments_rate_limit_trigger;

-- ---------- 1. Seed 60 synthetic personas we'll reuse across articles ----------
CREATE TEMP TABLE _personas (
  uid       uuid   DEFAULT gen_random_uuid(),
  full_name text
) ON COMMIT DROP;

INSERT INTO _personas (full_name) VALUES
  ('Priya Sharma'), ('Rajesh Kumar'), ('Ananya Menon'), ('Vikram Rao'), ('Neha Iyer'),
  ('Arjun Patel'), ('Kavya Reddy'), ('Rohan Desai'), ('Sneha Krishnan'), ('Aditya Nair'),
  ('Meera Chatterjee'), ('Karan Malhotra'), ('Divya Pillai'), ('Nikhil Bhat'), ('Ritu Agarwal'),
  ('Sanjay Verma'), ('Pooja Joshi'), ('Amit Bansal'), ('Isha Chopra'), ('Rahul Saxena'),
  ('Sarah Chen'), ('Marcus Johnson'), ('Emma Rodriguez'), ('David Miller'), ('Priyanka Gupta'),
  ('Ahmad Rashid'), ('Julia Zimmermann'), ('Kenji Tanaka'), ('Olivia Thompson'), ('Rafael Souza'),
  ('Anjali Suresh'), ('Vivek Sharma'), ('Nisha Kapoor'), ('Ravi Menon'), ('Deepika Rao'),
  ('Kunal Mishra'), ('Shreya Bose'), ('Manish Tiwari'), ('Tara D''Souza'), ('Harish Nambiar'),
  ('Fatima Al-Saleh'), ('Chen Wei'), ('Michael Brown'), ('Lena Petrov'), ('Yuki Sato'),
  ('Aditi Ranganathan'), ('Sameer Khan'), ('Kritika Batra'), ('Prakash Reddy'), ('Ishaan Trivedi'),
  ('Charu Mehta'), ('Gaurav Sinha'), ('Sonal Deshpande'), ('Vinay Kulkarni'), ('Riya Bhargava'),
  ('Nikita Sethi'), ('Vishal Ramesh'), ('Preeti Anand'), ('Suresh Iyer'), ('Anushka Roy');

-- ---------- 2. Comment templates grouped by loose topic ----------
CREATE TEMP TABLE _comments_generic (body text) ON COMMIT DROP;
INSERT INTO _comments_generic (body) VALUES
  ('Excellent breakdown. Bookmarking this for our next architecture review.'),
  ('Wish I had read this six months ago — would have saved us a lot of pain.'),
  ('Great write-up. Sharing with my team on Slack right now.'),
  ('This is exactly the kind of practical content I have been searching for.'),
  ('Clear and to the point. Thanks for putting this together.'),
  ('Really helpful. The examples are spot on.'),
  ('Best explanation I have found on this topic. Everything else online is either too academic or too vendor-flavored.'),
  ('Loved the "anti-patterns" section — that is what most tutorials miss.'),
  ('We are running exactly this in production and can confirm it works well at scale.'),
  ('The decision matrix at the end is gold. Copied it to our internal wiki.'),
  ('Any chance of a follow-up post covering the multi-region variant?'),
  ('Sent this to my manager to justify the refactor we have been proposing for months.'),
  ('The cost numbers match what I see on my own Azure bill. Refreshing to see accurate figures.'),
  ('Solid content. Not another "hello world" tutorial — this actually reflects real production concerns.'),
  ('You should turn this into a video series, would love to see it walked through visually.'),
  ('Do you have a template for this in Cloud Canvas? Would love to jump-start our design with it.'),
  ('The trade-offs section is what I appreciated most. Every decision has a cost, and this article names them.'),
  ('Following your blog now. Fresh perspective compared to the standard Microsoft docs.'),
  ('One correction: in step 3, the CIDR should not overlap with the hub range. Otherwise perfect.'),
  ('Question — how do you handle the same pattern in an ExpressRoute + VPN backup topology?');

CREATE TEMP TABLE _comments_networking (body text) ON COMMIT DROP;
INSERT INTO _comments_networking (body) VALUES
  ('We moved from flat VNets to hub-spoke last year and never looked back. Confirmed everything you covered.'),
  ('The UDR advice alone saved me hours of debugging. Wish I had this last quarter.'),
  ('Any recommendations on Azure Firewall Premium vs Standard for a 200-node landing zone?'),
  ('Private DNS zone linking is the #1 thing new teams miss. Great that you called it out.'),
  ('We use Virtual WAN across 4 regions — the operational simplicity is worth the premium.'),
  ('Peering fees add up faster than people expect. Highlighting them saves real budget.'),
  ('Have you tried Azure Firewall Manager for centralized policy? Curious about your take.');

CREATE TEMP TABLE _comments_security (body text) ON COMMIT DROP;
INSERT INTO _comments_security (body) VALUES
  ('Zero Trust is a journey. Loved that you did not oversell it as a one-time project.'),
  ('Conditional Access policies are underrated. This article should be required reading for every new Azure admin.'),
  ('We hit Private Endpoint DNS quirks exactly like you describe. Solved after 3 days of head-scratching.'),
  ('Key Vault + Managed Identity is the single biggest security win I have ever shipped.'),
  ('The break-glass account section is critical. Too many teams skip that until they lock themselves out.'),
  ('Great article. We deployed Defender for Cloud last month and Secure Score climbed 30 points in 2 weeks.'),
  ('Do you have thoughts on Sentinel vs a third-party SIEM like Splunk for a mid-size setup?');

CREATE TEMP TABLE _comments_cost (body text) ON COMMIT DROP;
INSERT INTO _comments_cost (body) VALUES
  ('Cut our Azure spend by 42% using these exact tactics. Reservations were the biggest win.'),
  ('Spot VMs for our CI/CD saved us ~$3,200/month with zero disruption. Cannot recommend enough.'),
  ('The FinOps section resonates. Cost is a team problem, not a "the ops guy will handle it" problem.'),
  ('Storage tiering is criminally underused. We had 40TB sitting in Hot that should have been Archive.'),
  ('Right-sizing quarterly is a habit worth building. Advisor recommendations pay for themselves.'),
  ('Egress costs killed our margin last year until we moved static content behind CDN.');

CREATE TEMP TABLE _comments_data (body text) ON COMMIT DROP;
INSERT INTO _comments_data (body) VALUES
  ('Cosmos partition-key advice is the article we all needed. Fixing a wrong choice is brutal.'),
  ('We picked SQL Hyperscale over Cosmos for exactly the reasons you list. Great decision framework.'),
  ('Fabric has been a mixed experience for us but the OneLake unification is genuinely useful.'),
  ('pg_vector inside our existing Postgres was the fastest path to shipping AI features.'),
  ('Delta Lake time-travel saved us during a bad merge. Cannot imagine going back to raw Parquet.');

CREATE TEMP TABLE _comments_devops (body text) ON COMMIT DROP;
INSERT INTO _comments_devops (body) VALUES
  ('OIDC federation was the easiest security win of the year. No more rotating PATs.'),
  ('We moved fully to Bicep from Terraform for Azure-only workloads. Zero regrets.'),
  ('The policy-as-code section reflects our journey exactly. Started audit-only, moved to deny after 3 months.'),
  ('Reusable workflows in GitHub Actions saved us from the classic 40-repo drift.'),
  ('Platform engineering is finally getting the attention it deserves. Great to see it covered here.');

CREATE TEMP TABLE _comments_compute (body text) ON COMMIT DROP;
INSERT INTO _comments_compute (body) VALUES
  ('Container Apps is our default now. Only reach for AKS when we actually need K8s features.'),
  ('AKS is powerful but has a real ops cost. Small teams should think twice before adopting.'),
  ('The Functions patterns section is the best summary of Durable Functions I have seen.'),
  ('GPU pricing table alone justifies the read. H100 sticker shock is real.'),
  ('App Service P1v3 is criminally underrated. Ships a huge amount of workload for the price.');

CREATE TEMP TABLE _comments_migration (body text) ON COMMIT DROP;
INSERT INTO _comments_migration (body) VALUES
  ('The 6 Rs framework kept our migration honest. Prevented us from over-modernizing everything.'),
  ('DMS online migration for our SQL cluster was smoother than we expected. 12 min cutover.'),
  ('AVS is expensive but it saved our timeline. We modernized after landing, not before.'),
  ('The "hypercare" phase is underrated. Do not decommission for 30 days minimum.'),
  ('Discovery is where most migrations fail. 90 days of scanning is not overkill.');

-- ---------- 3. All 60 article slugs ----------
CREATE TEMP TABLE _articles (
  slug     text PRIMARY KEY,
  category text,
  base_likes int
) ON COMMIT DROP;

INSERT INTO _articles (slug, category, base_likes) VALUES
  ('well-architected-framework-5-pillars',    'best',     247),
  ('hub-spoke-network-topology',              'net',      198),
  ('terraform-vs-bicep-vs-arm',               'devops',   312),
  ('aks-vs-app-service-vs-functions',         'compute',  221),
  ('cost-optimization-strategies',            'cost',     289),
  ('private-endpoints-vs-service-endpoints',  'sec',      156),
  ('zero-trust-architecture-azure',           'sec',      178),
  ('azure-landing-zones',                     'best',     183),
  ('sql-vs-cosmos-vs-postgres',               'data',     201),
  ('entra-id-conditional-access',             'sec',      165),
  ('observability-azure-monitor',             'best',     142),
  ('onprem-to-azure-migration',               'migration',132),
  ('event-driven-ecommerce-blueprint',        'compute',  267),
  ('multi-tenant-saas-blueprint',             'compute',  245),
  ('iot-lambda-architecture',                 'data',      98),
  ('enterprise-rag-blueprint',                'data',     421),
  ('pci-dss-payments-blueprint',              'sec',      112),
  ('data-mesh-on-azure',                      'data',      88),
  ('saga-pattern-microservices',              'compute',  102),
  ('active-passive-dr-blueprint',             'best',     124),
  ('azure-firewall-vs-nva',                   'net',      145),
  ('expressroute-vs-vpn',                     'net',      178),
  ('azure-dns-private-resolver',              'net',       76),
  ('virtual-wan-deep-dive',                   'net',       92),
  ('defender-for-cloud-deep-dive',            'sec',      139),
  ('key-vault-secrets-rotation',              'sec',      152),
  ('managed-identity-patterns',               'sec',      207),
  ('sentinel-detections-playbook',            'sec',       94),
  ('container-apps-deep-dive',                'compute',  186),
  ('aks-production-checklist',                'compute',  298),
  ('gpu-compute-on-azure',                    'compute',  241),
  ('serverless-patterns',                     'compute',  173),
  ('azure-fabric-overview',                   'data',     167),
  ('cosmos-db-partition-keys',                'data',     229),
  ('vector-databases-azure',                  'data',     318),
  ('delta-lake-on-azure',                     'data',     144),
  ('privileged-identity-management',          'sec',      118),
  ('entra-id-b2c-vs-external-id',             'sec',       86),
  ('workload-identity-federation',            'devops',   194),
  ('entra-id-access-reviews',                 'sec',       72),
  ('kql-cheatsheet',                          'best',     356),
  ('managed-prometheus-grafana',              'best',      98),
  ('opentelemetry-on-azure',                  'best',     127),
  ('slo-error-budgets',                       'best',     108),
  ('finops-organizational',                   'cost',     134),
  ('reservations-savings-plans',              'cost',     215),
  ('aks-cost-optimization',                   'cost',     262),
  ('egress-cost-control',                     'cost',     189),
  ('github-actions-to-azure',                 'devops',   243),
  ('azure-devops-vs-github',                  'devops',   176),
  ('policy-as-code-azure',                    'devops',   131),
  ('platform-engineering-azure',              'devops',   204),
  ('naming-tagging-standards',                'best',     168),
  ('subscription-strategy',                   'best',     121),
  ('disaster-recovery-patterns',              'best',     147),
  ('multi-region-architecture',               'best',     185),
  ('sql-server-to-azure-sql',                 'migration',126),
  ('vmware-to-azure',                         'migration',159),
  ('aws-to-azure-migration',                  'migration',204),
  ('mainframe-modernization',                 'migration', 71);

-- ---------- 4. Generate 3-6 comments per article ----------
-- Uses the topic-specific pool ~40% of the time, generic pool ~60% of the time
INSERT INTO public.blog_comments (article_slug, user_id, user_name, content, created_at, is_seed)
SELECT
  a.slug,
  p.uid,
  p.full_name,
  c.body,
  now() - (random() * interval '45 days'),
  true
FROM _articles a
CROSS JOIN LATERAL (
  SELECT 3 + floor(random() * 4)::int AS n_comments   -- 3 to 6 per article
) k
CROSS JOIN LATERAL (
  SELECT * FROM _personas ORDER BY random() LIMIT k.n_comments
) p
CROSS JOIN LATERAL (
  SELECT body
  FROM (
    SELECT body FROM _comments_generic
    UNION ALL
    SELECT body FROM (
      SELECT body FROM _comments_networking WHERE a.category = 'net'
      UNION ALL SELECT body FROM _comments_security   WHERE a.category = 'sec'
      UNION ALL SELECT body FROM _comments_cost       WHERE a.category = 'cost'
      UNION ALL SELECT body FROM _comments_data       WHERE a.category = 'data'
      UNION ALL SELECT body FROM _comments_devops     WHERE a.category = 'devops'
      UNION ALL SELECT body FROM _comments_compute    WHERE a.category = 'compute'
      UNION ALL SELECT body FROM _comments_migration  WHERE a.category = 'migration'
    ) t
  ) all_c
  ORDER BY random()
  LIMIT 1
) c;

-- Re-enable rate-limit trigger for real users
ALTER TABLE public.blog_comments ENABLE TRIGGER blog_comments_rate_limit_trigger;

-- ---------- 5. Generate likes ----------
-- For each article, insert `base_likes` synthetic likes with unique fake UUIDs.
-- Uses a large synthetic UUID pool via generate_series + gen_random_uuid.
INSERT INTO public.blog_likes (article_slug, user_id, created_at, is_seed)
SELECT
  a.slug,
  gen_random_uuid(),
  now() - (random() * interval '60 days'),
  true
FROM _articles a
CROSS JOIN LATERAL generate_series(1, a.base_likes) g
ON CONFLICT DO NOTHING;

-- ---------- 6. Summary ----------
DO $$
DECLARE
  c_count int;
  l_count int;
BEGIN
  SELECT count(*) INTO c_count FROM public.blog_comments WHERE is_seed = true;
  SELECT count(*) INTO l_count FROM public.blog_likes    WHERE is_seed = true;
  RAISE NOTICE 'Seeded % comments and % likes across 60 articles.', c_count, l_count;
END $$;
