import React from 'react'
import { useForm } from 'react-hook-form'

const FrontPage = () => {

    const { register, handleSubmit } = useForm()

    const onSubmit = (data) => {
        console.log(data)
    }

    return (
        <div className="w-full min-h-screen bg-gray-100">

            {/* Navbar */}
            <nav className="w-full h-[64px] bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-8">

                <span className="text-2xl font-extrabold tracking-wide bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                    THOUGHTBOOK
                </span>

                <div className="flex items-center gap-8">

                    <a
                        href="#"
                        className="text-gray-600 font-medium hover:text-indigo-600 transition duration-200"
                    >
                        Profile
                    </a>

                    <a
                        href="#"
                        className="text-gray-600 font-medium hover:text-indigo-600 transition duration-200"
                    >
                        Notifications
                    </a>

                </div>

            </nav>


            {/* Main Content */}
            <main className="max-w-3xl mx-auto px-6 py-10">

                {/* Create Post Card */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">

                    <div className="flex items-center gap-3 mb-5">

                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            T
                        </div>

                        <div>
                            <h2 className="font-semibold text-gray-800">
                                Create a post
                            </h2>

                            <p className="text-sm text-gray-500">
                                Share what's on your mind
                            </p>
                        </div>

                    </div>


                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-4"
                    >

                        <textarea
                            {...register('text-area')}
                            placeholder="What's in your mind?"
                            className="w-full min-h-[160px] bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-700 placeholder-gray-400 resize-none outline-none transition duration-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        />

                        <div className="flex justify-end">

                            <button
                                type="submit"
                                className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition duration-200"
                            >
                                Post
                            </button>

                        </div>

                    </form>

                </div>

            </main>

        </div>
    )
}

export default FrontPage