import React from 'react'
import { Card, Tag, Typography, Space, Button, Tooltip } from 'antd'
import { StarOutlined, EyeOutlined } from '@ant-design/icons'
import type { GitHubRepo } from '../types'

const { Text, Paragraph } = Typography

interface RepoCardProps {
	repo: GitHubRepo
	tags?: string[]
	onTagClick?: (tag: string) => void
	//默认是default（最近更新时间）
	viewType?: 'starred' | 'created' | 'default'
}

const RepoCard: React.FC<RepoCardProps> = ({
	repo,
	tags = [],
	onTagClick,
	viewType = 'default',
}) => {
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('zh-CN')
	}
	const getTimeInfo = () => {
		switch (viewType) {
			case 'starred':
				return {
					date: repo.starred_at,
					label: '收藏时间',
				}
			case 'created':
				return {
					date: repo.created_at,
					label: '创建时间',
				}
			default:
				return {
					date: repo.pushed_at,
					label: '更新时间',
				}
		}
	}
	const formatNumber = (num: number) => {
		if (num >= 1000) {
			return `${(num / 1000).toFixed(1)}k`
		}
		return num.toString()
	}

	const getLanguageColor = (language: string | null) => {
		const colors: { [key: string]: string } = {
			JavaScript: '#f1e05a',
			TypeScript: '#2b7489',
			Python: '#3572A5',
			Java: '#b07219',
			'C++': '#f34b7d',
			C: '#555555',
			'C#': '#239120',
			PHP: '#4F5D95',
			Ruby: '#701516',
			Go: '#00ADD8',
			Rust: '#dea584',
			Swift: '#ffac45',
			Kotlin: '#F18E33',
			Dart: '#00B4AB',
			Vue: '#2c3e50',
			HTML: '#e34c26',
			CSS: '#1572B6',
			Shell: '#89e051',
			Dockerfile: '#384d54',
		}
		return colors[language || ''] || '#8c8c8c'
	}

	return (
		<Card
			hoverable
			size='small'
			className='repo-card'
			style={{
				marginBottom: 16,
				maxHeight: 300,
				display: 'flex',
				flexDirection: 'column',
			}}>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'flex-start',
					marginBottom: 12,
				}}>
				<div style={{ flex: 1, minWidth: 0 }}>
					<div
						style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
						<img
							src={repo.owner.avatar_url}
							alt={repo.owner.login}
							style={{
								width: 20,
								height: 20,
								borderRadius: '50%',
								marginRight: 8,
							}}
						/>
						<Text type='secondary' style={{ fontSize: 12 }}>
							{repo.owner.login}
						</Text>
					</div>
					<Typography.Title
						level={5}
						style={{ margin: 0, marginBottom: 8 }}
						ellipsis={{ tooltip: repo.full_name }}>
						<a
							href={repo.html_url}
							target='_blank'
							rel='noopener noreferrer'
							style={{ color: 'inherit', textDecoration: 'none' }}>
							{repo.name}
						</a>
					</Typography.Title>
				</div>
				<Button
					type='link'
					size='small'
					icon={<EyeOutlined />}
					href={repo.html_url}
					target='_blank'
					rel='noopener noreferrer'>
					查看
				</Button>
			</div>

			<div style={{ flex: 1, marginBottom: 12 }}>
				{repo.description ? (
					<Paragraph
						style={{
							margin: 0,
							fontSize: 13,
							color: '#666',
							height: '40px',
							overflow: 'hidden',
						}}
						ellipsis={{ rows: 2, tooltip: repo.description }}>
						{repo.description}
					</Paragraph>
				) : (
					<div style={{ height: '40px' }} />
				)}
			</div>

			<div
				style={{
					marginBottom: 12,
					minHeight: '60px',
					display: 'flex',
					alignItems: 'flex-start',
				}}>
				<Space size={[8, 4]} wrap>
					{repo.language && (
						<Tag
							color={getLanguageColor(repo.language)}
							style={{
								color: '#fff',
								border: 'none',
								fontSize: 11,
								padding: '2px 6px',
								borderRadius: 10,
							}}>
							{repo.language}
						</Tag>
					)}
					{repo.topics.slice(0, 3).map((topic) => (
						<Tag
							key={topic}
							style={{
								fontSize: 11,
								padding: '2px 6px',
								borderRadius: 10,
								cursor: 'pointer',
							}}
							onClick={() => onTagClick?.(topic)}>
							{topic}
						</Tag>
					))}
					{repo.topics.length > 3 && (
						<Tooltip title={repo.topics.slice(3).join(', ')}>
							<Tag
								style={{ fontSize: 11, padding: '2px 6px', borderRadius: 10 }}>
								+{repo.topics.length - 3}
							</Tag>
						</Tooltip>
					)}
				</Space>
			</div>

			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
				}}>
				<Space size={16}>
					<Space size={4}>
						<StarOutlined style={{ color: '#faad14', fontSize: 12 }} />
						<Text style={{ fontSize: 12, color: '#666' }}>
							{formatNumber(repo.stargazers_count)}
						</Text>
					</Space>
					<Space size={4}>
						<Text style={{ fontSize: 12, color: '#666' }}>
							{getTimeInfo().label}:
						</Text>
						<Text style={{ fontSize: 12, color: '#666' }}>
							{formatDate(getTimeInfo().date)}
						</Text>
					</Space>
				</Space>

				{tags.length > 0 && (
					<Space size={4} wrap>
						{tags.slice(0, 2).map((tag) => (
							<Tag
								key={tag}
								color='blue'
								style={{
									fontSize: 10,
									padding: '0 4px',
									borderRadius: 2,
									lineHeight: '16px',
									height: '16px',
								}}
								onClick={() => onTagClick?.(tag)}>
								{tag}
							</Tag>
						))}
						{tags.length > 2 && (
							<Tooltip title={tags.slice(2).join(', ')}>
								<Tag
									color='blue'
									style={{
										fontSize: 10,
										padding: '0 4px',
										borderRadius: 2,
										lineHeight: '16px',
										height: '16px',
									}}>
									+{tags.length - 2}
								</Tag>
							</Tooltip>
						)}
					</Space>
				)}
			</div>
		</Card>
	)
}

export default RepoCard
