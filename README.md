# Discord Moderasyon Botu

Discord sunucuları için kapsamlı moderasyon botu. Otomatik küfür filtreleme, kullanıcı yönetimi, rol sistemi ve loglama özellikleri sunar.

## Özellikler

- ✅ Otomatik küfür filtreleme ve uyarı sistemi
- ✅ 39 adet moderasyon komutu
- ✅ Rol bazlı yetkilendirme
- ✅ Kapsamlı loglama (olay, davet, komut logları)
- ✅ Kayıt sistemi
- ✅ Çoklu sunucu desteği

## Kurulum

1. Repoyu klonlayın:
```bash
git clone <repository-url>
cd moderasyon
```

2. Dependencies yükleyin:
```bash
npm install
```

3. `.env` dosyası oluşturun:
```env
TOKEN=your_bot_token_here
CLIENT_ID=your_bot_client_id
GUILD_ID=your_test_server_id
```

4. Konfigürasyon dosyasını oluşturun:
```bash
cp ayarlar.json.example ayarlar.json
```
`ayarlar.json` dosyasını kendi sunucu ID'lerinize göre düzenleyin.

5. Botu başlatın:
```bash
node index.js
```

 veya PM2 ile:
```bash
pm2 start ecosystem.config.js
```

## Komutlar

### Moderasyon Komutları
- `/ban <kullanıcı> [sebep]` - Kullanıcıyı yasakla
- `/kick <kullanıcı> [sebep]` - Kullanıcıyı at
- `/warn <kullanıcı> <sebep>` - Kullanıcıyı uyar
- `/timeout <kullanıcı> <süre> [sebep]` - Kullanıcıyı sustur
- `/purge <miktar>` - Mesajları temizle

### Kayıt Komutları
- `/kayıtkur <rol>` - Kayıt sistemini kur
- `/kayıt <kullanıcı> <isim> <yaş>` - Kullanıcıyı kayıt et

### Bilgi Komutları
- `/ping` - Bot ping'i
- `/user <kullanıcı>` - Kullanıcı bilgisi
- `/server` - Sunucu bilgisi

## Konfigürasyon

### ayarlar.json Yapısı
```json
{
    "SUNUCU_ID": {
        "yetkiliRolIds": ["ROL_ID_1", "ROL_ID_2"],
        "susturulmusRolId": "SUSTURULMUS_ROL_ID",
        "uyariRol1Id": "UYARI_ROL_1_ID",
        "uyariRol2Id": "UYARI_ROL_2_ID",
        "uyariRol3Id": "UYARI_ROL_3_ID",
        "botKomutKanaliId": "BOT_KOMUT_KANALI_ID",
        "olayLogKanalId": "OLAY_LOG_KANALI_ID",
        "davetLogKanalId": "DAVET_LOG_KANALI_ID",
        "botrolId": "BOT_ROL_ID"
    }
}
```

## Güvenlik Notları

⚠️ **ÖNEMLİ**: Bot token'ınızı asla paylaşmayın! `.env` dosyasını `.gitignore`'a ekledik.

## Geliştirme

### Komut Ekleme
Yeni komutlar `commands/` klasörüne eklenir. Discord.js slash komut formatını kullanın.

### Loglama
Tüm moderasyon eylemleri otomatik olarak loglanır. Log kanallarını `ayarlar.json`'dan yapılandırın.

## Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## Lisans

ISC License
