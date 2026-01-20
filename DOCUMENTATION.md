# MenuGen - 项目文档总览

## 📚 完整文档导航

本项目包含 **5 个关键文档**，按照开发流程优先级排列：

### 🚀 **1. 快速上手** (从这里开始)

**文档**: [INIT_CHECKLIST.md](INIT_CHECKLIST.md)

- ✅ 项目初始化完整步骤
- ✅ 目录结构创建
- ✅ 依赖安装指南
- ✅ 环境变量配置
- ✅ 快速验证和启动命令

**何时使用**: 
- 第一次设置项目
- 新开发者加入
- 环境重置

---

### 📋 **2. 项目规范** (理解项目)

**文档**: [PROJECT_SPEC.md](PROJECT_SPEC.md)

- 项目目标和架构
- 完整的系统设计
- API 端点规范
- 数据模型定义
- 关键实现细节
- 错误处理策略
- 性能指标

**何时使用**:
- 理解项目整体设计
- 参考 API 文档
- 讨论架构决策

---

### 🗓️ **3. 开发流程表** (按部就班)

**文档**: [PIPELINE.md](PIPELINE.md)

- 📅 详细时间规划 (10 天 MVP)
- 📊 各阶段任务清单
- 🔧 Phase-by-Phase 指导
- ⏱️ 每个任务的预期时间
- ✅ 完成标准和验收指标

**8 个开发阶段**:
1. 项目初始化 (Day 1)
2. 后端核心模块 (Day 2-3)
3. 后端 API 层 (Day 4)
4. 前端 UI 组件 (Day 5-6)
5. 前后端集成 (Day 7)
6. 部署 & 优化 (Day 8)
7. 测试 & 文档 (Day 9)
8. 收尾 (Day 10)

**何时使用**:
- 开始每个开发阶段
- 跟踪项目进度
- 估计剩余工作量

---

### 💻 **4. 快速参考库** (复制粘贴代码)

**文档**: [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

- 🎯 完整的代码模板
- 后端模块代码 (schemas, config, llm_service, search_service, main)
- 前端组件代码 (App.jsx, MenuCard.jsx)
- UI 预设样式库
- 开发检查清单
- 常见问题排查

**包含完整代码**:
- ✅ `backend/schemas.py` - Pydantic 模型
- ✅ `backend/config.py` - 配置管理
- ✅ `backend/services/llm_service.py` - Gemini 调用
- ✅ `backend/services/search_service.py` - 异步搜索
- ✅ `backend/main.py` - FastAPI 应用
- ✅ `frontend/src/App.jsx` - React 主组件
- ✅ `frontend/src/components/MenuCard.jsx` - 卡片组件

**何时使用**:
- 编写代码时快速查阅
- 复制粘贴代码框架
- 查找样式预设

---

### 📖 **5. 项目概览** (总体了解)

**文档**: [README.md](README.md)

- 🎯 项目核心特性
- 🏗️ 系统架构图
- 🚀 快速开始指南
- 🛠️ 技术栈列表
- 📊 性能指标
- 🔌 API 端点说明
- 🐛 常见问题解答
- 📚 学习资源

**何时使用**:
- 项目概览
- 向团队演示
- 查看基本使用方法

---

## 🎯 不同角色的文档使用指南

### 👨‍💻 **新开发者**
1. 读 [README.md](README.md) - 了解项目
2. 跟着 [INIT_CHECKLIST.md](INIT_CHECKLIST.md) - 初始化环境
3. 查看 [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - 学习代码
4. 跟随 [PIPELINE.md](PIPELINE.md) - 开始开发

### 🎓 **项目经理 / 技术主管**
1. 读 [README.md](README.md) - 项目概览
2. 查看 [PROJECT_SPEC.md](PROJECT_SPEC.md) - 技术规范
3. 参考 [PIPELINE.md](PIPELINE.md) - 进度追踪
4. 根据需要查看其他文档

### 🏗️ **架构师 / 技术设计**
1. 深入阅读 [PROJECT_SPEC.md](PROJECT_SPEC.md) - 完整规范
2. 参考 [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - 实现细节
3. 查看代码模板 - 验证可行性

### 🐛 **测试 / QA**
1. 读 [README.md](README.md) - 功能概览
2. 参考 [PROJECT_SPEC.md](PROJECT_SPEC.md) - API 规范
3. 使用 [INIT_CHECKLIST.md](INIT_CHECKLIST.md) - 搭建测试环境
4. 参考 [PIPELINE.md](PIPELINE.md) - 验收标准

---

## 📊 文档关系图

```
新开发者 ────→ README.md (项目概览)
      │
      ├────→ INIT_CHECKLIST.md (初始化)
      │
      ├────→ QUICK_REFERENCE.md (代码参考)
      │
      └────→ PIPELINE.md (开发步骤)
             │
             └────→ PROJECT_SPEC.md (详细规范)


项目经理 ────→ README.md (概览)
      │
      ├────→ PROJECT_SPEC.md (规范)
      │
      └────→ PIPELINE.md (进度)


架构师 ──────→ PROJECT_SPEC.md (规范)
      │
      └────→ QUICK_REFERENCE.md (代码)
```

---

## ⏱️ 快速启动时间表

### 📅 Day 1: 环境搭建
**预计**: 3-4 小时
- 阅读 [README.md](README.md) (15 分钟)
- 跟着 [INIT_CHECKLIST.md](INIT_CHECKLIST.md) 初始化 (2-3 小时)
- 验证所有依赖安装 (30 分钟)
- ✅ 能启动后端和前端

### 📅 Day 2-3: 后端开发
**预计**: 8-10 小时
- 参考 [PIPELINE.md](PIPELINE.md) Phase 2 & 3
- 使用 [QUICK_REFERENCE.md](QUICK_REFERENCE.md) 的代码模板
- 实现 schemas, config, llm_service, search_service
- ✅ 后端能接收请求并调用 Gemini + Google Search

### 📅 Day 4-5: 前端开发
**预计**: 8-10 小时
- 参考 [PIPELINE.md](PIPELINE.md) Phase 4
- 使用 [QUICK_REFERENCE.md](QUICK_REFERENCE.md) 的 React 组件
- 实现 MenuUpload, MenuCard, MenuGrid 等
- ✅ 前端能上传图片并显示结果

### 📅 Day 6-7: 集成与优化
**预计**: 6-8 小时
- 参考 [PIPELINE.md](PIPELINE.md) Phase 5
- 完整流程测试
- UI/UX 优化
- ✅ 完整功能运行 + 性能达标

### 📅 Day 8+: 测试与部署
**预计**: 4-6 小时
- 参考 [PIPELINE.md](PIPELINE.md) Phase 6 & 7
- 单元测试
- E2E 测试
- 部署准备
- ✅ MVP 完成并可部署

---

## 🔑 关键概念速查

### 什么是 Gemini Vision API？
→ 见 [PROJECT_SPEC.md](PROJECT_SPEC.md) 第 5.1 节

### 如何并发搜索？
→ 见 [QUICK_REFERENCE.md](QUICK_REFERENCE.md) 第 4 节 & [PROJECT_SPEC.md](PROJECT_SPEC.md) 第 5.3 节

### 前后端数据流？
→ 见 [PROJECT_SPEC.md](PROJECT_SPEC.md) 第 3.1 & 3.2 节

### React 组件结构？
→ 见 [QUICK_REFERENCE.md](QUICK_REFERENCE.md) 第 6-7 节

### 环境变量怎么配？
→ 见 [INIT_CHECKLIST.md](INIT_CHECKLIST.md) 第 3 步 & [PROJECT_SPEC.md](PROJECT_SPEC.md) 第 6 节

### API 端点详情？
→ 见 [PROJECT_SPEC.md](PROJECT_SPEC.md) 第 4 节 & [README.md](README.md) 的 API 部分

---

## 🎯 Vibe Coding 建议

### 💡 推荐开发流程
1. **不要跳过初始化** - 用 [INIT_CHECKLIST.md](INIT_CHECKLIST.md) 一步步来
2. **边看边写** - 打开 [QUICK_REFERENCE.md](QUICK_REFERENCE.md) 复制代码
3. **定期参考** - 遇到问题查阅 [PROJECT_SPEC.md](PROJECT_SPEC.md)
4. **跟进进度** - 用 [PIPELINE.md](PIPELINE.md) 的检查清单追踪

### ⚡ 加速开发技巧
- 使用 [QUICK_REFERENCE.md](QUICK_REFERENCE.md) 的完整代码模板
- 一次创建所有必要的目录和文件
- 并行启动后端和前端开发
- 测试时使用真实菜单图片

### 🛑 常见陷阱
- ❌ 跳过 `.env` 配置 - 会导致 API 密钥错误
- ❌ 忘记激活虚拟环境 - 会安装到系统 Python
- ❌ 前后端端口冲突 - 检查 localhost 可用性
- ❌ CORS 配置不匹配 - 导致跨域错误

---

## 📞 快速查询

| 问题 | 查看文档 | 位置 |
|------|---------|------|
| 项目是干什么的？ | README.md | 顶部 |
| 怎么初始化项目？ | INIT_CHECKLIST.md | 第 1-6 步 |
| API 怎么调用？ | PROJECT_SPEC.md | 第 4 节 |
| 代码怎么写？ | QUICK_REFERENCE.md | 各模块代码 |
| 开发要多久？ | PIPELINE.md | 时间表 |
| 环境变量怎么设？ | INIT_CHECKLIST.md | 第 3 步 |
| 出了错怎么办？ | QUICK_REFERENCE.md | 常见问题 |
| 下一步干什么？ | PIPELINE.md | 当前 Phase |
| 需要什么工具？ | INIT_CHECKLIST.md | 前置条件 |
| 如何验证安装？ | INIT_CHECKLIST.md | 第 6 步 |

---

## ✨ 文档更新日志

| 日期 | 文档 | 更新内容 |
|------|------|---------|
| 2026-01-20 | All | 初始版本创建 |
| | README.md | 项目总览 |
| | PROJECT_SPEC.md | 完整规范 |
| | PIPELINE.md | 开发流程 |
| | QUICK_REFERENCE.md | 代码模板 |
| | INIT_CHECKLIST.md | 初始化步骤 |

---

## 🚀 现在就开始！

### ✅ 第 0 步：打开这个文件 (你现在在这)

### ✅ 第 1 步：阅读 [README.md](README.md)
了解 MenuGen 是什么以及为什么你需要它。(5 分钟)

### ✅ 第 2 步：跟着 [INIT_CHECKLIST.md](INIT_CHECKLIST.md)
一步步初始化你的开发环境。(3-4 小时)

### ✅ 第 3 步：启动后端 + 前端
```bash
# 后端
cd backend && source venv/bin/activate && uvicorn main:app --reload

# 前端
cd frontend && npm run dev
```

### ✅ 第 4 步：参考 [PIPELINE.md](PIPELINE.md) 开始 Phase 1
开始你的 vibe coding 之旅！

### ✅ 第 5 步：当卡住时打开 [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
查找代码模板和快速参考。

---

## 📌 重要提醒

> ⭐ **这是一个完整的项目文档套装，所有所需的代码、配置和指导都在这 5 个文件中！**

- ✅ 没有"神秘"的缺失步骤
- ✅ 所有代码都有注释
- ✅ 时间表很现实
- ✅ 可以完全离线开发（获得 API Keys 后）

**祝你开发愉快！** 🎉

如有问题，查阅相应的文档部分。所有内容都已准备好帮助你成功！

---

**最后更新**: 2026-01-20  
**文档版本**: 1.0  
**项目版本**: 1.0 (MVP)

