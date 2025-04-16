// Translation keys organized by page and component
export type TranslationKey = 
  | 'common.home'
  | 'common.menu'
  | 'common.orderStatus'
  | 'common.tourism'
  | 'common.admin'
  | 'common.language'
  | 'common.darkMode'
  | 'common.cart'
  | 'common.total'
  | 'common.placeOrder'
  | 'common.search'
  | 'common.loading'
  | 'common.error'
  | 'common.empty'
  | 'common.save'
  | 'common.cancel'
  | 'common.delete'
  | 'common.edit'
  | 'common.actions'
  | 'common.logout'
  | 'common.login'
  | 'common.required'
  | 'common.optional'
  
  // Home page
  | 'home.welcome'
  | 'home.subtitle'
  | 'home.orderCta'
  | 'home.features.title'
  | 'home.features.menu'
  | 'home.features.tourism'
  | 'home.features.order'
  
  // Menu page
  | 'menu.title'
  | 'menu.emptyCart'
  | 'menu.guestName'
  | 'menu.roomNumber'
  | 'menu.mobileNumber'
  | 'menu.orderSuccess'
  
  // Order Status page
  | 'orderStatus.title'
  | 'orderStatus.checkStatus'
  | 'orderStatus.enterDetails'
  | 'orderStatus.pendingStatus'
  | 'orderStatus.preparingStatus'
  | 'orderStatus.deliveredStatus'
  | 'orderStatus.orderNotFound'
  
  // Tourism page
  | 'tourism.title'
  | 'tourism.distance'
  | 'tourism.viewMap'
  | 'tourism.filter.all'
  | 'tourism.filter.religious'
  | 'tourism.filter.heritage'
  | 'tourism.filter.romantic'
  | 'tourism.filter.educational'
  | 'tourism.noResults'
  
  // Admin page
  | 'admin.title'
  | 'admin.dashboard'
  | 'admin.menuManager'
  | 'admin.orderSheet'
  | 'admin.themeEditor'
  | 'admin.tourismContent'
  | 'admin.settings'
  | 'admin.orderManagement'
  | 'admin.addMenuItem'
  | 'admin.addTourismPlace'
  | 'admin.generalSettings'
  | 'admin.exportSettings'
  | 'admin.exportLimit'
  | 'admin.orderLimitDays'
  | 'admin.orderLimitCount';

// Primary language is English
const en: Record<TranslationKey, string> = {
  'common.home': 'Home',
  'common.menu': 'Order Food',
  'common.orderStatus': 'Order Status',
  'common.tourism': 'Explore Ujjain',
  'common.admin': 'Admin Panel',
  'common.language': 'Language',
  'common.darkMode': 'Dark Mode',
  'common.cart': 'Your Order',
  'common.total': 'Total',
  'common.placeOrder': 'Place Order',
  'common.search': 'Search',
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.empty': 'No items found',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.actions': 'Actions',
  'common.logout': 'Logout',
  'common.login': 'Login',
  'common.required': 'Required',
  'common.optional': 'Optional',
  
  'home.welcome': 'Welcome to Rai Guest House',
  'home.subtitle': 'Experience comfort and excellent service during your stay',
  'home.orderCta': 'Order Food Now',
  'home.features.title': 'Our Services',
  'home.features.menu': 'Delicious food delivered to your room',
  'home.features.tourism': 'Explore the beautiful city of Ujjain',
  'home.features.order': 'Track your food order in real-time',
  
  'menu.title': 'Our Menu',
  'menu.emptyCart': 'Your cart is empty',
  'menu.guestName': 'Guest Name',
  'menu.roomNumber': 'Room Number',
  'menu.mobileNumber': 'Mobile Number',
  'menu.orderSuccess': 'Your order has been placed successfully',
  
  'orderStatus.title': 'Check Order Status',
  'orderStatus.checkStatus': 'Check Status',
  'orderStatus.enterDetails': 'Enter your room number or mobile number to check status',
  'orderStatus.pendingStatus': 'Pending',
  'orderStatus.preparingStatus': 'Preparing',
  'orderStatus.deliveredStatus': 'Delivered',
  'orderStatus.orderNotFound': 'No orders found with the provided details',
  
  'tourism.title': 'Explore Ujjain',
  'tourism.distance': 'Distance from Guest House',
  'tourism.viewMap': 'View on Map',
  'tourism.filter.all': 'All',
  'tourism.filter.religious': 'Religious',
  'tourism.filter.heritage': 'Heritage',
  'tourism.filter.romantic': 'Romantic',
  'tourism.filter.educational': 'Educational',
  'tourism.noResults': 'No places found matching the selected filter',
  
  'admin.title': 'Admin Panel',
  'admin.dashboard': 'Dashboard',
  'admin.menuManager': 'Menu Manager',
  'admin.orderSheet': 'Order Sheet',
  'admin.themeEditor': 'Theme Editor',
  'admin.tourismContent': 'Tourism Content',
  'admin.settings': 'Settings',
  'admin.orderManagement': 'Order Management',
  'admin.addMenuItem': 'Add New Item',
  'admin.addTourismPlace': 'Add New Place',
  'admin.generalSettings': 'General Settings',
  'admin.exportSettings': 'Export Settings',
  'admin.exportLimit': 'Set order history limit',
  'admin.orderLimitDays': 'Day limit',
  'admin.orderLimitCount': 'Order count limit'
};

// Hindi translations
const hi = {
  'common.home': 'होम',
  'common.menu': 'खाना ऑर्डर करें',
  'common.orderStatus': 'ऑर्डर स्थिति',
  'common.tourism': 'उज्जैन घूमें',
  'common.admin': 'प्रशासन पैनल',
  'common.language': 'भाषा',
  'common.darkMode': 'डार्क मोड',
  'common.cart': 'आपका ऑर्डर',
  'common.total': 'कुल',
  'common.placeOrder': 'ऑर्डर करें',
  'common.search': 'खोज',
  'common.loading': 'लोड हो रहा है...',
  'common.error': 'त्रुटि',
  'common.empty': 'कोई आइटम नहीं मिला',
  'common.save': 'सहेजें',
  'common.cancel': 'रद्द करें',
  'common.delete': 'हटाएं',
  'common.edit': 'संपादित करें',
  'common.actions': 'कार्रवाई',
  'common.logout': 'लॉगआउट',
  'common.login': 'लॉगिन',
  'common.required': 'आवश्यक',
  'common.optional': 'वैकल्पिक',
  
  'home.welcome': 'राय गेस्ट हाउस में आपका स्वागत है',
  'home.subtitle': 'अपने प्रवास के दौरान आराम और उत्कृष्ट सेवा का अनुभव करें',
  'home.orderCta': 'अभी खाना ऑर्डर करें',
  'home.features.title': 'हमारी सेवाएं',
  'home.features.menu': 'आपके कमरे तक स्वादिष्ट भोजन डिलिवरी',
  'home.features.tourism': 'उज्जैन शहर की सुंदरता का अन्वेषण करें',
  'home.features.order': 'रीयल-टाइम में अपने फूड ऑर्डर को ट्रैक करें',
  
  'menu.title': 'हमारा मेनू',
  'menu.emptyCart': 'आपकी कार्ट खाली है',
  'menu.guestName': 'अतिथि का नाम',
  'menu.roomNumber': 'कमरा नंबर',
  'menu.mobileNumber': 'मोबाइल नंबर',
  'menu.orderSuccess': 'आपका ऑर्डर सफलतापूर्वक दिया गया है',
  
  'orderStatus.title': 'ऑर्डर स्थिति जांचें',
  'orderStatus.checkStatus': 'स्थिति जांचें',
  'orderStatus.enterDetails': 'स्थिति जांचने के लिए अपना कमरा नंबर या मोबाइल नंबर दर्ज करें',
  'orderStatus.pendingStatus': 'लंबित',
  'orderStatus.preparingStatus': 'तैयारी हो रही है',
  'orderStatus.deliveredStatus': 'पहुंचा दिया गया',
  'orderStatus.orderNotFound': 'प्रदान की गई जानकारी के साथ कोई ऑर्डर नहीं मिला',
  
  'tourism.title': 'उज्जैन घूमें',
  'tourism.distance': 'गेस्ट हाउस से दूरी',
  'tourism.viewMap': 'मानचित्र पर देखें',
  'tourism.filter.all': 'सभी',
  'tourism.filter.religious': 'धार्मिक',
  'tourism.filter.heritage': 'विरासत',
  'tourism.filter.romantic': 'रोमांटिक',
  'tourism.filter.educational': 'शैक्षिक',
  'tourism.noResults': 'चयनित फ़िल्टर से मेल खाने वाले कोई स्थान नहीं मिले',
  
  'admin.title': 'प्रशासन पैनल',
  'admin.dashboard': 'डैशबोर्ड',
  'admin.menuManager': 'मेनू प्रबंधक',
  'admin.orderSheet': 'ऑर्डर शीट',
  'admin.themeEditor': 'थीम एडिटर',
  'admin.tourismContent': 'पर्यटन सामग्री',
  'admin.settings': 'सेटिंग्स',
  'admin.orderManagement': 'ऑर्डर प्रबंधन',
  'admin.addMenuItem': 'नया आइटम जोड़ें',
  'admin.addTourismPlace': 'नया स्थान जोड़ें',
  'admin.generalSettings': 'सामान्य सेटिंग्स',
  'admin.exportSettings': 'निर्यात सेटिंग्स',
  'admin.exportLimit': 'ऑर्डर इतिहास सीमा सेट करें',
  'admin.orderLimitDays': 'दिन की सीमा',
  'admin.orderLimitCount': 'ऑर्डर गिनती सीमा'
};

// Bengali translations
const bn = {
  'common.home': 'হোম',
  'common.menu': 'খাবার অর্ডার করুন',
  'common.orderStatus': 'অর্ডার স্ট্যাটাস',
  'common.tourism': 'উজ্জয়িনী ভ্রমণ করুন',
  'common.admin': 'অ্যাডমিন প্যানেল',
  'common.language': 'ভাষা',
  'common.darkMode': 'ডার্ক মোড',
  'common.cart': 'আপনার অর্ডার',
  'common.total': 'মোট',
  'common.placeOrder': 'অর্ডার করুন',
  'common.search': 'অনুসন্ধান',
  'common.loading': 'লোড হচ্ছে...',
  'common.error': 'ত্রুটি',
  'common.empty': 'কোন আইটেম পাওয়া যায়নি',
  'common.save': 'সংরক্ষণ করুন',
  'common.cancel': 'বাতিল করুন',
  'common.delete': 'মুছুন',
  'common.edit': 'সম্পাদনা করুন',
  'common.actions': 'ক্রিয়া',
  'common.logout': 'লগআউট',
  'common.login': 'লগইন',
  'common.required': 'প্রয়োজনীয়',
  'common.optional': 'ঐচ্ছিক',
  
  'menu.title': 'আমাদের মেনু',
  'menu.emptyCart': 'আপনার কার্ট খালি',
  'menu.guestName': 'অতিথির নাম',
  'menu.roomNumber': 'রুম নম্বর',
  'menu.mobileNumber': 'মোবাইল নম্বর',
  
  'tourism.title': 'উজ্জয়িনী ভ্রমণ করুন',
  'tourism.distance': 'গেস্ট হাউস থেকে দূরত্ব',
  'tourism.viewMap': 'মানচিত্রে দেখুন',
  'tourism.filter.all': 'সমস্ত',
  'tourism.filter.religious': 'ধর্মীয়',
  'tourism.filter.heritage': 'ঐতিহ্য',
  'tourism.filter.romantic': 'রোমান্টিক',
  'tourism.filter.educational': 'শিক্ষামূলক',
  'tourism.noResults': 'নির্বাচিত ফিল্টারের সাথে মিলে যাওয়া কোন স্থান পাওয়া যায়নি'
};

// Telugu translations
const te = {
  'common.home': 'హోమ్',
  'common.menu': 'ఆహారం ఆర్డర్ చేయండి',
  'common.orderStatus': 'ఆర్డర్ స్థితి',
  'common.tourism': 'ఉజ్జయిని అన్వేషించండి',
  'common.admin': 'నిర్వాహక ప్యానెల్',
  'common.language': 'భాష',
  'common.darkMode': 'డార్క్ మోడ్',
  'common.cart': 'మీ ఆర్డర్',
  'common.total': 'మొత్తం',
  'common.placeOrder': 'ఆర్డర్ చేయండి',
  
  'tourism.title': 'ఉజ్జయిని అన్వేషించండి',
  'tourism.distance': 'గెస్ట్ హౌస్ నుండి దూరం',
  'tourism.viewMap': 'మ్యాప్‌లో చూడండి',
  'tourism.filter.all': 'అన్నీ',
  'tourism.filter.religious': 'మతపరమైన',
  'tourism.filter.heritage': 'వారసత్వం',
  'tourism.filter.romantic': 'రొమాంటిక్',
  'tourism.filter.educational': 'విద్యాపరమైన',
  'tourism.noResults': 'ఎంచుకున్న ఫిల్టర్‌కు సరిపోలే ప్రదేశాలు కనుగొనబడలేదు'
};

// Tamil translations
const ta = {
  'common.home': 'முகப்பு',
  'common.menu': 'உணவு ஆர்டர் செய்யுங்கள்',
  'common.orderStatus': 'ஆர்டர் நிலை',
  'common.tourism': 'உஜ்ஜயினியை ஆராயுங்கள்',
  'common.admin': 'நிர்வாக பலகை',
  'common.language': 'மொழி',
  'common.darkMode': 'இருள் பயன்முறை',
  'common.cart': 'உங்கள் ஆர்டர்',
  'common.total': 'மொத்தம்',
  'common.placeOrder': 'ஆர்டர் செய்யுங்கள்',
  
  'tourism.title': 'உஜ்ஜயினியை ஆராயுங்கள்',
  'tourism.distance': 'விருந்தினர் இல்லத்திலிருந்து தூரம்',
  'tourism.viewMap': 'வரைபடத்தில் காண்க',
  'tourism.filter.all': 'அனைத்தும்',
  'tourism.filter.religious': 'மதம் சார்ந்த',
  'tourism.filter.heritage': 'பாரம்பரியம்',
  'tourism.filter.romantic': 'காதல்',
  'tourism.filter.educational': 'கல்வி சார்ந்த',
  'tourism.noResults': 'தேர்ந்தெடுக்கப்பட்ட வடிகட்டிக்கு பொருந்தும் இடங்கள் எதுவும் கிடைக்கவில்லை'
};

// Marathi translations
const mr = {
  'common.home': 'होम',
  'common.menu': 'जेवण ऑर्डर करा',
  'common.orderStatus': 'ऑर्डर स्थिती',
  'common.tourism': 'उज्जैन एक्सप्लोर करा',
  'common.admin': 'अॅडमिन पॅनेल',
  'common.language': 'भाषा',
  'common.darkMode': 'डार्क मोड',
  'common.cart': 'तुमचा ऑर्डर',
  'common.total': 'एकूण',
  'common.placeOrder': 'ऑर्डर करा',
  
  'tourism.title': 'उज्जैन एक्सप्लोर करा',
  'tourism.distance': 'गेस्ट हाऊसपासून अंतर',
  'tourism.viewMap': 'नकाशा पहा',
  'tourism.filter.all': 'सर्व',
  'tourism.filter.religious': 'धार्मिक',
  'tourism.filter.heritage': 'वारसा',
  'tourism.filter.romantic': 'रोमँटिक',
  'tourism.filter.educational': 'शैक्षणिक',
  'tourism.noResults': 'निवडलेल्या फिल्टरशी जुळणारी ठिकाणे सापडली नाहीत'
};

// Kannada translations
const kn = {
  'common.home': 'ಮುಖಪುಟ',
  'common.menu': 'ಆಹಾರ ಆರ್ಡರ್ ಮಾಡಿ',
  'common.orderStatus': 'ಆರ್ಡರ್ ಸ್ಥಿತಿ',
  'common.tourism': 'ಉಜ್ಜಯಿನಿ ಅನ್ವೇಷಿಸಿ',
  'common.admin': 'ನಿರ್ವಾಹಕ ಪ್ಯಾನೆಲ್',
  'common.language': 'ಭಾಷೆ',
  'common.darkMode': 'ಡಾರ್ಕ್ ಮೋಡ್',
  'common.cart': 'ನಿಮ್ಮ ಆರ್ಡರ್',
  'common.total': 'ಒಟ್ಟು',
  'common.placeOrder': 'ಆರ್ಡರ್ ಮಾಡಿ',
  
  'tourism.title': 'ಉಜ್ಜಯಿನಿ ಅನ್ವೇಷಿಸಿ',
  'tourism.distance': 'ಅತಿಥಿ ಗೃಹದಿಂದ ದೂರ',
  'tourism.viewMap': 'ನಕ್ಷೆಯಲ್ಲಿ ವೀಕ್ಷಿಸಿ',
  'tourism.filter.all': 'ಎಲ್ಲಾ',
  'tourism.filter.religious': 'ಧಾರ್ಮಿಕ',
  'tourism.filter.heritage': 'ಪರಂಪರೆ',
  'tourism.filter.romantic': 'ರೊಮ್ಯಾಂಟಿಕ್',
  'tourism.filter.educational': 'ಶೈಕ್ಷಣಿಕ',
  'tourism.noResults': 'ಆಯ್ಕೆ ಮಾಡಿದ ಫಿಲ್ಟರ್‌ಗೆ ಹೊಂದಿಕೆಯಾಗುವ ಸ್ಥಳಗಳು ಕಂಡುಬಂದಿಲ್ಲ'
};

// Gujarati translations
const gu = {
  'common.home': 'હોમ',
  'common.menu': 'ફૂડ ઓર્ડર કરો',
  'common.orderStatus': 'ઓર્ડર સ્થિતિ',
  'common.tourism': 'ઉજ્જૈન એક્સપ્લોર કરો',
  'common.admin': 'એડમિન પેનલ',
  'common.language': 'ભાષા',
  'common.darkMode': 'ડાર્ક મોડ',
  'common.cart': 'તમારો ઓર્ડર',
  'common.total': 'કુલ',
  'common.placeOrder': 'ઓર્ડર કરો',
  
  'tourism.title': 'ઉજ્જૈન એક્સપ્લોર કરો',
  'tourism.distance': 'ગેસ્ટ હાઉસથી અંતર',
  'tourism.viewMap': 'નકશા પર જુઓ',
  'tourism.filter.all': 'બધા',
  'tourism.filter.religious': 'ધાર્મિક',
  'tourism.filter.heritage': 'વારસો',
  'tourism.filter.romantic': 'રોમેન્ટિક',
  'tourism.filter.educational': 'શૈક્ષણિક',
  'tourism.noResults': 'પસંદ કરેલ ફિલ્ટરને અનુરૂપ કોઈ સ્થળો મળ્યા નથી'
};

// For non-English translations, use Partial to allow incomplete translations
type PartialTranslations = Partial<Record<TranslationKey, string>>;

// Collection of all translations
const translations: Record<string, PartialTranslations> = {
  en, // English is complete
  hi: hi as PartialTranslations,
  bn: bn as PartialTranslations,
  te: te as PartialTranslations,
  ta: ta as PartialTranslations,
  mr: mr as PartialTranslations,
  kn: kn as PartialTranslations,
  gu: gu as PartialTranslations
};

// Language names for the dropdown
export const languageNames = {
  en: 'English',
  hi: 'हिंदी (Hindi)',
  bn: 'বাংলা (Bengali)',
  te: 'తెలుగు (Telugu)',
  ta: 'தமிழ் (Tamil)',
  mr: 'मराठी (Marathi)',
  kn: 'ಕನ್ನಡ (Kannada)',
  gu: 'ગુજરાતી (Gujarati)'
};

// Get translation function
export function useTranslation(language: string) {
  // Default to English if the requested language isn't available
  const currentLanguage = translations[language] || translations.en;
  
  // Return a function that gets a translation by key
  return (key: TranslationKey): string => {
    return currentLanguage[key] || translations.en[key] || key;
  };
}