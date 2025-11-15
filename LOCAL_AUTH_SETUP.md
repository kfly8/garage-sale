# ローカル環境でOAuth認証をテストする手順

## 1. GitHub OAuth Appの作成

1. https://github.com/settings/developers にアクセス
2. **"New OAuth App"** をクリック
3. 以下の情報を入力:
   - **Application name**: `garage-sale-dev` (任意の名前)
   - **Homepage URL**: `http://localhost:8787`
   - **Authorization callback URL**: `http://localhost:8787/auth/callback`
4. **"Register application"** をクリック
5. **Client ID** をコピー
6. **"Generate a new client secret"** をクリックして **Client Secret** をコピー

## 2. .dev.varsファイルの設定

`.dev.vars`ファイルを編集して、GitHub OAuthの設定を追加します：

```bash
# 既存の設定
TURSO_DATABASE_URL=libsql://garage-sale-kfly8.aws-ap-northeast-1.turso.io
TURSO_AUTH_TOKEN=your-existing-token

# 追加: GitHub OAuth設定
GITHUB_CLIENT_ID=あなたのClient ID
GITHUB_CLIENT_SECRET=あなたのClient Secret
```

## 3. ローカルサーバーの起動

```bash
npm run dev:worker
```

サーバーが `http://localhost:8787` で起動します。

## 4. 認証フローのテスト

### 4.1 ログイン

ブラウザで以下のURLにアクセス：

```
http://localhost:8787/auth/login
```

GitHubのログイン画面にリダイレクトされ、認証後に`http://localhost:8787/`に戻ります。

### 4.2 認証状態の確認

```bash
# ブラウザでログイン後、curlでセッションCookieを使ってテスト
curl http://localhost:8787/auth/me -H "Cookie: session=your-session-token"
```

または、ブラウザの開発者ツールで：
1. Application > Cookies を開く
2. `session` クッキーの値を確認

### 4.3 保護されたエンドポイントのテスト

認証が必要なエンドポイント（プロジェクト作成）をテスト：

```bash
# 認証なし（401エラーになるはず）
curl -X POST http://localhost:8787/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Project",
    "description": "Test",
    "repositoryUrl": "https://github.com/test/repo",
    "languages": ["TypeScript"],
    "isPaid": false
  }'

# 認証あり（ブラウザでログイン後、Cookieを使用）
curl -X POST http://localhost:8787/api/projects \
  -H "Content-Type: application/json" \
  -H "Cookie: session=your-session-token" \
  -d '{
    "name": "Test Project",
    "description": "Test",
    "repositoryUrl": "https://github.com/test/repo",
    "languages": ["TypeScript"],
    "isPaid": false
  }'
```

### 4.4 ログアウト

```
http://localhost:8787/auth/logout
```

## 5. トラブルシューティング

### エラー: "Invalid OAuth callback"

- GitHubのOAuth Appの設定でCallback URLが `http://localhost:8787/auth/callback` になっているか確認
- `.dev.vars`の`GITHUB_CLIENT_ID`と`GITHUB_CLIENT_SECRET`が正しいか確認

### エラー: "Authentication failed"

- ブラウザの開発者ツールでコンソールエラーを確認
- `wrangler dev`のターミナル出力でエラーログを確認

### セッションが保存されない

- ブラウザがCookieを受け入れているか確認
- HTTPS環境でない場合、`secure`フラグが問題になる可能性があるため、開発環境では注意

## 6. ブラウザでのテストフロー

1. `http://localhost:8787/auth/login` にアクセス
2. GitHubでログイン・認証
3. `http://localhost:8787/` にリダイレクト
4. `http://localhost:8787/auth/me` で自分の情報を確認
5. ブラウザの開発者ツールでAPIリクエストを送信してテスト

## 参考: 環境変数の完全な例

```bash
TURSO_DATABASE_URL=libsql://garage-sale-kfly8.aws-ap-northeast-1.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOi...
GITHUB_CLIENT_ID=Ov23li...
GITHUB_CLIENT_SECRET=0a1b2c3d4e5f...
```
