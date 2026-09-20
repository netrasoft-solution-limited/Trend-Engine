import { Invoice, Organization, OrgUser, Subscription } from '../types';

/**
 * SaaS layer (PRD §6.8, §8). Organization maps 1:1 to Client — additive,
 * not a replacement for the existing Client object.
 *
 * Tenant onboarding is operator-driven. There is no self-serve signup path
 * anywhere in this product (PRD §4.2).
 */

export const organizations: Organization[] = [
  {
    id: 'org-jarrow',
    name: 'Jarrow Formulas',
    clientId: 'jarrow',
    domainPack: 'supplements@3.4.0',
    status: 'active',
    isFixture: false,
    seats: 4,
    publishedOutputs: 3,
    lastPortalLogin: 'Today 09:02',
    note: 'Launch tenant. Weekly trend brief plus content briefs on a three-per-week cadence.'
  },
  {
    id: 'org-fixture-second',
    name: 'Second-client fixture',
    clientId: 'fixture-second',
    domainPack: 'supplements@3.4.0',
    status: 'fixture',
    isFixture: true,
    seats: 2,
    publishedOutputs: 1,
    lastPortalLogin: null,
    note:
      'PRD §2 architecture proof. Exists so CI can assert that one public signal scores differently per tenant and that private context never crosses. Not a live client.'
  },
  {
    id: 'org-fixture-domain',
    name: 'Non-supplement domain fixture',
    clientId: 'fixture-domain',
    domainPack: 'pet-nutrition@0.2.0',
    status: 'fixture',
    isFixture: true,
    seats: 1,
    publishedOutputs: 0,
    lastPortalLogin: null,
    note:
      'PRD §2 portability proof. Loads a non-supplement domain pack and completes an ingestion-to-output cycle without a core schema migration.'
  },
  {
    id: 'org-natures-way',
    name: "Nature's Way",
    clientId: 'natures-way',
    domainPack: 'supplements@3.4.0',
    status: 'onboarding',
    isFixture: false,
    seats: 0,
    publishedOutputs: 0,
    lastPortalLogin: null,
    note: 'Prospective second tenant. No signed engagement — shown here to exercise the onboarding sequence.'
  }
];

export const orgUsers: OrgUser[] = [
  { id: 'OU-1', orgId: 'org-jarrow', name: 'Dana Whitfield', email: 'd.whitfield@jarrow.example', role: 'Org Admin', invitedBy: 'abubakar', status: 'active', lastLogin: 'Today 09:02' },
  { id: 'OU-2', orgId: 'org-jarrow', name: 'Priya Raman', email: 'p.raman@jarrow.example', role: 'Org Viewer', invitedBy: 'd.whitfield', status: 'active', lastLogin: 'Yesterday 15:41' },
  { id: 'OU-3', orgId: 'org-jarrow', name: 'Marcus Bell', email: 'm.bell@jarrow.example', role: 'Org Viewer', invitedBy: 'd.whitfield', status: 'active', lastLogin: 'Sep 16 11:20' },
  { id: 'OU-4', orgId: 'org-jarrow', name: 'Sofia Lindqvist', email: 's.lindqvist@jarrow.example', role: 'Org Viewer', invitedBy: 'd.whitfield', status: 'invited', lastLogin: null }
];

export const subscriptions: Subscription[] = [
  {
    orgId: 'org-jarrow',
    plan: 'Category intelligence — single domain',
    status: 'active',
    amountMonthly: 5000,
    currentPeriod: 'Sep 1 – Sep 30, 2026',
    renewsOn: 'Oct 1, 2026',
    processorRef: 'tok_live_••••4417'
  }
];

export const invoices: Invoice[] = [
  { id: 'INV-2026-09', orgId: 'org-jarrow', period: 'September 2026', amount: 5000, status: 'open', issued: 'Sep 01, 2026', method: 'Manual — bank transfer' },
  { id: 'INV-2026-08', orgId: 'org-jarrow', period: 'August 2026', amount: 5000, status: 'paid', issued: 'Aug 01, 2026', method: 'Manual — bank transfer' },
  { id: 'INV-2026-07', orgId: 'org-jarrow', period: 'July 2026', amount: 5000, status: 'paid', issued: 'Jul 01, 2026', method: 'Manual — bank transfer' }
];

/** PRD §6.8: the operator creates the Organization, invites the Org Admin, then completes the Client Profile. */
export const onboardingSteps = [
  { step: 1, label: 'Create Organization', detail: 'Operator action. Maps 1:1 to a Client record; tenant boundary exists from this moment.', owner: 'Platform Admin' },
  { step: 2, label: 'Assign domain pack', detail: 'Select a versioned pack. No core schema change is required for a new vertical.', owner: 'Platform Admin' },
  { step: 3, label: 'Invite the initial Org Admin', detail: 'Email invitation. There is no self-serve signup path.', owner: 'Platform Admin' },
  { step: 4, label: 'Complete the Client Profile', detail: 'Categories, assets, audiences, competitors, voice, compliance rules, reviewers, cadence.', owner: 'Operator' },
  { step: 5, label: 'Record subscription status', detail: 'Status tracking only at launch. Automated collection is deliberately out of scope.', owner: 'Platform Admin' }
];

/** PRD §7.6: GDPR/CCPA applies to the SaaS layer independently of the evidence rights framework. */
export const dataProtection = [
  { item: 'Portal user accounts', retention: 'Life of engagement + 90 days', basis: 'Contract performance' },
  { item: 'Login audit logs', retention: '24 months', basis: 'Legitimate interest — security' },
  { item: 'Notification history', retention: '24 months', basis: 'Contract performance' },
  { item: 'Payment references (tokens only)', retention: '7 years', basis: 'Legal obligation — financial records' },
  { item: 'Published outputs', retention: 'Per the client agreement', basis: 'Contract performance' }
];
