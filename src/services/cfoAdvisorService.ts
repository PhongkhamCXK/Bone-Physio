import { GoogleGenAI } from "@google/genai";

export interface CFOAdviceInput {
  revenueGoalBillions: number;
  v1PriceMillions: number;
  upsellConversionRate: number;
  v2UpsellPriceMillions: number;
  doctorCount: number;
  doctorSalaryMillions: number;
  techCount: number;
  techSalaryMillions: number;
  careCount: number;
  careSalaryMillions: number;
  recepCount: number;
  recepSalaryMillions: number;
  rentMonthlyMillions: number;
  utilMonthlyMillions: number;
  mktMonthlyMillions: number;
  suppliesMonthlyMillions: number;
  // Computed metrics
  annualRevenue: number;
  annualCost: number;
  netProfitYear: number;
  netMarginYear: number;
  newPatientsYear: number;
  upsellPatientsYear: number;
  newPatientsMonth: number;
  newPatientsDay: number;
  isProfitable: boolean;
}

export interface CFOAdviceOutput {
  status: "OK" | "WARNING" | "LOSS";
  summaryHeadline: string;
  recommendations: string[];
  growthPointers: string[];
  riskAlerts: string[];
  suggestedActionPlan: string;
}

export async function generateCFOAdvice(input: CFOAdviceInput): Promise<CFOAdviceOutput> {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process as any)?.env?.GEMINI_API_KEY || "";

  // Prompt chi tiết cho Gemini
  const prompt = `
Bạn là Giám Đốc Tài Chính (CFO) & Cố Vấn Tăng Trưởng Cấp Cao cho Chuỗi Phòng Khám Cơ Xương Khớp & Cột Sống Bone Physio.
Dưới đây là mô hình tài chính và giả lập mục tiêu KPI hiện tại của phòng khám:

- Mục tiêu Doanh thu: ${input.revenueGoalBillions} TỶ VNĐ / năm (${(input.annualRevenue / 1_000_000_000).toFixed(1)} Tỷ VNĐ)
- Gói Liệu trình Vòng 1 (15b chính + 7b bảo dưỡng = 22 buổi): ${input.v1PriceMillions} Triệu VNĐ / khách
- Tỷ lệ Up-sell Vòng 2 (mua thêm vùng 2-3 / bảo dưỡng năm): ${input.upsellConversionRate}% với giá ${input.v2UpsellPriceMillions} Triệu VNĐ
- Lượng Khách Mới Cần Đạt: ${input.newPatientsYear} khách/năm (~${input.newPatientsMonth} khách/tháng, ~${input.newPatientsDay} khách/ngày)
- Lượng Khách Up-sell Vòng 2: ${input.upsellPatientsYear} ca/năm
- Đội ngũ nhân sự: ${input.doctorCount} Bác sĩ (${input.doctorSalaryMillions}Tr/tháng), ${input.techCount} KTV (${input.techSalaryMillions}Tr/tháng), ${input.careCount} CSKH (${input.careSalaryMillions}Tr/tháng), ${input.recepCount} Lễ tân/KT (${input.recepSalaryMillions}Tr/tháng)
- Chi phí Mặt bằng: ${input.rentMonthlyMillions} Triệu/tháng
- Chi phí Marketing: ${input.mktMonthlyMillions} Triệu/tháng
- Chi phí Điện nước máy móc: ${input.utilMonthlyMillions} Triệu/tháng
- Chi phí Vật tư y tế: ${input.suppliesMonthlyMillions} Triệu/tháng
- Tổng Chi phí năm: ${(input.annualCost / 1_000_000_000).toFixed(1)} Tỷ VNĐ
- Lợi nhuận ròng sau thuế: ${(input.netProfitYear / 1_000_000_000).toFixed(2)} Tỷ VNĐ (Biên lợi nhuận: ${input.netMarginYear}%)
- Trạng thái hiện tại: ${input.isProfitable ? "ĐANG SINH LỜI / ỔN ĐỊNH" : "ĐANG BỊ LỖ"}

Nhiệm vụ của bạn:
1. Phân tích tài chính sắc bén, chỉ ra điểm mạnh và điểm rủi ro.
2. Đưa ra 3-4 khuyến nghị chiến lược thực tế nhất quán để đạt 220 Tỷ.
3. Chiến lược thúc đẩy Up-sell Vòng 2 (khi khách kết thúc 21-22 buổi) để tăng LTV mà không tăng chi phí quảng cáo.
4. Đánh giá tính khả thi của mục tiêu hàng ngày (${input.newPatientsDay} khách/ngày).

Trả về kết quả duy nhất định dạng JSON thuần (không kèm markdown ngoài) theo cấu trúc:
{
  "status": "OK" | "WARNING" | "LOSS",
  "summaryHeadline": "Tiêu đề tóm tắt sắc bén của CFO",
  "recommendations": ["khuyến nghị 1", "khuyến nghị 2", "khuyến nghị 3"],
  "growthPointers": ["chiến lược up-sell 1", "chiến lược up-sell 2"],
  "riskAlerts": ["rủi ro cần lưu ý 1", "rủi ro cần lưu ý 2"],
  "suggestedActionPlan": "Kế hoạch hành động 3 bước ngắn gọn, quyết liệt"
}
`;

  try {
    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      const text = response.text || "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as CFOAdviceOutput;
      }
    }
  } catch (err) {
    console.warn("AI generation failed, fallback to smart rule-based CFO advisor:", err);
  }

  // Fallback thông minh quy chuẩn tài chính nếu không có mạng hoặc API key
  const isLoss = !input.isProfitable;
  const highMkt = (input.mktMonthlyMillions * 12) / (input.annualRevenue || 1) > 0.15;
  const highStaff = (input.doctorCount * input.doctorSalaryMillions + input.techCount * input.techSalaryMillions) * 12 / (input.annualRevenue || 1) > 0.35;

  return {
    status: isLoss ? "LOSS" : input.netMarginYear < 20 ? "WARNING" : "OK",
    summaryHeadline: isLoss
      ? `Cảnh báo: Mô hình đang thâm hụt ${(Math.abs(input.netProfitYear) / 1_000_000_000).toFixed(1)} Tỷ do chi phí cố định vượt quá quy mô đón khách.`
      : `Mô hình tài chính rất vững vàng: Đạt biên lợi nhuận ${input.netMarginYear}%, thặng dư +${(input.netProfitYear / 1_000_000_000).toFixed(1)} Tỷ VNĐ/năm.`,
    recommendations: [
      `Cần duy trì đều đặn nhịp độ tiếp đón ${input.newPatientsDay} khách mới/ngày tại các phòng khám để đảm bảo chạm mốc ${input.revenueGoalBillions} Tỷ.`,
      highStaff
        ? `Quỹ lương hiện chiếm tỷ trọng cao. Hãy gắn KPI hoa hồng trên ca điều trị thành công thay vì tăng lương cứng.`
        : `Tỷ lệ chi phí nhân sự đang ở ngưỡng an toàn (${Math.round((input.annualCost * 0.4) / (input.annualRevenue || 1) * 100)}% DT). Đội ngũ ${input.techCount} KTV đủ sức tải ${input.newPatientsDay * 3} lượt tập/ngày.`,
      `Kiểm soát chi phí marketing ở mức ~${input.mktMonthlyMillions}Tr/tháng, tập trung vào kênh video ca điều trị thực tế để kéo khách có nhu cầu chữa dứt điểm.`,
    ],
    growthPointers: [
      `Khai thác tối đa Vòng 2: Cứ 10 người kết thúc 21-22 buổi (15b chính + 7b bảo dưỡng), CSKH cần chốt tái ký ${Math.round(input.upsellConversionRate / 10)} người mua gói vùng thứ 2 (cổ vai hoặc gối) với giá ${input.v2UpsellPriceMillions}Tr.`,
      `Kích hoạt gói Thẻ Thành Viên Gia Đình hoặc Gói Bảo Dưỡng Cột Sống Trọn Đời sau khi khách hết 7 buổi tặng để giữ chân khách 12 tháng liên tục.`,
    ],
    riskAlerts: [
      input.newPatientsDay > 30 ? `Chỉ tiêu ${input.newPatientsDay} khách mới/ngày đòi hỏi hệ thống tiếp thị và lễ tân phải vận hành với công suất cực đại.` : `Đảm bảo tỷ lệ hài lòng sau 15 buổi đầu đạt >92% để tỷ lệ Up-sell Vòng 2 đạt ${input.upsellConversionRate}%.`,
      `Nếu khách mới hụt 20%, doanh thu sẽ giảm ngay ${(input.revenueGoalBillions * 0.15).toFixed(1)} Tỷ. Do đó cần dự phòng ngân sách Marketing linh hoạt theo mùa.`,
    ],
    suggestedActionPlan: `1. Giao chỉ tiêu hằng ngày cho Sales/Care: Chốt tối thiểu ${input.newPatientsDay} khách mới + ${Math.max(1, Math.round(input.upsellPatientsYear / 365))} ca Up-sell. 2. KTV kiểm soát chất lượng từng buổi tập để bệnh nhân giảm đau rõ rệt sau 5 buổi đầu. 3. Đối soát P&L định kỳ vào ngày 28 hàng tháng.`,
  };
}
