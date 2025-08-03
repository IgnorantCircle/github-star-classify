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

interface MaturityViewProps {
	repos: GitHubRepo[]
	loading?: boolean
	onRefresh?: () => void
}

type SortType = 'name' | 'stars' | 'updated' | 'created'
type SortOrder = 'asc' | 'desc'

const PAGE_SIZE = 8

const MaturityView: React.FC<MaturityViewProps> = ({
	repos,
	loading = false,
	onRefresh,
}) => {
	const [searchTerm, setSearchTerm] = useState('')
	const [sortType, setSortType] = useState<SortType>('created')
	const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
	const [activeTab, setActiveTab] = useState<string>('mature')
	const [levelPages, setLevelPages] = useState<Map<string, number>>(new Map())

	// 成熟度等级定义（基于项目年龄和星标数的综合评估）
	const maturityLevels = [
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

	// 获取等级页码
	const getLevelPage = (levelKey: string) => {
		return levelPages.get(levelKey) || 1
	}

	// 设置等级页码
	const setLevelPage = (levelKey: string, page: number) => {
		const newPages = new Map(levelPages)
		newPages.set(levelKey, page)
		setLevelPages(newPages)
	}

	// 获取分页数据
	const getPaginatedRepos = (repos: GitHubRepo[], levelKey: string) => {
		const currentPage = getLevelPage(levelKey)
		const startIndex = (currentPage - 1) * PAGE_SIZE
		const endIndex = startIndex + PAGE_SIZE
		return repos.slice(startIndex, endIndex)
	}

	// 按成熟度分类仓库
	const categorizeByMaturity = useMemo(() => {
		const now = new Date()
		const categories = new Map<string, GitHubRepo[]>()

		// 初始化所有等级
		maturityLevels.forEach((level) => {
			categories.set(level.key, [])
		})

		repos.forEach((repo) => {
			const createdAt = new Date(repo.created_at)
			const ageInDays = Math.floor(
				(now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
			)
			const ageInYears = ageInDays / 365
			const stars = repo.stargazers_count

			// 根据年龄和星标数进行分类
			if (ageInYears >= 5 && stars >= 10000) {
				categories.get('legendary')!.push(repo)
			} else if (ageInYears >= 3 && stars >= 5000) {
				categories.get('veteran')!.push(repo)
			} else if (ageInYears >= 2 && stars >= 1000) {
				categories.get('mature')!.push(repo)
			} else if (ageInYears >= 1 && stars >= 500) {
				categories.get('established')!.push(repo)
			} else if (ageInYears >= 0.5 && stars >= 100) {
				categories.get('growing')!.push(repo)
			} else if (ageInYears >= 0.25 && stars >= 10) {
				categories.get('emerging')!.push(repo)
			} else {
				categories.get('fresh')!.push(repo)
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
					aValue = new Date(a.pushed_at || b.updated_at).getTime()
					bValue = new Date(b.pushed_at || b.updated_at).getTime()
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

	// 处理Tab切换
	const handleTabChange = (key: string) => {
		setActiveTab(key)
		// 切换时重置到第一页
		setLevelPage(key, 1)
	}

	const totalRepos = repos.length
	const filteredTotal = Array.from(categorizeByMaturity.values()).reduce(
		(sum, levelRepos) => sum + filterAndSortRepos(levelRepos).length,
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
							<Option value='stars'>星标数</Option>
							<Option value='updated'>更新时间</Option>
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
						<Text type='secondary'>
							共 {searchTerm ? `${filteredTotal}/${totalRepos}` : totalRepos}{' '}
							个仓库
						</Text>
					</Col>
				</Row>
			</div>

			{/* 成熟度等级列表 */}
			<Tabs
				activeKey={activeTab}
				onChange={handleTabChange}
				items={maturityLevels.map((level) => {
					const levelRepos = categorizeByMaturity.get(level.key) || []
					const filteredRepos = filterAndSortRepos(levelRepos)
					const currentPage = getLevelPage(level.key)
					const paginatedRepos = getPaginatedRepos(filteredRepos, level.key)
					const totalPages = Math.ceil(filteredRepos.length / PAGE_SIZE)

					return {
						key: level.key,
						label: (
							<Space>
								<span style={{ fontSize: '16px' }}>{level.icon}</span>
								<span style={{ color: level.color, fontWeight: 'bold' }}>
									{level.name}
								</span>
								<Badge
									count={filteredRepos.length}
									style={{ backgroundColor: level.color }}
								/>
							</Space>
						),
						children: (
							<div>
								{filteredRepos.length === 0 ? (
									<Empty
										description='暂无符合条件的仓库'
										style={{ padding: '50px 0' }}
									/>
								) : (
									<ConfigProvider
										theme={{
											token: {
												bodyPadding: '16px 0 36px 0',
											},
										}}>
										<Card
											style={{
												marginBottom: 16,
												position: 'relative',
												minHeight: '400px',
												border: 'none',
											}}>
											<div style={{ marginBottom: 16, textAlign: 'center' }}>
												<div style={{ fontSize: '16px' }}>{level.desc}</div>
											</div>
											<Row gutter={[16, 16]}>
												{paginatedRepos.map((repo) => (
													<Col key={repo.id} xs={24} sm={12} lg={8} xl={6}>
														<RepoCard
															repo={repo}
															tags={[level.name]}
															viewType='created'
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
														onChange={(page) => setLevelPage(level.key, page)}
														showSizeChanger={false}
														showQuickJumper
														showTotal={(total, range) =>
															`${range[0]}-${range[1]} / ${total}`
														}
													/>
												</div>
											)}
										</Card>
									</ConfigProvider>
								)}
							</div>
						),
					}
				})}
			/>
		</div>
	)
}

export default MaturityView
