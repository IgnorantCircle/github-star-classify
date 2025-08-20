import React, { useState, useMemo } from 'react'
import {
	Row,
	Col,
	Card,
	Typography,
	Input,
	Select,
	Space,
	Badge,
	Empty,
	Spin,
	Tabs,
	Button,
	Pagination,
	ConfigProvider,
} from 'antd'
import {
	SearchOutlined,
	SortAscendingOutlined,
	SortDescendingOutlined,
} from '@ant-design/icons'
import type { GitHubRepo } from '../../types'
import RepoCard from '../RepoCard'

const { Text } = Typography
const { Option } = Select

// 通用分类级别接口
export interface CategoryLevel {
	key: string
	name: string
	icon?: string
	days?: number
	color?: string
	desc?: string
	min?: number
	max?: number
	offset?: number
}

// 排序类型
export type SortType = 'name' | 'stars' | 'updated' | 'created' | 'starred'
export type SortOrder = 'asc' | 'desc'

// 排序选项配置
export interface SortOption {
	value: SortType
	label: string
}

// 组件属性接口
export interface CategorizedViewProps {
	repos: GitHubRepo[]
	loading?: boolean
	onRefresh?: () => void
	categories: CategoryLevel[]
	categorizeRepos: (repos: GitHubRepo[]) => Map<string, GitHubRepo[]>
	defaultSortType?: SortType
	defaultSortOrder?: SortOrder
	defaultActiveTab?: string
	sortOptions?: SortOption[]
	pageSize?: number
	renderCategoryDescription?: (category: CategoryLevel) => React.ReactNode
	getRepoCardProps?: (
		repo: GitHubRepo,
		category: CategoryLevel
	) => {
		tags?: string[]
		viewType?: 'starred' | 'created' | 'default'
	}
}

const DEFAULT_PAGE_SIZE = 8

// 默认排序选项
const DEFAULT_SORT_OPTIONS: SortOption[] = [
	{ value: 'stars', label: '星标数' },
	{ value: 'created', label: '创建时间' },
	{ value: 'updated', label: '更新时间' },
	{ value: 'name', label: '名称' },
]

const CategorizedView: React.FC<CategorizedViewProps> = ({
	repos,
	loading = false,
	onRefresh,
	categories,
	categorizeRepos,
	defaultSortType = 'stars',
	defaultSortOrder = 'desc',
	defaultActiveTab,
	sortOptions = DEFAULT_SORT_OPTIONS,
	pageSize = DEFAULT_PAGE_SIZE,
	renderCategoryDescription,
	getRepoCardProps,
}) => {
	const [searchTerm, setSearchTerm] = useState('')
	const [sortType, setSortType] = useState<SortType>(defaultSortType)
	const [sortOrder, setSortOrder] = useState<SortOrder>(defaultSortOrder)
	const [activeTab, setActiveTab] = useState<string>(
		defaultActiveTab || categories[0]?.key || ''
	)
	const [categoryPages, setCategoryPages] = useState<Map<string, number>>(
		new Map()
	)

	// 渲染分类内容（不包含分页）
	const renderCategoryContent = (category: CategoryLevel) => {
		const categoryRepos = categorizedRepos.get(category.key) || []
		const filteredRepos = filterAndSortRepos(categoryRepos)
		const paginatedRepos = getPaginatedRepos(filteredRepos, category.key)

		return filteredRepos.length === 0 ? (
			<Empty
				description={`暂无${category.name}的仓库`}
				style={{ padding: '50px 0' }}
			/>
		) : (
			<ConfigProvider
				theme={{
					components: {
						Card: {
							paddingLG: 0,
						},
					},
				}}>
				<Card
					style={{
						marginBottom: 16,
						overflowY: 'auto',
						overflowX: 'clip',
						border: 'none',
					}}>
					{/* 分类描述 */}
					{renderCategoryDescription && (
						<div
							style={{
								marginBottom: 16,
								textAlign: 'center',
								fontSize: '16px',
							}}>
							{renderCategoryDescription(category)}
						</div>
					)}

					<Row gutter={[16, 16]}>
						{paginatedRepos.map((repo) => {
							const cardProps = getRepoCardProps
								? getRepoCardProps(repo, category)
								: { tags: [category.name] }

							return (
								<Col key={repo.id} xs={24} sm={12} lg={8} xl={6}>
									<RepoCard
										repo={repo}
										tags={cardProps?.tags}
										viewType={
											cardProps?.viewType as
												| 'starred'
												| 'created'
												| 'default'
												| undefined
										}
									/>
								</Col>
							)
						})}
					</Row>
				</Card>
			</ConfigProvider>
		)
	}

	// 渲染分页组件
	const renderPagination = () => {
		const currentCategory = categories.length === 1 
			? categories[0] 
			: categories.find(cat => cat.key === activeTab) || categories[0]
		
		const categoryRepos = categorizedRepos.get(currentCategory.key) || []
		const filteredRepos = filterAndSortRepos(categoryRepos)
		const currentPage = getCategoryPage(currentCategory.key)
		const totalPages = Math.ceil(filteredRepos.length / pageSize)

		if (totalPages <= 1 || filteredRepos.length === 0) {
			return null
		}

		return (
			<div
				style={{
					display: 'flex',
					justifyContent: 'flex-end',
					marginTop: 24,
					paddingBottom: 24,
				}}>
				<Pagination
					current={currentPage}
					total={filteredRepos.length}
					pageSize={pageSize}
					onChange={(page) => setCategoryPage(currentCategory.key, page)}
					showSizeChanger={false}
					showQuickJumper
					showTotal={(total, range) => `${range[0]}-${range[1]} / ${total}`}
					size='small'
				/>
			</div>
		)
	}

	// 获取分类页码
	const getCategoryPage = (categoryKey: string) => {
		return categoryPages.get(categoryKey) || 1
	}

	// 设置分类页码
	const setCategoryPage = (categoryKey: string, page: number) => {
		const newPages = new Map(categoryPages)
		newPages.set(categoryKey, page)
		setCategoryPages(newPages)
	}

	// 获取分页数据
	const getPaginatedRepos = (repos: GitHubRepo[], categoryKey: string) => {
		const currentPage = getCategoryPage(categoryKey)
		const startIndex = (currentPage - 1) * pageSize
		const endIndex = startIndex + pageSize
		return repos.slice(startIndex, endIndex)
	}

	// 按分类分组仓库
	const categorizedRepos = useMemo(() => {
		return categorizeRepos(repos)
	}, [repos, categorizeRepos])

	// 过滤和排序仓库
	const filterAndSortRepos = (repos: GitHubRepo[]) => {
		let filtered = repos

		// 搜索过滤
		if (searchTerm) {
			const term = searchTerm.toLowerCase()
			filtered = filtered.filter(
				(repo) =>
					repo.name.toLowerCase().includes(term) ||
					repo.description?.toLowerCase().includes(term) ||
					repo.topics.some((topic) => topic.toLowerCase().includes(term)) ||
					repo.language?.toLowerCase().includes(term)
			)
		}

		// 排序
		filtered.sort((a, b) => {
			let aValue: string | number, bValue: string | number

			switch (sortType) {
				case 'name':
					aValue = a.name.toLowerCase()
					bValue = b.name.toLowerCase()
					break
				case 'stars':
					aValue = a.stargazers_count
					bValue = b.stargazers_count
					break
				case 'updated':
					aValue = new Date(a.pushed_at || a.updated_at).getTime()
					bValue = new Date(b.pushed_at || b.updated_at).getTime()
					break
				case 'created':
					aValue = new Date(a.created_at).getTime()
					bValue = new Date(b.created_at).getTime()
					break
				case 'starred':
					aValue = new Date(a.starred_at).getTime()
					bValue = new Date(b.starred_at).getTime()
					break
				default:
					return 0
			}

			if (sortOrder === 'asc') {
				return aValue > bValue ? 1 : -1
			} else {
				return aValue < bValue ? 1 : -1
			}
		})

		return filtered
	}

	// 处理Tab切换
	const handleTabChange = (key: string) => {
		setActiveTab(key)
		// 切换tab时重置到第一页
		setCategoryPage(key, 1)
	}

	const totalRepos = repos.length
	const filteredTotal = Array.from(categorizedRepos.values()).reduce(
		(sum, categoryRepos) => sum + filterAndSortRepos(categoryRepos).length,
		0
	)

	if (loading) {
		return (
			<div style={{ textAlign: 'center', padding: '50px 0' }}>
				<Spin size='large' />
				<div style={{ marginTop: 16 }}>
					<Text>正在加载数据...</Text>
				</div>
			</div>
		)
	}

	if (repos.length === 0) {
		return (
			<Empty description='暂无仓库数据' style={{ padding: '50px 0' }}>
				{onRefresh && (
					<Button type='primary' onClick={onRefresh}>
						同步数据
					</Button>
				)}
			</Empty>
		)
	}

	return (
			<div style={{ padding: '0 24px 24px' }}>
				{/* 控制面板 */}
				<div style={{ margin: '24px 0' }}>
					<Row gutter={[16, 16]} align='middle'>
						<Col xs={24} sm={12} md={8}>
							<Input
								placeholder='搜索仓库名称、描述、主题或语言'
								prefix={<SearchOutlined />}
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								allowClear
							/>
						</Col>
						<Col xs={12} sm={6} md={4}>
							<Select
								value={sortType}
								onChange={setSortType}
								style={{ width: '100%' }}>
								{sortOptions.map((option) => (
									<Option key={option.value} value={option.value}>
										{option.label}
									</Option>
								))}
							</Select>
						</Col>
						<Col xs={12} sm={6} md={4}>
							<Select
								value={sortOrder}
								onChange={setSortOrder}
								style={{ width: '100%' }}>
								<Option value='desc'>
									<SortDescendingOutlined /> 降序
								</Option>
								<Option value='asc'>
									<SortAscendingOutlined /> 升序
								</Option>
							</Select>
						</Col>
						<Col xs={24} sm={24} md={8}>
							<div style={{ textAlign: 'right' }}>
								<Text type='secondary'>
									共 {searchTerm ? `${filteredTotal}/${totalRepos}` : totalRepos}{' '}
									个仓库
								</Text>
							</div>
						</Col>
					</Row>
				</div>

				{/* 分类内容 */}
				{categories.length === 1 ? (
					// 只有一个分类时，直接显示内容，不显示标签页
					renderCategoryContent(categories[0])
				) : (
					// 多个分类时，显示标签页
					<Tabs
						activeKey={activeTab}
						onChange={handleTabChange}
						type='card'
						size='large'
						items={categories.map((category) => {
							const categoryRepos = categorizedRepos.get(category.key) || []
							const filteredRepos = filterAndSortRepos(categoryRepos)

							return {
								key: category.key,
								label: (
									<Space>
										{category.icon && (
											<span style={{ fontSize: '16px' }}>{category.icon}</span>
										)}
										<span
											style={{
												color: category.color,
												fontWeight: 'bold',
											}}>
											{category.name}
										</span>
										<Badge
											count={filteredRepos.length}
											style={{ backgroundColor: category.color || '#52c41a' }}
										/>
									</Space>
								),
								children: renderCategoryContent(category),
							}
						})}
					/>
				)}

				{/* 固定分页组件 */}
				{renderPagination()}
			</div>
		)
}

export default CategorizedView
