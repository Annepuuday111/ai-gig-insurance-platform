import React from "react";
import PlanCard from "../components/PlanCard";

export default function Plans() {

  const handleBuy = (plan) => {
    alert(`Buying ${plan} plan`);
  };

  return (

    <>
      <h2 className="text-2xl font-bold mb-6">
        Insurance Plans
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        <PlanCard
          plan="Basic"
          price={20}
          coverage={300}
          onBuy={() => handleBuy("Basic")}
        />

        <PlanCard
          plan="Standard"
          price={40}
          coverage={600}
          onBuy={() => handleBuy("Standard")}
        />

        <PlanCard
          plan="Premium"
          price={60}
          coverage={1000}
          onBuy={() => handleBuy("Premium")}
        />

      </div>
    </>
  );
}