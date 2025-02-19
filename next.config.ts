import { NextConfig } from 'next'

const config: NextConfig = {
  /* config options here */
  output: 'standalone', // 将应用程序打包成一个独立的文件
  eslint: {
    ignoreDuringBuilds: true,  // 在构建时忽略 ESLint 错误
  },
  typescript: {
    // ⚠️ 生产构建时忽略类型错误
    ignoreBuildErrors: true,
  },
};

export default config;
