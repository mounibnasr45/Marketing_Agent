"""
Client for OpenRouter API integration
"""

import httpx
from typing import Optional, List, Dict
from models import ChatResponse


class OpenRouterClient:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.base_url = "https://openrouter.ai/api/v1"

    async def chat_completion(self, message: str, analysis_data: dict) -> ChatResponse:
        if not self.api_key:
            print("No API key, using mock data")
            return self._get_mock_chat_response(message)

        # Prepare context from analysis data
        context = self._prepare_analysis_context(analysis_data)
        
        system_prompt = f"""You are an expert web analytics and technology stack analyst. You have access to comprehensive data about websites including traffic analytics, technology stacks, and competitive landscape. 

Based on the following analysis data:
{context}

Provide insightful, actionable answers to user questions about:
- Website traffic patterns and sources
- Technology stack analysis and recommendations
- Competitive positioning and opportunities
- Growth strategies and optimization suggestions
- Market insights and trends

Keep responses conversational but professional, and always back up insights with specific data points from the analysis."""

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": "anthropic/claude-3.5-sonnet",
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": message}
                        ],
                        "max_tokens": 1000,
                        "temperature": 0.7
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    assistant_message = data["choices"][0]["message"]["content"]
                    
                    # Generate relevant suggestions based on the response
                    suggestions = self._generate_suggestions(message, assistant_message)
                    
                    return ChatResponse(
                        response=assistant_message,
                        suggestions=suggestions
                    )
                else:
                    print(f"OpenRouter API error: {response.status_code} - {response.text}")
                    return self._get_mock_chat_response(message)
                    
            except Exception as e:
                print(f"Error calling OpenRouter API: {e}")
                return self._get_mock_chat_response(message)

    def _prepare_analysis_context(self, analysis_data: dict) -> str:
        """Convert analysis data into a readable context for the LLM"""
        context_parts = []
        
        if "data" in analysis_data:
            for website in analysis_data["data"]:
                context_parts.append(f"""
Website: {website.get('name', 'Unknown')}
- Global Rank: #{website.get('globalRank', 'N/A')}
- Monthly Visits: {website.get('totalVisits', 'N/A')}
- Bounce Rate: {website.get('bounceRate', 'N/A')}
- Avg Visit Duration: {website.get('avgVisitDuration', 'N/A')}
- Company: {website.get('companyName', 'N/A')} (Founded: {website.get('companyYearFounded', 'N/A')})

Traffic Sources:
{self._format_traffic_sources(website.get('trafficSources', {}))}

Top Technologies:
{self._format_technologies(website.get('builtwith_result', {}))}

Top Competitors:
{self._format_competitors(website.get('topSimilarityCompetitors', []))}
""")
        
        return "\n".join(context_parts)

    def _format_traffic_sources(self, traffic_sources: dict) -> str:
        if not traffic_sources:
            return "No traffic source data available"
        
        sources = []
        for key, value in traffic_sources.items():
            if isinstance(value, (int, float)) and value > 0:
                percentage = value * 100 if value <= 1 else value
                sources.append(f"- {key.replace('Share', '').replace('Visits', '').title()}: {percentage:.1f}%")
        
        return "\n".join(sources) if sources else "No traffic source data available"

    def _format_technologies(self, builtwith_result: dict) -> str:
        if not builtwith_result or 'technologies' not in builtwith_result:
            return "No technology data available"
        
        technologies = builtwith_result['technologies']
        if not technologies:
            return "No technologies found"
        
        tech_by_category = {}
        for tech in technologies[:10]:  # Limit to top 10
            category = tech.get('tag', 'Other')
            if category not in tech_by_category:
                tech_by_category[category] = []
            tech_by_category[category].append(tech.get('name', 'Unknown'))
        
        formatted = []
        for category, techs in tech_by_category.items():
            formatted.append(f"- {category}: {', '.join(techs)}")
        
        return "\n".join(formatted)

    def _format_competitors(self, competitors: list) -> str:
        if not competitors:
            return "No competitor data available"
        
        formatted = []
        for comp in competitors[:5]:  # Top 5 competitors
            visits = comp.get('visitsTotalCount', 0)
            visits_formatted = f"{visits/1000000:.0f}M" if visits > 1000000 else f"{visits/1000:.0f}K" if visits > 1000 else str(visits)
            affinity = comp.get('affinity', 0) * 100
            formatted.append(f"- {comp.get('domain', 'Unknown')}: {visits_formatted} visits, {affinity:.0f}% affinity")
        
        return "\n".join(formatted)

    def _generate_suggestions(self, user_message: str, assistant_response: str) -> List[str]:
        """Generate follow-up suggestions based on the conversation"""
        suggestions = [
            "How can I improve my website's traffic sources?",
            "What technologies should I consider implementing?",
            "How do I compare to my top competitors?",
            "What are the growth opportunities in my market?",
            "Can you analyze the user engagement metrics?",
        ]
        
        # Simple keyword-based suggestion customization
        message_lower = user_message.lower()
        
        if "traffic" in message_lower:
            suggestions = [
                "What are the best channels for traffic growth?",
                "How can I reduce my bounce rate?",
                "What countries should I target for expansion?",
                "How effective is my current SEO strategy?",
                "What social media opportunities exist?"
            ]
        elif "technology" in message_lower or "tech" in message_lower:
            suggestions = [
                "What modern frameworks should I adopt?",
                "How can I improve my website performance?",
                "What analytics tools do competitors use?",
                "Should I migrate to a different tech stack?",
                "What security technologies are missing?"
            ]
        elif "competitor" in message_lower:
            suggestions = [
                "Who are my biggest competitive threats?",
                "What do top competitors do differently?",
                "How can I differentiate from competitors?",
                "What market gaps can I exploit?",
                "Which competitor strategies should I adopt?"
            ]
        
        return suggestions[:3]  # Return top 3 suggestions

    def _get_mock_chat_response(self, message: str) -> ChatResponse:
        """Generate mock chat responses for testing"""
        mock_responses = {
            "traffic": "Based on the analysis, your website shows strong direct traffic (45%) which indicates good brand recognition. However, there's opportunity to improve organic search traffic (35%) through better SEO optimization. Consider focusing on content marketing and technical SEO improvements to capture more organic visitors.",
            "technology": "Your current tech stack shows you're using React and Node.js, which are excellent modern choices. I notice you're using an older version of some dependencies. Consider upgrading to the latest React 18.2.0 and implementing better caching with Redis to improve performance.",
            "competitor": "Compared to your main competitors, you're performing well in user engagement metrics. Your bounce rate of 35% is better than the industry average. However, competitors like Indeed.com have higher traffic volumes. Focus on content strategy and user acquisition to bridge this gap.",
            "default": "I can help you analyze various aspects of your website performance, technology stack, and competitive positioning. What specific area would you like to explore further?"
        }
        
        message_lower = message.lower()
        response_key = "default"
        
        for key in mock_responses:
            if key in message_lower:
                response_key = key
                break
        
        suggestions = [
            "How can I improve my conversion rate?",
            "What are the latest industry trends?",
            "Show me detailed competitor analysis"
        ]
        
        return ChatResponse(
            response=mock_responses[response_key],
            suggestions=suggestions
        )
