// VidhyanAI_frontend/frontend/src/pages/UserProfile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { backend_url } from "../config";
import { CalendarDays } from "lucide-react";
// ================= POP-UP NOTIFICATION COMPONENT =================
const PopupNotification = ({ show, type, message, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => onClose(), 3500);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  const bgColors = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-orange-500",
    info: "bg-blue-500"
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.9 }}
          className={`fixed top-8 left-1/2 transform -translate-x-1/2 z-50 
            ${bgColors[type] || bgColors.info} 
            text-white px-6 py-3 rounded-xl shadow-2xl
            flex items-center gap-3 min-w-[280px] max-w-[90vw]`}
        >
          {type === "success" && <span className="text-xl">✓</span>}
          {type === "error" && <span className="text-xl">✕</span>}
          {type === "warning" && <span className="text-xl">⚠</span>}
          <span className="font-medium">{message}</span>
          <button onClick={onClose} className="ml-auto text-white/80 hover:text-white">✕</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function UserProfile() {
  const navigate = useNavigate();

  // ================= STATE =================
  const [user, setUser] = useState({
    user_id: "",
    name: "",
    last_name: "",
    dob: "",
    phone: "",
    email: "",
    isProfileComplete: false,
  });

  const [errors, setErrors] = useState({});
  const [editing, setEditing] = useState(true);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailOtp, setEmailOtp] = useState(["", "", "", "", "", ""]);

  // Loading states
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Pop-up notification state
  const [popup, setPopup] = useState({ show: false, type: "", message: "" });

  const showPopup = (type, message) => {
    setPopup({ show: true, type, message });
  };

  const closePopup = () => {
    setPopup({ show: false, type: "", message: "" });
  };

  // ================= LOAD USER =================
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("currentUser"));

    if (!stored) {
      navigate("/login");
      return;
    }

    if (stored.user_exists === true) {
      navigate("/learn");
      return;
    }

    setUser((u) => ({
      ...u,
      ...stored,
      isProfileComplete: stored.isProfileComplete || false,
    }));

    if (stored.isProfileComplete) setEditing(false);
  }, [navigate]);

  // ================= VALIDATION =================
  const validate = () => {
    const newErr = {};
    if (!user.name.trim()) newErr.name = "Name is required";
    if (!user.last_name.trim()) newErr.last_name = "Last Name is required";
    if (!user.dob) newErr.dob = "DOB required";
    if (!user.phone_number?.trim()) newErr.phone = "Phone required";
    if (!user.email.trim()) newErr.email = "Email required";
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  // ================= SEND EMAIL OTP (API) =================
  const sendEmailOtp = async () => {
    if (!user.email) {
      showPopup("error", "Please enter a valid email");
      return;
    }

    setSendingOtp(true);
    try {
      const res = await fetch(`${backend_url}/api/auth/send-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.user_id,
          gmail: user.email
        })
      });

      const data = await res.json();

      if (data.status === "success") {
        setEmailOtpSent(true);
        showPopup("success", "OTP sent to your email");
      } else {
        showPopup("error", data.message || "Failed to send OTP");
      }
    } catch (e) {
      console.error("Send OTP error:", e);
      showPopup("error", "Failed to send OTP. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  // ================= RESEND EMAIL OTP (API) =================
  const resendEmailOtp = async () => {
    if (!user.email) {
      showPopup("error", "Please enter a valid email");
      return;
    }

    setSendingOtp(true);
    setEmailOtp(["", "", "", "", "", ""]);

    try {
      const res = await fetch(`${backend_url}/api/auth/send-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.user_id,
          gmail: user.email
        })
      });

      const data = await res.json();

      if (data.status === "success") {
        setEmailOtpSent(true);
        setEmailVerified(false);
        showPopup("success", "New OTP sent to your email");
      } else {
        showPopup("error", data.message || "Failed to resend OTP");
      }
    } catch (e) {
      console.error("Resend OTP error:", e);
      showPopup("error", "Failed to resend OTP. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  // ================= VERIFY EMAIL OTP (API) =================
  const verifyEmailOtp = async () => {
    const code = emailOtp.join("");

    if (code.length !== 6) {
      showPopup("error", "Please enter complete 6-digit OTP");
      return;
    }

    setVerifyingOtp(true);
    setVerifySuccess(false);

    try {
      const res = await fetch(`${backend_url}/api/auth/verify-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.user_id,
          otp: code
        })
      });

      const data = await res.json();

      if (data.status === "success") {
        setVerifySuccess(true);
        setTimeout(() => {
          setEmailVerified(true);
          setEmailOtpSent(false);
          setEmailOtp(["", "", "", "", "", ""]);
        }, 1500);
      } else {
        // Show specific error messages
        if (data.message === "OTP expired") {
          showPopup("warning", "OTP has expired. Please request a new one.");
        } else if (data.message === "Invalid OTP") {
          showPopup("error", "Invalid OTP. Please check and try again.");
        } else {
          showPopup("error", data.message || "Verification failed");
        }
        setEmailOtp(["", "", "", "", "", ""]);
      }
    } catch (e) {
      console.error("Verify OTP error:", e);
      showPopup("error", "Verification failed. Please try again.");
      setEmailOtp(["", "", "", "", "", ""]);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleChange = (e) => {
    setUser((u) => ({ ...u, [e.target.name]: e.target.value }));
  };

  // ================= SUBMIT (API) =================
  const handleSubmit = async () => {
    if (!validate()) return;
    if (!emailVerified) {
      showPopup("warning", "Please verify your email first");
      return;
    }

    setSavingProfile(true);

    try {
      // Call the profile API
      const res = await fetch(`${backend_url}/api/user/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.user_id,
          name: user.name ?? "",
          user_last_name: user.last_name ?? "",
          dob: user.dob ?? "",
          email: user.email ?? ""
        })
      });

      const data = await res.json();

      if (res.ok && data.status === "success") {
        // Prepare data for next page (FieldSelect expects these fields)
        const finalUser = {
          user_id: user.user_id,
          user_name: user.name ?? "",
          user_last_name: user.last_name ?? "",
          dob: user.dob ?? "",
          phone_number: user.phone_number,
          email: user.email ?? "",
          category: "",
          field: "",
          timezone: "",
          start_time: "",
          end_time: "",
          isProfileComplete: true,
        };

        localStorage.setItem("currentUser", JSON.stringify(finalUser));
        setUser(finalUser);

        showPopup("success", "Profile saved successfully!");

        // Navigate after showing popup
        setTimeout(() => {
          navigate("/field-select");
        }, 1500);
      } else {
        showPopup("error", data.detail || data.message || "Failed to save profile");
      }
    } catch (e) {
      console.error("Save profile error:", e);
      showPopup("error", "Failed to save profile. Please try again.");
    } finally {
      setSavingProfile(false);
    }
  };

  /* ================= VIEW MODE ================= */
  if (!editing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-[#020617] to-black flex items-center justify-center px-4 text-white">
        <PopupNotification show={popup.show} type={popup.type} message={popup.message} onClose={closePopup} />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="relative w-full max-w-md rounded-2xl p-8
          bg-white/5 backdrop-blur-xl border border-cyan-500/30
          shadow-[0_0_40px_rgba(34,211,238,0.15)]"
        >
          <h1 className="text-3xl font-bold text-center text-cyan-400 mb-6">
            Profile Overview
          </h1>

          <div className="space-y-3 text-gray-300">
            <Info label="User ID" value={user.user_id} />
            <Info label="Name" value={user.name} />
            <Info label="DOB" value={user.dob} />
            <Info label="Phone" value={user.phone} />
            <Info label="Email" value={user.email} />
          </div>

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setEditing(true)}
              className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 transition"
            >
              Edit
            </button>

            <button
              onClick={() => navigate("/learn")}
              className="px-5 py-2 rounded-lg bg-white text-black hover:bg-gray-200 transition"
            >
              Continue
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ================= EDIT MODE ================= */
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-black via-[#020617] to-black flex items-center justify-center p-4 text-white">
      <PopupNotification show={popup.show} type={popup.type} message={popup.message} onClose={closePopup} />

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative w-full max-w-md rounded-2xl p-6
        bg-white/5 backdrop-blur-xl border border-cyan-500/30"
      >
        <h2 className="flex items-center justify-center gap-4 mb-6">
          <span className="h-[3px] w-20 bg-cyan-400 rounded-full"></span>
          <span className="text-2xl font-semibold text-cyan-400">
            Complete Profile
          </span>
          <span className="h-[3px] w-20 bg-cyan-400 rounded-full"></span>
        </h2>

        <Input
          label="First Name"
          name="name"
          value={user.name}
          onChange={handleChange}
          error={errors.name}
        />

        <Input
          label="Last Name"
          name="last_name"
          value={user.last_name}
          onChange={handleChange}
          error={errors.last_name}
        />

        <div className=" mb-4 relative">
          <div className="flex items-center">
            <input
              label="DOB"
              id="dob-input"
              type="date"
              name="dob"
              value={user.dob}
              onChange={handleChange}
              className="w-full mt-1 p-3 pr-12 rounded-lg
                      bg-transparent bg-black/40 border border-cyan-200
                      focus:border-cyan-400 outline-none"
            />

            <button
              type="button"
              onClick={() => {
                const input = document.getElementById("dob-input");
                if (!input) return;
                input.showPicker ? input.showPicker() : input.focus();
              }}
              className="bg-transparent absolute right-3 w-6 h-9 cursor-pointer"
            >
              <CalendarDays className="bg-transparent absolute justify-center items-center right-2 top-1" size={24} strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-lg text-white">Phone</label>
          <input
            disabled
            value={user.phone_number ?? ""}
            className="w-full mt-1 p-3 rounded-lg bg-gray-700/50"
          />
        </div>

        <div className="mb-4">
          <label className="text-lg text-white">Email</label>
          <div className="flex gap-4">
            <input
              name="email"
              value={user.email}
              onChange={handleChange}
              disabled={emailVerified}
              className={`flex-1 mt-1 p-3 rounded-lg bg-black/40 border border-cyan-200 focus:border-cyan-400 outline-none ${emailVerified ? 'opacity-60' : ''}`}
            />
            {!emailOtpSent && !emailVerified && (
              <button
                onClick={sendEmailOtp}
                disabled={sendingOtp}
                className="mt-1 px-4 rounded-lg bg-green-600 text-white text-lg hover:bg-green-500 transition flex items-center gap-2 disabled:opacity-60"
              >
                {sendingOtp ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Send OTP"
                )}
              </button>
            )}
            {emailVerified && (
              <div className="mt-1 px-4 rounded-lg bg-green-600 text-white text-lg flex items-center gap-2">
                <span className="text-xl">✓</span> Verified
              </div>
            )}
          </div>
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email}</p>
          )}
        </div>

        {emailOtpSent && !emailVerified && (
          <div className="flex justify-center gap-4 mb-4">
            {emailOtp.map((d, i) => (
              <input
                key={i}
                id={`email-otp-${i}`}
                maxLength={1}
                value={d}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");

                  setEmailOtp((prev) => {
                    const arr = [...prev];
                    arr[i] = val;
                    return arr;
                  });

                  if (val && i < emailOtp.length - 1) {
                    document.getElementById(`email-otp-${i + 1}`)?.focus();
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !emailOtp[i] && i > 0) {
                    document.getElementById(`email-otp-${i - 1}`)?.focus();
                  }
                }}
                className="w-10 h-10 text-center rounded-lg
                   bg-black/40 border border-cyan-300
                   text-white text-lg
                   focus:border-cyan-400 focus:outline-none"
              />
            ))}

            <button
              onClick={verifyEmailOtp}
              disabled={verifyingOtp || verifySuccess}
              className={`px-4 rounded-lg text-white text-lg flex items-center gap-2 transition min-w-[90px] justify-center
                ${verifySuccess ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-500'}
                disabled:opacity-80`}
            >
              {verifyingOtp ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : verifySuccess ? (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-xl"
                >
                  ✓
                </motion.span>
              ) : (
                "Verify"
              )}
            </button>
          </div>
        )}

        <div className={`mt-6 flex items-center ${emailVerified ? "justify-center" : emailOtpSent ? "justify-between" : "justify-center"
          }`}>
          <button
            onClick={handleSubmit}
            disabled={savingProfile}
            className="px-6 py-2 text-white text-lg rounded-lg bg-blue-600 hover:bg-blue-500 transition flex items-center gap-2 disabled:opacity-60"
          >
            {savingProfile ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              "Save & Continue"
            )}
          </button>

          {!emailVerified && emailOtpSent && (
            <button
              onClick={resendEmailOtp}
              disabled={sendingOtp}
              className="px-6 py-2 text-white text-lg rounded-lg bg-cyan-400 hover:bg-cyan-600 transition disabled:opacity-60"
            >
              {sendingOtp ? "Sending..." : "Resend Code"}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ================= REUSABLE ================= */

const Info = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-white">{label}</span>
    <span className="text-white">{value}</span>
  </div>
);

const Input = ({ label, error, ...props }) => (
  <div className="mb-4">
    <label className="text-lg text-white">{label}</label>
    <input
      {...props}
      className="w-full mt-1 p-2 rounded-lg bg-black/40 border border-cyan-200 focus:border-cyan-400 outline-none"
    />
    {error && <p className="text-red-500 text-sm">{error}</p>}
  </div>
);
