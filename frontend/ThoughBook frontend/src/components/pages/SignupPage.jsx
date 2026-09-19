import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import bg2 from "../../assets/bg2.png"


const SignupPage = () => {

  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm()

  const password = watch("password")

  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState("")
  const [otpVerified, setOtpVerified] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState(null)


  // =====================================================
  // STEP 1: SEND OTP TO EMAIL
  // =====================================================

  const handleSendOTP = async (data) => {

    setLoading(true)
    setError("")
    setSuccess("")

    try {

      // Save signup information temporarily
      setFormData(data)

      const response = await fetch(
        "http://localhost:8000/thoughtbook/send-otp",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            email: data.email
          })
        }
      )

      const result = await response.json()

      if (!response.ok) {

        throw new Error(
          result.detail || "Unable to send OTP"
        )
      }

      setOtpSent(true)

      setSuccess(
        "OTP has been sent to your email address."
      )

    } catch (error) {

      setError(error.message)

    } finally {

      setLoading(false)
    }
  }


  // =====================================================
  // STEP 2: VERIFY OTP
  // =====================================================

  const handleVerifyOTP = async () => {

    setError("")
    setSuccess("")


    // Check empty OTP

    if (!otp) {

      setError(
        "Please enter the OTP."
      )

      return
    }


    // Check OTP length

    if (!/^\d{6}$/.test(otp)) {

      setError(
        "OTP must contain exactly 6 digits."
      )

      return
    }


    setLoading(true)


    try {

      const response = await fetch(
        "http://localhost:8000/thoughtbook/verify-otp",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            email: formData.email,
            otp: otp
          })
        }
      )

      const result = await response.json()

      if (!response.ok) {

        throw new Error(
          result.detail || "Invalid OTP"
        )
      }


      setOtpVerified(true)

      setSuccess(
        "Email verified successfully."
      )

    } catch (error) {

      setError(error.message)

    } finally {

      setLoading(false)
    }
  }


  // =====================================================
  // STEP 3: CREATE ACCOUNT
  // =====================================================

  const handleCreateAccount = async () => {

    setError("")
    setSuccess("")


    // Check OTP verification

    if (!otpVerified) {

      setError(
        "Please verify your email before creating the account."
      )

      return
    }


    setLoading(true)


    try {

      const response = await fetch(
        "http://localhost:8000/thoughtbook/signup",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify(formData)
        }
      )


      const result = await response.json()


      // =================================================
      // HANDLE BACKEND RESPONSE
      // =================================================

      if (!response.ok) {

        // -----------------------------------------------
        // USER ALREADY EXISTS
        // -----------------------------------------------

        if (response.status === 409) {

          setError(
            "User already exists. Please login with your credentials."
          )

          return
        }


        // -----------------------------------------------
        // OTHER BACKEND ERRORS
        // -----------------------------------------------

        setError(
          result.detail || "Signup failed"
        )

        return
      }


      // =================================================
      // ACCOUNT CREATED SUCCESSFULLY
      // =================================================

      setSuccess(
        "Account created successfully! Redirecting to login..."
      )


      // Redirect to login page

      setTimeout(() => {

        navigate("/login")

      }, 1500)


    } catch (error) {

      setError(
        error.message || "Unable to create account."
      )

    } finally {

      setLoading(false)
    }
  }


  // =====================================================
  // CHANGE EMAIL
  // =====================================================

  const handleChangeEmail = () => {

    setOtpSent(false)
    setOtpVerified(false)

    setOtp("")
    setFormData(null)

    setError("")
    setSuccess("")
  }


  return (

    <div
      className="relative w-screen min-h-screen bg-cover bg-center bg-no-repeat flex flex-col justify-center items-center overflow-auto py-10"

      style={{
        backgroundImage: `url(${bg2})`
      }}
    >


      {/* ================================================= */}
      {/* GLASS CARD */}
      {/* ================================================= */}

      <div
        className="absolute w-[500px] min-h-[680px] bg-white/30 backdrop-blur-sm rounded-3xl shadow-2xl"
      />


      {/* ================================================= */}
      {/* CARD CONTENT */}
      {/* ================================================= */}

      <div
        className="relative z-10 w-[500px] min-h-[680px] flex flex-col items-center"
      >


        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="p-[10px] pt-8">

          <h1
            className="text-5xl font-extrabold w-full text-center bg-gradient-to-r from-indigo-400 via-purple-500 to-indigo-700 bg-clip-text text-transparent"
          >
            THOUGHTBOOK
          </h1>

          <p className="mt-3 text-gray-700 text-sm text-center">

            Create your account. Share your thoughts.

          </p>

        </div>


        {/* ================================================= */}
        {/* ERROR MESSAGE */}
        {/* ================================================= */}

        {error && (

          <div className="w-[400px] mt-4">

            <p className="text-red-600 text-sm text-center bg-red-100/70 rounded-lg p-2">

              {error}

            </p>


            {/* ============================================= */}
            {/* LOGIN BUTTON FOR EXISTING USER */}
            {/* ============================================= */}

            {error.includes("already exists") && (

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full mt-2 p-2 rounded-lg bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition"
              >
                Login
              </button>

            )}

          </div>

        )}


        {/* ================================================= */}
        {/* SUCCESS MESSAGE */}
        {/* ================================================= */}

        {success && (

          <div className="w-[400px] mt-4">

            <p className="text-green-600 text-sm text-center bg-green-100/70 rounded-lg p-2">

              {success}

            </p>

          </div>

        )}


        {/* ================================================= */}
        {/* STEP 1: SIGNUP FORM */}
        {/* ================================================= */}

        {!otpSent && (

          <form
            onSubmit={handleSubmit(handleSendOTP)}
            className="flex flex-col items-center gap-4 w-full mt-8"
          >


            {/* ================================================= */}
            {/* NAME */}
            {/* ================================================= */}

            <div className="w-[400px]">

              <input
                type="text"
                placeholder="Enter full name"

                {...register("name", {

                  required: "Name is required",

                  minLength: {
                    value: 3,
                    message:
                      "Name must be at least 3 characters"
                  },

                  pattern: {
                    value: /^[A-Za-z ]+$/,
                    message:
                      "Name can contain only letters and spaces"
                  }

                })}

                className={`bg-white/80 border rounded-xl w-full text-center p-3 outline-none focus:ring-2 transition ${
                  errors.name
                    ? "border-red-500 focus:ring-red-400"
                    : "border-indigo-400 focus:ring-indigo-400"
                }`}
              />

              {errors.name && (

                <p className="text-red-600 text-xs mt-1 ml-2">

                  {errors.name.message}

                </p>

              )}

            </div>


            {/* ================================================= */}
            {/* MOBILE */}
            {/* ================================================= */}

            <div className="w-[400px]">

              <input
                type="tel"
                placeholder="Enter mobile number"

                {...register("mobile", {

                  required:
                    "Mobile number is required",

                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message:
                      "Enter a valid 10-digit mobile number"
                  }

                })}

                className={`bg-white/80 border rounded-xl w-full text-center p-3 outline-none focus:ring-2 transition ${
                  errors.mobile
                    ? "border-red-500 focus:ring-red-400"
                    : "border-indigo-400 focus:ring-indigo-400"
                }`}
              />

              {errors.mobile && (

                <p className="text-red-600 text-xs mt-1 ml-2">

                  {errors.mobile.message}

                </p>

              )}

            </div>


            {/* ================================================= */}
            {/* EMAIL */}
            {/* ================================================= */}

            <div className="w-[400px]">

              <input
                type="email"
                placeholder="Enter e-mail"

                {...register("email", {

                  required: "Email is required",

                  pattern: {
                    value:
                      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message:
                      "Enter a valid email address"
                  }

                })}

                className={`bg-white/80 border rounded-xl w-full text-center p-3 outline-none focus:ring-2 transition ${
                  errors.email
                    ? "border-red-500 focus:ring-red-400"
                    : "border-indigo-400 focus:ring-indigo-400"
                }`}
              />

              {errors.email && (

                <p className="text-red-600 text-xs mt-1 ml-2">

                  {errors.email.message}

                </p>

              )}

            </div>


            {/* ================================================= */}
            {/* PASSWORD */}
            {/* ================================================= */}

            <div className="w-[400px]">

              <input
                type="password"
                placeholder="Enter password"

                {...register("password", {

                  required:
                    "Password is required",

                  minLength: {
                    value: 8,
                    message:
                      "Password must be at least 8 characters"
                  },

                  pattern: {
                    value:
                      /^(?=.*[A-Za-z])(?=.*\d).{8,}$/,
                    message:
                      "Password must contain letters and numbers"
                  }

                })}

                className={`bg-white/80 border rounded-xl w-full text-center p-3 outline-none focus:ring-2 transition ${
                  errors.password
                    ? "border-red-500 focus:ring-red-400"
                    : "border-indigo-400 focus:ring-indigo-400"
                }`}
              />

              {errors.password && (

                <p className="text-red-600 text-xs mt-1 ml-2">

                  {errors.password.message}

                </p>

              )}

            </div>


            {/* ================================================= */}
            {/* CONFIRM PASSWORD */}
            {/* ================================================= */}

            <div className="w-[400px]">

              <input
                type="password"
                placeholder="Confirm password"

                {...register("confirmPassword", {

                  required:
                    "Please confirm your password",

                  validate: value =>
                    value === password ||
                    "Passwords do not match"

                })}

                className={`bg-white/80 border rounded-xl w-full text-center p-3 outline-none focus:ring-2 transition ${
                  errors.confirmPassword
                    ? "border-red-500 focus:ring-red-400"
                    : "border-indigo-400 focus:ring-indigo-400"
                }`}
              />

              {errors.confirmPassword && (

                <p className="text-red-600 text-xs mt-1 ml-2">

                  {errors.confirmPassword.message}

                </p>

              )}

            </div>


            {/* ================================================= */}
            {/* SEND OTP BUTTON */}
            {/* ================================================= */}

            <button
              type="submit"
              disabled={loading}

              className="w-[400px] p-3 mt-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold cursor-pointer hover:from-indigo-600 hover:to-purple-700 transition shadow-lg disabled:opacity-60"
            >

              {loading
                ? "SENDING OTP..."
                : "SEND OTP"
              }

            </button>

          </form>

        )}


        {/* ================================================= */}
        {/* STEP 2: OTP VERIFICATION */}
        {/* ================================================= */}

        {otpSent && !otpVerified && (

          <div className="flex flex-col items-center w-full mt-10">


            <p className="text-gray-700 text-sm mb-5 text-center">

              Enter the 6-digit OTP sent to:

            </p>


            <p className="font-semibold text-gray-800 mb-5">

              {formData?.email}

            </p>


            {/* ================================================= */}
            {/* OTP INPUT */}
            {/* ================================================= */}

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}

              onChange={(e) => {

                const value =
                  e.target.value.replace(/\D/g, "")

                setOtp(value)

              }}

              placeholder="Enter OTP"

              className="bg-white/80 border border-indigo-400 rounded-xl w-[400px] text-center p-3 text-xl tracking-[8px] outline-none focus:ring-2 focus:ring-indigo-400"
            />


            {/* ================================================= */}
            {/* VERIFY BUTTON */}
            {/* ================================================= */}

            <button
              type="button"
              onClick={handleVerifyOTP}
              disabled={loading}

              className="w-[400px] p-3 mt-6 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold cursor-pointer hover:from-indigo-600 hover:to-purple-700 transition shadow-lg disabled:opacity-60"
            >

              {loading
                ? "VERIFYING..."
                : "VERIFY OTP"
              }

            </button>


            {/* ================================================= */}
            {/* CHANGE EMAIL */}
            {/* ================================================= */}

            <button
              type="button"
              onClick={handleChangeEmail}

              className="text-blue-500 text-sm mt-5 hover:text-blue-700"
            >

              Change Email

            </button>

          </div>

        )}


        {/* ================================================= */}
        {/* STEP 3: EMAIL VERIFIED */}
        {/* ================================================= */}

        {otpVerified && (

          <div className="flex flex-col items-center w-full mt-10">


            <div className="text-green-600 text-lg font-semibold">

              ✓ Email Verified

            </div>


            <p className="text-gray-700 text-sm mt-2 text-center">

              Your email has been verified successfully.

            </p>


            {/* ================================================= */}
            {/* CREATE ACCOUNT */}
            {/* ================================================= */}

            <button
              type="button"
              onClick={handleCreateAccount}
              disabled={loading}

              className="w-[400px] p-3 mt-6 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold cursor-pointer hover:from-indigo-600 hover:to-purple-700 transition shadow-lg disabled:opacity-60"
            >

              {loading
                ? "CREATING ACCOUNT..."
                : "CREATE ACCOUNT"
              }

            </button>

          </div>

        )}


        {/* ================================================= */}
        {/* LOGIN LINK */}
        {/* ================================================= */}

        <p className="mt-6 mb-8 text-sm text-gray-700">

          Already have an account?{" "}

          <a
            href="/login"
            className="text-blue-500 hover:text-blue-700"
          >

            Login

          </a>

        </p>


      </div>

    </div>
  )
}


export default SignupPage