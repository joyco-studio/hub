import { defineConfig, globalIgnores } from 'eslint/config'
import next from "eslint-config-next"
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'

const eslintConfig = defineConfig([
  ...next,
  ...nextTs,
  prettier,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    '.source/**',
    'next-env.d.ts',
  ]),
  {
    rules: {
      '@next/next/no-img-element': 'off',
      'react-hooks/preserve-manual-memoization': 'warn',
    },
  },
])

export default eslintConfig
