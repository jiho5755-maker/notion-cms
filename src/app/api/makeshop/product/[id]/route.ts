import { NextRequest, NextResponse } from "next/server";
import { getMakeshopProduct } from "@/lib/makeshop";
import type { MakeshopProduct, Material } from "@/types";

// notion.ts에서 getMaterialById는 export되지 않아 별도 임포트 불가
// 대신 getMaterials()로 전체 조회 후 필터링
import { getMaterials } from "@/lib/notion";

/**
 * 메이크샵 상품 상세 조회 API Route
 *
 * GET /api/makeshop/product/[id]
 *
 * Fallback: 메이크샵 API 실패 시 노션 Materials DB 사용
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1차: 메이크샵 API 시도
    const makeshopProduct = await getMakeshopProduct(id);

    if (makeshopProduct) {
      return NextResponse.json({
        product: makeshopProduct,
        source: "makeshop",
      });
    }

    // 2차 Fallback: 노션 Materials 조회
    const materials = await getMaterials();
    const material = materials.find((m) => m.id === id);

    if (!material) {
      return NextResponse.json(
        { error: "상품을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const convertedProduct = materialToMakeshopProduct(material);

    return NextResponse.json({
      product: convertedProduct,
      source: "notion",
    });
  } catch (error) {
    console.error(`[API] 상품 상세 조회 실패 (ID: ${(await params).id}):`, error);

    return NextResponse.json(
      { error: "상품 정보를 불러올 수 없습니다." },
      { status: 500 }
    );
  }
}

/**
 * Material → MakeshopProduct 변환
 */
function materialToMakeshopProduct(material: Material): MakeshopProduct {
  return {
    productId: material.id,
    name: material.title,
    price: material.price,
    salePrice: material.price,
    imageUrl: material.thumbnails[0] || "",
    detailUrl: material.makeshopUrl,
    category: material.category,
    stock: 999,
  };
}
