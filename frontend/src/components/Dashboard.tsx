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
  const { refresh, types, fetchContentsByType, generateShareLink } =
    useContent();
  const [modalOpen, setModalOpen] = useState(false);
  const [showCopyNotification, setShowCopyNotification] = useState(false);

  useEffect(() => {
    console.log("Dashboard mounted");
    refresh();
  }, []);

  const handleCopy = async () => {
    try {
      const hash = await generateShareLink();
      const shareUrl = `${window.location.origin}/sharecontent/${hash}`;
      await navigator.clipboard.writeText(shareUrl);
      console.log(hash);
      setShowCopyNotification(true);
      setTimeout(() => {
        setShowCopyNotification(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900">
      <Sidebar
        types={types}
        onTypeClick={(typeId) => {
          console.log("Clicked Type ID:", typeId);
          fetchContentsByType(typeId);
        }}
      />

      <div className="flex-1 flex flex-col lg:ml-0">
        <div className="sticky top-0 z-10 bg-gray-900 p-4">
          <div className="flex justify-end gap-3">
            <Button
              size="md"
              variant="secondary"
              text="Add Content"
              hover="primary"
              startIcon={<PlusIcon size="md" />}
              onClick={() => setModalOpen(true)}
            />
            <div className="relative">
              <Button
                size="md"
                variant="primary"
                text="Share All"
                hover="secondary"
                startIcon={<ShareIcon size="md" />}
                onClick={() => {
                  handleCopy();
                }}
              />
              {showCopyNotification && (
                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded text-sm whitespace-nowrap shadow-lg z-50">
                  Link copied!
                </div>
              )}
            </div>
            <Logout />
          </div>
        </div>

        <div className="flex-1 p-4 bg-gray-900">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 sm:gap-6">
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
        </div>
      </div>

      <CreateContentModal
        open={modalOpen}
        type="Add Content"
        onClose={() => {
          setModalOpen(false);
        }}
      />
    </div>
  );
}

export default Dashboard;
