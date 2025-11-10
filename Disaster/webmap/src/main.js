// PMTilesの、MapLibre GL JS用のプロトコルをグローバルに追加
let protocol = new pmtiles.Protocol();
// addProtocolで、カスタムURLスキーマを使用するときに呼び出される関数を追加する
// pmtiles://~~ が使用されたときに、protocol.tileが呼び出される
maplibregl.addProtocol("pmtiles", protocol.tile);

// 地図の表示
const map = new maplibregl.Map({
    container: 'map',
    style: {
        version: 8,
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
        minzoom: 6,
        maxzoom: 17.99,
        sources: {
            pales: {
                // ソースの定義
                type: 'raster', // データタイプはラスターを指定
                tiles: ['https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png'], // タイルのURL
                tileSize: 256, // タイルのサイズ
                maxzoom: 18, // 最大ズームレベル
                attribution: "<a href='https://www.gsi.go.jp/' target='_blank'>国土地理院</a>", // 地図上に表示される属性テキスト
            },
            seamlessphoto: {   // シームレス写真
                type: 'raster',
                tiles: ['https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg'],
                tileSize: 256,
                attribution: "<a href='https://www.gsi.go.jp/' target='_blank'>国土地理院</a>",
                maxzoom: 18,
            },
            slopemap: { // 傾斜量図
                type: 'raster',
                tiles: ['https://cyberjapandata.gsi.go.jp/xyz/slopemap/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: "<a href='https://www.gsi.go.jp/' target='_blank'>国土地理院</a>",
                maxzoom: 15,
            },
            flood: {
                // 洪水浸水想定区域（想定最大規模）
                type: 'raster',
                tiles: ['https://disaportaldata.gsi.go.jp/raster/01_flood_l2_shinsuishin_data/{z}/{x}/{y}.png'],
                minzoom: 2,
                maxzoom: 17,
                tileSize: 256,
                attribution: "<a href='https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html' target='_blank'>ハザードマップポータルサイト</a>",
            },
            hightide: {
                // 高潮浸水想定区域
                type: 'raster',
                tiles: ['https://disaportaldata.gsi.go.jp/raster/03_hightide_l2_shinsuishin_data/{z}/{x}/{y}.png'],
                minzoom: 2,
                maxzoom: 17,
                tileSize: 256,
                attribution: "<a href='https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html' target='_blank'>ハザードマップポータルサイト</a>",
            },
            tsunami: {
                // 津波浸水想定
                type: 'raster',
                tiles: ['https://disaportaldata.gsi.go.jp/raster/04_tsunami_newlegend_data/{z}/{x}/{y}.png'],
                minzoom: 2,
                maxzoom: 17,
                tileSize: 256,
                attribution: "<a href='https://disaportal.gsi.go.jp/hazardmap/copyright/opendata.html' target='_blank'>ハザードマップポータルサイト</a>",
            },
            shelter: {
                type: "vector",
                url: "pmtiles://src/shelter.pmtiles",
                attribution: '<a href="https://www.bousai.metro.tokyo.lg.jp/bousai/1000026/1000316.html" target="_blank">東京都避難所、避難場所データ オープンデータ</a>',
            },
                hinanjo_chiba: {
                type: "vector",
                url: "pmtiles://src/hinanjo-chiba.pmtiles",
                attribution: '千葉県避難場所データ オープンデータ',
            },
        },
        layers: [
            {
                id: 'pales_layer', // レイヤーのID
                source: 'pales',   // ソースのID
                type: 'raster',    // データタイプはラスターを指定
            },
            {
                id: 'seamlessphoto_layer',
                source: 'seamlessphoto',
                type: 'raster',
            },
            {
                id: 'slopemap_layer',
                source: 'slopemap',
                type: 'raster',
            },
            {
                id: 'background', // マスクレイヤー
                type: 'background',
                paint: {
                    'background-color': '#000', // レイヤーの色を設定
                    'background-opacity': 0.3, // 不透明度を設定
                },
            },
            {
                id: 'flood_layer', // 洪水浸水想定区域（想定最大規模）
                source: 'flood',
                type: 'raster',
                paint: { 'raster-opacity': 0.8 },
            },
            {
                id: 'hightide_layer', // 高潮浸水想定区域
                source: 'hightide',
                type: 'raster',
                paint: { 'raster-opacity': 0.8 },
            },
            {
                id: 'tsunami_layer', // 津波浸水想定
                source: 'tsunami',
                type: 'raster',
                paint: { 'raster-opacity': 0.8 },
            },
            {
                id: 'shelter_points',
                source: 'shelter',
                type: 'circle', // ポイントデータを表示するためにcircleを指定
                // ベクトルタイルソースから使用するレイヤ
                "source-layer": "shelter_layer",
                paint: {
                    'circle-color': '#0BB1AF', // ポイントの色
                    'circle-radius': 8, // ポイントのサイズ
                    'circle-stroke-width': 2, // ポイントの枠線の太さ
                    'circle-stroke-color': '#fff', // ポイントの枠線の色
                },
            },
            {
                id: 'hinanjo_chiba_points',
                source: 'hinanjo_chiba',
                type: 'circle', // ポイントデータを表示するためにcircleを指定
                // ベクトルタイルソースから使用するレイヤ
                "source-layer": "hinanjo_layer",
                paint: {
                    'circle-color': '#0BB1AF', // ポイントの色
                    'circle-radius': 8, // ポイントのサイズ
                    'circle-stroke-width': 2, // ポイントの枠線の太さ
                    'circle-stroke-color': '#fff', // ポイントの枠線の色
                },
            },
        ],
    },
    center: [139.477, 35.681], // 地図の中心座標
    zoom: 9, // 地図の初期ズームレベル
});

// マップの初期ロード完了時に発火するイベント
/* global  OpacityControl */
map.on('load', () => {
    // 背景地図の切り替えコントロール
    const baseMaps = new OpacityControl({
        baseLayers: {
            // コントロールに表示するレイヤーの定義
            pales_layer: '淡色地図',
            seamlessphoto_layer: '空中写真',
            slopemap_layer: '傾斜量図',
        },
    });
    map.addControl(baseMaps, 'top-left'); // 第二引数でUIの表示場所を定義

    // 災害情報レイヤーの切り替えコントロール
    const hazardLayers = new OpacityControl({
        baseLayers: {
            flood_layer: '洪水浸水想定区域',
            hightide_layer: '高潮浸水想定区域',
            tsunami_layer: '津波浸水想定',
        },
    });
    map.addControl(hazardLayers, 'top-left');
});

// マウスカーソルのスタイルを変更
map.on('mouseenter', 'shelter_points', () => (map.getCanvas().style.cursor = 'default'));
map.on('mouseleave', 'shelter_points', () => (map.getCanvas().style.cursor = ''));

map.on('click', 'shelter_points', function (e) {
    // この行を追加して、クリック時にログが出るか確認
    console.log("Click event fired!");
    // この行を追加して、e.featuresの中身を確認
    //console.log("e.features:", e.features);
    if (!e.features.length) {
        return;
    }

    const feature = e.features[0];
    const coord   = feature.geometry.coordinates;
    const prop    = feature.properties;
    const name    = prop['避難所_施設名称']; // 名称
    const address = prop['所在地住所'];      // 住所

    // バリアフリー情報を取得
    const elevation = prop['エレベーター有/\n避難スペースが１階']; // エレベーター、避難所スペース
    const slope     = prop['スロープ等'];              // スロープ
    const block     = prop['点字ブロック'];            // 点字ブロック
    const toilet    = prop['車椅子使用者対応トイレ'];  // トイレ
    const other     = prop['その他'];                  // その他

    // バリアフリー情報を整形　nullの項目は表示しない
    let barrierFree = '';
    if (elevation === '○') barrierFree += '<li>エレベーター有り/避難スペースが1階</li>';
    if (slope     === '○') barrierFree += '<li>スロープ等有り</li>';
    if (block     === '○') barrierFree += '<li>点字ブロック有り</li>';
    if (toilet    === '○') barrierFree += '<li>車椅子使用者対応トイレ有り</li>';
    if (other     === '○') barrierFree += `<li>${other}</li>`;
    if (!barrierFree)       barrierFree =  '<li>なし</li>';　// バリアフリー情報がない場合は「なし」と表示

    const html = `<h2>${name}</h2><div>住所:${address}</div><hr /><b>バリアフリー情報</b>${barrierFree}`;

    // ポップアップを表示
    popup = new maplibregl.Popup({
        maxWidth: '300px', // ポップアップの最大幅
        offset: [0, -15],　// ポップアップの位置を調整
    })
        .setLngLat(coord)
        .setHTML(html)
        .addTo(map);
});

// マウスカーソルのスタイルを変更
map.on('mouseenter', 'hinanjo_chiba_points', () => (map.getCanvas().style.cursor = 'default'));
map.on('mouseleave', 'hinanjo_chiba_points', () => (map.getCanvas().style.cursor = ''));

map.on('click', 'hinanjo_chiba_points', function (e) {
    // この行を追加して、クリック時にログが出るか確認
    console.log("Click event fired!");
    // この行を追加して、e.featuresの中身を確認
    //console.log("e.features:", e.features);
    if (!e.features.length) {
        return;
    }

    const feature = e.features[0];
    const coord   = feature.geometry.coordinates;
    const prop    = feature.properties;
    const name    = prop['名称']; // 名称
    const address = prop['住所']; // 住所

    popup = new maplibregl.Popup({
        maxWidth: '300px', // ポップアップの最大幅
        offset: [0, -15],　// ポップアップの位置を調整
    })
        .setLngLat(coord)
        .setHTML(`<h2>${name}</h2><div>住所:${address}</div>`)
        .addTo(map);
});

  