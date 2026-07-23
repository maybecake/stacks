import React, { useState, useEffect } from "react";
import { createConnectTransport } from "@connectrpc/connect-web";
import { createClient } from "@connectrpc/connect";
import { create } from "@bufbuild/protobuf";
import { Show, SignInButton, useAuth } from "@clerk/react";
import {
  InviteService,
  CreateEventRequestSchema,
  ListEventsRequestSchema,
} from "../../gen/invite/invite_pb.js";
import type { Event } from "../../gen/invite/invite_pb.js";
import { makeAuthInterceptor } from "../../lib/authInterceptor.js";
import { TwoColumnLayout } from "@layout/TwoColumnLayout";
import { Button } from "@ui/button";
import { HouseholdGuestList } from "./HouseholdGuestList.js";
import "./invite.css";

export const InviteManager: React.FC = () => {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [createEventLoading, setCreateEventLoading] = useState(false);
  const [createEventError, setCreateEventError] = useState<string | null>(null);

  const [eventName, setEventName] = useState("");
  const [venue, setVenue] = useState("");
  const [description, setDescription] = useState("");
  const [datetimeLocal, setDatetimeLocal] = useState("");
  const [capacity, setCapacity] = useState(0);
  const [allowSiblings, setAllowSiblings] = useState(false);
  const [requireParentStay, setRequireParentStay] = useState(false);

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
        if (res.events.length > 0) setEvent(res.events[0]);
      } catch {
        // No events yet — creation form will be shown
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
    } catch (err) {
      setCreateEventError(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setCreateEventLoading(false);
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
      <HouseholdGuestList eventId={event.id} />
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
