// ==========================================
// Client_app.js - منطق العميل والكاشير والطباعة
// ==========================================

const firebaseConfig = {
  apiKey: "AIzaSyCY-sv8z7YIDxUMF47ie2ZXi6xxykEYvWs",
  authDomain: "cashier-app-9e18a.firebaseapp.com",
  databaseURL: "https://cashier-app-9e18a-default-rtdb.firebaseio.com",
  projectId: "cashier-app-9e18a",
  storageBucket: "cashier-app-9e18a.firebasestorage.app",
  messagingSenderId: "337011631813",
  appId: "1:337011631813:web:7ce04255b1a8abc1dbb2ac",
  measurementId: "G-6RRGZRPW24"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// كود الجهاز الخاص بالعميل
const CLIENT_CODE = "CLI-101";
let cart = [];

document.addEventListener('DOMContentLoaded', () => {
  const codeElem = document.getElementById('client-display-code');
  if (codeElem) codeElem.textContent = `الكود: ${CLIENT_CODE}`;

  listenToSubscription();
  listenToBanners();
  listenToProducts();
});

// 1. الاستماع اللحظي وصلاحية الاشتراك
function listenToSubscription() {
  db.ref(`saas_data/clients/${CLIENT_CODE}`).on('value', (snapshot) => {
    const client = snapshot.val();
    const overlay = document.getElementById('subscription-overlay');
    const msg = document.getElementById('subscription-msg');

    if (!client) {
      if (overlay) overlay.style.display = 'flex';
      if (msg) msg.textContent = `هذا الجهاز (${CLIENT_CODE}) غير مسجل بالنظام. يرجى التواصل مع الإدارة للتفعيل.`;
      return;
    }

    const now = Date.now();
    let isValid = false;

    if (client.endTimestamp && now <= client.endTimestamp) {
      isValid = true;
    } else if (client.endDate) {
      const parsedDate = new Date(client.endDate).getTime();
      if (!isNaN(parsedDate) && parsedDate >= (now - 86400000)) {
        isValid = true;
      }
    }

    if (client.status === 'active' && isValid) {
      if (overlay) overlay.style.display = 'none';
    } else {
      if (overlay) overlay.style.display = 'flex';
      if (msg) msg.textContent = `انتهى اشتراك هذا الجهاز (${CLIENT_CODE}). يرجى تجديد الاشتراك للمتابعة.`;
    }
  });
}

// 2. طلب التجديد مع منع التكرار
function requestRenewal(planName, days) {
  const renewBtn = document.getElementById('renew-btn');
  const reqRef = db.ref('saas_data/requests');

  reqRef.once('value').then((snapshot) => {
    const requests = snapshot.val() || {};
    let hasPending = false;

    Object.keys(requests).forEach((key) => {
      if (requests[key].clientCode === CLIENT_CODE) {
        hasPending = true;
      }
    });

    if (hasPending) {
      alert("لديك طلب تجديد معلق بالفعل قيد الانتظار لدى الإدارة!");
      return;
    }

    if (renewBtn) renewBtn.disabled = true;

    const newReq = reqRef.push();
    newReq.set({
      clientCode: CLIENT_CODE,
      clientName: "سوبر ماركت الأمل",
      planName: planName,
      days: days,
      date: new Date().toLocaleDateString('ar-EG'),
      timestamp: Date.now()
    }).then(() => {
      alert("تم إرسال طلب التجديد إلى الإدارة بنجاح!");
    }).catch((err) => {
      alert("حدث خطأ أثناء إرسال الطلب: " + err.message);
    }).finally(() => {
      if (renewBtn) renewBtn.disabled = false;
    });
  });
}

// 3. عرض الشريط الدعائي
function listenToBanners() {
  db.ref('saas_data/banners').on('value', (snapshot) => {
    const banners = snapshot.val() || {};
    const bannerBar = document.getElementById('ad-banner-bar');
    const bannerText = document.getElementById('ad-banner-text');

    let activeText = "";
    Object.keys(banners).forEach((key) => {
      const b = banners[key];
      if (b.target === 'ALL' || b.clientCode === CLIENT_CODE) {
        activeText += ` 📢 ${b.text} | `;
      }
    });

    if (activeText && bannerBar && bannerText) {
      bannerText.textContent = activeText;
      bannerBar.style.display = 'block';
    } else if (bannerBar) {
      bannerBar.style.display = 'none';
    }
  });
}

// 4. إضافة واستماع الأصناف في المخزن
function addNewProduct() {
  const nameInput = document.getElementById('prod-name');
  const priceInput = document.getElementById('prod-price');
  const codeInput = document.getElementById('prod-code');

  const name = nameInput.value.trim();
  const price = parseFloat(priceInput.value);
  const code = codeInput.value.trim();

  if (!name || isNaN(price) || price <= 0) {
    alert("يرجى أدخال اسم المنتح وسعر صحيح!");
    return;
  }

  const prodRef = db.ref(`saas_data/clients/${CLIENT_CODE}/products`).push();
  prodRef.set({
    name: name,
    price: price,
    code: code || prodRef.key,
    timestamp: Date.now()
  }).then(() => {
    nameInput.value = '';
    priceInput.value = '';
    codeInput.value = '';
  });
}

function listenToProducts() {
  db.ref(`saas_data/clients/${CLIENT_CODE}/products`).on('value', (snapshot) => {
    const products = snapshot.val() || {};
    const tbody = document.getElementById('products-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    const keys = Object.keys(products);

    if (keys.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3">لا توجد منتجات مسجلة</td></tr>';
      return;
    }

    keys.forEach((key) => {
      const p = products[key];
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><b>${p.name}</b></td>
        <td>${p.price.toFixed(2)} ج.م</td>
        <td>
          <button onclick="addToCart('${p.name}', ${p.price})" class="btn-success btn-sm">إضافة 🛒</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  });
}

// 5. السلة والحسابات
function addToCart(name, price) {
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name: name, price: price, qty: 1 });
  }
  renderCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

function renderCart() {
  const tbody = document.getElementById('cart-table-body');
  const totalElem = document.getElementById('cart-total');
  if (!tbody) return;

  tbody.innerHTML = '';
  let total = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>${itemTotal.toFixed(2)}</td>
      <td><button onclick="removeFromCart(${index})" class="btn-danger btn-sm">✕</button></td>
    `;
    tbody.appendChild(tr);
  });

  if (totalElem) totalElem.textContent = total.toFixed(2);
}

// 6. الحفظ والطباعة
function checkoutAndPrint() {
  if (cart.length === 0) {
    alert("سلة المبيعات فارغة!");
    return;
  }

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const nowStr = new Date().toLocaleString('ar-EG');

  document.getElementById('receipt-date').textContent = `التاريخ: ${nowStr}`;
  const receiptBody = document.getElementById('receipt-items-body');
  receiptBody.innerHTML = '';

  cart.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>${(item.price * item.qty).toFixed(2)}</td>
    `;
    receiptBody.appendChild(tr);
  });

  document.getElementById('receipt-total').textContent = total.toFixed(2);

  db.ref(`saas_data/clients/${CLIENT_CODE}/sales`).push({
    items: cart,
    total: total,
    timestamp: Date.now(),
    dateStr: nowStr
  }).then(() => {
    window.print();
    cart = [];
    renderCart();
  });
}
