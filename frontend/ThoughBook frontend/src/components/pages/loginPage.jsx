import React from 'react'
import { useForm } from 'react-hook-form'
import bg2 from '../../assets/bg2.png'

const LoginPage = () => {
  const { register, handleSubmit } = useForm()

  const onSubmit = (data) => {
    console.log(data)
  }

  return (
    <div
      className="relative w-screen h-screen bg-cover bg-center bg-no-repeat flex flex-col justify-center items-center overflow-auto"
      style={{ backgroundImage: `url(${bg2})` }}
    >

      {/* Blurred Card Background */}
      <div className="absolute w-[500px] h-[500px] bg-white/30 backdrop-blur-sm rounded-3xl shadow-2xl" />

      {/* Card Content - NOT Blurred */}
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
            method="POST"
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col items-center gap-6 w-full"
          >

            <input
              type="text"
              {...register('email')}
              placeholder="Enter e-mail"
              className="bg-white/80 border border-indigo-400 rounded-xl w-[400px] text-center p-3 outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
            />

            <input
              type="password"
              {...register('password')}
              placeholder="Enter password"
              className="bg-white/80 border border-indigo-400 rounded-xl w-[400px] text-center p-3 outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
            />

            <input
              type="submit"
              value="LOGIN"
              className="w-[400px] p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold cursor-pointer hover:from-indigo-600 hover:to-purple-700 transition shadow-lg"
            />

          </form>

          <p>don't have an account <a href="/signup" className='text-blue-500'>signup</a>/
          <a href="/google/login" className='text-blue-500'>login with google</a></p>

        </div>

      </div>

    </div>
  )
}

export default LoginPage