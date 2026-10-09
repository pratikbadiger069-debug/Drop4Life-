"use client";

import React, { useState } from "react";
import { BloodRequest, RequestStatus, RequestTimelineEvent } from "@/lib/types";
import { REQUEST_STATUS_CONFIG } from "@/lib/constants";
import { requestService } from "@/lib/requests/request-service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  XCircle,
  FileCheck,
  ChevronRight,
  Loader2,
  UserCheck,
} from "lucide-react";

interface RequestStatusTimelineProps {
  request: BloodRequest;
  onStatusUpdated: (updated: BloodRequest) => void;
  canEdit?: boolean;
}

const ORDERED_STEPS: RequestStatus[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "IN_PROGRESS",
  "FULFILLED",
];

export function RequestStatusTimeline({
  request,
  onStatusUpdated,
  canEdit = true,
}: RequestStatusTimelineProps) {
  const [selectedNextStatus, setSelectedNextStatus] = useState<RequestStatus>(
    request.status === "SUBMITTED"
      ? "UNDER_REVIEW"
      : request.status === "UNDER_REVIEW"
      ? "IN_PROGRESS"
      : request.status === "IN_PROGRESS"
      ? "FULFILLED"
      : request.status
  );
  const [statusNotes, setStatusNotes] = useState<string>("");
  const [fulfilledUnitsInput, setFulfilledUnitsInput] = useState<number>(
    request.unitsFulfilled
  );
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isCancelled = request.status === "CANCELLED";
  const isFulfilled = request.status === "FULFILLED";

  const getStepIcon = (status: RequestStatus, isCurrent: boolean, isDone: boolean) => {
    if (status === "FULFILLED" && isDone) {
      return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
    }
    if (isCancelled && isCurrent) {
      return <XCircle className="w-5 h-5 text-slate-500" />;
    }
    if (isDone) {
      return <CheckCircle2 className="w-5 h-5 text-red-600" />;
    }
    if (isCurrent) {
      return <Clock className="w-5 h-5 text-amber-600 animate-spin" />;
    }
    return <div className="w-3 h-3 rounded-full bg-slate-300" />;
  };

  const currentStepIndex = ORDERED_STEPS.indexOf(request.status);

  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsUpdating(true);

    try {
      const updated = await requestService.updateRequestStatus(
        request.id,
        selectedNextStatus,
        statusNotes
      );
      setStatusNotes("");
      onStatusUpdated(updated);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to update status.");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateUnits = async () => {
    setErrorMsg(null);
    setIsUpdating(true);
    try {
      const updated = await requestService.updateUnitsFulfilled(
        request.id,
        fulfilledUnitsInput,
        `Allocated ${fulfilledUnitsInput} of ${request.unitsNeeded} units.`
      );
      onStatusUpdated(updated);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to update unit counts.");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Visual Stepper Banner */}
      {!isCancelled ? (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="grid grid-cols-4 gap-2 text-center relative">
            {ORDERED_STEPS.map((step, idx) => {
              const isDone = currentStepIndex > idx || isFulfilled;
              const isCurrent = request.status === step;
              const stepCfg = REQUEST_STATUS_CONFIG[step] || { label: step };

              return (
                <div key={step} className="flex flex-col items-center space-y-1.5 z-10">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      isDone
                        ? "bg-red-100 border-2 border-red-600 text-red-700"
                        : isCurrent
                        ? "bg-amber-100 border-2 border-amber-600 text-amber-700 shadow-sm"
                        : "bg-white border-2 border-slate-200 text-slate-400"
                    }`}
                  >
                    {getStepIcon(step, isCurrent, isDone)}
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      isCurrent
                        ? "text-amber-800"
                        : isDone
                        ? "text-slate-800"
                        : "text-slate-400"
                    }`}
                  >
                    {stepCfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-slate-100 p-4 rounded-xl border border-slate-300 text-slate-700 flex items-center gap-3">
          <XCircle className="w-6 h-6 text-slate-500" />
          <div>
            <h4 className="font-semibold text-sm">Request Cancelled / Closed</h4>
            <p className="text-xs text-slate-500">
              This blood requisition has been withdrawn and is no longer actively matching donors.
            </p>
          </div>
        </div>
      )}

      {/* Progress & Units Counter */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-xl">
        <div>
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Fulfillment Progress
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900">
              {request.unitsFulfilled} / {request.unitsNeeded}
            </span>
            <span className="text-sm font-medium text-slate-600">units verified</span>
            {request.unitsFulfilled >= request.unitsNeeded && (
              <Badge variant="success" className="ml-2">
                100% Fulfilled
              </Badge>
            )}
          </div>
        </div>

        {canEdit && !isCancelled && (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              max={request.unitsNeeded * 2}
              value={fulfilledUnitsInput}
              onChange={(e) => setFulfilledUnitsInput(parseInt(e.target.value, 10) || 0)}
              className="w-20 text-center font-bold"
              aria-label="Fulfilled units count"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleUpdateUnits}
              disabled={isUpdating || fulfilledUnitsInput === request.unitsFulfilled}
            >
              Update Units
            </Button>
          </div>
        )}
      </div>

      {/* Authorized Status Transition Form */}
      {canEdit && !isCancelled && !isFulfilled && (
        <form
          onSubmit={handleStatusChange}
          className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-red-600" />
              Update Status Workflow
            </h4>
            <span className="text-xs text-slate-500">Authorized Clinical Action</span>
          </div>

          {errorMsg && (
            <Alert variant="destructive" className="py-2">
              <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="next-status-select" className="text-xs text-slate-600">
                Next Status
              </Label>
              <select
                id="next-status-select"
                value={selectedNextStatus}
                onChange={(e) => setSelectedNextStatus(e.target.value as RequestStatus)}
                className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium shadow-sm focus:border-red-500 focus:outline-none"
              >
                {request.status === "SUBMITTED" && (
                  <>
                    <option value="UNDER_REVIEW">Under Review (Intake evaluation)</option>
                    <option value="IN_PROGRESS">In Progress (Active matching)</option>
                    <option value="CANCELLED">Cancel Requisition</option>
                  </>
                )}
                {request.status === "UNDER_REVIEW" && (
                  <>
                    <option value="IN_PROGRESS">In Progress (Activate donor search)</option>
                    <option value="FULFILLED">Mark as Fulfilled</option>
                    <option value="CANCELLED">Cancel Requisition</option>
                  </>
                )}
                {request.status === "IN_PROGRESS" && (
                  <>
                    <option value="FULFILLED">Mark as Fulfilled (Complete)</option>
                    <option value="UNDER_REVIEW">Return to Under Review</option>
                    <option value="CANCELLED">Cancel Requisition</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <Label htmlFor="status-note-input" className="text-xs text-slate-600">
                Audit Note / Reason
              </Label>
              <Input
                id="status-note-input"
                placeholder="Reason for status change..."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                className="mt-1 text-sm h-9"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              className="bg-red-700 hover:bg-red-800 text-white font-medium"
              disabled={isUpdating || selectedNextStatus === request.status}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Updating Status...
                </>
              ) : (
                <>
                  <ChevronRight className="w-3.5 h-3.5 mr-1" />
                  Confirm Status Change
                </>
              )}
            </Button>
          </div>
        </form>
      )}

      {/* Historical Audit Timeline Trail */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Status & Audit History ({request.statusTimeline?.length || 0} events)
        </h4>
        <div className="space-y-3 border-l-2 border-slate-200 ml-2.5 pl-4">
          {request.statusTimeline?.map((evt, idx) => {
            const cfg = REQUEST_STATUS_CONFIG[evt.status] || { label: evt.status };
            return (
              <div key={idx} className="relative group">
                {/* Dot */}
                <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-red-600 ring-4 ring-white" />
                <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-slate-800">
                      {cfg.label}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(evt.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{evt.updatedBy}</p>
                  {evt.notes && (
                    <p className="text-xs text-slate-500 mt-1 italic">&ldquo;{evt.notes}&rdquo;</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
