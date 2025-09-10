package com.ambiguous.fixpoint.service;

import com.ambiguous.fixpoint.entity.Report;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EnhancedAIService {

    @Value("${openai.api.key:}")
    private String openaiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Generate enhanced description from image using OpenAI Vision API
     */
    public String generateEnhancedDescription(MultipartFile image, String category) {
        try {
            if (openaiApiKey == null || openaiApiKey.isEmpty()) {
                System.out.println("OpenAI API key not configured, using enhanced fallback description");
                return generateEnhancedFallbackDescription(image, category);
            }

            // Convert image to base64
            String base64Image = Base64.getEncoder().encodeToString(image.getBytes());
            
            // Build category-specific prompt
            String prompt = buildPromptForCategory(category);
            
            // Call OpenAI Vision API
            return callOpenAIVision(base64Image, prompt);
            
        } catch (Exception e) {
            System.out.println("OpenAI API error: " + e.getMessage());
            if (e.getMessage().contains("insufficient_quota") || e.getMessage().contains("429")) {
                System.out.println("API quota exceeded. Using enhanced fallback description.");
            }
            return generateEnhancedFallbackDescription(image, category);
        }
    }

    /**
     * Build specialized prompts based on report category
     */
    private String buildPromptForCategory(String category) {
        return switch (category) {
            case "ROADS_INFRASTRUCTURE" -> 
                "Analyze this road/infrastructure image and generate a detailed civic report description. " +
                "Focus on: 1) Type of damage (pothole, crack, broken pavement, etc.) " +
                "2) Size and severity of the issue 3) Impact on vehicle traffic and pedestrian safety " +
                "4) Surrounding context (road type, traffic level) " +
                "5) Urgency level based on safety risk. " +
                "Write in a professional tone suitable for municipal engineers and city officials.";
                
            case "SANITATION_WASTE" -> 
                "Analyze this waste/sanitation image and generate a detailed civic report description. " +
                "Focus on: 1) Type of waste (garbage, recycling, hazardous materials) " +
                "2) Quantity and spread of the waste 3) Health and environmental risks " +
                "4) Location context (residential, commercial, public area) " +
                "5) Urgency based on health implications. " +
                "Write in a professional tone for sanitation department officials.";
                
            case "STREET_LIGHTING" -> 
                "Analyze this street lighting image and generate a detailed civic report description. " +
                "Focus on: 1) Type of lighting issue (broken bulb, damaged fixture, electrical problem) " +
                "2) Number of affected lights 3) Impact on public safety and visibility " +
                "4) Time of day and lighting conditions 5) Pedestrian and vehicle safety risks. " +
                "Write professionally for electrical maintenance teams.";
                
            case "WATER_DRAINAGE" -> 
                "Analyze this water/drainage image and generate a detailed civic report description. " +
                "Focus on: 1) Type of water issue (flooding, blocked drain, pipe leak) " +
                "2) Water depth and affected area 3) Property damage risk " +
                "4) Traffic and pedestrian impact 5) Potential for escalation. " +
                "Write professionally for water management and engineering departments.";
                
            case "TRAFFIC_PARKING" -> 
                "Analyze this traffic/parking image and generate a detailed civic report description. " +
                "Focus on: 1) Type of violation or issue (illegal parking, traffic obstruction, damaged signs) " +
                "2) Impact on traffic flow 3) Safety risks to pedestrians and vehicles " +
                "4) Time and location context 5) Enforcement priority. " +
                "Write professionally for traffic management officials.";
                
            case "PUBLIC_SAFETY" -> 
                "Analyze this public safety image and generate a detailed civic report description. " +
                "Focus on: 1) Type of safety hazard (broken equipment, unsafe conditions, security concerns) " +
                "2) Risk level to public 3) Immediate danger assessment " +
                "4) Affected population (children, elderly, general public) 5) Required response time. " +
                "Write professionally for public safety and emergency response teams.";
                
            case "ENVIRONMENTAL" -> 
                "Analyze this environmental image and generate a detailed civic report description. " +
                "Focus on: 1) Type of environmental issue (pollution, contamination, ecological damage) " +
                "2) Scope and severity of impact 3) Environmental and health risks " +
                "4) Affected wildlife or vegetation 5) Long-term consequences if unaddressed. " +
                "Write professionally for environmental protection agencies.";
                
            default -> 
                "Analyze this civic issue image and generate a detailed professional report description. " +
                "Focus on: 1) What problem is shown 2) Severity and scope 3) Impact on citizens " +
                "4) Location and context details 5) Recommended urgency level. " +
                "Write in a clear, professional tone suitable for government officials and city administrators.";
        };
    }

    /**
     * Call OpenAI Vision API
     */
    private String callOpenAIVision(String base64Image, String prompt) {
        try {
            String url = "https://api.openai.com/v1/chat/completions";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openaiApiKey);
            
            Map<String, Object> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", List.of(
                Map.of("type", "text", "text", prompt),
                Map.of("type", "image_url", "image_url", 
                    Map.of("url", "data:image/jpeg;base64," + base64Image))
            ));
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "gpt-4o");
            requestBody.put("messages", List.of(message));
            requestBody.put("max_tokens", 400);
            requestBody.put("temperature", 0.3);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            
            JsonNode jsonResponse = objectMapper.readTree(response.getBody());
            return jsonResponse.path("choices").get(0).path("message").path("content").asText();
            
        } catch (Exception e) {
            System.out.println("OpenAI API error: " + e.getMessage());
            throw new RuntimeException("Failed to generate AI description", e);
        }
    }

    /**
     * Fallback description generation for when OpenAI is not available
     */
    private String generateFallbackDescription(MultipartFile image, String category) {
        String categoryDescription = switch (category) {
            case "ROADS_INFRASTRUCTURE" -> "road or infrastructure issue";
            case "SANITATION_WASTE" -> "waste or sanitation problem";
            case "STREET_LIGHTING" -> "street lighting issue";
            case "WATER_DRAINAGE" -> "water or drainage problem";
            case "TRAFFIC_PARKING" -> "traffic or parking violation";
            case "PUBLIC_SAFETY" -> "public safety concern";
            case "ENVIRONMENTAL" -> "environmental issue";
            default -> "civic issue";
        };
        
        return String.format(
            "This image shows a %s that requires attention from the relevant municipal department. " +
            "The issue appears to be located in a %s area and may impact local residents or infrastructure. " +
            "Further investigation is recommended to determine the appropriate response and priority level. " +
            "Image filename: %s",
            categoryDescription,
            category.toLowerCase().replace("_", " "),
            image.getOriginalFilename()
        );
    }

    /**
     * Auto-detect category from image (future enhancement)
     */
    public String detectCategory(MultipartFile image) {
        // TODO: Implement category detection using AI
        return "OTHER";
    }

    /**
     * Assess priority level based on description and category
     */
    public Report.Priority assessPriority(String description, String category) {
        try {
            if (openaiApiKey == null || openaiApiKey.isEmpty() || openaiApiKey.equals("your_openai_api_key_here")) {
                return assessPriorityFallback(description, category);
            }

            String prompt = String.format(
                "Based on this civic issue description, determine the priority level (URGENT, HIGH, MEDIUM, LOW):\n\n" +
                "Category: %s\n" +
                "Description: %s\n\n" +
                "Consider factors like:\n" +
                "- Immediate safety risks to public\n" +
                "- Infrastructure damage severity\n" +
                "- Number of people potentially affected\n" +
                "- Environmental or health hazards\n" +
                "- Potential for issue to worsen quickly\n\n" +
                "Respond with only one word: URGENT, HIGH, MEDIUM, or LOW",
                category, description
            );

            String response = callOpenAIText(prompt);
            
            return switch (response.trim().toUpperCase()) {
                case "URGENT" -> Report.Priority.URGENT;
                case "HIGH" -> Report.Priority.HIGH;
                case "LOW" -> Report.Priority.LOW;
                default -> Report.Priority.MEDIUM;
            };
            
        } catch (Exception e) {
            System.out.println("Priority assessment failed, using fallback logic: " + e.getMessage());
            return assessPriorityFallback(description, category);
        }
    }

    /**
     * Fallback priority assessment based on category and keywords
     */
    private Report.Priority assessPriorityFallback(String description, String category) {
        String desc = description.toLowerCase();
        String cat = category.toUpperCase();
        
        // Check for urgent keywords
        if (desc.contains("emergency") || desc.contains("danger") || desc.contains("hazard") || 
            desc.contains("immediate") || desc.contains("urgent") || desc.contains("safety risk")) {
            return Report.Priority.URGENT;
        }
        
        // Category-based priority assessment
        return switch (cat) {
            case "PUBLIC_SAFETY" -> {
                if (desc.contains("broken") || desc.contains("damaged") || desc.contains("unsafe")) {
                    yield Report.Priority.HIGH;
                }
                yield Report.Priority.URGENT; // Default for safety issues
            }
            case "ROADS_INFRASTRUCTURE" -> {
                if (desc.contains("pothole") || desc.contains("crack") || desc.contains("traffic")) {
                    yield Report.Priority.HIGH;
                }
                if (desc.contains("minor") || desc.contains("small")) {
                    yield Report.Priority.MEDIUM;
                }
                yield Report.Priority.HIGH; // Default for infrastructure
            }
            case "WATER_DRAINAGE" -> {
                if (desc.contains("flood") || desc.contains("overflow") || desc.contains("leak")) {
                    yield Report.Priority.HIGH;
                }
                yield Report.Priority.MEDIUM;
            }
            case "STREET_LIGHTING" -> {
                if (desc.contains("dark") || desc.contains("night") || desc.contains("broken")) {
                    yield Report.Priority.HIGH;
                }
                yield Report.Priority.MEDIUM;
            }
            case "SANITATION_WASTE" -> {
                if (desc.contains("overflow") || desc.contains("hazardous") || desc.contains("health")) {
                    yield Report.Priority.HIGH;
                }
                yield Report.Priority.MEDIUM;
            }
            case "TRAFFIC_PARKING" -> Report.Priority.MEDIUM;
            case "ENVIRONMENTAL" -> {
                if (desc.contains("pollution") || desc.contains("contamination")) {
                    yield Report.Priority.HIGH;
                }
                yield Report.Priority.MEDIUM;
            }
            default -> Report.Priority.MEDIUM;
        };
    }

    /**
     * Call OpenAI for text-only requests
     */
    private String callOpenAIText(String prompt) {
        try {
            String url = "https://api.openai.com/v1/chat/completions";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openaiApiKey);
            
            Map<String, Object> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", prompt);
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "gpt-4o-mini");
            requestBody.put("messages", List.of(message));
            requestBody.put("max_tokens", 100);
            requestBody.put("temperature", 0.1);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            
            JsonNode jsonResponse = objectMapper.readTree(response.getBody());
            return jsonResponse.path("choices").get(0).path("message").path("content").asText();
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to call OpenAI text API", e);
        }
    }

    /**
     * Generate enhanced fallback descriptions when OpenAI is unavailable
     */
    private String generateEnhancedFallbackDescription(MultipartFile image, String category) {
        String filename = image.getOriginalFilename();
        String fileInfo = filename != null ? " (File: " + filename + ")" : "";
        
        return switch (category.toUpperCase()) {
            case "ROADS_INFRASTRUCTURE" -> 
                "Infrastructure issue identified in the uploaded image" + fileInfo + ". " +
                "Based on the selected category, this appears to be a road or infrastructure problem requiring municipal attention. " +
                "Common issues in this category include: potholes, pavement cracks, damaged sidewalks, broken curbs, or deteriorated road surfaces. " +
                "The issue may impact vehicle traffic flow, pose safety risks to drivers and pedestrians, and require assessment by municipal engineers. " +
                "Recommended action: Site inspection to determine specific damage type, severity level, and appropriate repair methodology. " +
                "Priority assessment needed based on traffic volume and safety implications.";
                
            case "SANITATION_WASTE" -> 
                "Sanitation or waste management issue documented in the uploaded image" + fileInfo + ". " +
                "This category typically involves improper waste disposal, overflowing bins, illegal dumping, or recycling violations. " +
                "Potential health and environmental concerns may include: attraction of pests, unpleasant odors, groundwater contamination, " +
                "and aesthetic degradation of public spaces. The issue may require intervention from sanitation services, " +
                "environmental health inspectors, or waste management contractors. " +
                "Recommended action: Schedule cleanup services and investigate compliance with local waste disposal regulations. " +
                "Consider enforcement measures if violations are involved.";
                
            case "STREET_LIGHTING" -> 
                "Street lighting or electrical infrastructure issue captured in the uploaded image" + fileInfo + ". " +
                "This may involve non-functioning streetlights, damaged light fixtures, exposed electrical components, or inadequate illumination. " +
                "Poor lighting conditions can significantly impact public safety by increasing risks of accidents, crime, and reduced visibility " +
                "for both pedestrians and motorists, particularly during evening and nighttime hours. " +
                "Recommended action: Electrical inspection and repair by certified technicians. " +
                "Assess surrounding area lighting levels and consider upgrading to LED fixtures for improved efficiency and reliability.";
                
            case "WATER_DRAINAGE" -> 
                "Water management or drainage system issue identified in the uploaded image" + fileInfo + ". " +
                "This category encompasses flooding, blocked storm drains, water leaks, poor drainage infrastructure, or water accumulation problems. " +
                "Inadequate drainage can lead to property damage, traffic disruption, erosion, mosquito breeding grounds, " +
                "and potential contamination of local water supplies. The issue may escalate during heavy rainfall events. " +
                "Recommended action: Hydraulic assessment and drainage system inspection. " +
                "Clear blockages, repair damaged infrastructure, and improve water flow capacity as needed.";
                
            case "TRAFFIC_PARKING" -> 
                "Traffic management or parking violation issue documented in the uploaded image" + fileInfo + ". " +
                "This may include illegal parking, traffic signal malfunctions, damaged road signs, lane obstruction, or traffic flow problems. " +
                "Such issues can create safety hazards, increase accident risk, cause traffic congestion, and impact emergency vehicle access. " +
                "Proper traffic management is essential for maintaining orderly vehicle flow and pedestrian safety. " +
                "Recommended action: Traffic enforcement review and potential citation issuance. " +
                "Assess need for additional signage, traffic control measures, or parking regulation modifications.";
                
            case "PUBLIC_SAFETY" -> 
                "Public safety concern identified in the uploaded image" + fileInfo + ". " +
                "This high-priority category involves immediate threats to public welfare, including damaged playground equipment, " +
                "unsafe building conditions, hazardous materials, security vulnerabilities, or emergency situations. " +
                "Public safety issues require rapid response to prevent injuries, accidents, or harm to community members. " +
                "The situation may pose particular risks to vulnerable populations including children, elderly residents, and disabled individuals. " +
                "Recommended action: Immediate safety assessment and risk mitigation measures. " +
                "Consider emergency response protocols and temporary safety barriers if necessary.";
                
            case "ENVIRONMENTAL" -> 
                "Environmental concern documented in the uploaded image" + fileInfo + ". " +
                "This category addresses ecological issues such as pollution, environmental contamination, damaged vegetation, " +
                "air quality problems, noise pollution, or wildlife-related concerns. Environmental issues can have long-term impacts " +
                "on community health, local ecosystems, and quality of life for residents. " +
                "Some environmental problems may require coordination with state environmental agencies or specialized contractors. " +
                "Recommended action: Environmental impact assessment and consultation with environmental specialists. " +
                "Develop remediation plan and monitor for compliance with environmental regulations.";
                
            default -> 
                "Civic issue identified in the uploaded image" + fileInfo + ". " +
                "The uploaded image documents a municipal concern that requires attention from relevant city departments. " +
                "While the specific category classification may need refinement, the issue appears to impact public infrastructure, " +
                "services, or community welfare. A thorough assessment is recommended to determine the appropriate response " +
                "and assign responsibility to the correct municipal department or service provider. " +
                "Recommended action: Initial site inspection and proper categorization for efficient routing and resolution.";
        };
    }
}
