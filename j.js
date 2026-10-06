// ==========================================
// j.js - كود تطبيق العميل (محدث للمستودع omni-business-suite)
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

// تحديد كود الجهاز للعميل (الافتراضي CLI-101)
const MY_CLIENT_CODE = localStorage.getItem('client_code') || 'CLI-101';

document.addEventListener('DOMContentLoaded', () => {
  // عرض كود الجهاز في أعلى الشاشة
  const codeDisplay = document.getElementById('client-display-code');
  if (codeDisplay) {
    codeDisplay.textContent = `الكود: ${MY_CLIENT_CODE}`;
  }

  // بدء الاستماع اللحظي للتغييرات من السحابة
  startLiveSync();
});

function startLiveSync() {
  db.ref('saas_data').on('value', (snapshot) => {
    const data = snapshot.val() || {};
    const clientsObj = data.clients || {};
    const bannersObj = data.banners || {};

    // قراءة بيانات هذا العميل تحديداً باستخدام الكود
    const myAccount = clientsObj[MY_CLIENT_CODE];

    if (!myAccount) {
      showSubscriptionModal(`هذا الجهاز (${MY_CLIENT_CODE}) غير مسجل بالنظام. يرجى التواصل مع الإدارة للتفعيل.`);
      lockApp();
      return;
    }

    localStorage.setItem('client_name', myAccount.name);

    // التحقق من حالة وتاريخ الاشتراك
    const now = Date.now();
    if (now > myAccount.endTimestamp) {
      showSubscriptionModal(`انتهت فترة الاشتراك بتاريخ (${myAccount.endDate}). يرجى طلب التجديد للاستمرار.`);
      lockApp();
    } else {
      unlockApp();
    }

    // تحديث الشريط الدعائي اللحظي
    updateBannerDisplay(bannersObj);
  });
}

// تحديث شريط الإعلانات اللحظي
function updateBannerDisplay(bannersObj) {
  const bannerBar = document.getElementById('ad-banner-bar');
  const bannerText = document.getElementById('ad-banner-text');

  if (!bannerBar || !bannerText) return;

  const bannerKeys = Object.keys(bannersObj);
  let activeText = '';

  // البحث عن أحدث إعلان موجه لهذا العميل أو للجميع
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

// إرسال طلب تجديد للأدمن
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
