import pypdf
import re
import io

def extract_text_from_pdf(pdf_file_bytes):
    try:
        pdf_file = io.BytesIO(pdf_file_bytes)
        reader = pypdf.PdfReader(pdf_file)
        
        text = ""
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
        return text
    except Exception as e:
        return f"Error reading PDF: {str(e)}"


def extract_skills(resume_text):
    common_skills = [
        "python", "java", "c++", "javascript", "react", "fastapi", 
        "flask", "machine learning", "deep learning", "sql", "pandas", 
        "numpy", "tensorflow", "pytorch", "docker", "aws", "git"
    ]
    
    found_skills = []
    text_lower = resume_text.lower()
    
    for skill in common_skills:
        if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
            found_skills.append(skill.capitalize())
            
    return found_skills