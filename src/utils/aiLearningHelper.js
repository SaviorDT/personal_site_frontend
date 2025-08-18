/**
 * AI 學習助手腳本
 * 幫助檢測代碼模式並更新學習文件
 */

export class AILearningHelper {
    constructor() {
        this.corrections = new Map();
        this.preferences = new Map();
        this.patterns = new Map();
    }

    /**
     * 記錄一次代碼糾正
     * @param {Object} correction - 糾正信息
     */
    recordCorrection(correction) {
        const {
            type,        // 'naming', 'structure', 'styling', 'import', etc.
            before,      // 修改前的代碼
            after,       // 修改後的代碼
            context,     // 代碼上下文
            file,        // 文件路徑
            reason       // 糾正原因（可選）
        } = correction;

        const key = `${type}-${this.generatePatternKey(before, after)}`;

        if (!this.corrections.has(key)) {
            this.corrections.set(key, {
                count: 0,
                examples: [],
                firstSeen: new Date(),
                lastSeen: new Date()
            });
        }

        const record = this.corrections.get(key);
        record.count++;
        record.lastSeen = new Date();
        record.examples.push({
            before,
            after,
            context,
            file,
            reason,
            timestamp: new Date()
        });

        // 如果達到學習閾值，觸發更新
        if (record.count >= 3) {
            this.triggerLearningUpdate(type, record);
        }

        return this.generateLearningInsight(type, record);
    }

    /**
     * 生成模式識別的鍵值
     */
    generatePatternKey(before, after) {
        // 簡化代碼以識別結構性模式
        const simplifyCode = (code) => {
            return code
                .replace(/\s+/g, ' ')           // 標準化空格
                .replace(/\/\*.*?\*\//g, '')    // 移除註釋
                .replace(/\/\/.*$/gm, '')       // 移除單行註釋
                .trim();
        };

        const beforeSimple = simplifyCode(before);
        const afterSimple = simplifyCode(after);

        // 生成模式哈希
        return `${beforeSimple.length}-${afterSimple.length}-${this.calculateSimilarity(beforeSimple, afterSimple)}`;
    }

    /**
     * 計算相似度
     */
    calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;

        if (longer.length === 0) return 1.0;

        const editDistance = this.levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }

    /**
     * Levenshtein 距離計算
     */
    levenshteinDistance(str1, str2) {
        const matrix = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    }

    /**
     * 觸發學習更新
     */
    triggerLearningUpdate(type, record) {
        const updateSuggestion = this.generateUpdateSuggestion(type, record);

        console.log('🎓 AI Learning Trigger:', {
            type,
            count: record.count,
            suggestion: updateSuggestion,
            timestamp: new Date()
        });

        return updateSuggestion;
    }

    /**
     * 生成更新建議
     */
    generateUpdateSuggestion(type, record) {
        const { examples, count } = record;
        const latest = examples[examples.length - 1];

        const suggestions = {
            naming: this.generateNamingSuggestion(examples),
            structure: this.generateStructureSuggestion(examples),
            styling: this.generateStylingSuggestion(examples),
            import: this.generateImportSuggestion(examples),
            component: this.generateComponentSuggestion(examples)
        };

        return {
            type,
            count,
            pattern: this.extractPattern(examples),
            suggestion: suggestions[type] || '需要進一步分析此模式',
            files_to_update: this.getFilesToUpdate(type),
            priority: this.calculatePriority(count, type),
            auto_update: count >= 3 && ['naming', 'structure', 'import'].includes(type)
        };
    }

    /**
     * 生成命名建議
     */
    generateNamingSuggestion(examples) {
        const patterns = examples.map(ex => ({
            before: this.extractNamingPattern(ex.before),
            after: this.extractNamingPattern(ex.after)
        }));

        return {
            pattern: '命名偏好模式已識別',
            rule: this.deriveNamingRule(patterns),
            examples: patterns.slice(0, 3)
        };
    }

    /**
     * 生成結構建議
     */
    generateStructureSuggestion(examples) {
        return {
            pattern: '組件結構偏好已識別',
            rule: '更新組件模板中的元素排列順序',
            template_updates: this.extractStructureTemplate(examples)
        };
    }

    /**
     * 生成樣式建議
     */
    generateStylingSuggestion(examples) {
        return {
            pattern: 'CSS 寫法偏好已識別',
            rule: '更新樣式指南中的屬性順序和值格式',
            style_updates: this.extractStylePatterns(examples)
        };
    }

    /**
     * 提取模式
     */
    extractPattern(examples) {
        // 分析所有例子，找出共同模式
        const commonChanges = examples.map(ex => ({
            type: this.classifyChange(ex.before, ex.after),
            magnitude: this.calculateChangeMagnitude(ex.before, ex.after)
        }));

        return {
            change_type: this.findMostCommonChangeType(commonChanges),
            consistency: commonChanges.length > 1 ? this.calculateConsistency(commonChanges) : 1,
            impact: this.assessImpact(commonChanges)
        };
    }

    /**
     * 獲取需要更新的文件
     */
    getFilesToUpdate(type) {
        const updateMap = {
            naming: ['CODING_STYLE.md'],
            structure: ['CODING_STYLE.md', 'ComponentTemplate/'],
            styling: ['STYLE_GUIDE.md'],
            import: ['CODING_STYLE.md', 'ComponentTemplate/'],
            component: ['CODING_STYLE.md', 'ComponentTemplate/', 'ComponentPatterns.jsx']
        };

        return updateMap[type] || ['CODING_STYLE.md'];
    }

    /**
     * 計算優先級
     */
    calculatePriority(count, type) {
        const baseScore = count * 10;
        const typeMultiplier = {
            structure: 1.5,
            naming: 1.3,
            component: 1.2,
            import: 1.1,
            styling: 1.0
        };

        return Math.min(100, baseScore * (typeMultiplier[type] || 1));
    }

    /**
     * 生成學習洞察
     */
    generateLearningInsight(type, record) {
        const { count, examples } = record;

        if (count === 1) {
            return `🔍 首次觀察到 ${type} 類型的偏好調整`;
        } else if (count === 2) {
            return `🤔 第二次觀察到類似的 ${type} 調整，開始建立模式`;
        } else if (count === 3) {
            return `🎯 ${type} 偏好模式確認！建議更新相關指南`;
        } else {
            return `📈 ${type} 偏好模式已穩定 (${count} 次觀察)`;
        }
    }

    // 輔助方法（簡化實現）
    extractNamingPattern(code) { /* 實現命名模式提取 */ return 'pattern'; }
    deriveNamingRule(patterns) { /* 實現命名規則推導 */ return 'rule'; }
    extractStructureTemplate(examples) { /* 實現結構模板提取 */ return {}; }
    extractStylePatterns(examples) { /* 實現樣式模式提取 */ return {}; }
    classifyChange(before, after) { /* 實現變更分類 */ return 'type'; }
    calculateChangeMagnitude(before, after) { /* 實現變更幅度計算 */ return 1; }
    findMostCommonChangeType(changes) { /* 實現最常見變更類型查找 */ return 'common'; }
    calculateConsistency(changes) { /* 實現一致性計算 */ return 0.8; }
    assessImpact(changes) { /* 實現影響評估 */ return 'medium'; }
}

// 使用範例
export const aiLearning = new AILearningHelper();

// 記錄糾正的範例用法
/*
aiLearning.recordCorrection({
  type: 'naming',
  before: 'const handleClick = () => {}',
  after: 'const handleButtonClick = () => {}',
  context: 'Button component event handler',
  file: '/src/Components/Button/Button.jsx',
  reason: 'More specific naming preferred'
});
*/
