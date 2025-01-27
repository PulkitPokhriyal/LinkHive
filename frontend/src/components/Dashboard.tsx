import { useState, useEffect } from "react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { PlusIcon } from "../icons/PlusIcon";
import { ShareIcon } from "../icons/ShareIcon";
import { Logout } from "./Logout";
import { Sidebar } from "./ui/Sidebar";
import { CreateContentModal } from "./CreateContentModal";
import { useRecoilValue } from "recoil";
import { contentsAtom } from "../store/atoms/Content";
import { useContent } from "../hooks/useContent";

function Dashboard() {
  const contents = useRecoilValue(contentsAtom);
  const { refresh, types, fetchContentsByType } = useContent();
  const [modalOpen, setModalOpen] = useState(false);
  useEffect(() => {
    console.log("Dashboard mounted");
    refresh();
  }, []);
  return (
    <>
      <Sidebar
        types={types}
        onTypeClick={(typeId) => {
          console.log("Clicked Type ID:", typeId);
          fetchContentsByType(typeId);
        }}
      />
      <div>
        <CreateContentModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
          }}
        />
      </div>
      <div className="mt-2 mr-4 flex justify-end gap-3 ">
        <Button
          size="md"
          variant="secondary"
          text="Add Content"
          hover="primary"
          startIcon={<PlusIcon size="md" />}
          onClick={() => setModalOpen(true)}
        />
        <Button
          size="md"
          variant="primary"
          text="Share Brain"
          hover="secondary"
          startIcon={<ShareIcon size="md" />}
          onClick={() => alert("shared!")}
        />

        <Logout />
      </div>
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

export default Dashboard;
