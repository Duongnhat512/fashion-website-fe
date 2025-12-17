import provincesData from '@/data/province.json';
import wardsData from '@/data/ward.json';

export interface Province {
  name: string;
  slug: string;
  type: string;
  name_with_type: string;
  code: string;
}

export interface Ward {
  name: string;
  type: string;
  slug: string;
  name_with_type: string;
  path: string;
  path_with_type: string;
  code: string;
  parent_code: string;
}

// Convert object to array
export const provinces: Province[] = Object.values(provincesData);
export const wards: Ward[] = Object.values(wardsData);

// Lấy danh sách tỉnh/thành phố
export const getProvinces = (): Province[] => {
  return provinces;
};

// Tìm kiếm tỉnh/thành phố theo tên
export const searchProvinces = (query: string): Province[] => {
  if (!query) return provinces;
  
  const lowerQuery = query.toLowerCase();
  return provinces.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.name_with_type.toLowerCase().includes(lowerQuery) ||
      p.slug.includes(lowerQuery)
  );
};

// Lấy tỉnh/thành phố theo code
export const getProvinceByCode = (code: string): Province | undefined => {
  return provinces.find((p) => p.code === code);
};

// Lấy danh sách phường/xã theo mã tỉnh/thành phố
export const getWardsByProvinceCode = (provinceCode: string): Ward[] => {
  return wards.filter((w) => w.parent_code === provinceCode);
};

// Tìm kiếm phường/xã theo tên và mã tỉnh
export const searchWards = (provinceCode: string, query: string): Ward[] => {
  const provinceWards = getWardsByProvinceCode(provinceCode);
  
  if (!query) return provinceWards;
  
  const lowerQuery = query.toLowerCase();
  return provinceWards.filter(
    (w) =>
      w.name.toLowerCase().includes(lowerQuery) ||
      w.name_with_type.toLowerCase().includes(lowerQuery) ||
      w.slug.includes(lowerQuery)
  );
};

// Lấy phường/xã theo code
export const getWardByCode = (code: string): Ward | undefined => {
  return wards.find((w) => w.code === code);
};
