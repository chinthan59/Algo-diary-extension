import { SolutionAnalysis } from '../services/groq';

export function generateMarkdown(
  payload: {
    platform: string;
    title: string;
    url: string;
    language: string;
    runtime: string;
    memory: string;
    code: string;
  },
  analysis: SolutionAnalysis
): string {
  return `# [${payload.title}](${payload.url})

---

## Approach: ${analysis.approach}

${analysis.intuition}

## Algorithm Steps
${analysis.steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

## Complexity
- **Time**: ${analysis.time_complexity}
- **Space**: ${analysis.space_complexity}

## Patterns Used
${analysis.patterns.map(pattern => `\`${pattern}\``).join(' ')}

## Edge Cases
${analysis.edge_cases.map(edge => `- ${edge}`).join('\n')}

## Alternative Approaches
${analysis.alternative_approaches.map(alt => `- ${alt}`).join('\n')}

## My Solution (${payload.language})
\`\`\`${payload.language}
${payload.code}
\`\`\`

---
*Auto-documented on ${new Date().toISOString().split('T')[0]} using [solution-tracker](https://github.com/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO})*
`;
}
