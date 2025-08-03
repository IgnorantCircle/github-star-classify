import React from 'react';
import { Card, Row, Col, Statistic, Progress, Typography, Space, Tag, Empty, Tooltip } from 'antd';
import {
  StarOutlined,
  FolderOutlined,
  CodeOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import type { Category, GitHubRepo } from '../types';

const { Text } = Typography;

interface DashboardProps {
  repos: GitHubRepo[];
  categories: Category[];
  onCategoryClick: (categoryId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ repos, categories, onCategoryClick }) => {
  // 计算统计数据
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const totalLanguages = new Set(repos.map(repo => repo.language).filter(Boolean)).size;
  const mostStarredRepo = repos.reduce((max, repo) => 
    repo.stargazers_count > (max?.stargazers_count || 0) ? repo : max, null as GitHubRepo | null
  );
  const recentRepos = repos
    .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())
    .slice(0, 5);

  // 语言统计
  const languageStats = repos.reduce((acc, repo) => {
    if (repo.language) {
      acc[repo.language] = (acc[repo.language] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topLanguages = Object.entries(languageStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // 分类统计
  const categoriesWithStats = categories.map(category => ({
    ...category,
    repoCount: category.repos.length,
    totalStars: category.repos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
    percentage: repos.length > 0 ? (category.repos.length / repos.length) * 100 : 0
  })).sort((a, b) => b.repoCount - a.repoCount);

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      'JavaScript': '#f1e05a',
      'TypeScript': '#2b7489',
      'Python': '#3572A5',
      'Java': '#b07219',
      'Go': '#00ADD8',
      'Rust': '#dea584',
      'C++': '#f34b7d',
      'C': '#555555',
      'PHP': '#4F5D95',
      'Ruby': '#701516',
      'Swift': '#ffac45',
      'Kotlin': '#F18E33',
      'Dart': '#00B4AB',
      'C#': '#239120',
      'HTML': '#e34c26',
      'CSS': '#1572B6',
      'Vue': '#4FC08D',
      'React': '#61DAFB'
    };
    return colors[language] || '#8c8c8c';
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* 总览统计 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总仓库数"
              value={repos.length}
              prefix={<FolderOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总星标数"
              value={totalStars}
              prefix={<StarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="编程语言"
              value={totalLanguages}
              prefix={<CodeOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="分类数量"
              value={categories.length}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 分类统计 */}
        <Col xs={24} lg={16}>
          <Card title="分类统计" style={{ height: '100%' }}>
            {categoriesWithStats.length > 0 ? (
              <Row gutter={[16, 16]}>
                {categoriesWithStats.map(category => (
                  <Col xs={24} sm={12} md={8} key={category.id}>
                    <Card
                      size="small"
                      hoverable
                      onClick={() => onCategoryClick(category.id)}
                      style={{ 
                        cursor: 'pointer',
                        borderLeft: `4px solid ${category.color || '#1890ff'}`,
                        transition: 'all 0.3s'
                      }}
                      bodyStyle={{ padding: '12px 16px' }}
                    >
                      <div style={{ marginBottom: 8 }}>
                        <Text strong style={{ fontSize: 14 }}>
                          {category.name}
                        </Text>
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <Space>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {category.repoCount} 个项目
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            ⭐ {category.totalStars}
                          </Text>
                        </Space>
                      </div>
                      <Progress
                        percent={Math.round(category.percentage)}
                        size="small"
                        strokeColor={category.color || '#1890ff'}
                        showInfo={false}
                      />
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        占比 {category.percentage.toFixed(1)}%
                      </Text>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty description="暂无分类数据" />
            )}
          </Card>
        </Col>

        {/* 右侧信息面板 */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" style={{ width: '100%' }} size={16}>
            {/* 热门语言 */}
            <Card title="热门语言" size="small">
              {topLanguages.length > 0 ? (
                <Space direction="vertical" style={{ width: '100%' }} size={8}>
                  {topLanguages.map(([language, count]) => (
                    <div key={language} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Space>
                        <div
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: getLanguageColor(language)
                          }}
                        />
                        <Text style={{ fontSize: 13 }}>{language}</Text>
                      </Space>
                      <Text type="secondary" style={{ fontSize: 12 }}>{count}</Text>
                    </div>
                  ))}
                </Space>
              ) : (
                <Empty description="暂无语言数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Card>

            {/* 最受欢迎项目 */}
            {mostStarredRepo && (
              <Card title="最受欢迎" size="small">
                <div>
                  <Tooltip title={mostStarredRepo.description}>
                    <Text strong>
                      {mostStarredRepo.name}
                    </Text>
                  </Tooltip>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {mostStarredRepo.owner.login}
                  </Text>
                  <br />
                  <Space style={{ marginTop: 8 }}>
                    <Tag icon={<StarOutlined />} color="gold">
                      {mostStarredRepo.stargazers_count.toLocaleString()}
                    </Tag>
                    {mostStarredRepo.language && (
                      <Tag color={getLanguageColor(mostStarredRepo.language)}>
                        {mostStarredRepo.language}
                      </Tag>
                    )}
                  </Space>
                </div>
              </Card>
            )}

            {/* 最近更新 */}  
            <Card title="最近更新" size="small">
              {recentRepos.length > 0 ? (
                <Space direction="vertical" style={{ width: '100%' }} size={8}>
                  {recentRepos.map(repo => (
                    <div key={repo.id} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>
                      <Text strong >
                        {repo.name}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {new Date(repo.pushed_at).toLocaleDateString()}
                      </Text>
                    </div>
                  ))}
                </Space>
              ) : (
                <Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;