# Component API Documentation

## MatchRequestModal

### Description
A modal component for sending match requests to players. Supports both single and multi-select modes.

### Import
```javascript
import MatchRequestModal from '../../../components/modals/MatchRequestModal';
// or
import { MatchRequestModal } from '../../../components/modals';
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| show | boolean | Yes | Controls modal visibility |
| onHide | function | Yes | Callback when modal closes |
| matchId | string | Yes | ID of the match to send requests for |

### Usage Example
```javascript
const [showModal, setShowModal] = useState(false);
const [selectedMatchId, setSelectedMatchId] = useState(null);

const handleOpenModal = (matchId) => {
  setSelectedMatchId(matchId);
  setShowModal(true);
};

<MatchRequestModal 
  show={showModal}
  onHide={() => setShowModal(false)}
  matchId={selectedMatchId}
/>
```

### Features
- Fetches players automatically when opened
- Single send: Click "Send" button on individual player
- Multi-select: Click "Select" button, check players, send to multiple
- Shows status badges (Pending, Accepted, Rejected)
- Loading states during API calls
- Error handling with toast notifications
- Success messages on completion

### State Management
Uses Redux store: `state.matchRequest`
- `matchRequestPlayers`: Array of available players
- `matchRequestLoading`: Loading state for fetching players
- `sendRequestLoading`: Loading state for sending requests

---

## PlayersJoinedModal

### Description
A modal component for displaying players who have joined a match.

### Import
```javascript
import PlayersJoinedModal from '../../../components/modals/PlayersJoinedModal';
// or
import { PlayersJoinedModal } from '../../../components/modals';
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| show | boolean | Yes | Controls modal visibility |
| onHide | function | Yes | Callback when modal closes |
| players | array | Yes | Array of player objects |
| matchDetails | object | No | Additional match information |

### Player Object Structure
```javascript
{
  _id: "string",
  name: "string",
  playerName: "string", // alternative to name
  email: "string",
  phoneNumber: "string",
  skillLevel: "string",
  amountPaid: number
}
```

### Usage Example
```javascript
const [showModal, setShowModal] = useState(false);
const [selectedMatch, setSelectedMatch] = useState(null);

const handleViewPlayers = (match) => {
  const allPlayers = [...(match.teamA || []), ...(match.teamB || [])];
  setSelectedMatch({ ...match, players: allPlayers });
  setShowModal(true);
};

<PlayersJoinedModal 
  show={showModal}
  onHide={() => setShowModal(false)}
  players={selectedMatch?.players || []}
  matchDetails={selectedMatch}
/>
```

### Features
- Displays player name and contact information
- Shows skill level badge
- Displays amount paid (if available)
- Scrollable list for many players
- Empty state when no players joined

---

## OpenMatchesOverview

### Description
A full-page component displaying all open matches with detailed information.

### Import
```javascript
import OpenMatchesOverview from '../../../pages/admin/openMatches/OpenMatchesOverview';
```

### Route
```
/admin/open-matches
```

### Features
- Fetches open matches from Redux store
- Desktop: Table layout with sortable columns
- Mobile: Card layout with all information
- Clickable "Players Joined" column
- Request button for each match
- Loading and error states
- Empty state when no matches
- Responsive design

### Data Structure
Uses Redux store: `state.dashboard.openMatchOverview`

```javascript
{
  openMatches: [
    {
      _id: "string",
      createdBy: { name, phoneNumber, countryCode },
      clubId: { clubName },
      slot: [{ courtName }],
      matchDate: "date",
      matchTime: ["time"],
      skillLevel: "string",
      requestCounts: { total, pending, accepted },
      totalPlayers: number,
      totalPlayersCount: number,
      teamA: [{ player objects }],
      teamB: [{ player objects }],
      totalMatchPayment: number,
      openMatchStatus: "open|full|closed",
      isWithin24Hours: boolean
    }
  ]
}
```

### Usage
Navigate to the page:
```javascript
import { Link } from 'react-router-dom';

<Link to="/admin/open-matches">View All Matches</Link>
```

Or programmatically:
```javascript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/admin/open-matches');
```

---

## Redux Actions

### getMatchRequestPlayers
Fetches available players for a match.

```javascript
import { useDispatch } from 'react-redux';
import { getMatchRequestPlayers } from '../../../redux/thunks';

const dispatch = useDispatch();

// Usage
dispatch(getMatchRequestPlayers(matchId));
```

**Parameters:**
- `matchId` (string): ID of the match

**Returns:**
- Array of player objects

### sendMatchRequest
Sends match request to one or more players.

```javascript
import { useDispatch } from 'react-redux';
import { sendMatchRequest } from '../../../redux/thunks';

const dispatch = useDispatch();

// Single player
dispatch(sendMatchRequest({ 
  matchId: "match123", 
  playerIds: ["player1"] 
}));

// Multiple players
dispatch(sendMatchRequest({ 
  matchId: "match123", 
  playerIds: ["player1", "player2", "player3"] 
}));
```

**Parameters:**
- `matchId` (string): ID of the match
- `playerIds` (array): Array of player IDs

**Returns:**
- Success/error response

---

## Styling

### Custom Classes

#### MatchRequestModal
- `.btn-primary`: Primary action button
- `.btn-danger`: Cancel/close button
- `.badge`: Status badges

#### PlayersJoinedModal
- `.badge`: Skill level badge
- `.text-success`: Amount paid styling

#### OpenMatchesOverview
- `.custom-table`: Table styling
- `.mobile-card-table`: Mobile card layout
- `.players-joined-cell`: Clickable player count cell

### CSS Variables
Uses existing design system variables from `variables.css`

---

## Error Handling

All components include proper error handling:

1. **API Errors**: Displayed via toast notifications
2. **Loading States**: Show loading spinners
3. **Empty States**: User-friendly messages
4. **Network Errors**: Retry buttons provided

### Example Error Handling
```javascript
try {
  await dispatch(sendMatchRequest({ matchId, playerIds })).unwrap();
  // Success handling
} catch (error) {
  // Error is already shown via toast
  console.error('Failed to send request:', error);
}
```

---

## Accessibility

- Semantic HTML elements
- Proper ARIA labels
- Keyboard navigation support
- Focus management in modals
- Screen reader friendly

---

## Performance

- Lazy loading of components
- Memoized selectors
- Optimized re-renders
- Efficient state updates
- Minimal API calls

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Testing

### Manual Testing Checklist

**MatchRequestModal:**
- [ ] Opens when triggered
- [ ] Loads players correctly
- [ ] Single send works
- [ ] Multi-select works
- [ ] Status badges display correctly
- [ ] Loading states show
- [ ] Error handling works
- [ ] Closes properly

**PlayersJoinedModal:**
- [ ] Opens when triggered
- [ ] Displays all players
- [ ] Shows player details correctly
- [ ] Handles empty state
- [ ] Closes properly

**OpenMatchesOverview:**
- [ ] Page loads correctly
- [ ] Data displays in table
- [ ] Mobile view works
- [ ] Players modal opens
- [ ] Request modal opens
- [ ] Loading states show
- [ ] Error states show
- [ ] Empty state shows

---

## Common Issues & Solutions

### Issue: Modal not opening
**Solution:** Ensure state is properly managed and matchId is valid

### Issue: Players not loading
**Solution:** Check API endpoint and matchId parameter

### Issue: Request not sending
**Solution:** Verify playerIds array is not empty

### Issue: Styling issues
**Solution:** Check Bootstrap and custom CSS are loaded

---

## Future Enhancements

Potential improvements:
- Add search/filter functionality
- Add sorting options
- Add pagination
- Add player profiles
- Add request history
- Add bulk actions
- Add export functionality

---

For more information, see:
- `MATCH_REQUEST_IMPLEMENTATION.md` - Full implementation details
- `QUICK_START_GUIDE.md` - Quick start guide
