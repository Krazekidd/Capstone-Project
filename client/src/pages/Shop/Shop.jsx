import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./Shop.css";

/* ═══════════════════════════════════════
   PRODUCT DATA
═══════════════════════════════════════ */
const PRODUCTS = {
  merch: [
    { id: "gym-tshirt",   name: "Gym T-Shirt",      price: 1500, img: "images/SHIRT.webp",     badge: "Best Seller", category: "merch" },
    { id: "hoodie",       name: "Hoodie",            price: 2500, img: "images/merch2.png",     badge: "New",         category: "merch" },
    { id: "gym-cap",      name: "Gym Cap",           price: 500,  img: "images/CAP.jpg",        badge: null,          category: "merch" },
    { id: "gym-towel",    name: "Gym Towel",         price: 1000, img: "images/TOWEL.jpg",      badge: null,          category: "merch" },
  ],
  essentials: [
    { id: "yoga-mat",     name: "Yoga Mat",          price: 1500, img: "images/mat.webp",       badge: "Popular",     category: "essentials" },
    { id: "bands",        name: "Resistance Bands",  price: 1000, img: "images/bands.png",      badge: null,          category: "essentials" },
    { id: "gym-gloves",   name: "Gym Gloves",        price: 1500, img: "images/GLOVES.jpg",     badge: null,          category: "essentials" },
    { id: "jump-rope",    name: "Jump Rope",         price: 2000, img: "images/ROPE.webp",      badge: "New",         category: "essentials" },
  ],
  supplements: [
    { id: "protein",      name: "Protein Powder",    price: 3000, img: "images/protein.png",    badge: "Best Seller", category: "supplements" },
    { id: "creatine",     name: "Creatine",          price: 5000, img: "images/creatine.png",   badge: "Premium",     category: "supplements" },
    { id: "multivitamin", name: "Multivitamins",     price: 3000, img: "images/vitamins.png",   badge: null,          category: "supplements" },
    { id: "preworkout",   name: "Pre-Workout",       price: 3000, img: "images/preworkout.png", badge: "Popular",     category: "supplements" },
  ],
};

const TAX_RATE  = 0.15;
const SHIPPING  = 500; // JMD flat rate, free over 10,000

/* ═══════════════════════════════════════
   ICONS
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
        {/* Logo */}
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

        {/* Search bar */}
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


        {/* Actions */}
        <div className="shop-nav-actions">
          {/* Wishlist */}
          <button className="shop-nav-icon-btn" onClick={onWishlistOpen} title="Wishlist">
            <span className={`sni-heart${wishlistCount > 0 ? " sni-heart--active" : ""}`}>
              <HeartIcon filled={wishlistCount > 0}/>
            </span>
            {wishlistCount > 0 && <span className="sni-badge">{wishlistCount}</span>}
          </button>

          {/* Cart */}
          <button className="shop-nav-icon-btn shop-nav-cart-btn" onClick={onCartOpen} title="Cart">
            <CartIcon/>
            {cartCount > 0 && <span className="sni-badge">{cartCount}</span>}
          </button>
        </div>
      </div>

      {/* Trust bar */}
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
      {product.badge && (
        <div className="product-badge">{product.badge}</div>
      )}

      {/* Wishlist */}
      <button
        className={`product-wish-btn${isWishlisted ? " product-wish-btn--active" : ""}`}
        onClick={() => onToggleWishlist(product)}
        title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <HeartIcon filled={isWishlisted}/>
      </button>

      {/* Image */}
      <div className="product-img-wrap">
        <img src={product.img} alt={product.name} onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }}/>
        <div className="product-img-fallback">No image</div>
        <div className="product-img-overlay"/>
      </div>

      {/* Info */}
      <div className="product-body">
        <div className="product-stars">
          {[...Array(5)].map((_,i)=><StarIcon key={i}/>)}
          <span className="product-rating-count">(42)</span>
        </div>
        <h4 className="product-name">{product.name}</h4>
        <p className="product-price">${product.price.toLocaleString()}<span className="product-currency"> JMD</span></p>

        {/* Controls */}
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
function CartDrawer({ open, onClose, cartItems, onAdd, onRemove, onRemoveAll, onClear, onCheckout }) {
  const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const tax      = Math.round(subtotal * TAX_RATE);
  const shipping = subtotal >= 10000 ? 0 : SHIPPING;
  const total    = subtotal + tax + shipping;

  return (
    <>
      {open && <div className="drawer-overlay" onClick={onClose}/>}
      <div className={`cart-drawer${open ? " cart-drawer--open" : ""}`}>
        <div className="cart-drawer-header">
          <div className="cdh-left">
            <CartIcon/>
            <h3>Cart</h3>
            {cartItems.length > 0 && <span className="cdh-count">{cartItems.reduce((s,i)=>s+i.qty,0)}</span>}
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
                <li key={item.id} className="cart-item">
                  <div className="ci-img-wrap">
                    <img src={item.img} alt={item.name}
                      onError={e=>{e.target.style.display="none";}}/>
                  </div>
                  <div className="ci-info">
                    <p className="ci-name">{item.name}</p>
                    <p className="ci-unit">${item.price.toLocaleString()} JMD each</p>
                    <div className="ci-qty-row">
                      <button className="ci-qty-btn" onClick={() => onRemove(item)}><MinusIcon/></button>
                      <span className="ci-qty">{item.qty}</span>
                      <button className="ci-qty-btn" onClick={() => onAdd(item)}><PlusIcon/></button>
                    </div>
                  </div>
                  <div className="ci-right">
                    <p className="ci-total">${(item.price*item.qty).toLocaleString()}</p>
                    <button className="ci-remove" onClick={() => onRemoveAll(item)} title="Remove item"><TrashIcon/></button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="cart-summary">
              {subtotal < 10000 && (
                <div className="cart-free-ship-bar">
                  <div className="cfsb-track">
                    <div className="cfsb-fill" style={{ width:`${Math.min((subtotal/10000)*100,100)}%`}}/>
                  </div>
                  <p className="cfsb-text">
                    ${(10000-subtotal).toLocaleString()} JMD away from free shipping!
                  </p>
                </div>
              )}
              {subtotal >= 10000 && (
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
              <li key={item.id} className="cart-item">
                <div className="ci-img-wrap">
                  <img src={item.img} alt={item.name} onError={e=>{e.target.style.display="none";}}/>
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
function CheckoutModal({ open, onClose, cartItems }) {
  const [step, setStep]         = useState(1);
  const [form, setForm]         = useState({ name:"", email:"", phone:"", address:"", city:"", card:"", expiry:"", cvv:"" });
  const [errors, setErrors]     = useState({});
  const [placing, setPlacing]   = useState(false);
  const [placed, setPlaced]     = useState(false);

  const subtotal = cartItems.reduce((s,i)=>s+i.price*i.qty,0);
  const tax      = Math.round(subtotal * TAX_RATE);
  const shipping = subtotal >= 10000 ? 0 : SHIPPING;
  const total    = subtotal + tax + shipping;
  const orderRef = useRef(`BAD-${Math.random().toString(36).substring(2,8).toUpperCase()}`);

  const fc = e => {
    setForm(f=>({...f,[e.target.name]:e.target.value}));
    setErrors(p=>({...p,[e.target.name]:""}));
  };

  const validate1 = () => {
    const e={};
    if (!form.name.trim())    e.name="Required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email="Valid email required";
    if (!form.phone.trim())   e.phone="Required";
    if (!form.address.trim()) e.address="Required";
    if (!form.city.trim())    e.city="Required";
    setErrors(e); return !Object.keys(e).length;
  };

  const validate2 = () => {
    const e={};
    if (!form.card.trim() || form.card.length < 16)  e.card="Valid 16-digit number required";
    if (!form.expiry.trim()) e.expiry="Required";
    if (!form.cvv.trim() || form.cvv.length < 3)     e.cvv="3-digit CVV required";
    setErrors(e); return !Object.keys(e).length;
  };

  const placeOrder = () => {
    if (!validate2()) return;
    setPlacing(true);
    setTimeout(() => { setPlacing(false); setPlaced(true); }, 1800);
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget) onClose();}}>
      <div className="checkout-modal">
        <button className="modal-close-btn" onClick={onClose}><CloseIcon/></button>

        {placed ? (
          <div className="order-success">
            <div className="os-ring"/><div className="os-check"><CheckIcon/></div>
            <h2 className="os-title">ORDER PLACED!</h2>
            <p className="os-sub">Thank you for your order. Check your email for confirmation.</p>
            <div className="os-ref-box">
              <span>Order Reference</span>
              <span className="os-ref">{orderRef.current}</span>
            </div>
            <div className="os-items">
              {cartItems.map(i=>(
                <div key={i.id} className="os-item">
                  <img src={i.img} alt={i.name} onError={e=>{e.target.style.display="none";}}/>
                  <span>{i.name} × {i.qty}</span>
                  <span>${(i.price*i.qty).toLocaleString()} JMD</span>
                </div>
              ))}
            </div>
            <p className="os-total">Total paid: <strong>${total.toLocaleString()} JMD</strong></p>
            <button className="os-done-btn" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            {/* Step bar */}
            <div className="checkout-steps">
              {["Delivery","Payment","Review"].map((s,i)=>(
                <div key={s} className={`cs-node${step>i+1?" cs-node--done":step===i+1?" cs-node--active":""}`}>
                  <div className="cs-num">{step>i+1?<CheckIcon/>:i+1}</div>
                  <span>{s}</span>
                  {i<2 && <div className={`cs-line${step>i+1?" cs-line--done":""}`}/>}
                </div>
              ))}
            </div>

            {step === 1 && (
              <div className="checkout-form">
                <h3 className="cf-title">DELIVERY DETAILS</h3>
                <div className="cf-grid">
                  <div className="cf-field">
                    <label>Full Name</label>
                    <input name="name" placeholder="John Doe" value={form.name} onChange={fc}/>
                    {errors.name && <span className="cf-err">{errors.name}</span>}
                  </div>
                  <div className="cf-field">
                    <label>Email</label>
                    <input name="email" type="email" placeholder="you@email.com" value={form.email} onChange={fc}/>
                    {errors.email && <span className="cf-err">{errors.email}</span>}
                  </div>
                  <div className="cf-field">
                    <label>Phone</label>
                    <input name="phone" type="tel" placeholder="+1 (876) 000-0000" value={form.phone} onChange={fc}/>
                    {errors.phone && <span className="cf-err">{errors.phone}</span>}
                  </div>
                  <div className="cf-field">
                    <label>City / Parish</label>
                    <input name="city" placeholder="Kingston" value={form.city} onChange={fc}/>
                    {errors.city && <span className="cf-err">{errors.city}</span>}
                  </div>
                  <div className="cf-field cf-field--full">
                    <label>Delivery Address</label>
                    <input name="address" placeholder="123 Harbour Street" value={form.address} onChange={fc}/>
                    {errors.address && <span className="cf-err">{errors.address}</span>}
                  </div>
                </div>
                <div className="cf-actions">
                  <button className="cf-next-btn" onClick={() => { if(validate1()) setStep(2); }}>
                    Continue to Payment <ArrowRight/>
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="checkout-form">
                <h3 className="cf-title">PAYMENT DETAILS</h3>
                <div className="cf-payment-cards">
                  {["Visa","Mastercard","AMEX"].map(c=><span key={c} className="cf-card-logo">{c}</span>)}
                </div>
                <div className="cf-grid">
                  <div className="cf-field cf-field--full">
                    <label>Card Number</label>
                    <input name="card" placeholder="0000 0000 0000 0000" maxLength={19}
                      value={form.card}
                      onChange={e=>{const v=e.target.value.replace(/\D/g,"").substring(0,16).replace(/(.{4})/g,"$1 ").trim(); setForm(f=>({...f,card:v})); setErrors(p=>({...p,card:""}));}}/>
                    {errors.card && <span className="cf-err">{errors.card}</span>}
                  </div>
                  <div className="cf-field">
                    <label>Expiry</label>
                    <input name="expiry" placeholder="MM/YY" maxLength={5} value={form.expiry}
                      onChange={e=>{const v=e.target.value.replace(/\D/g,""); setForm(f=>({...f,expiry:v.length>2?v.slice(0,2)+"/"+v.slice(2):v})); setErrors(p=>({...p,expiry:""}));}}/>
                    {errors.expiry && <span className="cf-err">{errors.expiry}</span>}
                  </div>
                  <div className="cf-field">
                    <label>CVV</label>
                    <input name="cvv" placeholder="123" maxLength={4} type="password" value={form.cvv}
                      onChange={e=>{setForm(f=>({...f,cvv:e.target.value.replace(/\D/g,"").substring(0,4)})); setErrors(p=>({...p,cvv:""}));}}/>
                    {errors.cvv && <span className="cf-err">{errors.cvv}</span>}
                  </div>
                </div>

                <div className="cf-order-summary">
                  <p className="cf-os-title">Order Summary</p>
                  {cartItems.map(i=>(
                    <div key={i.id} className="cf-os-row">
                      <span>{i.name} × {i.qty}</span>
                      <span>${(i.price*i.qty).toLocaleString()} JMD</span>
                    </div>
                  ))}
                  <div className="cf-os-row"><span>Tax (15%)</span><span>${tax.toLocaleString()} JMD</span></div>
                  <div className="cf-os-row"><span>Shipping</span><span>{shipping===0?"Free":`$${shipping.toLocaleString()} JMD`}</span></div>
                  <div className="cf-os-row cf-os-total"><span>Total</span><span>${total.toLocaleString()} JMD</span></div>
                </div>

                <div className="cf-actions">
                  <button className="cf-back-btn" onClick={()=>setStep(1)}>Back</button>
                  <button className="cf-next-btn" onClick={()=>{if(validate2()) setStep(3);}}>
                    Review Order <ArrowRight/>
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="checkout-form">
                <h3 className="cf-title">REVIEW & PLACE ORDER</h3>

                <div className="cf-review-section">
                  <p className="cf-review-label">Delivering to</p>
                  <p className="cf-review-val">{form.name}</p>
                  <p className="cf-review-val">{form.address}, {form.city}</p>
                  <p className="cf-review-val">{form.email} · {form.phone}</p>
                </div>

                <div className="cf-review-section">
                  <p className="cf-review-label">Items</p>
                  {cartItems.map(i=>(
                    <div key={i.id} className="cf-review-item">
                      <img src={i.img} alt={i.name} onError={e=>{e.target.style.display="none";}}/>
                      <span>{i.name} × {i.qty}</span>
                      <span className="cf-review-item-price">${(i.price*i.qty).toLocaleString()} JMD</span>
                    </div>
                  ))}
                </div>

                <div className="cf-review-total">
                  <span>Total</span>
                  <span>${total.toLocaleString()} JMD</span>
                </div>

                <div className="cf-actions">
                  <button className="cf-back-btn" onClick={()=>setStep(2)}>Back</button>
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
  const [cart,          setCart]          = useState({});   // { id: qty }
  const [wishlist,      setWishlist]      = useState([]);
  const [cartOpen,      setCartOpen]      = useState(false);
  const [wishOpen,      setWishOpen]      = useState(false);
  const [checkoutOpen,  setCheckoutOpen]  = useState(false);
  const [toasts,        setToasts]        = useState([]);
  const [search,        setSearch]        = useState("");
  const [activeFilter,  setActiveFilter]  = useState("all");
  const [sortBy,        setSortBy]        = useState("default");
  const toastId = useRef(0);

  /* ── Toast helpers ── */
  const addToast = (toast) => {
    const id = ++toastId.current;
    setToasts(t => [...t, { ...toast, id }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };
  const removeToast = (id) => setToasts(t => t.filter(x => x.id !== id));

  /* ── Cart helpers ── */
  const addToCart = (product) => {
    setCart(c => ({ ...c, [product.id]: (c[product.id] || 0) + 1 }));
    addToast({
      type: "cart",
      img:   product.img,
      title: `${product.name} added to cart`,
      sub:   `${(cart[product.id]||0)+1} × $${product.price.toLocaleString()} JMD`,
    });
  };

  const removeFromCart = (product) => {
    setCart(c => {
      const qty = (c[product.id] || 0) - 1;
      if (qty <= 0) { const next = {...c}; delete next[product.id]; return next; }
      return { ...c, [product.id]: qty };
    });
  };

  const removeAllFromCart = (product) => {
    setCart(c => { const next = {...c}; delete next[product.id]; return next; });
  };

  const clearCart = () => setCart({});

  /* ── Wishlist helpers ── */
  const toggleWishlist = (product) => {
    const inList = wishlist.some(w => w.id === product.id);
    if (inList) {
      setWishlist(w => w.filter(x => x.id !== product.id));
      addToast({ type: "wish-remove", title: `Removed from wishlist`, sub: product.name });
    } else {
      setWishlist(w => [...w, product]);
      addToast({ type: "wish", img: product.img, title: `Saved to wishlist`, sub: product.name });
    }
  };

  const moveToCart = (product) => {
    addToCart(product);
    setWishlist(w => w.filter(x => x.id !== product.id));
    addToast({ type: "cart", img: product.img, title: `Moved to cart`, sub: product.name });
  };

  /* ── Build cart items list ── */
  const cartItems = Object.entries(cart).map(([id, qty]) => {
    const allProducts = [...PRODUCTS.merch, ...PRODUCTS.essentials, ...PRODUCTS.supplements];
    const p = allProducts.find(x => x.id === id);
    return p ? { ...p, qty } : null;
  }).filter(Boolean);

  const totalCartCount = cartItems.reduce((s,i)=>s+i.qty, 0);

  /* ── Filter & search ── */
  const filterAndSort = (products) => {
    let list = [...products];
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (sortBy === "price-asc")  list.sort((a,b)=>a.price-b.price);
    if (sortBy === "price-desc") list.sort((a,b)=>b.price-a.price);
    if (sortBy === "name")       list.sort((a,b)=>a.name.localeCompare(b.name));
    return list;
  };

  const merch       = filterAndSort(PRODUCTS.merch);
  const essentials  = filterAndSort(PRODUCTS.essentials);
  const supplements = filterAndSort(PRODUCTS.supplements);

  const allFiltered = [
    ...(activeFilter==="all"||activeFilter==="merch"       ? merch       : []),
    ...(activeFilter==="all"||activeFilter==="essentials"  ? essentials  : []),
    ...(activeFilter==="all"||activeFilter==="supplements" ? supplements : []),
  ];

  const noResults = search && allFiltered.length === 0;

  /* ── Checkout close resets cart ── */
  const handleCheckoutClose = () => {
    setCheckoutOpen(false);
    clearCart();
  };

  return (
    <div className="shop-wrapper" style={{marginTop: "-72px"}}>
      <Toast toasts={toasts} removeToast={removeToast}/>

      <ShopNav
        cartCount={totalCartCount}
        wishlistCount={wishlist.length}
        onCartOpen={() => { setCartOpen(true); setWishOpen(false); }}
        onWishlistOpen={() => { setWishOpen(true); setCartOpen(false); }}
        searchVal={search}
        onSearch={setSearch}
      />

      {/* Hero banner */}
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

      {/* Filter toolbar */}
      <div className="shop-toolbar">
        <div className="shop-toolbar-inner">
          <div className="shop-filter-tabs">
            <FilterIcon/>
            {[
              { id:"all",         label:"All Products" },
              { id:"merch",       label:"Merch" },
              { id:"essentials",  label:"Essentials" },
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

      {/* Main layout */}
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
                        isWishlisted={wishlist.some(w=>w.id===p.id)}
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
                        isWishlisted={wishlist.some(w=>w.id===p.id)}
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
                        isWishlisted={wishlist.some(w=>w.id===p.id)}
                        onToggleWishlist={toggleWishlist}/>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </main>

        {/* Sticky cart summary sidebar */}
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
                  <li key={item.id} className="scs-item">
                    <img src={item.img} alt={item.name} onError={e=>{e.target.style.display="none";}}/>
                    <div className="scs-item-info">
                      <p className="scs-item-name">{item.name}</p>
                      <p className="scs-item-price">${(item.price*item.qty).toLocaleString()} JMD</p>
                    </div>
                    <div className="scs-item-qty">
                      <button onClick={()=>removeFromCart(item)}><MinusIcon/></button>
                      <span>{item.qty}</span>
                      <button onClick={()=>addToCart(item)}><PlusIcon/></button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="scs-totals">
                <div className="sct-row"><span>Subtotal</span><span>${cartItems.reduce((s,i)=>s+i.price*i.qty,0).toLocaleString()}</span></div>
                <div className="sct-row"><span>Tax (15%)</span><span>${Math.round(cartItems.reduce((s,i)=>s+i.price*i.qty,0)*TAX_RATE).toLocaleString()}</span></div>
                <div className="sct-row sct-total">
                  <span>Total</span>
                  <span>${(cartItems.reduce((s,i)=>s+i.price*i.qty,0) + Math.round(cartItems.reduce((s,i)=>s+i.price*i.qty,0)*TAX_RATE) + (cartItems.reduce((s,i)=>s+i.price*i.qty,0)>=10000?0:SHIPPING)).toLocaleString()} JMD</span>
                </div>
              </div>

              <button className="scs-checkout-btn" onClick={()=>setCheckoutOpen(true)}>
                Checkout <ArrowRight/>
              </button>
              <button className="scs-clear-btn" onClick={clearCart}>Clear cart</button>
            </>
          )}

          {/* Trust badges */}
          <div className="scs-trust">
            <div className="scs-trust-item"><ShieldIcon/> Secure payment</div>
            <div className="scs-trust-item"><TruckIcon/> Fast delivery</div>
            <div className="scs-trust-item"><CheckIcon/> Quality guaranteed</div>
          </div>
        </aside>
      </div>

      {/* Drawers */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onAdd={addToCart}
        onRemove={removeFromCart}
        onRemoveAll={removeAllFromCart}
        onClear={clearCart}
        onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }}
      />

      <WishlistDrawer
        open={wishOpen}
        onClose={() => setWishOpen(false)}
        wishlist={wishlist}
        onRemove={toggleWishlist}
        onMoveToCart={moveToCart}
      />

      {/* Checkout */}
      <CheckoutModal
        open={checkoutOpen}
        onClose={handleCheckoutClose}
        cartItems={cartItems}
      />

      {/* Footer */}
      <footer className="shop-footer">
      </footer>
    </div>
  );
}