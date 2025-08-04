import { useEffect, useState } from 'react'
import {
	BrowserRouter as Router,
	Routes,
	Route,
	useNavigate,
	useLocation,
} from 'react-router-dom'
import {
	Layout,
	Menu,
	Typography,
	Button,
	Space,
	Badge,
	Tooltip,
	message,
	ConfigProvider,
	Pagination,
} from 'antd'
import {
	DashboardOutlined,
	AppstoreOutlined,
	SettingOutlined,
	GithubOutlined,
	ReloadOutlined,
	InfoCircleOutlined,
	FolderOutlined,
	ClockCircleOutlined,
	StarOutlined,
	TrophyOutlined,
	ThunderboltOutlined,
} from '@ant-design/icons'
import { useAppState } from './hooks/useAppState'
import Dashboard from './components/Dashboard'
import CategoryView from './components/CategoryView'
import TimeBasedView from './components/TimeBasedView'
import SettingsPage from './components/SettingsPage'
import './App.css'
import PopularityView from './components/PopularityView'
import MaturityView from './components/MaturityView'
import ActivityView from './components/ActivityView'
import zhCN from 'antd/locale/zh_CN' // 引入中文语言包
const { Header, Content, Sider } = Layout
const { Title, Text } = Typography

function AppContent() {
	const navigate = useNavigate()
	const location = useLocation()
	const [messageApi, contextHolder] = message.useMessage()
	const {
		repos,
		categories,
		tags,
		loading,
		error,
		userConfig,
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
		storageService,
	} = useAppState()

	const [collapsed, setCollapsed] = useState(false)
	const storageUsage = storageService.getStorageUsage()
	const lastSyncTime = storageService.getLastSyncTime()

	const categoryMenuItems = categories.map((category) => ({
		key: `category/${category.id}`,
		icon: <AppstoreOutlined />,
		label: (
			<Space>
				<span
					style={{
						display: 'inline-block',
						width: 8,
						height: 8,
						borderRadius: '50%',
						backgroundColor: category.color || '#1890ff',
					}}
				/>
				{category.name}
				<Badge
					count={category.repos.length}
					size='small'
					style={{ backgroundColor: '#52c41a' }}
				/>
			</Space>
		),
	}))

	const menuItems = [
		{
			key: 'dashboard',
			icon: <DashboardOutlined />,
			label: (
				<Space>
					数据大盘
					{repos.length > 0 && (
						<Badge
							count={repos.length}
							size='small'
							style={{ backgroundColor: '#1890ff' }}
						/>
					)}
				</Space>
			),
		},
		{
			key: 'categories-group',
			icon: <FolderOutlined />,
			label: (
				<Space>
					自定义分类
					{categories.length > 0 && (
						<Badge
							count={categories.length}
							size='small'
							style={{ backgroundColor: '#1890ff' }}
						/>
					)}
				</Space>
			),
			children: categoryMenuItems,
		},
		{
			key: 'time-based',
			icon: <ClockCircleOutlined />,
			label: '按收藏时间',
		},
		{
			key: 'popularity',
			icon: <StarOutlined />,
			label: '按受欢迎程度',
		},
		{
			key: 'maturity',
			icon: <TrophyOutlined />,
			label: '按项目成熟度',
		},
		{
			key: 'activity',
			icon: <ThunderboltOutlined />,
			label: '按项目活跃度',
		},
		{
			key: 'settings',
			icon: <SettingOutlined />,
			label: '设置',
		},
	]

	const handleRefresh = async () => {
		await fetchStarredRepos()
	}

	const handleCategoryClick = (categoryId: string) => {
		navigate(`/category/${categoryId}`)
	}

	const handleMenuClick = ({ key }: { key: string }) => {
		navigate(`/${key === 'dashboard' ? '' : key}`)
	}

	const getActiveTab = () => {
		const path = location.pathname
		if (path === '/') return 'dashboard'
		if (path.startsWith('/category/')) return path.split('/')[2]
		return path.substring(1)
	}
	const activeTab = getActiveTab()
	const getPageTitle = () => {
		const titleMap = [
			{
				key: 'dashboard',
				value: '数据大盘',
			},
			{ key: 'time-based', value: '按收藏时间分类' },
			{ key: 'popularity', value: '按受欢迎程度分类' },
			{ key: 'activity', value: '按项目活跃度分类' },
			{ key: 'maturity', value: '按项目成熟度分类' },
			{ key: 'settings', value: '设置' },
		]

		titleMap.find((item) => {
			if (item.key === activeTab) return item.value
		})
		const selectedCategory = categories.find((cat) => cat.id === activeTab)
		return selectedCategory?.name || '分类详情'
	}

	useEffect(() => {
		const config = storageService.getUserConfig()
		if (!config.username) {
			messageApi.warning('请前往设置中输入GitHub用户名')
		}
	}, [])

	return (
		<ConfigProvider locale={zhCN}>
			{contextHolder}
			<Layout>
				<Sider
					collapsible
					collapsed={collapsed}
					onCollapse={setCollapsed}
					theme='light'
					width={250}
					style={{
						overflow: 'auto',
						height: '100vh',
						position: 'sticky',
						insetInlineStart: 0,
						top: 0,
						bottom: 0,
						scrollbarWidth: 'thin',
						scrollbarGutter: 'stable',
					}}>
					<div
						style={{
							padding: '16px',
							textAlign: 'center',
							borderBottom: '1px solid #f0f0f0',
						}}>
						<GithubOutlined style={{ fontSize: 24, color: '#1890ff' }} />
						{!collapsed && (
							<div style={{ marginTop: 8 }}>
								<Title level={4} style={{ margin: 0, color: '#1890ff' }}>
									GitHub Star
								</Title>
								<Text type='secondary' style={{ fontSize: 12 }}>
									分类管理器
								</Text>
							</div>
						)}
					</div>

					<Menu
						mode='vertical'
						selectedKeys={[activeTab]}
						items={menuItems}
						onClick={handleMenuClick}
						style={{ border: 'none' }}
					/>

					{!collapsed && (
						<div
							style={{
								position: 'absolute',
								bottom: 48,
								left: 16,
								right: 16,
							}}>
							<div
								style={{
									padding: 12,
									background: '#f6f6f6',
									borderRadius: 6,
									fontSize: 12,
								}}>
								<div style={{ marginBottom: 8 }}>
									<Text strong>统计信息</Text>
								</div>
								<div style={{ marginBottom: 4 }}>
									<Text type='secondary'>仓库数量：{repos.length}</Text>
								</div>
								<div style={{ marginBottom: 4 }}>
									<Text type='secondary'>分类数量：{categories.length}</Text>
								</div>
								{lastSyncTime && (
									<div>
										<Text type='secondary'>
											最后同步：{lastSyncTime.toLocaleDateString()}
										</Text>
									</div>
								)}
							</div>
						</div>
					)}
				</Sider>

				<Layout style={{ maxHeight: '100vh' }}>
					<Header
						style={{
							background: '#fff',
							padding: '0 24px',
							borderBottom: '1px solid #f0f0f0',
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
						}}>
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
							}}>
							<Title level={3} style={{ margin: 0, marginRight: '12px' }}>
								{getPageTitle()}
							</Title>
							{userConfig.username && (
								<Text type='secondary'>@{userConfig.username}</Text>
							)}
						</div>

						<Space>
							{(activeTab === 'dashboard' ||
								activeTab === 'time-based' ||
								categories.some((cat) => cat.id === activeTab)) && (
								<>
									<Tooltip title='重新分类'>
										<Button
											icon={<AppstoreOutlined />}
											onClick={reclassifyRepos}
											disabled={repos.length === 0}>
											重新分类
										</Button>
									</Tooltip>
									<Tooltip title='刷新数据'>
										<Button
											type='primary'
											icon={<ReloadOutlined />}
											onClick={handleRefresh}
											loading={loading}
											disabled={!userConfig.username}>
											{loading ? '同步中...' : '同步数据'}
										</Button>
									</Tooltip>
								</>
							)}

							<Tooltip title='项目信息'>
								<Button
									icon={<InfoCircleOutlined />}
									href='https://github.com'
									target='_blank'
								/>
							</Tooltip>
						</Space>
					</Header>

					<Content
						style={{
							margin: '24px',
							background: '#fff',
							borderRadius: 6,
							overflow: 'auto',
						}}>
						{error && (
							<div
								style={{
									padding: 16,
									background: '#fff2f0',
									border: '1px solid #ffccc7',
									borderRadius: 6,
									marginBottom: 16,
									color: '#a8071a',
								}}>
								错误：{error}
							</div>
						)}

						<Routes>
							<Route
								path='/'
								element={
									<Dashboard
										repos={repos}
										categories={categories}
										onCategoryClick={handleCategoryClick}
									/>
								}
							/>
							<Route
								path='/category/:categoryId'
								element={
									<CategoryView
										categories={categories.filter(
											(cat) => cat.id === activeTab
										)}
										loading={loading}
										onRefresh={handleRefresh}
										singleCategory={true}
									/>
								}
							/>
							<Route
								path='/time-based'
								element={
									<TimeBasedView
										repos={repos}
										loading={loading}
										onRefresh={handleRefresh}
									/>
								}
							/>
							<Route
								path='/popularity'
								element={
									<PopularityView
										repos={repos}
										loading={loading}
										onRefresh={handleRefresh}
									/>
								}
							/>
							<Route
								path='/maturity'
								element={
									<MaturityView
										repos={repos}
										loading={loading}
										onRefresh={handleRefresh}
									/>
								}
							/>
							<Route
								path='/activity'
								element={
									<ActivityView
										repos={repos}
										loading={loading}
										onRefresh={handleRefresh}
									/>
								}
							/>
							<Route
								path='/settings'
								element={
									<SettingsPage
										userConfig={userConfig}
										tags={tags}
										onUpdateConfig={updateUserConfig}
										onAddTag={addTag}
										onUpdateTag={updateTag}
										onDeleteTag={deleteTag}
										onAddKeywordRule={addKeywordRule}
										onUpdateKeywordRule={updateKeywordRule}
										onDeleteKeywordRule={deleteKeywordRule}
										onClearAllData={clearAllData}
										onExportData={exportData}
										onImportData={importData}
										onRefreshData={handleRefresh}
										storageUsage={storageUsage}
									/>
								}
							/>
						</Routes>
					</Content>
				</Layout>
			</Layout>
		</ConfigProvider>
	)
}

function App() {
	return (
		<Router>
			<AppContent />
		</Router>
	)
}
export default App
