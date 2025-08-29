package com.ambiguous.fixpoint.config;

import com.ambiguous.fixpoint.entity.Organization;
import com.ambiguous.fixpoint.entity.User;
import com.ambiguous.fixpoint.repository.UserRepository;
import com.ambiguous.fixpoint.service.OrganizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private OrganizationService organizationService;

    @Override
    public void run(String... args) throws Exception {
        initializeTestUser();
        initializeOrganizations();
    }

    private void initializeTestUser() {
        // Create a test user if no users exist
        if (userRepository.count() == 0) {
            User testUser = new User();
            testUser.setUsername("test");
            testUser.setEmail("test@example.com");
            testUser.setPassword(passwordEncoder.encode("password"));
            testUser.setFullName("Test User");
            testUser.setRole(User.Role.CITIZEN);
            testUser.setIsActive(true);
            testUser.setEmailVerified(true);
            
            userRepository.save(testUser);
            
            System.out.println("Test user created:");
            System.out.println("Username: test");
            System.out.println("Email: test@example.com");
            System.out.println("Password: password");
        }
    }

    private void initializeOrganizations() {
        // Check if organizations already exist
        if (!organizationService.getAllActiveOrganizations().isEmpty()) {
            return; // Data already initialized
        }

        // Dhaka City Corporation
        Organization dhakaCity = new Organization();
        dhakaCity.setName("Dhaka North City Corporation");
        dhakaCity.setType(Organization.OrganizationType.CITY_CORPORATION);
        dhakaCity.setDescription("Responsible for municipal services in North Dhaka");
        dhakaCity.setCity("Dhaka");
        dhakaCity.setState("Dhaka Division");
        dhakaCity.setCountry("Bangladesh");
        dhakaCity.setContactEmail("info@dncc.gov.bd");
        dhakaCity.setContactPhone("+880-2-8118841");
        dhakaCity.setAddress("Nagar Bhaban, Gulshan, Dhaka");
        dhakaCity.setServiceAreas("Gulshan, Banani, Uttara, Mirpur, Mohammadpur");
        dhakaCity.setCategories("Roads, Sanitation, Street Lighting, Water Drainage, Waste Management");
        
        // Dhaka South City Corporation
        Organization dhakaSouth = new Organization();
        dhakaSouth.setName("Dhaka South City Corporation");
        dhakaSouth.setType(Organization.OrganizationType.CITY_CORPORATION);
        dhakaSouth.setDescription("Responsible for municipal services in South Dhaka");
        dhakaSouth.setCity("Dhaka");
        dhakaSouth.setState("Dhaka Division");
        dhakaSouth.setCountry("Bangladesh");
        dhakaSouth.setContactEmail("info@dscc.gov.bd");
        dhakaSouth.setContactPhone("+880-2-7391234");
        dhakaSouth.setAddress("Nagar Bhaban, Dhanmondi, Dhaka");
        dhakaSouth.setServiceAreas("Dhanmondi, Wari, Old Dhaka, Motijheel, Ramna");
        dhakaSouth.setCategories("Roads, Sanitation, Street Lighting, Water Drainage, Waste Management");

        // Dhaka WASA
        Organization dhakaWasa = new Organization();
        dhakaWasa.setName("Dhaka Water Supply and Sewerage Authority");
        dhakaWasa.setType(Organization.OrganizationType.UTILITY_COMPANY);
        dhakaWasa.setDescription("Water supply and sewerage services for Dhaka city");
        dhakaWasa.setCity("Dhaka");
        dhakaWasa.setState("Dhaka Division");
        dhakaWasa.setCountry("Bangladesh");
        dhakaWasa.setContactEmail("info@dwasa.org.bd");
        dhakaWasa.setContactPhone("+880-2-9661051");
        dhakaWasa.setAddress("98 Kazi Nazrul Islam Avenue, Dhaka");
        dhakaWasa.setServiceAreas("Greater Dhaka Area");
        dhakaWasa.setCategories("Water Supply, Sewerage, Water Drainage");

        // Dhaka Metropolitan Police
        Organization dmp = new Organization();
        dmp.setName("Dhaka Metropolitan Police");
        dmp.setType(Organization.OrganizationType.POLICE_STATION);
        dmp.setDescription("Law enforcement and public safety in Dhaka metropolitan area");
        dmp.setCity("Dhaka");
        dmp.setState("Dhaka Division");
        dmp.setCountry("Bangladesh");
        dmp.setContactEmail("info@dmp.gov.bd");
        dmp.setContactPhone("+880-2-9661351");
        dmp.setAddress("DMP Headquarters, Ramna, Dhaka");
        dmp.setServiceAreas("Dhaka Metropolitan Area");
        dmp.setCategories("Public Safety, Traffic Management, Crime Prevention");

        // Fire Service and Civil Defence
        Organization fireService = new Organization();
        fireService.setName("Fire Service and Civil Defence - Dhaka");
        fireService.setType(Organization.OrganizationType.FIRE_DEPARTMENT);
        fireService.setDescription("Fire fighting and emergency rescue services");
        fireService.setCity("Dhaka");
        fireService.setState("Dhaka Division");
        fireService.setCountry("Bangladesh");
        fireService.setContactEmail("info@fireservice.gov.bd");
        fireService.setContactPhone("+880-2-9555555");
        fireService.setAddress("Fire Service Headquarters, Dhaka");
        fireService.setServiceAreas("Dhaka Metropolitan Area");
        fireService.setCategories("Fire Safety, Emergency Response, Rescue Operations");

        // Department of Environment
        Organization doe = new Organization();
        doe.setName("Department of Environment - Dhaka");
        doe.setType(Organization.OrganizationType.ENVIRONMENTAL_AGENCY);
        doe.setDescription("Environmental protection and pollution control");
        doe.setCity("Dhaka");
        doe.setState("Dhaka Division");
        doe.setCountry("Bangladesh");
        doe.setContactEmail("info@doe.gov.bd");
        doe.setContactPhone("+880-2-9898050");
        doe.setAddress("DoE Building, Agargaon, Dhaka");
        doe.setServiceAreas("Dhaka Division");
        doe.setCategories("Environmental Issues, Pollution Control, Noise Pollution");

        // BRTA
        Organization brta = new Organization();
        brta.setName("Bangladesh Road Transport Authority");
        brta.setType(Organization.OrganizationType.TRANSPORT_AUTHORITY);
        brta.setDescription("Road transport regulation and vehicle registration");
        brta.setCity("Dhaka");
        brta.setState("Dhaka Division");
        brta.setCountry("Bangladesh");
        brta.setContactEmail("info@brta.gov.bd");
        brta.setContactPhone("+880-2-8181818");
        brta.setAddress("BRTA Bhaban, Banani, Dhaka");
        brta.setServiceAreas("Nationwide");
        brta.setCategories("Traffic Management, Vehicle Registration, Road Safety");

        // Save all organizations
        try {
            organizationService.createOrganization(dhakaCity);
            organizationService.createOrganization(dhakaSouth);
            organizationService.createOrganization(dhakaWasa);
            organizationService.createOrganization(dmp);
            organizationService.createOrganization(fireService);
            organizationService.createOrganization(doe);
            organizationService.createOrganization(brta);
            
            System.out.println("Sample organizations created successfully!");
        } catch (Exception e) {
            System.err.println("Error creating sample organizations: " + e.getMessage());
        }
    }
}
