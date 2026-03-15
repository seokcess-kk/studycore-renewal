// 카카오맵 SDK 전역 타입 선언
declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        Map: unknown;
        Marker: unknown;
        LatLng: unknown;
      };
    };
  }
}

export {};
