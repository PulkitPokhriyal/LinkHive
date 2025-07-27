import { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { CrossIcon } from "../icons/CrossIcon";
import { useContent } from "../hooks/useContent";
import { contentAtomById } from "../store/atoms/Content";
import { useRecoilValue } from "recoil";

interface CreateContentModalprops {
  open: boolean;
  onClose: () => void;
  type: "Add Content" | "Update Content";
}

export function CreateContentModal({
  open,
  onClose,
  type,
}: CreateContentModalprops) {
  const { refresh } = useContent();
  const contentById = useRecoilValue(contentAtomById);

  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [contentType, setContentType] = useState("");
  const [tags, setTags] = useState("");

  useEffect(() => {
    if (open) {
      if (type === "Update Content" && contentById) {
        setTitle(contentById.title || "");
        setLink(contentById.link || "");
        setContentType(contentById.type?.type || "");
        setTags(contentById.tags?.map((tag) => tag.tags).join(", ") || "");
      } else if (type === "Add Content") {
        setTitle("");
        setLink("");
        setContentType("");
        setTags("");
      }
    }
  }, [open, type, contentById]);

  async function addContent(e: React.FormEvent) {
    e.preventDefault();
    const tagArray = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    if (type === "Add Content") {
      try {
        await axios.post(
          BACKEND_URL + "/api/v1/content/",
          {
            title,
            link,
            type: contentType,
            tags: tagArray,
          },
          {
            headers: {
              token: localStorage.getItem("token"),
            },
          },
        );
        await refresh();
        onClose();
      } catch (e: unknown) {
        if (axios.isAxiosError(e)) {
          alert(e);
        }
      }
    } else {
      try {
        await axios.put(
          BACKEND_URL + `/api/v1/updatecontent/${contentById._id}`,
          {
            title,
            link,
            type: contentType,
            tags: tagArray,
          },
          {
            headers: {
              token: localStorage.getItem("token"),
            },
          },
        );
        await refresh();
        onClose();
      } catch (e: unknown) {
        if (axios.isAxiosError(e)) {
          alert(e);
        }
      }
    }
  }

  return (
    <div>
      {open && (type === "Add Content" || contentById) && (
        <div className="w-screen h-screen fixed z-50 flex justify-center inset-0 items-center">
          <div className="bg-accent opacity-100 border rounded-md py-3 px-2">
            <div className="place-items-end hover:cursor-pointer">
              <CrossIcon size="lg" onClick={onClose} />
            </div>
            <div>
              <form
                className="flex flex-col items-center pb-4"
                onSubmit={addContent}
              >
                <Input
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <Input
                  placeholder="Link"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  required
                />
                <Input
                  placeholder="Type"
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  required
                />
                <Input
                  placeholder="Tags(comma-separated)"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  required
                />
                <Button
                  variant="primary"
                  size="md"
                  text={
                    type === "Add Content" ? "Add Content" : "Update Content"
                  }
                  hover="secondary"
                  type="submit"
                />
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
