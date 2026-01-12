/**
 * StyleService - Service để tạo style cho các layer trên bản đồ
 * Bao gồm logic hiển thị theo resolution/zoom levels
 * Pattern giống với lib/utils.js trong nawasco-web-gis
 */

import { Style, Stroke, Fill, Circle, Text } from 'ol/style';
import { 
    RESOLUTION_DISPLAY_NAME_PIPELINE, 
    NUMBER_SCALE_RESOLUTION,
    PIPE_COLORS 
} from './configService.js';

/**
 * Định nghĩa màu sắc - giữ backward compatibility
 */
export const COLORS = {
    DO: PIPE_COLORS.THEP,
    XANH_LA_CAY: PIPE_COLORS.HDPE_110,
    CYAN: PIPE_COLORS.HDPE_90,
    XANH_DUONG: PIPE_COLORS.HDPE_63,
    HONG: PIPE_COLORS.HDPE_50,
    VANG: PIPE_COLORS.HDPE_LESS_50,
    TIM: PIPE_COLORS.DIAMETER_150_250,
    CAM: PIPE_COLORS.DIAMETER_GT_250,
    NAU: PIPE_COLORS.DEFAULT
};

// Hiển thị tất cả đường ống
export const MIN_DUONG_KINH = 0;

/**
 * Lấy màu sắc dựa trên vật liệu và đường kính
 * Logic giống với NLayerDuongOngChinh.js trong nawasco-web-gis
 * 
 * @param {string} maLoaiVatLieu - Mã loại vật liệu (Thép, HDPE, PVC, etc.)
 * @param {number} duongKinh - Đường kính đường ống (mm)
 * @returns {string} - Mã màu hex
 */
export function getColorByMaLoaiVatLieuAndDuongKinh(maLoaiVatLieu, duongKinh) {
    // Ưu tiên 1: Vật liệu Thép
    if (maLoaiVatLieu === 'Thép') {
        return COLORS.DO;
    }
    
    // Ưu tiên 2: HDPE với các đường kính cụ thể
    if (maLoaiVatLieu === 'HDPE') {
        if (duongKinh === 110) return COLORS.XANH_LA_CAY;
        if (duongKinh === 90) return COLORS.CYAN;
        if (duongKinh === 63) return COLORS.XANH_DUONG;
        if (duongKinh === 50) return COLORS.HONG;
        if (duongKinh < 50) return COLORS.VANG;
    }
    
    // Ưu tiên 3: Theo đường kính (áp dụng cho tất cả vật liệu)
    if (duongKinh > 250) {
        return COLORS.CAM;
    }
    if (duongKinh >= 150) {
        return COLORS.TIM;
    }
    
    // Mặc định
    return COLORS.NAU;
}

/**
 * Backward compatibility - alias cho hàm cũ
 */
export function getColorByVatLieuAndDuongKinh(vatLieu, duongKinh) {
    // Chuyển đổi từ VatLieu (tên đầy đủ) sang MaLoaiVatLieu
    let maLoaiVatLieu = '';
    if (vatLieu) {
        const upperVatLieu = vatLieu.toUpperCase();
        if (upperVatLieu.includes('THÉP') || upperVatLieu.includes('THEP')) {
            maLoaiVatLieu = 'Thép';
        } else if (upperVatLieu.includes('HDPE')) {
            maLoaiVatLieu = 'HDPE';
        } else if (upperVatLieu.includes('PVC')) {
            maLoaiVatLieu = 'PVC';
        } else if (upperVatLieu.includes('GANG')) {
            maLoaiVatLieu = 'GANG';
        } else if (upperVatLieu.includes('PPR')) {
            maLoaiVatLieu = 'PPR';
        } else if (upperVatLieu.includes('COMPOSIT')) {
            maLoaiVatLieu = 'Composit';
        }
    }
    return getColorByMaLoaiVatLieuAndDuongKinh(maLoaiVatLieu, duongKinh);
}

/**
 * Xác định label đường ống có nên hiển thị hay không dựa trên resolution
 * Logic từ configDisplayNamePipeline trong lib/utils.js
 * 
 * @param {import('ol/Feature').default} feature - Feature đường ống
 * @param {number} resolution - Resolution hiện tại của view
 * @returns {string} - Tên vật liệu hoặc chuỗi rỗng nếu không hiển thị
 */
export function configDisplayNamePipeline(feature, resolution) {
    if (!feature || !resolution) return '';
    
    const duongKinh = Number(feature.get('DuongKinh') || feature.get('duongKinh') || 0);
    const vatLieu = feature.get('VatLieu') || feature.get('vatLieu') || '';
    
    const scaledResolution = resolution * NUMBER_SCALE_RESOLUTION;
    
    switch (true) {
        case duongKinh <= 40:
            return scaledResolution <= RESOLUTION_DISPLAY_NAME_PIPELINE.DIAMETER_FROM_15_TO_40
                ? vatLieu : '';
        case duongKinh <= 80:
            return scaledResolution <= RESOLUTION_DISPLAY_NAME_PIPELINE.DIAMETER_FROM_40_TO_80
                ? vatLieu : '';
        case duongKinh <= 160:
            return scaledResolution <= RESOLUTION_DISPLAY_NAME_PIPELINE.DIAMETER_FROM_80_TO_160
                ? vatLieu : '';
        case duongKinh <= 350:
            return scaledResolution <= RESOLUTION_DISPLAY_NAME_PIPELINE.DIAMETER_FROM_160_TO_350
                ? vatLieu : '';
        case duongKinh <= 700:
            return scaledResolution <= RESOLUTION_DISPLAY_NAME_PIPELINE.DIAMETER_FROM_350_TO_700
                ? vatLieu : '';
        case duongKinh <= 1200:
            return scaledResolution <= RESOLUTION_DISPLAY_NAME_PIPELINE.DIAMETER_FROM_700_TO_1200
                ? vatLieu : '';
        default:
            return '';
    }
}

/**
 * Tính độ rộng đường vẽ dựa trên đường kính
 * @param {number} duongKinh - Đường kính (mm)
 * @returns {number} - Độ rộng stroke
 */
function getStrokeWidth(duongKinh) {
    if (duongKinh > 250) return 5;
    if (duongKinh >= 150) return 4;
    if (duongKinh >= 90) return 3;
    return 2;
}

/**
 * Tạo style cho đường ống với logic resolution-based
 * Pattern giống configStyleDuongOng trong lib/utils.js
 * 
 * @param {import('ol/Feature').default} feature - Feature đường ống
 * @param {string} color - Màu sắc
 * @param {number} resolution - Resolution hiện tại
 * @param {boolean} bIsDuongOngNghiemThu - Có phải đường ống nghiệm thu không
 * @returns {Style|Style[]} - Style hoặc mảng styles
 */
export function configStyleDuongOng(feature, color, resolution, bIsDuongOngNghiemThu = false) {
    const duongKinh = Number(feature.get('DuongKinh') || feature.get('duongKinh') || 0);
    const width = getStrokeWidth(duongKinh);
    
    // Kiểm tra nếu feature được chọn
    if (feature.get('selected')) {
        return [
            new Style({
                stroke: new Stroke({
                    color: 'white',
                    width: 8
                }),
                text: new Text({
                    textAlign: 'center',
                    textBaseline: 'alphabetic',
                    font: 'Courier New',
                    stroke: new Stroke({ color: '#1a237e', width: 0.3 }),
                    placement: 'line',
                    text: configDisplayNamePipeline(feature, resolution)
                })
            }),
            new Style({
                stroke: new Stroke({
                    color: color,
                    width: 3
                })
            })
        ];
    }
    
    // Kiểm tra nếu feature được chọn để kết nối
    if (feature.get('selectPipeConnect')) {
        return [
            new Style({
                stroke: new Stroke({
                    color: 'yellow',
                    width: 12
                })
            }),
            new Style({
                stroke: new Stroke({
                    color: 'white',
                    width: 7
                }),
                text: new Text({
                    textAlign: 'center',
                    textBaseline: 'alphabetic',
                    font: 'Courier New',
                    stroke: new Stroke({ color: '#1a237e', width: 0.3 }),
                    placement: 'line',
                    text: configDisplayNamePipeline(feature, resolution)
                })
            }),
            new Style({
                stroke: new Stroke({
                    color: color,
                    width: 3
                })
            })
        ];
    }
    
    // Style mặc định
    const labelText = bIsDuongOngNghiemThu 
        ? (feature.get('TenVatTu') || '') 
        : configDisplayNamePipeline(feature, resolution);
    
    return new Style({
        stroke: new Stroke({
            color: color,
            width: width
        }),
        text: new Text({
            textAlign: 'center',
            textBaseline: 'alphabetic',
            font: 'Courier New',
            stroke: new Stroke({ color: '#1a237e', width: 0.3 }),
            placement: 'line',
            text: labelText
        })
    });
}

/**
 * Tạo style cho đường ống - Đơn giản (backward compatibility)
 * @param {import('ol/Feature').default} feature - Feature đường ống
 * @returns {Style|null} - Style hoặc null nếu không hiển thị
 */
export function getDuongOngStyle(feature) {
    const properties = feature.getProperties();
    
    const vatLieu = properties.VatLieu || properties.vatLieu || properties.VATLIEU || '';
    const maLoaiVatLieu = properties.MaLoaiVatLieu || properties.maLoaiVatLieu || '';
    const duongKinh = parseFloat(properties.DuongKinh || properties.duongKinh || properties.DUONGKINH || 0);

    if (duongKinh < MIN_DUONG_KINH) {
        return null;
    }

    // Ưu tiên MaLoaiVatLieu nếu có, nếu không thì dùng VatLieu
    const color = maLoaiVatLieu 
        ? getColorByMaLoaiVatLieuAndDuongKinh(maLoaiVatLieu, duongKinh)
        : getColorByVatLieuAndDuongKinh(vatLieu, duongKinh);

    const width = getStrokeWidth(duongKinh);

    return new Style({
        stroke: new Stroke({
            color: color,
            width: width
        })
    });
}

/**
 * Style function cho layer đường ống chính (với resolution)
 * Pattern giống NLayerDuongOngChinh.js
 * 
 * @param {import('ol/Feature').default} feature - Feature đường ống
 * @param {number} resolution - Độ phân giải hiện tại
 * @returns {Style|Style[]}
 */
export function duongOngChinhStyleFunction(feature, resolution) {
    const maLoaiVatLieu = feature.get('MaLoaiVatLieu') || '';
    const duongKinh = Number(feature.get('DuongKinh') || 0);
    
    const color = getColorByMaLoaiVatLieuAndDuongKinh(maLoaiVatLieu, duongKinh);
    
    return configStyleDuongOng(feature, color, resolution, false);
}

/**
 * Style function cho layer đường ống nghiệm thu
 * Pattern giống NLayerDuongOngNghiemThu.js
 * 
 * @param {import('ol/Feature').default} feature - Feature đường ống nghiệm thu
 * @param {number} resolution - Độ phân giải hiện tại
 * @returns {Style|Style[]}
 */
export function duongOngNghiemThuStyleFunction(feature, resolution) {
    // Đường ống nghiệm thu luôn màu xanh lá
    return configStyleDuongOng(feature, 'green', resolution, true);
}

/**
 * Style function cho layer đường ống overlay
 * Pattern giống NLayerDuongOngChinhOverlay.js
 * 
 * @param {import('ol/Feature').default} feature - Feature đường ống overlay
 * @param {number} resolution - Độ phân giải hiện tại
 * @returns {Style}
 */
export function duongOngOverlayStyleFunction(feature, resolution) {
    const color = feature.get('Color') || 'blue';
    const vatLieu = feature.get('VatLieu') || '';
    
    // Hiển thị text khi resolution rất nhỏ (zoom gần)
    const showText = resolution * 10000 < 1;
    
    return new Style({
        stroke: new Stroke({
            color: color,
            width: 2
        }),
        text: new Text({
            textAlign: 'center',
            textBaseline: 'alphabetic',
            font: 'Courier New',
            stroke: new Stroke({ color: '#1a237e', width: 0.3 }),
            placement: 'line',
            text: showText ? vatLieu : ''
        })
    });
}

/**
 * Backward compatibility - alias
 */
export function duongOngStyleFunction(feature, resolution) {
    return duongOngChinhStyleFunction(feature, resolution);
}

export default {
    COLORS,
    MIN_DUONG_KINH,
    getColorByVatLieuAndDuongKinh,
    getColorByMaLoaiVatLieuAndDuongKinh,
    configDisplayNamePipeline,
    configStyleDuongOng,
    getDuongOngStyle,
    duongOngStyleFunction,
    duongOngChinhStyleFunction,
    duongOngNghiemThuStyleFunction,
    duongOngOverlayStyleFunction
};
