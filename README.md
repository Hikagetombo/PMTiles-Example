# PMTileを使った山岳へのマーカ表示
収集した山岳情報（約24000座）を地図上にマップする方法を簡単に示します。 

## なぜ PMTiles か
GeoJSON により事物を1つ1つ描いて行くには限界があり、Vector Tile 以外にその対策法はないと分かっていながらその技術力が自分にはなくお手上げの状況のまましばらく放置。

そこで思いついたのが「AIに聞いてみよう」でした。AI の提案に従い `.mbtiles` を様々試して見たものの静的サーバ内で当該ファイルへのアクセスが上手くいかず悩んでいた時に、偶然遭遇したのがこの **PMTiles** でした。

xampp 環境であれば、`htdocs` 配下の任意のディレクトリに `pmtiles` を配置すれば **MapLibre GL JS** から通常のファイト同様に読み込むことができます。`.mbtiles` に悪戦苦闘した者にとっては夢を見ている心地がしたものです。性能も全く問題がなく、ストレスを感じさせないレスポンスで処理がなされます。

## 使用するデータ
原始データは SQLite で管理しています。それを JavaScript & PHP で GeoJSON に変換後、tippecanoe で PMTiles に変換しています。

GeoJSON は次のようなものです。
```json
{
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "山名": "ヒヨガラ峰",
                "かな": "ひよがらみね",
                "別名": "",
                "標高": 867.3,
                "所在": "",
                "隣接": "新潟県",
                "備考": ""
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    139.76694444444,
                    38.2875
                ]
            }
        },
```
これを、次のように tippecanoe を用い PMTiles に変換します。


```bash
tippecanoe -f -o japan.pmtiles -Z0 -z8  -pf -pk -l japan_layer 00_全国.json
```
>なお、tippecanoe は残念ながら windows では使用できないので、WSL2 Linux（Ubuntu） を使用します。
>WSL2 の便利なところは、windows ファイルにアクセスが可能なところで、ファイルが「c:\pmtiles\data」にあった場合
```bash
cd /mnt/c/pmtiles/data
```
>によりファイルの存在する場所に移動することができます。

結果は、`.pmtiles` を QGIS にドラッグアンドドロップすれば確認することができます。特に他から入手した `.pmtiles` のレイヤー名を調べる場合には役に立つと思います。

結果は以下の URL をご覧ください。

●山形県

https://hikagetombo.github.io/PMTiles-Example/yamagata/yamagata.html

●日本全体

https://hikagetombo.github.io/PMTiles-Example/japan/japan.html

現在、日本全体の山岳を表示し、ズームレベルを上げると愛知県や中国地方の一部が表示されないという不具合が発生しています。PMTiles の使用法に問題があると思われます。設定値を替えテスト中ですのでご了承願います。

原因は、`glyphs` の設定でした。
開発環境の console に、或るズームレベルを超えると `glyphs` に **404 NotFound** のエラーが発生するので
それを別のものに置き換えたところ全ての地域が正常に表示されるようになりました。
変更箇所は次の通りです。
```js
// (変更前)
    glyphs: 'https://cdn.jsdelivr.net/gh/maptiler/fonts@v1.0.0/fonts/{fontstack}/{range}.pbf',
// (変更後)
    glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
```

## Geocode
地図に検索機能を追加した例を、[第10回「防災マップの作成⑤避難所の検索」](https://zenn.dev/mierune_inc/books/location-engineering/viewer/part10)
を元に作成しました。
検索キーに「中学校」、「コミュニティー」などを入力すると該当する避難所のデータが表示される筈です。（「小学校」がなぜか表示されない。調査中）

●避難所検索

https://hikagetombo.github.io/PMTiles-Example/Geocode/Shelter/index.html

PMTiles から緯度、経度をどのように取得するか分からないので、キーワードと経度・緯度を持つJSON ファイルを読み込んでいます。