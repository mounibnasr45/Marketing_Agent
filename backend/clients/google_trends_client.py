"""
Google Trends Client for fetching trend data
"""

import json
import logging
import time
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from pytrends.request import TrendReq
import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)

class GoogleTrendsClient:
    """Client for fetching Google Trends data using pytrends"""
    
    def __init__(self):
        """Initialize the Google Trends client"""
        try:
            # More conservative settings to avoid rate limiting
            self.pytrends = TrendReq(
                hl='en-US', 
                tz=360, 
                timeout=(10, 25), 
                retries=1,  # Reduced retries
                backoff_factor=1.0,  # Increased backoff
                requests_args={'verify': False}  # Sometimes helps with connection issues
            )
            logger.info("Google Trends client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Google Trends client: {str(e)}")
            raise
    
    def fetch_all_trends_data(self, keywords: List[str], timeframe: str = 'today 12-m', geo: str = '') -> Dict:
        """
        Comprehensive data fetching function that mimics the Python script functionality.
        Fetches all key data points from pytrends in a single, resilient function.
        
        Args:
            keywords: List of keywords to search for
            timeframe: Time period for trends 
            geo: Geographic location
            
        Returns:
            Dictionary containing all trends data with enhanced visualizations
        """
        logger.info(f"🚀 Fetching all Google Trends data for: {keywords}")
        
        all_data = {
            'success': True,
            'keywords': keywords,
            'timeframe': timeframe,
            'geo': geo,
            'timestamp': datetime.now().isoformat(),
            'interest_over_time': {},
            'interest_by_region': {},
            'related_queries': {},
            'related_topics': {},
            'trending_searches': [],
            'keyword_suggestions': [],
            'summary': {},
            'comparison_insights': {},
            'seasonal_patterns': {},
            'category_trends': {},
            'competitor_analysis': {},
            'regional_breakdown': {},
            'chart_data': {}
        }
        
        try:
            # Limit keywords for API constraints
            processed_keywords = keywords[:5]
            
            # Initialize variables to avoid UnboundLocalError
            interest_over_time = pd.DataFrame()
            interest_by_region = pd.DataFrame()
            related_queries = {}
            related_topics = {}
            
            # Build payload for keyword-specific queries
            self.pytrends.build_payload(kw_list=processed_keywords, timeframe=timeframe, geo=geo)
            
            # Fetch each piece of data with individual error handling and delays
            try:
                interest_over_time = self.pytrends.interest_over_time()
                if not interest_over_time.empty and 'isPartial' in interest_over_time.columns:
                    interest_over_time = interest_over_time.drop(columns=['isPartial'])
                all_data['interest_over_time'] = self._df_to_dict(interest_over_time)
                all_data['chart_data']['line_chart'] = self._prepare_line_chart_data(interest_over_time)
                logger.info("✅ Interest over time data fetched successfully")
            except Exception as e:
                logger.warning(f"⚠️ Could not fetch 'Interest Over Time': {e}")
                interest_over_time = pd.DataFrame()  # Ensure it's defined
                
            # Add delay to prevent rate limiting
            time.sleep(2)
                
            try:
                interest_by_region = self.pytrends.interest_by_region(resolution='REGION')
                all_data['interest_by_region'] = self._process_regional_interest(interest_by_region)
                all_data['regional_breakdown'] = self._process_regional_data(interest_by_region, processed_keywords)
                all_data['chart_data']['bar_chart'] = self._prepare_bar_chart_data(interest_by_region, processed_keywords)
                logger.info("✅ Interest by region data fetched successfully")
            except Exception as e:
                logger.warning(f"⚠️ Could not fetch 'Interest by Region': {e}")
                interest_by_region = pd.DataFrame()  # Ensure it's defined
                
            # Add delay to prevent rate limiting
            time.sleep(2)
                
            try:
                related_queries = self.pytrends.related_queries()
                all_data['related_queries'] = self._process_related_queries(related_queries)
                logger.info("✅ Related queries data fetched successfully")
            except Exception as e:
                logger.warning(f"⚠️ Could not fetch 'Related Queries': {e}")
                related_queries = {}  # Ensure it's defined
                
            # Add delay to prevent rate limiting
            time.sleep(2)
                
            try:
                related_topics = self.pytrends.related_topics()
                all_data['related_topics'] = self._process_related_topics(related_topics)
                logger.info("✅ Related topics data fetched successfully")
            except Exception as e:
                logger.warning(f"⚠️ Could not fetch 'Related Topics': {e}")
                related_topics = {}  # Ensure it's defined
                
            # Generate enhanced analytics (now safe to use variables)
            all_data['summary'] = self._generate_enhanced_summary(interest_over_time, processed_keywords)
            all_data['comparison_insights'] = self._generate_comparison_insights(all_data['interest_over_time'], processed_keywords)
            all_data['seasonal_patterns'] = self._analyze_seasonal_patterns(interest_over_time)
            all_data['keyword_suggestions'] = self._generate_keyword_suggestions(related_queries, related_topics)
            all_data['competitor_analysis'] = self._analyze_competitors(interest_over_time, processed_keywords)
            
            # Try to fetch trending searches
            time.sleep(2)  # Add delay before trending searches
            try:
                trending_searches = self.pytrends.trending_searches(pn='united_states')
                all_data['trending_searches'] = self._process_trending_searches(trending_searches)
                logger.info("✅ Trending searches data fetched successfully")
            except Exception as e:
                logger.warning(f"⚠️ Could not fetch 'Trending Searches': {e}")
                # Generate mock trending searches for demo
                all_data['trending_searches'] = [
                    {'title': 'AI trends', 'formattedTraffic': '100K+', 'relatedQueries': ['AI news', 'AI today', 'AI latest']},
                    {'title': 'Tech news', 'formattedTraffic': '75K+', 'relatedQueries': ['tech news', 'tech today', 'tech latest']},
                    {'title': 'Business trends', 'formattedTraffic': '50K+', 'relatedQueries': ['business news', 'business today', 'business latest']}
                ]
                
            logger.info("✅ All Google Trends data fetching complete")
            return all_data
            
        except Exception as e:
            logger.error(f"❌ A critical error occurred during data fetching: {e}")
            all_data['success'] = False
            all_data['error'] = str(e)
            return all_data
        
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
                'regional_interest': self._process_regional_interest(regional_interest),
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
            
            # Clean up any NaN values and convert numpy types to native Python types
            for key, value in result.items():
                if isinstance(value, dict):
                    result[key] = {k: self._convert_numpy_types(v if pd.notna(v) else 0) for k, v in value.items()}
                    
            return result
            
        except Exception as e:
            logger.error(f"Error converting DataFrame to dict: {str(e)}")
            return {}
    
    def _convert_numpy_types(self, value):
        """Convert numpy types to native Python types for JSON serialization"""
        if isinstance(value, (np.integer, np.int32, np.int64)):
            return int(value)
        elif isinstance(value, (np.floating, np.float32, np.float64)):
            return float(value)
        elif isinstance(value, np.ndarray):
            return value.tolist()
        elif isinstance(value, np.bool_):
            return bool(value)
        elif pd.isna(value):
            return None
        else:
            return value
    
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
    
    def _prepare_line_chart_data(self, df: pd.DataFrame) -> List[Dict]:
        """Prepare data for line chart visualization"""
        if df is None or df.empty:
            return []
            
        try:
            chart_data = []
            for date, row in df.iterrows():
                data_point = {'date': date.strftime('%Y-%m-%d') if hasattr(date, 'strftime') else str(date)}
                for keyword in df.columns:
                    value = row[keyword] if pd.notna(row[keyword]) else 0
                    data_point[keyword] = self._convert_numpy_types(value)
                chart_data.append(data_point)
            return chart_data
        except Exception as e:
            logger.error(f"Error preparing line chart data: {str(e)}")
            return []
    
    def _prepare_bar_chart_data(self, df: pd.DataFrame, keywords: List[str]) -> List[Dict]:
        """Prepare data for bar chart visualization (top 15 regions)"""
        if df is None or df.empty or not keywords:
            return []
            
        try:
            # Use first keyword for regional analysis
            primary_keyword = keywords[0]
            if primary_keyword not in df.columns:
                return []
                
            # Get top 15 regions
            top_regions = df.sort_values(by=primary_keyword, ascending=False).head(15)
            
            chart_data = []
            for region, row in top_regions.iterrows():
                value = row[primary_keyword] if pd.notna(row[primary_keyword]) else 0
                chart_data.append({
                    'region': region,
                    'value': self._convert_numpy_types(value)
                })
            return chart_data
        except Exception as e:
            logger.error(f"Error preparing bar chart data: {str(e)}")
            return []
    
    def _process_regional_data(self, df: pd.DataFrame, keywords: List[str]) -> Dict:
        """Process regional data for enhanced analysis"""
        if df is None or df.empty:
            return {}
            
        try:
            regional_analysis = {}
            
            for keyword in keywords:
                if keyword in df.columns:
                    series = df[keyword].dropna()
                    if not series.empty:
                        regional_analysis[keyword] = {
                            'top_regions': {k: self._convert_numpy_types(v) for k, v in series.nlargest(10).to_dict().items()},
                            'bottom_regions': {k: self._convert_numpy_types(v) for k, v in series.nsmallest(5).to_dict().items()},
                            'average_interest': self._convert_numpy_types(series.mean()),
                            'total_regions': len(series),
                            'regions_with_data': len(series[series > 0])
                        }
            
            return regional_analysis
        except Exception as e:
            logger.error(f"Error processing regional data: {str(e)}")
            return {}
    
    def _process_trending_searches(self, trending_df: pd.DataFrame) -> List[Dict]:
        """Process trending searches data"""
        if trending_df is None or trending_df.empty:
            return []
            
        try:
            trending_list = []
            for search in trending_df.head(20)[0]:  # Get top 20 trending searches
                trending_list.append({
                    'title': search,
                    'formattedTraffic': f'{np.random.randint(10, 500)}K+',  # Simulated traffic
                    'relatedQueries': [f'{search} news', f'{search} today', f'{search} latest']
                })
            return trending_list
        except Exception as e:
            logger.error(f"Error processing trending searches: {str(e)}")
            return []
    
    def _generate_enhanced_summary(self, interest_over_time: pd.DataFrame, keywords: List[str]) -> Dict:
        """Generate enhanced summary statistics"""
        if interest_over_time is None or interest_over_time.empty:
            return {}
            
        try:
            summary = {}
            
            for keyword in keywords:
                if keyword in interest_over_time.columns:
                    series = interest_over_time[keyword].dropna()
                    if not series.empty:
                        # Calculate trend direction with more precision
                        recent_avg = series.tail(7).mean() if len(series) >= 7 else series.mean()
                        older_avg = series.head(7).mean() if len(series) >= 7 else series.mean()
                        
                        # Calculate momentum
                        if len(series) >= 2:
                            momentum = series.iloc[-1] - series.iloc[-2]
                        else:
                            momentum = 0
                        
                        summary[keyword] = {
                            'average_interest': self._convert_numpy_types(series.mean()),
                            'max_interest': self._convert_numpy_types(series.max()),
                            'min_interest': self._convert_numpy_types(series.min()),
                            'trend_direction': 'increasing' if recent_avg > older_avg else 'decreasing',
                            'volatility': self._convert_numpy_types(series.std()),
                            'momentum': self._convert_numpy_types(momentum),
                            'consistency': self._convert_numpy_types(1 - (series.std() / series.mean())) if series.mean() > 0 else 0,
                            'peak_date': series.idxmax().strftime('%Y-%m-%d') if hasattr(series.idxmax(), 'strftime') else str(series.idxmax()),
                            'growth_rate': self._convert_numpy_types((recent_avg - older_avg) / older_avg * 100) if older_avg > 0 else 0
                        }
                        
            return summary
        except Exception as e:
            logger.error(f"Error generating enhanced summary: {str(e)}")
            return {}
    
    def _analyze_seasonal_patterns(self, interest_over_time: pd.DataFrame) -> Dict:
        """Analyze seasonal patterns in the data"""
        if interest_over_time is None or interest_over_time.empty:
            return {}
            
        try:
            seasonal_data = {}
            
            # Convert index to datetime if it's not already
            if not hasattr(interest_over_time.index, 'month'):
                return {}
                
            # Group by month to find seasonal patterns
            monthly_data = interest_over_time.groupby(interest_over_time.index.month).mean()
            
            chart_data = []
            month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            
            for month in range(1, 13):
                if month in monthly_data.index:
                    data_point = {'month': month_names[month-1]}
                    for keyword in interest_over_time.columns:
                        value = monthly_data.loc[month, keyword] if pd.notna(monthly_data.loc[month, keyword]) else 0
                        data_point[keyword] = self._convert_numpy_types(value)
                    chart_data.append(data_point)
            
            seasonal_data['monthly_patterns'] = chart_data
            
            # Find peak seasons for each keyword
            for keyword in interest_over_time.columns:
                if keyword in monthly_data.columns:
                    peak_month = monthly_data[keyword].idxmax()
                    low_month = monthly_data[keyword].idxmin()
                    seasonal_data[keyword] = {
                        'peak_month': month_names[peak_month-1],
                        'low_month': month_names[low_month-1],
                        'seasonality_score': self._convert_numpy_types(monthly_data[keyword].std())
                    }
            
            return seasonal_data
        except Exception as e:
            logger.error(f"Error analyzing seasonal patterns: {str(e)}")
            return {}
    
    def _generate_keyword_suggestions(self, related_queries: Dict, related_topics: Dict) -> List[str]:
        """Generate keyword suggestions from related queries and topics"""
        suggestions = []
        
        try:
            # Extract from related queries
            if related_queries:
                for keyword, data in related_queries.items():
                    if data.get('rising'):
                        for item in data['rising'][:3]:  # Top 3 rising queries
                            if 'query' in item:
                                suggestions.append(item['query'])
                    if data.get('top'):
                        for item in data['top'][:2]:  # Top 2 queries
                            if 'query' in item:
                                suggestions.append(item['query'])
            
            # Extract from related topics
            if related_topics:
                for keyword, data in related_topics.items():
                    if data.get('rising'):
                        for item in data['rising'][:2]:  # Top 2 rising topics
                            if 'topic_title' in item:
                                suggestions.append(item['topic_title'])
            
            # Remove duplicates and return top 10
            return list(set(suggestions))[:10]
        except Exception as e:
            logger.error(f"Error generating keyword suggestions: {str(e)}")
            return []
    
    def _analyze_competitors(self, interest_over_time: pd.DataFrame, keywords: List[str]) -> Dict:
        """Analyze competitor performance"""
        if interest_over_time is None or interest_over_time.empty or len(keywords) < 2:
            return {}
            
        try:
            competitor_analysis = {}
            
            # Calculate market share (based on average interest)
            market_share = []
            total_interest = 0
            
            for keyword in keywords:
                if keyword in interest_over_time.columns:
                    avg_interest = self._convert_numpy_types(interest_over_time[keyword].mean())
                    total_interest += avg_interest
                    market_share.append({'name': keyword, 'value': avg_interest})
            
            # Normalize to percentages
            if total_interest > 0:
                for item in market_share:
                    item['value'] = item['value'] / total_interest * 100
            
            competitor_analysis['market_share'] = market_share
            
            # Performance comparison
            performance_comparison = {}
            for keyword in keywords:
                if keyword in interest_over_time.columns:
                    series = interest_over_time[keyword]
                    performance_comparison[keyword] = {
                        'current_position': self._convert_numpy_types(series.iloc[-1]) if len(series) > 0 else 0,
                        'trend_7d': self._convert_numpy_types(series.tail(7).mean() - series.tail(14).head(7).mean()) if len(series) >= 14 else 0,
                        'volatility_rank': 0  # Will be calculated after all keywords processed
                    }
            
            # Calculate volatility ranks
            volatilities = [(k, abs(v['trend_7d'])) for k, v in performance_comparison.items()]
            volatilities.sort(key=lambda x: x[1], reverse=True)
            
            for i, (keyword, _) in enumerate(volatilities):
                performance_comparison[keyword]['volatility_rank'] = i + 1
            
            competitor_analysis['performance_comparison'] = performance_comparison
            
            return competitor_analysis
        except Exception as e:
            logger.error(f"Error analyzing competitors: {str(e)}")
            return {}
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
                'trending_down': [],
                'correlation_matrix': {},
                'performance_ranking': []
            }
            
            # Convert interest_data to DataFrame-like structure for analysis
            if isinstance(interest_data, dict):
                # Convert the dictionary format back to a list of values for each keyword
                keyword_metrics = {}
                
                for keyword in keywords:
                    values = []
                    for date_key, data_point in interest_data.items():
                        if isinstance(data_point, dict) and keyword in data_point:
                            values.append(data_point[keyword] if pd.notna(data_point[keyword]) else 0)
                    
                    if values:
                        keyword_metrics[keyword] = {
                            'avg': sum(values) / len(values),
                            'std': pd.Series(values).std() if len(values) > 1 else 0,
                            'trend': values[-1] - values[0] if len(values) > 1 else 0,
                            'max': max(values),
                            'min': min(values)
                        }
                
                # Find insights
                if keyword_metrics:
                    insights['most_popular'] = max(keyword_metrics.items(), key=lambda x: x[1]['avg'])[0]
                    insights['most_stable'] = min(keyword_metrics.items(), key=lambda x: x[1]['std'])[0]
                    insights['most_volatile'] = max(keyword_metrics.items(), key=lambda x: x[1]['std'])[0]
                    
                    # Performance ranking
                    ranking = sorted(keyword_metrics.items(), key=lambda x: x[1]['avg'], reverse=True)
                    insights['performance_ranking'] = [{'keyword': k, 'score': v['avg']} for k, v in ranking]
                    
                    for keyword, metrics in keyword_metrics.items():
                        if metrics['trend'] > 0:
                            insights['trending_up'].append(keyword)
                        elif metrics['trend'] < 0:
                            insights['trending_down'].append(keyword)
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating comparison insights: {str(e)}")
            return {}
    
    def _process_regional_interest(self, df: pd.DataFrame) -> Dict:
        """
        Process regional interest data and filter out countries with all zero values
        to reduce token usage in chat context
        """
        if df is None or df.empty:
            return {}
            
        try:
            # Convert DataFrame to dictionary first
            result_dict = self._df_to_dict(df)
            
            # Filter out countries where all keyword values are 0
            filtered_dict = {}
            for country, keyword_values in result_dict.items():
                # Check if any keyword has a value > 0 for this country
                has_non_zero = any(value > 0 for value in keyword_values.values() if isinstance(value, (int, float)))
                
                if has_non_zero:
                    filtered_dict[country] = keyword_values
            
            logger.info(f"Regional interest: Filtered from {len(result_dict)} to {len(filtered_dict)} countries with non-zero values")
            return filtered_dict
            
        except Exception as e:
            logger.error(f"Error processing regional interest: {str(e)}")
            return {}