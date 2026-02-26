
-- Fix products SELECT policy: drop restrictive, create permissive
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  USING (true);

-- Fix categories SELECT policy
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
CREATE POLICY "Anyone can view categories"
  ON public.categories FOR SELECT
  USING (true);

-- Fix product_images SELECT policy
DROP POLICY IF EXISTS "Anyone can view product images" ON public.product_images;
CREATE POLICY "Anyone can view product images"
  ON public.product_images FOR SELECT
  USING (true);

-- Fix product_variants SELECT policy
DROP POLICY IF EXISTS "Anyone can view product variants" ON public.product_variants;
CREATE POLICY "Anyone can view product variants"
  ON public.product_variants FOR SELECT
  USING (true);

-- Fix promo_codes SELECT policy
DROP POLICY IF EXISTS "Anyone can view active promo codes" ON public.promo_codes;
CREATE POLICY "Anyone can view active promo codes"
  ON public.promo_codes FOR SELECT
  USING (is_active = true);
