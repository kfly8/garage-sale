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
- **データベース**: Turso (libSQL)

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Tursoのセットアップ

```bash
# Turso CLIのインストール（初回のみ）
curl -sSfL https://get.tur.so/install.sh | bash

# ログイン（初回のみ）
turso auth login

# データベースの作成
turso db create garage-sale

# データベースURLとトークンを取得
turso db show garage-sale --url
turso db tokens create garage-sale

# .envファイルを作成
# TURSO_DATABASE_URL=<your-database-url>
# TURSO_AUTH_TOKEN=<your-auth-token>

# スキーマの適用
cat schema.sql | turso db shell garage-sale
```

### 3. サーバーの起動

```bash
# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# 本番サーバーの起動
npm start
```

## API エンドポイント

### ユーザー

- `GET /api/users` - ユーザー一覧
- `POST /api/users` - ユーザー作成
- `GET /api/users/:id` - ユーザー詳細

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
