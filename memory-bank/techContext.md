# Technical Context

## Technology Stack

### Frontend
- React.js for UI components
- Redux for state management
- Material-UI for component library
- Axios for API requests

### Backend
- Node.js/Express.js server
- MongoDB for data storage
- Redis for caching
- Bull for job queues

### APIs & Integrations
1. Google APIs
   - Gmail API for email management
   - Google Places API for business discovery
   - Google Maps API for location data

2. Twitter API v2
   - Tweet management
   - Direct messaging
   - User engagement

3. Additional APIs
   - Yelp Fusion API
   - LinkedIn API (future consideration)
   - HubSpot API for CRM integration

## Development Setup
1. Environment Requirements
   ```bash
   Node.js >= 16.x
   MongoDB >= 5.0
   Redis >= 6.2
   ```

2. API Keys Required
   ```
   GOOGLE_API_KEY
   GMAIL_OAUTH_CREDENTIALS
   TWITTER_API_KEY
   TWITTER_API_SECRET
   YELP_API_KEY
   ```

3. Development Tools
   - VSCode with ESLint/Prettier
   - Postman for API testing
   - MongoDB Compass
   - Redis Commander

## Technical Constraints
1. Rate Limits
   - Gmail: 2000 emails/day
   - Twitter: 50 tweets/day
   - Google Places: 1000 requests/day
   - Yelp: 5000 calls/day

2. Data Storage
   - Business profiles < 100MB each
   - Campaign data retention: 90 days
   - Analytics data: 12 months

3. Performance
   - API response time < 500ms
   - Background jobs < 5 minutes
   - Search results < 2 seconds

## Dependencies
### Core Dependencies
```json
{
  "dependencies": {
    "express": "^4.17.1",
    "mongoose": "^6.0.0",
    "redis": "^4.0.0",
    "bull": "^4.0.0",
    "googleapis": "^92.0.0",
    "twitter-api-v2": "^1.12.0",
    "yelp-fusion": "^3.0.0",
    "axios": "^0.24.0",
    "react": "^17.0.2",
    "redux": "^4.1.2",
    "@material-ui/core": "^4.12.3"
  }
}
```

### Development Dependencies
```json
{
  "devDependencies": {
    "jest": "^27.0.0",
    "eslint": "^8.0.0",
    "prettier": "^2.5.0",
    "nodemon": "^2.0.15",
    "typescript": "^4.5.0"
  }
}
