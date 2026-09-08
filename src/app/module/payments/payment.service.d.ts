import { PaymentMethod, PaymentStatus } from "../../../generated/prisma/enums.js";
declare const createPayment: (userId: string, assessmentId: string) => Promise<{
    id: string;
    assessmentId: string | null;
    amount: import("@prisma/client-runtime-utils").Decimal;
    currency: string;
    status: PaymentStatus;
    paymentMethod: PaymentMethod;
    merchantInvoiceNumber: string;
    bkashPaymentId: string | null;
    bkashURL: string | undefined;
}>;
declare const executePayment: (paymentID: string) => Promise<{
    id: string;
    userId: string;
    assessmentId: string | null;
    amount: import("@prisma/client-runtime-utils").Decimal;
    currency: string;
    status: PaymentStatus;
    paymentMethod: PaymentMethod;
    merchantInvoiceNumber: string;
    bkashPaymentId: string | null;
    bkashTrxId: string | null;
    payerReference: string | null;
    paidAt: Date | null;
    gatewayResponse: import("@prisma/client/runtime/client").JsonValue | null;
    refundTrxId: string | null;
    refundAmount: import("@prisma/client-runtime-utils").Decimal | null;
    refundReason: string | null;
    refundedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const PaymentService: {
    createPayment: typeof createPayment;
    executePayment: typeof executePayment;
};
export {};
//# sourceMappingURL=payment.service.d.ts.map