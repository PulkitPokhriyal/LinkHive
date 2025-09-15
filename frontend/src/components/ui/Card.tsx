import { DeleteIcon } from "../../icons/DeleteIcon";
import { EditIcon } from "../../icons/EditIcon";
import { useContent } from "../../hooks/useContent";
import { useState } from "react";
import { CreateContentModal } from "../CreateContentModal";
import axios from "axios";
import { BACKEND_URL } from "../../../config";

interface Cardprops {
  contentId: string;
  title: string;
  link: string;
  imageUrl: string;
  tags: string[];
}

export const Card = (props: Cardprops) => {
  const { refresh, fetchContentById } = useContent();
  const [modalOpen, setModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteItem = async (contentId: string) => {
    if (isDeleting) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this item?",
    );
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await axios.delete(`${BACKEND_URL}/api/v1/content/${contentId}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      await refresh();
    } catch (e) {
      console.error("Error deleting content", e);
      alert("Failed to delete content. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <CreateContentModal
        open={modalOpen}
        type="Update Content"
        onClose={() => {
          setModalOpen(false);
        }}
      />
      <div className="bg-card rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 h-full flex flex-col group">
        {props.imageUrl && (
          <div className="aspect-video overflow-hidden relative">
            <a href={props.link} target="_blank" rel="noopener noreferrer">
              <img
                src={props.imageUrl}
                alt={props.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </a>

            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex gap-2">
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    await fetchContentById(props.contentId);
                    setModalOpen(true);
                  }}
                  className="bg-white/90 backdrop-blur-sm hover:bg-white p-2 rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
                  title="Edit"
                >
                  <EditIcon size="md" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    deleteItem(props.contentId);
                  }}
                  disabled={isDeleting}
                  className="bg-white/90 backdrop-blur-sm hover:bg-white p-2 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2  border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <DeleteIcon size="md" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="font-semibold text-text text-lg leading-tight line-clamp-2 flex-1">
              {props.title}
            </h3>
          </div>

          {props.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {props.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full font-medium"
                >
                  {`#${tag}`}
                </span>
              ))}
              {props.tags.length > 3 && (
                <span className="text-xs text-text/60 px-2.5 py-1">
                  +{props.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          <div className="mt-auto">
            <a
              href={props.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-accent hover:text-primary font-medium text-sm group/link transition-colors"
            >
              <span className="truncate max-w-[200px]">
                {props.link.replace(/^https?:\/\//, "").replace(/\/$/, "")}
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
  );
};
