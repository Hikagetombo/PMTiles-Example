// PMTilesの、MapLibre GL JS用のプロトコルをグローバルに追加
let protocol = new pmtiles.Protocol();
// addProtocolで、カスタムURLスキーマを使用するときに呼び出される関数を追加する
// pmtiles://~~ が使用されたときに、protocol.tileが呼び出される
maplibregl.addProtocol("pmtiles", protocol.tile);

const map = new maplibregl.Map({
  container: "map",
  center: [140.21050429762454, 38.52931708848691], // 中心座標
  zoom: 6, // ズームレベル
  style: {
    // スタイル仕様のバージョン番号。8を指定する
    version: 8,
    // データソース
    //glyphs: 'https://cdn.jsdelivr.net/gh/maptiler/fonts@v1.0.0/fonts/{fontstack}/{range}.pbf',
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
          //'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          'https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',
        ],
        // タイルの解像度。単位はピクセル、デフォルトは512
        //tileSize: 256,
        tileSize: 512,
        // データの帰属
        attribution:
          //"<a href='https://www.openstreetmap.org/copyright' target='_blank'>© OpenStreetMap contributors</a>",
          //'&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
      },
      "japan": {
        type: "vector",
        // タイルが利用可能な最小ズームレベル
        //minzoom: 2,
        // タイルが利用可能な最大ズームレベル
        //maxzoom: 16,
        // リソースへのURL
        //url: "pmtiles://http://localhost/webapp/maplibre/PMTiles/yamagata.pmtiles",
        //url: "pmtiles://http://localhost/japan.pmtiles",
        url: "pmtiles://japan.pmtiles",
        attribution:
          "© MapTiler © OpenStreetMap contributors",
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
        //source: "background-osm-raster",
        source: "background-gsi-raster",
      },
      // 登記所備付地図データ 間引きなし
      {
        id: "japan_points",
        // 塗りつぶされたポリゴン
        type: "circle",
        source: "japan",
        // ベクトルタイルソースから使用するレイヤ
        "source-layer": "japan_layer",
        paint: {
                'circle-radius': 6,
                'circle-stroke-color':'#0000FF',
                'circle-stroke-width': 1,
                'circle-color': [
                    'step',
                    ['get', '標高'],
                    '#0041f4', 500,
                    '#1991f2', 1000,
                    '#28e6f2', 1500,
                    '#92f20e', 2000,
                    '#f6f00d', 2500,
                    '#f48906', 3000,
                    '#f64604', 3500,
                    '#ff0000'
                ],
            }
       },
       {
          id: 'japan_labels',
          type: 'symbol',
          source: 'japan',               // ベクトルタイルのソース
          'source-layer': 'japan_layer', // レイヤー名
          layout: {
              'icon-image': '', //アイコン画像は使わない
              'text-font': ['Noto Sans Regular'], // 表示するフォント
              //'text-size': ['interpolate',['linear'],['zoom'],5,8,8,11,15,18], //テキストサイズはズームレベルに応じて指定
              'text-size': 11, //テキストサイズはズームレベルに応じて指定
              'text-anchor': 'top', // テキストのアンカーを上部に設定
              'text-offset': [0, 0.5], // マーカーからの相対的な位置 (Y軸方向に下に1em)
              'text-field': ['format',['get', '山名'],{'text-color':'#0000FF'}] // '山名'プロパティをテキストとして表示
          },
          paint: {
              'text-color': '#000000',
              'text-halo-color': '#ffffff', // テキストの縁取り
              'text-halo-width': 2
          }
       }
    ],
  },
});

    // マウスクリックイベント
map.on('click', 'japan_points', function (e) {
    // この行を追加して、クリック時にログが出るか確認
    //console.log("Click event fired!");
    // この行を追加して、e.featuresの中身を確認
    //console.log("e.features:", e.features);
    if (!e.features.length) {
        return;
    }

    const feature = e.features[0];
    const coord = feature.geometry.coordinates;
    const { 山名, かな, 別名, 標高, 所在, 隣接, 名山, 備考 } = feature.properties;

    const htmlContent = `
        <div>
            <p><strong>${山名}</strong><br>
            かな：${かな}<br>
            別名：${別名 || 'なし'}<br>
            緯度：${coord[1]}<br>
            経度：${coord[0]}<br>
            標高：${標高}m<br>
            所在地：${所在}<br>
            隣接：${隣接 || 'なし'}<br>
            名山：${名山}</p>
        </div>
    `;

    new maplibregl.Popup()
    //new Popup()
        .setLngLat(coord)
        .setHTML(htmlContent)
        .addTo(map);
});

// マウスオーバー時のカーソル変更
map.on('mouseenter', 'japan_points', function(e) {
    // この行を追加して、クリック時にログが出るか確認
    //console.log("mouseenter event fired!");
    // この行を追加して、e.featuresの中身を確認
    //console.log("e.features:", e.features);

    map.getCanvas().style.cursor = 'default';
});

map.on('mouseleave', 'yamagata_points', function(e) {
    // この行を追加して、クリック時にログが出るか確認
    //console.log("mouseleave event fired!");
    // この行を追加して、e.featuresの中身を確認
    //console.log("e.features:", e.features);
    map.getCanvas().style.cursor = '';
});

map.on('load', () => {
    const currentZoom = map.getZoom();
    console.log("Current zoom level:", currentZoom);
});

// You can also get the zoom level at any point after the map has loaded
// For example, in response to a user interaction or an event:
map.on('zoomend', () => {
    const newZoom = map.getZoom();
    console.log("Zoom level after change:", newZoom);
});