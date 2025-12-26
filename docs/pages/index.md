# index.html の動作

## 概要
- トップページ。各セクションの文章や画像はHTML内に固定で配置。
- ヘッダー/フッターは includes から読み込み、広告枠は静的。

## 動的処理
- components.js
  - data-include の header/footer を fetch して挿入。
  - body の data-base を使って data-href を相対補正。
  - data-page="index" を使ってナビの active を付与。
  - assets/data/alerts.json を読み込み、対象ページの警告を main 先頭に挿入。
- 最新ブログ表示
  - assets/data/blog.json を読み込み。
  - publishAt が未来のものは非表示。
  - publishAt/date を基準に新しい順へ並べ、上位3件を表示。
- 本日の競技
  - assets/data/calendar_by_date.json を読み込み。
  - competitiveDates または dates を参照。
  - 今日の日付分から、終了時刻が過去のものを除外して表示。
  - 該当がなければ「本日の競技はありません。」を表示。

## 更新ポイント
- 固定セクションの文言/画像: index.html
- ブログ枠: assets/data/blog.json
- 競技枠: assets/data/calendar_by_date.json
