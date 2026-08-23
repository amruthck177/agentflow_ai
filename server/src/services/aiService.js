const env = require('../config/env');
const axios = require('axios');

/**
 * Deterministic rule-based workflow builder fallback
 */
const buildDeterministicWorkflow = (prompt) => {
  const p = prompt.toLowerCase();

  const baseTrigger = {
    id: 'node_1',
    type: 'trigger',
    label: 'Trigger Event',
    position: { x: 250, y: 50 },
    data: {
      event: 'manual_trigger',
      description: 'Triggered manually or via webhook',
    },
  };

  let nodes = [baseTrigger];
  let edges = [];
  let name = 'Automated Workflow';
  let description = `Generated from prompt: "${prompt}"`;

  if (p.includes('email') || p.includes('gmail') || p.includes('invoice') || p.includes('payment')) {
    name = 'Email & Invoice Alert Pipeline';
    nodes.push({
      id: 'node_2',
      type: 'ai',
      label: 'Extract Details (AI)',
      position: { x: 250, y: 180 },
      data: {
        model: 'gemini-1.5-flash',
        promptTemplate: 'Analyze incoming data and extract customer email, amount, and status.',
      },
    });
    nodes.push({
      id: 'node_3',
      type: 'condition',
      label: 'Is Payment Valid?',
      position: { x: 250, y: 310 },
      data: {
        condition: 'status === "SUCCESS"',
      },
    });
    nodes.push({
      id: 'node_4',
      type: 'integration',
      label: 'Send Gmail Notification',
      position: { x: 100, y: 450 },
      data: {
        provider: 'gmail',
        action: 'sendMail',
        subject: 'Payment Confirmation',
      },
    });
    nodes.push({
      id: 'node_5',
      type: 'integration',
      label: 'Post Slack Alert',
      position: { x: 400, y: 450 },
      data: {
        provider: 'slack',
        action: 'postMessage',
        channel: '#finance-alerts',
      },
    });
    nodes.push({
      id: 'node_6',
      type: 'end',
      label: 'Complete',
      position: { x: 250, y: 580 },
      data: { status: 'COMPLETED' },
    });

    edges = [
      { id: 'e1-2', source: 'node_1', target: 'node_2', animated: true },
      { id: 'e2-3', source: 'node_2', target: 'node_3', animated: true },
      { id: 'e3-4', source: 'node_3', target: 'node_4', label: 'True', animated: true },
      { id: 'e3-5', source: 'node_3', target: 'node_5', label: 'False', animated: true },
      { id: 'e4-6', source: 'node_4', target: 'node_6', animated: true },
      { id: 'e5-6', source: 'node_5', target: 'node_6', animated: true },
    ];
  } else if (p.includes('slack') || p.includes('discord') || p.includes('notify') || p.includes('alert')) {
    name = 'Team Notification Broadcaster';
    nodes.push({
      id: 'node_2',
      type: 'action',
      label: 'Format Message Payload',
      position: { x: 250, y: 180 },
      data: { format: 'markdown', template: 'Alert: ${event.summary}' },
    });
    nodes.push({
      id: 'node_3',
      type: 'integration',
      label: 'Post to Slack',
      position: { x: 150, y: 320 },
      data: { provider: 'slack', action: 'postMessage', channel: '#general' },
    });
    nodes.push({
      id: 'node_4',
      type: 'integration',
      label: 'Post to Discord',
      position: { x: 350, y: 320 },
      data: { provider: 'discord', action: 'postBotMessage', channel: 'announcements' },
    });
    nodes.push({
      id: 'node_5',
      type: 'end',
      label: 'Complete',
      position: { x: 250, y: 460 },
      data: { status: 'COMPLETED' },
    });

    edges = [
      { id: 'e1-2', source: 'node_1', target: 'node_2', animated: true },
      { id: 'e2-3', source: 'node_2', target: 'node_3', animated: true },
      { id: 'e2-4', source: 'node_2', target: 'node_4', animated: true },
      { id: 'e3-5', source: 'node_3', target: 'node_5', animated: true },
      { id: 'e4-5', source: 'node_4', target: 'node_5', animated: true },
    ];
  } else if (p.includes('sheet') || p.includes('row') || p.includes('record') || p.includes('data')) {
    name = 'Google Sheets Data Collector';
    nodes.push({
      id: 'node_2',
      type: 'ai',
      label: 'Transform & Normalize Row',
      position: { x: 250, y: 180 },
      data: { model: 'gemini-1.5-flash', action: 'parse_table_data' },
    });
    nodes.push({
      id: 'node_3',
      type: 'integration',
      label: 'Append to Google Sheet',
      position: { x: 250, y: 320 },
      data: { provider: 'google-sheets', action: 'appendRow', range: 'Sheet1!A:E' },
    });
    nodes.push({
      id: 'node_4',
      type: 'end',
      label: 'Complete',
      position: { x: 250, y: 460 },
      data: { status: 'COMPLETED' },
    });

    edges = [
      { id: 'e1-2', source: 'node_1', target: 'node_2', animated: true },
      { id: 'e2-3', source: 'node_2', target: 'node_3', animated: true },
      { id: 'e3-4', source: 'node_3', target: 'node_4', animated: true },
    ];
  } else {
    name = 'Custom Agentic Flow';
    nodes.push({
      id: 'node_2',
      type: 'ai',
      label: 'AI Reasoning Step',
      position: { x: 250, y: 180 },
      data: { instruction: prompt },
    });
    nodes.push({
      id: 'node_3',
      type: 'action',
      label: 'Execute Action',
      position: { x: 250, y: 320 },
      data: { actionType: 'generic' },
    });
    nodes.push({
      id: 'node_4',
      type: 'end',
      label: 'Complete',
      position: { x: 250, y: 460 },
      data: { status: 'COMPLETED' },
    });

    edges = [
      { id: 'e1-2', source: 'node_1', target: 'node_2', animated: true },
      { id: 'e2-3', source: 'node_2', target: 'node_3', animated: true },
      { id: 'e3-4', source: 'node_3', target: 'node_4', animated: true },
    ];
  }

  return {
    name,
    description,
    nodes,
    edges,
    generator: 'deterministic-fallback',
  };
};

/**
 * Generate workflow from natural language prompt
 * Follows precedence: OpenRouter -> Gemini SDK -> Deterministic Builder
 */
const generateWorkflowFromPrompt = async (prompt) => {
  const systemPrompt = `You are an expert automation architect. The user will provide an automation goal in natural language.
Generate a complete, valid visual workflow graph in JSON format.
Valid node types are: "trigger", "action", "condition", "integration", "ai", "end".
Valid integration providers are: "gmail", "slack", "discord", "google-sheets".

Return ONLY valid JSON matching this schema:
{
  "name": "Short workflow name",
  "description": "Clear description",
  "nodes": [
    {
      "id": "node_1",
      "type": "trigger",
      "label": "Display Label",
      "position": { "x": 250, "y": 50 },
      "data": { "key": "value" }
    }
  ],
  "edges": [
    {
      "id": "e1-2",
      "source": "node_1",
      "target": "node_2",
      "label": "optional branch label",
      "animated": true
    }
  ],
  "tags": ["tag1", "tag2"]
}`;

  // 1. Try OpenRouter
  if (env.OPENROUTER_API_KEY) {
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'meta-llama/llama-3.3-70b-instruct',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Generate an automation workflow for: "${prompt}"` },
          ],
          response_format: { type: 'json_object' },
        },
        {
          headers: {
            Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
            'HTTP-Referer': env.CLIENT_URL,
            'X-Title': 'Agentflow_AI',
          },
          timeout: 15000,
        }
      );

      const content = response.data.choices[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        return { ...parsed, generator: 'openrouter' };
      }
    } catch (err) {
      console.warn('⚠️  OpenRouter generation failed, trying fallback:', err.message);
    }
  }

  // 2. Try Google Gemini
  if (env.GEMINI_API_KEY) {
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const result = await model.generateContent([
        systemPrompt,
        `Generate an automation workflow for: "${prompt}"`,
      ]);

      const text = result.response.text();
      // Extract JSON if model enclosed it in markdown codeblocks
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return { ...parsed, generator: 'gemini' };
      }
    } catch (err) {
      console.warn('⚠️  Gemini generation failed, falling back to rule builder:', err.message);
    }
  }

  // 3. Fallback to deterministic rule-based builder
  return buildDeterministicWorkflow(prompt);
};

module.exports = {
  generateWorkflowFromPrompt,
  buildDeterministicWorkflow,
};
