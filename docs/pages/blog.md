# blog.html の動作

## 概要
- ブログ一覧ページ。注目記事と最新記事の一覧を表示。
- ヘッダー/フッターは includes から読み込み。

## 動的処理
- blog.js
  - assets/data/blog.json と assets/data/tags.json を読み込み。
  - publishAt が未来の投稿は非表示。
  - publishAt/date を基準に新しい順へ並べ替え。
  - featuredPostId="post-004" を注目記事として表示。
  - ページングは 15件/ページ。
  - タグフィルターで一覧を絞り込み。
  - 読み込み失敗時はエラーメッセージを表示。
- components.js
  - data-include の header/footer を読み込み。
  - data-page="blog" でナビの active を付与。
  - data-base を使って data-href を相対補正。

## 更新ポイント
- 記事一覧/注目記事: assets/data/blog.json
- タグ表記: assets/data/tags.json
