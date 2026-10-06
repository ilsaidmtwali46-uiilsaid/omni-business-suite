// ==========================================
// Client_app.js - تطبيق العميل (مُحدث ومحلول بالكامل)
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

// تحديد كود العميل الحسابي (يمكن تغييره حسب الجهاز)
const CLIENT_CODE = "CLI-101";

document.addEventListener('DOMContentLoaded', () => {
  const codeElem = document.getElementById('client-display-code');
  if (codeElem) codeElem.textContent = `الكود: ${CLIENT_CODE}`;

  // الاستماع المباشر والتزامن اللحظي مع قاعدة البيانات
  listenToSubscription();
  listenToBanners();
});

// فحص تفعيل الاشتراك اللحظي
function listenToSubscription() {
  db.ref(`saas_data/clients/${CLIENT_CODE}`).on('value', (snapshot) => {
    const client = snapshot.val();
    const overlay = document.getElementById('subscription-overlay');
    const msg = document.getElementById('subscription-msg');

    if (!client) {
      // العميل غير موجود بجدول العملاء
      if (overlay) overlay.style.display = 'flex';
      if (msg) msg.textContent = `هذا الجهاز (${CLIENT_CODE}) غير مسجل بالنظام. يرجى التواصل مع الإدارة للتفعيل.`;
      return;
    }

    const now = Date.now();
    let isValid = false;

    // فحص الصلاحية برقم الميلي ثانية
    if (client.endTimestamp && now <= client.endTimestamp) {
      isValid = true;
    } 
    // فحص الصلاحية بالتاريخ النصي (تحسباً إذا أرسل الأدمن تاريخ نصي)
    else if (client.endDate) {
      const parsedDate = new Date(client.endDate).getTime();
      if (!isNaN(parsedDate) && parsedDate >= (now - 86400000)) { // السماح بنهاية اليوم
        isValid = true;
      }
    }

    // إذا كانت الحالة active والتاريخ ساري
    if (client.status === 'active' || isValid) {
      if (overlay) overlay.style.display = 'none'; // فتح الشاشة فوراً
    } else {
      if (overlay) overlay.style.display = 'flex'; // قفل الشاشة
      if (msg) msg.textContent = `انتهى اشتراك هذا الجهاز (${CLIENT_CODE}). يرجى تجديد الاشتراك للمتابعة.`;
    }
  });
}

// دالة إرسال طلب تجديد من العميل إلى الأدمن
function requestRenewal(planName, days) {
  const reqRef = db.ref('saas_data/requests');
  const newReq = reqRef.push();
  
  newReq.set({
    clientCode: CLIENT_CODE,
    clientName: "سوپر ماركت الأمل",
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

// استلام شريط الإعلانات اللحظي
function listenToBanners() {
  db.ref('saas_data/banners').on('value', (snapshot) => {
    const banners = snapshot.val() || {};
    const bannerBar = document.getElementById('ad-banner-bar');
    const bannerText = document.getElementById('ad-banner-text');

    let activeText = "";
    Object.keys(banners).forEach((key) => {
      const b = banners[key];
      if (b.target === 'ALL' || b.clientCode === CLIENT_CODE) {
        activeText += ` 📢 ${b.text} | `;
      }
    });

    if (activeText && bannerBar && bannerText) {
      bannerText.textContent = activeText;
      bannerBar.style.display = 'block';
    } else if (bannerBar) {
      bannerBar.style.display = 'none';
    }
  });
}
