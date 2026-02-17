# GoatGraphs Database Schema

## Enums

### `app_role`
| Value | Description |
|-------|-------------|
| `admin` | Full admin access |
| `moderator` | Moderator access |
| `user` | Default user role |

### `category_type`
| Value | Description |
|-------|-------------|
| `team` | Football club |
| `league` | Competition/league |
| `country` | National team |
| `season` | Season year |
| `jersey_type` | Jersey variant type |

### `order_status`
| Value | Description |
|-------|-------------|
| `pending` | Order placed, awaiting confirmation |
| `confirmed` | Order confirmed |
| `processing` | Being prepared |
| `shipped` | In transit |
| `delivered` | Successfully delivered |
| `cancelled` | Order cancelled |

---

## Tables

### `profiles`
Stores user profile data. Auto-created via trigger on signup.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NO | — | PK, FK → auth.users(id) ON DELETE CASCADE |
| `full_name` | text | YES | — | |
| `phone` | text | YES | — | |
| `avatar_url` | text | YES | — | |
| `created_at` | timestamptz | NO | now() | |
| `updated_at` | timestamptz | NO | now() | Auto-updated via trigger |

**RLS**: Users can SELECT/UPDATE/INSERT own row only (`auth.uid() = id`).

---

### `user_roles`
Maps users to application roles. Managed by admins only.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `user_id` | uuid | NO | — | FK → auth.users(id) ON DELETE CASCADE |
| `role` | app_role | NO | — | |

**Constraints**: UNIQUE(user_id, role)
**RLS**: Admins can view all; users can view own roles.

---

### `addresses`
User shipping addresses.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `user_id` | uuid | NO | — | FK → auth.users(id) ON DELETE CASCADE |
| `label` | text | YES | 'Home' | e.g. "Home", "Work" |
| `full_name` | text | NO | — | |
| `phone` | text | YES | — | |
| `address_line1` | text | NO | — | |
| `address_line2` | text | YES | — | |
| `city` | text | NO | — | |
| `state` | text | YES | — | |
| `postal_code` | text | NO | — | |
| `country` | text | NO | 'US' | |
| `is_default` | boolean | NO | false | |
| `created_at` | timestamptz | NO | now() | |

**RLS**: Users CRUD own rows only (`auth.uid() = user_id`).

---

### `categories`
Hierarchical categories for teams, leagues, countries, seasons, jersey types.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `name` | text | NO | — | |
| `slug` | text | NO | — | UNIQUE |
| `type` | category_type | NO | — | |
| `parent_id` | uuid | YES | — | Self-FK for hierarchy |
| `image_url` | text | YES | — | |
| `created_at` | timestamptz | NO | now() | |

**RLS**: Public SELECT; admin-only INSERT/UPDATE/DELETE.

---

### `products`
Main product catalog.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `title` | text | NO | — | |
| `slug` | text | NO | — | UNIQUE |
| `description` | text | YES | — | |
| `price` | numeric | NO | 0 | Base price |
| `sale_price` | numeric | YES | — | Discounted price (null = no sale) |
| `is_featured` | boolean | NO | false | Show in "Trending" |
| `is_active` | boolean | NO | true | Visible in shop |
| `team_id` | uuid | YES | — | FK → categories(id) |
| `league_id` | uuid | YES | — | FK → categories(id) |
| `season_id` | uuid | YES | — | FK → categories(id) |
| `jersey_type_id` | uuid | YES | — | FK → categories(id) |
| `country_id` | uuid | YES | — | FK → categories(id) |
| `meta_title` | text | YES | — | SEO |
| `meta_description` | text | YES | — | SEO |
| `created_at` | timestamptz | NO | now() | |
| `updated_at` | timestamptz | NO | now() | Auto-updated via trigger |

**RLS**: Public SELECT; admin-only INSERT/UPDATE/DELETE.

---

### `product_images`
Multiple images per product, ordered by position.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `product_id` | uuid | NO | — | FK → products(id) ON DELETE CASCADE |
| `url` | text | NO | — | |
| `alt_text` | text | YES | — | |
| `position` | int | NO | 0 | Display order |

**RLS**: Public SELECT; admin-only INSERT/UPDATE/DELETE.

---

### `product_variants`
Size/stock variants per product.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `product_id` | uuid | NO | — | FK → products(id) ON DELETE CASCADE |
| `size` | text | NO | — | S, M, L, XL, XXL |
| `stock` | int | NO | 0 | Available inventory |
| `sku` | text | NO | — | UNIQUE |

**RLS**: Public SELECT; admin-only INSERT/UPDATE/DELETE.

---

### `carts`
One cart per user.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `user_id` | uuid | NO | — | FK → auth.users(id) ON DELETE CASCADE, UNIQUE |
| `created_at` | timestamptz | NO | now() | |
| `updated_at` | timestamptz | NO | now() | Auto-updated via trigger |

**RLS**: Users CRUD own cart only (`auth.uid() = user_id`).

---

### `cart_items`
Items inside a cart, linked to product variants.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `cart_id` | uuid | NO | — | FK → carts(id) ON DELETE CASCADE |
| `variant_id` | uuid | NO | — | FK → product_variants(id) |
| `quantity` | int | NO | 1 | |
| `price_snapshot` | numeric | NO | — | Price at time of adding |

**Constraints**: UNIQUE(cart_id, variant_id)
**RLS**: Users CRUD own cart items (via cart ownership check).

---

### `orders`
Completed orders.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `user_id` | uuid | NO | — | FK → auth.users(id) |
| `status` | order_status | NO | 'pending' | |
| `subtotal` | numeric | NO | 0 | |
| `shipping_cost` | numeric | NO | 0 | |
| `discount` | numeric | NO | 0 | |
| `total` | numeric | NO | 0 | |
| `payment_method` | text | NO | 'cod' | 'cod' or 'card' |
| `shipping_method` | text | NO | 'standard' | 'standard' or 'express' |
| `address_snapshot` | jsonb | NO | '{}' | Full address at time of order |
| `promo_code_used` | text | YES | — | |
| `created_at` | timestamptz | NO | now() | |
| `updated_at` | timestamptz | NO | now() | Auto-updated via trigger |

**RLS**: Users SELECT own orders; admins SELECT all + UPDATE status.

---

### `order_items`
Line items within an order.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `order_id` | uuid | NO | — | FK → orders(id) ON DELETE CASCADE |
| `product_id` | uuid | NO | — | FK → products(id) |
| `variant_id` | uuid | NO | — | FK → product_variants(id) |
| `product_title` | text | NO | — | Snapshot |
| `size` | text | NO | — | Snapshot |
| `quantity` | int | NO | — | |
| `price_snapshot` | numeric | NO | — | Price at time of order |

**RLS**: Users SELECT own order items; admins SELECT all.

---

### `promo_codes`
Discount codes.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NO | gen_random_uuid() | PK |
| `code` | text | NO | — | UNIQUE |
| `type` | text | NO | 'percentage' | 'percentage' or 'fixed' |
| `value` | numeric | NO | 0 | % amount or $ amount |
| `min_order` | numeric | YES | — | Minimum order value |
| `is_active` | boolean | NO | true | |
| `expires_at` | timestamptz | YES | — | |
| `created_at` | timestamptz | NO | now() | |

**RLS**: Public SELECT (active only); admin-only write.

---

## Security Functions

### `has_role(_user_id uuid, _role app_role) → boolean`
Security definer function that checks if a user has a specific role. Used in all admin RLS policies to avoid infinite recursion.

---

## Triggers

| Trigger | Table | Function | Description |
|---------|-------|----------|-------------|
| `update_profiles_updated_at` | profiles | `update_updated_at_column()` | Auto-set updated_at |
| `update_products_updated_at` | products | `update_updated_at_column()` | Auto-set updated_at |
| `update_carts_updated_at` | carts | `update_updated_at_column()` | Auto-set updated_at |
| `update_orders_updated_at` | orders | `update_updated_at_column()` | Auto-set updated_at |
| `on_auth_user_created` | auth.users | `handle_new_user()` | Auto-create profile on signup |

---

## Storage Buckets

### `product-images` (public)
Stores product photos uploaded via admin panel.

**RLS**:
- Public: SELECT (anyone can view)
- Authenticated + admin role: INSERT/UPDATE/DELETE

---

## Entity Relationship Diagram

```
auth.users ──┬── profiles (1:1)
             ├── user_roles (1:N)
             ├── addresses (1:N)
             ├── carts (1:1) ── cart_items (1:N) ── product_variants
             └── orders (1:N) ── order_items (1:N) ── products
                                                    └── product_variants

categories (self-referencing via parent_id)
  ├── products.team_id
  ├── products.league_id
  ├── products.season_id
  ├── products.jersey_type_id
  └── products.country_id

products ──┬── product_images (1:N)
           └── product_variants (1:N)
```

---

## Sample Promo Codes

| Code | Type | Value | Min Order |
|------|------|-------|-----------|
| WELCOME10 | percentage | 10% | $50 |
| GOAT20 | percentage | 20% | $100 |
| FLAT15 | fixed | $15 | $75 |
| JERSEY25 | percentage | 25% | $150 |
