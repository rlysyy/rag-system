#!/bin/bash

# 等待数据库准备就绪
./wait-for-it.sh db:5432

# 运行数据库迁移
npx prisma migrate deploy

# 启动 Next.js 应用
node server.js