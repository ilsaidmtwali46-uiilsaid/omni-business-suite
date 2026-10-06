// ==========================================
// client_app.js - كود فحص الاشتراك وتحديث البيانات للعميل
// ==========================================

// 1. إعدادات Firebase الخاصة بالمنظومة
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

// 2. تهيئة Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// 3. كود الجهاز الخاص بالعميل (مثال: CLI-101)
// يمكنك تخزينه في localStorage ليبقى ثابتاً في جهاز العميل
const MY_CLIENT_CODE = localStorage.getItem('client_code') || 'CLI-101';

document.addEventListener('DOMContentLoaded', () => {
  checkSubscriptionAndBanners();
});

// 4. دالة الفحص المستمر واللحظي للاشتراك والإعلانات
function checkSubscriptionAndBanners() {
  db.ref('saas_data').on('value', (snapshot) => {
    const data = snapshot.val() || {};
    const clients = data.clients || [];
    const banners = data.banners || [];

    // أ) البحث عن بيانات العميل باستخدام الكود الخاص به
    const myAccount = clients.find(c => c.code === MY_CLIENT_CODE);

    if (!myAccount) {
      showSubscriptionModal("تنبيه: هذا الجهاز غير مسجل في المنظومة. يرجى التواصل مع الدعم الفني.");
      lockApp();
      return;
    }

    // ب) فحص تاريخ انتهاء الاشتراك
    const now = Date.now();
    if (now > myAccount.endTimestamp) {
      showSubscriptionModal(`عذراً، انتهت فترة اشتراكك بتاريخ (${myAccount.endDate}). يرجى طلب تجديد الاشتراك للمتابعة.`);
      lockApp();
    } else {
      unlockApp();
    }

    // ج) جلب الشريط الدعائي الخاص بالعميل أو للجميع
    displayBanner(banners);
  }, (error) => {
    console.error("خطأ في الاتصال بالسحابة:", error);
  });
}

// 5. عرض الشريط الدعائي أسفل الشاشة
function displayBanner(banners) {
  const bannerContainer = document.getElementById('ad-banner-text');
  if (!bannerContainer) return;

  // إيجاد إعلان مخصص لهذا العميل أو إعلان عام للجميع
  const activeBanner = banners.find(b => b.clientCode === MY_CLIENT_CODE || b.target === 'ALL');

  if (activeBanner) {
    bannerContainer.textContent = activeBanner.text;
    document.getElementById('ad-banner-bar').style.display = 'block';
  } else {
    document.getElementById('ad-banner-bar').style.display = 'none';
  }
}

// 6. إرسال طلب تجديد الاشتراك إلى لوحة الأدمن
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
    alert("تم إرسال طلب التجديد إلى الإدارة بنجاح!");
  }).catch((err) => {
    alert("حدث خطأ أثناء إرسال الطلب: " + err.message);
  });
}

// 7. إغلاق التطبيق وإظهار شاشة التجديد عند الانتهاء
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
