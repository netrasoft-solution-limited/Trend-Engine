/**
 * TENANT-SCOPED (L5). A client profile is private context: it is never available
 * to another tenant's prompt or query, and never travels below the L5 boundary
 * into the shared evidence layer (PRD §5 principle 3, Arch §3).
 */
export const clientProfile = {
  id: 'jarrow',
  orgId: 'org-jarrow',
  name: 'Jarrow Formulas',
  vertical: 'Supplements — practitioner-adjacent retail',
  owner: 'Pure Play Sports Nutrition · Operator: Abubakar',
  lastUpdated: 'Sep 16, 2026',
  /** PRD §6.4: every output records exactly one tenant, one profile version, one domain-pack version. */
  profileVersion: 'jarrow@2026-09-16',
  domainPackVersion: 'supplements@3.4.0',
  categories: [
  { name: 'Probiotics', skus: 14, hero: 'Jarro-Dophilus EPS, Fem-Dophilus', priority: 'Tier 1' },
  { name: 'Cognition', skus: 6, hero: 'Citicoline (Cognizin), Neuro Optimizer, MagMind', priority: 'Tier 1' },
  { name: 'Magnesium', skus: 4, hero: 'MagMind, Magnesium Optimizer', priority: 'Tier 1' },
  { name: 'Vitamins & minerals', skus: 31, hero: 'Vitamin D3 + K2, Methyl B-12', priority: 'Tier 2' },
  { name: 'Sports & recovery', skus: 5, hero: 'Creatine Monohydrate Powder', priority: 'Tier 3' }],

  assets: [
  'Brand style guide (PDF, v4) — uploaded Aug 2026',
  'Product claim substantiation index (XLSX) — uploaded Jul 2026',
  'Retail partner co-op calendar (CSV) — uploaded Sep 2026'],

  audiences: [
  { name: 'Women 40+, healthy aging', priority: 'Primary', note: 'Cognition, sleep, bone, energy. Highest LTV segment.' },
  { name: 'Practitioner-referred buyers', priority: 'Primary', note: 'Expect mechanism-level explanation and citations.' },
  { name: 'Gut-health first-timers', priority: 'Secondary', note: 'Entry via probiotics; high education need.' },
  { name: 'Performance / recovery', priority: 'Tertiary', note: 'Small share of revenue; do not over-index.' }],

  competitors: [
  { name: 'Thorne', posture: 'Practitioner authority, premium price' },
  { name: 'NOW Foods', posture: 'Price and breadth' },
  { name: 'Life Extension', posture: 'Research-forward, long-form education' },
  { name: 'Pure Encapsulations', posture: 'Hypoallergenic, clinician channel' }],

  voice: {
    tone: 'Plain, precise, mechanism-aware. Confident without hype.',
    do: [
    'Name the mechanism before the benefit',
    'Cite the study design, not just the conclusion',
    'Use "may support" framing for structure/function statements'],

    dont: [
    'No disease or treatment language, ever',
    'No superlatives ("best", "most powerful", "clinically proven")',
    'No pharmaceutical comparisons (e.g. GLP-1 analogies)'],

    reading: 'Grade 9–11 for consumer outputs; unrestricted for practitioner outputs'
  },
  compliance: [
  { rule: 'Structure/function claims only', detail: 'Every consumer claim maps to an entry in the substantiation index.' },
  { rule: 'FDA disclaimer required', detail: 'Any structure/function claim triggers the standard DSHEA disclaimer block.' },
  { rule: 'No comparative efficacy', detail: 'Cross-brand and cross-SKU efficacy comparisons are prohibited.' },
  { rule: 'Safety statements escalate', detail: 'Interaction or adverse-event language routes to scientific/legal review before draft.' },
  { rule: 'Research extrapolation flagged', detail: 'Animal, in-vitro, or off-population findings cannot carry a human benefit claim.' }],

  reviewers: [
  { stage: 'Editorial fit', person: 'Abubakar (operator)', sla: 'same day' },
  { stage: 'Evidence check', person: 'Abubakar (operator)', sla: 'same day' },
  { stage: 'Scientific / legal claims', person: 'M. Reyes (external)', sla: '3 business days' },
  { stage: 'Brand voice', person: 'Jarrow brand team', sla: '2 business days' },
  { stage: 'Merchandising / availability', person: 'Jarrow ecommerce', sla: '2 business days' },
  { stage: 'Final proof', person: 'Abubakar (operator)', sla: 'same day' }],

  cadence: [
  { output: 'Trend intelligence brief', cadence: 'Weekly · Monday', channel: 'Portal + Markdown bundle' },
  { output: 'Monthly content queue', cadence: 'Monthly · first business day', channel: 'Portal + CSV appendix' },
  { output: 'Content brief / draft', cadence: 'Up to 3 per week', channel: 'Portal + DOCX' },
  { output: 'Product / opportunity memo', cadence: 'Monthly or on demand', channel: 'Portal + PDF' },
  { output: 'Research alert', cadence: 'As triggered', channel: 'Portal + email notification' },
  { output: 'Visibility benchmark', cadence: 'Monthly', channel: 'Portal + PDF' }]

};