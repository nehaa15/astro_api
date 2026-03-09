# Astrology & Numerology API Documentation

## Overview

A Vedic Astrology (Jyotish) and Numerology API that generates comprehensive birth chart analysis, predictions, and remedies based on classical rules.

## Base URL

```
http://localhost:4000
```

## Authentication

All API endpoints (except `/health` and `/api`) require an API key to be passed in the request header:

```
x-api-key: astro-api-key-2024
```

---

## Endpoints

### 1. Health Check

Check if the server is running.

**Endpoint:** `GET /health`

**Authentication:** Not required

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### 2. API Information

Get available endpoints and API version.

**Endpoint:** `GET /api`

**Authentication:** Not required

**Response:**
```json
{
  "name": "Astrology & Numerology API",
  "version": "1.0.0",
  "endpoints": {
    "POST /generate-report": "Generate complete astrological report",
    "POST /kundali": "Generate Kundali (birth chart) only",
    "POST /numerology": "Generate numerology analysis only",
    "GET /health": "Health check"
  }
}
```

---

### 3. Generate Complete Report (Main Endpoint)

Generate a comprehensive astrological and numerological report.

**Endpoint:** `POST /generate-report`

**Authentication:** Required (`x-api-key` header)

**Request Body:**
```json
{
  "name": "John Doe",
  "dob": "1990-05-15",
  "time": "14:30",
  "place": "Mumbai"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Full name of the person |
| dob | string | Yes | Date of birth in YYYY-MM-DD format |
| time | string | Yes | Time of birth in HH:MM format (24-hour) |
| place | string | Yes | Birth city name |

**Supported Cities:**
Mumbai, Delhi, Bangalore, Chennai, Kolkata, Hyderabad, Ahmedabad, Pune, Jaipur, Lucknow, Kanpur, Nagpur, Indore, Bhopal, Patna, Vadodara, Ghaziabad, Ludhiana, Agra, Nashik, Meerut, Varanasi, Srinagar, Aurangabad, Dhanbad, Amritsar, Jodhpur, Ranchi, Raipur, Coimbatore, Guwahati, Chandigarh, Mysore, Thiruvananthapuram, Kochi, Mangalore, Kolhapur, Udaipur, Ajmer, Bhilai, Warangal, Guntur, Bikaner, Dehradun, Gorakhpur, Aligarh, Jabalpur, Gwalior,
New York, Los Angeles, Chicago, Houston, Phoenix, Philadelphia, San Francisco, Dallas, Seattle, Denver, Boston, Atlanta, Miami, Washington DC, Las Vegas,
London, Manchester, Birmingham, Liverpool, Edinburgh, Glasgow,
Toronto, Vancouver, Montreal, Calgary, Ottawa,
Sydney, Melbourne, Brisbane, Perth, Auckland,
Dubai, Abu Dhabi, Singapore, Hong Kong, Tokyo, Bangkok, Jakarta, Manila, Kuala Lumpur,
Johannesburg, Cape Town, Nairobi, Cairo, Lagos

**Success Response (200):**
```json
{
  "success": true,
  "report": {
    "name": "John Doe",
    "dob": "1990-05-15",
    "time": "14:30",
    "place": "Mumbai",
    "kundali": {
      "pos": {
        "Sun": {
          "lon": 54.23,
          "rashi": 1,
          "rashiName": "Taurus",
          "deg": 24.23,
          "nak": "Rohini",
          "pada": 3,
          "dig": "Neutral",
          "retro": false
        },
        // ... other planets
      },
      "lagna": 5,
      "pih": {
        "1": ["Sun"],
        "2": [],
        // ... planets in each house
      },
      "asp": {
        "1": ["Saturn"],
        // ... aspects on each house
      },
      "das": [
        {
          "lord": "Mo",
          "name": "Moon",
          "yrs": 10,
          "start": "1990-05-15T00:00:00.000Z",
          "end": "2000-05-15T00:00:00.000Z"
        },
        // ... all Dasha periods
      ]
    },
    "numerology": {
      "moolank": 6,
      "bhagyank": 3,
      "personalYear": 5,
      "kuaMale": 4,
      "kuaFemale": 2,
      "masterNumber": null,
      "karmicDebt": null,
      "gridCount": { "1": 2, "5": 1, "9": 1, ... },
      "missing_nums": [2, 3, 7],
      "repeat_nums": [{ "n": 1, "c": 2 }],
      "present_nums": [1, 5, 9, ...],
      "thoughtPlane": [1],
      "willPlane": [5],
      "actionPlane": [9]
    },
    "predictions": {
      "soulText": "Deep soul signature reading...",
      "yogas": [
        {
          "name": "Gaja Kesari Yoga",
          "type": "benefic",
          "desc": "Jupiter in Kendra from Moon..."
        }
      ],
      "past": [
        {
          "title": "A Childhood That Taught You...",
          "body": "Detailed past revelation..."
        }
        // ... 10 past revelations
      ],
      "presMain": "Current dasha analysis...",
      "present": {
        "family": "Family & home analysis...",
        "career": "Career & status analysis...",
        "love": "Love & relationships analysis...",
        "finance": "Finance & wealth analysis...",
        "inner": "Inner world analysis...",
        "loShuReading": "Lo Shu Grid interpretation...",
        "personalYear": "Personal year forecast..."
      },
      "future": [
        {
          "title": "The Professional Peak...",
          "body": "Detailed future prophecy..."
        }
        // ... 10 future prophecies
      ],
      "remedies": [
        {
          "title": "Strengthen Sun...",
          "body": "Detailed remedy instructions..."
        }
      ]
    }
  }
}
```

**Error Responses:**

*400 - Bad Request (Missing fields):*
```json
{
  "success": false,
  "error": "Missing required fields",
  "required": ["name", "dob", "time", "place"],
  "received": { "name": true, "dob": true, "time": false, "place": true }
}
```

*400 - Bad Request (Invalid format):*
```json
{
  "success": false,
  "error": "Invalid date format. Use YYYY-MM-DD (e.g., 1990-05-15)"
}
```

*401 - Unauthorized:*
```json
{
  "success": false,
  "error": "Missing API key. Include x-api-key header."
}
```

*403 - Forbidden:*
```json
{
  "success": false,
  "error": "Invalid API key."
}
```

*500 - Server Error:*
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Error details..."
}
```

---

### 4. Generate Kundali Only

Generate only the birth chart (without predictions).

**Endpoint:** `POST /kundali`

**Authentication:** Required

**Request Body:**
```json
{
  "dob": "1990-05-15",
  "time": "14:30",
  "place": "Mumbai"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "kundali": {
    "pos": { ... },
    "lagna": 5,
    "pih": { ... },
    "asp": { ... },
    "das": [ ... ]
  }
}
```

---

### 5. Generate Numerology Only

Generate only the numerology analysis.

**Endpoint:** `POST /numerology`

**Authentication:** Required

**Request Body:**
```json
{
  "name": "John Doe",
  "dob": "1990-05-15"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "numerology": {
    "moolank": 6,
    "bhagyank": 3,
    "personalYear": 5,
    "kuaMale": 4,
    "kuaFemale": 2,
    "masterNumber": null,
    "karmicDebt": null,
    "gridCount": { ... },
    "missing_nums": [...],
    "repeat_nums": [...],
    "present_nums": [...],
    "thoughtPlane": [...],
    "willPlane": [...],
    "actionPlane": [...]
  }
}
```

---

## Example Usage

### cURL

```bash
curl -X POST http://localhost:4000/generate-report \
  -H "Content-Type: application/json" \
  -H "x-api-key: astro-api-key-2024" \
  -d '{
    "name": "Rahul Sharma",
    "dob": "1992-08-15",
    "time": "06:30",
    "place": "Delhi"
  }'
```

### JavaScript (fetch)

```javascript
const response = await fetch('http://localhost:4000/generate-report', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'astro-api-key-2024'
  },
  body: JSON.stringify({
    name: 'Rahul Sharma',
    dob: '1992-08-15',
    time: '06:30',
    place: 'Delhi'
  })
});

const data = await response.json();
console.log(data.report);
```

### Python (requests)

```python
import requests

response = requests.post(
    'http://localhost:4000/generate-report',
    headers={
        'Content-Type': 'application/json',
        'x-api-key': 'astro-api-key-2024'
    },
    json={
        'name': 'Rahul Sharma',
        'dob': '1992-08-15',
        'time': '06:30',
        'place': 'Delhi'
    }
)

data = response.json()
print(data['report'])
```

---

## Data Structures

### Planet Position Object

| Field | Type | Description |
|-------|------|-------------|
| lon | number | Absolute longitude (0-360°) |
| rashi | number | Zodiac sign index (0-11) |
| rashiName | string | Zodiac sign name |
| deg | number | Degrees within the sign (0-30°) |
| nak | string | Nakshatra name |
| pada | number | Nakshatra pada (1-4) |
| dig | string | Dignity (Exalted/Debilitated/Own Sign/Friendly/Enemy/Neutral) |
| retro | boolean | Is planet retrograde |

### Yoga Object

| Field | Type | Description |
|-------|------|-------------|
| name | string | Yoga name |
| type | string | Type: benefic/malefic/mixed |
| desc | string | Detailed description |

### Dasha Object

| Field | Type | Description |
|-------|------|-------------|
| lord | string | Planet abbreviation (Su/Mo/Ma/Me/Ju/Ve/Sa/Ra/Ke) |
| name | string | Planet full name |
| yrs | number | Duration in years |
| start | string | Start date (ISO format) |
| end | string | End date (ISO format) |

### Numerology Object

| Field | Type | Description |
|-------|------|-------------|
| moolank | number | Psychic number (1-9) |
| bhagyank | number | Destiny number |
| personalYear | number | Current personal year (1-9) |
| kuaMale | number | Male Kua number |
| kuaFemale | number | Female Kua number |
| masterNumber | number/null | Master number if present (11/22/33) |
| karmicDebt | number/null | Karmic debt if present (13/14/16/19) |
| gridCount | object | Count of each number in birth date |
| missing_nums | array | Numbers missing from birth date |
| repeat_nums | array | Repeated numbers with counts |

---

## Running the Server

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. The server will run on `http://localhost:4000`

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 4000 | Server port |
| API_KEY | astro-api-key-2024 | API authentication key |
| FRONTEND_URL | http://localhost:5173 | CORS allowed origin |

---

## Technical Notes

- **Ayanamsa:** Lahiri (Chitrapaksha) sidereal system
- **Dasha System:** Vimshottari (120-year cycle)
- **Yogas:** Based on BPHS (Brihat Parashara Hora Shastra) rules
- **Numerology:** Cheiro/Vedic system with Lo Shu Grid integration
- **Calculations:** All astronomical calculations performed locally (no external APIs)
