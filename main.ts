/**
 * GIS Tizen - Main Application Entry Point
 * Ứng dụng bản đồ GIS hiển thị hệ thống đường ống nước
 */

import './style.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import LayerGroup from 'ol/layer/Group';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { fromLonLat } from 'ol/proj';
import type { Feature } from 'ol';
import type { Geometry } from 'ol/geom';
import type BaseLayer from 'ol/layer/Base';

// Import services
import geoService from './service/geoService.ts';
import { 
  duongOngChinhStyleFunction, 
  duongOngNghiemThuStyleFunction,
  duongOngOverlayStyleFunction 
} from './service/styleService.ts';
import { MAP_CONFIG, LAYER_DISPLAY_CONFIG } from './service/configService.ts';
import type { GeoJSONFeatureCollection, DuongOngProperties, AppConfig, FeatureWithLayer } from './types/index.ts';

// ============================================
// CẤU HÌNH ỨNG DỤNG
// ============================================

const CONFIG: AppConfig = {
  DEFAULT_CENTER: MAP_CONFIG.DEFAULT_CENTER,
  DEFAULT_ZOOM: MAP_CONFIG.DEFAULT_ZOOM,
  MIN_ZOOM: MAP_CONFIG.MIN_ZOOM,
  MAX_ZOOM: MAP_CONFIG.MAX_ZOOM,
  PROJECTION: MAP_CONFIG.PROJECTION
};

// Resolution threshold để hiển thị C3 (tương đương zoom ~15)
const C3_DISPLAY_RESOLUTION = 10;

// ============================================
// TẠO VECTOR SOURCES CHO CÁC LAYER
// ============================================

const duongOngChinhSource = new VectorSource<Feature<Geometry>>();
const duongOngChinhC3Source = new VectorSource<Feature<Geometry>>();
const duongOngNghiemThuSource = new VectorSource<Feature<Geometry>>();
const duongOngOverlaySource = new VectorSource<Feature<Geometry>>();

// ============================================
// TẠO VECTOR LAYERS
// ============================================

/**
 * Layer đường ống chính
 * Quy tắc màu sắc:
 * - Thép: Đỏ
 * - HDPE 110mm: Xanh lá cây
 * - HDPE 90mm: Xanh ngọc (Cyan)
 * - HDPE 63mm: Xanh dương
 * - HDPE 50mm: Hồng (#F56A80)
 * - HDPE < 50mm: Vàng
 * - 150mm - 250mm: Tím
 * - > 250mm: Cam
 * - Còn lại: Nâu
 */
const duongOngChinhLayer = new VectorLayer({
  source: duongOngChinhSource,
  style: duongOngChinhStyleFunction,
  properties: {
    title: LAYER_DISPLAY_CONFIG.DUONG_ONG_CHINH.title
  },
  visible: LAYER_DISPLAY_CONFIG.DUONG_ONG_CHINH.visible,
  zIndex: LAYER_DISPLAY_CONFIG.DUONG_ONG_CHINH.zIndex
});

/**
 * Layer đường ống chính C3
 * Sử dụng cùng logic màu sắc với đường ống chính
 * Mặc định ẩn, chỉ hiển thị khi zoom gần (resolution <= 5)
 */
const duongOngChinhC3Layer = new VectorLayer({
  source: duongOngChinhC3Source,
  style: duongOngChinhStyleFunction,
  properties: {
    title: LAYER_DISPLAY_CONFIG.DUONG_ONG_CHINH_C3.title
  },
  visible: false, // Mặc định ẩn, sẽ hiển thị khi zoom gần
  zIndex: LAYER_DISPLAY_CONFIG.DUONG_ONG_CHINH_C3.zIndex
});

/**
 * Layer đường ống nghiệm thu
 * Màu xanh lá, hiển thị TenVatTu thay vì VatLieu
 */
const duongOngNghiemThuLayer = new VectorLayer({
  source: duongOngNghiemThuSource,
  style: duongOngNghiemThuStyleFunction,
  properties: {
    title: LAYER_DISPLAY_CONFIG.DUONG_ONG_NGHIEM_THU.title
  },
  visible: LAYER_DISPLAY_CONFIG.DUONG_ONG_NGHIEM_THU.visible,
  zIndex: LAYER_DISPLAY_CONFIG.DUONG_ONG_NGHIEM_THU.zIndex
});

/**
 * Layer đường ống overlay (kết nối)
 * Sử dụng màu từ thuộc tính Color của feature
 */
const duongOngOverlayLayer = new VectorLayer({
  source: duongOngOverlaySource,
  style: duongOngOverlayStyleFunction,
  properties: {
    title: LAYER_DISPLAY_CONFIG.DUONG_ONG_OVERLAY.title
  },
  visible: LAYER_DISPLAY_CONFIG.DUONG_ONG_OVERLAY.visible,
  zIndex: LAYER_DISPLAY_CONFIG.DUONG_ONG_OVERLAY.zIndex
});

// ============================================
// TẠO LAYER GROUPS
// ============================================

const baseLayers = new LayerGroup({
  properties: { title: 'Bản đồ nền' },
  layers: [
    new TileLayer({
      source: new OSM(),
      properties: { title: 'OpenStreetMap', type: 'base' },
      visible: true
    })
  ]
});

const overlayLayers = new LayerGroup({
  properties: { title: 'Lớp đường ống' },
  layers: [
    duongOngChinhLayer,
    duongOngChinhC3Layer
    // Các layer sau tạm thời không hiển thị trên bản đồ
    // duongOngNghiemThuLayer,
    // duongOngOverlayLayer
  ]
});

// ============================================
// KHỞI TẠO BẢN ĐỒ
// ============================================

const map = new Map({
  target: 'map',
  layers: [baseLayers, overlayLayers],
  view: new View({
    center: fromLonLat(CONFIG.DEFAULT_CENTER),
    zoom: CONFIG.DEFAULT_ZOOM,
    minZoom: CONFIG.MIN_ZOOM,
    maxZoom: CONFIG.MAX_ZOOM
  })
});

// ============================================
// HÀM LOAD DỮ LIỆU
// ============================================

/**
 * Load dữ liệu GeoJSON vào source
 */
function loadGeoJsonToSource(
  source: VectorSource<Feature<Geometry>>, 
  geoJsonData: GeoJSONFeatureCollection<DuongOngProperties>, 
  layerName: string
): number {
  try {
    const features = new GeoJSON().readFeatures(geoJsonData, {
      featureProjection: 'EPSG:3857'
    }) as Feature<Geometry>[];
    source.addFeatures(features);
    console.log(`[Main] Loaded ${features.length} features for ${layerName}`);
    return features.length;
  } catch (error) {
    console.error(`[Main] Error loading features for ${layerName}:`, error);
    return 0;
  }
}

/**
 * Load dữ liệu đường ống chính
 */
async function loadDuongOngChinh(): Promise<number> {
  try {
    console.log('[Main] Loading đường ống chính...');
    const data = await geoService.getDuongOngChinh();
    return loadGeoJsonToSource(duongOngChinhSource, data, 'Đường ống chính');
  } catch (error) {
    console.error('[Main] Failed to load đường ống chính:', error);
    return 0;
  }
}

/**
 * Load dữ liệu đường ống chính C3
 */
async function loadDuongOngChinhC3(): Promise<number> {
  try {
    console.log('[Main] Loading đường ống chính C3...');
    const data = await geoService.getDuongOngChinhC3();
    return loadGeoJsonToSource(duongOngChinhC3Source, data, 'Đường ống C3');
  } catch (error) {
    console.error('[Main] Failed to load đường ống chính C3:', error);
    return 0;
  }
}

/**
 * Load dữ liệu đường ống nghiệm thu
 */
async function loadDuongOngNghiemThu(): Promise<number> {
  try {
    console.log('[Main] Loading đường ống nghiệm thu...');
    const data = await geoService.getDuongOngNghiemThu();
    return loadGeoJsonToSource(duongOngNghiemThuSource, data, 'Đường ống nghiệm thu');
  } catch (error) {
    console.error('[Main] Failed to load đường ống nghiệm thu:', error);
    return 0;
  }
}

/**
 * Load dữ liệu đường ống overlay
 */
async function loadDuongOngOverlay(): Promise<number> {
  try {
    console.log('[Main] Loading đường ống overlay...');
    const data = await geoService.getDuongOngOverlay();
    return loadGeoJsonToSource(duongOngOverlaySource, data, 'Đường ống overlay');
  } catch (error) {
    console.error('[Main] Failed to load đường ống overlay:', error);
    return 0;
  }
}

/**
 * Load tất cả các layer đường ống
 * Chỉ load đường ống chính và C3, không load nghiệm thu và overlay
 */
async function loadAllDuongOngLayers(): Promise<number> {
  console.log('[Main] Starting to load đường ống layers...');
  
  const results = await Promise.allSettled([
    loadDuongOngChinh(),
    loadDuongOngChinhC3()
    // Tạm thời không load các layer sau:
    // loadDuongOngNghiemThu(),
    // loadDuongOngOverlay()
  ]);
  
  const totalFeatures = results
    .filter((r): r is PromiseFulfilledResult<number> => r.status === 'fulfilled')
    .reduce((sum, r) => sum + r.value, 0);
  
  console.log(`[Main] Finished loading layers. Total features: ${totalFeatures}`);
  return totalFeatures;
}

// ============================================
// LAYER SWITCHER LOGIC
// ============================================

/**
 * Khởi tạo layer switcher
 */
function initLayerSwitcher(): void {
  const layerDuongOngCheckbox = document.getElementById('layer-duongong') as HTMLInputElement | null;
  const layerDuongOngC3Checkbox = document.getElementById('layer-duongong-c3') as HTMLInputElement | null;
  const layerNghiemThuCheckbox = document.getElementById('layer-nghiemthu') as HTMLInputElement | null;
  const layerOverlayCheckbox = document.getElementById('layer-overlay') as HTMLInputElement | null;

  if (layerDuongOngCheckbox) {
    layerDuongOngCheckbox.checked = duongOngChinhLayer.getVisible();
    layerDuongOngCheckbox.addEventListener('change', (e) => {
      duongOngChinhLayer.setVisible((e.target as HTMLInputElement).checked);
    });
  }

  if (layerDuongOngC3Checkbox) {
    layerDuongOngC3Checkbox.checked = duongOngChinhC3Layer.getVisible();
    layerDuongOngC3Checkbox.addEventListener('change', (e) => {
      duongOngChinhC3Layer.setVisible((e.target as HTMLInputElement).checked);
    });
  }

  if (layerNghiemThuCheckbox) {
    layerNghiemThuCheckbox.checked = duongOngNghiemThuLayer.getVisible();
    layerNghiemThuCheckbox.addEventListener('change', (e) => {
      duongOngNghiemThuLayer.setVisible((e.target as HTMLInputElement).checked);
    });
  }

  if (layerOverlayCheckbox) {
    layerOverlayCheckbox.checked = duongOngOverlayLayer.getVisible();
    layerOverlayCheckbox.addEventListener('change', (e) => {
      duongOngOverlayLayer.setVisible((e.target as HTMLInputElement).checked);
    });
  }
}

// ============================================
// LEGEND TOGGLE LOGIC
// ============================================

/**
 * Xử lý toggle legend (thu gọn/mở rộng bảng chú thích)
 */
function initLegendToggle(): void {
  const legendToggleBtn = document.getElementById('legend-toggle');
  const legendContent = document.getElementById('legend-content');
  const legend = document.getElementById('legend');

  if (legendToggleBtn && legendContent && legend) {
    legendToggleBtn.addEventListener('click', () => {
      const isCollapsed = legendContent.classList.toggle('collapsed');
      legend.classList.toggle('collapsed', isCollapsed);
      legendToggleBtn.textContent = isCollapsed ? '+' : '−';
      legendToggleBtn.title = isCollapsed ? 'Mở rộng' : 'Thu gọn';
    });
  }
}

// ============================================
// ZOOM-BASED LAYER VISIBILITY
// ============================================

/**
 * Xử lý hiển thị layer C3 dựa trên zoom level
 * Khi zoom gần (resolution <= C3_DISPLAY_RESOLUTION), hiển thị layer C3
 */
function initZoomBasedLayerVisibility(): void {
  const view = map.getView();
  
  // Kiểm tra và cập nhật visibility ngay khi khởi tạo
  const updateC3Visibility = (): void => {
    const resolution = view.getResolution();
    if (resolution === undefined) return;
    
    const shouldShowC3 = resolution <= C3_DISPLAY_RESOLUTION;
    
    if (duongOngChinhC3Layer.getVisible() !== shouldShowC3) {
      duongOngChinhC3Layer.setVisible(shouldShowC3);
      console.log(`[Main] C3 layer visibility: ${shouldShowC3} (resolution: ${resolution.toFixed(2)})`);
    }
  };
  
  // Lắng nghe sự kiện thay đổi resolution
  view.on('change:resolution', updateC3Visibility);
  
  // Kiểm tra ngay khi khởi tạo
  updateC3Visibility();
}

// ============================================
// MAP LOADING INDICATORS
// ============================================

/**
 * Xử lý loading state của map
 */
function initMapLoadingState(): void {
  map.on('loadstart', () => {
    map.getTargetElement()?.classList.add('loading');
  });

  map.on('loadend', () => {
    map.getTargetElement()?.classList.remove('loading');
  });
}

// ============================================
// FEATURE INFO ON HOVER
// ============================================

/**
 * Hiển thị thông tin feature khi hover
 */
function initFeatureHover(): void {
  const info = document.getElementById('info');
  if (!info) return;

  let currentFeature: FeatureWithLayer | null = null;

  map.on('pointermove', (evt) => {
    if (evt.dragging) {
      info.style.visibility = 'hidden';
      currentFeature = null;
      return;
    }

    const pixel = map.getEventPixel(evt.originalEvent);
    const feature = map.forEachFeatureAtPixel(
      pixel,
      (feat, layer) => {
        const featureWithLayer = feat as FeatureWithLayer;
        featureWithLayer.layer = layer as { get(key: string): unknown } | undefined;
        return featureWithLayer;
      },
      {
        layerFilter: (layer: BaseLayer) => {
          const title = layer.get('title') as string | undefined;
          return !!(title && (
            title.includes('đường ống') ||
            title.includes('Đường ống') ||
            title.includes('nghiệm thu')
          ));
        }
      }
    );

    if (feature) {
      info.style.left = pixel[0] + 10 + 'px';
      info.style.top = pixel[1] + 10 + 'px';

      if (feature !== currentFeature) {
        info.style.visibility = 'visible';
        const layerTitle = (feature.layer?.get('title') ?? '') as string;
        
        if (layerTitle.includes('nghiệm thu')) {
          const code = (feature.get('Code') ?? '') as string;
          const noiDung = (feature.get('NoiDung') ?? '') as string;
          info.innerText = `${code} - ${noiDung}`;
        } else {
          const vatLieu = (feature.get('VatLieu') ?? '') as string;
          const duongKinh = (feature.get('DuongKinh') ?? '') as string;
          info.innerText = `${vatLieu} Ø${duongKinh}mm`;
        }
      }
    } else {
      info.style.visibility = 'hidden';
    }
    currentFeature = feature ?? null;
  });

  map.getTargetElement()?.addEventListener('pointerleave', () => {
    currentFeature = null;
    info.style.visibility = 'hidden';
  });
}

// ============================================
// KHỞI TẠO ỨNG DỤNG
// ============================================

/**
 * Khởi tạo tất cả các thành phần khi DOM sẵn sàng
 */
function initApp(): void {
  initLegendToggle();
  initMapLoadingState();
  initFeatureHover();
  initZoomBasedLayerVisibility();
  
  // Load tất cả các layer đường ống
  loadAllDuongOngLayers();
}

// Khởi tạo khi DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// ============================================
// EXPORTS
// ============================================

export {
  CONFIG,
  map,
  duongOngChinhLayer,
  duongOngChinhC3Layer,
  duongOngNghiemThuLayer,
  duongOngOverlayLayer,
  duongOngChinhSource,
  duongOngChinhC3Source,
  duongOngNghiemThuSource,
  duongOngOverlaySource,
  loadAllDuongOngLayers,
  // Export các hàm load riêng lẻ để sử dụng khi cần
  loadDuongOngNghiemThu,
  loadDuongOngOverlay,
  initLayerSwitcher
};
