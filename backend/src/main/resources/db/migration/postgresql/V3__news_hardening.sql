CREATE TABLE IF NOT EXISTS api_quota_log (
    log_date DATE NOT NULL,
    api_name VARCHAR(100) NOT NULL,
    call_count INT NOT NULL DEFAULT 0,
    PRIMARY KEY (log_date, api_name)
);

UPDATE trusted_source
SET domain = 'pib.gov.in',
    source_url = 'https://www.pib.gov.in/rssfeed.aspx?mincode=2',
    category_scope = 'SUBSIDY,LAW',
    source_type = 'RSS',
    fetch_keyword = NULL,
    is_active = TRUE
WHERE name = 'PIB Agriculture';

INSERT INTO trusted_source (name, domain, source_url, category_scope, source_type, fetch_keyword, is_active, created_at, updated_at)
SELECT 'PIB Agriculture', 'pib.gov.in', 'https://www.pib.gov.in/rssfeed.aspx?mincode=2', 'SUBSIDY,LAW', 'RSS', NULL, TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM trusted_source WHERE name = 'PIB Agriculture');

UPDATE trusted_source
SET domain = 'krishijagran.com',
    source_url = 'https://krishijagran.com/feed/',
    category_scope = 'FARMING_TIP,MARKET',
    source_type = 'RSS',
    fetch_keyword = NULL,
    is_active = TRUE
WHERE name = 'Krishi Jagran';

INSERT INTO trusted_source (name, domain, source_url, category_scope, source_type, fetch_keyword, is_active, created_at, updated_at)
SELECT 'Krishi Jagran', 'krishijagran.com', 'https://krishijagran.com/feed/', 'FARMING_TIP,MARKET', 'RSS', NULL, TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM trusted_source WHERE name = 'Krishi Jagran');

UPDATE trusted_source
SET domain = 'agrifarming.in',
    source_url = 'https://www.agrifarming.in/feed',
    category_scope = 'FARMING_TIP',
    source_type = 'RSS',
    fetch_keyword = NULL,
    is_active = TRUE
WHERE name = 'AgriFarming';

INSERT INTO trusted_source (name, domain, source_url, category_scope, source_type, fetch_keyword, is_active, created_at, updated_at)
SELECT 'AgriFarming', 'agrifarming.in', 'https://www.agrifarming.in/feed', 'FARMING_TIP', 'RSS', NULL, TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM trusted_source WHERE name = 'AgriFarming');

UPDATE trusted_source
SET domain = 'kisanrath.in',
    source_url = 'https://www.kisanrath.in/feed',
    category_scope = 'MARKET,SUBSIDY',
    source_type = 'RSS',
    fetch_keyword = NULL,
    is_active = TRUE
WHERE name = 'Kisan Rath';

INSERT INTO trusted_source (name, domain, source_url, category_scope, source_type, fetch_keyword, is_active, created_at, updated_at)
SELECT 'Kisan Rath', 'kisanrath.in', 'https://www.kisanrath.in/feed', 'MARKET,SUBSIDY', 'RSS', NULL, TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM trusted_source WHERE name = 'Kisan Rath');

UPDATE trusted_source
SET domain = 'gnews.io',
    source_url = 'https://gnews.io/api/v4/search',
    category_scope = 'SUBSIDY,LOAN',
    source_type = 'GNEWS_KEYWORD',
    fetch_keyword = 'kisan subsidy',
    is_active = TRUE
WHERE name = 'GNews: kisan subsidy';

INSERT INTO trusted_source (name, domain, source_url, category_scope, source_type, fetch_keyword, is_active, created_at, updated_at)
SELECT 'GNews: kisan subsidy', 'gnews.io', 'https://gnews.io/api/v4/search', 'SUBSIDY,LOAN', 'GNEWS_KEYWORD', 'kisan subsidy', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM trusted_source WHERE name = 'GNews: kisan subsidy');

UPDATE trusted_source
SET domain = 'gnews.io',
    source_url = 'https://gnews.io/api/v4/search',
    category_scope = 'MARKET',
    source_type = 'GNEWS_KEYWORD',
    fetch_keyword = 'mandi price',
    is_active = TRUE
WHERE name = 'GNews: mandi price';

INSERT INTO trusted_source (name, domain, source_url, category_scope, source_type, fetch_keyword, is_active, created_at, updated_at)
SELECT 'GNews: mandi price', 'gnews.io', 'https://gnews.io/api/v4/search', 'MARKET', 'GNEWS_KEYWORD', 'mandi price', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM trusted_source WHERE name = 'GNews: mandi price');

UPDATE trusted_source
SET domain = 'gnews.io',
    source_url = 'https://gnews.io/api/v4/search',
    category_scope = 'LAW',
    source_type = 'GNEWS_KEYWORD',
    fetch_keyword = 'agriculture law',
    is_active = TRUE
WHERE name = 'GNews: agriculture law';

INSERT INTO trusted_source (name, domain, source_url, category_scope, source_type, fetch_keyword, is_active, created_at, updated_at)
SELECT 'GNews: agriculture law', 'gnews.io', 'https://gnews.io/api/v4/search', 'LAW', 'GNEWS_KEYWORD', 'agriculture law', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM trusted_source WHERE name = 'GNews: agriculture law');

UPDATE trusted_source
SET domain = 'gnews.io',
    source_url = 'https://gnews.io/api/v4/search',
    category_scope = 'WEATHER',
    source_type = 'GNEWS_KEYWORD',
    fetch_keyword = 'crop weather',
    is_active = TRUE
WHERE name = 'GNews: crop weather';

INSERT INTO trusted_source (name, domain, source_url, category_scope, source_type, fetch_keyword, is_active, created_at, updated_at)
SELECT 'GNews: crop weather', 'gnews.io', 'https://gnews.io/api/v4/search', 'WEATHER', 'GNEWS_KEYWORD', 'crop weather', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM trusted_source WHERE name = 'GNews: crop weather');

UPDATE trusted_source
SET domain = 'gnews.io',
    source_url = 'https://gnews.io/api/v4/search',
    category_scope = 'LOAN',
    source_type = 'GNEWS_KEYWORD',
    fetch_keyword = 'farm loan',
    is_active = TRUE
WHERE name = 'GNews: farm loan';

INSERT INTO trusted_source (name, domain, source_url, category_scope, source_type, fetch_keyword, is_active, created_at, updated_at)
SELECT 'GNews: farm loan', 'gnews.io', 'https://gnews.io/api/v4/search', 'LOAN', 'GNEWS_KEYWORD', 'farm loan', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM trusted_source WHERE name = 'GNews: farm loan');

UPDATE trusted_source
SET domain = 'gnews.io',
    source_url = 'https://gnews.io/api/v4/search',
    category_scope = 'SUBSIDY',
    source_type = 'GNEWS_KEYWORD',
    fetch_keyword = 'agri scheme',
    is_active = TRUE
WHERE name = 'GNews: agri scheme';

INSERT INTO trusted_source (name, domain, source_url, category_scope, source_type, fetch_keyword, is_active, created_at, updated_at)
SELECT 'GNews: agri scheme', 'gnews.io', 'https://gnews.io/api/v4/search', 'SUBSIDY', 'GNEWS_KEYWORD', 'agri scheme', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM trusted_source WHERE name = 'GNews: agri scheme');

UPDATE trusted_source
SET is_active = FALSE
WHERE name NOT IN (
    'PIB Agriculture',
    'Krishi Jagran',
    'AgriFarming',
    'Kisan Rath',
    'GNews: kisan subsidy',
    'GNews: mandi price',
    'GNews: agriculture law',
    'GNews: crop weather',
    'GNews: farm loan',
    'GNews: agri scheme'
);
