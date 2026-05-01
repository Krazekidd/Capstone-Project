from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, and_, or_, func
from sqlalchemy.orm import selectinload
from datetime import datetime
import uuid

from database import get_user_db
from models import (
    User, Product, Order, OrderItem, ProductReview, Wishlist
)
from schemas import (
    ProductResponse,
    ProductBase,
    ProductReviewBase,
    ProductReviewResponse,
    OrderResponse,
    OrderBase,
    OrderItemResponse,
    WishlistResponse,
    APIResponse,
)
from ..auth.auth import get_current_user

router = APIRouter(prefix="/api/v1/shop", tags=["shop"])


# ========== PRODUCTS ==========

@router.get("/products", response_model=list[ProductResponse])
async def get_products(
    category: str = Query(default=None),
    sort: str = Query(default="featured"),
    limit: int = Query(default=20, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_user_db),
):
    """Get products with optional filtering and sorting"""
    query = select(Product).where(Product.is_active == True)
    
    # Filter by category
    if category:
        query = query.where(Product.category == category)
    
    # Apply sorting
    if sort == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort == "price_desc":
        query = query.order_by(Product.price.desc())
    elif sort == "name_az":
        query = query.order_by(Product.name.asc())
    else:  # featured or default
        query = query.order_by(Product.sort_order.asc(), Product.created_at.desc())
    
    query = query.offset(offset).limit(limit)
    
    result = await db.execute(query)
    products = result.scalars().all()
    
    return products


@router.get("/products/{slug}", response_model=ProductResponse)
async def get_product(slug: str, db: AsyncSession = Depends(get_user_db)):
    """Get a specific product by slug"""
    result = await db.execute(
        select(Product).where(
            Product.slug == slug,
            Product.is_active == True
        )
    )
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return product


# ========== PRODUCT REVIEWS ==========

@router.post("/products/{product_id}/reviews", response_model=ProductReviewResponse)
async def create_product_review(
    product_id: uuid.UUID,
    review_data: ProductReviewBase,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db),
):
    """Create a product review"""
    user_id = current_user["user_id"]
    
    # Check product exists
    product_result = await db.execute(
        select(Product).where(Product.id == product_id)
    )
    product = product_result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if user already reviewed this product
    existing_result = await db.execute(
        select(ProductReview).where(
            ProductReview.product_id == product_id,
            ProductReview.user_id == user_id
        )
    )
    existing_review = existing_result.scalar_one_or_none()
    
    if existing_review:
        raise HTTPException(
            status_code=409,
            detail="You have already reviewed this product"
        )
    
    # Create review
    new_review = ProductReview(
        product_id=product_id,
        user_id=user_id,
        rating=review_data.rating,
        body=review_data.body,
    )
    
    db.add(new_review)
    await db.commit()
    await db.refresh(new_review)
    
    # Update product rating and review count
    rating_stats = await db.execute(
        select(
            func.avg(ProductReview.rating).label('avg_rating'),
            func.count(ProductReview.id).label('review_count')
        ).where(ProductReview.product_id == product_id)
    )
    stats = rating_stats.first()
    
    await db.execute(
        update(Product)
        .where(Product.id == product_id)
        .values(
            average_rating=round(stats.avg_rating, 2) if stats.avg_rating else 0,
            review_count=stats.review_count or 0
        )
    )
    await db.commit()
    
    return new_review


@router.get("/products/{product_id}/reviews", response_model=list[ProductReviewResponse])
async def get_product_reviews(
    product_id: uuid.UUID,
    limit: int = Query(default=10, le=50),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_user_db),
):
    """Get reviews for a product"""
    result = await db.execute(
        select(ProductReview)
        .where(ProductReview.product_id == product_id)
        .order_by(ProductReview.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    reviews = result.scalars().all()
    
    return reviews


# ========== WISHLISTS ==========

@router.get("/wishlists", response_model=list[WishlistResponse])
async def get_wishlist(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db),
):
    """Get user's wishlist"""
    user_id = current_user["user_id"]
    
    result = await db.execute(
        select(Wishlist)
        .options(selectinload(Wishlist.product))
        .where(Wishlist.user_id == user_id)
        .order_by(Wishlist.added_at.desc())
    )
    wishlist_items = result.scalars().all()
    
    return wishlist_items


@router.post("/wishlists", response_model=WishlistResponse)
async def add_to_wishlist(
    product_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db),
):
    """Add product to wishlist"""
    user_id = current_user["user_id"]
    
    # Check product exists
    product_result = await db.execute(
        select(Product).where(Product.id == product_id)
    )
    product = product_result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if already in wishlist
    existing_result = await db.execute(
        select(Wishlist).where(
            Wishlist.user_id == user_id,
            Wishlist.product_id == product_id
        )
    )
    existing_item = existing_result.scalar_one_or_none()
    
    if existing_item:
        return existing_item  # Already in wishlist
    
    # Add to wishlist
    new_wishlist_item = Wishlist(
        user_id=user_id,
        product_id=product_id,
    )
    
    db.add(new_wishlist_item)
    await db.commit()
    await db.refresh(new_wishlist_item)
    
    await db.refresh(new_wishlist_item, ["product"])
    
    return new_wishlist_item


@router.delete("/wishlists/{product_id}")
async def remove_from_wishlist(
    product_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db),
):
    """Remove product from wishlist"""
    user_id = current_user["user_id"]
    
    # Find and delete wishlist item
    result = await db.execute(
        select(Wishlist).where(
            Wishlist.user_id == user_id,
            Wishlist.product_id == product_id
        )
    )
    wishlist_item = result.scalar_one_or_none()
    
    if not wishlist_item:
        raise HTTPException(status_code=404, detail="Item not found in wishlist")
    
    await db.delete(wishlist_item)
    await db.commit()
    
    return APIResponse(success=True, message="Item removed from wishlist")


# ========== ORDERS ==========

@router.post("/orders", response_model=OrderResponse)
async def create_order(
    order_data: OrderBase,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db),
):
    """Create a new order"""
    user_id = current_user["user_id"]
    
    # Validate all products exist and have enough stock
    product_ids = [item.product_id for item in order_data.items]
    products_result = await db.execute(
        select(Product).where(Product.id.in_(product_ids))
    )
    products = {p.id: p for p in products_result.scalars().all()}
    
    for item in order_data.items:
        if item.product_id not in products:
            raise HTTPException(
                status_code=404, 
                detail=f"Product {item.product_id} not found"
            )
        
        product = products[item.product_id]
        if product.stock_qty < item.quantity:
            raise HTTPException(
                status_code=422,
                detail=f"Insufficient stock for product {product.name}"
            )
    
    # Calculate totals
    subtotal = sum(item.quantity * item.unit_price for item in order_data.items)
    shipping_fee = 0  # TODO: Calculate based on shipping address
    discount = 0
    total = subtotal + shipping_fee - discount
    
    # Generate order reference
    date_str = datetime.now().strftime("%Y%m%d")
    count_result = await db.execute(
        select(Order).where(Order.placed_at >= datetime.now().replace(hour=0, minute=0, second=0))
    )
    count = len(count_result.scalars().all()) + 1
    reference = f"GVO-{date_str}-{count:04d}"
    
    # Create order
    new_order = Order(
        reference=reference,
        user_id=user_id,
        status="pending",
        subtotal=subtotal,
        shipping_fee=shipping_fee,
        discount=discount,
        total=total,
        shipping_address=order_data.shipping_address,
        notes=order_data.notes,
    )
    
    db.add(new_order)
    await db.flush()  # Get the order ID
    
    # Create order items
    for item_data in order_data.items:
        order_item = OrderItem(
            order_id=new_order.id,
            product_id=item_data.product_id,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
            line_total=item_data.quantity * item_data.unit_price,
        )
        db.add(order_item)
        
        # Update product stock
        product = products[item_data.product_id]
        await db.execute(
            update(Product)
            .where(Product.id == item_data.product_id)
            .values(stock_qty=product.stock_qty - item_data.quantity)
        )
    
    await db.commit()
    await db.refresh(new_order)
    
    # Load items for response
    await db.refresh(new_order, ["items"])
    
    return new_order


@router.get("/orders", response_model=list[OrderResponse])
async def get_orders(
    status_filter: str = Query(default=None),
    limit: int = Query(default=10, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db),
):
    """Get user's orders"""
    user_id = current_user["user_id"]
    
    query = select(Order).options(
        selectinload(Order.items).selectinload(OrderItem.product)
    ).where(Order.user_id == user_id)
    
    if status_filter:
        query = query.where(Order.status == status_filter)
    
    query = query.order_by(Order.placed_at.desc()).offset(offset).limit(limit)
    
    result = await db.execute(query)
    orders = result.scalars().all()
    
    return orders


@router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db),
):
    """Get a specific order"""
    user_id = current_user["user_id"]
    
    result = await db.execute(
        select(Order)
        .options(
            selectinload(Order.items).selectinload(OrderItem.product)
        )
        .where(
            Order.id == order_id,
            Order.user_id == user_id
        )
    )
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return order
