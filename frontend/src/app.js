// Data
const products = [
  {
    id: 1,
    name: "Hamburguesa Clásica",
    description:
      "Jugosa hamburguesa de carne 100% res con lechuga fresca, tomate, queso cheddar derretido y nuestra salsa especial en un pan artesanal.",
    price: 50.0,
    image:
      "https://i.pinimg.com/736x/89/94/3e/89943eddc9dba2d33ba320d0f961db0b.jpg",
  },
  {
    id: 2,
    name: "Sandwich Especial",
    description:
      "Delicioso sandwich con jamón de pavo, queso suizo, lechuga crujiente, tomate fresco y mayonesa casera en pan integral recién horneado.",
    price: 50.0,
    image:
      "https://www.laboulangeriedolivier.com/wp-content/uploads/2020/11/paninis-768x512.jpg",
  },
  {
    id: 3,
    name: "Hamburguesa Doble",
    description:
      "Doble carne de res premium, doble queso americano, bacon crujiente, cebolla caramelizada y salsa BBQ sobre pan de papa tostado.",
    price: 50.0,
    image:
      "https://th.bing.com/th/id/OIP.XULephKEEE5Obq11QTSTiQHaE8?w=241&h=180&c=7&r=0&o=7&dpr=1.1&pid=1.7&rm=3",
  },
  {
    id: 4,
    name: "Papas Fritas",
    description:
      "Crujientes papas fritas cortadas a mano, doradas a la perfección con un toque de sal marina y servidas con nuestra salsa de la casa.",
    price: 35.0,
    image:
      "https://media.ambito.com/p/6dc7a7f1e9997ba6ff74f18c842473fe/adjuntos/239/imagenes/040/087/0040087832/730x0/smart/papas-fritasjpg.jpg",
  },
  {
    id: 5,
    name: "Lomo Individual",
    description:
      "Pan Casero, carne de lomo , huevo frito , tomate, lechuga fresca, jamon y la salsa de la casa.",
    price: 45.0,
    image:
      "https://media.diariouno.com.ar/p/b570c3e3dff89cd317dcc93387af5b69/adjuntos/298/imagenes/009/519/0009519816/1200x0/smart/sanguche-lomo-sandwichjpg.jpg",
  },
  {
    id: 6,
    name: "Combo Familiar",
    description:
      "El combo perfecto para compartir: 2 hamburguesas grandes, porción grande de papas fritas, aros de cebolla y bebidas para toda la familia.",
    price: 150.0,
    image: "https://i.ytimg.com/vi/N-TamnD0uWY/maxresdefault.jpg",
  },
];


let cart = [];
let isLoggedIn = false;
const API_BASE = "proyectointegradoraltf4-production-cd0c.up.railway.app";


const loginScreen = document.getElementById("loginScreen");
const mainApp = document.getElementById("mainApp");
const loginForm = document.getElementById("loginForm");
const productsGrid = document.getElementById("productsGrid");
const cartBtn = document.getElementById("cartBtn");
const cartBadge = document.getElementById("cartBadge");
const cartSidebar = document.getElementById("cartSidebar");
const closeCart = document.getElementById("closeCart");
const cartItems = document.getElementById("cartItems");
const cartFooter = document.getElementById("cartFooter");
const checkoutModal = document.getElementById("checkoutModal"); 
const checkoutForm = document.getElementById("checkoutForm");
const confirmationModal = document.getElementById("confirmationModal");
const contactForm = document.getElementById("contactForm");
const toast = document.getElementById("toast");
const logoutBtn = document.getElementById("logoutBtn");
const mpTransactionId = null; 
const paymentMethod = 'efectivo';

function init() {
  renderProducts();
  setupEventListeners();

  const existingToken = getAuthToken();
  if (existingToken) {
    
    isLoggedIn = true;
    loginScreen.style.display = "none";
    mainApp.style.display = "block";
  }
  if (logoutBtn) {
    logoutBtn.style.display = "block";
  }
}

function setupEventListeners() {
  loginForm.addEventListener("submit", handleLogin);

  const registerLink = document.getElementById("openRegister");
  if (registerLink) {
    registerLink.addEventListener("click", (e) => {
      e.preventDefault();
      openRegister();
    });
  }

  const registerModal = document.getElementById("registerModal");
  if (registerModal) {
    registerModal.addEventListener("click", (e) => {
      if (e.target === registerModal) closeRegister();
    });
  }

  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", handleRegisterSubmit);
  }
  cartBtn.addEventListener("click", openCart);
  closeCart.addEventListener("click", closeCartSidebar);
  checkoutForm.addEventListener("submit", handleCheckout);
  contactForm.addEventListener("submit", handleContactForm);

  document.addEventListener("click", (e) => {
    if (e.target.closest("#logoutBtn")) {
      e.preventDefault();
      handleLogout();
    }
  });

  cartSidebar.addEventListener("click", (e) => {
    if (e.target === cartSidebar) {
      closeCartSidebar();
    }
  });

  checkoutModal.addEventListener("click", (e) => {
    if (e.target === checkoutModal) {
      closeCheckout();
    }
  });

  confirmationModal.addEventListener("click", (e) => {
    if (e.target === confirmationModal) {
      closeConfirmation();
    }
  });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const target = document.querySelector(targetId);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}
function removeAuthToken() {
    try {
        localStorage.removeItem('authToken');
    } catch (_) {}
}


function getAuthToken() {
  try {
    return localStorage.getItem("authToken");
  } catch (_) {
    return null;
  }
}

function setAuthToken(token) {
  try {
    localStorage.setItem("authToken", token);
  } catch (_) {}
}

async function authFetch(path, options = {}) {
  const token = getAuthToken();
  const headers = Object.assign(
    { "Content-Type": "application/json" },
    options.headers || {}
  );
  if (token) headers["Authorization"] = `Bearer ${token}`;
  function removeAuthToken() {
    try {
      localStorage.removeItem("authToken");
    } catch (_) {}
  }
}
 // Logout
function handleLogout() {
    removeAuthToken();
    isLoggedIn = false;
    cart = [];
    updateCart();
    mainApp.style.display = 'none';
    loginScreen.style.display = 'flex';
    window.scrollTo(0, 0);
    showToast('Sesión cerrada exitosamente', 'success');
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) return;
  try {
    const res = await fetch(`${API_BASE}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showToast(err.error || "Error de autenticación", "error");
      return;
    }
    const data = await res.json();
    if (data && data.token) {
      setAuthToken(data.token);
      console.log(data.token)
      isLoggedIn = true;
      loginScreen.style.display = "none";
      mainApp.style.display = "block";
      showToast("¡Bienvenido a Food Divcode!", "success");
    } else {
      showToast("Respuesta inválida del servidor", "error");
    }
  } catch (error) {
    showToast("No se pudo conectar con el servidor", "error");
  }
}

function openRegister() {
  const m = document.getElementById("registerModal");
  if (m) m.classList.add("active");
}

function closeRegister() {
  const m = document.getElementById("registerModal");
  if (m) m.classList.remove("active");
}

async function handleRegisterSubmit(e) {
  e.preventDefault();
  const nombre = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;
  if (!nombre || !email || !password) return;
  try {
    const res = await fetch(`${API_BASE}/api/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, nombre }),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      showToast(payload.error || "No se pudo registrar", "error");
      return;
    }
    showToast("Registro exitoso, iniciando sesión...", "success");

    const loginRes = await fetch(`${API_BASE}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (loginRes.ok) {
      const data = await loginRes.json();
      if (data && data.token) {
        setAuthToken(data.token);
        isLoggedIn = true;
        closeRegister();
        loginScreen.style.display = "none";
        mainApp.style.display = "block";
      }
    }
  } catch (_) {
    showToast("Error de red en registro", "error");
  }
}

function renderProducts() {
  productsGrid.innerHTML = products
    .map(
      (product) => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                <div class="product-price">$${product.price.toFixed(2)}</div>
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-buttons">
                    <button class="btn btn-outline" onclick="addToCart(${
                      product.id
                    })">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Agregar
                    </button>
                    
                </div>
            </div>
        </div>
    `
    )
    .join("");
}

function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  updateCart();
  showToast(`${product.name} agregado al carrito`, "success");
}

function removeFromCart(productId) {
  const item = cart.find((item) => item.id === productId);
  cart = cart.filter((item) => item.id !== productId);
  updateCart();
  if (item) {
    showToast(`${item.name} eliminado del carrito`, "error");
  }
}

function updateQuantity(productId, quantity) {
  if (quantity === 0) {
    removeFromCart(productId);
    return;
  }

  const item = cart.find((item) => item.id === productId);
  if (item) {
    item.quantity = quantity;
    updateCart();
  }
}

function updateCart() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = 0;
  const total = subtotal + shipping;

  if (totalItems > 0) {
    cartBadge.textContent = totalItems;
    cartBadge.style.display = "block";
  } else {
    cartBadge.style.display = "none";
  }

  if (cart.length === 0) {
    cartItems.innerHTML = `
            <div class="cart-empty">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <p>Tu carrito está vacío</p>
                <p>Agrega algunos productos deliciosos</p>
            </div>
        `;
    cartFooter.innerHTML = "";
  } else {
    cartItems.innerHTML = cart
      .map(
        (item) => `
            <div class="cart-item">
                <img src="${item.image}" alt="${
          item.name
        }" class="cart-item-image">
                <div class="cart-item-info">
                    <div class="cart-item-header">
                        <h4>${item.name}</h4>
                        <button class="cart-item-remove" onclick="removeFromCart(${
                          item.id
                        })">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                    <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity(${
                          item.id
                        }, ${item.quantity - 1})">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${
                          item.id
                        }, ${item.quantity + 1})">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `
      )
      .join("");

    cartFooter.innerHTML = `
            <div class="cart-summary">
                <div class="summary-row">
                    <span>Subtotal</span>
                    <span>$${subtotal.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                    <span>Envío</span>
                    <span>$${shipping.toFixed(2)}</span>
                </div>
                <div class="summary-row total">
                    <span>Total</span>
                    <span class="text-red">$${total.toFixed(2)}</span>
                </div>
            </div>
            <button class="btn btn-primary" style="width: 100%;" onclick="openCheckout()">FINALIZAR PEDIDO</button>
        `;
  }
}

function openCart() {
  cartSidebar.classList.add("active");
}

function closeCartSidebar() {
  cartSidebar.classList.remove("active");
}

function openCheckout() {
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const total = subtotal + 0;

  document.getElementById(
    "checkoutSubtotal"
  ).textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById("checkoutTotal").textContent = `$${total.toFixed(2)}`;

  // Ocultar botón de Mercado Pago inicialmente
  const walletContainer = document.getElementById("walletBrick_container");
  if (walletContainer) {
    walletContainer.style.display = "none";
    walletContainer.innerHTML = "";
  }

  // Asegurar que el botón "Confirmar Pedido" sea visible
  const confirmButton = checkoutForm.querySelector('button[type="submit"]');
  if (confirmButton) {
    confirmButton.style.display = "block";
  }

  // Listener para detectar cambios en el método de pago
  const paymentMethods = document.querySelectorAll(
    'input[name="paymentMethod"]'
  );
  paymentMethods.forEach((radio) => {
    radio.addEventListener("change", handlePaymentMethodChange);
  });

  closeCartSidebar();
  checkoutModal.classList.add("active");
}

function handlePaymentMethodChange() {
  const selectedMethod = document.querySelector(
    'input[name="paymentMethod"]:checked'
  ).value;
  const walletContainer = document.getElementById("walletBrick_container");
  const confirmButton = checkoutForm.querySelector('button[type="submit"]');

  if (selectedMethod === "mercadopago") {
    // Ocultar botón de confirmar pedido
    if (confirmButton) {
      confirmButton.style.display = "none";
    }
    // Mostrar contenedor y renderizar botón de Mercado Pago
    if (walletContainer) {
      walletContainer.style.display = "block";
      renderMercadoPagoButton();
    }
  } else {
    // Ocultar botón de Mercado Pago
    if (walletContainer) {
      walletContainer.style.display = "none";
      walletContainer.innerHTML = "";
    }
    // Mostrar botón de confirmar pedido
    if (confirmButton) {
      confirmButton.style.display = "block";
    }
  }
}

function closeCheckout() {
  // Limpiar botón de Mercado Pago al cerrar
  const walletContainer = document.getElementById("walletBrick_container");
  if (walletContainer) {
    walletContainer.style.display = "none";
    walletContainer.innerHTML = "";
  }

  // Asegurar que el botón "Confirmar Pedido" sea visible
  const confirmButton = checkoutForm.querySelector('button[type="submit"]');
  if (confirmButton) {
    confirmButton.style.display = "block";
  }

  checkoutModal.classList.remove("active");
}

async function handleCheckout(e) {
  e.preventDefault();

  const paymentMethod = document.querySelector(
    'input[name="paymentMethod"]:checked'
  ).value;

  if (paymentMethod === "mercadopago") {
    return;
  } 
  const customerName = document.getElementById("customerName").value;
  const customerPhone = document.getElementById("customerPhone").value;
  const customerAddress = document.getElementById("customerAddress").value;
  const orderNotes = document.getElementById("orderNotes").value;

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const total = subtotal + 0;

  // --- Preparación de datos para el Backend ---
  const orderData = {
    cartItems: getCartItems(), // Usa la función existente
    totalPedido: total,
    paymentMethod: paymentMethod,
    name: customerName,
    address: customerAddress,
    phone: customerPhone,
    mpTransactionId: null,
  };
  try {
    // LLAMADA AL BACKEND PARA GUARDAR EL PEDIDO
    const res = await fetch(`${API_BASE}/save_order`, {
      method: 'POST',
      headers: { 
          'Content-Type': 'application/json',
          // Aquí deberías pasar el token de autorización si fuera necesario
      },
      body: JSON.stringify(orderData),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      showToast(errorData.error || "Error al guardar el pedido en la DB.", "error");
      return;
    }

    const data = await res.json();
    const orderNumber = data.orderNumber; // Usar el orderNumber generado en el backend (FD + ID)

    // --- Mostrar Confirmación (Lógica existente) ---
    document.getElementById("orderNumber").textContent = orderNumber;
    document.getElementById("confirmAddress").textContent = customerAddress;
    document.getElementById("confirmPhone").textContent = customerPhone;
     
    let paymentMethodText = "Efectivo";
    if (paymentMethod === "card") {
      paymentMethodText = "Tarjeta (Manual)";
    }

    document.getElementById("confirmPaymentMethod").textContent =
      paymentMethodText;
    document.getElementById("confirmTotal").textContent = `$${total.toFixed(2)}`;

    closeCheckout();
    confirmationModal.classList.add("active");

    checkoutForm.reset();

  } catch (error) {
      console.error("Error de red al guardar el pedido:", error);
      showToast("Error de conexión con el servidor.", "error");
  }
}

function closeConfirmation() {
  confirmationModal.classList.remove("active");
  cart = [];
  updateCart();
  showToast("¡Gracias por tu pedido!", "success");
}

function handleContactForm(e) {
  e.preventDefault();

  const name = document.getElementById("contactName").value;
  const email = document.getElementById("contactEmail").value;
  const phone = document.getElementById("contactPhone").value;
  const message = document.getElementById("contactMessage").value;

  showToast("¡Mensaje enviado! Te contactaremos pronto.", "success");
  contactForm.reset();
}

function orderWhatsApp() {
  const phoneNumber = "5215512345678"; // Reemplaza con tu número real
  const message = "Hola, me gustaría hacer un pedido";
  window.open(
    `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
    "_blank"
  );
}

function callNow() {
  window.location.href = "tel:+525512345678";
}

function showToast(message, type = "success") {
  toast.textContent = message;
  toast.className = `toast show ${type}`;

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// Funcion de Mp
const publicKey = "APP_USR-d4625eba-109d-4ab5-88ed-3c7f1c723e40";
//const preferenceId = "2670517922-879aff76-aa32-4bd1-aa92-595bb947176b"; // Preference ID que funcionaba antes

async function renderMercadoPagoButton() {
  try {
    const containerId = "walletBrick_container";
    const container = document.getElementById(containerId);

    if (!container) {
      console.error("Contenedor de Mercado Pago no encontrado");
      return;
    }

    container.innerHTML = "Cargando botón de pago...";

    const cartItems = getCartItems();

    if (cartItems.length === 0) {
      showToast("El carrito está vacío.", "warning");
      container.innerHTML = "Añade productos para pagar.";
      return;
    }
    const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const total = subtotal + 0;
  console.log(subtotal)

    const fetchRes = await fetch("http://localhost:3000/create_preference", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items: cartItems, total, }), // <-- Aquí se envía el array 'items'
    });

    // Manejar errores de respuesta del servidor (Error 400, 500, etc.)
    if (!fetchRes.ok) {
      const errorPayload = await fetchRes.json().catch(() => ({}));
      console.error(
        "Error del Servidor al crear preferencia:",
        fetchRes.status,
        errorPayload
      );
      showToast(
        `Error ${fetchRes.status}: ${
          errorPayload.error || "No se pudo crear la preferencia."
        }`,
        "error"
      );
      container.innerHTML = "Error de conexión con MP.";
      return;
    }

    const data = await fetchRes.json();
    const dynamicPreferenceId = data.preference_id;

    container.innerHTML = ""; // Limpiar el mensaje de "cargando"

    const mp = new MercadoPago(publicKey, { locale: "es-AR" });
    const bricksBuilder = mp.bricks();

    await bricksBuilder.create("wallet", containerId, {
      initialization: {
        preferenceId: dynamicPreferenceId,
      },
    });
  } catch (error) {
    console.error("Error FATAL al renderizar botón de Mercado Pago:", error);
    showToast(
      "Error de red. Asegúrate de que tu servidor esté corriendo.",
      "error"
    );
    container.innerHTML = "Error de red o servidor no disponible.";
  }
}

function getCartItems() {
  // Solo usamos los productos realmente agregados al carrito
  return cart.map((item) => ({
    id: item.id,
    name: item.name,
    price: parseFloat(item.price).toFixed(2),
    quantity: parseInt(item.quantity),
  }));
}

document.addEventListener("DOMContentLoaded", init);
