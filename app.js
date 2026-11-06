const products = [
    {
        id: 101,
        name: "Wireless headphones",
        category: "Electronics",
        price: 80,
        stock: 15,
        label: "Bestseller",
        description: "Your favorite sound, wherever the day goes.",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80",
        imageAlt: "Wireless headphones against a warm background"
    },
    {
        id: 102,
        name: "Everyday watch",
        category: "Accessories",
        price: 45,
        stock: 0,
        label: "Everyday pick",
        description: "A simple little reminder to make time yours.",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80",
        imageAlt: "Minimal watch with a light dial"
    },
    {
        id: 103,
        name: "Pocket phone",
        category: "Electronics",
        price: 120,
        stock: 8,
        label: "New favorite",
        description: "Big ideas, and everything you need, in one place.",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=700&q=80",
        imageAlt: "Modern smartphone on a clean background"
    },
    {
        id: 104,
        name: "Fast charger",
        category: "Accessories",
        price: 35,
        stock: 50,
        label: "Little helper",
        description: "A dependable boost for busy days and late nights.",
        image: "charger.svg",
        imageAlt: "Illustration of a compact fast charger"
    },
    {
        id: 105,
        name: "Everyday laptop",
        category: "Electronics",
        price: 150,
        stock: 100,
        label: "Work, well done",
        description: "A little space for your next big thing.",
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=700&q=80",
        imageAlt: "Open laptop ready for a new project"
    }
];

const freeShippingThreshold = 300;
const standardShipping = 100;
const cartStorageKey = "good-goods-cart";
const elements = {
    grid: document.querySelector("#product-grid"),
    count: document.querySelector("#cart-count"),
    allCount: document.querySelector("#all-count"),
    search: document.querySelector("#product-search"),
    sort: document.querySelector("#sort-products"),
    emptyState: document.querySelector("#empty-state"),
    drawer: document.querySelector("#cart-drawer"),
    backdrop: document.querySelector("#drawer-backdrop"),
    cartItems: document.querySelector("#cart-items"),
    cartEmpty: document.querySelector("#cart-empty"),
    cartFooter: document.querySelector("#cart-footer"),
    drawerCount: document.querySelector("#drawer-count"),
    subtotal: document.querySelector("#cart-subtotal"),
    shipping: document.querySelector("#cart-shipping"),
    total: document.querySelector("#cart-total"),
    shippingNote: document.querySelector("#shipping-note"),
    toast: document.querySelector("#toast"),
    openCart: document.querySelector("#open-cart"),
    closeCart: document.querySelector("#close-cart"),
    checkout: document.querySelector("#checkout-button"),
    menu: document.querySelector("#main-nav"),
    menuToggle: document.querySelector("#menu-toggle")
};

let activeCategory = "All";
let toastTimeout;
let cart = loadCart();

function formatPrice(amount) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2
    }).format(amount);
}

function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.add("is-visible");
    window.clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => {
        elements.toast.classList.remove("is-visible");
    }, 3200);
}

function loadCart() {
    try {
        const savedCart = localStorage.getItem(cartStorageKey);
        if (savedCart === null) return {};

        const parsedCart = JSON.parse(savedCart);
        if (!parsedCart || typeof parsedCart !== "object" || Array.isArray(parsedCart)) {
            throw new TypeError("Saved cart data must be an object.");
        }

        return Object.fromEntries(
            products
                .filter((product) => Number.isInteger(parsedCart[product.id]))
                .filter((product) => parsedCart[product.id] > 0 && product.stock > 0)
                .map((product) => [product.id, Math.min(parsedCart[product.id], product.stock)])
        );
    } catch (error) {
        console.error("Could not load the saved shopping bag.", error);
        window.setTimeout(() => {
            showToast("Your saved bag couldn't be loaded. You can start a fresh one.");
        }, 0);
        return {};
    }
}

function saveCart() {
    try {
        localStorage.setItem(cartStorageKey, JSON.stringify(cart));
    } catch (error) {
        console.error("Could not save the shopping bag.", error);
        showToast("Your bag is available for this visit, but couldn't be saved.");
    }
}

function getCartQuantity() {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
}

function getCartSubtotal() {
    return products.reduce((total, product) => {
        return total + product.price * (cart[product.id] || 0);
    }, 0);
}

function renderProducts() {
    const searchTerm = elements.search.value.trim().toLocaleLowerCase();
    let visibleProducts = products.filter((product) => {
        const matchesCategory = activeCategory === "All" || product.category === activeCategory;
        const matchesSearch = `${product.name} ${product.category} ${product.description}`
            .toLocaleLowerCase()
            .includes(searchTerm);
        return matchesCategory && matchesSearch;
    });

    switch (elements.sort.value) {
        case "price-low":
            visibleProducts = [...visibleProducts].sort((a, b) => a.price - b.price);
            break;
        case "price-high":
            visibleProducts = [...visibleProducts].sort((a, b) => b.price - a.price);
            break;
        case "name":
            visibleProducts = [...visibleProducts].sort((a, b) => a.name.localeCompare(b.name));
            break;
    }

    elements.allCount.textContent = products.length;
    elements.emptyState.hidden = visibleProducts.length > 0;
    elements.grid.innerHTML = visibleProducts.map((product) => {
        const isSoldOut = product.stock === 0;
        return `
            <article class="product-card">
                <div class="product-image-wrap">
                    <img class="product-image" src="${product.image}" alt="${product.imageAlt}" loading="lazy">
                    <span class="product-label">${product.label}</span>
                    <button class="wishlist-button" type="button" data-wishlist="${product.id}" aria-label="Add ${product.name} to favorites" aria-pressed="false">♡</button>
                </div>
                <div class="product-details">
                    <p class="product-category">${product.category}</p>
                    <div class="product-name-row"><h3 class="product-name">${product.name}</h3><span class="product-price">${formatPrice(product.price)}</span></div>
                    <p class="product-description">${product.description}</p>
                    <div class="product-actions">
                        <span class="product-stock">${isSoldOut ? "Currently sold out" : "Ready when you are"}</span>
                        <button class="add-button" type="button" data-add="${product.id}" ${isSoldOut ? "disabled" : ""}>${isSoldOut ? "Sold out" : "Add to bag +"}</button>
                    </div>
                </div>
            </article>
        `;
    }).join("");
}

function renderCart() {
    const itemCount = getCartQuantity();
    const subtotal = getCartSubtotal();
    const shipping = itemCount === 0 || subtotal >= freeShippingThreshold ? 0 : standardShipping;
    const cartIsEmpty = itemCount === 0;

    elements.count.textContent = itemCount;
    elements.openCart.setAttribute("aria-label", `Open shopping bag, ${itemCount} ${itemCount === 1 ? "item" : "items"}`);
    elements.drawerCount.textContent = `(${itemCount})`;
    elements.cartEmpty.hidden = !cartIsEmpty;
    elements.cartFooter.hidden = cartIsEmpty;
    elements.cartItems.hidden = cartIsEmpty;
    elements.cartItems.innerHTML = products
        .filter((product) => cart[product.id])
        .map((product) => {
            const quantity = cart[product.id];
            return `
                <div class="cart-item">
                    <img src="${product.image}" alt="${product.imageAlt}">
                    <div>
                        <p class="cart-item-name">${product.name}</p>
                        <span class="cart-item-price">${formatPrice(product.price)} each</span>
                        <div class="quantity-control" aria-label="${product.name} quantity">
                            <button type="button" data-quantity-action="decrease" data-product-id="${product.id}" aria-label="Remove one ${product.name}">−</button>
                            <span>${quantity}</span>
                            <button type="button" data-quantity-action="increase" data-product-id="${product.id}" aria-label="Add one ${product.name}" ${quantity >= product.stock ? "disabled" : ""}>+</button>
                        </div>
                    </div>
                    <span class="cart-item-total">${formatPrice(product.price * quantity)}</span>
                </div>
            `;
        }).join("");

    elements.subtotal.textContent = formatPrice(subtotal);
    elements.shipping.textContent = shipping === 0 ? "Free" : formatPrice(shipping);
    elements.total.textContent = formatPrice(subtotal + shipping);
    if (subtotal >= freeShippingThreshold) {
        elements.shippingNote.textContent = "Lovely — shipping is on us.";
    } else {
        elements.shippingNote.textContent = `You're ${formatPrice(freeShippingThreshold - subtotal)} away from free shipping.`;
    }
}

function updateCart(productId, nextQuantity) {
    const product = products.find((item) => item.id === productId);
    if (!product) {
        showToast("That item isn't available right now.");
        return;
    }

    if (nextQuantity <= 0) {
        delete cart[productId];
    } else if (nextQuantity <= product.stock) {
        cart[productId] = nextQuantity;
    } else {
        showToast(`Only ${product.stock} ${product.name.toLocaleLowerCase()} available.`);
        return;
    }

    saveCart();
    renderCart();
}

function openCart() {
    elements.backdrop.hidden = false;
    elements.drawer.inert = false;
    elements.drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("drawer-open");
    requestAnimationFrame(() => elements.backdrop.classList.add("is-visible"));
    elements.drawer.classList.add("is-open");
    elements.closeCart.focus();
}

function closeCart() {
    elements.backdrop.classList.remove("is-visible");
    elements.drawer.classList.remove("is-open");
    elements.drawer.setAttribute("aria-hidden", "true");
    elements.drawer.inert = true;
    document.body.classList.remove("drawer-open");
    elements.openCart.focus();
    window.setTimeout(() => {
        if (elements.backdrop.classList.contains("is-visible")) return;
        elements.backdrop.hidden = true;
    }, 280);
}

document.querySelectorAll(".filter-chip").forEach((button) => {
    button.addEventListener("click", () => {
        activeCategory = button.dataset.category;
        document.querySelectorAll(".filter-chip").forEach((chip) => {
            const isActive = chip === button;
            chip.classList.toggle("is-active", isActive);
            chip.setAttribute("aria-pressed", String(isActive));
        });
        renderProducts();
    });
});

document.querySelectorAll("[data-nav-category]").forEach((link) => {
    link.addEventListener("click", () => {
        const categoryButton = document.querySelector(`[data-category="${link.dataset.navCategory}"]`);
        categoryButton.click();
        elements.menu.classList.remove("is-open");
        elements.menuToggle.setAttribute("aria-expanded", "false");
    });
});

elements.search.addEventListener("input", renderProducts);
elements.sort.addEventListener("change", renderProducts);
elements.openCart.addEventListener("click", openCart);
elements.closeCart.addEventListener("click", closeCart);
elements.backdrop.addEventListener("click", closeCart);
document.querySelector("#continue-shopping").addEventListener("click", closeCart);

elements.menuToggle.addEventListener("click", () => {
    const isOpen = elements.menu.classList.toggle("is-open");
    elements.menuToggle.setAttribute("aria-expanded", String(isOpen));
    elements.menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

elements.grid.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add]");
    if (addButton) {
        const productId = Number(addButton.dataset.add);
        updateCart(productId, (cart[productId] || 0) + 1);
        return;
    }

    const wishlistButton = event.target.closest("[data-wishlist]");
    if (wishlistButton) {
        const isSaved = wishlistButton.getAttribute("aria-pressed") !== "true";
        wishlistButton.setAttribute("aria-pressed", String(isSaved));
        wishlistButton.classList.toggle("is-saved", isSaved);
        wishlistButton.textContent = isSaved ? "♥" : "♡";
        showToast(isSaved ? "Saved to your favorites for this visit." : "Removed from your favorites.");
    }
});

elements.cartItems.addEventListener("click", (event) => {
    const quantityButton = event.target.closest("[data-quantity-action]");
    if (!quantityButton) return;

    const productId = Number(quantityButton.dataset.productId);
    const change = quantityButton.dataset.quantityAction === "increase" ? 1 : -1;
    updateCart(productId, (cart[productId] || 0) + change);
});

elements.checkout.addEventListener("click", () => {
    if (getCartQuantity() === 0) {
        showToast("Your bag is empty. Find something good first.");
        return;
    }

    cart = {};
    saveCart();
    renderCart();
    closeCart();
    showToast("Demo order placed — no payment was collected.");
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        if (elements.drawer.classList.contains("is-open")) closeCart();
        elements.menu.classList.remove("is-open");
        elements.menuToggle.setAttribute("aria-expanded", "false");
    }

    if (event.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
        event.preventDefault();
        elements.search.focus();
    }
});

renderProducts();
renderCart();
