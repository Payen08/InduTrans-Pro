# InduTrans Pro - 部署指南

## 🚀 已完成的配置

✅ 代码已推送到 GitHub: https://github.com/Payen08/InduTrans-Pro.git
✅ GitHub Actions 自动部署工作流已配置

## 📋 部署步骤

### 1. 在 GitHub 上配置 Pages

1. 访问仓库设置: https://github.com/Payen08/InduTrans-Pro/settings/pages
2. 在 "Build and deployment" 部分:
   - **Source**: 选择 "GitHub Actions"
3. 保存设置

### 2. 配置 Gemini API 密钥（可选）

如果你的应用需要 Gemini API 密钥：

1. 访问: https://github.com/Payen08/InduTrans-Pro/settings/secrets/actions
2. 点击 "New repository secret"
3. 添加密钥:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: 你的 Gemini API 密钥

### 3. 触发部署

有两种方式触发部署：

#### 方式 1: 推送代码（自动）
```bash
git add .
git commit -m "你的提交信息"
git push
```

#### 方式 2: 手动触发
1. 访问: https://github.com/Payen08/InduTrans-Pro/actions
2. 选择 "Deploy to GitHub Pages" 工作流
3. 点击 "Run workflow"

### 4. 查看部署状态

1. 访问: https://github.com/Payen08/InduTrans-Pro/actions
2. 查看最新的工作流运行状态
3. 部署成功后，应用将在以下地址可用:
   **https://payen08.github.io/InduTrans-Pro/**

## 🔧 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 🌐 其他部署选项

### Vercel 部署（推荐）

1. 访问 [Vercel](https://vercel.com)
2. 点击 "Import Project"
3. 导入 GitHub 仓库: `Payen08/InduTrans-Pro`
4. 配置环境变量（如果需要）:
   - `GEMINI_API_KEY`: 你的 Gemini API 密钥
5. 点击 "Deploy"

### Netlify 部署

1. 访问 [Netlify](https://netlify.com)
2. 点击 "Add new site" → "Import an existing project"
3. 选择 GitHub 并授权
4. 选择仓库: `Payen08/InduTrans-Pro`
5. 构建设置:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. 添加环境变量（如果需要）
7. 点击 "Deploy site"

## 📝 注意事项

- ⚠️ 请勿在代码中硬编码 API 密钥
- 🔒 使用环境变量或 GitHub Secrets 来管理敏感信息
- 🔄 每次推送到 `main` 分支都会自动触发部署
- 📱 应用会自动部署到 GitHub Pages

## 🐛 故障排除

### 部署失败
1. 检查 GitHub Actions 日志
2. 确认所有依赖都在 `package.json` 中
3. 验证构建命令是否正确

### API 密钥问题
1. 确认 GitHub Secrets 已正确配置
2. 检查环境变量名称是否匹配
3. 重新触发工作流

## 📞 支持

如有问题，请在 GitHub 仓库中创建 Issue。
