from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, and_, func
from datetime import datetime
import uuid
import secrets
import logging
from typing import Optional, List
from database import get_user_db
from models import User, Client, ShopProduct, ShopCategory, ShopCartItem, ShopWishlistItem, ShopOrder, ShopOrderItem
from schemas import (
    ShopCategoryResponse, ShopProductResponse, ShopProductDetailResponse,
    AddToCartRequest, UpdateCartRequest, CartResponse, CartItemResponse,
    WishlistItemResponse, WishlistResponse, PlaceOrderRequest, OrderResponse,
    OrderItemResponse, OrdersListResponse
)
from auth_router import get_current_user
from email_service import send_order_confirmation_email

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/shop", tags=["shop"])

TAX_RATE = 0.15
SHIPPING_THRESHOLD = 10000
SHIPPING_COST = 500

# ============================================================
# PRODUCT ENDPOINTS
# ============================================================

@router.get("/categories", response_model=List[ShopCategoryResponse])
async def get_categories(
    db: AsyncSession = Depends(get_user_db)
):
    """Get all shop categories"""
    result = await db.execute(
        select(ShopCategory)
        .where(ShopCategory.is_active == True)
        .order_by(ShopCategory.display_order)
    )
    categories = result.scalars().all()
    
    return [
        ShopCategoryResponse(
            id=c.id,
            name=c.name,
            display_name=c.display_name,
            icon=c.icon,
            display_order=c.display_order
        )
        for c in categories
    ]

@router.get("/products", response_model=List[ShopProductResponse])
async def get_products(
    category_id: Optional[str] = None,
    featured: Optional[bool] = None,
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_user_db)
):
    """Get products with filters"""
    query = select(ShopProduct).where(ShopProduct.is_active == True)
    
    if category_id:
        query = query.where(ShopProduct.category_id == category_id)
    
    if featured:
        query = query.where(ShopProduct.featured == True)
    
    if search:
        query = query.where(ShopProduct.name.contains(search))
    
    query = query.order_by(ShopProduct.display_order, ShopProduct.name).limit(limit)
    
    result = await db.execute(query)
    products = result.scalars().all()
    
    return [
        ShopProductResponse(
            id=p.id,
            name=p.name,
            description=p.description,
            price=float(p.price),
            category_id=p.category_id,
            image_url=p.image_url,
            badge_text=p.badge_text,
            badge_color=p.badge_color,
            rating=float(p.rating) if p.rating else 4.5,
            review_count=p.review_count,
            stock_quantity=p.stock_quantity,
            is_active=p.is_active,
            featured=p.featured
        )
        for p in products
    ]

@router.get("/products/{product_id}", response_model=ShopProductDetailResponse)
async def get_product_by_id(
    product_id: str,
    db: AsyncSession = Depends(get_user_db)
):
    """Get product by ID"""
    result = await db.execute(
        select(ShopProduct).where(ShopProduct.id == product_id)
    )
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return ShopProductDetailResponse(
        id=product.id,
        name=product.name,
        description=product.description,
        price=float(product.price),
        category_id=product.category_id,
        image_url=product.image_url,
        badge_text=product.badge_text,
        badge_color=product.badge_color,
        rating=float(product.rating) if product.rating else 4.5,
        review_count=product.review_count,
        stock_quantity=product.stock_quantity,
        is_active=product.is_active,
        featured=product.featured,
        created_at=product.created_at,
        updated_at=product.updated_at
    )

# ============================================================
# CART ENDPOINTS
# ============================================================

@router.get("/cart", response_model=CartResponse)
async def get_cart(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get current user's cart"""
    user_id = current_user["user_id"]
    user_id_bytes = user_id.bytes
    
    result = await db.execute(
        select(ShopCartItem, ShopProduct)
        .join(ShopProduct, ShopCartItem.product_id == ShopProduct.id)
        .where(ShopCartItem.client_id == user_id_bytes)
    )
    rows = result.all()
    
    items = []
    subtotal = 0
    
    for cart_item, product in rows:
        item_total = float(product.price) * cart_item.quantity
        subtotal += item_total
        items.append(CartItemResponse(
            product_id=product.id,
            name=product.name,
            price=float(product.price),
            quantity=cart_item.quantity,
            total=item_total,
            image_url=product.image_url
        ))
    
    tax = round(subtotal * TAX_RATE)
    shipping_cost = 0 if subtotal >= SHIPPING_THRESHOLD else SHIPPING_COST
    total = subtotal + tax + shipping_cost
    
    return CartResponse(
        items=items,
        subtotal=subtotal,
        tax=tax,
        shipping_cost=shipping_cost,
        total=total,
        item_count=sum(i.quantity for i in items)
    )

@router.post("/cart/add")
async def add_to_cart(
    request: AddToCartRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Add item to cart"""
    user_id = current_user["user_id"]
    user_id_bytes = user_id.bytes
    
    # Check if product exists
    product_result = await db.execute(
        select(ShopProduct).where(ShopProduct.id == request.product_id)
    )
    product = product_result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if item already in cart
    existing_result = await db.execute(
        select(ShopCartItem)
        .where(ShopCartItem.client_id == user_id_bytes)
        .where(ShopCartItem.product_id == request.product_id)
    )
    existing = existing_result.scalar_one_or_none()
    
    if existing:
        existing.quantity += request.quantity
    else:
        new_item = ShopCartItem(
            id=uuid.uuid4().bytes,
            client_id=user_id_bytes,
            product_id=request.product_id,
            quantity=request.quantity
        )
        db.add(new_item)
    
    await db.commit()
    
    return {"message": "Item added to cart"}

@router.put("/cart/update")
async def update_cart_item(
    request: UpdateCartRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Update cart item quantity"""
    user_id = current_user["user_id"]
    user_id_bytes = user_id.bytes
    
    result = await db.execute(
        select(ShopCartItem)
        .where(ShopCartItem.client_id == user_id_bytes)
        .where(ShopCartItem.product_id == request.product_id)
    )
    cart_item = result.scalar_one_or_none()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Item not in cart")
    
    if request.quantity <= 0:
        await db.delete(cart_item)
    else:
        cart_item.quantity = request.quantity
    
    await db.commit()
    
    return {"message": "Cart updated"}

@router.delete("/cart/remove/{product_id}")
async def remove_from_cart(
    product_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Remove item from cart"""
    user_id = current_user["user_id"]
    user_id_bytes = user_id.bytes
    
    result = await db.execute(
        select(ShopCartItem)
        .where(ShopCartItem.client_id == user_id_bytes)
        .where(ShopCartItem.product_id == product_id)
    )
    cart_item = result.scalar_one_or_none()
    
    if cart_item:
        await db.delete(cart_item)
        await db.commit()
    
    return {"message": "Item removed from cart"}

@router.delete("/cart/clear")
async def clear_cart(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Clear entire cart"""
    user_id = current_user["user_id"]
    user_id_bytes = user_id.bytes
    
    await db.execute(
        delete(ShopCartItem).where(ShopCartItem.client_id == user_id_bytes)
    )
    await db.commit()
    
    return {"message": "Cart cleared"}

# ============================================================
# WISHLIST ENDPOINTS
# ============================================================

@router.get("/wishlist", response_model=WishlistResponse)
async def get_wishlist(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get current user's wishlist"""
    user_id = current_user["user_id"]
    user_id_bytes = user_id.bytes
    
    result = await db.execute(
        select(ShopWishlistItem, ShopProduct)
        .join(ShopProduct, ShopWishlistItem.product_id == ShopProduct.id)
        .where(ShopWishlistItem.client_id == user_id_bytes)
    )
    rows = result.all()
    
    items = []
    for wish_item, product in rows:
        items.append(WishlistItemResponse(
            product_id=product.id,
            name=product.name,
            price=float(product.price),
            image_url=product.image_url
        ))
    
    return WishlistResponse(
        items=items,
        total=len(items)
    )

@router.post("/wishlist/add")
async def add_to_wishlist(
    request: AddToCartRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Add item to wishlist"""
    user_id = current_user["user_id"]
    user_id_bytes = user_id.bytes
    
    # Check if product exists
    product_result = await db.execute(
        select(ShopProduct).where(ShopProduct.id == request.product_id)
    )
    product = product_result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if already in wishlist
    existing_result = await db.execute(
        select(ShopWishlistItem)
        .where(ShopWishlistItem.client_id == user_id_bytes)
        .where(ShopWishlistItem.product_id == request.product_id)
    )
    existing = existing_result.scalar_one_or_none()
    
    if existing:
        return {"message": "Item already in wishlist"}
    
    new_item = ShopWishlistItem(
        id=uuid.uuid4().bytes,
        client_id=user_id_bytes,
        product_id=request.product_id
    )
    db.add(new_item)
    await db.commit()
    
    return {"message": "Item added to wishlist"}

@router.delete("/wishlist/remove/{product_id}")
async def remove_from_wishlist(
    product_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Remove item from wishlist"""
    user_id = current_user["user_id"]
    user_id_bytes = user_id.bytes
    
    result = await db.execute(
        select(ShopWishlistItem)
        .where(ShopWishlistItem.client_id == user_id_bytes)
        .where(ShopWishlistItem.product_id == product_id)
    )
    wish_item = result.scalar_one_or_none()
    
    if wish_item:
        await db.delete(wish_item)
        await db.commit()
    
    return {"message": "Item removed from wishlist"}

# ============================================================
# ORDER ENDPOINTS
# ============================================================

@router.post("/order/place", response_model=OrderResponse)
async def place_order(
    request: PlaceOrderRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Place an order"""
    user_id = current_user["user_id"]
    user_id_bytes = user_id.bytes
    
    # Get client info
    client_result = await db.execute(
        select(Client, User.email)
        .join(User, Client.id == User.id)
        .where(Client.id == user_id_bytes)
    )
    row = client_result.first()
    
    if not row:
        raise HTTPException(status_code=404, detail="Client not found")
    
    client, client_email = row
    
    # Get cart items
    cart_result = await db.execute(
        select(ShopCartItem, ShopProduct)
        .join(ShopProduct, ShopCartItem.product_id == ShopProduct.id)
        .where(ShopCartItem.client_id == user_id_bytes)
    )
    cart_rows = cart_result.all()
    
    if not cart_rows:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Calculate totals
    subtotal = 0
    items_data = []
    
    for cart_item, product in cart_rows:
        item_total = float(product.price) * cart_item.quantity
        subtotal += item_total
        items_data.append({
            "product_id": product.id,
            "product_name": product.name,
            "product_price": float(product.price),
            "quantity": cart_item.quantity,
            "total": item_total
        })
    
    tax = round(subtotal * TAX_RATE)
    shipping_cost = 0 if subtotal >= SHIPPING_THRESHOLD else SHIPPING_COST
    total = subtotal + tax + shipping_cost
    
    # Generate order reference
    order_ref = f"BAD-{secrets.token_hex(4).upper()}"
    
    # Create order
    order_id = uuid.uuid4()
    new_order = ShopOrder(
        id=order_id.bytes,
        order_reference=order_ref,
        client_id=user_id_bytes,
        order_status="pending",
        payment_status="paid" if request.payment_method == "card" else "pending",
        payment_method=request.payment_method,
        subtotal=subtotal,
        tax=tax,
        shipping_cost=shipping_cost,
        total=total,
        shipping_address=request.address,
        city=request.city,
        phone=request.phone,
        email=request.email,
        customer_name=request.customer_name,
        notes=request.notes
    )
    
    db.add(new_order)
    await db.flush()
    
    # Create order items
    for item in items_data:
        order_item = ShopOrderItem(
            id=uuid.uuid4().bytes,
            order_id=order_id.bytes,
            product_id=item["product_id"],
            product_name=item["product_name"],
            product_price=item["product_price"],
            quantity=item["quantity"],
            total=item["total"]
        )
        db.add(order_item)
    
    # Clear cart
    await db.execute(
        delete(ShopCartItem).where(ShopCartItem.client_id == user_id_bytes)
    )
    
    await db.commit()
    
    # Send confirmation email
    background_tasks.add_task(
        send_order_confirmation_email,
        email=request.email,
        customer_name=request.customer_name,
        order_reference=order_ref,
        items=items_data,
        subtotal=subtotal,
        tax=tax,
        shipping_cost=shipping_cost,
        total=total,
        shipping_address=request.address,
        city=request.city
    )
    
    # Return order details - FIX: Return dict instead of creating OrderResponse objects directly
    return {
        "id": uuid.UUID(bytes=new_order.id),
        "order_reference": order_ref,
        "order_status": "pending",
        "payment_status": "paid" if request.payment_method == "card" else "pending",
        "payment_method": request.payment_method,
        "subtotal": subtotal,
        "tax": tax,
        "shipping_cost": shipping_cost,
        "total": total,
        "shipping_address": request.address,
        "city": request.city,
        "customer_name": request.customer_name,
        "email": request.email,
        "phone": request.phone,
        "items": [
            {
                "product_id": i["product_id"],
                "product_name": i["product_name"],
                "product_price": i["product_price"],
                "quantity": i["quantity"],
                "total": i["total"]
            }
            for i in items_data
        ],
        "placed_at": new_order.placed_at
    }

@router.get("/orders", response_model=OrdersListResponse)
async def get_my_orders(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get current user's orders"""
    user_id = current_user["user_id"]
    user_id_bytes = user_id.bytes
    
    result = await db.execute(
        select(ShopOrder)
        .where(ShopOrder.client_id == user_id_bytes)
        .order_by(ShopOrder.placed_at.desc())
    )
    orders = result.scalars().all()
    
    orders_response = []
    for order in orders:
        # Get order items
        items_result = await db.execute(
            select(ShopOrderItem).where(ShopOrderItem.order_id == order.id)
        )
        items = items_result.scalars().all()
        
        orders_response.append(OrderResponse(
            id=uuid.UUID(bytes=order.id),
            order_reference=order.order_reference,
            order_status=order.order_status,
            payment_status=order.payment_status,
            payment_method=order.payment_method,
            subtotal=float(order.subtotal),
            tax=float(order.tax),
            shipping_cost=float(order.shipping_cost),
            total=float(order.total),
            shipping_address=order.shipping_address,
            city=order.city,
            customer_name=order.customer_name,
            email=order.email,
            phone=order.phone,
            items=[
                OrderItemResponse(
                    product_id=i.product_id,
                    product_name=i.product_name,
                    product_price=float(i.product_price),
                    quantity=i.quantity,
                    total=float(i.total)
                )
                for i in items
            ],
            placed_at=order.placed_at
        ))
    
    return OrdersListResponse(
        orders=orders_response,
        total=len(orders_response)
    )