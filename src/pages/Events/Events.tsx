import { useState, useRef, useLayoutEffect } from 'react'
import Navbar from '../../components/Navbar/Navbar'
import { Link } from 'react-router-dom'
import Popover from '../../components/Popover/Popover'

export default function Events() {
    const allRows = [
        ['Product Team Workshop', 'Olivia Rhye', 'June 25, 2025', 'June 25, 2025', 'Not Started'],
        ['Annual Gala Dinner', 'Anand Menon', 'June 20, 2025', 'June 20, 2025', 'In Progress'],
        ['GTech Marathon', 'Sitara Nair', 'June 12, 2025', 'June 12, 2025', 'Completed'],
        ["Allianz '26 Annual Day", 'June Nahas', 'June 06, 2025', 'June 06, 2025', 'Cancelled'],
    ]

    const [tab, setTab] = useState<'open' | 'cancelled' | 'closed'>('open')
    const tabsRef = useRef<HTMLDivElement | null>(null)
    const openRef = useRef<HTMLAnchorElement | null>(null)
    const cancelledRef = useRef<HTMLAnchorElement | null>(null)
    const closedRef = useRef<HTMLAnchorElement | null>(null)
    const underlineRef = useRef<HTMLDivElement | null>(null)

    // compute underline position/size
    useLayoutEffect(() => {
        const el = tab === 'open' ? openRef.current : tab === 'cancelled' ? cancelledRef.current : closedRef.current
        const container = tabsRef.current
        const underline = underlineRef.current
        if (!el || !container || !underline) return
        const elRect = el.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()
        const left = elRect.left - containerRect.left
        const width = elRect.width
        underline.style.transform = `translateX(${left}px)`
        underline.style.width = `${width}px`
    }, [tab])

    const filtered = allRows.filter(r => {
        const status = r[4]
        if (tab === 'open') return status === 'Not Started' || status === 'In Progress'
        if (tab === 'cancelled') return status === 'Cancelled'
        return status === 'Completed'
    })

    return (
        <Navbar>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-50 rounded-md flex items-center justify-center">
                        <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6"></path></svg>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Hi, Arun!</h2>
                        <p className="text-sm text-gray-600">You have 1 New <strong>Confirmed Event</strong> to review</p>
                    </div>
                </div>

                <div className="border-b pb-2">
                    <div className="relative">
                        <div ref={tabsRef} className="tabs">
                            <a
                                ref={openRef}
                                className={`tab ${tab === 'open' ? 'tab-active text-black' : 'text-black'}`}
                                style={{ color: '#000' }}
                                onClick={() => setTab('open')}
                            >
                                Open
                            </a>
                            <a
                                ref={cancelledRef}
                                className={`tab ${tab === 'cancelled' ? 'tab-active text-black' : 'text-black'}`}
                                style={{ color: '#000' }}
                                onClick={() => setTab('cancelled')}
                            >
                                Cancelled
                            </a>
                            <a
                                ref={closedRef}
                                className={`tab ${tab === 'closed' ? 'tab-active text-black' : 'text-black'}`}
                                style={{ color: '#000' }}
                                onClick={() => setTab('closed')}
                            >
                                Closed
                            </a>
                        </div>
                        <div ref={underlineRef} className="absolute bottom-0 h-0.5 bg-black transition-all duration-200" style={{ left: 0, width: 0 }} />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-sm text-gray-500 border-b">
                                    <th className="py-3">Event Name</th>
                                    <th className="py-3">Client</th>
                                    <th className="py-3">Start Date</th>
                                    <th className="py-3">End Date</th>
                                    <th className="py-3">Status</th>
                                    <th className="py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-gray-700">
                                {filtered.map((r, i) => (
                                    <tr key={r[0]} className="border-b last:border-b-0">
                                        <td className="py-4">
                                            <Link to={`/events/${i}`} className="text-gray-900 hover:underline">{r[0]}</Link>
                                        </td>
                                        <td className="py-4">{r[1]}</td>
                                        <td className="py-4">{r[2]}</td>
                                        <td className="py-4">{r[3]}</td>
                                        <td className="py-4">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs ${r[4] === 'Completed' ? 'bg-emerald-100 text-emerald-800' : r[4] === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : r[4] === 'Cancelled' ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-800'}`}>
                                                {r[4]}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right">
                                            <Popover
                                                trigger={(
                                                    <svg className="w-5 h-5 text-gray-600" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                                )}
                                            >
                                                <li>
                                                    <a>View Details</a>
                                                </li>
                                                <li>
                                                    <a>Edit</a>
                                                </li>
                                                <li>
                                                    <a>Delete</a>
                                                </li>
                                            </Popover>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Navbar>
    )
}
