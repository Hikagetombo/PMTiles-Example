// PMTilesの、MapLibre GL JS用のプロトコルをグローバルに追加
let protocol = new pmtiles.Protocol();
// addProtocolで、カスタムURLスキーマを使用するときに呼び出される関数を追加する
// pmtiles://~~ が使用されたときに、protocol.tileが呼び出される
maplibregl.addProtocol("pmtiles", protocol.tile);

const map = new maplibregl.Map({
  container: "map",
  center: [139.1535186767578, 35.789411871184581], // 中心座標
  zoom: 10, // ズームレベル
  style: {
    // スタイル仕様のバージョン番号。8を指定する
    version: 8,
    // データソース
    glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
    sources: {
      // 背景地図 OpenStreetMapのラスタタイル
      //"background-osm-raster": {
      "background-gsi-raster": {
       // ソースの種類。vector、raster、raster-dem、geojson、image、video のいずれか
        type: "raster",
        // タイルソースのURL
        tiles: [
          //"https://tile.openstreetmap.jp/styles/osm-bright-ja/{z}/{x}/{y}.png",
          'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          //'https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',
        ],
        // タイルの解像度。単位はピクセル、デフォルトは512
        tileSize: 256,
        // データの帰属
        attribution:
          //"<a href='https://www.openstreetmap.org/copyright' target='_blank'>© OpenStreetMap contributors</a>",
          '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          //"<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
      },
        
      "bear": {
        type: "vector",
        url: "pmtiles://bear.pmtiles",
        attribution:
          "© Tsuchida",
      },
    },
    // 表示するレイヤ
    layers: [
      // 背景地図としてOpenStreetMapのラスタタイルを追加
      {
        // 一意のレイヤID
        //id: "background-osm-raster",
        id: "background-gsi-raster",
        // レイヤの種類。background、fill、line、symbol、raster、circle、fill-extrusion、heatmap、hillshade のいずれか
        type: "raster",
        // データソースの指定
        source: "background-gsi-raster",
      },

      {
        id: "bear_points",
        // 塗りつぶされたポリゴン
        type: "circle",
        source: "bear",
        // ベクトルタイルソースから使用するレイヤ
        "source-layer": "bear_layer",
        paint: {
                'circle-radius': 6,
                'circle-stroke-color':'#eee',
                'circle-stroke-width': 2,
                'circle-color':[
                  "match",
                  ['get',   'accuracy'],
                  'high',   '#ff0000',
                  'middle', '#ffff00',
                  'low',    '#3399ff',
                  '#cccccc'
                ]
         }
       },
    ],
  },
});


// マウスクリックイベント
map.on('click', 'bear_points', function (e) {
    // この行を追加して、クリック時にログが出るか確認
    //console.log("Click event fired!");
    // この行を追加して、e.featuresの中身を確認
    //console.log("e.features:", e.features);
    if (!e.features.length) {
        return;
    }

    const feature = e.features[0];
    //console.log(`${feature.properties['date']}`);
    const coord = feature.geometry.coordinates;
    const { number, date, accuracy, sightings } = feature.properties;
    console.log(`${number}, ${date}, ${accuracy}, ${sightings}`);
    const htmlContent = `
        <div>
            <p>日時：${date}<br>
            緯度：${coord[1]}<br>
            経度：${coord[0]}<br>
            確度：${accuracy}<br>
            目撃：${sightings}</p>
        </div>
    `;

    new maplibregl.Popup()
    //new Popup()
        .setLngLat(coord)
        .setHTML(htmlContent)
        .addTo(map);
});

// マウスオーバー時のカーソル変更
map.on('mouseenter', 'bear_points', function(e) {
    // この行を追加して、クリック時にログが出るか確認
    //console.log("mouseenter event fired!");
    // この行を追加して、e.featuresの中身を確認
    //console.log("e.features:", e.features);

    map.getCanvas().style.cursor = 'default';
});

map.on('mouseleave', 'bear_points', function(e) {
    // この行を追加して、クリック時にログが出るか確認
    //console.log("mouseleave event fired!");
    // この行を追加して、e.featuresの中身を確認
    //console.log("e.features:", e.features);
    map.getCanvas().style.cursor = '';
});
