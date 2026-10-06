// ==========================================
// client_app.js - تطبيق العميل / الكاشير
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

// قراءة كود العميل المحدد للجهاز (افتراضي CLI-101)
const MY_CLIENT_CODE = localStorage.getItem('client_code') || 'CLI-101';

document.addEventListener('DOMContentLoaded', () => {
  // عرض الكود في الهيدر
  const codeDisplay = document.getElementById('client-display-code');
  if (codeDisplay) codeDisplay.textContent = `الكود: ${MY_CLIENT_CODE}`;

  // بدء الاستماع والتزامُن اللحظي مع السحابة
  startLiveSync();
});

function startLiveSync() {
  db.ref('saas_data').on('value', (snapshot) => {
    const data = snapshot.val() || {};
    const clientsObj = data.clients || {};
    const bannersObj = data.banners || {};

    // جلب بيانات العميل باستخدام الكود المباشر
    const myAccount = clientsObj[MY_CLIENT_CODE];

    // 1. حالة الجهاز غير مسجل
    if (!myAccount) {
      showSubscriptionModal(`هذا الجهاز (${MY_CLIENT_CODE}) غير مسجل بالنظام. يرجى التواصل مع الإدارة لتفعيله.`);
      lockApp();
      return;
    }

    // حفظ اسم العميل في الذاكرة المحلية
    localStorage.setItem('client_name', myAccount.name);

    // 2. فحص حالة انتهائ الاشتراك
    const now = Date.now();
    if (now > myAccount.endTimestamp) {
      showSubscriptionModal(`انتهت فترة الاشتراك بتاريخ (${myAccount.endDate}). يرجى طلب التجديد للاستمرار.`);
      lockApp();
    } else {
      unlockApp();
    }

    // 3. تحديث الشريط الدعائي المتحرك
    updateBannerDisplay(bannersObj);
  });
}

// عرض الإعلان الدعائي الموجه للجهاز أو العام
function updateBannerDisplay(bannersObj) {
  const bannerBar = document.getElementById('ad-banner-bar');
  const bannerText = document.getElementById('ad-banner-text');

  if (!bannerBar || !bannerText) return;

  const bannerKeys = Object.keys(bannersObj);
  let activeText = '';

  // البحث عن أحدث إعلان يخص هذا العميل أو موجه للجميع
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

// إرسال طلب تجديد الاشتراك للأدمن
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
  }).catch((err) => {
    alert("حدث خطأ أثناء الإرسال: " + err.message);
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
