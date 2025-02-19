#!/bin/bash

# 等待数据库准备就绪
./wait-for-it.sh db:5433 -t 60

# 运行数据库迁移
npx prisma migrate deploy

# 启动应用
node server.js 
