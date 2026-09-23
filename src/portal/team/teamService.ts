import { OrgRole } from '../../types';
import { revokeAccount } from '../auth/authService';

/**
 * TENANT PLANE — mock team-management service.
 *
 * Same discipline as `auth/authService.ts`: no fetch, no backend, no
 * storage. Everything lives in this module's memory and resets on reload.
 * Page code under `pages/Team.tsx` and `pages/TeamMemberDetail.tsx` talks
 * only to this interface.
 */

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: OrgRole;
  status: 'active' | 'invited';
  lastLogin: string | null;
  /** True when this row is the caller of the query — computed per call, never stored. */
  isSelf: boolean;
}

/** The list view's shape plus everything only the detail view needs. */
export interface TeamMemberDetail extends TeamMember {
  addedAt: string;
  invitedBy: string;
  /** Empty for an invited member — there is nothing to sign in to yet. */
  signIns: { at: string }[];
}

export type TeamServiceErrorCode = 'last_admin' | 'self_removal' | 'not_found' | 'already_member';

export class TeamServiceError extends Error {
  code: TeamServiceErrorCode;
  constructor(code: TeamServiceErrorCode, message: string) {
    super(message);
    this.name = 'TeamServiceError';
    this.code = code;
  }
}

export interface TeamService {
  listMembers(input: { orgId: string; currentUserEmail: string }): Promise<TeamMember[]>;
  getMember(input: { orgId: string; memberId: string; currentUserEmail: string }): Promise<TeamMemberDetail>;
  updateMember(input: { orgId: string; memberId: string; name: string }): Promise<TeamMember>;
  changeRole(input: { orgId: string; memberId: string; role: OrgRole }): Promise<TeamMember>;
  removeMember(input: { orgId: string; memberId: string; currentUserEmail: string }): Promise<void>;
  inviteMember(input: { orgId: string; email: string; role: OrgRole; invitedByName: string }): Promise<TeamMember>;
  resendInvite(input: { orgId: string; memberId: string }): Promise<void>;
  cancelInvite(input: { orgId: string; memberId: string }): Promise<void>;
}

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

interface StoredMember {
  id: string;
  orgId: string;
  name: string;
  email: string;
  role: OrgRole;
  status: 'active' | 'invited';
  lastLogin: string | null;
  addedAt: string;
  invitedBy: string;
  signIns: { at: string }[];
}

let members: StoredMember[] = [
  // org-jarrow: emails match the demo login accounts in `auth/authService.ts`.
  {
    id: 'OU-1',
    orgId: 'org-jarrow',
    name: 'Dana Whitfield',
    email: 'dana@jarrow.example',
    role: 'Org Admin',
    status: 'active',
    lastLogin: 'Today 09:02',
    addedAt: 'Aug 12, 2026',
    invitedBy: 'Pure Play (onboarding)',
    signIns: [{ at: 'Today 09:02' }, { at: 'Sep 20, 2026 08:41' }, { at: 'Sep 18, 2026 14:12' }]
  },
  {
    id: 'OU-2',
    orgId: 'org-jarrow',
    name: 'Priya Raman',
    email: 'priya@jarrow.example',
    role: 'Org Viewer',
    status: 'active',
    lastLogin: 'Yesterday 15:41',
    addedAt: 'Aug 20, 2026',
    invitedBy: 'Dana Whitfield',
    signIns: [{ at: 'Yesterday 15:41' }, { at: 'Sep 15, 2026 10:03' }]
  },
  {
    id: 'OU-3',
    orgId: 'org-jarrow',
    name: 'Marcus Bell',
    email: 'm.bell@jarrow.example',
    role: 'Org Viewer',
    status: 'active',
    lastLogin: 'Sep 16 11:20',
    addedAt: 'Sep 02, 2026',
    invitedBy: 'Dana Whitfield',
    signIns: [{ at: 'Sep 16, 2026 11:20' }, { at: 'Sep 09, 2026 09:47' }]
  },
  {
    id: 'OU-4',
    orgId: 'org-jarrow',
    name: 'Sofia Lindqvist',
    email: 's.lindqvist@jarrow.example',
    role: 'Org Viewer',
    status: 'invited',
    lastLogin: null,
    addedAt: 'Sep 18, 2026',
    invitedBy: 'Dana Whitfield',
    signIns: []
  },
  // org-newco: the empty-state fixture from the sign-up flow — Jordan is the
  // sole member, which is what the "only the admin exists" state shows, and
  // what proves a member id from another organisation resolves to nothing.
  {
    id: 'OU-5',
    orgId: 'org-newco',
    name: 'Jordan Lee',
    email: 'jordan@newco.example',
    role: 'Org Admin',
    status: 'active',
    lastLogin: 'Today 09:02',
    addedAt: 'Sep 22, 2026',
    invitedBy: 'Pure Play (onboarding)',
    signIns: [{ at: 'Today 09:02' }]
  }
];

let nextId = members.length + 1;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function activeAdminCount(orgId: string): number {
  return members.filter((m) => m.orgId === orgId && m.role === 'Org Admin' && m.status === 'active').length;
}

function findMember(orgId: string, memberId: string): StoredMember | undefined {
  return members.find((m) => m.orgId === orgId && m.id === memberId);
}

function toTeamMember(member: StoredMember, currentUserEmail: string): TeamMember {
  return {
    id: member.id,
    name: member.name,
    email: member.email,
    role: member.role,
    status: member.status,
    lastLogin: member.lastLogin,
    isSelf: member.email === normalizeEmail(currentUserEmail)
  };
}

function toTeamMemberDetail(member: StoredMember, currentUserEmail: string): TeamMemberDetail {
  return {
    ...toTeamMember(member, currentUserEmail),
    addedAt: member.addedAt,
    invitedBy: member.invitedBy,
    signIns: member.signIns
  };
}

async function listMembers(input: { orgId: string; currentUserEmail: string }): Promise<TeamMember[]> {
  await delay(undefined);
  return members.filter((m) => m.orgId === input.orgId).map((m) => toTeamMember(m, input.currentUserEmail));
}

async function getMember(input: { orgId: string; memberId: string; currentUserEmail: string }): Promise<TeamMemberDetail> {
  await delay(undefined);
  const member = findMember(input.orgId, input.memberId);
  if (!member) {
    throw new TeamServiceError('not_found', "This person isn't on your team.");
  }
  return toTeamMemberDetail(member, input.currentUserEmail);
}

async function updateMember(input: { orgId: string; memberId: string; name: string }): Promise<TeamMember> {
  await delay(undefined);
  const member = findMember(input.orgId, input.memberId);
  if (!member) {
    throw new TeamServiceError('not_found', "This person isn't on your team.");
  }
  member.name = input.name.trim();
  return toTeamMember(member, '');
}

async function inviteMember(input: { orgId: string; email: string; role: OrgRole; invitedByName: string }): Promise<TeamMember> {
  await delay(undefined);
  const email = normalizeEmail(input.email);
  if (members.some((m) => m.orgId === input.orgId && m.email === email)) {
    throw new TeamServiceError('already_member', 'That person is already on this team.');
  }
  const created: StoredMember = {
    id: `OU-${nextId++}`,
    orgId: input.orgId,
    name: email.split('@')[0],
    email,
    role: input.role,
    status: 'invited',
    lastLogin: null,
    addedAt: 'Today',
    invitedBy: input.invitedByName,
    signIns: []
  };
  members = [...members, created];
  return toTeamMember(created, '');
}

async function changeRole(input: { orgId: string; memberId: string; role: OrgRole }): Promise<TeamMember> {
  await delay(undefined);
  const member = findMember(input.orgId, input.memberId);
  if (!member) {
    throw new TeamServiceError('not_found', 'That person is no longer on the team.');
  }
  if (member.role === 'Org Admin' && input.role !== 'Org Admin' && activeAdminCount(input.orgId) <= 1) {
    throw new TeamServiceError('last_admin', 'An organisation needs at least one Org Admin.');
  }
  member.role = input.role;
  return toTeamMember(member, '');
}

async function removeMember(input: { orgId: string; memberId: string; currentUserEmail: string }): Promise<void> {
  await delay(undefined);
  const member = findMember(input.orgId, input.memberId);
  if (!member) {
    throw new TeamServiceError('not_found', 'That person is no longer on the team.');
  }
  if (member.email === normalizeEmail(input.currentUserEmail)) {
    throw new TeamServiceError('self_removal', 'You cannot remove your own access.');
  }
  if (member.role === 'Org Admin' && member.status === 'active' && activeAdminCount(input.orgId) <= 1) {
    throw new TeamServiceError('last_admin', 'An organisation needs at least one Org Admin.');
  }
  members = members.filter((m) => m.id !== member.id);
  // A removed person must not be able to sign back in with the mock auth
  // service — harmless if this email never had a login account at all.
  revokeAccount(member.email);
}

async function resendInvite(input: { orgId: string; memberId: string }): Promise<void> {
  await delay(undefined);
  const member = findMember(input.orgId, input.memberId);
  if (!member || member.status !== 'invited') {
    throw new TeamServiceError('not_found', 'That invitation is no longer pending.');
  }
}

async function cancelInvite(input: { orgId: string; memberId: string }): Promise<void> {
  await delay(undefined);
  const member = findMember(input.orgId, input.memberId);
  if (!member || member.status !== 'invited') {
    throw new TeamServiceError('not_found', 'That invitation is no longer pending.');
  }
  members = members.filter((m) => m.id !== member.id);
}

/**
 * Synchronous, and not part of the interface above — same reasoning as
 * `authService.getSessionSnapshot()`. Seeds the first render with real data
 * instead of a placeholder "loading" frame; the async methods above are what
 * a retry after a failed load actually calls, and are where the loading
 * state a real fetch would show is genuinely exercised.
 */
function listMembersSnapshot(input: { orgId: string; currentUserEmail: string }): TeamMember[] {
  return members.filter((m) => m.orgId === input.orgId).map((m) => toTeamMember(m, input.currentUserEmail));
}

/** Same reasoning, for the detail view. `null` — not a throw — since "not found"
 * is a normal, first-paint-relevant outcome here (an unknown or cross-org id),
 * not an exceptional one. */
function getMemberSnapshot(input: { orgId: string; memberId: string; currentUserEmail: string }): TeamMemberDetail | null {
  const member = findMember(input.orgId, input.memberId);
  return member ? toTeamMemberDetail(member, input.currentUserEmail) : null;
}

export const teamService: TeamService & {
  listMembersSnapshot: typeof listMembersSnapshot;
  getMemberSnapshot: typeof getMemberSnapshot;
} = {
  listMembers,
  getMember,
  updateMember,
  changeRole,
  removeMember,
  inviteMember,
  resendInvite,
  cancelInvite,
  listMembersSnapshot,
  getMemberSnapshot
};
