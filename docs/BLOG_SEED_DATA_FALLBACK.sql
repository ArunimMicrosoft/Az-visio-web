-- =========================================================================
-- BLOG SEED DATA — SIMPLE plpgsql version (always works)
-- Uses arrays + FOR loops, no CTEs, no LATERAL joins.
-- =========================================================================

-- Wipe any partial seed first
DELETE FROM public.blog_comments WHERE is_seed = true;
DELETE FROM public.blog_likes    WHERE is_seed = true;

-- Disable rate-limit trigger during bulk insert
ALTER TABLE public.blog_comments DISABLE TRIGGER blog_comments_rate_limit_trigger;

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

  name_list text[] := ARRAY[
    'Priya Sharma','Rajesh Kumar','Ananya Menon','Vikram Rao','Neha Iyer',
    'Arjun Patel','Kavya Reddy','Rohan Desai','Sneha Krishnan','Aditya Nair',
    'Meera Chatterjee','Karan Malhotra','Divya Pillai','Nikhil Bhat','Ritu Agarwal',
    'Sanjay Verma','Pooja Joshi','Amit Bansal','Isha Chopra','Rahul Saxena',
    'Sarah Chen','Marcus Johnson','Emma Rodriguez','David Miller','Priyanka Gupta',
    'Ahmad Rashid','Julia Zimmermann','Kenji Tanaka','Olivia Thompson','Rafael Souza',
    'Anjali Suresh','Vivek Sharma','Nisha Kapoor','Ravi Menon','Deepika Rao',
    'Kunal Mishra','Shreya Bose','Manish Tiwari','Harish Nambiar','Fatima Al-Saleh',
    'Chen Wei','Michael Brown','Lena Petrov','Yuki Sato','Aditi Ranganathan',
    'Sameer Khan','Kritika Batra','Prakash Reddy','Ishaan Trivedi','Charu Mehta'
  ];

  body_list text[] := ARRAY[
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
    'Solid content. Not another hello-world tutorial.',
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
  ];

  s text;
  i int;
  n_likes int;
  n_comments int;
  puid uuid;
  pname text;
  cbody text;
  total_comments int := 0;
  total_likes int := 0;
BEGIN
  -- Loop through every article
  FOREACH s IN ARRAY slug_list LOOP
    -- 3 to 5 seed comments per article
    n_comments := 3 + floor(random() * 3)::int;

    FOR i IN 1..n_comments LOOP
      puid  := gen_random_uuid();
      pname := name_list[1 + floor(random() * array_length(name_list, 1))::int];
      cbody := body_list[1 + floor(random() * array_length(body_list, 1))::int];

      INSERT INTO public.blog_comments
        (article_slug, user_id, user_name, content, created_at, is_seed)
      VALUES
        (s, puid, pname, cbody,
         now() - (random() * interval '45 days'),
         true);

      total_comments := total_comments + 1;
    END LOOP;

    -- 60 to 320 seed likes per article
    n_likes := 60 + floor(random() * 260)::int;

    FOR i IN 1..n_likes LOOP
      INSERT INTO public.blog_likes
        (article_slug, user_id, created_at, is_seed)
      VALUES
        (s, gen_random_uuid(),
         now() - (random() * interval '60 days'),
         true)
      ON CONFLICT DO NOTHING;

      total_likes := total_likes + 1;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Seeded % comments and % likes across % articles.',
    total_comments, total_likes, array_length(slug_list, 1);
END $$;

-- Re-enable trigger for real users
ALTER TABLE public.blog_comments ENABLE TRIGGER blog_comments_rate_limit_trigger;

-- ---------- Verify ----------
SELECT
  (SELECT count(*) FROM public.blog_comments WHERE is_seed = true) AS seed_comments,
  (SELECT count(*) FROM public.blog_likes    WHERE is_seed = true) AS seed_likes,
  (SELECT count(DISTINCT article_slug) FROM public.blog_comments WHERE is_seed = true) AS articles_with_comments,
  (SELECT count(DISTINCT article_slug) FROM public.blog_likes    WHERE is_seed = true) AS articles_with_likes;
