# OSS Maintainer Matching Service

OSSのメンテナーを募集したい人と、メンテナーになりたい人をマッチングするサービスです。

## 機能

- **プロジェクト登録**: メンテナーを募集したいOSSプロジェクトを登録
- **メンテナープロフィール**: メンテナー希望者のスキルや経験を登録
- **マッチング**: プロジェクトとメンテナーをマッチング
- **GitHub連携**: GitHub OAuthによる認証（予定）

## 技術スタック

- **フレームワーク**: Hono
- **言語**: TypeScript
- **ランタイム**: Node.js

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# 本番サーバーの起動
npm start
```

## API エンドポイント

### プロジェクト

- `GET /api/projects` - プロジェクト一覧
- `POST /api/projects` - プロジェクト作成
- `GET /api/projects/:id` - プロジェクト詳細

### メンテナー

- `GET /api/maintainers` - メンテナー一覧
- `POST /api/maintainers` - メンテナープロフィール作成
- `GET /api/maintainers/:id` - メンテナー詳細

### マッチング

- `GET /api/matches` - マッチング一覧
- `POST /api/matches` - マッチング作成

## ライセンス

ISC
