/**
 * GeoService - Service để gọi API lấy dữ liệu GeoJSON
 */

const API_BASE_URL = 'http://118.70.151.182:1223';

/**
 * Cấu hình mặc định cho các request
 */
const defaultHeaders = {
  'accept': '*/*',
  'accept-language': 'vi,en-US;q=0.9,en-GB;q=0.8,en;q=0.7',
  'Referer': 'http://gis.nawasco.com.vn/'
};

/**
 * Lấy dữ liệu GeoJSON theo layer
 * @param {string} layerName - Tên layer cần lấy (ví dụ: ViewDuongOngChinhs)
 * @returns {Promise<Object>} - GeoJSON data
 */
export async function getGeoJsonByLayer(layerName) {
  try {
    const url = `${API_BASE_URL}/GEOJson/Index?LAYERS=${layerName}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: defaultHeaders,
      body: null
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Lỗi khi lấy dữ liệu layer ${layerName}:`, error);
    throw error;
  }
}

/**
 * Lấy dữ liệu đường ống chính
 * @returns {Promise<Object>} - GeoJSON data của đường ống chính
 */
export async function getDuongOngChinh() {
  return getGeoJsonByLayer('ViewDuongOngChinhs');
}

/**
 * Các layer có sẵn
 */
export const LAYERS = {
  DUONG_ONG_CHINH: 'ViewDuongOngChinhs'
};

export default {
  getGeoJsonByLayer,
  getDuongOngChinh,
  LAYERS
};
