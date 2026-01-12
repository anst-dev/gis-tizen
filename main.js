import './style.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import LayerGroup from 'ol/layer/Group';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { fromLonLat } from 'ol/proj';

// Import services
import geoService from './service/geoService.js';
import { 
    duongOngChinhStyleFunction, 
    duongOngNghiemThuStyleFunction,
    duongOngOverlayStyleFunction 
} from './service/styleService.js';
import { MAP_CONFIG, LAYER_DISPLAY_CONFIG } from './service/configService.js';

// Cấu hình bản đồ
const CONFIG = {
    DEFAULT_CENTER: MAP_CONFIG.DEFAULT_CENTER,
    DEFAULT_ZOOM: MAP_CONFIG.DEFAULT_ZOOM,
    MIN_ZOOM: MAP_CONFIG.MIN_ZOOM,
    MAX_ZOOM: MAP_CONFIG.MAX_ZOOM,
    PROJECTION: MAP_CONFIG.PROJECTION
};

// ============================================
// TẠO VECTOR SOURCES CHO CÁC LAYER
// ============================================

// Đường ống chính
const duongOngChinhSource = new VectorSource();

// Đường ống chính C3
const duongOngChinhC3Source = new VectorSource();

// Đường ống nghiệm thu
const duongOngNghiemThuSource = new VectorSource();

// Đường ống overlay (kết nối)
const duongOngOverlaySource = new VectorSource();

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
    title: LAYER_DISPLAY_CONFIG.DUONG_ONG_CHINH.title,
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
    title: LAYER_DISPLAY_CONFIG.DUONG_ONG_CHINH_C3.title,
    visible: false, // Mặc định ẩn, sẽ hiển thị khi zoom gần
    zIndex: LAYER_DISPLAY_CONFIG.DUONG_ONG_CHINH_C3.zIndex
});

// Resolution threshold để hiển thị C3 (tương đương zoom ~15)
const C3_DISPLAY_RESOLUTION = 9;

/**
 * Layer đường ống nghiệm thu
 * Màu xanh lá, hiển thị TenVatTu thay vì VatLieu
 */
const duongOngNghiemThuLayer = new VectorLayer({
    source: duongOngNghiemThuSource,
    style: duongOngNghiemThuStyleFunction,
    title: LAYER_DISPLAY_CONFIG.DUONG_ONG_NGHIEM_THU.title,
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
    title: LAYER_DISPLAY_CONFIG.DUONG_ONG_OVERLAY.title,
    visible: LAYER_DISPLAY_CONFIG.DUONG_ONG_OVERLAY.visible,
    zIndex: LAYER_DISPLAY_CONFIG.DUONG_ONG_OVERLAY.zIndex
});

// ============================================
// TẠO LAYER GROUPS
// ============================================

const baseLayers = new LayerGroup({
    title: 'Bản đồ nền',
    layers: [
        new TileLayer({
            source: new OSM(),
            title: 'OpenStreetMap',
            type: 'base',
            visible: true
        })
    ]
});

const overlayLayers = new LayerGroup({
    title: 'Lớp đường ống',
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
    layers: [
        baseLayers,
        overlayLayers
    ],
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
 * @param {VectorSource} source - Vector source
 * @param {Object} geoJsonData - GeoJSON data
 * @param {string} layerName - Tên layer (để log)
 */
function loadGeoJsonToSource(source, geoJsonData, layerName) {
    try {
        const features = new GeoJSON().readFeatures(geoJsonData, {
            featureProjection: 'EPSG:3857'
        });
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
async function loadDuongOngChinh() {
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
async function loadDuongOngChinhC3() {
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
async function loadDuongOngNghiemThu() {
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
async function loadDuongOngOverlay() {
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
async function loadAllDuongOngLayers() {
    console.log('[Main] Starting to load đường ống layers...');
    
    const results = await Promise.allSettled([
        loadDuongOngChinh(),
        loadDuongOngChinhC3()
        // Tạm thời không load các layer sau:
        // loadDuongOngNghiemThu(),
        // loadDuongOngOverlay()
    ]);
    
    const totalFeatures = results
        .filter(r => r.status === 'fulfilled')
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
function initLayerSwitcher() {
    const layerDuongOngCheckbox = document.getElementById('layer-duongong');
    const layerDuongOngC3Checkbox = document.getElementById('layer-duongong-c3');
    const layerNghiemThuCheckbox = document.getElementById('layer-nghiemthu');
    const layerOverlayCheckbox = document.getElementById('layer-overlay');

    if (layerDuongOngCheckbox) {
        layerDuongOngCheckbox.checked = duongOngChinhLayer.getVisible();
        layerDuongOngCheckbox.addEventListener('change', (e) => {
            duongOngChinhLayer.setVisible(e.target.checked);
        });
    }

    if (layerDuongOngC3Checkbox) {
        layerDuongOngC3Checkbox.checked = duongOngChinhC3Layer.getVisible();
        layerDuongOngC3Checkbox.addEventListener('change', (e) => {
            duongOngChinhC3Layer.setVisible(e.target.checked);
        });
    }

    if (layerNghiemThuCheckbox) {
        layerNghiemThuCheckbox.checked = duongOngNghiemThuLayer.getVisible();
        layerNghiemThuCheckbox.addEventListener('change', (e) => {
            duongOngNghiemThuLayer.setVisible(e.target.checked);
        });
    }

    if (layerOverlayCheckbox) {
        layerOverlayCheckbox.checked = duongOngOverlayLayer.getVisible();
        layerOverlayCheckbox.addEventListener('change', (e) => {
            duongOngOverlayLayer.setVisible(e.target.checked);
        });
    }
}

// ============================================
// LEGEND TOGGLE LOGIC
// ============================================

/**
 * Xử lý toggle legend (thu gọn/mở rộng bảng chú thích)
 */
function initLegendToggle() {
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
function initZoomBasedLayerVisibility() {
    const view = map.getView();
    
    // Kiểm tra và cập nhật visibility ngay khi khởi tạo
    const updateC3Visibility = () => {
        const resolution = view.getResolution();
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
function initMapLoadingState() {
    map.on('loadstart', function () {
        map.getTargetElement().classList.add('loading');
    });

    map.on('loadend', function () {
        map.getTargetElement().classList.remove('loading');
    });
}

// ============================================
// FEATURE INFO ON HOVER
// ============================================

/**
 * Hiển thị thông tin feature khi hover
 */
function initFeatureHover() {
    const info = document.getElementById('info');
    if (!info) return;

    let currentFeature = null;

    map.on('pointermove', function (evt) {
        if (evt.dragging) {
            info.style.visibility = 'hidden';
            currentFeature = null;
            return;
        }

        const pixel = map.getEventPixel(evt.originalEvent);
        const feature = map.forEachFeatureAtPixel(pixel, function (feature, layer) {
            feature.layer = layer;
            return feature;
        }, {
            layerFilter: function (layer) {
                const title = layer.get('title');
                return title && (
                    title.includes('đường ống') || 
                    title.includes('Đường ống') ||
                    title.includes('nghiệm thu')
                );
            }
        });

        if (feature) {
            info.style.left = pixel[0] + 10 + 'px';
            info.style.top = pixel[1] + 10 + 'px';

            if (feature !== currentFeature) {
                info.style.visibility = 'visible';
                const layerTitle = feature.layer?.get('title') || '';
                
                if (layerTitle.includes('nghiệm thu')) {
                    const code = feature.get('Code') || '';
                    const noiDung = feature.get('NoiDung') || '';
                    info.innerText = `${code} - ${noiDung}`;
                } else {
                    const vatLieu = feature.get('VatLieu') || '';
                    const duongKinh = feature.get('DuongKinh') || '';
                    info.innerText = `${vatLieu} Ø${duongKinh}mm`;
                }
            }
        } else {
            info.style.visibility = 'hidden';
        }
        currentFeature = feature;
    });

    map.getTargetElement().addEventListener('pointerleave', function () {
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
function initApp() {
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
    loadAllDuongOngLayers
};
