import { useEffect, useState } from 'react'
import {
	Layout,
	Menu,
	Typography,
	Button,
	Space,
	Badge,
	Tooltip,
	message,
} from 'antd'
import {
	DashboardOutlined,
	AppstoreOutlined,
	SettingOutlined,
	GithubOutlined,
	ReloadOutlined,
	InfoCircleOutlined,
	FolderOutlined,
	DownOutlined,
	UpOutlined,
} from '@ant-design/icons'
import { useAppState } from './hooks/useAppState'
import Dashboard from './components/Dashboard'
import CategoryView from './components/CategoryView'
import SettingsPage from './components/SettingsPage'
import './App.css'

const { Header, Content, Sider } = Layout
const { Title, Text } = Typography

type ActiveTab = 'dashboard' | 'settings' | string // string for category IDs

function App() {
	const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard')
	const [collapsed, setCollapsed] = useState(false)
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

	const storageUsage = storageService.getStorageUsage()
	const lastSyncTime = storageService.getLastSyncTime()

	const categoryMenuItems = categories.map((category) => ({
		key: category.id,
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
					分类
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
			key: 'settings',
			icon: <SettingOutlined />,
			label: '设置',
		},
	]

	const handleRefresh = async () => {
		await fetchStarredRepos(true)
	}

	const handleCategoryClick = (categoryId: string) => {
		setActiveTab(categoryId)
	}

	const handleMenuClick = ({ key }: { key: string }) => {
		setActiveTab(key as ActiveTab)
	}

	const renderContent = () => {
		if (activeTab === 'dashboard') {
			return (
				<Dashboard
					repos={repos}
					categories={categories}
					onCategoryClick={handleCategoryClick}
				/>
			)
		}

		if (activeTab === 'settings') {
			return (
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
			)
		}

		// 显示特定分类
		const selectedCategory = categories.find((cat) => cat.id === activeTab)
		if (selectedCategory) {
			return (
				<CategoryView
					categories={[selectedCategory]}
					loading={loading}
					onRefresh={handleRefresh}
					singleCategory={true}
				/>
			)
		}

		return null
	}

	useEffect(() => {
		const config = storageService.getUserConfig()
		if (!config.username) {
			messageApi.warning('请前往设置中输入GitHub用户名')
		}
	}, [])

	return (
		<>
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
								{activeTab === 'dashboard'
									? '数据大盘'
									: activeTab === 'settings'
									? '设置'
									: categories.find((cat) => cat.id === activeTab)?.name ||
									  '分类详情'}
							</Title>
							{userConfig.username && (
								<Text type='secondary'>@{userConfig.username}</Text>
							)}
						</div>

						<Space>
							{(activeTab === 'dashboard' ||
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

						{renderContent()}
					</Content>
				</Layout>
			</Layout>
		</>
	)
}

export default App
