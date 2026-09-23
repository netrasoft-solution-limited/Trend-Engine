import { PUBLICATION_TYPES, typeSlugToLabel } from '../../data/publications';

/**
 * TENANT PLANE — mock notification-settings service.
 *
 * Same discipline as `auth/authService.ts`, `team/teamService.ts` and
 * `feedback/feedbackService.ts`: no fetch, no backend, no storage. Everything
 * lives in this module's memory and resets on reload. This module does not
 * send anything — it only stores what a person has asked to be sent, the way
 * a real settings endpoint would. Page code talks only to this interface.
 */

export type NotificationFrequency = 'immediately' | 'daily_digest' | 'weekly_digest';

export const DIGEST_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
export type DigestDay = (typeof DIGEST_DAYS)[number];

/** Shaped like a future API response, so a real backend can replace this file
 * without the rest of the portal changing shape. */
export interface NotificationSettings {
  userId: string;
  orgId: string;
  channels: { email: boolean; inApp: boolean };
  frequency: NotificationFrequency;
  /** Only meaningful when `frequency === 'weekly_digest'`. */
  digestDay: DigestDay | null;
  /** Only meaningful when `frequency !== 'immediately'`. 24-hour "HH:mm". */
  digestTime: string | null;
  /** `PUBLICATION_TYPES` slugs — which output types trigger a notification at all. */
  publicationTypes: string[];
  /** ISO date ("YYYY-MM-DD"), or null for not paused. */
  pausedUntil: string | null;
  updatedAt: string;
}

export type NotificationSettingsErrorCode = 'last_channel';

export class NotificationSettingsError extends Error {
  code: NotificationSettingsErrorCode;
  constructor(code: NotificationSettingsErrorCode, message: string) {
    super(message);
    this.name = 'NotificationSettingsError';
    this.code = code;
  }
}

/** Same explicit-scoping discipline as `teamService`/`feedbackService` — the
 * service is never trusted to know "who's asking" on its own. */
export interface SettingsScope {
  orgId: string;
  userId: string;
}

export interface NotificationSettingsService {
  getSettings(scope: SettingsScope): Promise<NotificationSettings>;
  updateSettings(settings: NotificationSettings, scope: SettingsScope): Promise<NotificationSettings>;
  resetToDefaults(scope: SettingsScope): Promise<NotificationSettings>;
}

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function timestamp(): string {
  return `Today ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

function defaultsFor(scope: SettingsScope): NotificationSettings {
  return {
    userId: scope.userId,
    orgId: scope.orgId,
    channels: { email: true, inApp: true },
    frequency: 'immediately',
    digestDay: null,
    digestTime: null,
    publicationTypes: PUBLICATION_TYPES.map((t) => t.slug),
    pausedUntil: null,
    updatedAt: timestamp()
  };
}

function scopeKey(scope: SettingsScope): string {
  return `${scope.orgId}:${scope.userId}`;
}

// Seeded for two of the three demo accounts, deliberately different from each
// other and from the defaults, so "each person has their own settings" is
// something a reviewer can actually see. Jordan (org-newco) is left
// unseeded — `getSettings` lazily creates defaults for anyone not here yet,
// the same as a brand-new person would get on a real backend.
const store = new Map<string, NotificationSettings>([
  [
    'org-jarrow:ou-1',
    {
      userId: 'ou-1',
      orgId: 'org-jarrow',
      channels: { email: true, inApp: true },
      frequency: 'weekly_digest',
      digestDay: 'Monday',
      digestTime: '08:00',
      publicationTypes: PUBLICATION_TYPES.map((t) => t.slug),
      pausedUntil: null,
      updatedAt: 'Sep 16, 2026'
    }
  ],
  [
    'org-jarrow:ou-2',
    {
      userId: 'ou-2',
      orgId: 'org-jarrow',
      channels: { email: true, inApp: false },
      frequency: 'immediately',
      digestDay: null,
      digestTime: null,
      publicationTypes: ['research_alert', 'trend_brief'],
      pausedUntil: null,
      updatedAt: 'Sep 10, 2026'
    }
  ]
]);

// Tracks who has explicitly saved at least once — distinct from `store`
// merely having an entry, since `getSettings`/`getSettingsSnapshot` lazily
// insert a default record on first read. Pre-populated for the two seeded
// accounts above, since their settings are deliberately non-default (someone
// clearly configured them); Jordan (org-newco) starts unsaved, which is what
// lets the onboarding checklist's "choose how you're notified" item work.
const savedScopes = new Set<string>(['org-jarrow:ou-1', 'org-jarrow:ou-2']);

function validate(settings: NotificationSettings): void {
  if (!settings.channels.email && !settings.channels.inApp) {
    throw new NotificationSettingsError('last_channel', 'At least one channel — email or in-app — needs to stay on.');
  }
}

async function getSettings(scope: SettingsScope): Promise<NotificationSettings> {
  await delay(undefined);
  const existing = store.get(scopeKey(scope));
  if (existing) return { ...existing };
  const created = defaultsFor(scope);
  store.set(scopeKey(scope), created);
  return { ...created };
}

async function updateSettings(settings: NotificationSettings, scope: SettingsScope): Promise<NotificationSettings> {
  await delay(undefined);
  validate(settings);
  // The scope is ground truth for identity, never what the caller's draft
  // object claims — the same reasoning `teamService` applies to `orgId`.
  const saved: NotificationSettings = { ...settings, userId: scope.userId, orgId: scope.orgId, updatedAt: timestamp() };
  store.set(scopeKey(scope), saved);
  savedScopes.add(scopeKey(scope));
  return { ...saved };
}

async function resetToDefaults(scope: SettingsScope): Promise<NotificationSettings> {
  await delay(undefined);
  const created = defaultsFor(scope);
  store.set(scopeKey(scope), created);
  savedScopes.add(scopeKey(scope));
  return { ...created };
}

/** Not part of the interface above — used by `onboarding/onboardingService.ts`
 * to derive the "choose how you're notified" checklist item without keeping
 * its own separate "completed" flag. */
export function hasSavedSettings(scope: SettingsScope): boolean {
  return savedScopes.has(scopeKey(scope));
}

/** Synchronous, and not part of the interface above — same reasoning as
 * `teamService.listMembersSnapshot()`. Seeds the first render with real data
 * instead of a placeholder "loading" frame. */
function getSettingsSnapshot(scope: SettingsScope): NotificationSettings {
  const existing = store.get(scopeKey(scope));
  if (existing) return { ...existing };
  const created = defaultsFor(scope);
  store.set(scopeKey(scope), created);
  return { ...created };
}

export const notificationSettingsService: NotificationSettingsService & { getSettingsSnapshot: typeof getSettingsSnapshot } = {
  getSettings,
  updateSettings,
  resetToDefaults,
  getSettingsSnapshot
};

/** "You'll get a weekly email digest on Mondays at 08:00 covering research
 * alerts and trend briefs." — a plain-English restatement of the settings
 * above, so no one has to translate the form back into what it means. */
export function describeSettings(settings: NotificationSettings): string {
  const channelWords =
  settings.channels.email && settings.channels.inApp ?
  'email and in-app' :
  settings.channels.email ?
  'email' :
  'in-app';

  const labels = settings.publicationTypes.
  map((slug) => typeSlugToLabel(slug)).
  filter((label): label is string => Boolean(label));

  const coverage =
  labels.length === 0 ?
  null :
  labels.length === PUBLICATION_TYPES.length ?
  'all output types' :
  joinWithAnd(labels.map((label) => label.toLowerCase()));

  let sentence: string;
  if (settings.frequency === 'immediately') {
    sentence = `You’ll get ${channelWords} notifications immediately`;
  } else if (settings.frequency === 'daily_digest') {
    sentence = `You’ll get a daily ${channelWords} digest${settings.digestTime ? ` at ${settings.digestTime}` : ''}`;
  } else {
    sentence = `You’ll get a weekly ${channelWords} digest${settings.digestDay ? ` on ${settings.digestDay}s` : ''}${
    settings.digestTime ? ` at ${settings.digestTime}` : ''}`;

  }

  sentence += coverage ? `, covering ${coverage}.` : '. You won’t be notified about anything until you choose at least one output type.';

  if (settings.pausedUntil) {
    sentence += ` Paused until ${settings.pausedUntil}.`;
  }

  return sentence;
}

function joinWithAnd(items: string[]): string {
  if (items.length <= 1) return items.join('');
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}
