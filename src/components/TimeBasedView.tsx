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
import type { GitHubRepo } from '../types'
import RepoCard from './RepoCard'

const { Text } = Typography
const { Option } = Select

interface TimeBasedViewProps {
	repos: GitHubRepo[]
	loading?: boolean
	onRefresh?: () => void
}

type SortType = 'name' | 'stars' | 'updated' | 'created'
type SortOrder = 'asc' | 'desc'

const PAGE_SIZE = 8

const TimeBasedView: React.FC<TimeBasedViewProps> = ({
	repos,
	loading = false,
	onRefresh,
}) => {
	const [searchTerm, setSearchTerm] = useState('')
	const [sortType, setSortType] = useState<SortType>('created')
	const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
	const [activeTab, setActiveTab] = useState<string>('thisWeek')
	const [periodPages, setPeriodPages] = useState<Map<string, number>>(new Map())

	// 时间段定义
	const timePeriods = [
		{ key: 'thisWeek', name: '本周', days: 7 },
		{ key: 'thisMonth', name: '本月', days: 30 },
		{ key: 'last3Months', name: '近3个月', days: 90 },
		{ key: 'last6Months', name: '近6个月', days: 180 },
		{ key: 'thisYear', name: '今年', days: 365 },
		{ key: 'lastYear', name: '去年', days: 730, offset: 365 },
		{ key: 'older', name: '更早', days: Infinity },
	]

	// 获取时间段页码
	const getPeriodPage = (periodKey: string) => {
		return periodPages.get(periodKey) || 1
	}

	// 设置时间段页码
	const setPeriodPage = (periodKey: string, page: number) => {
		const newPages = new Map(periodPages)
		newPages.set(periodKey, page)
		setPeriodPages(newPages)
	}

	// 获取分页数据
	const getPaginatedRepos = (repos: GitHubRepo[], periodKey: string) => {
		const currentPage = getPeriodPage(periodKey)
		const startIndex = (currentPage - 1) * PAGE_SIZE
		const endIndex = startIndex + PAGE_SIZE
		return repos.slice(startIndex, endIndex)
	}

	// 按时间段分类仓库
	const categorizeByTime = useMemo(() => {
		const now = new Date()
		const categories = new Map<string, GitHubRepo[]>()

		// 初始化所有时间段
		timePeriods.forEach((period) => {
			categories.set(period.key, [])
		})

		repos.forEach((repo) => {
			const createdAt = new Date(repo.created_at)
			const daysDiff = Math.floor(
				(now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
			)

			let categorized = false
			for (const period of timePeriods) {
				if (period.key === 'older') {
					if (!categorized) {
						categories.get(period.key)!.push(repo)
					}
					break
				}

				const minDays = period.offset || 0
				const maxDays = period.days + minDays

				if (daysDiff >= minDays && daysDiff < maxDays) {
					categories.get(period.key)!.push(repo)
					categorized = true
					break
				}
			}
		})

		return categories
	}, [repos])

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
			let aValue: any, bValue: any

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
					aValue = new Date(a.updated_at).getTime()
					bValue = new Date(b.updated_at).getTime()
					break
				case 'created':
					aValue = new Date(a.created_at).getTime()
					bValue = new Date(b.created_at).getTime()
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

	// 处理tab切换
	const handleTabChange = (key: string) => {
		setActiveTab(key)
		// 切换tab时重置到第一页
		setPeriodPage(key, 1)
	}

	const totalRepos = repos.length
	const filteredTotal = Array.from(categorizeByTime.values()).reduce(
		(sum, periodRepos) => sum + filterAndSortRepos(periodRepos).length,
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
							<Option value='created'>创建时间</Option>
							<Option value='updated'>更新时间</Option>
							<Option value='stars'>星标数</Option>
							<Option value='name'>名称</Option>
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

			{/* 时间段Tabs */}
			<Tabs
				activeKey={activeTab}
				onChange={handleTabChange}
				type='card'
				size='large'
				items={timePeriods.map((period) => {
					const periodRepos = categorizeByTime.get(period.key) || []
					const filteredRepos = filterAndSortRepos(periodRepos)
					const currentPage = getPeriodPage(period.key)
					const paginatedRepos = getPaginatedRepos(filteredRepos, period.key)
					const totalPages = Math.ceil(filteredRepos.length / PAGE_SIZE)

					return {
						key: period.key,
						label: (
							<Space>
								<span>{period.name}</span>
								<Badge
									count={filteredRepos.length}
									style={{ backgroundColor: '#52c41a' }}
								/>
							</Space>
						),
						children:
							filteredRepos.length === 0 ? (
								<Empty
									description={`暂无${period.name}的仓库`}
									style={{ padding: '50px 0' }}
								/>
							) : (
								<ConfigProvider
									theme={{
										token: {
											bodyPadding:"16px 0 36px 0"
										},
									}}>
									<Card
										style={{
											marginBottom: 16,
											position: 'relative',
											minHeight: '400px',
											border: 'none',
										}}>
										<Row gutter={[16, 16]}>
											{paginatedRepos.map((repo) => (
												<Col key={repo.id} xs={24} sm={12} lg={8} xl={6}>
													<RepoCard repo={repo} tags={[period.name]} />
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
													onChange={(page) => setPeriodPage(period.key, page)}
													showSizeChanger={false}
													showQuickJumper
													showTotal={(total, range) =>
														`${range[0]}-${range[1]} / ${total}`
													}
													align='center'
												/>
											</div>
										)}
									</Card>
								</ConfigProvider>
							),
					}
				})}
			/>
		</div>
	)
}

export default TimeBasedView
