// backend/server.js
const express = require("express");
const cors = require('cors');
const bodyParser = require("body-parser");
const usersRoutes = require("./routes/users"); // Importa las nuevas rutas
const db = require("./db") 

const app = express();
const PORT = 3000;

const whitelist = ['https://proyecto-integrador-alt-f4.vercel.app'];

const corsOptions = {
  origin: function (origin, callback) {
    // Permite peticiones si la URL está en la lista o si es una petición sin 'origin' (como Postman)
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  }
};

app.use(cors(corsOptions));

// Middleware: Permite que Express lea cuerpos de petición JSON (para POST y PUT)
app.use(bodyParser.json());


// SDK de Mercado Pago
const { MercadoPagoConfig, Preference } = require("mercadopago");
// Agrega credenciales
const client = new MercadoPagoConfig({
  accessToken:
    "APP_USR-5297062915426978-090319-d6089e8ecdab5289c86405e84054f715-2670517922",
});

app.post("/create_preference", async (req, res) => {
  const id_user = 1;
  
  const { 
        items: cartItems , 
        total: total,
        paymentMethod = 'mercadopago', // Aseguramos que sea 'mercadopago' para este endpoint
        // Otros datos que necesites...
      } = req.body;
      console.log(req.body) 
    if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ error: "El carrito está vacío." });
    }
    let connection;
    let orderStatus = "Pagado con mercado pago"; 
    let id_pedido_db = null;


        connection = await db.getConnection(); 
        await connection.beginTransaction();

        // 1. --- Insertar el pedido en la tabla Pedidos (Estado Pendiente) ---

        const insertPedidoQuery = `
            INSERT INTO Pedidos 
                (id_user, fecha_hora, total, estado, id_transaccion_mp) 
            VALUES (?, NOW(), ?, ?, ?)
        `;
        
        // Usamos null para id_transaccion_mp, ya que el ID de Mercado Pago se asigna después.
        const [result] = await connection.execute(insertPedidoQuery, [
            id_user, 
            total,
            orderStatus, 
            null // id_transaccion_mp es NULL inicialmente
        ]);

        id_pedido_db = result.insertId; // Obtener el ID del pedido recién insertado
        console.log(`Pedido ${id_pedido_db} insertado con estado: ${orderStatus}`);

        // 2. --- Insertar los detalles del pedido en detalle_pedido ---
        const detailPromises = cartItems.filter(item => item && item.id).map(item => {
            const quantity = parseInt(item.quantity) || 1;
            const priceAsNumber = parseFloat(item.price) || 0; 
            
            const insertDetalleQuery = `
                INSERT INTO detalle_pedido 
                    (id_pedido, id_producto, precio_unitario, cantidad) 
                VALUES (?, ?, ?, ?)
            `;
            return connection.execute(insertDetalleQuery, [
                id_pedido_db,
                item.id,
                priceAsNumber.toFixed(2), // Formato para la DB
                quantity,
            ]);
        });

        await Promise.all(detailPromises);

  try {
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
    // Crear la preferencia con los items validados
    const data = await preference.create({
      body: {
        items: itemsForPreference,
        currency_id: "ARS",
        external_reference: id_pedido_db.toString(),
        back_urls: {
          success: "https://www.google.com",
          failure: "https://www.google.com",
          pending: "https://www.google.com",
        },
        auto_return: "approved",
      },
    });
    await connection.commit();

    console.log("Preferencia creada:", data);

    // Retornar la información de la preferencia

    res.status(201).json({
      message: "Orden creada y preferencia de pago generada exitosamente.",
            id_pedido: id_pedido_db,
            preference_id: data.id,
            preference_url: data.init_point || data.sandbox_init_point,
    });
  } catch (error) {
    if (connection) {
            await connection.rollback(); 
            connection.release();
        }
        console.error("Error al crear la orden y preferencia de MP:", error);
        res
            .status(500)
            .json({ error: "Error al procesar la orden.", details: error.message });
    } finally {
        if (connection) {
            connection.release(); // Asegurar la liberación de la conexión
        }
    }
  });

// Montar las Rutas de Usuarios en el prefijo /api/users
app.use("/api/users", usersRoutes);

// Ruta de prueba simple
app.get("/", (req, res) => {
  res.send("API de Backend corriendo.");
});

// Iniciar el Servidor
app.listen(PORT, () => {
  console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
});

app.post("/save_order", async (req, res) => {
  const id_user = 1;
  const { cartItems, totalPedido: total = 0 , paymentMethod = 'efectivo', mpTransactionId = null,name = "",address = " ",phone =" " } = req.body;
  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: "El carrito está vacío." });
  }
  const normalizedPaymentMethod = (paymentMethod || 'efectivo').toLowerCase();

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: "El carrito está vacío." });
  }


  let connection;
  let orderStatus;
  try {
    connection = await db.getConnection(); // Obtener una conexión del poolD
    await connection.beginTransaction();
    if  (normalizedPaymentMethod === "card") {
        // Estado inmediato para efectivo y tarjetas manuales
        orderStatus = "Pago con Tarjeta Credito"; // El pedido se confirma inmediatamente
    }else if 
      (normalizedPaymentMethod === "cash" )
      {orderStatus = "Pagado Efectivo"} 
      else if (normalizedPaymentMethod.includes("mp")) {  // <-- Adaptar a tu identificador
    orderStatus = "Pagado con MP";
      }
      else {
        orderStatus = "Pendiente";
      }

    // 1. Insertar el pedido en la tabla Pedidos
    const insertPedidoQuery = `
      INSERT INTO Pedidos 
        (id_user, fecha_hora, total, estado, id_transaccion_mp) 
      VALUES (?, NOW(), ?,  ?, ?)
    `;
    const [result] = await connection.execute(insertPedidoQuery, [
      id_user, 
      total,
      orderStatus, 
      mpTransactionId
    ]);

    const id_pedido = result.insertId; // Obtener el ID del pedido recién insertado
    console.log(`Pedido insertado con ID: ${id_pedido}`);

    // 2. Insertar los detalles del pedido en detalle_pedido
    const detailPromises = cartItems.filter(item => item && item.id).map(item => {
      const quantity = parseInt(item.quantity) || 1;
      const priceAsNumber = parseFloat(item.price);
      const insertDetalleQuery = `
        INSERT INTO detalle_pedido 
          (id_pedido, id_producto, precio_unitario, cantidad) 
        VALUES (?, ?, ?, ?)
      `;
      return connection.execute(insertDetalleQuery, [
        id_pedido,
        item.id,        // id_producto
        priceAsNumber,          // precio_unitario  
        quantity,   // cantidad  
            
      ]);
    });

    await Promise.all(detailPromises); // Ejecutar todas las inserciones de detalle
    
    await connection.commit(); // Confirmar la transacción (guardar todo)

    res.status(201).json({ 
        message: "Pedido guardado exitosamente", 
        id_pedido,
        orderNumber: `FD${id_pedido}`
    });

  } catch (error) {
    if (connection) {
      await connection.rollback(); // Deshacer si hubo un error
    }
    console.error("Error al guardar el pedido:", error);
    res.status(500).json({ error: "Error interno al procesar el pedido." });
  } finally {
    if (connection) {
      connection.release(); // Liberar la conexión al pool
    }
  }
});

app.get("/", (req, res) => {
});