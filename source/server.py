from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModel
import torch
import torch.nn.functional as F


MODELS = {
    "distilbert": "distilbert-base-uncased",
    "bert": "bert-base-uncased",
    "roberta": "roberta-base",
}

MODEL_NAME = "roberta"

DEVICE = "cpu"
if torch.cuda.is_available():
    DEVICE = "cuda"
if torch.mps.is_available():
    DEVICE = "mps"
print("Device:", DEVICE)

app = Flask(__name__)

# load default model
tokenizer = AutoTokenizer.from_pretrained(MODELS[MODEL_NAME])
model = AutoModel.from_pretrained(MODELS[MODEL_NAME]).to(DEVICE).eval()

# --- Endpoint to switch models ---
@app.route("/set_model", methods=["POST"])
def set_model():
    global tokenizer, model, MODEL_NAME
    new_model = request.json.get("model")
    if new_model not in MODELS:
        return jsonify({"status": "error", "msg": "unknown model"}), 400
    MODEL_NAME = new_model
    tokenizer = AutoTokenizer.from_pretrained(MODELS[MODEL_NAME])
    model = AutoModel.from_pretrained(MODELS[MODEL_NAME]).to(DEVICE).eval()
    return jsonify({"status": "ok", "current_model": MODEL_NAME})


def get_scores(text, gamma=0.5):
    if not text.strip():
        return []
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=256).to(DEVICE)
    with torch.no_grad():
        hidden = model(**inputs).last_hidden_state.squeeze(0)
    cls = hidden[0]
    sim = F.cosine_similarity(hidden, cls.unsqueeze(0), dim=-1)
    scores = sim
    scores = (scores - scores.min()) / (scores.max() - scores.min() + 1e-9)
    scores = scores.pow(gamma)
    return scores.cpu().tolist()


@app.route("/score", methods=["POST"])
def score():
    text = request.json.get("text", "")
    return jsonify(get_scores(text))


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=9000)
