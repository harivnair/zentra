import Navbar from '../../components/Navbar/Navbar'

export default function Dashboard() {
    const cards = [
        { color: 'bg-rose-300', value: '12', label: 'Upcoming Events' },
        { color: 'bg-emerald-300', value: '16', label: 'Pending Estimates' },
        { color: 'bg-violet-600', value: '05', label: 'Pending Enquiries' },
        { color: 'bg-lime-300', value: '12', label: 'Pending Client Bills' },
        { color: 'bg-rose-400', value: '16', label: 'Pending Vendor Bills' },
    ]

    const recent = [
        ['Annual Gala Dinner', 'June 25, 2025', 'Invoice Creation', 'Completed', 'Athel Mathew'],
        ['Allianz Annual Day', 'July 28, 2025', 'Tag Collection', 'Completed', 'Anand Menon'],
        ['Experion Team Meet', 'August 14, 2025', 'Venue Updations', 'In Progress', 'Sherin John'],
        ['Spring Gala', 'August 14, 2025', 'Guest Confirmation', 'In Progress', 'Athel Mathew'],
        ['IBM Annual Day', 'September 14, 2025', 'Deciding Venue', 'Not Started', 'Shilpa Kumar'],
    ]

    return (
        <Navbar>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">Hi, Arun!</h2>
                        <p className="text-sm text-gray-600">You have 12 Events active this week</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {cards.map((c) => (
                        <div key={c.label} className={`rounded-lg p-6 ${c.color} text-white shadow-sm`}>
                            <div className="text-3xl font-semibold">{c.value}</div>
                            <div className="mt-4 text-sm opacity-90">{c.label}</div>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                    <h3 className="font-semibold mb-4">Recent Activity</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-sm text-gray-500 border-b">
                                    <th className="py-3">Event Name</th>
                                    <th className="py-3">Event Date</th>
                                    <th className="py-3">Task</th>
                                    <th className="py-3">Status</th>
                                    <th className="py-3">Assignee</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-gray-700">
                                {recent.map((r) => (
                                    <tr key={r[0]} className="border-b last:border-b-0">
                                        <td className="py-4">{r[0]}</td>
                                        <td className="py-4">{r[1]}</td>
                                        <td className="py-4">{r[2]}</td>
                                        <td className="py-4">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs ${r[3] === 'Completed' ? 'bg-emerald-100 text-emerald-800' : r[3] === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-200 text-gray-700'}`}>
                                                {r[3]}
                                            </span>
                                        </td>
                                        <td className="py-4">{r[4]}</td>
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
