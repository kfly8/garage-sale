import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function HomePage() {
  const { user } = useAuth()

  return (
    <div className="space-y-12">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold text-gray-900">
          Garage Sale
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          OSSプロジェクトとメンテナーをマッチングするプラットフォーム
        </p>
        {!user && (
          <div className="pt-4">
            <a
              href="/auth/login"
              className="inline-block bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold"
            >
              GitHub でログイン
            </a>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-4xl mb-4">🚀</div>
          <h3 className="text-xl font-semibold mb-2">Projects</h3>
          <p className="text-gray-600 mb-4">
            メンテナーを探しているOSSプロジェクトを見つけましょう
          </p>
          <Link
            to="/projects"
            className="text-primary hover:text-blue-600 font-medium"
          >
            プロジェクト一覧 →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-4xl mb-4">👨‍💻</div>
          <h3 className="text-xl font-semibold mb-2">Maintainers</h3>
          <p className="text-gray-600 mb-4">
            スキルと経験豊富なメンテナーを探しましょう
          </p>
          <Link
            to="/maintainers"
            className="text-primary hover:text-blue-600 font-medium"
          >
            メンテナー一覧 →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-4xl mb-4">🤝</div>
          <h3 className="text-xl font-semibold mb-2">Matches</h3>
          <p className="text-gray-600 mb-4">
            成立したマッチングを確認できます
          </p>
          <Link
            to="/matches"
            className="text-primary hover:text-blue-600 font-medium"
          >
            マッチング一覧 →
          </Link>
        </div>
      </div>

      <div className="bg-blue-50 p-8 rounded-lg border border-blue-200">
        <h2 className="text-2xl font-bold mb-4">使い方</h2>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="font-semibold mb-1">GitHubでログイン</h3>
              <p className="text-gray-700">
                GitHubアカウントを使って簡単にログインできます
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="font-semibold mb-1">プロジェクトまたはメンテナーを探す</h3>
              <p className="text-gray-700">
                興味のあるプロジェクトやスキルに合ったメンテナーを見つけましょう
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="font-semibold mb-1">マッチングリクエストを送る</h3>
              <p className="text-gray-700">
                気になるプロジェクトやメンテナーにリクエストを送りましょう
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
