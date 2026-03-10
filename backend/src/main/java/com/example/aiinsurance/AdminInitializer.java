package com.example.aiinsurance;

import com.example.aiinsurance.model.Admin;
import com.example.aiinsurance.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class AdminInitializer implements CommandLineRunner {

    @Autowired
    private AdminService adminService;

    @Override
    public void run(String... args) throws Exception {
        // create default admin if not present
        // credentials updated per user request
        String defaultEmail = "Gigadmin@gmail.com".toLowerCase();
        String defaultPass = "gigadmin@123";
        // if a legacy admin with simple username exists, migrate its email
        Optional<Admin> legacy = adminService.findByEmail("Gigadmin".toLowerCase());
        if (legacy.isPresent()) {
            Admin a = legacy.get();
            if (!a.getEmail().equals(defaultEmail)) {
                a.setEmail(defaultEmail);
                adminService.save(a);
                System.out.println("Migrated legacy admin to new email: " + defaultEmail);
            }
        }
        if (adminService.findByEmail(defaultEmail).isEmpty()) {
            Admin admin = new Admin(defaultEmail, defaultPass);
            adminService.save(admin);
            System.out.println("Default admin created: " + defaultEmail);
        }

        // dump list of admins for debugging
        System.out.println("Current admins:");
        adminService.getAllAdmins().forEach(a -> System.out.println("  " + a.getId() + " -> " + a.getEmail()));

    }
}
