const { connectDb } = require("./config/db");
const { db } = require("./models");
const authRoutes = require("./routes/authRoutes");
const swaggerDocs = require("./config/swagger");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/category");
const orderRoutes = require("./routes/order");

const app = express();
app.use(express.json());

connectDb();

app.use("/auth", authRoutes);
app.use("/category", categoryRoutes);
app.use("/products", productRoutes);
app.use("/order", orderRoutes);

swaggerDocs(app);

app.listen(5000, async () => {
  await db.sync({ force: false });
  console.log("Server 5000-portda ishlayapti");
});
