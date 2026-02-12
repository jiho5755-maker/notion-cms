import type { Metadata } from "next";
import { getTaskTemplates, getWorkAreas } from "@/lib/work";
import { TemplateCard } from "../_components/template-card";
import { TemplateForm } from "../_components/template-form";

export const metadata: Metadata = {
  title: "작업 템플릿 | 업무 관리",
  description: "자주 사용하는 작업 패턴을 템플릿으로 저장",
};

export default async function TemplatesPage() {
  const [templates, workAreas] = await Promise.all([
    getTaskTemplates(),
    getWorkAreas(),
  ]);

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">작업 템플릿 📑</h1>
        <p className="mt-1 text-gray-600">
          자주 사용하는 작업 패턴을 템플릿으로 저장하세요
        </p>
      </div>

      {/* 템플릿 생성 폼 */}
      <div className="mb-6">
        <TemplateForm workAreas={workAreas.map((w) => w.title)} />
      </div>

      {/* 템플릿 목록 */}
      <div>
        <h2 className="mb-4 text-xl font-bold">템플릿 목록</h2>
        {templates.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-gray-50 p-8 text-center">
            <p className="text-gray-600">
              아직 템플릿이 없습니다. 위에서 새 템플릿을 추가해보세요.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
