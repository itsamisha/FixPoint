package com.ambiguous.fixpoint.service;

import com.ambiguous.fixpoint.entity.Report;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class MockEnhancedAIService {

    private final Random random = new Random();

    public String generateEnhancedDescription(MultipartFile image, String category) {
        return generateMockDescription(category);
    }

    public Report.Priority assessPriority(String description, String category) {
        // Mock priority assessment based on keywords
        String lowerDesc = description.toLowerCase();
        
        if (lowerDesc.contains("emergency") || lowerDesc.contains("danger") || 
            lowerDesc.contains("hazard") || lowerDesc.contains("urgent") ||
            lowerDesc.contains("severe") || lowerDesc.contains("major")) {
            return Report.Priority.URGENT;
        } else if (lowerDesc.contains("significant") || lowerDesc.contains("damage") ||
                   lowerDesc.contains("blocking") || lowerDesc.contains("affecting")) {
            return Report.Priority.HIGH;
        } else if (lowerDesc.contains("minor") || lowerDesc.contains("small") ||
                   lowerDesc.contains("cosmetic")) {
            return Report.Priority.LOW;
        }
        
        return Report.Priority.MEDIUM;
    }

    public String detectCategory(MultipartFile image) {
        // Mock category detection
        String[] categories = {
            "ROADS_INFRASTRUCTURE", "SANITATION_WASTE", "STREET_LIGHTING",
            "WATER_DRAINAGE", "TRAFFIC_PARKING", "PUBLIC_SAFETY", "ENVIRONMENTAL"
        };
        return categories[random.nextInt(categories.length)];
    }

    private String generateMockDescription(String category) {
        Map<String, String[]> categoryDescriptions = new HashMap<>();
        
        categoryDescriptions.put("ROADS_INFRASTRUCTURE", new String[]{
            "Large pothole approximately 3 feet in diameter located in the main travel lane. The pothole has rough, deteriorated edges and appears to be approximately 4-6 inches deep, exposing the underlying road base. This represents a significant vehicular hazard that could cause tire damage, wheel alignment issues, or loss of vehicle control. The surrounding asphalt shows signs of additional cracking and weathering. Immediate repair is recommended to prevent further deterioration and ensure driver safety.",
            "Significant crack running diagonally across the roadway for approximately 15 feet. The crack is approximately 2-3 inches wide in some sections and shows signs of recent expansion. Water infiltration is evident, which could lead to freeze-thaw damage during winter months. The crack affects both the structural integrity of the roadway and creates a safety hazard for vehicles, particularly motorcycles and bicycles. Professional assessment and sealing are recommended.",
            "Damaged road sign post leaning at approximately 30-degree angle, likely due to vehicle impact or strong winds. The sign appears to be a regulatory traffic sign that is no longer clearly visible to approaching drivers. The bent metal post poses a potential safety hazard to pedestrians and vehicles. The concrete foundation appears intact but the mounting hardware has failed. Immediate replacement or repair is necessary to maintain traffic safety and regulatory compliance."
        });

        categoryDescriptions.put("SANITATION_WASTE", new String[]{
            "Overflowing waste container with garbage scattered in approximately 10-foot radius around the bin. The overflow appears to consist of household waste, food containers, and organic materials. The scattered debris creates an unsanitary condition that may attract rodents and insects. The waste container appears to be damaged or missing its lid, contributing to the spillage problem. Immediate cleanup and container repair or replacement is required.",
            "Large pile of illegally dumped construction debris including concrete blocks, wooden boards, and metal materials. The pile is approximately 6 feet high and 10 feet wide, blocking the sidewalk and creating a safety hazard for pedestrians. The materials appear to have been dumped recently and show no signs of official disposal permits. This illegal dumping violates municipal waste regulations and requires immediate removal and investigation.",
            "Broken waste collection bin with damaged hinges and missing wheels. The bin appears to have sustained impact damage, possibly from collection truck or vandalism. Waste materials are visible spilling from the damaged areas. The damaged bin cannot be properly positioned for collection, disrupting waste management services for the area. Replacement of the damaged bin is necessary to restore proper waste collection services."
        });

        categoryDescriptions.put("STREET_LIGHTING", new String[]{
            "Non-functional street light with completely dark fixture during nighttime hours. The light pole appears structurally sound but the lighting fixture is not operational. This creates a significant safety concern for pedestrians and drivers in this area during evening and nighttime hours. The surrounding area lacks adequate alternative lighting sources. The electrical connections may require inspection by qualified municipal electricians. Immediate repair is necessary to restore proper illumination and ensure public safety.",
            "Street light pole showing visible lean of approximately 15-20 degrees from vertical position. The base appears to have structural damage or foundation issues. While the light fixture may still be operational, the unstable pole represents a serious safety hazard that could result in complete failure during adverse weather conditions. Professional structural assessment and immediate stabilization or replacement is required.",
            "Damaged street light fixture with broken glass housing and exposed electrical components. The damage appears recent and may have been caused by vandalism or weather impact. Exposed wiring creates both electrical safety hazards and reduces the effectiveness of the lighting. The compromised fixture could allow water infiltration, leading to electrical failures or fire hazards. Immediate professional electrical repair and housing replacement is necessary."
        });

        categoryDescriptions.put("WATER_DRAINAGE", new String[]{
            "Blocked storm drain with significant water pooling covering approximately 20 square feet of roadway. The drain appears to be obstructed by debris including leaves, trash, and sediment buildup. Standing water creates hazardous driving conditions and could lead to flooding during heavy rainfall events. The blockage prevents proper stormwater management and may cause water to back up into adjacent properties. Immediate drain cleaning and debris removal is required.",
            "Visible water leak from underground pipe creating a constant stream flowing across the sidewalk and into the street. The leak appears to be from a municipal water line based on the clear water and consistent flow rate. The flowing water is creating erosion of the sidewalk foundation and could undermine the structural integrity of the pavement. Water waste and potential infrastructure damage make this a high-priority repair requiring immediate attention from municipal utilities.",
            "Severely damaged catch basin with collapsed or missing grate cover. The open drainage structure creates a serious safety hazard for pedestrians, cyclists, and vehicles. The exposed opening is approximately 2 feet by 3 feet and appears to be several feet deep. During rainfall, this damaged infrastructure cannot effectively manage stormwater runoff. Immediate temporary safety barriers and permanent grate replacement are essential to prevent accidents and restore drainage functionality."
        });

        categoryDescriptions.put("TRAFFIC_PARKING", new String[]{
            "Vehicle illegally parked in designated fire lane blocking emergency vehicle access. The vehicle has been positioned in a clearly marked no-parking zone with visible fire lane signage and red curb markings. This violation creates a serious public safety risk by potentially delaying emergency response times. The parking violation appears to be ongoing rather than temporary loading activity. Immediate towing and citation enforcement is recommended to ensure emergency access compliance.",
            "Faded or completely worn traffic lane markings making it difficult for drivers to determine proper lane positioning. The road surface shows minimal or no visible paint lines for approximately 100 feet of roadway. This condition creates safety hazards including increased risk of head-on collisions, improper lane changes, and general traffic confusion. The worn markings are particularly dangerous during wet weather or nighttime driving conditions. Immediate road marking refresh is necessary for traffic safety.",
            "Damaged or missing stop sign at intersection creating significant traffic safety hazard. The sign post may be present but the regulatory sign itself is either completely missing, severely damaged, or obscured. Drivers approaching the intersection cannot clearly determine right-of-way requirements, creating high risk of accidents. This represents an urgent traffic safety issue requiring immediate temporary stop sign installation and permanent replacement."
        });

        categoryDescriptions.put("PUBLIC_SAFETY", new String[]{
            "Damaged sidewalk with multiple large cracks and uneven surfaces creating serious pedestrian safety hazards. The sidewalk damage includes sections with vertical displacement of 2-3 inches, creating significant trip and fall risks. The damaged areas are particularly dangerous for elderly pedestrians, individuals using mobility aids, and during low-light conditions. Tree root growth or ground settling appears to be contributing to the ongoing deterioration. Immediate repair is necessary to prevent injuries and ensure ADA accessibility compliance.",
            "Broken or vandalized public safety equipment including emergency call box, street lighting, or safety barriers. The damaged equipment cannot provide its intended safety functions, potentially leaving citizens without access to emergency services or adequate protection. The damage may have been caused by vandalism, weather, or normal wear and requires professional assessment to determine repair versus replacement needs. Restoration of safety equipment functionality is critical for public protection.",
            "Hazardous debris or obstacles blocking public walkways or creating safety risks for pedestrians and vehicles. The debris may include fallen tree branches, construction materials, or other objects that were not properly secured or disposed of. The obstruction forces pedestrians into potentially dangerous alternate routes and may not be visible to drivers during certain lighting conditions. Immediate removal is necessary to restore safe pedestrian and vehicle movement."
        });

        categoryDescriptions.put("ENVIRONMENTAL", new String[]{
            "Dead or severely damaged tree showing signs of disease or structural instability that could pose safety risks to pedestrians and property. The tree exhibits visible decay, large dead branches, or significant lean that indicates potential for failure during wind events. The compromised tree structure threatens nearby sidewalks, vehicles, and buildings. Professional arborist assessment is recommended to determine if the tree can be treated and preserved or requires removal for public safety.",
            "Significant water pollution or contamination visible in local waterway including unusual coloration, debris, or suspected chemical discharge. The water contamination may pose environmental and health risks to local wildlife and potentially affect downstream water quality. The source of contamination requires investigation to determine if it represents illegal dumping, industrial discharge, or infrastructure failure. Immediate environmental assessment and potential remediation measures are necessary.",
            "Large accumulation of litter and debris in public green space or waterway affecting environmental quality and community aesthetics. The accumulated waste includes various materials that may pose risks to local wildlife and ecosystem health. The debris concentration suggests either inadequate maintenance or illegal dumping activities. Comprehensive cleanup and investigation of waste sources is necessary to restore environmental quality and prevent future accumulation."
        });

        String[] descriptions = categoryDescriptions.get(category);
        if (descriptions == null) {
            return "Detailed infrastructure issue observed in uploaded image requiring municipal attention. The condition shows signs of deterioration or damage that impacts public safety and service quality. Professional assessment and appropriate corrective action are recommended based on municipal maintenance standards and safety protocols.";
        }
        
        return descriptions[random.nextInt(descriptions.length)];
    }
}
