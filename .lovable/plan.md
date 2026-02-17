

# GoatGraphs - Football Jerseys E-Commerce Store

## Overview
A full-featured, production-ready football jerseys e-commerce store inspired by the clean, premium aesthetic of MWS (MatchWornShirt). The store will be built with React + TypeScript + Tailwind CSS, fully connected to Supabase for authentication, database, and storage.

## Design System

- **Background**: White (#FFFFFF)
- **Text**: Near-black (#0B0B0B)
- **Muted text**: Gray (#6B7280)
- **Borders**: Light gray (#E5E7EB)
- **Section backgrounds**: Off-white (#F7F7F8)
- **Primary accent**: Deep blue (#0A2FFF) -- used for buttons, links, and interactive elements
- **Typography**: Bold headings, generous whitespace, clean sans-serif (Inter via Google Fonts)

## Database Schema (Supabase Migrations)

### Phase 1 -- Core Tables

```text
profiles
  id (uuid, PK, FK -> auth.users.id, ON DELETE CASCADE)
  full_name (text)
  phone (text)
  avatar_url (text)
  created_at, updated_at

user_roles
  id (uuid, PK)
  user_id (uuid, FK -> auth.users.id, ON DELETE CASCADE)
  role (app_role enum: admin, moderator, user)
  UNIQUE(user_id, role)

addresses
  id (uuid, PK)
  user_id (uuid, FK -> auth.users.id, ON DELETE CASCADE)
  label (text, e.g. "Home", "Work")
  full_name, phone, address_line1, address_line2,
  city, state, postal_code, country
  is_default (boolean, default false)
  created_at

categories
  id (uuid, PK)
  name (text)
  slug (text, unique)
  type (category_type enum: team, league, country, season, jersey_type)
  parent_id (uuid, nullable, self-FK for hierarchy)
  image_url (text)
  created_at

products
  id (uuid, PK)
  title (text)
  slug (text, unique)
  description (text)
  price (numeric)
  sale_price (numeric, nullable)
  is_featured (boolean, default false)
  is_active (boolean, default true)
  team_id (uuid, FK -> categories, nullable)
  league_id (uuid, FK -> categories, nullable)
  season_id (uuid, FK -> categories, nullable)
  jersey_type_id (uuid, FK -> categories, nullable)
  country_id (uuid, FK -> categories, nullable)
  meta_title (text), meta_description (text)
  created_at, updated_at

product_images
  id (uuid, PK)
  product_id (uuid, FK -> products, ON DELETE CASCADE)
  url (text)
  alt_text (text)
  position (int, default 0)

product_variants
  id (uuid, PK)
  product_id (uuid, FK -> products, ON DELETE CASCADE)
  size (text -- S, M, L, XL, XXL)
  stock (int, default 0)
  sku (text, unique)

carts
  id (uuid, PK)
  user_id (uuid, FK -> auth.users.id, ON DELETE CASCADE, unique)
  created_at, updated_at

cart_items
  id (uuid, PK)
  cart_id (uuid, FK -> carts, ON DELETE CASCADE)
  variant_id (uuid, FK -> product_variants)
  quantity (int, default 1)
  price_snapshot (numeric)
  UNIQUE(cart_id, variant_id)

orders
  id (uuid, PK)
  user_id (uuid, FK -> auth.users.id)
  status (order_status enum: pending, confirmed, processing,
          shipped, delivered, cancelled)
  subtotal, shipping_cost, discount, total (numeric)
  payment_method (text -- cod, card)
  shipping_method (text -- standard, express)
  address_snapshot (jsonb)
  promo_code_used (text, nullable)
  created_at, updated_at

order_items
  id (uuid, PK)
  order_id (uuid, FK -> orders, ON DELETE CASCADE)
  product_id (uuid, FK -> products)
  variant_id (uuid, FK -> product_variants)
  product_title (text)
  size (text)
  quantity (int)
  price_snapshot (numeric)

promo_codes
  id (uuid, PK)
  code (text, unique)
  type (text -- percentage, fixed)
  value (numeric)
  min_order (numeric, nullable)
  is_active (boolean, default true)
  expires_at (timestamptz, nullable)
  created_at
```

### RLS Policies Summary

- **products, categories, product_images, product_variants**: Public SELECT; admin-only INSERT/UPDATE/DELETE via `has_role()` security definer function
- **profiles**: Users SELECT/UPDATE own row only
- **addresses**: Users CRUD own rows only
- **carts, cart_items**: Users CRUD own cart only
- **orders, order_items**: Users SELECT own orders; admin SELECT all; only system/admin UPDATE status
- **promo_codes**: Public SELECT active codes; admin-only write
- **user_roles**: Admin SELECT all; no public write (managed via admin or triggers)

### Storage

- Create a `product-images` public bucket for product photos
- RLS: Public read; admin-only upload/delete

## Application Architecture

### Routing Structure

```text
/                          Home
/shop                      All Jerseys (grid + filters)
/shop/team/:slug           By Team
/shop/league/:slug         By League
/shop/country/:slug        By Country
/shop/season/:slug         By Season
/shop/type/:slug           By Type (Home/Away/Third...)
/product/:slug             Product Detail
/cart                      Cart
/checkout                  Checkout (auth-gated)
/order-success/:id         Order Confirmation
/about                     About
/faq                       FAQ
/shipping-returns           Shipping & Returns
/contact                   Contact
/auth                      Login / Signup / Forgot Password
/account                   My Account Dashboard
/account/profile           Profile + Addresses
/account/orders            My Orders
/account/orders/:id        Order Detail + Tracking
/admin                     Admin Dashboard (role-gated)
/admin/products            CRUD Products
/admin/products/new        New Product Form
/admin/products/:id/edit   Edit Product
/admin/categories          CRUD Categories
/admin/orders              Orders Management
/admin/promo-codes         Promo Codes Management
/admin/inventory           Stock Management
```

### Key Components

```text
Layout/
  Header          -- Sticky top bar: logo, search, cart icon, user menu
  MegaMenu        -- Category navigation with highlights (MWS-style)
  Footer          -- Links, newsletter, socials
  MobileNav       -- Hamburger slide-out menu

Home/
  HeroCarousel    -- Full-width hero slider
  TrendingGrid    -- "Trending Jerseys" product card grid
  CategoryShowcase -- Featured categories with images
  NewsletterCTA   -- Email signup banner

Shop/
  ProductGrid     -- Responsive grid of ProductCards
  FilterSidebar   -- Collapsible filters (team, league, size, price, etc.)
  SortDropdown    -- Sort options
  Pagination      -- Page-based navigation

Product/
  ImageGallery    -- Main image + thumbnails
  ProductInfo     -- Title, price, tags, size selector, quantity, add-to-cart
  ProductTabs     -- Description, Details, Shipping info (accordion/tabs)
  RelatedProducts -- Horizontal scroll of related items

Cart/
  CartItemList    -- Items with qty controls, remove, price
  CartSummary     -- Subtotal, promo code input, proceed to checkout

Checkout/
  AddressForm     -- Shipping address (saved addresses for logged-in)
  ShippingMethod  -- Standard / Express radio
  PaymentMethod   -- COD / Card (placeholder) radio
  OrderSummary    -- Final review before placing order

Auth/
  AuthForm        -- Login, Signup, Forgot Password tabs/views

Account/
  AccountSidebar  -- Navigation for profile sections
  ProfileForm     -- Edit name, phone, avatar
  AddressManager  -- CRUD addresses
  OrdersList      -- Table of past orders
  OrderDetail     -- Full order info + status timeline

Admin/
  AdminLayout     -- Sidebar nav + content area
  ProductForm     -- Create/edit product with image upload
  CategoryManager -- CRUD categories by type
  OrdersTable     -- All orders with status update controls
  PromoManager    -- CRUD promo codes
  InventoryView   -- Product variants stock management
```

### Key Features Implementation

**Authentication**
- Supabase email/password auth
- Auto-create profile via DB trigger on signup
- Protected routes via AuthGuard component
- AdminGuard using `has_role()` check

**Cart System**
- Guest users: cart stored in localStorage
- Logged-in users: cart stored in Supabase `carts` + `cart_items`
- On login: merge localStorage cart into DB cart
- React Context for cart state management

**Checkout Flow**
- Auth-gated (redirect to login if not authenticated)
- Multi-step: Address -> Shipping -> Payment -> Review -> Place Order
- Creates order + order_items records in Supabase
- Clears cart on success
- Redirects to order success page

**Search**
- Client-side search input in header
- Searches products by title using Supabase `ilike` query
- Results dropdown with quick navigation

**Admin**
- Role-based access using `user_roles` table
- Product management with image upload to Supabase Storage
- Order status management with dropdown updates
- Category CRUD organized by type

**SEO**
- Dynamic document.title and meta tags per page
- Slug-based clean URLs for products and categories
- robots.txt already present; sitemap can be static

## Implementation Sequence

1. **Database**: Run all SQL migrations (enums, tables, RLS, triggers, storage bucket, security definer functions)
2. **Auth**: Signup/Login/Forgot Password pages, AuthContext, profile auto-creation trigger
3. **Layout**: Header with search + mega menu, Footer, MobileNav
4. **Categories + Products**: Shop page with filters/sort/pagination, category pages
5. **Product Detail**: Image gallery, variants, related products
6. **Cart**: Context, localStorage for guests, DB for users, merge logic
7. **Checkout + Orders**: Address form, payment selection, order creation, success page
8. **Account**: Profile, addresses, order history
9. **Admin**: Dashboard, product CRUD with image upload, categories, orders, promos, inventory
10. **Static Pages**: About, FAQ, Shipping & Returns, Contact
11. **Polish**: Responsive tweaks, loading states, error handling, SEO meta tags

## Technical Details

- **State management**: React Context for auth and cart; TanStack Query for server data
- **Forms**: react-hook-form + zod validation
- **Image uploads**: Supabase Storage `product-images` bucket via admin panel
- **Styling**: Tailwind CSS with custom CSS variables matching the design system
- **Components**: shadcn/ui components (already installed) for dialogs, forms, toasts, etc.
- **Routing**: react-router-dom v6 with nested layouts

