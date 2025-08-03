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
	Button,
	Tooltip,
	Pagination,
} from 'antd'
import {
	SearchOutlined,
	SortAscendingOutlined,
	ReloadOutlined,
} from '@ant-design/icons'
import type { Category, GitHubRepo } from '../types'
import RepoCard from './RepoCard'

const { Title, Text } = Typography
const { Search } = Input
const { Option } = Select

interface CategoryViewProps {
	categories: Category[]
	loading?: boolean
	onRefresh?: () => void
	singleCategory?: boolean
}

type SortType = 'name' | 'stars' | 'updated' | 'created'
type SortOrder = 'asc' | 'desc'

const CategoryView: React.FC<CategoryViewProps> = ({
	categories,
	loading = false,
	onRefresh,
}) => {
	const [searchQuery, setSearchQuery] = useState('')
	const [selectedLanguage, setSelectedLanguage] = useState<string>('all')
	const [sortType, setSortType] = useState<SortType>('stars')
	const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
	const [categoryPages, setCategoryPages] = useState<Map<string, number>>(
		new Map()
	)

	// 每页显示的仓库数量
	const PAGE_SIZE = 8

	// 获取所有语言列表
	const languages = useMemo(() => {
		const langSet = new Set<string>()
		categories.forEach((category) => {
			category.repos.forEach((repo) => {
				if (repo.language) {
					langSet.add(repo.language)
				}
			})
		})
		return Array.from(langSet).sort()
	}, [categories])

	// 获取分类当前页码
	const getCategoryPage = (categoryId: string) => {
		return categoryPages.get(categoryId) || 1
	}

	// 设置分类页码
	const setCategoryPage = (categoryId: string, page: number) => {
		const newPages = new Map(categoryPages)
		newPages.set(categoryId, page)
		setCategoryPages(newPages)
	}

	// 获取分页数据
	const getPaginatedRepos = (repos: GitHubRepo[], categoryId: string) => {
		const currentPage = getCategoryPage(categoryId)
		const startIndex = (currentPage - 1) * PAGE_SIZE
		const endIndex = startIndex + PAGE_SIZE
		return repos.slice(startIndex, endIndex)
	}

	// 过滤和排序仓库
	const filterAndSortRepos = (repos: GitHubRepo[]) => {
		let filtered = repos

		// 搜索过滤
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase()
			filtered = filtered.filter(
				(repo) =>
					repo.name.toLowerCase().includes(query) ||
					repo.description?.toLowerCase().includes(query) ||
					repo.full_name.toLowerCase().includes(query) ||
					repo.topics.some((topic) => topic.toLowerCase().includes(query))
			)
		}

		// 语言过滤
		if (selectedLanguage !== 'all') {
			filtered = filtered.filter((repo) => repo.language === selectedLanguage)
		}

		// 排序
		filtered.sort((a, b) => {
			let comparison = 0

			switch (sortType) {
				case 'name':
					comparison = a.name.localeCompare(b.name)
					break
				case 'stars':
					comparison = a.stargazers_count - b.stargazers_count
					break

				case 'updated':
					comparison =
						new Date(a.pushed_at || a.updated_at).getTime() -
						new Date(b.pushed_at || b.updated_at).getTime()
					break
				case 'created':
					comparison =
						new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
					break
			}

			return sortOrder === 'asc' ? comparison : -comparison
		})

		return filtered
	}

	const totalRepos = categories.reduce((sum, cat) => sum + cat.repos.length, 0)
	const filteredTotal = categories.reduce((sum, cat) => {
		const filtered = filterAndSortRepos(cat.repos)
		return sum + filtered.length
	}, 0)

	if (loading) {
		return (
			<div style={{ textAlign: 'center', padding: '50px 0' }}>
				<Spin size='large' />
				<div style={{ marginTop: 16 }}>
					<Text>正在加载仓库数据...</Text>
				</div>
			</div>
		)
	}

	if (categories.length === 0) {
		return (
			<Empty description='暂无分类数据' style={{ padding: '50px 0' }}>
				<Button type='primary' onClick={onRefresh}>
					获取仓库数据
				</Button>
			</Empty>
		)
	}

	return (
		<div>
			{/* 工具栏 */}
			<Card style={{ marginBottom: 16 }}>
				<Row gutter={[16, 16]} align='middle'>
					<Col xs={24} sm={12} md={8}>
						<Search
							placeholder='搜索仓库名称、描述或主题'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							prefix={<SearchOutlined />}
							allowClear
						/>
					</Col>
					<Col xs={12} sm={6} md={4}>
						<Select
							value={selectedLanguage}
							onChange={setSelectedLanguage}
							style={{ width: '100%' }}
							placeholder='选择语言'>
							<Option value='all'>所有语言</Option>
							{languages.map((lang) => (
								<Option key={lang} value={lang}>
									{lang}
								</Option>
							))}
						</Select>
					</Col>
					<Col xs={12} sm={6} md={4}>
						<Select
							value={`${sortType}-${sortOrder}`}
							onChange={(value) => {
								const [type, order] = value.split('-') as [SortType, SortOrder]
								setSortType(type)
								setSortOrder(order)
							}}
							style={{ width: '100%' }}>
							<Option value='stars-desc'>⭐ 星数降序</Option>
							<Option value='stars-asc'>⭐ 星数升序</Option>
							<Option value='updated-desc'>📅 更新时间降序</Option>
							<Option value='updated-asc'>📅 更新时间升序</Option>
							<Option value='name-asc'>🔤 名称升序</Option>
							<Option value='name-desc'>🔤 名称降序</Option>
						</Select>
					</Col>
					<Col xs={24} sm={12} md={8}>
						<Space>
							{onRefresh && (
								<Tooltip title='刷新数据'>
									<Button
										size='small'
										icon={<ReloadOutlined />}
										onClick={onRefresh}
									/>
								</Tooltip>
							)}
							<Text type='secondary' style={{ fontSize: 12 }}>
								{searchQuery || selectedLanguage !== 'all'
									? `${filteredTotal}/${totalRepos}`
									: totalRepos}{' '}
								个仓库
							</Text>
						</Space>
					</Col>
				</Row>
			</Card>

			{/* 分类列表 */}
			<div>
				{categories.map((category) => {
					const filteredRepos = filterAndSortRepos(category.repos)
					const currentPage = getCategoryPage(category.id)
					const paginatedRepos = getPaginatedRepos(filteredRepos, category.id)
					const totalPages = Math.ceil(filteredRepos.length / PAGE_SIZE)

					if (
						filteredRepos.length === 0 &&
						(searchQuery || selectedLanguage !== 'all')
					) {
						return null
					}

					return (
						<Card
							key={category.id}
							style={{
								marginBottom: 16,
								position: 'relative',
								minHeight: '400px',
							}}
							title={
								<div
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'center',
										cursor: 'pointer',
									}}>
									<Space>
										<Badge
											count={filteredRepos.length}
											style={{
												backgroundColor: category.tags[0]?.color || '#1890ff',
											}}
										/>
										<Title level={4} style={{ margin: 0 }}>
											{category.name}
										</Title>
										{category.description && (
											<Text type='secondary' style={{ fontSize: 12 }}>
												{category.description}
											</Text>
										)}
									</Space>
									<Space>
										<SortAscendingOutlined style={{ color: '#1890ff' }} />
									</Space>
								</div>
							}
							extra={
								<Text type='secondary'>{filteredRepos.length} 个项目</Text>
							}>
							<>
								<Row gutter={[16, 16]}>
									{paginatedRepos.map((repo) => (
										<Col key={repo.id} xs={24} sm={12} lg={8} xl={6}>
											<RepoCard
												repo={repo}
												tags={category.tags.map((tag) => tag.name)}
											/>
										</Col>
									))}
								</Row>
								{totalPages > 1 && (
									<div
										style={{
											position: 'absolute',
											bottom: 0,
											right: 0,
										}}>
										<Pagination
											current={currentPage}
											total={filteredRepos.length}
											pageSize={PAGE_SIZE}
											onChange={(page) => setCategoryPage(category.id, page)}
											showSizeChanger={false}
											showQuickJumper={totalPages > 10}
											showTotal={(total, range) =>
												`第 ${range[0]}-${range[1]} 项，共 ${total} 个仓库`
											}
											align='center'
										/>
									</div>
								)}
							</>
						</Card>
					)
				})}
			</div>

			{categories.every((cat) => filterAndSortRepos(cat.repos).length === 0) &&
				(searchQuery || selectedLanguage !== 'all') && (
					<Empty description='没有找到匹配的仓库' style={{ padding: '50px 0' }}>
						<Button
							onClick={() => {
								setSearchQuery('')
								setSelectedLanguage('all')
							}}>
							清除筛选条件
						</Button>
					</Empty>
				)}
		</div>
	)
}

export default CategoryView
