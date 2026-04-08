Invitation system

# Product Vision & Objective

To build a highly adaptable event invitation and RSVP tracking system that manages dynamic party compositions (households) against venue, host, guest constraints and preferences.

The MVP will focus on the complex, multi-variable scenario of a kid's birthday party, serving as a robust foundation for future use cases.
Future use cases may have additional flexibilty features like a group defining what time is best or picking a venue dynamically. maybe even splitting into sub groups if entire group can't decide, or multi-part events.

## Target PersonasThe

Host: Needs to dictate event logistics, establish strict rules for attendance (headcount, drop-offs, siblings), and get a real-time, accurate headcount.

The Guest (Parent): Needs a frictionless RSVP experience that clearly communicates the rules (e.g., "Am I supposed to stay?" "Can I bring my younger child?") and allows them to RSVP for their entire household unit at once.

## Key Use Case: The Kids' Birthday Party (e.g., Hana’s 10th Birthday)

Knowns: Venue, start time, duration, Friends guest list (may know one or both parents of friend, may not know which parent will register, multiple parents may register for the same invitee child - need to make sure not to duplicate, if an invitee has both parents set and both try to RSVP, make ui clear for the second parent that kid is already registered - idea of a target invitee group)

Unknowns: Total footprint of a single invitation (1 kid? 1 kid + 1 parent? 1 kid + 1 parent + 2 siblings?).

Constraints: Venue fire code limits, age-appropriate activities, host budget.

## Core MVP Features

Basic things like location / description of the event, any special instructions.
contact information for hosts

Dynamic Event Creation Engine: Allows the host to set logistical details alongside a "Rules Configuration" (capacity, sibling allowances, parent expectations).

Conditional RSVP Flow: A smart form that reacts to the host's rules. If siblings aren't allowed, the UI makes it explicit that the host will not allow for +1s, this is separate from parents staying / participation.
Real-time Capacity Enforcement: The system must prevent over-booking. If the venue has 3 spots left, a guest cannot RSVP for 4 people.
Household-Based Tracking: Grouping attendees by "Party" or "Household" rather than just individual tickets, allowing the host to see who belongs to whom - emergency contact management, etc.
