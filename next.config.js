/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // 将应用程序打包成一个独立的文件
  eslint: {
    ignoreDuringBuilds: true,  // 在构建时忽略 ESLint 错误
  },
}

module.exports = nextConfig 