import { useParams, Link } from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar'
import { useState } from 'react'

export default function EventDetails() {
    const { id } = useParams()
    const [tab, setTab] = useState<'overview' | 'checklist' | 'po' | 'client' | 'vendor' | 'expenses'>('overview')

    return (
        <Navbar>
            <div className="p-6 space-y-6">
                <div className="text-sm text-gray-600">
                    <Link to="/events" className="text-gray-500 hover:underline">Events</Link>
                    <span className="px-2">›</span>
                    <span className="font-semibold">Event Details</span>
                </div>

                <div className="bg-white text-gray-900 rounded-lg p-6 flex items-center justify-between border">
                    <h1 className="text-3xl font-semibold">Event #{id ?? '—'}</h1>
                </div>

                <div>
                    <nav role="tablist" aria-label="Event sections" className="border-b">
                        <div className="flex gap-8 text-sm">
                            <a role="tab" aria-selected={tab === 'overview'} className={`pb-3 cursor-pointer ${tab === 'overview' ? 'border-b-2 border-black font-medium text-black' : 'text-gray-600'}`} onClick={() => setTab('overview')}>Overview</a>
                            <a role="tab" aria-selected={tab === 'checklist'} className={`pb-3 cursor-pointer ${tab === 'checklist' ? 'border-b-2 border-black font-medium text-black' : 'text-gray-600'}`} onClick={() => setTab('checklist')}>Checklist</a>
                            <a role="tab" aria-selected={tab === 'po'} className={`pb-3 cursor-pointer ${tab === 'po' ? 'border-b-2 border-black font-medium text-black' : 'text-gray-600'}`} onClick={() => setTab('po')}>Purchase Order</a>
                            <a role="tab" aria-selected={tab === 'client'} className={`pb-3 cursor-pointer ${tab === 'client' ? 'border-b-2 border-black font-medium text-black' : 'text-gray-600'}`} onClick={() => setTab('client')}>Client Bills</a>
                            <a role="tab" aria-selected={tab === 'vendor'} className={`pb-3 cursor-pointer ${tab === 'vendor' ? 'border-b-2 border-black font-medium text-black' : 'text-gray-600'}`} onClick={() => setTab('vendor')}>Vendor Bills</a>
                            <a role="tab" aria-selected={tab === 'expenses'} className={`pb-3 cursor-pointer ${tab === 'expenses' ? 'border-b-2 border-black font-medium text-black' : 'text-gray-600'}`} onClick={() => setTab('expenses')}>Expenses</a>
                        </div>
                    </nav>

                    <div className="mt-6 grid grid-cols-3 gap-6">
                        <div className="p-6 bg-white rounded-lg shadow">
                            <div className="text-sm text-gray-500">Expected Expense</div>
                            <div className="text-2xl font-bold mt-3">₹12,55,000</div>
                        </div>
                        <div className="p-6 bg-white rounded-lg shadow">
                            <div className="text-sm text-gray-500">Actual Expense</div>
                            <div className="text-2xl font-bold mt-3">₹10,25,000</div>
                        </div>
                        <div className="p-6 bg-emerald-500 text-white rounded-lg shadow">
                            <div className="text-sm opacity-80">Profit</div>
                            <div className="text-2xl font-bold mt-3">₹2,30,000</div>
                        </div>
                    </div>

                </div>
            </div>
        </Navbar>
    )
}
