"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/base/badges/badges";
import { PageLoading, PageError } from "@/components/application/page-states/page-states";
import { ProfileHeader } from "@/components/profile/profile-header";
import { CareerTimeline } from "@/components/profile/career-timeline";
import { TeamLink } from "@/components/profile/entity-link";
import { useStaffIdentity, useStaffCareer } from "@/hooks/use-staff-profile";

export default function StaffProfilePage() {
    return (
        <Suspense fallback={<PageLoading label="Chargement..." />}>
            <StaffProfileContent />
        </Suspense>
    );
}

const roleLabels: Record<string, string> = {
    principal: "Team Principal",
    technical_director: "Directeur Technique",
    chief_engineer: "Ingenieur en Chef",
};

function StaffProfileContent() {
    const params = useParams<{ personId: string }>();
    const personId = params.personId;

    const { data: person, isLoading, error } = useStaffIdentity(personId);
    const { data: career } = useStaffCareer(personId);

    if (isLoading) return <PageLoading label="Chargement..." />;

    if (error || !person) {
        return (
            <PageError
                title="Profil introuvable"
                backHref="/"
                backLabel="Retour"
            />
        );
    }

    const fullName = `${person.first_name ?? ""} ${person.last_name ?? ""}`.trim();
    const currentRole = career?.[0];

    // Build timeline entries
    const timelineEntries = (career ?? []).map((c) => ({
        year: c.year ?? 0,
        role: roleLabels[c.staff_role ?? ""] ?? c.staff_role ?? "",
        teamName: c.team_name ?? "—",
        teamColor: c.team_color,
        detail: c.team_championship_position
            ? `Equipe P${c.team_championship_position} - ${c.team_season_points ?? 0} pts`
            : undefined,
        teamIdentityId: c.team_identity_id,
    }));

    return (
        <div>
            <ProfileHeader
                breadcrumbs={[
                    { label: "Encyclopedie" },
                    { label: "Staff" },
                    { label: fullName },
                ]}
                title={fullName}
                subtitle={currentRole
                    ? `${roleLabels[currentRole.staff_role ?? ""] ?? currentRole.staff_role} chez ${currentRole.team_name}`
                    : roleLabels[person.role ?? ""] ?? person.role ?? ""
                }
                badges={
                    person.role && (
                        <Badge size="sm" color="brand" type="pill-color">
                            {roleLabels[person.role] ?? person.role}
                        </Badge>
                    )
                }
            />

            <div className="space-y-8">
                {/* Current position */}
                {currentRole && (
                    <div>
                        <h2 className="mb-3 text-sm font-semibold text-secondary">
                            Poste actuel ({currentRole.year})
                        </h2>
                        <div className="rounded-xl border border-secondary bg-primary p-4">
                            <div className="flex items-center gap-3">
                                {currentRole.team_color && (
                                    <span
                                        className="size-3 rounded-full"
                                        style={{ backgroundColor: currentRole.team_color }}
                                    />
                                )}
                                {currentRole.team_identity_id ? (
                                    <TeamLink teamIdentityId={currentRole.team_identity_id}>
                                        {currentRole.team_name}
                                    </TeamLink>
                                ) : (
                                    <span className="text-sm font-medium text-primary">
                                        {currentRole.team_name}
                                    </span>
                                )}
                            </div>
                            {currentRole.team_championship_position && (
                                <p className="mt-1 text-xs text-tertiary">
                                    Classement constructeurs : P{currentRole.team_championship_position}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Career timeline */}
                <CareerTimeline
                    title="Parcours"
                    entries={timelineEntries}
                />
            </div>
        </div>
    );
}
