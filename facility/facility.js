// PMTilesの、MapLibre GL JS用のプロトコルをグローバルに追加
let protocol = new pmtiles.Protocol();
// addProtocolで、カスタムURLスキーマを使用するときに呼び出される関数を追加する
// pmtiles://~~ が使用されたときに、protocol.tileが呼び出される
maplibregl.addProtocol("pmtiles", protocol.tile);

const CATEGORY_CONFIG = {
  '3': { label: '建物', color: '#FF5722' },
  '9': { label: 'その他', color: '#9E9E9E' },
  '11': { label: '国の機関', color: '#3F51B5' },
  '12': { label: '地方公共団体', color: '#2196F3' },
  '13': { label: '厚生機関', color: '#00BCD4' },
  '14': { label: '警察機関', color: '#673AB7' },
  '15': { label: '消防署', color: '#F44336' },
  '16': { label: '学校', color: '#4CAF50' },
  '17': { label: '病院', color: '#E91E63' },
  '18': { label: '郵便局', color: '#FF9800' },
  '19': { label: '福祉施設', color: '#8BC34A' }
};

const map = new maplibregl.Map({
  container: "map",
  center: [140.10638889, 35.60722222], // 中心座標（千葉市）
  zoom: 9, // ズームレベル
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

      "facility-chiba": {
        type: "vector",
        url: "pmtiles://facility-chiba.pmtiles",
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
        id: "facility-chiba_points",
        // 塗りつぶされたポリゴン
        type: "circle",
        source: "facility-chiba",
        // ベクトルタイルソースから使用するレイヤ
        "source-layer": "facility-chiba_layer",
        paint: {
          'circle-radius': 6,
          'circle-stroke-color': '#fff',
          'circle-stroke-width': 2,
          'circle-color': [
            'match',
            ['to-string', ['get', 'P02_002']], // Convert P02_002 to string for comparison
            '3', CATEGORY_CONFIG['3'].color,
            '9', CATEGORY_CONFIG['9'].color,
            '11', CATEGORY_CONFIG['11'].color,
            '12', CATEGORY_CONFIG['12'].color,
            '13', CATEGORY_CONFIG['13'].color,
            '14', CATEGORY_CONFIG['14'].color,
            '15', CATEGORY_CONFIG['15'].color,
            '16', CATEGORY_CONFIG['16'].color,
            '17', CATEGORY_CONFIG['17'].color,
            '18', CATEGORY_CONFIG['18'].color,
            '19', CATEGORY_CONFIG['19'].color,
            '#cccccc' // default fallback
          ]
        }
      },
    ],
  },
});

let popup = '';

// マウスクリックイベント
map.on('click', 'facility-chiba_points', function (e) {
  // この行を追加して、クリック時にログが出るか確認
  //console.log("Click event fired!");
  // この行を追加して、e.featuresの中身を確認
  //console.log("e.features:", e.features);
  if (!e.features.length) {
    return;
  }
  // popup が表示されていれば削除
  popup && popup.remove();
  const feature = e.features[0];
  //console.log(`${feature.properties['date']}`);
  const coord = feature.geometry.coordinates;
  const { P02_001, P02_002, P02_003, P02_004, P02_005, P02_006, P02_007 } = feature.properties;
  //console.log(`${number}, ${date}, ${accuracy}, ${sightings}`);
  const htmlContent = `
        <div>
            <p>施設名：${P02_004}<br>
            住所：${P02_005}<p>
        </div>
    `;

  popup = new maplibregl.Popup()
    //new Popup()
    .setLngLat(coord)
    .setHTML(htmlContent)
    .addTo(map);
});

// マウスオーバー時のカーソル変更
map.on('mouseenter', 'facility-chiba_points', function (e) {
  // この行を追加して、クリック時にログが出るか確認
  //console.log("mouseenter event fired!");
  // この行を追加して、e.featuresの中身を確認
  //console.log("e.features:", e.features);

  map.getCanvas().style.cursor = 'default';
});

map.on('mouseleave', 'facility-chiba_points', function (e) {
  // この行を追加して、クリック時にログが出るか確認
  //console.log("mouseleave event fired!");
  // この行を追加して、e.featuresの中身を確認
  //console.log("e.features:", e.features);
  map.getCanvas().style.cursor = '';
});

// Init legend and filter
map.on('load', function () {
  const legend = document.getElementById('legend');
  if (!legend) return;

  Object.keys(CATEGORY_CONFIG).forEach(code => {
    const cat = CATEGORY_CONFIG[code];
    const item = document.createElement('div');
    item.className = 'legend-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = true;
    checkbox.value = code; // "3", "9", etc.
    checkbox.id = `cat-${code}`;
    checkbox.addEventListener('change', updateFilter);

    const colorBox = document.createElement('span');
    colorBox.className = 'color-box';
    colorBox.style.backgroundColor = cat.color;

    const label = document.createElement('label');
    label.htmlFor = `cat-${code}`;
    label.textContent = cat.label;

    item.appendChild(checkbox);
    item.appendChild(colorBox);
    item.appendChild(label);
    legend.appendChild(item);
  });
});

function updateFilter() {
  const checkedCodes = Array.from(document.querySelectorAll('#legend input:checked'))
    .map(cb => cb.value); // Keep as strings

  // Use 'match' expression for filtering:
  // ['match', input, [values...], outputIfMatch, outputIfNoMatch]
  // We match P02_002 against the list of checkedCodes. If match, return true (show), else false (hide).
  // Note: If checkedCodes is empty, 'match' might error or return default. 
  // If empty, match returns default (false), so markers disappear, which is correct.
  const filter = ['match', ['to-string', ['get', 'P02_002']], checkedCodes, true, false];
  map.setFilter('facility-chiba_points', filter);
}
