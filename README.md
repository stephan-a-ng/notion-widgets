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
