import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Shop.css'

const Shop = () => {
  const [cartCount, setCartCount] = useState(0)
  const [selectedItems, setSelectedItems] = useState(new Set())

  const products = [
    { id: 1, name: 'Gym T-Shirt', price: 25, category: 'merch', image: '/images/tshirt.jpg' },
    { id: 2, name: 'Workout Shorts', price: 30, category: 'merch', image: '/images/shorts.jpg' },
    { id: 3, name: 'Water Bottle', price: 15, category: 'accessories', image: '/images/bottle.jpg' },
    { id: 4, name: 'Gym Bag', price: 45, category: 'accessories', image: '/images/bag.jpg' },
    { id: 5, name: 'Protein Powder', price: 35, category: 'supplements', image: '/images/protein.jpg' },
    { id: 6, name: 'Energy Bars', price: 20, category: 'supplements', image: '/images/bars.jpg' }
  ]

  const toggleItemSelection = (productId) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(productId)) {
      newSelected.delete(productId)
    } else {
      newSelected.add(productId)
    }
    setSelectedItems(newSelected)
    setCartCount(newSelected.size)
  }

  const addToCart = () => {
    if (selectedItems.size > 0) {
      console.log('Adding to cart:', Array.from(selectedItems))
      alert(`Added ${selectedItems.size} items to cart!`)
    }
  }

  return (
    <>
      <nav className="shop-header">
        <div className="header-left">
          <img src="/images/triallogo.png" alt="B.A.D People Fitness Logo" />
          <div className="brand-text">
            <h1>B.A.D People Fitness</h1>
            <span>Official Fitness Store</span>
          </div>
        </div>

        <div className="header-right">
          <Link to="/">Home</Link>
          <Link to="/shop" className="active">Shop</Link>
          <Link to="/membership">Membership</Link>

          <div className="header-cart">
            <i className="fas fa-shopping-cart"></i>
            <span className="cart-count">{cartCount}</span>
          </div>
        </div>
      </nav>

      <section className="shop-container">
        <main className="product-sections">
          <h2 className="section-title">Merch</h2>
          <div className="product-grid">
            {products.filter(p => p.category === 'merch').map(product => (
              <div key={product.id} className="product-card" data-name={product.name} data-price={product.price}>
                <div className="product-top">
                  <input 
                    type="checkbox" 
                    className="select-item"
                    checked={selectedItems.has(product.id)}
                    onChange={() => toggleItemSelection(product.id)}
                  />
                  <img src={product.image} alt={product.name} />
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="price">${product.price}</p>
                </div>
                <button 
                  className="add-to-cart"
                  onClick={() => toggleItemSelection(product.id)}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>

          <h2 className="section-title">Accessories</h2>
          <div className="product-grid">
            {products.filter(p => p.category === 'accessories').map(product => (
              <div key={product.id} className="product-card" data-name={product.name} data-price={product.price}>
                <div className="product-top">
                  <input 
                    type="checkbox" 
                    className="select-item"
                    checked={selectedItems.has(product.id)}
                    onChange={() => toggleItemSelection(product.id)}
                  />
                  <img src={product.image} alt={product.name} />
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="price">${product.price}</p>
                </div>
                <button 
                  className="add-to-cart"
                  onClick={() => toggleItemSelection(product.id)}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>

          <h2 className="section-title">Supplements</h2>
          <div className="product-grid">
            {products.filter(p => p.category === 'supplements').map(product => (
              <div key={product.id} className="product-card" data-name={product.name} data-price={product.price}>
                <div className="product-top">
                  <input 
                    type="checkbox" 
                    className="select-item"
                    checked={selectedItems.has(product.id)}
                    onChange={() => toggleItemSelection(product.id)}
                  />
                  <img src={product.image} alt={product.name} />
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="price">${product.price}</p>
                </div>
                <button 
                  className="add-to-cart"
                  onClick={() => toggleItemSelection(product.id)}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </main>

        <div className="cart-summary">
          <h3>Cart Summary</h3>
          <p>Items: {cartCount}</p>
          <p>Total: ${products.filter(p => selectedItems.has(p.id)).reduce((sum, p) => sum + p.price, 0)}</p>
          <button className="checkout-btn" onClick={addToCart} disabled={cartCount === 0}>
            Checkout
          </button>
        </div>
      </section>
    </>
  )
}

export default Shop
