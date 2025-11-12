// PMTilesの、MapLibre GL JS用のプロトコルをグローバルに追加
let protocol = new pmtiles.Protocol();
// addProtocolで、カスタムURLスキーマを使用するときに呼び出される関数を追加する
// pmtiles://~~ が使用されたときに、protocol.tileが呼び出される
maplibregl.addProtocol("pmtiles", protocol.tile);

// ------------------------------------------------------------
// 検索インデックス（GeoJSON Featureのリスト）を読み込む
// ------------------------------------------------------------
let mountIndexFeatures = [];
const INDEX_FILE_PATH = './yamagata_mount_index.json'; // 避難所のGeoJSON Featureリストを含むファイルパス

fetch(INDEX_FILE_PATH)
    .then(response => {
        if (!response.ok) {
            throw new Error(`ファイルの読み込みに失敗しました: ${INDEX_FILE_PATH}, ${response.statusText}`);
        }
        // GeoJSON Feature Collection全体ではなく、Featureの配列が直接入っている想定
        return response.json(); 
    })
    .then(data => {
        mountIndexFeatures = data;
        console.log(`避難所検索インデックス (${mountIndexFeatures.length}件) を読み込みました。`);
    })
    .catch(e => {
        console.error("インデックスファイルの読み込み中にエラーが発生しました:", e);
    });

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
        tileSize: 256,
        // データの帰属
        attribution:
          //"<a href='https://www.openstreetmap.org/copyright' target='_blank'>© OpenStreetMap contributors</a>",
          //'&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
      },
      "yamagata": {
        type: "vector",
        // タイルが利用可能な最小ズームレベル
        //minzoom: 2,
        // タイルが利用可能な最大ズームレベル
        //maxzoom: 16,
        // リソースへのURL
        //url: "pmtiles://http://localhost/webapp/maplibre/PMTiles/yamagata.pmtiles",
        //url: "pmtiles://http://localhost/yamagata.pmtiles",
        url: "pmtiles://yamagata.pmtiles",
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
        source: "background-gsi-raster",
      },
      // 登記所備付地図データ 間引きなし
      {
        id: "yamagata_points",
        // 塗りつぶされたポリゴン
        type: "circle",
        source: "yamagata",
        // ベクトルタイルソースから使用するレイヤ
        "source-layer": "yamagata_layer",
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
          id: 'yamagat_labels',
          type: 'symbol',
          source: 'yamagata', // ベクトルタイルのソース
          'source-layer': 'yamagata_layer', // レイヤー名
          layout: {
              'icon-image': '', //アイコン画像は使わない
              'text-font': ['Noto Sans Regular'], // 表示するフォント
              'text-size': ['interpolate',['linear'],['zoom'],5,8,8,11,15,18], //テキストサイズはズームレベルに応じて指定
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

// カスタムGeocoding APIオブジェクトの定義
const customGeocoderApi = {
    /**
     * @param {object} config - MapLibre Geocoderが渡す設定オブジェクト
     * @param {string} config.query - ユーザーが入力した検索文字列
     */
    forwardGeocode: async (config) => {
        const query = config.query.toLowerCase().trim();
        const features = [];

        if (query.length === 0) {
            return { features: [] };
        }

        // 検索インデックスから、クエリに一致するものをフィルタリング
        const results = mountIndexFeatures.filter(feature => {
            // GeoJSONのpropertiesから避難所名を取得
            const name = feature.properties['山名'];
            return name && name.toLowerCase().includes(query);
        });

        // MapLibre Geocoderが期待する形式（Carmen GeoJSONライク）に変換
        for (const feature of results) {
            const name = feature.properties['山名'];
            const address = feature.properties['所在'];
            // 座標は [経度, 緯度] の順序で格納されている
            const coordinates = feature.geometry.coordinates; 

            features.push({
                type: 'Feature',
                geometry: feature.geometry, // GeoJSONのgeometryをそのまま利用
                // MapLibre Geocoderの結果フィールド
                place_name: `${name} (${address})`, // 施設名と住所を組み合わせて表示
                text: name,                         // 検索バーに設定される短いテキスト
                center: coordinates,
                properties: feature.properties      // 独自のpropertiesをそのまま格納
            });
        }
        
        // 検索結果を返す
        return { features: features };
    }
};

// マップの初期ロード完了時に発火するイベント
/* global  OpacityControl */
map.on('load', () => {
    const geocoder = new MaplibreGeocoder(customGeocoderApi, {
        maplibregl: maplibregl,       
        showResultsWhileTyping: true,   // 入力中に候補を表示
        marker: true,                   // マーカーを表示する
        placeholder: "山名を検索...", // プレースホルダー
        // 検索結果をクリックした際に、place_nameを使って表示を更新します
        // place_name: (item) => item.place_name 
    });
    map.addControl(geocoder, 'top-left');
});


    // マウスクリックイベント
map.on('click', 'yamagata_points', function (e) {
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
map.on('mouseenter', 'yamagata_points', function(e) {
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
