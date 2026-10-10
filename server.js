const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const DB_FILE = path.join(__dirname, "database.json");

function readDB() {
  let data;
  if (!fs.existsSync(DB_FILE)) {
    data = {
      categories: [
        { id: "perfume", label: "عطر و ادکلن" },
        { id: "body_splash", label: "بادی اسپلش" },
        { id: "air_freshener", label: "اسپری و خوشبوکننده هوا" },
      ],
      shippingMethods: [
        {
          id: "post",
          label: "پست پیشتاز (سراسر کشور)",
          price: 45000,
          desc: "تحویل ۳ تا ۵ روز کاری",
        },
        {
          id: "tipax",
          label: "تیپاکس / چاپار (پس‌کرایه)",
          price: 0,
          desc: "پرداخت کرایه هنگام تحویل",
        },
        {
          id: "courier_rasht",
          label: "پیک موتوری فوری (ویژه شهر رشت)",
          price: 35000,
          desc: "تحویل همان روز در رشت",
        },
      ],
      products: [
        {
          id: 1,
          name: "باکارات روژ ۵۴۰",
          brand: "Maison Francis Kurkdjian",
          category: "perfume",
          gender: "اسپرت (زنانه/مردانه)",
          image:
            "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800",
          description:
            "عطری درخشان، پیچیده و بسیار لوکس با هماهنگی شاعرانه از نت‌های زعفران، گل یاس و چوب سدر.",
          inStock: true,
          isSuggested: true,
          variants: [
            {
              size: "شیشه اورجینال (۱۰۰ میل)",
              price: 18500000,
              discountPercent: 10,
              discountStartDate: "",
              discountExpiryDate: "",
            },
            {
              size: "دست‌ریز تخصصی (۳۰ میل)",
              price: 5800000,
              discountPercent: 0,
              discountStartDate: "",
              discountExpiryDate: "",
            },
            {
              size: "دست‌ریز تخصصی (۱۰ میل)",
              price: 2100000,
              discountPercent: 0,
              discountStartDate: "",
              discountExpiryDate: "",
            },
          ],
        },
      ],
      orders: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } else {
    const raw = fs.readFileSync(DB_FILE, "utf8");
    data = JSON.parse(raw);
    if (!data.shippingMethods) {
      data.shippingMethods = [
        {
          id: "post",
          label: "پست پیشتاز (سراسر کشور)",
          price: 45000,
          desc: "تحویل ۳ تا ۵ روز کاری",
        },
        {
          id: "tipax",
          label: "تیپاکس / چاپار (پس‌کرایه)",
          price: 0,
          desc: "پرداخت کرایه هنگام تحویل",
        },
        {
          id: "courier_rasht",
          label: "پیک موتوری فوری (ویژه شهر رشت)",
          price: 35000,
          desc: "تحویل همان روز در رشت",
        },
      ];
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
    }
  }
  return data;
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
}

// API روش‌های ارسال
app.get("/api/shipping", (req, res) => {
  res.json(readDB().shippingMethods);
});

app.put("/api/shipping/:id", (req, res) => {
  const db = readDB();
  const { price } = req.body;
  db.shippingMethods = db.shippingMethods.map((s) =>
    s.id === req.params.id ? { ...s, price: Number(price) } : s
  );
  writeDB(db);
  res.json({ success: true });
});

// API دسته‌بندی‌ها
app.get("/api/categories", (req, res) => {
  res.json(readDB().categories);
});

app.post("/api/categories", (req, res) => {
  const db = readDB();
  const { label } = req.body;
  if (!label) return res.status(400).json({ error: "عنوان الزامی است" });
  const newCat = { id: `cat_${Date.now()}`, label };
  db.categories.push(newCat);
  writeDB(db);
  res.json({ success: true, category: newCat });
});

app.delete("/api/categories/:id", (req, res) => {
  const db = readDB();
  db.categories = db.categories.filter((c) => c.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

// API محصولات
app.get("/api/products", (req, res) => {
  res.json(readDB().products);
});

app.post("/api/products", (req, res) => {
  const db = readDB();
  const newProduct = { id: Date.now(), ...req.body, inStock: true };
  db.products.unshift(newProduct);
  writeDB(db);
  res.json({ success: true, product: newProduct });
});

// ✏️ ویرایش محصول موجود
app.put("/api/products/:id", (req, res) => {
  const db = readDB();
  const productId = Number(req.params.id);
  db.products = db.products.map((p) =>
    p.id === productId ? { ...p, ...req.body } : p
  );
  writeDB(db);
  res.json({ success: true });
});

app.patch("/api/products/:id/stock", (req, res) => {
  const db = readDB();
  db.products = db.products.map((p) =>
    p.id == req.params.id ? { ...p, inStock: !p.inStock } : p
  );
  writeDB(db);
  res.json({ success: true });
});

app.delete("/api/products/:id", (req, res) => {
  const db = readDB();
  db.products = db.products.filter((p) => p.id != req.params.id);
  writeDB(db);
  res.json({ success: true });
});

// API سفارشات و پرداخت
app.get("/api/orders", (req, res) => {
  res.json(readDB().orders);
});

app.post("/api/payment/request", (req, res) => {
  res.json({
    success: true,
    isMock: true,
    authority: `MOCK_AUTH_${Date.now()}`,
  });
});

app.post("/api/payment/verify", (req, res) => {
  const db = readDB();
  const { authority, orderPayload } = req.body;
  const trackingCode = `PRS-${Math.floor(100000 + Math.random() * 900000)}`;
  const newOrder = {
    id: Date.now(),
    trackingCode,
    status: "پرداخت شده و در حال پردازش",
    authority,
    refId: Math.floor(10000000 + Math.random() * 90000000).toString(),
    ...orderPayload,
  };
  db.orders.unshift(newOrder);
  writeDB(db);
  res.json({ success: true, trackingCode });
});

app.listen(PORT, () =>
  console.log(`🚀 سرور روشن شد روی پورت: http://localhost:${PORT}`)
);
