/**
 * GeoService - Service để gọi API lấy dữ liệu GeoJSON
 * Pattern giống với services/ trong nawasco-web-gis (class-based, singleton)
 */

import http from './httpService.ts';
import { LAYER_NAMES, API_ENDPOINTS } from './configService.ts';
import type { 
  GeoJSONFeatureCollection, 
  DuongOngProperties,
  DiemChayProperties,
  AllDuongOngLayersResult 
} from '../types/index.ts';

/**
 * Type alias cho GeoJSON response
 */
type GeoJSONResponse = GeoJSONFeatureCollection<DuongOngProperties>;

/**
 * Lấy dữ liệu GeoJSON theo layer
 */
async function getGeoJsonByLayer(layerName: string): Promise<GeoJSONResponse> {
  const { data } = await http.get<GeoJSONResponse>(API_ENDPOINTS.GEO_JSON, {
    params: { LAYERS: layerName }
  });
  console.log(`[GeoService] Loaded layer ${layerName}:`, data?.features?.length || 0, 'features');
  return data;
}

/**
 * Lấy dữ liệu đường ống chính
 */
const getDuongOngChinh = (): Promise<GeoJSONResponse> => 
  getGeoJsonByLayer(LAYER_NAMES.DUONG_ONG_CHINH);

/**
 * Lấy dữ liệu đường ống chính C3
 */
const getDuongOngChinhC3 = (): Promise<GeoJSONResponse> => 
  getGeoJsonByLayer(LAYER_NAMES.DUONG_ONG_CHINH_C3);

/**
 * Lấy dữ liệu đường ống nghiệm thu
 */
const getDuongOngNghiemThu = (): Promise<GeoJSONResponse> => 
  getGeoJsonByLayer(LAYER_NAMES.DUONG_ONG_NGHIEM_THU);

/**
 * Lấy dữ liệu đường ống overlay
 */
const getDuongOngOverlay = (): Promise<GeoJSONResponse> => 
  getGeoJsonByLayer(LAYER_NAMES.DUONG_ONG_OVERLAY);

/**
 * Lấy dữ liệu đồng hồ khách hàng
 */
const getDongHoKhachHang = (): Promise<GeoJSONResponse> => 
  getGeoJsonByLayer(LAYER_NAMES.DONG_HO_KHACH_HANG);

/**
 * Lấy dữ liệu van
 */
const getVan = (): Promise<GeoJSONResponse> => 
  getGeoJsonByLayer(LAYER_NAMES.VAN);

/**
 * Lấy dữ liệu DMA
 */
const getDMA = (): Promise<GeoJSONResponse> => 
  getGeoJsonByLayer(LAYER_NAMES.DMA);

/**
 * Lấy dữ liệu điểm SCADA Logger (tín hiệu áp lực / lưu lượng)
 */
const getViewLoggers = (): Promise<GeoJSONResponse> => 
  getGeoJsonByLayer(LAYER_NAMES.VIEW_LOGGERS);

/**
 * Lấy tất cả các layer đường ống cùng lúc
 */
async function getAllDuongOngLayers(): Promise<AllDuongOngLayersResult> {
  const [duongOngChinh, duongOngChinhC3, duongOngNghiemThu, duongOngOverlay] = await Promise.all([
    getDuongOngChinh(),
    getDuongOngChinhC3(),
    getDuongOngNghiemThu(),
    getDuongOngOverlay()
  ]);

  return { duongOngChinh, duongOngChinhC3, duongOngNghiemThu, duongOngOverlay };
}

// Geo Service object
const geoService = {
  getGeoJsonByLayer,
  getDuongOngChinh,
  getDuongOngChinhC3,
  getDuongOngNghiemThu,
  getDuongOngOverlay,
  getDongHoKhachHang,
  getVan,
  getDMA,
  getViewLoggers,
  getAllDuongOngLayers
};

// Named exports
export {
  getGeoJsonByLayer,
  getDuongOngChinh,
  getDuongOngChinhC3,
  getDuongOngNghiemThu,
  getDuongOngOverlay,
  getDongHoKhachHang,
  getVan,
  getDMA,
  getViewLoggers,
  getAllDuongOngLayers
};

// Export LAYERS constant cho backward compatibility
export const LAYERS = LAYER_NAMES;

// Default export
export default geoService;
/**
 * Lấy dữ liệu Điểm chảy (ViewGiaoKhoans)
 */
export const getDiemChay = async (): Promise<GeoJSONFeatureCollection<DiemChayProperties>> => {
    return (await getGeoJsonByLayer(LAYER_NAMES.DIEM_CHAY)) as unknown as GeoJSONFeatureCollection<DiemChayProperties>;
};
