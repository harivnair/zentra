import { calculatePercentageAmount } from ".";

export function calculateEstimateSummary({
    totalAmount,
    gst,
    serviceCharge,
    discounts,
}: {
    totalAmount: number;
    gst: number;
    serviceCharge: number;
    discounts: number;
}) {
    const serviceChargeAmount = calculatePercentageAmount(totalAmount, serviceCharge);
    const totalWithServiceCharge = totalAmount + serviceChargeAmount;
    const totalAfterDiscounts = totalAmount ? totalWithServiceCharge - discounts : 0;
    const gstAmount = calculatePercentageAmount(totalAfterDiscounts, gst);
    const totalWithGST = totalAfterDiscounts + gstAmount;

    return {
        totalWithServiceCharge,
        totalWithGST,
        serviceChargeAmount,
        gstAmount,
    };
}
