import React from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { IconLogo, IconBell, IconChat, IconShield, IconCard, IconUser } from '../components/Icons'

function ScreenCard({title, children}){
  return (
    <div className="phone-mock">
      <div className="phone-frame-inner">
        <div className="phone-header">
          <div className="flex items-center gap-3"><IconLogo className="w-6 h-6"/><div className="font-semibold text-sm">Gig Insurance</div></div>
          <div className="flex items-center gap-3 text-gray-600"><IconBell className="w-5 h-5"/><IconChat className="w-5 h-5"/></div>
        </div>
        <div className="phone-content">
          <div className="p-3">{children}</div>
        </div>
        <div className="bottom-nav">
          <div className="flex flex-col items-center text-xs text-gray-600"><svg className="w-5 h-5 mb-1"/><div>Dashboard</div></div>
          <div className="flex flex-col items-center text-xs text-gray-600"><svg className="w-5 h-5 mb-1"/><div>Coverage</div></div>
          <div className="flex flex-col items-center text-xs text-gray-600"><svg className="w-5 h-5 mb-1"/><div>Claims</div></div>
          <div className="flex flex-col items-center text-xs text-gray-600"><svg className="w-5 h-5 mb-1"/><div>Profile</div></div>
        </div>
      </div>
    </div>
  )
}

export default function Wireframes(){
  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">UI Wireframe Gallery</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ScreenCard title="Landing / Splash">
            <div className="text-center">
              <div className="illustration mb-3">
                <svg width="140" height="80" viewBox="0 0 140 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="140" height="80" rx="8" fill="url(#g)"/>
                  <defs>
                    <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0" stopColor="#2563EB" stopOpacity="0.12" />
                      <stop offset="1" stopColor="#16A34A" stopOpacity="0.06" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <h2 className="text-lg font-semibold mb-1">AI Insurance for Gig Workers</h2>
              <p className="text-sm text-gray-600 mb-3">Protect your income from disruptions</p>
              <div className="flex justify-center gap-3">
                <button className="px-6 py-3 bg-primary text-white rounded">Get Started</button>
                <button className="px-6 py-3 border rounded">Login</button>
              </div>
            </div>
          </ScreenCard>

          <ScreenCard title="Register">
            <div className="max-w-md mx-auto">
              <div className="space-y-3">
                <input className="w-full p-3 border rounded" placeholder="Full name" />
                <input className="w-full p-3 border rounded" placeholder="Phone number" />
                <select className="w-full p-3 border rounded">
                  <option>Select Gig Platform</option>
                  <option>Zomato</option>
                  <option>Swiggy</option>
                </select>
                <button className="w-full py-3 bg-primary text-white rounded">Sign Up</button>
                <div className="text-center text-xs text-gray-500">Already have an account? <a className="text-primary">Login</a></div>
              </div>
            </div>
          </ScreenCard>

          <ScreenCard title="Login">
            <div className="max-w-md mx-auto">
              <div className="space-y-3">
                <input className="w-full p-3 border rounded" placeholder="Email or Phone" />
                <input className="w-full p-3 border rounded" placeholder="Password" />
                <div className="flex justify-between items-center">
                  <a className="text-xs text-gray-500">Forgot password?</a>
                  <button className="py-2 px-4 bg-primary text-white rounded">Login</button>
                </div>
                <div className="text-center text-xs text-gray-500">Don't have an account? <a className="text-primary">Register</a></div>
              </div>
            </div>
          </ScreenCard>

          <ScreenCard title="Dashboard">
            <div className="space-y-3">
              <div className="p-3 bg-white rounded shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500">Welcome,</div>
                    <div className="text-sm font-semibold">Aman Kumar</div>
                  </div>
                  <div className="text-sm text-gray-500">ID: GIG 382309</div>
                </div>
                <div className="mt-3 p-3 bg-green-50 rounded flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500">Coverage Status</div>
                    <div className="text-sm font-semibold text-green-600">Active</div>
                  </div>
                  <div className="text-xs text-gray-500">Heavy Rain Forecast</div>
                </div>
              </div>
              <div className="p-3 bg-white rounded shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500">Current Plan</div>
                    <div className="text-sm font-semibold">Standard Plan</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Weekly</div>
                    <div className="text-lg font-bold">₹40</div>
                  </div>
                </div>
                <div className="mt-3">
                  <button className="w-full py-2 bg-secondary text-white rounded">Upgrade Plan</button>
                </div>
              </div>
            </div>
          </ScreenCard>

          <ScreenCard title="Insurance Plans">
            <div className="space-y-3">
              <div className="p-3 bg-white rounded shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Basic Plan</div>
                  <div className="text-xs text-gray-500">₹300 Payout</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">₹20</div>
                  <div className="text-xs text-gray-400">/week</div>
                </div>
              </div>
              <div className="p-3 bg-white rounded shadow-sm flex items-center justify-between border-2 border-primary">
                <div>
                  <div className="text-sm font-semibold">Standard Plan</div>
                  <div className="text-xs text-gray-500">₹600 Payout</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">₹40</div>
                  <div className="text-xs text-gray-400">/week</div>
                </div>
              </div>
              <div className="p-3 bg-white rounded shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Premium Plan</div>
                  <div className="text-xs text-gray-500">₹1000 Payout</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">₹60</div>
                  <div className="text-xs text-gray-400">/week</div>
                </div>
              </div>
              <div className="mt-2">
                <button className="w-full py-3 bg-primary text-white rounded">Proceed to Payment</button>
              </div>
            </div>
          </ScreenCard>

          <ScreenCard title="Payment Screen">
            <div className="max-w-md">
              <div className="p-4 border rounded mb-3">
                <div className="text-sm text-gray-500">Selected Plan</div>
                <div className="text-lg font-semibold">Standard</div>
              </div>
              <div className="p-4 border rounded mb-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-gray-500">Weekly Premium</div>
                  <div className="font-semibold">₹40</div>
                  <div className="text-sm text-gray-500">Coverage</div>
                  <div className="font-semibold">₹600</div>
                </div>
              </div>
              <div className="flex gap-2 mb-3">
                <button className="flex-1 p-3 border rounded flex items-center gap-2 justify-center"><IconCard/>UPI</button>
                <button className="flex-1 p-3 border rounded flex items-center gap-2 justify-center"><IconCard/>Card</button>
              </div>
              <div className="flex justify-end"><button className="px-4 py-2 bg-accent text-white rounded">Pay Now</button></div>
            </div>
          </ScreenCard>

          <ScreenCard title="Claims">
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded flex justify-between items-center">
                <div>
                  <div className="font-medium">Heavy Rain Detected</div>
                  <div className="text-xs text-gray-500">Claim Amount: ₹600</div>
                </div>
                <div className="text-orange-500 font-semibold">Processing</div>
              </div>
              <div className="p-3 bg-gray-50 rounded flex justify-between items-center">
                <div>
                  <div className="font-medium">Claim Approved</div>
                  <div className="text-xs text-gray-500">₹600 credited</div>
                </div>
                <div className="text-green-600 font-semibold">Approved</div>
              </div>
            </div>
          </ScreenCard>

          <ScreenCard title="Notifications">
            <div className="space-y-2">
              <div className="p-3 bg-gray-50 rounded">Heavy rain detected in your zone — Claim initiated</div>
              <div className="p-3 bg-gray-50 rounded">₹600 payout processed</div>
              <div className="p-3 bg-gray-50 rounded">Weekly premium due ₹40</div>
            </div>
          </ScreenCard>

          <ScreenCard title="Chat Support">
            <div className="max-w-md mx-auto">
              <div className="p-3 bg-gray-50 rounded mb-3">Support: How can I help?</div>
              <div className="p-3 bg-primary text-white rounded mb-3 text-right">User: I have a question about payout</div>
              <div className="flex gap-2 items-center">
                <input className="flex-1 p-2 border rounded" placeholder="Type a message" />
                <button className="px-3 py-2 bg-primary text-white rounded">Send</button>
              </div>
            </div>
          </ScreenCard>

          <ScreenCard title="Profile">
            <div className="max-w-sm">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-primary font-bold">A</div>
                <div>
                  <div className="font-semibold">Arjun Kumar</div>
                  <div className="text-sm text-gray-500">Zomato · Standard</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-500">Phone</div>
                <div className="mb-2">+91 98765 43210</div>
                <button className="px-4 py-2 bg-red-500 text-white rounded">Logout</button>
              </div>
            </div>
          </ScreenCard>

        </div>
      </div>
    </div>
  )
}
