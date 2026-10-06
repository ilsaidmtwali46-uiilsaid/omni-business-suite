// ==========================================
// j.js - إدارة الدوال والتفاعل وحفظ البيانات
// ==========================================

let currentInvoice = [];
let inventory = JSON.parse(localStorage.getItem('obs_inventory')) || [];

// تحميل بيانات المخزن فور فتح الصفحة
document.addEventListener('DOMContentLoaded', () => {
  renderInventoryTable();
});

// التنقل بين الأقسام
function showSection(sectionName) {
  const salesSec = document.getElementById('sec-sales');
  const invSec = document.getElementById('sec-inventory');

  salesSec.style.display = 'none';
  invSec.style.display = 'none';

  if (sectionName === 'sales') {
    salesSec.style.display = 'block';
  } else if (sectionName === 'inventory') {
    invSec.style.display = 'block';
    renderInventoryTable();
  } else {
    alert('قسم ' + sectionName + ' قيد التطوير!');
  }
}

// دالة إضافة عنصر للفاتورة
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

// دالة إضافة صنف للمخزن
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
