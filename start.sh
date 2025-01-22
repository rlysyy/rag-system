#!/bin/bash

# 等待数据库就�?./wait-for-it.sh db:5432

# 执行 Prisma 迁移，使�?--skip-seed 避免重置数据
echo "Running Prisma migrations..."
npx prisma migrate deploy --skip-seed

# 启动应用
echo "Starting application..."
node server.js 
