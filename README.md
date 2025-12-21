# Notion Widgets

A collection of embeddable HTML widgets designed for use in Notion pages.

## Widgets

### 1. Raise Amount Display (`index.html`)
Displays a dynamically updated dollar amount fetched from an API endpoint.

**Features:**
- Real-time data fetching with retry logic
- Clean, modern card design with Tailwind CSS
- Responsive layout
- Dark mode support
- Loading states and error handling

**Live URL:** https://storage.googleapis.com/moonfive-website-bucket/index.html

### 2. Location Picker (`location-picker.html`)
Interactive location search widget with Google Maps integration.

**Features:**
- Google Maps with Places API autocomplete
- Location search with detailed address extraction
- Interactive map with marker placement
- Webhook integration for location data submission
- Toast notifications for feedback
- Responsive design with Tailwind CSS

**Live URL:** https://storage.googleapis.com/moonfive-website-bucket/location-picker.html

### 3. Ticket Date Updater (`ticket-updater-v3.html`)
Interactive ticket management widget for updating target dates across different environments.

**Features:**
- Multi-environment support (Prototyping, Production, Certification)
- Dynamic ticket fetching from webhook endpoints
- Custom calendar date picker with month navigation
- Aceternity-style animated gradient background that responds to mouse movement
- Form validation ensuring new dates are after current dates
- Webhook integration for date update submissions
- Real-time feedback with success/error states
- Ticket preview with description display
- Built with React (vanilla JS - no JSX/Babel) and inline CSS (no Tailwind)
- Inline SVG icons (no external icon dependencies)

**Live URL:** https://storage.googleapis.com/moonfive-website-bucket/ticket-updater-v3.html

**Version History:**
- `v3`: Production version with animated background, custom date picker, no external CSS frameworks
- `v2`: Simplified version with basic styling
- `v1`: Initial version (deprecated due to Tailwind CSS conflicts)

## Deployment

All widgets are hosted on Google Cloud Storage bucket: `moonfive-website-bucket`

To update a widget:
```bash
gcloud storage cp <filename>.html gs://moonfive-website-bucket/
```

## Usage in Notion

1. Copy the live URL for the widget you want to embed
2. In Notion, type `/embed` and paste the URL
3. Adjust the embed size as needed

## Configuration

Each widget has configuration constants at the top of the JavaScript section:
- Update webhook URLs to point to your endpoints
- Modify API keys as needed
- Customize styling via Tailwind classes or custom CSS
