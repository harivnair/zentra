
export default function Topbar() {
    return (
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b">
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">Hi, Arun!</h1>
                <p className="text-sm text-gray-600">You have 12 Events active this week</p>
            </div>

            <div className="flex items-center gap-4">
                <button className="btn btn-ghost btn-circle">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                </button>
            </div>
        </header>
    )
}
