# Next Word & Next Digit Predictor

Flask project: login/register + SQLite database + next-word aur next-digit prediction.

## Chalane ka tareeqa

```bash
pip install -r requirements.txt
python app.py
```

Phir browser me kholein: http://127.0.0.1:5000

1. Register karein, phir login.
2. **Prediction** box me text ya digits likhein (ya koi scenario) aur Predict dabayein.
   - "Aage kitne tokens" me number dein to model khud aage ka poora sequence generate karega.
3. **Train** box me apna data dein, model aap ke style ke hisab se predict karne lagega.
   Har user ka data alag hota hai.

## Files

| File | Kaam |
|------|------|
| `app.py` | Flask routes: login, register, dashboard, API |
| `database.py` | SQLite tables: users, training_data, predictions |
| `predictor.py` | N-gram model (backoff) word aur digit prediction ke liye |
| `templates/` | HTML pages |

## Model kaise kaam karta hai

N-gram (Markov) model: pichhle 1-3 words (digits ke liye 1-4) dekh kar dekhta hai ke
pehle kon sa token agay aaya tha. Lambe context ko zyada weight milta hai, na mile to
chhote context par backoff hota hai. Built-in sample data ke upar user ka data 3x weight
ke sath train hota hai.

Ye ek simple, samajhne me aasan model hai. Aage chaho to isay LSTM/Transformer
(PyTorch ya TensorFlow) se replace kar sakte ho, `predictor.py` ka interface wohi rahe ga.

## Security notes

- Passwords hashed store hote hain (werkzeug).
- Secret key pehli dafa `.secret_key` file me ban jati hai (ya `SECRET_KEY` env variable).
- Production me `debug=False` rakhein aur HTTPS use karein.
