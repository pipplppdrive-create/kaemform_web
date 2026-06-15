import { Document, Page, View, Text, StyleSheet, Svg, Path } from "@react-pdf/renderer";
import type { FormField, FormResponse, ResponseData, SignatureData } from "@kaemform/shared";
import { strokeToPath } from "@/lib/signature-path";
import { getExportFields, formatFieldValue } from "@/lib/export/response-format";

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 9, fontFamily: "Helvetica" },
  title: { fontSize: 16, marginBottom: 2 },
  subtitle: { fontSize: 9, color: "#6b7280", marginBottom: 16 },
  card: { marginBottom: 10, padding: 8, border: 1, borderColor: "#e5e7eb", borderRadius: 4 },
  cardHeader: { fontSize: 9, color: "#6b7280", marginBottom: 4 },
  row: { flexDirection: "row", marginBottom: 2, gap: 6 },
  label: { width: "35%", color: "#374151" },
  value: { width: "65%" },
  signature: { width: 160, height: 60, border: 1, borderColor: "#e5e7eb" },
  footer: {
    position: "absolute",
    bottom: 16,
    left: 28,
    right: 28,
    fontSize: 8,
    color: "#9ca3af",
    textAlign: "center",
  },
});

function isSignatureData(value: unknown): value is SignatureData {
  return !!value && typeof value === "object" && "strokes" in value && "canvas" in value;
}

export interface ResponsesDocumentLabels {
  exportedAtLabel: string;
  dateLabel: string;
  signatureLabel: string;
  pageOf: (page: number, total: number) => string;
}

export interface ResponsesDocumentProps {
  title: string;
  exportedAt: string;
  fields: FormField[];
  responses: FormResponse[];
  labels: ResponsesDocumentLabels;
}

export function ResponsesDocument({ title, exportedAt, fields, responses, labels }: ResponsesDocumentProps) {
  const exportFields = getExportFields(fields);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>
          {labels.exportedAtLabel}: {exportedAt}
        </Text>

        {responses.map((response, index) => {
          const data = response.data as ResponseData;
          return (
            <View key={response.id} style={styles.card} wrap={false}>
              <Text style={styles.cardHeader}>
                #{index + 1} — {labels.dateLabel}: {new Date(response.submitted_at).toLocaleString("id-ID")}
              </Text>
              {exportFields.map((field) => {
                const value = data[field.id];
                if (field.type === "signature" && isSignatureData(value)) {
                  return (
                    <View key={field.id} style={styles.row}>
                      <Text style={styles.label}>{field.label}</Text>
                      <Svg style={styles.signature} viewBox={`0 0 ${value.canvas.width} ${value.canvas.height}`}>
                        {value.strokes.map((stroke, strokeIndex) => (
                          <Path
                            key={strokeIndex}
                            d={strokeToPath(stroke)}
                            stroke={stroke.color}
                            strokeWidth={stroke.width}
                            fill="none"
                          />
                        ))}
                      </Svg>
                    </View>
                  );
                }
                return (
                  <View key={field.id} style={styles.row}>
                    <Text style={styles.label}>{field.label}</Text>
                    <Text style={styles.value}>{formatFieldValue(field, value, labels.signatureLabel)}</Text>
                  </View>
                );
              })}
            </View>
          );
        })}

        <Text style={styles.footer} render={({ pageNumber, totalPages }) => labels.pageOf(pageNumber, totalPages)} fixed />
      </Page>
    </Document>
  );
}
