// portfolio 數據儲存
// 每個項目都有對應的 JSX 組件在 @/data/portfolio/{project-name}/ 資料夾內

// 動態導入項目組件和 metadata
import { metadata as playlistRandomizeMetadata } from './PlaylistRandomize/PlaylistRandomize.jsx';

// 項目 metadata 陣列
export const portfolioProjects = [
  playlistRandomizeMetadata,
  // 新增項目時，在此處加入對應的 metadata
];

// 動態載入項目組件的函數
export const loadProjectComponent = async (projectId) => {
  try {
    switch (projectId) {
      case playlistRandomizeMetadata.id:
        const { default: PlaylistRandomize } = await import('./PlaylistRandomize/PlaylistRandomize.jsx');
        return PlaylistRandomize;

      // 新增項目時，在此處加入對應的動態導入
      
      default:
        throw new Error(`Project component not found: ${projectId}`);
    }
  } catch (error) {
    console.error('Failed to load project component:', error);
    return null;
  }
};

// 根據類別獲取項目
export const getProjectsByCategory = (category) => {
  return portfolioProjects.filter(project => project.category === category);
};

// 根據標籤獲取項目
export const getProjectsByTag = (tag) => {
  return portfolioProjects.filter(project => 
    project.technologies && project.technologies.includes(tag)
  );
};

// 搜尋項目
export const searchProjects = (keyword) => {
  const lowerKeyword = keyword.toLowerCase();
  return portfolioProjects.filter(project =>
    project.title.toLowerCase().includes(lowerKeyword) ||
    project.description.toLowerCase().includes(lowerKeyword) ||
    (project.technologies && project.technologies.some(tech => 
      tech.toLowerCase().includes(lowerKeyword)
    ))
  );
};

// 獲取精選項目
export const getFeaturedProjects = () => {
  return portfolioProjects.filter(project => project.featured);
};
