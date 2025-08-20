import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	// 加载环境变量
	const env = loadEnv(mode, process.cwd(), '')
	
	// 开发环境使用根路径，生产环境使用子路径
	const baseUrl = mode === 'development' ? '/' : (env.PUBLIC_URL || '/project/github-star-classify/')
	
	return {
		plugins: [react()],
		// 关键配置：开发环境使用根路径，生产环境使用子路径
		base: baseUrl,
		// 定义环境变量，使其在客户端可用
		define: {
			'import.meta.env.PUBLIC_URL': JSON.stringify(env.PUBLIC_URL || '/project/github-star-classify/')
		}
	}
})
