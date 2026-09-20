import { Paper } from '../types';

export const papers: Paper[] = [
{
  id: 'RES-8812',
  title:
  'Creatine monohydrate supplementation and working memory under partial sleep restriction: a randomized crossover trial',
  publication: 'Journal of Nutritional Neuroscience · Sep 2026',
  design: 'RCT (crossover)',
  population: 'n = 42 adults 35–55 · 6 weeks',
  identifiers: 'PMID 40218871 · PMCID PMC11928340',
  relevance: 88,
  intervention: '5 g/day creatine monohydrate vs. maltodextrin placebo, no loading phase',
  portfolio: 'Creatine Monohydrate Powder · Neuro Optimizer (adjacent)',
  routed: false,
  lens: [
  {
    dimension: 'Design',
    positive: 'Crossover design controls for between-subject variance; placebo matched on appearance and taste.',
    concern: 'Six weeks is short for a cognition endpoint, and washout is only 10 days.'
  },
  {
    dimension: 'Measures',
    positive: 'Pre-registered primary endpoint (n-back working memory) with blinded scoring.',
    concern: 'Four secondary cognitive endpoints reported without multiplicity correction.'
  },
  {
    dimension: 'Population + context',
    positive: 'Age band overlaps the audience currently driving the trend conversation.',
    concern: 'Effect observed under induced sleep restriction — may not transfer to rested buyers.'
  }]

},
{
  id: 'RES-8807',
  title:
  'Magnesium L-threonate versus magnesium glycinate on sleep-onset latency: an open-label comparative pilot',
  publication: 'Sleep Medicine Reports · Aug 2026',
  design: 'Open-label pilot',
  population: 'n = 28 adults 28–64 · 4 weeks',
  identifiers: 'PMID 40197553',
  relevance: 74,
  intervention: '2 g/day L-threonate vs. 400 mg/day glycinate, self-reported diary primary endpoint',
  portfolio: 'MagMind · Magnesium Optimizer',
  routed: false,
  lens: [
  {
    dimension: 'Design',
    positive: 'First direct head-to-head between the two forms buyers are comparing.',
    concern: 'Open-label with no placebo arm — expectancy effects are uncontrolled.'
  },
  {
    dimension: 'Measures',
    positive: 'Diary instrument is validated and consistently applied across arms.',
    concern: 'No actigraphy or PSG; primary endpoint is entirely self-reported.'
  },
  {
    dimension: 'Population + context',
    positive: 'Sample matches the general-wellness sleep buyer rather than a clinical insomnia cohort.',
    concern: 'n = 28 cannot support a "better form" claim in marketing language.'
  }]

},
{
  id: 'RES-8799',
  title: 'Postbiotic heat-killed Lactobacillus preparations and metabolic markers: systematic review',
  publication: 'Nutrients · Aug 2026',
  design: 'Systematic review',
  population: '19 trials · n = 1,842 pooled',
  identifiers: 'PMID 40188214 · PMCID PMC11902117',
  relevance: 66,
  intervention: 'Heterogeneous postbiotic preparations, 4–24 week durations',
  portfolio: 'Jarro-Dophilus family',
  routed: true,
  lens: [
  {
    dimension: 'Design',
    positive: 'Pre-registered review protocol with dual independent extraction.',
    concern: 'Included trials define "postbiotic" inconsistently, limiting pooled interpretation.'
  },
  {
    dimension: 'Measures',
    positive: 'Objective metabolic markers rather than symptom self-report.',
    concern: 'Substantial heterogeneity (I² = 71%) on the primary pooled outcome.'
  },
  {
    dimension: 'Population + context',
    positive: 'Broad adult samples across multiple regions.',
    concern: '14 of 19 trials are non-US populations with different baseline diets.'
  }]

},
{
  id: 'RES-8791',
  title: 'Berberine and hepatic safety signals in supplement users: retrospective cohort',
  publication: 'Clinical Toxicology · Jul 2026',
  design: 'Observational (retrospective)',
  population: 'n = 3,104 records · 24 months',
  identifiers: 'PMID 40172908',
  relevance: 81,
  intervention: 'Self-reported berberine use, 500–1500 mg/day',
  portfolio: 'No Jarrow SKU — defensive/safety relevance only',
  routed: false,
  lens: [
  {
    dimension: 'Design',
    positive: 'Large record set with medication co-use captured.',
    concern: 'Retrospective and self-reported exposure; no dose verification.'
  },
  {
    dimension: 'Measures',
    positive: 'Laboratory liver-enzyme values rather than reported symptoms.',
    concern: 'Confounded by concurrent medication use in a substantial subset.'
  },
  {
    dimension: 'Population + context',
    positive: 'Directly relevant to the current safety-backlash conversation.',
    concern: 'Cannot establish causation — must not be presented as a safety verdict.'
  }]

}];