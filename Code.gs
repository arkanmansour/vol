/**
 * מערכת קביעת תורים - רכזת מתנדבים
 * =====================================
 * הוראות התקנה בתחתית הקובץ
 */

// ==================== הגדרות - יש לערוך כאן ====================
const CONFIG = {
  // מייל היומן של אשתך (אליו יכתבו הפגישות). גם כתובת זו מקבלת התראות מייל
  // אוטומטיות על כל קביעה/ביטול של תור (ראו notifyAdmin).
  CALENDAR_ID: 'arkan.dib@gmail.com',

  // אורך פגישה בדקות
  MEETING_DURATION_MINUTES: 30,

  // הגנה מפני ספאם: מספר קביעות תורים מקסימלי לאותו מספר טלפון ביום אחד
  MAX_BOOKINGS_PER_PHONE_PER_DAY: 5,

  TIMEZONE: 'Asia/Jerusalem',

  // (אופציונלי) מזהה גיליון גוגל לגיבוי לוג ההזמנות. השאירו ריק ('') כדי לדלג.
  BACKUP_SHEET_ID: '',

  // סיסמה למסך הניהול - חובה להחליף למשהו אישי לפני שימוש!
  ADMIN_KEY: 'Vol-Tor-2026-Arkan',

  // ימי קבלה רגילים - 0=ראשון, 1=שני, 2=שלישי, 3=רביעי, 4=חמישי, 5=שישי, 6=שבת
  REGULAR_HOURS: {
    0: { start: '09:00', end: '14:00' }, // ראשון
    1: { start: '09:00', end: '14:00' }, // שני
    3: { start: '09:00', end: '12:00' }  // רביעי
  },

  // שירותי מבחן - רק יום שני
  EXAM_HOURS: {
    1: { start: '09:00', end: '14:00' } // שני בלבד
  },

  // תוויות תמיד נשמרות בעברית ביומן/בתיאור, כדי שמסך הניהול ימשיך לעבוד כרגיל
  // גם כשההזמנה בוצעה מהדף הציבורי בערבית.
  MEETING_TYPES: {
    regular: { label: 'פגישה רגילה', hoursKey: 'REGULAR_HOURS' },
    exam: { label: 'שירותי מבחן', hoursKey: 'EXAM_HOURS' }
  },

  // מזהה קבוע שמאפשר לזהות אירועים שנוצרו על ידי המערכת הזו (אל תשנו)
  SYSTEM_TAG: 'SYSTEM:BOOKING',

  // תוויות לאופן הפגישה (עברית - נשמר ביומן)
  FORMAT_LABELS: {
    inperson: 'פרונטלי',
    phone: 'טלפוני'
  }
};

// ==================== תרגומים להודעות המוצגות למשתמש בדף הציבורי ====================
// שים לב: אלה רק ההודעות שחוזרות ללקוח (JSON). התיוג ביומן/בתיאור נשאר תמיד בעברית.
const MESSAGES = {
  he: {
    invalidMeetingType: 'סוג פגישה לא תקין',
    missingFields: 'חסרים פרטים בטופס',
    slotTaken: 'השעה שנבחרה כבר אינה פנויה. נא לבחור שעה אחרת.',
    bookSuccess: function (date, time) { return 'התור נקבע בהצלחה ל-' + date + ' בשעה ' + time; },
    bookError: function (err) { return 'שגיאה בקביעת התור: ' + err; },
    noEventId: 'לא סופק מזהה תור',
    eventNotFound: 'התור לא נמצא (ייתכן שכבר בוטל)',
    cannotCancel: 'לא ניתן לבטל אירוע זה',
    cancelSuccess: function (title, dateStr) { return 'התור בוטל בהצלחה (' + title + ', ' + dateStr + ')'; },
    cancelError: function (err) { return 'שגיאה בביטול התור: ' + err; },
    unrecognizedAction: function (action) { return 'פעולה לא מוכרת: ' + action; },
    missingPhone: 'נא להזין מספר טלפון',
    rescheduleSuccess: function (date, time) { return 'מועד התור עודכן בהצלחה ל-' + date + ' בשעה ' + time; },
    rescheduleError: function (err) { return 'שגיאה בשינוי מועד התור: ' + err; },
    tooManyAttempts: 'הגעת למספר המרבי של קביעות תורים להיום עבור מספר טלפון זה. נא לנסות שוב מחר או ליצור קשר טלפוני.'
  },
  ar: {
    invalidMeetingType: 'نوع اللقاء غير صالح',
    missingFields: 'هناك حقول ناقصة في النموذج',
    slotTaken: 'الوقت الذي تم اختياره لم يعد متاحًا. الرجاء اختيار وقت آخر.',
    bookSuccess: function (date, time) { return 'تم حجز الموعد بنجاح ليوم ' + date + ' الساعة ' + time; },
    bookError: function (err) { return 'خطأ في حجز الموعد: ' + err; },
    noEventId: 'لم يتم توفير معرف الموعد',
    eventNotFound: 'لم يتم العثور على الموعد (ربما تم إلغاؤه مسبقًا)',
    cannotCancel: 'لا يمكن إلغاء هذا الحدث',
    cancelSuccess: function (title, dateStr) { return 'تم إلغاء الموعد بنجاح (' + title + '، ' + dateStr + ')'; },
    cancelError: function (err) { return 'خطأ في إلغاء الموعد: ' + err; },
    unrecognizedAction: function (action) { return 'إجراء غير معروف: ' + action; },
    missingPhone: 'الرجاء إدخال رقم الهاتف',
    rescheduleSuccess: function (date, time) { return 'تم تحديث موعد اللقاء بنجاح ليوم ' + date + ' الساعة ' + time; },
    rescheduleError: function (err) { return 'خطأ في تغيير موعد اللقاء: ' + err; },
    tooManyAttempts: 'لقد وصلت إلى الحد الأقصى لعدد الحجوزات لهذا اليوم لهذا الرقم. الرجاء المحاولة غدًا أو التواصل هاتفيًا.'
  }
};

function getMessages(lang) {
  return MESSAGES[lang === 'ar' ? 'ar' : 'he'];
}

// ==================== API (JSONP) ====================
// הדף עצמו (booking.html / admin.html) מתארח בנפרד - כאן אנחנו רק שרת API.
// שיטת JSONP נבחרה כי היא עובדת מכל דפדפן/טלפון בלי בעיות CORS.
function doGet(e) {
  const action = e.parameter.action;
  const callback = e.parameter.callback;
  const lang = e.parameter.lang === 'ar' ? 'ar' : 'he';
  let result;

  try {
    if (action === 'getSlots') {
      result = getAvailableSlots(e.parameter.date, e.parameter.meetingType, lang, e.parameter.excludeEventId || null);
    } else if (action === 'book') {
      result = bookAppointment({
        name: e.parameter.name,
        phone: e.parameter.phone,
        email: e.parameter.email || '',
        meetingType: e.parameter.meetingType,
        meetingFormat: e.parameter.meetingFormat || 'inperson',
        date: e.parameter.date,
        time: e.parameter.time,
        notes: e.parameter.notes || '',
        hp: e.parameter.hp || '',
        ts: e.parameter.ts || ''
      }, lang);
    } else if (action === 'cancelAppointment') {
      result = cancelAppointment(e.parameter.eventId, lang);
    } else if (action === 'rescheduleAppointment') {
      result = rescheduleAppointment(e.parameter.eventId, e.parameter.date, e.parameter.time, lang);
    } else if (action === 'listAppointments') {
      result = listAppointments(e.parameter.key, Number(e.parameter.days) || 30);
    } else if (action === 'getStats') {
      result = getStats(e.parameter.key);
    } else if (action === 'findAppointments') {
      result = findAppointmentsByPhone(e.parameter.phone, lang);
    } else if (action === 'getAvailabilityInfo') {
      result = getAvailabilityInfo();
    } else if (action === 'listBlocks') {
      result = listBlocks(e.parameter.key);
    } else if (action === 'addBlock') {
      result = addBlock(e.parameter.key, {
        date: e.parameter.date,
        allDay: e.parameter.allDay === '1' || e.parameter.allDay === 'true',
        start: e.parameter.start || '',
        end: e.parameter.end || '',
        note: e.parameter.note || ''
      });
    } else if (action === 'removeBlock') {
      result = removeBlock(e.parameter.key, e.parameter.id);
    } else {
      result = { error: getMessages(lang).unrecognizedAction(action) };
    }
  } catch (err) {
    result = { success: false, error: err.message };
  }

  const body = callback ? callback + '(' + JSON.stringify(result) + ')' : JSON.stringify(result);
  return ContentService
    .createTextOutput(body)
    .setMimeType(callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
}

// ==================== עזרי זמן ====================
function timeStrToMinutes(t) {
  const parts = t.split(':').map(Number);
  return parts[0] * 60 + parts[1];
}

function minutesToTimeStr(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
}

function getHoursMapForType(meetingType) {
  const typeDef = CONFIG.MEETING_TYPES[meetingType];
  if (!typeDef) return null;
  return CONFIG[typeDef.hoursKey];
}

// ==================== חישוב זמינות ====================
function getAvailableSlots(dateStr, meetingType, lang, excludeEventId) {
  const msgs = getMessages(lang);
  const hoursMap = getHoursMapForType(meetingType);
  if (!hoursMap) return { error: msgs.invalidMeetingType };

  const date = new Date(dateStr + 'T00:00:00');
  const dayOfWeek = date.getDay();

  const dayHours = hoursMap[dayOfWeek];
  if (!dayHours) {
    return { slots: [], reason: 'no_reception_day' };
  }

  const now = new Date();
  const todayStr = Utilities.formatDate(now, CONFIG.TIMEZONE, 'yyyy-MM-dd');
  if (dateStr < todayStr) {
    return { slots: [], reason: 'past_date' };
  }

  const dateBlocks = getBlockedEntriesForDate(dateStr);
  if (dateBlocks.some(function (b) { return b.allDay; })) {
    return { slots: [], reason: 'blocked_day' };
  }

  const startMin = timeStrToMinutes(dayHours.start);
  const endMin = timeStrToMinutes(dayHours.end);
  const duration = CONFIG.MEETING_DURATION_MINUTES;

  const calendar = CalendarApp.getCalendarById(CONFIG.CALENDAR_ID);
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);
  const existingEvents = calendar.getEvents(dayStart, dayEnd);

  const busyRanges = existingEvents
    .filter(function (ev) { return !excludeEventId || ev.getId() !== excludeEventId; })
    .map(function (ev) { return { start: ev.getStartTime(), end: ev.getEndTime() }; });

  const blockRanges = dateBlocks
    .filter(function (b) { return !b.allDay && b.start && b.end; })
    .map(function (b) {
      const s = new Date(date);
      const sp = b.start.split(':').map(Number);
      s.setHours(sp[0], sp[1], 0, 0);
      const en = new Date(date);
      const ep = b.end.split(':').map(Number);
      en.setHours(ep[0], ep[1], 0, 0);
      return { start: s, end: en };
    });

  const allBusyRanges = busyRanges.concat(blockRanges);

  const slots = [];
  for (let m = startMin; m + duration <= endMin; m += duration) {
    const slotStart = new Date(date);
    slotStart.setHours(0, m, 0, 0);
    const slotEnd = new Date(slotStart.getTime() + duration * 60000);

    if (dateStr === todayStr && slotStart < now) continue;

    const overlaps = allBusyRanges.some(function (b) {
      return slotStart < b.end && slotEnd > b.start;
    });

    if (!overlaps) {
      slots.push(minutesToTimeStr(m));
    }
  }

  return { slots: slots };
}

// ==================== הגנה מפני ספאם ====================
const RATE_LIMIT_PROPERTY_KEY = 'BOOKING_RATE_LIMITS';

/**
 * מחזיר true אם המספר עדיין מתחת למכסה היומית, ומעדכן את המונה.
 * מנקה תוך כדי גם תאריכים ישנים כדי שהאובייקט לא יגדל לנצח.
 */
function checkRateLimit(phone) {
  const normalized = normalizePhoneDigits(phone);
  if (!normalized) return true; // ולידציה אחרת כבר תדחה טלפון ריק
  const props = PropertiesService.getScriptProperties();
  const todayStr = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd');
  let map = {};
  const raw = props.getProperty(RATE_LIMIT_PROPERTY_KEY);
  if (raw) {
    try {
      map = JSON.parse(raw) || {};
    } catch (e) {
      map = {};
    }
  }

  // ניקוי רשומות מתאריכים קודמים
  const cleaned = {};
  for (const key in map) {
    if (map[key] && map[key].date === todayStr) {
      cleaned[key] = map[key];
    }
  }

  const entry = cleaned[normalized];
  const count = entry ? entry.count : 0;
  const max = CONFIG.MAX_BOOKINGS_PER_PHONE_PER_DAY || 5;

  if (count >= max) {
    props.setProperty(RATE_LIMIT_PROPERTY_KEY, JSON.stringify(cleaned));
    return false;
  }

  cleaned[normalized] = { date: todayStr, count: count + 1 };
  props.setProperty(RATE_LIMIT_PROPERTY_KEY, JSON.stringify(cleaned));
  return true;
}

// ==================== התראות מייל למנהלת ====================
/**
 * שולח מייל התראה לכתובת היומן (CONFIG.CALENDAR_ID) על קביעה/ביטול של תור.
 * עטוף ב-try/catch כדי שכשל בשליחת מייל לעולם לא ימנע קביעה/ביטול תור בפועל.
 */
function notifyAdmin(subject, body) {
  try {
    if (!CONFIG.CALENDAR_ID) return;
    MailApp.sendEmail(CONFIG.CALENDAR_ID, subject, body);
  } catch (err) {
    Logger.log('notifyAdmin error: ' + err.message);
  }
}

// ==================== קביעת תור ====================
/**
 * payload: { name, phone, email, meetingType, meetingFormat, date, time, notes, hp, ts }
 * הערה: התיוג שנשמר ביומן ובתיאור (title/description) תמיד בעברית, כדי
 * שמסך הניהול ימשיך לעבוד ללא תלות בשפת הדף הציבורי. רק הודעת התשובה ללקוח מתורגמת.
 *
 * הגנת ספאם: שדה hp (honeypot) אמור תמיד להישאר ריק - בוט שממלא אותו מקבל "הצלחה" מזויפת
 * מבלי שנוצר בפועל אירוע. שדה ts הוא חותמת הזמן (מ-Date.now()) של טעינת הדף אצל הלקוח -
 * שליחה מהירה מדי (פחות מ-2.5 שניות) נחשבת חשודה כבוט ומטופלת באותו אופן.
 */
function bookAppointment(payload, lang) {
  const msgs = getMessages(lang);
  try {
    // --- honeypot: שדה שאמור להישאר ריק, גלוי רק לבוטים ---
    if (payload.hp) {
      return { success: true, message: msgs.bookSuccess(payload.date, payload.time), eventId: 'x' };
    }

    // --- בדיקת זמן מינימלי בין טעינת הדף לשליחה ---
    if (payload.ts) {
      const elapsed = Date.now() - Number(payload.ts);
      if (!isNaN(elapsed) && elapsed >= 0 && elapsed < 2500) {
        return { success: true, message: msgs.bookSuccess(payload.date, payload.time), eventId: 'x' };
      }
    }

    const meetingType = payload.meetingType;
    const typeDef = CONFIG.MEETING_TYPES[meetingType];
    if (!typeDef) {
      return { success: false, message: msgs.invalidMeetingType };
    }
    if (!payload.name || !payload.phone || !payload.date || !payload.time) {
      return { success: false, message: msgs.missingFields };
    }

    if (!checkRateLimit(payload.phone)) {
      return { success: false, message: msgs.tooManyAttempts };
    }

    const availability = getAvailableSlots(payload.date, meetingType, lang);
    if (!availability.slots || availability.slots.indexOf(payload.time) === -1) {
      return { success: false, message: msgs.slotTaken };
    }

    const timeParts = payload.time.split(':').map(Number);
    const hh = timeParts[0];
    const mm = timeParts[1];
    const startTime = new Date(payload.date + 'T00:00:00');
    startTime.setHours(hh, mm, 0, 0);
    const endTime = new Date(startTime.getTime() + CONFIG.MEETING_DURATION_MINUTES * 60000);

    const calendar = CalendarApp.getCalendarById(CONFIG.CALENDAR_ID);
    const formatLabel = CONFIG.FORMAT_LABELS[payload.meetingFormat] || CONFIG.FORMAT_LABELS.inperson;
    const title = typeDef.label + ' (' + formatLabel + ') - ' + payload.name;
    const description =
      CONFIG.SYSTEM_TAG + '\n' +
      'שם: ' + payload.name + '\n' +
      'טלפון: ' + payload.phone + '\n' +
      'אימייל: ' + (payload.email || '-') + '\n' +
      'סוג פגישה: ' + typeDef.label + '\n' +
      'אופן הפגישה: ' + formatLabel + '\n' +
      (payload.notes ? 'הערות: ' + payload.notes : '');

    const event = calendar.createEvent(title, startTime, endTime, {
      description: description
    });

    if (payload.email) {
      try {
        event.addGuest(payload.email);
      } catch (guestErr) {
        Logger.log('addGuest error: ' + guestErr.message);
      }
    }

    logToBackupSheet(payload, typeDef.label);

    notifyAdmin(
      'תור חדש נקבע: ' + payload.name + ' - ' + payload.date + ' ' + payload.time,
      'נקבע תור חדש:\n\n' +
      'שם: ' + payload.name + '\n' +
      'טלפון: ' + payload.phone + '\n' +
      'אימייל: ' + (payload.email || '-') + '\n' +
      'סוג פגישה: ' + typeDef.label + '\n' +
      'אופן הפגישה: ' + formatLabel + '\n' +
      'תאריך: ' + payload.date + '\n' +
      'שעה: ' + payload.time + '\n' +
      (payload.notes ? 'הערות: ' + payload.notes + '\n' : '')
    );

    return {
      success: true,
      message: msgs.bookSuccess(payload.date, payload.time),
      eventId: event.getId()
    };
  } catch (err) {
    return { success: false, message: msgs.bookError(err.message) };
  }
}

// ==================== ביטול תור ====================
function cancelAppointment(eventId, lang) {
  const msgs = getMessages(lang);
  if (!eventId) {
    return { success: false, message: msgs.noEventId };
  }
  try {
    const calendar = CalendarApp.getCalendarById(CONFIG.CALENDAR_ID);
    const event = calendar.getEventById(eventId);
    if (!event) {
      return { success: false, message: msgs.eventNotFound };
    }
    const desc = event.getDescription() || '';
    if (desc.indexOf(CONFIG.SYSTEM_TAG) === -1) {
      return { success: false, message: msgs.cannotCancel };
    }
    const title = event.getTitle();
    const start = event.getStartTime();
    const startFormatted = Utilities.formatDate(start, CONFIG.TIMEZONE, 'dd/MM/yyyy HH:mm');
    event.deleteEvent();

    notifyAdmin(
      'תור בוטל: ' + title,
      'תור בוטל:\n\n' +
      title + '\n' +
      'מועד התור שבוטל: ' + startFormatted
    );

    return {
      success: true,
      message: msgs.cancelSuccess(title, startFormatted)
    };
  } catch (err) {
    return { success: false, message: msgs.cancelError(err.message) };
  }
}

// ==================== שינוי מועד תור קיים (ללא ביטול + קביעה מחדש) ====================
/**
 * מאפשר למשתמש בדף הציבורי (לפי אותו זרימת חיפוש-לפי-טלפון) להזיז תור קיים למועד אחר,
 * מבלי לבטל וליצור תור חדש - כך נשמר אותו eventId ואותם שם/טלפון/אימייל/הערות בתיאור.
 * בודק זמינות במועד החדש (כולל חסימות וימי קבלה) לפי אותו סוג פגישה כמו התור המקורי.
 */
function rescheduleAppointment(eventId, newDate, newTime, lang) {
  const msgs = getMessages(lang);
  if (!eventId || !newDate || !newTime) {
    return { success: false, message: msgs.missingFields };
  }
  try {
    const calendar = CalendarApp.getCalendarById(CONFIG.CALENDAR_ID);
    const event = calendar.getEventById(eventId);
    if (!event) {
      return { success: false, message: msgs.eventNotFound };
    }
    const desc = event.getDescription() || '';
    if (desc.indexOf(CONFIG.SYSTEM_TAG) === -1) {
      return { success: false, message: msgs.cannotCancel };
    }

    const meetingType = typeKeyFromLabel(extractLabel(desc, 'סוג פגישה'));
    const oldStart = event.getStartTime();
    const oldStartFormatted = Utilities.formatDate(oldStart, CONFIG.TIMEZONE, 'dd/MM/yyyy HH:mm');

    // excludeEventId=eventId: אם המועד החדש הוא אותו תאריך של התור הקיים, האירוע עצמו לא
    // ייחשב "תפוס" ברשימת האירועים התפוסים - כדי שלא ייחסם מעבר בין שעות באותו יום.
    const availability = getAvailableSlots(newDate, meetingType, lang, eventId);
    const slotsAvailable = availability.slots || [];
    if (slotsAvailable.indexOf(newTime) === -1) {
      return { success: false, message: msgs.slotTaken };
    }

    const timeParts = newTime.split(':').map(Number);
    const newStart = new Date(newDate + 'T00:00:00');
    newStart.setHours(timeParts[0], timeParts[1], 0, 0);
    const newEnd = new Date(newStart.getTime() + CONFIG.MEETING_DURATION_MINUTES * 60000);

    event.setTime(newStart, newEnd);

    notifyAdmin(
      'מועד תור שונה: ' + event.getTitle(),
      'מועד תור שונה:\n\n' +
      event.getTitle() + '\n' +
      'מועד קודם: ' + oldStartFormatted + '\n' +
      'מועד חדש: ' + newDate + ' ' + newTime
    );

    return {
      success: true,
      message: msgs.rescheduleSuccess(newDate, newTime),
      eventId: event.getId()
    };
  } catch (err) {
    return { success: false, message: msgs.rescheduleError(err.message) };
  }
}

// ==================== חיפוש תורים לפי טלפון (לביטול עצמי מהדף הציבורי) ====================
/**
 * מאפשר למשתמש בדף הציבורי למצוא ולבטל תור קיים לפי מספר הטלפון שהזין בעת הקביעה,
 * בלי צורך במפתח ניהול ובלי צורך בקישור/מזהה תור שנשמר אצלו.
 * מחזיר רק את הפרטים המינימליים הדרושים לזיהוי וביטול (לא שם/אימייל/הערות).
 * typeKey/formatKey מוחזרים (regular/exam, inperson/phone) כדי שהתרגום יתבצע בצד הלקוח
 * לפי השפה הנבחרת, מבלי לגעת בתוויות העבריות השמורות ביומן (עליהן תלוי מסך הניהול).
 */
function normalizePhoneDigits(p) {
  return (p || '').replace(/\D/g, '');
}

/** עזרי פירוש תיאור אירוע - משותפים בין findAppointmentsByPhone, rescheduleAppointment, listAppointments, getStats */
function extractLabel(desc, label) {
  const re = new RegExp(label + ':\\s*(.*)');
  const m = desc.match(re);
  return m ? m[1].trim() : '';
}

function typeKeyFromLabel(label) {
  for (const key in CONFIG.MEETING_TYPES) {
    if (CONFIG.MEETING_TYPES[key].label === label) return key;
  }
  return 'regular';
}

function formatKeyFromLabel(label) {
  for (const key in CONFIG.FORMAT_LABELS) {
    if (CONFIG.FORMAT_LABELS[key] === label) return key;
  }
  return 'inperson';
}

function findAppointmentsByPhone(phone, lang) {
  const msgs = getMessages(lang);
  const normalized = normalizePhoneDigits(phone);
  if (!normalized) {
    return { success: false, message: msgs.missingPhone };
  }
  try {
    const calendar = CalendarApp.getCalendarById(CONFIG.CALENDAR_ID);
    const now = new Date();
    const rangeEnd = new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000);
    const events = calendar.getEvents(now, rangeEnd);

    const appointments = events
      .filter(function (ev) {
        const desc = ev.getDescription() || '';
        if (desc.indexOf(CONFIG.SYSTEM_TAG) === -1) return false;
        const evPhone = normalizePhoneDigits(extractLabel(desc, 'טלפון'));
        return evPhone && evPhone === normalized;
      })
      .map(function (ev) {
        const desc = ev.getDescription() || '';
        const start = ev.getStartTime();
        return {
          eventId: ev.getId(),
          date: Utilities.formatDate(start, CONFIG.TIMEZONE, 'yyyy-MM-dd'),
          time: Utilities.formatDate(start, CONFIG.TIMEZONE, 'HH:mm'),
          typeKey: typeKeyFromLabel(extractLabel(desc, 'סוג פגישה')),
          formatKey: formatKeyFromLabel(extractLabel(desc, 'אופן הפגישה'))
        };
      })
      .sort(function (a, b) { return (a.date + a.time).localeCompare(b.date + b.time); });

    return { success: true, appointments: appointments };
  } catch (err) {
    return { success: false, message: msgs.cancelError(err.message) };
  }
}

// ==================== חסימת ימים/שעות (חופשות) ====================
/**
 * מאפשר למנהלת (רכזת ההתנדבות) לחסום ימים שלמים או טווחי שעות מסוימים (לדוגמה: חופשה),
 * בלי לגעת בקוד. הרשימה נשמרת ב-Script Properties (לא תלויה בגיליון).
 * חסימת יום שלם -> היום נעלם לגמרי מהיומן הציבורי (כמו יום ללא קבלת קהל).
 * חסימת טווח שעות -> אותן שעות נחסמות בדיוק כמו פגישה קיימת, שאר היום פנוי כרגיל.
 */
const BLOCKS_PROPERTY_KEY = 'BOOKING_BLOCKS';

/**
 * קורא את רשימת החסימות, ותוך כדי מנקה בעדינות חסימות שתאריכן כבר עבר
 * (כדי שהרשימה לא תגדל לנצח). הכתיבה חזרה מתבצעת רק אם נמצא בפועל מה לנקות.
 */
function getBlockedEntries() {
  const raw = PropertiesService.getScriptProperties().getProperty(BLOCKS_PROPERTY_KEY);
  if (!raw) return [];
  let parsed;
  try {
    parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
  } catch (e) {
    return [];
  }

  const todayStr = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd');
  const active = parsed.filter(function (b) { return b.date >= todayStr; });
  if (active.length !== parsed.length) {
    saveBlockedEntries(active);
  }
  return active;
}

function saveBlockedEntries(list) {
  PropertiesService.getScriptProperties().setProperty(BLOCKS_PROPERTY_KEY, JSON.stringify(list));
}

function getBlockedEntriesForDate(dateStr) {
  return getBlockedEntries().filter(function (b) { return b.date === dateStr; });
}

function checkAdminKey(key) {
  return !!CONFIG.ADMIN_KEY && key === CONFIG.ADMIN_KEY;
}

/**
 * מידע ציבורי (ללא צורך במפתח ניהול) על ימי/שעות קבלת קהל וימים חסומים מראש,
 * כדי שדף הקביעה הציבורי יוכל להציג הקדמה ולמנוע מהמשתמש לבחור ימים לא רלוונטיים.
 */
function getAvailabilityInfo() {
  try {
    const now = new Date();
    const rangeEnd = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
    const todayStr = Utilities.formatDate(now, CONFIG.TIMEZONE, 'yyyy-MM-dd');
    const endStr = Utilities.formatDate(rangeEnd, CONFIG.TIMEZONE, 'yyyy-MM-dd');

    const blockedFullDays = getBlockedEntries()
      .filter(function (b) { return b.allDay && b.date >= todayStr && b.date <= endStr; })
      .map(function (b) { return b.date; });

    return {
      success: true,
      hours: {
        regular: CONFIG.REGULAR_HOURS,
        exam: CONFIG.EXAM_HOURS
      },
      blockedFullDays: blockedFullDays
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/** רשימה מלאה (כולל הערות) - למסך הניהול בלבד */
function listBlocks(key) {
  if (!checkAdminKey(key)) {
    return { error: 'גישה לא מורשית' };
  }
  const list = getBlockedEntries().slice().sort(function (a, b) {
    return (a.date + (a.start || '')).localeCompare(b.date + (b.start || ''));
  });
  return { blocks: list };
}

function addBlock(key, entry) {
  if (!checkAdminKey(key)) {
    return { success: false, error: 'גישה לא מורשית' };
  }
  if (!entry || !entry.date) {
    return { success: false, error: 'חסר תאריך' };
  }
  if (!entry.allDay && (!entry.start || !entry.end)) {
    return { success: false, error: 'יש להזין שעת התחלה ושעת סיום, או לסמן חסימת יום שלם' };
  }
  if (!entry.allDay && timeStrToMinutes(entry.start) >= timeStrToMinutes(entry.end)) {
    return { success: false, error: 'שעת הסיום חייבת להיות אחרי שעת ההתחלה' };
  }

  const list = getBlockedEntries();
  const newEntry = {
    id: Utilities.getUuid(),
    date: entry.date,
    allDay: !!entry.allDay,
    start: entry.allDay ? '' : entry.start,
    end: entry.allDay ? '' : entry.end,
    note: entry.note || ''
  };
  list.push(newEntry);
  saveBlockedEntries(list);
  return { success: true, block: newEntry };
}

function removeBlock(key, id) {
  if (!checkAdminKey(key)) {
    return { success: false, error: 'גישה לא מורשית' };
  }
  if (!id) {
    return { success: false, error: 'חסר מזהה חסימה' };
  }
  const list = getBlockedEntries();
  const filtered = list.filter(function (b) { return b.id !== id; });
  if (filtered.length === list.length) {
    return { success: false, error: 'החסימה לא נמצאה (ייתכן שכבר נמחקה)' };
  }
  saveBlockedEntries(filtered);
  return { success: true };
}

// ==================== מסך ניהול - רשימת תורים ====================
function listAppointments(key, days) {
  if (!CONFIG.ADMIN_KEY || key !== CONFIG.ADMIN_KEY) {
    return { error: 'גישה לא מורשית' };
  }
  try {
    const calendar = CalendarApp.getCalendarById(CONFIG.CALENDAR_ID);
    const now = new Date();
    const rangeEnd = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const events = calendar.getEvents(now, rangeEnd);

    const appointments = events
      .filter(function (ev) {
        return (ev.getDescription() || '').indexOf(CONFIG.SYSTEM_TAG) !== -1;
      })
      .map(function (ev) {
        const desc = ev.getDescription() || '';
        function extract(label) {
          const re = new RegExp(label + ':\\s*(.*)');
          const m = desc.match(re);
          return m ? m[1].trim() : '';
        }
        return {
          eventId: ev.getId(),
          title: ev.getTitle(),
          start: Utilities.formatDate(ev.getStartTime(), CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm'),
          end: Utilities.formatDate(ev.getEndTime(), CONFIG.TIMEZONE, 'HH:mm'),
          name: extract('שם'),
          phone: extract('טלפון'),
          email: extract('אימייל'),
          meetingType: extract('סוג פגישה'),
          meetingFormat: extract('אופן הפגישה'),
          notes: extract('הערות')
        };
      })
      .sort(function (a, b) { return a.start.localeCompare(b.start); });

    return { appointments: appointments };
  } catch (err) {
    return { error: 'שגיאה בטעינת התורים: ' + err.message };
  }
}

// ==================== גיבוי לגיליון (אוטומטי) ====================
const BACKUP_SHEET_PROPERTY_KEY = 'BACKUP_SHEET_ID_AUTO';

/**
 * מחזיר מזהה גיליון גוגל לגיבוי: אם הוגדר ידנית ב-CONFIG.BACKUP_SHEET_ID משתמשים בו,
 * אחרת יוצרים גיליון חדש אוטומטית בפעם הראשונה ושומרים את המזהה ב-Script Properties
 * כדי לא ליצור גיליון נוסף בכל פעם.
 */
function getOrCreateBackupSheetId() {
  if (CONFIG.BACKUP_SHEET_ID) return CONFIG.BACKUP_SHEET_ID;

  const props = PropertiesService.getScriptProperties();
  const existing = props.getProperty(BACKUP_SHEET_PROPERTY_KEY);
  if (existing) return existing;

  const ss = SpreadsheetApp.create('גיבוי הזמנות - מערכת קביעת תורים');
  props.setProperty(BACKUP_SHEET_PROPERTY_KEY, ss.getId());
  return ss.getId();
}

function logToBackupSheet(payload, typeLabel) {
  try {
    const sheetId = getOrCreateBackupSheetId();
    if (!sheetId) return;
    const ss = SpreadsheetApp.openById(sheetId);
    let sheet = ss.getSheetByName('הזמנות');
    if (!sheet) {
      sheet = ss.insertSheet('הזמנות');
      sheet.appendRow(['תאריך יצירה', 'שם', 'טלפון', 'אימייל', 'סוג פגישה', 'תאריך פגישה', 'שעה', 'הערות']);
    }
    sheet.appendRow([
      new Date(),
      payload.name,
      payload.phone,
      payload.email || '',
      typeLabel,
      payload.date,
      payload.time,
      payload.notes || ''
    ]);
  } catch (err) {
    Logger.log('Backup sheet error: ' + err.message);
  }
}

// ==================== מסך ניהול - סטטיסטיקות ====================
/**
 * מחזיר ספירות תורים לשבוע הקרוב (7 ימים) ולחודש הקרוב (30 יום), כולל פילוח
 * לפי סוג פגישה ואופן פגישה. משתמש באותו פירוש תוויות עבריות כמו listAppointments.
 */
function getStats(key) {
  if (!checkAdminKey(key)) {
    return { error: 'גישה לא מורשית' };
  }
  try {
    const calendar = CalendarApp.getCalendarById(CONFIG.CALENDAR_ID);
    const now = new Date();
    const rangeEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const events = calendar.getEvents(now, rangeEnd);

    function extract(desc, label) {
      const re = new RegExp(label + ':\\s*(.*)');
      const m = desc.match(re);
      return m ? m[1].trim() : '';
    }

    const appointments = events.filter(function (ev) {
      return (ev.getDescription() || '').indexOf(CONFIG.SYSTEM_TAG) !== -1;
    });

    const stats = {
      week: 0,
      month: appointments.length,
      byType: {},
      byFormat: {}
    };

    appointments.forEach(function (ev) {
      const desc = ev.getDescription() || '';
      if (ev.getStartTime() <= weekEnd) {
        stats.week++;
      }
      const typeLabel = extract(desc, 'סוג פגישה') || 'לא ידוע';
      const formatLabel = extract(desc, 'אופן הפגישה') || 'לא ידוע';
      stats.byType[typeLabel] = (stats.byType[typeLabel] || 0) + 1;
      stats.byFormat[formatLabel] = (stats.byFormat[formatLabel] || 0) + 1;
    });

    return { success: true, stats: stats };
  } catch (err) {
    return { success: false, error: 'שגיאה בטעינת נתונים סטטיסטיים: ' + err.message };
  }
}

/*
==================== הוראות התקנה ====================
עדכון גרסה: תמיכה בשפה ערבית בדף קביעת התור הציבורי (הודעות תשובה מהשרת מתורגמות לפי פרמטר lang), ביטול עצמי לפי חיפוש מספר טלפון,
ותמיכה בחסימת ימים/שעות (חופשות) על ידי המנהלת דרך מסך הניהול - נשמר ב-Script Properties, לא דורש עריכת קוד.

1. שמרו (Ctrl+S)
2. Deploy -> Manage deployments -> עיפרון -> Version: New version -> Deploy
3. הכתובת (/exec) נשארת אותה כתובת כמו קודם
*/
