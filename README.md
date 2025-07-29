# TokoToko

# エレベーターピッチ

TokoTokoは、「歩く」をもっと冒険的にする、新感覚の徒歩旅アプリです。

都市や日常の風景を、まるでRPGのマップのように再発見できる体験を提供します。ユーザーが現在地を選ぶと、ランダムな目的地を自動生成。 Googleマップのように「行きたい場所」から逆算するのではなく、「どこに行くかわからないワクワク」から旅が始まります。

散歩がマンネリ化した都市生活者や、週末のちょっとした非日常を手軽に楽しみたい人を対象にしています。

従来のルート案内アプリや観光ガイドとは違い、TokoTokoは「行く意味」ではなく「歩く楽しみ」を演出することに特化しています。 たとえば、水域や私有地、危険エリアを除いた安全なエリアから目的地をピックアップし、ルートを生成。 歩行距離を自分の気分に合わせて“冒険”ができます。

ただの地図アプリではなく、人生の道草をデザインするツールです。

---

# 競合アプリとの差別化ポイント

| 項目 | 内容 |
| --- | --- |
| **1. ランダム目的地提案機能** | Google Mapsなど従来のナビアプリはユーザー主導の目的地設定が基本だが、本アプリは「未知との遭遇」を重視し、ランダム提案が中心。 |
| **2. 徒歩ルートに特化** | 観光・冒険向けに徒歩向けだが自転車でも使える。 |
| **3. UI/UX演出で冒険心を刺激** | 目的地決定時に地図が「ズームイン」していく演出など、遊び心のある演出でワクワク感を演出。 |
| **4. 低コスト・個人向け設計** | lieflet.js、無料のAPI、postgisなどなるべく費用がかからない外部サービスを利用しコストカット |

---

## 利用が想定される外部APIと利用目的

| API名 / 技術 | 利用目的 | 無料プラン / 備考 | 優先度 |
| --- | --- | --- | --- |
| **Leaflet.js + 地図タイルAPI**（OSM / Mapbox / Maptiler） | 軽量なマップ表示、ルート線描画、ピン、ズーム演出 | 無料プランあり（OSMは完全無料）Mapboxは上限あり（50k/月） | ◎（MVP中核） |
| **Nominatim (OSM)** | 住所 ↔ 緯度経度変換`locations.local_name` 自動入力に利用 | 完全無料（ただし大量アクセス制限）商用はSelf-hostが推奨 | ○ |
| **PostGIS** | 空間検索、危険エリア除外、県境判定、距離計算など全地理処理 | 無料（PostgreSQL拡張）必須ライブラリ | ◎（中核技術） |

## 追加機能（将来的な差別化拡張）

| 機能 | 利用API候補 |
| --- | --- |
| **体力消費シミュレーション**（高低差・距離から） | OpenElevation + Google Fit連携 |
| **冒険ログ保存・共有** | SNS連携（Twitter API, Instagram APIなど） |
| **AIによる冒険テーマの提案** | ChatGPT API or OpenAI Function Calling |

# 課題

- 必要な言語の学習（Udemy一周してあとは実践）
- postgisの勉強
- 外部APIを使うためのアカウントの作成
- APIの呼び出し順をどうするか
- トランザクション管理をどうするか
- MVPの検討
- インフラ構成図の作成
- 使用技術の調査

# 機能要件

---

| No. | カテゴリ | 要件内容 |
| --- | --- | --- |
| F1 | ユーザー認証 | メールまたはOAuthでログインし、ユーザー個別の冒険データを管理 |
| F2 | ランダム目的地生成 | 現在地から一定範囲内の地点をランダムに選出する |
| F3 | 目的地の情報表示 | 選ばれた目的地の名称を表示 |
| F4 | 徒歩ルート生成 | OSMベースで徒歩ルートを自動生成し、所要時間と距離を表示 |
| F5 | ルートスケジュール作成 | 移動予定時間・到着時間をスケジュール形式で表示 |
| F6 | 地図表示とズーム演出 | Leaflet.js等で地図を表示し、目的地決定時にズームイン演出を行う |
| F7 | 冒険ログ保存 | 目的地を保存 |
| F8 | PWA対応 | モバイル端末にアプリとしてインストール可能なPWA仕様に対応 |

# 非機能要件

---

| No. | カテゴリ | 要件内容 |
| --- | --- | --- |
| N1 | パフォーマンス | 目的地提案からルート表示まで、5秒以内に完了すること |
| N2 | 可用性 | サービス稼働率99%以上（gcpなどのクラウドサービスを活用） |
| N3 | セキュリティ | JWTなどのトークンを適切に管理する。HTTPS化、XSS対策 |
| N4 | 保守性 | APIキー・設定値を環境変数で一元管理し、デプロイ・更新が容易であること |
| N5 | モバイル最適化 | スマートフォンでの表示・操作性を優先設計とする（レスポンシブ対応） |
| N6 | データ通信最適化 | オフライン用の地図やルートデータ等の必要最小限のみ事前取得し、通信量を節約する |
| N7 | ライセンス準拠 | 使用する地図・API（OpenStreetMap, OpenCelliD等）の利用規約を遵守すること |
| N8 | 多言語対応（できれば） | 国外ユーザー向けに、英語・日本語の2言語に対応（初期は日本語のみでも可） |

# 各テーブルの詳細設計

---

## 1. users（ユーザー）

| カラム名 | 型 | 制約 | 説明 |
| --- | --- | --- | --- |
| id | UUID | PK | ユーザーID |
| email | STRING | UNIQUE, NOT NULL | メールアドレス |
| password_hash | STRING | NULL可 | パスワードハッシュ |
| provider | STRING | NULL可 | OAuth プロバイダー |
| created_at | TIMESTAMP | NOT NULL | 作成日時 |

### 2. adventures（冒険）

| カラム名 | 型 | 制約 | 説明 |
| --- | --- | --- | --- |
| id | UUID | PK | 冒険ID |
| user_id | UUID | FK(users.id) | ユーザーID |
| status | STRING | NOT NULL | ステータス（planned/in_progress/completed/failed） |
| failure_reason | STRING | NULL可 | 失敗理由 |
| total_distance | FLOAT | NULL可 | 実際に生成された総距離（km） |
| created_at | TIMESTAMP | NOT NULL | 作成日時 |

### 3. adventure_waypoints（経由地点）

| カラム名 | 型 | 制約 | 説明 |
| --- | --- | --- | --- |
| id | UUID | PK | 経由地点ID |
| adventure_id | UUID | FK(adventures.id) | 冒険ID |
| sequence | INTEGER | NOT NULL | 順番（1, 2, 3...） |
| spot_type | STRING | NOT NULL | スポット種別（park/restaurant/scenic/tourist_spot） |
| latitude | FLOAT | NOT NULL | 緯度 |
| longitude | FLOAT | NOT NULL | 経度 |
| created_at | TIMESTAMP | NOT NULL | 作成日時 |

### 4. adventure_preferences（冒険設定）

| カラム名 | 型 | 制約 | 説明 |
| --- | --- | --- | --- |
| id | UUID | PK | 設定ID |
| adventure_id | UUID | FK(adventures.id), UNIQUE | 冒険ID |
| total_distance_km | FLOAT | NOT NULL | ユーザー希望距離 |
| waypoint_count | INTEGER | NOT NULL | 経由地点数 |
| created_at | TIMESTAMP | NOT NULL | 作成日時 |

### 5. routes（ルート）

| カラム名 | 型 | 制約 | 説明 |
| --- | --- | --- | --- |
| id | UUID | PK | ルートID |
| adventure_id | UUID | FK(adventures.id) | 冒険ID |
| route_json | JSONB | NOT NULL | GeoJSON形式ルート |
| total_distance | FLOAT | NOT NULL | 各地点間の距離 |
| total_duration | INTEGER | NOT NULL | 所要時間（分） |
| created_at | TIMESTAMP | NOT NULL | 作成日時 |


### 6. locations（POI参照用マスターデータ、外部APIから持ってくるのでローカルのpostgressにテーブルを作らなくてもいい）

| カラム名 | 型 | 制約 | 説明 |
| --- | --- | --- | --- |
| id | UUID | PK | 地点ID |
| name | STRING | NOT NULL | 地点名 |
| latitude | FLOAT | NOT NULL | 緯度 |
| longitude | FLOAT | NOT NULL | 経度 |
| type | STRING | NOT NULL | 地点タイプ（park/restaurant/scenic/tourist_spot） |
| is_accessible | BOOLEAN | NOT NULL | アクセス可能 |
| is_water_area | BOOLEAN | NOT NULL | 水域フラグ |
| source | STRING | NOT NULL | データソース（osm/manual/api） |
| created_at | TIMESTAMP | NOT NULL | 作成日時 |

### 制約

1. **UNIQUE制約**: `(adventure_id, sequence)` - 同じ冒険内で順番重複防止
2. **外部キー制約**: 全て適切なCASCADE設定
3. **CHECK制約**: `sequence >= 1` - 順番は1から開始

# ER図



![ERv17.svg](README-image/ERv17.svg)

# ワイヤーフレーム


![ワイヤーフレームv1.png](README-image/ワイヤーフレームv1.png)

# MVP



| 項目 | 内容 | 必須 |
| --- | --- | --- |
| 現在地の取得 | GPSで現在地取得 | ◎ |
| 距離の指定 | 例：3km / 5km / 10km など | ◎ |
| ランダムな目的地生成 | 範囲内で1地点抽出 | ◎ |
| 徒歩ルート生成 | 現在地 → 目的地 | ◎ |
|  地図表示 | Leaflet.jsでルート可視化 | ◎ |
| 地点が水域・立入禁止でないことを確認 | PostGISでフィルタ | ○ |
| 旅の履歴保存 | `adventures`, `routes` 保存 | ○ |
| 冒険スタート演出 | 地図のズームイン、アニメーションなど | ○ |


