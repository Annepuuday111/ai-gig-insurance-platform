import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { registerUser } from "../api";
import { IconUser, IconPhone, IconLock } from "../components/Icons";

import bannerSmall from "../../../assets/Background.png";
import bannerLarge from "../../../assets/LandingBanner.png";

function genPassword(len = 8) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
    platform: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const submit = async () => {
    setError(null);
    setLoading(true);

    try {
      const payload = { ...form };

      if (!payload.password) payload.password = genPassword(10);

      const res = await registerUser(payload);

      if (res && res.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("userId", res.id);
        localStorage.setItem("userName", form.name || "");
        navigate("/dashboard");
      } else if (res && res.error) {
        setError(res.error);
      } else {
        setError("Unexpected response from server");
      }
    } catch (e) {
      setError(e.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">

      {/* NAVBAR */}
      <Navbar />

      {/* MOBILE VIEW */}
      <div className="lg:hidden max-w-md mx-auto px-4 py-6">

        {/* Banner */}
        <div
          className="w-full h-40 bg-cover bg-center rounded-t-lg"
          style={{ backgroundImage: `url(${bannerSmall})` }}
        />

        {/* Form */}
        <div className="bg-white p-6 rounded-b-lg shadow">

          <h2 className="text-xl font-semibold mb-4">Register</h2>

          <div className="space-y-3">

            {/* NAME */}
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400">
                <IconUser />
              </span>

              <input
                className="w-full border rounded-lg p-3 pl-10"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
            </div>

            {/* PHONE */}
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400">
                <IconPhone />
              </span>

              <input
                className="w-full border rounded-lg p-3 pl-10"
                placeholder="Phone Number"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
              />
            </div>

            {/* PLATFORM */}
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400">
                <IconLock />
              </span>

              <select
                className="w-full border rounded-lg p-3 pl-10"
                value={form.platform}
                onChange={(e) =>
                  setForm({ ...form, platform: e.target.value })
                }
              >
                <option value="" disabled>
                  Select Gig Platform
                </option>
                <option>Zomato</option>
                <option>Swiggy</option>
                <option>Amazon</option>
                <option>Zepto</option>
                <option>Blinkit</option>
              </select>
            </div>

            {/* BUTTON */}
            <button
              onClick={submit}
              className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg"
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <p className="text-center text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-green-600">
                Login
              </Link>
            </p>

          </div>

        </div>

      </div>

      {/* LARGE SCREEN VIEW */}
      <div
        className="hidden lg:flex min-h-[650px] xl:min-h-[720px] bg-cover bg-center items-center"
        style={{ backgroundImage: `url(${bannerLarge})` }}
      >

        <div className="max-w-6xl mx-auto w-full px-6">

          {/* FORM CARD */}
          <div className="max-w-md bg-white bg-opacity-95 p-8 rounded-xl shadow-xl">

            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Register
            </h2>

            <div className="space-y-4">

              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">
                  <IconUser />
                </span>

                <input
                  className="w-full border rounded-lg p-3 pl-10"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
              </div>

              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">
                  <IconPhone />
                </span>

                <input
                  className="w-full border rounded-lg p-3 pl-10"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                />
              </div>

              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">
                  <IconLock />
                </span>

                <select
                  className="w-full border rounded-lg p-3 pl-10"
                  value={form.platform}
                  onChange={(e) =>
                    setForm({ ...form, platform: e.target.value })
                  }
                >
                  <option value="" disabled>
                    Select Gig Platform
                  </option>
                  <option>Zomato</option>
                  <option>Swiggy</option>
                  <option>Amazon</option>
                  <option>Zepto</option>
                  <option>Blinkit</option>
                </select>
              </div>

              <button
                onClick={submit}
                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg"
              >
                {loading ? "Signing up..." : "Sign Up"}
              </button>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <p className="text-sm text-center">
                Already have an account?{" "}
                <Link to="/login" className="text-green-600">
                  Login
                </Link>
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}