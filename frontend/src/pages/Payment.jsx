import React from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

export default function Payment(){
  const { state } = useLocation()
  const plan = state?.plan || 'Standard'
  const price = state?.price || 40
  const coverage = state?.coverage || 600

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        <Sidebar />
        <main className="flex-1">
          <div className="card max-w-xl">
            <h3 className="text-lg font-semibold mb-2">Payment</h3>
            <div className="text-sm text-gray-500 mb-4">Selected plan: <strong>{plan}</strong></div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="p-3 bg-gray-50 rounded">Weekly premium</div>
              <div className="p-3">₹{price}</div>
              <div className="p-3 bg-gray-50 rounded">Coverage</div>
              <div className="p-3">₹{coverage}</div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Payment Options</h4>
              <div className="flex gap-3">
                <button className="px-3 py-2 border rounded">UPI</button>
                <button className="px-3 py-2 border rounded">Card</button>
                <button className="px-3 py-2 border rounded">Wallet</button>
              </div>
            </div>

            <div className="flex justify-end">
              <button className="px-6 py-2 bg-accent text-white rounded">Pay Now</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
