"use client";

import React, { useState, useMemo } from "react";
import { AppShell } from "@/components/layout";
import { SectionHeading, Button, Divider } from "@/components/ui";
import {
  UserPlus,
  Search,
  ChevronDown,
  X,
  CheckCircle2,
  Mail,
  AlertTriangle,
  ShieldCheck,
  RotateCcw,
  Trash2,
  UserMinus,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = "Owner" | "Admin" | "Developer" | "Analyst";
type MemberStatus = "Active" | "Inactive";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: MemberStatus;
  lastActive: string;
  isCurrentUser?: boolean;
}

interface PendingInvite {
  id: string;
  email: string;
  role: Exclude<Role, "Owner">;
  invitedAt: string;
}

type DialogState =
  | { type: "none" }
  | { type: "invite" }
  | { type: "changeRole"; member: TeamMember }
  | { type: "deactivate"; member: TeamMember }
  | { type: "remove"; member: TeamMember };

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  Owner: "Full organization control, including team and billing management.",
  Admin: "Manage members, workspace configuration, and operational settings.",
  Developer: "Access verification APIs, sandbox, API keys, logs, and developer resources.",
  Analyst: "Review verification results, logs, reports, and analytics.",
};

const ASSIGNABLE_ROLES: Exclude<Role, "Owner">[] = ["Admin", "Developer", "Analyst"];

const INITIAL_MEMBERS: TeamMember[] = [
  {
    id: "m1",
    name: "Aarav Mehta",
    email: "aarav@acmecorp.com",
    role: "Owner",
    status: "Active",
    lastActive: "Just now",
    isCurrentUser: true,
  },
  {
    id: "m2",
    name: "Priya Shah",
    email: "priya@acmecorp.com",
    role: "Admin",
    status: "Active",
    lastActive: "Today",
  },
  {
    id: "m3",
    name: "Rohan Kulkarni",
    email: "rohan@acmecorp.com",
    role: "Developer",
    status: "Active",
    lastActive: "2 hours ago",
  },
  {
    id: "m4",
    name: "Neha Patil",
    email: "neha@acmecorp.com",
    role: "Analyst",
    status: "Active",
    lastActive: "Yesterday",
  },
];

const INITIAL_INVITES: PendingInvite[] = [
  {
    id: "inv1",
    email: "dev2@acmecorp.com",
    role: "Developer",
    invitedAt: "2 hours ago",
  },
];

// ─── Helper components ────────────────────────────────────────────────────────

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div
      className="size-8 rounded-full bg-surface-raised border border-border-default flex items-center justify-center shrink-0"
      aria-hidden="true"
    >
      <span className="font-mono text-[11px] font-bold text-text-secondary">
        {initials}
      </span>
    </div>
  );
}

function RoleBadge({ role }: { role: Role }) {
  const styles: Record<Role, string> = {
    Owner:
      "text-brand-600 bg-brand-50 border-brand-100",
    Admin:
      "text-risk-medium bg-risk-medium-bg border-risk-medium-border",
    Developer:
      "text-text-secondary bg-surface-raised border-border-default",
    Analyst:
      "text-text-secondary bg-surface-raised border-border-default",
  };
  return (
    <span
      className={`font-mono text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${styles[role]}`}
    >
      {role}
    </span>
  );
}

function StatusDot({ status }: { status: MemberStatus }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={`size-1.5 rounded-full ${
          status === "Active" ? "bg-risk-low" : "bg-text-tertiary"
        }`}
        aria-hidden="true"
      />
      <span className="text-xs text-text-secondary">{status}</span>
    </span>
  );
}

// ─── Modal wrapper ────────────────────────────────────────────────────────────

function Modal({
  title,
  description,
  onClose,
  children,
}: {
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-surface-base border border-border-default rounded-lg shadow-lg p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-text-primary">{title}</h2>
            {description && (
              <p className="text-sm text-text-secondary mt-1">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded text-text-tertiary hover:text-text-primary hover:bg-surface-subtle transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-brand-500"
          >
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── TeamPage ────────────────────────────────────────────────────────────────

export function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>(INITIAL_MEMBERS);
  const [invites, setInvites] = useState<PendingInvite[]>(INITIAL_INVITES);
  const [dialog, setDialog] = useState<DialogState>({ type: "none" });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Exclude<Role, "Owner">>("Developer");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState(false);

  // Change role state
  const [newRole, setNewRole] = useState<Exclude<Role, "Owner">>("Developer");
  const [roleLoading, setRoleLoading] = useState(false);

  // Deactivate/remove loading
  const [actionLoading, setActionLoading] = useState(false);

  const closeDialog = () => {
    setDialog({ type: "none" });
    setInviteEmail("");
    setInviteRole("Developer");
    setInviteError("");
    setInviteSuccess(false);
    setNewRole("Developer");
    setActionLoading(false);
    setRoleLoading(false);
  };

  // Filtered members
  const filteredMembers = useMemo(() => {
    const q = search.toLowerCase().trim();
    return members.filter((m) => {
      const matchSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q);
      const matchStatus =
        statusFilter === "All" || m.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [members, search, statusFilter]);

  // Summary stats
  const activeCount = members.filter((m) => m.status === "Active").length;
  const ownerCount = members.filter((m) => m.role === "Owner").length;

  // ── Invite ──
  const handleInvite = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!inviteEmail.trim()) {
      setInviteError("Email is required.");
      return;
    }
    if (!emailRegex.test(inviteEmail.trim())) {
      setInviteError("Please enter a valid work email.");
      return;
    }
    setInviteError("");
    setInviteLoading(true);
    setTimeout(() => {
      setInvites((prev) => [
        ...prev,
        {
          id: `inv${Date.now()}`,
          email: inviteEmail.trim(),
          role: inviteRole,
          invitedAt: "Just now",
        },
      ]);
      setInviteLoading(false);
      setInviteSuccess(true);
      setTimeout(closeDialog, 1500);
    }, 800);
  };

  // ── Change role ──
  const handleChangeRole = (member: TeamMember) => {
    setRoleLoading(true);
    setTimeout(() => {
      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, role: newRole } : m))
      );
      setRoleLoading(false);
      closeDialog();
    }, 700);
  };

  // ── Deactivate ──
  const handleDeactivate = (member: TeamMember) => {
    setActionLoading(true);
    setTimeout(() => {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === member.id ? { ...m, status: "Inactive" as MemberStatus } : m
        )
      );
      setActionLoading(false);
      closeDialog();
    }, 700);
  };

  // ── Reactivate ──
  const handleReactivate = (id: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "Active" as MemberStatus } : m))
    );
  };

  // ── Remove ──
  const handleRemove = (member: TeamMember) => {
    setActionLoading(true);
    setTimeout(() => {
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
      setActionLoading(false);
      closeDialog();
    }, 700);
  };

  // ── Revoke invite ──
  const revokeInvite = (id: string) => {
    setInvites((prev) => prev.filter((inv) => inv.id !== id));
  };

  // ── Resend invite ──
  const resendInvite = (id: string) => {
    setInvites((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, invitedAt: "Just now" } : inv))
    );
  };

  const openMenu = (id: string) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  return (
    <AppShell
      topBarProps={{
        title: "Team",
        environment: "sandbox",
        breadcrumbs: [
          { label: "Workspace", href: "/portal" },
          { label: "Organization", href: "/portal/team" },
          { label: "Team" },
        ],
      }}
    >
      {/* ── Page header ── */}
      <SectionHeading
        eyebrow="ORGANIZATION"
        title="Team"
        description="Manage who can access your TRINETRA workspace and control their organization-level permissions."
        action={
          <Button
            variant="primary"
            size="sm"
            leadingIcon={<UserPlus className="size-3.5" />}
            onClick={() => setDialog({ type: "invite" })}
          >
            Invite member
          </Button>
        }
      />

      <Divider />

      {/* ── Summary strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Team members", value: members.length },
          { label: "Pending invites", value: invites.length },
          { label: "Owners", value: ownerCount },
          { label: "Active access", value: activeCount },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-surface-base border border-border-default rounded-md px-4 py-3 flex flex-col gap-0.5"
          >
            <span className="font-mono text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">
              {label}
            </span>
            <span className="font-mono text-xl font-bold text-text-primary">
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* ── Members section ── */}
      <div>
        {/* Section title + search + filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">
              Team members
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              People with access to this organization&apos;s TRINETRA workspace.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search
                className="size-3.5 text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Search team members..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 pr-3 text-xs font-mono bg-surface-base border border-border-default rounded focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 w-52 text-text-primary placeholder:text-text-tertiary"
                aria-label="Search team members"
              />
            </div>

            {/* Status filter */}
            <div className="flex items-center border border-border-default rounded overflow-hidden bg-surface-base">
              {(["All", "Active", "Inactive"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setStatusFilter(f)}
                  className={[
                    "h-8 px-3 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand-500",
                    statusFilter === f
                      ? "bg-surface-raised text-text-primary"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-subtle",
                  ].join(" ")}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block bg-surface-base border border-border-default rounded-md overflow-hidden">
          <table
            className="w-full text-sm"
            role="table"
            aria-label="Team members"
          >
            <thead>
              <tr className="bg-surface-subtle border-b border-border-default">
                {["Member", "Role", "Status", "Last active", "Actions"].map(
                  (col) => (
                    <th
                      key={col}
                      scope="col"
                      className="text-left px-4 py-2.5 font-mono text-[10px] font-semibold text-text-tertiary uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-text-tertiary"
                  >
                    No members match your search.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-border-default last:border-0 hover:bg-surface-subtle transition-colors"
                  >
                    {/* Member */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={member.name} />
                        <div>
                          <p className="text-sm font-medium text-text-primary leading-tight">
                            {member.name}
                            {member.isCurrentUser && (
                              <span className="ml-1.5 font-mono text-[10px] text-text-tertiary">
                                (you)
                              </span>
                            )}
                          </p>
                          <p className="font-mono text-[11px] text-text-tertiary">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      <RoleBadge role={member.role} />
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusDot status={member.status} />
                    </td>

                    {/* Last active */}
                    <td className="px-4 py-3">
                      <span className="font-mono text-[11px] text-text-tertiary">
                        {member.lastActive}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      {member.role === "Owner" ? (
                        <span className="font-mono text-[10px] text-text-tertiary uppercase tracking-wider flex items-center gap-1">
                          <ShieldCheck className="size-3.5 text-brand-400" aria-hidden="true" />
                          Owner
                        </span>
                      ) : (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => openMenu(member.id)}
                            aria-label={`Manage ${member.name}`}
                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-text-secondary border border-border-default rounded hover:bg-surface-subtle hover:text-text-primary transition-colors focus-visible:outline-2 focus-visible:outline-brand-500"
                          >
                            Manage
                            <ChevronDown className="size-3" aria-hidden="true" />
                          </button>

                          {openMenuId === member.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenMenuId(null)}
                              />
                              <div className="absolute right-0 top-full mt-1 z-20 w-44 bg-surface-base border border-border-default rounded shadow-lg py-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewRole(
                                      member.role === "Owner"
                                        ? "Admin"
                                        : (member.role as Exclude<Role, "Owner">)
                                    );
                                    setDialog({ type: "changeRole", member });
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-surface-subtle transition-colors"
                                >
                                  Change role
                                </button>
                                {member.status === "Active" ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDialog({ type: "deactivate", member });
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-risk-medium hover:bg-surface-subtle transition-colors flex items-center gap-2"
                                  >
                                    <UserMinus className="size-3.5" aria-hidden="true" />
                                    Deactivate access
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleReactivate(member.id);
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-risk-low hover:bg-surface-subtle transition-colors flex items-center gap-2"
                                  >
                                    <RotateCcw className="size-3.5" aria-hidden="true" />
                                    Reactivate
                                  </button>
                                )}
                                <div className="h-px bg-border-default mx-2 my-1" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDialog({ type: "remove", member });
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm text-risk-critical hover:bg-surface-subtle transition-colors flex items-center gap-2"
                                >
                                  <Trash2 className="size-3.5" aria-hidden="true" />
                                  Remove member
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile stacked cards */}
        <div className="md:hidden flex flex-col gap-2">
          {filteredMembers.length === 0 ? (
            <p className="text-sm text-text-tertiary text-center py-6">
              No members match your search.
            </p>
          ) : (
            filteredMembers.map((member) => (
              <div
                key={member.id}
                className="bg-surface-base border border-border-default rounded-md p-4 flex items-start gap-3"
              >
                <Avatar name={member.name} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-text-primary leading-tight">
                        {member.name}
                        {member.isCurrentUser && (
                          <span className="ml-1 font-mono text-[10px] text-text-tertiary">
                            (you)
                          </span>
                        )}
                      </p>
                      <p className="font-mono text-[11px] text-text-tertiary mt-0.5 truncate">
                        {member.email}
                      </p>
                    </div>
                    <RoleBadge role={member.role} />
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <StatusDot status={member.status} />
                    <span className="font-mono text-[11px] text-text-tertiary">
                      {member.lastActive}
                    </span>
                  </div>
                  {member.role !== "Owner" && (
                    <div className="flex gap-2 mt-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setNewRole(member.role as Exclude<Role, "Owner">);
                          setDialog({ type: "changeRole", member });
                        }}
                        className="text-xs text-text-secondary border border-border-default rounded px-2 py-1 hover:bg-surface-subtle transition-colors"
                      >
                        Change role
                      </button>
                      {member.status === "Active" ? (
                        <button
                          type="button"
                          onClick={() => setDialog({ type: "deactivate", member })}
                          className="text-xs text-risk-medium border border-risk-medium-border rounded px-2 py-1 hover:bg-risk-medium-bg transition-colors"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleReactivate(member.id)}
                          className="text-xs text-risk-low border border-risk-low-border rounded px-2 py-1 hover:bg-risk-low-bg transition-colors"
                        >
                          Reactivate
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Pending invitations ── */}
      {invites.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-text-primary mb-3">
            Pending invitations
          </h2>
          <div className="bg-surface-base border border-border-default rounded-md overflow-hidden">
            {invites.map((inv, i) => (
              <div
                key={inv.id}
                className={[
                  "flex items-center gap-3 px-4 py-3",
                  i > 0 ? "border-t border-border-default" : "",
                ].join(" ")}
              >
                <div className="size-8 rounded-full bg-surface-raised border border-border-dashed flex items-center justify-center shrink-0">
                  <Mail className="size-3.5 text-text-tertiary" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm text-text-primary truncate">
                    {inv.email}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <RoleBadge role={inv.role} />
                    <span className="font-mono text-[11px] text-text-tertiary">
                      Invited {inv.invitedAt}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => resendInvite(inv.id)}
                    className="text-xs font-medium text-text-secondary border border-border-default rounded px-2 py-1 hover:bg-surface-subtle transition-colors focus-visible:outline-2 focus-visible:outline-brand-500"
                  >
                    Resend
                  </button>
                  <button
                    type="button"
                    onClick={() => revokeInvite(inv.id)}
                    aria-label="Revoke invitation"
                    className="p-1.5 rounded text-text-tertiary hover:text-risk-critical hover:bg-risk-critical-bg transition-colors focus-visible:outline-2 focus-visible:outline-brand-500"
                  >
                    <X className="size-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Role reference ── */}
      <div>
        <h2 className="text-sm font-semibold text-text-primary mb-3">
          Role reference
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {(Object.entries(ROLE_DESCRIPTIONS) as [Role, string][]).map(
            ([role, desc]) => (
              <div
                key={role}
                className="bg-surface-base border border-border-default rounded-md px-4 py-3 flex flex-col gap-1.5"
              >
                <RoleBadge role={role} />
                <p className="text-xs text-text-secondary leading-relaxed mt-0.5">
                  {desc}
                </p>
              </div>
            )
          )}
        </div>
      </div>

      {/* ── DIALOGS ── */}

      {/* Invite member dialog */}
      {dialog.type === "invite" && (
        <Modal
          title="Invite team member"
          description="Give a teammate access to the Acme Technologies TRINETRA workspace."
          onClose={closeDialog}
        >
          {inviteSuccess ? (
            <div className="flex items-center gap-2 py-2 text-risk-low">
              <CheckCircle2 className="size-4" aria-hidden="true" />
              <span className="text-sm font-medium">Invitation queued</span>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="invite-email"
                  className="text-[13px] font-medium text-text-primary"
                >
                  Work email
                </label>
                <input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => {
                    setInviteEmail(e.target.value);
                    setInviteError("");
                  }}
                  placeholder="name@company.com"
                  autoComplete="email"
                  className="w-full h-10 rounded-md border border-border-default bg-surface-base px-3.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
                />
                {inviteError && (
                  <p className="text-[11px] text-risk-critical flex items-center gap-1" role="alert">
                    <AlertTriangle className="size-3" aria-hidden="true" />
                    {inviteError}
                  </p>
                )}
              </div>

              {/* Role */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="invite-role"
                  className="text-[13px] font-medium text-text-primary"
                >
                  Role
                </label>
                <select
                  id="invite-role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as Exclude<Role, "Owner">)}
                  className="w-full h-10 rounded-md border border-border-default bg-surface-base px-3 text-sm text-text-primary focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 cursor-pointer"
                >
                  {ASSIGNABLE_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-text-tertiary leading-relaxed">
                  {ROLE_DESCRIPTIONS[inviteRole]}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 justify-end pt-1">
                <Button variant="secondary" size="sm" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  loading={inviteLoading}
                  onClick={handleInvite}
                >
                  Send invitation
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* Change role dialog */}
      {dialog.type === "changeRole" && (
        <Modal
          title="Change role"
          description={`${dialog.member.name} currently has the ${dialog.member.role} role.`}
          onClose={closeDialog}
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="new-role"
                className="text-[13px] font-medium text-text-primary"
              >
                New role
              </label>
              <select
                id="new-role"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as Exclude<Role, "Owner">)}
                className="w-full h-10 rounded-md border border-border-default bg-surface-base px-3 text-sm text-text-primary focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 cursor-pointer"
              >
                {ASSIGNABLE_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-text-tertiary">
                {ROLE_DESCRIPTIONS[newRole]}
              </p>
            </div>
            <div className="flex items-center gap-2 justify-end pt-1">
              <Button variant="secondary" size="sm" onClick={closeDialog}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={roleLoading}
                onClick={() => handleChangeRole(dialog.member)}
              >
                Update role
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Deactivate dialog */}
      {dialog.type === "deactivate" && (
        <Modal
          title="Deactivate member access?"
          onClose={closeDialog}
        >
          <div className="flex flex-col gap-4">
            <p className="text-sm text-text-secondary leading-relaxed">
              This will prevent{" "}
              <span className="font-medium text-text-primary">
                {dialog.member.name}
              </span>{" "}
              from accessing the organization. Their previous activity will
              remain associated with the workspace.
            </p>
            <div className="flex items-center gap-2 justify-end">
              <Button variant="secondary" size="sm" onClick={closeDialog}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                loading={actionLoading}
                onClick={() => handleDeactivate(dialog.member)}
              >
                Deactivate access
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Remove member dialog */}
      {dialog.type === "remove" && (
        <Modal
          title="Remove team member?"
          onClose={closeDialog}
        >
          <div className="flex flex-col gap-4">
            <p className="text-sm text-text-secondary leading-relaxed">
              This will remove{" "}
              <span className="font-medium text-text-primary">
                {dialog.member.name}
              </span>
              &apos;s access to the organization.
            </p>
            <div className="flex items-center gap-2 justify-end">
              <Button variant="secondary" size="sm" onClick={closeDialog}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                loading={actionLoading}
                onClick={() => handleRemove(dialog.member)}
              >
                Remove member
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Close open menus on backdrop click */}
      {openMenuId && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setOpenMenuId(null)}
        />
      )}
    </AppShell>
  );
}
