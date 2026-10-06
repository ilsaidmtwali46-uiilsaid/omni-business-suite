// ==========================================
// Client_app.js - تطبيق العميل
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

// تهيئة تطبيق Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// كود العميل المخصص لهذا الجهاز
const MY_CLIENT_CODE = localStorage.getItem('client_code') || 'CLI-101';

document.addEventListener('DOMContentLoaded', () => {
  const codeDisplay = document.getElementById('client-display-code');
  if (codeDisplay) codeDisplay.textContent = `الكود: ${MY_CLIENT_CODE}`;

  startLiveSync();
});

function startLiveSync() {
  db.ref('saas_data').on('value', (snapshot) => {
    const data = snapshot.val() || {};
    const clientsObj = data.clients || {};
    const bannersObj = data.banners || {};

    const myAccount = clientsObj[MY_CLIENT_CODE];

    // 1. حالة العميل غير مسجل
    if (!myAccount) {
      showSubscriptionModal(`هذا الجهاز (${MY_CLIENT_CODE}) غير مسجل بالنظام. يرجى التواصل مع الإدارة للتفعيل.`);
      lockApp();
      return;
    }

    localStorage.setItem('client_name', myAccount.name);

    // 2. فحص صلاحية الاشتراك
    const now = Date.now();
    if (now > myAccount.endTimestamp) {
      showSubscriptionModal(`انتهت فترة الاشتراك بتاريخ (${myAccount.endDate}). يرجى طلب التجديد للاستمرار.`);
      lockApp();
    } else {
      unlockApp();
    }

    // 3. تحديث الشريط الدعائي اللحظي
    updateBannerDisplay(bannersObj);
  });
}

function updateBannerDisplay(bannersObj) {
  const bannerBar = document.getElementById('ad-banner-bar');
  const bannerText = document.getElementById('ad-banner-text');

  if (!bannerBar || !bannerText) return;

  const bannerKeys = Object.keys(bannersObj);
  let activeText = '';

  for (let i = bannerKeys.length - 1; i >= 0; i--) {
    const b = bannersObj[bannerKeys[i]];
    if (b.target === 'ALL' || b.clientCode === MY_CLIENT_CODE) {
      activeText = b.text;
      break;
    }
  }

  if (activeText) {
    bannerText.textContent = activeText;
    bannerBar.style.display = 'block';
  } else {
    bannerBar.style.display = 'none';
  }
}

function requestRenewal(planName, days) {
  const clientName = localStorage.getItem('client_name') || MY_CLIENT_CODE;

  db.ref('saas_data/requests').push({
    clientCode: MY_CLIENT_CODE,
    clientName: clientName,
    planName: planName,
    days: days,
    date: new Date().toLocaleDateString('ar-EG'),
    timestamp: Date.now()
  }).then(() => {
    alert("تم إرسال طلب التجديد للإدارة بنجاح!");
  });
}

function lockApp() {
  const overlay = document.getElementById('subscription-overlay');
  if (overlay) overlay.style.display = 'flex';
}

function unlockApp() {
  const overlay = document.getElementById('subscription-overlay');
  if (overlay) overlay.style.display = 'none';
}

function showSubscriptionModal(msg) {
  const msgElement = document.getElementById('subscription-msg');
  if (msgElement) msgElement.textContent = msg;
}
