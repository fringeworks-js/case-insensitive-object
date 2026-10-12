import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    coverage: { enabled: true },
    typecheck: {
      // `*.test-d.ts`の型アサーションをテストとして実行する
      enabled: true,
      // 利用者の strict モードでの型を確認するため、strict を有効にした設定を使う
      tsconfig: './tsconfig.typecheck.json',
      // link で参照している依存パッケージのソースのエラーは対象外にする
      ignoreSourceErrors: true,
    },
  },
});
