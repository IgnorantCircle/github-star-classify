import React, { useState } from 'react'
import {
	Card,
	Form,
	Input,
	Button,
	Switch,
	Space,
	Typography,
	Table,
	Tag,
	Modal,
	ColorPicker,
	message,
	Popconfirm,
	Upload,
	Progress,
	Alert,
	Select,
	Steps,
	List,
} from 'antd'
import {
	PlusOutlined,
	EditOutlined,
	DeleteOutlined,
	DownloadOutlined,
	UploadOutlined,
	ClearOutlined,
	GithubOutlined,
	QuestionCircleOutlined,
	LinkOutlined,
} from '@ant-design/icons'
import type { UserConfig, Tag as TagType, KeywordRule } from '../types'

const { Title, Text } = Typography
const { TextArea } = Input

interface SettingsPageProps {
	userConfig: UserConfig
	tags: TagType[]
	onUpdateConfig: (config: Partial<UserConfig>) => void
	onAddTag: (tag: Omit<TagType, 'id'>) => TagType
	onUpdateTag: (tagId: string, updates: Partial<TagType>) => void
	onDeleteTag: (tagId: string) => void
	onAddKeywordRule: (rule: Omit<KeywordRule, 'priority'>) => void
	onUpdateKeywordRule: (index: number, updates: Partial<KeywordRule>) => void
	onDeleteKeywordRule: (index: number) => void
	onClearAllData: () => void
	onExportData: () => void
	onImportData: (file: File) => void
	onRefreshData?: () => void
	storageUsage?: { used: number; total: number; percentage: number }
}

const SettingsPage: React.FC<SettingsPageProps> = ({
	userConfig,
	tags,
	onUpdateConfig,
	onAddTag,
	onUpdateTag,
	onDeleteTag,
	onAddKeywordRule,
	onUpdateKeywordRule,
	onDeleteKeywordRule,
	onClearAllData,
	onExportData,
	onImportData,
	onRefreshData,
	storageUsage,
}) => {
	const [form] = Form.useForm()
	const [tagForm] = Form.useForm()
	const [ruleForm] = Form.useForm()
	const [tagModalVisible, setTagModalVisible] = useState(false)
	const [ruleModalVisible, setRuleModalVisible] = useState(false)
	const [editingTag, setEditingTag] = useState<TagType | null>(null)
	const [editingRuleIndex, setEditingRuleIndex] = useState<number | null>(null)
	const [tokenHelpVisible, setTokenHelpVisible] = useState(false)

	const [messageApi, contextHolder] = message.useMessage()

	// 保存基本配置
	const handleSaveConfig = async (values: Partial<UserConfig>) => {
		onUpdateConfig(values)
		messageApi.success('配置保存成功')
		// 如果更新了GitHub Token或用户名，自动刷新数据
		if (
			(values.githubToken && values.githubToken !== userConfig.githubToken) ||
			(values.username && values.username !== userConfig.username)
		) {
			if (onRefreshData) {
				messageApi.info('正在获取最新数据...')
				onRefreshData()
			}
		}
	}

	// 添加/编辑标签
	const handleTagSubmit = (values: Omit<TagType, 'id'>) => {
		if (editingTag) {
			onUpdateTag(editingTag.id, values)
			messageApi.success('标签更新成功')
		} else {
			onAddTag(values)
			messageApi.success('标签添加成功')
		}
		setTagModalVisible(false)
		setEditingTag(null)
		tagForm.resetFields()
	}

	// 添加/编辑关键词规则
	const handleRuleSubmit = (values: { keywords: string; tagId: string; priority: number }) => {
		const keywords = values.keywords
			.split(',')
			.map((k: string) => k.trim())
			.filter(Boolean)
		const rule = { ...values, keywords }

		if (editingRuleIndex !== null) {
			onUpdateKeywordRule(editingRuleIndex, rule)
			messageApi.success('规则更新成功')
		} else {
			onAddKeywordRule(rule)
			messageApi.success('规则添加成功')
		}
		setRuleModalVisible(false)
		setEditingRuleIndex(null)
		ruleForm.resetFields()
	}

	// 编辑标签
	const handleEditTag = (tag: TagType) => {
		setEditingTag(tag)
		tagForm.setFieldsValue(tag)
		setTagModalVisible(true)
	}

	// 编辑规则
	const handleEditRule = (rule: KeywordRule, index: number) => {
		setEditingRuleIndex(index)
		ruleForm.setFieldsValue({
			...rule,
			keywords: rule.keywords.join(', '),
		})
		setRuleModalVisible(true)
	}

	// 文件上传处理
	const handleFileUpload = (file: File) => {
		onImportData(file)
		return false // 阻止默认上传行为
	}

	// 标签表格列
	const tagColumns = [
		{
			title: '标签名称',
			dataIndex: 'name',
			key: 'name',
			render: (name: string, record: TagType) => (
				<Tag color={record.color}>{name}</Tag>
			),
		},
		{
			title: '描述',
			dataIndex: 'description',
			key: 'description',
			ellipsis: true,
		},
		{
			title: '颜色',
			dataIndex: 'color',
			key: 'color',
			width: 80,
			render: (color: string) => (
				<div
					style={{
						width: 20,
						height: 20,
						backgroundColor: color,
						borderRadius: 4,
						border: '1px solid #d9d9d9',
					}}
				/>
			),
		},
		{
			title: '操作',
			key: 'actions',
			width: 120,
			render: (_: unknown, record: TagType) => (
				<Space>
					<Button
						size='small'
						icon={<EditOutlined />}
						onClick={() => handleEditTag(record)}
					/>
					<Popconfirm
						title='确定删除这个标签吗？'
						onConfirm={() => onDeleteTag(record.id)}
						okText='确定'
						cancelText='取消'>
						<Button size='small' danger icon={<DeleteOutlined />} />
					</Popconfirm>
				</Space>
			),
		},
	]

	// 关键词规则表格列
	const ruleColumns = [
		{
			title: '关键词',
			dataIndex: 'keywords',
			key: 'keywords',
			render: (keywords: string[]) => (
				<Space wrap>
					{keywords.slice(0, 3).map((keyword) => (
						<Tag key={keyword}>{keyword}</Tag>
					))}
					{keywords.length > 3 && <Tag>+{keywords.length - 3}</Tag>}
				</Space>
			),
		},
		{
			title: '目标标签',
			dataIndex: 'tagId',
			key: 'tagId',
			render: (tagId: string) => {
				const tag = tags.find((t) => t.id === tagId)
				return tag ? <Tag color={tag.color}>{tag.name}</Tag> : tagId
			},
		},
		{
			title: '优先级',
			dataIndex: 'priority',
			key: 'priority',
			width: 80,
		},
		{
			title: '操作',
			key: 'actions',
			width: 120,
			render: (_: unknown, record: KeywordRule, index: number) => (
				<Space>
					<Button
						size='small'
						icon={<EditOutlined />}
						onClick={() => handleEditRule(record, index)}
					/>
					<Popconfirm
						title='确定删除这个规则吗？'
						onConfirm={() => onDeleteKeywordRule(index)}
						okText='确定'
						cancelText='取消'>
						<Button size='small' danger icon={<DeleteOutlined />} />
					</Popconfirm>
				</Space>
			),
		},
	]

	return (
		<>
			{contextHolder}
			<div style={{ padding: '0 24px' }}>
				<Title level={2}>设置</Title>

				{/* 基本配置 */}
				<Card title='基本配置' style={{ marginBottom: 24 }}>
					<Form
						form={form}
						layout='vertical'
						initialValues={userConfig}
						onFinish={handleSaveConfig}>
						<Form.Item
							label='GitHub 用户名'
							name='username'
							rules={[{ required: true, message: '请输入GitHub用户名' }]}>
							<Input
								placeholder='请输入您的GitHub用户名'
								prefix={<GithubOutlined />}
							/>
						</Form.Item>

						<Form.Item
							label={
								<Space>
									GitHub Token (可选)
									<Button
										type='link'
										size='small'
										icon={<QuestionCircleOutlined />}
										onClick={() => setTokenHelpVisible(true)}>
										如何获取？
									</Button>
								</Space>
							}
							name='githubToken'
							extra='提供Token可以提高API请求限制，避免频率限制（推荐配置）'>
							<Input.Password placeholder='ghp_xxxxxxxxxxxxxxxxxxxx' />
						</Form.Item>

						<Form.Item
							label='自动分类'
							name='autoClassify'
							valuePropName='checked'>
							<Switch />
						</Form.Item>

						<Form.Item>
							<Button type='primary' htmlType='submit'>
								保存配置
							</Button>
						</Form.Item>
					</Form>
				</Card>

				{/* 标签管理 */}
				<Card
					title='标签管理'
					style={{ marginBottom: 24 }}
					extra={
						<Button
							type='primary'
							icon={<PlusOutlined />}
							onClick={() => {
								setEditingTag(null)
								tagForm.resetFields()
								setTagModalVisible(true)
							}}>
							添加标签
						</Button>
					}>
					<Table
						dataSource={tags}
						columns={tagColumns}
						rowKey='id'
						size='small'
						pagination={{ pageSize: 10 }}
					/>
				</Card>

				{/* 关键词规则管理 */}
				<Card
					title='关键词规则'
					style={{ marginBottom: 24 }}
					extra={
						<Button
							type='primary'
							icon={<PlusOutlined />}
							onClick={() => {
								setEditingRuleIndex(null)
								ruleForm.resetFields()
								setRuleModalVisible(true)
							}}>
							添加规则
						</Button>
					}>
					<Alert
						message='关键词规则说明'
						description='系统会根据仓库的名称、描述、主题和编程语言来匹配关键词，自动为仓库分配相应的标签。优先级数字越大，匹配优先级越高。'
						type='info'
						style={{ marginBottom: 16 }}
					/>
					<Table
						dataSource={userConfig.keywordRules}
						columns={ruleColumns}
						rowKey={(_record, index) => `rule-${index}`}
						size='small'
						pagination={{ pageSize: 10 }}
					/>
				</Card>

				{/* 数据管理 */}
				<Card title='数据管理' style={{ marginBottom: 24 }}>
					{storageUsage && (
						<div style={{ marginBottom: 16 }}>
							<Text>存储使用情况：</Text>
							<Progress
								percent={Math.round(storageUsage.percentage)}
								size='small'
								style={{ marginLeft: 8, width: 200 }}
							/>
							<Text type='secondary' style={{ marginLeft: 8 }}>
								{(storageUsage.used / 1024).toFixed(1)}KB /{' '}
								{(storageUsage.total / 1024 / 1024).toFixed(1)}MB
							</Text>
						</div>
					)}

					<Space wrap>
						<Button icon={<DownloadOutlined />} onClick={onExportData}>
							导出数据
						</Button>

						<Upload
							accept='.json'
							showUploadList={false}
							beforeUpload={handleFileUpload}>
							<Button icon={<UploadOutlined />}>导入数据</Button>
						</Upload>

						<Popconfirm
							title='确定清除所有数据吗？此操作不可恢复！'
							onConfirm={onClearAllData}
							okText='确定'
							cancelText='取消'>
							<Button danger icon={<ClearOutlined />}>
								清除所有数据
							</Button>
						</Popconfirm>
					</Space>
				</Card>

				{/* 标签编辑模态框 */}
				<Modal
					title={editingTag ? '编辑标签' : '添加标签'}
					open={tagModalVisible}
					onCancel={() => {
						setTagModalVisible(false)
						setEditingTag(null)
						tagForm.resetFields()
					}}
					footer={null}>
					<Form form={tagForm} layout='vertical' onFinish={handleTagSubmit}>
						<Form.Item
							label='标签名称'
							name='name'
							rules={[{ required: true, message: '请输入标签名称' }]}>
							<Input placeholder='例如：前端开发' />
						</Form.Item>

						<Form.Item label='描述' name='description'>
							<TextArea placeholder='标签描述（可选）' rows={3} />
						</Form.Item>

						<Form.Item
							label='颜色'
							name='color'
							rules={[{ required: true, message: '请选择标签颜色' }]}>
							<ColorPicker showText />
						</Form.Item>

						<Form.Item>
							<Space>
								<Button type='primary' htmlType='submit'>
									{editingTag ? '更新' : '添加'}
								</Button>
								<Button
									onClick={() => {
										setTagModalVisible(false)
										setEditingTag(null)
										tagForm.resetFields()
									}}>
									取消
								</Button>
							</Space>
						</Form.Item>
					</Form>
				</Modal>

				{/* 关键词规则编辑模态框 */}
				<Modal
					title={editingRuleIndex !== null ? '编辑规则' : '添加规则'}
					open={ruleModalVisible}
					onCancel={() => {
						setRuleModalVisible(false)
						setEditingRuleIndex(null)
						ruleForm.resetFields()
					}}
					footer={null}
					width={600}>
					<Form form={ruleForm} layout='vertical' onFinish={handleRuleSubmit}>
						<Form.Item
							label='关键词'
							name='keywords'
							rules={[{ required: true, message: '请输入关键词' }]}
							extra='多个关键词用逗号分隔，例如：react, vue, angular'>
							<TextArea
								placeholder='react, vue, angular, frontend, javascript'
								rows={3}
							/>
						</Form.Item>

						<Form.Item
							label='目标标签'
							name='tagId'
							rules={[{ required: true, message: '请选择目标标签' }]}>
							<Select placeholder='选择标签'>
								{tags.map((tag) => (
									<Select.Option key={tag.id} value={tag.id}>
										<Tag color={tag.color}>{tag.name}</Tag>
									</Select.Option>
								))}
							</Select>
						</Form.Item>

						<Form.Item
							label='优先级'
							name='priority'
							initialValue={10}
							rules={[{ required: true, message: '请输入优先级' }]}
							extra='数字越大优先级越高，范围：1-100'>
							<Input type='number' min={1} max={100} />
						</Form.Item>

						<Form.Item>
							<Space>
								<Button type='primary' htmlType='submit'>
									{editingRuleIndex !== null ? '更新' : '添加'}
								</Button>
								<Button
									onClick={() => {
										setRuleModalVisible(false)
										setEditingRuleIndex(null)
										ruleForm.resetFields()
									}}>
									取消
								</Button>
							</Space>
						</Form.Item>
					</Form>
				</Modal>

				{/* GitHub Token 获取帮助 */}
				<Modal
					title={
						<Space>
							<QuestionCircleOutlined />
							如何获取 GitHub Personal Access Token
						</Space>
					}
					open={tokenHelpVisible}
					onCancel={() => setTokenHelpVisible(false)}
					footer={[
						<Button key='close' onClick={() => setTokenHelpVisible(false)}>
							关闭
						</Button>,
					]}
					width={700}>
					<div style={{ marginBottom: 16 }}>
						<Alert
							message='为什么需要 GitHub Token？'
							description='GitHub API 对未认证用户有严格的请求限制（每小时60次）。配置 Personal Access Token 后，限制将提升至每小时5000次，确保应用正常使用。'
							type='info'
							showIcon
							style={{ marginBottom: 16 }}
						/>
					</div>

					<Steps
						direction='vertical'
						size='small'
						current={-1}
						items={[
							{
								title: '访问 GitHub 设置页面',
								description: (
									<div>
										<p>
											点击下方链接访问 GitHub Personal Access Tokens 设置页面：
										</p>
										<Button
											type='link'
											icon={<LinkOutlined />}
											onClick={() =>
												window.open(
													'https://github.com/settings/tokens',
													'_blank'
												)
											}>
											GitHub Settings → Personal Access Tokens
										</Button>
									</div>
								),
							},
							{
								title: '生成新的 Token',
								description: (
									<div>
										<p>
											在页面中点击 "Generate new token" 按钮，选择 "Generate new
											token (classic)"
										</p>
									</div>
								),
							},
							{
								title: '配置 Token 信息',
								description: (
									<div>
										<List
											size='small'
											dataSource={[
												'输入 Token 名称（如：GitHub Star Classifier）',
												'设置过期时间（建议选择 No expiration 或较长时间）',
												'选择权限范围：只需勾选 "public_repo" 权限即可',
											]}
											renderItem={(item, index) => (
												<List.Item>
													<Typography.Text>
														{index + 1}. {item}
													</Typography.Text>
												</List.Item>
											)}
										/>
									</div>
								),
							},
							{
								title: '生成并复制 Token',
								description: (
									<div>
										<p>点击页面底部的 "Generate token" 按钮生成 Token</p>
										<Alert
											message='重要提醒'
											description='Token 只会显示一次，请立即复制并保存到安全的地方！'
											type='warning'
											showIcon
											style={{ marginTop: 8 }}
										/>
									</div>
								),
							},
							{
								title: '在应用中配置',
								description: (
									<div>
										<p>
											将复制的 Token 粘贴到上方的 "GitHub Token"
											输入框中，然后保存配置。
										</p>
										<Typography.Text type='secondary'>
											Token 格式通常为：ghp_xxxxxxxxxxxxxxxxxxxx
										</Typography.Text>
									</div>
								),
							},
						]}
					/>

					<div style={{ marginTop: 16 }}>
						<Alert
							message='安全提醒'
							description={
								<div>
									<p>
										• Personal Access Token 具有访问您 GitHub
										账户的权限，请妥善保管
									</p>
									<p>• 不要将 Token 分享给他人或提交到公开的代码仓库</p>
									<p>• 如果 Token 泄露，请立即到 GitHub 设置页面撤销该 Token</p>
									<p>
										• 本应用只会将 Token
										保存在您的浏览器本地，不会上传到任何服务器
									</p>
								</div>
							}
							type='warning'
							showIcon
						/>
					</div>
				</Modal>
			</div>
		</>
	)
}

export default SettingsPage
