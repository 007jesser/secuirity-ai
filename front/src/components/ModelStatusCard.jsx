import React, { useEffect, useState } from "react";
import { fetchModelInfo } from "../api/models";

export default function ModelStatusCard({ modelKey }) {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchModelInfo(modelKey).then((res) => {
      if (mounted) setStatus(res);
    });
    return () => {
      mounted = false;
    };
  }, [modelKey]);

  if (!status) return null;
  if (status.error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg border border-red-100">
        <p className="text-sm text-red-600 font-medium">{modelKey}</p>
        <p className="text-xs text-red-500">{status.error}</p>
      </div>
    );
  }
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
      <p className="text-sm font-medium text-gray-700">{modelKey}</p>
      <p className="text-xs text-green-600">{status.status}</p>
    </div>
  );
}
