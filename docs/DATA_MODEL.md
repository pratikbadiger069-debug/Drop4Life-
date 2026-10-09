# Drop4Life — Data Model & Schema Specification

> **Platform Name:** Drop4Life  
> **Tagline:** Every Drop Can Save a Life.  
> **Document Version:** 1.0 (Phase 3 Baseline)  

---

## 1. Core Authentication & Identity Entities

### 1.1 `users`
Represents the base identity for all authenticated participants.
- `id` (UUID, Primary Key)
- `email` (String, Unique, Indexed)
- `role` (Enum: `'donor' | 'hospital' | 'ngo' | 'admin'`)
- `status` (Enum: `'active' | 'pending_verification' | 'suspended'`)
- `created_at` (Timestamp with timezone)
- `updated_at` (Timestamp with timezone)

---

## 2. Role-Specific Profile Entities

### 2.1 `donor_profiles`
Associated 1-to-1 with `users` having `role = 'donor'`.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key -> `users.id`, Unique)
- `full_name` (String, Required)
- `blood_group` (Enum: `'O-' | 'O+' | 'A-' | 'A+' | 'B-' | 'B+' | 'AB-' | 'AB+'`)
- `phone` (String, Optional/Private)
- `city` (String, Required)
- `latitude` (Float, Optional approximate)
- `longitude` (Float, Optional approximate)
- `is_available` (Boolean, Default: `true`)
- `last_donated_at` (Timestamp, Optional)
- `privacy_level` (Enum: `'approximate' | 'hidden'`, Default: `'approximate'`)

### 2.2 `hospital_profiles`
Associated 1-to-1 with `users` having `role = 'hospital'`.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key -> `users.id`, Unique)
- `hospital_name` (String, Required)
- `license_number` (String, Required)
- `department` (String, Required)
- `contact_person` (String, Required)
- `work_email` (String, Required)
- `phone` (String, Required)
- `emergency_phone` (String, Optional)
- `address` (Text, Required)
- `city` (String, Required)
- `verification_status` (Enum: `'pending' | 'verified' | 'rejected'`, Default: `'pending'`)

### 2.3 `ngo_profiles`
Associated 1-to-1 with `users` having `role = 'ngo'`.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key -> `users.id`, Unique)
- `organization_name` (String, Required)
- `registration_id` (String, Required)
- `contact_person` (String, Required)
- `email` (String, Required)
- `phone` (String, Required)
- `city` (String, Required)
- `coverage_area` (String, Required)
- `description` (Text, Optional)
- `verification_status` (Enum: `'pending' | 'verified' | 'rejected'`, Default: `'pending'`)
