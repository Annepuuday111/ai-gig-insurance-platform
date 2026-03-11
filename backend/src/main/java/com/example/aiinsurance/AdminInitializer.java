package com.example.aiinsurance;

import com.example.aiinsurance.model.Admin;
import com.example.aiinsurance.model.Partner;
import com.example.aiinsurance.service.AdminService;
import com.example.aiinsurance.repository.PartnerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.List;

@Component
public class AdminInitializer implements CommandLineRunner {

    @Autowired
    private AdminService adminService;

    @Autowired
    private PartnerRepository partnerRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

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

        // Drop legacy bg_color column if it exists to fix NOT NULL constraint issues
        try {
            jdbcTemplate.execute("ALTER TABLE partners DROP COLUMN bg_color");
            System.out.println("Successfully dropped legacy bg_color column from partners table.");
        } catch (Exception e) {
            // Safe to ignore: column might already be dropped or table not created yet
            System.out.println("Note: bg_color column check (already dropped or table fresh).");
        }

        // dump list of admins for debugging
        System.out.println("Current admins:");
        adminService.getAllAdmins().forEach(a -> System.out.println("  " + a.getId() + " -> " + a.getEmail()));

        // Add default partners if empty
        if (partnerRepository.count() == 0) {
            List<Partner> defaults = List.of(
                new Partner("Zomato", "https://brandlogos.net/wp-content/uploads/2025/02/zomato-logo_brandlogos.net_9msh7.png", null, null, "#fca5a5"),
                new Partner("Swiggy", "https://cdn.prod.website-files.com/600ee75084e3fe0e5731624c/65b6224b00ab2b9163719086_swiggy-logo.svg", null, null, "#fdba74"),
                new Partner("Amazon", "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg", null, null, "#fcd34d"),
                new Partner("Zepto", "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Zepto_Logo.svg/1280px-Zepto_Logo.svg.png", null, null, "#c4b5fd"),
                new Partner("Blinkit", "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Dunzo_Logo.svg/960px-Dunzo_Logo.svg.png", null, null, "#86efac")
            );
            partnerRepository.saveAll(defaults);
            System.out.println("Created " + defaults.size() + " default partner platforms");
        }
    }
}
