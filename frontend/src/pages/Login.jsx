import React, { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { send_otp, verify_otp } from "../config";
import { Phone } from "lucide-react";
import { setLoginTimestamp } from "../utils/learnHelpers";

const Login = () => {
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  // Custom toast notification state
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const navigate = useNavigate();
  const location = useLocation();

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Show toast helper function
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  // Check if user was redirected due to session expiry
  useEffect(() => {
    if (location.state?.expired) {
      setSessionExpired(true);
      // Clear the state so it doesn't show again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // ================= AUTO REDIRECT =================
  useEffect(() => {
    if (otpSent) return;

    const existing = localStorage.getItem("currentUser");
    if (existing) {
      const user = JSON.parse(existing);
      if (user?.user_id && user?.field && user?.category) {
        navigate("/learn");
      }
    }
  }, [navigate, otpSent]);

  // ================= SEND OTP =================
  const handleSendOtp = async () => {
    if (!/^\d{8,15}$/.test(phone)) {
      showToast("Enter a valid phone number", "error");
      return;
    }

    setSending(true);
    try {
      const res = await fetch(send_otp, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: `${countryCode}${phone}`,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (data.status === "success" || data.sent === true) {
        setOtpSent(true);
        showToast("OTP sent successfully", "success");
      } else {
        showToast(data.message || "Failed to send OTP", "error");
      }
    } catch (err) {
      showToast("Error sending OTP", "error");
    } finally {
      setSending(false);
    }
  };

  // ================= OTP INPUT =================
  const handleOtpChange = (i, v) => {
    if (!/^\d*$/.test(v)) return;
    const arr = [...otp];
    arr[i] = v;
    setOtp(arr);
    if (v && i < 5) {
      document.getElementById(`otp-${i + 2}`)?.focus();
    }
  };

  const handleOtpKeyDown = (e, i) => {
    if (e.key === "Backspace") {
      if (otp[i] === "" && i > 0) {
        document.getElementById(`otp-${i}`)?.focus();
      }
    }
  };

  const handleResendOtp = async () => {
    // OTP boxes clear
    setOtp(["", "", "", "", "", ""]);

    // focus back to first box
    setTimeout(() => {
      document.getElementById("otp-1")?.focus();
    }, 50);

    // reuse same SEND OTP API
    setSending(true);
    try {
      const res = await fetch(send_otp, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: `${countryCode}${phone}`,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (data.status === "success" || data.sent === true) {
        showToast("OTP resent successfully", "success");
      } else {
        showToast(data.message || "Failed to resend OTP", "error");
      }
    } catch (err) {
      showToast("Error resending OTP", "error");
    } finally {
      setSending(false);
    }
  };

  // ================= VERIFY OTP =================
  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      showToast("Enter complete 6-digit OTP", "warning");
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch(verify_otp, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: `${countryCode}${phone}`,
          otp: code,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (data.status === "success" && data.verified) {
        if (data.user_exists) {
          // Set login timestamp for 12-hour auto logout
          setLoginTimestamp();

          localStorage.setItem(
            "currentUser",
            JSON.stringify({
              user_id: data.user_id,
              name: data.name,
              user_exists: true,
              isProfileComplete: true,
            })
          );
          // Set learn_session_context for existing users so Learn page can fetch data
          localStorage.setItem(
            "learn_session_context",
            JSON.stringify({
              user_id: data.user_id,
              user_name: data.name,
              field: null,      // Will be populated from leftside/details API
              session_id: null, // Will be populated from leftside/details API
            })
          );
          navigate("/learn");
        } else {
          // Set login timestamp for 12-hour auto logout
          setLoginTimestamp();

          localStorage.setItem(
            "currentUser",
            JSON.stringify({
              user_id: data.user_id,
              phone_number: `${countryCode}${phone}`,
              user_exists: false,
              isProfileComplete: false,
            })
          );
          showToast("OTP verified! Please complete your profile.", "success");
          navigate("/user-profile");
        }
      }
    } catch (err) {
      showToast("OTP verification failed", "error");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden">
      {/* ===== FINAL BACKGROUND STRUCTURE ===== */}
      <div className="absolute inset-0 overflow-hidden">
        {/* AI Light Sweep */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2
                       w-[700px] h-[700px]
                       bg-gradient-to-tr from-cyan-500/20 via-blue-600/10 to-transparent
                       rounded-full blur-3xl animate-pulse"
          />
        </motion.div>

        {/* Noise Texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.05]"
          style={{
            backgroundImage: `url(./light-noise.png)`,
            backgroundRepeat: "repeat",
            backgroundSize: "auto",
          }}
        />

        {/* ===== EXTRA EDGE SHAPES (LEFT & RIGHT BORDERS) ===== */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* ========= LEFT BORDER ========= */}
          {/* Thin Vertical Light Line */}
          <div
            className="absolute left-0 top-0 h-full w-[2px]
                  bg-gradient-to-b from-transparent
                  via-cyan-400/30 to-transparent"
          />

          {/* Soft Cyan Glow */}
          <motion.div
            animate={{ opacity: [0.1, 0.18, 0.1] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-[-70px] top-[30%]
               w-[180px] h-[180px]
               bg-cyan-400/14
               rounded-full blur-3xl"
          />

          {/* Floating Accent Dots */}
          <motion.div
            animate={{ y: [0, -18, 0] }}
            transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-[18px] top-[42%]
               w-[6px] h-[6px]
               bg-cyan-300/40 rounded-full"
          />

          <motion.div
            animate={{ y: [0, 14, 0] }}
            transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-[28px] top-[58%]
               w-[4px] h-[4px]
               bg-blue-300/40 rounded-full"
          />

          {/* ========= RIGHT BORDER ========= */}
          {/* Thin Vertical Light Line */}
          <div
            className="absolute right-0 top-0 h-full w-[2px]
                  bg-gradient-to-b from-transparent
                  via-blue-400/30 to-transparent"
          />

          {/* Soft Blue Glow */}
          <motion.div
            animate={{ opacity: [0.1, 0.16, 0.1] }}
            transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-[-70px] top-[34%]
               w-[180px] h-[180px]
               bg-blue-400/14
               rounded-full blur-3xl"
          />

          {/* Floating Accent Dots */}
          <motion.div
            animate={{ y: [0, -16, 0] }}
            transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-[20px] top-[45%]
               w-[6px] h-[6px]
               bg-blue-300/40 rounded-full"
          />

          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-[30px] top-[60%]
               w-[4px] h-[4px]
               bg-cyan-300/40 rounded-full"
          />
        </div>

        {/* ===== Ultra-Polished Interactive Theme Shapes ===== */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* ===== PRIMARY GLOWS ===== */}
          <motion.div
            animate={{ y: [0, 22, 0], opacity: [0.12, 0.18, 0.12] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-[180px] h-[180px] rounded-full
               bg-cyan-400/15
               top-[14%] left-[12%]
               blur-3xl"
          />

          <motion.div
            animate={{ y: [0, -18, 0], opacity: [0.1, 0.16, 0.1] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-[150px] h-[150px] rounded-full
               bg-blue-400/15
               top-[42%] right-[9%]
               blur-2xl"
          />

          {/* ===== EDGE HIGHLIGHT GLOWS (CARD DEPTH) ===== */}
          <div
            className="absolute w-[120px] h-[120px] rounded-full
                  bg-cyan-300/10
                  top-[32%] left-[26%]
                  blur-xl"
          />

          <div
            className="absolute w-[120px] h-[120px] rounded-full
                  bg-blue-300/10
                  bottom-[28%] right-[28%]
                  blur-xl"
          />

          {/* ===== DIAGONAL AI LIGHT STREAKS ===== */}
          <div
            className="absolute w-[2px] h-[240px]
                  bg-gradient-to-b from-cyan-400/40 to-transparent
                  top-[18%] left-[6%]
                  rotate-12 opacity-20"
          />

          <div
            className="absolute w-[2px] h-[260px]
                  bg-gradient-to-b from-blue-400/40 to-transparent
                  bottom-[12%] right-[8%]
                  -rotate-12 opacity-20"
          />

          {/* ===== FLOATING GEOMETRY ===== */}
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-[96px] h-[96px]
               bg-cyan-500/10
               bottom-[16%] right-[15%]
               rotate-45 rounded-2xl blur-sm"
          />

          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-[70px] h-[70px]
               bg-blue-500/10
               top-[22%] right-[38%]
               rotate-12 rounded-xl blur-sm"
          />

          {/* ===== TRIANGLES (AI DIRECTIONAL CUES) ===== */}
          <motion.div
            animate={{ rotate: [18, 22, 18] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute"
            style={{
              width: 0,
              height: 0,
              borderLeft: "72px solid transparent",
              borderRight: "72px solid transparent",
              borderBottom: "120px solid rgba(34,211,238,0.12)",
              top: "7%",
              right: "6%",
            }}
          />

          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-[96px] h-[96px]
               bg-cyan-500/10
               top-[16%] left-[15%]
               rotate-45 rounded-2xl blur-sm"
          />

          <motion.div
            animate={{ rotate: [230, 235, 230] }}
            transition={{ duration: 36, repeat: Infinity, ease: "linear" }}
            className="absolute"
            style={{
              width: 0,
              height: 0,
              borderLeft: "92px solid transparent",
              borderRight: "92px solid transparent",
              borderBottom: "140px solid rgba(59,130,246,0.12)",
              bottom: "6%",
              left: "4%",
            }}
          />

          {/* ===== MICRO ACCENT DOTS (INTERACTIVITY FEEL) ===== */}
          <div
            className="absolute w-[30px] h-[30px] rounded-full
                bg-cyan-300/30
                top-[48%] left-[18%]"
          />

          <div
            className="absolute w-[30px] h-[30px] rounded-full
                bg-blue-300/30
                top-[55%] right-[22%]"
          />

          <div
            className="absolute w-[20px] h-[20px] rounded-full
                bg-cyan-400/30
                bottom-[22%] left-[36%]"
          />
        </div>

        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/70" />
      </div>

      {/* ===== LOGIN CARD ===== */}
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 bg-gray-800/70 h-[60vh]
                   rounded-xl shadow-lg
                   px-8 py-8 w-[90%] max-w-md
                   text-center
                   border-l-4 border-r-4 border-cyan-400
                   pt-14 pb-14 backdrop-blur-md"
      >
        {/* Back to Home Link */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-3 left-3 flex border-l border-r border-cyan-400 items-center gap-1 text-gray-400 hover:text-cyan-400 hover:border-cyan-400 transition-colors text-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h2 className="text-cyan-400 text-3xl font-semibold mb-6">
          VidhyanAI Login
        </h2>

        {/* Session Expired Notification */}
        {sessionExpired && (
          <div className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-200 px-4 py-2 rounded-lg mb-4 text-sm">
            ⏰ Your session has expired. Please log in again.
          </div>
        )}

        {/* Custom Toast Notification - Compact */}
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`mb-4 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 justify-center shadow-lg ${toast.type === "success"
              ? "bg-green-500/20 border border-green-500/50 text-green-300"
              : toast.type === "warning"
                ? "bg-yellow-500/20 border border-yellow-500/50 text-yellow-300"
                : "bg-red-500/20 border border-red-500/50 text-red-300"
              }`}
          >
            {toast.type === "success" ? "✓" : toast.type === "warning" ? "⚠" : "✕"}
            <span>{toast.message}</span>
          </motion.div>
        )}

        <div className="w-49 h-1 bg-cyan-400 mx-auto mb-4 rounded-full"></div>

        <p className="text-white font-semibold text-lg mt-8">
          Empowering Learning with AI-Powered Teaching Platform
        </p>

        <form className="space-y-8 mt-8">
          {/* Phone Input */}
          <div
            className="flex items-center bg-gray-800 border border-cyan-200 
                       rounded-lg px-3 py-3
                       focus-within:border-cyan-400 
                       focus-within:border-2 transition"
          >
            <Phone className="text-cyan-400 w-6 h-6 mx-4 fill-current stroke-white" />

            <div className="relative flex items-center mr-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="bg-transparent text-white outline-none text-sm
                           appearance-none pr-6 cursor-pointer font-semibold"
              >
                <option value="+91">IN +91</option>
                <option value="+1">US +1</option>
                <option value="+44">GB +44</option>
                <option value="+61">AU +61</option>
              </select>
              <FaChevronDown className="absolute right-1 text-gray-400 text-xs pointer-events-none" />
            </div>

            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="Phone Number"
              className="bg-transparent outline-none text-gray-200 text-sm flex-1"
            />
          </div>

          {/* SEND OTP */}
          {!otpSent && (
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={sending}
              className="w-49 bg-green-600 hover:bg-green-700
                         text-white font-semibold py-2 rounded-lg"
            >
              {sending ? "Sending..." : "Send OTP"}
            </button>
          )}

          {/* OTP INPUT */}
          {/* OTP + VERIFY (FIXED HEIGHT CONTAINER) */}
          {/* OTP + VERIFY (ABSOLUTE CENTERED) */}
          <div className="relative h-[100px]">
            {otpSent && (
              <div
                className="absolute inset-0 flex flex-col
                 items-center justify-center gap-4"
              >
                {/* OTP BOXES */}
                <div className="flex justify-center gap-2">
                  {otp.map((d, i) => (
                    <input
                      key={i}
                      id={`otp-${i + 1}`}
                      maxLength={1}
                      value={d}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(e, i)}
                      className="w-8 text-center bg-gray-900
             text-white border border-gray-600
             rounded py-1 focus:border-blue-400 outline-none"
                    />
                  ))}
                </div>

                {/* VERIFY + RESEND BUTTONS */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={verifying}
                    className="w-40 bg-blue-600 hover:bg-blue-700
                              text-white font-semibold py-1 rounded"
                  >
                    {verifying ? "Verifying..." : "Verify OTP"}
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={sending}
                    className="w-40 bg-cyan-400 hover:bg-cyan-600 
                              text-white font-semibold py-1 rounded border border-cyan-400"
                  >
                    {sending ? "Sending..." : "Resend Code"}
                  </button>
                </div>

              </div>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
