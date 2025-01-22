# 构建阶段
FROM node:18-alpine AS builder
WORKDIR /app

# 安装 prisma 依赖
RUN apk add --no-cache libc6-compat
RUN apk update

# 复制项目文件
COPY package*.json ./
COPY prisma ./prisma/

# 安装依赖
RUN npm install

# 生成 Prisma 客户�?
RUN npx prisma generate

# 复制其余文件
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# 安装 wait-for-it 脚本依赖
RUN apk add --no-cache bash postgresql-client

# 复制 wait-for-it 脚本和启动脚�?
COPY wait-for-it.sh .
COPY start.sh .
RUN chmod +x wait-for-it.sh start.sh

# 复制必要文件
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 使用启动脚本
CMD ["./start.sh"] 
