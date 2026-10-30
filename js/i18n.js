// Languages and translations.
// Homepage texts come unchanged from the current site (site-data.js).
// New texts: [en, bs, hr, sr (Latin, converted to Cyrillic), mk, sq].
// Montenegrin starts from Bosnian and Kosovo Albanian from Albanian; both are flagged for native review.
import { SITE, SLOGAN, GENERATIONS_HEAD, CONSENT_TEXT, CONFIRM_TEMPLATE } from './site-data.js';

export const LANGS = [
  { code: 'bs', short: 'BS', name: 'Bosanski', flag: 'ba', intl: 'bs' },
  { code: 'en', short: 'EN', name: 'English', flag: 'gb', intl: 'en' },
  { code: 'sr', short: 'SR', name: 'Српски (ћирилица)', flag: 'rs', intl: 'sr-Cyrl' },
  { code: 'hr', short: 'HR', name: 'Hrvatski', flag: 'hr', intl: 'hr' },
  { code: 'mk', short: 'MK', name: 'Македонски', flag: 'mk', intl: 'mk' },
  { code: 'sq', short: 'SQ', name: 'Shqip', flag: 'al', intl: 'sq' },
  { code: 'sq-XK', short: 'XK', name: 'Shqip (Kosovë)', flag: 'xk', intl: 'sq' },
  { code: 'cnr', short: 'ME', name: 'Crnogorski', flag: 'me', intl: 'sr-Latn-ME' }
];
const COL = { en: 0, bs: 1, hr: 2, sr: 3, mk: 4, sq: 5 };
export const DERIVED = { cnr: 'bs', 'sq-XK': 'sq' };

const T = {
  // common
  back: ['Back', 'Nazad', 'Natrag', 'Nazad', 'Назад', 'Kthehu'],
  next: ['Next', 'Dalje', 'Dalje', 'Dalje', 'Понатаму', 'Vazhdo'],
  cancel: ['Cancel', 'Odustani', 'Odustani', 'Odustani', 'Откажи', 'Anulo'],
  save: ['Save', 'Sačuvaj', 'Spremi', 'Sačuvaj', 'Зачувај', 'Ruaj'],
  saved: ['Saved.', 'Sačuvano.', 'Spremljeno.', 'Sačuvano.', 'Зачувано.', 'U ruajt.'],
  edit: ['Edit', 'Uredi', 'Uredi', 'Izmeni', 'Уреди', 'Ndrysho'],
  del: ['Delete', 'Obriši', 'Izbriši', 'Obriši', 'Избриши', 'Fshi'],
  close: ['Close', 'Zatvori', 'Zatvori', 'Zatvori', 'Затвори', 'Mbyll'],
  open: ['Open', 'Otvori', 'Otvori', 'Otvori', 'Отвори', 'Hap'],
  select: ['Select', 'Odaberi', 'Odaberi', 'Izaberi', 'Избери', 'Zgjidh'],
  optional: ['optional', 'neobavezno', 'neobavezno', 'neobavezno', 'незадолжително', 'opsionale'],
  signOut: ['Sign out', 'Odjava', 'Odjava', 'Odjava', 'Одјава', 'Dil'],
  myAccount: ['My account', 'Moj račun', 'Moj račun', 'Moj nalog', 'Мојот профил', 'Llogaria ime'],
  demoInbox: ['Demo inbox', 'Demo sanduče', 'Demo pretinac', 'Demo sanduče', 'Демо сандаче', 'Kutia demo'],
  openInbox: ['Open demo inbox', 'Otvori demo sanduče', 'Otvori demo pretinac', 'Otvori demo sanduče', 'Отвори демо сандаче', 'Hap kutinë demo'],
  inboxNote: ['Demo: emails arrive in the demo inbox at the bottom of the screen.', 'Demo: e-mailovi stižu u demo sanduče na dnu ekrana.', 'Demo: e-poruke stižu u demo pretinac na dnu zaslona.', 'Demo: e-poruke stižu u demo sanduče na dnu ekrana.', 'Демо: е-пораките пристигнуваат во демо сандачето на дното од екранот.', 'Demo: email-et vijnë në kutinë demo në fund të ekranit.'],
  female: ['Female', 'Žensko', 'Žensko', 'Žensko', 'Женско', 'Femër'],
  male: ['Male', 'Muško', 'Muško', 'Muško', 'Машко', 'Mashkull'],
  left: ['Left', 'Lijeva', 'Lijeva', 'Leva', 'Лева', 'E majta'],
  right: ['Right', 'Desna', 'Desna', 'Desna', 'Десна', 'E djathta'],
  footerRights: ['Private and independent platform. Only the administrator can see the full database.', 'Privatna i nezavisna platforma. Samo administrator vidi cjelokupnu bazu.', 'Privatna i neovisna platforma. Samo administrator vidi cjelokupnu bazu.', 'Privatna i nezavisna platforma. Samo administrator vidi celokupnu bazu.', 'Приватна и независна платформа. Само администраторот ја гледа целата база.', 'Platformë private dhe e pavarur. Vetëm administratori e sheh bazën e plotë.'],
  terms: ['Terms and Conditions', 'Uslovi korištenja', 'Uvjeti korištenja', 'Uslovi korišćenja', 'Услови за користење', 'Kushtet e përdorimit'],
  privacy: ['Privacy information', 'Informacije o privatnosti', 'Informacije o privatnosti', 'Informacije o privatnosti', 'Информации за приватност', 'Informacion për privatësinë'],
  legalPlaceholder: ['The final text is provided by the project owner after legal review. This placeholder shows where it appears and how acceptance is recorded.', 'Konačan tekst dostavlja vlasnik projekta nakon pravne provjere. Ovaj privremeni tekst pokazuje gdje se prikazuje i kako se bilježi prihvatanje.', 'Konačan tekst dostavlja vlasnik projekta nakon pravne provjere. Ovaj privremeni tekst pokazuje gdje se prikazuje i kako se bilježi prihvaćanje.', 'Konačan tekst dostavlja vlasnik projekta nakon pravne provere. Ovaj privremeni tekst pokazuje gde se prikazuje i kako se beleži prihvatanje.', 'Конечниот текст го доставува сопственикот на проектот по правна проверка. Овој привремен текст покажува каде се прикажува и како се евидентира прифаќањето.', 'Teksti përfundimtar jepet nga pronari i projektit pas shqyrtimit ligjor. Ky tekst i përkohshëm tregon ku shfaqet dhe si regjistrohet pranimi.'],
  version: ['Version', 'Verzija', 'Verzija', 'Verzija', 'Верзија', 'Versioni'],

  // about / parents / contact pages (texts from the current site, translated where missing)
  aboutTitle: ['About the platform', 'O platformi', 'O platformi', 'O platformi', 'За платформата', 'Rreth platformës'],
  aboutP1: ['A private platform connecting talent and information with strict access controls. Federations cannot access user profiles.', 'Privatna platforma za povezivanje talenata i informacija uz strogu kontrolu pristupa. Savezi nemaju pristup korisničkim profilima.', 'Privatna platforma za povezivanje talenata i informacija uz strogu kontrolu pristupa. Savezi nemaju pristup korisničkim profilima.', 'Privatna platforma za povezivanje talenata i informacija uz strogu kontrolu pristupa. Savezi nemaju pristup korisničkim profilima.', 'Приватна платформа за поврзување таленти и информации со строга контрола на пристапот. Федерациите немаат пристап до корисничките профили.', 'Platformë private që lidh talentet dhe informacionin me kontroll të rreptë të qasjes. Federatat nuk kanë qasje në profilet e përdoruesve.'],
  aboutP2: ['Every federation request is reviewed by the administrator. Data is never shared automatically.', 'Svaki zahtjev saveza pregledava isključivo administrator. Podaci se ne dijele automatski.', 'Svaki zahtjev saveza pregledava isključivo administrator. Podaci se ne dijele automatski.', 'Svaki zahtev saveza pregleda isključivo administrator. Podaci se ne dele automatski.', 'Секое барање од федерација го прегледува исклучиво администраторот. Податоците не се споделуваат автоматски.', 'Çdo kërkesë e federatës shqyrtohet vetëm nga administratori. Të dhënat nuk ndahen automatikisht.'],
  how1: ['Create a parent account', 'Napravite roditeljski račun', 'Izradite roditeljski račun', 'Napravite roditeljski nalog', 'Креирајте родителски профил', 'Krijoni llogarinë e prindit'],
  how2: ['Confirm your email with a code', 'Potvrdite e-mail kodom', 'Potvrdite e-poštu kodom', 'Potvrdite e-poštu kodom', 'Потврдете ја е-поштата со код', 'Konfirmoni email-in me kod'],
  how3: ['Accept the declarations', 'Prihvatite izjave', 'Prihvatite izjave', 'Prihvatite izjave', 'Прифатете ги изјавите', 'Pranoni deklaratat'],
  how4: ['Register one or more children', 'Registrujte jedno ili više djece', 'Registrirajte jedno ili više djece', 'Registrujte jedno ili više dece', 'Регистрирајте едно или повеќе деца', 'Regjistroni një ose më shumë fëmijë'],
  howTitle: ['How registration works', 'Kako funkcioniše registracija', 'Kako funkcionira registracija', 'Kako funkcioniše registracija', 'Како функционира регистрацијата', 'Si funksionon regjistrimi'],
  adultsToo: ['Players aged 18 or older register themselves, without a parent account.', 'Igrači sa 18 ili više godina registruju se sami, bez roditeljskog računa.', 'Igrači s 18 ili više godina registriraju se sami, bez roditeljskog računa.', 'Igrači sa 18 ili više godina registruju se sami, bez roditeljskog naloga.', 'Играчите на 18 или повеќе години се регистрираат сами, без родителски профил.', 'Lojtarët 18 vjeç e lart regjistrohen vetë, pa llogari prindi.'],
  parentsTitle: ['Parent registration', 'Registracija roditelja', 'Registracija roditelja', 'Registracija roditelja', 'Регистрација на родител', 'Regjistrimi i prindit'],
  parentsSub: ['Register once to manage profiles of children for whom you are the legal guardian.', 'Registrujte se jednom i upravljajte profilima sve djece za koju ste zakonski zastupnik.', 'Registrirajte se jednom i upravljajte profilima sve djece čiji ste zakonski zastupnik.', 'Registrujte se jednom i upravljajte profilima sve dece čiji ste zakonski zastupnik.', 'Регистрирајте се еднаш и управувајте со профилите на сите деца на кои сте законски застапник.', 'Regjistrohuni një herë dhe menaxhoni profilet e të gjithë fëmijëve për të cilët jeni kujdestar ligjor.'],
  contactKicker: ['CONTACT', 'KONTAKT', 'KONTAKT', 'KONTAKT', 'КОНТАКТ', 'KONTAKT'],
  contactTitle: ['Send a question', 'Pošaljite pitanje', 'Pošaljite pitanje', 'Pošaljite pitanje', 'Испратете прашање', 'Dërgoni një pyetje'],
  contactSub: ['Parents and external visitors can send an inquiry to the administrator.', 'Roditelji i vanjski posjetioci mogu poslati upit administratoru.', 'Roditelji i vanjski posjetitelji mogu poslati upit administratoru.', 'Roditelji i spoljni posetioci mogu poslati upit administratoru.', 'Родителите и надворешните посетители можат да испратат прашање до администраторот.', 'Prindërit dhe vizitorët e jashtëm mund t’i dërgojnë një pyetje administratorit.'],
  fullName: ['Full name', 'Ime i prezime', 'Ime i prezime', 'Ime i prezime', 'Име и презиме', 'Emri dhe mbiemri'],
  inquiryType: ['Type of inquiry', 'Vrsta upita', 'Vrsta upita', 'Vrsta upita', 'Вид на прашање', 'Lloji i pyetjes'],
  inqParent: ['Parent', 'Roditelj', 'Roditelj', 'Roditelj', 'Родител', 'Prind'],
  inqExternal: ['External inquiry', 'Vanjski upit', 'Vanjski upit', 'Spoljni upit', 'Надворешно прашање', 'Pyetje e jashtme'],
  message: ['Message', 'Poruka', 'Poruka', 'Poruka', 'Порака', 'Mesazhi'],
  sendMessage: ['Send message', 'Pošalji poruku', 'Pošalji poruku', 'Pošalji poruku', 'Испрати порака', 'Dërgo mesazhin'],
  messageSent: ['Message sent. The administrator replies by email.', 'Poruka je poslana. Administrator odgovara e-mailom.', 'Poruka je poslana. Administrator odgovara e-poštom.', 'Poruka je poslata. Administrator odgovara e-poštom.', 'Пораката е испратена. Администраторот одговара по е-пошта.', 'Mesazhi u dërgua. Administratori përgjigjet me email.'],

  // register choice + steps
  regTitle: ['Create an account', 'Napravite račun', 'Izradite račun', 'Napravite nalog', 'Креирајте профил', 'Krijoni një llogari'],
  regSub: ['Choose who is registering.', 'Odaberite ko se registruje.', 'Odaberite tko se registrira.', 'Izaberite ko se registruje.', 'Изберете кој се регистрира.', 'Zgjidhni kush po regjistrohet.'],
  regParent: ['I am a parent or legal guardian', 'Ja sam roditelj ili zakonski zastupnik', 'Ja sam roditelj ili zakonski zastupnik', 'Ja sam roditelj ili zakonski zastupnik', 'Јас сум родител или законски застапник', 'Jam prind ose kujdestar ligjor'],
  regParentD: ['Register one or more children under 18 with one account.', 'Registrujte jedno ili više djece mlađe od 18 godina jednim računom.', 'Registrirajte jedno ili više djece mlađe od 18 godina jednim računom.', 'Registrujte jedno ili više dece mlađe od 18 godina jednim nalogom.', 'Регистрирајте едно или повеќе деца помлади од 18 години со еден профил.', 'Regjistroni një ose më shumë fëmijë nën 18 vjeç me një llogari.'],
  regAdult: ['I am a player aged 18 or older', 'Ja sam igrač/igračica sa 18 ili više godina', 'Ja sam igrač/igračica s 18 ili više godina', 'Ja sam igrač/igračica sa 18 ili više godina', 'Јас сум играч/играчка на 18 или повеќе години', 'Jam lojtar/e 18 vjeç ose më shumë'],
  regAdultD: ['Register yourself, without a parent account.', 'Registrujte se sami, bez roditeljskog računa.', 'Registrirajte se sami, bez roditeljskog računa.', 'Registrujte se sami, bez roditeljskog naloga.', 'Регистрирајте се сами, без родителски профил.', 'Regjistrohuni vetë, pa llogari prindi.'],
  stepAccount: ['Account', 'Račun', 'Račun', 'Nalog', 'Профил', 'Llogaria'],
  stepEmail: ['Email', 'E-mail', 'E-pošta', 'E-pošta', 'Е-пошта', 'Email'],
  stepDecl: ['Declarations', 'Izjave', 'Izjave', 'Izjave', 'Изјави', 'Deklaratat'],
  stepReady: ['Ready', 'Gotovo', 'Gotovo', 'Gotovo', 'Готово', 'Gati'],
  stage1: ['STEP 1 · PARENT ACCOUNT', 'ETAPA 1 · RODITELJSKI RAČUN', 'KORAK 1 · RODITELJSKI RAČUN', 'KORAK 1 · RODITELJSKI NALOG', 'ЧЕКОР 1 · РОДИТЕЛСКИ ПРОФИЛ', 'HAPI 1 · LLOGARIA E PRINDIT'],
  stage1Adult: ['STEP 1 · PLAYER ACCOUNT', 'ETAPA 1 · RAČUN IGRAČA', 'KORAK 1 · RAČUN IGRAČA', 'KORAK 1 · NALOG IGRAČA', 'ЧЕКОР 1 · ПРОФИЛ НА ИГРАЧ', 'HAPI 1 · LLOGARIA E LOJTARIT'],
  adultTitle: ['Player registration (18+)', 'Registracija igrača (18+)', 'Registracija igrača (18+)', 'Registracija igrača (18+)', 'Регистрација на играч (18+)', 'Regjistrimi i lojtarit (18+)'],
  adultSub: ['Create your own account. You manage your profile yourself.', 'Napravite vlastiti račun. Svojim profilom upravljate sami.', 'Izradite vlastiti račun. Svojim profilom upravljate sami.', 'Napravite sopstveni nalog. Svojim profilom upravljate sami.', 'Креирајте свој профил. Со профилот управувате сами.', 'Krijoni llogarinë tuaj. Profilin e menaxhoni vetë.'],
  firstName: ['First name', 'Ime', 'Ime', 'Ime', 'Име', 'Emri'],
  lastName: ['Last name', 'Prezime', 'Prezime', 'Prezime', 'Презиме', 'Mbiemri'],
  birthDate: ['Date of birth', 'Datum rođenja', 'Datum rođenja', 'Datum rođenja', 'Датум на раѓање', 'Data e lindjes'],
  email: ['Email', 'E-mail', 'E-pošta', 'E-pošta', 'Е-пошта', 'Email'],
  username: ['Username', 'Korisničko ime', 'Korisničko ime', 'Korisničko ime', 'Корисничко име', 'Emri i përdoruesit'],
  password: ['Password', 'Lozinka', 'Lozinka', 'Lozinka', 'Лозинка', 'Fjalëkalimi'],
  passwordRepeat: ['Repeat password', 'Ponovite lozinku', 'Ponovite lozinku', 'Ponovite lozinku', 'Повторете ја лозинката', 'Përsëritni fjalëkalimin'],
  residence: ['Country of residence', 'Država boravka', 'Država boravišta', 'Država boravka', 'Држава на живеење', 'Shteti i banimit'],
  pwHint: ['At least 10 characters, upper and lower case and a number.', 'Najmanje 10 znakova, velika i mala slova i broj.', 'Najmanje 10 znakova, velika i mala slova i broj.', 'Najmanje 10 znakova, velika i mala slova i broj.', 'Најмалку 10 знаци, големи и мали букви и број.', 'Të paktën 10 karaktere, shkronja të mëdha e të vogla dhe një numër.'],
  pwWeak: ['Too weak', 'Preslaba', 'Preslaba', 'Preslaba', 'Преслаба', 'Shumë e dobët'],
  pwOk: ['Good', 'Dobra', 'Dobra', 'Dobra', 'Добра', 'E mirë'],
  pwStrong: ['Strong', 'Jaka', 'Jaka', 'Jaka', 'Силна', 'E fortë'],
  truthCheck: ['I confirm the information is true and that I am of legal age.', 'Potvrđujem da su podaci istiniti i da sam punoljetan/na.', 'Potvrđujem da su podaci istiniti i da sam punoljetan/na.', 'Potvrđujem da su podaci istiniti i da sam punoletan/na.', 'Потврдувам дека податоците се вистинити и дека сум полнолетен/на.', 'Konfirmoj se të dhënat janë të vërteta dhe se jam madhor/e.'],
  toVerify: ['Continue to verification →', 'Nastavi na verifikaciju →', 'Nastavi na provjeru →', 'Nastavi na verifikaciju →', 'Продолжи кон потврда →', 'Vazhdo te verifikimi →'],
  haveAccount: ['I already have an account · Sign in', 'Već imam račun · Prijava', 'Već imam račun · Prijava', 'Već imam nalog · Prijava', 'Веќе имам профил · Најава', 'Kam llogari · Hyr'],

  // validation
  vRequired: ['This field is required.', 'Ovo polje je obavezno.', 'Ovo polje je obavezno.', 'Ovo polje je obavezno.', 'Ова поле е задолжително.', 'Kjo fushë është e detyrueshme.'],
  vEmail: ['Enter a valid email address.', 'Unesite ispravnu e-mail adresu.', 'Unesite ispravnu adresu e-pošte.', 'Unesite ispravnu adresu e-pošte.', 'Внесете валидна адреса за е-пошта.', 'Shkruani një adresë email të vlefshme.'],
  vEmailTaken: ['An account with this email already exists.', 'Račun s ovom e-mail adresom već postoji.', 'Račun s ovom adresom e-pošte već postoji.', 'Nalog sa ovom adresom e-pošte već postoji.', 'Веќе постои профил со оваа е-пошта.', 'Ekziston tashmë një llogari me këtë email.'],
  vUserTaken: ['This username is already taken.', 'Ovo korisničko ime je zauzeto.', 'Ovo korisničko ime je zauzeto.', 'Ovo korisničko ime je zauzeto.', 'Ова корисничко име е зафатено.', 'Ky emër përdoruesi është i zënë.'],
  vUserFormat: ['3 to 30 characters: letters, numbers, dot or dash.', '3 do 30 znakova: slova, brojevi, tačka ili crtica.', '3 do 30 znakova: slova, brojevi, točka ili crtica.', '3 do 30 znakova: slova, brojevi, tačka ili crtica.', '3 до 30 знаци: букви, бројки, точка или цртичка.', '3 deri në 30 karaktere: shkronja, numra, pikë ose vizë.'],
  vPwWeak: ['The password is too weak.', 'Lozinka je preslaba.', 'Lozinka je preslaba.', 'Lozinka je preslaba.', 'Лозинката е преслаба.', 'Fjalëkalimi është shumë i dobët.'],
  vPwMatch: ['The passwords do not match.', 'Lozinke se ne podudaraju.', 'Lozinke se ne podudaraju.', 'Lozinke se ne poklapaju.', 'Лозинките не се совпаѓаат.', 'Fjalëkalimet nuk përputhen.'],
  vAdultOnly: ['You must be at least 18 years old.', 'Morate imati najmanje 18 godina.', 'Morate imati najmanje 18 godina.', 'Morate imati najmanje 18 godina.', 'Мора да имате најмалку 18 години.', 'Duhet të jeni të paktën 18 vjeç.'],
  vMinor: ['This form is for minors.', 'Ovaj upitnik je za maloljetne osobe.', 'Ovaj upitnik je za maloljetne osobe.', 'Ovaj upitnik je za maloletna lica.', 'Овој прашалник е за малолетници.', 'Ky formular është për të mitur.'],
  vGroup: ['HandballBridge covers birth years 2008 to 2013.', 'HandballBridge obuhvata godišta od 2008. do 2013.', 'HandballBridge obuhvaća godišta od 2008. do 2013.', 'HandballBridge obuhvata godišta od 2008. do 2013.', 'HandballBridge ги опфаќа годиштата од 2008 до 2013.', 'HandballBridge përfshin vitet e lindjes 2008 deri në 2013.'],
  vCitizen: ['Select at least one citizenship.', 'Označite najmanje jedno državljanstvo.', 'Označite najmanje jedno državljanstvo.', 'Označite najmanje jedno državljanstvo.', 'Означете најмалку едно државјанство.', 'Zgjidhni të paktën një shtetësi.'],
  vPosition: ['Select at least one position.', 'Označite najmanje jednu poziciju.', 'Označite najmanje jednu poziciju.', 'Označite najmanje jednu poziciju.', 'Означете најмалку една позиција.', 'Zgjidhni të paktën një pozicion.'],
  vDuplicate: ['This child is already registered on your account.', 'Ovo dijete je već registrovano na vašem računu.', 'Ovo dijete je već registrirano na vašem računu.', 'Ovo dete je već registrovano na vašem nalogu.', 'Ова дете веќе е регистрирано на вашиот профил.', 'Ky fëmijë është regjistruar tashmë në llogarinë tuaj.'],
  vConfirm: ['Please confirm to continue.', 'Potvrdite da biste nastavili.', 'Potvrdite kako biste nastavili.', 'Potvrdite da biste nastavili.', 'Потврдете за да продолжите.', 'Konfirmoni për të vazhduar.'],
  vDate: ['Enter a valid date.', 'Unesite ispravan datum.', 'Unesite ispravan datum.', 'Unesite ispravan datum.', 'Внесете валиден датум.', 'Shkruani një datë të vlefshme.'],
  vFix: ['Please check the marked fields.', 'Provjerite označena polja.', 'Provjerite označena polja.', 'Proverite označena polja.', 'Проверете ги означените полиња.', 'Kontrolloni fushat e shënuara.'],

  // email verification
  stage2: ['STEP 2 · EMAIL VERIFICATION', 'ETAPA 2 · VERIFIKACIJA E-MAILA', 'KORAK 2 · PROVJERA E-POŠTE', 'KORAK 2 · VERIFIKACIJA E-POŠTE', 'ЧЕКОР 2 · ПОТВРДА НА Е-ПОШТА', 'HAPI 2 · VERIFIKIMI I EMAIL-IT'],
  verifyTitle: ['Confirm your email', 'Potvrdite e-mail adresu', 'Potvrdite adresu e-pošte', 'Potvrdite adresu e-pošte', 'Потврдете ја е-поштата', 'Konfirmoni email-in'],
  verifySub: ['We sent a 6-digit code to {email}. It is valid for 15 minutes and can be used once.', 'Poslali smo šestocifreni kod na {email}. Vrijedi 15 minuta i može se iskoristiti jednom.', 'Poslali smo šesteroznamenkasti kod na {email}. Vrijedi 15 minuta i može se iskoristiti jednom.', 'Poslali smo šestocifreni kod na {email}. Važi 15 minuta i može se iskoristiti jednom.', 'Испративме шестцифрен код на {email}. Важи 15 минути и може да се искористи еднаш.', 'Dërguam një kod 6-shifror në {email}. Është i vlefshëm 15 minuta dhe përdoret një herë.'],
  verifyBtn: ['Confirm', 'Potvrdi', 'Potvrdi', 'Potvrdi', 'Потврди', 'Konfirmo'],
  resend: ['Send a new code', 'Pošalji novi kod', 'Pošalji novi kod', 'Pošalji novi kod', 'Испрати нов код', 'Dërgo kod të ri'],
  resendWait: ['New code possible in {s} s', 'Novi kod moguć za {s} s', 'Novi kod moguć za {s} s', 'Novi kod moguć za {s} s', 'Нов код можен за {s} с', 'Kod i ri pas {s} s'],
  resendLimit: ['Code limit reached. Try again in one hour.', 'Dostignut je limit kodova. Pokušajte ponovo za sat vremena.', 'Dosegnut je limit kodova. Pokušajte ponovno za sat vremena.', 'Dostignut je limit kodova. Pokušajte ponovo za sat vremena.', 'Достигнат е лимитот на кодови. Обидете се повторно за еден час.', 'U arrit kufiri i kodeve. Provoni sërish pas një ore.'],
  codeSent: ['A new code has been sent.', 'Novi kod je poslan.', 'Novi kod je poslan.', 'Novi kod je poslat.', 'Испратен е нов код.', 'U dërgua një kod i ri.'],
  codeWrong: ['Wrong code. {n} attempts left.', 'Pogrešan kod. Preostalo pokušaja: {n}.', 'Pogrešan kod. Preostalo pokušaja: {n}.', 'Pogrešan kod. Preostalo pokušaja: {n}.', 'Погрешен код. Преостанати обиди: {n}.', 'Kod i gabuar. Përpjekje të mbetura: {n}.'],
  codeExpired: ['This code has expired. Request a new one.', 'Kod je istekao. Zatražite novi.', 'Kod je istekao. Zatražite novi.', 'Kod je istekao. Zatražite novi.', 'Кодот истече. Побарајте нов.', 'Kodi ka skaduar. Kërkoni një të ri.'],
  codeLocked: ['Too many wrong attempts. Request a new code.', 'Previše pogrešnih pokušaja. Zatražite novi kod.', 'Previše pogrešnih pokušaja. Zatražite novi kod.', 'Previše pogrešnih pokušaja. Zatražite novi kod.', 'Премногу погрешни обиди. Побарајте нов код.', 'Shumë përpjekje të gabuara. Kërkoni kod të ri.'],
  codeNone: ['No active code. Request a new one.', 'Nema aktivnog koda. Zatražite novi.', 'Nema aktivnog koda. Zatražite novi.', 'Nema aktivnog koda. Zatražite novi.', 'Нема активен код. Побарајте нов.', 'Nuk ka kod aktiv. Kërkoni një të ri.'],
  codeDigits: ['Enter all 6 digits.', 'Unesite svih 6 cifara.', 'Unesite svih 6 znamenki.', 'Unesite svih 6 cifara.', 'Внесете ги сите 6 цифри.', 'Shkruani të 6 shifrat.'],
  emailVerified: ['Email confirmed.', 'E-mail je potvrđen.', 'E-pošta je potvrđena.', 'E-pošta je potvrđena.', 'Е-поштата е потврдена.', 'Email-i u konfirmua.'],

  // declarations
  stage3: ['STEP 3 · DECLARATIONS AND PRIVACY', 'ETAPA 3 · IZJAVE I PRIVATNOST', 'KORAK 3 · IZJAVE I PRIVATNOST', 'KORAK 3 · IZJAVE I PRIVATNOST', 'ЧЕКОР 3 · ИЗЈАВИ И ПРИВАТНОСТ', 'HAPI 3 · DEKLARATAT DHE PRIVATËSIA'],
  declTitle: ['Declarations and consent', 'Izjave i saglasnost', 'Izjave i privola', 'Izjave i saglasnost', 'Изјави и согласност', 'Deklaratat dhe pëlqimi'],
  declSub: ['Every confirmation is saved with your account, the date and time, the type and the document version.', 'Svaka potvrda se čuva uz vaš račun, datum i vrijeme, vrstu i verziju dokumenta.', 'Svaka se potvrda sprema uz vaš račun, datum i vrijeme, vrstu i verziju dokumenta.', 'Svaka potvrda se čuva uz vaš nalog, datum i vreme, vrstu i verziju dokumenta.', 'Секоја потврда се чува со вашиот профил, датумот и времето, видот и верзијата на документот.', 'Çdo konfirmim ruhet me llogarinë tuaj, datën dhe orën, llojin dhe versionin e dokumentit.'],
  declGuardian: ['I confirm that I am the parent or legal guardian of the children I register and have the authority to provide their data.', 'Potvrđujem da sam roditelj ili zakonski zastupnik djece koju registrujem i da imam ovlaštenje da dam njihove podatke.', 'Potvrđujem da sam roditelj ili zakonski zastupnik djece koju registriram i da imam ovlast dati njihove podatke.', 'Potvrđujem da sam roditelj ili zakonski zastupnik dece koju registrujem i da imam ovlašćenje da dam njihove podatke.', 'Потврдувам дека сум родител или законски застапник на децата што ги регистрирам и дека имам овластување да ги дадам нивните податоци.', 'Konfirmoj se jam prind ose kujdestar ligjor i fëmijëve që regjistroj dhe kam autoritetin të jap të dhënat e tyre.'],
  declSelf: ['I confirm that the data is my own and true.', 'Potvrđujem da su podaci moji i istiniti.', 'Potvrđujem da su podaci moji i istiniti.', 'Potvrđujem da su podaci moji i istiniti.', 'Потврдувам дека податоците се мои и вистинити.', 'Konfirmoj se të dhënat janë të miat dhe të vërteta.'],
  declTerms: ['I have read and accept the Terms and Conditions.', 'Pročitao/la sam i prihvatam Uslove korištenja.', 'Pročitao/la sam i prihvaćam Uvjete korištenja.', 'Pročitao/la sam i prihvatam Uslove korišćenja.', 'Ги прочитав и ги прифаќам Условите за користење.', 'I kam lexuar dhe i pranoj Kushtet e përdorimit.'],
  declPrivacy: ['I have read the Privacy information.', 'Pročitao/la sam Informacije o privatnosti.', 'Pročitao/la sam Informacije o privatnosti.', 'Pročitao/la sam Informacije o privatnosti.', 'Ги прочитав Информациите за приватност.', 'E kam lexuar Informacionin për privatësinë.'],
  declFed: ['Separate consent (optional): data may be passed to a national handball federation, only after the request is reviewed and the administrator decides.', 'Posebna saglasnost (neobavezno): podaci se mogu dostaviti nacionalnom rukometnom savezu, samo nakon provjere zahtjeva i odluke administratora.', 'Posebna privola (neobavezno): podaci se mogu dostaviti nacionalnom rukometnom savezu, samo nakon provjere zahtjeva i odluke administratora.', 'Posebna saglasnost (neobavezno): podaci se mogu dostaviti nacionalnom rukometnom savezu, samo nakon provere zahteva i odluke administratora.', 'Посебна согласност (незадолжително): податоците може да се достават до национална ракометна федерација, само по проверка на барањето и одлука на администраторот.', 'Pëlqim i veçantë (opsional): të dhënat mund t’i jepen një federate kombëtare të hendbollit, vetëm pas shqyrtimit të kërkesës dhe vendimit të administratorit.'],
  read: ['Read', 'Pročitaj', 'Pročitaj', 'Pročitaj', 'Прочитај', 'Lexo'],
  activate: ['Confirm and activate account', 'Potvrdi i aktiviraj račun', 'Potvrdi i aktiviraj račun', 'Potvrdi i aktiviraj nalog', 'Потврди и активирај профил', 'Konfirmo dhe aktivizo llogarinë'],
  activated: ['Your account is active.', 'Vaš račun je aktivan.', 'Vaš račun je aktivan.', 'Vaš nalog je aktivan.', 'Вашиот профил е активен.', 'Llogaria juaj është aktive.'],

  // login + reset
  stageLogin: ['SIGN IN', 'PRIJAVA', 'PRIJAVA', 'PRIJAVA', 'НАЈАВА', 'HYRJA'],
  loginTitle: ['User sign in', 'Prijava korisnika', 'Prijava korisnika', 'Prijava korisnika', 'Најава на корисник', 'Hyrja e përdoruesit'],
  loginSub: ['Parents and adult players sign in here.', 'Ovdje se prijavljuju roditelji i punoljetni igrači.', 'Ovdje se prijavljuju roditelji i punoljetni igrači.', 'Ovde se prijavljuju roditelji i punoletni igrači.', 'Тука се најавуваат родителите и полнолетните играчи.', 'Këtu hyjnë prindërit dhe lojtarët madhorë.'],
  loginId: ['Username or email', 'Korisničko ime ili e-mail', 'Korisničko ime ili e-pošta', 'Korisničko ime ili e-pošta', 'Корисничко име или е-пошта', 'Emri i përdoruesit ose email-i'],
  signIn: ['Sign in', 'Prijavi se', 'Prijavi se', 'Prijavi se', 'Најави се', 'Hyr'],
  forgot: ['Forgotten password', 'Zaboravljena lozinka', 'Zaboravljena lozinka', 'Zaboravljena lozinka', 'Заборавена лозинка', 'Fjalëkalim i harruar'],
  noAccount: ['No account yet · Register', 'Nemam račun · Registracija', 'Nemam račun · Registracija', 'Nemam nalog · Registracija', 'Немам профил · Регистрација', 'Nuk kam llogari · Regjistrohu'],
  loginWrong: ['Wrong username or password. {n} attempts left.', 'Pogrešno korisničko ime ili lozinka. Preostalo pokušaja: {n}.', 'Pogrešno korisničko ime ili lozinka. Preostalo pokušaja: {n}.', 'Pogrešno korisničko ime ili lozinka. Preostalo pokušaja: {n}.', 'Погрешно корисничко име или лозинка. Преостанати обиди: {n}.', 'Emër përdoruesi ose fjalëkalim i gabuar. Përpjekje të mbetura: {n}.'],
  loginLocked: ['Too many attempts. Try again in {s} seconds.', 'Previše pokušaja. Pokušajte ponovo za {s} sekundi.', 'Previše pokušaja. Pokušajte ponovno za {s} sekundi.', 'Previše pokušaja. Pokušajte ponovo za {s} sekundi.', 'Премногу обиди. Обидете се повторно за {s} секунди.', 'Shumë përpjekje. Provoni sërish pas {s} sekondash.'],
  inactiveAcc: ['This account is deactivated. Please contact the administrator.', 'Ovaj račun je deaktiviran. Kontaktirajte administratora.', 'Ovaj račun je deaktiviran. Obratite se administratoru.', 'Ovaj nalog je deaktiviran. Kontaktirajte administratora.', 'Овој профил е деактивиран. Контактирајте го администраторот.', 'Kjo llogari është çaktivizuar. Kontaktoni administratorin.'],
  demoLogin: ['Demo accounts', 'Demo računi', 'Demo računi', 'Demo nalozi', 'Демо профили', 'Llogari demo'],
  fill: ['Fill in', 'Popuni', 'Popuni', 'Popuni', 'Пополни', 'Plotëso'],
  forgotTitle: ['Reset password', 'Nova lozinka', 'Nova lozinka', 'Nova lozinka', 'Нова лозинка', 'Rivendos fjalëkalimin'],
  forgotSub: ['Enter your email. We send a code to set a new password.', 'Unesite e-mail. Poslat ćemo kod za postavljanje nove lozinke.', 'Unesite e-poštu. Poslat ćemo kod za postavljanje nove lozinke.', 'Unesite e-poštu. Poslaćemo kod za postavljanje nove lozinke.', 'Внесете ја е-поштата. Ќе испратиме код за нова лозинка.', 'Shkruani email-in. Ju dërgojmë një kod për fjalëkalim të ri.'],
  sendCode: ['Send code', 'Pošalji kod', 'Pošalji kod', 'Pošalji kod', 'Испрати код', 'Dërgo kodin'],
  resetNote: ['If an account exists for this email, a code is on its way.', 'Ako za ovaj e-mail postoji račun, kod je poslan.', 'Ako za ovu e-poštu postoji račun, kod je poslan.', 'Ako za ovu e-poštu postoji nalog, kod je poslat.', 'Ако постои профил за оваа е-пошта, кодот е испратен.', 'Nëse ekziston një llogari për këtë email, kodi është dërguar.'],
  newPassword: ['New password', 'Nova lozinka', 'Nova lozinka', 'Nova lozinka', 'Нова лозинка', 'Fjalëkalimi i ri'],
  setPassword: ['Set new password', 'Postavi novu lozinku', 'Postavi novu lozinku', 'Postavi novu lozinku', 'Постави нова лозинка', 'Vendos fjalëkalimin e ri'],
  resetDone: ['Password changed. You can sign in now.', 'Lozinka je promijenjena. Sada se možete prijaviti.', 'Lozinka je promijenjena. Sada se možete prijaviti.', 'Lozinka je promenjena. Sada se možete prijaviti.', 'Лозинката е променета. Сега можете да се најавите.', 'Fjalëkalimi u ndryshua. Tani mund të hyni.'],
  code: ['Code', 'Kod', 'Kod', 'Kod', 'Код', 'Kodi'],

  // account
  hello: ['Hello, {name}', 'Zdravo, {name}', 'Bok, {name}', 'Zdravo, {name}', 'Здраво, {name}', 'Përshëndetje, {name}'],
  portalSub: ['Manage your account and your children’s profiles here.', 'Ovdje upravljate računom i profilima svoje djece.', 'Ovdje upravljate računom i profilima svoje djece.', 'Ovde upravljate nalogom i profilima svoje dece.', 'Тука управувате со профилот и профилите на вашите деца.', 'Këtu menaxhoni llogarinë dhe profilet e fëmijëve tuaj.'],
  portalSubAdult: ['Manage your account and your player profile here.', 'Ovdje upravljate računom i svojim profilom igrača.', 'Ovdje upravljate računom i svojim profilom igrača.', 'Ovde upravljate nalogom i svojim profilom igrača.', 'Тука управувате со профилот и вашиот профил на играч.', 'Këtu menaxhoni llogarinë dhe profilin tuaj të lojtarit.'],
  tabChildren: ['Children', 'Djeca', 'Djeca', 'Deca', 'Деца', 'Fëmijët'],
  tabMyProfile: ['Player profile', 'Profil igrača', 'Profil igrača', 'Profil igrača', 'Профил на играч', 'Profili i lojtarit'],
  tabDetails: ['My details', 'Moji podaci', 'Moji podaci', 'Moji podaci', 'Мои податоци', 'Të dhënat e mia'],
  tabConsents: ['Consents', 'Saglasnosti', 'Privole', 'Saglasnosti', 'Согласности', 'Pëlqimet'],
  tabPrivacy: ['Privacy and data', 'Privatnost i podaci', 'Privatnost i podaci', 'Privatnost i podaci', 'Приватност и податоци', 'Privatësia dhe të dhënat'],
  tabEvents: ['Camps and events', 'Kampovi i događaji', 'Kampovi i događanja', 'Kampovi i događaji', 'Кампови и настани', 'Kampe dhe ngjarje'],
  tabSecurity: ['Security', 'Sigurnost', 'Sigurnost', 'Bezbednost', 'Безбедност', 'Siguria'],
  addChild: ['Register a child', 'Registruj dijete', 'Registriraj dijete', 'Registruj dete', 'Регистрирај дете', 'Regjistro fëmijë'],
  addAnother: ['Register another child', 'Registruj još jedno dijete', 'Registriraj još jedno dijete', 'Registruj još jedno dete', 'Регистрирај уште едно дете', 'Regjistro një fëmijë tjetër'],
  noChildren: ['No children registered yet.', 'Još nema registrovane djece.', 'Još nema registrirane djece.', 'Još nema registrovane dece.', 'Сè уште нема регистрирани деца.', 'Ende nuk ka fëmijë të regjistruar.'],
  noChildrenD: ['Register your first child. It takes about three minutes.', 'Registrujte prvo dijete. Traje oko tri minute.', 'Registrirajte prvo dijete. Traje oko tri minute.', 'Registrujte prvo dete. Traje oko tri minuta.', 'Регистрирајте го првото дете. Трае околу три минути.', 'Regjistroni fëmijën e parë. Zgjat rreth tre minuta.'],
  stActive: ['Active', 'Aktivan', 'Aktivan', 'Aktivan', 'Активен', 'Aktiv'],
  stUnverified: ['Unverified', 'Neverifikovan', 'Neprovjeren', 'Neverifikovan', 'Непотврден', 'I paverifikuar'],
  stInactive: ['Deactivated', 'Deaktiviran', 'Deaktiviran', 'Deaktiviran', 'Деактивиран', 'I çaktivizuar'],
  stNoConsent: ['Consent withdrawn', 'Saglasnost povučena', 'Privola povučena', 'Saglasnost povučena', 'Согласноста е повлечена', 'Pëlqimi u tërhoq'],
  registered: ['Registered {date}', 'Registrovano {date}', 'Registrirano {date}', 'Registrovano {date}', 'Регистрирано {date}', 'Regjistruar më {date}'],
  profileId: ['Profile ID', 'ID profila', 'ID profila', 'ID profila', 'ID на профил', 'ID e profilit'],
  group: ['Birth-year group', 'Generacija', 'Generacija', 'Generacija', 'Генерација', 'Gjenerata'],
  downloadPdf: ['Consent PDF', 'PDF saglasnosti', 'PDF privole', 'PDF saglasnosti', 'PDF согласност', 'PDF e pëlqimit'],
  deleteProfile: ['Delete profile', 'Obriši profil', 'Izbriši profil', 'Obriši profil', 'Избриши профил', 'Fshi profilin'],
  delTitle: ['Delete the profile of {name}?', 'Obrisati profil: {name}?', 'Izbrisati profil: {name}?', 'Obrisati profil: {name}?', 'Да се избрише профилот на {name}?', 'Të fshihet profili i {name}?'],
  delText: ['The profile is removed permanently. Consent records are kept only as long as the law requires.', 'Profil se trajno uklanja. Evidencija saglasnosti čuva se samo onoliko koliko zakon zahtijeva.', 'Profil se trajno uklanja. Evidencija privola čuva se samo onoliko koliko zakon zahtijeva.', 'Profil se trajno uklanja. Evidencija saglasnosti čuva se samo onoliko koliko zakon zahteva.', 'Профилот трајно се отстранува. Евиденцијата за согласност се чува само колку што бара законот.', 'Profili hiqet përgjithmonë. Regjistrat e pëlqimit ruhen vetëm aq sa kërkon ligji.'],
  typeToConfirm: ['Type {w} to confirm', 'Upišite {w} za potvrdu', 'Upišite {w} za potvrdu', 'Upišite {w} za potvrdu', 'Напишете {w} за потврда', 'Shkruani {w} për të konfirmuar'],
  delWord: ['DELETE', 'OBRIŠI', 'IZBRIŠI', 'OBRIŠI', 'ИЗБРИШИ', 'FSHI'],
  deleted: ['Profile deleted.', 'Profil je obrisan.', 'Profil je izbrisan.', 'Profil je obrisan.', 'Профилот е избришан.', 'Profili u fshi.'],
  turns18: ['{name} turns 18 on {date}. Parental management then ends: {name} gets an invitation to take over the profile with an own account.', '{name} puni 18 godina {date}. Tada prestaje roditeljsko upravljanje: {name} dobija poziv da preuzme profil vlastitim računom.', '{name} navršava 18 godina {date}. Tada prestaje roditeljsko upravljanje: {name} dobiva poziv da preuzme profil vlastitim računom.', '{name} puni 18 godina {date}. Tada prestaje roditeljsko upravljanje: {name} dobija poziv da preuzme profil sopstvenim nalogom.', '{name} полни 18 години на {date}. Тогаш престанува родителското управување: {name} добива покана да го преземе профилот со свој профил.', '{name} mbush 18 vjeç më {date}. Atëherë përfundon menaxhimi prindëror: {name} merr ftesë ta marrë profilin me llogari të vetën.'],
  changePw: ['Change password', 'Promijeni lozinku', 'Promijeni lozinku', 'Promeni lozinku', 'Промени лозинка', 'Ndrysho fjalëkalimin'],
  currentPw: ['Current password', 'Trenutna lozinka', 'Trenutna lozinka', 'Trenutna lozinka', 'Тековна лозинка', 'Fjalëkalimi aktual'],
  pwChanged: ['Password changed.', 'Lozinka je promijenjena.', 'Lozinka je promijenjena.', 'Lozinka je promenjena.', 'Лозинката е променета.', 'Fjalëkalimi u ndryshua.'],
  pwWrongCurrent: ['The current password is wrong.', 'Trenutna lozinka nije ispravna.', 'Trenutna lozinka nije ispravna.', 'Trenutna lozinka nije ispravna.', 'Тековната лозинка не е точна.', 'Fjalëkalimi aktual është i gabuar.'],
  emailFixed: ['To change your email, contact the administrator.', 'Za promjenu e-maila kontaktirajte administratora.', 'Za promjenu e-pošte obratite se administratoru.', 'Za promenu e-pošte kontaktirajte administratora.', 'За промена на е-поштата контактирајте го администраторот.', 'Për të ndryshuar email-in, kontaktoni administratorin.'],
  consentHistory: ['Consent history', 'Historija saglasnosti', 'Povijest privola', 'Istorija saglasnosti', 'Историја на согласности', 'Historiku i pëlqimeve'],
  consentHistoryD: ['Every declaration you gave, with date, time and document version.', 'Sve izjave koje ste dali, s datumom, vremenom i verzijom dokumenta.', 'Sve izjave koje ste dali, s datumom, vremenom i verzijom dokumenta.', 'Sve izjave koje ste dali, sa datumom, vremenom i verzijom dokumenta.', 'Сите изјави што сте ги дале, со датум, време и верзија на документот.', 'Të gjitha deklaratat që keni dhënë, me datë, orë dhe version dokumenti.'],
  cGiven: ['Given', 'Data', 'Dana', 'Data', 'Дадена', 'Dhënë'],
  cWithdrawn: ['Withdrawn', 'Povučena', 'Povučena', 'Povučena', 'Повлечена', 'Tërhequr'],
  withdraw: ['Withdraw', 'Povuci', 'Povuci', 'Povuci', 'Повлечи', 'Tërhiq'],
  giveAgain: ['Give again', 'Daj ponovo', 'Daj ponovno', 'Daj ponovo', 'Дај повторно', 'Jep sërish'],
  withdrawQ: ['Withdraw this consent?', 'Povući ovu saglasnost?', 'Povući ovu privolu?', 'Povući ovu saglasnost?', 'Да се повлече оваа согласност?', 'Të tërhiqet ky pëlqim?'],
  withdrawD: ['Processing based on this consent stops. Withdrawal does not affect anything done before it.', 'Obrada na osnovu ove saglasnosti prestaje. Povlačenje ne utiče na ono što je urađeno ranije.', 'Obrada na temelju ove privole prestaje. Povlačenje ne utječe na ono što je učinjeno ranije.', 'Obrada na osnovu ove saglasnosti prestaje. Povlačenje ne utiče na ono što je urađeno ranije.', 'Обработката врз основа на оваа согласност престанува. Повлекувањето не влијае на она што е направено претходно.', 'Përpunimi në bazë të këtij pëlqimi ndalet. Tërheqja nuk ndikon në atë që është bërë më parë.'],
  ctGuardian: ['Parent / guardian declaration', 'Izjava roditelja / zastupnika', 'Izjava roditelja / zastupnika', 'Izjava roditelja / zastupnika', 'Изјава на родител / застапник', 'Deklarata e prindit / kujdestarit'],
  ctSelf: ['Own data declaration', 'Izjava o vlastitim podacima', 'Izjava o vlastitim podacima', 'Izjava o sopstvenim podacima', 'Изјава за сопствени податоци', 'Deklarata për të dhënat vetjake'],
  ctTerms: ['Terms and Conditions', 'Uslovi korištenja', 'Uvjeti korištenja', 'Uslovi korišćenja', 'Услови за користење', 'Kushtet e përdorimit'],
  ctPrivacy: ['Privacy information', 'Informacije o privatnosti', 'Informacije o privatnosti', 'Informacije o privatnosti', 'Информации за приватност', 'Informacion për privatësinë'],
  ctFed: ['Federation sharing (separate)', 'Dostava savezu (posebno)', 'Dostava savezu (posebno)', 'Dostava savezu (posebno)', 'Достава до федерација (посебно)', 'Ndarja me federatën (veçmas)'],
  ctPlayer: ['Player consent', 'Saglasnost za igrača', 'Privola za igrača', 'Saglasnost za igrača', 'Согласност за играч', 'Pëlqimi për lojtarin'],
  dlData: ['Download my data', 'Preuzmi moje podatke', 'Preuzmi moje podatke', 'Preuzmi moje podatke', 'Преземи ги моите податоци', 'Shkarko të dhënat e mia'],
  dlDataD: ['Everything stored about you and your children, as a file.', 'Sve što je pohranjeno o vama i vašoj djeci, kao datoteka.', 'Sve što je pohranjeno o vama i vašoj djeci, kao datoteka.', 'Sve što je sačuvano o vama i vašoj deci, kao datoteka.', 'Сè што е зачувано за вас и вашите деца, како датотека.', 'Gjithçka e ruajtur për ju dhe fëmijët tuaj, si skedar.'],
  reqCorrection: ['Request a correction', 'Zatraži ispravku', 'Zatraži ispravak', 'Zatraži ispravku', 'Побарај исправка', 'Kërko korrigjim'],
  reqCorrectionD: ['Tell the administrator what is wrong. You can also edit most details yourself.', 'Napišite administratoru šta nije tačno. Većinu podataka možete urediti i sami.', 'Napišite administratoru što nije točno. Većinu podataka možete urediti i sami.', 'Napišite administratoru šta nije tačno. Većinu podataka možete izmeniti i sami.', 'Напишете му на администраторот што не е точно. Повеќето податоци можете да ги уредите и сами.', 'I shkruani administratorit çfarë nuk është në rregull. Shumicën e të dhënave mund t’i ndryshoni edhe vetë.'],
  delAccount: ['Delete my account', 'Obriši moj račun', 'Izbriši moj račun', 'Obriši moj nalog', 'Избриши го мојот профил', 'Fshi llogarinë time'],
  delAccountD: ['Removes your account and all linked player profiles.', 'Uklanja vaš račun i sve povezane profile igrača.', 'Uklanja vaš račun i sve povezane profile igrača.', 'Uklanja vaš nalog i sve povezane profile igrača.', 'Го отстранува вашиот профил и сите поврзани профили на играчи.', 'Heq llogarinë tuaj dhe të gjitha profilet e lidhura të lojtarëve.'],
  reqSent: ['Request sent to the administrator.', 'Zahtjev je poslan administratoru.', 'Zahtjev je poslan administratoru.', 'Zahtev je poslat administratoru.', 'Барањето е испратено до администраторот.', 'Kërkesa iu dërgua administratorit.'],
  whatWrong: ['What should be corrected?', 'Šta treba ispraviti?', 'Što treba ispraviti?', 'Šta treba ispraviti?', 'Што треба да се исправи?', 'Çfarë duhet korrigjuar?'],
  send: ['Send', 'Pošalji', 'Pošalji', 'Pošalji', 'Испрати', 'Dërgo'],
  accDeleted: ['Your account was deleted.', 'Vaš račun je obrisan.', 'Vaš račun je izbrisan.', 'Vaš nalog je obrisan.', 'Вашиот профил е избришан.', 'Llogaria juaj u fshi.'],

  // questionnaire (labels from the current form, translated where missing)
  qStage: ['STEP 4 · QUESTIONNAIRE', 'ETAPA 4 · UPITNIK', 'KORAK 4 · UPITNIK', 'KORAK 4 · UPITNIK', 'ЧЕКОР 4 · ПРАШАЛНИК', 'HAPI 4 · PYETËSORI'],
  qTitle: ['Child information', 'Podaci o djetetu', 'Podaci o djetetu', 'Podaci o detetu', 'Податоци за детето', 'Të dhënat e fëmijës'],
  qTitleAdult: ['Player information', 'Podaci o igraču', 'Podaci o igraču', 'Podaci o igraču', 'Податоци за играчот', 'Të dhënat e lojtarit'],
  qSub: ['Enter details for a child for whom you are the legal guardian.', 'Unesite podatke za dijete za koje ste zakonski zastupnik.', 'Unesite podatke za dijete čiji ste zakonski zastupnik.', 'Unesite podatke za dete čiji ste zakonski zastupnik.', 'Внесете податоци за дете на кое сте законски застапник.', 'Shkruani të dhënat për fëmijën për të cilin jeni kujdestar ligjor.'],
  qSubAdult: ['Enter your player details.', 'Unesite svoje podatke igrača.', 'Unesite svoje podatke igrača.', 'Unesite svoje podatke igrača.', 'Внесете ги вашите податоци како играч.', 'Shkruani të dhënat tuaja si lojtar.'],
  qName: ['Player full name', 'Ime i prezime igrača/igračice', 'Ime i prezime igrača/igračice', 'Ime i prezime igrača/igračice', 'Име и презиме на играчот/играчката', 'Emri dhe mbiemri i lojtarit/lojtares'],
  qGender: ['Gender', 'Spol', 'Spol', 'Pol', 'Пол', 'Gjinia'],
  qPlace: ['Place of birth', 'Mjesto rođenja', 'Mjesto rođenja', 'Mesto rođenja', 'Место на раѓање', 'Vendi i lindjes'],
  qBirthCountry: ['Country of birth', 'Država rođenja', 'Država rođenja', 'Država rođenja', 'Држава на раѓање', 'Shteti i lindjes'],
  qCitHint: ['Select current citizenships separately from those the child might be eligible for through parents. Potential citizenship is not confirmed citizenship and does not automatically imply national-team eligibility.', 'Odvojeno označite državljanstva koja dijete već ima i ona koja možda može steći preko roditelja. Potencijalno državljanstvo nije isto što i potvrđeno državljanstvo niti automatski znači pravo nastupa za reprezentaciju.', 'Odvojeno označite državljanstva koja dijete već ima i ona koja možda može steći preko roditelja. Potencijalno državljanstvo nije isto što i potvrđeno državljanstvo niti automatski znači pravo nastupa za reprezentaciju.', 'Odvojeno označite državljanstva koja dete već ima i ona koja možda može steći preko roditelja. Potencijalno državljanstvo nije isto što i potvrđeno državljanstvo niti automatski znači pravo nastupa za reprezentaciju.', 'Одделно означете ги државјанствата што детето веќе ги има и оние што можеби може да ги стекне преку родителите. Потенцијалното државјанство не е потврдено државјанство и не значи автоматски право на настап за репрезентацијата.', 'Shënoni veçmas shtetësitë që fëmija i ka tashmë dhe ato që mund t’i fitojë përmes prindërve. Shtetësia e mundshme nuk është shtetësi e konfirmuar dhe nuk nënkupton automatikisht të drejtën për të luajtur për kombëtaren.'],
  qCitizens: ['Citizenships', 'Državljanstva', 'Državljanstva', 'Državljanstva', 'Државјанства', 'Shtetësitë'],
  qCurrent: ['Current citizenships', 'Postojeća državljanstva', 'Postojeća državljanstva', 'Postojeća državljanstva', 'Постојни државјанства', 'Shtetësitë aktuale'],
  qCurrentHelp: ['Find a country and click it. Your selection stays visible. Search again to add another citizenship.', 'Pronađite državu i kliknite na nju. Izabrana država ostaje izdvojena. Za drugo državljanstvo ponovite pretragu.', 'Pronađite državu i kliknite na nju. Odabrana država ostaje izdvojena. Za drugo državljanstvo ponovite pretragu.', 'Pronađite državu i kliknite na nju. Izabrana država ostaje izdvojena. Za drugo državljanstvo ponovite pretragu.', 'Најдете ја државата и кликнете на неа. Избраната држава останува издвоена. За друго државјанство повторете го пребарувањето.', 'Gjeni shtetin dhe klikoni mbi të. Zgjedhja mbetet e dukshme. Për shtetësi tjetër kërkoni sërish.'],
  qFind: ['Find citizenship', 'Pronađi državljanstvo', 'Pronađi državljanstvo', 'Pronađi državljanstvo', 'Најди државјанство', 'Gjej shtetësinë'],
  qFindPh: ['Start typing a country…', 'Počni pisati naziv države…', 'Počni pisati naziv države…', 'Počni da kucaš naziv države…', 'Почни да пишуваш држава…', 'Fillo të shkruash një shtet…'],
  qSelected: ['Selected citizenships:', 'Odabrana državljanstva:', 'Odabrana državljanstva:', 'Izabrana državljanstva:', 'Избрани државјанства:', 'Shtetësitë e zgjedhura:'],
  qNoneYet: ['None selected yet.', 'Još nijedno nije odabrano.', 'Još nijedno nije odabrano.', 'Još nijedno nije izabrano.', 'Сè уште ништо не е избрано.', 'Ende asnjë e zgjedhur.'],
  qPotential: ['Potential citizenships through parents', 'Moguća državljanstva preko roditelja', 'Moguća državljanstva preko roditelja', 'Moguća državljanstva preko roditelja', 'Можни државјанства преку родителите', 'Shtetësi të mundshme përmes prindërve'],
  qBasis: ['Basis of potential citizenship', 'Osnov potencijalnog državljanstva', 'Osnova potencijalnog državljanstva', 'Osnov potencijalnog državljanstva', 'Основ на потенцијалното државјанство', 'Baza e shtetësisë së mundshme'],
  bMother: ['Mother', 'Majka', 'Majka', 'Majka', 'Мајка', 'Nëna'],
  bFather: ['Father', 'Otac', 'Otac', 'Otac', 'Татко', 'Babai'],
  bBoth: ['Both parents', 'Oba roditelja', 'Oba roditelja', 'Oba roditelja', 'Двата родители', 'Të dy prindërit'],
  bNA: ['Not applicable', 'Nije primjenjivo', 'Nije primjenjivo', 'Nije primenljivo', 'Не е применливо', 'Nuk zbatohet'],
  qParent1: ['First parent / guardian', 'Prvi roditelj / skrbnik', 'Prvi roditelj / skrbnik', 'Prvi roditelj / staratelj', 'Прв родител / старател', 'Prindi / kujdestari i parë'],
  qPhone1: ['First parent phone', 'Telefon prvog roditelja', 'Telefon prvog roditelja', 'Telefon prvog roditelja', 'Телефон на првиот родител', 'Telefoni i prindit të parë'],
  qEmail1: ['First parent email', 'E-mail prvog roditelja', 'E-pošta prvog roditelja', 'E-pošta prvog roditelja', 'Е-пошта на првиот родител', 'Email-i i prindit të parë'],
  qParent2: ['Second parent / guardian', 'Drugi roditelj / skrbnik', 'Drugi roditelj / skrbnik', 'Drugi roditelj / staratelj', 'Втор родител / старател', 'Prindi / kujdestari i dytë'],
  qPhone2: ['Second parent phone', 'Telefon drugog roditelja', 'Telefon drugog roditelja', 'Telefon drugog roditelja', 'Телефон на вториот родител', 'Telefoni i prindit të dytë'],
  qEmail2: ['Second parent email', 'E-mail drugog roditelja', 'E-pošta drugog roditelja', 'E-pošta drugog roditelja', 'Е-пошта на вториот родител', 'Email-i i prindit të dytë'],
  qPhone: ['Phone', 'Telefon', 'Telefon', 'Telefon', 'Телефон', 'Telefoni'],
  qClub: ['Club (e.g. in Germany)', 'Klub (npr. u Njemačkoj)', 'Klub (npr. u Njemačkoj)', 'Klub (npr. u Nemačkoj)', 'Клуб (на пр. во Германија)', 'Klubi (p.sh. në Gjermani)'],
  qClubEmail: ['Club email', 'E-mail kluba', 'E-pošta kluba', 'E-pošta kluba', 'Е-пошта на клубот', 'Email-i i klubit'],
  qHand: ['Playing hand', 'Ruka kojom igra', 'Ruka kojom igra', 'Ruka kojom igra', 'Рака со која игра', 'Dora me të cilën luan'],
  qPositions: ['Playing positions (multiple)', 'Igračke pozicije (može više)', 'Igračke pozicije (može više)', 'Igračke pozicije (može više)', 'Играчки позиции (може повеќе)', 'Pozicionet e lojës (më shumë se një)'],
  pos0: ['Goalkeeper', 'Golman', 'Vratar', 'Golman', 'Голман', 'Portier'],
  pos1: ['Left wing', 'Lijevo krilo', 'Lijevo krilo', 'Levo krilo', 'Лево крило', 'Krahu i majtë'],
  pos2: ['Right wing', 'Desno krilo', 'Desno krilo', 'Desno krilo', 'Десно крило', 'Krahu i djathtë'],
  pos3: ['Left back', 'Lijevi bek', 'Lijevi vanjski', 'Levi bek', 'Лев бек', 'Mbrojtës i majtë'],
  pos4: ['Right back', 'Desni bek', 'Desni vanjski', 'Desni bek', 'Десен бек', 'Mbrojtës i djathtë'],
  pos5: ['Centre back', 'Srednji bek', 'Srednji vanjski', 'Srednji bek', 'Среден бек', 'Qendërmbrojtës'],
  pos6: ['Pivot', 'Pivot', 'Kružni napadač', 'Pivot', 'Пивот', 'Pivot'],
  qLegal: ['I confirm I am this child’s parent or legal guardian.', 'Potvrđujem da sam roditelj ili zakonski zastupnik ovog djeteta.', 'Potvrđujem da sam roditelj ili zakonski zastupnik ovog djeteta.', 'Potvrđujem da sam roditelj ili zakonski zastupnik ovog deteta.', 'Потврдувам дека сум родител или законски застапник на ова дете.', 'Konfirmoj se jam prindi ose kujdestari ligjor i këtij fëmije.'],
  qSave: ['Save child profile', 'Sačuvaj profil djeteta', 'Spremi profil djeteta', 'Sačuvaj profil deteta', 'Зачувај профил на детето', 'Ruaj profilin e fëmijës'],
  qSaveAdult: ['Save my profile', 'Sačuvaj moj profil', 'Spremi moj profil', 'Sačuvaj moj profil', 'Зачувај го мојот профил', 'Ruaj profilin tim'],
  qDraft: ['Your draft is saved in this browser while you type.', 'Radni unos se automatski čuva u ovom browseru.', 'Radni unos automatski se sprema u ovom pregledniku.', 'Radni unos se automatski čuva u ovom pregledaču.', 'Работниот внес автоматски се зачувува во овој прелистувач.', 'Drafti ruhet automatikisht në këtë shfletues.'],
  reviewTitle: ['Check and confirm', 'Provjerite i potvrdite', 'Provjerite i potvrdite', 'Proverite i potvrdite', 'Проверете и потврдете', 'Kontrolloni dhe konfirmoni'],
  reviewSub: ['Please check the details. The profile is registered only after you confirm.', 'Provjerite podatke. Profil se registruje tek nakon vaše potvrde.', 'Provjerite podatke. Profil se registrira tek nakon vaše potvrde.', 'Proverite podatke. Profil se registruje tek nakon vaše potvrde.', 'Проверете ги податоците. Профилот се регистрира дури по вашата потврда.', 'Kontrolloni të dhënat. Profili regjistrohet vetëm pasi të konfirmoni.'],
  consentFor: ['Consent for this profile', 'Saglasnost za ovaj profil', 'Privola za ovaj profil', 'Saglasnost za ovaj profil', 'Согласност за овој профил', 'Pëlqimi për këtë profil'],
  iConsent: ['I give this consent.', 'Dajem ovu saglasnost.', 'Dajem ovu privolu.', 'Dajem ovu saglasnost.', 'Ја давам оваа согласност.', 'E jap këtë pëlqim.'],
  confirmRegister: ['Confirm and register', 'Potvrdi i registruj', 'Potvrdi i registriraj', 'Potvrdi i registruj', 'Потврди и регистрирај', 'Konfirmo dhe regjistro'],
  regDone: ['{name} is registered.', '{name} je registrovan/a.', '{name} je registriran/a.', '{name} je registrovan/a.', '{name} е регистриран/а.', '{name} u regjistrua.'],
  regDoneSub: ['A confirmation with the consent PDF was sent to {email}.', 'Potvrda sa PDF-om saglasnosti poslana je na {email}.', 'Potvrda s PDF-om privole poslana je na {email}.', 'Potvrda sa PDF-om saglasnosti poslata je na {email}.', 'Потврда со PDF согласност е испратена на {email}.', 'Një konfirmim me PDF-në e pëlqimit u dërgua në {email}.'],
  updated: ['Profile updated.', 'Profil je ažuriran.', 'Profil je ažuriran.', 'Profil je ažuriran.', 'Профилот е ажуриран.', 'Profili u përditësua.'],

  // emails
  mVerifySubj: ['Your verification code: {code}', 'Vaš verifikacijski kod: {code}', 'Vaš kod za provjeru: {code}', 'Vaš verifikacioni kod: {code}', 'Вашиот код за потврда: {code}', 'Kodi juaj i verifikimit: {code}'],
  mVerifyBody: ['Enter this code on HandballBridge to confirm your email. It is valid for 15 minutes and can be used once.', 'Unesite ovaj kod na HandballBridge da potvrdite e-mail. Vrijedi 15 minuta i može se iskoristiti jednom.', 'Unesite ovaj kod na HandballBridge za potvrdu e-pošte. Vrijedi 15 minuta i može se iskoristiti jednom.', 'Unesite ovaj kod na HandballBridge da potvrdite e-poštu. Važi 15 minuta i može se iskoristiti jednom.', 'Внесете го овој код на HandballBridge за да ја потврдите е-поштата. Важи 15 минути и може да се искористи еднаш.', 'Shkruani këtë kod në HandballBridge për të konfirmuar email-in. Është i vlefshëm 15 minuta dhe përdoret një herë.'],
  mIgnore: ['If you did not request this, you can ignore this email.', 'Ako niste vi zatražili, zanemarite ovaj e-mail.', 'Ako niste vi zatražili, zanemarite ovu poruku.', 'Ako niste vi zatražili, zanemarite ovu poruku.', 'Ако не сте вие побарале, игнорирајте ја оваа порака.', 'Nëse nuk e keni kërkuar ju, injorojeni këtë email.'],
  mRegSubj: ['Registration confirmed: {name}', 'Registracija potvrđena: {name}', 'Registracija potvrđena: {name}', 'Registracija potvrđena: {name}', 'Регистрацијата е потврдена: {name}', 'Regjistrimi u konfirmua: {name}'],
  mRegTitle: ['Profile registered', 'Profil je registrovan', 'Profil je registriran', 'Profil je registrovan', 'Профилот е регистриран', 'Profili u regjistrua'],
  mRegHow: ['Sign in at hb-talents.com → My account to view, edit or download the profile and the consent.', 'Prijavite se na hb-talents.com → Moj račun da pregledate, uredite ili preuzmete profil i saglasnost.', 'Prijavite se na hb-talents.com → Moj račun za pregled, uređivanje ili preuzimanje profila i privole.', 'Prijavite se na hb-talents.com → Moj nalog da pregledate, izmenite ili preuzmete profil i saglasnost.', 'Најавете се на hb-talents.com → Мојот профил за преглед, уредување или преземање на профилот и согласноста.', 'Hyni në hb-talents.com → Llogaria ime për të parë, ndryshuar ose shkarkuar profilin dhe pëlqimin.'],
  mRegAttach: ['The consent PDF is attached.', 'PDF saglasnosti je u prilogu.', 'PDF privole nalazi se u privitku.', 'PDF saglasnosti je u prilogu.', 'PDF согласноста е во прилог.', 'PDF-ja e pëlqimit është bashkëngjitur.'],
  mWelcomeSubj: ['Your HandballBridge account is active', 'Vaš HandballBridge račun je aktivan', 'Vaš HandballBridge račun je aktivan', 'Vaš HandballBridge nalog je aktivan', 'Вашиот HandballBridge профил е активен', 'Llogaria juaj HandballBridge është aktive'],
  mWelcomeBody: ['Your email is confirmed and your declarations are saved. You can now register player profiles.', 'Vaš e-mail je potvrđen, a izjave su sačuvane. Sada možete registrovati profile igrača.', 'Vaša e-pošta je potvrđena, a izjave su spremljene. Sada možete registrirati profile igrača.', 'Vaša e-pošta je potvrđena, a izjave su sačuvane. Sada možete registrovati profile igrača.', 'Вашата е-пошта е потврдена, а изјавите се зачувани. Сега можете да регистрирате профили на играчи.', 'Email-i juaj u konfirmua dhe deklaratat u ruajtën. Tani mund të regjistroni profile lojtarësh.'],
  mResetSubj: ['Password reset code: {code}', 'Kod za novu lozinku: {code}', 'Kod za novu lozinku: {code}', 'Kod za novu lozinku: {code}', 'Код за нова лозинка: {code}', 'Kodi për fjalëkalim të ri: {code}'],
  mResetBody: ['Use this code to set a new password. It is valid for 15 minutes.', 'Iskoristite ovaj kod za postavljanje nove lozinke. Vrijedi 15 minuta.', 'Iskoristite ovaj kod za postavljanje nove lozinke. Vrijedi 15 minuta.', 'Iskoristite ovaj kod za postavljanje nove lozinke. Važi 15 minuta.', 'Искористете го овој код за нова лозинка. Важи 15 минути.', 'Përdorni këtë kod për të vendosur fjalëkalim të ri. Është i vlefshëm 15 minuta.'],
  mPwSubj: ['Your password was changed', 'Vaša lozinka je promijenjena', 'Vaša lozinka je promijenjena', 'Vaša lozinka je promenjena', 'Вашата лозинка е променета', 'Fjalëkalimi juaj u ndryshua'],
  mPwBody: ['The password of your HandballBridge account was just changed. If this was not you, contact info@hb-talents.com right away.', 'Lozinka vašeg HandballBridge računa je upravo promijenjena. Ako to niste bili vi, odmah se javite na info@hb-talents.com.', 'Lozinka vašeg HandballBridge računa upravo je promijenjena. Ako to niste bili vi, odmah se javite na info@hb-talents.com.', 'Lozinka vašeg HandballBridge naloga je upravo promenjena. Ako to niste bili vi, odmah se javite na info@hb-talents.com.', 'Лозинката на вашиот HandballBridge профил штотуку е променета. Ако не сте биле вие, веднаш јавете се на info@hb-talents.com.', 'Fjalëkalimi i llogarisë suaj HandballBridge sapo u ndryshua. Nëse nuk ishit ju, shkruani menjëherë në info@hb-talents.com.'],
  mFooter: ['HandballBridge · hb-talents.com · You receive this email because an account was registered with this address.', 'HandballBridge · hb-talents.com · Ovaj e-mail primate jer je s ovom adresom registrovan račun.', 'HandballBridge · hb-talents.com · Ovu poruku primate jer je s ovom adresom registriran račun.', 'HandballBridge · hb-talents.com · Ovu poruku primate jer je sa ovom adresom registrovan nalog.', 'HandballBridge · hb-talents.com · Ја добивате оваа порака бидејќи со оваа адреса е регистриран профил.', 'HandballBridge · hb-talents.com · E merrni këtë email sepse me këtë adresë është regjistruar një llogari.'],

  // consent PDF
  pdfTitle: ['Consent and declaration', 'Saglasnost i izjava', 'Privola i izjava', 'Saglasnost i izjava', 'Согласност и изјава', 'Pëlqimi dhe deklarata'],
  pdfPlayer: ['Player', 'Igrač/igračica', 'Igrač/igračica', 'Igrač/igračica', 'Играч/играчка', 'Lojtari/lojtarja'],
  pdfGuardian: ['Parent / legal guardian', 'Roditelj / zakonski zastupnik', 'Roditelj / zakonski zastupnik', 'Roditelj / zakonski zastupnik', 'Родител / законски застапник', 'Prindi / kujdestari ligjor'],
  pdfSigned: ['Confirmed electronically by', 'Elektronski potvrdio/la', 'Elektronički potvrdio/la', 'Elektronski potvrdio/la', 'Електронски потврдил/а', 'Konfirmuar elektronikisht nga'],
  pdfWhen: ['Date and time', 'Datum i vrijeme', 'Datum i vrijeme', 'Datum i vreme', 'Датум и време', 'Data dhe ora'],
  pdfDeclarations: ['Recorded declarations', 'Evidentirane izjave', 'Evidentirane izjave', 'Evidentirane izjave', 'Евидентирани изјави', 'Deklaratat e regjistruara'],
  pdfRights: ['You can download your data, request a correction, withdraw a consent or delete the profile at any time under My account → Privacy and data.', 'U bilo kojem trenutku možete preuzeti podatke, zatražiti ispravku, povući saglasnost ili obrisati profil u Moj račun → Privatnost i podaci.', 'U bilo kojem trenutku možete preuzeti podatke, zatražiti ispravak, povući privolu ili izbrisati profil u Moj račun → Privatnost i podaci.', 'U bilo kom trenutku možete preuzeti podatke, zatražiti ispravku, povući saglasnost ili obrisati profil u Moj nalog → Privatnost i podaci.', 'Во секое време можете да ги преземете податоците, да побарате исправка, да ја повлечете согласноста или да го избришете профилот во Мојот профил → Приватност и податоци.', 'Në çdo kohë mund të shkarkoni të dhënat, të kërkoni korrigjim, të tërhiqni pëlqimin ose të fshini profilin te Llogaria ime → Privatësia dhe të dhënat.'],

  // Option B: account extras
  evNone: ['No invitations right now.', 'Trenutno nema poziva.', 'Trenutačno nema poziva.', 'Trenutno nema poziva.', 'Моментално нема покани.', 'Për momentin nuk ka ftesa.'],
  evAccept: ['Accept', 'Prihvati', 'Prihvati', 'Prihvati', 'Прифати', 'Prano'],
  evDecline: ['Decline', 'Odbij', 'Odbij', 'Odbij', 'Одбиј', 'Refuzo'],
  evAccepted: ['Accepted', 'Prihvaćeno', 'Prihvaćeno', 'Prihvaćeno', 'Прифатено', 'Pranuar'],
  evDeclined: ['Declined', 'Odbijeno', 'Odbijeno', 'Odbijeno', 'Одбиено', 'Refuzuar'],
  evFor: ['Invitation for {name}', 'Poziv za: {name}', 'Poziv za: {name}', 'Poziv za: {name}', 'Покана за: {name}', 'Ftesë për: {name}'],
  evAnswered: ['Your answer was sent to the organiser.', 'Vaš odgovor je poslan organizatoru.', 'Vaš je odgovor poslan organizatoru.', 'Vaš odgovor je poslat organizatoru.', 'Вашиот одговор е испратен до организаторот.', 'Përgjigjja juaj iu dërgua organizatorit.'],
  sec2fa: ['Two-step sign-in', 'Prijava u dva koraka', 'Prijava u dva koraka', 'Prijava u dva koraka', 'Најава во два чекора', 'Hyrja me dy hapa'],
  sec2faD: ['At every sign-in we also ask for a code sent to your email.', 'Pri svakoj prijavi tražimo i kod poslan na vaš e-mail.', 'Pri svakoj prijavi tražimo i kod poslan na vašu e-poštu.', 'Pri svakoj prijavi tražimo i kod poslat na vašu e-poštu.', 'При секоја најава бараме и код испратен на вашата е-пошта.', 'Në çdo hyrje kërkojmë edhe një kod të dërguar në email-in tuaj.'],
  secOn: ['On', 'Uključeno', 'Uključeno', 'Uključeno', 'Вклучено', 'Aktive'],
  secOff: ['Off', 'Isključeno', 'Isključeno', 'Isključeno', 'Исклучено', 'Joaktive'],
  secDevices: ['Recent sign-ins', 'Nedavne prijave', 'Nedavne prijave', 'Nedavne prijave', 'Неодамнешни најави', 'Hyrjet e fundit'],
  secDevicesD: ['We email you when your account is used on a new device.', 'Šaljemo vam e-mail kada se račun koristi na novom uređaju.', 'Šaljemo vam poruku kada se račun koristi na novom uređaju.', 'Šaljemo vam poruku kada se nalog koristi na novom uređaju.', 'Ви праќаме порака кога профилот се користи на нов уред.', 'Ju dërgojmë email kur llogaria përdoret në një pajisje të re.'],
  thisDevice: ['this device', 'ovaj uređaj', 'ovaj uređaj', 'ovaj uređaj', 'овој уред', 'kjo pajisje'],
  code2faTitle: ['Enter your sign-in code', 'Unesite kod za prijavu', 'Unesite kod za prijavu', 'Unesite kod za prijavu', 'Внесете го кодот за најава', 'Shkruani kodin e hyrjes'],
  mLoginSubj: ['Sign-in code: {code}', 'Kod za prijavu: {code}', 'Kod za prijavu: {code}', 'Kod za prijavu: {code}', 'Код за најава: {code}', 'Kodi i hyrjes: {code}'],
  mDeviceSubj: ['New sign-in to your account', 'Nova prijava na vaš račun', 'Nova prijava na vaš račun', 'Nova prijava na vaš nalog', 'Нова најава на вашиот профил', 'Hyrje e re në llogarinë tuaj'],
  mDeviceBody: ['Your account was just used on a new device: {device}. If this was you, nothing to do. If not, change your password right away.', 'Vaš račun je upravo korišten na novom uređaju: {device}. Ako ste to bili vi, ne trebate ništa raditi. Ako niste, odmah promijenite lozinku.', 'Vaš račun upravo je korišten na novom uređaju: {device}. Ako ste to bili vi, ne trebate ništa činiti. Ako niste, odmah promijenite lozinku.', 'Vaš nalog je upravo korišćen na novom uređaju: {device}. Ako ste to bili vi, ne treba ništa da radite. Ako niste, odmah promenite lozinku.', 'Вашиот профил штотуку е користен на нов уред: {device}. Ако сте биле вие, не треба ништо да правите. Ако не, веднаш сменете ја лозинката.', 'Llogaria juaj sapo u përdor në një pajisje të re: {device}. Nëse ishit ju, s’keni nevojë të bëni asgjë. Nëse jo, ndryshoni menjëherë fjalëkalimin.'],
  checkBanner: ['New season 2026/27: please confirm that the club and details of {name} are still correct.', 'Nova sezona 2026/27: potvrdite da su klub i podaci za {name} i dalje tačni.', 'Nova sezona 2026./27.: potvrdite da su klub i podaci za {name} i dalje točni.', 'Nova sezona 2026/27: potvrdite da su klub i podaci za {name} i dalje tačni.', 'Нова сезона 2026/27: потврдете дека клубот и податоците за {name} се сè уште точни.', 'Sezoni i ri 2026/27: konfirmoni se klubi dhe të dhënat e {name} janë ende të sakta.'],
  checkOk: ['Everything is correct', 'Sve je tačno', 'Sve je točno', 'Sve je tačno', 'Сè е точно', 'Gjithçka është në rregull'],
  checkUpdate: ['Update details', 'Ažuriraj podatke', 'Ažuriraj podatke', 'Ažuriraj podatke', 'Ажурирај податоци', 'Përditëso të dhënat'],
  checkDone: ['Thank you. Confirmed for season 2026/27.', 'Hvala. Potvrđeno za sezonu 2026/27.', 'Hvala. Potvrđeno za sezonu 2026./27.', 'Hvala. Potvrđeno za sezonu 2026/27.', 'Ви благодариме. Потврдено за сезоната 2026/27.', 'Faleminderit. U konfirmua për sezonin 2026/27.'],
  mCheckSubj: ['Season 2026/27: are the details of {name} still correct?', 'Sezona 2026/27: jesu li podaci za {name} i dalje tačni?', 'Sezona 2026./27.: jesu li podaci za {name} i dalje točni?', 'Sezona 2026/27: da li su podaci za {name} i dalje tačni?', 'Сезона 2026/27: дали податоците за {name} се сè уште точни?', 'Sezoni 2026/27: a janë ende të sakta të dhënat e {name}?'],
  mCheckBody: ['A new season starts. Please sign in and confirm the club and details with one click, or update them.', 'Počinje nova sezona. Prijavite se i jednim klikom potvrdite klub i podatke ili ih ažurirajte.', 'Počinje nova sezona. Prijavite se i jednim klikom potvrdite klub i podatke ili ih ažurirajte.', 'Počinje nova sezona. Prijavite se i jednim klikom potvrdite klub i podatke ili ih ažurirajte.', 'Започнува нова сезона. Најавете се и со еден клик потврдете ги клубот и податоците или ажурирајте ги.', 'Fillon një sezon i ri. Hyni dhe konfirmoni me një klik klubin dhe të dhënat, ose përditësojini.'],
  mEventSubj: ['Invitation: {event}', 'Poziv: {event}', 'Poziv: {event}', 'Poziv: {event}', 'Покана: {event}', 'Ftesë: {event}'],
  mEventBody: ['{name} is invited to {event} in {place} on {date}. Please answer in your account under Camps and events.', '{name} je pozvan/a na {event} u mjestu {place}, {date}. Odgovorite u svom računu pod Kampovi i događaji.', '{name} je pozvan/a na {event} u mjestu {place}, {date}. Odgovorite u svom računu pod Kampovi i događanja.', '{name} je pozvan/a na {event} u mestu {place}, {date}. Odgovorite u svom nalogu pod Kampovi i događaji.', '{name} е поканет/а на {event} во {place}, {date}. Одговорете во вашиот профил под Кампови и настани.', '{name} është ftuar në {event} në {place}, më {date}. Përgjigjuni në llogarinë tuaj te Kampe dhe ngjarje.'],
  extraB: ['Option B', 'Opcija B', 'Opcija B', 'Opcija B', 'Опција Б', 'Opsioni B'],
  mDeclSubj: ['Your declaration for HandballBridge', 'Vaša izjava za HandballBridge', 'Vaša izjava za HandballBridge', 'Vaša izjava za HandballBridge', 'Вашата изјава за HandballBridge', 'Deklarata juaj për HandballBridge'],
  mDeclBody: ['You confirmed the following declarations on HandballBridge. Please keep this email for your records.', 'Na HandballBridge ste potvrdili sljedeće izjave. Sačuvajte ovaj e-mail za svoju evidenciju.', 'Na HandballBridge ste potvrdili sljedeće izjave. Sačuvajte ovu poruku za svoju evidenciju.', 'Na HandballBridge ste potvrdili sledeće izjave. Sačuvajte ovu poruku za svoju evidenciju.', 'На HandballBridge ги потврдивте следните изјави. Зачувајте ја оваа порака за ваша евиденција.', 'Në HandballBridge konfirmuat deklaratat e mëposhtme. Ruajeni këtë email për evidencën tuaj.'],
  mDeclNext: ['When you register a child, you receive the signed consent for that child as a PDF.', 'Kada registrujete dijete, dobit ćete potpisanu saglasnost za to dijete kao PDF.', 'Kada registrirate dijete, dobit ćete potpisanu privolu za to dijete kao PDF.', 'Kada registrujete dete, dobićete potpisanu saglasnost za to dete kao PDF.', 'Кога ќе регистрирате дете, ќе ја добиете потпишаната согласност за тоа дете како PDF.', 'Kur regjistroni një fëmijë, merrni pëlqimin e nënshkruar për atë fëmijë si PDF.'],
  confirmedAt: ['Confirmed on {date}', 'Potvrđeno {date}', 'Potvrđeno {date}', 'Potvrđeno {date}', 'Потврдено на {date}', 'Konfirmuar më {date}']
};

// Montenegrin wording that differs from the Bosnian base
const CNR = {
  myAccount: 'Moj nalog', stepAccount: 'Nalog', haveAccount: 'Već imam nalog · Prijava', noAccount: 'Nemam nalog · Registracija',
  qPlace: 'Mjesto rođenja', qGender: 'Pol', pos0: 'Golman'
};

/* ---------- Serbian Latin to Cyrillic ---------- */
const CYR = { a: 'а', b: 'б', c: 'ц', č: 'ч', ć: 'ћ', d: 'д', đ: 'ђ', e: 'е', f: 'ф', g: 'г', h: 'х', i: 'и', j: 'ј', k: 'к', l: 'л', m: 'м', n: 'н', o: 'о', p: 'п', r: 'р', s: 'с', š: 'ш', t: 'т', u: 'у', v: 'в', z: 'з', ž: 'ж' };
const KEEP = /(\{[^}]+\}|https?:\/\/\S+|[\w.+-]+@[\w-]+\.[\w.-]+|hb-talents\.com|HandballBridge|PDF|CSV|Excel|ID)/;
function toCyr(s) {
  return s.split(KEEP).map((part, i) => i % 2 ? part : part
    .replace(/Dž|DŽ/g, 'Џ').replace(/dž/g, 'џ')
    .replace(/Lj|LJ/g, 'Љ').replace(/lj/g, 'љ')
    .replace(/Nj|NJ/g, 'Њ').replace(/nj/g, 'њ')
    .replace(/[a-zčćđšž]/gi, ch => {
      const low = ch.toLowerCase(), c = CYR[low];
      if (!c) return ch;
      return ch === low ? c : c.toUpperCase();
    })).join('');
}

/* ---------- state ---------- */
const LKEY = 'hbb.lang';
let current = (() => {
  try { const l = localStorage.getItem(LKEY); if (LANGS.some(x => x.code === l)) return l; } catch { /* ignore */ }
  return 'en';
})();
let overrides = {};   // admin translation edits: { lang: { key: text } }
const listeners = new Set();

export const lang = () => current;
export const langInfo = (l = current) => LANGS.find(x => x.code === l);
export function setLang(l) {
  if (!LANGS.some(x => x.code === l) || l === current) return;
  current = l;
  try { localStorage.setItem(LKEY, l); } catch { /* ignore */ }
  document.documentElement.lang = l === 'cnr' ? 'sr-Latn-ME' : l;
  listeners.forEach(f => f(l));
}
export const onLang = f => listeners.add(f);
export function setOverrides(o) { overrides = o || {}; }

// raw translation for a key in a language, before admin edits
export function baseText(key, l) {
  const row = T[key];
  if (!row) return null;
  if (l === 'cnr') return CNR[key] ?? row[COL.bs];
  if (l === 'sq-XK') return row[COL.sq];
  if (l === 'sr') return toCyr(row[COL.sr]);
  return row[COL[l]] ?? row[COL.en];
}
export function t(key, vars, l = current) {
  let s = overrides[l]?.[key] ?? baseText(key, l) ?? key;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] ?? m));
  return s;
}
export const KEYS = Object.keys(T);

// homepage texts from the current site, editable by the admin per language
export function site(key, l = current) {
  return overrides[l]?.['site.' + key] ?? SITE[l]?.[key] ?? SITE.en[key] ?? '';
}
export const SITE_KEYS = Object.keys(SITE.bs);
export const slogan = (l = current) => (SLOGAN[l] || SLOGAN.en).map((x, i) => overrides[l]?.['slogan.' + i] ?? x);
export const sloganBase = (l = current) => SLOGAN[l] || SLOGAN.en;
export const generationsHead = (l = current) => GENERATIONS_HEAD[l] || GENERATIONS_HEAD.en;

// consent statement: current site text (bs/en), translated for the other languages
const CONSENT_MORE = {
  hr: 'Ja, {RODITELJ}, kao roditelj / zakonski zastupnik maloljetnog djeteta {DIJETE}, dobrovoljno dajem privolu platformi HandballBridge za prikupljanje, obradu i pohranu podataka navedenih u upitniku radi vođenja i ažuriranja baze i statistike.\n\nDostavljanje podataka nacionalnim rukometnim savezima moguće je samo uz posebnu privolu, nakon provjere zahtjeva i odluke administratora.\n\nKada dijete navrši 18 godina, prestaje roditeljsko upravljanje maloljetničkim profilom. Predviđa se samostalna registracija punoljetne osobe te brisanje ili drugi zakonit postupak sa starim podacima u skladu s pravilima čuvanja.',
  sr: 'Ja, {RODITELJ}, kao roditelj / zakonski zastupnik maloletnog deteta {DIJETE}, dobrovoljno dajem saglasnost platformi HandballBridge za prikupljanje, obradu i čuvanje podataka navedenih u upitniku radi vođenja i ažuriranja baze i statistike.\n\nDostavljanje podataka nacionalnim rukometnim savezima moguće je samo uz posebnu saglasnost, nakon provere zahteva i odluke administratora.\n\nKada dete napuni 18 godina, prestaje roditeljsko upravljanje maloletničkim profilom. Predviđa se samostalna registracija punoletnog lica i brisanje ili drugi zakonit postupak sa starim podacima u skladu sa pravilima čuvanja.',
  mk: 'Јас, {RODITELJ}, како родител / законски застапник на малолетното дете {DIJETE}, доброволно давам согласност на платформата HandballBridge да ги собира, обработува и чува податоците наведени во прашалникот за водење и ажурирање на базата и статистиката.\n\nДоставување податоци до националните ракометни федерации е можно само со посебна согласност, по проверка на барањето и одлука на администраторот.\n\nКога детето ќе наполни 18 години, престанува родителското управување со малолетничкиот профил. Се предвидува самостојна регистрација на полнолетното лице и бришење или друга законска постапка со старите податоци во согласност со правилата за чување.',
  sq: 'Unë, {RODITELJ}, si prind / kujdestar ligjor i fëmijës së mitur {DIJETE}, jap vullnetarisht pëlqimin që platforma HandballBridge të mbledhë, përpunojë dhe ruajë të dhënat e pyetësorit për mbajtjen dhe përditësimin e bazës dhe statistikave.\n\nDhënia e të dhënave federatave kombëtare të hendbollit është e mundur vetëm me pëlqim të veçantë, pas shqyrtimit të kërkesës dhe vendimit të administratorit.\n\nKur fëmija mbush 18 vjeç, përfundon menaxhimi prindëror i profilit të të miturit. Parashikohet regjistrimi i pavarur i personit madhor dhe fshirja ose trajtimi tjetër i ligjshëm i të dhënave të vjetra sipas rregullave të ruajtjes.'
};
const CONSENT_ADULT = {
  en: 'I, {DIJETE}, voluntarily consent to HandballBridge collecting, processing and storing the data in the questionnaire for database and statistical purposes.\n\nDisclosure to national handball federations is subject to separate consent, request review and an administrator decision.',
  bs: 'Ja, {DIJETE}, dobrovoljno dajem saglasnost HandballBridge platformi za prikupljanje, obradu i pohranu podataka navedenih u upitniku radi vođenja i ažuriranja baze i statistike.\n\nDostavljanje podataka nacionalnim rukometnim savezima moguće je samo u okviru posebnog pristanka, nakon provjere zahtjeva i odluke administratora.',
  hr: 'Ja, {DIJETE}, dobrovoljno dajem privolu platformi HandballBridge za prikupljanje, obradu i pohranu podataka navedenih u upitniku radi vođenja i ažuriranja baze i statistike.\n\nDostavljanje podataka nacionalnim rukometnim savezima moguće je samo uz posebnu privolu, nakon provjere zahtjeva i odluke administratora.',
  sr: 'Ja, {DIJETE}, dobrovoljno dajem saglasnost platformi HandballBridge za prikupljanje, obradu i čuvanje podataka navedenih u upitniku radi vođenja i ažuriranja baze i statistike.\n\nDostavljanje podataka nacionalnim rukometnim savezima moguće je samo uz posebnu saglasnost, nakon provere zahteva i odluke administratora.',
  mk: 'Јас, {DIJETE}, доброволно давам согласност на платформата HandballBridge да ги собира, обработува и чува податоците наведени во прашалникот за водење и ажурирање на базата и статистиката.\n\nДоставување податоци до националните ракометни федерации е можно само со посебна согласност, по проверка на барањето и одлука на администраторот.',
  sq: 'Unë, {DIJETE}, jap vullnetarisht pëlqimin që platforma HandballBridge të mbledhë, përpunojë dhe ruajë të dhënat e pyetësorit për mbajtjen dhe përditësimin e bazës dhe statistikave.\n\nDhënia e të dhënave federatave kombëtare të hendbollit është e mundur vetëm me pëlqim të veçantë, pas shqyrtimit të kërkesës dhe vendimit të administratorit.'
};
const pick = (map, l) => map[l] ?? map[DERIVED[l]] ?? map.en;
// legal texts written by the administrator (privacy, terms, consent wording), per language
export const legalText = (kind, l = current) => overrides[l]?.['legal.' + kind] ?? null;
export function consentText({ parent, player, adult = false }, l = current) {
  const own = legalText(adult ? 'consentAdult' : 'consent', l);
  let s = own ?? (adult ? pick(CONSENT_ADULT, l) : pick({ ...CONSENT_TEXT, ...CONSENT_MORE }, l));
  if (!own && l === 'sr') s = toCyr(s);
  return s.replace('{RODITELJ}', parent || '').replace('{DIJETE}', player || '');
}
const CONFIRM_MORE = {
  hr: 'Vaš HandballBridge profil za {DIJETE} je evidentiran. U privitku su tekst privole i vaši izbori.',
  sr: 'Vaš HandballBridge profil za {DIJETE} je evidentiran. U prilogu su tekst saglasnosti i vaši izbori.',
  mk: 'Вашиот HandballBridge профил за {DIJETE} е евидентиран. Во прилог се текстот на согласноста и вашите избори.',
  sq: 'Profili juaj HandballBridge për {DIJETE} u regjistrua. Bashkëngjitur janë teksti i pëlqimit dhe zgjedhjet tuaja.'
};
export function confirmText(player, l = current) {
  let s = pick({ ...CONFIRM_TEMPLATE, ...CONFIRM_MORE }, l);
  if (l === 'sr') s = toCyr(s);
  return s.replace('{DIJETE}', player);
}

/* ---------- countries ---------- */
// Macedonian names for the countries used most on the platform (browser data for mk is often missing)
const MK = { BA: 'Босна и Херцеговина', HR: 'Хрватска', RS: 'Србија', ME: 'Црна Гора', AL: 'Албанија', XK: 'Косово', MK: 'Северна Македонија', NO: 'Норвешка', DE: 'Германија', AT: 'Австрија', CH: 'Швајцарија', SE: 'Шведска', DK: 'Данска', SI: 'Словенија', NL: 'Холандија', FR: 'Франција', IT: 'Италија', GB: 'Обединето Кралство', US: 'САД', TR: 'Турција', BE: 'Белгија', LU: 'Луксембург' };
const dnCache = {};
export function country(code, l = current) {
  if (!code) return '';
  if (l === 'mk' && MK[code]) return MK[code];
  const intl = langInfo(l)?.intl || 'en';
  try {
    dnCache[intl] ??= new Intl.DisplayNames([intl], { type: 'region' });
    return dnCache[intl].of(code) || code;
  } catch { return code; }
}

const asDate = v => { const m = typeof v === 'string' && /^(\d{4})-(\d{2})-(\d{2})$/.exec(v); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(v); };
export const fmtD = (ts, l = current) => {
  const intl = langInfo(l)?.intl || 'en';
  try { return asDate(ts).toLocaleDateString(intl === 'en' ? 'en-GB' : intl, { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return new Date(ts).toISOString().slice(0, 10); }
};
export const fmtDT = (ts, l = current) => {
  const intl = langInfo(l)?.intl || 'en';
  try { return new Date(ts).toLocaleString(intl === 'en' ? 'en-GB' : intl, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return new Date(ts).toISOString(); }
};
