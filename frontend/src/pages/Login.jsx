import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { loginUser } from "../api";
import { IconUser, IconLock } from "../components/Icons";

import bannerSmall from "../../../assets/Background.png";
import bannerLarge from "../../../assets/LandingBanner.png";

export default function Login() {

  const [form, setForm] = useState({
    id: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const submit = async () => {
    setError(null);
    setLoading(true);

    try {

      const res = await loginUser({
        identifier: form.id,
        password: form.password
      });

      if (res && res.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("userId", res.id);
        localStorage.setItem("userName", res.name || "");
        navigate("/dashboard");
      } else if (res && res.error) {
        setError(res.error);
      } else {
        setError("Invalid response from server");
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

          <h2 className="text-xl font-semibold mb-4">Login</h2>

          <div className="space-y-3">

            {/* USERNAME */}
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400">
                <IconUser />
              </span>

              <input
                className="w-full border rounded-lg p-3 pl-10"
                placeholder="Email or Phone"
                value={form.id}
                onChange={(e) =>
                  setForm({ ...form, id: e.target.value })
                }
              />
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400">
                <IconLock />
              </span>

              <input
                type="password"
                className="w-full border rounded-lg p-3 pl-10"
                placeholder="Password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
            </div>

            <button
              onClick={submit}
              className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            <div className="flex justify-between text-sm">

              <Link to="/forgot" className="text-gray-500">
                Forgot password?
              </Link>

              <Link to="/register" className="text-green-600">
                Register
              </Link>

            </div>

          </div>

        </div>

      </div>


      {/* LARGE SCREEN VIEW */}
      <div
        className="hidden lg:flex min-h-[650px] xl:min-h-[720px] bg-cover bg-center items-center"
        style={{ backgroundImage: `url(${bannerLarge})` }}
      >

        <div className="max-w-6xl mx-auto w-full px-6">

          {/* LOGIN CARD */}
          <div className="max-w-md bg-white bg-opacity-95 p-8 rounded-xl shadow-xl">

            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Login
            </h2>

            <div className="space-y-4">

              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">
                  <IconUser />
                </span>

                <input
                  className="w-full border rounded-lg p-3 pl-10"
                  placeholder="Email or Phone"
                  value={form.id}
                  onChange={(e) =>
                    setForm({ ...form, id: e.target.value })
                  }
                />
              </div>

              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">
                  <IconLock />
                </span>

                <input
                  type="password"
                  className="w-full border rounded-lg p-3 pl-10"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </div>

              <button
                onClick={submit}
                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg"
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}

              <div className="flex justify-between text-sm">

                <Link to="/forgot" className="text-gray-500">
                  Forgot password?
                </Link>

                <Link to="/register" className="text-green-600">
                  Register
                </Link>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  );
}