/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image";

export const HeaderSection = ({
  buyerData,
  getCurrentDate,
  logoPreview,
  revisionNumber,
  revisions = [],
  selectedRevisionNumber,
  onSelectRevision,
}: {
  buyerData: any;
  getCurrentDate: () => string;
  logoPreview: string | null;
  revisionNumber: number;
  revisions?: any[];
  selectedRevisionNumber?: number;
  onSelectRevision?: (revNum: number) => void;
}) => {
  const getCleanImageSrc = (
    imageSrc: string | string[] | URL | null
  ): string => {
    if (!imageSrc) return "";

    if (imageSrc instanceof URL) {
      imageSrc = imageSrc.toString();
    }

    if (Array.isArray(imageSrc)) {
      imageSrc = imageSrc[0] || "";
    }
    const srcString = imageSrc.toString();
    if (typeof window !== "undefined" && srcString.startsWith("blob:")) {
      return srcString;
    }
    if (srcString.includes("/_next/image?url=")) {
      try {
        const url = new URL(srcString);
        const imageUrl = url.searchParams.get("url");

        if (imageUrl) {
          imageSrc = decodeURIComponent(imageUrl);
        }
      } catch (error) {
        const urlMatch = srcString.match(/[?&]url=([^&]+)/);
        if (urlMatch) {
          try {
            imageSrc = decodeURIComponent(urlMatch[1]);
          } catch (decodeError) {
            console.error("Error decoding URL:", decodeError);
          }
        }
      }
    }
    const finalSrc = imageSrc.toString();
    let baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000");
    if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;

    if (finalSrc.startsWith("/uploads/")) {
      return `${baseUrl}${finalSrc}`;
    }

    if (finalSrc.startsWith("http://") || finalSrc.startsWith("https://")) {
      return finalSrc;
    }

    if (finalSrc.startsWith("/")) {
      return `${baseUrl}${finalSrc}`;
    }
    return finalSrc;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 flex flex-wrap justify-between items-center gap-4">
      <div>
        <p className="text-lg font-bold">
          Quote against the RFQ for &quot;
          {buyerData?.requirement?.projectName || buyerData?.projectName || "Project"}&quot; Date:{" "}
          {getCurrentDate()}
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* <p className="text-lg font-bold">
          <span className="text-blue-600">Revision: </span>Revision {revisionNumber} (R-{revisionNumber})
        </p> */}

        {revisions && revisions.length > 0 && onSelectRevision && (
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 shadow-2xs">
            <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
              Revision Preview:
            </span>
            <select
              value={selectedRevisionNumber !== undefined ? selectedRevisionNumber : revisionNumber}
              onChange={(e) => onSelectRevision(Number(e.target.value))}
              className="bg-white border border-blue-600 text-blue-700 font-bold text-xs rounded px-2.5 py-1 cursor-pointer outline-hidden hover:bg-blue-50 transition-colors"
            >
              {revisions.map((rev: any) => (
                <option key={rev.revisionNumber} value={rev.revisionNumber}>
                  R-{rev.revisionNumber} {rev.isCurrent ? "(Latest)" : ""}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {logoPreview ? (
        <div className="w-32 h-16 relative">
          <Image
            src={getCleanImageSrc(logoPreview)}
            alt="Company Logo"
            width={60}
            height={60}
            className="object-contain w-full h-full"
            unoptimized
          />
        </div>
      ) : (
        <h4 className="text-2xl font-bold text-gray-400">LOGO</h4>
      )}
    </div>
  );
};
