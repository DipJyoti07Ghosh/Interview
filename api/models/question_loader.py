import pandas as pd
import os
import random

SKILL_TO_CATEGORY_MAP = {
    "python": ["Languages and Frameworks", "General Programming", "Machine Learning", "Artificial Intelligence"],
    "java": ["Languages and Frameworks", "General Programming", "Back-end"],
    "javascript": ["Languages and Frameworks", "Front-end", "Web Development", "Full-stack"],
    "react": ["Front-end", "Web Development", "Languages and Frameworks"],
    "sql": ["Database and SQL", "Database Systems", "Data Engineering"],
    "database": ["Database and SQL", "Database Systems"],
    "machine learning": ["Machine Learning", "Artificial Intelligence"],
    "deep learning": ["Machine Learning", "Artificial Intelligence"],
    "docker": ["DevOps", "System Design"],
    "aws": ["DevOps", "System Design", "Distributed Systems"],
    "git": ["Version Control"],
    "testing": ["Software Testing"],
    "security": ["Security"],
    "data structures": ["Data Structures", "Algorithms"]
}

def load_questions():

    try:
        current_dir = os.path.dirname(__file__)
        csv_path = os.path.join(current_dir, '../data/Software Questions.csv')
        df = pd.read_csv(csv_path, encoding='latin1')
        return df
    except Exception as e:
        print(f"Error loading questions dataset: {str(e)}")
        return None

def get_questions_for_candidate(skills_list, limit=5):

    df = load_questions()
    if df is None or df.empty:
        return []
    
    target_categories = set()
    
    for skill in skills_list:
        skill_lower = skill.lower()
        if skill_lower in SKILL_TO_CATEGORY_MAP:
            target_categories.update(SKILL_TO_CATEGORY_MAP[skill_lower])
            
    matched_questions = []
    
    if target_categories:
        matched_df = df[df['Category'].isin(target_categories)]
        for _, row in matched_df.iterrows():
            matched_questions.append({
                "question_number": row['Question Number'],
                "question": row['Question'],
                "answer": row['Answer'],
                "category": row['Category'],
                "difficulty": row['Difficulty']
            })
    if len(matched_questions) < limit:
        all_questions = []
        for _, row in df.iterrows():
            q_dict = {
                "question_number": row['Question Number'],
                "question": row['Question'],
                "answer": row['Answer'],
                "category": row['Category'],
                "difficulty": row['Difficulty']
            }
            if q_dict not in all_questions:
                all_questions.append(q_dict)
        
        random.shuffle(all_questions)
        for q in all_questions:
            if q not in matched_questions:
                matched_questions.append(q)

    random.shuffle(matched_questions)
    
    selected_questions = matched_questions[:limit]
    
    return selected_questions