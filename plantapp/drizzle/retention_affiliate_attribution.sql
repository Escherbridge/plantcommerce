-- Read-only retention report for affiliate attribution data. It never deletes data.
BEGIN READ ONLY;

WITH cutoffs AS (
	SELECT
		now() - interval '48 hours' AS dedupe_cutoff,
		now() - interval '30 days' AS expired_unconsumed_cutoff,
		now() - interval '90 days' AS click_cutoff,
		now() - interval '365 days' AS consumed_attribution_cutoff
)
SELECT
	(SELECT count(*) FROM affiliate_click_dedupe, cutoffs WHERE last_clicked_at < dedupe_cutoff) AS dedupe_candidates,
	(SELECT count(*) FROM affiliate_attribution, cutoffs WHERE consumed_at IS NULL AND expires_at < expired_unconsumed_cutoff) AS expired_unconsumed_candidates,
	(SELECT count(*) FROM affiliate_attribution_click, cutoffs WHERE clicked_at < click_cutoff) AS click_candidates,
	(SELECT count(*) FROM affiliate_attribution, cutoffs WHERE consumed_at IS NOT NULL AND expires_at < consumed_attribution_cutoff) AS consumed_attribution_candidates;

SELECT id, affiliate_link_id, expires_at, consumed_at
FROM affiliate_attribution
WHERE consumed_at IS NULL
	AND expires_at < now() - interval '30 days'
ORDER BY expires_at
LIMIT 100;

SELECT id, affiliate_link_id, clicked_at
FROM affiliate_attribution_click
WHERE clicked_at < now() - interval '90 days'
ORDER BY clicked_at
LIMIT 100;

ROLLBACK;
