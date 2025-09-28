# PMTileを使った山岳へのマーカ表示
収集した山岳情報（約24000座）を地図上にマップします。 

GeoJSONによるマッピングでは性能上に問題があり、最終的にこの**PMTile**が最も扱いやすく、性能も問題ないとの結論に至りました。

原始データは SQLite で、それを JavaScript & PHP で GeoJSON に変換後、tippecanoe で PMTiles にしています。

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
結果は、`.pmtiles` を QGIS にドラッグアンドドロップすれば確認することができます。特に他から入手した `.pmtiles` のレイヤー名を調べる場合には役に立つと思います。

結果は以下の URL をご覧ください。

●山形県

https://hikagetombo.github.io/PMTiles-Example/yamagata/yamagata.html

●日本全体

https://hikagetombo.github.io/PMTiles-Example/japan/japan.html

現在、日本全体の山岳を表示し、ズームレベルを上げると愛知県や中国地方の一部が表示されないという不具合が発生しています。PMTiles の使用法に問題があると思われます。設定値を替えテスト中ですのでご了承名がいます。