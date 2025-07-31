'use client'

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { createClient } from "@/lib/supabase/client";

export default function PasswordAlteration(){
    const [isOpen, setIsOpen] = useState(false)
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const supabase = createClient()

    const minPasswordLength = 5; //Must be X amount of characters, alterable

    const handlePasswordChange = async () => {
        setError('')
        setSuccess('')

        if (!password || !confirmPassword){
            setError('Both fields are required')
            return
        }

        else if(password.length < minPasswordLength){
            setError('Password must be at least ' + minPasswordLength + ' characters.')
            return
        }

        else if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        const { error } = await supabase.auth.updateUser({ password })

        if (error) {
            setError(error.message)
        } else {
           setSuccess('Password updated successfully.')
            setPassword('')
            setConfirmPassword('')
            setTimeout(() => {
                setIsOpen(false)
                clearForm()
            }, 1000) 
        }
    }

    const clearForm = () => {
        setPassword('')
        setConfirmPassword('')
        setError('')
        setSuccess('')
    }

    const handleCancel = () => {
        clearForm()
        setIsOpen(false)
    }

    return (
    <>
      <Button onClick={() => setIsOpen(true)} className="w-full max-w-xs md:w-48">
        Edit Password
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Change Password</h2>

            <div className="space-y-3">
              <Input
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              {success && <p className="text-sm text-green-500">{success}</p>}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button onClick={handlePasswordChange}>Update</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}