# shop.py - Complete router file

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, and_, func
from datetime import datetime
import uuid
import secrets
import logging
from typing import Optional, List

from database import get_user_db
from models import (
    User, 
    Product, 
    ShopCartItem, 
    ShopWishlistItem, 
    ShopOrder, 
    ShopOrderItem
)
from schemas import (
    ShopProductResponse,
    ShopProductDetailResponse,
    AddToCartRequest,
    UpdateCartRequest,
    CartResponse,
    CartItemResponse,
    CartSummaryResponse,
    CartValidationResponse,
    WishlistItemResponse,
    WishlistResponse,
    PlaceOrderRequest,
    OrderResponse,
    OrderItemResponse,
    OrdersListResponse,
    APIResponse,
    BulkAddResponse,
    MergeCartResponse
)
from ..auth.auth import get_current_user
from email_service import send_order_confirmation_email

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/shop", tags=["shop"])

# Configuration constants
TAX_RATE = 0.15
SHIPPING_THRESHOLD = 10000  # JMD - free shipping over this amount
SHIPPING_COST = 500  # JMD
MAX_QUANTITY_PER_ITEM = 99


# ============================================================
# PRODUCT ENDPOINTS
# ============================================================

@router.get("/products", response_model=List[ShopProductResponse])
async def get_products(
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search by name"),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_user_db)
):
    """Get products with filters"""
    query = select(Product).where(Product.is_active == True)
    
    if category:
        query = query.where(Product.category == category)
    
    if search:
        query = query.where(Product.name.ilike(f"%{search}%"))
    
    query = query.order_by(Product.sort_order, Product.name).limit(limit)
    
    result = await db.execute(query)
    products = result.scalars().all()
    
    return [
        ShopProductResponse(
            id=str(product.id),
            name=product.name,
            description=product.description,
            price=float(product.price),
            category=product.category.value if hasattr(product.category, 'value') else product.category,
            image_url=product.image_url,
            badge_text=product.badge_label,
            badge_color=product.badge_color,
            rating=float(product.average_rating),
            review_count=product.review_count,
            stock_quantity=product.stock_qty,
            is_active=product.is_active,
            featured=False  # Add featured column to Product model if needed
        )
        for product in products
    ]




@router.get("/categories")
async def get_categories(
    db: AsyncSession = Depends(get_user_db)
):
    """Get unique categories with product counts"""
    result = await db.execute(
        select(Product.category, func.count(Product.id))
        .where(Product.is_active == True)
        .group_by(Product.category)
        .order_by(Product.category)
    )
    categories = result.all()
    
    # Display names mapping
    display_names = {
        'merch': 'Merchandise',
        'essentials': 'Essentials',
        'supplements': 'Supplements',
        'apparel': 'Apparel',
        'equipment': 'Equipment',
        'accessories': 'Accessories'
    }
    
    return [
        {
            "category": cat[0].value if hasattr(cat[0], 'value') else cat[0],
            "display_name": display_names.get(cat[0].value if hasattr(cat[0], 'value') else cat[0], cat[0]),
            "product_count": cat[1]
        }
        for cat in categories
    ]


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
    
    result = await db.execute(
        select(ShopCartItem, Product)
        .join(Product, ShopCartItem.product_id == Product.id)
        .where(ShopCartItem.user_id == user_id)
        .where(Product.is_active == True)
    )
    rows = result.all()
    
    items = []
    subtotal = 0
    
    for cart_item, product in rows:
        item_total = float(product.price) * cart_item.quantity
        subtotal += item_total
        items.append(CartItemResponse(
            product_id=str(product.id),
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


@router.get("/cart/summary", response_model=CartSummaryResponse)
async def get_cart_summary(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get lightweight cart summary for navbar"""
    user_id = current_user["user_id"]
    
    result = await db.execute(
        select(ShopCartItem, Product)
        .join(Product, ShopCartItem.product_id == Product.id)
        .where(ShopCartItem.user_id == user_id)
    )
    rows = result.all()
    
    item_count = sum(item.quantity for item, _ in rows)
    subtotal = sum(float(product.price) * item.quantity for item, product in rows)
    
    return CartSummaryResponse(
        item_count=item_count,
        subtotal=round(subtotal, 2)
    )


@router.post("/cart/add", response_model=APIResponse)
async def add_to_cart(
    request: AddToCartRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Add item to cart with stock validation"""
    user_id = current_user["user_id"]
    
    # Validate quantity
    if request.quantity > MAX_QUANTITY_PER_ITEM:
        raise HTTPException(
            status_code=400, 
            detail=f"Maximum quantity per item is {MAX_QUANTITY_PER_ITEM}"
        )
    
    # Get product
    product_uuid = uuid.UUID(request.product_id)
    result = await db.execute(
        select(Product).where(Product.id == product_uuid)
    )
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if not product.is_active:
        raise HTTPException(status_code=400, detail="Product is not available")
    
    # Check stock
    if product.stock_qty < request.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Only {product.stock_qty} items available in stock"
        )
    
    # Check existing cart item
    existing_result = await db.execute(
        select(ShopCartItem)
        .where(ShopCartItem.user_id == user_id)
        .where(ShopCartItem.product_id == product_uuid)
    )
    existing = existing_result.scalar_one_or_none()
    
    if existing:
        new_quantity = existing.quantity + request.quantity
        if product.stock_qty < new_quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot add {request.quantity} more. Maximum available is {product.stock_qty - existing.quantity}"
            )
        existing.quantity = new_quantity
        existing.updated_at = datetime.utcnow()
    else:
        new_item = ShopCartItem(
            user_id=user_id,
            product_id=product_uuid,
            quantity=request.quantity
        )
        db.add(new_item)
    
    await db.commit()
    
    return APIResponse(success=True, message="Item added to cart")


@router.put("/cart/update", response_model=APIResponse)
async def update_cart_item(
    request: UpdateCartRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Update cart item quantity"""
    user_id = current_user["user_id"]
    
    if request.quantity < 0:
        raise HTTPException(status_code=400, detail="Quantity cannot be negative")
    
    product_uuid = uuid.UUID(request.product_id)
    
    # Get cart item with product
    result = await db.execute(
        select(ShopCartItem, Product)
        .join(Product, ShopCartItem.product_id == Product.id)
        .where(ShopCartItem.user_id == user_id)
        .where(ShopCartItem.product_id == product_uuid)
    )
    row = result.first()
    
    if not row:
        raise HTTPException(status_code=404, detail="Item not in cart")
    
    cart_item, product = row
    
    if request.quantity == 0:
        await db.delete(cart_item)
        await db.commit()
        return APIResponse(success=True, message="Item removed from cart")
    
    # Validate against stock
    if request.quantity > product.stock_qty:
        raise HTTPException(
            status_code=400,
            detail=f"Only {product.stock_qty} items available in stock"
        )
    
    cart_item.quantity = request.quantity
    cart_item.updated_at = datetime.utcnow()
    await db.commit()
    
    return APIResponse(success=True, message="Cart updated")


@router.delete("/cart/clear", response_model=APIResponse)
async def clear_cart(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Clear entire cart"""
    user_id = current_user["user_id"]
    
    await db.execute(
        delete(ShopCartItem).where(ShopCartItem.user_id == user_id)
    )
    await db.commit()
    
    return APIResponse(success=True, message="Cart cleared")


@router.post("/cart/validate", response_model=CartValidationResponse)
async def validate_cart(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Validate cart before checkout"""
    user_id = current_user["user_id"]
    
    result = await db.execute(
        select(ShopCartItem, Product)
        .join(Product, ShopCartItem.product_id == Product.id)
        .where(ShopCartItem.user_id == user_id)
    )
    rows = result.all()
    
    errors = []
    warnings = []
    out_of_stock_items = []
    quantity_exceeds_stock = []
    original_total = 0.0
    
    for cart_item, product in rows:
        original_total += float(product.price) * cart_item.quantity
        
        if product.stock_qty == 0:
            out_of_stock_items.append(product.name)
            errors.append(f"{product.name} is out of stock")
        elif cart_item.quantity > product.stock_qty:
            quantity_exceeds_stock.append({
                "product": product.name,
                "requested": cart_item.quantity,
                "available": product.stock_qty
            })
            errors.append(f"Only {product.stock_qty} of {product.name} available")
        
        if not product.is_active:
            errors.append(f"{product.name} is no longer available")
    
    is_valid = len(errors) == 0
    
    return CartValidationResponse(
        is_valid=is_valid,
        errors=errors,
        warnings=warnings,
        out_of_stock_items=out_of_stock_items,
        quantity_exceeds_stock=quantity_exceeds_stock,
        original_total=round(original_total, 2),
        updated_total=round(original_total, 2)
    )


@router.post("/cart/bulk-add", response_model=BulkAddResponse)
async def bulk_add_to_cart(
    items: List[AddToCartRequest],
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Add multiple items to cart at once"""
    user_id = current_user["user_id"]
    added_count = 0
    errors = []
    
    for item in items:
        try:
            if item.quantity > MAX_QUANTITY_PER_ITEM:
                errors.append(f"Quantity {item.quantity} exceeds maximum")
                continue
            
            product_uuid = uuid.UUID(item.product_id)
            
            # Get product
            product_result = await db.execute(
                select(Product).where(Product.id == product_uuid)
            )
            product = product_result.scalar_one_or_none()
            
            if not product:
                errors.append(f"Product {item.product_id} not found")
                continue
            
            if not product.is_active:
                errors.append(f"Product {product.name} is not active")
                continue
            
            if product.stock_qty < item.quantity:
                errors.append(f"Only {product.stock_qty} of {product.name} available")
                continue
            
            # Check existing cart item
            existing_result = await db.execute(
                select(ShopCartItem)
                .where(ShopCartItem.user_id == user_id)
                .where(ShopCartItem.product_id == product_uuid)
            )
            existing = existing_result.scalar_one_or_none()
            
            new_quantity = (existing.quantity if existing else 0) + item.quantity
            
            if new_quantity > product.stock_qty:
                errors.append(f"Cannot add {item.quantity} of {product.name}")
                continue
            
            if existing:
                existing.quantity = new_quantity
                existing.updated_at = datetime.utcnow()
            else:
                new_item = ShopCartItem(
                    user_id=user_id,
                    product_id=product_uuid,
                    quantity=item.quantity
                )
                db.add(new_item)
            
            added_count += 1
            
        except Exception as e:
            errors.append(f"Error adding item {item.product_id}: {str(e)}")
    
    await db.commit()
    
    return BulkAddResponse(
        message=f"Added {added_count} items to cart",
        added_count=added_count,
        errors=errors if errors else None,
        success=added_count > 0
    )


@router.post("/cart/merge", response_model=MergeCartResponse)
async def merge_cart(
    items: List[AddToCartRequest],
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Merge guest cart with user cart (after login)"""
    user_id = current_user["user_id"]
    merged_count = 0
    conflicts = []
    
    for item in items:
        try:
            product_uuid = uuid.UUID(item.product_id)
            
            # Get product
            product_result = await db.execute(
                select(Product).where(Product.id == product_uuid)
            )
            product = product_result.scalar_one_or_none()
            
            if not product or not product.is_active:
                continue
            
            # Check existing cart item
            existing_result = await db.execute(
                select(ShopCartItem)
                .where(ShopCartItem.user_id == user_id)
                .where(ShopCartItem.product_id == product_uuid)
            )
            existing = existing_result.scalar_one_or_none()
            
            if existing:
                if item.quantity > existing.quantity:
                    new_quantity = min(item.quantity, product.stock_qty)
                    if new_quantity != existing.quantity:
                        existing.quantity = new_quantity
                        existing.updated_at = datetime.utcnow()
                        merged_count += 1
                        conflicts.append({
                            "product_id": item.product_id,
                            "product_name": product.name,
                            "original_quantity": existing.quantity,
                            "new_quantity": new_quantity
                        })
            else:
                final_quantity = min(item.quantity, product.stock_qty)
                if final_quantity > 0:
                    new_item = ShopCartItem(
                        user_id=user_id,
                        product_id=product_uuid,
                        quantity=final_quantity
                    )
                    db.add(new_item)
                    merged_count += 1
                    
        except Exception as e:
            logger.error(f"Error merging item {item.product_id}: {e}")
    
    await db.commit()
    
    return MergeCartResponse(
        message=f"Merged {merged_count} items into cart",
        merged_count=merged_count,
        conflicts=conflicts if conflicts else None,
        success=True
    )


# ============================================================
# WISHLIST ENDPOINTS
# ============================================================

@router.get("/wishlist", response_model=WishlistResponse)
async def get_wishlist(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get user's wishlist"""
    user_id = current_user["user_id"]
    
    result = await db.execute(
        select(ShopWishlistItem, Product)
        .join(Product, ShopWishlistItem.product_id == Product.id)
        .where(ShopWishlistItem.user_id == user_id)
        .where(Product.is_active == True)
        .order_by(ShopWishlistItem.added_at.desc())
    )
    rows = result.all()
    
    items = []
    for wish_item, product in rows:
        items.append(WishlistItemResponse(
            product_id=str(product.id),
            name=product.name,
            price=float(product.price),
            image_url=product.image_url
        ))
    
    return WishlistResponse(
        items=items,
        total=len(items)
    )


@router.post("/wishlist/add", response_model=APIResponse)
async def add_to_wishlist(
    request: AddToCartRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Add item to wishlist"""
    user_id = current_user["user_id"]
    product_uuid = uuid.UUID(request.product_id)
    
    # Check product exists
    product_result = await db.execute(
        select(Product).where(Product.id == product_uuid)
    )
    product = product_result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if not product.is_active:
        raise HTTPException(status_code=400, detail="Product is not available")
    
    # Check if already in wishlist
    existing_result = await db.execute(
        select(ShopWishlistItem)
        .where(ShopWishlistItem.user_id == user_id)
        .where(ShopWishlistItem.product_id == product_uuid)
    )
    existing = existing_result.scalar_one_or_none()
    
    if existing:
        return APIResponse(success=True, message="Item already in wishlist", data={"already_exists": True})
    
    new_item = ShopWishlistItem(
        user_id=user_id,
        product_id=product_uuid
    )
    db.add(new_item)
    await db.commit()
    
    return APIResponse(success=True, message="Item added to wishlist")


@router.delete("/wishlist/remove/{product_id}", response_model=APIResponse)
async def remove_from_wishlist(
    product_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Remove item from wishlist"""
    user_id = current_user["user_id"]
    product_uuid = uuid.UUID(product_id)
    
    result = await db.execute(
        select(ShopWishlistItem)
        .where(ShopWishlistItem.user_id == user_id)
        .where(ShopWishlistItem.product_id == product_uuid)
    )
    wish_item = result.scalar_one_or_none()
    
    if wish_item:
        await db.delete(wish_item)
        await db.commit()
    
    return APIResponse(success=True, message="Item removed from wishlist")



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
    
    # Get cart items with stock validation
    cart_result = await db.execute(
        select(ShopCartItem, Product)
        .join(Product, ShopCartItem.product_id == Product.id)
        .where(ShopCartItem.user_id == user_id)
    )
    cart_rows = cart_result.all()
    
    if not cart_rows:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Validate stock and calculate totals
    subtotal = 0
    items_data = []
    
    for cart_item, product in cart_rows:
        if product.stock_qty < cart_item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {product.name}. Only {product.stock_qty} available"
            )
        
        if not product.is_active:
            raise HTTPException(
                status_code=400,
                detail=f"{product.name} is no longer available"
            )
        
        item_total = float(product.price) * cart_item.quantity
        subtotal += item_total
        items_data.append({
            "product_id": str(product.id),
            "product_name": product.name,
            "product_price": float(product.price),
            "quantity": cart_item.quantity,
            "total": item_total
        })
        
        # Update stock
        product.stock_qty -= cart_item.quantity
    
    tax = round(subtotal * TAX_RATE)
    shipping = 0 if subtotal >= SHIPPING_THRESHOLD else SHIPPING_COST
    total = subtotal + tax + shipping
    
    # Generate order number
    order_number = f"ORD-{datetime.now().strftime('%Y%m%d')}-{secrets.token_hex(4).upper()}"
    
    # Create order
    new_order = ShopOrder(
        user_id=user_id,
        order_number=order_number,
        status="pending",
        subtotal=subtotal,
        tax_amount=tax,
        shipping_amount=shipping,
        total_amount=total,
        currency="JMD",
        shipping_address={
            "customer_name": request.customer_name,
            "email": request.email,
            "phone": request.phone,
            "address": request.address,
            "city": request.city,
            "notes": request.notes
        },
        notes=request.notes
    )
    
    db.add(new_order)
    await db.flush()
    
    # Create order items
    for item in items_data:
        order_item = ShopOrderItem(
            shop_order_id=new_order.id,
            product_id=uuid.UUID(item["product_id"]),
            product_name=item["product_name"],
            quantity=item["quantity"],
            unit_price=item["product_price"],
            line_total=item["total"]
        )
        db.add(order_item)
    
    # Clear cart
    await db.execute(
        delete(ShopCartItem).where(ShopCartItem.user_id == user_id)
    )
    
    await db.commit()
    await db.refresh(new_order)
    
    # Get order items for response
    items_result = await db.execute(
        select(ShopOrderItem).where(ShopOrderItem.shop_order_id == new_order.id)
    )
    order_items = items_result.scalars().all()
    
    # Send confirmation email (background task)
    background_tasks.add_task(
        send_order_confirmation_email,
        email=request.email,
        customer_name=request.customer_name,
        order_number=order_number,
        items=items_data,
        subtotal=subtotal,
        tax=tax,
        shipping=shipping,
        total=total,
        shipping_address=request.address,
        city=request.city
    )
    
    return OrderResponse(
        id=new_order.id,
        order_number=new_order.order_number,
        status=new_order.status,
        subtotal=float(new_order.subtotal),
        tax_amount=float(new_order.tax_amount),
        shipping_amount=float(new_order.shipping_amount),
        total_amount=float(new_order.total_amount),
        shipping_address=new_order.shipping_address,
        notes=new_order.notes,
        items=[
            OrderItemResponse(
                product_id=str(item.product_id),
                product_name=item.product_name,
                product_price=float(item.unit_price),
                quantity=item.quantity,
                total=float(item.line_total)
            )
            for item in order_items
        ],
        created_at=new_order.created_at
    )


@router.get("/orders", response_model=OrdersListResponse)
async def get_my_orders(
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get user's orders"""
    user_id = current_user["user_id"]
    
    query = select(ShopOrder).where(ShopOrder.user_id == user_id)
    
    if status_filter:
        query = query.where(ShopOrder.status == status_filter)
    
    query = query.order_by(ShopOrder.created_at.desc()).offset(offset).limit(limit)
    
    result = await db.execute(query)
    orders = result.scalars().all()
    
    orders_response = []
    for order in orders:
        # Get order items
        items_result = await db.execute(
            select(ShopOrderItem).where(ShopOrderItem.shop_order_id == order.id)
        )
        items = items_result.scalars().all()
        
        orders_response.append(OrderResponse(
            id=order.id,
            order_number=order.order_number,
            status=order.status,
            subtotal=float(order.subtotal),
            tax_amount=float(order.tax_amount),
            shipping_amount=float(order.shipping_amount),
            total_amount=float(order.total_amount),
            shipping_address=order.shipping_address,
            notes=order.notes,
            items=[
                OrderItemResponse(
                    product_id=str(item.product_id),
                    product_name=item.product_name,
                    product_price=float(item.unit_price),
                    quantity=item.quantity,
                    total=float(item.line_total)
                )
                for item in items
            ],
            created_at=order.created_at
        ))
    
    return OrdersListResponse(
        orders=orders_response,
        total=len(orders_response)
    )

@router.post("/wishlist/move-to-cart/{product_id}", response_model=APIResponse)
async def move_wishlist_to_cart(
    product_id: str,
    quantity: int = Query(1, ge=1, le=MAX_QUANTITY_PER_ITEM),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Move item from wishlist to cart"""
    user_id = current_user["user_id"]
    product_uuid = uuid.UUID(product_id)
    
    # Get product
    product_result = await db.execute(
        select(Product).where(Product.id == product_uuid)
    )
    product = product_result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if not product.is_active:
        raise HTTPException(status_code=400, detail="Product is not available")
    
    if product.stock_qty < quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Only {product.stock_qty} items available in stock"
        )
    
    # Remove from wishlist
    wishlist_result = await db.execute(
        select(ShopWishlistItem)
        .where(ShopWishlistItem.user_id == user_id)
        .where(ShopWishlistItem.product_id == product_uuid)
    )
    wish_item = wishlist_result.scalar_one_or_none()
    
    if wish_item:
        await db.delete(wish_item)
    
    # Add to cart
    cart_result = await db.execute(
        select(ShopCartItem)
        .where(ShopCartItem.user_id == user_id)
        .where(ShopCartItem.product_id == product_uuid)
    )
    cart_item = cart_result.scalar_one_or_none()
    
    if cart_item:
        new_quantity = cart_item.quantity + quantity
        if new_quantity > product.stock_qty:
            new_quantity = product.stock_qty
        cart_item.quantity = new_quantity
        cart_item.updated_at = datetime.utcnow()
    else:
        new_cart_item = ShopCartItem(
            user_id=user_id,
            product_id=product_uuid,
            quantity=quantity
        )
        db.add(new_cart_item)
    
    await db.commit()
    
    return APIResponse(success=True, message="Item moved to cart")


@router.get("/products/{product_id}", response_model=ShopProductDetailResponse)
async def get_product_by_id(
    product_id: str,
    db: AsyncSession = Depends(get_user_db)
):
    """Get product by ID or slug"""
    # Try as UUID first
    try:
        product_uuid = uuid.UUID(product_id)
        result = await db.execute(
            select(Product).where(Product.id == product_uuid)
        )
    except ValueError:
        # Try as slug
        result = await db.execute(
            select(Product).where(Product.slug == product_id)
        )
    
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return ShopProductDetailResponse(
        id=str(product.id),
        name=product.name,
        description=product.description,
        price=float(product.price),
        category=product.category.value if hasattr(product.category, 'value') else product.category,
        image_url=product.image_url,
        badge_text=product.badge_label,
        badge_color=product.badge_color,
        rating=float(product.average_rating),
        review_count=product.review_count,
        stock_quantity=product.stock_qty,
        is_active=product.is_active,
        featured=False,
        slug=product.slug,
        currency=product.currency,
        created_at=product.created_at,
        updated_at=product.updated_at
    )

@router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order_by_id(
    order_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Get specific order by ID"""
    user_id = current_user["user_id"]
    order_uuid = uuid.UUID(order_id)
    
    result = await db.execute(
        select(ShopOrder)
        .where(ShopOrder.id == order_uuid)
        .where(ShopOrder.user_id == user_id)
    )
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Get order items
    items_result = await db.execute(
        select(ShopOrderItem).where(ShopOrderItem.shop_order_id == order.id)
    )
    items = items_result.scalars().all()
    
    return OrderResponse(
        id=order.id,
        order_number=order.order_number,
        status=order.status,
        subtotal=float(order.subtotal),
        tax_amount=float(order.tax_amount),
        shipping_amount=float(order.shipping_amount),
        total_amount=float(order.total_amount),
        shipping_address=order.shipping_address,
        notes=order.notes,
        items=[
            OrderItemResponse(
                product_id=str(item.product_id),
                product_name=item.product_name,
                product_price=float(item.unit_price),
                quantity=item.quantity,
                total=float(item.line_total)
            )
            for item in items
        ],
        created_at=order.created_at
    )

@router.delete("/cart/remove/{product_id}", response_model=APIResponse)
async def remove_from_cart(
    product_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_user_db)
):
    """Remove item from cart"""
    user_id = current_user["user_id"]
    product_uuid = uuid.UUID(product_id)
    
    result = await db.execute(
        select(ShopCartItem)
        .where(ShopCartItem.user_id == user_id)
        .where(ShopCartItem.product_id == product_uuid)
    )
    cart_item = result.scalar_one_or_none()
    
    if cart_item:
        await db.delete(cart_item)
        await db.commit()
    
    return APIResponse(success=True, message="Item removed from cart")

