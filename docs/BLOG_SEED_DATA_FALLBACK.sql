-- =========================================================================
-- BLOG SEED DATA — FALLBACK (simpler INSERT strategy)
-- Use this if the CROSS JOIN LATERAL version returned 0 seed rows.
-- =========================================================================

-- Wipe any partial seed
DELETE FROM public.blog_comments WHERE is_seed = true;
DELETE FROM public.blog_likes    WHERE is_seed = true;

-- Disable rate-limit trigger during bulk insert
ALTER TABLE public.blog_comments DISABLE TRIGGER blog_comments_rate_limit_trigger;

-- ---------- Personas ----------
WITH personas(uid, full_name) AS (
  VALUES
    (gen_random_uuid(), 'Priya Sharma'),
    (gen_random_uuid(), 'Rajesh Kumar'),
    (gen_random_uuid(), 'Ananya Menon'),
    (gen_random_uuid(), 'Vikram Rao'),
    (gen_random_uuid(), 'Neha Iyer'),
    (gen_random_uuid(), 'Arjun Patel'),
    (gen_random_uuid(), 'Kavya Reddy'),
    (gen_random_uuid(), 'Rohan Desai'),
    (gen_random_uuid(), 'Sneha Krishnan'),
    (gen_random_uuid(), 'Aditya Nair'),
    (gen_random_uuid(), 'Meera Chatterjee'),
    (gen_random_uuid(), 'Karan Malhotra'),
    (gen_random_uuid(), 'Divya Pillai'),
    (gen_random_uuid(), 'Nikhil Bhat'),
    (gen_random_uuid(), 'Ritu Agarwal'),
    (gen_random_uuid(), 'Sanjay Verma'),
    (gen_random_uuid(), 'Pooja Joshi'),
    (gen_random_uuid(), 'Amit Bansal'),
    (gen_random_uuid(), 'Isha Chopra'),
    (gen_random_uuid(), 'Rahul Saxena'),
    (gen_random_uuid(), 'Sarah Chen'),
    (gen_random_uuid(), 'Marcus Johnson'),
    (gen_random_uuid(), 'Emma Rodriguez'),
    (gen_random_uuid(), 'David Miller'),
    (gen_random_uuid(), 'Priyanka Gupta'),
    (gen_random_uuid(), 'Ahmad Rashid'),
    (gen_random_uuid(), 'Julia Zimmermann'),
    (gen_random_uuid(), 'Kenji Tanaka'),
    (gen_random_uuid(), 'Olivia Thompson'),
    (gen_random_uuid(), 'Rafael Souza')
),
comments AS (
  SELECT unnest(ARRAY[
    'Excellent breakdown. Bookmarking this for our next architecture review.',
    'Wish I had read this six months ago — would have saved us a lot of pain.',
    'Great write-up. Sharing with my team on Slack right now.',
    'This is exactly the kind of practical content I have been searching for.',
    'Clear and to the point. Thanks for putting this together.',
    'Really helpful. The examples are spot on.',
    'Best explanation I have found on this topic.',
    'Loved the anti-patterns section — that is what most tutorials miss.',
    'We are running exactly this in production and can confirm it works well at scale.',
    'The decision matrix at the end is gold. Copied it to our internal wiki.',
    'Any chance of a follow-up post covering the multi-region variant?',
    'Sent this to my manager to justify the refactor we have been proposing for months.',
    'The cost numbers match what I see on my own Azure bill. Refreshing.',
    'Solid content. Not another "hello world" tutorial.',
    'You should turn this into a video series.',
    'Do you have a template for this in Cloud Canvas? Would love to jump-start our design.',
    'The trade-offs section is what I appreciated most.',
    'Following your blog now. Fresh perspective compared to standard Microsoft docs.',
    'Question — how do you handle the same pattern in an ExpressRoute + VPN backup topology?',
    'This saved our team about a week of debugging. Thank you.',
    'Very actionable. Most posts on this topic are vendor-flavored fluff.',
    'The examples reflect real production concerns. Refreshing to read.',
    'Just what I needed to prep for my upcoming design review.',
    'Concise and correct. Rare combination in Azure content.',
    'Adopted this pattern on our latest project — highly recommend.',
    'Reading this now for the second time. Even more useful the second pass.',
    'Shared this in our internal architecture guild — everyone loved it.',
    'The failure-mode discussion is what most cloud tutorials skip.',
    'Great work. Would love to see the equivalent for AWS side-by-side.',
    'The pricing figures alone make this worth reading.'
  ]) AS body
),
articles AS (
  SELECT unnest(ARRAY[
    'well-architected-framework-5-pillars','hub-spoke-network-topology','terraform-vs-bicep-vs-arm',
    'aks-vs-app-service-vs-functions','cost-optimization-strategies','private-endpoints-vs-service-endpoints',
    'zero-trust-architecture-azure','azure-landing-zones','sql-vs-cosmos-vs-postgres',
    'entra-id-conditional-access','observability-azure-monitor','onprem-to-azure-migration',
    'event-driven-ecommerce-blueprint','multi-tenant-saas-blueprint','iot-lambda-architecture',
    'enterprise-rag-blueprint','pci-dss-payments-blueprint','data-mesh-on-azure',
    'saga-pattern-microservices','active-passive-dr-blueprint','azure-firewall-vs-nva',
    'expressroute-vs-vpn','azure-dns-private-resolver','virtual-wan-deep-dive',
    'defender-for-cloud-deep-dive','key-vault-secrets-rotation','managed-identity-patterns',
    'sentinel-detections-playbook','container-apps-deep-dive','aks-production-checklist',
    'gpu-compute-on-azure','serverless-patterns','azure-fabric-overview',
    'cosmos-db-partition-keys','vector-databases-azure','delta-lake-on-azure',
    'privileged-identity-management','entra-id-b2c-vs-external-id','workload-identity-federation',
    'entra-id-access-reviews','kql-cheatsheet','managed-prometheus-grafana',
    'opentelemetry-on-azure','slo-error-budgets','finops-organizational',
    'reservations-savings-plans','aks-cost-optimization','egress-cost-control',
    'github-actions-to-azure','azure-devops-vs-github','policy-as-code-azure',
    'platform-engineering-azure','naming-tagging-standards','subscription-strategy',
    'disaster-recovery-patterns','multi-region-architecture','sql-server-to-azure-sql',
    'vmware-to-azure','aws-to-azure-migration','mainframe-modernization'
  ]) AS slug
),
personas_array AS (
  SELECT array_agg(row(uid, full_name)::text) AS arr FROM personas
),
comments_array AS (
  SELECT array_agg(body) AS arr FROM comments
)
-- Insert 4 comments per article (60 × 4 = 240 seed comments)
INSERT INTO public.blog_comments (article_slug, user_id, user_name, content, created_at, is_seed)
SELECT
  a.slug,
  p.uid,
  p.full_name,
  c.body,
  now() - (random() * interval '45 days'),
  true
FROM articles a
CROSS JOIN LATERAL (
  SELECT uid, full_name FROM personas ORDER BY random() LIMIT 4
) p
CROSS JOIN LATERAL (
  SELECT body FROM comments ORDER BY random() LIMIT 1
) c;

-- Re-enable trigger for real users
ALTER TABLE public.blog_comments ENABLE TRIGGER blog_comments_rate_limit_trigger;

-- ---------- Likes: variable count per article ----------
DO $$
DECLARE
  slug_list text[] := ARRAY[
    'well-architected-framework-5-pillars','hub-spoke-network-topology','terraform-vs-bicep-vs-arm',
    'aks-vs-app-service-vs-functions','cost-optimization-strategies','private-endpoints-vs-service-endpoints',
    'zero-trust-architecture-azure','azure-landing-zones','sql-vs-cosmos-vs-postgres',
    'entra-id-conditional-access','observability-azure-monitor','onprem-to-azure-migration',
    'event-driven-ecommerce-blueprint','multi-tenant-saas-blueprint','iot-lambda-architecture',
    'enterprise-rag-blueprint','pci-dss-payments-blueprint','data-mesh-on-azure',
    'saga-pattern-microservices','active-passive-dr-blueprint','azure-firewall-vs-nva',
    'expressroute-vs-vpn','azure-dns-private-resolver','virtual-wan-deep-dive',
    'defender-for-cloud-deep-dive','key-vault-secrets-rotation','managed-identity-patterns',
    'sentinel-detections-playbook','container-apps-deep-dive','aks-production-checklist',
    'gpu-compute-on-azure','serverless-patterns','azure-fabric-overview',
    'cosmos-db-partition-keys','vector-databases-azure','delta-lake-on-azure',
    'privileged-identity-management','entra-id-b2c-vs-external-id','workload-identity-federation',
    'entra-id-access-reviews','kql-cheatsheet','managed-prometheus-grafana',
    'opentelemetry-on-azure','slo-error-budgets','finops-organizational',
    'reservations-savings-plans','aks-cost-optimization','egress-cost-control',
    'github-actions-to-azure','azure-devops-vs-github','policy-as-code-azure',
    'platform-engineering-azure','naming-tagging-standards','subscription-strategy',
    'disaster-recovery-patterns','multi-region-architecture','sql-server-to-azure-sql',
    'vmware-to-azure','aws-to-azure-migration','mainframe-modernization'
  ];
  s text;
  n int;
BEGIN
  FOREACH s IN ARRAY slug_list LOOP
    -- Random like count between 60 and 320
    n := 60 + floor(random() * 260)::int;
    INSERT INTO public.blog_likes (article_slug, user_id, created_at, is_seed)
    SELECT s, gen_random_uuid(), now() - (random() * interval '60 days'), true
    FROM generate_series(1, n)
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- ---------- Verify ----------
SELECT
  (SELECT count(*) FROM public.blog_comments WHERE is_seed = true) AS seed_comments,
  (SELECT count(*) FROM public.blog_likes    WHERE is_seed = true) AS seed_likes,
  (SELECT count(DISTINCT article_slug) FROM public.blog_comments WHERE is_seed = true) AS articles_with_comments,
  (SELECT count(DISTINCT article_slug) FROM public.blog_likes    WHERE is_seed = true) AS articles_with_likes;
