// LumosAI_frontend/frontend/src/pages/FieldSelect.jsx
import React, { useEffect, useState, useRef, use } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import FieldForm from "../components/FieldForm";
import { userdata, redis_connection } from "../config";

export default function FieldSelect() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [waitingForBackend, setWaitingForBackend] = useState(false);

  const firefly1Ref = useRef(null);
  const firefly2Ref = useRef(null);
  const [playFirefly2, setPlayFirefly2] = useState(false);

  // ------------------------------
  // Load user from localStorage (UNCHANGED)
  // ------------------------------
  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (!stored) {
      navigate("/login");
      return;
    }
    try {
      setUser(JSON.parse(stored));
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  // ------------------------------
  // Firefly video speed (UI only)
  // ------------------------------
  useEffect(() => {
    if (firefly1Ref.current) firefly1Ref.current.playbackRate = 0.8;
    if (firefly2Ref.current) firefly2Ref.current.playbackRate = 0.2;
  }, []);

  // ------------------------------
  // SSE: backend onboarding completion (FIXED)
  // ------------------------------
  useEffect(() => {
    if (!user?.user_id) return;
    const sseUrl = `${redis_connection}?user_id=${user.user_id}`;
    const es = new EventSource(sseUrl);

    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (
          payload.channel === "user_onboarding_complete" &&
          payload.data?.user_id === user.user_id
        ) {
          es.close();
          navigate("/learn");
        }
      } catch (err) {
        console.error("SSE parse error", err);
      }
    };

    es.onerror = (err) => {
      console.error("SSE connection error", err);
    };

    return () => {
      es.close();
    };
  }, [user?.user_id, navigate]);

  // ------------------------------
  // FORM SUBMIT HANDLER (UNCHANGED)
  // ------------------------------
  const handleSubmit = async (data) => {
    if (!user) return;

    setPlayFirefly2(true);
    firefly2Ref.current?.play();

    const updatedUser = {
      ...user,
      category: data.branch,
      field: data.field,
      timezone: data.timezone,
      start_time: data.fromTime,
      end_time: data.toTime,
    };

    // save locally
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    sessionStorage.setItem("lastSelection", JSON.stringify(data));
    localStorage.setItem("selectedField", data.field);

    const backendPayload = {
      user_id: updatedUser.user_id,
      user_name: updatedUser.user_name,
      user_last_name: updatedUser.user_last_name,
      dob: updatedUser.dob,
      category: updatedUser.category,
      phone_number: updatedUser.phone_number,
      email: updatedUser.email,
      field: updatedUser.field,
      timezone: updatedUser.timezone,
      start_time: updatedUser.start_time,
      end_time: updatedUser.end_time,
    };

    try {
      const res = await fetch(userdata, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backendPayload),
      });

      const json = await res.json();

      if (!res.ok) {
        setPopupMessage(json.detail || "Backend error");
        setShowPopup(true);
      } else {
        setShowPopup(false);
        // 🔑 Create learn context for Learn page
        const learnUserdata = {
          user_id: updatedUser.user_id,
          field: updatedUser.field,
          session_id: null, // will be filled after intro
        };

        localStorage.setItem(
          "learn_session_context",
          JSON.stringify(learnUserdata)
        );
        setWaitingForBackend(true);
      }
    } catch {
      setPopupMessage("Network error");
      setShowPopup(true);
    }
  };


  // ------------------------------
  // RENDER (FIRST UI)
  // ------------------------------
  return (
    <>
      <Navbar />

      <div className="relative min-h-screen bg-black text-white pt-24 overflow-hidden flex items-center">
        {/* Firefly background */}
        <video
          ref={firefly1Ref}
          src="/Firefly_1.mp4"
          autoPlay
          // loop
          muted
          playsInline
          className={`pointer-events-none absolute inset-0 w-full mt-20 h-[80vh] object-contain transition-opacity duration-1000
            ${playFirefly2 ? "opacity-0" : "opacity-40"}`}
        />

        <video
          ref={firefly2Ref}
          src="/Firefly_2.mp4"
          autoPlay
          muted
          playsInline
          className={`pointer-events-none absolute inset-0 w-full mt-20 h-[80vh] object-contain transition-opacity duration-1000
            ${playFirefly2 ? "opacity-40" : "opacity-0"}`}
        />

        {/* Main content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 w-full flex flex-col md:grid md:grid-cols-2 gap-14 items-center">
          {/* LEFT */}
          <motion.div
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center md:text-left space-y-8"
          >
            {user && (
              <div className="flex items-center justify-center md:justify-start gap-3 text-gray-300">
                <span className="text-xl sm:text-2xl">Welcome</span>
                <motion.span
                  animate={{ rotate: [0, 15, -15, 15, 0] }}
                  transition={{ duration: 1 }}
                  className="text-2xl"
                >
                  👋
                </motion.span>
              </div>
            )}

            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              {user?.user_name || "User"}
            </h1>

            <p className="text-gray-400 max-w-md">
              Choose your <span className="text-cyan-400">field</span> and set a{" "}
              <span className="text-blue-400">focused session time</span>.
            </p>

            <div className="text-sm text-gray-500 italic">
              “Small consistent steps create massive growth.”
            </div>
          </motion.div>

          {/* RIGHT */}
          <motion.div
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full flex justify-center h-[80vh]"
          >
            <div
              className="corner-fill relative w-full max-w-md
             bg-gray-900/70
             backdrop-blur-md
             border border-cyan-400/30
             rounded-2xl
             overflow-hidden
             shadow-[0_0_40px_#00ffff22]
             p-8 md:p-10"
            >
              <FieldForm
                theme="dark"
                submitText="Start Learning"
                onSubmit={handleSubmit}
                containerClass="w-full text-center"
              />
            </div>
          </motion.div>
        </div>

        {/* WAITING LOADER */}
        {waitingForBackend && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-gray-900 text-white p-8 rounded-lg text-center w-80">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <h2 className="text-lg font-semibold mb-2">
                Preparing your learning journey 🚀
              </h2>
              <p className="text-sm text-gray-300">
                Generating roadmap and first lesson...
              </p>
            </div>
          </div>
        )}

        {/* ERROR POPUP */}
        {showPopup && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-80 text-center text-black">
              <h2 className="text-xl font-bold mb-3">Error</h2>
              <p className="mb-4">{popupMessage}</p>
              <button
                onClick={() => setShowPopup(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
