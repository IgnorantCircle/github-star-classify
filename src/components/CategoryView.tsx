import React from 'react'
import type { Category } from '../types'
import CategorizedView from './common/CategorizedView'
import { useCategoryCategorization } from '../hooks/useRepoCategorization'

interface CategoryViewProps {
	categories: Category[]
	loading?: boolean
	onRefresh?: () => void
	singleCategory?: boolean
}

const CategoryView: React.FC<CategoryViewProps> = ({
	categories,
	loading = false,
	onRefresh,
}) => {
	const {
		categories: categoryLevels,
		categorizeRepos,
		defaultSortType,
		defaultActiveTab,
		renderCategoryDescription,
		getRepoCardProps,
		allRepos,
	} = useCategoryCategorization(categories)

	return (
		<CategorizedView
			repos={allRepos}
			loading={loading}
			onRefresh={onRefresh}
			categories={categoryLevels}
			categorizeRepos={categorizeRepos}
			defaultSortType={defaultSortType}
			defaultActiveTab={defaultActiveTab}
			renderCategoryDescription={renderCategoryDescription}
			getRepoCardProps={getRepoCardProps}
		/>
	)
}

export default CategoryView
