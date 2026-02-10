import { NextRequest, NextResponse } from "next/server";
import { getMakeshopProducts } from "@/lib/makeshop";
import { getMaterials } from "@/lib/notion";
import type { MakeshopProduct, Material } from "@/types";

/**
 * 메이크샵 상품 목록 조회 API Route
 *
 * GET /api/makeshop/products?search=검색어&category=카테고리
 *
 * Fallback: 메이크샵 API 실패 시 노션 Materials DB 사용
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || undefined;

    // 1차: 메이크샵 API 시도
    const makeshopProducts = await getMakeshopProducts(category);

    if (makeshopProducts.length > 0) {
      // 검색어 필터링 (클라이언트에서도 가능하지만 서버에서 사전 필터링)
      const filteredProducts = search
        ? makeshopProducts.filter((p) =>
            p.name.toLowerCase().includes(search.toLowerCase())
          )
        : makeshopProducts;

      return NextResponse.json({
        products: filteredProducts,
        source: "makeshop",
      });
    }

    // 2차 Fallback: 노션 Materials 조회
    const materials = await getMaterials();
    const convertedProducts = materials.map(materialToMakeshopProduct);

    // 검색어 필터링
    const filteredProducts = search
      ? convertedProducts.filter((p) =>
          p.name.toLowerCase().includes(search.toLowerCase())
        )
      : convertedProducts;

    // 카테고리 필터링
    const finalProducts = category
      ? filteredProducts.filter((p) => p.category === category)
      : filteredProducts;

    return NextResponse.json({
      products: finalProducts,
      source: "notion",
    });
  } catch (error) {
    console.error("[API] 상품 목록 조회 실패:", error);

    return NextResponse.json(
      {
        error: "상품 목록을 불러올 수 없습니다.",
        products: [],
        source: "error",
      },
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
    salePrice: material.price, // 노션에는 할인가 정보 없음
    imageUrl: material.thumbnails[0] || "",
    detailUrl: material.makeshopUrl,
    category: material.category,
    stock: 999, // 노션에는 재고 정보 없음
  };
}
