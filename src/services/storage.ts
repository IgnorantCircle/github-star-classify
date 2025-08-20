import type {
	UserConfig,
	GitHubRepo,
	Tag,
	Category,
	KeywordRule,
} from '../types'
import Classify from './classify'
class StorageService {
	private static readonly STORAGE_KEYS = {
		USER_CONFIG: 'github_star_classifier_user_config',
		REPOS: 'github_star_classifier_repos',
		TAGS: 'github_star_classifier_tags',
		CATEGORIES: 'github_star_classifier_categories',
		KEYWORD_RULES: 'github_star_classifier_keyword_rules',
		LAST_SYNC: 'github_star_classifier_last_sync',
	}

	private ClassifyService = new Classify()

	// 保存用户配置
	saveUserConfig(config: UserConfig): void {
		try {
			localStorage.setItem(
				StorageService.STORAGE_KEYS.USER_CONFIG,
				JSON.stringify(config)
			)
		} catch (error) {
			console.log('保存用户配置失败:', error)
		}
	}

	// 获取用户配置
	getUserConfig(): UserConfig {
		try {
			const stored = localStorage.getItem(
				StorageService.STORAGE_KEYS.USER_CONFIG
			)
			if (stored) {
				const config = JSON.parse(stored)
				return {
					...config,
					keywordRules:
						config.keywordRules ||
						this.ClassifyService.getDefaultKeywordRules(),
				}
			}
		} catch (error) {
			console.log('获取用户配置失败:', error)
		}

		// 返回默认配置
		return {
			username: 'IgnorantCircle',
			autoClassify: true,
			keywordRules: this.ClassifyService.getDefaultKeywordRules(),
		}
	}

	// 保存仓库数据
	saveRepos(repos: GitHubRepo[]): void {
		try {
			localStorage.setItem(
				StorageService.STORAGE_KEYS.REPOS,
				JSON.stringify(repos)
			)
			// 更新最后同步时间
			localStorage.setItem(
				StorageService.STORAGE_KEYS.LAST_SYNC,
				new Date().toISOString()
			)
		} catch (error) {
			console.log('保存仓库数据失败:', error)
		}
	}

	// 获取仓库数据
	getRepos(): GitHubRepo[] {
		try {
			const stored = localStorage.getItem(StorageService.STORAGE_KEYS.REPOS)
			return stored ? JSON.parse(stored) : []
		} catch (error) {
			console.log('获取仓库数据失败:', error)
			return []
		}
	}

	// 保存标签
	saveTags(tags: Tag[]): void {
		try {
			localStorage.setItem(
				StorageService.STORAGE_KEYS.TAGS,
				JSON.stringify(tags)
			)
		} catch (error) {
			console.log('保存标签失败:', error)
		}
	}

	// 获取标签
	getTags(): Tag[] {
		try {
			const stored = localStorage.getItem(StorageService.STORAGE_KEYS.TAGS)
			return stored ? JSON.parse(stored) : this.ClassifyService.getDefaultTags()
		} catch (error) {
			console.log('获取标签失败:', error)
			return this.ClassifyService.getDefaultTags()
		}
	}

	// 保存分类
	saveCategories(categories: Category[]): void {
		try {
			localStorage.setItem(
				StorageService.STORAGE_KEYS.CATEGORIES,
				JSON.stringify(categories)
			)
		} catch (error) {
			console.log('保存分类失败:', error)
		}
	}

	// 获取分类
	getCategories(): Category[] {
		try {
			const stored = localStorage.getItem(
				StorageService.STORAGE_KEYS.CATEGORIES
			)
			return stored ? JSON.parse(stored) : []
		} catch (error) {
			console.log('获取分类失败:', error)
			return []
		}
	}

	// 保存关键词规则
	saveKeywordRules(rules: KeywordRule[]): void {
		try {
			localStorage.setItem(
				StorageService.STORAGE_KEYS.KEYWORD_RULES,
				JSON.stringify(rules)
			)
		} catch (error) {
			console.log('保存关键词规则失败:', error)
		}
	}

	// 获取关键词规则
	getKeywordRules(): KeywordRule[] {
		try {
			const stored = localStorage.getItem(
				StorageService.STORAGE_KEYS.KEYWORD_RULES
			)
			return stored
				? JSON.parse(stored)
				: this.ClassifyService.getDefaultKeywordRules()
		} catch (error) {
			console.log('获取关键词规则失败:', error)
			return this.ClassifyService.getDefaultKeywordRules()
		}
	}

	// 获取最后同步时间
	getLastSyncTime(): Date | null {
		try {
			const stored = localStorage.getItem(StorageService.STORAGE_KEYS.LAST_SYNC)
			return stored ? new Date(stored) : null
		} catch (error) {
			console.log('获取最后同步时间失败:', error)
			return null
		}
	}

	// 清除所有数据
	clearAllData(): void {
		try {
			Object.values(StorageService.STORAGE_KEYS).forEach((key) => {
				localStorage.removeItem(key)
			})
		} catch (error) {
			console.log('清除数据失败:', error)
		}
	}

	// 导出数据
	exportData(): string {
		const data = {
			userConfig: this.getUserConfig(),
			repos: this.getRepos(),
			tags: this.getTags(),
			categories: this.getCategories(),
			keywordRules: this.getKeywordRules(),
			lastSync: this.getLastSyncTime(),
			exportTime: new Date().toISOString(),
		}
		return JSON.stringify(data, null, 2)
	}

	// 导入数据
	importData(jsonData: string): boolean {
		try {
			const data = JSON.parse(jsonData)

			if (data.userConfig) this.saveUserConfig(data.userConfig)
			if (data.repos) this.saveRepos(data.repos)
			if (data.tags) this.saveTags(data.tags)
			if (data.categories) this.saveCategories(data.categories)
			if (data.keywordRules) this.saveKeywordRules(data.keywordRules)

			return true
		} catch (error) {
			console.log('导入数据失败:', error)
			return false
		}
	}

	// 获取存储使用情况
	getStorageUsage(): { used: number; total: number; percentage: number } {
		try {
			let used = 0
			Object.values(StorageService.STORAGE_KEYS).forEach((key) => {
				const item = localStorage.getItem(key)
				if (item) {
					used += item.length
				}
			})

			// localStorage通常限制为5-10MB，这里假设5MB
			const total = 5 * 1024 * 1024 // 5MB in bytes
			const percentage = (used / total) * 100

			return { used, total, percentage }
		} catch (error) {
			console.log('获取存储使用情况失败:', error)
			return { used: 0, total: 0, percentage: 0 }
		}
	}
}

export default StorageService
