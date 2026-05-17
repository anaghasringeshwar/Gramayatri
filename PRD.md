# Product Requirement Document (PRD): Grama-Yatri

## 1. Executive Summary
**Project Name:** Grama-Yatri  
**Version:** 1.0  
**Domain:** Rural Transportation & Community Transit  

Grama-Yatri is a community-driven bus tracking application designed to solve the problem of unreliable bus timings in rural areas. By leveraging crowdsourced "pings" from passengers currently on the bus, the app provides real-time location data and estimated time of arrival (ETA) for other commuters waiting at stops.

---

## 2. Problem Statement
In rural India (Gramas), public transport (buses) is the primary mode of travel. However:
- Fixed schedules are rarely followed or updated.
- Digital maps often lack granular data for village routes.
- Commuters spend 30-60 minutes waiting at stops due to lack of information.
- There is no official real-time GPS tracking for most secondary-route buses.

---

## 3. Target Audience
- **Waiters:** Commuters at bus stops looking for bus locations.
- **Riders:** Passengers already on the bus who act as "contributors" by updating the bus position.
- **Local Authorities:** Stakeholders looking to understand transit frequency in specific regions.

---

## 4. Key Features

### 4.1. Crowdsourced Tracking (The "Ping" System)
- Users on a bus can click a "I'm on this bus" button.
- The app sends a "Ping" containing GPS coordinates and timestamps to Firestore.
- Data is visualized as a moving bus icon on the map for all other users.

### 4.2. Live Route Visualization
- High-fidelity map rendering using Google Maps API.
- Pre-defined routes with color-coded paths.
- Stop markers indicating official boarding points.

### 4.3. Real-time ETA & Alerts
- Automatic calculation of distance between the last "Ping" and the user's nearest stop.
- Dynamic ETA updates based on average travel speeds.
- Status alerts (e.g., "Bus has left the previous stop").

### 4.4. Google Identity Integration
- Secure sign-in via Firebase Authentication.
- Contributor profiles to maintain data integrity and community trust.

---

## 5. Technical Stack
- **Frontend:** React 18 with TypeScript.
- **Styling:** Tailwind CSS (Modern, Responsive UI).
- **Backend/Database:** Firebase Firestore (Real-time NoSQL).
- **Auth:** Firebase Google Auth.
- **Mapping:** Google Maps Platform API.
- **Mobile Integration:** Capacitor (Cross-platform compatibility).
- **Animations:** Framer Motion.

---

## 6. User Flow

1. **Onboarding:** User logs in via Google -> Grants Location Permission.
2. **Browsing:** User selects a Route -> Views live bus positions and ETAs.
3. **Contributing:** User boards a bus -> Clicks "Ping Location" -> Map updates for everyone.
4. **Alerts:** User receives notification when bus is within 2km.

---

## 7. Success Metrics
- **Wait-Time Reduction:** Targeted 40% reduction in average wait time.
- **Engagement:** Number of active pings per route per day.
- **Accuracy:** Correlation between user-reported ETAs and actual arrival.

---

## 8. Future Roadmap
- **Offline Support:** Caching route data for low-connectivity zones.
- **Predictive AI:** Using historical ping data to predict timings even when no one is active.
- **Emergency SOS:** Features for safety during night travel.
