// ==========================================
// Client_app.js - منطق تطبيق العميل
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

// كود الجهاز الخاص بالعميل
const CLIENT_CODE = "CLI-101";

document.addEventListener('DOMContentLoaded', () => {
  const codeElem = document.getElementById('client-display-code');
  if (codeElem) codeElem.textContent = `الكود: ${CLIENT_CODE}`;

  listenToSubscription();
  listenToBanners();
});

// 1. الاستماع اللحظي لحالة الاشتراك
function listenToSubscription() {
  db.ref(`saas_data/clients/${CLIENT_CODE}`).on('value', (snapshot) => {
    const client = snapshot.val();
    const overlay = document.getElementById('subscription-overlay');
    const msg = document.getElementById('subscription-msg');

    if (!client) {
      if (overlay) overlay.style.display = 'flex';
      if (msg) msg.textContent = `هذا الجهاز (${CLIENT_CODE}) غير مسجل بالنظام. يرجى التواصل مع الإدارة للتفعيل.`;
      return;
    }

    const now = Date.now();
    let isValid = false;

    // المقارنة الرقمية الدقيقة بدلالة المليثانية
    if (client.endTimestamp && now <= client.endTimestamp) {
      isValid = true;
    } 
    // التراجع للتاريخ النصي عند الضرورة
    else if (client.endDate) {
      const parsedDate = new Date(client.endDate).getTime();
      if (!isNaN(parsedDate) && parsedDate >= (now - 86400000)) {
        isValid = true;
      }
    }

    if (client.status === 'active' && isValid) {
      if (overlay) overlay.style.display = 'none'; // فتح الشاشة فوراً
    } else {
      if (overlay) overlay.style.display = 'flex'; // قفل الشاشة
      if (msg) msg.textContent = `انتهى اشتراك هذا الجهاز (${CLIENT_CODE}). يرجى تجديد الاشتراك للمتابعة.`;
    }
  });
}

// 2. إرسال طلب تجديد ومنع التكرار
function requestRenewal(planName, days) {
  const renewBtn = document.getElementById('renew-btn');
  const reqRef = db.ref('saas_data/requests');

  // التحقق أولاً من عدم وجود طلبات معلقة لنفس العميل
  reqRef.once('value').then((snapshot) => {
    const requests = snapshot.val() || {};
    let hasPending = false;

    Object.keys(requests).forEach((key) => {
      if (requests[key].clientCode === CLIENT_CODE) {
        hasPending = true;
      }
    });

    if (hasPending) {
      alert("لديك طلب تجديد معلق بالفعل قيد الانتظار لدى الإدارة!");
      return;
    }

    if (renewBtn) renewBtn.disabled = true;

    // إرسال طلب جديد فريد
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
    }).finally(() => {
      if (renewBtn) renewBtn.disabled = false;
    });
  });
}

// 3. الاستماع اللحظي للإعلانات
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
