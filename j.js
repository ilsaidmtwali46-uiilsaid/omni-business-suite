// ==========================================
// j.js - إدارة الدوال والتفاعل وحفظ البيانات
// ==========================================

let currentInvoice = [];
let inventory = JSON.parse(localStorage.getItem('obs_inventory')) || [];
let salesHistory = JSON.parse(localStorage.getItem('obs_sales')) || [];

// تحميل البيانات فور فتح الصفحة
document.addEventListener('DOMContentLoaded', () => {
  renderInventoryTable();
  renderReports();
});

// التنقل بين الشاشات
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

// إضافة عنصر للفاتورة الحالية
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

function renderInvoiceTable() {
  const tbody = document.getElementById('invoice-list');
  tbody.innerHTML = '';
  currentInvoice.forEach(item => {
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

// حفظ الفاتورة الحالية وتنقيلها للتقارير
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

// إضافة صنف للمخزن
function addStockItem() {
  const name = document.getElementById('inv-name').value.trim();
  const qty = parseFloat(document.getElementById('inv-qty').value) || 0;
  const buy = parseFloat(document.getElementById('inv-buy').value) || 0;
  const sell = parseFloat(document.getElementById('inv-sell').value) || 0;

  if (!name) {
    alert('يرجى إدخال اسم المنتج!');
    return;
  }

  inventory.push({ name, qty, buy, sell });
  localStorage.setItem('obs_inventory', JSON.stringify(inventory));
  renderInventoryTable();

  document.getElementById('inv-name').value = '';
  document.getElementById('inv-qty').value = '';
  document.getElementById('inv-buy').value = '';
  document.getElementById('inv-sell').value = '';
}

function renderInventoryTable() {
  const tbody = document.getElementById('inventory-list');
  if (!tbody) return;
  tbody.innerHTML = '';

  inventory.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>${item.buy.toFixed(2)}</td>
      <td>${item.sell.toFixed(2)}</td>
    `;
    tbody.appendChild(row);
  });
}

// عرض حركة التقارير والسجلات
function renderReports() {
  const tbody = document.getElementById('reports-list');
  const countEl = document.getElementById('rep-total-invoices');
  const totalEl = document.getElementById('rep-total-sales');

  if (!tbody) return;
  tbody.innerHTML = '';

  let grandTotal = 0;

  salesHistory.forEach(inv => {
    grandTotal += inv.total;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>#${inv.id}</td>
      <td>${inv.itemsCount}</td>
      <td>${inv.total.toFixed(2)}</td>
      <td>${inv.date}</td>
    `;
    tbody.appendChild(row);
  });

  countEl.textContent = salesHistory.length;
  totalEl.textContent = grandTotal.toFixed(2);
}
