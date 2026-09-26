import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import bg2 from '../../assets/bg2.png'

const LoginPage = () => {

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const onSubmit = async (data) => {

    setLoading(true)
    setError('')
    setSuccess('')

    try {

      const response = await fetch(
        'http://localhost:8000/thoughtbook/login',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          credentials: 'include',

          body: JSON.stringify({
            email: data.email,
            password: data.password
          })
        }
      )

      const result = await response.json()

      if (!response.ok) {
        setError(result.detail || 'Login failed')
        return
      }

      setSuccess('Login successful!')

      // Redirect to feed after successful login
      setTimeout(() => {
        window.location.href = '/feed'
      }, 500)

    } catch (err) {

      console.error(err)

      setError(
        'Unable to connect to the server. Please try again.'
      )

    } finally {

      setLoading(false)

    }
  }

  const handleGoogleLogin = () => {

    window.location.href =
      'http://localhost:8000/thoughtbook/login/google'

  }

  return (

    <div
      className="relative w-screen h-screen bg-cover bg-center bg-no-repeat flex flex-col justify-center items-center overflow-auto"
      style={{ backgroundImage: `url(${bg2})` }}
    >

      {/* Blurred Card Background */}

      <div className="absolute w-[500px] h-[500px] bg-white/30 backdrop-blur-sm rounded-3xl shadow-2xl" />

      {/* Card Content */}

      <div className="relative z-10 w-[500px] h-[500px] flex flex-col justify-start items-center gap-10">

        <div className="p-[10px] pt-8">

          <h1 className="text-5xl font-extrabold w-full text-center bg-gradient-to-r from-indigo-400 via-purple-500 to-indigo-700 bg-clip-text text-transparent">
            THOUGHTBOOK
          </h1>

          <p className="mt-3 text-gray-700 text-sm text-center">
            Share your thoughts. Express your feelings.
          </p>

        </div>

        <div className="flex flex-col justify-center items-center w-full h-full gap-10">

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col items-center gap-6 w-full"
          >

            {/* Email */}

            <div className="w-[400px]">

              <input
                type="email"
                {...register('email', {
                  required: 'Email is required'
                })}
                placeholder="Enter e-mail"
                className="bg-white/80 border border-indigo-400 rounded-xl w-full text-center p-3 outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
              />

              {errors.email && (
                <p className="text-red-600 text-sm text-center mt-1">
                  {errors.email.message}
                </p>
              )}

            </div>

            {/* Password */}

            <div className="w-[400px]">

              <input
                type="password"
                {...register('password', {
                  required: 'Password is required'
                })}
                placeholder="Enter password"
                className="bg-white/80 border border-indigo-400 rounded-xl w-full text-center p-3 outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
              />

              {errors.password && (
                <p className="text-red-600 text-sm text-center mt-1">
                  {errors.password.message}
                </p>
              )}

            </div>

            {/* Backend Error */}

            {error && (
              <div className="w-[400px] bg-red-100 border border-red-300 text-red-700 rounded-xl p-3 text-center text-sm">
                {error}
              </div>
            )}

            {/* Success */}

            {success && (
              <div className="w-[400px] bg-green-100 border border-green-300 text-green-700 rounded-xl p-3 text-center text-sm">
                {success}
              </div>
            )}

            {/* Login Button */}

            <input
              type="submit"
              value={loading ? 'LOGGING IN...' : 'LOGIN'}
              disabled={loading}
              className={`w-[400px] p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg transition ${
                loading
                  ? 'opacity-60 cursor-not-allowed'
                  : 'cursor-pointer hover:from-indigo-600 hover:to-purple-700'
              }`}
            />

          </form>

          <p>

            Don't have an account?{' '}

            <a
              href="/signup"
              className="text-blue-500 hover:text-blue-700"
            >
              Signup
            </a>

            {' / '}

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="text-blue-500 hover:text-blue-700"
            >
              Login with Google
            </button>

          </p>

        </div>

      </div>

    </div>
  )
}

export default LoginPage