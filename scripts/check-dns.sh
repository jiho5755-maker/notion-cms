#!/bin/bash

# ============================================================
# DNS 전파 확인 스크립트
# 서브도메인 hub.foreverlove.co.kr이 Vercel을 가리키는지 확인
# ============================================================

DOMAIN="hub.foreverlove.co.kr"
EXPECTED_CNAME="cname.vercel-dns.com"

echo "🔍 DNS 전파 확인 중: $DOMAIN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# nslookup 실행
echo ""
echo "📡 nslookup 결과:"
nslookup $DOMAIN

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# dig 실행 (더 상세한 정보)
if command -v dig &> /dev/null; then
    echo ""
    echo "📡 dig 결과:"
    dig $DOMAIN +short

    echo ""
    echo "📡 CNAME 레코드 확인:"
    dig $DOMAIN CNAME +short

    CNAME_RESULT=$(dig $DOMAIN CNAME +short | head -n 1)

    if [[ $CNAME_RESULT == *"$EXPECTED_CNAME"* ]]; then
        echo ""
        echo "✅ DNS 전파 완료!"
        echo "   CNAME: $CNAME_RESULT"
        echo ""
        echo "🎉 다음 단계: Vercel Dashboard에서 도메인 추가"
        echo "   https://vercel.com/dashboard"
        exit 0
    else
        echo ""
        echo "⏳ DNS 전파 대기 중..."
        echo "   예상 CNAME: $EXPECTED_CNAME"
        echo "   현재 CNAME: $CNAME_RESULT"
        echo ""
        echo "💡 보통 1~2시간 소요됩니다. 최대 48시간까지 걸릴 수 있습니다."
        echo ""
        echo "🔄 DNS 전파 상태 확인:"
        echo "   https://dnschecker.org/#CNAME/$DOMAIN"
        exit 1
    fi
else
    echo ""
    echo "⚠️  dig 명령어를 찾을 수 없습니다."
    echo "   nslookup 결과를 직접 확인하세요."
    echo ""
    echo "📌 확인 사항:"
    echo "   1. Address가 Vercel IP인지 확인 (76.76.21.21 등)"
    echo "   2. NXDOMAIN 에러가 없는지 확인"
    exit 1
fi
