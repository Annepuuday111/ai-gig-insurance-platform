package com.example.aiinsurance.service;

import com.example.aiinsurance.model.Plan;
import com.example.aiinsurance.repository.PlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.List;

@Service
public class PlanService {

    @Autowired
    private PlanRepository planRepository;

    /**
     * Seed the three default plans when the app starts if they don't exist yet.
     */
    @PostConstruct
    public void seedPlans() {
        if (planRepository.count() == 0) {
            planRepository.save(new Plan(
                "Basic",
                20.0,
                3000.0,
                "Low",
                "Accident Cover|Hospital Cash ₹500/day|24×7 Helpline|Free trial 7 days",
                7
            ));
            planRepository.save(new Plan(
                "Standard",
                40.0,
                6000.0,
                "Moderate",
                "Accident Cover|Hospital Cash ₹1000/day|Weather Payout|Income Protection|24×7 Helpline|Free trial 7 days",
                7
            ));
            planRepository.save(new Plan(
                "Premium",
                60.0,
                12000.0,
                "High",
                "Accident Cover|Hospital Cash ₹2000/day|Weather Payout|Income Protection|Life Cover ₹5L|Priority Claims|Dedicated Manager|Free trial 7 days",
                7
            ));
        }
    }

    public List<Plan> getAllPlans() {
        return planRepository.findAll();
    }

    public Plan getPlanById(Long id) {
        return planRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Plan not found: " + id));
    }
}
