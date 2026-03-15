"use client";

import { useMemo } from "react";
import { Check } from "lucide-react";
import { type MealTypeValue, MEAL_TYPE_LABELS } from "@/domains/meal/model";

interface DateSelectorProps {
  mealTypes: MealTypeValue[];
  startDate: string;
  endDate: string;
  value: Record<string, string[]>;
  onChange: (value: Record<string, string[]>) => void;
  disabled?: boolean;
}

export function DateSelector({
  mealTypes,
  startDate,
  endDate,
  value,
  onChange,
  disabled = false,
}: DateSelectorProps) {
  // 기간 내 날짜 목록 생성 (주말 제외)
  const dates = useMemo(() => {
    const result: Date[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      // 주말 제외 (0: 일요일, 6: 토요일)
      if (day !== 0 && day !== 6) {
        result.push(new Date(d));
      }
    }

    return result;
  }, [startDate, endDate]);

  // 타임존 안전한 날짜 포맷 (로컬 기준)
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (date: Date): string => {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const getDayName = (date: Date): string => {
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    return days[date.getDay()];
  };

  const handleToggle = (date: Date, mealType: string) => {
    const key = formatDate(date);
    const currentMeals = value[key] || [];

    let newMeals: string[];
    if (currentMeals.includes(mealType)) {
      newMeals = currentMeals.filter((m) => m !== mealType);
    } else {
      newMeals = [...currentMeals, mealType];
    }

    const newValue = { ...value };
    if (newMeals.length > 0) {
      newValue[key] = newMeals;
    } else {
      delete newValue[key];
    }

    onChange(newValue);
  };

  const isSelected = (date: Date, mealType: string): boolean => {
    const key = formatDate(date);
    return (value[key] || []).includes(mealType);
  };

  // 전체 선택/해제
  const handleSelectAll = (mealType: string) => {
    const allSelected = dates.every((d) => isSelected(d, mealType));

    const newValue = { ...value };
    dates.forEach((date) => {
      const key = formatDate(date);
      const currentMeals = newValue[key] || [];

      if (allSelected) {
        newValue[key] = currentMeals.filter((m) => m !== mealType);
      } else {
        if (!currentMeals.includes(mealType)) {
          newValue[key] = [...currentMeals, mealType];
        }
      }

      if (newValue[key]?.length === 0) {
        delete newValue[key];
      }
    });

    onChange(newValue);
  };

  if (dates.length === 0) {
    return (
      <div className="border border-rule bg-white p-8 text-center text-muted">
        <p className="text-[14px]">선택 가능한 날짜가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="border border-rule bg-white overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="bg-stone border-b border-rule">
            <th className="p-3 text-left text-[13px] font-medium text-muted w-24">
              식사
            </th>
            {dates.map((date) => (
              <th
                key={formatDate(date)}
                className="p-2 text-center text-[12px] font-medium text-ink"
              >
                <div>{formatDisplayDate(date)}</div>
                <div className="text-[11px] text-muted">
                  ({getDayName(date)})
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mealTypes.map((mealType) => (
            <tr key={mealType} className="border-b border-rule last:border-b-0">
              <td className="p-3">
                <button
                  type="button"
                  onClick={() => handleSelectAll(mealType)}
                  disabled={disabled}
                  className="text-[13px] font-medium text-ink hover:text-teal disabled:opacity-50"
                >
                  {MEAL_TYPE_LABELS[mealType]}
                  <span className="text-[11px] text-muted ml-1">(전체)</span>
                </button>
              </td>
              {dates.map((date) => (
                <td key={formatDate(date)} className="p-2 text-center">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={isSelected(date, mealType)}
                    aria-label={`${formatDisplayDate(date)} ${getDayName(date)}요일 ${MEAL_TYPE_LABELS[mealType]}`}
                    onClick={() => handleToggle(date, mealType)}
                    disabled={disabled}
                    className={`w-7 h-7 flex items-center justify-center border transition-colors mx-auto ${
                      isSelected(date, mealType)
                        ? "bg-teal border-teal text-white"
                        : "bg-white border-rule text-muted hover:border-teal"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isSelected(date, mealType) && <Check size={14} />}
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
