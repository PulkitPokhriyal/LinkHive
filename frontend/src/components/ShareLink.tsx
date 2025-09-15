import { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import { useParams } from "react-router-dom";

interface Content {
  _id: string;
  title: string;
  link: string;
  imageUrl?: string;
  tags: { tags: string }[];
  type: string;
}

function ShareableContent() {
  const { sharelink } = useParams();
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ownerName, setOwnerName] = useState("");

  const getSharableData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        BACKEND_URL + `/api/v1/shareablecontent/${sharelink}`,
      );
      setContents(response.data.contents);
      setOwnerName(response.data.username || "Someone");
      setError("");
    } catch (e) {
      console.log("Error getting data", e);
      setError(
        "Failed to load shared content. This link may be invalid or expired.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSharableData();
  }, [sharelink]);

  const getContentTypeIcon = () => {
    return (
      <svg
        className="w-5 h-5 text-gray-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text text-lg">Loading shared collection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-text mb-2">
            Content Unavailable
          </h2>
          <p className="text-text/70 mb-4">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-card border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="flex items-center justify-center">
                <img src="/Icon.png" className="h-10 w-10" alt="Icon" />
              </div>
              <h1 className="text-3xl font-bold text-text">LinkHive</h1>
            </div>
            <h2 className="text-xl font-semibold text-text mb-2">
              {ownerName}'s Shared Collection
            </h2>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-6xl mx-auto px-6 py-8 w-full">
        {contents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contents.map(({ title, link, imageUrl, tags, _id }) => (
              <div key={_id} className="group">
                <div className="bg-card rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 h-full flex flex-col">
                  {imageUrl && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0 mt-1">
                        {getContentTypeIcon()}
                      </div>
                      <h3 className="font-semibold text-text text-lg leading-tight line-clamp-2 flex-1">
                        {title}
                      </h3>
                    </div>

                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full font-medium"
                          >
                            {tag.tags}
                          </span>
                        ))}
                        {tags.length > 3 && (
                          <span className="text-xs text-text/60 px-2.5 py-1">
                            +{tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-auto">
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-accent hover:text-primary font-medium text-sm group/link transition-colors"
                      >
                        <span className="truncate max-w-[200px]">
                          {link.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                        </span>
                        <svg
                          className="w-4 h-4 flex-shrink-0 group-hover/link:translate-x-0.5 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-text mb-2">
              No Content Available
            </h3>
            <p className="text-text/70 max-w-md mx-auto">
              This collection doesn't contain any links yet, or they may have
              been removed.
            </p>
          </div>
        )}
      </div>

      <div className="bg-card border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="text-center text-text/60 text-sm">
            <p>
              Powered by{" "}
              <span className="font-semibold text-primary">LinkHive</span> -
              Organize. Save. Share.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShareableContent;
