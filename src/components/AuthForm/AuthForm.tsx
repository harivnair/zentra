import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FormInput from '../FormInput/FormInput'
import Button from '../Button/Button'

export default function AuthForm() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        // no real auth — navigate to dashboard
        navigate('/dashboard')
    }

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <FormInput label="Email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <FormInput label="Password" placeholder="******" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <div className="mt-4">
                <Button type="submit" className="w-full btn-primary">Sign In</Button>
            </div>
            <div className="text-center mt-6">
                <a className="text-sm text-primary hover:underline" href="#">Forgot Password?</a>
            </div>
        </form>
    )
}
