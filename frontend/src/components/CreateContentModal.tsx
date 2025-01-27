import { useRef } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { CrossIcon } from "../icons/CrossIcon";
import { useContent } from "../hooks/useContent";
interface CreateContentModalprops {
  open: boolean;
  onClose: () => void;
}

export function CreateContentModal({ open, onClose }: CreateContentModalprops) {
  const { refresh } = useContent();
  const titleRef = useRef<HTMLInputElement | null>(null);
  const linkRef = useRef<HTMLInputElement | null>(null);
  const typeRef = useRef<HTMLInputElement | null>(null);
  const tagsRef = useRef<HTMLInputElement | null>(null);

  async function addContent(e: React.FormEvent) {
    e.preventDefault();
    const title = titleRef.current?.value;
    const link = linkRef.current?.value;
    const type = typeRef.current?.value;
    const tagString = tagsRef.current?.value || "";

    const tags = tagString
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    try {
      await axios.post(
        BACKEND_URL + "/api/v1/content",
        {
          title,
          link,
          type,
          tags,
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

  return (
    <div>
      {open && (
        <div className="w-screen h-screen fixed  top-0 flex justify-center items-center">
          <div className="bg-accent opacity-100 border rounded-md py-3 px-2">
            <div className="place-items-end hover:cursor-pointer">
              <CrossIcon size="lg" onClick={onClose} />
            </div>
            <div>
              <form
                className="flex flex-col items-center pb-4"
                onSubmit={addContent}
              >
                <Input reference={titleRef} placeholder="Title" required />
                <Input reference={linkRef} placeholder="Link" required />
                <Input reference={typeRef} placeholder="Type" required />
                <Input
                  reference={tagsRef}
                  placeholder="Tags(comma-seperated)"
                  required
                />
                <Button
                  variant="primary"
                  size="md"
                  text="Add Content"
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
