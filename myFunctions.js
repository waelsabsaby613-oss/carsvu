/* =========================================================
   ملف البرمجة والتفاعل والتحقق - myFunctions.js
   يحتوي على وظائف JQuery و JavaScript للتحقق وحساب التكلفة
   ========================================================= */

$(document).ready(function () {
    
    // 1. استخدام JQuery لإظهار/إخفاء تفاصيل السيارة عند ضغط مربعات التفاصيل
    $('.detail-checkbox').change(function () {
        var carId = $(this).val();
        var detailsRow = $('#details-' + carId);
        
        if ($(this).is(':checked')) {
            detailsRow.slideDown(300);
        } else {
            detailsRow.slideUp(300);
        }
    });

    // 2. إظهار نموذج الحجز عند الضغط على زر "متابعة"
    $('#btnContinue').click(function () {
        var selectedCars = $('.select-car-checkbox:checked');
        
        if (selectedCars.length === 0) {
            alert('يرجى اختيار سيارة واحدة على الأقل للمتابعة.');
            return;
        }
        
        // إظهار قسم نموذج الحجز بسلاسة
        $('#bookingSection').slideDown(400);
        $('html, body').animate({
            scrollTop: $("#bookingSection").offset().top - 20
        }, 500);
    });

});

// 3. التحقق من صحة النموذج وإجراء الحسابات عند الضغط على "إرسال"
function validateForm() {
    
    // جلب قيم المدخلات
    var fullName = document.getElementById('fullName').value.trim();
    var nationalId = document.getElementById('nationalId').value.trim();
    var startDateStr = document.getElementById('startDate').value;
    var endDateStr = document.getElementById('endDate').value;
    var mobile = document.getElementById('mobile').value.trim();
    var email = document.getElementById('email').value.trim();

    // أ) التحقق من الاسم الكامل (أحرف هجائية عربية فقط مع المسافات)
    var arabicRegex = /^[\u0600-\u06FF\s]+$/;
    if (fullName !== "" && !arabicRegex.test(fullName)) {
        alert("خطأ: الاسم الكامل يجب أن يحتوي على أحرف هجائية عربية فقط.");
        return false;
    }

    // ب) التحقق من الرقم الوطني (11 خانة إلزامية، أول خانتين بين 01 و 14)
    var nationalIdRegex = /^(0[1-9]|1[0-4])\d{9}$/;
    if (!nationalIdRegex.test(nationalId)) {
        alert("خطأ: الرقم الوطني إلزامي ومكون من 11 خانة، ويجب أن تبدأ بأول خانتين للمحافظة (من 01 إلى 14).");
        return false;
    }

    // ج) التحقق من التواريخ (إلزامية والتسلسل الزمني)
    if (!startDateStr || !endDateStr) {
        alert("خطأ: تاريخ بداية ونهاية التأجير حقول إلزامية.");
        return false;
    }

    var startDate = new Date(startDateStr);
    var endDate = new Date(endDateStr);

    if (endDate <= startDate) {
        alert("خطأ: تاريخ نهاية التأجير يجب أن يكون لاحقاً لتاريخ البداية.");
        return false;
    }

    // د) التحقق من رقم الموبايل (مطابق لشبكتي Syriatel أو MTN)
    // Syriatel: 093, 094, 095, 096 | MTN: 098, 099
    var mobileRegex = /^09(3|4|5|6|8|9)\d{7}$/;
    if (mobile !== "" && !mobileRegex.test(mobile)) {
        alert("خطأ: رقم الموبايل غير صحيح. يجب أن يتكون من 10 أرقام ويبدأ بـ (093, 094, 095, 096, 098, 099).");
        return false;
    }

    // هـ) التحقق من البريد الإلكتروني (إن وُجد)
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email !== "" && !emailRegex.test(email)) {
        alert("خطأ: صيغة البريد الإلكتروني غير صحيحة.");
        return false;
    }

    // --- حساب مدة التأجير والتكلفة ---
    var timeDiff = endDate.getTime() - startDate.getTime();
    var totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); // حساب عدد الأيام

    var selectedCars = [];
    var grandTotalBeforeDiscount = 0;

    $('.select-car-checkbox:checked').each(function () {
        var carModel = $(this).data('model');
        var pricePerDay = parseFloat($(this).data('price'));
        var carCost = pricePerDay * totalDays;
        
        grandTotalBeforeDiscount += carCost;
        selectedCars.push(carModel + " (" + pricePerDay.toLocaleString() + " ل.س/يوم) -> " + carCost.toLocaleString() + " ل.س");
    });

    // حساب الخصم 5% إذا كانت المدة أكثر من 10 أيام
    var discountAmount = 0;
    if (totalDays > 10) {
        discountAmount = grandTotalBeforeDiscount * 0.05;
    }

    var finalAmount = grandTotalBeforeDiscount - discountAmount;

    // إعداد رسالة النتيجة
    var resultMsg = "=== تم قبول طلب الحجز بنجاح ===\n\n";
    resultMsg += "السيارات المختارة:\n- " + selectedCars.join("\n- ") + "\n\n";
    resultMsg += "عدد أيام التأجير لكل سيارة: " + totalDays + " يوم/أيام\n";
    resultMsg += "المجموع الإجمالي: " + grandTotalBeforeDiscount.toLocaleString() + " ل.س\n";
    
    if (discountAmount > 0) {
        resultMsg += "خصم الإقامة الطويلة (تجاوز 10 أيام - 5%): -" + discountAmount.toLocaleString() + " ل.س\n";
    } else {
        resultMsg += "الخصم: لا يوجد (المدة 10 أيام أو أقل)\n";
    }
    
    resultMsg += "-----------------------------------\n";
    resultMsg += "المبلغ النهائي المطلوب: " + finalAmount.toLocaleString() + " ل.س";

    alert(resultMsg);

    return false; // منع إعادة تحميل الصفحة لتبقى النتائج معروضة
}