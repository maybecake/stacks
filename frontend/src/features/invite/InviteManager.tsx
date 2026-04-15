import React, { useState, useEffect } from "react";
import { createConnectTransport } from "@connectrpc/connect-web";
import { createClient } from "@connectrpc/connect";
import { create } from "@bufbuild/protobuf";
import { Show, SignInButton, useAuth } from "@clerk/react";
import {
  InviteService,
  CreateEventRequestSchema,
  ListEventsRequestSchema,
  ListInviteesRequestSchema,
  CreatePersonRequestSchema,
  AddInviteeRequestSchema,
  PersonType,
} from "../../gen/invite/invite_pb.js";
import type { Event, InviteeWithStatus } from "../../gen/invite/invite_pb.js";
import { makeAuthInterceptor } from "../../lib/authInterceptor.js";
import { TwoColumnLayout } from "@layout/TwoColumnLayout";
import { Button } from "@ui/button";
import "./invite.css";

export const InviteManager: React.FC = () => {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  // Event state
  const [event, setEvent] = useState<Event | null>(null);
  const [createEventLoading, setCreateEventLoading] = useState(false);
  const [createEventError, setCreateEventError] = useState<string | null>(null);

  // Event form fields
  const [eventName, setEventName] = useState("");
  const [venue, setVenue] = useState("");
  const [description, setDescription] = useState("");
  const [datetimeLocal, setDatetimeLocal] = useState("");
  const [capacity, setCapacity] = useState(0);
  const [allowSiblings, setAllowSiblings] = useState(false);
  const [requireParentStay, setRequireParentStay] = useState(false);

  // Invitees state
  const [invitees, setInvitees] = useState<InviteeWithStatus[]>([]);
  const [inviteesLoading, setInviteesLoading] = useState(false);
  const [inviteesError, setInviteesError] = useState<string | null>(null);

  // Add guest form state
  const [guestName, setGuestName] = useState("");
  const [guestType, setGuestType] = useState<PersonType>(PersonType.CHILD);
  const [addGuestLoading, setAddGuestLoading] = useState(false);
  const [addGuestError, setAddGuestError] = useState<string | null>(null);

  const loadInvitees = async (eventId: string) => {
    setInviteesLoading(true);
    setInviteesError(null);
    try {
      const transport = createConnectTransport({
        baseUrl: "",
        interceptors: [makeAuthInterceptor(getToken)],
      });
      const client = createClient(InviteService, transport);
      const res = await client.listInvitees(create(ListInviteesRequestSchema, { eventId }));
      setInvitees(res.invitees);
    } catch (err) {
      setInviteesError(err instanceof Error ? err.message : "Failed to load guests");
    } finally {
      setInviteesLoading(false);
    }
  };

  // On mount (when authenticated), check for existing events
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const run = async () => {
      try {
        const transport = createConnectTransport({
          baseUrl: "",
          interceptors: [makeAuthInterceptor(getToken)],
        });
        const client = createClient(InviteService, transport);
        const res = await client.listEvents(create(ListEventsRequestSchema, {}));
        if (res.events.length > 0) {
          setEvent(res.events[0]);
          await loadInvitees(res.events[0].id);
        }
      } catch {
        // No events or network error — creation form will be shown
      }
    };
    run();
  }, [isLoaded, isSignedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateEventLoading(true);
    setCreateEventError(null);
    try {
      const transport = createConnectTransport({
        baseUrl: "",
        interceptors: [makeAuthInterceptor(getToken)],
      });
      const client = createClient(InviteService, transport);
      const datetimeUnix = BigInt(Math.floor(new Date(datetimeLocal).getTime() / 1000));
      const newEvent = await client.createEvent(
        create(CreateEventRequestSchema, {
          name: eventName,
          venue,
          description,
          datetimeUnix,
          capacity,
          allowSiblings,
          requireParentStay,
        }),
      );
      setEvent(newEvent);
      await loadInvitees(newEvent.id);
    } catch (err) {
      setCreateEventError(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setCreateEventLoading(false);
    }
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    setAddGuestLoading(true);
    setAddGuestError(null);
    try {
      const transport = createConnectTransport({
        baseUrl: "",
        interceptors: [makeAuthInterceptor(getToken)],
      });
      const client = createClient(InviteService, transport);
      const person = await client.createPerson(
        create(CreatePersonRequestSchema, { name: guestName, type: guestType }),
      );
      await client.addInvitee(
        create(AddInviteeRequestSchema, { eventId: event.id, personId: person.id }),
      );
      setGuestName("");
      setGuestType(PersonType.CHILD);
      await loadInvitees(event.id);
    } catch (err) {
      setAddGuestError(err instanceof Error ? err.message : "Failed to add guest");
    } finally {
      setAddGuestLoading(false);
    }
  };

  const formatDateTime = (unixSeconds: bigint) =>
    new Date(Number(unixSeconds) * 1000).toLocaleString();

  const leftPanel = event ? (
    <div className="invite-manager__event-detail">
      <h2 className="invite-manager__section-title">Event Details</h2>
      <dl className="invite-manager__detail-list">
        <div className="invite-manager__detail-row">
          <dt className="invite-manager__detail-label">Name</dt>
          <dd className="invite-manager__detail-value">{event.name}</dd>
        </div>
        <div className="invite-manager__detail-row">
          <dt className="invite-manager__detail-label">Venue</dt>
          <dd className="invite-manager__detail-value">{event.venue}</dd>
        </div>
        <div className="invite-manager__detail-row">
          <dt className="invite-manager__detail-label">Date &amp; Time</dt>
          <dd className="invite-manager__detail-value">{formatDateTime(event.datetimeUnix)}</dd>
        </div>
        <div className="invite-manager__detail-row">
          <dt className="invite-manager__detail-label">Capacity</dt>
          <dd className="invite-manager__detail-value">{event.capacity}</dd>
        </div>
        <div className="invite-manager__detail-row">
          <dt className="invite-manager__detail-label">Allow Siblings</dt>
          <dd className="invite-manager__detail-value">{event.allowSiblings ? "Yes" : "No"}</dd>
        </div>
        <div className="invite-manager__detail-row">
          <dt className="invite-manager__detail-label">Require Parent Stay</dt>
          <dd className="invite-manager__detail-value">
            {event.requireParentStay ? "Yes" : "No"}
          </dd>
        </div>
      </dl>
    </div>
  ) : (
    <div className="invite-manager__create-form-panel">
      <h2 className="invite-manager__section-title">Create Event</h2>
      <form className="invite-manager__form" onSubmit={handleCreateEvent}>
        <label className="invite-manager__label">
          Event Name
          <input
            className="invite-manager__input"
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            required
          />
        </label>
        <label className="invite-manager__label">
          Venue
          <input
            className="invite-manager__input"
            type="text"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            required
          />
        </label>
        <label className="invite-manager__label">
          Description
          <textarea
            className="invite-manager__input invite-manager__textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label className="invite-manager__label">
          Date &amp; Time
          <input
            className="invite-manager__input"
            type="datetime-local"
            value={datetimeLocal}
            onChange={(e) => setDatetimeLocal(e.target.value)}
            required
          />
        </label>
        <label className="invite-manager__label">
          Capacity
          <input
            className="invite-manager__input"
            type="number"
            min={1}
            value={capacity || ""}
            onChange={(e) => setCapacity(parseInt(e.target.value, 10) || 0)}
            required
          />
        </label>
        <label className="invite-manager__checkbox-label">
          <input
            type="checkbox"
            checked={allowSiblings}
            onChange={(e) => setAllowSiblings(e.target.checked)}
          />
          Allow Siblings
        </label>
        <label className="invite-manager__checkbox-label">
          <input
            type="checkbox"
            checked={requireParentStay}
            onChange={(e) => setRequireParentStay(e.target.checked)}
          />
          Require Parent Stay
        </label>
        {createEventError && <p className="invite-manager__error">{createEventError}</p>}
        <Button type="submit" variant="default" disabled={createEventLoading}>
          {createEventLoading ? "Creating…" : "Create Event"}
        </Button>
      </form>
    </div>
  );

  const rightPanel = event ? (
    <div className="invite-manager__guest-panel">
      <h2 className="invite-manager__section-title">Guest List</h2>
      {inviteesLoading && <p className="invite-manager__status">Loading guests…</p>}
      {inviteesError && <p className="invite-manager__error">{inviteesError}</p>}
      {!inviteesLoading && !inviteesError && invitees.length === 0 && (
        <p className="invite-manager__empty">No guests added yet.</p>
      )}
      {invitees.length > 0 && (
        <ul className="invite-manager__invitee-list">
          {invitees.map((iws, i) => (
            <li key={iws.invitee?.id ?? i} className="invite-manager__invitee-row">
              <span className="invite-manager__invitee-name">{iws.person?.name}</span>
              <span className="invite-manager__invitee-type">
                {iws.person?.type === PersonType.CHILD ? "child" : "adult"}
              </span>
            </li>
          ))}
        </ul>
      )}
      <form className="invite-manager__add-guest-form" onSubmit={handleAddGuest}>
        <h3 className="invite-manager__subsection-title">Add Guest</h3>
        <label className="invite-manager__label">
          Name
          <input
            className="invite-manager__input"
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            required
          />
        </label>
        <label className="invite-manager__label">
          Type
          <select
            className="invite-manager__input"
            value={guestType}
            onChange={(e) => setGuestType(Number(e.target.value) as PersonType)}
          >
            <option value={PersonType.CHILD}>Child</option>
            <option value={PersonType.ADULT}>Adult</option>
          </select>
        </label>
        {addGuestError && <p className="invite-manager__error">{addGuestError}</p>}
        <Button type="submit" variant="default" disabled={addGuestLoading}>
          {addGuestLoading ? "Adding…" : "Add Guest"}
        </Button>
      </form>
    </div>
  ) : (
    <div className="invite-manager__guest-panel invite-manager__guest-panel--empty">
      <p className="invite-manager__status">Create an event to manage your guest list.</p>
    </div>
  );

  return (
    <div className="invite-manager">
      <h1 className="invite-manager__title">Invite Manager</h1>
      {!isLoaded && (
        <p className="invite-manager__status invite-manager__status--loading">Loading…</p>
      )}
      <Show when="signed-in">
        <TwoColumnLayout leftContent={leftPanel} rightContent={rightPanel} />
      </Show>
      <Show when="signed-out">
        <p className="invite-manager__status">Sign in to manage your event.</p>
        <SignInButton>
          <Button variant="outline">Sign In</Button>
        </SignInButton>
      </Show>
    </div>
  );
};
