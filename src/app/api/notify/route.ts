import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { hasAdminAccess } from "@/lib/constants";

/**
 * 알림 발송 API Route (서버사이드)
 *
 * 클라이언트는 식별자(questionId/noticeId)와 최소 입력만 보내고,
 * 실제 메시지 본문·수신자는 서버에서 DB로 재계산해 Edge Function에 전달한다.
 *
 * 권한 매트릭스
 * - question: 인증된 사용자(학생/스태프). 본인 작성 질문만 알림 발송 가능.
 * - answer:  admin/mentor만.
 * - notice:  admin/mentor만.
 * - custom:  admin/mentor만. recipients/message는 서버에서 한도(개수·길이) 검증.
 */

const VALID_TYPES = new Set(["question", "answer", "notice", "custom"]);
const ADMIN_ONLY_TYPES = new Set(["answer", "notice", "custom"]);
const MAX_CUSTOM_RECIPIENTS = 500;
const MAX_CUSTOM_MESSAGE_LENGTH = 1000;

interface CustomRecipient {
  userId?: string;
  name?: string;
  phone?: string;
  isParent?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // 1. 인증
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    // 2. 요청 파싱 + 타입 검증
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "잘못된 요청 형식입니다." },
        { status: 400 }
      );
    }

    const type = body.type as string | undefined;
    if (!type || !VALID_TYPES.has(type)) {
      return NextResponse.json(
        { success: false, error: "지원하지 않는 알림 타입입니다." },
        { status: 400 }
      );
    }

    // 3. 역할 조회 + 권한 매트릭스
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, name")
      .eq("id", user.id)
      .single();
    const userRole = profile?.role;

    if (ADMIN_ONLY_TYPES.has(type) && !hasAdminAccess(userRole)) {
      return NextResponse.json(
        { success: false, error: "관리자 권한이 필요합니다." },
        { status: 403 }
      );
    }

    const adminClient = await createAdminClient();
    let functionName: string;
    let edgeFunctionBody: Record<string, unknown>;

    // 4. type별 서버 재계산
    if (type === "question") {
      const questionId = body.questionId as string | undefined;
      if (!questionId) {
        return NextResponse.json(
          { success: false, error: "questionId가 필요합니다." },
          { status: 400 }
        );
      }

      const { data: q } = await adminClient
        .from("questions")
        .select("author_id, title")
        .eq("id", questionId)
        .single();

      if (!q) {
        return NextResponse.json(
          { success: false, error: "질문을 찾을 수 없습니다." },
          { status: 404 }
        );
      }

      // 본인이 작성한 질문에 대해서만 알림 발송 허용
      if (q.author_id !== user.id) {
        return NextResponse.json(
          { success: false, error: "본인 질문이 아닙니다." },
          { status: 403 }
        );
      }

      functionName = "notify-question";
      edgeFunctionBody = {
        questionId,
        studentName: profile?.name || "학생",
        title: q.title,
      };
    } else if (type === "answer") {
      const questionId = body.questionId as string | undefined;
      if (!questionId) {
        return NextResponse.json(
          { success: false, error: "questionId가 필요합니다." },
          { status: 400 }
        );
      }

      const { data: q } = await adminClient
        .from("questions")
        .select("author_id, title")
        .eq("id", questionId)
        .single();

      if (!q) {
        return NextResponse.json(
          { success: false, error: "질문을 찾을 수 없습니다." },
          { status: 404 }
        );
      }

      functionName = "notify-answer";
      edgeFunctionBody = {
        questionId,
        studentId: q.author_id,
        mentorName: profile?.name || "멘토",
        questionTitle: q.title,
      };
    } else if (type === "notice") {
      const noticeId = body.noticeId as string | undefined;
      const noticeTitle = body.noticeTitle as string | undefined;
      const includeParents = body.includeParents === true;

      if (!noticeId || !noticeTitle) {
        return NextResponse.json(
          { success: false, error: "noticeId, noticeTitle이 필요합니다." },
          { status: 400 }
        );
      }

      const { data: students, error: queryError } = await adminClient
        .from("profiles")
        .select("id, name, phone, parent_phone")
        .eq("role", "student")
        .eq("status", "active")
        .not("phone", "is", null);

      if (queryError || !students || students.length === 0) {
        return NextResponse.json(
          { success: false, error: "발송 대상 재원생이 없습니다." },
          { status: 400 }
        );
      }

      const recipients: { userId: string; name: string; phone: string; isParent?: boolean }[] = [];
      for (const s of students) {
        if (s.phone) {
          recipients.push({ userId: s.id, name: s.name, phone: s.phone });
        }
        if (includeParents && s.parent_phone) {
          recipients.push({
            userId: s.id,
            name: `${s.name} 학부모`,
            phone: s.parent_phone,
            isParent: true,
          });
        }
      }

      const noticeUrl = `https://www.studycore.kr/notices/${noticeId}`;
      functionName = "send-kakao-alimtalk";
      edgeFunctionBody = {
        type: "notice",
        recipients,
        noticeTitle,
        noticeUrl,
        message: `[스터디코어] 새 공지사항: ${noticeTitle}\n\n${noticeUrl}`,
        sentBy: user.id,
      };
    } else {
      // type === "custom"
      const recipients = body.recipients as CustomRecipient[] | undefined;
      const message = body.message as string | undefined;

      if (!Array.isArray(recipients) || recipients.length === 0) {
        return NextResponse.json(
          { success: false, error: "수신자가 필요합니다." },
          { status: 400 }
        );
      }
      if (recipients.length > MAX_CUSTOM_RECIPIENTS) {
        return NextResponse.json(
          { success: false, error: `한 번에 최대 ${MAX_CUSTOM_RECIPIENTS}명까지 발송 가능합니다.` },
          { status: 400 }
        );
      }
      if (!message || typeof message !== "string" || message.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: "메시지가 필요합니다." },
          { status: 400 }
        );
      }
      if (message.length > MAX_CUSTOM_MESSAGE_LENGTH) {
        return NextResponse.json(
          { success: false, error: `메시지는 최대 ${MAX_CUSTOM_MESSAGE_LENGTH}자까지 가능합니다.` },
          { status: 400 }
        );
      }

      // 모든 수신자가 phone을 가지는지 검증 (서버 측 형식 검증)
      const validRecipients = recipients.filter(
        (r) => typeof r?.phone === "string" && r.phone.trim().length > 0
      );
      if (validRecipients.length === 0) {
        return NextResponse.json(
          { success: false, error: "유효한 전화번호가 없습니다." },
          { status: 400 }
        );
      }

      functionName = "send-kakao-alimtalk";
      edgeFunctionBody = {
        type: "custom",
        recipients: validRecipients,
        message,
        sentBy: user.id,
      };
    }

    // 5. Service Role Key로 Edge Function 호출
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, error: "서버 설정 오류" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${supabaseUrl}/functions/v1/${functionName}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify(edgeFunctionBody),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: result.error || "알림 발송 실패" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("알림 API 오류:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
