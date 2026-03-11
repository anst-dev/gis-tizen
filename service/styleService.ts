/**
 * StyleService - Service để tạo style cho các layer trên bản đồ
 * Bao gồm logic hiển thị theo resolution/zoom levels
 * Pattern giống với lib/utils.js trong nawasco-web-gis
 */

import { Style, Stroke, Text, Fill, Circle } from 'ol/style';
import type { FeatureLike } from 'ol/Feature';
import type { StyleFunction } from 'ol/style/Style';
import { 
  PIPE_COLORS,
  RESOLUTION_DISPLAY_NAME_PIPELINE, 
  NUMBER_SCALE_RESOLUTION
} from './configService.ts';
import type { DiemChayProperties, LoggerProperties, Colors, MaLoaiVatLieu } from '../types/index.ts';

/**
 * Định nghĩa màu sắc - giữ backward compatibility
 */
export const COLORS: Readonly<Colors> = {
  DO: PIPE_COLORS.THEP,
  XANH_LA_CAY: PIPE_COLORS.HDPE_110,
  CYAN: PIPE_COLORS.HDPE_90,
  XANH_DUONG: PIPE_COLORS.HDPE_63,
  HONG: PIPE_COLORS.HDPE_50,
  VANG: PIPE_COLORS.HDPE_LESS_50,
  TIM: PIPE_COLORS.DIAMETER_150_250,
  CAM: PIPE_COLORS.DIAMETER_GT_250,
  NAU: PIPE_COLORS.DEFAULT
} as const;

// Hiển thị tất cả đường ống
export const MIN_DUONG_KINH: number = 0;

/**
 * Lấy màu sắc dựa trên vật liệu và đường kính
 */
export function getColorByMaLoaiVatLieuAndDuongKinh(
  maLoaiVatLieu: MaLoaiVatLieu | string, 
  duongKinh: number
): string {
  if (maLoaiVatLieu === 'Thép') return COLORS.DO;
  
  if (maLoaiVatLieu === 'HDPE') {
    if (duongKinh === 110) return COLORS.XANH_LA_CAY;
    if (duongKinh === 90) return COLORS.CYAN;
    if (duongKinh === 63) return COLORS.XANH_DUONG;
    if (duongKinh === 50) return COLORS.HONG;
    if (duongKinh < 50) return COLORS.VANG;
  }
  
  if (duongKinh > 250) return COLORS.CAM;
  if (duongKinh >= 150) return COLORS.TIM;
  
  return COLORS.NAU;
}

/**
 * Backward compatibility - alias cho hàm cũ
 */
export function getColorByVatLieuAndDuongKinh(vatLieu: string, duongKinh: number): string {
  let maLoaiVatLieu: MaLoaiVatLieu = '';
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
 */
export function configDisplayNamePipeline(
  feature: FeatureLike | null | undefined, 
  resolution: number | null | undefined
): string {
  if (!feature || !resolution) return '';
  
  const duongKinh = Number(feature.get('DuongKinh') ?? feature.get('duongKinh') ?? 0);
  const vatLieu = (feature.get('VatLieu') ?? feature.get('vatLieu') ?? '') as string;
  
  const scaledResolution = resolution * NUMBER_SCALE_RESOLUTION;
  
  switch (true) {
    case duongKinh <= 40:
      return scaledResolution <= RESOLUTION_DISPLAY_NAME_PIPELINE.DIAMETER_FROM_15_TO_40 ? vatLieu : '';
    case duongKinh <= 80:
      return scaledResolution <= RESOLUTION_DISPLAY_NAME_PIPELINE.DIAMETER_FROM_40_TO_80 ? vatLieu : '';
    case duongKinh <= 160:
      return scaledResolution <= RESOLUTION_DISPLAY_NAME_PIPELINE.DIAMETER_FROM_80_TO_160 ? vatLieu : '';
    case duongKinh <= 350:
      return scaledResolution <= RESOLUTION_DISPLAY_NAME_PIPELINE.DIAMETER_FROM_160_TO_350 ? vatLieu : '';
    case duongKinh <= 700:
      return scaledResolution <= RESOLUTION_DISPLAY_NAME_PIPELINE.DIAMETER_FROM_350_TO_700 ? vatLieu : '';
    case duongKinh <= 1200:
      return scaledResolution <= RESOLUTION_DISPLAY_NAME_PIPELINE.DIAMETER_FROM_700_TO_1200 ? vatLieu : '';
    default:
      return '';
  }
}

/**
 * Tính độ rộng đường vẽ dựa trên đường kính
 */
function getStrokeWidth(duongKinh: number): number {
  if (duongKinh > 250) return 5;
  if (duongKinh >= 150) return 4;
  if (duongKinh >= 90) return 3;
  return 2;
}

/**
 * Tạo text style cho đường ống
 */
function createTextStyle(text: string): Text {
  return new Text({
    textAlign: 'center',
    textBaseline: 'alphabetic',
    font: 'Courier New',
    stroke: new Stroke({ color: '#1a237e', width: 0.3 }),
    placement: 'line',
    text: text
  });
}

/**
 * Tạo style cho đường ống với logic resolution-based
 */
export function configStyleDuongOng(
  feature: FeatureLike, 
  color: string, 
  resolution: number, 
  bIsDuongOngNghiemThu: boolean = false
): Style | Style[] {
  const duongKinh = Number(feature.get('DuongKinh') ?? feature.get('duongKinh') ?? 0);
  const width = getStrokeWidth(duongKinh);
  
  // Kiểm tra nếu feature được chọn
  if (feature.get('selected')) {
    return [
      new Style({
        stroke: new Stroke({ color: 'white', width: 8 }),
        text: createTextStyle(configDisplayNamePipeline(feature, resolution))
      }),
      new Style({
        stroke: new Stroke({ color: color, width: 3 })
      })
    ];
  }
  
  // Kiểm tra nếu feature được chọn để kết nối
  if (feature.get('selectPipeConnect')) {
    return [
      new Style({
        stroke: new Stroke({ color: 'yellow', width: 12 })
      }),
      new Style({
        stroke: new Stroke({ color: 'white', width: 7 }),
        text: createTextStyle(configDisplayNamePipeline(feature, resolution))
      }),
      new Style({
        stroke: new Stroke({ color: color, width: 3 })
      })
    ];
  }
  
  // Style mặc định
  const labelText = bIsDuongOngNghiemThu 
    ? ((feature.get('TenVatTu') ?? '') as string)
    : configDisplayNamePipeline(feature, resolution);
  
  return new Style({
    stroke: new Stroke({ color: color, width: width }),
    text: createTextStyle(labelText)
  });
}

/**
 * Tạo style cho đường ống - Đơn giản (backward compatibility)
 */
export function getDuongOngStyle(feature: FeatureLike): Style | null {
  const vatLieu = (feature.get('VatLieu') ?? '') as string;
  const maLoaiVatLieu = (feature.get('MaLoaiVatLieu') ?? '') as string;
  const duongKinh = parseFloat(String(feature.get('DuongKinh') ?? 0));

  if (duongKinh < MIN_DUONG_KINH) return null;

  const color = maLoaiVatLieu 
    ? getColorByMaLoaiVatLieuAndDuongKinh(maLoaiVatLieu, duongKinh)
    : getColorByVatLieuAndDuongKinh(vatLieu, duongKinh);

  return new Style({
    stroke: new Stroke({ color: color, width: getStrokeWidth(duongKinh) })
  });
}

/**
 * Style function cho layer đường ống chính (với resolution)
 */
export const duongOngChinhStyleFunction: StyleFunction = (feature, resolution) => {
  const maLoaiVatLieu = (feature.get('MaLoaiVatLieu') ?? '') as string;
  const duongKinh = Number(feature.get('DuongKinh') ?? 0);
  const color = getColorByMaLoaiVatLieuAndDuongKinh(maLoaiVatLieu, duongKinh);
  return configStyleDuongOng(feature, color, resolution, false);
};

/**
 * Style function cho layer đường ống nghiệm thu
 */
export const duongOngNghiemThuStyleFunction: StyleFunction = (feature, resolution) => {
  return configStyleDuongOng(feature, 'green', resolution, true);
};

/**
 * Style function cho layer đường ống overlay
 */
export const duongOngOverlayStyleFunction: StyleFunction = (feature, resolution) => {
  const color = (feature.get('Color') ?? 'blue') as string;
  const vatLieu = (feature.get('VatLieu') ?? '') as string;
  const showText = resolution * 10000 < 1;
  
  return new Style({
    stroke: new Stroke({ color: color, width: 2 }),
    text: createTextStyle(showText ? vatLieu : '')
  });
};

/**
 * Backward compatibility - alias
 */
export const duongOngStyleFunction = duongOngChinhStyleFunction;

/**
 * Style Service object
 */
const styleService = {
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

export default styleService;
/**
 * Tạo style cho điểm SCADA Logger (ViewLoggers)
 * Sử dụng màu sáng (nền trắng/xanh nhạt) khác với điểm chảy (nền tối)
 */
export const viewLoggersStyleFunction = (feature: FeatureLike): Style => {
  const props = feature.getProperties() as LoggerProperties;
  const siteName = props.SiteName ?? '';
  const apUnit = props.ApLucUnit ?? 'bar';
  const llUnit = props.LuuLuongUnit ?? 'm³/h';
  const apLuc = props.ApLuc != null ? `Áp lực: ${props.ApLuc.toFixed(2)} ${apUnit}` : 'Áp lực: N/A';
  const luuLuong = props.LuuLuong != null ? `Lưu lượng: ${props.LuuLuong.toFixed(2)} ${llUnit}` : '';
  const date = props.TimeStamp ? new Date(props.TimeStamp) : null;
  const timeStr = date ? `🕒 ${date.toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit'})} ${date.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}` : '';

  const lines = [siteName, apLuc, luuLuong, timeStr].filter(Boolean);
  const labelText = lines.join('\n');

  return new Style({
    image: new Circle({
      radius: 9,
      fill: new Fill({ color: '#1565C0' }),       // Xanh dương đậm - icon nổi bật trên nền sáng
      stroke: new Stroke({ color: '#FFFFFF', width: 2.5 }) // Viền trắng
    }),
    text: new Text({
      text: labelText,
      font: 'bold 11px Arial, sans-serif',
      fill: new Fill({ color: '#1A237E' }),                // Chữ xanh đậm
      backgroundFill: new Fill({ color: 'rgba(255, 255, 255, 0.92)' }), // Nền trắng sáng
      stroke: new Stroke({ color: 'rgba(21,101,192,0.4)', width: 1 }), // Viền xanh nhạt
      padding: [4, 6, 4, 6],
      textAlign: 'left',
      offsetX: 14,
      offsetY: 0
    })
  });
};

export const configStyleDiemChay = (feature: FeatureLike): Style => {
    const properties = feature.getProperties() as DiemChayProperties;
    const trangThai = properties.TrangThaiXuLy;

    let color = PIPE_COLORS.THEP; // Mặc định: Chờ khảo sát (Đỏ)
    if (trangThai === 'Đang thi công') {
        color = PIPE_COLORS.DIAMETER_GT_250; // Màu Cam
    } else if (trangThai === 'Đã hoàn thành') {
        color = PIPE_COLORS.HDPE_110; // Màu Xanh lá
    }

    const diaDiem = properties.DiaDiem ?? 'Không xác định';
    const nvKT = properties.HoTenNhanVienKyThuat ?? '...';
    const nvTC = properties.HoTenNhanVienThiCong ?? '...';
    const thoiGianHoanThanh = properties.ThoiGianHoanThanh ?? '';

    let textLines = [];
    textLines.push(`📍 ${diaDiem}`);
    textLines.push(`👤 KS: ${nvKT} | TC: ${nvTC}`);
    textLines.push(`📊 Trạng thái: ${trangThai || '...'}`);
    if (thoiGianHoanThanh) {
       textLines.push(`🕒 Hoàn thành: ${new Date(thoiGianHoanThanh).toLocaleDateString('vi-VN')}`);
    }
    const labelText = textLines.join('\n');

    return new Style({
        image: new Circle({
            radius: 8,
            fill: new Fill({ color: color }),
            stroke: new Stroke({ color: '#fff', width: 2 })
        }),
        text: new Text({
            text: labelText,
            font: '12px Arial, sans-serif',
            fill: new Fill({ color: '#fff' }),
            backgroundFill: new Fill({ color: 'rgba(0, 0, 0, 0.7)' }),
            padding: [5, 5, 5, 5],
            textAlign: 'left',
            offsetX: 15,
            offsetY: 0,
            stroke: new Stroke({ color: '#000', width: 1 }) // Viền đen mỏng cho chữ dễ đọc
        })
    });
};

/**
 * Style function cho layer Điểm Chảy
 */
export const diemChayStyleFunction = (feature: FeatureLike): Style | Style[] => {
    return [configStyleDiemChay(feature)];
};
