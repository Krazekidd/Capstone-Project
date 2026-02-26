import React from "react";
import { Link } from "react-router-dom";
import "./Shop.css";

const Shop = () => {
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

          <div className="shop-header-cart">
            <i className="fas fa-shopping-cart"></i>
            <span className="shop-cart-count" id="cartCount">
              0
            </span>
          </div>
        </div>
      </nav>

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
                <i className="fas fa-heart shop-wishlist"></i>
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
                <i className="fas fa-heart shop-wishlist"></i>
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
                <i className="fas fa-heart shop-wishlist"></i>
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
                <i className="fas fa-heart shop-wishlist"></i>
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
                <i className="fas fa-heart shop-wishlist"></i>
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
                <i className="fas fa-heart shop-wishlist"></i>
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
                <i className="fas fa-heart shop-wishlist"></i>
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
                <i className="fas fa-heart shop-wishlist"></i>
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
                <i className="fas fa-heart shop-wishlist"></i>
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
                <i className="fas fa-heart shop-wishlist"></i>
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
                <i className="fas fa-heart shop-wishlist"></i>
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
                <i className="fas fa-heart shop-wishlist"></i>
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
