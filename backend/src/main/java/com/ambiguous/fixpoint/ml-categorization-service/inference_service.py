#!/usr/bin/env python3
"""
ML-based Issue Categorization Inference Service
Replaces API calls with trained PyTorch model inference
"""

import os
import json
import torch
import numpy as np
import pandas as pd
from PIL import Image
import torchvision.transforms as transforms 
from transformers import AutoTokenizer, AutoModel
from torchvision import models
import torch.nn as nn
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from datetime import datetime
import traceback

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
CONFIG = {
    'text_max_length': 512,
    'image_size': 224,
    'model_path': 'models/',
    'pretrained_model': 'bert-base-uncased',
    'device': 'cpu'  # Change to 'cuda' if GPU available
}

# Issue categories mapping (must match training)
CATEGORIES = {
    0: 'infrastructure',
    1: 'utilities', 
    2: 'safety',
    3: 'environment',
    4: 'transportation',
    5: 'healthcare',
    6: 'education',
    7: 'social_services',
    8: 'other'
}

# Priority levels mapping (must match training)
PRIORITIES = {
    0: 'low',
    1: 'medium',
    2: 'high',
    3: 'urgent'
}

# Category display names for frontend compatibility
CATEGORY_DISPLAY_NAMES = {
    'infrastructure': 'Roads & Infrastructure',
    'utilities': 'Water & Drainage',
    'safety': 'Public Safety',
    'environment': 'Environmental',
    'transportation': 'Traffic & Parking',
    'healthcare': 'Healthcare',
    'education': 'Education',
    'social_services': 'Social Services',
    'other': 'Other'
}

class MultiModalCategorizationModel(nn.Module):
    """Multi-modal model for issue categorization (same as training)"""
    
    def __init__(self, num_classes, num_priorities, hidden_size=256, dropout_rate=0.3):
        super(MultiModalCategorizationModel, self).__init__()
        
        # Text encoder (BERT)
        self.text_encoder = AutoModel.from_pretrained(CONFIG['pretrained_model'])
        self.text_projection = nn.Linear(768, hidden_size)
        
        # Image encoder (ResNet)
        self.image_encoder = models.resnet18(pretrained=False)
        self.image_encoder.fc = nn.Linear(512, hidden_size)
        
        # Location encoder
        self.location_encoder = nn.Linear(1, hidden_size)
        
        # Fusion layers
        self.fusion = nn.Sequential(
            nn.Linear(hidden_size * 3, hidden_size * 2),
            nn.ReLU(),
            nn.Dropout(dropout_rate),
            nn.Linear(hidden_size * 2, hidden_size),
            nn.ReLU(),
            nn.Dropout(dropout_rate)
        )
        
        # Output heads
        self.category_classifier = nn.Linear(hidden_size, num_classes)
        self.priority_classifier = nn.Linear(hidden_size, num_priorities)
        
        # Confidence estimator
        self.confidence_estimator = nn.Sequential(
            nn.Linear(hidden_size, hidden_size // 2),
            nn.ReLU(),
            nn.Dropout(dropout_rate),
            nn.Linear(hidden_size // 2, 1),
            nn.Sigmoid()
        )
        
    def forward(self, input_ids, attention_mask, image, location):
        # Text encoding
        text_outputs = self.text_encoder(input_ids=input_ids, attention_mask=attention_mask)
        text_features = text_outputs.last_hidden_state[:, 0, :]  # [CLS] token
        text_features = self.text_projection(text_features)
        
        # Image encoding
        image_features = self.image_encoder(image)
        
        # Location encoding
        location_features = self.location_encoder(location.unsqueeze(1))
        
        # Feature fusion
        combined_features = torch.cat([text_features, image_features, location_features], dim=1)
        fused_features = self.fusion(combined_features)
        
        # Predictions
        category_logits = self.category_classifier(fused_features)
        priority_logits = self.priority_classifier(fused_features)
        confidence = self.confidence_estimator(fused_features)
        
        return category_logits, priority_logits, confidence

class MLCategorizationService:
    """ML-based categorization service replacing API calls"""
    
    def __init__(self):
        self.device = torch.device(CONFIG['device'])
        self.model = None
        self.tokenizer = None
        self.image_transforms = None
        self.metadata = None
        
        # Initialize the service
        self._initialize_service()
    
    def _initialize_service(self):
        """Initialize the ML model and components"""
        try:
            logger.info("Initializing ML categorization service...")
            
            # Load model metadata
            metadata_path = os.path.join(CONFIG['model_path'], 'model_metadata.json')
            if os.path.exists(metadata_path):
                with open(metadata_path, 'r') as f:
                    self.metadata = json.load(f)
                logger.info("Loaded model metadata")
            else:
                logger.warning("Model metadata not found, using default configuration")
                self.metadata = {
                    'categories': {v: k for k, v in CATEGORIES.items()},
                    'priorities': {v: k for k, v in PRIORITIES.items()},
                    'config': CONFIG
                }
            
            # Initialize tokenizer
            tokenizer_path = os.path.join(CONFIG['model_path'])
            if os.path.exists(os.path.join(tokenizer_path, 'tokenizer.json')):
                self.tokenizer = AutoTokenizer.from_pretrained(tokenizer_path)
                logger.info("Loaded saved tokenizer")
            else:
                self.tokenizer = AutoTokenizer.from_pretrained(CONFIG['pretrained_model'])
                logger.info("Loaded pretrained tokenizer")
            
            # Initialize image transforms
            self.image_transforms = transforms.Compose([
                transforms.Resize((CONFIG['image_size'], CONFIG['image_size'])),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
            ])
            
            # Initialize model
            model_path = os.path.join(CONFIG['model_path'], 'best_model.pth')
            if not os.path.exists(model_path):
                model_path = os.path.join(CONFIG['model_path'], 'final_model.pth')
            
            if os.path.exists(model_path):
                self.model = MultiModalCategorizationModel(
                    num_classes=len(CATEGORIES),
                    num_priorities=len(PRIORITIES),
                    hidden_size=self.metadata.get('config', {}).get('hidden_size', 256),
                    dropout_rate=self.metadata.get('config', {}).get('dropout_rate', 0.3)
                )
                
                # Load trained weights
                state_dict = torch.load(model_path, map_location=self.device)
                self.model.load_state_dict(state_dict)
                self.model.to(self.device)
                self.model.eval()
                
                logger.info(f"Loaded trained model from {model_path}")
            else:
                logger.warning("No trained model found, using fallback categorization")
                self.model = None
            
            logger.info("ML categorization service initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing ML service: {str(e)}")
            logger.error(traceback.format_exc())
            self.model = None
    
    def preprocess_text(self, text):
        """Preprocess text input"""
        if not text or pd.isna(text):
            text = ""
        
        # Tokenize text
        encoding = self.tokenizer(
            str(text),
            truncation=True,
            padding='max_length',
            max_length=CONFIG['text_max_length'],
            return_tensors='pt'
        )
        
        return encoding
    
    def preprocess_image(self, image_file):
        """Preprocess image input"""
        try:
            if image_file and hasattr(image_file, 'read'):
                # Handle file-like object
                image = Image.open(image_file).convert('RGB')
            elif isinstance(image_file, str) and os.path.exists(image_file):
                # Handle file path
                image = Image.open(image_file).convert('RGB')
            else:
                # Create blank image if no image provided
                image = Image.new('RGB', (CONFIG['image_size'], CONFIG['image_size']), color='white')
            
            # Apply transforms
            image_tensor = self.image_transforms(image)
            return image_tensor.unsqueeze(0)  # Add batch dimension
            
        except Exception as e:
            logger.warning(f"Error processing image: {str(e)}")
            # Return blank image
            return torch.zeros(1, 3, CONFIG['image_size'], CONFIG['image_size'])
    
    def preprocess_location(self, location):
        """Preprocess location input"""
        try:
            if location and not pd.isna(location):
                # Simple location encoding (hash-based)
                location_hash = hash(str(location)) % 1000
                return torch.tensor([location_hash / 1000.0], dtype=torch.float)
            else:
                return torch.tensor([0.0], dtype=torch.float)
        except:
            return torch.tensor([0.0], dtype=torch.float)
    
    def categorize_issue(self, description, image_file=None, location=None):
        """Main categorization function replacing API calls"""
        try:
            logger.info(f"Categorizing issue: {description[:100]}...")
            
            # Use ML model if available
            if self.model is not None:
                return self._categorize_with_ml(description, image_file, location)
            else:
                # Fallback to keyword-based categorization
                return self._categorize_with_keywords(description)
                
        except Exception as e:
            logger.error(f"Error in ML categorization: {str(e)}")
            logger.error(traceback.format_exc())
            return self._categorize_with_keywords(description)
    
    def _categorize_with_ml(self, description, image_file, location):
        """Categorize using trained ML model"""
        try:
            # Preprocess inputs
            text_encoding = self.preprocess_text(description)
            image_tensor = self.preprocess_image(image_file)
            location_tensor = self.preprocess_location(location)
            
            # Move to device
            input_ids = text_encoding['input_ids'].to(self.device)
            attention_mask = text_encoding['attention_mask'].to(self.device)
            image_tensor = image_tensor.to(self.device)
            location_tensor = location_tensor.to(self.device)
            
            # Get predictions
            with torch.no_grad():
                category_logits, priority_logits, confidence = self.model(
                    input_ids, attention_mask, image_tensor, location_tensor
                )
                
                # Get predicted classes
                category_pred = torch.argmax(category_logits, dim=1).item()
                priority_pred = torch.argmax(priority_logits, dim=1).item()
                confidence_score = confidence.item()
                
                # Convert to human-readable format
                category_name = CATEGORIES.get(category_pred, 'other')
                priority_name = PRIORITIES.get(priority_pred, 'medium')
                
                # Generate reasoning
                reasoning = self._generate_reasoning(description, category_name, priority_name, confidence_score)
                
                # Generate tags
                tags = self._generate_tags(description, category_name, priority_name)
                
                result = {
                    'category': category_name,
                    'category_display': CATEGORY_DISPLAY_NAMES.get(category_name, category_name),
                    'priority': priority_name,
                    'confidence': confidence_score,
                    'suggestedTags': tags,
                    'reasoning': reasoning,
                    'method': 'ML Model'
                }
                
                logger.info(f"ML categorization result: {result}")
                return result
                
        except Exception as e:
            logger.error(f"Error in ML inference: {str(e)}")
            raise e
    
    def _categorize_with_keywords(self, description):
        """Fallback keyword-based categorization"""
        logger.info("Using keyword-based fallback categorization")
        
        # Simple keyword matching (similar to original service)
        description_lower = description.lower()
        
        # Category keywords
        category_keywords = {
            'infrastructure': ['road', 'bridge', 'building', 'construction', 'repair', 'damage', 'crack', 'hole', 'pothole', 'sidewalk', 'pavement'],
            'utilities': ['water', 'drainage', 'sewage', 'pipe', 'leak', 'flood', 'overflow', 'clogged', 'drain', 'light', 'power', 'electricity'],
            'safety': ['security', 'emergency', 'danger', 'unsafe', 'crime', 'accident', 'fire', 'police', 'safety', 'broken', 'glass'],
            'environment': ['pollution', 'environment', 'air', 'noise', 'smell', 'contamination', 'toxic', 'green', 'garbage', 'waste', 'trash'],
            'transportation': ['traffic', 'parking', 'vehicle', 'car', 'signal', 'sign', 'congestion', 'jam', 'bus', 'transport'],
            'healthcare': ['medical', 'clinic', 'hospital', 'health', 'ambulance', 'doctor', 'nurse', 'medicine'],
            'education': ['school', 'library', 'education', 'student', 'teacher', 'classroom', 'playground'],
            'social_services': ['community', 'center', 'social', 'service', 'senior', 'youth', 'program']
        }
        
        # Find best matching category
        best_category = 'other'
        max_matches = 0
        
        for category, keywords in category_keywords.items():
            matches = sum(1 for keyword in keywords if keyword in description_lower)
            if matches > max_matches:
                max_matches = matches
                best_category = category
        
        # Determine priority
        urgency_keywords = {
            'urgent': ['emergency', 'urgent', 'immediate', 'critical', 'danger', 'fire', 'flood', 'accident', 'collapse'],
            'high': ['broken', 'damaged', 'blocked', 'leak', 'outage', 'unsafe', 'problem', 'issue'],
            'medium': ['repair', 'fix', 'improve', 'maintenance', 'update', 'replace']
        }
        
        priority = 'low'  # default
        for p, keywords in urgency_keywords.items():
            if any(keyword in description_lower for keyword in keywords):
                priority = p
                break
        
        # Generate result
        result = {
            'category': best_category,
            'category_display': CATEGORY_DISPLAY_NAMES.get(best_category, best_category),
            'priority': priority,
            'confidence': 0.4,  # Lower confidence for keyword-based
            'suggestedTags': self._generate_tags(description, best_category, priority),
            'reasoning': 'Keyword-based categorization (ML model unavailable)',
            'method': 'Keyword Fallback'
        }
        
        logger.info(f"Keyword categorization result: {result}")
        return result
    
    def _generate_reasoning(self, description, category, priority, confidence):
        """Generate reasoning explanation"""
        reasoning_parts = []
        
        reasoning_parts.append(f"Categorized as '{CATEGORY_DISPLAY_NAMES.get(category, category)}'")
        reasoning_parts.append(f"Priority set to '{priority}'")
        
        if confidence > 0.8:
            reasoning_parts.append("High confidence prediction from ML model")
        elif confidence > 0.6:
            reasoning_parts.append("Moderate confidence prediction from ML model")
        else:
            reasoning_parts.append("Lower confidence prediction from ML model")
        
        # Add context based on description length
        if len(description) > 100:
            reasoning_parts.append("Detailed description provided")
        elif len(description) < 20:
            reasoning_parts.append("Brief description - consider providing more details")
        
        return ". ".join(reasoning_parts) + "."
    
    def _generate_tags(self, description, category, priority):
        """Generate relevant tags"""
        tags = []
        description_lower = description.lower()
        
        # Add category-specific tags
        category_keywords = {
            'infrastructure': ['road', 'bridge', 'building', 'construction', 'repair'],
            'utilities': ['water', 'drainage', 'sewage', 'pipe', 'light', 'power'],
            'safety': ['security', 'emergency', 'danger', 'unsafe', 'broken'],
            'environment': ['pollution', 'environment', 'garbage', 'waste', 'trash'],
            'transportation': ['traffic', 'parking', 'vehicle', 'signal', 'bus'],
            'healthcare': ['medical', 'clinic', 'hospital', 'health', 'ambulance'],
            'education': ['school', 'library', 'education', 'student', 'playground'],
            'social_services': ['community', 'center', 'social', 'service', 'senior']
        }
        
        if category in category_keywords:
            for keyword in category_keywords[category]:
                if keyword in description_lower:
                    tags.append(keyword)
        
        # Add priority tag
        tags.append(priority)
        
        # Add urgency tags
        urgency_keywords = ['emergency', 'urgent', 'critical', 'danger', 'broken', 'damaged']
        for keyword in urgency_keywords:
            if keyword in description_lower:
                tags.append(keyword)
                break
        
        return list(set(tags))[:5]  # Remove duplicates and limit to 5 tags
    
    def get_model_info(self):
        """Get information about the loaded model"""
        if self.model is not None:
            return {
                'status': 'loaded',
                'method': 'ML Model',
                'model_path': CONFIG['model_path'],
                'device': str(self.device),
                'metadata': self.metadata
            }
        else:
            return {
                'status': 'fallback',
                'method': 'Keyword-based',
                'model_path': CONFIG['model_path'],
                'device': str(self.device),
                'metadata': self.metadata
            }

# Initialize the service
ml_service = MLCategorizationService()

# Flask app for API endpoints
app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'ML Categorization Service',
        'timestamp': datetime.now().isoformat(),
        'model_info': ml_service.get_model_info()
    })

@app.route('/categorize', methods=['POST'])
def categorize_issue():
    """Main categorization endpoint replacing API calls"""
    try:
        # Get request data
        description = request.form.get('description', '')
        location = request.form.get('location', '')
        image_file = request.files.get('image') if 'image' in request.files else None
        
        if not description:
            return jsonify({'error': 'Description is required'}), 400
        
        # Perform categorization
        result = ml_service.categorize_issue(description, image_file, location)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in categorization endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/model-info', methods=['GET'])
def get_model_info():
    """Get model information"""
    return jsonify(ml_service.get_model_info())

if __name__ == '__main__':
    logger.info("Starting ML Categorization Service...")
    app.run(host='0.0.0.0', port=5001, debug=False)

