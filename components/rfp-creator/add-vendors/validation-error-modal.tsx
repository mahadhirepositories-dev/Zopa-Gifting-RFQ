import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ValidationErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  errors: Array<{ row: number; errors: string[] }>;
}

export default function ValidationErrorModal({
  isOpen,
  onClose,
  errors
}: ValidationErrorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center text-red-600">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <h3 className="text-lg font-semibold">
              Validation Errors ({errors.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto grow">
          <p className="mb-4 text-gray-600">
            The following errors were found in your Excel file. Please correct these issues and upload again.
          </p>
          
          <div className="border border-red-200 rounded-md bg-red-50">
            <table className="min-w-full divide-y divide-red-200">
              <thead className="bg-red-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                    Row
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                    Errors
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-200">
                {errors.map((error, index) => (
                  <tr key={index} className="bg-red-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {error.row}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <ul className="list-disc list-inside">
                        {error.errors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}