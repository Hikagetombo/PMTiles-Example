// PMTilesの、MapLibre GL JS用のプロトコルをグローバルに追加
let protocol = new pmtiles.Protocol();
// addProtocolで、カスタムURLスキーマを使用するときに呼び出される関数を追加する
// pmtiles://~~ が使用されたときに、protocol.tileが呼び出される
maplibregl.addProtocol("pmtiles", protocol.tile);

// 3つの loadImage と addImage が完了した後に実行する関数
function addBearPointsLayer() {
  map.addLayer({
    id: "bear-akita_points",
    type: 'symbol',
    source: 'bear-akita',
    "source-layer": "bear-akita_layer", // 前回の修正
    layout: {
      'icon-image': [
        "match",
        ["get", "情報種別"],
        "人身被害", "red-icon",
        "痕跡(食害)", "yellow-icon",
        "blue-icon"
      ],
      'icon-size': 0.5,
      'icon-allow-overlap': true,
    }
  });
  // その他の初期化処理もここで行えます
}

const map = new maplibregl.Map({
  container: "map",
  center: [140.25666666666666, 40.166666666666664], // 中心座標
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

      "bear-akita": {
        type: "vector",
        url: "pmtiles://bear-akita.pmtiles",
        attribution:
          "© Tsuchida",
      },
    },
    // 表示するレイヤ
    layers: [
      // 背景地図としてOpenStreetMapのラスタタイルを追加
      {
        // 一意のレイヤID
        id: "background-gsi-raster",
        // レイヤの種類
        type: "raster",
        // データソースの指定
        source: "background-gsi-raster",
      },
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
map.on('click', 'bear-akita_points', function (e) {
  if (!e.features.length) {
    return;
  }

  const feature = e.features[0];
  const coord = feature.geometry.coordinates;
  const { 出没情報ID, 情報種別, 市町村, 地番情報, 目撃日時, 獣種, 性別, 単独か親子, 頭数, 目撃時の状況 } = feature.properties;

  const htmlContent = `
        <div>
          <p>熊の出没情報<br>
          日時：${目撃日時}<br>
          情報種別：${情報種別}<br>
          市町村：${市町村}<br>
          地番情報：${地番情報}<br>
          獣種：${獣種}<br>
          頭数：${頭数}<br>
          緯度：${coord[1]}<br>
          経度：${coord[0]}<br>
        </div>
    `;

  new maplibregl.Popup()
    //new Popup()
    .setLngLat(coord)
    .setHTML(htmlContent)
    .addTo(map);
});

// マウスオーバー時のカーソル変更
map.on('mouseenter', 'bear-akita_points', function (e) {
  map.getCanvas().style.cursor = 'default';
});

map.on('mouseleave', 'bear-akita_points', function (e) {
  map.getCanvas().style.cursor = '';
});

// 凡例の追加
const legend = document.getElementById('state-legend');
const types = {
  '人身被害': '#FF0000',     // Red
  '痕跡(食害)': '#FFFF00',   // Yellow
  'その他': '#0000FF'       // Blue
};

// 選択中のフィルターを保持するSet
// 選択中のフィルターを保持するSet
const activeFilters = new Set();

for (const type in types) {
  activeFilters.add(type); // 初期状態でセットに追加

  const color = types[type];
  const item = document.createElement('div');

  // チェックボックスの作成
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = `checkbox-${type}`;
  checkbox.checked = true; // 初期状態はチェック済み（全表示）
  checkbox.style.marginRight = '5px';

  // カラーサークルの作成
  const key = document.createElement('span');
  key.style.backgroundColor = color;
  key.style.display = 'inline-block';
  key.style.width = '10px';
  key.style.height = '10px';
  key.style.borderRadius = '50%';
  key.style.marginRight = '5px';

  const value = document.createTextNode(type);

  // ラベル（テキスト）をクリックしてもチェックボックスが反応するようにする
  const label = document.createElement('label');
  label.style.cursor = 'pointer';
  label.htmlFor = `checkbox-${type}`;
  label.appendChild(checkbox);
  label.appendChild(key);
  label.appendChild(value);

  item.appendChild(label);
  legend.appendChild(item);

  // チェックボックスの変更イベント
  checkbox.addEventListener('change', function (e) {
    if (e.target.checked) {
      activeFilters.add(type);
    } else {
      activeFilters.delete(type);
    }
    updateMapFilter();
  });
}

function updateMapFilter() {
  if (activeFilters.size === 0) {
    // 何も選択されていない場合は全て表示（フィルター解除）
    map.setFilter('bear-akita_points', null);
  } else {
    // 選択された条件のいずれか(any)に一致するものを表示
    const filter = ['any'];

    if (activeFilters.has('人身被害')) {
      filter.push(['==', '情報種別', '人身被害']);
    }
    if (activeFilters.has('痕跡(食害)')) {
      filter.push(['==', '情報種別', '痕跡(食害)']);
    }
    if (activeFilters.has('その他')) {
      // その他の定義：人身被害でも痕跡(食害)でもないもの
      filter.push([
        'all',
        ['!=', '情報種別', '人身被害'],
        ['!=', '情報種別', '痕跡(食害)']
      ]);
    }

    map.setFilter('bear-akita_points', filter);
  }
}
