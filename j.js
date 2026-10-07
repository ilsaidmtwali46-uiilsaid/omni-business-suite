// ==========================================
// j.js - منطق لوحة تحكم الأدمن
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

document.addEventListener('DOMContentLoaded', () => {
  listenToData();
});

function showSection(sectionId) {
  document.getElementById('sec-clients').style.display = sectionId === 'clients' ? 'block' : 'none';
  document.getElementById('sec-requests').style.display = sectionId === 'requests' ? 'block' : 'none';
  document.getElementById('sec-banner').style.display = sectionId === 'banner' ? 'block' : 'none';
}

function toggleClientDropdown() {
  const target = document.getElementById('banner-target').value;
  document.getElementById('client-select-group').style.display = target === 'SPECIFIC' ? 'block' : 'none';
}

function listenToData() {
  db.ref('saas_data').on('value', (snapshot) => {
    const data = snapshot.val() || {};
    renderClients(data.clients || {});
    renderRequests(data.requests || {});
    renderBanners(data.banners || {});
  });
}

// 1. إضافة عميل دون تكرار (باستخدام set برقم الكود)
function addClient() {
  const nameInput = document.getElementById('client-name');
  const codeInput = document.getElementById('client-code');
  const daysSelect = document.getElementById('client-plan');

  const name = nameInput.value.trim();
  const code = codeInput.value.trim().toUpperCase();
  const days = parseInt(daysSelect.value);

  if (!name || !code) {
    alert("يرجى إدخال اسم العميل وكود الجهاز!");
    return;
  }

  const now = Date.now();
  const endTimestamp = now + (days * 24 * 60 * 60 * 1000);
  const endDateStr = new Date(endTimestamp).toISOString().split('T')[0];

  const clientData = {
    name: name,
    code: code,
    endDate: endDateStr,
    endTimestamp: endTimestamp,
    status: 'active'
  };

  db.ref(`saas_data/clients/${code}`).set(clientData)
    .then(() => {
      alert("تمت إضافة العميل وتفعيل الاشتراك بنجاح!");
      nameInput.value = '';
      codeInput.value = '';
    })
    .catch((err) => alert("خطأ في الإضافة: " + err.message));
}

// 2. عرض سجل العملاء ومنح التمديد والحذف بالمفتاح الصريح
function renderClients(clientsObj) {
  const tbody = document.getElementById('clients-list');
  const dropdown = document.getElementById('banner-client-select');
  if (!tbody) return;

  tbody.innerHTML = '';
  if (dropdown) dropdown.innerHTML = '';

  const keys = Object.keys(clientsObj);
  if (keys.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">لا يوجد مشتركين حالياً</td></tr>';
    return;
  }

  const now = Date.now();

  keys.forEach((key) => {
    const client = clientsObj[key];
    const clientCode = client.code || key;
    const isExpired = !client.endTimestamp || now > client.endTimestamp;

    if (dropdown) {
      const opt = document.createElement('option');
      opt.value = clientCode;
      opt.textContent = `${client.name || 'عميل'} (${clientCode})`;
      dropdown.appendChild(opt);
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><b>${clientCode}</b></td>
      <td>${client.name || '-'}</td>
      <td>${client.endDate || '-'}</td>
      <td>
        <span style="color: ${isExpired ? '#ff4d4d' : '#28a745'}; font-weight: bold;">
          ${isExpired ? 'منتهي' : 'نشط'}
        </span>
      </td>
      <td>
        <button onclick="extendSubscription('${key}', 30)" class="btn-success btn-sm">+30 يوم</button>
        <button onclick="deleteClient('${key}')" class="btn-danger btn-sm" style="margin-right: 4px;">حذف</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function extendSubscription(firebaseKey, addDays) {
  db.ref(`saas_data/clients/${firebaseKey}`).once('value').then((snap) => {
    const client = snap.val() || {};
    const now = Date.now();
    
    const currentEnd = (client.endTimestamp && client.endTimestamp > now) ? client.endTimestamp : now;
    const newEndTimestamp = currentEnd + (addDays * 24 * 60 * 60 * 1000);
    const newEndDateStr = new Date(newEndTimestamp).toISOString().split('T')[0];

    db.ref(`saas_data/clients/${firebaseKey}`).update({
      code: client.code || firebaseKey,
      name: client.name || 'عميل ' + firebaseKey,
      endDate: newEndDateStr,
      endTimestamp: newEndTimestamp,
      status: 'active'
    }).then(() => alert("تم تمديد الاشتراك بنجاح!"));
  });
}

function deleteClient(firebaseKey) {
  if (!firebaseKey) return;

  if (confirm("هل أنت متأكد من حذف هذا العميل نهائياً؟")) {
    db.ref(`saas_data/clients/${firebaseKey}`).remove()
      .then(() => alert("تم حذف العميل بنجاح من قاعدة البيانات."))
      .catch((err) => alert("فشل الحذف: " + err.message));
  }
}

// 3. طلبات التجديد
function renderRequests(reqObj) {
  const tbody = document.getElementById('requests-list');
  if (!tbody) return;
  tbody.innerHTML = '';

  const keys = Object.keys(reqObj);
  if (keys.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">لا توجد طلبات جديدة</td></tr>';
    return;
  }

  keys.forEach((key) => {
    const req = reqObj[key];
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${req.clientName} (${req.clientCode})</td>
      <td>${req.planName}</td>
      <td>${req.date}</td>
      <td>
        <button onclick="approveRequest('${key}', '${req.clientCode}', ${req.days || 30})" class="btn-success btn-sm">موافقة وتفعيل</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function approveRequest(reqKey, clientCode, days) {
  extendSubscription(clientCode, days);
  db.ref(`saas_data/requests/${reqKey}`).remove();
}

// 4. الإعلانات
function sendBannerMessage() {
  const textInput = document.getElementById('banner-text');
  const text = textInput.value.trim();
  const target = document.getElementById('banner-target').value;
  const clientCode = target === 'SPECIFIC' ? document.getElementById('banner-client-select').value : 'ALL';

  if (!text) {
    alert("يرجى كتابة نص الإعلان!");
    return;
  }

  db.ref('saas_data/banners').push({
    text: text,
    target: target,
    clientCode: clientCode,
    date: new Date().toLocaleDateString('ar-EG'),
    timestamp: Date.now()
  }).then(() => {
    alert("تم نشر الإعلان بنجاح!");
    textInput.value = '';
  });
}

function renderBanners(bannersObj) {
  const tbody = document.getElementById('banners-list');
  if (!tbody) return;
  tbody.innerHTML = '';

  const keys = Object.keys(bannersObj);
  if (keys.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">لا توجد إعلانات نشطة</td></tr>';
    return;
  }

  keys.forEach((key) => {
    const b = bannersObj[key];
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${b.target === 'ALL' ? 'الجميع' : b.clientCode}</td>
      <td>${b.text}</td>
      <td>${b.date}</td>
      <td>
        <button onclick="deleteBanner('${key}')" class="btn-danger btn-sm">حذف</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function deleteBanner(key) {
  db.ref(`saas_data/banners/${key}`).remove();
}
