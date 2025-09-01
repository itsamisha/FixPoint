import { aiService } from './aiService';

// Define issue categories with descriptions for better AI understanding
export const ISSUE_CATEGORIES = {
  ROADS_INFRASTRUCTURE: {
    id: 'ROADS_INFRASTRUCTURE',
    name: 'Roads & Infrastructure',
    description: 'Roads, bridges, buildings, public facilities',
    keywords: ['road', 'bridge', 'building', 'construction', 'repair', 'damage', 'crack', 'hole', 'pothole', 'sidewalk', 'pavement'],
    icon: '🏗️',
    color: '#3B82F6',
    priority: 'medium'
  },
  WATER_DRAINAGE: {
    id: 'WATER_DRAINAGE',
    name: 'Water & Drainage',
    description: 'Water supply, drainage, sewage systems',
    keywords: ['water', 'drainage', 'sewage', 'pipe', 'leak', 'flood', 'overflow', 'clogged', 'drain'],
    icon: '💧',
    color: '#06B6D4',
    priority: 'high'
  },
  STREET_LIGHTING: {
    id: 'STREET_LIGHTING',
    name: 'Street Lighting',
    description: 'Street lights, public lighting systems',
    keywords: ['light', 'lighting', 'lamp', 'bulb', 'dark', 'broken', 'street light'],
    icon: '💡',
    color: '#F59E0B',
    priority: 'medium'
  },
  PUBLIC_SAFETY: {
    id: 'PUBLIC_SAFETY',
    name: 'Public Safety',
    description: 'Security, emergency situations, crime',
    keywords: ['security', 'emergency', 'danger', 'unsafe', 'crime', 'accident', 'fire', 'police', 'safety'],
    icon: '🚨',
    color: '#EF4444',
    priority: 'high'
  },
  ENVIRONMENTAL: {
    id: 'ENVIRONMENTAL',
    name: 'Environmental',
    description: 'Environmental issues, pollution, green spaces',
    keywords: ['pollution', 'environment', 'air', 'noise', 'smell', 'contamination', 'toxic', 'green'],
    icon: '🌱',
    color: '#10B981',
    priority: 'medium'
  },
  TRAFFIC_PARKING: {
    id: 'TRAFFIC_PARKING',
    name: 'Traffic & Parking',
    description: 'Traffic issues, parking problems, road signs',
    keywords: ['traffic', 'parking', 'vehicle', 'car', 'signal', 'sign', 'congestion', 'jam'],
    icon: '�',
    color: '#8B5CF6',
    priority: 'medium'
  },
  SANITATION_WASTE: {
    id: 'SANITATION_WASTE',
    name: 'Sanitation & Waste',
    description: 'Waste management, garbage collection, cleanliness',
    keywords: ['waste', 'garbage', 'trash', 'sanitation', 'clean', 'dirty', 'dump', 'recycle', 'collection'],
    icon: '🗑️',
    color: '#84CC16',
    priority: 'medium'
  },
  NOISE_POLLUTION: {
    id: 'NOISE_POLLUTION',
    name: 'Noise Pollution',
    description: 'Excessive noise, sound pollution',
    keywords: ['noise', 'loud', 'sound', 'music', 'construction', 'disturbance', 'quiet'],
    icon: '🔊',
    color: '#F97316',
    priority: 'low'
  },
  STRAY_ANIMALS: {
    id: 'STRAY_ANIMALS',
    name: 'Stray Animals',
    description: 'Stray dogs, cats, animal-related issues',
    keywords: ['dog', 'cat', 'animal', 'stray', 'pet', 'bite', 'aggressive', 'feeding'],
    icon: '�',
    color: '#A855F7',
    priority: 'medium'
  },
  ILLEGAL_CONSTRUCTION: {
    id: 'ILLEGAL_CONSTRUCTION',
    name: 'Illegal Construction',
    description: 'Unauthorized construction, building violations',
    keywords: ['illegal', 'unauthorized', 'construction', 'building', 'violation', 'permit', 'encroachment'],
    icon: '🚧',
    color: '#DC2626',
    priority: 'high'
  },
  OTHER: {
    id: 'OTHER',
    name: 'Other',
    description: 'Issues that don\'t fit other categories',
    keywords: [],
    icon: '📋',
    color: '#6B7280',
    priority: 'low'
  }
};

// Priority levels for automatic urgency assignment
export const PRIORITY_LEVELS = {
  LOW: { value: 'low', score: 1, color: '#10B981' },
  MEDIUM: { value: 'medium', score: 2, color: '#F59E0B' },
  HIGH: { value: 'high', score: 3, color: '#EF4444' },
  URGENT: { value: 'urgent', score: 4, color: '#DC2626' }
};

class CategorizationService {
  constructor() {
    this.urgencyKeywords = {
      urgent: ['emergency', 'urgent', 'immediate', 'critical', 'danger', 'fire', 'flood', 'accident', 'collapse'],
      high: ['broken', 'damaged', 'blocked', 'leak', 'outage', 'unsafe', 'problem', 'issue'],
      medium: ['repair', 'fix', 'improve', 'maintenance', 'update', 'replace'],
      low: ['suggestion', 'idea', 'enhancement', 'cosmetic', 'minor']
    };
  }

  // Main categorization function
  async categorizeIssue(description, imageFile = null, location = null) {
    try {
      console.log('Starting issue categorization...', { description, hasImage: !!imageFile, location });

      // Try AI-enhanced categorization first
      const aiResult = await this.categorizeWithAIComplete(description, imageFile, location);
      
      if (aiResult && aiResult.confidence > 0.5) {
        console.log('Using AI categorization result:', aiResult);
        return aiResult;
      }

      // Fallback to keyword-based categorization
      const keywordCategory = this.categorizeByKeywords(description);
      const priority = this.determinePriority(description);
      const confidence = 0.4; // Lower confidence for keyword-based

      const result = {
        category: keywordCategory,
        priority: priority,
        confidence: confidence,
        suggestedTags: this.generateTags(description, keywordCategory),
        reasoning: 'Keyword-based categorization (AI confidence too low or unavailable)'
      };

      console.log('Using keyword categorization result:', result);
      return result;

    } catch (error) {
      console.error('Error in issue categorization:', error);
      // Fallback to basic categorization
      return {
        category: this.categorizeByKeywords(description),
        priority: this.determinePriority(description),
        confidence: 0.3,
        suggestedTags: [],
        reasoning: 'Basic categorization due to error'
      };
    }
  }

  // Complete AI categorization with full response
  async categorizeWithAIComplete(description, imageFile = null, location = null) {
    try {
      const response = await aiService.categorizeIssue(description, imageFile, location);
      
      if (response) {
        // Transform backend response to match frontend format
        return {
          category: response.category || this.categorizeByKeywords(description),
          priority: response.priority || this.determinePriority(description),
          confidence: response.confidence || 0.5,
          suggestedTags: response.suggestedTags || [],
          reasoning: response.reasoning || 'AI-based categorization'
        };
      }

      return null;

    } catch (error) {
      console.error('Complete AI categorization failed:', error);
      return null;
    }
  }

  // Keyword-based categorization as fallback
  categorizeByKeywords(description) {
    const lowerDesc = description.toLowerCase();
    let bestMatch = ISSUE_CATEGORIES.OTHER;
    let maxMatches = 0;

    // Count keyword matches for each category
    Object.values(ISSUE_CATEGORIES).forEach(category => {
      const matches = category.keywords.filter(keyword => 
        lowerDesc.includes(keyword.toLowerCase())
      ).length;

      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = category;
      }
    });

    return bestMatch;
  }

  // AI-enhanced categorization
  async categorizeWithAI(description, imageFile = null, location = null) {
    try {
      const response = await aiService.categorizeIssue(description, imageFile, location);
      
      // The response should already be in the correct format from the backend
      if (response && response.category) {
        return response.category;
      }

      // Fallback if response format is unexpected
      return this.categorizeByKeywords(description);

    } catch (error) {
      console.error('AI categorization failed:', error);
      return this.categorizeByKeywords(description);
    }
  }

  // Determine priority based on urgency keywords
  determinePriority(description) {
    const lowerDesc = description.toLowerCase();

    // Check for urgent keywords
    if (this.urgencyKeywords.urgent.some(keyword => lowerDesc.includes(keyword))) {
      return PRIORITY_LEVELS.URGENT;
    }
    
    if (this.urgencyKeywords.high.some(keyword => lowerDesc.includes(keyword))) {
      return PRIORITY_LEVELS.HIGH;
    }
    
    if (this.urgencyKeywords.medium.some(keyword => lowerDesc.includes(keyword))) {
      return PRIORITY_LEVELS.MEDIUM;
    }

    return PRIORITY_LEVELS.LOW;
  }

  // Calculate confidence score
  calculateConfidence(keywordCategory, aiCategory, description) {
    let confidence = 0.5; // Base confidence

    // Increase confidence if keyword and AI agree
    if (keywordCategory.id === aiCategory.id) {
      confidence += 0.3;
    }

    // Increase confidence based on description length and detail
    if (description.length > 50) confidence += 0.1;
    if (description.length > 100) confidence += 0.1;

    // Decrease confidence for very short descriptions
    if (description.length < 20) confidence -= 0.2;

    return Math.min(Math.max(confidence, 0), 1);
  }

  // Generate relevant tags
  generateTags(description, category) {
    const tags = [];
    const lowerDesc = description.toLowerCase();

    // Add category-specific tags
    category.keywords.forEach(keyword => {
      if (lowerDesc.includes(keyword.toLowerCase())) {
        tags.push(keyword);
      }
    });

    // Add urgency tags
    Object.entries(this.urgencyKeywords).forEach(([level, keywords]) => {
      keywords.forEach(keyword => {
        if (lowerDesc.includes(keyword.toLowerCase())) {
          tags.push(level);
        }
      });
    });

    return [...new Set(tags)].slice(0, 5); // Remove duplicates and limit to 5 tags
  }

  // Generate reasoning explanation
  generateReasoning(description, category, priority) {
    return `Categorized as "${category.name}" based on content analysis. Priority set to "${priority.value}" due to detected urgency indicators.`;
  }

  // Get all categories for UI display
  getAllCategories() {
    return Object.values(ISSUE_CATEGORIES);
  }

  // Get category by ID
  getCategoryById(id) {
    return Object.values(ISSUE_CATEGORIES).find(cat => cat.id === id) || ISSUE_CATEGORIES.OTHER;
  }

  // Batch categorize multiple reports
  async batchCategorize(reports) {
    const results = [];
    for (const report of reports) {
      try {
        const result = await this.categorizeIssue(
          report.description, 
          report.imageFile, 
          report.location
        );
        results.push({ ...report, categorization: result });
      } catch (error) {
        console.error('Error categorizing report:', report.id, error);
        results.push({ 
          ...report, 
          categorization: {
            category: ISSUE_CATEGORIES.OTHER,
            priority: PRIORITY_LEVELS.LOW,
            confidence: 0,
            suggestedTags: [],
            reasoning: 'Categorization failed'
          }
        });
      }
    }
    return results;
  }

  // Analytics: Get category distribution
  getCategoryDistribution(reports) {
    const distribution = {};
    Object.values(ISSUE_CATEGORIES).forEach(category => {
      distribution[category.id] = {
        ...category,
        count: 0,
        percentage: 0
      };
    });

    reports.forEach(report => {
      const categoryId = report.category || 'other';
      if (distribution[categoryId]) {
        distribution[categoryId].count++;
      }
    });

    const total = reports.length;
    Object.keys(distribution).forEach(categoryId => {
      distribution[categoryId].percentage = total > 0 
        ? ((distribution[categoryId].count / total) * 100).toFixed(1)
        : 0;
    });

    return distribution;
  }
}

export const categorizationService = new CategorizationService();
export default categorizationService;
