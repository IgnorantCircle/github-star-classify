// GitHub仓库数据类型
export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
  starred_at: string; 
  owner: {
    login: string;
    avatar_url: string;
  };
}

// 标签类型
export interface Tag {
  id: string;
  name: string;
  color: string;
  description?: string;
}

// 分类类型
export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  tags: Tag[];
  repos: GitHubRepo[];
}

// 关键词匹配规则
export interface KeywordRule {
  keywords: string[];
  tagId: string;
  priority: number; // 优先级，数字越大优先级越高
}

// 用户配置
export interface UserConfig {
  githubToken?: string;
  username: string;
  autoClassify: boolean;
  keywordRules: KeywordRule[];
}

// API响应类型
export interface StarredReposResponse {
  data: GitHubRepo[];
  hasMore: boolean;
  nextPage?: number;
}

// 应用状态
export interface AppState {
  repos: GitHubRepo[];
  categories: Category[];
  tags: Tag[];
  loading: boolean;
  error: string | null;
  userConfig: UserConfig;
}