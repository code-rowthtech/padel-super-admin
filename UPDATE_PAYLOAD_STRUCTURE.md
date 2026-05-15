# Update Schedule Payload Structure

## Overview
This document describes the update payload structure for league schedule matches, designed to mirror the save schedule payload for easy backend implementation.

## Update Payload Structure

```javascript
{
  scheduleId: "string",           // Extracted from match.id (e.g., "existing_123_0" -> "123")
  matchIndex: number,             // Match position in the schedule (e.g., "existing_123_0" -> 0)
  date: "ISO 8601 string",        // UTC date (e.g., "2024-01-15T00:00:00.000Z")
  venue: "string",                // Venue name (e.g., "Courtline")
  venueClubId: "string",          // Club ID of the venue
  roundType: "string",            // "regular" | "quarterfinal" | "semifinal" | "final"
  categoryType: "string",         // Category type (e.g., "Men's Singles")
  startTime: "string",            // 12-hour format (e.g., "9:00 AM")
  endTime: "string",              // 12-hour format (e.g., "10:00 AM")
  duration: number,               // Duration in minutes (e.g., 60)
  teamA: {
    clubId: "string",             // Home club ID
    clubType: "string",           // Club name (only for non-finals)
    teamName: "string",           // Team name
    players: [
      {
        playerId: "string",       // Player ID
        playerName: "string"      // Player name
      }
    ]
  },
  teamB: {
    clubId: "string",             // Away club ID
    clubType: "string",           // Club name (only for non-finals)
    teamName: "string",           // Team name
    players: [
      {
        playerId: "string",       // Player ID
        playerName: "string"      // Player name
      }
    ]
  }
}
```

## Comparison with Save Payload

### Save Payload Structure
```javascript
{
  leagueId: "string",
  roundType: "string",
  venueClubId: "string",
  venue: "string",
  date: "ISO 8601 string",
  categories: [
    {
      categoryType: "string",
      matches: [
        {
          matchNo: number,
          teamA: { clubId, clubType, teamName, players: [...] },
          teamB: { clubId, clubType, teamName, players: [...] },
          startTime: "string",
          endTime: "string",
          duration: number,
          status: "scheduled"
        }
      ]
    }
  ]
}
```

### Key Differences

1. **Update Payload**:
   - Targets a single match within a schedule
   - Uses `scheduleId` and `matchIndex` to identify the specific match
   - Flattens the structure (no nested categories array)
   - Includes all match details at the top level

2. **Save Payload**:
   - Creates multiple matches across multiple categories
   - Groups matches by category
   - Includes league-level information

## Editable Fields

Users can update the following fields until the date has passed:

1. **Clubs**: Both home and away clubs can be changed
2. **Players**: Player selection for both teams (2 players each)
3. **Date**: Match date can be changed (only future dates)
4. **Venue**: Match venue can be changed
5. **Start Time**: Match start time
6. **Duration**: Match duration (30m, 1h, 1.5h, 2h)
7. **End Time**: Automatically calculated based on start time and duration

## Backend Implementation Notes

### Suggested API Endpoint
```
PUT /api/schedules/:scheduleId/matches/:matchIndex
```

### Validation Rules
1. Verify the schedule exists and belongs to the league
2. Check that the date hasn't passed
3. Validate that exactly 2 players are selected for each team
4. Ensure players belong to the specified clubs
5. Verify players are not already scheduled for another match on the same date
6. Validate that the venue club exists in the league

### Database Update Strategy
```javascript
// Pseudo-code for backend update
const schedule = await Schedule.findById(scheduleId);
const match = schedule.matches[matchIndex];

// Update match fields
match.teamA = payload.teamA;
match.teamB = payload.teamB;
match.startTime = payload.startTime;
match.endTime = payload.endTime;
match.duration = payload.duration;

// Update schedule-level fields if changed
if (payload.date !== schedule.date) {
  schedule.date = payload.date;
}
if (payload.venue !== schedule.venue) {
  schedule.venue = payload.venue;
  schedule.venueClubId = payload.venueClubId;
}

await schedule.save();
```

## Frontend Implementation

### Edit Mode Activation
- Click the edit icon (pencil) on an existing match row
- The row becomes fully editable with all fields transformed into interactive controls
- Players are automatically loaded from the existing match data

### Editable Components in Edit Mode
1. **Date Input**: Date picker for match date (transforms from static text to `<input type="date">`)
2. **Venue Dropdown**: Select from available clubs (transforms from static text to `<select>` dropdown)
3. **Club Selectors**: CustomClubSelector component for home/away clubs with player selection
4. **Player Selectors**: Dropdown with player checkboxes (max 2 per team) - automatically populated from existing match
5. **Time Input**: Time picker for start time (transforms from static text to `<input type="time">`)
6. **Duration Dropdown**: Select from 30m, 1h, 1.5h, 2h (transforms from static text to `<select>` dropdown)
7. **End Time**: Automatically calculated and displayed (read-only)

### Edit Mode Behavior
- **Non-Finals Rounds**: All fields become editable when clicking edit icon
- **Finals Round**: All fields become editable when clicking edit icon
- **Player Pre-population**: When entering edit mode, existing players are automatically loaded into the selection state
- **Club Data Fetching**: Player data for existing clubs is fetched automatically when edit mode is activated

### Save Action
- Click the check icon (✓) to save changes
- Payload is constructed with all updated fields
- On success, exit edit mode and refresh schedule data
- Validation ensures 2 players per team for non-finals

## Example Update Payload

```javascript
{
  scheduleId: "507f1f77bcf86cd799439011",
  matchIndex: 0,
  date: "2024-02-15T00:00:00.000Z",
  venue: "Padel Haus",
  venueClubId: "507f1f77bcf86cd799439012",
  roundType: "regular",
  categoryType: "Men's Singles",
  startTime: "10:00 AM",
  endTime: "11:00 AM",
  duration: 60,
  teamA: {
    clubId: "507f1f77bcf86cd799439012",
    clubType: "Padel Haus",
    teamName: "Team A",
    players: [
      {
        playerId: "507f1f77bcf86cd799439013",
        playerName: "John Doe"
      },
      {
        playerId: "507f1f77bcf86cd799439014",
        playerName: "Jane Smith"
      }
    ]
  },
  teamB: {
    clubId: "507f1f77bcf86cd799439015",
    clubType: "Courtline",
    teamName: "Team B",
    players: [
      {
        playerId: "507f1f77bcf86cd799439016",
        playerName: "Mike Johnson"
      },
      {
        playerId: "507f1f77bcf86cd799439017",
        playerName: "Sarah Williams"
      }
    ]
  }
}
```

## Notes

1. **No `existing_` prefix**: The payload uses clean IDs without the `existing_` prefix used in the frontend
2. **Match identification**: Uses `scheduleId` + `matchIndex` instead of a composite match ID
3. **Consistent structure**: teamA and teamB structure matches the save payload exactly
4. **Date validation**: Backend should reject updates for past dates
5. **Player availability**: Backend should verify players aren't double-booked
