import './style.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import {fromLonLat} from 'ol/proj';

// Import services
import { getDuongOngChinh } from './service/geoService.js';
import { duongOngStyleFunction } from './service/styleService.js';

// Cấu hình bản đồ
const CONFIG = {
  DEFAULT_CENTER: [105.695587, 18.671575], // Tọa độ Nghệ An, Việt Nam
  DEFAULT_ZOOM: 10,
  FULLSCREEN_ZOOM: 10,
  MIN_ZOOM: 4,
  MAX_ZOOM: 18,
  WIDGET_ZOOM: 14,
  TILE_SOURCE: 'OSM' // OpenStreetMap
};

// Tạo vector source cho đường ống
const duongOngSource = new VectorSource();

// Layer đường ống chính với style theo vật liệu và đường kính
// Quy tắc màu sắc:
// - Thép: Đỏ
// - HDPE 110mm: Xanh lá cây
// - HDPE 90mm: Xanh ngọc (Cyan)
// - HDPE 63mm: Xanh dương
// - HDPE 50mm: Hồng (#F56A80)
// - HDPE < 50mm: Vàng
// - 150mm - 250mm: Tím
// - > 250mm: Cam
// - Còn lại: Nâu
// Lưu ý: Chỉ hiển thị đường ống có kích thước từ 90 trở lên
const duongOngLayer = new VectorLayer({
  source: duongOngSource,
  style: duongOngStyleFunction
});

// Khởi tạo bản đồ
const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    }),
    duongOngLayer
  ],
  view: new View({
    center: fromLonLat(CONFIG.DEFAULT_CENTER),
    zoom: CONFIG.DEFAULT_ZOOM,
    minZoom: CONFIG.MIN_ZOOM,
    maxZoom: CONFIG.MAX_ZOOM
  })
});

// Hàm load dữ liệu đường ống chính
async function loadDuongOngChinh() {
  try {
    console.log('Đang tải dữ liệu đường ống chính...');
    const geoJsonData = await getDuongOngChinh();
    
    const features = new GeoJSON().readFeatures(geoJsonData, {
      featureProjection: 'EPSG:3857' // Web Mercator projection
    });
    
    duongOngSource.addFeatures(features);
    console.log(`Đã tải ${features.length} đối tượng đường ống chính`);
  } catch (error) {
    console.error('Lỗi khi tải dữ liệu đường ống chính:', error);
  }
}

// Load dữ liệu khi khởi động
loadDuongOngChinh();

// Export config để sử dụng ở nơi khác nếu cần
export { CONFIG, map, duongOngLayer };
