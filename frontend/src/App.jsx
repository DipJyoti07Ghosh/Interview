import React, { useState } from "react";
import axios from "axios";
import img from "../public/img.jpg";
import pro from "../public/cropped_circle_image.png"

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [isListening, setIsListening] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please upload your PDF resume first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/upload-resume",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      setSessionData(response.data);
      setCurrentIdx(0);
      setAnswer("");
      setEvaluationResult(null);
    } catch (err) {
      console.error(err);
      alert("Error connecting to backend server!");
    } finally {
      setLoading(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(
        "Speech recognition is not supported in this browser. Use Google Chrome.",
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setAnswer((prev) => prev + " " + speechToText);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handleEvaluate = async () => {
    if (!answer.trim()) {
      alert("Please write or speak an answer.");
      return;
    }

    const currentQ = sessionData.questions[currentIdx];
    setEvaluating(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/evaluate", {
        candidate_answer: answer,
        ideal_answer: currentQ.answer,
      });
      setEvaluationResult(response.data);
    } catch (err) {
      console.error(err);
      alert("Error evaluating answer.");
    } finally {
      setEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    setAnswer("");
    setEvaluationResult(null);
    setCurrentIdx((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f7f0eb] via-[#efe3db] to-[#e6d6cc] text-[#2c221e] font-sans selection:bg-[#d99b6c] selection:text-white">
      {/* Navbar */}
      <nav className="w-full px-6 sm:px-8 py-5 flex justify-between items-center bg-white/40 backdrop-blur-md border-b border-white/60 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-rose-500 flex items-center justify-center text-white font-black shadow-md">
            AI
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-[#2c221e]">
            AI Interview Simulator
          </span>
        </div>

        <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/80 shadow-xs">
          <img
            src={pro}
            alt="Dipjyoti Ghosh"
            className="w-7 h-7 rounded-full object-cover border border-amber-500"
          />
          <span className="text-sm font-semibold text-gray-800">
            Dipjyoti Ghosh
          </span>
        </div>
      </nav>

      {/* Main Container */}
      <div className="grow max-w-7xl mx-auto px-6 py-12 w-full flex flex-col justify-center">
        {!sessionData ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Hero Text & Upload Glass Card */}
            <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6 text-[#1e1512] leading-[1.15]">
                Convert Your Resume Into an{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-orange-600">
                  AI Interview
                </span>{" "}
                Experience
              </h1>
              <p className="text-gray-700 text-sm sm:text-lg mb-8 leading-relaxed max-w-2xl">
                Transform static PDF resumes into dynamic technical interview
                assessments. Upload your resume and let our intelligent
                deep-learning model test your core software engineering skills.
              </p>

              {/* Upload Glassmorphic Card */}
              <div className="bg-white/75 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white shadow-[0_20px_50px_rgba(0,0,0,0.06)] w-full max-w-xl">
                <h3 className="text-base font-bold text-gray-900 mb-4 text-center lg:text-left">
                  Upload Resume & Get Started
                </h3>

                <form onSubmit={handleUpload}>
                  <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-300/80 bg-white/60 p-6 rounded-2xl cursor-pointer hover:border-amber-600 transition group mb-5">
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full text-center sm:text-left">
                      <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center font-bold text-xs shadow-xs shrink-0 mx-auto sm:mx-0">
                        PDF
                      </div>
                      <div className="overflow-hidden w-full">
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-amber-700 transition truncate">
                          {file
                            ? file.name
                            : "Drag & Drop Resume or Click to Upload"}
                        </p>
                        <p className="text-xs text-gray-500">
                          Supports PDF format up to 10MB
                        </p>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 px-6 rounded-xl font-bold text-white text-base shadow-[0_10px_25px_rgba(194,124,75,0.35)] bg-gradient-to-r from-[#d99b6c] via-[#c27c4b] to-[#a65d2a] hover:opacity-95 transition transform active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Analyzing Resume & Skills...
                      </span>
                    ) : (
                      <>Start Interview Online ➔</>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: Sleek Tech/AI Glass Frame */}
            <div className="lg:col-span-5 flex justify-center w-full">
              <div className="w-full max-w-lg bg-[#111116] rounded-2xl border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.25)] p-3 relative overflow-hidden group">
                {/* Glossy top glare effect */}
                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-t-2xl"></div>
                <img
                  src={img}
                  alt="AI Neural Network Visual"
                  className="rounded-xl w-full h-auto aspect-[1023/576] object-contain opacity-90 transition duration-500 group-hover:scale-105 bg-black/40"
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1000&auto=format&fit=crop";
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Active Interview Screen */
          <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white shadow-xl w-full">
            <div className="mb-6 text-center sm:text-left">
              <span className="inline-block bg-amber-100/70 text-amber-900 border border-amber-300 text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full">
                🎯 Detected Skills: {sessionData.extracted_skills.join(", ")}
              </span>
            </div>

            {currentIdx < sessionData.questions.length ? (
              <div>
                <div className="text-xs uppercase tracking-wider text-amber-800 font-bold mb-2">
                  Question {currentIdx + 1} of {sessionData.questions.length}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">
                  {sessionData.questions[currentIdx].question}
                </h2>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-white/80 text-gray-700 text-xs px-3 py-1 rounded-md border border-gray-200">
                    Category: {sessionData.questions[currentIdx].category}
                  </span>
                  <span className="bg-white/80 text-gray-700 text-xs px-3 py-1 rounded-md border border-gray-200">
                    Difficulty: {sessionData.questions[currentIdx].difficulty}
                  </span>
                </div>

                <textarea
                  rows="5"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your technical answer or use voice transcription..."
                  className="w-full p-4 bg-white/90 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600 text-sm text-gray-800 mb-6 shadow-inner"
                />

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={startListening}
                    className={`py-3.5 px-6 rounded-xl font-semibold text-white transition cursor-pointer shadow-md ${
                      isListening
                        ? "bg-red-600 animate-pulse"
                        : "bg-emerald-600 hover:bg-emerald-700"
                    }`}
                  >
                    {isListening
                      ? "Listening... Speak Now 🎙️"
                      : "Voice Answer 🎤"}
                  </button>

                  <button
                    type="button"
                    onClick={handleEvaluate}
                    disabled={evaluating}
                    className="grow py-3.5 px-6 rounded-xl font-bold text-white shadow-md bg-gradient-to-r from-[#d99b6c] to-[#a65d2a] hover:opacity-95 transition cursor-pointer"
                  >
                    {evaluating ? "Evaluating Answer..." : "Submit & Evaluate"}
                  </button>
                </div>

                {evaluationResult && (
                  <div className="mt-8 p-6 bg-white/90 border border-emerald-500 rounded-2xl shadow-sm">
                    <h3 className="text-lg font-bold text-emerald-700 mb-2">
                      📊 Evaluation Report
                    </h3>
                    <p className="text-sm font-medium mb-1">
                      <strong>Score:</strong> {evaluationResult.score} / 100
                    </p>
                    <p className="text-sm text-gray-700 mb-4">
                      <strong>AI Feedback:</strong> {evaluationResult.feedback}
                    </p>
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="bg-gray-900 text-white text-sm py-2.5 px-5 rounded-xl font-semibold hover:bg-gray-800 transition cursor-pointer shadow-sm"
                    >
                      Next Question ➡️
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-emerald-700 mb-3">
                  🎉 Interview Completed Successfully!
                </h2>
                <p className="text-gray-600 mb-6">
                  You have successfully completed all technical evaluation
                  rounds.
                </p>
                <button
                  type="button"
                  onClick={() => setSessionData(null)}
                  className="py-3.5 px-8 rounded-xl font-bold text-white shadow-md bg-gradient-to-r from-[#d99b6c] to-[#a65d2a] hover:opacity-95 transition cursor-pointer"
                >
                  Start New Simulation
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Section */}
      <footer className="w-full py-8 px-6 text-center mt-auto bg-white/30 backdrop-blur-md border-t border-white/50">
        <div className="text-sm font-semibold text-gray-700 mb-4 tracking-wide">
          Created by{" "}
          <span className="text-[#a65d2a] font-bold">Dipjyoti Ghosh</span>
        </div>

        <div className="flex justify-center gap-4">
          <a
            href="https://github.com/DipJyoti07Ghosh"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white/80 border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-[#a65d2a] hover:text-white hover:border-[#a65d2a] transition shadow-xs"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
          <a
            href="https://www.linkedin.com/in/dipjyoti-ghosh-091087342/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white/80 border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-[#a65d2a] hover:text-white hover:border-[#a65d2a] transition shadow-xs"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.32a1.53 1.53 0 0 0-1.54 1.53c0 .85.69 1.54 1.54 1.54s1.53-.69 1.53-1.54c0-.84-.68-1.53-1.53-1.53z" />
            </svg>
          </a>
          <a
            href="https://www.instagram.com/ghosh_dipjyoti/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white/80 border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-[#a65d2a] hover:text-white hover:border-[#a65d2a] transition shadow-xs"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>
          <a
            href="https://dipjyotighosh.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white/80 border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-[#a65d2a] hover:text-white hover:border-[#a65d2a] transition shadow-xs"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
