import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

interface FinalizeDesignStepProps {
  design: {
    _id: Id<"design">;
    status: string;
    title?: string;
    description?: string;
    createdAt?: number;
  };
}

const FinalizeDesignStep: React.FC<FinalizeDesignStepProps> = ({ design }) => {
  const isApproved = design.status === "approved";
  const isInprogress = design.status === "in_progress";
  const isBillingApproved = design.status === "billing_approved";
  const isInProduction = design.status === "in_production";
  const isPendingPickup = design.status === "pending_pickup";
  const isCompleted = design.status === "completed";

  // Fetch billing breakdown
  const billingDoc = useQuery(api.billing.getBillingByDesign, {
    designId: design._id,
  });

  // --- Conditions ---
  const showEstimate =
    (isApproved && !isBillingApproved && !isInProduction && !isPendingPickup && !isCompleted && billingDoc)
    || (isInprogress && billingDoc);

  const showInvoice =
    billingDoc && (
      isBillingApproved ||
      isInProduction ||
      isPendingPickup ||
      isCompleted
    );

  // Show message if in_progress but no billing yet
  const showPendingMessage = isInprogress && !billingDoc;

  if (showPendingMessage) {
    return (
      <div className="p-4 space-y-6">
        <div className="p-4 border rounded-lg shadow-sm bg-blue-50 text-blue-700">
          <p className="text-sm font-medium">
            ℹ️ Billing will be available once the design is approved by the client.
          </p>
        </div>
      </div>
    );
  }

  if (!billingDoc) return null;

  const breakdown = billingDoc.breakdown;
  const displayTotal = billingDoc.starting_amount ?? breakdown.total;
  const finalTotal =
    !billingDoc.final_amount || billingDoc.final_amount === 0
      ? displayTotal
      : billingDoc.final_amount;

  return (
    <div className="p-4 space-y-6">
      {/* Approved: Estimated Bill Breakdown */}
      {showEstimate && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Estimated Bill Breakdown</h2>
          <div className="p-4 border rounded-lg shadow-sm bg-gray-50 space-y-2 text-sm text-gray-700">
            <p>
              <span className="font-medium">Total Shirts:</span>{" "}
              {breakdown.shirtCount}
            </p>
            <p>
              <span className="font-medium">Printing Subtotal:</span> ₱
              {(breakdown.printFee * breakdown.shirtCount).toLocaleString()}
            </p>
            <p>
              <span className="font-medium">Revision Fee:</span> ₱
              {breakdown.revisionFee.toLocaleString()}
            </p>
            <p>
              <span className="font-medium">Designer Fee:</span> ₱
              {breakdown.designerFee.toLocaleString()}
            </p>
            <hr className="my-2" />
            <p className="font-semibold text-gray-900">
              Total: ₱{displayTotal.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              Final Negotiated Price: ₱{finalTotal.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Invoice: when billing approved OR design is in production/pending pickup/completed */}
      {showInvoice && (
        <div className="p-3 sm:p-6 border rounded-lg shadow bg-white">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold">Invoice</h1>
            <p className="text-xs sm:text-sm text-gray-500">
              {new Date().toLocaleDateString()}
            </p>
            <div className="mt-2">
              <h2 className="font-semibold text-sm sm:text-base">
                {design.title || "Custom Design"}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">{design.description}</p>
            </div>
          </div>

          {/* Mobile: Card Layout | Desktop: Table */}
          <div className="hidden sm:block">
            {/* Desktop Table */}
            <table className="w-full text-sm text-left border-t border-b mb-6">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2">Item</th>
                  <th className="px-3 py-2 text-center">Quantity</th>
                  <th className="px-3 py-2 text-center">Unit Price</th>
                  <th className="px-3 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-3 py-2">Printing</td>
                  <td className="px-3 py-2 text-center">
                    {breakdown.shirtCount}
                  </td>
                  <td className="px-3 py-2 text-center">
                    ₱{breakdown.printFee.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-right">
                    ₱{(breakdown.printFee * breakdown.shirtCount).toLocaleString()}
                  </td>
                </tr>
                {breakdown.revisionFee > 0 && (
                  <tr className="border-t">
                    <td className="px-3 py-2">Revision Fee</td>
                    <td className="px-3 py-2 text-center">-</td>
                    <td className="px-3 py-2 text-center">
                      ₱{breakdown.revisionFee.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right">
                      ₱{breakdown.revisionFee.toLocaleString()}
                    </td>
                  </tr>
                )}
                {breakdown.designerFee > 0 && (
                  <tr className="border-t">
                    <td className="px-3 py-2">Designer Fee</td>
                    <td className="px-3 py-2 text-center">-</td>
                    <td className="px-3 py-2 text-center">
                      ₱{breakdown.designerFee.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right">
                      ₱{breakdown.designerFee.toLocaleString()}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile: Card Layout */}
          <div className="sm:hidden space-y-2 mb-4 border-t border-b py-3">
            <div className="flex justify-between text-xs">
              <span className="font-medium">Printing</span>
              <span>{breakdown.shirtCount} × ₱{breakdown.printFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold">
              <span>Subtotal:</span>
              <span>₱{(breakdown.printFee * breakdown.shirtCount).toLocaleString()}</span>
            </div>
            {breakdown.revisionFee > 0 && (
              <div className="flex justify-between text-xs">
                <span className="font-medium">Revision Fee:</span>
                <span>₱{breakdown.revisionFee.toLocaleString()}</span>
              </div>
            )}
            {breakdown.designerFee > 0 && (
              <div className="flex justify-between text-xs">
                <span className="font-medium">Designer Fee:</span>
                <span>₱{breakdown.designerFee.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-4 sm:mb-6">
            <div className="w-full sm:w-1/3 space-y-1 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Subtotal:</span>
                <span>₱{displayTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Tax/VAT (12%):</span>
                <span>₱{(displayTotal * 0.12).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Total:</span>
                <span>₱{displayTotal.toLocaleString()}</span>
              </div>
              {finalTotal < displayTotal && (
                <div className="flex justify-between text-green-600">
                  <span>Client Discount:</span>
                  <span>-₱{(displayTotal - finalTotal).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold bg-gray-50 px-2 py-1 rounded">
                <span>Final Negotiated Price:</span>
                <span>₱{finalTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 sm:mt-8 text-center">
            <p className="text-xs sm:text-sm font-medium">Thank you!</p>
          </div>
        </div>
      )}

      {/* Default message */}
      {!showEstimate && !showInvoice && (
        <p className="text-sm text-gray-600">
          Billing is locked until your design is approved.
        </p>
      )}
    </div>
  );
};

export default FinalizeDesignStep;
