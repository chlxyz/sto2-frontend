// Size-aware stock caps. A line's cap comes from its own size's stock when it
// has one, otherwise the product total. Mirrors the server: CartController's
// lineStock() reads product_size.stock per size, products.product_quantity else.
export const sizeStock = (product, sizeId) =>
  sizeId ? (product.sizes?.find((s) => s.id === sizeId)?.stock ?? 0) : (product.quantity ?? 0)

// Floor of 1 so an all-sold-out product still renders a usable stepper. The
// server rejects stock<=0 at store()/update(), so this cannot oversell.
export const capFor = (product, sizeId) => Math.max(1, sizeStock(product, sizeId))

export const fit = (q, product, sizeId) => Math.min(Math.max(1, q), capFor(product, sizeId))