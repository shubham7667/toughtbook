import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import Nav from './nav'

const FrontPage = () => {
  const { register, handleSubmit } = useForm()

  const [user, setUser] = useState(null)

  useEffect(() => {
    const getUser = async () => {
      const response = await fetch('http://localhost:8000/me', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    }

    getUser()
  }, [])

  const userName = user?.USER_NAME || 'Thoughtful writer'
  const userInitial = userName.charAt(0).toUpperCase()

  const onSubmit = (data) => {
    console.log(data)
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 ">
      <Nav />
      <div className='bg-red-500 w-50px   min-h-screen '>


      </div>
    </div>
  )
}

export default FrontPage