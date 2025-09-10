package com.ambiguous.fixpoint.controller;

import com.ambiguous.fixpoint.entity.Organization;
import com.ambiguous.fixpoint.service.OrganizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/public/admin/data")
@CrossOrigin(origins = "*")
public class DataInitController {

    @Autowired
    private OrganizationService organizationService;

    @PostMapping("/initialize-ngos")
    public ResponseEntity<Map<String, String>> initializeNGOs() {
        try {
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

            // Save all NGOs
            int count = 0;
            try {
                if (organizationService.getOrganizationByName("BRAC").isEmpty()) {
                    organizationService.createOrganization(brac);
                    count++;
                }
                if (organizationService.getOrganizationByName("Grameen Bank").isEmpty()) {
                    organizationService.createOrganization(grameen);
                    count++;
                }
                if (organizationService.getOrganizationByName("Proshika Manobik Unnayan Kendra").isEmpty()) {
                    organizationService.createOrganization(proshika);
                    count++;
                }
                if (organizationService.getOrganizationByName("Dhaka Ahsania Mission").isEmpty()) {
                    organizationService.createOrganization(ahsania);
                    count++;
                }
                if (organizationService.getOrganizationByName("ASA - Association for Social Advancement").isEmpty()) {
                    organizationService.createOrganization(asa);
                    count++;
                }
                if (organizationService.getOrganizationByName("World Vision Bangladesh").isEmpty()) {
                    organizationService.createOrganization(worldVision);
                    count++;
                }
                if (organizationService.getOrganizationByName("ActionAid Bangladesh").isEmpty()) {
                    organizationService.createOrganization(actionAid);
                    count++;
                }
                if (organizationService.getOrganizationByName("Plan International Bangladesh").isEmpty()) {
                    organizationService.createOrganization(planBd);
                    count++;
                }
                if (organizationService.getOrganizationByName("Save the Children Bangladesh").isEmpty()) {
                    organizationService.createOrganization(saveChildren);
                    count++;
                }
                if (organizationService.getOrganizationByName("OXFAM Bangladesh").isEmpty()) {
                    organizationService.createOrganization(oxfam);
                    count++;
                }
                if (organizationService.getOrganizationByName("CARE Bangladesh").isEmpty()) {
                    organizationService.createOrganization(care);
                    count++;
                }
                if (organizationService.getOrganizationByName("Islamic Relief Bangladesh").isEmpty()) {
                    organizationService.createOrganization(islamicRelief);
                    count++;
                }
                if (organizationService.getOrganizationByName("Green Movement Bangladesh").isEmpty()) {
                    organizationService.createOrganization(greenMovement);
                    count++;
                }
                if (organizationService.getOrganizationByName("Bangladesh Youth Development Society").isEmpty()) {
                    organizationService.createOrganization(byds);
                    count++;
                }
                if (organizationService.getOrganizationByName("Bangladesh Women Development Society").isEmpty()) {
                    organizationService.createOrganization(bwds);
                    count++;
                }

                Map<String, String> response = new HashMap<>();
                response.put("message", "Successfully initialized " + count + " new NGOs");
                response.put("status", "success");
                return ResponseEntity.ok(response);

            } catch (Exception e) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Error creating NGOs: " + e.getMessage());
                response.put("status", "error");
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Unexpected error: " + e.getMessage());
            response.put("status", "error");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/organizations/count")
    public ResponseEntity<Map<String, Object>> getOrganizationCount() {
        try {
            long totalCount = organizationService.getAllActiveOrganizations().size();
            long ngoCount = organizationService.getOrganizationsByType(Organization.OrganizationType.NGO).size();
            
            Map<String, Object> response = new HashMap<>();
            response.put("total", totalCount);
            response.put("ngos", ngoCount);
            response.put("status", "success");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Error fetching organization count: " + e.getMessage());
            response.put("status", "error");
            return ResponseEntity.badRequest().body(response);
        }
    }
}
