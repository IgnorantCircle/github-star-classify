# GitHub Star Classify
 这是一个GitHub star仓库分类管理工具，可以查看自己或者其他GitHub用户的收藏，并且可以根据关键词规则对仓库进行分类。

因为自己的GitHub Star项目很多，每次找都找半天，而且GitHub官方的分类是在太不方便了，所以就想自己写一个可视化分类管理工具，用于管理 GitHub 收藏项目，同时方便自己查看大佬们的收藏项目。

所以就有了这个项目。

## 🌁 项目截图
<img src="https://blog-1306207361.cos.ap-guangzhou.myqcloud.com/blog/20250820185957008.webp?imageSlim" alt="项目截图" />
<img src="https://blog-1306207361.cos.ap-guangzhou.myqcloud.com/blog/20250820185919671.webp?imageSlim" alt="项目截图" />
<img src="https://blog-1306207361.cos.ap-guangzhou.myqcloud.com/blog/20250820185657040.webp?imageSlim" alt="项目截图" />

## 📦 项目地址
- 项目仓库：[https://github.com/IgnorantCircle/github-star-classify](https://github.com/IgnorantCircle/github-star-classify)
- 在线演示：[http://www.igcricle.top/project/github-star-classify/](http://www.igcricle.top/project/github-star-classify)

## ✨ 功能特性

### 🎯 智能分类
- **自动分类**：基于关键词规则自动将仓库分类到不同标签
- **多维度分析**：支持按分类、时间、热度、成熟度、活跃度等多个维度查看
- **自定义标签**：支持创建、编辑和删除自定义标签
- **关键词规则**：可配置关键词匹配规则，支持优先级设置

### 📊 数据可视化
- **仪表盘概览**：展示总体统计信息、语言分布、分类统计等
- **分类视图**：按标签分组展示仓库，支持颜色标识
- **时间视图**：按收藏时间、创建时间、更新时间等时间维度查看
- **热度排行**：按星标数量排序展示热门项目
- **成熟度分析**：根据项目年龄和维护状态评估项目成熟度
- **活跃度监控**：跟踪项目的最近更新和代码推送情况

### 🔧 数据管理
- **本地存储**：所有数据存储在浏览器本地，保护隐私
- **数据导入导出**：支持 JSON 格式的数据备份和恢复
- **增量同步**：支持增量获取新的星标仓库
- **存储监控**：实时显示本地存储使用情况

### ⚙️ 个性化配置
- **GitHub Token**：可选配置 GitHub Personal Access Token 提高 API 限制
- **用户设置**：自定义用户名、自动分类规则等
- **主题适配**：使用 Ant Design 组件库

## 🚀 快速开始

### 环境要求
- Node.js 16+
- pnpm (推荐) 或 npm

### 安装依赖
```bash
# 使用 pnpm (推荐)
pnpm install

# 或使用 npm
npm install
```

### 启动开发服务器
```bash
# 使用 pnpm
pnpm dev

# 或使用 npm
npm run dev
```

### 构建生产版本
```bash
# 使用 pnpm
pnpm build

# 或使用 npm
npm run build
```

## 📖 使用指南

### 1. 初始设置
1. 打开应用后，点击右上角的设置按钮
2. 输入你的或你需要查看的 GitHub 用户名
3. （可选）配置 GitHub Personal Access Token 以提高 API 限制
4. 保存设置

### 2. 获取星标仓库
1. 在设置页面点击「获取 Starred 仓库」按钮
2. 等待数据同步完成
3. 系统会自动根据预设规则对仓库进行分类

### 3. 查看和管理
- **仪表盘**：查看总体统计和概览信息
- **分类视图**：按标签查看分类后的仓库
- **时间视图**：按时间维度浏览仓库
- **热度排行**：查看最受欢迎的项目
- **成熟度分析**：了解项目的发展阶段
- **活跃度监控**：跟踪项目的维护状态

### 4. 自定义分类
1. 在设置页面管理标签和关键词规则
2. 添加新标签并设置颜色
3. 配置关键词匹配规则和优先级
4. 重新分类以应用新规则

## 🏗️ 技术架构

### 技术栈
- **前端框架**：React 19 + TypeScript
- **构建工具**：Vite
- **UI 组件库**：Ant Design 5.x
- **路由管理**：React Router DOM 7.x
- **API 客户端**：Octokit (GitHub 官方 SDK)
- **代码规范**：ESLint + TypeScript ESLint

### 项目结构
```
src/
├── components/          # React 组件
│   ├── Dashboard.tsx    # 仪表盘组件
│   ├── CategoryView.tsx # 分类视图组件
│   ├── TimeBasedView.tsx# 时间视图组件
│   ├── PopularityView.tsx# 热度视图组件
│   ├── MaturityView.tsx # 成熟度视图组件
│   ├── ActivityView.tsx # 活跃度视图组件
│   ├── RepoCard.tsx     # 仓库卡片组件
│   ├── SettingsPage.tsx # 设置页面组件
│   └── common/          # 通用组件
├── hooks/               # React Hooks
│   ├── useAppState.ts   # 应用状态管理
│   └── useRepoCategorization.ts # 仓库分类逻辑
├── services/            # 业务服务层
│   ├── githubApi.ts     # GitHub API 服务
│   ├── classify.ts      # 分类服务
│   └── storage.ts       # 本地存储服务
├── types/               # TypeScript 类型定义
│   └── index.ts         # 主要类型定义
├── App.tsx              # 主应用组件
└── main.tsx             # 应用入口
```

### 核心服务

#### GitHub API 服务 (`githubApi.ts`)
- 封装 GitHub REST API 调用
- 支持用户验证和 Token 管理
- 分页获取星标仓库数据
- API 限制监控

#### 分类服务 (`classify.ts`)
- 基于关键词规则的自动分类算法
- 预设 14 个常用技术分类标签
- 支持自定义关键词规则和优先级
- 多字段匹配（名称、描述、主题、语言）

#### 存储服务 (`storage.ts`)
- 基于 localStorage 的本地数据持久化
- 数据导入导出功能
- 存储空间监控
- 数据版本管理

## 🎨 默认分类标签

系统预设了以下 14 个分类标签：

- 🔵 **前端开发** - React、Vue、Angular 等前端技术
- 🟢 **后端开发** - Node.js、Spring、Django 等后端框架
- 🟣 **移动开发** - React Native、Flutter、Android/iOS 开发
- 🟠 **AI/机器学习** - TensorFlow、PyTorch、机器学习相关
- 🔵 **DevOps** - Docker、Kubernetes、CI/CD 工具
- 🟡 **数据库** - MySQL、MongoDB、Redis 等数据存储
- 🟡 **开发工具** - VSCode、Git、命令行工具等
- 🟣 **游戏开发** - Unity、Unreal、游戏引擎相关
- 🔴 **安全** - 网络安全、加密、认证相关
- 🟣 **数据科学** - 数据分析、可视化、Jupyter 等
- 🔵 **UI/UX** - 设计系统、UI 组件库
- 🟡 **测试** - 测试框架和工具
- 🟢 **文档** - 文档、教程、学习资源
- ⚪ **其他** - 未分类项目

## 🔧 配置说明

### GitHub Personal Access Token
虽然不是必需的，但建议配置 GitHub Token 以获得更高的 API 限制：

1. 访问 [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. 生成新的 token（只需要 `public_repo` 权限）
3. 在应用设置中配置 token

### 关键词规则配置
关键词规则支持以下配置：
- **关键词列表**：用于匹配的关键词数组
- **目标标签**：匹配成功后分配的标签 ID
- **优先级**：数字越大优先级越高（1-10）

匹配逻辑：
- 检查仓库名称、描述、主题标签和编程语言
- 支持部分匹配和大小写不敏感
- 按优先级排序，高优先级规则优先匹配

## 📊 数据格式

### 导出数据格式
```json
{
  "repos": [...],      // 仓库数据
  "tags": [...],       // 标签配置
  "categories": [...], // 分类结果
  "userConfig": {...}, // 用户配置
  "exportTime": "2024-01-01T00:00:00.000Z"
}
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程
1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范
- 使用 TypeScript 进行类型检查
- 遵循 ESLint 配置的代码规范
- 组件使用函数式组件 + Hooks
- 优先使用 Ant Design 组件

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [GitHub REST API](https://docs.github.com/en/rest) - 数据来源
- [Ant Design](https://ant.design/) - UI 组件库
- [Octokit](https://github.com/octokit/octokit.js) - GitHub API 客户端
- [Vite](https://vitejs.dev/) - 构建工具
- [React](https://reactjs.org/) - 前端框架

---

如果这个项目对你有帮助，请给个 ⭐️ 支持一下！
