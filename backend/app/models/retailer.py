"""
Retailer boundary.

No separate `retailers` table exists. A retailer is simply a User
with role=UserRole.retailer (see app/models/user.py). This file is
kept intentionally empty as a boundary marker in case retailer-specific
fields are needed later (e.g. business_name, tax_id) — if so, add a
one-to-one `Retailer` table here the same way Rider extends User.
"""
