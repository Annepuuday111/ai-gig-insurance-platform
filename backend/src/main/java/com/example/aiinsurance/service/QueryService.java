package com.example.aiinsurance.service;

import com.example.aiinsurance.model.Query;
import com.example.aiinsurance.model.User;
import com.example.aiinsurance.repository.QueryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class QueryService {

    @Autowired
    private QueryRepository queryRepository;

    public Query create(User user, String question) {
        Query q = new Query(user, question);
        return queryRepository.save(q);
    }

    public List<Query> getForUser(User user) {
        return queryRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public List<Query> getAll() {
        return queryRepository.findAll();
    }

    public Optional<Query> findById(Long id) {
        return queryRepository.findById(id);
    }

    public Query save(Query q) {
        return queryRepository.save(q);
    }
}