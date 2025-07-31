import type { GitHubRepo, Tag, Category, KeywordRule } from '../types'

class Classify {
	//默认的标签配置
	private defaultTags: Tag[] = [
		{
			id: 'frontend',
			name: '前端开发',
			color: '#1890ff',
			description: '前端框架、库和工具',
		},
		{
			id: 'backend',
			name: '后端开发',
			color: '#52c41a',
			description: '后端框架、API和服务器',
		},
		{
			id: 'mobile',
			name: '移动开发',
			color: '#722ed1',
			description: '移动应用开发',
		},
		{
			id: 'ai-ml',
			name: 'AI/机器学习',
			color: '#fa541c',
			description: '人工智能和机器学习',
		},
		{
			id: 'devops',
			name: 'DevOps',
			color: '#13c2c2',
			description: '部署、监控和运维工具',
		},
		{
			id: 'database',
			name: '数据库',
			color: '#eb2f96',
			description: '数据库和数据存储',
		},
		{
			id: 'tools',
			name: '开发工具',
			color: '#faad14',
			description: '开发辅助工具',
		},
		{
			id: 'game',
			name: '游戏开发',
			color: '#f759ab',
			description: '游戏引擎和游戏开发',
		},
		{
			id: 'security',
			name: '安全',
			color: '#ff4d4f',
			description: '网络安全和加密',
		},
		{
			id: 'data',
			name: '数据科学',
			color: '#9254de',
			description: '数据分析和可视化',
		},
		{
			id: 'ui-ux',
			name: 'UI/UX',
			color: '#36cfc9',
			description: 'UI组件和设计系统',
		},
		{
			id: 'testing',
			name: '测试',
			color: '#ffc53d',
			description: '测试框架和工具',
		},
		{ id: 'docs', name: '文档', color: '#95de64', description: '文档和教程' },
		{ id: 'other', name: '其他', color: '#d9d9d9', description: '未分类项目' },
	]

	// 默认关键词规则
	private defaultKeywordRules: KeywordRule[] = [
		// 前端开发
		{
			keywords: [
				'react',
				'vue',
				'angular',
				'svelte',
				'frontend',
				'javascript',
				'typescript',
				'css',
				'html',
				'webpack',
				'vite',
				'next.js',
				'nuxt',
			],
			tagId: 'frontend',
			priority: 10,
		},

		// 后端开发
		{
			keywords: [
				'node.js',
				'express',
				'koa',
				'nestjs',
				'spring',
				'django',
				'flask',
				'fastapi',
				'gin',
				'echo',
				'backend',
				'api',
				'server',
				'microservice',
			],
			tagId: 'backend',
			priority: 10,
		},

		// 移动开发
		{
			keywords: [
				'react-native',
				'flutter',
				'ionic',
				'cordova',
				'xamarin',
				'android',
				'ios',
				'mobile',
				'app',
			],
			tagId: 'mobile',
			priority: 10,
		},

		// AI/机器学习
		{
			keywords: [
				'tensorflow',
				'pytorch',
				'keras',
				'scikit-learn',
				'machine-learning',
				'deep-learning',
				'neural-network',
				'ai',
				'ml',
				'nlp',
				'computer-vision',
			],
			tagId: 'ai-ml',
			priority: 10,
		},

		// DevOps
		{
			keywords: [
				'docker',
				'kubernetes',
				'jenkins',
				'gitlab-ci',
				'github-actions',
				'terraform',
				'ansible',
				'devops',
				'ci-cd',
				'deployment',
			],
			tagId: 'devops',
			priority: 10,
		},

		// 数据库
		{
			keywords: [
				'mysql',
				'postgresql',
				'mongodb',
				'redis',
				'elasticsearch',
				'database',
				'sql',
				'nosql',
				'orm',
			],
			tagId: 'database',
			priority: 10,
		},

		// 开发工具
		{
			keywords: [
				'vscode',
				'vim',
				'emacs',
				'git',
				'cli',
				'terminal',
				'shell',
				'bash',
				'zsh',
				'tool',
				'utility',
				'helper',
			],
			tagId: 'tools',
			priority: 8,
		},

		// 游戏开发
		{
			keywords: [
				'unity',
				'unreal',
				'godot',
				'game',
				'gaming',
				'gamedev',
				'engine',
			],
			tagId: 'game',
			priority: 10,
		},

		// 安全
		{
			keywords: [
				'security',
				'encryption',
				'crypto',
				'ssl',
				'tls',
				'auth',
				'authentication',
				'authorization',
				'vulnerability',
			],
			tagId: 'security',
			priority: 10,
		},

		// 数据科学
		{
			keywords: [
				'pandas',
				'numpy',
				'matplotlib',
				'jupyter',
				'data-science',
				'analytics',
				'visualization',
				'chart',
				'graph',
			],
			tagId: 'data',
			priority: 10,
		},

		// UI/UX
		{
			keywords: [
				'ui',
				'ux',
				'design',
				'component',
				'antd',
				'material-ui',
				'bootstrap',
				'tailwind',
				'css-framework',
			],
			tagId: 'ui-ux',
			priority: 9,
		},

		// 测试
		{
			keywords: [
				'jest',
				'mocha',
				'chai',
				'cypress',
				'selenium',
				'testing',
				'test',
				'unit-test',
				'e2e',
			],
			tagId: 'testing',
			priority: 9,
		},

		// 文档
		{
			keywords: [
				'documentation',
				'docs',
				'readme',
				'tutorial',
				'guide',
				'book',
				'learning',
			],
			tagId: 'docs',
			priority: 7,
		},
	]

	// 获取默认标签
	getDefaultTags(): Tag[] {
		return [...this.defaultTags]
	}

	// 获取默认关键词规则
	getDefaultKeywordRules(): KeywordRule[] {
		return [...this.defaultKeywordRules]
	}

	// 基于关键词自动分类仓库
	classifyRepo(repo: GitHubRepo, keywordRules: KeywordRule[]): string[] {
		const matchedTags: { tagId: string; priority: number }[] = []

		// 构建搜索文本（项目名称 + 描述 + 主题 + 语言）
		const searchText = [
			repo.name,
			repo.description || '',
			...(repo.topics || []),
			repo.language || '',
		]
			.join(' ')
			.toLowerCase()

		// 遍历关键词规则
		keywordRules.forEach((rule) => {
			const hasMatch = rule.keywords.some((keyword) =>
				searchText.includes(keyword.toLowerCase())
			)

			if (hasMatch) {
				matchedTags.push({ tagId: rule.tagId, priority: rule.priority })
			}
		})

		// 按优先级排序并去重
		const uniqueTags = matchedTags
			.sort((a, b) => b.priority - a.priority)
			.reduce((acc, current) => {
				if (!acc.find((tag) => tag.tagId === current.tagId)) {
					acc.push(current)
				}
				return acc
			}, [] as { tagId: string; priority: number }[])
			.map((tag) => tag.tagId)

		// 如果没有匹配到任何标签，归类为"其他"
		return uniqueTags.length > 0 ? uniqueTags : ['other']
	}

	// 分类仓库
	classifyRepos(
		repos: GitHubRepo[],
		keywordRules: KeywordRule[]
	): Map<string, GitHubRepo[]> {
		const reposByTag = new Map<string, GitHubRepo[]>()

		repos.forEach((repo) => {
			const tagIds = this.classifyRepo(repo, keywordRules)

			tagIds.forEach((tagId) => {
				if (!reposByTag.has(tagId)) {
					reposByTag.set(tagId, [])
				}
				reposByTag.get(tagId)!.push(repo)
			})
		})

		return reposByTag
	}

	// 创建分类
	createCategories(
		repos: GitHubRepo[],
		tags: Tag[],
		keywordRules: KeywordRule[]
	): Category[] {
		const reposByTag = this.classifyRepos(repos, keywordRules)
		const categories: Category[] = []

		tags.forEach((tag) => {
			const tagRepos = reposByTag.get(tag.id) || []
			if (tagRepos.length > 0) {
				categories.push({
					id: tag.id,
					name: tag.name,
					description: tag.description,
					tags: [tag],
					repos: tagRepos,
				})
			}
		})

		// 按仓库数量排序
		return categories.sort((a, b) => b.repos.length - a.repos.length)
	}

	// 搜索仓库
	searchRepos(repos: GitHubRepo[], query: string): GitHubRepo[] {
		if (!query.trim()) return repos

		const searchQuery = query.toLowerCase()
		return repos.filter((repo) => {
			const searchText = [
				repo.name,
				repo.description || '',
				repo.full_name,
				...(repo.topics || []),
				repo.language || '',
			]
				.join(' ')
				.toLowerCase()

			return searchText.includes(searchQuery)
		})
	}

	// 按语言过滤
	filterByLanguage(repos: GitHubRepo[], language: string): GitHubRepo[] {
		if (!language || language === 'all') return repos
		return repos.filter((repo) => repo.language === language)
	}

	// 获取所有语言列表
	getLanguages(repos: GitHubRepo[]): string[] {
		const languages = new Set<string>()
		repos.forEach((repo) => {
			if (repo.language) {
				languages.add(repo.language)
			}
		})
		return Array.from(languages).sort()
	}
}

export default Classify
