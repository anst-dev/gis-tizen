/**
 * StyleService - Service để tạo style cho các layer trên bản đồ
 */

import { Style, Stroke, Fill, Circle } from 'ol/style';

/**
 * Quy tắc màu sắc cho đường ống theo vật liệu và đường kính
 * - Vật liệu "Thép": Màu đỏ
 * - Vật liệu "HDPE", Đường kính 110mm: Xanh lá cây
 * - Vật liệu "HDPE", Đường kính 90mm: Xanh ngọc (Cyan)
 * - Vật liệu "HDPE", Đường kính 63mm: Xanh dương
 * - Vật liệu "HDPE", Đường kính 50mm: Hồng (#F56A80)
 * - Vật liệu "HDPE", Đường kính < 50mm: Vàng
 * - Đường kính từ 150mm đến 250mm: Màu tím
 * - Đường kính lớn hơn 250mm: Màu cam
 * - Tất cả các trường hợp còn lại: Màu nâu
 */

// Định nghĩa màu sắc
const COLORS = {
  DO: '#FF0000',           // Đỏ - Thép
  XANH_LA_CAY: '#00FF00',  // Xanh lá cây - HDPE 110mm
  CYAN: '#00FFFF',         // Xanh ngọc - HDPE 90mm
  XANH_DUONG: '#0000FF',   // Xanh dương - HDPE 63mm
  HONG: '#F56A80',         // Hồng - HDPE 50mm
  VANG: '#FFFF00',         // Vàng - HDPE < 50mm
  TIM: '#800080',          // Tím - 150mm đến 250mm
  CAM: '#FFA500',          // Cam - > 250mm
  NAU: '#8B4513'           // Nâu - Trường hợp còn lại
};

// Kích thước tối thiểu để hiển thị (từ 90 trở lên)
const MIN_DUONG_KINH = 90;

/**
 * Lấy màu sắc dựa trên vật liệu và đường kính
 * @param {string} vatLieu - Vật liệu đường ống
 * @param {number} duongKinh - Đường kính đường ống (mm)
 * @returns {string} - Mã màu hex
 */
export function getColorByVatLieuAndDuongKinh(vatLieu, duongKinh) {
  // Đường kính lớn hơn 250mm: Màu cam (ưu tiên cao nhất)
  if (duongKinh > 250) {
    return COLORS.CAM;
  }

  // Đường kính từ 150mm đến 250mm: Màu tím
  if (duongKinh >= 150 && duongKinh <= 250) {
    return COLORS.TIM;
  }

  // Vật liệu Thép: Màu đỏ
  if (vatLieu && vatLieu.toUpperCase().includes('THÉP') || vatLieu && vatLieu.toUpperCase().includes('THEP')) {
    return COLORS.DO;
  }

  // Vật liệu HDPE với các đường kính cụ thể
  if (vatLieu && vatLieu.toUpperCase().includes('HDPE')) {
    if (duongKinh === 110) {
      return COLORS.XANH_LA_CAY;
    }
    if (duongKinh === 90) {
      return COLORS.CYAN;
    }
    if (duongKinh === 63) {
      return COLORS.XANH_DUONG;
    }
    if (duongKinh === 50) {
      return COLORS.HONG;
    }
    if (duongKinh < 50) {
      return COLORS.VANG;
    }
  }

  // Trường hợp còn lại: Màu nâu
  return COLORS.NAU;
}

/**
 * Tạo style cho đường ống
 * @param {import('ol/Feature').default} feature - Feature đường ống
 * @returns {Style|null} - Style hoặc null nếu không hiển thị
 */
export function getDuongOngStyle(feature) {
  const properties = feature.getProperties();
  
  // Lấy thông tin vật liệu và đường kính từ properties
  // Điều chỉnh tên field theo API thực tế
  const vatLieu = properties.VatLieu || properties.vatLieu || properties.VATLIEU || '';
  const duongKinh = parseFloat(properties.DuongKinh || properties.duongKinh || properties.DUONGKINH || 0);

  // Chỉ hiển thị đường ống có kích thước từ 90 trở lên
  if (duongKinh < MIN_DUONG_KINH) {
    return null; // Không hiển thị
  }

  const color = getColorByVatLieuAndDuongKinh(vatLieu, duongKinh);

  // Độ dày đường vẽ dựa trên đường kính
  let width = 2;
  if (duongKinh > 250) {
    width = 5;
  } else if (duongKinh >= 150) {
    width = 4;
  } else if (duongKinh >= 90) {
    width = 3;
  }

  return new Style({
    stroke: new Stroke({
      color: color,
      width: width
    })
  });
}

/**
 * Style function cho layer đường ống (sử dụng với VectorLayer)
 * @param {import('ol/Feature').default} feature - Feature đường ống
 * @param {number} resolution - Độ phân giải hiện tại
 * @returns {Style|null}
 */
export function duongOngStyleFunction(feature, resolution) {
  return getDuongOngStyle(feature);
}

export { COLORS, MIN_DUONG_KINH };

export default {
  getColorByVatLieuAndDuongKinh,
  getDuongOngStyle,
  duongOngStyleFunction,
  COLORS,
  MIN_DUONG_KINH
};
