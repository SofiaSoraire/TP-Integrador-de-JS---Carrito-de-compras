// ========== ESTADOS ==========
let carrito = [];
let productos = [];
let cargandoProductos = false;
let errorServidor = null;

// ========== SETTERS ==========
function setCarrito(nuevoCarrito) {
    carrito = nuevoCarrito;
    renderCarrito();
    renderTotal();
    // Actualizar los productos para reflejar cambios en botones
    renderProducts();
}

function setProductos(nuevosProductos) {
    productos = nuevosProductos;
    renderProducts();
}

function setCargandoProductos(valorBooleano) {
    cargandoProductos = valorBooleano;
    renderProducts();
}

function setErrorServidor(error) {
    errorServidor = error;
    renderError();
}

// ========== CONSUMO DE API ==========
async function cargarProductos() {
    try {
        setCargandoProductos(true);
        setErrorServidor(null);

        const response = await fetch('https://dummyjson.com/products');
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        setProductos(data.products);
        
    } catch (error) {
        console.error('Error al cargar productos:', error);
        setErrorServidor(`No se pudieron cargar los productos. ${error.message}`);
    } finally {
        setCargandoProductos(false);
    }
}

// ========== FUNCIONES AUXILIARES ==========
function getProductoEnCarrito(id) {
    return carrito.find(item => item.id === id);
}

function getProductoPorId(id) {
    return productos.find(producto => producto.id === id);
}

function calcularTotal() {
    return carrito.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// ========== HANDLERS DE EVENTOS ==========
function agregarAlCarrito(id) {
    const producto = getProductoPorId(id);
    if (!producto) return;

    const itemEnCarrito = getProductoEnCarrito(id);

    if (itemEnCarrito) {
        // Si ya está en el carrito, incrementar cantidad
        if (itemEnCarrito.quantity < producto.stock) {
            itemEnCarrito.quantity++;
            setCarrito([...carrito]);
        }
    } else {
        // Si no está, agregarlo
        const nuevoItem = {
            id: producto.id,
            title: producto.title,
            price: producto.price,
            quantity: 1
        };
        setCarrito([...carrito, nuevoItem]);
    }
}

function quitarDelCarrito(id) {
    const nuevoCarrito = carrito.filter(item => item.id !== id);
    setCarrito(nuevoCarrito);
}

function incrementarCantidad(id) {
    const producto = getProductoPorId(id);
    const itemEnCarrito = getProductoEnCarrito(id);

    if (!producto || !itemEnCarrito) return;

    // Verificar stock
    if (itemEnCarrito.quantity < producto.stock) {
        itemEnCarrito.quantity++;
        setCarrito([...carrito]);
    }
}

function decrementarCantidad(id) {
    const itemEnCarrito = getProductoEnCarrito(id);

    if (!itemEnCarrito) return;

    if (itemEnCarrito.quantity > 1) {
        itemEnCarrito.quantity--;
        setCarrito([...carrito]);
    } else {
        // Si la cantidad es 1, eliminar del carrito
        quitarDelCarrito(id);
    }
}

function vaciarCarrito() {
    setCarrito([]);
}

function confirmarCarrito() {
    const total = calcularTotal();
    alert(`El total de tu compra es $${total.toFixed(2)}`);
    vaciarCarrito();
}

// ========== RENDERS ==========
function renderProducts() {
    const container = document.getElementById('products-container');

    // Mostrar loading
    if (cargandoProductos) {
        container.innerHTML = `
            <div class="loading-container" style="grid-column: 1/-1;">
                <div class="spinner"></div>
                <p class="loading-text">Cargando productos...</p>
            </div>
        `;
        return;
    }

    // Mostrar productos
    if (productos.length === 0) {
        container.innerHTML = `
            <div class="loading-container" style="grid-column: 1/-1;">
                <p class="loading-text">No hay productos disponibles</p>
            </div>
        `;
        return;
    }

    container.innerHTML = productos.map(producto => {
        const itemEnCarrito = getProductoEnCarrito(producto.id);
        const stockBajo = producto.stock < 10;

        return `
            <div class="product-card">
                <img src="${producto.thumbnail}" alt="${producto.title}" class="product-image">
                <h3 class="product-title">${producto.title}</h3>
                <p class="product-description">${producto.description}</p>
                <p class="product-price">$${producto.price.toFixed(2)}</p>
                <p class="product-stock ${stockBajo ? 'low-stock' : ''}">
                    Stock: ${producto.stock} unidades
                </p>
                <div class="product-actions">
                    ${itemEnCarrito ? `
                        <div class="quantity-controls">
                            <button 
                                class="quantity-btn" 
                                onclick="decrementarCantidad(${producto.id})"
                                ${itemEnCarrito.quantity <= 1 ? '' : ''}
                            >
                                −
                            </button>
                            <span class="quantity-display">${itemEnCarrito.quantity}</span>
                            <button 
                                class="quantity-btn" 
                                onclick="incrementarCantidad(${producto.id})"
                                ${itemEnCarrito.quantity >= producto.stock ? 'disabled' : ''}
                            >
                                +
                            </button>
                        </div>
                        <button 
                            class="btn btn-danger btn-remove" 
                            onclick="quitarDelCarrito(${producto.id})"
                        >
                            Quitar
                        </button>
                    ` : `
                        <button 
                            class="btn btn-primary btn-full" 
                            onclick="agregarAlCarrito(${producto.id})"
                            ${producto.stock === 0 ? 'disabled' : ''}
                        >
                            ${producto.stock === 0 ? 'Sin Stock' : 'Agregar al carrito'}
                        </button>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

function renderCarrito() {
    const container = document.getElementById('cart-container');

    if (carrito.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-icon">🛒</div>
                <p>Tu carrito está vacío</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">Agrega productos para comenzar</p>
            </div>
        `;
        return;
    }

    container.innerHTML = carrito.map(item => {
        const producto = getProductoPorId(item.id);
        const stockDisponible = producto ? producto.stock : 0;

        return `
            <div class="cart-item">
                <h4 class="cart-item-title">${item.title}</h4>
                <p class="cart-item-price">$${item.price.toFixed(2)} x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}</p>
                <div class="cart-item-controls">
                    <div class="cart-item-quantity">
                        <button 
                            class="quantity-btn" 
                            onclick="decrementarCantidad(${item.id})"
                        >
                            −
                        </button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button 
                            class="quantity-btn" 
                            onclick="incrementarCantidad(${item.id})"
                            ${item.quantity >= stockDisponible ? 'disabled' : ''}
                        >
                            +
                        </button>
                    </div>
                    <button 
                        class="btn btn-remove" 
                        onclick="quitarDelCarrito(${item.id})"
                    >
                        Quitar
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function renderTotal() {
    const container = document.getElementById('total-container');

    if (carrito.length === 0) {
        container.innerHTML = '';
        return;
    }

    const total = calcularTotal();

    container.innerHTML = `
        <div class="total-amount">
            <span>Total:</span>
            <span class="total-price">$${total.toFixed(2)}</span>
        </div>
        <div class="cart-actions">
            <button class="btn btn-primary btn-full" onclick="confirmarCarrito()">
                Confirmar carrito
            </button>
            <button class="btn btn-danger btn-full" onclick="vaciarCarrito()">
                Vaciar carrito
            </button>
        </div>
    `;
}

function renderError() {
    const container = document.getElementById('error-container');

    if (!errorServidor) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = `
        <div class="error-message">
            <span>${errorServidor}</span>
        </div>
    `;
}

// ========== INICIALIZACIÓN ==========
function init() {
    // Renderizar estados iniciales
    renderCarrito();
    renderTotal();
    renderError();
    
    // Cargar productos desde la API
    cargarProductos();
}

// Iniciar la aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
