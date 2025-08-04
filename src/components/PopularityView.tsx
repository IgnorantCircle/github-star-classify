import React from 'react'
import type { GitHubRepo } from '../types'
import CategorizedView from './common/CategorizedView'
import { usePopularityCategorization } from '../hooks/useRepoCategorization'

interface PopularityViewProps {
	repos: GitHubRepo[]
	loading?: boolean
	onRefresh?: () => void
}

const PopularityView: React.FC<PopularityViewProps> = ({
	repos,
	loading = false,
	onRefresh,
}) => {
	const {
		categories,
		categorizeRepos,
		defaultSortType,
		defaultActiveTab,
		renderCategoryDescription,
	} = usePopularityCategorization()



	return (
		<CategorizedView
			repos={repos}
			loading={loading}
			onRefresh={onRefresh}
			categories={categories}
			categorizeRepos={categorizeRepos}
			defaultSortType={defaultSortType}
			defaultActiveTab={defaultActiveTab}
			renderCategoryDescription={renderCategoryDescription}
		/>
	)
}

export default PopularityView
