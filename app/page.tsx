"use client";

import { useState, useEffect } from "react"; // Import useEffect
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [employeeId, setEmployeeId] = useState("");
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [remainingTime, setRemainingTime] = useState(174); // 2:54 in seconds
  // 1. Update errors state type
  const [errors, setErrors] = useState<{ employeeId?: string; otp?: string }>({});
  const router = useRouter();
  const [timerIntervalId, setTimerIntervalId] = useState<NodeJS.Timeout | null>(null);

  // --- Employee ID Validation ---
  const validateEmployeeId = () => {
    const newErrors: Pick<typeof errors, 'employeeId'> = {}; // Only validate employeeId here
    if (!employeeId.trim()) {
      newErrors.employeeId = "Employee ID is required";
    } else if (employeeId.length < 4) { // Keep your existing length check or adjust as needed
      newErrors.employeeId = "Enter a valid Employee ID";
    }
    setErrors(prev => ({ ...prev, ...newErrors })); // Merge with existing errors (like OTP)
    return Object.keys(newErrors).length === 0;
  };

  // --- OTP Validation ---
  const validateOtp = () => {
    const otpCode = otpValues.join('');
    const newErrors: Pick<typeof errors, 'otp'> = {}; // Only validate OTP here
    if (otpCode.length !== 6) { // Check if all 6 digits are entered
      newErrors.otp = "Invalid OTP code"; // Your requested error message
    }
    setErrors(prev => ({ ...prev, ...newErrors })); // Merge with existing errors
    return Object.keys(newErrors).length === 0;
  }

  // --- Handle Employee ID Submit ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors
    if (validateEmployeeId()) {
      console.log("Employee ID Submitted:", employeeId);
      // --- Placeholder for actual OTP request API call ---
      // await requestOtpApi(employeeId);
      // --- End Placeholder ---
      setShowOtpVerification(true);
      setOtpValues(["", "", "", "", "", ""]); // Reset OTP fields
      setRemainingTime(174); // Reset timer
    }
  };

  // --- Start Timer on OTP Screen ---
   useEffect(() => {
    if (showOtpVerification) {
      // Clear any existing interval before starting a new one
      if (timerIntervalId) {
        clearInterval(timerIntervalId);
      }

      const timer = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            setTimerIntervalId(null); // Clear the stored interval ID
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      setTimerIntervalId(timer); // Store the new interval ID

      // Cleanup function to clear interval when component unmounts or OTP screen hides
      return () => {
        if (timer) {
           clearInterval(timer);
           setTimerIntervalId(null);
        }
      };
    } else {
        // If not showing OTP verification, ensure timer is cleared
        if (timerIntervalId) {
            clearInterval(timerIntervalId);
            setTimerIntervalId(null);
        }
    }
  }, [showOtpVerification]); // Dependency array ensures effect runs when showOtpVerification changes


  // --- Handle OTP Input Change ---
  const handleOtpChange = (index: number, value: string) => {
    // Allow only single digit or empty string
    if (!/^\d?$/.test(value)) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    // Clear OTP error if user starts typing
    if (errors.otp) {
        setErrors(prev => ({ ...prev, otp: undefined }));
    }

    // Auto-focus next input
    if (value !== '' && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
    // Optional: Auto-focus previous input on backspace/delete if current is empty
     else if (value === '' && index > 0) {
       const prevInput = document.getElementById(`otp-input-${index - 1}`);
       if (prevInput) prevInput.focus();
     }
  };

  // --- Handle Verify Button Click ---
  const handleVerifyClick = () => {
    // 2. Add validation check here
    setErrors({}); // Clear previous errors before validating again
    if (!validateOtp()) {
      return; // Stop execution if OTP is not valid (incomplete)
    }

    const otpCode = otpValues.join('');
    console.log("OTP Code Submitted:", otpCode);

    // --- Placeholder for actual OTP verification API call ---
    // setLoading(true); // Consider adding loading state
    // verifyOtpApi(employeeId, otpCode)
    //  .then(isValid => {
    //    if (isValid) {
    //      router.push('/chat'); // Navigate on success
    //    } else {
    //      setErrors({ otp: "Invalid OTP code. Please try again." }); // Set API error
    //    }
    //  })
    //  .catch(err => {
    //      console.error("OTP Verification Error:", err);
    //      setErrors({ otp: "Verification failed. Please try again later."}); // Set general error
    //  })
    //  .finally(() => {
    //      setLoading(false);
    //  });
    // --- End Placeholder ---

    // For now, navigate immediately after clicking Verify (if validation passes)
    console.log("OTP is valid (all fields filled), navigating...");
    router.push('/dashboard/');
  };

  // --- Handle Resend OTP ---
  const handleResendOtp = () => {
    console.log("Resending OTP for:", employeeId);
    // --- Placeholder for actual Resend OTP API call ---
    // await resendOtpApi(employeeId);
    // --- End Placeholder ---
    setRemainingTime(174); // Reset timer
    setOtpValues(["", "", "", "", "", ""]); // Clear OTP fields
    setErrors({}); // Clear errors
    // Focus the first OTP input again
    const firstInput = document.getElementById(`otp-input-0`);
    if (firstInput) firstInput.focus();
  };

  // --- Format Timer ---
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // --- Render ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex w-full max-w-4xl bg-white shadow-lg overflow-hidden "> {/* Added rounded-lg */}
        {/* Image Section */}
        <div className="hidden md:block md:w-[45%] relative">
          <img
            src="/login_image.png" // Make sure this image exists in your public folder
            alt="Login illustration"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Login Form or OTP Verification */}
        <div className="w-full md:w-[55%] p-6 md:p-10 flex flex-col justify-center">
          {!showOtpVerification ? (
            // Employee ID Form
            <>
              <div className="mb-6">
                <h1 className="text-lg font-bold text-gray-800 mb-2 tracking-tight">EQUPRO TECHNICAL MANAGEMENT SYSTEM</h1> {/* Slightly larger */}
                <p className="text-gray-500 text-sm">Sign in with your employee ID</p>
              </div>
              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-4">
                  <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                  <input
                    id="employeeId"
                    type="text"
                    value={employeeId}
                    onChange={(e) => {
                        setEmployeeId(e.target.value);
                        if (errors.employeeId) setErrors(prev => ({...prev, employeeId: undefined})); // Clear error on type
                    }}
                    placeholder="Enter your employee ID"
                    className={`w-full px-3 py-2 border text-black ${
                      errors.employeeId ? "border-red-500" : "border-gray-300"
                    } rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                    aria-invalid={!!errors.employeeId}
                    aria-describedby={errors.employeeId ? "employeeId-error" : undefined}
                  />
                  {errors.employeeId && <p id="employeeId-error" className="text-red-500 text-xs mt-1">{errors.employeeId}</p>} {/* Smaller error text */}
                </div>
                <div className="mb-6 text-right"> {/* Increased bottom margin */}
                  <a href="#" className="text-sm text-blue-600 hover:underline">Need help?</a>
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#151635] hover:bg-[#1c1d45] text-white py-2.5 rounded transition duration-200" /* Slightly taller button */
                >
                  Sign In
                </button>
              </form>
            </>
          ) : (
            // OTP Verification Form
            <div className="w-full text-center">
              <h2 className="text-xl font-bold text-[#151635] mb-3 tracking-tight">OTP Verification</h2>
              <p className="text-sm text-gray-600 mb-6">
                Enter the 6 digit verification code sent to your registered Email ID associated with Employee ID: <span className="font-medium">{employeeId}</span> {/* Show Employee ID */}
              </p>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-sm text-black font-medium mr-1">Verification code</span>
                  <span className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 text-xs cursor-default" title="Check your registered email">i</span>
                </div>
                <div className={`text-sm font-medium ${remainingTime <= 10 ? 'text-red-600' : 'text-[#4aA3B8]'}`}>{/* Change color when time is low */}
                    {remainingTime > 0 ? formatTime(remainingTime) : "Time expired"}
                </div>
              </div>
              <div className="flex justify-center gap-2 mb-4"> {/* Centered inputs */}
                {otpValues.map((value, index) => (
                  <input
                    key={index}
                    id={`otp-input-${index}`}
                    type="tel" // Use "tel" for numeric keyboard on mobile
                    inputMode="numeric"
                    pattern="\d{1}"
                    maxLength={1}
                    value={value}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    className={`w-10 h-11 border ${
                        errors.otp ? 'border-red-500' : 'border-gray-300' // Highlight all on error
                    } rounded-md text-black text-center text-lg font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                    aria-label={`Digit ${index + 1} of verification code`}
                    autoComplete="one-time-code"
                  />
                ))}
              </div>

              {/* 3. Display OTP Error Message */}
              {errors.otp && (
                <p className="text-red-500 text-xs text-center mb-4">{errors.otp}</p>
              )}

              <button
                onClick={handleVerifyClick}
                className="w-full bg-[#151635] hover:bg-[#1c1d45] text-white py-2.5 rounded transition duration-200 mb-6"
              >
                Verify
              </button>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-center text-sm">
                  <span className="text-gray-500 mr-2">Didn't receive the code?</span>
                  <button
                    onClick={handleResendOtp}
                    className="text-[#4aA3B8] font-medium hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
                    disabled={remainingTime > 0} // Disable strictly when timer is running
                  >
                    Resend OTP
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}