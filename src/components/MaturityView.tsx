import React from 'react'
import type { GitHubRepo } from '../types'
import CategorizedView from './common/CategorizedView'
import { useMaturityCategorization } from '../hooks/useRepoCategorization'

interface MaturityViewProps {
	repos: GitHubRepo[]
	loading?: boolean
	onRefresh?: () => void
}

const MaturityView: React.FC<MaturityViewProps> = ({
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
		getRepoCardProps,
	} = useMaturityCategorization()



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
			getRepoCardProps={getRepoCardProps}
		/>
	)
}

export default MaturityView
