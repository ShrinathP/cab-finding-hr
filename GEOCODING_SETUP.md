# Geocoding API Configuration

This project supports two geocoding providers that can be switched using an environment variable:

## 🌍 Supported Providers

### 1. **Google Maps Geocoding API** (Default)
- **Provider**: `google`
- **Features**: High accuracy, detailed place information, requires API key
- **API Key Required**: Yes (`API_KEY` in `.env`)
- **Cost**: Paid service with free tier

### 2. **Photon Geocoding API** (OpenStreetMap)
- **Provider**: `photon`
- **Features**: Free, open-source, good coverage, no API key needed
- **API Key Required**: No
- **Cost**: Free
- **Data Source**: OpenStreetMap

## 🔧 Configuration

### Using Environment Variable

Add to your `.env` file:

```bash
# For Google Maps (default)
GEOCODING_PROVIDER=google
API_KEY=your_google_maps_api_key

# For Photon (free, no API key needed)
GEOCODING_PROVIDER=photon
```

### Using Runtime Configuration

```javascript
// Set environment variable programmatically
process.env.GEOCODING_PROVIDER = 'photon';
```

## 🚀 Usage Examples

Both providers return the **exact same response format**:

```javascript
const suggestions = await getLocationSuggestionsForProvider("bangalore", 5);

// Response format (identical for both providers):
[
  {
    id: 0,
    formatted_address: "Bengaluru, Karnataka, India",
    place_id: "ChIJS...ABC" || "osm_relation_12345", 
    coordinates: { lat: 12.9716, lng: 77.5946 },
    types: ["locality", "political"],
    display_name: "Bengaluru, Karnataka"
  }
  // ... more results
]
```

## 📊 Provider Comparison

| Feature | Google Maps | Photon |
|---------|-------------|---------|
| **Accuracy** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Coverage** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Speed** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Cost** | 💰 Paid | 🆓 Free |
| **API Key** | ✅ Required | ❌ Not needed |
| **Rate Limits** | Yes | Generous |

## 🧪 Testing Both Providers

Run the test script to compare results:

```bash
cd locationLogic
node testBothAPIs.js
```

## 🔄 Switching Providers

1. **Development/Testing**: Use Photon (free, no setup)
   ```bash
   GEOCODING_PROVIDER=photon
   ```

2. **Production**: Use Google Maps (more accurate)
   ```bash
   GEOCODING_PROVIDER=google
   API_KEY=your_production_api_key
   ```

## 📱 User Experience

Users will see which provider is being used:

```
🔍 Search term: "koramangala bangalore"
📍 Found 5 location(s) using PHOTON API:
```

or

```
🔍 Search term: "koramangala bangalore"  
📍 Found 5 location(s) using GOOGLE API:
```

## 🐛 Error Handling

Both providers include comprehensive error handling and fallback mechanisms. If one provider fails, you can easily switch to the other by changing the environment variable.

---

**Note**: The response format is identical between providers, making switching seamless without code changes.
