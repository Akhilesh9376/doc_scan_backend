import { Insight } from "../types/api.js";

export function generateMockSummary(fileName: string): string {
  const summaries = [
    `This document provides a comprehensive overview of key business metrics and strategic initiatives. The analysis reveals important trends in market performance, operational efficiency, and customer engagement.`,
    `The document contains detailed financial information and performance indicators. Analysis shows year-over-year improvement with particular strengths in revenue generation and cost management.`,
    `This document outlines organizational structure and operational procedures. Key insights include process improvement opportunities, stakeholder alignment, and implementation roadmap.`,
  ];
  return summaries[Math.floor(Math.random() * summaries.length)];
}

export function generateMockInsights(fileName: string): Insight[] {
  return [
    {
      id: "insight-1",
      title: "Revenue Growth Opportunity",
      description:
        "Identified 23% potential revenue increase through market expansion",
      priority: "high",
      category: "financial",
      relevanceScore: 0.95,
    },
    {
      id: "insight-2",
      title: "Operational Efficiency",
      description:
        "Process optimization can reduce operational costs by 15-20%",
      priority: "high",
      category: "operational",
      relevanceScore: 0.87,
    },
    {
      id: "insight-3",
      title: "Regulatory Compliance",
      description: "Current practices align with regulatory requirements",
      priority: "medium",
      category: "legal",
      relevanceScore: 0.76,
    },
    {
      id: "insight-4",
      title: "Market Positioning",
      description: "Strong competitive advantage in target segments",
      priority: "medium",
      category: "strategic",
      relevanceScore: 0.82,
    },
  ];
}

export function generateMockResponse(question: string): string {
  const responses = [
    `Based on the document analysis, this question relates to key findings. The document indicates positive performance metrics with specific recommendations for improvement in this area.`,
    `The document contains relevant information suggesting that this aspect is critical for success. Specific actions recommended include strategic planning and resource allocation.`,
    `This is addressed in the document's analysis section. The findings suggest implementation of best practices would yield significant benefits.`,
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}
