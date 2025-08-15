import AuthLayout from '../../components/AuthLayout/AuthLayout'
import AuthForm from '../../components/AuthForm/AuthForm'
import illustrationUrl from '../../assets/login-home.svg'

export default function Login() {

    return (
        <AuthLayout illustration={illustrationUrl}>
            <div className="text-gray-600 mb-6 flex items-center">
                <div className="h-8 w-8 rounded-full border-2 border-gray-300 mr-2" />
                <div className="text-xl font-light">zentra</div>
            </div>

            <h2 className="text-3xl font-bold mb-2">Welcome back</h2>
            <p className="text-sm text-gray-500 mb-6">Welcome back! Please enter your details</p>

            <AuthForm />
        </AuthLayout>
    )
}
