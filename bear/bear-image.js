// PMTilesの、MapLibre GL JS用のプロトコルをグローバルに追加
let protocol = new pmtiles.Protocol();
// addProtocolで、カスタムURLスキーマを使用するときに呼び出される関数を追加する
// pmtiles://~~ が使用されたときに、protocol.tileが呼び出される
maplibregl.addProtocol("pmtiles", protocol.tile);

// 3つの loadImage と addImage が完了した後に実行する関数
function addBearPointsLayer() {
    map.addLayer({
        id: "bear_points",
        type: 'symbol',
        source: 'bear',
        "source-layer": "bear_layer", // 前回の修正
        layout: {
            'icon-image': [
                "match",
                ["get",   "accuracy"],
                "high",   "red-icon",
                "middle", "yellow-icon",
                "low",    "blue-icon",
                ""
            ],
            'icon-size': 0.5,
            'icon-allow-overlap': true,
        }
    });
    // その他の初期化処理もここで行えます
}

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
      // 登記所備付地図データ 間引きなし
      /*
      {
        id: "bear_points",
        type: 'symbol',
        source: 'bear',
        "source-layer": "bear_layer",
        layout: {
            // データに応じてアイコンIDを切り替える
            'icon-image': [
                "match",
                ["get",   "accuracy"], // ★ データの属性名に置き換えてください
                 "high",   "red-icon",
                 "middle", "yellow-icon",
                 "low",    "blue-icon",
                 ""                       // どの値にも一致しない場合のデフォルト（ここではアイコンなし）
            ],
            'icon-size': 0.8,
            'icon-allow-overlap': true,
        }
        */
        // 塗りつぶされたポリゴン
        /*
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
       */
    ],
  },
});

// symbol icon の読込み
map.on('load', async function () {
  image = await map.loadImage('./images/bear-violet.png');
  map.addImage('red-icon', image.data);

  image = await map.loadImage('./images/bear-yellow.png');
  map.addImage('yellow-icon', image.data);

  image = await map.loadImage('./images/bear-blue.png');
  map.addImage('blue-icon', image.data);

  addBearPointsLayer();
});

// マウスクリックイベント
map.on('click', 'bear_points', function (e) {
    if (!e.features.length) {
        return;
    }

    const feature = e.features[0];
    const coord = feature.geometry.coordinates;
    const { number, date, accuracy, sightings } = feature.properties;
    let kakudo ="";
    if (accuracy == "high"){
        kakudo = "高";
    }else if (accuracy == "middle"){
        kakudo = "中";
    }else if (accuracy == "low"){
        kakudo = "低";
    }
    
    let mokugeki = "その他";
    switch(sightings){
      case "witness":
        mokugeki = "目撃";
        break;
      case "trace":
        mokugeki = "足跡";
        break;
      case "photographing":
        mokugeki = "映像";
        break;
      case "capture":
        mokugeki = "捕獲";
    }
    const htmlContent = `
        <div>
          <p>目撃情報<br>
          日時：${date}<br>
          緯度：${coord[1]}<br>
          経度：${coord[0]}<br>
          確度：${kakudo}<br>
          目撃：${mokugeki}</p>
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
    map.getCanvas().style.cursor = 'default';
});

map.on('mouseleave', 'bear_points', function(e) {
    map.getCanvas().style.cursor = '';
});
