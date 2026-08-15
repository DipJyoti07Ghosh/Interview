from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import uvicorn
import os

from utils.resume_parser import extract_text_from_pdf, extract_skills
from models.question_loader import get_questions_for_candidate
from models.evaluator import evaluate_answer

app = FastAPI(title="AI Interview Simulator API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Welcome to AI Interview Simulator Backend!"}

@app.post("/api/upload-resume")
async def upload_resume(file: UploadFile = File(...)):

    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
    
    try:
        contents = await file.read()        
        resume_text = extract_text_from_pdf(contents)
        
        skills = extract_skills(resume_text)

        if not skills:
            skills = ["General Programming"]

        questions = get_questions_for_candidate(skills, limit=5)
        
        return {
            "filename": file.filename,
            "extracted_skills": skills,
            "questions": questions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

class AnswerSubmission(BaseModel):
    candidate_answer: str
    ideal_answer: str

@app.post("/api/evaluate")
async def evaluate_candidate_answer(submission: AnswerSubmission):
    try:
        result = evaluate_answer(submission.candidate_answer, submission.ideal_answer)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation Error: {str(e)}")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port)