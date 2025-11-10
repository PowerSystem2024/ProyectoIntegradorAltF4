// backend/server.js
const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');
const usersRoutes = require("./routes/users");
const db = require("./db");
const { MercadoPagoConfig, Preference } = require("mercadopago");

const app = express();
const PORT = process.env.PORT || 8080;


// --- 1. CONFIGURACIÓN DE MIDDLEWARE ---

app.use(bodyParser.json());

// Sirve los archivos estáticos del frontend
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// --- 2. CONFIGURACIÓN DE SDK (MERCADO PAGO) ---
const client = new MercadoPagoConfig({
  accessToken:
    "APP_USR-5297062915426978-090319-d6089e8ecdab5289c86405e84054f715-2670517922",
});

// --- 3. RUTAS DE API ---
// (Todas tus rutas de API deben ir ANTES de la ruta catch-all)

// Montar las Rutas de Usuarios
app.use("/api/users", usersRoutes);

// Ruta para crear preferencia de Mercado Pago
app.post("/create_preference", async (req, res) => {
  const id_user = 1;
  const { 
        items: cartItems , 
        total: total,
        paymentMethod = 'mercadopago', 
      } = req.body;
      
    if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ error: "El carrito está vacío." });
    }
    
    let connection;
    let orderStatus = "Pagado con mercado pago"; 
    let id_pedido_db = null;

    try {
        connection = await db.getConnection(); 
        await connection.beginTransaction();

        // 1. Insertar el pedido en la tabla Pedidos
        const insertPedidoQuery = `
            INSERT INTO Pedidos 
                (id_user, fecha_hora, total, estado, id_transaccion_mp) 
            VALUES (?, NOW(), ?, ?, ?)
        `;
        const [result] = await connection.execute(insertPedidoQuery, [id_user, total, orderStatus, null]);
        id_pedido_db = result.insertId; 
        console.log(`Pedido ${id_pedido_db} insertado con estado: ${orderStatus}`);

        // 2. Insertar los detalles del pedido
        const detailPromises = cartItems.filter(item => item && item.id).map(item => {
            const quantity = parseInt(item.quantity) || 1;
            const priceAsNumber = parseFloat(item.price) || 0; 
            const insertDetalleQuery = `
                INSERT INTO detalle_pedido 
                    (id_pedido, id_producto, precio_unitario, cantidad) 
                VALUES (?, ?, ?, ?)
            `;
            return connection.execute(insertDetalleQuery, [id_pedido_db, item.id, priceAsNumber.toFixed(2), quantity]);
        });
        await Promise.all(detailPromises);

        // 3. Crear preferencia de MP
        const preference = new Preference(client);
        const itemsForPreference = cartItems.map((item) => {
                const price = parseFloat(item.price || 0) <= 0 ? 0.01 : parseFloat(item.price);
                const quantity = parseInt(item.quantity || 1) <= 0 ? 1 : parseInt(item.quantity);
                return {
                    title: item.name || `Producto ID ${item.id}`,
                    quantity: quantity,
                    unit_price: price,
                };
            });
        
        const data = await preference.create({
          body: {
            items: itemsForPreference,
            currency_id: "ARS",
            external_reference: id_pedido_db.toString(),
            back_urls: {
              success: "https://www.google.com", // Cambia esto por tu página de éxito
              failure: "https://www.google.com", // Cambia esto por tu página de error
              pending: "https://www.google.com",
            },
            auto_return: "approved",
          },
        });

        // 4. Si todo salió bien, confirmar la transacción
        await connection.commit();
        console.log("Preferencia creada:", data);

        res.status(201).json({
          message: "Orden creada y preferencia de pago generada exitosamente.",
                id_pedido: id_pedido_db,
                preference_id: data.id,
                preference_url: data.init_point || data.sandbox_init_point,
        });

    } catch (error) {
        if (connection) {
                await connection.rollback(); 
        }
        console.error("Error al crear la orden y preferencia de MP:", error);
        res.status(500).json({ error: "Error al procesar la orden.", details: error.message });
    } finally {
        if (connection) {
            connection.release(); 
        }
    }
});

// Ruta para guardar pedidos (Efectivo/Tarjeta)
app.post("/save_order", async (req, res) => {
  const id_user = 1;
  const { cartItems, totalPedido: total = 0 , paymentMethod = 'efectivo', mpTransactionId = null, name = "", address = " ", phone =" " } = req.body;
  
  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: "El carrito está vacío." });
  }

  const normalizedPaymentMethod = (paymentMethod || 'efectivo').toLowerCase();
  let connection;
  let orderStatus;

  try {
    connection = await db.getConnection(); 
    await connection.beginTransaction();

    if (normalizedPaymentMethod === "card") {
        orderStatus = "Pago con Tarjeta Credito"; 
    } else if (normalizedPaymentMethod === "cash" ) {
        orderStatus = "Pagado Efectivo";
    } else if (normalizedPaymentMethod.includes("mp")) { 
        orderStatus = "Pagado con MP";
    } else {
        orderStatus = "Pendiente";
    }

    // 1. Insertar el pedido en la tabla Pedidos
    const insertPedidoQuery = `
      INSERT INTO Pedidos 
        (id_user, fecha_hora, total, estado, id_transaccion_mp) 
      VALUES (?, NOW(), ?,  ?, ?)
    `;
    const [result] = await connection.execute(insertPedidoQuery, [id_user, total, orderStatus, mpTransactionId]);
    const id_pedido = result.insertId; 
    console.log(`Pedido insertado con ID: ${id_pedido}`);

    // 2. Insertar los detalles del pedido
    const detailPromises = cartItems.filter(item => item && item.id).map(item => {
      const quantity = parseInt(item.quantity) || 1;
      const priceAsNumber = parseFloat(item.price);
      const insertDetalleQuery = `
        INSERT INTO detalle_pedido 
          (id_pedido, id_producto, precio_unitario, cantidad) 
        VALUES (?, ?, ?, ?)
      `;
      return connection.execute(insertDetalleQuery, [id_pedido, item.id, priceAsNumber, quantity]);
    });
    await Promise.all(detailPromises); 
    
    // 3. Confirmar la transacción
    await connection.commit(); 

    res.status(201).json({ 
        message: "Pedido guardado exitosamente", 
        id_pedido,
        orderNumber: `FD${id_pedido}`
    });

  } catch (error) {
    if (connection) {
      await connection.rollback(); 
    }
    console.error("Error al guardar el pedido:", error);
    res.status(500).json({ error: "Error interno al procesar el pedido." });
  } finally {
    if (connection) {
      connection.release(); 
    }
  }
});

// RUTA CATCH-ALL PARA SERVIR EL FRONTEND
app.get('/*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});


// INICIAR EL SERVIDOR 
app.listen(PORT, () => {
  console.log(`Servidor Express corriendo en el puerto ${PORT}`);
});