import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Shop.css";

const Shop = () => {
  const [wishlist, setWishlist] = useState([]);
  const [wishlistOpen, setWishlistOpen] = useState(false);

  const toggleWishlist = (id, name, price) => {
    setWishlist(prev =>
      prev.find(p => p.id === id)
        ? prev.filter(p => p.id !== id)
        : [...prev, { id, name, price }]
    );
  };

  const isWishlisted = (id) => wishlist.some(p => p.id === id);

  return (
    <div className="shop-container-wrapper">
      {/* NAV FOR STORE */}
      <nav className="shop-header">
        <div className="shop-header-left">
          <img src="images/triallogo.png" alt="B.A.D People Fitness Logo" />
          <div className="shop-brand-text">
            <h1>B.A.D People Fitness</h1>
            <span>Official Fitness Store</span>
          </div>
        </div>

        <div className="shop-header-right">
          <Link to="/">Home</Link>
          <Link to="/shop" className="active">
            Shop
          </Link>
          <Link to="/membership">Membership</Link>

          {/* Wishlist heart icon in nav */}
          <div
            className="shop-header-cart"
            onClick={() => setWishlistOpen(true)}
            title="View Wishlist"
          >
            <i
              className="fas fa-heart"
              style={{
                fontSize: "20px",
                color: wishlist.length > 0 ? "orangered" : "white",
                transition: "color 0.3s",
              }}
            />
            {wishlist.length > 0 && (
              <span className="shop-cart-count">{wishlist.length}</span>
            )}
          </div>

          <div className="shop-header-cart">
            <i className="fas fa-shopping-cart"></i>
            <span className="shop-cart-count" id="cartCount">
              0
            </span>
          </div>
        </div>
      </nav>

      {/* WISHLIST DRAWER */}
      {wishlistOpen && (
        <div className="wishlist-overlay" onClick={() => setWishlistOpen(false)}>
          <div className="wishlist-drawer" onClick={e => e.stopPropagation()}>
            <div className="wishlist-drawer-header">
              <h3>
                <i className="fas fa-heart" /> Wishlist ({wishlist.length})
              </h3>
              <button className="wishlist-close" onClick={() => setWishlistOpen(false)}>✕</button>
            </div>

            {wishlist.length === 0 ? (
              <div className="wishlist-empty">
                <i className="fas fa-heart-broken" />
                <p>Your wishlist is empty</p>
                <span>Click the ♥ on any item to save it here</span>
              </div>
            ) : (
              <ul className="wishlist-items">
                {wishlist.map(product => (
                  <li key={product.id} className="wishlist-item">
                    <div className="wishlist-item-info">
                      <p className="wishlist-item-name">{product.name}</p>
                      <p className="wishlist-item-price">{product.price}</p>
                    </div>
                    <button
                      className="wishlist-remove-btn"
                      onClick={() => toggleWishlist(product.id)}
                    >
                      <i className="fas fa-trash" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {wishlist.length > 0 && (
              <div className="wishlist-footer">
                <button className="wishlist-clear-btn" onClick={() => setWishlist([])}>
                  Clear Wishlist
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <section className="shop-container">
        {/* PRODUCTS SECTION */}
        <main className="shop-product-sections">
          {/* B.A.D PPL MERCH */}
          <h2 className="shop-section-title">Merch</h2>
          <div className="shop-product-grid">
            <div
              className="shop-product-card"
              data-name="Gym T-Shirt"
              data-price="25"
            >
              <div className="shop-product-top">
                <input type="checkbox" className="shop-select-item" />
                <i
                  className={`fas fa-heart shop-wishlist ${isWishlisted("gym-tshirt") ? "active" : ""}`}
                  onClick={() => toggleWishlist("gym-tshirt", "Gym T-Shirt", "$1500.00 JMD")}
                ></i>
              </div>
              {"images/SHIRT.webp" ? (
                <img src="images/SHIRT.webp" alt="Gym T-Shirt" />
              ) : (
                <div className="shop-placeholder-image">Image Unavailable</div>
              )}
              <h4>Gym T-Shirt</h4>
              <p>$1500.00 JMD</p>
              <div className="shop-product-controls">
                <button className="remove-product">-</button>
                <span className="quantity">0</span>
                <button className="add-product">+</button>
              </div>
            </div>

            <div
              className="shop-product-card"
              data-name="Hoodie"
              data-price="50"
            >
              <div className="shop-product-top">
                <input type="checkbox" className="shop-select-item" />
                <i
                  className={`fas fa-heart shop-wishlist ${isWishlisted("hoodie") ? "active" : ""}`}
                  onClick={() => toggleWishlist("hoodie", "Hoodie", "$2500.00 JMD")}
                ></i>
              </div>
              {"images/merch2.png" ? (
                <img src="images/merch2.png" alt="Hoodie" />
              ) : (
                <div className="shop-placeholder-image">Image Unavailable</div>
              )}
              <h4>Hoodie</h4>
              <p>$2500.00 JMD</p>
              <div className="shop-product-controls">
                <button className="remove-product">-</button>
                <span className="quantity">0</span>
                <button className="add-product">+</button>
              </div>
            </div>

            <div
              className="shop-product-card"
              data-name="Gym Cap"
              data-price="20"
            >
              <div className="shop-product-top">
                <input type="checkbox" className="shop-select-item" />
                <i
                  className={`fas fa-heart shop-wishlist ${isWishlisted("gym-cap") ? "active" : ""}`}
                  onClick={() => toggleWishlist("gym-cap", "Gym Cap", "$500.00 JMD")}
                ></i>
              </div>
              {"images/CAP.jpg" ? (
                <img src="images/CAP.jpg" alt="Gym Cap" />
              ) : (
                <div className="shop-placeholder-image">Image Unavailable</div>
              )}
              <h4>Gym Cap</h4>
              <p>$500.00 JMD</p>
              <div className="shop-product-controls">
                <button className="remove-product">-</button>
                <span className="quantity">0</span>
                <button className="add-product">+</button>
              </div>
            </div>

            <div
              className="shop-product-card"
              data-name="Gym Towel"
              data-price="15"
            >
              <div className="shop-product-top">
                <input type="checkbox" className="shop-select-item" />
                <i
                  className={`fas fa-heart shop-wishlist ${isWishlisted("gym-towel") ? "active" : ""}`}
                  onClick={() => toggleWishlist("gym-towel", "Gym Towel", "$1000.00 JMD")}
                ></i>
              </div>
              {"images/TOWEL.jpg" ? (
                <img src="images/TOWEL.jpg" alt="Gym Towel" />
              ) : (
                <div className="shop-placeholder-image">Image Unavailable</div>
              )}
              <h4>Gym Towel</h4>
              <p>$1000.00 JMD</p>
              <div className="shop-product-controls">
                <button className="remove-product">-</button>
                <span className="quantity">0</span>
                <button className="add-product">+</button>
              </div>
            </div>
          </div>

          {/* GYM ESSENTIALS */}
          <h2 className="shop-section-title">Gym Essentials</h2>
          <div className="shop-product-grid">
            <div
              className="shop-product-card"
              data-name="Yoga Mat"
              data-price="35"
            >
              <div className="shop-product-top">
                <input type="checkbox" className="shop-select-item" />
                <i
                  className={`fas fa-heart shop-wishlist ${isWishlisted("yoga-mat") ? "active" : ""}`}
                  onClick={() => toggleWishlist("yoga-mat", "Yoga Mat", "$1500.00 JMD")}
                ></i>
              </div>
              {"images/mat.webp" ? (
                <img src="images/mat.webp" alt="Yoga Mat" />
              ) : (
                <div className="shop-placeholder-image">Image Unavailable</div>
              )}
              <h4>Yoga Mat</h4>
              <p>$1500.00 JMD</p>
              <div className="shop-product-controls">
                <button className="remove-product">-</button>
                <span className="quantity">0</span>
                <button className="add-product">+</button>
              </div>
            </div>

            <div
              className="shop-product-card"
              data-name="Resistance Bands"
              data-price="25"
            >
              <div className="shop-product-top">
                <input type="checkbox" className="shop-select-item" />
                <i
                  className={`fas fa-heart shop-wishlist ${isWishlisted("resistance-bands") ? "active" : ""}`}
                  onClick={() => toggleWishlist("resistance-bands", "Resistance Bands", "$1000.00")}
                ></i>
              </div>
              {"images/bands.png" ? (
                <img src="images/bands.png" alt="Resistance Bands" />
              ) : (
                <div className="shop-placeholder-image">Image Unavailable</div>
              )}
              <h4>Resistance Bands</h4>
              <p>$1000.00</p>
              <div className="shop-product-controls">
                <button className="remove-product">-</button>
                <span className="quantity">0</span>
                <button className="add-product">+</button>
              </div>
            </div>

            <div
              className="shop-product-card"
              data-name="Gym Gloves"
              data-price="80"
            >
              <div className="shop-product-top">
                <input type="checkbox" className="shop-select-item" />
                <i
                  className={`fas fa-heart shop-wishlist ${isWishlisted("gym-gloves") ? "active" : ""}`}
                  onClick={() => toggleWishlist("gym-gloves", "Gym Gloves", "$1500.00 JMD")}
                ></i>
              </div>
              {"images/GLOVES.jpg" ? (
                <img src="images/GLOVES.jpg" alt="Gym Gloves" />
              ) : (
                <div className="shop-placeholder-image">Image Unavailable</div>
              )}
              <h4>Gym Gloves</h4>
              <p>$1500.00 JMD</p>
              <div className="shop-product-controls">
                <button className="remove-product">-</button>
                <span className="quantity">0</span>
                <button className="add-product">+</button>
              </div>
            </div>

            <div
              className="shop-product-card"
              data-name="Jump Rope"
              data-price="18"
            >
              <div className="shop-product-top">
                <input type="checkbox" className="shop-select-item" />
                <i
                  className={`fas fa-heart shop-wishlist ${isWishlisted("jump-rope") ? "active" : ""}`}
                  onClick={() => toggleWishlist("jump-rope", "Jump Rope", "$2000.00 JMD")}
                ></i>
              </div>
              {"images/ROPE.webp" ? (
                <img src="images/ROPE.webp" alt="Jump Rope" />
              ) : (
                <div className="shop-placeholder-image">Image Unavailable</div>
              )}
              <h4>Jump Rope</h4>
              <p>$2000.00 JMD</p>
              <div className="shop-product-controls">
                <button className="remove-product">-</button>
                <span className="quantity">0</span>
                <button className="add-product">+</button>
              </div>
            </div>
          </div>

          {/* SUPPLEMENTS */}
          <h2 className="shop-section-title">Supplements</h2>
          <div className="shop-product-grid">
            <div
              className="shop-product-card"
              data-name="Protein Powder"
              data-price="60"
            >
              <div className="shop-product-top">
                <input type="checkbox" className="shop-select-item" />
                <i
                  className={`fas fa-heart shop-wishlist ${isWishlisted("protein-powder") ? "active" : ""}`}
                  onClick={() => toggleWishlist("protein-powder", "Protein Powder", "$3000.00 JMD")}
                ></i>
              </div>
              {"images/protein.png" ? (
                <img src="images/protein.png" alt="Protein Powder" />
              ) : (
                <div className="shop-placeholder-image">Image Unavailable</div>
              )}
              <h4>Protein Powder</h4>
              <p>$3000.00 JMD</p>
              <div className="shop-product-controls">
                <button className="remove-product">-</button>
                <span className="quantity">0</span>
                <button className="add-product">+</button>
              </div>
            </div>

            <div
              className="shop-product-card"
              data-name="Creatine"
              data-price="45"
            >
              <div className="shop-product-top">
                <input type="checkbox" className="shop-select-item" />
                <i
                  className={`fas fa-heart shop-wishlist ${isWishlisted("creatine") ? "active" : ""}`}
                  onClick={() => toggleWishlist("creatine", "Creatine", "$5000.00 JMD")}
                ></i>
              </div>
              {"images/creatine.png" ? (
                <img src="images/creatine.png" alt="Creatine" />
              ) : (
                <div className="shop-placeholder-image">Image Unavailable</div>
              )}
              <h4>Creatine</h4>
              <p>$5000.00 JMD</p>
              <div className="shop-product-controls">
                <button className="remove-product">-</button>
                <span className="quantity">0</span>
                <button className="add-product">+</button>
              </div>
            </div>

            <div
              className="shop-product-card"
              data-name="Multivitamins"
              data-price="30"
            >
              <div className="shop-product-top">
                <input type="checkbox" className="shop-select-item" />
                <i
                  className={`fas fa-heart shop-wishlist ${isWishlisted("multivitamins") ? "active" : ""}`}
                  onClick={() => toggleWishlist("multivitamins", "Multivitamins", "$3000.00 JMD")}
                ></i>
              </div>
              {"images/vitamins.png" ? (
                <img src="images/vitamins.png" alt="Multivitamins" />
              ) : (
                <div className="shop-placeholder-image">Image Unavailable</div>
              )}
              <h4>Multivitamins</h4>
              <p>$3000.00 JMD</p>
              <div className="shop-product-controls">
                <button className="remove-product">-</button>
                <span className="quantity">0</span>
                <button className="add-product">+</button>
              </div>
            </div>

            <div
              className="shop-product-card"
              data-name="Pre-Workout"
              data-price="40"
            >
              <div className="shop-product-top">
                <input type="checkbox" className="shop-select-item" />
                <i
                  className={`fas fa-heart shop-wishlist ${isWishlisted("pre-workout") ? "active" : ""}`}
                  onClick={() => toggleWishlist("pre-workout", "Pre-Workout", "$3000.00 JMD")}
                ></i>
              </div>
              {"images/preworkout.png" ? (
                <img src="images/preworkout.png" alt="Pre-Workout" />
              ) : (
                <div className="shop-placeholder-image">Image Unavailable</div>
              )}
              <h4>Pre-Workout</h4>
              <p>$3000.00 JMD</p>
              <div className="shop-product-controls">
                <button className="remove-product">-</button>
                <span className="quantity">0</span>
                <button className="add-product">+</button>
              </div>
            </div>
          </div>
        </main>

        {/* SIDE BAR DISPLAY CART */}
        <aside className="shop-cart-summary">
          <h3>
            <i className="fas fa-shopping-cart"></i> Cart
          </h3>
          <ul id="shop-cart-items">
            <li>No items selected</li>
          </ul>
          <div className="shop-totals">
            <p>
              Subtotal{" "}
              <span>
                $<span id="subtotal">0.00</span>
              </span>
            </p>
            <p>
              Tax (15%){" "}
              <span>
                $<span id="tax">0.00</span>
              </span>
            </p>
            <p>
              <strong>
                Total{" "}
                <span>
                  $<span id="total">0.00</span>
                </span>
              </strong>
            </p>
            <button id="shop-checkout">Purchase</button>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default Shop;