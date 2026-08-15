from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

_vectorizer = None


def get_vectorizer():
  global _vectorizer
  if _vectorizer is None:
    _vectorizer = TfidfVectorizer()
  return _vectorizer


def evaluate_answer(candidate_answer, ideal_answer):
  if not candidate_answer or not candidate_answer.strip():
    return {"score": 0.0, "feedback": "No answer provided."}

  try:
    vectorizer = get_vectorizer()

    # Compute TF-IDF matrix for candidate and ideal answers
    tfidf_matrix = vectorizer.fit_transform([candidate_answer, ideal_answer])
    similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]

    score_percentage = max(0.0, min(100.0, float(similarity) * 100))

    if score_percentage >= 75:
      feedback = (
          "Excellent! Your answer is very accurate and covers key technical"
          " points."
      )
    elif score_percentage >= 50:
      feedback = (
          "Good attempt! But you can add more details or technical depth."
      )
    else:
      feedback = (
          "Needs improvement. Try to focus more on core concepts related to"
          " this question."
      )

    return {"score": round(score_percentage, 2), "feedback": feedback}
  except Exception as e:
    print(f"Evaluation error inner: {str(e)}")
    raise e