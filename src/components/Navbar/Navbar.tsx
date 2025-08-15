import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function Navbar({ children }: { children: ReactNode }) {
    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1 min-h-screen flex flex-col">
                <Topbar />
                <main className="flex-1 p-6 bg-gray-50">{children}</main>
            </div>
        </div>
    )
}
