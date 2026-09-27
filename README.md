# 目薬ゲーム

スマートフォン縦画面の目薬タイミングゲーム。液滴が約0.85秒後に届く未来のまばたきを読み、目の中央へ落とします。

## 遊び方

「はじめる」後、ゲーム画面をタップして1滴を落とします。約0.26秒ごとに最大3滴まで連続投下できます。到達時に十分に開眼していれば、黒目は `PERFECT!`（+10点）、虹彩は `VERY GOOD!`（+5点）、白目は `GOOD!`（+1点）、目の外は `MISS`（-5点）です。閉じたまぶたなら位置にかかわらず `CLOSE!`（-5点）。目は充血から始まり、成功するほど白く回復します。30秒後に点数・挑戦数・成功率を表示します。

## 技術構成・起動

依存なしの HTML / CSS / Canvas / JavaScript です。任意の静的サーバーでこのディレクトリを公開するか、`index.html` を開いてください。例: `npx serve .`

音は外部ファイルを使わず、Web Audio APIで合成しています。「はじめる」を押すとBGMが始まり、投下・判定・結果に効果音が鳴ります。

## デプロイ

Cloudflare Workers Static Assets、Vercel、GitHub Pages へ公開できます。Cloudflare Workersでは `npm install` 後に `npm run deploy` を実行すると、`https://game.chozo.net/megusuri/` に配信する設定です。

## ゲームパラメータ

`game.js` 冒頭の `CONFIG` に集約しています。`bottleSpeed`（開始時の横移動）、`bottleSpeedRamp`（終盤の加速倍率。現在は開始時の5倍）、`dropDurationMs`（到達時間）、`shotCooldownMs` / `maxDrops`（連続投下）、`eyeOpenMs`・各 blink 値（まばたき）、`pupilWidth` / `irisWidth` / `eyeWidth`（判定幅）、`playMs`（制限時間）を調整できます。

## 開発タスク

- [x] Phase 1
  - [x] 縦画面・目薬左右移動・予測できるまばたき
  - [x] 液滴・連続投下・PERFECT / VERY GOOD / GOOD / MISS / CLOSE 判定
- [x] Phase 2
  - [x] START・カウントダウン・30秒タイマー・結果・リトライ
- [x] Phase 3（最小演出）
  - [x] 成功時の粒・MISS の落下・CLOSE の跳ね返り
- [ ] 実機で難易度を微調整
- [x] BGM・効果音
- [ ] コンボ・ハイスコア保存

## 今後のアイデア

難易度別まばたき、表情/目薬スキン、効果音・振動、ランキング。
