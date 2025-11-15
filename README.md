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

## テスト

```bash
# テストの実行
npm test

# ウォッチモードでテスト
npm run test:watch

# UIでテスト
npm run test:ui

# カバレッジレポート付きでテスト
npm run test:coverage
```

このプロジェクトでは Vitest を使用してユニットテストを実行しています。全てのAPIエンドポイントに対するテストが含まれています。

## API エンドポイント

### ユーザー

- `GET /api/users` - ユーザー一覧
- `POST /api/users` - ユーザー作成
- `GET /api/users/:id` - ユーザー詳細

### プロジェクト

- `GET /api/projects` - プロジェクト一覧（検索・フィルタリング・ページネーション対応）
  - クエリパラメータ:
    - `language` - 言語でフィルタ (例: `?language=TypeScript`)
    - `status` - ステータスでフィルタ (`open`, `matched`, `closed`)
    - `isPaid` - 有償/無償でフィルタ (`true`, `false`)
    - `sortBy` - ソート項目 (`created_at`, `updated_at`, `name`)
    - `order` - ソート順 (`ASC`, `DESC`)
    - `page` - ページ番号 (デフォルト: 1)
    - `limit` - 1ページあたりの件数 (デフォルト: 10)
- `POST /api/projects` - プロジェクト作成
- `GET /api/projects/:id` - プロジェクト詳細

### メンテナー

- `GET /api/maintainers` - メンテナー一覧（検索・フィルタリング・ページネーション対応）
  - クエリパラメータ:
    - `skill` - スキルでフィルタ (例: `?skill=TypeScript`)
    - `language` - 言語でフィルタ
    - `availability` - 空き状況でフィルタ (`full-time`, `part-time`, `volunteer`)
    - `interestedInPaid` - 有償希望でフィルタ (`true`, `false`)
    - `sortBy` - ソート項目 (`created_at`, `updated_at`, `name`)
    - `order` - ソート順 (`ASC`, `DESC`)
    - `page` - ページ番号 (デフォルト: 1)
    - `limit` - 1ページあたりの件数 (デフォルト: 10)
- `POST /api/maintainers` - メンテナープロフィール作成
- `GET /api/maintainers/:id` - メンテナー詳細

### マッチング

- `GET /api/matches` - マッチング一覧
- `POST /api/matches` - マッチング作成

## 認証

このプロジェクトは GitHub OAuth を使用した認証機能を実装しています。

### GitHub OAuth アプリの設定

1. **GitHub OAuth App の作成**
   - https://github.com/settings/developers にアクセス
   - "New OAuth App" をクリック
   - 以下の情報を入力：
     - Application name: `garage-sale` (任意)
     - Homepage URL: `https://garage-sale.kfly8.workers.dev` (本番環境の場合)
     - Authorization callback URL: `https://garage-sale.kfly8.workers.dev/auth/callback`
   - "Register application" をクリック
   - Client ID と Client Secret を控える

2. **ローカル開発用の OAuth App**
   - 開発用に別の OAuth App を作成することを推奨
   - Authorization callback URL: `http://localhost:8787/auth/callback`

### 認証エンドポイント

- `GET /auth/login` - GitHub OAuth ログインを開始
- `GET /auth/callback` - GitHub OAuth コールバック
- `GET /auth/logout` - ログアウト
- `GET /auth/me` - 現在のユーザー情報を取得

### 保護されたエンドポイント

以下のエンドポイントは認証が必要です：

- `POST /api/projects` - プロジェクト作成（認証されたユーザーが owner になります）

## デプロイ

### Cloudflare Workers

このプロジェクトは Cloudflare Workers にデプロイできます。

#### 前提条件

- Cloudflare アカウント
- Wrangler CLI （プロジェクトに含まれています）
- GitHub OAuth App の作成（上記参照）

#### デプロイ手順

1. **Cloudflare にログイン**

```bash
npx wrangler login
```

2. **環境変数の設定**

本番環境の秘密情報を設定します：

```bash
npx wrangler secret put TURSO_DATABASE_URL
npx wrangler secret put TURSO_AUTH_TOKEN
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET
```

3. **デプロイ**

```bash
npm run deploy
```

4. **ローカルでの動作確認**

Cloudflare Workers 環境をローカルで試すには：

```bash
npm run dev:worker
```

`.dev.vars` ファイルに開発用の環境変数を設定してください：

```
TURSO_DATABASE_URL=<your-database-url>
TURSO_AUTH_TOKEN=<your-auth-token>
GITHUB_CLIENT_ID=<your-github-client-id>
GITHUB_CLIENT_SECRET=<your-github-client-secret>
```

#### デプロイ後

デプロイが完了すると、以下のような URL が表示されます：

```
https://garage-sale.<your-subdomain>.workers.dev
```

この URL にアクセスして API が動作していることを確認してください。

## ライセンス

ISC
