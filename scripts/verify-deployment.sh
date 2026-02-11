#!/bin/bash

# ============================================================
# 서브도메인 배포 검증 스크립트
# hub.foreverlove.co.kr이 정상 동작하는지 확인
# ============================================================

DOMAIN="hub.foreverlove.co.kr"
URL="https://$DOMAIN"
OLD_URL="https://pressco21.vercel.app"

echo "🔍 서브도메인 배포 검증 시작"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. DNS 확인
echo ""
echo "1️⃣  DNS 전파 확인"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
nslookup $DOMAIN | grep -A 1 "Non-authoritative answer:"

# 2. HTTP 접속 확인
echo ""
echo "2️⃣  HTTP 접속 확인"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $URL)

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ HTTP 200 OK"
else
    echo "❌ HTTP $HTTP_STATUS (예상: 200)"
    exit 1
fi

# 3. SSL 인증서 확인
echo ""
echo "3️⃣  SSL 인증서 확인"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v openssl &> /dev/null; then
    SSL_INFO=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -issuer -dates)

    if [[ $SSL_INFO == *"Let's Encrypt"* ]]; then
        echo "✅ SSL 인증서 발급 완료 (Let's Encrypt)"
        echo "$SSL_INFO" | grep "notAfter"
    else
        echo "⚠️  SSL 인증서 정보:"
        echo "$SSL_INFO"
    fi
else
    echo "⚠️  openssl 명령어를 찾을 수 없습니다."
    echo "   브라우저에서 직접 확인: $URL"
fi

# 4. 리다이렉트 확인 (구 도메인 → 신 도메인)
echo ""
echo "4️⃣  리다이렉트 확인"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

REDIRECT_URL=$(curl -s -o /dev/null -w "%{redirect_url}" $OLD_URL)

if [[ $REDIRECT_URL == "$URL"* ]]; then
    echo "✅ 리다이렉트 정상 (301)"
    echo "   $OLD_URL → $REDIRECT_URL"
else
    echo "⚠️  리다이렉트 확인 실패"
    echo "   예상: $URL"
    echo "   실제: $REDIRECT_URL"
fi

# 5. 주요 페이지 확인
echo ""
echo "5️⃣  주요 페이지 확인"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

PAGES=(
    "/"
    "/tutorials"
    "/combos"
    "/seasons"
    "/faq"
    "/quotation"
)

for PAGE in "${PAGES[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL$PAGE")
    if [ "$STATUS" -eq 200 ]; then
        echo "✅ $PAGE (HTTP $STATUS)"
    else
        echo "❌ $PAGE (HTTP $STATUS)"
    fi
done

# 6. sitemap.xml 확인
echo ""
echo "6️⃣  sitemap.xml 확인"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

SITEMAP_CONTENT=$(curl -s "$URL/sitemap.xml")

if [[ $SITEMAP_CONTENT == *"$URL"* ]]; then
    echo "✅ sitemap.xml에 새 도메인 포함"
    echo "   URL 개수: $(echo "$SITEMAP_CONTENT" | grep -c "<loc>")"
else
    echo "❌ sitemap.xml에 새 도메인 미포함"
    echo "   확인: $URL/sitemap.xml"
fi

# 7. robots.txt 확인
echo ""
echo "7️⃣  robots.txt 확인"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ROBOTS_CONTENT=$(curl -s "$URL/robots.txt")

if [[ $ROBOTS_CONTENT == *"$URL"* ]]; then
    echo "✅ robots.txt에 새 도메인 포함"
else
    echo "❌ robots.txt에 새 도메인 미포함"
fi

# 최종 결과
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 검증 완료!"
echo ""
echo "📌 다음 단계:"
echo "   1. Google Search Console 등록"
echo "      https://search.google.com/search-console/"
echo ""
echo "   2. sitemap.xml 제출"
echo "      $URL/sitemap.xml"
echo ""
echo "   3. 메이크샵 HTML 편집 (콘텐츠 허브 링크 추가)"
echo "      docs/MAKESHOP-HTML-EDIT-GUIDE.md 참조"
echo ""
