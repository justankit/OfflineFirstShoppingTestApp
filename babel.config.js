module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src',
          '@/components': './src/components',
          '@/screens': './src/screens',
          '@/navigation': './src/navigation',
          '@/services': './src/services',
          '@/types': './src/types',
          '@/store': './src/store',
          '@/hooks': './src/hooks',
          '@/assets': './src/assets',
          '@/contexts': './src/contexts',
        },
      },
    ],
  ],
};
