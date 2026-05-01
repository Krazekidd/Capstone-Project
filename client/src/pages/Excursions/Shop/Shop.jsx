import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { shopAPI } from "../../api/api";
import "./Shop.css";

/* ═══════════════════════════════════════
   ICONS (same as before)
═══════════════════════════════════════ */
const HeartIcon    = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const CartIcon     = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
const TrashIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const SearchIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const CloseIcon    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const CheckIcon    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>;
const MinusIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const PlusIcon     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const TagIcon      = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const ArrowRight   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const ShieldIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const TruckIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const StarIcon     = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const FilterIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>;

/* ═══════════════════════════════════════
   TOAST NOTIFICATION
═══════════════════════════════════════ */
function Toast({ toasts, removeToast }) {
  return (
    <div className="toast-stack">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast--${t.type}`}>
          {t.img && <img src={t.img} alt={t.name} className="toast-img"/>}
          <div className="toast-body">
            <p className="toast-title">{t.title}</p>
            {t.sub && <p className="toast-sub">{t.sub}</p>}
          </div>
          <button className="toast-close" onClick={() => removeToast(t.id)}><CloseIcon/></button>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════
   NAVBAR
═══════════════════════════════════════ */
function ShopNav({ cartCount, wishlistCount, onCartOpen, onWishlistOpen, searchVal, onSearch }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav className={`shop-nav${scrolled ? " shop-nav--scrolled" : ""}`}>
      <div className="shop-nav-inner">
        <div className="shop-nav-logo">
          <div className="shop-logo-hex">
            <div className="slh-bg"/><div className="slh-inner"/>
            <span className="slh-letter">B</span>
          </div>
          <div className="shop-logo-text">
            <span className="shop-logo-name">B.A.D People Fitness</span>
            <span className="shop-logo-sub">Official Store</span>
          </div>
        </div>

        <div className="shop-search-wrap">
          <SearchIcon/>
          <input
            className="shop-search"
            placeholder="Search products…"
            value={searchVal}
            onChange={e => onSearch(e.target.value)}
          />
          {searchVal && (
            <button className="shop-search-clear" onClick={() => onSearch("")}><CloseIcon/></button>
          )}
        </div>

        <div className="shop-nav-links">
          <Link to="/">Home</Link>
          <Link to="/shop" className="active">Shop</Link>
          <Link to="/membership">Membership</Link>
        </div>

        <div className="shop-nav-actions">
          <button className="shop-nav-icon-btn" onClick={onWishlistOpen} title="Wishlist">
            <span className={`sni-heart${wishlistCount > 0 ? " sni-heart--active" : ""}`}>
              <HeartIcon filled={wishlistCount > 0}/>
            </span>
            {wishlistCount > 0 && <span className="sni-badge">{wishlistCount}</span>}
          </button>

          <button className="shop-nav-icon-btn shop-nav-cart-btn" onClick={onCartOpen} title="Cart">
            <CartIcon/>
            {cartCount > 0 && <span className="sni-badge">{cartCount}</span>}
          </button>
        </div>
      </div>

      <div className="shop-trust-bar">
        <span><TruckIcon/> Free delivery over $10,000 JMD</span>
        <span><ShieldIcon/> Secure checkout</span>
        <span><CheckIcon/> Quality guaranteed</span>
        <span><TagIcon/> Exclusive member prices</span>
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════
   PRODUCT CARD
═══════════════════════════════════════ */
function ProductCard({ product, qty, onAdd, onRemove, isWishlisted, onToggleWishlist }) {
  const [adding, setAdding] = useState(false);

  const handleAdd = () => {
    setAdding(true);
    onAdd(product);
    setTimeout(() => setAdding(false), 600);
  };

  return (
    <div className={`product-card${qty > 0 ? " product-card--incart" : ""}`}>
      {product.badge_text && (
        <div className={`product-badge product-badge--${product.badge_color}`}>{product.badge_text}</div>
      )}

      <button
        className={`product-wish-btn${isWishlisted ? " product-wish-btn--active" : ""}`}
        onClick={() => onToggleWishlist(product)}
        title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <HeartIcon filled={isWishlisted}/>
      </button>

      <div className="product-img-wrap">
        <img src={product.image_url} alt={product.name} onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }}/>
        <div className="product-img-fallback">No image</div>
        <div className="product-img-overlay"/>
      </div>

      <div className="product-body">
        <div className="product-stars">
          {[...Array(5)].map((_,i)=> <StarIcon key={i}/>)}
          <span className="product-rating-count">({product.review_count || 0})</span>
        </div>
        <h4 className="product-name">{product.name}</h4>
        <p className="product-price">${product.price.toLocaleString()}<span className="product-currency"> JMD</span></p>

        <div className="product-controls">
          {qty === 0 ? (
            <button
              className={`product-add-btn${adding ? " product-add-btn--adding" : ""}`}
              onClick={handleAdd}
            >
              {adding ? <><CheckIcon/> Added!</> : <><PlusIcon/> Add to Cart</>}
            </button>
          ) : (
            <div className="product-qty-row">
              <button className="product-qty-btn product-qty-btn--minus" onClick={() => onRemove(product)}>
                <MinusIcon/>
              </button>
              <div className="product-qty-display">
                <span className="product-qty-num">{qty}</span>
                <span className="product-qty-lbl">in cart</span>
              </div>
              <button className="product-qty-btn product-qty-btn--plus" onClick={handleAdd}>
                <PlusIcon/>
              </button>
            </div>
          )}
        </div>
      </div>

      {qty > 0 && (
        <div className="product-in-cart-strip">
          <CheckIcon/> {qty} in cart · ${(product.price * qty).toLocaleString()} JMD
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   CART DRAWER
═══════════════════════════════════════ */
function CartDrawer({ open, onClose, cartItems, onAdd, onRemove, onRemoveAll, onClear, onCheckout, taxRate, shippingThreshold, shippingCost }) {
  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = Math.round(subtotal * taxRate);
  const shipping = subtotal >= shippingThreshold ? 0 : shippingCost;
  const total = subtotal + tax + shipping;

  return (
    <>
      {open && <div className="drawer-overlay" onClick={onClose}/>}
      <div className={`cart-drawer${open ? " cart-drawer--open" : ""}`}>
        <div className="cart-drawer-header">
          <div className="cdh-left">
            <CartIcon/>
            <h3>Cart</h3>
            {cartItems.length > 0 && <span className="cdh-count">{cartItems.reduce((s,i)=>s+i.quantity,0)}</span>}
          </div>
          <button className="drawer-close" onClick={onClose}><CloseIcon/></button>
        </div>

        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon"><CartIcon/></div>
            <p>Your cart is empty</p>
            <span>Add items to get started</span>
            <button className="cart-empty-btn" onClick={onClose}>Browse Products</button>
          </div>
        ) : (
          <>
            <ul className="cart-items">
              {cartItems.map(item => (
                <li key={item.product_id} className="cart-item">
                  <div className="ci-img-wrap">
                    <img src={item.image_url} alt={item.name} onError={e=>{e.target.style.display="none";}}/>
                  </div>
                  <div className="ci-info">
                    <p className="ci-name">{item.name}</p>
                    <p className="ci-unit">${item.price.toLocaleString()} JMD each</p>
                    <div className="ci-qty-row">
                      <button className="ci-qty-btn" onClick={() => onRemove(item)}><MinusIcon/></button>
                      <span className="ci-qty">{item.quantity}</span>
                      <button className="ci-qty-btn" onClick={() => onAdd(item)}><PlusIcon/></button>
                    </div>
                  </div>
                  <div className="ci-right">
                    <p className="ci-total">${(item.price * item.quantity).toLocaleString()}</p>
                    <button className="ci-remove" onClick={() => onRemoveAll(item)} title="Remove item"><TrashIcon/></button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="cart-summary">
              {subtotal < shippingThreshold && (
                <div className="cart-free-ship-bar">
                  <div className="cfsb-track">
                    <div className="cfsb-fill" style={{ width:`${Math.min((subtotal/shippingThreshold)*100,100)}%`}}/>
                  </div>
                  <p className="cfsb-text">
                    ${(shippingThreshold - subtotal).toLocaleString()} JMD away from free shipping!
                  </p>
                </div>
              )}
              {subtotal >= shippingThreshold && (
                <div className="cart-free-ship-achieved">
                  <CheckIcon/> Free shipping unlocked!
                </div>
              )}

              <div className="cart-totals">
                <div className="ct-row"><span>Subtotal</span><span>${subtotal.toLocaleString()} JMD</span></div>
                <div className="ct-row"><span>Tax (15%)</span><span>${tax.toLocaleString()} JMD</span></div>
                <div className="ct-row"><span>Shipping</span><span>{shipping === 0 ? <span className="ct-free">Free</span> : `$${shipping.toLocaleString()} JMD`}</span></div>
                <div className="ct-row ct-row--total"><span>Total</span><span>${total.toLocaleString()} JMD</span></div>
              </div>

              <button className="cart-checkout-btn" onClick={onCheckout}>
                Proceed to Checkout <ArrowRight/>
              </button>
              <button className="cart-clear-btn" onClick={onClear}>Clear cart</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════
   WISHLIST DRAWER
═══════════════════════════════════════ */
function WishlistDrawer({ open, onClose, wishlist, onRemove, onMoveToCart }) {
  return (
    <>
      {open && <div className="drawer-overlay" onClick={onClose}/>}
      <div className={`wishlist-drawer${open ? " wishlist-drawer--open" : ""}`}>
        <div className="cart-drawer-header">
          <div className="cdh-left">
            <span className="cdh-heart"><HeartIcon filled/></span>
            <h3>Wishlist</h3>
            {wishlist.length > 0 && <span className="cdh-count">{wishlist.length}</span>}
          </div>
          <button className="drawer-close" onClick={onClose}><CloseIcon/></button>
        </div>

        {wishlist.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon" style={{ color:"var(--orange)" }}><HeartIcon/></div>
            <p>Your wishlist is empty</p>
            <span>Tap ♥ on any product to save it here</span>
          </div>
        ) : (
          <ul className="cart-items">
            {wishlist.map(item => (
              <li key={item.product_id} className="cart-item">
                <div className="ci-img-wrap">
                  <img src={item.image_url} alt={item.name} onError={e=>{e.target.style.display="none";}}/>
                </div>
                <div className="ci-info">
                  <p className="ci-name">{item.name}</p>
                  <p className="ci-unit">${item.price.toLocaleString()} JMD</p>
                  <button className="ci-move-btn" onClick={() => onMoveToCart(item)}>
                    <CartIcon/> Move to Cart
                  </button>
                </div>
                <div className="ci-right">
                  <button className="ci-remove" onClick={() => onRemove(item)}><TrashIcon/></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
/* ═══════════════════════════════════════
   CHECKOUT MODAL
═══════════════════════════════════════ */
function CheckoutModal({ open, onClose, cartItems, taxRate, shippingThreshold, shippingCost, onOrderPlaced }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ customer_name:"", email:"", phone:"", address:"", city:"", notes:"" });
  const [errors, setErrors] = useState({});
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [orderRef, setOrderRef] = useState("");
  const [orderDetails, setOrderDetails] = useState(null);

  // Calculate totals properly
  const subtotal = cartItems.reduce((s,i) => s + (i.price * i.quantity), 0);
  const tax = Math.round(subtotal * taxRate);
  const shipping = subtotal >= shippingThreshold ? 0 : shippingCost;
  const total = subtotal + tax + shipping;

  const fc = e => {
    setForm(f=>({...f,[e.target.name]:e.target.value}));
    setErrors(p=>({...p,[e.target.name]:""}));
  };

  const validate1 = () => {
    const e={};
    if (!form.customer_name.trim()) e.customer_name="Required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email="Valid email required";
    if (!form.phone.trim()) e.phone="Required";
    if (!form.address.trim()) e.address="Required";
    if (!form.city.trim()) e.city="Required";
    setErrors(e); 
    return !Object.keys(e).length;
  };

  const placeOrder = async () => {
    if (!validate1()) return;
    setPlacing(true);
    
    try {
      const orderData = {
        customer_name: form.customer_name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        notes: form.notes,
        payment_method: "card"
      };
      
      const response = await shopAPI.placeOrder(orderData);
      setOrderRef(response.order_reference);
      
      // Store the complete order details with correct totals
      setOrderDetails({
        reference: response.order_reference,
        subtotal: response.subtotal,
        tax: response.tax,
        shipping: response.shipping_cost,
        total: response.total,
        items: cartItems,
        placed_at: new Date().toLocaleString()
      });
      
      setPlaced(true);
      
      // Call onOrderPlaced to refresh cart
      if (onOrderPlaced) {
        await onOrderPlaced();
      }
    } catch (err) {
      console.error("Order failed:", err);
      addToast({ type: "error", title: "Failed to place order", sub: err.detail || "Please try again" });
    } finally {
      setPlacing(false);
    }
  };

  // Reset modal state when closed
  const handleClose = () => {
    setStep(1);
    setPlaced(false);
    setOrderRef("");
    setOrderDetails(null);
    setForm({ customer_name:"", email:"", phone:"", address:"", city:"", notes:"" });
    setErrors({});
    onClose();
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget) handleClose();}}>
      <div className="checkout-modal">
        <button className="modal-close-btn" onClick={handleClose}><CloseIcon/></button>

        {placed && orderDetails ? (
          <div className="order-success">
            <div className="os-ring"/><div className="os-check"><CheckIcon/></div>
            <h2 className="os-title">ORDER PLACED!</h2>
            <p className="os-sub">Thank you for your order. Check your email for confirmation.</p>
            
            <div className="os-ref-box">
              <span>Order Reference</span>
              <span className="os-ref">{orderDetails.reference}</span>
            </div>
            
            <div className="os-items">
              {orderDetails.items.map(i=>(
                <div key={i.product_id} className="os-item">
                  <img src={i.image_url} alt={i.name} onError={e=>{e.target.style.display="none";}}/>
                  <span>{i.name} × {i.quantity}</span>
                  <span>${(i.price * i.quantity).toLocaleString()} JMD</span>
                </div>
              ))}
            </div>
            
            {/* Order Summary with correct totals */}
            <div className="os-summary">
              <div className="os-summary-row">
                <span>Subtotal:</span>
                <span>${orderDetails.subtotal.toLocaleString()} JMD</span>
              </div>
              <div className="os-summary-row">
                <span>Tax (15%):</span>
                <span>${orderDetails.tax.toLocaleString()} JMD</span>
              </div>
              <div className="os-summary-row">
                <span>Shipping:</span>
                <span>{orderDetails.shipping === 0 ? "Free" : `$${orderDetails.shipping.toLocaleString()} JMD`}</span>
              </div>
              <div className="os-summary-row os-total-row">
                <span>Total Paid:</span>
                <span className="os-total-amount">${orderDetails.total.toLocaleString()} JMD</span>
              </div>
            </div>
            
            <button className="os-done-btn" onClick={handleClose}>Continue Shopping</button>
          </div>
        ) : (
          <>
            <div className="checkout-steps">
              {["Delivery","Review"].map((s,i)=>(
                <div key={s} className={`cs-node${step>i+1?" cs-node--done":step===i+1?" cs-node--active":""}`}>
                  <div className="cs-num">{step>i+1?<CheckIcon/>:i+1}</div>
                  <span>{s}</span>
                  {i<1 && <div className={`cs-line${step>i+1?" cs-line--done":""}`}/>}
                </div>
              ))}
            </div>

            {step === 1 && (
              <div className="checkout-form">
                <h3 className="cf-title">DELIVERY DETAILS</h3>
                <div className="cf-grid">
                  <div className="cf-field cf-field--full">
                    <label>Full Name</label>
                    <input name="customer_name" placeholder="John Doe" value={form.customer_name} onChange={fc}/>
                    {errors.customer_name && <span className="cf-err">{errors.customer_name}</span>}
                  </div>
                  <div className="cf-field cf-field--full">
                    <label>Email</label>
                    <input name="email" type="email" placeholder="you@email.com" value={form.email} onChange={fc}/>
                    {errors.email && <span className="cf-err">{errors.email}</span>}
                  </div>
                  <div className="cf-field cf-field--full">
                    <label>Phone</label>
                    <input name="phone" type="tel" placeholder="+1 (876) 000-0000" value={form.phone} onChange={fc}/>
                    {errors.phone && <span className="cf-err">{errors.phone}</span>}
                  </div>
                  <div className="cf-field cf-field--full">
                    <label>City / Parish</label>
                    <input name="city" placeholder="Kingston" value={form.city} onChange={fc}/>
                    {errors.city && <span className="cf-err">{errors.city}</span>}
                  </div>
                  <div className="cf-field cf-field--full">
                    <label>Delivery Address</label>
                    <input name="address" placeholder="123 Harbour Street" value={form.address} onChange={fc}/>
                    {errors.address && <span className="cf-err">{errors.address}</span>}
                  </div>
                  <div className="cf-field cf-field--full">
                    <label>Notes (optional)</label>
                    <textarea name="notes" rows={3} placeholder="Special delivery instructions..." value={form.notes} onChange={fc}/>
                  </div>
                </div>

                <div className="cf-order-summary">
                  <p className="cf-os-title">Order Summary</p>
                  {cartItems.map(i=>(
                    <div key={i.product_id} className="cf-os-row">
                      <span>{i.name} × {i.quantity}</span>
                      <span>${(i.price * i.quantity).toLocaleString()} JMD</span>
                    </div>
                  ))}
                  <div className="cf-os-row"><span>Tax (15%)</span><span>${tax.toLocaleString()} JMD</span></div>
                  <div className="cf-os-row"><span>Shipping</span><span>{shipping === 0 ? "Free" : `$${shipping.toLocaleString()} JMD`}</span></div>
                  <div className="cf-os-row cf-os-total"><span>Total</span><span>${total.toLocaleString()} JMD</span></div>
                </div>

                <div className="cf-actions">
                  <button className={`cf-place-btn${placing?" cf-place-btn--loading":""}`} onClick={placeOrder} disabled={placing}>
                    {placing ? "Processing…" : <><ShieldIcon/> Place Order — ${total.toLocaleString()} JMD</>}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   SECTION HEADER
═══════════════════════════════════════ */
function SectionHeader({ title, count }) {
  return (
    <div className="shop-section-header">
      <div className="ssh-left">
        <span className="ssh-eyebrow-line"/>
        <h2 className="ssh-title">{title}</h2>
      </div>
      <span className="ssh-count">{count} items</span>
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN SHOP PAGE
═══════════════════════════════════════ */
export default function Shop() {
  const [products, setProducts] = useState({ merch: [], essentials: [], supplements: [] });
  const [cart, setCart] = useState({});   // { product_id: quantity }
  const [wishlist, setWishlist] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishOpen, setWishOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [loading, setLoading] = useState(true);
  const toastId = useRef(0);
  
  const TAX_RATE = 0.15;
  const SHIPPING_THRESHOLD = 10000;
  const SHIPPING_COST = 500;

  /* ── Toast helpers ── */
  const addToast = (toast) => {
    const id = ++toastId.current;
    setToasts(t => [...t, { ...toast, id }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };
  const removeToast = (id) => setToasts(t => t.filter(x => x.id !== id));

  /* ── Load data ── */
  useEffect(() => {
    loadProducts();
    loadCart();
    loadWishlist();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const allProducts = await shopAPI.getProducts();
      
      // Group products by category
      const grouped = {
        merch: [],
        essentials: [],
        supplements: []
      };
      
      allProducts.forEach(product => {
        if (grouped[product.category_id]) {
          grouped[product.category_id].push(product);
        }
      });
      
      setProducts(grouped);
    } catch (err) {
      console.error("Failed to load products:", err);
      addToast({ type: "error", title: "Failed to load products", sub: "Please refresh the page" });
    } finally {
      setLoading(false);
    }
  };

  const loadCart = async () => {
    try {
      const cartData = await shopAPI.getCart();
      const cartMap = {};
      if (cartData && cartData.items) {
        cartData.items.forEach(item => {
          cartMap[item.product_id] = item.quantity;
        });
      }
      setCart(cartMap);
    } catch (err) {
      console.error("Failed to load cart:", err);
      // Don't show error toast for cart loading
    }
  };

  const loadWishlist = async () => {
  try {
    const wishlistData = await shopAPI.getWishlist();
    setWishlist(wishlistData.items || []);
  } catch (err) {
    console.error("Failed to load wishlist:", err);
  }
  };

  /* ── Cart helpers ── */
  const addToCart = async (product) => {
    try {
      await shopAPI.addToCart(product.id, 1);
      setCart(c => ({ ...c, [product.id]: (c[product.id] || 0) + 1 }));
      addToast({
        type: "cart",
        img: product.image_url,
        title: `${product.name} added to cart`,
        sub: `${(cart[product.id] || 0) + 1} × $${product.price.toLocaleString()} JMD`,
      });
    } catch (err) {
      console.error("Failed to add to cart:", err);
      addToast({ type: "error", title: "Failed to add to cart", sub: "Please try again" });
    }
  };

  const removeFromCart = async (product) => {
    try {
      const newQty = (cart[product.id] || 0) - 1;
      if (newQty <= 0) {
        await shopAPI.removeFromCart(product.id);
        const newCart = { ...cart };
        delete newCart[product.id];
        setCart(newCart);
      } else {
        await shopAPI.updateCartItem(product.id, newQty);
        setCart(c => ({ ...c, [product.id]: newQty }));
      }
    } catch (err) {
      console.error("Failed to remove from cart:", err);
    }
  };

  const removeAllFromCart = async (product) => {
    try {
      await shopAPI.removeFromCart(product.id);
      const newCart = { ...cart };
      delete newCart[product.id];
      setCart(newCart);
    } catch (err) {
      console.error("Failed to remove from cart:", err);
    }
  };

  const clearCart = async () => {
    try {
      await shopAPI.clearCart();
      setCart({});
      addToast({ type: "info", title: "Cart cleared", sub: "All items removed" });
    } catch (err) {
      console.error("Failed to clear cart:", err);
    }
  };

  /* ── Wishlist helpers ── */
  const toggleWishlist = async (product) => {
    const inList = wishlist.some(w => w.product_id === product.id);
    try {
      if (inList) {
        await shopAPI.removeFromWishlist(product.id);
        setWishlist(w => w.filter(x => x.product_id !== product.id));
        addToast({ type: "wish-remove", title: `Removed from wishlist`, sub: product.name });
      } else {
        await shopAPI.addToWishlist(product.id);
        setWishlist(w => [...w, {
          product_id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url
        }]);
        addToast({ type: "wish", img: product.image_url, title: `Saved to wishlist`, sub: product.name });
      }
    } catch (err) {
      console.error("Failed to update wishlist:", err);
    }
  };

  const moveToCart = async (product) => {
    try {
      await shopAPI.addToCart(product.product_id, 1);
      await shopAPI.removeFromWishlist(product.product_id);
      setCart(c => ({ ...c, [product.product_id]: (c[product.product_id] || 0) + 1 }));
      setWishlist(w => w.filter(x => x.product_id !== product.product_id));
      addToast({ type: "cart", img: product.image_url, title: `Moved to cart`, sub: product.name });
    } catch (err) {
      console.error("Failed to move to cart:", err);
    }
  };

  /* ── Build cart items list ── */
  const cartItems = Object.entries(cart).map(([id, qty]) => {
    const allProducts = [...products.merch, ...products.essentials, ...products.supplements];
    const p = allProducts.find(x => x.id === id);
    return p ? { ...p, quantity: qty } : null;
  }).filter(Boolean);

  const totalCartCount = cartItems.reduce((s,i)=>s+i.quantity, 0);

  /* ── Filter & sort ── */
  const filterAndSort = (productList) => {
    let list = [...productList];
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (sortBy === "price-asc")  list.sort((a,b)=>a.price-b.price);
    if (sortBy === "price-desc") list.sort((a,b)=>b.price-a.price);
    if (sortBy === "name")       list.sort((a,b)=>a.name.localeCompare(b.name));
    return list;
  };

  const merch = filterAndSort(products.merch);
  const essentials = filterAndSort(products.essentials);
  const supplements = filterAndSort(products.supplements);

  const allFiltered = [
    ...(activeFilter==="all"||activeFilter==="merch" ? merch : []),
    ...(activeFilter==="all"||activeFilter==="essentials" ? essentials : []),
    ...(activeFilter==="all"||activeFilter==="supplements" ? supplements : []),
  ];

  const noResults = search && allFiltered.length === 0;

  const handleOrderPlaced = async () => {
  // Clear local cart state
  setCart({});
  
  // Reload cart from server to ensure sync
  await loadCart();
  
  // Close any open drawers
  setCartOpen(false);
  
  // Show success message
  addToast({ 
    type: "success", 
    title: "Order Placed Successfully!", 
    sub: "Thank you for your purchase" 
  });
};

  if (loading) {
    return (
      <div className="shop-wrapper">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-wrapper">
      <Toast toasts={toasts} removeToast={removeToast}/>

      <ShopNav
        cartCount={totalCartCount}
        wishlistCount={wishlist.length}
        onCartOpen={() => { setCartOpen(true); setWishOpen(false); }}
        onWishlistOpen={() => { setWishOpen(true); setCartOpen(false); }}
        searchVal={search}
        onSearch={setSearch}
      />

      <div className="shop-hero">
        <div className="shop-hero-bg"/>
        <div className="shop-hero-overlay"/>
        <div className="shop-hero-grid"/>
        <div className="shop-hero-content">
          <div className="shop-hero-eyebrow"><span className="ssh-eyebrow-line"/>Official Store</div>
          <h1 className="shop-hero-title">GEAR UP.<br/><span className="shop-hero-accent">TRAIN HARDER.</span></h1>
          <p className="shop-hero-sub">Premium merch, gym essentials and performance supplements — all in one place.</p>
        </div>
      </div>

      <div className="shop-toolbar">
        <div className="shop-toolbar-inner">
          <div className="shop-filter-tabs">
            <FilterIcon/>
            {[
              { id:"all", label:"All Products" },
              { id:"merch", label:"Merch" },
              { id:"essentials", label:"Essentials" },
              { id:"supplements", label:"Supplements" },
            ].map(f=>(
              <button
                key={f.id}
                className={`filter-tab${activeFilter===f.id?" filter-tab--active":""}`}
                onClick={()=>setActiveFilter(f.id)}
              >{f.label}</button>
            ))}
          </div>
          <div className="shop-sort">
            <label>Sort by</label>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)}>
              <option value="default">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>
        </div>
      </div>

      <div className="shop-layout">
        <main className="shop-main">
          {noResults ? (
            <div className="shop-no-results">
              <SearchIcon/>
              <p>No products found for "<strong>{search}</strong>"</p>
              <button onClick={()=>setSearch("")}>Clear search</button>
            </div>
          ) : (
            <>
              {(activeFilter==="all"||activeFilter==="merch") && merch.length>0 && (
                <section className="shop-section" id="merch">
                  <SectionHeader title="Merch" count={merch.length}/>
                  <div className="shop-product-grid">
                    {merch.map(p=>(
                      <ProductCard key={p.id} product={p} qty={cart[p.id]||0}
                        onAdd={addToCart} onRemove={removeFromCart}
                        isWishlisted={wishlist.some(w=>w.product_id===p.id)}
                        onToggleWishlist={toggleWishlist}/>
                    ))}
                  </div>
                </section>
              )}

              {(activeFilter==="all"||activeFilter==="essentials") && essentials.length>0 && (
                <section className="shop-section" id="essentials">
                  <SectionHeader title="Gym Essentials" count={essentials.length}/>
                  <div className="shop-product-grid">
                    {essentials.map(p=>(
                      <ProductCard key={p.id} product={p} qty={cart[p.id]||0}
                        onAdd={addToCart} onRemove={removeFromCart}
                        isWishlisted={wishlist.some(w=>w.product_id===p.id)}
                        onToggleWishlist={toggleWishlist}/>
                    ))}
                  </div>
                </section>
              )}

              {(activeFilter==="all"||activeFilter==="supplements") && supplements.length>0 && (
                <section className="shop-section" id="supplements">
                  <SectionHeader title="Supplements" count={supplements.length}/>
                  <div className="shop-product-grid">
                    {supplements.map(p=>(
                      <ProductCard key={p.id} product={p} qty={cart[p.id]||0}
                        onAdd={addToCart} onRemove={removeFromCart}
                        isWishlisted={wishlist.some(w=>w.product_id===p.id)}
                        onToggleWishlist={toggleWishlist}/>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </main>

        <aside className="shop-cart-sidebar">
          <div className="scs-header">
            <CartIcon/><h3>Cart</h3>
            {totalCartCount > 0 && <span className="scs-count">{totalCartCount}</span>}
          </div>

          {cartItems.length === 0 ? (
            <div className="scs-empty">
              <p>No items yet</p>
              <span>Add products to see your cart here</span>
            </div>
          ) : (
            <>
              <ul className="scs-items">
                {cartItems.map(item=>(
                  <li key={item.product_id} className="scs-item">
                    <img src={item.image_url} alt={item.name} onError={e=>{e.target.style.display="none";}}/>
                    <div className="scs-item-info">
                      <p className="scs-item-name">{item.name}</p>
                      <p className="scs-item-price">${(item.price*item.quantity).toLocaleString()} JMD</p>
                    </div>
                    <div className="scs-item-qty">
                      <button onClick={()=>removeFromCart(item)}><MinusIcon/></button>
                      <span>{item.quantity}</span>
                      <button onClick={()=>addToCart(item)}><PlusIcon/></button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="scs-totals">
                <div className="sct-row"><span>Subtotal</span><span>${cartItems.reduce((s,i)=>s+i.price*i.quantity,0).toLocaleString()}</span></div>
                <div className="sct-row"><span>Tax (15%)</span><span>${Math.round(cartItems.reduce((s,i)=>s+i.price*i.quantity,0)*TAX_RATE).toLocaleString()}</span></div>
                <div className="sct-row sct-total">
                  <span>Total</span>
                  <span>${(cartItems.reduce((s,i)=>s+i.price*i.quantity,0) + Math.round(cartItems.reduce((s,i)=>s+i.price*i.quantity,0)*TAX_RATE) + (cartItems.reduce((s,i)=>s+i.price*i.quantity,0)>=SHIPPING_THRESHOLD?0:SHIPPING_COST)).toLocaleString()} JMD</span>
                </div>
              </div>

              <button className="scs-checkout-btn" onClick={()=>setCheckoutOpen(true)}>
                Checkout <ArrowRight/>
              </button>
              <button className="scs-clear-btn" onClick={clearCart}>Clear cart</button>
            </>
          )}

          <div className="scs-trust">
            <div className="scs-trust-item"><ShieldIcon/> Secure payment</div>
            <div className="scs-trust-item"><TruckIcon/> Fast delivery</div>
            <div className="scs-trust-item"><CheckIcon/> Quality guaranteed</div>
          </div>
        </aside>
      </div>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onAdd={addToCart}
        onRemove={removeFromCart}
        onRemoveAll={removeAllFromCart}
        onClear={clearCart}
        onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }}
        taxRate={TAX_RATE}
        shippingThreshold={SHIPPING_THRESHOLD}
        shippingCost={SHIPPING_COST}
      />

      <WishlistDrawer
        open={wishOpen}
        onClose={() => setWishOpen(false)}
        wishlist={wishlist}
        onRemove={toggleWishlist}
        onMoveToCart={moveToCart}
      />

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => { setCheckoutOpen(false); }}
        cartItems={cartItems}
        taxRate={TAX_RATE}
        shippingThreshold={SHIPPING_THRESHOLD}
        shippingCost={SHIPPING_COST}
        onOrderPlaced={handleOrderPlaced}
      />

      <footer className="shop-footer">
        <div className="shop-footer-inner">
          <div className="sf-logo">
            <div className="sf-logo-hex"><div className="sfh-bg"/><div className="sfh-inner"/><span className="sfh-letter">B</span></div>
            <div><p className="sf-logo-name">B.A.D People Fitness</p><p className="sf-logo-sub">Official Store</p></div>
          </div>
          <p className="sf-copy">© 2026 B.A.D People Fitness. All rights reserved.</p>
          <div className="sf-links">
            {["Privacy","Returns","Shipping","Terms"].map(l=><a key={l} href="#" onClick={e=>e.preventDefault()}>{l}</a>)}
          </div>
        </div>
      </footer>
    </div>
  );
}