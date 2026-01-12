import './style.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import {fromLonLat} from 'ol/proj';

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

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  view: new View({
    center: fromLonLat(CONFIG.DEFAULT_CENTER),
    zoom: CONFIG.DEFAULT_ZOOM,
    minZoom: CONFIG.MIN_ZOOM,
    maxZoom: CONFIG.MAX_ZOOM
  })
});

// Export config để sử dụng ở nơi khác nếu cần
export { CONFIG, map };
