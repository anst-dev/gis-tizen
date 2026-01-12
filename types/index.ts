/**
 * Types/Interfaces cho GIS Tizen
 * Định nghĩa các kiểu dữ liệu dùng chung trong toàn bộ ứng dụng
 */

import type { Feature } from 'ol';
import type { Geometry } from 'ol/geom';
import type VectorSource from 'ol/source/Vector';

// ============================================
// CONFIG TYPES
// ============================================

/**
 * Cấu hình resolution để hiển thị label đường ống
 */
export interface ResolutionDisplayConfig {
  DIAMETER_FROM_700_TO_1200: number;
  DIAMETER_FROM_350_TO_700: number;
  DIAMETER_FROM_160_TO_350: number;
  DIAMETER_FROM_80_TO_160: number;
  DIAMETER_FROM_40_TO_80: number;
  DIAMETER_FROM_15_TO_40: number;
}

/**
 * Tên các layer trong API
 */
export interface LayerNames {
  DUONG_ONG_CHINH: string;
  DUONG_ONG_CHINH_C3: string;
  DUONG_ONG_NGHIEM_THU: string;
  DUONG_ONG_OVERLAY: string;
  DONG_HO_KHACH_HANG: string;
  VAN: string;
  DMA: string;
}

/**
 * Cấu hình hiển thị cho một layer
 */
export interface LayerDisplayConfigItem {
  title: string;
  visible: boolean;
  zIndex: number;
}

/**
 * Cấu hình hiển thị cho tất cả các layer
 */
export interface LayerDisplayConfig {
  DUONG_ONG_CHINH: LayerDisplayConfigItem;
  DUONG_ONG_CHINH_C3: LayerDisplayConfigItem;
  DUONG_ONG_NGHIEM_THU: LayerDisplayConfigItem;
  DUONG_ONG_OVERLAY: LayerDisplayConfigItem;
}

/**
 * Màu sắc đường ống
 */
export interface PipeColors {
  THEP: string;
  HDPE_110: string;
  HDPE_90: string;
  HDPE_63: string;
  HDPE_50: string;
  HDPE_LESS_50: string;
  DIAMETER_GT_250: string;
  DIAMETER_150_250: string;
  DEFAULT: string;
}

/**
 * Cấu hình bản đồ
 */
export interface MapConfig {
  DEFAULT_CENTER: [number, number];
  DEFAULT_ZOOM: number;
  MIN_ZOOM: number;
  MAX_ZOOM: number;
  PROJECTION: string;
}

/**
 * API endpoints
 */
export interface ApiEndpoints {
  GEO_JSON: string;
  DUONG_ONG_CHINH: string;
  TILE: string;
}

// ============================================
// GEOJSON TYPES
// ============================================

/**
 * GeoJSON Feature properties cho đường ống
 */
export interface DuongOngProperties {
  Id?: number;
  Code?: string;
  VatLieu?: string;
  MaLoaiVatLieu?: string;
  DuongKinh?: number;
  ChieuDai?: number;
  selected?: boolean;
  selectPipeConnect?: boolean;
  Color?: string;
  TenVatTu?: string;
  NoiDung?: string;
}

/**
 * GeoJSON Feature
 */
export interface GeoJSONFeature<T = Record<string, unknown>> {
  type: 'Feature';
  geometry: {
    type: string;
    coordinates: number[] | number[][] | number[][][];
  };
  properties: T;
}

/**
 * GeoJSON FeatureCollection
 */
export interface GeoJSONFeatureCollection<T = Record<string, unknown>> {
  type: 'FeatureCollection';
  features: GeoJSONFeature<T>[];
}

// ============================================
// HTTP SERVICE TYPES
// ============================================

/**
 * HTTP Request options
 */
export interface HttpRequestOptions extends RequestInit {
  headers?: Record<string, string>;
  timeout?: number;
}

/**
 * HTTP Error với status
 */
export interface HttpError extends Error {
  status?: number;
  statusText?: string;
}

// ============================================
// STYLE SERVICE TYPES
// ============================================

/**
 * Màu sắc enum
 */
export interface Colors {
  DO: string;
  XANH_LA_CAY: string;
  CYAN: string;
  XANH_DUONG: string;
  HONG: string;
  VANG: string;
  TIM: string;
  CAM: string;
  NAU: string;
}

/**
 * Loại vật liệu đường ống
 */
export type MaLoaiVatLieu = 'Thép' | 'HDPE' | 'PVC' | 'GANG' | 'PPR' | 'Composit' | '';

// ============================================
// GEO SERVICE TYPES
// ============================================

/**
 * Kết quả load tất cả layer đường ống
 */
export interface AllDuongOngLayersResult {
  duongOngChinh: GeoJSONFeatureCollection<DuongOngProperties>;
  duongOngChinhC3: GeoJSONFeatureCollection<DuongOngProperties>;
  duongOngNghiemThu: GeoJSONFeatureCollection<DuongOngProperties>;
  duongOngOverlay: GeoJSONFeatureCollection<DuongOngProperties>;
}

// ============================================
// MAP TYPES
// ============================================

/**
 * Cấu hình ứng dụng
 */
export interface AppConfig {
  DEFAULT_CENTER: [number, number];
  DEFAULT_ZOOM: number;
  MIN_ZOOM: number;
  MAX_ZOOM: number;
  PROJECTION: string;
}

/**
 * Custom Feature với layer reference
 */
export interface FeatureWithLayer extends Feature<Geometry> {
  layer?: {
    get(key: string): unknown;
  };
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Load GeoJSON function params
 */
export interface LoadGeoJsonParams {
  source: VectorSource;
  geoJsonData: GeoJSONFeatureCollection;
  layerName: string;
}

/**
 * Promise settled result
 */
export interface SettledResult<T> {
  status: 'fulfilled' | 'rejected';
  value?: T;
  reason?: unknown;
}

// Re-export OpenLayers types cho tiện sử dụng
export type { Feature } from 'ol';
export type { Geometry } from 'ol/geom';
export type { Style } from 'ol/style';
