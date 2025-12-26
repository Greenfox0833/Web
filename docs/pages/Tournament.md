# Tournament.html の動作

## 概要
- 競技スケジュールの一覧と詳細モーダルを表示するページ。
- ヘッダー/フッターは includes から読み込み。

## 動的処理
- データ読み込み
  - assets/data/tournament_media.json: 画像やラベルの辞書。
  - assets/data/calendar_by_date.json: 日付ごとの大会一覧。
  - assets/data/calendar_by_date_details.json: 詳細情報。
  - assets/data/scoringRuleSets.json: スコアリング。
  - assets/data/payoutTables.json: 報酬テーブル。
- 本日の競技
  - 今日の entries から終了時刻が過去のものを除外して表示。
- フィルター
  - 月別チップと大会名セレクトで絞り込み。
  - 表示中の日付群から大会名候補を再生成。
- モーダル
  - カードの「詳細を確認」をクリックすると詳細モーダルを開く。
  - 画面幅 600px 以下ではモーダルを無効化 (disableMobileModal=true)。
  - 報酬タブ/ポイントタブ、報酬セグメント切り替えに対応。
  - 報酬画像クリックでライトボックス表示。
  - Esc/×/背景クリックで閉じる。

## 更新ポイント
- 競技データ/報酬データ: assets/data 以下の各JSON
- 表示文言/レイアウト: Tournament.html / assets/css/style.css
