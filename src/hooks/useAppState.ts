import { useState, useEffect, useCallback } from 'react'
import type {
	GitHubRepo,
	Category,
	Tag,
	UserConfig,
	KeywordRule,
} from '../types'
import GitHubApiService from '../services/githubApi'
import ClassificationService from '../services/classify'
import StorageService from '../services/storage'
import type { MessageInstance } from 'antd/es/message/interface'

export const useAppState = (messageApi: MessageInstance) => {
	const [repos, setRepos] = useState<GitHubRepo[]>([])
	const [categories, setCategories] = useState<Category[]>([])
	const [tags, setTags] = useState<Tag[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [userConfig, setUserConfig] = useState<UserConfig>({
		username: '',
		autoClassify: true,
		keywordRules: [],
	})

	// 服务实例
	const [githubApi] = useState(() => new GitHubApiService())
	const [classificationService] = useState(() => new ClassificationService())
	const [storageService] = useState(() => new StorageService())

	// 初始化应用状态
	useEffect(() => {
		const initializeApp = () => {
			try {
				// 加载用户配置
				const config = storageService.getUserConfig()
				setUserConfig(config)

				// 更新GitHub API token
				if (config.githubToken) {
					githubApi.updateToken(config.githubToken)
				}

				// 加载标签
				const storedTags = storageService.getTags()
				setTags(storedTags)

				// 加载仓库数据
				const storedRepos = storageService.getRepos()
				setRepos(storedRepos)

				// 如果有仓库数据，重新分类
				if (storedRepos.length > 0 && config.autoClassify) {
					const newCategories = classificationService.createCategories(
						storedRepos,
						storedTags,
						config.keywordRules
					)
					setCategories(newCategories)
					storageService.saveCategories(newCategories)
				} else {
					const storedCategories = storageService.getCategories()
					setCategories(storedCategories)
				}
			} catch (err) {
				console.log('初始化应用失败:', err)
				setError('初始化应用失败')
			}
		}

		initializeApp()
	}, [githubApi, classificationService, storageService])

	// 更新用户配置
	const updateUserConfig = useCallback(
		(newConfig: Partial<UserConfig>) => {
			const updatedConfig = { ...userConfig, ...newConfig }
			setUserConfig(updatedConfig)
			storageService.saveUserConfig(updatedConfig)

			// 如果更新了token，更新API实例
			if (newConfig.githubToken !== undefined) {
				githubApi.updateToken(newConfig.githubToken)
			}
		},
		[userConfig, storageService, githubApi]
	)

	// 获取starr仓库
	const fetchStarredRepos = useCallback(
		async () => {
			if (!userConfig.username) {
				messageApi.error('请先设置GitHub用户名')
				return
			}

			setLoading(true)
			setError(null)

			try {
				// 检查用户名是否有效
				const isValidUser = await githubApi.validateUser(userConfig.username)
				if (!isValidUser) {
					throw new Error('GitHub用户名不存在')
				}

				// 获取所有starred仓库
				const starredRepos = await githubApi.getAllStarredRepos(
					userConfig.username
				)

				setRepos(starredRepos)
				storageService.saveRepos(starredRepos)

				// 自动分类
				if (userConfig.autoClassify) {
					const newCategories = classificationService.createCategories(
						starredRepos,
						tags,
						userConfig.keywordRules
					)
					setCategories(newCategories)
					storageService.saveCategories(newCategories)
				}

			
				messageApi.success(`成功获取 ${starredRepos.length} 个starred仓库`)
			} catch (err: any) {
				const errorMessage = err.message || '获取仓库失败'
				setError(errorMessage)
				messageApi.error(errorMessage)
			} finally {
				setLoading(false)
			}
		},
		[userConfig, githubApi, classificationService, storageService, tags, messageApi]
	)

	// 重新分类所有仓库
	const reclassifyRepos = useCallback(() => {
		if (repos.length === 0) {
			messageApi.warning('没有仓库数据需要分类')
			return
		}

		try {
			const newCategories = classificationService.createCategories(
				repos,
				tags,
				userConfig.keywordRules
			)
			setCategories(newCategories)
			storageService.saveCategories(newCategories)
			messageApi.success('重新分类完成')
		} catch (err) {
			console.log('重新分类失败:', err)
			messageApi.error('重新分类失败')
		}
	}, [
		repos,
		tags,
		userConfig.keywordRules,
		classificationService,
		storageService,
		messageApi
	])

	// 添加标签
	const addTag = useCallback(
		(tag: Omit<Tag, 'id'>) => {
			const newTag: Tag = {
				...tag,
				id: `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			}

			const updatedTags = [...tags, newTag]
			setTags(updatedTags)
			storageService.saveTags(updatedTags)

			messageApi.success('标签添加成功')
			return newTag
		},
		[tags, storageService, messageApi]
	)

	// 更新标签
	const updateTag = useCallback(
		(tagId: string, updates: Partial<Tag>) => {
			const updatedTags = tags.map((tag) =>
				tag.id === tagId ? { ...tag, ...updates } : tag
			)
			setTags(updatedTags)
			storageService.saveTags(updatedTags)

			// 如果自动分类开启，重新分类
			if (userConfig.autoClassify) {
				reclassifyRepos()
			}

			messageApi.success('标签更新成功')
		},
		[tags, storageService, userConfig.autoClassify, reclassifyRepos, messageApi]
	)

	// 删除标签
	const deleteTag = useCallback(
		(tagId: string) => {
			const updatedTags = tags.filter((tag) => tag.id !== tagId)
			setTags(updatedTags)
			storageService.saveTags(updatedTags)

			// 删除相关的关键词规则
			const updatedRules = userConfig.keywordRules.filter(
				(rule) => rule.tagId !== tagId
			)
			updateUserConfig({ keywordRules: updatedRules })

			// 重新分类
			if (userConfig.autoClassify) {
				reclassifyRepos()
			}

			messageApi.success('标签删除成功')
		},
		[
			tags,
			storageService,
			userConfig.keywordRules,
			updateUserConfig,
			userConfig.autoClassify,
			reclassifyRepos,
			messageApi,
		]
	)

	// 添加关键词规则
	const addKeywordRule = useCallback(
		(rule: Omit<KeywordRule, 'priority'>) => {
			const newRule: KeywordRule = {
				...rule,
				priority: 10, // 默认优先级
			}

			const updatedRules = [...userConfig.keywordRules, newRule]
			updateUserConfig({ keywordRules: updatedRules })

			// 如果自动分类开启，重新分类
			if (userConfig.autoClassify) {
				reclassifyRepos()
			}

			messageApi.success('关键词规则添加成功')
		},
		[
			userConfig.keywordRules,
			updateUserConfig,
			userConfig.autoClassify,
			reclassifyRepos,
			messageApi,
		]
	)

	// 更新关键词规则
	const updateKeywordRule = useCallback(
		(index: number, updates: Partial<KeywordRule>) => {
			const updatedRules = userConfig.keywordRules.map((rule, i) =>
				i === index ? { ...rule, ...updates } : rule
			)
			updateUserConfig({ keywordRules: updatedRules })

			// 如果自动分类开启，重新分类
			if (userConfig.autoClassify) {
				reclassifyRepos()
			}

			messageApi.success('关键词规则更新成功')
		},
		[
			userConfig.keywordRules,
			updateUserConfig,
			userConfig.autoClassify,
			reclassifyRepos,
			messageApi,
		]
	)

	// 删除关键词规则
	const deleteKeywordRule = useCallback(
		(index: number) => {
			const updatedRules = userConfig.keywordRules.filter((_, i) => i !== index)
			updateUserConfig({ keywordRules: updatedRules })

			// 如果自动分类开启，重新分类
			if (userConfig.autoClassify) {
				reclassifyRepos()
			}

			messageApi.success('关键词规则删除成功')
		},
		[
			userConfig.keywordRules,
			updateUserConfig,
			userConfig.autoClassify,
			reclassifyRepos,
			messageApi,
		]
	)

	// 清除所有数据
	const clearAllData = useCallback(() => {
		storageService.clearAllData()
		setRepos([])
		setCategories([])
		setTags(classificationService.getDefaultTags())
		setUserConfig({
			username: '',
			autoClassify: true,
			keywordRules: classificationService.getDefaultKeywordRules(),
		})
		messageApi.success('所有数据已清除')
	}, [storageService, classificationService, messageApi])

	// 导出数据
	const exportData = useCallback(() => {
		try {
			const data = storageService.exportData()
			const blob = new Blob([data], { type: 'application/json' })
			const url = URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = url
			a.download = `github-star-classifier-${
				new Date().toISOString().split('T')[0]
			}.json`
			document.body.appendChild(a)
			a.click()
			document.body.removeChild(a)
			URL.revokeObjectURL(url)
			messageApi.success('数据导出成功')
		} catch (err) {
			console.log('导出数据失败:', err)
			messageApi.error('导出数据失败')
		}
	}, [storageService, messageApi])

	// 导入数据
	const importData = useCallback(
		(file: File) => {
			const reader = new FileReader()
			reader.onload = (e) => {
				try {
					const jsonData = e.target?.result as string
					const success = storageService.importData(jsonData)
					if (success) {
						// 重新加载数据
						window.location.reload()
					} else {
						messageApi.error('导入数据失败：数据格式不正确')
					}
				} catch (err) {
					console.log('导入数据失败:', err)
					messageApi.error('导入数据失败')
				}
			}
			reader.readAsText(file)
		},
		[storageService, messageApi]
	)

	return {
		// 状态
		repos,
		categories,
		tags,
		loading,
		error,
		userConfig,

		// 操作方法
		updateUserConfig,
		fetchStarredRepos,
		reclassifyRepos,
		addTag,
		updateTag,
		deleteTag,
		addKeywordRule,
		updateKeywordRule,
		deleteKeywordRule,
		clearAllData,
		exportData,
		importData,

		// 服务实例
		githubApi,
		classificationService,
		storageService,
	}
}
