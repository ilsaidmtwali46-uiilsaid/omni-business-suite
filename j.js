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

// تهيئة Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// كود العميل الثابت المسجل في اللوحة (يمكن تغييره لـ CLI-101 أو غيره)
const MY_CLIENT_CODE = localStorage.getItem('client_code') || 'CLI-101';

document.addEventListener('DOMContentLoaded', () => {
  // عرض كود الجهاز في أعلى الشاشة
  const codeDisplay = document.getElementById('client-display-code');
  if (codeDisplay) codeDisplay.textContent = `الكود: ${MY_CLIENT_CODE}`;

  // بدء الفحص والمزامنة مع السحابة
  checkSubscriptionAndBanners();
});

// فحص لحظي ومستمر للاشتراك والإعلانات عبر السحابة
function checkSubscriptionAndBanners() {
  db.ref('saas_data').on('value', (snapshot) => {
    const data = snapshot.val() || {};
    const clients = data.clients || [];
    const banners = data.banners || [];

    // البحث عن العميل باستخدام كود الجهاز
    const myAccount = clients.find(c => c.code === MY_CLIENT_CODE);

    if (!myAccount) {
      showSubscriptionModal(`هذا الجهاز (${MY_CLIENT_CODE}) غير مسجل بالنظام. يرجى التنسيق مع الدعم الفني لتفعيله.`);
      lockApp();
      return;
    }

    // حفظ اسم العميل محلياً لاستخدامه في الطلبات
    localStorage.setItem('client_name', myAccount.name);

    // فحص تاريخ انتهاء الاشتراك
    const now = Date.now();
    if (now > myAccount.endTimestamp) {
      showSubscriptionModal(`انتهت فترة استخدام الخدمة بتاريخ (${myAccount.endDate}). أرسل طلب تجديد للاستمرار في استخدام البرنامج.`);
      lockApp();
    } else {
      unlockApp();
    }

    // تحديث إعلانات الشريط الدعائي
    displayBanner(banners);
  }, (error) => {
    console.error("فشل الاتصال بالسحابة:", error);
  });
}

// إظهار الشريط الدعائي
function displayBanner(banners) {
  const bannerBar = document.getElementById('ad-banner-bar');
  const bannerText = document.getElementById('ad-banner-text');

  if (!bannerBar || !bannerText) return;

  // البحث عن إعلان مخصص لهذا العميل أو إعلان عام موجه للجميع
  const activeBanner = banners.find(b => b.clientCode === MY_CLIENT_CODE || b.target === 'ALL');

  if (activeBanner) {
    bannerText.textContent = activeBanner.text;
    bannerBar.style.display = 'block';
  } else {
    bannerBar.style.display = 'none';
  }
}

// إرسال طلب تجديد الاشتراك للأدمن
function requestRenewal(planName, days) {
  const myAccountName = localStorage.getItem('client_name') || MY_CLIENT_CODE;

  db.ref('saas_data/requests').push({
    clientCode: MY_CLIENT_CODE,
    clientName: myAccountName,
    planName: planName,
    days: days,
    date: new Date().toLocaleDateString('ar-EG'),
    timestamp: Date.now()
  }).then(() => {
    alert("تم إرسال طلب التجديد للأدمن بنجاح!");
  }).catch((err) => {
    alert("خطأ أثناء إرسال الطلب: " + err.message);
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
