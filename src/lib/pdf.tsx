import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import type { Quotation } from "@/types/quotation";
import { formatPrice } from "./price";
import { COMPANY_INFO } from "./constants";

// 스타일 정의
const styles = StyleSheet.create({
  page: {
    fontSize: 10,
    padding: 40,
    backgroundColor: "#ffffff",
  },
  // 헤더
  header: {
    marginBottom: 30,
    borderBottom: "3pt solid #2563eb",
    paddingBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: "#1e40af",
    marginBottom: 10,
    textAlign: "center",
  },
  quotationInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 9,
    color: "#6b7280",
  },
  // 고객 정보
  customerSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#f9fafb",
    borderRadius: 4,
    border: "1pt solid #e5e7eb",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#1f2937",
    marginBottom: 10,
    borderBottom: "1pt solid #d1d5db",
    paddingBottom: 5,
  },
  customerRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  customerLabel: {
    width: 80,
    fontWeight: 700,
    color: "#4b5563",
  },
  customerValue: {
    flex: 1,
    color: "#1f2937",
  },
  // 상품 테이블
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontWeight: 700,
    padding: 8,
    fontSize: 9,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1pt solid #e5e7eb",
    padding: 8,
    fontSize: 9,
  },
  tableRowAlt: {
    backgroundColor: "#f9fafb",
  },
  col1: { width: "45%", paddingRight: 5 },
  col2: { width: "20%", textAlign: "right", paddingRight: 5 },
  col3: { width: "15%", textAlign: "center" },
  col4: { width: "20%", textAlign: "right" },
  // 합계
  totalSection: {
    marginTop: 10,
    marginLeft: "auto",
    width: "50%",
    padding: 15,
    backgroundColor: "#f9fafb",
    borderRadius: 4,
    border: "1pt solid #e5e7eb",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    fontSize: 10,
  },
  totalLabel: {
    fontWeight: 700,
    color: "#4b5563",
  },
  totalValue: {
    color: "#1f2937",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTop: "2pt solid #2563eb",
    fontSize: 14,
    fontWeight: 700,
  },
  grandTotalLabel: {
    color: "#1e40af",
  },
  grandTotalValue: {
    color: "#dc2626",
  },
  // 문의사항
  notesSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#fffbeb",
    borderRadius: 4,
    border: "1pt solid #fde68a",
  },
  notesText: {
    fontSize: 9,
    color: "#78350f",
    lineHeight: 1.5,
  },
  // 푸터
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTop: "1pt solid #e5e7eb",
  },
  companyInfo: {
    fontSize: 8,
    color: "#6b7280",
    lineHeight: 1.5,
    marginBottom: 3,
  },
  tagline: {
    fontSize: 8,
    color: "#9ca3af",
    fontStyle: "italic",
    marginTop: 10,
    textAlign: "center",
  },
  disclaimer: {
    fontSize: 7,
    color: "#9ca3af",
    marginTop: 5,
    fontStyle: "italic",
  },
});

/** PDF 문서 컴포넌트 */
const QuotationDocument = ({ quotation }: { quotation: Quotation }) => {
  const company = COMPANY_INFO;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>견적서</Text>
          <View style={styles.quotationInfo}>
            <Text>견적 번호: {quotation.id}</Text>
            <Text>
              작성일: {new Date(quotation.createdAt).toLocaleDateString("ko-KR")}
            </Text>
          </View>
        </View>

        {/* 고객 정보 */}
        <View style={styles.customerSection}>
          <Text style={styles.sectionTitle}>고객 정보</Text>
          <View style={styles.customerRow}>
            <Text style={styles.customerLabel}>이름</Text>
            <Text style={styles.customerValue}>{quotation.customer.name}</Text>
          </View>
          <View style={styles.customerRow}>
            <Text style={styles.customerLabel}>이메일</Text>
            <Text style={styles.customerValue}>{quotation.customer.email}</Text>
          </View>
          <View style={styles.customerRow}>
            <Text style={styles.customerLabel}>전화번호</Text>
            <Text style={styles.customerValue}>{quotation.customer.phone}</Text>
          </View>
          {quotation.customer.address && (
            <View style={styles.customerRow}>
              <Text style={styles.customerLabel}>주소</Text>
              <Text style={styles.customerValue}>
                {quotation.customer.address}
              </Text>
            </View>
          )}
        </View>

        {/* 상품 테이블 */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>상품명</Text>
            <Text style={styles.col2}>단가 (원)</Text>
            <Text style={styles.col3}>수량</Text>
            <Text style={styles.col4}>소계 (원)</Text>
          </View>
          {quotation.items.map((item, index) => {
            const rowStyle =
              index % 2 === 1
                ? [styles.tableRow, styles.tableRowAlt]
                : [styles.tableRow];
            return (
              <View key={item.id} style={rowStyle}>
                <Text style={styles.col1}>{item.name}</Text>
                <Text style={styles.col2}>{formatPrice(item.price)}</Text>
                <Text style={styles.col3}>{item.quantity}</Text>
                <Text style={styles.col4}>{formatPrice(item.subtotal)}</Text>
              </View>
            );
          })}
        </View>

        {/* 합계 */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>공급가액</Text>
            <Text style={styles.totalValue}>
              {formatPrice(quotation.totalAmount)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>부가세 (10%)</Text>
            <Text style={styles.totalValue}>
              {formatPrice(quotation.vatAmount)}
            </Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>최종 합계</Text>
            <Text style={styles.grandTotalValue}>
              {formatPrice(quotation.grandTotal)}
            </Text>
          </View>
          <Text style={styles.disclaimer}>* 공급가액은 부가세를 제외한 금액입니다.</Text>
        </View>

        {/* 문의사항 */}
        {quotation.customer.message && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>문의사항</Text>
            <Text style={styles.notesText}>{quotation.customer.message}</Text>
          </View>
        )}

        {/* 푸터 - 사업자 정보 */}
        <View style={styles.footer}>
          <Text style={styles.sectionTitle}>사업자 정보</Text>
          <Text style={styles.companyInfo}>
            상호명: {company.name} | 사업자번호: {company.registrationId} (
            {company.type})
          </Text>
          {company.address && (
            <Text style={styles.companyInfo}>주소: {company.address}</Text>
          )}
          {company.phone && (
            <Text style={styles.companyInfo}>전화: {company.phone}</Text>
          )}
          {company.email && (
            <Text style={styles.companyInfo}>이메일: {company.email}</Text>
          )}
          <Text style={styles.tagline}>
            PRESSCO 21 - {company.tagline}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

/**
 * 견적서 PDF 생성 (react-pdf/renderer)
 *
 * @param quotation - 견적서 데이터
 * @returns PDF Blob
 */
export async function generateQuotationPDF(
  quotation: Quotation
): Promise<Blob> {
  const blob = await pdf(<QuotationDocument quotation={quotation} />).toBlob();
  return blob;
}
