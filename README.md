# Habit Map

Habit Map, kişisel alışkanlıklarınızı takip etmenize, günlük ilerlemenizi kaydetmenize ve gelişiminizi görselleştirmenize yardımcı olan tam kapsamlı (full-stack) bir web uygulamasıdır.

## 🚀 Özellikler

- **Kullanıcı İşlemleri:** Kayıt olma ve güvenli giriş sistemi.
- **Alışkanlık Yönetimi:** Yeni alışkanlıklar ekleme, açıklama girme ve düzenleme.
- **Günlük Takip:** Alışkanlıklarınızı günlük olarak "tamamlandı" olarak işaretleme.
- **Görselleştirme:** Alışkanlık tamamlama geçmişinizi ısı haritası (heatmap) üzerinde görüntüleme.
- **İstatistikler:** İlerlemenizi takip edebileceğiniz raporlama ekranları.

## 🛠 Teknoloji Yığını

### Backend
- **Dil:** Python
- **Framework:** Flask
- **Veritabanı:** SQLite, SQLAlchemy
- **Araçlar:** Flask-Migrate, Flask-Cors

### Frontend
- **Dil/Kütüphane:** JavaScript, React
- **Build Aracı:** Vite
- **Stil & UI:** CSS, Lucide React (İkonlar), React Calendar Heatmap
- **HTTP İstemcisi:** Axios
- **Yönlendirme:** React Router DOM

## ⚙️ Kurulum ve Çalıştırma

Projeyi yerel makinenizde çalıştırmak için aşağıdaki adımları takip edin.

### Ön Hazırlıklar
- Python (3.12 veya üzeri önerilir)
- Node.js ve npm

### 1. Backend Kurulumu

Terminalinizi açın ve `backend` klasörüne gidin:

```bash
cd backend
```

Sanal ortamı (virtual environment) oluşturun ve aktif edin:

**Windows:**
```bash
python -m venv venv
.\venv\Scripts\activate
```

**macOS / Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

Gerekli Python paketlerini yükleyin:

```bash
pip install -r requirements.txt
```

Veritabanını oluşturun ve sunucuyu başlatın:

```bash
python main.py
```

Backend sunucusu varsayılan olarak `http://127.0.0.1:5000` adresinde çalışacaktır.

### 2. Frontend Kurulumu

Yeni bir terminal penceresi açın ve `frontend` klasörüne gidin:

```bash
cd frontend
```

Gerekli Node.js paketlerini yükleyin:

```bash
npm install
```

Geliştirme sunucusunu başlatın:

```bash
npm run dev
```

Terminalde verilen yerel adrese (genellikle `http://localhost:5173`) tarayıcınızdan giderek uygulamayı görüntüleyebilirsiniz.

## 📂 Proje Yapısı

```
Habit-Map/
├── backend/            # Python Flask Backend kodları
│   ├── app/            # Uygulama mantığı (modeller, rotalar)
│   ├── instance/       # SQLite veritabanı dosyası
│   ├── migrations/     # Veritabanı göç dosyaları
│   └── main.py         # Backend giriş noktası
│
├── frontend/           # React Frontend kodları
│   ├── src/            # React bileşenleri, sayfalar, hook'lar
│   └── public/         # Statik dosyalar
│
└── README.md           # Proje dokümantasyonu
```

