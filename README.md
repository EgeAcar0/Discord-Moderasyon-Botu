# Discord Moderasyon Botu

Gelişmiş Discord moderasyon ve yönetim botu. Prisma ORM, SQLite veritabanı ve modern Discord.js kütüphanesi ile geliştirilmiş kapsamlı bir moderasyon çözümü.

## ✨ Özellikler

### 🛡️ Moderasyon Araçları
- **Kullanıcı Yönetimi**: Ban, kick, timeout, warn sistemleri
- **Otomatik Filtreleme**: Küfür engelleme ve spam koruması
- **Rol Yönetimi**: Otomatik rol verme ve yetki sistemi
- **Loglama**: Tüm moderasyon eylemlerinin detaylı kaydı

### 📊 Kayıt Sistemi
- Kullanıcı kayıt ve doğrulama
- İsim/yaş kontrolü
- Kayıt geçmişi takibi
- Otomatik rol atama

### 🔧 Gelişmiş Özellikler
- **Web Dashboard**: Gerçek zamanlı yönetim paneli
- **Multi-Guild**: Birden fazla sunucu desteği
- **Rate Limiting**: Flood koruması
- **Anti-Spam**: Akıllı spam tespiti
- **Validasyon**: Güvenli input kontrolü

## 🚀 Kurulum

### Gereksinimler
- **Node.js** v16.9.0 veya üzeri
- **npm** veya **yarn**
- **Git**

### Adım 1: Projeyi Klonlayın
```bash
git clone <repository-url>
cd moderasyon
```

### Adım 2: Bağımlılıkları Yükleyin
```bash
npm install
```

### Adım 3: Ortam Değişkenlerini Ayarlayın
`.env` dosyası oluşturun:
```env
TOKEN=discord_bot_token
CLIENT_ID=bot_client_id
GUILD_ID=test_server_id
PREFIX=!
```

### Adım 4: Veritabanını Başlatın
```bash
npx prisma generate
npx prisma db push
```

### Adım 5: Botu Başlatın
```bash
# Geliştirme modu
npm run dev

# Sadece bot
npm start

# Dashboard ile birlikte
npm run dashboard
```

## 📂 Proje Yapısı

```
moderasyon/
├── commands/              # Komut dosyaları
│   ├── moderasyon/       # Moderasyon komutları (39 adet)
│   │   ├── bilgi/        # Bilgi komutları
│   │   ├── seslisustur/  # Sesli susturma
│   │   ├── timeout/      # Zaman aşımı
│   │   └── yazilisustur/ # Yazılı susturma
│   └── kayıt/           # Kayıt sistem komutları
├── utils/               # Yardımcı fonksiyonlar
│   ├── validation.js    # Input validasyonu
│   ├── rateLimit.js     # Rate limiting
│   ├── database.js      # Veritabanı işlemleri
│   ├── permissions.js   # Yetki kontrolü
│   └── antiSpam.js      # Spam koruması
├── prisma/              # Veritabanı şeması
├── generated/           # Otomatik oluşturulan dosyalar
├── web/                 # Web dashboard
├── config/              # Konfigürasyon dosyaları
└── logs/                # Log dosyaları
```

## 🗄️ Veritabanı Yapısı

### Tablolar
- **Ayarlar**: Sunucu ayarları ve rol ID'leri
- **Warn**: Kullanıcı uyarıları
- **Kayit**: Kayıt sistemi ayarları
- **Note**: Kullanıcı notları
- **KayitLog**: Kayıt işlemleri logları
- **BotLog**: Tüm bot olayları

### Özellikler
- SQLite veritabanı
- Prisma ORM
- İlişkisel veri yapısı
- Otomatik indeksleme

## 🎮 Komutlar

### Moderasyon Komutları
| Komut | Açıklama | Kullanım |
|-------|----------|----------|
| `/ban` | Kullanıcıyı yasakla | `/ban <kullanıcı> [sebep]` |
| `/kick` | Kullanıcıyı at | `/kick <kullanıcı> [sebep]` |
| `/warn` | Kullanıcıyı uyar | `/warn <kullanıcı> <sebep>` |
| `/timeout` | Kullanıcıyı sustur | `/timeout <kullanıcı> <süre> [sebep]` |
| `/purge` | Mesajları temizle | `/purge <miktar>` |
| `/lock` | Kanalı kilitle | `/lock <kanal>` |
| `/unlock` | Kanal kilidini aç | `/unlock <kanal>` |

### Kayıt Komutları
| Komut | Açıklama | Kullanım |
|-------|----------|----------|
| `/kayıtkur` | Kayıt sistemini kur | `/kayıtkur <giriş_rolü>` |
| `/kayıt` | Kullanıcıyı kayıt et | `/kayıt <kullanıcı> <isim> <yaş>` |
| `/kayıtal` | Kayıt sil | `/kayıtal <kullanıcı>` |
| `/kayıtdüzenle` | Kayıt düzenle | `/kayıtdüzenle <kullanıcı> <yeni_isim>` |

### Bilgi Komutları
| Komut | Açıklama |
|-------|----------|
| `/ping` | Bot ping süresi |
| `/user` | Kullanıcı bilgileri |
| `/server` | Sunucu bilgileri |
| `/roles` | Rol listesi |

### Yönetim Komutları
| Komut | Açıklama |
|-------|----------|
| `/ayarrol` | Rolleri ayarla |
| `/ayarkanal` | Kanalları ayarla |
| `/modpanel` | Moderasyon paneli |
| `/history` | Kullanıcı geçmişi |

## ⚙️ Konfigürasyon

### ayarlar.json Yapısı
```json
{
  "SUNUCU_ID": {
    "susturulmusRolId": "susturulmus_rol_id",
    "uyariRol1Id": "uyari_rol_1_id",
    "uyariRol2Id": "uyari_rol_2_id", 
    "uyariRol3Id": "uyari_rol_3_id",
    "olayLogKanalId": "olay_log_kanal_id",
    "davetLogKanalId": "davet_log_kanal_id",
    "ilkRolId": "ilk_rol_id",
    "yetkiliRol1Id": "yetkili_rol_1_id",
    "yetkiliRol2Id": "yetkili_rol_2_id",
    "yetkiliRol3Id": "yetkili_rol_3_id"
  }
}
```

## 🔧 Geliştirme

### Teknolojiler
- **discord.js@14.14.1** - Discord API
- **@prisma/client@7.0.1** - Veritabanı ORM
- **express@5.1.0** - Web sunucu
- **socket.io@4.7.2** - Real-time iletişim
- **sqlite3@5.1.6** - Veritabanı

### Geliştirme Komutları
```bash
# Veritabanı migrasyonu
npx prisma migrate dev

# Veritabanı studio
npx prisma studio

# Bağımlılık kontrolü
npm audit

# Güvenlik güncellemeleri
npm update
```

### Yeni Komut Ekleme
1. `commands/` klasörüne yeni dosya ekleyin
2. Discord.js slash komut formatını kullanın
3. Validasyon ve yetki kontrollerini ekleyin
4. Bot yeniden başlatıldığında komut otomatik yüklenir

## 🌐 Web Dashboard

Bot ile birlikte gelen web dashboard özellikleri:
- Gerçek zamanlı kullanıcı listesi
- Moderasyon logları
- Sunucu istatistikleri
- Komut geçmişi

Dashboard'a erişmek için:
```bash
npm run dashboard
# http://localhost:3000
```

## 🔒 Güvenlik

### ✅ Güvenlik Özellikleri
- Input validasyonu ve sanitizasyon
- Rate limiting koruması
- Anti-spam filtreleri
- SQL injection koruması (Prisma ORM)
- XSS koruması

### ⚠️ Güvenlik Notları
- **TOKEN'ınızı asla paylaşmayın!**
- `.env` dosyasını `.gitignore`'a ekleyin
- Güçlü şifreler kullanın
- Düzenli yedek alın

## 📊 İstatistikler

- **39** moderasyon komutu
- **6** veritabanı tablosu
- **5** yardımcı modül
- **Web dashboard** desteği
- **Multi-guild** desteği

## 🤝 Katkıda Bulunma

1. Fork'layın
2. Feature branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Commit yapın (`git commit -am 'Yeni özellik eklendi'`)
4. Push yapın (`git push origin feature/yeni-ozellik`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje **MIT Lisansı** altında dağıtılmaktadır.

## 🆘 Destek

Sorunlarınız için:
- GitHub Issues
- Discord sunucusu
- Dokümantasyon

---

**Bot Version**: 1.0.0  
**Discord.js**: v14.14.1  
**Node.js**: v16.9.0+  
**Database**: SQLite + Prisma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## Lisans

ISC License
