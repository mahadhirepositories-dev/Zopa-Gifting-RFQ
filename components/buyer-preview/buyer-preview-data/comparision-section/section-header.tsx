import React from "react";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  section: "profile" | "commercials" | "items";
  expanded: boolean;
  onToggle: () => void;
  icon?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  expanded,
  onToggle,
  icon = <FileText className="h-4 w-4 text-gray-600" />,
}) => (
  <tr className="bg-gray-100 border-t border-gray-200">
    <td colSpan={100} className="px-4 py-3">
      <div
        className="flex items-center cursor-pointer font-semibold text-gray-800"
        onClick={onToggle}
      >
        {expanded ? (
          <ChevronUp className="h-4 w-4 mr-2 text-gray-600" />
        ) : (
          <ChevronDown className="h-4 w-4 mr-2 text-gray-600" />
        )}
        {icon && <span className="mr-2">{icon}</span>}
        {title}
      </div>
    </td>
  </tr>
);