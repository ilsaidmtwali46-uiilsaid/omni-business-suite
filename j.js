// ==========================================
// j.js - إدارة الدوال والتفاعل وحفظ البيانات
// ==========================================

// مصفوفة لتخزين عناصر الفاتورة الحالية
let currentInvoice = [];

// دالة التنقل بين الشاشات
function showSection(sectionName) {
  const salesSec = document.getElementById('sec-sales');
  
  if (sectionName === 'sales') {
    salesSec.style.display = 'block';
  } else {
    alert('قسم ' + sectionName + ' قيد التطوير وسنضيفه في الخطوة القادمة!');
  }
}

// دالة إضافة عنصر جديد للفاتورة
function addInvoiceItem() {
  const nameInput = document.getElementById('item-name');
  const qtyInput = document.getElementById('item-qty');
  const priceInput = document.getElementById('item-price');

  const name = nameInput.value.trim();
  const qty = parseFloat(qtyInput.value) || 1;
  const price = parseFloat(priceInput.value) || 0;

  if (!name) {
    alert('يرجى إدخال اسم المنتج!');
    return;
  }

  if (price <= 0) {
    alert('يرجى إدخال سعر صحيح!');
    return;
  }

  const total = qty * price;

  // إضافة العنصر للمصفوفة
  const item = { name, qty, price, total };
  currentInvoice.push(item);

  // تحديث جدول الفاتورة على الشاشة
  renderInvoiceTable();

  // تفريغ الحقول للإدخال التالي
  nameInput.value = '';
  qtyInput.value = '';
  priceInput.value = '';
  nameInput.focus();
}

// دالة عرض الفاتورة في الجدول
function renderInvoiceTable() {
  const tbody = document.getElementById('invoice-list');
  tbody.innerHTML = '';

  currentInvoice.forEach((item, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>${item.price.toFixed(2)}</td>
      <td>${item.total.toFixed(2)}</td>
    `;
    tbody.appendChild(row);
  });
}
