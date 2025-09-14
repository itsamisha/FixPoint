#!/usr/bin/env python3
"""
ML-based Issue Categorization Model Training Script
Replaces API-based categorization with a trained PyTorch model
"""

import os
import json
import pickle
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms, models
from PIL import Image
import cv2
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
import matplotlib.pyplot as plt
import seaborn as sns
from transformers import AutoTokenizer, AutoModel
import joblib
from datetime import datetime

# Configuration
CONFIG = {
    'text_max_length': 512,
    'image_size': 224,
    'batch_size': 16,
    'epochs': 50,
    'learning_rate': 0.001,
    'dropout_rate': 0.3,
    'hidden_size': 256,
    'num_classes': 9,
    'early_stopping_patience': 10,
    'model_save_path': 'models/',
    'data_path': 'data/',
    'pretrained_model': 'bert-base-uncased'
}

# Issue categories mapping
CATEGORIES = {
    'infrastructure': 0,
    'utilities': 1,
    'safety': 2,
    'environment': 3,
    'transportation': 4,
    'healthcare': 5,
    'education': 6,
    'social_services': 7,
    'other': 8
}

# Priority levels mapping
PRIORITIES = {
    'low': 0,
    'medium': 1,
    'high': 2,
    'urgent': 3
}

class IssueDataset(Dataset):
    """Custom dataset for issue categorization"""
    
    def __init__(self, data, tokenizer, image_transforms, max_length=512):
        self.data = data
        self.tokenizer = tokenizer
        self.image_transforms = image_transforms
        self.max_length = max_length
        
    def __len__(self):
        return len(self.data)
    
    def __getitem__(self, idx):
        item = self.data.iloc[idx]
        
        # Text encoding
        text = str(item['description'])
        if pd.isna(text):
            text = ""
            
        text_encoding = self.tokenizer(
            text,
            truncation=True,
            padding='max_length',
            max_length=self.max_length,
            return_tensors='pt'
        )
        
        # Image processing
        image_path = item.get('image_path', '')
        if image_path and os.path.exists(image_path):
            try:
                image = Image.open(image_path).convert('RGB')
                image = self.image_transforms(image)
            except:
                # Create a blank image if loading fails
                image = torch.zeros(3, CONFIG['image_size'], CONFIG['image_size'])
        else:
            # Create a blank image if no image
            image = torch.zeros(3, CONFIG['image_size'], CONFIG['image_size'])
        
        # Labels
        category = torch.tensor(item['category_id'], dtype=torch.long)
        priority = torch.tensor(item['priority_id'], dtype=torch.long)
        
        # Location encoding (simple one-hot for now)
        location = torch.tensor(item.get('location_encoded', 0), dtype=torch.float)
        
        return {
            'input_ids': text_encoding['input_ids'].squeeze(),
            'attention_mask': text_encoding['attention_mask'].squeeze(),
            'image': image,
            'location': location,
            'category': category,
            'priority': priority
        }

class MultiModalCategorizationModel(nn.Module):
    """Multi-modal model for issue categorization"""
    
    def __init__(self, num_classes, num_priorities, hidden_size=256, dropout_rate=0.3):
        super(MultiModalCategorizationModel, self).__init__()
        
        # Text encoder (BERT)
        self.text_encoder = AutoModel.from_pretrained(CONFIG['pretrained_model'])
        self.text_projection = nn.Linear(768, hidden_size)
        
        # Image encoder (ResNet)
        self.image_encoder = models.resnet18(pretrained=True)
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

def create_synthetic_data(num_samples=1000):
    """Create synthetic training data for demonstration"""
    print("Creating synthetic training data...")
    
    # Sample descriptions for each category
    category_descriptions = {
        'infrastructure': [
            "Road has large potholes causing damage to vehicles",
            "Bridge showing signs of structural damage",
            "Sidewalk is broken and unsafe for pedestrians",
            "Public building needs repair and maintenance"
        ],
        'utilities': [
            "Water pipe burst causing flooding in the area",
            "Street lights not working for past week",
            "Power outage affecting entire neighborhood",
            "Sewage system clogged and overflowing"
        ],
        'safety': [
            "Broken glass on playground posing safety risk",
            "Traffic signal malfunction causing accidents",
            "Fire hydrant damaged and leaking",
            "Emergency exit blocked by construction material"
        ],
        'environment': [
            "Garbage not collected for several days",
            "Air pollution from nearby factory",
            "Noise pollution from construction site",
            "Green space being destroyed for development"
        ],
        'transportation': [
            "Bus stop shelter damaged and unsafe",
            "Traffic congestion during peak hours",
            "Parking spaces occupied by abandoned vehicles",
            "Bicycle lane blocked by parked cars"
        ],
        'healthcare': [
            "Medical clinic needs better accessibility",
            "Ambulance access blocked by parked vehicles",
            "Health center lacks proper lighting",
            "Emergency room entrance difficult to find"
        ],
        'education': [
            "School playground equipment broken",
            "Library building needs renovation",
            "School bus stop lacks proper shelter",
            "Educational facility has poor ventilation"
        ],
        'social_services': [
            "Community center needs better facilities",
            "Senior citizen home lacks proper amenities",
            "Youth center requires renovation",
            "Social service office difficult to access"
        ],
        'other': [
            "General maintenance request",
            "Community improvement suggestion",
            "Minor issue that needs attention",
            "Other community concern"
        ]
    }
    
    # Priority keywords
    priority_keywords = {
        'urgent': ['emergency', 'danger', 'fire', 'flood', 'accident', 'collapse', 'critical'],
        'high': ['broken', 'damaged', 'unsafe', 'leak', 'outage', 'blocked'],
        'medium': ['repair', 'maintenance', 'improve', 'update', 'replace'],
        'low': ['suggestion', 'enhancement', 'cosmetic', 'minor']
    }
    
    data = []
    
    for category, descriptions in category_descriptions.items():
        for i in range(num_samples // len(category_descriptions)):
            # Select random description
            description = np.random.choice(descriptions)
            
            # Add some variation
            if np.random.random() > 0.7:
                description += f" at location {np.random.randint(1, 100)}"
            
            # Determine priority based on keywords
            priority = 'medium'  # default
            for p, keywords in priority_keywords.items():
                if any(keyword in description.lower() for keyword in keywords):
                    priority = p
                    break
            
            # Create data entry
            entry = {
                'description': description,
                'category': category,
                'category_id': CATEGORIES[category],
                'priority': priority,
                'priority_id': PRIORITIES[priority],
                'image_path': '',  # No real images in synthetic data
                'location': f"Area {np.random.randint(1, 20)}",
                'location_encoded': np.random.random(),
                'timestamp': datetime.now().isoformat()
            }
            
            data.append(entry)
    
    return pd.DataFrame(data)

def train_model(model, train_loader, val_loader, device, epochs=50):
    """Train the categorization model"""
    print("Starting model training...")
    
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=CONFIG['learning_rate'])
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', patience=5)
    
    best_val_loss = float('inf')
    patience_counter = 0
    train_losses = []
    val_losses = []
    
    for epoch in range(epochs):
        # Training phase
        model.train()
        train_loss = 0.0
        for batch in train_loader:
            optimizer.zero_grad()
            
            input_ids = batch['input_ids'].to(device)
            attention_mask = batch['attention_mask'].to(device)
            image = batch['image'].to(device)
            location = batch['location'].to(device)
            category = batch['category'].to(device)
            priority = batch['priority'].to(device)
            
            category_logits, priority_logits, confidence = model(
                input_ids, attention_mask, image, location
            )
            
            loss = criterion(category_logits, category) + criterion(priority_logits, priority)
            loss.backward()
            optimizer.step()
            
            train_loss += loss.item()
        
        # Validation phase
        model.eval()
        val_loss = 0.0
        with torch.no_grad():
            for batch in val_loader:
                input_ids = batch['input_ids'].to(device)
                attention_mask = batch['attention_mask'].to(device)
                image = batch['image'].to(device)
                location = batch['location'].to(device)
                category = batch['category'].to(device)
                priority = batch['priority'].to(device)
                
                category_logits, priority_logits, confidence = model(
                    input_ids, attention_mask, image, location
                )
                
                loss = criterion(category_logits, category) + criterion(priority_logits, priority)
                val_loss += loss.item()
        
        avg_train_loss = train_loss / len(train_loader)
        avg_val_loss = val_loss / len(val_loader)
        
        train_losses.append(avg_train_loss)
        val_losses.append(avg_val_loss)
        
        print(f"Epoch {epoch+1}/{epochs} - Train Loss: {avg_train_loss:.4f}, Val Loss: {avg_val_loss:.4f}")
        
        # Learning rate scheduling
        scheduler.step(avg_val_loss)
        
        # Early stopping
        if avg_val_loss < best_val_loss:
            best_val_loss = avg_val_loss
            patience_counter = 0
            # Save best model
            torch.save(model.state_dict(), os.path.join(CONFIG['model_save_path'], 'best_model.pth'))
        else:
            patience_counter += 1
            if patience_counter >= CONFIG['early_stopping_patience']:
                print(f"Early stopping at epoch {epoch+1}")
                break
    
    # Plot training curves
    plt.figure(figsize=(12, 4))
    plt.subplot(1, 2, 1)
    plt.plot(train_losses, label='Training Loss')
    plt.plot(val_losses, label='Validation Loss')
    plt.title('Training and Validation Loss')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.legend()
    
    plt.subplot(1, 2, 2)
    plt.plot(train_losses, label='Training Loss')
    plt.plot(val_losses, label='Validation Loss')
    plt.title('Training and Validation Loss (Log Scale)')
    plt.xlabel('Epoch')
    plt.ylabel('Loss (Log)')
    plt.yscale('log')
    plt.legend()
    
    plt.tight_layout()
    plt.savefig(os.path.join(CONFIG['model_save_path'], 'training_curves.png'))
    plt.close()
    
    return model

def evaluate_model(model, test_loader, device):
    """Evaluate the trained model"""
    print("Evaluating model...")
    
    model.eval()
    all_category_preds = []
    all_priority_preds = []
    all_category_true = []
    all_priority_true = []
    all_confidences = []
    
    with torch.no_grad():
        for batch in test_loader:
            input_ids = batch['input_ids'].to(device)
            attention_mask = batch['attention_mask'].to(device)
            image = batch['image'].to(device)
            location = batch['location'].to(device)
            category = batch['category'].to(device)
            priority = batch['priority'].to(device)
            
            category_logits, priority_logits, confidence = model(
                input_ids, attention_mask, image, location
            )
            
            category_preds = torch.argmax(category_logits, dim=1)
            priority_preds = torch.argmax(priority_logits, dim=1)
            
            all_category_preds.extend(category_preds.cpu().numpy())
            all_priority_preds.extend(priority_preds.cpu().numpy())
            all_category_true.extend(category.cpu().numpy())
            all_priority_true.extend(priority.cpu().numpy())
            all_confidences.extend(confidence.cpu().numpy())
    
    # Category evaluation
    print("\n=== Category Classification Report ===")
    category_report = classification_report(
        all_category_true, 
        all_category_preds, 
        target_names=list(CATEGORIES.keys()),
        output_dict=True
    )
    print(classification_report(all_category_true, all_category_preds, target_names=list(CATEGORIES.keys())))
    
    # Priority evaluation
    print("\n=== Priority Classification Report ===")
    priority_report = classification_report(
        all_priority_true, 
        all_priority_preds, 
        target_names=list(PRIORITIES.keys()),
        output_dict=True
    )
    print(classification_report(all_priority_true, all_priority_preds, target_names=list(PRIORITIES.keys())))
    
    # Save evaluation results
    evaluation_results = {
        'category_report': category_report,
        'priority_report': priority_report,
        'average_confidence': np.mean(all_confidences),
        'confidence_std': np.std(all_confidences)
    }
    
    with open(os.path.join(CONFIG['model_save_path'], 'evaluation_results.json'), 'w') as f:
        json.dump(evaluation_results, f, indent=2)
    
    return evaluation_results

def main():
    """Main training function"""
    print("=== ML-based Issue Categorization Model Training ===")
    
    # Create directories
    os.makedirs(CONFIG['model_save_path'], exist_ok=True)
    os.makedirs(CONFIG['data_path'], exist_ok=True)
    
    # Set device
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    
    # Create synthetic data
    print("Creating training data...")
    data = create_synthetic_data(num_samples=2000)
    
    # Split data
    train_data, temp_data = train_test_split(data, test_size=0.3, random_state=42)
    val_data, test_data = train_test_split(temp_data, test_size=0.5, random_state=42)
    
    print(f"Training samples: {len(train_data)}")
    print(f"Validation samples: {len(val_data)}")
    print(f"Test samples: {len(test_data)}")
    
    # Save data splits
    train_data.to_csv(os.path.join(CONFIG['data_path'], 'train_data.csv'), index=False)
    val_data.to_csv(os.path.join(CONFIG['data_path'], 'val_data.csv'), index=False)
    test_data.to_csv(os.path.join(CONFIG['data_path'], 'test_data.csv'), index=False)
    
    # Initialize tokenizer and transforms
    print("Initializing tokenizer and transforms...")
    tokenizer = AutoTokenizer.from_pretrained(CONFIG['pretrained_model'])
    
    image_transforms = transforms.Compose([
        transforms.Resize((CONFIG['image_size'], CONFIG['image_size'])),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    # Create datasets
    train_dataset = IssueDataset(train_data, tokenizer, image_transforms, CONFIG['text_max_length'])
    val_dataset = IssueDataset(val_data, tokenizer, image_transforms, CONFIG['text_max_length'])
    test_dataset = IssueDataset(test_data, tokenizer, image_transforms, CONFIG['text_max_length'])
    
    # Create data loaders
    train_loader = DataLoader(train_dataset, batch_size=CONFIG['batch_size'], shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=CONFIG['batch_size'], shuffle=False)
    test_loader = DataLoader(test_dataset, batch_size=CONFIG['batch_size'], shuffle=False)
    
    # Initialize model
    print("Initializing model...")
    model = MultiModalCategorizationModel(
        num_classes=CONFIG['num_classes'],
        num_priorities=len(PRIORITIES),
        hidden_size=CONFIG['hidden_size'],
        dropout_rate=CONFIG['dropout_rate']
    ).to(device)
    
    # Print model summary
    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"Total parameters: {total_params:,}")
    print(f"Trainable parameters: {trainable_params:,}")
    
    # Train model
    trained_model = train_model(model, train_loader, val_loader, device, CONFIG['epochs'])
    
    # Evaluate model
    evaluation_results = evaluate_model(trained_model, test_loader, device)
    
    # Save final model
    torch.save(trained_model.state_dict(), os.path.join(CONFIG['model_save_path'], 'final_model.pth'))
    
    # Save tokenizer and metadata
    tokenizer.save_pretrained(CONFIG['model_save_path'])
    
    metadata = {
        'categories': CATEGORIES,
        'priorities': PRIORITIES,
        'config': CONFIG,
        'training_date': datetime.now().isoformat(),
        'evaluation_results': evaluation_results
    }
    
    with open(os.path.join(CONFIG['model_save_path'], 'model_metadata.json'), 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"\n=== Training Complete ===")
    print(f"Model saved to: {CONFIG['model_save_path']}")
    print(f"Average confidence: {evaluation_results['average_confidence']:.3f}")
    print(f"Category accuracy: {evaluation_results['category_report']['accuracy']:.3f}")
    print(f"Priority accuracy: {evaluation_results['priority_report']['accuracy']:.3f}")

if __name__ == "__main__":
    main()

