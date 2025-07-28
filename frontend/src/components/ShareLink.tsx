import { useState, useEffect } from "react";
import { Card } from "./ui/Card";
import { Sidebar } from "./ui/Sidebar";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import { useParams } from "react-router-dom";

function ShareableContent() {
  const { sharelink } = useParams();
  const [contents, setContents] = useState([]);
  const getSharableData = async () => {
    try {
      const response = await axios.get(
        BACKEND_URL + `/api/v1/shareablecontent/${sharelink}`,
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        },
      );
      setContents(response.data.contents);
    } catch (e) {
      console.log("Error getting data", e);
    }
  };
  useEffect(() => {
    getSharableData();
  }, []);
  return (
    <>
      <div className="flex flex-wrap pl-80 mt-4 gap-8">
        {contents.map(({ title, link, imageUrl, tags, _id }) => (
          <Card
            key={_id}
            contentId={_id}
            title={title}
            link={link}
            imageUrl={imageUrl}
            tags={tags.map((tag) => tag.tags)}
          />
        ))}
      </div>
    </>
  );
}

export default ShareableContent;
