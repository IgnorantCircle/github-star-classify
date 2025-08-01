/**
 * Octokit 是 GitHub 官方提供的一套用于与 GitHub API 交互的开发工具包（SDK），
 * 主要用于在代码中调用 GitHub 的各种功能（如操作仓库、处理 Issues、管理 Pull Request 等）

 */

import { Octokit } from '@octokit/rest'
import type { GitHubRepo, StarredReposResponse } from '../types'
class GitHubApiService {
	private octokit: Octokit

	constructor(token?: string) {
		this.octokit = new Octokit({
			auth: token,
		})
	}
	// 更新token
	updateToken(token: string) {
		this.octokit = new Octokit({
			auth: token,
		})
	}

	// 验证GitHub用户名是否存在
	async validateUser(username: string): Promise<boolean> {
		try {
			await this.octokit.rest.users.getByUsername({ username })
			return true
		} catch (error) {
			return false
		}
	}

	// 获取用户的starred仓库
	async getStarredRepos(
		username: string,
		page: number = 1,
		perPage: number = 30
	): Promise<StarredReposResponse> {
		try {
			const response = await this.octokit.rest.activity.listReposStarredByUser({
				username,
				page,
				per_page: perPage,
				sort: 'created',
				direction: 'desc',
			})

			const repos: GitHubRepo[] = response.data.map((repo: any) => ({
				id: repo.id,
				name: repo.name,
				full_name: repo.full_name,
				description: repo.description,
				html_url: repo.html_url,
				stargazers_count: repo.stargazers_count,
				language: repo.language,
				topics: repo.topics || [],
				created_at: repo.created_at,
				updated_at: repo.updated_at,
				pushed_at: repo.pushed_at,
				owner: {
					login: repo.owner.login,
					avatar_url: repo.owner.avatar_url,
				},
			}))

			return {
				data: repos,
				hasMore: response.data.length === perPage,
				nextPage: response.data.length === perPage ? page + 1 : undefined,
			}
		} catch (error: any) {
			console.log('获取starred仓库失败:', error)
			throw new Error(`获取starred仓库失败: ${error.message}`)
		}
	}

	// 获取所有starred仓库（分页获取）
	async getAllStarredRepos(username: string): Promise<GitHubRepo[]> {
		const allRepos: GitHubRepo[] = []
		let page = 1
		let hasMore = true

		while (hasMore) {
			const response = await this.getStarredRepos(username, page, 100)
			allRepos.push(...response.data)
			hasMore = response.hasMore
			page++

			// 添加延迟避免API限制
			if (hasMore) {
				await new Promise((resolve) => setTimeout(resolve, 1000))
			}
		}

		return allRepos
	}

	// 获取API限制信息
	async getRateLimit() {
		try {
			const response = await this.octokit.rest.rateLimit.get()
			return response.data.rate
		} catch (error) {
			console.log('获取API限制信息失败:', error)
			return null
		}
	}
}

export default GitHubApiService
