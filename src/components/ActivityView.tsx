import React from 'react'
import type { GitHubRepo } from '../types'
import CategorizedView, { type CategoryLevel } from './common/CategorizedView'
import { useActivityCategorization } from '../hooks/useRepoCategorization'

interface ActivityViewProps {
	repos: GitHubRepo[]
	loading?: boolean
	onRefresh?: () => void
}

const ActivityView: React.FC<ActivityViewProps> = ({
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
	} = useActivityCategorization()

	const renderCategoryDescription = (category: CategoryLevel) => {
		return <div>{category.desc}</div>
	}

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
			renderCategoryDescription={renderCategoryDescription}
		/>
	)
}

export default ActivityView
