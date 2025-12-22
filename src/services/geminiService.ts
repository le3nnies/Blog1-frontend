// src/services/geminiService.ts
import { GoogleGenAI } from '@google/genai';

interface AnalyticsReport {
  summary: string;
  insights: string[];
  recommendations: string[];
  performanceAnalysis: string;
  trends: string;
}

class GeminiService {
  private genAI: GoogleGenAI;
  private apiKey: string;
  private modelName: string = 'gemini-2.5-flash'; // Use a stable model

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('⚠️ Gemini API key not found. Please add VITE_GEMINI_API_KEY to your environment variables.');
      return;
    }

    try {
      this.genAI = new GoogleGenAI({ apiKey: this.apiKey });
      console.log('✅ Gemini service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Gemini:', error);
    }
  }

  async generateAnalyticsReport(analyticsData: any, dateRange: string): Promise<AnalyticsReport> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your environment variables.');
    }

    if (!this.genAI) {
      throw new Error('Gemini AI not initialized. Please check your API key.');
    }

    const prompt = this.buildAnalyticsPrompt(analyticsData, dateRange);

    try {
      console.log('🤖 Generating AI report with Gemini...');
      
      const result = await this.genAI.models.generateContent({
        model: this.modelName,
        contents: prompt,
        generateConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4000,
        }
      });

      console.log('🔍 Full Gemini response structure:', result);

      const text = this.extractTextFromResponse(result);

      if (!text) {
        throw new Error('Empty response from Gemini API');
      }

      console.log('✅ Gemini response received, length:', text.length);
      console.log('📝 Response preview:', text.substring(0, 300));
      
      return this.parseGeminiResponse(text);
    } catch (error: any) {
      console.error('Gemini API error:', error);
      
      if (error.message?.includes('API key not valid') || error.status === 401) {
        throw new Error('Invalid Gemini API key. Please check your API key configuration.');
      } else if (error.message?.includes('Quota exceeded') || error.status === 429) {
        throw new Error('Gemini API quota exceeded. Please check your usage limits.');
      } else if (error.message?.includes('Permission denied') || error.status === 403) {
        throw new Error('Gemini API permission denied. Please check your API key permissions.');
      }
      
      throw new Error(`Failed to generate AI report: ${error.message}. Using fallback analysis...`);
    }
  }

  private extractTextFromResponse(response: any): string {
  console.log('🔍 Extracting text from response structure:', response);
  
  // Method 1: Check if response has direct text property
  if (response.text && typeof response.text === 'string') {
    return response.text;
  }
  
  // Method 2: Check candidates array structure (this is likely where the text is)
  if (response.candidates && Array.isArray(response.candidates) && response.candidates.length > 0) {
    const candidate = response.candidates[0];
    console.log('🔍 Candidate structure:', candidate);
    
    // Check for content.parts structure (most common)
    if (candidate.content && candidate.content.parts && Array.isArray(candidate.content.parts)) {
      const textPart = candidate.content.parts.find((part: any) => part.text);
      if (textPart && textPart.text) {
        console.log('✅ Found text in content.parts:', textPart.text.substring(0, 200));
        return textPart.text;
      }
    }
    
    // Check for direct content text
    if (candidate.content && typeof candidate.content === 'string') {
      console.log('✅ Found text in candidate.content:', candidate.content.substring(0, 200));
      return candidate.content;
    }
  }
  
  // Method 3: Check for any text in the response recursively
  const findTextInObject = (obj: any): string => {
    if (typeof obj === 'string') return obj;
    if (Array.isArray(obj)) {
      for (const item of obj) {
        const text = findTextInObject(item);
        if (text) return text;
      }
    }
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        const text = findTextInObject(obj[key]);
        if (text) return text;
      }
    }
    return '';
  };
  
  const foundText = findTextInObject(response);
  if (foundText) {
    console.log('✅ Found text recursively:', foundText.substring(0, 200));
    return foundText;
  }
  
  console.warn('❌ Could not extract text from response structure');
  return '';
}

private parseGeminiResponse(content: string): AnalyticsReport {
  try {
    console.log('📝 Raw Gemini response length:', content.length);
    console.log('📝 Raw response preview:', content.substring(0, 500));
    
    // Clean the content - remove markdown code blocks and extra text
    let cleanContent = content.trim();
    
    // Remove ```json and ``` markers more aggressively
    cleanContent = cleanContent.replace(/```json\s*/gi, '').replace(/```\s*/gi, '');
    
    // Also remove any leading/trailing whitespace and newlines
    cleanContent = cleanContent.trim();
    
    console.log('🧹 After markdown removal:', cleanContent.substring(0, 500));
    
    // Extract JSON from the response - more robust matching
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanContent = jsonMatch[0];
      console.log('✅ Extracted JSON object');
    } else {
      console.log('❌ No JSON object found with regex');
      // Try alternative parsing
      const fallbackResult = this.tryAlternativeParsing(content);
      if (fallbackResult) {
        console.log('✅ Recovered using alternative parsing');
        return fallbackResult;
      }
      throw new Error('No valid JSON object found in response');
    }
    
    console.log('🧹 Final cleaned content length:', cleanContent.length);
    console.log('🧹 Final content preview:', cleanContent.substring(0, 500));
    
    // Fix common JSON issues before parsing
    cleanContent = this.fixJsonIssues(cleanContent);
    
    // Parse JSON
    const parsed = JSON.parse(cleanContent) as AnalyticsReport;
    
    console.log('✅ Successfully parsed JSON response');
    
    // Validate and clean the response
    return {
      summary: parsed.summary?.trim() || 'Analysis based on your campaign performance data.',
      insights: Array.isArray(parsed.insights) 
        ? parsed.insights.filter(insight => insight && insight.trim()).map(insight => insight.trim())
        : ['Review performance trends for optimization opportunities.'],
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations.filter(rec => rec && rec.trim()).map(rec => rec.trim())
        : ['Consider A/B testing to improve campaign performance.'],
      performanceAnalysis: parsed.performanceAnalysis?.trim() || 'Campaign shows consistent performance metrics.',
      trends: parsed.trends?.trim() || 'Stable performance expected with optimization potential.'
    };
    
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    console.log('Failed content length:', content?.length);
    console.log('Failed content preview:', content?.substring(0, 500));
    
    // Try alternative parsing methods
    const fallbackResult = this.tryAlternativeParsing(content);
    if (fallbackResult) {
      console.log('✅ Recovered using alternative parsing');
      return fallbackResult;
    }
    
    console.log('❌ All parsing methods failed, using fallback report');
    // Return a meaningful fallback report
    return this.generateFallbackReport();
  }
}

  private buildAnalyticsPrompt(analyticsData: any, dateRange: string): string {
    // ... (keep your existing buildAnalyticsPrompt method as is)
    // The prompt building code remains the same
    const { summary, performanceTrends, deviceBreakdown, geographicData, engagementMetrics } = analyticsData;

    const revenuePerClick = summary.totalClicks > 0 ? summary.totalRevenue / summary.totalClicks : 0;
    const revenuePerImpression = summary.totalImpressions > 0 ? summary.totalRevenue / summary.totalImpressions : 0;
    
    const recentTrends = performanceTrends.slice(-7);
    const earlyTrends = performanceTrends.slice(0, 7);
    
    const recentAvgRevenue = recentTrends.reduce((sum, day) => sum + day.revenue, 0) / recentTrends.length;
    const recentAvgClicks = recentTrends.reduce((sum, day) => sum + day.clicks, 0) / recentTrends.length;
    
    let revenueTrend = "stable";
    let clicksTrend = "stable";
    
    if (earlyTrends.length >= 3) {
      const earlyAvgRevenue = earlyTrends.reduce((sum, day) => sum + day.revenue, 0) / earlyTrends.length;
      const earlyAvgClicks = earlyTrends.reduce((sum, day) => sum + day.clicks, 0) / earlyTrends.length;
      
      revenueTrend = recentAvgRevenue > earlyAvgRevenue * 1.1 ? "improving" : 
                    recentAvgRevenue < earlyAvgRevenue * 0.9 ? "declining" : "stable";
      clicksTrend = recentAvgClicks > earlyAvgClicks * 1.1 ? "improving" : 
                    recentAvgClicks < earlyAvgClicks * 0.9 ? "declining" : "stable";
    }

    return `
DIGITAL MARKETING ANALYTICS DEEP DIVE ANALYSIS

As a senior digital marketing analyst with 10+ years of experience, conduct a comprehensive performance analysis of this advertising campaign data.

CAMPAIGN OVERVIEW:
- Reporting Period: ${dateRange}
- Total Investment Period: ${dateRange}

FINANCIAL PERFORMANCE METRICS:
• Total Revenue Generated: $${summary.totalRevenue?.toFixed(2) || 0}
• Total Advertising Clicks: ${summary.totalClicks || 0}
• Total Impressions Served: ${summary.totalImpressions || 0}
• Overall Click-Through Rate: ${summary.averageCTR?.toFixed(2) || 0}%
• Average Cost Per Click: $${summary.averageCPC?.toFixed(2) || 0}
• Revenue Per Click: $${revenuePerClick.toFixed(2)}
• Revenue Per Impression: $${revenuePerImpression.toFixed(4)}

PERFORMANCE TREND ANALYSIS (Last ${dateRange}):
${performanceTrends.slice(0, 10).map((day: any, index: number) => {
  const dayOverDayChange = index > 0 ? 
    `(Day-over-Day: ${day.revenue > performanceTrends[index-1].revenue ? '↑' : '↓'}${Math.abs(((day.revenue - performanceTrends[index-1].revenue) / performanceTrends[index-1].revenue * 100) || 0).toFixed(1)}%)` : '';
  return `• ${day.date}: $${day.revenue?.toFixed(2) || 0} revenue | ${day.clicks || 0} clicks | ${((day.clicks / day.impressions) * 100 || 0).toFixed(2)}% CTR ${dayOverDayChange}`;
}).join('\n')}

AUDIENCE DEVICE SEGMENTATION:
${deviceBreakdown.map((device: any) => {
  const deviceEfficiency = device.revenue > 0 ? (device.value / device.revenue) : 0;
  return `• ${device.name}: ${device.value}% traffic share | $${device.revenue?.toFixed(2) || 0} revenue | Efficiency Score: ${deviceEfficiency.toFixed(2)}`;
}).join('\n')}

GEOGRAPHIC PERFORMANCE BREAKDOWN:
${geographicData.slice(0, 6).map((geo: any, index: number) => {
  const marketShare = (geo.clicks / summary.totalClicks * 100) || 0;
  const revenueEfficiency = geo.revenue > 0 ? (geo.clicks / geo.revenue) : 0;
  return `• ${index + 1}. ${geo.country}: ${geo.clicks} clicks (${marketShare.toFixed(1)}% share) | $${geo.revenue?.toFixed(2)} revenue | Efficiency: ${revenueEfficiency.toFixed(1)} clicks/$`;
}).join('\n')}

USER ENGAGEMENT & CONVERSION METRICS:
• Conversion Rate: ${engagementMetrics.conversionRate?.current?.toFixed(1) || 0}% (Industry Benchmark: 2-5%) 
  - Trend: ${engagementMetrics.conversionRate?.current > engagementMetrics.conversionRate?.previous ? 'IMPROVING ↗' : 'DECLINING ↘'}
  - Change: ${((engagementMetrics.conversionRate?.current - engagementMetrics.conversionRate?.previous) / engagementMetrics.conversionRate?.previous * 100 || 0).toFixed(1)}%

• Average Session Duration: ${engagementMetrics.avgSessionDuration?.current?.toFixed(1) || 0} minutes
  - Industry Standard: 2-3 minutes | Performance: ${engagementMetrics.avgSessionDuration?.current > 2 ? 'ABOVE AVERAGE ✅' : 'BELOW AVERAGE ⚠'}

• Bounce Rate: ${engagementMetrics.bounceRate?.current?.toFixed(1) || 0}%
  - Benchmark: <40% excellent, 40-55% average, >55% poor
  - Rating: ${engagementMetrics.bounceRate?.current < 40 ? 'EXCELLENT 🏆' : engagementMetrics.bounceRate?.current < 55 ? 'AVERAGE ⚠' : 'NEEDS IMPROVEMENT 🚨'}

• Pages Per Session: ${engagementMetrics.pagesPerSession?.current?.toFixed(1) || 0}
  - Engagement Level: ${engagementMetrics.pagesPerSession?.current > 3 ? 'HIGH' : engagementMetrics.pagesPerSession?.current > 2 ? 'MODERATE' : 'LOW'}

PERFORMANCE BENCHMARKING:
- CTR vs Industry Average (1-3%): ${summary.averageCTR > 3 ? 'EXCELLENT' : summary.averageCTR > 1 ? 'AVERAGE' : 'BELOW EXPECTATIONS'}
- CPC Efficiency: $${summary.averageCPC?.toFixed(2)} (Typical range: $0.50-$2.00)
- Revenue Trend: ${revenueTrend.toUpperCase()}
- Engagement Trend: ${clicksTrend.toUpperCase()}

DEEP ANALYSIS REQUIREMENTS:

Provide an extremely detailed, data-driven analysis with the following structure:

EXECUTIVE SUMMARY (3-4 sentences):
- Overall campaign health assessment
- Key financial performance highlights
- Primary success factors and concerns
- Strategic positioning in the market

COMPREHENSIVE INSIGHTS (5-7 detailed insights):
1. Financial Performance Analysis
2. User Engagement Deep Dive  
3. Geographic Optimization Opportunities
4. Device Performance Evaluation
5. Trend Pattern Recognition
6. Competitive Positioning
7. ROI Assessment

STRATEGIC RECOMMENDATIONS (4-6 actionable items):
1. Immediate Optimization Priorities (next 7 days)
2. Medium-term Strategic Initiatives (next 30 days)
3. Budget Reallocation Suggestions
4. Audience Targeting Refinements
5. Creative & Messaging Improvements
6. Performance Monitoring Enhancements

DETAILED PERFORMANCE ANALYSIS (5-6 sentences):
- Deep dive into performance drivers and constraints
- Seasonal or temporal pattern analysis
- Audience behavior interpretation
- Channel effectiveness evaluation
- Competitive landscape implications
- Future performance projections

TREND FORECAST & GROWTH OPPORTUNITIES (4-5 sentences):
- Short-term performance projections (next 14 days)
- Growth potential quantification
- Risk factors and mitigation strategies
- Scalability assessment
- Market opportunity analysis

CRITICAL SUCCESS FACTORS:
- Focus on data-driven, quantifiable insights
- Provide specific percentage improvements where possible
- Reference industry benchmarks and standards
- Include both tactical and strategic recommendations
- Highlight both strengths to leverage and weaknesses to address

CRITICAL JSON FORMATTING REQUIREMENTS:
- Use double quotes for ALL strings and property names
- Escape any double quotes within strings with backslash (\\")
- Do NOT include any trailing commas
- Ensure all strings are properly terminated
- Use \\n for newlines within strings
- Ensure the JSON is perfectly valid and can be parsed without errors

RESPONSE FORMAT REQUIREMENT:
Respond with ONLY valid JSON - no additional text, no markdown, no explanations. The JSON must be parseable by JSON.parse().

{
  "summary": "Comprehensive 3-4 sentence executive summary covering financial performance, engagement metrics, and strategic positioning with specific performance ratings",
  "insights": [
    "Detailed insight 1 with specific metrics and comparisons",
    "Detailed insight 2 with performance analysis and benchmarks", 
    "Detailed insight 3 with audience behavior interpretation",
    "Detailed insight 4 with geographic/device performance evaluation",
    "Detailed insight 5 with trend analysis and pattern recognition",
    "Detailed insight 6 with competitive positioning assessment",
    "Detailed insight 7 with ROI and efficiency analysis"
  ],
  "recommendations": [
    "Specific, actionable recommendation 1 with expected impact",
    "Specific, actionable recommendation 2 with implementation timeline",
    "Specific, actionable recommendation 3 with resource requirements",
    "Specific, actionable recommendation 4 with success metrics",
    "Specific, actionable recommendation 5 with risk assessment",
    "Specific, actionable recommendation 6 with scalability considerations"
  ],
  "performanceAnalysis": "Comprehensive 5-6 sentence deep dive analysis covering performance drivers, audience behavior, channel effectiveness, competitive implications, and future projections with specific data references",
  "trends": "Detailed 4-5 sentence forecast including short-term projections, growth potential quantification, risk factors, scalability assessment, and market opportunities with specific percentage estimates"
}
`;
  }

 

  private isValidJsonStructure(jsonString: string): boolean {
    try {
      // Basic structural validation
      const trimmed = jsonString.trim();
      if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) {
        return false;
      }
      
      // Check for required fields
      const hasSummary = /"summary"\s*:/.test(trimmed);
      const hasInsights = /"insights"\s*:/.test(trimmed);
      const hasRecommendations = /"recommendations"\s*:/.test(trimmed);
      
      return hasSummary && hasInsights && hasRecommendations;
    } catch {
      return false;
    }
  }

  private fixJsonIssues(jsonString: string): string {
  let fixed = jsonString;
  
  console.log('🔧 Fixing JSON issues...');
  
  // Fix 1: Ensure proper quotes around keys
  fixed = fixed.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g, '$1"$2"$3');
  
  // Fix 2: Remove trailing commas
  fixed = fixed.replace(/,\s*}/g, '}');
  fixed = fixed.replace(/,\s*]/g, ']');
  
  // Fix 3: Handle missing commas between array items (common AI issue)
  fixed = fixed.replace(/"\s*"\s*"/g, '","'); // Fix: "item1" "item2" -> "item1","item2"
  fixed = fixed.replace(/"\s*"\s*\]/g, '"]'); // Fix: "item1" "item2"] -> "item1","item2"]
  
  // Fix 4: Fix array items that are missing quotes or commas
  fixed = fixed.replace(/"insights"\s*:\s*\[\s*([^\[\]]*?)\s*\]/gs, (match, content) => {
    console.log('🔧 Processing insights array content:', content);
    
    // Split by potential item boundaries (quotes or new items)
    const items = content.split(/"\s*,\s*"|\n\s*-\s*|\n\s*\*\s*/).filter(item => item.trim());
    
    const formattedItems = items.map(item => {
      let cleaned = item.trim();
      
      // Remove any existing quotes but preserve content
      cleaned = cleaned.replace(/^"|"$/g, '');
      
      // Handle escaped quotes and special characters
      cleaned = cleaned
        .replace(/\\"/g, '"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
      
      // Ensure the item is properly quoted
      return `"${cleaned}"`;
    });
    
    console.log('🔧 Formatted insights:', formattedItems);
    return `"insights": [${formattedItems.join(', ')}]`;
  });
  
  // Fix 5: Same for recommendations
  fixed = fixed.replace(/"recommendations"\s*:\s*\[\s*([^\[\]]*?)\s*\]/gs, (match, content) => {
    console.log('🔧 Processing recommendations array content:', content);
    
    const items = content.split(/"\s*,\s*"|\n\s*-\s*|\n\s*\*\s*/).filter(item => item.trim());
    
    const formattedItems = items.map(item => {
      let cleaned = item.trim();
      cleaned = cleaned.replace(/^"|"$/g, '');
      cleaned = cleaned
        .replace(/\\"/g, '"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
      
      return `"${cleaned}"`;
    });
    
    console.log('🔧 Formatted recommendations:', formattedItems);
    return `"recommendations": [${formattedItems.join(', ')}]`;
  });
  
  // Fix 6: Handle unescaped quotes within strings more aggressively
  fixed = fixed.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (match, p1) => {
    const escaped = p1
      .replace(/"/g, '\\"')  // Escape unescaped quotes
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
    return `"${escaped}"`;
  });
  
  // Fix 7: Fix missing commas between objects in arrays
  fixed = fixed.replace(/"\s*{/g, '", {');
  fixed = fixed.replace(/}\s*"/g, '}, "');
  
  // Fix 8: Handle arrays that might have object-like items
  fixed = fixed.replace(/"\s*{\s*[^}]*\s*}\s*"/g, (match) => {
    return match.replace(/"\s*{/g, '", {').replace(/}\s*"/g, '}, "');
  });
  
  // Fix 9: Ensure proper string termination in summary and analysis fields
  const stringFields = ['summary', 'performanceAnalysis', 'trends'];
  stringFields.forEach(field => {
    const regex = new RegExp(`"${field}"\\s*:\\s*"([^"]*)`, 'g');
    fixed = fixed.replace(regex, `"${field}": "$1"`);
  });
  
  // Fix 10: Final cleanup - remove any duplicate commas
  fixed = fixed.replace(/,,\s*/g, ', ');
  fixed = fixed.replace(/,,\s*/g, ', ');
  
  console.log('✅ JSON fixes applied');
  return fixed;
}

  private validateAndCleanParsedData(parsed: any): AnalyticsReport {
    return {
      summary: typeof parsed.summary === 'string' && parsed.summary.trim() 
        ? parsed.summary.trim() 
        : 'Analysis based on your campaign performance data.',
      
      insights: Array.isArray(parsed.insights) 
        ? parsed.insights
            .filter((insight: any) => insight && typeof insight === 'string' && insight.trim())
            .map((insight: any) => insight.trim())
            .slice(0, 7) // Limit to 7 insights
        : ['Review performance trends for optimization opportunities.'],
      
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations
            .filter((rec: any) => rec && typeof rec === 'string' && rec.trim())
            .map((rec: any) => rec.trim())
            .slice(0, 6) // Limit to 6 recommendations
        : ['Consider A/B testing to improve campaign performance.'],
      
      performanceAnalysis: typeof parsed.performanceAnalysis === 'string' && parsed.performanceAnalysis.trim()
        ? parsed.performanceAnalysis.trim()
        : 'Campaign shows consistent performance metrics.',
      
      trends: typeof parsed.trends === 'string' && parsed.trends.trim()
        ? parsed.trends.trim()
        : 'Stable performance expected with optimization potential.'
    };
  }

  private tryAlternativeParsing(content: string): AnalyticsReport | null {
    console.log('🔄 Attempting alternative parsing methods...');
    
    try {
      // Method 1: Try to extract structured data using regex patterns
      const sections = this.extractSectionsManually(content);
      if (sections && this.hasValidContent(sections)) {
        return sections;
      }
      
      // Method 2: Try line-by-line parsing for malformed JSON
      const lineByLine = this.parseLineByLine(content);
      if (lineByLine && this.hasValidContent(lineByLine)) {
        return lineByLine;
      }
      
      return null;
    } catch (error) {
      console.error('Alternative parsing failed:', error);
      return null;
    }
  }

  private extractSectionsManually(content: string): AnalyticsReport | null {
    try {
      const report: Partial<AnalyticsReport> = {};
      
      // Extract summary - look for the summary field
      const summaryMatch = content.match(/"summary"\s*:\s*"([^"]*)"/i) || 
                          content.match(/summary["']?\s*:\s*["']([^"']*)["']/i);
      if (summaryMatch) {
        report.summary = summaryMatch[1].trim();
      }
      
      // Extract insights - look for array pattern
      const insightsMatch = content.match(/"insights"\s*:\s*\[(.*?)\](?=,|}|$)/s);
      if (insightsMatch) {
        const insightsContent = insightsMatch[1];
        const insightItems = insightsContent.match(/"([^"]*)"/g) || [];
        report.insights = insightItems.map(item => 
          item.slice(1, -1).replace(/\\"/g, '"').trim()
        ).filter(item => item.length > 0);
      }
      
      // Extract recommendations
      const recsMatch = content.match(/"recommendations"\s*:\s*\[(.*?)\](?=,|}|$)/s);
      if (recsMatch) {
        const recsContent = recsMatch[1];
        const recItems = recsContent.match(/"([^"]*)"/g) || [];
        report.recommendations = recItems.map(item => 
          item.slice(1, -1).replace(/\\"/g, '"').trim()
        ).filter(item => item.length > 0);
      }
      
      // Extract performance analysis
      const analysisMatch = content.match(/"performanceAnalysis"\s*:\s*"([^"]*)"/i) ||
                           content.match(/performanceAnalysis["']?\s*:\s*["']([^"']*)["']/i);
      if (analysisMatch) {
        report.performanceAnalysis = analysisMatch[1].trim();
      }
      
      // Extract trends
      const trendsMatch = content.match(/"trends"\s*:\s*"([^"]*)"/i) ||
                         content.match(/trends["']?\s*:\s*["']([^"']*)["']/i);
      if (trendsMatch) {
        report.trends = trendsMatch[1].trim();
      }
      
      // Validate we have at least some content
      if (report.summary || (report.insights && report.insights.length > 0)) {
        return this.validateAndCleanParsedData(report);
      }
      
      return null;
    } catch (error) {
      console.error('Manual section extraction failed:', error);
      return null;
    }
  }

  private parseLineByLine(content: string): AnalyticsReport | null {
    try {
      const lines = content.split('\n').filter(line => line.trim());
      const report: Partial<AnalyticsReport> = {
        insights: [],
        recommendations: []
      };
      
      let currentSection = '';
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (trimmedLine.includes('"summary"')) {
          currentSection = 'summary';
          const match = trimmedLine.match(/"summary"\s*:\s*"([^"]*)"/);
          if (match) report.summary = match[1];
        } else if (trimmedLine.includes('"insights"')) {
          currentSection = 'insights';
        } else if (trimmedLine.includes('"recommendations"')) {
          currentSection = 'recommendations';
        } else if (trimmedLine.includes('"performanceAnalysis"')) {
          currentSection = 'performanceAnalysis';
          const match = trimmedLine.match(/"performanceAnalysis"\s*:\s*"([^"]*)"/);
          if (match) report.performanceAnalysis = match[1];
        } else if (trimmedLine.includes('"trends"')) {
          currentSection = 'trends';
          const match = trimmedLine.match(/"trends"\s*:\s*"([^"]*)"/);
          if (match) report.trends = match[1];
        } else if (currentSection === 'insights' && trimmedLine.includes('"')) {
          const match = trimmedLine.match(/"([^"]*)"/);
          if (match && report.insights) {
            report.insights.push(match[1]);
          }
        } else if (currentSection === 'recommendations' && trimmedLine.includes('"')) {
          const match = trimmedLine.match(/"([^"]*)"/);
          if (match && report.recommendations) {
            report.recommendations.push(match[1]);
          }
        }
      }
      
      if (report.summary || (report.insights && report.insights.length > 0)) {
        return this.validateAndCleanParsedData(report);
      }
      
      return null;
    } catch (error) {
      console.error('Line-by-line parsing failed:', error);
      return null;
    }
  }

  private hasValidContent(report: AnalyticsReport): boolean {
    return !!(report.summary?.trim() || 
             report.insights?.length > 0 || 
             report.recommendations?.length > 0);
  }

  private generateFallbackReport(): AnalyticsReport {
    return {
      summary: "Based on your campaign analytics, we've identified stable performance with consistent user engagement. The data shows reliable click-through rates and revenue generation with opportunities for optimization.",
      insights: [
        "Campaign demonstrates steady performance across key metrics",
        "User engagement patterns indicate healthy audience interaction",
        "Current performance provides a solid foundation for growth",
        "Data reveals opportunities for targeted optimization efforts"
      ],
      recommendations: [
        "Implement A/B testing for different ad creatives and messaging",
        "Analyze peak performance periods to optimize ad scheduling",
        "Explore audience segmentation based on performance data",
        "Consider retargeting strategies for engaged users"
      ],
      performanceAnalysis: "The campaign shows consistent performance with stable user engagement metrics. Click-through rates and revenue generation indicate reliable audience response to your advertising efforts.",
      trends: "Based on current performance patterns, we anticipate continued stable engagement with potential for 15-25% improvement through systematic optimization of top-performing segments."
    };
  }

  // Test method to verify API connection
  // Update the testConnection method in geminiService.ts
async testConnection(): Promise<boolean> {
  if (!this.apiKey) {
    console.error('No Gemini API key configured');
    return false;
  }

  if (!this.genAI) {
    console.error('Gemini AI not initialized');
    return false;
  }

  try {
    // Use a very simple and reliable connection test
    const result = await this.genAI.models.generateContent({
      model: this.modelName,
      contents: 'Say "OK"',
      config: {
        maxOutputTokens: 5,
        temperature: 0.1
      }
    });

    console.log('🔍 Connection test full response:', result);

    // Check if we have any response at all (don't worry about text content for connection test)
    const hasResponse = result && 
      (result.candidates?.length > 0 || result.text !== undefined);
    
    console.log(`🔍 Connection test - Has response: ${hasResponse}`);
    
    return hasResponse;
  } catch (error: any) {
    console.error('Gemini connection test failed:', error);
    
    // Check if it's a model-specific error and try fallback
    if (error.message?.includes('not found') || error.status === 404) {
      console.log(`🔄 Model ${this.modelName} not found, trying fallback...`);
      this.modelName = 'gemini-1.5-flash';
      return this.testConnection();
    }
    
    return false;
  }
}

  getServiceInfo(): string {
    return `Model: ${this.modelName} | API Key: ${this.apiKey ? 'Configured' : 'Missing'} | Initialized: ${!!this.genAI}`;
  }

  isReady(): boolean {
    return !!(this.apiKey && this.genAI);
  }
}

export const geminiService = new GeminiService();