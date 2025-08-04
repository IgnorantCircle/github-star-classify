import { useMemo } from 'react'
import type { GitHubRepo, Category } from '../types'
import type { CategoryLevel } from '../components/common/CategorizedView'

// 活跃度分类Hook
export const useActivityCategorization = () => {
	const categories: CategoryLevel[] = [
		{
			key: 'veryActive',
			name: '非常活跃',
			days: 7,
			icon: '🔥',
			color: '#ff4d4f',
			desc: '一周内有更新',
		},
		{
			key: 'active',
			name: '活跃项目',
			days: 30,
			icon: '⚡',
			color: '#fa8c16',
			desc: '一个月内有更新',
		},
		{
			key: 'moderate',
			name: '中等活跃',
			days: 90,
			icon: '📈',
			color: '#faad14',
			desc: '三个月内有更新',
		},
		{
			key: 'slow',
			name: '缓慢更新',
			days: 180,
			icon: '🐌',
			color: '#52c41a',
			desc: '半年内有更新',
		},
		{
			key: 'occasional',
			name: '偶尔更新',
			days: 365,
			icon: '🌙',
			color: '#1890ff',
			desc: '一年内有更新',
		},
		{
			key: 'dormant',
			name: '休眠状态',
			days: 730,
			icon: '😴',
			color: '#722ed1',
			desc: '两年内有更新',
		},
		{
			key: 'inactive',
			name: '不活跃',
			days: Infinity,
			icon: '💤',
			color: '#8c8c8c',
			desc: '两年以上未更新',
		},
	]

	const categorizeRepos = useMemo(() => {
		return (repos: GitHubRepo[]) => {
			const now = new Date()
			const categorizedRepos = new Map<string, GitHubRepo[]>()

			// 初始化所有分类
			categories.forEach((category) => {
				categorizedRepos.set(category.key, [])
			})

			repos.forEach((repo) => {
				const lastActivity = new Date(repo.pushed_at || repo.updated_at)
				const daysSinceActivity = Math.floor(
					(now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
				)

				let categorized = false
				for (const category of categories) {
					if (category.key === 'inactive') {
						// 最后一个分类，收集所有剩余的
						if (!categorized) {
							categorizedRepos.get(category.key)!.push(repo)
						}
						break
					}

					if (category.days && daysSinceActivity <= category.days) {
						categorizedRepos.get(category.key)!.push(repo)
						categorized = true
						break
					}
				}
			})

			return categorizedRepos
		}
	}, [])

	return {
		categories,
		categorizeRepos,
		defaultSortType: 'updated' as const,
		defaultActiveTab: 'veryActive',
		sortOptions: [
			{ value: 'updated' as const, label: '最后活跃' },
			{ value: 'stars' as const, label: '星标数' },
			{ value: 'created' as const, label: '创建时间' },
			{ value: 'name' as const, label: '名称' },
		],
	}
}

// 受欢迎程度分类Hook
export const usePopularityCategorization = () => {
	const categories: CategoryLevel[] = [
		{
			key: 'superPopular',
			name: '超级热门',
			min: 10000,
			max: Infinity,
			icon: '🔥',
			color: '#ff4d4f',
		},
		{
			key: 'veryPopular',
			name: '非常热门',
			min: 5000,
			max: 9999,
			icon: '⭐',
			color: '#fa8c16',
		},
		{
			key: 'popular',
			name: '热门项目',
			min: 1000,
			max: 4999,
			icon: '🌟',
			color: '#faad14',
		},
		{
			key: 'rising',
			name: '新兴项目',
			min: 500,
			max: 999,
			icon: '📈',
			color: '#52c41a',
		},
		{
			key: 'promising',
			name: '有潜力',
			min: 100,
			max: 499,
			icon: '💎',
			color: '#1890ff',
		},
		{
			key: 'emerging',
			name: '初露头角',
			min: 50,
			max: 99,
			icon: '🌱',
			color: '#722ed1',
		},
		{
			key: 'starter',
			name: '起步阶段',
			min: 0,
			max: 49,
			icon: '🚀',
			color: '#eb2f96',
		},
	]

	const categorizeRepos = useMemo(() => {
		return (_repos: GitHubRepo[]) => {
			const categorizedRepos = new Map<string, GitHubRepo[]>()

			// 初始化所有分类
			categories.forEach((category) => {
				categorizedRepos.set(category.key, [])
			})

			_repos.forEach((repo) => {
				const stars = repo.stargazers_count

				for (const category of categories) {
				if (category.min !== undefined && category.max !== undefined && stars >= category.min && stars <= category.max) {
						categorizedRepos.get(category.key)!.push(repo)
						break
					}
				}
			})

			return categorizedRepos
		}
	}, [])

	const renderCategoryDescription = (category: CategoryLevel) => {
		const min = category.min === 0 ? '0' : category.min
		const max = category.max === Infinity ? '∞' : category.max
		return `${min}-${max} 星范围内的项目`
	}

	return {
		categories,
		categorizeRepos,
		defaultSortType: 'stars' as const,
		defaultActiveTab: 'superPopular',
		renderCategoryDescription,
	}
}

// 成熟度分类Hook
export const useMaturityCategorization = () => {
	const categories: CategoryLevel[] = [
		{
			key: 'legendary',
			name: '传奇项目',
			icon: '👑',
			color: '#722ed1',
			desc: '5年以上且超过1万星',
		},
		{
			key: 'veteran',
			name: '资深项目',
			icon: '🏆',
			color: '#1890ff',
			desc: '3年以上且超过5千星',
		},
		{
			key: 'mature',
			name: '成熟项目',
			icon: '🎖️',
			color: '#52c41a',
			desc: '2年以上且超过1千星',
		},
		{
			key: 'established',
			name: '稳定项目',
			icon: '🥉',
			color: '#faad14',
			desc: '1年以上且超过500星',
		},
		{
			key: 'growing',
			name: '成长项目',
			icon: '🌱',
			color: '#fa8c16',
			desc: '半年以上且超过100星',
		},
		{
			key: 'emerging',
			name: '新兴项目',
			icon: '🚀',
			color: '#ff4d4f',
			desc: '3个月以上且有一定关注',
		},
		{
			key: 'fresh',
			name: '新鲜项目',
			icon: '🌟',
			color: '#eb2f96',
			desc: '刚起步的项目',
		},
	]

	const categorizeRepos = useMemo(() => {
		return (_repos: GitHubRepo[]) => {
			const now = new Date()
			const categorizedRepos = new Map<string, GitHubRepo[]>()

			// 初始化所有分类
			categories.forEach((category) => {
				categorizedRepos.set(category.key, [])
			})

			_repos.forEach((repo) => {
				const createdAt = new Date(repo.created_at)
				const ageInDays = Math.floor(
					(now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
				)
				const ageInYears = ageInDays / 365
				const stars = repo.stargazers_count

				// 根据年龄和星标数进行分类
				if (ageInYears >= 5 && stars >= 10000) {
					categorizedRepos.get('legendary')!.push(repo)
				} else if (ageInYears >= 3 && stars >= 5000) {
					categorizedRepos.get('veteran')!.push(repo)
				} else if (ageInYears >= 2 && stars >= 1000) {
					categorizedRepos.get('mature')!.push(repo)
				} else if (ageInYears >= 1 && stars >= 500) {
					categorizedRepos.get('established')!.push(repo)
				} else if (ageInYears >= 0.5 && stars >= 100) {
					categorizedRepos.get('growing')!.push(repo)
				} else if (ageInYears >= 0.25 && stars >= 10) {
					categorizedRepos.get('emerging')!.push(repo)
				} else {
					categorizedRepos.get('fresh')!.push(repo)
				}
			})

			return categorizedRepos
		}
	}, [])

	const renderCategoryDescription = (category: CategoryLevel) => {
		return category.desc || ''
	}

	const getRepoCardProps = (_repo: GitHubRepo, category: CategoryLevel) => {
		return {
			tags: [category.name],
			viewType: 'default' as const,
		}
	}

	return {
		categories,
		categorizeRepos,
		defaultSortType: 'created' as const,
		defaultSortOrder: 'asc' as const,
		defaultActiveTab: 'mature',
		renderCategoryDescription,
		getRepoCardProps,
	}
}

// 通用分类Hook（用于CategoryView）
export const useCategoryCategorization = (categories: Category[]) => {
	const allRepos = useMemo(() => {
		return categories.flatMap(cat => cat.repos)
	}, [categories])

	const categoryLevels: CategoryLevel[] = useMemo(() => {
		return categories.map(cat => ({
			key: cat.id,
			name: cat.name,
			desc: cat.description,
			color: cat.color,
		}))
	}, [categories])

	const categorizeRepos = useMemo(() => {
		return (_repos: GitHubRepo[]) => {
			const categorizedRepos = new Map<string, GitHubRepo[]>()
			
			// 初始化分类
			categories.forEach(cat => {
				categorizedRepos.set(cat.id, cat.repos)
			})

			return categorizedRepos
		}
	}, [categories])

	const renderCategoryDescription = (category: CategoryLevel) => {
		return category.desc || ''
	}

	const getRepoCardProps = (_repo: GitHubRepo, category: CategoryLevel) => {
		const cat = categories.find(c => c.id === category.key)
		return {
			tags: cat?.tags.map(tag => tag.name) || [category.name],
			viewType: 'default' as const,
		}
	}

	return {
		categories: categoryLevels,
		categorizeRepos,
		defaultSortType: 'stars' as const,
		defaultActiveTab: categoryLevels[0]?.key || '',
		renderCategoryDescription,
		getRepoCardProps,
		allRepos,
	}
}

// 时间段分类Hook
export const useTimeCategorization = () => {
	const categories: CategoryLevel[] = [
		{ key: 'thisWeek', name: '本周', days: 7 },
		{ key: 'thisMonth', name: '本月', days: 30 },
		{ key: 'last3Months', name: '近3个月', days: 90 },
		{ key: 'last6Months', name: '近6个月', days: 180 },
		{ key: 'thisYear', name: '今年', days: 365 },
		{ key: 'lastYear', name: '去年', days: 730, offset: 365 },
		{ key: 'older', name: '更早', days: Infinity },
	]

	const categorizeRepos = useMemo(() => {
		return (repos: GitHubRepo[]) => {
			const now = new Date()
			const categorizedRepos = new Map<string, GitHubRepo[]>()

			// 初始化所有分类
			categories.forEach((category) => {
				categorizedRepos.set(category.key, [])
			})

			repos.forEach((repo) => {
				const starredAt = new Date(repo.starred_at)
				const daysDiff = Math.floor(
					(now.getTime() - starredAt.getTime()) / (1000 * 60 * 60 * 24)
				)

				let categorized = false
				for (const category of categories) {
					if (category.key === 'older') {
						if (!categorized) {
							categorizedRepos.get(category.key)!.push(repo)
						}
						break
					}

								const minDays = category.offset || 0
					const maxDays = (category.days || 0) + minDays

					if (daysDiff >= minDays && daysDiff < maxDays) {
						categorizedRepos.get(category.key)!.push(repo)
						categorized = true
						break
					}
				}
			})

			return categorizedRepos
		}
	}, [])

	const getRepoCardProps = (_repo: GitHubRepo, category: CategoryLevel) => {
		return {
			tags: [category.name],
			viewType: 'starred' as const,
		}
	}

	return {
		categories,
		categorizeRepos,
		defaultSortType: 'starred' as const,
		defaultActiveTab: 'thisWeek',
		sortOptions: [
			{ value: 'starred' as const, label: '收藏时间' },
			{ value: 'created' as const, label: '创建时间' },
			{ value: 'updated' as const, label: '更新时间' },
			{ value: 'stars' as const, label: '星标数' },
			{ value: 'name' as const, label: '名称' },
		],
		getRepoCardProps,
	}
}