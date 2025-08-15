import { NavLink } from 'react-router-dom'

type Item = {
    to: string
    label: string
    icon?: React.ReactNode
}

const defaultItems: Item[] = [
    { to: '/dashboard', label: 'Dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6"></path></svg> },
    { to: '/enquiries', label: 'Enquiries', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7H3v12a2 2 0 002 2z"></path></svg> },
    { to: '/events', label: 'Events', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3M3 11h18M7 21h10a2 2 0 002-2V9H5v10a2 2 0 002 2z"></path></svg> },
]

export default function Sidebar({ items = defaultItems }: { items?: Item[] }) {
    return (
        <aside className="w-64 bg-gray-700 text-white min-h-screen flex flex-col py-8">
            <div className="px-6 mb-8 flex items-center">
                <div className="h-12 w-12 rounded-full border-2 border-gray-300 mr-4 flex items-center justify-center">
                    <div className="w-7 h-7 rounded-full bg-white/20" />
                </div>
                <div className="text-2xl font-light tracking-tight">zentra</div>
            </div>

            <nav className="flex-1 px-4 space-y-4">
                {items.map((it) => (
                    <NavLink
                        key={it.to}
                        to={it.to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-l-full hover:bg-white/5 transition-colors ${isActive ? 'bg-white text-gray-800' : 'text-white/90'}`
                        }
                    >
                        <span className="text-white/80">{it.icon}</span>
                        <span className="text-sm font-medium">{it.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="px-4 mt-8">
                <button className="w-full text-left px-4 py-3 rounded-l-full hover:bg-white/5 transition-colors text-white/90">Logout</button>
            </div>
        </aside>
    )
}
