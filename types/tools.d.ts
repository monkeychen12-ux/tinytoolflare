export interface Tool {
  icon: string;
  title: string;
  description: string;
  link: string;
}

export interface ToolCategory {
  key: string;
  name: string;
  tools: Tool[];
}

export interface ToolConfig {
  key: string;
  path: string;
  tools: string[];
}
