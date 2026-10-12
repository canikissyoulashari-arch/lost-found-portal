"""
Next-word aur next-digit predictor.

Model: n-gram (Markov) model with backoff.
- Word model: pichhle 1-3 words dekh kar agla word predict karta hai.
- Digit model: pichhle 1-4 digits dekh kar agla digit predict karta hai.
Har user ka apna data hota hai (database me), isliye prediction user ke
hisab se hoti hai.
"""
import re
from collections import Counter, defaultdict

WORD_RE = re.compile(r"[\w']+", re.UNICODE)


def tokenize_words(text):
    return [w.lower() for w in WORD_RE.findall(text)]


def tokenize_digits(text):
    return [c for c in text if c.isdigit()]


class NGramModel:
    def __init__(self, max_order=3):
        self.max_order = max_order
        # counts[order][context_tuple][next_token] = count
        self.counts = {n: defaultdict(Counter) for n in range(1, max_order + 1)}
        self.unigrams = Counter()

    def train(self, tokens):
        for t in tokens:
            self.unigrams[t] += 1
        for n in range(1, self.max_order + 1):
            for i in range(len(tokens) - n):
                ctx = tuple(tokens[i:i + n])
                self.counts[n][ctx][tokens[i + n]] += 1

    def predict(self, context_tokens, top_k=5):
        """Backoff: sabse lamba context pehle, phir chhota, phir unigram."""
        scores = Counter()
        weight = 1.0
        for n in range(min(self.max_order, len(context_tokens)), 0, -1):
            ctx = tuple(context_tokens[-n:])
            nxt = self.counts[n].get(ctx)
            if nxt:
                total = sum(nxt.values())
                # lambe context ko zyada weight
                for tok, c in nxt.items():
                    scores[tok] += weight * (n ** 2) * c / total
            weight *= 0.5
        if not scores and self.unigrams:
            total = sum(self.unigrams.values())
            for tok, c in self.unigrams.items():
                scores[tok] = c / total
        if not scores:
            return []
        norm = sum(scores.values())
        return [(tok, round(s / norm * 100, 1)) for tok, s in scores.most_common(top_k)]


DEFAULT_TEXT = (
    "i am going to the market to buy some food. i am going to school every day. "
    "i want to learn python programming. i want to build a machine learning project. "
    "how are you today. how are you doing. what is your name. what is the weather today. "
    "the weather is very nice today. the weather is hot in summer. "
    "please give me the data. please tell me the answer. thank you very much. "
    "good morning everyone. good night my friend. i love to read books. "
)

DEFAULT_DIGITS = "1234512345" * 5 + "0123456789" * 3 + "1212121212" + "9876543210" * 2


def build_word_model(user_texts):
    m = NGramModel(max_order=3)
    m.train(tokenize_words(DEFAULT_TEXT))
    for t in user_texts:
        toks = tokenize_words(t)
        # user ka data 3 baar train: user ke hisab se prediction zyada ho
        for _ in range(3):
            m.train(toks)
    return m


def build_digit_model(user_digit_strings):
    m = NGramModel(max_order=4)
    m.train(list(DEFAULT_DIGITS))
    for s in user_digit_strings:
        toks = tokenize_digits(s)
        for _ in range(3):
            m.train(toks)
    return m


def predict_next_words(user_texts, prompt, top_k=5):
    model = build_word_model(user_texts)
    return model.predict(tokenize_words(prompt), top_k)


def predict_next_digits(user_digit_strings, prompt, top_k=5):
    model = build_digit_model(user_digit_strings)
    return model.predict(tokenize_digits(prompt), top_k)
