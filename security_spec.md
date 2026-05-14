# Grama-Yatri Security Specification

## 1. Data Invariants
- A `Ping` must belong to a valid `routeId` and `stopId`.
- The `userId` in a `Ping` or `Alert` must match the authenticated user.
- Timestamps must be server-generated (`request.time`).
- Routes are immutable by standard users; only the registered admin (`anaghasringeshwar@gmail.com`) can modify them.

## 2. The "Dirty Dozen" Payloads (Denial Tests)

| Target | Payload | Intent | Expectation |
| :--- | :--- | :--- | :--- |
| `routes` | `{ "name": "Hack", "stops": [] }` | Non-admin write | PERMISSION_DENIED |
| `pings` | `{ "routeId": "r1", "stopId": "s1", "userId": "ATTACKER", ... }` | Identity Spoofing | PERMISSION_DENIED |
| `pings` | `{ "routeId": "r1", "stopId": "s1", "timestamp": "2020-01-01...", ... }` | Client Timestamp | PERMISSION_DENIED |
| `pings` | `{ "routeId": "INVALID_ID!!!", ... }` | ID Poisoning | PERMISSION_DENIED |
| `alerts` | `{ "type": "god_mode", "message": "...", ... }` | Invalid Enum Type | PERMISSION_DENIED |
| `alerts` | `{ "message": "A".repeat(1000), ... }` | Large Payload (DoS) | PERMISSION_DENIED |
| `routes` | `delete /routes/r1` | Unauthorized Deletion | PERMISSION_DENIED |
| `pings` | `update /pings/p1` | Immutable Ping Edit | PERMISSION_DENIED |

## 3. conflict_report.md
| Feature | Protection | Result |
| :--- | :--- | :--- |
| Identity Spoofing | `incoming().userId == request.auth.uid` | PASS |
| Resource Poisoning | `isValidId()` + `.size()` checks | PASS |
| State Shortcutting | Immutability on pings/alerts | PASS |
| PII Data | No PII stored, only display names | PASS |
