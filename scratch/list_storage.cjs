const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://moephwizcfrdupquxpha.supabase.co', 'sb_publishable_PSv-gFKYhEzvzpw3bUFEPw_rOk7dUyE');

async function listAll(bucket, prefix = '', depth = 0) {
  if (depth > 6) return [];
  const { data, error } = await supabase.storage.from(bucket).list(prefix, { limit: 1000, sortBy: { column: 'name', order: 'asc' } });
  if (error) { console.log('error', bucket, prefix, error.message); return []; }
  let files = [];
  for (const entry of data) {
    const path = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.id === null && entry.metadata === null) {
      const sub = await listAll(bucket, path, depth + 1);
      files = files.concat(sub);
    } else {
      files.push({ path, size: entry.metadata?.size || 0, mimetype: entry.metadata?.mimetype, eTag: entry.metadata?.eTag, created_at: entry.created_at });
    }
  }
  return files;
}

(async () => {
  const buckets = ['covers', 'editais', 'parceiros', 'reports'];
  const allResults = {};
  for (const bucket of buckets) {
    const files = await listAll(bucket);
    const total = files.reduce((sum, f) => sum + f.size, 0);
    allResults[bucket] = { count: files.length, totalMB: (total / 1024 / 1024).toFixed(2), files };
    console.log(`${bucket}: ${files.length} files, ${(total / 1024 / 1024).toFixed(2)} MB`);
  }
  require('fs').writeFileSync(__dirname + '/storage_report.json', JSON.stringify(allResults, null, 2));
})();
