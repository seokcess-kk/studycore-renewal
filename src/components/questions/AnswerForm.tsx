"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send } from "lucide-react";
import { Button, useToast } from "@/components/common";
import { ImageUploader } from "@/components/common/ImageUploader";
import { createClient } from "@/lib/supabase/client";
import { createAnswer } from "@/domains/question/service";
import { useUserStore } from "@/stores/useUserStore";

const answerFormSchema = z.object({
  content: z.string().min(10, "답변은 10자 이상 입력해주세요"),
});

type AnswerFormInput = z.infer<typeof answerFormSchema>;

interface AnswerFormProps {
  questionId: string;
  onSuccess: () => void;
  compact?: boolean;
}

export function AnswerForm({ questionId, onSuccess, compact }: AnswerFormProps) {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error: showError } = useToast();
  const { user } = useUserStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AnswerFormInput>({
    resolver: zodResolver(answerFormSchema),
  });

  const onSubmit = async (data: AnswerFormInput) => {
    if (!user) return;
    setIsSubmitting(true);

    const supabase = createClient();
    const result = await createAnswer(supabase, {
      question_id: questionId,
      content: data.content,
      image_urls: imageUrls.length > 0 ? imageUrls : undefined,
    });

    setIsSubmitting(false);

    if (result.success) {
      success("답변이 등록되었습니다.");
      reset();
      setImageUrls([]);
      onSuccess();
    } else {
      showError(result.error || "답변 등록에 실패했습니다.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <textarea
        {...register("content")}
        rows={compact ? 4 : 6}
        placeholder="답변을 입력해주세요 (10자 이상)"
        className="w-full border border-rule px-4 py-3 text-body text-ink focus:border-navy focus:outline-none"
      />
      {errors.content && (
        <p className="text-small text-red-500">{errors.content.message}</p>
      )}

      <ImageUploader
        bucket="question-images"
        folder="answers"
        maxFiles={5}
        maxSizeMB={1}
        accept="image/*,.pdf"
        value={imageUrls}
        onChange={setImageUrls}
      />

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size={compact ? "sm" : "md"}
          isLoading={isSubmitting}
        >
          <Send size={14} className="mr-1" />
          답변 등록
        </Button>
      </div>
    </form>
  );
}
