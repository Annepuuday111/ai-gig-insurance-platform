import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import heroBg from "../../../assets/LandingBanner.png";
import { FaInfoCircle, FaEnvelope, FaShieldAlt, FaLifeRing } from "react-icons/fa";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 font-sans text-gray-800">

      <Navbar />

      {/* HERO SECTION */}
      <header
  className="relative w-full bg-no-repeat bg-center bg-cover lg:bg-[center_right]"
  style={{ backgroundImage: `url(${heroBg})` }}
>
  <div className="max-w-[1280px] mx-auto px-4 sm:px-6 
                  h-[180px] sm:h-[220px] lg:h-[320px]
                  flex items-center">

    <div className="max-w-xs sm:max-w-md lg:max-w-xl space-y-3">

      <h4 className="text-sm sm:text-lg lg:text-4xl font-bold text-slate-900 leading-snug">
        AI Insurance for Gig Workers
      </h4>

      <p className="text-[11px] sm:text-sm lg:text-lg text-gray-700 max-w-[220px] sm:max-w-md">
        Protect your income from unexpected disruptions like heavy rain,
        floods, pollution, or curfews.
      </p>

      <Link
        to="/register"
        className="inline-block px-4 py-2 sm:px-6 sm:py-3
                   bg-green-500 hover:bg-green-600
                   text-white text-xs sm:text-sm lg:text-base
                   rounded-lg shadow-md"
      >
        Get Started
      </Link>

    </div>

  </div>
</header>


      {/* FEATURES SECTION */}
      <section
        id="features"
        className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 py-6 bg-gradient-to-b from-gray-100 to-gray-200 rounded-xl"
      >

        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-gray-800 mb-6">
          Powerful Features
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">

          {/* CARD 1 */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-5 flex items-start gap-3 hover:shadow-lg transition">

            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-md flex items-center justify-center text-lg">
              🛡️
            </div>

            <div>
              <h4 className="font-semibold text-sm sm:text-base text-gray-800">
                AI Risk Prediction
              </h4>

              <p className="text-gray-600 text-xs sm:text-sm mt-1">
                Predict disruptions using weather and traffic data.
              </p>
            </div>

          </div>


          {/* CARD 2 */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-5 flex items-start gap-3 hover:shadow-lg transition">

            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-md flex items-center justify-center text-lg">
              📑
            </div>

            <div>
              <h4 className="font-semibold text-sm sm:text-base text-gray-800">
                Automatic Claims
              </h4>

              <p className="text-gray-600 text-xs sm:text-sm mt-1">
                Claims triggered automatically when disruption occurs.
              </p>
            </div>

          </div>


          {/* CARD 3 */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-5 flex items-start gap-3 hover:shadow-lg transition">

            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-md flex items-center justify-center text-lg">
              💰
            </div>

            <div>
              <h4 className="font-semibold text-sm sm:text-base text-gray-800">
                Instant Payout
              </h4>

              <p className="text-gray-600 text-xs sm:text-sm mt-1">
                Workers receive compensation instantly.
              </p>
            </div>

          </div>

        </div>
      </section>



      {/* HOW IT WORKS */}
      <section
        id="how"
        className="max-w-6xl mx-auto px-4 sm:px-6 py-6 mt-4 bg-gradient-to-b from-gray-100 to-gray-200 rounded-xl"
      >

        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-gray-800 mb-6">
          How It Works
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-5 text-center">

          {/* STEP 1 */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-5 hover:shadow-lg transition">

            <div className="w-10 h-10 mx-auto bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold mb-2">
              1
            </div>

            <h4 className="font-semibold text-xs sm:text-sm text-gray-800">
              Register
            </h4>

            <p className="text-xs text-gray-500 mt-1">
              Create your account.
            </p>

          </div>


          {/* STEP 2 */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-5 hover:shadow-lg transition">

            <div className="w-10 h-10 mx-auto bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mb-2">
              2
            </div>

            <h4 className="font-semibold text-xs sm:text-sm text-gray-800">
              Choose Plan
            </h4>

            <p className="text-xs text-gray-500 mt-1">
              Select your insurance plan.
            </p>

          </div>


          {/* STEP 3 */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-5 hover:shadow-lg transition">

            <div className="w-10 h-10 mx-auto bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-sm font-bold mb-2">
              3
            </div>

            <h4 className="font-semibold text-xs sm:text-sm text-gray-800">
              AI Detects
            </h4>

            <p className="text-xs text-gray-500 mt-1">
              AI monitors disruptions.
            </p>

          </div>


          {/* STEP 4 */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-5 hover:shadow-lg transition">

            <div className="w-10 h-10 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold mb-2">
              4
            </div>

            <h4 className="font-semibold text-xs sm:text-sm text-gray-800">
              Auto Payout
            </h4>

            <p className="text-xs text-gray-500 mt-1">
              Receive instant compensation.
            </p>

          </div>

        </div>
      </section>


      {/* FOOTER */}
      <footer className="bg-gray-100 border-t mt-10 py-8">

        <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center gap-6 sm:gap-10 text-gray-600 text-sm">

          <div className="flex items-center gap-2 hover:text-green-600 cursor-pointer transition">
            <FaInfoCircle className="text-green-500 text-lg" />
            <span>About</span>
          </div>

          <div className="flex items-center gap-2 hover:text-blue-600 cursor-pointer transition">
            <FaEnvelope className="text-blue-500 text-lg" />
            <span>Contact</span>
          </div>

          <div className="flex items-center gap-2 hover:text-purple-600 cursor-pointer transition">
            <FaShieldAlt className="text-purple-500 text-lg" />
            <span>Privacy</span>
          </div>

          <div className="flex items-center gap-2 hover:text-orange-600 cursor-pointer transition">
            <FaLifeRing className="text-orange-500 text-lg" />
            <span>Support</span>
          </div>

        </div>

        <div className="border-t mt-6 pt-4 text-center text-gray-400 text-xs">
          © 2026 AI Gig Insurance Platform. All rights reserved.
        </div>

      </footer>

    </div>
  );
}