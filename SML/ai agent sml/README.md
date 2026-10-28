# 🤖 AI Database Analyzer Agent (Sun'iy Intellekt Tahlilchisi)

Ushbu dastur ma'lumotlar bazasi faylini (`database.json` yoki `data.csv`) o'qib, OpenAI GPT modellari orqali ma'lumotlarni tahlil qiladi va savollaringizga aniq javob beradi.

---

## 📁 Qayerga ma'lumot tashlaysiz?

Siz o'z ma'lumotlaringizni to'g'ridan-to'g'ri quyidagi fayllardan biriga tashlashingiz mumkin:

1. **[data/database.json](file:///c:/Users/user/Desktop/ai/ai%20agent%20sml/data/database.json)** — JSON formatidagi ma'lumotlaringiz uchun (massiv yoki obyekt).
2. **[data/data.csv](file:///c:/Users/user/Desktop/ai/ai%20agent%20sml/data/data.csv)** — Excel/CSV jadval ma'lumotlaringiz uchun.

---

## ⚙️ Sozlash va Ishga tushirish

1. **[.env](file:///c:/Users/user/Desktop/ai/ai%20agent%20sml/.env)** faylini oching va OpenAI API kalitingizni kiriting:
   ```env
   OPENAI_API_KEY=sk-proj-sizning_openai_kalitingiz...
   OPENAI_MODEL=gpt-4o-mini
   ```

2. **AI Tahlilchini ishga tushiring:**
   ```bash
   npm start
   ```
   yoki
   ```bash
   npm run analyze
   ```

---

## 💡 Imkoniyatlari:

- **1. Avtomatik to'liq tahlil**: Barcha ko'rsatkichlar, qonuniyatlar, xatolar va biznes uchun tavsiyalar hisoboti.
- **2. Interaktiv Chat**: Ma'lumotlar bo'yicha AI'ga istalgan savolingizni berish (masalan: *"Eng ko'p foyda keltirgan mahsulot qaysi?"*, *"Mart oyi uchun prognoz ber"*).
