# 🚀 MenuGen - 项目启动指南

> **你已经拥有开始 Vibe Coding 所需的一切！**

---

## 📦 项目已交付清单

✅ **6 个完整文档**已在工作区准备好：

```
/Users/junhao/Desktop/MenuGen/
├── 📄 README.md                    # 项目总体概览
├── 📄 PROJECT_SPEC.md              # 技术规范（详细）
├── 📄 PIPELINE.md                  # 开发流程表（10 天 MVP）
├── 📄 QUICK_REFERENCE.md           # 代码模板库（复制粘贴就能用）
├── 📄 INIT_CHECKLIST.md            # 初始化步骤（一步步来）
├── 📄 DOCUMENTATION.md             # 文档导航（你现在看的）
└── 📄 START_HERE.md                # 启动指南（这个文件）
```

---

## 🎯 3 分钟快速了解

### MenuGen 是什么？
一个 **AI 菜单识别系统**，它：
1. 接收用户上传的菜单图片
2. 使用 **Gemini AI** 自动识别菜品（名称、描述、标签）
3. 并发调用 **Google Search** 为每道菜搜索图片
4. 在美观的 **React** 前端展示菜品卡片

### 为什么这个项目很 cool？
- 🤖 **AI 驱动** - Gemini 视觉识别
- ⚡ **高并发** - FastAPI 异步 + asyncio
- 🎨 **现代化** - React + Tailwind CSS
- 📦 **完整** - 从初始化到部署的完整文档

### 要多久才能完成？
**10 天 MVP**（全职开发者）

---

## 📚 文档快速导航

按照下面的顺序阅读文档：

### 1️⃣ **第 1 个小时：了解项目**
```
读这些文件（每个 5-10 分钟）：
1. README.md         ← 开始这里！了解项目
2. DOCUMENTATION.md  ← 文档导航
```
**结果**: 你将明白这个项目是干什么的

---

### 2️⃣ **第 2-6 小时：初始化环境**
```
按照这个文件的步骤：
INIT_CHECKLIST.md    ← 一步步操作

完成后：
□ Python 虚拟环境已设置
□ Node.js 项目已初始化
□ 所有依赖已安装
□ .env 文件已配置
□ 后端可启动（port 8000）
□ 前端可启动（port 5173）
```
**结果**: 你的开发环境已准备好

---

### 3️⃣ **第 7 小时+：开始编码**
```
按照这个文件进行开发：
PIPELINE.md          ← Phase 1,2,3...

当需要代码参考时，打开：
QUICK_REFERENCE.md   ← 复制粘贴代码

当需要规范/细节时，打开：
PROJECT_SPEC.md      ← 完整规范
```
**结果**: 10 天后你将完成 MVP

---

## 🎬 立即开始 - 5 个命令

### Step 1: 检查前置条件
```bash
# 检查 Python
python3 --version    # 应该是 3.9+

# 检查 Node.js
node --version       # 应该是 18+

# 检查 npm
npm --version        # 应该是 9+
```

### Step 2: 查看项目文档
```bash
# 打开项目总览
cat README.md

# 打开初始化指南
cat INIT_CHECKLIST.md

# 打开开发流程
cat PIPELINE.md
```

### Step 3: 初始化项目（按 INIT_CHECKLIST.md）
```bash
# 创建项目结构
mkdir -p backend/services backend/utils backend/tests
mkdir -p frontend/src/{components,api,styles,hooks}

# 进行其他初始化...
# (详见 INIT_CHECKLIST.md)
```

### Step 4: 启动开发
```bash
# 终端 1 - 后端
cd backend && source venv/bin/activate && uvicorn main:app --reload

# 终端 2 - 前端
cd frontend && npm run dev
```

### Step 5: 打开浏览器
```
http://localhost:5173
```

---

## 📋 项目三要素

### 1️⃣ **后端** (Python + FastAPI)
```
功能：接收菜单图片 → 调用 Gemini → 搜索图片 → 返回 JSON
位置：backend/
核心文件：main.py, config.py, schemas.py, 
         services/llm_service.py, services/search_service.py
```

### 2️⃣ **前端** (React + Vite)
```
功能：上传图片 → 显示进度 → 展示卡片
位置：frontend/
核心文件：App.jsx, components/MenuUpload.jsx, 
         components/MenuCard.jsx, api/client.js
```

### 3️⃣ **API** (Post /api/analyze-menu)
```
请求：上传菜单图片
返回：菜品列表（含图片 URL）
详见：PROJECT_SPEC.md 第 4 节
```

---

## 🔑 你需要的 3 个 API Keys

在开始之前，获取这 3 个 API Key：

### 1. Google Gemini API Key
- 去 [Google Cloud Console](https://console.cloud.google.com/)
- 创建项目
- 启用 "Generative Language API"
- 创建 API Key
- 复制到 `backend/.env` 的 `GOOGLE_API_KEY`

### 2. Google Custom Search API Key
- 同上项目中
- 启用 "Custom Search API"
- 创建 API Key
- 复制到 `backend/.env` 的 `SEARCH_API_KEY`

### 3. Google Custom Search Engine ID
- 去 [Google Custom Search](https://programmablesearchengine.google.com/)
- 创建搜索引擎
- 获取搜索引擎 ID (cx)
- 复制到 `backend/.env` 的 `SEARCH_ENGINE_ID`

✅ 如果你已经有这 3 个密钥，直接填到 `backend/.env` 里！

---

## 🎮 Vibe Coding 建议

### 💡 开发心态
- ✨ 按照 PIPELINE.md 的 Phase 一步步来
- 🎯 完成每个小目标后测试
- 📝 遇到问题先查文档
- 🚀 不要跳过初始化步骤

### ⚡ 加速技巧
- 使用 QUICK_REFERENCE.md 的代码模板
- 一次创建所有目录，不要分多次
- 并行启动后端和前端
- 使用真实菜单图片测试

### 🛠️ 遇到问题时
1. **后端问题** → 查 PROJECT_SPEC.md 或 QUICK_REFERENCE.md
2. **前端问题** → 查 QUICK_REFERENCE.md 或 README.md
3. **配置问题** → 查 INIT_CHECKLIST.md
4. **进度问题** → 查 PIPELINE.md

---

## 📖 文档使用地图

```
             START_HERE.md (你现在看的)
                    ↓
            ┌───────┴───────┐
            ↓               ↓
        README.md    DOCUMENTATION.md
        (项目概览)    (文档导航)
            ↓               ↓
            └───────┬───────┘
                    ↓
        ┌───────────┼───────────┐
        ↓           ↓           ↓
   INIT_CHECK   PIPELINE    PROJECT_SPEC
   LIST.md      .md         .md
   (初始化)    (开发流程)   (规范)
        ↓           ↓           ↓
        └───────────┼───────────┘
                    ↓
        QUICK_REFERENCE.md
        (代码模板库 - 核心参考)
```

---

## 🎯 按角色查看

### 👨‍💻 **我是新开发者**
```
1. 读 README.md (10 min)
2. 跟 INIT_CHECKLIST.md (3-4 hours)
3. 用 QUICK_REFERENCE.md (持续)
4. 按 PIPELINE.md 开发 (10 days)
```

### 🎓 **我是项目经理**
```
1. 读 README.md (5 min)
2. 读 PROJECT_SPEC.md (30 min)
3. 用 PIPELINE.md 追踪进度
```

### 🏗️ **我是架构师**
```
1. 读 PROJECT_SPEC.md (30 min)
2. 查 QUICK_REFERENCE.md 代码 (30 min)
3. 讨论 DOCUMENTATION.md 的决策
```

---

## ✨ 项目核心指标

| 指标 | 值 | 备注 |
|------|-----|------|
| **开发时间** | 10 天 | 全职开发 |
| **技术栈** | React + FastAPI | 现代全栈 |
| **识别速度** | <3 秒 | Gemini API |
| **搜索速度** | <2 秒 | 10 道菜并发 |
| **总处理时间** | <5 秒 | 端到端 |
| **支持菜品数** | 50 道/张 | 单张图片 |
| **API 端点** | 1 个 | `/api/analyze-menu` |
| **文档页数** | 6 个 | 共约 100+ 页 |

---

## 🚨 重要提醒

### ⚠️ 不要跳过的步骤
- [ ] 仔细阅读 INIT_CHECKLIST.md
- [ ] 设置正确的虚拟环境
- [ ] 配置 .env 文件（所有 API Keys）
- [ ] 验证后端和前端都能启动
- [ ] 按 PIPELINE.md 的 Phase 进行

### 🛑 常见错误
- ❌ 没有激活虚拟环境 → 会安装到系统 Python
- ❌ 忘记配置 .env → API 调用会失败
- ❌ 跳过初始化 → 后续问题无法解决
- ❌ 端口冲突 → 改端口或检查已用的进程

---

## 💬 如果卡住了...

### Q: 不知道从哪开始？
**A**: 从 INIT_CHECKLIST.md 开始，一步步操作。

### Q: 需要看代码？
**A**: 打开 QUICK_REFERENCE.md，有完整的代码模板。

### Q: 需要理解架构？
**A**: 读 PROJECT_SPEC.md 第 3 节的架构说明。

### Q: 需要规划时间？
**A**: 查 PIPELINE.md，了解每个 Phase 要多久。

### Q: API 怎么调？
**A**: 查 PROJECT_SPEC.md 第 4 节或 README.md 的 API 部分。

### Q: 出错了怎么办？
**A**: 查 QUICK_REFERENCE.md 的故障排查部分。

---

## 📞 核心资源

| 资源 | 用途 | 打开方式 |
|------|------|---------|
| README.md | 项目概览 | `cat README.md` |
| PROJECT_SPEC.md | 技术规范 | `cat PROJECT_SPEC.md` |
| PIPELINE.md | 开发流程 | `cat PIPELINE.md` |
| QUICK_REFERENCE.md | 代码模板 | `cat QUICK_REFERENCE.md` |
| INIT_CHECKLIST.md | 初始化 | `cat INIT_CHECKLIST.md` |
| DOCUMENTATION.md | 导航 | `cat DOCUMENTATION.md` |

---

## 🎬 现在就开始！

### 选择你的起点：

#### 🟢 **我已经了解 AI 和 Web 开发**
```
1. 快速扫一眼 README.md
2. 直接按 INIT_CHECKLIST.md 操作
3. 打开 QUICK_REFERENCE.md 开始编码
```
**预计**: 3-4 小时初始化，8 小时开发

---

#### 🟡 **我是有经验的全栈开发者**
```
1. 读 README.md 了解项目
2. 查 PROJECT_SPEC.md 了解架构
3. 按 PIPELINE.md 规划开发
4. 用 QUICK_REFERENCE.md 编码
```
**预计**: 2 小时初始化，7 天开发

---

#### 🔴 **我是初学者**
```
1. 精读 README.md
2. 仔细按 INIT_CHECKLIST.md 初始化
3. 学习 PROJECT_SPEC.md 理解架构
4. 详细研究 QUICK_REFERENCE.md
5. 按 PIPELINE.md 慢慢开发
```
**预计**: 4-5 小时初始化，12-14 天开发

---

## ✅ 最终检查清单

在开始前，确认你有：

```
□ Python 3.9+ 已安装
□ Node.js 18+ 已安装
□ VS Code 或其他编辑器已打开
□ 6 个文档都在 MenuGen 目录中
□ 3 个 Google API Keys 已准备好
□ 网络连接正常
□ 至少 10GB 空闲硬盘空间
□ 2 个可用的终端窗口
```

---

## 🎉 准备好了吗？

### 下一步行动：

1. **立即行动**: 打开 INIT_CHECKLIST.md，按第 1 步操作
2. **5 分钟后**: 你将完成项目结构
3. **2 小时后**: 所有依赖安装完毕
4. **3 小时后**: 后端和前端都能启动
5. **7 小时后**: 开始编码第一个功能

### 时间线：
```
Now       ─→ Day 1   (初始化)
Day 1     ─→ Day 3   (后端)
Day 3     ─→ Day 6   (前端)
Day 6     ─→ Day 7   (集成)
Day 7     ─→ Day 10  (测试&部署)

Result: 完整的 MenuGen MVP! 🚀
```

---

## 🌟 最后的话

> **这不是一个"指南"，这是一个完整的项目交付。**

你拥有的不仅仅是文档，还有：
- ✅ 完整的代码模板
- ✅ 一步步的初始化指南
- ✅ 详细的开发时间表
- ✅ 完整的 API 规范
- ✅ 文档导航和快速参考

**所以，不用犹豫。打开 INIT_CHECKLIST.md，按照步骤来。**

---

## 🚀 开始 Vibe Coding！

```
        ___
       /   \___
      | ^^^ |
       \_-_/    
         |
       __|__
     /MenuGen\
    🚀 🍜 💻 🎉
```

**下一步**: 打开 [INIT_CHECKLIST.md](INIT_CHECKLIST.md)

**祝你开发愉快！** 🎊

---

**最后更新**: 2026-01-20  
**项目状态**: 📋 文档完成，等待开发  
**预计完成**: 2026-01-30 (10 days)

