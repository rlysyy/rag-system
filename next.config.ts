import { NextConfig } from 'next'

const config: NextConfig = {
  /* config options here */
  output: 'standalone', // 将应用程序打包成一个独立的文件
  eslint: {
    ignoreDuringBuilds: true,  // 在构建时忽略 ESLint 错误
  },
};

export default config;
