/**
 * GeoService - Service để gọi API lấy dữ liệu GeoJSON
 * Pattern giống với services/ trong nawasco-web-gis (class-based, singleton)
 */

import httpService from './httpService.js';
import { LAYER_NAMES, API_ENDPOINTS } from './configService.js';

/**
 * Class GeoService xử lý tất cả các API calls liên quan đến GeoJSON
 */
class GeoService {
    /**
     * Lấy dữ liệu GeoJSON theo layer
     * @param {string} layerName - Tên layer cần lấy
     * @returns {Promise<Object>} - GeoJSON data
     */
    async getGeoJsonByLayer(layerName) {
        try {
            const endpoint = `${API_ENDPOINTS.GEO_JSON}?LAYERS=${layerName}`;
            const data = await httpService.get(endpoint);
            console.log(`[GeoService] Loaded layer ${layerName}:`, data?.features?.length || 0, 'features');
            return data;
        } catch (error) {
            console.error(`[GeoService] Error loading layer ${layerName}:`, error);
            throw error;
        }
    }

    /**
     * Lấy dữ liệu đường ống chính
     * @returns {Promise<Object>} - GeoJSON data của đường ống chính
     */
    async getDuongOngChinh() {
        return this.getGeoJsonByLayer(LAYER_NAMES.DUONG_ONG_CHINH);
    }

    /**
     * Lấy dữ liệu đường ống chính C3
     * @returns {Promise<Object>} - GeoJSON data của đường ống C3
     */
    async getDuongOngChinhC3() {
        return this.getGeoJsonByLayer(LAYER_NAMES.DUONG_ONG_CHINH_C3);
    }

    /**
     * Lấy dữ liệu đường ống nghiệm thu
     * @returns {Promise<Object>} - GeoJSON data của đường ống nghiệm thu
     */
    async getDuongOngNghiemThu() {
        return this.getGeoJsonByLayer(LAYER_NAMES.DUONG_ONG_NGHIEM_THU);
    }

    /**
     * Lấy dữ liệu đường ống overlay (đường ống kết nối)
     * @returns {Promise<Object>} - GeoJSON data của đường ống overlay
     */
    async getDuongOngOverlay() {
        return this.getGeoJsonByLayer(LAYER_NAMES.DUONG_ONG_OVERLAY);
    }

    /**
     * Lấy dữ liệu đồng hồ khách hàng
     * @returns {Promise<Object>} - GeoJSON data của đồng hồ khách hàng
     */
    async getDongHoKhachHang() {
        return this.getGeoJsonByLayer(LAYER_NAMES.DONG_HO_KHACH_HANG);
    }

    /**
     * Lấy dữ liệu van
     * @returns {Promise<Object>} - GeoJSON data của van
     */
    async getVan() {
        return this.getGeoJsonByLayer(LAYER_NAMES.VAN);
    }

    /**
     * Lấy dữ liệu DMA
     * @returns {Promise<Object>} - GeoJSON data của DMA
     */
    async getDMA() {
        return this.getGeoJsonByLayer(LAYER_NAMES.DMA);
    }

    /**
     * Lấy tất cả các layer đường ống cùng lúc
     * @returns {Promise<Object>} - Object chứa tất cả GeoJSON data
     */
    async getAllDuongOngLayers() {
        try {
            const [duongOngChinh, duongOngChinhC3, duongOngNghiemThu, duongOngOverlay] = await Promise.all([
                this.getDuongOngChinh(),
                this.getDuongOngChinhC3(),
                this.getDuongOngNghiemThu(),
                this.getDuongOngOverlay()
            ]);

            return {
                duongOngChinh,
                duongOngChinhC3,
                duongOngNghiemThu,
                duongOngOverlay
            };
        } catch (error) {
            console.error('[GeoService] Error loading all duong ong layers:', error);
            throw error;
        }
    }
}

// Export singleton instance (pattern giống nawasco-web-gis)
const geoService = new GeoService();

// Named exports cho backward compatibility
export const getGeoJsonByLayer = (layerName) => geoService.getGeoJsonByLayer(layerName);
export const getDuongOngChinh = () => geoService.getDuongOngChinh();
export const getDuongOngChinhC3 = () => geoService.getDuongOngChinhC3();
export const getDuongOngNghiemThu = () => geoService.getDuongOngNghiemThu();
export const getDuongOngOverlay = () => geoService.getDuongOngOverlay();
export const getDongHoKhachHang = () => geoService.getDongHoKhachHang();
export const getVan = () => geoService.getVan();
export const getDMA = () => geoService.getDMA();
export const getAllDuongOngLayers = () => geoService.getAllDuongOngLayers();

// Export LAYERS constant cho backward compatibility
export const LAYERS = LAYER_NAMES;

// Default export singleton
export default geoService;
