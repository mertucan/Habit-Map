from collections import defaultdict

def format_heatmap_data(logs):
    """
    HabitLog nesnelerinin bir listesini, ısı haritası görselleştirmesi için
    uygun bir sözlük formatına dönüştürür.
    
    Argümanlar:
        logs (list[HabitLog]): HabitLog nesnelerinin listesi.
        
    Döndürür:
        dict: Anahtarların tarih (YYYY-AA-GG) ve değerlerin sayı/yoğunluk olduğu bir sözlük.
              Örnek: { '2025-10-25': 1 }
    """
    heatmap_data = defaultdict(int)
    
    for log in logs:
        if log.completed:
            date_str = log.completion_date.isoformat()
            # Boolean tamamlama için sadece 1 olarak işaretleyebiliriz.
            # Eğer günde birden fazla kayıt mümkün olsaydı (örn. 3 kez su içildi), toplardık.
            # HabitLog modeli 'completed' boolean değerine sahiptir.
            # Her tamamlama olayı için bir günlük girişi varsayılıyor.
            heatmap_data[date_str] += 1
            
    return dict(heatmap_data)
