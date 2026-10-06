// ==========================================
// j.js - إدارة الدوال والتفاعل والحماية
// ==========================================

let currentInvoice = [];
let inventory = JSON.parse(localStorage.getItem('obs_inventory')) || [];
let salesHistory = JSON.parse(localStorage.getItem('obs_sales')) || [];
let adminPin = localStorage.getItem('obs_pin') || '1234'; // الرقم السري الافتراضي 1234

document.addEventListener('DOMContentLoaded', () => {
  renderInventoryTable();
  renderReports();
});

// دالة التحقق من الرقم السري
function checkPin() {
  const inputPin = prompt('أدخل الرقم السري للتحقق:');
  if (inputPin === adminPin) {
    return true;
  } else {
    alert('الرقم السري غير صحيح!');
    return false;
  }
}

// دالة تغيير الرقم السري
function changePinCode() {
  if (!checkPin()) return;
  const newPin = prompt('أدخل الرقم السري الجديد:');
  if (newPin && newPin.trim().length >= 4) {
    adminPin = newPin.trim();
    localStorage.setItem('obs_pin', adminPin);
    alert('تم تغيير الرقم السري بنجاح!');
  } else {
    alert('الرقم السري يجب أن يكون 4 أرقام على الأقل!');
  }
}

// التنقل بين الأقسام
function showSection(sectionName) {
  const salesSec = document.getElementById('sec-sales');
  const invSec = document.getElementById('sec-inventory');
  const repSec = document.getElementById('sec-reports');

  salesSec.style.display = 'none';
  invSec.style.display = 'none';
  repSec.style.display = 'none';

  if (sectionName === 'sales') {
    salesSec.style.display = 'block';
  } else if (sectionName === 'inventory') {
    invSec.style.display = 'block';
    renderInventoryTable();
  } else if (sectionName === 'reports') {
    repSec.style.display = 'block';
    renderReports();
  }
}

// عناصر الفاتورة
function addInvoiceItem() {
  const nameInput = document.getElementById('item-name');
  const qtyInput = document.getElementById('item-qty');
  const priceInput = document.getElementById('item-price');

  const name = nameInput.value.trim();
  const qty = parseFloat(qtyInput.value) || 1;
  const price = parseFloat(priceInput.value) || 0;

  if (!name || price <= 0) {
    alert('يرجى إدخال اسم المنتج والسعر بشكل صحيح!');
    return;
  }

  const total = qty * price;
  currentInvoice.push({ name, qty, price, total });
  renderInvoiceTable();

  nameInput.value = '';
  qtyInput.value = '';
  priceInput.value = '';
  nameInput.focus();
}

function removeInvoiceItem(index) {
  currentInvoice.splice(index, 1);
  renderInvoiceTable();
}

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
      <td><button class="btn btn-danger" style="padding:2px 8px; font-size:12px;" onclick="removeInvoiceItem(${index})">حذف</button></td>
    `;
    tbody.appendChild(row);
  });
}

function saveInvoice() {
  if (currentInvoice.length === 0) {
    alert('الفاتورة فارغة!');
    return;
  }

  const totalAmount = currentInvoice.reduce((sum, item) => sum + item.total, 0);
  const invoiceData = {
    id: salesHistory.length + 1,
    itemsCount: currentInvoice.length,
    total: totalAmount,
    date: new Date().toLocaleDateString('ar-EG')
  };

  salesHistory.push(invoiceData);
  localStorage.setItem('obs_sales', JSON.stringify(salesHistory));

  currentInvoice = [];
  renderInvoiceTable();
  alert('تم حفظ الفاتورة بنجاح!');
}

// إدارة المخزن (إضافة / تعديل / حذف مع الحماية)
function addStockItem() {
  const editIndex = parseInt(document.getElementById('inv-edit-index').value);
  const name = document.getElementById('inv-name').value.trim();
  const qty = parseFloat(document.getElementById('inv-qty').value) || 0;
  const buy = parseFloat(document.getElementById('inv-buy').value) || 0;
  const sell = parseFloat(document.getElementById('inv-sell').value) || 0;

  if (!name) {
    alert('يرجى إدخال اسم المنتج!');
    return;
  }

  if (editIndex >= 0) {
    // تعديل صنف موجود
    inventory[editIndex] = { name, qty, buy, sell };
    document.getElementById('inv-edit-index').value = "-1";
    document.getElementById('inv-save-btn').textContent = "حفظ في المخزن";
  } else {
    // إضافة صنف جديد
    inventory.push({ name, qty, buy, sell });
  }

  localStorage.setItem('obs_inventory', JSON.stringify(inventory));
  renderInventoryTable();

  document.getElementById('inv-name').value = '';
  document.getElementById('inv-qty').value = '';
  document.getElementById('inv-buy').value = '';
  document.getElementById('inv-sell').value = '';
}

function editStockItem(index) {
  if (!checkPin()) return; // حماية بالرقم السري

  const item = inventory[index];
  document.getElementById('inv-name').value = item.name;
  document.getElementById('inv-qty').value = item.qty;
  document.getElementById('inv-buy').value = item.buy;
  document.getElementById('inv-sell').value = item.sell;
  document.getElementById('inv-edit-index').value = index;
  document.getElementById('inv-save-btn').textContent = "تحديث الصنف";
}

function deleteStockItem(index) {
  if (!checkPin()) return; // حماية بالرقم السري

  if (confirm('هل أنت تأكد من حذف هذا الصنف من المخزن؟')) {
    inventory.splice(index, 1);
    localStorage.setItem('obs_inventory', JSON.stringify(inventory));
    renderInventoryTable();
  }
}

function renderInventoryTable() {
  const tbody = document.getElementById('inventory-list');
  if (!tbody) return;
  tbody.innerHTML = '';

  inventory.forEach((item, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>${item.buy.toFixed(2)}</td>
      <td>${item.sell.toFixed(2)}</td>
      <td>
        <button class="btn btn-secondary" style="padding:2px 8px; font-size:12px;" onclick="editStockItem(${index})">تعديل</button>
        <button class="btn btn-danger" style="padding:2px 8px; font-size:12px;" onclick="deleteStockItem(${index})">حذف</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// السجلات والتقارير (تصفير وحذف مع الحماية)
function renderReports() {
  const tbody = document.getElementById('reports-list');
  const countEl = document.getElementById('rep-total-invoices');
  const totalEl = document.getElementById('rep-total-sales');

  if (!tbody) return;
  tbody.innerHTML = '';

  let grandTotal = 0;

  salesHistory.forEach((inv, index) => {
    grandTotal += inv.total;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>#${inv.id}</td>
      <td>${inv.itemsCount}</td>
      <td>${inv.total.toFixed(2)}</td>
      <td>${inv.date}</td>
      <td><button class="btn btn-danger" style="padding:2px 8px; font-size:12px;" onclick="deleteInvoice(${index})">حذف</button></td>
    `;
    tbody.appendChild(row);
  });

  countEl.textContent = salesHistory.length;
  totalEl.textContent = grandTotal.toFixed(2);
}

function deleteInvoice(index) {
  if (!checkPin()) return; // حماية بالرقم السري

  if (confirm('هل أنت تأكد من حذف هذه الفاتورة؟')) {
    salesHistory.splice(index, 1);
    localStorage.setItem('obs_sales', JSON.stringify(salesHistory));
    renderReports();
  }
}

function clearAllSales() {
  if (!checkPin()) return; // حماية بالرقم السري

  if (confirm('تحذير: هل أنت متأكد من تصفير وحذف جميع الفواتير والمبيعات؟')) {
    salesHistory = [];
    localStorage.setItem('obs_sales', JSON.stringify(salesHistory));
    renderReports();
  }
}
