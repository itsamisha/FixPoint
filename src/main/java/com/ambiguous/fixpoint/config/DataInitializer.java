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
        if (userRepository.count() == 0) {
            System.out.println("Database is empty. Initializing sample data...");
            initializeTestUser();
            initializeOrganizations();
            System.out.println("Sample data initialization completed.");
        } else {
            System.out.println("Database already contains data (" + userRepository.count() + " users).");
            // Always ensure NGOs are present
            initializeNGOsIfMissing();
        }
    }

    private void initializeTestUser() {
        // Create a test user - called only when database is empty
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

    private void initializeOrganizations() {
        // Create organizations - called only when database is empty
        
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

        // NGOs and Non-Profit Organizations
        
        // BRAC
        Organization brac = new Organization();
        brac.setName("BRAC");
        brac.setType(Organization.OrganizationType.NGO);
        brac.setDescription("One of the largest NGOs in Bangladesh focusing on poverty alleviation and empowerment");
        brac.setCity("Dhaka");
        brac.setState("Dhaka Division");
        brac.setCountry("Bangladesh");
        brac.setContactEmail("info@brac.net");
        brac.setContactPhone("+880-2-9881265");
        brac.setAddress("BRAC Centre, 75 Mohakhali, Dhaka");
        brac.setServiceAreas("Nationwide");
        brac.setCategories("Education, Health, Community Development, Disaster Management, Women Empowerment");

        // Grameen Bank
        Organization grameen = new Organization();
        grameen.setName("Grameen Bank");
        grameen.setType(Organization.OrganizationType.NGO);
        grameen.setDescription("Microfinance organization and community development bank");
        grameen.setCity("Dhaka");
        grameen.setState("Dhaka Division");
        grameen.setCountry("Bangladesh");
        grameen.setContactEmail("info@grameen.com");
        grameen.setContactPhone("+880-2-8015693");
        grameen.setAddress("Mirpur 2, Dhaka");
        grameen.setServiceAreas("Nationwide");
        grameen.setCategories("Microfinance, Rural Development, Poverty Alleviation, Women Empowerment");

        // Proshika
        Organization proshika = new Organization();
        proshika.setName("Proshika Manobik Unnayan Kendra");
        proshika.setType(Organization.OrganizationType.NGO);
        proshika.setDescription("Human development organization focusing on social mobilization");
        proshika.setCity("Dhaka");
        proshika.setState("Dhaka Division");
        proshika.setCountry("Bangladesh");
        proshika.setContactEmail("info@proshika.org");
        proshika.setContactPhone("+880-2-8142331");
        proshika.setAddress("1/1-Ga, Section 2, Mirpur, Dhaka");
        proshika.setServiceAreas("Nationwide");
        proshika.setCategories("Human Development, Social Mobilization, Education, Health, Environment");

        // Dhaka Ahsania Mission
        Organization ahsania = new Organization();
        ahsania.setName("Dhaka Ahsania Mission");
        ahsania.setType(Organization.OrganizationType.NGO);
        ahsania.setDescription("Voluntary organization working for sustainable human development");
        ahsania.setCity("Dhaka");
        ahsania.setState("Dhaka Division");
        ahsania.setCountry("Bangladesh");
        ahsania.setContactEmail("info@ahsaniamission.org");
        ahsania.setContactPhone("+880-2-9123770");
        ahsania.setAddress("House 19, Road 12, Dhanmondi, Dhaka");
        ahsania.setServiceAreas("Nationwide");
        ahsania.setCategories("Education, Health, Disaster Management, Drug Abuse Prevention, Community Development");

        // ASA (Association for Social Advancement)
        Organization asa = new Organization();
        asa.setName("ASA - Association for Social Advancement");
        asa.setType(Organization.OrganizationType.NGO);
        asa.setDescription("Microfinance institution focused on poverty reduction");
        asa.setCity("Dhaka");
        asa.setState("Dhaka Division");
        asa.setCountry("Bangladesh");
        asa.setContactEmail("info@asa.org.bd");
        asa.setContactPhone("+880-2-8153005");
        asa.setAddress("ASA Tower, 23/3 Bir Uttam Kazi Nazrul Islam Avenue, Dhaka");
        asa.setServiceAreas("Nationwide");
        asa.setCategories("Microfinance, Rural Development, Poverty Alleviation, Health");

        // World Vision Bangladesh
        Organization worldVision = new Organization();
        worldVision.setName("World Vision Bangladesh");
        worldVision.setType(Organization.OrganizationType.NGO);
        worldVision.setDescription("International Christian humanitarian organization");
        worldVision.setCity("Dhaka");
        worldVision.setState("Dhaka Division");
        worldVision.setCountry("Bangladesh");
        worldVision.setContactEmail("info@worldvision.org.bd");
        worldVision.setContactPhone("+880-2-8837101");
        worldVision.setAddress("House 5/B, Road 2, Baridhara, Dhaka");
        worldVision.setServiceAreas("Nationwide");
        worldVision.setCategories("Child Protection, Education, Health, Emergency Response, Community Development");

        // ActionAid Bangladesh
        Organization actionAid = new Organization();
        actionAid.setName("ActionAid Bangladesh");
        actionAid.setType(Organization.OrganizationType.NGO);
        actionAid.setDescription("International anti-poverty organization working for social justice");
        actionAid.setCity("Dhaka");
        actionAid.setState("Dhaka Division");
        actionAid.setCountry("Bangladesh");
        actionAid.setContactEmail("info@actionaid.org");
        actionAid.setContactPhone("+880-2-8837109");
        actionAid.setAddress("House 7/E, Road 118, Gulshan 2, Dhaka");
        actionAid.setServiceAreas("Nationwide");
        actionAid.setCategories("Human Rights, Women Rights, Education, Emergency Response, Governance");

        // Plan International Bangladesh
        Organization planBd = new Organization();
        planBd.setName("Plan International Bangladesh");
        planBd.setType(Organization.OrganizationType.NGO);
        planBd.setDescription("International development organization focusing on children's rights");
        planBd.setCity("Dhaka");
        planBd.setState("Dhaka Division");
        planBd.setCountry("Bangladesh");
        planBd.setContactEmail("info@plan-international.org");
        planBd.setContactPhone("+880-2-8837201");
        planBd.setAddress("House 26, Road 6, Baridhara, Dhaka");
        planBd.setServiceAreas("Nationwide");
        planBd.setCategories("Child Rights, Education, Health, Youth Development, Emergency Response");

        // Save the Children Bangladesh
        Organization saveChildren = new Organization();
        saveChildren.setName("Save the Children Bangladesh");
        saveChildren.setType(Organization.OrganizationType.NGO);
        saveChildren.setDescription("International organization working for children's rights and well-being");
        saveChildren.setCity("Dhaka");
        saveChildren.setState("Dhaka Division");
        saveChildren.setCountry("Bangladesh");
        saveChildren.setContactEmail("info@savethechildren.org");
        saveChildren.setContactPhone("+880-2-8837301");
        saveChildren.setAddress("House 37, Road 11, Block H, Banani, Dhaka");
        saveChildren.setServiceAreas("Nationwide");
        saveChildren.setCategories("Child Protection, Education, Health, Emergency Response, Child Rights");

        // OXFAM Bangladesh
        Organization oxfam = new Organization();
        oxfam.setName("OXFAM Bangladesh");
        oxfam.setType(Organization.OrganizationType.NGO);
        oxfam.setDescription("International confederation working to end global poverty");
        oxfam.setCity("Dhaka");
        oxfam.setState("Dhaka Division");
        oxfam.setCountry("Bangladesh");
        oxfam.setContactEmail("info@oxfam.org.bd");
        oxfam.setContactPhone("+880-2-8837401");
        oxfam.setAddress("House 4, Road 5, Baridhara, Dhaka");
        oxfam.setServiceAreas("Nationwide");
        oxfam.setCategories("Poverty Alleviation, Emergency Response, Women Rights, Climate Change, Governance");

        // CARE Bangladesh
        Organization care = new Organization();
        care.setName("CARE Bangladesh");
        care.setType(Organization.OrganizationType.NGO);
        care.setDescription("International humanitarian organization fighting global poverty");
        care.setCity("Dhaka");
        care.setState("Dhaka Division");
        care.setCountry("Bangladesh");
        care.setContactEmail("info@care.org.bd");
        care.setContactPhone("+880-2-8837501");
        care.setAddress("Gulshan Trade Centre, Plot 32, Road 53, Gulshan 2, Dhaka");
        care.setServiceAreas("Nationwide");
        care.setCategories("Women Empowerment, Emergency Response, Health, Climate Change, Economic Development");

        // Islamic Relief Bangladesh
        Organization islamicRelief = new Organization();
        islamicRelief.setName("Islamic Relief Bangladesh");
        islamicRelief.setType(Organization.OrganizationType.NGO);
        islamicRelief.setDescription("International humanitarian and development organization");
        islamicRelief.setCity("Dhaka");
        islamicRelief.setState("Dhaka Division");
        islamicRelief.setCountry("Bangladesh");
        islamicRelief.setContactEmail("info@islamic-relief.org.bd");
        islamicRelief.setContactPhone("+880-2-8837601");
        islamicRelief.setAddress("House 38, Road 27, Block K, Banani, Dhaka");
        islamicRelief.setServiceAreas("Nationwide");
        islamicRelief.setCategories("Emergency Response, Education, Health, Water & Sanitation, Orphan Care");

        // Green Movement Bangladesh
        Organization greenMovement = new Organization();
        greenMovement.setName("Green Movement Bangladesh");
        greenMovement.setType(Organization.OrganizationType.NGO);
        greenMovement.setDescription("Environmental organization working for sustainable development");
        greenMovement.setCity("Dhaka");
        greenMovement.setState("Dhaka Division");
        greenMovement.setCountry("Bangladesh");
        greenMovement.setContactEmail("info@greenmovement.org.bd");
        greenMovement.setContactPhone("+880-2-8837701");
        greenMovement.setAddress("House 45, Road 12A, Dhanmondi, Dhaka");
        greenMovement.setServiceAreas("Dhaka, Chittagong, Sylhet");
        greenMovement.setCategories("Environmental Protection, Climate Change, Tree Plantation, Waste Management, Renewable Energy");

        // Bangladesh Youth Development Society
        Organization byds = new Organization();
        byds.setName("Bangladesh Youth Development Society");
        byds.setType(Organization.OrganizationType.NGO);
        byds.setDescription("Organization dedicated to youth development and empowerment");
        byds.setCity("Dhaka");
        byds.setState("Dhaka Division");
        byds.setCountry("Bangladesh");
        byds.setContactEmail("info@byds.org.bd");
        byds.setContactPhone("+880-2-8837801");
        byds.setAddress("House 23, Road 8, Uttara Sector 3, Dhaka");
        byds.setServiceAreas("Dhaka, Chittagong, Rajshahi");
        byds.setCategories("Youth Development, Skills Training, Employment, Education, Leadership Development");

        // Bangladesh Women Development Society
        Organization bwds = new Organization();
        bwds.setName("Bangladesh Women Development Society");
        bwds.setType(Organization.OrganizationType.NGO);
        bwds.setDescription("Organization working for women's rights and empowerment");
        bwds.setCity("Dhaka");
        bwds.setState("Dhaka Division");
        bwds.setCountry("Bangladesh");
        bwds.setContactEmail("info@bwds.org.bd");
        bwds.setContactPhone("+880-2-8837901");
        bwds.setAddress("House 34, Road 15, Dhanmondi, Dhaka");
        bwds.setServiceAreas("Nationwide");
        bwds.setCategories("Women Rights, Gender Equality, Domestic Violence Prevention, Skills Training, Microfinance");

        // Save all organizations
        try {
            organizationService.createOrganization(dhakaCity);
            organizationService.createOrganization(dhakaSouth);
            organizationService.createOrganization(dhakaWasa);
            organizationService.createOrganization(dmp);
            organizationService.createOrganization(fireService);
            organizationService.createOrganization(doe);
            organizationService.createOrganization(brta);
            
            // NGOs
            organizationService.createOrganization(brac);
            organizationService.createOrganization(grameen);
            organizationService.createOrganization(proshika);
            organizationService.createOrganization(ahsania);
            organizationService.createOrganization(asa);
            organizationService.createOrganization(worldVision);
            organizationService.createOrganization(actionAid);
            organizationService.createOrganization(planBd);
            organizationService.createOrganization(saveChildren);
            organizationService.createOrganization(oxfam);
            organizationService.createOrganization(care);
            organizationService.createOrganization(islamicRelief);
            organizationService.createOrganization(greenMovement);
            organizationService.createOrganization(byds);
            organizationService.createOrganization(bwds);
            
            System.out.println("Sample organizations (including NGOs) created successfully!");
        } catch (Exception e) {
            System.err.println("Error creating sample organizations: " + e.getMessage());
        }
    }

    private void initializeNGOsIfMissing() {
        try {
            // Check if key NGOs already exist
            if (organizationService.getOrganizationByName("BRAC").isPresent()) {
                System.out.println("NGOs already initialized. Skipping NGO initialization.");
                return;
            }

            System.out.println("Initializing NGOs...");
            
            // BRAC
            Organization brac = new Organization();
            brac.setName("BRAC");
            brac.setType(Organization.OrganizationType.NGO);
            brac.setDescription("One of the largest NGOs in Bangladesh focusing on poverty alleviation and empowerment");
            brac.setCity("Dhaka");
            brac.setState("Dhaka Division");
            brac.setCountry("Bangladesh");
            brac.setContactEmail("info@brac.net");
            brac.setContactPhone("+880-2-9881265");
            brac.setAddress("BRAC Centre, 75 Mohakhali, Dhaka");
            brac.setServiceAreas("Nationwide");
            brac.setCategories("Education, Health, Community Development, Disaster Management, Women Empowerment");

            // Grameen Bank
            Organization grameen = new Organization();
            grameen.setName("Grameen Bank");
            grameen.setType(Organization.OrganizationType.NGO);
            grameen.setDescription("Microfinance organization and community development bank");
            grameen.setCity("Dhaka");
            grameen.setState("Dhaka Division");
            grameen.setCountry("Bangladesh");
            grameen.setContactEmail("info@grameen.com");
            grameen.setContactPhone("+880-2-8015693");
            grameen.setAddress("Mirpur 2, Dhaka");
            grameen.setServiceAreas("Nationwide");
            grameen.setCategories("Microfinance, Rural Development, Poverty Alleviation, Women Empowerment");

            // Proshika
            Organization proshika = new Organization();
            proshika.setName("Proshika Manobik Unnayan Kendra");
            proshika.setType(Organization.OrganizationType.NGO);
            proshika.setDescription("Human development organization focusing on social mobilization");
            proshika.setCity("Dhaka");
            proshika.setState("Dhaka Division");
            proshika.setCountry("Bangladesh");
            proshika.setContactEmail("info@proshika.org");
            proshika.setContactPhone("+880-2-8142331");
            proshika.setAddress("1/1-Ga, Section 2, Mirpur, Dhaka");
            proshika.setServiceAreas("Nationwide");
            proshika.setCategories("Human Development, Social Mobilization, Education, Health, Environment");

            // Dhaka Ahsania Mission
            Organization ahsania = new Organization();
            ahsania.setName("Dhaka Ahsania Mission");
            ahsania.setType(Organization.OrganizationType.NGO);
            ahsania.setDescription("Voluntary organization working for sustainable human development");
            ahsania.setCity("Dhaka");
            ahsania.setState("Dhaka Division");
            ahsania.setCountry("Bangladesh");
            ahsania.setContactEmail("info@ahsaniamission.org");
            ahsania.setContactPhone("+880-2-9123770");
            ahsania.setAddress("House 19, Road 12, Dhanmondi, Dhaka");
            ahsania.setServiceAreas("Nationwide");
            ahsania.setCategories("Education, Health, Disaster Management, Drug Abuse Prevention, Community Development");

            // ASA (Association for Social Advancement)
            Organization asa = new Organization();
            asa.setName("ASA - Association for Social Advancement");
            asa.setType(Organization.OrganizationType.NGO);
            asa.setDescription("Microfinance institution focused on poverty reduction");
            asa.setCity("Dhaka");
            asa.setState("Dhaka Division");
            asa.setCountry("Bangladesh");
            asa.setContactEmail("info@asa.org.bd");
            asa.setContactPhone("+880-2-8153005");
            asa.setAddress("ASA Tower, 23/3 Bir Uttam Kazi Nazrul Islam Avenue, Dhaka");
            asa.setServiceAreas("Nationwide");
            asa.setCategories("Microfinance, Rural Development, Poverty Alleviation, Health");

            // World Vision Bangladesh
            Organization worldVision = new Organization();
            worldVision.setName("World Vision Bangladesh");
            worldVision.setType(Organization.OrganizationType.NGO);
            worldVision.setDescription("International Christian humanitarian organization");
            worldVision.setCity("Dhaka");
            worldVision.setState("Dhaka Division");
            worldVision.setCountry("Bangladesh");
            worldVision.setContactEmail("info@worldvision.org.bd");
            worldVision.setContactPhone("+880-2-8837101");
            worldVision.setAddress("House 5/B, Road 2, Baridhara, Dhaka");
            worldVision.setServiceAreas("Nationwide");
            worldVision.setCategories("Child Protection, Education, Health, Emergency Response, Community Development");

            // ActionAid Bangladesh
            Organization actionAid = new Organization();
            actionAid.setName("ActionAid Bangladesh");
            actionAid.setType(Organization.OrganizationType.NGO);
            actionAid.setDescription("International anti-poverty organization working for social justice");
            actionAid.setCity("Dhaka");
            actionAid.setState("Dhaka Division");
            actionAid.setCountry("Bangladesh");
            actionAid.setContactEmail("info@actionaid.org");
            actionAid.setContactPhone("+880-2-8837109");
            actionAid.setAddress("House 7/E, Road 118, Gulshan 2, Dhaka");
            actionAid.setServiceAreas("Nationwide");
            actionAid.setCategories("Human Rights, Women Rights, Education, Emergency Response, Governance");

            // Plan International Bangladesh
            Organization planBd = new Organization();
            planBd.setName("Plan International Bangladesh");
            planBd.setType(Organization.OrganizationType.NGO);
            planBd.setDescription("International development organization focusing on children's rights");
            planBd.setCity("Dhaka");
            planBd.setState("Dhaka Division");
            planBd.setCountry("Bangladesh");
            planBd.setContactEmail("info@plan-international.org");
            planBd.setContactPhone("+880-2-8837201");
            planBd.setAddress("House 26, Road 6, Baridhara, Dhaka");
            planBd.setServiceAreas("Nationwide");
            planBd.setCategories("Child Rights, Education, Health, Youth Development, Emergency Response");

            // Save the Children Bangladesh
            Organization saveChildren = new Organization();
            saveChildren.setName("Save the Children Bangladesh");
            saveChildren.setType(Organization.OrganizationType.NGO);
            saveChildren.setDescription("International organization working for children's rights and well-being");
            saveChildren.setCity("Dhaka");
            saveChildren.setState("Dhaka Division");
            saveChildren.setCountry("Bangladesh");
            saveChildren.setContactEmail("info@savethechildren.org");
            saveChildren.setContactPhone("+880-2-8837301");
            saveChildren.setAddress("House 37, Road 11, Block H, Banani, Dhaka");
            saveChildren.setServiceAreas("Nationwide");
            saveChildren.setCategories("Child Protection, Education, Health, Emergency Response, Child Rights");

            // OXFAM Bangladesh
            Organization oxfam = new Organization();
            oxfam.setName("OXFAM Bangladesh");
            oxfam.setType(Organization.OrganizationType.NGO);
            oxfam.setDescription("International confederation working to end global poverty");
            oxfam.setCity("Dhaka");
            oxfam.setState("Dhaka Division");
            oxfam.setCountry("Bangladesh");
            oxfam.setContactEmail("info@oxfam.org.bd");
            oxfam.setContactPhone("+880-2-8837401");
            oxfam.setAddress("House 4, Road 5, Baridhara, Dhaka");
            oxfam.setServiceAreas("Nationwide");
            oxfam.setCategories("Poverty Alleviation, Emergency Response, Women Rights, Climate Change, Governance");

            // CARE Bangladesh
            Organization care = new Organization();
            care.setName("CARE Bangladesh");
            care.setType(Organization.OrganizationType.NGO);
            care.setDescription("International humanitarian organization fighting global poverty");
            care.setCity("Dhaka");
            care.setState("Dhaka Division");
            care.setCountry("Bangladesh");
            care.setContactEmail("info@care.org.bd");
            care.setContactPhone("+880-2-8837501");
            care.setAddress("Gulshan Trade Centre, Plot 32, Road 53, Gulshan 2, Dhaka");
            care.setServiceAreas("Nationwide");
            care.setCategories("Women Empowerment, Emergency Response, Health, Climate Change, Economic Development");

            // Islamic Relief Bangladesh
            Organization islamicRelief = new Organization();
            islamicRelief.setName("Islamic Relief Bangladesh");
            islamicRelief.setType(Organization.OrganizationType.NGO);
            islamicRelief.setDescription("International humanitarian and development organization");
            islamicRelief.setCity("Dhaka");
            islamicRelief.setState("Dhaka Division");
            islamicRelief.setCountry("Bangladesh");
            islamicRelief.setContactEmail("info@islamic-relief.org.bd");
            islamicRelief.setContactPhone("+880-2-8837601");
            islamicRelief.setAddress("House 38, Road 27, Block K, Banani, Dhaka");
            islamicRelief.setServiceAreas("Nationwide");
            islamicRelief.setCategories("Emergency Response, Education, Health, Water & Sanitation, Orphan Care");

            // Green Movement Bangladesh
            Organization greenMovement = new Organization();
            greenMovement.setName("Green Movement Bangladesh");
            greenMovement.setType(Organization.OrganizationType.NGO);
            greenMovement.setDescription("Environmental organization working for sustainable development");
            greenMovement.setCity("Dhaka");
            greenMovement.setState("Dhaka Division");
            greenMovement.setCountry("Bangladesh");
            greenMovement.setContactEmail("info@greenmovement.org.bd");
            greenMovement.setContactPhone("+880-2-8837701");
            greenMovement.setAddress("House 45, Road 12A, Dhanmondi, Dhaka");
            greenMovement.setServiceAreas("Dhaka, Chittagong, Sylhet");
            greenMovement.setCategories("Environmental Protection, Climate Change, Tree Plantation, Waste Management, Renewable Energy");

            // Bangladesh Youth Development Society
            Organization byds = new Organization();
            byds.setName("Bangladesh Youth Development Society");
            byds.setType(Organization.OrganizationType.NGO);
            byds.setDescription("Organization dedicated to youth development and empowerment");
            byds.setCity("Dhaka");
            byds.setState("Dhaka Division");
            byds.setCountry("Bangladesh");
            byds.setContactEmail("info@byds.org.bd");
            byds.setContactPhone("+880-2-8837801");
            byds.setAddress("House 23, Road 8, Uttara Sector 3, Dhaka");
            byds.setServiceAreas("Dhaka, Chittagong, Rajshahi");
            byds.setCategories("Youth Development, Skills Training, Employment, Education, Leadership Development");

            // Bangladesh Women Development Society
            Organization bwds = new Organization();
            bwds.setName("Bangladesh Women Development Society");
            bwds.setType(Organization.OrganizationType.NGO);
            bwds.setDescription("Organization working for women's rights and empowerment");
            bwds.setCity("Dhaka");
            bwds.setState("Dhaka Division");
            bwds.setCountry("Bangladesh");
            bwds.setContactEmail("info@bwds.org.bd");
            bwds.setContactPhone("+880-2-8837901");
            bwds.setAddress("House 34, Road 15, Dhanmondi, Dhaka");
            bwds.setServiceAreas("Nationwide");
            bwds.setCategories("Women Rights, Gender Equality, Domestic Violence Prevention, Skills Training, Microfinance");

            // Save all NGOs
            int count = 0;
            try {
                organizationService.createOrganization(brac);
                count++;
                organizationService.createOrganization(grameen);
                count++;
                organizationService.createOrganization(proshika);
                count++;
                organizationService.createOrganization(ahsania);
                count++;
                organizationService.createOrganization(asa);
                count++;
                organizationService.createOrganization(worldVision);
                count++;
                organizationService.createOrganization(actionAid);
                count++;
                organizationService.createOrganization(planBd);
                count++;
                organizationService.createOrganization(saveChildren);
                count++;
                organizationService.createOrganization(oxfam);
                count++;
                organizationService.createOrganization(care);
                count++;
                organizationService.createOrganization(islamicRelief);
                count++;
                organizationService.createOrganization(greenMovement);
                count++;
                organizationService.createOrganization(byds);
                count++;
                organizationService.createOrganization(bwds);
                count++;

                System.out.println("Successfully initialized " + count + " NGOs!");
            } catch (Exception e) {
                System.err.println("Error creating NGOs: " + e.getMessage());
            }

        } catch (Exception e) {
            System.err.println("Error during NGO initialization: " + e.getMessage());
        }
    }
}
