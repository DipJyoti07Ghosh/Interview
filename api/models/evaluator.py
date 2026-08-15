from sentence_transformers import SentenceTransformer, util
import torch

_model = None

def get_evaluator_model():
    global _model
    if _model is None:
        try:
            _model = SentenceTransformer('all-MiniLM-L6-v2')
        except Exception as e:
            print(f"Error loading SentenceTransformer model: {str(e)}")
            raise e
    return _model

def evaluate_answer(candidate_answer, ideal_answer):
    if not candidate_answer or not candidate_answer.strip():
        return {
            "score": 0.0,
            "feedback": "No answer provided."
        }
        
    try:
        model = get_evaluator_model()
        
        emb1 = model.encode(candidate_answer, convert_to_tensor=True)
        emb2 = model.encode(ideal_answer, convert_to_tensor=True)
        
        similarity = util.cos_sim(emb1, emb2).item()
        
        score_percentage = max(0.0, min(100.0, similarity * 100))
        
        if score_percentage >= 75:
            feedback = "Excellent! Your answer is very accurate and covers key technical points."
        elif score_percentage >= 50:
            feedback = "Good attempt! But you can add more details or technical depth."
        else:
            feedback = "Needs improvement. Try to focus more on core concepts related to this question."
            
        return {
            "score": round(score_percentage, 2),
            "feedback": feedback
        }
    except Exception as e:
        print(f"Evaluation error inner: {str(e)}")
        raise e