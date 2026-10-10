import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Search, Star, X, Plus, Minus, 
  Eye, MapPin, Phone, ShieldCheck, Sparkles, Award, ArrowLeft, CheckCircle, Send, Gift, ChevronDown, Clock, Lock, Settings, Trash2, Store, Edit3, AlertCircle, Upload, Tag, Percent, Truck, PackageCheck, ListOrdered, Calendar, Menu, ArrowUpDown, Filter, SlidersHorizontal
} from 'lucide-react';

const DEFAULT_CATEGORIES = [
  { id: 'perfume', label: 'عطر و ادکلن' },
  { id: 'body_splash', label: 'بادی اسپلش' },
  { id: 'air_freshener', label: 'اسپری و خوشبوکننده هوا' }
];

export default function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [shippingMethods, setShippingMethods] = useState([
    { id: 'post', label: 'پست پیشتاز (سراسر کشور)', price: 45000, desc: 'تحویل ۳ تا ۵ روز کاری' },
    { id: 'tipax', label: 'تیپاکس / چاپار (پس‌کرایه)', price: 0, desc: 'پرداخت کرایه هنگام تحویل' },
    { id: 'courier_rasht', label: 'پیک موتوری فوری (ویژه شهر رشت)', price: 35000, desc: 'تحویل همان روز در رشت' }
  ]);
  const [orders, setOrders] = useState([]);
  const [newCategoryLabel, setNewCategoryLabel] = useState('');
  
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [adminActiveTab, setAdminActiveTab] = useState('products');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [editingProductId, setEditingProductId] = useState(null);

  // حالت‌های جدید فیلتر کشویی
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('suggested'); 
  const [selectedGender, setSelectedGender] = useState('all'); 
  const [maxPriceFilter, setMaxPriceFilter] = useState(20000000);

  const [isRedirectingToGateway, setIsRedirectingToGateway] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [lastTrackingCode, setLastTrackingCode] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  // سیستم نظرات برای صفحه جزئیات محصول
  const [userReviews, setUserReviews] = useState([
    { id: 1, user: 'سارا رضایی', text: 'رایحه‌اش بی‌نظیر و ماندگاری بسیار بالایی داره. عاشقش شدم!', stars: 5 },
    { id: 2, user: 'علی اکبری', text: 'بسته‌بندی عالی بود و خیلی سریع بدستم رسید.', stars: 4 }
  ]);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);

  const [phoneError, setPhoneError] = useState('');
  const [postalCodeError, setPostalCodeError] = useState('');
  const [selectedShipping, setSelectedShipping] = useState(shippingMethods[0]);

  const [variantList, setVariantList] = useState([
    { size: 'شیشه اورجینال (۱۰۰ میل)', price: '', discountPercent: 0, discountStartDate: '', discountExpiryDate: '' },
    { size: 'دست‌ریز تخصصی (۳۰ میل)', price: '', discountPercent: 0, discountStartDate: '', discountExpiryDate: '' },
    { size: 'دست‌ریز تخصصی (۱۰ میل)', price: '', discountPercent: 0, discountStartDate: '', discountExpiryDate: '' }
  ]);

  const [productForm, setProductForm] = useState({
    name: '',
    brand: '',
    category: 'perfume',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800',
    description: '',
    gender: 'زنانه/مردانه',
    isSuggested: false
  });

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    postalCode: '',
    city: 'رشت',
    address: '',
    note: ''
  });

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/products');
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (err) { console.error(err); }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/categories');
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch (err) { console.error(err); }
  };

  const fetchShipping = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/shipping');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setShippingMethods(data);
        setSelectedShipping(prev => data.find(s => s.id === prev?.id) || data[0]);
      }
    } catch (err) { console.error(err); }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/orders');
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchShipping();
  }, []);

  useEffect(() => {
    if (adminLoggedIn) {
      fetchOrders();
      fetchShipping();
    }
  }, [adminLoggedIn]);

  const handleUpdateShippingPrice = async (id, newPrice) => {
    try {
      await fetch(`http://localhost:5000/api/shipping/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: newPrice })
      });
      fetchShipping();
      alert('هزینه ارسال به‌روزرسانی شد.');
    } catch (err) { console.error(err); }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryLabel.trim()) return;
    try {
      const res = await fetch('http://localhost:5000/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newCategoryLabel.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setNewCategoryLabel('');
        fetchCategories();
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteCategory = async (catId) => {
    if (window.confirm('آیا از حذف این دسته‌بندی اطمینان دارید؟')) {
      try {
        await fetch(`http://localhost:5000/api/categories/${catId}`, { method: 'DELETE' });
        fetchCategories();
      } catch (err) { console.error(err); }
    }
  };

  const getFinalPrice = (price, discountPercent = 0) => {
    if (!discountPercent || discountPercent <= 0) return price;
    return Math.round(price * (1 - discountPercent / 100));
  };

  const getMinPrice = (product) => {
    if (!product.variants || product.variants.length === 0) return 0;
    const minV = product.variants[product.variants.length - 1];
    return getFinalPrice(minV.price, minV.discountPercent);
  };

  const filteredProducts = products.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGender = selectedGender === 'all' || (item.gender && item.gender.includes(selectedGender));
    const minPrice = getMinPrice(item);
    const matchesPrice = minPrice <= maxPriceFilter;

    return matchesCategory && matchesSearch && matchesGender && matchesPrice;
  }).sort((a, b) => {
    if (sortBy === 'price_asc') return getMinPrice(a) - getMinPrice(b);
    if (sortBy === 'price_desc') return getMinPrice(b) - getMinPrice(a);
    if (sortBy === 'newest') return b.id - a.id;
    return (b.isSuggested ? 1 : 0) - (a.isSuggested ? 1 : 0);
  });

  const suggestedProducts = products.filter(p => p.isSuggested && p.inStock);

  const handleSelectCategory = (catId) => {
    setSelectedCategory(catId);
    setIsMobileMenuOpen(false);
    const element = document.getElementById('products');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpenProduct = (product) => {
    setSelectedProduct(product);
    setSelectedVariantIndex(0);
  };

  const addToCart = (product, variantIndex = 0) => {
    if (!product.inStock || !product.variants || product.variants.length === 0) return;
    const variant = product.variants[variantIndex];
    const finalPrice = getFinalPrice(variant.price, variant.discountPercent);
    const cartItemId = `${product.id}-${variant.size}`;

    setCart(prev => {
      const existing = prev.find(item => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map(item => item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { 
        cartItemId, id: product.id, name: product.name, brand: product.brand,
        image: product.image, size: variant.size, price: finalPrice, originalPrice: variant.price, quantity: 1 
      }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (cartItemId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.cartItemId === cartItemId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const subTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = selectedShipping ? selectedShipping.price : 0;
  const grandTotal = subTotal + shippingFee;

  const toggleStock = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/products/${id}/stock`, { method: 'PATCH' });
      fetchProducts();
    } catch (err) { console.error(err); }
  };

  const deleteProduct = async (id) => {
    if (window.confirm('آیا از حذف این محصول اطمینان دارید؟')) {
      try {
        await fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' });
        fetchProducts();
      } catch (err) { console.error(err); }
    }
  };

  const startEditingProduct = (product) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      brand: product.brand,
      category: product.category,
      image: product.image,
      description: product.description,
      gender: product.gender || 'زنانه/مردانه',
      isSuggested: product.isSuggested || false
    });
    if (product.variants && product.variants.length > 0) {
      setVariantList(product.variants.map(v => ({
        size: v.size,
        price: v.price,
        discountPercent: v.discountPercent || 0,
        discountStartDate: v.discountStartDate || '',
        discountExpiryDate: v.discountExpiryDate || ''
      })));
    }
  };

  const cancelEditing = () => {
    setEditingProductId(null);
    setProductForm({
      name: '', brand: '', category: categories[0]?.id || 'perfume', image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800', description: '', gender: 'زنانه/مردانه', isSuggested: false
    });
    setVariantList([
      { size: 'شیشه اورجینال (۱۰۰ میل)', price: '', discountPercent: 0, discountStartDate: '', discountExpiryDate: '' },
      { size: 'دست‌ریز تخصصی (۳۰ میل)', price: '', discountPercent: 0, discountStartDate: '', discountExpiryDate: '' },
      { size: 'دست‌ریز تخصصی (۱۰ میل)', price: '', discountPercent: 0, discountStartDate: '', discountExpiryDate: '' }
    ]);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProductForm(prev => ({ ...prev, image: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleAddVariantRow = () => {
    setVariantList(prev => [...prev, { size: '', price: '', discountPercent: 0, discountStartDate: '', discountExpiryDate: '' }]);
  };

  const handleRemoveVariantRow = (index) => {
    setVariantList(prev => prev.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index, field, value) => {
    setVariantList(prev => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  const handleSaveProductSubmit = async (e) => {
    e.preventDefault();
    const validVariants = variantList.filter(v => v.size.trim() && v.price).map(v => ({ 
      size: v.size.trim(), 
      price: Number(v.price), 
      discountPercent: Number(v.discountPercent || 0), 
      discountStartDate: v.discountStartDate || '',
      discountExpiryDate: v.discountExpiryDate || ''
    }));

    if (validVariants.length === 0) {
      alert('لطفاً حداقل یک حجم و قیمت معتبر وارد کنید.');
      return;
    }

    const payload = { ...productForm, variants: validVariants };

    try {
      if (editingProductId) {
        await fetch(`http://localhost:5000/api/products/${editingProductId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        alert('محصول با موفقیت ویرایش شد!');
        setEditingProductId(null);
      } else {
        await fetch('http://localhost:5000/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        alert('محصول جدید ذخیره شد!');
      }

      fetchProducts();
      cancelEditing();
    } catch (err) { console.error(err); }
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!/^09[0-9]{9}$/.test(formData.phone)) {
      setPhoneError('شماره موبایل نامعتبر است.');
      return;
    }
    if (!/^[0-9]{10}$/.test(formData.postalCode)) {
      setPostalCodeError('کد پستی باید ۱۰ رقم باشد.');
      return;
    }

    const orderPayload = {
      customer: formData,
      shipping: selectedShipping,
      items: cart,
      subTotal,
      shippingFee,
      grandTotal,
      date: new Date().toLocaleString('fa-IR')
    };

    try {
      const res = await fetch('http://localhost:5000/api/payment/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();
      if (data.success) {
        const verifyRes = await fetch('http://localhost:5000/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ authority: data.authority, orderPayload })
        });
        const verifyData = await verifyRes.json();
        if (verifyData.success) {
          setLastTrackingCode(verifyData.trackingCode);
          setIsRedirectingToGateway(true);
          setTimeout(() => {
            setIsRedirectingToGateway(false);
            setOrderSuccess(true);
            setCart([]);
          }, 2000);
        }
      }
    } catch (err) { console.error(err); }
  };

  const resetCheckout = () => {
    setIsCheckoutOpen(false);
    setOrderSuccess(false);
    setIsRedirectingToGateway(false);
    setPhoneError('');
    setPostalCodeError('');
    setFormData({ fullName: '', phone: '', postalCode: '', city: 'رشت', address: '', note: '' });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF9] text-[#2A2A2A] flex flex-col font-['Vazirmatn',sans-serif] selection:bg-[#E6007E] selection:text-white overflow-x-hidden" dir="rtl">
      
      {/* 🌸 نوار بالای صفحه */}
      <div className="bg-[#FAF2F7] text-gray-800 py-2.5 border-b border-[#F3E1EC] text-[11px] sm:text-xs font-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-1 sm:gap-0">
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin className="w-3.5 h-3.5 text-[#E6007E] shrink-0" />
            <span className="text-center sm:text-right">رشت، گیلان — شعبه مرکزی گالری عطر پاریس</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:flex items-center gap-1.5 text-[#E6007E] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#E6007E]" /> ارائه مستقیم رایحه‌های نیش و دست‌ریز تخصصی
            </span>
            <div className="flex items-center gap-1.5 text-gray-700">
              <Phone className="w-3.5 h-3.5 text-[#E6007E] shrink-0" />
              <span className="font-semibold">۰۱۳-۳۳۰۰۰۰۰۰</span>
            </div>
          </div>
        </div>
      </div>

      {/* هدر اصلی */}
      <header className="sticky top-0 z-40 bg-[#FDFBF9]/90 backdrop-blur-md border-b border-[#F0E6DF] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="md:hidden p-2.5 rounded-2xl bg-white border border-[#E8DCD3] text-gray-800 shadow-sm"
              aria-label="منوی موبایل"
            >
              <Menu className="w-5 h-5 text-[#E6007E]" />
            </button>

            <div className="w-11 h-11 rounded-full bg-white border border-[#E8DCD3] shadow-sm flex items-center justify-center p-0.5 overflow-hidden shrink-0">
              <img src="/logo.png" alt="عطر پاریس رشت" className="w-full h-full object-contain" onError={(e) => e.target.style.display='none'} />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-black text-gray-900 tracking-tight block">عطر پاریس</span>
              <span className="text-[8px] sm:text-[9px] text-[#E6007E] font-bold tracking-[0.2em] sm:tracking-[0.25em] block uppercase">PARIS PERFUME RASHT</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-9 text-sm font-semibold text-gray-700">
            <a href="#" className="text-[#E6007E] transition border-b-2 border-[#E6007E] pb-1">صفحه اصلی</a>
            
            <div className="relative group py-2">
              <button className="flex items-center gap-1 hover:text-[#E6007E] transition pb-1 font-semibold group-hover:text-[#E6007E]">
                محصولات <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180 text-gray-400 group-hover:text-[#E6007E]" />
              </button>

              <div className="absolute right-0 top-full hidden group-hover:block w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50">
                <button onClick={() => handleSelectCategory('all')} className="w-full text-right px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-700 hover:bg-[#FAF2F7] hover:text-[#E6007E] transition">همه محصولات</button>
                {categories.map(cat => (
                  <button key={cat.id} onClick={() => handleSelectCategory(cat.id)} className="w-full text-right px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-700 hover:bg-[#FAF2F7] hover:text-[#E6007E] transition">{cat.label}</button>
                ))}
              </div>
            </div>

            <a href="#about" className="hover:text-[#E6007E] transition pb-1">درباره شعبه رشت</a>
            <a href="#contact" className="hover:text-[#E6007E] transition pb-1">تماس با ما</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-2xl bg-white border border-[#E8DCD3] text-gray-800 hover:bg-[#E6007E] hover:text-white hover:border-[#E6007E] transition-all duration-300 shadow-sm flex items-center gap-2 px-3 sm:px-4 group"
            >
              <ShoppingBag className="w-5 h-5 text-[#E6007E] group-hover:text-white transition-colors duration-300 shrink-0" />
              <span className="text-xs font-bold hidden sm:inline-block">سبد خرید</span>
              {cart.length > 0 && (
                <span className="bg-[#E6007E] text-white group-hover:bg-white group-hover:text-[#E6007E] text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm transition-colors duration-300">
                  {cart.reduce((a, c) => a + c.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 🗼 هیرو بنر جدید لوکس با پس‌زمینه برج ایفل و طیف رنگی گرم و صورتی */}
      <div className="relative w-full bg-[#FDFBF9] text-gray-900 shadow-xl min-h-[420px] sm:min-h-[480px] flex items-center overflow-hidden border-b border-rose-100/60">
        {/* پس‌زمینه محو برج ایفل */}
        <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1400&auto=format&fit=crop')] bg-cover bg-center filter blur-[1px]"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-[#FDFBF9]/90 via-[#FDFBF9]/60 to-transparent z-0" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-12 py-12 w-full flex flex-col md:flex-row items-center justify-between">
          <div className="max-w-xl space-y-6">
            <div className="inline-flex items-center gap-2 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold px-4 py-1.5 rounded-full shadow-sm">
              <Award className="w-4 h-4 text-rose-600 shrink-0" /> شیشه اصلی و دست‌ریزهای تخصصی فرانسوی
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black mb-3 leading-tight tracking-tight text-gray-900">
              هر رایحه، <br /><span className="text-[#E6007E]">یک داستان خاص</span>
            </h1>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-light">
              مجموعه‌ای گران‌بها از عطرهای نیش فرانسه، دست‌ریزهای تخصصی و بادی‌اسپلش‌های اورجینال برای امضای استایل شما.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a href="#products" className="bg-[#E6007E] hover:bg-[#c4006c] text-white px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-[#E6007E]/30 transition flex items-center gap-2">
                مشاهده کلکسیون عطرها <ArrowLeft className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* کارت تصویر عطر لوکس */}
          <div className="relative mt-8 md:mt-0 w-full md:w-1/2 flex justify-center items-center">
            <div className="relative z-10 p-4 bg-white/60 backdrop-blur-md rounded-3xl border border-white/80 shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop" 
                alt="Paris Perfume Luxury" 
                className="w-72 md:w-80 h-80 object-cover rounded-2xl shadow-md"
              />
            </div>
          </div>
        </div>
      </div>

      {/* منوی کشویی موبایل */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative w-4/5 max-w-sm bg-white h-full z-10 p-6 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b">
                <span className="text-base font-black text-gray-900">منوی وب‌سایت</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-1.5 rounded-xl bg-gray-100"><X className="w-5 h-5" /></button>
              </div>

              <div className="mt-6 space-y-3 font-bold text-sm text-gray-700">
                <button onClick={() => { setIsMobileMenuOpen(false); }} className="w-full text-right py-2 text-[#E6007E]">صفحه اصلی</button>
                <div className="pt-2 border-t">
                  <span className="text-xs text-gray-400 font-normal block mb-2">دسته‌بندی محصولات:</span>
                  <button onClick={() => handleSelectCategory('all')} className="w-full text-right py-2 hover:text-[#E6007E]">همه محصولات</button>
                  {categories.map(cat => (
                    <button key={cat.id} onClick={() => handleSelectCategory(cat.id)} className="w-full text-right py-2 hover:text-[#E6007E]">{cat.label}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t text-xs text-gray-500 space-y-2">
              <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#E6007E]" /> رشت، گلسار، عطر پاریس</p>
              <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-[#E6007E]" /> ۰۱۳-۳۳۰۰۰۰۰۰</p>
            </div>
          </div>
        </div>
      )}

      {/* بخش اصلی */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full">

        {/* 🛡️ نوار ویژگی‌ها */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
          <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-right gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF2F7] flex items-center justify-center text-[#E6007E] shrink-0 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-gray-900">ضمانت اصالت</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">۱۰۰٪ اصل</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-right gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF2F7] flex items-center justify-center text-[#E6007E] shrink-0 shadow-sm">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-gray-900">پرداخت امن</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">درگاه شاپرک</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-right gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF2F7] flex items-center justify-center text-[#E6007E] shrink-0 shadow-sm">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-gray-900">ارسال سریع</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">پیک و پست</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-right gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF2F7] flex items-center justify-center text-[#E6007E] shrink-0 shadow-sm">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-gray-900">پشتیبانی</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">پاسخگویی فعال</p>
            </div>
          </div>
        </div>

        {/* 🎛️ بخش کنترل فیلتر و مرتب‌سازی کشویی (پنهان/نمایان با دکمه اختصاصی) */}
        <div id="products" className="mb-8 sm:mb-10 bg-white p-4 sm:p-5 rounded-3xl border border-rose-100 shadow-md space-y-4">
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 sm:px-4 py-2 rounded-2xl text-[11px] sm:text-xs font-bold transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-[#1A1A1A] text-white shadow-md'
                    : 'bg-rose-50 text-gray-600 hover:bg-rose-100'
                }`}
              >
                همه محصولات
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 sm:px-4 py-2 rounded-2xl text-[11px] sm:text-xs font-bold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-[#1A1A1A] text-white shadow-md'
                      : 'bg-rose-50 text-gray-600 hover:bg-rose-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              {/* دکمه باز و بسته کردن فیلترها و مرتب‌سازی */}
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="bg-[#E6007E] hover:bg-[#c4006c] text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-md flex items-center gap-2 transition w-full md:w-auto justify-center"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {isFilterOpen ? 'بستن فیلترها' : 'فیلتر و مرتب‌سازی پیشرفته'}
              </button>

              <div className="relative flex-1 md:w-72">
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="جستجوی عطر یا برند..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-2 pr-10 pl-4 text-xs focus:outline-none focus:border-[#E6007E] transition"
                />
              </div>
            </div>
          </div>

          {/* پنل کشویی فیلترها که با دکمه باز و بسته میشه */}
          {isFilterOpen && (
            <div className="pt-4 border-t border-rose-100 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fadeIn">
              
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-600 block">مرتب‌سازی قیمت:</label>
                <select 
                  value={sortBy} 
                  onChange={e => setSortBy(e.target.value)} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 font-bold text-gray-800 focus:outline-none text-xs"
                >
                  <option value="suggested">پیشنهادی عطر پاریس</option>
                  <option value="price_asc">ارزان‌ترین به گران‌ترین</option>
                  <option value="price_desc">گران‌ترین به ارزان‌ترین</option>
                  <option value="newest">جدیدترین محصولات</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-600 block">جنسیت عطر:</label>
                <div className="flex gap-1 bg-gray-50 p-1 rounded-xl border">
                  <button onClick={() => setSelectedGender('all')} className={`flex-1 py-1 rounded-lg transition text-xs ${selectedGender === 'all' ? 'bg-white font-bold text-[#E6007E] shadow-sm' : 'text-gray-600'}`}>همه</button>
                  <button onClick={() => setSelectedGender('زنانه')} className={`flex-1 py-1 rounded-lg transition text-xs ${selectedGender === 'زنانه' ? 'bg-white font-bold text-[#E6007E] shadow-sm' : 'text-gray-600'}`}>زنانه</button>
                  <button onClick={() => setSelectedGender('مردانه')} className={`flex-1 py-1 rounded-lg transition text-xs ${selectedGender === 'مردانه' ? 'bg-white font-bold text-[#E6007E] shadow-sm' : 'text-gray-600'}`}>مردانه</button>
                </div>
              </div>

              <div className="space-y-1 bg-gray-50 p-3 rounded-2xl border">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-600 font-bold">حداکثر قیمت:</span>
                  <span className="font-bold text-[#E6007E]">{maxPriceFilter.toLocaleString('fa-IR')} ت</span>
                </div>
                <input 
                  type="range" 
                  min={500000} 
                  max={20000000} 
                  step={500000} 
                  value={maxPriceFilter} 
                  onChange={e => setMaxPriceFilter(Number(e.target.value))} 
                  className="accent-[#E6007E] cursor-pointer w-full mt-1"
                />
              </div>

            </div>
          )}
        </div>

        {/* کارت‌های محصولات */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
          {filteredProducts.map(product => {
            const hasVariants = product.variants && product.variants.length > 0;
            const minVariant = hasVariants ? product.variants[product.variants.length - 1] : { price: 0, discountPercent: 0 };
            const finalMinPrice = getFinalPrice(minVariant.price, minVariant.discountPercent);
            const hasDiscount = minVariant.discountPercent > 0;

            return (
              <div 
                key={product.id}
                className={`bg-white rounded-3xl border border-rose-100/80 transition-all duration-300 overflow-hidden flex flex-col justify-between group relative ${
                  product.inStock ? 'shadow-sm hover:shadow-2xl hover:-translate-y-1.5 hover:border-[#E6007E]/30' : 'opacity-60'
                }`}
              >
                <div>
                  <div className="relative aspect-square bg-[#FAF6F2] overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />

                    {hasDiscount && (
                      <div className="absolute top-3 right-3 flex flex-col gap-1 items-end z-10">
                        <span className="bg-[#E6007E] text-white font-black text-[10px] px-2.5 py-1 rounded-full shadow-md flex items-center gap-0.5">
                          <Percent className="w-3 h-3" /> {minVariant.discountPercent}٪ تخفیف
                        </span>
                        {minVariant.discountExpiryDate && (
                          <span className="bg-black/80 backdrop-blur-md text-amber-300 font-semibold text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" /> تا {minVariant.discountExpiryDate}
                          </span>
                        )}
                      </div>
                    )}

                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-red-600 text-white font-black text-xs px-4 py-1.5 rounded-full shadow-lg">
                          ناموجود
                        </span>
                      </div>
                    )}
                    {product.inStock && (
                      <button 
                        onClick={() => handleOpenProduct(product)}
                        className="absolute top-3 left-3 p-2.5 bg-white/90 backdrop-blur-md rounded-full text-gray-700 hover:text-[#E6007E] shadow-sm transition z-10"
                        title="مشاهده و انتخاب"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <span className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-gray-700 shadow-sm border border-gray-100">
                      {product.gender}
                    </span>
                  </div>

                  <div className="p-4 sm:p-5">
                    <span className="text-[11px] font-bold text-[#E6007E] block uppercase tracking-wider mb-1">
                      {product.brand}
                    </span>
                    <h3 className="text-base font-extrabold text-gray-900 leading-snug">{product.name}</h3>
                  </div>
                </div>

                <div className="p-4 sm:p-5 pt-0">
                  <div className="pt-4 border-t border-[#F5EBE4] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-medium">شروع قیمت از:</span>
                      {hasDiscount && (
                        <span className="text-xs text-gray-400 line-through block -mb-1 font-semibold">
                          {minVariant.price.toLocaleString('fa-IR')}
                        </span>
                      )}
                      <span className="text-sm font-black text-gray-900">
                        {finalMinPrice.toLocaleString('fa-IR')} <span className="text-[10px] font-normal text-gray-500">تومان</span>
                      </span>
                    </div>
                    {product.inStock ? (
                      <button
                        onClick={() => handleOpenProduct(product)}
                        className="bg-[#1A1A1A] hover:bg-[#E6007E] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-md"
                      >
                        انتخاب
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-xl">ناموجود</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* 🖤 فوتر */}
      <footer id="contact" className="bg-[#121212] text-white mt-16 sm:mt-20 pt-12 sm:pt-16 pb-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 pb-12 border-b border-gray-800">
            <div id="about" className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-0.5 shrink-0">
                  <img src="/logo.png" alt="عطر پاریس رشت" className="w-full h-full object-contain" onError={(e) => e.target.style.display='none'} />
                </div>
                <div>
                  <span className="text-lg font-black text-white block">عطر پاریس</span>
                  <span className="text-[8px] text-[#E6007E] font-bold tracking-[0.2em] block uppercase">PARIS PERFUME RASHT</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed font-light">
                گالری عطر پاریس شعبه تخصصی گیلان، مرجع ارائه عطرهای نیش، دست‌ریزهای استاندارد و اسپری‌های خوشبوکننده با گارانتی ۱۰۰٪ اصالت.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white mb-3 sm:mb-4 border-r-2 border-[#E6007E] pr-2">دسته‌بندی‌های اصلی</h4>
              <ul className="space-y-2 text-xs text-gray-400 font-medium">
                {categories.map(cat => (
                  <li key={cat.id}>
                    <button onClick={() => handleSelectCategory(cat.id)} className="hover:text-[#E6007E] transition">
                      {cat.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white mb-3 sm:mb-4 border-r-2 border-[#E6007E] pr-2">اطلاعات شعبه رشت</h4>
              <ul className="space-y-3 text-xs text-gray-400">
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#E6007E] shrink-0 mt-0.5" />
                  <span>رشت، گلسار، خیابان اصلی، گالری عطر پاریس</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#E6007E] shrink-0" />
                  <span>۰۱۳-۳۳۰۰۰۰۰۰ / ۰۹۱۲۳۴۵۶۷۸۹</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white mb-3 sm:mb-4 border-r-2 border-[#E6007E] pr-2">نماد پرداخت امن</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                تمامی خریدهای شما از طریق درگاه‌های عضو شبکه شتاب (شاپرک) پردازش و تضمین می‌گردد.
              </p>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-light">
            <p>© ۲۰۲۶ تمامی حقوق برای گالری «عطر پاریس» شعبه رشت محفوظ است.</p>
            
            <button 
              onClick={() => setIsAdminOpen(true)}
              className="text-gray-700 hover:text-gray-400 transition p-1"
              title="ورود مدیریت"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </footer>

      {/* 🔐 پنل مدیریت جامع و کاملاً ریسپانسیو */}
      {isAdminOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAdminOpen(false)} />
          <div className="relative bg-white rounded-3xl max-w-4xl w-full overflow-hidden z-10 shadow-2xl p-4 sm:p-8 max-h-[92vh] overflow-y-auto">
            <button 
              onClick={() => setIsAdminOpen(false)}
              className="absolute top-4 left-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition z-20"
            >
              <X className="w-5 h-5" />
            </button>

            {!adminLoggedIn ? (
              <div className="max-w-sm mx-auto text-center py-8 space-y-4">
                <div className="w-14 h-14 bg-[#FAF2F7] text-[#E6007E] rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                  <Lock className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-gray-900">ورود به پنل مدیریت عطر پاریس</h3>
                  <p className="text-xs text-gray-400 mt-1">رمز عبور پیش‌فرض: admin</p>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (adminPass === 'admin') setAdminLoggedIn(true);
                  else alert('رمز عبور اشتباه است!');
                }} className="space-y-3 pt-2">
                  <input 
                    type="password"
                    placeholder="رمز عبور ادمین"
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs text-center font-mono focus:outline-none focus:border-[#E6007E]"
                  />
                  <button type="submit" className="w-full bg-[#E6007E] hover:bg-[#c4006c] text-white py-3 rounded-2xl text-xs font-bold shadow-lg shadow-[#E6007E]/20">
                    ورود به پنل
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 border-b pb-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-gray-900">پنل مدیریت وب‌سایت</h3>
                    <p className="text-xs text-gray-500">مدیریت سفارش‌ها، هزینه‌های ارسال و محصولات</p>
                  </div>
                  
                  <div className="flex overflow-x-auto gap-1 bg-gray-100 p-1.5 rounded-2xl no-scrollbar">
                    <button 
                      onClick={() => setAdminActiveTab('products')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${adminActiveTab === 'products' ? 'bg-white text-[#E6007E] shadow-sm' : 'text-gray-600'}`}
                    >
                      محصولات
                    </button>
                    <button 
                      onClick={() => setAdminActiveTab('shipping')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${adminActiveTab === 'shipping' ? 'bg-white text-[#E6007E] shadow-sm' : 'text-gray-600'}`}
                    >
                      <Truck className="w-3.5 h-3.5" /> هزینه‌های ارسال
                    </button>
                    <button 
                      onClick={() => setAdminActiveTab('orders')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${adminActiveTab === 'orders' ? 'bg-white text-[#E6007E] shadow-sm' : 'text-gray-600'}`}
                    >
                      <ListOrdered className="w-3.5 h-3.5" /> سفارشات ({orders.length})
                    </button>
                    <button 
                      onClick={() => setAdminActiveTab('categories')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${adminActiveTab === 'categories' ? 'bg-white text-[#E6007E] shadow-sm' : 'text-gray-600'}`}
                    >
                      دسته‌ها
                    </button>
                  </div>
                </div>

                {adminActiveTab === 'shipping' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-[#E6007E]" /> تنظیم تعرفه روش‌های ارسال
                    </h4>
                    <div className="space-y-3">
                      {shippingMethods.map(method => (
                        <div key={method.id} className="bg-gray-50 p-4 rounded-2xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                          <div>
                            <span className="font-bold text-xs text-gray-900 block">{method.label}</span>
                            <span className="text-[10px] text-gray-400 mt-0.5 block">{method.desc}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input 
                              type="number"
                              defaultValue={method.price}
                              id={`admin_shipping_price_${method.id}`}
                              className="bg-white border rounded-xl px-3 py-2 text-xs flex-1 sm:w-32 font-bold text-center"
                            />
                            <span className="text-xs text-gray-500">تومان</span>
                            <button 
                              onClick={() => {
                                const val = document.getElementById(`admin_shipping_price_${method.id}`).value;
                                handleUpdateShippingPrice(method.id, val);
                              }}
                              className="bg-[#E6007E] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-[#c4006c] transition"
                            >
                              ذخیره
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {adminActiveTab === 'orders' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <PackageCheck className="w-4 h-4 text-[#E6007E]" /> سفارش‌های دریافتی از خریداران
                    </h4>
                    {orders.length === 0 ? (
                      <p className="text-center text-xs text-gray-400 py-12">هنوز سفارشی ثبت نشده است.</p>
                    ) : (
                      <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                        {orders.map(order => (
                          <div key={order.id} className="bg-gray-50 p-4 rounded-2xl border text-xs space-y-3">
                            <div className="flex justify-between items-center border-b pb-2">
                              <span className="font-bold text-[#E6007E]">کد پیگیری: {order.trackingCode}</span>
                              <span className="text-gray-400 text-[10px]">{order.date}</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
                              <div><strong>خریدار:</strong> {order.customer.fullName}</div>
                              <div><strong>تماس:</strong> {order.customer.phone}</div>
                              <div><strong>کد پستی:</strong> {order.customer.postalCode}</div>
                              <div><strong>ارسال:</strong> {order.shipping?.label}</div>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border">
                              <strong>آدرس:</strong> {order.customer.address}
                            </div>
                            <div className="pt-2 border-t flex justify-between items-center font-bold">
                              <span>مبلغ کل:</span>
                              <span className="text-[#E6007E]">{order.grandTotal?.toLocaleString('fa-IR')} تومان</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {adminActiveTab === 'categories' && (
                  <div className="bg-[#FAF2F7] p-4 rounded-2xl border space-y-3">
                    <h4 className="text-xs font-bold text-[#E6007E]">مدیریت دسته‌بندی‌ها</h4>
                    <form onSubmit={handleAddCategory} className="flex gap-2">
                      <input 
                        type="text" required placeholder="عنوان دسته‌بندی جدید..." 
                        value={newCategoryLabel} onChange={e => setNewCategoryLabel(e.target.value)}
                        className="flex-1 bg-white border rounded-xl px-3 py-2 text-xs"
                      />
                      <button type="submit" className="bg-[#E6007E] text-white px-4 py-2 rounded-xl text-xs font-bold">ثبت</button>
                    </form>
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      {categories.map(cat => (
                        <div key={cat.id} className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border text-xs font-bold">
                          <span>{cat.label}</span>
                          <button type="button" onClick={() => handleDeleteCategory(cat.id)} className="text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {adminActiveTab === 'products' && (
                  <div className="space-y-6">
                    <form onSubmit={handleSaveProductSubmit} className="bg-gray-50 p-4 sm:p-5 rounded-3xl border space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                          <Store className="w-4 h-4 text-[#E6007E]" /> 
                          {editingProductId ? '✏️ ویرایش مشخصات محصول' : '➕ افزودن محصول جدید'}
                        </h4>
                        {editingProductId && (
                          <button type="button" onClick={cancelEditing} className="text-xs text-red-600 font-bold bg-red-50 px-3 py-1 rounded-lg">
                            لغو ویرایش
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input type="text" required placeholder="نام محصول" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="bg-white border rounded-xl px-3 py-2.5 text-xs" />
                        <input type="text" required placeholder="برند" value={productForm.brand} onChange={e => setProductForm({...productForm, brand: e.target.value})} className="bg-white border rounded-xl px-3 py-2.5 text-xs" />
                      </div>

                      <select value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full bg-white border rounded-xl px-3 py-2.5 text-xs font-bold">
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                      </select>

                      <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-center justify-between">
                        <label className="text-xs font-bold text-amber-900 flex items-center gap-2 cursor-pointer">
                          <Gift className="w-4 h-4 text-amber-600" /> نمایش به عنوان پیشنهاد ویژه در سبد خرید
                        </label>
                        <input type="checkbox" checked={productForm.isSuggested} onChange={e => setProductForm({...productForm, isSuggested: e.target.checked})} className="w-4 h-4 accent-[#E6007E]" />
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border space-y-2">
                        <label className="text-[11px] font-bold text-gray-700 block">آپلود یا تغییر عکس:</label>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-xs text-gray-500" />
                        {productForm.image && <img src={productForm.image} alt="" className="w-12 h-12 object-cover rounded-xl border mt-2" />}
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-gray-800">تعریف حجم‌ها، قیمت و تخفیف:</span>
                          <button type="button" onClick={handleAddVariantRow} className="text-[10px] bg-[#FAF2F7] text-[#E6007E] font-bold px-3 py-1 rounded-lg">+ افزودن حجم</button>
                        </div>
                        <div className="space-y-3">
                          {variantList.map((vRow, idx) => (
                            <div key={idx} className="bg-gray-50 p-3 rounded-2xl border space-y-2">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <input type="text" placeholder="عنوان (مثلاً ۱۰۰ میل)" value={vRow.size} onChange={e => handleVariantChange(idx, 'size', e.target.value)} className="bg-white border rounded-xl px-3 py-2 text-xs" />
                                <input type="number" placeholder="قیمت (تومان)" value={vRow.price} onChange={e => handleVariantChange(idx, 'price', e.target.value)} className="bg-white border rounded-xl px-3 py-2 text-xs" />
                                <input type="number" placeholder="تخفیف٪" value={vRow.discountPercent} onChange={e => handleVariantChange(idx, 'discountPercent', e.target.value)} className="bg-white border rounded-xl px-3 py-2 text-xs text-center font-bold text-red-600" />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t text-[11px]">
                                <div>
                                  <label className="text-gray-500 font-semibold block mb-0.5">شروع تخفیف:</label>
                                  <input type="date" value={vRow.discountStartDate} onChange={e => handleVariantChange(idx, 'discountStartDate', e.target.value)} className="w-full bg-white border rounded-xl px-2.5 py-1.5 text-xs" />
                                </div>
                                <div>
                                  <label className="text-gray-500 font-semibold block mb-0.5">پایان تخفیف:</label>
                                  <input type="date" value={vRow.discountExpiryDate} onChange={e => handleVariantChange(idx, 'discountExpiryDate', e.target.value)} className="w-full bg-white border rounded-xl px-2.5 py-1.5 text-xs" />
                                </div>
                              </div>

                              {variantList.length > 1 && (
                                <button type="button" onClick={() => handleRemoveVariantRow(idx)} className="text-red-500 text-xs font-bold pt-1 block">
                                  - حذف این حجم
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <textarea rows="2" placeholder="توضیحات..." value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs" />
                      <button type="submit" className="w-full bg-gray-900 text-white py-3 rounded-2xl text-xs font-bold shadow-md">
                        {editingProductId ? 'ذخیره تغییرات ویرایش' : 'ذخیره محصول جدید'}
                      </button>
                    </form>

                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-bold">لیست محصولات سرور جهت ویرایش یا حذف</h4>
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {products.map(item => (
                          <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white border rounded-2xl gap-3 text-xs">
                            <div className="flex items-center gap-3">
                              <img src={item.image} alt="" className="w-12 h-12 object-cover rounded-xl border shrink-0" />
                              <div>
                                <span className="font-bold block">{item.name}</span>
                                <span className="text-gray-400">{item.brand}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 justify-end">
                              <button onClick={() => startEditingProduct(item)} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl flex items-center gap-1 font-bold">
                                <Edit3 className="w-3.5 h-3.5" /> ویرایش
                              </button>
                              <button onClick={() => toggleStock(item.id)} className={`px-3 py-1.5 rounded-xl font-bold ${item.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.inStock ? 'موجود' : 'ناموجود'}</button>
                              <button onClick={() => deleteProduct(item.id)} className="p-2 bg-red-50 text-red-600 rounded-xl"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🔮 صفحه جزئیات محصول کامل همراه با نظرات، امتیاز ۵ ستاره و انتخاب حجم */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedProduct(null)} />
          <div className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden z-10 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 left-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"><X className="w-5 h-5" /></button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 border">
                <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
              </div>

              <div className="flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-xs font-bold text-[#E6007E] uppercase bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">{selectedProduct.brand}</span>
                  <h2 className="text-xl font-black text-gray-900 mt-2">{selectedProduct.name}</h2>
                  
                  {/* امتیاز ستاره‌ای */}
                  <div className="flex items-center gap-1.5 mt-2 text-amber-500">
                    <span className="font-bold text-xs">★★★★★</span>
                    <span className="text-gray-400 text-[11px]">(۴.۹ از ۵ - {userReviews.length} دیدگاه)</span>
                  </div>

                  <p className="text-xs text-gray-600 mt-3 leading-relaxed">{selectedProduct.description}</p>
                  
                  <div className="mt-3 p-3 bg-rose-50/60 rounded-xl border border-rose-100 text-[11px] text-gray-700">
                    ✨ نت بویایی: ماندگاری عالی، پخش بوی قوی و نت‌های اصیل فرانسوی
                  </div>

                  <div className="mt-4 space-y-2">
                    <span className="text-xs font-bold text-gray-700 block">انتخاب حجم و نوع بسته‌بندی:</span>
                    <div className="space-y-2">
                      {selectedProduct.variants && selectedProduct.variants.map((variant, idx) => {
                        const finalP = getFinalPrice(variant.price, variant.discountPercent);
                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedVariantIndex(idx)}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs transition ${
                              selectedVariantIndex === idx ? 'border-[#E6007E] bg-[#FAF2F7] font-bold text-[#E6007E]' : 'border-gray-200 bg-gray-50 text-gray-700'
                            }`}
                          >
                            <span>{variant.size}</span>
                            <div className="text-left">
                              {variant.discountPercent > 0 && (
                                <span className="text-[10px] text-gray-400 line-through block font-normal">
                                  {variant.price.toLocaleString('fa-IR')}
                                </span>
                              )}
                              <span className="font-black">{finalP.toLocaleString('fa-IR')} تومان</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 block">مبلغ نهایی:</span>
                    <span className="text-base font-black text-[#E6007E]">
                      {selectedProduct.variants && selectedProduct.variants[selectedVariantIndex] ? 
                        getFinalPrice(
                          selectedProduct.variants[selectedVariantIndex].price, 
                          selectedProduct.variants[selectedVariantIndex].discountPercent
                        ).toLocaleString('fa-IR') : 0} تومان
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      addToCart(selectedProduct, selectedVariantIndex);
                      setSelectedProduct(null);
                    }}
                    className="bg-[#E6007E] hover:bg-[#c4006c] text-white px-6 py-3 rounded-xl text-xs font-bold shadow-md transition"
                  >
                    افزودن به سبد خرید
                  </button>
                </div>
              </div>
            </div>

            {/* بخش نظرات و امتیازدهی کاربران در صفحه جزئیات */}
            <div className="border-t pt-6 space-y-4">
              <h3 className="font-extrabold text-gray-900 text-sm">نظرات و امتیازات کاربران</h3>
              
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {userReviews.map(rev => (
                  <div key={rev.id} className="bg-gray-50 p-3 rounded-2xl border text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-800">{rev.user}</span>
                      <span className="text-amber-500 font-bold">{'★'.repeat(rev.stars)}</span>
                    </div>
                    <p className="text-gray-600">{rev.text}</p>
                  </div>
                ))}
              </div>

              {/* فرم ثبت نظر جدید */}
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!newReviewText.trim()) return;
                setUserReviews([{ id: Date.now(), user: 'کاربر مهمان', text: newReviewText, stars: Number(newReviewRating) }, ...userReviews]);
                setNewReviewText('');
                alert('نظر شما با موفقیت ثبت شد!');
              }} className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 space-y-3">
                <span className="text-xs font-bold text-gray-800 block">شما هم نظر و امتیاز خود را ثبت کنید:</span>
                
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-600 font-medium">امتیاز ستاره‌ای:</span>
                  <select 
                    value={newReviewRating} 
                    onChange={e => setNewReviewRating(e.target.value)}
                    className="bg-white border rounded-xl px-3 py-1 text-xs font-bold text-amber-500 outline-none"
                  >
                    <option value="5">★★★★★ (۵ ستاره)</option>
                    <option value="4">★★★★☆ (۴ ستاره)</option>
                    <option value="3">★★★☆☆ (۳ ستاره)</option>
                    <option value="2">★★☆☆☆ (۲ ستاره)</option>
                    <option value="1">★☆☆☆☆ (۱ ستاره)</option>
                  </select>
                </div>

                <textarea 
                  rows="2" 
                  placeholder="نظر خود را درباره این عطر بنویسید..."
                  value={newReviewText}
                  onChange={e => setNewReviewText(e.target.value)}
                  className="w-full bg-white border rounded-xl p-3 text-xs outline-none focus:border-[#E6007E]"
                />
                <button type="submit" className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 rounded-xl text-xs font-bold transition">
                  ثبت دیدگاه
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* 🛒 سبد خرید */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full flex flex-col z-10 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b">
              <h2 className="text-base font-bold flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-[#E6007E]" /> سبد خرید</h2>
              <button onClick={() => setIsCartOpen(false)}><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {cart.length === 0 ? (
                <p className="text-center text-gray-400 mt-10 text-xs">سبد خرید شما خالی است.</p>
              ) : (
                <>
                  <div className="space-y-3">
                    {cart.map(item => (
                      <div key={item.cartItemId} className="flex gap-3 p-3 bg-gray-50 rounded-2xl border items-center">
                        <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-xl shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-bold text-xs text-gray-800">{item.name}</h4>
                          <span className="text-[11px] text-[#E6007E] font-semibold block">{item.size}</span>
                          <span className="text-xs font-bold block mt-0.5">{(item.price * item.quantity).toLocaleString('fa-IR')} تومان</span>
                          <div className="flex items-center gap-2 mt-2">
                            <button onClick={() => updateQuantity(item.cartItemId, -1)} className="p-1 bg-white border rounded-md"><Minus className="w-3 h-3" /></button>
                            <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.cartItemId, 1)} className="p-1 bg-white border rounded-md"><Plus className="w-3 h-3" /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {suggestedProducts.length > 0 && (
                <div className="mt-6 pt-4 border-t border-dashed border-gray-200">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 mb-3">
                    <Gift className="w-4 h-4 text-[#E6007E]" /> پیشنهاد‌های ویژه عطر پاریس:
                  </div>
                  <div className="space-y-2">
                    {suggestedProducts.map(sItem => {
                      const minV = sItem.variants[sItem.variants.length - 1];
                      const finalP = getFinalPrice(minV.price, minV.discountPercent);

                      return (
                        <div key={sItem.id} className="flex items-center justify-between p-2.5 bg-[#FAF2F7] rounded-xl border border-[#F3E1EC] text-xs">
                          <div className="flex items-center gap-2.5">
                            <img src={sItem.image} alt="" className="w-9 h-9 object-cover rounded-lg border shrink-0" />
                            <div>
                              <span className="font-bold text-gray-800 block text-[11px]">{sItem.name}</span>
                              <span className="text-[#E6007E] font-extrabold text-[10px]">{finalP.toLocaleString('fa-IR')} ت ({minV.size})</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => addToCart(sItem, sItem.variants.length - 1)} 
                            className="bg-white text-[#E6007E] border border-[#E6007E] px-2.5 py-1 rounded-lg text-[10px] font-bold hover:bg-[#E6007E] hover:text-white transition shadow-sm"
                          >
                            + افزودن
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="pt-4 border-t space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">جمع کل کالاها:</span>
                  <span className="text-base font-black text-[#E6007E]">{subTotal.toLocaleString('fa-IR')} تومان</span>
                </div>
                <button onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} className="w-full bg-[#E6007E] text-white py-3 rounded-2xl font-bold text-xs shadow-lg">تکمیل خرید و انتخاب روش ارسال</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 📦 تسویه حساب */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={resetCheckout} />
          <div className="relative bg-white rounded-3xl max-w-lg w-full overflow-hidden z-10 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <button onClick={resetCheckout} className="absolute top-4 left-4 p-2 bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>

            {isRedirectingToGateway ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 border-4 border-[#E6007E] border-t-transparent rounded-full animate-spin mx-auto" />
                <h3 className="text-base font-black text-gray-900">در حال اتصال به درگاه پرداخت آنلاین شاپرک...</h3>
              </div>
            ) : !orderSuccess ? (
              <div>
                <h3 className="text-lg font-black text-gray-900 mb-1">اطلاعات تحویل و انتخاب روش ارسال</h3>
                <form onSubmit={handleCheckoutSubmit} className="space-y-4 mt-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">نام و نام خانوادگی *</label>
                    <input type="text" required placeholder="مثال: علی حسینی" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full bg-gray-50 border rounded-xl px-3.5 py-2.5 text-xs" />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">شماره تماس *</label>
                      <input type="tel" required maxLength={11} placeholder="۰۹۱۲۳۴۵۶۷۸۹" value={formData.phone} onChange={e => {
                        setFormData({...formData, phone: e.target.value});
                        if (!/^09[0-9]{9}$/.test(e.target.value)) setPhoneError('شماره موبایل نامعتبر است.');
                        else setPhoneError('');
                      }} className={`w-full bg-gray-50 border rounded-xl px-3.5 py-2.5 text-xs ${phoneError ? 'border-red-500' : 'border-gray-200'}`} />
                      {phoneError && <p className="text-[10px] text-red-500 mt-1 font-semibold"><AlertCircle className="w-3 h-3 inline" /> {phoneError}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">کد پستی (۱۰ رقمی) *</label>
                      <input type="text" required maxLength={10} placeholder="مثال: ۴۱۶۳۸۴۵۶۷۸" value={formData.postalCode} onChange={e => {
                        setFormData({...formData, postalCode: e.target.value});
                        if (!/^[0-9]{10}$/.test(e.target.value)) setPostalCodeError('کد پستی باید ۱۰ رقم باشد.');
                        else setPostalCodeError('');
                      }} className={`w-full bg-gray-50 border rounded-xl px-3.5 py-2.5 text-xs ${postalCodeError ? 'border-red-500' : 'border-gray-200'}`} />
                      {postalCodeError && <p className="text-[10px] text-red-500 mt-1 font-semibold"><AlertCircle className="w-3 h-3 inline" /> {postalCodeError}</p>}
                    </div>
                  </div>

                  <div className="space-y-2 bg-[#FAF2F7] p-3 rounded-2xl border border-[#F3E1EC]">
                    <label className="block text-xs font-bold text-[#E6007E] flex items-center gap-1.5">
                      <Truck className="w-4 h-4" /> انتخاب روش ارسال سفارش:
                    </label>
                    <div className="space-y-2">
                      {shippingMethods.map(s => (
                        <div 
                          key={s.id}
                          onClick={() => setSelectedShipping(s)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition ${selectedShipping?.id === s.id ? 'bg-white border-[#E6007E] shadow-sm font-bold text-gray-900' : 'bg-white/60 border-gray-200 text-gray-600'}`}
                        >
                          <div>
                            <span className="block font-bold">{s.label}</span>
                            <span className="text-[10px] text-gray-400">{s.desc}</span>
                          </div>
                          <span className="font-black text-[#E6007E]">
                            {s.price === 0 ? 'پس‌کرایه' : `${s.price.toLocaleString('fa-IR')} تومان`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">آدرس دقیق پستی *</label>
                    <textarea required rows="2" placeholder="آدرس پستی دقیق..." value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-gray-50 border rounded-xl px-3.5 py-2.5 text-xs" />
                  </div>

                  <div className="pt-3 border-t space-y-1.5 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>مجموع کالاها:</span>
                      <span>{subTotal.toLocaleString('fa-IR')} تومان</span>
                    </div>
                    <div className="flex justify-between">
                      <span>هزینه ارسال ({selectedShipping?.label}):</span>
                      <span>{shippingFee === 0 ? 'پس‌کرایه' : `${shippingFee.toLocaleString('fa-IR')} تومان`}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-gray-900 pt-2 border-t">
                      <span>مبلغ قابل پرداخت:</span>
                      <span className="text-[#E6007E]">{grandTotal.toLocaleString('fa-IR')} تومان</span>
                    </div>
                  </div>

                  <button type="submit" disabled={!!phoneError || !!postalCodeError || !formData.phone || !formData.postalCode} className="w-full bg-[#E6007E] disabled:bg-gray-300 text-white py-3.5 rounded-2xl font-bold text-xs shadow-lg">پرداخت آنلاین ({grandTotal.toLocaleString('fa-IR')} تومان)</button>
                </form>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto"><CheckCircle className="w-10 h-10" /></div>
                <h3 className="text-xl font-black text-gray-900">پرداخت شما با موفقیت انجام شد!</h3>
                <div className="bg-gray-50 p-3 rounded-2xl border text-xs space-y-1">
                  <p className="font-bold text-[#E6007E]">کد پیگیری سفارش شما: {lastTrackingCode}</p>
                  <p className="text-gray-500">اطلاعات آدرس، کد پستی و هزینه ارسال ثبت گردید.</p>
                </div>
                <button onClick={resetCheckout} className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-xs font-bold">بازگشت به فروشگاه</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}