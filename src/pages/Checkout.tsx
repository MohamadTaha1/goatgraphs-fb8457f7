import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Home, MapPin, Truck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

type AddressForm = {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
};

const EMPTY_ADDRESS: AddressForm = {
  full_name: "",
  phone: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "US",
};

export default function Checkout() {
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [saveAddressForFuture, setSaveAddressForFuture] = useState(false);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState<string>("");
  const [address, setAddress] = useState<AddressForm>(EMPTY_ADDRESS);

  const shippingCost = shippingMethod === "express" ? 15 : total >= 150 ? 0 : 9.99;
  const finalTotal = Math.max(0, total - discount + shippingCost);

  const requiredFieldsMissing = useMemo(() => {
    return !address.full_name || !address.address_line1 || !address.city || !address.postal_code || !address.country;
  }, [address]);

  const loadAddresses = () => {
    if (!user) return;
    supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const list = data || [];
        setAddresses(list);
        if (!list.length) return;
        const defaultAddress = list.find(addr => addr.is_default) || list[0];
        setSelectedAddressId(defaultAddress.id);
        setAddress({
          full_name: defaultAddress.full_name || "",
          phone: defaultAddress.phone || "",
          address_line1: defaultAddress.address_line1 || "",
          address_line2: defaultAddress.address_line2 || "",
          city: defaultAddress.city || "",
          state: defaultAddress.state || "",
          postal_code: defaultAddress.postal_code || "",
          country: defaultAddress.country || "US",
        });
      });
  };

  useEffect(() => {
    document.title = "Checkout - GoatGraphs";
    loadAddresses();
  }, [user]);

  useEffect(() => {
    if (items.length === 0) navigate("/cart", { replace: true });
  }, [items.length, navigate]);

  const applyPromo = async () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      toast({ title: "Enter a promo code", variant: "destructive" });
      return;
    }

    const { data } = await supabase.from("promo_codes").select("*").eq("code", code).eq("is_active", true).single();
    if (!data) {
      toast({ title: "Invalid promo code", variant: "destructive" });
      return;
    }
    if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
      toast({ title: "This promo code has expired", variant: "destructive" });
      return;
    }
    if (data.min_order && total < Number(data.min_order)) {
      toast({ title: `Minimum order is $${Number(data.min_order).toFixed(2)}`, variant: "destructive" });
      return;
    }

    const rawDiscount = data.type === "percentage" ? total * (Number(data.value) / 100) : Number(data.value);
    const safeDiscount = Math.min(total, rawDiscount);
    setDiscount(safeDiscount);
    setPromoApplied(code);
    toast({ title: "Promo applied", description: `Saved $${safeDiscount.toFixed(2)}` });
  };

  const saveAddressIfNeeded = async () => {
    if (!user || !saveAddressForFuture) return;
    setSavingAddress(true);
    const payload = {
      user_id: user.id,
      full_name: address.full_name,
      phone: address.phone || null,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || null,
      city: address.city,
      state: address.state || null,
      postal_code: address.postal_code,
      country: address.country,
      label: "Checkout",
    };

    if (selectedAddressId) {
      await supabase.from("addresses").update(payload).eq("id", selectedAddressId);
    } else {
      await supabase.from("addresses").insert(payload);
    }
    setSavingAddress(false);
    loadAddresses();
  };

  const placeOrder = async () => {
    if (!user || items.length === 0 || requiredFieldsMissing) return;
    if (paymentMethod === "card") {
      toast({ title: "Card checkout is not live yet", description: "Please use cash on delivery right now." });
      return;
    }

    setLoading(true);
    await saveAddressIfNeeded();

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        subtotal: total,
        shipping_cost: shippingCost,
        discount,
        total: finalTotal,
        payment_method: paymentMethod,
        shipping_method: shippingMethod,
        address_snapshot: address,
        promo_code_used: promoApplied || null,
      })
      .select("id")
      .single();

    if (error || !order) {
      toast({ title: "Error placing order", description: error?.message || "Unknown error", variant: "destructive" });
      setLoading(false);
      return;
    }

    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      variant_id: item.variantId,
      product_title: item.title,
      size: item.size,
      quantity: item.quantity,
      price_snapshot: item.price,
    }));
    await supabase.from("order_items").insert(orderItems);
    await clearCart();
    navigate(`/order-success/${order.id}`);
  };

  const addressCards = addresses.length > 0 && (
    <div className="mb-4 grid gap-2 sm:grid-cols-2">
      {addresses.map(addr => (
        <button
          key={addr.id}
          type="button"
          onClick={() => {
            setSelectedAddressId(addr.id);
            setAddress({
              full_name: addr.full_name || "",
              phone: addr.phone || "",
              address_line1: addr.address_line1 || "",
              address_line2: addr.address_line2 || "",
              city: addr.city || "",
              state: addr.state || "",
              postal_code: addr.postal_code || "",
              country: addr.country || "US",
            });
          }}
          className={`rounded-xl border p-3 text-left transition-colors ${selectedAddressId === addr.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}
        >
          <p className="text-sm font-semibold">{addr.full_name}</p>
          <p className="mt-1 text-xs text-muted-foreground">{addr.address_line1}, {addr.city}</p>
        </button>
      ))}
      <button
        type="button"
        onClick={() => {
          setSelectedAddressId("");
          setAddress(EMPTY_ADDRESS);
        }}
        className={`rounded-xl border p-3 text-left transition-colors ${selectedAddressId === "" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}
      >
        <p className="text-sm font-semibold">Use a new address</p>
        <p className="mt-1 text-xs text-muted-foreground">Enter details manually.</p>
      </button>
    </div>
  );

  return (
    <div className="container py-8 md:py-10">
      <h1 className="display-title mb-6 text-3xl sm:text-4xl">Checkout</h1>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_370px]">
        <div className="space-y-6">
          <section className="soft-panel p-5 sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <Home className="h-4 w-4 text-primary" />
              Shipping Address
            </h2>
            {addressCards}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Full Name</Label>
                <Input value={address.full_name} onChange={e => setAddress(prev => ({ ...prev, full_name: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <Label>Phone</Label>
                <Input value={address.phone} onChange={e => setAddress(prev => ({ ...prev, phone: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <Label>Address Line 1</Label>
                <Input value={address.address_line1} onChange={e => setAddress(prev => ({ ...prev, address_line1: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <Label>Address Line 2</Label>
                <Input value={address.address_line2} onChange={e => setAddress(prev => ({ ...prev, address_line2: e.target.value }))} />
              </div>
              <div>
                <Label>City</Label>
                <Input value={address.city} onChange={e => setAddress(prev => ({ ...prev, city: e.target.value }))} />
              </div>
              <div>
                <Label>State</Label>
                <Input value={address.state} onChange={e => setAddress(prev => ({ ...prev, state: e.target.value }))} />
              </div>
              <div>
                <Label>Postal Code</Label>
                <Input value={address.postal_code} onChange={e => setAddress(prev => ({ ...prev, postal_code: e.target.value }))} />
              </div>
              <div>
                <Label>Country</Label>
                <Input value={address.country} onChange={e => setAddress(prev => ({ ...prev, country: e.target.value }))} />
              </div>
            </div>

            <label className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox checked={saveAddressForFuture} onCheckedChange={value => setSaveAddressForFuture(Boolean(value))} />
              Save this address for future checkout
            </label>
          </section>

          <section className="soft-panel p-5 sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <Truck className="h-4 w-4 text-primary" />
              Shipping Method
            </h2>
            <RadioGroup value={shippingMethod} onValueChange={setShippingMethod} className="space-y-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3">
                <RadioGroupItem value="standard" />
                <div>
                  <p className="text-sm font-semibold">Standard (5-7 days)</p>
                  <p className="text-xs text-muted-foreground">{total >= 150 ? "Free" : "$9.99"}</p>
                </div>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3">
                <RadioGroupItem value="express" />
                <div>
                  <p className="text-sm font-semibold">Express (2-3 days)</p>
                  <p className="text-xs text-muted-foreground">$15.00</p>
                </div>
              </label>
            </RadioGroup>
          </section>

          <section className="soft-panel p-5 sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <CreditCard className="h-4 w-4 text-primary" />
              Payment Method
            </h2>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3">
                <RadioGroupItem value="cod" />
                <p className="text-sm font-semibold">Cash on Delivery</p>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3">
                <RadioGroupItem value="card" />
                <p className="text-sm font-semibold">Card (planned)</p>
              </label>
            </RadioGroup>
          </section>
        </div>

        <aside className="soft-panel h-fit p-5 sm:p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold">Order Summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            {items.map(item => (
              <div key={item.variantId} className="flex justify-between gap-3">
                <span className="truncate text-muted-foreground">{item.title} ({item.size}) x{item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <Input placeholder="Promo code" value={promoCode} onChange={e => setPromoCode(e.target.value)} />
            <Button variant="outline" onClick={applyPromo}>Apply</Button>
          </div>

          <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>${shippingCost.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-primary">
                <span>Discount ({promoApplied})</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-lg font-bold">
            <span>Total</span>
            <span>${finalTotal.toFixed(2)}</span>
          </div>

          <Button onClick={placeOrder} disabled={loading || savingAddress || requiredFieldsMissing} className="mt-4 w-full" size="lg">
            {loading ? "Placing Order..." : "Place Order"}
          </Button>

          {requiredFieldsMissing && <p className="mt-2 text-xs text-destructive">Please complete all required address fields.</p>}
          {!requiredFieldsMissing && paymentMethod === "card" && <p className="mt-2 text-xs text-muted-foreground">Card checkout is not active yet. Use cash on delivery.</p>}
          {saveAddressForFuture && savingAddress && <p className="mt-2 text-xs text-muted-foreground">Saving address...</p>}
          <p className="mt-2 text-xs text-muted-foreground">
            <MapPin className="mr-1 inline h-3.5 w-3.5" />
            Your shipping address is stored in your account when enabled.
          </p>
        </aside>
      </div>
    </div>
  );
}
