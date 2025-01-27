import { DeleteIcon } from "../../icons/DeleteIcon";
import { EditIcon } from "../../icons/EditIcon";
import { useContent } from "../../hooks/useContent";
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
  const { refresh } = useContent();

  const deleteItem = async (contentId: string) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/v1/content/${contentId}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      await refresh();
    } catch (e) {
      console.error("Error deleting content", e);
    }
  };

  return (
    <div className="w-80  max-h-96 pt-2 flex flex-col gap-2 overflow-hidden hover:overflow-y-auto bg-card border border-gray-600 text-text rounded-lg shadow-primary shadow-md px-4">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-lg line-clamp-2">{props.title}</h1>
        <div className="flex gap-2">
          <DeleteIcon size="md" onClick={() => deleteItem(props.contentId)} />
          <EditIcon size="md" />
        </div>
      </div>
      <div className="border rounded-xl overflow-hidden">
        {props.imageUrl && props.imageUrl.startsWith("<iframe") ? (
          <div
            className="h-48 w-72"
            dangerouslySetInnerHTML={{ __html: props.imageUrl }}
          ></div>
        ) : (
          <a href={props.link} target="_blank">
            {" "}
            <img
              src={props.imageUrl}
              alt="Thumbnail"
              className="h-48 w-72"
            />{" "}
          </a>
        )}
      </div>{" "}
      <div className="mb-2 flex flex-wrap gap-2">
        {props.tags.map((tag, index) => (
          <span
            key={index}
            className="bg-accent/30 backdrop-blur-sm text-text text-sm px-1 py-1 rounded-md"
          >
            {`#${tag}`}
          </span>
        ))}
      </div>
    </div>
  );
};
