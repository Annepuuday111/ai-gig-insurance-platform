import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProfileCard from "../components/ProfileCard";

export default function Profile(){

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, []);

  const name = localStorage.getItem("userName") || "User";

  return (

    <>
      <h2 className="text-2xl font-bold mb-6">
        Profile
      </h2>

      <ProfileCard
        name={name}
        phone="9876543210"
        platform="Zomato"
        plan="Standard"
      />

    </>
  )

}