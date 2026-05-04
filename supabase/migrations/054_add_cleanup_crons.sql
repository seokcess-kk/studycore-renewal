-- 정기 cleanup cron 등록
-- - rate_limits: 매일 KST 04:00 (UTC 19:00)
-- - audit_logs:  매주 일요일 KST 05:00 (UTC 20:00) — cleanup_old_audit_logs는 90일 이전 row 삭제

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- rate_limits 정리 (idempotent)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup-rate-limits-daily') THEN
    PERFORM cron.unschedule('cleanup-rate-limits-daily');
  END IF;
END $$;

SELECT cron.schedule(
  'cleanup-rate-limits-daily',
  '0 19 * * *',
  $$SELECT cleanup_rate_limits();$$
);

-- audit_logs 정리 (idempotent)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup-audit-logs-weekly') THEN
    PERFORM cron.unschedule('cleanup-audit-logs-weekly');
  END IF;
END $$;

SELECT cron.schedule(
  'cleanup-audit-logs-weekly',
  '0 20 * * 0',
  $$SELECT cleanup_old_audit_logs();$$
);
