import { useCallback } from "react";
import type { UseFormSetValue } from "react-hook-form";

/**
 * 전화번호 입력 시 자동 하이픈 포맷팅
 * 01012345678 → 010-1234-5678
 */
export function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

/**
 * react-hook-form과 함께 사용하는 onChange 핸들러 생성
 *
 * 사용법:
 * const handlePhoneChange = usePhoneFormat(setValue);
 * <input onChange={(e) => handlePhoneChange("phone", e)} />
 */
export function usePhoneFormat<T extends Record<string, unknown>>(
  setValue: UseFormSetValue<T>
) {
  return useCallback(
    (field: keyof T & string, e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhoneInput(e.target.value);
      setValue(field as never, formatted as never, { shouldValidate: true });
    },
    [setValue]
  );
}
