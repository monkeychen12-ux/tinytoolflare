export interface Tool {
  icon: string;
  title: string;
  description: string;
  link: string;
}

export interface ToolCategory {
  name: string;
  tools: Tool[];
}

export interface ToolConfig {
  key: string;
  tools: string[];
} 