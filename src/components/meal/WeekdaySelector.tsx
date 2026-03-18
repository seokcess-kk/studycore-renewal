"use client";

import { Check } from "lucide-react";
import { type MealTypeValue, MEAL_TYPE_LABELS, WEEKDAY_LABELS } from "@/domains/meal/model";

interface WeekdaySelectorProps {
  mealTypes: MealTypeValue[];
  value: Record<string, string[]>;
  onChange: (value: Record<string, string[]>) => void;
  disabled?: boolean;
}

export function WeekdaySelector({
  mealTypes,
  value,
  onChange,
  disabled = false,
}: WeekdaySelectorProps) {
  // 월~금 (1~5)
  const weekdays = [1, 2, 3, 4, 5];

  const handleToggle = (weekday: number, mealType: string) => {
    const key = weekday.toString();
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

  const isSelected = (weekday: number, mealType: string): boolean => {
    const key = weekday.toString();
    return (value[key] || []).includes(mealType);
  };

  // 전체 선택/해제
  const handleSelectAll = (mealType: string) => {
    const allSelected = weekdays.every((w) => isSelected(w, mealType));

    const newValue = { ...value };
    weekdays.forEach((weekday) => {
      const key = weekday.toString();
      const currentMeals = newValue[key] || [];

      if (allSelected) {
        // 전체 해제
        newValue[key] = currentMeals.filter((m) => m !== mealType);
      } else {
        // 전체 선택
        if (!currentMeals.includes(mealType)) {
          newValue[key] = [...currentMeals, mealType];
        }
      }

      // 빈 배열 정리
      if (newValue[key]?.length === 0) {
        delete newValue[key];
      }
    });

    onChange(newValue);
  };

  // 전체 선택 여부 확인
  const isAllSelected = (mealType: string): boolean =>
    weekdays.every((w) => isSelected(w, mealType));

  return (
    <div className="border border-rule bg-white">
      {/* 헤더 */}
      <div className="grid grid-cols-6 border-b border-rule bg-stone">
        <div className="p-2 md:p-3 text-[12px] md:text-[13px] font-medium text-muted">
          식사
        </div>
        {weekdays.map((weekday) => (
          <div
            key={weekday}
            className="p-2 md:p-3 text-center text-[13px] md:text-[14px] font-medium text-ink"
          >
            {WEEKDAY_LABELS[weekday]}
          </div>
        ))}
      </div>

      {/* 식사 타입별 행 */}
      {mealTypes.map((mealType) => (
        <div
          key={mealType}
          className="grid grid-cols-6 border-b border-rule last:border-b-0"
        >
          <div className="p-2 md:p-3 flex flex-col items-start justify-center gap-1">
            <span className="text-[13px] font-medium text-ink">
              {MEAL_TYPE_LABELS[mealType]}
            </span>
            <button
              type="button"
              onClick={() => handleSelectAll(mealType)}
              disabled={disabled}
              className={`text-[11px] font-medium px-2 py-0.5 border transition-colors cursor-pointer ${
                isAllSelected(mealType)
                  ? "bg-teal/10 border-teal text-teal"
                  : "bg-stone border-rule text-muted hover:border-teal hover:text-teal"
              } disabled:opacity-50`}
            >
              {isAllSelected(mealType) ? "전체 해제" : "전체 선택"}
            </button>
          </div>
          {weekdays.map((weekday) => (
            <div
              key={weekday}
              className="p-2 md:p-3 flex items-center justify-center"
            >
              <button
                type="button"
                role="checkbox"
                aria-checked={isSelected(weekday, mealType)}
                aria-label={`${WEEKDAY_LABELS[weekday]}요일 ${MEAL_TYPE_LABELS[mealType]}`}
                onClick={() => handleToggle(weekday, mealType)}
                disabled={disabled}
                className={`w-8 h-8 md:w-9 md:h-9 flex items-center justify-center border transition-colors cursor-pointer ${
                  isSelected(weekday, mealType)
                    ? "bg-teal border-teal text-white"
                    : "bg-white border-rule text-muted hover:border-teal"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSelected(weekday, mealType) && <Check size={16} />}
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
