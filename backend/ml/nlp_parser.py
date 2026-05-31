"""
NLP Parser Module
=================
This module handles natural language processing for task input parsing.
It uses spaCy to extract entities like dates, priorities, and categories from text.

Example: "Finish assignment tomorrow by 5pm" -> {title: "Finish assignment", due_date: tomorrow, ...}
"""

import spacy
import re
from datetime import datetime, timedelta
from dateutil import parser as date_parser


class NLPParser:
    """
    Natural Language Parser for task input.
    Parses natural language text to extract task attributes.
    """
    
    def __init__(self, model_name='en_core_web_sm'):
        """Initialize the NLP parser with spaCy model"""
        try:
            self.nlp = spacy.load(model_name)
        except OSError:
            print(f"Downloading spaCy model: {model_name}")
            import subprocess
            subprocess.run(['python', '-m', 'spacy', 'download', 'en_core_web_sm'], check=True)
            self.nlp = spacy.load(model_name)
        
        # Define keyword mappings
        self.priority_keywords = {
            'high': 1, 'urgent': 1, 'asap': 1, 'important': 1, 'critical': 1,
            'medium': 2, 'normal': 2,
            'low': 3, 'whenever': 3, 'eventually': 3
        }
        
        self.category_keywords = {
            'work': 'work', 'office': 'work', 'meeting': 'work',
            'personal': 'personal', 'home': 'personal',
            'study': 'study', 'learn': 'study', 'read': 'study', 'homework': 'study',
            'health': 'health', 'gym': 'health', 'exercise': 'health',
            'shopping': 'shopping', 'buy': 'shopping'
        }
    
    def parse(self, text):
        """
        Parse natural language text into task attributes.
        
        Args:
            text: Natural language string to parse
            
        Returns:
            dict: Parsed task attributes
        """
        doc = self.nlp(text)
        
        result = {
            'title': text,
            'description': '',
            'priority': 3,  # Default to low
            'category': 'general',
            'estimated_duration': 60,  # Default 1 hour
            'due_date': None
        }
        
        # Extract title (first meaningful phrase)
        result['title'] = self._extract_title(text, doc)
        
        # Extract priority
        result['priority'] = self._extract_priority(text)
        
        # Extract category
        result['category'] = self._extract_category(text)
        
        # Extract duration
        result['estimated_duration'] = self._extract_duration(text)
        
        # Extract due date
        result['due_date'] = self._extract_date(text)
        
        return result
    
    def _extract_title(self, text, doc):
        """Extract the main title from text"""
        # Remove common phrases that aren't part of title
        stop_phrases = ['please', 'can you', 'remind me to', 'i need to', 'task:']
        text_lower = text.lower()
        
        for phrase in stop_phrases:
            if text_lower.startswith(phrase):
                text = text[len(phrase):].strip()
        
        # Take first 50 characters as title if too long
        if len(text) > 50:
            text = text[:50] + '...'
        
        return text.strip()
    
    def _extract_priority(self, text):
        """Extract priority from text"""
        text_lower = text.lower()
        
        for keyword, priority in self.priority_keywords.items():
            if keyword in text_lower:
                return priority
        
        return 3  # Default low priority
    
    def _extract_category(self, text):
        """Extract category from text"""
        text_lower = text.lower()
        
        for keyword, category in self.category_keywords.items():
            if keyword in text_lower:
                return category
        
        return 'general'
    
    def _extract_duration(self, text):
        """Extract estimated duration from text"""
        text_lower = text.lower()
        
        # Pattern: "X hours", "X minutes", "X mins"
        hour_match = re.search(r'(\d+)\s*(hour|hr|hours|hrs)', text_lower)
        minute_match = re.search(r'(\d+)\s*(minute|min|mins)', text_lower)
        
        if hour_match:
            return int(hour_match.group(1)) * 60
        if minute_match:
            return int(minute_match.group(1))
        
        # Default duration based on keywords
        if any(word in text_lower for word in ['quick', 'short', 'fast']):
            return 15
        elif any(word in text_lower for word in ['long', 'extensive', 'major']):
            return 180
        
        return 60  # Default 1 hour
    
    def _extract_date(self, text):
        """Extract due date from text"""
        text_lower = text.lower()
        
        # Handle relative dates
        if 'today' in text_lower:
            return datetime.now().strftime('%Y-%m-%dT%H:%M:%S')
        
        if 'tomorrow' in text_lower:
            tomorrow = datetime.now() + timedelta(days=1)
            return tomorrow.strftime('%Y-%m-%dT%H:%M:%S')
        
        if 'next week' in text_lower:
            next_week = datetime.now() + timedelta(days=7)
            return next_week.strftime('%Y-%m-%dT%H:%M:%S')
        
        # Try to parse explicit date
        date_patterns = [
            r'\d{1,2}/\d{1,2}/\d{2,4}',
            r'\d{1,2}-\d{1,2}-\d{2,4}',
            r'\d{4}-\d{2}-\d{2}'
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, text)
            if match:
                try:
                    parsed = date_parser.parse(match.group())
                    return parsed.strftime('%Y-%m-%dT%H:%M:%S')
                except:
                    pass
        
        return None
    
    def extract_entities(self, text):
        """
        Extract named entities from text.
        
        Args:
            text: Input text
            
        Returns:
            dict: Extracted entities
        """
        doc = self.nlp(text)
        
        entities = {
            'persons': [],
            'organizations': [],
            'dates': [],
            'times': []
        }
        
        for ent in doc.ents:
            if ent.label_ == 'PERSON':
                entities['persons'].append(ent.text)
            elif ent.label_ == 'ORG':
                entities['organizations'].append(ent.text)
            elif ent.label_ == 'DATE':
                entities['dates'].append(ent.text)
            elif ent.label_ == 'TIME':
                entities['times'].append(ent.text)
        
        return entities


# Test the parser
if __name__ == '__main__':
    parser = NLPParser()
    
    test_inputs = [
        "Finish assignment tomorrow by 5pm",
        "Urgent meeting with team next week",
        "Gym workout for 1 hour today",
        "Read chapter 5 of the book",
        "Buy groceries from the store"
    ]
    
    print("Testing NLP Parser:")
    print("=" * 50)
    
    for text in test_inputs:
        result = parser.parse(text)
        print(f"\nInput: {text}")
        print(f"Parsed: {result}")