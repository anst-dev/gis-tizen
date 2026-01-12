/**
 * ConfigService - Configuration cho GIS layers và resolution
 * Pattern giống với config/resolution.js trong nawasco-web-gis
 */

import type {
  ResolutionDisplayConfig,
  LayerNames,
  LayerDisplayConfig,
  PipeColors,
  MapConfig,
  ApiEndpoints
} from '../types/index.ts';

/**
 * Cấu hình Resolution để hiển thị label đường ống theo đường kính
 * - Resolution thấp = zoom cao (zoom gần hơn)
 * - Resolution cao = zoom thấp (zoom xa hơn)
 * 
 * Quy tắc: Đường ống lớn hiển thị label ở zoom xa, đường ống nhỏ chỉ hiển thị label khi zoom gần
 */
export const RESOLUTION_DISPLAY_NAME_PIPELINE: Readonly<ResolutionDisplayConfig> = {
  DIAMETER_FROM_700_TO_1200: 12,    // Đường kính 700-1200mm: hiển thị label từ resolution 12 trở xuống
  DIAMETER_FROM_350_TO_700: 8,      // Đường kính 350-700mm: hiển thị label từ resolution 8 trở xuống
  DIAMETER_FROM_160_TO_350: 5,      // Đường kính 160-350mm: hiển thị label từ resolution 5 trở xuống
  DIAMETER_FROM_80_TO_160: 2,       // Đường kính 80-160mm: hiển thị label từ resolution 2 trở xuống
  DIAMETER_FROM_40_TO_80: 1,        // Đường kính 40-80mm: hiển thị label từ resolution 1 trở xuống
  DIAMETER_FROM_15_TO_40: 0.5,      // Đường kính 15-40mm: hiển thị label từ resolution 0.5 trở xuống
} as const;

/**
 * Hệ số scale cho resolution
 */
export const NUMBER_SCALE_RESOLUTION: number = 1;

/**
 * Resolution tối đa cho các loại đối tượng
 * Resolution tại zoom 16 ≈ 2.389
 */
export const MAX_RESOLUTION_OF_HO: number = 2;
export const MAX_RESOLUTION_OF_VAN: number = 2;

/**
 * Tên các layer trong API
 */
export const LAYER_NAMES: Readonly<LayerNames> = {
  DUONG_ONG_CHINH: 'ViewDuongOngChinhs',
  DUONG_ONG_CHINH_C3: 'ViewDuongOngChinhC3s',
  DUONG_ONG_NGHIEM_THU: 'ViewDuongOngNghiemThus',
  DUONG_ONG_OVERLAY: 'DuongOngChinhOverlays',
  DONG_HO_KHACH_HANG: 'ViewDongHoKhachHangs',
  VAN: 'ViewVans',
  DMA: 'ViewDMAs'
} as const;

/**
 * Cấu hình hiển thị layer
 */
export const LAYER_DISPLAY_CONFIG: Readonly<LayerDisplayConfig> = {
  DUONG_ONG_CHINH: {
    title: 'Bản đồ đường ống',
    visible: true,
    zIndex: 100
  },
  DUONG_ONG_CHINH_C3: {
    title: 'Bản đồ đường ống C3',
    visible: true,
    zIndex: 101
  },
  DUONG_ONG_NGHIEM_THU: {
    title: 'Đường ống nghiệm thu',
    visible: false,  // Mặc định ẩn
    zIndex: 102
  },
  DUONG_ONG_OVERLAY: {
    title: 'Bản đồ đường ống kết nối',
    visible: false,  // Mặc định ẩn
    zIndex: 2000
  }
} as const;

/**
 * Màu sắc đường ống theo vật liệu và đường kính
 */
export const PIPE_COLORS: Readonly<PipeColors> = {
  THEP: '#FF0000',           // Đỏ - Thép
  HDPE_110: '#00FF00',       // Xanh lá cây - HDPE 110mm
  HDPE_90: '#00FFFF',        // Xanh ngọc (Cyan) - HDPE 90mm
  HDPE_63: '#0000FF',        // Xanh dương - HDPE 63mm
  HDPE_50: '#F56A80',        // Hồng - HDPE 50mm
  HDPE_LESS_50: '#FFFF00',   // Vàng - HDPE < 50mm
  DIAMETER_GT_250: '#FFA500', // Cam - Đường kính > 250mm
  DIAMETER_150_250: '#800080', // Tím - Đường kính 150-250mm
  DEFAULT: '#8B4513'         // Nâu - Mặc định
} as const;

/**
 * Cấu hình bản đồ
 */
export const MAP_CONFIG: Readonly<MapConfig> = {
  DEFAULT_CENTER: [105.695587, 18.671575], // Tọa độ Nghệ An, Việt Nam
  DEFAULT_ZOOM: 12,
  MIN_ZOOM: 4,
  MAX_ZOOM: 18,
  PROJECTION: 'EPSG:3857'
} as const;

/**
 * API endpoints
 */
export const API_ENDPOINTS: Readonly<ApiEndpoints> = {
  GEO_JSON: '/GEOJson/Index',
  DUONG_ONG_CHINH: '/api/services/app/DuongOngChinh',
  TILE: '/api/services/app/Tile/GetTile'
} as const;

/**
 * Config Service - Tổng hợp tất cả config
 */
interface ConfigServiceInterface {
  readonly RESOLUTION_DISPLAY_NAME_PIPELINE: ResolutionDisplayConfig;
  readonly NUMBER_SCALE_RESOLUTION: number;
  readonly MAX_RESOLUTION_OF_HO: number;
  readonly MAX_RESOLUTION_OF_VAN: number;
  readonly LAYER_NAMES: LayerNames;
  readonly LAYER_DISPLAY_CONFIG: LayerDisplayConfig;
  readonly PIPE_COLORS: PipeColors;
  readonly MAP_CONFIG: MapConfig;
  readonly API_ENDPOINTS: ApiEndpoints;
}

const configService: ConfigServiceInterface = {
  RESOLUTION_DISPLAY_NAME_PIPELINE,
  NUMBER_SCALE_RESOLUTION,
  MAX_RESOLUTION_OF_HO,
  MAX_RESOLUTION_OF_VAN,
  LAYER_NAMES,
  LAYER_DISPLAY_CONFIG,
  PIPE_COLORS,
  MAP_CONFIG,
  API_ENDPOINTS
} as const;

export default configService;
