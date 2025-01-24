This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 开发指南

1. **组件开发**
   - 使用 shadcn/ui 组件库
   - 遵循函数式组件规范
   - 使用 TypeScript 类型定义

2. **数据库操作**
   - 使用 Prisma ORM
   - 遵循数据库迁移流程

3. **认证流程**
   - 基于 Auth.js 实现
   - 支持多种认证方式

## 部署

1. **准备工作**
   - 配置环境变量
   - 准备数据库
   - 配置域名和 SSL

2. **Docker 部署**
   ```bash
   # 构建镜像
   docker build -t rag-system .
   
   # 运行容器
   docker-compose up -d
   ```

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交变更
4. 发起 Pull Request

## 许可证

[MIT License](LICENSE)

## 联系方式

- 维护者: [Your Name]
- Email: [Your Email]
