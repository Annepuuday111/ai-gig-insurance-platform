package com.example.aiinsurance.repository;

import com.example.aiinsurance.model.ClaimRequest;
import com.example.aiinsurance.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClaimRequestRepository extends JpaRepository<ClaimRequest, Long> {
    List<ClaimRequest> findByUser(User user);
    List<ClaimRequest> findByStatus(ClaimRequest.Status status);
}
