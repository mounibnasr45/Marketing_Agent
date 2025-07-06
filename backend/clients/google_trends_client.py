"""
Google Trends Client for fetching trend data
"""

import json
import logging
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from pytrends.request import TrendReq
import pandas as pd

logger = logging.getLogger(__name__)

class GoogleTrendsClient:
    """Client for fetching Google Trends data using pytrends"""
    
    def __init__(self):
        """Initialize the Google Trends client"""
        try:
            self.pytrends = TrendReq(hl='en-US', tz=360, timeout=(10, 25), retries=2, backoff_factor=0.1)
            logger.info("Google Trends client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Google Trends client: {str(e)}")
            raise
        
    def get_trends_data(self, 
                       keywords: List[str], 
                       timeframe: str = 'today 12-m',
                       geo: str = '',
                       category: int = 0) -> Dict:
        """
        Fetch Google Trends data for given keywords
        
        Args:
            keywords: List of keywords to search for (max 5)
            timeframe: Time period for trends (default: 'today 12-m')
            geo: Geographic location (default: '' for worldwide)
            category: Category ID (default: 0 for all categories)
            
        Returns:
            Dictionary containing trends data
        """
        try:
            logger.info(f"Fetching Google Trends data for keywords: {keywords}")
            
            # Limit to 5 keywords as per Google Trends API
            keywords = keywords[:5]
            
            # Clean keywords - remove domains and clean up
            cleaned_keywords = []
            for keyword in keywords:
                # Remove common domain extensions and clean up
                cleaned = keyword.replace('.com', '').replace('.org', '').replace('.net', '').replace('www.', '')
                cleaned = cleaned.strip()
                if cleaned:
                    cleaned_keywords.append(cleaned)
            
            if not cleaned_keywords:
                raise ValueError("No valid keywords found after cleanup")
            
            logger.info(f"Cleaned keywords: {cleaned_keywords}")
            
            # Build payload for trends data
            self.pytrends.build_payload(
                cleaned_keywords, 
                cat=category, 
                timeframe=timeframe, 
                geo=geo, 
                gprop=''
            )
            
            # Get interest over time data
            interest_over_time = self.pytrends.interest_over_time()
            
            # Get related queries (with error handling)
            related_queries = {}
            try:
                related_queries = self.pytrends.related_queries()
            except Exception as e:
                logger.warning(f"Failed to get related queries: {str(e)}")
                related_queries = {}
            
            # Get related topics (with error handling)
            related_topics = {}
            try:
                related_topics = self.pytrends.related_topics()
            except Exception as e:
                logger.warning(f"Failed to get related topics: {str(e)}")
                related_topics = {}
            
            # Get regional interest (with error handling)
            regional_interest = pd.DataFrame()
            try:
                regional_interest = self.pytrends.interest_by_region()
            except Exception as e:
                logger.warning(f"Failed to get regional interest: {str(e)}")
                regional_interest = pd.DataFrame()
            
            # Convert DataFrames to dictionaries for JSON serialization
            result = {
                'success': True,
                'keywords': cleaned_keywords,
                'original_keywords': keywords,
                'timeframe': timeframe,
                'geo': geo,
                'timestamp': datetime.now().isoformat(),
                'interest_over_time': self._df_to_dict(interest_over_time),
                'related_queries': self._process_related_queries(related_queries),
                'related_topics': self._process_related_topics(related_topics),
                'regional_interest': self._df_to_dict(regional_interest),
                'summary': self._generate_summary(interest_over_time, cleaned_keywords)
            }
            
            logger.info(f"Successfully fetched Google Trends data for {len(cleaned_keywords)} keywords")
            return result
            
        except Exception as e:
            logger.error(f"Error fetching Google Trends data: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'keywords': keywords,
                'timestamp': datetime.now().isoformat()
            }
    
    def compare_keywords(self, keywords: List[str], timeframe: str = 'today 12-m') -> Dict:
        """
        Compare multiple keywords in Google Trends
        
        Args:
            keywords: List of keywords to compare (max 5)
            timeframe: Time period for comparison
            
        Returns:
            Dictionary containing comparison data
        """
        try:
            if len(keywords) < 2:
                raise ValueError("At least 2 keywords are required for comparison")
                
            trends_data = self.get_trends_data(keywords, timeframe)
            
            if not trends_data['success']:
                return trends_data
                
            # Add comparison insights
            comparison_insights = self._generate_comparison_insights(
                trends_data['interest_over_time'], 
                keywords
            )
            
            trends_data['comparison_insights'] = comparison_insights
            
            return trends_data
            
        except Exception as e:
            logger.error(f"Error comparing keywords: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'keywords': keywords,
                'timestamp': datetime.now().isoformat()
            }
    
    def _df_to_dict(self, df: pd.DataFrame) -> Dict:
        """Convert pandas DataFrame to dictionary"""
        if df is None or df.empty:
            return {}
            
        try:
            # Convert dates to strings for JSON serialization
            df_copy = df.copy()
            
            # Handle datetime index
            if hasattr(df_copy.index, 'strftime'):
                df_copy.index = df_copy.index.strftime('%Y-%m-%d')
            elif hasattr(df_copy.index, 'astype'):
                df_copy.index = df_copy.index.astype(str)
                
            # Convert to dictionary
            result = df_copy.to_dict('index')
            
            # Clean up any NaN values
            for key, value in result.items():
                if isinstance(value, dict):
                    result[key] = {k: (v if pd.notna(v) else 0) for k, v in value.items()}
                    
            return result
            
        except Exception as e:
            logger.error(f"Error converting DataFrame to dict: {str(e)}")
            return {}
    
    def _process_related_queries(self, related_queries: Dict) -> Dict:
        """Process related queries data"""
        if not related_queries:
            return {}
            
        processed = {}
        for keyword, queries in related_queries.items():
            processed[keyword] = {}
            if queries.get('top') is not None:
                processed[keyword]['top'] = queries['top'].to_dict('records')
            if queries.get('rising') is not None:
                processed[keyword]['rising'] = queries['rising'].to_dict('records')
                
        return processed
    
    def _process_related_topics(self, related_topics: Dict) -> Dict:
        """Process related topics data"""
        if not related_topics:
            return {}
            
        processed = {}
        for keyword, topics in related_topics.items():
            processed[keyword] = {}
            if topics.get('top') is not None:
                processed[keyword]['top'] = topics['top'].to_dict('records')
            if topics.get('rising') is not None:
                processed[keyword]['rising'] = topics['rising'].to_dict('records')
                
        return processed
    
    def _generate_summary(self, interest_over_time: pd.DataFrame, keywords: List[str]) -> Dict:
        """Generate summary statistics for trends data"""
        if interest_over_time is None or interest_over_time.empty:
            return {}
            
        try:
            summary = {}
            
            for keyword in keywords:
                if keyword in interest_over_time.columns:
                    series = interest_over_time[keyword]
                    summary[keyword] = {
                        'average_interest': float(series.mean()),
                        'max_interest': float(series.max()),
                        'min_interest': float(series.min()),
                        'trend_direction': 'increasing' if series.iloc[-1] > series.iloc[0] else 'decreasing',
                        'volatility': float(series.std())
                    }
                    
            return summary
            
        except Exception as e:
            logger.error(f"Error generating summary: {str(e)}")
            return {}
    
    def _generate_comparison_insights(self, interest_data: Dict, keywords: List[str]) -> Dict:
        """Generate insights for keyword comparison"""
        if not interest_data or not keywords:
            return {}
            
        try:
            insights = {
                'most_popular': None,
                'most_stable': None,
                'most_volatile': None,
                'trending_up': [],
                'trending_down': []
            }
            
            # Calculate metrics for each keyword
            keyword_metrics = {}
            for keyword in keywords:
                if keyword in interest_data:
                    values = [point.get(keyword, 0) for point in interest_data.values()]
                    if values:
                        keyword_metrics[keyword] = {
                            'avg': sum(values) / len(values),
                            'std': pd.Series(values).std(),
                            'trend': values[-1] - values[0] if len(values) > 1 else 0
                        }
            
            # Find insights
            if keyword_metrics:
                insights['most_popular'] = max(keyword_metrics.items(), key=lambda x: x[1]['avg'])[0]
                insights['most_stable'] = min(keyword_metrics.items(), key=lambda x: x[1]['std'])[0]
                insights['most_volatile'] = max(keyword_metrics.items(), key=lambda x: x[1]['std'])[0]
                
                for keyword, metrics in keyword_metrics.items():
                    if metrics['trend'] > 0:
                        insights['trending_up'].append(keyword)
                    elif metrics['trend'] < 0:
                        insights['trending_down'].append(keyword)
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating comparison insights: {str(e)}")
            return {}