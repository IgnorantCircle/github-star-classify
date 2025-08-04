import React from 'react'
import type { GitHubRepo } from '../types'
import CategorizedView from './common/CategorizedView'
import { useTimeCategorization } from '../hooks/useRepoCategorization'

interface TimeBasedViewProps {
	repos: GitHubRepo[]
	loading?: boolean
	onRefresh?: () => void
}

const TimeBasedView: React.FC<TimeBasedViewProps> = ({
	repos,
	loading = false,
	onRefresh,
}) => {
	const {
		categories,
		categorizeRepos,
		defaultSortType,
		defaultActiveTab,
		sortOptions,
	} = useTimeCategorization()

	return (
		<CategorizedView
			repos={repos}
			loading={loading}
			onRefresh={onRefresh}
			categories={categories}
			categorizeRepos={categorizeRepos}
			defaultSortType={defaultSortType}
			defaultActiveTab={defaultActiveTab}
			sortOptions={sortOptions}
			getRepoCardProps={(repo, category) => ({
				repo,
				tags: [category.name],
				viewType: 'starred',
			})}
		/>
	)
}

export default TimeBasedView
