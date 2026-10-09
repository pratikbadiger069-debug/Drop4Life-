# Drop4Life — Product Specification

> **Platform Name:** Drop4Life  
> **Tagline:** Every Drop Can Save a Life.  
> **Document Version:** 1.0 (Phase 0/1 Baseline)  

---

## 1. Vision & Core Value Proposition
Drop4Life is a centralized, mission-critical blood donation and emergency blood coordination platform connecting three primary ecosystem roles:
1. **Donors:** Citizens registering to donate blood, tracking donation milestones, managing availability, and responding to urgent matching requests.
2. **Hospitals:** Healthcare providers managing blood inventories, issuing critical and emergency blood requisitions, and tracking compatible donor responses.
3. **NGOs & Blood Banks:** Non-governmental organizations coordinating community blood drives, mobilizing volunteers, and partnering with regional hospitals.

---

## 2. Core Functional Pillars

### 2.1 Public & Informational Services
- **ABO/Rh Blood Compatibility Explorer:** Deterministic matrix covering all 8 blood groups (`O-`, `O+`, `A-`, `A+`, `B-`, `B+`, `AB-`, `AB+`) with clinical disclaimers.
- **Find Blood & Hospital Directory:** Geographic and status-based search for participating medical centers and open requests with privacy protection (donor exact locations are never exposed).
- **Public Awareness & Emergency Escalation:** Real-time visibility into high-urgency blood needs across regions.

### 2.2 Role-Specific Experience
- **Donor Portal (`/donor/*`):**
  - Next donation eligibility countdown (90-day guideline).
  - Incoming request alerts with Accept/Decline actions.
  - Verified donation history logbook and impact summary.
  - Privacy controls and availability status toggle.
- **Hospital Portal (`/hospital/*`):**
  - Emergency blood request creator with priority tiers (`CRITICAL`, `EMERGENCY`, `URGENT`, `NORMAL`).
  - Real-time donor matching radar and candidate ranking.
  - 8-group live blood inventory tracker with low-stock threshold triggers.
  - Request fulfillment and transfusion coordination lifecycle.
- **NGO Portal (`/ngo/*`):**
  - Campaign creator and target unit tracker.
  - Public blood drive schedule with location coordinates and hospital partners.
  - Consented donor mobilization and volunteer management.

---

## 3. Strict Safety & Ethical Rules
1. **Clinical Disclaimer:** Compatibility tools are informational and do not supersede clinical crossmatching, pre-transfusion screening, or certified blood bank testing.
2. **Privacy Guard:** Public search never displays donor personal phone numbers, emails, or exact street addresses.
3. **Fulfillment Integrity:** A request is not marked `FULFILLED` simply upon a donor clicking "Accept"; it requires confirmed hospital verification.
