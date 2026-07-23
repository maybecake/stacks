import React, { useEffect, useState, useCallback } from "react";
import { createConnectTransport } from "@connectrpc/connect-web";
import { createClient } from "@connectrpc/connect";
import { create } from "@bufbuild/protobuf";
import {
  InviteService,
  ListInviteesRequestSchema,
  CreatePersonRequestSchema,
  AddInviteeRequestSchema,
  CreateHouseholdRequestSchema,
  AddHouseholdMemberRequestSchema,
  RemoveHouseholdMemberRequestSchema,
  PersonType,
  MemberRole,
} from "../../gen/invite/invite_pb.js";
import type { InviteeWithStatus, Household } from "../../gen/invite/invite_pb.js";
import { makeAuthInterceptor } from "../../lib/authInterceptor.js";
import { useAuth } from "@clerk/react";
import { HouseholdCard } from "./HouseholdCard.js";
import { UnassignedSection } from "./UnassignedSection.js";
import { PersonCreationForm } from "./PersonCreationForm.js";

interface HouseholdGuestListProps {
  eventId: string;
}

function makeClient(getToken: () => Promise<string | null>) {
  const transport = createConnectTransport({
    baseUrl: "",
    interceptors: [makeAuthInterceptor(getToken)],
  });
  return createClient(InviteService, transport);
}

export const HouseholdGuestList: React.FC<HouseholdGuestListProps> = ({ eventId }) => {
  const { getToken } = useAuth();
  const [invitees, setInvitees] = useState<InviteeWithStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mutating, setMutating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const client = makeClient(getToken);
      const res = await client.listInvitees(create(ListInviteesRequestSchema, { eventId }));
      setInvitees(res.invitees);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load guests");
    } finally {
      setLoading(false);
    }
  }, [eventId, getToken]);

  useEffect(() => {
    load();
  }, [load]);

  // Derive grouped data from the flat invitees list.
  const householdMap = new Map<string, { household: Household; members: InviteeWithStatus[] }>();
  const unassigned: InviteeWithStatus[] = [];
  for (const iws of invitees) {
    if (iws.household && iws.invitee?.householdId) {
      const id = iws.invitee.householdId;
      if (!householdMap.has(id)) {
        householdMap.set(id, { household: iws.household, members: [] });
      }
      householdMap.get(id)!.members.push(iws);
    } else {
      unassigned.push(iws);
    }
  }
  const householdGroups = Array.from(householdMap.values()).sort((a, b) =>
    (a.household.name ?? "").localeCompare(b.household.name ?? ""),
  );
  const allHouseholds: Household[] = householdGroups.map((g) => g.household);

  const handleAddGuest = async (data: { name: string; type: PersonType }) => {
    const client = makeClient(getToken);
    const person = await client.createPerson(
      create(CreatePersonRequestSchema, { name: data.name, type: data.type }),
    );
    await client.addInvitee(create(AddInviteeRequestSchema, { eventId, personId: person.id }));
    await load();
  };

  const handleAssign = async (
    personId: string,
    householdId: string | null,
    newHouseholdName?: string,
  ) => {
    setMutating(true);
    try {
      const client = makeClient(getToken);
      let targetHouseholdId = householdId;
      if (!targetHouseholdId && newHouseholdName) {
        const hh = await client.createHousehold(
          create(CreateHouseholdRequestSchema, { name: newHouseholdName }),
        );
        targetHouseholdId = hh.id;
      }
      if (targetHouseholdId) {
        await client.addHouseholdMember(
          create(AddHouseholdMemberRequestSchema, {
            householdId: targetHouseholdId,
            personId,
            role: MemberRole.CHILD,
          }),
        );
      }
    } finally {
      setMutating(false);
      await load();
    }
  };

  const handleReassign = async (
    currentHouseholdId: string,
    personId: string,
    targetHouseholdId: string | null,
    newHouseholdName?: string,
  ) => {
    setMutating(true);
    try {
      const client = makeClient(getToken);
      await client.removeHouseholdMember(
        create(RemoveHouseholdMemberRequestSchema, { householdId: currentHouseholdId, personId }),
      );
      let finalHouseholdId = targetHouseholdId;
      if (!finalHouseholdId && newHouseholdName) {
        const hh = await client.createHousehold(
          create(CreateHouseholdRequestSchema, { name: newHouseholdName }),
        );
        finalHouseholdId = hh.id;
      }
      if (finalHouseholdId) {
        await client.addHouseholdMember(
          create(AddHouseholdMemberRequestSchema, {
            householdId: finalHouseholdId,
            personId,
            role: MemberRole.CHILD,
          }),
        );
      }
    } finally {
      setMutating(false);
      await load();
    }
  };

  if (loading && invitees.length === 0) {
    return <p className="invite-manager__status">Loading guests…</p>;
  }

  return (
    <div className="household-guest-list">
      {error && <p className="invite-manager__error">{error}</p>}

      {invitees.length === 0 && !loading && (
        <p className="invite-manager__empty">No guests added yet.</p>
      )}

      {householdGroups.map(({ household, members }) => (
        <HouseholdCard
          key={household.id}
          household={household}
          members={members}
          allHouseholds={allHouseholds}
          onReassign={(personId, targetId, newName) =>
            handleReassign(household.id, personId, targetId, newName)
          }
          disabled={mutating}
        />
      ))}

      <UnassignedSection
        persons={unassigned}
        allHouseholds={allHouseholds}
        onAssign={(personId, householdId, newName) => handleAssign(personId, householdId, newName)}
        disabled={mutating}
      />

      <PersonCreationForm onSubmit={handleAddGuest} disabled={mutating} />
    </div>
  );
};
